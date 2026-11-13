/**
 * Dedicated Beat-Wise Fuel Bill Mapping Engine for Dadabari S.O. (Office ID: 28660686 / PIN 324009)
 * & Kota Delivery Jurisdiction (324009, 324005, 324010).
 * Covers all 33 beats with sanctioned daily route distances, departmental rate (₹3.60/KM),
 * territorial coverage, and monthly DSS fuel allowance calculations with exact 2-decimal precision.
 */

import { CONSOLIDATED_BEAT_MATRIX } from './consolidatedBeatMatrix';
import { UPDATED_STAFF_LIST } from './updatedStaffData';

export interface BeatFuelMapping {
  beatNumber: string; // e.g. "Beat 1", "Beat 2", ... "Beat 33"
  beatSeq: number; // 1 to 33
  pincode: string;
  linkedPincodes: string[];
  officeId: string;
  officeName: string;
  assignedStaffId: string;
  assignedStaffRole: string;
  assignedPostmanName: string;
  assignedPostmanContact: string;
  territorialCoverage: string;
  sanctionedDailyKm: number; // Daily route distance in KM
  fuelRatePerKm: number; // Departmental vehicle allowance rate (₹3.60/KM)
  dailyFuelAllowance: number; // sanctionedDailyKm * fuelRatePerKm (2 decimal precision)
  monthlyWorkingDays: number; // Standard 24 working days per month
  monthlyFuelAllowance: number; // dailyFuelAllowance * monthlyWorkingDays (2 decimal precision)
  terrainClassification: 'Urban High-Density' | 'Commercial Mixed' | 'Extended Residential' | 'Outskirts / Industrial';
  routeDescription: string;
}

export const DEPARTMENTAL_FUEL_RATE_PER_KM = 3.60; // Standard India Post two-wheeler rate (₹3.60/KM)
export const STANDARD_MONTHLY_WORKING_DAYS = 24;

/**
 * Sanctioned route distances in KM & pincode jurisdiction (324009, 324005, 324010) for Beats 1–33.
 */
const SANCTIONED_BEAT_KM_TABLE: Record<
  number,
  { km: number; terrain: BeatFuelMapping['terrainClassification']; desc: string; pincodes: string[] }
