import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowRight,
  ShieldCheck,
  Upload,
  Plus,
  Trash2,
  Navigation,
  Sparkles,
  Building2,
  Phone,
  UserCheck,
  Layers,
  X,
  RefreshCw,
  SlidersHorizontal,
  FileCheck,
  Check,
  AlertCircle,
  HelpCircle,
  Activity,
  FileText,
  Clock,
  Zap,
  ChevronRight,
  Edit3
} from 'lucide-react';
import { 
  Customer, 
  ColonyBeatMapping, 
  Address_Exceptions, 
  AddressDiscrepancyType, 
  AddressExceptionSeverity, 
  AddressExceptionStatus,
  AddressCorrectionSuggestion 
} from '../../types/models';
import { customerService } from '../../services/customerService';
import { staffPermissionService } from '../../services/staffPermissionService';
import { 
  addressVerificationService, 
  AddressVerificationResult 
} from '../../services/addressVerificationService';
import CustomerProfileModal from '../customers/CustomerProfileModal';
import BulkAddressImport from './BulkAddressImport';
import { resolveAddressToConsolidatedBeat } from '../../data/consolidatedBeatMatrix';
import { OFFICIAL_MAJOR_COLONIES, COLONY_HIERARCHY_MAP } from '../../data/colonyHierarchyData';

