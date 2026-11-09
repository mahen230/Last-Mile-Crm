import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Customer, CustomerProductRelation, VerificationStatus } from '../../types/models';
import { 
  X, User, Phone, MapPin, Building, Shield, CheckCircle2, 
  AlertTriangle, Clock, Calendar, FileText, Plus, ArrowUpRight, 
  Sparkles, Tag, ChevronRight, Edit3, MessageSquare, ArrowRightLeft, Home
} from 'lucide-react';
import { customerService } from '../../services/customerService';
import { POSTAL_PRODUCTS } from '../../data/productsData';
import DirectMessageModal from '../crm/DirectMessageModal';
import { useAuth } from '../auth/FirebaseAuthProvider';

interface Props {
  customer: Customer;
  onClose: () => void;
  onEdit?: (customer: Customer) => void;
  onAddLead?: (customer: Customer) => void;
  onAddFollowUp?: (customer: Customer) => void;
}

export default function CustomerProfileModal({ customer: initialCustomerProp, onClose, onEdit, onAddLead, onAddFollowUp }: Props) {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [customer, setCustomer] = useState<Customer>(initialCustomerProp);
  const [activeTab, setActiveTab] = useState<'overview' | 'relocation' | 'products' | 'leads' | 'followups' | 'timeline'>('overview');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(initialCustomerProp.verificationStatus);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [newProductCode, setNewProductCode] = useState(POSTAL_PRODUCTS[0].code);
  const [newProductAmount, setNewProductAmount] = useState('');
  const [newProductRemarks, setNewProductRemarks] = useState('');
  const [profileNotice, setProfileNotice] = useState<string | null>(null);

  // Permanent vs Residential Address inline editor state
  const [editingAddresses, setEditingAddresses] = useState(false);
  const [resHouseNo, setResHouseNo] = useState(
    customer.residentialAddress?.houseNo || customer.address?.houseNumber || customer.houseNo || ''
  );
  const [resStreet, setResStreet] = useState(
    customer.residentialAddress?.street || customer.address?.street || customer.street || 'Main Colony Street'
  );
  const [resLandmark, setResLandmark] = useState(
    customer.residentialAddress?.landmark || customer.address?.landmark || customer.landmark || 'Near Sector Park'
  );
  const [resSector, setResSector] = useState(
    customer.residentialAddress?.sectorLocality || customer.sector || customer.area || 'Keshavpura Sector 7'
  );
  const [resPincode, setResPincode] = useState(
    customer.residentialAddress?.pincode || customer.address?.pincode || customer.pincode || '324009'
  );
  const [sameAsResidential, setSameAsResidential] = useState<boolean>(
    customer.sameAsResidential ?? true
  );
  const [permHouseNo, setPermHouseNo] = useState(
    customer.permanentAddress?.houseNo || customer.address?.houseNumber || customer.houseNo || ''
  );
  const [permStreet, setPermStreet] = useState(
    customer.permanentAddress?.street || customer.street || 'Main Colony Street'
  );
  const [permLandmark, setPermLandmark] = useState(
    customer.permanentAddress?.landmark || customer.landmark || 'Near Sector Park'
  );
  const [permSector, setPermSector] = useState(
    customer.permanentAddress?.sectorLocality || customer.sector || customer.area || 'Keshavpura Sector 7'
  );
  const [permPincode, setPermPincode] = useState(
    customer.permanentAddress?.pincode || customer.address?.pincode || customer.pincode || '324009'
  );

  // Shifted / Relocation History logging form state
  const [showRelocationForm, setShowRelocationForm] = useState(false);
  const [shiftHouseNo, setShiftHouseNo] = useState('');
  const [shiftStreet, setShiftStreet] = useState('');
  const [shiftLandmark, setShiftLandmark] = useState('');
  const [shiftColony, setShiftColony] = useState('Keshavpura Sector 6');
  const [shiftPincode, setShiftPincode] = useState('324009');
  const [shiftBeatNo, setShiftBeatNo] = useState(customer.beatNo || '2');
  const [shiftReason, setShiftReason] = useState('Tenant Shifted');
  const [shiftRedirection, setShiftRedirection] = useState(true);
  const [shiftRemarks, setShiftRemarks] = useState('');

  const handleSaveAddresses = (e: React.FormEvent) => {
    e.preventDefault();
    const resFull = `${resHouseNo ? resHouseNo + ', ' : ''}${resStreet ? resStreet + ', ' : ''}${resSector}${
      resLandmark ? ` (Near ${resLandmark})` : ''
    } - ${resPincode}`;
    const permFull = sameAsResidential
      ? resFull
      : `${permHouseNo ? permHouseNo + ', ' : ''}${permStreet ? permStreet + ', ' : ''}${permSector}${
          permLandmark ? ` (Near ${permLandmark})` : ''
        } - ${permPincode}`;

    const updated = customerService.updateCustomerAddresses(
      customer.id,
      {
        houseNo: resHouseNo,
        houseNumber: resHouseNo,
        street: resStreet,
        landmark: resLandmark,
        sectorLocality: resSector,
        area: resSector,
        pincode: resPincode,
        fullAddress: resFull,
      },
      {
        houseNo: sameAsResidential ? resHouseNo : permHouseNo,
        houseNumber: sameAsResidential ? resHouseNo : permHouseNo,
        street: sameAsResidential ? resStreet : permStreet,
        landmark: sameAsResidential ? resLandmark : permLandmark,
        sectorLocality: sameAsResidential ? resSector : permSector,
        area: sameAsResidential ? resSector : permSector,
        pincode: sameAsResidential ? resPincode : permPincode,
        fullAddress: permFull,
      },
      sameAsResidential,
      userProfile?.name || 'Postal Staff'
    );
    if (updated) {
      setCustomer({ ...updated });
      setEditingAddresses(false);
      setProfileNotice('Residential & Permanent Addresses saved successfully!');
      setTimeout(() => setProfileNotice(null), 3500);
    }
  };

  const handleRecordRelocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftHouseNo.trim() && !shiftColony.trim()) return;
    const updated = customerService.recordCustomerRelocation(customer.id, {
      newHouseNo: shiftHouseNo.trim() || 'New Plot',
      newStreet: shiftStreet.trim() || 'Main Street',
      newLandmark: shiftLandmark.trim() || 'Main Landmark',
      newSectorOrColony: shiftColony.trim(),
      newPincode: shiftPincode.trim() || '324009',
      newBeatNo: shiftBeatNo,
      reason: shiftReason,
      redirectionActive: shiftRedirection,
      recordedBy: userProfile?.name || 'Mahendra Kumar Meena',
      remarks: shiftRemarks.trim(),
    });
    if (updated) {
      setCustomer({ ...updated });
      setResHouseNo(updated.houseNo || '');
      setResStreet(updated.street || '');
      setResLandmark(updated.landmark || '');
      setResSector(updated.sector || '');
      setResPincode(updated.pincode || '324009');
      setShowRelocationForm(false);
      setShiftHouseNo('');
      setShiftStreet('');
      setShiftLandmark('');
      setShiftRemarks('');
      setProfileNotice(
        `Relocation Recorded: Customer shifted to ${updated.residentialAddress?.fullAddress} (Beat ${updated.beatNo}). Mail redirection active!`
      );
      setTimeout(() => setProfileNotice(null), 4000);
    }
  };

  const handleCreateLeadClick = () => {
    if (onAddLead) {
      onAddLead(customer);
    } else {
      onClose();
      navigate('/leads', { state: { initialCustomer: customer } });
    }
  };

  const handleScheduleFollowUpClick = () => {
    if (onAddFollowUp) {
      onAddFollowUp(customer);
    } else {
      onClose();
      navigate('/follow-ups', { state: { initialCustomer: customer } });
    }
  };

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
                  <span>{customer.address?.fullAddress || `${customer.address?.houseNumber || customer.houseNo || ''}, ${customer.address?.sectorLocality || customer.address?.area || customer.sector || customer.area || 'Keshavpura'}`}</span>
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
            { id: 'overview', label: '360° Overview & Addresses' },
            { id: 'relocation', label: `Shifted / Relocation History (${customer.relocationHistory?.length || 0})` },
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
          {profileNotice && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>{profileNotice}</span>
              </div>
              <button onClick={() => setProfileNotice(null)} className="text-emerald-700 font-bold">✕</button>
            </div>
          )}

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
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-sm">Postal & Geographic Location</span>
                    {customer.addressAccuracyScore !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          customer.addressAccuracyScore >= 90
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        AI Score: {customer.addressAccuracyScore}%
                      </span>
                    )}
                  </div>
                  <div><strong>House / Plot No:</strong> {customer.address?.houseNumber || customer.houseNo || 'N/A'}</div>
                  <div><strong>Sector / Area:</strong> {customer.address?.sectorLocality || customer.address?.area || customer.sector || customer.area || 'Keshavpura'}</div>
                  <div><strong>Pincode:</strong> {customer.address?.pincode || '324009'}</div>
                  <div><strong>Beat / Delivery Route:</strong> Beat {customer.beatNo || '2'}</div>
                  <div><strong>Sub-Post Office:</strong> {customer.officeId || 'DADABARI_SO'}</div>
                  <div><strong>Property ID:</strong> {customer.propertyId || 'Unassigned'}</div>
                  <div><strong>Household ID:</strong> {customer.householdId || 'Unassigned'}</div>
                </div>

                {customer.addressExceptionId && (
                  <div className="col-span-full p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-700 shrink-0" />
                      <div>
                        <strong>Address Exception Flagged ({customer.addressExceptionId}):</strong> Potential discrepancy against Dadabari S.O. postal records.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/address-resolution');
                      }}
                      className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold text-[11px] whitespace-nowrap"
                    >
                      Resolve in Exceptions Hub →
                    </button>
                  </div>
                )}

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

              {/* Permanent vs. Residential Address Comparison & Inline Editor */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Home size={16} className="text-red-700" />
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                      Residential vs. Permanent Address Register (House No, Street, Landmark)
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingAddresses(!editingAddresses)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      {editingAddresses ? 'Cancel Edit' : 'Edit Addresses'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('relocation');
                        setShowRelocationForm(true);
                      }}
                      className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <ArrowRightLeft size={13} />
                      <span>Log Shifted / Relocation</span>
                    </button>
                  </div>
                </div>

                {editingAddresses ? (
                  <form onSubmit={handleSaveAddresses} className="space-y-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="font-bold text-red-800">1. Current Residential Address</div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">House Number</label>
                        <input
                          type="text"
                          value={resHouseNo}
                          onChange={(e) => setResHouseNo(e.target.value)}
                          placeholder="e.g. 445-A"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Street / Lane</label>
                        <input
                          type="text"
                          value={resStreet}
                          onChange={(e) => setResStreet(e.target.value)}
                          placeholder="e.g. Gali No. 3"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Landmark</label>
                        <input
                          type="text"
                          value={resLandmark}
                          onChange={(e) => setResLandmark(e.target.value)}
                          placeholder="Near Tejaji Mandir"
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Colony & Sector</label>
                        <input
                          type="text"
                          value={resSector}
                          onChange={(e) => setResSector(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Pincode</label>
                        <input
                          type="text"
                          value={resPincode}
                          onChange={(e) => setResPincode(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <label className="inline-flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sameAsResidential}
                          onChange={(e) => setSameAsResidential(e.target.checked)}
                          className="rounded border-slate-300 text-red-700"
                        />
                        <span>Permanent Address is identical to Current Residential Address</span>
                      </label>
                    </div>

                    {!sameAsResidential && (
                      <div className="space-y-2 pt-1">
                        <div className="font-bold text-slate-800">2. Permanent / Native Address</div>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">House Number</label>
                            <input
                              type="text"
                              value={permHouseNo}
                              onChange={(e) => setPermHouseNo(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Street / Lane</label>
                            <input
                              type="text"
                              value={permStreet}
                              onChange={(e) => setPermStreet(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Landmark</label>
                            <input
                              type="text"
                              value={permLandmark}
                              onChange={(e) => setPermLandmark(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Colony / Village</label>
                            <input
                              type="text"
                              value={permSector}
                              onChange={(e) => setPermSector(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Pincode</label>
                            <input
                              type="text"
                              value={permPincode}
                              onChange={(e) => setPermPincode(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingAddresses(false)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold cursor-pointer"
                      >
                        Save Both Addresses
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-800">Current Residential Address (Active Delivery)</span>
                        <span className="font-mono text-[11px] text-slate-500">Beat {customer.beatNo || '2'}</span>
                      </div>
                      <div><strong>House Number:</strong> {customer.residentialAddress?.houseNo || customer.address?.houseNumber || customer.houseNo || 'N/A'}</div>
                      <div><strong>Street / Lane:</strong> {customer.residentialAddress?.street || customer.address?.street || customer.street || 'Main Colony Road'}</div>
                      <div><strong>Landmark:</strong> {customer.residentialAddress?.landmark || customer.address?.landmark || customer.landmark || 'Near Sector Park / Temple'}</div>
                      <div><strong>Colony / Sector:</strong> {customer.residentialAddress?.sectorLocality || customer.sector || customer.area || 'Keshavpura'}</div>
                      <div><strong>Pincode:</strong> <span className="font-mono">{customer.residentialAddress?.pincode || customer.address?.pincode || '324009'}</span></div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Permanent / Native Address</span>
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          {customer.sameAsResidential === false ? 'Separate Permanent Address' : 'Same as Residential'}
                        </span>
                      </div>
                      <div><strong>House Number:</strong> {customer.permanentAddress?.houseNo || customer.residentialAddress?.houseNo || customer.houseNo || 'N/A'}</div>
                      <div><strong>Street / Lane:</strong> {customer.permanentAddress?.street || customer.residentialAddress?.street || customer.street || 'Main Colony Road'}</div>
                      <div><strong>Landmark:</strong> {customer.permanentAddress?.landmark || customer.residentialAddress?.landmark || customer.landmark || 'Near Sector Park / Temple'}</div>
                      <div><strong>Colony / Sector:</strong> {customer.permanentAddress?.sectorLocality || customer.sector || customer.area || 'Keshavpura'}</div>
                      <div><strong>Pincode:</strong> <span className="font-mono">{customer.permanentAddress?.pincode || customer.address?.pincode || '324009'}</span></div>
                    </div>
                  </div>
                )}
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
                <button
                  type="button"
                  onClick={handleCreateLeadClick}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Create New Lead</span>
                </button>
                <button
                  type="button"
                  onClick={handleScheduleFollowUpClick}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Calendar size={15} />
                  <span>Schedule Follow-Up</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(true)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Attach Postal Product</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'relocation' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <ArrowRightLeft size={16} className="text-red-700" />
                    <span>Shifted / Relocation History & Mail Redirection Tracker</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track household address changes across beats and sub-offices to ensure uninterrupted mail, passbook, and scheme communication.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRelocationForm(!showRelocationForm)}
                  className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>{showRelocationForm ? 'Close Relocation Form' : 'Record New Relocation / Address Shift'}</span>
                </button>
              </div>

              {showRelocationForm && (
                <form
                  onSubmit={handleRecordRelocationSubmit}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs"
                >
                  <div className="font-bold text-slate-900">
                    New Shifted / Relocated Address Details (Updates Active Delivery Route & Preserves Permanent History)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">New House / Plot No. *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2F-20"
                        value={shiftHouseNo}
                        onChange={(e) => setShiftHouseNo(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">New Street / Road *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dispensary Road"
                        value={shiftStreet}
                        onChange={(e) => setShiftStreet(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">New Landmark *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Near Central Park"
                        value={shiftLandmark}
                        onChange={(e) => setShiftLandmark(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">New Colony / Sector *</label>
                      <input
                        type="text"
                        required
                        value={shiftColony}
                        onChange={(e) => setShiftColony(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">New Pincode *</label>
                      <input
                        type="text"
                        required
                        value={shiftPincode}
                        onChange={(e) => setShiftPincode(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">New Delivery Beat</label>
                      <select
                        value={shiftBeatNo}
                        onChange={(e) => setShiftBeatNo(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold"
                      >
                        {Array.from({ length: 33 }, (_, i) => String(i + 1)).map((b) => (
                          <option key={b} value={b}>
                            Beat {b}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Relocation Reason</label>
                      <select
                        value={shiftReason}
                        onChange={(e) => setShiftReason(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="Tenant Shifted">Tenant Shifted</option>
                        <option value="Own House Purchased">Own House Purchased</option>
                        <option value="Job / Service Transfer">Job / Service Transfer</option>
                        <option value="Family Relocation">Family Relocation</option>
                        <option value="Marriage / Joint Family">Marriage / Joint Family</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                    <input
                      type="text"
                      placeholder="Field verification remarks (e.g. Neighbour confirmed new address)"
                      value={shiftRemarks}
                      onChange={(e) => setShiftRemarks(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <label className="inline-flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shiftRedirection}
                          onChange={(e) => setShiftRedirection(e.target.checked)}
                          className="rounded border-slate-300 text-red-700"
                        />
                        <span>Enable Mail & Passbook Redirection</span>
                      </label>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer"
                      >
                        Save Relocation
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {customer.relocationHistory && customer.relocationHistory.length > 0 ? (
                <div className="space-y-3">
                  {customer.relocationHistory.map((rel) => (
                    <div
                      key={rel.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-bold text-slate-900">
                          Shifted Date: <span className="font-mono">{rel.shiftedDate}</span> · Reason:{' '}
                          <span className="text-red-800">{rel.reason}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-800">
                          {rel.redirectionActive ? '✓ Mail Redirection Active' : 'Redirection Closed'} · Recorded by {rel.recordedBy}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 bg-white border border-slate-200 rounded-lg">
                          <div className="text-[10px] font-bold text-slate-500 uppercase">
                            Previous Address (Beat {rel.previousBeatNo || '2'})
                          </div>
                          <div className="text-slate-800 font-medium mt-0.5">{rel.previousAddress}</div>
                        </div>
                        <div className="p-3 bg-white border border-emerald-200 rounded-lg">
                          <div className="text-[10px] font-bold text-emerald-700 uppercase">
                            New Shifted Address (Beat {rel.newBeatNo})
                          </div>
                          <div className="text-slate-900 font-bold mt-0.5">{rel.newAddress}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            House: {rel.newHouseNo} · Street: {rel.newStreet} · Landmark: {rel.newLandmark}
                          </div>
                        </div>
                      </div>
                      {rel.remarks && (
                        <div className="text-slate-600 text-[11px]">Remarks: {rel.remarks}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs space-y-2">
                  <div className="font-semibold text-slate-700">
                    No Relocation / Address Shift Recorded Yet
                  </div>
                  <p>
                    If this customer or tenant has shifted to a new house, street, or colony, click &quot;Record New Relocation / Address Shift&quot; above to log the new address while preserving their permanent record.
                  </p>
                </div>
              )}
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
                <button
                  type="button"
                  onClick={handleCreateLeadClick}
                  className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> New Lead
                </button>
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
                <button
                  type="button"
                  onClick={handleScheduleFollowUpClick}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Schedule Follow-up
                </button>
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
