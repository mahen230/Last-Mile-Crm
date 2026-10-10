import React, { useState, useEffect } from 'react';
import { Target, Plus, ArrowRight, CheckCircle2, Clock, User, Phone, Filter, ChevronRight, X, MessageSquare } from 'lucide-react';
import { Lead, LeadStage, Customer } from '../../types/models';
import { customerService } from '../../services/customerService';
import { POSTAL_PRODUCTS } from '../../data/productsData';
import CustomerProfileModal from '../customers/CustomerProfileModal';
import DirectMessageModal from './DirectMessageModal';

export default function LeadsPipelineView({ initialCustomer }: { initialCustomer?: Customer | null }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [leadToLink, setLeadToLink] = useState<Lead | null>(null);
  const [messageLead, setMessageLead] = useState<Lead | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // New Lead Form State
  const [leadCustomerName, setLeadCustomerName] = useState('');
  const [leadCustomerMobile, setLeadCustomerMobile] = useState('');
  const [leadProductCode, setLeadProductCode] = useState(POSTAL_PRODUCTS[0].code);
  const [leadRequirement, setLeadRequirement] = useState('');
  const [leadPriority, setLeadPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('High');
  const [leadEstimatedValue, setLeadEstimatedValue] = useState('');
  const [leadAssignedStaff, setLeadAssignedStaff] = useState('Shri Rajesh Sharma (Beat 2 Postman)');

  useEffect(() => {
    setLeads(customerService.getLeads());
    const unsub = customerService.subscribe(() => {
      setLeads([...customerService.getLeads()]);
    });
    return () => unsub();
  }, []);

  const stages: LeadStage[] = [
    'New',
    'Contacted',
    'Interested',
    'Follow-up Scheduled',
    'Documentation Pending',
    'Under Processing',
    'Converted - Product Opened',
    'Closed - Not Interested'
  ];

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadCustomerName || !leadCustomerMobile) {
      alert('Please fill customer name and mobile.');
      return;
    }

    const prod = POSTAL_PRODUCTS.find(p => p.code === leadProductCode);

    customerService.createLead({
      customerId: 'CUST-TEMP',
      customerName: leadCustomerName,
      customerMobile: leadCustomerMobile,
      productCode: leadProductCode,
      productName: prod?.name || leadProductCode,
      requirement: leadRequirement || `Interested in ${prod?.name}`,
      source: 'Direct Lead Inquiry',
      leadScore: 80,
      priority: leadPriority,
      estimatedValue: leadEstimatedValue ? parseFloat(leadEstimatedValue) : undefined,
      assignedStaffName: leadAssignedStaff,
      assignedStaffId: 'STAFF-BEAT-02',
      stage: 'New'
    });

    setShowAddLeadModal(false);
    setLeadCustomerName('');
    setLeadCustomerMobile('');
    setLeadRequirement('');
    setLeadEstimatedValue('');
  };

  const handleAdvanceStage = (leadId: string, currentStage: LeadStage) => {
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 2) {
      const nextStage = stages[currentIndex + 1];
      customerService.updateLeadStage(leadId, nextStage);
    }
  };

  const handleLinkToHousehold = (householdId: string) => {
    if (leadToLink) {
      customerService.updateLead(leadToLink.id, { householdId });
      setShowLinkModal(false);
      setLeadToLink(null);
    }
  };

  const handleConvertToProduct = (lead: Lead) => {
    const success = customerService.convertLeadToProduct(lead.id);
    if (success) {
      alert(`Lead ${lead.id} successfully converted! Product account has been attached to customer profile.`);
    }
  };

  return (
    <div className="space-y-6" id="leads-pipeline-view-root">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target size={22} className="text-red-700" />
            <span>Sales & Scheme Inquiries Pipeline</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full 9-stage Postal Product Opportunity & Conversion Lifecycle ({leads.length} Leads)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle View */}
          <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-semibold">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'kanban' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
              }`}
            >
              Table View
            </button>
          </div>

          <button
            onClick={() => setShowAddLeadModal(true)}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
            id="add-lead-btn"
          >
            <Plus size={16} />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[600px]">
          {stages.map((stage) => {
            const stageLeads = leads.filter(l => l.stage === stage);
            return (
              <div
                key={stage}
                className="w-72 shrink-0 bg-slate-100/90 rounded-2xl p-3 border border-slate-200/80 flex flex-col max-h-[750px]"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <span className="font-bold text-xs text-slate-800 tracking-tight">{stage}</span>
                  <span className="px-2 py-0.5 bg-white text-slate-700 rounded-full text-[11px] font-bold shadow-xs">
                    {stageLeads?.length || 0}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-red-300 hover:shadow-xs transition space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-slate-500">{lead.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lead.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                          lead.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {lead.priority}
                        </span>
                      </div>

                      <div className="font-bold text-slate-900 text-sm">{lead.customerName}</div>
                      <div className="text-slate-500 font-mono text-[11px] flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Phone size={11} className="text-emerald-600" />
                          <span>{lead.customerMobile}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setMessageLead(lead);
                            setShowMessageModal(true);
                          }}
                          className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 text-[10px] font-semibold flex items-center gap-1 transition"
                          title="Send WhatsApp/SMS update to lead"
                        >
                          <MessageSquare size={11} />
                          <span>Chat</span>
                        </button>
                      </div>

                      <div className="p-2 bg-red-50/60 rounded-lg text-red-900 font-semibold text-[11px]">
                        {lead.productName}
                      </div>

                      <p className="text-slate-600 line-clamp-2 text-[11px]">{lead.requirement}</p>

                      {lead.estimatedValue && (
                        <div className="text-[11px] text-slate-700 font-bold">
                          Est. Value: ₹{lead.estimatedValue.toLocaleString('en-IN')}
                        </div>
                      )}

                      {/* Stage Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => { setLeadToLink(lead); setShowLinkModal(true); }}
                          className="text-[10px] font-bold text-indigo-700 hover:text-indigo-800"
                        >
                          Link Household
                        </button>
                        {stage !== 'Converted - Product Opened' && stage !== 'Closed - Not Interested' ? (
                          <>
                            <button
                              onClick={() => handleConvertToProduct(lead)}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
                            >
                              <CheckCircle2 size={12} /> Convert
                            </button>
                            <button
                              onClick={() => handleAdvanceStage(lead.id, lead.stage)}
                              className="text-[11px] font-bold text-red-700 hover:text-red-800 flex items-center gap-0.5"
                            >
                              <span>Advance</span>
                              <ChevronRight size={12} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Lifecycle final</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {stageLeads?.length === 0 && (
                    <div className="p-6 text-center text-slate-400 text-xs italic">
                      No leads in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="text-[11px] text-slate-600 uppercase bg-slate-100/80 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Lead ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assigned Staff</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{l.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{l.customerName}</div>
                      <div className="font-mono text-[11px] text-slate-500">{l.customerMobile}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{l.productName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-semibold text-[11px]">
                        {l.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-semibold text-[11px]">
                        {l.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{l.assignedStaffName || 'Dadabari SO'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setMessageLead(l);
                            setShowMessageModal(true);
                          }}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                          title="Send Message / Chat"
                        >
                          <MessageSquare size={13} />
                        </button>
                        <button
                          onClick={() => handleConvertToProduct(l)}
                          className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold"
                        >
                          Convert to Product
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-lg">Create New Product Lead</h3>
              <button onClick={() => setShowAddLeadModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={leadCustomerName}
                  onChange={(e) => setLeadCustomerName(e.target.value)}
                  placeholder="e.g. Mukesh Sen"
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={leadCustomerMobile}
                  onChange={(e) => setLeadCustomerMobile(e.target.value)}
                  placeholder="e.g. 9829012345"
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interested Scheme / Product</label>
                <select
                  value={leadProductCode}
                  onChange={(e) => setLeadProductCode(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                >
                  {POSTAL_PRODUCTS.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={leadPriority}
                    onChange={(e) => setLeadPriority(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Deposit/Cover (₹)</label>
                  <input
                    type="number"
                    value={leadEstimatedValue}
                    onChange={(e) => setLeadEstimatedValue(e.target.value)}
                    placeholder="e.g. 250000"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requirement Details</label>
                <textarea
                  rows={2}
                  value={leadRequirement}
                  onChange={(e) => setLeadRequirement(e.target.value)}
                  placeholder="e.g. Inquired about daughter's Sukanya scheme opening during beat distribution."
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Postal Staff</label>
                <select
                  value={leadAssignedStaff}
                  onChange={(e) => setLeadAssignedStaff(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="Shri Rajesh Sharma (Beat 2 Postman)">Shri Rajesh Sharma (Beat 2 Postman)</option>
                  <option value="Shri Dinesh Verma (Beat 6 Postman)">Shri Dinesh Verma (Beat 6 Postman)</option>
                  <option value="Dadabari SO Savings Counter">Dadabari SO Savings Counter</option>
                  <option value="Mandaliya BO Branch Postmaster">Mandaliya BO Branch Postmaster</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 text-white rounded-xl font-semibold"
                >
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Household Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Link Lead to Household</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {customerService.getCustomers().filter(c => c.type === 'Household').map(h => (
                <button
                  key={h.id}
                  onClick={() => handleLinkToHousehold(h.id)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300"
                >
                  <div className="font-bold">{h.address?.houseNumber}</div>
                  <div className="text-xs text-slate-600">{h.address?.addressLine1}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLinkModal(false)}
              className="mt-4 w-full p-2 bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Direct Messaging Modal */}
      {showMessageModal && (
        <DirectMessageModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setMessageLead(null);
          }}
          initialCustomer={messageLead ? {
            id: messageLead.customerId || 'LEAD-TEMP',
            name: messageLead.customerName,
            mobile: messageLead.customerMobile,
            sector: 'Dadabari',
            area: 'Dadabari SO',
            addressLine1: '',
            pincode: '324009',
            verificationStatus: 'Pending Verification',
            createdAt: new Date().toISOString()
          } : null}
          initialMessage={messageLead ? `🇮🇳 *भारतीय डाक (India Post) सूचना*\n\nनमस्ते ${messageLead.customerName} जी,\nडाक विभाग की योजना *${messageLead.productName}* से संबंधित आपकी पूछताछ प्राप्त हुई थी। अधिक विवरण एवं खाता खोलने की सुविधा हेतु हम आपकी सेवा में तत्पर हैं।\n\n- उपडाकघर: दादाबाड़ी SO (324009)` : ''}
        />
      )}
    </div>
  );
}
