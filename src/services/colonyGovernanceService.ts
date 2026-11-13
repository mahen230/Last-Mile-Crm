// src/services/colonyGovernanceService.ts
import { ColonyMasterRecord } from '../types/models';

let colonyIdSeq = 0;

/**
 * Generates a collision-proof unique Colony ID even under tight synchronous batch loops.
 */
export function generateUniqueColonyId(existingIds?: Set<string> | string[]): string {
  const used = existingIds instanceof Set ? existingIds : new Set(existingIds || []);
  let candidate = '';
  do {
    colonyIdSeq = (colonyIdSeq + 1) % 1679616;
    const ts = Date.now().toString(36).toUpperCase();
    const seq = colonyIdSeq.toString(36).toUpperCase().padStart(2, '0');
    const rand = Math.floor(Math.random() * 1296)
      .toString(36)
      .toUpperCase()
      .padStart(2, '0');
    candidate = `COL-${ts}-${seq}${rand}`;
  } while (used.has(candidate));
  used.add(candidate);
  return candidate;
}

/**
 * यूनीक कॉलोनी रजिस्ट्रेशन और डुप्लीकेट प्रिवेंशन इंजन (Strict Pincode Binding)
 * केवल MASTER_ADMIN या संबंधित पिनकोड का SPM ही कॉलोनी जोड़ या अपडेट कर सकता है।
 */
export function registerOrUpdateColonyWithGovernance(
  existingColonies: ColonyMasterRecord[],
  newColonyData: Omit<ColonyMasterRecord, 'id' | 'status' | 'createdAt'>,
  userRole: 'MASTER_ADMIN' | 'SPM' | 'POSTMAN' | 'CUSTOMER',
  userPincode: string
): { success: boolean; message: string; updatedColonies: ColonyMasterRecord[] } {
  // 1. सुरक्षा जाँच: केवल Master Admin या संबंधित पिनकोड का SPM ही मास्टर कॉलोनी प्रबंधित कर सकता है
  if (userRole !== 'MASTER_ADMIN' && userRole !== 'SPM') {
    return {
      success: false,
      message: 'ACCESS DENIED: Only Master Admin or authorized SPM can manage master colonies.',
      updatedColonies: existingColonies,
    };
  }

  const normalizeColonyKey = (val: string) => val.trim().replace(/\s+/g, ' ').toLowerCase();
  const normalizedName = normalizeColonyKey(newColonyData.colonyName);
  const normalizedPin = newColonyData.pincode.trim();

  // यदि SPM है, तो सुनिश्चित करें कि वह केवल अपने अधिकृत पिनकोड की कॉलोनी जोड़/संशोधित कर रहा है
  if (userRole === 'SPM' && normalizedPin !== userPincode.trim()) {
    return {
      success: false,
      message: `TERRITORY RESTRICTION: As Sub-Postmaster of PIN ${userPincode}, you cannot modify records for PIN ${newColonyData.pincode}. Only Master Admin or jurisdiction SPM can approve.`,
      updatedColonies: existingColonies,
    };
  }

  // 2. डुप्लीकेट प्रिवेंशन चेक (Colony Name + Pincode संयोजन)
  const existingIndex = existingColonies.findIndex(
    (c) =>
      normalizeColonyKey(c.colonyName) === normalizedName &&
      c.pincode.trim() === normalizedPin
  );

  const hasBeat = Boolean(
    newColonyData.assignedBeat &&
    newColonyData.assignedBeat.trim() !== '' &&
    newColonyData.assignedBeat !== 'PENDING_ASSIGNMENT'
  );
  const status: 'ACTIVE' | 'PENDING_BEAT_MAPPING' = hasBeat
    ? 'ACTIVE'
    : 'PENDING_BEAT_MAPPING';

  const lat = newColonyData.geoTag?.lat ?? 25.1432;
  const lng = newColonyData.geoTag?.lng ?? 75.8234;
  const googleMapsUrl =
    newColonyData.geoTag?.googleMapsUrl || `https://www.google.com/maps?q=${lat},${lng}`;
  const geoTagWithMap = {
    lat,
    lng,
    googleMapsUrl,
  };

  if (existingIndex > -1) {
    // अगर कॉलोनी उस पिनकोड पर पहले से है, तो उसके सब-सेक्टर्स व मैप लिंक को अपडेट (Upsert) करेंगे
    const updatedColonies = [...existingColonies];
    const prev = updatedColonies[existingIndex];
    const mergedSubSectors = Array.from(
      new Set([...(prev.subSectors || []), ...(newColonyData.subSectors || [])])
    );
    const mergedBlocks = Array.from(
      new Set([...(prev.blocks || []), ...(newColonyData.blocks || [])])
    );
    const mergedLandmarks = Array.from(
      new Set([...(prev.landmarks || []), ...(newColonyData.landmarks || [])])
    );

    updatedColonies[existingIndex] = {
      ...prev,
      ...newColonyData,
      entityType: newColonyData.entityType || prev.entityType || 'Residential Colony',
      subSectors: mergedSubSectors.length > 0 ? mergedSubSectors : prev.subSectors,
      blocks: mergedBlocks.length > 0 ? mergedBlocks : prev.blocks,
      landmarks: mergedLandmarks.length > 0 ? mergedLandmarks : prev.landmarks,
      houseNumberRange: newColonyData.houseNumberRange || prev.houseNumberRange,
      geoTag: geoTagWithMap,
      status: newColonyData.assignedBeat !== undefined ? status : prev.status,
      assignedBeat:
        newColonyData.assignedBeat !== undefined
          ? newColonyData.assignedBeat
          : prev.assignedBeat,
      id: prev.id, // पुरानी ID सुरक्षित रहेगी
      createdAt: prev.createdAt,
    };

    return {
      success: true,
      message: `Colony "${newColonyData.colonyName}" (PIN: ${newColonyData.pincode}) updated successfully with latest sectors & geo-tag.`,
      updatedColonies,
    };
  }

  // 3. नई यूनीक कॉलोनी मास्टर डेटा में जोड़ना
  const existingIdSet = new Set(existingColonies.map((c) => c.id));
  const newRecord: ColonyMasterRecord = {
    id: generateUniqueColonyId(existingIdSet),
    ...newColonyData,
    entityType: newColonyData.entityType || 'Residential Colony',
    colonyName: newColonyData.colonyName.trim(),
    geoTag: geoTagWithMap,
    assignedBeat: hasBeat ? newColonyData.assignedBeat : 'PENDING_ASSIGNMENT',
    status,
    createdAt: new Date().toISOString(),
  };

  return {
    success: true,
    message: `Colony "${newColonyData.colonyName}" successfully registered under ${newColonyData.postOfficeName} (${newColonyData.pincode}).`,
    updatedColonies: [newRecord, ...existingColonies],
  };
}

