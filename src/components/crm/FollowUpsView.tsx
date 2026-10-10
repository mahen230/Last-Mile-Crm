import React, { useState, useEffect } from 'react';
import { Clock, Plus, CheckCircle2, Calendar, Phone, MapPin, User, AlertCircle, X } from 'lucide-react';
import { FollowUp, Customer } from '../../types/models';
import { customerService } from '../../services/customerService';
import CustomerProfileModal from '../customers/CustomerProfileModal';

export default function FollowUpsView() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [filter, setFilter] = useState<'All' | 'Today' | 'Overdue' | 'Upcoming' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFollowUpForOutcome, setSelectedFollowUpForOutcome] = useState<FollowUp | null>(null);
  const [selectedFollowUpForEdit, setSelectedFollowUpForEdit] = useState<FollowUp | null>(null);
  const [outcomeText, setOutcomeText] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Add Form
  const [formCustName, setFormCustName] = useState('');
  const [formCustMobile, setFormCustMobile] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAction, setFormAction] = useState('Doorstep Scheme Discussion');
  const [formStaff, setFormStaff] = useState('Shri Rajesh Sharma (Beat 2 Postman)');
  const [formRemarks, setFormRemarks] = useState('');

  useEffect(() => {
    setFollowUps(customerService.getFollowUps());
    const unsub = customerService.subscribe(() => {
      setFollowUps([...customerService.getFollowUps()]);
    });
    return () => unsub();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredFollowUps = followUps.filter(f => {
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

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustName || !formCustMobile) {
      alert('Please fill name and mobile.');
      return;
    }

    customerService.scheduleFollowUp({
      customerName: formCustName,
      customerMobile: formCustMobile,
      scheduledDate: formDate,
      scheduledTime: '11:00 AM',
      nextAction: formAction,
      assignedStaffName: formStaff,
      remarks: formRemarks,
      currentStatus: 'Pending'
    });

    setShowAddModal(false);
    setFormCustName('');
    setFormCustMobile('');
    setFormRemarks('');
  };

  const handleLogOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowUpForOutcome || !outcomeText) return;

    customerService.completeFollowUp(selectedFollowUpForOutcome.id, outcomeText);
    setSelectedFollowUpForOutcome(null);
    setOutcomeText('');
  };

  return (
    <div className="space-y-6" id="followups-view-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock size={22} className="text-red-700" />
            <span>Customer Follow-Up Scheduler & Action Log</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Doorstep visits, callback schedules, and scheme document collection tasks ({followUps?.length || 0} Records)
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

      {/* Follow-ups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFollowUps.map((fol) => (
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
                  const cust = customerService.getCustomerByMobile(fol.customerMobile);
                  if (cust) setSelectedCustomer(cust);
                }}
                className="font-medium text-slate-600 hover:text-slate-900"
              >
                View Profile
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedFollowUpForEdit(fol)}
                  className="font-medium text-slate-600 hover:text-red-700"
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
    </div>
  );
}
