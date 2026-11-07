/**
 * Centralized Colony, Sector, PIN & Postman Beat Mapping Engine for POSTMAN BOOK CRM
 * Dadabari S.O. (Pincode 324009), Kota, Rajasthan
 *
 * Enforces a strict Hierarchical Colony-First Architecture across the application.
 */

import { UPDATED_STAFF_LIST } from './updatedStaffData';
import { Customer } from '../types/models';

export interface SectorHierarchyEntry {
  id: string;
  name: string;
  beatNo: string; // e.g. "Beat 2"
  cleanBeatNo: string; // e.g. "2"
  pincode: string; // e.g. "324009"
  subOffice: string; // e.g. "Dadabari S.O."
  staffId: string;
  staffName: string;
  staffRole: string;
  staffContact: string;
  description?: string;
}

export interface ColonyHierarchyEntry {
  id: string;
  name: string;
  defaultBeatNo: string;
  defaultCleanBeatNo: string;
  defaultPincode: string;
  defaultSubOffice: string;
  defaultStaffId: string;
  defaultStaffName: string;
  defaultStaffRole: string;
  defaultStaffContact: string;
  sectors: SectorHierarchyEntry[];
}

// Master Beat Staff lookup from UPDATED_STAFF_LIST
const STAFF_BY_BEAT: Record<string, { id: string; name: string; role: string; contact: string }> = {};
UPDATED_STAFF_LIST.forEach((s) => {
  STAFF_BY_BEAT[s.beat] = {
    id: s.id,
    name: s.name,
    role: s.role,
    contact: s.contact,
  };
});

const getStaff = (beatName: string) => {
  return STAFF_BY_BEAT[beatName] || {
    id: 'STAFF-50457421',
    name: 'Mahendra Kumar Meena',
    role: 'GDS/PMAN',
    contact: '8769706002',
  };
};

/**
 * 25 Official Major Colony Names in Required Order
 */
export const OFFICIAL_MAJOR_COLONIES = [
  'Keshavpura',
  'Basant Vihar',
  'Dadabari',
  'Hanuman Basti',
  'Mahaveer Nagar',
  'Talwandi',
  'Jawahar Nagar',
  'Rangbari',
  'Santoshi Nagar',
  'Shreenathpuram',
  'RK Puram',
  'Vivekanand Nagar',
  'Anantpura',
  'Rajeev Gandhi Nagar',
  'Vigyan Nagar',
  'Borkheda',
  'Raipura',
  'Ramchandra Pura',
  'Shakti Nagar',
  'Shastri Nagar',
  'Pratap Nagar',
  'Waqf Nagar',
  'Hanuman Nagar',
  'Shivpura',
  'Prem Nagar',
] as const;

export type OfficialMajorColony = typeof OFFICIAL_MAJOR_COLONIES[number];

/**
 * Helper to build a Sector Entry
 */
function createSector(
  name: string,
  beatNo: string,
  pincode = '324009',
  subOffice = 'Dadabari S.O.',
  description = ''
): SectorHierarchyEntry {
  const staff = getStaff(beatNo);
  const cleanBeatNo = beatNo.replace(/\D/g, '') || '2';
  return {
    id: `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${cleanBeatNo}`,
    name,
    beatNo,
    cleanBeatNo,
    pincode,
    subOffice,
    staffId: staff.id,
    staffName: staff.name,
    staffRole: staff.role,
    staffContact: staff.contact,
    description,
  };
}

/**
 * Comprehensive Colony-Sector-Beat-PIN-Staff Mapping Engine
 */
