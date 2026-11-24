import { Timestamp } from 'firebase/firestore';

export type UserRole = 
  | 'OWNER' 
  | 'MASTER_ADMIN' 
  | 'SUPER_ADMIN' 
  | 'DEVELOPER' 
  | 'ADMIN' 
  | 'DIVISIONAL_HEAD'
  | 'ASST_DIVISIONAL_ADMIN'
  | 'SUBDIVISION_INCHARGE'
  | 'CIRCLE_INCHARGE'
  | 'DIVISION_INCHARGE'
  | 'DISTRICT_INCHARGE'
  | 'DISTRICT_MANAGER' 
  | 'DISTRICT_OFFICE_STAFF'
  | 'BLOCK_INCHARGE'
  | 'OFFICE_INCHARGE'
  | 'CLUSTER_INCHARGE'
  | 'MARKETING_TEAM'
  | 'LAST_MILE_SUPERVISOR'
  | 'SALES_FIELD_STAFF'
  | 'POSTMASTER' 
  | 'ASST_POSTMASTER'
  | 'SUB_POSTMASTER'
  | 'POSTMAN' 
  | 'MAIL_GUARD'
  | 'MTS'
  | 'GDS' 
  | 'BPM' 
  | 'ABPM'
  | 'DEO'
  | 'VENDOR'
  | 'STAFF' 
  | 'CUSTOMER' 
  | 'BO_STAFF' 
  | 'SALES_SUPPORT' 
  | 'CATEGORY_MANAGER'
  | 'VIEWER' 
  | string;

export type OfficialPostType =
  | 'Divisional Head'
  | 'Assistant Divisional Admin'
  | 'Subdivision Incharge'
  | 'Postmaster'
  | 'Assistant Postmaster'
  | 'Sub Postmaster'
  | 'BPM'
  | 'ABPM'
  | 'Postman'
  | 'Mail Guard'
  | 'MTS'
  | 'GDS'
  | 'Last Mile Supervisor'
  | 'Marketing Team'
  | 'Cluster Incharge'
  | 'Vendor'
  | 'DEO'
  | 'Master Admin'
  | 'Developer'
  | 'Owner';

export type GranularPermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'update'
  | 'assign'
  | 'reassign'
  | 'approve'
  | 'reject'
  | 'export'
  | 'import'
  | 'print'
  | 'delete'
  | 'configure';

export const ALL_GRANULAR_ACTIONS: GranularPermissionAction[] = [
  'view',
  'create',
  'edit',
  'update',
  'assign',
  'reassign',
  'approve',
  'reject',
  'export',
  'import',
  'print',
  'delete',
  'configure',
];

export type KotaModuleKey =
  | 'orgHierarchy'
  | 'locationIntelligence'
  | 'houseMaster'
  | 'customerMaster'
  | 'doorstepSurveys'
  | 'leadsPool'
  | 'tasksAndBeats'
  | 'vendorOperations'
  | 'dataGovernance'
  | 'adminControlCenter';

export type GranularPermissionMatrix = Record<KotaModuleKey, Partial<Record<GranularPermissionAction, boolean>>>;

export type BusinessServiceCategory =
  | 'Postal & Last-Mile Logistics'
  | 'Software, CRMs & AI SaaS'
  | 'EV Mobility & Batteries'
  | 'Travel, Tours & Fleet'
  | 'Solar & Clean Energy'
  | 'Banking, PLI & Insurance'
  | 'Hyperlocal Retail & FMCG'
  | 'Healthcare & Wellness'
  | 'eMitra & Digital Services';

export type OfficeVariantType =
  | 'Head Post Office (H.O.)'
  | 'Sub Post Office (S.O.)'
  | 'Branch Post Office (B.O.)'
  | 'EV Mobility Hub'
  | 'Logistics Franchise'
  | 'Hyperlocal Dark Store'
  | 'SaaS & Digital Commerce Hub'
  | 'District Operations Center'
  | string;

export type ProductSourceType = 'COMPANY_HOUSE' | 'VENDOR_PARTNER';

export type ProductListingStatus = 'Active' | 'Draft' | 'Out of Stock' | 'Paused';

export type VerificationStatus = 'Verified' | 'Pending Verification' | 'Conflict' | 'Unverified' | string;
export type ApprovalStatus = 'Draft' | 'Pending' | 'Pending Approval' | 'Approved' | 'Rejected' | string;
export type LivingStatus = 'Owner' | 'Tenant' | 'Family Member' | 'Vacant' | 'Other' | string;
export type ProductCategory = 
  | 'Savings & Deposits' 
  | 'Insurance (PLI/RPLI)' 
  | 'Postal Life Insurance'
  | 'Citizen & Government Schemes' 
  | 'Child & Women Empowerment'
  | 'Social Security & Pension'
  | 'Mails & Parcels' 
  | 'Banking & Aadhaar'
  | 'Digital Banking & Aadhaar'
  | string;
export type LeadStage = 
  | 'New'
  | 'Lead Generated'
  | 'Central Division Lead Pool'
  | 'Division Marketing Team'
  | 'Cluster Incharge'
  | 'Assigned Office/Employee'
  | 'Contacted' 
  | 'Interested'
  | 'Follow-up'
  | 'Follow-up Scheduled'
  | 'Documentation'
  | 'Documentation Pending'
  | 'Document Collection' 
  | 'Processing'
  | 'Under Processing'
  | 'Application Submitted' 
  | 'Converted - Product Opened' 
  | 'Completed'
  | 'Closed'
  | 'Not Interested'
  | 'Closed - Not Interested'
  | string;

export interface Address {
  houseNo?: string;
  houseNumber?: string;
  street?: string;
  locality?: string;
  colony?: string;
  sector?: string;
  block?: string;
  sectorLocality?: string;
  area?: string;
  landmark?: string;
  pincode?: string;
  addressLine1?: string;
  fullAddress?: string;
  city?: string;
  state?: string;
}

export type AddressExceptionSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type AddressExceptionStatus = 'PENDING_REVIEW' | 'AUTO_CORRECTED' | 'MANUALLY_RESOLVED' | 'REJECTED' | 'DISMISSED';
export type AddressDiscrepancyType =
  | 'PINCODE_MISMATCH'
  | 'INVALID_PINCODE'
  | 'COLONY_NOT_FOUND'
  | 'SECTOR_MISMATCH'
  | 'BEAT_MISALLOCATION'
  | 'MISSING_HOUSE_NUMBER'
  | 'INCOMPLETE_ADDRESS'
  | 'AMBIGUOUS_LANDMARK'
  | 'OUT_OF_DELIVERY_JURISDICTION'
  | 'SPELLING_ANOMALY'
  | 'GEO_COORDINATE_DRIFT';

export interface AddressDiscrepancyItem {
  type: AddressDiscrepancyType;
  message: string;
  severity: AddressExceptionSeverity;
  field: 'houseNo' | 'colony' | 'sector' | 'landmark' | 'pincode' | 'beatNo' | 'subOffice' | 'fullAddress';
}

export interface AddressCorrectionSuggestion {
  correctedHouseNo?: string;
  correctedColony?: string;
  correctedSector?: string;
  correctedLandmark?: string;
  correctedPincode?: string;
  correctedBeatNo?: string;
  correctedSubOffice?: string;
  correctedFullAddress?: string;
  confidenceScore: number; // 0.0 to 1.0 (e.g. 0.95 = 95%)
  explanation: string;
  geographicalReference?: string;
}

