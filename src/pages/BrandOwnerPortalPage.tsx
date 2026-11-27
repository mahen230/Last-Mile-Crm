import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FolderKanban,
  Home,
  Layers,
  Lock,
  LogOut,
  MapPin,
  Menu,
  Package,
  Phone,
  Plus,
  Route,
  Search,
  Share2,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Ticket,
  TrendingUp,
  Unlock,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../components/auth/FirebaseAuthProvider';
import { brandOwnerService } from '../services/brandOwnerService';
import { customerService } from '../services/customerService';
import { featureVisibilityService } from '../services/featureVisibilityService';
import { kotaOsHierarchyService } from '../services/kotaOsHierarchyService';
import { notificationService } from '../services/notificationService';
import { partnerBrandService } from '../services/partnerBrandService';
import { getConsolidatedProductsForBrand } from '../services/brandDirectoryService';
import { staffProductService } from '../services/staffProductService';
import { cartRecoveryService } from '../services/cartRecoveryService';
import { staffPermissionService } from '../services/staffPermissionService';
import { canAccessStandaloneStorefront } from '../utils/envMode';
import { exportCsvWithBom, xpeedoOpsService } from '../services/xpeedoOpsService';
import { POSTAL_PRODUCTS } from '../data/productsData';
import { CONSOLIDATED_BEAT_MATRIX } from '../data/consolidatedBeatMatrix';
import { buildBrandPortalNav } from '../data/navigationHierarchy';
import {
  ALL_BRAND_PORTAL_SUBMENUS,
  ALL_BRAND_STAFF_SECTIONS,
  BRAND_STAFF_ROLE_PRESETS,
  BrandMemberPermissions,
  BrandOwnerSession,
  BrandPortalSubMenuKey,
  BrandStaffSectionKey,
  BrandTeamMemberRbacView,
  IndiaPostConsolidatedSectionKey,
  SanitizedBrandOwnerProfile,
} from '../types/brandOwner';
import {
  ALL_OPS_TASK_STATUSES,
  OpsTaskStatus,
  SrmTicketCategory,
  SrmTicketPriority,
  SrmTicketStatus,
} from '../types/xpeedoOps';
import { IndiaPostDutyCategory, OrgHierarchyLevel } from '../types/models';
import ThreeLevelSidebar from '../components/navigation/ThreeLevelSidebar';
import BrandStaffManagementPanel from '../components/xpeedo/BrandStaffManagementPanel';

const OfficeMasterView = lazy(() => import('../components/crm/OfficeMasterView'));
const BeatManagementView = lazy(() => import('../components/crm/BeatManagementView'));
const UnifiedPropertyFamilyHub = lazy(() => import('../components/crm/UnifiedPropertyFamilyHub'));
const LocationIntelligenceHub = lazy(() => import('../components/crm/LocationIntelligenceHub'));
const DataQualityView = lazy(() => import('../components/crm/DataQualityView'));
const AddressResolutionView = lazy(() => import('../components/crm/AddressResolutionView'));
const LeadsPipelineView = lazy(() => import('../components/crm/LeadsPipelineView'));
const OfficialStaffDocumentsHub = lazy(() => import('../components/crm/OfficialStaffDocumentsHub'));
const Acg61ChargeReportView = lazy(() => import('../components/crm/Acg61ChargeReportView'));
const PostalLMSView = lazy(() => import('../components/crm/PostalLMSView'));
const IndiaPostStorefrontView = lazy(() => import('../components/crm/IndiaPostStorefrontView'));
const DailyVerificationView = lazy(() => import('../components/postman/DailyVerificationView'));
const DoorstepSurveyWorkflowView = lazy(() => import('../components/postman/DoorstepSurveyWorkflowView'));
const PostmanAllDayArticlesOverview = lazy(() => import('../components/postman/PostmanAllDayArticlesOverview'));
const IndiaPostMasterSearchAndInspectionView = lazy(
  () => import('../components/xpeedo/IndiaPostMasterSearchAndInspectionView')
);
const TerritoryMasterRoleView = lazy(() => import('../components/xpeedo/TerritoryMasterRoleView'));
const TerritoryPromotionMasterView = lazy(
  () => import('../components/xpeedo/TerritoryPromotionMasterView')
);

type BrandActiveSectionKey = BrandPortalSubMenuKey | IndiaPostConsolidatedSectionKey;

// Strictly Divisional & Statutory Governance (zero duplication with CRM & Operations or Territory & Team)
const INDIA_POST_CONSOLIDATED_MENUS: Array<{
  key: IndiaPostConsolidatedSectionKey;
  label: string;
}> = [
  { key: 'IP_HIERARCHY', label: 'Divisional Hierarchy' },
  { key: 'IP_GEO_QUALITY', label: 'Geo Mapping & Data Quality' },
  { key: 'IP_STATUTORY_DOCS', label: 'Statutory Docs & ACG-61' },
  { key: 'IP_DAILY_OPS', label: 'Daily Ops & Surveys' },
  { key: 'IP_SRM', label: 'SRM & Escalations' },
  { key: 'IP_LMS_STOREFRONT', label: 'Postal LMS & Storefront' },
  { key: 'IP_NOTIFICATIONS', label: 'Divisional Notifications' },
];

const INDIA_POST_KEY_SET = new Set<string>(INDIA_POST_CONSOLIDATED_MENUS.map((m) => m.key));
const CORE_KEY_SET = new Set<string>(ALL_BRAND_PORTAL_SUBMENUS.map((m) => m.key));
CORE_KEY_SET.add('XPO_PRODUCTS');
CORE_KEY_SET.add('XPO_CUSTOMER_PORTAL');
CORE_KEY_SET.add('XPO_STOREFRONT');

function resolveLegacyBrandTab(
  rawTab: string,
  rawSub?: string | null
): { tab: BrandActiveSectionKey; sub?: string } | null {
  const t = (rawTab || '').trim().toUpperCase();
  const s = (rawSub || '').trim().toUpperCase();
  if (!t) return null;

  if (t === 'IP_MASTER_SEARCH') return { tab: 'MASTER_SEARCH' };
  if (t === 'IP_OFFICES') return { tab: 'OFFICES_STORES', sub: 'OFFICES' };
  if (t === 'IP_BEATS') return { tab: 'OFFICES_STORES', sub: 'BEATS' };
  if (t === 'IP_STAFF_ROLES') return { tab: 'PROMOTION_MASTER' };
  if (t === 'IP_CRM_SCHEMES') return { tab: 'LEADS' };
  if (t === 'IP_PROPERTIES') {
    if (s === 'LOCATION_INTEL' || s === 'DATA_QUALITY' || s === 'ADDRESS') {
      return { tab: 'IP_GEO_QUALITY', sub: s };
    }
    return { tab: 'PROPERTIES' };
  }

  if (CORE_KEY_SET.has(t) || INDIA_POST_KEY_SET.has(t)) {
    return { tab: t as BrandActiveSectionKey, sub: s || undefined };
  }
  return null;
}

const DUTY_CATEGORIES: IndiaPostDutyCategory[] = [
  'Delivery',
  'Counter & Booking',
  'Banking & IPPB',
  'Field Survey & Leads',
  'Supervisory & Division',
];

function EmbeddedLoading() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
      Loading module...
    </div>
  );
}

