import {
  Customer,
  Lead,
  Property,
  PropertyRecord,
  StaffAttributionRecord,
  StaffProfile,
  ThreeLayerVerificationMetadata,
} from '../types/models';
import { CANONICAL_BACKUP_SYNC_EMAILS } from './dataConsolidationService';
import { customerService } from './customerService';
import { propertyRegistryService } from './propertyRegistryService';
import { staffPermissionService } from './staffPermissionService';
import { xpeedoOpsService } from './xpeedoOpsService';

export interface PropertyDuplicateMatch {
  id: string;
  code: string;
  title: string;
  address: string;
  colony: string;
  pincode: string;
  beatNo: string;
  officeId: string;
  status: string;
  source: 'PROPERTY_MASTER' | 'CUSTOMER_LEDGER';
  matchReason: string;
  residentNames?: string[];
  staffAttribution?: StaffAttributionRecord;
}

export interface PropertyDuplicateDetectionResult {
  hasMatch: boolean;
  matchReasons: string[];
  matches: PropertyDuplicateMatch[];
}

export interface CustomerDuplicateDetectionResult {
  hasMatch: boolean;
  matchReasons: string[];
  matches: Customer[];
}

export interface ThreeLayerCommitResult<T> {
  success: boolean;
  failedLayer?: 1 | 2 | 3;
  error?: string;
  data?: T;
  linkedProperty?: PropertyRecord;
  linkedLead?: Lead;
  duplicateCheck?: PropertyDuplicateDetectionResult | CustomerDuplicateDetectionResult;
  verificationMeta?: ThreeLayerVerificationMetadata;
  staffAttribution?: StaffAttributionRecord;
}

