import {
  ALL_BRAND_PORTAL_SUBMENUS,
  ALL_BRAND_STAFF_SECTIONS,
  XPOKART_ECOMMERCE_SUBMENUS,
  BrandMemberPermissions,
  BrandMemberRbacOverride,
  BrandOnboardingSource,
  BrandOwnerProfile,
  BrandOwnerSession,
  BrandPortalSubMenuKey,
  BrandProfileStatus,
  BrandStaffSectionKey,
  BrandTeamMemberRbacView,
  SanitizedBrandOwnerProfile,
  SectorRoutingRecordItem,
  SectorRoutingSummary,
  SectorTransferEntityType,
  LoginHierarchyDescriptor,
  BrandScopedPortalSession,
  UpsertBrandTeamMemberInput,
} from '../types/brandOwner';
import { hashPasswordSync, sanitizeUserInput, verifyPasswordSync } from '../utils/securityUtils';
import { xpeedoOpsService } from './xpeedoOpsService';
import { partnerBrandService, slugifyPartnerName } from './partnerBrandService';
import { customerService } from './customerService';
import { staffPermissionService } from './staffPermissionService';
import {
  Customer,
  DynamicOfficeRecord,
  IndiaPostDutyCategory,
  Lead,
  PartnerLifecycleStatus,
  Property,
  Staff,
  StaffProfile,
  UserRole,
} from '../types/models';
import { IndiaPostSrmTicket, OpsProject, OpsTask, WorkReport } from '../types/xpeedoOps';

const PROFILES_STORAGE_KEY = 'xpeedo_brand_owner_profiles_v1';
const SESSION_STORAGE_KEY = 'xpeedo_brand_owner_session_v1';
const ADMIN_PIN_VAULT_KEY = 'xpeedo_brand_owner_pin_vault_v1';
const MEMBER_RBAC_STORAGE_KEY = 'xpeedo_brand_member_rbac_v1';

const DEFAULT_SUBMENUS: BrandPortalSubMenuKey[] = ALL_BRAND_PORTAL_SUBMENUS.map((m) => m.key);
const ALL_STAFF_SECTION_KEYS: BrandStaffSectionKey[] = ALL_BRAND_STAFF_SECTIONS.map((s) => s.key);
const BLOCKED_TIER1_ROLES = new Set([
  'MASTER_ADMIN',
  'SUPER_ADMIN',
  'OWNER',
  'DEVELOPER',
]);

const nowIso = () => new Date().toISOString();

export function normalizeIndianMobile(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

export function generateNumericPin(length = 6): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += String(Math.floor(Math.random() * 10));
  }
  return out;
}

function mapBrandStatusToPartnerStatus(status: BrandProfileStatus): PartnerLifecycleStatus {
  if (status === 'ACTIVE') return 'Active';
  if (status === 'PENDING_APPROVAL') return 'Pending';
  return 'Suspended';
}

