import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  Building2,
  CheckCircle2,
  Download,
  Lock,
  LogOut,
  Menu,
  Phone,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Ticket,
  Unlock,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../components/auth/FirebaseAuthProvider';
import { brandOwnerService } from '../services/brandOwnerService';
import { customerService } from '../services/customerService';
import { featureVisibilityService } from '../services/featureVisibilityService';
import { kotaOsHierarchyService } from '../services/kotaOsHierarchyService';
import {
  MAX_OPERATIONAL_STAFF_COUNT,
  staffPermissionService,
} from '../services/staffPermissionService';
import { exportCsvWithBom, xpeedoOpsService } from '../services/xpeedoOpsService';
import { POSTAL_PRODUCTS } from '../data/productsData';
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
import IndiaPostStaffRolesPromotionsView from '../components/xpeedo/IndiaPostStaffRolesPromotionsView';
import ThreeLevelSidebar from '../components/navigation/ThreeLevelSidebar';
import BrandStaffManagementPanel from '../components/xpeedo/BrandStaffManagementPanel';

const OfficeMasterView = lazy(() => import('../components/crm/OfficeMasterView'));
const BeatManagementView = lazy(() => import('../components/crm/BeatManagementView'));
const UnifiedPropertyFamilyHub = lazy(() => import('../components/crm/UnifiedPropertyFamilyHub'));
const LocationIntelligenceHub = lazy(() => import('../components/crm/LocationIntelligenceHub'));
const DataQualityView = lazy(() => import('../components/crm/DataQualityView'));
const AddressResolutionView = lazy(() => import('../components/crm/AddressResolutionView'));
const ServicesCatalogView = lazy(() => import('../components/crm/ServicesCatalogView'));
const OfficialStaffDocumentsHub = lazy(() => import('../components/crm/OfficialStaffDocumentsHub'));
const Acg61ChargeReportView = lazy(() => import('../components/crm/Acg61ChargeReportView'));
const PostalLMSView = lazy(() => import('../components/crm/PostalLMSView'));
const IndiaPostStorefrontView = lazy(() => import('../components/crm/IndiaPostStorefrontView'));
const DailyVerificationView = lazy(() => import('../components/postman/DailyVerificationView'));
const DoorstepSurveyWorkflowView = lazy(() => import('../components/postman/DoorstepSurveyWorkflowView'));
const PostmanAllDayArticlesOverview = lazy(() => import('../components/postman/PostmanAllDayArticlesOverview'));

type BrandActiveSectionKey = BrandPortalSubMenuKey | IndiaPostConsolidatedSectionKey;

const INDIA_POST_CONSOLIDATED_MENUS: Array<{
  key: IndiaPostConsolidatedSectionKey;
  label: string;
}> = [
  { key: 'IP_HIERARCHY', label: 'Org Hierarchy Tree' },
  { key: 'IP_OFFICES', label: 'Offices Master' },
  { key: 'IP_BEATS', label: 'Delivery Beats & PIN' },
  { key: 'IP_PROPERTIES', label: '10-Level Property & Geo' },
  { key: 'IP_STAFF_ROLES', label: 'Staff Roles & Promotions' },
  { key: 'IP_SRM', label: 'SRM & Escalations' },
  { key: 'IP_CRM_SCHEMES', label: 'Postal Schemes & Leads' },
  { key: 'IP_STATUTORY_DOCS', label: 'Statutory Docs & ACG-61' },
  { key: 'IP_DAILY_OPS', label: 'Daily Verification & Surveys' },
  { key: 'IP_LMS_STOREFRONT', label: 'Postal LMS & Storefront' },
];

