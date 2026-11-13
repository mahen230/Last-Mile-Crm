import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Eye,
  History,
  ShieldCheck,
  Building2,
  Calendar,
  Grid,
  List,
  ChevronRight,
  ExternalLink,
  Layers,
  Fuel,
  Smartphone,
  UserCheck,
  MapPin,
  Check,
  X,
  FileCheck2,
  FileSpreadsheet,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { staffPermissionService } from '../../services/staffPermissionService';
import { operationsService } from '../../services/operationsService';
import { masterDataService } from '../../services/masterDataService';
import { SpecialBillRecord, SpecialBillType } from '../../types/models';
import { downloadOfficialAcg61Pdf, formatToDottedDate } from '../../utils/acg61PdfGenerator';
import { downloadOfficialFuelBillPDF } from '../../utils/fuelBillPdfGenerator';
import { ALL_33_BEATS_FUEL_DATA, DEPARTMENTAL_FUEL_RATE_PER_KM } from '../../data/beatFuelData';
import { UPDATED_STAFF_LIST } from '../../data/updatedStaffData';

export default function OfficialStaffDocumentsHub() {
  const { userProfile } = useAuth();
  const currentStaff = staffPermissionService.getActiveSession() || userProfile;

  // View Mode: Card Grid vs Detailed Table
  const [viewMode, setViewMode] = useState<'CARD_GRID' | 'DETAILED_TABLE'>('CARD_GRID');

  // Document Records State
  const [documents, setDocuments] = useState<SpecialBillRecord[]>([]);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [beatFilter, setBeatFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<SpecialBillRecord | null>(null);
  const [selectedDocForAudit, setSelectedDocForAudit] = useState<SpecialBillRecord | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New Document Form State
  const [newDocType, setNewDocType] = useState<SpecialBillType>('FUEL_BILL');
  const [newDocTitle, setNewDocTitle] = useState<string>('');
  const [newDocStaffId, setNewDocStaffId] = useState<string>('50457421');
  const [newDocStaffName, setNewDocStaffName] = useState<string>('Mahendra Kumar Meena');
  const [newDocBeat, setNewDocBeat] = useState<string>('Beat 2');
  const [newDocFromDate, setNewDocFromDate] = useState<string>('2026-10-01');
  const [newDocToDate, setNewDocToDate] = useState<string>('2026-10-31');
  const [newDocDays, setNewDocDays] = useState<number>(25);
  const [newDocKm, setNewDocKm] = useState<number>(28);
  const [newDocRemarks, setNewDocRemarks] = useState<string>('Dadabari S.O. official monthly operational statement.');

  // Refresh document list
  const refreshDocuments = () => {
    const all = operationsService.getSpecialBills();
    setDocuments(all);
  };

  useEffect(() => {
    refreshDocuments();
    const unsub = operationsService.subscribe(refreshDocuments);
    return () => unsub();
  }, []);

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // 1. Category Filter
      if (categoryFilter !== 'ALL' && doc.type !== categoryFilter) {
        return false;
      }
      // 2. Status Filter
      if (statusFilter !== 'ALL') {
        const normStatus = doc.status.toLowerCase();
        if (statusFilter === 'APPROVED' && !normStatus.includes('approved') && !normStatus.includes('sanctioned') && !normStatus.includes('paid')) {
          return false;
        }
        if (statusFilter === 'VERIFIED' && !normStatus.includes('verified')) {
          return false;
        }
        if (statusFilter === 'DRAFT' && !normStatus.includes('draft') && !normStatus.includes('submitted')) {
          return false;
        }
        if (statusFilter === 'DOWNLOADED' && !normStatus.includes('downloaded')) {
          return false;
        }
      }
      // 3. Beat Filter
      if (beatFilter !== 'ALL' && !doc.beatNo.toLowerCase().includes(beatFilter.toLowerCase().replace('beat ', ''))) {
        return false;
      }
      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const titleMatch = doc.title.toLowerCase().includes(q);
        const billNumMatch = doc.billNumber.toLowerCase().includes(q);
        const empMatch = doc.employeeName.toLowerCase().includes(q) || doc.employeeId.toLowerCase().includes(q);
        const beatMatch = doc.beatNo.toLowerCase().includes(q);
        const remarksMatch = (doc.details?.remarks || '').toLowerCase().includes(q);
        if (!titleMatch && !billNumMatch && !empMatch && !beatMatch && !remarksMatch) {
          return false;
        }
      }
      return true;
    });
  }, [documents, categoryFilter, statusFilter, beatFilter, searchQuery]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = documents.length;
    const approved = documents.filter((d) => {
      const s = d.status.toLowerCase();
      return s.includes('approved') || s.includes('sanctioned') || s.includes('paid');
    }).length;
    const verified = documents.filter((d) => d.status.toLowerCase().includes('verified')).length;
    const totalClaimValue = documents.reduce((acc, d) => acc + (d.totalAmount || 0), 0);

    return { total, approved, verified, totalClaimValue };
  }, [documents]);

  // Handle Regenerate Action
  const handleRegenerate = (doc: SpecialBillRecord) => {
    const now = new Date().toISOString();
    const updated = operationsService.updateSpecialBillStatus(doc.id, 'Verified by SPM');
    if (updated) {
      if (!updated.auditTrail) updated.auditTrail = [];
      updated.auditTrail.push({
        action: 'Document Regenerated',
        performedBy: currentStaff?.name || 'Mahendra Kumar Meena (Admin)',
        timestamp: now,
        notes: 'Recalculated with latest month-end DSS and odometer readings at statutory ₹3.60/KM.',
      });
      refreshDocuments();
      setStatusNotice(`Document "${doc.title}" successfully regenerated and re-verified with DSS statement!`);
      setTimeout(() => setStatusNotice(null), 4000);
    }
  };

  // Handle Instant Download ACG-61 / PDF
  const handleDownload = (doc: SpecialBillRecord) => {
    try {
      if (doc.type === 'CHARGE_REPORT') {
        downloadOfficialAcg61Pdf({
          relievedOfficerName: doc.details?.relievedOfficerName || doc.employeeName,
          relievedOfficerId: doc.details?.relievedOfficerId || doc.employeeId,
          relievingOfficerName: doc.details?.relievingOfficerName || 'VACANT',
          relievingOfficerId: doc.details?.relievingOfficerId || 'VACANT',
          postName: doc.details?.relievedDesignation || 'POSTMAN',
          placeName: doc.officeName || 'DADABARI SO',
          date: doc.fromDate,
          noonSection: (doc.details?.sessionType?.includes('Forenoon') ? 'AM' : 'PM') as any,
          divisionName: 'KOTA DIVISION',
          headOfficeName: 'NGM H.O.',
          subDivisionName: "ASPO's KOTA EAST",
          authorityOrderNo: doc.details?.orderReferenceNo || doc.billNumber,
          remarks: doc.details?.remarks || 'Official ACG-61 certificate generated from Postman Book CRM.',
        });
      } else {
        // Fuel Bill or generic ACG-61 Bill
        downloadOfficialFuelBillPDF(doc);
      }

      // Update status to Downloaded / Approved
      operationsService.updateSpecialBillStatus(doc.id, 'Downloaded');
      refreshDocuments();
      setStatusNotice(`Official PDF for ${doc.billNumber} generated and downloaded successfully!`);
      setTimeout(() => setStatusNotice(null), 4000);
    } catch (err) {
      console.error('Download error:', err);
      setErrorNotice('Error generating document PDF. Please check data format.');
      setTimeout(() => setErrorNotice(null), 5000);
    }
  };

  // Create New Document Submission
  const handleCreateNewDocument = (e: React.FormEvent) => {
    e.preventDefault();

    let calculatedAmount = 0;
    if (newDocType === 'FUEL_BILL') {
      calculatedAmount = Math.round(newDocDays * newDocKm * DEPARTMENTAL_FUEL_RATE_PER_KM);
    } else if (newDocType === 'BYOD_BILL') {
      calculatedAmount = 450;
    } else if (newDocType === 'OUTSIDER_BILL') {
      calculatedAmount = newDocDays * 136;
    } else if (newDocType === 'CONSOLIDATED_BILL') {
      calculatedAmount = Math.round(newDocDays * newDocKm * DEPARTMENTAL_FUEL_RATE_PER_KM);
    }

    const title =
      newDocTitle.trim() ||
      `${newDocType.replace(/_/g, ' ')}: ${newDocBeat} (${newDocStaffName} - ${newDocFromDate.slice(0, 7)})`;

    operationsService.createSpecialBill({
      type: newDocType,
      title,
      employeeId: newDocStaffId,
      employeeName: newDocStaffName,
      employeeEmail: currentStaff?.email || 'Ektamahenmeena@gmail.com',
      beatNo: newDocBeat,
      officeName: 'Dadabari S.O. (324009)',
      fromDate: newDocFromDate,
      toDate: newDocToDate,
      totalDays: newDocDays,
      fixedKm: newDocKm,
      totalAmount: calculatedAmount,
      details: {
        workingDays: newDocDays,
        sanctionedDailyKm: newDocKm,
        ratePerKm: DEPARTMENTAL_FUEL_RATE_PER_KM,
        totalMonthlyKm: newDocDays * newDocKm,
        remarks: newDocRemarks,
      },
      documentCategory:
        newDocType === 'CHARGE_REPORT'
          ? 'STATUTORY_CHARGE'
          : newDocType === 'FUEL_BILL'
          ? 'FUEL_ALLOWANCE'
          : newDocType === 'BYOD_BILL'
          ? 'DEVICE_ALLOWANCE'
          : newDocType === 'OUTSIDER_BILL'
          ? 'DUTY_ALLOWANCE'
          : newDocType === 'CONSOLIDATED_BILL'
          ? 'CONSOLIDATED_SUMMARY'
          : 'CENSUS_VERIFICATION',
      auditTrail: [
        {
          action: 'Document Created',
          performedBy: currentStaff?.name || 'Mahendra Kumar Meena',
          timestamp: new Date().toISOString(),
          notes: 'Generated via Official Staff Documents Hub',
        },
      ],
    });

    setShowCreateModal(false);
    refreshDocuments();
    setStatusNotice(`New official document "${title}" created and registered in statutory ledger!`);
    setTimeout(() => setStatusNotice(null), 5000);
  };

  // Helper for Badge Colors
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CHARGE_REPORT':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'FUEL_BILL':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'BYOD_BILL':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'OUTSIDER_BILL':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'CONSOLIDATED_BILL':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'NPR_CENSUS_LOG':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('approved') || s.includes('sanctioned')) {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
    if (s.includes('verified')) {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    if (s.includes('downloaded')) {
      return 'bg-purple-100 text-purple-900 border-purple-300';
    }
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  return (
    <div className="space-y-6" id="official-staff-documents-hub-root">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-red-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-red-800/40 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/80 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wide">
              <ShieldCheck size={14} className="text-amber-400" />
              <span>Statutory Compliance & Documentation Section · Dadabari S.O. (324009)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <FileCheck2 size={28} className="text-amber-400" />
              <span>Official Staff Documents & Statutory Reports Hub</span>
            </h1>
            <p className="text-xs sm:text-sm text-red-100/90 max-w-3xl leading-relaxed">
              Centralized repository for all generated operational documents: Form ACG-61 Charge Reports, Two-Wheeler Fuel Allowance Bills (calculated strictly at ₹3.60/KM), BYOD Smartphone Allowances, Outsider Bills, Consolidated Statements, and NPR Census logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md cursor-pointer"
            >
              <Plus size={16} />
              <span>Issue New Document</span>
            </button>
            <button
              type="button"
              onClick={() => {
                // Quick export of summary
                const csvContent =
                  'data:text/csv;charset=utf-8,' +
                  ['Bill Number,Title,Type,Staff,Beat,Period,Amount,Status']
                    .concat(
                      filteredDocuments.map(
                        (d) =>
                          `"${d.billNumber}","${d.title}","${d.type}","${d.employeeName}","${d.beatNo}","${d.fromDate} to ${d.toDate}","₹${d.totalAmount}","${d.status}"`
                      )
                    )
                    .join('\n');
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement('a');
                link.setAttribute('href', encodedUri);
                link.setAttribute('download', `Dadabari_Official_Documents_Register_2026.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download size={15} />
              <span>Export Register (CSV)</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Documents</span>
            <span className="text-xl font-black text-white font-mono mt-0.5">{stats.total} Records</span>
          </div>
          <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-500/30">
            <span className="text-[10px] text-emerald-300 uppercase font-bold block">Sanctioned / Approved</span>
            <span className="text-xl font-black text-emerald-400 font-mono mt-0.5">{stats.approved} Documents</span>
          </div>
          <div className="bg-amber-950/40 p-3 rounded-2xl border border-amber-500/30">
            <span className="text-[10px] text-amber-300 uppercase font-bold block">Total Statutory Claim</span>
            <span className="text-xl font-black text-amber-300 font-mono mt-0.5">
              ₹{stats.totalClaimValue.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Statutory Fuel Rate</span>
            <span className="text-xl font-black text-white font-mono mt-0.5">₹3.60 / KM</span>
          </div>
        </div>
      </div>

      {statusNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-5 py-3.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{statusNotice}</span>
          </div>
          <button onClick={() => setStatusNotice(null)} className="text-emerald-700 hover:text-emerald-950">
            <X size={16} />
          </button>
        </div>
      )}
      {errorNotice && (
        <div className="bg-red-50 border border-red-300 text-red-950 px-5 py-3.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600 shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button type="button" onClick={() => setErrorNotice(null)} className="text-red-700 hover:text-red-950">
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2. Interactive Control Bar (View Toggle, Filters, Search) */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider mr-1">View Mode:</span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('CARD_GRID')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'CARD_GRID'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid size={14} />
                <span>Card Grid View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('DETAILED_TABLE')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'DETAILED_TABLE'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List size={14} />
                <span>Detailed Table View</span>
              </button>
            </div>
          </div>

          {/* Search Input & Status Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search doc, staff, bill #, beat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-700"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">✓ Approved / Sanctioned</option>
              <option value="VERIFIED">★ Verified by SPM</option>
              <option value="DRAFT">⏳ Submitted / Draft</option>
              <option value="DOWNLOADED">📥 Downloaded</option>
            </select>

            {/* Beat Dropdown */}
            <select
              value={beatFilter}
              onChange={(e) => setBeatFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Beats</option>
              <option value="Beat 2">Beat 2 (Mahendra Meena)</option>
              <option value="Beat 17">Beat 17 (Priyanshu Trivedi)</option>
              <option value="Beat 5">Beat 5 (Mohit Arvind)</option>
              <option value="Beat 1">Beat 1 (Muskan Sharma)</option>
              <option value="Beat 4">Beat 4</option>
              <option value="Beat 6">Beat 6</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', label: 'All Operational Documents' },
            { id: 'CHARGE_REPORT', label: 'ACG-61 Charge Reports' },
            { id: 'FUEL_BILL', label: 'Monthly Fuel Bills (₹3.60/KM)' },
            { id: 'BYOD_BILL', label: 'BYOD & Smartphone Allowance' },
            { id: 'OUTSIDER_BILL', label: 'Outsider & Substitute Duty' },
            { id: 'CONSOLIDATED_BILL', label: 'Consolidated Delivery Bills' },
            { id: 'NPR_CENSUS_LOG', label: 'NPR & Census Logs' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Document Presentation Section */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <FileCheck2 size={40} className="mx-auto text-slate-400 mb-3" />
          <h4 className="text-base font-bold text-slate-900">No Operational Documents Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            No document records match your current filter parameters. Try clearing filters or click &ldquo;Issue New Document&rdquo; to generate a fresh ACG-61 certificate or fuel bill.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('ALL');
              setStatusFilter('ALL');
              setBeatFilter('ALL');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'CARD_GRID' ? (
        /* ================= CARD GRID VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => {
            const isFuel = doc.type === 'FUEL_BILL';
            const isCharge = doc.type === 'CHARGE_REPORT';
            const isByod = doc.type === 'BYOD_BILL';
            const isOutsider = doc.type === 'OUTSIDER_BILL';
            const isConsolidated = doc.type === 'CONSOLIDATED_BILL';
            const isNpr = doc.type === 'NPR_CENSUS_LOG';

            return (
              <div
                key={doc.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getTypeColor(
                        doc.type
                      )}`}
                    >
                      {doc.type.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(
                        doc.status
                      )}`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">{doc.billNumber}</span>
                    <h3 className="font-black text-sm text-slate-900 leading-snug mt-0.5">{doc.title}</h3>
                  </div>

                  {/* Staff & Beat Details */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Associated Staff:</span>
                      <strong className="text-slate-900">{doc.employeeName}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Beat / Jurisdiction:</span>
                      <strong className="text-red-700 font-mono">{doc.beatNo}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Billing Period:</span>
                      <span className="text-slate-700 font-mono text-[11px]">
                        {doc.fromDate} to {doc.toDate}
                      </span>
                    </div>
                  </div>

                  {/* Operational Metrics Strip */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3 rounded-2xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-300">Statutory Metric:</span>
                      <span className="text-amber-300 font-black font-mono">
                        {isFuel && `₹${doc.totalAmount.toLocaleString('en-IN')} (${doc.totalDays}d × ${doc.fixedKm}km @ ₹3.60)`}
                        {isCharge && `${doc.details?.sessionType || 'Forenoon (F/N)'} Handover`}
                        {isByod && `₹${doc.totalAmount} (₹250 Data + ₹200 Device)`}
                        {isOutsider && `₹${doc.totalAmount.toLocaleString('en-IN')} (${doc.totalDays}d @ ₹136/d)`}
                        {isConsolidated && `${doc.details?.totalArticlesDelivered || 1136} Articles (100% PMA)`}
                        {isNpr && `${doc.details?.householdsVerified || 184} Households Verified`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-1">
                      {doc.details?.remarks || doc.officeName}
                    </p>
                  </div>
                </div>

                {/* Card Action Buttons (View PDF, Regenerate, Download ACG-61, Audit Log) */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedDocForPreview(doc)}
                    className="px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <Eye size={13} className="text-blue-600" />
                    <span>View PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRegenerate(doc)}
                    className="px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <RefreshCw size={13} className="text-amber-600" />
                    <span>Regenerate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    className="px-2.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Download size={13} />
                    <span>Download ACG-61</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDocForAudit(doc)}
                    className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <History size={13} className="text-amber-400" />
                    <span>Audit Log</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= DETAILED TABLE VIEW ================= */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 uppercase text-[11px]">
                  <th className="py-3.5 px-4 font-bold">Document Number & Title</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Billing Period</th>
                  <th className="py-3.5 px-4 font-bold">Associated Beat & Staff</th>
                  <th className="py-3.5 px-4 font-bold">Claim / Metric</th>
                  <th className="py-3.5 px-4 font-bold">Approval Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">1-Click Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                    {/* Document Number & Title */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-mono text-[10px] font-bold text-slate-400 block">{doc.billNumber}</span>
                      <strong className="text-slate-900 text-xs block mt-0.5">{doc.title}</strong>
                      <span className="text-[10px] text-slate-500 block truncate">{doc.officeName}</span>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getTypeColor(
                          doc.type
                        )}`}
                      >
                        {doc.type.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Billing Period */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-700">
                      <div>{doc.fromDate}</div>
                      <div className="text-slate-400">to {doc.toDate}</div>
                    </td>

                    {/* Associated Beat & Staff */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{doc.employeeName}</div>
                      <div className="text-[11px] text-red-700 font-mono font-bold">
                        {doc.beatNo} ({doc.employeeId})
                      </div>
                    </td>

                    {/* Claim / Metric */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-black text-slate-900 text-sm">
                        {doc.totalAmount > 0 ? `₹${doc.totalAmount.toLocaleString('en-IN')}` : 'Statutory Handover'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {doc.fixedKm > 0 ? `${doc.totalDays}d × ${doc.fixedKm}km @ ₹3.60` : doc.details?.sessionType || 'Official ACG-61'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border inline-flex items-center gap-1 ${getStatusColor(
                          doc.status
                        )}`}
                      >
                        {doc.status.toLowerCase().includes('approved') ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <Clock size={11} />
                        )}
                        <span>{doc.status}</span>
                      </span>
                    </td>

                    {/* 1-Click Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDocForPreview(doc)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          title="View PDF Preview"
                        >
                          View PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRegenerate(doc)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[11px] font-bold transition cursor-pointer"
                          title="Regenerate Document"
                        >
                          Regen
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(doc)}
                          className="px-2 py-1 bg-red-700 hover:bg-red-800 text-white rounded-lg text-[11px] font-black transition cursor-pointer"
                          title="Download Official ACG-61 PDF"
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDocForAudit(doc)}
                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                          title="View Audit Trail"
                        >
                          Audit
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

      {/* ======================================================== */}
      {/* 4. OFFICIAL PDF PREVIEW & PRINT MODAL                     */}
      {/* ======================================================== */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  Official Form Preview · {selectedDocForPreview.billNumber}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{selectedDocForPreview.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocForPreview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            {/* Official Printable Sheet Container */}
            <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-300 font-serif text-slate-900 space-y-5 shadow-xs">
              <div className="text-center space-y-1 border-b border-slate-300 pb-4">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-600">DEPARTMENT OF POSTS, INDIA</div>
                <div className="text-lg font-black tracking-tight text-slate-950">
                  {selectedDocForPreview.type === 'CHARGE_REPORT'
                    ? 'FORM ACG-61 · TRANSFER OF CHARGE REPORT'
                    : selectedDocForPreview.type === 'FUEL_BILL'
                    ? 'STATUTORY TWO-WHEELER FUEL CLAIM CERTIFICATE'
                    : selectedDocForPreview.title.toUpperCase()}
                </div>
                <div className="text-xs font-sans text-slate-600">
                  Office: {selectedDocForPreview.officeName} · Postal Division: KOTA DIVISION · Circle: RAJASTHAN
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <span className="text-slate-500 block text-[11px]">Staff / Claimant Name:</span>
                  <strong className="text-slate-900">{selectedDocForPreview.employeeName}</strong> ({selectedDocForPreview.employeeId})
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Assigned Beat Number:</span>
                  <strong className="text-red-700 font-mono font-bold">{selectedDocForPreview.beatNo}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Billing / Period Range:</span>
                  <span className="font-mono">{selectedDocForPreview.fromDate} to {selectedDocForPreview.toDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Verification / Status:</span>
                  <strong className="text-emerald-700">{selectedDocForPreview.status}</strong>
                </div>
              </div>

              {/* Dynamic Metric Details */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs font-sans space-y-2">
                <div className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  Sanctioned Statement & DSS Conformity
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Duty Days</span>
                    <strong className="text-slate-900">{selectedDocForPreview.totalDays} Days</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Sanctioned Route KM</span>
                    <strong className="text-slate-900">{selectedDocForPreview.fixedKm} KM / Day</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Statutory Rate</span>
                    <strong className="text-slate-900">₹3.60 / KM</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Distance</span>
                    <strong className="text-slate-900">{selectedDocForPreview.totalDays * selectedDocForPreview.fixedKm} KM</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Amount Claimed</span>
                    <strong className="text-emerald-700 text-base font-black">
                      ₹{selectedDocForPreview.totalAmount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Reconciliation Note</span>
                    <span className="text-slate-600 text-[11px]">100% DSS Reconciled</span>
                  </div>
                </div>
                {selectedDocForPreview.details?.remarks && (
                  <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                    <strong>Official Remarks:</strong> {selectedDocForPreview.details.remarks}
                  </p>
                )}
              </div>

              {/* Signature Blocks */}
              <div className="grid grid-cols-3 gap-4 pt-8 text-center text-xs font-sans text-slate-700">
                <div className="border-t border-slate-400 pt-1">
                  <strong>Signature of Postman / Official</strong>
                  <div className="text-[10px] text-slate-500 mt-0.5">{selectedDocForPreview.employeeName}</div>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <strong>Verified by Sub-Postmaster</strong>
                  <div className="text-[10px] text-slate-500 mt-0.5">Dadabari S.O. (324009)</div>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <strong>Sanctioning Authority</strong>
                  <div className="text-[10px] text-slate-500 mt-0.5">ASPO / SSPO Kota Division</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDocForPreview(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => handleDownload(selectedDocForPreview)}
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Download size={15} />
                <span>Download Official ACG-61 PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. AUDIT LOG MODAL                                       */}
      {/* ======================================================== */}
      {selectedDocForAudit && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <History size={18} className="text-amber-500" />
                <h3 className="font-black text-base text-slate-900">
                  Document Audit Log & Verification Timeline
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocForAudit(null)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <div className="font-bold text-slate-900">{selectedDocForAudit.title}</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Ref: {selectedDocForAudit.billNumber} · Staff: {selectedDocForAudit.employeeName} ({selectedDocForAudit.beatNo})
              </div>
            </div>

            {/* Chronological Timeline */}
            <div className="space-y-4">
              {selectedDocForAudit.auditTrail && selectedDocForAudit.auditTrail.length > 0 ? (
                selectedDocForAudit.auditTrail.map((log, index) => (
                  <div key={index} className="flex items-start gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      ✓
                    </div>
                    <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900">{log.action}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Performed By: <strong>{log.performedBy}</strong>
                      </div>
                      {log.notes && (
                        <div className="text-[11px] text-emerald-800 font-medium bg-emerald-50/60 p-1.5 rounded-lg border border-emerald-100 mt-1">
                          {log.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  Standard initialization audit: Created by system on {selectedDocForAudit.createdAt}.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedDocForAudit(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. ISSUE NEW DOCUMENT MODAL                              */}
      {/* ======================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scale-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-900">Issue Official Staff Document</h3>
                <p className="text-xs text-slate-500">
                  Generate statutory ACG-61 certificate or allowance claim for Dadabari S.O.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNewDocument} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Category / Type *</label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                >
                  <option value="FUEL_BILL">Monthly Fuel Bill (ACG-61 / KM Calculations @ ₹3.60/KM)</option>
                  <option value="CHARGE_REPORT">Form ACG-61 Charge Report (Handover Certificate)</option>
                  <option value="BYOD_BILL">BYOD & Smartphone Allowance (₹250 Data + ₹200 Device)</option>
                  <option value="OUTSIDER_BILL">Outsider & Substitute Postman Duty Bill</option>
                  <option value="CONSOLIDATED_BILL">Postman Monthly Consolidated Delivery Bill</option>
                  <option value="NPR_CENSUS_LOG">NPR & Census Resident Verification Log</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Staff Member *</label>
                <select
                  value={newDocStaffName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewDocStaffName(name);
                    const found = UPDATED_STAFF_LIST.find((s) => s.name === name);
                    if (found) {
                      setNewDocStaffId(found.id);
                      setNewDocBeat(found.beat);
                      const km = masterDataService.getBeatCustomKm(found.beat);
                      setNewDocKm(km);
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                >
                  {UPDATED_STAFF_LIST.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.id}) · {s.beat} · {s.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">From Date *</label>
                  <input
                    type="date"
                    required
                    value={newDocFromDate}
                    onChange={(e) => setNewDocFromDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">To Date *</label>
                  <input
                    type="date"
                    required
                    value={newDocToDate}
                    onChange={(e) => setNewDocToDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duty / Working Days *</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    required
                    value={newDocDays}
                    onChange={(e) => setNewDocDays(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Daily Route KM (Sanctioned) *</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={newDocKm}
                    onChange={(e) => setNewDocKm(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono"
                  />
                </div>
              </div>

              {newDocType === 'FUEL_BILL' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-center justify-between text-xs">
                  <span>Calculated Statutory Fuel Claim:</span>
                  <strong className="font-mono text-sm text-emerald-800">
                    {newDocDays} Days × {newDocKm} KM @ ₹3.60 = ₹
                    {Math.round(newDocDays * newDocKm * DEPARTMENTAL_FUEL_RATE_PER_KM).toLocaleString('en-IN')}
                  </strong>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Remarks / Handover Notes</label>
                <textarea
                  rows={2}
                  value={newDocRemarks}
                  onChange={(e) => setNewDocRemarks(e.target.value)}
                  placeholder="e.g. Month-end delivery round verified against DSS Statement; certified genuine."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black shadow-md cursor-pointer"
                >
                  Generate & Register Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
