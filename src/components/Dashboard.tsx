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
  Search,
  Briefcase,
  Sparkles,
  ArrowLeftRight,
  Store,
  Activity,
  Server,
  Database,
  RefreshCw,
  Copy,
  Gift,
  Wallet,
  Shield,
  Home,
  BarChart2,
  Tag,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { operationsService } from '../services/operationsService';
import { staffPermissionService, getDefaultFixedKmForBeat } from '../services/staffPermissionService';
import { featureVisibilityService } from '../services/featureVisibilityService';
import { verificationService } from '../services/verificationService';
import { staffRegistrationService } from '../services/staffRegistrationService';
import { aiCommercialVerificationService } from '../services/aiCommercialVerificationService';
import { staffProductService } from '../services/staffProductService';
import { propertyRegistryService } from '../services/propertyRegistryService';
import { academyTrainingService } from '../services/academyTrainingService';
import { partnerBrandService } from '../services/partnerBrandService';
import {
  indiaPostBulkShowcaseService,
  UnifiedShowcaseCatalogItem,
} from '../services/indiaPostBulkShowcaseService';
import { productTargetService } from '../services/productTargetService';
import { CANONICAL_BACKUP_SYNC_EMAILS } from '../services/dataConsolidationService';
import { useAuth } from './auth/FirebaseAuthProvider';

const CANONICAL_BACKUP_EMAIL = CANONICAL_BACKUP_SYNC_EMAILS[1];
import {
  Customer,
  Lead,
  FollowUp,
  DataConflict,
  DailyArticleEntry,
  SpecialBillRecord,
  Property,
  POSTAL_SERVICE_TAG_OPTIONS,
} from '../types/models';
import CustomerProfileModal from './customers/CustomerProfileModal';
import AddCustomerModal from './customers/AddCustomerModal';
import PostmanAllDayArticlesOverview from './postman/PostmanAllDayArticlesOverview';
import OfficialStaffDocumentsHub from './crm/OfficialStaffDocumentsHub';
import DailyOperationsHub from './crm/DailyOperationsHub';
import PartnerBrandManagementHub from './admin/PartnerBrandManagementHub';
import DashboardQuickActionsFab from './common/DashboardQuickActionsFab';