export default function BrandOwnerPortalPage() {
  const { brandSlug = '' } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userProfile } = useAuth();

  const [tick, setTick] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [retailServicesActive, setRetailServicesActive] = useState<boolean>(() =>
    featureVisibilityService.isRetailServicesActive()
  );

  const initialResolved = resolveLegacyBrandTab(
    searchParams.get('tab') || '',
    searchParams.get('sub')
  );
  const initialTab: BrandActiveSectionKey = initialResolved?.tab || 'OVERVIEW';

  const [activeSubMenu, setActiveSubMenuState] = useState<BrandActiveSectionKey>(initialTab);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Embedded Sub-Switchers
  const [officeMasterMode, setOfficeMasterMode] = useState<'OFFICES' | 'BEATS'>(
    initialResolved?.sub === 'BEATS' ? 'BEATS' : 'OFFICES'
  );
  const [ipGeoMode, setIpGeoMode] = useState<'LOCATION_INTEL' | 'DATA_QUALITY' | 'ADDRESS'>(
    initialResolved?.sub === 'DATA_QUALITY' || initialResolved?.sub === 'ADDRESS'
      ? initialResolved.sub
      : 'LOCATION_INTEL'
  );
  const [ipDocsMode, setIpDocsMode] = useState<'DOCS_HUB' | 'ACG61' | 'ARTICLES'>('DOCS_HUB');
  const [ipDailyMode, setIpDailyMode] = useState<'VERIFICATION' | 'SURVEY'>('VERIFICATION');
  const [ipLmsMode, setIpLmsMode] = useState<'LMS' | 'STOREFRONT'>('LMS');

  // Master Staff Multi-Criteria Filters
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('ALL');
  const [staffOfficeFilter, setStaffOfficeFilter] = useState<string>('ALL');
  const [staffPinFilter, setStaffPinFilter] = useState<string>('ALL');
  const [staffBeatFilter, setStaffBeatFilter] = useState<string>('ALL');
  const [staffStatusFilter, setStaffStatusFilter] = useState<'ALL' | 'Active' | 'Inactive' | 'Pending'>('ALL');
  const [staffWorkloadFilter, setStaffWorkloadFilter] = useState<'ALL' | 'ACTIVE_LOAD' | 'AVAILABLE'>('ALL');
  const [promoSelectedStaffId, setPromoSelectedStaffId] = useState<string>('');

  // Departments & Approvals Quick Create
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptHead, setNewDeptHead] = useState('');

  // Divisional Notification Quick Broadcast
  const [divNotifTitle, setDivNotifTitle] = useState('');
  const [divNotifMessage, setDivNotifMessage] = useState('');
  const [divNotifBeat, setDivNotifBeat] = useState('ALL');

  // XPOKART E-Commerce Catalog, Order & Storefront Config State
  const [xpoSearch, setXpoSearch] = useState('');
  const [xpoCategoryFilter, setXpoCategoryFilter] = useState('ALL');
  const [showAddXpoProduct, setShowAddXpoProduct] = useState(false);
  const [xpoNewSku, setXpoNewSku] = useState('');
  const [xpoNewTitle, setXpoNewTitle] = useState('');
  const [xpoNewCategory, setXpoNewCategory] = useState('Electronics & Smart Tech');
  const [xpoNewPrice, setXpoNewPrice] = useState('499');
  const [xpoNewMrp, setXpoNewMrp] = useState('699');
  const [xpoNewDesc, setXpoNewDesc] = useState('');

  const [xpoOrderBuyerName, setXpoOrderBuyerName] = useState('');
  const [xpoOrderMobile, setXpoOrderMobile] = useState('');
  const [xpoOrderPincode, setXpoOrderPincode] = useState('324009');
  const [xpoOrderItemTitle, setXpoOrderItemTitle] = useState('');
  const [xpoOrderQty, setXpoOrderQty] = useState('1');

  const [xpoCfgTagline, setXpoCfgTagline] = useState('');
  const [xpoCfgCategory, setXpoCfgCategory] = useState('');
  const [xpoCfgAccent, setXpoCfgAccent] = useState('#1D4ED8');
  const [xpoCfgStoreScope, setXpoCfgStoreScope] = useState('');

  const applySubModeForTab = (tab: BrandActiveSectionKey, sub?: string | null) => {
    const cleanSub = (sub || '').toUpperCase();
    if (!cleanSub) return;
    if (tab === 'OFFICES_STORES' && (cleanSub === 'OFFICES' || cleanSub === 'BEATS')) {
      setOfficeMasterMode(cleanSub);
    } else if (
      tab === 'IP_GEO_QUALITY' &&
      (cleanSub === 'LOCATION_INTEL' || cleanSub === 'DATA_QUALITY' || cleanSub === 'ADDRESS')
    ) {
      setIpGeoMode(cleanSub);
    } else if (
      tab === 'IP_STATUTORY_DOCS' &&
      (cleanSub === 'DOCS_HUB' || cleanSub === 'ACG61' || cleanSub === 'ARTICLES')
    ) {
      setIpDocsMode(cleanSub);
    } else if (
      tab === 'IP_DAILY_OPS' &&
      (cleanSub === 'VERIFICATION' || cleanSub === 'SURVEY')
    ) {
      setIpDailyMode(cleanSub);
    } else if (tab === 'IP_LMS_STOREFRONT') {
      if (cleanSub === 'STOREFRONT' && canAccessStandaloneStorefront(staffPermissionService.getActiveSession())) {
        setIpLmsMode('STOREFRONT');
      } else {
        setIpLmsMode('LMS');
      }
    }
  };

  const setActiveSectionAndSub = (next: BrandActiveSectionKey, subMode?: string) => {
    setActiveSubMenuState(next);
    if (subMode) {
      applySubModeForTab(next, subMode);
    }
    const params = new URLSearchParams(searchParams);
    params.set('tab', next);
    if (subMode) {
      params.set('sub', subMode);
    } else {
      params.delete('sub');
    }
    setSearchParams(params, { replace: true });
  };

  const setActiveSubMenu = (next: BrandActiveSectionKey) => {
    setActiveSectionAndSub(next);
  };

  useEffect(() => {
    const rawT = searchParams.get('tab') || '';
    const rawS = searchParams.get('sub');
    const resolved = resolveLegacyBrandTab(rawT, rawS);
    if (!resolved) return;

    if (resolved.tab !== activeSubMenu) {
      setActiveSubMenuState(resolved.tab);
    }
    if (resolved.sub) {
      applySubModeForTab(resolved.tab, resolved.sub);
    }
    if (rawT.toUpperCase() !== resolved.tab) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('tab', resolved.tab);
      if (resolved.sub) nextParams.set('sub', resolved.sub);
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, activeSubMenu, retailServicesActive]);

  useEffect(() => {
    if (!canAccessStandaloneStorefront(staffPermissionService.getActiveSession()) && ipLmsMode === 'STOREFRONT') {
      setIpLmsMode('LMS');
    }
  }, [retailServicesActive, ipLmsMode]);

  // PIN Unlock Modal / Inline Gate state
  const [showPinGate, setShowPinGate] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [copiedStaffLink, setCopiedStaffLink] = useState(false);
  const [copiedInviteMsg, setCopiedInviteMsg] = useState(false);

  // Search & Add Form states inside Brand Sub-Menus
  const [customerSearch, setCustomerSearch] = useState('');
  const [officeSearch, setOfficeSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');

  // Quick Add Office / Store Form
  const [showAddOffice, setShowAddOffice] = useState(false);
  const [newOfficeName, setNewOfficeName] = useState('');
  const [newOfficePincode, setNewOfficePincode] = useState('324009');
  const [newOfficeType, setNewOfficeType] = useState('Hyperlocal Store');
  const [newOfficeAddress, setNewOfficeAddress] = useState('');

  // Brand Owner Team RBAC Modal ("Kisko Kaisa Role Dena Hai")
  const [rbacModalMode, setRbacModalMode] = useState<'CREATE' | 'EDIT' | null>(null);
  const [editingMember, setEditingMember] = useState<BrandTeamMemberRbacView | null>(null);
  const [rbacName, setRbacName] = useState('');
  const [rbacContact, setRbacContact] = useState('');
  const [rbacEmail, setRbacEmail] = useState('');
  const [rbacPassword, setRbacPassword] = useState('');
  const [rbacPresetKey, setRbacPresetKey] = useState('FIELD_DELIVERY');
  const [rbacRole, setRbacRole] = useState('POSTMAN');
  const [rbacDesignation, setRbacDesignation] = useState('Postman / Field Delivery');
  const [rbacPostCategory, setRbacPostCategory] = useState<IndiaPostDutyCategory>('Delivery');
  const [rbacOffice, setRbacOffice] = useState('');
  const [rbacBeat, setRbacBeat] = useState('Beat 1');
  const [rbacStatus, setRbacStatus] = useState<'Active' | 'Inactive'>('Active');
  const [rbacPermissions, setRbacPermissions] = useState<BrandMemberPermissions>(
    BRAND_STAFF_ROLE_PRESETS[3].permissions
  );

  // Quick Add Customer Form
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustColony, setNewCustColony] = useState('');
  const [newCustPincode, setNewCustPincode] = useState('324009');
  const [newCustBeat, setNewCustBeat] = useState('Beat 1');

  // Quick Add Task Form
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');

  // India Post Hierarchy & SRM Creation State
  const [ipNodeLevel, setIpNodeLevel] = useState<OrgHierarchyLevel>('SO');
  const [ipNodeCode, setIpNodeCode] = useState('');
  const [ipNodeName, setIpNodeName] = useState('');
  const [ipNodePin, setIpNodePin] = useState('');

  const [ipSrmOfficeId, setIpSrmOfficeId] = useState('DADABARI_SO');
  const [ipSrmBeat, setIpSrmBeat] = useState('Beat 2');
  const [ipSrmCustName, setIpSrmCustName] = useState('');
  const [ipSrmCustMobile, setIpSrmCustMobile] = useState('');
  const [ipSrmCat, setIpSrmCat] = useState<SrmTicketCategory>('Delivery Delay');
  const [ipSrmPrio, setIpSrmPrio] = useState<SrmTicketPriority>('High');
  const [ipSrmSubject, setIpSrmSubject] = useState('');
  const [ipSrmDesc, setIpSrmDesc] = useState('');

  useEffect(() => {
    const u1 = brandOwnerService.subscribe(() => setTick((t) => t + 1));
    const u2 = customerService.subscribe(() => setTick((t) => t + 1));
    const u3 = staffPermissionService.subscribe(() => setTick((t) => t + 1));
    const u4 = xpeedoOpsService.subscribe(() => setTick((t) => t + 1));
    const u5 = kotaOsHierarchyService.subscribe(() => setTick((t) => t + 1));
    const u6 = featureVisibilityService.subscribe(() => {
      setRetailServicesActive(featureVisibilityService.isRetailServicesActive());
    });
    const u7 = notificationService.subscribe(() => setTick((t) => t + 1));
    const u8 = cartRecoveryService.subscribe(() => setTick((t) => t + 1));
    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
      u6();
      u7();
      u8();
    };
  }, []);

  const isMasterAdmin =
    staffPermissionService.isSuperAdmin(userProfile) ||
    ['OWNER', 'MASTER_ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(
      String(userProfile?.role || '').toUpperCase()
    );

  const sessionState = brandOwnerService.getActiveBrandOwnerSessionState();
  const brandSession: BrandOwnerSession | null = sessionState.session;
  const allBrands = brandOwnerService.getAllBrandProfiles();

  const activeProfile: SanitizedBrandOwnerProfile | null = useMemo(() => {
    if (brandSession) {
      return brandOwnerService.getBrandProfileById(brandSession.brandProfileId);
    }
    if (isMasterAdmin) {
      if (brandSlug) {
        return brandOwnerService.getBrandProfileBySlugOrKey(brandSlug);
      }
      return allBrands[0] || null;
    }
    return null;
  }, [brandSession, isMasterAdmin, brandSlug, allBrands]);

  const isIndiaPostWorkspace = activeProfile?.workspaceKey === 'INDIA_POST';
  const isXpokartWorkspace = Boolean(
    activeProfile &&
      (activeProfile.workspaceKey === 'XPOKART' ||
        activeProfile.workspaceKey === 'BULK_CUSTOMERS' ||
        activeProfile.partnerSlug.toLowerCase() === 'xpokart' ||
        activeProfile.partnerSlug.toLowerCase() === 'bulk-customers')
  );

  // Sync XPOKART storefront settings form defaults when profile changes
  useEffect(() => {
    if (!activeProfile || !isXpokartWorkspace) return;
    const partnerRec = partnerBrandService.getPartnerBySlug('xpokart');
    setXpoCfgTagline(activeProfile.tagline || partnerRec?.tagline || '');
    setXpoCfgCategory(activeProfile.category || partnerRec?.category || 'E-Commerce Storefront');
    setXpoCfgAccent(activeProfile.accentColor || '#1D4ED8');
    setXpoCfgStoreScope(partnerRec?.storeBeatHubScope || 'All Active Postal PINs · Speed Post COD');
  }, [activeProfile?.id, isXpokartWorkspace]);

  // Keep active section valid for the current brand (and strictly block staff/territory inside XPOKART)
  useEffect(() => {
    if (!activeProfile) return;
    if (isXpokartWorkspace) {
      const allowedXpo = new Set<string>([
        'OVERVIEW',
        'XPO_PRODUCTS',
        'XPO_CUSTOMER_PORTAL',
        'XPO_STOREFRONT',
        'CUSTOMERS',
        'REPORTS_EXPORTS',
        'AUDIT_HEALTH',
      ]);
      if (!allowedXpo.has(activeSubMenu)) {
        setActiveSubMenuState('OVERVIEW');
      }
      return;
    }
    if (INDIA_POST_KEY_SET.has(activeSubMenu)) {
      if (!isIndiaPostWorkspace) {
        setActiveSubMenuState(activeProfile.subMenuItems[0] || 'OVERVIEW');
      }
      return;
    }
    const allowed = activeProfile.subMenuItems;
    if (allowed.length > 0 && !allowed.includes(activeSubMenu as BrandPortalSubMenuKey)) {
      setActiveSubMenuState(allowed[0]);
    }
  }, [activeProfile, activeSubMenu, isIndiaPostWorkspace, isXpokartWorkspace]);

  const isPinLocked = Boolean(
    !isMasterAdmin &&
      brandSession &&
      (!brandSession.passcodeVerified || !brandSession.sensitiveUnlocked)
  );
  const mustVerifyInitialPin = Boolean(
    !isMasterAdmin && brandSession && !brandSession.passcodeVerified
  );

  // Scoped datasets
  const scopedCustomers = useMemo(
    () => (activeProfile ? brandOwnerService.getBrandScopedCustomers(activeProfile) : []),
    [activeProfile, tick]
  );
  const scopedOffices = useMemo(
    () =>
      activeProfile && !isXpokartWorkspace
        ? brandOwnerService.getBrandScopedOffices(activeProfile)
        : [],
    [activeProfile, isXpokartWorkspace, tick]
  );
  const scopedStaffRbac = useMemo(
    () =>
      activeProfile && !isXpokartWorkspace
        ? brandOwnerService.getBrandTeamMembersWithRbac(activeProfile.id)
        : [],
    [activeProfile, isXpokartWorkspace, tick]
  );
  const scopedLeads = useMemo(
    () => (activeProfile ? brandOwnerService.getBrandScopedLeads(activeProfile) : []),
    [activeProfile, tick]
  );
  const scopedOps = useMemo(
    () =>
      activeProfile
        ? brandOwnerService.getBrandScopedOperations(activeProfile)
        : { projects: [], tasks: [], workReports: [], srmTickets: [] },
    [activeProfile, tick]
  );
  const scopedDepartments = useMemo(
    () =>
      activeProfile && !isXpokartWorkspace
        ? xpeedoOpsService.getDepartments(activeProfile.workspaceKey)
        : [],
    [activeProfile, isXpokartWorkspace, tick]
  );
  const hierarchyNodes = useMemo(
    () => (isIndiaPostWorkspace ? kotaOsHierarchyService.getOrgHierarchyNodes() : []),
    [isIndiaPostWorkspace, tick]
  );
  const divisionalNotifications = useMemo(
    () => (isIndiaPostWorkspace ? notificationService.getAllNotifications() : []),
    [isIndiaPostWorkspace, tick]
  );
  const xpoConsolidatedStore = useMemo(
    () => (isXpokartWorkspace ? getConsolidatedProductsForBrand('xpokart', '324009') : null),
    [isXpokartWorkspace, tick]
  );

  const showToast = (type: 'ok' | 'err', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  };

  if (!activeProfile || (!brandSession && !isMasterAdmin)) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-7 text-center space-y-4">
          <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center mx-auto">
            <Lock size={22} />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Brand Owner Authentication Required</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            {sessionState.invalidatedReason ||
              'Sign in with your Brand Login ID, Password, and 4–6 digit security passcode to access this isolated brand workspace.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link
              to={brandSlug ? `/brand-login/${brandSlug}` : '/brand-login'}
              className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              Sign In to Brand Portal
            </Link>
            <Link
              to="/staff-gateway"
              className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
            >
              Master Admin Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (mustVerifyInitialPin && brandSession) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-7 space-y-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg text-white flex items-center justify-center shrink-0"
              style={{ backgroundColor: activeProfile.accentColor }}
            >
              <Lock size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono uppercase text-slate-500">
                Security Passcode Required
              </div>
              <h1 className="text-base font-bold text-slate-900 truncate">
                {activeProfile.brandName} ({activeProfile.uniqueCode})
              </h1>
            </div>
          </div>

          {pinError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPinError(null);
              const res = brandOwnerService.verifyBrandPasscode(brandSession.brandProfileId, pinInput);
              if ('error' in res) {
                setPinError(res.error);
                return;
              }
              setPinInput('');
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Enter 4–6 Digit Security Passcode *
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="4 to 6 digit numeric PIN"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-base tracking-widest tabular-nums"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
              >
                Verify PIN &amp; Enter Portal
              </button>
              <button
                type="button"
                onClick={() => {
                  brandOwnerService.signOutBrandOwner();
                  navigate('/brand-login', { replace: true });
                }}
                className="py-2.5 px-4 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (
    brandSession &&
    !isMasterAdmin &&
    brandSlug &&
    brandSlug.toLowerCase() !== activeProfile.partnerSlug.toLowerCase()
  ) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-7 text-center space-y-4">
          <div className="w-12 h-12 rounded-lg bg-red-50 text-red-700 flex items-center justify-center mx-auto border border-red-200">
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Workspace Scope Isolation Active</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your active <strong>BRAND_OWNER</strong> session is strictly locked to{' '}
            <strong>{activeProfile.brandName}</strong> ({activeProfile.uniqueCode}). Cross-brand URL
            access is blocked.
          </p>
          <button
            type="button"
            onClick={() => navigate(`/brand-portal/${activeProfile.partnerSlug}`, { replace: true })}
            className="px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
          >
            Return to {activeProfile.brandName} Workspace
          </button>
        </div>
      </div>
    );
  }

  const requirePinUnlocked = (): boolean => {
    if (!isPinLocked) return true;
    setPinError(null);
    setPinInput('');
    setShowPinGate(true);
    return false;
  };

  const applyRolePreset = (presetKey: string) => {
    setRbacPresetKey(presetKey);
    const preset = BRAND_STAFF_ROLE_PRESETS.find((p) => p.key === presetKey);
    if (!preset) return;
    setRbacRole(preset.staffRole);
    setRbacDesignation(preset.designation);
    if (preset.postCategory) {
      setRbacPostCategory(preset.postCategory as IndiaPostDutyCategory);
    }
    setRbacPermissions({
      ...preset.permissions,
      allowedSections: [...(preset.permissions.allowedSections || ['OVERVIEW', 'MY_PROFILE'])],
    });
  };

  const openCreateRbacModal = () => {
    if (!requirePinUnlocked()) return;
    setRbacModalMode('CREATE');
    setEditingMember(null);
    setRbacName('');
    setRbacContact('');
    setRbacEmail('');
    setRbacPassword('');
    setRbacOffice(scopedOffices[0]?.officeName || `${activeProfile.brandName} Hub`);
    setRbacBeat('Beat 1');
    setRbacStatus('Active');
    applyRolePreset(isIndiaPostWorkspace ? 'FIELD_DELIVERY' : 'SALES_EXECUTIVE');
  };

  const openEditRbacModal = (member: BrandTeamMemberRbacView) => {
    if (!requirePinUnlocked()) return;
    setRbacModalMode('EDIT');
    setEditingMember(member);
    setRbacName(member.name);
    setRbacContact(member.contact);
    setRbacEmail(member.email);
    setRbacPassword('');
    setRbacPresetKey(member.rolePresetKey || 'CUSTOM');
    setRbacRole(member.staffRole);
    setRbacDesignation(member.designation);
    setRbacPostCategory((member.postCategory as IndiaPostDutyCategory) || 'Delivery');
    setRbacOffice(member.assignedOffice || scopedOffices[0]?.officeName || '');
    setRbacBeat(member.beat || 'Beat 1');
    setRbacStatus(member.status === 'Inactive' ? 'Inactive' : 'Active');
    setRbacPermissions({
      ...member.permissions,
      allowedSections: [
        ...(member.permissions.allowedSections || ['OVERVIEW', 'CUSTOMERS', 'OPERATIONS', 'MY_PROFILE']),
      ],
    });
  };

  const toggleAllowedSection = (sec: BrandStaffSectionKey) => {
    setRbacPermissions((prev) => {
      const current = new Set(prev.allowedSections || []);
      if (current.has(sec)) {
        if (current.size > 1) current.delete(sec);
      } else {
        current.add(sec);
      }
      return { ...prev, allowedSections: Array.from(current) };
    });
  };

  const handleSaveRbac = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirePinUnlocked()) return;

    if (rbacModalMode === 'CREATE') {
      const res = brandOwnerService.onboardBrandTeamMember(
        activeProfile.id,
        {
          name: rbacName,
          contact: rbacContact,
          email: rbacEmail || undefined,
          password: rbacPassword || undefined,
          rolePresetKey: rbacPresetKey !== 'CUSTOM' ? rbacPresetKey : undefined,
          staffRole: rbacRole,
          designation: rbacDesignation,
          postCategory: isIndiaPostWorkspace ? rbacPostCategory : undefined,
          assignedOffice: rbacOffice,
          beat: rbacBeat,
          status: rbacStatus,
          permissions: rbacPermissions,
        },
        activeProfile.ownerName
      );
      if ('error' in res) {
        showToast('err', res.error);
        return;
      }
      setRbacModalMode(null);
      showToast(
        'ok',
        `Onboarded "${res.member.name}" as ${res.member.designation} with ${res.member.permissions.allowedSections?.length || 0} sidenav sections.`
      );
      return;
    }

    if (rbacModalMode === 'EDIT' && editingMember) {
      const res = brandOwnerService.updateBrandTeamMemberRbac(
        activeProfile.id,
        editingMember.id,
        {
          rolePresetKey: rbacPresetKey !== 'CUSTOM' ? rbacPresetKey : undefined,
          staffRole: rbacRole,
          designation: rbacDesignation,
          postCategory: isIndiaPostWorkspace ? rbacPostCategory : undefined,
          assignedOffice: rbacOffice,
          beat: rbacBeat,
          status: rbacStatus,
          newPassword: rbacPassword || undefined,
          permissions: rbacPermissions,
        },
        activeProfile.ownerName
      );
      if ('error' in res) {
        showToast('err', res.error);
        return;
      }
      setRbacModalMode(null);
      setEditingMember(null);
      showToast(
        'ok',
        `Updated RBAC & role for "${res.member.name}" (${res.member.designation} · ${res.member.status}).`
      );
    }
  };

  const handleCreateOffice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirePinUnlocked()) return;
    if (!newOfficeName.trim()) {
      showToast('err', 'Office / Store name is required.');
      return;
    }
    staffPermissionService.upsertCustomOffice({
      officeName: newOfficeName.trim(),
      pincode: newOfficePincode.trim() || '324009',
      officeType: newOfficeType,
      completeAddress: newOfficeAddress.trim() || `PIN ${newOfficePincode}`,
      division: isIndiaPostWorkspace ? 'Kota Division' : activeProfile.brandName,
      brandId: activeProfile.partnerSlug,
      brandName: activeProfile.brandName,
    });
    setNewOfficeName('');
    setNewOfficeAddress('');
    setShowAddOffice(false);
    showToast('ok', `Added "${newOfficeName.trim()}" under ${activeProfile.brandName}.`);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirePinUnlocked()) return;
    if (!newCustName.trim()) {
      showToast('err', 'Customer Name is required.');
      return;
    }
    customerService.addOrUpdateCustomer(
      {
        name: newCustName.trim(),
        mobile: newCustMobile.replace(/\D/g, '').slice(-10),
        colony: newCustColony.trim() || 'Kota',
        area: newCustColony.trim() || 'Kota',
        pincode: newCustPincode.trim() || '324009',
        beatNo: newCustBeat.trim() || 'Beat 1',
        brandId: activeProfile.partnerSlug,
        brandName: activeProfile.brandName,
      },
      `BrandPortal:${activeProfile.uniqueCode}`
    );
    setNewCustName('');
    setNewCustMobile('');
    setNewCustColony('');
    setShowAddCustomer(false);
    showToast('ok', `Saved customer "${newCustName.trim()}" under ${activeProfile.brandName}.`);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirePinUnlocked()) return;
    if (!newTaskTitle.trim()) {
      showToast('err', 'Task title is required.');
      return;
    }
    const client = xpeedoOpsService.ensureClientForWorkspace({
      workspaceKey: activeProfile.workspaceKey,
      name: activeProfile.brandName,
      code: activeProfile.uniqueCode,
    });
    const fallbackProj = scopedOps.projects[0];
    xpeedoOpsService.createTask(
      {
        title: newTaskTitle.trim(),
        description: `Created from ${activeProfile.brandName} Brand Owner Portal`,
        clientId: client.id,
        workspaceId: activeProfile.workspaceKey,
        projectId: fallbackProj?.id || 'GENERAL',
        assigneeId: '',
        assigneeName: newTaskAssignee.trim() || activeProfile.ownerName,
        status: 'Assigned',
        priority: newTaskPriority,
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        estimatedHours: 4,
        blockedByTaskIds: [],
        approvalStage: 'NONE',
        createdBy: activeProfile.ownerName,
      },
      activeProfile.ownerName,
      isMasterAdmin ? 'OWNER_SUPER_ADMIN' : 'CLIENT_ADMIN'
    );
    setNewTaskTitle('');
    setNewTaskAssignee('');
    setShowAddTask(false);
    showToast('ok', `Created task inside ${activeProfile.brandName} operations.`);
  };

  const handleCreateIpNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirePinUnlocked()) return;
    if (!ipNodeCode.trim() || !ipNodeName.trim()) return;
    kotaOsHierarchyService.upsertOrgNode(
      {
        code: ipNodeCode.trim().toUpperCase(),
        name: ipNodeName.trim(),
        level: ipNodeLevel,
        pincode: ipNodePin.trim() || undefined,
        vendorId: 'INDIA_POST',
        status: 'ACTIVE',
      },
      activeProfile.ownerName,
      'CLIENT_ADMIN'
    );
    setIpNodeCode('');
    setIpNodeName('');
    setIpNodePin('');
    showToast('ok', `Added ${ipNodeLevel} node to India Post hierarchy.`);
  };

  const handleCreateIpSrm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirePinUnlocked()) return;
    if (!ipSrmCustName.trim() || !ipSrmSubject.trim()) return;
    const office = scopedOffices.find((o) => (o.officeId || o.id) === ipSrmOfficeId) || scopedOffices[0];
    const created = xpeedoOpsService.createSrmTicket(
      {
        officeId: office?.officeId || office?.id || ipSrmOfficeId,
        officeName: office?.officeName || 'Dadabari S.O.',
        pincode: office?.pincode || '324009',
        beatNo: ipSrmBeat.trim() || 'Beat 2',
        customerName: ipSrmCustName.trim(),
        customerMobile: ipSrmCustMobile.trim(),
        category: ipSrmCat,
        subject: ipSrmSubject.trim(),
        description: ipSrmDesc.trim() || ipSrmSubject.trim(),
        priority: ipSrmPrio,
        assignedTo: office?.assignedInchargeName || 'Division SRM Desk',
      },
      activeProfile.ownerName,
      'CLIENT_ADMIN'
    );
    setIpSrmCustName('');
    setIpSrmCustMobile('');
    setIpSrmSubject('');
    setIpSrmDesc('');
    showToast('ok', `Created SRM Ticket ${created.ticketNo} (SLA ${created.slaHours}h).`);
  };

  const configuredMenus = ALL_BRAND_PORTAL_SUBMENUS.filter((m) =>
    activeProfile.subMenuItems.includes(m.key)
  ).map((m) =>
    m.key === 'OVERVIEW' ? { ...m, label: 'Dashboard' } : m
  );

  const currentSectionLabel = (() => {
    if (activeSubMenu === 'XPO_PRODUCTS') return 'Product Catalog & Categories';
    if (activeSubMenu === 'XPO_CUSTOMER_PORTAL') return 'Cart, Orders & Checkout';
    if (activeSubMenu === 'XPO_STOREFRONT') return 'Storefront Settings';
    if (isXpokartWorkspace && activeSubMenu === 'CUSTOMERS') return 'Bulk Buyers';
    return (
      configuredMenus.find((m) => m.key === activeSubMenu)?.label ||
      INDIA_POST_CONSOLIDATED_MENUS.find((m) => m.key === activeSubMenu)?.label ||
      'Dashboard'
    );
  })();

  const filteredCustomers = scopedCustomers.filter((c) => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return true;
    return `${c.name} ${c.mobile} ${c.colony || ''} ${c.pincode || ''} ${c.beatNo || ''}`
      .toLowerCase()
      .includes(q);
  });

  const filteredOffices = scopedOffices.filter((o) => {
    const q = officeSearch.trim().toLowerCase();
    if (!q) return true;
    return `${o.officeName} ${o.pincode} ${o.officeType} ${o.division}`.toLowerCase().includes(q);
  });

  // Enrich staff records with PIN code & real workload count for Master Staff multi-criteria filtering
  const allStaffProfiles = staffPermissionService.getAllStaffProfiles();
  const profileLookupById = new Map(allStaffProfiles.map((p) => [p.id, p]));

  const staffWorkloadMap = new Map<string, number>();
  scopedOps.tasks.forEach((tk) => {
    if (tk.status === 'Completed' || tk.status === 'Cancelled') return;
    const key = (tk.assigneeName || '').trim().toLowerCase();
    if (key) staffWorkloadMap.set(key, (staffWorkloadMap.get(key) || 0) + 1);
  });
  scopedLeads.forEach((ld) => {
    if (ld.stage === 'Converted - Product Opened' || ld.stage === 'Closed / Lost') return;
    const key = (ld.assignedStaffName || '').trim().toLowerCase();
    if (key) staffWorkloadMap.set(key, (staffWorkloadMap.get(key) || 0) + 1);
  });

  const enrichedStaffList = scopedStaffRbac.map((m) => {
    const prof = profileLookupById.get(m.id);
    const pinFromOffice =
      prof?.officePincode ||
      scopedOffices.find(
        (o) => o.officeName.toLowerCase() === (m.assignedOffice || '').toLowerCase()
      )?.pincode ||
      '324009';
    const workload = staffWorkloadMap.get(m.name.trim().toLowerCase()) || 0;
    return {
      ...m,
      pincode: pinFromOffice,
      workload,
    };
  });

  const staffDistinctRoles = Array.from(new Set(enrichedStaffList.map((s) => s.staffRole))).sort();
  const staffDistinctOffices = Array.from(
    new Set(enrichedStaffList.map((s) => s.assignedOffice || '').filter(Boolean))
  ).sort();
  const staffDistinctPins = Array.from(
    new Set(enrichedStaffList.map((s) => s.pincode || '').filter(Boolean))
  ).sort();
  const staffDistinctBeats = Array.from(
    new Set(enrichedStaffList.map((s) => s.beat || '').filter(Boolean))
  ).sort();

  const filteredStaff = enrichedStaffList.filter((s) => {
    if (staffRoleFilter !== 'ALL' && s.staffRole !== staffRoleFilter) return false;
    if (staffOfficeFilter !== 'ALL' && (s.assignedOffice || '') !== staffOfficeFilter) return false;
    if (staffPinFilter !== 'ALL' && s.pincode !== staffPinFilter) return false;
    if (staffBeatFilter !== 'ALL' && (s.beat || '') !== staffBeatFilter) return false;
    if (staffStatusFilter !== 'ALL' && s.status !== staffStatusFilter) return false;
    if (staffWorkloadFilter === 'ACTIVE_LOAD' && s.workload === 0) return false;
    if (staffWorkloadFilter === 'AVAILABLE' && s.workload > 0) return false;
    const q = staffSearch.trim().toLowerCase();
    if (!q) return true;
    return `${s.name} ${s.contact || ''} ${s.employeeId || ''} ${s.designation} ${s.staffRole} ${s.assignedOffice || ''} ${s.beat || ''} ${s.pincode}`
      .toLowerCase()
      .includes(q);
  });

  const currentSubModeKey =
    activeSubMenu === 'OFFICES_STORES'
      ? officeMasterMode
      : activeSubMenu === 'IP_GEO_QUALITY'
      ? ipGeoMode
      : activeSubMenu === 'IP_STATUTORY_DOCS'
      ? ipDocsMode
      : activeSubMenu === 'IP_DAILY_OPS'
      ? ipDailyMode
      : activeSubMenu === 'IP_LMS_STOREFRONT'
      ? ipLmsMode
      : undefined;

  const brandPortalNavGroups = buildBrandPortalNav({
    mode: 'OWNER',
    brandName: activeProfile.brandName,
    partnerSlug: activeProfile.partnerSlug,
    isXpokart: isXpokartWorkspace,
    isIndiaPost: isIndiaPostWorkspace,
    retailServicesActive,
    configuredOwnerSubMenus: activeProfile.subMenuItems,
    counts: {
      stores: isXpokartWorkspace ? undefined : scopedOffices.length,
      team: isXpokartWorkspace ? undefined : scopedStaffRbac.length,
      customers: scopedCustomers.length,
      leads: scopedLeads.length,
      tasks: scopedOps.tasks.length,
      departments: isXpokartWorkspace ? undefined : scopedDepartments.length,
      products: xpoConsolidatedStore?.allProducts.length,
      notifications: isIndiaPostWorkspace
        ? divisionalNotifications.filter((n) => !n.isRead).length || undefined
        : undefined,
    },
  });

  const sidebarContent = (
    <ThreeLevelSidebar
      groups={brandPortalNavGroups}
      activeTabKey={activeSubMenu}
      activeSubModeKey={currentSubModeKey}
      accentColor={activeProfile.accentColor || '#1D4ED8'}
      onSelectItem={(item) => {
        if (item.tabKey) {
          setActiveSectionAndSub(item.tabKey as BrandActiveSectionKey, item.subModeKey);
        }
      }}
      onCloseMobile={() => setMobileMenuOpen(false)}
      headerSlot={
        <div className="space-y-2.5 flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0"
              style={{ backgroundColor: activeProfile.accentColor }}
            >
              {activeProfile.brandName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">{activeProfile.brandName}</div>
              <div className="text-[11px] font-mono text-slate-400 truncate">
                {activeProfile.uniqueCode}
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-300 flex items-center justify-between pt-0.5 gap-2">
            <span className="truncate">{activeProfile.ownerName}</span>
            <span
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold shrink-0 ${
                activeProfile.status === 'ACTIVE'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-red-950 text-red-300 border border-red-800'
              }`}
            >
              {activeProfile.status}
            </span>
          </div>
        </div>
      }
      footerSlot={
        <div className="space-y-2 text-xs">
          {isMasterAdmin && !brandSession && (
            <Link
              to="/settings"
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={14} />
              <span>Master Admin Settings</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              brandOwnerService.signOutBrandOwner();
              navigate(isMasterAdmin && !brandSession ? '/dashboard' : '/brand-login', { replace: true });
            }}
            className="w-full py-2 px-3 rounded-lg bg-red-950/60 hover:bg-red-900/70 border border-red-900 text-red-200 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={14} />
            <span>{isMasterAdmin && !brandSession ? 'Exit Inspect' : 'Sign Out Brand'}</span>
          </button>
        </div>
      }
    />
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Desktop Persistent Sidenav */}
      <aside className="hidden lg:block w-72 shrink-0 border-r border-slate-200 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-72 h-full">{sidebarContent}</div>
          <div
            className="flex-1 bg-slate-950/60"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Master Admin Inspect Banner (never shown to Brand Owners) */}
        {isMasterAdmin && !brandSession && (
          <div className="bg-slate-900 text-white px-4 sm:px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-blue-400 shrink-0" />
              <span className="font-semibold">
                Master Admin Control Mode — Inspecting {activeProfile.brandName} ({activeProfile.uniqueCode})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={activeProfile.partnerSlug}
                onChange={(e) => navigate(`/brand-portal/${e.target.value}`)}
                aria-label="Switch inspected brand workspace"
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white"
              >
                {allBrands.map((b) => (
                  <option key={b.id} value={b.partnerSlug}>
                    {b.brandName} ({b.uniqueCode})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open brand navigation menu"
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-slate-500">
                {activeProfile.brandName} / {currentSectionLabel}
              </div>
              <h1 className="text-base font-bold text-slate-900 truncate">
                {activeProfile.brandName} — {currentSectionLabel}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {brandSession && !isMasterAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (isPinLocked) {
                    setShowPinGate(true);
                  } else {
                    brandOwnerService.lockSensitivePortalActions();
                    showToast('ok', 'Sensitive store/customer actions locked. Re-enter PIN to unlock.');
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border cursor-pointer whitespace-nowrap ${
                  isPinLocked
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isPinLocked ? <Lock size={13} /> : <Unlock size={13} />}
                <span>{isPinLocked ? 'PIN Locked (Unlock)' : 'Lock Sensitive Actions'}</span>
              </button>
            )}
          </div>
        </header>

        {/* Feedback Toast */}
        {notice && (
          <div
            className={`mx-4 sm:mx-6 mt-4 p-3 rounded-lg border text-xs font-medium flex items-center justify-between gap-2 ${
              notice.type === 'ok'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span className="flex items-center gap-2">
              {notice.type === 'ok' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {notice.text}
            </span>
            <button type="button" onClick={() => setNotice(null)} className="cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Strict Single-Section Menu-Driven Viewport */}
        <main className="p-4 sm:p-6 space-y-6 flex-1">
          {activeSubMenu === 'OVERVIEW' && (
            <div className="space-y-6">
              {isXpokartWorkspace ? (
                <>
                  <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl border border-blue-800/60 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 rounded-xl bg-blue-500 text-white shrink-0">
                        <ShoppingBag size={22} />
                      </div>
                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-wider text-blue-300 font-semibold">
                          INDIA POST · Bulk Showcase System
                        </div>
                        <h2 className="text-base font-bold text-white mt-0.5">
                          India Post Bulk Customer Showcase Studio
                        </h2>
                        <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                          Strictly focused India Post Bulk Customer catalog, promoted products, dispatch orders &amp; storefront configuration.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveSubMenu('XPO_PRODUCTS')}
                        className="px-3.5 py-2 rounded-lg bg-white text-slate-950 hover:bg-blue-50 font-semibold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Package size={14} />
                        <span>Manage Catalog</span>
                      </button>
                      <Link
                        to="/brand/bulk-customers"
                        className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Store size={14} />
                        <span>Open Public Showcase</span>
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                    <div className="p-5">
                      <div className="text-xs font-medium text-slate-500">Catalog SKUs</div>
                      <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                        {xpoConsolidatedStore?.allProducts.length || 0}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-xs font-medium text-slate-500">Order &amp; Checkout Leads</div>
                      <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                        {scopedLeads.length}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-xs font-medium text-slate-500">Bulk Buyers</div>
                      <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                        {scopedCustomers.length}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-xs font-medium text-slate-500">Cart Recovery Sessions</div>
                      <div className="text-2xl font-bold text-blue-700 font-mono tabular-nums mt-1">
                        {cartRecoveryService.getRecoveryLog().length}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-2">
                      <div className="font-mono uppercase text-slate-500">Store Identity</div>
                      <h3 className="text-base font-bold text-slate-900">{activeProfile.brandName}</h3>
                      <p className="text-slate-600">{activeProfile.tagline || activeProfile.category}</p>
                      <div className="pt-1 space-y-1 text-slate-700">
                        <div>
                          <span className="text-slate-500">Store Code:</span>{' '}
                          <span className="font-mono font-semibold">{activeProfile.uniqueCode}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Merchant Owner:</span>{' '}
                          <span className="font-semibold">{activeProfile.ownerName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                      <div className="font-mono uppercase text-slate-500">Quick Store Actions</div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setActiveSubMenu('XPO_CUSTOMER_PORTAL')}
                          className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer whitespace-nowrap"
                        >
                          Orders &amp; Checkout
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveSubMenu('XPO_STOREFRONT')}
                          className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold cursor-pointer whitespace-nowrap"
                        >
                          Storefront Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {isIndiaPostWorkspace && (
                    <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white rounded-2xl border border-red-900/60 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                      <div className="flex items-center gap-3.5">
                        <div className="p-3 rounded-xl bg-amber-400 text-slate-950 font-black shadow-md shrink-0">
                          <Search size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-black text-amber-300 uppercase tracking-widest bg-red-900/80 px-2 py-0.5 rounded border border-red-700/60">
                              BRD-INPOST-01 · Sovereign Console
                            </span>
                            <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              <span>Session Lock Active</span>
                            </span>
                          </div>
                          <h2 className="text-base font-black text-white mt-1">
                            Department of Post — Master Operations &amp; Inspection Console
                          </h2>
                          <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                            Unified inspection across Kota Division &amp; Rajasthan Circle Managed Beat Tree, {scopedStaffRbac.length} Master Staff, 2,798+ Properties, Citizens &amp; B2B Shippers.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveSubMenu('MASTER_SEARCH')}
                        className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center gap-2 shadow-md cursor-pointer shrink-0 whitespace-nowrap"
                      >
                        <Search size={14} />
                        <span>Open Master Search Console</span>
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                    <div className="p-5">
                      <div className="text-xs font-medium text-slate-500">Office Master</div>
                      <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                        {scopedOffices.length}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-xs font-medium text-slate-500">Master Staff</div>
                      <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                        {scopedStaffRbac.length}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-xs font-medium text-slate-500">Customers</div>
                      <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                        {scopedCustomers.length}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-xs font-medium text-slate-500">
                        {isIndiaPostWorkspace ? 'Leads & SRM Tickets' : 'Tasks & Leads'}
                      </div>
                      <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                        {scopedOps.tasks.length + scopedOps.srmTickets.length + scopedLeads.length}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="text-xs font-mono uppercase text-slate-500">Brand Owner Profile</div>
                      <h2 className="text-base font-bold text-slate-900">{activeProfile.brandName}</h2>
                      <p className="text-xs text-slate-600">{activeProfile.tagline || activeProfile.category}</p>
                      <div className="pt-2 space-y-1.5 text-xs text-slate-700">
                        <div>
                          <span className="text-slate-500">Unique Code:</span>{' '}
                          <span className="font-mono font-semibold">{activeProfile.uniqueCode}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Owner:</span>{' '}
                          <span className="font-semibold">{activeProfile.ownerName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-slate-400" />
                          <span className="font-mono tabular-nums">
                            {activeProfile.ownerContactNumber || 'Not configured'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                      <div className="text-xs font-mono uppercase text-slate-500">Session, RBAC &amp; Isolation</div>
                      <div className="text-xs text-slate-700 space-y-1.5">
                        <div>
                          <span className="text-slate-500">Workspace Scope:</span>{' '}
                          <span className="font-mono font-semibold text-blue-700">
                            {activeProfile.workspaceKey}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Single-Session Policy:</span>{' '}
                          <span className="font-semibold">
                            {activeProfile.singleSessionOnly ? 'Enforced (1 Active Session)' : 'Standard'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Staff Login Portal:</span>{' '}
                          <Link
                            to={`/brand-access/${activeProfile.partnerSlug}`}
                            className="font-mono font-semibold text-blue-700 hover:underline"
                          >
                            /brand-access/{activeProfile.partnerSlug}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* White-Label Staff Portal & Shareable Invite Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Users size={16} className="text-blue-600" />
                          <span>White-Label Staff Login Portal &amp; Shareable Invite</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Share this dedicated white-label portal link with your staff members so they sign in to {activeProfile.brandName} with your official branding, colors, and area scope.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const url = `${window.location.origin}/brand-access/${activeProfile.partnerSlug}`;
                            navigator.clipboard.writeText(url).catch(() => {});
                            setCopiedStaffLink(true);
                            setTimeout(() => setCopiedStaffLink(false), 2500);
                          }}
                          className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                        >
                          {copiedStaffLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          <span>{copiedStaffLink ? 'Copied Staff Link!' : 'Copy Staff Login Link'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const url = `${window.location.origin}/brand-access/${activeProfile.partnerSlug}`;
                            const msg = `Hello Team,\n\nYour official Staff Portal for *${activeProfile.brandName}* (${activeProfile.workspaceKey}) is now active.\n\n🔗 *Login Link:* ${url}\n\nPlease sign in with your assigned Staff ID or mobile number and password to access your area and tasks.\n\n- ${activeProfile.ownerName} (${activeProfile.brandName})`;
                            navigator.clipboard.writeText(msg).catch(() => {});
                            setCopiedInviteMsg(true);
                            setTimeout(() => setCopiedInviteMsg(false), 2500);
                          }}
                          className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                        >
                          {copiedInviteMsg ? <Check size={14} className="text-emerald-200" /> : <Share2 size={14} />}
                          <span>{copiedInviteMsg ? 'Copied Invite Message!' : 'Copy WhatsApp Invite'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs text-blue-800 break-all select-all flex items-center justify-between gap-2">
                      <span>{window.location.origin}/brand-access/{activeProfile.partnerSlug}</span>
                      <Link
                        to={`/brand-access/${activeProfile.partnerSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-sans text-[11px] font-semibold shrink-0"
                      >
                        Preview Portal ↗
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* INDIA POST BULK SHOWCASE SECTIONS */}
          {isXpokartWorkspace && activeSubMenu === 'XPO_PRODUCTS' && xpoConsolidatedStore && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-mono uppercase text-blue-700 font-semibold">
                    India Post Bulk Showcase Catalog · {xpoConsolidatedStore.brand.brandName}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">
                    Promoted Catalog &amp; Categories ({xpoConsolidatedStore.allProducts.length} SKUs)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage active bulk customer SKUs, tariffs, and categories synced to /brand/bulk-customers.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={xpoSearch}
                      onChange={(e) => setXpoSearch(e.target.value)}
                      placeholder="Search SKU, product..."
                      className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <select
                    value={xpoCategoryFilter}
                    onChange={(e) => setXpoCategoryFilter(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="ALL">All Categories</option>
                    {Object.keys(xpoConsolidatedStore.productsByCategory).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (requirePinUnlocked()) setShowAddXpoProduct((s) => !s);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Plus size={14} />
                    <span>Add Store SKU</span>
                  </button>
                </div>
              </div>

              {showAddXpoProduct && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!requirePinUnlocked()) return;
                    if (!xpoNewTitle.trim()) return;
                    const price = Math.max(1, Number(xpoNewPrice) || 499);
                    const mrp = Math.max(price, Number(xpoNewMrp) || Math.round(price * 1.25));
                    const created = staffProductService.addProduct({
                      sku:
                        xpoNewSku.trim().toUpperCase() ||
                        `INP-${Date.now().toString(36).slice(-4).toUpperCase()}`,
                      title: xpoNewTitle.trim(),
                      vertical: 'Custom Staff / Partner Products',
                      pricingModel: 'Fixed Price',
                      productType: 'Physical Item',
                      brandName: 'India Post Bulk Showcase',
                      brandCategoryTag: xpoNewCategory.trim() || 'Featured',
                      vendorName: 'India Post Bulk Showcase',
                      vendorCategory: 'Bulk Parcel',
                      price,
                      mrpPrice: mrp,
                      sellingMarginPercent: 10,
                      sellingMarginAmount: Math.round(price * 0.1),
                      codEligible: true,
                      speedPostCharge: 15,
                      commissionRate: '10% Store Margin',
                      description:
                        xpoNewDesc.trim() || 'Added directly from India Post Bulk Showcase Studio.',
                      features: [
                        `Category: ${xpoNewCategory.trim() || 'Featured'}`,
                        'India Post Speed Post Fulfillment',
                      ],
                      thumbnailUrl: xpoConsolidatedStore.brand.coverImage,
                      staffId: 'INDIA-POST-OWNER',
                      staffName: activeProfile.ownerName,
                      staffMobile: activeProfile.ownerContactNumber || '9414000002',
                      whatsappNumber: activeProfile.ownerContactNumber || '9414000002',
                      status: 'ACTIVE',
                      freshnessStatus: 'FRESH_ACTIVE',
                      sourceOwnership: 'COMPANY_HOUSE',
                    });
                    customerService.logAudit(
                      'INDIA_POST_SKU_ADDED',
                      'Product',
                      created.id,
                      created.title,
                      `SKU ${created.sku} · ₹${created.price} (${xpoNewCategory})`
                    );
                    setXpoNewSku('');
                    setXpoNewTitle('');
                    setXpoNewDesc('');
                    setShowAddXpoProduct(false);
                    showToast('ok', `Published "${created.title}" (${created.sku}) to India Post Showcase.`);
                  }}
                  className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-6 gap-3 text-xs"
                >
                  <input
                    value={xpoNewSku}
                    onChange={(e) => setXpoNewSku(e.target.value)}
                    placeholder="SKU (optional)"
                    className="px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                  <input
                    required
                    value={xpoNewTitle}
                    onChange={(e) => setXpoNewTitle(e.target.value)}
                    placeholder="Product Title *"
                    className="md:col-span-2 px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    value={xpoNewCategory}
                    onChange={(e) => setXpoNewCategory(e.target.value)}
                    placeholder="Category"
                    className="px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    type="number"
                    min={1}
                    value={xpoNewPrice}
                    onChange={(e) => setXpoNewPrice(e.target.value)}
                    placeholder="Selling ₹"
                    className="px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      value={xpoNewMrp}
                      onChange={(e) => setXpoNewMrp(e.target.value)}
                      placeholder="MRP ₹"
                      className="w-24 px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                    />
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold cursor-pointer"
                    >
                      Publish
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {xpoConsolidatedStore.allProducts
                  .filter((item) => {
                    if (xpoCategoryFilter !== 'ALL' && item.categoryGroup !== xpoCategoryFilter) {
                      return false;
                    }
                    const q = xpoSearch.trim().toLowerCase();
                    if (!q) return true;
                    return `${item.title} ${item.sku} ${item.categoryGroup}`
                      .toLowerCase()
                      .includes(q);
                  })
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.imageSrc}
                          alt={item.title}
                          className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-[11px] font-mono text-slate-500 truncate">{item.sku}</div>
                          <div className="font-bold text-slate-900 text-sm line-clamp-2">{item.title}</div>
                          <div className="text-[11px] text-blue-700 font-medium mt-0.5">
                            {item.categoryGroup}
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-600 line-clamp-2">{item.description}</p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="font-mono tabular-nums">
                          <span className="text-sm font-bold text-slate-900">
                            ₹{item.retailPrice.toLocaleString('en-IN')}
                          </span>
                          {item.mrpPrice > item.retailPrice && (
                            <span className="ml-1.5 text-slate-400 line-through">
                              ₹{item.mrpPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">{item.badgeTag}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {isXpokartWorkspace && activeSubMenu === 'XPO_CUSTOMER_PORTAL' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ShoppingCart size={16} className="text-blue-600" />
                      <span>Create Store Order / Checkout Flow</span>
                    </h2>
                    <Link
                      to="/brand/bulk-customers"
                      className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <span>Showcase</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!requirePinUnlocked()) return;
                      if (!xpoOrderBuyerName.trim() || !xpoOrderItemTitle.trim()) return;
                      const mobile = xpoOrderMobile.replace(/\D/g, '').slice(-10);
                      const { customer } = customerService.addOrUpdateCustomer(
                        {
                          name: xpoOrderBuyerName.trim(),
                          mobile,
                          pincode: xpoOrderPincode.trim() || '324009',
                          colony: `PIN ${xpoOrderPincode.trim() || '324009'}`,
                          brandId: 'india-post',
                          brandName: 'India Post',
                          businessCategory: 'Bulk Showcase Order',
                        },
                        'IndiaPostBulkCheckout'
                      );
                      const createdLead = customerService.createLead({
                        customerId: customer.id || customer.masterId || '',
                        customerName: customer.name,
                        customerMobile: mobile,
                        productCode: 'INP-ORD',
                        productName: `${xpoOrderItemTitle.trim()} (Qty ${xpoOrderQty})`,
                        requirement: `India Post Bulk Showcase Order · Qty ${xpoOrderQty} · PIN ${xpoOrderPincode}`,
                        source: 'India Post Bulk Showcase',
                        sourceChannel: 'Web Portal',
                        stage: 'Under Processing',
                        priority: 'High',
                        leadScore: 85,
                        pincode: xpoOrderPincode.trim() || '324009',
                        brandId: 'india-post',
                        brandName: 'India Post',
                        businessCategory: 'Bulk Showcase Checkout',
                      });
                      customerService.logAudit(
                        'INDIA_POST_ORDER_CREATED',
                        'Lead',
                        createdLead.id,
                        customer.name,
                        `Item: ${createdLead.productName} · PIN ${createdLead.pincode}`
                      );
                      setXpoOrderBuyerName('');
                      setXpoOrderMobile('');
                      setXpoOrderItemTitle('');
                      showToast('ok', `Logged storefront checkout order ${createdLead.id} for ${customer.name}.`);
                    }}
                    className="space-y-2.5 text-xs"
                  >
                    <input
                      required
                      value={xpoOrderBuyerName}
                      onChange={(e) => setXpoOrderBuyerName(e.target.value)}
                      placeholder="Buyer Full Name *"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        maxLength={10}
                        value={xpoOrderMobile}
                        onChange={(e) => setXpoOrderMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-Digit Mobile"
                        className="px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                      />
                      <input
                        maxLength={6}
                        value={xpoOrderPincode}
                        onChange={(e) => setXpoOrderPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Delivery PIN"
                        className="px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        required
                        list="xpo-skus-list"
                        value={xpoOrderItemTitle}
                        onChange={(e) => setXpoOrderItemTitle(e.target.value)}
                        placeholder="Product / SKU *"
                        className="col-span-2 px-3 py-2 border border-slate-300 rounded-lg"
                      />
                      <datalist id="xpo-skus-list">
                        {(xpoConsolidatedStore?.allProducts || []).map((p) => (
                          <option key={p.id} value={p.title} />
                        ))}
                      </datalist>
                      <input
                        type="number"
                        min={1}
                        value={xpoOrderQty}
                        onChange={(e) => setXpoOrderQty(e.target.value)}
                        placeholder="Qty"
                        className="px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                    >
                      Submit Store Order
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <h2 className="text-sm font-bold text-slate-900">
                    Store Orders, Checkout Leads &amp; Cart Sessions ({scopedLeads.length})
                  </h2>
                  {scopedLeads.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">
                      No bulk showcase orders logged yet. Create a showcase order or test /brand/bulk-customers checkout.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100 text-xs max-h-80 overflow-y-auto">
                      {scopedLeads.map((ld) => (
                        <div key={ld.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-slate-900">
                              {ld.customerName} · {ld.productName}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500">
                              {ld.customerMobile || '—'} · PIN {ld.pincode || '—'}
                            </div>
                          </div>
                          <select
                            value={ld.stage}
                            onChange={(e) =>
                              customerService.updateLeadStage(ld.id, e.target.value as any)
                            }
                            className="px-2.5 py-1 border border-slate-300 rounded bg-white font-semibold"
                          >
                            <option value="New">New Order</option>
                            <option value="Contacted">Confirmed</option>
                            <option value="Under Processing">Dispatched</option>
                            <option value="Converted - Product Opened">Delivered</option>
                            <option value="Closed / Lost">Cancelled</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isXpokartWorkspace && activeSubMenu === 'XPO_STOREFRONT' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-2xl space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-600" />
                  <span>Showcase Storefront Settings · India Post Bulk Hub</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure public bulk customer showcase identity, category positioning, and accent theme for /brand/bulk-customers.
                </p>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!requirePinUnlocked()) return;
                  brandOwnerService.updateBrandProfile(
                    activeProfile.id,
                    {
                      tagline: xpoCfgTagline,
                      category: xpoCfgCategory,
                      accentColor: xpoCfgAccent,
                    },
                    activeProfile.ownerName
                  );
                  const partner = partnerBrandService.getPartnerBySlug('bulk-customers');
                  if (partner) {
                    partnerBrandService.updatePartnerBrandingAndProfile(partner.id, {
                      tagline: xpoCfgTagline,
                      category: xpoCfgCategory,
                      accentColor: xpoCfgAccent,
                      storeBeatHubScope: xpoCfgStoreScope,
                    });
                  }
                  showToast('ok', 'Saved India Post showcase configuration.');
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Storefront Tagline</label>
                  <input
                    value={xpoCfgTagline}
                    onChange={(e) => setXpoCfgTagline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Primary Showcase Category</label>
                    <input
                      value={xpoCfgCategory}
                      onChange={(e) => setXpoCfgCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Brand Accent Hex</label>
                    <input
                      value={xpoCfgAccent}
                      onChange={(e) => setXpoCfgAccent(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fulfillment &amp; COD Policy Note</label>
                  <input
                    value={xpoCfgStoreScope}
                    onChange={(e) => setXpoCfgStoreScope(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                  >
                    Save Store Settings
                  </button>
                  <Link
                    to="/brand/bulk-customers"
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    View Live Showcase ↗
                  </Link>
                </div>
              </form>
            </div>
          )}

          {/* TERRITORY & TEAM MODULE 1: OFFICE MASTER (OFFICES & BEATS, EXCLUDED FROM XPOKART) */}
          {!isXpokartWorkspace && activeSubMenu === 'OFFICES_STORES' && (
            <div className="space-y-4">
              {isIndiaPostWorkspace && (
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveSectionAndSub('OFFICES_STORES', 'OFFICES')}
                      className={`px-3.5 py-1.5 rounded-lg font-semibold cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        officeMasterMode === 'OFFICES'
                          ? 'bg-red-800 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Building2 size={14} />
                      <span>Offices &amp; Branches Registry ({scopedOffices.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSectionAndSub('OFFICES_STORES', 'BEATS')}
                      className={`px-3.5 py-1.5 rounded-lg font-semibold cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        officeMasterMode === 'BEATS'
                          ? 'bg-red-800 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Route size={14} />
                      <span>Beats &amp; PIN Matrix ({CONSOLIDATED_BEAT_MATRIX.length} Beats)</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveSubMenu('STAFF')}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 cursor-pointer whitespace-nowrap"
                    >
                      Master Staff →
                    </button>
                  </div>
                </div>
              )}

              {isIndiaPostWorkspace && officeMasterMode === 'OFFICES' ? (
                <Suspense fallback={<EmbeddedLoading />}>
                  <OfficeMasterView indiaPostOwnerAccess />
                </Suspense>
              ) : isIndiaPostWorkspace && officeMasterMode === 'BEATS' ? (
                <Suspense fallback={<EmbeddedLoading />}>
                  <BeatManagementView indiaPostOwnerAccess />
                </Suspense>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Office Master ({filteredOffices.length})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Canonical offices, hubs &amp; PIN coverage isolated to {activeProfile.brandName} ({activeProfile.workspaceKey}).
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={officeSearch}
                          onChange={(e) => setOfficeSearch(e.target.value)}
                          placeholder="Search office or PIN..."
                          className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (requirePinUnlocked()) setShowAddOffice((s) => !s);
                        }}
                        className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Plus size={14} />
                        <span>Add Office / Hub</span>
                      </button>
                    </div>
                  </div>

                  {showAddOffice && (
                    <form
                      onSubmit={handleCreateOffice}
                      className="p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs"
                    >
                      <input
                        type="text"
                        required
                        value={newOfficeName}
                        onChange={(e) => setNewOfficeName(e.target.value)}
                        placeholder="Office or Hub Name *"
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                      <input
                        type="text"
                        maxLength={6}
                        value={newOfficePincode}
                        onChange={(e) => setNewOfficePincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="PIN Code (6-digit)"
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono tabular-nums"
                      />
                      <select
                        value={newOfficeType}
                        onChange={(e) => setNewOfficeType(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="Hyperlocal Store">Hyperlocal Store</option>
                        <option value="EV Hub">EV Hub</option>
                        <option value="Logistics Franchise">Logistics Franchise</option>
                        <option value="S.O.">Sub Post Office (S.O.)</option>
                        <option value="B.O.">Branch Post Office (B.O.)</option>
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newOfficeAddress}
                          onChange={(e) => setNewOfficeAddress(e.target.value)}
                          placeholder="Address / Zone"
                          className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  )}

                  {filteredOffices.length === 0 ? (
                    <div className="p-10 text-center space-y-2">
                      <p className="text-xs font-semibold text-slate-700">
                        No offices or hubs assigned to {activeProfile.brandName} yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                            <th className="py-3 px-4">Office / Hub Name</th>
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">PIN Code</th>
                            <th className="py-3 px-4">Division / Scope</th>
                            <th className="py-3 px-4 text-right">Staff Count</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredOffices.map((o, idx) => (
                            <tr key={`${(o.officeId || o.id || o.officeName).toUpperCase()}-${idx}`} className="hover:bg-slate-50">
                              <td className="py-3 px-4 font-semibold text-slate-900">{o.officeName}</td>
                              <td className="py-3 px-4 text-slate-600">{o.officeType}</td>
                              <td className="py-3 px-4 font-mono tabular-nums text-slate-700">{o.pincode}</td>
                              <td className="py-3 px-4 text-slate-600">{o.division}</td>
                              <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold">
                                {o.assignedStaffCount || 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TERRITORY & TEAM MODULE 2: MASTER STAFF (MULTI-CRITERIA FILTERING + PROMOTION/ROLE LINKS) */}
          {!isXpokartWorkspace && activeSubMenu === 'STAFF' && (
            <div className="space-y-5">
              <BrandStaffManagementPanel
                brandSlug={activeProfile.partnerSlug}
                brandName={activeProfile.brandName}
                actorName={activeProfile.ownerName}
                accentColor={activeProfile.accentColor}
              />

              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-mono uppercase text-blue-700 font-semibold">
                      Master Staff Directory · {activeProfile.brandName} · India Post Operations
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-0.5">
                      Master Staff Roster &amp; Duty Assignments ({filteredStaff.length} / {enrichedStaffList.length})
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Filter across Role, Office/HPO/SO/BO, PIN Code, Beat, Active Status, and Workload. Execute role access edits in Master Role or transfers in Promotion Master.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveSubMenu('MASTER_ROLE')}
                      className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <ShieldCheck size={14} />
                      <span>Master Role Matrix</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubMenu('PROMOTION_MASTER')}
                      className="px-3 py-2 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Award size={14} />
                      <span>Promotion Master</span>
                    </button>
                    <button
                      type="button"
                      onClick={openCreateRbacModal}
                      title="Onboard operational staff"
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Onboard Staff Member</span>
                    </button>
                  </div>
                </div>

                {/* Multi-Criteria Filter Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="relative lg:col-span-2">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      placeholder="Search name, mobile, EMP ID, beat..."
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <select
                    value={staffRoleFilter}
                    onChange={(e) => setStaffRoleFilter(e.target.value)}
                    aria-label="Filter by role"
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ALL">All Roles</option>
                    {staffDistinctRoles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <select
                    value={staffOfficeFilter}
                    onChange={(e) => setStaffOfficeFilter(e.target.value)}
                    aria-label="Filter by office"
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ALL">All Offices</option>
                    {staffDistinctOffices.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <select
                    value={staffPinFilter}
                    onChange={(e) => setStaffPinFilter(e.target.value)}
                    aria-label="Filter by PIN code"
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                  >
                    <option value="ALL">All PINs</option>
                    {staffDistinctPins.map((p) => (
                      <option key={p} value={p}>
                        PIN {p}
                      </option>
                    ))}
                  </select>
                  <select
                    value={staffBeatFilter}
                    onChange={(e) => setStaffBeatFilter(e.target.value)}
                    aria-label="Filter by beat"
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ALL">All Beats</option>
                    {staffDistinctBeats.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-1.5">
                    <select
                      value={staffStatusFilter}
                      onChange={(e) => setStaffStatusFilter(e.target.value as any)}
                      aria-label="Filter by active status"
                      className="flex-1 px-2 py-1.5 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="ALL">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <select
                      value={staffWorkloadFilter}
                      onChange={(e) => setStaffWorkloadFilter(e.target.value as any)}
                      aria-label="Filter by workload"
                      className="flex-1 px-2 py-1.5 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="ALL">Workload</option>
                      <option value="ACTIVE_LOAD">Assigned (&gt;0)</option>
                      <option value="AVAILABLE">Available (0)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {filteredStaff.length === 0 ? (
                  <div className="p-10 text-center space-y-2">
                    <p className="text-xs font-semibold text-slate-700">
                      No operational staff matching the selected filters in {activeProfile.brandName}.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                          <th className="py-3 px-4">Staff Member</th>
                          <th className="py-3 px-4">Role &amp; Post</th>
                          <th className="py-3 px-4">Office, PIN &amp; Beat</th>
                          <th className="py-3 px-4 text-right">Workload</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStaff.slice(0, 120).map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900">{m.name}</div>
                              <div className="text-[11px] font-mono text-slate-500">
                                {m.employeeId || m.id} · {m.contact || '—'}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-800">{m.designation}</div>
                              <div className="text-[11px] font-mono text-slate-500">
                                {m.staffRole} {isIndiaPostWorkspace && m.postCategory ? `· ${m.postCategory}` : ''}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-700">
                              <div>{m.assignedOffice || '—'}</div>
                              <div className="text-[11px] font-mono text-slate-500">
                                PIN {m.pincode} · {m.beat || 'All Beats'}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-700">
                              {m.workload} active
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`font-mono text-[11px] font-semibold ${
                                  m.status === 'Inactive' ? 'text-red-700' : 'text-emerald-700'
                                }`}
                              >
                                {m.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditRbacModal(m)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                >
                                  <Shield size={12} />
                                  <span>Role Access</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPromoSelectedStaffId(m.id);
                                    setActiveSubMenu('PROMOTION_MASTER');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                >
                                  <Award size={12} />
                                  <span>Promote</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TERRITORY & TEAM MODULE 3: MASTER ROLE */}
          {!isXpokartWorkspace && activeSubMenu === 'MASTER_ROLE' && (
            <Suspense fallback={<EmbeddedLoading />}>
              <TerritoryMasterRoleView
                profile={activeProfile}
                actorName={activeProfile.ownerName}
                onNavigateToPromotion={(sid) => {
                  setPromoSelectedStaffId(sid);
                  setActiveSubMenu('PROMOTION_MASTER');
                }}
                onNavigateToMasterStaff={() => setActiveSubMenu('STAFF')}
              />
            </Suspense>
          )}

          {/* TERRITORY & TEAM MODULE 4: PROMOTION MASTER */}
          {!isXpokartWorkspace && activeSubMenu === 'PROMOTION_MASTER' && (
            <Suspense fallback={<EmbeddedLoading />}>
              <TerritoryPromotionMasterView
                profile={activeProfile}
                actorName={activeProfile.ownerName}
                actorRole={isMasterAdmin ? 'MASTER_ADMIN' : 'BRAND_OWNER'}
                initialStaffId={promoSelectedStaffId}
                onNavigateToMasterRole={() => setActiveSubMenu('MASTER_ROLE')}
                onNavigateToMasterStaff={() => setActiveSubMenu('STAFF')}
              />
            </Suspense>
          )}

          {activeSubMenu === 'CUSTOMERS' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Customers ({filteredCustomers.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Customer records isolated strictly to {activeProfile.brandName}.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Search name, mobile, colony, PIN..."
                      className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-60"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (requirePinUnlocked()) setShowAddCustomer((s) => !s);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Plus size={14} />
                    <span>Add Customer</span>
                  </button>
                </div>
              </div>

              {showAddCustomer && (
                <form
                  onSubmit={handleCreateCustomer}
                  className="p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-5 gap-3 text-xs"
                >
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="Customer Full Name *"
                    className="px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                  <input
                    type="tel"
                    maxLength={10}
                    value={newCustMobile}
                    onChange={(e) => setNewCustMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit Mobile"
                    className="px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono tabular-nums"
                  />
                  <input
                    type="text"
                    value={newCustColony}
                    onChange={(e) => setNewCustColony(e.target.value)}
                    placeholder="Colony / Locality"
                    className="px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    maxLength={6}
                    value={newCustPincode}
                    onChange={(e) => setNewCustPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="PIN Code"
                    className="px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono tabular-nums"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCustBeat}
                      onChange={(e) => setNewCustBeat(e.target.value)}
                      placeholder="Beat"
                      className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg font-semibold cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}

              {filteredCustomers.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    No customers registered under {activeProfile.brandName} matching this filter.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-3 px-4">Customer Name</th>
                        <th className="py-3 px-4">Mobile</th>
                        <th className="py-3 px-4">Colony / Area</th>
                        <th className="py-3 px-4">PIN</th>
                        <th className="py-3 px-4">Beat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCustomers.slice(0, 120).map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-semibold text-slate-900">{c.name}</td>
                          <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                            {c.mobile || '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{c.colony || c.area || '—'}</td>
                          <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                            {c.pincode || '—'}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{c.beatNo || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* CRM & OPERATIONS: PROPERTIES, LEADS, MASTER SEARCH CONSOLE & DEPARTMENTS */}
          {!isXpokartWorkspace && activeSubMenu === 'PROPERTIES' && (
            <div className="space-y-4">
              {isIndiaPostWorkspace ? (
                <Suspense fallback={<EmbeddedLoading />}>
                  <UnifiedPropertyFamilyHub indiaPostOwnerAccess />
                </Suspense>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Home size={16} />
                    <span>Properties Registry · {activeProfile.brandName}</span>
                  </h2>
                  <p className="text-xs text-slate-600">
                    Manage household &amp; commercial property records scoped cleanly to {activeProfile.brandName} via the Partner Property Console or Master Search.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSubMenu('MASTER_SEARCH')}
                    className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                  >
                    Open Master Search Console
                  </button>
                </div>
              )}
            </div>
          )}

          {!isXpokartWorkspace && activeSubMenu === 'LEADS' && (
            <div className="space-y-5">
              <Suspense fallback={<EmbeddedLoading />}>
                <LeadsPipelineView />
              </Suspense>

              {isIndiaPostWorkspace && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Postal Products &amp; Sovereign Schemes Reference ({POSTAL_PRODUCTS.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Active savings, IPPB, PLI &amp; postal schemes feeding the Leads Pipeline above.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                    {POSTAL_PRODUCTS.slice(0, 9).map((p) => (
                      <div key={p.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/70">
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-bold text-red-800">{p.code}</span>
                          <span className="text-slate-600">{p.interestRateOrBonus}</span>
                        </div>
                        <div className="font-semibold text-slate-900 mt-1">{p.name}</div>
                        <div className="text-[11px] text-slate-500">{p.category}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!isXpokartWorkspace && activeSubMenu === 'MASTER_SEARCH' && (
            <Suspense fallback={<EmbeddedLoading />}>
              <IndiaPostMasterSearchAndInspectionView />
            </Suspense>
          )}

          {!isXpokartWorkspace && activeSubMenu === 'DEPARTMENTS_APPROVALS' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers size={16} className="text-blue-600" />
                    <span>Departments ({scopedDepartments.length})</span>
                  </h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!requirePinUnlocked()) return;
                      if (!newDeptName.trim()) return;
                      xpeedoOpsService.upsertDepartment(
                        {
                          workspaceId: activeProfile.workspaceKey,
                          clientId: `client-${activeProfile.partnerSlug}`,
                          name: newDeptName.trim(),
                          code: `${activeProfile.uniqueCode.slice(0, 4)}-${Date.now().toString(36).slice(-3).toUpperCase()}`,
                          headName: newDeptHead.trim() || activeProfile.ownerName,
                          description: `Managed department inside ${activeProfile.brandName}`,
                          isActive: true,
                        },
                        activeProfile.ownerName,
                        isMasterAdmin ? 'MASTER_ADMIN' : 'BRAND_OWNER'
                      );
                      setNewDeptName('');
                      setNewDeptHead('');
                      showToast('ok', `Added department "${newDeptName.trim()}".`);
                    }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs"
                  >
                    <input
                      required
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      placeholder="Department Name *"
                      className="px-3 py-2 border border-slate-300 rounded-lg"
                    />
                    <input
                      value={newDeptHead}
                      onChange={(e) => setNewDeptHead(e.target.value)}
                      placeholder="Dept Head"
                      className="px-3 py-2 border border-slate-300 rounded-lg"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold cursor-pointer"
                    >
                      Add Dept
                    </button>
                  </form>
                  <div className="divide-y divide-slate-100 text-xs max-h-80 overflow-y-auto">
                    {scopedDepartments.map((d) => (
                      <div key={d.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold text-slate-900">{d.name}</div>
                          <div className="text-[11px] text-slate-500">Head: {d.headName}</div>
                        </div>
                        <span className="font-mono text-[11px] text-slate-600">{d.code}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FolderKanban size={16} className="text-emerald-700" />
                    <span>Work Reports &amp; Operational Approvals ({scopedOps.workReports.length})</span>
                  </h2>
                  {scopedOps.workReports.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">
                      No pending work report approvals in {activeProfile.brandName}.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100 text-xs max-h-80 overflow-y-auto">
                      {scopedOps.workReports.map((wr) => (
                        <div key={wr.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-slate-900">{wr.summary}</div>
                            <div className="text-[11px] text-slate-500">
                              {wr.submittedByName} · Stage: <strong className="font-mono">{wr.approvalStage}</strong>
                            </div>
                          </div>
                          {wr.approvalStage !== 'OWNER_APPROVED' && wr.approvalStage !== 'REJECTED' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!requirePinUnlocked()) return;
                                  xpeedoOpsService.advanceWorkReportApproval(
                                    wr.id,
                                    activeProfile.ownerName,
                                    isMasterAdmin ? 'OWNER_SUPER_ADMIN' : 'CLIENT_ADMIN'
                                  );
                                  showToast('ok', `Approved work report ${wr.id}.`);
                                }}
                                className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!requirePinUnlocked()) return;
                                  xpeedoOpsService.rejectWorkReport(
                                    wr.id,
                                    'Returned for review from Brand Portal',
                                    activeProfile.ownerName,
                                    isMasterAdmin ? 'OWNER_SUPER_ADMIN' : 'CLIENT_ADMIN'
                                  );
                                  showToast('ok', `Returned work report ${wr.id}.`);
                                }}
                                className="px-2.5 py-1 rounded border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                              >
                                Return
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!isXpokartWorkspace && activeSubMenu === 'OPERATIONS_TASKS' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Operations &amp; Tasks ({scopedOps.tasks.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Follow-ups, verifications, inquiries &amp; task queues scoped to {activeProfile.workspaceKey}.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveSubMenu('MASTER_SEARCH')}
                      className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer whitespace-nowrap"
                    >
                      Master Search Console
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (requirePinUnlocked()) setShowAddTask((s) => !s);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Plus size={14} />
                      <span>New Task</span>
                    </button>
                  </div>
                </div>

                {showAddTask && (
                  <form
                    onSubmit={handleCreateTask}
                    className="p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs"
                  >
                    <input
                      type="text"
                      required
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Task Title *"
                      className="md:col-span-2 px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      placeholder="Assignee Name"
                      className="px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                    <div className="flex gap-2">
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                      <button
                        type="submit"
                        className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg font-semibold cursor-pointer"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                )}

                {scopedOps.tasks.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500">
                    No tasks logged yet for {activeProfile.brandName}. Create the first task above.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                          <th className="py-3 px-4">Code</th>
                          <th className="py-3 px-4">Task Title</th>
                          <th className="py-3 px-4">Assignee</th>
                          <th className="py-3 px-4">Due Date</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {scopedOps.tasks.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-mono text-slate-600">{t.code}</td>
                            <td className="py-3 px-4 font-semibold text-slate-900">{t.title}</td>
                            <td className="py-3 px-4 text-slate-700">{t.assigneeName}</td>
                            <td className="py-3 px-4 font-mono tabular-nums text-slate-600">{t.dueDate}</td>
                            <td className="py-3 px-4">
                              <select
                                value={t.status}
                                onChange={(e) => {
                                  if (!requirePinUnlocked()) return;
                                  xpeedoOpsService.updateTaskStatus(
                                    t.id,
                                    e.target.value as OpsTaskStatus,
                                    activeProfile.ownerName,
                                    'CLIENT_ADMIN'
                                  );
                                }}
                                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium"
                              >
                                {ALL_OPS_TASK_STATUSES.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubMenu === 'REPORTS_EXPORTS' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Brand Reports &amp; UTF-8 BOM CSV Exports
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Download spreadsheets scoped exclusively to {activeProfile.brandName} ({activeProfile.uniqueCode}).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    if (!requirePinUnlocked()) return;
                    exportCsvWithBom(
                      `${activeProfile.partnerSlug}_customers.csv`,
                      ['ID', 'Name', 'Mobile', 'Colony', 'PIN', 'Beat'],
                      scopedCustomers.map((c) => [
                        c.masterId || c.id,
                        c.name,
                        c.mobile,
                        c.colony || c.area || '',
                        c.pincode || '',
                        c.beatNo || '',
                      ])
                    );
                    showToast('ok', `Exported ${scopedCustomers.length} customers.`);
                  }}
                  className="p-4 border border-slate-200 rounded-xl hover:border-blue-500 text-left space-y-2 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Customers CSV</span>
                    <Download size={15} className="text-blue-600" />
                  </div>
                  <div className="font-mono tabular-nums text-slate-500">
                    {scopedCustomers.length} records
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!requirePinUnlocked()) return;
                    exportCsvWithBom(
                      `${activeProfile.partnerSlug}_offices.csv`,
                      ['Office Name', 'Type', 'PIN', 'Division', 'Staff Count'],
                      scopedOffices.map((o) => [
                        o.officeName,
                        o.officeType,
                        o.pincode,
                        o.division,
                        o.assignedStaffCount || 0,
                      ])
                    );
                    showToast('ok', `Exported ${scopedOffices.length} offices/stores.`);
                  }}
                  className="p-4 border border-slate-200 rounded-xl hover:border-blue-500 text-left space-y-2 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Offices / Stores CSV</span>
                    <Download size={15} className="text-blue-600" />
                  </div>
                  <div className="font-mono tabular-nums text-slate-500">
                    {scopedOffices.length} records
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!requirePinUnlocked()) return;
                    exportCsvWithBom(
                      `${activeProfile.partnerSlug}_staff_rbac.csv`,
                      ['Employee ID', 'Name', 'Role', 'Designation', 'Contact', 'Office', 'Beat', 'Status'],
                      scopedStaffRbac.map((s) => [
                        s.employeeId || s.id,
                        s.name,
                        s.staffRole,
                        s.designation,
                        s.contact || '',
                        s.assignedOffice || '',
                        s.beat || '',
                        s.status,
                      ])
                    );
                    showToast('ok', `Exported ${scopedStaffRbac.length} staff RBAC profiles.`);
                  }}
                  className="p-4 border border-slate-200 rounded-xl hover:border-blue-500 text-left space-y-2 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Brand Staff &amp; RBAC CSV</span>
                    <Download size={15} className="text-blue-600" />
                  </div>
                  <div className="font-mono tabular-nums text-slate-500">
                    {scopedStaffRbac.length} records
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!requirePinUnlocked()) return;
                    exportCsvWithBom(
                      `${activeProfile.partnerSlug}_tasks.csv`,
                      ['Code', 'Title', 'Assignee', 'Status', 'Priority', 'Due Date'],
                      scopedOps.tasks.map((t) => [
                        t.code,
                        t.title,
                        t.assigneeName,
                        t.status,
                        t.priority,
                        t.dueDate,
                      ])
                    );
                    showToast('ok', `Exported ${scopedOps.tasks.length} tasks.`);
                  }}
                  className="p-4 border border-slate-200 rounded-xl hover:border-blue-500 text-left space-y-2 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Operations Tasks CSV</span>
                    <Download size={15} className="text-blue-600" />
                  </div>
                  <div className="font-mono tabular-nums text-slate-500">
                    {scopedOps.tasks.length} records
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeSubMenu === 'AUDIT_HEALTH' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck size={20} className="text-blue-600" />
                    <span>Brand Audit Log &amp; Health Report · {activeProfile.brandName}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Immutable activity trail, change diffs, security session state, and database integrity verification for {activeProfile.uniqueCode}.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!requirePinUnlocked()) return;
                      exportCsvWithBom(
                        `${activeProfile.partnerSlug}_audit_log.csv`,
                        ['Event ID', 'Timestamp', 'Action', 'Entity Type', 'Entity ID', 'Operator', 'Summary'],
                        xpeedoOpsService.getActivityLogs(activeProfile.workspaceKey).map((log) => [
                          log.id,
                          log.timestamp,
                          log.action,
                          log.entityType,
                          log.entityId,
                          log.actor,
                          log.summary,
                        ])
                      );
                      showToast('ok', 'Exported brand audit log CSV.');
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Export Audit Trail CSV</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-500 font-medium">Brand Audit Events</div>
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    {xpeedoOpsService.getActivityLogs(activeProfile.workspaceKey).length}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-500 font-medium">Database Integrity Status</div>
                  <div className="text-sm font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
                    <CheckCircle2 size={16} />
                    <span>Zero Duplicates · Scoped</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-slate-500 font-medium">Active Session Lock</div>
                  <div className="text-sm font-bold text-blue-700 flex items-center gap-1.5 mt-1">
                    <Lock size={15} />
                    <span>{brandSession?.passcodeVerified ? 'Unlocked & Verified' : 'Locked'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Chronological Activity &amp; Change Diffs</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-[500px] overflow-y-auto text-xs">
                  {xpeedoOpsService.getActivityLogs(activeProfile.workspaceKey).length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No recorded audit events for {activeProfile.brandName} yet.</div>
                  ) : (
                    xpeedoOpsService.getActivityLogs(activeProfile.workspaceKey).map((log) => (
                      <div key={log.id} className="p-4 hover:bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-semibold">
                              {log.action}
                            </span>
                            <span className="font-semibold text-slate-900 truncate">{log.summary}</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 truncate">
                            Entity: <strong className="text-slate-700">{log.entityType}</strong> ({log.entityId}) · Operator: <strong className="text-slate-700">{log.actor}</strong> ({log.actorRole})
                          </div>
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 shrink-0">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DEPARTMENT OF POST (BRD-INPOST-01): DIVISIONAL & STATUTORY GOVERNANCE ONLY */}
          {isIndiaPostWorkspace && activeSubMenu === 'IP_HIERARCHY' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Divisional Postal Hierarchy Tree ({hierarchyNodes.length} nodes)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Circle → Region → Division → Subdivision → HPO → SO → BO
                  </p>
                </div>
                <div className="divide-y divide-slate-100 text-xs max-h-[500px] overflow-y-auto">
                  {hierarchyNodes.map((n) => (
                    <div key={n.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-mono font-bold text-red-800 mr-2">[{n.level}]</span>
                        <span className="font-semibold text-slate-900">{n.name}</span>
                        <span className="text-slate-400 font-mono ml-2">{n.code}</span>
                      </div>
                      <span className="font-mono text-slate-500">{n.pincode ? `PIN ${n.pincode}` : n.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Add Hierarchy Node</h3>
                <form onSubmit={handleCreateIpNode} className="space-y-3 text-xs">
                  <select
                    value={ipNodeLevel}
                    onChange={(e) => setIpNodeLevel(e.target.value as OrgHierarchyLevel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="CIRCLE">Circle</option>
                    <option value="REGION">Region</option>
                    <option value="DIVISION">Division</option>
                    <option value="SUBDIVISION">Subdivision</option>
                    <option value="HPO">Head Post Office (HPO)</option>
                    <option value="SO">Sub Post Office (SO)</option>
                    <option value="BO">Branch Post Office (BO)</option>
                  </select>
                  <input
                    required
                    value={ipNodeCode}
                    onChange={(e) => setIpNodeCode(e.target.value)}
                    placeholder="Node Code * (e.g. KOTA-SO-09)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                  <input
                    required
                    value={ipNodeName}
                    onChange={(e) => setIpNodeName(e.target.value)}
                    placeholder="Official Name *"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    maxLength={6}
                    value={ipNodePin}
                    onChange={(e) => setIpNodePin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="6-digit PIN (optional)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-800 hover:bg-red-900 text-white font-semibold rounded-lg cursor-pointer"
                  >
                    Save Postal Node
                  </button>
                </form>
              </div>
            </div>
          )}

          {isIndiaPostWorkspace && activeSubMenu === 'IP_GEO_QUALITY' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 text-xs">
                {[
                  { key: 'LOCATION_INTEL', label: '11-Level Geo Hub & Privacy Map' },
                  { key: 'DATA_QUALITY', label: 'Duplicate & Data Quality Audit' },
                  { key: 'ADDRESS', label: 'Address Resolution Engine' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveSectionAndSub('IP_GEO_QUALITY', item.key)}
                    className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                      ipGeoMode === item.key
                        ? 'bg-red-800 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <Suspense fallback={<EmbeddedLoading />}>
                {ipGeoMode === 'LOCATION_INTEL' && <LocationIntelligenceHub indiaPostOwnerAccess />}
                {ipGeoMode === 'DATA_QUALITY' && <DataQualityView />}
                {ipGeoMode === 'ADDRESS' && <AddressResolutionView />}
              </Suspense>
            </div>
          )}

          {isIndiaPostWorkspace && activeSubMenu === 'IP_SRM' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Ticket size={16} className="text-red-700" />
                  <span>Log India Post SRM Ticket</span>
                </h2>
                <form onSubmit={handleCreateIpSrm} className="space-y-2.5 text-xs">
                  <select
                    value={ipSrmOfficeId}
                    onChange={(e) => setIpSrmOfficeId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {scopedOffices.map((o) => (
                      <option key={o.officeId || o.id} value={o.officeId || o.id}>
                        {o.officeName} ({o.pincode})
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={ipSrmCat}
                      onChange={(e) => setIpSrmCat(e.target.value as SrmTicketCategory)}
                      className="px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Delivery Delay">Delivery Delay</option>
                      <option value="Address Correction">Address Correction</option>
                      <option value="PLI/RPLI Inquiry">PLI/RPLI Inquiry</option>
                      <option value="Savings/IPPB">Savings/IPPB</option>
                      <option value="Aadhaar/CELC">Aadhaar/CELC</option>
                      <option value="Beat Dispute">Beat Dispute</option>
                      <option value="Staff Grievance">Staff Grievance</option>
                    </select>
                    <select
                      value={ipSrmPrio}
                      onChange={(e) => setIpSrmPrio(e.target.value as SrmTicketPriority)}
                      className="px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Low">Low (48h)</option>
                      <option value="Medium">Medium (24h)</option>
                      <option value="High">High (12h)</option>
                      <option value="Critical">Critical (4h)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      required
                      value={ipSrmCustName}
                      onChange={(e) => setIpSrmCustName(e.target.value)}
                      placeholder="Citizen Name *"
                      className="px-3 py-2 border border-slate-300 rounded-lg"
                    />
                    <input
                      value={ipSrmCustMobile}
                      onChange={(e) => setIpSrmCustMobile(e.target.value)}
                      placeholder="Mobile"
                      className="px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <input
                    value={ipSrmBeat}
                    onChange={(e) => setIpSrmBeat(e.target.value)}
                    placeholder="Beat No"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <input
                    required
                    value={ipSrmSubject}
                    onChange={(e) => setIpSrmSubject(e.target.value)}
                    placeholder="Subject *"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <textarea
                    rows={2}
                    value={ipSrmDesc}
                    onChange={(e) => setIpSrmDesc(e.target.value)}
                    placeholder="Details"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-800 hover:bg-red-900 text-white font-semibold rounded-lg cursor-pointer"
                  >
                    Create SRM Ticket
                  </button>
                </form>
              </div>

              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">
                    India Post SRM Queue ({scopedOps.srmTickets.length})
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      exportCsvWithBom(
                        'india_post_srm_queue',
                        ['Ticket', 'Office', 'PIN', 'Beat', 'Citizen', 'Category', 'Status', 'SLA Hours'],
                        scopedOps.srmTickets.map((t) => [
                          t.ticketNo,
                          t.officeName,
                          t.pincode,
                          t.beatNo,
                          t.customerName,
                          t.category,
                          t.status,
                          t.slaHours,
                        ])
                      )
                    }
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Export CSV</span>
                  </button>
                </div>
                {scopedOps.srmTickets.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">No SRM tickets logged yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 text-xs">
                    {scopedOps.srmTickets.map((tk) => (
                      <div key={tk.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold text-slate-900">
                            <span className="font-mono text-red-800 mr-1.5">{tk.ticketNo}</span>
                            {tk.subject}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {tk.officeName} ({tk.pincode}) · {tk.beatNo} · {tk.customerName}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={tk.status}
                            onChange={(e) => {
                              if (!requirePinUnlocked()) return;
                              xpeedoOpsService.updateSrmTicketStatus(
                                tk.id,
                                { status: e.target.value as SrmTicketStatus },
                                activeProfile.ownerName,
                                'CLIENT_ADMIN'
                              );
                            }}
                            className="px-2 py-1 border border-slate-300 rounded bg-white font-semibold"
                          >
                            <option value="Open">Open</option>
                            <option value="Assigned">Assigned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Escalated">Escalated</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {isIndiaPostWorkspace && activeSubMenu === 'IP_STATUTORY_DOCS' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 text-xs">
                {[
                  { key: 'DOCS_HUB', label: 'Fuel, BYOD & Statutory Bills Hub' },
                  { key: 'ACG61', label: 'ACG-61 Charge Report' },
                  { key: 'ARTICLES', label: 'Postman Daily Articles Ledger' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveSectionAndSub('IP_STATUTORY_DOCS', item.key)}
                    className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                      ipDocsMode === item.key
                        ? 'bg-red-800 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <Suspense fallback={<EmbeddedLoading />}>
                {ipDocsMode === 'DOCS_HUB' && <OfficialStaffDocumentsHub />}
                {ipDocsMode === 'ACG61' && <Acg61ChargeReportView indiaPostOwnerAccess />}
                {ipDocsMode === 'ARTICLES' && <PostmanAllDayArticlesOverview embedded />}
              </Suspense>
            </div>
          )}

          {isIndiaPostWorkspace && activeSubMenu === 'IP_DAILY_OPS' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveSectionAndSub('IP_DAILY_OPS', 'VERIFICATION')}
                  className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                    ipDailyMode === 'VERIFICATION'
                      ? 'bg-red-800 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Daily Verification Console
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSectionAndSub('IP_DAILY_OPS', 'SURVEY')}
                  className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                    ipDailyMode === 'SURVEY'
                      ? 'bg-red-800 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Doorstep Survey Workflow
                </button>
              </div>
              <Suspense fallback={<EmbeddedLoading />}>
                {ipDailyMode === 'VERIFICATION' && <DailyVerificationView />}
                {ipDailyMode === 'SURVEY' && <DoorstepSurveyWorkflowView />}
              </Suspense>
            </div>
          )}

          {isIndiaPostWorkspace && activeSubMenu === 'IP_LMS_STOREFRONT' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveSectionAndSub('IP_LMS_STOREFRONT', 'LMS')}
                  className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                    ipLmsMode === 'LMS'
                      ? 'bg-red-800 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Postal Departmental LMS
                </button>
                {canAccessStandaloneStorefront(staffPermissionService.getActiveSession()) && (
                  <button
                    type="button"
                    onClick={() => setActiveSectionAndSub('IP_LMS_STOREFRONT', 'STOREFRONT')}
                    className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                      ipLmsMode === 'STOREFRONT'
                        ? 'bg-red-800 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    India Post Digital Storefront
                  </button>
                )}
              </div>
              <Suspense fallback={<EmbeddedLoading />}>
                {(ipLmsMode === 'LMS' || !canAccessStandaloneStorefront(staffPermissionService.getActiveSession())) && <PostalLMSView />}
                {canAccessStandaloneStorefront(staffPermissionService.getActiveSession()) && ipLmsMode === 'STOREFRONT' && <IndiaPostStorefrontView />}
              </Suspense>
            </div>
          )}

          {isIndiaPostWorkspace && activeSubMenu === 'IP_NOTIFICATIONS' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Bell size={16} className="text-red-700" />
                  <span>Broadcast Divisional Notice</span>
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!requirePinUnlocked()) return;
                    if (!divNotifTitle.trim() || !divNotifMessage.trim()) return;
                    notificationService.broadcastNotification({
                      title: divNotifTitle.trim(),
                      message: divNotifMessage.trim(),
                      senderName: activeProfile.ownerName,
                      category: 'CIRCULAR',
                      priority: 'High',
                      targetBeat: divNotifBeat,
                    });
                    setDivNotifTitle('');
                    setDivNotifMessage('');
                    showToast('ok', `Published divisional notice to ${divNotifBeat}.`);
                  }}
                  className="space-y-2.5 text-xs"
                >
                  <input
                    required
                    value={divNotifTitle}
                    onChange={(e) => setDivNotifTitle(e.target.value)}
                    placeholder="Circular Title *"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <select
                    value={divNotifBeat}
                    onChange={(e) => setDivNotifBeat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ALL">All Division Beats (1–34)</option>
                    {CONSOLIDATED_BEAT_MATRIX.slice(0, 12).map((b) => (
                      <option key={b.beatNumber} value={b.beatNumber}>
                        {b.beatNumber} · PIN {b.pincode}
                      </option>
                    ))}
                  </select>
                  <textarea
                    required
                    rows={3}
                    value={divNotifMessage}
                    onChange={(e) => setDivNotifMessage(e.target.value)}
                    placeholder="Circular details *"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-800 hover:bg-red-900 text-white font-semibold rounded-lg cursor-pointer"
                  >
                    Publish Notice
                  </button>
                </form>
              </div>

              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">
                    Divisional Circulars &amp; Alerts ({divisionalNotifications.length})
                  </h2>
                  <button
                    type="button"
                    onClick={() => notificationService.markAllAsRead(activeProfile.ownerName)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                  >
                    Mark All Read
                  </button>
                </div>
                <div className="divide-y divide-slate-100 text-xs max-h-[480px] overflow-y-auto">
                  {divisionalNotifications.map((n) => (
                    <div key={n.id} className="py-3 flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900">{n.title}</div>
                        <p className="text-slate-600">{n.message}</p>
                        <div className="text-[11px] font-mono text-slate-400">
                          {n.targetBeat || 'ALL'} · {n.senderName || 'Division'} ·{' '}
                          {new Date(n.timestamp).toLocaleString()}
                        </div>
                      </div>
                      {!n.isRead && (
                        <button
                          type="button"
                          onClick={() => notificationService.markAsRead(n.id, activeProfile.ownerName)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Brand Owner RBAC Modal ("Kisko Kaisa Role Dena Hai") */}
      {rbacModalMode && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-xl border border-slate-200 p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Shield size={15} className="text-blue-600" />
                  <span>
                    {rbacModalMode === 'CREATE'
                      ? `Onboard Team Member — ${activeProfile.brandName}`
                      : `Configure Role & Access — ${editingMember?.name}`}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Scoped strictly to {activeProfile.brandName} ({activeProfile.uniqueCode}). Tier 1 Master roles are blocked.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRbacModalMode(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveRbac} className="space-y-4 text-xs">
              {rbacModalMode === 'CREATE' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      required
                      value={rbacName}
                      onChange={(e) => setRbacName(e.target.value)}
                      placeholder="Staff Full Name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">10-Digit Mobile *</label>
                    <input
                      required
                      maxLength={10}
                      value={rbacContact}
                      onChange={(e) => setRbacContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98XXXXXXXX"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={rbacEmail}
                      onChange={(e) => setRbacEmail(e.target.value)}
                      placeholder="staff@brand.in"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Role Preset Selector */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Role Template Preset
                  </label>
                  <select
                    value={rbacPresetKey}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setRbacPresetKey('CUSTOM');
                      } else {
                        applyRolePreset(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium"
                  >
                    {BRAND_STAFF_ROLE_PRESETS.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                    <option value="CUSTOM">Custom Role Configuration</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Designation / Post *</label>
                    <input
                      required
                      value={rbacDesignation}
                      onChange={(e) => {
                        setRbacDesignation(e.target.value);
                        setRbacPresetKey('CUSTOM');
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Role Code</label>
                    <select
                      value={rbacRole}
                      onChange={(e) => {
                        setRbacRole(e.target.value);
                        setRbacPresetKey('CUSTOM');
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                    >
                      <option value="OFFICE_INCHARGE">OFFICE_INCHARGE</option>
                      <option value="LAST_MILE_SUPERVISOR">LAST_MILE_SUPERVISOR</option>
                      <option value="SALES_FIELD_STAFF">SALES_FIELD_STAFF</option>
                      <option value="POSTMAN">POSTMAN</option>
                      <option value="GDS">GDS</option>
                      <option value="SUB_POSTMASTER">SUB_POSTMASTER</option>
                      <option value="STAFF">STAFF</option>
                    </select>
                  </div>
                  {isIndiaPostWorkspace ? (
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Duty Category</label>
                      <select
                        value={rbacPostCategory}
                        onChange={(e) => setRbacPostCategory(e.target.value as IndiaPostDutyCategory)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      >
                        {DUTY_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Status</label>
                      <select
                        value={rbacStatus}
                        onChange={(e) => setRbacStatus(e.target.value as 'Active' | 'Inactive')}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive (Revoke Login)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assigned Office / Hub</label>
                    <input
                      list="brand-offices-list"
                      value={rbacOffice}
                      onChange={(e) => setRbacOffice(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                    <datalist id="brand-offices-list">
                      {scopedOffices.map((o) => (
                        <option key={o.officeId || o.id} value={o.officeName} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Beat / Territory</label>
                    <input
                      value={rbacBeat}
                      onChange={(e) => setRbacBeat(e.target.value)}
                      placeholder="Beat 1 or All Beats"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {rbacModalMode === 'CREATE' ? 'Login Password / PIN' : 'Reset Password / PIN'}
                    </label>
                    <input
                      type="text"
                      value={rbacPassword}
                      onChange={(e) => setRbacPassword(e.target.value)}
                      placeholder={rbacModalMode === 'CREATE' ? 'Default: Post@1234' : 'Leave blank to keep'}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>

                {isIndiaPostWorkspace && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                    <select
                      value={rbacStatus}
                      onChange={(e) => setRbacStatus(e.target.value as 'Active' | 'Inactive')}
                      className="w-full sm:w-56 px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="Active">Active (Login Permitted)</option>
                      <option value="Inactive">Inactive (Suspend Access)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Granular Sidenav Sections */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-800">
                  Sidenav Sections Visible in Staff Portal ({(rbacPermissions.allowedSections || []).length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_BRAND_STAFF_SECTIONS.map((sec) => {
                    const checked = (rbacPermissions.allowedSections || []).includes(sec.key);
                    return (
                      <label
                        key={sec.key}
                        className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer ${
                          checked
                            ? 'bg-blue-50/70 border-blue-300 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAllowedSection(sec.key)}
                          className="mt-0.5"
                        />
                        <div>
                          <div className="font-semibold">{sec.label}</div>
                          <div className="text-[11px] text-slate-500">{sec.shortDesc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Granular Action Flags */}
              <div className="space-y-2">
                <div className="font-semibold text-slate-800">Granular Action Permissions</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'canViewAllBrandCustomers', label: 'View All Brand Customers (Override Beat)' },
                    { key: 'canCreateCustomerOrLead', label: 'Create Customers & Leads' },
                    { key: 'canEditCustomer', label: 'Edit Existing Customer Details' },
                    { key: 'canManageSrmOrTasks', label: 'Update Tasks & SRM Ticket Status' },
                    { key: 'canViewOpsQueue', label: 'View Operations & SRM Queue' },
                    { key: 'canExportReports', label: 'Download Brand CSV Exports' },
                  ].map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean((rbacPermissions as any)[perm.key])}
                        onChange={(e) =>
                          setRbacPermissions((prev) => ({
                            ...prev,
                            [perm.key]: e.target.checked,
                          }))
                        }
                      />
                      <span className="text-slate-700">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRbacModalMode(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                >
                  {rbacModalMode === 'CREATE' ? 'Create Staff & Assign Role' : 'Save Role & Permissions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline PIN Re-Unlock Modal */}
      {showPinGate && brandSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock size={15} className="text-blue-600" />
                <span>Verify 4–6 Digit Security PIN</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPinGate(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            {pinError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {pinError}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPinError(null);
                const res = brandOwnerService.verifyBrandPasscode(brandSession.brandProfileId, pinInput);
                if ('error' in res) {
                  setPinError(res.error);
                  return;
                }
                setShowPinGate(false);
                setPinInput('');
                showToast('ok', 'Sensitive store and customer actions unlocked.');
              }}
              className="space-y-3 text-xs"
            >
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                required
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 4–6 digit PIN"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono tracking-widest text-base tabular-nums"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold cursor-pointer"
              >
                Unlock Actions
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