> = {
  1: { km: 16, terrain: 'Urban High-Density', desc: 'Dadabari Extension, P&T Colony & Teachers Colony compact route', pincodes: ['324009'] },
  2: { km: 18, terrain: 'Urban High-Density', desc: 'Keshavpura Sectors 6 & 7, Santoshi Nagar, TVS Circle & Market', pincodes: ['324009'] },
  3: { km: 15, terrain: 'Urban High-Density', desc: 'Basant Vihar, CAD Colony, Modi College Road Colony', pincodes: ['324009'] },
  4: { km: 20, terrain: 'Urban High-Density', desc: 'Keshavpura Vistar, Sectors 1-4, Chhoti Basti, Sabzi Mandi', pincodes: ['324009'] },
  5: { km: 19, terrain: 'Commercial Mixed', desc: 'Mahaveer Nagar Vistar, Samrat Chowk, Central Park Corridor', pincodes: ['324009', '324005'] },
  6: { km: 22, terrain: 'Urban High-Density', desc: 'Mahaveer Nagar 1st & 2nd, Ilahi Basti, Police Line Outer', pincodes: ['324009', '324005'] },
  7: { km: 17, terrain: 'Urban High-Density', desc: 'Dadabari Sector 4 & 5, Vivekanand Nagar, Rotary Circle', pincodes: ['324009'] },
  8: { km: 18, terrain: 'Commercial Mixed', desc: 'Dadabari Chhota Chauraha, Shastri Nagar, CAD Circle Belt', pincodes: ['324009'] },
  9: { km: 21, terrain: 'Extended Residential', desc: 'Rangbari Road, Sector 1-2, City Mall Approach', pincodes: ['324009', '324010'] },
  10: { km: 24, terrain: 'Extended Residential', desc: 'Rangbari Yojana, Balaji Nagar, New Coaching Extension', pincodes: ['324009', '324010'] },
  11: { km: 19, terrain: 'Urban High-Density', desc: 'Shreenathpuram Sector A, B, C & Stadium Enclave', pincodes: ['324009', '324010'] },
  12: { km: 20, terrain: 'Extended Residential', desc: 'RK Puram Sector A & B, Canal Perimeter', pincodes: ['324009', '324010'] },
  13: { km: 16, terrain: 'Commercial Mixed', desc: 'Talwandi Sector A & B, Commerce Centre, Hospital Zone', pincodes: ['324009', '324005'] },
  14: { km: 23, terrain: 'Commercial Mixed', desc: 'Jawahar Nagar Coaching Hub, City Park & Commercial Enclave', pincodes: ['324009', '324005'] },
  15: { km: 22, terrain: 'Commercial Mixed', desc: 'Rajeev Gandhi Nagar, Electronic Complex, Hostels', pincodes: ['324009', '324005'] },
  16: { km: 18, terrain: 'Urban High-Density', desc: 'Vigyan Nagar Sectors 1-3, Main Road Market', pincodes: ['324009', '324005'] },
  17: { km: 28, terrain: 'Outskirts / Industrial', desc: 'Anantpura, Large Scale Industrial Area, NH-52 Link', pincodes: ['324009', '324005'] },
  18: { km: 26, terrain: 'Outskirts / Industrial', desc: 'Raipura, Borkheda Outer, Transport Nagar Belt', pincodes: ['324009', '324005'] },
  19: { km: 17, terrain: 'Urban High-Density', desc: 'Hanuman Basti, Shakti Nagar, Chouth Mata Mandir Zone', pincodes: ['324009', '324005'] },
  20: { km: 19, terrain: 'Urban High-Density', desc: 'Pratap Nagar, Waqf Nagar, Gumanpura Boundary', pincodes: ['324009'] },
  21: { km: 25, terrain: 'Extended Residential', desc: 'Prem Nagar, Gobriya Bawari, Rural Fringe Route', pincodes: ['324009', '324005'] },
  22: { km: 21, terrain: 'Urban High-Density', desc: 'Shivpura, Dhabhai Ji Ka Kund, Old Ward Territory', pincodes: ['324009'] },
  23: { km: 24, terrain: 'Outskirts / Industrial', desc: 'DCM Road, Shriram Nagar, Industrial Colony', pincodes: ['324009', '324005'] },
  24: { km: 27, terrain: 'Outskirts / Industrial', desc: 'Instrumentation Ltd, Thermal Colony Gate, Chambal Link', pincodes: ['324009'] },
  25: { km: 18, terrain: 'Urban High-Density', desc: 'Rangbari Vistar, Koli Basti, Ghati Marg', pincodes: ['324009', '324010'] },
  26: { km: 22, terrain: 'Commercial Mixed', desc: 'Mahaveer Nagar 3rd, Landmark City Corridor', pincodes: ['324009', '324005'] },
  27: { km: 19, terrain: 'Urban High-Density', desc: 'Keshavpura KH Series & UIT Scheme residential belt', pincodes: ['324009'] },
  28: { km: 25, terrain: 'Extended Residential', desc: 'Santoshi Nagar Extension, Rawatbhata Bypass', pincodes: ['324009'] },
  29: { km: 17, terrain: 'Commercial Mixed', desc: 'Talwandi Commerce Centre, Aerodrome Circle Road', pincodes: ['324009', '324005'] },
  30: { km: 20, terrain: 'Extended Residential', desc: 'Shreenathpuram Extension, UIT Community Scheme', pincodes: ['324009', '324010'] },
  31: { km: 29, terrain: 'Outskirts / Industrial', desc: 'Borkheda Bypass, Deoli Arab Rural Route', pincodes: ['324009', '324005'] },
  32: { km: 30, terrain: 'Outskirts / Industrial', desc: 'Kunhari Perimeter, Bundi Road Junction, Chambal Link', pincodes: ['324009', '324010'] },
  33: { km: 32, terrain: 'Outskirts / Industrial', desc: 'Nanta, Kota Barrage Riverside Zone & Heavy Forest Perimeter', pincodes: ['324009'] },
};

/**
 * Builds the complete 33-Beat Fuel Mapping directory for Dadabari S.O.
 */
