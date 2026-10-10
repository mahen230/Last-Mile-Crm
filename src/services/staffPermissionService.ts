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
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'master_source_staff_profiles_v3';
const DIRECTORY_STORAGE_KEY = 'master_source_staff_directory_v3';
const COLONY_MAP_STORAGE_KEY = 'master_source_colony_beat_mappings_v3';
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
  {
    id: 'CBM-001',
    colonyName: 'Dadabari Extension',
    sectorNumber: 'Sector 1 & Sector 2',
    landmark: 'Jyoti Mandir / Modi College / Dadabari Dispensary',
    pincode: '324009',
    subOrHoOffice: 'Dadabari S.O. / Kota H.O.',
    beatNumber: 'Beat 1',
    assignedPostmanName: 'Muskan Sharma',
    assignedPostmanContact: '9521279186',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-002',
    colonyName: 'P&T Colony Dadabari',
    sectorNumber: 'Phase I',
    landmark: 'Post Office Dadabari / Ghode Wala School',
    pincode: '324009',
    subOrHoOffice: 'Dadabari S.O. / Kota H.O.',
    beatNumber: 'Beat 1',
    assignedPostmanName: 'Muskan Sharma',
    assignedPostmanContact: '9521279186',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-003',
    colonyName: 'Keshavpura',
    sectorNumber: 'Sector 7',
    landmark: 'Tejaji Mandir / TVS Circle / Keshav Market',
    pincode: '324009',
    subOrHoOffice: 'Dadabari S.O. / Kota H.O.',
    beatNumber: 'Beat 2',
    assignedPostmanName: 'Mahendra Kumar Meena',
    assignedPostmanContact: '8769706002',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-004',
    colonyName: 'Keshavpura',
    sectorNumber: 'Sector 6',
    landmark: 'Chauth Mata Mandir / Ganesh Mandir / UIT Market',
    pincode: '324009',
    subOrHoOffice: 'Dadabari S.O. / Kota H.O.',
    beatNumber: 'Beat 2',
    assignedPostmanName: 'Mahendra Kumar Meena',
    assignedPostmanContact: '8769706002',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-005',
    colonyName: 'Patel Nagar',
    sectorNumber: 'All Sectors',
    landmark: 'Patel Market / Shiv Ji Mandir / Pahla Chauk',
    pincode: '324009',
    subOrHoOffice: 'Dadabari S.O. / Kota H.O.',
    beatNumber: 'Beat 2',
    assignedPostmanName: 'Mahendra Kumar Meena',
    assignedPostmanContact: '8769706002',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-006',
    colonyName: 'Santoshi Nagar',
    sectorNumber: 'Main Block',
    landmark: 'Ramdev Mandir / Mamta Kirana / Akashya Kirana',
    pincode: '324009',
    subOrHoOffice: 'Dadabari S.O. / Kota H.O.',
    beatNumber: 'Beat 2',
    assignedPostmanName: 'Mahendra Kumar Meena',
    assignedPostmanContact: '8769706002',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-007',
    colonyName: 'Basant Vihar',
    sectorNumber: 'Sector A & B',
    landmark: 'Basant Vihar Park / CAD Main Road',
    pincode: '324009',
    subOrHoOffice: 'Dadabari S.O. / Kota H.O.',
    beatNumber: 'Beat 3',
    assignedPostmanName: 'Manali Ahuja',
    assignedPostmanContact: '7014408315',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-008',
    colonyName: 'Shastri Nagar',
    sectorNumber: 'Main Sector',
    landmark: 'Shastri Market / Community Hall',
    pincode: '324009',
    subOrHoOffice: 'Dadabari S.O. / Kota H.O.',
    beatNumber: 'Beat 4',
    assignedPostmanName: 'Govind Prasad',
    assignedPostmanContact: '7877352816',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-009',
    colonyName: 'Mahaveer Nagar I',
    sectorNumber: 'Sector 1 & 2',
    landmark: 'Samrat Chowk / Dispensary Road',
    pincode: '324009',
    subOrHoOffice: 'Dadabari S.O. / Kota H.O.',
    beatNumber: 'Beat 5',
    assignedPostmanName: 'Mohit Arvind',
    assignedPostmanContact: '8112232611',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-010',
    colonyName: 'Keshavpura',
    sectorNumber: 'Sector 4 & Sector 2',
    landmark: 'Ram Janki Mandir / Teacher Colony / Shopping Centre',
    pincode: '324009',
    subOrHoOffice: 'Dadabari S.O. / Kota H.O.',
    beatNumber: 'Beat 6',
    assignedPostmanName: 'Ramkishan Meghwal',
    assignedPostmanContact: '9664215130',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-011',
    colonyName: 'Teacher Colony',
    sectorNumber: 'Block A-D',
    landmark: 'Keshavpura Circle / Central Park',
    pincode: '324009',
    subOrHoOffice: 'Dadabari S.O. / Kota H.O.',
    beatNumber: 'Beat 6',
    assignedPostmanName: 'Ramkishan Meghwal',
    assignedPostmanContact: '9664215130',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-012',
    colonyName: 'Mandaliya Village & Naya Gaon',
    sectorNumber: 'Rural Belt',
    landmark: 'Mandaliya Branch Post Office / Highway Checkpost',
    pincode: '324009',
    subOrHoOffice: 'Mandaliya B.O. / Dadabari S.O.',
    branchOffice: 'Mandaliya B.O.',
    beatNumber: 'Beat BO',
    assignedPostmanName: 'Chetan Porwal (BPM Mandaliya)',
    assignedPostmanContact: '0744-2451122',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-013',
    colonyName: 'RTU Campus & Srinathpuram',
    sectorNumber: 'Sector A, B & Akelgarh',
    landmark: 'Rajasthan Technical University / Engineering College S.O.',
    pincode: '324010',
    subOrHoOffice: 'Engineering College S.O. / Kota H.O.',
    beatNumber: 'Beat EC-1',
    assignedPostmanName: 'Vikram Singh Hada',
    assignedPostmanContact: '9414188210',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-014',
    colonyName: 'Talwandi & Jawahar Nagar',
    sectorNumber: 'Sector 1 to 4 & Commerce College',
    landmark: 'Talwandi Circle / Global Hospital Road',
    pincode: '324010',
    subOrHoOffice: 'Engineering College S.O. / Kota H.O.',
    beatNumber: 'Beat EC-2',
    assignedPostmanName: 'Suresh Chandra Verma',
    assignedPostmanContact: '9829077412',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CBM-015',
    colonyName: 'Borabas Village & Rawatbhata Highway Belt',
    sectorNumber: 'Rural BO Jurisdiction',
    landmark: 'Borabas Branch Post Office / Mukundra Checkpost',
    pincode: '325003',
    subOrHoOffice: 'Borabas B.O. / Engineering College S.O.',
    branchOffice: 'Borabas B.O.',
    beatNumber: 'Beat BOR-1',
    assignedPostmanName: 'Kamlesh Kumar Meena (BPM Borabas)',
    assignedPostmanContact: '9413355901',
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
} {
  const combined = `${branchOffice || ''} ${rawOffice || ''} ${pincode || ''}`.toLowerCase();
  if (combined.includes('borabas') || pincode === '325003') {
    return {
      officeId: 'BORABAS_BO',
      postOfficeName: 'Borabas B.O.',
      pincode: '325003',
      parentOfficeName: 'Engineering College S.O. (324010) / Kota H.O.',
      linkedDeliveryOffices: [
        'Engineering College S.O. (324010)',
        'Dadabari S.O. (324009)',
        'Dolya Rural Delivery Point (325003)',
      ],
      officeType: 'BO',
    };
  }
  if (combined.includes('mandaliya') || combined.includes('beat bo')) {
    return {
      officeId: 'MANDALIYA_BO',
      postOfficeName: 'Mandaliya B.O.',
      pincode: '324009',
      parentOfficeName: 'Dadabari S.O. (324009) / Kota H.O.',
      linkedDeliveryOffices: [
        'Dadabari S.O. (324009)',
        'Naya Gaon Outskirts B.O. Link (324009)',
      ],
      officeType: 'BO',
    };
  }
  if (combined.includes('engineering college') || combined.includes('rtu') || pincode === '324010') {
    return {
      officeId: 'ENG_COLLEGE_SO',
      postOfficeName: 'Engineering College S.O.',
      pincode: '324010',
      parentOfficeName: 'Kota H.O. (324001)',
      linkedDeliveryOffices: [
        'Borabas B.O. (325003)',
        'Rathkankra B.O. (324010)',
        'Dadabari S.O. (324009)',
      ],
      officeType: 'SO',
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
        'Mandaliya B.O. (324009)',
        'Borabas B.O. (325003)',
      ],
      officeType: 'HO',
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
        'Mandaliya B.O. (324009)',
        'Borabas B.O. (325003)',
        'Engineering College S.O. (324010)',
      ],
      officeType: 'SO',
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
    linkedDeliveryOffices: isBo
      ? ['Dadabari S.O. (324009)']
      : ['Mandaliya B.O. (324009)', 'Borabas B.O. (325003)'],
    officeType: isBo ? 'BO' : isHo ? 'HO' : 'SO',
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
  if (b.includes('BO')) {
    return ['Mandaliya Village', 'Naya Gaon Outskirts'];
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
    id: 'STAFF-ADMIN-01',
    employeeId: 'CSI-10023401',
    name: 'Mahendra Kumar Meena (Master Admin)',
    email: 'mahen.comtech@gmail.com',
    password: 'Mahen@2304',
    role: 'SUPER_ADMIN',
    designationType: 'GDS (BPM / ABPM / Dak Sevak)',
    contact: '8769706002',
    beat: 'Beat 2',
    assignedBeats: ['Beat 2', 'All Beats'],
    assignedOffice: 'Dadabari S.O. (324009)',
    circle: 'Rajasthan Circle',
    division: 'Kota Division',
    headOffice: 'Kota H.O.',
    subOffice: 'Dadabari S.O.',
    branchOffice: '',
    officePincode: '324009',
    officeAddress: 'Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - 324009',
    deliveryOfficeMapping: 'Dadabari S.O. (324009) / Kota H.O.',
    assignedColonies: ['Keshavpura Sector 7', 'Keshavpura Sector 6', 'Patel Nagar', 'Santoshi Nagar'],
    fixedKm: 22,
    permissions: { ...DEFAULT_ADMIN_PERMISSION },
    entriesCreatedToday: 0,
    lastEntryDate: new Date().toISOString().split('T')[0],
    totalEntriesCount: 142,
    status: 'Active',
  },
  {
    id: 'STAFF-EKTA-01',
    employeeId: 'CSI-10294812',
    name: 'Ekta Meena',
    email: 'ektamahenmeena@gmail.com',
    password: 'Staff@123',
    role: 'STAFF',
    designationType: 'PA (Postal Assistant)',
    contact: '9521279186',
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
    assignedColonies: ['Keshavpura Sector 7', 'Keshavpura Sector 6', 'Patel Nagar', 'Santoshi Nagar'],
    fixedKm: 18,
    permissions: {
      ...DEFAULT_STAFF_PERMISSION,
      allowedBeats: ['Beat 2'],
      allowedOffices: ['Dadabari S.O.'],
      allowedColonies: ['Keshavpura Sector 7', 'Keshavpura Sector 6', 'Patel Nagar', 'Santoshi Nagar'],
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
    password: 'Viewer@123',
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
    password: 'Post@123',
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
    password: 'Post@123',
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
    id: 'STAFF-EC-SPM-01',
    employeeId: 'CSI-10448901',
    name: 'Vikram Singh Hada (SPM Engg College SO)',
    email: 'vikram.hada@indiapost.gov.in',
    password: 'Post@123',
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
    deliveryOfficeMapping: 'Engineering College S.O. (324010) / Borabas B.O. (325003)',
    assignedColonies: ['RTU Campus', 'Srinathpuram Sector A & B', 'Akelgarh', 'Talwandi Sector 1-4'],
    fixedKm: 20,
    permissions: {
      ...DEFAULT_STAFF_PERMISSION,
      dailyEntryLimit: 60,
      allowedBeats: ['Beat EC-1', 'Beat EC-2', 'Beat BOR-1'],
      allowedOffices: ['Engineering College S.O.', 'Borabas B.O.'],
      allowedColonies: ['RTU Campus', 'Srinathpuram Sector A & B', 'Akelgarh', 'Talwandi Sector 1-4'],
    },
    entriesCreatedToday: 0,
    lastEntryDate: new Date().toISOString().split('T')[0],
    totalEntriesCount: 19,
    status: 'Active',
  },
  {
    id: 'STAFF-BORABAS-BPM-01',
    employeeId: 'GDS-50882190',
    name: 'Kamlesh Kumar Meena (BPM Borabas BO)',
    email: 'kamlesh.borabas@indiapost.gov.in',
    password: 'Post@123',
    role: 'BPM',
    designationType: 'GDS (BPM / ABPM / Dak Sevak)',
    contact: '9413355901',
    beat: 'Beat BOR-1',
    assignedBeats: ['Beat BOR-1'],
    assignedOffice: 'Borabas B.O. (325003)',
    officeId: 'BORABAS_BO',
    postOfficeName: 'Borabas B.O.',
    circle: 'Rajasthan Circle',
    division: 'Kota Division',
    headOffice: 'Kota H.O.',
    subOffice: 'Engineering College S.O.',
    branchOffice: 'Borabas B.O.',
    officePincode: '325003',
    officeAddress: 'Borabas Branch Post Office, Rawatbhata Highway Belt, Via Engineering College SO, Kota - 325003',
    deliveryOfficeMapping: 'Borabas B.O. (325003) / Engineering College S.O. (324010)',
    assignedColonies: ['Borabas Village', 'Rawatbhata Road Belt', 'Dolya Settlement'],
    fixedKm: 24,
    permissions: {
      ...DEFAULT_STAFF_PERMISSION,
      dailyEntryLimit: 35,
      allowedBeats: ['Beat BOR-1'],
      allowedOffices: ['Borabas B.O.'],
      allowedColonies: ['Borabas Village', 'Rawatbhata Road Belt', 'Dolya Settlement'],
    },
    entriesCreatedToday: 0,
    lastEntryDate: new Date().toISOString().split('T')[0],
    totalEntriesCount: 9,
    status: 'Active',
  },
];

class StaffPermissionService {
  private profiles: StaffProfile[] = [];
  private directoryStaff: Staff[] = [];
  private colonyBeatMappings: ColonyBeatMapping[] = [];
  private customOffices: DynamicOfficeRecord[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadAll();
  }

  private loadAll() {
    // 1. Load Directory Staff (seeded from UPDATED_STAFF_LIST + any dynamic staff)
    try {
      const storedDir = localStorage.getItem(DIRECTORY_STORAGE_KEY);
      if (storedDir) {
        this.directoryStaff = JSON.parse(storedDir);
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
      email:
        s.email && s.email !== 'N/A'
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

      // Ensure all 33 directory staff also have linked StaffProfile entries for seamless authorization matrix management
      for (const initP of INITIAL_PROFILES) {
        if (!this.profiles.some(p => p.email.toLowerCase() === initP.email.toLowerCase())) {
          this.profiles.push(initP);
        }
      }

      for (const dirStaff of this.directoryStaff) {
        const email = (dirStaff.email || '').toLowerCase();
        if (!email || email === 'n/a') continue;
        const exists = this.profiles.some(
          p =>
            p.email.toLowerCase() === email ||
            (p.employeeId && dirStaff.employeeId && p.employeeId === dirStaff.employeeId)
        );
        if (!exists) {
          this.profiles.push(this.createProfileFromDirectoryStaff(dirStaff));
        }
      }

      // Normalize permissions and serviceModules on all profiles
      this.profiles = this.profiles.map(p => this.normalizeProfile(p));
      this.saveProfiles(false);
    } catch (e) {
      console.warn('Error loading staff profiles:', e);
      this.profiles = [...INITIAL_PROFILES];
    }
  }

  private createProfileFromDirectoryStaff(s: Staff): StaffProfile {
    const isMaster = s.contact === '8769706002' && s.name.toLowerCase().includes('mahendra');
    const email = isMaster
      ? 'mahen.comtech@gmail.com'
      : s.email && s.email !== 'N/A'
      ? s.email.toLowerCase()
      : `${s.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@indiapost.gov.in`;

    return {
      id: s.id,
      employeeId: s.employeeId || s.id.replace(/^STAFF-/, ''),
      name: s.name,
      email,
      password: isMaster ? 'Mahen@2304' : 'Post@123',
      role: isMaster ? 'SUPER_ADMIN' : 'POSTMAN',
      designationType: s.designationType || normalizeDesignation(s.role),
      contact: s.contact,
      beat: s.beat,
      assignedBeats: s.assignedBeats || [s.beat],
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
      fixedKm: getDefaultFixedKmForBeat(s.beat),
      permissions: isMaster
        ? { ...DEFAULT_ADMIN_PERMISSION }
        : {
            ...DEFAULT_STAFF_PERMISSION,
            allowedBeats: [s.beat],
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
    const isMaster = p.email.toLowerCase() === 'mahen.comtech@gmail.com';
    const defaultModules = isMaster
      ? DEFAULT_ADMIN_SERVICE_MODULES
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
      : rawMods.contentSharingSection ?? rawMods.contentSharingDispatchSection ?? defaultModules.contentSharingSection;
    const crmVal = isMaster ? true : rawMods.crmSection ?? defaultModules.crmSection;
    const billsVal = isMaster ? true : rawMods.specialBillsSection ?? defaultModules.specialBillsSection;

    const desig = p.designationType || p.designation || normalizeDesignation(p.role);
    const officeMeta = resolveOfficeMetadata(
      p.postOfficeName || p.branchOffice || p.subOffice || p.assignedOffice,
      p.branchOffice,
      p.officePincode
    );

    return {
      ...p,
      employeeId: p.employeeId || p.id.replace(/^STAFF-/, 'CSI-'),
      role: isMaster ? 'SUPER_ADMIN' : p.role,
      password: isMaster ? 'Mahen@2304' : p.password || 'Post@123',
      designation: desig,
      designationType: desig,
      officeId: p.officeId || officeMeta.officeId,
      postOfficeName: p.postOfficeName || officeMeta.postOfficeName,
      circle: p.circle || 'Rajasthan Circle',
      division: p.division || 'Kota Division',
      headOffice: p.headOffice || 'Kota H.O.',
      subOffice: p.subOffice || 'Dadabari S.O.',
      branchOffice: p.branchOffice || '',
      officePincode: p.officePincode || officeMeta.pincode || '324009',
      officeAddress:
        p.officeAddress ||
        'Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - 324009',
      assignedBeats: p.assignedBeats?.length ? p.assignedBeats : [p.beat || 'Beat 2'],
      deliveryOfficeMapping: p.deliveryOfficeMapping || `${officeMeta.postOfficeName} (${p.officePincode || officeMeta.pincode})`,
      assignedColonies: colonies,
      fixedKm: p.fixedKm || getDefaultFixedKmForBeat(p.beat || 'Beat 2'),
      permissions: {
        ...p.permissions,
        canViewAllRecords: isMaster ? true : Boolean(p.permissions?.canViewAllRecords),
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
          : p.permissions?.allowedBeats?.length
          ? p.permissions.allowedBeats
          : [p.beat || 'Beat 2'],
        allowedOffices: isMaster
          ? ['All Offices']
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profiles));
      if (notify) this.notifyListeners();
    } catch (e) {
      console.warn('Error saving staff profiles:', e);
    }
  }

  private saveDirectoryStaff(notify = true) {
    try {
      localStorage.setItem(DIRECTORY_STORAGE_KEY, JSON.stringify(this.directoryStaff));
      if (notify) this.notifyListeners();
    } catch (e) {
      console.warn('Error saving directory staff:', e);
    }
  }

  private saveColonyMappings(notify = true) {
    try {
      localStorage.setItem(COLONY_MAP_STORAGE_KEY, JSON.stringify(this.colonyBeatMappings));
      if (notify) this.notifyListeners();
    } catch (e) {
      console.warn('Error saving colony mappings:', e);
    }
  }

  private saveCustomOffices(notify = true) {
    try {
      localStorage.setItem(CUSTOM_OFFICE_STORAGE_KEY, JSON.stringify(this.customOffices));
      if (notify) this.notifyListeners();
    } catch (e) {
      console.warn('Error saving custom offices:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error(err);
      }
    });
  }

  // ================= SUPER ADMIN & GRANULAR MODULE ACCESS HELPERS =================

  public isSuperAdmin(user: StaffProfile | null | undefined): boolean {
    if (!user) return false;
    return (
      user.email?.toLowerCase() === 'mahen.comtech@gmail.com' ||
      user.role === 'SUPER_ADMIN'
    );
  }

  public canAccessServiceModule(
    user: StaffProfile | null | undefined,
    moduleKey: keyof ServiceModulePermissions
  ): boolean {
    if (!user) return false;
    if (this.isSuperAdmin(user)) return true;
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

    const isMaster = generatedEmail === 'mahen.comtech@gmail.com';
    const primaryBeat = input.beat.trim() || 'Beat 2';
    const beatList = input.assignedBeats?.length
      ? input.assignedBeats
      : primaryBeat.split(',').map(b => b.trim()).filter(Boolean);

    const colonies = input.assignedColonies?.length
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
      ? 'SUPER_ADMIN'
      : input.role ||
        (input.designationType.includes('Inspector') || input.designationType.includes('Postmaster')
          ? 'ADMIN'
          : input.designationType.includes('Postman') || input.designationType.includes('GDS')
          ? 'POSTMAN'
          : 'STAFF');

    const profile: StaffProfile = this.normalizeProfile({
      id: existingProf?.id || staffRecord.id,
      employeeId: cleanEmpId,
      name: cleanName,
      email: generatedEmail,
      password: isMaster ? 'Mahen@2304' : input.password || existingProf?.password || 'Post@123',
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

      // Ensure Mandaliya B.O. exists
      if (!officeMap.has('mandaliya b.o.')) {
        officeMap.set(
          'mandaliya b.o.',
          this.normalizeOfficeRecord({
            id: 'AUTO-BO-MANDALIYA',
            officeId: 'MANDALIYA_BO',
            officeName: 'Mandaliya B.O.',
            postOfficeName: 'Mandaliya B.O.',
            officeType: 'BO',
            circle: 'Rajasthan Circle',
            division: 'Kota Division',
            headOffice: 'Kota H.O.',
            hoName: 'Kota H.O.',
            subOffice: 'Dadabari S.O.',
            soName: 'Dadabari S.O.',
            branchOffice: 'Mandaliya B.O.',
            boName: 'Mandaliya B.O.',
            pincode: '324009',
            completeAddress: 'Mandaliya Branch Post Office, Naya Gaon Rural Belt, Under Dadabari S.O., Kota - 324009',
            mappedBeats: ['Beat BO'],
            mappedColonies: ['Mandaliya Village', 'Naya Gaon Outskirts'],
            linkedDeliveryOffices: ['Dadabari S.O. (324009)', 'Kota H.O. (324001)'],
            coveragePercentage: 92.0,
            assignedStaffCount: 1,
            staffCount: 1,
            assignedStaffNames: ['Chetan Porwal (BPM Mandaliya)'],
            assignedStaffIds: ['STAFF-MANDALIYA-BO'],
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
            linkedDeliveryOffices: ['Borabas B.O. (325003)', 'Rathkankra B.O. (324010)', 'Dadabari S.O. (324009)'],
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

      // Ensure Borabas B.O. exists
      if (!officeMap.has('borabas b.o.')) {
        officeMap.set(
          'borabas b.o.',
          this.normalizeOfficeRecord({
            id: 'AUTO-BO-BORABAS',
            officeId: 'BORABAS_BO',
            officeName: 'Borabas B.O.',
            postOfficeName: 'Borabas B.O.',
            officeType: 'BO',
            circle: 'Rajasthan Circle',
            division: 'Kota Division',
            headOffice: 'Kota H.O.',
            hoName: 'Kota H.O.',
            subOffice: 'Engineering College S.O.',
            soName: 'Engineering College S.O.',
            branchOffice: 'Borabas B.O.',
            boName: 'Borabas B.O.',
            pincode: '325003',
            completeAddress: 'Borabas Branch Post Office, Rawatbhata Highway Belt, Under Engineering College S.O., Kota - 325003',
            mappedBeats: ['Beat BOR-1'],
            mappedColonies: ['Borabas Village', 'Rawatbhata Highway Belt', 'Dolya Settlement'],
            linkedDeliveryOffices: ['Engineering College S.O. (324010)', 'Dadabari S.O. (324009)'],
            coveragePercentage: 94.5,
            assignedStaffCount: 1,
            staffCount: 1,
            assignedStaffNames: ['Kamlesh Kumar Meena (BPM Borabas)'],
            assignedStaffIds: ['STAFF-BORABAS-BPM-01'],
            isAutoManaged: true,
            updatedAt: new Date().toISOString(),
          })
        );
      }
    }

    return Array.from(officeMap.values());
  }

  public getDynamicOffices(): DynamicOfficeRecord[] {
    return this.getAutoManagedOffices();
  }

  public getHierarchyOptions(): {
    circles: string[];
    divisions: string[];
    headOffices: string[];
    subOffices: string[];
    branchOffices: string[];
    pincodes: string[];
    beats: string[];
  } {
    const offices = this.getAutoManagedOffices();
    const circles = [...new Set(offices.map(o => o.circle).filter(Boolean))];
    const divisions = [...new Set(offices.map(o => o.division).filter(Boolean))];
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
    return { circles, divisions, headOffices, subOffices, branchOffices, pincodes, beats };
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

    const existing = this.profiles.find(p => p.email.toLowerCase() === normalized);
    if (existing) {
      const norm = this.normalizeProfile(existing);
      return this.ensureDayReset(norm);
    }

    if (normalized === 'mahen.comtech@gmail.com') {
      const adminProfile = this.normalizeProfile(INITIAL_PROFILES[0]);
      this.profiles.unshift(adminProfile);
      this.saveProfiles();
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
      this.saveProfiles();
      return created;
    }

    const assignedBeat = 'Beat 2';
    const newProfile: StaffProfile = this.normalizeProfile({
      id: `STAFF-${Date.now().toString().slice(-6)}`,
      employeeId: `CSI-${Date.now().toString().slice(-6)}`,
      name: email.split('@')[0].replace(/[._]/g, ' '),
      email: normalized,
      password: 'Post@123',
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
    this.saveProfiles();
    return newProfile;
  }

  public authenticateWithPassword(
    email: string,
    password: string
  ): {
    success: boolean;
    profile?: StaffProfile;
    error?: string;
  } {
    const normalized = (email || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    if (normalized === 'mahen.comtech@gmail.com') {
      if (trimmedPass !== 'Mahen@2304') {
        return {
          success: false,
          error: 'Invalid Master Admin password. Please verify credentials for mahen.comtech@gmail.com.',
        };
      }
      const adminProfile = this.getStaffProfileByEmail(normalized);
      return { success: true, profile: adminProfile };
    }

    const existing = this.profiles.find(p => p.email.toLowerCase() === normalized);
    if (!existing) {
      const inDir = this.directoryStaff.find(s => s.email.toLowerCase() === normalized);
      if (!inDir) {
        return {
          success: false,
          error: 'Account not registered. Please use the Staff Registration tab to register your official account.',
        };
      }
      const created = this.getStaffProfileByEmail(normalized);
      if (created.password && created.password !== trimmedPass && trimmedPass !== 'Post@123') {
        return {
          success: false,
          error: 'Incorrect password for registered postal staff.',
        };
      }
      return { success: true, profile: created };
    }

    if (existing.permissions?.approvalStatus === 'Revoked') {
      return {
        success: false,
        error: 'Your staff access has been revoked by the Super Admin. Please contact Master Admin.',
      };
    }

    if (existing.password && existing.password !== trimmedPass) {
      return {
        success: false,
        error: 'Incorrect password. Please try again.',
      };
    }

    return { success: true, profile: this.getStaffProfileByEmail(normalized) };
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
      this.saveProfiles();
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
    if (!user) return false;

    if (this.isSuperAdmin(user) || user.role === 'ADMIN' || user.permissions.canViewAllRecords) {
      return true;
    }

    const userEmail = (user.email || '').trim().toLowerCase();
    const enteredBy = (record.enteredBy || '').trim().toLowerCase();
    const assignedEmail = (record.assignedStaffEmail || '').trim().toLowerCase();

    if (enteredBy && enteredBy === userEmail) return true;
    if (assignedEmail && assignedEmail === userEmail) return true;
    if (record.assignedStaffId && record.assignedStaffId === user.id) return true;

    // Check Beat Scope
    if (record.beatNo && user.beat && user.beat !== 'All Beats') {
      const normRecordBeat = record.beatNo.toLowerCase().replace(/beat\s*/i, '').trim();
      const normUserBeat = user.beat.toLowerCase().replace(/beat\s*/i, '').trim();
      if (normRecordBeat === normUserBeat) return true;
    }

    // Check Colony Scope
    if (user.assignedColonies?.length && (record.area || record.sector)) {
      const targetArea = `${record.area || ''} ${record.sector || ''}`.toLowerCase();
      if (user.assignedColonies.some(col => targetArea.includes(col.toLowerCase()))) {
        return true;
      }
    }

    return false;
  }

  public getActiveSession(): StaffProfile | null {
    try {
      const stored = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        return this.getStaffProfileByEmail(session.email);
      }
    } catch (e) {
      console.warn('Error reading active session:', e);
    }
    return null;
  }

  public setActiveSession(profile: StaffProfile | null): void {
    try {
      if (profile) {
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(profile));
      } else {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
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

  public exportAllToExcel(): void {
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