export const COLONY_HIERARCHY_MAP: Record<string, ColonyHierarchyEntry> = {
  Keshavpura: {
    id: 'col-keshavpura',
    name: 'Keshavpura',
    defaultBeatNo: 'Beat 2',
    defaultCleanBeatNo: '2',
    defaultPincode: '324009',
    defaultSubOffice: 'Dadabari S.O.',
    defaultStaffId: getStaff('Beat 2').id,
    defaultStaffName: getStaff('Beat 2').name,
    defaultStaffRole: getStaff('Beat 2').role,
    defaultStaffContact: getStaff('Beat 2').contact,
    sectors: [
      createSector('Sector 4', 'Beat 4', '324009', 'Dadabari S.O.', 'Commercial and residential belt'),
      createSector('Sector 6', 'Beat 2', '324009', 'Dadabari S.O.', 'House No. 1 to 417 sequential area'),
      createSector('KH Series', 'Beat 2', '324009', 'Dadabari S.O.', 'KH-1 to KH-252 dedicated property series'),
      createSector('Sector 7', 'Beat 2', '324009', 'Dadabari S.O.', 'Plot-1 to Plot-1010 sequential area'),
      createSector('UIT Series', 'Beat 2', '324009', 'Dadabari S.O.', 'UIT-1 to UIT-250 scheme series'),
      createSector('Sector 1', 'Beat 4', '324009', 'Dadabari S.O.', 'Keshavpura Sector 1 residential block'),
      createSector('Sector 2', 'Beat 4', '324009', 'Dadabari S.O.', 'Keshavpura Sector 2 residential block'),
      createSector('Sector 3', 'Beat 4', '324009', 'Dadabari S.O.', 'Keshavpura Sector 3 residential block'),
      createSector('Sector 5', 'Beat 13', '324009', 'Dadabari S.O.', 'Sheetla Mata Gali / Sector 5 extension'),
      createSector('Chhoti Basti', 'Beat 4', '324009', 'Dadabari S.O.', 'Inner community residential cluster'),
      createSector('Kisan Colony', 'Beat 13', '324009', 'Dadabari S.O.', 'Kisan Colony Dadabari link'),
      createSector('Industrial Area', 'Beat 27', '324009', 'Dadabari S.O.', 'Mini RIICO and warehouse fringe'),
    ],
  },

  'Basant Vihar': {
    id: 'col-basant-vihar',
    name: 'Basant Vihar',
    defaultBeatNo: 'Beat 3',
    defaultCleanBeatNo: '3',
    defaultPincode: '324009',
    defaultSubOffice: 'Dadabari S.O.',
    defaultStaffId: getStaff('Beat 3').id,
    defaultStaffName: getStaff('Beat 3').name,
    defaultStaffRole: getStaff('Beat 3').role,
    defaultStaffContact: getStaff('Beat 3').contact,
    sectors: [
      createSector('Sector 1', 'Beat 3', '324009', 'Dadabari S.O.', 'Basant Vihar Sector 1'),
      createSector('Sector 2', 'Beat 3', '324009', 'Dadabari S.O.', 'Basant Vihar Sector 2'),
      createSector('Block A', 'Beat 3', '324009', 'Dadabari S.O.', 'Basant Vihar Block A residential'),
      createSector('Block B', 'Beat 3', '324009', 'Dadabari S.O.', 'Basant Vihar Block B residential'),
      createSector('Sector C', 'Beat 25', '324009', 'Dadabari S.O.', 'Basant Vihar Sector C enclave'),
      createSector('Scheme No. 3', 'Beat 25', '324009', 'Dadabari S.O.', 'Scheme 3 development area'),
      createSector('Bank Colony', 'Beat 25', '324009', 'Dadabari S.O.', 'Bank Colony Dadabari link'),
    ],
  },

  Dadabari: {
    id: 'col-dadabari',
    name: 'Dadabari',
    defaultBeatNo: 'Beat 1',
    defaultCleanBeatNo: '1',
    defaultPincode: '324009',
    defaultSubOffice: 'Dadabari S.O.',
    defaultStaffId: getStaff('Beat 1').id,
    defaultStaffName: getStaff('Beat 1').name,
    defaultStaffRole: getStaff('Beat 1').role,
    defaultStaffContact: getStaff('Beat 1').contact,
    sectors: [
      createSector('Dadabari Main / Chauraha', 'Beat 2', '324009', 'Dadabari S.O.', 'Central Chauraha / market zone'),
      createSector('Dadabari Extension', 'Beat 1', '324009', 'Dadabari S.O.', 'Dadabari Extension area'),
      createSector('Sector 1', 'Beat 1', '324009', 'Dadabari S.O.', 'Dadabari Sector 1 near Modi College'),
      createSector('Sector 2', 'Beat 1', '324009', 'Dadabari S.O.', 'Dadabari Sector 2 / P&T Colony'),
      createSector('Sector 4', 'Beat 7', '324009', 'Dadabari S.O.', 'Sector 4 near Rotary Circle'),
      createSector('Sector 5', 'Beat 7', '324009', 'Dadabari S.O.', 'Sector 5 near Vivekanand Nagar link'),
      createSector('Sector 6 & Old Housing Board', 'Beat 29', '324009', 'Dadabari S.O.', 'Housing Board colony belt'),
      createSector('Block C & D', 'Beat 12', '324009', 'Dadabari S.O.', 'Old Post Office area / Radha Krishna Nagar'),
      createSector('Chambal Enclave', 'Beat 20', '324009', 'Dadabari S.O.', 'Chambal Barrage Road belt'),
      createSector('Pragati Nagar', 'Beat 23', '324009', 'Dadabari S.O.', 'Pragati Nagar / Surya Nagar'),
      createSector('Chhoti Basti', 'Beat 9', '324009', 'Dadabari S.O.', 'Dadabari Chhoti Basti'),
    ],
  },

  'Hanuman Basti': {
    id: 'col-hanuman-basti',
    name: 'Hanuman Basti',
    defaultBeatNo: 'Beat 9',
    defaultCleanBeatNo: '9',
    defaultPincode: '324009',
    defaultSubOffice: 'Dadabari S.O.',
    defaultStaffId: getStaff('Beat 9').id,
    defaultStaffName: getStaff('Beat 9').name,
    defaultStaffRole: getStaff('Beat 9').role,
    defaultStaffContact: getStaff('Beat 9').contact,
    sectors: [
      createSector('Main Basti', 'Beat 9', '324009', 'Dadabari S.O.', 'Hanuman Basti central residential cluster'),
      createSector('Gali No. 1 to 5', 'Beat 9', '324009', 'Dadabari S.O.', 'Sequential street lanes'),
      createSector('Hanumant Kheda', 'Beat 9', '324009', 'Dadabari S.O.', 'Hanumant Kheda perimeter'),
      createSector('Hanumant Vihar', 'Beat 28', '324009', 'Dadabari S.O.', 'Hanumant Vihar bypass link'),
    ],
  },

  'Mahaveer Nagar': {
    id: 'col-mahaveer-nagar',
    name: 'Mahaveer Nagar',
    defaultBeatNo: 'Beat 5',
    defaultCleanBeatNo: '5',
    defaultPincode: '324009',
    defaultSubOffice: 'Dadabari S.O.',
    defaultStaffId: getStaff('Beat 5').id,
    defaultStaffName: getStaff('Beat 5').name,
    defaultStaffRole: getStaff('Beat 5').role,
    defaultStaffContact: getStaff('Beat 5').contact,
    sectors: [
      createSector('Extension 1', 'Beat 5', '324009', 'Dadabari S.O.', 'Mahaveer Nagar Extension 1'),
      createSector('Extension 2', 'Beat 5', '324009', 'Dadabari S.O.', 'Mahaveer Nagar Extension 2'),
      createSector('Pocket A', 'Beat 5', '324009', 'Dadabari S.O.', 'Pocket A residential cluster'),
      createSector('Pocket B', 'Beat 6', '324009', 'Dadabari S.O.', 'Pocket B residential cluster'),
      createSector('Sector 1', 'Beat 5', '324009', 'Dadabari S.O.', 'Sector 1 near Samrat Chowk'),
      createSector('Sector 2', 'Beat 6', '324009', 'Dadabari S.O.', 'Sector 2 near Ilahi Basti / Police Line'),
      createSector('Sector 3', 'Beat 10', '324009', 'Dadabari S.O.', 'Sector 3 / Parijat Colony'),
      createSector('Sector 4 & 5', 'Beat 18', '324009', 'Dadabari S.O.', 'Sector 4 & 5 near Maheshwari Bhavan'),
      createSector('Samrat Chowk Commercial Hub', 'Beat 5', '324009', 'Dadabari S.O.', 'Major commercial marketplace'),
      createSector('Housing Board Belt', 'Beat 30', '324009', 'Dadabari S.O.', 'Housing Board & Police Chowki belt'),
    ],
  },

  Talwandi: {
    id: 'col-talwandi',
    name: 'Talwandi',
    defaultBeatNo: 'Beat 33',
    defaultCleanBeatNo: '33',
    defaultPincode: '324005',
    defaultSubOffice: 'Talwandi S.O.',
    defaultStaffId: getStaff('Beat 33').id,
    defaultStaffName: getStaff('Beat 33').name,
    defaultStaffRole: getStaff('Beat 33').role,
    defaultStaffContact: getStaff('Beat 33').contact,
    sectors: [
      createSector('Sector A', 'Beat 33', '324005', 'Talwandi S.O.', 'Talwandi Sector A'),
      createSector('Sector B', 'Beat 33', '324005', 'Talwandi S.O.', 'Talwandi Sector B'),
      createSector('Sector 1', 'Beat 33', '324005', 'Talwandi S.O.', 'Talwandi Sector 1'),
      createSector('Sector 2', 'Beat 33', '324005', 'Talwandi S.O.', 'Talwandi Sector 2'),
      createSector('Sector 3', 'Beat 33', '324005', 'Talwandi S.O.', 'Talwandi Sector 3'),
      createSector('Sector 4', 'Beat 33', '324005', 'Talwandi S.O.', 'Talwandi Sector 4'),
      createSector('Commerce College Enclave', 'Beat 33', '324005', 'Talwandi S.O.', 'Commerce College campus belt'),
    ],
  },

  'Jawahar Nagar': {
    id: 'col-jawahar-nagar',
    name: 'Jawahar Nagar',
    defaultBeatNo: 'Beat 31',
    defaultCleanBeatNo: '31',
    defaultPincode: '324005',
    defaultSubOffice: 'Vigyan Nagar S.O.',
    defaultStaffId: getStaff('Beat 31').id,
    defaultStaffName: getStaff('Beat 31').name,
    defaultStaffRole: getStaff('Beat 31').role,
    defaultStaffContact: getStaff('Beat 31').contact,
    sectors: [
      createSector('Sector A', 'Beat 31', '324005', 'Vigyan Nagar S.O.', 'Jawahar Nagar Sector A'),
      createSector('Sector B', 'Beat 31', '324005', 'Vigyan Nagar S.O.', 'Jawahar Nagar Sector B'),
      createSector('Sector C', 'Beat 31', '324005', 'Vigyan Nagar S.O.', 'Jawahar Nagar Sector C'),
      createSector('Coaching Hub Zone', 'Beat 31', '324005', 'Vigyan Nagar S.O.', 'Premier student institute zone'),
      createSector('City Mall Area', 'Beat 31', '324005', 'Vigyan Nagar S.O.', 'Commercial Mall and cinema perimeter'),
    ],
  },

  Rangbari: {
    id: 'col-rangbari',
    name: 'Rangbari',
    defaultBeatNo: 'Beat 15',
    defaultCleanBeatNo: '15',
    defaultPincode: '324009',
    defaultSubOffice: 'Dadabari S.O.',
    defaultStaffId: getStaff('Beat 15').id,
    defaultStaffName: getStaff('Beat 15').name,
    defaultStaffRole: getStaff('Beat 15').role,
    defaultStaffContact: getStaff('Beat 15').contact,
    sectors: [
      createSector('Sector 1', 'Beat 15', '324009', 'Dadabari S.O.', 'Rangbari Sector 1 near Subhash Nagar'),
      createSector('Sector 2', 'Beat 15', '324009', 'Dadabari S.O.', 'Rangbari Sector 2 / Veer Savarkar Colony'),
      createSector('Sector 3', 'Beat 16', '324009', 'Dadabari S.O.', 'Rangbari Sector 3 / Doctors Colony'),
      createSector('Sector 4', 'Beat 16', '324009', 'Dadabari S.O.', 'Rangbari Sector 4 / Rose Park'),
      createSector('Rangbari Road Enclave', 'Beat 11', '324009', 'Dadabari S.O.', 'Krishna Nagar and Outer Ring'),
      createSector('Rangbari Vistar', 'Beat 31', '324009', 'Dadabari S.O.', 'IL Border Colony & Stadium Road'),
      createSector('Veer Savarkar Colony', 'Beat 15', '324009', 'Dadabari S.O.', 'Veer Savarkar residential enclave'),
      createSector('Doctors Colony', 'Beat 16', '324009', 'Dadabari S.O.', 'Medical professionals housing colony'),
    ],
  },

  'Santoshi Nagar': {
    id: 'col-santoshi-nagar',
    name: 'Santoshi Nagar',
    defaultBeatNo: 'Beat 2',
    defaultCleanBeatNo: '2',
    defaultPincode: '324009',
    defaultSubOffice: 'Dadabari S.O.',
    defaultStaffId: getStaff('Beat 2').id,
    defaultStaffName: getStaff('Beat 2').name,
    defaultStaffRole: getStaff('Beat 2').role,
    defaultStaffContact: getStaff('Beat 2').contact,
    sectors: [
      createSector('Block A', 'Beat 2', '324009', 'Dadabari S.O.', 'Santoshi Nagar Block A'),
      createSector('Block B', 'Beat 2', '324009', 'Dadabari S.O.', 'Santoshi Nagar Block B'),
      createSector('Block C', 'Beat 2', '324009', 'Dadabari S.O.', 'Santoshi Nagar Block C'),
      createSector('House No. 1-800 Sequential', 'Beat 2', '324009', 'Dadabari S.O.', 'Main sequential property run'),
      createSector('Phase 1', 'Beat 2', '324009', 'Dadabari S.O.', 'Phase 1 development zone'),
      createSector('Phase 2', 'Beat 14', '324009', 'Dadabari S.O.', 'Phase 2 development zone'),
      createSector('Santoshi Nagar Extension', 'Beat 14', '324009', 'Dadabari S.O.', 'Extension & Koli Mohalla area'),
      createSector('Koli Mohalla', 'Beat 14', '324009', 'Dadabari S.O.', 'Koli Mohalla residential block'),
      createSector('Main Chauraha / Mandir Gali', 'Beat 2', '324009', 'Dadabari S.O.', 'Shiv Mandir and Chauraha zone'),
    ],
  },

  Shreenathpuram: {
    id: 'col-shreenathpuram',
    name: 'Shreenathpuram',
    defaultBeatNo: 'Beat 30',
    defaultCleanBeatNo: '30',
    defaultPincode: '324010',
    defaultSubOffice: 'Engineering College S.O.',
    defaultStaffId: getStaff('Beat 30').id,
    defaultStaffName: getStaff('Beat 30').name,
    defaultStaffRole: getStaff('Beat 30').role,
    defaultStaffContact: getStaff('Beat 30').contact,
    sectors: [
      createSector('Sector A', 'Beat 30', '324010', 'Engineering College S.O.', 'Shreenathpuram Sector A'),
      createSector('Sector B', 'Beat 30', '324010', 'Engineering College S.O.', 'Shreenathpuram Sector B'),
      createSector('Sector C', 'Beat 30', '324010', 'Engineering College S.O.', 'Shreenathpuram Sector C'),
      createSector('Sector D', 'Beat 30', '324010', 'Engineering College S.O.', 'Shreenathpuram Sector D'),
      createSector('Main Road', 'Beat 30', '324010', 'Engineering College S.O.', 'Commercial corridor'),
    ],
  },

  'RK Puram': {
    id: 'col-rk-puram',
    name: 'RK Puram',
    defaultBeatNo: 'Beat 30',
    defaultCleanBeatNo: '30',
    defaultPincode: '324010',
    defaultSubOffice: 'Engineering College S.O.',
    defaultStaffId: getStaff('Beat 30').id,
    defaultStaffName: getStaff('Beat 30').name,
    defaultStaffRole: getStaff('Beat 30').role,
    defaultStaffContact: getStaff('Beat 30').contact,
    sectors: [
      createSector('Sector A', 'Beat 30', '324010', 'Engineering College S.O.', 'RK Puram Sector A'),
      createSector('Sector B', 'Beat 30', '324010', 'Engineering College S.O.', 'RK Puram Sector B'),
      createSector('Sector C', 'Beat 30', '324010', 'Engineering College S.O.', 'RK Puram Sector C'),
      createSector('Housing Board Scheme', 'Beat 30', '324010', 'Engineering College S.O.', 'Housing Board colony houses'),
    ],
  },

  'Vivekanand Nagar': {
    id: 'col-vivekanand-nagar',
    name: 'Vivekanand Nagar',
    defaultBeatNo: 'Beat 7',
    defaultCleanBeatNo: '7',
    defaultPincode: '324009',
    defaultSubOffice: 'Dadabari S.O.',
    defaultStaffId: getStaff('Beat 7').id,
    defaultStaffName: getStaff('Beat 7').name,
    defaultStaffRole: getStaff('Beat 7').role,
    defaultStaffContact: getStaff('Beat 7').contact,
    sectors: [
      createSector('Sector 1', 'Beat 7', '324009', 'Dadabari S.O.', 'Vivekanand Nagar Sector 1'),
      createSector('Sector 2', 'Beat 7', '324009', 'Dadabari S.O.', 'Vivekanand Nagar Sector 2'),
      createSector('Block A', 'Beat 7', '324009', 'Dadabari S.O.', 'Vivekanand Nagar Block A'),
      createSector('Rotary Circle Perimeter', 'Beat 7', '324009', 'Dadabari S.O.', 'Perimeter around Rotary circle'),
    ],
  },

  Anantpura: {
    id: 'col-anantpura',
    name: 'Anantpura',
    defaultBeatNo: 'Beat 32',
    defaultCleanBeatNo: '32',
    defaultPincode: '324005',
    defaultSubOffice: 'Anantpura S.O.',
    defaultStaffId: getStaff('Beat 32').id,
    defaultStaffName: getStaff('Beat 32').name,
    defaultStaffRole: getStaff('Beat 32').role,
    defaultStaffContact: getStaff('Beat 32').contact,
    sectors: [
      createSector('Sector 1', 'Beat 32', '324005', 'Anantpura S.O.', 'Anantpura Sector 1'),
      createSector('Sector 2', 'Beat 32', '324005', 'Anantpura S.O.', 'Anantpura Sector 2'),
      createSector('Main Basti', 'Beat 32', '324005', 'Anantpura S.O.', 'Anantpura village/main settlement'),
      createSector('Industrial Extension', 'Beat 32', '324005', 'Anantpura S.O.', 'RIICO Industrial extension'),
    ],
  },

  'Rajeev Gandhi Nagar': {
    id: 'col-rajeev-gandhi-nagar',
    name: 'Rajeev Gandhi Nagar',
    defaultBeatNo: 'Beat 31',
    defaultCleanBeatNo: '31',
    defaultPincode: '324005',
    defaultSubOffice: 'Vigyan Nagar S.O.',
    defaultStaffId: getStaff('Beat 31').id,
    defaultStaffName: getStaff('Beat 31').name,
    defaultStaffRole: getStaff('Beat 31').role,
    defaultStaffContact: getStaff('Beat 31').contact,
    sectors: [
      createSector('Sector 1', 'Beat 31', '324005', 'Vigyan Nagar S.O.', 'Rajeev Gandhi Nagar Sector 1'),
      createSector('Sector 2', 'Beat 31', '324005', 'Vigyan Nagar S.O.', 'Rajeev Gandhi Nagar Sector 2'),
      createSector('Hostel Zone', 'Beat 31', '324005', 'Vigyan Nagar S.O.', 'High-density student hostel corridor'),
      createSector('Instrumentation Ltd Area', 'Beat 31', '324005', 'Vigyan Nagar S.O.', 'Former IL factory and staff belt'),
    ],
  },

  'Vigyan Nagar': {
    id: 'col-vigyan-nagar',
    name: 'Vigyan Nagar',
    defaultBeatNo: 'Beat 33',
    defaultCleanBeatNo: '33',
    defaultPincode: '324005',
    defaultSubOffice: 'Vigyan Nagar S.O.',
    defaultStaffId: getStaff('Beat 33').id,
    defaultStaffName: getStaff('Beat 33').name,
    defaultStaffRole: getStaff('Beat 33').role,
    defaultStaffContact: getStaff('Beat 33').contact,
    sectors: [
      createSector('Sector A', 'Beat 33', '324005', 'Vigyan Nagar S.O.', 'Vigyan Nagar Sector A'),
      createSector('Sector B', 'Beat 33', '324005', 'Vigyan Nagar S.O.', 'Vigyan Nagar Sector B'),
      createSector('Sector C', 'Beat 33', '324005', 'Vigyan Nagar S.O.', 'Vigyan Nagar Sector C'),
      createSector('Sector D', 'Beat 33', '324005', 'Vigyan Nagar S.O.', 'Vigyan Nagar Sector D'),
      createSector('Electronic Complex Zone', 'Beat 33', '324005', 'Vigyan Nagar S.O.', 'IT and electronic business belt'),
    ],
  },

  Borkheda: {
    id: 'col-borkheda',
    name: 'Borkheda',
    defaultBeatNo: 'Beat 28',
    defaultCleanBeatNo: '28',
    defaultPincode: '324010',
    defaultSubOffice: 'Borkheda S.O.',
    defaultStaffId: getStaff('Beat 28').id,
    defaultStaffName: getStaff('Beat 28').name,
    defaultStaffRole: getStaff('Beat 28').role,
    defaultStaffContact: getStaff('Beat 28').contact,
    sectors: [
      createSector('Deoli Arab Road', 'Beat 28', '324010', 'Borkheda S.O.', 'Deoli Arab residential belt'),
      createSector('Baran Road Belt', 'Beat 28', '324010', 'Borkheda S.O.', 'Main national highway link'),
      createSector('Phase 1 & 2', 'Beat 28', '324010', 'Borkheda S.O.', 'Housing board phases'),
    ],
  },

  Raipura: {
    id: 'col-raipura',
    name: 'Raipura',
    defaultBeatNo: 'Beat 27',
    defaultCleanBeatNo: '27',
    defaultPincode: '324005',
    defaultSubOffice: 'Dadabari S.O.',
    defaultStaffId: getStaff('Beat 27').id,
    defaultStaffName: getStaff('Beat 27').name,
    defaultStaffRole: getStaff('Beat 27').role,
    defaultStaffContact: getStaff('Beat 27').contact,
    sectors: [
      createSector('Main Village / Basti', 'Beat 27', '324005', 'Dadabari S.O.', 'Raipura original settlement'),
      createSector('Industrial Area', 'Beat 27', '324005', 'Dadabari S.O.', 'RIICO industrial fringe'),
      createSector('Housing Enclave', 'Beat 27', '324005', 'Dadabari S.O.', 'New colony extension'),
    ],
  },

  'Ramchandra Pura': {
    id: 'col-ramchandra-pura',
    name: 'Ramchandra Pura',
    defaultBeatNo: 'Beat 26',
    defaultCleanBeatNo: '26',
    defaultPincode: '324007',
    defaultSubOffice: 'Dadabari S.O.',
    defaultStaffId: getStaff('Beat 26').id,
    defaultStaffName: getStaff('Beat 26').name,
    defaultStaffRole: getStaff('Beat 26').role,
    defaultStaffContact: getStaff('Beat 26').contact,
    sectors: [
      createSector('Sector 1', 'Beat 26', '324007', 'Dadabari S.O.', 'Ramchandra Pura Sector 1'),
      createSector('Sector 2', 'Beat 26', '324007', 'Dadabari S.O.', 'Ramchandra Pura Sector 2'),
      createSector('Main Market', 'Beat 26', '324007', 'Dadabari S.O.', 'Market area corridor'),
    ],
  },

  'Shakti Nagar': {
    id: 'col-shakti-nagar',
    name: 'Shakti Nagar',
    defaultBeatNo: 'Beat 8',
    defaultCleanBeatNo: '8',
    defaultPincode: '324009',
    defaultSubOffice: 'Dadabari S.O.',
    defaultStaffId: getStaff('Beat 8').id,
    defaultStaffName: getStaff('Beat 8').name,
    defaultStaffRole: getStaff('Beat 8').role,
    defaultStaffContact: getStaff('Beat 8').contact,
    sectors: [
      createSector('Block A', 'Beat 8', '324009', 'Dadabari S.O.', 'Shakti Nagar Block A'),
      createSector('Block B', 'Beat 8', '324009', 'Dadabari S.O.', 'Shakti Nagar Block B'),
      createSector('Gali 1-7', 'Beat 8', '324009', 'Dadabari S.O.', 'Numbered residential lanes'),
    ],
  },

  'Shastri Nagar': {
    id: 'col-shastri-nagar',
    name: 'Shastri Nagar',
    defaultBeatNo: 'Beat 1',
    defaultCleanBeatNo: '1',
    defaultPincode: '324009',
    defaultSubOffice: 'Dadabari S.O.',
    defaultStaffId: getStaff('Beat 1').id,
    defaultStaffName: getStaff('Beat 1').name,
    defaultStaffRole: getStaff('Beat 1').role,
    defaultStaffContact: getStaff('Beat 1').contact,
    sectors: [
      createSector('Sector 1', 'Beat 1', '324009', 'Dadabari S.O.', 'Teachers Colony & Shastri Nagar link'),
      createSector('Sector 2', 'Beat 17', '324009', 'Dadabari S.O.', 'Shastri Nagar Sector 2'),
      createSector('Sector 3', 'Beat 17', '324009', 'Dadabari S.O.', 'Shastri Nagar Sector 3 / P&T Colony Block B'),
      createSector('Telecom Staff Colony', 'Beat 17', '324009', 'Dadabari S.O.', 'Telecom Kendra Staff quarters'),
    ],
  },

  'Pratap Nagar': {
    id: 'col-pratap-nagar',
    name: 'Pratap Nagar',
    defaultBeatNo: 'Beat 21',
    defaultCleanBeatNo: '21',
    defaultPincode: '324009',
    defaultSubOffice: 'Dadabari S.O.',
    defaultStaffId: getStaff('Beat 21').id,
    defaultStaffName: getStaff('Beat 21').name,
    defaultStaffRole: getStaff('Beat 21').role,
    defaultStaffContact: getStaff('Beat 21').contact,
    sectors: [
      createSector('Block A', 'Beat 21', '324009', 'Dadabari S.O.', 'Pratap Nagar Block A'),
      createSector('Block B', 'Beat 21', '324009', 'Dadabari S.O.', 'Pratap Nagar Block B'),
      createSector('Main Road', 'Beat 21', '324009', 'Dadabari S.O.', 'Commercial and residential link'),
    ],
  },

  'Waqf Nagar': {
    id: 'col-waqf-nagar',
    name: 'Waqf Nagar',
    defaultBeatNo: 'Beat 22',
    defaultCleanBeatNo: '22',
    defaultPincode: '324009',
    defaultSubOffice: 'Dadabari S.O.',
    defaultStaffId: getStaff('Beat 22').id,
    defaultStaffName: getStaff('Beat 22').name,
    defaultStaffRole: getStaff('Beat 22').role,
    defaultStaffContact: getStaff('Beat 22').contact,
    sectors: [
      createSector('Sector 1', 'Beat 22', '324009', 'Dadabari S.O.', 'Waqf Nagar Sector 1'),
      createSector('Sector 2', 'Beat 22', '324009', 'Dadabari S.O.', 'Waqf Nagar Sector 2'),
      createSector('Idgah Area', 'Beat 22', '324009', 'Dadabari S.O.', 'Idgah & community grounds perimeter'),
    ],
  },

  'Hanuman Nagar': {
    id: 'col-hanuman-nagar',
    name: 'Hanuman Nagar',
    defaultBeatNo: 'Beat 23',
    defaultCleanBeatNo: '23',
    defaultPincode: '324009',
    defaultSubOffice: 'Dadabari S.O.',
    defaultStaffId: getStaff('Beat 23').id,
    defaultStaffName: getStaff('Beat 23').name,
    defaultStaffRole: getStaff('Beat 23').role,
    defaultStaffContact: getStaff('Beat 23').contact,
    sectors: [
      createSector('Phase 1', 'Beat 23', '324009', 'Dadabari S.O.', 'Hanuman Nagar Phase 1'),
      createSector('Phase 2', 'Beat 23', '324009', 'Dadabari S.O.', 'Hanuman Nagar Phase 2'),
      createSector('Khatoli Road', 'Beat 23', '324009', 'Dadabari S.O.', 'Khatoli link road area'),
    ],
  },

  Shivpura: {
    id: 'col-shivpura',
    name: 'Shivpura',
    defaultBeatNo: 'Beat 9',
    defaultCleanBeatNo: '9',
    defaultPincode: '324009',
    defaultSubOffice: 'Dadabari S.O.',
    defaultStaffId: getStaff('Beat 9').id,
    defaultStaffName: getStaff('Beat 9').name,
    defaultStaffRole: getStaff('Beat 9').role,
    defaultStaffContact: getStaff('Beat 9').contact,
    sectors: [
      createSector('Main Colony', 'Beat 9', '324009', 'Dadabari S.O.', 'Shivpura main residential cluster'),
      createSector('Shiv Mandir Area', 'Beat 9', '324009', 'Dadabari S.O.', 'Mandir perimeter lane'),
      createSector('Chambal Kinara', 'Beat 9', '324009', 'Dadabari S.O.', 'Riverfront area'),
    ],
  },

  'Prem Nagar': {
    id: 'col-prem-nagar',
    name: 'Prem Nagar',
    defaultBeatNo: 'Beat 24',
    defaultCleanBeatNo: '24',
    defaultPincode: '324004',
    defaultSubOffice: 'Dadabari S.O.',
    defaultStaffId: getStaff('Beat 24').id,
    defaultStaffName: getStaff('Beat 24').name,
    defaultStaffRole: getStaff('Beat 24').role,
    defaultStaffContact: getStaff('Beat 24').contact,
    sectors: [
      createSector('Prem Nagar 1st', 'Beat 24', '324004', 'Dadabari S.O.', 'Prem Nagar 1st residential block'),
      createSector('Prem Nagar 2nd', 'Beat 24', '324004', 'Dadabari S.O.', 'Prem Nagar 2nd residential block'),
      createSector('Prem Nagar 3rd', 'Beat 24', '324004', 'Dadabari S.O.', 'Prem Nagar 3rd residential block'),
      createSector('Gobar Gas Plant Road', 'Beat 24', '324004', 'Dadabari S.O.', 'Plant link road perimeter'),
    ],
  },
};

