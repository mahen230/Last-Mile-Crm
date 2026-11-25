import {
  StaffProfile,
  StaffPermission,
  ServiceModulePermissions,
  Staff,
  DynamicOfficeRecord,
  ColonyBeatMapping,
  DesignationType,
  BusinessServiceCategory,
  OfficeVariantType,
  FeatureVisibilityKey,
  VendorAccessConfig,
  VendorSystemId,
  StaffPromotionRecord,
  IndiaPostDutyCategory,
  UserRole,
  xpeedoMasterAdminOfficeConfig,
  xpeedoMasterAuditProtocol,
  executeUnifiedOfficeAndAuditUpgrade,
} from '../types/models';
import type { OfficeMasterPermissionConfig, MasterOfficeAndRiderAuditConfig } from '../types/models';
import { UPDATED_STAFF_LIST } from '../data/updatedStaffData';
import { KOTA_OFFICE_MASTER_LIST, KOTA_POST_OFFICE_OPTIONS } from '../data/officesData';
import { CONSOLIDATED_BEAT_MATRIX } from '../data/consolidatedBeatMatrix';
import { hashPasswordSync, verifyPasswordSync, verifyPassword, sanitizeStaffProfile } from '../utils/securityUtils';
import { featureVisibilityService } from './featureVisibilityService';

export const DEFAULT_STAFF_FALLBACK_PASSWORD = 'Post@1234';
export const MAX_OPERATIONAL_STAFF_COUNT = 5;
export const BUSINESS_SERVICE_CATEGORIES: readonly BusinessServiceCategory[] = [
  'Postal & Last-Mile Logistics',
  'Software, CRMs & AI SaaS',
  'EV Mobility & Batteries',
  'Travel, Tours & Fleet',
  'Solar & Clean Energy',
  'Banking, PLI & Insurance',
  'Hyperlocal Retail & FMCG',
  'Healthcare & Wellness',
  'eMitra & Digital Services',
] as const;

export const OFFICE_VARIANT_OPTIONS: readonly OfficeVariantType[] = [
  'Head Post Office (H.O.)',
  'Sub Post Office (S.O.)',
  'Branch Post Office (B.O.)',
  'EV Mobility Hub',
  'Logistics Franchise',
  'Hyperlocal Dark Store',
  'SaaS & Digital Commerce Hub',
  'District Operations Center',
] as const;

export {
  KOTA_OFFICE_MASTER_LIST,
  KOTA_POST_OFFICE_OPTIONS,
  xpeedoMasterAdminOfficeConfig,
  xpeedoMasterAuditProtocol,
  executeUnifiedOfficeAndAuditUpgrade,
};
export type {
  OfficeMasterPermissionConfig,
  MasterOfficeAndRiderAuditConfig,
  BusinessServiceCategory,
  OfficeVariantType,
};

const STORAGE_KEY = 'master_source_staff_profiles_v3';
const DIRECTORY_STORAGE_KEY = 'master_source_staff_directory_v3';
const COLONY_MAP_STORAGE_KEY = 'master_source_colony_beat_mappings_v4';
const CUSTOM_OFFICE_STORAGE_KEY = 'master_source_custom_offices_v3';
const ARCHIVED_OFFICE_STORAGE_KEY = 'master_source_archived_offices_v1';
const MANAGED_BEATS_STORAGE_KEY = 'postman_crm_managed_beats_v1';
const ACTIVE_SESSION_KEY = 'master_source_active_staff_session';

export interface ManagedBeatOverrideRecord {
  id: string;
  compositeKey: string;
  officeId: string;
  postOfficeName: string;
  officeType: 'HO' | 'SO' | 'BO';
  division: string;
  circle: string;
  parentOffice: string;
  pincode: string;
  beatNo: string;
  beatTitle: string;
  fixedKm: number;
  assignedStaffId?: string;
  assignedPostman: string;
  employeeId: string;
  contact: string;
  colonies: string[];
  sectors?: string[];
  landmarks?: string[];
  updatedAt: string;
  updatedBy?: string;
}

const TALWANDI_EXT_SEED_STAFF: Staff[] = [
  {
    id: 'STAFF-CSI-10449214',
    employeeId: 'CSI-10449214',
    name: 'Rajesh Kumar Nagar',
    role: 'POSTMAN',
    designationType: 'Postman',
    beat: 'Beat 14',
    assignedBeat: 'Beat 14',
    assignedBeats: ['Beat 14'],
    contact: '9414281400',
    email: 'rajesh.nagar@indiapost.gov.in',
    officeId: 'TALWANDI_SO',
    circle: 'Rajasthan Circle',
    division: 'Kota Division',
    district: 'Kota',
    headOffice: 'Kota H.O.',
    subOffice: 'Talwandi S.O.',
    subOrBranchOffice: 'Talwandi S.O.',
    postedOfficeName: 'Talwandi S.O.',
    postingType: 'Posted',
    officePincode: '324005',
    officeAddress: 'Talwandi Sub-Post Office (PIP Hub), Talwandi Sector B, Kota - 324005',
    deliveryOfficeMapping: 'Talwandi S.O. (324005) / Kota H.O.',
    assignedColonies: ['Jawahar Nagar', 'Talwandi Coaching Hub', 'Vigyan Nagar Link'],
    activeAccountsOpened: 112,
    doorstepVisits: 1450,
    rating: '4.9/5.0',
    status: 'Active on Duty',
    brandId: 'india-post',
    brandName: 'India Post',
    partnerOrganization: 'India Post',
    assignedBrands: ['india-post'],
  },
  {
    id: 'STAFF-CSI-10449215',
    employeeId: 'CSI-10449215',
    name: 'Hemant Singh Chouhan',
    role: 'POSTMAN',
    designationType: 'Postman',
    beat: 'Beat PIP-1',
    assignedBeat: 'Beat PIP-1',
    assignedBeats: ['Beat PIP-1'],
    contact: '9829088501',
    email: 'hemant.chouhan@indiapost.gov.in',
    officeId: 'TALWANDI_SO',
    circle: 'Rajasthan Circle',
    division: 'Kota Division',
    district: 'Kota',
    headOffice: 'Kota H.O.',
    subOffice: 'Talwandi S.O.',
    subOrBranchOffice: 'Talwandi S.O.',
    postedOfficeName: 'Talwandi S.O.',
    postingType: 'Posted',
    officePincode: '324005',
    officeAddress: 'Talwandi Sub-Post Office (PIP Hub), Talwandi Sector B, Kota - 324005',
    deliveryOfficeMapping: 'Talwandi S.O. (324005) / Kota H.O.',
    assignedColonies: ['Talwandi Sector A', 'Talwandi Sector B', 'Talwandi Sector C', 'Commerce Zone'],
    activeAccountsOpened: 98,
    doorstepVisits: 1290,
    rating: '4.9/5.0',
    status: 'Active on Duty',
    brandId: 'india-post',
    brandName: 'India Post',
    partnerOrganization: 'India Post',
    assignedBrands: ['india-post'],
  },
];

export const DEFAULT_ADMIN_SERVICE_MODULES: ServiceModulePermissions = {
  crmSection: true,
  specialBillsSection: true,
  learningSection: true,
  departmentalLearningSection: true,
  schemeLeadsSection: true,
  productSchemeLeadSection: true,
  contentSharingSection: true,
  contentSharingDispatchSection: true,
};

export const DEFAULT_STAFF_SERVICE_MODULES: ServiceModulePermissions = {
  crmSection: true,
  specialBillsSection: true,
  learningSection: true,
  departmentalLearningSection: true,
  schemeLeadsSection: true,
  productSchemeLeadSection: true,
  contentSharingSection: true,
  contentSharingDispatchSection: true,
};

export const DEFAULT_VIEWER_SERVICE_MODULES: ServiceModulePermissions = {
  crmSection: true,
  specialBillsSection: false,
  learningSection: true,
  departmentalLearningSection: true,
  schemeLeadsSection: true,
  productSchemeLeadSection: true,
  contentSharingSection: false,
  contentSharingDispatchSection: false,
};

const DEFAULT_ADMIN_PERMISSION: StaffPermission = {
  canCreateCustomer: true,
  canEditCustomer: true,
  canDeleteCustomer: true,
  canViewAllRecords: true,
  dailyEntryLimit: 0, // 0 = Unlimited
  canAssignStaff: true,
  canExportData: true,
  canAccessSettings: true,
  approvalStatus: 'Approved',
  serviceModules: { ...DEFAULT_ADMIN_SERVICE_MODULES },
  allowedBeats: ['All Beats'],
  allowedOffices: ['All Offices'],
  allowedColonies: ['All Colonies'],
};

const DEFAULT_STAFF_PERMISSION: StaffPermission = {
  canCreateCustomer: true,
  canEditCustomer: true,
  canDeleteCustomer: false,
  canViewAllRecords: false, // Scoped to own entries & assigned beat/office/colony
  dailyEntryLimit: 50,
  canAssignStaff: false,
  canExportData: true,
  canAccessSettings: false,
  approvalStatus: 'Approved',
  serviceModules: { ...DEFAULT_STAFF_SERVICE_MODULES },
};

const DEFAULT_VIEWER_PERMISSION: StaffPermission = {
  canCreateCustomer: false,
  canEditCustomer: false,
  canDeleteCustomer: false,
  canViewAllRecords: false,
  dailyEntryLimit: 0,
  canAssignStaff: false,
  canExportData: false,
  canAccessSettings: false,
  approvalStatus: 'Approved',
  serviceModules: { ...DEFAULT_VIEWER_SERVICE_MODULES },
};

export const INITIAL_COLONY_BEAT_MAPPINGS: (Partial<ColonyBeatMapping> & { id: string; colonyName: string })[] = [
  ...CONSOLIDATED_BEAT_MATRIX.map((b) => ({
    id: b.id,
    colonyName: b.coloniesFormatted,
    coloniesList: b.colonies,
    sectorNumber: b.sectorsFormatted,
    sectorsList: b.sectors,
    sectorOrPhase: b.sectorsFormatted,
    landmark: b.landmarksFormatted,
    landmarksList: b.landmarks,
    pincode: b.pincode,
    areaPincode: b.pincode,
    subOrHoOffice: b.officeName,
    subOrHeadOffice: b.officeName,
    beatNumber: b.beatNumber,
    assignedBeatNumber: b.beatNumber,
    assignedPostmanName: b.assignedPostmanName,
    assignedPostmanContact: b.assignedPostmanContact,
    assignedPostmanMobile: b.assignedPostmanContact,
    circle: 'Rajasthan Circle',
    division: b.division,
    district: 'Kota',
    subDivision: b.subDivision,
    updatedAt: new Date().toISOString(),
  })),
  // Multi-District: Baran Division
  {
    id: 'CBM-BAR-01',
    colonyName: 'Pratap Chowk & Civil Lines',
    sectorNumber: 'Central Baran',
    landmark: 'Collectorate Circle / Dharmada Chauraha',
    pincode: '325205',
    subOrHoOffice: 'Baran H.O. (325205)',
    beatNumber: 'Beat 1',
    assignedPostmanName: 'Ramprasad Meena',
    assignedPostmanContact: '9414589201',
    circle: 'Rajasthan Circle',
    division: 'Baran Division',
    district: 'Baran',
    subDivision: 'Baran North Sub-Division',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-BAR-02',
    colonyName: 'NTPC Township & Siswali Road',
    sectorNumber: 'Anta Sector 1-3',
    landmark: 'NTPC Power Complex / Balaji Temple',
    pincode: '325202',
    subOrHoOffice: 'Anta S.O. (325202)',
    beatNumber: 'Beat 1',
    assignedPostmanName: 'Dinesh Kumar Sharma',
    assignedPostmanContact: '9829145672',
    circle: 'Rajasthan Circle',
    division: 'Baran Division',
    district: 'Baran',
    subDivision: 'Baran North Sub-Division',
    updatedAt: new Date().toISOString(),
  },
  // Multi-District: Jhalawar Division
  {
    id: 'CBM-JHL-01',
    colonyName: 'Mama Bhanja & Garh Palace',
    sectorNumber: 'Old City Jhalawar',
    landmark: 'Garh Palace / Brijraj Nagar',
    pincode: '326001',
    subOrHoOffice: 'Jhalawar H.O. (326001)',
    beatNumber: 'Beat 1',
    assignedPostmanName: 'Kailash Chand Verma',
    assignedPostmanContact: '9414234567',
    circle: 'Rajasthan Circle',
    division: 'Jhalawar Division',
    district: 'Jhalawar',
    subDivision: 'Jhalawar City Sub-Division',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-JHL-02',
    colonyName: 'Surajpole & Chandrabhaga Sun Temple',
    sectorNumber: 'Jhalrapatan Heritage Zone',
    landmark: 'City of Temple Bells / Gomti Sagar',
    pincode: '326023',
    subOrHoOffice: 'Jhalrapatan S.O. (326023)',
    beatNumber: 'Beat 1',
    assignedPostmanName: 'Manish Patidar',
    assignedPostmanContact: '9784123456',
    circle: 'Rajasthan Circle',
    division: 'Jhalawar Division',
    district: 'Jhalawar',
    subDivision: 'Jhalawar City Sub-Division',
    updatedAt: new Date().toISOString(),
  },
  // Multi-District: Bundi Division
  {
    id: 'CBM-BND-01',
    colonyName: 'Sadar Bazar & Lanka Gate',
    sectorNumber: 'Taragarh Heritage Zone',
    landmark: 'Taragarh Fort Road / Sadar Bazar',
    pincode: '323001',
    subOrHoOffice: 'Bundi H.O. (323001)',
    beatNumber: 'Beat 1',
    assignedPostmanName: 'Om Prakash Saini',
    assignedPostmanContact: '9460123789',
    circle: 'Rajasthan Circle',
    division: 'Bundi Division',
    district: 'Bundi',
    subDivision: 'Bundi Central Sub-Division',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-BND-02',
    colonyName: 'Patan Temple Ghat & Sugar Mill',
    sectorNumber: 'Keshoraipatan Central',
    landmark: 'Keshorai Mandir / Chambal Ghat',
    pincode: '323601',
    subOrHoOffice: 'Keshoraipatan S.O. (323601)',
    beatNumber: 'Beat 1',
    assignedPostmanName: 'Rameshwar Dayal',
    assignedPostmanContact: '9828345671',
    circle: 'Rajasthan Circle',
    division: 'Bundi Division',
    district: 'Bundi',
    subDivision: 'Bundi Central Sub-Division',
    updatedAt: new Date().toISOString(),
  },
  // Multi-District: Tonk Division
  {
    id: 'CBM-TNK-01',
    colonyName: 'Nazar Bagh & Civil Lines',
    sectorNumber: 'Tonk Central',
    landmark: 'Nazar Bagh / Bada Bazar',
    pincode: '304001',
    subOrHoOffice: 'Tonk H.O. (304001)',
    beatNumber: 'Beat 1',
    assignedPostmanName: 'Abdul Hameed',
    assignedPostmanContact: '9414345678',
    circle: 'Rajasthan Circle',
    division: 'Tonk Division',
    district: 'Tonk',
    subDivision: 'Tonk City Sub-Division',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-TNK-02',
    colonyName: 'Banasthali Link & Mandi Yard',
    sectorNumber: 'Niwai Station Area',
    landmark: 'Bhagat Singh Circle / Mandi Complex',
    pincode: '304021',
    subOrHoOffice: 'Niwai S.O. (304021)',
    beatNumber: 'Beat 1',
    assignedPostmanName: 'Satyanarayan Jat',
    assignedPostmanContact: '9829456123',
    circle: 'Rajasthan Circle',
    division: 'Tonk Division',
    district: 'Tonk',
    subDivision: 'Tonk City Sub-Division',
    updatedAt: new Date().toISOString(),
  },
];

export function resolveOfficeMetadata(
  rawOffice?: string,
  branchOffice?: string,
  pincode?: string
): {
  officeId: string;
  postOfficeName: string;
  pincode: string;
  parentOfficeName: string;
  linkedDeliveryOffices: string[];
  officeType: 'HO' | 'SO' | 'BO';
  circle: string;
  division: string;
  district: string;
  subDivision: string;
} {
  const combined = `${branchOffice || ''} ${rawOffice || ''} ${pincode || ''}`.toLowerCase();

  // Check against KOTA_OFFICE_MASTER_LIST / RAJASTHAN_CIRCLE_OFFICE_MASTER_LIST first
  for (const po of KOTA_OFFICE_MASTER_LIST) {
    const cleanPoName = po.name.replace(/\([^)]*\)/g, '').trim().toLowerCase();
    const shortKey = cleanPoName.replace(/\s+(s\.o\.|h\.o\.|b\.o\.)$/i, '').trim();
    if (
      combined.includes(po.officeId.toLowerCase()) ||
      combined.includes(cleanPoName) ||
      (shortKey.length > 3 && combined.includes(shortKey)) ||
      (pincode && po.pin === pincode)
    ) {
      return {
        officeId: po.officeId,
        postOfficeName: po.name,
        pincode: po.pin,
        parentOfficeName: po.parentOffice,
        linkedDeliveryOffices:
          po.type === 'HO'
            ? [
                'Dadabari S.O. (324009)',
                'Engineering College S.O. (324010)',
                'Vigyan Nagar S.O. (324005)',
                'Gumanpura S.O. (324007)',
              ]
            : [po.parentOffice, `${po.division} Head Office`],
        officeType: po.type,
        circle: po.circle || 'Rajasthan Circle',
        division: po.division || 'Kota Division',
        district: po.district || 'Kota',
        subDivision: po.subDivision || 'Kota West Sub-Division',
      };
    }
  }

  if (combined.includes('baran') || pincode?.startsWith('3252')) {
    return {
      officeId: 'BARAN_HO',
      postOfficeName: 'Baran H.O.',
      pincode: '325205',
      parentOfficeName: 'Baran Division, Rajasthan Circle (325205)',
      linkedDeliveryOffices: ['Baran City S.O. (325205)', 'Anta S.O. (325202)'],
      officeType: 'HO',
      circle: 'Rajasthan Circle',
      division: 'Baran Division',
      district: 'Baran',
      subDivision: 'Baran North Sub-Division',
    };
  }

  if (combined.includes('jhalawar') || pincode?.startsWith('3260') || pincode?.startsWith('3265')) {
    return {
      officeId: 'JHALAWAR_HO',
      postOfficeName: 'Jhalawar H.O.',
      pincode: '326001',
      parentOfficeName: 'Jhalawar Division, Rajasthan Circle (326001)',
      linkedDeliveryOffices: ['Jhalrapatan S.O. (326023)', 'Bhawani Mandi S.O. (326502)'],
      officeType: 'HO',
      circle: 'Rajasthan Circle',
      division: 'Jhalawar Division',
      district: 'Jhalawar',
      subDivision: 'Jhalawar City Sub-Division',
    };
  }

  if (combined.includes('bundi') || pincode?.startsWith('3230') || pincode?.startsWith('3236') || pincode?.startsWith('3238')) {
    return {
      officeId: 'BUNDI_HO',
      postOfficeName: 'Bundi H.O.',
      pincode: '323001',
      parentOfficeName: 'Bundi Division, Rajasthan Circle (323001)',
      linkedDeliveryOffices: ['Keshoraipatan S.O. (323601)', 'Lakheri S.O. (323801)'],
      officeType: 'HO',
      circle: 'Rajasthan Circle',
      division: 'Bundi Division',
      district: 'Bundi',
      subDivision: 'Bundi Central Sub-Division',
    };
  }

  if (combined.includes('tonk') || pincode?.startsWith('3040') || pincode?.startsWith('3045') || pincode?.startsWith('3048')) {
    return {
      officeId: 'TONK_HO',
      postOfficeName: 'Tonk H.O.',
      pincode: '304001',
      parentOfficeName: 'Tonk Division, Rajasthan Circle (304001)',
      linkedDeliveryOffices: ['Niwai S.O. (304021)', 'Malpura S.O. (304502)'],
      officeType: 'HO',
      circle: 'Rajasthan Circle',
      division: 'Tonk Division',
      district: 'Tonk',
      subDivision: 'Tonk City Sub-Division',
    };
  }

  if (combined.includes('engineering college') || combined.includes('rtu') || pincode === '324010') {
    return {
      officeId: 'ENG_COLLEGE_SO',
      postOfficeName: 'Engineering College S.O.',
      pincode: '324010',
      parentOfficeName: 'Kota H.O. (324001)',
      linkedDeliveryOffices: ['Dadabari S.O. (324009)'],
      officeType: 'SO',
      circle: 'Rajasthan Circle',
      division: 'Kota Division',
      district: 'Kota',
      subDivision: 'Kota West Sub-Division',
    };
  }
  if (
    (combined.includes('kota h.o') || combined.includes('kota head')) &&
    !combined.includes('dadabari') &&
    !combined.includes('engineering')
  ) {
    return {
      officeId: 'KOTA_HO',
      postOfficeName: 'Kota H.O.',
      pincode: '324001',
      parentOfficeName: 'Kota Division, Rajasthan Circle (324001)',
      linkedDeliveryOffices: [
        'Dadabari S.O. (324009)',
        'Engineering College S.O. (324010)',
      ],
      officeType: 'HO',
      circle: 'Rajasthan Circle',
      division: 'Kota Division',
      district: 'Kota',
      subDivision: 'Kota City Sub-Division',
    };
  }
  if (
    combined.includes('dadabari') ||
    pincode === '324009' ||
    !rawOffice
  ) {
    return {
      officeId: 'DADABARI_SO',
      postOfficeName: 'Dadabari S.O.',
      pincode: '324009',
      parentOfficeName: 'Kota H.O. (324001)',
      linkedDeliveryOffices: [
        'Engineering College S.O. (324010)',
      ],
      officeType: 'SO',
      circle: 'Rajasthan Circle',
      division: 'Kota Division',
      district: 'Kota',
      subDivision: 'Kota West Sub-Division',
    };
  }

  const cleanName = (branchOffice || rawOffice || 'Dadabari S.O.').replace(/\(\d+\)/g, '').trim();
  const cleanId = cleanName.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
  const isBo = cleanName.toUpperCase().includes('B.O') || cleanName.toUpperCase().includes('BO');
  const isHo = cleanName.toUpperCase().includes('H.O') || cleanName.toUpperCase().includes('HO');
  return {
    officeId: cleanId || 'DADABARI_SO',
    postOfficeName: cleanName,
    pincode: pincode || '324009',
    parentOfficeName: isBo ? 'Dadabari S.O. (324009) / Kota H.O.' : 'Kota H.O. (324001)',
    linkedDeliveryOffices: ['Dadabari S.O. (324009)'],
    officeType: isBo ? 'BO' : isHo ? 'HO' : 'SO',
    circle: 'Rajasthan Circle',
    division: 'Kota Division',
    district: 'Kota',
    subDivision: 'Kota West Sub-Division',
  };
}

export function getDefaultColoniesForBeat(beat: string): string[] {
  const b = (beat || '').trim();
  if (b === 'Beat 1' || b === '1') {
    return ['Dadabari Extension', 'Dadabari Sector 1', 'Dadabari Sector 2', 'P&T Colony Dadabari', 'Modi College Area'];
  }
  if (b === 'Beat 2' || b === '2') {
    return ['Keshavpura Sector 7', 'Keshavpura Sector 6', 'Patel Nagar', 'Santoshi Nagar', 'TVS Circle'];
  }
  if (b === 'Beat 3' || b === '3') {
    return ['Basant Vihar Sector A', 'Basant Vihar Sector B', 'CAD Colony'];
  }
  if (b === 'Beat 4' || b === '4') {
    return ['Shastri Nagar', 'Dadabari Main Market'];
  }
  if (b === 'Beat 5' || b === '5') {
    return ['Mahaveer Nagar I', 'Samrat Chowk Area'];
  }
  if (b === 'Beat 6' || b === '6') {
    return ['Keshavpura Sector 4', 'Keshavpura Sector 2', 'Teacher Colony'];
  }
  const numMatch = b.match(/\d+/);
  const n = numMatch ? numMatch[0] : '1';
  return [`Dadabari Beat ${n} Zone`, `Kota Delivery Sector ${n}`];
}

export function getDefaultFixedKmForBeat(beat: string): number {
  const numMatch = (beat || '').match(/\d+/);
  if (!numMatch) return 20;
  const n = parseInt(numMatch[0], 10);
  const kmMap: Record<number, number> = {
    1: 16, 2: 18, 3: 15, 4: 20, 5: 19, 6: 22, 7: 17, 8: 21, 9: 18, 10: 24,
  };
  return kmMap[n] || (14 + (n % 10));
}

function normalizeDesignation(roleOrDesig: string): DesignationType {
  const r = (roleOrDesig || '').toUpperCase();
  if (r.includes('PA') || r.includes('POSTAL ASSISTANT')) return 'PA (Postal Assistant)';
  if (r.includes('GDS') || r.includes('BPM') || r.includes('ABPM')) return 'GDS (BPM / ABPM / Dak Sevak)';
  if (r.includes('POSTMAN') || r.includes('PMAN')) return 'Postman';
  if (r.includes('MTS')) return 'MTS (Multi Tasking Staff)';
  if (r.includes('INSPECTOR') || r.includes('ASP') || r.includes('IP')) return 'Inspector (IP / ASP)';
  if (r.includes('POSTMASTER') || r.includes('SPM')) return 'SPM / Postmaster';
  if (r.includes('SA') || r.includes('SORTING')) return 'Sorting Assistant (SA)';
  if (r.includes('MAIL GUARD')) return 'Mail Guard';
  return roleOrDesig || 'Postman';
}

