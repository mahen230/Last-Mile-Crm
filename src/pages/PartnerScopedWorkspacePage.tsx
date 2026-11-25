import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Award,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Edit2,
  ExternalLink,
  FolderKanban,
  Layers,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  Plus,
  Route,
  Search,
  Shield,
  ShieldCheck,
  Store as StoreIcon,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  AcademyCourse,
  AcademyProgress,
  BrandFollowUpTask,
  BrandVerificationInquiry,
  Customer,
  Lead,
  LeadStage,
  PartnerAuthSession,
  PartnerLifecycleStatus,
  PartnerTeamPermissions,
  PartnerTeamRole,
  PropertyRecord,
  SanitizedPartnerTeamMember,
  Store,
  StoreCrmRecord,
  StoreCrmStage,
} from '../types/models';
import {
  DEFAULT_ROLE_PERMISSIONS,
  PartnerPublicBranding,
  partnerBrandService,
} from '../services/partnerBrandService';
import { propertyRegistryService } from '../services/propertyRegistryService';
import { customerService } from '../services/customerService';
import { academyTrainingService } from '../services/academyTrainingService';
import { featureVisibilityService } from '../services/featureVisibilityService';
import { notificationService, SystemNotification } from '../services/notificationService';
import { POSTAL_PRODUCTS } from '../data/productsData';
import { CONSOLIDATED_BEAT_MATRIX } from '../data/consolidatedBeatMatrix';
import { buildBrandPortalNav } from '../data/navigationHierarchy';
import {
  PartnerBrandLogo,
  resolveBrandTheme,
} from '../components/common/PartnerBrandLogo';
import { useAuth } from '../components/auth/FirebaseAuthProvider';
import { staffPermissionService } from '../services/staffPermissionService';
import { brandOwnerService } from '../services/brandOwnerService';
import { kotaOsHierarchyService } from '../services/kotaOsHierarchyService';
import { xpeedoOpsService } from '../services/xpeedoOpsService';
import ThreeLevelSidebar from '../components/navigation/ThreeLevelSidebar';
import BrandStaffManagementPanel from '../components/xpeedo/BrandStaffManagementPanel';

const OfficeMasterView = lazy(() => import('../components/crm/OfficeMasterView'));
const BeatManagementView = lazy(() => import('../components/crm/BeatManagementView'));
const UnifiedPropertyFamilyHub = lazy(() => import('../components/crm/UnifiedPropertyFamilyHub'));
const LocationIntelligenceHub = lazy(() => import('../components/crm/LocationIntelligenceHub'));
const DataQualityView = lazy(() => import('../components/crm/DataQualityView'));
const AddressResolutionView = lazy(() => import('../components/crm/AddressResolutionView'));
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

function EmbeddedModuleLoading() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500">
      Loading module...
    </div>
  );
}

type WorkspaceTab =
  | 'DASHBOARD'
  | 'CUSTOMERS'
  | 'LEADS'
  | 'FOLLOW_UPS'
  | 'PROPERTIES'
  | 'MASTER_SEARCH'
  | 'VERIFICATION'
  | 'DEPARTMENTS_APPROVALS'
  | 'STORES'
  | 'RBAC_TEAM'
  | 'MASTER_ROLE'
  | 'PROMOTION_MASTER'
  | 'PRODUCTS'
  | 'ACADEMY'
  | 'NOTIFICATIONS'
  | 'IP_HIERARCHY'
  | 'IP_GEO_QUALITY'
  | 'IP_SRM'
  | 'IP_STATUTORY_DOCS'
  | 'IP_DAILY_OPS'
  | 'IP_LMS_STOREFRONT'
  | 'IP_NOTIFICATIONS';

const VALID_WORKSPACE_TABS = new Set<string>([
  'DASHBOARD',
  'CUSTOMERS',
  'LEADS',
  'FOLLOW_UPS',
  'PROPERTIES',
  'MASTER_SEARCH',
  'VERIFICATION',
  'DEPARTMENTS_APPROVALS',
  'STORES',
  'RBAC_TEAM',
  'MASTER_ROLE',
  'PROMOTION_MASTER',
  'PRODUCTS',
  'ACADEMY',
  'NOTIFICATIONS',
  'IP_HIERARCHY',
  'IP_GEO_QUALITY',
  'IP_SRM',
  'IP_STATUTORY_DOCS',
  'IP_DAILY_OPS',
  'IP_LMS_STOREFRONT',
  'IP_NOTIFICATIONS',
]);

const XPOKART_ALLOWED_TABS = new Set<WorkspaceTab>([
  'DASHBOARD',
  'PRODUCTS',
  'CUSTOMERS',
  'LEADS',
  'FOLLOW_UPS',
  'NOTIFICATIONS',
]);

function resolveLegacyPartnerTab(
  rawTab: string,
  rawSub?: string | null
): { tab: WorkspaceTab; sub?: string } | null {
  const t = (rawTab || '').trim().toUpperCase();
  const s = (rawSub || '').trim().toUpperCase();
  if (!t) return null;

  if (t === 'IP_MASTER_SEARCH') return { tab: 'MASTER_SEARCH' };
  if (t === 'IP_OFFICES') return { tab: 'STORES', sub: 'OFFICES' };
  if (t === 'IP_BEATS') return { tab: 'STORES', sub: 'BEATS' };
  if (t === 'IP_STAFF_ROLES') return { tab: 'PROMOTION_MASTER' };
  if (t === 'IP_CRM_SCHEMES') return { tab: 'LEADS' };
  if (t === 'IP_PROPERTIES') {
    if (s === 'LOCATION_INTEL' || s === 'DATA_QUALITY' || s === 'ADDRESS') {
      return { tab: 'IP_GEO_QUALITY', sub: s };
    }
    return { tab: 'PROPERTIES' };
  }

  if (VALID_WORKSPACE_TABS.has(t)) {
    return { tab: t as WorkspaceTab, sub: s || undefined };
  }
  return null;
}

interface BrandCatalogItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  priceOrTariff: string;
  description: string;
  updatedAt: string;
}

const CRM_STAGES: StoreCrmStage[] = [
  'New',
  'In Follow-Up',
  'Qualified',
  'Converted',
  'Closed',
];

const LEAD_STAGES: LeadStage[] = [
  'New',
  'Contacted',
  'Follow-up Scheduled',
  'Documentation Pending',
  'Under Processing',
  'Converted - Product Opened',
  'Closed / Lost',
];

const ROLE_LABELS: Record<PartnerTeamRole, string> = {
  PARTNER_OWNER: 'Brand / Partner Owner',
  STORE_MANAGER: 'Hub / Store Manager',
  SALES_EXECUTIVE: 'Field / B2B Sales Executive',
  CRM_OPERATOR: 'CRM / Office Operator',
  SUPPORT_DESK: 'Support & Verification Desk',
};

const EDITABLE_ROLES: PartnerTeamRole[] = [
  'STORE_MANAGER',
  'SALES_EXECUTIVE',
  'CRM_OPERATOR',
  'SUPPORT_DESK',
];

const PROPERTY_TYPES: PropertyRecord['propertyType'][] = [
  'Residential',
  'Commercial',
  'Mixed',
  'Flat',
];