/**
 * Normalizes any free-form colony string to one of the official colonies
 */
export function normalizeColonyName(raw: string): string {
  if (!raw) return 'Keshavpura';
  const low = raw.trim().toLowerCase();

  for (const official of OFFICIAL_MAJOR_COLONIES) {
    if (low === official.toLowerCase()) return official;
  }

  if (low.includes('keshav') || low.includes('keshpura')) return 'Keshavpura';
  if (low.includes('basant')) return 'Basant Vihar';
  if (low.includes('dadabari')) return 'Dadabari';
  if (low.includes('hanuman basti') || low.includes('basti hanuman')) return 'Hanuman Basti';
  if (low.includes('hanuman nagar')) return 'Hanuman Nagar';
  if (low.includes('mahaveer') || low.includes('mahavir')) return 'Mahaveer Nagar';
  if (low.includes('talwandi')) return 'Talwandi';
  if (low.includes('jawahar')) return 'Jawahar Nagar';
  if (low.includes('rangbari') || low.includes('rangbadi')) return 'Rangbari';
  if (low.includes('santoshi')) return 'Santoshi Nagar';
  if (low.includes('shreenath') || low.includes('srinath')) return 'Shreenathpuram';
  if (low.includes('rk puram') || low.includes('r.k. puram') || low.includes('rkpuram')) return 'RK Puram';
  if (low.includes('vivekanand') || low.includes('vivekananda')) return 'Vivekanand Nagar';
  if (low.includes('anantpura')) return 'Anantpura';
  if (low.includes('rajeev gandhi') || low.includes('rajiv gandhi')) return 'Rajeev Gandhi Nagar';
  if (low.includes('vigyan')) return 'Vigyan Nagar';
  if (low.includes('borkheda') || low.includes('borkhedi')) return 'Borkheda';
  if (low.includes('raipura')) return 'Raipura';
  if (low.includes('ramchandra') || low.includes('ramchandrapura')) return 'Ramchandra Pura';
  if (low.includes('shakti nagar')) return 'Shakti Nagar';
  if (low.includes('shastri nagar') || low.includes('shastri')) return 'Shastri Nagar';
  if (low.includes('pratap nagar') || low.includes('pratap')) return 'Pratap Nagar';
  if (low.includes('waqf') || low.includes('vakf')) return 'Waqf Nagar';
  if (low.includes('shivpura')) return 'Shivpura';
  if (low.includes('prem nagar')) return 'Prem Nagar';
  if (low.includes('patel')) return 'Patel Nagar';
  if (low.includes('teachers') || low.includes('teacher')) return 'Teachers Colony';
  if (low.includes('cad')) return 'CAD Colony';
  if (low.includes('thermal')) return 'Thermal Colony';

  // Return original trimmed with first letters capitalized
  return raw.trim();
}

