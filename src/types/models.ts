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
  assignedStaffEmail?: string;
  enteredBy?: string;
  beatNo?: string;
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
  district?: string;
  subDivision?: string;
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
  division?: string;
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
  createdAt: string;
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

  // Customer & Lead Direct Linkage
  linkedCustomerId?: string;
  linkedCustomerMasterId?: string;
  linkedCustomerName?: string;
  linkedCustomerPhone?: string;
  linkedCustomerAddress?: string;
  linkedLeadId?: string;
  linkedLeadProduct?: string;
  linkedLeadStage?: string;
  linkType?: 'CUSTOMER' | 'LEAD' | 'HOUSEHOLD' | 'NONE';
}

// Re-export Staff Privacy & RBAC Masking models
export type { StaffMember, StaffPersonalInfo } from '../utils/securityUtils';
export { getMaskedStaffProfile } from '../utils/securityUtils';


