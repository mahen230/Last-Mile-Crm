import {
  Award,
  BarChart2,
  Bell,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  Database,
  FileBarChart2,
  FileCheck2,
  FileText,
  FolderKanban,
  GitBranch,
  GraduationCap,
  History,
  Home,
  KeyRound,
  Layers,
  LayoutDashboard,
  LucideIcon,
  Map,
  MapPin,
  Navigation,
  Package,
  Route,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Target,
  Ticket,
  TrendingUp,
  User,
  UserCheck,
  Users,
  Wallet,
  Workflow,
} from 'lucide-react';
import {
  FeatureVisibilityKey,
  PartnerAccount,
  ServiceModulePermissions,
  StaffProfile,
} from '../types/models';
import { featureVisibilityService } from '../services/featureVisibilityService';
import { staffPermissionService } from '../services/staffPermissionService';
import { BrandStaffSectionKey } from '../types/brandOwner';

export interface NavSubSubItem {
  id: string;
  label: string;
  to?: string;
  tabKey?: string;
  subModeKey?: string;
  icon?: LucideIcon;
  count?: number | string;
  locked?: boolean;
}

export interface NavSubItem {
  id: string;
  label: string;
  to?: string;
  tabKey?: string;
  subModeKey?: string;
  icon?: LucideIcon;
  count?: number | string;
  locked?: boolean;
  children?: NavSubSubItem[];
}

export interface NavMenuItem {
  id: string;
  label: string;
  to?: string;
  tabKey?: string;
  subModeKey?: string;
  icon?: LucideIcon;
  count?: number | string;
  locked?: boolean;
  accentColor?: string;
  children?: NavSubItem[];
}

export interface NavSectionGroup {
  id: string;
  categoryLabel: string;
  sectionLabel: string;
  defaultExpanded?: boolean;
  menus: NavMenuItem[];
}

export function dedupeNavGroups(groups: NavSectionGroup[]): NavSectionGroup[] {
  const seenGroupIds = new Set<string>();
  const result: NavSectionGroup[] = [];

  for (const group of groups) {
    if (!group.id || seenGroupIds.has(group.id)) continue;
    seenGroupIds.add(group.id);

    const seenMenuIds = new Set<string>();
    const dedupedMenus: NavMenuItem[] = [];

    for (const menu of group.menus) {
      if (!menu.id || seenMenuIds.has(menu.id)) continue;
      seenMenuIds.add(menu.id);

      let dedupedChildren: NavSubItem[] | undefined;
      if (menu.children && menu.children.length > 0) {
        const seenSubIds = new Set<string>();
        dedupedChildren = [];
        for (const sub of menu.children) {
          if (!sub.id || seenSubIds.has(sub.id)) continue;
          seenSubIds.add(sub.id);

          let dedupedGrandChildren: NavSubSubItem[] | undefined;
          if (sub.children && sub.children.length > 0) {
            const seenSubSubIds = new Set<string>();
            dedupedGrandChildren = [];
            for (const subSub of sub.children) {
              if (!subSub.id || seenSubSubIds.has(subSub.id)) continue;
              seenSubSubIds.add(subSub.id);
              dedupedGrandChildren.push(subSub);
            }
          }
          dedupedChildren.push({ ...sub, children: dedupedGrandChildren });
        }
      }

      dedupedMenus.push({ ...menu, children: dedupedChildren });
    }

    if (dedupedMenus.length > 0) {
      result.push({ ...group, menus: dedupedMenus });
    }
  }

  return result;
}

export interface MainShellNavParams {
  userProfile: StaffProfile | null;
  isAdmin: boolean;
  isCommandShell: boolean;
  isWhiteLabel: boolean;
  isRegionalOrCategoryManager: boolean;
  strictVendorId: string | null;
  retailServicesActive: boolean;
  brandPartners: PartnerAccount[];
  unreadOpsNotifications: number;
  customerCount: number;
  leadCount: number;
  addressExceptionsCount: number;
  canAccessSpecialBills: boolean;
  showDocs: boolean;
  showDailyOps: boolean;
  showProperty: boolean;
  showMembers: boolean;
  showLeads: boolean;
  canShowCommercialNetwork: boolean;
  isViewerOnly: boolean;
}

