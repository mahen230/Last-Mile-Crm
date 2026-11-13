import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Clock, Plus, CheckCircle2, Calendar, Phone, MapPin, User, AlertCircle, X } from 'lucide-react';
import { FollowUp, Customer } from '../../types/models';
import { customerService } from '../../services/customerService';
import CustomerProfileModal from '../customers/CustomerProfileModal';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { staffPermissionService } from '../../services/staffPermissionService';

export default function FollowUpsView() {
  const { userProfile } = useAuth();
  const location = useLocation();
  const isSuperAdmin = staffPermissionService.isSuperAdmin(userProfile);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [filter, setFilter] = useState<'All' | 'Today' | 'Overdue' | 'Upcoming' | 'Completed'>('All');
  const [actionTypeFilter, setActionTypeFilter] = useState<'ALL' | 'SCHEME_QUERY' | 'SERVICE_VISIT' | 'KYC_DOC'>('ALL');
  const [beatFilter, setBeatFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFollowUpForOutcome, setSelectedFollowUpForOutcome] = useState<FollowUp | null>(null);
  const [selectedFollowUpForEdit, setSelectedFollowUpForEdit] = useState<FollowUp | null>(null);
  const [outcomeText, setOutcomeText] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  // Add / Edit Form
  const [formCustName, setFormCustName] = useState('');
  const [formCustMobile, setFormCustMobile] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAction, setFormAction] = useState('Doorstep Scheme Discussion');
  const [formStaff, setFormStaff] = useState('Shri Rajesh Sharma (Beat 2 Postman)');
  const [formRemarks, setFormRemarks] = useState('');

  const showToast = (msg: string) => {
    setFeedbackBanner(msg);
    setTimeout(() => {
      setFeedbackBanner(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  useEffect(() => {
    setFollowUps(customerService.getFollowUps());
    const unsub = customerService.subscribe(() => {
      setFollowUps([...customerService.getFollowUps()]);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const prefillCustomer: Customer | null = (location.state as any)?.initialCustomer || null;
    if (prefillCustomer) {
      setFormCustName(prefillCustomer.name || '');
      setFormCustMobile(prefillCustomer.mobile || '');
      setShowAddModal(true);
    }
  }, [location.state]);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredFollowUps = followUps.filter(f => {
    if (!staffPermissionService.matchesUserBeatScope(userProfile, f)) {
      return false;
    }
    if (beatFilter !== 'ALL') {
      const b = String(f.beatNo || '2').replace(/^Beat\s*/i, '').trim();
      if (b !== beatFilter) return false;
    }
    if (actionTypeFilter !== 'ALL') {
      const act = `${f.nextAction || ''} ${f.remarks || ''}`.toUpperCase();
      if (actionTypeFilter === 'SCHEME_QUERY' && !act.includes('SCHEME') && !act.includes('PPF') && !act.includes('SSY') && !act.includes('PLI') && !act.includes('RD') && !act.includes('NSC') && !act.includes('SAVING')) {
        return false;
      }
      if (actionTypeFilter === 'SERVICE_VISIT' && !act.includes('DOORSTEP') && !act.includes('AADHAAR') && !act.includes('CELC') && !act.includes('VISIT') && !act.includes('DELIVERY') && !act.includes('IPPB')) {
        return false;
      }
      if (actionTypeFilter === 'KYC_DOC' && !act.includes('KYC') && !act.includes('DOCUMENT') && !act.includes('FORM') && !act.includes('PAN') && !act.includes('RENEWAL')) {
        return false;
      }
    }

    const matchesSearch = 
      f.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.customerMobile.includes(searchQuery) ||
      f.nextAction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.assignedStaffName.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (filter === 'Completed') matchesFilter = f.currentStatus === 'Completed';
    else if (filter === 'Today') matchesFilter = f.scheduledDate === todayStr && f.currentStatus !== 'Completed';
    else if (filter === 'Overdue') matchesFilter = f.scheduledDate < todayStr && f.currentStatus !== 'Completed';
    else if (filter === 'Upcoming') matchesFilter = f.scheduledDate > todayStr && f.currentStatus !== 'Completed';
    
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, actionTypeFilter, beatFilter, searchQuery, userProfile]);

  const totalPages = Math.max(1, Math.ceil(filteredFollowUps.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedFollowUps = filteredFollowUps.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustName || !formCustMobile) {
      showToast('Please fill customer name and mobile number.');
      return;
    }

    const activeBeatNo = (userProfile?.beat || 'Beat 2').replace(/^Beat\s*/i, '').trim() || '2';

    customerService.scheduleFollowUp({
      customerName: formCustName,
      customerMobile: formCustMobile,
      scheduledDate: formDate,
      scheduledTime: '11:00 AM',
      nextAction: formAction,
      assignedStaffName: userProfile ? `${userProfile.name} (${userProfile.beat})` : formStaff,
      assignedStaffEmail: userProfile?.email,
      beatNo: activeBeatNo,
      remarks: formRemarks,
      currentStatus: 'Pending'
    });

    setShowAddModal(false);
    setFormCustName('');
    setFormCustMobile('');
    setFormRemarks('');
    showToast(`Scheduled follow-up for ${formCustName} on ${formDate}.`);
  };

  const handleLogOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowUpForOutcome || !outcomeText) return;

    customerService.completeFollowUp(selectedFollowUpForOutcome.id, outcomeText);
    showToast(`Completed follow-up ${selectedFollowUpForOutcome.id} for ${selectedFollowUpForOutcome.customerName}.`);
    setSelectedFollowUpForOutcome(null);
    setOutcomeText('');
  };

  return (
    <div className="space-y-6" id="followups-view-root">
      {feedbackBanner && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700" />
            <span>{feedbackBanner}</span>
          </div>
          <button onClick={() => setFeedbackBanner(null)} className="text-slate-500 hover:text-slate-800">
            <X size={14} />
          </button>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock size={22} className="text-red-700" />
            <span>Customer Follow-Up Scheduler & Action Log</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSuperAdmin
              ? `Global Admin View: Doorstep visits and callback schedules across all Beats (${filteredFollowUps.length} Records)`
              : `Beat-Restricted View (${userProfile?.beat || 'Beat 2'}): Showing only follow-ups assigned to your Beat (${filteredFollowUps.length} Records)`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs"
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            id="schedule-followup-btn"
          >
            <Plus size={16} />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          {(['All', 'Today', 'Overdue', 'Upcoming', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl transition ${
                filter === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { id: 'ALL', label: 'All Actions' },
            { id: 'SCHEME_QUERY', label: 'Product / Scheme Queries' },
            { id: 'SERVICE_VISIT', label: 'Doorstep Service Visits' },
            { id: 'KYC_DOC', label: 'KYC & Document Collection' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActionTypeFilter(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                actionTypeFilter === cat.id
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
          {isSuperAdmin && (
            <select
              value={beatFilter}
              onChange={(e) => setBeatFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="ALL">All Beats</option>
              <option value="1">Beat 1</option>
              <option value="2">Beat 2</option>
              <option value="3">Beat 3</option>
              <option value="4">Beat 4</option>
              <option value="5">Beat 5</option>
            </select>
          )}
        </div>
      </div>

      {/* Follow-ups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedFollowUps.map((fol) => (
          <div
            key={fol.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-xs transition p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-slate-500">{fol.id}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  fol.currentStatus === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : fol.scheduledDate < todayStr
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {fol.currentStatus === 'Completed' ? 'Completed' : fol.scheduledDate < todayStr ? 'Overdue' : fol.currentStatus}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{fol.customerName}</h3>
              <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5 mb-3">
                <Phone size={12} className="text-emerald-600" />
                <span>{fol.customerMobile}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700 mb-3">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <Calendar size={13} className="text-red-700" />
                  <span>Scheduled: {fol.scheduledDate} {fol.scheduledTime ? `(${fol.scheduledTime})` : ''}</span>
                </div>
                <div className="text-slate-800 font-medium">Action: {fol.nextAction}</div>
                <div className="text-slate-500 text-[11px]">Assigned to: {fol.assignedStaffName || 'Beat 2 Postman'}</div>
                {fol.remarks && <div className="text-slate-600 italic">"{fol.remarks}"</div>}
              </div>

              {fol.outcome && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Completed Outcome
                  </div>
                  <p>{fol.outcome}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  const cust =
                    (fol.customerId ? customerService.getCustomerById(fol.customerId) : undefined) ||
                    customerService.getCustomerByMobile(fol.customerMobile) ||
                    customerService.getScopedCustomers(userProfile).find(c => c.name.toLowerCase() === fol.customerName.toLowerCase());
                  if (cust) {
                    setSelectedCustomer(cust);
                  } else {
                    setSelectedCustomer({
                      id: fol.customerId || `CUST-${fol.id}`,
                      masterId: fol.customerId || `CUST-${fol.id}`,
                      name: fol.customerName,
                      mobile: fol.customerMobile,
                      beatNo: fol.beatNo || '2',
                      sector: 'Dadabari',
                      area: 'Dadabari SO',
                      verificationStatus: 'Pending Verification',
                      products: [],
                      createdAt: new Date().toISOString()
                    });
                  }
                }}
                className="font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                View Profile
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormDate(fol.scheduledDate || new Date().toISOString().split('T')[0]);
                    setFormAction(fol.nextAction || 'Doorstep Scheme Discussion');
                    setFormStaff(fol.assignedStaffName || 'Shri Rajesh Sharma (Beat 2 Postman)');
                    setFormRemarks(fol.remarks || '');
                    setSelectedFollowUpForEdit(fol);
                  }}
                  className="font-medium text-slate-600 hover:text-red-700 cursor-pointer"
                >
                  Edit
                </button>
                {fol.currentStatus !== 'Completed' && (
                  <button
                    onClick={() => {
                      setSelectedFollowUpForOutcome(fol);
                      setOutcomeText('');
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 size={13} />
                    <span>Log Outcome</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredFollowUps.length === 0 && (
          <div className="col-span-full p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
            No follow-ups found in this category.
          </div>
        )}
      </div>

      {filteredFollowUps.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 text-xs text-slate-600">
          <span>
            Showing <strong className="text-slate-900">{(safePage - 1) * PAGE_SIZE + 1}</strong>–<strong className="text-slate-900">{Math.min(safePage * PAGE_SIZE, filteredFollowUps.length)}</strong> of <strong className="text-slate-900">{filteredFollowUps.length}</strong> follow-ups (5 per page)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              Prev
            </button>
            <span className="font-mono font-bold text-slate-800 px-2">
              Page {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Log Outcome Modal */}
      {selectedFollowUpForOutcome && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Complete Follow-up & Log Outcome</h3>
              <button onClick={() => setSelectedFollowUpForOutcome(null)}>✕</button>
            </div>

            <form onSubmit={handleLogOutcome} className="space-y-4 mt-4 text-xs">
              <div>
                <span className="text-slate-500">Customer:</span>
                <div className="font-bold text-slate-900 text-sm">{selectedFollowUpForOutcome.customerName}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Visit / Call Outcome *</label>
                <textarea
                  rows={3}
                  required
                  value={outcomeText}
                  onChange={(e) => setOutcomeText(e.target.value)}
                  placeholder="e.g. Visited customer home. Collected Aadhaar copy and 2 passport photos for Sukanya Samriddhi account opening."
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedFollowUpForOutcome(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-semibold"
                >
                  Mark Completed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Follow-Up Modal */}
      {selectedFollowUpForEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-lg">Edit Follow-up</h3>
              <button onClick={() => setSelectedFollowUpForEdit(null)}>✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                customerService.updateFollowUp(selectedFollowUpForEdit.id, {
                  scheduledDate: formDate,
                  nextAction: formAction,
                  assignedStaffName: formStaff,
                  remarks: formRemarks,
                  currentStatus: selectedFollowUpForEdit.currentStatus
                });
                setSelectedFollowUpForEdit(null);
              }}
              className="space-y-4 mt-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scheduled Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Action Type</label>
                  <select
                    value={formAction}
                    onChange={(e) => setFormAction(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Doorstep Scheme Discussion">Doorstep Scheme Discussion</option>
                    <option value="Document & KYC Collection">Document & KYC Collection</option>
                    <option value="PLI Premium Follow-up">PLI Premium Follow-up</option>
                    <option value="Aadhaar Biometric Doorstep">Aadhaar Biometric Doorstep</option>
                    <option value="Phone Consultation">Phone Consultation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Postal Staff</label>
                <select
                  value={formStaff}
                  onChange={(e) => setFormStaff(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="Shri Rajesh Sharma (Beat 2 Postman)">Shri Rajesh Sharma (Beat 2 Postman)</option>
                  <option value="Shri Dinesh Verma (Beat 6 Postman)">Shri Dinesh Verma (Beat 6 Postman)</option>
                  <option value="Dadabari SO Savings Counter">Dadabari SO Savings Counter</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedFollowUpForEdit(null)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 text-white rounded-xl font-semibold"
                >
                  Update Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      {/* Schedule New Follow-Up Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-lg">Schedule Doorstep Follow-Up</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateFollowUp} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formCustName}
                    onChange={(e) => setFormCustName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={formCustMobile}
                    onChange={(e) => setFormCustMobile(e.target.value)}
                    placeholder="e.g. 9829012345"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scheduled Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Action Type</label>
                  <select
                    value={formAction}
                    onChange={(e) => setFormAction(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Doorstep Scheme Discussion">Doorstep Scheme Discussion</option>
                    <option value="Document & KYC Collection">Document & KYC Collection</option>
                    <option value="PLI Premium Follow-up">PLI Premium Follow-up</option>
                    <option value="Aadhaar Biometric Doorstep">Aadhaar Biometric Doorstep</option>
                    <option value="Phone Consultation">Phone Consultation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Postal Staff</label>
                <select
                  value={formStaff}
                  onChange={(e) => setFormStaff(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="Shri Rajesh Sharma (Beat 2 Postman)">Shri Rajesh Sharma (Beat 2 Postman)</option>
                  <option value="Shri Dinesh Verma (Beat 6 Postman)">Shri Dinesh Verma (Beat 6 Postman)</option>
                  <option value="Dadabari SO Savings Counter">Dadabari SO Savings Counter</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Doorstep Instructions</label>
                <textarea
                  rows={2}
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  placeholder="e.g. Visit after 4 PM, bring SSA opening form and KYC checklist."
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-semibold"
                >
                  Schedule Follow-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