export interface Address_Exceptions {
  id: string; // e.g. "EXC-10492"
  customerId?: string; // Relational reference to Customer entity
  customerName?: string;
  customerMobile?: string;
  source: 'MANUAL_ENTRY' | 'BULK_IMPORT' | 'CUSTOMER_PORTAL' | 'FIELD_SURVEY' | 'POSTAL_DATABASE_AUDIT' | 'DSS_AUTO_SYNC';
  originalAddress: {
    rawInput?: string;
    houseNo?: string;
    colony?: string;
    sector?: string;
    landmark?: string;
    pincode?: string;
    beatNo?: string;
    subOffice?: string;
    city?: string;
    state?: string;
  };
  detectedDiscrepancies: AddressDiscrepancyItem[];
  severity: AddressExceptionSeverity;
  status: AddressExceptionStatus;
  suggestedCorrection: AddressCorrectionSuggestion;
  appliedCorrection?: Partial<AddressCorrectionSuggestion>;
  aiVerificationDetails: {
    modelUsed: string;
    verifiedAt: string;
    accuracyScore: number; // 0 to 100
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    reasoning: string;
    matchedPostalRecord?: {
      officeName: string;
      beatNumber: string;
      standardColony: string;
      standardPincode: string;
      assignedStaff: string;
    };
  };
  manualReviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AddressException = Address_Exceptions;

export interface RelocationRecord {
  id: string;
  shiftedDate: string;
  previousAddress: string;
  previousHouseNo?: string;
  previousStreet?: string;
  previousLandmark?: string;
  previousBeatNo?: string;
  newAddress: string;
  newHouseNo: string;
  newStreet: string;
  newLandmark: string;
  newSectorOrColony: string;
  newPincode: string;
  newBeatNo: string;
  reason: 'Tenant Shifted' | 'Own House Purchased' | 'Job / Service Transfer' | 'Family Relocation' | 'Marriage / Joint Family' | 'Other' | string;
  redirectionActive: boolean;
  recordedBy: string;
  remarks?: string;
}

export interface FuelLedgerEntry {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  beatNo: string;
  officeName: string;
  vehicleNo: string;
  openingKmReading: number;
  closingKmReading: number;
  netKmRun: number;
  sanctionedBeatKm: number;
  fuelVolumeLitres: number;
  fuelPricePerLitre: number;
  totalFuelCost: number;
  receiptNumber: string;
  fuelStationName: string;
  paymentMode: 'Cash' | 'UPI / DakPay' | 'IPPB' | 'Card';
  dssReconciliationStatus: 'Reconciled with DSS' | 'Verified by SPM' | 'Pending DSS Audit';
  remarks?: string;
  isDepartmentLocked?: boolean;
  lockedAt?: string;
  lockedBy?: string;
  departmentLockSource?: string;
  createdAt: string;
}

export interface HouseholdMember {
  id?: string;
  customerId?: string;
  name: string;
  relationship?: string;
  relationshipWithHead?: string;
  mobile?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  occupation?: string;
  aadhaarMasked?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    assignedAreaIds: string[];
    assignedBeatIds: string[];
}

export interface Member {
    id: string;
    householdId: string;
    firstName: string;
    lastName: string;
    fatherHusbandName: string;
    mobile: string;
    alternateMobile?: string;
    dob?: string;
    gender?: 'Male' | 'Female' | 'Other';
    relationshipWithHead: string;
    occupation?: string;
    email?: string;
    aadhaarMasked?: string;
    pan?: string;
    preferredContactMethod?: 'Phone' | 'WhatsApp' | 'Doorstep' | 'Email';
    remarks?: string;
}

export interface Product {
    id: string;
    name: string;
    code: string;
    description: string;
    benefits: string[];
    eligibility: string;
    requiredDocuments: string[];
}

export interface CustomerProductRelation {
  id: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  accountNumberOrPolicyNumber?: string;
  status?: 'Active' | 'Matured' | 'Lapsed' | 'Closed' | 'Pending Verification';
  sumAssuredOrBalance?: number;
  monthlyDeposit?: number;
  startDate?: string;
  maturityDate?: string;
  articleTrackingNumber?: string;
  lastUpdated?: string;
  remarks?: string;
}

export interface Customer {
  id: string; // Internal UUID or UM-XXXXX Master ID
  masterId?: string; // e.g. UM-00001
  name: string;
  mobile: string;
  whatsapp?: string;
  alternateMobile?: string;
  email?: string;
  fatherHusbandName?: string;
  dob?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  occupation?: string;
  category?: string; // General, SC, ST, OBC, Senior Citizen, etc.
  address?: Address | any;
  residentialAddress?: Address;
  permanentAddress?: Address;
  sameAsResidential?: boolean;
  addressLine1?: string;
  pincode?: string;
  houseNo?: string;
  street?: string;
  landmark?: string;
  colony?: string;
  sector?: string;
  block?: string;
  area?: string;
  sectorLocality?: string;
  type?: string;
  livingStatus?: LivingStatus;
  isShifted?: boolean;
  relocationHistory?: RelocationRecord[];
  householdMembers?: HouseholdMember[];
  beatNo?: string; // e.g. 'Beat 1' to 'Beat 34'
  officeId?: string; // e.g. DADABARI_SO
  subOfficeMapping?: string;
  propertyId?: string; // e.g. KP-S7-H0445
  propertyMappingStatus?: 'Mapped' | 'Unmapped / Pending Re-assignment' | string;
  householdId?: string; // e.g. HH-KP-S7-P0825
  isHeadOfFamily?: boolean;
  linkConfidenceScore?: number;
  existingBanking?: string;
  financialInterest?: string;
  leadScore?: number;
  followUpStatus?: string;
  verificationStatus: VerificationStatus | string;
  approvalStatus?: ApprovalStatus;
  source?: string; // e.g. MASTER_UNIQUE.csv, Customer Inquiry, Field Survey
  notes?: string;
  remarks?: string;
  products?: CustomerProductRelation[];
  historyIds?: string[];
  dataCompleteness?: number; // 0 to 100%
  hasConflict?: boolean;
  conflictDetails?: string[];
  addressExceptionId?: string;
  addressAccuracyScore?: number;
  addressVerifiedAt?: string;
  addressIssuesCount?: number;
  lastVisit?: string;
  nextFollowUpDate?: string;
  enteredBy?: string;
  enteredByName?: string;
  createdBy?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  assignedStaffEmail?: string;
  brandId?: string;
  brandName?: string;
  createdById?: string;
  assignedToId?: string;
  businessCategory?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductDefinition {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  tagline: string;
  description: string;
  interestRateOrBonus: string;
  minInvestment: string;
  maxInvestment?: string;
  tenure: string;
  taxBenefits: string;
  eligibility: string[];
  targetAudience: string;
  keyBenefits: string[];
  requiredDocuments: string[];
  howToApply: string[];
  faqs: { question: string; answer: string }[];
  isPopular?: boolean;
}

export interface KotaPostOfficeEntry {
  officeId: string;
  officeName: string;
  postOfficeName: string;
  displayLabel: string;
  pincode: string;
  officeType: 'HO' | 'SO' | 'BO';
  circle: string;
  division: string;
  headOffice: string;
  subOffice: string;
  branchOffice?: string;
  completeAddress: string;
  mappedBeats: string[];
  mappedColonies: string[];
  linkedDeliveryOffices: string[];
  coveragePercentage: number;
}

export interface LeadReassignmentLog {
  id: string;
  timestamp: string;
  fromAssignee: string;
  toAssignee: string;
  fromClusterId?: string;
  toClusterId?: string;
  performedBy: string;
  performedByRole: string;
  reason?: string;
}

export interface Lead {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress?: string;
  householdId?: string;
  houseId?: string;
  streetId?: string;
  productCode: string;
  productName: string;
  requirement: string;
  source: string;
  sourceChannel?: 'Doorstep Survey' | 'Customer Portal' | 'Counter Desk' | 'Vendor Referral' | 'Marketing Campaign' | 'Direct Inquiry' | string;
  sourceStaffId?: string;
  sourceStaffName?: string;
  sourceVendorId?: string;
  stage: LeadStage;
  poolStage?: 'Lead Generated' | 'Central Division Lead Pool' | 'Division Marketing Team' | 'Cluster Incharge' | 'Assigned Office/Employee' | 'Follow-up' | 'Converted' | 'Lost';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  leadScore: number;
  assignedStaffName?: string;
  assignedStaffId?: string;
  assignedStaffEmail?: string;
  assignedStaffMobile?: string;
  clusterId?: string;
  clusterName?: string;
  subdivisionId?: string;
  officeId?: string;
  postOfficeName?: string;
  pincode?: string;
  beatNo?: string;
  preferredContactMode?: string;
  estimatedValue?: number;
  nextAction?: string;
  nextFollowUpDate?: string;
  notes?: string;
  brandId?: string;
  brandName?: string;
  propertyId?: string;
  propertyCode?: string;
  createdById?: string;
  assignedToId?: string;
  businessCategory?: string;
  reassignmentHistory?: LeadReassignmentLog[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationLog {
  id: string;
  recipientName: string;
  mobile: string;
  channel: 'SMS' | 'WhatsApp' | 'Phone Call' | 'Physical Notice' | 'Broadcast';
  type: string;
  content: string;
  status: 'Delivered' | 'Sent' | 'Completed' | 'Pending';
  timestamp: string;
  beatNo?: string;
  customerId?: string;
  productCode?: string;
}

export interface FollowUp {
  id: string;
  customerId?: string;
  customerName: string;
  customerMobile: string;
  customerAddress?: string;
  leadId?: string;
  productCode?: string;
  productName?: string;
  scheduledDate: string;
  scheduledTime?: string;
  currentStatus: 'Pending' | 'Completed' | 'Overdue' | 'Rescheduled' | 'Cancelled';
  priority?: 'Normal' | 'High' | 'Urgent';
  nextAction: string;
  assignedStaffName: string;
  assignedStaffEmail?: string;
  enteredBy?: string;
  beatNo?: string;
  remarks: string;
  outcome?: string;
  brandId?: string;
  brandName?: string;
  propertyId?: string;
  createdById?: string;
  assignedToId?: string;
  businessCategory?: string;
  timelineNotes?: Array<{ timestamp: string; author: string; note: string }>;
  completedAt?: string;
  createdAt?: string;
}

export interface Inquiry {
  id: string;
  ticketNumber: string;
  customerName: string;
  mobile: string;
  preferredContact: 'Phone Call' | 'WhatsApp' | 'Doorstep Visit' | 'Email';
  productInterested: string;
  requirement: string;
  preferredTime?: string;
  address?: string;
  status: 'New' | 'Assigned' | 'InProgress' | 'FollowUp' | 'Resolved' | 'Closed';
  assignedStaffName?: string;
  remarks?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  ticketId: string; // e.g. TKT-2026-001
  customerName: string;
  customerMobile: string;
  category: 'Product Inquiry' | 'Account Opening' | 'Document Verification' | 'Aadhaar / CELC' | 'Address Update' | 'Claim / Settlement' | 'General Support';
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'Assigned' | 'In Progress' | 'Waiting for Customer' | 'Resolved' | 'Closed';
  assignedStaffName?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataConflict {
  id: string;
  customerId: string;
  customerName: string;
  masterId?: string;
  fieldName: 'Mobile Number' | 'Customer Name' | 'Address' | 'Pincode' | 'Product Status' | 'Follow-up Date' | 'Article Number';
  existingValue: string;
  incomingValue: string;
  sourceOfConflict: string;
  status: 'Pending Review' | 'Resolved - Kept Existing' | 'Resolved - Updated to New' | 'Resolved - Merged';
  detectedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionRemarks?: string;
  entityIds?: string[];
  conflictType?: string;
  details?: string;
}

export interface Household {
  id: string;
  householdId?: string;
  householdCode?: string; // e.g. HH-KP-S7-P0825
  primaryCustomerId?: string;
  primaryCustomerName?: string;
  address?: any;
  sector?: string;
  area?: string;
  propertyId?: string;
  beatId?: string;
  assignedStaffId?: string;
  members?: {
    customerId?: string;
    name: string;
    relationship?: string;
    relationshipWithHead?: string;
    mobile?: string;
  }[];
  activeProducts?: string[];
  leadCount?: number;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Property {
  id: string;
  propertyCode?: string; // e.g. KP-S7-H0445
  propertyNo?: string;
  housePlotNumber?: string;
  houseNo?: string;
  propertyType?: 'House' | 'Flat' | 'Shop' | 'Office' | 'Commercial' | 'Other';
  street?: string;
  address?: string;
  sector?: string;
  area?: string;
  colony?: string;
  locality?: string;
  pincode: string;
  beatNo?: string;
  officeId?: string;
  status: 'Occupied' | 'Vacant' | 'Rented' | 'Commercial' | 'Address Left';
  residentNames?: string[];
  residents?: {
    name: string;
    relationshipWithHead?: string;
  }[];
  landmark?: string;
  verificationStatus?: boolean;
  notes?: string;
  latitude?: number;
  longitude?: number;
  addressRemarks?: string;
  commercialCategory?: string;
  operationYears?: number;
  photoUrl?: string;
  googleMapsUri?: string;
  placeId?: string;
  ownerName?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  performedBy: string;
  userRole?: string;
  action: string;
  entityType?: string;
  entityId: string;
  entityName?: string;
  details: string;
  previousValue?: any;
  newValue?: any;
}

export interface PendingApproval {
  id: string;
  type: 'AddCustomer' | 'UpdateCustomer' | 'AddProperty' | 'UpdateProperty';
  payload: any;
  requestedBy: string;
  status: ApprovalStatus;
  timestamp: Timestamp;
}

export type StaffStatus = 'Active on Duty' | 'In Office' | 'Supervising' | 'On Leave';

export type IndiaPostDutyCategory =
  | 'Delivery'
  | 'Banking & IPPB'
  | 'Counter & Booking'
  | 'Field Survey & Leads'
  | 'Supervisory & Division';

export interface StaffPromotionRecord {
  id: string;
  staffId: string;
  employeeId?: string;
  staffName: string;
  previousPost: string;
  previousRole: string;
  previousPostCategory: string;
  previousOffice?: string;
  previousBeat?: string;
  newPost: string;
  newRole: string;
  newPostCategory: string;
  newOffice?: string;
  newBeat?: string;
  newPincode?: string;
  effectiveDate: string;
  orderRef?: string;
  notes?: string;
  promotedBy: string;
  changedAt: string;
}

export type DesignationType =
  | 'PA (Postal Assistant)'
  | 'Postman'
  | 'GDS (BPM / ABPM / Dak Sevak)'
  | 'MTS (Multi Tasking Staff)'
  | 'Inspector (IP / ASP)'
  | 'SPM / Postmaster'
  | 'Sorting Assistant (SA)'
  | 'Mail Guard'
  | 'District Manager (DM)'
  | 'Category Manager'
  | 'Circle Incharge'
  | 'Division Incharge'
  | 'District Incharge'
  | 'Block Incharge'
  | 'Office Incharge'
  | 'Last-Mile Rider'
  | 'Sales & Field Executive'
  | string;

export type VendorSystemId =
  | 'INDIA_POST'
  | 'COMMERCIAL_PARTNERS'
  | 'EV_MOBILITY'
  | 'SAAS_DIGITAL'
  | string;

export type FeatureVisibilityKey =
  | 'property'
  | 'members'
  | 'beats'
  | 'locationIntelligence'
  | 'dailyOperations'
  | 'officialDocuments'
  | 'leadsAndSchemes'
  | 'dailyVerification'
  | 'lms'
  | 'communication'
  | 'commercialDirectory'
  | 'vendorSection'
  | 'staffDirectory'
  | 'storefront'
  | 'aiAssistant'
  | 'dataBackupCenter';

export const DEFAULT_POSTMAN_GDS_VISIBLE_FEATURES: FeatureVisibilityKey[] = ['property', 'members'];

export const ALL_FEATURE_VISIBILITY_KEYS: FeatureVisibilityKey[] = [
  'property',
  'members',
  'beats',
  'locationIntelligence',
  'dailyOperations',
  'officialDocuments',
  'leadsAndSchemes',
  'dailyVerification',
  'lms',
  'communication',
  'commercialDirectory',
  'vendorSection',
  'staffDirectory',
  'storefront',
  'aiAssistant',
  'dataBackupCenter',
];

export interface VendorAccessConfig {
  assignedVendorId?: VendorSystemId;
  allowedVendors?: VendorSystemId[];
  whiteLabelMode?: boolean;
  strictVendorIsolation?: boolean;
  customWhiteLabelName?: string;
}

export interface ServiceModulePermissions {
  crmSection: boolean;                     // 1. CRM Section (Customer & Property Management)
  specialBillsSection: boolean;            // 2. Special Bills Section (Fuel Bill, Charge Report, Outsider Bill, BYOD)
  learningSection: boolean;                // 3. Departmental Learning Section (GDS to MTS / Postman / PA LMS)
  departmentalLearningSection?: boolean;   // Alias for learningSection
  schemeLeadsSection: boolean;             // 4. Product & Scheme Lead Section (PLI, SSA, IPPB, Savings Schemes)
  productSchemeLeadSection?: boolean;      // Alias for schemeLeadsSection
  contentSharingSection: boolean;          // 5. Content Sharing & Customer Request Dispatch Capabilities
  contentSharingDispatchSection?: boolean; // Alias for contentSharingSection
}

export interface Staff {
  id: string;
  employeeId?: string;
  name: string;
  role: string;
  designationType?: DesignationType;
  beat: string;
  assignedBeat?: string;
  assignedBeats?: string[];
  contact: string;
  email: string;
  
  // Joining Office Details
  officeId?: string;
  postOfficeName?: string;
  circle: string;
  region?: string;
  division: string;
  subdivision?: string;
  district?: string;
  block?: string;
  headOffice: string;
  subOffice?: string;
  branchOffice?: string;
  subOrBranchOffice: string;
  officePincode?: string;
  officeAddress?: string;
  postingType: 'Posted' | 'Attached';
  postedOfficeName: string;
  attachedOfficeName?: string;

  // Separate Official Post, Designation, Office Posting, CRM Role & Granular Permissions
  officialPost?: OfficialPostType | string;
  designation?: string;
  officePosting?: string;
  crmRole?: string;
  clusterId?: string;
  clusterName?: string;
  subdivisionId?: string;
  granularPermissions?: Partial<GranularPermissionMatrix>;

  // Regional & Multi-Business Ownership Metadata
  assignedCategories?: string[];
  partnerOrganization?: string;
  isNonTerritoryAgent?: boolean;
  staffScopeType?: 'XPOKART_PLATFORM' | 'BRAND_OPERATIONAL';
  brandId?: string;
  brandName?: string;
  assignedBrands?: string[];
  staffSlotNumber?: 1 | 2 | 3 | 4 | 5;
  vendorScope?: VendorAccessConfig;
  visibleFeaturesOverride?: Partial<Record<FeatureVisibilityKey, boolean>>;

  // Beat & Delivery Territory Mapping
  deliveryOfficeMapping?: string;
  assignedColonies?: string[];
  assignedColoniesWithSectors?: Record<string, string[]>;
  beatNotes?: string;
  extraRemarks?: string;

  activeAccountsOpened: number;
  doorstepVisits: number;
  rating: string;
  status: StaffStatus;
}

export interface Beat {
  id: string;
  name: string; // Beat Name / Number
  attachedOfficeName: string;
  officeType: 'S.O.' | 'H.O.' | 'B.O.';
  pincode: string;
  assignedStaffId: string;
  deliveryLocalities: string[];
  assignedColoniesWithSectors?: Record<string, string[]>;
  beatNotes?: string;
  extraRemarks?: string;
  status: 'Active' | 'Inactive';
}

export interface DynamicOfficeRecord {
  id: string;
  officeId?: string;
  officeName: string;
  postOfficeName?: string;
  officeType: 'H.O.' | 'S.O.' | 'B.O.' | 'HO' | 'SO' | 'BO' | 'EV Hub' | 'Logistics Franchise' | 'Hyperlocal Store' | 'EV_HUB' | 'LOGISTICS_FRANCHISE' | 'HYPERLOCAL_STORE' | string;
  businessCategory?: 'Head Post Office (HO)' | 'Sub Post Office (SO)' | 'Branch Post Office (BO)' | 'EV Hub' | 'Logistics Franchise' | 'Hyperlocal Store' | string;
  officeVariant?: OfficeVariantType;
  businessSectionName?: string;
  businessSectionCategory?: BusinessServiceCategory | string;
  businessSectionLandmark?: string;
  operationalRemarks?: string;
  serviceCategories?: string[];
  circle: string;
  division: string;
  headOffice: string;
  hoName: string;
  subOffice: string;
  soName: string;
  branchOffice?: string;
  boName?: string;
  pincode: string;
  completeAddress: string;
  mappedBeats: string[];
  mappedColonies: string[];
  linkedDeliveryOffices?: string[];
  coveragePercentage?: number;
  assignedStaffCount: number;
  staffCount: number;
  realStaffCount?: number;
  isVacant?: boolean;
  assignedStaffNames: string[];
  assignedStaffIds: string[];
  assignedInchargeName?: string;
  assignedDistrictIncharge?: string;
  assignedBlockIncharge?: string;
  district?: string;
  block?: string;
  subDivision?: string;
  pincodeManager?: string;
  pincodeManagerContact?: string;
  beatStaffAssignments?: Record<string, string>;
  boundPropertiesCount?: number;
  stockSkusCount?: number;
  brandId?: string;
  brandName?: string;
  isAutoManaged?: boolean;
  updatedAt: string;
}

// ============================================================================
// XPEEDO CRM / POSTMAN BOOK - MASTER ADMIN & OFFICE PERMISSION PROTOCOL
// ============================================================================

export interface OfficeMasterPermissionConfig {
  authorizedRoles: ('OWNER' | 'MASTER_ADMIN' | 'DEVELOPER')[];
  designatedAdmins: {
    name: string;
    role: string;
    emailOrId: string;
  }[];
  accessPermissions: {
    registerNewOffice: boolean;
    modifyExistingOffice: boolean;
    deleteOrArchiveOffice: boolean;
    instantVerifyStaffData: boolean;
    manageBeatAndPincodeMapping: boolean;
  };
}

export const xpeedoMasterAdminOfficeConfig: OfficeMasterPermissionConfig = {
  authorizedRoles: ['OWNER', 'MASTER_ADMIN', 'DEVELOPER'],
  designatedAdmins: [
    {
      name: 'Mahendra Kumar Meena',
      role: 'Owner & Founder',
      emailOrId: 'OWNER_ROOT_01'
    },
    {
      name: 'Ekta Meena',
      role: 'Master Admin & Developer',
      emailOrId: 'MASTER_ADMIN_EKTA_01'
    }
  ],
  accessPermissions: {
    registerNewOffice: true,      // Full permission to register new SO/HO/BO/Logistics Hub
    modifyExistingOffice: true,   // Full permission to edit category, pincode, and linked properties
    deleteOrArchiveOffice: true,  // Restricted strictly to Owner / Master Admin
    instantVerifyStaffData: true, // Bypass queue and instantly verify staff entries
    manageBeatAndPincodeMapping: true // 34-beat & Hadoti pincode assignment control
  }
};

// ============================================================================
// XPEEDO OS / LAST-MILE CRM: MASTER OFFICE AUDIT & RIDER DASHBOARD PROTOCOL
// ============================================================================

export interface MasterOfficeAndRiderAuditConfig {
  systemVersion: string;
  scope: string;
  targetAudience: {
    owners: string[];
    masterAdmins: string[];
  };
  modules: {
    officeDirectory: {
      filterUpdate: 'All Post Offices -> All Offices (Unified Multi-Vertical)';
      pincodeSearchBinding: boolean;
      businessCategoryMapping: [
        'Head Post Office (HO)',
        'Sub Post Office (SO)',
        'Branch Post Office (BO)',
        'EV Hub',
        'Logistics Franchise',
        'Hyperlocal Store'
      ];
    };
    internalAuditEngine: {
      postmanAndGdsTracking: boolean;
      lastMileRiderMetrics: boolean;
      dailyDssReconciliation: boolean;
      fuelAndByodVerification: boolean;
    };
    dashboardUx: {
      roleBasedAccess: 'Master Admin & Owner Full Control';
      instantVerificationBypass: boolean;
      mobileResponsiveCards: boolean;
    };
  };
}

export const xpeedoMasterAuditProtocol: MasterOfficeAndRiderAuditConfig = {
  systemVersion: 'v4.5-unified-audit',
  scope: 'Hadoti Region Pincodes & Dadabari S.O. Division (324009)',
  targetAudience: {
    owners: ['Mahendra Kumar Meena'],
    masterAdmins: ['Ekta Meena (Master Admin & Developer)']
  },
  modules: {
    officeDirectory: {
      filterUpdate: 'All Post Offices -> All Offices (Unified Multi-Vertical)',
      pincodeSearchBinding: true,
      businessCategoryMapping: [
        'Head Post Office (HO)',
        'Sub Post Office (SO)',
        'Branch Post Office (BO)',
        'EV Hub',
        'Logistics Franchise',
        'Hyperlocal Store'
      ]
    },
    internalAuditEngine: {
      postmanAndGdsTracking: true,
      lastMileRiderMetrics: true,
      dailyDssReconciliation: true,
      fuelAndByodVerification: true
    },
    dashboardUx: {
      roleBasedAccess: 'Master Admin & Owner Full Control',
      instantVerificationBypass: true,
      mobileResponsiveCards: true
    }
  }
};

// Execution Directive for Office & Staff Management UI
export function executeUnifiedOfficeAndAuditUpgrade() {
  console.info('[XPEEDO OS] Upgrading filter from "All Post Offices" to "All Offices" across all modules.');
  console.info('[XPEEDO OS] Activating Pincode-wise business property grouping and stock mapping.');
  console.info('[XPEEDO OS] Streamlining Postman, GDS, and Last-Mile Rider application & audit dashboard for Ekta Meena & Owner.');
}

executeUnifiedOfficeAndAuditUpgrade();

export interface ColonyBeatMapping {
  id: string;
  colonyName: string;
  sectorNumber: string;
  sectorOrPhase?: string;
  landmark: string;
  pincode: string;
  areaPincode: string;
  subOrHoOffice: string;
  subOrHeadOffice: string;
  branchOffice?: string;
  beatNumber: string;
  assignedBeatNumber: string;
  assignedPostmanName?: string;
  assignedPostmanContact?: string;
  assignedPostmanMobile?: string;
  circle?: string;
  division?: string;
  district?: string;
  subDivision?: string;
  sectorsList?: string[];
  coloniesList?: string[];
  landmarksList?: string[];
  updatedAt: string;
}

export type ColonyEntityType = 'Residential Colony' | 'Commercial Complex' | 'Specific Landmark';

export interface OfficeJurisdiction {
  officeId: string;
  officeName: string;
  officeType: 'HO' | 'SO' | 'BO';
  pincode: string;
  division: string;
  circle: string;
  parentOffice?: string;
  assignedBeats?: string[];
}

export interface BeatRecord {
  id: string;
  beatNo: string;
  name: string;
  officeId: string;
  postOfficeName: string;
  officeType: 'HO' | 'SO' | 'BO';
  pincode: string;
  division: string;
  circle?: string;
  assignedPostman: string;
  employeeId?: string;
  contact: string;
  fixedKm: number;
  areasCovered: string[];
  status: string;
}

export interface ColonyMasterRecord {
  id: string;
  colonyName: string;       // यूनीक मुख्य कॉलोनी नाम (जैसे: Keshavpura, Basant Vihar)
  entityType?: ColonyEntityType; // वर्गीकरण: Residential Colony, Commercial Complex, Specific Landmark
  pincode: string;          // पिनकोड (जैसे: 324009)
  division: 'KOTA' | 'BARAN' | 'BUNDI';
  postOfficeName: string;   // जैसे Dadabari S.O.
  subSectors?: string[];    // इसके अंतर्गत आने वाले सेक्टर/पॉकेट्स (जैसे: ['Sector 1', 'Sector 2', 'Sector 6'])
  blocks?: string[];        // Associated Blocks / Series (जैसे: ['Block A', 'KH Series', 'UIT Series'])
  landmarks?: string[];     // Prominent Landmarks (जैसे: ['CAD Circle', 'Shiv Mandir'])
  houseNumberRange?: string; // House / Plot Number Range (जैसे: 'H.No. 1 - 417, Plot 1 - 1010')
  geoTag: {
    lat: number;
    lng: number;
    googleMapsUrl: string;  // डायरेक्ट गूगल मैप्स पिन लिंक
  };
  assignedBeat?: string;
  status: 'ACTIVE' | 'PENDING_BEAT_MAPPING';
  createdAt: string;
}

export type SectorLandmarkCategory =
  | 'Temple / Religious'
  | 'Chowk / Junction'
  | 'Commercial / Market'
  | 'Park / Public Spot'
  | 'School / Hospital'
  | 'Prominent Resident / Landmark';

export interface SectorLandmarkMapping {
  id: string;
  colonyName: string;
  sectorName: string;
  landmarkName: string;
  category?: SectorLandmarkCategory;
  beatNo?: string;
  pincode?: string;
  notes?: string;
  createdAt?: string;
}

/**
 * कॉलोनी रजिस्टर या अपडेट (Upsert) करने का फंक्शन (Colony Name + PIN यूनीकनेस के साथ)
 */
export function registerOrUpdateUniqueColony(
  existingColonies: ColonyMasterRecord[],
  newColony: Omit<ColonyMasterRecord, 'id' | 'status' | 'createdAt'>
): { success: boolean; message: string; updatedColonies: ColonyMasterRecord[] } {
  // 1. यूनीकनेस चेक: Colony Name + Pincode का कॉम्बिनेशन मैच किया जाएगा
  const normalizedColony = newColony.colonyName.trim().toLowerCase();
  const normalizedPincode = newColony.pincode.trim();

  const existingIndex = existingColonies.findIndex(
    (c) => c.colonyName.trim().toLowerCase() === normalizedColony && c.pincode.trim() === normalizedPincode
  );

  const hasBeat = Boolean(
    newColony.assignedBeat &&
    newColony.assignedBeat.trim() !== '' &&
    newColony.assignedBeat !== 'PENDING_ASSIGNMENT'
  );
  const status: 'ACTIVE' | 'PENDING_BEAT_MAPPING' = hasBeat ? 'ACTIVE' : 'PENDING_BEAT_MAPPING';

  const lat = newColony.geoTag?.lat ?? 25.1432;
  const lng = newColony.geoTag?.lng ?? 75.8234;
  const googleMapsUrl =
    newColony.geoTag?.googleMapsUrl || `https://www.google.com/maps?q=${lat},${lng}`;
  const geoTagWithMap = {
    lat,
    lng,
    googleMapsUrl,
  };

  if (existingIndex > -1) {
    // अगर कॉलोनी उस पिनकोड पर पहले से है, तो उसके सब-सेक्टर्स और मैप लिंक को अपडेट (Upsert) कर देंगे
    const updatedColonies = [...existingColonies];
    const prev = updatedColonies[existingIndex];
    const mergedSubSectors = Array.from(
      new Set([...(prev.subSectors || []), ...(newColony.subSectors || [])])
    );

    updatedColonies[existingIndex] = {
      ...prev,
      ...newColony,
      entityType: newColony.entityType || prev.entityType || 'Residential Colony',
      subSectors: mergedSubSectors.length > 0 ? mergedSubSectors : prev.subSectors,
      geoTag: geoTagWithMap,
      status: newColony.assignedBeat !== undefined ? status : prev.status,
      assignedBeat: newColony.assignedBeat !== undefined ? newColony.assignedBeat : prev.assignedBeat,
      id: prev.id, // पुरानी ID बरकरार रहेगी
      createdAt: prev.createdAt,
    };
    return {
      success: true,
      message: `Colony "${newColony.colonyName}" (PIN: ${newColony.pincode}) updated with latest sectors & geo-tag.`,
      updatedColonies,
    };
  }

  // 2. नई यूनीक कॉलोनी जोड़ना
  const existingIds = new Set(existingColonies.map((c) => c.id));
  let newId = '';
  let seq = 0;
  do {
    seq += 1;
    const ts = Date.now().toString(36).toUpperCase();
    const seqStr = seq.toString(36).toUpperCase().padStart(2, '0');
    const randStr = Math.floor(Math.random() * 1296).toString(36).toUpperCase().padStart(2, '0');
    newId = `COL-${ts}-${seqStr}${randStr}`;
  } while (existingIds.has(newId));

  const colonyRecord: ColonyMasterRecord = {
    id: newId,
    ...newColony,
    entityType: newColony.entityType || 'Residential Colony',
    geoTag: geoTagWithMap,
    assignedBeat: hasBeat ? newColony.assignedBeat : 'PENDING_ASSIGNMENT',
    status,
    createdAt: new Date().toISOString(),
  };

  return {
    success: true,
    message: `Colony "${newColony.colonyName}" (PIN: ${newColony.pincode}) registered successfully under ${newColony.postOfficeName}.`,
    updatedColonies: [colonyRecord, ...existingColonies],
  };
}

// Re-export alias for existing callers
export const registerColonyToMaster = registerOrUpdateUniqueColony;

export interface StaffPermission {
  canCreateCustomer: boolean;
  canEditCustomer: boolean;
  canDeleteCustomer: boolean;
  canViewAllRecords: boolean; // if false, restricted to own entries or assigned beat/office
  dailyEntryLimit: number; // 0 = unlimited, or e.g. 10, 25, 50 entries/day
  canAssignStaff: boolean;
  canExportData: boolean;
  canAccessSettings: boolean;
  approvalStatus?: 'Approved' | 'Pending Approval' | 'Revoked';
  serviceModules?: ServiceModulePermissions;
  allowedBeats?: string[];
  allowedOffices?: string[];
  allowedColonies?: string[];
}

export interface StaffProfile {
  id: string;
  employeeId?: string; // e.g., EMP-10310735 or CSI-ID
  uid?: string;
  name: string;
  email: string;
  password?: string;
  hasCustomPassword?: boolean;
  mustChangePassword?: boolean;
  role: UserRole;
  designation?: string;
  designationType?: DesignationType;
  contact?: string;
  beat: string;
  assignedBeats?: string[];
  assignedOffice: string;
  officeId?: string;
  postOfficeName?: string;
  // Detailed Joining Office & Territory Fields
  circle?: string;
  region?: string;
  division?: string;
  subdivision?: string;
  subdivisionId?: string;
  district?: string;
  block?: string;
  clusterId?: string;
  clusterName?: string;
  officialPost?: OfficialPostType | string;
  officePosting?: string;
  crmRole?: string;
  granularPermissions?: Partial<GranularPermissionMatrix>;
  assignedDistricts?: string[];
  assignedBlocks?: string[];
  assignedCategories?: string[];
  partnerOrganization?: string;
  isNonTerritoryAgent?: boolean;
  staffScopeType?: 'XPOKART_PLATFORM' | 'BRAND_OPERATIONAL';
  brandId?: string;
  brandName?: string;
  assignedBrands?: string[];
  staffSlotNumber?: 1 | 2 | 3 | 4 | 5;
  reportingManagerId?: string;
  headOffice?: string;
  subOffice?: string;
  branchOffice?: string;
  officePincode?: string;
  officeAddress?: string;
  deliveryOfficeMapping?: string;
  assignedColonies?: string[];
  assignedColoniesWithSectors?: Record<string, string[]>;
  beatNotes?: string;
  extraRemarks?: string;
  fixedKm?: number; // Fixed daily beat distance in KM (e.g. 18, 22, 25)
  permissions: StaffPermission;
  vendorScope?: VendorAccessConfig;
  visibleFeaturesOverride?: Partial<Record<FeatureVisibilityKey, boolean>>;
  entriesCreatedToday: number;
  lastEntryDate: string; // YYYY-MM-DD
  totalEntriesCount: number;
  status: 'Active' | 'Inactive' | 'Pending';
  postCategory?: IndiaPostDutyCategory;
  promotionHistory?: StaffPromotionRecord[];
  photoURL?: string;
  updatedAt?: string;
}

export interface DailyArticleEntry {
  id: string;
  date: string; // YYYY-MM-DD
  employeeId: string;
  staffName: string;
  staffEmail: string;
  beatNo: string;
  officeName: string;
  attendanceStatus:
    | 'Present - Field Duty'
    | 'Present - Office Duty'
    | 'Half Day'
    | 'On Leave'
    | 'Sunday'
    | 'Gazetted Holiday';
  fixedKm: number;
  // Dedicated Beat-Wise Fuel Bill Allowance Mapping
  fuelRatePerKm?: number;
  dailyFuelAllowance?: number;
  monthlyFuelAllowance?: number;
  sanctionedBeatKm?: number;
  pdmsInvoicedCount?: number | string;
  dssInvoicedCount?: number | string;
  mobileUsagePercent?: number | string;
  dssStatus?: 'Reconciled with DSS' | 'Verified by SPM' | 'Pending DSS Audit';
  dssReconciledAt?: string;
  dssReconciledBy?: string;
  dssArticleAuditTrail?: {
    timestamp: string;
    updatedBy: string;
    changedFields: string[];
    previousCounts: Record<string, number>;
    newCounts: Record<string, number>;
    remarks?: string;
  }[];
  // Registry
  registryReceived: number;
  registryDelivered: number;
  registryReturned: number;
  registryDeposit: number;
  // Speed Post
  speedPostReceived: number;
  speedPostDelivered: number;
  speedPostReturned: number;
  speedPostDeposit: number;
  // Parcel / COD
  parcelReceived: number;
  parcelDelivered: number;
  parcelReturned: number;
  parcelDeposit: number;
  codAmountCollected: number;
  // Scheme / Doorstep
  doorstepInquiriesLogged: number;
  remarks?: string;
  isDepartmentLocked?: boolean;
  lockedAt?: string;
  lockedBy?: string;
  departmentLockSource?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ArticleQuantityPatch {
  registryReceived?: number;
  registryDelivered?: number;
  registryReturned?: number;
  registryDeposit?: number;
  speedPostReceived?: number;
  speedPostDelivered?: number;
  speedPostReturned?: number;
  speedPostDeposit?: number;
  parcelReceived?: number;
  parcelDelivered?: number;
  parcelReturned?: number;
  parcelDeposit?: number;
  codAmountCollected?: number;
  doorstepInquiriesLogged?: number;
  remarks?: string;
  dssStatus?: 'Reconciled with DSS' | 'Verified by SPM' | 'Pending DSS Audit';
}

export type SpecialBillType =
  | 'FUEL_BILL'
  | 'CHARGE_REPORT'
  | 'OUTSIDER_BILL'
  | 'BYOD_BILL'
  | 'CONSOLIDATED_BILL'
  | 'NPR_CENSUS_LOG'
  | string;

export interface SpecialBillRecord {
  id: string;
  billNumber: string;
  type: SpecialBillType;
  title: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  beatNo: string;
  officeName: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  fixedKm: number;
  totalAmount: number;
  status: 'Draft' | 'Submitted' | 'Verified by SPM' | 'Sanctioned' | 'Paid' | 'Approved' | 'Downloaded' | string;
  details: Record<string, any>;
  attachmentName?: string;
  documentCategory?: 'STATUTORY_CHARGE' | 'FUEL_ALLOWANCE' | 'DEVICE_ALLOWANCE' | 'DUTY_ALLOWANCE' | 'CONSOLIDATED_SUMMARY' | 'CENSUS_VERIFICATION';
  auditTrail?: {
    action: string;
    performedBy: string;
    timestamp: string;
    notes?: string;
  }[];
  isDepartmentLocked?: boolean;
  isFinalLocked?: boolean;
  finalLockedAt?: string;
  finalLockedBy?: string;
  lockedAt?: string;
  lockedBy?: string;
  departmentLockSource?: string;
  createdAt: string;
}

export interface FuelRecord {
  id: string;
  beatNo: string;
  beatSeq: number;
  postmanName: string;
  employeeId: string;
  officeId: string;
  officeName: string;
  linkedPincodes: string[];
  month: string; // YYYY-MM
  workingDays: number;
  leaveOrOffDays: number;
  sanctionedDailyKm: number;
  totalVerifiedKm: number;
  fuelRatePerKm: number;
  approvedClaimAmount: number;
  pdmsInvoicedTotal: number;
  dssInvoicedTotal: number;
  mobileUsageAvgPercent: number;
  isDepartmentLocked: boolean;
  lockedBy?: string;
  lockedAt?: string;
  sourceDocument?: string;
}

export interface BeatSettlementRecord {
  id: string;
  date: string; // YYYY-MM-DD
  beatNo: string;
  postmanName: string;
  officeId: string;
  officeName: string;
  pdmsInvoicedCount: number;
  dssInvoicedCount: number;
  mobileUsagePercent: number;
  dailyKm: number;
  fuelRatePerKm: number;
  dailyFuelClaim: number;
  dutyStatus: 'WORKING' | 'SUNDAY' | 'HOLIDAY' | 'LEAVE';
  isDepartmentLocked: boolean;
}

export interface FieldTask {
  id: string;
  title: string;
  category: 'KYC Collection' | 'Passbook Delivery' | 'Aadhaar Biometric' | 'PLI Renewal' | 'Address Verification' | string;
  assignedTo: string;
  beatNo: string;
  location: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  householdsTarget?: number;
  householdsCovered?: number;
  progressPercent?: number;
  updatedAt?: string;
  completedAt?: string;

  // Customer, House Master & Lead Direct Linkage
  houseId?: string;
  streetId?: string;
  colonyName?: string;
  floorUnit?: string;
  linkedCustomerId?: string;
  linkedCustomerMasterId?: string;
  linkedCustomerName?: string;
  linkedCustomerPhone?: string;
  linkedCustomerAddress?: string;
  linkedLeadId?: string;
  linkedLeadProduct?: string;
  linkedLeadStage?: string;
  linkType?: 'CUSTOMER' | 'LEAD' | 'HOUSEHOLD' | 'HOUSE_MASTER' | 'NONE';
}

// Re-export Staff Privacy & RBAC Masking models
export type { StaffMember, StaffPersonalInfo } from '../utils/securityUtils';
export { getMaskedStaffProfile } from '../utils/securityUtils';

export type CommercialStoreCategory =
  | 'Retail'
  | 'Wholesale'
  | 'Services'
  | 'eMitra/CSC'
  | 'Public Safety & Law Enforcement'
  | 'Postal & Government Services'
  | 'Insurance & Financial Institutions'
  | 'Events & Hospitality Venues'
  | 'Healthcare & Education';

export type StoreEntityType = 'LOCAL_MERCHANT' | 'BRAND_FRANCHISE' | 'CIVIC_UTILITY';

export interface StoreServiceabilityResult {
  isServiceable: boolean;
  reason: string;
  matchedPincode: boolean;
  matchedBeat: boolean;
  operationalActive: boolean;
  serviceablePincodes: string[];
  serviceableBeats: string[];
  deliveryRadiusKm: number;
}

export interface CommercialPhotoAttribution {
  displayName: string;
  uri?: string;
}

export interface CommercialStoreRecord {
  id: string;
  placeId?: string;
  storeName: string;
  ownerName: string;
  primaryPhone: string;
  whatsappNumber: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  photoAttribution?: CommercialPhotoAttribution;
  googleMapsUri?: string;
  fullAddress: string;
  colony: string;
  blockSector: string;
  pincode: string;
  beatNo: string; // e.g. 'Beat 1' .. 'Beat 34'
  cleanBeatNo: string; // '1' .. '34'
  category: CommercialStoreCategory;
  storeType?: StoreEntityType;
  brandName?: string;
  brandLogoUrl?: string;
  brandMonogram?: string;
  brandAccentColor?: string;
  brandCategoryTag?: string;
  serviceablePincodes?: string[];
  serviceableBeats?: string[];
  serviceableColonies?: string[];
  deliveryRadiusKm?: number;
  dispatchCutoffTime?: string;
  rawTypes?: string[];
  operationYears: number;
  earliestVerifiedYear?: number;
  longevityBadge: '5+ Years Verified' | '3–5 Years Verified' | 'Operational' | 'Manual / Baseline';
  operationalStatus: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'UNKNOWN';
  userRatingCount?: number;
  rating?: number;
  longevityVerified: boolean;
  source: 'google_places' | 'csv_import' | 'json_import' | 'crm_registry';
  verificationStatus: 'Pending' | 'Verified' | 'Needs Review';
  syncedToPropertyMaster: boolean;
  syncedToVerificationQueue: boolean;
  createdAt: string;
  updatedAt: string;

  // Affiliate & Marketing Budget Monetization Controls
  isStorefrontEnabled?: boolean;
  listingTier?: 'SPONSORED_PARTNER' | 'ACTIVE_AFFILIATE' | 'STANDARD_LISTING';
  marketingBudgetMonthly?: number;
  affiliateCommissionPercent?: number;
  sourceOwnership?: ProductSourceType;
  linkedOfficeId?: string;
  linkedOfficeName?: string;
  serviceCategory?: BusinessServiceCategory | string;

  // AI 4-Factor Verification & Freshness Fields
  fourFactorVerification?: FourFactorVerificationResult;
  lastCheckedDate?: string;
  listedDate?: string;
  freshnessStatus?: FourFactorFreshnessStatus;
  fieldVerifiedByStaffId?: string;
  fieldVerifiedByStaffName?: string;
  fieldVerifiedAt?: string;
  ippbSettlementRef?: string;
}

export type FourFactorFreshnessStatus = 'FRESH_ACTIVE' | 'STALE_EXCLUDED' | 'NEEDS_FIELD_RECHECK';

export interface FourFactorVerificationResult {
  factor1ActiveLicense: boolean; // Active license / Trade Registration / eMitra-CSC identifier
  factor1Details: string;
  factor2GeospatialAccuracy: boolean; // Exact centroid & valid postal boundary match (324009 / 324005)
  factor2Details: string;
  factor3OperationalStatus: boolean; // Confirmed open and physically operating
  factor3Details: string;
  factor4DigitalFootprint: boolean; // Verified Google Maps presence, recent ratings/reviews
  factor4Details: string;
  score: number; // 0 - 100
  passedFactorsCount: number; // 0 - 4
  freshnessStatus: FourFactorFreshnessStatus;
  lastCheckedDate: string;
  listedDate: string;
  isOlderThanOneYear: boolean;
  fieldVerifiedByStaffId?: string;
  fieldVerifiedByStaffName?: string;
  fieldVerifiedAt?: string;
  aiAuditNotes?: string;
}

export interface CustomerDemographicMatch {
  customerId: string;
  customerName: string;
  customerMobile: string;
  colony: string;
  sector?: string;
  houseNo?: string;
  pincode: string;
  beatNo: string;
  matchedCategory: string;
  matchScore: number; // e.g. 94%
  matchReason: string;
  recommendedPitchMessage: string;
}

export interface BeatProductMatchingPlan {
  beatNo: string;
  cleanBeatNo: string;
  pincode: string;
  subOffice: string;
  pincodeManagerId: string;
  pincodeManagerName: string;
  pincodeManagerContact: string;
  totalFreshStoresCount: number;
  totalMatchedCustomersCount: number;
  storeMatches: Array<{
    storeId: string;
    storeName: string;
    category: CommercialStoreCategory;
    matchedCustomers: CustomerDemographicMatch[];
  }>;
}

export interface LogisticsDispatchOrder {
  id: string; // e.g. "XPD-COD-10492"
  storeId?: string;
  storeName: string;
  productId?: string;
  productTitle: string;
  productSku: string;
  productPrice: number;
  customerName: string;
  customerMobile: string;
  deliveryAddress: string;
  colony: string;
  pincode: string;
  beatNo: string;
  pincodeManagerId: string;
  pincodeManagerName: string;
  pincodeManagerContact: string;
  serviceType: 'Speed Post COD' | 'XPOKART Local Parcel' | 'Xpeedo Local Parcel' | 'Doorstep Service Pickup';
  status: 'PENDING_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'COD_SETTLED' | 'CANCELLED';
  speedPostBarcode?: string;
  codAmount: number;
  ippbQrSettlementRef?: string;
  ippbQrSettledAt?: string;
  bookedAt: string;
  deliveredAt?: string;
  remarks?: string;
}

export type StaffProductVertical =
  | 'Logistics & Courier Services'
  | 'Banking & Finance'
  | 'Documents & Digital Services'
  | 'Course & Skill Academy'
  | 'Custom Staff / Partner Products';

export type ProductPricingModel = 'Fixed Price' | 'Subscription' | 'Commission-based' | 'Free Service';

export type ProductItemType = 'Physical Item' | 'Digital Download' | 'Service' | 'Subscription';

export interface StaffProductItem {
  id: string;
  sku: string;
  title: string;
  vertical: StaffProductVertical;
  pricingModel: ProductPricingModel;
  productType: ProductItemType;
  price: number;
  wholesalePrice?: number;
  mrpPrice?: number;
  commissionRate?: string;
  sellingMarginAmount?: number;
  sellingMarginPercent?: number;
  codEligible?: boolean;
  speedPostCharge?: number;
  vendorName?: string;
  vendorCategory?: 'Retail' | 'Wholesale' | 'Services' | 'eMitra/CSC' | 'Official India Post' | string;
  storeType?: StoreEntityType;
  brandName?: string;
  brandLogoUrl?: string;
  brandCategoryTag?: string;
  serviceablePincodes?: string[];
  serviceableBeats?: string[];
  deliveryRadiusKm?: number;
  beatManagerId?: string;
  beatManagerName?: string;
  description: string;
  features: string[];
  thumbnailUrl: string;
  staffId: string;
  staffName: string;
  staffMobile: string;
  whatsappNumber: string;
  beatNumber?: string;
  subOffice?: string;
  pincode?: string;
  status: 'ACTIVE' | 'HIDDEN' | 'FEATURED';
  isGlobalAdminItem?: boolean;
  assignedBeats?: string[];
  freshnessStatus?: FourFactorFreshnessStatus;
  lastCheckedDate?: string;
  commercialStoreId?: string;
  ippbSettlementRef?: string;
  logisticsServiceType?: 'Speed Post COD' | 'XPOKART Local Parcel' | 'Xpeedo Local Parcel' | 'Doorstep Service Pickup';
  listingStatus?: ProductListingStatus;
  stockQuantity?: number;
  sourceOwnership?: ProductSourceType;
  linkedOfficeId?: string;
  linkedOfficeName?: string;
  serviceCategory?: BusinessServiceCategory | string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffSalesRights {
  staffId: string;
  staffName: string;
  assignedBeat: string;
  allowedVerticals: StaffProductVertical[];
  allowedBeats: string[];
  hiddenGlobalProductIds: string[];
  canCreateCustomProducts: boolean;
  updatedBy?: string;
  updatedAt: string;
}

// ============================================================================
// KOTA DIVISION OS: ORG HIERARCHY, LOCATION INTELLIGENCE, SURVEYS & BACKUP
// ============================================================================

export type OrgHierarchyLevel = 'CIRCLE' | 'REGION' | 'DIVISION' | 'SUBDIVISION' | 'HPO' | 'SO' | 'BO';

export interface OrgHierarchyNode {
  id: string;
  code: string;
  name: string;
  level: OrgHierarchyLevel;
  parentId?: string;
  pincode?: string;
  inchargeName?: string;
  inchargePost?: OfficialPostType | string;
  vendorId?: VendorSystemId;
  status: 'ACTIVE' | 'CONFIGURABLE' | 'ARCHIVED';
  updatedAt: string;
}

export interface ClusterMasterRecord {
  id: string;
  name: string;
  division: string;
  subdivisionId?: string;
  inchargeStaffId?: string;
  inchargeName?: string;
  officeIds: string[];
  pincodes: string[];
  status: 'ACTIVE' | 'INACTIVE';
  updatedAt: string;
}

export interface OfficialPostConfig {
  id: string;
  postTitle: OfficialPostType | string;
  defaultRoleKey: UserRole;
  defaultWorkspacePath: string;
  hierarchyRank: number; // 1 = highest (Owner/Divisional Head) .. 10 = field/DEO
  isPostalCadre: boolean;
  defaultModuleMatrix: GranularPermissionMatrix;
}

export interface StreetMasterRecord {
  id: string;
  streetCode: string;
  streetName: string;
  streetNameHi?: string;
  division: string;
  subdivision?: string;
  officeId?: string;
  officeName?: string;
  pincode: string;
  locality: string;
  colony: string;
  sectorBlock: string;
  beatNo?: string;
  landmark?: string;
  status: 'ACTIVE' | 'NEEDS_REVIEW';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type DoorstepSurveyStatus =
  | 'Assigned'
  | 'In Progress'
  | 'Submitted'
  | 'Verification Pending'
  | 'Verified'
  | 'Rejected/Correction Required'
  | 'Completed';

export interface HouseMasterRecord {
  id: string; // e.g. HSE-KOTA-0001
  houseNumber: string;
  buildingName?: string;
  floorUnit?: string; // e.g. Ground Floor / Unit A / Shop 2
  streetId: string;
  streetName: string;
  sectorBlock: string;
  colony: string;
  locality: string;
  pincode: string;
  officeId?: string;
  officeName?: string;
  subdivision?: string;
  division: string;
  beatNo?: string;
  occupancyType: 'Residential' | 'Commercial' | 'Mixed' | 'Vacant' | 'Government';
  headResidentName?: string;
  linkedCustomerIds: string[];
  propertyId?: string; // Shared ID with Property Master
  latitude?: number;
  longitude?: number;
  consentCaptured: boolean;
  consentTimestamp?: string;
  consentRecordedBy?: string;
  surveyStatus: DoorstepSurveyStatus | 'Unvisited';
  lastSurveyId?: string;
  lastVerifiedAt?: string;
  lastVerifiedBy?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoorstepSurveyRecord {
  id: string;
  houseId: string;
  houseDisplayAddress: string;
  streetId?: string;
  colony: string;
  pincode: string;
  officeName?: string;
  beatNo?: string;
  assignedStaffId: string;
  assignedStaffName: string;
  supervisorId?: string;
  status: DoorstepSurveyStatus;
  isDraft: boolean;
  consentCaptured: boolean;
  consentNote?: string;
  gpsStatus: 'CAPTURED' | 'DENIED' | 'UNAVAILABLE' | 'NOT_REQUESTED';
  latitude?: number;
  longitude?: number;
  gpsAccuracyMeters?: number;
  residentName?: string;
  residentMobile?: string;
  householdMembersCount?: number;
  occupancyVerified?: 'Occupied' | 'Vacant' | 'Rented' | 'Commercial' | 'Shifted';
  interestedProducts?: string[];
  fieldNotes: string;
  correctionRemarks?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataExportHistoryRecord {
  id: string;
  timestamp: string;
  performedBy: string;
  userRole: string;
  dataset: string;
  format: 'CSV_UTF8_BOM' | 'XLSX' | 'JSON_BACKUP';
  recordCount: number;
  filtersApplied: string;
  fileName: string;
}

export interface DataImportConflictItem {
  rowIndex: number;
  entityType: 'HouseMaster' | 'StreetMaster' | 'CustomerMaster';
  identifier: string;
  reason: 'ALREADY_VERIFIED_PROTECTED' | 'DUPLICATE_IN_FILE' | 'DUPLICATE_EXISTING' | 'VALIDATION_ERROR';
  existingSummary?: string;
  incomingSummary: string;
  resolution: 'BLOCKED_VERIFIED' | 'SKIPPED' | 'QUEUED_FOR_REVIEW' | 'INVALID';
}

export interface DataImportValidationReport {
  id: string;
  fileName: string;
  entityType: 'HouseMaster' | 'StreetMaster' | 'CustomerMaster';
  totalRows: number;
  validReadyCount: number;
  blockedVerifiedCount: number;
  duplicateCount: number;
  errorCount: number;
  conflicts: DataImportConflictItem[];
  analyzedAt: string;
}

export interface SystemBackupBundle {
  schemaVersion: string;
  platform: 'KOTA_DIVISION_OS';
  createdAt: string;
  createdBy: string;
  checksumSha256Like: string;
  entityCounts: Record<string, number>;
  payload: Record<string, unknown>;
}

// ============================================================================
// PARTNER, BRAND & STORE MANAGEMENT + ISOLATED SCOPED WORKSPACE MODELS
// ============================================================================

export type PartnerLifecycleStatus = 'Active' | 'Pending' | 'Suspended';

export type PartnerOwnershipType = 'BRAND_LINKED' | 'DIRECT';

export type PartnerEntityType = 'BRAND' | 'DIRECT_STORE' | 'LOCAL_PARTNER';

export type PartnerTeamRole =
  | 'PARTNER_OWNER'
  | 'STORE_MANAGER'
  | 'SALES_EXECUTIVE'
  | 'CRM_OPERATOR'
  | 'SUPPORT_DESK';

export type PartnerTeamMemberStatus = 'Active' | 'Pending' | 'Deactivated';

export interface PartnerTeamPermissions {
  canManageTeam: boolean;
  canManageStores: boolean;
  canCreateCrm: boolean;
  canEditCrm: boolean;
  canDeleteCrm: boolean;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline?: string;
  logoUrl?: string;
  logoPresetId?: string;
  themePresetName?: string;
  monogram: string;
  accentColor: string;
  roleInSystem?: string;
  coreProductsServices?: string;
  storeBeatHubScope?: string;
  marketingGrowthReturn?: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  status: PartnerLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  code: string;
  name: string;
  ownershipType: PartnerOwnershipType;
  brandId?: string;
  partnerAccountId: string;
  pincode: string;
  beatNo?: string;
  city?: string;
  address: string;
  managerName?: string;
  managerPhone?: string;
  status: PartnerLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerAccount {
  id: string;
  partnerSlug: string;
  partnerType: PartnerEntityType;
  brandId?: string;
  directStoreId?: string;
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
  marketingGrowthReturn?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  pincode: string;
  status: PartnerLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerTeamMember {
  id: string;
  partnerId: string;
  brandId?: string;
  assignedStoreIds: string[];
  name: string;
  email: string;
  phone: string;
  role: PartnerTeamRole;
  permissions: PartnerTeamPermissions;
  isNonTerritoryAgent?: boolean;
  assignedCategories?: string[];
  assignedBeatOrPin?: string;
  passwordHash?: string;
  status: PartnerTeamMemberStatus;
  requestedNote?: string;
  requestedViaPortal?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SanitizedPartnerTeamMember = Omit<PartnerTeamMember, 'passwordHash'>;

export type StoreCrmStage =
  | 'New'
  | 'In Follow-Up'
  | 'Qualified'
  | 'Converted'
  | 'Closed';

export interface StoreCrmRecord {
  id: string;
  partnerId: string;
  brandId?: string;
  storeId: string;
  customerName: string;
  customerPhone: string;
  pincode: string;
  serviceOrProduct: string;
  stage: StoreCrmStage;
  assignedMemberId?: string;
  assignedMemberName?: string;
  notes: string;
  createdByMemberId: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerAuthSession {
  partnerId: string;
  partnerSlug: string;
  brandId?: string;
  memberId: string;
  memberName: string;
  memberRole: PartnerTeamRole;
  assignedStoreIds: string[];
  permissions: PartnerTeamPermissions;
  signedInAt: string;
  sessionToken?: string;
  deviceFingerprint?: string;
}

export interface AcademyCourse {
  id: string;
  title: string;
  departmentOrVertical: string;
  targetRole: string;
  description: string;
  lessonsCount: number;
  durationMinutes: number;
  isMandatory: boolean;
  passingScorePct: number;
  updatedAt: string;
}

export interface AcademyProgress {
  id: string;
  courseId: string;
  staffOrAgentId: string;
  staffName: string;
  status: 'In Progress' | 'Completed' | 'Failed' | 'Pending';
  progressPct: number;
  scoreObtained?: number;
  certificateIssued: boolean;
  updatedAt: string;
}

export interface PropertyRecord {
  id: string;
  propertyCode: string;
  clientId: string;
  brandId?: string;
  brandName?: string;
  propertyType: 'Residential' | 'Commercial' | 'Mixed' | 'Flat';
  beatOrPin: string;
  officeId: string;
  addressLine: string;
  landmark: string;
  geoOrTraceTag: string;
  occupancyStatus: 'Owner Occupied' | 'Rented / Tenant' | 'Mixed Use' | 'Vacant' | string;
  linkedUnitNotes?: string;
  linkedCustomerIds: string[];
  linkedLeadIds: string[];
  createdById?: string;
  assignedToId?: string;
  businessCategory?: string;
  updatedAt: string;
}

export interface BrandVerificationInquiry {
  id: string;
  partnerId: string;
  brandId?: string;
  brandName: string;
  customerName: string;
  customerPhone: string;
  propertyId?: string;
  propertyCode?: string;
  beatOrPin: string;
  inquiryTopic: string;
  category?: string;
  details: string;
  status: 'New Inquiry' | 'Verification Pending' | 'Verified' | 'Completed';
  assignedMemberId?: string;
  assignedMemberName?: string;
  createdByMemberId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandFollowUpTask {
  id: string;
  partnerId: string;
  brandId?: string;
  customerName: string;
  customerPhone: string;
  propertyId?: string;
  propertyCode?: string;
  category?: string;
  priority: 'Normal' | 'High' | 'Urgent';
  nextAction: string;
  dueDate: string;
  status: 'Pending' | 'Completed';
  assignedMemberId?: string;
  assignedMemberName?: string;
  createdByMemberId: string;
  timelineNotes: Array<{ timestamp: string; author: string; note: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface BrandRbacRoleConfig {
  partnerId: string;
  role: PartnerTeamRole;
  permissions: PartnerTeamPermissions;
  allowNonTerritoryCategoryAgents: boolean;
  updatedAt: string;
}





