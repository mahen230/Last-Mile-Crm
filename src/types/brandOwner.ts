export type BrandProfileStatus = 'ACTIVE' | 'LOCKED' | 'PENDING_APPROVAL' | 'REJECTED';

export type BrandOnboardingSource =
  | 'ADMIN_CREATED'
  | 'B2B_FORM'
  | 'PARTNER_PORTAL'
  | 'BRAND_ONBOARDING';

export type BrandPortalSubMenuKey =
  | 'OVERVIEW'
  | 'DEPARTMENTS_APPROVALS'
  | 'OFFICES_STORES'
  | 'STAFF'
  | 'MASTER_ROLE'
  | 'PROMOTION_MASTER'
  | 'CUSTOMERS'
  | 'PROPERTIES'
  | 'LEADS'
  | 'MASTER_SEARCH'
  | 'OPERATIONS_TASKS'
  | 'REPORTS_EXPORTS'
  | 'AUDIT_HEALTH'
  | 'MASTER_DATA_CENTRE'
  | 'PROFILE_PASSWORD'
  | 'XPO_PRODUCTS'
  | 'XPO_CUSTOMER_PORTAL'
  | 'XPO_STOREFRONT';

export interface BrandSubMenuDefinition {
  key: BrandPortalSubMenuKey;
  label: string;
  shortDesc: string;
}

export const XPOKART_ECOMMERCE_SUBMENUS: BrandPortalSubMenuKey[] = [
  'OVERVIEW',
  'XPO_PRODUCTS',
  'XPO_CUSTOMER_PORTAL',
  'XPO_STOREFRONT',
  'CUSTOMERS',
  'REPORTS_EXPORTS',
  'AUDIT_HEALTH',
  'PROFILE_PASSWORD',
];

export const ALL_BRAND_PORTAL_SUBMENUS: BrandSubMenuDefinition[] = [
  {
    key: 'OVERVIEW',
    label: 'Dashboard',
    shortDesc: 'Executive KPIs, operational metrics & quick actions',
  },
  {
    key: 'CUSTOMERS',
    label: 'Customers',
    shortDesc: 'Brand-isolated customer registry & directory',
  },
  {
    key: 'PROPERTIES',
    label: 'Properties',
    shortDesc: '10-level property, commercial & household records',
  },
  {
    key: 'LEADS',
    label: 'Leads & Schemes',
    shortDesc: 'Multi-stage leads, schemes & conversion pipeline',
  },
  {
    key: 'MASTER_SEARCH',
    label: 'Master Search Console',
    shortDesc: 'Unified multi-level search, inspection & quick actions',
  },
  {
    key: 'OPERATIONS_TASKS',
    label: 'Operations & Tasks',
    shortDesc: 'Follow-ups, verifications, inquiries & task queues',
  },
  {
    key: 'DEPARTMENTS_APPROVALS',
    label: 'Departments & Approvals',
    shortDesc: 'Functional departments & multi-tier approval workflow',
  },
  {
    key: 'OFFICES_STORES',
    label: 'Office Master',
    shortDesc: 'Canonical offices, branches, divisions, PINs & beats',
  },
  {
    key: 'STAFF',
    label: 'Master Staff',
    shortDesc: 'Unified operational staff directory & beat assignments',
  },
  {
    key: 'MASTER_ROLE',
    label: 'Master Role',
    shortDesc: 'Centralized RBAC permission matrix & scope boundaries',
  },
  {
    key: 'PROMOTION_MASTER',
    label: 'Promotion Master',
    shortDesc: 'Role upgrade, office/beat transfer & immutable audit sync',
  },
  {
    key: 'REPORTS_EXPORTS',
    label: 'Reports & Exports',
    shortDesc: 'UTF-8 BOM CSV exports scoped strictly to this brand',
  },
  {
    key: 'AUDIT_HEALTH',
    label: 'Brand Audit Log & Health',
    shortDesc: 'Immutable audit trail, change diffs & health inspection',
  },
  {
    key: 'MASTER_DATA_CENTRE',
    label: 'Master Data Centre',
    shortDesc: 'Brand-scoped Excel/CSV templates, bulk import & safe upsert',
  },
  {
    key: 'PROFILE_PASSWORD',
    label: 'Profile & Password',
    shortDesc: 'Manage brand owner credentials, passcode & workspace info',
  },
];