export default function AddressResolutionView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [colonyMappings, setColonyMappings] = useState<ColonyBeatMapping[]>([]);
  const [exceptions, setExceptions] = useState<Address_Exceptions[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'EXCEPTIONS_QUEUE' | 'AI_ANALYZER' | 'COLONY_DIRECTORY' | 'BATCH_AUDIT'>('EXCEPTIONS_QUEUE');

  // Address_Exceptions Filters
  const [exceptionStatusFilter, setExceptionStatusFilter] = useState<AddressExceptionStatus | 'ALL'>('PENDING_REVIEW');
  const [exceptionSeverityFilter, setExceptionSeverityFilter] = useState<AddressExceptionSeverity | 'ALL'>('ALL');
  const [exceptionBeatFilter, setExceptionBeatFilter] = useState<string>('ALL');
  const [exceptionSearchTerm, setExceptionSearchTerm] = useState('');

  // Selected Exception for Detail Modal / Manual Review
  const [selectedExceptionForReview, setSelectedExceptionForReview] = useState<Address_Exceptions | null>(null);
  const [manualReviewNotes, setManualReviewNotes] = useState('');
  const [editHouseNo, setEditHouseNo] = useState('');
  const [editColony, setEditColony] = useState('');
  const [editSector, setEditSector] = useState('');
  const [editLandmark, setEditLandmark] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editBeatNo, setEditBeatNo] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Live AI Address Analyzer State
  const [analyzerHouseNo, setAnalyzerHouseNo] = useState('Plot 45');
  const [analyzerColony, setAnalyzerColony] = useState('Keshavpura');
  const [analyzerSector, setAnalyzerSector] = useState('Sector 7');
  const [analyzerLandmark, setAnalyzerLandmark] = useState('Near Tejaji Mandir');
  const [analyzerPincode, setAnalyzerPincode] = useState('324005'); // intentionally flawed for instant demo
  const [analyzerBeatNo, setAnalyzerBeatNo] = useState('Beat 5'); // intentionally flawed
  const [analyzerRawText, setAnalyzerRawText] = useState('Plot 45, Near Tejaji Mandir, Keshavpura Sector 7, Kota 324005');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AddressVerificationResult | null>(null);

  // Batch Audit State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    totalAudited: number;
    passedClean: number;
    exceptionsCreated: number;
    averageScore: number;
  } | null>(null);

  // Structured Colony-Beat Mapping Modal State
  const [showAddColonyModal, setShowAddColonyModal] = useState(false);
  const [colonyName, setColonyName] = useState('');
  const [sectorOrPhase, setSectorOrPhase] = useState('');
  const [landmark, setLandmark] = useState('');
  const [areaPincode, setAreaPincode] = useState('324009');
  const [subOrHeadOffice, setSubOrHeadOffice] = useState('Dadabari SO');
  const [branchOffice, setBranchOffice] = useState('');
  const [assignedBeatNumber, setAssignedBeatNumber] = useState('Beat 2');
  const [assignedPostmanName, setAssignedPostmanName] = useState('Mahendra Kumar Meena');
  const [assignedPostmanMobile, setAssignedPostmanMobile] = useState('8769706002');
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [searchMappingTerm, setSearchMappingTerm] = useState('');

  const refreshAll = () => {
    setCustomers([...customerService.getCustomers()]);
    setColonyMappings([...staffPermissionService.getColonyBeatMappings()]);
    setExceptions([...addressVerificationService.getAllExceptions()]);
  };

  useEffect(() => {
    refreshAll();
    const unsubCust = customerService.subscribe(refreshAll);
    const unsubStaff = staffPermissionService.subscribe(refreshAll);
    const unsubExceptions = addressVerificationService.subscribe(refreshAll);
    return () => {
      unsubCust();
      unsubStaff();
      unsubExceptions();
    };
  }, []);

  // Filtered exceptions list
  const filteredExceptions = useMemo(() => {
    return addressVerificationService.getAllExceptions({
      status: exceptionStatusFilter,
      severity: exceptionSeverityFilter,
      beatNo: exceptionBeatFilter,
      searchTerm: exceptionSearchTerm,
    });
  }, [exceptions, exceptionStatusFilter, exceptionSeverityFilter, exceptionBeatFilter, exceptionSearchTerm]);

  // Overall Statistics for Address Exceptions
  const exceptionStats = useMemo(() => {
    return addressVerificationService.getExceptionStats();
  }, [exceptions]);

  // Filtered colony mappings
  const filteredMappings = useMemo(() => {
    if (!searchMappingTerm.trim()) return colonyMappings;
    const q = searchMappingTerm.toLowerCase();
    return colonyMappings.filter(
      (m) =>
        m.colonyName.toLowerCase().includes(q) ||
        (m.sectorOrPhase || '').toLowerCase().includes(q) ||
        (m.landmark || '').toLowerCase().includes(q) ||
        m.areaPincode.includes(q) ||
        m.subOrHeadOffice.toLowerCase().includes(q) ||
        m.assignedBeatNumber.toLowerCase().includes(q) ||
        (m.assignedPostmanName || '').toLowerCase().includes(q)
    );
  }, [colonyMappings, searchMappingTerm]);

  // Run Live Address Analysis
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await addressVerificationService.verifyAddress({
        houseNo: analyzerHouseNo,
        colony: analyzerColony,
        sector: analyzerSector,
        landmark: analyzerLandmark,
        pincode: analyzerPincode,
        beatNo: analyzerBeatNo,
        rawInput: analyzerRawText,
        source: 'MANUAL_ENTRY',
      });
      setAnalysisResult(result);
    } catch (err) {
      console.error('Error during address verification analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Open review modal with pre-populated values
  const handleOpenReviewModal = (exc: Address_Exceptions) => {
    setSelectedExceptionForReview(exc);
    setManualReviewNotes(exc.manualReviewNotes || '');
    setEditHouseNo(exc.suggestedCorrection.correctedHouseNo || exc.originalAddress.houseNo || '');
    setEditColony(exc.suggestedCorrection.correctedColony || exc.originalAddress.colony || '');
    setEditSector(exc.suggestedCorrection.correctedSector || exc.originalAddress.sector || '');
    setEditLandmark(exc.suggestedCorrection.correctedLandmark || exc.originalAddress.landmark || '');
    setEditPincode(exc.suggestedCorrection.correctedPincode || exc.originalAddress.pincode || '');
    setEditBeatNo(exc.suggestedCorrection.correctedBeatNo || exc.originalAddress.beatNo || '');
  };

  // Quick 1-Click Resolve with Suggestion
  const handleQuickResolve = (excId: string) => {
    const res = addressVerificationService.resolveException(
      excId,
      'APPLY_SUGGESTION',
      undefined,
      'Approved via 1-Click AI Auto-Standardization',
      'Staff Auditor'
    );
    if (res.success) {
      setBannerNotice(res.message);
      setTimeout(() => setBannerNotice(null), 4000);
    }
  };

  // Commit Manual Review Modal Edits
  const handleCommitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExceptionForReview) return;
    setIsResolving(true);

    const customChanges: Partial<AddressCorrectionSuggestion> = {
      correctedHouseNo: editHouseNo.trim(),
      correctedColony: editColony.trim(),
      correctedSector: editSector.trim(),
      correctedLandmark: editLandmark.trim(),
      correctedPincode: editPincode.trim(),
      correctedBeatNo: editBeatNo.trim(),
      correctedFullAddress: `${editHouseNo.trim()}, ${editSector.trim()}, ${editColony.trim()}${
        editLandmark ? ` (Near ${editLandmark.trim()})` : ''
      }, Dadabari S.O. - ${editPincode.trim()}`,
    };

    const res = addressVerificationService.resolveException(
      selectedExceptionForReview.id,
      'MANUAL_CORRECTION',
      customChanges,
      manualReviewNotes,
      'Staff Auditor'
    );

    setIsResolving(false);
    setSelectedExceptionForReview(null);
    if (res.success) {
      setBannerNotice(res.message);
      setTimeout(() => setBannerNotice(null), 4000);
    }
  };

  // Reject / Dismiss Exception
  const handleRejectException = (excId: string) => {
    const reason = window.prompt('Enter reason for dismissing this address exception:', 'Verified manually in field; exception not applicable');
    if (reason !== null) {
      const res = addressVerificationService.rejectException(excId, reason, 'Staff Auditor');
      if (res.success) {
        setBannerNotice(res.message);
        setTimeout(() => setBannerNotice(null), 4000);
      }
    }
  };

  // Auto-Fix High Confidence
  const handleAutoFixHighConfidence = () => {
    const res = addressVerificationService.autoFixAllHighConfidence(0.90, 'Mahendra Kumar Meena (System Admin)');
    setBannerNotice(`Auto-Standardized ${res.count} high-confidence address exceptions instantly!`);
    setTimeout(() => setBannerNotice(null), 5000);
  };

  // Run Batch Postal Audit
  const handleRunBatchAudit = async () => {
    setIsAuditing(true);
    try {
      const result = await addressVerificationService.batchAuditAllCustomers();
      setAuditResult(result);
      setBannerNotice(
        `Batch Audit Completed: ${result.totalAudited} records checked. ${result.passedClean} verified clean. ${result.exceptionsCreated} flagged for review.`
      );
      setTimeout(() => setBannerNotice(null), 6000);
    } catch (err) {
      console.error('Batch audit error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  // Save new Colony-Beat mapping
  const handleSaveColonyMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colonyName.trim() || !assignedBeatNumber.trim()) return;

    const saved = staffPermissionService.addOrUpdateColonyMapping({
      colonyName: colonyName.trim(),
      sectorOrPhase: sectorOrPhase.trim() || undefined,
      landmark: landmark.trim() || undefined,
      areaPincode: areaPincode.trim() || '324009',
      subOrHeadOffice: subOrHeadOffice.trim() || 'Dadabari SO',
      branchOffice: branchOffice.trim() || undefined,
      assignedBeatNumber: assignedBeatNumber.trim(),
      assignedPostmanName: assignedPostmanName.trim() || undefined,
      assignedPostmanMobile: assignedPostmanMobile.trim() || undefined,
    });

    setBannerNotice(
      `Colony-Beat Mapping Saved: "${saved.colonyName}${saved.sectorOrPhase ? ` (${saved.sectorOrPhase})` : ''}" → ${saved.assignedBeatNumber} (${saved.subOrHeadOffice} - ${saved.areaPincode})`
    );
    setShowAddColonyModal(false);
    setColonyName('');
    setSectorOrPhase('');
    setLandmark('');
    refreshAll();
    setTimeout(() => setBannerNotice(null), 5000);
  };

  const handleDeleteMapping = (id: string) => {
    staffPermissionService.deleteColonyMapping(id);
    refreshAll();
  };

  return (
    <div className="space-y-6" id="address-resolution-view-root">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-red-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles size={13} /> AI Address Verification & Exception Engine
            </div>
            <h2 className="text-2xl font-black flex items-center gap-2.5">
              <MapPin size={26} className="text-amber-400" />
              <span>Postal Address Verification & Address_Exceptions Hub</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Real-time postal geo-intelligence analyzing address inputs against the Department of Posts Kota Master Beat Matrix (PIN 324009 / Dadabari S.O.). Automatically detects PIN mismatches, beat misallocations, and missing house numbers, queuing discrepancies for manual review and auto-correction.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveMainTab('AI_ANALYZER')}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md"
            >
              <Zap size={15} />
              <span>Launch Live Address Scanner</span>
            </button>
            <button
              onClick={() => setShowAddColonyModal(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Plus size={15} />
              <span>Add Colony-Beat Rule</span>
            </button>
            <button
              onClick={() => setShowBulkImport(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Upload size={15} />
              <span>Bulk Import</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveMainTab('EXCEPTIONS_QUEUE')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeMainTab === 'EXCEPTIONS_QUEUE'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            <AlertCircle size={14} />
            <span>1. Address_Exceptions Review Queue</span>
            {exceptionStats.pending > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                {exceptionStats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveMainTab('AI_ANALYZER')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeMainTab === 'AI_ANALYZER'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            <Sparkles size={14} />
            <span>2. AI Address Verification Scanner</span>
          </button>
          <button
            onClick={() => setActiveMainTab('COLONY_DIRECTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeMainTab === 'COLONY_DIRECTORY'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            <Navigation size={14} />
            <span>3. Colony & Beat Postal Directory ({colonyMappings.length})</span>
          </button>
          <button
            onClick={() => setActiveMainTab('BATCH_AUDIT')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeMainTab === 'BATCH_AUDIT'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            <Activity size={14} />
            <span>4. Batch Postal Database Audit</span>
          </button>
        </div>
      </div>

      {bannerNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-5 py-3.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{bannerNotice}</span>
          </div>
          <button onClick={() => setBannerNotice(null)} className="text-emerald-700 hover:text-emerald-950">
            <X size={16} />
          </button>
        </div>
      )}

      {/* TAB 1: Address_Exceptions Review Queue */}
      {activeMainTab === 'EXCEPTIONS_QUEUE' && (
        <div className="space-y-6">
          {/* Key Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Address Exceptions</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{exceptionStats.total}</div>
              <div className="text-[11px] text-slate-500 mt-1">Logged across all beats</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-xs">
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Pending Staff Review</div>
              <div className="text-2xl font-black text-amber-900 mt-1">{exceptionStats.pending}</div>
              <div className="text-[11px] text-amber-700 mt-1 font-semibold">Requires verification</div>
            </div>
            <div className="bg-red-50 p-4 rounded-2xl border border-red-200 shadow-xs">
              <div className="text-[11px] font-bold text-red-800 uppercase tracking-wider">Critical Discrepancies</div>
              <div className="text-2xl font-black text-red-900 mt-1">{exceptionStats.criticalCount}</div>
              <div className="text-[11px] text-red-700 mt-1 font-semibold">Pincode or Beat misallocated</div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-xs">
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Resolved / Standardized</div>
              <div className="text-2xl font-black text-emerald-900 mt-1">{exceptionStats.resolved}</div>
              <div className="text-[11px] text-emerald-700 mt-1 font-semibold">Updated in Customer Master</div>
            </div>
          </div>

          {/* Action Bar & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
                {(['ALL', 'PENDING_REVIEW', 'AUTO_CORRECTED', 'MANUALLY_RESOLVED', 'REJECTED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setExceptionStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      exceptionStatusFilter === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'ALL'
                      ? 'All'
                      : st === 'PENDING_REVIEW'
                      ? 'Pending'
                      : st === 'AUTO_CORRECTED'
                      ? 'Auto-Fixed'
                      : st === 'MANUALLY_RESOLVED'
                      ? 'Resolved'
                      : 'Dismissed'}
                  </button>
                ))}
              </div>

              {/* Severity Filter */}
              <select
                value={exceptionSeverityFilter}
                onChange={(e) => setExceptionSeverityFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">🔴 Critical Only</option>
                <option value="WARNING">🟡 Warning Only</option>
                <option value="INFO">🔵 Info Only</option>
              </select>

              {/* Beat Filter */}
              <select
                value={exceptionBeatFilter}
                onChange={(e) => setExceptionBeatFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="ALL">All Beats</option>
                <option value="Beat 2">Beat 2 (Mahendra Meena)</option>
                <option value="Beat 5">Beat 5 (Priyanshu Trivedi)</option>
                <option value="Beat 17">Beat 17 (Priyanshu Trivedi)</option>
                <option value="Beat 4">Beat 4</option>
                <option value="Beat 6">Beat 6</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={exceptionSearchTerm}
                  onChange={(e) => setExceptionSearchTerm(e.target.value)}
                  placeholder="Search exception, name, address..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <button
                onClick={handleAutoFixHighConfidence}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition whitespace-nowrap shadow-xs"
                title="Auto-Approve all entries with >90% AI Confidence"
              >
                <Zap size={14} />
                <span>Auto-Fix (&gt;90% Conf.)</span>
              </button>
            </div>
          </div>

          {/* Exceptions Table / List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredExceptions.length === 0 ? (
              <div className="text-center py-12 p-4">
                <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3" />
                <h4 className="text-sm font-bold text-slate-900">No Address Exceptions Found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  All postal addresses match the Dadabari S.O. Master Beat records under current filters, or all exceptions have been successfully resolved.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/80 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">ID & Customer</th>
                      <th className="p-3.5">Original Provided Address</th>
                      <th className="p-3.5">Detected Discrepancies</th>
                      <th className="p-3.5">AI Suggested Correction</th>
                      <th className="p-3.5">Confidence</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredExceptions.map((exc) => {
                      const isPending = exc.status === 'PENDING_REVIEW';
                      return (
                        <tr key={exc.id} className="hover:bg-slate-50/80 transition">
                          {/* ID & Customer */}
                          <td className="p-3.5">
                            <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{exc.id}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                  exc.severity === 'CRITICAL'
                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                    : exc.severity === 'WARNING'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {exc.severity}
                              </span>
                            </div>
                            <div className="font-bold text-slate-900 mt-1">
                              {exc.customerName || 'Anonymous Entry'}
                            </div>
                            {exc.customerMobile && (
                              <div className="text-[11px] font-mono text-slate-500">{exc.customerMobile}</div>
                            )}
                            <div className="text-[10px] text-slate-400 mt-0.5">Source: {exc.source}</div>
                          </td>

                          {/* Original Address */}
                          <td className="p-3.5 max-w-xs">
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                              <div className="font-semibold text-slate-800">
                                {exc.originalAddress.houseNo ? `H.No: ${exc.originalAddress.houseNo}, ` : ''}
                                {exc.originalAddress.colony || 'Unknown Colony'}{' '}
                                {exc.originalAddress.sector ? `(${exc.originalAddress.sector})` : ''}
                              </div>
                              {exc.originalAddress.landmark && (
                                <div className="text-[11px] text-slate-500">
                                  Landmark: {exc.originalAddress.landmark}
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-[11px] font-mono">
                                <span className="text-slate-600">PIN: {exc.originalAddress.pincode || 'None'}</span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-600">Beat: {exc.originalAddress.beatNo || 'Unassigned'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Discrepancies */}
                          <td className="p-3.5 max-w-xs">
                            <div className="space-y-1.5">
                              {exc.detectedDiscrepancies.map((d, idx) => (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-lg text-[11px] font-medium leading-relaxed ${
                                    d.severity === 'CRITICAL'
                                      ? 'bg-red-50 text-red-900 border border-red-200'
                                      : d.severity === 'WARNING'
                                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                      : 'bg-blue-50 text-blue-900 border border-blue-200'
                                  }`}
                                >
                                  <div className="font-bold uppercase tracking-wider text-[10px] mb-0.5">
                                    {d.type.replace(/_/g, ' ')}
                                  </div>
                                  <div>{d.message}</div>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* AI Suggested Correction */}
                          <td className="p-3.5 max-w-sm">
                            <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 space-y-1 text-emerald-950">
                              <div className="font-bold text-xs flex items-center gap-1 text-emerald-900">
                                <CheckCircle2 size={13} className="text-emerald-600" />
                                <span>{exc.suggestedCorrection.correctedFullAddress}</span>
                              </div>
                              <div className="text-[11px] text-emerald-800 font-medium">
                                {exc.suggestedCorrection.explanation}
                              </div>
                              <div className="text-[10px] text-emerald-700 font-mono pt-1 border-t border-emerald-200/60">
                                Ref: {exc.suggestedCorrection.geographicalReference}
                              </div>
                            </div>
                          </td>

                          {/* Confidence */}
                          <td className="p-3.5">
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-xs bg-slate-100 text-slate-800 border border-slate-200">
                              <Sparkles size={11} className="text-amber-500" />
                              <span>{Math.round(exc.suggestedCorrection.confidenceScore * 100)}%</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-3.5">
                            {exc.status === 'PENDING_REVIEW' && (
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold text-[10px] inline-flex items-center gap-1">
                                <Clock size={11} /> Pending Review
                              </span>
                            )}
                            {exc.status === 'AUTO_CORRECTED' && (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg font-bold text-[10px] inline-flex items-center gap-1">
                                <Check size={11} /> Auto-Corrected
                              </span>
                            )}
                            {exc.status === 'MANUALLY_RESOLVED' && (
                              <span className="px-2.5 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-lg font-bold text-[10px] inline-flex items-center gap-1">
                                <Check size={11} /> Resolved
                              </span>
                            )}
                            {exc.status === 'REJECTED' && (
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-bold text-[10px]">
                                Dismissed
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right whitespace-nowrap">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleQuickResolve(exc.id)}
                                  className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition shadow-xs"
                                  title="1-Click Apply AI Suggestion to Customer Master"
                                >
                                  <Check size={13} />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleOpenReviewModal(exc)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1 transition border border-slate-300"
                                  title="Edit address manually before applying"
                                >
                                  <Edit3 size={13} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleRejectException(exc.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-700 rounded-lg hover:bg-red-50 transition"
                                  title="Dismiss / Reject Exception"
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-500 font-medium">
                                Verified by {exc.reviewedBy || 'Staff'}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI Address Verification Scanner (Live Simulator) */}
      {activeMainTab === 'AI_ANALYZER' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles size={20} className="text-amber-500" />
                  <span>Real-Time Postal Address AI Verification Sandbox</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Type or paste any postal delivery address below to test instant AI parsing, geographical validation, discrepancy detection, and standardization against Dadabari S.O. & Kota Division benchmarks.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAnalyzerHouseNo('445');
                    setAnalyzerColony('Keshavpura');
                    setAnalyzerSector('Sector 7');
                    setAnalyzerLandmark('Tejaji Mandir');
                    setAnalyzerPincode('324005'); // Flawed PIN for demo
                    setAnalyzerBeatNo('Beat 5'); // Flawed beat for demo
                    setAnalyzerRawText('House 445, Keshavpura Sector 7, Near Tejaji Mandir, Kota 324005');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Load Sample Anomaly 1 (PIN Mismatch)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnalyzerHouseNo('');
                    setAnalyzerColony('Talwandi');
                    setAnalyzerSector('Sector A');
                    setAnalyzerLandmark('Commerce College Road');
                    setAnalyzerPincode('324009'); // Wrong PIN for Talwandi
                    setAnalyzerBeatNo('Beat 2'); // Wrong Beat
                    setAnalyzerRawText('Talwandi Sector A, near Commerce College, Kota');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Load Sample Anomaly 2 (Beat & Missing House)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">House / Unit Number</label>
                <input
                  value={analyzerHouseNo}
                  onChange={(e) => setAnalyzerHouseNo(e.target.value)}
                  placeholder="e.g. 445 / KH-222"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Colony Name</label>
                <input
                  value={analyzerColony}
                  onChange={(e) => setAnalyzerColony(e.target.value)}
                  placeholder="e.g. Keshavpura / Mahaveer Nagar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Sector / Phase</label>
                <input
                  value={analyzerSector}
                  onChange={(e) => setAnalyzerSector(e.target.value)}
                  placeholder="e.g. Sector 7"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Prominent Landmark</label>
                <input
                  value={analyzerLandmark}
                  onChange={(e) => setAnalyzerLandmark(e.target.value)}
                  placeholder="e.g. Near Tejaji Mandir"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Pincode (6 Digits)</label>
                <input
                  value={analyzerPincode}
                  onChange={(e) => setAnalyzerPincode(e.target.value)}
                  placeholder="324009"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-semibold bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Beat Number</label>
                <input
                  value={analyzerBeatNo}
                  onChange={(e) => setAnalyzerBeatNo(e.target.value)}
                  placeholder="Beat 2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-slate-50"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Raw Unstructured Address / Physical Delivery Slip Text
              </label>
              <textarea
                rows={2}
                value={analyzerRawText}
                onChange={(e) => setAnalyzerRawText(e.target.value)}
                placeholder="Paste customer delivery note, parcel label, or raw field survey note..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-slate-50"
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                Engine: Department of Posts Kota Master Beat Matrix + Gemini AI Semantic Parsing
              </span>
              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Analyzing Postal Records...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} className="text-amber-400" />
                    <span>Run AI Postal Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Result Display */}
          {analysisResult && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-6">
              {/* Score Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black ${
                      analysisResult.accuracyScore >= 90
                        ? 'bg-emerald-500 text-white'
                        : analysisResult.accuracyScore >= 70
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    <span className="text-xl leading-none">{analysisResult.accuracyScore}</span>
                    <span className="text-[9px] uppercase tracking-wider">/ 100</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Accuracy Assessment
                    </div>
                    <h4 className="text-lg font-black flex items-center gap-2">
                      <span>
                        {analysisResult.accuracyScore >= 90
                          ? 'High Accuracy — Postal Ready'
                          : analysisResult.accuracyScore >= 70
                          ? 'Moderate Accuracy — Review Recommended'
                          : 'Severe Discrepancies — Correction Required'}
                      </span>
                    </h4>
                    <div className="text-xs text-slate-300 mt-0.5">
                      Risk Level: <strong className="uppercase">{analysisResult.riskLevel}</strong> • Model: {analysisResult.modelUsed}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-300 font-bold">Official Matched Office</div>
                  <div className="text-sm font-black text-amber-400">
                    {analysisResult.matchedPostalRecord?.officeName} (PIN {analysisResult.matchedPostalRecord?.standardPincode})
                  </div>
                  <div className="text-xs text-slate-300">
                    Beat: <strong>{analysisResult.matchedPostalRecord?.beatNumber}</strong> • Staff: {analysisResult.matchedPostalRecord?.assignedStaff}
                  </div>
                </div>
              </div>

              {/* Discrepancies Found */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={15} className="text-amber-600" />
                  <span>Detected Discrepancies & Inconsistencies ({analysisResult.discrepancies.length})</span>
                </h4>
                {analysisResult.discrepancies.length === 0 ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span>No geographical or postal record discrepancies detected. Address conforms 100% to official standards.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysisResult.discrepancies.map((d, i) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-2xl border ${
                          d.severity === 'CRITICAL'
                            ? 'bg-red-50 border-red-200 text-red-950'
                            : d.severity === 'WARNING'
                            ? 'bg-amber-50 border-amber-200 text-amber-950'
                            : 'bg-blue-50 border-blue-200 text-blue-950'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-xs uppercase tracking-wider">{d.type.replace(/_/g, ' ')}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              d.severity === 'CRITICAL'
                                ? 'bg-red-200 text-red-900'
                                : d.severity === 'WARNING'
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-blue-200 text-blue-900'
                            }`}
                          >
                            {d.severity}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed font-medium">{d.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Suggested Standard Correction */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-emerald-900 tracking-wider flex items-center gap-1.5">
                    <Sparkles size={15} className="text-emerald-700" />
                    <span>AI Suggested Standard Postal Address</span>
                  </h4>
                  <span className="px-2.5 py-1 bg-emerald-200/80 text-emerald-950 rounded-lg text-xs font-black">
                    Confidence: {Math.round(analysisResult.suggestedCorrection.confidenceScore * 100)}%
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-slate-900 font-bold text-sm">
                  {analysisResult.suggestedCorrection.correctedFullAddress}
                </div>

                <div className="text-xs text-emerald-900 font-medium">
                  {analysisResult.suggestedCorrection.explanation}
                </div>

                <div className="pt-2 border-t border-emerald-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-slate-600 font-mono">
                    Jurisdiction: {analysisResult.suggestedCorrection.geographicalReference}
                  </span>
                  <button
                    onClick={() => {
                      setAnalyzerHouseNo(analysisResult.suggestedCorrection.correctedHouseNo || '');
                      setAnalyzerColony(analysisResult.suggestedCorrection.correctedColony || '');
                      setAnalyzerSector(analysisResult.suggestedCorrection.correctedSector || '');
                      setAnalyzerLandmark(analysisResult.suggestedCorrection.correctedLandmark || '');
                      setAnalyzerPincode(analysisResult.suggestedCorrection.correctedPincode || '');
                      setAnalyzerBeatNo(analysisResult.suggestedCorrection.correctedBeatNo || '');
                      setBannerNotice('Suggested corrections auto-populated into input fields!');
                      setTimeout(() => setBannerNotice(null), 3000);
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition self-start sm:self-auto"
                  >
                    <Check size={14} />
                    <span>Populate Corrections into Analyzer</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Structured Colony-Beat Postal Directory */}
      {activeMainTab === 'COLONY_DIRECTORY' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Structured Colony, Sector & Beat Mapping Matrix ({filteredMappings.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Every staff entry and manual mapping automatically updates this routing matrix
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchMappingTerm}
                  onChange={(e) => setSearchMappingTerm(e.target.value)}
                  placeholder="Search colony, sector, landmark, beat..."
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/80 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Colony Name</th>
                    <th className="p-3.5">Sector / Phase</th>
                    <th className="p-3.5">Landmark</th>
                    <th className="p-3.5">Area Pincode</th>
                    <th className="p-3.5">Sub Office / HO</th>
                    <th className="p-3.5">Assigned Beat</th>
                    <th className="p-3.5">Assigned Postman / Staff</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMappings.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{m.colonyName}</td>
                      <td className="p-3.5">
                        {m.sectorOrPhase ? (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded font-semibold">
                            {m.sectorOrPhase}
                          </span>
                        ) : (
                          <span className="text-slate-400">Main / All</span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600">{m.landmark || '—'}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">{m.areaPincode}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800">{m.subOrHeadOffice}</span>
                        {m.branchOffice && (
                          <span className="block text-[10px] text-amber-800 font-bold">BO: {m.branchOffice}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg font-mono font-black">
                          {m.assignedBeatNumber}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{m.assignedPostmanName || 'Beat Staff'}</div>
                        {m.assignedPostmanMobile && (
                          <div className="text-[11px] font-mono text-emerald-700">{m.assignedPostmanMobile}</div>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteMapping(m.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                          title="Remove Mapping"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Batch Postal Database Audit */}
      {activeMainTab === 'BATCH_AUDIT' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Activity size={20} className="text-red-700" />
                  <span>Comprehensive CRM Address Audit Engine</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  Scan all {customers.length} customer records in the CRM database against the 25 Master Colonies, Dadabari S.O. Pincode boundaries (PIN 324009), and official Beat routes. Discrepancies will be automatically logged to the Address_Exceptions entity.
                </p>
              </div>

              <button
                onClick={handleRunBatchAudit}
                disabled={isAuditing}
                className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition disabled:opacity-50"
              >
                {isAuditing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Auditing {customers.length} Records...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} className="text-amber-400" />
                    <span>Run Full Database Audit Now</span>
                  </>
                )}
              </button>
            </div>

            {auditResult && (
              <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Total Audited</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{auditResult.totalAudited}</div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                  <div className="text-[11px] font-bold text-emerald-800 uppercase">Verified Clean</div>
                  <div className="text-2xl font-black text-emerald-900 mt-1">{auditResult.passedClean}</div>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                  <div className="text-[11px] font-bold text-amber-800 uppercase">Exceptions Queued</div>
                  <div className="text-2xl font-black text-amber-900 mt-1">{auditResult.exceptionsCreated}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                  <div className="text-[11px] font-bold text-blue-800 uppercase">Average Accuracy</div>
                  <div className="text-2xl font-black text-blue-900 mt-1">{auditResult.averageScore}%</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Review & Inline Edit Modal for Address_Exceptions */}
      {selectedExceptionForReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-red-800 to-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase mb-1">
                  Manual Exception Review & Resolution
                </div>
                <h3 className="text-lg font-black">{selectedExceptionForReview.id}</h3>
                <p className="text-xs text-red-100">
                  Customer: {selectedExceptionForReview.customerName || 'Anonymous'} ({selectedExceptionForReview.customerMobile || 'No Phone'})
                </p>
              </div>
              <button
                onClick={() => setSelectedExceptionForReview(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCommitReview} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">Detected Discrepancies:</div>
                <ul className="space-y-1">
                  {selectedExceptionForReview.detectedDiscrepancies.map((d, i) => (
                    <li key={i} className="text-red-700 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      <span>
                        <strong>{d.type}:</strong> {d.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Corrected House / Plot No *</label>
                  <input
                    required
                    value={editHouseNo}
                    onChange={(e) => setEditHouseNo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Corrected Colony Name *</label>
                  <input
                    required
                    value={editColony}
                    onChange={(e) => setEditColony(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Corrected Sector / Phase</label>
                  <input
                    value={editSector}
                    onChange={(e) => setEditSector(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Corrected Landmark</label>
                  <input
                    value={editLandmark}
                    onChange={(e) => setEditLandmark(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Standard Postal Pincode *</label>
                  <input
                    required
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Beat Number *</label>
                  <input
                    required
                    value={editBeatNo}
                    onChange={(e) => setEditBeatNo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-red-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Staff Review Notes / Auditor Remarks</label>
                <textarea
                  rows={2}
                  value={manualReviewNotes}
                  onChange={(e) => setManualReviewNotes(e.target.value)}
                  placeholder="e.g. Field physically confirmed by Postman Mahendra Kumar Meena on morning delivery round"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleRejectException(selectedExceptionForReview.id)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-800 rounded-xl font-bold"
                >
                  Dismiss / Mark False Positive
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedExceptionForReview(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResolving}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black shadow-md flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Save & Apply Correction to Customer Master</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Structured Colony-Beat Mapping Modal */}
      {showAddColonyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-red-800 to-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">Add Structured Colony-Beat Mapping</h3>
                <p className="text-xs text-red-100">
                  Map Colony, Sector/Phase, Landmark & Pincode to Sub/Head Office and Beat Number
                </p>
              </div>
              <button
                onClick={() => setShowAddColonyModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveColonyMapping} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Colony Name *</label>
                  <input
                    required
                    placeholder="e.g. Keshavpura / Mahaveer Nagar"
                    value={colonyName}
                    onChange={(e) => setColonyName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sector Number / Phase (if available)</label>
                  <input
                    placeholder="e.g. Sector 7 / Phase II"
                    value={sectorOrPhase}
                    onChange={(e) => setSectorOrPhase(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prominent Landmark</label>
                  <input
                    placeholder="e.g. Near Tejaji Mandir / Modi College"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Area Pincode *</label>
                  <input
                    required
                    placeholder="324009"
                    value={areaPincode}
                    onChange={(e) => setAreaPincode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sub Office / HO Mapping *</label>
                  <input
                    required
                    placeholder="Dadabari SO"
                    value={subOrHeadOffice}
                    onChange={(e) => setSubOrHeadOffice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch Office (BO - optional)</label>
                  <input
                    placeholder="e.g. Branch Office Name"
                    value={branchOffice}
                    onChange={(e) => setBranchOffice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Beat Number *</label>
                  <input
                    required
                    placeholder="Beat 2"
                    value={assignedBeatNumber}
                    onChange={(e) => setAssignedBeatNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-red-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Postman / Staff Name</label>
                  <input
                    placeholder="Mahendra Kumar Meena"
                    value={assignedPostmanName}
                    onChange={(e) => setAssignedPostmanName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Mobile Number</label>
                  <input
                    placeholder="8769706002"
                    value={assignedPostmanMobile}
                    onChange={(e) => setAssignedPostmanMobile(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddColonyModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black shadow-md"
                >
                  Save Colony-Beat Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <CustomerProfileModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
      {showBulkImport && <BulkAddressImport onClose={() => setShowBulkImport(false)} />}
    </div>
  );
}
