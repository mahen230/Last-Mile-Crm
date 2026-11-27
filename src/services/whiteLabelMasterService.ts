import {
  BrandStorefrontConfig,
  MasterDataColumnSpec,
  MasterDataEntityKey,
  MasterDataImportExecutionResult,
  MasterDataImportPreviewRow,
  PasswordRecoveryRequest,
  ProductSaleRecord,
  PropertyPortfolioBreakdown,
  UnifiedRegistrationRequest,
  WhiteLabelDepartmentConfig,
  WhiteLabelDepartmentKey,
} from '../types/whiteLabelMaster';
import { Customer, DynamicOfficeRecord, Lead, Property, StaffProfile } from '../types/models';
import { MigrationImportLog } from '../types/xpeedoOps';
import { customerService } from './customerService';
import { staffPermissionService, DEFAULT_STAFF_FALLBACK_PASSWORD } from './staffPermissionService';
import { brandOwnerService, computeDefaultBrandPassword } from './brandOwnerService';
import { xpeedoOpsService, exportCsvWithBom } from './xpeedoOpsService';
import { partnerBrandService } from './partnerBrandService';
import { OFFICIAL_BRAND_STORES } from './brandDirectoryService';
import { staffRegistrationService } from './staffRegistrationService';
import { verifyPasswordSync } from '../utils/securityUtils';

const REG_REQ_KEY = 'xpeedo_unified_reg_requests_v1';
const PWD_REC_KEY = 'xpeedo_pwd_recovery_requests_v1';
const DEPT_CFG_KEY = 'xpeedo_whitelabel_departments_v1';
const STOREFRONT_CFG_KEY = 'xpeedo_storefront_configs_v1';
const PRODUCT_SALES_KEY = 'xpeedo_product_sales_v1';

export const MASTER_ENTITY_PRIORITY_ORDER: MasterDataEntityKey[] = [
  'Properties',
  'Customers',
  'Staff',
  'Offices',
  'Leads',
  'Product Sales',
];

export const WHITE_LABEL_DEPARTMENTS: Array<{
  key: WhiteLabelDepartmentKey;
  label: string;
  description: string;
  defaultSlaHours: number;
}> = [
  {
    key: 'CUSTOMERS',
    label: 'Customers & PAN Survey',
    description: 'Citizen/customer onboarding, PAN-formatted address normalization, and duplicate governance.',
    defaultSlaHours: 12,
  },
  {
    key: 'PROPERTIES',
    label: 'Properties & Beat Registry',
    description: 'Door-to-door property classification (Occupied, Vacant, Commercial, Mixed, Flat/Residency) with territory scoping.',
    defaultSlaHours: 24,
  },
  {
    key: 'STAFF',
    label: 'Staff & Field Allocation',
    description: 'Beat postmen, field riders, brand executives, territory assignments, and RBAC permission matrices.',
    defaultSlaHours: 8,
  },
  {
    key: 'OFFICES',
    label: 'Offices, Hubs & Pincodes',
    description: 'Head Offices, Sub Offices, Branch Offices, dark stores, and PIN-wise beat trees.',
    defaultSlaHours: 24,
  },
  {
    key: 'TASKS',
    label: 'Tasks & Last-Mile SLA',
    description: 'KYC collections, passbook/parcel deliveries, verifications, and field ticket completion.',
    defaultSlaHours: 6,
  },
  {
    key: 'FINANCE',
    label: 'Finance & Product Sales',
    description: 'COD settlements, brand invoices, storefront order reconciliation, and ledger audits.',
    defaultSlaHours: 18,
  },
  {
    key: 'WORKFLOW',
    label: 'Workflow & Automations',
    description: 'Approval queues, escalation triggers, RAG knowledge pipelines, and cross-workspace sync.',
    defaultSlaHours: 4,
  },
];