export default function Dashboard({
  onSwitchToCustomerPortal,
}: {
  onSwitchToCustomerPortal?: () => void;
}) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [postmanActiveTab, setPostmanActiveTab] = useState<'OPERATIONS_HUB' | 'ALL_DAY_ARTICLES' | 'CRM_FIELD' | 'OFFICIAL_DOCUMENTS'>('CRM_FIELD');
  const [adminShowAllDayHub, setAdminShowAllDayHub] = useState<'OPERATIONS_HUB' | 'CRM' | 'ALL_DAY_ARTICLES' | 'OFFICIAL_DOCUMENTS'>('OPERATIONS_HUB');
  const [properties, setProperties] = useState<Property[]>([]);
  const [, setVisibilityTick] = useState(0);

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
  const [showcaseCatalog, setShowcaseCatalog] = useState<UnifiedShowcaseCatalogItem[]>(() =>
    indiaPostBulkShowcaseService.getUnifiedShowcaseCatalog()
  );
  const [selectedCatalogCode, setSelectedCatalogCode] = useState<string>(() => {
    const items = indiaPostBulkShowcaseService.getUnifiedShowcaseCatalog();
    return items[0]?.code || 'SSA';
  });
  const [activeServiceHubCat, setActiveServiceHubCat] = useState<
    'ALL' | 'IPPB' | 'SMALL_SAVINGS' | 'INSURANCE' | 'AADHAAR_CELC' | 'MAIL_PARCEL'
  >('ALL');
  const [leadCustName, setLeadCustName] = useState('');
  const [leadCustMobile, setLeadCustMobile] = useState('');
  const [leadCustAddress, setLeadCustAddress] = useState('Keshavpura Sector 7, Kota');
  const [leadPincode, setLeadPincode] = useState(userProfile?.officePincode || '324009');
  const [leadScheme, setLeadScheme] = useState(() => {
    const items = indiaPostBulkShowcaseService.getUnifiedShowcaseCatalog();
    return items[0]?.title || 'Sukanya Samriddhi Account (SSA)';
  });
  const [leadQuantity, setLeadQuantity] = useState<number>(1);
  const [leadEstValue, setLeadEstValue] = useState<number>(50000);
  const [leadServiceTags, setLeadServiceTags] = useState<string[]>(() => {
    const items = indiaPostBulkShowcaseService.getUnifiedShowcaseCatalog();
    return items[0]?.suggestedServiceTags || [POSTAL_SERVICE_TAG_OPTIONS[2]];
  });
  const [leadPriority, setLeadPriority] = useState<'High' | 'Urgent' | 'Medium'>('High');
  const [leadRequirement, setLeadRequirement] = useState('Doorstep KYC & Account Opening');
  const [heroBannerNotice, setHeroBannerNotice] = useState<string | null>(null);
  const [prioritySearchQuery, setPrioritySearchQuery] = useState('');
  const [prioritySearchTab, setPrioritySearchTab] = useState<'MEMBERS' | 'COLLEAGUES'>('MEMBERS');

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
  const [commercialFreshSummary, setCommercialFreshSummary] = useState(() =>
    aiCommercialVerificationService.getFreshActiveStoresForPublic()
  );
  const [dispatchLogs, setDispatchLogs] = useState(() =>
    aiCommercialVerificationService.getAllDispatches()
  );

  // Developer & Master Admin API Health + DB Sync Console State
  const [systemHealth, setSystemHealth] = useState<{
    status: string;
    nodeVersion: string;
    uptimeSeconds: number;
    memoryRssMb: number;
    heapUsedMb: number;
    activeSessions: number;
    totalStaffDirectory: number;
    totalAuditEvents: number;
    services: Array<{ name: string; status: string; latencyMs: number }>;
    timestamp: string;
  } | null>(null);
  const [syncLogs, setSyncLogs] = useState<Array<{
    id: string;
    timestamp: string;
    eventType: string;
    userId: string;
    ipAddress: string;
    statusCode: number;
    details: string;
  }>>([]);
  const [isLoadingSystem, setIsLoadingSystem] = useState(false);
  const [affiliateCopied, setAffiliateCopied] = useState(false);

  const fetchSystemTelemetry = async () => {
    setIsLoadingSystem(true);
    try {
      const token =
        localStorage.getItem('xpokart_auth_token') ||
        localStorage.getItem('xpeedo_auth_token') ||
        '';
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const [healthRes, logsRes] = await Promise.all([
        fetch('/api/v1/system/health', { headers }),
        fetch('/api/v1/system/sync-logs', { headers }),
      ]);
      if (healthRes.ok) {
        const hJson = await healthRes.json();
        if (hJson?.success) setSystemHealth(hJson);
      }
      if (logsRes.ok) {
        const lJson = await logsRes.json();
        if (lJson?.success && Array.isArray(lJson.logs)) setSyncLogs(lJson.logs);
      }
    } catch {
      // ignore offline transient fetch
    } finally {
      setIsLoadingSystem(false);
    }
  };

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
    setProperties(customerService.getScopedProperties(currentProfile));
    setLeads(
      featureVisibilityService.isFeatureVisible(currentProfile, 'leadsAndSchemes')
        ? customerService
            .getLeads()
            .filter((l) => staffPermissionService.matchesUserBeatScope(currentProfile, l))
        : []
    );
    setFollowUps(
      featureVisibilityService.isFeatureVisible(currentProfile, 'leadsAndSchemes')
        ? customerService
            .getFollowUps()
            .filter((f) => staffPermissionService.matchesUserBeatScope(currentProfile, f))
        : []
    );
    setTasks(
      featureVisibilityService.isFeatureVisible(currentProfile, 'dailyOperations')
        ? customerService
            .getTasks()
            .filter((t) => staffPermissionService.matchesUserBeatScope(currentProfile, t))
        : []
    );
    setConflicts([...customerService.getConflicts()]);
    setDailyEntries(
      featureVisibilityService.isFeatureVisible(currentProfile, 'dailyOperations')
        ? operationsService
            .getDailyEntries()
            .filter((d) =>
              staffPermissionService.matchesUserBeatScope(currentProfile, {
                beatNo: d.beatNo,
                assignedStaffName: d.staffName,
                assignedStaffEmail: d.staffEmail,
              })
            )
        : []
    );
    setSpecialBills(
      featureVisibilityService.isFeatureVisible(currentProfile, 'officialDocuments') ||
        featureVisibilityService.isFeatureVisible(currentProfile, 'dailyOperations')
        ? operationsService
            .getSpecialBills()
            .filter((b) =>
              staffPermissionService.matchesUserBeatScope(currentProfile, {
                beatNo: b.beatNo,
                assignedStaffName: b.employeeName,
                assignedStaffEmail: b.employeeEmail,
              })
            )
        : []
    );
    setBackupState(operationsService.getBackupState());

    // Update role-based metrics
    setPendingRegsCount(staffRegistrationService.getPendingRegistrationsCount());
    setPendingApprovalsCount(staffRegistrationService.getPendingApprovalsCount());
    const empId = currentProfile?.employeeId || currentProfile?.id || 'CSI-10023401';
    const beat = currentProfile?.beat || 'Beat 2';
    setDailyVerifProgress(verificationService.getDailySummary(empId, beat));
    setAdminVerifStats(verificationService.getStats());
    setCommercialFreshSummary(aiCommercialVerificationService.getFreshActiveStoresForPublic());
    setDispatchLogs([...aiCommercialVerificationService.getAllDispatches()]);
  };

  useEffect(() => {
    refreshData();
    const unsubCust = customerService.subscribe(refreshData);
    const unsubOps = operationsService.subscribe(refreshData);
    const unsubStaff = staffPermissionService.subscribe(refreshData);
    const unsubStaffReg = staffRegistrationService.subscribe(refreshData);
    const unsubVerif = verificationService.subscribe(refreshData);
    const unsubVis = featureVisibilityService.subscribe(() => {
      setVisibilityTick((v) => v + 1);
      refreshData();
    });
    const unsubShowcase = indiaPostBulkShowcaseService.subscribe(() => {
      setShowcaseCatalog(indiaPostBulkShowcaseService.getUnifiedShowcaseCatalog());
    });
    const unsubTargets = productTargetService.subscribe(() => {
      setVisibilityTick((v) => v + 1);
    });
    return () => {
      unsubCust();
      unsubOps();
      unsubStaff();
      unsubStaffReg();
      unsubVerif();
      unsubVis();
      unsubShowcase();
      unsubTargets();
    };
  }, [userProfile]);

  useEffect(() => {
    const role = userProfile?.role;
    if (
      role === 'OWNER' ||
      role === 'DEVELOPER' ||
      role === 'MASTER_ADMIN' ||
      role === 'SUPER_ADMIN' ||
      userProfile?.email?.toLowerCase() === 'ektamahenmeena@gmail.com'
    ) {
      fetchSystemTelemetry();
    }
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

  const handleSelectQuickCatalogProduct = (code: string) => {
    setSelectedCatalogCode(code);
    const match = showcaseCatalog.find((i) => i.code === code);
    if (match) {
      setLeadScheme(match.title);
      const qty = Math.max(1, Number(leadQuantity) || 1);
      if (match.unitPrice && match.unitPrice > 0) {
        setLeadEstValue(match.unitPrice * qty);
      }
      if (match.suggestedServiceTags.length > 0) {
        setLeadServiceTags(match.suggestedServiceTags);
      }
    }
  };

  const toggleQuickLeadTag = (tag: string) => {
    setLeadServiceTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleQuickLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadCustName.trim() || !leadCustMobile.trim()) return;

    const matchedProduct = showcaseCatalog.find((i) => i.code === selectedCatalogCode);
    const productTitle = matchedProduct?.title || leadScheme;
    const productCode = matchedProduct?.code || leadScheme.split(' ')[0].toUpperCase();
    const qty = Math.max(1, Number(leadQuantity) || 1);

    const custRes = customerService.addOrUpdateCustomer(
      {
        name: leadCustName.trim(),
        mobile: leadCustMobile.trim(),
        beatNo: activeBeat,
        pincode: leadPincode.trim() || userProfile?.officePincode || '324009',
        financialInterest: productTitle,
        interestedServiceTags: leadServiceTags,
        enteredBy: userProfile?.email || 'Ektamahenmeena@gmail.com',
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
      pincode: leadPincode.trim() || userProfile?.officePincode || '324009',
      postOfficeName: userProfile?.subOffice || 'Dadabari S.O.',
      officeName: userProfile?.subOffice || 'Dadabari S.O.',
      beatNo: activeBeat,
      productCode,
      productName: productTitle,
      quantity: qty,
      selectedProducts: matchedProduct
        ? [
            {
              id: matchedProduct.id,
              code: matchedProduct.code,
              title: matchedProduct.title,
              sourceType: matchedProduct.sourceType,
              category: matchedProduct.category,
              unitPrice: matchedProduct.unitPrice,
              quantity: qty,
              commissionOrRate: matchedProduct.commissionOrRate,
              sla: matchedProduct.sla,
              bulkCustomerName: matchedProduct.bulkCustomerName,
              pincode: matchedProduct.pincode,
            },
          ]
        : undefined,
      commissionInfo: matchedProduct?.commissionOrRate,
      sla: matchedProduct?.sla,
      serviceTags: leadServiceTags,
      requirement: leadRequirement,
      source: 'Hero 1-Click Quick Capture',
      stage: 'New',
      priority: leadPriority,
      leadScore: 90,
      estimatedValue: Number(leadEstValue) || 25000,
      assignedStaffName: userProfile?.name || 'Mahendra Kumar Meena',
      assignedStaffId: userProfile?.employeeId || userProfile?.id,
      assignedStaffEmail: userProfile?.email,
      nextAction: 'Immediate Doorstep KYC & Proposal Form Collection',
      nextFollowUpDate: todayStr,
    });

    setHeroBannerNotice(
      `Lead Captured: ${createdLead.customerName} (${createdLead.productName} × ${qty}) added to Pipeline & Backup Queue!`
    );
    setLeadCustName('');
    setLeadCustMobile('');
    setLeadQuantity(1);
    setShowQuickLeadForm(false);
    refreshData();
  };

  const handleDailyArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const curUser = staffPermissionService.getActiveSession() || userProfile;
    const result = operationsService.patchOrUpsertDailyArticleQuantities(
      {
        date: artDate,
        employeeId: curUser?.employeeId || curUser?.id || 'MASTER-ADMIN-01',
        staffName: curUser?.name || 'Ekta Meena',
        staffEmail: curUser?.email || 'Ektamahenmeena@gmail.com',
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
    userProfile?.role === 'OWNER' ||
    userProfile?.role === 'DEVELOPER' ||
    userProfile?.role === 'MASTER_ADMIN' ||
    userProfile?.role === 'SUPER_ADMIN' ||
    userProfile?.role === 'ADMIN' ||
    userProfile?.email?.toLowerCase() === 'ektamahenmeena@gmail.com';

  const isDeveloperOrOwner =
    userProfile?.role === 'DEVELOPER' ||
    userProfile?.role === 'OWNER' ||
    userProfile?.role === 'MASTER_ADMIN' ||
    userProfile?.role === 'SUPER_ADMIN' ||
    userProfile?.email?.toLowerCase() === 'ektamahenmeena@gmail.com';

  const brandIdentity = featureVisibilityService.getBrandIdentity(userProfile);
  const isWhiteLabel = brandIdentity.isWhiteLabel;
  const strictVendorId = featureVisibilityService.isStrictlyScopedToVendor(userProfile);

  const showProperty = featureVisibilityService.isFeatureVisible(userProfile, 'property');
  const showMembers = featureVisibilityService.isFeatureVisible(userProfile, 'members');
  const showBeats = featureVisibilityService.isFeatureVisible(userProfile, 'beats');
  const showDailyOps = featureVisibilityService.isFeatureVisible(userProfile, 'dailyOperations');
  const showLastMileOps =
    featureVisibilityService.isFeatureVisible(userProfile, 'lastMileOps') || showDailyOps;
  const showOfficialDocs = featureVisibilityService.isFeatureVisible(userProfile, 'officialDocuments');
  const showLeads = featureVisibilityService.isFeatureVisible(userProfile, 'leadsAndSchemes');
  const showShowcase = featureVisibilityService.isFeatureVisible(userProfile, 'showcase');
  const showProductTargets = featureVisibilityService.isFeatureVisible(userProfile, 'productTargets');
  const showMasterSearch = featureVisibilityService.isFeatureVisible(userProfile, 'masterSearch');
  const showReports = featureVisibilityService.isFeatureVisible(userProfile, 'reports');
  const showVerification = featureVisibilityService.isFeatureVisible(userProfile, 'dailyVerification');
  const showCommunication = featureVisibilityService.isFeatureVisible(userProfile, 'communication');
  const showStaffDir = featureVisibilityService.isFeatureVisible(userProfile, 'staffDirectory');
  const isSuperior =
    staffPermissionService.isSuperAdmin(userProfile) ||
    staffPermissionService.isSuperiorRole(userProfile);

  const showCommercial =
    !isWhiteLabel &&
    strictVendorId !== 'INDIA_POST' &&
    featureVisibilityService.isFeatureVisible(userProfile, 'commercialDirectory');
  const showVendorSection =
    !isWhiteLabel &&
    strictVendorId !== 'INDIA_POST' &&
    featureVisibilityService.isFeatureVisible(userProfile, 'vendorSection');
  const showStorefront =
    !isWhiteLabel &&
    strictVendorId !== 'INDIA_POST' &&
    featureVisibilityService.isFeatureVisible(userProfile, 'storefront');

  const isPropertyMembersOnlyMode =
    !isAdmin &&
    !showBeats &&
    !showDailyOps &&
    !showLastMileOps &&
    !showOfficialDocs &&
    !showLeads &&
    !showVerification &&
    !showCommercial &&
    !showVendorSection &&
    !showStorefront;

  const canAccessSpecialBills = showOfficialDocs || showDailyOps;

  const topMarginVendors = showVendorSection
    ? staffProductService.sortVendorStoresByMarginPriority(commercialFreshSummary.freshStores).slice(0, 3)
    : [];

  const beatScopedDispatches = isAdmin
    ? dispatchLogs
    : dispatchLogs.filter((d) => (d.beatNo || '').toLowerCase() === activeBeat.toLowerCase());
  const beatDeliveredDispatches = beatScopedDispatches.filter(
    (d) => d.status === 'DELIVERED' || d.status === 'COD_SETTLED'
  );
  const beatParcelCodTotal = beatScopedDispatches.reduce((s, d) => s + (d.codAmount || 0), 0);
  const beatDeliveryFeeEarned = beatDeliveredDispatches.length * 15;
  const staffReferralCode = `XPO-${(userProfile?.employeeId || 'BEAT2').replace(/[^A-Z0-9]/gi, '').slice(0, 8).toUpperCase()}`;

  return (
    <div className="space-y-6" id="dashboard-view">
      {/* =====================================================================
          HERO SECTION: ROLE-TAILORED COMMAND STRIP (OWNER/ADMIN/DEV vs WHITE-LABEL POSTMAN/GDS)
         ===================================================================== */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-md">
        {isAdmin ? (
          /* ================= EXECUTIVE / DEVELOPER / MASTER ADMIN COMMAND CENTER ================= */
          <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 p-6 border-b border-red-900/40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/60 border border-red-700/60 text-amber-300 text-xs font-bold tracking-wide">
                  <ShieldCheck size={14} className="text-amber-400" />
                  <span>
                    {userProfile?.role === 'DEVELOPER'
                      ? 'Developer System Console'
                      : userProfile?.role === 'OWNER'
                      ? 'Sovereign Owner Command Room'
                      : 'Master Admin Control Room'}{' '}
                    · {userProfile?.name || 'Ekta Meena'} ({userProfile?.email || 'ektamahenmeena@gmail.com'})
                  </span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>India Post — Divisional &amp; Bulk Customer Operations Control</span>
                </h1>
                <p className="text-xs text-slate-300 max-w-2xl">
                  {strictVendorId === 'INDIA_POST' || isWhiteLabel
                    ? 'Scoped Postal Operations Desk: manage offices, beats, properties, members, daily articles, and statutory documents within your assigned postal jurisdiction.'
                    : 'Rajasthan Circle · Kota Division & Pan-India Operations Desk. Centralized command: review staff registrations, monitor API health & DB sync logs, manage Bulk Customer promotions, and audit Speed Post COD settlements.'}
                </p>
                <div className="text-xs text-red-200 flex flex-wrap items-center gap-2 pt-1 font-mono">
                  <span>Division: Kota Postal Circle</span>
                  <span>·</span>
                  <span>Managed Beat Tree: Active</span>
                  {!isWhiteLabel && strictVendorId !== 'INDIA_POST' && (
                    <>
                      <span>·</span>
                      <span>Payouts: ₹15/Del · ₹100/Ref · 15–25% B2B</span>
                    </>
                  )}
                  <span>·</span>
                  <Link to="/staff-master" className="text-amber-400 hover:underline">
                    Staff Management ↗
                  </Link>
                  {onSwitchToCustomerPortal && showStorefront && !isWhiteLabel && (
                    <>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={onSwitchToCustomerPortal}
                        className="text-emerald-300 hover:underline cursor-pointer"
                      >
                        Storefront Preview ↗
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Admin Primary Action Strip */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  to="/role-access-dashboard"
                  state={{ initialTab: 'VISIBILITY' }}
                  className="px-3.5 py-2.5 bg-red-700 hover:bg-red-600 text-white border border-amber-400/50 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                  title="Toggle Role Feature Visibility & Assign Scoped Vendor Access"
                >
                  <Shield size={15} className="text-amber-300" />
                  <span>Visibility &amp; Vendor Access</span>
                </Link>

                {(!strictVendorId || strictVendorId === 'INDIA_POST') && (
                  <Link
                    to="/india-post?tab=STAFF_ROLES"
                    className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                    title="Manage India Post Staff Post-Wise Roles, Promotions & Profiles"
                  >
                    <Users size={15} className="text-sky-300" />
                    <span>Staff Roles &amp; Promotions</span>
                  </Link>
                )}

                {!strictVendorId && (
                  <>
                    <Link
                      to="/staff-registrations"
                      className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                      title="Review Staff Registration Requests"
                    >
                      <Users size={15} />
                      <span>Staff Requests</span>
                      {pendingRegsCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-red-700 text-white text-[10px] font-black">
                          {pendingRegsCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/profile-approvals"
                      className="px-3.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                      title="Review Staff Profile Change Requests"
                    >
                      <ShieldCheck size={15} />
                      <span>Profile Approvals</span>
                      {pendingApprovalsCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                          {pendingApprovalsCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                {showVendorSection && (
                  <>
                    <Link
                      to="/partner-brand-management"
                      className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                      title="Manage Brands, Linked Stores, Direct Stores & Isolated Partner Portals"
                    >
                      <Building2 size={15} className="text-red-700" />
                      <span>Partner &amp; Brand Hub</span>
                    </Link>
                    <Link
                      to="/vendor-ecosystem"
                      className="px-3.5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                      title="Open Consolidated Vendor Section (India Post & Partner Network)"
                    >
                      <Store size={15} />
                      <span>Vendor Section</span>
                    </Link>
                  </>
                )}

                {showVerification && (
                  <Link
                    to="/verifications"
                    className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                    title="Daily 10-Property Field Verification Monitor"
                  >
                    <CheckCircle2 size={15} />
                    <span>Verifications Monitor</span>
                  </Link>
                )}

                {showDailyOps && (
                  <>
                    <button
                      type="button"
                      onClick={() => setAdminShowAllDayHub(adminShowAllDayHub === 'OPERATIONS_HUB' ? 'CRM' : 'OPERATIONS_HUB')}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap ${
                        adminShowAllDayHub === 'OPERATIONS_HUB'
                          ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300'
                          : 'bg-red-950 hover:bg-red-900 text-amber-300 border border-amber-400/40'
                      }`}
                      title="Daily Operations Hub & Fuel Reconciliation"
                    >
                      <Package size={15} />
                      <span>{adminShowAllDayHub === 'OPERATIONS_HUB' ? 'View Full CRM Grid' : 'Operations Hub & Fuel'}</span>
                    </button>

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
                  </>
                )}

                {showOfficialDocs && (
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
                )}

                {showMembers && (
                  <button
                    type="button"
                    onClick={() => setShowAddCustomerModal(true)}
                    id="admin-add-customer-btn"
                    className="px-3.5 py-2.5 bg-red-900/80 hover:bg-red-900 text-white border border-red-400/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Plus size={15} />
                    <span>Add Customer</span>
                  </button>
                )}
              </div>
            </div>

            {/* Admin Metric Highlights — Color-Coded Shadow-Elevated Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800">
              <Link
                to="/staff-registrations"
                className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/90 to-slate-900 border border-amber-500/40 hover:border-amber-400 transition block shadow-md"
              >
                <div className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">Pending Registrations</div>
                <div className="text-2xl font-black text-white font-mono tabular-nums mt-1 flex items-center gap-2">
                  <span>{pendingRegsCount}</span>
                  {pendingRegsCount > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black">Needs Review</span>}
                </div>
              </Link>

              {showCommercial && !isWhiteLabel && (
                <Link
                  to="/commercial-intelligence"
                  className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/90 to-slate-900 border border-rose-500/40 hover:border-rose-400 transition block shadow-md"
                >
                  <div className="text-[11px] text-rose-300 font-bold uppercase tracking-wider">AI Stale Store Alerts</div>
                  <div className="text-2xl font-black text-white font-mono tabular-nums mt-1 flex items-center gap-2">
                    <span>{commercialFreshSummary.staleExcludedCount}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-400/40 font-bold">
                      {commercialFreshSummary.freshStores.length} Fresh
                    </span>
                  </div>
                </Link>
              )}

              <Link
                to="/verifications"
                className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/90 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 transition flex items-center justify-between gap-2 shadow-md"
              >
                <div>
                  <div className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider">Today&apos;s Verifications</div>
                  <div className="text-2xl font-black text-white font-mono tabular-nums mt-1 flex items-center gap-1.5">
                    <span>{adminVerifStats.totalVerifiedToday}</span>
                    <span className="text-[10px] text-emerald-300 font-normal">Dadabari</span>
                  </div>
                </div>
                <svg className="w-11 h-11 -rotate-90 shrink-0" viewBox="0 0 44 44" aria-hidden="true">
                  <circle cx="22" cy="22" r="18" stroke="rgba(16,185,129,0.2)" strokeWidth="4" fill="none" />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    stroke="#34d399"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={2 * Math.PI * 18 * (1 - Math.min(100, dailyVerifProgress.progressPct) / 100)}
                  />
                </svg>
              </Link>

              <Link
                to="/unified-properties"
                className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/90 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 transition block shadow-md"
              >
                <div className="text-[11px] text-indigo-300 font-bold uppercase tracking-wider">Master Directory</div>
                <div className="text-2xl font-black text-white font-mono tabular-nums mt-1 flex items-center gap-2">
                  <span>{customers.length}</span>
                  <span className="text-[10px] text-indigo-200 font-normal">Properties · Beat Tree</span>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          /* ================= WHITE-LABEL / SCOPED POSTMAN & GDS COMMAND WORKSPACE ================= */
          <div className="bg-gradient-to-r from-red-950 via-red-900 to-slate-900 p-6 border-b border-red-800/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-950/80 border border-red-700/60 text-amber-300 text-xs font-bold tracking-wide">
                  <Building2 size={13} className="text-amber-400" />
                  <span>
                    {brandIdentity.title} · {userProfile?.name || 'Postal Staff'} ({userProfile?.employeeId || 'Staff'})
                  </span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>
                    {isPropertyMembersOnlyMode
                      ? `${activeBeat} — Property & Members Workspace`
                      : `${activeBeat} Postal Operations Workspace`}
                  </span>
                </h1>
                <p className="text-xs text-red-100 max-w-2xl">
                  {userProfile?.subOffice || 'Kota Division Office'} ·{' '}
                  {userProfile?.division || 'Kota Division'}. Focused departmental view displaying only your enabled operational sections for {activeBeat}.
                </p>
                <div className="text-xs text-red-200 flex flex-wrap items-center gap-2 pt-1 font-mono">
                  <span>Jurisdiction: {activeBeat}</span>
                  {showBeats && (
                    <>
                      <span>·</span>
                      <Link to="/my-beat" className="text-amber-300 hover:underline">
                        My Beat Directory ↗
                      </Link>
                    </>
                  )}
                  {showCommunication && (
                    <>
                      <span>·</span>
                      <Link to="/my-submissions" className="text-amber-300 hover:underline">
                        My Submissions ↗
                      </Link>
                    </>
                  )}
                  <span>·</span>
                  <Link to="/my-profile" className="text-amber-300 hover:underline">
                    My Profile ↗
                  </Link>
                </div>
              </div>

              {/* Dynamic Feature-Gated Action Strip (What is Visible is What Shows) */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {showProperty && (
                  <Link
                    to="/properties"
                    className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    <Building2 size={15} className="text-red-800" />
                    <span>Property ({properties.length})</span>
                  </Link>
                )}

                {showMembers && (
                  <Link
                    to="/customers"
                    className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    <Users size={15} />
                    <span>Members ({customers.length})</span>
                  </Link>
                )}

                {showDailyOps && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setPostmanActiveTab(
                          postmanActiveTab === 'OPERATIONS_HUB' ? 'CRM_FIELD' : 'OPERATIONS_HUB'
                        )
                      }
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm ${
                        postmanActiveTab === 'OPERATIONS_HUB'
                          ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300'
                          : 'bg-red-950 text-amber-300 border border-amber-400/50 hover:bg-red-900'
                      }`}
                    >
                      <Package size={15} />
                      <span>
                        {postmanActiveTab === 'OPERATIONS_HUB' ? 'Overview' : 'Operations Hub & Fuel'}
                      </span>
                    </button>

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
                          : 'bg-blue-900 text-white hover:bg-blue-800'
                      }`}
                    >
                      <FileText size={15} />
                      <span>All-Day Articles</span>
                    </button>
                  </>
                )}

                {showOfficialDocs && (
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
                  >
                    <FileCheck2 size={15} />
                    <span>Official Docs</span>
                  </button>
                )}

                {showVendorSection && (
                  <Link
                    to="/vendor-ecosystem"
                    className="px-3.5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    <Store size={15} />
                    <span>Vendor Ecosystem</span>
                  </Link>
                )}

                {showVerification && (
                  <Link
                    to="/daily-verification"
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    <CheckCircle2 size={16} />
                    <span>Daily Verification ({dailyVerifProgress.completedToday}/10)</span>
                  </Link>
                )}

                {showLeads && (
                  <button
                    type="button"
                    onClick={() => setShowQuickLeadForm(!showQuickLeadForm)}
                    id="postman-quick-lead-btn"
                    className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Plus size={15} />
                    <span>{showQuickLeadForm ? 'Close Form' : '+ Scheme Lead'}</span>
                  </button>
                )}

                {(showProperty || showMembers) && (
                  <button
                    type="button"
                    onClick={() => setShowAddCustomerModal(true)}
                    id="postman-add-customer-btn"
                    className="px-3.5 py-2.5 bg-red-950/80 hover:bg-red-950 text-white border border-red-400/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Plus size={15} />
                    <span>Add Member / Property</span>
                  </button>
                )}

                {showShowcase && (
                  <Link
                    to="/india-post-storefront"
                    className="px-3.5 py-2.5 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    <Store size={15} />
                    <span>India Post Showcase</span>
                  </Link>
                )}

                {showProductTargets && (
                  <Link
                    to="/product-targets"
                    className="px-3.5 py-2.5 bg-slate-950/90 hover:bg-slate-900 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    <Target size={15} />
                    <span>Targets</span>
                  </Link>
                )}

                {showMasterSearch && (
                  <Link
                    to="/master-search"
                    className="px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    <Search size={15} />
                    <span>Master Search</span>
                  </Link>
                )}

                {(showReports || isSuperior) && (
                  <Link
                    to="/reports"
                    className="px-3.5 py-2.5 bg-indigo-900/90 hover:bg-indigo-800 text-white border border-indigo-400/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    <BarChart2 size={15} />
                    <span>Superior Reports</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Daily Verification Progress Card — Cascaded Hidden unless dailyVerification is enabled */}
            {showVerification && (
              <div className="mt-5 p-4 rounded-xl bg-slate-950/70 border border-red-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white flex items-center gap-1.5">
                      <CheckCircle2 size={14} className={dailyVerifProgress.isCompleted ? 'text-emerald-400' : 'text-amber-400'} />
                      Today&apos;s Doorstep Verification Target
                    </span>
                    <span className="text-amber-400 font-mono tabular-nums">
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
                </div>

                <Link
                  to="/daily-verification"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 self-start md:self-center shrink-0 cursor-pointer"
                >
                  <span>Open Verification</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
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

        {/* Daily Operations Hub & Fuel Reconciliation (Strictly gated on showDailyOps) */}
        {showDailyOps &&
          ((!isAdmin && postmanActiveTab === 'OPERATIONS_HUB') || (isAdmin && adminShowAllDayHub === 'OPERATIONS_HUB')) && (
            <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800">
              <DailyOperationsHub
                onOpenCustomerModal={(c) => setSelectedCustomer(c)}
                onOpenLeadModal={(l) => {
                  setSelectedLeadForModal(l);
                  setLeadModalStage(l.stage);
                  setLeadModalNotes(l.notes || '');
                }}
                onNavigateToFullLog={() => {
                  if (isAdmin) setAdminShowAllDayHub('ALL_DAY_ARTICLES');
                  else setPostmanActiveTab('ALL_DAY_ARTICLES');
                }}
              />
            </div>
          )}

        {/* All-Day Register, Speed Post & Fuel Sheet Hub */}
        {showDailyOps &&
          ((!isAdmin && postmanActiveTab === 'ALL_DAY_ARTICLES') || (isAdmin && adminShowAllDayHub === 'ALL_DAY_ARTICLES')) && (
            <div className="p-4 sm:p-6 bg-slate-900/90 border-b border-slate-800">
              <PostmanAllDayArticlesOverview
                initialBeat={activeBeat}
                initialMonth="2026-10"
                embedded={true}
              />
            </div>
          )}

        {/* Dedicated Official Staff Documents & Statutory Reports Hub */}
        {showOfficialDocs &&
          ((!isAdmin && postmanActiveTab === 'OFFICIAL_DOCUMENTS') || (isAdmin && adminShowAllDayHub === 'OFFICIAL_DOCUMENTS')) && (
            <div className="p-4 sm:p-6 bg-slate-900/90 border-b border-slate-800">
              <OfficialStaffDocumentsHub />
            </div>
          )}

        {/* Collapsible 1-Click Quick Showcase & Scheme Lead Form */}
        {showLeads && showQuickLeadForm && (
          <form
            onSubmit={handleQuickLeadSubmit}
            className="p-6 bg-slate-950 border-b border-slate-800 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-bold text-amber-400">
                Quick Lead Capture — Showcase Offerings, Bulk Promoted Products &amp; Postal Schemes
              </div>
              <span className="text-xs text-slate-400">
                Auto-tagged to {userProfile?.name} · {activeBeat}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
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

              <div className="lg:col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Product / Offering / Bulk Showcase Item *
                </label>
                <select
                  value={selectedCatalogCode}
                  onChange={(e) => handleSelectQuickCatalogProduct(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <optgroup label="India Post Service Offerings">
                    {showcaseCatalog
                      .filter((i) => i.sourceType === 'SHOWCASE_OFFERING')
                      .map((item) => (
                        <option key={item.id} value={item.code}>
                          {item.title} ({item.commissionOrRate})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Bulk Customer & Promoted Products">
                    {showcaseCatalog
                      .filter((i) => i.sourceType === 'BULK_PROMOTED')
                      .map((item) => (
                        <option key={item.id} value={item.code}>
                          {item.title} — {item.bulkCustomerName}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Sovereign Postal Schemes">
                    {showcaseCatalog
                      .filter((i) => i.sourceType === 'POSTAL_SCHEME')
                      .map((item) => (
                        <option key={item.id} value={item.code}>
                          {item.title} ({item.commissionOrRate})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Qty / Units
                </label>
                <input
                  type="number"
                  min={1}
                  value={leadQuantity}
                  onChange={(e) => {
                    const q = Math.max(1, Number(e.target.value) || 1);
                    setLeadQuantity(q);
                    const match = showcaseCatalog.find((i) => i.code === selectedCatalogCode);
                    if (match?.unitPrice && match.unitPrice > 0) {
                      setLeadEstValue(match.unitPrice * q);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Est. Value (₹)
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
                  <span>Save Lead</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  House No &amp; Locality
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
                  Office PIN Code
                </label>
                <input
                  type="text"
                  value={leadPincode}
                  onChange={(e) => setLeadPincode(e.target.value)}
                  placeholder="324009"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Requirement / Follow-up Note
                </label>
                <input
                  type="text"
                  value={leadRequirement}
                  onChange={(e) => setLeadRequirement(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Tag size={12} className="text-amber-400" />
                <span>Interested Postal Service Tags (Auto-synced to Citizen Profile)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POSTAL_SERVICE_TAG_OPTIONS.map((tag) => {
                  const selected = leadServiceTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleQuickLeadTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                        selected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        )}

        {/* Clean Property, Members & Staff Showcase/Search Strip for Focused Mode */}
        {isPropertyMembersOnlyMode ? (
          <div className="p-6 bg-slate-900/50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {showProperty && (
                <Link
                  to="/properties"
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-400/60 transition flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      Assigned Property Registry
                    </div>
                    <div className="text-3xl font-black text-white font-mono tabular-nums">
                      {properties.length}
                    </div>
                    <div className="text-xs text-slate-300">
                      Properties mapped in {activeBeat} ({userProfile?.subOffice || 'Dadabari S.O.'})
                    </div>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0">
                    <span>Open</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              )}

              {showMembers && (
                <Link
                  to="/customers"
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-400/60 transition flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      Assigned Members Directory
                    </div>
                    <div className="text-3xl font-black text-white font-mono tabular-nums">
                      {customers.length}
                    </div>
                    <div className="text-xs text-slate-300">
                      Verified residents &amp; members under {activeBeat}
                    </div>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0">
                    <span>Open</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              )}

              {showShowcase && (
                <Link
                  to="/india-post-storefront"
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-red-400/60 transition flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-red-400">
                      India Post Showcase
                    </div>
                    <div className="text-3xl font-black text-white font-mono tabular-nums">
                      {showcaseCatalog.length}
                    </div>
                    <div className="text-xs text-slate-300">
                      Offerings &amp; bulk promoted products
                    </div>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 shrink-0">
                    <span>Browse</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              )}

              {showMasterSearch && (
                <Link
                  to="/master-search"
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-400/60 transition flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                      Unified Master Search
                    </div>
                    <div className="text-sm font-black text-white">
                      Citizens, Tags, PINs &amp; Beats
                    </div>
                    <div className="text-xs text-slate-300">
                      Scoped search across your assigned beat/PIN
                    </div>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0">
                    <span>Search</span>
                    <Search size={14} />
                  </div>
                </Link>
              )}

              {showProductTargets && (
                <Link
                  to="/product-targets"
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-400/60 transition flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                      Product Targets
                    </div>
                    <div className="text-sm font-black text-white">
                      Targets vs Achievement
                    </div>
                    <div className="text-xs text-slate-300">
                      Live scheme &amp; bulk product progress
                    </div>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0">
                    <span>View</span>
                    <Target size={14} />
                  </div>
                </Link>
              )}

              {(showReports || isSuperior) && (
                <Link
                  to="/reports"
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-400/60 transition flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                      Superior Reporting MIS
                    </div>
                    <div className="text-sm font-black text-white">
                      Team, Beat &amp; Revenue Reports
                    </div>
                    <div className="text-xs text-slate-300">
                      Scoped operational &amp; CSV exports
                    </div>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0">
                    <span>Reports</span>
                    <BarChart2 size={14} />
                  </div>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Executive Metric Cards — Strictly Cascading Based on Enabled Visibility */}
            <div className="p-6 space-y-6 bg-slate-900/40">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {showCommercial && (
                  <Link
                    to="/commercial-intelligence"
                    className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white rounded-2xl p-4 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition space-y-2 block"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/20 text-white">
                        AI 4-Factor Hub
                      </span>
                      <Sparkles className="text-amber-300" size={18} />
                    </div>
                    <div className="text-2xl font-black font-mono tabular-nums">
                      {commercialFreshSummary.freshStores.length}
                    </div>
                    <div className="text-xs text-indigo-100 font-medium">
                      Fresh Partners ({commercialFreshSummary.staleExcludedCount} Stale Alert)
                    </div>
                  </Link>
                )}

                {showProperty && (
                  <Link
                    to="/properties"
                    className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition space-y-2 block"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/20 text-white">
                        Property Registry
                      </span>
                      <Building2 className="text-emerald-100" size={18} />
                    </div>
                    <div className="text-2xl font-black font-mono tabular-nums">
                      {properties.length}
                    </div>
                    <div className="text-xs text-emerald-100 font-medium">Scoped Properties</div>
                  </Link>
                )}

                {showMembers && (
                  <Link
                    to="/customers"
                    className="bg-gradient-to-br from-sky-700 to-blue-800 text-white rounded-2xl p-4 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition space-y-2 block"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/20 text-white">
                        Members Directory
                      </span>
                      <Users className="text-sky-100" size={18} />
                    </div>
                    <div className="text-2xl font-black font-mono tabular-nums">
                      {customers.length}
                    </div>
                    <div className="text-xs text-sky-100 font-medium">Assigned Members</div>
                  </Link>
                )}

                {showDailyOps && (
                  <>
                    <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-4 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/20 text-white">
                          Active Delivery
                        </span>
                        <Package className="text-white" size={18} />
                      </div>
                      <div className="text-2xl font-black font-mono tabular-nums">
                        {totalDelivAll || 1420}
                      </div>
                      <div className="text-xs text-amber-50 font-medium">
                        Daily Article Deliveries
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-sky-600 to-blue-700 text-white rounded-2xl p-4 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/20 text-white">
                          DSS &amp; Fuel
                        </span>
                        <Fuel className="text-sky-100" size={18} />
                      </div>
                      <div className="text-2xl font-black font-mono tabular-nums">
                        {specialBills.filter((b) => b.type === 'FUEL_BILL').length || 34}
                      </div>
                      <div className="text-xs text-sky-100 font-medium">Fuel Claims @ ₹3.60/KM</div>
                    </div>
                  </>
                )}

                {showVerification && (
                  <div className="bg-gradient-to-br from-rose-600 to-red-700 text-white rounded-2xl p-4 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/20 text-white">
                        Pending Audit
                      </span>
                      <ShieldCheck className="text-rose-100" size={18} />
                    </div>
                    <div className="text-2xl font-black font-mono tabular-nums">
                      {Math.max(0, 10 - dailyVerifProgress.completedToday)}
                    </div>
                    <div className="text-xs text-rose-100 font-medium">Daily Verification Remaining</div>
                  </div>
                )}

                {showBeats && (
                  <div className="bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-2xl p-4 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition space-y-2 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                        {userProfile?.subOffice || 'Dadabari S.O.'}
                      </span>
                      <MapPin className="text-amber-400" size={18} />
                    </div>
                    <div className="text-2xl font-black font-mono tabular-nums">{isAdmin ? '34' : activeBeat}</div>
                    <div className="text-xs text-slate-300 font-medium">Beat Jurisdiction</div>
                  </div>
                )}
              </div>

              {/* Quick-Action Shortcut Grid & Real-Time Activity Feed Card (Cascaded by Visibility) */}
              {(showCommercial ||
                showDailyOps ||
                showLastMileOps ||
                showOfficialDocs ||
                showStorefront ||
                showShowcase ||
                showProductTargets ||
                showMasterSearch ||
                showReports ||
                isSuperior ||
                (isAdmin && !strictVendorId)) && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 lg:col-span-2">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className="text-red-700" size={16} />
                      <span>Quick-Action Operational Shortcuts</span>
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {showShowcase && (
                        <Link
                          to="/india-post-storefront"
                          className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 border border-red-200 hover:border-red-400 hover:-translate-y-0.5 transition flex flex-col justify-between space-y-3 group cursor-pointer shadow-xs"
                        >
                          <div className="w-10 h-10 rounded-xl bg-red-700 text-white flex items-center justify-center font-bold shadow-sm">
                            <Store size={20} />
                          </div>
                          <div>
                            <div className="text-xs font-black text-red-950">India Post Showcase</div>
                            <div className="text-[11px] text-red-800 mt-0.5">Offerings &amp; bulk items</div>
                          </div>
                        </Link>
                      )}

                      {showProductTargets && (
                        <Link
                          to="/product-targets"
                          className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200 hover:border-amber-400 hover:-translate-y-0.5 transition flex flex-col justify-between space-y-3 group cursor-pointer shadow-xs"
                        >
                          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-sm">
                            <Target size={20} />
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900">Product Targets</div>
                            <div className="text-[11px] text-slate-600 mt-0.5">Units &amp; revenue progress</div>
                          </div>
                        </Link>
                      )}

                      {showMasterSearch && (
                        <Link
                          to="/master-search"
                          className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-100 border border-sky-200 hover:border-sky-400 hover:-translate-y-0.5 transition flex flex-col justify-between space-y-3 group cursor-pointer shadow-xs"
                        >
                          <div className="w-10 h-10 rounded-xl bg-sky-700 text-white flex items-center justify-center font-bold shadow-sm">
                            <Search size={20} />
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900">Master Search</div>
                            <div className="text-[11px] text-slate-600 mt-0.5">Citizens, tags &amp; PINs</div>
                          </div>
                        </Link>
                      )}

                      {(showReports || isSuperior) && (
                        <Link
                          to="/reports"
                          className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 border border-indigo-200 hover:border-indigo-400 hover:-translate-y-0.5 transition flex flex-col justify-between space-y-3 group cursor-pointer shadow-xs"
                        >
                          <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-bold shadow-sm">
                            <BarChart2 size={20} />
                          </div>
                          <div>
                            <div className="text-xs font-black text-indigo-950">Superior Reports</div>
                            <div className="text-[11px] text-indigo-700 mt-0.5">Scoped MIS &amp; CSV</div>
                          </div>
                        </Link>
                      )}

                      {(showDailyOps || showLastMileOps) && (
                        <Link
                          to="/last-mile-ops"
                          className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-200 hover:border-amber-400 hover:-translate-y-0.5 transition flex flex-col justify-between space-y-3 group cursor-pointer shadow-xs"
                        >
                          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm">
                            <Fuel size={20} />
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900">Last-Mile Ops</div>
                            <div className="text-[11px] text-slate-600 mt-0.5">Articles, DSS &amp; fuel</div>
                          </div>
                        </Link>
                      )}

                      {showProperty && (
                        <Link
                          to="/properties"
                          className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 border border-sky-200 hover:border-sky-400 hover:-translate-y-0.5 transition flex flex-col justify-between space-y-3 group cursor-pointer shadow-xs"
                        >
                          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-sm">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900">Property Directory</div>
                            <div className="text-[11px] text-slate-600 mt-0.5">Colony &amp; sector registry</div>
                          </div>
                        </Link>
                      )}

                      {showOfficialDocs && (
                        <Link
                          to="/charge-report"
                          className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-red-100 border border-rose-200 hover:border-rose-400 hover:-translate-y-0.5 transition flex flex-col justify-between space-y-3 group cursor-pointer shadow-xs"
                        >
                          <div className="w-10 h-10 rounded-xl bg-red-700 text-white flex items-center justify-center font-bold shadow-sm">
                            <ArrowLeftRight size={20} />
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900">Form ACG-61 Charge</div>
                            <div className="text-[11px] text-slate-600 mt-0.5">Transfer of charge register</div>
                          </div>
                        </Link>
                      )}

                      {showOfficialDocs && (
                        <Link
                          to="/official-documents"
                          className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-sky-100 border border-cyan-200 hover:border-cyan-400 hover:-translate-y-0.5 transition flex flex-col justify-between space-y-3 group cursor-pointer shadow-xs"
                        >
                          <div className="w-10 h-10 rounded-xl bg-cyan-700 text-white flex items-center justify-center font-bold shadow-sm">
                            <FileCheck2 size={20} />
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900">Statutory Reports</div>
                            <div className="text-[11px] text-slate-600 mt-0.5">Official templates</div>
                          </div>
                        </Link>
                      )}

                      {isAdmin && !strictVendorId && (
                        <Link
                          to="/staff-master"
                          className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-100 border border-purple-200 hover:border-purple-400 hover:-translate-y-0.5 transition flex flex-col justify-between space-y-3 group cursor-pointer shadow-xs"
                        >
                          <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold shadow-sm">
                            <Users size={20} />
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-900">Admin Staff Master</div>
                            <div className="text-[11px] text-slate-600 mt-0.5">Beats &amp; staff roles</div>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Real-Time Activity Feed Card (Only shown for non-white-label / dailyOps-enabled views) */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Clock className="text-red-700" size={17} />
                        <span>Real-Time Activity Feed</span>
                      </h2>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                        Live Sync OK
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[280px] text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span className="text-emerald-700 font-black">ACG-61 Handover</span>
                          <span>Recent</span>
                        </div>
                        <p className="font-semibold text-slate-800">
                          {userProfile?.subOffice || 'Dadabari S.O.'} statutory charge report synchronized.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span className="text-blue-700 font-black">Daily Article Sync</span>
                          <span>Recent</span>
                        </div>
                        <p className="font-semibold text-slate-800">
                          Beat delivery register synchronized with DSS ledger.
                        </p>
                      </div>
                    </div>

                    {isAdmin && !strictVendorId && (
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>System Status: <strong>Online</strong></span>
                        <Link to="/audit-log" className="font-bold text-red-700 hover:underline">
                          View Audit Logs →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Priority Tasks & Follow-ups Bar (Strictly Cascaded by Visibility) */}
            {(showDailyOps || showLeads) && (
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                  {showDailyOps && (
                    <>
                      <Link
                        to="/tasks"
                        className="group bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/80 p-4 rounded-xl flex items-center justify-between transition duration-200 cursor-pointer shadow-xs"
                      >
                        <div>
                          <span className="text-[11px] text-amber-400 font-semibold">Immediate Action</span>
                          <span className="text-3xl font-black text-white font-mono tabular-nums mt-0.5 block">
                            {immediateActionsCount}
                          </span>
                          <span className="text-[11px] text-slate-400">Tasks + Follow-ups</span>
                        </div>
                        <Clock className="w-8 h-8 text-amber-400 opacity-80" />
                      </Link>

                      <Link
                        to="/tasks"
                        className="group bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-red-500/80 p-4 rounded-xl flex items-center justify-between transition duration-200 cursor-pointer shadow-xs"
                      >
                        <div>
                          <span className="text-[11px] text-red-400 font-semibold">Pending Field Tasks</span>
                          <span className="text-3xl font-black text-white font-mono tabular-nums mt-0.5 block">
                            {pendingTasks.length}
                          </span>
                          <span className="text-[11px] text-slate-400">Doorstep KYC &amp; Passbooks</span>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-red-400 opacity-80" />
                      </Link>
                    </>
                  )}

                  {showLeads && (
                    <>
                      <Link
                        to="/follow-ups"
                        className="group bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/80 p-4 rounded-xl flex items-center justify-between transition duration-200 cursor-pointer shadow-xs"
                      >
                        <div>
                          <span className="text-[11px] text-emerald-400 font-semibold">Today&apos;s Follow-ups</span>
                          <span className="text-3xl font-black text-white font-mono tabular-nums mt-0.5 block">
                            {pendingFollowUps.length}
                          </span>
                          <span className="text-[11px] text-slate-400">Scheduled Scheme Visits</span>
                        </div>
                        <Target className="w-8 h-8 text-emerald-400 opacity-80" />
                      </Link>

                      <Link
                        to="/leads"
                        className="group bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-blue-500/80 p-4 rounded-xl flex items-center justify-between transition duration-200 cursor-pointer shadow-xs"
                      >
                        <div>
                          <span className="text-[11px] text-blue-400 font-semibold">Active Scheme Leads</span>
                          <span className="text-3xl font-black text-white font-mono tabular-nums mt-0.5 block">
                            {activeLeads.length}
                          </span>
                          <span className="text-[11px] text-slate-400">PLI · SSA · IPPB · SCSS</span>
                        </div>
                        <Users className="w-8 h-8 text-blue-400 opacity-80" />
                      </Link>
                    </>
                  )}

                  {showProperty && (
                    <Link
                      to="/properties"
                      className="group bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/80 p-4 rounded-xl flex items-center justify-between transition duration-200 cursor-pointer shadow-xs"
                    >
                      <div>
                        <span className="text-[11px] text-indigo-400 font-semibold">Property Registry</span>
                        <span className="text-3xl font-black text-white font-mono tabular-nums mt-0.5 block">
                          {properties.length}
                        </span>
                        <span className="text-[11px] text-slate-400">Properties &amp; Households</span>
                      </div>
                      <Building2 className="w-8 h-8 text-indigo-400 opacity-80" />
                    </Link>
                  )}
                </div>

                {/* Side-by-Side Priority Tasks & Follow-ups */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {showDailyOps && (
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
                            <div onClick={() => setSelectedTaskForModal(task)} className="min-w-0 flex-1 cursor-pointer">
                              <div className="font-bold text-white truncate">{task.title}</div>
                              <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                                {task.category} · {task.location} · Due:{' '}
                                <span className="font-mono tabular-nums text-slate-300">{task.dueDate}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => customerService.updateTask(task.id, { status: 'Completed' })}
                              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <Check size={12} />
                              <span>Done</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {showLeads && (
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
                            <div onClick={() => setSelectedFollowUpForModal(fol)} className="min-w-0 flex-1 cursor-pointer">
                              <div className="font-bold text-white truncate flex items-center gap-1.5">
                                <span>{fol.customerName}</span>
                                <span className="font-mono text-amber-300 text-[11px] tabular-nums">{fol.customerMobile}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                {fol.productName} · {fol.nextAction}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => customerService.completeFollowUp(fol.id, 'Completed doorstep visit')}
                              className="px-2 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <Check size={12} />
                              <span>Done</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* =====================================================================
          OWNER DASHBOARD: MULTI-CLIENT KPI, RAJASTHAN DEFAULT SCOPE & STAFF SEPARATION
         ===================================================================== */}
      {isAdmin && !isWhiteLabel && strictVendorId !== 'INDIA_POST' && (() => {
        const allRegistryProps = propertyRegistryService.getAllProperties();
        const academyCourses = academyTrainingService.getAllCourses();
        const indiaPostCustomersCount = customerService.getCustomersByBrand('india-post').length;
        const postalStaffCount = staffPermissionService.getIndiaPostOperationalProfiles().length;
        const postalAdminCount = staffPermissionService.getXpoKartPlatformStaff().length;

        return (
          <section
            id="owner-dashboard-control-panel"
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-950 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  INDIA POST COMMAND ARCHITECTURE · KOTA DIVISION &amp; PAN-INDIA READY
                </div>
                <h2 className="text-lg font-black tracking-tight">
                  India Post Owner Dashboard — Operations &amp; Bulk Customer Hub
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-bold">
                  Scope: Kota Division · Pan-India Ready
                </span>
                <Link
                  to="/staff-master"
                  className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold transition"
                >
                  Master Staff ({postalStaffCount})
                </Link>
                <Link
                  to="/india-post-storefront"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold transition"
                >
                  Bulk Showcase Ops
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 border-b border-slate-200 text-xs">
              <div className="p-4">
                <div className="text-slate-500 font-semibold">Postal Citizens</div>
                <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
                  {indiaPostCustomersCount}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">India Post Master Registry</div>
              </div>
              <div className="p-4">
                <div className="text-slate-500 font-semibold">Traceable Properties</div>
                <div className="text-2xl font-black text-indigo-700 font-mono tabular-nums mt-1">
                  {allRegistryProps.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Property &amp; Geo Hub</div>
              </div>
              <div className="p-4">
                <div className="text-slate-500 font-semibold">Pending Follow-Ups</div>
                <div className="text-2xl font-black text-amber-700 font-mono tabular-nums mt-1">
                  {pendingFollowUps.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Across Postal Beats</div>
              </div>
              <div className="p-4">
                <div className="text-slate-500 font-semibold">Pending Approvals</div>
                <div className="text-2xl font-black text-rose-700 font-mono tabular-nums mt-1">
                  {pendingRegsCount}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Staff Onboarding Queue</div>
              </div>
              <div className="p-4">
                <div className="text-slate-500 font-semibold">Admin vs Field Staff</div>
                <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
                  {postalAdminCount} <span className="text-sm text-slate-400">/</span> {postalStaffCount}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Command vs Beat Force</div>
              </div>
              <div className="p-4">
                <div className="text-slate-500 font-semibold">Academy Modules</div>
                <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums mt-1">
                  {academyCourses.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Postal Certification Tracks</div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-slate-700">Unified India Post Sync:</span>
                <span className="px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-900 font-bold">
                  India Post Citizens: {indiaPostCustomersCount} Records
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
                  Auto-Sync: {CANONICAL_BACKUP_EMAIL}
                </span>
              </div>
              <Link
                to="/indiapost-portal"
                className="font-bold text-red-700 hover:underline flex items-center gap-1"
              >
                <span>Open Public Bulk Showcase</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </section>
        );
      })()}

      {/* =====================================================================
          ADMIN DASHBOARD: PARTNER & BRAND MANAGEMENT HUB
         ===================================================================== */}
      {isAdmin && !isWhiteLabel && strictVendorId !== 'INDIA_POST' && showVendorSection && (
        <PartnerBrandManagementHub compact={true} />
      )}

      {/* =====================================================================
          PRIORITY-BASED 5-CARD DASHBOARD ARCHITECTURE (Cascaded Hidden unless multi-module enabled)
         ===================================================================== */}
      {!isPropertyMembersOnlyMode && (() => {
        const uniqueColonies = new Set(
          customers
            .map((c) => (c.area || c.sectorLocality || c.address?.area || '').trim())
            .filter(Boolean)
        ).size;
        const verifiedCount = customers.filter(
          (c) => c.verificationStatus === 'Verified'
        ).length;
        const colleagues = staffPermissionService.getDirectoryStaff();
        const q = prioritySearchQuery.trim().toLowerCase();
        const matchingMembers = (
          q
            ? customers.filter(
                (c) =>
                  c.name.toLowerCase().includes(q) ||
                  (c.mobile || '').includes(q) ||
                  (c.area || c.sectorLocality || '').toLowerCase().includes(q)
              )
            : customers
        ).slice(0, 5);
        const matchingColleagues = (
          q
            ? colleagues.filter(
                (s) =>
                  s.name.toLowerCase().includes(q) ||
                  (s.contact || '').includes(q) ||
                  (s.beat || '').toLowerCase().includes(q) ||
                  (s.designationType || s.role || '').toLowerCase().includes(q)
              )
            : colleagues
        ).slice(0, 5);

        return (
          <section className="space-y-3" id="priority-architecture-grid">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-red-800">
                  Operational Priority Architecture · {isAdmin ? 'Division Beat Tree Overview' : `${activeBeat} Scoped Workspace`}
                </div>
                <h2 className="text-lg font-black text-slate-900">
                  5-Module Field Command &amp; Citizen Services
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Link
                  to="/official-applications"
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg font-bold flex items-center gap-1.5 transition"
                >
                  <FileText size={13} />
                  <span>Official Applications</span>
                </Link>
                <Link
                  to="/staff-directory"
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg font-bold flex items-center gap-1.5 transition"
                >
                  <Users size={13} />
                  <span>Colleague Contacts ({colleagues.length})</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              {/* Priority 1: Colony & Household Data */}
              <div className="bg-gradient-to-b from-indigo-50/70 to-white rounded-2xl border-2 border-indigo-200 p-4 shadow-sm hover:shadow-md hover:border-indigo-400 flex flex-col justify-between gap-3 transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-black uppercase">
                      Priority 1
                    </span>
                    <Building2 size={16} className="text-indigo-700" />
                  </div>
                  <h3 className="font-black text-sm text-indigo-950">Colony &amp; Household Data</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-indigo-100">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">Properties</div>
                      <div className="text-base font-black text-slate-900 font-mono tabular-nums">{customers.length}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">Colonies</div>
                      <div className="text-base font-black text-indigo-700 font-mono tabular-nums">{uniqueColonies}</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    <span className="font-bold text-emerald-700">{verifiedCount}</span> verified doorsteps in{' '}
                    <span className="font-semibold">{isAdmin ? 'Dadabari S.O.' : activeBeat}</span>.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-indigo-100">
                  <Link
                    to="/households"
                    className="flex-1 text-center px-2.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-[11px] font-bold transition"
                  >
                    Households
                  </Link>
                  <Link
                    to={isAdmin ? '/colony-master' : '/my-beat'}
                    className="flex-1 text-center px-2.5 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-900 rounded-lg text-[11px] font-bold transition"
                  >
                    {isAdmin ? 'Colonies' : 'My Beat'}
                  </Link>
                </div>
              </div>

              {/* Priority 2: Member Directory & Search (Citizens + Colleagues) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between gap-3 hover:border-sky-300 transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 text-[10px] font-black uppercase">
                      Priority 2
                    </span>
                    <Users size={16} className="text-sky-700" />
                  </div>
                  <h3 className="font-black text-sm text-slate-900">Member &amp; Staff Directory</h3>
                  <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPrioritySearchTab('MEMBERS')}
                      className={`flex-1 py-1 rounded-md transition cursor-pointer ${
                        prioritySearchTab === 'MEMBERS'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Members ({customers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrioritySearchTab('COLLEAGUES')}
                      className={`flex-1 py-1 rounded-md transition cursor-pointer ${
                        prioritySearchTab === 'COLLEAGUES'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Staff ({colleagues.length})
                    </button>
                  </div>
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-2 text-slate-400" />
                    <input
                      type="text"
                      value={prioritySearchQuery}
                      onChange={(e) => setPrioritySearchQuery(e.target.value)}
                      placeholder="Name or mobile..."
                      className="w-full pl-7 pr-2 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-0.5">
                    {prioritySearchTab === 'MEMBERS' ? (
                      matchingMembers.length > 0 ? (
                        matchingMembers.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSelectedCustomer(m)}
                            className="w-full text-left px-2 py-1 rounded bg-slate-50 hover:bg-sky-50 text-[11px] flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <span className="font-bold text-slate-800 truncate">{m.name}</span>
                            <span className="font-mono text-[10px] text-sky-700 shrink-0">
                              {m.mobile || 'No Mob'}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-400 text-center py-2">No matching member</div>
                      )
                    ) : matchingColleagues.length > 0 ? (
                      matchingColleagues.map((s) => (
                        <div
                          key={s.id || s.employeeId}
                          className="px-2 py-1 rounded bg-slate-50 text-[11px] flex items-center justify-between gap-2"
                        >
                          <span className="font-bold text-slate-800 truncate">{s.name}</span>
                          <span className="font-mono text-[10px] text-emerald-700 shrink-0">
                            {s.contact}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-slate-400 text-center py-2">No matching colleague</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                  <Link
                    to="/customers"
                    className="flex-1 text-center px-2.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-[11px] font-bold transition"
                  >
                    Member Dir
                  </Link>
                  <Link
                    to="/staff-directory"
                    className="flex-1 text-center px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold transition"
                  >
                    Staff Contacts
                  </Link>
                </div>
              </div>

              {/* Priority 3: Daily Tasks & Delivery Work */}
              <div className="bg-gradient-to-b from-amber-50/75 to-white rounded-2xl border-2 border-amber-200 p-4 shadow-sm hover:shadow-md hover:border-amber-400 flex flex-col justify-between gap-3 transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[10px] font-black uppercase">
                      Priority 3
                    </span>
                    <Clock size={16} className="text-amber-700" />
                  </div>
                  <h3 className="font-black text-sm text-amber-950">Daily Tasks &amp; Delivery</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-amber-100">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">Open Tasks</div>
                      <div className="text-base font-black text-amber-700 font-mono tabular-nums">{pendingTasks.length}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">Delivered</div>
                      <div className="text-base font-black text-emerald-700 font-mono tabular-nums">{totalDelivAll}</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Daily Verify: <span className="font-bold text-slate-900">{dailyVerifProgress.completedToday}/10</span> · Fuel Est:{' '}
                    <span className="font-bold text-emerald-700">₹{eligibleFuelAllowance.toLocaleString('en-IN')}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-amber-100">
                  <Link
                    to="/tasks"
                    className="flex-1 text-center px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition"
                  >
                    Tasks
                  </Link>
                  {canAccessSpecialBills && (
                    <Link
                      to="/postman-articles"
                      className="flex-1 text-center px-2.5 py-1.5 bg-white border border-amber-200 hover:bg-amber-50 text-amber-900 rounded-lg text-[11px] font-bold transition"
                    >
                      Articles &amp; Fuel
                    </Link>
                  )}
                </div>
              </div>

              {/* Priority 4: Leads & Follow-ups */}
              <div className="bg-gradient-to-b from-emerald-50/75 to-white rounded-2xl border-2 border-emerald-200 p-4 shadow-sm hover:shadow-md hover:border-emerald-400 flex flex-col justify-between gap-3 transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-black uppercase">
                      Priority 4
                    </span>
                    <Target size={16} className="text-emerald-700" />
                  </div>
                  <h3 className="font-black text-sm text-emerald-950">Leads &amp; Follow-ups</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-emerald-100">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">Active Leads</div>
                      <div className="text-base font-black text-emerald-700 font-mono tabular-nums">{activeLeads.length}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">Follow-ups</div>
                      <div className="text-base font-black text-rose-700 font-mono tabular-nums">{pendingFollowUps.length}</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    PLI, RPLI, SSA, PPF &amp; IPPB Merchant QR doorstep pipeline.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-emerald-100">
                  <Link
                    to="/leads"
                    className="flex-1 text-center px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold transition"
                  >
                    Pipeline
                  </Link>
                  <Link
                    to="/follow-ups"
                    className="flex-1 text-center px-2.5 py-1.5 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-900 rounded-lg text-[11px] font-bold transition"
                  >
                    Follow-ups
                  </Link>
                </div>
              </div>

              {/* Priority 5: Products & Catalog */}
              <div className="bg-gradient-to-b from-rose-50/75 to-white rounded-2xl border-2 border-rose-200 p-4 shadow-sm hover:shadow-md hover:border-rose-400 flex flex-col justify-between gap-3 transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-rose-700 text-white text-[10px] font-black uppercase">
                      Priority 5
                    </span>
                    <Briefcase size={16} className="text-rose-700" />
                  </div>
                  <h3 className="font-black text-sm text-rose-950">Products &amp; Catalog</h3>
                  <div className="space-y-1 text-[11px]">
                    <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
                      Sovereign: SSA 8.2% · SCSS 8.2% · PLI
                    </div>
                    <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
                      Commercial: MyStamp · Gangajal · QR
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Bilingual WhatsApp pitches, Speed Post COD &amp; lead capture.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-rose-100">
                  <Link
                    to="/services"
                    className="flex-1 text-center px-2.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-[11px] font-bold transition"
                  >
                    Open Catalog
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowQuickLeadForm(true)}
                    className="flex-1 text-center px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                  >
                    + Capture
                  </button>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* =====================================================================
          HOMEPAGE ALL SERVICES HUB (Strictly Gated on leadsAndSchemes)
         ===================================================================== */}
      {showLeads && (
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

        {/* Categorized Services Grid — Color-Coded High-Contrast Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleHubServices.map((srv) => {
            const cardAccent =
              srv.category === 'IPPB'
                ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white hover:border-emerald-400'
                : srv.category === 'SMALL_SAVINGS'
                ? 'border-teal-200 bg-gradient-to-br from-teal-50/70 to-white hover:border-teal-400'
                : srv.category === 'INSURANCE'
                ? 'border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-white hover:border-indigo-400'
                : srv.category === 'AADHAAR_CELC'
                ? 'border-sky-200 bg-gradient-to-br from-sky-50/70 to-white hover:border-sky-400'
                : 'border-rose-200 bg-gradient-to-br from-rose-50/70 to-white hover:border-rose-400';

            const waPitchHref = `https://api.whatsapp.com/send?phone=918769706002&text=${encodeURIComponent(
              `नमस्ते! इंडिया पोस्ट दादाबाड़ी S.O. (PIN 324009) सेवा जानकारी:\n\n✨ ${srv.title} (${srv.rateOrHighlight})\n${srv.summary}\n\nडोरस्टेप KYC व बुकिंग हेतु Beat 2 (8769706002) या S.O. Desk (9460020640) से संपर्क करें।`
            )}`;

            return (
              <div
                key={srv.id}
                className={`p-4 rounded-2xl border-2 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition flex flex-col justify-between gap-3 ${cardAccent}`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-black text-slate-800">{srv.categoryLabel}</span>
                    <span>·</span>
                    <span className="font-mono font-bold text-emerald-800">
                      {srv.rateOrHighlight}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900">{srv.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{srv.summary}</p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setLeadScheme(srv.title);
                        setLeadRequirement(srv.requirementPreset);
                        setLeadEstValue(srv.defaultValue);
                        setShowQuickLeadForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer whitespace-nowrap"
                    >
                      <Plus size={13} />
                      <span>Quick Lead</span>
                    </button>
                    <a
                      href={waPitchHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition whitespace-nowrap"
                      title="Share Hindi/English Service Pitch via Beat 2 WhatsApp"
                    >
                      <MessageCircle size={12} />
                      <span>Pitch</span>
                    </a>
                  </div>
                  <Link
                    to="/leads"
                    state={{ preselectedProduct: srv.title }}
                    className="text-xs font-bold text-slate-700 hover:text-red-800 flex items-center gap-1 shrink-0"
                  >
                    <span>Pipeline</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* =====================================================================
          CORE DASHBOARD WIDGETS (Strictly Gated on dailyOperations / vendorSection)
         ===================================================================== */}
      {(showDailyOps || showVendorSection || showOfficialDocs) && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Daily Article Entry Quick Widget */}
        {showDailyOps && (
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
        )}

        {/* Right 5 Cols: Real-Time Reports & Operations Summary */}
        <div className="lg:col-span-5 space-y-6">
          {showDailyOps && (
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

              {canAccessSpecialBills && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Includes Fuel, ACG-61 Charge Report, Outsider &amp; BYOD Bills
                  </span>
                  <Link
                    to="/special-forms"
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg whitespace-nowrap"
                  >
                    Open Special Forms →
                  </Link>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Margin-Ranked B2B Vendor Partners & Statutory Shortcuts (Isolated from White-Label & Scoped Postal Views) */}
          <div className="space-y-2.5">
            {showVendorSection && !isWhiteLabel && (
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-950">
                    Top Margin-Priority B2B Vendors
                  </span>
                  <Link to="/vendor-ecosystem" className="text-[11px] font-bold text-indigo-700 hover:underline">
                    Full Vendor Roster →
                  </Link>
                </div>
                <div className="space-y-1.5">
                  {topMarginVendors.map((v) => {
                    const summary = staffProductService.getVendorCommissionSummary(v);
                    const pins =
                      v.serviceablePincodes && v.serviceablePincodes.length > 0
                        ? v.serviceablePincodes.join(', ')
                        : v.pincode || '324009';
                    return (
                      <Link
                        key={v.id}
                        to={`/vendor-ecosystem/${encodeURIComponent(v.id)}`}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-indigo-100 hover:border-indigo-300 text-xs transition"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                            <span>{v.storeName}</span>
                            {v.storeType === 'BRAND_FRANCHISE' && (
                              <span className="text-[10px] font-black text-red-700">· Brand</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate font-mono">
                            PINs: {pins} · {v.beatNo} · {summary.productCount} SKU{summary.productCount === 1 ? '' : 's'}
                          </div>
                        </div>
                        <span className="font-mono font-black text-emerald-700 text-[11px] tabular-nums shrink-0">
                          +{summary.topMarginPercent}% (₹{summary.topMarginAmount})
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

              {isAdmin && !strictVendorId && (
                <Link
                  to="/master-source"
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-red-300 bg-slate-50/70 flex items-center justify-between transition"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Google Sheets &amp; Gmail Auto-Backup Engine
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Master Admin: Ektamahenmeena@gmail.com · {specialBills.length} Bills &amp; {customers.length} Customers
                    </div>
                  </div>
                  <ArrowRight size={15} className="text-red-800 shrink-0" />
                </Link>
              )}

              {showOfficialDocs && canAccessSpecialBills && (
                <Link
                  to="/charge-report"
                  className="p-3.5 rounded-xl border border-red-200 hover:border-red-400 bg-red-50/60 flex items-center justify-between transition"
                >
                  <div>
                    <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                      <span>ACG-61 Charge Report &amp; Image Scanner</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-700 text-white font-black">NEW</span>
                    </div>
                    <div className="text-[11px] text-red-700">
                      Upload &amp; analyze ACG-61 certificates · Relieved/Relieving officers, AM/PM &amp; instant PDF download
                    </div>
                  </div>
                  <ArrowRight size={15} className="text-red-800 shrink-0" />
                </Link>
              )}

              {/* Beat Partner ₹15/Delivery & ₹100/Referral Affiliate Tracker — Hidden in White-Label & Restricted Mode */}
              {!isWhiteLabel && (showStorefront || showVendorSection) && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white space-y-3 border border-emerald-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet size={16} className="text-amber-400" />
                    <span className="text-xs font-black text-amber-300">
                      {activeBeat} Speed Post COD &amp; ₹15/Del Tracker
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-mono font-bold">
                    {beatScopedDispatches.length} Parcels
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs border-y border-white/10 py-2.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Delivered COD</span>
                    <span className="font-mono font-black text-white">{beatDeliveredDispatches.length} Orders</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Beat Fee (₹15/Del)</span>
                    <span className="font-mono font-black text-emerald-400">₹{beatDeliveryFeeEarned}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">COD Volume</span>
                    <span className="font-mono font-black text-amber-300">₹{beatParcelCodTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {beatScopedDispatches.slice(0, 3).map((d) => (
                    <div key={d.id} className="p-2 rounded-lg bg-white/5 border border-white/10 text-[11px] flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">{d.productTitle}</div>
                        <div className="text-[10px] text-slate-400 truncate font-mono">
                          {d.speedPostBarcode || d.id} · {d.customerName} ({d.beatNo})
                        </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-300 shrink-0">₹{d.codAmount}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-amber-200 min-w-0">
                    <Gift size={13} className="shrink-0 text-amber-400" />
                    <span className="truncate font-mono">₹100/Ref Link: ?ref={staffReferralCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://indiapost-portal.in'}/?ref=${staffReferralCode}`;
                      try {
                        await navigator.clipboard.writeText(url);
                      } catch {
                        // ignore
                      }
                      setAffiliateCopied(true);
                      setTimeout(() => setAffiliateCopied(false), 2000);
                    }}
                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {affiliateCopied ? <Check size={11} /> : <Copy size={11} />}
                    <span>{affiliateCopied ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
              )}
            </div>
          </div>
      </div>
      )}

      {/* =====================================================================
          DEVELOPER, OWNER & MASTER ADMIN: API HEALTH & DB SYNC AUDIT CONSOLE
         ===================================================================== */}
      {isDeveloperOrOwner && (
        <section
          className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-6 space-y-5 shadow-lg"
          id="developer-system-health-console"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Server size={13} />
                <span>Developer &amp; Master Admin Telemetry · India Post Core Runtime</span>
              </div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Live API Health &amp; RBAC Database Sync Console</span>
              </h2>
            </div>

            <button
              type="button"
              onClick={fetchSystemTelemetry}
              disabled={isLoadingSystem}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw size={13} className={isLoadingSystem ? 'animate-spin' : ''} />
              <span>{isLoadingSystem ? 'Syncing Telemetry...' : 'Refresh Health & Sync Logs'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Runtime Status</span>
                <Activity size={14} className="text-emerald-400" />
              </div>
              <div className="text-lg font-black text-emerald-400 mt-1 font-mono">
                {systemHealth?.status || 'OPERATIONAL'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {systemHealth?.nodeVersion || 'Node.js Runtime'} · {systemHealth?.uptimeSeconds ?? 0}s up
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400 flex items-center justify-between">
                <span>Memory (RSS / Heap)</span>
                <Database size={14} className="text-sky-400" />
              </div>
              <div className="text-lg font-black text-white mt-1 font-mono">
                {systemHealth ? `${systemHealth.memoryRssMb} MB` : '—'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Heap: {systemHealth?.heapUsedMb ?? 0} MB
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400">Active RBAC Sessions</div>
              <div className="text-lg font-black text-amber-400 mt-1 font-mono">
                {systemHealth?.activeSessions ?? 1}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Staff Roster: {systemHealth?.totalStaffDirectory ?? 34} Beats
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-slate-400">Microservices</div>
              <div className="mt-1 space-y-1">
                {(systemHealth?.services || []).slice(0, 3).map((svc) => (
                  <div key={svc.name} className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-300 truncate">{svc.name}</span>
                    <span className="text-emerald-400 shrink-0">{svc.latencyMs}ms</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto bg-slate-900 rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/90">
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Event Type</th>
                  <th className="py-2.5 px-3 font-semibold">Actor / ID</th>
                  <th className="py-2.5 px-3 font-semibold">Details</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {syncLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 px-3 text-center text-slate-400">
                      Click &quot;Refresh Health &amp; Sync Logs&quot; or perform a login/sync action to inspect live server RBAC &amp; DB events.
                    </td>
                  </tr>
                ) : (
                  syncLogs.slice(0, 8).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] font-bold text-amber-300 whitespace-nowrap">
                        {log.eventType}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                        {log.userId}
                      </td>
                      <td className="py-2 px-3 text-slate-200 max-w-md truncate">{log.details}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                        {log.statusCode}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Bottom Master Customer Snapshot & Active Scheme Leads (Strictly Cascaded) */}
      {(showMembers || showLeads) && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {showMembers && (
        <div className={`${showLeads ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white p-6 rounded-2xl border border-slate-200 space-y-4`}>
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
            {customers.slice(0, 5).map((c) => (
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
        )}

        {showLeads && (
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
        )}
      </div>
      )}

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

      <DashboardQuickActionsFab onActionCompleted={refreshData} />
    </div>
  );
}
