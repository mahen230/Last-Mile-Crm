import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  MapPin,
  Phone,
  User,
  Database,
  FileText,
  Fuel,
  Lock,
  ArrowRight,
  Save,
  Check,
  AlertCircle,
  History,
  Tag,
  ExternalLink,
} from 'lucide-react';
import {
  masterDataService,
  IngestedMasterRecord,
  IngestionVerificationStage,
} from '../../services/masterDataService';
import { ALL_33_BEATS_FUEL_DATA, getBeatFuelMapping } from '../../data/beatFuelData';

interface MasterVerificationDrawerProps {
  record: IngestedMasterRecord | null;
  isOpen: boolean;
  onClose: () => void;
  currentStaff: any;
  onRecordUpdated?: (updated: IngestedMasterRecord) => void;
}

export default function MasterVerificationDrawer({
  record,
  isOpen,
  onClose,
  currentStaff,
  onRecordUpdated,
}: MasterVerificationDrawerProps) {
  if (!isOpen || !record) return null;

  // Local editable state
  const [name, setName] = useState(record.name);
  const [mobile, setMobile] = useState(record.mobile);
  const [householdType, setHouseholdType] = useState(record.householdType);
  const [financialInterest, setFinancialInterest] = useState(record.financialInterest || 'General Delivery');
  
  const [areaColony, setAreaColony] = useState(record.areaColony);
  const [sector, setSector] = useState(record.sector);
  const [block, setBlock] = useState(record.block || 'N/A');
  const [isBlockNotApplicable, setIsBlockNotApplicable] = useState(!!record.isBlockNotApplicable);
  const [isSectorNotApplicable, setIsSectorNotApplicable] = useState(!!record.isSectorNotApplicable);
  const [houseNo, setHouseNo] = useState(record.houseNo);
  const [splitSequence, setSplitSequence] = useState(record.splitSequence || 'Standard');
  const [pincode, setPincode] = useState(record.pincode || '324009');
  const [beatNo, setBeatNo] = useState(record.beatNo);
  const [verificationNotes, setVerificationNotes] = useState(record.verificationNotes || '');

  // UI feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state whenever record prop changes
  useEffect(() => {
    if (record) {
      setName(record.name);
      setMobile(record.mobile);
      setHouseholdType(record.householdType);
      setFinancialInterest(record.financialInterest || 'General Delivery');
      setAreaColony(record.areaColony);
      setSector(record.sector);
      setBlock(record.block || 'N/A');
      setIsBlockNotApplicable(!!record.isBlockNotApplicable);
      setIsSectorNotApplicable(!!record.isSectorNotApplicable);
      setHouseNo(record.houseNo);
      setSplitSequence(record.splitSequence || 'Standard');
      setPincode(record.pincode || '324009');
      setBeatNo(record.beatNo);
      setVerificationNotes(record.verificationNotes || '');
      setActionSuccess(null);
      setActionError(null);
    }
  }, [record]);

  // Derived role checks
  const staffRole = currentStaff?.role || 'POSTMAN';
  const staffName = currentStaff?.name || 'Postal Staff';
  const staffId = currentStaff?.employeeId || currentStaff?.id || '50457421';
  const isSuperAdmin = staffRole === 'SUPER_ADMIN' || currentStaff?.email === 'mahen.comtech@gmail.com';
  const isSpm = isSuperAdmin || staffRole === 'ADMIN' || (currentStaff?.designation && currentStaff.designation.includes('SPM'));
  const isPostalAssistant = isSuperAdmin || staffRole === 'PA' || (currentStaff?.designation && currentStaff.designation.includes('Postal Assistant'));
  const isBeatStaff = staffRole === 'POSTMAN' || staffRole === 'GDS' || staffRole === 'STAFF';

  // Computed full address preview
  const computedFullAddress = (() => {
    const parts = [];
    if (houseNo) parts.push(`H.No. ${houseNo}`);
    if (!isBlockNotApplicable && block && block !== 'N/A') parts.push(`Block ${block}`);
    if (!isSectorNotApplicable && sector && sector !== 'N/A') parts.push(`Sector ${sector}`);
    if (areaColony) parts.push(areaColony);
    parts.push(`Kota - ${pincode || '324009'}`);
    return parts.join(', ');
  })();

  // Duplicate check
  const dupCheck = masterDataService.checkDuplicate(mobile, name, houseNo, areaColony);

  // Handle Split Sequence change (e.g. selecting '/B' when houseNo is '191' produces '191/B')
  const handleSplitSequenceChange = (seq: string) => {
    setSplitSequence(seq);
    if (seq === 'Standard' || seq === 'Main' || !seq) {
      if (houseNo.includes('/')) {
        setHouseNo(houseNo.split('/')[0]);
      }
    } else {
      const base = houseNo.includes('/') ? houseNo.split('/')[0] : houseNo;
      setHouseNo(`${base}/${seq}`);
    }
  };

  // Save in-flight edits without advancing stage
  const handleSaveEdits = () => {
    setIsSaving(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const updated = masterDataService.updateIngestedRecord(
        record.id,
        {
          name,
          mobile,
          householdType,
          financialInterest,
          areaColony,
          sector: isSectorNotApplicable ? 'N/A' : sector,
          block: isBlockNotApplicable ? 'N/A' : block,
          isBlockNotApplicable,
          isSectorNotApplicable,
          houseNo,
          splitSequence,
          pincode,
          beatNo,
          fullAddress: computedFullAddress,
        },
        staffName,
        staffId,
        staffRole,
        verificationNotes
      );
      setActionSuccess('Record attributes successfully saved.');
      if (onRecordUpdated) onRecordUpdated(updated);
    } catch (err: any) {
      setActionError(err.message || 'Failed to save edits.');
    } finally {
      setIsSaving(false);
    }
  };

  // Stage B Sign-off: Contact & Identity
  const handleVerifyContactStageB = () => {
    setIsSaving(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const updated = masterDataService.verifyContactStageB(
        record.id,
        staffName,
        staffId,
        staffRole,
        {
          name,
          mobile,
          householdType,
          financialInterest,
        },
        verificationNotes || 'Field Staff completed physical contact & identity verification.'
      );
      setActionSuccess('✓ Stage B Verified: Contact & Identity signed off. Record advanced to Property Matrix check.');
      if (onRecordUpdated) onRecordUpdated(updated);
    } catch (err: any) {
      setActionError(err.message || 'Failed to sign off Stage B.');
    } finally {
      setIsSaving(false);
    }
  };

  // Stage C Sign-off: Property & Locality Matrix
  const handleVerifyPropertyStageC = () => {
    setIsSaving(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const updated = masterDataService.verifyPropertyStageC(
        record.id,
        staffName,
        staffId,
        staffRole,
        {
          areaColony,
          sector: isSectorNotApplicable ? 'N/A' : sector,
          block: isBlockNotApplicable ? 'N/A' : block,
          isBlockNotApplicable,
          isSectorNotApplicable,
          houseNo,
          splitSequence,
          pincode,
          beatNo,
          fullAddress: computedFullAddress,
        },
        verificationNotes || 'Property locality matrix, split house numbering, and pincode verified.'
      );
      setActionSuccess('✓ Stage C Verified: Property & Locality Matrix confirmed. Ready for SPM Supervisory Stage D Audit.');
      if (onRecordUpdated) onRecordUpdated(updated);
    } catch (err: any) {
      setActionError(err.message || 'Failed to sign off Stage C.');
    } finally {
      setIsSaving(false);
    }
  };

  // Stage D Final Sign-off: Supervisory Audit & Live Database Sync
  const handleApproveAndSyncStageD = () => {
    if (!isSpm && !isSuperAdmin) {
      setActionError('Authorization Required: Stage D final synchronization requires Sub-Postmaster (SPM) or Super Admin credentials.');
      return;
    }
    setIsSaving(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = masterDataService.approveAndSyncStageD(
        record.id,
        staffName,
        staffId,
        staffRole,
        verificationNotes || `Supervisory audit completed by ${staffName}. Synced to official live database.`
      );
      setActionSuccess(`★ Stage D Complete: ${res.message}`);
      if (onRecordUpdated) onRecordUpdated(res.record);
    } catch (err: any) {
      setActionError(err.message || 'Failed to approve and sync Stage D.');
    } finally {
      setIsSaving(false);
    }
  };

  // Step state indicators
  const isStageAComplete = true; // Ingested
  const isStageBComplete =
    record.verificationStage === 'CONTACT_VERIFIED' ||
    record.verificationStage === 'PROPERTY_VERIFIED' ||
    record.verificationStage === 'FULLY_SYNCED';
  const isStageCComplete =
    record.verificationStage === 'PROPERTY_VERIFIED' ||
    record.verificationStage === 'FULLY_SYNCED';
  const isStageDComplete = record.verificationStage === 'FULLY_SYNCED';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-red-950 text-white flex items-center justify-between border-b border-red-900/50 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-900/80 text-amber-300 border border-red-700/60">
                {record.id}
              </span>
              <span className="text-xs text-slate-300 font-mono">Batch: {record.batchId}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-amber-400 font-bold">{record.beatNo}</span>
            </div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{record.name}</span>
            </h2>
            <div className="text-[11px] text-slate-300 flex items-center gap-2">
              <span>Source: {record.fileName}</span>
              <span>·</span>
              <span>Uploaded by {record.uploadedBy}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close Drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* 4-Stage Sequential Visual Stepper Banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center justify-between">
            <span>4-Stage Granular Verification Gate (Zero-Error Governance)</span>
            <span className="font-mono font-bold text-slate-800">
              {record.verificationStage === 'PENDING_STAFF_VERIFICATION' && 'Stage A: Pending Staff Check'}
              {record.verificationStage === 'CONTACT_VERIFIED' && 'Stage B: Contact Verified'}
              {record.verificationStage === 'PROPERTY_VERIFIED' && 'Stage C: Property Verified'}
              {record.verificationStage === 'FULLY_SYNCED' && 'Stage D: Fully Synced & Unlocked'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {/* Stage A */}
            <div className={`p-2.5 rounded-xl border text-xs transition ${isStageAComplete ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>Stage A</span>
              </div>
              <div className="text-[10px] text-slate-600 font-medium">Ingestion & Routing</div>
              <div className="text-[9px] text-slate-400 mt-0.5 truncate">Auto-assigned</div>
            </div>

            {/* Stage B */}
            <div className={`p-2.5 rounded-xl border text-xs transition ${isStageBComplete ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : record.verificationStage === 'PENDING_STAFF_VERIFICATION' ? 'bg-amber-50 border-amber-300 text-amber-950 ring-1 ring-amber-300' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {isStageBComplete ? (
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                ) : (
                  <Clock size={13} className="text-amber-600 shrink-0 animate-pulse" />
                )}
                <span>Stage B</span>
              </div>
              <div className="text-[10px] text-slate-600 font-medium">Contact & Identity</div>
              <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                {record.stageBVerifiedBy ? `✓ ${record.stageBVerifiedBy}` : 'Postman Check'}
              </div>
            </div>

            {/* Stage C */}
            <div className={`p-2.5 rounded-xl border text-xs transition ${isStageCComplete ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : record.verificationStage === 'CONTACT_VERIFIED' ? 'bg-amber-50 border-amber-300 text-amber-950 ring-1 ring-amber-300' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {isStageCComplete ? (
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                ) : (
                  <Building2 size={13} className={record.verificationStage === 'CONTACT_VERIFIED' ? 'text-amber-600 animate-pulse' : 'text-slate-400'} />
                )}
                <span>Stage C</span>
              </div>
              <div className="text-[10px] text-slate-600 font-medium">Property Matrix</div>
              <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                {record.stageCVerifiedBy ? `✓ ${record.stageCVerifiedBy}` : 'Address & Block'}
              </div>
            </div>

            {/* Stage D */}
            <div className={`p-2.5 rounded-xl border text-xs transition ${isStageDComplete ? 'bg-emerald-50 border-emerald-200 text-emerald-900 ring-1 ring-emerald-300' : record.verificationStage === 'PROPERTY_VERIFIED' ? 'bg-purple-50 border-purple-300 text-purple-950 ring-1 ring-purple-300' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {isStageDComplete ? (
                  <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                ) : (
                  <Lock size={13} className={record.verificationStage === 'PROPERTY_VERIFIED' ? 'text-purple-600' : 'text-slate-400'} />
                )}
                <span>Stage D</span>
              </div>
              <div className="text-[10px] text-slate-600 font-medium">SPM Live Sync</div>
              <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                {record.stageDApprovedBy ? `✓ ${record.stageDApprovedBy}` : 'ACG-61 Locked'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Feedback Alerts */}
        {actionSuccess && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button type="button" onClick={() => setActionSuccess(null)} className="text-emerald-700 font-bold">✕</button>
          </div>
        )}

        {actionError && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button type="button" onClick={() => setActionError(null)} className="text-red-700 font-bold">✕</button>
          </div>
        )}

        {/* Duplicate Warning Alert */}
        {dupCheck.isDuplicate && (
          <div className="mx-5 mt-4 p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs rounded-xl flex items-start gap-2 animate-fadeIn">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Duplicate / Existing Record Detected:</div>
              <div className="text-[11px] text-amber-800 mt-0.5">{dupCheck.reason}</div>
            </div>
          </div>
        )}

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* SECTION 1: STAGE B - CONTACT & IDENTITY VALIDATION */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <User size={16} className="text-red-700" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Stage B Attributes: Contact & Citizen Identity
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isStageBComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {isStageBComplete ? 'Contact Verified' : 'Pending Field Check'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Full Customer / Citizen Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                  placeholder="e.g. Shri Rameshwar Dayal Meena"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Mobile Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                  placeholder="e.g. 9829012345"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Household / Entity Type
                </label>
                <select
                  value={householdType}
                  onChange={(e) => setHouseholdType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                >
                  <option value="Residential">Residential Household</option>
                  <option value="Commercial">Commercial / Shop / Market</option>
                  <option value="Government">Government / Institutional</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Financial Scheme / Interest
                </label>
                <input
                  type="text"
                  value={financialInterest}
                  onChange={(e) => setFinancialInterest(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                  placeholder="e.g. Sukanya Samriddhi Account (SSA)"
                />
              </div>
            </div>

            {record.stageBVerifiedBy && (
              <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
                <span>Verified by: <strong className="text-slate-700">{record.stageBVerifiedBy}</strong> ({record.stageBVerifiedById})</span>
                <span>{record.stageBVerifiedAt ? new Date(record.stageBVerifiedAt).toLocaleDateString() : ''}</span>
              </div>
            )}
          </div>

          {/* SECTION 2: STAGE C - PROPERTY & LOCALITY MATRIX */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-red-700" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Stage C Attributes: Property & Locality Matrix
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isStageCComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                {isStageCComplete ? 'Property Verified' : 'Awaiting Address Check'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Colony / Locality *
                </label>
                <input
                  type="text"
                  value={areaColony}
                  onChange={(e) => setAreaColony(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                  placeholder="e.g. Keshavpura, Santoshi Nagar, Dadabari"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Assigned Beat Number
                </label>
                <select
                  value={beatNo}
                  onChange={(e) => setBeatNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                >
                  {ALL_33_BEATS_FUEL_DATA.map((b) => (
                    <option key={b.beatNumber} value={b.beatNumber}>
                      {b.beatNumber} — {b.territorialCoverage.slice(0, 32)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Sector with Conditional Auto-Disable */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`text-xs font-semibold ${isSectorNotApplicable ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    Sector Number
                  </label>
                  <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSectorNotApplicable}
                      onChange={(e) => {
                        setIsSectorNotApplicable(e.target.checked);
                        if (e.target.checked) setSector('N/A');
                        else if (sector === 'N/A') setSector('7');
                      }}
                      className="rounded text-red-600"
                    />
                    <span>Not Applicable</span>
                  </label>
                </div>
                <input
                  type="text"
                  disabled={isSectorNotApplicable}
                  value={isSectorNotApplicable ? 'N/A' : sector}
                  onChange={(e) => setSector(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-xs ${isSectorNotApplicable ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-none'}`}
                  placeholder="e.g. 7"
                />
              </div>

              {/* Block with Conditional Auto-Disable */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`text-xs font-semibold ${isBlockNotApplicable ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    Block Name / Number
                  </label>
                  <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBlockNotApplicable}
                      onChange={(e) => {
                        setIsBlockNotApplicable(e.target.checked);
                        if (e.target.checked) setBlock('N/A');
                        else if (block === 'N/A') setBlock('A');
                      }}
                      className="rounded text-red-600"
                    />
                    <span>Not Applicable</span>
                  </label>
                </div>
                <input
                  type="text"
                  disabled={isBlockNotApplicable}
                  value={isBlockNotApplicable ? 'N/A' : block}
                  onChange={(e) => setBlock(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-xs ${isBlockNotApplicable ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-none'}`}
                  placeholder="e.g. B or N/A"
                />
              </div>

              {/* House Number with Split Sequence Formatter */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  House / Plot Number *
                </label>
                <input
                  type="text"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-none"
                  placeholder="e.g. 191 or 191/A"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Split Sequence Selector (e.g. 191, 191/A, 191/B)
                </label>
                <select
                  value={splitSequence}
                  onChange={(e) => handleSplitSequenceChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-none font-medium"
                >
                  <option value="Standard">Standard (Main Property)</option>
                  <option value="A">Split Portion /A (e.g. 191/A)</option>
                  <option value="B">Split Portion /B (e.g. 191/B)</option>
                  <option value="C">Split Portion /C (e.g. 191/C)</option>
                  <option value="D">Split Portion /D (e.g. 191/D)</option>
                  <option value="1">Floor /1 (First Floor)</option>
                  <option value="2">Floor /2 (Second Floor)</option>
                </select>
              </div>
            </div>

            {/* Standardized Full Address Preview Box */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Standardized Delivery Address Preview (Auto-Constructed):
              </div>
              <div className="text-xs font-mono font-semibold text-slate-800">
                {computedFullAddress}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5">
                <span>Pincode: <strong>{pincode}</strong> (Dadabari S.O. Delivery Jurisdiction)</span>
              </div>
            </div>

            {record.stageCVerifiedBy && (
              <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
                <span>Property verified by: <strong className="text-slate-700">{record.stageCVerifiedBy}</strong></span>
                <span>{record.stageCVerifiedAt ? new Date(record.stageCVerifiedAt).toLocaleDateString() : ''}</span>
              </div>
            )}
          </div>

          {/* SECTION 3: DSS ARTICLE COUNTS & STRICT TOTAL LOCK (IF APPLICABLE) */}
          {record.dssData && (
            <div className="p-4 bg-red-950/10 rounded-xl border border-red-200/80 space-y-3">
              <div className="flex items-center justify-between border-b border-red-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-red-700" />
                  <span className="text-xs font-bold text-red-950 uppercase tracking-wider">
                    Official Daily Summary Sheet (DSS) Article Breakdown
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded">
                  <Lock size={12} />
                  <span>Strict Total Lock Rule</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
                <div className="p-2 bg-white rounded-lg border border-red-100">
                  <div className="text-[10px] text-slate-500 font-semibold">Speed Post Delivered</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">{record.dssData.speedPostDelivered}</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-red-100">
                  <div className="text-[10px] text-slate-500 font-semibold">Registered Letters</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">{record.dssData.registryDelivered}</div>
                </div>
                <div className="p-2 bg-white rounded-lg border border-red-100">
                  <div className="text-[10px] text-slate-500 font-semibold">Parcels & VPP</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">{record.dssData.parcelDelivered}</div>
                </div>
                <div className="p-2 bg-red-900 text-white rounded-lg border border-red-900">
                  <div className="text-[10px] text-red-200 font-semibold">Total Articles (Locked)</div>
                  <div className="text-base font-black text-amber-300 mt-0.5">{record.dssData.totalArticlesLocked}</div>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-red-100 text-[11px] text-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span>DSS Log Date: <strong>{record.dssData.date}</strong></span>
                  <span>COD Cash: <strong>₹{record.dssData.codAmountCollected.toLocaleString('en-IN')}</strong></span>
                  <span>Duty: <strong className="text-emerald-700">{record.dssData.attendanceStatus}</strong></span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  Audit Protection: Individual category counts are verified against field PMA sync, but Total Articles Count (<strong>{record.dssData.totalArticlesLocked}</strong>) is strictly locked against the official admin DSS sheet to protect financial audit integrity.
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: VERIFICATION NOTES & OBSERVATIONS */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Verification Notes & Staff Remarks
            </label>
            <textarea
              rows={3}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:outline-none"
              placeholder="Add field observations, resident door check details, or correction rationale..."
            />
          </div>

          {/* SECTION 5: IMMUTABLE AUDIT TRAIL LEDGER */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <History size={16} className="text-slate-700" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Chronological Verification Audit Trail ({record.auditTrail?.length || 0} Steps)
              </span>
            </div>

            <div className="space-y-2">
              {record.auditTrail && record.auditTrail.length > 0 ? (
                record.auditTrail.map((step, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-600 shrink-0" />
                        <span>{step.action}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(step.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 flex items-center justify-between">
                      <span>Operator: <strong>{step.performedBy}</strong> ({step.performedByRole})</span>
                      {step.notes && <span className="text-slate-500 italic max-w-xs truncate">{step.notes}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic">No previous audit logs recorded.</div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Action Bar (Bottom Sticky) */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveEdits}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              title="Save changes without advancing verification stage"
            >
              <Save size={14} />
              <span>Save In-Progress Edits</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Stage B Action Button */}
            {record.verificationStage === 'PENDING_STAFF_VERIFICATION' && (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleVerifyContactStageB}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Check size={15} />
                <span>Verify Contact & Identity (Stage B)</span>
              </button>
            )}

            {/* Stage C Action Button */}
            {record.verificationStage === 'CONTACT_VERIFIED' && (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleVerifyPropertyStageC}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Building2 size={15} />
                <span>Verify Property & Locality (Stage C)</span>
              </button>
            )}

            {/* Stage D Action Button (Supervisory Final Sync) */}
            {record.verificationStage === 'PROPERTY_VERIFIED' && (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleApproveAndSyncStageD}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                title={isSpm || isSuperAdmin ? 'Supervisory sign-off and write to live master tables' : 'Requires Sub-Postmaster or Super Admin permission'}
              >
                <ShieldCheck size={16} />
                <span>Approve & Sync to Live Database (Stage D)</span>
              </button>
            )}

            {/* Fully Synced Status Badge */}
            {record.verificationStage === 'FULLY_SYNCED' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold">
                <CheckCircle2 size={15} className="text-emerald-700" />
                <span>Fully Synced & ACG-61 Fuel Bill Unlocked</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
