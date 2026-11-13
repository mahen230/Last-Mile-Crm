import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Fuel,
  MapPin,
  Calendar,
  CheckCircle2,
  Download,
  Printer,
  Edit3,
  Lock,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  ChevronRight,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  Sliders,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { staffPermissionService } from '../../services/staffPermissionService';
import { operationsService } from '../../services/operationsService';
import {
  masterDataService,
  PostmanMonthlyFuelSummary,
} from '../../services/masterDataService';
import {
  ALL_33_BEATS_FUEL_DATA,
  DEPARTMENTAL_FUEL_RATE_PER_KM,
  STANDARD_MONTHLY_WORKING_DAYS,
  getBeatFuelMapping,
} from '../../data/beatFuelData';
import { DailyArticleEntry, ArticleQuantityPatch } from '../../types/models';
import { formatIsoToDDMMYYYY } from '../../utils/fuelBillPdfGenerator';

interface PostmanAllDayArticlesOverviewProps {
  initialBeat?: string;
  initialMonth?: string;
  embedded?: boolean;
}

export default function PostmanAllDayArticlesOverview({
  initialBeat,
  initialMonth = '2026-10',
  embedded = false,
}: PostmanAllDayArticlesOverviewProps) {
  const { userProfile } = useAuth();
  const currentStaff = staffPermissionService.getActiveSession() || userProfile;

  // Active Beat & Month
  const activeStaffBeat = initialBeat || currentStaff?.beat || 'Beat 2';
  const [selectedBeat, setSelectedBeat] = useState<string>(activeStaffBeat);
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);

  // Dynamic Route Running KM, Rate & Working Days
  const [customDailyKm, setCustomDailyKm] = useState<number>(() =>
    masterDataService.getBeatCustomKm(activeStaffBeat)
  );
  const [customFuelRate, setCustomFuelRate] = useState<number>(DEPARTMENTAL_FUEL_RATE_PER_KM);
  const [customWorkingDays, setCustomWorkingDays] = useState<number>(() => {
    const initialSummary = masterDataService.generatePostmanMonthlyFuelBill(activeStaffBeat, initialMonth);
    return initialSummary.workingDays || 25;
  });
  const [customVehicleNo, setCustomVehicleNo] = useState<string>('RJ-20-SP-2026');
  const [kmSavedNotice, setKmSavedNotice] = useState<string | null>(null);
  const [syncConfirmNotice, setSyncConfirmNotice] = useState<{
    title: string;
    details: string;
    beat6Line: string;
  } | null>(null);

  // Daily entries & Summary State
  const [allEntries, setAllEntries] = useState<DailyArticleEntry[]>(() => operationsService.getDailyEntries());
  const [fuelSummary, setFuelSummary] = useState<PostmanMonthlyFuelSummary>(() =>
    masterDataService.generatePostmanMonthlyFuelBill(activeStaffBeat, initialMonth, {
      customDailyKm: masterDataService.getBeatCustomKm(activeStaffBeat),
      customRatePerKm: DEPARTMENTAL_FUEL_RATE_PER_KM,
      customWorkingDays: initialMonth === '2026-10' ? undefined : 25,
      vehicleNo: 'RJ-20-SP-2026',
    })
  );

  // Day Edit Modal State (Non-destructive patch)
  const [selectedDayEntry, setSelectedDayEntry] = useState<{
    sn: number;
    date: string;
    isoDate: string;
    status: string;
    spRecd: number;
    spDeliv: number;
    regRecd: number;
    regDeliv: number;
    parRecd: number;
    parDeliv: number;
    codAmount: number;
    remarks: string;
  } | null>(null);

  const [modalNotice, setModalNotice] = useState<string | null>(null);
  const [modalNoticeError, setModalNoticeError] = useState<boolean>(false);

  // Collapsible Table State
  const [isTableExpanded, setIsTableExpanded] = useState<boolean>(true);

  // Filter State: Quick Chips, Date Range, High Volume, Search
  const [quickFilterChip, setQuickFilterChip] = useState<'ALL' | 'WORKING' | 'SUNDAY_HOLIDAY' | 'HIGH_VOLUME'>('ALL');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [searchDayQuery, setSearchDayQuery] = useState('');

  // Effective displayed KM / Rate / Working Days (strictly locked when official Oct 2026 dataset is active)
  const isLocked = Boolean(fuelSummary.isDepartmentLocked);
  const effectiveDailyKm = isLocked ? fuelSummary.sanctionedDailyKm : customDailyKm;
  const effectiveFuelRate = isLocked ? fuelSummary.fuelRatePerKm : customFuelRate;
  const effectiveWorkingDays = isLocked ? fuelSummary.workingDays : customWorkingDays;

  // Keep beat in sync if user changes
  useEffect(() => {
    if (initialBeat) {
      setSelectedBeat(initialBeat);
    } else if (currentStaff?.beat) {
      setSelectedBeat(currentStaff.beat);
      const km = masterDataService.getBeatCustomKm(currentStaff.beat);
      setCustomDailyKm(km);
    }
  }, [initialBeat, currentStaff?.beat]);

  // Recalculate summary when beat, month, custom KM, rate or working days change
  const refreshSummary = () => {
    const summary = masterDataService.generatePostmanMonthlyFuelBill(selectedBeat, selectedMonth, {
      customDailyKm: selectedMonth === '2026-10' ? undefined : customDailyKm,
      customRatePerKm: selectedMonth === '2026-10' ? undefined : customFuelRate,
      customWorkingDays: selectedMonth === '2026-10' ? undefined : customWorkingDays,
      vehicleNo: customVehicleNo,
      postmanName: selectedMonth === '2026-10' ? undefined : currentStaff?.name,
      employeeId: selectedMonth === '2026-10' ? undefined : currentStaff?.employeeId,
    });
    setFuelSummary(summary);
    setAllEntries([...operationsService.getDailyEntries()]);
  };

  useEffect(() => {
    refreshSummary();
  }, [selectedBeat, selectedMonth, customDailyKm, customFuelRate, customWorkingDays, customVehicleNo]);

  useEffect(() => {
    const unsubOps = operationsService.subscribe(() => {
      refreshSummary();
    });
    const unsubMaster = masterDataService.subscribe(() => {
      refreshSummary();
    });
    return () => {
      unsubOps();
      unsubMaster();
    };
  }, [selectedBeat, selectedMonth]);

  // Handle Beat Selection change
  const handleBeatChange = (newBeat: string) => {
    setSelectedBeat(newBeat);
    const nextSummary = masterDataService.generatePostmanMonthlyFuelBill(newBeat, selectedMonth);
    setCustomDailyKm(nextSummary.sanctionedDailyKm);
    setCustomFuelRate(nextSummary.fuelRatePerKm);
    setCustomWorkingDays(nextSummary.workingDays);
  };

  // 1-Click Verify & Lock Official Oct 2026 DSS & Fuel Claim (All 33 Beats + Beat 6 Focus)
  const handleVerifyAndLockOfficialSheet = () => {
    const res = masterDataService.syncAndLockOctober2026BeatData();
    refreshSummary();
    const b6 = res.beat6Summary;
    setSyncConfirmNotice({
      title: `Official October 2026 DSS & Fuel Ledger Verified and Department Locked (${res.syncedBeatsCount} Beats / ${res.totalEntriesCount} Daily Logs)`,
      details: `All 33 beats (324009, 324005, 324010) synced with exact 2-decimal precision, zero duplicates, and immutable department locks.`,
      beat6Line: `Beat 6 (${b6.postmanName} · ID: ${b6.employeeId}) Locked: ${b6.workingDays} Working Days × ${b6.dailyKm} KM = ${b6.totalKm} KM @ ₹3.60/KM = ₹${b6.totalClaimAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | PDMS: ${b6.pdmsTotal.toLocaleString('en-IN')} | DSS: ${b6.dssTotal.toLocaleString('en-IN')} | Mobile Usage: ${b6.mobileUsageAvg.toFixed(2)}%`,
    });
  };

  // Open Edit Modal for a specific Day Row
  const handleOpenEditDay = (row: any) => {
    const dssMatch = allEntries.find((e) => e.date === row.isoDate && e.beatNo.toLowerCase() === selectedBeat.toLowerCase());

    const spDeliv = typeof row.sp === 'number' ? row.sp : dssMatch ? dssMatch.speedPostDelivered : 0;
    const spRecd = dssMatch ? dssMatch.speedPostReceived : spDeliv + (spDeliv > 0 ? 2 : 0);

    const regDeliv = typeof row.reg === 'number' ? row.reg : dssMatch ? dssMatch.registryDelivered : 0;
    const regRecd = dssMatch ? dssMatch.registryReceived : regDeliv + (regDeliv > 0 ? 1 : 0);

    const parDeliv = typeof row.others === 'number' ? row.others : dssMatch ? dssMatch.parcelDelivered : 0;
    const parRecd = dssMatch ? dssMatch.parcelReceived : parDeliv + (parDeliv > 0 ? 1 : 0);

    const codAmount = dssMatch ? dssMatch.codAmountCollected || 0 : (spDeliv + parDeliv > 0 ? 2500 : 0);

    setSelectedDayEntry({
      sn: row.sn,
      date: row.date,
      isoDate: row.isoDate,
      status: row.status,
      spRecd,
      spDeliv,
      regRecd,
      regDeliv,
      parRecd,
      parDeliv,
      codAmount,
      remarks: dssMatch?.remarks || `Field delivery round reconciled for ${row.date}`,
    });
    setModalNotice(null);
    setModalNoticeError(false);
  };

  // Save Day Article Entry (Non-destructive patch adhering to Strict Total Lock Rule)
  const handleSaveDayArticleEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDayEntry) return;

    const staffName = currentStaff?.name || fuelSummary.postmanName || 'Mahendra Kumar Meena';
    const staffEmpId = currentStaff?.employeeId || fuelSummary.employeeId || '50457421';

    const curRow = fuelSummary.dailyRows.find((r) => r.sn === selectedDayEntry.sn);
    const dssBenchmark = curRow
      ? typeof curRow.dssInvoicedCount === 'number' && curRow.dssInvoicedCount > 0
        ? curRow.dssInvoicedCount
        : typeof curRow.total === 'number' && curRow.total > 0
        ? curRow.total
        : 0
      : 0;

    const regDeliv = Number(selectedDayEntry.regDeliv) || 0;
    const parDeliv = Number(selectedDayEntry.parDeliv) || 0;
    const finalSpDeliv = dssBenchmark > 0 ? Math.max(0, dssBenchmark - (regDeliv + parDeliv)) : (Number(selectedDayEntry.spDeliv) || 0);
    const finalSpRecd = Math.max(Number(selectedDayEntry.spRecd) || 0, finalSpDeliv);

    const wasAutoAdjusted = dssBenchmark > 0 && finalSpDeliv !== Number(selectedDayEntry.spDeliv);

    const patchResult = operationsService.patchOrUpsertDailyArticleQuantities(
      {
        date: selectedDayEntry.isoDate,
        beatNo: selectedBeat,
        staffName,
        employeeId: staffEmpId,
        staffEmail: currentStaff?.email || 'Ektamahenmeena@gmail.com',
        officeName: fuelSummary.officeName || 'Dadabari S.O. (324009)',
        attendanceStatus: selectedDayEntry.status === 'SUNDAY'
          ? 'Sunday'
          : selectedDayEntry.status === 'HOLIDAY'
          ? 'Gazetted Holiday'
          : selectedDayEntry.status === 'LEAVE'
          ? 'On Leave'
          : 'Present - Field Duty',
        fixedKm: effectiveDailyKm,
        sanctionedBeatKm: fuelSummary.sanctionedDailyKm,
        fuelRatePerKm: effectiveFuelRate,
        dailyFuelAllowance: Number((effectiveDailyKm * effectiveFuelRate).toFixed(2)),
        monthlyFuelAllowance: Number((effectiveDailyKm * effectiveFuelRate * effectiveWorkingDays).toFixed(2)),
        pdmsInvoicedCount: curRow?.pdmsInvoicedCount ?? (dssBenchmark > 0 ? dssBenchmark : undefined),
        dssInvoicedCount: dssBenchmark > 0 ? dssBenchmark : undefined,
        mobileUsagePercent: curRow?.mobileUsagePercent ?? 100,
        dssStatus: 'Reconciled with DSS',
        speedPostReceived: finalSpRecd,
        speedPostDelivered: finalSpDeliv,
        speedPostReturned: Math.max(0, finalSpRecd - finalSpDeliv),
        speedPostDeposit: 0,
        registryReceived: Number(selectedDayEntry.regRecd) || 0,
        registryDelivered: regDeliv,
        registryReturned: Math.max(0, (Number(selectedDayEntry.regRecd) || 0) - regDeliv),
        registryDeposit: 0,
        parcelReceived: Number(selectedDayEntry.parRecd) || 0,
        parcelDelivered: parDeliv,
        parcelReturned: Math.max(0, (Number(selectedDayEntry.parRecd) || 0) - parDeliv),
        parcelDeposit: 0,
        codAmountCollected: Number(selectedDayEntry.codAmount) || 0,
        doorstepInquiriesLogged: 4,
        remarks: selectedDayEntry.remarks.trim() || `Beat delivery round reconciled for ${selectedDayEntry.date}`,
      },
      {
        updatedBy: `${staffName} (${staffEmpId}) [All-Day Overview Hub]`,
        remarks: wasAutoAdjusted
          ? `DSS Priority Enforced: Speed Post auto-balanced to ${finalSpDeliv} to preserve official DSS total of ${dssBenchmark}.`
          : `Safe article quantity update for ${selectedDayEntry.date}. Strict Total Lock Rule maintained.`,
      }
    );

    if (patchResult.success) {
      setModalNoticeError(false);
      if (wasAutoAdjusted) {
        setModalNotice(`Day ${selectedDayEntry.sn} saved! Master DSS Priority Enforced: Speed Post auto-adjusted to ${finalSpDeliv} (Total locked to ${dssBenchmark}).`);
      } else {
        setModalNotice(`Day ${selectedDayEntry.sn} (${selectedDayEntry.date}) article counts saved & fuel sheet updated!`);
      }
      refreshSummary();
      setTimeout(() => {
        setSelectedDayEntry(null);
        setModalNotice(null);
      }, 1600);
    } else {
      setModalNoticeError(true);
      setModalNotice(patchResult.message || 'Record is Department Locked and cannot be modified.');
    }
  };

  // Audit Totals Calculation (PDMS, DSS, Mobile Usage %)
  const totalsInvoiced = useMemo(() => {
    let pdmsSum = 0;
    let dssSum = 0;
    let mobSum = 0;
    let workingCount = 0;
    fuelSummary.dailyRows.forEach((r) => {
      if (r.status === 'WORKING') {
        workingCount++;
        const p = typeof r.pdmsInvoicedCount === 'number' ? r.pdmsInvoicedCount : (typeof r.total === 'number' ? r.total : 0);
        const d = typeof r.dssInvoicedCount === 'number' ? r.dssInvoicedCount : (typeof r.total === 'number' ? r.total : 0);
        const m = typeof r.mobileUsagePercent === 'number' ? r.mobileUsagePercent : (typeof r.pmaPercent === 'number' ? r.pmaPercent : 100);
        pdmsSum += p;
        dssSum += d;
        mobSum += m;
      }
    });
    return {
      pdmsSum,
      dssSum,
      mobAvg: workingCount > 0 ? (mobSum / workingCount).toFixed(2) : '100.00',
    };
  }, [fuelSummary.dailyRows]);

  // Export CSV Sheet of all 31 Days
  const handleExportCsv = () => {
    const headers = [
      'S.No.',
      'Date (DD-MM-YYYY)',
      'ISO Date',
      'Day Status',
      'Speed Post (Deliv)',
      'Registry (Deliv)',
      'Parcels/Others (Deliv)',
      'Total Articles (Locked)',
      'PDMS Invoiced Count (Col G)',
      'DSS Invoiced Count (Col H)',
      'Mobile Usage % (Col I)',
      'Beat Number',
      'Postman Name',
      'Employee ID',
      'Daily KM',
      'Fuel Rate (INR/KM)',
    ];

    const rows = fuelSummary.dailyRows.map((r) => [
      r.sn,
      r.date,
      r.isoDate,
      r.status,
      r.status === 'WORKING' ? r.sp : r.status,
      r.status === 'WORKING' ? (r.reg === '' ? 0 : r.reg) : '',
      r.status === 'WORKING' ? (r.others === '' ? 0 : r.others) : r.status,
      r.status === 'WORKING' ? r.total : r.status,
      r.status === 'WORKING' ? (r.pdmsInvoicedCount !== undefined ? r.pdmsInvoicedCount : r.total) : r.status,
      r.status === 'WORKING' ? (r.dssInvoicedCount !== undefined ? r.dssInvoicedCount : r.total) : r.status,
      r.status === 'WORKING' ? (r.mobileUsagePercent !== undefined ? `${r.mobileUsagePercent}%` : `${r.pmaPercent}%`) : '',
      fuelSummary.beatNo,
      fuelSummary.postmanName,
      fuelSummary.employeeId,
      effectiveDailyKm,
      effectiveFuelRate,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `${fuelSummary.postmanName.replace(/\s+/g, '_')}_${fuelSummary.beatNo.replace(/\s+/g, '_')}_Fuel_DSS_${fuelSummary.month}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered rows for the day table
  const filteredDailyRows = useMemo(() => {
    return fuelSummary.dailyRows.filter((r) => {
      // 1. Quick Filter Chips
      if (quickFilterChip === 'WORKING' && r.status !== 'WORKING') return false;
      if (quickFilterChip === 'SUNDAY_HOLIDAY' && r.status !== 'SUNDAY' && r.status !== 'HOLIDAY' && r.status !== 'LEAVE') return false;
      if (quickFilterChip === 'HIGH_VOLUME') {
        const totalCount =
          typeof r.total === 'number'
            ? r.total
            : (r.sp || 0) + (r.reg || 0) + (r.others || 0);
        const invoiced = r.dssInvoicedCount || r.pdmsInvoicedCount || 0;
        if (totalCount <= 50 && invoiced <= 50) return false;
      }

      // 2. Date Range Filter
      if (startDateFilter && r.isoDate < startDateFilter) return false;
      if (endDateFilter && r.isoDate > endDateFilter) return false;

      // 3. Search Query (matches date, day number, status, or remarks)
      if (searchDayQuery.trim() !== '') {
        const q = searchDayQuery.trim().toLowerCase();
        const dssMatch = allEntries.find(
          (e) => e.date === r.isoDate && e.beatNo.toLowerCase() === selectedBeat.toLowerCase()
        );
        const remarksStr = (dssMatch?.remarks || r.remarks || '').toLowerCase();
        const dateStr = r.date.toLowerCase();
        const snStr = String(r.sn);
        const statusStr = r.status.toLowerCase();

        if (
          !dateStr.includes(q) &&
          !snStr.includes(q) &&
          !statusStr.includes(q) &&
          !remarksStr.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [fuelSummary.dailyRows, quickFilterChip, startDateFilter, endDateFilter, searchDayQuery, allEntries, selectedBeat]);

  return (
    <div className={`space-y-6 ${embedded ? '' : 'max-w-7xl mx-auto p-4 sm:p-6'}`}>
      {/* ======================================================== */}
      {/* 1. TOP HEADER & BEAT CONTEXT STRIP                      */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-red-800/40 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/80 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wide">
                <ShieldCheck size={14} className="text-amber-400" />
                <span>Reference Postman Operations · {fuelSummary.postmanName} ({fuelSummary.employeeId})</span>
              </div>
              {isLocked && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-400/60 text-emerald-300 text-xs font-black tracking-wide shadow-xs">
                  <Lock size={13} className="text-amber-400" />
                  <span>Department Locked (Immutable)</span>
                </div>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>{fuelSummary.beatNo} All-Day Article Entry & Fuel Bill Hub</span>
            </h1>
            <p className="text-xs sm:text-sm text-red-100/90 max-w-3xl leading-relaxed">
              Official India Post Operations OS (Dadabari S.O. · Office ID {fuelSummary.officeId || '28660686'} · Pincodes {(fuelSummary.linkedPincodes || ['324009', '324005', '324010']).join(', ')}). All {fuelSummary.totalDaysInMonth} days of <strong>{fuelSummary.monthName}</strong> with Speed Post, Registered Letters, Parcels, PDMS/DSS verification, and exact beat route fuel calculation.
            </p>
          </div>

          {/* Quick Month & Beat Switcher Strip */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div>
              <label className="block text-[10px] text-amber-300/80 uppercase font-bold mb-1">Beat Assignment</label>
              <select
                value={selectedBeat}
                onChange={(e) => handleBeatChange(e.target.value)}
                className="px-3.5 py-2 bg-slate-900/90 border border-slate-700 text-white rounded-xl text-xs font-bold focus:outline-none focus:border-amber-400"
              >
                {ALL_33_BEATS_FUEL_DATA.map((b) => (
                  <option key={b.beatNumber} value={b.beatNumber}>
                    {b.beatNumber} - {b.assignedPostmanName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-amber-300/80 uppercase font-bold mb-1">Billing Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3.5 py-1.5 bg-slate-900/90 border border-slate-700 text-amber-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-end gap-2 pt-5">
              <button
                type="button"
                onClick={handleVerifyAndLockOfficialSheet}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Verify & Lock Official October 2026 DSS Sheet across all 33 beats (including Beat 6 Ramkishan Meghwal)"
              >
                <Lock size={14} />
                <span>Verify & Lock Oct 2026 Sheet</span>
              </button>
              <button
                type="button"
                onClick={() => masterDataService.downloadPostmanFuelBillPDF(fuelSummary, { vehicleNo: customVehicleNo })}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Download Official Fuel Bill matching MAHEN FUEL.pdf format"
              >
                <Printer size={15} />
                <span>Download Fuel Bill (PDF)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Notice Toast after Verify & Lock */}
        {syncConfirmNotice && (
          <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-400/60 text-emerald-100 flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5 text-xs">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-black text-emerald-300">{syncConfirmNotice.title}</div>
                <div className="text-emerald-100/90">{syncConfirmNotice.details}</div>
                <div className="font-mono text-[11px] bg-slate-950/70 border border-emerald-700/60 px-2.5 py-1.5 rounded-lg text-amber-300">
                  {syncConfirmNotice.beat6Line}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSyncConfirmNotice(null)}
              className="text-emerald-300 hover:text-white p-1"
              aria-label="Dismiss confirmation"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. BEAT TERRITORIAL MAP & CALCULATION ENGINE BOX        */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 bg-slate-950/80 rounded-2xl border border-red-700/60 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MapPin size={17} className="text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-amber-300 block">
                  Beat Territorial Route Map & Delivery Coverage
                </span>
                <span className="text-[11px] text-slate-300">
                  {fuelSummary.territorialCoverage || 'Keshavpura Sectors 6 & 7, Santoshi Nagar, TVS Circle, CAD Circle corridor'} (PIN: {(fuelSummary.linkedPincodes || [fuelSummary.pincode || '324009']).join(', ')})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-400 font-mono font-bold">
                Statutory Rate: ₹{Number(effectiveFuelRate || 3.6).toFixed(2)} / KM
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-600/50 text-blue-300 font-mono font-bold">
                Working Days: {fuelSummary.workingDays} Days
              </span>
              {isLocked && (
                <span className="px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono font-bold flex items-center gap-1">
                  <Lock size={11} /> Immutable DSS Lock
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Postman KM Adjuster (Locked when Official Department Dataset is Active) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Daily Running Distance (KM / Day)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="100"
                  disabled={isLocked}
                  value={effectiveDailyKm}
                  onChange={(e) => setCustomDailyKm(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-black text-sm focus:border-amber-400 focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                  KM/d
                </span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Fuel Allowance Rate (₹ / KM)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.10"
                  disabled={isLocked}
                  value={effectiveFuelRate}
                  onChange={(e) => setCustomFuelRate(parseFloat(e.target.value) || 3.60)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-mono font-bold text-sm focus:border-amber-400 focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                  ₹/KM
                </span>
              </div>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Duty / Working Days in Month
              </label>
              <input
                type="number"
                min="1"
                max="31"
                disabled={isLocked}
                value={effectiveWorkingDays}
                onChange={(e) => setCustomWorkingDays(parseInt(e.target.value) || 25)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold text-sm focus:border-amber-400 focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Two-Wheeler Reg. No.
              </label>
              <input
                type="text"
                value={customVehicleNo}
                onChange={(e) => setCustomVehicleNo(e.target.value.toUpperCase())}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold text-sm uppercase focus:border-amber-400 focus:outline-none"
                placeholder="RJ-20-SP-2026"
              />
            </div>
          </div>

          {/* Real-Time Formula & Odometer Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-800 text-slate-300">
            <div className="font-mono flex flex-wrap items-center gap-2">
              <span className="text-amber-400 font-bold">Calculation Breakdown:</span>
              <span>
                {effectiveWorkingDays} Days × {effectiveDailyKm} KM/d = <strong className="text-white">{fuelSummary.totalMonthlyKm} KM</strong> × ₹{Number(effectiveFuelRate || 3.6).toFixed(2)}/KM ={' '}
                <strong className="text-emerald-400 text-base font-black">
                  ₹{fuelSummary.totalClaimAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {kmSavedNotice && (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} /> {kmSavedNotice}
                </span>
              )}
              {isLocked ? (
                <span className="px-3 py-1 bg-slate-900 border border-amber-500/40 text-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
                  <Lock size={11} /> Locked by Department Audit ({fuelSummary.lockedBy || 'Official DSS'})
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const def = getBeatFuelMapping(selectedBeat);
                      setCustomDailyKm(def.sanctionedDailyKm);
                      setCustomFuelRate(DEPARTMENTAL_FUEL_RATE_PER_KM);
                      setCustomWorkingDays(25);
                      masterDataService.resetBeatCustomKm(selectedBeat);
                      setKmSavedNotice('Reset to beat sanctioned route KM.');
                      setTimeout(() => setKmSavedNotice(null), 3000);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] transition flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={11} /> Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      masterDataService.setBeatCustomKm(selectedBeat, customDailyKm);
                      setKmSavedNotice(`Saved! ${customDailyKm} KM running set for ${selectedBeat}.`);
                      setTimeout(() => setKmSavedNotice(null), 3500);
                    }}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-[11px] transition flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Check size={12} /> Save KM
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MONTH METRIC CARDS (ALL-DAY AGGREGATES)               */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Days</span>
          <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
            {fuelSummary.totalDaysInMonth} <span className="text-xs font-normal text-slate-500">Days</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
            {fuelSummary.workingDays} Duty / {fuelSummary.sundaysAndHolidays} Off
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Speed Post</span>
          <div className="text-xl font-black text-blue-700 font-mono mt-0.5">
            {fuelSummary.totalSpeedPostDelivered}
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5 font-semibold">
            100% PMA Deliv
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Letters</span>
          <div className="text-xl font-black text-purple-700 font-mono mt-0.5">
            {fuelSummary.totalRegistryDelivered}
          </div>
          <div className="text-[11px] text-purple-700 mt-0.5 font-semibold">
            Accountable Mail
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Parcels & Others</span>
          <div className="text-xl font-black text-amber-700 font-mono mt-0.5">
            {fuelSummary.totalParcelsDelivered}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            COD & Accountable
          </div>
        </div>

        <div className="bg-red-50 p-3.5 rounded-2xl border border-red-200 shadow-xs">
          <span className="text-[10px] font-bold text-red-900 uppercase tracking-wider flex items-center gap-1">
            <Lock size={10} /> Total Articles (Locked)
          </span>
          <div className="text-2xl font-black text-red-950 font-mono mt-0.5">
            {fuelSummary.totalArticlesDelivered}
          </div>
          <div className="text-[10px] text-red-800 mt-0.5 font-semibold">
            Tamper-Proof Auto-Sum
          </div>
        </div>

        <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            {isLocked && <Lock size={10} className="text-emerald-700" />} Fuel Allowance
          </span>
          <div className="text-2xl font-black text-emerald-950 font-mono mt-0.5">
            ₹{fuelSummary.totalClaimAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5 font-mono">
            {fuelSummary.totalMonthlyKm} KM @ ₹{Number(effectiveFuelRate || 3.6).toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mobile Usage Avg</span>
          <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
            {Number(fuelSummary.mobileUsageAvgPercent ?? fuelSummary.averageDeliveryPercentage ?? 100).toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Doorstep Delivery OK
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. COLLAPSIBLE MONTHLY DELIVERY & ARTICLE LOG OVERVIEW  */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
        {/* Accordion Master Header with Compact Summary Strip (Always Visible) */}
        <div
          onClick={() => setIsTableExpanded(!isTableExpanded)}
          className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-800/90 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/30 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">
                  Monthly Delivery & Article Log Overview
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-700 text-white border border-red-500/50">
                  {fuelSummary.beatNo}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                  {fuelSummary.monthName}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Dadabari S.O. (324009) · 31 Days Consolidated Article Delivery & Odometer Log
              </p>
            </div>
          </div>

          {/* Compact Summary Strip (Visible Even When Collapsed) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Articles:</span>
              <span className="font-black text-white font-mono">
                {fuelSummary.totalArticlesDelivered.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Avg Delivery / PMA:</span>
              <span className="font-black text-emerald-400 font-mono">
                {Number(fuelSummary.averageDeliveryPercentage ?? fuelSummary.pmaDeliveryRate ?? 100).toFixed(2)}%
              </span>
            </div>

            <div className="bg-emerald-950/80 border border-emerald-600/50 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-emerald-300">Fuel Claim:</span>
              <span className="font-black text-emerald-300 font-mono">
                ₹{fuelSummary.totalClaimAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-emerald-400/80">({fuelSummary.workingDays}d × {effectiveDailyKm}km @ ₹{Number(effectiveFuelRate || 3.6).toFixed(2)})</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsTableExpanded(!isTableExpanded);
              }}
              className="ml-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 text-xs font-bold transition border border-white/15"
              aria-label={isTableExpanded ? 'Collapse Table' : 'Expand Table'}
            >
              {isTableExpanded ? (
                <>
                  <span>Collapse Table</span>
                  <ChevronUp size={16} />
                </>
              ) : (
                <>
                  <span>Expand Table ({filteredDailyRows.length} Days)</span>
                  <ChevronDown size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Content Section */}
        {isTableExpanded && (
          <div>
            {/* Interactive Filter & Date Range Toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Quick Filter Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider mr-1">
                  Filters:
                </span>
                {[
                  { id: 'ALL', label: `All Days (${fuelSummary.dailyRows.length})` },
                  { id: 'WORKING', label: `Working Days (${fuelSummary.workingDays})` },
                  { id: 'SUNDAY_HOLIDAY', label: `Off / Leave (${fuelSummary.dailyRows.length - fuelSummary.workingDays})` },
                  { id: 'HIGH_VOLUME', label: 'High Volume (>50 Articles)' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setQuickFilterChip(chip.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                      quickFilterChip === chip.id
                        ? 'bg-red-700 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>

              {/* Date Range & Instant Search */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Date Range Inputs */}
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-300 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 pl-1">From:</span>
                  <input
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    className="p-1 text-xs font-mono font-bold text-slate-800 bg-transparent focus:outline-none"
                  />
                  <span className="text-slate-300">→</span>
                  <span className="text-[10px] font-bold text-slate-400">To:</span>
                  <input
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    className="p-1 text-xs font-mono font-bold text-slate-800 bg-transparent focus:outline-none"
                  />
                  {(startDateFilter || endDateFilter) && (
                    <button
                      type="button"
                      onClick={() => {
                        setStartDateFilter('');
                        setEndDateFilter('');
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                      title="Clear date range"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Instant Search Input */}
                <div className="relative w-40 sm:w-52">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search date / remarks..."
                    value={searchDayQuery}
                    onChange={(e) => setSearchDayQuery(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-red-700"
                  />
                  {searchDayQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchDayQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Export CSV Button */}
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download size={13} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Row Counter Strip */}
            <div className="px-5 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span>Showing <strong>{filteredDailyRows.length}</strong> of <strong>{fuelSummary.dailyRows.length}</strong> calendar days</span>
                {(quickFilterChip !== 'ALL' || startDateFilter || endDateFilter || searchDayQuery) && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                    Filtered View Active
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Speed Post + Reg (0) + Parcels = Reconciled with DSS Statement
              </div>
            </div>

        {/* Official Department Locked Audit Verification Banner */}
        {isLocked && (
          <div className="mx-4 sm:mx-6 my-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-red-950/90 to-emerald-950/80 border border-amber-500/50 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-amber-300 text-sm">
                    {fuelSummary.beatNo} Official Department Audit · {fuelSummary.postmanName} ({fuelSummary.employeeId})
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 font-bold text-[10px]">
                    Department Locked · Immutable
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-600 text-slate-200 font-mono text-[10px]">
                    PIN: {(fuelSummary.linkedPincodes || ['324009']).join(', ')}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                  Official DSS Sheet ({fuelSummary.departmentLockSource || 'DSS REPORT OCT.26'}):{' '}
                  <strong>PDMS Invoiced: {(fuelSummary.pdmsInvoicedTotal ?? totalsInvoiced.pdmsSum).toLocaleString('en-IN')}</strong> ·{' '}
                  <strong>DSS Invoiced: {(fuelSummary.dssInvoicedTotal ?? totalsInvoiced.dssSum).toLocaleString('en-IN')}</strong> ·{' '}
                  <strong>Mobile Usage Avg: {Number(fuelSummary.mobileUsageAvgPercent ?? totalsInvoiced.mobAvg).toFixed(2)}%</strong> ·{' '}
                  <strong>Working Days: {fuelSummary.workingDays}</strong>
                  {(selectedBeat === 'Beat 6' || selectedBeat === '6') && ' (13-10-2026 & 22-10-2026 Absent = LEAVE · Contact: 9664215130)'}
                  {(selectedBeat === 'Beat 5' || selectedBeat === '5') && ' (19-10-2026 & 21-10-2026 Absent = LEAVE)'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Locked Statutory Fuel Claim</span>
                <span className="text-sm font-black font-mono text-emerald-400">
                  {fuelSummary.workingDays} Days × {fuelSummary.sanctionedDailyKm} KM @ ₹{fuelSummary.fuelRatePerKm.toFixed(2)} = ₹{fuelSummary.totalClaimAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 31-Day Interactive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-3 font-bold w-12 text-center">S.N.</th>
                <th className="py-3 px-3 font-bold">Date (DD-MM-YYYY)</th>
                <th className="py-3 px-3 font-bold">Duty Status</th>
                <th className="py-3 px-3 font-bold text-center">Speed Post</th>
                <th className="py-3 px-3 font-bold text-center">
                  Registered (0)
                </th>
                <th className="py-3 px-3 font-bold text-center">Parcels/Others</th>
                <th className="py-3 px-3 font-bold text-center text-red-900 bg-red-50/50">
                  Total (Locked)
                </th>
                <th className="py-3 px-3 font-bold text-center text-blue-900 bg-blue-50/50">
                  PDMS Invoiced Count
                </th>
                <th className="py-3 px-3 font-bold text-center text-indigo-900 bg-indigo-50/50">
                  DSS Invoiced Count
                </th>
                <th className="py-3 px-3 font-bold text-center text-emerald-900 bg-emerald-50/50">
                  Mobile Usage %
                </th>
                <th className="py-3 px-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredDailyRows.map((r) => {
                const isWorking = r.status === 'WORKING';
                const isSunday = r.status === 'SUNDAY';
                const isHoliday = r.status === 'HOLIDAY';
                const isLeave = r.status === 'LEAVE';

                return (
                  <tr
                    key={r.sn}
                    className={`transition ${
                      isSunday
                        ? 'bg-blue-50/40 hover:bg-blue-50/70 text-slate-600'
                        : isHoliday
                        ? 'bg-amber-50/50 hover:bg-amber-50/80 text-amber-950 font-semibold'
                        : isLeave
                        ? 'bg-rose-50/60 hover:bg-rose-50/90 text-rose-950 font-semibold'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-center text-slate-500">
                      {r.sn}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {r.date}
                    </td>

                    <td className="py-2.5 px-3">
                      {isSunday ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px]">
                          Sunday
                        </span>
                      ) : isHoliday ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                          {r.sn === 2
                            ? 'Gandhi Jayanti (Gazetted)'
                            : r.sn === 20
                            ? 'Dussehra / Vijayadashami'
                            : 'Gazetted Holiday'}
                        </span>
                      ) : isLeave ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-200 font-bold text-[10px]">
                          Absent / Leave
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                          Field Duty
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      {isWorking ? (
                        <span className="text-blue-800">{r.sp}</span>
                      ) : (
                        <span className="text-slate-400 italic font-normal">{r.sp}</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      {isWorking ? (
                        <span className={Number(r.reg) === 0 ? 'text-slate-500 font-normal' : 'text-purple-800'}>
                          {Number(r.reg) === 0 ? 0 : r.reg}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">0</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      {isWorking ? (
                        <span className="text-amber-800">{r.others !== '' ? r.others : 0}</span>
                      ) : (
                        <span className="text-slate-400 italic font-normal">{r.others}</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono font-black bg-red-50/30">
                      {isWorking ? (
                        <span className="text-red-950 px-2 py-0.5 rounded-lg bg-red-100 border border-red-200">
                          {r.total}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic font-normal">{r.total}</span>
                      )}
                    </td>

                    {/* Col G: PDMS Invoiced Count */}
                    <td className="py-2.5 px-3 text-center font-mono font-bold bg-blue-50/20">
                      {isWorking ? (
                        <span className="text-blue-900 font-black">
                          {r.pdmsInvoicedCount !== undefined ? r.pdmsInvoicedCount : r.total}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic font-normal">{r.pdmsInvoicedCount || '—'}</span>
                      )}
                    </td>

                    {/* Col H: DSS Invoiced Count */}
                    <td className="py-2.5 px-3 text-center font-mono font-bold bg-indigo-50/20">
                      {isWorking ? (
                        <span className="text-indigo-900 font-black">
                          {r.dssInvoicedCount !== undefined ? r.dssInvoicedCount : r.total}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic font-normal">{r.dssInvoicedCount || '—'}</span>
                      )}
                    </td>

                    {/* Col I: Mobile Usage % */}
                    <td className="py-2.5 px-3 text-center font-mono font-bold bg-emerald-50/20">
                      {isWorking ? (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-black ${
                            Number(r.mobileUsagePercent || r.pmaPercent) === 100
                              ? 'text-emerald-700 bg-emerald-100'
                              : 'text-amber-800 bg-amber-100 border border-amber-300'
                          }`}
                        >
                          {r.mobileUsagePercent !== undefined ? (typeof r.mobileUsagePercent === 'number' ? `${r.mobileUsagePercent}%` : r.mobileUsagePercent) : `${r.pmaPercent}%`}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic font-normal">—</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {isLocked ? (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-500 ml-auto cursor-not-allowed"
                          title="Department Locked (Immutable official DSS record)"
                        >
                          <Lock size={11} className="text-amber-600" />
                          <span>Locked</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenEditDay(r)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 hover:border-slate-400 rounded-lg text-[11px] font-bold text-slate-700 transition flex items-center gap-1 ml-auto cursor-pointer shadow-2xs"
                          title={`Edit article counts for Day ${r.sn} (${r.date})`}
                        >
                          <Edit3 size={12} className="text-red-700" />
                          <span>Edit Day</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totals Row */}
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-800">
                <td className="py-3 px-3 text-center" colSpan={3}>
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider px-2">
                    <span>Month Totals ({fuelSummary.workingDays} Working Days)</span>
                    <span className="text-amber-400 font-mono text-[11px]">
                      {fuelSummary.workingDays} Days × {effectiveDailyKm} KM @ ₹{Number(effectiveFuelRate || 3.6).toFixed(2)}/KM = ₹{fuelSummary.totalClaimAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center font-mono font-black text-blue-300">
                  {fuelSummary.totalSpeedPostDelivered}
                </td>
                <td className="py-3 px-3 text-center font-mono font-black text-purple-300">
                  {fuelSummary.totalRegistryDelivered === 0 ? 0 : fuelSummary.totalRegistryDelivered}
                </td>
                <td className="py-3 px-3 text-center font-mono font-black text-amber-300">
                  {fuelSummary.totalParcelsDelivered}
                </td>
                <td className="py-3 px-3 text-center font-mono font-black text-white bg-slate-950">
                  {fuelSummary.totalArticlesDelivered}
                </td>
                <td className="py-3 px-3 text-center font-mono font-black text-blue-300 bg-slate-950">
                  {totalsInvoiced.pdmsSum}
                </td>
                <td className="py-3 px-3 text-center font-mono font-black text-indigo-300 bg-slate-950">
                  {totalsInvoiced.dssSum}
                </td>
                <td className="py-3 px-3 text-center font-mono font-black text-emerald-400 bg-slate-950">
                  {totalsInvoiced.mobAvg}%
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => masterDataService.downloadPostmanFuelBillPDF(fuelSummary, { vehicleNo: customVehicleNo })}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[10px] font-black transition cursor-pointer"
                  >
                    PDF
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )}
  </div>

      {/* ======================================================== */}
      {/* 5. 1-CLICK SAFE DAY ARTICLE ENTRY MODAL (STRICT LOCK)    */}
      {/* ======================================================== */}
      {selectedDayEntry && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Lock size={10} /> Protected DSS Reconciliation
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Edit Day {selectedDayEntry.sn} ({selectedDayEntry.date}) · {selectedBeat}
                </h3>
                <p className="text-xs text-slate-500">
                  Update article counts safely. Core DSS records and historical logs are strictly preserved.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayEntry(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {modalNotice && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                  modalNoticeError
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                {modalNoticeError ? (
                  <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                )}
                <span>{modalNotice}</span>
              </div>
            )}

            {/* Dynamic DSS Master Benchmark Info Bar */}
            {(() => {
              const currentDayRow = fuelSummary.dailyRows.find((r) => r.sn === selectedDayEntry.sn);
              const dssBenchmarkTotal = currentDayRow
                ? typeof currentDayRow.dssInvoicedCount === 'number' && currentDayRow.dssInvoicedCount > 0
                  ? currentDayRow.dssInvoicedCount
                  : typeof currentDayRow.total === 'number' && currentDayRow.total > 0
                  ? currentDayRow.total
                  : 0
                : 0;

              const currentDeliveredSum = selectedDayEntry.spDeliv + selectedDayEntry.regDeliv + selectedDayEntry.parDeliv;
              const isAligned = dssBenchmarkTotal === 0 || currentDeliveredSum === dssBenchmarkTotal;

              return (
                <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-amber-400" />
                      <span className="font-bold text-slate-200">
                        Official Master DSS Benchmark:
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold text-xs border border-amber-400/40">
                        {dssBenchmarkTotal > 0 ? `${dssBenchmarkTotal} Articles` : 'Standard Sum'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Sum:</span>
                      <span className={`text-sm font-mono font-black ${isAligned ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {currentDeliveredSum}
                      </span>
                    </div>
                  </div>

                  {!isAligned && dssBenchmarkTotal > 0 && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                      <span className="text-amber-300 flex items-center gap-1 font-medium">
                        <span>⚡ Discrepancy detected: Speed Post will auto-adjust to {Math.max(0, dssBenchmarkTotal - (selectedDayEntry.regDeliv + selectedDayEntry.parDeliv))} upon save.</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const autoSp = Math.max(0, dssBenchmarkTotal - (selectedDayEntry.regDeliv + selectedDayEntry.parDeliv));
                          setSelectedDayEntry({
                            ...selectedDayEntry,
                            spDeliv: autoSp,
                            spRecd: Math.max(autoSp, selectedDayEntry.spRecd),
                          });
                        }}
                        className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md text-[10px] font-black cursor-pointer shadow-xs transition"
                      >
                        Auto-Balance Speed Post
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            <form onSubmit={handleSaveDayArticleEntry} className="space-y-4">
              {/* Category inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Speed Post */}
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-900 block">Speed Post</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">
                      Auto-Adjust Buffer
                    </span>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Delivered</label>
                    <input
                      type="number"
                      min={0}
                      value={selectedDayEntry.spDeliv}
                      onChange={(e) =>
                        setSelectedDayEntry({
                          ...selectedDayEntry,
                          spDeliv: parseInt(e.target.value) || 0,
                          spRecd: Math.max(parseInt(e.target.value) || 0, selectedDayEntry.spRecd),
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg font-mono font-bold text-blue-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Total Received</label>
                    <input
                      type="number"
                      min={0}
                      value={selectedDayEntry.spRecd}
                      onChange={(e) =>
                        setSelectedDayEntry({
                          ...selectedDayEntry,
                          spRecd: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-slate-700 text-xs"
                    />
                  </div>
                </div>

                {/* Registry */}
                <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-purple-900 block">Registry</span>
                    {selectedBeat === 'Beat 17' || selectedBeat === '17' || selectedBeat === 'Beat 5' || selectedBeat === '5' ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold">
                        Jurisdiction: 0
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Delivered</label>
                    <input
                      type="number"
                      min={0}
                      value={selectedDayEntry.regDeliv}
                      onChange={(e) => {
                        const newReg = parseInt(e.target.value) || 0;
                        const curRow = fuelSummary.dailyRows.find((r) => r.sn === selectedDayEntry.sn);
                        const dssTarget = curRow ? (typeof curRow.dssInvoicedCount === 'number' ? curRow.dssInvoicedCount : (typeof curRow.total === 'number' ? curRow.total : 0)) : 0;
                        const balancedSp = dssTarget > 0 ? Math.max(0, dssTarget - (newReg + selectedDayEntry.parDeliv)) : selectedDayEntry.spDeliv;

                        setSelectedDayEntry({
                          ...selectedDayEntry,
                          regDeliv: newReg,
                          regRecd: Math.max(newReg, selectedDayEntry.regRecd),
                          spDeliv: balancedSp,
                          spRecd: Math.max(balancedSp, selectedDayEntry.spRecd),
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-purple-300 rounded-lg font-mono font-bold text-purple-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Total Received</label>
                    <input
                      type="number"
                      min={0}
                      value={selectedDayEntry.regRecd}
                      onChange={(e) =>
                        setSelectedDayEntry({
                          ...selectedDayEntry,
                          regRecd: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-slate-700 text-xs"
                    />
                  </div>
                </div>

                {/* Parcels */}
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                  <span className="font-bold text-xs text-amber-900 block">Parcels/Others</span>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Delivered</label>
                    <input
                      type="number"
                      min={0}
                      value={selectedDayEntry.parDeliv}
                      onChange={(e) => {
                        const newPar = parseInt(e.target.value) || 0;
                        const curRow = fuelSummary.dailyRows.find((r) => r.sn === selectedDayEntry.sn);
                        const dssTarget = curRow ? (typeof curRow.dssInvoicedCount === 'number' ? curRow.dssInvoicedCount : (typeof curRow.total === 'number' ? curRow.total : 0)) : 0;
                        const balancedSp = dssTarget > 0 ? Math.max(0, dssTarget - (selectedDayEntry.regDeliv + newPar)) : selectedDayEntry.spDeliv;

                        setSelectedDayEntry({
                          ...selectedDayEntry,
                          parDeliv: newPar,
                          parRecd: Math.max(newPar, selectedDayEntry.parRecd),
                          spDeliv: balancedSp,
                          spRecd: Math.max(balancedSp, selectedDayEntry.spRecd),
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg font-mono font-bold text-amber-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Total Received</label>
                    <input
                      type="number"
                      min={0}
                      value={selectedDayEntry.parRecd}
                      onChange={(e) =>
                        setSelectedDayEntry({
                          ...selectedDayEntry,
                          parRecd: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-slate-700 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Strict Total Lock Rule Display */}
              <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-amber-400" />
                  <span className="font-semibold text-slate-300">
                    Calculated Total Accountable Articles (Auto-Summed & Locked):
                  </span>
                </div>
                <span className="text-xl font-mono font-black text-amber-400">
                  {selectedDayEntry.spDeliv + selectedDayEntry.regDeliv + selectedDayEntry.parDeliv}
                </span>
              </div>

              {/* COD Amount & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    COD Cash Collected (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={selectedDayEntry.codAmount}
                    onChange={(e) =>
                      setSelectedDayEntry({
                        ...selectedDayEntry,
                        codAmount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Beat Return / Verification Remarks
                  </label>
                  <input
                    type="text"
                    value={selectedDayEntry.remarks}
                    onChange={(e) =>
                      setSelectedDayEntry({
                        ...selectedDayEntry,
                        remarks: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                    placeholder="e.g. Beat round completed via PMA"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedDayEntry(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check size={14} />
                  <span>Save Article Counts</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
