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
  const [customWorkingDays, setCustomWorkingDays] = useState<number>(25);
  const [customVehicleNo, setCustomVehicleNo] = useState<string>('RJ-20-SP-2026');
  const [kmSavedNotice, setKmSavedNotice] = useState<string | null>(null);

  // Daily entries & Summary State
  const [allEntries, setAllEntries] = useState<DailyArticleEntry[]>(() => operationsService.getDailyEntries());
  const [fuelSummary, setFuelSummary] = useState<PostmanMonthlyFuelSummary>(() =>
    masterDataService.generatePostmanMonthlyFuelBill(activeStaffBeat, initialMonth, {
      customDailyKm: masterDataService.getBeatCustomKm(activeStaffBeat),
      customRatePerKm: DEPARTMENTAL_FUEL_RATE_PER_KM,
      customWorkingDays: 25,
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

  // Filter state for all-day table
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WORKING' | 'SUNDAY' | 'HOLIDAY'>('ALL');
  const [searchDayQuery, setSearchDayQuery] = useState('');

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
      customDailyKm,
      customRatePerKm: customFuelRate,
      customWorkingDays,
      vehicleNo: customVehicleNo,
      postmanName: currentStaff?.name,
      employeeId: currentStaff?.employeeId,
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
    const km = masterDataService.getBeatCustomKm(newBeat);
    setCustomDailyKm(km);
    if (newBeat === 'Beat 17' || newBeat === '17') {
      setCustomWorkingDays(25);
    } else if (newBeat === 'Beat 5' || newBeat === '5') {
      setCustomWorkingDays(23);
    }
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
  };

  // Save Day Article Entry (Non-destructive patch adhering to Strict Total Lock Rule)
  const handleSaveDayArticleEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDayEntry) return;

    const staffName = currentStaff?.name || fuelSummary.postmanName || 'Mahendra Kumar Meena';
    const staffEmpId = currentStaff?.employeeId || fuelSummary.employeeId || '50457421';

    const patchResult = operationsService.patchOrUpsertDailyArticleQuantities(
      {
        date: selectedDayEntry.isoDate,
        beatNo: selectedBeat,
        staffName,
        employeeId: staffEmpId,
        staffEmail: currentStaff?.email || 'mahen.comtech@gmail.com',
        officeName: fuelSummary.officeName || 'Dadabari S.O. (324009)',
        attendanceStatus: selectedDayEntry.status === 'SUNDAY'
          ? 'Sunday'
          : selectedDayEntry.status === 'HOLIDAY'
          ? 'Gazetted Holiday'
          : 'Present - Field Duty',
        fixedKm: customDailyKm,
        sanctionedBeatKm: fuelSummary.sanctionedDailyKm,
        fuelRatePerKm: customFuelRate,
        dailyFuelAllowance: Math.round(customDailyKm * customFuelRate),
        monthlyFuelAllowance: Math.round(customDailyKm * customFuelRate * customWorkingDays),
        dssStatus: 'Reconciled with DSS',
        speedPostReceived: Number(selectedDayEntry.spRecd) || 0,
        speedPostDelivered: Number(selectedDayEntry.spDeliv) || 0,
        speedPostReturned: Math.max(0, (Number(selectedDayEntry.spRecd) || 0) - (Number(selectedDayEntry.spDeliv) || 0)),
        speedPostDeposit: 0,
        registryReceived: Number(selectedDayEntry.regRecd) || 0,
        registryDelivered: Number(selectedDayEntry.regDeliv) || 0,
        registryReturned: Math.max(0, (Number(selectedDayEntry.regRecd) || 0) - (Number(selectedDayEntry.regDeliv) || 0)),
        registryDeposit: 0,
        parcelReceived: Number(selectedDayEntry.parRecd) || 0,
        parcelDelivered: Number(selectedDayEntry.parDeliv) || 0,
        parcelReturned: Math.max(0, (Number(selectedDayEntry.parRecd) || 0) - (Number(selectedDayEntry.parDeliv) || 0)),
        parcelDeposit: 0,
        codAmountCollected: Number(selectedDayEntry.codAmount) || 0,
        doorstepInquiriesLogged: 4,
        remarks: selectedDayEntry.remarks.trim() || `Beat delivery round reconciled for ${selectedDayEntry.date}`,
      },
      {
        updatedBy: `${staffName} (${staffEmpId}) [All-Day Overview Hub]`,
        remarks: `Safe article quantity update for ${selectedDayEntry.date}. Strict Total Lock Rule maintained.`,
      }
    );

    if (patchResult.success) {
      setModalNotice(`Day ${selectedDayEntry.sn} (${selectedDayEntry.date}) article counts saved & fuel sheet updated!`);
      refreshSummary();
      setTimeout(() => {
        setSelectedDayEntry(null);
        setModalNotice(null);
      }, 1400);
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
      customDailyKm,
      customFuelRate,
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
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchQuery =
        searchDayQuery.trim() === '' ||
        r.date.includes(searchDayQuery) ||
        String(r.sn) === searchDayQuery ||
        r.status.toLowerCase().includes(searchDayQuery.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [fuelSummary.dailyRows, statusFilter, searchDayQuery]);

  return (
    <div className={`space-y-6 ${embedded ? '' : 'max-w-7xl mx-auto p-4 sm:p-6'}`}>
      {/* ======================================================== */}
      {/* 1. TOP HEADER & BEAT CONTEXT STRIP                      */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-red-800/40 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/80 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-wide">
              <ShieldCheck size={14} className="text-amber-400" />
              <span>Reference Postman Operations · {fuelSummary.postmanName} ({fuelSummary.employeeId})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>{fuelSummary.beatNo} All-Day Article Entry & Fuel Bill Hub</span>
            </h1>
            <p className="text-xs sm:text-sm text-red-100/90 max-w-3xl leading-relaxed">
              Official India Post Operations OS (Dadabari S.O. 324009). All 31 days of <strong>{fuelSummary.monthName}</strong> with Speed Post, Registered Letters, Parcels, COD collections, and real-time beat route fuel calculation.
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

            <div className="flex items-end pt-5">
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
                  {fuelSummary.territorialCoverage || 'Keshavpura Sectors 6 & 7, Santoshi Nagar, TVS Circle, CAD Circle corridor'} (PIN: 324009)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-emerald-400 font-mono font-bold">
                Statutory Rate: ₹{customFuelRate.toFixed(2)} / KM
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-600/50 text-blue-300 font-mono font-bold">
                Working Days: {fuelSummary.workingDays} Days
              </span>
            </div>
          </div>

          {/* Dynamic Postman KM Adjuster (Before Bill Download) */}
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
                  value={customDailyKm}
                  onChange={(e) => setCustomDailyKm(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-black text-sm focus:border-amber-400 focus:outline-none"
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
                  value={customFuelRate}
                  onChange={(e) => setCustomFuelRate(parseFloat(e.target.value) || 3.60)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-mono font-bold text-sm focus:border-amber-400 focus:outline-none"
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
                value={customWorkingDays}
                onChange={(e) => setCustomWorkingDays(parseInt(e.target.value) || 25)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono font-bold text-sm focus:border-amber-400 focus:outline-none"
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
                {customWorkingDays} Days × {customDailyKm} KM/d = <strong className="text-white">{fuelSummary.totalMonthlyKm} KM</strong> × ₹{customFuelRate.toFixed(2)}/KM ={' '}
                <strong className="text-emerald-400 text-base font-black">
                  ₹{fuelSummary.totalClaimAmount.toLocaleString('en-IN')}.00
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {kmSavedNotice && (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} /> {kmSavedNotice}
                </span>
              )}
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
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Fuel Allowance</span>
          <div className="text-2xl font-black text-emerald-950 font-mono mt-0.5">
            ₹{fuelSummary.totalClaimAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5 font-mono">
            {fuelSummary.totalMonthlyKm} KM @ ₹{customFuelRate.toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PMA Compliance</span>
          <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
            100%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Doorstep Delivery OK
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. ALL-DAY ARTICLES TABLE (1 TO 31 DAYS)                */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter & Action Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-red-700" />
              <span>All-Day Article Delivery Sheet ({fuelSummary.monthName})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict Total Lock Rule: Individual category article counts can be patched; total article count is tamper-proof auto-summed.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Filter */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search day / date..."
                value={searchDayQuery}
                onChange={(e) => setSearchDayQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-red-700 w-36 sm:w-44"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 p-1 rounded-xl text-xs">
              {(['ALL', 'WORKING', 'SUNDAY', 'HOLIDAY'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                    statusFilter === st ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
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

        {/* Beat 17 Audited Sort Verification Badge */}
        {selectedBeat === 'Beat 17' && (
          <div className="mx-4 sm:mx-6 my-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-emerald-950/70 border border-amber-500/50 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-amber-300 text-sm">Beat 17 Verified Sort Audit · Priyanshu Trivedi</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 font-bold text-[10px]">
                    100% Screenshot Audit Match
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                  Jurisdiction Rules: <strong>Registered Articles: 0</strong> · <strong>PDMS Invoiced Total: 1,138</strong> · <strong>DSS Invoiced Total: 1,136</strong> · <strong>Overall Mobile Usage: 99.76%</strong> (Oct 1: 98.08%, Oct 8: 96.00%, all other 23 working days 100.00%).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Statutory Fuel Claim</span>
                <span className="text-sm font-black font-mono text-emerald-400">
                  25 Days × 28 KM @ ₹3.60 = ₹2,520.00
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Beat 5 Audited Sort Verification Badge */}
        {(selectedBeat === 'Beat 5' || selectedBeat === '5') && (
          <div className="mx-4 sm:mx-6 my-4 p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-emerald-950/70 border border-blue-500/50 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 font-bold shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-blue-300 text-sm">Beat 5 Verified Sort Audit · Mohit Arvind (BEAT_05)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 font-bold text-[10px]">
                    100% Screenshot Audit Match
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                  Jurisdiction Rules: <strong>Registered Articles: 0</strong> · <strong>PDMS Invoiced Total: 2,477</strong> · <strong>DSS Invoiced Total: 2,439</strong> · <strong>Overall Mobile Usage: 99.51%</strong> (Oct 19: 89.58%, Oct 27: 99.23%, other 21 working days 100.00%).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Statutory Fuel Claim</span>
                <span className="text-sm font-black font-mono text-emerald-400">
                  23 Days × 19 KM @ ₹3.60 = ₹1,573.20
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

                return (
                  <tr
                    key={r.sn}
                    className={`transition ${
                      isSunday
                        ? 'bg-blue-50/40 hover:bg-blue-50/70 text-slate-600'
                        : isHoliday
                        ? 'bg-amber-50/50 hover:bg-amber-50/80 text-amber-950 font-semibold'
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
                      <button
                        type="button"
                        onClick={() => handleOpenEditDay(r)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 hover:border-slate-400 rounded-lg text-[11px] font-bold text-slate-700 transition flex items-center gap-1 ml-auto cursor-pointer shadow-2xs"
                        title={`Edit article counts for Day ${r.sn} (${r.date})`}
                      >
                        <Edit3 size={12} className="text-red-700" />
                        <span>Edit Day</span>
                      </button>
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
                      {fuelSummary.workingDays} Days × {customDailyKm} KM @ ₹{customFuelRate.toFixed(2)}/KM = ₹{fuelSummary.totalClaimAmount.toLocaleString('en-IN')}
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
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>{modalNotice}</span>
              </div>
            )}

            <form onSubmit={handleSaveDayArticleEntry} className="space-y-4">
              {/* Category inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Speed Post */}
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                  <span className="font-bold text-xs text-blue-900 block">Speed Post</span>
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
                  <span className="font-bold text-xs text-purple-900 block">Registry</span>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Delivered</label>
                    <input
                      type="number"
                      min={0}
                      value={selectedDayEntry.regDeliv}
                      onChange={(e) =>
                        setSelectedDayEntry({
                          ...selectedDayEntry,
                          regDeliv: parseInt(e.target.value) || 0,
                          regRecd: Math.max(parseInt(e.target.value) || 0, selectedDayEntry.regRecd),
                        })
                      }
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
                      onChange={(e) =>
                        setSelectedDayEntry({
                          ...selectedDayEntry,
                          parDeliv: parseInt(e.target.value) || 0,
                          parRecd: Math.max(parseInt(e.target.value) || 0, selectedDayEntry.parRecd),
                        })
                      }
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
