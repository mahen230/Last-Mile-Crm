/**
 * Dadabari S.O. Data Audit & Normalization Engine (Kota 324009 Jurisdiction)
 *
 * Mandates:
 * 1. Reversed & Structured Address Hierarchy: Colony -> Sector -> Block -> House No
 * 2. Regional PIN Code Mapping: 324009 (Dadabari SO), 324005 (Vigyan Nagar/Raipura), 324010 (Borkheda)
 * 3. Colony Duplicate & Fragmentation Merge: Consolidates fragmented spellings/casing into 25 official master colonies
 * 4. Sector 6 House 3 & 4 Common Shared Property Merge: Joint property owned by Dhanraj Bairwa
 */

import { Customer, Address } from '../types/models';
import { OFFICIAL_MAJOR_COLONIES } from '../data/colonyHierarchyData';

// Regional PIN Code Definitions
export const REGIONAL_PIN_CODES = {
  DADABARI_SO: '324009',
  VIGYAN_NAGAR_SO: '324005',
  BORKHEDA_SO: '324010',
  KOTA_HO_CENTRAL: '324001',
  KOTA_JN: '324002',
  GUMANPURA: '324007',
  KUNHARI: '324008',
} as const;

/**
 * Returns audited regional PIN code for a given colony and sub-area
 */
export function getAuditedPincodeForColony(colonyName: string, subArea?: string): string {
  const normCol = (colonyName || '').toLowerCase().trim();
  const normSub = (subArea || '').toLowerCase().trim();

  // 324010: Borkheda Regional S.O. & Baran Road Belt
  if (normCol.includes('borkheda') || normCol.includes('borkhedi') || normSub.includes('baran road') || normSub.includes('deoli arab')) {
    return REGIONAL_PIN_CODES.BORKHEDA_SO;
  }

  // 324005: Vigyan Nagar Regional S.O. / Industrial Area / Raipura Belt
  if (
    normCol.includes('vigyan') ||
    normCol.includes('raipura') ||
    normCol.includes('industrial') ||
    normSub.includes('electronic complex') ||
    normSub.includes('gobar gas')
  ) {
    return REGIONAL_PIN_CODES.VIGYAN_NAGAR_SO;
  }

  // 324009: Primary Dadabari S.O. Coverage Area
  return REGIONAL_PIN_CODES.DADABARI_SO;
}

/**
 * Normalizes freeform/fragmented colony names into the official clean master colony list
 */