/**
 * Returns list of colonies for filter dropdowns.
 * Ensures the 25 official major colonies appear first in strict order, followed by any other distinct colonies.
 */
export function getHierarchyColoniesList(additionalFromRecords: string[] = []): string[] {
  const result: string[] = [...OFFICIAL_MAJOR_COLONIES];
  const set = new Set<string>(result.map((c) => c.toLowerCase()));

  additionalFromRecords.forEach((col) => {
    if (!col) return;
    const clean = col.trim();
    if (clean && !set.has(clean.toLowerCase()) && clean !== 'All') {
      set.add(clean.toLowerCase());
      result.push(clean);
    }
  });

  return result;
}

/**
 * Returns sectors/blocks mapped to a specific colony
 */
export function getHierarchySectorsForColony(
  colonyName: string,
  additionalFromRecords: string[] = []
): string[] {
  const normalized = normalizeColonyName(colonyName);
  const entry = COLONY_HIERARCHY_MAP[normalized];
  const mappedSectors = entry ? entry.sectors.map((s) => s.name) : [];

  const combined = [...mappedSectors];
  const set = new Set<string>(combined.map((s) => s.toLowerCase()));

  additionalFromRecords.forEach((sec) => {
    if (!sec) return;
    const clean = sec.trim();
    if (clean && !set.has(clean.toLowerCase()) && clean !== 'All' && clean !== normalized) {
      set.add(clean.toLowerCase());
      combined.push(clean);
    }
  });

  return combined.length > 0 ? combined : ['Sector 1', 'Main Block'];
}