const VERIFICATION_STATUSES: BrandVerificationInquiry['status'][] = [
  'New Inquiry',
  'Verification Pending',
  'Verified',
  'Completed',
];

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function downloadCsvFile(filename: string, csvWithBom: string): void {
  const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function PartnerScopedWorkspacePage() {
  const { partnerSlug = '' } = useParams<{ partnerSlug: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userProfile } = useAuth();
  const isAdminOrDev = useMemo(
    () =>
      staffPermissionService.isSuperAdmin(userProfile) ||
      staffPermissionService.isDesignatedMasterAdmin(userProfile) ||
      staffPermissionService.isDeveloperRole(userProfile),
    [userProfile]
  );

  const [session, setSession] = useState<PartnerAuthSession | null>(() =>
    partnerBrandService.getActivePartnerSession(partnerSlug)
  );
  const [branding, setBranding] = useState<PartnerPublicBranding | null>(() =>
    partnerBrandService.getPartnerPublicBranding(partnerSlug)
  );

  const [stores, setStores] = useState<Store[]>([]);
  const [team, setTeam] = useState<SanitizedPartnerTeamMember[]>([]);
  const [crmRecords, setCrmRecords] = useState<StoreCrmRecord[]>([]);
  const [brandCustomers, setBrandCustomers] = useState<Customer[]>([]);
  const [brandLeads, setBrandLeads] = useState<Lead[]>([]);
  const [brandFollowUps, setBrandFollowUps] = useState<BrandFollowUpTask[]>([]);
  const [brandProperties, setBrandProperties] = useState<PropertyRecord[]>([]);
  const [verifications, setVerifications] = useState<BrandVerificationInquiry[]>([]);
  const [academyCourses, setAcademyCourses] = useState<AcademyCourse[]>([]);
  const [academyProgress, setAcademyProgress] = useState<AcademyProgress[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [customCatalog, setCustomCatalog] = useState<BrandCatalogItem[]>([]);

  const [retailActive, setRetailActive] = useState<boolean>(() =>
    featureVisibilityService.isRetailServicesActive()
  );

  const resolvedInitialTab = resolveLegacyPartnerTab(
    searchParams.get('tab') || '',
    searchParams.get('sub')
  );
  const [activeTab, setActiveTabState] = useState<WorkspaceTab>(
    resolvedInitialTab?.tab || 'DASHBOARD'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [officeMasterMode, setOfficeMasterMode] = useState<'OFFICES' | 'BEATS'>(
    resolvedInitialTab?.sub === 'BEATS' ? 'BEATS' : 'OFFICES'
  );
  const [ipGeoMode, setIpGeoMode] = useState<'LOCATION_INTEL' | 'DATA_QUALITY' | 'ADDRESS'>(
    resolvedInitialTab?.sub === 'DATA_QUALITY' || resolvedInitialTab?.sub === 'ADDRESS'
      ? (resolvedInitialTab.sub as 'DATA_QUALITY' | 'ADDRESS')
      : 'LOCATION_INTEL'
  );
  const [ipDocsMode, setIpDocsMode] = useState<'DOCS_HUB' | 'ACG61' | 'ARTICLES'>('DOCS_HUB');
  const [ipDailyMode, setIpDailyMode] = useState<'VERIFICATION' | 'SURVEY'>('VERIFICATION');
  const [ipLmsMode, setIpLmsMode] = useState<'LMS' | 'STOREFRONT'>('LMS');
  const [promoSelectedStaffId, setPromoSelectedStaffId] = useState<string>('');
  const [opsVersion, setOpsVersion] = useState(0);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptHead, setNewDeptHead] = useState('');
  const [divNotifTitle, setDivNotifTitle] = useState('');
  const [divNotifMessage, setDivNotifMessage] = useState('');
  const [divNotifBeat, setDivNotifBeat] = useState('ALL');
  const [staffSearch, setStaffSearch] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('ALL');
  const [staffStatusFilter, setStaffStatusFilter] = useState<'ALL' | 'Active' | 'Deactivated'>('ALL');
  const [staffBeatFilter, setStaffBeatFilter] = useState<string>('ALL');

  const applySubModeForTab = (tab: WorkspaceTab, sub?: string | null) => {
    const cleanSub = (sub || '').toUpperCase();
    if (!cleanSub) return;
    if (tab === 'STORES' && (cleanSub === 'OFFICES' || cleanSub === 'BEATS')) {
      setOfficeMasterMode(cleanSub);
    } else if (
      tab === 'IP_GEO_QUALITY' &&
      (cleanSub === 'LOCATION_INTEL' ||
        cleanSub === 'DATA_QUALITY' ||
        cleanSub === 'ADDRESS')
    ) {
      setIpGeoMode(cleanSub);
    } else if (
      tab === 'IP_STATUTORY_DOCS' &&
      (cleanSub === 'DOCS_HUB' || cleanSub === 'ACG61' || cleanSub === 'ARTICLES')
    ) {
      setIpDocsMode(cleanSub);
    } else if (tab === 'IP_DAILY_OPS' && (cleanSub === 'VERIFICATION' || cleanSub === 'SURVEY')) {
      setIpDailyMode(cleanSub);
    } else if (tab === 'IP_LMS_STOREFRONT') {
      if (cleanSub === 'STOREFRONT' && retailActive) {
        setIpLmsMode('STOREFRONT');
      } else {
        setIpLmsMode('LMS');
      }
    }
  };

  const setActiveTabAndSub = (next: WorkspaceTab, subMode?: string) => {
    setActiveTabState(next);
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
    setMobileMenuOpen(false);
  };

  const setActiveTab = (next: WorkspaceTab) => {
    setActiveTabAndSub(next);
  };

  useEffect(() => {
    const resolved = resolveLegacyPartnerTab(
      searchParams.get('tab') || '',
      searchParams.get('sub')
    );
    if (resolved) {
      if (resolved.tab !== activeTab) {
        setActiveTabState(resolved.tab);
      }
      if (resolved.sub) {
        applySubModeForTab(resolved.tab, resolved.sub);
      }
    }
  }, [searchParams, activeTab, retailActive]);

  useEffect(() => {
    if (!retailActive && ipLmsMode === 'STOREFRONT') {
      setIpLmsMode('LMS');
    }
  }, [retailActive, ipLmsMode]);

  const [storeFilter, setStoreFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<'ALL' | StoreCrmStage>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [followUpBucket, setFollowUpBucket] = useState<'DUE_TODAY' | 'OVERDUE' | 'UPCOMING' | 'COMPLETED'>('DUE_TODAY');
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  // Add Store CRM / Brand Customer Modal
  const [showAddCrmModal, setShowAddCrmModal] = useState(false);
  const [crmStoreId, setCrmStoreId] = useState('');
  const [crmCustomerName, setCrmCustomerName] = useState('');
  const [crmCustomerPhone, setCrmCustomerPhone] = useState('');
  const [crmPincode, setCrmPincode] = useState('324009');
  const [crmColony, setCrmColony] = useState('');
  const [crmCategory, setCrmCategory] = useState('General');
  const [crmPropertyId, setCrmPropertyId] = useState('');
  const [crmService, setCrmService] = useState('');
  const [crmStage, setCrmStage] = useState<StoreCrmStage>('New');
  const [crmAssigneeId, setCrmAssigneeId] = useState('');
  const [crmNotes, setCrmNotes] = useState('');

  // Edit CRM Record Modal
  const [editingCrm, setEditingCrm] = useState<StoreCrmRecord | null>(null);
  const [editCrmStage, setEditCrmStage] = useState<StoreCrmStage>('New');
  const [editCrmNotes, setEditCrmNotes] = useState('');
  const [editCrmAssigneeId, setEditCrmAssigneeId] = useState('');

  // Add Lead Modal
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [leadCustName, setLeadCustName] = useState('');
  const [leadCustMobile, setLeadCustMobile] = useState('');
  const [leadProductCode, setLeadProductCode] = useState('');
  const [leadProductName, setLeadProductName] = useState('');
  const [leadRequirement, setLeadRequirement] = useState('');
  const [leadPriority, setLeadPriority] = useState<Lead['priority']>('High');
  const [leadPincode, setLeadPincode] = useState('324009');
  const [leadPropertyId, setLeadPropertyId] = useState('');
  const [leadCategory, setLeadCategory] = useState('General');

  // Add Follow-Up Modal
  const [showAddFollowUpModal, setShowAddFollowUpModal] = useState(false);
  const [fuCustName, setFuCustName] = useState('');
  const [fuCustPhone, setFuCustPhone] = useState('');
  const [fuPropertyId, setFuPropertyId] = useState('');
  const [fuCategory, setFuCategory] = useState('General');
  const [fuPriority, setFuPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [fuDueDate, setFuDueDate] = useState(getTodayIsoDate());
  const [fuNextAction, setFuNextAction] = useState('');
  const [fuNote, setFuNote] = useState('');

  // Add / Edit Property Modal
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [propEditingId, setPropEditingId] = useState<string | null>(null);
  const [propCode, setPropCode] = useState('');
  const [propType, setPropType] = useState<PropertyRecord['propertyType']>('Residential');
  const [propBeatPin, setPropBeatPin] = useState('324009');
  const [propOfficeId, setPropOfficeId] = useState('DADABARI_SO');
  const [propAddress, setPropAddress] = useState('');
  const [propLandmark, setPropLandmark] = useState('');
  const [propGeoTag, setPropGeoTag] = useState('');
  const [propOccupancy, setPropOccupancy] = useState('Owner Occupied');
  const [propUnitNotes, setPropUnitNotes] = useState('');
  const [propCategory, setPropCategory] = useState('General');

  // Add Verification Inquiry Modal
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [vfCustName, setVfCustName] = useState('');
  const [vfCustPhone, setVfCustPhone] = useState('');
  const [vfBeatPin, setVfBeatPin] = useState('324009');
  const [vfPropertyId, setVfPropertyId] = useState('');
  const [vfTopic, setVfTopic] = useState('');
  const [vfCategory, setVfCategory] = useState('General');
  const [vfDetails, setVfDetails] = useState('');

  // Add Store Modal (for Brand Owners)
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStorePincode, setNewStorePincode] = useState('324009');
  const [newStoreBeat, setNewStoreBeat] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStoreManager, setNewStoreManager] = useState('');

  // Edit Store Modal
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [editStoreManager, setEditStoreManager] = useState('');
  const [editStorePhone, setEditStorePhone] = useState('');
  const [editStoreAddress, setEditStoreAddress] = useState('');
  const [editStoreStatus, setEditStoreStatus] = useState<PartnerLifecycleStatus>('Active');

  // Add Team Member Modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [tmName, setTmName] = useState('');
  const [tmEmail, setTmEmail] = useState('');
  const [tmPhone, setTmPhone] = useState('');
  const [tmRole, setTmRole] = useState<PartnerTeamRole>('CRM_OPERATOR');
  const [tmStoreIds, setTmStoreIds] = useState<string[]>([]);
  const [tmPasscode, setTmPasscode] = useState('');
  const [tmIsNonTerritory, setTmIsNonTerritory] = useState(false);
  const [tmCategoriesText, setTmCategoriesText] = useState('');
  const [tmBeatOrPin, setTmBeatOrPin] = useState('');
  const [tmPerms, setTmPerms] = useState<PartnerTeamPermissions>({
    ...DEFAULT_ROLE_PERMISSIONS.CRM_OPERATOR,
  });

  // Edit / Approve Team Member Modal
  const [editingMember, setEditingMember] = useState<SanitizedPartnerTeamMember | null>(null);
  const [emRole, setEmRole] = useState<PartnerTeamRole>('CRM_OPERATOR');
  const [emStoreIds, setEmStoreIds] = useState<string[]>([]);
  const [emPerms, setEmPerms] = useState<PartnerTeamPermissions>({
    ...DEFAULT_ROLE_PERMISSIONS.CRM_OPERATOR,
  });
  const [emIsNonTerritory, setEmIsNonTerritory] = useState(false);
  const [emCategoriesText, setEmCategoriesText] = useState('');
  const [emBeatOrPin, setEmBeatOrPin] = useState('');
  const [emNewPasscode, setEmNewPasscode] = useState('');

  // Add Brand Product / Service Catalog Item Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [catSku, setCatSku] = useState('');
  const [catName, setCatName] = useState('');
  const [catCategory, setCatCategory] = useState('');
  const [catPrice, setCatPrice] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Broadcast Brand Notification Modal
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifPriority, setNotifPriority] = useState<'Normal' | 'High' | 'Urgent'>('High');

  const syncWorkspace = () => {
    let active = partnerBrandService.getActivePartnerSession(partnerSlug);
    let publicInfo = partnerBrandService.getPartnerPublicBranding(partnerSlug);

    // Full RBAC & Override control for Master Admin / Developer
    if (!active && isAdminOrDev) {
      const allPartners = partnerBrandService.getAllPartners();
      const p = (partnerSlug ? partnerBrandService.getPartnerBySlug(partnerSlug) : null) || allPartners[0];
      if (p) {
        active = {
          partnerId: p.id,
          partnerSlug: p.partnerSlug,
          brandId: p.brandId,
          memberId: userProfile?.employeeId || 'ADMIN-OVERRIDE',
          memberName: `${userProfile?.name || 'Administrator'} (Master Admin Override)`,
          memberRole: 'PARTNER_OWNER',
          assignedStoreIds: [],
          permissions: {
            canManageTeam: true,
            canManageStores: true,
            canCreateCrm: true,
            canEditCrm: true,
            canDeleteCrm: true,
          },
          signedInAt: new Date().toISOString(),
        };
        partnerBrandService.saveActivePartnerSession(active);
        publicInfo = partnerBrandService.getPartnerPublicBranding(p.partnerSlug);
      }
    }

    setSession(active);
    setBranding(publicInfo);

    if (!active || !publicInfo) {
      navigate(partnerBrandService.getPartnerLoginPath(partnerSlug), { replace: true });
      return;
    }

    const scopedStores = partnerBrandService.getScopedStores(active);
    const scopedTeam = partnerBrandService.getScopedTeamMembers(active);
    const me = scopedTeam.find((m) => m.id === active.memberId);
    const agentScope = me?.isNonTerritoryAgent
      ? {
          isNonTerritoryAgent: true,
          memberId: active.memberId,
          assignedCategories: me.assignedCategories || [],
        }
      : undefined;

    setStores(scopedStores);
    setTeam(scopedTeam);
    setCrmRecords(partnerBrandService.getScopedCrmRecords(active));
    setBrandFollowUps(partnerBrandService.getScopedBrandFollowUps(active));
    setVerifications(partnerBrandService.getScopedVerifications(active));

    // Strictly brand-scoped Customers & Leads (Zero cross-brand leakage!)
    const allBrandCustomers = customerService.getCustomersByBrand(publicInfo.partnerSlug);
    const allBrandLeads = customerService.getLeadsByBrand(publicInfo.partnerSlug);
    const allBrandProps = propertyRegistryService.getPropertiesByBrand(
      publicInfo.partnerSlug,
      agentScope
    );

    if (agentScope?.isNonTerritoryAgent) {
      const mId = active.memberId.toLowerCase();
      const cats = (agentScope.assignedCategories || []).map((c) => c.trim().toLowerCase()).filter(Boolean);
      setBrandCustomers(
        allBrandCustomers.filter((c) => {
          const owns =
            (c.createdById || '').toLowerCase() === mId ||
            (c.assignedToId || '').toLowerCase() === mId ||
            (c.assignedStaffId || '').toLowerCase() === mId;
          if (!owns) return false;
          if (cats.length > 0 && c.businessCategory) {
            const cat = c.businessCategory.toLowerCase();
            return cats.some((ac) => cat.includes(ac) || ac.includes(cat));
          }
          return true;
        })
      );
      setBrandLeads(
        allBrandLeads.filter((l) => {
          const owns =
            (l.createdById || '').toLowerCase() === mId ||
            (l.assignedToId || '').toLowerCase() === mId ||
            (l.assignedStaffId || '').toLowerCase() === mId;
          if (!owns) return false;
          if (cats.length > 0 && l.businessCategory) {
            const cat = l.businessCategory.toLowerCase();
            return cats.some((ac) => cat.includes(ac) || ac.includes(cat));
          }
          return true;
        })
      );
    } else {
      setBrandCustomers(allBrandCustomers);
      setBrandLeads(allBrandLeads);
    }

    setBrandProperties(allBrandProps);
    setAcademyCourses(academyTrainingService.getAllCourses());
    setAcademyProgress(academyTrainingService.getProgressForStaff(active.memberId));
    setNotifications(notificationService.getAllNotifications());

    try {
      const rawCat = localStorage.getItem(`xpeedo_brand_catalog_${publicInfo.partnerSlug}`);
      setCustomCatalog(rawCat ? (JSON.parse(rawCat) as BrandCatalogItem[]) : []);
    } catch {
      setCustomCatalog([]);
    }

    if (!crmStoreId && scopedStores.length > 0) {
      setCrmStoreId(scopedStores[0].id);
      setCrmPincode(scopedStores[0].pincode);
    }
  };

  useEffect(() => {
    syncWorkspace();
    const unsub1 = partnerBrandService.subscribe(syncWorkspace);
    const unsub2 = customerService.subscribe(syncWorkspace);
    const unsub3 = propertyRegistryService.subscribe(syncWorkspace);
    const unsub4 = academyTrainingService.subscribe(syncWorkspace);
    const unsub5 = notificationService.subscribe(syncWorkspace);
    const unsub6 = featureVisibilityService.subscribe(() => {
      setRetailActive(featureVisibilityService.isRetailServicesActive());
    });
    const unsub8 = brandOwnerService.subscribe(() => setOpsVersion((v) => v + 1));
    const unsub9 = xpeedoOpsService.subscribe(() => setOpsVersion((v) => v + 1));
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      unsub5();
      unsub6();
      unsub8();
      unsub9();
    };
  }, [partnerSlug]);

  useEffect(() => {
    const prevTitle = document.title;
    if (branding?.displayName) {
      document.title = `${branding.displayName} · Scoped Brand CRM`;
    }
    return () => {
      document.title = prevTitle;
    };
  }, [branding?.displayName]);

  const currentMember = useMemo(
    () => (session ? team.find((m) => m.id === session.memberId) : undefined),
    [team, session]
  );

  const hierarchyBlueprint = useMemo(
    () =>
      partnerBrandService.getHierarchyBlueprintForPartner(
        branding?.partnerSlug || partnerSlug
      ),
    [branding?.partnerSlug, partnerSlug]
  );

  const canManageTeam = Boolean(
    session && (session.memberRole === 'PARTNER_OWNER' || session.permissions.canManageTeam)
  );
  const canManageStores = Boolean(
    session && (session.memberRole === 'PARTNER_OWNER' || session.permissions.canManageStores)
  );
  const canCreateCrm = Boolean(
    session && (session.memberRole === 'PARTNER_OWNER' || session.permissions.canCreateCrm)
  );
  const canEditCrm = Boolean(
    session && (session.memberRole === 'PARTNER_OWNER' || session.permissions.canEditCrm)
  );

  const pendingMembers = useMemo(
    () => team.filter((m) => m.status === 'Pending'),
    [team]
  );
  const rosterMembers = useMemo(
    () => team.filter((m) => m.status !== 'Pending'),
    [team]
  );
  const activeMembers = useMemo(
    () => team.filter((m) => m.status === 'Active'),
    [team]
  );

  const storeLookup = useMemo(() => {
    const map = new Map<string, Store>();
    stores.forEach((s) => map.set(s.id, s));
    return map;
  }, [stores]);

  const propertyLookup = useMemo(() => {
    const map = new Map<string, PropertyRecord>();
    brandProperties.forEach((p) => map.set(p.id, p));
    return map;
  }, [brandProperties]);

  const filteredCrmRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return crmRecords.filter((rec) => {
      if (storeFilter !== 'ALL' && rec.storeId !== storeFilter) return false;
      if (stageFilter !== 'ALL' && rec.stage !== stageFilter) return false;
      if (!q) return true;
      return (
        rec.customerName.toLowerCase().includes(q) ||
        rec.customerPhone.includes(q) ||
        rec.serviceOrProduct.toLowerCase().includes(q) ||
        rec.pincode.includes(q)
      );
    });
  }, [crmRecords, storeFilter, stageFilter, searchQuery]);

  const filteredBrandCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return brandCustomers;
    return brandCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.mobile || '').includes(q) ||
        (c.pincode || '').includes(q) ||
        (c.colony || c.area || '').toLowerCase().includes(q)
    );
  }, [brandCustomers, searchQuery]);

  const todayIso = getTodayIsoDate();
  const followUpCounts = useMemo(() => {
    let dueToday = 0;
    let overdue = 0;
    let upcoming = 0;
    let completed = 0;
    brandFollowUps.forEach((f) => {
      if (f.status === 'Completed') {
        completed += 1;
      } else if (f.dueDate < todayIso) {
        overdue += 1;
      } else if (f.dueDate === todayIso) {
        dueToday += 1;
      } else {
        upcoming += 1;
      }
    });
    return { dueToday, overdue, upcoming, completed };
  }, [brandFollowUps, todayIso]);

  const visibleFollowUps = useMemo(() => {
    return brandFollowUps.filter((f) => {
      if (followUpBucket === 'COMPLETED') return f.status === 'Completed';
      if (f.status === 'Completed') return false;
      if (followUpBucket === 'OVERDUE') return f.dueDate < todayIso;
      if (followUpBucket === 'DUE_TODAY') return f.dueDate === todayIso;
      return f.dueDate > todayIso;
    });
  }, [brandFollowUps, followUpBucket, todayIso]);

  const unreadNotifCount = useMemo(
    () => (session ? notificationService.getUnreadCount(session.memberId) : 0),
    [notifications, session]
  );

  if (!session || !branding) {
    return null;
  }

  const theme = resolveBrandTheme(branding.accentColor);
  const accent = theme.accentColor;
  const isIndiaPost = branding.partnerSlug.toLowerCase() === 'india-post';
  const isXpokart = branding.partnerSlug.toLowerCase() === 'xpokart';
  const brandOwnerProfile = useMemo(() => {
    void opsVersion;
    return brandOwnerService.getBrandProfileBySlugOrKey(branding.partnerSlug);
  }, [branding.partnerSlug, opsVersion]);
  const opsWorkspaceKey =
    brandOwnerProfile?.workspaceKey ||
    (isIndiaPost ? 'INDIA_POST' : branding.partnerSlug.toUpperCase().replace(/-/g, '_'));
  const scopedDepartments = useMemo(() => {
    void opsVersion;
    return xpeedoOpsService.getDepartments(opsWorkspaceKey);
  }, [opsWorkspaceKey, opsVersion]);
  const scopedWorkReports = useMemo(() => {
    void opsVersion;
    return xpeedoOpsService.getWorkReports(opsWorkspaceKey);
  }, [opsWorkspaceKey, opsVersion]);
  const filteredRosterMembers = useMemo(() => {
    const q = staffSearch.trim().toLowerCase();
    return rosterMembers.filter((m) => {
      if (staffRoleFilter !== 'ALL' && m.role !== staffRoleFilter) return false;
      if (staffStatusFilter !== 'ALL' && m.status !== staffStatusFilter) return false;
      if (
        staffBeatFilter !== 'ALL' &&
        (m.assignedBeatOrPin || '').toLowerCase() !== staffBeatFilter.toLowerCase()
      ) {
        return false;
      }
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone || '').includes(q) ||
        (m.assignedBeatOrPin || '').toLowerCase().includes(q) ||
        ROLE_LABELS[m.role].toLowerCase().includes(q)
      );
    });
  }, [rosterMembers, staffSearch, staffRoleFilter, staffStatusFilter, staffBeatFilter]);
  const distinctTeamBeats = useMemo(
    () =>
      Array.from(
        new Set(rosterMembers.map((m) => m.assignedBeatOrPin).filter(Boolean) as string[])
      ).sort(),
    [rosterMembers]
  );

  const handleSignOut = () => {
    partnerBrandService.signOutPartnerSession();
    navigate(partnerBrandService.getPartnerLoginPath(partnerSlug), { replace: true });
  };

  const handleExportCsv = () => {
    const headers = [
      'Brand',
      'Customer Name',
      'Mobile',
      'PIN / Beat',
      'Category',
      'Property Code',
      'Source / Stage',
    ];
    const rows: Array<Array<string | number | undefined>> = [
      ...brandCustomers.map((c) => [
        branding.displayName,
        c.name,
        c.mobile,
        c.pincode || c.beatNo,
        c.businessCategory || 'Customer',
        c.propertyId || '',
        c.verificationStatus,
      ]),
      ...crmRecords.map((r) => [
        branding.displayName,
        r.customerName,
        r.customerPhone,
        r.pincode,
        r.serviceOrProduct,
        '',
        r.stage,
      ]),
    ];
    const csv = partnerBrandService.buildUtf8Csv(headers, rows);
    downloadCsvFile(`${branding.partnerSlug}-customers-${todayIso}.csv`, csv);
    setNoticeMsg(`Exported ${rows.length} scoped record(s) with UTF-8 BOM for Excel.`);
  };

  const handleCreateCrmAndCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crmCustomerName.trim()) return;
    const selectedProp = crmPropertyId ? propertyLookup.get(crmPropertyId) : undefined;

    // 1) Sync into Brand-Tagged Customer Directory (reflects back on Owner Dashboard!)
    customerService.addOrUpdateCustomer(
      {
        name: crmCustomerName.trim(),
        mobile: crmCustomerPhone.replace(/\D/g, '').slice(-10),
        pincode: crmPincode.trim() || selectedProp?.beatOrPin || '324009',
        colony: crmColony.trim() || selectedProp?.addressLine || branding.displayName,
        beatNo: selectedProp?.beatOrPin || crmPincode.trim(),
        propertyId: selectedProp?.propertyCode || selectedProp?.id,
        brandId: branding.partnerSlug,
        brandName: branding.displayName,
        createdById: session.memberId,
        assignedToId: crmAssigneeId || session.memberId,
        businessCategory: crmCategory || 'General',
        notes: `${crmService.trim()}${crmNotes.trim() ? ` — ${crmNotes.trim()}` : ''}`,
        verificationStatus: 'Pending',
      },
      `${branding.displayName} Portal`
    );

    // 2) Also record Store CRM pipeline entry if a store is selected
    if (crmStoreId) {
      partnerBrandService.createCrmRecordForSession(session, {
        storeId: crmStoreId,
        customerName: crmCustomerName,
        customerPhone: crmCustomerPhone,
        pincode: crmPincode || selectedProp?.beatOrPin || '324009',
        serviceOrProduct: crmService || crmCategory,
        stage: crmStage,
        assignedMemberId: crmAssigneeId || undefined,
        notes: crmNotes,
      });
    }

    setShowAddCrmModal(false);
    setCrmCustomerName('');
    setCrmCustomerPhone('');
    setCrmColony('');
    setCrmPropertyId('');
    setCrmService('');
    setCrmNotes('');
    setNoticeMsg(`Saved customer "${crmCustomerName.trim()}" under ${branding.displayName} (synced with Owner Dashboard).`);
  };

  const handleUpdateCrm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrm) return;
    const assignee = activeMembers.find((m) => m.id === editCrmAssigneeId);
    const updated = partnerBrandService.updateCrmRecordForSession(session, editingCrm.id, {
      stage: editCrmStage,
      notes: editCrmNotes,
      assignedMemberId: assignee?.id,
      assignedMemberName: assignee?.name,
    });
    if (updated) {
      setEditingCrm(null);
      setNoticeMsg(`Updated CRM record for ${updated.customerName}.`);
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadCustName.trim() || !leadProductName.trim()) return;
    const prop = leadPropertyId ? propertyLookup.get(leadPropertyId) : undefined;
    const created = customerService.createLead({
      customerId: '',
      customerName: leadCustName.trim(),
      customerMobile: leadCustMobile.replace(/\D/g, '').slice(-10),
      productCode: leadProductCode.trim() || `${branding.monogram}-PRD`,
      productName: leadProductName.trim(),
      requirement: leadRequirement.trim() || leadProductName.trim(),
      source: `${branding.displayName} Brand Portal`,
      sourceChannel: 'Vendor Referral',
      stage: 'New',
      priority: leadPriority,
      leadScore: 75,
      pincode: leadPincode.trim() || prop?.beatOrPin || '324009',
      beatNo: prop?.beatOrPin || leadPincode.trim(),
      assignedStaffId: session.memberId,
      assignedStaffName: session.memberName,
      brandId: branding.partnerSlug,
      brandName: branding.displayName,
      propertyId: prop?.id,
      propertyCode: prop?.propertyCode,
      createdById: session.memberId,
      assignedToId: session.memberId,
      businessCategory: leadCategory || 'General',
    });
    setShowAddLeadModal(false);
    setLeadCustName('');
    setLeadCustMobile('');
    setLeadProductCode('');
    setLeadProductName('');
    setLeadRequirement('');
    setLeadPropertyId('');
    setNoticeMsg(`Created brand lead ${created.id} for ${created.customerName}.`);
  };

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuCustName.trim() || !fuNextAction.trim()) return;
    const prop = fuPropertyId ? propertyLookup.get(fuPropertyId) : undefined;
    partnerBrandService.createBrandFollowUp(session, {
      customerName: fuCustName,
      customerPhone: fuCustPhone,
      propertyId: prop?.id,
      propertyCode: prop?.propertyCode,
      category: fuCategory || 'General',
      priority: fuPriority,
      nextAction: fuNextAction,
      dueDate: fuDueDate || todayIso,
      initialNote: fuNote,
    });
    setShowAddFollowUpModal(false);
    setFuCustName('');
    setFuCustPhone('');
    setFuPropertyId('');
    setFuNextAction('');
    setFuNote('');
    setNoticeMsg(`Scheduled follow-up for ${fuCustName.trim()}.`);
  };

  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propAddress.trim()) return;
    const saved = propertyRegistryService.upsertProperty({
      id: propEditingId || undefined,
      propertyCode: propCode.trim() || undefined,
      clientId: isIndiaPost ? 'CLIENT-INDIA-POST-KOTA' : `CLIENT-${branding.partnerSlug.toUpperCase()}`,
      brandId: branding.partnerSlug,
      brandName: branding.displayName,
      propertyType: propType,
      beatOrPin: propBeatPin.trim() || '324009',
      officeId: propOfficeId.trim() || 'HUB-01',
      addressLine: propAddress.trim(),
      landmark: propLandmark.trim(),
      geoOrTraceTag: propGeoTag.trim(),
      occupancyStatus: propOccupancy,
      linkedUnitNotes: propUnitNotes.trim(),
      createdById: session.memberId,
      assignedToId: session.memberId,
      businessCategory: propCategory || 'General',
    });
    setShowPropertyModal(false);
    setPropEditingId(null);
    setPropCode('');
    setPropAddress('');
    setPropLandmark('');
    setPropGeoTag('');
    setPropUnitNotes('');
    setNoticeMsg(`Saved traceable property ${saved.propertyCode} under ${branding.displayName}.`);
  };

  const openEditProperty = (prop: PropertyRecord) => {
    setPropEditingId(prop.id);
    setPropCode(prop.propertyCode);
    setPropType(prop.propertyType);
    setPropBeatPin(prop.beatOrPin);
    setPropOfficeId(prop.officeId);
    setPropAddress(prop.addressLine);
    setPropLandmark(prop.landmark || '');
    setPropGeoTag(prop.geoOrTraceTag || '');
    setPropOccupancy(prop.occupancyStatus || 'Owner Occupied');
    setPropUnitNotes(prop.linkedUnitNotes || '');
    setPropCategory(prop.businessCategory || 'General');
    setShowPropertyModal(true);
  };

  const handleCreateVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vfCustName.trim() || !vfTopic.trim()) return;
    const prop = vfPropertyId ? propertyLookup.get(vfPropertyId) : undefined;
    partnerBrandService.createBrandVerificationInquiry(session, {
      customerName: vfCustName,
      customerPhone: vfCustPhone,
      propertyId: prop?.id,
      propertyCode: prop?.propertyCode,
      beatOrPin: vfBeatPin || prop?.beatOrPin || '324009',
      inquiryTopic: vfTopic,
      category: vfCategory || 'General',
      details: vfDetails,
    });
    setShowVerificationModal(false);
    setVfCustName('');
    setVfCustPhone('');
    setVfTopic('');
    setVfDetails('');
    setVfPropertyId('');
    setNoticeMsg(`Logged verification inquiry for ${vfCustName.trim()}.`);
  };

  const handleAddBrandStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session.brandId || !newStoreName.trim()) return;
    const created = partnerBrandService.addLinkedStoreToBrand({
      brandId: session.brandId,
      name: newStoreName.trim(),
      pincode: newStorePincode.trim() || '324009',
      beatNo: newStoreBeat.trim() || undefined,
      address: newStoreAddress.trim() || `PIN ${newStorePincode}`,
      managerName: newStoreManager.trim() || undefined,
      status: 'Active',
    });
    if (created) {
      setShowAddStoreModal(false);
      setNewStoreName('');
      setNewStoreBeat('');
      setNewStoreAddress('');
      setNewStoreManager('');
      setNoticeMsg(`Added store "${created.name}" (${created.code}).`);
    }
  };

  const handleSaveStoreEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    const updated = partnerBrandService.updateStore(
      editingStore.id,
      {
        managerName: editStoreManager.trim() || undefined,
        managerPhone: editStorePhone.replace(/\D/g, '').slice(-10) || undefined,
        address: editStoreAddress.trim(),
        status: editStoreStatus,
      },
      session
    );
    if (updated) {
      setEditingStore(null);
      setNoticeMsg(`Updated store "${updated.name}".`);
    }
  };

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmName.trim() || !tmEmail.trim() || !tmPasscode.trim()) return;
    const cats = tmCategoriesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const created = partnerBrandService.addTeamMember(
        session.partnerId,
        {
          name: tmName.trim(),
          email: tmEmail.trim(),
          phone: tmPhone.trim(),
          role: tmRole,
          assignedStoreIds: tmIsNonTerritory ? [] : tmStoreIds,
          permissions: tmPerms,
          isNonTerritoryAgent: tmIsNonTerritory,
          assignedCategories: cats,
          assignedBeatOrPin: tmBeatOrPin.trim() || undefined,
          passcode: tmPasscode.trim(),
        },
        session
      );
      if (created) {
        setShowAddMemberModal(false);
        setTmName('');
        setTmEmail('');
        setTmPhone('');
        setTmPasscode('');
        setTmStoreIds([]);
        setTmIsNonTerritory(false);
        setTmCategoriesText('');
        setTmBeatOrPin('');
        setNoticeMsg(`Added team member "${created.name}" (${ROLE_LABELS[created.role]}).`);
      }
    } catch (err: any) {
      setShowAddMemberModal(false);
      setNoticeMsg(
        err?.message ||
          'Operational staff limit reached (max 5). Allocate an existing Staff 1–Staff 5 slot instead.'
      );
    }
  };

  const openMemberEditor = (member: SanitizedPartnerTeamMember) => {
    setEditingMember(member);
    setEmRole(member.role);
    setEmStoreIds(member.assignedStoreIds || []);
    setEmPerms({ ...member.permissions });
    setEmIsNonTerritory(Boolean(member.isNonTerritoryAgent));
    setEmCategoriesText((member.assignedCategories || []).join(', '));
    setEmBeatOrPin(member.assignedBeatOrPin || '');
    setEmNewPasscode('');
  };

  const handleSaveMemberUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    const cats = emCategoriesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const updated = partnerBrandService.updateTeamMember(
      editingMember.id,
      {
        role: editingMember.role === 'PARTNER_OWNER' ? 'PARTNER_OWNER' : emRole,
        assignedStoreIds: emIsNonTerritory ? [] : emStoreIds,
        permissions: emPerms,
        isNonTerritoryAgent: emIsNonTerritory,
        assignedCategories: cats,
        assignedBeatOrPin: emBeatOrPin.trim() || undefined,
        status: editingMember.status === 'Pending' ? 'Active' : editingMember.status,
        newPasscode: emNewPasscode.trim() || undefined,
      },
      session
    );
    if (updated) {
      setEditingMember(null);
      setNoticeMsg(
        editingMember.status === 'Pending'
          ? `Approved and activated "${updated.name}".`
          : `Updated permissions & scope for "${updated.name}".`
      );
    }
  };

  const handleAddBrandProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const item: BrandCatalogItem = {
      id: `CAT-${Date.now().toString(36).toUpperCase()}`,
      sku: catSku.trim().toUpperCase() || `${branding.monogram}-${Math.floor(100 + Math.random() * 899)}`,
      name: catName.trim(),
      category: catCategory.trim() || branding.category,
      priceOrTariff: catPrice.trim() || 'On Request',
      description: catDesc.trim(),
      updatedAt: new Date().toISOString(),
    };
    const next = [item, ...customCatalog];
    setCustomCatalog(next);
    try {
      localStorage.setItem(`xpeedo_brand_catalog_${branding.partnerSlug}`, JSON.stringify(next));
    } catch {
      // ignore quota
    }
    setShowAddProductModal(false);
    setCatSku('');
    setCatName('');
    setCatCategory('');
    setCatPrice('');
    setCatDesc('');
    setNoticeMsg(`Added "${item.name}" to ${branding.displayName} catalog.`);
  };

  const handleBroadcastBrandNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    notificationService.broadcastNotification({
      title: `[${branding.displayName}] ${notifTitle.trim()}`,
      message: notifMessage.trim(),
      senderName: session.memberName,
      category: 'CIRCULAR',
      priority: notifPriority,
      targetBeat: currentMember?.assignedBeatOrPin || 'ALL',
    });
    setShowNotifModal(false);
    setNotifTitle('');
    setNotifMessage('');
    setNoticeMsg('Notification published to workspace notice board.');
  };

  const toggleStoreAssignment = (
    storeId: string,
    selected: string[],
    setter: (next: string[]) => void
  ) => {
    if (selected.includes(storeId)) {
      setter(selected.filter((id) => id !== storeId));
    } else {
      setter([...selected, storeId]);
    }
  };

  const effectiveTab: WorkspaceTab =
    isXpokart && !XPOKART_ALLOWED_TABS.has(activeTab)
      ? 'DASHBOARD'
      : (!isIndiaPost && activeTab.startsWith('IP_')) || (!retailActive && activeTab === 'PRODUCTS')
      ? 'DASHBOARD'
      : activeTab;

  const TAB_LABELS: Record<WorkspaceTab, string> = {
    DASHBOARD: 'Dashboard',
    CUSTOMERS: isXpokart ? 'Store Buyers' : 'Customers',
    LEADS: isXpokart ? 'Checkout & Order Leads' : 'Leads & Schemes',
    FOLLOW_UPS: isXpokart ? 'Order Follow-Ups' : 'Follow-Ups',
    PROPERTIES: 'Properties',
    MASTER_SEARCH: 'Master Search Console',
    VERIFICATION: 'Verification & Inquiries',
    DEPARTMENTS_APPROVALS: 'Departments & Approvals',
    STORES: 'Office Master',
    RBAC_TEAM: 'Master Staff',
    MASTER_ROLE: 'Master Role',
    PROMOTION_MASTER: 'Promotion Master',
    PRODUCTS: 'Products & Storefront',
    ACADEMY: 'Skill & Academy',
    NOTIFICATIONS: isXpokart ? 'Store Alerts' : 'Notifications',
    IP_HIERARCHY: 'Divisional Hierarchy',
    IP_GEO_QUALITY: 'Geo Mapping & Data Quality',
    IP_SRM: 'SRM & Escalations',
    IP_STATUTORY_DOCS: 'Statutory Docs & ACG-61',
    IP_DAILY_OPS: 'Daily Ops & Surveys',
    IP_LMS_STOREFRONT: retailActive ? 'Postal LMS & Storefront' : 'Postal Departmental LMS',
    IP_NOTIFICATIONS: 'Divisional Notifications',
  };

  const activeSectionLabel = TAB_LABELS[effectiveTab] || 'Dashboard';

  const hierarchyNodes = useMemo(
    () => (isIndiaPost ? kotaOsHierarchyService.getOrgHierarchyNodes() : []),
    [isIndiaPost]
  );
  const indiaPostSrmTickets = useMemo(
    () => (isIndiaPost ? xpeedoOpsService.getSrmTickets() : []),
    [isIndiaPost, opsVersion]
  );

  const currentSubModeKey =
    effectiveTab === 'STORES'
      ? officeMasterMode
      : effectiveTab === 'IP_GEO_QUALITY'
      ? ipGeoMode
      : effectiveTab === 'IP_STATUTORY_DOCS'
      ? ipDocsMode
      : effectiveTab === 'IP_DAILY_OPS'
      ? ipDailyMode
      : effectiveTab === 'IP_LMS_STOREFRONT'
      ? ipLmsMode
      : undefined;

  const partnerPortalNavGroups = buildBrandPortalNav({
    mode: 'PARTNER',
    brandName: branding.displayName,
    partnerSlug: branding.partnerSlug,
    isIndiaPost,
    isXpokart,
    retailServicesActive: retailActive,
    counts: {
      customers: brandCustomers.length + crmRecords.length,
      leads: brandLeads.length,
      followUps: followUpCounts.overdue + followUpCounts.dueToday || undefined,
      verifications: verifications.length || undefined,
      departments: scopedDepartments.length || undefined,
      properties: brandProperties.length,
      stores: stores.length,
      team: rosterMembers.length,
      products: (isIndiaPost ? POSTAL_PRODUCTS.length : 0) + customCatalog.length,
      academy: academyCourses.length,
      notifications: unreadNotifCount || undefined,
    },
  });

  const sidebarNavContent = (
    <ThreeLevelSidebar
      groups={partnerPortalNavGroups}
      activeTabKey={effectiveTab}
      activeSubModeKey={currentSubModeKey}
      accentColor={accent}
      onSelectItem={(item) => {
        if (item.tabKey) {
          setActiveTabAndSub(item.tabKey as WorkspaceTab, item.subModeKey);
        }
      }}
      onCloseMobile={() => setMobileMenuOpen(false)}
      headerSlot={
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <PartnerBrandLogo
              displayName={branding.displayName}
              monogram={branding.monogram}
              accentColor={accent}
              logoUrl={branding.logoUrl}
              logoPresetId={branding.logoPresetId}
              size="md"
            />
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">{branding.displayName}</div>
              <div className="text-[11px] font-mono text-slate-400 truncate">
                Single Brand CRM
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {hierarchyBlueprint.defaultStateScope}
          </div>
        </div>
      }
      footerSlot={
        <div className="space-y-2 text-xs">
          <div className="px-1">
            <div className="font-semibold text-white truncate">{session.memberName}</div>
            <div className="text-[11px] text-slate-400 truncate">{ROLE_LABELS[session.memberRole]}</div>
          </div>
          {isAdminOrDev && (
            <Link
              to="/dashboard"
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-1.5"
            >
              <ShieldCheck size={13} />
              <span>Master Admin Console</span>
            </Link>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full py-2 px-3 rounded-lg bg-red-950/60 hover:bg-red-900/70 border border-red-900 text-red-200 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      }
    />
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 border-r border-slate-200 sticky top-0 h-screen">
        {sidebarNavContent}
      </aside>

      {/* Mobile Slide-Out Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-72 h-full shadow-2xl">{sidebarNavContent}</div>
          <div
            className="flex-1 bg-slate-950/60 backdrop-blur-2xs"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Master Admin / Developer RBAC Override Top Banner */}
        {isAdminOrDev && (
          <div className="bg-slate-950 text-amber-300 px-4 sm:px-6 py-2 text-xs font-bold flex flex-wrap items-center justify-between gap-2 border-b border-amber-400/30">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px]">
                MASTER ADMIN / DEV OVERRIDE
              </span>
              <span>
                Inspecting Brand Workspace: <strong>{branding.displayName}</strong> ·{' '}
                {hierarchyBlueprint.defaultStateScope}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/partner-brand-management"
                className="text-white hover:text-amber-200 underline text-[11px]"
              >
                ← Partner &amp; Approvals Hub
              </Link>
              <Link
                to="/dashboard"
                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-md font-black text-[11px]"
              >
                Owner Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Minimal Clean Top Header (Zero Navigation Bar Links) */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open brand navigation menu"
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-slate-500 truncate">
                {branding.displayName} / {activeSectionLabel}
              </div>
              <h1 className="text-base font-extrabold text-slate-900 truncate">
                {activeSectionLabel}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs">
            {currentMember?.isNonTerritoryAgent && (
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-bold">
                B2B Category Agent · Own Records Only
              </span>
            )}
            <div className="hidden sm:block text-right">
              <div className="font-semibold text-slate-900">{session.memberName}</div>
              <div className="text-[11px] text-slate-500">{ROLE_LABELS[session.memberRole]}</div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
          {noticeMsg && (
            <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck size={15} className="text-emerald-700 shrink-0" />
                <span>{noticeMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setNoticeMsg(null)}
                className="font-semibold text-emerald-700 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {currentMember?.isNonTerritoryAgent && (
            <div className="px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-950">
              <div>
                <strong>Non-Territory B2B Category Mode Active:</strong> Territory/beat lock is bypassed. You strictly see and manage only records created by or assigned to you within categories:{' '}
                <span className="font-mono font-bold">
                  {currentMember.assignedCategories?.length
                    ? currentMember.assignedCategories.join(', ')
                    : 'All Assigned Business Categories'}
                </span>
              </div>
            </div>
          )}

          {/* ====================================================================
              TAB 1: DASHBOARD (COHESIVE BRAND OVERVIEW & HIERARCHY BLUEPRINT)
             ==================================================================== */}
          {effectiveTab === 'DASHBOARD' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <LayoutDashboard size={13} />
                    <span>{hierarchyBlueprint.blueprintName}</span>
                  </div>
                  <h1 className="text-xl font-extrabold text-slate-900">
                    {branding.displayName} · Operational Control Center
                  </h1>
                  <p className="text-xs text-slate-600">
                    {hierarchyBlueprint.dataIsolationNote}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Export UTF-8 CSV</span>
                  </button>
                  {canCreateCrm && (
                    <button
                      type="button"
                      onClick={() => setShowAddCrmModal(true)}
                      className="px-3.5 py-2 rounded-lg text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      style={{ backgroundColor: accent }}
                    >
                      <Plus size={14} />
                      <span>Add Customer</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Hierarchy Blueprint Flow */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-700 mr-1">Hierarchy Levels:</span>
                {hierarchyBlueprint.levels.map((lvl, idx) => (
                  <React.Fragment key={lvl}>
                    <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-semibold text-slate-800">
                      {lvl}
                    </span>
                    {idx < hierarchyBlueprint.levels.length - 1 && (
                      <span className="text-slate-400 font-bold">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Scoped KPI Summary Bar */}
            {isXpokart ? (
              <div className="bg-white rounded-2xl border border-slate-200 grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 text-xs">
                <div className="p-4">
                  <div className="text-slate-500 font-medium">Catalog SKUs</div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                    {customCatalog.length}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-slate-500 font-medium">Store Buyers</div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                    {brandCustomers.length + crmRecords.length}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-slate-500 font-medium">Checkout Orders</div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                    {brandLeads.length}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-slate-500 font-medium">Order Follow-Ups</div>
                  <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1">
                    {followUpCounts.dueToday + followUpCounts.overdue}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-slate-500 font-medium">Store Alerts</div>
                  <div className="text-2xl font-bold text-blue-700 font-mono tabular-nums mt-1">
                    {unreadNotifCount}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 grid grid-cols-2 lg:grid-cols-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 text-xs">
                <div className="p-4">
                  <div className="text-slate-500 font-medium">Scoped Customers</div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                    {brandCustomers.length + crmRecords.length}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-slate-500 font-medium">Brand Leads</div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                    {brandLeads.length}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-slate-500 font-medium">Follow-Ups Due/Overdue</div>
                  <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1">
                    {followUpCounts.dueToday + followUpCounts.overdue}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-slate-500 font-medium">Traceable Properties</div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                    {brandProperties.length}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-slate-500 font-medium">Office Master</div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                    {stores.length}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-slate-500 font-medium">Master Staff</div>
                  <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
                    {activeMembers.length}
                  </div>
                </div>
              </div>
            )}

            {isXpokart && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-extrabold text-sm text-slate-900">
                    XPOKART E-Commerce Store System
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Dedicated storefront workspace for catalog SKUs, customer checkout leads, and store orders. Operational staff and postal territory modules belong to India Post &amp; Xpeedo Services.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('PRODUCTS')}
                    className="px-3.5 py-2 rounded-lg text-white font-semibold cursor-pointer whitespace-nowrap"
                    style={{ backgroundColor: accent }}
                  >
                    Manage Store Catalog
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('LEADS')}
                    className="px-3.5 py-2 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer whitespace-nowrap"
                  >
                    Checkout &amp; Order Leads
                  </button>
                </div>
              </div>
            )}

            {!isIndiaPost && !isXpokart && brandCustomers.length === 0 && brandProperties.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
                <div className="font-extrabold text-base text-slate-900">
                  Clean Ready Brand Workspace · Zero Leaked India Post Records
                </div>
                <p className="text-xs text-slate-600 max-w-2xl mx-auto">
                  {branding.displayName} is provisioned with strict tenant isolation. Start by registering a Hub/Store, adding a traceable Property, or onboarding your first Brand Customer — all brand-tagged records sync cleanly back to the Owner Dashboard.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('PROPERTIES');
                      setShowPropertyModal(true);
                    }}
                    className="px-4 py-2 rounded-lg text-white font-semibold cursor-pointer"
                    style={{ backgroundColor: accent }}
                  >
                    + Add First Property
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('CUSTOMERS');
                      setShowAddCrmModal(true);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
                  >
                    + Add First Customer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            TAB 2: CUSTOMERS & SCOPED STORE CRM RECORDS
           ==================================================================== */}
        {effectiveTab === 'CUSTOMERS' && (
          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {branding.displayName} · Customer Directory ({filteredBrandCustomers.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    All customers created here carry brand tag <span className="font-mono font-semibold">{branding.partnerSlug}</span> and sync directly to Owner Dashboard.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="relative">
                    <Search
                      size={13}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search customer, mobile, PIN..."
                      className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg w-52 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Download size={12} />
                    <span>CSV</span>
                  </button>
                  {canCreateCrm && (
                    <button
                      type="button"
                      onClick={() => setShowAddCrmModal(true)}
                      className="px-3.5 py-1.5 rounded-lg text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      style={{ backgroundColor: accent }}
                    >
                      <Plus size={14} />
                      <span>Add Customer / CRM</span>
                    </button>
                  )}
                </div>
              </div>

              {filteredBrandCustomers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No customers recorded for {branding.displayName} yet. Click "Add Customer / CRM" to create one.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <th className="py-3 px-4 font-semibold">Customer</th>
                        <th className="py-3 px-4 font-semibold">Mobile</th>
                        <th className="py-3 px-4 font-semibold">Area / Colony &amp; PIN</th>
                        <th className="py-3 px-4 font-semibold">Property Link</th>
                        <th className="py-3 px-4 font-semibold">Category</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredBrandCustomers.slice(0, 60).map((c) => (
                        <tr key={c.id || c.masterId} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                          <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                            {c.mobile || '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {c.colony || c.area || '—'} · <span className="font-mono">{c.pincode || '—'}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                            {c.propertyId || 'Unlinked'}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {c.businessCategory || branding.category}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-emerald-700">
                              {c.verificationStatus || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Scoped Store CRM Pipeline Table */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Store / Hub CRM Interactions ({filteredCrmRecords.length})
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {stores.length > 1 && (
                    <select
                      value={storeFilter}
                      onChange={(e) => setStoreFilter(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                    >
                      <option value="ALL">All Assigned Stores</option>
                      {stores.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value as 'ALL' | StoreCrmStage)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="ALL">All Stages</option>
                    {CRM_STAGES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredCrmRecords.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No store-level CRM records yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <th className="py-3 px-4 font-semibold">Customer</th>
                        <th className="py-3 px-4 font-semibold">Store / Hub</th>
                        <th className="py-3 px-4 font-semibold">Service / Inquiry</th>
                        <th className="py-3 px-4 font-semibold">Stage</th>
                        <th className="py-3 px-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredCrmRecords.map((rec) => {
                        const st = storeLookup.get(rec.storeId);
                        return (
                          <tr key={rec.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">{rec.customerName}</div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {rec.customerPhone} · PIN {rec.pincode}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-700">{st?.name || rec.storeId}</td>
                            <td className="py-3 px-4">{rec.serviceOrProduct}</td>
                            <td className="py-3 px-4 font-semibold text-amber-700">{rec.stage}</td>
                            <td className="py-3 px-4 text-right">
                              {canEditCrm && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCrm(rec);
                                    setEditCrmStage(rec.stage);
                                    setEditCrmNotes(rec.notes);
                                    setEditCrmAssigneeId(rec.assignedMemberId || '');
                                  }}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit2 size={11} />
                                  <span>Update</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ====================================================================
            TAB 3: NEW LEADS PIPELINE
           ==================================================================== */}
        {effectiveTab === 'LEADS' && (
          <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp size={16} />
                  <span>{branding.displayName} · Leads Pipeline ({brandLeads.length})</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Brand-isolated lead intake linked with traceable Property IDs and B2B category ownership.
                </p>
              </div>
              {canCreateCrm && (
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(true)}
                  className="px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  <Plus size={14} />
                  <span>New Brand Lead</span>
                </button>
              )}
            </div>

            {brandLeads.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500 space-y-2">
                <div className="font-bold text-slate-900 text-sm">No Leads in {branding.displayName}</div>
                <p>Capture new customer or merchant leads scoped exclusively to this brand.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <th className="py-3 px-4 font-semibold">Lead &amp; Customer</th>
                      <th className="py-3 px-4 font-semibold">Product / Service</th>
                      <th className="py-3 px-4 font-semibold">Property / PIN</th>
                      <th className="py-3 px-4 font-semibold">Priority</th>
                      <th className="py-3 px-4 font-semibold">Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {brandLeads.slice(0, 60).map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{lead.customerName}</div>
                          <div className="text-[11px] font-mono text-slate-500">
                            {lead.customerMobile || '—'} · {lead.businessCategory || 'General'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{lead.productName}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {lead.requirement}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                          {lead.propertyCode || lead.propertyId || '—'} · PIN {lead.pincode || '—'}
                        </td>
                        <td className="py-3 px-4 font-semibold">{lead.priority}</td>
                        <td className="py-3 px-4">
                          <select
                            value={lead.stage}
                            disabled={!canEditCrm}
                            onChange={(e) =>
                              customerService.updateLeadStage(lead.id, e.target.value as LeadStage)
                            }
                            className="px-2 py-1 bg-slate-50 border border-slate-300 rounded font-semibold text-[11px]"
                          >
                            {LEAD_STAGES.map((st) => (
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

            {isIndiaPost && (
              <div className="p-5 border-t border-slate-200 bg-slate-50/60 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Postal Products &amp; Sovereign Schemes Reference ({POSTAL_PRODUCTS.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Active savings, IPPB, PLI &amp; postal schemes feeding this unified Leads Pipeline.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  {POSTAL_PRODUCTS.slice(0, 9).map((p) => (
                    <div key={p.id} className="p-3 rounded-lg border border-slate-200 bg-white">
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
          </section>
        )}

        {/* ====================================================================
            TAB 4: 4-BUCKET FOLLOW-UPS ENGINE
           ==================================================================== */}
        {effectiveTab === 'FOLLOW_UPS' && (
          <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar size={16} />
                  <span>4-Bucket Follow-Ups Tracker</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Due Today, Overdue, Upcoming &amp; Completed tasks with timeline notes.
                </p>
              </div>
              {canCreateCrm && (
                <button
                  type="button"
                  onClick={() => setShowAddFollowUpModal(true)}
                  className="px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  <Plus size={14} />
                  <span>Schedule Follow-Up</span>
                </button>
              )}
            </div>

            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2 text-xs">
              {(
                [
                  { id: 'DUE_TODAY', label: `Due Today (${followUpCounts.dueToday})` },
                  { id: 'OVERDUE', label: `Overdue (${followUpCounts.overdue})` },
                  { id: 'UPCOMING', label: `Upcoming (${followUpCounts.upcoming})` },
                  { id: 'COMPLETED', label: `Completed (${followUpCounts.completed})` },
                ] as const
              ).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setFollowUpBucket(b.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                    followUpBucket === b.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {visibleFollowUps.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                No follow-ups in this bucket.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 text-xs">
                {visibleFollowUps.map((fu) => (
                  <div
                    key={fu.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900">{fu.customerName}</span>
                        <span className="font-mono text-slate-500">{fu.customerPhone}</span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            fu.priority === 'Urgent'
                              ? 'bg-red-100 text-red-800'
                              : fu.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {fu.priority}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          Due: {fu.dueDate}
                        </span>
                      </div>
                      <div className="text-slate-700 font-medium">{fu.nextAction}</div>
                      {fu.propertyCode && (
                        <div className="text-[11px] font-mono text-slate-500">
                          Property: {fu.propertyCode} · Category: {fu.category || 'General'}
                        </div>
                      )}
                      {fu.timelineNotes.length > 0 && (
                        <div className="text-[11px] text-slate-500">
                          Latest Note ({fu.timelineNotes[0].author}): {fu.timelineNotes[0].note}
                        </div>
                      )}
                    </div>

                    {fu.status !== 'Completed' && canEditCrm && (
                      <button
                        type="button"
                        onClick={() => {
                          partnerBrandService.updateBrandFollowUpStatus(
                            session,
                            fu.id,
                            'Completed',
                            'Marked completed from workspace'
                          );
                          setNoticeMsg(`Follow-up for ${fu.customerName} completed.`);
                        }}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                      >
                        <CheckCircle2 size={13} />
                        <span>Mark Completed</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ====================================================================
            TAB 5: PROPERTIES (UNIFIED UNDER CRM & OPERATIONS, ZERO DUPLICATION)
           ==================================================================== */}
        {!isXpokart && effectiveTab === 'PROPERTIES' && (
          isIndiaPost ? (
            <Suspense fallback={<EmbeddedModuleLoading />}>
              <UnifiedPropertyFamilyHub indiaPostOwnerAccess />
            </Suspense>
          ) : (
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MapPin size={16} />
                    <span>Traceable Property Registry ({brandProperties.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Unique Property Code, Residential / Commercial / Mixed / Flat classification, Beat/PIN &amp; Geo Tagging.
                  </p>
                </div>
                {canCreateCrm && (
                  <button
                    type="button"
                    onClick={() => {
                      setPropEditingId(null);
                      setPropCode('');
                      setPropAddress('');
                      setPropLandmark('');
                      setPropGeoTag('');
                      setPropUnitNotes('');
                      setShowPropertyModal(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: accent }}
                  >
                    <Plus size={14} />
                    <span>Register Property</span>
                  </button>
                )}
              </div>

              {brandProperties.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-500">
                  No traceable properties registered under {branding.displayName} yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-200 text-xs">
                  {brandProperties.map((prop) => (
                    <div
                      key={prop.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            {prop.propertyCode}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-[11px]">
                            {prop.propertyType}
                          </span>
                          <span className="text-slate-500 font-mono text-[11px]">
                            PIN/Beat: {prop.beatOrPin} · Office/Hub: {prop.officeId}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-800">{prop.addressLine}</div>
                        <div className="text-[11px] text-slate-500">
                          Occupancy: {prop.occupancyStatus}
                          {prop.landmark ? ` · Landmark: ${prop.landmark}` : ''}
                          {prop.geoOrTraceTag ? ` · Tag: ${prop.geoOrTraceTag}` : ''}
                        </div>
                        {prop.linkedUnitNotes && (
                          <div className="text-[11px] text-slate-600">{prop.linkedUnitNotes}</div>
                        )}
                      </div>

                      {canEditCrm && (
                        <button
                          type="button"
                          onClick={() => openEditProperty(prop)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )
        )}

        {/* ====================================================================
            TAB 5B: MASTER SEARCH CONSOLE (CRM & OPERATIONS)
           ==================================================================== */}
        {!isXpokart && effectiveTab === 'MASTER_SEARCH' && (
          <Suspense fallback={<EmbeddedModuleLoading />}>
            <IndiaPostMasterSearchAndInspectionView />
          </Suspense>
        )}

        {/* ====================================================================
            TAB 6: VERIFICATION & CUSTOMER INQUIRIES
           ==================================================================== */}
        {!isXpokart && effectiveTab === 'VERIFICATION' && (
          <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardCheck size={16} />
                  <span>Verification &amp; Customer Inquiries ({verifications.length})</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Track address verification, KYC checks, and service inquiry resolutions.
                </p>
              </div>
              {canCreateCrm && (
                <button
                  type="button"
                  onClick={() => setShowVerificationModal(true)}
                  className="px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  <Plus size={14} />
                  <span>New Verification / Inquiry</span>
                </button>
              )}
            </div>

            {verifications.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                No inquiries or verification tasks logged yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 text-xs">
                {verifications.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900">
                        {v.customerName} · <span className="font-mono text-slate-500">{v.customerPhone}</span>
                      </div>
                      <div className="font-semibold text-slate-800">{v.inquiryTopic}</div>
                      <div className="text-slate-600">{v.details}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        PIN/Beat: {v.beatOrPin}
                        {v.propertyCode ? ` · Property: ${v.propertyCode}` : ''}
                      </div>
                    </div>
                    <select
                      value={v.status}
                      disabled={!canEditCrm}
                      onChange={(e) =>
                        partnerBrandService.updateBrandVerificationStatus(
                          session,
                          v.id,
                          e.target.value as BrandVerificationInquiry['status']
                        )
                      }
                      className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-xs"
                    >
                      {VERIFICATION_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ====================================================================
            TAB 6B: DEPARTMENTS & APPROVALS (CRM & OPERATIONS)
           ==================================================================== */}
        {!isXpokart && effectiveTab === 'DEPARTMENTS_APPROVALS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers size={16} className="text-blue-600" />
                <span>Departments ({scopedDepartments.length})</span>
              </h2>
              {canManageTeam && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newDeptName.trim()) return;
                    xpeedoOpsService.upsertDepartment(
                      {
                        workspaceId: opsWorkspaceKey,
                        clientId: `client-${branding.partnerSlug}`,
                        name: newDeptName.trim(),
                        code: `${branding.monogram}-${Date.now().toString(36).slice(-3).toUpperCase()}`,
                        headName: newDeptHead.trim() || session.memberName,
                        description: `Managed department inside ${branding.displayName}`,
                        isActive: true,
                      },
                      session.memberName,
                      'CLIENT_ADMIN'
                    );
                    setNoticeMsg(`Saved department "${newDeptName.trim()}".`);
                    setNewDeptName('');
                    setNewDeptHead('');
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
              )}
              <div className="divide-y divide-slate-100 text-xs max-h-80 overflow-y-auto">
                {scopedDepartments.length === 0 ? (
                  <p className="text-slate-500 py-6 text-center">No departments configured yet.</p>
                ) : (
                  scopedDepartments.map((d) => (
                    <div key={d.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-900">{d.name}</div>
                        <div className="text-[11px] text-slate-500">Head: {d.headName}</div>
                      </div>
                      <span className="font-mono text-[11px] text-slate-600">{d.code}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderKanban size={16} className="text-emerald-700" />
                <span>Work Reports &amp; Operational Approvals ({scopedWorkReports.length})</span>
              </h2>
              {scopedWorkReports.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  No pending work report approvals in {branding.displayName}.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 text-xs max-h-80 overflow-y-auto">
                  {scopedWorkReports.map((wr) => (
                    <div key={wr.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-900">{wr.summary}</div>
                        <div className="text-[11px] text-slate-500">
                          {wr.submittedByName} · Stage: <strong className="font-mono">{wr.approvalStage}</strong>
                        </div>
                      </div>
                      {canManageTeam &&
                        wr.approvalStage !== 'OWNER_APPROVED' &&
                        wr.approvalStage !== 'REJECTED' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                xpeedoOpsService.advanceWorkReportApproval(
                                  wr.id,
                                  session.memberName,
                                  'CLIENT_ADMIN'
                                );
                                setNoticeMsg(`Approved work report ${wr.id}.`);
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                xpeedoOpsService.rejectWorkReport(
                                  wr.id,
                                  'Returned for review from Workspace',
                                  session.memberName,
                                  'CLIENT_ADMIN'
                                );
                                setNoticeMsg(`Returned work report ${wr.id}.`);
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
        )}

        {/* ====================================================================
            TERRITORY & TEAM MODULE 1: OFFICE MASTER (OFFICES & BEATS MATRIX)
           ==================================================================== */}
        {!isXpokart && effectiveTab === 'STORES' && (
          <div className="space-y-4">
            {isIndiaPost && (
              <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTabAndSub('STORES', 'OFFICES')}
                    className={`px-3.5 py-1.5 rounded-lg font-semibold cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      officeMasterMode === 'OFFICES'
                        ? 'bg-red-800 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Building2 size={14} />
                    <span>Offices &amp; Branches Registry ({stores.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTabAndSub('STORES', 'BEATS')}
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
                <button
                  type="button"
                  onClick={() => setActiveTab('RBAC_TEAM')}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 cursor-pointer whitespace-nowrap"
                >
                  Master Staff →
                </button>
              </div>
            )}

            {isIndiaPost && officeMasterMode === 'OFFICES' ? (
              <Suspense fallback={<EmbeddedModuleLoading />}>
                <OfficeMasterView indiaPostOwnerAccess />
              </Suspense>
            ) : isIndiaPost && officeMasterMode === 'BEATS' ? (
              <Suspense fallback={<EmbeddedModuleLoading />}>
                <BeatManagementView indiaPostOwnerAccess />
              </Suspense>
            ) : (
              <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Office Master ({stores.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Canonical offices, branches &amp; PINs scoped to {branding.displayName} ({hierarchyBlueprint.defaultStateScope}).
                    </p>
                  </div>
                  {session.memberRole === 'PARTNER_OWNER' && session.brandId && (
                    <button
                      type="button"
                      onClick={() => setShowAddStoreModal(true)}
                      className="px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      style={{ backgroundColor: accent }}
                    >
                      <Plus size={14} />
                      <span>Add Linked Hub / Store</span>
                    </button>
                  )}
                </div>

                {stores.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500">
                    No offices or stores linked in your scope yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 text-xs">
                    {stores.map((st) => (
                      <div
                        key={st.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Building2 size={15} className="text-slate-500 shrink-0" />
                            <span>{st.name}</span>
                            <span className="font-mono text-xs font-normal text-slate-500">
                              · {st.code}
                            </span>
                          </div>
                          <div className="text-slate-600">
                            PIN <span className="font-mono font-semibold">{st.pincode}</span>
                            {st.beatNo ? ` · ${st.beatNo}` : ''} · {st.address}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Manager: {st.managerName || 'Not assigned'}
                            {st.managerPhone ? ` · ${st.managerPhone}` : ''} · Status:{' '}
                            <span
                              className={`font-semibold ${
                                st.status === 'Active' ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {st.status}
                            </span>
                          </div>
                        </div>

                        {canManageStores && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStore(st);
                              setEditStoreManager(st.managerName || '');
                              setEditStorePhone(st.managerPhone || '');
                              setEditStoreAddress(st.address);
                              setEditStoreStatus(st.status);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* ====================================================================
            TERRITORY & TEAM MODULE 2: MASTER STAFF (MULTI-CRITERIA FILTERING)
           ==================================================================== */}
        {!isXpokart && effectiveTab === 'RBAC_TEAM' && (
          <div className="space-y-6">
            <BrandStaffManagementPanel
              brandSlug={branding.partnerSlug}
              brandName={branding.displayName}
              actorName={session.memberName}
              accentColor={accent}
            />
            {canManageTeam && pendingMembers.length > 0 && (
              <section className="bg-white rounded-2xl border border-amber-300 overflow-hidden">
                <div className="px-5 py-3.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-xs font-bold text-amber-900">
                  <UserCheck size={15} />
                  <span>Pending Team Onboarding Requests ({pendingMembers.length})</span>
                </div>
                <div className="divide-y divide-slate-200 text-xs">
                  {pendingMembers.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">
                          {req.name} · Requested {ROLE_LABELS[req.role]}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {req.email} · {req.phone || '—'}
                        </div>
                        {req.requestedNote && (
                          <div className="text-[11px] text-slate-600">Note: {req.requestedNote}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => openMemberEditor(req)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold cursor-pointer"
                        >
                          Review &amp; Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            partnerBrandService.updateTeamMember(
                              req.id,
                              { status: 'Deactivated' },
                              session
                            )
                          }
                          className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Master Staff Directory & Duty Assignments */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Users size={16} className="text-slate-600" />
                      <span>
                        Master Staff Directory ({filteredRosterMembers.length} / {rosterMembers.length})
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Filter team assignments by Role, Status, and Beat/PIN. Manage permission presets in Master Role or transfers in Promotion Master.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab('MASTER_ROLE')}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <ShieldCheck size={14} />
                      <span>Master Role</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('PROMOTION_MASTER')}
                      className="px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Award size={14} />
                      <span>Promotion Master</span>
                    </button>
                    {canManageTeam && (
                      <button
                        type="button"
                        title="Add team member"
                        onClick={() => {
                          setTmStoreIds(stores.length === 1 ? [stores[0].id] : []);
                          setShowAddMemberModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 whitespace-nowrap text-white cursor-pointer"
                        style={{ backgroundColor: accent }}
                      >
                        <Plus size={14} />
                        <span>Add Team / B2B Agent</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Multi-Criteria Filter Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      placeholder="Search name, email, mobile, beat..."
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
                    {Object.entries(ROLE_LABELS).map(([k, lbl]) => (
                      <option key={k} value={k}>
                        {lbl}
                      </option>
                    ))}
                  </select>
                  <select
                    value={staffBeatFilter}
                    onChange={(e) => setStaffBeatFilter(e.target.value)}
                    aria-label="Filter by beat or PIN"
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ALL">All Beats / PINs</option>
                    {distinctTeamBeats.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <select
                    value={staffStatusFilter}
                    onChange={(e) => setStaffStatusFilter(e.target.value as any)}
                    aria-label="Filter by status"
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Deactivated">Deactivated</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <th className="py-3 px-4 font-semibold">Team Member</th>
                      <th className="py-3 px-4 font-semibold">Role</th>
                      <th className="py-3 px-4 font-semibold">Territory / B2B Scope</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      {canManageTeam && (
                        <th className="py-3 px-4 font-semibold text-right">Manage</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRosterMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{m.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {m.email} · {m.phone || '—'}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {ROLE_LABELS[m.role]}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {m.isNonTerritoryAgent ? (
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-semibold text-[11px]">
                              Non-Territory B2B ({m.assignedCategories?.join(', ') || 'Own Records'})
                            </span>
                          ) : m.role === 'PARTNER_OWNER' || m.assignedStoreIds.length === 0 ? (
                            m.assignedBeatOrPin ? `Beat/PIN: ${m.assignedBeatOrPin}` : 'All Brand Stores / Hubs'
                          ) : (
                            m.assignedStoreIds
                              .map((sid) => storeLookup.get(sid)?.name || sid)
                              .join(', ')
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-semibold ${
                              m.status === 'Active' ? 'text-emerald-700' : 'text-slate-500'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        {canManageTeam && (
                          <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openMemberEditor(m)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Shield size={11} />
                              <span>Edit Access</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTab('PROMOTION_MASTER')}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 rounded font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Award size={11} />
                              <span>Promote</span>
                            </button>
                            {m.role !== 'PARTNER_OWNER' && m.id !== session.memberId && (
                              <button
                                type="button"
                                onClick={() =>
                                  partnerBrandService.updateTeamMember(
                                    m.id,
                                    { status: m.status === 'Active' ? 'Deactivated' : 'Active' },
                                    session
                                  )
                                }
                                className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded font-semibold cursor-pointer"
                              >
                                {m.status === 'Active' ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ====================================================================
            TERRITORY & TEAM MODULE 3: MASTER ROLE (PERMISSION MATRIX & SESSION LOCK)
           ==================================================================== */}
        {!isXpokart && effectiveTab === 'MASTER_ROLE' && brandOwnerProfile && (
          <Suspense fallback={<EmbeddedModuleLoading />}>
            <TerritoryMasterRoleView
              profile={brandOwnerProfile}
              actorName={session.memberName}
              onNavigateToPromotion={(sid) => {
                setPromoSelectedStaffId(sid);
                setActiveTab('PROMOTION_MASTER');
              }}
              onNavigateToMasterStaff={() => setActiveTab('RBAC_TEAM')}
            />
          </Suspense>
        )}

        {/* ====================================================================
            TERRITORY & TEAM MODULE 4: PROMOTION MASTER
           ==================================================================== */}
        {!isXpokart && effectiveTab === 'PROMOTION_MASTER' && brandOwnerProfile && (
          <Suspense fallback={<EmbeddedModuleLoading />}>
            <TerritoryPromotionMasterView
              profile={brandOwnerProfile}
              actorName={session.memberName}
              actorRole={session.memberRole}
              initialStaffId={promoSelectedStaffId}
              onNavigateToMasterRole={() => setActiveTab('MASTER_ROLE')}
              onNavigateToMasterStaff={() => setActiveTab('RBAC_TEAM')}
            />
          </Suspense>
        )}

        {/* ====================================================================
            TAB 9: PRODUCTS & PUBLIC STOREFRONT LAUNCH
           ==================================================================== */}
        {retailActive && effectiveTab === 'PRODUCTS' && (
          <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package size={16} />
                  <span>{branding.displayName} · Products &amp; Services Catalog</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {isIndiaPost
                    ? 'Verified India Post Schemes & Citizen Services + custom regional offerings.'
                    : `Zero cross-brand clutter. Manage ${branding.displayName} offerings cleanly.`}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Link
                  to={isIndiaPost ? '/india-post-storefront' : `/brand/${branding.partnerSlug}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold inline-flex items-center gap-1"
                >
                  <StoreIcon size={13} />
                  <span>Open Storefront</span>
                  <ExternalLink size={11} />
                </Link>
                {canManageStores && (
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(true)}
                    className="px-3.5 py-1.5 rounded-lg text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: accent }}
                  >
                    <Plus size={14} />
                    <span>Add Brand Item</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {customCatalog.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-500">{item.sku}</span>
                    <span className="font-bold text-emerald-700">{item.priceOrTariff}</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                  <div className="text-[11px] font-semibold text-slate-500">{item.category}</div>
                  {item.description && <p className="text-slate-600">{item.description}</p>}
                </div>
              ))}

              {isIndiaPost &&
                POSTAL_PRODUCTS.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-red-700">{p.code}</span>
                      <span className="text-[11px] font-semibold text-slate-600">{p.interestRateOrBonus}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                    <div className="text-[11px] font-semibold text-slate-500">{p.category}</div>
                    <p className="text-slate-600 line-clamp-2">{p.tagline}</p>
                  </div>
                ))}

              {!isIndiaPost && customCatalog.length === 0 && (
                <div className="col-span-full py-10 text-center text-slate-500">
                  No products or service tariffs added under {branding.displayName} yet. Click "+ Add Brand Item" to populate your clean brand catalog.
                </div>
              )}
            </div>
          </section>
        )}

        {/* ====================================================================
            TAB 10: SKILL & ACADEMY TRAINING
           ==================================================================== */}
        {effectiveTab === 'ACADEMY' && (
          <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen size={16} />
                <span>Skill &amp; Academy Training Modules ({academyCourses.length})</span>
              </h2>
              <p className="text-xs text-slate-500">
                Self-paced compliance, onboarding &amp; product certification progress for {session.memberName}.
              </p>
            </div>
            <div className="divide-y divide-slate-200 text-xs">
              {academyCourses.map((course) => {
                const prog = academyProgress.find((p) => p.courseId === course.id);
                return (
                  <div
                    key={course.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{course.title}</span>
                        {course.isMandatory && (
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-bold text-[10px]">
                            Mandatory
                          </span>
                        )}
                        {prog?.certificateIssued && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                            <Award size={11} />
                            Certified ({prog.scoreObtained}%)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500">
                        {course.departmentOrVertical} · Target: {course.targetRole} · {course.lessonsCount} Lessons ({course.durationMinutes} min)
                      </div>
                      <p className="text-slate-600">{course.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-slate-700">
                        {prog?.progressPct ?? 0}%
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          academyTrainingService.updateProgress({
                            courseId: course.id,
                            staffOrAgentId: session.memberId,
                            staffName: session.memberName,
                            status: 'Completed',
                            progressPct: 100,
                            scoreObtained: Math.max(course.passingScorePct, 90),
                          });
                          setNoticeMsg(`Completed academy module "${course.title}".`);
                        }}
                        className="px-3 py-1.5 rounded-lg text-white font-semibold cursor-pointer"
                        style={{ backgroundColor: accent }}
                      >
                        {prog?.status === 'Completed' ? 'Re-Certify' : 'Mark Complete'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ====================================================================
            TAB 11: NOTIFICATIONS & CIRCULAR FEED
           ==================================================================== */}
        {effectiveTab === 'NOTIFICATIONS' && (
          <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Bell size={16} />
                  <span>Workspace Notifications &amp; Notices</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time operational circulars and task updates.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => notificationService.markAllAsRead(session.memberId)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold cursor-pointer"
                >
                  Mark All Read
                </button>
                {canManageTeam && (
                  <button
                    type="button"
                    onClick={() => setShowNotifModal(true)}
                    className="px-3.5 py-1.5 rounded-lg text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                    style={{ backgroundColor: accent }}
                  >
                    <Plus size={14} />
                    <span>Publish Notice</span>
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-slate-200 text-xs">
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-slate-500">No notifications available.</div>
              ) : (
                notifications.map((n) => {
                  const isRead = Boolean(
                    n.isRead || n.readBy?.some((id) => id.toLowerCase() === session.memberId.toLowerCase())
                  );
                  return (
                    <div
                      key={n.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isRead ? 'bg-white' : 'bg-blue-50/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{n.title}</span>
                          {!isRead && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="text-slate-600">{n.message}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {n.senderName || 'System'} · {new Date(n.timestamp).toLocaleString()}
                        </div>
                      </div>
                      {!isRead && (
                        <button
                          type="button"
                          onClick={() => notificationService.markAsRead(n.id, session.memberId)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold cursor-pointer self-start sm:self-auto"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* ====================================================================
            DEPARTMENT OF POST (BRD-INPOST-01): DIVISIONAL & STATUTORY GOVERNANCE ONLY
           ==================================================================== */}
        {isIndiaPost && effectiveTab === 'IP_HIERARCHY' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Divisional Postal Hierarchy Tree ({hierarchyNodes.length} nodes)
              </h2>
              <p className="text-xs text-slate-500">
                Circle → Region → Division → Subdivision → HPO → SO → BO
              </p>
            </div>
            <div className="divide-y divide-slate-100 text-xs max-h-[520px] overflow-y-auto">
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
        )}

        {isIndiaPost && effectiveTab === 'IP_GEO_QUALITY' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap gap-2 text-xs">
              {[
                { key: 'LOCATION_INTEL', label: '11-Level Geo Hub & Privacy Map' },
                { key: 'DATA_QUALITY', label: 'Duplicate & Data Quality Audit' },
                { key: 'ADDRESS', label: 'Address Resolution Engine' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTabAndSub('IP_GEO_QUALITY', item.key)}
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
            <Suspense fallback={<EmbeddedModuleLoading />}>
              {ipGeoMode === 'LOCATION_INTEL' && <LocationIntelligenceHub indiaPostOwnerAccess />}
              {ipGeoMode === 'DATA_QUALITY' && <DataQualityView />}
              {ipGeoMode === 'ADDRESS' && <AddressResolutionView />}
            </Suspense>
          </div>
        )}

        {isIndiaPost && effectiveTab === 'IP_SRM' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  India Post SRM &amp; Escalations Queue ({indiaPostSrmTickets.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Division-scoped SLA service requests across Kota Division offices and beats.
                </p>
              </div>
            </div>
            {indiaPostSrmTickets.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No SRM tickets logged yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {indiaPostSrmTickets.map((tk) => (
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
                    <select
                      value={tk.status}
                      onChange={(e) =>
                        xpeedoOpsService.updateSrmTicketStatus(
                          tk.id,
                          { status: e.target.value as any },
                          session.memberName,
                          'CLIENT_ADMIN'
                        )
                      }
                      className="px-2.5 py-1 border border-slate-300 rounded-lg bg-white font-semibold"
                    >
                      <option value="Open">Open</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Escalated">Escalated</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isIndiaPost && effectiveTab === 'IP_STATUTORY_DOCS' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap gap-2 text-xs">
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
            <Suspense fallback={<EmbeddedModuleLoading />}>
              {ipDocsMode === 'DOCS_HUB' && <OfficialStaffDocumentsHub />}
              {ipDocsMode === 'ACG61' && <Acg61ChargeReportView indiaPostOwnerAccess />}
              {ipDocsMode === 'ARTICLES' && <PostmanAllDayArticlesOverview embedded />}
            </Suspense>
          </div>
        )}

        {isIndiaPost && effectiveTab === 'IP_DAILY_OPS' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap gap-2 text-xs">
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
            <Suspense fallback={<EmbeddedModuleLoading />}>
              {ipDailyMode === 'VERIFICATION' && <DailyVerificationView />}
              {ipDailyMode === 'SURVEY' && <DoorstepSurveyWorkflowView />}
            </Suspense>
          </div>
        )}

        {isIndiaPost && effectiveTab === 'IP_LMS_STOREFRONT' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveTabAndSub('IP_LMS_STOREFRONT', 'LMS')}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                  ipLmsMode === 'LMS'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Postal Departmental LMS
              </button>
              {retailActive && (
                <button
                  type="button"
                  onClick={() => setActiveTabAndSub('IP_LMS_STOREFRONT', 'STOREFRONT')}
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
            <Suspense fallback={<EmbeddedModuleLoading />}>
              {(ipLmsMode === 'LMS' || !retailActive) && <PostalLMSView />}
              {retailActive && ipLmsMode === 'STOREFRONT' && <IndiaPostStorefrontView />}
            </Suspense>
          </div>
        )}

        {isIndiaPost && effectiveTab === 'IP_NOTIFICATIONS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell size={16} className="text-red-700" />
                <span>Broadcast Divisional Notice</span>
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!divNotifTitle.trim() || !divNotifMessage.trim()) return;
                  notificationService.broadcastNotification({
                    title: divNotifTitle.trim(),
                    message: divNotifMessage.trim(),
                    senderName: session.memberName,
                    category: 'CIRCULAR',
                    priority: 'High',
                    targetBeat: divNotifBeat,
                  });
                  setDivNotifTitle('');
                  setDivNotifMessage('');
                  setNoticeMsg(`Published divisional notice to ${divNotifBeat}.`);
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

            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Divisional Circulars &amp; Alerts ({notifications.length})
                </h2>
                <button
                  type="button"
                  onClick={() => notificationService.markAllAsRead(session.memberId)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Mark All Read
                </button>
              </div>
              <div className="divide-y divide-slate-100 text-xs max-h-[480px] overflow-y-auto">
                {notifications.map((n) => (
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
                        onClick={() => notificationService.markAsRead(n.id, session.memberId)}
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

      {/* ====================================================================
          MODAL: ADD BRAND CUSTOMER / STORE CRM RECORD
         ==================================================================== */}
      {showAddCrmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden text-xs">
            <div
              className="px-5 py-4 text-white flex items-center justify-between"
              style={{ backgroundColor: accent }}
            >
              <h3 className="text-sm font-bold">Add Customer &amp; CRM · {branding.displayName}</h3>
              <button
                type="button"
                onClick={() => setShowAddCrmModal(false)}
                className="text-slate-200 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateCrmAndCustomer} className="p-5 space-y-3 max-h-[80vh] overflow-y-auto">
              {stores.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Store / Hub</label>
                  <select
                    value={crmStoreId}
                    onChange={(e) => {
                      setCrmStoreId(e.target.value);
                      const s = storeLookup.get(e.target.value);
                      if (s) setCrmPincode(s.pincode);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="">Brand Direct (No Store Tag)</option>
                    {stores.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} (PIN {st.pincode})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={crmCustomerName}
                    onChange={(e) => setCrmCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={crmCustomerPhone}
                    onChange={(e) =>
                      setCrmCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PIN / Beat *</label>
                  <input
                    type="text"
                    required
                    value={crmPincode}
                    onChange={(e) => setCrmPincode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Category</label>
                  <input
                    type="text"
                    value={crmCategory}
                    onChange={(e) => setCrmCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Colony / Locality</label>
                <input
                  type="text"
                  value={crmColony}
                  onChange={(e) => setCrmColony(e.target.value)}
                  placeholder="Optional colony or hub area"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              {brandProperties.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Link Property</label>
                  <select
                    value={crmPropertyId}
                    onChange={(e) => setCrmPropertyId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="">No property selected</option>
                    {brandProperties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.propertyCode} · {p.addressLine}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product / Service Inquiry *</label>
                <input
                  type="text"
                  required
                  value={crmService}
                  onChange={(e) => setCrmService(e.target.value)}
                  placeholder="Product, scheme, or B2B quote"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stage</label>
                  <select
                    value={crmStage}
                    onChange={(e) => setCrmStage(e.target.value as StoreCrmStage)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    {CRM_STAGES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign To</label>
                  <select
                    value={crmAssigneeId}
                    onChange={(e) => setCrmAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="">Self ({session.memberName})</option>
                    {activeMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={crmNotes}
                  onChange={(e) => setCrmNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCrmModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-semibold cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: EDIT CRM RECORD
         ==================================================================== */}
      {editingCrm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Update Record · {editingCrm.customerName}</h3>
              <button
                type="button"
                onClick={() => setEditingCrm(null)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUpdateCrm} className="p-5 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pipeline Stage</label>
                <select
                  value={editCrmStage}
                  onChange={(e) => setEditCrmStage(e.target.value as StoreCrmStage)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  {CRM_STAGES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Staff</label>
                <select
                  value={editCrmAssigneeId}
                  onChange={(e) => setEditCrmAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="">Unassigned</option>
                  {activeMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Follow-Up Notes</label>
                <textarea
                  rows={3}
                  value={editCrmNotes}
                  onChange={(e) => setEditCrmNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCrm(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-semibold inline-flex items-center gap-1 cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  <Check size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: CREATE BRAND LEAD
         ==================================================================== */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-4 text-white flex items-center justify-between" style={{ backgroundColor: accent }}>
              <h3 className="text-sm font-bold">New Lead · {branding.displayName}</h3>
              <button type="button" onClick={() => setShowAddLeadModal(false)} className="cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={leadCustName}
                    onChange={(e) => setLeadCustName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={leadCustMobile}
                    onChange={(e) => setLeadCustMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product / Service *</label>
                  <input
                    type="text"
                    required
                    value={leadProductName}
                    onChange={(e) => setLeadProductName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={leadCategory}
                    onChange={(e) => setLeadCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={leadPriority}
                    onChange={(e) => setLeadPriority(e.target.value as Lead['priority'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PIN / Beat</label>
                  <input
                    type="text"
                    value={leadPincode}
                    onChange={(e) => setLeadPincode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
              {brandProperties.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Linked Property</label>
                  <select
                    value={leadPropertyId}
                    onChange={(e) => setLeadPropertyId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="">Unlinked</option>
                    {brandProperties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.propertyCode} · {p.addressLine}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requirement</label>
                <textarea
                  rows={2}
                  value={leadRequirement}
                  onChange={(e) => setLeadRequirement(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-semibold cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: SCHEDULE FOLLOW-UP
         ==================================================================== */}
      {showAddFollowUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-4 text-white flex items-center justify-between" style={{ backgroundColor: accent }}>
              <h3 className="text-sm font-bold">Schedule Follow-Up</h3>
              <button type="button" onClick={() => setShowAddFollowUpModal(false)} className="cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateFollowUp} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={fuCustName}
                    onChange={(e) => setFuCustName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={fuCustPhone}
                    onChange={(e) => setFuCustPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={fuDueDate}
                    onChange={(e) => setFuDueDate(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={fuPriority}
                    onChange={(e) => setFuPriority(e.target.value as 'Normal' | 'High' | 'Urgent')}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={fuCategory}
                    onChange={(e) => setFuCategory(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              {brandProperties.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Property Link</label>
                  <select
                    value={fuPropertyId}
                    onChange={(e) => setFuPropertyId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="">None</option>
                    {brandProperties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.propertyCode} · {p.addressLine}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Next Action *</label>
                <input
                  type="text"
                  required
                  value={fuNextAction}
                  onChange={(e) => setFuNextAction(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Timeline Note</label>
                <textarea
                  rows={2}
                  value={fuNote}
                  onChange={(e) => setFuNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFollowUpModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-semibold cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  Save Follow-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: REGISTER / EDIT TRACEABLE PROPERTY
         ==================================================================== */}
      {showPropertyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {propEditingId ? 'Edit Traceable Property' : `Register Property · ${branding.displayName}`}
              </h3>
              <button type="button" onClick={() => setShowPropertyModal(false)} className="cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveProperty} className="p-5 space-y-3 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Property Type *</label>
                  <select
                    value={propType}
                    onChange={(e) => setPropType(e.target.value as PropertyRecord['propertyType'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Property Code (Auto if blank)</label>
                  <input
                    type="text"
                    value={propCode}
                    onChange={(e) => setPropCode(e.target.value)}
                    placeholder="e.g. PROP-324009-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Beat / PIN *</label>
                  <input
                    type="text"
                    required
                    value={propBeatPin}
                    onChange={(e) => setPropBeatPin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Office / Hub ID</label>
                  <input
                    type="text"
                    value={propOfficeId}
                    onChange={(e) => setPropOfficeId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={propCategory}
                    onChange={(e) => setPropCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Address *</label>
                <input
                  type="text"
                  required
                  value={propAddress}
                  onChange={(e) => setPropAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Landmark</label>
                  <input
                    type="text"
                    value={propLandmark}
                    onChange={(e) => setPropLandmark(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Geo / Trace Tag</label>
                  <input
                    type="text"
                    value={propGeoTag}
                    onChange={(e) => setPropGeoTag(e.target.value)}
                    placeholder="Lat/Lng or physical tag"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Occupancy</label>
                  <select
                    value={propOccupancy}
                    onChange={(e) => setPropOccupancy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="Owner Occupied">Owner Occupied</option>
                    <option value="Rented / Tenant">Rented / Tenant</option>
                    <option value="Mixed Use">Mixed Use</option>
                    <option value="Vacant">Vacant</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Linked Unit Notes</label>
                  <input
                    type="text"
                    value={propUnitNotes}
                    onChange={(e) => setPropUnitNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPropertyModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-semibold cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: CREATE VERIFICATION INQUIRY
         ==================================================================== */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-4 text-white flex items-center justify-between" style={{ backgroundColor: accent }}>
              <h3 className="text-sm font-bold">New Verification / Customer Inquiry</h3>
              <button type="button" onClick={() => setShowVerificationModal(false)} className="cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateVerification} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={vfCustName}
                    onChange={(e) => setVfCustName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={vfCustPhone}
                    onChange={(e) => setVfCustPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PIN / Beat *</label>
                  <input
                    type="text"
                    required
                    value={vfBeatPin}
                    onChange={(e) => setVfBeatPin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={vfCategory}
                    onChange={(e) => setVfCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              {brandProperties.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Property Link</label>
                  <select
                    value={vfPropertyId}
                    onChange={(e) => setVfPropertyId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="">None</option>
                    {brandProperties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.propertyCode} · {p.addressLine}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Verification Topic *</label>
                <input
                  type="text"
                  required
                  value={vfTopic}
                  onChange={(e) => setVfTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Details</label>
                <textarea
                  rows={2}
                  value={vfDetails}
                  onChange={(e) => setVfDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVerificationModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-semibold cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  Submit Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: ADD BRAND-LINKED STORE
         ==================================================================== */}
      {showAddStoreModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Add Store / Hub Under {branding.displayName}</h3>
              <button
                type="button"
                onClick={() => setShowAddStoreModal(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddBrandStore} className="p-5 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Store / Hub Name *</label>
                <input
                  type="text"
                  required
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={newStorePincode}
                    onChange={(e) => setNewStorePincode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Beat / Route</label>
                  <input
                    type="text"
                    value={newStoreBeat}
                    onChange={(e) => setNewStoreBeat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Manager Name</label>
                <input
                  type="text"
                  value={newStoreManager}
                  onChange={(e) => setNewStoreManager(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={newStoreAddress}
                  onChange={(e) => setNewStoreAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStoreModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-semibold cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: EDIT STORE
         ==================================================================== */}
      {editingStore && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Edit Store · {editingStore.name}</h3>
              <button
                type="button"
                onClick={() => setEditingStore(null)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveStoreEdit} className="p-5 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Manager Name</label>
                <input
                  type="text"
                  value={editStoreManager}
                  onChange={(e) => setEditStoreManager(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Manager Phone</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={editStorePhone}
                  onChange={(e) => setEditStorePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={editStoreAddress}
                  onChange={(e) => setEditStoreAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Store Status</label>
                <select
                  value={editStoreStatus}
                  onChange={(e) => setEditStoreStatus(e.target.value as PartnerLifecycleStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStore(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-semibold cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  Save Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: ADD INTERNAL TEAM MEMBER / NON-TERRITORY B2B AGENT
         ==================================================================== */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Add Internal Team Member / B2B Agent</h3>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddTeamMember} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={tmName}
                    onChange={(e) => setTmName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role *</label>
                  <select
                    value={tmRole}
                    onChange={(e) => {
                      const role = e.target.value as PartnerTeamRole;
                      setTmRole(role);
                      const cfg = partnerBrandService.getBrandRbacConfig(session.partnerId, role);
                      setTmPerms({ ...cfg.permissions });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    {EDITABLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={tmEmail}
                    onChange={(e) => setTmEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={tmPhone}
                    onChange={(e) => setTmPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Login Passcode *</label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={tmPasscode}
                    onChange={(e) => setTmPasscode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Non-Territory B2B Category Mode Toggle */}
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2">
                <label className="flex items-center gap-2 font-bold text-indigo-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tmIsNonTerritory}
                    onChange={(e) => setTmIsNonTerritory(e.target.checked)}
                  />
                  <span>Non-Territory B2B Category Agent (Own Created / Assigned Entries Only)</span>
                </label>
                {tmIsNonTerritory ? (
                  <input
                    type="text"
                    value={tmCategoriesText}
                    onChange={(e) => setTmCategoriesText(e.target.value)}
                    placeholder="Assigned Categories (comma separated, e.g. PLI/RPLI, EV Fleet, B2B Cargo)"
                    className="w-full px-3 py-1.5 bg-white border border-indigo-300 rounded-lg"
                  />
                ) : (
                  <input
                    type="text"
                    value={tmBeatOrPin}
                    onChange={(e) => setTmBeatOrPin(e.target.value)}
                    placeholder="Optional Beat / PIN restriction (e.g. 324009)"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                )}
              </div>

              {!tmIsNonTerritory && stores.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-semibold text-slate-700">
                    Restrict Access to Specific Store(s) (leave unchecked for all stores)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stores.map((st) => (
                      <label
                        key={st.id}
                        className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={tmStoreIds.includes(st.id)}
                          onChange={() => toggleStoreAssignment(st.id, tmStoreIds, setTmStoreIds)}
                        />
                        <span className="truncate font-medium text-slate-800">{st.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="font-semibold text-slate-700">Member Permissions</div>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ['canCreateCrm', 'Create CRM Records'],
                      ['canEditCrm', 'Edit CRM Records'],
                      ['canManageStores', 'Edit Assigned Stores'],
                      ['canManageTeam', 'Manage Internal Team'],
                    ] as const
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={tmPerms[key]}
                        onChange={(e) =>
                          setTmPerms({ ...tmPerms, [key]: e.target.checked })
                        }
                      />
                      <span className="text-slate-800 font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-semibold cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  Create Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: EDIT OR APPROVE INTERNAL TEAM MEMBER
         ==================================================================== */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingMember.status === 'Pending'
                  ? `Approve Onboarding · ${editingMember.name}`
                  : `Edit Access · ${editingMember.name}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveMemberUpdate} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
              {editingMember.role !== 'PARTNER_OWNER' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={emRole}
                    onChange={(e) => {
                      const role = e.target.value as PartnerTeamRole;
                      setEmRole(role);
                      const cfg = partnerBrandService.getBrandRbacConfig(session.partnerId, role);
                      setEmPerms({ ...cfg.permissions });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                  >
                    {EDITABLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editingMember.role !== 'PARTNER_OWNER' && (
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2">
                  <label className="flex items-center gap-2 font-bold text-indigo-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emIsNonTerritory}
                      onChange={(e) => setEmIsNonTerritory(e.target.checked)}
                    />
                    <span>Non-Territory B2B Category Agent (Bypass beat/store lock; own records only)</span>
                  </label>
                  {emIsNonTerritory ? (
                    <input
                      type="text"
                      value={emCategoriesText}
                      onChange={(e) => setEmCategoriesText(e.target.value)}
                      placeholder="Categories (comma separated)"
                      className="w-full px-3 py-1.5 bg-white border border-indigo-300 rounded-lg"
                    />
                  ) : (
                    <input
                      type="text"
                      value={emBeatOrPin}
                      onChange={(e) => setEmBeatOrPin(e.target.value)}
                      placeholder="Beat / PIN restriction"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  )}
                </div>
              )}

              {!emIsNonTerritory && stores.length > 0 && editingMember.role !== 'PARTNER_OWNER' && (
                <div className="space-y-1.5">
                  <div className="font-semibold text-slate-700">
                    Assigned Store Scope (unchecked = all stores in brand)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stores.map((st) => (
                      <label
                        key={st.id}
                        className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={emStoreIds.includes(st.id)}
                          onChange={() => toggleStoreAssignment(st.id, emStoreIds, setEmStoreIds)}
                        />
                        <span className="truncate font-medium text-slate-800">{st.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="font-semibold text-slate-700">Permissions</div>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ['canCreateCrm', 'Create CRM Records'],
                      ['canEditCrm', 'Edit CRM Records'],
                      ['canManageStores', 'Edit Assigned Stores'],
                      ['canManageTeam', 'Manage Internal Team'],
                    ] as const
                  ).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        disabled={editingMember.role === 'PARTNER_OWNER'}
                        checked={emPerms[key]}
                        onChange={(e) =>
                          setEmPerms({ ...emPerms, [key]: e.target.checked })
                        }
                      />
                      <span className="text-slate-800 font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reset Passcode (Optional)
                </label>
                <input
                  type="password"
                  minLength={4}
                  value={emNewPasscode}
                  onChange={(e) => setEmNewPasscode(e.target.value)}
                  placeholder="Leave blank to keep existing passcode"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-semibold cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  {editingMember.status === 'Pending' ? 'Approve & Activate' : 'Save Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: ADD BRAND PRODUCT / CATALOG ITEM
         ==================================================================== */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-4 text-white flex items-center justify-between" style={{ backgroundColor: accent }}>
              <h3 className="text-sm font-bold">Add Catalog Offering · {branding.displayName}</h3>
              <button type="button" onClick={() => setShowAddProductModal(false)} className="cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddBrandProduct} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    value={catSku}
                    onChange={(e) => setCatSku(e.target.value)}
                    placeholder="Auto-generated if blank"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price / Tariff</label>
                  <input
                    type="text"
                    value={catPrice}
                    onChange={(e) => setCatPrice(e.target.value)}
                    placeholder="e.g. ₹499 or Custom"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product / Service Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={catCategory}
                  onChange={(e) => setCatCategory(e.target.value)}
                  placeholder={branding.category}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-semibold cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  Add to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: BROADCAST NOTIFICATION
         ==================================================================== */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Publish Brand Notice</h3>
              <button type="button" onClick={() => setShowNotifModal(false)} className="cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleBroadcastBrandNotice} className="p-5 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={notifPriority}
                  onChange={(e) => setNotifPriority(e.target.value as 'Normal' | 'High' | 'Urgent')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message *</label>
                <textarea
                  rows={3}
                  required
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNotifModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg font-semibold cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