function normStr(val: string | undefined | null): string {
  return String(val || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function normBeatNum(beat: string | undefined | null): string {
  return String(beat || '')
    .toLowerCase()
    .replace(/^beat\s*/i, '')
    .trim();
}

function normMobile10(val: string | undefined | null): string {
  const digits = String(val || '').replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function parseGeoCoords(input: {
  latitude?: number;
  longitude?: number;
  geoOrTraceTag?: string;
}): { lat: number; lng: number } | null {
  if (
    typeof input.latitude === 'number' &&
    typeof input.longitude === 'number' &&
    !Number.isNaN(input.latitude) &&
    !Number.isNaN(input.longitude) &&
    (input.latitude !== 0 || input.longitude !== 0)
  ) {
    return { lat: input.latitude, lng: input.longitude };
  }
  if (input.geoOrTraceTag) {
    const nums = input.geoOrTraceTag.match(/-?\d+\.\d+/g);
    if (nums && nums.length >= 2) {
      const lat = parseFloat(nums[0]);
      const lng = parseFloat(nums[1]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return { lat, lng };
      }
    }
  }
  return null;
}

class CommonDataCentreService {
  /**
   * Resolve full StaffProfile by ID, Employee ID, Email, or Contact.
   */
  public resolveStaffFullProfile(staffIdOrEmail?: string | null): StaffProfile | null {
    const active = staffPermissionService.getActiveSession();
    if (!staffIdOrEmail) return active;
    const found = staffPermissionService.findStaffProfileByIdentifier(staffIdOrEmail);
    if (found) return found;
    if (
      active &&
      (active.id === staffIdOrEmail ||
        active.employeeId === staffIdOrEmail ||
        active.email.toLowerCase() === staffIdOrEmail.toLowerCase())
    ) {
      return active;
    }
    return null;
  }

  /**
   * Build complete immutable Staff Attribution stamp for every Property & Customer save.
   */
  public buildStaffAttribution(userProfile?: StaffProfile | null): StaffAttributionRecord {
    const active = userProfile || staffPermissionService.getActiveSession();
    const resolved =
      (active?.employeeId && staffPermissionService.findStaffProfileByIdentifier(active.employeeId)) ||
      (active?.email && staffPermissionService.findStaffProfileByIdentifier(active.email)) ||
      (active?.id && staffPermissionService.findStaffProfileByIdentifier(active.id)) ||
      active;

    const canonicalId = resolved?.employeeId || resolved?.id || 'SYSTEM-ADMIN';
    return {
      staffId: resolved?.id || canonicalId,
      employeeId: resolved?.employeeId || canonicalId,
      staffName: resolved?.name || 'System Operator',
      role: resolved?.role || 'STAFF',
      officialPost: resolved?.officialPost || resolved?.designation || resolved?.role || 'Postal Staff',
      officeName: resolved?.assignedOffice || resolved?.subOffice || 'Dadabari S.O.',
      officeId: resolved?.officeId || 'DADABARI_SO',
      pincode: resolved?.officePincode || '324009',
      beat: resolved?.beat || 'Beat 2',
      contact: resolved?.contact || '',
      email: resolved?.email || '',
      profilePath: `/india-post?tab=STAFF_ROLES&staffId=${encodeURIComponent(canonicalId)}`,
      recordedAt: new Date().toISOString(),
    };
  }

  /**
   * Search Console Duplicate / Already-Exist Detection for Properties
   * Matches on: sequence/property code, normalized address (houseNo + colony + PIN),
   * beat/PIN/house, and geo-coordinates proximity.
   */
  public detectPropertyDuplicates(input: {
    excludeId?: string;
    propertyCode?: string;
    sequenceTag?: string;
    houseNo?: string;
    colony?: string;
    area?: string;
    sector?: string;
    address?: string;
    pincode?: string;
    officeId?: string;
    beatNo?: string;
    latitude?: number;
    longitude?: number;
    geoOrTraceTag?: string;
  }): PropertyDuplicateDetectionResult {
    const matches: PropertyDuplicateMatch[] = [];
    const seenIds = new Set<string>();
    const reasonSet = new Set<string>();

    const inCode = normStr(input.propertyCode || input.sequenceTag);
    const inHouse = normStr(input.houseNo);
    const inColony = normStr(input.colony || input.area);
    const inAddr = normStr(input.address);
    const inPin = (input.pincode || '').trim();
    const inBeat = normBeatNum(input.beatNo);
    const inCoords = parseGeoCoords(input);

    const isSameRecord = (candidateId: string, candidateCode?: string) => {
      if (!input.excludeId) return false;
      return candidateId === input.excludeId || candidateCode === input.excludeId;
    };

    // 1. Check Properties Master Registry (propertyRegistryService)
    propertyRegistryService.getAllProperties().forEach((rec) => {
      if (isSameRecord(rec.id, rec.propertyCode)) return;

      const reasons: string[] = [];
      const recCode = normStr(rec.propertyCode);
      const recSeq = normStr(rec.sequenceTag);
      const recAddr = normStr(rec.addressLine);
      const recHouse = normStr(rec.houseNo);
      const recColony = normStr(rec.colony);
      const recPin = (rec.pincode || rec.beatOrPin || '').trim();
      const recBeat = normBeatNum(rec.beatNo);
      const recCoords = parseGeoCoords({ geoOrTraceTag: rec.geoOrTraceTag });

      if (inCode && (recCode === inCode || (recSeq && recSeq === inCode))) {
        reasons.push('Sequence / Property Code match');
      }
      if (inAddr && inAddr.length >= 6 && recAddr && (recAddr === inAddr || recAddr.includes(inAddr) || inAddr.includes(recAddr))) {
        reasons.push('Address text match');
      }
      if (inHouse && inColony && recHouse === inHouse && (recColony.includes(inColony) || inColony.includes(recColony))) {
        if (!inPin || !recPin || inPin === recPin) {
          reasons.push('House No + Colony + PIN match');
        }
      }
      if (inHouse && inBeat && recBeat === inBeat && recAddr.includes(inHouse) && (!inPin || !recPin || recPin === inPin)) {
        reasons.push('Beat + House + PIN match');
      }
      if (inCoords && recCoords) {
        const dLat = Math.abs(inCoords.lat - recCoords.lat);
        const dLng = Math.abs(inCoords.lng - recCoords.lng);
        if (dLat <= 0.00025 && dLng <= 0.00025) {
          reasons.push('Geo-coordinates match');
        }
      }

      if (reasons.length > 0 && !seenIds.has(rec.id)) {
        seenIds.add(rec.id);
        reasons.forEach((r) => reasonSet.add(r));
        matches.push({
          id: rec.id,
          code: rec.propertyCode,
          title: rec.houseNo ? `House ${rec.houseNo}` : rec.propertyCode,
          address: rec.addressLine,
          colony: rec.colony || rec.landmark || '',
          pincode: recPin || '324009',
          beatNo: rec.beatNo || 'Beat 2',
          officeId: rec.officeId || 'DADABARI_SO',
          status: rec.occupancyStatus,
          source: 'PROPERTY_MASTER',
          matchReason: reasons.join(' · '),
          staffAttribution: rec.staffAttribution,
        });
      }
    });

    // 2. Check Customer & Property Ledger (customerService.getProperties)
    customerService.getProperties().forEach((prop) => {
      if (isSameRecord(prop.id, prop.propertyCode)) return;

      const reasons: string[] = [];
      const pCode = normStr(prop.propertyCode || prop.id);
      const pSeq = normStr(prop.sequenceTag);
      const pHouse = normStr(prop.housePlotNumber || prop.houseNo);
      const pColony = normStr(prop.colony || prop.area);
      const pAddr = normStr(typeof prop.address === 'string' ? prop.address : '');
      const pPin = (prop.pincode || '').trim();
      const pBeat = normBeatNum(prop.beatNo);
      const pCoords = parseGeoCoords({ latitude: prop.latitude, longitude: prop.longitude });

      if (inCode && (pCode === inCode || (pSeq && pSeq === inCode))) {
        reasons.push('Sequence / Property Code match');
      }
      if (inHouse && inColony && pHouse === inHouse && (pColony.includes(inColony) || inColony.includes(pColony))) {
        if (!inPin || !pPin || inPin === pPin) {
          reasons.push('House No + Colony + PIN match');
        }
      }
      if (inAddr && inAddr.length >= 6 && pAddr && (pAddr === inAddr || pAddr.includes(inAddr) || inAddr.includes(pAddr))) {
        reasons.push('Address match');
      }
      if (inHouse && inBeat && pBeat === inBeat && pHouse === inHouse && (!inPin || !pPin || pPin === inPin)) {
        reasons.push('Beat + House + PIN match');
      }
      if (inCoords && pCoords) {
        const dLat = Math.abs(inCoords.lat - pCoords.lat);
        const dLng = Math.abs(inCoords.lng - pCoords.lng);
        if (dLat <= 0.00025 && dLng <= 0.00025) {
          reasons.push('Geo-coordinates match');
        }
      }

      if (reasons.length > 0 && !seenIds.has(prop.id)) {
        seenIds.add(prop.id);
        reasons.forEach((r) => reasonSet.add(r));
        matches.push({
          id: prop.id,
          code: prop.propertyCode || prop.id,
          title: prop.housePlotNumber ? `House/Plot ${prop.housePlotNumber}` : prop.id,
          address: typeof prop.address === 'string' ? prop.address : `${prop.housePlotNumber || ''}, ${prop.colony || prop.area || ''}`,
          colony: prop.colony || prop.area || '',
          pincode: pPin || '324009',
          beatNo: prop.beatNo ? `Beat ${normBeatNum(prop.beatNo)}` : 'Beat 2',
          officeId: prop.officeId || 'DADABARI_SO',
          status: prop.status,
          source: 'CUSTOMER_LEDGER',
          matchReason: reasons.join(' · '),
          residentNames: prop.residentNames,
          staffAttribution: prop.staffAttribution,
        });
      }
    });

    return {
      hasMatch: matches.length > 0,
      matchReasons: Array.from(reasonSet),
      matches,
    };
  }

  /**
   * Search Console Duplicate / Already-Exist Detection for Customers / Citizens
   * Matches on: 10-digit mobile, ledger/masterId, or Name + Address/PropertyId.
   */
  public detectCustomerDuplicates(input: {
    excludeId?: string;
    masterId?: string;
    ledgerRef?: string;
    mobile?: string;
    name?: string;
    houseNo?: string;
    colony?: string;
    address?: string;
    propertyId?: string;
  }): CustomerDuplicateDetectionResult {
    const customers = customerService.getCustomers();
    const inMob = normMobile10(input.mobile);
    const inName = normStr(input.name);
    const inHouse = normStr(input.houseNo);
    const inColony = normStr(input.colony);
    const inProp = normStr(input.propertyId);
    const inRef = normStr(input.masterId || input.ledgerRef);

    const matches: Customer[] = [];
    const reasonSet = new Set<string>();

    customers.forEach((c) => {
      if (input.excludeId && (c.id === input.excludeId || c.masterId === input.excludeId)) {
        return;
      }

      const cMob = normMobile10(c.mobile);
      const cName = normStr(c.name);
      const cHouse = normStr(c.houseNo || c.address?.houseNumber);
      const cColony = normStr(c.colony || c.area);
      const cProp = normStr(c.propertyId);
      const cRef = normStr(c.masterId || c.id);

      let matched = false;
      if (inMob.length === 10 && cMob === inMob) {
        matched = true;
        reasonSet.add('10-digit mobile number match');
      }
      if (inRef && cRef === inRef) {
        matched = true;
        reasonSet.add('Master / Ledger ID match');
      }
      if (inName.length >= 3 && cName === inName) {
        if (inProp && cProp === inProp) {
          matched = true;
          reasonSet.add('Name + Property ID match');
        } else if (inHouse && inColony && cHouse === inHouse && (cColony.includes(inColony) || inColony.includes(cColony))) {
          matched = true;
          reasonSet.add('Name + House/Colony match');
        }
      }

      if (matched) {
        matches.push(c);
      }
    });

    return {
      hasMatch: matches.length > 0,
      matchReasons: Array.from(reasonSet),
      matches,
    };
  }

  /**
   * Three-Layer Verification System for Property Entries & Updates -> Final Master Store
   */
  public verifyAndCommitProperty(
    userProfile: StaffProfile | null | undefined,
    input: {
      id?: string;
      propertyCode?: string;
      sequenceTag?: string;
      houseNo: string;
      colony: string;
      sector?: string;
      pincode: string;
      beatNo: string;
      officeId?: string;
      propertyType: 'House' | 'Commercial' | 'Mixed' | 'Flat / Residency' | 'Flat' | 'Shop' | 'Office';
      status: 'Occupied' | 'Vacant' | 'Commercial' | 'Mixed' | 'Rented' | 'Address Left';
      addressLine?: string;
      landmark?: string;
      latitude?: number;
      longitude?: number;
      geoOrTraceTag?: string;
      residentOrOwnerName?: string;
      mobile?: string;
      verificationStatus?: boolean;
      notes?: string;
      brandId?: string;
      brandName?: string;
      clientId?: string;
    },
    options?: {
      remark?: string;
      isIntentionalEdit?: boolean;
      allowDuplicateMerge?: boolean;
    }
  ): ThreeLayerCommitResult<Property> {
    const remark = (options?.remark || input.notes || '').trim();
    const cleanHouse = (input.houseNo || '').trim();
    const cleanColony = (input.colony || '').trim();
    const cleanPin = (input.pincode || '').trim();
    const cleanBeat = (input.beatNo || userProfile?.beat || 'Beat 2').trim();
    const cleanSector = (input.sector || 'Sector 1').trim();
    const fullAddress =
      (input.addressLine || '').trim() ||
      `${cleanHouse ? `${cleanHouse}, ` : ''}${cleanSector}, ${cleanColony}, Kota - ${cleanPin || '324009'}`;

    // -------------------------------------------------------------------------
    // LAYER 1: Schema, Format & Search Console Duplicate / Remark Gate
    // -------------------------------------------------------------------------
    if (!cleanHouse && input.status !== 'Vacant') {
      return {
        success: false,
        failedLayer: 1,
        error: 'Layer 1 Validation Failed: House / Plot No. is required for non-vacant properties.',
      };
    }
    if (!cleanColony) {
      return {
        success: false,
        failedLayer: 1,
        error: 'Layer 1 Validation Failed: Colony / Locality is required.',
      };
    }
    if (!/^\d{6}$/.test(cleanPin)) {
      return {
        success: false,
        failedLayer: 1,
        error: 'Layer 1 Validation Failed: PIN Code must be a valid 6-digit Indian postal code.',
      };
    }
    if (input.mobile && input.mobile.replace(/\D/g, '').length > 0 && normMobile10(input.mobile).length !== 10) {
      return {
        success: false,
        failedLayer: 1,
        error: 'Layer 1 Validation Failed: Contact mobile must be 10 digits when supplied.',
      };
    }

    const dupCheck = this.detectPropertyDuplicates({
      excludeId: options?.isIntentionalEdit ? (input.id || input.propertyCode) : undefined,
      propertyCode: input.propertyCode,
      sequenceTag: input.sequenceTag,
      houseNo: cleanHouse,
      colony: cleanColony,
      sector: cleanSector,
      address: fullAddress,
      pincode: cleanPin,
      officeId: input.officeId,
      beatNo: cleanBeat,
      latitude: input.latitude,
      longitude: input.longitude,
      geoOrTraceTag: input.geoOrTraceTag,
    });

    if ((dupCheck.hasMatch || options?.isIntentionalEdit) && !remark) {
      return {
        success: false,
        failedLayer: 1,
        duplicateCheck: dupCheck,
        error: dupCheck.hasMatch
          ? 'Layer 1 Gate Blocked: Already Exists / Duplicate Match detected in Search Console. Enter a Remark explaining this update or re-entry.'
          : 'Layer 1 Gate Blocked: A Remark is required when updating an existing property record.',
      };
    }

    // -------------------------------------------------------------------------
    // LAYER 2: Staff, Role & Territory/Beat Scope Gate
    // -------------------------------------------------------------------------
    const activeProfile = userProfile || staffPermissionService.getActiveSession();
    if (!activeProfile) {
      return {
        success: false,
        failedLayer: 2,
        duplicateCheck: dupCheck,
        error: 'Layer 2 Auth Blocked: Active authenticated staff session is required.',
      };
    }
    if (activeProfile.status === 'Inactive') {
      return {
        success: false,
        failedLayer: 2,
        duplicateCheck: dupCheck,
        error: 'Layer 2 Auth Blocked: Inactive staff account cannot commit property records.',
      };
    }

    const territoryCheck = staffPermissionService.isTerritoryAllowedForProperty(activeProfile, {
      beatNo: cleanBeat,
      pincode: cleanPin,
      colony: cleanColony,
    });
    if (!territoryCheck.allowed) {
      return {
        success: false,
        failedLayer: 2,
        duplicateCheck: dupCheck,
        error: `Layer 2 Territory Blocked: ${territoryCheck.reason || 'Out-of-territory property entry.'}`,
      };
    }

    // -------------------------------------------------------------------------
    // LAYER 3: Master Sync, Staff Attribution & Final Master Store Commit
    // -------------------------------------------------------------------------
    const staffAttribution = this.buildStaffAttribution(activeProfile);
    const verificationMeta: ThreeLayerVerificationMetadata = {
      layer1Passed: true,
      layer1Details: dupCheck.hasMatch
        ? `Duplicate/Existing match acknowledged (${dupCheck.matchReasons.join(', ')}) with mandatory remark.`
        : 'Schema, 6-digit PIN & Search Console uniqueness verified.',
      layer2Passed: true,
      layer2Details: `Staff ${staffAttribution.staffName} (${staffAttribution.employeeId}) authorized for ${cleanBeat} / PIN ${cleanPin}.`,
      layer3Passed: true,
      layer3Details: `Cross-synced across Properties Master Registry, Customer Ledger & Backup Mirrors (${CANONICAL_BACKUP_SYNC_EMAILS.join(', ')}).`,
      verifiedAt: new Date().toISOString(),
      duplicateMatchDetected: dupCheck.hasMatch,
      duplicateRemark: remark || undefined,
      matchedRecordIds: dupCheck.matches.map((m) => m.id),
    };

    const beatDigits = normBeatNum(cleanBeat) || '2';
    const propCode =
      (input.propertyCode || '').trim() ||
      (dupCheck.hasMatch && options?.allowDuplicateMerge !== false ? dupCheck.matches[0]?.code : '') ||
      `PROP-${cleanSector.replace(/\s+/g, '')}-${cleanHouse.replace(/\s+/g, '') || 'UNNUMBERED'}`.toUpperCase();
    const resolvedId = input.id || propCode;

    const registryType: PropertyRecord['propertyType'] =
      input.propertyType === 'Commercial' || input.propertyType === 'Shop' || input.propertyType === 'Office'
        ? 'Commercial'
        : input.propertyType === 'Mixed'
        ? 'Mixed'
        : input.propertyType === 'Flat' || input.propertyType === 'Flat / Residency'
        ? 'Flat'
        : 'Residential';

    const registryOccupancy: string =
      input.status === 'Vacant'
        ? 'Vacant'
        : input.status === 'Rented'
        ? 'Rented / Tenant'
        : input.status === 'Mixed'
        ? 'Mixed Use'
        : 'Owner Occupied';

    const linkedPropRecord = propertyRegistryService.upsertProperty({
      id: resolvedId,
      propertyCode: propCode,
      clientId: input.clientId || 'CLIENT-INDIA-POST-KOTA',
      brandId: input.brandId || activeProfile.brandId || 'india-post',
      brandName: input.brandName || activeProfile.brandName || 'India Post',
      propertyType: registryType,
      beatOrPin: cleanPin,
      officeId: input.officeId || activeProfile.officeId || 'DADABARI_SO',
      addressLine: fullAddress,
      landmark: input.landmark || '',
      geoOrTraceTag:
        input.geoOrTraceTag ||
        (input.latitude && input.longitude ? `${input.latitude.toFixed(4)}° N, ${input.longitude.toFixed(4)}° E` : undefined),
      occupancyStatus: registryOccupancy,
      linkedUnitNotes: remark || input.notes || '',
      sequenceTag: input.sequenceTag,
      houseNo: cleanHouse,
      colony: cleanColony,
      sector: cleanSector,
      beatNo: `Beat ${beatDigits}`,
      pincode: cleanPin,
      remark,
      submittedByStaffId: staffAttribution.employeeId || staffAttribution.staffId,
      staffAttribution,
      verificationMeta,
    });

    const ledgerProperty: Property = {
      id: resolvedId,
      propertyCode: propCode,
      housePlotNumber: cleanHouse,
      houseNo: cleanHouse,
      propertyType:
        input.propertyType === 'Commercial' || input.propertyType === 'Mixed' || input.propertyType === 'Flat' || input.propertyType === 'Flat / Residency' || input.propertyType === 'House' || input.propertyType === 'Shop' || input.propertyType === 'Office'
          ? input.propertyType
          : 'House',
      address: fullAddress,
      sector: cleanSector,
      colony: cleanColony,
      area: cleanColony,
      pincode: cleanPin,
      beatNo: beatDigits,
      officeId: input.officeId || activeProfile.officeId || 'DADABARI_SO',
      status: input.status,
      landmark: input.landmark,
      latitude: input.latitude,
      longitude: input.longitude,
      sequenceTag: input.sequenceTag,
      remark,
      notes: remark || input.notes,
      addressRemarks: remark || input.notes,
      verificationStatus: input.verificationStatus ?? true,
      residentNames: input.residentOrOwnerName?.trim() ? [input.residentOrOwnerName.trim()] : undefined,
      submittedByStaffId: staffAttribution.employeeId || staffAttribution.staffId,
      staffAttribution,
      verificationMeta,
    };

    customerService.updateProperty(ledgerProperty);

    if (input.residentOrOwnerName && input.residentOrOwnerName.trim()) {
      customerService.addOrUpdateCustomer(
        {
          name: input.residentOrOwnerName.trim(),
          mobile: normMobile10(input.mobile),
          houseNo: cleanHouse,
          colony: cleanColony,
          area: cleanColony,
          sector: cleanSector,
          pincode: cleanPin,
          beatNo: `Beat ${beatDigits}`,
          officeId: input.officeId || activeProfile.officeId || 'DADABARI_SO',
          propertyId: propCode,
          livingStatus: input.status === 'Vacant' ? 'Vacant' : 'Owner',
          type: registryType === 'Commercial' ? 'Commercial' : 'Residential',
          remarks: remark,
          enteredBy: activeProfile.email,
          enteredByName: activeProfile.name,
          assignedStaffId: activeProfile.id,
          assignedStaffName: activeProfile.name,
          assignedStaffEmail: activeProfile.email,
          submittedByStaffId: staffAttribution.employeeId || staffAttribution.staffId,
          staffAttribution,
          verificationMeta,
          brandId: input.brandId || activeProfile.brandId || 'india-post',
          brandName: input.brandName || activeProfile.brandName || 'India Post',
        },
        'Common Data Centre Property Sync'
      );
    }

    xpeedoOpsService.logExternalActivity({
      actor: staffAttribution.staffName,
      actorRole: xpeedoOpsService.resolvePlatformRole(activeProfile),
      workspaceId: (input.brandId || activeProfile.brandId || 'india-post').toLowerCase() === 'india-post' ? 'INDIA_POST' : (input.brandId || 'INDIA_POST').toUpperCase(),
      entityType: 'Property',
      entityId: propCode,
      action: dupCheck.hasMatch || options?.isIntentionalEdit ? 'THREE_LAYER_PROPERTY_UPDATE' : 'THREE_LAYER_PROPERTY_CREATE',
      summary: `3-Layer Verified Property ${propCode} (${cleanColony}, Beat ${beatDigits}, PIN ${cleanPin}) by ${staffAttribution.staffName} [${staffAttribution.employeeId}]${remark ? ` · Remark: ${remark}` : ''}`,
    });

    return {
      success: true,
      data: ledgerProperty,
      linkedProperty: linkedPropRecord,
      duplicateCheck: dupCheck,
      verificationMeta,
      staffAttribution,
    };
  }

  /**
   * Three-Layer Verification System for Customer / Citizen / Lead Entries -> Final Master Store
   */
  public verifyAndCommitCustomer(
    userProfile: StaffProfile | null | undefined,
    customerInput: Partial<Customer>,
    options?: {
      remark?: string;
      isIntentionalEdit?: boolean;
      source?: string;
      leadData?: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>;
    }
  ): ThreeLayerCommitResult<Customer> {
    const cleanName = (customerInput.name || '').trim();
    const cleanMob = normMobile10(customerInput.mobile);
    const cleanPin = (customerInput.pincode || customerInput.address?.pincode || '324009').trim();
    const cleanColony = (customerInput.colony || customerInput.area || customerInput.address?.colony || '').trim();
    const cleanHouse = (customerInput.houseNo || customerInput.address?.houseNo || customerInput.address?.houseNumber || '').trim();
    const cleanBeat = (customerInput.beatNo || userProfile?.beat || 'Beat 2').trim();
    const remark = (options?.remark || customerInput.remarks || '').trim();

    // -------------------------------------------------------------------------
    // LAYER 1: Schema, Format & Search Console Duplicate / Remark Gate
    // -------------------------------------------------------------------------
    if (cleanName.length < 2) {
      return {
        success: false,
        failedLayer: 1,
        error: 'Layer 1 Validation Failed: Customer full name (min 2 chars) is required.',
      };
    }
    if (customerInput.mobile && cleanMob.length !== 10) {
      return {
        success: false,
        failedLayer: 1,
        error: 'Layer 1 Validation Failed: Mobile number must be exactly 10 digits.',
      };
    }
    if (cleanPin && !/^\d{6}$/.test(cleanPin)) {
      return {
        success: false,
        failedLayer: 1,
        error: 'Layer 1 Validation Failed: PIN Code must be 6 digits.',
      };
    }

    const dupCheck = this.detectCustomerDuplicates({
      excludeId: options?.isIntentionalEdit ? (customerInput.id || customerInput.masterId) : undefined,
      masterId: customerInput.masterId,
      mobile: cleanMob,
      name: cleanName,
      houseNo: cleanHouse,
      colony: cleanColony,
      propertyId: customerInput.propertyId,
    });

    if (dupCheck.hasMatch && !remark) {
      return {
        success: false,
        failedLayer: 1,
        duplicateCheck: dupCheck,
        error: 'Layer 1 Gate Blocked: Already Exists / Duplicate Match found in Search Console. Please record a Remark explaining this update or context before committing.',
      };
    }

    // -------------------------------------------------------------------------
    // LAYER 2: Staff, Role & Territory/Beat Scope Gate
    // -------------------------------------------------------------------------
    const activeProfile = userProfile || staffPermissionService.getActiveSession();
    if (!activeProfile) {
      return {
        success: false,
        failedLayer: 2,
        duplicateCheck: dupCheck,
        error: 'Layer 2 Auth Blocked: Active authenticated staff session is required.',
      };
    }
    if (activeProfile.status === 'Inactive') {
      return {
        success: false,
        failedLayer: 2,
        duplicateCheck: dupCheck,
        error: 'Layer 2 Auth Blocked: Inactive staff account cannot commit customer records.',
      };
    }

    const canWrite = options?.isIntentionalEdit
      ? activeProfile.permissions?.canEditCustomer !== false
      : activeProfile.permissions?.canCreateCustomer !== false;
    if (!canWrite && !staffPermissionService.isSuperAdmin(activeProfile)) {
      return {
        success: false,
        failedLayer: 2,
        duplicateCheck: dupCheck,
        error: 'Layer 2 RBAC Blocked: Current role does not have permission to create or modify customer records.',
      };
    }

    if (cleanPin || cleanBeat) {
      const territoryCheck = staffPermissionService.isTerritoryAllowedForProperty(activeProfile, {
        beatNo: cleanBeat,
        pincode: cleanPin,
        colony: cleanColony,
      });
      if (!territoryCheck.allowed) {
        return {
          success: false,
          failedLayer: 2,
          duplicateCheck: dupCheck,
          error: `Layer 2 Territory Blocked: ${territoryCheck.reason || 'Out-of-territory entry.'}`,
        };
      }
    }

    // -------------------------------------------------------------------------
    // LAYER 3: Master Sync, Staff Attribution & Final Master Store Commit
    // -------------------------------------------------------------------------
    const staffAttribution = this.buildStaffAttribution(activeProfile);
    const verificationMeta: ThreeLayerVerificationMetadata = {
      layer1Passed: true,
      layer1Details: dupCheck.hasMatch
        ? `Duplicate/Existing match verified (${dupCheck.matchReasons.join(', ')}) with mandatory remark.`
        : 'Customer schema, 10-digit mobile, 6-digit PIN & Search Console check passed.',
      layer2Passed: true,
      layer2Details: `Staff ${staffAttribution.staffName} (${staffAttribution.employeeId}) verified for ${cleanBeat}.`,
      layer3Passed: true,
      layer3Details: `Synced to Customers Master Registry, Linked Property Hub & Backup Sync (${CANONICAL_BACKUP_SYNC_EMAILS.join(', ')}).`,
      verifiedAt: new Date().toISOString(),
      duplicateMatchDetected: dupCheck.hasMatch,
      duplicateRemark: remark || undefined,
      matchedRecordIds: dupCheck.matches.map((m) => m.id),
    };

    const enrichedPayload: Partial<Customer> = {
      ...customerInput,
      name: cleanName,
      mobile: cleanMob || customerInput.mobile || '',
      pincode: cleanPin || '324009',
      beatNo: cleanBeat,
      remarks: remark || customerInput.remarks,
      enteredBy: customerInput.enteredBy || activeProfile.email,
      enteredByName: customerInput.enteredByName || activeProfile.name,
      assignedStaffId: customerInput.assignedStaffId || activeProfile.id,
      assignedStaffName: customerInput.assignedStaffName || activeProfile.name,
      assignedStaffEmail: customerInput.assignedStaffEmail || activeProfile.email,
      submittedByStaffId: staffAttribution.employeeId || staffAttribution.staffId,
      staffAttribution,
      verificationMeta,
      brandId: customerInput.brandId || activeProfile.brandId || 'india-post',
      brandName: customerInput.brandName || activeProfile.brandName || 'India Post',
    };

    const custResult = customerService.addOrUpdateCustomer(
      enrichedPayload,
      options?.source || 'Common Data Centre Sync'
    );

    let linkedProperty: PropertyRecord | undefined;
    if (cleanHouse && cleanColony) {
      const propCode =
        custResult.customer.propertyId ||
        `PROP-${(custResult.customer.sector || 'Sector1').replace(/\s+/g, '')}-${cleanHouse.replace(/\s+/g, '')}`.toUpperCase();
      linkedProperty = propertyRegistryService.upsertProperty({
        id: propCode,
        propertyCode: propCode,
        clientId: 'CLIENT-INDIA-POST-KOTA',
        brandId: enrichedPayload.brandId,
        brandName: enrichedPayload.brandName,
        propertyType: custResult.customer.type === 'Commercial' ? 'Commercial' : 'Residential',
        beatOrPin: cleanPin || '324009',
        officeId: custResult.customer.officeId || activeProfile.officeId || 'DADABARI_SO',
        addressLine:
          custResult.customer.address?.fullAddress ||
          `${cleanHouse}, ${custResult.customer.sector || 'Sector 1'}, ${cleanColony}, Kota - ${cleanPin || '324009'}`,
        landmark: custResult.customer.landmark || '',
        occupancyStatus:
          custResult.customer.livingStatus === 'Vacant'
            ? 'Vacant'
            : custResult.customer.livingStatus === 'Tenant'
            ? 'Rented / Tenant'
            : 'Owner Occupied',
        linkedCustomerIds: [custResult.customer.id],
        houseNo: cleanHouse,
        colony: cleanColony,
        sector: custResult.customer.sector || 'Sector 1',
        beatNo: cleanBeat,
        pincode: cleanPin || '324009',
        remark: remark || undefined,
        submittedByStaffId: staffAttribution.employeeId || staffAttribution.staffId,
        staffAttribution,
        verificationMeta,
      });
    }

    let linkedLead: Lead | undefined;
    if (options?.leadData) {
      linkedLead = customerService.createLead({
        ...options.leadData,
        customerId: custResult.customer.id,
        propertyId: custResult.customer.propertyId || linkedProperty?.propertyCode,
        sourceStaffId: staffAttribution.employeeId || staffAttribution.staffId,
        sourceStaffName: staffAttribution.staffName,
        assignedStaffId: options.leadData.assignedStaffId || staffAttribution.staffId,
        assignedStaffName: options.leadData.assignedStaffName || staffAttribution.staffName,
        notes: remark ? `${options.leadData.notes || ''} [Remark: ${remark}]`.trim() : options.leadData.notes,
        brandId: enrichedPayload.brandId,
        brandName: enrichedPayload.brandName,
      });
    }

    xpeedoOpsService.logExternalActivity({
      actor: staffAttribution.staffName,
      actorRole: xpeedoOpsService.resolvePlatformRole(activeProfile),
      workspaceId: (enrichedPayload.brandId || 'india-post').toLowerCase() === 'india-post' ? 'INDIA_POST' : (enrichedPayload.brandId || 'INDIA_POST').toUpperCase(),
      entityType: 'Customer',
      entityId: custResult.customer.masterId || custResult.customer.id,
      action: dupCheck.hasMatch || !custResult.isNew ? 'THREE_LAYER_CUSTOMER_SYNC' : 'THREE_LAYER_CUSTOMER_CREATE',
      summary: `3-Layer Verified Customer ${custResult.customer.name} (${custResult.customer.masterId || custResult.customer.id}) by ${staffAttribution.staffName} [${staffAttribution.employeeId}]${remark ? ` · Remark: ${remark}` : ''}`,
    });

    return {
      success: true,
      data: custResult.customer,
      linkedProperty,
      linkedLead,
      duplicateCheck: dupCheck,
      verificationMeta,
      staffAttribution,
    };
  }
}

export const commonDataCentreService = new CommonDataCentreService();