export const MASTER_ENTITY_SCHEMAS: Record<MasterDataEntityKey, MasterDataColumnSpec[]> = {
  Properties: [
    { key: 'house_no', label: 'House / Plot / Flat No.', required: true, example: 'KH-222' },
    { key: 'colony', label: 'Colony / Locality', required: true, example: 'Keshavpura' },
    { key: 'sector', label: 'Sector / Block', required: false, example: 'Sector 6' },
    { key: 'pincode', label: 'PIN Code', required: true, example: '324009' },
    { key: 'beat_no', label: 'Beat No.', required: true, example: 'Beat 2' },
    { key: 'property_type', label: 'Property Type (House/Commercial/Mixed/Flat)', required: true, example: 'House' },
    { key: 'occupancy_status', label: 'Status (Occupied/Vacant/Commercial/Mixed)', required: true, example: 'Occupied' },
    { key: 'owner_or_resident', label: 'Owner / Resident Name', required: false, example: 'Mukesh Sen' },
    { key: 'mobile', label: 'Mobile (10 digits)', required: false, example: '9414023041' },
  ],
  Customers: [
    { key: 'full_name', label: 'Customer Full Name', required: true, example: 'Mahendra Kumar' },
    { key: 'mobile', label: 'Mobile (10 digits)', required: true, example: '9829011223' },
    { key: 'house_door_flat_no', label: 'House / Door / Flat No. (PAN)', required: true, example: 'KH-222' },
    { key: 'building_premises', label: 'Building / Premises (PAN)', required: false, example: 'Shanti Bhawan' },
    { key: 'street_road_lane', label: 'Street / Road / Lane (PAN)', required: false, example: 'Main Sector Road' },
    { key: 'area_locality_post_office', label: 'Area / Locality / Post Office (PAN)', required: true, example: 'Keshavpura, Dadabari S.O.' },
    { key: 'pincode', label: 'PIN Code (PAN)', required: true, example: '324009' },
    { key: 'city_district', label: 'City / District (PAN)', required: true, example: 'Kota' },
    { key: 'state', label: 'State (PAN)', required: true, example: 'Rajasthan' },
    { key: 'beat_no', label: 'Beat No.', required: false, example: 'Beat 2' },
    { key: 'email', label: 'Email', required: false, example: 'customer@example.in' },
  ],
  Staff: [
    { key: 'employee_id', label: 'Employee ID', required: true, example: '50457421' },
    { key: 'full_name', label: 'Staff Name', required: true, example: 'Mahendra Kumar Meena' },
    { key: 'mobile', label: 'Mobile (10 digits)', required: true, example: '8769706002' },
    { key: 'email', label: 'Email', required: false, example: 'mahendra.b2@indiapost.gov.in' },
    { key: 'designation', label: 'Designation', required: true, example: 'Postman' },
    { key: 'sub_office', label: 'Post Office / Hub', required: true, example: 'Dadabari S.O.' },
    { key: 'pincode', label: 'PIN Code', required: true, example: '324009' },
    { key: 'beat_no', label: 'Assigned Beat', required: true, example: 'Beat 2' },
    { key: 'colonies', label: 'Assigned Colonies (comma sep)', required: false, example: 'Keshavpura Sector 6, Sector 7' },
  ],
  Offices: [
    { key: 'office_name', label: 'Office / Hub Name', required: true, example: 'Dadabari S.O.' },
    { key: 'office_type', label: 'Type (HO/SO/BO/Hub)', required: true, example: 'SO' },
    { key: 'pincode', label: 'PIN Code', required: true, example: '324009' },
    { key: 'division', label: 'Division', required: true, example: 'Kota Division' },
    { key: 'head_office', label: 'Parent Head Office', required: false, example: 'Kota H.O.' },
    { key: 'mapped_beats', label: 'Mapped Beats (comma sep)', required: false, example: 'Beat 1, Beat 2, Beat 3' },
    { key: 'complete_address', label: 'Complete Address', required: false, example: 'Near CAD Circle, Dadabari, Kota - 324009' },
  ],
  Leads: [
    { key: 'customer_name', label: 'Customer / Prospect Name', required: true, example: 'Smt. Prem Kanwar' },
    { key: 'customer_mobile', label: 'Mobile (10 digits)', required: true, example: '9829011223' },
    { key: 'product_name', label: 'Product / Scheme Name', required: true, example: 'Sukanya Samriddhi Yojana' },
    { key: 'product_code', label: 'Product Code', required: false, example: 'SSY' },
    { key: 'estimated_value', label: 'Estimated Value (INR)', required: false, example: '25000' },
    { key: 'stage', label: 'Lead Stage', required: true, example: 'New' },
    { key: 'beat_no', label: 'Beat No.', required: false, example: 'Beat 2' },
    { key: 'pincode', label: 'PIN Code', required: false, example: '324009' },
    { key: 'assigned_staff_name', label: 'Assigned Staff', required: false, example: 'Mahendra Kumar Meena' },
  ],
  'Product Sales': [
    { key: 'order_number', label: 'Order / Receipt No.', required: true, example: 'ORD-2026-1001' },
    { key: 'product_name', label: 'Product Name', required: true, example: 'Xpeedo EV 60V Battery Pack' },
    { key: 'sku', label: 'SKU', required: false, example: 'XEV-BAT-60V' },
    { key: 'customer_name', label: 'Customer Name', required: true, example: 'Mukesh Sen' },
    { key: 'customer_mobile', label: 'Customer Mobile', required: true, example: '9414023041' },
    { key: 'quantity', label: 'Quantity', required: true, example: '1' },
    { key: 'amount_inr', label: 'Amount (INR)', required: true, example: '18500' },
    { key: 'payment_mode', label: 'Payment Mode (COD/UPI/IPPB/Invoice)', required: false, example: 'UPI' },
    { key: 'status', label: 'Order Status (Booked/Dispatched/Delivered/Cancelled)', required: false, example: 'Delivered' },
    { key: 'pincode', label: 'PIN Code', required: false, example: '324009' },
    { key: 'beat_no', label: 'Beat No.', required: false, example: 'Beat 2' },
  ],
};

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

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function normalizePhone10(raw?: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

const SEEDED_PRODUCT_SALES: ProductSaleRecord[] = [
  {
    id: 'SALE-2026-001',
    orderNumber: 'ORD-INP-2026-01',
    brandSlug: 'india-post',
    brandName: 'India Post',
    workspaceKey: 'INDIA_POST',
    productName: 'Speed Post Parcel & Insurance Kit',
    sku: 'INP-SPD-01',
    customerName: 'Mukesh Sen',
    customerMobile: '9414023041',
    pincode: '324009',
    beatNo: 'Beat 2',
    quantity: 3,
    amountInr: 1450,
    paymentMode: 'IPPB',
    status: 'Delivered',
    soldBy: 'Mahendra Kumar Meena',
    soldAt: '2026-10-18T10:30:00.000Z',
  },
];

const DEMO_OTHER_BRAND_PRODUCT_SALES: ProductSaleRecord[] = [
  {
    id: 'SALE-2026-002',
    orderNumber: 'ORD-XEV-2026-01',
    brandSlug: 'xpeedo-ev',
    brandName: 'Xpeedo EV',
    workspaceKey: 'XPEEDO_EV',
    productName: 'Xpeedo Urban EV Pro Scooter',
    sku: 'XEV-SCOOT-PRO',
    customerName: 'Rajendra Kumar Sharma',
    customerMobile: '9414288901',
    pincode: '324009',
    beatNo: 'Beat 6',
    quantity: 1,
    amountInr: 68900,
    paymentMode: 'UPI',
    status: 'Delivered',
    soldBy: 'Xpeedo EV Sales Desk',
    soldAt: '2026-10-19T14:15:00.000Z',
  },
  {
    id: 'SALE-2026-003',
    orderNumber: 'ORD-XPK-2026-01',
    brandSlug: 'xpokart',
    brandName: 'Xpokart',
    workspaceKey: 'XPOKART',
    productName: 'Retail Kirana Bulk Essentials Box',
    sku: 'XPK-KIR-12',
    customerName: 'Nand Bihari Prajapati',
    customerMobile: '9929304352',
    pincode: '324009',
    beatNo: 'Beat 2',
    quantity: 4,
    amountInr: 6400,
    paymentMode: 'COD',
    status: 'Dispatched',
    soldBy: 'Xpokart Storefront',
    soldAt: '2026-10-20T09:40:00.000Z',
  },
  {
    id: 'SALE-2026-004',
    orderNumber: 'ORD-DRP-2026-01',
    brandSlug: 'drop-dash',
    brandName: 'Drop Dash',
    workspaceKey: 'DROP_DASH',
    productName: 'Same-Day Kota Intracity Parcel Pass (20 Drops)',
    sku: 'DRP-PASS-20',
    customerName: 'Paras Bairwa',
    customerMobile: '7976390380',
    pincode: '324009',
    beatNo: 'Beat 6',
    quantity: 2,
    amountInr: 3200,
    paymentMode: 'Invoice',
    status: 'Delivered',
    soldBy: 'Drop Dash Hub',
    soldAt: '2026-10-21T16:10:00.000Z',
  },
  {
    id: 'SALE-2026-005',
    orderNumber: 'ORD-SHP-2026-01',
    brandSlug: 'shop-deck',
    brandName: 'Shop Deck',
    workspaceKey: 'SHOP_DECK',
    productName: 'Cloud POS Billing & Thermal Receipt Bundle',
    sku: 'SHP-POS-01',
    customerName: 'Sohan Lal Nama',
    customerMobile: '8104674458',
    pincode: '324009',
    beatNo: 'Beat 2',
    quantity: 1,
    amountInr: 12499,
    paymentMode: 'UPI',
    status: 'Booked',
    soldBy: 'Shop Deck Merchant Desk',
    soldAt: '2026-10-22T11:25:00.000Z',
  },
];

class WhiteLabelMasterService {
  private regRequests: UnifiedRegistrationRequest[] = [];
  private pwdRequests: PasswordRecoveryRequest[] = [];
  private deptConfigs: WhiteLabelDepartmentConfig[] = [];
  private storefrontConfigs: BrandStorefrontConfig[] = [];
  private productSales: ProductSaleRecord[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    this.regRequests = readJson<UnifiedRegistrationRequest[]>(REG_REQ_KEY, []);
    this.pwdRequests = readJson<PasswordRecoveryRequest[]>(PWD_REC_KEY, []);
    this.productSales = readJson<ProductSaleRecord[]>(PRODUCT_SALES_KEY, [...SEEDED_PRODUCT_SALES]);
    if (!localStorage.getItem(PRODUCT_SALES_KEY)) {
      writeJson(PRODUCT_SALES_KEY, this.productSales);
    }

    const savedDepts = readJson<WhiteLabelDepartmentConfig[]>(DEPT_CFG_KEY, []);
    if (savedDepts.length > 0) {
      this.deptConfigs = savedDepts;
    } else {
      this.deptConfigs = this.seedDepartments();
      writeJson(DEPT_CFG_KEY, this.deptConfigs);
    }

    this.storefrontConfigs = readJson<BrandStorefrontConfig[]>(STOREFRONT_CFG_KEY, []);
    this.syncStorefrontsWithBrands(false);
  }

  private seedDepartments(): WhiteLabelDepartmentConfig[] {
    const workspaces = [
      { key: 'INDIA_POST', name: 'India Post' },
      { key: 'XPEEDO_EV', name: 'Xpeedo EV' },
      { key: 'XPOKART', name: 'Xpokart' },
      { key: 'DROP_DASH', name: 'Drop Dash' },
      { key: 'SHOP_DECK', name: 'Shop Deck' },
      { key: 'XPEEDO_LOGISTICS', name: 'Xpeedo Logistics' },
    ];
    const out: WhiteLabelDepartmentConfig[] = [];
    for (const ws of workspaces) {
      for (const bp of WHITE_LABEL_DEPARTMENTS) {
        out.push({
          id: `WLDEPT-${ws.key}-${bp.key}`,
          departmentKey: bp.key,
          workspaceKey: ws.key,
          brandName: ws.name,
          label: bp.label,
          description: bp.description,
          leadName: ws.key === 'INDIA_POST' ? 'Ekta Meena' : `${ws.name} Operations Lead`,
          slaHours: bp.defaultSlaHours,
          active: true,
          ragMetadataTags: [ws.key.toLowerCase(), bp.key.toLowerCase(), 'canonical-entity', 'kota-division'],
          updatedAt: '2026-10-01T00:00:00.000Z',
        });
      }
    }
    return out;
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
        // ignore listener failure
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 1. UNIFIED REGISTRATION REQUESTS & FORGOT PASSWORD RECOVERY
  // ---------------------------------------------------------------------------

  public getRegistrationRequests(): UnifiedRegistrationRequest[] {
    // Also surface any pending requests from legacy staffRegistrationService without losing them
    const legacyStaffReqs = staffRegistrationService.getRegistrationRequests();
    const seenIds = new Set(this.regRequests.map((r) => r.id));
    const bridged: UnifiedRegistrationRequest[] = legacyStaffReqs
      .filter((lr) => !seenIds.has(lr.id))
      .map((lr) => ({
        id: lr.id,
        fullName: lr.name,
        mobile: lr.mobile,
        email: lr.email,
        brandSlug: 'india-post',
        brandName: 'India Post',
        workspaceKey: 'INDIA_POST',
        department: 'Dadabari S.O.',
        roleInterest: lr.designation || 'Postman',
        allottedBeatOrArea: lr.requestedBeat,
        notes: 'Submitted via Field Staff Registration',
        status:
          lr.status === 'APPROVED'
            ? 'APPROVED'
            : lr.status === 'REJECTED'
            ? 'REJECTED'
            : 'PENDING_APPROVAL',
        submittedAt: lr.submittedAt,
        reviewedAt: lr.reviewedAt,
        reviewedBy: lr.reviewedBy,
        reviewNotes: lr.rejectionReason,
      }));
    return [...this.regRequests, ...bridged].sort((a, b) =>
      b.submittedAt.localeCompare(a.submittedAt)
    );
  }

  public submitRegistrationRequest(input: {
    fullName: string;
    mobile: string;
    email: string;
    brandSlug?: string;
    department?: string;
    roleInterest?: string;
    allottedBeatOrArea?: string;
    notes?: string;
  }): { success: boolean; request?: UnifiedRegistrationRequest; message: string } {
    const cleanName = (input.fullName || '').trim();
    const cleanMobile = normalizePhone10(input.mobile);
    const cleanEmail = (input.email || '').trim().toLowerCase();
    if (!cleanName) {
      return { success: false, message: 'Full name is required.' };
    }
    if (cleanMobile.length !== 10 && !cleanEmail.includes('@')) {
      return { success: false, message: 'Provide a valid 10-digit mobile number or email address.' };
    }

    const brandProfile = input.brandSlug
      ? brandOwnerService.getBrandProfileBySlugOrKey(input.brandSlug)
      : null;
    const brandName = brandProfile?.brandName || input.brandSlug || 'India Post';
    const brandSlug = brandProfile?.partnerSlug || (input.brandSlug || 'india-post').toLowerCase();
    const workspaceKey = brandProfile?.workspaceKey || brandSlug.toUpperCase().replace(/-/g, '_');

    const req: UnifiedRegistrationRequest = {
      id: genId('REGREQ'),
      fullName: cleanName,
      mobile: cleanMobile,
      email: cleanEmail || `${cleanMobile || 'user'}@indiapost-portal.in`,
      brandSlug,
      brandName,
      workspaceKey,
      department: (input.department || 'CUSTOMERS').trim(),
      roleInterest: (input.roleInterest || 'Field / Brand Staff').trim(),
      allottedBeatOrArea: (input.allottedBeatOrArea || '').trim() || undefined,
      notes: (input.notes || '').trim() || undefined,
      status: 'PENDING_APPROVAL',
      submittedAt: new Date().toISOString(),
    };

    this.regRequests.unshift(req);
    writeJson(REG_REQ_KEY, this.regRequests);

    xpeedoOpsService.logExternalActivity({
      actor: cleanName,
      actorRole: 'PROSPECT_APPLICANT',
      workspaceId: workspaceKey,
      action: 'REGISTRATION_REQUEST_SUBMITTED',
      entityType: 'RegistrationRequest',
      entityId: req.id,
      summary: `Registration request submitted for ${brandName} (${req.roleInterest})`,
    });

    this.notify();
    return {
      success: true,
      request: req,
      message: `Registration request ${req.id} sent for Admin approval. Access stays locked until approved.`,
    };
  }

  public reviewRegistrationRequest(
    requestId: string,
    action: 'APPROVE' | 'REJECT',
    adminName = 'Ekta Meena',
    notes?: string
  ): { success: boolean; message: string; generatedDefaultPassword?: string } {
    // Handle bridged legacy staff registration first if present there
    const legacy = staffRegistrationService.getRegistrationRequests().find((r) => r.id === requestId);
    if (legacy && !this.regRequests.some((r) => r.id === requestId)) {
      const res =
        action === 'APPROVE'
          ? staffRegistrationService.approveRegistration(requestId, adminName)
          : staffRegistrationService.rejectRegistration(requestId, notes || 'Declined by Admin', adminName);
      this.notify();
      return { success: res.success, message: res.message };
    }

    const idx = this.regRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) {
      return { success: false, message: 'Registration request not found.' };
    }
    const req = this.regRequests[idx];
    const reviewedAt = new Date().toISOString();

    if (action === 'REJECT') {
      this.regRequests[idx] = {
        ...req,
        status: 'REJECTED',
        reviewedAt,
        reviewedBy: adminName,
        reviewNotes: notes || 'Declined by Administrator',
      };
      writeJson(REG_REQ_KEY, this.regRequests);
      this.notify();
      return { success: true, message: `Rejected registration request for ${req.fullName}.` };
    }

    const defaultBrandPwd = computeDefaultBrandPassword(req.brandName || req.brandSlug);
    const beatLabel = req.allottedBeatOrArea || 'Beat 2';
    const cleanEmail = req.email || `${normalizePhone10(req.mobile) || 'staff'}@indiapost-portal.in`;
    const roleUpper = req.roleInterest.toUpperCase();
    const isBrandOwnerRequest = roleUpper.includes('OWNER') || roleUpper.includes('BRAND ADMIN');

    if (isBrandOwnerRequest && !brandOwnerService.getBrandProfileBySlugOrKey(req.brandSlug)) {
      brandOwnerService.createBrandProfile({
        brandName: req.brandName,
        ownerName: req.fullName,
        ownerContactNumber: req.mobile || '9000000000',
        ownerEmail: cleanEmail,
        loginId: cleanEmail,
        password: defaultBrandPwd,
        passcode: String(Math.floor(100000 + Math.random() * 900000)),
      });
    } else {
      const empId = `EMP-${Date.now().toString().slice(-6)}`;
      const { profile } = staffPermissionService.upsertStaffWithAutoOfficeAndBeat({
        employeeId: empId,
        name: req.fullName,
        contact: req.mobile,
        email: cleanEmail,
        password: defaultBrandPwd,
        designationType: roleUpper.includes('POSTMAN') ? 'Postman' : roleUpper.includes('GDS') ? 'GDS' : 'CRM Staff',
        role: roleUpper.includes('POSTMAN') ? 'POSTMAN' : 'STAFF',
        circle: 'Rajasthan Circle',
        division: 'Kota Division',
        headOffice: 'Kota H.O.',
        subOffice: 'Dadabari S.O.',
        officePincode: '324009',
        officeAddress: 'Dadabari S.O., Kota - 324009',
        beat: beatLabel,
        assignedBeats: [beatLabel],
        assignedColonies: ['Keshavpura'],
        partnerOrganization: req.brandName,
        approvalStatus: 'Approved',
      });
      // Enforce default property restrictions on newly approved basic staff
      staffPermissionService.setPropertyPermissionsForStaff(profile.email, {
        propertyDetailsRead: false,
        propertySearch: false,
        allottedTerritory: {
          beatNos: [beatLabel],
          pincodes: ['324009'],
        },
      });
      staffPermissionService.setStaffBrandAllocations(
        profile.id,
        [req.brandSlug || 'india-post'],
        req.brandSlug || 'india-post'
      );
    }

    this.regRequests[idx] = {
      ...req,
      status: 'APPROVED',
      reviewedAt,
      reviewedBy: adminName,
      reviewNotes: notes || `Approved with default password ${defaultBrandPwd} (mustChangePassword=true)`,
    };
    writeJson(REG_REQ_KEY, this.regRequests);

    xpeedoOpsService.logExternalActivity({
      actor: adminName,
      actorRole: 'MASTER_ADMIN',
      workspaceId: req.workspaceKey,
      action: 'REGISTRATION_REQUEST_APPROVED',
      entityType: 'RegistrationRequest',
      entityId: req.id,
      summary: `Approved ${req.fullName} for ${req.brandName} (${req.roleInterest})`,
    });

    this.notify();
    return {
      success: true,
      generatedDefaultPassword: defaultBrandPwd,
      message: `Approved ${req.fullName}. Initial password set to ${defaultBrandPwd} (change required on first login).`,
    };
  }

  public getPasswordRecoveryRequests(): PasswordRecoveryRequest[] {
    return [...this.pwdRequests].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }

  public submitForgotPasswordRequest(input: {
    identifier: string;
    brandSlug?: string;
    preferredMethod?: 'OTP' | 'ADMIN_RESET';
    note?: string;
  }): {
    success: boolean;
    request?: PasswordRecoveryRequest;
    message: string;
    otpIssued?: string;
  } {
    const cleanId = (input.identifier || '').trim();
    if (!cleanId) {
      return { success: false, message: 'Enter your registered Email, Mobile Number, Login ID, or Brand Code.' };
    }

    const staffMatch = staffPermissionService.findStaffProfileByIdentifier(cleanId);
    const brandMatch = brandOwnerService.findProfileByIdentifier(cleanId);
    const preferredMethod = input.preferredMethod || 'OTP';

    let matchedAccountName: string | undefined;
    let matchedAccountType: PasswordRecoveryRequest['matchedAccountType'] = 'UNKNOWN';
    if (staffMatch) {
      matchedAccountName = staffMatch.name;
      matchedAccountType = 'STAFF';
    } else if (brandMatch) {
      matchedAccountName = brandMatch.ownerName || brandMatch.brandName;
      matchedAccountType = 'BRAND_OWNER';
    }

    const otp =
      preferredMethod === 'OTP' && matchedAccountType !== 'UNKNOWN'
        ? String(Math.floor(100000 + Math.random() * 900000))
        : undefined;

    const rec: PasswordRecoveryRequest = {
      id: genId('PWDREQ'),
      identifier: cleanId,
      brandSlug: input.brandSlug || brandMatch?.partnerSlug,
      brandName: brandMatch?.brandName || (input.brandSlug ? input.brandSlug : undefined),
      preferredMethod,
      otpPreview: otp,
      matchedAccountName,
      matchedAccountType,
      status: otp ? 'OTP_ISSUED' : 'PENDING_ADMIN',
      note: input.note?.trim() || undefined,
      submittedAt: new Date().toISOString(),
    };

    this.pwdRequests.unshift(rec);
    writeJson(PWD_REC_KEY, this.pwdRequests);
    this.notify();

    return {
      success: true,
      request: rec,
      otpIssued: otp,
      message: otp
        ? `Verification code generated for ${matchedAccountName}. Enter the 6-digit code to set a new password.`
        : `Password recovery ticket ${rec.id} logged for Master Admin verification.`,
    };
  }

  public verifyOtpAndResetPassword(
    requestId: string,
    otp: string,
    newPassword: string
  ): { success: boolean; message: string } {
    const idx = this.pwdRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) return { success: false, message: 'Recovery request not found.' };
    const req = this.pwdRequests[idx];
    if (!req.otpPreview || req.otpPreview !== (otp || '').trim()) {
      return { success: false, message: 'Invalid verification code.' };
    }
    if ((newPassword || '').trim().length < 4) {
      return { success: false, message: 'New password must be at least 4 characters.' };
    }

    const changeRes = this.changeAccountPassword({
      actorType: req.matchedAccountType === 'BRAND_OWNER' ? 'BRAND_OWNER' : 'STAFF',
      identifierOrId: req.identifier,
      newPassword: newPassword.trim(),
      actorName: req.matchedAccountName || req.identifier,
      skipCurrentCheck: true,
    });
    if (!changeRes.success) return changeRes;

    this.pwdRequests[idx] = {
      ...req,
      status: 'RESOLVED',
      otpPreview: undefined,
      resolvedAt: new Date().toISOString(),
      resolvedBy: 'Self-Service OTP',
    };
    writeJson(PWD_REC_KEY, this.pwdRequests);
    this.notify();
    return { success: true, message: 'Password updated successfully. You can now sign in with your new password.' };
  }

  public resolvePasswordRecoveryByAdmin(
    requestId: string,
    newPassword?: string,
    adminName = 'Ekta Meena'
  ): { success: boolean; message: string } {
    const idx = this.pwdRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) return { success: false, message: 'Recovery request not found.' };
    const req = this.pwdRequests[idx];

    const fallbackPwd = computeDefaultBrandPassword(req.brandName || req.brandSlug || 'India Post');
    const targetPwd = (newPassword || '').trim() || fallbackPwd;

    const staff = staffPermissionService.findStaffProfileByIdentifier(req.identifier);
    if (staff) {
      staffPermissionService.adminUpdateStaffPassword(staff.email || staff.id, targetPwd);
    }
    const brand = brandOwnerService.findProfileByIdentifier(req.identifier);
    if (brand) {
      brandOwnerService.resetBrandPassword(brand.id, targetPwd, adminName);
    }

    this.pwdRequests[idx] = {
      ...req,
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString(),
      resolvedBy: adminName,
      note: `${req.note ? `${req.note} | ` : ''}Reset by ${adminName}`,
    };
    writeJson(PWD_REC_KEY, this.pwdRequests);
    this.notify();
    return {
      success: true,
      message: `Password recovery ${req.id} resolved (${staff || brand ? `password updated` : 'marked resolved'}).`,
    };
  }

  public changeAccountPassword(input: {
    actorType: 'STAFF' | 'BRAND_OWNER' | 'PARTNER';
    identifierOrId: string;
    currentPassword?: string;
    newPassword: string;
    actorName?: string;
    skipCurrentCheck?: boolean;
  }): { success: boolean; message: string } {
    const cleanNew = (input.newPassword || '').trim();
    if (cleanNew.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    if (input.actorType === 'STAFF') {
      const prof = staffPermissionService.findStaffProfileByIdentifier(input.identifierOrId);
      if (!prof) return { success: false, message: 'Staff account not found.' };
      if (!input.skipCurrentCheck && input.currentPassword !== undefined && input.currentPassword !== '') {
        const cur = input.currentPassword.trim();
        const matchesDefault = cur === DEFAULT_STAFF_FALLBACK_PASSWORD || cur === 'ind@1234';
        const matchesHash = Boolean(prof.password) && verifyPasswordSync(cur, prof.password);
        if (!matchesDefault && !matchesHash) {
          return { success: false, message: 'Current password is incorrect.' };
        }
      }
      staffPermissionService.updateOwnPassword(prof.email || prof.id, cleanNew);
      this.notify();
      return { success: true, message: 'Password changed successfully.' };
    }

    if (input.actorType === 'BRAND_OWNER') {
      const brand =
        brandOwnerService.getBrandProfileById(input.identifierOrId) ||
        brandOwnerService.findProfileByIdentifier(input.identifierOrId);
      if (!brand) return { success: false, message: 'Brand account not found.' };
      brandOwnerService.resetBrandPassword(brand.id, cleanNew, input.actorName || brand.ownerName);
      this.notify();
      return { success: true, message: 'Brand login password updated successfully.' };
    }

    // PARTNER member
    const updated = partnerBrandService.updateTeamMember(input.identifierOrId, {
      newPasscode: cleanNew,
    });
    if (!updated) return { success: false, message: 'Partner team account not found.' };
    this.notify();
    return { success: true, message: 'Partner workspace password updated successfully.' };
  }

  // ---------------------------------------------------------------------------
  // 2. WHITE-LABEL DEPARTMENTS & STOREFRONTS MANAGER
  // ---------------------------------------------------------------------------

  public getWhiteLabelDepartments(workspaceKey?: string): WhiteLabelDepartmentConfig[] {
    if (!workspaceKey || workspaceKey === 'ALL') {
      return [...this.deptConfigs];
    }
    return this.deptConfigs.filter((d) => d.workspaceKey === workspaceKey);
  }

  public upsertWhiteLabelDepartment(
    input: Partial<WhiteLabelDepartmentConfig> & {
      departmentKey: WhiteLabelDepartmentKey;
      workspaceKey: string;
    }
  ): WhiteLabelDepartmentConfig {
    const existingIdx = this.deptConfigs.findIndex(
      (d) =>
        (input.id && d.id === input.id) ||
        (d.workspaceKey === input.workspaceKey && d.departmentKey === input.departmentKey)
    );
    const blueprint = WHITE_LABEL_DEPARTMENTS.find((b) => b.key === input.departmentKey);
    const brandProf = brandOwnerService.getBrandProfileBySlugOrKey(input.workspaceKey);

    const record: WhiteLabelDepartmentConfig = {
      id: input.id || `WLDEPT-${input.workspaceKey}-${input.departmentKey}`,
      departmentKey: input.departmentKey,
      workspaceKey: input.workspaceKey,
      brandName: input.brandName || brandProf?.brandName || input.workspaceKey,
      label: input.label || blueprint?.label || input.departmentKey,
      description: input.description || blueprint?.description || '',
      leadName: input.leadName || 'Operations Lead',
      slaHours: input.slaHours ?? blueprint?.defaultSlaHours ?? 12,
      active: input.active ?? true,
      ragMetadataTags:
        input.ragMetadataTags && input.ragMetadataTags.length > 0
          ? input.ragMetadataTags
          : [input.workspaceKey.toLowerCase(), input.departmentKey.toLowerCase()],
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      this.deptConfigs[existingIdx] = record;
    } else {
      this.deptConfigs.push(record);
    }
    writeJson(DEPT_CFG_KEY, this.deptConfigs);
    this.notify();
    return record;
  }

  public syncStorefrontsWithBrands(shouldNotify = true): BrandStorefrontConfig[] {
    const map = new Map<string, BrandStorefrontConfig>();
    for (const sf of this.storefrontConfigs) {
      map.set(sf.slug.toLowerCase(), sf);
    }

    for (const official of OFFICIAL_BRAND_STORES) {
      const key = official.slug.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          id: `SF-${key.toUpperCase()}`,
          slug: official.slug,
          brandName: official.brandName,
          workspaceKey: official.slug.toUpperCase().replace(/-/g, '_'),
          themeColor: '#0F172A',
          tagline: official.shortTagline,
          heroHeadline: `${official.brandName} Official Storefront`,
          loginEnabled: true,
          registrationRequestEnabled: true,
          catalogMode: 'FULL_CATALOG',
          published: true,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    for (const bp of brandOwnerService.getAllBrandProfiles()) {
      const key = bp.partnerSlug.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          id: `SF-${bp.id}`,
          slug: bp.partnerSlug,
          brandName: bp.brandName,
          workspaceKey: bp.workspaceKey,
          themeColor: bp.accentColor || '#0F172A',
          tagline: bp.tagline || `${bp.brandName} White-Label Operations & Storefront`,
          heroHeadline: `${bp.brandName} Storefront & Partner Desk`,
          loginEnabled: true,
          registrationRequestEnabled: true,
          catalogMode: 'LEAD_SHELL',
          published: bp.status === 'ACTIVE',
          updatedAt: bp.updatedAt || new Date().toISOString(),
        });
      }
    }

    this.storefrontConfigs = Array.from(map.values());
    writeJson(STOREFRONT_CFG_KEY, this.storefrontConfigs);
    if (shouldNotify) this.notify();
    return this.storefrontConfigs;
  }

  public getStorefrontConfigs(): BrandStorefrontConfig[] {
    return this.syncStorefrontsWithBrands(false);
  }

  public upsertStorefrontConfig(
    input: Partial<BrandStorefrontConfig> & { slug: string }
  ): BrandStorefrontConfig {
    const cleanSlug = input.slug.trim().toLowerCase();
    const idx = this.storefrontConfigs.findIndex((s) => s.slug.toLowerCase() === cleanSlug);
    const existing = idx >= 0 ? this.storefrontConfigs[idx] : null;
    const record: BrandStorefrontConfig = {
      id: existing?.id || `SF-${cleanSlug.toUpperCase()}`,
      slug: cleanSlug,
      brandName: input.brandName || existing?.brandName || cleanSlug,
      workspaceKey: input.workspaceKey || existing?.workspaceKey || cleanSlug.toUpperCase().replace(/-/g, '_'),
      themeColor: input.themeColor || existing?.themeColor || '#0F172A',
      tagline: input.tagline || existing?.tagline || 'Official Storefront & Portal Access',
      heroHeadline: input.heroHeadline || existing?.heroHeadline || `${input.brandName || cleanSlug} Storefront`,
      loginEnabled: input.loginEnabled ?? existing?.loginEnabled ?? true,
      registrationRequestEnabled:
        input.registrationRequestEnabled ?? existing?.registrationRequestEnabled ?? true,
      catalogMode: input.catalogMode || existing?.catalogMode || 'LEAD_SHELL',
      published: input.published ?? existing?.published ?? true,
      updatedAt: new Date().toISOString(),
    };
    if (idx >= 0) {
      this.storefrontConfigs[idx] = record;
    } else {
      this.storefrontConfigs.unshift(record);
    }
    writeJson(STOREFRONT_CFG_KEY, this.storefrontConfigs);
    this.notify();
    return record;
  }

  // ---------------------------------------------------------------------------
  // 3. PRODUCT SALES & PROPERTY PORTFOLIO BREAKDOWN
  // ---------------------------------------------------------------------------

  public getProductSales(brandSlug?: string): ProductSaleRecord[] {
    if (!brandSlug || brandSlug === 'ALL') {
      return [...this.productSales];
    }
    const clean = brandSlug.trim().toLowerCase();
    return this.productSales.filter(
      (s) => s.brandSlug.toLowerCase() === clean || s.workspaceKey.toLowerCase() === clean
    );
  }

  public addProductSale(
    input: Omit<ProductSaleRecord, 'id' | 'soldAt'> & { soldAt?: string }
  ): ProductSaleRecord {
    const rec: ProductSaleRecord = {
      ...input,
      id: genId('SALE'),
      soldAt: input.soldAt || new Date().toISOString(),
    };
    this.productSales.unshift(rec);
    writeJson(PRODUCT_SALES_KEY, this.productSales);
    this.notify();
    return rec;
  }

  public getPropertyPortfolioBreakdown(properties: Property[]): PropertyPortfolioBreakdown {
    let vacant = 0;
    let occupied = 0;
    let commercial = 0;
    let mixed = 0;
    let flatResidency = 0;
    let addressLeft = 0;
    let verifiedCount = 0;

    for (const p of properties) {
      const pType = (p.propertyType || '').toLowerCase();
      const status = (p.status || '').toLowerCase();
      const hasResidents = (p.residents?.length || p.residentNames?.length || 0) > 0;

      if (p.verificationStatus) verifiedCount += 1;

      if (status.includes('vacant')) {
        vacant += 1;
      } else {
        occupied += 1;
      }

      if (pType.includes('flat') || pType.includes('residency') || pType.includes('apartment')) {
        flatResidency += 1;
      }
      if (pType.includes('mixed') || status.includes('mixed')) {
        mixed += 1;
      } else if (pType.includes('commercial') || status.includes('commercial')) {
        commercial += 1;
      }

      if (status.includes('left') || (!hasResidents && status.includes('relocated'))) {
        addressLeft += 1;
      }
    }

    return {
      total: properties.length,
      vacant,
      occupied,
      commercial,
      mixed,
      flatResidency,
      addressLeft,
      verifiedCount,
    };
  }

  // ---------------------------------------------------------------------------
  // 4. EXECUTIVE POWER BI CROSS-FILTERED SNAPSHOT & RAG EXPORT
  // ---------------------------------------------------------------------------

  public getExecutivePowerBiSnapshot(filters: {
    brandSlug?: string;
    workspaceKey?: string;
    department?: string;
    office?: string;
    pincodeOrBeat?: string;
    role?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) {
    const brands = brandOwnerService.getAllBrandProfiles();
    const clients = xpeedoOpsService.getClients();
    const allCustomers = customerService.getCustomers();
    const allProperties = customerService.getProperties();
    const allStaff = staffPermissionService.getDirectoryStaff();
    const allOffices = staffPermissionService.getAutoManagedOffices();
    const allLeads = customerService.getLeads();
    const allTasks = xpeedoOpsService.getTasks();
    const fieldTasks = customerService.getTasks();
    const allSales = this.getProductSales();

    const q = (filters.search || '').trim().toLowerCase();
    const brandF = (filters.brandSlug || 'ALL').trim().toLowerCase();
    const wsF = (filters.workspaceKey || 'ALL').trim().toUpperCase();
    const officeF = (filters.office || 'ALL').trim().toLowerCase();
    const pinBeatF = (filters.pincodeOrBeat || '').trim().toLowerCase();
    const roleF = (filters.role || 'ALL').trim().toLowerCase();
    const dateFromMs = filters.dateFrom ? Date.parse(filters.dateFrom) : NaN;
    const dateToMs = filters.dateTo ? Date.parse(`${filters.dateTo}T23:59:59`) : NaN;

    const matchDate = (iso?: string) => {
      if (!iso || (Number.isNaN(dateFromMs) && Number.isNaN(dateToMs))) return true;
      const t = Date.parse(iso);
      if (Number.isNaN(t)) return true;
      if (!Number.isNaN(dateFromMs) && t < dateFromMs) return false;
      if (!Number.isNaN(dateToMs) && t > dateToMs) return false;
      return true;
    };

    const matchBrand = (bId?: string, bName?: string) => {
      if (brandF === 'all' && wsF === 'ALL') return true;
      const id = (bId || 'india-post').toLowerCase();
      const nm = (bName || 'india post').toLowerCase();
      const ws = id.toUpperCase().replace(/-/g, '_');
      if (brandF !== 'all' && id !== brandF && nm !== brandF) return false;
      if (wsF !== 'ALL' && ws !== wsF) return false;
      return true;
    };

    const matchPinOrBeat = (pin?: string, beat?: string) => {
      if (!pinBeatF) return true;
      return (pin || '').toLowerCase().includes(pinBeatF) || (beat || '').toLowerCase().includes(pinBeatF);
    };

    const customers = allCustomers.filter((c) => {
      if (!matchBrand(c.brandId, c.brandName)) return false;
      if (!matchPinOrBeat(c.pincode, c.beatNo)) return false;
      if (officeF !== 'all' && !(c.officeId || '').toLowerCase().includes(officeF)) return false;
      if (!matchDate(c.createdAt)) return false;
      if (q && !`${c.name} ${c.mobile} ${c.colony || ''} ${c.pincode || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const properties = allProperties.filter((p) => {
      if (!matchPinOrBeat(p.pincode, p.beatNo)) return false;
      if (officeF !== 'all' && !(p.officeId || '').toLowerCase().includes(officeF)) return false;
      if (q && !`${p.housePlotNumber} ${p.area || ''} ${p.colony || ''} ${p.pincode || ''}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });

    const staff = allStaff.filter((s) => {
      if (!matchBrand(s.brandId, s.brandName)) return false;
      if (!matchPinOrBeat(s.officePincode, s.beat)) return false;
      if (officeF !== 'all' && !`${s.subOffice || ''} ${s.officeId || ''}`.toLowerCase().includes(officeF)) {
        return false;
      }
      if (roleF !== 'all' && !(s.designationType || s.role || '').toLowerCase().includes(roleF)) return false;
      if (q && !`${s.name} ${s.employeeId} ${s.contact} ${s.beat}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const offices = allOffices.filter((o) => {
      if (!matchBrand(o.brandId, o.brandName)) return false;
      if (officeF !== 'all' && !o.officeName.toLowerCase().includes(officeF)) return false;
      if (pinBeatF && !`${o.pincode} ${(o.mappedBeats || []).join(' ')}`.toLowerCase().includes(pinBeatF)) return false;
      if (q && !`${o.officeName} ${o.pincode} ${o.division}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const leads = allLeads.filter((l) => {
      if (!matchBrand(l.brandId, l.brandName)) return false;
      if (!matchPinOrBeat(l.pincode, l.beatNo)) return false;
      if (!matchDate(l.createdAt)) return false;
      if (q && !`${l.customerName} ${l.productName} ${l.customerMobile}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const opsTasksFiltered = allTasks.filter((t) => {
      if (wsF !== 'ALL' && t.workspaceId !== wsF) return false;
      if (filters.department && filters.department !== 'ALL') {
        const deptName = allTasks.length ? (t.departmentId || '').toLowerCase() : '';
        if (!deptName.includes(filters.department.toLowerCase())) {
          // soft allow if departmentId uses dept key or id
          const deptMatch = xpeedoOpsService
            .getDepartments()
            .find((d) => d.id === t.departmentId);
          if (deptMatch && !deptMatch.name.toLowerCase().includes(filters.department.toLowerCase())) {
            return false;
          }
        }
      }
      if (!matchDate(t.createdAt)) return false;
      if (q && !`${t.title} ${t.assigneeName}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const salesFiltered = allSales.filter((s) => {
      if (!matchBrand(s.brandSlug, s.brandName)) return false;
      if (!matchPinOrBeat(s.pincode, s.beatNo)) return false;
      if (!matchDate(s.soldAt)) return false;
      if (q && !`${s.productName} ${s.customerName} ${s.orderNumber}`.toLowerCase().includes(q)) return false;
      return true;
    });

    const propertyBreakdown = this.getPropertyPortfolioBreakdown(properties);

    // Chart Series
    const brandPerformance = brands.map((b) => {
      const bSales = allSales
        .filter((s) => s.brandSlug === b.partnerSlug)
        .reduce((acc, s) => acc + s.amountInr, 0);
      const bLeads = allLeads.filter((l) => (l.brandId || 'india-post') === b.partnerSlug).length;
      const bCusts = allCustomers.filter((c) => (c.brandId || 'india-post') === b.partnerSlug).length;
      return {
        name: b.brandName,
        slug: b.partnerSlug,
        revenueInr: bSales,
        leads: bLeads,
        customers: bCusts,
      };
    });

    const leadStagesMap = new Map<string, number>();
    for (const l of leads) {
      leadStagesMap.set(l.stage, (leadStagesMap.get(l.stage) || 0) + 1);
    }
    const leadFunnel = Array.from(leadStagesMap.entries()).map(([stage, count]) => ({ stage, count }));

    const totalRevenueInr = salesFiltered.reduce((sum, s) => sum + s.amountInr, 0);
    const totalTasksCount = opsTasksFiltered.length + fieldTasks.length;

    return {
      kpis: {
        activeBrands: brands.filter((b) => b.status === 'ACTIVE').length,
        totalBrands: brands.length,
        registeredClients: clients.length,
        totalCustomers: customers.length,
        totalStaff: staff.length,
        totalOffices: offices.length,
        totalLeads: leads.length,
        totalTasks: totalTasksCount,
        totalProductSales: salesFiltered.length,
        totalRevenueInr,
        pendingApprovals:
          this.getRegistrationRequests().filter((r) => r.status === 'PENDING_APPROVAL').length +
          this.pwdRequests.filter((p) => p.status !== 'RESOLVED').length,
      },
      propertyBreakdown,
      brandPerformance,
      leadFunnel,
      propertyMixChart: [
        { name: 'Occupied', value: propertyBreakdown.occupied },
        { name: 'Vacant', value: propertyBreakdown.vacant },
        { name: 'Commercial', value: propertyBreakdown.commercial },
        { name: 'Mixed', value: propertyBreakdown.mixed },
        { name: 'Flat / Residency', value: propertyBreakdown.flatResidency },
      ],
      customers,
      properties,
      staff,
      offices,
      leads,
      tasks: opsTasksFiltered,
      productSales: salesFiltered,
    };
  }

  public buildRagSnapshotJson(filters: { brandSlug?: string; workspaceKey?: string } = {}): string {
    const snap = this.getExecutivePowerBiSnapshot(filters);
    const payload = {
      schemaVersion: 'xpeedo-rag-master-v1',
      generatedAt: new Date().toISOString(),
      filters,
      kpis: snap.kpis,
      propertyBreakdown: snap.propertyBreakdown,
      departments: this.getWhiteLabelDepartments(filters.workspaceKey),
      storefronts: this.getStorefrontConfigs(),
      sampleCanonicalRecords: {
        customersCount: snap.customers.length,
        propertiesCount: snap.properties.length,
        officesCount: snap.offices.length,
        staffCount: snap.staff.length,
        leadsCount: snap.leads.length,
        salesCount: snap.productSales.length,
      },
    };
    return JSON.stringify(payload, null, 2);
  }

  // ---------------------------------------------------------------------------
  // 5. DEVELOPER MASTER DATA CENTRE (EXCEL / CSV EXPORT, PARSE, VALIDATE & UPSERT)
  // ---------------------------------------------------------------------------

  public async downloadMasterTemplate(
    entity: MasterDataEntityKey,
    format: 'csv' | 'xlsx'
  ): Promise<void> {
    const specs = MASTER_ENTITY_SCHEMAS[entity];
    const headers = specs.map((s) => s.key);
    const sampleRow = specs.map((s) => s.example);
    const slug = entity.toLowerCase().replace(/\s+/g, '_');

    if (format === 'csv') {
      exportCsvWithBom(`template_${slug}.csv`, headers, [sampleRow]);
      return;
    }

    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, entity.slice(0, 30));
    XLSX.writeFile(wb, `template_${slug}.xlsx`);
  }

  public async exportMasterData(
    entity: MasterDataEntityKey,
    options: { brandSlug?: string; format: 'csv' | 'xlsx' }
  ): Promise<number> {
    const brandSlug = (options.brandSlug || 'ALL').toLowerCase();
    const specs = MASTER_ENTITY_SCHEMAS[entity];
    const headers = specs.map((s) => s.key);
    let rows: Array<Array<string | number>> = [];

    if (entity === 'Properties') {
      const props = customerService.getProperties();
      rows = props.map((p) => [
        p.housePlotNumber || p.houseNo || '',
        p.colony || p.area || '',
        p.sector || '',
        p.pincode || '324009',
        p.beatNo || 'Beat 2',
        p.propertyType || 'House',
        p.status || 'Occupied',
        p.ownerName || (p.residentNames && p.residentNames[0]) || '',
        p.contactNumber || '',
      ]);
    } else if (entity === 'Customers') {
      const custs =
        brandSlug === 'all'
          ? customerService.getCustomers()
          : customerService.getCustomersByBrand(brandSlug);
      rows = custs.map((c) => [
        c.name,
        c.mobile,
        c.panAddress?.houseDoorFlatNo || c.houseNo || '',
        c.panAddress?.buildingPremises || '',
        c.panAddress?.streetRoadLane || c.address?.street || '',
        c.panAddress?.areaLocalityPostOffice || c.colony || c.area || '',
        c.panAddress?.pincode || c.pincode || '324009',
        c.panAddress?.cityDistrict || 'Kota',
        c.panAddress?.state || 'Rajasthan',
        c.beatNo || 'Beat 2',
        c.email || '',
      ]);
    } else if (entity === 'Staff') {
      const staffList = staffPermissionService.getDirectoryStaff().filter((s) =>
        brandSlug === 'all' ? true : (s.brandId || 'india-post').toLowerCase() === brandSlug
      );
      rows = staffList.map((s) => [
        s.employeeId || s.id,
        s.name,
        s.contact || '',
        s.email || '',
        s.designationType || s.role,
        s.subOffice || 'Dadabari S.O.',
        s.officePincode || '324009',
        s.beat || 'Beat 2',
        (s.assignedColonies || []).join(', '),
      ]);
    } else if (entity === 'Offices') {
      const offices = staffPermissionService.getAutoManagedOffices().filter((o) =>
        brandSlug === 'all' ? true : (o.brandId || 'india-post').toLowerCase() === brandSlug
      );
      rows = offices.map((o) => [
        o.officeName,
        o.officeType,
        o.pincode,
        o.division,
        o.headOffice,
        (o.mappedBeats || []).join(', '),
        o.completeAddress || '',
      ]);
    } else if (entity === 'Leads') {
      const leads =
        brandSlug === 'all'
          ? customerService.getLeads()
          : customerService.getLeadsByBrand(brandSlug);
      rows = leads.map((l) => [
        l.customerName,
        l.customerMobile,
        l.productName,
        l.productCode,
        l.estimatedValue || 0,
        l.stage,
        l.beatNo || '',
        l.pincode || '',
        l.assignedStaffName || '',
      ]);
    } else if (entity === 'Product Sales') {
      const sales = this.getProductSales(brandSlug);
      rows = sales.map((s) => [
        s.orderNumber,
        s.productName,
        s.sku,
        s.customerName,
        s.customerMobile,
        s.quantity,
        s.amountInr,
        s.paymentMode,
        s.status,
        s.pincode,
        s.beatNo,
      ]);
    }

    const slug = `${entity.toLowerCase().replace(/\s+/g, '_')}_${brandSlug}`;
    if (options.format === 'csv') {
      exportCsvWithBom(`export_${slug}.csv`, headers, rows);
      return rows.length;
    }

    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, entity.slice(0, 30));
    XLSX.writeFile(wb, `export_${slug}.xlsx`);
    return rows.length;
  }

  public async parseSpreadsheetFile(file: File): Promise<{
    headers: string[];
    rows: Array<Record<string, string>>;
  }> {
    const XLSX = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return { headers: [], rows: [] };
    const sheet = workbook.Sheets[firstSheetName];
    const matrix = XLSX.utils.sheet_to_json<Array<string | number>>(sheet, { header: 1, defval: '' });
    if (matrix.length === 0) return { headers: [], rows: [] };

    const rawHeaders = matrix[0].map((h) => String(h || '').trim());
    const normalizedHeaders = rawHeaders.map((h) =>
      h.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
    );

    const rows: Array<Record<string, string>> = [];
    for (let i = 1; i < matrix.length; i++) {
      const rowArr = matrix[i];
      if (!rowArr || rowArr.every((cell) => String(cell ?? '').trim() === '')) continue;
      const obj: Record<string, string> = {};
      normalizedHeaders.forEach((key, idx) => {
        if (key) {
          obj[key] = String(rowArr[idx] ?? '').trim();
        }
      });
      rows.push(obj);
    }
    return { headers: normalizedHeaders.filter(Boolean), rows };
  }

  public validateImportRows(
    entity: MasterDataEntityKey,
    rows: Array<Record<string, string>>,
    activeUser?: StaffProfile | null
  ): MasterDataImportPreviewRow[] {
    const specs = MASTER_ENTITY_SCHEMAS[entity];
    const existingCustomers = customerService.getCustomers();
    const existingProps = customerService.getProperties();
    const existingStaff = staffPermissionService.getDirectoryStaff();
    const existingOffices = staffPermissionService.getAutoManagedOffices();
    const existingSales = this.getProductSales();

    return rows.map((raw, idx) => {
      const missingReq = specs
        .filter((s) => s.required && !(raw[s.key] || '').trim())
        .map((s) => s.label);
      if (missingReq.length > 0) {
        return {
          rowIndex: idx + 1,
          raw,
          status: 'ERROR',
          reason: `Missing required: ${missingReq.join(', ')}`,
        };
      }

      if (entity === 'Properties') {
        const territoryCheck = activeUser
          ? staffPermissionService.isTerritoryAllowedForProperty(activeUser, {
              beatNo: raw.beat_no,
              pincode: raw.pincode,
              colony: raw.colony,
            })
          : { allowed: true };
        if (!territoryCheck.allowed) {
          return {
            rowIndex: idx + 1,
            raw,
            status: 'OUT_OF_TERRITORY',
            reason: territoryCheck.reason || 'Out of allotted territory.',
          };
        }
        const dup = existingProps.some(
          (p) =>
            (p.housePlotNumber || '').trim().toLowerCase() === (raw.house_no || '').toLowerCase() &&
            (p.colony || p.area || '').trim().toLowerCase() === (raw.colony || '').toLowerCase() &&
            (p.pincode || '') === (raw.pincode || '')
        );
        return {
          rowIndex: idx + 1,
          raw,
          status: dup ? 'DUPLICATE' : 'VALID',
          reason: dup ? 'Matches existing property (will safely enrich).' : 'Ready to insert.',
        };
      }

      if (entity === 'Customers') {
        const mob = normalizePhone10(raw.mobile);
        const dup = existingCustomers.some(
          (c) =>
            (mob && c.mobile === mob) ||
            ((c.houseNo || '').toLowerCase() === (raw.house_door_flat_no || '').toLowerCase() &&
              (c.colony || '').toLowerCase() === (raw.area_locality_post_office || '').toLowerCase())
        );
        return {
          rowIndex: idx + 1,
          raw,
          status: dup ? 'DUPLICATE' : 'VALID',
          reason: dup ? 'Existing customer found (safe non-destructive merge).' : 'Ready to insert.',
        };
      }

      if (entity === 'Staff') {
        const dup = existingStaff.some(
          (s) =>
            (s.employeeId || '').toUpperCase() === (raw.employee_id || '').toUpperCase() ||
            normalizePhone10(s.contact) === normalizePhone10(raw.mobile)
        );
        return {
          rowIndex: idx + 1,
          raw,
          status: dup ? 'DUPLICATE' : 'VALID',
          reason: dup ? 'Existing staff ID/mobile (will update assignment).' : 'Ready to onboard.',
        };
      }

      if (entity === 'Offices') {
        const dup = existingOffices.some(
          (o) =>
            o.officeName.toLowerCase() === (raw.office_name || '').toLowerCase() &&
            o.pincode === (raw.pincode || '')
        );
        return {
          rowIndex: idx + 1,
          raw,
          status: dup ? 'DUPLICATE' : 'VALID',
          reason: dup ? 'Existing office record (will merge beats).' : 'Ready to create office.',
        };
      }

      if (entity === 'Product Sales') {
        const dup = existingSales.some(
          (s) => s.orderNumber.toLowerCase() === (raw.order_number || '').toLowerCase()
        );
        return {
          rowIndex: idx + 1,
          raw,
          status: dup ? 'DUPLICATE' : 'VALID',
          reason: dup ? 'Duplicate order number.' : 'Ready to record sale.',
        };
      }

      return { rowIndex: idx + 1, raw, status: 'VALID', reason: 'Ready to import.' };
    });
  }

  public executeMasterUpsert(
    entity: MasterDataEntityKey,
    previewRows: MasterDataImportPreviewRow[],
    options: {
      brandSlug: string;
      workspaceKey: string;
      skipDuplicates: boolean;
      actorName: string;
      actorRole: string;
      fileName?: string;
    }
  ): MasterDataImportExecutionResult {
    const brandProfile = brandOwnerService.getBrandProfileBySlugOrKey(options.brandSlug);
    const brandName = brandProfile?.brandName || options.brandSlug || 'India Post';
    const cleanBrandSlug = brandProfile?.partnerSlug || options.brandSlug || 'india-post';

    let insertedCount = 0;
    let updatedCount = 0;
    let duplicateSkippedCount = 0;
    let errorCount = 0;
    const errorsSample: Array<{ row: number; reason: string }> = [];

    for (const item of previewRows) {
      if (item.status === 'ERROR' || item.status === 'OUT_OF_TERRITORY') {
        errorCount += 1;
        if (errorsSample.length < 15) {
          errorsSample.push({ row: item.rowIndex, reason: item.reason });
        }
        continue;
      }
      if (item.status === 'DUPLICATE' && options.skipDuplicates) {
        duplicateSkippedCount += 1;
        continue;
      }

      const r = item.raw;
      try {
        if (entity === 'Properties') {
          const propTypeRaw = (r.property_type || 'House').toLowerCase();
          const propertyType: 'House' | 'Commercial' | 'Mixed' | 'Flat / Residency' =
            propTypeRaw.includes('flat') || propTypeRaw.includes('residen') || propTypeRaw.includes('apart')
              ? 'Flat / Residency'
              : propTypeRaw.includes('mix')
              ? 'Mixed'
              : propTypeRaw.includes('comm')
              ? 'Commercial'
              : 'House';

          const statusRaw = (r.occupancy_status || 'Occupied').toLowerCase();
          const status: 'Occupied' | 'Vacant' | 'Commercial' | 'Mixed' =
            statusRaw.includes('vacant')
              ? 'Vacant'
              : statusRaw.includes('mix')
              ? 'Mixed'
              : statusRaw.includes('comm')
              ? 'Commercial'
              : 'Occupied';

          const res = customerService.addPropertyInAllottedArea(
            { role: 'MASTER_ADMIN', name: options.actorName, beat: 'All Beats' },
            {
              houseNo: r.house_no,
              colony: r.colony,
              sector: r.sector || 'Sector 1',
              pincode: r.pincode || '324009',
              beatNo: r.beat_no || 'Beat 2',
              propertyType,
              status,
              residentOrOwnerName: r.owner_or_resident,
              mobile: r.mobile,
              notes: `Imported via Master Data Centre (${cleanBrandSlug})`,
            }
          );
          if (res.success) {
            if (item.status === 'DUPLICATE') updatedCount += 1;
            else insertedCount += 1;
          } else {
            errorCount += 1;
            if (errorsSample.length < 15) errorsSample.push({ row: item.rowIndex, reason: res.error || 'Rejected' });
          }
        } else if (entity === 'Customers') {
          const addRes = customerService.addOrUpdateCustomer(
            {
              name: r.full_name,
              mobile: normalizePhone10(r.mobile),
              email: r.email || undefined,
              houseNo: r.house_door_flat_no,
              colony: r.area_locality_post_office,
              area: r.area_locality_post_office,
              sector: r.street_road_lane || 'Sector 1',
              pincode: r.pincode || '324009',
              beatNo: r.beat_no || 'Beat 2',
              brandId: cleanBrandSlug,
              brandName,
              panAddress: {
                houseDoorFlatNo: r.house_door_flat_no,
                buildingPremises: r.building_premises || undefined,
                streetRoadLane: r.street_road_lane || undefined,
                areaLocalityPostOffice: r.area_locality_post_office,
                pincode: r.pincode || '324009',
                cityDistrict: r.city_district || 'Kota',
                state: r.state || 'Rajasthan',
              },
              enteredByName: options.actorName,
              verificationStatus: 'Pending Verification',
            } as Partial<Customer>,
            `Master Data Centre (${cleanBrandSlug})`
          );
          if (addRes.isNew) insertedCount += 1;
          else updatedCount += 1;
        } else if (entity === 'Staff') {
          const cols = (r.colonies || 'Keshavpura')
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean);
          const { profile } = staffPermissionService.upsertStaffWithAutoOfficeAndBeat({
            employeeId: r.employee_id,
            name: r.full_name,
            contact: normalizePhone10(r.mobile),
            email: r.email || undefined,
            password: computeDefaultBrandPassword(brandName),
            designationType: (r.designation as any) || 'Postman',
            circle: 'Rajasthan Circle',
            division: 'Kota Division',
            headOffice: 'Kota H.O.',
            subOffice: r.sub_office || 'Dadabari S.O.',
            officePincode: r.pincode || '324009',
            officeAddress: `${r.sub_office || 'Dadabari S.O.'}, Kota - ${r.pincode || '324009'}`,
            beat: r.beat_no || 'Beat 2',
            assignedColonies: cols.length ? cols : ['Keshavpura'],
            partnerOrganization: brandName,
            approvalStatus: 'Approved',
          });
          staffPermissionService.setStaffBrandAllocations(profile.id, [cleanBrandSlug], cleanBrandSlug);
          if (item.status === 'DUPLICATE') updatedCount += 1;
          else insertedCount += 1;
        } else if (entity === 'Offices') {
          const oType: DynamicOfficeRecord['officeType'] =
            (r.office_type || 'SO').toUpperCase().includes('HO')
              ? 'HO'
              : (r.office_type || 'SO').toUpperCase().includes('BO')
              ? 'BO'
              : 'SO';
          staffPermissionService.upsertCustomOffice({
            officeName: r.office_name,
            officeType: oType,
            pincode: r.pincode || '324009',
            division: r.division || 'Kota Division',
            circle: 'Rajasthan Circle',
            headOffice: r.head_office || 'Kota H.O.',
            subOffice: r.office_name,
            completeAddress: r.complete_address || `${r.office_name} - ${r.pincode}`,
            mappedBeats: (r.mapped_beats || 'Beat 1')
              .split(',')
              .map((b) => b.trim())
              .filter(Boolean),
            brandId: cleanBrandSlug,
            brandName,
          });
          if (item.status === 'DUPLICATE') updatedCount += 1;
          else insertedCount += 1;
        } else if (entity === 'Leads') {
          const matchedCust = customerService.getCustomerByMobile(r.customer_mobile);
          customerService.createLead({
            customerId: matchedCust?.id || `CUST-${Date.now().toString().slice(-5)}`,
            customerName: r.customer_name,
            customerMobile: normalizePhone10(r.customer_mobile),
            productCode: (r.product_code || 'GEN_LEAD').toUpperCase(),
            productName: r.product_name,
            requirement: r.product_name || 'Master Data Centre Lead',
            priority: 'Medium',
            leadScore: 60,
            estimatedValue: Number(r.estimated_value) || 0,
            stage: (r.stage as Lead['stage']) || 'New',
            beatNo: r.beat_no || matchedCust?.beatNo || 'Beat 2',
            pincode: r.pincode || matchedCust?.pincode || '324009',
            assignedStaffName: r.assigned_staff_name || options.actorName,
            brandId: cleanBrandSlug,
            brandName,
            source: 'Master Data Centre',
          });
          insertedCount += 1;
        } else if (entity === 'Product Sales') {
          this.addProductSale({
            orderNumber: r.order_number,
            brandSlug: cleanBrandSlug,
            brandName,
            workspaceKey: options.workspaceKey,
            productName: r.product_name,
            sku: r.sku || 'SKU-GEN',
            customerName: r.customer_name,
            customerMobile: normalizePhone10(r.customer_mobile),
            pincode: r.pincode || '324009',
            beatNo: r.beat_no || 'Beat 2',
            quantity: Math.max(1, Number(r.quantity) || 1),
            amountInr: Math.max(0, Number(r.amount_inr) || 0),
            paymentMode: (['COD', 'UPI', 'IPPB', 'Invoice'].includes(r.payment_mode)
              ? r.payment_mode
              : 'UPI') as ProductSaleRecord['paymentMode'],
            status: (['Booked', 'Dispatched', 'Delivered', 'Cancelled'].includes(r.status)
              ? r.status
              : 'Delivered') as ProductSaleRecord['status'],
            soldBy: options.actorName,
          });
          insertedCount += 1;
        }
      } catch (err: any) {
        errorCount += 1;
        if (errorsSample.length < 15) {
          errorsSample.push({ row: item.rowIndex, reason: err?.message || 'Unexpected upsert error' });
        }
      }
    }

    const matchedClient =
      xpeedoOpsService.getClients().find((c) => c.workspaceKey === options.workspaceKey) ||
      xpeedoOpsService.getClients()[0];
    const resolvedFileName = options.fileName || `master_${entity.toLowerCase()}.xlsx`;
    const resolvedFileType: MigrationImportLog['fileType'] = resolvedFileName.endsWith('.csv')
      ? 'csv'
      : resolvedFileName.endsWith('.xls')
      ? 'xls'
      : 'xlsx';

    xpeedoOpsService.recordMigrationImport(
      {
        fileName: resolvedFileName,
        fileType: resolvedFileType,
        targetWorkspaceId: options.workspaceKey,
        targetClientId: matchedClient?.id || `client-${cleanBrandSlug}`,
        targetEntity: entity,
        totalRows: previewRows.length,
        importedCount: insertedCount + updatedCount,
        duplicateSkippedCount,
        errorCount,
        errorsSample,
        importedBy: options.actorName,
      },
      options.actorRole
    );

    this.notify();
    return {
      entity,
      brandSlug: cleanBrandSlug,
      workspaceKey: options.workspaceKey,
      totalRows: previewRows.length,
      insertedCount,
      updatedCount,
      duplicateSkippedCount,
      errorCount,
      errorsSample,
      executedAt: new Date().toISOString(),
    };
  }

  public seedDemoBrandProductSales(): number {
    let added = 0;
    const seen = new Set(this.productSales.map((s) => s.id));
    for (const demo of DEMO_OTHER_BRAND_PRODUCT_SALES) {
      if (!seen.has(demo.id)) {
        this.productSales.push(demo);
        added += 1;
      }
    }
    if (added > 0) {
      writeJson(PRODUCT_SALES_KEY, this.productSales);
      this.notify();
    }
    return added;
  }

  public clearNonIndiaPostSales(): { removedSales: number } {
    const before = this.productSales.length;
    this.productSales = this.productSales.filter(
      (s) => s.brandSlug === 'india-post' || s.workspaceKey === 'INDIA_POST'
    );
    const removedSales = before - this.productSales.length;
    if (removedSales > 0) {
      writeJson(PRODUCT_SALES_KEY, this.productSales);
      this.notify();
    }
    return { removedSales };
  }
}

export const whiteLabelMasterService = new WhiteLabelMasterService();
