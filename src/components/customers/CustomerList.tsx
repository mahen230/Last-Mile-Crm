import React, { useState, useEffect } from 'react';
import { Customer } from '../../types/models';
import { customerService } from '../../services/customerService';
import { staffPermissionService } from '../../services/staffPermissionService';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { 
  Search, Filter, Plus, Download, Eye, Edit3, Target, Calendar, 
  AlertTriangle, CheckCircle2, Shield, Users, ArrowUpDown, MessageSquare,
  UserCheck, Trash2, Lock, Sparkles, X, User
} from 'lucide-react';
import CustomerProfileModal from './CustomerProfileModal';
import AddCustomerModal from './AddCustomerModal';
import DirectMessageModal from '../crm/DirectMessageModal';

export default function CustomerList({ onAddLead, onAddFollowUp }: { 
  onAddLead?: (customer: Customer) => void;
  onAddFollowUp?: (customer: Customer) => void;
}) {
  const { userProfile, user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedVerification, setSelectedVerification] = useState<string>('All');
  const [selectedBeat, setSelectedBeat] = useState<string>('All');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('All');
  const [showConflictsOnly, setShowConflictsOnly] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'masterId' | 'sector' | 'leadScore'>('masterId');
  const [sortAsc, setSortAsc] = useState(true);

  // Modals
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [messageCustomer, setMessageCustomer] = useState<Customer | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Staff Assignment Dialog
  const [assignTargetCustomer, setAssignTargetCustomer] = useState<Customer | null>(null);
  const [assignStaffEmail, setAssignStaffEmail] = useState('ektamahenmeena@gmail.com');

  useEffect(() => {
    setCustomers(customerService.getCustomers());
    const unsub = customerService.subscribe(() => {
      setCustomers([...customerService.getCustomers()]);
    });
    return () => unsub();
  }, []);

  const isAdmin = userProfile?.role === 'SUPER_ADMIN' || userProfile?.role === 'ADMIN';
  const canViewAll = userProfile?.permissions?.canViewAllRecords ?? true;
  const quotaCheck = userProfile 
    ? staffPermissionService.canUserEnterRecord(userProfile.email) 
    : { allowed: true, limit: 0, todayCount: 0 };

  const handleExportCSV = () => {
    const csvData = customerService.exportCustomersToCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MASTER_SOURCE_CUSTOMERS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteCustomer = (c: Customer) => {
    if (window.confirm(`क्या आप ग्राहक "${c.name}" (ID: ${c.masterId || c.id}) को Master Source से हटाना चाहते हैं?`)) {
      customerService.deleteCustomer(c.id);
    }
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTargetCustomer || !assignStaffEmail) return;

    customerService.assignCustomerToStaff(assignTargetCustomer.id, assignStaffEmail);
    setAssignTargetCustomer(null);
  };

  // Filter customers with RBAC Scoping & Admin Staff Filter
  const filteredCustomers = customers.filter(c => {
    // 1. RBAC Visibility Rule: If staff cannot view all records, enforce ownership & beat scope
    if (!canViewAll && userProfile) {
      const isOwner = c.enteredBy?.toLowerCase() === userProfile.email.toLowerCase();
      const isAssigned = c.assignedStaffEmail?.toLowerCase() === userProfile.email.toLowerCase();
      const cleanBeat = userProfile.beat.replace('Beat ', '');
      const isMyBeat = userProfile.beat !== 'All Beats' && c.beatNo === cleanBeat;
      const isUnassignedInBeat = !c.enteredBy && !c.assignedStaffEmail && isMyBeat;

      if (!isOwner && !isAssigned && !isUnassignedInBeat) {
        return false;
      }
    }

    // 2. Admin Staff Filter
    if (selectedStaffFilter !== 'All') {
      if (selectedStaffFilter === 'ekta') {
        const isEkta = c.enteredBy?.toLowerCase() === 'ektamahenmeena@gmail.com' || 
                       c.assignedStaffEmail?.toLowerCase() === 'ektamahenmeena@gmail.com';
        if (!isEkta) return false;
      } else if (selectedStaffFilter === 'admin') {
        const isAdminEntry = !c.enteredBy || c.enteredBy?.toLowerCase().includes('mahen');
        if (!isAdminEntry) return false;
      } else if (selectedStaffFilter === 'assigned_beat2') {
        if (c.beatNo !== '2') return false;
      }
    }

    // 3. Search query
    const s = search.toLowerCase().trim();
    const matchesSearch = !s ||
      (c.name && c.name.toLowerCase().includes(s)) ||
      (c.mobile && c.mobile.includes(s)) ||
      (c.masterId && c.masterId.toLowerCase().includes(s)) ||
      (c.houseNo && c.houseNo.toLowerCase().includes(s)) ||
      (c.sector && c.sector.toLowerCase().includes(s)) ||
      (c.area && c.area.toLowerCase().includes(s)) ||
      (c.remarks && c.remarks.toLowerCase().includes(s)) ||
      (c.address?.fullAddress && c.address.fullAddress.toLowerCase().includes(s)) ||
      (c.enteredByName && c.enteredByName.toLowerCase().includes(s)) ||
      (c.assignedStaffName && c.assignedStaffName.toLowerCase().includes(s));

    // 4. Sector & Beat filters
    const matchesSector = selectedSector === 'All' || 
      (c.sector && c.sector.includes(selectedSector)) || 
      (c.area && c.area.includes(selectedSector)) ||
      (c.address?.sectorLocality && c.address.sectorLocality.includes(selectedSector));

    const matchesBeat = selectedBeat === 'All' || c.beatNo === selectedBeat;
    const matchesVerification = selectedVerification === 'All' || c.verificationStatus === selectedVerification;
    const matchesConflict = !showConflictsOnly || c.hasConflict;

    return matchesSearch && matchesSector && matchesBeat && matchesVerification && matchesConflict;
  });

  // Sort
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: 'name' | 'masterId' | 'sector' | 'leadScore') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-5" id="master-customer-directory">
      
      {/* Active User Status & Quota Banner */}
      {userProfile && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
              isAdmin ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{userProfile.name}</span>
                <span className="text-slate-400">({userProfile.email})</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {userProfile.role} • {userProfile.beat}
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {canViewAll 
                  ? '👑 Admin Mode: Viewing all SO master records across all beats'
                  : '🔒 Field Staff Mode: Viewing only records entered by you or assigned in your beat'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="text-right">
              <div className="text-[11px] font-semibold text-slate-600">
                Today's Entries (दैनिक कोटा):
              </div>
              <div className="text-xs font-bold text-slate-900">
                {quotaCheck.todayCount} / {quotaCheck.limit === 0 ? 'Unlimited' : quotaCheck.limit}
              </div>
            </div>

            {quotaCheck.limit > 0 && (
              <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    quotaCheck.todayCount >= quotaCheck.limit ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (quotaCheck.todayCount / quotaCheck.limit) * 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={22} className="text-red-700" />
            <span>Master Source Customer Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Single Source of Truth ({filteredCustomers.length} Records Visible • Dadabari SO 324009)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setMessageCustomer(null);
              setShowMessageModal(true);
            }}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-emerald-200"
            id="open-direct-message-hub-btn"
            title="Compose WhatsApp / SMS message to customer"
          >
            <MessageSquare size={15} className="text-emerald-700" />
            <span>Send Message / Chat</span>
          </button>

          {(!userProfile || userProfile.permissions.canExportData) && (
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-300"
              id="export-customers-csv-btn"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={() => {
              if (quotaCheck.limit > 0 && quotaCheck.todayCount >= quotaCheck.limit) {
                alert(`दैनिक सीमा पूर्ण (Daily Limit Reached): आप आज के लिए निर्धारित ${quotaCheck.limit} प्रविष्टियां पूरी कर चुके हैं।`);
                return;
              }
              setCustomerToEdit(null);
              setShowAddModal(true);
            }}
            disabled={quotaCheck.limit > 0 && quotaCheck.todayCount >= quotaCheck.limit}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs ${
              quotaCheck.limit > 0 && quotaCheck.todayCount >= quotaCheck.limit
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-red-700 hover:bg-red-800 text-white'
            }`}
            id="add-customer-main-btn"
          >
            <Plus size={16} />
            <span>Add Verified Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Visible Master Customers</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{filteredCustomers.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Field Confirmed</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {filteredCustomers.filter(c => c.verificationStatus === 'Field Confirmed' || c.verificationStatus === 'Document Confirmed').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Active Scheme Inquiries</div>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {filteredCustomers.filter(c => c.products && c.products.length > 0).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Assigned / My Entries</div>
          <div className="text-2xl font-black text-purple-700 mt-1">
            {filteredCustomers.filter(c => c.enteredBy || c.assignedStaffEmail).length}
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name, Mobile, House Number, Sector (e.g. 6, 7), Staff Name, Master ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600 font-medium"
            id="customer-search-input"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Sector Filter */}
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Filter size={13} /> Area/Sector:
          </span>
          {['All', '6', '7', '4', '2', 'Santoshi Nagar', 'Patel Nagar'].map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                selectedSector === sec
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sec === 'All' ? 'All Areas' : sec.length === 1 ? `Sector ${sec}` : sec}
            </button>
          ))}

          {/* Beat Filter */}
          <span className="text-slate-500 font-semibold ml-2">Beat:</span>
          {['All', '1', '2', '6'].map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBeat(b)}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                selectedBeat === b
                  ? 'bg-red-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {b === 'All' ? 'All Beats' : `Beat ${b}`}
            </button>
          ))}

          {/* Admin Staff Filter Dropdown */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-slate-500 font-semibold">Staff Filter:</span>
              <select
                value={selectedStaffFilter}
                onChange={(e) => setSelectedStaffFilter(e.target.value)}
                className="p-1 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 font-semibold text-xs focus:ring-2 focus:ring-red-600"
              >
                <option value="All">All Staff Entries</option>
                <option value="ekta">Ekta Meena (ektamahenmeena@gmail.com)</option>
                <option value="assigned_beat2">Beat 2 Assigned Records</option>
                <option value="admin">Admin / System Created</option>
              </select>
            </div>
          )}

          <button
            onClick={() => setShowConflictsOnly(!showConflictsOnly)}
            className={`px-2.5 py-1 rounded-lg font-semibold ml-auto transition flex items-center gap-1 ${
              showConflictsOnly 
                ? 'bg-amber-600 text-white' 
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            }`}
          >
            <AlertTriangle size={13} />
            <span>{showConflictsOnly ? 'Conflicts Only' : 'Filter Conflicts'}</span>
          </button>
        </div>
      </div>

      {/* Customer Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="text-[11px] text-slate-600 uppercase bg-slate-100/80 border-b border-slate-200 tracking-wider font-bold">
              <tr>
                <th onClick={() => toggleSort('masterId')} className="px-4 py-3 cursor-pointer hover:text-slate-900">
                  <div className="flex items-center gap-1 font-bold">
                    <span>Master ID</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => toggleSort('name')} className="px-4 py-3 cursor-pointer hover:text-slate-900">
                  <div className="flex items-center gap-1 font-bold">
                    <span>Customer Name</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-4 py-3 font-bold">Mobile & WhatsApp</th>
                <th onClick={() => toggleSort('sector')} className="px-4 py-3 cursor-pointer hover:text-slate-900">
                  <div className="flex items-center gap-1 font-bold">
                    <span>House / Sector</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-4 py-3 font-bold">Beat</th>
                <th className="px-4 py-3 font-bold">Staff Ownership</th>
                <th className="px-4 py-3 font-bold">Verification</th>
                <th className="px-4 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedCustomers.length > 0 ? (
                sortedCustomers.map((cust, custIdx) => (
                  <tr key={cust.id ? `cust-${cust.id}-${custIdx}` : cust.masterId ? `cust-m-${cust.masterId}-${custIdx}` : `cust-row-${custIdx}`} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {cust.masterId || cust.id}
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span 
                          onClick={() => setSelectedCustomer(cust)}
                          className="hover:text-red-700 hover:underline cursor-pointer font-bold"
                        >
                          {cust.name}
                        </span>
                        {cust.hasConflict && (
                          <AlertTriangle size={14} className="text-amber-600 shrink-0" title="Data conflict or shared phone" />
                        )}
                      </div>
                      {cust.fatherHusbandName && (
                        <div className="text-[11px] text-slate-400 font-normal">S/o {cust.fatherHusbandName}</div>
                      )}
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-800">
                      <div>{cust.mobile || '—'}</div>
                      {cust.whatsapp && cust.whatsapp !== cust.mobile && (
                        <div className="text-[10px] text-emerald-600">WA: {cust.whatsapp}</div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {cust.houseNo || cust.address?.houseNumber || 'Plot/House'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {cust.sector ? `Sector ${cust.sector}` : cust.area || 'Keshavpura'}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                        Beat {cust.beatNo || '2'}
                      </span>
                    </td>

                    {/* Staff Ownership Column */}
                    <td className="px-4 py-3">
                      {cust.enteredByName || cust.assignedStaffName || cust.enteredBy ? (
                        <div>
                          <div className="font-semibold text-slate-900 text-[11px]">
                            {cust.enteredByName || cust.assignedStaffName || cust.enteredBy?.split('@')[0]}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                            {cust.enteredBy || cust.assignedStaffEmail || 'Assigned'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Dadabari SO</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cust.verificationStatus === 'Field Confirmed' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : cust.verificationStatus === 'Document Confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {cust.verificationStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Send Message */}
                        <button
                          onClick={() => {
                            setMessageCustomer(cust);
                            setShowMessageModal(true);
                          }}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                          title="Send Message / Chat (WhatsApp & SMS)"
                          id={`cust-${cust.id || cust.masterId || custIdx}-msg-btn`}
                        >
                          <MessageSquare size={14} />
                        </button>

                        {/* Assign Staff (Admin Only) */}
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setAssignTargetCustomer(cust);
                              setAssignStaffEmail(cust.assignedStaffEmail || 'ektamahenmeena@gmail.com');
                            }}
                            className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition"
                            title="Assign to Staff Member (कर्मचारी असाइन करें)"
                          >
                            <UserCheck size={14} />
                          </button>
                        )}

                        {/* View 360 */}
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          title="View 360 Profile"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Edit Record */}
                        <button
                          onClick={() => {
                            setCustomerToEdit(cust);
                            setShowAddModal(true);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          title="Edit Record"
                        >
                          <Edit3 size={14} />
                        </button>

                        {/* Delete (Admin Only) */}
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteCustomer(cust)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                            title="Delete Customer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}

                        {onAddLead && (
                          <button
                            onClick={() => onAddLead(cust)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
                            title="Create Lead"
                          >
                            <Target size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No customers match your search criteria. Try modifying your filters or add a new record.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Assignment Modal */}
      {assignTargetCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <UserCheck size={18} className="text-purple-700" />
                <span>कर्मचारी को रिकॉर्ड असाइन करें (Assign Staff)</span>
              </h3>
              <button 
                onClick={() => setAssignTargetCustomer(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4 mt-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500">Customer:</div>
                <div className="font-bold text-slate-900 text-sm">{assignTargetCustomer.name}</div>
                <div className="text-slate-600 font-mono text-[11px] mt-0.5">
                  ID: {assignTargetCustomer.masterId || assignTargetCustomer.id} • Beat {assignTargetCustomer.beatNo || '2'}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Staff Member to Assign *
                </label>
                <select
                  value={assignStaffEmail}
                  onChange={(e) => setAssignStaffEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-600"
                >
                  <option value="ektamahenmeena@gmail.com">
                    Ekta Meena (ektamahenmeena@gmail.com) • Beat 2
                  </option>
                  <option value="mahen.comtech@gmail.com">
                    Mahendra Meena (mahen.comtech@gmail.com) • Admin
                  </option>
                  <option value="muskan.sharma@indiapost.gov.in">
                    Muskan Sharma • Beat 6
                  </option>
                  <option value="govind.prasad@indiapost.gov.in">
                    Govind Prasad • Beat 1
                  </option>
                  <option value="viewer@indiapost.gov.in">
                    Field Observer (viewer@indiapost.gov.in)
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAssignTargetCustomer(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs"
                >
                  असाइन करें (Assign Record)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onEdit={(c) => {
            setSelectedCustomer(null);
            setCustomerToEdit(c);
            setShowAddModal(true);
          }}
          onAddLead={onAddLead}
          onAddFollowUp={onAddFollowUp}
        />
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <AddCustomerModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          customerToEdit={customerToEdit}
          onSaved={(saved) => {
            setCustomers([...customerService.getCustomers()]);
          }}
          onLinkToExisting={(c) => {
            setCustomerToEdit(c);
          }}
        />
      )}

      {/* Direct Messaging & WhatsApp Modal */}
      {showMessageModal && (
        <DirectMessageModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setMessageCustomer(null);
          }}
          initialCustomer={messageCustomer}
        />
      )}
    </div>
  );
}
