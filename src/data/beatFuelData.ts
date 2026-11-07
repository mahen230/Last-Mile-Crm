/**
 * Dedicated Beat-Wise Fuel Bill Mapping Engine for Dadabari S.O. (324009) & Kota Delivery Jurisdiction
 * Covers all 33 beats with sanctioned daily route distances, departmental rate (₹6.50/KM),
 * territorial coverage, and monthly DSS fuel allowance calculations.
 */

import { CONSOLIDATED_BEAT_MATRIX } from './consolidatedBeatMatrix';
import { UPDATED_STAFF_LIST } from './updatedStaffData';

export interface BeatFuelMapping {
  beatNumber: string; // e.g. "Beat 1", "Beat 2", ... "Beat 33"
  beatSeq: number; // 1 to 33
  pincode: string;
  officeName: string;
  assignedStaffId: string;
  assignedStaffRole: string;
  assignedPostmanName: string;
  assignedPostmanContact: string;
  territorialCoverage: string;
  sanctionedDailyKm: number; // Daily route distance in KM
  fuelRatePerKm: number; // Departmental vehicle allowance rate (₹6.50/KM)
  dailyFuelAllowance: number; // sanctionedDailyKm * fuelRatePerKm
  monthlyWorkingDays: number; // Standard 24 working days per month
  monthlyFuelAllowance: number; // dailyFuelAllowance * monthlyWorkingDays
  terrainClassification: 'Urban High-Density' | 'Commercial Mixed' | 'Extended Residential' | 'Outskirts / Industrial';
  routeDescription: string;
}

export const DEPARTMENTAL_FUEL_RATE_PER_KM = 3.60; // Standard India Post two-wheeler rate (₹3.60/KM)
export const STANDARD_MONTHLY_WORKING_DAYS = 24;

/**
 * Sanctioned route distances in KM based on territory spread, road density, and field coverage for Beats 1–33.
 */
const SANCTIONED_BEAT_KM_TABLE: Record<number, { km: number; terrain: BeatFuelMapping['terrainClassification']; desc: string }> = {
  1: { km: 16, terrain: 'Urban High-Density', desc: 'Dadabari Extension, P&T Colony & Teachers Colony compact route' },
  2: { km: 18, terrain: 'Urban High-Density', desc: 'Keshavpura Sectors 6 & 7, Santoshi Nagar, TVS Circle & Market' },
  3: { km: 15, terrain: 'Urban High-Density', desc: 'Basant Vihar, CAD Colony, Modi College Road Colony' },
  4: { km: 20, terrain: 'Urban High-Density', desc: 'Keshavpura Vistar, Sectors 1-4, Chhoti Basti, Sabzi Mandi' },
  5: { km: 19, terrain: 'Commercial Mixed', desc: 'Mahaveer Nagar Vistar, Samrat Chowk, Central Park Corridor' },
  6: { km: 22, terrain: 'Urban High-Density', desc: 'Mahaveer Nagar 1st & 2nd, Ilahi Basti, Police Line Outer' },
  7: { km: 17, terrain: 'Urban High-Density', desc: 'Dadabari Sector 4 & 5, Vivekanand Nagar, Rotary Circle' },
  8: { km: 18, terrain: 'Commercial Mixed', desc: 'Dadabari Chhota Chauraha, Shastri Nagar, CAD Circle Belt' },
  9: { km: 21, terrain: 'Extended Residential', desc: 'Rangbari Road, Sector 1-2, City Mall Approach' },
  10: { km: 24, terrain: 'Extended Residential', desc: 'Rangbari Yojana, Balaji Nagar, New Coaching Extension' },
  11: { km: 19, terrain: 'Urban High-Density', desc: 'Shreenathpuram Sector A, B, C & Stadium Enclave' },
  12: { km: 20, terrain: 'Extended Residential', desc: 'RK Puram Sector A & B, Canal Perimeter' },
  13: { km: 16, terrain: 'Commercial Mixed', desc: 'Talwandi Sector A & B, Commerce Centre, Hospital Zone' },
  14: { km: 23, terrain: 'Commercial Mixed', desc: 'Jawahar Nagar Coaching Hub, City Park & Commercial Enclave' },
  15: { km: 22, terrain: 'Commercial Mixed', desc: 'Rajeev Gandhi Nagar, Electronic Complex, Hostels' },
  16: { km: 18, terrain: 'Urban High-Density', desc: 'Vigyan Nagar Sectors 1-3, Main Road Market' },
  17: { km: 28, terrain: 'Outskirts / Industrial', desc: 'Anantpura, Large Scale Industrial Area, NH-52 Link' },
  18: { km: 26, terrain: 'Outskirts / Industrial', desc: 'Raipura, Borkheda Outer, Transport Nagar Belt' },
  19: { km: 17, terrain: 'Urban High-Density', desc: 'Hanuman Basti, Shakti Nagar, Chouth Mata Mandir Zone' },
  20: { km: 19, terrain: 'Urban High-Density', desc: 'Pratap Nagar, Waqf Nagar, Gumanpura Boundary' },
  21: { km: 25, terrain: 'Extended Residential', desc: 'Prem Nagar, Gobriya Bawari, Rural Fringe Route' },
  22: { km: 21, terrain: 'Urban High-Density', desc: 'Shivpura, Dhabhai Ji Ka Kund, Old Ward Territory' },
  23: { km: 24, terrain: 'Outskirts / Industrial', desc: 'DCM Road, Shriram Nagar, Industrial Colony' },
  24: { km: 27, terrain: 'Outskirts / Industrial', desc: 'Instrumentation Ltd, Thermal Colony Gate, Chambal Link' },
  25: { km: 18, terrain: 'Urban High-Density', desc: 'Rangbari Vistar, Koli Basti, Ghati Marg' },
  26: { km: 22, terrain: 'Commercial Mixed', desc: 'Mahaveer Nagar 3rd, Landmark City Corridor' },
  27: { km: 19, terrain: 'Urban High-Density', desc: 'Keshavpura KH Series & UIT Scheme residential belt' },
  28: { km: 25, terrain: 'Extended Residential', desc: 'Santoshi Nagar Extension, Rawatbhata Bypass' },
  29: { km: 17, terrain: 'Commercial Mixed', desc: 'Talwandi Commerce Centre, Aerodrome Circle Road' },
  30: { km: 20, terrain: 'Extended Residential', desc: 'Shreenathpuram Extension, UIT Community Scheme' },
  31: { km: 29, terrain: 'Outskirts / Industrial', desc: 'Borkheda Bypass, Deoli Arab Rural Route' },
  32: { km: 30, terrain: 'Outskirts / Industrial', desc: 'Kunhari Perimeter, Bundi Road Junction, Chambal Link' },
  33: { km: 32, terrain: 'Outskirts / Industrial', desc: 'Nanta, Kota Barrage Riverside Zone & Heavy Forest Perimeter' },
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
    };

    const dailyFuel = Number((kmData.km * DEPARTMENTAL_FUEL_RATE_PER_KM).toFixed(2));
    const monthlyFuel = Math.round(dailyFuel * STANDARD_MONTHLY_WORKING_DAYS);

    return {
      beatNumber: beatKey,
      beatSeq: seq,
      pincode: beatMatrix?.pincode || '324009',
      officeName: beatMatrix?.officeName || 'Dadabari S.O.',
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
  const daily = Math.round(km * mapping.fuelRatePerKm);
  const total = daily * actualWorkingDays;

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