/**
 * Central Resolution Engine: Binds Colony + Sector to Beat, Staff, PIN Code & Sub Office
 */
export function resolveColonySectorDetails(colonyName: string, sectorName?: string) {
  const normalizedColony = normalizeColonyName(colonyName);
  const colonyEntry = COLONY_HIERARCHY_MAP[normalizedColony];

  let beatNo = colonyEntry?.defaultBeatNo || 'Beat 2';
  let cleanBeatNo = colonyEntry?.defaultCleanBeatNo || '2';
  let pincode = colonyEntry?.defaultPincode || '324009';
  let subOffice = colonyEntry?.defaultSubOffice || 'Dadabari S.O.';
  let staffId = colonyEntry?.defaultStaffId || getStaff('Beat 2').id;
  let staffName = colonyEntry?.defaultStaffName || getStaff('Beat 2').name;
  let staffRole = colonyEntry?.defaultStaffRole || getStaff('Beat 2').role;
  let staffContact = colonyEntry?.defaultStaffContact || getStaff('Beat 2').contact;

  if (colonyEntry && sectorName) {
    const secLow = sectorName.toLowerCase().trim();
    const matchedSector = colonyEntry.sectors.find(
      (s) =>
        s.name.toLowerCase() === secLow ||
        secLow.includes(s.name.toLowerCase()) ||
        s.name.toLowerCase().includes(secLow)
    );

    if (matchedSector) {
      beatNo = matchedSector.beatNo;
      cleanBeatNo = matchedSector.cleanBeatNo;
      pincode = matchedSector.pincode;
      subOffice = matchedSector.subOffice;
      staffId = matchedSector.staffId;
      staffName = matchedSector.staffName;
      staffRole = matchedSector.staffRole;
      staffContact = matchedSector.staffContact;
    }
  }

  const jurisdictionBadge = `${normalizedColony}${sectorName ? ` • ${sectorName}` : ''} → ${beatNo} (${staffName}, ${staffRole}) • PIN ${pincode}`;

  return {
    colony: normalizedColony,
    sector: sectorName || colonyEntry?.sectors[0]?.name || 'Sector 1',
    beatNo,
    cleanBeatNo,
    pincode,
    subOffice,
    staffId,
    staffName,
    staffRole,
    staffContact,
    jurisdictionBadge,
  };
}

