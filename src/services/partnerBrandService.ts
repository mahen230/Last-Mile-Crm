import {
  Brand,
  BrandFollowUpTask,
  BrandRbacRoleConfig,
  BrandVerificationInquiry,
  CommercialStoreRecord,
  PartnerAccount,
  PartnerAuthSession,
  PartnerEntityType,
  PartnerLifecycleStatus,
  PartnerTeamMember,
  PartnerTeamMemberStatus,
  PartnerTeamPermissions,
  PartnerTeamRole,
  SanitizedPartnerTeamMember,
  Store,
  StoreCrmRecord,
  StoreCrmStage,
} from '../types/models';
import {
  hashPasswordSync,
  sanitizeUserInput,
  verifyPasswordSync,
} from '../utils/securityUtils';
import { customerService } from './customerService';
import { brandOwnerService } from './brandOwnerService';

import { MAX_OPERATIONAL_STAFF_COUNT, staffPermissionService } from './staffPermissionService';

function normalizeMobile10(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

const BRANDS_KEY = 'xpeedo_pb_brands_v1';
const STORES_KEY = 'xpeedo_pb_stores_v1';
const ACCOUNTS_KEY = 'xpeedo_pb_accounts_v1';
const TEAM_KEY = 'xpeedo_pb_team_v1';
const CRM_KEY = 'xpeedo_pb_crm_v1';
const SESSION_KEY = 'xpeedo_pb_active_session_v1';
const PARTNER_LOCKS_KEY = 'xpeedo_pb_active_locks_v1';
const VERIFICATIONS_KEY = 'xpeedo_pb_verifications_v1';
const FOLLOWUPS_KEY = 'xpeedo_pb_followups_v1';
const RBAC_CONFIG_KEY = 'xpeedo_pb_rbac_configs_v1';

export const DEFAULT_ROLE_PERMISSIONS: Record<PartnerTeamRole, PartnerTeamPermissions> = {
  PARTNER_OWNER: {
    canManageTeam: true,
    canManageStores: true,
    canCreateCrm: true,
    canEditCrm: true,
    canDeleteCrm: true,
  },
  STORE_MANAGER: {
    canManageTeam: true,
    canManageStores: true,
    canCreateCrm: true,
    canEditCrm: true,
    canDeleteCrm: false,
  },
  SALES_EXECUTIVE: {
    canManageTeam: false,
    canManageStores: false,
    canCreateCrm: true,
    canEditCrm: true,
    canDeleteCrm: false,
  },
  CRM_OPERATOR: {
    canManageTeam: false,
    canManageStores: false,
    canCreateCrm: true,
    canEditCrm: true,
    canDeleteCrm: false,
  },
  SUPPORT_DESK: {
    canManageTeam: false,
    canManageStores: false,
    canCreateCrm: true,
    canEditCrm: false,
    canDeleteCrm: false,
  },
};

const CORE_PILLARS_SEEDED_KEY = 'xpeedo_pb_core_pillars_v2';

export interface CoreStrategicPartnerSpec {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  roleInSystem: string;
  coreProductsServices: string;
  storeBeatHubScope: string;
  marketingGrowthReturn: string;
  accentColor: string;
  themePresetName: string;
  logoPresetId: string;
  pincode: string;
}

export const CORE_STRATEGIC_PARTNERS: CoreStrategicPartnerSpec[] = [
  {
    slug: 'india-post',
    name: 'India Post',
    category: 'Postal, Banking & Citizen Services',
    tagline: 'Anchor Network Pillar · Beat & PIN Coverage',
    roleInSystem: 'Brand Partner (Anchor / Network Pillar)',
    coreProductsServices:
      'Postal schemes, savings/banking touchpoints, parcel/speed post & last-mile delivery points, citizen services',
    storeBeatHubScope:
      'Beats (e.g., Beat 2) & PINs (e.g., 324009, all 34 beats) via Beat Management & Postal Schemes & Catalog',
    marketingGrowthReturn:
      'High-trust citizen & household reach, beat-wise ground credibility, aur verified local touchpoints',
    accentColor: '#991B1B',
    themePresetName: 'Crimson Pillar',
    logoPresetId: 'POSTAL_PILLAR',
    pincode: '324009',
  },
  {
    slug: 'xpeedo-logistics',
    name: 'Xpeedo Logistics',
    category: 'Hyperlocal & B2B Fulfillment',
    tagline: 'Regional Hubs, Pickup/Drop & Dispatch Network',
    roleInSystem: 'Brand + Hub/Store Partner',
    coreProductsServices:
      'Hyperlocal pickup & drop, last-mile dispatch, business/B2B delivery, beat-linked logistics fulfillment',
    storeBeatHubScope:
      'Regional hubs, pickup/drop points & commercial zones via Commercial Store Directory',
    marketingGrowthReturn:
      'Repeat merchant delivery demand, order fulfillment backbone, aur business lead capture',
    accentColor: '#0F172A',
    themePresetName: 'Command Slate',
    logoPresetId: 'LOGISTICS_HUB',
    pincode: '324009',
  },
  {
    slug: 'xpeedo-ev',
    name: 'Xpeedo EV',
    category: 'Electric Mobility & Fleet',
    tagline: 'EV Two/Three-Wheelers, Spares & Fleet Rentals',
    roleInSystem: 'Brand + Store Partner',
    coreProductsServices:
      'Electric two-wheelers & three-wheelers, EV components/spares, fleet rentals, test-ride/service touchpoints',
    storeBeatHubScope:
      'EV showroom/service/rental points across PINs & beats via All Vendors & Partner Storefront Studio',
    marketingGrowthReturn:
      'High-ticket retail & fleet leads, product catalog showcase, aur local promotional reach',
    accentColor: '#065F46',
    themePresetName: 'EV Emerald',
    logoPresetId: 'EV_MOBILITY',
    pincode: '324009',
  },
  {
    slug: 'xpokart',
    name: 'Xpokart',
    category: 'B2B Commerce & Hyperlocal Fulfillment',
    tagline: 'Merchant Catalog, Stores & B2B Orders',
    roleInSystem: 'Brand + Commerce Partner',
    coreProductsServices:
      'B2B wholesale catalog, local merchant storefronts, hyperlocal fulfillment via Kota Division hubs',
    storeBeatHubScope: 'All 13 regional commercial & postal hubs',
    marketingGrowthReturn: 'Direct merchant retention, B2B lead pipeline & local COD velocity',
    accentColor: '#1D4ED8',
    themePresetName: 'Commerce Blue',
    logoPresetId: 'STORE_FRONT',
    pincode: '324009',
  },
  {
    slug: 'drop-dash',
    name: 'Drop Dash',
    category: 'Express Parcel & Micro-Fulfillment',
    tagline: 'Last-Mile Parcel & Hyperlocal Dispatch',
    roleInSystem: 'Brand + Dispatch Partner',
    coreProductsServices: 'Express parcel pickup, intracity beat dispatch & POD tracking',
    storeBeatHubScope: 'Beat-linked dispatch hubs & express drop counters',
    marketingGrowthReturn: 'High-frequency daily parcels & repeat SLA fulfillment',
    accentColor: '#0F172A',
    themePresetName: 'Command Slate',
    logoPresetId: 'LOGISTICS_HUB',
    pincode: '324009',
  },
  {
    slug: 'shop-deck',
    name: 'Shop Deck',
    category: 'Retail Merchandising & Catalog SaaS',
    tagline: 'Storefront Merchandising & Customer CRM',
    roleInSystem: 'Brand + Retail SaaS Partner',
    coreProductsServices: 'Digital retail catalog, local store CRM, follow-ups & promotions',
    storeBeatHubScope: 'Local merchant storefronts across Kota & Baran beats',
    marketingGrowthReturn: 'Storefront conversion & repeat neighborhood shopping',
    accentColor: '#7C3AED',
    themePresetName: 'Retail Violet',
    logoPresetId: 'STORE_FRONT',
    pincode: '324009',
  },
];

export interface PartnerPublicBranding {
  id: string;
  partnerSlug: string;
  partnerType: PartnerEntityType;
  displayName: string;
  category: string;
  tagline?: string;
  monogram: string;
  logoUrl?: string;
  logoPresetId?: string;
  themePresetName?: string;
  accentColor: string;
  roleInSystem?: string;
  coreProductsServices?: string;
  storeBeatHubScope?: string;
  status: PartnerLifecycleStatus;
  availableStores: Array<{ id: string; code: string; name: string; pincode: string }>;
}

export interface PartnerDataFlowSummary {
  partner: PartnerAccount;
  brand?: Brand;
  stores: Store[];
  teamMembers: SanitizedPartnerTeamMember[];
  pendingRequests: SanitizedPartnerTeamMember[];
  crmRecords: StoreCrmRecord[];
  crmByStage: Record<StoreCrmStage, number>;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

function generateId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

export function slugifyPartnerName(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || `partner-${Date.now().toString(36)}`;
}

function buildMonogram(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'PR';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase();
}

function sanitizeMember(member: PartnerTeamMember): SanitizedPartnerTeamMember {
  const { passwordHash: _removed, ...safe } = member;
  return safe;
}

class PartnerBrandService {
  private listeners = new Set<() => void>();

  constructor() {
    this.ensureCoreStrategicPartnersOnInit();
  }

  private ensureCoreStrategicPartnersOnInit(): void {
    try {
      const alreadySeeded = localStorage.getItem(CORE_PILLARS_SEEDED_KEY);
      if (alreadySeeded) return;
      this.syncCoreStrategicPartners(false);
      localStorage.setItem(CORE_PILLARS_SEEDED_KEY, '1');
    } catch {
      // ignore storage unavailable
    }
  }

  public syncCoreStrategicPartners(notifyListeners = true): number {
    const existingAccounts = this.getAllPartnerAccounts();
    let createdCount = 0;

    CORE_STRATEGIC_PARTNERS.forEach((spec) => {
      const exists = existingAccounts.some(
        (a) => a.partnerSlug.toLowerCase() === spec.slug.toLowerCase()
      );
      if (!exists) {
        this.createBrandWithOwner(
          {
            name: spec.name,
            customSlug: spec.slug,
            category: spec.category,
            tagline: spec.tagline,
            accentColor: spec.accentColor,
            themePresetName: spec.themePresetName,
            logoPresetId: spec.logoPresetId,
            roleInSystem: spec.roleInSystem,
            coreProductsServices: spec.coreProductsServices,
            storeBeatHubScope: spec.storeBeatHubScope,
            marketingGrowthReturn: spec.marketingGrowthReturn,
            ownerName: 'Mahendra Kumar Meena',
            ownerEmail: `${spec.slug}@partner.local`,
            ownerPhone: '8769706002',
            pincode: spec.pincode,
            ownerPasscode: 'Partner@2026',
            status: 'Active',
          },
          notifyListeners,
          true
        );
        createdCount += 1;
      }
    });

    if (notifyListeners && createdCount > 0) {
      this.notify();
    }
    return createdCount;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore subscriber errors
      }
    });
  }

  // --------------------------------------------------------------------------
  // ADMIN READ METHODS
  // --------------------------------------------------------------------------

  public getAllBrands(): Brand[] {
    return readJson<Brand[]>(BRANDS_KEY, []);
  }

  public getAllStores(): Store[] {
    return readJson<Store[]>(STORES_KEY, []);
  }

  public getAllPartnerAccounts(): PartnerAccount[] {
    return readJson<PartnerAccount[]>(ACCOUNTS_KEY, []);
  }

  public getAllPartners(): PartnerAccount[] {
    return this.getAllPartnerAccounts();
  }

  public saveActivePartnerSession(session: PartnerAuthSession | null): void {
    writeJson(SESSION_KEY, session);
    this.notify();
  }

  public getPartnerById(partnerId: string): PartnerAccount | undefined {
    return this.getAllPartnerAccounts().find((p) => p.id === partnerId);
  }

  public getPartnerBySlug(partnerSlug: string): PartnerAccount | undefined {
    const clean = (partnerSlug || '').trim().toLowerCase();
    return this.getAllPartnerAccounts().find((p) => p.partnerSlug.toLowerCase() === clean);
  }

  public ensureUniqueSlug(requestedSlug: string, excludePartnerId?: string): string {
    const base = slugifyPartnerName(requestedSlug);
    const accounts = this.getAllPartnerAccounts().filter((a) => a.id !== excludePartnerId);
    if (!accounts.some((a) => a.partnerSlug.toLowerCase() === base)) {
      return base;
    }
    let idx = 2;
    while (accounts.some((a) => a.partnerSlug.toLowerCase() === `${base}-${idx}`)) {
      idx += 1;
    }
    return `${base}-${idx}`;
  }

  public getPartnerLoginPath(partnerSlug: string): string {
    return `/partner/login/${partnerSlug}`;
  }

  public getPartnerWorkspacePath(partnerSlug: string): string {
    return `/partner/workspace/${partnerSlug}`;
  }

  public getPartnerDataFlowSummary(partnerId: string): PartnerDataFlowSummary | null {
    const partner = this.getPartnerById(partnerId);
    if (!partner) return null;

    const brand = partner.brandId
      ? this.getAllBrands().find((b) => b.id === partner.brandId)
      : undefined;

    const allStores = this.getAllStores();
    const stores = allStores.filter(
      (s) =>
        s.partnerAccountId === partner.id ||
        (partner.brandId ? s.brandId === partner.brandId : false) ||
        (partner.directStoreId ? s.id === partner.directStoreId : false)
    );

    const allTeam = readJson<PartnerTeamMember[]>(TEAM_KEY, []).filter(
      (m) => m.partnerId === partner.id
    );
    const teamMembers = allTeam.filter((m) => m.status !== 'Pending').map(sanitizeMember);
    const pendingRequests = allTeam.filter((m) => m.status === 'Pending').map(sanitizeMember);

    const crmRecords = readJson<StoreCrmRecord[]>(CRM_KEY, []).filter(
      (r) => r.partnerId === partner.id
    );

    const crmByStage: Record<StoreCrmStage, number> = {
      New: 0,
      'In Follow-Up': 0,
      Qualified: 0,
      Converted: 0,
      Closed: 0,
    };
    crmRecords.forEach((r) => {
      crmByStage[r.stage] = (crmByStage[r.stage] || 0) + 1;
    });

    return {
      partner,
      brand,
      stores,
      teamMembers,
      pendingRequests,
      crmRecords,
      crmByStage,
    };
  }

  public getGlobalSummaryCounts(): {
    totalBrands: number;
    totalLinkedStores: number;
    totalDirectPartners: number;
    pendingTeamApprovals: number;
    totalCrmRecords: number;
  } {
    const brands = this.getAllBrands();
    const stores = this.getAllStores();
    const accounts = this.getAllPartnerAccounts();
    const team = readJson<PartnerTeamMember[]>(TEAM_KEY, []);
    const crm = readJson<StoreCrmRecord[]>(CRM_KEY, []);

    return {
      totalBrands: brands.length,
      totalLinkedStores: stores.filter((s) => s.ownershipType === 'BRAND_LINKED').length,
      totalDirectPartners: accounts.filter((a) => a.partnerType !== 'BRAND').length,
      pendingTeamApprovals: team.filter((m) => m.status === 'Pending').length,
      totalCrmRecords: crm.length,
    };
  }

  // --------------------------------------------------------------------------
  // ADMIN MUTATIONS: BRANDS, LINKED STORES & DIRECT PARTNERS
  // --------------------------------------------------------------------------

  public createBrandWithOwner(
    input: {
      name: string;
      customSlug?: string;
      category: string;
      tagline?: string;
      logoUrl?: string;
      logoPresetId?: string;
      themePresetName?: string;
      accentColor?: string;
      roleInSystem?: string;
      coreProductsServices?: string;
      storeBeatHubScope?: string;
      marketingGrowthReturn?: string;
      ownerName: string;
      ownerEmail: string;
      ownerPhone: string;
      pincode: string;
      ownerPasscode: string;
      status?: PartnerLifecycleStatus;
    },
    shouldNotify = true,
    skipBrandOwnerSync = false
  ): { brand: Brand; partner: PartnerAccount; ownerMember: SanitizedPartnerTeamMember } {
    const now = new Date().toISOString();
    const cleanName = sanitizeUserInput(input.name, 80);
    const partnerSlug = this.ensureUniqueSlug(input.customSlug || cleanName);
    const brandId = generateId('BRD');
    const partnerId = generateId('PRT');
    const status: PartnerLifecycleStatus = input.status || 'Active';
    const monogram = buildMonogram(cleanName);
    const accentColor = input.accentColor?.trim() || '#0F172A';
    const logoPresetId = input.logoPresetId?.trim() || 'MONOGRAM';

    const brand: Brand = {
      id: brandId,
      slug: partnerSlug,
      name: cleanName,
      category: sanitizeUserInput(input.category, 60) || 'Retail & Commerce',
      tagline: input.tagline ? sanitizeUserInput(input.tagline, 120) : undefined,
      logoUrl: input.logoUrl?.trim() || undefined,
      logoPresetId,
      themePresetName: input.themePresetName?.trim() || undefined,
      monogram,
      accentColor,
      roleInSystem: input.roleInSystem ? sanitizeUserInput(input.roleInSystem, 120) : undefined,
      coreProductsServices: input.coreProductsServices
        ? sanitizeUserInput(input.coreProductsServices, 300)
        : undefined,
      storeBeatHubScope: input.storeBeatHubScope
        ? sanitizeUserInput(input.storeBeatHubScope, 300)
        : undefined,
      marketingGrowthReturn: input.marketingGrowthReturn
        ? sanitizeUserInput(input.marketingGrowthReturn, 300)
        : undefined,
      ownerName: sanitizeUserInput(input.ownerName, 60),
      ownerPhone: input.ownerPhone.replace(/\D/g, '').slice(-10),
      ownerEmail: input.ownerEmail.trim().toLowerCase(),
      status,
      createdAt: now,
      updatedAt: now,
    };

    const partner: PartnerAccount = {
      id: partnerId,
      partnerSlug,
      partnerType: 'BRAND',
      brandId,
      displayName: cleanName,
      category: brand.category,
      tagline: brand.tagline,
      monogram,
      logoUrl: brand.logoUrl,
      logoPresetId,
      themePresetName: brand.themePresetName,
      accentColor,
      roleInSystem: brand.roleInSystem,
      coreProductsServices: brand.coreProductsServices,
      storeBeatHubScope: brand.storeBeatHubScope,
      marketingGrowthReturn: brand.marketingGrowthReturn,
      ownerName: brand.ownerName,
      ownerEmail: brand.ownerEmail || '',
      ownerPhone: brand.ownerPhone,
      pincode: input.pincode.trim() || '324009',
      status,
      createdAt: now,
      updatedAt: now,
    };

    const ownerMember: PartnerTeamMember = {
      id: generateId('PTM'),
      partnerId,
      brandId,
      assignedStoreIds: [],
      name: brand.ownerName,
      email: brand.ownerEmail || `${partnerSlug}@partner.local`,
      phone: brand.ownerPhone,
      role: 'PARTNER_OWNER',
      permissions: { ...DEFAULT_ROLE_PERMISSIONS.PARTNER_OWNER },
      passwordHash: hashPasswordSync(input.ownerPasscode.trim() || 'Partner@123'),
      status: 'Active',
      createdAt: now,
      updatedAt: now,
    };

    writeJson(BRANDS_KEY, [brand, ...this.getAllBrands()]);
    writeJson(ACCOUNTS_KEY, [partner, ...this.getAllPartnerAccounts()]);
    writeJson(TEAM_KEY, [ownerMember, ...readJson<PartnerTeamMember[]>(TEAM_KEY, [])]);
    if (!skipBrandOwnerSync) {
      brandOwnerService.syncFromPartnerAccount({
        brandName: cleanName,
        partnerSlug,
        ownerName: brand.ownerName,
        ownerEmail: ownerMember.email,
        ownerPhone: brand.ownerPhone,
        rawPasscode: input.ownerPasscode.trim() || 'Partner@123',
        category: brand.category,
        tagline: brand.tagline,
        accentColor,
        pincode: partner.pincode,
        partnerStatus: status,
        onboardingSource: 'ADMIN_CREATED',
      });
    }
    if (shouldNotify) {
      this.notify();
    }

    return { brand, partner, ownerMember: sanitizeMember(ownerMember) };
  }

  public addLinkedStoreToBrand(input: {
    brandId: string;
    name: string;
    code?: string;
    pincode: string;
    beatNo?: string;
    city?: string;
    address: string;
    managerName?: string;
    managerPhone?: string;
    status?: PartnerLifecycleStatus;
  }): Store | null {
    const brand = this.getAllBrands().find((b) => b.id === input.brandId);
    if (!brand) return null;
    const partner = this.getAllPartnerAccounts().find((p) => p.brandId === brand.id);
    if (!partner) return null;

    const now = new Date().toISOString();
    const store: Store = {
      id: generateId('STR'),
      code:
        input.code?.trim().toUpperCase() ||
        `${brand.monogram}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      name: sanitizeUserInput(input.name, 80),
      ownershipType: 'BRAND_LINKED',
      brandId: brand.id,
      partnerAccountId: partner.id,
      pincode: input.pincode.trim() || '324009',
      beatNo: input.beatNo?.trim() || undefined,
      city: input.city?.trim() || undefined,
      address: sanitizeUserInput(input.address, 200),
      managerName: input.managerName ? sanitizeUserInput(input.managerName, 60) : undefined,
      managerPhone: input.managerPhone ? input.managerPhone.replace(/\D/g, '').slice(-10) : undefined,
      status: input.status || 'Active',
      createdAt: now,
      updatedAt: now,
    };

    writeJson(STORES_KEY, [store, ...this.getAllStores()]);
    this.notify();
    return store;
  }

  public createDirectPartnerStore(input: {
    partnerType: 'DIRECT_STORE' | 'LOCAL_PARTNER';
    name: string;
    customSlug?: string;
    category: string;
    tagline?: string;
    logoUrl?: string;
    logoPresetId?: string;
    themePresetName?: string;
    accentColor?: string;
    roleInSystem?: string;
    coreProductsServices?: string;
    storeBeatHubScope?: string;
    marketingGrowthReturn?: string;
    pincode: string;
    beatNo?: string;
    city?: string;
    address: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    ownerPasscode: string;
    status?: PartnerLifecycleStatus;
  }): { store: Store; partner: PartnerAccount; ownerMember: SanitizedPartnerTeamMember } {
    const now = new Date().toISOString();
    const cleanName = sanitizeUserInput(input.name, 80);
    const partnerSlug = this.ensureUniqueSlug(input.customSlug || cleanName);
    const storeId = generateId('STR');
    const partnerId = generateId('PRT');
    const status: PartnerLifecycleStatus = input.status || 'Active';
    const monogram = buildMonogram(cleanName);
    const accentColor = input.accentColor?.trim() || '#1E293B';
    const logoPresetId = input.logoPresetId?.trim() || 'STORE_FRONT';

    const store: Store = {
      id: storeId,
      code: `DIR-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      name: cleanName,
      ownershipType: 'DIRECT',
      partnerAccountId: partnerId,
      pincode: input.pincode.trim() || '324009',
      beatNo: input.beatNo?.trim() || undefined,
      city: input.city?.trim() || undefined,
      address: sanitizeUserInput(input.address, 200),
      managerName: sanitizeUserInput(input.ownerName, 60),
      managerPhone: input.ownerPhone.replace(/\D/g, '').slice(-10),
      status,
      createdAt: now,
      updatedAt: now,
    };

    const partner: PartnerAccount = {
      id: partnerId,
      partnerSlug,
      partnerType: input.partnerType,
      directStoreId: storeId,
      displayName: cleanName,
      category: sanitizeUserInput(input.category, 60) || 'Local Store & Services',
      tagline: input.tagline ? sanitizeUserInput(input.tagline, 120) : undefined,
      monogram,
      logoUrl: input.logoUrl?.trim() || undefined,
      logoPresetId,
      themePresetName: input.themePresetName?.trim() || undefined,
      accentColor,
      roleInSystem: input.roleInSystem ? sanitizeUserInput(input.roleInSystem, 120) : undefined,
      coreProductsServices: input.coreProductsServices
        ? sanitizeUserInput(input.coreProductsServices, 300)
        : undefined,
      storeBeatHubScope: input.storeBeatHubScope
        ? sanitizeUserInput(input.storeBeatHubScope, 300)
        : undefined,
      marketingGrowthReturn: input.marketingGrowthReturn
        ? sanitizeUserInput(input.marketingGrowthReturn, 300)
        : undefined,
      ownerName: store.managerName || cleanName,
      ownerEmail: input.ownerEmail.trim().toLowerCase(),
      ownerPhone: store.managerPhone || '',
      pincode: store.pincode,
      status,
      createdAt: now,
      updatedAt: now,
    };

    const ownerMember: PartnerTeamMember = {
      id: generateId('PTM'),
      partnerId,
      assignedStoreIds: [storeId],
      name: partner.ownerName,
      email: partner.ownerEmail || `${partnerSlug}@partner.local`,
      phone: partner.ownerPhone,
      role: 'PARTNER_OWNER',
      permissions: { ...DEFAULT_ROLE_PERMISSIONS.PARTNER_OWNER },
      passwordHash: hashPasswordSync(input.ownerPasscode.trim() || 'Partner@123'),
      status: 'Active',
      createdAt: now,
      updatedAt: now,
    };

    writeJson(STORES_KEY, [store, ...this.getAllStores()]);
    writeJson(ACCOUNTS_KEY, [partner, ...this.getAllPartnerAccounts()]);
    writeJson(TEAM_KEY, [ownerMember, ...readJson<PartnerTeamMember[]>(TEAM_KEY, [])]);
    brandOwnerService.syncFromPartnerAccount({
      brandName: cleanName,
      partnerSlug,
      ownerName: partner.ownerName,
      ownerEmail: ownerMember.email,
      ownerPhone: partner.ownerPhone,
      rawPasscode: input.ownerPasscode.trim() || 'Partner@123',
      category: partner.category,
      tagline: partner.tagline,
      accentColor,
      pincode: partner.pincode,
      partnerStatus: status,
      onboardingSource: 'ADMIN_CREATED',
    });
    this.notify();

    return { store, partner, ownerMember: sanitizeMember(ownerMember) };
  }

  public updatePartnerStatus(
    partnerId: string,
    status: PartnerLifecycleStatus,
    skipBrandOwnerSync = false
  ): void {
    const now = new Date().toISOString();
    const accounts = this.getAllPartnerAccounts();
    const target = accounts.find((a) => a.id === partnerId);
    if (!target) return;

    const nextAccounts = accounts.map((a) =>
      a.id === partnerId ? { ...a, status, updatedAt: now } : a
    );
    writeJson(ACCOUNTS_KEY, nextAccounts);

    if (target.brandId) {
      const nextBrands = this.getAllBrands().map((b) =>
        b.id === target.brandId ? { ...b, status, updatedAt: now } : b
      );
      writeJson(BRANDS_KEY, nextBrands);
    }

    if (target.directStoreId) {
      const nextStores = this.getAllStores().map((s) =>
        s.id === target.directStoreId ? { ...s, status, updatedAt: now } : s
      );
      writeJson(STORES_KEY, nextStores);
    }

    // If partner is suspended/pending, invalidate active partner session if it belongs to this partner
    if (status !== 'Active') {
      const currentSession = readJson<PartnerAuthSession | null>(SESSION_KEY, null);
      if (currentSession?.partnerId === partnerId) {
        writeJson(SESSION_KEY, null);
      }
    }

    if (!skipBrandOwnerSync) {
      const bp = brandOwnerService.getBrandProfileBySlugOrKey(target.partnerSlug);
      if (bp) {
        brandOwnerService.toggleBrandStatus(
          bp.id,
          status === 'Active' ? 'ACTIVE' : status === 'Pending' ? 'PENDING_APPROVAL' : 'LOCKED',
          'Master Admin',
          true
        );
      }
    }

    this.notify();
  }

  public verifyOwnerPasscodeFallback(partnerSlug: string, rawCredential: string): boolean {
    const partner = this.getPartnerBySlug(partnerSlug);
    if (!partner || partner.status !== 'Active') return false;
    const ownerMember = readJson<PartnerTeamMember[]>(TEAM_KEY, []).find(
      (m) => m.partnerId === partner.id && m.role === 'PARTNER_OWNER' && m.status === 'Active'
    );
    if (!ownerMember || !ownerMember.passwordHash) return false;
    return verifyPasswordSync((rawCredential || '').trim(), ownerMember.passwordHash);
  }

  public syncOwnerCredentialsFromBrandProfile(input: {
    partnerSlug: string;
    ownerName?: string;
    ownerEmail?: string;
    ownerPhone?: string;
    newPassword?: string;
  }): void {
    const partner = this.getPartnerBySlug(input.partnerSlug);
    if (!partner) return;
    const now = new Date().toISOString();

    const accounts = this.getAllPartnerAccounts().map((a) =>
      a.id === partner.id
        ? {
            ...a,
            ownerName: input.ownerName || a.ownerName,
            ownerEmail: input.ownerEmail || a.ownerEmail,
            ownerPhone: input.ownerPhone ? normalizeMobile10(input.ownerPhone) || a.ownerPhone : a.ownerPhone,
            updatedAt: now,
          }
        : a
    );
    writeJson(ACCOUNTS_KEY, accounts);

    const team = readJson<PartnerTeamMember[]>(TEAM_KEY, []);
    const nextTeam = team.map((m) => {
      if (m.partnerId === partner.id && m.role === 'PARTNER_OWNER') {
        return {
          ...m,
          name: input.ownerName || m.name,
          email: input.ownerEmail ? input.ownerEmail.trim().toLowerCase() : m.email,
          phone: input.ownerPhone ? normalizeMobile10(input.ownerPhone) || m.phone : m.phone,
          passwordHash: input.newPassword ? hashPasswordSync(input.newPassword.trim()) : m.passwordHash,
          updatedAt: now,
        };
      }
      return m;
    });
    writeJson(TEAM_KEY, nextTeam);
    this.notify();
  }

  public updateStore(
    storeId: string,
    patch: Partial<Pick<Store, 'name' | 'pincode' | 'beatNo' | 'city' | 'address' | 'managerName' | 'managerPhone' | 'status'>>,
    session?: PartnerAuthSession
  ): Store | null {
    const stores = this.getAllStores();
    const existing = stores.find((s) => s.id === storeId);
    if (!existing) return null;

    if (session) {
      if (existing.partnerAccountId !== session.partnerId) return null;
      if (!session.permissions.canManageStores && session.memberRole !== 'PARTNER_OWNER') {
        return null;
      }
      if (
        session.memberRole !== 'PARTNER_OWNER' &&
        session.assignedStoreIds.length > 0 &&
        !session.assignedStoreIds.includes(storeId)
      ) {
        return null;
      }
    }

    const updated: Store = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    writeJson(
      STORES_KEY,
      stores.map((s) => (s.id === storeId ? updated : s))
    );
    this.notify();
    return updated;
  }

  /**
   * Optional helper allowing Admin to import an existing CommercialStoreRecord
   * from Commercial Directory into Partner & Brand Management without duplicating data.
   */
  public onboardCommercialStoreRecord(
    record: CommercialStoreRecord,
    ownerPasscode: string
  ): PartnerAccount {
    const existingByName = this.getAllPartnerAccounts().find(
      (a) => a.displayName.toLowerCase() === (record.brandName || record.storeName).toLowerCase()
    );
    if (existingByName) return existingByName;

    if (record.storeType === 'BRAND_FRANCHISE' && record.brandName) {
      const { brand, partner } = this.createBrandWithOwner({
        name: record.brandName,
        category: record.brandCategoryTag || record.category,
        accentColor: record.brandAccentColor || '#0F172A',
        logoUrl: record.brandLogoUrl,
        ownerName: record.ownerName || record.brandName,
        ownerEmail: `${slugifyPartnerName(record.brandName)}@partner.local`,
        ownerPhone: record.primaryPhone || '',
        pincode: record.pincode || '324009',
        ownerPasscode,
        status: 'Active',
      });
      this.addLinkedStoreToBrand({
        brandId: brand.id,
        name: record.storeName,
        pincode: record.pincode || '324009',
        beatNo: record.beatNo,
        address: record.fullAddress,
        managerName: record.ownerName,
        managerPhone: record.primaryPhone,
        status: 'Active',
      });
      return partner;
    }

    const { partner } = this.createDirectPartnerStore({
      partnerType: record.storeType === 'LOCAL_MERCHANT' ? 'LOCAL_PARTNER' : 'DIRECT_STORE',
      name: record.storeName,
      category: record.category || 'Local Business Partner',
      pincode: record.pincode || '324009',
      beatNo: record.beatNo,
      address: record.fullAddress,
      ownerName: record.ownerName || record.storeName,
      ownerEmail: `${slugifyPartnerName(record.storeName)}@partner.local`,
      ownerPhone: record.primaryPhone || '',
      ownerPasscode,
      status: 'Active',
    });
    return partner;
  }

  public updatePartnerBrandingAndProfile(
    partnerId: string,
    patch: {
      displayName?: string;
      category?: string;
      tagline?: string;
      monogram?: string;
      accentColor?: string;
      themePresetName?: string;
      logoPresetId?: string;
      logoUrl?: string;
      roleInSystem?: string;
      coreProductsServices?: string;
      storeBeatHubScope?: string;
      marketingGrowthReturn?: string;
    }
  ): PartnerAccount | null {
    const now = new Date().toISOString();
    const accounts = this.getAllPartnerAccounts();
    const existing = accounts.find((a) => a.id === partnerId);
    if (!existing) return null;

    const cleanDisplayName =
      patch.displayName !== undefined
        ? sanitizeUserInput(patch.displayName, 80) || existing.displayName
        : existing.displayName;
    const cleanMonogram =
      patch.monogram !== undefined
        ? patch.monogram.trim().toUpperCase().slice(0, 3) || existing.monogram
        : existing.monogram;

    const updatedAccount: PartnerAccount = {
      ...existing,
      displayName: cleanDisplayName,
      category:
        patch.category !== undefined
          ? sanitizeUserInput(patch.category, 60) || existing.category
          : existing.category,
      tagline:
        patch.tagline !== undefined
          ? patch.tagline.trim()
            ? sanitizeUserInput(patch.tagline, 120)
            : undefined
          : existing.tagline,
      monogram: cleanMonogram,
      accentColor: patch.accentColor?.trim() || existing.accentColor,
      themePresetName:
        patch.themePresetName !== undefined ? patch.themePresetName : existing.themePresetName,
      logoPresetId:
        patch.logoPresetId !== undefined ? patch.logoPresetId : existing.logoPresetId,
      logoUrl:
        patch.logoUrl !== undefined
          ? patch.logoUrl.trim() || undefined
          : existing.logoUrl,
      roleInSystem:
        patch.roleInSystem !== undefined
          ? sanitizeUserInput(patch.roleInSystem, 120) || undefined
          : existing.roleInSystem,
      coreProductsServices:
        patch.coreProductsServices !== undefined
          ? sanitizeUserInput(patch.coreProductsServices, 300) || undefined
          : existing.coreProductsServices,
      storeBeatHubScope:
        patch.storeBeatHubScope !== undefined
          ? sanitizeUserInput(patch.storeBeatHubScope, 300) || undefined
          : existing.storeBeatHubScope,
      marketingGrowthReturn:
        patch.marketingGrowthReturn !== undefined
          ? sanitizeUserInput(patch.marketingGrowthReturn, 300) || undefined
          : existing.marketingGrowthReturn,
      updatedAt: now,
    };

    writeJson(
      ACCOUNTS_KEY,
      accounts.map((a) => (a.id === partnerId ? updatedAccount : a))
    );

    if (existing.brandId) {
      const brands = this.getAllBrands();
      writeJson(
        BRANDS_KEY,
        brands.map((b) =>
          b.id === existing.brandId
            ? {
                ...b,
                name: updatedAccount.displayName,
                category: updatedAccount.category,
                tagline: updatedAccount.tagline,
                monogram: updatedAccount.monogram,
                accentColor: updatedAccount.accentColor,
                themePresetName: updatedAccount.themePresetName,
                logoPresetId: updatedAccount.logoPresetId,
                logoUrl: updatedAccount.logoUrl,
                roleInSystem: updatedAccount.roleInSystem,
                coreProductsServices: updatedAccount.coreProductsServices,
                storeBeatHubScope: updatedAccount.storeBeatHubScope,
                marketingGrowthReturn: updatedAccount.marketingGrowthReturn,
                updatedAt: now,
              }
            : b
        )
      );
    }

    this.notify();
    return updatedAccount;
  }

  // --------------------------------------------------------------------------
  // PARTNER PUBLIC ENTRY & ISOLATED AUTHENTICATION
  // --------------------------------------------------------------------------

  public getPartnerPublicBranding(partnerSlug: string): PartnerPublicBranding | null {
    const partner = this.getPartnerBySlug(partnerSlug);
    if (!partner) return null;

    const availableStores = this.getAllStores()
      .filter(
        (s) =>
          s.status === 'Active' &&
          (s.partnerAccountId === partner.id ||
            (partner.brandId ? s.brandId === partner.brandId : false))
      )
      .map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        pincode: s.pincode,
      }));

    return {
      id: partner.id,
      partnerSlug: partner.partnerSlug,
      partnerType: partner.partnerType,
      displayName: partner.displayName,
      category: partner.category,
      tagline: partner.tagline,
      monogram: partner.monogram,
      logoUrl: partner.logoUrl,
      logoPresetId: partner.logoPresetId,
      themePresetName: partner.themePresetName,
      accentColor: partner.accentColor,
      roleInSystem: partner.roleInSystem,
      coreProductsServices: partner.coreProductsServices,
      storeBeatHubScope: partner.storeBeatHubScope,
      status: partner.status,
      availableStores,
    };
  }

  private getPartnerLockKey(partnerId: string, memberId: string): string {
    return `${partnerId}::${memberId}`;
  }

  private getDeviceFingerprint(): string {
    if (typeof navigator === 'undefined') return 'Web-Session';
    return `${navigator.platform || 'Web'} (${navigator.userAgent?.slice(0, 48) || 'Browser'})`;
  }

  private issueSingleDeviceLock(partnerId: string, memberId: string): string {
    const token = `PSESS-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;
    const locks = readJson<Record<string, { token: string; signedInAt: string; device: string }>>(
      PARTNER_LOCKS_KEY,
      {}
    );
    locks[this.getPartnerLockKey(partnerId, memberId)] = {
      token,
      signedInAt: new Date().toISOString(),
      device: this.getDeviceFingerprint(),
    };
    writeJson(PARTNER_LOCKS_KEY, locks);
    return token;
  }

  public authenticatePartnerMember(
    partnerSlug: string,
    identifier: string,
    passcode: string,
    options?: { forceTakeoverSession?: boolean }
  ): { success: true; session: PartnerAuthSession } | { success: false; code?: string; error: string } {
    const partner = this.getPartnerBySlug(partnerSlug);
    if (!partner) {
      return { success: false, error: 'Brand / Partner portal link was not found.' };
    }

    const brandProfile = brandOwnerService.getBrandProfileBySlugOrKey(partnerSlug);
    if (brandProfile?.status === 'PENDING_APPROVAL' || partner.status === 'Pending') {
      return {
        success: false,
        error: `Registration for "${partner.displayName}" is currently PENDING_APPROVAL. Master Admin approval is required before signing in.`,
      };
    }
    if (brandProfile?.status === 'REJECTED') {
      return {
        success: false,
        error: `Registration for "${partner.displayName}" was declined by Master Admin.`,
      };
    }
    if (brandProfile?.status === 'LOCKED' || partner.status !== 'Active') {
      return {
        success: false,
        error: `This "${partner.displayName}" workspace is currently LOCKED or suspended by Master Admin.`,
      };
    }

    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPhone = normalizeMobile10(identifier || '');
    const cleanPass = (passcode || '').trim();

    if ((!cleanId && cleanPhone.length < 6) || !cleanPass) {
      return {
        success: false,
        error: 'Please enter both your Email / Registered Mobile / Login ID and Passcode.',
      };
    }

    const members = readJson<PartnerTeamMember[]>(TEAM_KEY, []).filter(
      (m) => m.partnerId === partner.id
    );

    const matched = members.find(
      (m) =>
        m.email.toLowerCase() === cleanId ||
        (cleanPhone.length >= 6 && normalizeMobile10(m.phone) === cleanPhone) ||
        m.id.toLowerCase() === cleanId
    );

    // Check unified BrandOwnerProfile login credentials (Login ID, Unique Code, Email, or Mobile + Password OR 4-6 digit PIN)
    const ownerAuth = brandOwnerService.verifyBrandOwnerForPartnerPortal(
      partner.partnerSlug,
      identifier,
      cleanPass
    );

    const checkSingleDeviceConflict = (memberId: string): boolean => {
      if (options?.forceTakeoverSession) return false;
      const locks = readJson<Record<string, { token: string; signedInAt: string; device: string }>>(
        PARTNER_LOCKS_KEY,
        {}
      );
      const existingLock = locks[this.getPartnerLockKey(partner.id, memberId)];
      if (!existingLock) return false;
      const localSess = readJson<PartnerAuthSession | null>(SESSION_KEY, null);
      if (
        localSess &&
        localSess.partnerId === partner.id &&
        localSess.memberId === memberId &&
        localSess.sessionToken === existingLock.token
      ) {
        return false;
      }
      return true;
    };

    if (!matched) {
      if (ownerAuth.matched) {
        if ('error' in ownerAuth) {
          return { success: false, error: ownerAuth.error };
        }
        const ownerMember =
          members.find((m) => m.role === 'PARTNER_OWNER') || members[0];
        const targetMemberId = ownerMember?.id || ownerAuth.profile.id;
        if (checkSingleDeviceConflict(targetMemberId)) {
          return {
            success: false,
            code: 'SINGLE_SESSION_CONFLICT',
            error: `Single-Device Lock is active for "${partner.displayName}". Sign in with device takeover to supersede the other session.`,
          };
        }
        const sessionToken = this.issueSingleDeviceLock(partner.id, targetMemberId);
        const session: PartnerAuthSession = {
          partnerId: partner.id,
          partnerSlug: partner.partnerSlug,
          brandId: partner.brandId,
          memberId: targetMemberId,
          memberName: ownerAuth.profile.ownerName,
          memberRole: 'PARTNER_OWNER',
          assignedStoreIds: ownerMember?.assignedStoreIds || [],
          permissions: ownerMember?.permissions || { ...DEFAULT_ROLE_PERMISSIONS.PARTNER_OWNER },
          signedInAt: new Date().toISOString(),
          sessionToken,
          deviceFingerprint: this.getDeviceFingerprint(),
        };
        writeJson(SESSION_KEY, session);
        this.notify();
        return { success: true, session };
      }

      return {
        success: false,
        error: `No account found matching "${identifier.trim()}" inside ${partner.displayName}. Verify your Email, 10-digit Mobile, or Brand Login ID.`,
      };
    }

    if (matched.status === 'Pending') {
      return {
        success: false,
        error: 'Your onboarding request is awaiting Master Admin / owner approval (PENDING_APPROVAL).',
      };
    }
    if (matched.status === 'Deactivated') {
      return { success: false, error: 'This team account has been deactivated by the workspace admin.' };
    }

    const teamPasswordOk = Boolean(
      matched.passwordHash && verifyPasswordSync(cleanPass, matched.passwordHash)
    );
    const ownerProfileFallbackOk =
      matched.role === 'PARTNER_OWNER' && ownerAuth.matched && !('error' in ownerAuth);

    if (!teamPasswordOk && !ownerProfileFallbackOk) {
      if (matched.role === 'PARTNER_OWNER' && ownerAuth.matched && 'error' in ownerAuth) {
        return { success: false, error: ownerAuth.error };
      }
      return {
        success: false,
        error: /^\d{4,6}$/.test(cleanPass)
          ? 'Incorrect 4–6 digit passcode for this account. Please verify your assigned PIN or account password and retry.'
          : 'Incorrect password or workspace passcode. Please verify your credentials and retry.',
      };
    }

    if (checkSingleDeviceConflict(matched.id)) {
      return {
        success: false,
        code: 'SINGLE_SESSION_CONFLICT',
        error: `Single-Device Lock is active for ${matched.name} inside "${partner.displayName}". Confirm device takeover to sign out the other session.`,
      };
    }

    const sessionToken = this.issueSingleDeviceLock(partner.id, matched.id);
    const session: PartnerAuthSession = {
      partnerId: partner.id,
      partnerSlug: partner.partnerSlug,
      brandId: partner.brandId,
      memberId: matched.id,
      memberName: matched.name,
      memberRole: matched.role,
      assignedStoreIds: matched.assignedStoreIds || [],
      permissions: matched.permissions,
      signedInAt: new Date().toISOString(),
      sessionToken,
      deviceFingerprint: this.getDeviceFingerprint(),
    };

    writeJson(SESSION_KEY, session);
    this.notify();
    return { success: true, session };
  }

  public submitPartnerRegistrationRequest(
    partnerSlug: string,
    payload: {
      name: string;
      email: string;
      phone: string;
      requestedRole: PartnerTeamRole;
      preferredStoreIds?: string[];
      passcode: string;
      note?: string;
    }
  ): { success: true; request: SanitizedPartnerTeamMember } | { success: false; error: string } {
    const partner = this.getPartnerBySlug(partnerSlug);
    if (!partner) {
      return { success: false, error: 'Partner workspace not found.' };
    }
    if (partner.status === 'Suspended') {
      return { success: false, error: 'Onboarding is closed while this workspace is suspended.' };
    }

    const cleanName = sanitizeUserInput(payload.name, 60);
    const cleanEmail = payload.email.trim().toLowerCase();
    const cleanPhone = normalizeMobile10(payload.phone);

    if (cleanName.length < 2) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!cleanEmail.includes('@') && cleanPhone.length < 10) {
      return { success: false, error: 'Please provide a valid email address or 10-digit phone number.' };
    }
    if (payload.passcode.trim().length < 4) {
      return { success: false, error: 'Passcode must be at least 4 characters.' };
    }

    const allTeam = readJson<PartnerTeamMember[]>(TEAM_KEY, []);
    const duplicate = allTeam.find(
      (m) =>
        m.partnerId === partner.id &&
        ((cleanEmail && m.email.toLowerCase() === cleanEmail) ||
          (cleanPhone.length === 10 && normalizeMobile10(m.phone) === cleanPhone))
    );
    if (duplicate) {
      return {
        success: false,
        error:
          duplicate.status === 'Pending'
            ? 'An onboarding request with this email or mobile is already pending review.'
            : 'An active or existing account already exists for this email or mobile.',
      };
    }

    const role: PartnerTeamRole =
      payload.requestedRole === 'PARTNER_OWNER' ? 'STORE_MANAGER' : payload.requestedRole;

    const now = new Date().toISOString();
    const request: PartnerTeamMember = {
      id: generateId('REQ'),
      partnerId: partner.id,
      brandId: partner.brandId,
      assignedStoreIds: payload.preferredStoreIds || (partner.directStoreId ? [partner.directStoreId] : []),
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role,
      permissions: { ...DEFAULT_ROLE_PERMISSIONS[role] },
      passwordHash: hashPasswordSync(payload.passcode.trim()),
      status: 'Pending',
      requestedNote: payload.note ? sanitizeUserInput(payload.note, 200) : undefined,
      requestedViaPortal: true,
      createdAt: now,
      updatedAt: now,
    };

    writeJson(TEAM_KEY, [request, ...allTeam]);

    // Capture Partner Portal onboarding submission into CRM Leads pipeline with PARTNER_PORTAL tag
    customerService.createLead({
      customerId: `CUST-${request.id}`,
      customerName: cleanName,
      customerMobile: cleanPhone || '0000000000',
      productCode: 'PARTNER_PORTAL',
      productName: `${partner.displayName} · Partner Portal Onboarding`,
      requirement: sanitizeUserInput(
        `Requested Role: ${role}${payload.note ? ` · Note: ${payload.note}` : ''}`,
        280
      ),
      source: 'PARTNER_PORTAL',
      sourceChannel: 'PARTNER_PORTAL',
      stage: 'New',
      priority: 'High',
      leadScore: 80,
      pincode: partner.pincode || '324009',
      brandId: partner.partnerSlug,
      brandName: partner.displayName,
      businessCategory: partner.category,
      notes: `Request ID: ${request.id} · Email: ${cleanEmail || 'N/A'} · Status: PENDING_APPROVAL`,
    });

    this.notify();
    return { success: true, request: sanitizeMember(request) };
  }

  public getActivePartnerSession(expectedSlug?: string): PartnerAuthSession | null {
    const raw = readJson<PartnerAuthSession | null>(SESSION_KEY, null);
    if (!raw) return null;

    if (expectedSlug && raw.partnerSlug.toLowerCase() !== expectedSlug.toLowerCase()) {
      return null;
    }

    // Re-verify current partner & member lifecycle state on every read
    const partner = this.getPartnerById(raw.partnerId);
    if (!partner || partner.status !== 'Active') {
      return null;
    }

    // Verify single-device active lock token
    const locks = readJson<Record<string, { token: string; signedInAt: string; device: string }>>(
      PARTNER_LOCKS_KEY,
      {}
    );
    const activeLock = locks[this.getPartnerLockKey(raw.partnerId, raw.memberId)];
    if (activeLock && raw.sessionToken && activeLock.token !== raw.sessionToken) {
      writeJson(SESSION_KEY, null);
      return null;
    }

    const member = readJson<PartnerTeamMember[]>(TEAM_KEY, []).find(
      (m) => m.id === raw.memberId && m.partnerId === partner.id
    );
    if (!member || member.status !== 'Active') {
      return null;
    }

    return {
      ...raw,
      memberName: member.name,
      memberRole: member.role,
      assignedStoreIds: member.assignedStoreIds || [],
      permissions: member.permissions,
    };
  }

  public signOutPartnerSession(): void {
    const raw = readJson<PartnerAuthSession | null>(SESSION_KEY, null);
    if (raw) {
      const locks = readJson<Record<string, { token: string; signedInAt: string; device: string }>>(
        PARTNER_LOCKS_KEY,
        {}
      );
      const lockKey = this.getPartnerLockKey(raw.partnerId, raw.memberId);
      if (locks[lockKey] && (!raw.sessionToken || locks[lockKey].token === raw.sessionToken)) {
        delete locks[lockKey];
        writeJson(PARTNER_LOCKS_KEY, locks);
      }
    }
    writeJson(SESSION_KEY, null);
    this.notify();
  }

  // --------------------------------------------------------------------------
  // SCOPED WORKSPACE QUERIES & MUTATIONS (STRICT partnerId + brandId + storeId)
  // --------------------------------------------------------------------------

  public getScopedStores(session: PartnerAuthSession): Store[] {
    const partner = this.getPartnerById(session.partnerId);
    if (!partner) return [];

    const partnerStores = this.getAllStores().filter(
      (s) =>
        s.partnerAccountId === session.partnerId ||
        (session.brandId ? s.brandId === session.brandId : false)
    );

    if (session.memberRole === 'PARTNER_OWNER' || session.assignedStoreIds.length === 0) {
      return partnerStores;
    }

    return partnerStores.filter((s) => session.assignedStoreIds.includes(s.id));
  }

  public getScopedTeamMembers(session: PartnerAuthSession): SanitizedPartnerTeamMember[] {
    const seen = new Set<string>();
    const result: SanitizedPartnerTeamMember[] = [];
    for (const m of readJson<PartnerTeamMember[]>(TEAM_KEY, [])) {
      if (m.partnerId !== session.partnerId) continue;
      const dedupeKey = (m.email || m.phone || m.id).trim().toLowerCase();
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      result.push(sanitizeMember(m));
    }
    return result;
  }

  public getScopedCrmRecords(session: PartnerAuthSession): StoreCrmRecord[] {
    const allowedStoreIds = new Set(this.getScopedStores(session).map((s) => s.id));
    return readJson<StoreCrmRecord[]>(CRM_KEY, []).filter(
      (r) =>
        r.partnerId === session.partnerId &&
        (session.memberRole === 'PARTNER_OWNER' ||
          session.assignedStoreIds.length === 0 ||
          allowedStoreIds.has(r.storeId))
    );
  }

  public createCrmRecordForSession(
    session: PartnerAuthSession,
    payload: {
      storeId: string;
      customerName: string;
      customerPhone: string;
      pincode: string;
      serviceOrProduct: string;
      stage?: StoreCrmStage;
      assignedMemberId?: string;
      notes?: string;
    }
  ): StoreCrmRecord | null {
    if (!session.permissions.canCreateCrm && session.memberRole !== 'PARTNER_OWNER') {
      return null;
    }

    const allowedStores = this.getScopedStores(session);
    const targetStore = allowedStores.find((s) => s.id === payload.storeId);
    if (!targetStore) return null;

    const team = this.getScopedTeamMembers(session);
    const assignee = payload.assignedMemberId
      ? team.find((m) => m.id === payload.assignedMemberId && m.status === 'Active')
      : undefined;

    const now = new Date().toISOString();
    const record: StoreCrmRecord = {
      id: generateId('CRM'),
      partnerId: session.partnerId,
      brandId: session.brandId,
      storeId: targetStore.id,
      customerName: sanitizeUserInput(payload.customerName, 80),
      customerPhone: payload.customerPhone.replace(/\D/g, '').slice(-10),
      pincode: payload.pincode.trim() || targetStore.pincode,
      serviceOrProduct: sanitizeUserInput(payload.serviceOrProduct, 120),
      stage: payload.stage || 'New',
      assignedMemberId: assignee?.id,
      assignedMemberName: assignee?.name,
      notes: sanitizeUserInput(payload.notes || '', 400),
      createdByMemberId: session.memberId,
      createdByName: session.memberName,
      createdAt: now,
      updatedAt: now,
    };

    writeJson(CRM_KEY, [record, ...readJson<StoreCrmRecord[]>(CRM_KEY, [])]);

    const partner = this.getPartnerById(session.partnerId);
    customerService.createLead({
      customerId: `CUST-${record.id}`,
      customerName: record.customerName,
      customerMobile: record.customerPhone || '0000000000',
      productCode: 'PARTNER_PORTAL',
      productName: record.serviceOrProduct,
      requirement: sanitizeUserInput(record.notes || `Partner portal inquiry for ${record.serviceOrProduct}`, 280),
      source: 'PARTNER_PORTAL',
      sourceChannel: 'PARTNER_PORTAL',
      stage: 'New',
      priority: 'Medium',
      leadScore: 75,
      pincode: record.pincode,
      brandId: partner?.partnerSlug || session.partnerSlug,
      brandName: partner?.displayName || session.partnerSlug,
      businessCategory: partner?.category,
      assignedStaffId: record.assignedMemberId,
      assignedStaffName: record.assignedMemberName,
      notes: `Store CRM Ref: ${record.id} · Store: ${targetStore.name}`,
    });

    this.notify();
    return record;
  }

  public updateCrmRecordForSession(
    session: PartnerAuthSession,
    recordId: string,
    patch: Partial<Pick<StoreCrmRecord, 'stage' | 'notes' | 'assignedMemberId' | 'assignedMemberName' | 'serviceOrProduct'>>
  ): StoreCrmRecord | null {
    if (!session.permissions.canEditCrm && session.memberRole !== 'PARTNER_OWNER') {
      return null;
    }

    const records = readJson<StoreCrmRecord[]>(CRM_KEY, []);
    const existing = records.find((r) => r.id === recordId && r.partnerId === session.partnerId);
    if (!existing) return null;

    const allowedStoreIds = new Set(this.getScopedStores(session).map((s) => s.id));
    if (!allowedStoreIds.has(existing.storeId)) return null;

    const updated: StoreCrmRecord = {
      ...existing,
      ...patch,
      notes: patch.notes !== undefined ? sanitizeUserInput(patch.notes, 400) : existing.notes,
      updatedAt: new Date().toISOString(),
    };

    writeJson(
      CRM_KEY,
      records.map((r) => (r.id === recordId ? updated : r))
    );
    this.notify();
    return updated;
  }

  // --------------------------------------------------------------------------
  // INTERNAL TEAM MANAGEMENT (ADMIN OR AUTHORIZED PARTNER OWNER/MANAGER)
  // --------------------------------------------------------------------------

  public addTeamMember(
    partnerId: string,
    input: {
      name: string;
      email: string;
      phone: string;
      role: PartnerTeamRole;
      assignedStoreIds: string[];
      permissions?: PartnerTeamPermissions;
      isNonTerritoryAgent?: boolean;
      assignedCategories?: string[];
      assignedBeatOrPin?: string;
      passcode: string;
    },
    actingSession?: PartnerAuthSession
  ): SanitizedPartnerTeamMember | null {
    if (actingSession) {
      if (actingSession.partnerId !== partnerId) return null;
      if (!actingSession.permissions.canManageTeam && actingSession.memberRole !== 'PARTNER_OWNER') {
        return null;
      }
    }

    const partner = this.getPartnerById(partnerId);
    if (!partner) return null;

    const cleanEmail = input.email.trim().toLowerCase();
    const cleanPhone = input.phone.replace(/\D/g, '').slice(-10);
    const allExisting = readJson<PartnerTeamMember[]>(TEAM_KEY, []);

    const duplicate = allExisting.find(
      (m) =>
        m.partnerId === partnerId &&
        ((cleanEmail && m.email.toLowerCase() === cleanEmail) ||
          (cleanPhone.length === 10 && normalizeMobile10(m.phone) === cleanPhone))
    );
    if (duplicate) {
      return sanitizeMember(duplicate);
    }

    if (input.role !== 'PARTNER_OWNER') {
      const nonOwnerMembers = allExisting.filter(
        (m) => m.partnerId === partnerId && m.role !== 'PARTNER_OWNER'
      );
      const staffFive = staffPermissionService.getOperationalStaffFive();
      const matchesCoreStaff = staffFive.some(
        (s) =>
          (cleanEmail && s.email.toLowerCase() === cleanEmail) ||
          (cleanPhone.length === 10 && normalizeMobile10(s.contact || '') === cleanPhone)
      );
      if (!matchesCoreStaff && nonOwnerMembers.length >= MAX_OPERATIONAL_STAFF_COUNT) {
        return null;
      }
    }

    const now = new Date().toISOString();
    const rbacCfg = this.getBrandRbacConfig(partnerId, input.role);
    const member: PartnerTeamMember = {
      id: generateId('PTM'),
      partnerId,
      brandId: partner.brandId,
      assignedStoreIds: input.isNonTerritoryAgent ? [] : input.assignedStoreIds,
      name: sanitizeUserInput(input.name, 60),
      email: cleanEmail,
      phone: cleanPhone,
      role: input.role,
      permissions: input.permissions || { ...rbacCfg.permissions },
      isNonTerritoryAgent: Boolean(input.isNonTerritoryAgent),
      assignedCategories: input.assignedCategories || [],
      assignedBeatOrPin: input.assignedBeatOrPin,
      passwordHash: hashPasswordSync(input.passcode.trim() || 'Team@1234'),
      status: 'Active',
      createdAt: now,
      updatedAt: now,
    };

    writeJson(TEAM_KEY, [member, ...allExisting]);
    this.notify();
    return sanitizeMember(member);
  }

  public updateTeamMember(
    memberId: string,
    patch: {
      role?: PartnerTeamRole;
      assignedStoreIds?: string[];
      permissions?: PartnerTeamPermissions;
      status?: PartnerTeamMemberStatus;
      isNonTerritoryAgent?: boolean;
      assignedCategories?: string[];
      assignedBeatOrPin?: string;
      newPasscode?: string;
    },
    actingSession?: PartnerAuthSession
  ): SanitizedPartnerTeamMember | null {
    const allTeam = readJson<PartnerTeamMember[]>(TEAM_KEY, []);
    const existing = allTeam.find((m) => m.id === memberId);
    if (!existing) return null;

    if (actingSession) {
      if (actingSession.partnerId !== existing.partnerId) return null;
      if (!actingSession.permissions.canManageTeam && actingSession.memberRole !== 'PARTNER_OWNER') {
        return null;
      }
    }

    const updated: PartnerTeamMember = {
      ...existing,
      role: patch.role ?? existing.role,
      assignedStoreIds: patch.assignedStoreIds ?? existing.assignedStoreIds,
      permissions: patch.permissions ?? existing.permissions,
      status: patch.status ?? existing.status,
      isNonTerritoryAgent:
        patch.isNonTerritoryAgent !== undefined
          ? patch.isNonTerritoryAgent
          : existing.isNonTerritoryAgent,
      assignedCategories: patch.assignedCategories ?? existing.assignedCategories,
      assignedBeatOrPin: patch.assignedBeatOrPin ?? existing.assignedBeatOrPin,
      passwordHash: patch.newPasscode?.trim()
        ? hashPasswordSync(patch.newPasscode.trim())
        : existing.passwordHash,
      updatedAt: new Date().toISOString(),
    };

    writeJson(
      TEAM_KEY,
      allTeam.map((m) => (m.id === memberId ? updated : m))
    );
    this.notify();
    return sanitizeMember(updated);
  }

  // --------------------------------------------------------------------------
  // PARTNER & BRAND LOGIN APPROVAL GOVERNANCE (OWNER / MASTER ADMIN)
  // --------------------------------------------------------------------------

  public getAllTeamMembersRaw(): SanitizedPartnerTeamMember[] {
    return readJson<PartnerTeamMember[]>(TEAM_KEY, []).map(sanitizeMember);
  }

  public getPendingBrandApprovals(): {
    pendingPartners: PartnerAccount[];
    pendingTeamLogins: Array<SanitizedPartnerTeamMember & { partnerName: string; partnerSlug: string }>;
  } {
    const accounts = this.getAllPartnerAccounts();
    const pendingPartners = accounts.filter((a) => a.status === 'Pending');
    const accountById = new Map(accounts.map((a) => [a.id, a]));
    const pendingTeamLogins = readJson<PartnerTeamMember[]>(TEAM_KEY, [])
      .filter((m) => m.status === 'Pending')
      .map((m) => {
        const partner = accountById.get(m.partnerId);
        return {
          ...sanitizeMember(m),
          partnerName: partner?.displayName || 'Unknown Brand',
          partnerSlug: partner?.partnerSlug || '',
        };
      });
    return { pendingPartners, pendingTeamLogins };
  }

  public approveOrUpdateTeamLoginAccess(
    memberId: string,
    decision: {
      status: PartnerTeamMemberStatus;
      role?: PartnerTeamRole;
      assignedStoreIds?: string[];
      isNonTerritoryAgent?: boolean;
      assignedCategories?: string[];
    }
  ): SanitizedPartnerTeamMember | null {
    return this.updateTeamMember(memberId, {
      status: decision.status,
      role: decision.role,
      assignedStoreIds: decision.assignedStoreIds,
      isNonTerritoryAgent: decision.isNonTerritoryAgent,
      assignedCategories: decision.assignedCategories,
      permissions: decision.role ? { ...DEFAULT_ROLE_PERMISSIONS[decision.role] } : undefined,
    });
  }

  // --------------------------------------------------------------------------
  // EMBEDDED BRAND RBAC MATRIX & SHARED HIERARCHY BLUEPRINT
  // --------------------------------------------------------------------------

  public getBrandRbacConfigs(partnerId: string): BrandRbacRoleConfig[] {
    const saved = readJson<BrandRbacRoleConfig[]>(RBAC_CONFIG_KEY, []).filter(
      (c) => c.partnerId === partnerId
    );
    const roles: PartnerTeamRole[] = [
      'PARTNER_OWNER',
      'STORE_MANAGER',
      'SALES_EXECUTIVE',
      'CRM_OPERATOR',
      'SUPPORT_DESK',
    ];
    return roles.map((role) => {
      const found = saved.find((s) => s.role === role);
      if (found) return found;
      return {
        partnerId,
        role,
        permissions: { ...DEFAULT_ROLE_PERMISSIONS[role] },
        allowNonTerritoryCategoryAgents: role === 'SALES_EXECUTIVE' || role === 'CRM_OPERATOR',
        updatedAt: new Date().toISOString(),
      };
    });
  }

  public getBrandRbacConfig(partnerId: string, role: PartnerTeamRole): BrandRbacRoleConfig {
    return (
      this.getBrandRbacConfigs(partnerId).find((c) => c.role === role) || {
        partnerId,
        role,
        permissions: { ...DEFAULT_ROLE_PERMISSIONS[role] },
        allowNonTerritoryCategoryAgents: false,
        updatedAt: new Date().toISOString(),
      }
    );
  }

  public updateBrandRbacConfig(
    partnerId: string,
    role: PartnerTeamRole,
    patch: {
      permissions?: Partial<PartnerTeamPermissions>;
      allowNonTerritoryCategoryAgents?: boolean;
    },
    actingSession?: PartnerAuthSession
  ): BrandRbacRoleConfig | null {
    if (actingSession) {
      if (actingSession.partnerId !== partnerId) return null;
      if (actingSession.memberRole !== 'PARTNER_OWNER' && !actingSession.permissions.canManageTeam) {
        return null;
      }
    }
    const existing = this.getBrandRbacConfig(partnerId, role);
    const updated: BrandRbacRoleConfig = {
      partnerId,
      role,
      permissions: { ...existing.permissions, ...(patch.permissions || {}) },
      allowNonTerritoryCategoryAgents:
        patch.allowNonTerritoryCategoryAgents ?? existing.allowNonTerritoryCategoryAgents,
      updatedAt: new Date().toISOString(),
    };
    const all = readJson<BrandRbacRoleConfig[]>(RBAC_CONFIG_KEY, []).filter(
      (c) => !(c.partnerId === partnerId && c.role === role)
    );
    writeJson(RBAC_CONFIG_KEY, [updated, ...all]);
    this.notify();
    return updated;
  }

  public getHierarchyBlueprintForPartner(partnerSlug: string): {
    blueprintName: string;
    sharesPostalBlueprint: boolean;
    levels: string[];
    defaultStateScope: string;
    dataIsolationNote: string;
  } {
    const clean = (partnerSlug || '').trim().toLowerCase();
    if (clean === 'india-post') {
      return {
        blueprintName: 'India Post Operational Hierarchy (Rajasthan Circle)',
        sharesPostalBlueprint: true,
        levels: ['Circle (Rajasthan)', 'Region (Ajmer)', 'Division (Kota)', 'HO / SO / BO', 'Beat / PIN'],
        defaultStateScope: 'Rajasthan Circle -> Kota Division (Scalable Pan-India)',
        dataIsolationNote: 'Loaded exclusively with verified Kota Division India Post records.',
      };
    }
    if (clean === 'xpeedo-logistics') {
      return {
        blueprintName: 'Xpeedo Logistics Hub Hierarchy (Shared Postal Blueprint)',
        sharesPostalBlueprint: true,
        levels: ['State / Circle (Rajasthan)', 'Zone / Region', 'Hub / Division', 'Franchise / Office / Hub', 'Route / PIN'],
        defaultStateScope: 'Rajasthan State Default (Scalable Pan-India)',
        dataIsolationNote:
          'Shares the India Post office-level hierarchy blueprint with strict zero-leakage isolation (zero India Post records).',
      };
    }
    return {
      blueprintName: 'Brand Territory & Business Category Hierarchy',
      sharesPostalBlueprint: false,
      levels: ['State (Rajasthan Default)', 'Cluster / City', 'Showroom / Store / Hub', 'Category / Route / PIN'],
      defaultStateScope: 'Rajasthan Default (Scalable Pan-India)',
      dataIsolationNote: 'Isolated brand workspace ready for clean brand & B2B data entry.',
    };
  }

  // --------------------------------------------------------------------------
  // SCOPED BRAND 4-BUCKET FOLLOW-UPS & VERIFICATION INQUIRIES
  // --------------------------------------------------------------------------

  private isMemberNonTerritoryAgent(session: PartnerAuthSession): {
    isAgent: boolean;
    assignedCategories: string[];
  } {
    const member = readJson<PartnerTeamMember[]>(TEAM_KEY, []).find(
      (m) => m.id === session.memberId && m.partnerId === session.partnerId
    );
    return {
      isAgent: Boolean(member?.isNonTerritoryAgent),
      assignedCategories: member?.assignedCategories || [],
    };
  }

  public getScopedBrandFollowUps(session: PartnerAuthSession): BrandFollowUpTask[] {
    const all = readJson<BrandFollowUpTask[]>(FOLLOWUPS_KEY, []).filter(
      (f) => f.partnerId === session.partnerId
    );
    const agentInfo = this.isMemberNonTerritoryAgent(session);
    if (!agentInfo.isAgent) return all;
    const cats = agentInfo.assignedCategories.map((c) => c.trim().toLowerCase()).filter(Boolean);
    return all.filter((f) => {
      const owns = f.createdByMemberId === session.memberId || f.assignedMemberId === session.memberId;
      if (!owns) return false;
      if (cats.length > 0 && f.category) {
        const fCat = f.category.trim().toLowerCase();
        return cats.some((c) => fCat.includes(c) || c.includes(fCat));
      }
      return true;
    });
  }

  public createBrandFollowUp(
    session: PartnerAuthSession,
    payload: {
      customerName: string;
      customerPhone: string;
      propertyId?: string;
      propertyCode?: string;
      category?: string;
      priority: 'Normal' | 'High' | 'Urgent';
      nextAction: string;
      dueDate: string;
      assignedMemberId?: string;
      assignedMemberName?: string;
      initialNote?: string;
    }
  ): BrandFollowUpTask {
    const now = new Date().toISOString();
    const task: BrandFollowUpTask = {
      id: generateId('BFU'),
      partnerId: session.partnerId,
      brandId: session.brandId,
      customerName: sanitizeUserInput(payload.customerName, 80),
      customerPhone: payload.customerPhone.replace(/\D/g, '').slice(-10),
      propertyId: payload.propertyId,
      propertyCode: payload.propertyCode,
      category: payload.category || 'General',
      priority: payload.priority || 'Normal',
      nextAction: sanitizeUserInput(payload.nextAction, 160),
      dueDate: payload.dueDate,
      status: 'Pending',
      assignedMemberId: payload.assignedMemberId || session.memberId,
      assignedMemberName: payload.assignedMemberName || session.memberName,
      createdByMemberId: session.memberId,
      timelineNotes: payload.initialNote?.trim()
        ? [{ timestamp: now, author: session.memberName, note: sanitizeUserInput(payload.initialNote, 300) }]
        : [],
      createdAt: now,
      updatedAt: now,
    };
    writeJson(FOLLOWUPS_KEY, [task, ...readJson<BrandFollowUpTask[]>(FOLLOWUPS_KEY, [])]);
    this.notify();
    return task;
  }

  public updateBrandFollowUpStatus(
    session: PartnerAuthSession,
    followUpId: string,
    status: 'Pending' | 'Completed',
    noteText?: string
  ): BrandFollowUpTask | null {
    const all = readJson<BrandFollowUpTask[]>(FOLLOWUPS_KEY, []);
    const target = all.find((f) => f.id === followUpId && f.partnerId === session.partnerId);
    if (!target) return null;
    const now = new Date().toISOString();
    const notes = [...(target.timelineNotes || [])];
    if (noteText?.trim()) {
      notes.unshift({ timestamp: now, author: session.memberName, note: sanitizeUserInput(noteText, 300) });
    }
    const updated: BrandFollowUpTask = {
      ...target,
      status,
      timelineNotes: notes,
      updatedAt: now,
    };
    writeJson(
      FOLLOWUPS_KEY,
      all.map((f) => (f.id === followUpId ? updated : f))
    );
    this.notify();
    return updated;
  }

  public getScopedVerifications(session: PartnerAuthSession): BrandVerificationInquiry[] {
    const all = readJson<BrandVerificationInquiry[]>(VERIFICATIONS_KEY, []).filter(
      (v) => v.partnerId === session.partnerId
    );
    const agentInfo = this.isMemberNonTerritoryAgent(session);
    if (!agentInfo.isAgent) return all;
    const cats = agentInfo.assignedCategories.map((c) => c.trim().toLowerCase()).filter(Boolean);
    return all.filter((v) => {
      const owns = v.createdByMemberId === session.memberId || v.assignedMemberId === session.memberId;
      if (!owns) return false;
      if (cats.length > 0 && v.category) {
        const vCat = v.category.trim().toLowerCase();
        return cats.some((c) => vCat.includes(c) || c.includes(vCat));
      }
      return true;
    });
  }

  public createBrandVerificationInquiry(
    session: PartnerAuthSession,
    payload: {
      customerName: string;
      customerPhone: string;
      propertyId?: string;
      propertyCode?: string;
      beatOrPin: string;
      inquiryTopic: string;
      category?: string;
      details: string;
      status?: BrandVerificationInquiry['status'];
    }
  ): BrandVerificationInquiry {
    const partner = this.getPartnerById(session.partnerId);
    const now = new Date().toISOString();
    const record: BrandVerificationInquiry = {
      id: generateId('BVF'),
      partnerId: session.partnerId,
      brandId: session.brandId,
      brandName: partner?.displayName || session.partnerSlug,
      customerName: sanitizeUserInput(payload.customerName, 80),
      customerPhone: payload.customerPhone.replace(/\D/g, '').slice(-10),
      propertyId: payload.propertyId,
      propertyCode: payload.propertyCode,
      beatOrPin: payload.beatOrPin.trim() || '324009',
      inquiryTopic: sanitizeUserInput(payload.inquiryTopic, 120),
      category: payload.category || 'General',
      details: sanitizeUserInput(payload.details, 400),
      status: payload.status || 'New Inquiry',
      assignedMemberId: session.memberId,
      assignedMemberName: session.memberName,
      createdByMemberId: session.memberId,
      createdAt: now,
      updatedAt: now,
    };
    writeJson(VERIFICATIONS_KEY, [record, ...readJson<BrandVerificationInquiry[]>(VERIFICATIONS_KEY, [])]);
    this.notify();
    return record;
  }

  public updateBrandVerificationStatus(
    session: PartnerAuthSession,
    id: string,
    status: BrandVerificationInquiry['status']
  ): BrandVerificationInquiry | null {
    const all = readJson<BrandVerificationInquiry[]>(VERIFICATIONS_KEY, []);
    const target = all.find((v) => v.id === id && v.partnerId === session.partnerId);
    if (!target) return null;
    const updated: BrandVerificationInquiry = {
      ...target,
      status,
      updatedAt: new Date().toISOString(),
    };
    writeJson(
      VERIFICATIONS_KEY,
      all.map((v) => (v.id === id ? updated : v))
    );
    this.notify();
    return updated;
  }

  public buildUtf8Csv(headers: string[], rows: Array<Array<string | number | undefined>>): string {
    const escapeCell = (val: string | number | undefined) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const csvBody = [
      headers.map(escapeCell).join(','),
      ...rows.map((r) => r.map(escapeCell).join(',')),
    ].join('\n');
    return `\uFEFF${csvBody}`;
  }
}

export const partnerBrandService = new PartnerBrandService();