/**
 * कॉलोनी डिलीट करने का सुरक्षित फ़ंक्शन (Role & Territory Controlled)
 * केवल MASTER_ADMIN या संबंधित पिनकोड का SPM ही डिलीट कर सकता है
 */
export function deleteColonyMasterRecord(
  existingColonies: ColonyMasterRecord[],
  colonyId: string,
  userRole: 'MASTER_ADMIN' | 'SPM' | 'POSTMAN' | 'CUSTOMER',
  userPincode: string
): { success: boolean; message: string; updatedColonies: ColonyMasterRecord[] } {
  if (userRole !== 'MASTER_ADMIN' && userRole !== 'SPM') {
    return {
      success: false,
      message: 'ACCESS DENIED: Only Master Admin or authorized SPM can delete master colonies.',
      updatedColonies: existingColonies,
    };
  }

  const target = existingColonies.find((c) => c.id === colonyId);
  if (!target) {
    return {
      success: false,
      message: 'Colony record not found in master database.',
      updatedColonies: existingColonies,
    };
  }

  if (userRole === 'SPM' && target.pincode.trim() !== userPincode.trim()) {
    return {
      success: false,
      message: `TERRITORY RESTRICTION: As Sub-Postmaster of PIN ${userPincode}, you cannot delete records in PIN ${target.pincode}.`,
      updatedColonies: existingColonies,
    };
  }

  return {
    success: true,
    message: `Colony "${target.colonyName}" (PIN: ${target.pincode}) successfully deleted from master database.`,
    updatedColonies: existingColonies.filter((c) => c.id !== colonyId),
  };
}