const INITIAL_PROFILES: StaffProfile[] = [
  {
    id: 'STAFF-MASTER-EKTA',
    employeeId: 'MASTER-ADMIN-01',
    name: 'Ekta Meena',
    email: 'ektamahenmeena@gmail.com',
    password: hashPasswordSync('Admin'),
    hasCustomPassword: true,
    role: 'MASTER_ADMIN',
    designationType: 'Master Admin (Developer / System Architect)',
    contact: '8279275805',
    beat: 'All Beats',
    assignedBeats: ['All Beats'],
    assignedOffice: 'All Divisions / Kota Division (324009)',
    circle: 'Rajasthan Circle',
    division: 'All Divisions',
    headOffice: 'Kota H.O.',
    subOffice: 'All Offices',
    branchOffice: '',
    officePincode: '324009',
    officeAddress: 'Department of Posts, Kota Division Command Center, Rajasthan Circle - 324009',
    deliveryOfficeMapping: 'All Divisions / All Sub-Offices / All Beats',
    assignedColonies: ['All Colonies'],
    fixedKm: 0,
    permissions: {
      ...DEFAULT_ADMIN_PERMISSION,
      canCreateCustomer: true,
      canEditCustomer: true,
      canDeleteCustomer: true,
      canViewAllRecords: true,
      dailyEntryLimit: 0,
      canAssignStaff: true,
      canExportData: true,
      canAccessSettings: true,
      approvalStatus: 'Approved',
      serviceModules: { ...DEFAULT_ADMIN_SERVICE_MODULES },
      allowedBeats: ['All Beats'],
      allowedOffices: ['All Offices'],
      allowedColonies: ['All Colonies'],
    },
    entriesCreatedToday: 0,
    lastEntryDate: new Date().toISOString().split('T')[0],
    totalEntriesCount: 0,
    status: 'Active',
  },
  {
    id: 'STAFF-OWNER-01',
    employeeId: 'OWNER-01',
    name: 'Xpeedo Services Sovereign Owner',
    email: 'owner@xpokart.in',
    password: hashPasswordSync('Owner@123'),
    hasCustomPassword: true,
    role: 'OWNER',
    designationType: 'Marketplace Owner & Director',
    staffScopeType: 'XPEEDO_SERVICES',
    brandId: 'xpeedo-services',
    brandName: 'Xpeedo Services',
    partnerOrganization: 'Xpeedo Services',
    contact: '9460020640',
    beat: 'All Beats',
    assignedBeats: ['All Beats'],
    assignedOffice: 'Xpeedo Services Executive Command (324009)',
    circle: 'Rajasthan Circle',
    division: 'All Divisions',
    headOffice: 'Kota H.O.',
    subOffice: 'All Offices',
    branchOffice: '',
    officePincode: '324009',
    officeAddress: 'Xpeedo Services Executive Command, Dadabari S.O., Kota Division - 324009',
    deliveryOfficeMapping: 'All Divisions / All Sub-Offices / All Beats',
    assignedColonies: ['All Colonies'],
    fixedKm: 0,
    permissions: {
      ...DEFAULT_ADMIN_PERMISSION,
      serviceModules: { ...DEFAULT_ADMIN_SERVICE_MODULES },
    },
    entriesCreatedToday: 0,
    lastEntryDate: new Date().toISOString().split('T')[0],
    totalEntriesCount: 0,
    status: 'Active',
  },
  {
    id: 'STAFF-DEV-01',
    employeeId: 'DEV-01',
    name: 'Lead Systems Developer',
    email: 'dev@xpokart.in',
    password: hashPasswordSync('Dev@123'),
    hasCustomPassword: true,
    role: 'DEVELOPER',
    designationType: 'Lead Systems Architect & Developer',
    staffScopeType: 'XPEEDO_SERVICES',
    brandId: 'xpeedo-services',
    brandName: 'Xpeedo Services',
    partnerOrganization: 'Xpeedo Services',
    contact: '9414170563',
    beat: 'All Beats',
    assignedBeats: ['All Beats'],
    assignedOffice: 'Xpeedo Services Engineering Gateway (324009)',
    circle: 'Rajasthan Circle',
    division: 'All Divisions',
    headOffice: 'Kota H.O.',
    subOffice: 'All Offices',
    branchOffice: '',
    officePincode: '324009',
    officeAddress: 'Xpeedo Services Engineering Lab, Dadabari S.O., Kota Division - 324009',
    deliveryOfficeMapping: 'All Divisions / All Sub-Offices / All Beats',
    assignedColonies: ['All Colonies'],
    fixedKm: 0,
    permissions: {
      ...DEFAULT_ADMIN_PERMISSION,
      serviceModules: { ...DEFAULT_ADMIN_SERVICE_MODULES },
    },
    entriesCreatedToday: 0,
    lastEntryDate: new Date().toISOString().split('T')[0],
    totalEntriesCount: 0,
    status: 'Active',
  },
  {
    id: 'STAFF-50510312',
    employeeId: '50510312',
    staffSlotNumber: 1,
    assignedBrands: ['india-post'],
    brandId: 'india-post',
    partnerOrganization: 'India Post',
    name: 'Muskan Sharma',
    email: 'muskan.sharma@indiapost.gov.in',
    password: hashPasswordSync(DEFAULT_STAFF_FALLBACK_PASSWORD),
    hasCustomPassword: false,
    role: 'POSTMAN',
    designationType: 'GDS (BPM / ABPM / Dak Sevak)',
    contact: '9521279186',
    beat: 'Beat 1',
    assignedBeats: ['Beat 1'],
    assignedOffice: 'Dadabari S.O. (324009)',
    circle: 'Rajasthan Circle',
    division: 'Kota Division',
    headOffice: 'Kota H.O.',
    subOffice: 'Dadabari S.O.',
    branchOffice: '',
    officePincode: '324009',
    officeAddress: 'Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - 324009',
    deliveryOfficeMapping: 'Dadabari S.O. (324009)',
    assignedColonies: ['Dadabari Extension', 'Dadabari Sector 1', 'Dadabari Sector 2', 'P&T Colony Dadabari'],
    fixedKm: 16,
    permissions: {
      ...DEFAULT_STAFF_PERMISSION,
      dailyEntryLimit: 40,
      allowedBeats: ['Beat 1'],
      allowedOffices: ['Dadabari S.O.'],
      allowedColonies: ['Dadabari Extension', 'Dadabari Sector 1', 'Dadabari Sector 2', 'P&T Colony Dadabari'],
    },
    entriesCreatedToday: 0,
    lastEntryDate: new Date().toISOString().split('T')[0],
    totalEntriesCount: 18,
    status: 'Active',
  },
  {
    id: 'STAFF-50457421',
    employeeId: '50457421',
    staffSlotNumber: 2,
    assignedBrands: ['india-post'],
    brandId: 'india-post',
    partnerOrganization: 'India Post',
    name: 'Mahendra Kumar Meena',
    email: 'mahen.comtech@gmail.com',
    password: hashPasswordSync(DEFAULT_STAFF_FALLBACK_PASSWORD),
    hasCustomPassword: false,
    role: 'POSTMAN',
    designationType: 'Postman',
    contact: '8769706002',
    beat: 'Beat 2',
    assignedBeats: ['Beat 2'],
    assignedOffice: 'Dadabari S.O. (324009)',
    circle: 'Rajasthan Circle',
    division: 'Kota Division',
    headOffice: 'Kota H.O.',
    subOffice: 'Dadabari S.O.',
    branchOffice: '',
    officePincode: '324009',
    officeAddress: 'Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - 324009',
    deliveryOfficeMapping: 'Dadabari S.O. (324009)',
    assignedColonies: ['Keshavpura Sector 7', 'Keshavpura Sector 6', 'Patel Nagar', 'Santoshi Nagar', 'TVS Circle'],
    fixedKm: 30,
    permissions: {
      ...DEFAULT_STAFF_PERMISSION,
      canCreateCustomer: true,
      canEditCustomer: true,
      canDeleteCustomer: false,
      canViewAllRecords: false,
      dailyEntryLimit: 50,
      canAssignStaff: false,
      canExportData: true,
      canAccessSettings: false,
      approvalStatus: 'Approved',
      serviceModules: {
        crmSection: true,
        specialBillsSection: false,
        learningSection: true,
        departmentalLearningSection: true,
        schemeLeadsSection: true,
        productSchemeLeadSection: true,
        contentSharingSection: false,
        contentSharingDispatchSection: false,
      },
      allowedBeats: ['Beat 2'],
      allowedOffices: ['Dadabari S.O.'],
      allowedColonies: ['Keshavpura Sector 7', 'Keshavpura Sector 6', 'Patel Nagar', 'Santoshi Nagar', 'TVS Circle'],
    },
    entriesCreatedToday: 0,
    lastEntryDate: new Date().toISOString().split('T')[0],
    totalEntriesCount: 24,
    status: 'Active',
  },
  {
    id: 'STAFF-10310735',
    employeeId: '10310735',
    staffSlotNumber: 3,
    assignedBrands: ['india-post'],
    brandId: 'india-post',
    partnerOrganization: 'India Post',
    name: 'Govind Prasad',
    email: 'govind.prasad@indiapost.gov.in',
    password: hashPasswordSync(DEFAULT_STAFF_FALLBACK_PASSWORD),
    hasCustomPassword: false,
    role: 'POSTMAN',
    designationType: 'Postman',
    contact: '7877352816',
    beat: 'Beat 4',
    assignedBeats: ['Beat 4'],
    assignedOffice: 'Dadabari S.O. (324009)',
    circle: 'Rajasthan Circle',
    division: 'Kota Division',
    headOffice: 'Kota H.O.',
    subOffice: 'Dadabari S.O.',
    branchOffice: '',
    officePincode: '324009',
    officeAddress: 'Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - 324009',
    deliveryOfficeMapping: 'Dadabari S.O. (324009)',
    assignedColonies: ['Shastri Nagar', 'Dadabari Main Market'],
    fixedKm: 20,
    permissions: {
      ...DEFAULT_STAFF_PERMISSION,
      dailyEntryLimit: 30,
      allowedBeats: ['Beat 4'],
      allowedOffices: ['Dadabari S.O.'],
      allowedColonies: ['Shastri Nagar', 'Dadabari Main Market'],
    },
    entriesCreatedToday: 0,
    lastEntryDate: new Date().toISOString().split('T')[0],
    totalEntriesCount: 12,
    status: 'Active',
  },
  {
    id: 'STAFF-50507003',
    employeeId: '50507003',
    staffSlotNumber: 4,
    assignedBrands: ['india-post'],
    brandId: 'india-post',
    partnerOrganization: 'India Post',
    name: 'Priyanshu Trivedi',
    email: 'priyanshu.trivedi@indiapost.gov.in',
    password: hashPasswordSync(DEFAULT_STAFF_FALLBACK_PASSWORD),
    hasCustomPassword: false,
    role: 'POSTMAN',
    designationType: 'GDS (BPM / ABPM / Dak Sevak)',
    contact: '9928486812',
    beat: 'Beat 17',
    assignedBeats: ['Beat 17'],
    assignedOffice: 'Dadabari S.O. (324009)',
    circle: 'Rajasthan Circle',
    division: 'Kota Division',
    headOffice: 'Kota H.O.',
    subOffice: 'Dadabari S.O.',
    branchOffice: '',
    officePincode: '324009',
    officeAddress: 'Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - 324009',
    deliveryOfficeMapping: 'Dadabari S.O. (324009)',
    assignedColonies: ['Anantpura', 'Large Scale Industrial Area', 'NH-52 Link', 'Shastri Nagar Sector 2 & 3', 'Telecom Staff Colony'],
    fixedKm: 28,
    permissions: {
      ...DEFAULT_STAFF_PERMISSION,
      dailyEntryLimit: 300,
      allowedBeats: ['Beat 17'],
      allowedOffices: ['Dadabari S.O.'],
      allowedColonies: ['Anantpura', 'Large Scale Industrial Area', 'NH-52 Link', 'Shastri Nagar Sector 2 & 3', 'Telecom Staff Colony'],
    },
    entriesCreatedToday: 0,
    lastEntryDate: new Date().toISOString().split('T')[0],
    totalEntriesCount: 25,
    status: 'Active',
  },
  {
    id: 'STAFF-EC-SPM-01',
    employeeId: 'CSI-10448901',
    staffSlotNumber: 5,
    assignedBrands: ['india-post'],
    brandId: 'india-post',
    partnerOrganization: 'India Post',
    name: 'Vikram Singh Hada',
    email: 'vikram.hada@indiapost.gov.in',
    password: hashPasswordSync(DEFAULT_STAFF_FALLBACK_PASSWORD),
    hasCustomPassword: false,
    role: 'POSTMASTER',
    designationType: 'SPM / Postmaster',
    contact: '9414188210',
    beat: 'Beat EC-1',
    assignedBeats: ['Beat EC-1'],
    assignedOffice: 'Engineering College S.O. (324010)',
    officeId: 'ENG_COLLEGE_SO',
    postOfficeName: 'Engineering College S.O.',
    circle: 'Rajasthan Circle',
    division: 'Kota Division',
    headOffice: 'Kota H.O.',
    subOffice: 'Engineering College S.O.',
    branchOffice: '',
    officePincode: '324010',
    officeAddress: 'Engineering College Sub-Post Office, RTU Campus Road, Rawatbhata Road, Kota - 324010',
    deliveryOfficeMapping: 'Engineering College S.O. (324010) / Dadabari S.O. (324009)',
    assignedColonies: ['RTU Campus', 'Srinathpuram Sector A & B', 'Akelgarh', 'Talwandi Sector 1-4'],
    fixedKm: 20,
    permissions: {
      ...DEFAULT_STAFF_PERMISSION,
      dailyEntryLimit: 60,
      allowedBeats: ['Beat EC-1'],
      allowedOffices: ['Engineering College S.O.'],
      allowedColonies: ['RTU Campus', 'Srinathpuram Sector A & B', 'Akelgarh', 'Talwandi Sector 1-4'],
    },
    entriesCreatedToday: 0,
    lastEntryDate: new Date().toISOString().split('T')[0],
    totalEntriesCount: 19,
    status: 'Active',
  },
];

class StaffPermissionService {
  private profiles: StaffProfile[] = [];
  private directoryStaff: Staff[] = [];
  private colonyBeatMappings: ColonyBeatMapping[] = [];
  private customOffices: DynamicOfficeRecord[] = [];
  private managedBeatOverrides: ManagedBeatOverrideRecord[] = [];
  private listeners: (() => void)[] = [];
  private isNotifying: boolean = false;
  private cachedAutoOffices: DynamicOfficeRecord[] | null = null;
  private cachedActiveSession: StaffProfile | null | undefined = undefined;
  private archivedOfficeKeys: string[] = [];

  constructor() {
    this.loadAll();
  }

  private getConsolidatedMatrixStaffSeeds(): Staff[] {
    const seeds: Staff[] = [];
    for (const entry of CONSOLIDATED_BEAT_MATRIX) {
      const contact10 = (entry.assignedPostmanContact || '').replace(/\D/g, '').slice(-10);
      const isVikram =
        contact10 === '9414188210' ||
        entry.staffId === 'STAFF-ENG-01' ||
        entry.assignedPostmanName.toLowerCase().includes('vikram singh hada');
      const staffId = isVikram
        ? 'STAFF-EC-SPM-01'
        : entry.staffId || `STAFF-${entry.id}`;
      const empId = isVikram
        ? 'CSI-10448901'
        : staffId.replace(/^STAFF-/, '');
      const desig = isVikram
        ? 'SPM / Postmaster'
        : (entry.staffRole || '').toUpperCase().includes('GDS')
        ? 'GDS (BPM / ABPM / Dak Sevak)'
        : 'Postman';
      const meta = resolveOfficeMetadata(entry.deliveryOffice || entry.officeName, '', entry.pincode);
      seeds.push({
        id: staffId,
        employeeId: empId,
        name: isVikram ? 'Vikram Singh Hada' : entry.assignedPostmanName,
        role: isVikram ? 'POSTMASTER' : entry.staffRole || 'POSTMAN',
        designationType: desig,
        beat: entry.beatNumber,
        assignedBeat: entry.beatNumber,
        assignedBeats: [entry.beatNumber],
        contact: entry.assignedPostmanContact || '9414000000',
        email: isVikram
          ? 'vikram.hada@indiapost.gov.in'
          : empId === '50457421' || contact10 === '8769706002'
          ? 'mahen.comtech@gmail.com'
          : `${entry.assignedPostmanName.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.')}@indiapost.gov.in`,
        officeId: meta.officeId,
        circle: 'Rajasthan Circle',
        division: entry.division || 'Kota Division',
        district: 'Kota',
        headOffice: entry.headOffice || 'Kota H.O.',
        subOffice: entry.deliveryOffice || entry.officeName || 'Dadabari S.O.',
        subOrBranchOffice: entry.deliveryOffice || entry.officeName || 'Dadabari S.O.',
        postedOfficeName: entry.deliveryOffice || entry.officeName || 'Dadabari S.O.',
        postingType: 'Posted',
        officePincode: entry.pincode || meta.pincode || '324009',
        officeAddress: `${meta.postOfficeName}, ${meta.division} (${entry.pincode || meta.pincode || '324009'})`,
        deliveryOfficeMapping: `${entry.deliveryOffice || entry.officeName} (${entry.pincode}) / ${entry.headOffice || 'Kota H.O.'}`,
        assignedColonies: entry.colonies || [],
        activeAccountsOpened: 64,
        doorstepVisits: 840,
        rating: '4.9/5.0',
        status: 'Active on Duty',
        brandId: 'india-post',
        brandName: 'India Post',
        partnerOrganization: 'India Post',
        assignedBrands: ['india-post'],
      });
    }
    return seeds;
  }

  private getAllSeedDirectoryStaff(): Staff[] {
    const merged: Staff[] = [];
    const seenKeys = new Set<string>();
    const addUnique = (raw: Staff) => {
      const enriched = this.enrichDirectoryStaff(raw);
      const idKey = (enriched.id || '').toUpperCase();
      const empKey = (enriched.employeeId || '').toUpperCase();
      const phone10 = (enriched.contact || '').replace(/\D/g, '').slice(-10);
      const isDuplicate =
        (idKey && seenKeys.has(`ID:${idKey}`)) ||
        (empKey && seenKeys.has(`EMP:${empKey}`)) ||
        (phone10.length === 10 && seenKeys.has(`PH:${phone10}`));
      if (isDuplicate) return;
      if (idKey) seenKeys.add(`ID:${idKey}`);
      if (empKey) seenKeys.add(`EMP:${empKey}`);
      if (phone10.length === 10) seenKeys.add(`PH:${phone10}`);
      merged.push(enriched);
    };

    // Priority: all 46 CONSOLIDATED_BEAT_MATRIX staff, then UPDATED_STAFF_LIST (includes 14 BO staff), then Talwandi SO ext staff
    for (const s of this.getConsolidatedMatrixStaffSeeds()) addUnique(s);
    for (const s of UPDATED_STAFF_LIST) addUnique(s);
    for (const s of TALWANDI_EXT_SEED_STAFF) addUnique(s);
    return merged;
  }

  private loadAll() {
    // 1. Load Directory Staff & reconcile all canonical seeds (CONSOLIDATED_BEAT_MATRIX 46 + UPDATED_STAFF_LIST + Talwandi SO)
    const canonicalSeeds = this.getAllSeedDirectoryStaff();
    try {
      const storedDir = localStorage.getItem(DIRECTORY_STORAGE_KEY);
      if (storedDir) {
        const parsedDir = JSON.parse(storedDir) as Staff[];
        this.directoryStaff = Array.isArray(parsedDir) ? parsedDir : [];
        let dirChanged = false;

        for (const enrichedSeed of canonicalSeeds) {
          const seedEmpId = (enrichedSeed.employeeId || enrichedSeed.id.replace(/^STAFF-/, '')).toUpperCase();
          const seedPhone10 = (enrichedSeed.contact || '').replace(/\D/g, '').slice(-10);
          const idx = this.directoryStaff.findIndex(s => {
            const sPhone10 = (s.contact || '').replace(/\D/g, '').slice(-10);
            return (
              s.id.toUpperCase() === enrichedSeed.id.toUpperCase() ||
              (s.employeeId && s.employeeId.toUpperCase() === seedEmpId) ||
              (seedPhone10.length === 10 && sPhone10 === seedPhone10)
            );
          });
          if (idx === -1) {
            this.directoryStaff.push(enrichedSeed);
            dirChanged = true;
          } else {
            const cur = this.directoryStaff[idx];
            const needsEmailSync = !cur.email || cur.email === 'N/A' || (seedEmpId === '50457421' && cur.email !== 'mahen.comtech@gmail.com');
            const needsEmpIdSync = !cur.employeeId;
            const needsOfficeSync = !cur.officePincode || !cur.subOffice;
            if (needsEmailSync || needsEmpIdSync || needsOfficeSync) {
              this.directoryStaff[idx] = {
                ...cur,
                employeeId: cur.employeeId || enrichedSeed.employeeId,
                email: needsEmailSync ? enrichedSeed.email : cur.email,
                contact: cur.contact || enrichedSeed.contact,
                beat: cur.beat || enrichedSeed.beat,
                subOffice: cur.subOffice || enrichedSeed.subOffice,
                officePincode: cur.officePincode || enrichedSeed.officePincode,
                officeId: cur.officeId || enrichedSeed.officeId,
              };
              dirChanged = true;
            }
          }
        }

        // Remove any legacy duplicate Vikram Singh Hada record if STAFF-ENG-01 was previously seeded separately
        const vikramCount = this.directoryStaff.filter(
          s => (s.contact || '').replace(/\D/g, '').slice(-10) === '9414188210'
        ).length;
        if (vikramCount > 1) {
          let keptOne = false;
          this.directoryStaff = this.directoryStaff.filter(s => {
            if ((s.contact || '').replace(/\D/g, '').slice(-10) === '9414188210') {
              if (!keptOne && (s.id === 'STAFF-EC-SPM-01' || s.employeeId === 'CSI-10448901')) {
                keptOne = true;
                return true;
              }
              return false;
            }
            return true;
          });
          dirChanged = true;
        }

        // Transfer any operational directory staff previously linked to XPOKART into India Post
        for (let i = 0; i < this.directoryStaff.length; i++) {
          const cur = this.directoryStaff[i];
          const bNorm = (cur.brandId || '').trim().toLowerCase();
          const orgNorm = (cur.partnerOrganization || '').trim().toLowerCase();
          const hasXpokartBrand = (cur.assignedBrands || []).some((b) =>
            ['xpokart', 'brd-xpkrt-01'].includes(b.trim().toLowerCase())
          );
          if (
            bNorm === 'xpokart' ||
            bNorm === 'brd-xpkrt-01' ||
            orgNorm.includes('xpokart') ||
            hasXpokartBrand
          ) {
            const cleanedAssigned = (cur.assignedBrands || [])
              .map((b) => b.trim().toLowerCase().replace(/_/g, '-'))
              .filter((b) => b && b !== 'xpokart' && b !== 'brd-xpkrt-01');
            if (!cleanedAssigned.includes('india-post')) cleanedAssigned.unshift('india-post');
            this.directoryStaff[i] = {
              ...cur,
              brandId: 'india-post',
              brandName: 'India Post',
              partnerOrganization: 'India Post',
              staffScopeType: 'BRAND_OPERATIONAL',
              assignedBrands: cleanedAssigned,
            };
            dirChanged = true;
          }
        }

        if (dirChanged) {
          this.saveDirectoryStaff(false);
        }
      } else {
        this.directoryStaff = canonicalSeeds;
        this.saveDirectoryStaff(false);
      }
    } catch (e) {
      this.directoryStaff = canonicalSeeds;
    }

    // 1b. Load Managed Beat Overrides
    try {
      const storedManagedBeats = localStorage.getItem(MANAGED_BEATS_STORAGE_KEY);
      if (storedManagedBeats) {
        const parsed = JSON.parse(storedManagedBeats);
        this.managedBeatOverrides = Array.isArray(parsed) ? parsed : [];
      } else {
        this.managedBeatOverrides = [];
      }
    } catch {
      this.managedBeatOverrides = [];
    }

    // 2. Load Colony-Beat Mappings
    try {
      const storedMappings = localStorage.getItem(COLONY_MAP_STORAGE_KEY);
      if (storedMappings) {
        this.colonyBeatMappings = JSON.parse(storedMappings).map((m: any) => this.normalizeColonyMapping(m));
      } else {
        this.colonyBeatMappings = INITIAL_COLONY_BEAT_MAPPINGS.map(m => this.normalizeColonyMapping(m));
        this.saveColonyMappings(false);
      }
    } catch (e) {
      this.colonyBeatMappings = INITIAL_COLONY_BEAT_MAPPINGS.map(m => this.normalizeColonyMapping(m));
    }

    // 3. Load Custom Office Overrides & Purge Duplicates (ID + canonical Name+PIN fix)
    try {
      const storedOffices = localStorage.getItem(CUSTOM_OFFICE_STORAGE_KEY);
      if (storedOffices) {
        const parsed = JSON.parse(storedOffices);
        const uniqueMap = new Map<string, DynamicOfficeRecord>();
        const seenIds = new Set<string>();
        if (Array.isArray(parsed)) {
          for (const co of parsed) {
            const officeIdKey = (co.id || '').trim().toUpperCase();
            const officeName = (co.officeName || co.subOffice || '')
              .replace(/\([^)]*\)/g, '')
              .replace(/\./g, '')
              .replace(/\s+/g, ' ')
              .trim()
              .toLowerCase();
            const pincode = (co.pincode || '').trim();
            const key = `${officeName}_${pincode}`;
            if (officeIdKey && seenIds.has(officeIdKey)) {
              continue;
            }
            if (officeIdKey) seenIds.add(officeIdKey);
            uniqueMap.set(key, co);
          }
        }
        this.customOffices = Array.from(uniqueMap.values());
      } else {
        this.customOffices = [];
      }
    } catch (e) {
      this.customOffices = [];
    }

    // 3b. Load Archived Office IDs/Keys
    try {
      const storedArchived = localStorage.getItem(ARCHIVED_OFFICE_STORAGE_KEY);
      if (storedArchived) {
        this.archivedOfficeKeys = JSON.parse(storedArchived);
      } else {
        this.archivedOfficeKeys = [];
      }
    } catch (e) {
      this.archivedOfficeKeys = [];
    }