const INDIA_POST_KEY_SET = new Set<string>(INDIA_POST_CONSOLIDATED_MENUS.map((m) => m.key));
const CORE_KEY_SET = new Set<string>(ALL_BRAND_PORTAL_SUBMENUS.map((m) => m.key));

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

  const [, setTick] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [retailServicesActive, setRetailServicesActive] = useState<boolean>(() =>
    featureVisibilityService.isRetailServicesActive()
  );

  const initialTab = (() => {
    const t = (searchParams.get('tab') || '').toUpperCase();
    if (CORE_KEY_SET.has(t) || INDIA_POST_KEY_SET.has(t)) {
      return t as BrandActiveSectionKey;
    }
    return 'OVERVIEW' as BrandActiveSectionKey;
  })();

  const [activeSubMenu, setActiveSubMenuState] = useState<BrandActiveSectionKey>(initialTab);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Embedded India Post sub-switchers
  const [ipGeoMode, setIpGeoMode] = useState<'FAMILY_HUB' | 'LOCATION_INTEL' | 'DATA_QUALITY' | 'ADDRESS'>('FAMILY_HUB');
  const [ipDocsMode, setIpDocsMode] = useState<'DOCS_HUB' | 'ACG61' | 'ARTICLES'>('DOCS_HUB');
  const [ipDailyMode, setIpDailyMode] = useState<'VERIFICATION' | 'SURVEY'>('VERIFICATION');
  const [ipLmsMode, setIpLmsMode] = useState<'LMS' | 'STOREFRONT'>('LMS');

  const applySubModeForTab = (tab: BrandActiveSectionKey, sub?: string | null) => {
    const cleanSub = (sub || '').toUpperCase();
    if (!cleanSub) return;
    if (
      tab === 'IP_PROPERTIES' &&
      (cleanSub === 'FAMILY_HUB' ||
        cleanSub === 'LOCATION_INTEL' ||
        cleanSub === 'DATA_QUALITY' ||
        cleanSub === 'ADDRESS')
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
      if (cleanSub === 'STOREFRONT' && retailServicesActive) {
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
    const t = (searchParams.get('tab') || '').toUpperCase();
    const s = searchParams.get('sub');
    if (CORE_KEY_SET.has(t) || INDIA_POST_KEY_SET.has(t)) {
      if (t !== activeSubMenu) {
        setActiveSubMenuState(t as BrandActiveSectionKey);
      }
      if (s) {
        applySubModeForTab(t as BrandActiveSectionKey, s);
      }
    }
  }, [searchParams, activeSubMenu, retailServicesActive]);

  useEffect(() => {
    if (!retailServicesActive && ipLmsMode === 'STOREFRONT') {
      setIpLmsMode('LMS');
    }
  }, [retailServicesActive, ipLmsMode]);

  // PIN Unlock Modal / Inline Gate state
  const [showPinGate, setShowPinGate] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

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
    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
      u6();
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

  // Keep active section valid for the current brand
  useEffect(() => {
    if (!activeProfile) return;
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
  }, [activeProfile, activeSubMenu, isIndiaPostWorkspace]);

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
    [activeProfile]
  );
  const scopedOffices = useMemo(
    () => (activeProfile ? brandOwnerService.getBrandScopedOffices(activeProfile) : []),
    [activeProfile]
  );
  const scopedStaffRbac = useMemo(
    () => (activeProfile ? brandOwnerService.getBrandTeamMembersWithRbac(activeProfile.id) : []),
    [activeProfile]
  );
  const scopedLeads = useMemo(
    () => (activeProfile ? brandOwnerService.getBrandScopedLeads(activeProfile) : []),
    [activeProfile]
  );
  const scopedOps = useMemo(
    () =>
      activeProfile
        ? brandOwnerService.getBrandScopedOperations(activeProfile)
        : { projects: [], tasks: [], workReports: [], srmTickets: [] },
    [activeProfile]
  );
  const hierarchyNodes = useMemo(
    () => (isIndiaPostWorkspace ? kotaOsHierarchyService.getOrgHierarchyNodes() : []),
    [isIndiaPostWorkspace]
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

  const coreStaffFiveCount = staffPermissionService.getOperationalStaffFive().length;
  const isCoreStaffCapReached = coreStaffFiveCount >= MAX_OPERATIONAL_STAFF_COUNT;

  const openCreateRbacModal = () => {
    if (!requirePinUnlocked()) return;
    if (isCoreStaffCapReached) {
      showToast(
        'err',
        'All 5 operational staff slots (Staff 1–Staff 5) are active. Use the Staff Allocation panel below to assign an existing staff slot to this brand.'
      );
      return;
    }
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
    m.key === 'STAFF'
      ? { ...m, label: 'Staff Management & RBAC' }
      : m.key === 'OVERVIEW'
      ? { ...m, label: 'Dashboard' }
      : m
  );

  const currentSectionLabel =
    configuredMenus.find((m) => m.key === activeSubMenu)?.label ||
    INDIA_POST_CONSOLIDATED_MENUS.find((m) => m.key === activeSubMenu)?.label ||
    'Dashboard';

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

  const filteredStaff = scopedStaffRbac.filter((s) => {
    const q = staffSearch.trim().toLowerCase();
    if (!q) return true;
    return `${s.name} ${s.contact || ''} ${s.employeeId || ''} ${s.designation} ${s.assignedOffice || ''} ${s.beat || ''}`
      .toLowerCase()
      .includes(q);
  });

  const currentSubModeKey =
    activeSubMenu === 'IP_PROPERTIES'
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
    isIndiaPost: isIndiaPostWorkspace,
    retailServicesActive,
    configuredOwnerSubMenus: activeProfile.subMenuItems,
    counts: {
      stores: scopedOffices.length,
      team: scopedStaffRbac.length,
      customers: scopedCustomers.length,
      tasks: scopedOps.tasks.length,
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
              <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                <div className="p-5">
                  <div className="text-xs font-medium text-slate-500">Offices / Stores</div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                    {scopedOffices.length}
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs font-medium text-slate-500">Brand Team Members</div>
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
            </div>
          )}

          {activeSubMenu === 'OFFICES_STORES' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Offices &amp; Stores ({filteredOffices.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Strictly isolated to {activeProfile.brandName} ({activeProfile.workspaceKey}).
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
                    <span>Add Office / Store</span>
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
                    placeholder="Office or Store Name *"
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
                    No offices or stores assigned to {activeProfile.brandName} yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-3 px-4">Office / Store Name</th>
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

          {/* TEAM & ROLE ACCESS (BRAND OWNER RBAC) */}
          {activeSubMenu === 'STAFF' && (
            <div className="space-y-5">
              <BrandStaffManagementPanel
                brandSlug={activeProfile.partnerSlug}
                brandName={activeProfile.brandName}
                actorName={activeProfile.ownerName}
                accentColor={activeProfile.accentColor}
              />

              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-mono uppercase text-blue-700 font-semibold">
                    Brand Owner RBAC Control · {activeProfile.brandName}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">
                    Team Members, Role Assignment &amp; Sidenav Permissions ({filteredStaff.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Decide which staff member gets which Role, Office/Beat scope, Sidenav sections, and action permissions. Changes sync live to Brand Staff logins.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      placeholder="Search staff, role, office, beat..."
                      className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  {isIndiaPostWorkspace && (
                    <button
                      type="button"
                      onClick={() => setActiveSubMenu('IP_STAFF_ROLES')}
                      className="px-3 py-2 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Award size={14} />
                      <span>Postal Roles &amp; Promotions</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={openCreateRbacModal}
                    disabled={isCoreStaffCapReached}
                    title={
                      isCoreStaffCapReached
                        ? 'All 5 operational staff slots (Staff 1–Staff 5) are active'
                        : 'Onboard operational staff'
                    }
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap ${
                      isCoreStaffCapReached
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                    }`}
                  >
                    <Plus size={14} />
                    <span>
                      {isCoreStaffCapReached
                        ? '5/5 Staff Slots Allocated'
                        : 'Onboard Team Member & Assign Role'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {filteredStaff.length === 0 ? (
                  <div className="p-10 text-center space-y-2">
                    <p className="text-xs font-semibold text-slate-700">
                      No operational staff currently assigned to {activeProfile.brandName}.
                    </p>
                    <p className="text-xs text-slate-500">
                      Click &ldquo;Onboard Team Member &amp; Assign Role&rdquo; above to invite and configure your first team member.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                          <th className="py-3 px-4">Team Member</th>
                          <th className="py-3 px-4">Role &amp; Post</th>
                          <th className="py-3 px-4">Office &amp; Beat</th>
                          <th className="py-3 px-4">Sidenav Access</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Manage RBAC</th>
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
                              <div className="text-[11px] font-mono text-slate-500">{m.beat || '—'}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-mono text-[11px] text-slate-700">
                                {(m.permissions.allowedSections || []).length} / {ALL_BRAND_STAFF_SECTIONS.length} sections
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {m.permissions.canViewAllBrandCustomers ? 'All Customers' : 'Beat Scoped'}
                                {m.permissions.canExportReports ? ' · CSV Export' : ''}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold ${
                                  m.status === 'Inactive'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {m.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => openEditRbacModal(m)}
                                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <Shield size={12} />
                                <span>Configure Role &amp; Access</span>
                              </button>
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

          {activeSubMenu === 'OPERATIONS_TASKS' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Operations &amp; Tasks ({scopedOps.tasks.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Execution tasks and sector workflows scoped to {activeProfile.workspaceKey}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (requirePinUnlocked()) setShowAddTask((s) => !s);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>New Task</span>
                  </button>
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

          {/* CONSOLIDATED INDIA POST KOTA DIVISION MODULES (STRICTLY WHEN workspaceKey === 'INDIA_POST') */}
          {isIndiaPostWorkspace && activeSubMenu === 'IP_HIERARCHY' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    India Post Postal Hierarchy Tree ({hierarchyNodes.length} nodes)
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

          {isIndiaPostWorkspace && activeSubMenu === 'IP_OFFICES' && (
            <Suspense fallback={<EmbeddedLoading />}>
              <OfficeMasterView indiaPostOwnerAccess />
            </Suspense>
          )}

          {isIndiaPostWorkspace && activeSubMenu === 'IP_BEATS' && (
            <Suspense fallback={<EmbeddedLoading />}>
              <BeatManagementView indiaPostOwnerAccess />
            </Suspense>
          )}

          {isIndiaPostWorkspace && activeSubMenu === 'IP_PROPERTIES' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 text-xs">
                {[
                  { key: 'FAMILY_HUB', label: 'Unified Property & Family Hub' },
                  { key: 'LOCATION_INTEL', label: '11-Level Geo Hub & Privacy Map' },
                  { key: 'DATA_QUALITY', label: 'Duplicate & Data Quality Audit' },
                  { key: 'ADDRESS', label: 'Address Resolution Engine' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setIpGeoMode(item.key as any)}
                    className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                      ipGeoMode === item.key
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <Suspense fallback={<EmbeddedLoading />}>
                {ipGeoMode === 'FAMILY_HUB' && <UnifiedPropertyFamilyHub indiaPostOwnerAccess />}
                {ipGeoMode === 'LOCATION_INTEL' && <LocationIntelligenceHub indiaPostOwnerAccess />}
                {ipGeoMode === 'DATA_QUALITY' && <DataQualityView />}
                {ipGeoMode === 'ADDRESS' && <AddressResolutionView />}
              </Suspense>
            </div>
          )}

          {isIndiaPostWorkspace && activeSubMenu === 'IP_STAFF_ROLES' && (
            <IndiaPostStaffRolesPromotionsView actorOverride={activeProfile.ownerName} />
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

          {isIndiaPostWorkspace && activeSubMenu === 'IP_CRM_SCHEMES' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <h2 className="text-sm font-bold text-slate-900">
                    Postal Products &amp; Schemes Master ({POSTAL_PRODUCTS.length})
                  </h2>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs">
                    {POSTAL_PRODUCTS.map((p) => (
                      <div key={p.id} className="py-2 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">{p.name}</div>
                          <div className="text-slate-500">{p.category} · {p.interestRateOrBonus}</div>
                        </div>
                        <span className="font-mono text-red-800 font-semibold">{p.code}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                  <h2 className="text-sm font-bold text-slate-900">
                    India Post Scheme Leads ({scopedLeads.length})
                  </h2>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs">
                    {scopedLeads.slice(0, 40).map((l) => (
                      <div key={l.id} className="py-2 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">
                            {l.customerName} · {l.productName}
                          </div>
                          <div className="text-slate-500">
                            {l.beatNo || 'No Beat'} · {l.assignedStaffName || 'Pool'}
                          </div>
                        </div>
                        <span className="font-mono font-semibold text-blue-700">{l.stage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Suspense fallback={<EmbeddedLoading />}>
                <ServicesCatalogView />
              </Suspense>
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
                    onClick={() => setIpDocsMode(item.key as any)}
                    className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                      ipDocsMode === item.key
                        ? 'bg-slate-900 text-white'
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
                  onClick={() => setIpDailyMode('VERIFICATION')}
                  className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                    ipDailyMode === 'VERIFICATION'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Daily Verification Console
                </button>
                <button
                  type="button"
                  onClick={() => setIpDailyMode('SURVEY')}
                  className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                    ipDailyMode === 'SURVEY'
                      ? 'bg-slate-900 text-white'
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
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Postal Departmental LMS
                </button>
                {retailServicesActive && (
                  <button
                    type="button"
                    onClick={() => setActiveSectionAndSub('IP_LMS_STOREFRONT', 'STOREFRONT')}
                    className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                      ipLmsMode === 'STOREFRONT'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    India Post Digital Storefront
                  </button>
                )}
              </div>
              <Suspense fallback={<EmbeddedLoading />}>
                {(ipLmsMode === 'LMS' || !retailServicesActive) && <PostalLMSView />}
                {retailServicesActive && ipLmsMode === 'STOREFRONT' && <IndiaPostStorefrontView />}
              </Suspense>
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
