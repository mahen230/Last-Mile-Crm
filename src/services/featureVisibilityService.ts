import {
  ALL_FEATURE_VISIBILITY_KEYS,
  DEFAULT_POSTMAN_GDS_VISIBLE_FEATURES,
  FeatureVisibilityKey,
  ServiceModulePermissions,
  StaffProfile,
  VendorAccessConfig,
  VendorSystemId,
} from '../types/models';

const VISIBILITY_STORAGE_KEY = 'xpeedo_feature_visibility_v1';

export interface VendorSystemDefinition {
  id: VendorSystemId;
  name: string;
  shortLabel: string;
  description: string;
  defaultWhiteLabel: boolean;
  brandTitle: string;
  brandSubtitle: string;
  includedFeatures: FeatureVisibilityKey[];
  excludedFeatures: FeatureVisibilityKey[];
}

export interface FeatureCatalogMeta {
  key: FeatureVisibilityKey;
  label: string;
  category: 'Core Operations' | 'Postal & Field' | 'Commercial & Ecosystem' | 'Learning & Engagement';
  description: string;
  legacyModuleKey?: keyof ServiceModulePermissions;
  vendorGroup: 'INDIA_POST' | 'COMMERCIAL_PARTNERS' | 'SHARED';
}

export interface FeatureVisibilityState {
  version: number;
  retailServicesActive: boolean;
  roleDefaults: Record<string, Record<FeatureVisibilityKey, boolean>>;
  vendorVisibility: Record<string, Partial<Record<FeatureVisibilityKey, boolean>>>;
  userOverrides: Record<string, Partial<Record<FeatureVisibilityKey, boolean>>>;
  userVendorScopes: Record<string, VendorAccessConfig>;
  auditTrail: Array<{
    id: string;
    timestamp: string;
    performedBy: string;
    targetType: 'ROLE' | 'VENDOR' | 'USER' | 'RETAIL';
    targetKey: string;
    action: string;
    details: string;
  }>;
  updatedAt: string;
}