    // 4. Load RBAC Staff Profiles
    this.loadProfiles();
  }

  private enrichDirectoryStaff(s: Staff): Staff {
    const empId = s.employeeId || s.id.replace(/^STAFF-/, '');
    const colonies = s.assignedColonies?.length ? s.assignedColonies : getDefaultColoniesForBeat(s.beat);
    const circle = s.circle?.includes('Circle') ? s.circle : `${s.circle || 'Rajasthan'} Circle`;
    const division = s.division?.includes('Division') ? s.division : `${s.division || 'Kota'} Division`;
    const subOffice = s.subOffice || s.subOrBranchOffice || 'Dadabari S.O.';
    const isMahendra = empId === '50457421' || s.contact === '8769706002';
    return {
      ...s,
      employeeId: empId,
      designationType: s.designationType || normalizeDesignation(s.role),
      circle,
      division,
      headOffice: s.headOffice || 'Kota H.O.',
      subOffice,
      branchOffice: s.branchOffice || '',
      subOrBranchOffice: subOffice,
      officePincode: s.officePincode || '324009',
      officeAddress:
        s.officeAddress ||
        `${subOffice}, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - 324009`,
      assignedBeats: s.assignedBeats?.length ? s.assignedBeats : [s.beat],
      deliveryOfficeMapping: s.deliveryOfficeMapping || `${subOffice} (324009) / ${s.headOffice || 'Kota H.O.'}`,
      assignedColonies: colonies,
      email: isMahendra
        ? 'mahen.comtech@gmail.com'
        : s.email && s.email !== 'N/A'
        ? s.email
        : `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@indiapost.gov.in`,
    };
  }

  private isGovernanceProfileRecord(p: Partial<StaffProfile>): boolean {
    const email = (p.email || '').trim().toLowerCase();
    const empId = (p.employeeId || '').trim().toUpperCase();
    const id = (p.id || '').trim().toUpperCase();
    const role = (p.role || '').trim().toUpperCase();
    return (
      email === 'ektamahenmeena@gmail.com' ||
      email === 'owner@xpokart.in' ||
      email === 'dev@xpokart.in' ||
      empId === 'MASTER-ADMIN-01' ||
      empId === 'MASTER_ADMIN_EKTA_01' ||
      empId === 'OWNER-01' ||
      empId === 'OWNER_ROOT_01' ||
      empId === 'DEV-01' ||
      id === 'STAFF-MASTER-EKTA' ||
      id === 'STAFF-OWNER-01' ||
      id === 'STAFF-DEV-01' ||
      role === 'MASTER_ADMIN' ||
      role === 'OWNER' ||
      role === 'DEVELOPER' ||
      role === 'SUPER_ADMIN'
    );
  }

  private loadProfiles() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.profiles = JSON.parse(stored);
      } else {
        this.profiles = [...INITIAL_PROFILES];
      }

      // Remove legacy synthetic/viewer profiles so governance stays clean and operational staff stays capped at Staff 1-5
      this.profiles = this.profiles.filter(
        p => p.id !== 'STAFF-ADMIN-01' && p.id !== 'STAFF-EKTA-01' && p.id !== 'STAFF-VIEWER-01'
      );

      // Ensure all seeded governance & 5 canonical operational staff profiles exist and stay synchronized
      for (const initP of INITIAL_PROFILES) {
        const idx = this.profiles.findIndex(
          p => p.email.toLowerCase() === initP.email.toLowerCase() || (initP.employeeId && p.employeeId === initP.employeeId)
        );
        if (idx === -1) {
          this.profiles.push(initP);
        } else if (initP.email.toLowerCase() === 'ektamahenmeena@gmail.com') {
          this.profiles[idx] = { ...initP };
        } else if (
          initP.employeeId === '50457421' ||
          initP.email.toLowerCase() === 'mahen.comtech@gmail.com'
        ) {
          const existingCustomPass = this.profiles[idx]?.hasCustomPassword ? this.profiles[idx].password : undefined;
          const preservedBrands = this.profiles[idx]?.assignedBrands?.length
            ? this.profiles[idx].assignedBrands
            : initP.assignedBrands;
          this.profiles[idx] = {
            ...initP,
            assignedBrands: preservedBrands,
            staffSlotNumber: initP.staffSlotNumber,
            password: existingCustomPass || initP.password,
            hasCustomPassword: Boolean(this.profiles[idx]?.hasCustomPassword),
          };
        } else {
          if (!this.profiles[idx]?.hasCustomPassword) {
            this.profiles[idx].password = initP.password;
            this.profiles[idx].hasCustomPassword = Boolean(initP.hasCustomPassword);
          }
          if (!this.profiles[idx].staffSlotNumber && initP.staffSlotNumber) {
            this.profiles[idx].staffSlotNumber = initP.staffSlotNumber;
          }
          if (!this.profiles[idx].assignedBrands?.length && initP.assignedBrands?.length) {
            this.profiles[idx].assignedBrands = [...initP.assignedBrands];
          }
        }
      }

      // Normalize, deduplicate by email/employeeId/contact, and hydrate ALL canonical India Post operational staff (no 5-staff cap)
      const today = new Date().toISOString().split('T')[0];
      const seenKeys = new Set<string>();
      const seenPhones = new Set<string>();
      const governanceList: StaffProfile[] = [];
      const operationalList: StaffProfile[] = [];

      const canonicalIdsOrder = new Map<string, number>([
        ['50510312', 1],
        ['50457421', 2],
        ['10310735', 3],
        ['50507003', 4],
        ['CSI-10448901', 5],
      ]);

      // Hydrate any canonical directory staff missing from this.profiles (all 46 matrix + 14 BO + 2 Talwandi)
      for (const dirStaff of this.directoryStaff) {
        if (this.isElevatedOrSyntheticStaffRecord(dirStaff)) continue;
        const gen = this.createProfileFromDirectoryStaff(dirStaff);
        const genPhone = (gen.contact || '').replace(/\D/g, '').slice(-10);
        const existingMatch = this.profiles.find(p => {
          const pPhone = (p.contact || '').replace(/\D/g, '').slice(-10);
          return (
            p.email.toLowerCase() === gen.email.toLowerCase() ||
            (gen.employeeId && (p.employeeId || '').toUpperCase() === gen.employeeId.toUpperCase()) ||
            p.id.toUpperCase() === gen.id.toUpperCase() ||
            (genPhone.length === 10 && pPhone === genPhone)
          );
        });
        if (!existingMatch) {
          this.profiles.push(gen);
        }
      }

      for (const rawP of this.profiles) {
        const normP = this.normalizeProfile(rawP);
        if (normP.lastEntryDate !== today) {
          normP.entriesCreatedToday = 0;
          normP.lastEntryDate = today;
        }
        // Clean legacy Vikram Singh Hada display suffix while keeping single canonical ID
        if (normP.id === 'STAFF-EC-SPM-01' || normP.employeeId === 'CSI-10448901') {
          normP.name = 'Vikram Singh Hada';
        }
        const key = (normP.employeeId || normP.email || normP.id).toLowerCase();
        const phone10 = (normP.contact || '').replace(/\D/g, '').slice(-10);
        if (seenKeys.has(key) || (phone10.length === 10 && seenPhones.has(phone10) && !this.isGovernanceProfileRecord(normP))) {
          continue;
        }
        seenKeys.add(key);
        if (normP.email) seenKeys.add(normP.email.toLowerCase());
        if (phone10.length === 10 && !this.isGovernanceProfileRecord(normP)) seenPhones.add(phone10);

        if (this.isGovernanceProfileRecord(normP)) {
          governanceList.push({
            ...normP,
            staffScopeType: 'XPEEDO_SERVICES',
            brandId: 'xpeedo-services',
            brandName: 'Xpeedo Services',
            partnerOrganization: 'Xpeedo Services',
          });
        } else {
          const slotFromSeed = canonicalIdsOrder.get((normP.employeeId || '').toUpperCase());
          const rawAssigned = normP.assignedBrands?.length
            ? normP.assignedBrands.map(b => b.trim().toLowerCase().replace(/_/g, '-')).filter(Boolean)
            : [((normP.brandId || 'india-post').trim().toLowerCase().replace(/_/g, '-'))];
          const cleanedAssigned = Array.from(
            new Set(
              rawAssigned
                .map(b => (b === 'xpokart' || b === 'brd-xpkrt-01' ? 'india-post' : b))
                .filter(Boolean)
            )
          );
          if (cleanedAssigned.length === 0) cleanedAssigned.push('india-post');
          const rawPrimaryBrand = (normP.brandId || '').trim().toLowerCase().replace(/_/g, '-');
          const safeBrandId =
            !rawPrimaryBrand || rawPrimaryBrand === 'xpokart' || rawPrimaryBrand === 'brd-xpkrt-01'
              ? cleanedAssigned[0] || 'india-post'
              : rawPrimaryBrand;
          const safeOrg =
            (normP.partnerOrganization || '').toLowerCase().includes('xpokart')
              ? 'India Post'
              : normP.partnerOrganization || (safeBrandId === 'india-post' ? 'India Post' : normP.partnerOrganization);
          operationalList.push({
            ...normP,
            staffSlotNumber: (normP.staffSlotNumber || slotFromSeed) as StaffProfile['staffSlotNumber'],
            assignedBrands: cleanedAssigned,
            brandId: safeBrandId,
            partnerOrganization: safeOrg,
            staffScopeType: 'BRAND_OPERATIONAL',
          });
        }
      }

      // Keep top 5 priority quick-slots ordered first, preserving ALL canonical operational staff (no slice cap)
      operationalList.sort((a, b) => (a.staffSlotNumber || 999) - (b.staffSlotNumber || 999));
      const allOperational = operationalList.map((p, idx) => ({
        ...p,
        staffSlotNumber:
          p.staffSlotNumber && p.staffSlotNumber >= 1 && p.staffSlotNumber <= 5
            ? p.staffSlotNumber
            : idx < 5
            ? ((idx + 1) as 1 | 2 | 3 | 4 | 5)
            : undefined,
      }));

      this.profiles = [...governanceList, ...allOperational];
      this.saveProfiles(false);
    } catch (e) {
      console.warn('Error loading staff profiles:', e);
      this.profiles = [...INITIAL_PROFILES];
    }
  }

  private createProfileFromDirectoryStaff(s: Staff): StaffProfile {
    const isMahendraBeat2 =
      s.employeeId === '50457421' ||
      s.id === 'STAFF-50457421' ||
      s.contact === '8769706002' ||
      s.name.toLowerCase().includes('mahendra kumar meena');
    const isVikramHada =
      s.employeeId === 'CSI-10448901' ||
      s.id === 'STAFF-EC-SPM-01' ||
      s.id === 'STAFF-ENG-01' ||
      (s.contact || '').replace(/\D/g, '').slice(-10) === '9414188210';
    const email = isMahendraBeat2
      ? 'mahen.comtech@gmail.com'
      : isVikramHada
      ? 'vikram.hada@indiapost.gov.in'
      : s.email && s.email !== 'N/A'
      ? s.email.toLowerCase()
      : `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.')}@indiapost.gov.in`;
    const roleUpper = (s.role || '').toUpperCase();
    const derivedRole: UserRole = isVikramHada
      ? 'POSTMASTER'
      : roleUpper.includes('GDS')
      ? 'GDS'
      : roleUpper === 'BPM'
      ? 'BPM'
      : roleUpper === 'ABPM'
      ? 'ABPM'
      : 'POSTMAN';
    const subOff = s.subOffice || s.subOrBranchOffice || 'Dadabari S.O.';
    const pin = s.officePincode || '324009';
    const meta = resolveOfficeMetadata(subOff, s.branchOffice, pin);
    const beatVal = isMahendraBeat2 ? 'Beat 2' : s.beat || 'Beat 1';

    return {
      id: isVikramHada ? 'STAFF-EC-SPM-01' : s.id,
      employeeId: isVikramHada ? 'CSI-10448901' : s.employeeId || s.id.replace(/^STAFF-/, ''),
      name: isVikramHada ? 'Vikram Singh Hada' : s.name,
      email,
      password: hashPasswordSync(DEFAULT_STAFF_FALLBACK_PASSWORD),
      hasCustomPassword: false,
      mustChangePassword: false,
      role: derivedRole,
      designationType: isMahendraBeat2
        ? 'Postman'
        : isVikramHada
        ? 'SPM / Postmaster'
        : s.designationType || normalizeDesignation(s.role),
      postCategory: isVikramHada
        ? 'Supervisory & Division'
        : this.deriveIndiaPostDutyCategory(s.designationType || s.role || derivedRole),
      contact: s.contact,
      beat: beatVal,
      assignedBeats: isMahendraBeat2 ? ['Beat 2'] : s.assignedBeats || [beatVal],
      officeId: s.officeId || meta.officeId,
      postOfficeName: s.postOfficeName || meta.postOfficeName,
      assignedOffice: `${subOff} (${pin})`,
      circle: s.circle || 'Rajasthan Circle',
      division: s.division || 'Kota Division',
      headOffice: s.headOffice || 'Kota H.O.',
      subOffice: subOff,
      branchOffice: s.branchOffice || '',
      officePincode: pin,
      officeAddress: s.officeAddress || `${meta.postOfficeName}, ${meta.division} (${pin})`,
      deliveryOfficeMapping: s.deliveryOfficeMapping || `${subOff} (${pin}) / ${s.headOffice || 'Kota H.O.'}`,
      assignedColonies: s.assignedColonies?.length ? s.assignedColonies : getDefaultColoniesForBeat(beatVal),
      fixedKm: isMahendraBeat2 ? 30 : getDefaultFixedKmForBeat(beatVal),
      brandId: s.brandId && s.brandId !== 'xpokart' ? s.brandId : 'india-post',
      partnerOrganization: s.partnerOrganization && !s.partnerOrganization.toLowerCase().includes('xpokart') ? s.partnerOrganization : 'India Post',
      assignedBrands: s.assignedBrands?.length ? s.assignedBrands.filter(b => b !== 'xpokart') : ['india-post'],
      staffScopeType: 'BRAND_OPERATIONAL',
      permissions: {
        ...DEFAULT_STAFF_PERMISSION,
        canCreateCustomer: true,
        canEditCustomer: true,
        canDeleteCustomer: false,
        canViewAllRecords: isVikramHada,
        canAssignStaff: false,
        canAccessSettings: false,
        serviceModules: isMahendraBeat2
          ? {
              crmSection: true,
              specialBillsSection: false,
              learningSection: true,
              departmentalLearningSection: true,
              schemeLeadsSection: true,
              productSchemeLeadSection: true,
              contentSharingSection: false,
              contentSharingDispatchSection: false,
            }
          : { ...DEFAULT_STAFF_SERVICE_MODULES },
        allowedBeats: [beatVal],
        allowedOffices: [subOff],
        allowedColonies: s.assignedColonies?.length ? s.assignedColonies : getDefaultColoniesForBeat(beatVal),
      },
      entriesCreatedToday: 0,
      lastEntryDate: new Date().toISOString().split('T')[0],
      totalEntriesCount: 0,
      status: 'Active',
    };
  }

  private normalizeColonyMapping(m: Partial<ColonyBeatMapping> & { id: string; colonyName: string }): ColonyBeatMapping {
    const sec = m.sectorNumber || m.sectorOrPhase || 'All Sectors';
    const pin = m.pincode || m.areaPincode || '324009';
    const office = m.subOrHoOffice || m.subOrHeadOffice || 'Dadabari S.O. / Kota H.O.';
    const beat = m.beatNumber || m.assignedBeatNumber || 'Beat 2';
    const contact = m.assignedPostmanContact || m.assignedPostmanMobile || '8769706002';
    return {
      ...m,
      id: m.id,
      colonyName: m.colonyName,
      sectorNumber: sec,
      sectorOrPhase: sec,
      landmark: m.landmark || '',
      pincode: pin,
      areaPincode: pin,
      subOrHoOffice: office,
      subOrHeadOffice: office,
      branchOffice: m.branchOffice || '',
      beatNumber: beat,
      assignedBeatNumber: beat,
      assignedPostmanName: m.assignedPostmanName || 'Mahendra Kumar Meena',
      assignedPostmanContact: contact,
      assignedPostmanMobile: contact,
      updatedAt: m.updatedAt || new Date().toISOString(),
    };
  }

  private normalizeProfile(p: StaffProfile): StaffProfile {
    const lowerEmail = (p.email || '').toLowerCase();
    const isMaster =
      lowerEmail === 'ektamahenmeena@gmail.com' ||
      p.role === 'MASTER_ADMIN' ||
      p.employeeId?.toUpperCase() === 'MASTER-ADMIN-01';
    const isOwner =
      !isMaster &&
      (lowerEmail === 'owner@xpokart.in' ||
        p.role === 'OWNER' ||
        p.employeeId?.toUpperCase() === 'OWNER-01');
    const isDev =
      !isMaster &&
      !isOwner &&
      (lowerEmail === 'dev@xpokart.in' ||
        p.role === 'DEVELOPER' ||
        p.employeeId?.toUpperCase() === 'DEV-01');
    const isElevated = isMaster || isOwner || isDev;
    const isMahendraBeat2 =
      !isElevated &&
      (lowerEmail === 'mahen.comtech@gmail.com' ||
        p.employeeId === '50457421' ||
        p.id === 'STAFF-50457421');

    const defaultModules = isElevated
      ? DEFAULT_ADMIN_SERVICE_MODULES
      : isMahendraBeat2
      ? {
          crmSection: true,
          specialBillsSection: false,
          learningSection: true,
          departmentalLearningSection: true,
          schemeLeadsSection: true,
          productSchemeLeadSection: true,
          contentSharingSection: false,
          contentSharingDispatchSection: false,
        }
      : p.role === 'VIEWER'
      ? DEFAULT_VIEWER_SERVICE_MODULES
      : DEFAULT_STAFF_SERVICE_MODULES;

    const colonies = p.assignedColonies?.length
      ? p.assignedColonies
      : getDefaultColoniesForBeat(p.beat || 'Beat 2');

    const rawMods = p.permissions?.serviceModules || ({} as Partial<ServiceModulePermissions>);
    const learningVal = isElevated
      ? true
      : rawMods.learningSection ?? rawMods.departmentalLearningSection ?? defaultModules.learningSection;
    const schemeVal = isElevated
      ? true
      : rawMods.schemeLeadsSection ?? rawMods.productSchemeLeadSection ?? defaultModules.schemeLeadsSection;
    const shareVal = isElevated
      ? true
      : isMahendraBeat2
      ? false
      : rawMods.contentSharingSection ?? rawMods.contentSharingDispatchSection ?? defaultModules.contentSharingSection;
    const crmVal = isElevated ? true : rawMods.crmSection ?? defaultModules.crmSection;
    const billsVal = isElevated
      ? true
      : isMahendraBeat2
      ? false
      : rawMods.specialBillsSection ?? defaultModules.specialBillsSection;

    const desig = isMaster
      ? 'Master Admin (System Command)'
      : isOwner
      ? 'Marketplace Owner & Director'
      : isDev
      ? 'Lead Systems Developer'
      : isMahendraBeat2
      ? 'Postman'
      : p.designationType || p.designation || normalizeDesignation(p.role);
    const officeMeta = resolveOfficeMetadata(
      p.postOfficeName || p.branchOffice || p.subOffice || p.assignedOffice,
      p.branchOffice,
      p.officePincode
    );

    const resolvedRole = isMaster
      ? 'MASTER_ADMIN'
      : isOwner
      ? 'OWNER'
      : isDev
      ? 'DEVELOPER'
      : isMahendraBeat2
      ? 'POSTMAN'
      : p.role;

    return {
      ...p,
      name: isMaster
        ? 'Ekta Meena'
        : isOwner
        ? !p.name || p.name === 'XPOKART Sovereign Owner'
          ? 'Xpeedo Services Sovereign Owner'
          : p.name
        : isDev
        ? p.name || 'Lead Systems Developer'
        : isMahendraBeat2
        ? 'Mahendra Kumar Meena'
        : p.name,
      staffScopeType: isElevated ? 'XPEEDO_SERVICES' : 'BRAND_OPERATIONAL',
      brandId: isElevated
        ? 'xpeedo-services'
        : (p.brandId || '').toLowerCase().includes('xpokart')
        ? 'india-post'
        : p.brandId || 'india-post',
      partnerOrganization: isElevated
        ? 'Xpeedo Services'
        : (p.partnerOrganization || '').toLowerCase().includes('xpokart')
        ? 'India Post'
        : p.partnerOrganization,
      contact: isMaster ? '8279275805' : p.contact,
      employeeId: isMaster
        ? 'MASTER-ADMIN-01'
        : isOwner
        ? 'OWNER-01'
        : isDev
        ? 'DEV-01'
        : isMahendraBeat2
        ? '50457421'
        : p.employeeId || p.id.replace(/^STAFF-/, 'CSI-'),
      role: resolvedRole,
      password: isMaster
        ? hashPasswordSync('Admin')
        : isOwner
        ? p.password || hashPasswordSync('Owner@123')
        : isDev
        ? p.password || hashPasswordSync('Dev@123')
        : p.password || hashPasswordSync(DEFAULT_STAFF_FALLBACK_PASSWORD),
      hasCustomPassword: isElevated ? true : Boolean(p.hasCustomPassword),
      designation: desig,
      designationType: desig,
      officeId: p.officeId || officeMeta.officeId,
      postOfficeName: p.postOfficeName || officeMeta.postOfficeName,
      circle: p.circle || 'Rajasthan Circle',
      division: isElevated ? 'All Divisions' : p.division || 'Kota Division',
      headOffice: p.headOffice || 'Kota H.O.',
      subOffice: isElevated ? 'All Offices' : isMahendraBeat2 ? 'Dadabari S.O.' : p.subOffice || 'Dadabari S.O.',
      branchOffice: p.branchOffice || '',
      officePincode: p.officePincode || officeMeta.pincode || '324009',
      officeAddress:
        p.officeAddress ||
        'Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - 324009',
      beat: isElevated ? 'All Beats' : isMahendraBeat2 ? 'Beat 2' : p.beat || 'Beat 2',
      assignedBeats: isElevated ? ['All Beats'] : isMahendraBeat2 ? ['Beat 2'] : p.assignedBeats?.length ? p.assignedBeats : [p.beat || 'Beat 2'],
      deliveryOfficeMapping: isElevated
        ? 'All Divisions / All Sub-Offices / All Beats'
        : p.deliveryOfficeMapping || `${officeMeta.postOfficeName} (${p.officePincode || officeMeta.pincode})`,
      assignedColonies: isElevated ? ['All Colonies'] : colonies,
      fixedKm: isElevated ? 0 : isMahendraBeat2 ? 30 : p.fixedKm || getDefaultFixedKmForBeat(p.beat || 'Beat 2'),
      permissions: {
        ...p.permissions,
        canCreateCustomer: isElevated ? true : p.permissions?.canCreateCustomer ?? true,
        canEditCustomer: isElevated ? true : p.permissions?.canEditCustomer ?? true,
        canDeleteCustomer: isElevated ? true : isMahendraBeat2 ? false : Boolean(p.permissions?.canDeleteCustomer),
        canViewAllRecords: isElevated ? true : isMahendraBeat2 ? false : Boolean(p.permissions?.canViewAllRecords),
        canAssignStaff: isElevated ? true : isMahendraBeat2 ? false : Boolean(p.permissions?.canAssignStaff),
        canAccessSettings: isElevated ? true : isMahendraBeat2 ? false : Boolean(p.permissions?.canAccessSettings),
        approvalStatus: isElevated ? 'Approved' : p.permissions?.approvalStatus || 'Approved',
        serviceModules: {
          crmSection: crmVal,
          specialBillsSection: billsVal,
          learningSection: learningVal,
          departmentalLearningSection: learningVal,
          schemeLeadsSection: schemeVal,
          productSchemeLeadSection: schemeVal,
          contentSharingSection: shareVal,
          contentSharingDispatchSection: shareVal,
        },
        allowedBeats: isElevated
          ? ['All Beats']
          : isMahendraBeat2
          ? ['Beat 2']
          : p.permissions?.allowedBeats?.length
          ? p.permissions.allowedBeats
          : [p.beat || 'Beat 2'],
        allowedOffices: isElevated
          ? ['All Offices']
          : isMahendraBeat2
          ? ['Dadabari S.O.']
          : p.permissions?.allowedOffices?.length
          ? p.permissions.allowedOffices
          : [p.subOffice || 'Dadabari S.O.'],
        allowedColonies: isElevated
          ? ['All Colonies']
          : p.permissions?.allowedColonies?.length
          ? p.permissions.allowedColonies
          : colonies,
      },
    };
  }

  private saveProfiles(notify = true) {
    this.cachedAutoOffices = null;
    this.cachedActiveSession = undefined;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profiles));
    } catch (e) {
      console.warn('Error saving staff profiles:', e);
    }
    if (notify) this.notifyListeners();
  }

  private saveDirectoryStaff(notify = true) {
    this.cachedAutoOffices = null;
    try {
      localStorage.setItem(DIRECTORY_STORAGE_KEY, JSON.stringify(this.directoryStaff));
    } catch (e) {
      console.warn('Error saving directory staff:', e);
    }
    if (notify) this.notifyListeners();
  }

  private saveColonyMappings(notify = true) {
    try {
      localStorage.setItem(COLONY_MAP_STORAGE_KEY, JSON.stringify(this.colonyBeatMappings));
    } catch (e) {
      console.warn('Error saving colony mappings:', e);
    }
    if (notify) this.notifyListeners();
  }

  private saveCustomOffices(notify = true) {
    this.cachedAutoOffices = null;
    try {
      localStorage.setItem(CUSTOM_OFFICE_STORAGE_KEY, JSON.stringify(this.customOffices));
    } catch (e) {
      console.warn('Error saving custom offices:', e);
    }
    if (notify) this.notifyListeners();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    if (this.isNotifying) return;
    this.isNotifying = true;
    try {
      this.listeners.forEach(cb => {
        try {
          cb();
        } catch (err) {
          console.error(err);
        }
      });
    } finally {
      this.isNotifying = false;
    }
  }

  // ================= SUPER ADMIN & GRANULAR MODULE ACCESS HELPERS =================

  public isSuperAdmin(user: StaffProfile | null | undefined): boolean {
    if (!user) return false;
    return (
      user.email?.toLowerCase() === 'ektamahenmeena@gmail.com' ||
      user.employeeId?.toUpperCase() === 'MASTER-ADMIN-01' ||
      user.id === 'STAFF-MASTER-EKTA' ||
      user.role === 'MASTER_ADMIN' ||
      user.role === 'SUPER_ADMIN' ||
      user.role === 'OWNER' ||
      user.role === 'DEVELOPER'
    );
  }

  public isOwnerRole(user: StaffProfile | null | undefined): boolean {
    return Boolean(user && (user.role === 'OWNER' || user.employeeId?.toUpperCase() === 'OWNER-01'));
  }

  public isDeveloperRole(user: StaffProfile | null | undefined): boolean {
    return Boolean(user && (user.role === 'DEVELOPER' || user.employeeId?.toUpperCase() === 'DEV-01'));
  }

  public isDistrictManager(user: StaffProfile | null | undefined): boolean {
    if (!user) return false;
    const role = (user.role || '').toUpperCase();
    const desig = (user.designation || user.designationType || '').toUpperCase();
    return (
      role === 'DISTRICT_MANAGER' ||
      role === 'DISTRICT_INCHARGE' ||
      desig.includes('DISTRICT MANAGER') ||
      desig.includes('DISTRICT INCHARGE')
    );
  }

  public isCategoryManager(user: StaffProfile | null | undefined): boolean {
    if (!user) return false;
    const role = (user.role || '').toUpperCase();
    const desig = (user.designation || user.designationType || '').toUpperCase();
    return role === 'CATEGORY_MANAGER' || desig.includes('CATEGORY MANAGER');
  }

  public getAssignedCategories(user: StaffProfile | null | undefined): string[] {
    if (!user) return [];
    if (
      this.isSuperAdmin(user) ||
      this.isOwnerRole(user) ||
      this.isDeveloperRole(user) ||
      user.role === 'ADMIN'
    ) {
      return [...BUSINESS_SERVICE_CATEGORIES];
    }
    return (user.assignedCategories || []).map(c => c.trim()).filter(Boolean);
  }

  public canManageCategory(user: StaffProfile | null | undefined, category?: string | null): boolean {
    if (!user) return false;
    if (
      this.isSuperAdmin(user) ||
      this.isOwnerRole(user) ||
      this.isDeveloperRole(user) ||
      user.role === 'ADMIN'
    ) {
      return true;
    }
    if (this.isCategoryManager(user)) {
      const assigned = this.getAssignedCategories(user);
      if (assigned.length === 0) return true;
      const target = (category || '').trim().toLowerCase();
      if (!target) return true;
      return assigned.some(
        c =>
          c.toLowerCase() === target ||
          target.includes(c.toLowerCase().split(' ')[0]) ||
          c.toLowerCase().includes(target.split(' ')[0])
      );
    }
    return false;
  }

  public deriveOfficeServiceCategories(office: Partial<DynamicOfficeRecord>): string[] {
    const cats = new Set<string>();
    if (Array.isArray(office.serviceCategories)) {
      office.serviceCategories.forEach(c => {
        if (c && c.trim()) cats.add(c.trim());
      });
    }
    if (office.businessSectionCategory && office.businessSectionCategory.trim()) {
      cats.add(office.businessSectionCategory.trim());
    }
    const hint = `${office.officeVariant || ''} ${office.businessCategory || ''} ${office.businessSectionName || ''} ${office.officeType || ''}`.toLowerCase();
    if (hint.includes('ev')) cats.add('EV Mobility & Batteries');
    if (hint.includes('saas') || hint.includes('software') || hint.includes('crm')) cats.add('Software, CRMs & AI SaaS');
    if (hint.includes('hyperlocal') || hint.includes('dark store') || hint.includes('store')) cats.add('Hyperlocal Retail & FMCG');
    if (hint.includes('solar')) cats.add('Solar & Clean Energy');
    if (hint.includes('travel') || hint.includes('fleet')) cats.add('Travel, Tours & Fleet');
    if (cats.size === 0 || hint.includes('post') || hint.includes('h.o') || hint.includes('s.o') || hint.includes('b.o') || hint.includes('logistics')) {
      cats.add('Postal & Last-Mile Logistics');
    }
    return Array.from(cats);
  }

  public getAssignedDistrict(user: StaffProfile | null | undefined): string | null {
    if (!user) return null;
    if (user.district) return user.district;
    if (user.assignedDistricts && user.assignedDistricts.length > 0) return user.assignedDistricts[0];
    if (user.division) {
      const div = user.division.toUpperCase();
      if (div.includes('KOTA')) return 'Kota';
      if (div.includes('BARAN')) return 'Baran';
      if (div.includes('BUNDI')) return 'Bundi';
      if (div.includes('JHALAWAR')) return 'Jhalawar';
      if (div.includes('TONK')) return 'Tonk';
      if (div.includes('JAIPUR')) return 'Jaipur';
      if (div.includes('JODHPUR')) return 'Jodhpur';
      if (div.includes('UDAIPUR')) return 'Udaipur';
      if (div.includes('AJMER')) return 'Ajmer';
      if (div.includes('BIKANER')) return 'Bikaner';
      if (div.includes('ALWAR')) return 'Alwar';
      if (div.includes('PALI')) return 'Pali';
      if (div.includes('BHILWARA')) return 'Bhilwara';
      if (div.includes('SIKAR')) return 'Sikar';
    }
    return null;
  }

  public canManageOfficeInDistrict(user: StaffProfile | null | undefined, officeDistrict: string): boolean {
    if (!user) return false;
    if (this.isSuperAdmin(user) || this.isOwnerRole(user) || this.isDeveloperRole(user) || user.role === 'ADMIN') {
      return true;
    }
    if (this.isDistrictManager(user)) {
      const userDist = this.getAssignedDistrict(user);
      if (!userDist) return true;
      return userDist.toLowerCase() === (officeDistrict || '').toLowerCase();
    }
    return false;
  }

  public canManageOfficeByScope(
    user: StaffProfile | null | undefined,
    office: Partial<DynamicOfficeRecord>
  ): boolean {
    if (!user) return false;
    if (
      this.isSuperAdmin(user) ||
      this.isOwnerRole(user) ||
      this.isDeveloperRole(user) ||
      user.role === 'ADMIN'
    ) {
      return true;
    }
    const role = (user.role || '').toUpperCase();
    if (role === 'CIRCLE_INCHARGE') {
      if (!user.circle) return true;
      return (office.circle || '').toLowerCase() === user.circle.toLowerCase();
    }
    if (role === 'DIVISION_INCHARGE') {
      if (!user.division) return true;
      return (office.division || '').toLowerCase() === user.division.toLowerCase();
    }
    if (this.isDistrictManager(user)) {
      const dist = office.district || (office.division ? office.division.replace(/\s*Division/i, '').trim() : '');
      return this.canManageOfficeInDistrict(user, dist);
    }
    if (role === 'BLOCK_INCHARGE') {
      const dist = office.district || '';
      if (user.block && office.block) return user.block.toLowerCase() === office.block.toLowerCase();
      if (user.district && dist) return user.district.toLowerCase() === dist.toLowerCase();
      return true;
    }
    if (role === 'OFFICE_INCHARGE') {
      const userOff = (user.subOffice || user.assignedOffice || '').replace(/\s*\(\d{6}\)/g, '').trim().toLowerCase();
      const targetOff = (office.officeName || office.subOffice || '').trim().toLowerCase();
      return !userOff || targetOff.includes(userOff) || userOff.includes(targetOff);
    }
    if (this.isCategoryManager(user)) {
      const assigned = this.getAssignedCategories(user);
      if (assigned.length === 0) return true;
      const officeCats = this.deriveOfficeServiceCategories(office);
      return officeCats.some(cat => this.canManageCategory(user, cat));
    }
    return false;
  }

  // ================= REAL STAFF ASSIGNMENT, VACANCY RULE & OFFICE REASSIGNMENT =================

  private isElevatedOrSyntheticStaffRecord(staff: {
    id?: string;
    employeeId?: string;
    email?: string;
    role?: string;
    name?: string;
  }): boolean {
    const id = (staff.id || '').toUpperCase();
    const empId = (staff.employeeId || '').toUpperCase();
    const email = (staff.email || '').toLowerCase();
    const name = (staff.name || '').toLowerCase();

    if (
      id === 'STAFF-MASTER-EKTA' ||
      id === 'STAFF-OWNER-01' ||
      id === 'STAFF-DEV-01' ||
      empId === 'MASTER-ADMIN-01' ||
      empId === 'OWNER-01' ||
      empId === 'DEV-01' ||
      empId === 'OWNER_ROOT_01' ||
      empId === 'MASTER_ADMIN_EKTA_01' ||
      email === 'ektamahenmeena@gmail.com' ||
      email === 'owner@xpokart.in' ||
      email === 'dev@xpokart.in'
    ) {
      return true;
    }
    if (name.endsWith('postal team') || name === 'head postmaster & divisional staff') {
      return true;
    }
    return false;
  }

  private stripOfficeSuffix(val?: string): string {
    return (val || '')
      .replace(/\s*\(under [^)]+\)/gi, '')
      .replace(/\s*\(\d{6}\)/g, '')
      .trim()
      .toLowerCase();
  }

  private doesStaffBelongToOffice(
    staff: {
      officeId?: string;
      branchOffice?: string;
      subOffice?: string;
      subOrBranchOffice?: string;
      postedOfficeName?: string;
      assignedOffice?: string;
    },
    office: Pick<DynamicOfficeRecord, 'id' | 'officeId' | 'officeName' | 'officeType' | 'subOffice' | 'branchOffice'>
  ): boolean {
    if (staff.officeId && (staff.officeId === office.id || (office.officeId && staff.officeId === office.officeId))) {
      return true;
    }

    const officePrimary = this.stripOfficeSuffix(office.branchOffice || office.officeName);
    if (!officePrimary) return false;

    const isBranchOfficeNode =
      (office.officeType || '').toUpperCase().includes('B') || Boolean(office.branchOffice);

    if (isBranchOfficeNode) {
      const staffBo = this.stripOfficeSuffix(staff.branchOffice || staff.postedOfficeName);
      return Boolean(staffBo) && staffBo === officePrimary;
    }

    // For S.O., H.O., EV Hub, Franchise, or Store: only count staff directly posted to this office (not child BOs)
    if (staff.branchOffice && staff.branchOffice.trim()) {
      return this.stripOfficeSuffix(staff.branchOffice) === officePrimary;
    }

    const staffSo = this.stripOfficeSuffix(
      staff.postedOfficeName || staff.subOffice || staff.subOrBranchOffice || staff.assignedOffice
    );
    return Boolean(staffSo) && staffSo === officePrimary;
  }

  private collectRealStaffForOffice(
    office: Pick<DynamicOfficeRecord, 'id' | 'officeId' | 'officeName' | 'officeType' | 'subOffice' | 'branchOffice'>
  ): StaffProfile[] {
    const matched = new Map<string, StaffProfile>();

    for (const p of this.profiles) {
      if (this.isElevatedOrSyntheticStaffRecord(p)) continue;
      if (this.doesStaffBelongToOffice(p, office)) {
        const key = (p.employeeId || p.email || p.id).toLowerCase();
        matched.set(key, p);
      }
    }

    for (const s of this.directoryStaff) {
      if (this.isElevatedOrSyntheticStaffRecord(s)) continue;
      if (this.doesStaffBelongToOffice(s, office)) {
        const key = (s.employeeId || s.email || s.id).toLowerCase();
        if (!matched.has(key)) {
          matched.set(
            key,
            this.normalizeProfile({
              id: s.id,
              employeeId: s.employeeId || s.id,
              name: s.name,
              email: s.email,
              role: 'STAFF',
              designationType: s.designationType || s.role,
              contact: s.contact,
              beat: s.beat,
              assignedBeats: s.assignedBeats || [s.beat],
              assignedOffice: s.subOrBranchOffice || s.subOffice || office.officeName,
              officeId: s.officeId || office.id,
              circle: s.circle,
              division: s.division,
              district: s.district,
              block: s.block,
              headOffice: s.headOffice,
              subOffice: s.subOffice,
              branchOffice: s.branchOffice,
              officePincode: s.officePincode,
              officeAddress: s.officeAddress,
              assignedColonies: s.assignedColonies,
              permissions: { ...DEFAULT_STAFF_PERMISSION },
              entriesCreatedToday: 0,
              lastEntryDate: new Date().toISOString().split('T')[0],
              totalEntriesCount: 0,
              status: 'Active',
            })
          );
        }
      }
    }

    return Array.from(matched.values());
  }

  private resolveOfficeTarget(officeOrKey: DynamicOfficeRecord | string): DynamicOfficeRecord | null {
    if (typeof officeOrKey !== 'string') return officeOrKey;
    const norm = officeOrKey.trim().toLowerCase();
    return (
      this.getAutoManagedOffices().find(
        o =>
          o.id.toLowerCase() === norm ||
          (o.officeId || '').toLowerCase() === norm ||
          o.officeName.trim().toLowerCase() === norm
      ) || null
    );
  }

  public getOfficeAssignedStaff(officeOrKey: DynamicOfficeRecord | string): StaffProfile[] {
    const office = this.resolveOfficeTarget(officeOrKey);
    if (!office) return [];
    return this.collectRealStaffForOffice(office);
  }

  public getOfficeStaffCount(officeOrKey: DynamicOfficeRecord | string): number {
    return this.getOfficeAssignedStaff(officeOrKey).length;
  }

  public isOfficeVacant(officeOrKey: DynamicOfficeRecord | string): boolean {
    return this.getOfficeStaffCount(officeOrKey) === 0;
  }

  public reassignStaffOffice(
    staffIdOrEmail: string,
    targetOfficeIdOrName: string,
    requestedBy?: StaffProfile | any
  ): { success: boolean; message: string; staff?: StaffProfile } {
    if (!this.canPerformOfficeMasterAction(requestedBy, 'modifyExistingOffice')) {
      return {
        success: false,
        message: 'Permission Denied: Only Owner, Master Admin, or District/Office Managers can reassign staff.',
      };
    }

    const targetOffice = this.resolveOfficeTarget(targetOfficeIdOrName);
    if (!targetOffice) {
      return {
        success: false,
        message: `Target office "${targetOfficeIdOrName}" not found in directory.`,
      };
    }

    const key = (staffIdOrEmail || '').trim().toLowerCase();
    const prof = this.profiles.find(
      p =>
        (p.id || '').toLowerCase() === key ||
        (p.employeeId || '').toLowerCase() === key ||
        (p.email || '').toLowerCase() === key
    );
    const dir = this.directoryStaff.find(
      s =>
        (s.id || '').toLowerCase() === key ||
        (s.employeeId || '').toLowerCase() === key ||
        (s.email || '').toLowerCase() === key
    );

    if (!prof && !dir) {
      return {
        success: false,
        message: `Staff member "${staffIdOrEmail}" was not found.`,
      };
    }

    const isBO = (targetOffice.officeType || '').toUpperCase().includes('B') || Boolean(targetOffice.branchOffice);
    const newSubOffice = targetOffice.subOffice || targetOffice.officeName;
    const newBranchOffice = isBO ? targetOffice.branchOffice || targetOffice.officeName : '';
    const newAssignedOffice = `${targetOffice.officeName} (${targetOffice.pincode})`;

    if (prof) {
      prof.officeId = targetOffice.id;
      prof.circle = targetOffice.circle || prof.circle;
      prof.division = targetOffice.division || prof.division;
      prof.district = targetOffice.district || prof.district;
      prof.block = targetOffice.block || prof.block;
      prof.headOffice = targetOffice.headOffice || prof.headOffice;
      prof.subOffice = newSubOffice;
      prof.branchOffice = newBranchOffice;
      prof.postOfficeName = targetOffice.officeName;
      prof.assignedOffice = newAssignedOffice;
      prof.officePincode = targetOffice.pincode;
      prof.officeAddress = targetOffice.completeAddress;
      prof.deliveryOfficeMapping = newAssignedOffice;
      if (prof.permissions) {
        prof.permissions.allowedOffices = [targetOffice.officeName];
      }
      prof.updatedAt = new Date().toISOString();
    }

    if (dir) {
      dir.officeId = targetOffice.id;
      dir.circle = targetOffice.circle || dir.circle;
      dir.division = targetOffice.division || dir.division;
      dir.district = targetOffice.district || dir.district;
      dir.block = targetOffice.block || dir.block;
      dir.headOffice = targetOffice.headOffice || dir.headOffice;
      dir.subOffice = newSubOffice;
      dir.branchOffice = newBranchOffice;
      dir.postOfficeName = targetOffice.officeName;
      dir.subOrBranchOffice = newBranchOffice
        ? `${newBranchOffice} (under ${newSubOffice})`
        : targetOffice.officeName;
      dir.postedOfficeName = targetOffice.officeName;
      dir.officePincode = targetOffice.pincode;
      dir.officeAddress = targetOffice.completeAddress;
      dir.deliveryOfficeMapping = newAssignedOffice;
    }

    this.cachedAutoOffices = null;
    this.saveDirectoryStaff(false);
    this.saveProfiles(true);

    return {
      success: true,
      message: `${prof?.name || dir?.name} reassigned to ${targetOffice.officeName} (${targetOffice.pincode}).`,
      staff: prof,
    };
  }

  public permanentlyDeleteVacantOffice(
    officeIdOrName: string,
    requestedBy?: StaffProfile | any
  ): { success: boolean; message: string; blockingStaffCount?: number } {
    if (!this.canPerformOfficeMasterAction(requestedBy, 'deleteOrArchiveOffice')) {
      return {
        success: false,
        message: 'Permission Denied: Permanent office deletion is strictly restricted to Owner (Mahendra Kumar Meena) or Master Admin (Ekta Meena).',
      };
    }

    const office = this.resolveOfficeTarget(officeIdOrName);
    const normKey = (officeIdOrName || '').trim().toLowerCase();
    if (!normKey && !office) {
      return { success: false, message: 'Invalid office identifier provided.' };
    }

    const realAssigned = office ? this.collectRealStaffForOffice(office) : [];
    if (realAssigned.length > 0) {
      return {
        success: false,
        blockingStaffCount: realAssigned.length,
        message: `Safe Deletion Blocked: "${office?.officeName || officeIdOrName}" currently has ${realAssigned.length} active staff member(s) assigned. Reassign all staff to another office first until staff count reaches 0.`,
      };
    }

    const keysToArchive = new Set<string>(
      [
        normKey,
        office?.id?.toLowerCase(),
        office?.officeId?.toLowerCase(),
        office?.officeName?.trim().toLowerCase(),
      ].filter((v): v is string => Boolean(v))
    );

    keysToArchive.forEach(k => {
      if (!this.archivedOfficeKeys.includes(k)) {
        this.archivedOfficeKeys.push(k);
      }
    });

    try {
      localStorage.setItem(ARCHIVED_OFFICE_STORAGE_KEY, JSON.stringify(this.archivedOfficeKeys));
    } catch (e) {
      console.warn('Failed to save archived offices:', e);
    }

    this.customOffices = this.customOffices.filter(o => {
      const id = (o.id || '').toLowerCase();
      const oid = (o.officeId || '').toLowerCase();
      const name = (o.officeName || '').trim().toLowerCase();
      return !keysToArchive.has(id) && !keysToArchive.has(oid) && !keysToArchive.has(name);
    });
    this.saveCustomOffices(false);

    this.cachedAutoOffices = null;
    this.notifyListeners();

    return {
      success: true,
      message: `Vacant office "${office?.officeName || officeIdOrName}" was permanently deleted.`,
    };
  }

  public updateOfficeRemarks(
    officeIdOrName: string,
    operationalRemarks: string,
    requestedBy?: StaffProfile | any
  ): { success: boolean; message: string; office?: DynamicOfficeRecord } {
    if (!this.canPerformOfficeMasterAction(requestedBy, 'modifyExistingOffice')) {
      return {
        success: false,
        message: 'Permission Denied: You do not have permission to edit office operational remarks.',
      };
    }
    const office = this.resolveOfficeTarget(officeIdOrName);
    if (!office) {
      return { success: false, message: `Office "${officeIdOrName}" not found.` };
    }
    const updated = this.upsertCustomOffice({
      ...office,
      operationalRemarks: operationalRemarks.trim(),
      updatedAt: new Date().toISOString(),
    });
    return {
      success: true,
      message: `Operational remarks updated for ${updated.officeName}.`,
      office: updated,
    };
  }

  // ================= MASTER ADMIN & OFFICE PERMISSION PROTOCOL (XPEEDO CRM / POSTMAN BOOK) =================

  public getOfficeMasterPermissionConfig(): OfficeMasterPermissionConfig {
    return xpeedoMasterAdminOfficeConfig;
  }

  public getMasterAuditProtocol(): MasterOfficeAndRiderAuditConfig {
    return xpeedoMasterAuditProtocol;
  }

  public isDesignatedMasterAdmin(user: StaffProfile | any | null | undefined): boolean {
    if (!user) return false;
    const name = (user.name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const empId = (user.employeeId || user.id || '').toUpperCase();
    const role = (user.role || '').toUpperCase();

    // Check against designatedAdmins IDs strictly (never match postman 50457421 by name)
    for (const admin of xpeedoMasterAdminOfficeConfig.designatedAdmins) {
      if (empId && empId === admin.emailOrId.toUpperCase()) return true;
    }

    if (
      email === 'ektamahenmeena@gmail.com' ||
      empId === 'MASTER-ADMIN-01' ||
      empId === 'MASTER_ADMIN_EKTA_01' ||
      name.includes('ekta meena') ||
      role === 'MASTER_ADMIN'
    ) {
      return true;
    }

    if (
      email === 'owner@xpokart.in' ||
      email === 'dev@xpokart.in' ||
      empId === 'OWNER_ROOT_01' ||
      empId === 'OWNER-01' ||
      empId === 'DEV-01' ||
      role === 'OWNER' ||
      role === 'DEVELOPER' ||
      role === 'SUPER_ADMIN'
    ) {
      return true;
    }

    return false;
  }

  public canPerformOfficeMasterAction(
    user: StaffProfile | any | null | undefined,
    action: keyof OfficeMasterPermissionConfig['accessPermissions']
  ): boolean {
    if (!user) return false;
    if (!xpeedoMasterAdminOfficeConfig.accessPermissions[action]) return false;

    const role = (user.role || '').toUpperCase();
    const isDesignated = this.isDesignatedMasterAdmin(user);
    const isSuper = this.isSuperAdmin(user);
    const isDM = this.isDistrictManager(user);
    const isCM = this.isCategoryManager(user);

    // Rule: deleteOrArchiveOffice is strictly restricted to Owner / Master Admin
    if (action === 'deleteOrArchiveOffice') {
      if (isDesignated) return true;
      if (role === 'OWNER' || role === 'MASTER_ADMIN' || role === 'SUPER_ADMIN') return true;
      return false;
    }

    // Rule: Other actions (registerNewOffice, modifyExistingOffice, instantVerifyStaffData, manageBeatAndPincodeMapping)
    if (
      isDesignated ||
      isSuper ||
      isDM ||
      isCM ||
      role === 'CIRCLE_INCHARGE' ||
      role === 'DIVISION_INCHARGE' ||
      role === 'DISTRICT_INCHARGE'
    ) {
      return true;
    }
    if (xpeedoMasterAdminOfficeConfig.authorizedRoles.includes(role as any)) return true;
    return false;
  }

  public deleteOrArchiveOffice(
    officeIdOrName: string,
    requestedBy?: StaffProfile | any
  ): { success: boolean; message: string; blockingStaffCount?: number } {
    return this.permanentlyDeleteVacantOffice(officeIdOrName, requestedBy);
  }

  public instantVerifyStaffData(
    emailOrEmpId: string,
    requestedBy?: StaffProfile | any
  ): { success: boolean; message: string; profile?: StaffProfile } {
    if (!this.canPerformOfficeMasterAction(requestedBy, 'instantVerifyStaffData')) {
      return {
        success: false,
        message: 'Permission Denied: Instant staff verification requires Master Admin or Designated Administrator authority.',
      };
    }

    const target = (emailOrEmpId || '').trim().toLowerCase();
    const profile = this.profiles.find(
      p =>
        (p.email || '').toLowerCase() === target ||
        (p.employeeId || '').toLowerCase() === target ||
        (p.id || '').toLowerCase() === target
    );

    if (!profile) {
      return {
        success: false,
        message: `Staff record "${emailOrEmpId}" not found in database registry.`,
      };
    }

    profile.permissions = {
      ...profile.permissions,
      approvalStatus: 'Approved',
      serviceModules: {
        crmSection: true,
        specialBillsSection: true,
        learningSection: true,
        departmentalLearningSection: true,
        schemeLeadsSection: true,
        productSchemeLeadSection: true,
        contentSharingSection: true,
        contentSharingDispatchSection: true,
      },
    };
    profile.status = 'Active';
    profile.updatedAt = new Date().toISOString();

    const dirStaff = this.directoryStaff.find(
      s =>
        (s.email || '').toLowerCase() === target ||
        (s.employeeId || '').toLowerCase() === target ||
        (s.id || '').toLowerCase() === target
    );
    if (dirStaff) {
      dirStaff.status = 'Active on Duty';
    }

    this.saveProfiles(false);
    this.saveDirectoryStaff(false);
    this.notifyListeners();

    return {
      success: true,
      message: `Staff member "${profile.name}" (${profile.employeeId || profile.designationType}) instantly verified! Full beat roster & service module permissions granted.`,
      profile,
    };
  }

  public getMasterAdminProfile(): StaffProfile {
    const admin = this.getStaffProfileByEmail('Ektamahenmeena@gmail.com');
    admin.name = 'Ekta Meena';
    admin.contact = '8279275805';
    admin.email = 'Ektamahenmeena@gmail.com';
    admin.role = 'MASTER_ADMIN';
    admin.designationType = 'Master Admin (Developer / System Architect)';
    admin.beat = 'All Beats';
    admin.assignedBeats = ['All Beats'];
    admin.division = 'All Divisions';
    admin.mustChangePassword = false;
    admin.permissions = {
      ...DEFAULT_ADMIN_PERMISSION,
      canViewAllRecords: true,
      approvalStatus: 'Approved',
      serviceModules: { ...DEFAULT_ADMIN_SERVICE_MODULES },
      allowedBeats: ['All Beats'],
      allowedOffices: ['All Offices'],
      allowedColonies: ['All Colonies'],
    };
    return admin;
  }

  public canAccessServiceModule(
    user: StaffProfile | null | undefined,
    moduleKey: keyof ServiceModulePermissions
  ): boolean {
    if (!user) return false;
    if (this.isSuperAdmin(user) || user.role === 'ADMIN') return true;
    if (user.permissions?.approvalStatus === 'Revoked') return false;
    const modules = user.permissions?.serviceModules;
    if (!modules) return true;
    if (moduleKey === 'departmentalLearningSection' || moduleKey === 'learningSection') {
      return Boolean(modules.learningSection ?? modules.departmentalLearningSection ?? true);
    }
    if (moduleKey === 'productSchemeLeadSection' || moduleKey === 'schemeLeadsSection') {
      return Boolean(modules.schemeLeadsSection ?? modules.productSchemeLeadSection ?? true);
    }
    if (moduleKey === 'contentSharingDispatchSection' || moduleKey === 'contentSharingSection') {
      return Boolean(modules.contentSharingSection ?? modules.contentSharingDispatchSection ?? true);
    }
    return Boolean(modules[moduleKey]);
  }

  public toggleServiceModule(
    email: string,
    moduleKey: keyof ServiceModulePermissions,
    enabled: boolean
  ): StaffProfile {
    const prof = this.getStaffProfileByEmail(email);
    const currentModules = prof.permissions.serviceModules || { ...DEFAULT_STAFF_SERVICE_MODULES };
    const updatedModules: ServiceModulePermissions = {
      ...currentModules,
      [moduleKey]: enabled,
    };
    if (moduleKey === 'learningSection' || moduleKey === 'departmentalLearningSection') {
      updatedModules.learningSection = enabled;
      updatedModules.departmentalLearningSection = enabled;
    }
    if (moduleKey === 'schemeLeadsSection' || moduleKey === 'productSchemeLeadSection') {
      updatedModules.schemeLeadsSection = enabled;
      updatedModules.productSchemeLeadSection = enabled;
    }
    if (moduleKey === 'contentSharingSection' || moduleKey === 'contentSharingDispatchSection') {
      updatedModules.contentSharingSection = enabled;
      updatedModules.contentSharingDispatchSection = enabled;
    }
    return this.updateStaffPermission(email, {
      serviceModules: updatedModules,
    });
  }

  public isFeatureVisible(
    user: StaffProfile | null | undefined,
    featureKey: FeatureVisibilityKey
  ): boolean {
    return featureVisibilityService.isFeatureVisible(user, featureKey);
  }

  public canAccessVendorSystem(
    user: StaffProfile | null | undefined,
    vendorId: VendorSystemId
  ): boolean {
    return featureVisibilityService.canAccessVendorSystem(user, vendorId);
  }

  public isWhiteLabelPostalMode(user: StaffProfile | null | undefined): boolean {
    return featureVisibilityService.isWhiteLabelPostalMode(user);
  }

  public assignVendorAccess(
    emailOrId: string,
    vendorConfig: VendorAccessConfig,
    performedBy = 'OWNER'
  ): StaffProfile | null {
    const profile = this.findStaffProfileByIdentifier(emailOrId);
    if (!profile) {
      featureVisibilityService.setUserVendorScope(emailOrId, vendorConfig, performedBy);
      this.notifyListeners();
      return null;
    }
    const updated = this.updateStaffPermission(
      profile.email,
      {},
      { vendorScope: { ...(profile.vendorScope || {}), ...vendorConfig } }
    );
    featureVisibilityService.setUserVendorScope(updated.email, vendorConfig, performedBy);
    this.notifyListeners();
    return updated;
  }

  public setApprovalStatus(
    email: string,
    status: 'Approved' | 'Pending Approval' | 'Revoked'
  ): StaffProfile {
    return this.updateStaffPermission(
      email,
      { approvalStatus: status },
      { status: status === 'Revoked' ? 'Inactive' : status === 'Pending Approval' ? 'Pending' : 'Active' }
    );
  }

  // ================= DIRECT STAFF REGISTRATION & LIVE AUTO-MANAGED OFFICE/BEAT ENGINE =================

  public upsertStaffWithAutoOfficeAndBeat(input: {
    id?: string;
    employeeId: string;
    name: string;
    contact: string;
    email?: string;
    password?: string;
    designationType: DesignationType;
    role?: string;
    circle: string;
    division: string;
    district?: string;
    block?: string;
    assignedCategories?: string[];
    partnerOrganization?: string;
    officeId?: string;
    extraRemarks?: string;
    headOffice: string;
    subOffice: string;
    branchOffice?: string;
    officePincode: string;
    officeAddress: string;
    beat: string;
    assignedBeats?: string[];
    deliveryOfficeMapping?: string;
    assignedColonies: string[];
    fixedKm?: number;
    dailyEntryLimit?: number;
    canViewAllRecords?: boolean;
    serviceModules?: ServiceModulePermissions;
    approvalStatus?: 'Approved' | 'Pending Approval' | 'Revoked';
    status?: 'Active on Duty' | 'In Office' | 'Supervising' | 'On Leave';
  }): { profile: StaffProfile; staffRecord: Staff } {
    const cleanName = input.name.trim();
    const cleanEmpId = input.employeeId.trim() || `CSI-${Date.now().toString().slice(-6)}`;
    const generatedEmail =
      (input.email && input.email !== 'N/A' ? input.email.trim().toLowerCase() : '') ||
      `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@indiapost.gov.in`;

    const isMaster = generatedEmail === 'ektamahenmeena@gmail.com';
    const primaryBeat = isMaster ? 'All Beats' : input.beat.trim() || 'Beat 2';
    const beatList = isMaster
      ? ['All Beats']
      : input.assignedBeats?.length
      ? input.assignedBeats
      : primaryBeat.split(',').map(b => b.trim()).filter(Boolean);

    const colonies = isMaster
      ? ['All Colonies']
      : input.assignedColonies?.length
      ? input.assignedColonies
      : getDefaultColoniesForBeat(primaryBeat);

    const subOrBo = input.branchOffice?.trim()
      ? `${input.branchOffice.trim()} (under ${input.subOffice.trim()})`
      : input.subOffice.trim() || 'Dadabari S.O.';

    const deliveryMapping =
      input.deliveryOfficeMapping?.trim() ||
      `${input.subOffice.trim() || 'Dadabari S.O.'}${input.branchOffice?.trim() ? ` / ${input.branchOffice.trim()}` : ''} (${input.officePincode || '324009'})`;

    const resolvedDistrict =
      input.district?.trim() ||
      (input.division ? input.division.replace(/\s*Division/i, '').trim() : 'Kota');

    // Locate existing profile if present; allow unrestricted onboarding across India Post / unified roster
    const existingProfIdx = this.profiles.findIndex(
      p =>
        p.email.toLowerCase() === generatedEmail ||
        (p.employeeId && p.employeeId === cleanEmpId)
    );
    const isGovernanceTarget =
      isMaster ||
      ['OWNER', 'MASTER_ADMIN', 'DEVELOPER', 'SUPER_ADMIN'].includes((input.role || '').toUpperCase()) ||
      generatedEmail === 'owner@xpokart.in' ||
      generatedEmail === 'dev@xpokart.in';
    void isGovernanceTarget;

    // 1. Update or Insert into Directory Staff
    const existingStaffIdx = this.directoryStaff.findIndex(
      s =>
        s.id === input.id ||
        s.employeeId === cleanEmpId ||
        (s.email && s.email.toLowerCase() === generatedEmail)
    );

    const staffRecord: Staff = {
      id: input.id || (existingStaffIdx >= 0 ? this.directoryStaff[existingStaffIdx].id : `STAFF-${cleanEmpId}`),
      employeeId: cleanEmpId,
      name: cleanName,
      role: input.designationType || input.role || 'Postman',
      designationType: input.designationType,
      beat: primaryBeat,
      assignedBeat: primaryBeat,
      assignedBeats: beatList,
      contact: input.contact.trim(),
      email: generatedEmail,
      officeId: input.officeId || (existingStaffIdx >= 0 ? this.directoryStaff[existingStaffIdx].officeId : undefined),
      circle: input.circle.trim() || 'Rajasthan Circle',
      division: input.division.trim() || 'Kota Division',
      district: resolvedDistrict,
      block: input.block?.trim() || (existingStaffIdx >= 0 ? this.directoryStaff[existingStaffIdx].block : ''),
      headOffice: input.headOffice.trim() || 'Kota H.O.',
      subOffice: input.subOffice.trim() || 'Dadabari S.O.',
      branchOffice: input.branchOffice?.trim() || '',
      subOrBranchOffice: subOrBo,
      officePincode: input.officePincode.trim() || '324009',
      officeAddress:
        input.officeAddress.trim() ||
        `${input.subOffice.trim() || 'Dadabari S.O.'}, ${input.division.trim() || 'Kota Division'} - ${input.officePincode.trim() || '324009'}`,
      postingType: 'Posted',
      postedOfficeName: input.branchOffice?.trim() || input.subOffice.trim() || 'Dadabari S.O.',
      deliveryOfficeMapping: deliveryMapping,
      assignedColonies: colonies,
      assignedCategories: input.assignedCategories?.length
        ? input.assignedCategories
        : existingStaffIdx >= 0
        ? this.directoryStaff[existingStaffIdx].assignedCategories
        : undefined,
      partnerOrganization:
        input.partnerOrganization?.trim() ||
        (existingStaffIdx >= 0 ? this.directoryStaff[existingStaffIdx].partnerOrganization : undefined),
      extraRemarks: input.extraRemarks?.trim() || (existingStaffIdx >= 0 ? this.directoryStaff[existingStaffIdx].extraRemarks : undefined),
      activeAccountsOpened: existingStaffIdx >= 0 ? this.directoryStaff[existingStaffIdx].activeAccountsOpened : 0,
      doorstepVisits: existingStaffIdx >= 0 ? this.directoryStaff[existingStaffIdx].doorstepVisits : 0,
      rating: existingStaffIdx >= 0 ? this.directoryStaff[existingStaffIdx].rating : '4.9/5.0',
      status: input.status || 'Active on Duty',
    };

    if (existingStaffIdx >= 0) {
      this.directoryStaff[existingStaffIdx] = staffRecord;
    } else {
      this.directoryStaff.unshift(staffRecord);
    }

    const existingProf = existingProfIdx >= 0 ? this.profiles[existingProfIdx] : null;
    const desigLower = (input.designationType || '').toLowerCase();
    const mappedRole = isMaster
      ? 'MASTER_ADMIN'
      : input.role ||
        (desigLower.includes('category manager')
          ? 'CATEGORY_MANAGER'
          : desigLower.includes('district manager')
          ? 'DISTRICT_MANAGER'
          : desigLower.includes('district incharge')
          ? 'DISTRICT_INCHARGE'
          : desigLower.includes('division incharge')
          ? 'DIVISION_INCHARGE'
          : desigLower.includes('circle incharge')
          ? 'CIRCLE_INCHARGE'
          : desigLower.includes('block incharge')
          ? 'BLOCK_INCHARGE'
          : desigLower.includes('office incharge')
          ? 'OFFICE_INCHARGE'
          : input.designationType.includes('Inspector') || input.designationType.includes('Postmaster')
          ? 'ADMIN'
          : input.designationType.includes('Postman') || input.designationType.includes('GDS')
          ? 'POSTMAN'
          : 'STAFF');

    const rawInputPass = (input.password || '').trim();
    const isDefaultInputPass = rawInputPass === DEFAULT_STAFF_FALLBACK_PASSWORD;
    const computedPassword = isMaster
      ? existingProf?.hasCustomPassword && !rawInputPass
        ? existingProf.password
        : hashPasswordSync(rawInputPass && !isDefaultInputPass ? rawInputPass : 'Admin')
      : rawInputPass
      ? rawInputPass.startsWith('$sha256')
        ? rawInputPass
        : hashPasswordSync(rawInputPass)
      : existingProf?.password || hashPasswordSync(DEFAULT_STAFF_FALLBACK_PASSWORD);

    const computedHasCustomPassword = isMaster
      ? true
      : rawInputPass
      ? !isDefaultInputPass &&
        rawInputPass !== hashPasswordSync(DEFAULT_STAFF_FALLBACK_PASSWORD) &&
        rawInputPass.toLowerCase() !== cleanEmpId.toLowerCase()
      : Boolean(existingProf?.hasCustomPassword);

    const profile: StaffProfile = this.normalizeProfile({
      id: existingProf?.id || staffRecord.id,
      employeeId: cleanEmpId,
      name: cleanName,
      email: generatedEmail,
      password: computedPassword,
      hasCustomPassword: computedHasCustomPassword,
      mustChangePassword: false,
      role: mappedRole,
      designationType: input.designationType,
      contact: input.contact.trim(),
      beat: primaryBeat,
      assignedBeats: beatList,
      assignedOffice: `${input.subOffice.trim() || 'Dadabari S.O.'} (${input.officePincode.trim() || '324009'})`,
      officeId: staffRecord.officeId,
      circle: staffRecord.circle,
      division: staffRecord.division,
      district: resolvedDistrict,
      block: staffRecord.block,
      assignedCategories: staffRecord.assignedCategories || existingProf?.assignedCategories,
      partnerOrganization: staffRecord.partnerOrganization || existingProf?.partnerOrganization,
      extraRemarks: staffRecord.extraRemarks || existingProf?.extraRemarks,
      headOffice: staffRecord.headOffice,
      subOffice: staffRecord.subOffice,
      branchOffice: staffRecord.branchOffice,
      officePincode: staffRecord.officePincode,
      officeAddress: staffRecord.officeAddress,
      deliveryOfficeMapping: deliveryMapping,
      assignedColonies: colonies,
      fixedKm: Number(input.fixedKm) || existingProf?.fixedKm || getDefaultFixedKmForBeat(primaryBeat),
      permissions: {
        ...(existingProf?.permissions || DEFAULT_STAFF_PERMISSION),
        canViewAllRecords: isMaster ? true : Boolean(input.canViewAllRecords ?? existingProf?.permissions?.canViewAllRecords),
        dailyEntryLimit: isMaster ? 0 : Number(input.dailyEntryLimit ?? existingProf?.permissions?.dailyEntryLimit ?? 50),
        approvalStatus: isMaster ? 'Approved' : input.approvalStatus || existingProf?.permissions?.approvalStatus || 'Approved',
        serviceModules: isMaster
          ? { ...DEFAULT_ADMIN_SERVICE_MODULES }
          : input.serviceModules || existingProf?.permissions?.serviceModules || { ...DEFAULT_STAFF_SERVICE_MODULES },
        allowedBeats: isMaster ? ['All Beats'] : beatList,
        allowedOffices: isMaster
          ? ['All Offices']
          : [staffRecord.subOffice || 'Dadabari S.O.', ...(staffRecord.branchOffice ? [staffRecord.branchOffice] : [])],
        allowedColonies: isMaster ? ['All Colonies'] : colonies,
      },
      entriesCreatedToday: existingProf?.entriesCreatedToday || 0,
      lastEntryDate: existingProf?.lastEntryDate || new Date().toISOString().split('T')[0],
      totalEntriesCount: existingProf?.totalEntriesCount || 0,
      status: 'Active',
    });

    if (existingProfIdx >= 0) {
      this.profiles[existingProfIdx] = profile;
    } else {
      this.profiles.unshift(profile);
    }

    // 3. Auto-Manage Colony-Beat Mappings for each assigned colony!
    for (const rawColony of colonies) {
      const trimmedCol = rawColony.trim();
      if (!trimmedCol) continue;
      const sectorMatch = trimmedCol.match(/(Sector\s*\d+[A-Za-z0-9\s&-]*|Phase\s*[I|V|X|\d]+|Block\s*[A-Z0-9-]+)/i);
      const colonyBase = sectorMatch ? trimmedCol.replace(sectorMatch[0], '').trim() || trimmedCol : trimmedCol;
      const sectorStr = sectorMatch ? sectorMatch[0].trim() : 'All Sectors';

      const existsMapping = this.colonyBeatMappings.find(
        m =>
          m.colonyName.toLowerCase() === colonyBase.toLowerCase() &&
          m.sectorNumber.toLowerCase() === sectorStr.toLowerCase() &&
          m.beatNumber.toLowerCase() === primaryBeat.toLowerCase()
      );

      if (!existsMapping) {
        this.colonyBeatMappings.push(
          this.normalizeColonyMapping({
            id: `CBM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            colonyName: colonyBase,
            sectorNumber: sectorStr,
            landmark: `${staffRecord.subOffice || 'Dadabari S.O.'} Delivery Area`,
            pincode: staffRecord.officePincode || '324009',
            subOrHoOffice: `${staffRecord.subOffice || 'Dadabari S.O.'} / ${staffRecord.headOffice || 'Kota H.O.'}`,
            beatNumber: primaryBeat,
            assignedPostmanName: cleanName,
            assignedPostmanContact: input.contact.trim(),
            updatedAt: new Date().toISOString(),
          })
        );
      } else {
        existsMapping.assignedPostmanName = cleanName;
        existsMapping.assignedPostmanContact = input.contact.trim();
        existsMapping.assignedPostmanMobile = input.contact.trim();
        existsMapping.pincode = staffRecord.officePincode || existsMapping.pincode;
        existsMapping.areaPincode = existsMapping.pincode;
        existsMapping.subOrHoOffice = `${staffRecord.subOffice || 'Dadabari S.O.'} / ${staffRecord.headOffice || 'Kota H.O.'}`;
        existsMapping.subOrHeadOffice = existsMapping.subOrHoOffice;
        existsMapping.updatedAt = new Date().toISOString();
      }
    }

    this.saveDirectoryStaff(false);
    this.saveColonyMappings(false);
    this.saveProfiles(true);

    return { profile, staffRecord };
  }

  public upsertStaffAndSyncEntities(input: {
    id?: string;
    name: string;
    contact: string;
    employeeId: string;
    designation?: string;
    designationType?: DesignationType;
    email?: string;
    password?: string;
    role?: string;
    circle: string;
    division: string;
    district?: string;
    block?: string;
    assignedCategories?: string[];
    partnerOrganization?: string;
    officeId?: string;
    extraRemarks?: string;
    headOffice: string;
    subOffice: string;
    branchOffice?: string;
    officePincode: string;
    completeOfficeAddress?: string;
    officeAddress?: string;
    assignedOffice?: string;
    beat: string;
    assignedBeats?: string[];
    deliveryOfficeMappings?: string[];
    deliveryOfficeMapping?: string;
    assignedColonies: string[];
    fixedKm?: number;
    dailyEntryLimit?: number;
    canViewAllRecords?: boolean;
    serviceModules?: ServiceModulePermissions;
    approvalStatus?: 'Approved' | 'Pending Approval' | 'Revoked';
  }): { profile: StaffProfile; staffRecord: Staff } {
    return this.upsertStaffWithAutoOfficeAndBeat({
      id: input.id,
      employeeId: input.employeeId,
      name: input.name,
      contact: input.contact,
      email: input.email,
      password: input.password,
      designationType: input.designationType || input.designation || 'Postman',
      role: input.role,
      circle: input.circle,
      division: input.division,
      district: input.district,
      block: input.block,
      assignedCategories: input.assignedCategories,
      partnerOrganization: input.partnerOrganization,
      officeId: input.officeId,
      extraRemarks: input.extraRemarks,
      headOffice: input.headOffice,
      subOffice: input.subOffice,
      branchOffice: input.branchOffice,
      officePincode: input.officePincode,
      officeAddress: input.officeAddress || input.completeOfficeAddress || '',
      beat: input.beat,
      assignedBeats: input.assignedBeats,
      deliveryOfficeMapping:
        input.deliveryOfficeMapping ||
        (input.deliveryOfficeMappings ? input.deliveryOfficeMappings.join(', ') : undefined),
      assignedColonies: input.assignedColonies,
      fixedKm: input.fixedKm,
      dailyEntryLimit: input.dailyEntryLimit,
      canViewAllRecords: input.canViewAllRecords,
      serviceModules: input.serviceModules,
      approvalStatus: input.approvalStatus,
    });
  }

  public getDirectoryStaff(): Staff[] {
    return [...this.directoryStaff];
  }

  // ================= AUTO-MANAGED OFFICES & BEATS (DERIVED LIVE FROM STAFF + CUSTOM OFFICES) =================

  private normalizeOfficeRecord(o: Partial<DynamicOfficeRecord> & { id: string; officeName: string }): DynamicOfficeRecord {
    const rawType = (o.officeType || o.officeVariant || 'SO').toUpperCase();
    const normType: string = rawType.includes('EV')
      ? 'EV Hub'
      : rawType.includes('FRANCHISE')
      ? 'Logistics Franchise'
      : rawType.includes('STORE')
      ? 'Hyperlocal Store'
      : rawType.includes('B') && !rawType.includes('HUB')
      ? 'BO'
      : rawType.includes('H') && !rawType.includes('HUB') && !rawType.includes('HYPER')
      ? 'HO'
      : 'SO';

    const defaultVariant: OfficeVariantType =
      o.officeVariant ||
      (normType === 'EV Hub'
        ? 'EV Mobility Hub'
        : normType === 'Logistics Franchise'
        ? 'Logistics Franchise'
        : normType === 'Hyperlocal Store'
        ? 'Hyperlocal Dark Store'
        : normType === 'HO'
        ? 'Head Post Office (H.O.)'
        : normType === 'BO'
        ? 'Branch Post Office (B.O.)'
        : 'Sub Post Office (S.O.)');

    const ho = o.headOffice || o.hoName || 'Kota H.O.';
    const so = o.subOffice || o.soName || o.officeName || 'Dadabari S.O.';
    const bo = o.branchOffice || o.boName || undefined;
    const names = o.assignedStaffNames || [];
    const ids = o.assignedStaffIds || [];
    const count = o.assignedStaffCount ?? o.staffCount ?? names.length;
    const officeMeta = resolveOfficeMetadata(o.officeName || o.subOffice, o.branchOffice, o.pincode);
    const derivedDivision = o.division || 'Kota Division';
    const derivedDistrict = o.district || derivedDivision.replace(/\s*Division/i, '').trim() || 'Kota';

    const serviceCategories = this.deriveOfficeServiceCategories({
      ...o,
      officeType: normType,
      officeVariant: defaultVariant,
    });

    return {
      id: o.id,
      officeId: o.officeId || officeMeta.officeId,
      officeName: o.officeName,
      postOfficeName: o.postOfficeName || officeMeta.postOfficeName,
      officeType: normType,
      businessCategory: o.businessCategory || (defaultVariant as any),
      officeVariant: defaultVariant,
      businessSectionName: o.businessSectionName || '',
      businessSectionCategory: o.businessSectionCategory || serviceCategories[0] || 'Postal & Last-Mile Logistics',
      businessSectionLandmark: o.businessSectionLandmark || '',
      operationalRemarks: o.operationalRemarks || '',
      serviceCategories,
      circle: o.circle || 'Rajasthan Circle',
      division: derivedDivision,
      district: derivedDistrict,
      block: o.block || o.subDivision || '',
      subDivision: o.subDivision || o.block || '',
      headOffice: ho,
      hoName: ho,
      subOffice: so,
      soName: so,
      branchOffice: bo,
      boName: bo,
      pincode: o.pincode || officeMeta.pincode || '324009',
      completeAddress: o.completeAddress || `${so}, ${derivedDivision} - ${o.pincode || '324009'}`,
      mappedBeats: o.mappedBeats || ['Beat 1'],
      mappedColonies: o.mappedColonies || [],
      linkedDeliveryOffices: o.linkedDeliveryOffices || officeMeta.linkedDeliveryOffices,
      coveragePercentage: o.coveragePercentage ?? 98.2,
      assignedStaffCount: count,
      staffCount: count,
      realStaffCount: o.realStaffCount ?? count,
      isVacant: (o.realStaffCount ?? count) === 0,
      assignedStaffNames: names,
      assignedStaffIds: ids,
      assignedInchargeName: o.assignedInchargeName,
      assignedDistrictIncharge: o.assignedDistrictIncharge,
      assignedBlockIncharge: o.assignedBlockIncharge,
      pincodeManager: o.pincodeManager,
      pincodeManagerContact: o.pincodeManagerContact,
      beatStaffAssignments: o.beatStaffAssignments,
      boundPropertiesCount: o.boundPropertiesCount,
      stockSkusCount: o.stockSkusCount,
      isAutoManaged: o.isAutoManaged ?? true,
      updatedAt: o.updatedAt || new Date().toISOString(),
    };
  }

  public getAutoManagedOffices(): DynamicOfficeRecord[] {
    if (this.cachedAutoOffices) {
      return this.cachedAutoOffices;
    }
    const officeMap = new Map<string, DynamicOfficeRecord>();
    const seenIds = new Set<string>();
    const seenOfficeCodes = new Set<string>();

    const canonicalKey = (raw: string): string =>
      (raw || '')
        .replace(/\([^)]*\)/g, '')
        .replace(/\./g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

    const registerOffice = (key: string, rec: DynamicOfficeRecord) => {
      const normRec = this.normalizeOfficeRecord(rec);
      if (normRec.id) seenIds.add(normRec.id.toUpperCase());
      if (normRec.officeId) seenOfficeCodes.add(normRec.officeId.toUpperCase());
      officeMap.set(key, normRec);
    };

    // Seed from customOffices first (guaranteeing unique id & officeId)
    for (const co of this.customOffices) {
      const cKey = canonicalKey(co.officeName || co.subOffice || '');
      const idKey = (co.id || '').toUpperCase();
      const codeKey = (co.officeId || '').toUpperCase();
      if ((idKey && seenIds.has(idKey)) || (codeKey && seenOfficeCodes.has(codeKey)) || officeMap.has(cKey)) {
        continue;
      }
      registerOffice(cKey || co.officeName.toLowerCase(), co);
    }

    // Dynamically group and build from all Directory Staff
    for (const s of this.directoryStaff) {
      if (this.isElevatedOrSyntheticStaffRecord(s)) continue;
      const circle = s.circle || 'Rajasthan Circle';
      const division = s.division || 'Kota Division';
      const ho = s.headOffice || 'Kota H.O.';
      const so = s.subOffice || s.subOrBranchOffice || 'Dadabari S.O.';
      const bo = s.branchOffice || '';
      const pin = s.officePincode || '324009';
      const addr =
        s.officeAddress ||
        `${so}, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - ${pin}`;

      const primaryOfficeName = bo ? `${bo} (under ${so})` : so;
      const officeType: 'HO' | 'SO' | 'BO' = bo
        ? 'BO'
        : so.toUpperCase().includes('H.O') || so.toUpperCase().includes('HEAD')
        ? 'HO'
        : 'SO';

      const key = canonicalKey(primaryOfficeName);
      const existing = officeMap.get(key);
      const staffBeats = s.assignedBeats?.length ? s.assignedBeats : [s.beat];
      const staffColonies = s.assignedColonies?.length ? s.assignedColonies : getDefaultColoniesForBeat(s.beat);

      if (!existing) {
        let genId = `AUTO-OFF-${officeMap.size + 1}`;
        while (seenIds.has(genId.toUpperCase())) {
          genId = `AUTO-OFF-${officeMap.size + 1}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
        }
        registerOffice(key, {
          id: genId,
          officeName: primaryOfficeName,
          officeType,
          circle,
          division,
          district: s.district || division.replace(/\s*Division/i, '').trim(),
          block: s.block,
          headOffice: ho,
          hoName: ho,
          subOffice: so,
          soName: so,
          branchOffice: bo || undefined,
          boName: bo || undefined,
          pincode: pin,
          completeAddress: addr,
          mappedBeats: [...new Set(staffBeats)],
          mappedColonies: [...new Set(staffColonies)],
          assignedStaffCount: 1,
          staffCount: 1,
          assignedStaffNames: [s.name],
          assignedStaffIds: [s.id],
          brandId: s.brandId || 'india-post',
          brandName: s.brandName || 'India Post',
          isAutoManaged: true,
          updatedAt: new Date().toISOString(),
        });
      } else {
        existing.circle = existing.circle || circle;
        existing.division = existing.division || division;
        existing.headOffice = existing.headOffice || ho;
        existing.hoName = existing.headOffice;
        existing.subOffice = existing.subOffice || so;
        existing.soName = existing.subOffice;
        existing.pincode = existing.pincode || pin;
        if (s.officeAddress && !existing.completeAddress) existing.completeAddress = s.officeAddress;
        existing.mappedBeats = [...new Set([...existing.mappedBeats, ...staffBeats])];
        existing.mappedColonies = [...new Set([...existing.mappedColonies, ...staffColonies])];
      }

      // Ensure Head Office also exists as an auto-managed parent node
      const hoKey = canonicalKey(ho);
      if (!officeMap.has(hoKey)) {
        let hoGenId = `AUTO-HO-${officeMap.size + 1}`;
        while (seenIds.has(hoGenId.toUpperCase())) {
          hoGenId = `AUTO-HO-${officeMap.size + 1}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
        }
        registerOffice(hoKey, {
          id: hoGenId,
          officeName: ho,
          officeType: 'HO',
          circle,
          division,
          district: division.replace(/\s*Division/i, '').trim(),
          headOffice: ho,
          hoName: ho,
          subOffice: so,
          soName: so,
          pincode: '324001',
          completeAddress: `${ho}, Nayapura / Station Road, ${division}, ${circle} - 324001`,
          mappedBeats: ['All Division Beats'],
          mappedColonies: ['Kota Head Office Jurisdiction'],
          assignedStaffCount: 0,
          staffCount: 0,
          assignedStaffNames: [],
          assignedStaffIds: [],
          brandId: 'india-post',
          brandName: 'India Post',
          isAutoManaged: true,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Ensure Engineering College S.O. exists (outside directoryStaff loop)
    const engKey = canonicalKey('engineering college s.o.');
    if (!officeMap.has(engKey) && !seenIds.has('AUTO-SO-ENG-COLLEGE') && !seenOfficeCodes.has('ENG_COLLEGE_SO')) {
      registerOffice(engKey, {
        id: 'AUTO-SO-ENG-COLLEGE',
        officeId: 'ENG_COLLEGE_SO',
        officeName: 'Engineering College S.O.',
        postOfficeName: 'Engineering College S.O.',
        officeType: 'SO',
        circle: 'Rajasthan Circle',
        division: 'Kota Division',
        district: 'Kota',
        headOffice: 'Kota H.O.',
        hoName: 'Kota H.O.',
        subOffice: 'Engineering College S.O.',
        soName: 'Engineering College S.O.',
        pincode: '324010',
        completeAddress: 'Engineering College Sub-Post Office, RTU Campus Road, Rawatbhata Road, Kota - 324010',
        mappedBeats: ['Beat EC-1', 'Beat EC-2'],
        mappedColonies: ['RTU Campus', 'Srinathpuram Sector A & B', 'Akelgarh', 'Talwandi Sector 1-4', 'Jawahar Nagar'],
        linkedDeliveryOffices: ['Dadabari S.O. (324009)'],
        coveragePercentage: 96.8,
        assignedStaffCount: 0,
        staffCount: 0,
        assignedStaffNames: [],
        assignedStaffIds: [],
        brandId: 'india-post',
        brandName: 'India Post',
        isAutoManaged: true,
        updatedAt: new Date().toISOString(),
      });
    }

    // Ensure all Rajasthan / Kota City S.O., H.O., and B.O. offices from KOTA_OFFICE_MASTER_LIST exist cleanly
    for (const po of KOTA_OFFICE_MASTER_LIST) {
      const poKey = canonicalKey(po.name);
      const targetId = `AUTO-${po.officeId}`;
      const targetCode = (po.officeId || '').toUpperCase();
      if (
        !officeMap.has(poKey) &&
        !seenIds.has(targetId.toUpperCase()) &&
        (!targetCode || !seenOfficeCodes.has(targetCode))
      ) {
        registerOffice(poKey, {
          id: targetId,
          officeId: po.officeId,
          officeName: po.name,
          postOfficeName: po.name,
          officeType: po.type,
          circle: po.circle || 'Rajasthan Circle',
          division: po.division || 'Kota Division',
          district: po.district || 'Kota',
          subDivision: po.subDivision || 'Kota West Sub-Division',
          headOffice: po.type === 'HO' ? po.name : (po.parentOffice ? po.parentOffice.split('(')[0].trim() : `${po.division || 'Kota Division'} Head Office`),
          hoName: po.type === 'HO' ? po.name : (po.parentOffice ? po.parentOffice.split('(')[0].trim() : `${po.division || 'Kota Division'} Head Office`),
          subOffice: po.type === 'BO' ? po.parentOffice.replace(/\(\d+\)/, '').trim() : po.name,
          soName: po.type === 'BO' ? po.parentOffice.replace(/\(\d+\)/, '').trim() : po.name,
          branchOffice: po.type === 'BO' ? po.name : undefined,
          boName: po.type === 'BO' ? po.name : undefined,
          pincode: po.pin,
          completeAddress: po.address,
          mappedBeats: po.defaultBeats,
          mappedColonies: po.defaultColonies,
          linkedDeliveryOffices:
            po.type === 'HO'
              ? [`${po.name} Local Beats`, `${po.division} Delivery Hub`]
              : [po.parentOffice, `${po.division} Head Office`],
          coveragePercentage: 97.4,
          assignedStaffCount: 0,
          staffCount: 0,
          assignedStaffNames: [],
          assignedStaffIds: [],
          brandId: 'india-post',
          brandName: 'India Post',
          isAutoManaged: true,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Reconcile accurate real staff counts, incharges, and vacancy status per office
    const allOfficesRaw = Array.from(officeMap.values()).map(office => {
      const realStaff = this.collectRealStaffForOffice(office);
      const incharge = realStaff.find(st => {
        const r = (st.role || '').toUpperCase();
        const d = (st.designationType || st.designation || '').toLowerCase();
        return (
          r === 'OFFICE_INCHARGE' ||
          r === 'DISTRICT_MANAGER' ||
          r === 'DISTRICT_INCHARGE' ||
          d.includes('incharge') ||
          d.includes('postmaster') ||
          d.includes('spm')
        );
      });
      const distIncharge = this.profiles.find(
        p =>
          ['DISTRICT_MANAGER', 'DISTRICT_INCHARGE'].includes((p.role || '').toUpperCase()) &&
          (p.district || p.division || '').toLowerCase().includes((office.district || '').toLowerCase())
      );

      const typLower = `${office.officeType || ''} ${office.officeVariant || ''} ${office.businessCategory || ''}`.toLowerCase();
      const isCommercialHub =
        typLower.includes('ev') ||
        typLower.includes('logistics franchise') ||
        typLower.includes('hyperlocal');

      return {
        ...office,
        brandId: office.brandId || (isCommercialHub ? 'xpeedo-logistics' : 'india-post'),
        brandName: office.brandName || (isCommercialHub ? 'Xpeedo Logistics' : 'India Post'),
        realStaffCount: realStaff.length,
        isVacant: realStaff.length === 0,
        assignedStaffCount: realStaff.length,
        staffCount: realStaff.length,
        assignedStaffNames: realStaff.map(st => st.name),
        assignedStaffIds: realStaff.map(st => st.employeeId || st.id),
        assignedInchargeName: office.assignedInchargeName || incharge?.name,
        assignedDistrictIncharge: office.assignedDistrictIncharge || distIncharge?.name,
        serviceCategories: this.deriveOfficeServiceCategories(office),
      };
    });

    // Final hard uniqueness pass by record.id to eliminate any possible React duplicate key error
    const finalById = new Map<string, DynamicOfficeRecord>();
    for (const off of allOfficesRaw) {
      const idNorm = (off.id || '').trim();
      if (idNorm && !finalById.has(idNorm)) {
        finalById.set(idNorm, off);
      }
    }
    const allOffices = Array.from(finalById.values());

    if (this.archivedOfficeKeys.length > 0) {
      this.cachedAutoOffices = allOffices.filter(o => {
        const normId = (o.id || '').toLowerCase();
        const normName = (o.officeName || '').toLowerCase();
        const normOfficeId = (o.officeId || '').toLowerCase();
        return !this.archivedOfficeKeys.some(k => k === normId || k === normName || k === normOfficeId);
      });
    } else {
      this.cachedAutoOffices = allOffices;
    }
    return this.cachedAutoOffices;
  }

  public getDynamicOffices(activeUser?: StaffProfile | null): DynamicOfficeRecord[] {
    const allOffices = this.getAutoManagedOffices();
    const session = activeUser !== undefined ? activeUser : this.getActiveSession();
    const scopedVendor = featureVisibilityService.isStrictlyScopedToVendor(session);
    if (scopedVendor === 'INDIA_POST') {
      return allOffices.filter((o) => {
        const typ = `${o.officeType || ''} ${o.officeVariant || ''} ${o.businessCategory || ''}`.toLowerCase();
        if (
          typ.includes('ev') ||
          typ.includes('dark store') ||
          typ.includes('hyperlocal store') ||
          typ.includes('logistics franchise') ||
          typ.includes('saas')
        ) {
          return false;
        }
        return true;
      });
    }
    return allOffices;
  }

  public getHierarchyOptions(): {
    circles: string[];
    divisions: string[];
    districts: string[];
    subDivisions: string[];
    headOffices: string[];
    subOffices: string[];
    branchOffices: string[];
    pincodes: string[];
    beats: string[];
  } {
    const offices = this.getAutoManagedOffices();
    const circles = [...new Set(offices.map(o => o.circle).filter(Boolean))];
    const divisions = [
      'Kota Division',
      'Baran Division',
      'Jhalawar Division',
      'Bundi Division',
      'Tonk Division',
      ...new Set(offices.map(o => o.division).filter(Boolean)),
    ].filter((v, i, a) => a.indexOf(v) === i);
    const districts = [
      'Kota',
      'Baran',
      'Jhalawar',
      'Bundi',
      'Tonk',
      ...new Set(offices.map(o => o.district).filter(Boolean)),
    ].filter((v, i, a) => a.indexOf(v) === i);
    const subDivisions = [...new Set(offices.map(o => o.subDivision).filter(Boolean))];
    const headOffices = [...new Set(offices.map(o => o.headOffice).filter(Boolean))];
    const subOffices = [...new Set(offices.map(o => o.subOffice).filter(Boolean))];
    const branchOffices = [...new Set(offices.map(o => o.branchOffice || '').filter(Boolean))];
    const pincodes = [...new Set(offices.map(o => o.pincode).filter(Boolean))];
    const beats = [
      ...new Set([
        ...this.directoryStaff.map(s => s.beat).filter(Boolean),
        ...this.colonyBeatMappings.map(m => m.beatNumber).filter(Boolean),
      ]),
    ];
    return { circles, divisions, districts, subDivisions, headOffices, subOffices, branchOffices, pincodes, beats };
  }

  public getManagedBeatOverrides(): ManagedBeatOverrideRecord[] {
    return [...this.managedBeatOverrides];
  }

  private saveManagedBeats(notify = true) {
    try {
      localStorage.setItem(MANAGED_BEATS_STORAGE_KEY, JSON.stringify(this.managedBeatOverrides));
    } catch (e) {
      console.warn('Error saving managed beat overrides:', e);
    }
    if (notify) this.notifyListeners();
  }

  public upsertManagedBeat(input: {
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
  }): ManagedBeatOverrideRecord {
    const cleanPin = (input.pincode || '324009').trim();
    const meta = resolveOfficeMetadata(input.postOfficeName, '', cleanPin);
    const resolvedOfficeId = input.officeId || meta.officeId;
    const rawBeat = (input.beatNo || '1').replace(/^Beat\s+/i, '').trim();
    const beatLabel = `Beat ${rawBeat}`;
    const compositeKey = `${resolvedOfficeId.toUpperCase()}::${rawBeat.toUpperCase()}`;

    let assignedStaff: StaffProfile | undefined;
    if (input.assignedStaffId) {
      const targetKey = input.assignedStaffId.trim().toLowerCase();
      assignedStaff = this.profiles.find(
        p =>
          p.id.toLowerCase() === targetKey ||
          (p.employeeId || '').toLowerCase() === targetKey ||
          p.email.toLowerCase() === targetKey
      );
    }

    const cleanColonies = Array.from(
      new Set((input.colonies || []).map(c => c.trim()).filter(Boolean))
    );

    const record: ManagedBeatOverrideRecord = {
      id: `MBEAT-${resolvedOfficeId}-${rawBeat.replace(/[^a-z0-9]/gi, '').toUpperCase()}`,
      compositeKey,
      officeId: resolvedOfficeId,
      postOfficeName: input.postOfficeName.trim() || meta.postOfficeName,
      officeType: input.officeType || meta.officeType,
      division: input.division || meta.division || 'Kota Division',
      circle: input.circle || meta.circle || 'Rajasthan Circle',
      parentOffice: input.parentOffice || meta.parentOfficeName,
      pincode: cleanPin,
      beatNo: rawBeat,
      beatTitle: input.beatTitle?.trim() || `${beatLabel} — ${input.postOfficeName.trim() || meta.postOfficeName}`,
      fixedKm: input.fixedKm && input.fixedKm > 0 ? input.fixedKm : 18,
      assignedStaffId: assignedStaff?.id,
      assignedPostman: assignedStaff?.name || 'Unassigned / Relief Charge',
      employeeId: assignedStaff?.employeeId || 'RELIEF',
      contact: assignedStaff?.contact || '9414000000',
      colonies: cleanColonies,
      updatedAt: new Date().toISOString(),
      updatedBy: input.actorName || 'Division Admin',
    };

    const existingIdx = this.managedBeatOverrides.findIndex(
      m => m.compositeKey === compositeKey || m.id === record.id
    );
    if (existingIdx >= 0) {
      this.managedBeatOverrides[existingIdx] = record;
    } else {
      this.managedBeatOverrides.push(record);
    }

    // Sync assigned Master Staff profile & directory record cleanly
    if (assignedStaff) {
      const pIdx = this.profiles.findIndex(p => p.id === assignedStaff!.id);
      if (pIdx >= 0) {
        const prev = this.profiles[pIdx];
        const nextBeats = Array.from(new Set([...(prev.assignedBeats || []), beatLabel]));
        const nextCols = cleanColonies.length ? Array.from(new Set([...(prev.assignedColonies || []), ...cleanColonies])) : prev.assignedColonies;
        this.profiles[pIdx] = {
          ...prev,
          beat: beatLabel,
          assignedBeats: nextBeats,
          officeId: resolvedOfficeId,
          subOffice: record.postOfficeName,
          postOfficeName: record.postOfficeName,
          assignedOffice: `${record.postOfficeName} (${cleanPin})`,
          officePincode: cleanPin,
          assignedColonies: nextCols,
          permissions: {
            ...prev.permissions,
            allowedBeats: Array.from(new Set([...(prev.permissions?.allowedBeats || []), beatLabel])),
            allowedOffices: Array.from(new Set([...(prev.permissions?.allowedOffices || []), record.postOfficeName])),
            allowedColonies: nextCols,
          },
          updatedAt: new Date().toISOString(),
        };
      }
      const dIdx = this.directoryStaff.findIndex(
        d => d.id === assignedStaff!.id || (assignedStaff!.employeeId && d.employeeId === assignedStaff!.employeeId)
      );
      if (dIdx >= 0) {
        this.directoryStaff[dIdx] = {
          ...this.directoryStaff[dIdx],
          beat: beatLabel,
          assignedBeat: beatLabel,
          assignedBeats: Array.from(new Set([...(this.directoryStaff[dIdx].assignedBeats || []), beatLabel])),
          officeId: resolvedOfficeId,
          subOffice: record.postOfficeName,
          subOrBranchOffice: record.postOfficeName,
          postedOfficeName: record.postOfficeName,
          officePincode: cleanPin,
          assignedColonies: cleanColonies.length ? cleanColonies : this.directoryStaff[dIdx].assignedColonies,
        };
      }
      this.saveDirectoryStaff(false);
      this.saveProfiles(false);
    }

    // Sync colonies into colonyBeatMappings
    cleanColonies.forEach(colonyName => {
      this.upsertColonyBeatMapping({
        colonyName,
        beatNumber: beatLabel,
        assignedBeatNumber: beatLabel,
        sectorNumber: 'All Sectors',
        pincode: cleanPin,
        subOrHoOffice: record.postOfficeName,
        assignedPostmanName: record.assignedPostman,
        assignedPostmanContact: record.contact,
      });
    });

    this.saveManagedBeats(true);
    return record;
  }

  public reassignBeatPostman(input: {
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
    record?: ManagedBeatOverrideRecord;
    previousPostman?: string;
    newStaff?: StaffProfile;
    error?: string;
  } {
    const cleanPin = (input.pincode || '324009').trim();
    const meta = resolveOfficeMetadata(input.postOfficeName, '', cleanPin);
    const resolvedOfficeId = input.officeId || meta.officeId;
    const rawBeat = (input.beatNo || '').replace(/^Beat\s+/i, '').trim();
    if (!rawBeat) {
      return { success: false, error: 'Invalid Beat number for reassignment.' };
    }
    const targetKey = input.newStaffId.trim().toLowerCase();
    const staff = this.profiles.find(
      p =>
        p.id.toLowerCase() === targetKey ||
        (p.employeeId || '').toLowerCase() === targetKey ||
        p.email.toLowerCase() === targetKey
    );
    if (!staff) {
      return { success: false, error: 'Selected Master Staff profile not found.' };
    }

    const compositeKey = `${resolvedOfficeId.toUpperCase()}::${rawBeat.toUpperCase()}`;
    const prevOverride = this.managedBeatOverrides.find(m => m.compositeKey === compositeKey);
    const prevMatrix = CONSOLIDATED_BEAT_MATRIX.find(
      m =>
        m.beatNumber.replace(/^Beat\s+/i, '').trim().toUpperCase() === rawBeat.toUpperCase() &&
        m.pincode === cleanPin
    );
    const previousPostman = prevOverride?.assignedPostman || prevMatrix?.assignedPostmanName || 'Previous Assignee';

    const record = this.upsertManagedBeat({
      officeId: resolvedOfficeId,
      postOfficeName: input.postOfficeName || meta.postOfficeName,
      officeType: input.officeType || meta.officeType,
      division: meta.division || 'Kota Division',
      circle: meta.circle || 'Rajasthan Circle',
      parentOffice: meta.parentOfficeName,
      pincode: cleanPin,
      beatNo: rawBeat,
      beatTitle: prevOverride?.beatTitle,
      fixedKm: prevOverride?.fixedKm || 18,
      colonies: input.colonies && input.colonies.length > 0 ? input.colonies : prevOverride?.colonies || prevMatrix?.colonies || [],
      assignedStaffId: staff.id,
      actorName: input.actorName,
    });

    return {
      success: true,
      record,
      previousPostman,
      newStaff: staff,
    };
  }

  public getDynamicBeatsSummary(): {
    beatNumber: string;
    officeId: string;
    officeName: string;
    pincode: string;
    colonies: string[];
    assignedStaff: StaffProfile[];
  }[] {
    const beatMap = new Map<
      string,
      {
        beatNumber: string;
        officeId: string;
        officeName: string;
        pincode: string;
        colonies: string[];
        assignedStaff: StaffProfile[];
      }
    >();

    // Seed with CONSOLIDATED_BEAT_MATRIX first keyed strictly by officeId::beatNo
    for (const entry of CONSOLIDATED_BEAT_MATRIX) {
      const meta = resolveOfficeMetadata(entry.deliveryOffice || entry.officeName, '', entry.pincode);
      const rawNo = entry.beatNumber.replace(/^Beat\s+/i, '').trim();
      const mapKey = `${meta.officeId}::${rawNo.toLowerCase()}`;
      const matchedStaff = this.profiles.filter(p => {
        if (this.isGovernanceProfileRecord(p)) return false;
        const pMeta = resolveOfficeMetadata(p.subOffice || p.assignedOffice, p.branchOffice, p.officePincode);
        const pBeat = (p.beat || '').replace(/^Beat\s+/i, '').trim().toLowerCase();
        return pMeta.officeId === meta.officeId && pBeat === rawNo.toLowerCase();
      });
      beatMap.set(mapKey, {
        beatNumber: entry.beatNumber,
        officeId: meta.officeId,
        officeName: entry.deliveryOffice || entry.officeName,
        pincode: entry.pincode,
        colonies: [...(entry.colonies || [])],
        assignedStaff: matchedStaff,
      });
    }

    // Apply managedBeatOverrides
    for (const mb of this.managedBeatOverrides) {
      const rawNo = mb.beatNo.replace(/^Beat\s+/i, '').trim();
      const mapKey = `${mb.officeId}::${rawNo.toLowerCase()}`;
      const assignedProf = mb.assignedStaffId
        ? this.profiles.filter(p => p.id === mb.assignedStaffId)
        : [];
      const existing = beatMap.get(mapKey);
      if (!existing) {
        beatMap.set(mapKey, {
          beatNumber: `Beat ${rawNo}`,
          officeId: mb.officeId,
          officeName: mb.postOfficeName,
          pincode: mb.pincode,
          colonies: [...(mb.colonies || [])],
          assignedStaff: assignedProf,
        });
      } else {
        if (mb.colonies.length > 0) existing.colonies = [...new Set([...existing.colonies, ...mb.colonies])];
        if (assignedProf.length > 0) existing.assignedStaff = assignedProf;
      }
    }

    for (const p of this.profiles) {
      if (this.isGovernanceProfileRecord(p)) continue;
      const meta = resolveOfficeMetadata(p.postOfficeName || p.branchOffice || p.subOffice || p.assignedOffice, p.branchOffice, p.officePincode);
      const beatKey = (p.beat || 'Beat 2').trim();
      const rawNo = beatKey.replace(/^Beat\s+/i, '').trim();
      if (!rawNo || rawNo.toLowerCase() === 'all beats') continue;
      const mapKey = `${meta.officeId}::${rawNo.toLowerCase()}`;
      const existing = beatMap.get(mapKey);
      const cols = p.assignedColonies || getDefaultColoniesForBeat(beatKey);
      if (!existing) {
        beatMap.set(mapKey, {
          beatNumber: beatKey.startsWith('Beat') ? beatKey : `Beat ${beatKey}`,
          officeId: meta.officeId,
          officeName: meta.postOfficeName,
          pincode: p.officePincode || meta.pincode || '324009',
          colonies: [...new Set(cols)],
          assignedStaff: [p],
        });
      } else {
        existing.colonies = [...new Set([...existing.colonies, ...cols])];
        if (!existing.assignedStaff.some(st => st.email === p.email || st.id === p.id)) {
          existing.assignedStaff.push(p);
        }
      }
    }

    for (const m of this.colonyBeatMappings) {
      const meta = resolveOfficeMetadata(m.subOrHoOffice || 'Dadabari S.O.', m.branchOffice, m.pincode);
      const beatKey = (m.beatNumber || m.assignedBeatNumber || 'Beat 2').trim();
      const rawNo = beatKey.replace(/^Beat\s+/i, '').trim();
      const mapKey = `${meta.officeId}::${rawNo.toLowerCase()}`;
      const existing = beatMap.get(mapKey);
      const label = m.sectorNumber && m.sectorNumber !== 'All Sectors'
        ? `${m.colonyName} (${m.sectorNumber})`
        : m.colonyName;
      if (!existing) {
        beatMap.set(mapKey, {
          beatNumber: beatKey.startsWith('Beat') ? beatKey : `Beat ${beatKey}`,
          officeId: meta.officeId,
          officeName: meta.postOfficeName,
          pincode: m.pincode || meta.pincode || '324009',
          colonies: [label],
          assignedStaff: [],
        });
      } else if (!existing.colonies.includes(label)) {
        existing.colonies.push(label);
      }
    }

    return Array.from(beatMap.values());
  }

  public upsertCustomOffice(office: Partial<DynamicOfficeRecord> & { officeName: string }): DynamicOfficeRecord {
    const record: DynamicOfficeRecord = this.normalizeOfficeRecord({
      ...office,
      id: office.id || `OFFICE-${Date.now().toString().slice(-5)}`,
      isAutoManaged: false,
      updatedAt: new Date().toISOString(),
    });

    const normName = record.officeName.trim().toLowerCase();
    const normPin = (record.pincode || '').trim();
    const normId = (record.id || '').toLowerCase();
    const normOfficeId = (record.officeId || '').toLowerCase();

    // Unarchive if previously deleted/archived
    if (this.archivedOfficeKeys.length > 0) {
      this.archivedOfficeKeys = this.archivedOfficeKeys.filter(
        k => k !== normName && k !== normId && k !== normOfficeId
      );
      try {
        localStorage.setItem(ARCHIVED_OFFICE_STORAGE_KEY, JSON.stringify(this.archivedOfficeKeys));
      } catch (e) {
        console.warn('Failed to update archived offices:', e);
      }
    }

    // Check if an existing custom office matches by ID or (Name + Pincode)
    const idx = this.customOffices.findIndex(
      o =>
        o.id === record.id ||
        (o.officeName.trim().toLowerCase() === normName && (o.pincode || '').trim() === normPin)
    );

    if (idx >= 0) {
      this.customOffices[idx] = {
        ...this.customOffices[idx],
        ...record,
        id: this.customOffices[idx].id, // preserve existing unique ID
      };
    } else {
      const existingDupIdx = this.customOffices.findIndex(
        o => o.officeName.trim().toLowerCase() === normName && (o.pincode || '').trim() === normPin
      );
      if (existingDupIdx >= 0) {
        this.customOffices[existingDupIdx] = {
          ...this.customOffices[existingDupIdx],
          ...record,
        };
      } else {
        this.customOffices.push(record);
      }
    }

    // Deduplicate all customOffices by canonical name+pin AND id
    const uniqueMap = new Map<string, DynamicOfficeRecord>();
    const seenIds = new Set<string>();
    for (const co of this.customOffices) {
      const normCoName = (co.officeName || '')
        .replace(/\([^)]*\)/g, '')
        .replace(/\./g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
      const key = `${normCoName}_${(co.pincode || '').trim()}`;
      const idNorm = (co.id || '').toUpperCase();
      if (idNorm && seenIds.has(idNorm)) continue;
      if (idNorm) seenIds.add(idNorm);
      uniqueMap.set(key, co);
    }
    this.customOffices = Array.from(uniqueMap.values());

    this.cachedAutoOffices = null;
    this.saveCustomOffices(true);
    return record;
  }

  // ================= ENHANCED ADDRESS & COLONY-BEAT MAPPING ENGINE =================

  public getColonyBeatMappings(): ColonyBeatMapping[] {
    return this.colonyBeatMappings.map(m => this.normalizeColonyMapping(m));
  }

  public upsertColonyBeatMapping(
    mapping: Partial<ColonyBeatMapping> & { colonyName: string }
  ): ColonyBeatMapping {
    const targetBeat = mapping.beatNumber || mapping.assignedBeatNumber || 'Beat 2';
    // Auto-lookup postman for this beat if not provided
    const matchedStaff = this.directoryStaff.find(
      s => s.beat.toLowerCase() === targetBeat.toLowerCase()
    );

    const record: ColonyBeatMapping = this.normalizeColonyMapping({
      ...mapping,
      id: mapping.id || `CBM-${Date.now().toString().slice(-6)}`,
      colonyName: mapping.colonyName,
      sectorNumber: mapping.sectorNumber || mapping.sectorOrPhase || 'All Sectors',
      landmark: mapping.landmark || '',
      pincode: mapping.pincode || mapping.areaPincode || '324009',
      subOrHoOffice: mapping.subOrHoOffice || mapping.subOrHeadOffice || 'Dadabari S.O. / Kota H.O.',
      branchOffice: mapping.branchOffice || '',
      beatNumber: targetBeat,
      assignedPostmanName: mapping.assignedPostmanName || matchedStaff?.name || 'Assigned Beat Postman',
      assignedPostmanContact:
        mapping.assignedPostmanContact || mapping.assignedPostmanMobile || matchedStaff?.contact || '0744-2500123',
      updatedAt: new Date().toISOString(),
    });

    const idx = this.colonyBeatMappings.findIndex(
      m =>
        m.id === record.id ||
        (m.colonyName.toLowerCase() === record.colonyName.toLowerCase() &&
          m.sectorNumber.toLowerCase() === record.sectorNumber.toLowerCase())
    );
    if (idx >= 0) {
      this.colonyBeatMappings[idx] = record;
    } else {
      this.colonyBeatMappings.unshift(record);
    }
    this.saveColonyMappings(true);
    return record;
  }

  public addOrUpdateColonyMapping(
    mapping: Partial<ColonyBeatMapping> & { colonyName: string }
  ): ColonyBeatMapping {
    return this.upsertColonyBeatMapping(mapping);
  }

  public deleteColonyBeatMapping(id: string): void {
    this.colonyBeatMappings = this.colonyBeatMappings.filter(m => m.id !== id);
    this.saveColonyMappings(true);
  }

  public deleteColonyMapping(id: string): void {
    this.deleteColonyBeatMapping(id);
  }

  public unmapColonyFromBeat(colonyName: string, beatNumber: string): void {
    const normCol = colonyName.trim().toLowerCase();
    const normBeat = beatNumber.replace(/^Beat\s+/i, '').trim().toLowerCase();
    this.colonyBeatMappings = this.colonyBeatMappings.filter(m => {
      const mCol = m.colonyName.trim().toLowerCase();
      const mBeat = (m.beatNumber || m.assignedBeatNumber || '').replace(/^Beat\s+/i, '').trim().toLowerCase();
      return !(mCol === normCol && (mBeat === normBeat || !beatNumber));
    });
    this.saveColonyMappings(true);
  }

  public resolveColonyToBeatAndPincode(
    colonyQuery: string,
    sectorQuery?: string,
    pincodeQuery?: string
  ): ColonyBeatMapping | undefined {
    const qCol = (colonyQuery || '').trim().toLowerCase();
    const qSec = (sectorQuery || '').trim().toLowerCase();
    const qPin = (pincodeQuery || '').trim();
    if (!qCol && !qSec) return undefined;

    // 1. Try matching both colony and sector
    if (qCol && qSec) {
      const exact = this.colonyBeatMappings.find(
        m =>
          (m.colonyName.toLowerCase().includes(qCol) || qCol.includes(m.colonyName.toLowerCase())) &&
          (m.sectorNumber.toLowerCase().includes(qSec) || qSec.includes(m.sectorNumber.toLowerCase()))
      );
      if (exact) return this.normalizeColonyMapping(exact);
    }

    // 2. Match colony
    if (qCol) {
      const colMatch = this.colonyBeatMappings.find(
        m =>
          m.colonyName.toLowerCase().includes(qCol) ||
          qCol.includes(m.colonyName.toLowerCase()) ||
          m.landmark.toLowerCase().includes(qCol)
      );
      if (colMatch) return this.normalizeColonyMapping(colMatch);
    }

    // 3. Match sector
    if (qSec) {
      const secMatch = this.colonyBeatMappings.find(m => m.sectorNumber.toLowerCase().includes(qSec));
      if (secMatch) return this.normalizeColonyMapping(secMatch);
    }

    // 4. Match pincode fallback if requested
    if (qPin) {
      const pinMatch = this.colonyBeatMappings.find(m => m.pincode === qPin);
      if (pinMatch) return this.normalizeColonyMapping(pinMatch);
    }

    return undefined;
  }

  public resolveColonyBeat(
    colonyQuery: string,
    sectorQuery?: string,
    pincodeQuery?: string
  ): ColonyBeatMapping | undefined {
    return this.resolveColonyToBeatAndPincode(colonyQuery, sectorQuery, pincodeQuery);
  }

  // ================= EXISTING & CORE STAFF PROFILE METHODS =================

  public getStaffProfiles(): StaffProfile[] {
    return [...this.profiles];
  }

  public getAllStaffProfiles(): StaffProfile[] {
    return [...this.profiles];
  }

  public getStaffProfileByEmail(email: string): StaffProfile {
    const normalized = (email || '').trim().toLowerCase();

    const existingIdx = this.profiles.findIndex(p => p.email.toLowerCase() === normalized);
    if (existingIdx >= 0) {
      const norm = this.ensureDayReset(this.profiles[existingIdx]);
      this.profiles[existingIdx] = norm;
      return norm;
    }

    if (normalized === 'ektamahenmeena@gmail.com') {
      const adminProfile = this.normalizeProfile(INITIAL_PROFILES[0]);
      this.profiles.unshift(adminProfile);
      this.saveProfiles(false);
      return adminProfile;
    }

    const matchedStaff = this.directoryStaff.find(
      s =>
        s.email.toLowerCase() === normalized ||
        s.contact === normalized ||
        s.id.toLowerCase() === normalized ||
        (s.employeeId && s.employeeId.toLowerCase() === normalized)
    );

    if (matchedStaff) {
      const created = this.createProfileFromDirectoryStaff(matchedStaff);
      created.email = normalized;
      this.profiles.push(created);
      this.saveProfiles(false);
      return created;
    }

    const assignedBeat = 'Beat 2';
    const newProfile: StaffProfile = this.normalizeProfile({
      id: `STAFF-${Date.now().toString().slice(-6)}`,
      employeeId: `CSI-${Date.now().toString().slice(-6)}`,
      name: (email || 'Postal Staff').split('@')[0].replace(/[._]/g, ' '),
      email: normalized || 'staff@indiapost.gov.in',
      password: DEFAULT_STAFF_FALLBACK_PASSWORD,
      role: 'STAFF',
      designationType: 'Postman',
      contact: '',
      beat: assignedBeat,
      assignedBeats: [assignedBeat],
      assignedOffice: 'Dadabari S.O. (324009)',
      circle: 'Rajasthan Circle',
      division: 'Kota Division',
      headOffice: 'Kota H.O.',
      subOffice: 'Dadabari S.O.',
      officePincode: '324009',
      officeAddress: 'Dadabari Sub-Post Office, Near CAD Circle, Kota - 324009',
      deliveryOfficeMapping: 'Dadabari S.O. (324009)',
      assignedColonies: getDefaultColoniesForBeat(assignedBeat),
      fixedKm: getDefaultFixedKmForBeat(assignedBeat),
      permissions: { ...DEFAULT_STAFF_PERMISSION },
      entriesCreatedToday: 0,
      lastEntryDate: new Date().toISOString().split('T')[0],
      totalEntriesCount: 0,
      status: 'Active',
    });

    this.profiles.push(newProfile);
    this.saveProfiles(false);
    return newProfile;
  }

  public findStaffProfileByIdentifier(identifier: string): StaffProfile | null {
    const raw = (identifier || '').trim();
    if (!raw) return null;
    const rawNorm = raw.toLowerCase();
    const norm =
      rawNorm === 'owner@xpeedo.in'
        ? 'owner@xpokart.in'
        : rawNorm === 'dev@xpeedo.in'
        ? 'dev@xpokart.in'
        : rawNorm;
    const cleanId = norm.replace(/^(staff-|csi-|gds-|emp-)/i, '').trim();
    const cleanDigits = raw.replace(/\D/g, '');
    const phone10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : '';

    // 1. Search existing profiles using strict precedence:
    //    Email -> Exact Employee/User ID -> Stripped Prefix ID -> 10-digit Mobile
    const resolveProfileIndex = (): number => {
      let idx = this.profiles.findIndex(p => (p.email || '').toLowerCase() === norm);
      if (idx >= 0) return idx;

      idx = this.profiles.findIndex(
        p => (p.employeeId || '').toLowerCase() === norm || (p.id || '').toLowerCase() === norm
      );
      if (idx >= 0) return idx;

      if (cleanId) {
        idx = this.profiles.findIndex(p => {
          const pCleanEmpId = (p.employeeId || '').toLowerCase().replace(/^(staff-|csi-|gds-|emp-)/i, '').trim();
          const pCleanId = (p.id || '').toLowerCase().replace(/^(staff-|csi-|gds-|emp-)/i, '').trim();
          return pCleanEmpId === cleanId || pCleanId === cleanId;
        });
        if (idx >= 0) return idx;
      }

      if (phone10) {
        idx = this.profiles.findIndex(p => {
          const pPhone = (p.contact || '').replace(/\D/g, '');
          return pPhone.length >= 10 && pPhone.slice(-10) === phone10;
        });
        if (idx >= 0) return idx;
      }

      return -1;
    };

    const matchedIdx = resolveProfileIndex();
    if (matchedIdx >= 0) {
      const updated = this.ensureDayReset(this.profiles[matchedIdx]);
      this.profiles[matchedIdx] = updated;
      return updated;
    }

    // 2. Fallback to full directoryStaff using the same strict precedence
    const resolveDirMatch = (): Staff | undefined => {
      const byEmail = this.directoryStaff.find(s => {
        const gen = `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@indiapost.gov.in`;
        const sEmail = (s.email || '').toLowerCase();
        return (sEmail && sEmail !== 'n/a' && sEmail === norm) || gen === norm;
      });
      if (byEmail) return byEmail;

      const byExactId = this.directoryStaff.find(
        s => (s.employeeId || '').toLowerCase() === norm || (s.id || '').toLowerCase() === norm
      );
      if (byExactId) return byExactId;

      if (cleanId) {
        const byCleanId = this.directoryStaff.find(s => {
          const sCleanEmpId = (s.employeeId || '').toLowerCase().replace(/^(staff-|csi-|gds-|emp-)/i, '').trim();
          const sCleanId = (s.id || '').toLowerCase().replace(/^(staff-|csi-|gds-|emp-)/i, '').trim();
          return sCleanEmpId === cleanId || sCleanId === cleanId;
        });
        if (byCleanId) return byCleanId;
      }

      if (phone10) {
        return this.directoryStaff.find(s => {
          const sPhone = (s.contact || '').replace(/\D/g, '');
          return sPhone.length >= 10 && sPhone.slice(-10) === phone10;
        });
      }
      return undefined;
    };

    const matchedDir = resolveDirMatch();
    if (matchedDir) {
      const created = this.createProfileFromDirectoryStaff(matchedDir);
      created.assignedBrands = [((matchedDir.brandId || 'india-post').toLowerCase())];
      this.profiles.push(created);
      this.saveProfiles(false);
      return created;
    }

    return null;
  }

  public isAiStudioOrLocalPreview(): boolean {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname.toLowerCase();
    const inIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();
    return (
      host.includes('.run.app') ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      inIframe
    );
  }

  public authenticateWithPassword(
    identifier: string,
    password: string,
    options?: { allowAdminPasswordless?: boolean; skipPasswordCheck?: boolean }
  ): {
    success: boolean;
    profile?: StaffProfile;
    mustChangePassword?: boolean;
    error?: string;
  } {
    const rawId = (identifier || '').trim();
    const cleanPass = (password || '').trim();
    if (!rawId) {
      return {
        success: false,
        error: 'Employee ID / Email / Mobile is required.',
      };
    }

    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('postman_explicit_signout');
      }
    } catch {
      // ignore
    }

    let foundProfile = this.findStaffProfileByIdentifier(rawId);
    const isAdminIdentifier =
      rawId.toLowerCase() === 'ektamahenmeena@gmail.com' ||
      rawId.toUpperCase() === 'MASTER-ADMIN-01' ||
      rawId.toUpperCase() === 'STAFF-MASTER-EKTA';

    if (!foundProfile && isAdminIdentifier) {
      foundProfile = this.normalizeProfile(INITIAL_PROFILES[0]);
      this.profiles.unshift(foundProfile);
      this.saveProfiles(false);
    }

    if (!foundProfile) {
      return {
        success: false,
        error: 'Employee ID / Mobile / Email not found in Staff Directory. Please select your name from the directory or contact Master Admin.',
      };
    }

    if (foundProfile.permissions?.approvalStatus === 'Revoked' || foundProfile.status === 'Inactive') {
      return {
        success: false,
        error: 'Account access has been revoked by Administrator. Contact Master Admin (ektamahenmeena@gmail.com).',
      };
    }

    const isElevated = this.isSuperAdmin(foundProfile) || isAdminIdentifier;
    const isPreviewMode = this.isAiStudioOrLocalPreview();

    if (isElevated) {
      const canUsePilotBypass = Boolean(options?.allowAdminPasswordless && !cleanPass && isPreviewMode);
      if (!canUsePilotBypass) {
        if (!cleanPass) {
          return {
            success: false,
            error: 'Elevated role password is required. Enter your password or use Pilot Quick Sign-In.',
          };
        }
        const adminMatches =
          (Boolean(foundProfile.password) && verifyPasswordSync(cleanPass, foundProfile.password)) ||
          cleanPass === 'Admin' ||
          (foundProfile.role === 'OWNER' && cleanPass === 'Owner@123') ||
          (foundProfile.role === 'DEVELOPER' && cleanPass === 'Dev@123') ||
          cleanPass === DEFAULT_STAFF_FALLBACK_PASSWORD;
        if (!adminMatches) {
          return {
            success: false,
            error: 'Invalid credentials for elevated command role. Please verify your password.',
          };
        }
      }
      if (foundProfile.email?.toLowerCase() === 'ektamahenmeena@gmail.com') {
        foundProfile.role = 'MASTER_ADMIN';
      }
      foundProfile.beat = 'All Beats';
      foundProfile.assignedBeats = ['All Beats'];
      foundProfile.division = 'All Divisions';
    } else {
      const canUseStaffPilotBypass = Boolean(options?.skipPasswordCheck && !cleanPass && isPreviewMode);
      if (!canUseStaffPilotBypass) {
        if (!cleanPass) {
          return {
            success: false,
            error: `Password is required. Enter ${DEFAULT_STAFF_FALLBACK_PASSWORD}, your Employee ID (${foundProfile.employeeId}), or your custom password.`,
          };
        }
        const ok = foundProfile.hasCustomPassword
          ? Boolean(foundProfile.password) && verifyPasswordSync(cleanPass, foundProfile.password)
          : cleanPass === DEFAULT_STAFF_FALLBACK_PASSWORD ||
            cleanPass.toLowerCase() === (foundProfile.employeeId || '').toLowerCase() ||
            (Boolean(foundProfile.password) && verifyPasswordSync(cleanPass, foundProfile.password));
        if (!ok) {
          return {
            success: false,
            error: foundProfile.hasCustomPassword
              ? 'Invalid custom password. Please enter your personal password or use Forgot Password.'
              : `Invalid password. Use default password ${DEFAULT_STAFF_FALLBACK_PASSWORD}, your Employee ID (${foundProfile.employeeId}), or your custom password.`,
          };
        }
      }
    }

    foundProfile.mustChangePassword = false;
    this.setActiveSession(foundProfile);
    return {
      success: true,
      profile: foundProfile,
      mustChangePassword: false,
    };
  }

  public updateOwnPassword(identifier: string, newPassword: string): StaffProfile | null {
    const prof = this.findStaffProfileByIdentifier(identifier);
    if (!prof) return null;
    const cleanPass = newPassword.trim();
    prof.password = hashPasswordSync(cleanPass);
    prof.hasCustomPassword = cleanPass !== DEFAULT_STAFF_FALLBACK_PASSWORD;
    prof.mustChangePassword = false;
    this.addOrUpdateStaff(prof);
    const active = this.getActiveSession();
    if (active && (active.email.toLowerCase() === prof.email.toLowerCase() || active.id === prof.id)) {
      this.setActiveSession(prof);
    }
    return prof;
  }

  public adminUpdateStaffPassword(
    identifier: string,
    newPassword: string
  ): { success: boolean; profile?: StaffProfile; error?: string } {
    const cleanPass = (newPassword || '').trim();
    if (cleanPass.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }
    const prof = this.findStaffProfileByIdentifier(identifier);
    if (!prof) {
      return { success: false, error: 'Staff member not found in directory.' };
    }
    prof.password = hashPasswordSync(cleanPass);
    prof.hasCustomPassword = cleanPass !== DEFAULT_STAFF_FALLBACK_PASSWORD;
    prof.mustChangePassword = false;
    this.addOrUpdateStaff(prof);
    const active = this.getActiveSession();
    if (active && (active.email.toLowerCase() === prof.email.toLowerCase() || active.id === prof.id)) {
      this.setActiveSession(prof);
    }
    return { success: true, profile: prof };
  }

  public adminResetStaffPasswordToDefault(
    identifier: string
  ): { success: boolean; profile?: StaffProfile; error?: string } {
    const prof = this.findStaffProfileByIdentifier(identifier);
    if (!prof) {
      return { success: false, error: 'Staff member not found in directory.' };
    }
    prof.password = hashPasswordSync(DEFAULT_STAFF_FALLBACK_PASSWORD);
    prof.hasCustomPassword = false;
    prof.mustChangePassword = false;
    this.addOrUpdateStaff(prof);
    const active = this.getActiveSession();
    if (active && (active.email.toLowerCase() === prof.email.toLowerCase() || active.id === prof.id)) {
      this.setActiveSession(prof);
    }
    return { success: true, profile: prof };
  }

  public syncAllDirectoryLoginAccess(
    resetExistingToDefault: boolean = false
  ): { totalDirectory: number; activatedCount: number; resetCount: number } {
    let activatedCount = 0;
    let resetCount = 0;

    // 1. Reconcile seed list into directoryStaff
    for (const seedStaff of UPDATED_STAFF_LIST) {
      const enriched = this.enrichDirectoryStaff(seedStaff);
      const idx = this.directoryStaff.findIndex(
        s =>
          s.id.toUpperCase() === enriched.id.toUpperCase() ||
          (s.employeeId && enriched.employeeId && s.employeeId.toUpperCase() === enriched.employeeId.toUpperCase())
      );
      if (idx === -1) {
        this.directoryStaff.push(enriched);
      } else {
        this.directoryStaff[idx] = {
          ...this.directoryStaff[idx],
          employeeId: this.directoryStaff[idx].employeeId || enriched.employeeId,
          email:
            !this.directoryStaff[idx].email || this.directoryStaff[idx].email === 'N/A'
              ? enriched.email
              : this.directoryStaff[idx].email,
        };
      }
    }

    // 2. Ensure ALL directory staff profiles have active login passwords and India Post scope
    for (const dirStaff of this.directoryStaff) {
      const generated = this.createProfileFromDirectoryStaff(dirStaff);
      const existingIdx = this.profiles.findIndex(
        p =>
          p.email.toLowerCase() === generated.email.toLowerCase() ||
          (p.employeeId && generated.employeeId && p.employeeId.toUpperCase() === generated.employeeId.toUpperCase()) ||
          p.id.toUpperCase() === generated.id.toUpperCase()
      );
      if (existingIdx === -1) {
        generated.assignedBrands = [((dirStaff.brandId || 'india-post').toLowerCase())];
        this.profiles.push(generated);
        activatedCount += 1;
      } else {
        const existing = this.profiles[existingIdx];
        if (resetExistingToDefault && !this.isSuperAdmin(existing)) {
          existing.password = hashPasswordSync(DEFAULT_STAFF_FALLBACK_PASSWORD);
          existing.hasCustomPassword = false;
          resetCount += 1;
        } else if (!existing.password) {
          existing.password = hashPasswordSync(DEFAULT_STAFF_FALLBACK_PASSWORD);
          existing.hasCustomPassword = false;
          activatedCount += 1;
        }
        if (existing.permissions?.approvalStatus === 'Pending Approval') {
          existing.permissions.approvalStatus = 'Approved';
          existing.status = 'Active';
        }
      }
    }

    this.saveDirectoryStaff(false);
    this.saveProfiles(true);
    return {
      totalDirectory: this.directoryStaff.length,
      activatedCount,
      resetCount,
    };
  }

  public dismissPasswordChangePrompt(identifier: string): void {
    const prof = this.findStaffProfileByIdentifier(identifier);
    if (!prof) return;
    prof.mustChangePassword = false;
    this.addOrUpdateStaff(prof);
    const active = this.getActiveSession();
    if (active && (active.email.toLowerCase() === prof.email.toLowerCase() || active.id === prof.id)) {
      this.setActiveSession(prof);
    }
  }

  public initiatePasswordResetOtp(identifier: string): {
    success: boolean;
    otp?: string;
    maskedContact?: string;
    profile?: StaffProfile;
    error?: string;
  } {
    const prof = this.findStaffProfileByIdentifier(identifier);
    if (!prof) {
      return {
        success: false,
        error: 'No registered staff member found with that Employee ID, Mobile Number, or Email.',
      };
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const phone = prof.contact || '9521279186';
    const maskedPhone = phone.length >= 6 ? `${phone.slice(0, 2)}******${phone.slice(-2)}` : phone;
    return {
      success: true,
      otp,
      maskedContact: `${maskedPhone} (${prof.email})`,
      profile: prof,
    };
  }

  public updateOwnProfileDetails(
    currentEmailOrId: string,
    updates: {
      name: string;
      employeeId?: string;
      contact: string;
      email: string;
      designationType: DesignationType;
      subOffice: string;
      officePincode?: string;
      beat: string;
      fixedKm?: number;
      newPassword?: string;
    }
  ): StaffProfile {
    const existing = this.findStaffProfileByIdentifier(currentEmailOrId) || this.getStaffProfileByEmail(currentEmailOrId);
    const officeMeta = resolveOfficeMetadata(updates.subOffice, existing.branchOffice, updates.officePincode);
    const pin = updates.officePincode || officeMeta.pincode || existing.officePincode || '324009';
    const cleanBeat = updates.beat || existing.beat || 'Beat 2';

    const { profile } = this.upsertStaffWithAutoOfficeAndBeat({
      id: existing.id,
      employeeId: updates.employeeId || existing.employeeId || existing.id,
      name: updates.name || existing.name,
      contact: updates.contact || existing.contact || '',
      email: updates.email || existing.email,
      password: updates.newPassword?.trim() ? updates.newPassword.trim() : existing.password || DEFAULT_STAFF_FALLBACK_PASSWORD,
      designationType: updates.designationType || existing.designationType || 'Postman',
      role: existing.role,
      circle: existing.circle || 'Rajasthan Circle',
      division: existing.division || 'Kota Division',
      headOffice: existing.headOffice || 'Kota H.O.',
      subOffice: officeMeta.postOfficeName || updates.subOffice || 'Dadabari S.O.',
      branchOffice: existing.branchOffice || '',
      officePincode: pin,
      officeAddress: `${officeMeta.postOfficeName || updates.subOffice}, Kota Division, Rajasthan Circle - ${pin}`,
      beat: cleanBeat,
      assignedBeats: [cleanBeat],
      assignedColonies: getDefaultColoniesForBeat(cleanBeat),
      fixedKm: updates.fixedKm || existing.fixedKm || getDefaultFixedKmForBeat(cleanBeat),
      dailyEntryLimit: existing.permissions?.dailyEntryLimit,
      canViewAllRecords: existing.permissions?.canViewAllRecords,
      serviceModules: existing.permissions?.serviceModules,
      approvalStatus: existing.permissions?.approvalStatus,
    });

    if (updates.newPassword?.trim()) {
      profile.mustChangePassword = false;
      this.addOrUpdateStaff(profile);
    }

    this.setActiveSession(profile);
    return profile;
  }

  public registerStaffAccount(params: {
    name: string;
    email: string;
    password: string;
    employeeId: string;
    role: 'OWNER' | 'DEVELOPER' | 'POSTMAN' | 'STAFF' | 'ADMIN';
    designationType?: DesignationType;
    beat: string;
    assignedOffice: string;
    circle?: string;
    division?: string;
    headOffice?: string;
    subOffice?: string;
    branchOffice?: string;
    officePincode?: string;
    officeAddress?: string;
    assignedColonies?: string[];
    fixedKm: number;
    contact?: string;
  }): StaffProfile {
    const res = this.upsertStaffWithAutoOfficeAndBeat({
      employeeId: params.employeeId,
      name: params.name,
      contact: params.contact || '',
      email: params.email,
      password: params.password,
      designationType: params.designationType || normalizeDesignation(params.role),
      role: params.role,
      circle: params.circle || 'Rajasthan Circle',
      division: params.division || 'Kota Division',
      headOffice: params.headOffice || 'Kota H.O.',
      subOffice: params.subOffice || params.assignedOffice.replace(/\(\d+\)/, '').trim() || 'Dadabari S.O.',
      branchOffice: params.branchOffice || '',
      officePincode: params.officePincode || '324009',
      officeAddress:
        params.officeAddress ||
        `${params.assignedOffice}, Kota Division, Rajasthan Circle - 324009`,
      beat: params.beat || 'Beat 2',
      assignedColonies: params.assignedColonies || getDefaultColoniesForBeat(params.beat || 'Beat 2'),
      fixedKm: params.fixedKm,
    });
    return res.profile;
  }

  private ensureDayReset(profile: StaffProfile): StaffProfile {
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastEntryDate !== today) {
      profile.entriesCreatedToday = 0;
      profile.lastEntryDate = today;
      // Never notify listeners inside a read helper to prevent recursive render loops
      this.saveProfiles(false);
    }
    return profile;
  }

  public updateStaffPermission(
    email: string,
    permissions: Partial<StaffPermission>,
    extras?: Partial<StaffProfile>
  ): StaffProfile {
    const normalized = (email || '').trim().toLowerCase();
    const index = this.profiles.findIndex(p => p.email.toLowerCase() === normalized);

    if (index >= 0) {
      const updated = this.normalizeProfile({
        ...this.profiles[index],
        ...extras,
        permissions: {
          ...this.profiles[index].permissions,
          ...permissions,
          serviceModules: {
            ...(this.profiles[index].permissions.serviceModules || DEFAULT_STAFF_SERVICE_MODULES),
            ...(permissions.serviceModules || {}),
          },
        },
      });
      this.profiles[index] = updated;

      // Also sync basic fields to directoryStaff if matching
      const dirIdx = this.directoryStaff.findIndex(
        s =>
          s.email.toLowerCase() === normalized ||
          (updated.employeeId && s.employeeId === updated.employeeId)
      );
      if (dirIdx >= 0) {
        this.directoryStaff[dirIdx] = {
          ...this.directoryStaff[dirIdx],
          name: updated.name,
          contact: updated.contact || this.directoryStaff[dirIdx].contact,
          beat: updated.beat || this.directoryStaff[dirIdx].beat,
          designationType: updated.designationType || this.directoryStaff[dirIdx].designationType,
          circle: updated.circle || this.directoryStaff[dirIdx].circle,
          division: updated.division || this.directoryStaff[dirIdx].division,
          headOffice: updated.headOffice || this.directoryStaff[dirIdx].headOffice,
          subOffice: updated.subOffice || this.directoryStaff[dirIdx].subOffice,
          branchOffice: updated.branchOffice ?? this.directoryStaff[dirIdx].branchOffice,
          officePincode: updated.officePincode || this.directoryStaff[dirIdx].officePincode,
          officeAddress: updated.officeAddress || this.directoryStaff[dirIdx].officeAddress,
          assignedColonies: updated.assignedColonies || this.directoryStaff[dirIdx].assignedColonies,
        };
        this.saveDirectoryStaff(false);
      }

      this.saveProfiles(true);
      return updated;
    } else {
      this.getStaffProfileByEmail(email);
      return this.updateStaffPermission(email, permissions, extras);
    }
  }

  public addOrUpdateStaff(profile: StaffProfile): void {
    const normalized = profile.email.trim().toLowerCase();
    const index = this.profiles.findIndex(
      p => p.email.toLowerCase() === normalized || p.id === profile.id
    );
    const normProfile = this.normalizeProfile(profile);
    if (index >= 0) {
      this.profiles[index] = { ...this.profiles[index], ...normProfile };
    } else {
      if (!this.isGovernanceProfileRecord(normProfile) && !normProfile.assignedBrands?.length) {
        normProfile.assignedBrands = [normProfile.brandId || 'india-post'];
      }
      this.profiles.unshift(normProfile);
    }
    this.saveProfiles();
  }

  public saveStaffProfile(profile: StaffProfile): void {
    this.addOrUpdateStaff(profile);
  }

  public canUserEnterRecord(email: string): {
    allowed: boolean;
    reason?: string;
    remaining?: number;
    todayCount: number;
    limit: number;
  } {
    const profile = this.getStaffProfileByEmail(email);
    const limit = profile.permissions.dailyEntryLimit;
    const count = profile.entriesCreatedToday || 0;

    if (profile.permissions.approvalStatus === 'Revoked') {
      return {
        allowed: false,
        reason: 'आपकी स्टाफ एक्सेस अनुमति एडमिन द्वारा निरस्त (Revoked) की गई है।',
        todayCount: count,
        limit,
      };
    }

    if (!profile.permissions.canCreateCustomer) {
      return {
        allowed: false,
        reason: 'आपके खाते को नई प्रविष्टि (Entry) करने की अनुमति नहीं दी गई है। कृपया एडमिन से संपर्क करें।',
        todayCount: count,
        limit,
      };
    }

    if (limit > 0 && count >= limit) {
      return {
        allowed: false,
        reason: `आज की दैनिक प्रविष्टि सीमा पूर्ण हो चुकी है (${count}/${limit} Entries)। अतिरिक्त अनुमति हेतु Admin से संपर्क करें।`,
        remaining: 0,
        todayCount: count,
        limit,
      };
    }

    return {
      allowed: true,
      remaining: limit > 0 ? limit - count : undefined,
      todayCount: count,
      limit,
    };
  }

  public recordNewEntry(email: string): void {
    const profile = this.getStaffProfileByEmail(email);
    const today = new Date().toISOString().split('T')[0];

    if (profile.lastEntryDate !== today) {
      profile.entriesCreatedToday = 1;
      profile.lastEntryDate = today;
    } else {
      profile.entriesCreatedToday = (profile.entriesCreatedToday || 0) + 1;
    }

    profile.totalEntriesCount = (profile.totalEntriesCount || 0) + 1;
    this.saveProfiles();
  }

  public isNonTerritoryCategoryAgent(user: StaffProfile | null | undefined): boolean {
    if (!user) return false;
    if (
      this.isSuperAdmin(user) ||
      user.role === 'OWNER' ||
      user.role === 'DEVELOPER' ||
      user.role === 'MASTER_ADMIN' ||
      user.role === 'ADMIN' ||
      user.role === 'SUPER_ADMIN'
    ) {
      return false;
    }
    if (user.isNonTerritoryAgent) return true;
    const roleUpper = (user.role || '').toUpperCase();
    const desigLower = (user.designationType || user.designation || '').toLowerCase();
    return (
      roleUpper === 'CATEGORY_AGENT' ||
      roleUpper === 'B2B_PARTNER' ||
      desigLower.includes('b2b') ||
      desigLower.includes('category agent')
    );
  }

  public getXpeedoServicesGovernanceStaff(): StaffProfile[] {
    return this.profiles.filter(
      (p) =>
        p.staffScopeType === 'XPEEDO_SERVICES' ||
        p.staffScopeType === 'XPOKART_PLATFORM' ||
        this.isSuperAdmin(p) ||
        ['OWNER', 'MASTER_ADMIN', 'DEVELOPER', 'SUPER_ADMIN', 'ADMIN'].includes(
          (p.role || '').toUpperCase()
        )
    );
  }

  public getXpoKartPlatformStaff(): StaffProfile[] {
    return this.getXpeedoServicesGovernanceStaff();
  }

  public getBrandOperationalStaff(brandId?: string): Staff[] {
    const normFilter = (brandId || '').trim().toLowerCase().replace(/_/g, '-');
    if (normFilter === 'xpokart' || normFilter === 'brd-xpkrt-01') {
      return [];
    }
    return this.directoryStaff.filter((s) => {
      if (s.staffScopeType === 'XPOKART_PLATFORM' || s.staffScopeType === 'XPEEDO_SERVICES') {
        return false;
      }
      if (this.isElevatedOrSyntheticStaffRecord(s)) return false;
      if (!normFilter) return true;
      const sBrand = (s.brandId || 'india-post').trim().toLowerCase().replace(/_/g, '-');
      return sBrand === normFilter;
    });
  }

  public isPostmanOrGds(user: StaffProfile | null | undefined): boolean {
    if (!user) return false;
    if (
      this.isSuperAdmin(user) ||
      user.role === 'OWNER' ||
      user.role === 'DEVELOPER' ||
      user.role === 'ADMIN' ||
      user.role === 'MASTER_ADMIN' ||
      user.role === 'SUPER_ADMIN'
    ) {
      return false;
    }
    if (this.isNonTerritoryCategoryAgent(user)) {
      return true;
    }
    if (featureVisibilityService.isPostmanOrGdsProfile(user)) {
      return true;
    }
    if (user.permissions?.canViewAllRecords === true) {
      return false;
    }
    return true;
  }

  public getScopedBeatsSet(user: StaffProfile | null | undefined): Set<string> | null {
    if (!this.isPostmanOrGds(user) || !user) return null;
    if (this.isNonTerritoryCategoryAgent(user)) return null;
    const rawList = [
      user.beat,
      ...(user.assignedBeats || []),
      ...(user.permissions?.allowedBeats || []),
    ].filter(Boolean) as string[];
    const result = new Set<string>();
    for (const item of rawList) {
      const norm = String(item).toLowerCase().replace(/^beat\s*/i, '').trim();
      if (!norm || norm === 'all beats' || norm === 'all') continue;
      result.add(norm);
    }
    if (result.size === 0) {
      result.add('2');
    }
    return result;
  }

  public matchesUserBeatScope(
    user: StaffProfile | null | undefined,
    record: {
      beatNo?: string;
      beat?: string;
      beatNumber?: string;
      assignedBeatNumber?: string;
      assignedStaffId?: string;
      assignedStaffName?: string;
      assignedTo?: string;
      assignedToId?: string;
      assignedStaffEmail?: string;
      enteredBy?: string;
      createdBy?: string;
      createdById?: string;
      businessCategory?: string;
      category?: string;
      area?: string;
      colonyName?: string;
      sector?: string;
      officeId?: string;
      officeName?: string;
      subOffice?: string;
      subOrHoOffice?: string;
      pincode?: string;
    }
  ): boolean {
    if (!user) return false;

    // Master Admins / Admins retain global visibility across all beats and offices
    if (!this.isPostmanOrGds(user)) {
      return true;
    }

    // Non-Territory B2B Partners / Category Agents:
    // NO territory/beat lock, ONLY view/manage their own created or assigned entries within assignedCategories
    if (this.isNonTerritoryCategoryAgent(user)) {
      const userIdNorm = (user.id || '').trim().toLowerCase();
      const userEmpNorm = (user.employeeId || '').trim().toUpperCase();
      const userEmailNorm = (user.email || '').trim().toLowerCase();
      const ownsRecord =
        (record.createdById && record.createdById.trim().toLowerCase() === userIdNorm) ||
        (record.assignedToId && record.assignedToId.trim().toLowerCase() === userIdNorm) ||
        (record.createdBy && (record.createdBy.trim().toLowerCase() === userIdNorm || record.createdBy.trim().toUpperCase() === userEmpNorm || record.createdBy.trim().toLowerCase() === userEmailNorm)) ||
        (record.assignedStaffId && (record.assignedStaffId.trim().toLowerCase() === userIdNorm || record.assignedStaffId.trim().toUpperCase() === userEmpNorm)) ||
        (record.enteredBy && (record.enteredBy.trim().toLowerCase() === userEmailNorm || record.enteredBy.trim().toUpperCase() === userEmpNorm));
      if (!ownsRecord) return false;

      const allowedCats = (user.assignedCategories || []).map((c) => c.trim().toLowerCase()).filter(Boolean);
      const recCat = (record.businessCategory || record.category || '').trim().toLowerCase();
      if (allowedCats.length > 0 && recCat) {
        return allowedCats.some((c) => recCat.includes(c) || c.includes(recCat));
      }
      return true;
    }

    const scopedBeats = this.getScopedBeatsSet(user);
    if (!scopedBeats) return true;

    // 1. Explicit beat checks across common beat field aliases
    const explicitBeatRaw =
      record.beatNo || record.beatNumber || record.assignedBeatNumber || record.beat || '';
    if (explicitBeatRaw && String(explicitBeatRaw).trim() !== '') {
      const normRecBeat = String(explicitBeatRaw).toLowerCase().replace(/^beat\s*/i, '').trim();
      if (normRecBeat === 'all' || normRecBeat === 'all beats') return true;
      return scopedBeats.has(normRecBeat);
    }

    // 2. If the record has assignedStaffName or assignedTo mentioning a Beat (e.g. "Beat 2" or "Beat 6")
    const staffText = `${record.assignedStaffName || ''} ${record.assignedTo || ''}`;
    const beatMatch = staffText.match(/beat\s*([a-z0-9-]+)/i);
    if (beatMatch && beatMatch[1]) {
      return scopedBeats.has(beatMatch[1].toLowerCase().trim());
    }

    // 3. Check if explicitly entered/created by or assigned to this user
    const userEmail = (user.email || '').trim().toLowerCase();
    const userEmpId = (user.employeeId || '').trim().toUpperCase();
    if (record.assignedStaffId && (record.assignedStaffId.trim().toUpperCase() === userEmpId || record.assignedStaffId.trim() === user.id)) return true;
    if (record.enteredBy && (record.enteredBy.trim().toLowerCase() === userEmail || record.enteredBy.trim().toUpperCase() === userEmpId)) return true;
    if (record.createdBy && (record.createdBy.trim().toUpperCase() === userEmpId || record.createdBy.trim() === user.id || record.createdBy.trim().toLowerCase() === user.name?.toLowerCase())) return true;
    if (record.assignedStaffEmail && record.assignedStaffEmail.trim().toLowerCase() === userEmail) return true;
    if (user.name && staffText.toLowerCase().includes(user.name.toLowerCase())) return true;

    // 4. Colony fallback against user's assigned/allowed colonies
    const recColony = (record.colonyName || record.area || '').trim().toLowerCase();
    if (recColony) {
      const userColonies = [
        ...(user.assignedColonies || []),
        ...(user.permissions?.allowedColonies || []),
      ]
        .map(c => c.toLowerCase().trim())
        .filter(c => c && c !== 'all colonies');
      if (userColonies.some(c => recColony.includes(c) || c.includes(recColony))) {
        return true;
      }
    }

    return false;
  }

  public matchesUserColonyAndOfficeScope(
    user: StaffProfile | null | undefined,
    item: {
      beatNo?: string;
      beatNumber?: string;
      assignedBeatNumber?: string;
      assignedStaffId?: string;
      officeId?: string;
      officeName?: string;
      subOffice?: string;
      subOrHoOffice?: string;
      pincode?: string;
      colonyName?: string;
      area?: string;
      assignedStaffName?: string;
    }
  ): boolean {
    if (!this.isPostmanOrGds(user)) return true;
    return this.matchesUserBeatScope(user, item);
  }

  public isRecordVisible(
    user: StaffProfile | null,
    record: {
      enteredBy?: string;
      assignedStaffEmail?: string;
      assignedStaffId?: string;
      beatNo?: string;
      area?: string;
      sector?: string;
    }
  ): boolean {
    return this.matchesUserBeatScope(user, record);
  }

  public getActiveSession(): StaffProfile | null {
    if (this.cachedActiveSession !== undefined) {
      return this.cachedActiveSession;
    }
    try {
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('postman_explicit_signout') === 'true') {
        this.cachedActiveSession = null;
        return null;
      }
      const stored =
        localStorage.getItem(ACTIVE_SESSION_KEY) ||
        localStorage.getItem('xpeedo_auth_user') ||
        localStorage.getItem('current_user');
      if (stored) {
        const session = JSON.parse(stored);
        if (session?.email || session?.employeeId) {
          const found = this.findStaffProfileByIdentifier(session.email || session.employeeId);
          if (found) {
            this.cachedActiveSession = found;
            return found;
          }
          const normalized = this.normalizeProfile(session);
          this.cachedActiveSession = normalized;
          return normalized;
        }
      }
    } catch (e) {
      console.warn('Error reading active session:', e);
    }
    this.cachedActiveSession = null;
    return null;
  }

  public setActiveSession(profile: StaffProfile | null): void {
    this.cachedActiveSession = profile;
    try {
      if (profile) {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('postman_explicit_signout');
        }
        const serialized = JSON.stringify(profile);
        localStorage.setItem(ACTIVE_SESSION_KEY, serialized);
        localStorage.setItem('xpeedo_auth_user', serialized);
        localStorage.setItem('current_user', serialized);
        localStorage.setItem('postman_auth', 'true');
      } else {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('postman_explicit_signout', 'true');
        }
        localStorage.removeItem(ACTIVE_SESSION_KEY);
        localStorage.removeItem('xpeedo_auth_user');
        localStorage.removeItem('current_user');
        localStorage.removeItem('postman_auth');
      }
      this.notifyListeners();
    } catch (e) {
      console.warn('Error setting active session:', e);
    }
  }

  // ================= EXPORT CAPABILITIES =================

  public exportStaffProfilesToCSV(): string {
    const headers = [
      'Staff ID',
      'Employee ID',
      'Name',
      'Designation Type',
      'Email',
      'Contact',
      'Role',
      'Beat',
      'Circle',
      'Division',
      'Head Office',
      'Sub Office',
      'Branch Office',
      'Pincode',
      'Office Address',
      'Assigned Colonies',
      'Approval Status',
      'Daily Entry Limit',
      'CRM Access',
      'Special Bills Access',
      'Learning LMS Access',
      'Scheme Leads Access',
      'Content Sharing Access',
    ];

    const rows = this.profiles.map(p => [
      `"${p.id || ''}"`,
      `"${p.employeeId || ''}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.designationType || p.role || ''}"`,
      `"${(p.email || '').replace(/"/g, '""')}"`,
      `"${p.contact || ''}"`,
      `"${p.role || ''}"`,
      `"${p.beat || ''}"`,
      `"${p.circle || 'Rajasthan Circle'}"`,
      `"${p.division || 'Kota Division'}"`,
      `"${p.headOffice || 'Kota H.O.'}"`,
      `"${p.subOffice || 'Dadabari S.O.'}"`,
      `"${p.branchOffice || ''}"`,
      `"${p.officePincode || '324009'}"`,
      `"${(p.officeAddress || '').replace(/"/g, '""')}"`,
      `"${(p.assignedColonies || []).join('; ')}"`,
      `"${p.permissions.approvalStatus || 'Approved'}"`,
      p.permissions.dailyEntryLimit ?? 0,
      p.permissions.serviceModules?.crmSection !== false ? 'YES' : 'NO',
      p.permissions.serviceModules?.specialBillsSection !== false ? 'YES' : 'NO',
      p.permissions.serviceModules?.learningSection !== false ? 'YES' : 'NO',
      p.permissions.serviceModules?.schemeLeadsSection !== false ? 'YES' : 'NO',
      p.permissions.serviceModules?.contentSharingSection !== false ? 'YES' : 'NO',
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  public exportDirectoryToCSV(): string {
    const headers = [
      'Staff ID',
      'Employee ID',
      'Full Name',
      'Designation Type',
      'Beat Number',
      'Contact Number',
      'Email',
      'Circle',
      'Division',
      'Head Office (HO)',
      'Sub Office (SO)',
      'Branch Office (BO)',
      'Office Pincode',
      'Complete Office Address',
      'Assigned Beat Colonies',
      'Duty Status',
    ];

    const rows = this.directoryStaff.map(s => [
      `"${s.id || ''}"`,
      `"${s.employeeId || s.id || ''}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${s.designationType || s.role || ''}"`,
      `"${s.beat || ''}"`,
      `"${s.contact || ''}"`,
      `"${s.email || 'N/A'}"`,
      `"${s.circle || 'Rajasthan Circle'}"`,
      `"${s.division || 'Kota Division'}"`,
      `"${s.headOffice || 'Kota H.O.'}"`,
      `"${s.subOffice || s.subOrBranchOffice || 'Dadabari S.O.'}"`,
      `"${s.branchOffice || ''}"`,
      `"${s.officePincode || '324009'}"`,
      `"${(s.officeAddress || '').replace(/"/g, '""')}"`,
      `"${(s.assignedColonies || []).join('; ')}"`,
      `"${s.status || 'Active on Duty'}"`,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  public exportCombinedStaffToJSON(): string {
    const exportObject = {
      exportTimestamp: new Date().toISOString(),
      sourceOffice: 'Dadabari Sub-Post Office (324009)',
      division: 'Kota Division, Rajasthan Circle',
      totalDirectoryMembers: this.directoryStaff.length,
      totalAccessProfiles: this.profiles.length,
      autoManagedOffices: this.getAutoManagedOffices(),
      colonyBeatMappings: this.colonyBeatMappings,
      accessProfiles: this.profiles,
      directoryList: this.directoryStaff,
    };
    return JSON.stringify(exportObject, null, 2);
  }

  public triggerDownload(content: string | Blob, fileName: string, mimeType: string): void {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public async exportAllToExcel(): Promise<void> {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    const directoryData = this.directoryStaff.map(s => ({
      'Employee ID': s.employeeId || s.id,
      'Full Name': s.name,
      'Designation Type': s.designationType || s.role,
      'Assigned Beat': s.beat,
      'Mobile Number': s.contact,
      'Email': s.email,
      'Circle': s.circle || 'Rajasthan Circle',
      'Division': s.division || 'Kota Division',
      'Head Office (HO)': s.headOffice || 'Kota H.O.',
      'Sub Office (SO)': s.subOffice || s.subOrBranchOffice || 'Dadabari S.O.',
      'Branch Office (BO)': s.branchOffice || 'N/A',
      'Pincode': s.officePincode || '324009',
      'Complete Office Address': s.officeAddress || '',
      'Assigned Beat Colonies': (s.assignedColonies || []).join(', '),
      'Status': s.status,
    }));
    const ws1 = XLSX.utils.json_to_sheet(directoryData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Staff & Office Directory');

    const profilesData = this.profiles.map(p => ({
      'Employee ID': p.employeeId || p.id,
      'Staff Name': p.name,
      'Email': p.email,
      'Contact': p.contact,
      'Designation': p.designationType || p.role,
      'Beat': p.beat,
      'Sub Office': p.subOffice || p.assignedOffice,
      'Pincode': p.officePincode || '324009',
      'Approval Status': p.permissions.approvalStatus || 'Approved',
      'CRM Module': p.permissions.serviceModules?.crmSection !== false ? 'APPROVED' : 'RESTRICTED',
      'Special Bills Module': p.permissions.serviceModules?.specialBillsSection !== false ? 'APPROVED' : 'RESTRICTED',
      'Postal Learning LMS': p.permissions.serviceModules?.learningSection !== false ? 'APPROVED' : 'RESTRICTED',
      'Scheme Leads Module': p.permissions.serviceModules?.schemeLeadsSection !== false ? 'APPROVED' : 'RESTRICTED',
      'Content Sharing & Dispatch': p.permissions.serviceModules?.contentSharingSection !== false ? 'APPROVED' : 'RESTRICTED',
      'Daily Quota Limit': p.permissions.dailyEntryLimit === 0 ? 'Unlimited' : p.permissions.dailyEntryLimit,
    }));
    const ws2 = XLSX.utils.json_to_sheet(profilesData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Service Authorization Matrix');

    const officesData = this.getAutoManagedOffices().map(o => ({
      'Office Name': o.officeName,
      'Type': o.officeType,
      'Circle': o.circle,
      'Division': o.division,
      'Head Office': o.headOffice,
      'Sub Office': o.subOffice,
      'Branch Office': o.branchOffice || 'N/A',
      'Pincode': o.pincode,
      'Complete Address': o.completeAddress,
      'Staff Count': o.assignedStaffCount,
      'Mapped Beats': o.mappedBeats.join(', '),
      'Mapped Colonies': o.mappedColonies.join(', '),
    }));
    const ws3 = XLSX.utils.json_to_sheet(officesData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Auto-Managed Offices');

    const fileName = `INDIA_POST_STAFF_OFFICE_BEAT_MASTER_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  public getGovernanceProfiles(): StaffProfile[] {
    return this.profiles.filter(p => this.isGovernanceProfileRecord(p));
  }

  public getOperationalStaffFive(): StaffProfile[] {
    const list = this.profiles
      .filter(p => !this.isGovernanceProfileRecord(p))
      .sort((a, b) => (a.staffSlotNumber || 99) - (b.staffSlotNumber || 99))
      .slice(0, MAX_OPERATIONAL_STAFF_COUNT);
    return list.map((p, idx) => ({
      ...p,
      staffSlotNumber: (p.staffSlotNumber || idx + 1) as 1 | 2 | 3 | 4 | 5,
      assignedBrands: p.assignedBrands?.length
        ? p.assignedBrands
        : [((p.brandId || 'india-post').toLowerCase())],
    }));
  }

  public getStaffByBrand(brandSlugOrKey: string): StaffProfile[] {
    const target = (brandSlugOrKey || '').trim().toLowerCase();
    if (!target) return [];
    const targetSlug = target.replace(/_/g, '-');
    if (targetSlug === 'xpokart' || targetSlug === 'brd-xpkrt-01') {
      return [];
    }
    return this.profiles
      .filter(p => !this.isGovernanceProfileRecord(p))
      .filter(p => {
        const assigned = (p.assignedBrands || []).map(b => b.trim().toLowerCase().replace(/_/g, '-'));
        if (assigned.includes(targetSlug)) return true;
        const primary = (p.brandId || '').trim().toLowerCase().replace(/_/g, '-');
        if (primary === targetSlug) return true;
        return targetSlug === 'india-post' && assigned.length === 0 && !primary;
      });
  }

  public setStaffBrandAllocations(
    staffIdOrEmail: string,
    brandSlugs: string[],
    primaryBrandName?: string
  ): { success: boolean; profile?: StaffProfile; error?: string } {
    const key = (staffIdOrEmail || '').trim().toLowerCase();
    const pIdx = this.profiles.findIndex(
      p =>
        p.id.toLowerCase() === key ||
        p.email.toLowerCase() === key ||
        (p.employeeId || '').toLowerCase() === key
    );
    if (pIdx < 0) {
      return { success: false, error: 'Staff profile not found among Staff 1–Staff 5.' };
    }
    const cleanSlugs = Array.from(
      new Set(
        brandSlugs
          .map(s => s.trim().toLowerCase().replace(/_/g, '-'))
          .filter(s => s && s !== 'xpokart' && s !== 'brd-xpkrt-01')
      )
    );
    if (cleanSlugs.length === 0) {
      cleanSlugs.push('india-post');
    }
    const primarySlug = cleanSlugs[0] || this.profiles[pIdx].brandId || 'india-post';
    const safeBrandName =
      primaryBrandName && !primaryBrandName.toLowerCase().includes('xpokart')
        ? primaryBrandName
        : primarySlug === 'india-post'
        ? 'India Post'
        : this.profiles[pIdx].partnerOrganization;

    this.profiles[pIdx] = {
      ...this.profiles[pIdx],
      assignedBrands: cleanSlugs,
      brandId: primarySlug,
      partnerOrganization: safeBrandName,
      updatedAt: new Date().toISOString(),
    };

    const dIdx = this.directoryStaff.findIndex(
      d =>
        d.id.toLowerCase() === key ||
        d.email.toLowerCase() === key ||
        (d.employeeId || '').toLowerCase() === key
    );
    if (dIdx >= 0) {
      this.directoryStaff[dIdx] = {
        ...this.directoryStaff[dIdx],
        assignedBrands: cleanSlugs,
        brandId: primarySlug,
        partnerOrganization: safeBrandName,
      };
      this.saveDirectoryStaff(false);
    }

    this.saveProfiles(true);
    return { success: true, profile: this.profiles[pIdx] };
  }

  public reassignStaffBrand(
    staffIdOrEmail: string,
    brandId: string,
    partnerOrganization: string
  ): boolean {
    const key = (staffIdOrEmail || '').trim().toLowerCase();
    if (!key) return false;
    const rawSlug = brandId.trim().toLowerCase().replace(/_/g, '-');
    // XPOKART operates strictly as E-Commerce without staff; redirect operational staff allocations to India Post
    const normSlug = rawSlug === 'xpokart' || rawSlug === 'brd-xpkrt-01' ? 'india-post' : rawSlug;
    const safeOrg =
      normSlug === 'india-post' && partnerOrganization.toLowerCase().includes('xpokart')
        ? 'India Post'
        : partnerOrganization;
    let updated = false;

    const pIdx = this.profiles.findIndex(
      (p) =>
        p.id.toLowerCase() === key ||
        p.email.toLowerCase() === key ||
        (p.employeeId || '').toLowerCase() === key
    );
    if (pIdx >= 0) {
      const existingAssigned = (this.profiles[pIdx].assignedBrands || [])
        .map(b => b.trim().toLowerCase().replace(/_/g, '-'))
        .filter(b => b && b !== 'xpokart' && b !== 'brd-xpkrt-01');
      const nextAssigned = Array.from(new Set([...existingAssigned, normSlug]));
      this.profiles[pIdx] = {
        ...this.profiles[pIdx],
        brandId: normSlug,
        assignedBrands: nextAssigned,
        partnerOrganization: safeOrg,
      };
      updated = true;
    }

    const dIdx = this.directoryStaff.findIndex(
      (d) =>
        d.id.toLowerCase() === key ||
        d.email.toLowerCase() === key ||
        (d.employeeId || '').toLowerCase() === key
    );
    if (dIdx >= 0) {
      const existingAssigned = (this.directoryStaff[dIdx].assignedBrands || [])
        .map(b => b.trim().toLowerCase().replace(/_/g, '-'))
        .filter(b => b && b !== 'xpokart' && b !== 'brd-xpkrt-01');
      const nextAssigned = Array.from(new Set([...existingAssigned, normSlug]));
      this.directoryStaff[dIdx] = {
        ...this.directoryStaff[dIdx],
        brandId: normSlug,
        assignedBrands: nextAssigned,
        partnerOrganization: safeOrg,
      };
      updated = true;
    }

    if (updated) {
      this.saveDirectoryStaff(false);
      this.saveProfiles();
    }
    return updated;
  }

  // --------------------------------------------------------------------------
  // INDIA POST STAFF DUTY CATEGORIES & PROMOTION LEDGER
  // --------------------------------------------------------------------------

  private loadPromotionHistory(): StaffPromotionRecord[] {
    try {
      const raw = localStorage.getItem('xpeedo_staff_promotions_v1');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  private savePromotionHistory(): void {
    try {
      localStorage.setItem(
        'xpeedo_staff_promotions_v1',
        JSON.stringify(this.promotionHistory || [])
      );
    } catch {}
  }

  private promotionHistory: StaffPromotionRecord[] = this.loadPromotionHistory();

  public deriveIndiaPostDutyCategory(designationOrRole: string): IndiaPostDutyCategory {
    const s = (designationOrRole || '').toUpperCase();
    if (s.includes('POSTMAN') || s.includes('RIDER') || s.includes('BEAT') || s.includes('DELIVERY')) {
      return 'Delivery';
    }
    if (s.includes('IPPB') || s.includes('SAVINGS') || s.includes('BANK') || s.includes('PLI') || s.includes('INSURANCE')) {
      return 'Banking & IPPB';
    }
    if (s.includes('PA') || s.includes('POSTAL ASSISTANT') || s.includes('COUNTER') || s.includes('BOOKING') || s.includes('AADHAAR') || s.includes('CELC')) {
      return 'Counter & Booking';
    }
    if (s.includes('SURVEY') || s.includes('MARKETING') || s.includes('LEAD') || s.includes('SALES')) {
      return 'Field Survey & Leads';
    }
    if (
      s.includes('SUPERVISOR') ||
      s.includes('INCHARGE') ||
      s.includes('INSPECTOR') ||
      s.includes('POSTMASTER') ||
      s.includes('ADMIN') ||
      s.includes('HEAD') ||
      s.includes('MANAGER')
    ) {
      return 'Supervisory & Division';
    }
    return 'Delivery';
  }

  public getIndiaPostOperationalProfiles(): StaffProfile[] {
    return this.profiles.map((p) => {
      const cat = p.postCategory || this.deriveIndiaPostDutyCategory(p.designationType || p.designation || p.role);
      return { ...p, postCategory: cat };
    });
  }

  public getStaffPromotionHistory(staffId?: string): StaffPromotionRecord[] {
    if (!staffId) return this.promotionHistory;
    const clean = staffId.trim().toLowerCase();
    return this.promotionHistory.filter(
      (r) => r.staffId.toLowerCase() === clean || (r.employeeId && r.employeeId.toLowerCase() === clean)
    );
  }

  public promoteOrChangeStaffRole(
    staffIdOrEmail: string,
    payload: {
      newDesignationType: string;
      newRole: UserRole;
      newPostCategory: IndiaPostDutyCategory;
      newHeadOffice?: string;
      newSubOffice?: string;
      newOffice?: string;
      newPincode?: string;
      newBeat?: string;
      preserveExistingBeat?: boolean;
      effectiveDate: string;
      orderRef?: string;
      notes?: string;
      permissionsPatch?: Partial<StaffPermission>;
    },
    actorName = 'India Post Division Admin'
  ): {
    success: boolean;
    profile?: StaffProfile;
    promotionRecord?: StaffPromotionRecord;
    previousBeat?: string;
    error?: string;
  } {
    const key = (staffIdOrEmail || '').trim().toLowerCase();
    const pIdx = this.profiles.findIndex(
      (p) =>
        p.id.toLowerCase() === key ||
        p.email.toLowerCase() === key ||
        (p.employeeId || '').toLowerCase() === key
    );
    if (pIdx < 0) {
      return { success: false, error: 'Staff profile not found in India Post roster.' };
    }

    const prev = this.profiles[pIdx];
    const prevPost = prev.designationType || prev.designation || prev.role;
    const prevCategory =
      prev.postCategory || this.deriveIndiaPostDutyCategory(prevPost);
    const prevBeat = prev.beat || 'Beat 2';

    const nextSubOffice = payload.newSubOffice?.trim() || prev.subOffice || 'Dadabari S.O.';
    const nextPin = payload.newPincode?.trim() || prev.officePincode || '324009';
    const nextAssignedOffice =
      payload.newOffice?.trim() || `${nextSubOffice} (${nextPin})`;
    const nextBeat = payload.preserveExistingBeat
      ? prevBeat
      : payload.newBeat?.trim() || prevBeat;
    const nextBeatsList = Array.from(
      new Set([
        ...(payload.preserveExistingBeat ? prev.assignedBeats || [prevBeat] : []),
        ...nextBeat.split(',').map((b) => b.trim()).filter(Boolean),
      ])
    );

    const record: StaffPromotionRecord = {
      id: `PRM-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      staffId: prev.id,
      employeeId: prev.employeeId,
      staffName: prev.name,
      previousPost: prevPost,
      previousRole: prev.role,
      previousPostCategory: prevCategory,
      previousOffice: prev.assignedOffice,
      previousBeat: prevBeat,
      newPost: payload.newDesignationType,
      newRole: payload.newRole,
      newPostCategory: payload.newPostCategory,
      newOffice: nextAssignedOffice,
      newBeat: nextBeat,
      newPincode: nextPin,
      effectiveDate: payload.effectiveDate || new Date().toISOString().split('T')[0],
      orderRef: payload.orderRef?.trim() || undefined,
      notes: payload.notes?.trim() || undefined,
      promotedBy: actorName,
      changedAt: new Date().toISOString(),
    };

    const nextPromoList = [record, ...(prev.promotionHistory || [])];
    const isSupervisorRole =
      payload.newPostCategory === 'Supervisory & Division' ||
      ['ADMIN', 'DIVISION_INCHARGE', 'SUBDIVISION_INCHARGE', 'OFFICE_INCHARGE', 'POSTMASTER', 'SUB_POSTMASTER', 'LAST_MILE_SUPERVISOR'].includes(
        String(payload.newRole).toUpperCase()
      );

    const mergedPermissions: StaffPermission = {
      ...prev.permissions,
      ...(payload.permissionsPatch || {}),
      canViewAllRecords:
        payload.permissionsPatch?.canViewAllRecords ??
        (isSupervisorRole ? true : prev.permissions.canViewAllRecords),
      allowedBeats: nextBeatsList.length ? nextBeatsList : prev.permissions.allowedBeats,
      allowedOffices: Array.from(
        new Set([...(prev.permissions.allowedOffices || []), nextSubOffice])
      ),
    };

    const updatedProfile: StaffProfile = {
      ...prev,
      role: payload.newRole,
      officialPost: payload.newDesignationType,
      designation: payload.newDesignationType,
      designationType: payload.newDesignationType,
      postCategory: payload.newPostCategory,
      headOffice: payload.newHeadOffice?.trim() || prev.headOffice || 'Kota H.O.',
      subOffice: nextSubOffice,
      officePincode: nextPin,
      assignedOffice: nextAssignedOffice,
      beat: nextBeat,
      assignedBeats: nextBeatsList.length ? nextBeatsList : [nextBeat],
      permissions: mergedPermissions,
      promotionHistory: nextPromoList,
      updatedAt: new Date().toISOString(),
    };

    this.profiles[pIdx] = updatedProfile;

    const dIdx = this.directoryStaff.findIndex(
      (d) =>
        d.id.toLowerCase() === prev.id.toLowerCase() ||
        d.email.toLowerCase() === prev.email.toLowerCase() ||
        (prev.employeeId && (d.employeeId || '').toLowerCase() === prev.employeeId.toLowerCase())
    );
    if (dIdx >= 0) {
      this.directoryStaff[dIdx] = {
        ...this.directoryStaff[dIdx],
        role: payload.newDesignationType,
        designation: payload.newDesignationType,
        designationType: payload.newDesignationType,
        officialPost: payload.newDesignationType,
        postCategory: payload.newPostCategory,
        headOffice: updatedProfile.headOffice || 'Kota H.O.',
        subOffice: nextSubOffice,
        subOrBranchOffice: nextSubOffice,
        officePincode: nextPin,
        beat: nextBeat,
        assignedBeat: nextBeat,
        assignedBeats: updatedProfile.assignedBeats,
        postedOfficeName: nextSubOffice,
        promotionHistory: nextPromoList,
      } as any;
      this.saveDirectoryStaff(false);
    }

    this.promotionHistory = [record, ...this.promotionHistory];
    this.savePromotionHistory();
    this.saveProfiles(true);

    return {
      success: true,
      profile: updatedProfile,
      promotionRecord: record,
      previousBeat: prevBeat,
    };
  }

  public updateIndiaPostStaffProfile(
    staffIdOrEmail: string,
    patch: {
      name?: string;
      contact?: string;
      email?: string;
      status?: 'Active' | 'Inactive' | 'Pending';
      designationType?: string;
      postCategory?: IndiaPostDutyCategory;
      assignedOffice?: string;
      subOffice?: string;
      officePincode?: string;
      beat?: string;
      serviceModules?: Partial<ServiceModulePermissions>;
      canViewAllRecords?: boolean;
      dailyEntryLimit?: number;
    },
    _actorName = 'India Post Division Admin'
  ): { success: boolean; profile?: StaffProfile; error?: string } {
    const key = (staffIdOrEmail || '').trim().toLowerCase();
    const pIdx = this.profiles.findIndex(
      (p) =>
        p.id.toLowerCase() === key ||
        p.email.toLowerCase() === key ||
        (p.employeeId || '').toLowerCase() === key
    );
    if (pIdx < 0) {
      return { success: false, error: 'Staff profile not found.' };
    }

    if (patch.contact !== undefined) {
      const digits = patch.contact.replace(/\D/g, '');
      const clean10 = digits.length >= 10 ? digits.slice(-10) : digits;
      if (!/^[6-9]\d{9}$/.test(clean10)) {
        return { success: false, error: 'Enter a valid 10-digit Indian mobile number (starts 6-9).' };
      }
      patch.contact = clean10;
    }

    if (patch.officePincode !== undefined && patch.officePincode.trim()) {
      if (!/^\d{6}$/.test(patch.officePincode.trim())) {
        return { success: false, error: 'Enter a valid 6-digit office PIN code.' };
      }
    }

    const prev = this.profiles[pIdx];
    const nextEmail = patch.email?.trim().toLowerCase() || prev.email;
    const nextSubOffice = patch.subOffice?.trim() || prev.subOffice || 'Dadabari S.O.';
    const nextPin = patch.officePincode?.trim() || prev.officePincode || '324009';
    const nextAssignedOffice =
      patch.assignedOffice?.trim() || `${nextSubOffice} (${nextPin})`;
    const nextBeat = patch.beat?.trim() || prev.beat || 'Beat 2';
    const nextDesig = patch.designationType || prev.designationType || prev.role;
    const nextCategory =
      patch.postCategory ||
      prev.postCategory ||
      this.deriveIndiaPostDutyCategory(nextDesig);

    const updatedModules: ServiceModulePermissions = {
      ...(prev.permissions.serviceModules || {}),
      ...(patch.serviceModules || {}),
    } as ServiceModulePermissions;

    const updated: StaffProfile = {
      ...prev,
      name: patch.name?.trim() || prev.name,
      contact: patch.contact ?? prev.contact,
      email: nextEmail,
      status: patch.status || prev.status,
      designation: nextDesig,
      designationType: nextDesig,
      postCategory: nextCategory,
      subOffice: nextSubOffice,
      officePincode: nextPin,
      assignedOffice: nextAssignedOffice,
      beat: nextBeat,
      assignedBeats: [nextBeat],
      permissions: {
        ...prev.permissions,
        canViewAllRecords: patch.canViewAllRecords ?? prev.permissions.canViewAllRecords,
        dailyEntryLimit: patch.dailyEntryLimit ?? prev.permissions.dailyEntryLimit,
        serviceModules: updatedModules,
        allowedBeats: Array.from(new Set([...(prev.permissions.allowedBeats || []), nextBeat])),
        allowedOffices: Array.from(new Set([...(prev.permissions.allowedOffices || []), nextSubOffice])),
      },
      updatedAt: new Date().toISOString(),
    };

    this.profiles[pIdx] = updated;

    const dIdx = this.directoryStaff.findIndex(
      (d) =>
        d.id.toLowerCase() === prev.id.toLowerCase() ||
        d.email.toLowerCase() === prev.email.toLowerCase() ||
        (prev.employeeId && (d.employeeId || '').toLowerCase() === prev.employeeId.toLowerCase())
    );
    if (dIdx >= 0) {
      this.directoryStaff[dIdx] = {
        ...this.directoryStaff[dIdx],
        name: updated.name,
        contact: updated.contact || this.directoryStaff[dIdx].contact,
        email: updated.email,
        designation: nextDesig,
        designationType: nextDesig,
        postCategory: nextCategory,
        subOffice: nextSubOffice,
        subOrBranchOffice: nextSubOffice,
        officePincode: nextPin,
        beat: nextBeat,
        assignedBeat: nextBeat,
        assignedBeats: [nextBeat],
        postedOfficeName: nextSubOffice,
      } as any;
      this.saveDirectoryStaff(false);
    }

    this.saveProfiles(true);

    return { success: true, profile: updated };
  }
}

export const staffPermissionService = new StaffPermissionService();