export function normalizeAndCleanColony(rawColony: string): {
  colony: string;
  extractedSector?: string;
  extractedBlock?: string;
} {
  if (!rawColony) {
    return { colony: 'Keshavpura' };
  }

  const raw = rawColony.trim();
  const low = raw.toLowerCase();

  // 1. Check exact official match
  for (const official of OFFICIAL_MAJOR_COLONIES) {
    if (low === official.toLowerCase()) {
      return { colony: official };
    }
  }

  // 2. Dadabari Variants ("Dadabari Main", "Dadabari SO", "Dadabari Extension", "Dadabari Chauraha") -> Dadabari
  if (low.includes('dadabari')) {
    let extractedSector: string | undefined;
    if (low.includes('extension') || low.includes('ext')) extractedSector = 'Extension';
    else if (low.includes('sector 1') || low.includes('sec 1')) extractedSector = 'Sector 1';
    else if (low.includes('sector 2') || low.includes('sec 2')) extractedSector = 'Sector 2';
    else if (low.includes('sector 3') || low.includes('sec 3')) extractedSector = 'Sector 3';
    return { colony: 'Dadabari', extractedSector };
  }

  // 3. Keshavpura Variants ("Keshpura", "Keshav Pura", "Sector 6 Keshavpura", "Sector 7 Keshpura") -> Keshavpura
  if (low.includes('keshav') || low.includes('keshpura')) {
    let extractedSector: string | undefined;
    let extractedBlock: string | undefined;

    if (low.includes('sector 6') || low.includes('sec 6') || low.includes('sec-6')) {
      extractedSector = 'Sector 6';
    } else if (low.includes('sector 7') || low.includes('sec 7') || low.includes('sec-7')) {
      extractedSector = 'Sector 7';
    } else if (low.includes('sector 4') || low.includes('sec 4')) {
      extractedSector = 'Sector 4';
    } else if (low.includes('sector 1')) {
      extractedSector = 'Sector 1';
    } else if (low.includes('sector 2')) {
      extractedSector = 'Sector 2';
    } else if (low.includes('sector 3')) {
      extractedSector = 'Sector 3';
    } else if (low.includes('sector 5')) {
      extractedSector = 'Sector 5';
    } else if (low.includes('chhoti basti')) {
      extractedSector = 'Chhoti Basti';
    }

    if (low.includes('kh series') || low.includes('kh-') || low.includes(' kh ')) {
      extractedBlock = 'KH Series';
    } else if (low.includes('uit series') || low.includes('uit-') || low.includes(' uit ')) {
      extractedBlock = 'UIT Series';
    }

    return { colony: 'Keshavpura', extractedSector, extractedBlock };
  }

  // 4. Santoshi Nagar Variants
  if (low.includes('santoshi')) {
    let extractedBlock: string | undefined;
    if (low.includes('block a') || low.includes('phase 1')) extractedBlock = 'Block A';
    else if (low.includes('block b') || low.includes('phase 2')) extractedBlock = 'Block B';
    return { colony: 'Santoshi Nagar', extractedBlock };
  }

  // 5. Mahaveer Nagar Variants ("Mahavir Nagar", "Mahaveer Nagar Ext", "Mahaveer Nagar 1/2/3")
  if (low.includes('mahaveer') || low.includes('mahavir')) {
    let extractedSector: string | undefined;
    if (low.includes('ext 1') || low.includes('extension 1')) extractedSector = 'Extension 1';
    else if (low.includes('ext 2') || low.includes('extension 2')) extractedSector = 'Extension 2';
    else if (low.includes('sector 1') || low.includes('1st')) extractedSector = 'Sector 1';
    else if (low.includes('sector 2') || low.includes('2nd')) extractedSector = 'Sector 2';
    else if (low.includes('sector 3') || low.includes('3rd')) extractedSector = 'Sector 3';
    return { colony: 'Mahaveer Nagar', extractedSector };
  }

  // 6. Talwandi Variants
  if (low.includes('talwandi')) {
    let extractedSector: string | undefined;
    if (low.includes('sector a')) extractedSector = 'Sector A';
    else if (low.includes('sector b')) extractedSector = 'Sector B';
    return { colony: 'Talwandi', extractedSector };
  }

  // 7. Basant Vihar Variants ("Vasant Vihar")
  if (low.includes('basant') || low.includes('vasant')) {
    return { colony: 'Basant Vihar' };
  }

  // 8. Vigyan Nagar Variants
  if (low.includes('vigyan')) {
    let extractedSector: string | undefined;
    if (low.includes('sector a')) extractedSector = 'Sector A';
    else if (low.includes('sector b')) extractedSector = 'Sector B';
    else if (low.includes('sector c')) extractedSector = 'Sector C';
    else if (low.includes('sector d')) extractedSector = 'Sector D';
    return { colony: 'Vigyan Nagar', extractedSector };
  }

  // 9. Borkheda Variants ("Borkhedi")
  if (low.includes('borkheda') || low.includes('borkhedi')) {
    return { colony: 'Borkheda' };
  }

  // 10. Shreenathpuram Variants ("Srinathpuram")
  if (low.includes('shreenath') || low.includes('srinath')) {
    return { colony: 'Shreenathpuram' };
  }

  // 11. RK Puram Variants ("R.K. Puram", "RKPuram")
  if (low.includes('rk puram') || low.includes('r.k. puram') || low.includes('rkpuram')) {
    return { colony: 'RK Puram' };
  }

  // 12. Other official colonies
  if (low.includes('hanuman basti') || low.includes('basti hanuman')) return { colony: 'Hanuman Basti' };
  if (low.includes('hanuman nagar')) return { colony: 'Hanuman Nagar' };
  if (low.includes('jawahar')) return { colony: 'Jawahar Nagar' };
  if (low.includes('rangbari') || low.includes('rangbadi')) return { colony: 'Rangbari' };
  if (low.includes('vivekanand')) return { colony: 'Vivekanand Nagar' };
  if (low.includes('anantpura')) return { colony: 'Anantpura' };
  if (low.includes('rajeev gandhi') || low.includes('rajiv gandhi')) return { colony: 'Rajeev Gandhi Nagar' };
  if (low.includes('raipura')) return { colony: 'Raipura' };
  if (low.includes('ramchandra') || low.includes('ramchandrapura')) return { colony: 'Ramchandra Pura' };
  if (low.includes('shakti nagar') || low.includes('shakti')) return { colony: 'Shakti Nagar' };
  if (low.includes('shastri nagar') || low.includes('shastri')) return { colony: 'Shastri Nagar' };
  if (low.includes('pratap nagar') || low.includes('pratap')) return { colony: 'Pratap Nagar' };
  if (low.includes('waqf') || low.includes('vakf')) return { colony: 'Waqf Nagar' };
  if (low.includes('shivpura')) return { colony: 'Shivpura' };
  if (low.includes('prem nagar')) return { colony: 'Prem Nagar' };
  if (low.includes('patel')) return { colony: 'Patel Nagar' };
  if (low.includes('teachers') || low.includes('teacher')) return { colony: 'Teachers Colony' };
  if (low.includes('thermal')) return { colony: 'Thermal Colony' };
  if (low.includes('cad')) return { colony: 'CAD Colony' };

  return { colony: raw };
}

