import {
  StaffProfile,
  StaffPermission,
  ServiceModulePermissions,
  Staff,
  DynamicOfficeRecord,
  ColonyBeatMapping,
  DesignationType,
} from '../types/models';
import { UPDATED_STAFF_LIST } from '../data/updatedStaffData';
import { KOTA_OFFICE_MASTER_LIST, KOTA_POST_OFFICE_OPTIONS } from '../data/officesData';
import { CONSOLIDATED_BEAT_MATRIX } from '../data/consolidatedBeatMatrix';
import { hashPasswordSync, verifyPasswordSync, verifyPassword, sanitizeStaffProfile } from '../utils/securityUtils';

export const DEFAULT_STAFF_FALLBACK_PASSWORD = 'Post@1234';
export { KOTA_OFFICE_MASTER_LIST, KOTA_POST_OFFICE_OPTIONS };

const STORAGE_KEY = 'master_source_staff_profiles_v3';
const DIRECTORY_STORAGE_KEY = 'master_source_staff_directory_v3';
const COLONY_MAP_STORAGE_KEY = 'master_source_colony_beat_mappings_v4';
const CUSTOM_OFFICE_STORAGE_KEY = 'master_source_custom_offices_v3';
const ACTIVE_SESSION_KEY = 'master_source_active_staff_session';

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
    id: 'STAFF-50457421',
    employeeId: '50457421',
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
    id: 'STAFF-VIEWER-01',
    employeeId: 'OBS-324009',
    name: 'Field Observer (Viewer)',
    email: 'viewer@indiapost.gov.in',
    password: hashPasswordSync('Viewer@123'),
    hasCustomPassword: true,
    role: 'VIEWER',
    designationType: 'Inspector (IP / ASP)',
    contact: '0744-2500123',
    beat: 'Beat 1',
    assignedBeats: ['Beat 1', 'Beat 2'],
    assignedOffice: 'Dadabari S.O. (324009)',
    circle: 'Rajasthan Circle',
    division: 'Kota Division',
    headOffice: 'Kota H.O.',
    subOffice: 'Dadabari S.O.',
    branchOffice: '',
    officePincode: '324009',
    officeAddress: 'Dadabari Sub-Post Office, Near CAD Circle, Kota, Rajasthan - 324009',
    deliveryOfficeMapping: 'Dadabari S.O. (324009)',
    assignedColonies: ['Dadabari Extension', 'Keshavpura Sector 7'],
    fixedKm: 15,
    permissions: { ...DEFAULT_VIEWER_PERMISSION },
    entriesCreatedToday: 0,
    lastEntryDate: new Date().toISOString().split('T')[0],
    totalEntriesCount: 0,
    status: 'Active',
  },
  {
    id: 'STAFF-50510312',
    employeeId: '50510312',
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
    id: 'STAFF-10310735',
    employeeId: '10310735',
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
    name: 'Vikram Singh Hada (SPM Engg College SO)',
    email: 'vikram.hada@indiapost.gov.in',
    password: hashPasswordSync(DEFAULT_STAFF_FALLBACK_PASSWORD),
    hasCustomPassword: false,
    role: 'POSTMASTER',
    designationType: 'SPM / Postmaster',
    contact: '9414188210',
    beat: 'Beat EC-1',
    assignedBeats: ['Beat EC-1', 'Beat EC-2'],
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
      allowedBeats: ['Beat EC-1', 'Beat EC-2'],
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
  private listeners: (() => void)[] = [];
  private isNotifying: boolean = false;
  private cachedAutoOffices: DynamicOfficeRecord[] | null = null;
  private cachedActiveSession: StaffProfile | null | undefined = undefined;

  constructor() {
    this.loadAll();
  }

  private loadAll() {
    // 1. Load Directory Staff & reconcile UPDATED_STAFF_LIST so new/updated seed employees always get login access
    try {
      const storedDir = localStorage.getItem(DIRECTORY_STORAGE_KEY);
      if (storedDir) {
        const parsedDir = JSON.parse(storedDir) as Staff[];
        this.directoryStaff = Array.isArray(parsedDir) ? parsedDir : [];
        let dirChanged = false;

        for (const seedStaff of UPDATED_STAFF_LIST) {
          const enrichedSeed = this.enrichDirectoryStaff(seedStaff);
          const seedEmpId = (enrichedSeed.employeeId || seedStaff.id.replace(/^STAFF-/, '')).toUpperCase();
          const idx = this.directoryStaff.findIndex(
            s =>
              s.id.toUpperCase() === seedStaff.id.toUpperCase() ||
              (s.employeeId && s.employeeId.toUpperCase() === seedEmpId)
          );
          if (idx === -1) {
            this.directoryStaff.push(enrichedSeed);
            dirChanged = true;
          } else {
            const cur = this.directoryStaff[idx];
            const needsEmailSync = !cur.email || cur.email === 'N/A' || (seedEmpId === '50457421' && cur.email !== 'mahen.comtech@gmail.com');
            const needsEmpIdSync = !cur.employeeId;
            if (needsEmailSync || needsEmpIdSync) {
              this.directoryStaff[idx] = {
                ...cur,
                employeeId: cur.employeeId || enrichedSeed.employeeId,
                email: needsEmailSync ? enrichedSeed.email : cur.email,
                contact: cur.contact || enrichedSeed.contact,
                beat: cur.beat || enrichedSeed.beat,
              };
              dirChanged = true;
            }
          }
        }

        if (dirChanged) {
          this.saveDirectoryStaff(false);
        }
      } else {
        this.directoryStaff = UPDATED_STAFF_LIST.map(s => this.enrichDirectoryStaff(s));
        this.saveDirectoryStaff(false);
      }
    } catch (e) {
      this.directoryStaff = UPDATED_STAFF_LIST.map(s => this.enrichDirectoryStaff(s));
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

    // 3. Load Custom Office Overrides
    try {
      const storedOffices = localStorage.getItem(CUSTOM_OFFICE_STORAGE_KEY);
      if (storedOffices) {
        this.customOffices = JSON.parse(storedOffices);
      } else {
        this.customOffices = [];
      }
    } catch (e) {
      this.customOffices = [];
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

  private loadProfiles() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.profiles = JSON.parse(stored);
      } else {
        this.profiles = [...INITIAL_PROFILES];
      }

      // Reconcile legacy cached profiles so Ekta Meena is Master Admin and Mahendra Kumar Meena is strictly Beat 2 POSTMAN
      this.profiles = this.profiles.filter(
        p => p.id !== 'STAFF-ADMIN-01' && p.id !== 'STAFF-EKTA-01'
      );

      // Ensure all seeded profiles exist and authoritative master/staff profiles stay synchronized
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
          this.profiles[idx] = {
            ...initP,
            password: existingCustomPass || initP.password,
            hasCustomPassword: Boolean(this.profiles[idx]?.hasCustomPassword),
          };
        } else if (!this.profiles[idx]?.hasCustomPassword) {
          this.profiles[idx].password = initP.password;
          this.profiles[idx].hasCustomPassword = Boolean(initP.hasCustomPassword);
        }
      }

      // Ensure ALL directoryStaff (including those with 'N/A' raw email) hydrate into login profiles
      for (const dirStaff of this.directoryStaff) {
        const generated = this.createProfileFromDirectoryStaff(dirStaff);
        const exists = this.profiles.some(
          p =>
            p.email.toLowerCase() === generated.email.toLowerCase() ||
            (p.employeeId && generated.employeeId && p.employeeId.toUpperCase() === generated.employeeId.toUpperCase()) ||
            p.id.toUpperCase() === generated.id.toUpperCase()
        );
        if (!exists) {
          this.profiles.push(generated);
        }
      }

      // Normalize permissions, deduplicate by email/employeeId, and reset daily counters on boot
      const today = new Date().toISOString().split('T')[0];
      const seenEmails = new Set<string>();
      const deduped: StaffProfile[] = [];
      for (const rawP of this.profiles) {
        const normP = this.normalizeProfile(rawP);
        if (normP.lastEntryDate !== today) {
          normP.entriesCreatedToday = 0;
          normP.lastEntryDate = today;
        }
        const key = (normP.email || normP.id).toLowerCase();
        if (!seenEmails.has(key)) {
          seenEmails.add(key);
          deduped.push(normP);
        }
      }
      this.profiles = deduped;
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
    const email = isMahendraBeat2
      ? 'mahen.comtech@gmail.com'
      : s.email && s.email !== 'N/A'
      ? s.email.toLowerCase()
      : `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@indiapost.gov.in`;
    const isGds = (s.role || '').toUpperCase().includes('GDS');

    return {
      id: s.id,
      employeeId: s.employeeId || s.id.replace(/^STAFF-/, ''),
      name: s.name,
      email,
      password: hashPasswordSync(DEFAULT_STAFF_FALLBACK_PASSWORD),
      hasCustomPassword: false,
      mustChangePassword: false,
      role: isGds ? 'GDS' : 'POSTMAN',
      designationType: isMahendraBeat2 ? 'Postman' : s.designationType || normalizeDesignation(s.role),
      contact: s.contact,
      beat: isMahendraBeat2 ? 'Beat 2' : s.beat,
      assignedBeats: isMahendraBeat2 ? ['Beat 2'] : s.assignedBeats || [s.beat],
      assignedOffice: `${s.subOffice || s.subOrBranchOffice || 'Dadabari S.O.'} (${s.officePincode || '324009'})`,
      circle: s.circle || 'Rajasthan Circle',
      division: s.division || 'Kota Division',
      headOffice: s.headOffice || 'Kota H.O.',
      subOffice: s.subOffice || s.subOrBranchOffice || 'Dadabari S.O.',
      branchOffice: s.branchOffice || '',
      officePincode: s.officePincode || '324009',
      officeAddress:
        s.officeAddress ||
        'Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - 324009',
      deliveryOfficeMapping: s.deliveryOfficeMapping || 'Dadabari S.O. (324009) / Kota H.O.',
      assignedColonies: s.assignedColonies || getDefaultColoniesForBeat(s.beat),
      fixedKm: isMahendraBeat2 ? 30 : getDefaultFixedKmForBeat(s.beat),
      permissions: {
        ...DEFAULT_STAFF_PERMISSION,
        canCreateCustomer: true,
        canEditCustomer: true,
        canDeleteCustomer: false,
        canViewAllRecords: false,
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
        allowedBeats: [isMahendraBeat2 ? 'Beat 2' : s.beat],
        allowedOffices: [s.subOffice || s.subOrBranchOffice || 'Dadabari S.O.'],
        allowedColonies: s.assignedColonies || getDefaultColoniesForBeat(s.beat),
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
    const isMahendraBeat2 =
      !isMaster &&
      (lowerEmail === 'mahen.comtech@gmail.com' ||
        p.employeeId === '50457421' ||
        p.id === 'STAFF-50457421');

    const defaultModules = isMaster
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
    const learningVal = isMaster
      ? true
      : rawMods.learningSection ?? rawMods.departmentalLearningSection ?? defaultModules.learningSection;
    const schemeVal = isMaster
      ? true
      : rawMods.schemeLeadsSection ?? rawMods.productSchemeLeadSection ?? defaultModules.schemeLeadsSection;
    const shareVal = isMaster
      ? true
      : isMahendraBeat2
      ? false
      : rawMods.contentSharingSection ?? rawMods.contentSharingDispatchSection ?? defaultModules.contentSharingSection;
    const crmVal = isMaster ? true : rawMods.crmSection ?? defaultModules.crmSection;
    const billsVal = isMaster
      ? true
      : isMahendraBeat2
      ? false
      : rawMods.specialBillsSection ?? defaultModules.specialBillsSection;

    const desig = isMaster
      ? 'Master Admin (Developer / System Architect)'
      : isMahendraBeat2
      ? 'Postman'
      : p.designationType || p.designation || normalizeDesignation(p.role);
    const officeMeta = resolveOfficeMetadata(
      p.postOfficeName || p.branchOffice || p.subOffice || p.assignedOffice,
      p.branchOffice,
      p.officePincode
    );

    return {
      ...p,
      name: isMaster ? 'Ekta Meena' : isMahendraBeat2 ? 'Mahendra Kumar Meena' : p.name,
      contact: isMaster ? '8279275805' : p.contact,
      employeeId: isMaster ? 'MASTER-ADMIN-01' : isMahendraBeat2 ? '50457421' : p.employeeId || p.id.replace(/^STAFF-/, 'CSI-'),
      role: isMaster ? 'MASTER_ADMIN' : isMahendraBeat2 ? 'POSTMAN' : p.role,
      password: isMaster
        ? hashPasswordSync('Admin')
        : p.password || hashPasswordSync(DEFAULT_STAFF_FALLBACK_PASSWORD),
      hasCustomPassword: isMaster ? true : Boolean(p.hasCustomPassword),
      designation: desig,
      designationType: desig,
      officeId: p.officeId || officeMeta.officeId,
      postOfficeName: p.postOfficeName || officeMeta.postOfficeName,
      circle: p.circle || 'Rajasthan Circle',
      division: isMaster ? 'All Divisions' : p.division || 'Kota Division',
      headOffice: p.headOffice || 'Kota H.O.',
      subOffice: isMaster ? 'All Offices' : isMahendraBeat2 ? 'Dadabari S.O.' : p.subOffice || 'Dadabari S.O.',
      branchOffice: p.branchOffice || '',
      officePincode: p.officePincode || officeMeta.pincode || '324009',
      officeAddress:
        p.officeAddress ||
        'Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - 324009',
      beat: isMaster ? 'All Beats' : isMahendraBeat2 ? 'Beat 2' : p.beat || 'Beat 2',
      assignedBeats: isMaster ? ['All Beats'] : isMahendraBeat2 ? ['Beat 2'] : p.assignedBeats?.length ? p.assignedBeats : [p.beat || 'Beat 2'],
      deliveryOfficeMapping: isMaster
        ? 'All Divisions / All Sub-Offices / All Beats'
        : p.deliveryOfficeMapping || `${officeMeta.postOfficeName} (${p.officePincode || officeMeta.pincode})`,
      assignedColonies: isMaster ? ['All Colonies'] : colonies,
      fixedKm: isMaster ? 0 : isMahendraBeat2 ? 30 : p.fixedKm || getDefaultFixedKmForBeat(p.beat || 'Beat 2'),
      permissions: {
        ...p.permissions,
        canCreateCustomer: isMaster ? true : p.permissions?.canCreateCustomer ?? true,
        canEditCustomer: isMaster ? true : p.permissions?.canEditCustomer ?? true,
        canDeleteCustomer: isMaster ? true : isMahendraBeat2 ? false : Boolean(p.permissions?.canDeleteCustomer),
        canViewAllRecords: isMaster ? true : isMahendraBeat2 ? false : Boolean(p.permissions?.canViewAllRecords),
        canAssignStaff: isMaster ? true : isMahendraBeat2 ? false : Boolean(p.permissions?.canAssignStaff),
        canAccessSettings: isMaster ? true : isMahendraBeat2 ? false : Boolean(p.permissions?.canAccessSettings),
        approvalStatus: isMaster ? 'Approved' : p.permissions?.approvalStatus || 'Approved',
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
        allowedBeats: isMaster
          ? ['All Beats']
          : isMahendraBeat2
          ? ['Beat 2']
          : p.permissions?.allowedBeats?.length
          ? p.permissions.allowedBeats
          : [p.beat || 'Beat 2'],
        allowedOffices: isMaster
          ? ['All Offices']
          : isMahendraBeat2
          ? ['Dadabari S.O.']
          : p.permissions?.allowedOffices?.length
          ? p.permissions.allowedOffices
          : [p.subOffice || 'Dadabari S.O.'],
        allowedColonies: isMaster
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
      user.role === 'SUPER_ADMIN'
    );
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
      circle: input.circle.trim() || 'Rajasthan Circle',
      division: input.division.trim() || 'Kota Division',
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

    // 2. Update or Insert into StaffProfile (RBAC & Login)
    const existingProfIdx = this.profiles.findIndex(
      p =>
        p.email.toLowerCase() === generatedEmail ||
        (p.employeeId && p.employeeId === cleanEmpId)
    );

    const existingProf = existingProfIdx >= 0 ? this.profiles[existingProfIdx] : null;
    const mappedRole = isMaster
      ? 'MASTER_ADMIN'
      : input.role ||
        (input.designationType.includes('Inspector') || input.designationType.includes('Postmaster')
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
      circle: staffRecord.circle,
      division: staffRecord.division,
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
    const rawType = (o.officeType || 'SO').toUpperCase();
    const normType: 'HO' | 'SO' | 'BO' = rawType.includes('B')
      ? 'BO'
      : rawType.includes('H')
      ? 'HO'
      : 'SO';
    const ho = o.headOffice || o.hoName || 'Kota H.O.';
    const so = o.subOffice || o.soName || 'Dadabari S.O.';
    const bo = o.branchOffice || o.boName || undefined;
    const names = o.assignedStaffNames || [];
    const ids = o.assignedStaffIds || [];
    const count = o.assignedStaffCount ?? o.staffCount ?? Math.max(names.length, ids.length, 1);
    const officeMeta = resolveOfficeMetadata(o.officeName || o.subOffice, o.branchOffice, o.pincode);
    return {
      id: o.id,
      officeId: o.officeId || officeMeta.officeId,
      officeName: o.officeName,
      postOfficeName: o.postOfficeName || officeMeta.postOfficeName,
      officeType: normType,
      circle: o.circle || 'Rajasthan Circle',
      division: o.division || 'Kota Division',
      headOffice: ho,
      hoName: ho,
      subOffice: so,
      soName: so,
      branchOffice: bo,
      boName: bo,
      pincode: o.pincode || officeMeta.pincode || '324009',
      completeAddress: o.completeAddress || `${so}, ${o.division || 'Kota Division'} - ${o.pincode || '324009'}`,
      mappedBeats: o.mappedBeats || ['Beat 1'],
      mappedColonies: o.mappedColonies || [],
      linkedDeliveryOffices: o.linkedDeliveryOffices || officeMeta.linkedDeliveryOffices,
      coveragePercentage: o.coveragePercentage ?? 98.2,
      assignedStaffCount: count,
      staffCount: count,
      assignedStaffNames: names,
      assignedStaffIds: ids,
      isAutoManaged: o.isAutoManaged ?? true,
      updatedAt: o.updatedAt || new Date().toISOString(),
    };
  }

  public getAutoManagedOffices(): DynamicOfficeRecord[] {
    if (this.cachedAutoOffices) {
      return this.cachedAutoOffices;
    }
    const officeMap = new Map<string, DynamicOfficeRecord>();

    // Seed from customOffices first
    for (const co of this.customOffices) {
      officeMap.set(co.officeName.toLowerCase(), this.normalizeOfficeRecord(co));
    }

    // Dynamically group and build from all Staff Profiles & Directory Staff
    for (const s of this.directoryStaff) {
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

      const key = primaryOfficeName.toLowerCase();
      const existing = officeMap.get(key);
      const staffBeats = s.assignedBeats?.length ? s.assignedBeats : [s.beat];
      const staffColonies = s.assignedColonies?.length ? s.assignedColonies : getDefaultColoniesForBeat(s.beat);

      if (!existing) {
        officeMap.set(
          key,
          this.normalizeOfficeRecord({
            id: `AUTO-OFF-${officeMap.size + 1}`,
            officeName: primaryOfficeName,
            officeType,
            circle,
            division,
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
            isAutoManaged: true,
            updatedAt: new Date().toISOString(),
          })
        );
      } else {
        existing.circle = circle || existing.circle;
        existing.division = division || existing.division;
        existing.headOffice = ho || existing.headOffice;
        existing.hoName = existing.headOffice;
        existing.subOffice = so || existing.subOffice;
        existing.soName = existing.subOffice;
        existing.pincode = pin || existing.pincode;
        if (s.officeAddress) existing.completeAddress = s.officeAddress;
        existing.mappedBeats = [...new Set([...existing.mappedBeats, ...staffBeats])];
        existing.mappedColonies = [...new Set([...existing.mappedColonies, ...staffColonies])];
        if (!existing.assignedStaffNames.includes(s.name)) {
          existing.assignedStaffNames.push(s.name);
          existing.assignedStaffCount = existing.assignedStaffNames.length;
          existing.staffCount = existing.assignedStaffCount;
        }
        if (!existing.assignedStaffIds.includes(s.id)) {
          existing.assignedStaffIds.push(s.id);
        }
      }

      // Ensure Head Office also exists as an auto-managed parent node
      const hoKey = ho.toLowerCase();
      if (!officeMap.has(hoKey)) {
        const hoStaff = this.directoryStaff.filter(
          st => (st.headOffice || 'Kota H.O.').toLowerCase() === hoKey
        );
        officeMap.set(
          hoKey,
          this.normalizeOfficeRecord({
            id: `AUTO-HO-${officeMap.size + 1}`,
            officeName: ho,
            officeType: 'HO',
            circle,
            division,
            headOffice: ho,
            hoName: ho,
            subOffice: so,
            soName: so,
            pincode: '324001',
            completeAddress: `${ho}, Nayapura / Station Road, ${division}, ${circle} - 324001`,
            mappedBeats: ['All Division Beats'],
            mappedColonies: ['Kota Head Office Jurisdiction'],
            assignedStaffCount: hoStaff.length,
            staffCount: hoStaff.length,
            assignedStaffNames: ['Head Postmaster & Divisional Staff'],
            assignedStaffIds: hoStaff.map(st => st.id),
            isAutoManaged: true,
            updatedAt: new Date().toISOString(),
          })
        );
      }

      // Ensure Engineering College S.O. exists
      if (!officeMap.has('engineering college s.o.')) {
        officeMap.set(
          'engineering college s.o.',
          this.normalizeOfficeRecord({
            id: 'AUTO-SO-ENG-COLLEGE',
            officeId: 'ENG_COLLEGE_SO',
            officeName: 'Engineering College S.O.',
            postOfficeName: 'Engineering College S.O.',
            officeType: 'SO',
            circle: 'Rajasthan Circle',
            division: 'Kota Division',
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
            assignedStaffCount: 2,
            staffCount: 2,
            assignedStaffNames: ['Vikram Singh Hada (SPM)', 'Suresh Chandra Verma (Postman)'],
            assignedStaffIds: ['STAFF-EC-SPM-01', 'STAFF-EC-PM-02'],
            isAutoManaged: true,
            updatedAt: new Date().toISOString(),
          })
        );
      }

      // Ensure all Kota City S.O., H.O., and B.O. offices from KOTA_OFFICE_MASTER_LIST exist in Auto-Managed Offices
      for (const po of KOTA_OFFICE_MASTER_LIST) {
        const poKey = po.name.toLowerCase();
        const shortKey = po.name.replace(/\([^)]*\)/g, '').trim().toLowerCase();
        if (!officeMap.has(poKey) && !officeMap.has(shortKey)) {
          const matchedStaffForOffice = this.directoryStaff.filter(
            st =>
              (st.subOffice || '').toLowerCase().includes(shortKey) ||
              (st.branchOffice || '').toLowerCase().includes(shortKey) ||
              st.officePincode === po.pin
          );
          officeMap.set(
            poKey,
            this.normalizeOfficeRecord({
              id: `AUTO-${po.officeId}`,
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
              assignedStaffCount: Math.max(matchedStaffForOffice.length, 1),
              staffCount: Math.max(matchedStaffForOffice.length, 1),
              assignedStaffNames: matchedStaffForOffice.length
                ? matchedStaffForOffice.map(s => s.name)
                : [`${po.name} Postal Team`],
              assignedStaffIds: matchedStaffForOffice.length
                ? matchedStaffForOffice.map(s => s.id)
                : [`STAFF-${po.officeId}`],
              isAutoManaged: true,
              updatedAt: new Date().toISOString(),
            })
          );
        }
      }
    }

    this.cachedAutoOffices = Array.from(officeMap.values());
    return this.cachedAutoOffices;
  }

  public getDynamicOffices(): DynamicOfficeRecord[] {
    return this.getAutoManagedOffices();
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

  public getDynamicBeatsSummary(): {
    beatNumber: string;
    officeName: string;
    pincode: string;
    colonies: string[];
    assignedStaff: StaffProfile[];
  }[] {
    const beatMap = new Map<
      string,
      {
        beatNumber: string;
        officeName: string;
        pincode: string;
        colonies: string[];
        assignedStaff: StaffProfile[];
      }
    >();

    for (const p of this.profiles) {
      const beatKey = (p.beat || 'Beat 2').trim();
      const existing = beatMap.get(beatKey.toLowerCase());
      const cols = p.assignedColonies || getDefaultColoniesForBeat(beatKey);
      if (!existing) {
        beatMap.set(beatKey.toLowerCase(), {
          beatNumber: beatKey.startsWith('Beat') ? beatKey : `Beat ${beatKey}`,
          officeName: p.subOffice || 'Dadabari S.O.',
          pincode: p.officePincode || '324009',
          colonies: [...new Set(cols)],
          assignedStaff: [p],
        });
      } else {
        existing.colonies = [...new Set([...existing.colonies, ...cols])];
        if (!existing.assignedStaff.some(st => st.email === p.email)) {
          existing.assignedStaff.push(p);
        }
      }
    }

    for (const m of this.colonyBeatMappings) {
      const beatKey = (m.beatNumber || m.assignedBeatNumber || 'Beat 2').trim();
      const existing = beatMap.get(beatKey.toLowerCase());
      const label = m.sectorNumber && m.sectorNumber !== 'All Sectors'
        ? `${m.colonyName} (${m.sectorNumber})`
        : m.colonyName;
      if (!existing) {
        beatMap.set(beatKey.toLowerCase(), {
          beatNumber: beatKey.startsWith('Beat') ? beatKey : `Beat ${beatKey}`,
          officeName: m.subOrHoOffice || 'Dadabari S.O.',
          pincode: m.pincode || '324009',
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
    const idx = this.customOffices.findIndex(
      o => o.id === record.id || o.officeName.toLowerCase() === record.officeName.toLowerCase()
    );
    if (idx >= 0) {
      this.customOffices[idx] = record;
    } else {
      this.customOffices.push(record);
    }
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
    const norm = raw.toLowerCase();
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

    const isMaster = this.isSuperAdmin(foundProfile) || isAdminIdentifier;
    if (isMaster) {
      // Master Admin authenticates seamlessly with or without a password
      foundProfile.role = 'MASTER_ADMIN';
      foundProfile.beat = 'All Beats';
      foundProfile.assignedBeats = ['All Beats'];
      foundProfile.division = 'All Divisions';
    } else if (!options?.skipPasswordCheck) {
      const contact10 = (foundProfile.contact || '').replace(/\D/g, '').slice(-10);
      const pass10 = cleanPass.replace(/\D/g, '').slice(-10);
      const ok =
        cleanPass === DEFAULT_STAFF_FALLBACK_PASSWORD ||
        (Boolean(cleanPass) && cleanPass.toLowerCase() === (foundProfile.employeeId || '').toLowerCase()) ||
        (Boolean(contact10) && Boolean(pass10) && pass10 === contact10) ||
        (Boolean(cleanPass) && Boolean(foundProfile.password) && verifyPasswordSync(cleanPass, foundProfile.password));
      if (!ok) {
        return {
          success: false,
          error: `Invalid password. Use default password ${DEFAULT_STAFF_FALLBACK_PASSWORD}, your Employee ID (${foundProfile.employeeId}), or your custom password.`,
        };
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

    // 2. Ensure every directory staff member has an active login profile with default Post@1234
    for (const dirStaff of this.directoryStaff) {
      const generated = this.createProfileFromDirectoryStaff(dirStaff);
      const existingIdx = this.profiles.findIndex(
        p =>
          p.email.toLowerCase() === generated.email.toLowerCase() ||
          (p.employeeId && generated.employeeId && p.employeeId.toUpperCase() === generated.employeeId.toUpperCase()) ||
          p.id.toUpperCase() === generated.id.toUpperCase()
      );
      if (existingIdx === -1) {
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
    role: 'POSTMAN' | 'STAFF' | 'ADMIN';
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
    const index = this.profiles.findIndex(p => p.email.toLowerCase() === normalized);
    const normProfile = this.normalizeProfile(profile);
    if (index >= 0) {
      this.profiles[index] = { ...this.profiles[index], ...normProfile };
    } else {
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

  public isPostmanOrGds(user: StaffProfile | null | undefined): boolean {
    if (!user) return false;
    if (
      this.isSuperAdmin(user) ||
      user.role === 'ADMIN' ||
      user.role === 'MASTER_ADMIN' ||
      user.role === 'SUPER_ADMIN' ||
      user.permissions?.canViewAllRecords === true
    ) {
      return false;
    }
    return true;
  }

  public getScopedBeatsSet(user: StaffProfile | null | undefined): Set<string> | null {
    if (!this.isPostmanOrGds(user) || !user) return null;
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
      assignedStaffEmail?: string;
      enteredBy?: string;
      createdBy?: string;
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
}

export const staffPermissionService = new StaffPermissionService();
