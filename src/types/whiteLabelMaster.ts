export type WhiteLabelDepartmentKey =
  | 'CUSTOMERS'
  | 'PROPERTIES'
  | 'STAFF'
  | 'OFFICES'
  | 'TASKS'
  | 'FINANCE'
  | 'WORKFLOW';

export interface WhiteLabelDepartmentConfig {
  id: string;
  departmentKey: WhiteLabelDepartmentKey;
  workspaceKey: string;
  brandName: string;
  label: string;
  description: string;
  leadName: string;
  slaHours: number;
  active: boolean;
  ragMetadataTags: string[];
  updatedAt: string;
}

export interface BrandStorefrontConfig {
  id: string;
  slug: string;
  brandName: string;
  workspaceKey: string;
  themeColor: string;
  tagline: string;
  heroHeadline: string;
  loginEnabled: boolean;
  registrationRequestEnabled: boolean;
  catalogMode: 'FULL_CATALOG' | 'LEAD_SHELL' | 'COMING_SOON';
  published: boolean;
  updatedAt: string;
}

export interface UnifiedRegistrationRequest {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  brandSlug: string;
  brandName: string;
  workspaceKey: string;
  department: string;
  roleInterest: string;
  allottedBeatOrArea?: string;
  notes?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface PasswordRecoveryRequest {
  id: string;
  identifier: string;
  brandSlug?: string;
  brandName?: string;
  preferredMethod: 'OTP' | 'ADMIN_RESET';
  otpPreview?: string;
  matchedAccountName?: string;
  matchedAccountType?: 'STAFF' | 'BRAND_OWNER' | 'PARTNER' | 'UNKNOWN';
  status: 'PENDING_ADMIN' | 'OTP_ISSUED' | 'RESOLVED';
  note?: string;
  submittedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export type MasterDataEntityKey =
  | 'Properties'
  | 'Customers'
  | 'Staff'
  | 'Offices'
  | 'Leads'
  | 'Product Sales';

export interface MasterDataColumnSpec {
  key: string;
  label: string;
  required: boolean;
  example: string;
}

export interface MasterDataImportPreviewRow {
  rowIndex: number;
  raw: Record<string, string>;
  status: 'VALID' | 'DUPLICATE' | 'ERROR' | 'OUT_OF_TERRITORY';
  reason: string;
}

export interface MasterDataImportExecutionResult {
  entity: MasterDataEntityKey;
  brandSlug: string;
  workspaceKey: string;
  totalRows: number;
  insertedCount: number;
  updatedCount: number;
  duplicateSkippedCount: number;
  errorCount: number;
  errorsSample: Array<{ row: number; reason: string }>;
  executedAt: string;
}

export interface ProductSaleRecord {
  id: string;
  orderNumber: string;
  brandSlug: string;
  brandName: string;
  workspaceKey: string;
  productName: string;
  sku: string;
  customerName: string;
  customerMobile: string;
  pincode: string;
  beatNo: string;
  quantity: number;
  amountInr: number;
  paymentMode: 'COD' | 'UPI' | 'IPPB' | 'Invoice';
  status: 'Booked' | 'Dispatched' | 'Delivered' | 'Cancelled';
  soldBy: string;
  soldAt: string;
}

export interface PropertyPortfolioBreakdown {
  total: number;
  vacant: number;
  occupied: number;
  commercial: number;
  mixed: number;
  flatResidency: number;
  addressLeft: number;
  verifiedCount: number;
}