/**
 * Checks whether a given property/address matches Sector 6 House 3 or 4
 */
export function isSector6House3Or4(colony: string, sector: string, houseNo: string): boolean {
  const normCol = (colony || '').toLowerCase();
  const normSec = (sector || '').toLowerCase();
  const normH = (houseNo || '').toLowerCase().trim();

  const isSec6 =
    (normCol.includes('keshav') || normCol.includes('keshpura')) &&
    (normSec.includes('6') || normSec.includes('sector 6') || normH.includes('sector 6'));

  if (!isSec6) return false;

  // Check if house number corresponds to 3, 4, 3 & 4, 4-5
  const cleanH = normH.replace(/^(house\s*no\.?|h\.?\s*no\.?|house|plot)\s*/i, '').trim();
  return (
    cleanH === '3' ||
    cleanH === '4' ||
    cleanH === '3 & 4' ||
    cleanH === '3 and 4' ||
    cleanH === '3-4' ||
    cleanH === '4-5' ||
    cleanH === '4 & 5' ||
    cleanH.startsWith('3') && cleanH.includes('4')
  );
}

/**
 * Merged common shared property constant for Sector 6 House 3 & 4 owned by Dhanraj Bairwa
 */
export const SECTOR_6_MERGED_PROPERTY_DHANRAJ = {
  propertyCode: 'PROP-KP6-H003-004',
  housePlotNumber: 'House No. 3 & 4',
  houseNo: '3 & 4',
  colony: 'Keshavpura',
  sector: 'Sector 6',
  block: 'Sector 6',
  blockSector: 'Sector 6',
  pincode: '324009',
  beatNo: 'Beat 2',
  deliveryOffice: 'Dadabari S.O.',
  category: 'Residential' as const,
  subTypeTag: 'Residential Household' as const,
  occupancyStatus: 'Occupied' as const,
  landmark: 'Keshavpura Sector 6, near Government Secondary School road, Beat 2',
  ownerName: 'Dhanraj Bairwa',
  lastMileNote:
    'Sector 6 common shared joint property for House Numbers 3 & 4 owned and occupied by Dhanraj Bairwa. Both property plots linked to the same resident profile.',
  verificationStatus: 'Verified' as const,
};