export const FEATURE_CATALOG: FeatureCatalogMeta[] = [
  {
    key: 'property',
    label: 'Property & Household Registry',
    category: 'Core Operations',
    description: 'Sequence-wise property ledger, colony/sector property cards, and household mapping.',
    legacyModuleKey: 'crmSection',
    vendorGroup: 'INDIA_POST',
  },
  {
    key: 'members',
    label: 'Members & Citizens Directory',
    category: 'Core Operations',
    description: 'Member directory, resident verification, profile management, and family linking.',
    legacyModuleKey: 'crmSection',
    vendorGroup: 'INDIA_POST',
  },
  {
    key: 'beats',
    label: 'Beats & Colony Territory Map',
    category: 'Postal & Field',
    description: 'Delivery beats, colony-beat directory, and geospatial route mapping.',
    legacyModuleKey: 'crmSection',
    vendorGroup: 'INDIA_POST',
  },
  {
    key: 'dailyVerification',
    label: 'Daily Field Verification Queue',
    category: 'Postal & Field',
    description: 'Address exception checks, daily verification targets, and field audit workflows.',
    legacyModuleKey: 'crmSection',
    vendorGroup: 'INDIA_POST',
  },
  {
    key: 'dailyOperations',
    label: 'Daily Operations, Articles & Fuel',
    category: 'Postal & Field',
    description: 'Daily article register, DSS reconciliation, attendance, and fuel bills.',
    legacyModuleKey: 'specialBillsSection',
    vendorGroup: 'INDIA_POST',
  },
  {
    key: 'officialDocuments',
    label: 'Official Documents & Statutory Forms',
    category: 'Postal & Field',
    description: 'Charge reports, ACG-61, outsider bills, BYOD forms, and departmental orders.',
    legacyModuleKey: 'specialBillsSection',
    vendorGroup: 'INDIA_POST',
  },
  {
    key: 'leadsAndSchemes',
    label: 'Postal Schemes, Leads & Follow-ups',
    category: 'Postal & Field',
    description: 'PLI/RPLI/SSA/IPPB leads pipeline, scheme catalog, and scheduled follow-ups.',
    legacyModuleKey: 'schemeLeadsSection',
    vendorGroup: 'SHARED',
  },
  {
    key: 'lms',
    label: 'Departmental Exam LMS Hub',
    category: 'Learning & Engagement',
    description: 'GDS to MTS / Postman / PA training courses, quizzes, and mock exams.',
    legacyModuleKey: 'learningSection',
    vendorGroup: 'INDIA_POST',
  },
  {
    key: 'communication',
    label: 'Citizen Dispatch & Communications',
    category: 'Learning & Engagement',
    description: 'Content sharing templates, customer notices, and submission logs.',
    legacyModuleKey: 'contentSharingSection',
    vendorGroup: 'SHARED',
  },
  {
    key: 'staffDirectory',
    label: 'Staff Contact Directory',
    category: 'Core Operations',
    description: 'Inter-office postal staff phonebook and supervisor contacts.',
    vendorGroup: 'INDIA_POST',
  },
  {
    key: 'commercialDirectory',
    label: 'Commercial Store Directory & AI Matching',
    category: 'Commercial & Ecosystem',
    description: 'Commercial shops, CSC/eMitra listings, and 4-factor freshness matching.',
    vendorGroup: 'COMMERCIAL_PARTNERS',
  },
  {
    key: 'vendorSection',
    label: 'Commercial Vendor & Partner Ecosystem',
    category: 'Commercial & Ecosystem',
    description: 'Multi-vendor marketplace network, B2B margins, and commercial partner hubs.',
    vendorGroup: 'COMMERCIAL_PARTNERS',
  },
  {
    key: 'storefront',
    label: 'Partner Storefront & Commissions',
    category: 'Commercial & Ecosystem',
    description: 'Private partner e-store studio, referral trackers, and commission widgets.',
    vendorGroup: 'COMMERCIAL_PARTNERS',
  },
  {
    key: 'aiAssistant',
    label: 'Floating Commercial AI Assistant',
    category: 'Commercial & Ecosystem',
    description: 'Floating AI helper widget with platform/commercial shortcuts.',
    vendorGroup: 'COMMERCIAL_PARTNERS',
  },
  {
    key: 'locationIntelligence',
    label: 'Location Intelligence (Street & House Master)',
    category: 'Postal & Field',
    description: '11-level Division-to-House hierarchy, Street Master, House Master, and consent-aware maps.',
    legacyModuleKey: 'crmSection',
    vendorGroup: 'INDIA_POST',
  },
  {
    key: 'showcase',
    label: 'India Post & Bulk Customer Showcase',
    category: 'Postal & Field',
    description: 'Postal offerings catalog, promoted bulk customer showcase items, and direct lead capture.',
    legacyModuleKey: 'schemeLeadsSection',
    vendorGroup: 'INDIA_POST',
  },
  {
    key: 'productTargets',
    label: 'Product & Target Dashboard',
    category: 'Postal & Field',
    description: 'Live targets vs achievement tracking across postal schemes, bulk parcels, and beat pipelines.',
    legacyModuleKey: 'schemeLeadsSection',
    vendorGroup: 'INDIA_POST',
  },
  {
    key: 'reports',
    label: 'Superior Reporting & MIS Center',
    category: 'Core Operations',
    description: 'Scoped team, beat, article reconciliation, conversion, and financial reporting for Superiors.',
    vendorGroup: 'INDIA_POST',
  },
  {
    key: 'masterSearch',
    label: 'Unified Master Search Console',
    category: 'Core Operations',
    description: 'Global scoped search across citizens, tags, properties, leads, showcase items, and PINs.',
    legacyModuleKey: 'crmSection',
    vendorGroup: 'INDIA_POST',
  },
  {
    key: 'lastMileOps',
    label: 'Last-Mile Field Operations',
    category: 'Postal & Field',
    description: 'Postman daily articles, field tasks, verification queue, and statutory field forms.',
    legacyModuleKey: 'specialBillsSection',
    vendorGroup: 'INDIA_POST',
  },
  {
    key: 'dataBackupCenter',
    label: 'Data Import/Export & Verified Backup Center',
    category: 'Core Operations',
    description: 'UTF-8 BOM CSV & XLSX exports, controlled duplicate-safe import, and integrity-verified backup/restore.',
    vendorGroup: 'SHARED',
  },
];

export const VENDOR_SYSTEM_DEFINITIONS: Record<string, VendorSystemDefinition> = {
  INDIA_POST: {
    id: 'INDIA_POST',
    name: 'India Post Operations System',
    shortLabel: 'India Post System',
    description:
      'Consolidated Postal Operations workspace (Post Offices, Properties, Members, Beats, Daily Articles, Showcase, Product Targets, Superior Reports & Postal LMS). Enforces India Post identity exclusively.',
    defaultWhiteLabel: true,
    brandTitle: 'India Post Operations System',
    brandSubtitle: 'Departmental Operations & Territory CRM',
    includedFeatures: [
      'property',
      'members',
      'beats',
      'locationIntelligence',
      'dailyVerification',
      'dailyOperations',
      'lastMileOps',
      'officialDocuments',
      'leadsAndSchemes',
      'showcase',
      'productTargets',
      'reports',
      'masterSearch',
      'lms',
      'communication',
      'staffDirectory',
    ],
    excludedFeatures: ['commercialDirectory', 'vendorSection', 'storefront', 'aiAssistant'],
  },
  COMMERCIAL_PARTNERS: {
    id: 'COMMERCIAL_PARTNERS',
    name: 'India Post Bulk Customer Network',
    shortLabel: 'Bulk Customer Hub',
    description: 'India Post bulk customer showcase, promoted catalogs, and Speed Post / Parcel dispatch leads.',
    defaultWhiteLabel: true,
    brandTitle: 'India Post Bulk Customer Hub',
    brandSubtitle: 'Bulk Dispatch & Product Promotion Operations',
    includedFeatures: [
      'commercialDirectory',
      'vendorSection',
      'storefront',
      'showcase',
      'productTargets',
      'masterSearch',
      'leadsAndSchemes',
      'communication',
      'aiAssistant',
    ],
    excludedFeatures: ['officialDocuments', 'lms'],
  },
  EV_MOBILITY: {
    id: 'EV_MOBILITY',
    name: 'India Post Parcel & Logistics Desk',
    shortLabel: 'Parcel & Logistics',
    description: 'India Post last-mile beat delivery, Speed Post COD, and bulk parcel dispatch.',
    defaultWhiteLabel: true,
    brandTitle: 'India Post Parcel & Logistics',
    brandSubtitle: 'Beat Delivery & Dispatch Territory Portal',
    includedFeatures: ['property', 'beats', 'dailyOperations', 'lastMileOps', 'showcase', 'masterSearch', 'commercialDirectory', 'vendorSection'],
    excludedFeatures: ['officialDocuments', 'lms'],
  },
  SAAS_DIGITAL: {
    id: 'SAAS_DIGITAL',
    name: 'India Post Digital & e-Services Desk',
    shortLabel: 'Digital Services Desk',
    description: 'India Post IPPB, Jeevan Pramaan, Aadhaar CELC, and bulk customer showcase catalog.',
    defaultWhiteLabel: true,
    brandTitle: 'India Post Digital Services',
    brandSubtitle: 'Citizen & Bulk Services Portal',
    includedFeatures: ['members', 'leadsAndSchemes', 'showcase', 'productTargets', 'masterSearch', 'commercialDirectory', 'vendorSection', 'storefront'],
    excludedFeatures: ['officialDocuments', 'lms'],
  },
};