export function buildAll33BeatsFuelDirectory(): BeatFuelMapping[] {
  return Array.from({ length: 33 }, (_, i) => {
    const seq = i + 1;
    const beatKey = `Beat ${seq}`;
    const beatMatrix = CONSOLIDATED_BEAT_MATRIX.find((b) => b.beatSeq === seq || b.beatNumber === beatKey);
    const staff = UPDATED_STAFF_LIST.find((s) => s.beat === beatKey);

    const kmData = SANCTIONED_BEAT_KM_TABLE[seq] || {
      km: 18 + (seq % 10),
      terrain: 'Extended Residential',
      desc: `Dadabari S.O. Beat ${seq} Delivery Sector`,
      pincodes: ['324009'],
    };

    const dailyFuel = Number((kmData.km * DEPARTMENTAL_FUEL_RATE_PER_KM).toFixed(2));
    const monthlyFuel = Number((kmData.km * DEPARTMENTAL_FUEL_RATE_PER_KM * STANDARD_MONTHLY_WORKING_DAYS).toFixed(2));
    const linkedPincodes = Array.from(new Set([...(kmData.pincodes || ['324009']), beatMatrix?.pincode || '324009']));

    return {
      beatNumber: beatKey,
      beatSeq: seq,
      pincode: beatMatrix?.pincode || linkedPincodes[0] || '324009',
      linkedPincodes,
      officeId: '28660686',
      officeName: beatMatrix?.officeName || 'Dadabari Kota S.O',
      assignedStaffId: beatMatrix?.staffId || staff?.id || `STAFF-BEAT-${seq.toString().padStart(2, '0')}`,
      assignedStaffRole: beatMatrix?.staffRole || staff?.role || 'POSTMAN',
      assignedPostmanName: beatMatrix?.assignedPostmanName || staff?.name || 'Assigned Postman',
      assignedPostmanContact: beatMatrix?.assignedPostmanContact || staff?.contact || '8769706002',
      territorialCoverage:
        beatMatrix?.coloniesFormatted ||
        (beatMatrix?.colonies ? beatMatrix.colonies.join(', ') : `Beat ${seq} Territory`),
      sanctionedDailyKm: kmData.km,
      fuelRatePerKm: DEPARTMENTAL_FUEL_RATE_PER_KM,
      dailyFuelAllowance: dailyFuel,
      monthlyWorkingDays: STANDARD_MONTHLY_WORKING_DAYS,
      monthlyFuelAllowance: monthlyFuel,
      terrainClassification: kmData.terrain,
      routeDescription: kmData.desc,
    };
  });
}

export const ALL_33_BEATS_FUEL_DATA: BeatFuelMapping[] = buildAll33BeatsFuelDirectory();

/**
 * Fast lookup for any of the 33 beats
 */
export function getBeatFuelMapping(beatNo: string): BeatFuelMapping {
  const numMatch = (beatNo || '').match(/\d+/);
  const seq = numMatch ? parseInt(numMatch[0], 10) : 2;
  const clamped = Math.max(1, Math.min(33, seq));
  const found = ALL_33_BEATS_FUEL_DATA.find((b) => b.beatSeq === clamped);
  return (
    found ||
    ALL_33_BEATS_FUEL_DATA[1] // fallback to Beat 2
  );
}

/**
 * Computes fuel reimbursement allowance for any beat, customized working days or odometer KM
 * with exact 2-decimal paise precision (no Math.round truncation).
 */
export function calculateBeatFuelBill(
  beatNo: string,
  actualWorkingDays: number = STANDARD_MONTHLY_WORKING_DAYS,
  customDailyKm?: number
): {
  beatNumber: string;
  dailyKm: number;
  ratePerKm: number;
  dailyAllowance: number;
  workingDays: number;
  totalMonthlyAllowance: number;
  coverage: string;
} {
  const mapping = getBeatFuelMapping(beatNo);
  const km = customDailyKm && customDailyKm > 0 ? customDailyKm : mapping.sanctionedDailyKm;
  const daily = Number((km * mapping.fuelRatePerKm).toFixed(2));
  const total = Number((km * mapping.fuelRatePerKm * actualWorkingDays).toFixed(2));

  return {
    beatNumber: mapping.beatNumber,
    dailyKm: km,
    ratePerKm: mapping.fuelRatePerKm,
    dailyAllowance: daily,
    workingDays: actualWorkingDays,
    totalMonthlyAllowance: total,
    coverage: mapping.territorialCoverage,
  };
}