/**
 * Filter predicate for Customers in CustomerList / Master Customer Directory
 */
export function matchCustomerToColonyAndSector(
  customer: Customer,
  selectedColony: string,
  selectedSubSector: string
): boolean {
  if (selectedColony !== 'All') {
    const normSelected = normalizeColonyName(selectedColony).toLowerCase();
    const cArea = (customer.area || '').toLowerCase();
    const cLocality = (customer.sectorLocality || '').toLowerCase();
    const cAddress = (customer.address?.area || customer.address?.sectorLocality || customer.address?.fullAddress || '').toLowerCase();
    const cSector = (customer.sector || '').toLowerCase();

    const matchesColony =
      cArea.includes(normSelected) ||
      cLocality.includes(normSelected) ||
      cAddress.includes(normSelected) ||
      cSector.includes(normSelected);

    if (!matchesColony) return false;
  }

  if (selectedSubSector !== 'All') {
    const target = selectedSubSector.toLowerCase().trim();
    const cSector = (customer.sector || '').toLowerCase();
    const cHouse = (customer.houseNo || customer.address?.houseNumber || '').toLowerCase();
    const cRemarks = (customer.remarks || '').toLowerCase();
    const cAddress = (customer.address?.fullAddress || '').toLowerCase();

    // KH Series special matching
    if (target.includes('kh series') || target === 'kh') {
      return (
        cHouse.startsWith('kh-') ||
        cHouse.includes('kh') ||
        cSector.includes('kh') ||
        cRemarks.includes('kh') ||
        cAddress.includes('kh')
      );
    }

    // UIT Series special matching
    if (target.includes('uit series') || target === 'uit') {
      return (
        cHouse.startsWith('uit') ||
        cHouse.includes('uit') ||
        cSector.includes('uit') ||
        cRemarks.includes('uit') ||
        cAddress.includes('uit')
      );
    }

    return (
      cSector.includes(target) ||
      cHouse.includes(target) ||
      cRemarks.includes(target) ||
      cAddress.includes(target)
    );
  }

  return true;
}