function buildFeatureMap(enabledKeys: FeatureVisibilityKey[]): Record<FeatureVisibilityKey, boolean> {
  const set = new Set<FeatureVisibilityKey>(enabledKeys);
  const map = {} as Record<FeatureVisibilityKey, boolean>;
  for (const key of ALL_FEATURE_VISIBILITY_KEYS) {
    map[key] = set.has(key);
  }
  return map;
}

const DEFAULT_ROLE_MATRIX: Record<string, Record<FeatureVisibilityKey, boolean>> = {
  // Postman, GDS & Field Staff: Scoped Core + Showcase + Leads + Product Targets + Last-Mile Ops + Master Search
  POSTMAN: buildFeatureMap([...DEFAULT_POSTMAN_GDS_VISIBLE_FEATURES, 'productTargets']),
  GDS: buildFeatureMap([...DEFAULT_POSTMAN_GDS_VISIBLE_FEATURES, 'productTargets']),
  STAFF: buildFeatureMap([...DEFAULT_POSTMAN_GDS_VISIBLE_FEATURES, 'productTargets']),
  // Postal office / supervisory tiers operate cleanly inside India Post modules with Superior Reporting enabled
  POSTMASTER: buildFeatureMap([
    'property',
    'members',
    'beats',
    'locationIntelligence',
    'dailyVerification',
    'dailyOperations',
    'lastMileOps',
    'officialDocuments',
    'leadsAndSchemes',
    'showcase',
    'productTargets',
    'reports',
    'masterSearch',
    'lms',
    'communication',
    'staffDirectory',
  ]),
  SUB_POSTMASTER: buildFeatureMap([
    'property',
    'members',
    'beats',
    'locationIntelligence',
    'dailyVerification',
    'dailyOperations',
    'lastMileOps',
    'officialDocuments',
    'leadsAndSchemes',
    'showcase',
    'productTargets',
    'reports',
    'masterSearch',
    'lms',
    'communication',
    'staffDirectory',
  ]),
  OFFICE_INCHARGE: buildFeatureMap([
    'property',
    'members',
    'beats',
    'locationIntelligence',
    'dailyVerification',
    'dailyOperations',
    'lastMileOps',
    'officialDocuments',
    'leadsAndSchemes',
    'showcase',
    'productTargets',
    'reports',
    'masterSearch',
    'lms',
    'communication',
    'staffDirectory',
  ]),
  BLOCK_INCHARGE: buildFeatureMap([
    'property',
    'members',
    'beats',
    'locationIntelligence',
    'dailyVerification',
    'dailyOperations',
    'lastMileOps',
    'officialDocuments',
    'leadsAndSchemes',
    'showcase',
    'productTargets',
    'reports',
    'masterSearch',
    'lms',
    'communication',
    'staffDirectory',
  ]),
  SUBDIVISION_INCHARGE: buildFeatureMap([
    'property',
    'members',
    'beats',
    'locationIntelligence',
    'dailyVerification',
    'dailyOperations',
    'lastMileOps',
    'officialDocuments',
    'leadsAndSchemes',
    'showcase',
    'productTargets',
    'reports',
    'masterSearch',
    'lms',
    'communication',
    'staffDirectory',
  ]),
  DIVISIONAL_HEAD: buildFeatureMap(ALL_FEATURE_VISIBILITY_KEYS),
  ASST_DIVISIONAL_ADMIN: buildFeatureMap(ALL_FEATURE_VISIBILITY_KEYS),
  CLUSTER_INCHARGE: buildFeatureMap([
    'property',
    'members',
    'beats',
    'locationIntelligence',
    'dailyVerification',
    'dailyOperations',
    'lastMileOps',
    'leadsAndSchemes',
    'showcase',
    'productTargets',
    'reports',
    'masterSearch',
    'staffDirectory',
  ]),
  MARKETING_TEAM: buildFeatureMap([
    'property',
    'members',
    'leadsAndSchemes',
    'showcase',
    'productTargets',
    'reports',
    'masterSearch',
    'communication',
    'locationIntelligence',
  ]),
  LAST_MILE_SUPERVISOR: buildFeatureMap([
    'property',
    'members',
    'beats',
    'locationIntelligence',
    'dailyVerification',
    'dailyOperations',
    'lastMileOps',
    'showcase',
    'productTargets',
    'reports',
    'masterSearch',
    'staffDirectory',
  ]),
  VENDOR: buildFeatureMap(['vendorSection', 'commercialDirectory', 'storefront', 'showcase', 'leadsAndSchemes']),
  DEO: buildFeatureMap(['property', 'members', 'locationIntelligence', 'showcase', 'masterSearch', 'dataBackupCenter']),
  DISTRICT_MANAGER: buildFeatureMap(ALL_FEATURE_VISIBILITY_KEYS),
  DISTRICT_INCHARGE: buildFeatureMap(ALL_FEATURE_VISIBILITY_KEYS),
  DIVISION_INCHARGE: buildFeatureMap(ALL_FEATURE_VISIBILITY_KEYS),
  CIRCLE_INCHARGE: buildFeatureMap(ALL_FEATURE_VISIBILITY_KEYS),
  CATEGORY_MANAGER: buildFeatureMap([
    'property',
    'members',
    'leadsAndSchemes',
    'showcase',
    'productTargets',
    'reports',
    'masterSearch',
    'commercialDirectory',
    'vendorSection',
    'storefront',
  ]),
  ADMIN: buildFeatureMap(ALL_FEATURE_VISIBILITY_KEYS),
  MASTER_ADMIN: buildFeatureMap(ALL_FEATURE_VISIBILITY_KEYS),
  SUPER_ADMIN: buildFeatureMap(ALL_FEATURE_VISIBILITY_KEYS),
  OWNER: buildFeatureMap(ALL_FEATURE_VISIBILITY_KEYS),
  DEVELOPER: buildFeatureMap(ALL_FEATURE_VISIBILITY_KEYS),
};