export function buildMainShellNav(params: MainShellNavParams): NavSectionGroup[] {
  const {
    userProfile,
    isAdmin,
    isCommandShell,
    isWhiteLabel,
    isRegionalOrCategoryManager,
    strictVendorId,
    retailServicesActive,
    brandPartners,
    unreadOpsNotifications,
    customerCount,
    leadCount,
    addressExceptionsCount,
    canAccessSpecialBills,
    showDocs,
    showDailyOps,
    showProperty,
    showMembers,
    showLeads,
    canShowCommercialNetwork,
    isViewerOnly,
  } = params;

  const isVisible = (featureKey?: FeatureVisibilityKey): boolean =>
    featureKey ? featureVisibilityService.isFeatureVisible(userProfile, featureKey) : true;

  const isModLocked = (mod?: keyof ServiceModulePermissions): boolean =>
    mod ? !staffPermissionService.canAccessServiceModule(userProfile, mod) : false;

  const groups: NavSectionGroup[] = [];

  // 1. Overview & Execution
  if (isCommandShell) {
    groups.push({
      id: 'cat-overview-execution',
      categoryLabel: 'Overview & Execution',
      sectionLabel: 'Command Operations',
      defaultExpanded: true,
      menus: [
        { id: 'cmd-dashboard', label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
        { id: 'cmd-clients', label: 'Clients', to: '/clients', icon: Building2 },
        {
          id: 'cmd-projects-tasks',
          label: 'Projects & Execution',
          icon: FolderKanban,
          children: [
            { id: 'cmd-projects', label: 'Projects Directory', to: '/projects', icon: FolderKanban },
            { id: 'cmd-tasks', label: 'Task Management', to: '/task-management', icon: ClipboardList },
            { id: 'cmd-workflows', label: 'Workflows & Automation', to: '/workflows', icon: Workflow },
          ],
        },
        {
          id: 'cmd-org-workforce',
          label: 'Workforce & Departments',
          icon: Users,
          children: [
            { id: 'cmd-employees', label: 'Employees Directory', to: '/employees', icon: Users },
            { id: 'cmd-departments', label: 'Departments', to: '/departments', icon: Layers },
            ...(isAdmin
              ? [{ id: 'cmd-staff-master', label: 'Core Staff (Staff 1–5)', to: '/staff-master', icon: Briefcase }]
              : []),
          ],
        },
        {
          id: 'cmd-india-post',
          label: 'India Post Ops',
          to: '/india-post',
          icon: Building,
        },
        {
          id: 'cmd-xpeedo-ev',
          label: 'Xpeedo EV Ops',
          to: '/xpeedo-ev',
          icon: Briefcase,
        },
        {
          id: 'cmd-notifications',
          label: 'Notifications',
          to: '/notifications',
          icon: Bell,
          count: unreadOpsNotifications > 0 ? unreadOpsNotifications : undefined,
        },
      ],
    });
  } else {
    groups.push({
      id: 'cat-staff-core',
      categoryLabel: 'Overview & Execution',
      sectionLabel: isWhiteLabel ? 'India Post Workspace' : 'Core Operations',
      defaultExpanded: true,
      menus: [
        { id: 'staff-dashboard', label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
        ...(showProperty && isVisible('property')
          ? [{ id: 'staff-properties', label: 'Property Registry', to: '/properties', icon: Building }]
          : []),
        ...(showMembers && isVisible('members')
          ? [
              {
                id: 'staff-members',
                label: 'Members Directory',
                to: '/customers',
                icon: Users,
                count: customerCount || undefined,
              },
            ]
          : []),
      ],
    });
  }

  // 2. Brand Workspaces (3-Level Hierarchy: Brand -> Sub-Menu -> Sub-Sub-Menu)
  if (isAdmin && !isWhiteLabel && strictVendorId !== 'INDIA_POST' && brandPartners.length > 0) {
    groups.push({
      id: 'cat-brand-workspaces',
      categoryLabel: 'Workspace & Team',
      sectionLabel: 'Brand Workspaces (3-Level)',
      defaultExpanded: false,
      menus: brandPartners.map((brand) => {
        const isIndiaPost = brand.partnerSlug === 'india-post';
        const isXpokartBrand = brand.partnerSlug === 'xpokart';
        const baseChildren: NavSubItem[] = isXpokartBrand
          ? [
              {
                id: `brand-${brand.partnerSlug}-portal`,
                label: 'Xpokart E-Commerce Studio',
                to: `/brand-portal/${brand.partnerSlug}`,
                icon: Store,
                children: [
                  {
                    id: `brand-${brand.partnerSlug}-ov`,
                    label: 'Storefront Overview',
                    to: `/brand-portal/${brand.partnerSlug}?tab=OVERVIEW`,
                    icon: LayoutDashboard,
                  },
                  {
                    id: `brand-${brand.partnerSlug}-cat`,
                    label: 'Product Catalog & Selling',
                    to: `/brand-portal/${brand.partnerSlug}?tab=XPO_PRODUCTS`,
                    icon: Package,
                  },
                  {
                    id: `brand-${brand.partnerSlug}-orders`,
                    label: 'Cart, Orders & Checkout',
                    to: `/brand-portal/${brand.partnerSlug}?tab=XPO_CUSTOMER_PORTAL`,
                    icon: Store,
                  },
                  {
                    id: `brand-${brand.partnerSlug}-cfg`,
                    label: 'Storefront Config',
                    to: `/brand-portal/${brand.partnerSlug}?tab=XPO_STOREFRONT`,
                    icon: Sparkles,
                  },
                  {
                    id: `brand-${brand.partnerSlug}-cust`,
                    label: 'Store Buyers',
                    to: `/brand-portal/${brand.partnerSlug}?tab=CUSTOMERS`,
                    icon: Users,
                  },
                ],
              },
              {
                id: `brand-${brand.partnerSlug}-public`,
                label: 'Public E-Commerce Store',
                to: `/brand/${brand.partnerSlug}`,
                icon: Store,
              },
              {
                id: `brand-${brand.partnerSlug}-login`,
                label: 'Merchant Sign-In',
                to: `/brand-login/${brand.partnerSlug}`,
                icon: KeyRound,
              },
            ]
          : [
              {
                id: `brand-${brand.partnerSlug}-portal`,
                label: 'Brand Owner Portal',
                to: `/brand-portal/${brand.partnerSlug}`,
                icon: Store,
                children: [
                  {
                    id: `brand-${brand.partnerSlug}-ov`,
                    label: 'Dashboard Overview',
                    to: `/brand-portal/${brand.partnerSlug}?tab=OVERVIEW`,
                    icon: LayoutDashboard,
                  },
                  {
                    id: `brand-${brand.partnerSlug}-search`,
                    label: 'Master Search Console',
                    to: `/brand-portal/${brand.partnerSlug}?tab=MASTER_SEARCH`,
                    icon: Search,
                  },
                  {
                    id: `brand-${brand.partnerSlug}-offices`,
                    label: 'Office Master',
                    to: `/brand-portal/${brand.partnerSlug}?tab=OFFICES_STORES`,
                    icon: Building2,
                  },
                  {
                    id: `brand-${brand.partnerSlug}-staff`,
                    label: 'Master Staff',
                    to: `/brand-portal/${brand.partnerSlug}?tab=STAFF`,
                    icon: Users,
                  },
                  {
                    id: `brand-${brand.partnerSlug}-role`,
                    label: 'Master Role',
                    to: `/brand-portal/${brand.partnerSlug}?tab=MASTER_ROLE`,
                    icon: ShieldCheck,
                  },
                  {
                    id: `brand-${brand.partnerSlug}-promo`,
                    label: 'Promotion Master',
                    to: `/brand-portal/${brand.partnerSlug}?tab=PROMOTION_MASTER`,
                    icon: Award,
                  },
                  {
                    id: `brand-${brand.partnerSlug}-cust`,
                    label: 'Customers & Leads',
                    to: `/brand-portal/${brand.partnerSlug}?tab=CUSTOMERS`,
                    icon: Users,
                  },
                ],
              },
              {
                id: `brand-${brand.partnerSlug}-partner-ws`,
                label: 'Partner Scoped CRM',
                to: `/partner/workspace/${brand.partnerSlug}`,
                icon: Briefcase,
                children: [
                  {
                    id: `brand-${brand.partnerSlug}-p-dash`,
                    label: 'Partner Dashboard',
                    to: `/partner/workspace/${brand.partnerSlug}?tab=DASHBOARD`,
                    icon: LayoutDashboard,
                  },
                  {
                    id: `brand-${brand.partnerSlug}-p-leads`,
                    label: 'Leads & Follow-Ups',
                    to: `/partner/workspace/${brand.partnerSlug}?tab=LEADS`,
                    icon: TrendingUp,
                  },
                  {
                    id: `brand-${brand.partnerSlug}-p-rbac`,
                    label: 'Master Staff & Roles',
                    to: `/partner/workspace/${brand.partnerSlug}?tab=RBAC_TEAM`,
                    icon: ShieldCheck,
                  },
                ],
              },
              ...(isIndiaPost
                ? [
                    {
                      id: `brand-${brand.partnerSlug}-ip-modules`,
                      label: 'Department of Post Governance',
                      icon: Building,
                      children: [
                        {
                          id: `brand-${brand.partnerSlug}-ip-hier`,
                          label: 'Divisional Hierarchy',
                          to: `/brand-portal/india-post?tab=IP_HIERARCHY`,
                          icon: GitBranch,
                        },
                        {
                          id: `brand-${brand.partnerSlug}-ip-geo`,
                          label: 'Geo & Data Quality',
                          to: `/brand-portal/india-post?tab=IP_GEO_QUALITY`,
                          icon: MapPin,
                        },
                        {
                          id: `brand-${brand.partnerSlug}-ip-docs`,
                          label: 'Statutory Docs & ACG-61',
                          to: `/brand-portal/india-post?tab=IP_STATUTORY_DOCS`,
                          icon: FileText,
                        },
                        {
                          id: `brand-${brand.partnerSlug}-ip-ops`,
                          label: 'Daily Ops & Surveys',
                          to: `/brand-portal/india-post?tab=IP_DAILY_OPS`,
                          icon: UserCheck,
                        },
                        {
                          id: `brand-${brand.partnerSlug}-ip-srm`,
                          label: 'SRM & Escalations',
                          to: `/brand-portal/india-post?tab=IP_SRM`,
                          icon: Ticket,
                        },
                      ],
                    },
                  ]
                : []),
              {
                id: `brand-${brand.partnerSlug}-login`,
                label: 'Brand Owner Sign-In',
                to: `/brand-login/${brand.partnerSlug}`,
                icon: KeyRound,
              },
            ];

        return {
          id: `brand-menu-${brand.partnerSlug}`,
          label: brand.displayName,
          icon: Building2,
          accentColor: brand.accentColor,
          children: baseChildren,
        };
      }),
    });
  }

  // 3. Territory, CRM & India Post Field Operations
  const fieldMenus: NavMenuItem[] = [];

  if (isAdmin || isRegionalOrCategoryManager) {
    fieldMenus.push({
      id: 'territory-crm-hub',
      label: 'CRM & Property Hub',
      icon: Home,
      children: [
        ...(isVisible('property')
          ? [
              { id: 'field-prop-list', label: 'Property Registry', to: '/properties', icon: Home },
              ...(!isViewerOnly
                ? [
                    {
                      id: 'field-prop-family',
                      label: 'Unified Property & Family',
                      to: '/unified-properties',
                      icon: Home,
                    },
                  ]
                : []),
            ]
          : []),
        ...(isVisible('members')
          ? [
              {
                id: 'field-customers',
                label: 'Members Directory',
                to: '/customers',
                icon: Users,
                count: customerCount || undefined,
              },
            ]
          : []),
        ...(isVisible('beats')
          ? [
              { id: 'field-colony-master', label: 'Colony Master', to: '/colony-master', icon: Building2 },
              { id: 'field-beats', label: 'Beat Management', to: '/beats', icon: Map },
            ]
          : []),
      ],
    });
  } else {
    if (isVisible('beats')) {
      fieldMenus.push({
        id: 'staff-beats-menu',
        label: 'My Beat & Delivery Map',
        icon: MapPin,
        children: [
          { id: 'staff-my-beat', label: 'My Beat Directory', to: '/my-beat', icon: MapPin },
          { id: 'staff-beat-map', label: 'Delivery Map / Route', to: '/beats-map', icon: Navigation },
        ],
      });
    }
  }

  if (isVisible('locationIntelligence') || isVisible('dailyVerification')) {
    const geoChildren: NavSubItem[] = [];
    if (isVisible('locationIntelligence')) {
      geoChildren.push({
        id: 'field-loc-intel',
        label: '11-Level Location Intel',
        to: '/location-intelligence',
        icon: MapPin,
      });
    }
    if (isVisible('dailyVerification')) {
      geoChildren.push(
        {
          id: 'field-doorstep',
          label: 'Doorstep Surveys (7-Stage)',
          to: '/doorstep-surveys',
          icon: FileCheck2,
        },
        ...(isAdmin
          ? [
              {
                id: 'field-verifications',
                label: 'Daily Field Verification',
                to: '/verifications',
                icon: ShieldCheck,
              },
              {
                id: 'field-addr-ex',
                label: 'AI Address Exceptions',
                to: '/address-resolution',
                icon: MapPin,
                count: addressExceptionsCount || undefined,
              },
            ]
          : !isViewerOnly
          ? [
              {
                id: 'staff-daily-verify',
                label: 'Daily Verification',
                to: '/daily-verification',
                icon: FileCheck2,
              },
            ]
          : [])
      );
    }
    if (geoChildren.length > 0) {
      fieldMenus.push({
        id: 'field-geo-surveys',
        label: 'Geo & Verification Ops',
        icon: Navigation,
        children: geoChildren,
      });
    }
  }

  if (isVisible('leadsAndSchemes') || isVisible('lms') || isVisible('staffDirectory')) {
    const schemeChildren: NavSubItem[] = [];
    if (isVisible('leadsAndSchemes')) {
      schemeChildren.push(
        {
          id: 'field-schemes',
          label: 'Postal Schemes Catalog',
          to: '/services',
          icon: Sparkles,
          locked: isModLocked('productSchemeLeadSection'),
        },
        {
          id: 'field-leads',
          label: 'Leads & Pipeline',
          to: '/leads',
          icon: Target,
          count: showLeads && leadCount ? leadCount : undefined,
          locked: isModLocked('productSchemeLeadSection'),
        }
      );
    }
    if (isVisible('lms')) {
      schemeChildren.push({
        id: 'field-lms',
        label: 'Postal Exam LMS Hub',
        to: '/postal-lms',
        icon: GraduationCap,
      });
    }
    if (isVisible('staffDirectory')) {
      schemeChildren.push({
        id: 'field-staff-dir',
        label: 'Staff Contact Directory',
        to: '/staff-directory',
        icon: Users,
      });
    }
    if (schemeChildren.length > 0) {
      fieldMenus.push({
        id: 'field-schemes-lms',
        label: 'Schemes, Leads & LMS',
        icon: GraduationCap,
        children: schemeChildren,
      });
    }
  }

  if (isAdmin && (strictVendorId === null || strictVendorId === 'INDIA_POST')) {
    fieldMenus.push({
      id: 'field-office-master',
      label: 'India Post Office Master',
      to: '/office-master',
      icon: Building,
    });
  }

  if (fieldMenus.length > 0) {
    groups.push({
      id: 'cat-field-india-post',
      categoryLabel: 'Field & India Post Modules',
      sectionLabel: 'India Post & Territory Ops',
      defaultExpanded: false,
      menus: fieldMenus,
    });
  }

  // 4. Forms & Statutory Records (Collapsed by default)
  if (canAccessSpecialBills && (showDocs || showDailyOps)) {
    const docsSubItems: NavSubItem[] = [];
    if (showDocs) {
      docsSubItems.push(
        { id: 'form-official-hub', label: 'Documents & Records Hub', to: '/official-documents', icon: FileCheck2 },
        { id: 'form-acg61', label: 'a. ACG-61 Charge Report', to: '/charge-report', icon: ClipboardCheck },
        { id: 'form-apps', label: 'b. Official Applications', to: '/official-applications', icon: FileText },
        { id: 'form-byod', label: 'd. BYOD & Allowance Bills', to: '/special-forms', icon: Smartphone },
        { id: 'form-npr', label: 'e. NPR & Office Expenses', to: '/special-forms', icon: Database }
      );
    }
    if (showDailyOps) {
      docsSubItems.push({
        id: 'form-fuel',
        label: 'c. Monthly Fuel & Articles',
        to: '/postman-articles',
        icon: FileText,
      });
    }
    if (docsSubItems.length > 0) {
      groups.push({
        id: 'cat-forms-records',
        categoryLabel: 'Forms & Records',
        sectionLabel: 'Statutory & Fuel Ledgers',
        defaultExpanded: false,
        menus: [
          {
            id: 'forms-documents-hub',
            label: 'Forms & Documents Hub',
            icon: FileText,
            children: docsSubItems,
          },
        ],
      });
    }
  }

  // 5. Commercial Network — ONLY if retailServicesActive is true
  if (retailServicesActive && canShowCommercialNetwork) {
    const commMenus: NavMenuItem[] = [];
    if (isAdmin && isVisible('vendorSection')) {
      commMenus.push(
        { id: 'comm-partner-mgmt', label: 'Partner & Brand Hub', to: '/partner-brand-management', icon: ShieldCheck },
        { id: 'comm-vendor-eco', label: 'Vendor & Product Ecosystem', to: '/vendor-ecosystem', icon: Store }
      );
    }
    if (isVisible('commercialDirectory')) {
      commMenus.push(
        { id: 'comm-dir', label: 'Commercial Store Directory', to: '/commercial-directory', icon: Store },
        { id: 'comm-intel', label: 'AI Commercial Engine', to: '/commercial-intelligence', icon: Sparkles }
      );
    }
    if (isVisible('storefront') && !isViewerOnly) {
      commMenus.push({ id: 'comm-storefront', label: 'Storefront Studio', to: '/staff-storefront', icon: Store });
    }
    if (commMenus.length > 0) {
      groups.push({
        id: 'cat-commercial-network',
        categoryLabel: 'Retail & Commercial',
        sectionLabel: 'Storefronts & Network',
        defaultExpanded: false,
        menus: commMenus,
      });
    }
  }

  // 6. Governance & Settings
  if (isAdmin && !isWhiteLabel) {
    groups.push({
      id: 'cat-governance',
      categoryLabel: 'Governance & Settings',
      sectionLabel: 'RBAC, Partners & System',
      defaultExpanded: false,
      menus: [
        { id: 'gov-rbac', label: 'Master Control (RBAC)', to: '/role-access-dashboard', icon: Shield },
        { id: 'gov-partner-hub', label: 'Brand & Partner Directory', to: '/partner-brand-management', icon: ShieldCheck },
        { id: 'gov-brand-logins', label: 'Brand Profiles & Logins', to: '/settings?tab=BRAND_LOGINS', icon: KeyRound },
        { id: 'gov-documents', label: 'Documents Center', to: '/documents', icon: FileText },
        { id: 'gov-finance', label: 'Finance Ledger', to: '/finance', icon: Wallet },
        { id: 'gov-reports', label: 'Reports & Analytics', to: '/reports', icon: BarChart2 },
        { id: 'gov-audit', label: 'Activity & Security Logs', to: '/audit-log', icon: History },
        ...(isVisible('dataBackupCenter')
          ? [{ id: 'gov-backup', label: 'Data & Verified Backup', to: '/data-backup-center', icon: Database }]
          : []),
        { id: 'gov-settings', label: 'Settings & Toggles', to: '/settings', icon: Settings },
      ],
    });
  } else if (isRegionalOrCategoryManager) {
    groups.push({
      id: 'cat-regional-gov',
      categoryLabel: 'Governance & Settings',
      sectionLabel: 'Regional Access',
      defaultExpanded: false,
      menus: [{ id: 'reg-role-scope', label: 'Role & Team Scope', to: '/role-access-dashboard', icon: Shield }],
    });
  }

  return dedupeNavGroups(groups);
}

export interface BrandPortalNavParams {
  mode: 'OWNER' | 'PARTNER' | 'STAFF';
  brandName: string;
  isIndiaPost: boolean;
  isXpokart?: boolean;
  partnerSlug?: string;
  retailServicesActive: boolean;
  configuredOwnerSubMenus?: string[];
  staffAllowedSections?: BrandStaffSectionKey[];
  counts?: {
    customers?: number;
    leads?: number;
    followUps?: number;
    properties?: number;
    verifications?: number;
    stores?: number;
    team?: number;
    departments?: number;
    products?: number;
    academy?: number;
    notifications?: number;
    tasks?: number;
  };
}

export function buildBrandPortalNav(params: BrandPortalNavParams): NavSectionGroup[] {
  const {
    mode,
    isIndiaPost,
    retailServicesActive,
    configuredOwnerSubMenus = [
      'OVERVIEW',
      'CUSTOMERS',
      'PROPERTIES',
      'LEADS',
      'MASTER_SEARCH',
      'OPERATIONS_TASKS',
      'DEPARTMENTS_APPROVALS',
      'OFFICES_STORES',
      'STAFF',
      'MASTER_ROLE',
      'PROMOTION_MASTER',
      'REPORTS_EXPORTS',
      'AUDIT_HEALTH',
    ],
    staffAllowedSections = ['OVERVIEW', 'CUSTOMERS', 'LEADS', 'OPERATIONS', 'PROPERTIES', 'BEATS', 'MY_PROFILE'],
    counts = {},
  } = params;

  const isXpokart = Boolean(
    params.isXpokart ||
      params.brandName?.toLowerCase().includes('xpokart') ||
      params.partnerSlug?.toLowerCase().includes('xpokart')
  );

  const groups: NavSectionGroup[] = [];

  if (mode === 'OWNER') {
    const allowed = new Set(configuredOwnerSubMenus);

    groups.push({
      id: 'bp-exec',
      categoryLabel: 'Executive',
      sectionLabel: isXpokart ? 'Storefront Overview' : 'Workspace Overview',
      defaultExpanded: true,
      menus: [
        ...(allowed.has('OVERVIEW')
          ? [{ id: 'OVERVIEW', tabKey: 'OVERVIEW', label: 'Dashboard', icon: LayoutDashboard }]
          : []),
      ],
    });

    if (isXpokart) {
      // Strictly E-Commerce Storefront modules — zero Staff, zero Territory/Beats/Promotions
      groups.push({
        id: 'bp-xpokart-ecommerce',
        categoryLabel: 'Xpokart E-Commerce',
        sectionLabel: 'Storefront, Catalog & Checkout',
        defaultExpanded: true,
        menus: [
          {
            id: 'XPO_PRODUCTS',
            tabKey: 'XPO_PRODUCTS',
            label: 'Product Catalog & Categories',
            icon: Package,
            count: counts.products,
          },
          {
            id: 'XPO_CUSTOMER_PORTAL',
            tabKey: 'XPO_CUSTOMER_PORTAL',
            label: 'Cart, Orders & Checkout',
            icon: Store,
            count: counts.leads,
          },
          {
            id: 'XPO_STOREFRONT',
            tabKey: 'XPO_STOREFRONT',
            label: 'Storefront Settings',
            icon: Sparkles,
          },
          ...(allowed.has('CUSTOMERS')
            ? [
                {
                  id: 'CUSTOMERS',
                  tabKey: 'CUSTOMERS',
                  label: 'Store Buyers',
                  icon: Users,
                  count: counts.customers,
                },
              ]
            : []),
        ],
      });

      const reportMenus: NavMenuItem[] = [];
      if (allowed.has('REPORTS_EXPORTS')) {
        reportMenus.push({
          id: 'REPORTS_EXPORTS',
          tabKey: 'REPORTS_EXPORTS',
          label: 'Reports & Exports',
          icon: FileBarChart2,
        });
      }
      if (allowed.has('AUDIT_HEALTH')) {
        reportMenus.push({
          id: 'AUDIT_HEALTH',
          tabKey: 'AUDIT_HEALTH',
          label: 'Store Audit & Health',
          icon: ShieldCheck,
        });
      }
      if (reportMenus.length > 0) {
        groups.push({
          id: 'bp-reports-audit',
          categoryLabel: 'Reports & Audit',
          sectionLabel: 'Store Exports & Health',
          defaultExpanded: true,
          menus: reportMenus,
        });
      }
    } else {
      // 1. CRM & Operations Section: Customers, Properties, Leads, Master Search Console, Operations & Tasks
      const crmMenus: NavMenuItem[] = [];
      if (allowed.has('CUSTOMERS')) {
        crmMenus.push({
          id: 'CUSTOMERS',
          tabKey: 'CUSTOMERS',
          label: 'Customers',
          icon: Users,
          count: counts.customers,
        });
      }
      if (allowed.has('PROPERTIES') || isIndiaPost) {
        crmMenus.push({
          id: 'PROPERTIES',
          tabKey: 'PROPERTIES',
          label: 'Properties',
          icon: Home,
          count: counts.properties,
        });
      }
      if (allowed.has('LEADS') || isIndiaPost) {
        crmMenus.push({
          id: 'LEADS',
          tabKey: 'LEADS',
          label: 'Leads & Schemes',
          icon: TrendingUp,
          count: counts.leads,
        });
      }
      if (allowed.has('MASTER_SEARCH') || isIndiaPost) {
        crmMenus.push({
          id: 'MASTER_SEARCH',
          tabKey: 'MASTER_SEARCH',
          label: 'Master Search Console',
          icon: Search,
        });
      }
      if (allowed.has('OPERATIONS_TASKS')) {
        crmMenus.push({
          id: 'OPERATIONS_TASKS',
          tabKey: 'OPERATIONS_TASKS',
          label: 'Operations & Tasks',
          icon: ClipboardList,
          count: counts.tasks,
        });
      }
      if (allowed.has('DEPARTMENTS_APPROVALS')) {
        crmMenus.push({
          id: 'DEPARTMENTS_APPROVALS',
          tabKey: 'DEPARTMENTS_APPROVALS',
          label: 'Departments & Approvals',
          icon: Layers,
          count: counts.departments,
        });
      }
      if (crmMenus.length > 0) {
        groups.push({
          id: 'bp-crm',
          categoryLabel: 'CRM & Operations',
          sectionLabel: 'Properties, Customers, Leads & Master Search',
          defaultExpanded: true,
          menus: crmMenus,
        });
      }

      // 2. Territory & Team Section (4 Cleanly Connected Modules)
      const territoryTeamMenus: NavMenuItem[] = [];
      if (allowed.has('OFFICES_STORES')) {
        territoryTeamMenus.push({
          id: 'OFFICES_STORES',
          tabKey: 'OFFICES_STORES',
          label: 'Office Master',
          icon: Building2,
          count: counts.stores,
        });
      }
      if (allowed.has('STAFF')) {
        territoryTeamMenus.push({
          id: 'STAFF',
          tabKey: 'STAFF',
          label: 'Master Staff',
          icon: Users,
          count: counts.team,
        });
      }
      if (allowed.has('MASTER_ROLE') || allowed.has('STAFF')) {
        territoryTeamMenus.push({
          id: 'MASTER_ROLE',
          tabKey: 'MASTER_ROLE',
          label: 'Master Role',
          icon: ShieldCheck,
        });
      }
      if (allowed.has('PROMOTION_MASTER') || allowed.has('STAFF')) {
        territoryTeamMenus.push({
          id: 'PROMOTION_MASTER',
          tabKey: 'PROMOTION_MASTER',
          label: 'Promotion Master',
          icon: Award,
        });
      }
      if (territoryTeamMenus.length > 0) {
        groups.push({
          id: 'bp-assets-team',
          categoryLabel: 'Territory & Team',
          sectionLabel: 'Office Master, Master Staff, Role & Promotions',
          defaultExpanded: true,
          menus: territoryTeamMenus,
        });
      }

      // 3. Compliance & Exports
      const complianceMenus: NavMenuItem[] = [];
      if (allowed.has('REPORTS_EXPORTS')) {
        complianceMenus.push({
          id: 'REPORTS_EXPORTS',
          tabKey: 'REPORTS_EXPORTS',
          label: 'Reports & Exports',
          icon: FileBarChart2,
        });
      }
      if (allowed.has('AUDIT_HEALTH')) {
        complianceMenus.push({
          id: 'AUDIT_HEALTH',
          tabKey: 'AUDIT_HEALTH',
          label: 'Brand Audit Log & Health',
          icon: Shield,
        });
      }
      if (complianceMenus.length > 0) {
        groups.push({
          id: 'bp-compliance',
          categoryLabel: 'Compliance & Audit',
          sectionLabel: 'Reports, Exports & Immutable Audit',
          defaultExpanded: false,
          menus: complianceMenus,
        });
      }
    }
  } else if (mode === 'PARTNER') {
    groups.push({
      id: 'pw-exec',
      categoryLabel: 'Executive',
      sectionLabel: 'Workspace Overview',
      defaultExpanded: true,
      menus: [{ id: 'DASHBOARD', tabKey: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard }],
    });

    if (isXpokart) {
      groups.push({
        id: 'pw-xpokart-ecommerce',
        categoryLabel: 'Xpokart E-Commerce',
        sectionLabel: 'Catalog, Checkout & Buyers',
        defaultExpanded: true,
        menus: [
          { id: 'PRODUCTS', tabKey: 'PRODUCTS', label: 'Products & Storefront', icon: Package, count: counts.products },
          { id: 'CUSTOMERS', tabKey: 'CUSTOMERS', label: 'Store Buyers', icon: Users, count: counts.customers },
          { id: 'LEADS', tabKey: 'LEADS', label: 'Checkout & Order Leads', icon: TrendingUp, count: counts.leads },
          { id: 'FOLLOW_UPS', tabKey: 'FOLLOW_UPS', label: 'Order Follow-Ups', icon: Calendar, count: counts.followUps },
          { id: 'NOTIFICATIONS', tabKey: 'NOTIFICATIONS', label: 'Store Alerts', icon: Bell, count: counts.notifications },
        ],
      });
    } else {
      groups.push({
        id: 'pw-crm',
        categoryLabel: 'CRM & Operations',
        sectionLabel: 'Properties, Customers, Leads & Master Search',
        defaultExpanded: true,
        menus: [
          { id: 'CUSTOMERS', tabKey: 'CUSTOMERS', label: 'Customers', icon: Users, count: counts.customers },
          { id: 'PROPERTIES', tabKey: 'PROPERTIES', label: 'Properties', icon: MapPin, count: counts.properties },
          { id: 'LEADS', tabKey: 'LEADS', label: 'Leads & Schemes', icon: TrendingUp, count: counts.leads },
          { id: 'MASTER_SEARCH', tabKey: 'MASTER_SEARCH', label: 'Master Search Console', icon: Search },
          { id: 'FOLLOW_UPS', tabKey: 'FOLLOW_UPS', label: 'Follow-Ups', icon: Calendar, count: counts.followUps },
          {
            id: 'VERIFICATION',
            tabKey: 'VERIFICATION',
            label: 'Verification & Inquiries',
            icon: ClipboardCheck,
            count: counts.verifications,
          },
          {
            id: 'DEPARTMENTS_APPROVALS',
            tabKey: 'DEPARTMENTS_APPROVALS',
            label: 'Departments & Approvals',
            icon: Layers,
            count: counts.departments,
          },
        ],
      });

      groups.push({
        id: 'pw-territory',
        categoryLabel: 'Territory & Team',
        sectionLabel: 'Office Master, Master Staff, Role & Promotions',
        defaultExpanded: true,
        menus: [
          { id: 'STORES', tabKey: 'STORES', label: 'Office Master', icon: Building2, count: counts.stores },
          { id: 'RBAC_TEAM', tabKey: 'RBAC_TEAM', label: 'Master Staff', icon: Users, count: counts.team },
          { id: 'MASTER_ROLE', tabKey: 'MASTER_ROLE', label: 'Master Role', icon: ShieldCheck },
          { id: 'PROMOTION_MASTER', tabKey: 'PROMOTION_MASTER', label: 'Promotion Master', icon: Award },
          ...(retailServicesActive
            ? [{ id: 'PRODUCTS', tabKey: 'PRODUCTS', label: 'Products & Storefront', icon: Package, count: counts.products }]
            : []),
          { id: 'ACADEMY', tabKey: 'ACADEMY', label: 'Skill & Academy', icon: BookOpen, count: counts.academy },
          { id: 'NOTIFICATIONS', tabKey: 'NOTIFICATIONS', label: 'Notifications', icon: Bell, count: counts.notifications },
        ],
      });
    }
  } else if (mode === 'STAFF') {
    const allowed = new Set(staffAllowedSections);
    groups.push({
      id: 'st-exec',
      categoryLabel: 'Brand Staff Portal',
      sectionLabel: 'Workspace',
      defaultExpanded: true,
      menus: [
        ...(allowed.has('OVERVIEW') ? [{ id: 'OVERVIEW', tabKey: 'OVERVIEW', label: 'Dashboard', icon: LayoutDashboard }] : []),
        ...(allowed.has('CUSTOMERS') ? [{ id: 'CUSTOMERS', tabKey: 'CUSTOMERS', label: 'Customers', icon: Users }] : []),
        ...(allowed.has('LEADS') ? [{ id: 'LEADS', tabKey: 'LEADS', label: 'Leads Pipeline', icon: Target }] : []),
        ...(allowed.has('OPERATIONS') ? [{ id: 'OPERATIONS', tabKey: 'OPERATIONS', label: 'Operations & SRM', icon: Briefcase }] : []),
        ...(allowed.has('PROPERTIES') ? [{ id: 'PROPERTIES', tabKey: 'PROPERTIES', label: 'Properties', icon: Home }] : []),
        ...(allowed.has('BEATS') ? [{ id: 'BEATS', tabKey: 'BEATS', label: 'Beats & Territory', icon: Route }] : []),
        ...(allowed.has('REPORTS') ? [{ id: 'REPORTS', tabKey: 'REPORTS', label: 'Reports & CSV', icon: FileBarChart2 }] : []),
        ...(allowed.has('MY_PROFILE') ? [{ id: 'MY_PROFILE', tabKey: 'MY_PROFILE', label: 'My Profile', icon: User }] : []),
      ],
    });
  }

  // Department of Post (BRD-INPOST-01): Divisional & Statutory Governance ONLY
  // Zero duplication with CRM & Operations or Territory & Team
  if (isIndiaPost && (mode === 'OWNER' || mode === 'PARTNER')) {
    groups.push({
      id: 'ip-kota-modules',
      categoryLabel: 'Department of Post (BRD-INPOST-01)',
      sectionLabel: 'Divisional & Statutory Governance',
      defaultExpanded: false,
      menus: [
        {
          id: 'IP_HIERARCHY',
          tabKey: 'IP_HIERARCHY',
          label: 'Divisional Hierarchy',
          icon: GitBranch,
        },
        {
          id: 'IP_GEO_QUALITY',
          tabKey: 'IP_GEO_QUALITY',
          label: 'Geo Mapping & Data Quality',
          icon: MapPin,
          children: [
            {
              id: 'IP_GEO_QUALITY::LOCATION_INTEL',
              tabKey: 'IP_GEO_QUALITY',
              subModeKey: 'LOCATION_INTEL',
              label: '11-Level Geo & Map',
              icon: MapPin,
            },
            {
              id: 'IP_GEO_QUALITY::DATA_QUALITY',
              tabKey: 'IP_GEO_QUALITY',
              subModeKey: 'DATA_QUALITY',
              label: 'Data Quality Audit',
              icon: ShieldCheck,
            },
            {
              id: 'IP_GEO_QUALITY::ADDRESS',
              tabKey: 'IP_GEO_QUALITY',
              subModeKey: 'ADDRESS',
              label: 'Address Resolution',
              icon: Navigation,
            },
          ],
        },
        {
          id: 'IP_STATUTORY_DOCS',
          tabKey: 'IP_STATUTORY_DOCS',
          label: 'Statutory Docs & ACG-61',
          icon: FileText,
          children: [
            {
              id: 'IP_STATUTORY_DOCS::DOCS_HUB',
              tabKey: 'IP_STATUTORY_DOCS',
              subModeKey: 'DOCS_HUB',
              label: 'Fuel, BYOD & Statutory Bills',
              icon: FileText,
            },
            {
              id: 'IP_STATUTORY_DOCS::ACG61',
              tabKey: 'IP_STATUTORY_DOCS',
              subModeKey: 'ACG61',
              label: 'ACG-61 Charge Report',
              icon: ClipboardCheck,
            },
            {
              id: 'IP_STATUTORY_DOCS::ARTICLES',
              tabKey: 'IP_STATUTORY_DOCS',
              subModeKey: 'ARTICLES',
              label: 'Postman Daily Articles',
              icon: Package,
            },
          ],
        },
        {
          id: 'IP_DAILY_OPS',
          tabKey: 'IP_DAILY_OPS',
          label: 'Daily Ops & Surveys',
          icon: UserCheck,
          children: [
            {
              id: 'IP_DAILY_OPS::VERIFICATION',
              tabKey: 'IP_DAILY_OPS',
              subModeKey: 'VERIFICATION',
              label: 'Daily Verification Console',
              icon: UserCheck,
            },
            {
              id: 'IP_DAILY_OPS::SURVEY',
              tabKey: 'IP_DAILY_OPS',
              subModeKey: 'SURVEY',
              label: 'Doorstep Survey Workflow',
              icon: FileCheck2,
            },
          ],
        },
        {
          id: 'IP_SRM',
          tabKey: 'IP_SRM',
          label: 'SRM & Escalations',
          icon: Ticket,
        },
        {
          id: 'IP_LMS_STOREFRONT',
          tabKey: 'IP_LMS_STOREFRONT',
          label: retailServicesActive ? 'Postal LMS & Storefront' : 'Postal Departmental LMS',
          icon: BookOpen,
          children: [
            {
              id: 'IP_LMS_STOREFRONT::LMS',
              tabKey: 'IP_LMS_STOREFRONT',
              subModeKey: 'LMS',
              label: 'Postal Departmental LMS',
              icon: GraduationCap,
            },
            ...(retailServicesActive
              ? [
                  {
                    id: 'IP_LMS_STOREFRONT::STOREFRONT',
                    tabKey: 'IP_LMS_STOREFRONT',
                    subModeKey: 'STOREFRONT',
                    label: 'India Post Storefront',
                    icon: Store,
                  },
                ]
              : []),
          ],
        },
        {
          id: 'IP_NOTIFICATIONS',
          tabKey: 'IP_NOTIFICATIONS',
          label: 'Divisional Notifications',
          icon: Bell,
          count: counts.notifications,
        },
      ],
    });
  }

  return dedupeNavGroups(groups);
}