export interface BrandOwnerProfile {
  id: string;
  brandName: string;
  uniqueCode: string;
  workspaceKey: string;
  partnerSlug: string;
  ownerName: string;
  ownerContactNumber: string;
  ownerEmail?: string;
  loginId: string;
  passwordHash: string;
  passcodeHash: string;
  passcodeLength: number;
  mustChangePassword?: boolean;
  defaultPasswordApplied?: boolean;
  status: BrandProfileStatus;
  singleSessionOnly: boolean;
  activeSessionToken: string | null;
  activeSessionDevice?: string | null;
  activeSessionAt?: string | null;
  subMenuItems: BrandPortalSubMenuKey[];
  accentColor: string;
  category: string;
  tagline?: string;
  pincode?: string;
  onboardingSource?: BrandOnboardingSource;
  onboardingNotes?: string;
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type SanitizedBrandOwnerProfile = Omit<BrandOwnerProfile, 'passwordHash' | 'passcodeHash'>;

export interface BrandOwnerSession {
  brandProfileId: string;
  brandName: string;
  uniqueCode: string;
  workspaceKey: string;
  partnerSlug: string;
  ownerName: string;
  ownerContactNumber: string;
  role: 'BRAND_OWNER';
  sessionToken: string;
  passcodeVerified: boolean;
  sensitiveUnlocked: boolean;
  mustChangePassword?: boolean;
  signedInAt: string;
  lastVerifiedAt?: string;
}

export type SectorTransferEntityType =
  | 'Customer'
  | 'Lead'
  | 'Office'
  | 'Staff'
  | 'Department'
  | 'Project'
  | 'Task';

export interface SectorRoutingRecordItem {
  entityType: SectorTransferEntityType;
  recordId: string;
  title: string;
  subtitle: string;
  currentWorkspaceKey: string;
  recommendedWorkspaceKey: string;
  needsTransfer: boolean;
  reason: string;
}

export interface SectorRoutingSummary {
  totalScanned: number;
  needsTransferCount: number;
  byWorkspace: Record<string, number>;
  records: SectorRoutingRecordItem[];
  scannedAt: string;
}

export type LoginHierarchyTier =
  | 'MASTER_ADMIN'
  | 'BRAND_OWNER'
  | 'BRAND_STAFF'
  | 'BRAND_CUSTOMER';

export interface LoginHierarchyDescriptor {
  tier: LoginHierarchyTier;
  rank: number;
  label: string;
  scopeSummary: string;
  brandSlug?: string;
  workspaceKey?: string;
}

export type BrandStaffSectionKey =
  | 'OVERVIEW'
  | 'CUSTOMERS'
  | 'LEADS'
  | 'OPERATIONS'
  | 'PROPERTIES'
  | 'BEATS'
  | 'REPORTS'
  | 'MY_PROFILE';

export type BrandCustomerSectionKey =
  | 'ACCOUNT_OVERVIEW'
  | 'MY_PROFILE'
  | 'SUBMIT_REQUEST'
  | 'MY_REQUESTS'
  | 'MY_PROPERTIES';

export type IndiaPostConsolidatedSectionKey =
  | 'IP_HIERARCHY'
  | 'IP_GEO_QUALITY'
  | 'IP_STATUTORY_DOCS'
  | 'IP_DAILY_OPS'
  | 'IP_SRM'
  | 'IP_LMS_STOREFRONT'
  | 'IP_NOTIFICATIONS';

export interface BrandSectionMeta<K extends string = string> {
  key: K;
  label: string;
  shortDesc: string;
}

export const ALL_BRAND_STAFF_SECTIONS: BrandSectionMeta<BrandStaffSectionKey>[] = [
  { key: 'OVERVIEW', label: 'Dashboard', shortDesc: 'Assigned scope KPIs & role summary' },
  { key: 'CUSTOMERS', label: 'Customers Registry', shortDesc: 'View & manage scoped brand customers' },
  { key: 'LEADS', label: 'Leads Pipeline', shortDesc: 'Capture & follow up brand leads' },
  { key: 'OPERATIONS', label: 'Tasks & SRM Queue', shortDesc: 'Manage operational tasks & service requests' },
  { key: 'PROPERTIES', label: 'Properties & Addresses', shortDesc: 'View scoped properties & households' },
  { key: 'BEATS', label: 'Beats & Territory', shortDesc: 'Assigned delivery beats & area coverage' },
  { key: 'REPORTS', label: 'Scoped CSV Exports', shortDesc: 'Download permitted brand CSV reports' },
  { key: 'MY_PROFILE', label: 'My Profile & Permissions', shortDesc: 'View staff credentials & active RBAC' },
];

export const ALL_BRAND_CUSTOMER_SECTIONS: BrandSectionMeta<BrandCustomerSectionKey>[] = [
  { key: 'ACCOUNT_OVERVIEW', label: 'Dashboard', shortDesc: 'Summary of your brand account & activity' },
  { key: 'MY_PROFILE', label: 'My Profile & Schemes', shortDesc: 'Registered address & enrolled products' },
  { key: 'SUBMIT_REQUEST', label: 'Raise Request / Inquiry', shortDesc: 'Submit a new service request or inquiry' },
  { key: 'MY_REQUESTS', label: 'My Requests & Tickets', shortDesc: 'Track status & resolution notes' },
  { key: 'MY_PROPERTIES', label: 'My Properties', shortDesc: 'Your linked property & house records' },
];

export const BRAND_STAFF_ROLE_PRESETS: Array<{
  key: string;
  label: string;
  staffRole: string;
  designation: string;
  postCategory?: string;
  permissions: BrandMemberPermissions;
}> = [
  {
    key: 'BRAND_MANAGER',
    label: 'Brand Manager (All Brand Sections)',
    staffRole: 'OFFICE_INCHARGE',
    designation: 'Brand / Office Manager',
    postCategory: 'Supervisory & Division',
    permissions: {
      canViewAllBrandCustomers: true,
      canCreateCustomerOrLead: true,
      canEditCustomer: true,
      canManageSrmOrTasks: true,
      canViewOpsQueue: true,
      canManageOfficesOrBeats: true,
      canExportReports: true,
      canReadPropertyDetails: true,
      canSearchProperties: true,
      allowedSections: ['OVERVIEW', 'CUSTOMERS', 'LEADS', 'OPERATIONS', 'PROPERTIES', 'BEATS', 'REPORTS', 'MY_PROFILE'],
    },
  },
  {
    key: 'OPERATIONS_SUPERVISOR',
    label: 'Operations & SRM Supervisor',
    staffRole: 'LAST_MILE_SUPERVISOR',
    designation: 'Operations Supervisor',
    postCategory: 'Supervisory & Division',
    permissions: {
      canViewAllBrandCustomers: true,
      canCreateCustomerOrLead: true,
      canEditCustomer: true,
      canManageSrmOrTasks: true,
      canViewOpsQueue: true,
      canManageOfficesOrBeats: false,
      canExportReports: true,
      canReadPropertyDetails: true,
      canSearchProperties: true,
      allowedSections: ['OVERVIEW', 'CUSTOMERS', 'LEADS', 'OPERATIONS', 'PROPERTIES', 'BEATS', 'REPORTS', 'MY_PROFILE'],
    },
  },
  {
    key: 'SALES_EXECUTIVE',
    label: 'Sales & Scheme Lead Executive',
    staffRole: 'SALES_FIELD_STAFF',
    designation: 'Sales & Field Executive',
    postCategory: 'Field Survey & Leads',
    permissions: {
      canViewAllBrandCustomers: false,
      canCreateCustomerOrLead: true,
      canEditCustomer: true,
      canManageSrmOrTasks: true,
      canViewOpsQueue: true,
      canManageOfficesOrBeats: false,
      canExportReports: false,
      canReadPropertyDetails: false,
      canSearchProperties: false,
      allowedSections: ['OVERVIEW', 'CUSTOMERS', 'LEADS', 'OPERATIONS', 'MY_PROFILE'],
    },
  },
  {
    key: 'FIELD_DELIVERY',
    label: 'Field / Postman / Beat Staff',
    staffRole: 'POSTMAN',
    designation: 'Postman / Field Delivery',
    postCategory: 'Delivery',
    permissions: {
      canViewAllBrandCustomers: false,
      canCreateCustomerOrLead: true,
      canEditCustomer: false,
      canManageSrmOrTasks: true,
      canViewOpsQueue: true,
      canManageOfficesOrBeats: false,
      canExportReports: false,
      canReadPropertyDetails: false,
      canSearchProperties: false,
      allowedSections: ['OVERVIEW', 'CUSTOMERS', 'PROPERTIES', 'BEATS', 'OPERATIONS', 'MY_PROFILE'],
    },
  },
  {
    key: 'SUPPORT_DESK',
    label: 'Customer Support / Counter Desk',
    staffRole: 'STAFF',
    designation: 'Counter & Support Executive',
    postCategory: 'Counter & Booking',
    permissions: {
      canViewAllBrandCustomers: true,
      canCreateCustomerOrLead: true,
      canEditCustomer: false,
      canManageSrmOrTasks: true,
      canViewOpsQueue: true,
      canManageOfficesOrBeats: false,
      canExportReports: false,
      canReadPropertyDetails: false,
      canSearchProperties: false,
      allowedSections: ['OVERVIEW', 'CUSTOMERS', 'LEADS', 'OPERATIONS', 'MY_PROFILE'],
    },
  },
];

export interface BrandMemberPermissions {
  canViewAllBrandCustomers: boolean;
  canCreateCustomerOrLead: boolean;
  canEditCustomer?: boolean;
  canManageSrmOrTasks: boolean;
  canViewOpsQueue: boolean;
  canManageOfficesOrBeats?: boolean;
  canExportReports?: boolean;
  canReadPropertyDetails?: boolean;
  canSearchProperties?: boolean;
  allottedTerritory?: string[];
  allowedSections?: BrandStaffSectionKey[];
}

export interface BrandMemberRbacOverride {
  memberId: string;
  brandProfileId: string;
  partnerSlug: string;
  rolePresetKey?: string;
  staffRole: string;
  designation: string;
  postCategory?: string;
  assignedOffice?: string;
  beat?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  permissions: BrandMemberPermissions;
  updatedBy: string;
  updatedAt: string;
}

export interface BrandTeamMemberRbacView {
  id: string;
  employeeId?: string;
  name: string;
  contact: string;
  email: string;
  staffRole: string;
  designation: string;
  postCategory?: string;
  assignedOffice?: string;
  beat?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  rolePresetKey?: string;
  permissions: BrandMemberPermissions;
  promotionCount: number;
  hasCustomPassword: boolean;
  updatedAt?: string;
}

export interface UpsertBrandTeamMemberInput {
  memberId?: string;
  name: string;
  contact: string;
  email?: string;
  employeeId?: string;
  rolePresetKey?: string;
  staffRole: string;
  designation: string;
  postCategory?: string;
  assignedOffice?: string;
  beat?: string;
  pincode?: string;
  status?: 'Active' | 'Inactive';
  password?: string;
  permissions: BrandMemberPermissions;
  orderRef?: string;
  notes?: string;
}

export interface BrandScopedPortalSession {
  sessionToken: string;
  hierarchyTier: LoginHierarchyTier;
  brandProfileId: string;
  brandName: string;
  uniqueCode: string;
  partnerSlug: string;
  workspaceKey: string;
  accentColor: string;
  actorId: string;
  actorName: string;
  actorContact: string;
  actorEmail?: string;
  employeeId?: string;
  staffRole?: string;
  designation?: string;
  postCategory?: string;
  assignedOffice?: string;
  beat?: string;
  pincode?: string;
  customerMasterId?: string;
  mustChangePassword?: boolean;
  permissions: BrandMemberPermissions;
  signedInAt: string;
}
