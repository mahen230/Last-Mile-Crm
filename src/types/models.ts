import { Timestamp } from 'firebase/firestore';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'POSTMASTER' | 'POSTMAN' | 'STAFF' | 'BPM' | 'BO_STAFF' | 'SALES_SUPPORT' | 'VIEWER' | string;
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
  street?: string;
  locality?: string;
  sector?: string;
  area?: string;
  landmark?: string;
  pincode?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
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
  addressLine1?: string;
  pincode?: string;
  houseNo?: string;
  sector?: string;
  area?: string;
  sectorLocality?: string;
  type?: string;
  livingStatus?: LivingStatus;
  householdMembers?: HouseholdMember[];
  beatNo?: string; // e.g. 'Beat 1' to 'Beat 34'
  officeId?: string; // e.g. DADABARI_SO
  propertyId?: string; // e.g. KP-S7-H0445
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
  lastVisit?: string;
  nextFollowUpDate?: string;
  enteredBy?: string;
  enteredByName?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  assignedStaffEmail?: string;
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

export interface Lead {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress?: string;
  householdId?: string;
  productCode: string;
  productName: string;
  requirement: string;
  source: string;
  stage: LeadStage;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  leadScore: number;
  assignedStaffName?: string;
  assignedStaffId?: string;
  assignedStaffEmail?: string;
  assignedStaffMobile?: string;
  officeId?: string;
  postOfficeName?: string;
  pincode?: string;
  beatNo?: string;
  preferredContactMode?: string;
  estimatedValue?: number;
  nextAction?: string;
  nextFollowUpDate?: string;
  notes?: string;
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
  remarks: string;
  outcome?: string;
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

export type DesignationType =
  | 'PA (Postal Assistant)'
  | 'Postman'
  | 'GDS (BPM / ABPM / Dak Sevak)'
  | 'MTS (Multi Tasking Staff)'
  | 'Inspector (IP / ASP)'
  | 'SPM / Postmaster'
  | 'Sorting Assistant (SA)'
  | 'Mail Guard'
  | string;

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
  division: string;
  headOffice: string;
  subOffice?: string;
  branchOffice?: string;
  subOrBranchOffice: string;
  officePincode?: string;
  officeAddress?: string;
  postingType: 'Posted' | 'Attached';
  postedOfficeName: string;
  attachedOfficeName?: string;

  // Beat & Delivery Territory Mapping
  deliveryOfficeMapping?: string;
  assignedColonies?: string[];

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
  status: 'Active' | 'Inactive';
}

export interface DynamicOfficeRecord {
  id: string;
  officeId?: string;
  officeName: string;
  postOfficeName?: string;
  officeType: 'H.O.' | 'S.O.' | 'B.O.' | 'HO' | 'SO' | 'BO';
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
  assignedStaffNames: string[];
  assignedStaffIds: string[];
  isAutoManaged?: boolean;
  updatedAt: string;
}

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
  updatedAt: string;
}

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
  division?: string;
  headOffice?: string;
  subOffice?: string;
  branchOffice?: string;
  officePincode?: string;
  officeAddress?: string;
  deliveryOfficeMapping?: string;
  assignedColonies?: string[];
  fixedKm?: number; // Fixed daily beat distance in KM (e.g. 18, 22, 25)
  permissions: StaffPermission;
  entriesCreatedToday: number;
  lastEntryDate: string; // YYYY-MM-DD
  totalEntriesCount: number;
  status: 'Active' | 'Inactive' | 'Pending';
  photoURL?: string;
}

export interface DailyArticleEntry {
  id: string;
  date: string; // YYYY-MM-DD
  employeeId: string;
  staffName: string;
  staffEmail: string;
  beatNo: string;
  officeName: string;
  attendanceStatus: 'Present - Field Duty' | 'Present - Office Duty' | 'Half Day' | 'On Leave';
  fixedKm: number;
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
  createdAt: string;
}

export type SpecialBillType = 'FUEL_BILL' | 'CHARGE_REPORT' | 'OUTSIDER_BILL' | 'BYOD_BILL';

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
  status: 'Submitted' | 'Verified by SPM' | 'Sanctioned' | 'Paid';
  details: Record<string, any>;
  attachmentName?: string;
  createdAt: string;
}

