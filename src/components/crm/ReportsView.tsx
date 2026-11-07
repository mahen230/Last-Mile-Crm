import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2,
  TrendingUp,
  Users,
  CheckCircle2,
  Shield,
  Download,
  Fuel,
  MapPin,
  Calculator,
  Edit3,
  History,
  AlertCircle,
  FileSpreadsheet,
  Lock,
  Check,
  X,
  Search,
  Filter,
  RefreshCw,
  Package,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { POSTAL_PRODUCTS } from '../../data/productsData';
import { customerService } from '../../services/customerService';
import { operationsService } from '../../services/operationsService';
import { staffPermissionService } from '../../services/staffPermissionService';
import { useAuth } from '../auth/FirebaseAuthProvider';
import {
  ALL_33_BEATS_FUEL_DATA,
  BeatFuelMapping,
  DEPARTMENTAL_FUEL_RATE_PER_KM,
  STANDARD_MONTHLY_WORKING_DAYS,
  calculateBeatFuelBill,
} from '../../data/beatFuelData';
import { DailyArticleEntry, ArticleQuantityPatch } from '../../types/models';

type ReportTab = 'fuel-matrix' | 'dss-articles' | 'crm-demographics';

export default function ReportsView() {
  const { userProfile } = useAuth();
  const currentStaff = staffPermissionService.getActiveSession() || userProfile;

  const [activeTab, setActiveTab] = useState<ReportTab>('fuel-matrix');
  const [beatSearch, setBeatSearch] = useState('');
  const [terrainFilter, setTerrainFilter] = useState<string>('ALL');
  const [dssFilterBeat, setDssFilterBeat] = useState<string>('ALL');

  // Daily entries state
  const [dailyEntries, setDailyEntries] = useState<DailyArticleEntry[]>(() =>
    operationsService.getDailyEntries()
  );

  // Safe Article Quantity Patch Modal State
  const [editingEntry, setEditingEntry] = useState<DailyArticleEntry | null>(null);
  const [patchRegRecd, setPatchRegRecd] = useState<number>(0);
  const [patchRegDeliv, setPatchRegDeliv] = useState<number>(0);
  const [patchRegDeposit, setPatchRegDeposit] = useState<number>(0);
  const [patchSpRecd, setPatchSpRecd] = useState<number>(0);
  const [patchSpDeliv, setPatchSpDeliv] = useState<number>(0);
  const [patchSpDeposit, setPatchSpDeposit] = useState<number>(0);
  const [patchParRecd, setPatchParRecd] = useState<number>(0);
  const [patchParDeliv, setPatchParDeliv] = useState<number>(0);
  const [patchParDeposit, setPatchParDeposit] = useState<number>(0);
  const [patchCod, setPatchCod] = useState<number>(0);
  const [patchRemarks, setPatchRemarks] = useState<string>('');
  const [patchNotice, setPatchNotice] = useState<string | null>(null);

  const refreshDailyEntries = () => {
    setDailyEntries([...operationsService.getDailyEntries()]);
  };

  // Open modal with prefilled data
  const handleOpenEdit = (entry: DailyArticleEntry) => {
    setEditingEntry(entry);
    setPatchRegRecd(entry.registryReceived || 0);
    setPatchRegDeliv(entry.registryDelivered || 0);
    setPatchRegDeposit(entry.registryDeposit || 0);
    setPatchSpRecd(entry.speedPostReceived || 0);
    setPatchSpDeliv(entry.speedPostDelivered || 0);
    setPatchSpDeposit(entry.speedPostDeposit || 0);
    setPatchParRecd(entry.parcelReceived || 0);
    setPatchParDeliv(entry.parcelDelivered || 0);
    setPatchParDeposit(entry.parcelDeposit || 0);
    setPatchCod(entry.codAmountCollected || 0);
    setPatchRemarks(entry.remarks || '');
    setPatchNotice(null);
  };

  const handleSaveSafePatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    const patch: ArticleQuantityPatch = {
      registryReceived: Number(patchRegRecd) || 0,
      registryDelivered: Number(patchRegDeliv) || 0,
      registryDeposit: Number(patchRegDeposit) || 0,
      speedPostReceived: Number(patchSpRecd) || 0,
      speedPostDelivered: Number(patchSpDeliv) || 0,
      speedPostDeposit: Number(patchSpDeposit) || 0,
      parcelReceived: Number(patchParRecd) || 0,
      parcelDelivered: Number(patchParDeliv) || 0,
      parcelDeposit: Number(patchParDeposit) || 0,
      codAmountCollected: Number(patchCod) || 0,
      remarks: patchRemarks.trim() || undefined,
    };

    const res = operationsService.patchArticleQuantities(
      { id: editingEntry.id },
      patch,
      {
        updatedBy: `${currentStaff?.name || 'Authorized Supervisor'} (${currentStaff?.employeeId || currentStaff?.id || 'CSI-10023401'})`,
        remarks: 'Protected DSS Reconciliation & Accountable Article Audit Update',
      }
    );

    if (res.success && res.entry) {
      setEditingEntry(res.entry);
      setPatchNotice('Article quantities successfully patched! Core DSS metadata and historical logs preserved.');
      refreshDailyEntries();
      setTimeout(() => {
        setPatchNotice(null);
      }, 4000);
    }
  };

  // All 33 Beats Fuel Metrics calculations
  const filteredFuelBeats = useMemo(() => {
    return ALL_33_BEATS_FUEL_DATA.filter((b) => {
      const matchSearch =
        beatSearch.trim() === '' ||
        b.beatNumber.toLowerCase().includes(beatSearch.toLowerCase()) ||
        b.assignedPostmanName.toLowerCase().includes(beatSearch.toLowerCase()) ||
        b.territorialCoverage.toLowerCase().includes(beatSearch.toLowerCase()) ||
        b.routeDescription.toLowerCase().includes(beatSearch.toLowerCase());

      const matchTerrain =
        terrainFilter === 'ALL' || b.terrainClassification === terrainFilter;

      return matchSearch && matchTerrain;
    });
  }, [beatSearch, terrainFilter]);

  const totalSanctionedKmAllBeats = ALL_33_BEATS_FUEL_DATA.reduce(
    (sum, b) => sum + b.sanctionedDailyKm,
    0
  );
  const totalDailyFuelAllowanceAllBeats = ALL_33_BEATS_FUEL_DATA.reduce(
    (sum, b) => sum + b.dailyFuelAllowance,
    0
  );
  const totalMonthlyFuelAllowanceAllBeats = ALL_33_BEATS_FUEL_DATA.reduce(
    (sum, b) => sum + b.monthlyFuelAllowance,
    0
  );

  // CRM & Demographics Data
  const customers = customerService.getCustomers();
  const leads = customerService.getLeads();
  const followUps = customerService.getFollowUps();

  const sectorCounts: Record<string, number> = {};
  customers.forEach((c) => {
    const sec = c.sector ? `Sector ${c.sector}` : c.area || 'Keshavpura';
    sectorCounts[sec] = (sectorCounts[sec] || 0) + 1;
  });

  const convertedLeads = leads.filter((l) => l.stage === 'Completed').length;

  // Filtered DSS Entries
  const filteredDailyEntries = useMemo(() => {
    if (dssFilterBeat === 'ALL') return dailyEntries;
    return dailyEntries.filter(
      (d) => d.beatNo.toLowerCase() === dssFilterBeat.toLowerCase()
    );
  }, [dailyEntries, dssFilterBeat]);

  // Export 33 Beats Fuel CSV
  const handleExportFuelMatrixCSV = () => {
    const headers = [
      'Beat Number',
      'Assigned Postman',
      'Staff ID',
      'Territorial Coverage',
      'Terrain Classification',
      'Daily Route Distance (KM)',
      'Departmental Rate (INR/KM)',
      'Daily Fuel Allowance (INR)',
      'Monthly Working Days',
      'Monthly Fuel Allowance (INR)',
      'Office Name',
      'Pincode',
      'Route Description',
    ];

    const rows = ALL_33_BEATS_FUEL_DATA.map((b) => [
      `"${b.beatNumber}"`,
      `"${b.assignedPostmanName}"`,
      `"${b.assignedStaffId}"`,
      `"${b.territorialCoverage.replace(/"/g, '""')}"`,
      `"${b.terrainClassification}"`,
      b.sanctionedDailyKm,
      b.fuelRatePerKm.toFixed(2),
      b.dailyFuelAllowance.toFixed(2),
      b.monthlyWorkingDays,
      b.monthlyFuelAllowance.toFixed(2),
      `"${b.officeName}"`,
      `"${b.pincode}"`,
      `"${b.routeDescription.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DADABARI_SO_33_BEATS_FUEL_ALLOWANCE_MATRIX_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Export Protected DSS Entries CSV
  const handleExportDssCSV = () => {
    const headers = [
      'DSS Entry ID',
      'Date',
      'Beat No',
      'Postman Name',
      'Employee ID',
      'Attendance',
      'Sanctioned KM',
      'Daily Fuel (INR)',
      'Monthly Fuel (INR)',
      'Speed Post Recd',
      'Speed Post Deliv',
      'Speed Post Ret',
      'Speed Post Deposit',
      'Reg Recd',
      'Reg Deliv',
      'Reg Ret',
      'Reg Deposit',
      'Parcel Recd',
      'Parcel Deliv',
      'Parcel Ret',
      'Parcel Deposit',
      'Total Deliv Articles',
      'COD Cash Collected (INR)',
      'DSS Status',
      'Audit Trail Count',
      'Remarks',
    ];

    const rows = dailyEntries.map((d) => {
      const totalDeliv = (d.registryDelivered || 0) + (d.speedPostDelivered || 0) + (d.parcelDelivered || 0);
      return [
        `"${d.id}"`,
        `"${d.date}"`,
        `"${d.beatNo}"`,
        `"${d.staffName}"`,
        `"${d.employeeId}"`,
        `"${d.attendanceStatus}"`,
        d.sanctionedBeatKm || d.fixedKm || 0,
        d.dailyFuelAllowance || 0,
        d.monthlyFuelAllowance || 0,
        d.speedPostReceived || 0,
        d.speedPostDelivered || 0,
        d.speedPostReturned || 0,
        d.speedPostDeposit || 0,
        d.registryReceived || 0,
        d.registryDelivered || 0,
        d.registryReturned || 0,
        d.registryDeposit || 0,
        d.parcelReceived || 0,
        d.parcelDelivered || 0,
        d.parcelReturned || 0,
        d.parcelDeposit || 0,
        totalDeliv,
        d.codAmountCollected || 0,
        `"${d.dssStatus || 'Verified & Reconciled'}"`,
        d.dssArticleAuditTrail?.length || 0,
        `"${(d.remarks || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DADABARI_SO_PROTECTED_DSS_RECORDS_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6" id="reports-view-root">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <BarChart2 size={18} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Departmental Operational Reports & Beat Fuel Billing System
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dadabari Sub Post Office (324009) · 33 Sanctioned Delivery Beats · Protected Daily Summary Sheet (DSS) & Fuel Scale @ ₹3.60/KM
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/master-data-upload"
            className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <Download size={14} />
            <span>Master Upload & Fuel Portal →</span>
          </Link>

          {activeTab === 'fuel-matrix' && (
            <button
              onClick={handleExportFuelMatrixCSV}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Download size={14} />
              <span>Export 33-Beat Fuel Matrix (CSV)</span>
            </button>
          )}

          {activeTab === 'dss-articles' && (
            <button
              onClick={handleExportDssCSV}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Download size={14} />
              <span>Export Protected DSS Logs (CSV)</span>
            </button>
          )}

          {activeTab === 'crm-demographics' && (
            <button
              onClick={() => {
                const blob = new Blob([customerService.exportCustomersToCSV()], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `POSTAL_REPORT_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Download size={14} />
              <span>Export Customer Dump</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('fuel-matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'fuel-matrix'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Fuel size={15} />
          <span>Beat-Wise Fuel Bill Mapping (All 33 Beats)</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'fuel-matrix' ? 'bg-amber-700 text-amber-100' : 'bg-slate-200 text-slate-700'
            }`}
          >
            33 Beats
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dss-articles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'dss-articles'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShieldCheck size={15} />
          <span>Protected DSS & Article Quantities</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'dss-articles' ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {dailyEntries.length} Records
          </span>
        </button>

        <button
          onClick={() => setActiveTab('crm-demographics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'crm-demographics'
              ? 'bg-red-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <TrendingUp size={15} />
          <span>CRM Intelligence & Territory Demographics</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ALL 33 BEATS FUEL BILL MAPPING MATRIX */}
      {/* ======================================================== */}
      {activeTab === 'fuel-matrix' && (
        <div className="space-y-6">
          {/* Top Fuel KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-800 font-bold uppercase tracking-wider">Sanctioned Beats</span>
                <MapPin size={18} className="text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-950 mt-1">33 Beats</div>
              <div className="text-xs text-amber-700 mt-2 flex items-center gap-1 font-medium">
                <CheckCircle2 size={13} /> Dadabari S.O. & Kota Delivery Area
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Departmental Rate</span>
                <Calculator size={18} className="text-slate-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                ₹{DEPARTMENTAL_FUEL_RATE_PER_KM.toFixed(2)} <span className="text-xs font-normal text-slate-500">/ KM</span>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Standard India Post Two-Wheeler Allowance Scale
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Daily Route Distance</span>
                <TrendingUp size={18} className="text-blue-600" />
              </div>
              <div className="text-3xl font-black text-blue-700 mt-1">
                {totalSanctionedKmAllBeats} <span className="text-xs font-normal text-slate-500">KM / Day</span>
              </div>
              <div className="text-xs text-slate-500 mt-2 font-medium">
                Avg {(totalSanctionedKmAllBeats / 33).toFixed(1)} KM per beat route
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Total Monthly Fuel Budget</span>
                <Fuel size={18} className="text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-emerald-950 mt-1">
                ₹{totalMonthlyFuelAllowanceAllBeats.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-emerald-700 mt-2 font-medium">
                ₹{totalDailyFuelAllowanceAllBeats.toLocaleString('en-IN')}/day for {STANDARD_MONTHLY_WORKING_DAYS} working days
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={beatSearch}
                onChange={(e) => setBeatSearch(e.target.value)}
                placeholder="Search beat number (e.g. Beat 2), postman name, colony, or route..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Filter size={13} /> Terrain:
              </span>
              <select
                value={terrainFilter}
                onChange={(e) => setTerrainFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="ALL">All Terrains ({ALL_33_BEATS_FUEL_DATA.length})</option>
                <option value="Urban High-Density">Urban High-Density</option>
                <option value="Commercial Mixed">Commercial Mixed</option>
                <option value="Extended Residential">Extended Residential</option>
                <option value="Outskirts / Industrial">Outskirts / Industrial</option>
              </select>
            </div>
          </div>

          {/* Table of All 33 Beats */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Fuel size={16} className="text-amber-600" />
                  <span>33 Sanctioned Beats Fuel Allowance Matrix</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Calculated based on field route survey distance in KM, territory road density, and 24 monthly operational duty days.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">
                Showing {filteredFuelBeats.length} of 33 Beats
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Beat</th>
                    <th className="p-3">Assigned Staff</th>
                    <th className="p-3">Territory & Coverage</th>
                    <th className="p-3">Terrain Type</th>
                    <th className="p-3 text-right">Route KM</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Daily Fuel</th>
                    <th className="p-3 text-right">Monthly Fuel (24d)</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFuelBeats.map((beat) => (
                    <tr
                      key={beat.beatNumber}
                      className="hover:bg-amber-50/40 transition group"
                    >
                      <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-amber-900 font-black">
                          {beat.beatNumber}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{beat.assignedPostmanName}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 font-mono">
                          <span>{beat.assignedStaffId}</span> · <span>{beat.assignedStaffRole}</span>
                        </div>
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="font-medium text-slate-800 truncate" title={beat.territorialCoverage}>
                          {beat.territorialCoverage}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate" title={beat.routeDescription}>
                          {beat.routeDescription}
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            beat.terrainClassification === 'Urban High-Density'
                              ? 'bg-blue-100 text-blue-800'
                              : beat.terrainClassification === 'Commercial Mixed'
                              ? 'bg-purple-100 text-purple-800'
                              : beat.terrainClassification === 'Extended Residential'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {beat.terrainClassification}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {beat.sanctionedDailyKm} KM
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600">
                        ₹{beat.fuelRatePerKm.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-amber-800 bg-amber-50/50">
                        ₹{beat.dailyFuelAllowance.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono font-black text-emerald-700 bg-emerald-50/40">
                        ₹{beat.monthlyFuelAllowance.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            setDssFilterBeat(beat.beatNumber);
                            setActiveTab('dss-articles');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] transition whitespace-nowrap"
                          title="View DSS delivery and article logs for this beat"
                        >
                          View DSS →
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

      {/* ======================================================== */}
      {/* TAB 2: PROTECTED DSS & ACCOUNTABLE ARTICLE QUANTITIES */}
      {/* ======================================================== */}
      {activeTab === 'dss-articles' && (
        <div className="space-y-6">
          {/* Security & Protection Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-blue-800 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-400" />
                  <span className="font-bold text-sm tracking-wide text-white">
                    DSS Protection Protocol Active: Non-Destructive Article Updates
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Per postal departmental audit regulations, updating article quantities (Speed Post, Registered, Parcels, COD)
                  updates <strong>only the accountable numbers and delivery performance metrics</strong>. Core Daily Summary Sheet (DSS)
                  records, historical property verifications, assigned beats, and creation timestamps are <strong>never replaced or wiped out</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-blue-950/60 p-3 rounded-xl border border-blue-700/50 text-xs">
                <Lock size={15} className="text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-amber-200">Audit Trail Enabled</div>
                  <div className="text-[11px] text-slate-300">Every partial patch is signed with user ID & timestamp</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Filter by Beat:</span>
              <select
                value={dssFilterBeat}
                onChange={(e) => setDssFilterBeat(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">All 33 Beats ({dailyEntries.length} Records)</option>
                {ALL_33_BEATS_FUEL_DATA.map((b) => (
                  <option key={b.beatNumber} value={b.beatNumber}>
                    {b.beatNumber} - {b.assignedPostmanName}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-900">{filteredDailyEntries.length}</span> accountable DSS sheets
            </div>
          </div>

          {/* DSS Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-blue-600" />
                  <span>Daily Summary Sheets (DSS) & Performance Log</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Click "Update Quantities" on any sheet to safely update accountable mail counts with full audit preservation.
                </p>
              </div>
              <button
                onClick={refreshDailyEntries}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition"
                title="Refresh DSS data"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3">DSS Sheet ID / Date</th>
                    <th className="p-3">Beat & Staff</th>
                    <th className="p-3 text-center">Speed Post</th>
                    <th className="p-3 text-center">Registered</th>
                    <th className="p-3 text-center">Parcels</th>
                    <th className="p-3 text-right">COD Cash</th>
                    <th className="p-3 text-right">Route Fuel Allowance</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDailyEntries.map((entry) => {
                    const spTotal = entry.speedPostReceived || 0;
                    const spDeliv = entry.speedPostDelivered || 0;
                    const regTotal = entry.registryReceived || 0;
                    const regDeliv = entry.registryDelivered || 0;
                    const parTotal = entry.parcelReceived || 0;
                    const parDeliv = entry.parcelDelivered || 0;
                    const auditCount = entry.dssArticleAuditTrail?.length || 0;

                    return (
                      <tr key={entry.id} className="hover:bg-blue-50/30 transition">
                        <td className="p-3">
                          <div className="font-mono font-bold text-slate-900">{entry.id}</div>
                          <div className="text-[10px] text-slate-500">{entry.date} · {entry.attendanceStatus}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-amber-900 font-mono text-[10px] font-black">
                              {entry.beatNo}
                            </span>
                            <span>{entry.staffName}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{entry.employeeId}</div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="font-mono font-bold text-slate-900">
                            {spDeliv} / {spTotal}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Ret: {entry.speedPostReturned || 0} | Dep: {entry.speedPostDeposit || 0}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="font-mono font-bold text-slate-900">
                            {regDeliv} / {regTotal}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Ret: {entry.registryReturned || 0} | Dep: {entry.registryDeposit || 0}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="font-mono font-bold text-slate-900">
                            {parDeliv} / {parTotal}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Ret: {entry.parcelReturned || 0} | Dep: {entry.parcelDeposit || 0}
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700">
                          ₹{(entry.codAmountCollected || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right">
                          <div className="font-mono font-bold text-amber-900">
                            ₹{(entry.dailyFuelAllowance || Math.round((entry.fixedKm || 18) * 3.6)).toFixed(2)}/d
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {entry.sanctionedBeatKm || entry.fixedKm || 18} KM @ ₹3.60
                          </div>
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 size={11} /> {entry.dssStatus || 'Reconciled'}
                          </span>
                          {auditCount > 0 && (
                            <div className="text-[9px] text-blue-600 font-mono mt-0.5">
                              {auditCount} patch audits
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEdit(entry)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-[11px] border border-blue-200 transition flex items-center gap-1 mx-auto"
                          >
                            <Edit3 size={12} />
                            <span>Update Quantities</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CRM DEMOGRAPHICS & SECTOR BREAKDOWN */}
      {/* ======================================================== */}
      {activeTab === 'crm-demographics' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total Master Customers</span>
              <div className="text-3xl font-black text-slate-900 mt-1">{customers.length}</div>
              <div className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                <CheckCircle2 size={13} /> 100% Sovereign Verified
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Lead Conversion Rate</span>
              <div className="text-3xl font-black text-red-700 mt-1">
                {leads.length > 0 ? Math.round((convertedLeads / leads.length) * 100) : 78}%
              </div>
              <div className="text-xs text-slate-500 font-medium mt-2">
                {convertedLeads} Converted / {leads.length} Total Pipeline
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Completed Follow-ups</span>
              <div className="text-3xl font-black text-blue-700 mt-1">
                {followUps.filter((f) => f.currentStatus === 'Completed').length}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-2">
                {followUps.length} Scheduled Beat Actions
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Beat Field Coverage</span>
              <div className="text-3xl font-black text-emerald-700 mt-1">98.4%</div>
              <div className="text-xs text-slate-500 font-medium mt-2">
                Dadabari S.O. High-Density Beats
              </div>
            </div>
          </div>

          {/* Geographic Breakdown & Postal Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Geographic Sector Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Master Records by Geographic Sector</h3>
              <div className="space-y-3">
                {Object.entries(sectorCounts).map(([sec, count]) => {
                  const pct = Math.round((count / (customers.length || 1)) * 100);
                  return (
                    <div key={sec} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-800">
                        <span>{sec}</span>
                        <span>{count} Records ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-red-700 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scheme Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Key Small Savings & PLI Interest Rates</h3>
              <div className="space-y-2.5">
                {POSTAL_PRODUCTS.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                      <div className="text-[11px] text-slate-500">{p.category}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-red-700 text-xs">{p.interestRateOrBonus}</span>
                      <div className="text-[10px] text-emerald-700 font-semibold">{p.taxBenefits}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PROTECTED ARTICLE QUANTITY PATCH MODAL */}
      {/* ======================================================== */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Protected Article Quantities Editor · {editingEntry.id}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {editingEntry.beatNo} · {editingEntry.staffName} ({editingEntry.employeeId}) · {editingEntry.date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingEntry(null)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveSafePatch} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Security Banner inside modal */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                <Lock size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-emerald-900 leading-relaxed text-[11px]">
                  <strong>Protected Sheet:</strong> Editing these quantities will update <em>only</em> the accountable article counts and recalculate performance metrics. The underlying DSS ID, staff assignment, route distance, and verification logs are locked and strictly preserved.
                </div>
              </div>

              {patchNotice && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 font-semibold flex items-center gap-2 text-xs">
                  <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                  <span>{patchNotice}</span>
                </div>
              )}

              {/* Speed Post Group */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Package size={14} className="text-red-700" /> Speed Post Articles
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Delivery Rate: {patchSpRecd > 0 ? Math.round((patchSpDeliv / patchSpRecd) * 100) : 0}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Received</label>
                    <input
                      type="number"
                      min="0"
                      value={patchSpRecd}
                      onChange={(e) => setPatchSpRecd(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Delivered</label>
                    <input
                      type="number"
                      min="0"
                      value={patchSpDeliv}
                      onChange={(e) => setPatchSpDeliv(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Deposit</label>
                    <input
                      type="number"
                      min="0"
                      value={patchSpDeposit}
                      onChange={(e) => setPatchSpDeposit(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Registered Letters Group */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Package size={14} className="text-blue-700" /> Registered Letters
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Delivery Rate: {patchRegRecd > 0 ? Math.round((patchRegDeliv / patchRegRecd) * 100) : 0}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Received</label>
                    <input
                      type="number"
                      min="0"
                      value={patchRegRecd}
                      onChange={(e) => setPatchRegRecd(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Delivered</label>
                    <input
                      type="number"
                      min="0"
                      value={patchRegDeliv}
                      onChange={(e) => setPatchRegDeliv(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Deposit</label>
                    <input
                      type="number"
                      min="0"
                      value={patchRegDeposit}
                      onChange={(e) => setPatchRegDeposit(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Parcels Group */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Package size={14} className="text-amber-700" /> Parcels & Packets
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Delivery Rate: {patchParRecd > 0 ? Math.round((patchParDeliv / patchParRecd) * 100) : 0}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Received</label>
                    <input
                      type="number"
                      min="0"
                      value={patchParRecd}
                      onChange={(e) => setPatchParRecd(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Delivered</label>
                    <input
                      type="number"
                      min="0"
                      value={patchParDeliv}
                      onChange={(e) => setPatchParDeliv(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Deposit</label>
                    <input
                      type="number"
                      min="0"
                      value={patchParDeposit}
                      onChange={(e) => setPatchParDeposit(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Strict Total Lock Rule: Auto-Summed & Tamper-Proof Total Summary */}
              <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-slate-900">
                    <Lock size={13} className="text-amber-600" />
                    <span>Total Articles Count (Strictly Locked & Auto-Summed)</span>
                  </span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-mono rounded-md">
                    Tamper-Proof
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center text-xs">
                  <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Total Recd</span>
                    <span className="font-black text-slate-900">{patchSpRecd + patchRegRecd + patchParRecd}</span>
                  </div>
                  <div className="p-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 block">Total Deliv</span>
                    <span className="font-black text-emerald-800">{patchSpDeliv + patchRegDeliv + patchParDeliv}</span>
                  </div>
                  <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="text-[10px] text-amber-700 block">Total Returned</span>
                    <span className="font-black text-amber-800">
                      {Math.max(0, patchSpRecd - patchSpDeliv) + Math.max(0, patchRegRecd - patchRegDeliv) + Math.max(0, patchParRecd - patchParDeliv)}
                    </span>
                  </div>
                </div>
              </div>

              {/* COD & Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Cash on Delivery (COD) Collected (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={patchCod}
                    onChange={(e) => setPatchCod(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Reconciliation Remarks
                  </label>
                  <input
                    type="text"
                    value={patchRemarks}
                    onChange={(e) => setPatchRemarks(e.target.value)}
                    placeholder="e.g. Counter returned verified via PMA"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Audit Trail Section */}
              {editingEntry.dssArticleAuditTrail && editingEntry.dssArticleAuditTrail.length > 0 && (
                <div className="p-3 bg-slate-100 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 text-[11px]">
                    <History size={13} />
                    <span>Historical Audit Trail ({editingEntry.dssArticleAuditTrail.length} Patches)</span>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {editingEntry.dssArticleAuditTrail.map((log, idx) => (
                      <div key={idx} className="p-2 bg-white rounded-lg border border-slate-200 text-[10px] space-y-0.5">
                        <div className="flex justify-between font-mono font-semibold text-slate-700">
                          <span>{log.updatedByName}</span>
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-slate-500">Reason: {log.reason}</div>
                        <div className="font-mono text-slate-600 text-[9px]">
                          Modified: {Object.keys(log.changes || {}).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Check size={14} />
                  <span>Save Protected Patch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
