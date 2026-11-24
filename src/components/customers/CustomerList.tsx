import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Customer } from '../../types/models';
import { customerService } from '../../services/customerService';
import { staffPermissionService } from '../../services/staffPermissionService';
import { featureVisibilityService } from '../../services/featureVisibilityService';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { 
  Search, Filter, Plus, Download, Upload, Eye, Edit3, Target, Calendar, 
  AlertTriangle, CheckCircle2, Shield, Users, ArrowUpDown, MessageSquare,
  UserCheck, Trash2, Lock, Sparkles, X, User, MapPin, Layers, LayoutGrid, List, Phone
} from 'lucide-react';
import CustomerProfileModal from './CustomerProfileModal';
import AddCustomerModal from './AddCustomerModal';
import DirectMessageModal from '../crm/DirectMessageModal';
import { 
  OFFICIAL_MAJOR_COLONIES,
  getHierarchyColoniesList,
  getHierarchySectorsForColony,
  matchCustomerToColonyAndSector
} from '../../data/colonyHierarchyData';

export default function CustomerList({ onAddLead, onAddFollowUp }: { 
  onAddLead?: (customer: Customer) => void;
  onAddFollowUp?: (customer: Customer) => void;
}) {
  const { userProfile, user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'warning'; message: string } | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  const [selectedColony, setSelectedColony] = useState<string>('All');
  const [selectedSubSector, setSelectedSubSector] = useState<string>('All');
  const [selectedVerification, setSelectedVerification] = useState<string>('All');
  const [selectedBeat, setSelectedBeat] = useState<string>('All');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('All');
  const [selectedResidency, setSelectedResidency] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [showConflictsOnly, setShowConflictsOnly] = useState(false);
  const [sortField, setSortField] = useState<'colony' | 'latest' | 'name' | 'masterId' | 'sector' | 'leadScore'>('colony');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Modals
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [messageCustomer, setMessageCustomer] = useState<Customer | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Staff Assignment Dialog
  const [assignTargetCustomer, setAssignTargetCustomer] = useState<Customer | null>(null);
  const [assignStaffEmail, setAssignStaffEmail] = useState('ektamahenmeena@gmail.com');

  const [visibilityTick, setVisibilityTick] = useState(0);

  useEffect(() => {
    setCustomers(customerService.getCustomers());
    const unsub = customerService.subscribe(() => {
      setCustomers([...customerService.getCustomers()]);
    });
    const unsubVis = featureVisibilityService.subscribe(() => {
      setVisibilityTick((t) => t + 1);
    });
    return () => {
      unsub();
      unsubVis();
    };
  }, []);

  const canAccessLeadsAndFollowUps = React.useMemo(
    () => featureVisibilityService.isFeatureVisible(userProfile, 'leadsAndSchemes'),
    [userProfile, visibilityTick]
  );

  const isAdmin = staffPermissionService.isSuperAdmin(userProfile) || userProfile?.role === 'ADMIN';
  const isRestrictedFieldStaff = staffPermissionService.isPostmanOrGds(userProfile);
  const scopedBeatsSet = React.useMemo(
    () => staffPermissionService.getScopedBeatsSet(userProfile),
    [userProfile]
  );
  const allAssignableStaff = React.useMemo(
    () => staffPermissionService.getAllStaffProfiles(),
    [customers]
  );
  const canViewAll = userProfile?.permissions?.canViewAllRecords ?? false;
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

  const showNotification = (message: string, type: 'success' | 'warning' = 'success') => {
    setStatusBanner({ type, message });
    setTimeout(() => {
      setStatusBanner(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const handleBulkCsvTextImport = (rawCsv: string) => {
    const lines = rawCsv
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      showNotification('CSV must include a header row and at least 1 customer data row.', 'warning');
      return;
    }
    const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim().toLowerCase());
    const idxOf = (keys: string[]) => headers.findIndex((h) => keys.some((k) => h.includes(k)));

    const nameIdx = idxOf(['name', 'customer']);
    const mobileIdx = idxOf(['mobile', 'phone', 'contact']);
    const colonyIdx = idxOf(['colony', 'area', 'locality']);
    const sectorIdx = idxOf(['sector', 'block']);
    const houseIdx = idxOf(['house', 'plot']);
    const beatIdx = idxOf(['beat']);
    const livingIdx = idxOf(['living', 'residency', 'status', 'type']);

    if (nameIdx === -1) {
      showNotification('CSV header must contain a "Name" column.', 'warning');
      return;
    }

    let importedCount = 0;
    lines.slice(1).forEach((line) => {
      const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
      const name = cols[nameIdx];
      if (!name || name.length < 2) return;
      const mobile = mobileIdx !== -1 ? (cols[mobileIdx] || '').replace(/\D/g, '').slice(-10) : '';
      const area = colonyIdx !== -1 ? cols[colonyIdx] || 'Dadabari' : 'Dadabari';
      const sector = sectorIdx !== -1 ? cols[sectorIdx] || 'Sector 1' : 'Sector 1';
      const houseNo = houseIdx !== -1 ? cols[houseIdx] || '' : '';
      const rawBeat = beatIdx !== -1 ? (cols[beatIdx] || '').replace(/\D/g, '') : '';
      const beatNo = rawBeat || (userProfile?.beat || 'Beat 2').replace(/\D/g, '') || '2';
      const livingRaw = livingIdx !== -1 ? cols[livingIdx] || 'Owner' : 'Owner';

      customerService.addOrUpdateCustomer(
        {
          name,
          mobile,
          area,
          colony: area,
          sector,
          houseNo,
          beatNo,
          pincode: '324009',
          livingStatus: livingRaw as any,
          verificationStatus: 'Pending Verification',
          enteredBy: userProfile?.email || 'ektamahenmeena@gmail.com',
          enteredByName: userProfile?.name || 'Postal Staff',
        },
        'CSV Bulk Import'
      );
      importedCount += 1;
    });

    setShowImportModal(false);
    setImportCsvText('');
    showNotification(
      `Successfully imported / updated ${importedCount} customer record(s) from CSV into Master Directory.`,
      importedCount > 0 ? 'success' : 'warning'
    );
  };

  const handleDeleteCustomer = (c: Customer) => {
    setCustomerToDelete(c);
  };

  const confirmDeleteCustomer = () => {
    if (!customerToDelete) return;
    customerService.deleteCustomer(customerToDelete.id);
    showNotification(`Customer "${customerToDelete.name}" (${customerToDelete.masterId || customerToDelete.id}) removed from directory.`, 'warning');
    setCustomerToDelete(null);
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTargetCustomer || !assignStaffEmail) return;

    customerService.assignCustomerToStaff(assignTargetCustomer.id, assignStaffEmail);
    showNotification(`Assigned "${assignTargetCustomer.name}" to ${assignStaffEmail}.`, 'success');
    setAssignTargetCustomer(null);
  };

  const scopedCustomersForUser = React.useMemo(() => {
    return customers.filter((c) => staffPermissionService.matchesUserBeatScope(userProfile, c));
  }, [customers, userProfile]);

  // Hierarchical Colony List & Nested Sub-Sector Chips (Strictly scoped for Postman/GDS)
  const availableColonies = React.useMemo(() => {
    const fromCustomers = scopedCustomersForUser
      .map(c => c.area || c.address?.area || c.sectorLocality || '')
      .filter(Boolean);
    if (isRestrictedFieldStaff && userProfile) {
      const assignedCols = [
        ...(userProfile.assignedColonies || []),
        ...(userProfile.permissions?.allowedColonies || []),
      ].filter(c => c && c.toLowerCase() !== 'all colonies');
      return Array.from(new Set([...assignedCols, ...fromCustomers])).sort();
    }
    return getHierarchyColoniesList(fromCustomers);
  }, [scopedCustomersForUser, isRestrictedFieldStaff, userProfile]);

  const customerColonySubSectorChips = React.useMemo(() => {
    if (selectedColony === 'All') return [];
    const fromCustomers = scopedCustomersForUser
      .filter(c => matchCustomerToColonyAndSector(c, selectedColony, 'All'))
      .map(c => c.sector || '')
      .filter(Boolean);
    return getHierarchySectorsForColony(selectedColony, fromCustomers);
  }, [selectedColony, scopedCustomersForUser]);

  const handleColonyChange = (colony: string) => {
    setSelectedColony(colony);
    setSelectedSubSector('All');
    setCurrentPage(1);
  };

  // Filter customers with strict Beat-Level RBAC Scoping & Admin Staff Filter
  const filteredCustomers = customers.filter(c => {
    // 1. Strict Beat-Level Data Visibility Restriction: Non-admin staff only see their assigned Beat records
    if (!staffPermissionService.matchesUserBeatScope(userProfile, c)) {
      return false;
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

    // 4. Hierarchical Colony & Sub-Sector filter
    const matchesColonyAndSector = matchCustomerToColonyAndSector(c, selectedColony, selectedSubSector);

    const matchesBeat = selectedBeat === 'All' || String(c.beatNo || '').replace(/\D/g, '') === selectedBeat.replace(/\D/g, '');
    const matchesVerification = selectedVerification === 'All' || c.verificationStatus === selectedVerification;
    const matchesConflict = !showConflictsOnly || c.hasConflict;

    let matchesResidency = true;
    if (selectedResidency !== 'All') {
      const liv = (c.livingStatus || '').toLowerCase();
      const cat = (c.category || '').toLowerCase();
      const typ = (c.type || '').toLowerCase();
      const occ = (c.occupation || '').toLowerCase();
      if (selectedResidency === 'Owner') matchesResidency = liv === 'owner';
      else if (selectedResidency === 'Tenant') matchesResidency = liv === 'tenant';
      else if (selectedResidency === 'Commercial') matchesResidency = typ.includes('comm') || occ.includes('shop') || occ.includes('business');
      else if (selectedResidency === 'Senior Citizen') matchesResidency = (c.age || 0) >= 60 || cat.includes('senior') || occ.includes('retir') || occ.includes('pension');
      else if (selectedResidency === 'Unmapped') matchesResidency = c.propertyMappingStatus === 'Unmapped / Pending Re-assignment' || !c.houseNo;
    }

    return matchesSearch && matchesColonyAndSector && matchesBeat && matchesVerification && matchesConflict && matchesResidency;
  });

  // Sort (Default 'colony' sorts Colony Name ascending A to Z, then House/Plot Number ascending)
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortField === 'colony' || sortField === 'sector') {
      const colA = (a.area || a.sectorLocality || a.address?.area || a.sector || '').trim();
      const colB = (b.area || b.sectorLocality || b.address?.area || b.sector || '').trim();
      const cmp = colA.localeCompare(colB, undefined, { numeric: true, sensitivity: 'base' });
      if (cmp !== 0) return sortAsc ? cmp : -cmp;
      const hA = (a.houseNo || a.address?.houseNumber || '').trim();
      const hB = (b.houseNo || b.address?.houseNumber || '').trim();
      return sortAsc
        ? hA.localeCompare(hB, undefined, { numeric: true, sensitivity: 'base' })
        : hB.localeCompare(hA, undefined, { numeric: true, sensitivity: 'base' });
    }
    if (sortField === 'latest') {
      return 0;
    }
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedCustomers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCustomers = sortedCustomers.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (field: 'colony' | 'name' | 'masterId' | 'sector' | 'leadScore') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-5" id="master-customer-directory">
      {statusBanner && (
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-xs ${
          statusBanner.type === 'warning'
            ? 'bg-amber-50 border-amber-300 text-amber-900'
            : 'bg-emerald-50 border-emerald-300 text-emerald-900'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className={statusBanner.type === 'warning' ? 'text-amber-700' : 'text-emerald-700'} />
            <span>{statusBanner.message}</span>
          </div>
          <button onClick={() => setStatusBanner(null)} className="text-slate-500 hover:text-slate-800">
            <X size={14} />
          </button>
        </div>
      )}
      
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
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'cards' ? 'bg-indigo-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List size={14} />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={() => {
              setMessageCustomer(null);
              setShowMessageModal(true);
            }}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-emerald-200 cursor-pointer"
            id="open-direct-message-hub-btn"
            title="Compose WhatsApp / SMS message to customer"
          >
            <MessageSquare size={15} className="text-emerald-700" />
            <span>Message</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-indigo-200 cursor-pointer"
            id="import-customers-csv-btn"
          >
            <Upload size={15} />
            <span>Import CSV</span>
          </button>

          {(!userProfile || userProfile.permissions.canExportData) && (
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-300 cursor-pointer"
              id="export-customers-csv-btn"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={() => {
              if (quotaCheck.limit > 0 && quotaCheck.todayCount >= quotaCheck.limit) {
                showNotification(`दैनिक सीमा पूर्ण (Daily Limit Reached): आप आज के लिए निर्धारित ${quotaCheck.limit} प्रविष्टियां पूरी कर चुके हैं।`, 'warning');
                return;
              }
              setCustomerToEdit(null);
              setShowAddModal(true);
            }}
            disabled={quotaCheck.limit > 0 && quotaCheck.todayCount >= quotaCheck.limit}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer ${
              quotaCheck.limit > 0 && quotaCheck.todayCount >= quotaCheck.limit
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-red-700 hover:bg-red-800 text-white'
            }`}
            id="add-customer-main-btn"
          >
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar — Color-Coded High-Contrast Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-4 rounded-2xl shadow-sm">
          <div className="text-[11px] text-indigo-100 font-bold uppercase tracking-wider">Visible Master Customers</div>
          <div className="text-2xl font-black font-mono tabular-nums mt-1">{filteredCustomers.length}</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-sm">
          <div className="text-[11px] text-emerald-100 font-bold uppercase tracking-wider">Field Confirmed</div>
          <div className="text-2xl font-black font-mono tabular-nums mt-1">
            {filteredCustomers.filter(c => c.verificationStatus === 'Field Confirmed' || c.verificationStatus === 'Document Confirmed' || c.verificationStatus === 'Verified').length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-sky-600 to-blue-700 text-white p-4 rounded-2xl shadow-sm">
          <div className="text-[11px] text-sky-100 font-bold uppercase tracking-wider">Active Scheme Inquiries</div>
          <div className="text-2xl font-black font-mono tabular-nums mt-1">
            {filteredCustomers.filter(c => c.products && c.products.length > 0).length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-4 rounded-2xl shadow-sm">
          <div className="text-[11px] text-amber-50 font-bold uppercase tracking-wider">Assigned / My Entries</div>
          <div className="text-2xl font-black font-mono tabular-nums mt-1">
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

        {/* Colony-First Primary Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
          {/* Colony-First Primary Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 font-bold flex items-center gap-1">
              <MapPin size={13} className="text-red-600" /> Colony:
            </span>
            <select
              value={selectedColony}
              onChange={(e) => handleColonyChange(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold text-xs focus:ring-2 focus:ring-red-600 shadow-xs cursor-pointer"
              id="customer-colony-filter-select"
            >
              {isRestrictedFieldStaff ? (
                <>
                  <option value="All">My Assigned Colonies ({userProfile?.beat || 'Beat'})</option>
                  {availableColonies.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </>
              ) : (
                <>
                  <option value="All">All Major Colonies (Dadabari S.O. 324009)</option>
                  <optgroup label="Official Major Colonies (Pincode 324009 / Beats 1-33)">
                    {OFFICIAL_MAJOR_COLONIES.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </optgroup>
                  {availableColonies.filter(c => !OFFICIAL_MAJOR_COLONIES.includes(c as any)).length > 0 && (
                    <optgroup label="Additional Registered Areas">
                      {availableColonies
                        .filter(c => !OFFICIAL_MAJOR_COLONIES.includes(c as any))
                        .map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </>
              )}
            </select>
          </div>

          {/* Quick Colony Pill Shortcuts */}
          <div className="hidden sm:flex items-center gap-1">
            {(isRestrictedFieldStaff
              ? availableColonies.slice(0, 5)
              : ['Keshavpura', 'Basant Vihar', 'Dadabari', 'Santoshi Nagar', 'Mahaveer Nagar']
            ).map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => handleColonyChange(selectedColony === col ? 'All' : col)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                  selectedColony === col
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {col}
              </button>
            ))}
          </div>

          {/* Beat Filter */}
          <div className="flex items-center gap-1.5 sm:ml-1">
            <span className="text-slate-500 font-semibold">Beat:</span>
            <select
              value={selectedBeat}
              onChange={(e) => {
                setSelectedBeat(e.target.value);
                setCurrentPage(1);
              }}
              disabled={isRestrictedFieldStaff && (scopedBeatsSet?.size || 0) <= 1}
              className="py-1.5 px-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 font-bold text-xs focus:ring-2 focus:ring-red-600 disabled:opacity-75"
            >
              {isRestrictedFieldStaff ? (
                <>
                  <option value="All">My Assigned Beat ({userProfile?.beat || 'Scoped'})</option>
                  {(scopedBeatsSet ? Array.from<string>(scopedBeatsSet) : []).map((b) => (
                    <option key={b} value={b.toUpperCase()}>Beat {b.toUpperCase()}</option>
                  ))}
                </>
              ) : (
                <>
                  <option value="All">All Beats (1-34)</option>
                  {Array.from({ length: 34 }, (_, i) => String(i + 1)).map((b) => (
                    <option key={b} value={b}>Beat {b}</option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Residency Tag Filter */}
          <div className="flex items-center gap-1.5 sm:ml-1">
            <span className="text-slate-500 font-semibold">Residency:</span>
            <select
              value={selectedResidency}
              onChange={(e) => {
                setSelectedResidency(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1.5 px-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-900 font-bold text-xs focus:ring-2 focus:ring-indigo-600"
            >
              <option value="All">All Residency Tags</option>
              <option value="Owner">Owner</option>
              <option value="Tenant">Tenant</option>
              <option value="Commercial">Commercial / Shop</option>
              <option value="Senior Citizen">Senior Citizen (60+)</option>
              <option value="Unmapped">Unmapped House No</option>
            </select>
          </div>

          {/* Admin Staff Filter Dropdown */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 sm:ml-1">
              <span className="text-slate-500 font-semibold">Staff:</span>
              <select
                value={selectedStaffFilter}
                onChange={(e) => {
                  setSelectedStaffFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-1.5 px-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 font-semibold text-xs focus:ring-2 focus:ring-red-600"
              >
                <option value="All">All Staff Entries</option>
                <option value="ekta">Ekta Meena (ektamahenmeena@gmail.com)</option>
                <option value="assigned_beat2">Beat 2 Assigned Records</option>
                <option value="admin">Admin / System Created</option>
              </select>
            </div>
          )}

          <button
            onClick={() => {
              setShowConflictsOnly(!showConflictsOnly);
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1.5 rounded-xl font-semibold ml-auto transition flex items-center gap-1 text-xs ${
              showConflictsOnly 
                ? 'bg-amber-600 text-white' 
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            }`}
          >
            <AlertTriangle size={13} />
            <span>{showConflictsOnly ? 'Conflicts Only' : 'Filter Conflicts'}</span>
          </button>
        </div>

        {/* Dynamic Nested Sector / Block Quick-Filter Bar */}
        {selectedColony !== 'All' && (
          <div className="p-3 bg-red-50/70 rounded-xl border border-red-200 flex flex-wrap items-center gap-2 animate-fadeIn text-xs">
            <div className="flex items-center gap-1.5 text-red-900 font-black shrink-0">
              <Layers size={14} className="text-red-700" />
              <span>{selectedColony} Sub-Sectors / Blocks:</span>
            </div>
            <button
              onClick={() => {
                setSelectedSubSector('All');
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-xs ${
                selectedSubSector === 'All'
                  ? 'bg-red-700 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All {selectedColony} ({scopedCustomersForUser.filter(c => matchCustomerToColonyAndSector(c, selectedColony, 'All')).length})
            </button>
            {customerColonySubSectorChips.map((sec) => {
              const count = scopedCustomersForUser.filter(c => matchCustomerToColonyAndSector(c, selectedColony, sec)).length;
              return (
                <button
                  key={sec}
                  onClick={() => {
                    setSelectedSubSector(sec);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5 ${
                    selectedSubSector === sec
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{sec}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedSubSector === sec ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Colorful Card Grid View vs Master Table View */}
      {viewMode === 'cards' ? (
        <div className="space-y-4">
          {paginatedCustomers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-slate-500 text-xs">
              No customers match your search criteria. Try modifying your Colony, Beat (1–34), or Residency filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedCustomers.map((cust, custIdx) => {
                const isVerified =
                  cust.verificationStatus === 'Field Confirmed' ||
                  cust.verificationStatus === 'Verified' ||
                  cust.verificationStatus === 'Document Confirmed';
                const cardTopGradient = isVerified
                  ? 'from-emerald-600 to-teal-700'
                  : cust.hasConflict
                  ? 'from-rose-600 to-red-700'
                  : 'from-amber-500 to-orange-600';
                const borderAccent = isVerified
                  ? 'border-emerald-200 hover:border-emerald-400'
                  : cust.hasConflict
                  ? 'border-rose-200 hover:border-rose-400'
                  : 'border-amber-200 hover:border-amber-400';

                return (
                  <article
                    key={cust.id ? `card-${cust.id}-${custIdx}` : `card-row-${custIdx}`}
                    className={`bg-white rounded-3xl border-2 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition flex flex-col justify-between ${borderAccent}`}
                  >
                    <div>
                      <div className={`bg-gradient-to-r ${cardTopGradient} px-4 py-3 text-white flex items-center justify-between gap-2`}>
                        <span className="font-mono font-black text-[11px] tracking-wide bg-black/25 px-2 py-0.5 rounded-md">
                          {cust.masterId || cust.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-bold">
                            Beat {cust.beatNo || '2'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white text-slate-900 text-[10px] font-black">
                            {cust.livingStatus || 'Resident'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-2.5 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3
                              onClick={() => setSelectedCustomer(cust)}
                              className="font-black text-base text-slate-900 hover:text-red-700 cursor-pointer leading-snug"
                            >
                              {cust.name}
                            </h3>
                            {cust.fatherHusbandName && (
                              <div className="text-[11px] text-slate-500">S/o {cust.fatherHusbandName}</div>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                            isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {cust.verificationStatus}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                            <MapPin size={13} className="text-red-600 shrink-0" />
                            <span className="truncate">
                              {cust.houseNo || cust.address?.houseNumber || 'House/Plot'} · {cust.sector || 'Sector'} · {cust.area || 'Dadabari'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 pt-1 border-t border-slate-200/70">
                            <span>Mob: <strong>{cust.mobile || '—'}</strong></span>
                            <span>PIN: <strong>{cust.pincode || '324009'}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1">
                        {cust.mobile && (
                          <a
                            href={`tel:${cust.mobile}`}
                            className="p-1.5 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-lg transition"
                            title="Call Customer"
                          >
                            <Phone size={13} />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setMessageCustomer(cust);
                            setShowMessageModal(true);
                          }}
                          className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition cursor-pointer"
                          title="Send WhatsApp / SMS"
                        >
                          <MessageSquare size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(cust)}
                          className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition cursor-pointer"
                          title="View 360 Profile"
                        >
                          <Eye size={13} />
                        </button>
                        {customerService.canEditRecord(cust, userProfile) && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomerToEdit(cust);
                              setShowAddModal(true);
                            }}
                            className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg transition cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit3 size={13} />
                          </button>
                        )}
                      </div>

                      {canAccessLeadsAndFollowUps && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (onAddLead) onAddLead(cust);
                              else navigate('/leads', { state: { initialCustomer: cust } });
                            }}
                            className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Target size={12} />
                            <span>Lead</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (onAddFollowUp) onAddFollowUp(cust);
                              else navigate('/followups', { state: { initialCustomer: cust } });
                            }}
                            className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Calendar size={12} />
                            <span>Visit</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Shared Pagination Footer for Card Grid */}
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-slate-600 font-medium">
              Showing <span className="font-bold text-slate-900">{sortedCustomers.length === 0 ? 0 : (safePage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-slate-900">{Math.min(safePage * pageSize, sortedCustomers.length)}</span> of{' '}
              <span className="font-bold text-slate-900">{sortedCustomers.length}</span> customers
            </div>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700"
              >
                <option value={6}>6 / page</option>
                <option value={12}>12 / page</option>
                <option value={24}>24 / page</option>
                <option value={500}>Show All ({sortedCustomers.length})</option>
              </select>
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
              >
                Prev
              </button>
              <span className="font-bold text-slate-800 px-2">Page {safePage} / {totalPages}</span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
      /* Customer Master Table */
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
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((cust, custIdx) => (
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
                        {cust.propertyMappingStatus === 'Unmapped / Pending Re-assignment' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black">
                            Unmapped / Pending Re-assignment
                          </span>
                        ) : (
                          cust.houseNo || cust.address?.houseNumber || 'Plot/House'
                        )}
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
                      {cust.addressExceptionId && (
                        <span className="block mt-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-200 text-amber-950 border border-amber-300">
                          ⚠️ Address Exception
                        </span>
                      )}
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
                        {customerService.canEditRecord(cust, userProfile) ? (
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
                        ) : (
                          <button
                            disabled
                            className="p-1.5 bg-slate-100/50 text-slate-300 rounded-lg cursor-not-allowed"
                            title="Locked: Field staff can edit only records created by them"
                          >
                            <Lock size={14} />
                          </button>
                        )}

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

                        {canAccessLeadsAndFollowUps && (
                          <>
                            <button
                              onClick={() => {
                                if (onAddLead) {
                                  onAddLead(cust);
                                } else {
                                  navigate('/leads', { state: { initialCustomer: cust } });
                                }
                              }}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition cursor-pointer"
                              title="Create Lead"
                            >
                              <Target size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (onAddFollowUp) {
                                  onAddFollowUp(cust);
                                } else {
                                  navigate('/followups', { state: { initialCustomer: cust } });
                                }
                              }}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition cursor-pointer"
                              title="Schedule Follow-up"
                            >
                              <Calendar size={14} />
                            </button>
                          </>
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

        {/* Fast Pagination Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-600 font-medium">
            Showing{' '}
            <span className="font-bold text-slate-900">
              {sortedCustomers.length === 0 ? 0 : (safePage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-slate-900">
              {Math.min(safePage * pageSize, sortedCustomers.length)}
            </span>{' '}
            of <span className="font-bold text-slate-900">{sortedCustomers.length}</span> customers
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={500}>Show All ({sortedCustomers.length})</option>
            </select>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
            >
              Prev
            </button>
            <span className="font-bold text-slate-800 px-2">
              Page {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      )}

      {/* CSV Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-indigo-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Upload size={18} className="text-indigo-700" />
                  <span>Bulk Customer CSV Import (Beats 1–34)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Upload a .csv file or paste rows with columns: Name, Mobile, Colony, Sector, House, Beat, LivingStatus
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2">
                <label className="block font-bold text-indigo-950">Upload CSV File (.csv)</label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === 'string') {
                        setImportCsvText(reader.result);
                      }
                    };
                    reader.readAsText(file);
                  }}
                  className="block w-full text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-700 file:text-white hover:file:bg-indigo-800 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Or Paste CSV Content Directly:
                </label>
                <textarea
                  rows={5}
                  value={importCsvText}
                  onChange={(e) => setImportCsvText(e.target.value)}
                  placeholder={`Name,Mobile,Colony,Sector,House,Beat,LivingStatus\nRamesh Sharma,9829012345,Keshavpura,Sector 4,4-K-12,Beat 2,Self-Owned`}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl font-mono text-[11px] focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleBulkCsvTextImport(importCsvText)}
                className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Upload size={14} />
                <span>Import &amp; Sync Customers</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
                  {allAssignableStaff.map((staff) => (
                    <option key={staff.id || staff.email} value={staff.email}>
                      {staff.name} ({staff.employeeId || staff.email}) • {staff.beat || staff.role}
                    </option>
                  ))}
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

      {/* Delete Customer Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Trash2 size={18} className="text-red-600" />
                <span>Confirm Customer Removal</span>
              </h3>
              <button
                onClick={() => setCustomerToDelete(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              क्या आप ग्राहक <strong>"{customerToDelete.name}"</strong> (ID: <span className="font-mono">{customerToDelete.masterId || customerToDelete.id}</span>) को Master Source से हटाना चाहते हैं?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCustomer}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Delete Record
              </button>
            </div>
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
          onAddLead={canAccessLeadsAndFollowUps ? onAddLead : undefined}
          onAddFollowUp={canAccessLeadsAndFollowUps ? onAddFollowUp : undefined}
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