/**
 * Comprehensive Data Audit & Normalization Runner for Customers
 * Audits all customer records:
 * 1. Enforces structured address fields: colony, sector, block, houseNo
 * 2. Assigns audited regional PIN codes: 324009, 324005, 324010
 * 3. Cleans and merges fragmented colony names
 * 4. Merges Sector 6 House 3 & 4 under Dhanraj Bairwa
 */
export function auditAndNormalizeCustomerRecords(customers: Customer[]): {
  auditedCustomers: Customer[];
  metrics: {
    totalScanned: number;
    coloniesCleaned: number;
    pincodesUpdated: number;
    sector6Merged: number;
    fieldsEnforced: number;
  };
} {
  let coloniesCleaned = 0;
  let pincodesUpdated = 0;
  let sector6Merged = 0;
  let fieldsEnforced = 0;

  const auditedCustomers = customers.map((c) => {
    const rawColony = c.colony || c.area || c.sectorLocality || c.address?.area || 'Keshavpura';
    const rawSector = c.sector || c.address?.sector || c.address?.sectorLocality || '';
    const rawBlock = c.block || c.address?.block || '';
    const rawHouse = (c.houseNo || c.address?.houseNumber || c.address?.houseNo || '').trim();

    // 1. Colony Normalization
    const cleanedColonyResult = normalizeAndCleanColony(rawColony);
    const colony = cleanedColonyResult.colony;
    if (colony !== rawColony) coloniesCleaned++;

    // 2. Sector & Block Resolution
    let sector = (c.sector || cleanedColonyResult.extractedSector || rawSector).trim();
    if (!sector || sector.toLowerCase() === 'n/a') sector = 'Sector 1';

    let block = (c.block || cleanedColonyResult.extractedBlock || rawBlock).trim();
    if (!block || block.toLowerCase() === 'n/a') block = sector;

    // 3. Regional PIN Code Resolution
    const auditedPincode = getAuditedPincodeForColony(colony, `${sector} ${block}`);
    if (c.pincode !== auditedPincode) pincodesUpdated++;

    // 4. Sector 6 House 3 & 4 Joint Property Check
    let houseNo = rawHouse;
    let remarks = c.remarks || '';
    let name = c.name;
    let isHead = c.isHeadOfFamily;

    if (isSector6House3Or4(colony, sector, rawHouse) || c.name.toLowerCase().includes('dhanraj bairwa')) {
      sector6Merged++;
      houseNo = '3 & 4';
      sector = 'Sector 6';
      block = 'Sector 6';
      if (c.name.toLowerCase().includes('dhanraj')) {
        name = 'Dhanraj Bairwa';
        isHead = true;
      }
      remarks = remarks
        ? `${remarks} | Linked to common shared property House No. 3 & 4 (Dhanraj Bairwa).`
        : 'Linked to common shared property House No. 3 & 4 (Dhanraj Bairwa).';
    }

    fieldsEnforced++;

    const updatedAddress: Address = {
      ...(c.address || {}),
      colony,
      sector,
      block,
      houseNo,
      houseNumber: houseNo,
      area: colony,
      sectorLocality: sector,
      pincode: auditedPincode,
      fullAddress: `${houseNo ? houseNo + ', ' : ''}${block && block !== sector ? block + ', ' : ''}${sector}, ${colony}, Dadabari S.O. - ${auditedPincode}`,
    };

    return {
      ...c,
      name,
      colony,
      area: colony,
      sector,
      block,
      houseNo,
      pincode: auditedPincode,
      isHeadOfFamily: isHead,
      address: updatedAddress,
      residentialAddress: updatedAddress,
      remarks,
    };
  });

  return {
    auditedCustomers,
    metrics: {
      totalScanned: customers.length,
      coloniesCleaned,
      pincodesUpdated,
      sector6Merged,
      fieldsEnforced,
    },
  };
}
