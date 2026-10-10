import React, { useState, useEffect } from 'react';
import {
  Users,
  Target,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Package,
  FileText,
  GraduationCap,
  Cloud,
  Fuel,
  MapPin,
  Send,
  ExternalLink,
  Check,
  ArrowRight,
  Download,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { operationsService } from '../services/operationsService';
import { staffPermissionService, getDefaultFixedKmForBeat } from '../services/staffPermissionService';
import { useAuth } from './auth/FirebaseAuthProvider';
import {
  Customer,
  Lead,
  FollowUp,
  DataConflict,
  DailyArticleEntry,
  SpecialBillRecord,
} from '../types/models';
import CustomerProfileModal from './customers/CustomerProfileModal';
import AddCustomerModal from './customers/AddCustomerModal';

export default function Dashboard({
  onSwitchToCustomerPortal,
}: {
  onSwitchToCustomerPortal?: () => void;
}) {
  const { userProfile } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<DataConflict[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyArticleEntry[]>([]);
  const [specialBills, setSpecialBills] = useState<SpecialBillRecord[]>([]);
  const [backupState, setBackupState] = useState(operationsService.getBackupState());

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // Hero 1-Click Quick Lead Form Toggle & State
  const [showQuickLeadForm, setShowQuickLeadForm] = useState(false);
  const [leadCustName, setLeadCustName] = useState('');
  const [leadCustMobile, setLeadCustMobile] = useState('');
  const [leadCustAddress, setLeadCustAddress] = useState('Keshavpura Sector 7, Kota');
  const [leadScheme, setLeadScheme] = useState('Sukanya Samriddhi Account (SSA)');
  const [leadEstValue, setLeadEstValue] = useState<number>(50000);
  const [leadPriority, setLeadPriority] = useState<'High' | 'Urgent' | 'Medium'>('High');
  const [leadRequirement, setLeadRequirement] = useState('Doorstep KYC & Account Opening');
  const [heroBannerNotice, setHeroBannerNotice] = useState<string | null>(null);

  // Daily Article Entry Quick Widget State
  const todayStr = new Date().toISOString().split('T')[0];
  const [artDate, setArtDate] = useState(todayStr);
  const [attendance, setAttendance] = useState<DailyArticleEntry['attendanceStatus']>('Present - Field Duty');
  const [regRecd, setRegRecd] = useState<number>(40);
  const [regDeliv, setRegDeliv] = useState<number>(38);
  const [spRecd, setSpRecd] = useState<number>(65);
  const [spDeliv, setSpDeliv] = useState<number>(62);
  const [parRecd, setParRecd] = useState<number>(18);
  const [parDeliv, setParDeliv] = useState<number>(17);
  const [codCash, setCodCash] = useState<number>(12500);
  const [artRemarks, setArtRemarks] = useState('Beat delivery completed via Postman Mobile App (PMA)');

  const refreshData = () => {
    setCustomers([...customerService.getCustomers()]);
    setLeads([...customerService.getLeads()]);
    setFollowUps([...customerService.getFollowUps()]);
    setTasks([...customerService.getTasks()]);
    setConflicts([...customerService.getConflicts()]);
    setDailyEntries([...operationsService.getDailyEntries()]);
    setSpecialBills([...operationsService.getSpecialBills()]);
    setBackupState(operationsService.getBackupState());
  };

  useEffect(() => {
    refreshData();
    const unsubCust = customerService.subscribe(refreshData);
    const unsubOps = operationsService.subscribe(refreshData);
    return () => {
      unsubCust();
      unsubOps();
    };
  }, []);

  // Computed Hero Priority Metrics
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed');
  const pendingFollowUps = followUps.filter((f) => f.currentStatus !== 'Completed');
  const activeLeads = leads.filter(
    (l) => l.stage !== 'Converted - Product Opened' && l.stage !== 'Closed - Not Interested'
  );
  const immediateActionsCount = pendingTasks.length + pendingFollowUps.length;

  // Computed Daily Article Totals
  const totalRegDeliv = dailyEntries.reduce((s, d) => s + d.registryDelivered, 0);
  const totalSpDeliv = dailyEntries.reduce((s, d) => s + d.speedPostDelivered, 0);
  const totalParDeliv = dailyEntries.reduce((s, d) => s + d.parcelDelivered, 0);
  const totalRecdAll = dailyEntries.reduce(
    (s, d) => s + d.registryReceived + d.speedPostReceived + d.parcelReceived,
    0
  );
  const totalDelivAll = totalRegDeliv + totalSpDeliv + totalParDeliv;
  const deliverySuccessPct =
    totalRecdAll > 0 ? ((totalDelivAll / totalRecdAll) * 100).toFixed(1) : '96.5';
  const totalCodCollected = dailyEntries.reduce((s, d) => s + (d.codAmountCollected || 0), 0);

  // User Profile & Fuel Eligibility Calculation
  const activeBeat = userProfile?.beat || 'Beat 2';
  const fixedKm = userProfile?.fixedKm || getDefaultFixedKmForBeat(activeBeat);
  const workingDaysThisMonth = 24;
  const eligibleDistanceKm = workingDaysThisMonth * fixedKm;
  const eligibleFuelAllowance = Math.round(eligibleDistanceKm * 6.5);

  const handleQuickLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadCustName.trim() || !leadCustMobile.trim()) return;

    const custRes = customerService.addOrUpdateCustomer(
      {
        name: leadCustName.trim(),
        mobile: leadCustMobile.trim(),
        beatNo: activeBeat,
        financialInterest: leadScheme,
        enteredBy: userProfile?.email || 'mahen.comtech@gmail.com',
        enteredByName: userProfile?.name || 'Postal Staff',
        verificationStatus: 'Verified',
      },
      'Hero Quick Lead Capture'
    );

    const createdLead = customerService.createLead({
      customerId: custRes.customer.id,
      customerName: leadCustName.trim(),
      customerMobile: leadCustMobile.trim(),
      customerAddress: leadCustAddress.trim(),
      productCode: leadScheme.split(' ')[0].toUpperCase(),
      productName: leadScheme,
      requirement: leadRequirement,
      source: 'Hero 1-Click Quick Capture',
      stage: 'New',
      priority: leadPriority,
      leadScore: 90,
      estimatedValue: Number(leadEstValue) || 25000,
      assignedStaffName: userProfile?.name || 'Mahendra Kumar Meena',
      nextAction: 'Immediate Doorstep KYC & Proposal Form Collection',
      nextFollowUpDate: todayStr,
    });

    setHeroBannerNotice(
      `Scheme Lead Captured: ${createdLead.customerName} (${createdLead.productName}) added to Pipeline & Backup Queue!`
    );
    setLeadCustName('');
    setLeadCustMobile('');
    setShowQuickLeadForm(false);
    refreshData();
  };

  const handleDailyArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = operationsService.addDailyEntry({
      date: artDate,
      employeeId: userProfile?.employeeId || userProfile?.id || 'CSI-10023401',
      staffName: userProfile?.name || 'Mahendra Kumar Meena',
      staffEmail: userProfile?.email || 'mahen.comtech@gmail.com',
      beatNo: activeBeat,
      officeName: userProfile?.assignedOffice || 'Dadabari S.O. (324009)',
      attendanceStatus: attendance,
      fixedKm,
      registryReceived: Number(regRecd) || 0,
      registryDelivered: Number(regDeliv) || 0,
      registryReturned: Math.max(0, (Number(regRecd) || 0) - (Number(regDeliv) || 0)),
      registryDeposit: 0,
      speedPostReceived: Number(spRecd) || 0,
      speedPostDelivered: Number(spDeliv) || 0,
      speedPostReturned: Math.max(0, (Number(spRecd) || 0) - (Number(spDeliv) || 0)),
      speedPostDeposit: 0,
      parcelReceived: Number(parRecd) || 0,
      parcelDelivered: Number(parDeliv) || 0,
      parcelReturned: Math.max(0, (Number(parRecd) || 0) - (Number(parDeliv) || 0)),
      parcelDeposit: 0,
      codAmountCollected: Number(codCash) || 0,
      doorstepInquiriesLogged: 3,
      remarks: artRemarks,
    });
    setHeroBannerNotice(
      `Daily Article Log (${entry.id}) saved for ${entry.beatNo}: ${
        entry.registryDelivered + entry.speedPostDelivered + entry.parcelDelivered
      } articles delivered!`
    );
    refreshData();
  };

  return (
    <div className="space-y-6" id="dashboard-view">
      {/* =====================================================================
          HERO SECTION (TOP FOCUS): PRIORITY TASKS, FOLLOW-UPS & 1-CLICK LEAD
         ===================================================================== */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-md">
        {/* Top Crimson & Gold Priority Command Strip */}
        <div className="bg-gradient-to-r from-red-900 via-red-800 to-slate-900 px-6 py-5 border-b border-red-800/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-amber-400 tracking-wide">
              भारतीय डाक विभाग · Dadabari Sub-Post Office (324009) · {activeBeat} · Officer:{' '}
              {userProfile?.name || 'Mahendra Kumar Meena'} ({userProfile?.employeeId || 'CSI-10023401'})
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Priority Tasks, Today&apos;s Follow-ups & Scheme Lead Command Center
            </h1>
            <div className="text-xs text-red-100 flex flex-wrap items-center gap-2">
              <span>Master Records: {customers.length}</span>
              <span>·</span>
              <span>Active Leads: {activeLeads.length}</span>
              <span>·</span>
              <span>Backup Queue: {backupState.pendingChangesCount} Pending Changes</span>
              <span>·</span>
              <span>Master Admin: mahen.comtech@gmail.com</span>
            </div>
          </div>

          {/* Primary Action Triggers in Hero */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowQuickLeadForm(!showQuickLeadForm)}
              id="hero-quick-lead-trigger-btn"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} />
              <span>{showQuickLeadForm ? 'Close Quick Lead Form' : '+ 1-Click Capture Scheme Lead'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddCustomerModal(true)}
              id="dash-add-customer-btn"
              className="px-4 py-2.5 bg-red-950/80 hover:bg-red-950 text-white border border-red-400/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Users size={15} />
              <span>Add Customer</span>
            </button>

            {onSwitchToCustomerPortal && (
              <button
                type="button"
                onClick={onSwitchToCustomerPortal}
                id="dash-preview-portal-btn"
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <ExternalLink size={14} />
                <span>Citizen Portal</span>
              </button>
            )}
          </div>
        </div>

        {/* Instant Feedback Notice */}
        {heroBannerNotice && (
          <div className="px-6 py-3 bg-emerald-950/90 border-b border-emerald-800 text-emerald-200 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>{heroBannerNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setHeroBannerNotice(null)}
              className="text-emerald-300 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Collapsible 1-Click Quick Scheme Lead Form right inside Hero Section */}
        {showQuickLeadForm && (
          <form
            onSubmit={handleQuickLeadSubmit}
            className="p-6 bg-slate-950 border-b border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-amber-400">
                1-Click Scheme Lead Capture (PLI / RPLI / SSA / IPPB / SCSS / Post Office Savings)
              </div>
              <span className="text-xs text-slate-400">
                Auto-tagged to {userProfile?.name} · {activeBeat}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Citizen / Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={leadCustName}
                  onChange={(e) => setLeadCustName(e.target.value)}
                  placeholder="e.g. Ramesh Chand"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={leadCustMobile}
                  onChange={(e) => setLeadCustMobile(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Target Scheme (PLI / SSA / IPPB)
                </label>
                <select
                  value={leadScheme}
                  onChange={(e) => setLeadScheme(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Sukanya Samriddhi Account (SSA)">Sukanya Samriddhi (SSA - 8.2%)</option>
                  <option value="Postal Life Insurance (PLI Suraksha)">PLI Suraksha / Santosh</option>
                  <option value="Rural PLI (RPLI Gram Suraksha)">RPLI Gram Suraksha</option>
                  <option value="IPPB Premium Doorstep Account">IPPB Account / CELC Aadhaar</option>
                  <option value="Senior Citizen Savings (SCSS)">Senior Citizen (SCSS - 8.2%)</option>
                  <option value="5-Year Recurring Deposit (RD)">5-Year Recurring Deposit (RD)</option>
                  <option value="Monthly Income Scheme (POMIS)">Monthly Income Scheme (MIS)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  House No & Locality
                </label>
                <input
                  type="text"
                  value={leadCustAddress}
                  onChange={(e) => setLeadCustAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Est. Deposit / Sum Assured (₹)
                </label>
                <input
                  type="number"
                  value={leadEstValue}
                  onChange={(e) => setLeadEstValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400 tabular-nums"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={15} />
                  <span>Save Lead Now</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Priority Tasks & Follow-ups Bar (Hero Immediate Attention Strip) */}
        <div className="p-6 space-y-5">
          {/* Immediate Action Counters Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-amber-400 font-semibold block">
                  Immediate Action Counter
                </span>
                <span className="text-3xl font-black text-white font-mono tabular-nums mt-0.5 block">
                  {immediateActionsCount}
                </span>
                <span className="text-[11px] text-slate-400">Tasks + Follow-ups Due</span>
              </div>
              <Clock className="w-8 h-8 text-amber-400 opacity-80" />
            </div>

            <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-red-400 font-semibold block">
                  Pending Field Tasks
                </span>
                <span className="text-3xl font-black text-white font-mono tabular-nums mt-0.5 block">
                  {pendingTasks.length}
                </span>
                <span className="text-[11px] text-slate-400">Doorstep KYC & Passbooks</span>
              </div>
              <CheckCircle2 className="w-8 h-8 text-red-400 opacity-80" />
            </div>

            <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-400 font-semibold block">
                  Today&apos;s Follow-ups
                </span>
                <span className="text-3xl font-black text-white font-mono tabular-nums mt-0.5 block">
                  {pendingFollowUps.length}
                </span>
                <span className="text-[11px] text-slate-400">Scheduled Scheme Visits</span>
              </div>
              <Target className="w-8 h-8 text-emerald-400 opacity-80" />
            </div>

            <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-blue-400 font-semibold block">
                  Active Scheme Leads
                </span>
                <span className="text-3xl font-black text-white font-mono tabular-nums mt-0.5 block">
                  {activeLeads.length}
                </span>
                <span className="text-[11px] text-slate-400">PLI · SSA · IPPB · SCSS</span>
              </div>
              <Users className="w-8 h-8 text-blue-400 opacity-80" />
            </div>
          </div>

          {/* Side-by-Side Priority Tasks & Today's Follow-ups Queue right in the Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Hero Priority Box 1: Pending Field Tasks */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-amber-400 tracking-wide uppercase">
                  01. Priority Pending Field Tasks ({pendingTasks.length})
                </h2>
                <Link to="/tasks" className="text-xs text-slate-300 hover:text-white font-semibold">
                  Open Tasks →
                </Link>
              </div>

              <div className="space-y-2">
                {pendingTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{task.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {task.category} · {task.location} · Due:{' '}
                        <span className="font-mono tabular-nums">{task.dueDate}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => customerService.updateTask(task.id, { status: 'Completed' })}
                      className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={12} />
                      <span>Done</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Priority Box 2: Today's Priority Follow-ups */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-emerald-400 tracking-wide uppercase">
                  02. Today&apos;s Scheduled Follow-ups ({pendingFollowUps.length})
                </h2>
                <Link to="/follow-ups" className="text-xs text-slate-300 hover:text-white font-semibold">
                  Open Follow-ups →
                </Link>
              </div>

              <div className="space-y-2">
                {pendingFollowUps.slice(0, 3).map((fol) => (
                  <div
                    key={fol.id}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">
                        {fol.customerName} ·{' '}
                        <span className="font-mono text-amber-300 tabular-nums">{fol.customerMobile}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {fol.productName} · {fol.nextAction}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        customerService.completeFollowUp(
                          fol.id,
                          'Completed doorstep visit from Hero Priority Bar'
                        )
                      }
                      className="px-2.5 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={12} />
                      <span>Complete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          CORE DASHBOARD WIDGETS:
          1. DAILY ARTICLE ENTRY QUICK WIDGET (REGISTRY, SPEED POST, PARCEL)
          2. REAL-TIME REPORTS & OPERATIONS SUMMARY (ATTENDANCE, COVERAGE, FUEL)
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Daily Article Entry Quick Widget */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-bold text-red-800">
                Core Operations Widget · Postman Beat Delivery Register
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Daily Article Entry Quick Widget (Registry, Speed Post & Parcel)
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Today&apos;s Delivery Rate</span>
              <span className="text-lg font-black text-emerald-700 font-mono tabular-nums">
                {deliverySuccessPct}% Delivered
              </span>
            </div>
          </div>

          <form onSubmit={handleDailyArticleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Delivery Date</label>
                <input
                  type="date"
                  value={artDate}
                  onChange={(e) => setArtDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Attendance & Duty</label>
                <select
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900"
                >
                  <option value="Present - Field Duty">Present - Field Duty</option>
                  <option value="Present - Office Duty">Present - Office Duty</option>
                  <option value="Half Day">Half Day</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Auto-Tagged Beat & KM</label>
                <div className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-800 tabular-nums">
                  {activeBeat} · {fixedKm} KM/day
                </div>
              </div>
            </div>

            {/* 3-Column Article Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Registry */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                <div className="font-bold text-xs text-red-900 border-b border-slate-200 pb-1.5">
                  1. Registered Letters (Registry)
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Issued</label>
                    <input
                      type="number"
                      min={0}
                      value={regRecd}
                      onChange={(e) => setRegRecd(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-emerald-700 font-semibold mb-0.5">
                      Delivered
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={regRecd}
                      value={regDeliv}
                      onChange={(e) => setRegDeliv(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-400 rounded-lg font-mono font-bold text-emerald-900 tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Speed Post */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                <div className="font-bold text-xs text-slate-900 border-b border-slate-200 pb-1.5">
                  2. Speed Post Articles
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Issued</label>
                    <input
                      type="number"
                      min={0}
                      value={spRecd}
                      onChange={(e) => setSpRecd(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-emerald-700 font-semibold mb-0.5">
                      Delivered
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={spRecd}
                      value={spDeliv}
                      onChange={(e) => setSpDeliv(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-400 rounded-lg font-mono font-bold text-emerald-900 tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* Parcel / COD */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                <div className="font-bold text-xs text-amber-900 border-b border-slate-200 pb-1.5">
                  3. Parcels & COD / VPP
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Issued</label>
                    <input
                      type="number"
                      min={0}
                      value={parRecd}
                      onChange={(e) => setParRecd(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-emerald-700 font-semibold mb-0.5">
                      Delivered
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={parRecd}
                      value={parDeliv}
                      onChange={(e) => setParDeliv(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-400 rounded-lg font-mono font-bold text-emerald-900 tabular-nums"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  COD / VPP Cash Collected (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={codCash}
                  onChange={(e) => setCodCash(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Beat Return / Deposit Remarks
                </label>
                <input
                  type="text"
                  value={artRemarks}
                  onChange={(e) => setArtRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap"
                >
                  Log Beat Returns
                </button>
              </div>
            </div>
          </form>

          {/* Recent Daily Article Logs Table */}
          <div className="pt-2 border-t border-slate-200">
            <div className="text-xs font-bold text-slate-700 mb-2">
              Recent Beat Article Delivery Logs (Dadabari S.O.):
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                    <th className="py-2 px-2.5 font-semibold">Date & Beat</th>
                    <th className="py-2 px-2.5 font-semibold">Postman</th>
                    <th className="py-2 px-2.5 font-semibold text-right">Registry</th>
                    <th className="py-2 px-2.5 font-semibold text-right">Speed Post</th>
                    <th className="py-2 px-2.5 font-semibold text-right">Parcel</th>
                    <th className="py-2 px-2.5 font-semibold text-right">COD Cash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {dailyEntries.slice(0, 4).map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2.5 font-mono tabular-nums text-slate-800">
                        {d.date} · <strong>{d.beatNo}</strong>
                      </td>
                      <td className="py-2 px-2.5 font-semibold text-slate-900">{d.staffName}</td>
                      <td className="py-2 px-2.5 text-right font-mono tabular-nums">
                        {d.registryDelivered}/{d.registryReceived}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono tabular-nums">
                        {d.speedPostDelivered}/{d.speedPostReceived}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono tabular-nums">
                        {d.parcelDelivered}/{d.parcelReceived}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold text-emerald-700 tabular-nums">
                        ₹{d.codAmountCollected.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Real-Time Reports & Operations Summary (Attendance, Beat Coverage, Fuel Eligibility) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <div className="text-xs font-bold text-red-800">
                Real-Time Operations & Field Telemetry
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Attendance, Beat Coverage & Fuel Eligibility
              </h2>
            </div>

            {/* 1. Daily Attendance & Beat Coverage Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold block">
                  Daily Staff Attendance
                </span>
                <span className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1 block">
                  31 / 33
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
                  93.9% On Duty Today
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold block">
                  Beat 2 & 6 GPS Coverage
                </span>
                <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums mt-1 block">
                  98.4%
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Keshavpura Sectors 4, 6 & 7
                </span>
              </div>
            </div>

            {/* 2. Real-Time Fuel Allowance Eligibility Calculator Box */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">
                  Monthly Fuel Allowance Eligibility ({activeBeat})
                </span>
                <Fuel size={16} className="text-amber-400" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs border-y border-slate-800 py-2.5">
                <div>
                  <span className="text-slate-400 block text-[10px]">Duty Days</span>
                  <span className="font-mono font-bold tabular-nums">{workingDaysThisMonth} Days</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Fixed Beat KM</span>
                  <span className="font-mono font-bold text-amber-300 tabular-nums">
                    {fixedKm} KM/d ({eligibleDistanceKm} KM)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Eligible Claim</span>
                  <span className="font-mono font-black text-emerald-400 text-sm tabular-nums">
                    ₹{eligibleFuelAllowance.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Includes Fuel, ACG-61 Charge Report, Outsider & BYOD Bills
                </span>
                <Link
                  to="/special-forms"
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg whitespace-nowrap"
                >
                  Open Special Forms →
                </Link>
              </div>
            </div>

            {/* 3. Quick Module Navigation Cards (Backup Engine & Postal Exam LMS) */}
            <div className="space-y-2.5">
              <Link
                to="/master-source"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-red-300 bg-slate-50/70 flex items-center justify-between transition"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Google Sheets & Gmail Auto-Backup Engine
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Master Admin: mahen.comtech@gmail.com · {specialBills.length} Bills & {customers.length} Customers
                  </div>
                </div>
                <ArrowRight size={15} className="text-red-800 shrink-0" />
              </Link>

              <Link
                to="/postal-lms"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-red-300 bg-slate-50/70 flex items-center justify-between transition"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Postal Departmental Learning & LDCE Exam Hub
                  </div>
                  <div className="text-[11px] text-slate-500">
                    GDS to MTS · GDS to Postman · GDS to PA/SA Syllabus & Mock Quizzes
                  </div>
                </div>
                <ArrowRight size={15} className="text-red-800 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Master Customer Snapshot & Active Scheme Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Verified Master Customers Directory Snapshot
            </h3>
            <Link to="/customers" className="text-xs font-bold text-red-800 hover:underline">
              Open Full Directory ({customers.length}) →
            </Link>
          </div>

          <div className="divide-y divide-slate-200 text-xs">
            {customers.slice(0, 5).map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCustomer(c)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    {c.name} ·{' '}
                    <span className="font-mono text-[11px] text-slate-500 font-normal tabular-nums">
                      {c.masterId || c.id}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {c.houseNo ? `House ${c.houseNo} · ` : ''}
                    {c.sector ? `Sector ${c.sector}` : c.area} · Beat {c.beatNo || '2'}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 block tabular-nums">
                    {c.mobile || '—'}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    {c.verificationStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Recent Scheme Leads (PLI / SSA / IPPB)
            </h3>
            <Link to="/leads" className="text-xs font-bold text-red-800 hover:underline">
              View Pipeline ({leads.length}) →
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {leads.slice(0, 4).map((l) => (
              <div key={l.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{l.customerName}</span>
                  <span className="font-mono text-[11px] text-slate-600 tabular-nums">
                    {l.customerMobile}
                  </span>
                </div>
                <div className="text-red-800 font-bold">{l.productName}</div>
                <div className="text-[11px] text-slate-500">
                  Stage: {l.stage} · Priority: {l.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <AddCustomerModal
          isOpen={showAddCustomerModal}
          onClose={() => setShowAddCustomerModal(false)}
          onSaved={() => {
            refreshData();
          }}
        />
      )}
    </div>
  );
}