/**
 * Filter predicate for Property Records against a sub-sector / series chip
 */
export function matchPropertyToSubSector(property: any, subSectorId: string): boolean {
  if (!subSectorId || subSectorId === 'All') return true;

  const target = subSectorId.toLowerCase().trim();
  const propBlock = (property.blockSector || '').toLowerCase();
  const houseNo = (property.housePlotNumber || '').toLowerCase();
  const landmark = (property.landmark || '').toLowerCase();
  const lastMile = (property.lastMileNote || '').toLowerCase();

  // KH Series matching
  if (target.includes('kh series') || target === 'kh' || target.includes('kh-')) {
    return (
      houseNo.startsWith('kh-') ||
      houseNo.includes('kh') ||
      propBlock.includes('kh') ||
      landmark.includes('kh') ||
      lastMile.includes('kh')
    );
  }

  // UIT Series matching
  if (target.includes('uit series') || target === 'uit' || target.includes('uit-')) {
    return (
      houseNo.startsWith('uit-') ||
      houseNo.includes('uit') ||
      propBlock.includes('uit') ||
      landmark.includes('uit') ||
      lastMile.includes('uit')
    );
  }

  // Sector 6 matching
  if (target === 'sector 6' || target === 'sec 6') {
    if (houseNo.startsWith('kh-') || propBlock.includes('kh')) {
      return false; // KH series is separate
    }
    return (
      propBlock.includes('sector 6') ||
      propBlock === '6' ||
      landmark.includes('sector 6') ||
      lastMile.includes('sector 6')
    );
  }

  // Sector 7 matching
  if (target === 'sector 7' || target === 'sec 7') {
    if (houseNo.startsWith('uit-') || propBlock.includes('uit')) {
      return false; // UIT series is separate
    }
    return (
      propBlock.includes('sector 7') ||
      propBlock === '7' ||
      landmark.includes('sector 7') ||
      lastMile.includes('sector 7')
    );
  }

  // Standard substring match
  return (
    propBlock.includes(target) ||
    landmark.includes(target) ||
    lastMile.includes(target) ||
    houseNo.includes(target)
  );
}