const DEFAULT_VENDOR_VISIBILITY: Record<string, Partial<Record<FeatureVisibilityKey, boolean>>> = {
  INDIA_POST: buildFeatureMap(VENDOR_SYSTEM_DEFINITIONS.INDIA_POST.includedFeatures),
  COMMERCIAL_PARTNERS: buildFeatureMap(VENDOR_SYSTEM_DEFINITIONS.COMMERCIAL_PARTNERS.includedFeatures),
  EV_MOBILITY: buildFeatureMap(VENDOR_SYSTEM_DEFINITIONS.EV_MOBILITY.includedFeatures),
  SAAS_DIGITAL: buildFeatureMap(VENDOR_SYSTEM_DEFINITIONS.SAAS_DIGITAL.includedFeatures),
};

function createDefaultState(): FeatureVisibilityState {
  return {
    version: 1,
    retailServicesActive: false,
    roleDefaults: JSON.parse(JSON.stringify(DEFAULT_ROLE_MATRIX)),
    vendorVisibility: JSON.parse(JSON.stringify(DEFAULT_VENDOR_VISIBILITY)),
    userOverrides: {},
    userVendorScopes: {},
    auditTrail: [],
    updatedAt: new Date().toISOString(),
  };
}

class FeatureVisibilityService {
  private state: FeatureVisibilityState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): FeatureVisibilityState {
    const def = createDefaultState();
    try {
      const raw = localStorage.getItem(VISIBILITY_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(def));
        return def;
      }
      const parsed = JSON.parse(raw) as Partial<FeatureVisibilityState>;
      const mergedRoleDefaults: Record<string, Record<FeatureVisibilityKey, boolean>> = {
        ...def.roleDefaults,
      };
      if (parsed.roleDefaults) {
        for (const [role, map] of Object.entries(parsed.roleDefaults)) {
          mergedRoleDefaults[role] = {
            ...(def.roleDefaults[role] || buildFeatureMap(DEFAULT_POSTMAN_GDS_VISIBLE_FEATURES)),
            ...(map || {}),
          };
        }
      }
      const mergedVendorVis: Record<string, Partial<Record<FeatureVisibilityKey, boolean>>> = {
        ...def.vendorVisibility,
        ...(parsed.vendorVisibility || {}),
      };
      return {
        version: 1,
        retailServicesActive:
          typeof parsed.retailServicesActive === 'boolean' ? parsed.retailServicesActive : false,
        roleDefaults: mergedRoleDefaults,
        vendorVisibility: mergedVendorVis,
        userOverrides: parsed.userOverrides || {},
        userVendorScopes: parsed.userVendorScopes || {},
        auditTrail: Array.isArray(parsed.auditTrail) ? parsed.auditTrail : [],
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
    } catch {
      return def;
    }
  }

  private saveState(notify = true): void {
    this.state.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(VISIBILITY_STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to persist visibility state:', e);
    }
    if (notify) {
      this.listeners.forEach((cb) => {
        try {
          cb();
        } catch (err) {
          console.warn('Visibility listener error:', err);
        }
      });
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): FeatureVisibilityState {
    return this.state;
  }

  public isRetailServicesActive(): boolean {
    return Boolean(this.state.retailServicesActive);
  }

  public setRetailServicesActive(active: boolean, performedBy = 'MASTER_ADMIN'): void {
    this.state.retailServicesActive = Boolean(active);
    this.appendAudit(
      performedBy,
      'RETAIL',
      'retailServicesActive',
      active ? 'ENABLE_RETAIL_SERVICES' : 'SIDELINE_RETAIL_SERVICES',
      `Set retailServicesActive=${Boolean(active)}`
    );
    this.saveState(true);
  }

  public isPlatformSuperUser(user: StaffProfile | null | undefined): boolean {
    if (!user) return false;
    const role = (user.role || '').toUpperCase();
    const empId = (user.employeeId || '').toUpperCase();
    const email = (user.email || '').toLowerCase();
    return (
      role === 'OWNER' ||
      role === 'MASTER_ADMIN' ||
      role === 'SUPER_ADMIN' ||
      role === 'DEVELOPER' ||
      email === 'ektamahenmeena@gmail.com' ||
      email === 'dev@indiapost-portal.in' ||
      empId === 'MASTER-ADMIN-01' ||
      empId === 'DEV-01' ||
      empId === 'OWNER-01' ||
      user.id === 'STAFF-MASTER-EKTA' ||
      user.id === 'STAFF-DEV-01'
    );
  }

  public isPostmanOrGdsProfile(user: StaffProfile | null | undefined): boolean {
    if (!user) return false;
    if (this.isPlatformSuperUser(user)) return false;
    const role = (user.role || '').toUpperCase();
    const desig = (user.designation || user.designationType || '').toUpperCase();
    if (
      role === 'ADMIN' ||
      role === 'DISTRICT_MANAGER' ||
      role === 'DISTRICT_INCHARGE' ||
      role === 'DIVISION_INCHARGE' ||
      role === 'CIRCLE_INCHARGE' ||
      role === 'BLOCK_INCHARGE' ||
      role === 'OFFICE_INCHARGE' ||
      role === 'CATEGORY_MANAGER' ||
      role === 'POSTMASTER'
    ) {
      return false;
    }
    if (role === 'POSTMAN' || role === 'GDS') return true;
    if (desig.includes('POSTMAN') || desig.includes('GDS') || desig.includes('BPM') || desig.includes('ABPM') || desig.includes('DAK SEVAK')) {
      return true;
    }
    if (role === 'STAFF' && user.permissions?.canViewAllRecords !== true) {
      return true;
    }
    return false;
  }

  public getEffectiveRoleKey(user: StaffProfile | null | undefined): string {
    if (!user) return 'POSTMAN';
    const role = (user.role || '').toUpperCase();
    if (this.isPlatformSuperUser(user)) {
      return role || 'MASTER_ADMIN';
    }
    if (role === 'GDS' || (user.designationType || '').toUpperCase().includes('GDS')) {
      return 'GDS';
    }
    if (role === 'POSTMAN' || (user.designationType || '').toUpperCase().includes('POSTMAN')) {
      return 'POSTMAN';
    }
    return role || 'POSTMAN';
  }

  public getUserVendorScope(user: StaffProfile | null | undefined): VendorAccessConfig {
    if (!user) return {};
    if (this.isPlatformSuperUser(user)) {
      return {
        allowedVendors: Object.keys(VENDOR_SYSTEM_DEFINITIONS),
        whiteLabelMode: false,
        strictVendorIsolation: false,
      };
    }
    const userKey = this.getUserStorageKey(user);
    const savedScope = userKey ? this.state.userVendorScopes[userKey] : undefined;
    const mergedScope: VendorAccessConfig = {
      ...(user.vendorScope || {}),
      ...(savedScope || {}),
    };

    // Postman, GDS, Postmaster, and postal office staff operate inside India Post Vendor System by default
    if (!mergedScope.assignedVendorId && this.isPostmanOrGdsProfile(user)) {
      return {
        assignedVendorId: 'INDIA_POST',
        allowedVendors: ['INDIA_POST'],
        whiteLabelMode: true,
        strictVendorIsolation: true,
      };
    }

    const postalRoles = new Set(['POSTMASTER', 'OFFICE_INCHARGE', 'BLOCK_INCHARGE']);
    if (!mergedScope.assignedVendorId && postalRoles.has((user.role || '').toUpperCase())) {
      return {
        assignedVendorId: 'INDIA_POST',
        allowedVendors: ['INDIA_POST'],
        whiteLabelMode: true,
        strictVendorIsolation: true,
      };
    }

    return mergedScope;
  }

  public isWhiteLabelPostalMode(user: StaffProfile | null | undefined): boolean {
    if (!user) return false;
    if (this.isPlatformSuperUser(user)) return false;
    if (this.isPostmanOrGdsProfile(user)) return true;
    const scope = this.getUserVendorScope(user);
    if (scope.whiteLabelMode === true) return true;
    if (scope.assignedVendorId === 'INDIA_POST') return true;
    return false;
  }

  public isStrictlyScopedToVendor(user: StaffProfile | null | undefined): VendorSystemId | null {
    if (!user || this.isPlatformSuperUser(user)) return null;
    const scope = this.getUserVendorScope(user);
    if (scope.strictVendorIsolation && scope.assignedVendorId) {
      return scope.assignedVendorId;
    }
    if (this.isPostmanOrGdsProfile(user)) {
      return scope.assignedVendorId || 'INDIA_POST';
    }
    return null;
  }

  public canAccessVendorSystem(user: StaffProfile | null | undefined, vendorId: VendorSystemId): boolean {
    if (!user) return false;
    if (this.isPlatformSuperUser(user)) return true;
    const scope = this.getUserVendorScope(user);
    if (scope.strictVendorIsolation && scope.assignedVendorId) {
      return scope.assignedVendorId === vendorId;
    }
    if (scope.allowedVendors && scope.allowedVendors.length > 0) {
      return scope.allowedVendors.includes(vendorId);
    }
    if (this.isPostmanOrGdsProfile(user)) {
      return vendorId === (scope.assignedVendorId || 'INDIA_POST');
    }
    return true;
  }

  public getBrandIdentity(user: StaffProfile | null | undefined): {
    isWhiteLabel: boolean;
    title: string;
    subtitle: string;
    badge: string;
    vendorId: VendorSystemId | 'PLATFORM';
  } {
    if (!user || this.isPlatformSuperUser(user)) {
      return {
        isWhiteLabel: false,
        title: 'KOTA DIVISION OS',
        subtitle: 'Unified Multi-Vendor & Post-Wise Operations',
        badge: 'Divisional Command',
        vendorId: 'PLATFORM',
      };
    }

    const scope = this.getUserVendorScope(user);
    const vendorId = scope.assignedVendorId || (this.isPostmanOrGdsProfile(user) ? 'INDIA_POST' : undefined);

    if (this.isWhiteLabelPostalMode(user) || vendorId === 'INDIA_POST') {
      const def = VENDOR_SYSTEM_DEFINITIONS.INDIA_POST;
      const officeLabel = user.subOffice || user.assignedOffice || 'Postal Jurisdiction';
      const pinLabel = user.officePincode ? `PIN ${user.officePincode}` : '';
      return {
        isWhiteLabel: true,
        title: scope.customWhiteLabelName || def.brandTitle,
        subtitle: [officeLabel, pinLabel].filter(Boolean).join(' · ') || def.brandSubtitle,
        badge: user.role === 'GDS' ? 'GDS Desk' : this.isPostmanOrGdsProfile(user) ? 'Postman Desk' : 'Postal Vendor Desk',
        vendorId: 'INDIA_POST',
      };
    }

    if (vendorId && VENDOR_SYSTEM_DEFINITIONS[vendorId]) {
      const def = VENDOR_SYSTEM_DEFINITIONS[vendorId];
      return {
        isWhiteLabel: Boolean(scope.whiteLabelMode || def.defaultWhiteLabel),
        title: scope.customWhiteLabelName || def.brandTitle,
        subtitle: def.brandSubtitle,
        badge: def.shortLabel,
        vendorId,
      };
    }

    return {
      isWhiteLabel: false,
      title: 'KOTA DIVISION OS',
      subtitle: user.assignedOffice || 'Multi-Vendor & Post-Wise Operations',
      badge: user.officialPost || user.role || 'Staff',
      vendorId: 'PLATFORM',
    };
  }

  private getUserStorageKey(user: StaffProfile | null | undefined): string {
    if (!user) return '';
    return (user.email || user.employeeId || user.id || '').trim().toLowerCase();
  }

  public isRoleFeatureEnabled(roleKey: string, featureKey: FeatureVisibilityKey): boolean {
    const upper = roleKey.toUpperCase();
    if (upper === 'OWNER' || upper === 'MASTER_ADMIN' || upper === 'DEVELOPER' || upper === 'SUPER_ADMIN') {
      return true;
    }
    const roleMap =
      this.state.roleDefaults[upper] ||
      (upper.includes('GDS')
        ? this.state.roleDefaults.GDS
        : upper.includes('POSTMAN')
        ? this.state.roleDefaults.POSTMAN
        : DEFAULT_ROLE_MATRIX[upper]);
    if (roleMap && typeof roleMap[featureKey] === 'boolean') {
      return roleMap[featureKey];
    }
    return DEFAULT_POSTMAN_GDS_VISIBLE_FEATURES.includes(featureKey);
  }

  public isVendorFeatureEnabled(vendorId: VendorSystemId, featureKey: FeatureVisibilityKey): boolean {
    const vMap = this.state.vendorVisibility[vendorId];
    if (vMap && typeof vMap[featureKey] === 'boolean') {
      return Boolean(vMap[featureKey]);
    }
    const def = VENDOR_SYSTEM_DEFINITIONS[vendorId];
    if (def) {
      if (def.excludedFeatures.includes(featureKey)) return false;
      return def.includedFeatures.includes(featureKey);
    }
    return true;
  }

  public isFeatureVisible(user: StaffProfile | null | undefined, featureKey: FeatureVisibilityKey): boolean {
    if (!user) return false;

    // Owner, Master Admin, and Developer ALWAYS retain full unrestricted control & visibility
    if (this.isPlatformSuperUser(user)) {
      return true;
    }

    // Side-line legacy third-party storefront/commercial directories when retailServicesActive is false
    // NOTE: 'showcase' is India Post's core Showcase and stays governed by role/user permissions.
    if (
      !this.state.retailServicesActive &&
      (featureKey === 'storefront' || featureKey === 'commercialDirectory')
    ) {
      return false;
    }

    if (user.permissions?.approvalStatus === 'Revoked') {
      return false;
    }

    const userKey = this.getUserStorageKey(user);
    const userOverrideMap = {
      ...(user.visibleFeaturesOverride || {}),
      ...(userKey ? this.state.userOverrides[userKey] || {} : {}),
    };

    const scope = this.getUserVendorScope(user);

    // 1. Strict Vendor Isolation Check (e.g., INDIA_POST excludes third-party commercial sections)
    if (scope.strictVendorIsolation && scope.assignedVendorId) {
      const def = VENDOR_SYSTEM_DEFINITIONS[scope.assignedVendorId];
      if (def && def.excludedFeatures.includes(featureKey)) {
        return false;
      }
      if (!this.isVendorFeatureEnabled(scope.assignedVendorId, featureKey)) {
        // Explicit user override can still enable an India Post feature (like leads or dailyOps),
        // but excluded commercial features stay blocked under strict isolation.
        if (userOverrideMap[featureKey] !== true) {
          return false;
        }
      }
    }

    // 2. Per-User Explicit Override (set by Owner / Master Admin / Developer)
    if (typeof userOverrideMap[featureKey] === 'boolean') {
      return Boolean(userOverrideMap[featureKey]);
    }

    // 3. Role Visibility Matrix Check
    const roleKey = this.getEffectiveRoleKey(user);
    const roleAllowed = this.isRoleFeatureEnabled(roleKey, featureKey);
    if (!roleAllowed) {
      return false;
    }

    // 4. Respect legacy ServiceModulePermissions if explicitly turned OFF by admin
    const legacy = user.permissions?.serviceModules;
    if (legacy) {
      if ((featureKey === 'property' || featureKey === 'members' || featureKey === 'beats') && legacy.crmSection === false) {
        return false;
      }
      if ((featureKey === 'dailyOperations' || featureKey === 'officialDocuments') && legacy.specialBillsSection === false) {
        return false;
      }
      if (featureKey === 'lms' && (legacy.learningSection === false || legacy.departmentalLearningSection === false)) {
        return false;
      }
      if (featureKey === 'leadsAndSchemes' && (legacy.schemeLeadsSection === false || legacy.productSchemeLeadSection === false)) {
        return false;
      }
      if (featureKey === 'communication' && (legacy.contentSharingSection === false || legacy.contentSharingDispatchSection === false)) {
        return false;
      }
    }

    return true;
  }

  public getVisibleFeaturesForUser(user: StaffProfile | null | undefined): FeatureVisibilityKey[] {
    return ALL_FEATURE_VISIBILITY_KEYS.filter((k) => this.isFeatureVisible(user, k));
  }

  public setRoleFeatureVisibility(
    roleKey: string,
    featureKey: FeatureVisibilityKey,
    visible: boolean,
    performedBy = 'MASTER_ADMIN'
  ): void {
    const upper = roleKey.toUpperCase();
    const current = this.state.roleDefaults[upper] || buildFeatureMap(DEFAULT_POSTMAN_GDS_VISIBLE_FEATURES);
    this.state.roleDefaults[upper] = {
      ...current,
      [featureKey]: visible,
    };
    this.appendAudit(performedBy, 'ROLE', upper, visible ? 'SHOW_FEATURE' : 'HIDE_FEATURE', `${featureKey} -> ${visible ? 'VISIBLE' : 'HIDDEN'} for role ${upper}`);
    this.saveState(true);
  }

  public resetPostmanAndGdsToDefault(performedBy = 'MASTER_ADMIN'): void {
    this.state.roleDefaults.POSTMAN = buildFeatureMap(DEFAULT_POSTMAN_GDS_VISIBLE_FEATURES);
    this.state.roleDefaults.GDS = buildFeatureMap(DEFAULT_POSTMAN_GDS_VISIBLE_FEATURES);
    this.appendAudit(performedBy, 'ROLE', 'POSTMAN,GDS', 'RESET_DEFAULT', 'Reset Postman & GDS visibility strictly to Property & Members only.');
    this.saveState(true);
  }

  public setVendorFeatureVisibility(
    vendorId: VendorSystemId,
    featureKey: FeatureVisibilityKey,
    visible: boolean,
    performedBy = 'OWNER'
  ): void {
    const current = this.state.vendorVisibility[vendorId] || {};
    this.state.vendorVisibility[vendorId] = {
      ...current,
      [featureKey]: visible,
    };
    this.appendAudit(performedBy, 'VENDOR', vendorId, visible ? 'SHOW_VENDOR_FEATURE' : 'HIDE_VENDOR_FEATURE', `${featureKey} -> ${visible ? 'VISIBLE' : 'HIDDEN'} in vendor ${vendorId}`);
    this.saveState(true);
  }

  public setUserFeatureOverride(
    userEmailOrId: string,
    featureKey: FeatureVisibilityKey,
    visible: boolean | null,
    performedBy = 'MASTER_ADMIN'
  ): void {
    const key = userEmailOrId.trim().toLowerCase();
    if (!key) return;
    if (visible === null) {
      if (this.state.userOverrides[key]) {
        const copy = { ...this.state.userOverrides[key] };
        delete copy[featureKey];
        this.state.userOverrides[key] = copy;
      }
    } else {
      this.state.userOverrides[key] = {
        ...(this.state.userOverrides[key] || {}),
        [featureKey]: visible,
      };
    }
    this.appendAudit(performedBy, 'USER', key, 'USER_FEATURE_OVERRIDE', `${featureKey} -> ${visible === null ? 'INHERIT_ROLE' : visible ? 'VISIBLE' : 'HIDDEN'}`);
    this.saveState(true);
  }

  public setUserVendorScope(
    userEmailOrId: string,
    vendorScope: VendorAccessConfig,
    performedBy = 'OWNER'
  ): void {
    const key = userEmailOrId.trim().toLowerCase();
    if (!key) return;
    this.state.userVendorScopes[key] = { ...vendorScope };
    this.appendAudit(
      performedBy,
      'USER',
      key,
      'ASSIGN_VENDOR_SCOPE',
      `Vendor=${vendorScope.assignedVendorId || 'GLOBAL'}, WhiteLabel=${Boolean(vendorScope.whiteLabelMode)}, StrictIsolation=${Boolean(vendorScope.strictVendorIsolation)}`
    );
    this.saveState(true);
  }

  public getUserOverrideMap(userEmailOrId: string): Partial<Record<FeatureVisibilityKey, boolean>> {
    return this.state.userOverrides[userEmailOrId.trim().toLowerCase()] || {};
  }

  private appendAudit(
    performedBy: string,
    targetType: 'ROLE' | 'VENDOR' | 'USER' | 'RETAIL',
    targetKey: string,
    action: string,
    details: string
  ): void {
    this.state.auditTrail.unshift({
      id: `VIS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      performedBy,
      targetType,
      targetKey,
      action,
      details,
    });
    if (this.state.auditTrail.length > 200) {
      this.state.auditTrail = this.state.auditTrail.slice(0, 200);
    }
  }

  public mapPathToFeature(pathname: string): FeatureVisibilityKey | null {
    const path = (pathname || '').toLowerCase();
    if (path.startsWith('/properties') || path.startsWith('/households') || path.startsWith('/sequence-properties') || path.startsWith('/unified-properties') || path.startsWith('/home')) {
      return 'property';
    }
    if (path.startsWith('/customers')) {
      return 'members';
    }
    if (path.startsWith('/beats') || path.startsWith('/my-beat') || path.startsWith('/beats-map')) {
      return 'beats';
    }
    if (path.startsWith('/daily-verification') || path.startsWith('/verifications') || path.startsWith('/doorstep-surveys')) {
      return 'dailyVerification';
    }
    if (path.startsWith('/location-intelligence')) {
      return 'locationIntelligence';
    }
    if (path.startsWith('/data-backup-center')) {
      return 'dataBackupCenter';
    }
    if (path.startsWith('/india-post-storefront')) {
      return 'showcase';
    }
    if (path.startsWith('/product-targets')) {
      return 'productTargets';
    }
    if (path.startsWith('/reports')) {
      return 'reports';
    }
    if (path.startsWith('/master-search')) {
      return 'masterSearch';
    }
    if (path.startsWith('/postman-articles') || path.startsWith('/tasks') || path.startsWith('/fuel-bills')) {
      return 'lastMileOps';
    }
    if (path.startsWith('/official-documents') || path.startsWith('/special-forms') || path.startsWith('/charge-report') || path.startsWith('/official-applications')) {
      return 'officialDocuments';
    }
    if (path.startsWith('/leads') || path.startsWith('/services') || path.startsWith('/follow-ups')) {
      return 'leadsAndSchemes';
    }
    if (path.startsWith('/postal-lms')) {
      return 'lms';
    }
    if (path.startsWith('/communication') || path.startsWith('/my-submissions')) {
      return 'communication';
    }
    if (path.startsWith('/staff-directory')) {
      return 'staffDirectory';
    }
    if (path.startsWith('/commercial-directory') || path.startsWith('/commercial-intelligence') || path.startsWith('/businesses')) {
      return 'commercialDirectory';
    }
    if (path.startsWith('/vendor-ecosystem')) {
      return 'vendorSection';
    }
    if (path.startsWith('/staff-storefront')) {
      return 'storefront';
    }
    if (path.startsWith('/ai-assistant')) {
      return 'aiAssistant';
    }
    return null;
  }
}

export const featureVisibilityService = new FeatureVisibilityService();