function genId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${rand}`;
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

function sanitizeProfile(p: BrandOwnerProfile): SanitizedBrandOwnerProfile {
  const { passwordHash: _pw, passcodeHash: _pin, ...safe } = p;
  return safe;
}

const SEEDED_BRAND_PROFILES: BrandOwnerProfile[] = [
  {
    id: 'bp-india-post',
    brandName: 'India Post',
    uniqueCode: 'BRD-INPOST-01',
    workspaceKey: 'INDIA_POST',
    partnerSlug: 'india-post',
    ownerName: 'Kota Division Postal Desk',
    ownerContactNumber: '9414000001',
    loginId: 'inpost.owner@brand.xpeedo.in',
    passwordHash: hashPasswordSync('Brand@2026'),
    passcodeHash: hashPasswordSync('324009'),
    passcodeLength: 6,
    status: 'ACTIVE',
    singleSessionOnly: true,
    activeSessionToken: null,
    activeSessionDevice: null,
    activeSessionAt: null,
    subMenuItems: [...DEFAULT_SUBMENUS],
    accentColor: '#991B1B',
    category: 'Postal, Banking & Citizen Services',
    tagline: 'Kota Division Operations & 34-Beat Network',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'bp-xpeedo-ev',
    brandName: 'Xpeedo EV',
    uniqueCode: 'BRD-XPDEV-01',
    workspaceKey: 'XPEEDO_EV',
    partnerSlug: 'xpeedo-ev',
    ownerName: 'Xpeedo EV Operations Head',
    ownerContactNumber: '9414000002',
    loginId: 'xpeedoev.owner@brand.xpeedo.in',
    passwordHash: hashPasswordSync('Brand@2026'),
    passcodeHash: hashPasswordSync('112233'),
    passcodeLength: 6,
    status: 'ACTIVE',
    singleSessionOnly: true,
    activeSessionToken: null,
    activeSessionDevice: null,
    activeSessionAt: null,
    subMenuItems: [...DEFAULT_SUBMENUS],
    accentColor: '#065F46',
    category: 'Electric Mobility & Fleet',
    tagline: 'EV Fleet Engineering, Departments & Approvals',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'bp-xpokart',
    brandName: 'Xpokart',
    uniqueCode: 'BRD-XPKRT-01',
    workspaceKey: 'XPOKART',
    partnerSlug: 'xpokart',
    ownerName: 'Xpokart Commerce Lead',
    ownerContactNumber: '9414000003',
    loginId: 'xpokart.owner@brand.xpeedo.in',
    passwordHash: hashPasswordSync('Brand@2026'),
    passcodeHash: hashPasswordSync('223344'),
    passcodeLength: 6,
    status: 'ACTIVE',
    singleSessionOnly: true,
    activeSessionToken: null,
    activeSessionDevice: null,
    activeSessionAt: null,
    subMenuItems: [...XPOKART_ECOMMERCE_SUBMENUS],
    accentColor: '#1D4ED8',
    category: 'E-Commerce Storefront & Catalog',
    tagline: 'Storefront Catalog, Cart, Checkout & Customer Orders',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'bp-drop-dash',
    brandName: 'Drop Dash',
    uniqueCode: 'BRD-DRPDSH-01',
    workspaceKey: 'DROP_DASH',
    partnerSlug: 'drop-dash',
    ownerName: 'Drop Dash Dispatch Lead',
    ownerContactNumber: '9414000004',
    loginId: 'dropdash.owner@brand.xpeedo.in',
    passwordHash: hashPasswordSync('Brand@2026'),
    passcodeHash: hashPasswordSync('334455'),
    passcodeLength: 6,
    status: 'ACTIVE',
    singleSessionOnly: true,
    activeSessionToken: null,
    activeSessionDevice: null,
    activeSessionAt: null,
    subMenuItems: [...DEFAULT_SUBMENUS],
    accentColor: '#0F172A',
    category: 'Express Parcel & Micro-Fulfillment',
    tagline: 'Last-Mile Parcel & Hyperlocal Dispatch',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'bp-shop-deck',
    brandName: 'Shop Deck',
    uniqueCode: 'BRD-SHPDCK-01',
    workspaceKey: 'SHOP_DECK',
    partnerSlug: 'shop-deck',
    ownerName: 'Shop Deck Retail Lead',
    ownerContactNumber: '9414000005',
    ownerEmail: 'shopdeck.owner@brand.xpeedo.in',
    loginId: 'shopdeck.owner@brand.xpeedo.in',
    passwordHash: hashPasswordSync('Brand@2026'),
    passcodeHash: hashPasswordSync('445566'),
    passcodeLength: 6,
    status: 'ACTIVE',
    singleSessionOnly: true,
    activeSessionToken: null,
    activeSessionDevice: null,
    activeSessionAt: null,
    subMenuItems: [...DEFAULT_SUBMENUS],
    accentColor: '#7C3AED',
    category: 'Retail Merchandising & Catalog SaaS',
    tagline: 'Storefront Merchandising & Customer CRM',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'bp-xpeedo-logistics',
    brandName: 'Xpeedo Logistics',
    uniqueCode: 'BRD-XPDLOG-01',
    workspaceKey: 'XPEEDO_LOGISTICS',
    partnerSlug: 'xpeedo-logistics',
    ownerName: 'Xpeedo Logistics Hub Lead',
    ownerContactNumber: '9414000006',
    ownerEmail: 'logistics.owner@brand.xpeedo.in',
    loginId: 'logistics.owner@brand.xpeedo.in',
    passwordHash: hashPasswordSync('Brand@2026'),
    passcodeHash: hashPasswordSync('556677'),
    passcodeLength: 6,
    status: 'ACTIVE',
    singleSessionOnly: true,
    activeSessionToken: null,
    activeSessionDevice: null,
    activeSessionAt: null,
    subMenuItems: [...DEFAULT_SUBMENUS],
    accentColor: '#0F172A',
    category: 'Hyperlocal & B2B Fulfillment',
    tagline: 'Regional Hubs, Pickup/Drop & Dispatch Network',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const SEEDED_PIN_VAULT_DEFAULTS: Record<string, string> = {
  'bp-india-post': '324009',
  'bp-xpeedo-ev': '112233',
  'bp-xpokart': '223344',
  'bp-drop-dash': '334455',
  'bp-shop-deck': '445566',
  'bp-xpeedo-logistics': '556677',
};

export type BrandLoginAuthResult =
  | { success: true; session: BrandOwnerSession }
  | {
      success: false;
      code:
        | 'VALIDATION_ERROR'
        | 'NOT_FOUND'
        | 'LOCKED'
        | 'PENDING_APPROVAL'
        | 'REJECTED'
        | 'INVALID_PASSWORD'
        | 'SINGLE_SESSION_CONFLICT';
      error: string;
      canTakeover?: boolean;
      brandName?: string;
    };

export type BrandPasscodeResult =
  | { success: true; session: BrandOwnerSession }
  | { success: false; error: string };

class BrandOwnerService {
  private profiles: BrandOwnerProfile[] = [];
  private listeners = new Set<() => void>();

  constructor() {
    this.loadProfiles();
    this.ensureSeededPinVault();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === PROFILES_STORAGE_KEY || e.key === SESSION_STORAGE_KEY) {
          this.loadProfiles();
          this.notify();
        }
      });
    }
  }

  private ensureSeededPinVault(): void {
    const vault = readJson<Record<string, string>>(ADMIN_PIN_VAULT_KEY, {});
    let changed = false;
    Object.entries(SEEDED_PIN_VAULT_DEFAULTS).forEach(([id, pin]) => {
      if (!vault[id]) {
        vault[id] = pin;
        changed = true;
      }
    });
    if (changed) {
      writeJson(ADMIN_PIN_VAULT_KEY, vault);
    }
  }

  private setAdminPinVault(profileId: string, pin: string): void {
    const vault = readJson<Record<string, string>>(ADMIN_PIN_VAULT_KEY, {});
    vault[profileId] = pin;
    writeJson(ADMIN_PIN_VAULT_KEY, vault);
  }

  private loadProfiles(): void {
    const stored = readJson<BrandOwnerProfile[]>(PROFILES_STORAGE_KEY, []);
    if (!Array.isArray(stored) || stored.length === 0) {
      this.profiles = SEEDED_BRAND_PROFILES.map((p) => ({ ...p, singleSessionOnly: true }));
      writeJson(PROFILES_STORAGE_KEY, this.profiles);
      return;
    }

    // Deduplicate by normalized workspaceKey/partnerSlug and enforce singleSessionOnly across all brands
    const seen = new Set<string>();
    const merged: BrandOwnerProfile[] = [];
    let modified = false;

    for (const raw of stored) {
      const dedupeKey = `${(raw.workspaceKey || '').trim().toUpperCase()}::${(raw.partnerSlug || '').trim().toLowerCase()}`;
      if (seen.has(dedupeKey)) {
        modified = true;
        continue;
      }
      seen.add(dedupeKey);
      const enforcedSingle = raw.singleSessionOnly !== true ? true : raw.singleSessionOnly;
      if (enforcedSingle !== raw.singleSessionOnly) {
        modified = true;
      }
      merged.push({ ...raw, singleSessionOnly: enforcedSingle });
    }

    const existingKeys = new Set(merged.map((p) => p.workspaceKey.toUpperCase()));
    SEEDED_BRAND_PROFILES.forEach((seed) => {
      if (!existingKeys.has(seed.workspaceKey.toUpperCase())) {
        merged.push({ ...seed, singleSessionOnly: true });
        modified = true;
      }
    });

    // Enforce XPOKART pure e-commerce submenus and ensure active operational brands expose CRM + Territory & Team menus
    const requiredOperationalSubmenus: BrandPortalSubMenuKey[] = [
      'PROPERTIES',
      'LEADS',
      'MASTER_SEARCH',
      'MASTER_ROLE',
      'PROMOTION_MASTER',
    ];
    for (let i = 0; i < merged.length; i++) {
      const p = merged[i];
      const isXpokartBrand =
        p.partnerSlug.toLowerCase() === 'xpokart' || p.workspaceKey.toUpperCase() === 'XPOKART';
      if (isXpokartBrand) {
        const expected = [...XPOKART_ECOMMERCE_SUBMENUS];
        const currentStr = JSON.stringify(p.subMenuItems || []);
        const expectedStr = JSON.stringify(expected);
        if (currentStr !== expectedStr) {
          merged[i] = {
            ...p,
            subMenuItems: expected,
            category: 'E-Commerce Storefront & Catalog',
            tagline: 'Storefront Catalog, Cart, Checkout & Customer Orders',
          };
          modified = true;
        }
      } else {
        const curMenus = Array.isArray(p.subMenuItems) ? [...p.subMenuItems] : [...DEFAULT_SUBMENUS];
        let added = false;
        requiredOperationalSubmenus.forEach((reqKey) => {
          if (!curMenus.includes(reqKey)) {
            curMenus.push(reqKey);
            added = true;
          }
        });
        if (added) {
          merged[i] = { ...p, subMenuItems: curMenus };
          modified = true;
        }
      }
    }

    this.profiles = merged;
    if (modified) {
      writeJson(PROFILES_STORAGE_KEY, this.profiles);
    }
    this.migrateXpokartMemberRbacToIndiaPost();
  }

  private migrateXpokartMemberRbacToIndiaPost(): void {
    try {
      const map = this.readMemberRbacMap();
      let changed = false;
      const nextMap: Record<string, BrandMemberRbacOverride> = {};
      Object.entries(map).forEach(([k, val]) => {
        if (
          k.startsWith('bp-xpokart::') ||
          val.brandProfileId === 'bp-xpokart' ||
          (val.partnerSlug || '').toLowerCase() === 'xpokart'
        ) {
          changed = true;
          const targetKey = `bp-india-post::${val.memberId}`;
          if (!map[targetKey] && !nextMap[targetKey]) {
            nextMap[targetKey] = {
              ...val,
              brandProfileId: 'bp-india-post',
              partnerSlug: 'india-post',
              updatedAt: nowIso(),
            };
          }
        } else {
          nextMap[k] = val;
        }
      });
      if (changed) {
        this.writeMemberRbacMap(nextMap);
      }
    } catch {
      // ignore storage migration errors
    }
  }

  private saveProfiles(): void {
    writeJson(PROFILES_STORAGE_KEY, this.profiles);
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  // --------------------------------------------------------------------------
  // PUBLIC & MASTER ADMIN GETTERS
  // --------------------------------------------------------------------------

  public getAllBrandProfiles(): SanitizedBrandOwnerProfile[] {
    return this.profiles.map(sanitizeProfile);
  }

  public getBrandProfileById(id: string): SanitizedBrandOwnerProfile | null {
    const found = this.profiles.find((p) => p.id === id);
    return found ? sanitizeProfile(found) : null;
  }

  public getBrandProfileBySlugOrKey(slugOrKey: string): SanitizedBrandOwnerProfile | null {
    const norm = (slugOrKey || '').trim().toLowerCase();
    if (!norm) return null;
    const found = this.profiles.find(
      (p) =>
        p.partnerSlug.toLowerCase() === norm ||
        p.workspaceKey.toLowerCase() === norm ||
        p.uniqueCode.toLowerCase() === norm ||
        p.id.toLowerCase() === norm
    );
    return found ? sanitizeProfile(found) : null;
  }

  public getBrandPublicSummary(slugOrKey: string): {
    id: string;
    brandName: string;
    uniqueCode: string;
    workspaceKey: string;
    partnerSlug: string;
    status: BrandProfileStatus;
    singleSessionOnly: boolean;
    accentColor: string;
    category: string;
    tagline?: string;
    passcodeLength: number;
  } | null {
    const found = this.getBrandProfileBySlugOrKey(slugOrKey);
    if (!found) return null;
    return {
      id: found.id,
      brandName: found.brandName,
      uniqueCode: found.uniqueCode,
      workspaceKey: found.workspaceKey,
      partnerSlug: found.partnerSlug,
      status: found.status,
      singleSessionOnly: found.singleSessionOnly,
      accentColor: found.accentColor,
      category: found.category,
      tagline: found.tagline,
      passcodeLength: found.passcodeLength,
    };
  }

  public getPendingBrandProfiles(): SanitizedBrandOwnerProfile[] {
    return this.profiles
      .filter((p) => p.status === 'PENDING_APPROVAL')
      .map(sanitizeProfile);
  }

  public getAdminPasscodePreview(id: string, isMasterAdmin: boolean): string | null {
    if (!isMasterAdmin) return null;
    const vault = readJson<Record<string, string>>(ADMIN_PIN_VAULT_KEY, {});
    return vault[id] || null;
  }

  // --------------------------------------------------------------------------
  // MASTER ADMIN CRUD FOR BRAND OWNER PROFILES, PASSWORDS & 4-6 DIGIT PASSCODES
  // --------------------------------------------------------------------------

  public createBrandProfile(
    input: {
      brandName: string;
      uniqueCode?: string;
      workspaceKey?: string;
      ownerName: string;
      ownerContactNumber: string;
      ownerEmail?: string;
      loginId: string;
      password: string;
      passcode: string;
      status?: BrandProfileStatus;
      singleSessionOnly?: boolean;
      accentColor?: string;
      category?: string;
      tagline?: string;
      pincode?: string;
      onboardingSource?: BrandOnboardingSource;
      onboardingNotes?: string;
      subMenuItems?: BrandPortalSubMenuKey[];
      skipPartnerSync?: boolean;
    },
    actorName = 'Master Admin'
  ): { success: true; profile: SanitizedBrandOwnerProfile } | { success: false; error: string } {
    const brandName = sanitizeUserInput(input.brandName, 80).trim();
    const ownerName = sanitizeUserInput(input.ownerName, 80).trim();
    const normalizedPhone = normalizeIndianMobile(input.ownerContactNumber || '');
    const ownerContactNumber = normalizedPhone || (input.ownerContactNumber || '').replace(/[^\d+\-\s]/g, '').trim();
    const ownerEmail = (input.ownerEmail || (input.loginId.includes('@') ? input.loginId : '')).trim().toLowerCase();
    const loginId = sanitizeUserInput(input.loginId, 120).trim().toLowerCase();
    const password = (input.password || '').trim();
    const passcode = (input.passcode || '').trim();

    if (!brandName || !ownerName || !loginId) {
      return { success: false, error: 'Brand Name, Owner Name, and Login ID are required.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }
    if (!/^\d{4,6}$/.test(passcode)) {
      return { success: false, error: 'Security Passcode must be strictly 4 to 6 numeric digits.' };
    }

    const baseSlug = slugifyPartnerName(brandName);
    let slug = baseSlug;
    let suffix = 2;
    while (this.profiles.some((p) => p.partnerSlug.toLowerCase() === slug.toLowerCase())) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const workspaceKey = (
      input.workspaceKey?.trim() || slug.replace(/-/g, '_')
    ).toUpperCase();
    const uniqueCode = (
      input.uniqueCode?.trim() ||
      `BRD-${workspaceKey.replace(/_/g, '').slice(0, 6)}-${(this.profiles.length + 1).toString().padStart(2, '0')}`
    ).toUpperCase();

    if (this.profiles.some((p) => p.loginId.toLowerCase() === loginId)) {
      return { success: false, error: `Login ID "${loginId}" is already assigned to another brand.` };
    }
    if (this.profiles.some((p) => p.uniqueCode.toUpperCase() === uniqueCode)) {
      return { success: false, error: `Unique Code "${uniqueCode}" already exists.` };
    }

    const now = nowIso();
    const status: BrandProfileStatus = input.status || 'ACTIVE';
    const profile: BrandOwnerProfile = {
      id: genId('BP'),
      brandName,
      uniqueCode,
      workspaceKey,
      partnerSlug: slug,
      ownerName,
      ownerContactNumber,
      ownerEmail: ownerEmail || undefined,
      loginId,
      passwordHash: hashPasswordSync(password),
      passcodeHash: hashPasswordSync(passcode),
      passcodeLength: passcode.length,
      status,
      singleSessionOnly: input.singleSessionOnly ?? true,
      activeSessionToken: null,
      activeSessionDevice: null,
      activeSessionAt: null,
      subMenuItems:
        input.subMenuItems && input.subMenuItems.length > 0
          ? [...input.subMenuItems]
          : [...DEFAULT_SUBMENUS],
      accentColor: input.accentColor || '#1D4ED8',
      category: sanitizeUserInput(input.category || 'Brand Operations Workspace', 80),
      tagline: sanitizeUserInput(input.tagline || '', 120),
      pincode: input.pincode?.trim() || '324009',
      onboardingSource: input.onboardingSource || 'ADMIN_CREATED',
      onboardingNotes: input.onboardingNotes ? sanitizeUserInput(input.onboardingNotes, 300) : undefined,
      createdAt: now,
      updatedAt: now,
    };

    this.profiles = [profile, ...this.profiles];
    this.setAdminPinVault(profile.id, passcode);
    this.saveProfiles();

    // Ensure matching WorkspaceClient in xpeedoOpsService
    xpeedoOpsService.ensureClientForWorkspace({
      workspaceKey,
      name: brandName,
      code: uniqueCode,
      industry: profile.category,
      contactName: ownerName,
      contactPhone: ownerContactNumber,
    });

    // Ensure matching PartnerAccount & PARTNER_OWNER team member in partnerBrandService
    if (!input.skipPartnerSync) {
      const existingPartner = partnerBrandService
        .getAllPartnerAccounts()
        .find((a) => a.partnerSlug.toLowerCase() === slug.toLowerCase());
      const mappedPartnerStatus = mapBrandStatusToPartnerStatus(status);
      if (!existingPartner) {
        partnerBrandService.createBrandWithOwner(
          {
            name: brandName,
            customSlug: slug,
            category: profile.category,
            tagline: profile.tagline,
            accentColor: profile.accentColor,
            ownerName,
            ownerEmail: ownerEmail || (loginId.includes('@') ? loginId : `${slug}@brand.xpeedo.in`),
            ownerPhone: ownerContactNumber,
            pincode: profile.pincode || '324009',
            ownerPasscode: password,
            status: mappedPartnerStatus,
          },
          true,
          true
        );
      } else {
        partnerBrandService.updatePartnerStatus(existingPartner.id, mappedPartnerStatus, true);
        partnerBrandService.syncOwnerCredentialsFromBrandProfile({
          partnerSlug: slug,
          ownerName,
          ownerEmail: ownerEmail || (loginId.includes('@') ? loginId : existingPartner.ownerEmail),
          ownerPhone: ownerContactNumber,
          newPassword: password,
        });
      }
    }

    xpeedoOpsService.logExternalActivity({
      actor: actorName,
      actorRole: 'OWNER_SUPER_ADMIN',
      workspaceId: workspaceKey,
      entityType: 'BrandOwnerProfile',
      entityId: profile.id,
      action: status === 'PENDING_APPROVAL' ? 'SUBMIT_BRAND_REGISTRATION' : 'CREATE_BRAND_PROFILE',
      summary: `${
        status === 'PENDING_APPROVAL' ? 'Queued pending Brand registration' : 'Created Brand Owner profile'
      } "${brandName}" (${uniqueCode}) · Login: ${loginId}`,
    });

    return { success: true, profile: sanitizeProfile(profile) };
  }

  /**
   * Auto-creates or synchronizes a BrandOwnerProfile whenever a Brand or Direct Partner
   * is created inside PartnerBrandManagementHub (partnerBrandService).
   */
  public syncFromPartnerAccount(input: {
    brandName: string;
    partnerSlug: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    rawPasscode: string;
    category: string;
    tagline?: string;
    accentColor?: string;
    pincode?: string;
    partnerStatus: PartnerLifecycleStatus;
    onboardingSource?: BrandOnboardingSource;
  }): SanitizedBrandOwnerProfile {
    const slug = (input.partnerSlug || slugifyPartnerName(input.brandName)).toLowerCase();
    const existingIdx = this.profiles.findIndex((p) => p.partnerSlug.toLowerCase() === slug);
    const mappedStatus: BrandProfileStatus =
      input.partnerStatus === 'Active'
        ? 'ACTIVE'
        : input.partnerStatus === 'Pending'
        ? 'PENDING_APPROVAL'
        : 'LOCKED';

    const cleanRaw = (input.rawPasscode || '').trim() || 'Partner@2026';
    const numericPin = /^\d{4,6}$/.test(cleanRaw) ? cleanRaw : generateNumericPin(6);
    const cleanPhone = normalizeIndianMobile(input.ownerPhone || '') || input.ownerPhone;
    const cleanEmail = (input.ownerEmail || `${slug}@brand.xpeedo.in`).trim().toLowerCase();

    if (existingIdx >= 0) {
      const existing = this.profiles[existingIdx];
      const updated: BrandOwnerProfile = {
        ...existing,
        brandName: input.brandName || existing.brandName,
        ownerName: input.ownerName || existing.ownerName,
        ownerContactNumber: cleanPhone || existing.ownerContactNumber,
        ownerEmail: cleanEmail || existing.ownerEmail,
        status: mappedStatus,
        passwordHash: hashPasswordSync(cleanRaw),
        updatedAt: nowIso(),
      };
      this.profiles[existingIdx] = updated;
      this.saveProfiles();
      return sanitizeProfile(updated);
    }

    const wsKey = slug.replace(/-/g, '_').toUpperCase();
    const res = this.createBrandProfile(
      {
        brandName: input.brandName,
        workspaceKey: wsKey,
        ownerName: input.ownerName || input.brandName,
        ownerContactNumber: cleanPhone,
        ownerEmail: cleanEmail,
        loginId: cleanEmail,
        password: cleanRaw.length >= 6 ? cleanRaw : `${cleanRaw}@2026`,
        passcode: numericPin,
        status: mappedStatus,
        singleSessionOnly: false,
        accentColor: input.accentColor || '#0F172A',
        category: input.category || 'Brand Partner',
        tagline: input.tagline,
        pincode: input.pincode || '324009',
        onboardingSource: input.onboardingSource || 'ADMIN_CREATED',
        skipPartnerSync: true,
      },
      'System Sync'
    );
    if ('profile' in res) {
      return res.profile;
    }
    return sanitizeProfile(this.profiles[0]);
  }

  public submitBrandRegistrationRequest(input: {
    brandName: string;
    ownerName: string;
    ownerContactNumber: string;
    ownerEmail: string;
    category: string;
    pincode?: string;
    password: string;
    passcode?: string;
    notes?: string;
    sourceTag?: 'B2B_FORM' | 'PARTNER_PORTAL' | 'BRAND_ONBOARDING';
  }): { success: true; profile: SanitizedBrandOwnerProfile; passcode: string } | { success: false; error: string } {
    const cleanName = sanitizeUserInput(input.brandName, 80).trim();
    const cleanOwner = sanitizeUserInput(input.ownerName, 80).trim();
    const cleanPhone = normalizeIndianMobile(input.ownerContactNumber || '');
    const cleanEmail = (input.ownerEmail || '').trim().toLowerCase();
    const cleanPass = (input.password || '').trim();
    const pin =
      input.passcode && /^\d{4,6}$/.test(input.passcode.trim())
        ? input.passcode.trim()
        : generateNumericPin(6);

    if (cleanName.length < 2 || cleanOwner.length < 2) {
      return { success: false, error: 'Brand / Business Name and Owner Name are required.' };
    }
    if (!cleanEmail && cleanPhone.length !== 10) {
      return { success: false, error: 'Provide a valid Email Address or 10-digit Mobile Number.' };
    }
    if (cleanPass.length < 6) {
      return { success: false, error: 'Account password must be at least 6 characters.' };
    }

    const loginId = cleanEmail || `${cleanPhone}@brand.xpeedo.in`;
    const duplicate = this.profiles.find(
      (p) =>
        p.loginId.toLowerCase() === loginId ||
        (cleanPhone.length === 10 && normalizeIndianMobile(p.ownerContactNumber) === cleanPhone)
    );
    if (duplicate) {
      return {
        success: false,
        error:
          duplicate.status === 'PENDING_APPROVAL'
            ? `A registration request for "${duplicate.brandName}" (${duplicate.uniqueCode}) is already awaiting Master Admin approval.`
            : `An existing brand profile ("${duplicate.brandName}") already uses this Login ID or Mobile Number.`,
      };
    }

    const created = this.createBrandProfile(
      {
        brandName: cleanName,
        ownerName: cleanOwner,
        ownerContactNumber: cleanPhone || input.ownerContactNumber,
        ownerEmail: cleanEmail || loginId,
        loginId,
        password: cleanPass,
        passcode: pin,
        status: 'PENDING_APPROVAL',
        singleSessionOnly: false,
        category: input.category || 'Partner Brand Workspace',
        pincode: input.pincode || '324009',
        onboardingSource: input.sourceTag || 'BRAND_ONBOARDING',
        onboardingNotes: input.notes,
      },
      cleanOwner
    );

    if ('error' in created) {
      return created;
    }

    const sourceTag = input.sourceTag === 'B2B_FORM' ? 'B2B_FORM' : 'PARTNER_PORTAL';
    // Capture directly into CRM Leads pipeline
    customerService.createLead({
      customerId: `CUST-BRD-${created.profile.uniqueCode}`,
      customerName: `${cleanName} (${cleanOwner})`,
      customerMobile: cleanPhone || '0000000000',
      productCode: sourceTag,
      productName: `${cleanName} · Partner Brand Onboarding`,
      requirement: sanitizeUserInput(
        input.notes || `New Brand Portal onboarding request for ${cleanName} (${input.category}).`,
        300
      ),
      source: sourceTag,
      sourceChannel: sourceTag,
      stage: 'New',
      priority: 'High',
      leadScore: 85,
      pincode: input.pincode || '324009',
      brandId: created.profile.partnerSlug,
      brandName: created.profile.brandName,
      businessCategory: input.category,
      notes: `Brand Code: ${created.profile.uniqueCode} · Status: PENDING_APPROVAL · Email: ${loginId}`,
    });

    return { success: true, profile: created.profile, passcode: pin };
  }

  public approvePendingBrandProfile(
    id: string,
    options?: {
      passcode?: string;
      singleSessionOnly?: boolean;
    },
    actorName = 'Master Admin'
  ): { success: true; profile: SanitizedBrandOwnerProfile; passcode: string } | { success: false; error: string } {
    const idx = this.profiles.findIndex((p) => p.id === id);
    if (idx < 0) return { success: false, error: 'Brand profile not found.' };

    const current = this.profiles[idx];
    let finalPin = this.getAdminPasscodePreview(id, true) || generateNumericPin(6);
    if (options?.passcode?.trim()) {
      const cleanPin = options.passcode.trim();
      if (!/^\d{4,6}$/.test(cleanPin)) {
        return { success: false, error: 'Security Passcode must be 4 to 6 numeric digits.' };
      }
      finalPin = cleanPin;
    }

    const now = nowIso();
    const updated: BrandOwnerProfile = {
      ...current,
      status: 'ACTIVE',
      passcodeHash: hashPasswordSync(finalPin),
      passcodeLength: finalPin.length,
      singleSessionOnly:
        options?.singleSessionOnly !== undefined
          ? options.singleSessionOnly
          : current.singleSessionOnly,
      rejectionReason: undefined,
      approvedAt: now,
      approvedBy: actorName,
      updatedAt: now,
    };

    this.profiles[idx] = updated;
    this.setAdminPinVault(updated.id, finalPin);
    this.saveProfiles();

    // Activate matching WorkspaceClient + PartnerAccount
    xpeedoOpsService.ensureClientForWorkspace({
      workspaceKey: updated.workspaceKey,
      name: updated.brandName,
      code: updated.uniqueCode,
      industry: updated.category,
      contactName: updated.ownerName,
      contactPhone: updated.ownerContactNumber,
    });
    const linkedPartner = partnerBrandService.getPartnerBySlug(updated.partnerSlug);
    if (linkedPartner) {
      partnerBrandService.updatePartnerStatus(linkedPartner.id, 'Active', true);
    }

    xpeedoOpsService.logExternalActivity({
      actor: actorName,
      actorRole: 'OWNER_SUPER_ADMIN',
      workspaceId: updated.workspaceKey,
      entityType: 'BrandOwnerProfile',
      entityId: updated.id,
      action: 'APPROVE_BRAND_PROFILE',
      summary: `Approved & activated Brand Login Profile "${updated.brandName}" (${updated.uniqueCode})`,
    });

    return { success: true, profile: sanitizeProfile(updated), passcode: finalPin };
  }

  public rejectPendingBrandProfile(
    id: string,
    reason = 'Declined during Master Admin verification.',
    actorName = 'Master Admin'
  ): { success: true; profile: SanitizedBrandOwnerProfile } | { success: false; error: string } {
    const idx = this.profiles.findIndex((p) => p.id === id);
    if (idx < 0) return { success: false, error: 'Brand profile not found.' };
    const current = this.profiles[idx];
    const updated: BrandOwnerProfile = {
      ...current,
      status: 'REJECTED',
      rejectionReason: sanitizeUserInput(reason, 240),
      activeSessionToken: null,
      activeSessionDevice: null,
      activeSessionAt: null,
      updatedAt: nowIso(),
    };
    this.profiles[idx] = updated;
    this.saveProfiles();

    const linkedPartner = partnerBrandService.getPartnerBySlug(updated.partnerSlug);
    if (linkedPartner) {
      partnerBrandService.updatePartnerStatus(linkedPartner.id, 'Suspended', true);
    }

    xpeedoOpsService.logExternalActivity({
      actor: actorName,
      actorRole: 'OWNER_SUPER_ADMIN',
      workspaceId: updated.workspaceKey,
      entityType: 'BrandOwnerProfile',
      entityId: updated.id,
      action: 'REJECT_BRAND_PROFILE',
      summary: `Rejected Brand Registration "${updated.brandName}" (${updated.uniqueCode}): ${updated.rejectionReason}`,
    });

    return { success: true, profile: sanitizeProfile(updated) };
  }

  public updateBrandProfile(
    id: string,
    patch: {
      brandName?: string;
      uniqueCode?: string;
      ownerName?: string;
      ownerContactNumber?: string;
      ownerEmail?: string;
      loginId?: string;
      category?: string;
      tagline?: string;
      accentColor?: string;
      subMenuItems?: BrandPortalSubMenuKey[];
    },
    actorName = 'Master Admin'
  ): { success: true; profile: SanitizedBrandOwnerProfile } | { success: false; error: string } {
    const idx = this.profiles.findIndex((p) => p.id === id);
    if (idx < 0) return { success: false, error: 'Brand profile not found.' };

    const current = this.profiles[idx];
    const nextLoginId = patch.loginId
      ? sanitizeUserInput(patch.loginId, 120).trim().toLowerCase()
      : current.loginId;
    const nextCode = patch.uniqueCode
      ? sanitizeUserInput(patch.uniqueCode, 40).trim().toUpperCase()
      : current.uniqueCode;

    if (!nextLoginId) {
      return { success: false, error: 'Login ID cannot be empty.' };
    }
    if (
      this.profiles.some(
        (p) => p.id !== id && p.loginId.toLowerCase() === nextLoginId.toLowerCase()
      )
    ) {
      return { success: false, error: `Login ID "${nextLoginId}" is already in use.` };
    }
    if (
      this.profiles.some(
        (p) => p.id !== id && p.uniqueCode.toUpperCase() === nextCode.toUpperCase()
      )
    ) {
      return { success: false, error: `Unique Code "${nextCode}" is already in use.` };
    }

    const nextPhone =
      patch.ownerContactNumber !== undefined
        ? normalizeIndianMobile(patch.ownerContactNumber) ||
          patch.ownerContactNumber.replace(/[^\d+\-\s]/g, '').trim()
        : current.ownerContactNumber;

    const nextEmail =
      patch.ownerEmail !== undefined
        ? patch.ownerEmail.trim().toLowerCase()
        : current.ownerEmail || (nextLoginId.includes('@') ? nextLoginId : undefined);

    const updated: BrandOwnerProfile = {
      ...current,
      brandName: patch.brandName
        ? sanitizeUserInput(patch.brandName, 80).trim()
        : current.brandName,
      uniqueCode: nextCode,
      ownerName: patch.ownerName
        ? sanitizeUserInput(patch.ownerName, 80).trim()
        : current.ownerName,
      ownerContactNumber: nextPhone,
      ownerEmail: nextEmail,
      loginId: nextLoginId,
      category: patch.category
        ? sanitizeUserInput(patch.category, 80).trim()
        : current.category,
      tagline:
        patch.tagline !== undefined
          ? sanitizeUserInput(patch.tagline, 120).trim()
          : current.tagline,
      accentColor: patch.accentColor || current.accentColor,
      subMenuItems:
        patch.subMenuItems && patch.subMenuItems.length > 0
          ? [...patch.subMenuItems]
          : current.subMenuItems,
      updatedAt: nowIso(),
    };

    this.profiles[idx] = updated;
    this.saveProfiles();
    this.syncActiveSessionMetadata(updated);

    partnerBrandService.syncOwnerCredentialsFromBrandProfile({
      partnerSlug: updated.partnerSlug,
      ownerName: updated.ownerName,
      ownerEmail: updated.ownerEmail || (updated.loginId.includes('@') ? updated.loginId : undefined),
      ownerPhone: updated.ownerContactNumber,
    });

    xpeedoOpsService.logExternalActivity({
      actor: actorName,
      actorRole: 'OWNER_SUPER_ADMIN',
      workspaceId: updated.workspaceKey,
      entityType: 'BrandOwnerProfile',
      entityId: updated.id,
      action: 'UPDATE_BRAND_PROFILE',
      summary: `Updated Brand Profile "${updated.brandName}" (${updated.uniqueCode})`,
    });

    return { success: true, profile: sanitizeProfile(updated) };
  }

  public resetBrandPassword(
    id: string,
    newPassword: string,
    actorName = 'Master Admin'
  ): { success: true } | { success: false; error: string } {
    const idx = this.profiles.findIndex((p) => p.id === id);
    if (idx < 0) return { success: false, error: 'Brand profile not found.' };
    const clean = (newPassword || '').trim();
    if (clean.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const target = this.profiles[idx];
    this.profiles[idx] = {
      ...target,
      passwordHash: hashPasswordSync(clean),
      updatedAt: nowIso(),
    };
    this.saveProfiles();

    partnerBrandService.syncOwnerCredentialsFromBrandProfile({
      partnerSlug: target.partnerSlug,
      newPassword: clean,
    });

    xpeedoOpsService.logExternalActivity({
      actor: actorName,
      actorRole: 'OWNER_SUPER_ADMIN',
      workspaceId: target.workspaceKey,
      entityType: 'BrandOwnerProfile',
      entityId: id,
      action: 'RESET_BRAND_PASSWORD',
      summary: `Reset login password for brand "${target.brandName}" (${target.uniqueCode})`,
    });

    return { success: true };
  }

  public resetBrandPasscode(
    id: string,
    newPasscode: string,
    actorName = 'Master Admin'
  ): { success: true } | { success: false; error: string } {
    const idx = this.profiles.findIndex((p) => p.id === id);
    if (idx < 0) return { success: false, error: 'Brand profile not found.' };
    const clean = (newPasscode || '').trim();
    if (!/^\d{4,6}$/.test(clean)) {
      return {
        success: false,
        error: 'Security Passcode must be strictly 4 to 6 numeric digits (0-9).',
      };
    }

    const target = this.profiles[idx];
    this.profiles[idx] = {
      ...target,
      passcodeHash: hashPasswordSync(clean),
      passcodeLength: clean.length,
      updatedAt: nowIso(),
    };
    this.setAdminPinVault(id, clean);
    this.saveProfiles();

    xpeedoOpsService.logExternalActivity({
      actor: actorName,
      actorRole: 'OWNER_SUPER_ADMIN',
      workspaceId: target.workspaceKey,
      entityType: 'BrandOwnerProfile',
      entityId: id,
      action: 'RESET_BRAND_PASSCODE',
      summary: `Reset ${clean.length}-digit security passcode for brand "${target.brandName}"`,
    });

    return { success: true };
  }

  public toggleBrandStatus(
    id: string,
    status: BrandProfileStatus,
    actorName = 'Master Admin',
    skipPartnerSync = false
  ): SanitizedBrandOwnerProfile | null {
    const idx = this.profiles.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    const target = this.profiles[idx];
    const shouldClearSession = status !== 'ACTIVE';
    const updated: BrandOwnerProfile = {
      ...target,
      status,
      activeSessionToken: shouldClearSession ? null : target.activeSessionToken,
      activeSessionDevice: shouldClearSession ? null : target.activeSessionDevice,
      activeSessionAt: shouldClearSession ? null : target.activeSessionAt,
      updatedAt: nowIso(),
    };
    this.profiles[idx] = updated;
    this.saveProfiles();

    const activeSess = readJson<BrandOwnerSession | null>(SESSION_STORAGE_KEY, null);
    if (shouldClearSession && activeSess?.brandProfileId === id) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }

    if (!skipPartnerSync) {
      const linkedPartner = partnerBrandService.getPartnerBySlug(updated.partnerSlug);
      if (linkedPartner) {
        partnerBrandService.updatePartnerStatus(
          linkedPartner.id,
          mapBrandStatusToPartnerStatus(status),
          true
        );
      }
    }

    xpeedoOpsService.logExternalActivity({
      actor: actorName,
      actorRole: 'OWNER_SUPER_ADMIN',
      workspaceId: updated.workspaceKey,
      entityType: 'BrandOwnerProfile',
      entityId: id,
      action: status === 'LOCKED' ? 'LOCK_BRAND_PORTAL' : 'UNLOCK_BRAND_PORTAL',
      summary: `Set "${updated.brandName}" portal status to ${status}`,
    });

    return sanitizeProfile(updated);
  }

  public toggleSingleSessionOnly(
    id: string,
    singleSessionOnly: boolean,
    actorName = 'Master Admin'
  ): SanitizedBrandOwnerProfile | null {
    const idx = this.profiles.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    const target = this.profiles[idx];
    const updated: BrandOwnerProfile = {
      ...target,
      singleSessionOnly,
      updatedAt: nowIso(),
    };
    this.profiles[idx] = updated;
    this.saveProfiles();

    xpeedoOpsService.logExternalActivity({
      actor: actorName,
      actorRole: 'OWNER_SUPER_ADMIN',
      workspaceId: updated.workspaceKey,
      entityType: 'BrandOwnerProfile',
      entityId: id,
      action: 'TOGGLE_SINGLE_SESSION',
      summary: `Set singleSessionOnly=${singleSessionOnly} for "${updated.brandName}"`,
    });

    return sanitizeProfile(updated);
  }

  public revokeActiveBrandSession(id: string, actorName = 'Master Admin'): void {
    const idx = this.profiles.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const target = this.profiles[idx];
    this.profiles[idx] = {
      ...target,
      activeSessionToken: null,
      activeSessionDevice: null,
      activeSessionAt: null,
      updatedAt: nowIso(),
    };
    this.saveProfiles();

    const activeSess = readJson<BrandOwnerSession | null>(SESSION_STORAGE_KEY, null);
    if (activeSess?.brandProfileId === id) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }

    xpeedoOpsService.logExternalActivity({
      actor: actorName,
      actorRole: 'OWNER_SUPER_ADMIN',
      workspaceId: target.workspaceKey,
      entityType: 'BrandOwnerSession',
      entityId: id,
      action: 'REVOKE_BRAND_SESSION',
      summary: `Revoked active Brand Owner session for "${target.brandName}"`,
    });
  }

  private syncActiveSessionMetadata(profile: BrandOwnerProfile): void {
    const active = readJson<BrandOwnerSession | null>(SESSION_STORAGE_KEY, null);
    if (active && active.brandProfileId === profile.id) {
      writeJson(SESSION_STORAGE_KEY, {
        ...active,
        brandName: profile.brandName,
        uniqueCode: profile.uniqueCode,
        ownerName: profile.ownerName,
        ownerContactNumber: profile.ownerContactNumber,
      });
    }
  }

  // --------------------------------------------------------------------------
  // TWO-STEP BRAND OWNER AUTHENTICATION (LOGIN ID + PASSWORD -> 4-6 DIGIT PIN)
  // --------------------------------------------------------------------------

  public findProfileByIdentifier(identifier: string): BrandOwnerProfile | undefined {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPhone = normalizeIndianMobile(identifier || '');
    if (!cleanId && !cleanPhone) return undefined;

    return this.profiles.find((p) => {
      if (
        p.loginId.toLowerCase() === cleanId ||
        (p.ownerEmail && p.ownerEmail.toLowerCase() === cleanId) ||
        p.uniqueCode.toLowerCase() === cleanId ||
        p.partnerSlug.toLowerCase() === cleanId ||
        p.workspaceKey.toLowerCase() === cleanId
      ) {
        return true;
      }
      if (cleanPhone.length === 10 && normalizeIndianMobile(p.ownerContactNumber) === cleanPhone) {
        return true;
      }
      return false;
    });
  }

  /**
   * Used by PartnerLoginPage / partnerBrandService when a Brand Owner logs into
   * /partner/login/:partnerSlug with their Brand Login ID, Mobile, Email, or Unique Code,
   * accepting either their Password or their 4-6 digit Security Passcode.
   */
  public verifyBrandOwnerForPartnerPortal(
    partnerSlug: string,
    identifier: string,
    credential: string
  ):
    | { matched: false }
    | { matched: true; ok: false; error: string }
    | { matched: true; ok: true; profile: SanitizedBrandOwnerProfile } {
    const cleanSlug = (partnerSlug || '').trim().toLowerCase();
    const profile = this.profiles.find((p) => p.partnerSlug.toLowerCase() === cleanSlug);
    if (!profile) return { matched: false };

    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPhone = normalizeIndianMobile(identifier || '');
    const idMatches =
      profile.loginId.toLowerCase() === cleanId ||
      (profile.ownerEmail && profile.ownerEmail.toLowerCase() === cleanId) ||
      profile.uniqueCode.toLowerCase() === cleanId ||
      (cleanPhone.length === 10 && normalizeIndianMobile(profile.ownerContactNumber) === cleanPhone);

    if (!idMatches) return { matched: false };

    if (profile.status === 'PENDING_APPROVAL') {
      return {
        matched: true,
        ok: false,
        error: `Registration for "${profile.brandName}" (${profile.uniqueCode}) is still PENDING_APPROVAL. Master Admin approval is required before signing in.`,
      };
    }
    if (profile.status === 'REJECTED') {
      return {
        matched: true,
        ok: false,
        error: `Registration for "${profile.brandName}" was rejected or declined by Master Admin.`,
      };
    }
    if (profile.status === 'LOCKED') {
      return {
        matched: true,
        ok: false,
        error: `Access denied: "${profile.brandName}" (${profile.uniqueCode}) is currently LOCKED by Master Admin.`,
      };
    }

    const cleanCred = (credential || '').trim();
    const matchesPassword = verifyPasswordSync(cleanCred, profile.passwordHash);
    const matchesPasscode = verifyPasswordSync(cleanCred, profile.passcodeHash);
    if (!matchesPassword && !matchesPasscode) {
      return {
        matched: true,
        ok: false,
        error: /^\d{4,6}$/.test(cleanCred)
          ? `Incorrect 4–6 digit security passcode for "${profile.brandName}". Please check your assigned PIN and retry.`
          : `Incorrect password or security passcode for "${profile.brandName}". Please verify and retry.`,
      };
    }

    return { matched: true, ok: true, profile: sanitizeProfile(profile) };
  }

  public authenticateBrandLogin(
    loginIdOrCode: string,
    passwordOrPin: string,
    forceTakeoverSession = false
  ): BrandLoginAuthResult {
    const cleanId = (loginIdOrCode || '').trim().toLowerCase();
    const cleanPhone = normalizeIndianMobile(loginIdOrCode || '');
    const cleanPass = (passwordOrPin || '').trim();

    if ((!cleanId && cleanPhone.length < 10) || !cleanPass) {
      return {
        success: false,
        code: 'VALIDATION_ERROR',
        error: 'Login ID / Mobile / Unique Code and Password are required.',
      };
    }

    let idx = this.profiles.findIndex(
      (p) =>
        p.loginId.toLowerCase() === cleanId ||
        (p.ownerEmail && p.ownerEmail.toLowerCase() === cleanId) ||
        p.uniqueCode.toLowerCase() === cleanId ||
        p.partnerSlug.toLowerCase() === cleanId ||
        p.workspaceKey.toLowerCase() === cleanId ||
        (cleanPhone.length === 10 && normalizeIndianMobile(p.ownerContactNumber) === cleanPhone)
    );

    // Fallback: match via linked PartnerAccount / PARTNER_OWNER email or phone if profile wasn't synced yet
    if (idx < 0) {
      const matchedPartner = partnerBrandService.getAllPartnerAccounts().find(
        (pa) =>
          pa.partnerSlug.toLowerCase() === cleanId ||
          pa.ownerEmail.toLowerCase() === cleanId ||
          (cleanPhone.length === 10 && normalizeIndianMobile(pa.ownerPhone) === cleanPhone)
      );
      if (matchedPartner) {
        idx = this.profiles.findIndex(
          (p) => p.partnerSlug.toLowerCase() === matchedPartner.partnerSlug.toLowerCase()
        );
      }
    }

    if (idx < 0) {
      return {
        success: false,
        code: 'NOT_FOUND',
        error: `No Brand Owner profile matches "${loginIdOrCode.trim()}". Check your Login ID, Email, Registered Mobile, or Unique Brand Code.`,
      };
    }

    const profile = this.profiles[idx];

    if (profile.status === 'PENDING_APPROVAL') {
      return {
        success: false,
        code: 'PENDING_APPROVAL',
        brandName: profile.brandName,
        error: `Registration for "${profile.brandName}" (${profile.uniqueCode}) is currently PENDING_APPROVAL. Master Admin approval is required before signing in.`,
      };
    }

    if (profile.status === 'REJECTED') {
      return {
        success: false,
        code: 'REJECTED',
        brandName: profile.brandName,
        error: `Registration for "${profile.brandName}" (${profile.uniqueCode}) was declined${
          profile.rejectionReason ? `: ${profile.rejectionReason}` : '.'
        }`,
      };
    }

    if (profile.status === 'LOCKED') {
      return {
        success: false,
        code: 'LOCKED',
        brandName: profile.brandName,
        error: `Access denied: "${profile.brandName}" (${profile.uniqueCode}) is currently LOCKED by Master Admin.`,
      };
    }

    const passwordOk = verifyPasswordSync(cleanPass, profile.passwordHash);
    // Also accept linked PartnerAccount PARTNER_OWNER passcode if set independently
    const partnerOwnerOk =
      !passwordOk &&
      partnerBrandService.verifyOwnerPasscodeFallback(profile.partnerSlug, cleanPass);

    if (!passwordOk && !partnerOwnerOk) {
      return {
        success: false,
        code: 'INVALID_PASSWORD',
        error:
          'Incorrect password for this Brand Owner account. Note: enter your account password here (the 4–6 digit security PIN is verified in Step 2).',
      };
    }

    const existingLocalSession = readJson<BrandOwnerSession | null>(SESSION_STORAGE_KEY, null);
    const holdsCurrentToken =
      existingLocalSession &&
      existingLocalSession.brandProfileId === profile.id &&
      existingLocalSession.sessionToken === profile.activeSessionToken;

    if (
      profile.singleSessionOnly &&
      profile.activeSessionToken &&
      !holdsCurrentToken &&
      !forceTakeoverSession
    ) {
      return {
        success: false,
        code: 'SINGLE_SESSION_CONFLICT',
        brandName: profile.brandName,
        canTakeover: true,
        error: `Single-Session Lock is active for "${profile.brandName}". Another browser/device session is currently signed in.`,
      };
    }

    const token = `BSESS-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;
    const now = nowIso();
    const deviceLabel =
      typeof navigator !== 'undefined' ? navigator.platform || 'Web Browser' : 'Web Browser';

    this.profiles[idx] = {
      ...profile,
      activeSessionToken: token,
      activeSessionDevice: deviceLabel,
      activeSessionAt: now,
      updatedAt: now,
    };
    this.saveProfiles();

    const session: BrandOwnerSession = {
      brandProfileId: profile.id,
      brandName: profile.brandName,
      uniqueCode: profile.uniqueCode,
      workspaceKey: profile.workspaceKey,
      partnerSlug: profile.partnerSlug,
      ownerName: profile.ownerName,
      ownerContactNumber: profile.ownerContactNumber,
      role: 'BRAND_OWNER',
      sessionToken: token,
      passcodeVerified: false,
      sensitiveUnlocked: false,
      signedInAt: now,
    };
    writeJson(SESSION_STORAGE_KEY, session);

    xpeedoOpsService.logExternalActivity({
      actor: profile.ownerName,
      actorRole: 'BRAND_OWNER',
      workspaceId: profile.workspaceKey,
      entityType: 'BrandOwnerSession',
      entityId: profile.id,
      action: 'BRAND_OWNER_STEP1_LOGIN',
      summary: `Step-1 password login verified for "${profile.brandName}" (${profile.uniqueCode}) — awaiting PIN verification`,
    });

    return { success: true, session };
  }

  public verifyBrandPasscode(brandProfileId: string, pinCode: string): BrandPasscodeResult {
    const cleanPin = (pinCode || '').trim();
    if (!/^\d{4,6}$/.test(cleanPin)) {
      return {
        success: false,
        error: 'Enter a valid 4 to 6 digit numeric security passcode.',
      };
    }

    const profile = this.profiles.find((p) => p.id === brandProfileId);
    if (!profile) {
      return { success: false, error: 'Brand profile could not be found.' };
    }
    if (profile.status === 'PENDING_APPROVAL') {
      return {
        success: false,
        error: `This brand registration (${profile.brandName}) is still PENDING_APPROVAL.`,
      };
    }
    if (profile.status === 'REJECTED') {
      return {
        success: false,
        error: `This brand registration (${profile.brandName}) was declined by Master Admin.`,
      };
    }
    if (profile.status === 'LOCKED') {
      return {
        success: false,
        error: `This brand portal (${profile.brandName}) has been LOCKED by Master Admin.`,
      };
    }

    if (!verifyPasswordSync(cleanPin, profile.passcodeHash)) {
      return {
        success: false,
        error: 'Incorrect 4–6 digit security passcode. Please verify the assigned PIN and retry.',
      };
    }

    const currentSession = readJson<BrandOwnerSession | null>(SESSION_STORAGE_KEY, null);
    if (!currentSession || currentSession.brandProfileId !== profile.id) {
      return {
        success: false,
        error: 'No active Step-1 session found. Please sign in with Login ID & Password first.',
      };
    }

    const verifiedSession: BrandOwnerSession = {
      ...currentSession,
      passcodeVerified: true,
      sensitiveUnlocked: true,
      lastVerifiedAt: nowIso(),
    };
    writeJson(SESSION_STORAGE_KEY, verifiedSession);
    this.notify();

    xpeedoOpsService.logExternalActivity({
      actor: profile.ownerName,
      actorRole: 'BRAND_OWNER',
      workspaceId: profile.workspaceKey,
      entityType: 'BrandOwnerSession',
      entityId: profile.id,
      action: 'BRAND_OWNER_PIN_UNLOCKED',
      summary: `4–6 digit security passcode verified for "${profile.brandName}" (${profile.uniqueCode})`,
    });

    return { success: true, session: verifiedSession };
  }

  public lockSensitivePortalActions(): void {
    const current = readJson<BrandOwnerSession | null>(SESSION_STORAGE_KEY, null);
    if (!current) return;
    writeJson(SESSION_STORAGE_KEY, {
      ...current,
      sensitiveUnlocked: false,
    });
    this.notify();
  }

  public getActiveBrandOwnerSessionState(): {
    session: BrandOwnerSession | null;
    invalidatedReason?: string;
  } {
    const session = readJson<BrandOwnerSession | null>(SESSION_STORAGE_KEY, null);
    if (!session) return { session: null };

    const profile = this.profiles.find((p) => p.id === session.brandProfileId);
    if (!profile) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return { session: null, invalidatedReason: 'Brand profile no longer exists.' };
    }
    if (profile.status !== 'ACTIVE') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return {
        session: null,
        invalidatedReason: `"${profile.brandName}" is currently ${profile.status}. Session ended.`,
      };
    }
    if (
      profile.singleSessionOnly &&
      profile.activeSessionToken &&
      profile.activeSessionToken !== session.sessionToken
    ) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return {
        session: null,
        invalidatedReason:
          'Session closed because Single-Session security is enabled and another login or session revocation occurred.',
      };
    }
    return { session };
  }

  public signOutBrandOwner(): void {
    const current = readJson<BrandOwnerSession | null>(SESSION_STORAGE_KEY, null);
    if (current) {
      const idx = this.profiles.findIndex((p) => p.id === current.brandProfileId);
      if (idx >= 0 && this.profiles[idx].activeSessionToken === current.sessionToken) {
        this.profiles[idx] = {
          ...this.profiles[idx],
          activeSessionToken: null,
          activeSessionDevice: null,
          activeSessionAt: null,
        };
        writeJson(PROFILES_STORAGE_KEY, this.profiles);
      }
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.notify();
  }

  // --------------------------------------------------------------------------
  // BRAND-SCOPED WORKSPACE DATA ACCESS (ZERO CROSS-BRAND LEAKAGE)
  // --------------------------------------------------------------------------

  public matchesBrandScope(
    profile: SanitizedBrandOwnerProfile,
    hints: {
      brandId?: string;
      brandName?: string;
      workspaceId?: string;
      partnerOrganization?: string;
      division?: string;
      officeType?: string;
      officeName?: string;
      pincode?: string;
    }
  ): boolean {
    const targetSlug = profile.partnerSlug.toLowerCase();
    const targetWs = profile.workspaceKey.toUpperCase();
    const targetName = profile.brandName.toLowerCase();

    const bId = (hints.brandId || '').trim().toLowerCase();
    const bName = (hints.brandName || '').trim().toLowerCase();
    const ws = (hints.workspaceId || '').trim().toUpperCase();
    const org = (hints.partnerOrganization || '').trim().toLowerCase();

    if (ws && ws === targetWs) return true;
    if (bId && (bId === targetSlug || bId === targetWs.toLowerCase())) return true;
    if (bName && bName === targetName) return true;
    if (org && org.includes(targetName)) return true;

    // Fallback for India Post Kota Division records without explicit brandId
    if (targetWs === 'INDIA_POST' && !bId && !ws) {
      const div = (hints.division || '').toLowerCase();
      const oType = (hints.officeType || '').toLowerCase();
      if (
        div.includes('kota') ||
        div.includes('baran') ||
        div.includes('jhalawar') ||
        div.includes('bundi') ||
        div.includes('tonk') ||
        ['ho', 'so', 'bo', 'h.o.', 's.o.', 'b.o.'].includes(oType)
      ) {
        return true;
      }
    }
    return false;
  }

  public getBrandScopedCustomers(profile: SanitizedBrandOwnerProfile): Customer[] {
    return customerService.getCustomers().filter((c) => {
      if (!c.brandId && !c.brandName) {
        return profile.workspaceKey === 'INDIA_POST';
      }
      return this.matchesBrandScope(profile, {
        brandId: c.brandId,
        brandName: c.brandName,
        pincode: c.pincode,
      });
    });
  }

  public getBrandScopedLeads(profile: SanitizedBrandOwnerProfile): Lead[] {
    return customerService.getLeads().filter((l) => {
      if (!l.brandId && !l.brandName) {
        return profile.workspaceKey === 'INDIA_POST';
      }
      return this.matchesBrandScope(profile, {
        brandId: l.brandId,
        brandName: l.brandName,
      });
    });
  }

  public getBrandScopedOffices(profile: SanitizedBrandOwnerProfile): DynamicOfficeRecord[] {
    const allOffices = staffPermissionService.getAutoManagedOffices();
    return allOffices.filter((o) =>
      this.matchesBrandScope(profile, {
        brandId: o.brandId,
        brandName: o.brandName,
        division: o.division,
        officeType: o.officeType,
        officeName: o.officeName,
        pincode: o.pincode,
      })
    );
  }

  public getBrandScopedStaff(profile: SanitizedBrandOwnerProfile): Staff[] {
    const allStaff = staffPermissionService.getBrandOperationalStaff();
    return allStaff.filter((s) =>
      this.matchesBrandScope(profile, {
        brandId: s.brandId,
        partnerOrganization: s.partnerOrganization,
        division: s.division,
      })
    );
  }

  public getBrandScopedOperations(profile: SanitizedBrandOwnerProfile): {
    projects: OpsProject[];
    tasks: OpsTask[];
    workReports: WorkReport[];
    srmTickets: IndiaPostSrmTicket[];
  } {
    const ws = profile.workspaceKey;
    return {
      projects: xpeedoOpsService.getProjects(ws),
      tasks: xpeedoOpsService.getTasks(ws),
      workReports: xpeedoOpsService.getWorkReports(ws),
      srmTickets: ws === 'INDIA_POST' ? xpeedoOpsService.getSrmTickets() : [],
    };
  }

  // --------------------------------------------------------------------------
  // DATABASE-TO-SECTOR ROUTING & AUTO-TRANSFER ENGINE (MASTER ADMIN)
  // --------------------------------------------------------------------------

  private normalizeBrandToWorkspaceKey(raw?: string): string {
    const clean = (raw || '').trim().toLowerCase();
    if (!clean) return '';
    const match = this.profiles.find(
      (p) =>
        p.workspaceKey.toLowerCase() === clean ||
        p.partnerSlug.toLowerCase() === clean ||
        p.brandName.toLowerCase() === clean
    );
    if (match) return match.workspaceKey;
    return '';
  }

  public classifyRecordSector(hints: {
    explicitBrandOrWs?: string;
    textBlob?: string;
    pincode?: string;
  }): { workspaceKey: string; reason: string } {
    const explicit = this.normalizeBrandToWorkspaceKey(hints.explicitBrandOrWs);
    const text = (hints.textBlob || '').toLowerCase();
    const pin = (hints.pincode || '').trim();

    if (
      text.includes('xpeedo ev') ||
      text.includes('ev_mobility') ||
      text.includes('ev mobility') ||
      text.includes('ev hub') ||
      text.includes('ev-ops') ||
      text.includes('telematics')
    ) {
      return { workspaceKey: 'XPEEDO_EV', reason: 'EV Operations / Mobility indicator' };
    }
    if (text.includes('drop dash') || text.includes('drop-dash') || text.includes('dropdash')) {
      return { workspaceKey: 'DROP_DASH', reason: 'Drop Dash parcel indicator' };
    }
    if (text.includes('shop deck') || text.includes('shop-deck') || text.includes('shopdeck')) {
      return { workspaceKey: 'SHOP_DECK', reason: 'Shop Deck retail indicator' };
    }
    if (text.includes('xpokart')) {
      return { workspaceKey: 'XPOKART', reason: 'Xpokart commerce indicator' };
    }

    if (explicit) {
      return { workspaceKey: explicit, reason: `Explicit workspace/brand assignment (${explicit})` };
    }

    if (
      text.includes('india post') ||
      text.includes('dadabari') ||
      text.includes('kota division') ||
      text.includes('post office') ||
      text.includes('s.o.') ||
      text.includes('h.o.') ||
      text.includes('b.o.') ||
      text.includes('postman') ||
      text.includes('gds') ||
      text.includes('srm') ||
      text.includes('ippb') ||
      text.includes('sukanya') ||
      text.includes('pli') ||
      text.includes('beat ') ||
      /^32[3-6]\d{3}$/.test(pin) ||
      /^304\d{3}$/.test(pin)
    ) {
      return {
        workspaceKey: 'INDIA_POST',
        reason: pin
          ? `Kota/Rajasthan Postal PIN (${pin}) & Division rules`
          : 'India Post / Dadabari / Beat / Postal scheme indicator',
      };
    }

    return { workspaceKey: 'INDIA_POST', reason: 'Default legacy Kota Division registry' };
  }

  public scanDatabaseSectorRouting(): SectorRoutingSummary {
    const records: SectorRoutingRecordItem[] = [];

    // 1. Customers
    customerService.getCustomers().forEach((c) => {
      const currentWs = this.normalizeBrandToWorkspaceKey(c.brandId || c.brandName) || 'UNASSIGNED';
      const classified = this.classifyRecordSector({
        explicitBrandOrWs: c.brandId || c.brandName,
        textBlob: `${c.brandName || ''} ${c.source || ''} ${c.notes || ''} ${c.colony || ''} ${c.subOfficeMapping || ''} ${c.beatNo || ''}`,
        pincode: c.pincode,
      });
      records.push({
        entityType: 'Customer',
        recordId: c.id,
        title: c.name,
        subtitle: `${c.colony || 'Area'} · PIN ${c.pincode || '—'} · ${c.beatNo || 'No Beat'}`,
        currentWorkspaceKey: currentWs,
        recommendedWorkspaceKey: classified.workspaceKey,
        needsTransfer: currentWs !== classified.workspaceKey,
        reason: classified.reason,
      });
    });

    // 2. Leads
    customerService.getLeads().forEach((l) => {
      const currentWs = this.normalizeBrandToWorkspaceKey(l.brandId || l.brandName) || 'UNASSIGNED';
      const classified = this.classifyRecordSector({
        explicitBrandOrWs: l.brandId || l.brandName,
        textBlob: `${l.brandName || ''} ${l.productCode} ${l.productName} ${l.postOfficeName || ''} ${l.beatNo || ''}`,
      });
      records.push({
        entityType: 'Lead',
        recordId: l.id,
        title: `${l.customerName} (${l.productName})`,
        subtitle: `${l.stage} · ${l.postOfficeName || 'Pool'}`,
        currentWorkspaceKey: currentWs,
        recommendedWorkspaceKey: classified.workspaceKey,
        needsTransfer: currentWs !== classified.workspaceKey,
        reason: classified.reason,
      });
    });

    // 3. Offices
    staffPermissionService.getAutoManagedOffices().forEach((o) => {
      const currentWs = this.normalizeBrandToWorkspaceKey(o.brandId || o.brandName) || 'UNASSIGNED';
      const classified = this.classifyRecordSector({
        explicitBrandOrWs: o.brandId || o.brandName,
        textBlob: `${o.officeName} ${o.officeType} ${o.officeVariant || ''} ${o.businessCategory || ''} ${o.division}`,
        pincode: o.pincode,
      });
      records.push({
        entityType: 'Office',
        recordId: o.id,
        title: o.officeName,
        subtitle: `${o.officeType} · PIN ${o.pincode} · ${o.division}`,
        currentWorkspaceKey: currentWs,
        recommendedWorkspaceKey: classified.workspaceKey,
        needsTransfer: currentWs !== classified.workspaceKey,
        reason: classified.reason,
      });
    });

    // 4. Operational Staff (excluding platform-wide super-admins; XPOKART staff always route to India Post)
    staffPermissionService.getBrandOperationalStaff().forEach((s) => {
      const currentWs =
        this.normalizeBrandToWorkspaceKey(s.brandId || s.partnerOrganization) || 'UNASSIGNED';
      const staffOfficeLabel =
        s.postOfficeName || s.postedOfficeName || s.subOrBranchOffice || s.subOffice || '';
      const rawBrandOrWs =
        (s.brandId || '').toLowerCase().includes('xpokart') ||
        (s.partnerOrganization || '').toLowerCase().includes('xpokart')
          ? 'INDIA_POST'
          : s.brandId || s.partnerOrganization;
      const classified = this.classifyRecordSector({
        explicitBrandOrWs: rawBrandOrWs,
        textBlob: `${s.partnerOrganization || ''} ${s.role} ${s.designation || ''} ${s.division || ''} ${staffOfficeLabel}`,
      });
      records.push({
        entityType: 'Staff',
        recordId: s.id,
        title: s.name,
        subtitle: `${s.designation || s.role} · ${staffOfficeLabel || s.division || 'Staff'}`,
        currentWorkspaceKey: currentWs,
        recommendedWorkspaceKey: classified.workspaceKey === 'XPOKART' ? 'INDIA_POST' : classified.workspaceKey,
        needsTransfer: currentWs !== (classified.workspaceKey === 'XPOKART' ? 'INDIA_POST' : classified.workspaceKey),
        reason: classified.workspaceKey === 'XPOKART' ? 'Transfer operational staff out of XPOKART E-Commerce into India Post' : classified.reason,
      });
    });

    // 5. Departments, Projects, Tasks (xpeedoOpsService)
    xpeedoOpsService.getDepartments('ALL').forEach((d) => {
      const currentWs = d.workspaceId || 'UNASSIGNED';
      const classified = this.classifyRecordSector({
        explicitBrandOrWs: d.workspaceId,
        textBlob: `${d.name} ${d.code} ${d.description}`,
      });
      records.push({
        entityType: 'Department',
        recordId: d.id,
        title: `${d.name} (${d.code})`,
        subtitle: d.headName,
        currentWorkspaceKey: currentWs,
        recommendedWorkspaceKey: classified.workspaceKey,
        needsTransfer: currentWs !== classified.workspaceKey,
        reason: classified.reason,
      });
    });

    xpeedoOpsService.getProjects('ALL').forEach((p) => {
      const currentWs = p.workspaceId || 'UNASSIGNED';
      const classified = this.classifyRecordSector({
        explicitBrandOrWs: p.workspaceId,
        textBlob: `${p.code} ${p.title} ${p.description}`,
      });
      records.push({
        entityType: 'Project',
        recordId: p.id,
        title: `${p.code}: ${p.title}`,
        subtitle: `${p.status} · Manager: ${p.managerName}`,
        currentWorkspaceKey: currentWs,
        recommendedWorkspaceKey: classified.workspaceKey,
        needsTransfer: currentWs !== classified.workspaceKey,
        reason: classified.reason,
      });
    });

    xpeedoOpsService.getTasks('ALL').forEach((t) => {
      const currentWs = t.workspaceId || 'UNASSIGNED';
      const classified = this.classifyRecordSector({
        explicitBrandOrWs: t.workspaceId,
        textBlob: `${t.code} ${t.title} ${t.description}`,
      });
      records.push({
        entityType: 'Task',
        recordId: t.id,
        title: `${t.code}: ${t.title}`,
        subtitle: `${t.status} · Assignee: ${t.assigneeName}`,
        currentWorkspaceKey: currentWs,
        recommendedWorkspaceKey: classified.workspaceKey,
        needsTransfer: currentWs !== classified.workspaceKey,
        reason: classified.reason,
      });
    });

    const byWorkspace: Record<string, number> = {};
    records.forEach((r) => {
      const key = r.currentWorkspaceKey;
      byWorkspace[key] = (byWorkspace[key] || 0) + 1;
    });

    return {
      totalScanned: records.length,
      needsTransferCount: records.filter((r) => r.needsTransfer).length,
      byWorkspace,
      records,
      scannedAt: nowIso(),
    };
  }

  public executeSectorAutoTransfer(actorName = 'Master Admin'): {
    transferredCount: number;
    details: Record<string, number>;
  } {
    const scan = this.scanDatabaseSectorRouting();
    const pending = scan.records.filter((r) => r.needsTransfer);
    const details: Record<string, number> = {};
    const custUpdates: Array<{
      entityType: 'Customer' | 'Lead';
      recordId: string;
      brandId: string;
      brandName: string;
    }> = [];

    pending.forEach((item) => {
      const targetBrand = this.getBrandProfileBySlugOrKey(item.recommendedWorkspaceKey);
      if (!targetBrand) return;

      if (item.entityType === 'Customer' || item.entityType === 'Lead') {
        custUpdates.push({
          entityType: item.entityType,
          recordId: item.recordId,
          brandId: targetBrand.partnerSlug,
          brandName: targetBrand.brandName,
        });
      } else {
        this.reassignRecordToWorkspace(
          item.entityType,
          item.recordId,
          targetBrand.workspaceKey,
          actorName,
          true
        );
      }
      details[targetBrand.workspaceKey] = (details[targetBrand.workspaceKey] || 0) + 1;
    });

    const bulkCount = customerService.bulkReassignBrand(custUpdates);
    const otherCount = pending.length - custUpdates.length;
    const transferredCount = bulkCount + Math.max(0, otherCount);

    xpeedoOpsService.logExternalActivity({
      actor: actorName,
      actorRole: 'OWNER_SUPER_ADMIN',
      workspaceId: 'ALL',
      entityType: 'SectorRouting',
      entityId: 'AUTO_TRANSFER',
      action: 'EXECUTE_SECTOR_AUTO_TRANSFER',
      summary: `Transferred ${transferredCount} record(s) to respective brand sectors`,
    });

    this.notify();
    return { transferredCount, details };
  }

  public reassignRecordToWorkspace(
    entityType: SectorTransferEntityType,
    recordId: string,
    targetWorkspaceKey: string,
    actorName = 'Master Admin',
    suppressAudit = false
  ): boolean {
    const targetBrand = this.getBrandProfileBySlugOrKey(targetWorkspaceKey);
    const brandId = targetBrand?.partnerSlug || targetWorkspaceKey.toLowerCase();
    const brandName = targetBrand?.brandName || targetWorkspaceKey;
    const wsKey = targetBrand?.workspaceKey || targetWorkspaceKey.toUpperCase();

    let ok = false;
    if (entityType === 'Customer' || entityType === 'Lead') {
      ok = customerService.reassignRecordBrand(entityType, recordId, brandId, brandName);
    } else if (entityType === 'Office') {
      const office = staffPermissionService
        .getAutoManagedOffices()
        .find((o) => o.id === recordId);
      if (office) {
        staffPermissionService.upsertCustomOffice({
          ...office,
          brandId,
          brandName,
        });
        ok = true;
      }
    } else if (entityType === 'Staff') {
      ok = staffPermissionService.reassignStaffBrand(recordId, brandId, brandName);
    } else if (
      entityType === 'Department' ||
      entityType === 'Project' ||
      entityType === 'Task'
    ) {
      ok = xpeedoOpsService.reassignEntityWorkspace(
        entityType,
        recordId,
        wsKey,
        actorName,
        'OWNER_SUPER_ADMIN'
      );
    }

    if (ok && !suppressAudit) {
      xpeedoOpsService.logExternalActivity({
        actor: actorName,
        actorRole: 'OWNER_SUPER_ADMIN',
        workspaceId: wsKey,
        entityType,
        entityId: recordId,
        action: 'MANUAL_SECTOR_REASSIGN',
        summary: `Reassigned ${entityType} (${recordId}) -> ${brandName} (${wsKey})`,
      });
    }
    this.notify();
    return ok;
  }

  // --------------------------------------------------------------------------
  // 4-TIER LOGIN HIERARCHY & STRICT BRAND-SCOPED STAFF / CUSTOMER ACCESS
  // Tier 1: MASTER_ADMIN -> Tier 2: BRAND_OWNER -> Tier 3: BRAND_STAFF -> Tier 4: BRAND_CUSTOMER
  // --------------------------------------------------------------------------

  private isPlatformTier1Profile(staff: StaffProfile): boolean {
    const roleUpper = String(staff.role || '').toUpperCase();
    if (staff.staffScopeType === 'XPOKART_PLATFORM' || staff.staffScopeType === 'XPEEDO_SERVICES') {
      return true;
    }
    return (
      roleUpper === 'MASTER_ADMIN' ||
      roleUpper === 'OWNER' ||
      roleUpper === 'DEVELOPER' ||
      roleUpper === 'SUPER_ADMIN' ||
      roleUpper === 'ADMIN'
    );
  }

  private isStaffMemberInBrand(
    profile: Pick<BrandOwnerProfile, 'partnerSlug' | 'workspaceKey' | 'brandName'>,
    staff: StaffProfile
  ): boolean {
    if (this.isPlatformTier1Profile(staff)) return false;

    const targetSlug = profile.partnerSlug.toLowerCase();
    const targetWs = profile.workspaceKey.toLowerCase();
    if (targetSlug === 'xpokart' || targetWs === 'xpokart') {
      return false;
    }
    const targetName = profile.brandName.toLowerCase();

    if (Array.isArray(staff.assignedBrands) && staff.assignedBrands.length > 0) {
      const normalizedAssigned = staff.assignedBrands.map((b) =>
        b.trim().toLowerCase().replace(/_/g, '-')
      );
      if (
        normalizedAssigned.includes(targetSlug) ||
        normalizedAssigned.includes(targetWs.replace(/_/g, '-'))
      ) {
        return true;
      }
    }

    const bId = (staff.brandId || '').trim().toLowerCase();
    const org = (staff.partnerOrganization || '').trim().toLowerCase();

    if (bId) {
      return bId === targetSlug || bId === targetWs;
    }
    if (org) {
      return org === targetName || org.includes(targetName);
    }
    return profile.workspaceKey === 'INDIA_POST' && (!staff.assignedBrands || staff.assignedBrands.length === 0);
  }

  private matchesStaffIdentifier(staff: StaffProfile, rawIdentifier: string): boolean {
    const clean = (rawIdentifier || '').trim().toLowerCase();
    const cleanPhone = normalizeIndianMobile(rawIdentifier || '');
    if (!clean && cleanPhone.length < 10) return false;

    return (
      (staff.email || '').trim().toLowerCase() === clean ||
      (staff.employeeId || '').trim().toLowerCase() === clean ||
      (staff.id || '').trim().toLowerCase() === clean ||
      (cleanPhone.length === 10 && normalizeIndianMobile(staff.contact || '') === cleanPhone)
    );
  }

  private matchesCustomerIdentifier(cust: Customer, rawIdentifier: string): boolean {
    const clean = (rawIdentifier || '').trim().toLowerCase();
    const cleanPhone = normalizeIndianMobile(rawIdentifier || '');
    if (!clean && cleanPhone.length < 10) return false;

    return (
      (cleanPhone.length === 10 && normalizeIndianMobile(cust.mobile || '') === cleanPhone) ||
      (cust.email || '').trim().toLowerCase() === clean ||
      (cust.masterId || '').trim().toLowerCase() === clean ||
      (cust.id || '').trim().toLowerCase() === clean
    );
  }

  public resolveLoginHierarchy(staffUser?: StaffProfile | null): LoginHierarchyDescriptor {
    if (staffUser && this.isPlatformTier1Profile(staffUser)) {
      return {
        tier: 'MASTER_ADMIN',
        rank: 1,
        label: 'Master Admin · Command Control',
        scopeSummary: 'Full platform governance, all brands & cross-sector controls',
        workspaceKey: 'ALL',
      };
    }

    const ownerState = this.getActiveBrandOwnerSessionState();
    if (ownerState.session && ownerState.session.passcodeVerified) {
      return {
        tier: 'BRAND_OWNER',
        rank: 2,
        label: `Brand Owner · ${ownerState.session.brandName}`,
        scopeSummary: `Single-brand owner control for ${ownerState.session.brandName}`,
        brandSlug: ownerState.session.partnerSlug,
        workspaceKey: ownerState.session.workspaceKey,
      };
    }

    const scopedState = this.getActiveBrandScopedAccessSessionState();
    if (scopedState.session) {
      if (scopedState.session.hierarchyTier === 'BRAND_STAFF') {
        return {
          tier: 'BRAND_STAFF',
          rank: 3,
          label: `Brand Staff · ${scopedState.session.brandName}`,
          scopeSummary: `Operational staff access strictly inside ${scopedState.session.brandName}`,
          brandSlug: scopedState.session.partnerSlug,
          workspaceKey: scopedState.session.workspaceKey,
        };
      }
      return {
        tier: 'BRAND_CUSTOMER',
        rank: 4,
        label: `Brand Customer · ${scopedState.session.brandName}`,
        scopeSummary: `Self-service customer account strictly inside ${scopedState.session.brandName}`,
        brandSlug: scopedState.session.partnerSlug,
        workspaceKey: scopedState.session.workspaceKey,
      };
    }

    if (staffUser) {
      const slug = (staffUser.brandId || 'india-post').toLowerCase();
      return {
        tier: 'BRAND_STAFF',
        rank: 3,
        label: `Operational Staff · ${staffUser.subOffice || staffUser.division || 'Field Beat'}`,
        scopeSummary: `Scoped operational staff access (${staffUser.beat || 'Assigned Office'})`,
        brandSlug: slug,
        workspaceKey: slug.replace(/-/g, '_').toUpperCase(),
      };
    }

    return {
      tier: 'BRAND_CUSTOMER',
      rank: 4,
      label: 'Self-Service Customer',
      scopeSummary: 'Unauthenticated or self-service portal scope',
    };
  }

  public authenticateBrandScopedStaff(
    brandSlugOrCode: string,
    identifier: string,
    credential: string
  ): { success: true; session: BrandScopedPortalSession } | { success: false; error: string } {
    const profile = this.profiles.find(
      (p) =>
        p.partnerSlug.toLowerCase() === (brandSlugOrCode || '').trim().toLowerCase() ||
        p.workspaceKey.toLowerCase() === (brandSlugOrCode || '').trim().toLowerCase() ||
        p.uniqueCode.toLowerCase() === (brandSlugOrCode || '').trim().toLowerCase()
    );

    if (!profile) {
      return { success: false, error: 'Selected brand workspace does not exist.' };
    }
    if (profile.status === 'PENDING_APPROVAL') {
      return {
        success: false,
        error: `${profile.brandName} is awaiting Master Admin activation (PENDING_APPROVAL).`,
      };
    }
    if (profile.status === 'REJECTED') {
      return {
        success: false,
        error: `${profile.brandName} onboarding request was declined and cannot accept logins.`,
      };
    }
    if (profile.status === 'LOCKED') {
      return {
        success: false,
        error: `${profile.brandName} workspace is currently LOCKED by Master Admin.`,
      };
    }

    const rawId = (identifier || '').trim();
    const rawPass = (credential || '').trim();
    if (!rawId || !rawPass) {
      return {
        success: false,
        error: 'Enter your Employee ID / Email / 10-digit Mobile and Password or Passcode.',
      };
    }

    const allStaff = staffPermissionService.getAllStaffProfiles();

    const matchedTier1 = allStaff.find(
      (s) => this.isPlatformTier1Profile(s) && this.matchesStaffIdentifier(s, rawId)
    );
    if (matchedTier1) {
      return {
        success: false,
        error:
          'Platform Master Admin accounts must sign in from Tier 1 Staff Gateway (/staff-gateway) rather than a single-brand portal.',
      };
    }

    const brandStaffMatches = allStaff.filter((s) => this.isStaffMemberInBrand(profile, s));
    const matchedStaff = brandStaffMatches.find((s) => this.matchesStaffIdentifier(s, rawId));

    if (matchedStaff) {
      if (
        matchedStaff.status === 'Inactive' ||
        matchedStaff.permissions?.approvalStatus === 'Revoked'
      ) {
        return {
          success: false,
          error: `This ${profile.brandName} staff account is Inactive or Revoked.`,
        };
      }

      const passwordOk = matchedStaff.hasCustomPassword
        ? Boolean(matchedStaff.password) && verifyPasswordSync(rawPass, matchedStaff.password)
        : rawPass === 'Post@1234' ||
          (matchedStaff.employeeId &&
            rawPass.toLowerCase() === matchedStaff.employeeId.toLowerCase()) ||
          (Boolean(matchedStaff.password) && verifyPasswordSync(rawPass, matchedStaff.password));

      if (!passwordOk) {
        return {
          success: false,
          error: `Invalid password or passcode for ${profile.brandName} staff account.`,
        };
      }

      const postCat =
        matchedStaff.postCategory ||
        staffPermissionService.deriveIndiaPostDutyCategory(
          matchedStaff.designationType || matchedStaff.designation || matchedStaff.role
        );

      const override = this.getMemberRbacOverride(profile.id, matchedStaff.id);
      const effectivePermissions = this.mergePermissionsFromStaffAndOverride(
        matchedStaff,
        override
      );

      const session: BrandScopedPortalSession = {
        sessionToken: 'BSACC-' + Math.random().toString(36).slice(2),
        hierarchyTier: 'BRAND_STAFF',
        brandProfileId: profile.id,
        brandName: profile.brandName,
        uniqueCode: profile.uniqueCode,
        partnerSlug: profile.partnerSlug,
        workspaceKey: profile.workspaceKey,
        accentColor: profile.accentColor,
        actorId: matchedStaff.id,
        actorName: matchedStaff.name,
        actorContact: matchedStaff.contact || '',
        actorEmail: matchedStaff.email,
        employeeId: matchedStaff.employeeId,
        staffRole: override?.staffRole || matchedStaff.role,
        designation:
          override?.designation ||
          matchedStaff.designationType ||
          matchedStaff.designation ||
          matchedStaff.role,
        postCategory: override?.postCategory || postCat,
        assignedOffice: override?.assignedOffice || matchedStaff.assignedOffice || matchedStaff.subOffice,
        beat: override?.beat || matchedStaff.beat,
        pincode: matchedStaff.officePincode || profile.pincode,
        permissions: effectivePermissions,
        signedInAt: nowIso(),
      };
      localStorage.setItem('xpeedo_brand_scoped_access_session_v1', JSON.stringify(session));
      this.notify();
      return { success: true, session };
    }

    const partnerRes = partnerBrandService.authenticatePartnerMember(
      profile.partnerSlug,
      rawId,
      rawPass
    );
    if ('success' in partnerRes && partnerRes.success) {
      const sess = partnerRes.session;
      if (sess.memberRole === 'PARTNER_OWNER') {
        return {
          success: false,
          error: `Brand Owner accounts must sign in through the Tier 2 Brand Owner Login (/brand-login/${profile.partnerSlug}).`,
        };
      }
      const override = this.getMemberRbacOverride(profile.id, sess.memberId);
      const defaultPerms: BrandMemberPermissions = {
        canViewAllBrandCustomers: sess.memberRole === 'STORE_MANAGER',
        canCreateCustomerOrLead: Boolean(sess.permissions?.canCreateCrm),
        canEditCustomer: sess.memberRole === 'STORE_MANAGER' || sess.memberRole === 'CRM_OPERATOR',
        canManageSrmOrTasks: sess.memberRole !== 'SUPPORT_DESK',
        canViewOpsQueue: true,
        canManageOfficesOrBeats: sess.memberRole === 'STORE_MANAGER',
        canExportReports: sess.memberRole === 'STORE_MANAGER',
        allowedSections:
          sess.memberRole === 'STORE_MANAGER'
            ? [...ALL_STAFF_SECTION_KEYS]
            : ['OVERVIEW', 'CUSTOMERS', 'LEADS', 'OPERATIONS', 'MY_PROFILE'],
      };
      const session: BrandScopedPortalSession = {
        sessionToken: 'BSACC-' + Math.random().toString(36).slice(2),
        hierarchyTier: 'BRAND_STAFF',
        brandProfileId: profile.id,
        brandName: profile.brandName,
        uniqueCode: profile.uniqueCode,
        partnerSlug: profile.partnerSlug,
        workspaceKey: profile.workspaceKey,
        accentColor: profile.accentColor,
        actorId: sess.memberId,
        actorName: sess.memberName,
        actorContact: '',
        actorEmail: '',
        staffRole: override?.staffRole || sess.memberRole,
        designation: override?.designation || sess.memberRole.replace(/_/g, ' '),
        postCategory: override?.postCategory,
        assignedOffice: override?.assignedOffice || `${profile.brandName} Desk`,
        beat: override?.beat || 'All Beats',
        pincode: profile.pincode,
        permissions: override ? override.permissions : defaultPerms,
        signedInAt: nowIso(),
      };
      localStorage.setItem('xpeedo_brand_scoped_access_session_v1', JSON.stringify(session));
      this.notify();
      return { success: true, session };
    }

    if ('error' in partnerRes && partnerRes.error) {
      return { success: false, error: partnerRes.error };
    }

    return {
      success: false,
      error: `No active staff member matching "${rawId}" is registered under ${profile.brandName}.`,
    };
  }

  public authenticateBrandScopedCustomer(
    brandSlugOrCode: string,
    identifier: string,
    verificationPinOrLast4: string
  ): { success: true; session: BrandScopedPortalSession } | { success: false; error: string } {
    const profile = this.profiles.find(
      (p) =>
        p.partnerSlug.toLowerCase() === (brandSlugOrCode || '').trim().toLowerCase() ||
        p.workspaceKey.toLowerCase() === (brandSlugOrCode || '').trim().toLowerCase() ||
        p.uniqueCode.toLowerCase() === (brandSlugOrCode || '').trim().toLowerCase()
    );

    if (!profile) {
      return { success: false, error: 'Selected brand workspace does not exist.' };
    }
    if (profile.status !== 'ACTIVE') {
      return {
        success: false,
        error: `${profile.brandName} customer portal is unavailable while workspace status is ${profile.status}.`,
      };
    }

    const rawId = (identifier || '').trim();
    const rawVerify = (verificationPinOrLast4 || '').trim();
    if (!rawId || !rawVerify) {
      return {
        success: false,
        error: 'Enter your Registered Mobile / Email / Customer ID and Last 4 Digits of Mobile or Customer ID.',
      };
    }

    const brandCustomers = this.getBrandScopedCustomers(profile);
    const matchedCustomer = brandCustomers.find((c) => this.matchesCustomerIdentifier(c, rawId));

    if (!matchedCustomer) {
      return {
        success: false,
        error: `No customer account matching "${rawId}" was found inside ${profile.brandName}.`,
      };
    }

    const normMobile = normalizeIndianMobile(matchedCustomer.mobile || '');
    const last4 = normMobile.slice(-4);
    const cleanVerifyLower = rawVerify.toLowerCase();
    const verifyMatches =
      (last4.length === 4 && rawVerify === last4) ||
      (normMobile.length === 10 && normalizeIndianMobile(rawVerify) === normMobile) ||
      (matchedCustomer.masterId && matchedCustomer.masterId.toLowerCase() === cleanVerifyLower) ||
      matchedCustomer.id.toLowerCase() === cleanVerifyLower;

    if (!verifyMatches) {
      return {
        success: false,
        error: 'Verification failed. Enter the last 4 digits of your registered mobile number or your Customer ID.',
      };
    }

    const session: BrandScopedPortalSession = {
      sessionToken: 'BCACC-' + Math.random().toString(36).slice(2),
      hierarchyTier: 'BRAND_CUSTOMER',
      brandProfileId: profile.id,
      brandName: profile.brandName,
      uniqueCode: profile.uniqueCode,
      partnerSlug: profile.partnerSlug,
      workspaceKey: profile.workspaceKey,
      accentColor: profile.accentColor,
      actorId: matchedCustomer.id,
      actorName: matchedCustomer.name,
      actorContact: normMobile || matchedCustomer.mobile || '',
      actorEmail: matchedCustomer.email,
      assignedOffice: matchedCustomer.subOfficeMapping || (matchedCustomer as any).subOffice || profile.brandName,
      beat: matchedCustomer.beatNo,
      pincode: matchedCustomer.pincode || profile.pincode,
      customerMasterId: matchedCustomer.masterId || matchedCustomer.id,
      permissions: {
        canViewAllBrandCustomers: false,
        canCreateCustomerOrLead: false,
        canEditCustomer: false,
        canManageSrmOrTasks: false,
        canViewOpsQueue: false,
        canManageOfficesOrBeats: false,
        canExportReports: false,
      },
      signedInAt: nowIso(),
    };

    localStorage.setItem('xpeedo_brand_scoped_access_session_v1', JSON.stringify(session));
    this.notify();
    return { success: true, session };
  }

  public getActiveBrandScopedAccessSessionState(expectedBrandSlug?: string): {
    session: BrandScopedPortalSession | null;
    invalidatedReason?: string;
  } {
    try {
      const raw = localStorage.getItem('xpeedo_brand_scoped_access_session_v1');
      if (!raw) return { session: null };
      const saved: BrandScopedPortalSession = JSON.parse(raw);
      if (!saved) return { session: null };

      const profile = this.profiles.find(
        (p) =>
          p.id === saved.brandProfileId ||
          p.partnerSlug.toLowerCase() === saved.partnerSlug.toLowerCase()
      );
      if (!profile || profile.status !== 'ACTIVE') {
        localStorage.removeItem('xpeedo_brand_scoped_access_session_v1');
        return {
          session: null,
          invalidatedReason: 'Your brand access session ended because the workspace is locked or unavailable.',
        };
      }

      if (
        expectedBrandSlug &&
        profile.partnerSlug.toLowerCase() !== expectedBrandSlug.trim().toLowerCase()
      ) {
        return {
          session: null,
          invalidatedReason: `Access restricted: active session is scoped to ${profile.brandName} and cannot open "${expectedBrandSlug}".`,
        };
      }

      // Live RBAC hydration & status enforcement for BRAND_STAFF
      if (saved.hierarchyTier === 'BRAND_STAFF') {
        const allStaff = staffPermissionService.getAllStaffProfiles();
        const staffRecord = allStaff.find(
          (s) => s.id === saved.actorId || (saved.actorEmail && s.email === saved.actorEmail)
        );
        const override = this.getMemberRbacOverride(profile.id, saved.actorId);

        if (staffRecord) {
          if (
            !this.isStaffMemberInBrand(profile, staffRecord) ||
            staffRecord.status === 'Inactive' ||
            staffRecord.permissions?.approvalStatus === 'Revoked' ||
            override?.status === 'Inactive'
          ) {
            localStorage.removeItem('xpeedo_brand_scoped_access_session_v1');
            return {
              session: null,
              invalidatedReason: `Your ${profile.brandName} staff access was deactivated or reassigned by the Brand Owner.`,
            };
          }
          const hydrated: BrandScopedPortalSession = {
            ...saved,
            staffRole: override?.staffRole || staffRecord.role,
            designation:
              override?.designation ||
              staffRecord.designationType ||
              staffRecord.designation ||
              staffRecord.role,
            postCategory:
              override?.postCategory ||
              staffRecord.postCategory ||
              saved.postCategory,
            assignedOffice: override?.assignedOffice || staffRecord.assignedOffice || staffRecord.subOffice,
            beat: override?.beat || staffRecord.beat,
            permissions: this.mergePermissionsFromStaffAndOverride(staffRecord, override),
          };
          return { session: hydrated };
        }

        if (override) {
          if (override.status === 'Inactive') {
            localStorage.removeItem('xpeedo_brand_scoped_access_session_v1');
            return {
              session: null,
              invalidatedReason: `Your ${profile.brandName} staff access was deactivated by the Brand Owner.`,
            };
          }
          return {
            session: {
              ...saved,
              staffRole: override.staffRole,
              designation: override.designation,
              postCategory: override.postCategory || saved.postCategory,
              assignedOffice: override.assignedOffice || saved.assignedOffice,
              beat: override.beat || saved.beat,
              permissions: override.permissions,
            },
          };
        }
      }

      return { session: saved };
    } catch {
      return { session: null };
    }
  }

  public signOutBrandScopedAccess(): void {
    localStorage.removeItem('xpeedo_brand_scoped_access_session_v1');
    this.notify();
  }

  public getScopedDashboardDataForAccessSession(session: BrandScopedPortalSession): {
    profile: SanitizedBrandOwnerProfile | null;
    customers: Customer[];
    leads: Lead[];
    properties: Property[];
    srmTickets: IndiaPostSrmTicket[];
    tasks: OpsTask[];
  } {
    const rawProfile = this.profiles.find(
      (p) =>
        p.id === session.brandProfileId ||
        p.partnerSlug.toLowerCase() === session.partnerSlug.toLowerCase()
    );
    if (!rawProfile || rawProfile.status !== 'ACTIVE') {
      return {
        profile: null,
        customers: [],
        leads: [],
        properties: [],
        srmTickets: [],
        tasks: [],
      };
    }

    const sanitized = sanitizeProfile(rawProfile);
    const brandCustomers = this.getBrandScopedCustomers(sanitized);
    const brandLeads = this.getBrandScopedLeads(sanitized);
    const allProperties = customerService.getProperties();
    const ops = this.getBrandScopedOperations(sanitized);

    if (session.hierarchyTier === 'BRAND_CUSTOMER') {
      const custMobile = normalizeIndianMobile(session.actorContact || '');
      const ownCustomer = brandCustomers.find(
        (c) =>
          c.id === session.actorId ||
          (session.customerMasterId && c.masterId === session.customerMasterId) ||
          (custMobile.length === 10 && normalizeIndianMobile(c.mobile || '') === custMobile)
      );

      const ownCustomers = ownCustomer ? [ownCustomer] : [];
      const ownLeads = brandLeads.filter(
        (l) =>
          l.customerId === session.actorId ||
          (ownCustomer && l.customerId === ownCustomer.id) ||
          (custMobile.length === 10 && normalizeIndianMobile(l.customerMobile || '') === custMobile)
      );

      const ownPropIds = new Set<string>(
        [ownCustomer?.propertyId].filter(Boolean) as string[]
      );
      const ownProperties = allProperties.filter((prop) => {
        if (ownPropIds.has(prop.id) || ownPropIds.has(prop.propertyCode)) return true;
        return false;
      });

      const ownSrm = ops.srmTickets.filter(
        (t) =>
          t.customerId === session.actorId ||
          (ownCustomer && t.customerId === ownCustomer.id) ||
          (custMobile.length === 10 && normalizeIndianMobile(t.customerMobile || '') === custMobile)
      );

      return {
        profile: sanitized,
        customers: ownCustomers,
        leads: ownLeads,
        properties: ownProperties,
        srmTickets: ownSrm,
        tasks: [],
      };
    }

    const allStaff = staffPermissionService.getAllStaffProfiles();
    const matchedStaffProfile = allStaff.find(
      (s) => s.id === session.actorId || (session.actorEmail && s.email === session.actorEmail)
    );

    const scopedCustomers = brandCustomers.filter((c) => {
      if (session.permissions?.canViewAllBrandCustomers) return true;
      if (matchedStaffProfile) {
        return staffPermissionService.matchesUserBeatScope(matchedStaffProfile, {
          beatNo: c.beatNo,
          assignedStaffId: c.assignedStaffId,
          enteredBy: c.enteredBy,
          pincode: c.pincode,
        });
      }
      if (session.beat && session.beat !== 'All Beats') {
        return (c.beatNo || '').toLowerCase() === session.beat.toLowerCase();
      }
      return true;
    });

    const visiblePropIds = new Set(
      scopedCustomers.map((c) => c.propertyId).filter(Boolean) as string[]
    );
    const scopedProperties = allProperties.filter((p) => {
      if (visiblePropIds.has(p.id) || visiblePropIds.has(p.propertyCode || '')) return true;
      if (session.permissions?.canViewAllBrandCustomers) {
        return sanitized.workspaceKey === 'INDIA_POST';
      }
      if (sanitized.workspaceKey !== 'INDIA_POST') {
        return false;
      }
      if (matchedStaffProfile) {
        return staffPermissionService.matchesUserBeatScope(matchedStaffProfile, {
          beatNo: p.beatNo,
          colonyName: p.colony || p.area,
          pincode: p.pincode,
        });
      }
      return Boolean(session.beat && p.beatNo && p.beatNo.toLowerCase() === session.beat.toLowerCase());
    });

    return {
      profile: sanitized,
      customers: scopedCustomers,
      leads: brandLeads,
      properties: scopedProperties,
      srmTickets: ops.srmTickets,
      tasks: ops.tasks,
    };
  }

  // --------------------------------------------------------------------------
  // BRAND OWNER TEAM RBAC & ROLE ASSIGNMENT ENGINE ("Kisko Kaisa Role Dena Hai")
  // Strictly isolated per brand; prevents Tier 1 escalation or cross-brand edits.
  // --------------------------------------------------------------------------

  private readMemberRbacMap(): Record<string, BrandMemberRbacOverride> {
    return readJson<Record<string, BrandMemberRbacOverride>>(MEMBER_RBAC_STORAGE_KEY, {});
  }

  private writeMemberRbacMap(map: Record<string, BrandMemberRbacOverride>): void {
    writeJson(MEMBER_RBAC_STORAGE_KEY, map);
  }

  private rbacKey(brandProfileId: string, memberId: string): string {
    return `${brandProfileId}::${memberId}`;
  }

  private getMemberRbacOverride(
    brandProfileId: string,
    memberId: string
  ): BrandMemberRbacOverride | null {
    const map = this.readMemberRbacMap();
    return map[this.rbacKey(brandProfileId, memberId)] || null;
  }

  private deriveDefaultBrandPermissions(staff: StaffProfile): BrandMemberPermissions {
    const roleUpper = String(staff.role || '').toUpperCase();
    const isSupervisor =
      staff.postCategory === 'Supervisory & Division' ||
      [
        'OFFICE_INCHARGE',
        'LAST_MILE_SUPERVISOR',
        'DIVISION_INCHARGE',
        'SUBDIVISION_INCHARGE',
        'DISTRICT_MANAGER',
        'POSTMASTER',
        'SUB_POSTMASTER',
        'ASST_POSTMASTER',
      ].includes(roleUpper) ||
      Boolean(staff.permissions?.canViewAllRecords);

    const canCreate = staff.permissions?.canCreateCustomer !== false;
    const allowedSections: BrandStaffSectionKey[] = isSupervisor
      ? [...ALL_STAFF_SECTION_KEYS]
      : ['OVERVIEW', 'CUSTOMERS', 'LEADS', 'OPERATIONS', 'PROPERTIES', 'BEATS', 'MY_PROFILE'];

    return {
      canViewAllBrandCustomers: isSupervisor,
      canCreateCustomerOrLead: canCreate,
      canEditCustomer: isSupervisor || Boolean(staff.permissions?.canEditCustomer),
      canManageSrmOrTasks: true,
      canViewOpsQueue: true,
      canManageOfficesOrBeats: isSupervisor,
      canExportReports: isSupervisor || Boolean(staff.permissions?.canExportData),
      allowedSections,
    };
  }

  private mergePermissionsFromStaffAndOverride(
    staff: StaffProfile,
    override: BrandMemberRbacOverride | null
  ): BrandMemberPermissions {
    const base = this.deriveDefaultBrandPermissions(staff);
    if (!override) return base;
    return {
      canViewAllBrandCustomers: override.permissions.canViewAllBrandCustomers,
      canCreateCustomerOrLead: override.permissions.canCreateCustomerOrLead,
      canEditCustomer: override.permissions.canEditCustomer ?? base.canEditCustomer,
      canManageSrmOrTasks: override.permissions.canManageSrmOrTasks,
      canViewOpsQueue: override.permissions.canViewOpsQueue,
      canManageOfficesOrBeats:
        override.permissions.canManageOfficesOrBeats ?? base.canManageOfficesOrBeats,
      canExportReports: override.permissions.canExportReports ?? base.canExportReports,
      allowedSections:
        override.permissions.allowedSections && override.permissions.allowedSections.length > 0
          ? override.permissions.allowedSections
          : base.allowedSections,
    };
  }

  public getBrandTeamMembersWithRbac(brandProfileIdOrSlug: string): BrandTeamMemberRbacView[] {
    const profile =
      this.profiles.find((p) => p.id === brandProfileIdOrSlug) ||
      this.profiles.find(
        (p) =>
          p.partnerSlug.toLowerCase() === (brandProfileIdOrSlug || '').toLowerCase() ||
          p.workspaceKey.toLowerCase() === (brandProfileIdOrSlug || '').toLowerCase()
      );
    if (!profile) return [];
    if (profile.partnerSlug.toLowerCase() === 'xpokart' || profile.workspaceKey === 'XPOKART') {
      return [];
    }

    const allStaff = staffPermissionService.getAllStaffProfiles();
    const scoped = allStaff.filter((s) => this.isStaffMemberInBrand(profile, s));

    return scoped.map((s) => {
      const override = this.getMemberRbacOverride(profile.id, s.id);
      const permissions = this.mergePermissionsFromStaffAndOverride(s, override);
      const promoCount = staffPermissionService.getStaffPromotionHistory(s.id).length;
      return {
        id: s.id,
        employeeId: s.employeeId,
        name: s.name,
        contact: s.contact || '',
        email: s.email || '',
        staffRole: override?.staffRole || s.role,
        designation: override?.designation || s.designationType || s.designation || s.role,
        postCategory:
          override?.postCategory ||
          s.postCategory ||
          staffPermissionService.deriveIndiaPostDutyCategory(
            s.designationType || s.designation || s.role
          ),
        assignedOffice: override?.assignedOffice || s.assignedOffice || s.subOffice,
        beat: override?.beat || s.beat,
        status: (override?.status || s.status || 'Active') as 'Active' | 'Inactive' | 'Pending',
        rolePresetKey: override?.rolePresetKey,
        permissions,
        promotionCount: promoCount,
        hasCustomPassword: Boolean(s.hasCustomPassword),
        updatedAt: override?.updatedAt || s.updatedAt,
      };
    });
  }

  public onboardBrandTeamMember(
    brandProfileId: string,
    input: UpsertBrandTeamMemberInput,
    actorName = 'Brand Owner'
  ): { success: true; member: BrandTeamMemberRbacView } | { success: false; error: string } {
    const profile = this.profiles.find((p) => p.id === brandProfileId);
    if (!profile) {
      return { success: false, error: 'Brand profile not found.' };
    }
    if (profile.partnerSlug.toLowerCase() === 'xpokart' || profile.workspaceKey === 'XPOKART') {
      return {
        success: false,
        error: 'XPOKART operates strictly as an E-Commerce Storefront without operational staff. Add staff under India Post (BRD-INPOST-01).',
      };
    }
    if (profile.status !== 'ACTIVE') {
      return { success: false, error: `Cannot add staff while ${profile.brandName} is ${profile.status}.` };
    }

    const cleanName = sanitizeUserInput(input.name || '', 80).trim();
    const cleanPhone = normalizeIndianMobile(input.contact || '');
    if (!cleanName || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return {
        success: false,
        error: 'Provide Staff Name and a valid 10-digit Indian mobile number (starts 6-9).',
      };
    }

    const requestedRoleUpper = String(input.staffRole || 'STAFF').trim().toUpperCase();
    if (BLOCKED_TIER1_ROLES.has(requestedRoleUpper)) {
      return {
        success: false,
        error: 'Hierarchy Guard: Brand Owners cannot assign Tier 1 Platform Master/Developer roles.',
      };
    }

    const cleanEmpInput = (input.employeeId || '').trim().toUpperCase();

    const safeRole: UserRole = (requestedRoleUpper || 'STAFF') as UserRole;
    const empId =
      cleanEmpInput ||
      `${profile.uniqueCode.slice(0, 6)}-${Date.now().toString().slice(-4)}`;
    const defaultOffice =
      (input.assignedOffice || '').trim() ||
      this.getBrandScopedOffices(profile)[0]?.officeName ||
      `${profile.brandName} Hub`;
    const defaultBeat = (input.beat || '').trim() || 'Beat 1';
    const cleanPin = (input.pincode || profile.pincode || '324009').trim();

    const { profile: createdStaff } = staffPermissionService.upsertStaffWithAutoOfficeAndBeat({
      employeeId: empId,
      name: cleanName,
      contact: cleanPhone,
      email: input.email?.trim().toLowerCase(),
      designationType: input.designation.trim() || safeRole,
      role: safeRole,
      circle: 'Rajasthan Circle',
      division: profile.workspaceKey === 'INDIA_POST' ? 'Kota Division' : profile.brandName,
      headOffice: profile.workspaceKey === 'INDIA_POST' ? 'Kota H.O.' : `${profile.brandName} HQ`,
      subOffice: defaultOffice,
      officePincode: cleanPin,
      officeAddress: profile.brandName,
      beat: defaultBeat,
      assignedColonies: [],
      partnerOrganization: profile.brandName,
    });

    staffPermissionService.reassignStaffBrand(
      createdStaff.email || createdStaff.id,
      profile.partnerSlug,
      profile.brandName
    );

    const postCategory =
      (input.postCategory as IndiaPostDutyCategory | undefined) ||
      staffPermissionService.deriveIndiaPostDutyCategory(input.designation || safeRole);

    const cleanPassword = (input.password || '').trim();
    if (cleanPassword.length >= 4) {
      staffPermissionService.adminUpdateStaffPassword(createdStaff.id, cleanPassword);
    }

    const normalizedSections: BrandStaffSectionKey[] =
      input.permissions.allowedSections && input.permissions.allowedSections.length > 0
        ? Array.from(new Set(input.permissions.allowedSections))
        : ['OVERVIEW', 'CUSTOMERS', 'OPERATIONS', 'MY_PROFILE'];

    const normalizedPerms: BrandMemberPermissions = {
      canViewAllBrandCustomers: Boolean(input.permissions.canViewAllBrandCustomers),
      canCreateCustomerOrLead: Boolean(input.permissions.canCreateCustomerOrLead),
      canEditCustomer: Boolean(input.permissions.canEditCustomer),
      canManageSrmOrTasks: Boolean(input.permissions.canManageSrmOrTasks),
      canViewOpsQueue: Boolean(input.permissions.canViewOpsQueue),
      canManageOfficesOrBeats: Boolean(input.permissions.canManageOfficesOrBeats),
      canExportReports: Boolean(input.permissions.canExportReports),
      allowedSections: normalizedSections,
    };

    staffPermissionService.updateIndiaPostStaffProfile(
      createdStaff.id,
      {
        status: input.status || 'Active',
        designationType: input.designation.trim() || safeRole,
        postCategory,
        subOffice: defaultOffice,
        officePincode: cleanPin,
        beat: defaultBeat,
        canViewAllRecords: normalizedPerms.canViewAllBrandCustomers,
      },
      actorName
    );

    const map = this.readMemberRbacMap();
    map[this.rbacKey(profile.id, createdStaff.id)] = {
      memberId: createdStaff.id,
      brandProfileId: profile.id,
      partnerSlug: profile.partnerSlug,
      rolePresetKey: input.rolePresetKey,
      staffRole: safeRole,
      designation: input.designation.trim() || safeRole,
      postCategory,
      assignedOffice: defaultOffice,
      beat: defaultBeat,
      status: input.status || 'Active',
      permissions: normalizedPerms,
      updatedBy: actorName,
      updatedAt: nowIso(),
    };
    this.writeMemberRbacMap(map);

    xpeedoOpsService.logExternalActivity({
      actor: actorName,
      actorRole: 'CLIENT_ADMIN',
      workspaceId: profile.workspaceKey,
      entityType: 'BrandMemberRBAC',
      entityId: createdStaff.id,
      action: 'ONBOARD_BRAND_STAFF_RBAC',
      summary: `${profile.brandName}: onboarded ${cleanName} as ${input.designation} (${safeRole}) with ${normalizedSections.length} sidenav modules`,
    });

    this.notify();
    const updated = this.getBrandTeamMembersWithRbac(profile.id).find(
      (m) => m.id === createdStaff.id
    )!;
    return { success: true, member: updated };
  }

  public updateBrandTeamMemberRbac(
    brandProfileId: string,
    memberId: string,
    patch: {
      rolePresetKey?: string;
      staffRole: string;
      designation: string;
      postCategory?: string;
      assignedOffice?: string;
      beat?: string;
      pincode?: string;
      status: 'Active' | 'Inactive';
      permissions: BrandMemberPermissions;
      newPassword?: string;
      orderRef?: string;
      notes?: string;
    },
    actorName = 'Brand Owner'
  ): { success: true; member: BrandTeamMemberRbacView } | { success: false; error: string } {
    const profile = this.profiles.find((p) => p.id === brandProfileId);
    if (!profile) {
      return { success: false, error: 'Brand profile not found.' };
    }

    const requestedRoleUpper = String(patch.staffRole || 'STAFF').trim().toUpperCase();
    if (BLOCKED_TIER1_ROLES.has(requestedRoleUpper)) {
      return {
        success: false,
        error: 'Hierarchy Guard: Tier 1 Master Admin / Developer roles cannot be assigned by a Brand Owner.',
      };
    }

    const allStaff = staffPermissionService.getAllStaffProfiles();
    const targetStaff = allStaff.find((s) => s.id === memberId);
    if (!targetStaff) {
      return { success: false, error: 'Staff member not found.' };
    }
    if (this.isPlatformTier1Profile(targetStaff) || !this.isStaffMemberInBrand(profile, targetStaff)) {
      return {
        success: false,
        error: `Cross-Brand Isolation Error: "${targetStaff.name}" does not belong to ${profile.brandName}.`,
      };
    }

    const safeRole: UserRole = (requestedRoleUpper || targetStaff.role || 'STAFF') as UserRole;
    const nextDesignation = patch.designation.trim() || safeRole;
    const nextCategory =
      (patch.postCategory as IndiaPostDutyCategory | undefined) ||
      staffPermissionService.deriveIndiaPostDutyCategory(nextDesignation);
    const nextOffice = (patch.assignedOffice || targetStaff.subOffice || `${profile.brandName} Hub`).trim();
    const nextBeat = (patch.beat || targetStaff.beat || 'Beat 1').trim();
    const nextPin = (patch.pincode || targetStaff.officePincode || profile.pincode || '324009').trim();

    const normalizedSections: BrandStaffSectionKey[] =
      patch.permissions.allowedSections && patch.permissions.allowedSections.length > 0
        ? Array.from(new Set(patch.permissions.allowedSections))
        : ['OVERVIEW', 'MY_PROFILE'];

    const normalizedPerms: BrandMemberPermissions = {
      canViewAllBrandCustomers: Boolean(patch.permissions.canViewAllBrandCustomers),
      canCreateCustomerOrLead: Boolean(patch.permissions.canCreateCustomerOrLead),
      canEditCustomer: Boolean(patch.permissions.canEditCustomer),
      canManageSrmOrTasks: Boolean(patch.permissions.canManageSrmOrTasks),
      canViewOpsQueue: Boolean(patch.permissions.canViewOpsQueue),
      canManageOfficesOrBeats: Boolean(patch.permissions.canManageOfficesOrBeats),
      canExportReports: Boolean(patch.permissions.canExportReports),
      allowedSections: normalizedSections,
    };

    const roleOrPostChanged =
      targetStaff.role !== safeRole ||
      (targetStaff.designationType || targetStaff.designation || '') !== nextDesignation ||
      (targetStaff.beat || '') !== nextBeat ||
      (targetStaff.subOffice || '') !== nextOffice;

    if (roleOrPostChanged) {
      staffPermissionService.promoteOrChangeStaffRole(
        targetStaff.id,
        {
          newDesignationType: nextDesignation,
          newRole: safeRole,
          newPostCategory: nextCategory,
          newSubOffice: nextOffice,
          newPincode: nextPin,
          newBeat: nextBeat,
          effectiveDate: new Date().toISOString().split('T')[0],
          orderRef: patch.orderRef || `RBAC-${profile.uniqueCode}`,
          notes: patch.notes || `Updated by ${actorName} inside ${profile.brandName} Brand RBAC`,
          permissionsPatch: {
            canViewAllRecords: normalizedPerms.canViewAllBrandCustomers,
            canCreateCustomer: normalizedPerms.canCreateCustomerOrLead,
            canEditCustomer: Boolean(normalizedPerms.canEditCustomer),
            canExportData: Boolean(normalizedPerms.canExportReports),
            approvalStatus: patch.status === 'Inactive' ? 'Revoked' : 'Approved',
          },
        },
        actorName
      );

      if (profile.workspaceKey === 'INDIA_POST') {
        xpeedoOpsService.syncTaskAndSrmOnStaffRoleChange({
          staffName: targetStaff.name,
          previousBeat: targetStaff.beat,
          nextBeat,
          nextOffice,
          nextPost: nextDesignation,
          nextPostCategory: nextCategory,
          actorName,
        });
      }
    }

    staffPermissionService.updateIndiaPostStaffProfile(
      targetStaff.id,
      {
        status: patch.status,
        designationType: nextDesignation,
        postCategory: nextCategory,
        subOffice: nextOffice,
        officePincode: nextPin,
        beat: nextBeat,
        canViewAllRecords: normalizedPerms.canViewAllBrandCustomers,
      },
      actorName
    );

    if (patch.newPassword && patch.newPassword.trim().length >= 4) {
      staffPermissionService.adminUpdateStaffPassword(targetStaff.id, patch.newPassword.trim());
    }

    const map = this.readMemberRbacMap();
    map[this.rbacKey(profile.id, targetStaff.id)] = {
      memberId: targetStaff.id,
      brandProfileId: profile.id,
      partnerSlug: profile.partnerSlug,
      rolePresetKey: patch.rolePresetKey,
      staffRole: safeRole,
      designation: nextDesignation,
      postCategory: nextCategory,
      assignedOffice: nextOffice,
      beat: nextBeat,
      status: patch.status,
      permissions: normalizedPerms,
      updatedBy: actorName,
      updatedAt: nowIso(),
    };
    this.writeMemberRbacMap(map);

    xpeedoOpsService.logExternalActivity({
      actor: actorName,
      actorRole: 'CLIENT_ADMIN',
      workspaceId: profile.workspaceKey,
      entityType: 'BrandMemberRBAC',
      entityId: targetStaff.id,
      action: 'UPDATE_BRAND_STAFF_RBAC',
      summary: `${profile.brandName}: ${targetStaff.name} -> ${nextDesignation} (${patch.status}) | Sections: ${normalizedSections.join(', ')}`,
    });

    this.notify();
    const updated = this.getBrandTeamMembersWithRbac(profile.id).find(
      (m) => m.id === targetStaff.id
    )!;
    return { success: true, member: updated };
  }

  public allocateExistingStaffToBrand(
    brandProfileIdOrSlug: string,
    staffIdOrEmail: string,
    actorName = 'Brand Admin'
  ): { success: boolean; error?: string } {
    const profile =
      this.profiles.find((p) => p.id === brandProfileIdOrSlug) ||
      this.profiles.find(
        (p) =>
          p.partnerSlug.toLowerCase() === brandProfileIdOrSlug.toLowerCase() ||
          p.workspaceKey.toLowerCase() === brandProfileIdOrSlug.toLowerCase()
      );
    if (!profile) {
      return { success: false, error: 'Brand profile not found.' };
    }
    if (profile.partnerSlug.toLowerCase() === 'xpokart' || profile.workspaceKey === 'XPOKART') {
      return {
        success: false,
        error: 'XPOKART operates strictly as an E-Commerce Storefront without staff allocations.',
      };
    }
    const staff = staffPermissionService
      .getAllStaffProfiles()
      .filter((s) => !staffPermissionService.isSuperAdmin(s))
      .find(
        (s) =>
          s.id.toLowerCase() === staffIdOrEmail.toLowerCase() ||
          s.email.toLowerCase() === staffIdOrEmail.toLowerCase() ||
          (s.employeeId || '').toLowerCase() === staffIdOrEmail.toLowerCase()
      );
    if (!staff) {
      return { success: false, error: 'Operational staff member not found in Master Staff roster.' };
    }

    const currentBrands = (staff.assignedBrands || [staff.brandId || 'india-post']).map((b) =>
      b.trim().toLowerCase().replace(/_/g, '-')
    );
    const nextBrands = Array.from(new Set([...currentBrands, profile.partnerSlug.toLowerCase()]));
    const res = staffPermissionService.setStaffBrandAllocations(
      staff.id,
      nextBrands,
      profile.brandName
    );
    if (!res.success) {
      return { success: false, error: res.error };
    }

    xpeedoOpsService.logExternalActivity({
      actor: actorName,
      actorRole: 'CLIENT_ADMIN',
      workspaceId: profile.workspaceKey,
      entityType: 'BrandMemberRBAC',
      entityId: staff.id,
      action: 'ALLOCATE_STAFF_TO_BRAND',
      summary: `Allocated ${staff.name} (${staff.employeeId || staff.id}) to ${profile.brandName}`,
    });
    this.notify();
    return { success: true };
  }

  public removeStaffFromBrand(
    brandProfileIdOrSlug: string,
    staffIdOrEmail: string,
    actorName = 'Brand Admin'
  ): { success: boolean; error?: string } {
    const profile =
      this.profiles.find((p) => p.id === brandProfileIdOrSlug) ||
      this.profiles.find(
        (p) =>
          p.partnerSlug.toLowerCase() === brandProfileIdOrSlug.toLowerCase() ||
          p.workspaceKey.toLowerCase() === brandProfileIdOrSlug.toLowerCase()
      );
    if (!profile) {
      return { success: false, error: 'Brand profile not found.' };
    }
    const staff = staffPermissionService
      .getAllStaffProfiles()
      .filter((s) => !staffPermissionService.isSuperAdmin(s))
      .find(
        (s) =>
          s.id.toLowerCase() === staffIdOrEmail.toLowerCase() ||
          s.email.toLowerCase() === staffIdOrEmail.toLowerCase() ||
          (s.employeeId || '').toLowerCase() === staffIdOrEmail.toLowerCase()
      );
    if (!staff) {
      return { success: false, error: 'Operational staff member not found in Master Staff roster.' };
    }

    const targetSlug = profile.partnerSlug.toLowerCase();
    const currentBrands = (staff.assignedBrands || [staff.brandId || 'india-post']).map((b) =>
      b.trim().toLowerCase().replace(/_/g, '-')
    );
    const nextBrands = currentBrands.filter((b) => b !== targetSlug);
    const res = staffPermissionService.setStaffBrandAllocations(staff.id, nextBrands);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    xpeedoOpsService.logExternalActivity({
      actor: actorName,
      actorRole: 'CLIENT_ADMIN',
      workspaceId: profile.workspaceKey,
      entityType: 'BrandMemberRBAC',
      entityId: staff.id,
      action: 'UNALLOCATE_STAFF_FROM_BRAND',
      summary: `Removed ${staff.name} (${staff.employeeId || staff.id}) from ${profile.brandName}`,
    });
    this.notify();
    return { success: true };
  }

  public upsertManagedBeatAndAudit(input: {
    officeId?: string;
    postOfficeName: string;
    officeType?: 'HO' | 'SO' | 'BO';
    division?: string;
    circle?: string;
    parentOffice?: string;
    pincode: string;
    beatNo: string;
    beatTitle?: string;
    fixedKm?: number;
    colonies?: string[];
    assignedStaffId?: string;
    actorName?: string;
  }) {
    const actor = input.actorName || 'India Post Division Admin';
    const record = staffPermissionService.upsertManagedBeat({
      ...input,
      actorName: actor,
    });

    customerService.logAudit(
      'MANAGED_BEAT_UPSERTED',
      'Beat',
      record.id,
      `Beat ${record.beatNo} (${record.postOfficeName})`,
      `PIN ${record.pincode} · Staff: ${record.assignedPostman} · Colonies (${record.colonies.length}): ${record.colonies.slice(0, 6).join(', ')}`
    );

    xpeedoOpsService.logExternalActivity({
      actor,
      actorRole: 'CLIENT_ADMIN',
      workspaceId: 'INDIA_POST',
      entityType: 'ManagedBeat',
      entityId: record.id,
      action: 'UPSERT_PINCODE_BEAT',
      summary: `PIN ${record.pincode} · ${record.postOfficeName} · Beat ${record.beatNo} assigned to ${record.assignedPostman} (${record.colonies.length} colonies)`,
    });

    this.notify();
    return record;
  }

  public reassignBeatPostmanAndAudit(input: {
    officeId: string;
    postOfficeName: string;
    officeType?: 'HO' | 'SO' | 'BO';
    pincode: string;
    beatNo: string;
    newStaffId: string;
    colonies?: string[];
    actorName?: string;
  }): {
    success: boolean;
    message?: string;
    error?: string;
  } {
    const actor = input.actorName || 'India Post Division Admin';
    const res = staffPermissionService.reassignBeatPostman({
      ...input,
      actorName: actor,
    });
    if (!res.success || !res.record || !res.newStaff) {
      return { success: false, error: res.error || 'Failed to reassign beat staff.' };
    }

    const beatLabel = `Beat ${res.record.beatNo}`;
    xpeedoOpsService.syncTaskAndSrmOnStaffRoleChange({
      staffName: res.newStaff.name,
      previousBeat: res.newStaff.beat,
      nextBeat: beatLabel,
      nextOffice: res.record.postOfficeName,
      nextPost: res.newStaff.designationType || res.newStaff.role,
      nextPostCategory: res.newStaff.postCategory || 'Delivery',
      actorName: actor,
    });

    customerService.logAudit(
      'BEAT_STAFF_REASSIGNED',
      'Beat',
      res.record.id,
      `${beatLabel} (${res.record.postOfficeName} · PIN ${res.record.pincode})`,
      `Reassigned by ${actor}: ${res.previousPostman || 'Unassigned'} -> ${res.newStaff.name} (${res.newStaff.employeeId || res.newStaff.id})`
    );

    xpeedoOpsService.logExternalActivity({
      actor,
      actorRole: 'CLIENT_ADMIN',
      workspaceId: 'INDIA_POST',
      entityType: 'ManagedBeat',
      entityId: res.record.id,
      action: 'REASSIGN_BEAT_POSTMAN',
      summary: `${res.record.postOfficeName} (${res.record.pincode}) ${beatLabel}: ${res.previousPostman} -> ${res.newStaff.name}`,
    });

    this.notify();
    return {
      success: true,
      message: `${beatLabel} (${res.record.postOfficeName}) assigned to ${res.newStaff.name} and logged in audit_logs.`,
    };
  }

  /**
   * Unified Promotion Master Orchestrator:
   * Atomically updates Master Staff profile, Master Role RBAC override, Task/SRM routing,
   * and writes complete before/after audit records to both xpeedoOpsService activity log & customerService audit_logs.
   */
  public executeTerritoryPromotionAndAudit(payload: {
    brandProfileId: string;
    staffIdOrEmail: string;
    newDesignationType: string;
    newRole: UserRole;
    newPostCategory: IndiaPostDutyCategory;
    newSubOffice: string;
    newPincode: string;
    newBeat: string;
    newAssignedBeats?: string[];
    effectiveDate: string;
    orderRef?: string;
    reason: string;
    rolePresetKey?: string;
    permissionsPatch?: Partial<BrandMemberPermissions>;
    actorName: string;
    actorRole: string;
  }): {
    success: boolean;
    message?: string;
    error?: string;
    profile?: StaffProfile;
  } {
    const profile =
      this.profiles.find((p) => p.id === payload.brandProfileId) ||
      this.profiles.find(
        (p) =>
          p.partnerSlug.toLowerCase() === payload.brandProfileId.toLowerCase() ||
          p.workspaceKey.toLowerCase() === payload.brandProfileId.toLowerCase()
      );
    if (!profile) {
      return { success: false, error: 'Brand profile not found for promotion workflow.' };
    }
    if (profile.partnerSlug.toLowerCase() === 'xpokart' || profile.workspaceKey === 'XPOKART') {
      return {
        success: false,
        error: 'Promotions are disabled in XPOKART. Execute staff promotions in India Post or Xpeedo Services.',
      };
    }

    const existingStaff = staffPermissionService.findStaffProfileByIdentifier(payload.staffIdOrEmail);
    if (!existingStaff) {
      return { success: false, error: 'Selected staff member not found in Master Staff directory.' };
    }

    const oldSnapshot = {
      role: existingStaff.role,
      designation: existingStaff.designationType || existingStaff.designation || existingStaff.role,
      postCategory: existingStaff.postCategory || 'Delivery',
      office: existingStaff.subOffice || existingStaff.assignedOffice || 'Dadabari S.O.',
      pincode: existingStaff.officePincode || '324009',
      beat: existingStaff.beat || 'Beat 1',
    };

    const promoResult = staffPermissionService.promoteOrChangeStaffRole(
      existingStaff.id,
      {
        newDesignationType: payload.newDesignationType,
        newRole: payload.newRole,
        newPostCategory: payload.newPostCategory,
        newSubOffice: payload.newSubOffice,
        newPincode: payload.newPincode,
        newBeat: payload.newBeat,
        effectiveDate: payload.effectiveDate || new Date().toISOString().split('T')[0],
        orderRef: payload.orderRef,
        notes: payload.reason,
        permissionsPatch: {
          canViewAllRecords: payload.permissionsPatch?.canViewAllBrandCustomers,
          canCreateCustomer: payload.permissionsPatch?.canCreateCustomerOrLead,
          canEditCustomer: payload.permissionsPatch?.canEditCustomer,
          canExportData: payload.permissionsPatch?.canExportReports,
        },
      },
      payload.actorName
    );

    if (!promoResult.success || !promoResult.profile) {
      return { success: false, error: promoResult.error || 'Unable to execute promotion in Master Staff.' };
    }

    const updatedStaff = promoResult.profile;
    const basePerms = this.deriveDefaultBrandPermissions(updatedStaff);
    const mergedPerms: BrandMemberPermissions = {
      ...basePerms,
      ...(payload.permissionsPatch || {}),
      allowedSections:
        payload.permissionsPatch?.allowedSections?.length
          ? Array.from(new Set(payload.permissionsPatch.allowedSections))
          : basePerms.allowedSections,
    };

    // Sync Master Role RBAC override map atomically
    const map = this.readMemberRbacMap();
    map[this.rbacKey(profile.id, updatedStaff.id)] = {
      memberId: updatedStaff.id,
      brandProfileId: profile.id,
      partnerSlug: profile.partnerSlug,
      rolePresetKey: payload.rolePresetKey,
      staffRole: payload.newRole,
      designation: payload.newDesignationType,
      postCategory: payload.newPostCategory,
      assignedOffice: payload.newSubOffice,
      beat: payload.newBeat,
      status: updatedStaff.status || 'Active',
      permissions: mergedPerms,
      updatedBy: payload.actorName,
      updatedAt: nowIso(),
    };
    this.writeMemberRbacMap(map);

    if (profile.workspaceKey === 'INDIA_POST') {
      xpeedoOpsService.syncTaskAndSrmOnStaffRoleChange({
        staffName: updatedStaff.name,
        previousBeat: oldSnapshot.beat,
        nextBeat: payload.newBeat,
        nextOffice: payload.newSubOffice,
        nextPost: payload.newDesignationType,
        nextPostCategory: payload.newPostCategory,
        actorName: payload.actorName,
      });
    }

    const diffSummary = [
      `Actor: ${payload.actorName} (${payload.actorRole})`,
      `Effective: ${payload.effectiveDate}`,
      `Role/Post: ${oldSnapshot.designation} (${oldSnapshot.role}) -> ${payload.newDesignationType} (${payload.newRole})`,
      `Office/PIN: ${oldSnapshot.office} (${oldSnapshot.pincode}) -> ${payload.newSubOffice} (${payload.newPincode})`,
      `Beat: ${oldSnapshot.beat} -> ${payload.newBeat}`,
      `Reason: ${payload.reason}`,
      payload.orderRef ? `Order Ref: ${payload.orderRef}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    xpeedoOpsService.logExternalActivity({
      actor: payload.actorName,
      actorRole: payload.actorRole,
      workspaceId: profile.workspaceKey,
      entityType: 'PromotionMaster',
      entityId: updatedStaff.id,
      action: 'PROMOTION_MASTER_EXECUTE',
      summary: `${updatedStaff.name}: ${diffSummary}`,
    });

    customerService.logAudit(
      'STAFF_PROMOTION_EXECUTED',
      'Staff',
      updatedStaff.id,
      updatedStaff.name,
      diffSummary
    );

    this.notify();
    return {
      success: true,
      profile: updatedStaff,
      message: `${updatedStaff.name} updated to ${payload.newDesignationType} (${payload.newSubOffice} · ${payload.newBeat}) and synchronized across Master Staff, Master Role & audit_logs.`,
    };
  }
}

export const brandOwnerService = new BrandOwnerService();
