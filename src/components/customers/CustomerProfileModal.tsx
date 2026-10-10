import React, { useState } from 'react';
import { Customer, CustomerProductRelation, VerificationStatus } from '../../types/models';
import { 
  X, User, Phone, MapPin, Building, Shield, CheckCircle2, 
  AlertTriangle, Clock, Calendar, FileText, Plus, ArrowUpRight, 
  Sparkles, Tag, ChevronRight, Edit3, MessageSquare 
} from 'lucide-react';
import { customerService } from '../../services/customerService';
import { POSTAL_PRODUCTS } from '../../data/productsData';
import DirectMessageModal from '../crm/DirectMessageModal';

interface Props {
  customer: Customer;
  onClose: () => void;
  onEdit?: (customer: Customer) => void;
  onAddLead?: (customer: Customer) => void;
  onAddFollowUp?: (customer: Customer) => void;
}

export default function CustomerProfileModal({ customer, onClose, onEdit, onAddLead, onAddFollowUp }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'leads' | 'followups' | 'timeline'>('overview');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(customer.verificationStatus);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [newProductCode, setNewProductCode] = useState(POSTAL_PRODUCTS[0].code);
  const [newProductAmount, setNewProductAmount] = useState('');
  const [newProductRemarks, setNewProductRemarks] = useState('');

  const handleStatusChange = (newStatus: VerificationStatus) => {
    setVerificationStatus(newStatus);
    const updatedCustomer = { ...customer, verificationStatus: newStatus };
    customerService.addOrUpdateCustomer(updatedCustomer, `Status updated to ${newStatus}`);
  };

  const customerLeads = customerService.getLeads().filter(l => l.customerId === customer.id || l.customerId === customer.masterId);
  const customerFollowUps = customerService.getFollowUps().filter(f => f.customerId === customer.id || f.customerId === customer.masterId);
  const customerAudits = customerService.getAuditLogs().filter(a => a.entityId === customer.id || a.entityId === customer.masterId);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const prodDef = POSTAL_PRODUCTS.find(p => p.code === newProductCode);
    const newProd: CustomerProductRelation = {
      id: `p-${customer.id}-${Date.now()}`,
      productCode: newProductCode,
      productName: prodDef?.name || newProductCode,
      status: 'Active',
      sumAssuredOrBalance: newProductAmount ? parseFloat(newProductAmount) : undefined,
      startDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      remarks: newProductRemarks
    };

    customer.products = [...(customer.products || []), newProd];
    customerService.addOrUpdateCustomer(customer, 'Customer Profile Update');
    setShowAddProductModal(false);
    setNewProductAmount('');
    setNewProductRemarks('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Modal Top Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl md:text-2xl font-bold">{customer.name}</h3>
                <span className="px-2.5 py-0.5 bg-slate-800 border border-slate-700 text-amber-300 rounded-md font-mono text-xs font-semibold">
                  {customer.masterId || customer.id}
                </span>
                {customer.hasConflict && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-xs font-semibold flex items-center gap-1">
                    <AlertTriangle size={12} /> Conflict Flagged
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Phone size={13} className="text-emerald-400" />
                  <span>{customer.mobile || 'No mobile'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-red-400" />
                  <span>{customer.address?.fullAddress || `${customer.address.houseNumber || ''}, ${customer.address.sectorLocality || customer.address.area || 'Keshavpura'}`}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Building size={13} className="text-blue-400" />
                  <span>Beat {customer.beatNo || '2'} • {customer.officeId || 'DADABARI_SO'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMessageModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-xs"
              title="Send WhatsApp / SMS to Customer"
            >
              <MessageSquare size={14} />
              <span>Send Message</span>
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(customer)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
              >
                <Edit3 size={14} />
                <span>Edit Record</span>
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 px-6 border-b border-slate-200 flex gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: '360° Overview' },
            { id: 'products', label: `Products & Accounts (${customer.products?.length || 0})` },
            { id: 'leads', label: `Active Leads (${customerLeads.length})` },
            { id: 'followups', label: `Follow-ups (${customerFollowUps.length})` },
            { id: 'timeline', label: 'Audit Timeline' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-700 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-sm">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Conflict Alert Box if present */}
              {customer.hasConflict && customer.conflictDetails && customer.conflictDetails.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <AlertTriangle size={15} className="text-amber-700" />
                    <span>Data Conflict / Discrepancy Note</span>
                  </div>
                  {customer.conflictDetails.map((det, i) => (
                    <p key={i}>{det}</p>
                  ))}
                </div>
              )}

              {/* Grid Demographics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-slate-900 text-sm mb-1">Customer Identity</div>
                  <div><strong>Full Name:</strong> {customer.name}</div>
                  <div><strong>Mobile:</strong> {customer.mobile}</div>
                  <div><strong>WhatsApp:</strong> {customer.whatsapp || customer.mobile}</div>
                  <div><strong>Father / Husband:</strong> {customer.fatherHusbandName || 'Not recorded'}</div>
                  <div><strong>Occupation:</strong> {customer.occupation || 'Not recorded'}</div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-slate-900 text-sm mb-1">Postal & Geographic Location</div>
                  <div><strong>House / Plot No:</strong> {customer.address.houseNumber || 'N/A'}</div>
                  <div><strong>Sector / Area:</strong> {customer.address.sectorLocality || customer.address.area || 'Keshavpura'}</div>
                  <div><strong>Pincode:</strong> {customer.address.pincode || '324009'}</div>
                  <div><strong>Beat / Delivery Route:</strong> Beat {customer.beatNo || '2'}</div>
                  <div><strong>Sub-Post Office:</strong> {customer.officeId || 'DADABARI_SO'}</div>
                  <div><strong>Property ID:</strong> {customer.propertyId || 'Unassigned'}</div>
                  <div><strong>Household ID:</strong> {customer.householdId || 'Unassigned'}</div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-slate-900 text-sm mb-1">Status & Data Quality</div>
                  <div>
                    <strong>Verification:</strong>{' '}
                    <select 
                      value={verificationStatus}
                      onChange={(e) => handleStatusChange(e.target.value as VerificationStatus)}
                      className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold cursor-pointer text-xs"
                    >
                      {['Field Confirmed', 'Document Confirmed', 'User Provided', 'Imported - Unverified', 'Pending', 'Needs Verification', 'Merged', 'No Such Person'].map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div><strong>Data Source:</strong> {customer.source || 'MASTER_UNIQUE.csv'}</div>
                  <div><strong>Lead Score:</strong> {customer.leadScore || 75}/100</div>
                  <div><strong>Follow-up Status:</strong> {customer.followUpStatus || 'Not Scheduled'}</div>
                  <div><strong>Next Follow-up:</strong> {customer.nextFollowUpDate || 'None'}</div>
                </div>
              </div>

              {/* Remarks & Field Notes */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-xs text-slate-900 mb-1">Historical Remarks & Field Audit Notes</h4>
                <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {customer.remarks || 'No detailed field remarks recorded for this customer.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {onAddLead && (
                  <button
                    onClick={() => onAddLead(customer)}
                    className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                  >
                    <Plus size={15} />
                    <span>Create New Lead</span>
                  </button>
                )}
                {onAddFollowUp && (
                  <button
                    onClick={() => onAddFollowUp(customer)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                  >
                    <Calendar size={15} />
                    <span>Schedule Follow-Up</span>
                  </button>
                )}
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                >
                  <Plus size={15} />
                  <span>Attach Postal Product</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">Linked Postal & Financial Accounts</h4>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Plus size={14} /> Add Product
                </button>
              </div>

              {customer.products && customer.products.length > 0 ? (
                <div className="space-y-3">
                  {customer.products.map((prod, idx) => (
                    <div key={prod.id ? `cp-${prod.id}` : `cp-${customer.id}-${idx}`} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                          <span>{prod.productName}</span>
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded font-semibold">
                            {prod.productCode}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {prod.sumAssuredOrBalance ? `Amount/Sum: ₹${prod.sumAssuredOrBalance.toLocaleString('en-IN')} • ` : ''}
                          {prod.monthlyDeposit ? `Monthly Deposit: ₹${prod.monthlyDeposit.toLocaleString('en-IN')} • ` : ''}
                          Status: <strong className="text-slate-800">{prod.status}</strong>
                        </div>
                        {prod.remarks && <div className="text-xs text-slate-500 mt-0.5">{prod.remarks}</div>}
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-full">
                        {prod.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                  No active postal products linked yet. Click "Add Product" or create a lead to recommend schemes.
                </div>
              )}
            </div>
          )}

          {activeTab === 'leads' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">CRM Lead Inquiries & Pipeline</h4>
                {onAddLead && (
                  <button
                    onClick={() => onAddLead(customer)}
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus size={14} /> New Lead
                  </button>
                )}
              </div>

              {customerLeads?.length > 0 ? (
                <div className="space-y-3">
                  {customerLeads.map((lead) => (
                    <div key={lead.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{lead.productName}</span>
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">
                          Stage: {lead.stage}
                        </span>
                      </div>
                      <p className="text-slate-600">{lead.requirement}</p>
                      <div className="text-slate-500 flex justify-between">
                        <span>Assigned Staff: <strong>{lead.assignedStaffName || 'Dadabari SO'}</strong></span>
                        <span>Priority: <strong className="text-red-700">{lead.priority}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                  No active sales leads for this customer.
                </div>
              )}
            </div>
          )}

          {activeTab === 'followups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">Scheduled & Completed Follow-ups</h4>
                {onAddFollowUp && (
                  <button
                    onClick={() => onAddFollowUp(customer)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus size={14} /> Schedule Follow-up
                  </button>
                )}
              </div>

              {customerFollowUps?.length > 0 ? (
                <div className="space-y-3">
                  {customerFollowUps.map((fol) => (
                    <div key={fol.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {fol.scheduledDate} {fol.scheduledTime ? `at ${fol.scheduledTime}` : ''}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-semibold ${
                          fol.currentStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {fol.currentStatus}
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium">{fol.nextAction}</p>
                      <p className="text-slate-500">Remarks: {fol.remarks}</p>
                      {fol.outcome && (
                        <div className="p-2 bg-emerald-50 text-emerald-900 rounded font-medium mt-1">
                          Outcome: {fol.outcome}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                  No follow-ups recorded yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900 mb-3">Audit Logs & Activity History</h4>
              {customerAudits?.length > 0 ? (
                <div className="space-y-2">
                  {customerAudits.map((aud) => (
                    <div key={aud.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">{aud.details}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {new Date(aud.timestamp).toLocaleString()} • {aud.performedBy} ({aud.action})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500">
                  Initial import from verified Master Source record on {customer.createdAt || '2026-08-20'}.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
          >
            Close Profile
          </button>
        </div>

        {/* Add Product Modal Sub-dialog */}
        {showAddProductModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-60">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <h4 className="font-bold text-slate-900 text-base">Attach Postal Product</h4>
                <button onClick={() => setShowAddProductModal(false)}><X size={18} /></button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4 mt-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Scheme / Product</label>
                  <select
                    value={newProductCode}
                    onChange={(e) => setNewProductCode(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs font-medium"
                  >
                    {POSTAL_PRODUCTS.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deposit / Sum Assured (₹)</label>
                  <input
                    type="number"
                    value={newProductAmount}
                    onChange={(e) => setNewProductAmount(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Remarks / Policy Number</label>
                  <input
                    type="text"
                    value={newProductRemarks}
                    onChange={(e) => setNewProductRemarks(e.target.value)}
                    placeholder="e.g. Account opened via Beat 2 Postman"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-semibold"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Direct Messaging Modal */}
        {showMessageModal && (
          <DirectMessageModal
            isOpen={showMessageModal}
            onClose={() => setShowMessageModal(false)}
            initialCustomer={customer}
          />
        )}
      </div>
    </div>
  );
}
