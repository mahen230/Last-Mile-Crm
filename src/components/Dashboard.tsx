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
  Building2,
  Phone,
  MessageCircle,
  Navigation,
  Edit2,
  Eye,
  X,
  FileCheck2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { operationsService } from '../services/operationsService';
import { staffPermissionService, getDefaultFixedKmForBeat } from '../services/staffPermissionService';
import { verificationService } from '../services/verificationService';
import { staffRegistrationService } from '../services/staffRegistrationService';
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
import PostmanAllDayArticlesOverview from './postman/PostmanAllDayArticlesOverview';
import OfficialStaffDocumentsHub from './crm/OfficialStaffDocumentsHub';

export default function Dashboard({
  onSwitchToCustomerPortal,
}: {
  onSwitchToCustomerPortal?: () => void;
}) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [postmanActiveTab, setPostmanActiveTab] = useState<'ALL_DAY_ARTICLES' | 'CRM_FIELD' | 'OFFICIAL_DOCUMENTS'>('ALL_DAY_ARTICLES');
  const [adminShowAllDayHub, setAdminShowAllDayHub] = useState<'CRM' | 'ALL_DAY_ARTICLES' | 'OFFICIAL_DOCUMENTS'>('CRM');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<DataConflict[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyArticleEntry[]>([]);
  const [specialBills, setSpecialBills] = useState<SpecialBillRecord[]>([]);
  const [backupState, setBackupState] = useState(operationsService.getBackupState());

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // 1-Action Popup Modals State & Handlers
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<any | null>(null);
  const [selectedLeadForModal, setSelectedLeadForModal] = useState<Lead | null>(null);
  const [leadModalStage, setLeadModalStage] = useState<string>('Under Processing');
  const [leadModalNotes, setLeadModalNotes] = useState<string>('');
  const [selectedFollowUpForModal, setSelectedFollowUpForModal] = useState<FollowUp | null>(null);
  const [followUpModalOutcome, setFollowUpModalOutcome] = useState<string>('');
  const [customerStatusModal, setCustomerStatusModal] = useState<Customer | null>(null);
  const [custModalOccupancy, setCustModalOccupancy] = useState<'Occupied' | 'Vacant' | 'Rented'>('Occupied');
  const [custModalVerification, setCustModalVerification] = useState<'Verified' | 'Pending Verification'>('Verified');
  const [custModalRemark, setCustModalRemark] = useState<string>('Standard Delivery');

  // Hero 1-Click Quick Lead Form Toggle & State
  const [showQuickLeadForm, setShowQuickLeadForm] = useState(false);
  const [activeServiceHubCat, setActiveServiceHubCat] = useState<
    'ALL' | 'IPPB' | 'SMALL_SAVINGS' | 'INSURANCE' | 'AADHAAR_CELC' | 'MAIL_PARCEL'
  >('ALL');
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

  // Role-Based Administrative & Verification Metrics
  const [pendingRegsCount, setPendingRegsCount] = useState<number>(() =>
    staffRegistrationService.getPendingRegistrationsCount()
  );
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(() =>
    staffRegistrationService.getPendingApprovalsCount()
  );
  const [dailyVerifProgress, setDailyVerifProgress] = useState(() => {
    const cur = staffPermissionService.getActiveSession() || userProfile;
    const empId = cur?.employeeId || cur?.id || 'CSI-10023401';
    const beat = cur?.beat || 'Beat 2';
    return verificationService.getDailySummary(empId, beat);
  });
  const [adminVerifStats, setAdminVerifStats] = useState(() => verificationService.getStats());

  const refreshData = () => {
    const currentProfile = staffPermissionService.getActiveSession() || userProfile;
    const scopedCusts = customerService
      .getCustomers()
      .filter((c) => staffPermissionService.matchesUserBeatScope(currentProfile, c));
    scopedCusts.sort((a, b) => {
      const colA = (a.area || a.sectorLocality || a.address?.area || a.sector || '').trim();
      const colB = (b.area || b.sectorLocality || b.address?.area || b.sector || '').trim();
      const colCmp = colA.localeCompare(colB, undefined, { numeric: true, sensitivity: 'base' });
      if (colCmp !== 0) return colCmp;
      const hA = (a.houseNo || a.address?.houseNumber || '').trim();
      const hB = (b.houseNo || b.address?.houseNumber || '').trim();
      return hA.localeCompare(hB, undefined, { numeric: true, sensitivity: 'base' });
    });
    setCustomers(scopedCusts);
    setLeads(
      customerService
        .getLeads()
        .filter((l) => staffPermissionService.matchesUserBeatScope(currentProfile, l))
    );
    setFollowUps(
      customerService
        .getFollowUps()
        .filter((f) => staffPermissionService.matchesUserBeatScope(currentProfile, f))
    );
    setTasks(
      customerService
        .getTasks()
        .filter((t) => staffPermissionService.matchesUserBeatScope(currentProfile, t))
    );
    setConflicts([...customerService.getConflicts()]);
    setDailyEntries(
      operationsService
        .getDailyEntries()
        .filter((d) =>
          staffPermissionService.matchesUserBeatScope(currentProfile, {
            beatNo: d.beatNo,
            assignedStaffName: d.staffName,
            assignedStaffEmail: d.staffEmail,
          })
        )
    );
    setSpecialBills(
      operationsService
        .getSpecialBills()
        .filter((b) =>
          staffPermissionService.matchesUserBeatScope(currentProfile, {
            beatNo: b.beatNo,
            assignedStaffName: b.employeeName,
            assignedStaffEmail: b.employeeEmail,
          })
        )
    );
    setBackupState(operationsService.getBackupState());

    // Update role-based metrics
    setPendingRegsCount(staffRegistrationService.getPendingRegistrationsCount());
    setPendingApprovalsCount(staffRegistrationService.getPendingApprovalsCount());
    const empId = currentProfile?.employeeId || currentProfile?.id || 'CSI-10023401';
    const beat = currentProfile?.beat || 'Beat 2';
    setDailyVerifProgress(verificationService.getDailySummary(empId, beat));
    setAdminVerifStats(verificationService.getStats());
  };

  useEffect(() => {
    refreshData();
    const unsubCust = customerService.subscribe(refreshData);
    const unsubOps = operationsService.subscribe(refreshData);
    const unsubStaff = staffPermissionService.subscribe(refreshData);
    const unsubStaffReg = staffRegistrationService.subscribe(refreshData);
    const unsubVerif = verificationService.subscribe(refreshData);
    return () => {
      unsubCust();
      unsubOps();
      unsubStaff();
      unsubStaffReg();
      unsubVerif();
    };
  }, [userProfile]);

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

  // User Profile & Beat-Wise Fuel Bill Mapping
  const activeBeat = userProfile?.beat || 'Beat 2';
  const beatFuelSummary = operationsService.getBeatFuelSummary(activeBeat);
  const fixedKm = userProfile?.fixedKm || beatFuelSummary.sanctionedDailyKm;
  const workingDaysThisMonth = 24;
  const eligibleDistanceKm = workingDaysThisMonth * fixedKm;
  const eligibleFuelAllowance = beatFuelSummary.monthlyFuelAllowance || Math.round(eligibleDistanceKm * (beatFuelSummary.fuelRatePerKm || 3.6));

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
    const curUser = staffPermissionService.getActiveSession() || userProfile;
    const result = operationsService.patchOrUpsertDailyArticleQuantities(
      {
        date: artDate,
        employeeId: curUser?.employeeId || curUser?.id || 'CSI-10023401',
        staffName: curUser?.name || 'Mahendra Kumar Meena',
        staffEmail: curUser?.email || 'mahen.comtech@gmail.com',
        beatNo: activeBeat,
        officeName: curUser?.assignedOffice || 'Dadabari S.O. (324009)',
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
      },
      {
        updatedBy: `${curUser?.name || 'Postal Staff'} (${curUser?.employeeId || curUser?.id || 'CSI-10023401'})`,
        remarks: 'Protected Daily Article Submission & DSS Performance Sync',
      }
    );
    const entry = result.entry;
    setHeroBannerNotice(
      `Protected Daily Article Log (${entry.id}) saved for ${entry.beatNo}: ${
        entry.registryDelivered + entry.speedPostDelivered + entry.parcelDelivered
      } articles delivered! (DSS master & historical logs preserved)`
    );
    refreshData();
  };

  const ALL_POSTAL_SERVICES_HUB = [
    // 1. IPPB Savings / Current & Doorstep Banking
    {
      id: 'srv-ippb-sav',
      category: 'IPPB' as const,
      categoryLabel: 'IPPB Savings / Current',
      code: 'IPPB_SAVINGS',
      title: 'IPPB Digital / Regular Savings Account',
      rateOrHighlight: 'Zero Balance · Paperless eKYC',
      summary: 'Instant doorstep biometric account opening with QR Card, UPI, NEFT/RTGS & POSB linkage.',
      requirementPreset: 'Doorstep IPPB Digital Savings Account Opening & POSB Sweep-in/out Linkage',
      defaultValue: 5000,
    },
    {
      id: 'srv-ippb-cur',
      category: 'IPPB' as const,
      categoryLabel: 'IPPB Savings / Current',
      code: 'IPPB_CURRENT',
      title: 'IPPB Merchant Current Account & DakPay QR',
      rateOrHighlight: 'Merchant Settlement · Zero MDR QR',
      summary: 'Tailored for Dadabari & Keshavpura shops/businesses with doorstep cash deposit & digital soundbox.',
      requirementPreset: 'Merchant Current Account & DakPay QR Onboarding for Shop',
      defaultValue: 25000,
    },
    {
      id: 'srv-ippb-aeps',
      category: 'IPPB' as const,
      categoryLabel: 'IPPB Savings / Current',
      code: 'IPPB_AEPS',
      title: 'AePS MicroATM Doorstep Cash Withdrawal',
      rateOrHighlight: 'Any Bank Aadhaar Withdrawal',
      summary: 'Withdraw up to ₹10,000 at home from any Aadhaar-linked bank account via Postman MicroATM.',
      requirementPreset: 'Doorstep AePS Cash Withdrawal / Pension Disbursement Request',
      defaultValue: 10000,
    },
    // 2. Post Office Small Savings Schemes (PPF, SSY, NSC, MIS, SCSS)
    {
      id: 'srv-ssy',
      category: 'SMALL_SAVINGS' as const,
      categoryLabel: 'Small Savings Schemes',
      code: 'SSA',
      title: 'Sukanya Samriddhi Account (SSY / SSA)',
      rateOrHighlight: '8.2% p.a. · 100% Tax-Free (EEE)',
      summary: 'Sovereign girl-child savings scheme (0–10 yrs). Min ₹250, Max ₹1.5 Lakh/yr under Sec 80C.',
      requirementPreset: 'Open Sukanya Samriddhi Account (Form-1 + Child Birth Certificate)',
      defaultValue: 50000,
    },
    {
      id: 'srv-ppf',
      category: 'SMALL_SAVINGS' as const,
      categoryLabel: 'Small Savings Schemes',
      code: 'PPF',
      title: 'Public Provident Fund (PPF)',
      rateOrHighlight: '7.1% p.a. · 15-Yr EEE Tax-Free',
      summary: 'Long-term tax-free retirement & wealth corpus with loan (Yr 3–6) and partial withdrawal facility.',
      requirementPreset: 'New 15-Year Public Provident Fund (PPF) Account Opening',
      defaultValue: 100000,
    },
    {
      id: 'srv-scss',
      category: 'SMALL_SAVINGS' as const,
      categoryLabel: 'Small Savings Schemes',
      code: 'SCSS',
      title: 'Senior Citizen Savings Scheme (SCSS)',
      rateOrHighlight: '8.2% p.a. · Quarterly Pension',
      summary: 'Guaranteed quarterly interest payout for citizens 60+ yrs (55+ for retirees). Max deposit ₹30 Lakh.',
      requirementPreset: 'Senior Citizen Savings Scheme (SCSS) Investment up to ₹30 Lakh',
      defaultValue: 500000,
    },
    {
      id: 'srv-mis',
      category: 'SMALL_SAVINGS' as const,
      categoryLabel: 'Small Savings Schemes',
      code: 'MIS',
      title: 'Post Office Monthly Income Scheme (POMIS)',
      rateOrHighlight: '7.4% p.a. · Monthly Payout',
      summary: 'Assured monthly interest credited to POSB/IPPB account. Max ₹9L (Single) / ₹15L (Joint).',
      requirementPreset: 'Monthly Income Scheme (POMIS) Account Opening with Auto-Credit',
      defaultValue: 300000,
    },
    {
      id: 'srv-nsc',
      category: 'SMALL_SAVINGS' as const,
      categoryLabel: 'Small Savings Schemes',
      code: 'NSC',
      title: 'National Savings Certificate (NSC VIII Issue)',
      rateOrHighlight: '7.7% p.a. · 5-Year 80C Tax Saver',
      summary: '5-year sovereign certificate with annual compounding and full Section 80C deduction.',
      requirementPreset: 'National Savings Certificate (NSC) Tax-Saving Deposit',
      defaultValue: 150000,
    },
    {
      id: 'srv-rd-kvp',
      category: 'SMALL_SAVINGS' as const,
      categoryLabel: 'Small Savings Schemes',
      code: 'RD_KVP',
      title: '5-Yr Recurring Deposit (RD) & Kisan Vikas Patra',
      rateOrHighlight: 'RD 6.7% · KVP 7.5% (Doubles in 115m)',
      summary: 'Monthly disciplined RD savings with IPPB auto-debit or lump-sum doubling via KVP.',
      requirementPreset: '5-Year RD / Kisan Vikas Patra (KVP) Account Setup',
      defaultValue: 60000,
    },
    // 3. PLI / RPLI Insurance
    {
      id: 'srv-pli-suraksha',
      category: 'INSURANCE' as const,
      categoryLabel: 'PLI / RPLI Insurance',
      code: 'PLI_SURAKSHA',
      title: 'PLI Whole Life Assurance (Suraksha)',
      rateOrHighlight: '₹76 / ₹1,000 Bonus · Up to ₹50 Lakh',
      summary: 'Highest bonus life insurance in India for Govt, PSU, Bank staff & degree-holding professionals.',
      requirementPreset: 'PLI Suraksha Whole Life Proposal & Medical Examination Scheduling',
      defaultValue: 1000000,
    },
    {
      id: 'srv-pli-santosh',
      category: 'INSURANCE' as const,
      categoryLabel: 'PLI / RPLI Insurance',
      code: 'PLI_SANTOSH',
      title: 'PLI Endowment Assurance (Santosh) & Yugal Suraksha',
      rateOrHighlight: '₹52 / ₹1,000 Bonus · Maturity + Risk Cover',
      summary: 'Endowment savings + life cover maturing at age 35, 40, 45, 50, 55, 58, or 60 years.',
      requirementPreset: 'PLI Santosh Endowment Policy Quotation & Proposal Pickup',
      defaultValue: 500000,
    },
    {
      id: 'srv-rpli-gram',
      category: 'INSURANCE' as const,
      categoryLabel: 'PLI / RPLI Insurance',
      code: 'RPLI_GRAM',
      title: 'Rural PLI (Gram Suraksha / Gram Santosh)',
      rateOrHighlight: '₹60 / ₹1,000 Bonus · Rural Belt',
      summary: 'Dedicated high-bonus life insurance for rural, agricultural & semi-urban residents.',
      requirementPreset: 'RPLI Gram Suraksha / Gram Santosh Proposal Collection',
      defaultValue: 200000,
    },
    // 4. Aadhaar / CELC Services
    {
      id: 'srv-celc-child',
      category: 'AADHAAR_CELC' as const,
      categoryLabel: 'Aadhaar / CELC Services',
      code: 'CELC_CHILD',
      title: '0–5 Years Child Aadhaar Enrolment (CELC)',
      rateOrHighlight: '100% Free Doorstep Enrolment',
      summary: 'Doorstep tablet-based Bal Aadhaar registration linked to parent Aadhaar & birth certificate.',
      requirementPreset: 'Doorstep 0-5 Yr Child Aadhaar (CELC) Enrolment Visit',
      defaultValue: 0,
    },
    {
      id: 'srv-aadhaar-mob',
      category: 'AADHAAR_CELC' as const,
      categoryLabel: 'Aadhaar / CELC Services',
      code: 'AADHAAR_MOBILE',
      title: 'Aadhaar Mobile & Email Biometric Update',
      rateOrHighlight: '₹50 Official Fee · Instant OTP + Bio',
      summary: 'Update mobile number or email ID in Aadhaar right at the doorstep using Postman CELC kit.',
      requirementPreset: 'Doorstep Aadhaar Mobile Number Biometric Linkage',
      defaultValue: 50,
    },
    {
      id: 'srv-dlc-pension',
      category: 'AADHAAR_CELC' as const,
      categoryLabel: 'Aadhaar / CELC Services',
      code: 'DLC_JEEVAN_PRAMAAN',
      title: 'Digital Life Certificate (Jeevan Pramaan / DLC)',
      rateOrHighlight: '₹70 Doorstep · Pensioners',
      summary: 'Biometric Digital Life Certificate generation for Central/State pensioners without visiting treasury.',
      requirementPreset: 'Doorstep Jeevan Pramaan Digital Life Certificate for Pensioner',
      defaultValue: 70,
    },
    // 5. Mail / Parcel Operations
    {
      id: 'srv-speed-post',
      category: 'MAIL_PARCEL' as const,
      categoryLabel: 'Mail / Parcel Operations',
      code: 'SPEED_POST',
      title: 'Speed Post & Registered Article Booking / Delivery',
      rateOrHighlight: 'Time-Bound · PMA Live Geo-Tagging',
      summary: 'Priority express delivery with SMS tracking, Book Now Pay Later (BNPL) corporate discounts & POD.',
      requirementPreset: 'Bulk Speed Post / Registered Post Corporate Pickup Inquiry',
      defaultValue: 5000,
    },
    {
      id: 'srv-parcel-cod',
      category: 'MAIL_PARCEL' as const,
      categoryLabel: 'Mail / Parcel Operations',
      code: 'PARCEL_COD',
      title: 'India Post Parcel, E-Commerce COD & DNK Export',
      rateOrHighlight: 'Doorstep Pickup · COD Remittance',
      summary: 'Domestic e-commerce Cash-on-Delivery parcels and international export via Dak Ghar Niryat Kendra.',
      requirementPreset: 'E-Commerce COD Parcel / Dak Ghar Niryat Kendra Export Registration',
      defaultValue: 15000,
    },
  ];

  const visibleHubServices =
    activeServiceHubCat === 'ALL'
      ? ALL_POSTAL_SERVICES_HUB
      : ALL_POSTAL_SERVICES_HUB.filter((s) => s.category === activeServiceHubCat);

  const isAdmin =
    userProfile?.role === 'SUPER_ADMIN' ||
    userProfile?.role === 'ADMIN' ||
    userProfile?.email === 'mahen.comtech@gmail.com';

  return (
    <div className="space-y-6" id="dashboard-view">
      {/* =====================================================================
          HERO SECTION: ROLE-TAILORED COMMAND STRIP (ADMIN EKTA MEENA vs POSTMAN)
         ===================================================================== */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-md">
        {isAdmin ? (
          /* ================= ADMIN COMMAND CENTER (EKTA MEENA) ================= */
          <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 p-6 border-b border-red-900/40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/60 border border-red-700/60 text-amber-300 text-xs font-bold tracking-wide">
                  <ShieldCheck size={14} className="text-amber-400" />
                  <span>Administrative Control Room · Ekta Meena (mahen.comtech@gmail.com)</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>POSTMAN BOOK CRM — Dadabari S.O. Executive Hub</span>
                </h1>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Centralized jurisdictional command for Dadabari S.O. 324009. Review staff registrations, authorize profile edits, monitor daily 10-property verifications, and audit field delivery beats.
                </p>
                <div className="text-xs text-red-200 flex flex-wrap items-center gap-2 pt-1 font-mono">
                  <span>Colonies: 25 Master</span>
                  <span>·</span>
                  <span>Beats: 33 Active</span>
                  <span>·</span>
                  <span>PINs: 324009, 324005, 324010</span>
                  <span>·</span>
                  <Link to="/staff-master" className="text-amber-400 hover:underline">
                    Staff Management ↗
                  </Link>
                </div>
              </div>

              {/* Admin Primary Action Strip */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  to="/staff-registrations"
                  className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                  title="Review Staff Registration Requests"
                >
                  <Users size={15} />
                  <span>Staff Requests</span>
                  {pendingRegsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-700 text-white text-[10px] font-black animate-pulse">
                      {pendingRegsCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/profile-approvals"
                  className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                  title="Review Postman Profile Change Requests"
                >
                  <ShieldCheck size={15} />
                  <span>Profile Approvals</span>
                  {pendingApprovalsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black animate-pulse">
                      {pendingApprovalsCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/verifications"
                  className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                  title="Daily 10-Property Field Verification Monitor"
                >
                  <CheckCircle2 size={15} />
                  <span>Verifications Monitor</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setAdminShowAllDayHub(adminShowAllDayHub === 'ALL_DAY_ARTICLES' ? 'CRM' : 'ALL_DAY_ARTICLES')}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap ${
                    adminShowAllDayHub === 'ALL_DAY_ARTICLES'
                      ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300'
                      : 'bg-blue-800 hover:bg-blue-700 text-white'
                  }`}
                  title="View All-Day Article Delivery Overview & Beat Fuel Bills"
                >
                  <FileText size={15} />
                  <span>{adminShowAllDayHub === 'ALL_DAY_ARTICLES' ? 'Dashboard CRM' : 'All-Day Articles & Fuel'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminShowAllDayHub(adminShowAllDayHub === 'OFFICIAL_DOCUMENTS' ? 'CRM' : 'OFFICIAL_DOCUMENTS')}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap ${
                    adminShowAllDayHub === 'OFFICIAL_DOCUMENTS'
                      ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300'
                      : 'bg-emerald-800 hover:bg-emerald-700 text-white'
                  }`}
                  title="Official Staff Documents & Statutory Reports Hub"
                >
                  <FileCheck2 size={15} />
                  <span>{adminShowAllDayHub === 'OFFICIAL_DOCUMENTS' ? 'Dashboard CRM' : 'Official Documents Hub'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(true)}
                  id="admin-add-customer-btn"
                  className="px-3.5 py-2.5 bg-red-900/80 hover:bg-red-900 text-white border border-red-400/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Plus size={15} />
                  <span>Add Customer</span>
                </button>
              </div>
            </div>

            {/* Admin Metric Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
              <Link
                to="/staff-registrations"
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition block"
              >
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Pending Registrations</div>
                <div className="text-xl font-black text-amber-400 mt-1 flex items-center gap-1.5">
                  <span>{pendingRegsCount}</span>
                  {pendingRegsCount > 0 && <span className="text-[10px] text-amber-300 font-normal">Needs Review</span>}
                </div>
              </Link>

              <Link
                to="/profile-approvals"
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition block"
              >
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Profile Edits Pending</div>
                <div className="text-xl font-black text-purple-400 mt-1 flex items-center gap-1.5">
                  <span>{pendingApprovalsCount}</span>
                  {pendingApprovalsCount > 0 && <span className="text-[10px] text-purple-300 font-normal">Approval Queue</span>}
                </div>
              </Link>

              <Link
                to="/verifications"
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition block"
              >
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Today&apos;s Field Verifications</div>
                <div className="text-xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
                  <span>{adminVerifStats.totalVerifiedToday}</span>
                  <span className="text-[10px] text-slate-400 font-normal">in Dadabari</span>
                </div>
              </Link>

              <Link
                to="/unified-properties"
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 transition block"
              >
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Master Customer Directory</div>
                <div className="text-xl font-black text-blue-400 mt-1 flex items-center gap-1.5">
                  <span>{customers.length}</span>
                  <span className="text-[10px] text-slate-400 font-normal">Properties</span>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          /* ================= FIELD POSTMAN COMMAND CENTER ================= */
          <div className="bg-gradient-to-r from-red-900 via-red-800 to-slate-900 p-6 border-b border-red-800/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-700/60 text-amber-300 text-xs font-bold tracking-wide">
                  <MapPin size={13} className="text-amber-400" />
                  <span>Field Postman Operations · {userProfile?.name || 'Postal Staff'} ({userProfile?.employeeId || 'CSI-ID'})</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>{activeBeat} Delivery & Verification Command</span>
                </h1>
                <p className="text-xs text-red-100 max-w-2xl">
                  Dadabari S.O. (324009) Beat Delivery Operations. Complete mandatory 10 doorstep verifications today, capture scheme leads, and navigate delivery sequences.
                </p>
                <div className="text-xs text-red-200 flex flex-wrap items-center gap-2 pt-1 font-mono">
                  <span>Beat: {activeBeat}</span>
                  <span>·</span>
                  <Link to="/my-beat" className="text-amber-300 hover:underline">
                    My Beat Directory ↗
                  </Link>
                  <span>·</span>
                  <Link to="/my-submissions" className="text-amber-300 hover:underline">
                    My Submissions ↗
                  </Link>
                  <span>·</span>
                  <Link to="/my-profile" className="text-amber-300 hover:underline">
                    My Profile ↗
                  </Link>
                </div>
              </div>

              {/* Postman Primary Action Strip */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setPostmanActiveTab(
                      postmanActiveTab === 'ALL_DAY_ARTICLES' ? 'CRM_FIELD' : 'ALL_DAY_ARTICLES'
                    )
                  }
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm ${
                    postmanActiveTab === 'ALL_DAY_ARTICLES'
                      ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300'
                      : 'bg-red-950 text-amber-300 border border-amber-400/50 hover:bg-red-900'
                  }`}
                  title="Toggle All-Day Article Delivery Overview & Monthly Fuel Sheet"
                >
                  <FileText size={15} />
                  <span>
                    {postmanActiveTab === 'ALL_DAY_ARTICLES'
                      ? 'View Field CRM'
                      : '★ All-Day Articles & Fuel'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPostmanActiveTab(
                      postmanActiveTab === 'OFFICIAL_DOCUMENTS' ? 'CRM_FIELD' : 'OFFICIAL_DOCUMENTS'
                    )
                  }
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm ${
                    postmanActiveTab === 'OFFICIAL_DOCUMENTS'
                      ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300'
                      : 'bg-emerald-950 text-emerald-200 border border-emerald-400/50 hover:bg-emerald-900'
                  }`}
                  title="Official Staff Documents & Statutory Reports Hub"
                >
                  <FileCheck2 size={15} />
                  <span>
                    {postmanActiveTab === 'OFFICIAL_DOCUMENTS'
                      ? 'View Field CRM'
                      : '📑 Official Documents Hub'}
                  </span>
                </button>

                <Link
                  to="/daily-verification"
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                  title="Open Daily 10-Property Doorstep Verification"
                >
                  <CheckCircle2 size={16} />
                  <span>Daily 10 Verification ({dailyVerifProgress.completedToday}/10)</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setShowQuickLeadForm(!showQuickLeadForm)}
                  id="postman-quick-lead-btn"
                  className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Plus size={15} />
                  <span>{showQuickLeadForm ? 'Close Form' : '+ Scheme Lead'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(true)}
                  id="postman-add-customer-btn"
                  className="px-3.5 py-2.5 bg-red-950/80 hover:bg-red-950 text-white border border-red-400/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Users size={15} />
                  <span>Add Property/Citizen</span>
                </button>
              </div>
            </div>

            {/* Postman Daily 10 Verification Progress Card */}
            <div className="mt-5 p-4 rounded-xl bg-slate-950/70 border border-red-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white flex items-center gap-1.5">
                    <CheckCircle2 size={14} className={dailyVerifProgress.isCompleted ? 'text-emerald-400' : 'text-amber-400'} />
                    Today&apos;s Mandatory Doorstep Verification (10 Properties Target)
                  </span>
                  <span className="text-amber-400 font-mono">
                    {dailyVerifProgress.completedToday} / {dailyVerifProgress.targetDaily} ({dailyVerifProgress.progressPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dailyVerifProgress.isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                    }`}
                    style={{ width: `${dailyVerifProgress.progressPct}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-300">
                  {dailyVerifProgress.isCompleted
                    ? '🎉 Excellent work! All 10 daily property verifications completed for your assigned beat.'
                    : `Remaining: ${dailyVerifProgress.remainingToday} properties to verify today. Live GPS coordinates and occupancy details required.`}
                </div>
              </div>

              <Link
                to="/daily-verification"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 self-start md:self-center shrink-0 cursor-pointer"
              >
                <span>Launch Verification Workbench</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

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

        {/* All-Day Register, Speed Post & Fuel Sheet Hub (For Postman or Admin toggled) */}
        {((!isAdmin && postmanActiveTab === 'ALL_DAY_ARTICLES') || (isAdmin && adminShowAllDayHub === 'ALL_DAY_ARTICLES')) && (
          <div className="p-4 sm:p-6 bg-slate-900/90 border-b border-slate-800">
            <PostmanAllDayArticlesOverview
              initialBeat={activeBeat}
              initialMonth="2026-10"
              embedded={true}
            />
          </div>
        )}

        {/* Dedicated Official Staff Documents & Statutory Reports Hub */}
        {((!isAdmin && postmanActiveTab === 'OFFICIAL_DOCUMENTS') || (isAdmin && adminShowAllDayHub === 'OFFICIAL_DOCUMENTS')) && (
          <div className="p-4 sm:p-6 bg-slate-900/90 border-b border-slate-800">
            <OfficialStaffDocumentsHub />
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
          {/* Immediate Action Counters Row - 1-Click Interactive Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <Link
              to="/tasks"
              className="group bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/80 p-4 rounded-xl flex items-center justify-between transition duration-200 cursor-pointer shadow-xs hover:shadow-amber-500/10"
              title="Click to Open All Priority Tasks"
            >
              <div>
                <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                  <span>Immediate Action</span>
                  <span className="text-[10px] text-amber-300 opacity-0 group-hover:opacity-100 transition">→</span>
                </span>
                <span className="text-3xl font-black text-white font-mono tabular-nums mt-0.5 block">
                  {immediateActionsCount}
                </span>
                <span className="text-[11px] text-slate-400">Tasks + Follow-ups Due</span>
              </div>
              <Clock className="w-8 h-8 text-amber-400 opacity-80 group-hover:scale-110 transition duration-200" />
            </Link>

            <Link
              to="/tasks"
              className="group bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-red-500/80 p-4 rounded-xl flex items-center justify-between transition duration-200 cursor-pointer shadow-xs hover:shadow-red-500/10"
              title="Click to Open Field Tasks"
            >
              <div>
                <span className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
                  <span>Pending Field Tasks</span>
                  <span className="text-[10px] text-red-300 opacity-0 group-hover:opacity-100 transition">→</span>
                </span>
                <span className="text-3xl font-black text-white font-mono tabular-nums mt-0.5 block">
                  {pendingTasks.length}
                </span>
                <span className="text-[11px] text-slate-400">Doorstep KYC & Passbooks</span>
              </div>
              <CheckCircle2 className="w-8 h-8 text-red-400 opacity-80 group-hover:scale-110 transition duration-200" />
            </Link>

            <Link
              to="/follow-ups"
              className="group bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/80 p-4 rounded-xl flex items-center justify-between transition duration-200 cursor-pointer shadow-xs hover:shadow-emerald-500/10"
              title="Click to Open Today's Follow-ups"
            >
              <div>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span>Today&apos;s Follow-ups</span>
                  <span className="text-[10px] text-emerald-300 opacity-0 group-hover:opacity-100 transition">→</span>
                </span>
                <span className="text-3xl font-black text-white font-mono tabular-nums mt-0.5 block">
                  {pendingFollowUps.length}
                </span>
                <span className="text-[11px] text-slate-400">Scheduled Scheme Visits</span>
              </div>
              <Target className="w-8 h-8 text-emerald-400 opacity-80 group-hover:scale-110 transition duration-200" />
            </Link>

            <Link
              to="/leads"
              className="group bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-blue-500/80 p-4 rounded-xl flex items-center justify-between transition duration-200 cursor-pointer shadow-xs hover:shadow-blue-500/10"
              title="Click to Open Scheme Leads Pipeline"
            >
              <div>
                <span className="text-[11px] text-blue-400 font-semibold flex items-center gap-1">
                  <span>Active Scheme Leads</span>
                  <span className="text-[10px] text-blue-300 opacity-0 group-hover:opacity-100 transition">→</span>
                </span>
                <span className="text-3xl font-black text-white font-mono tabular-nums mt-0.5 block">
                  {activeLeads.length}
                </span>
                <span className="text-[11px] text-slate-400">PLI · SSA · IPPB · SCSS</span>
              </div>
              <Users className="w-8 h-8 text-blue-400 opacity-80 group-hover:scale-110 transition duration-200" />
            </Link>

            <Link
              to="/unified-properties"
              className="group bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/80 p-4 rounded-xl flex items-center justify-between transition duration-200 cursor-pointer shadow-xs hover:shadow-indigo-500/10"
              title="Click to Open Unified Properties & Family Hub"
            >
              <div>
                <span className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
                  <span>Verified Master Hub</span>
                  <span className="text-[10px] text-indigo-300 opacity-0 group-hover:opacity-100 transition">→</span>
                </span>
                <span className="text-3xl font-black text-white font-mono tabular-nums mt-0.5 block">
                  {customers.length}
                </span>
                <span className="text-[11px] text-slate-400">Properties & Family Trees</span>
              </div>
              <Building2 className="w-8 h-8 text-indigo-400 opacity-80 group-hover:scale-110 transition duration-200" />
            </Link>
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
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition"
                  >
                    <div
                      onClick={() => setSelectedTaskForModal(task)}
                      className="min-w-0 flex-1 cursor-pointer"
                      title="Click to view & action task in popup"
                    >
                      <div className="font-bold text-white truncate hover:text-amber-300 transition flex items-center gap-1.5">
                        <span>{task.title}</span>
                        <span className="text-[10px] text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800 font-normal">
                          {task.status || 'Pending'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {task.category} · {task.location} · Due:{' '}
                        <span className="font-mono tabular-nums text-slate-300">{task.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedTaskForModal(task)}
                        className="p-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 cursor-pointer"
                        title="[Profile & Hub] View task detail & update status"
                      >
                        <Eye size={12} />
                      </button>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${task.location || 'Dadabari'}, Kota Rajasthan 324009`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-700/50 cursor-pointer"
                        title="[Verify Location] Open coordinates on Google Maps"
                      >
                        <Navigation size={12} />
                      </a>
                      <button
                        type="button"
                        onClick={() => customerService.updateTask(task.id, { status: 'Completed' })}
                        className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Mark Task as Done"
                      >
                        <Check size={12} />
                        <span>Done</span>
                      </button>
                    </div>
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
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition"
                  >
                    <div
                      onClick={() => setSelectedFollowUpForModal(fol)}
                      className="min-w-0 flex-1 cursor-pointer"
                      title="Click to view & reschedule / complete follow-up"
                    >
                      <div className="font-bold text-white truncate hover:text-emerald-300 transition flex items-center gap-1.5">
                        <span>{fol.customerName}</span>
                        <span className="font-mono text-amber-300 text-[11px] tabular-nums">
                          {fol.customerMobile}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {fol.productName} · {fol.nextAction}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {fol.customerMobile && (
                        <>
                          <a
                            href={`tel:${fol.customerMobile}`}
                            className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 cursor-pointer"
                            title={`Call ${fol.customerName}`}
                          >
                            <Phone size={12} />
                          </a>
                          <a
                            href={`https://wa.me/91${fol.customerMobile.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-green-950/80 hover:bg-green-900 text-green-300 border border-green-700/50 cursor-pointer"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={12} />
                          </a>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedFollowUpForModal(fol)}
                        className="p-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/50 cursor-pointer"
                        title="[Profile & Hub] Update Follow-up Status"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          customerService.completeFollowUp(
                            fol.id,
                            'Completed doorstep visit from Hero Priority Bar'
                          )
                        }
                        className="px-2 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Mark Follow-up as Complete"
                      >
                        <Check size={12} />
                        <span>Done</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          HOMEPAGE ALL SERVICES HUB (CATEGORIZED POST OFFICE & IPPB DIRECTORY)
         ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5" id="all-services-hub">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs font-bold text-red-800">
              All Services Hub · Department of Posts & India Post Payments Bank (IPPB)
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Categorized Post Office & IPPB Operational Services Hub
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any service category below to launch a 1-click doorstep lead, log a citizen service request, or dispatch a targeted beat broadcast.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/communication"
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Send size={13} />
              <span>Beat & Category Bulk Broadcast</span>
            </Link>
            <Link
              to="/services"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <span>Full Product Catalog</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Interactive Category Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl">
          {[
            { id: 'ALL', label: `All Services (${ALL_POSTAL_SERVICES_HUB.length})` },
            { id: 'IPPB', label: 'IPPB Savings / Current (3)' },
            { id: 'SMALL_SAVINGS', label: 'Small Savings: PPF · SSY · NSC · MIS · SCSS (6)' },
            { id: 'INSURANCE', label: 'PLI / RPLI Insurance (3)' },
            { id: 'AADHAAR_CELC', label: 'Aadhaar / CELC & DLC (3)' },
            { id: 'MAIL_PARCEL', label: 'Mail & Parcel Operations (2)' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveServiceHubCat(cat.id as any)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeServiceHubCat === cat.id
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-white hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Categorized Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleHubServices.map((srv) => (
            <div
              key={srv.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-red-300 transition flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-bold text-red-800">{srv.categoryLabel}</span>
                  <span>·</span>
                  <span className="font-mono font-semibold text-emerald-800">
                    {srv.rateOrHighlight}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{srv.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{srv.summary}</p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setLeadScheme(srv.title);
                    setLeadRequirement(srv.requirementPreset);
                    setLeadEstValue(srv.defaultValue);
                    setShowQuickLeadForm(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Quick Inquiry / Lead</span>
                </button>
                <Link
                  to="/leads"
                  state={{ preselectedProduct: srv.title }}
                  className="text-xs font-bold text-slate-700 hover:text-red-800 flex items-center gap-1"
                >
                  <span>Pipeline</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
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
                to="/charge-report"
                className="p-3.5 rounded-xl border border-red-200 hover:border-red-400 bg-red-50/60 flex items-center justify-between transition"
              >
                <div>
                  <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                    <span>ACG-61 Charge Report & Image Scanner</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-700 text-white font-black">NEW</span>
                  </div>
                  <div className="text-[11px] text-red-700">
                    Upload & analyze ACG-61 certificates · Relieved/Relieving officers, AM/PM & instant PDF download
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
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Verified Master Customers Directory Snapshot
              </h3>
              <span className="text-[11px] text-slate-500">Sorted Colony-Wise Ascending (A to Z) · Beat 1 to 33</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Link to="/unified-properties" className="text-xs font-bold text-indigo-700 hover:underline">
                Unified Hub →
              </Link>
              <Link to="/customers" className="text-xs font-bold text-red-800 hover:underline">
                Full Directory ({customers.length}) →
              </Link>
            </div>
          </div>

          <div className="divide-y divide-slate-200 text-xs">
            {customers.slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition gap-2"
              >
                <div
                  onClick={() => setSelectedCustomer(c)}
                  className="cursor-pointer min-w-0 flex-1"
                >
                  <div className="font-bold text-slate-900 truncate">
                    {c.name} ·{' '}
                    <span className="font-mono text-[11px] text-slate-500 font-normal tabular-nums">
                      {c.masterId || c.id}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5 truncate">
                    {c.houseNo ? `House ${c.houseNo} · ` : ''}
                    {c.sector ? `Sector ${c.sector}` : c.area} · Beat {c.beatNo || '2'}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  <div className="text-right hidden sm:block mr-1">
                    <span className="font-mono font-bold text-slate-900 block tabular-nums text-xs">
                      {c.mobile || '—'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold block">
                      {c.verificationStatus}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(c)}
                    className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold cursor-pointer transition flex items-center gap-1"
                    title="[Profile & Hub] View full citizen & family profile"
                  >
                    <Eye size={12} />
                    <span className="hidden sm:inline">Profile & Hub</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerStatusModal(c);
                      setCustModalVerification((c.verificationStatus === 'Verified' ? 'Verified' : 'Pending Verification') as any);
                    }}
                    className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold cursor-pointer transition flex items-center gap-1"
                    title="[Update Status] Doorstep occupancy & verification status"
                  >
                    <Edit2 size={11} className="text-amber-700" />
                    <span>Update Status</span>
                  </button>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${c.houseNo ? c.houseNo + ', ' : ''}${c.sector || c.area || ''}, Kota Rajasthan ${c.pincode || '324009'}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer transition"
                    title="[Verify Location] Search on Google Maps"
                  >
                    <MapPin size={12} />
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${c.houseNo ? c.houseNo + ', ' : ''}${c.sector || c.area || ''}, Kota Rajasthan ${c.pincode || '324009'}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer transition"
                    title="[Navigate Map] Turn-by-Turn GPS Directions"
                  >
                    <Navigation size={12} />
                  </a>
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
              <div
                key={l.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{l.customerName}</span>
                  <span className="font-mono text-[11px] text-slate-600 tabular-nums">
                    {l.customerMobile}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="text-red-800 font-bold">{l.productName}</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                    {l.stage}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Priority: <span className="font-semibold text-slate-800">{l.priority}</span> · Est: ₹{(l.estimatedValue || 0).toLocaleString('en-IN')}
                </div>
                {/* 1-Click Action Triggers for Scheme Leads */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1">
                    {l.customerMobile && (
                      <>
                        <a
                          href={`tel:${l.customerMobile}`}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                          title={`Call ${l.customerName}`}
                        >
                          <Phone size={11} />
                        </a>
                        <a
                          href={`https://wa.me/91${l.customerMobile.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 cursor-pointer"
                          title="WhatsApp Chat"
                        >
                          <MessageCircle size={11} />
                        </a>
                      </>
                    )}
                    {l.customerAddress && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${l.customerAddress}, Kota Rajasthan 324009`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                        title="[Verify Location] Open on Google Maps"
                      >
                        <MapPin size={11} />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLeadForModal(l);
                        setLeadModalStage(l.stage);
                        setLeadModalNotes(l.notes || '');
                      }}
                      className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold cursor-pointer transition flex items-center gap-1"
                      title="[Update Status] Convert lead or change stage"
                    >
                      <Edit2 size={11} className="text-amber-700" />
                      <span>Update Status</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/leads', { state: { preselectedLeadId: l.id } })}
                      className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold cursor-pointer transition flex items-center gap-1"
                      title="[Profile & Hub] Open full lead file"
                    >
                      <Eye size={11} />
                      <span>Lead Hub</span>
                    </button>
                  </div>
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
          onEdit={(c) => {
            setSelectedCustomer(null);
            setCustomerToEdit(c);
            setShowAddCustomerModal(true);
          }}
        />
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <AddCustomerModal
          isOpen={showAddCustomerModal}
          onClose={() => {
            setShowAddCustomerModal(false);
            setCustomerToEdit(null);
          }}
          customerToEdit={customerToEdit}
          onSaved={() => {
            refreshData();
          }}
        />
      )}

      {/* 1-Action Popup: Task Detail & Status Updater Modal */}
      {selectedTaskForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-amber-400" />
                <h3 className="font-bold text-sm text-white">Field Task Operational Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskForModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-3.5">
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Task Title</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">{selectedTaskForModal.title}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Category</span>
                  <span className="font-bold text-slate-800">{selectedTaskForModal.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Due Date</span>
                  <span className="font-mono font-bold text-slate-800 tabular-nums">{selectedTaskForModal.dueDate}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-500 font-semibold block">Doorstep Location</span>
                  <span className="font-semibold text-slate-800">{selectedTaskForModal.location}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Update Task Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Pending', 'In Progress', 'Completed'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        customerService.updateTask(selectedTaskForModal.id, { status: st });
                        setSelectedTaskForModal(null);
                        refreshData();
                      }}
                      className={`py-2 px-2 rounded-xl font-bold border transition text-center cursor-pointer ${
                        selectedTaskForModal.status === st
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${selectedTaskForModal.location || 'Dadabari'}, Kota Rajasthan 324009`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 flex items-center gap-1.5"
                >
                  <Navigation size={13} />
                  <span>Verify Location</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedTaskForModal(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1-Action Popup: Lead Action & Status Updater Modal */}
      {selectedLeadForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="p-4 bg-gradient-to-r from-red-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-amber-400" />
                <h3 className="font-bold text-sm text-white">Postal Scheme Lead Quick Action</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeadForModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-3.5">
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Citizen Name</span>
                <span className="text-base font-bold text-slate-900 block mt-0.5">
                  {selectedLeadForModal.customerName} ({selectedLeadForModal.customerMobile})
                </span>
                <span className="text-xs font-semibold text-red-800">{selectedLeadForModal.productName}</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pipeline Stage</label>
                <select
                  value={leadModalStage}
                  onChange={(e) => setLeadModalStage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white focus:ring-2 focus:ring-red-600"
                >
                  <option value="Interested">Interested (Initial Pitch)</option>
                  <option value="Documentation Pending">Documentation Pending (KYC/Form)</option>
                  <option value="Under Processing">Under Processing (At Dadabari SO Desk)</option>
                  <option value="Converted - Product Opened">Converted - Product Opened (Deposit Recd)</option>
                  <option value="Closed - Not Interested">Closed - Not Interested</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Doorstep Field Note</label>
                <textarea
                  rows={3}
                  value={leadModalNotes}
                  onChange={(e) => setLeadModalNotes(e.target.value)}
                  placeholder="Enter resident response, premium collection note, or next date..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedLeadForModal(null)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    customerService.updateLeadStage(
                      selectedLeadForModal.id,
                      leadModalStage as any,
                      leadModalNotes
                    );
                    setSelectedLeadForModal(null);
                    refreshData();
                  }}
                  className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Save & Update Lead</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1-Action Popup: Follow-up Quick Action Modal */}
      {selectedFollowUpForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Scheduled Follow-up Action</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFollowUpForModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-3.5">
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Citizen & Scheme</span>
                <span className="text-base font-bold text-slate-900 block mt-0.5">
                  {selectedFollowUpForModal.customerName} · {selectedFollowUpForModal.customerMobile}
                </span>
                <span className="text-xs text-emerald-800 font-bold">{selectedFollowUpForModal.productName}</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Follow-up Outcome / Visit Result</label>
                <textarea
                  rows={3}
                  value={followUpModalOutcome}
                  onChange={(e) => setFollowUpModalOutcome(e.target.value)}
                  placeholder="e.g. Visited house, collected passbook photocopy, customer requested callback on Monday..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    customerService.completeFollowUp(
                      selectedFollowUpForModal.id,
                      followUpModalOutcome || 'Doorstep visit completed'
                    );
                    setSelectedFollowUpForModal(null);
                    refreshData();
                  }}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Check size={13} />
                  <span>Mark Completed</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFollowUpForModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1-Action Popup: Customer Occupancy & Verification Modal */}
      {customerStatusModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="p-4 bg-gradient-to-r from-red-900 via-red-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-400" />
                <h3 className="font-bold text-sm text-white">Update Customer Doorstep Status</h3>
              </div>
              <button
                type="button"
                onClick={() => setCustomerStatusModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-3.5">
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">Citizen / Master ID</span>
                <span className="text-base font-bold text-slate-900 block mt-0.5">
                  {customerStatusModal.name} · {customerStatusModal.masterId || customerStatusModal.id}
                </span>
                <span className="text-xs text-slate-600">
                  {customerStatusModal.houseNo ? `House ${customerStatusModal.houseNo}, ` : ''}
                  {customerStatusModal.sector || customerStatusModal.area || 'Dadabari'}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Doorstep Verification Status</label>
                <select
                  value={custModalVerification}
                  onChange={(e) => setCustModalVerification(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white focus:ring-2 focus:ring-red-600"
                >
                  <option value="Verified">Verified (Ground Confirmed)</option>
                  <option value="Pending Verification">Pending Verification</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Field Delivery Remark Tag</label>
                <select
                  value={custModalRemark}
                  onChange={(e) => setCustModalRemark(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white focus:ring-2 focus:ring-red-600"
                >
                  <option value="Verification Done">Verification Done</option>
                  <option value="Standard Delivery">Standard Delivery</option>
                  <option value="Parcel Delivered">Parcel Delivered</option>
                  <option value="Scheme Lead Pitch">Scheme Lead Pitch (PLI/SSY/IPPB)</option>
                  <option value="Door Locked">Door Locked / Customer Unavailable</option>
                  <option value="Address Shifted">Address Shifted / Relocated</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCustomerStatusModal(null)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    customerService.addOrUpdateCustomer({
                      id: customerStatusModal.id,
                      verificationStatus: custModalVerification,
                      remarks: `[Doorstep Field Update]: ${custModalRemark}`,
                    });
                    setCustomerStatusModal(null);
                    refreshData();
                  }}
                  className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Save & Update</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
