import * as XLSX from 'xlsx';
import {
  CommercialStoreCategory,
  CommercialStoreRecord,
} from '../types/models';
import { COLONY_HIERARCHY_MAP } from '../data/colonyHierarchyData';
import { UPDATED_STAFF_LIST } from '../data/updatedStaffData';
import {
  getVerifiedDadabari324009Registry,
  getStoredCscDirectory,
} from '../data/kotaCommercialCscData';
import { customerService } from './customerService';
import { verificationService } from './verificationService';

const STORAGE_KEY = 'xpeedo_commercial_stores_v1';

export interface BeatTerritoryMeta {
  beatNo: string; // e.g. 'Beat 1'
  cleanBeatNo: string; // '1'
  colonies: string[];
  pincode: string;
  subOffice: string;
  staffId: string;
  staffName: string;
  staffContact: string;
  centerLat: number;
  centerLng: number;
}

export interface ExtractCommercialOptions {
  beatNo: string;
  colonies?: string[];
  categories?: CommercialStoreCategory[];
  minYears?: number;
  maxPagesPerQuery?: number;
  autoSyncToRoutes?: boolean;
}

export interface ExtractCommercialResult {
  success: boolean;
  quotaExceeded?: boolean;
  error?: string;
  message?: string;
  inserted: number;
  updated: number;
  duplicatesSkipped: number;
  syncedProperties: number;
  queuedVerifications: number;
  diagnostics?: {
    rawFetched: number;
    operationalCount: number;
    filteredOutByLongevity: number;
    uniqueReturned: number;
    minYearsApplied: number;
    queryLogs: Array<{ category: string; query: string; fetched: number; accepted: number }>;
  };
}

export interface BulkImportResult {
  success: boolean;
  totalParsed: number;
  inserted: number;
  updated: number;
  duplicatesSkipped: number;
  syncedProperties: number;
  queuedVerifications: number;
  errors: string[];
}

// Deterministic Kota Dadabari / South Kota sector centroids for Beat 1..34 query bias
const BEAT_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  '1': { lat: 25.1536, lng: 75.8264 },
  '2': { lat: 25.1462, lng: 75.8235 },
  '3': { lat: 25.1588, lng: 75.8295 },
  '4': { lat: 25.1512, lng: 75.8211 },
  '5': { lat: 25.1438, lng: 75.8315 },
  '6': { lat: 25.1384, lng: 75.8392 },
  '7': { lat: 25.1342, lng: 75.8446 },
  '8': { lat: 25.1305, lng: 75.8384 },
  '9': { lat: 25.1476, lng: 75.8342 },
  '10': { lat: 25.1544, lng: 75.8398 },
};

function getBeatCentroid(cleanBeat: string): { lat: number; lng: number } {
  if (BEAT_CENTROIDS[cleanBeat]) return BEAT_CENTROIDS[cleanBeat];
  const n = Math.max(1, parseInt(cleanBeat, 10) || 1);
  // Deterministic Kota South S.O. ring bias purely for geographic query centering
  const angle = ((n * 37) % 360) * (Math.PI / 180);
  const radius = 0.008 + (n % 5) * 0.003;
  return {
    lat: Number((25.1462 + Math.sin(angle) * radius).toFixed(6)),
    lng: Number((75.8268 + Math.cos(angle) * radius).toFixed(6)),
  };
}

function buildBeatDirectory(): BeatTerritoryMeta[] {
  const beatColonies = new Map<string, Set<string>>();
  const beatPincodes = new Map<string, string>();
  const beatOffices = new Map<string, string>();

  Object.values(COLONY_HIERARCHY_MAP).forEach((col) => {
    col.sectors.forEach((sec) => {
      const clean = sec.cleanBeatNo || col.defaultCleanBeatNo || '1';
      if (!beatColonies.has(clean)) beatColonies.set(clean, new Set());
      beatColonies.get(clean)!.add(col.name);
      if (!beatPincodes.has(clean)) beatPincodes.set(clean, sec.pincode || col.defaultPincode || '324009');
      if (!beatOffices.has(clean)) beatOffices.set(clean, sec.subOffice || col.defaultSubOffice || 'Dadabari S.O.');
    });
  });

  const staffByCleanBeat = new Map<string, { id: string; name: string; contact: string }>();
  UPDATED_STAFF_LIST.forEach((s) => {
    const clean = (s.beat || '').replace(/\D/g, '');
    if (clean && !staffByCleanBeat.has(clean)) {
      staffByCleanBeat.set(clean, { id: s.id, name: s.name, contact: s.contact });
    }
  });

  const list: BeatTerritoryMeta[] = [];
  for (let i = 1; i <= 34; i++) {
    const clean = String(i);
    const beatNo = `Beat ${clean}`;
    const staff = staffByCleanBeat.get(clean) || {
      id: 'STAFF-50457421',
      name: 'Mahendra Kumar Meena',
      contact: '8769706002',
    };
    const cols = Array.from(beatColonies.get(clean) || []);
    const center = getBeatCentroid(clean);
    list.push({
      beatNo,
      cleanBeatNo: clean,
      colonies: cols.length > 0 ? cols : ['Dadabari', 'Keshavpura'],
      pincode: beatPincodes.get(clean) || '324009',
      subOffice: beatOffices.get(clean) || 'Dadabari S.O.',
      staffId: staff.id,
      staffName: staff.name,
      staffContact: staff.contact,
      centerLat: center.lat,
      centerLng: center.lng,
    });
  }
  return list;
}

function normalizePhone(raw: unknown): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return String(raw || '').trim();
}

function normalizeCategory(raw: unknown): CommercialStoreCategory {
  const s = String(raw || '').toLowerCase();
  if (s.includes('emitra') || s.includes('csc') || s.includes('kiosk')) return 'eMitra/CSC';
  if (s.includes('wholesale') || s.includes('distributor') || s.includes('traders')) return 'Wholesale';
  if (s.includes('service') || s.includes('clinic') || s.includes('bank') || s.includes('office')) return 'Services';
  return 'Retail';
}

function normalizeBeat(raw: unknown): { beatNo: string; cleanBeatNo: string } {
  const digits = String(raw || '1').replace(/\D/g, '');
  const clean = digits || '1';
  return { beatNo: `Beat ${clean}`, cleanBeatNo: clean };
}

class CommercialPropertyService {
  private stores: CommercialStoreRecord[] = [];
  private listeners: Set<() => void> = new Set();
  public readonly beatDirectory: BeatTerritoryMeta[] = buildBeatDirectory();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.stores = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load commercial stores from storage:', e);
    }
    this.stores = [];
  }

  private saveToStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stores));
      }
    } catch (e) {
      console.warn('Failed to save commercial stores to storage:', e);
    }
    this.notify();
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('CommercialPropertyService listener error:', err);
      }
    });
  }

  public getAllStores(): CommercialStoreRecord[] {
    return [...this.stores];
  }

  public getBeatMeta(beatNoOrClean: string): BeatTerritoryMeta {
    const clean = String(beatNoOrClean || '1').replace(/\D/g, '') || '1';
    return this.beatDirectory.find((b) => b.cleanBeatNo === clean) || this.beatDirectory[0];
  }

  /**
   * Imports pre-existing verified Dadabari 324009 CRM commercial & eMitra/CSC registry entries
   * from kotaCommercialCscData.ts with strict 'crm_registry' source attribution.
   */
  public importExistingCrmBaselineRegistry(): {
    inserted: number;
    updated: number;
    duplicatesSkipped: number;
  } {
    const verified = getVerifiedDadabari324009Registry();
    const csc = getStoredCscDirectory();
    const combined: Partial<CommercialStoreRecord>[] = [];

    verified.forEach((v, idx) => {
      const { beatNo, cleanBeatNo } = normalizeBeat(v.beatNo);
      const center = getBeatCentroid(cleanBeatNo);
      // Small deterministic offset purely around sector centroid for visual separation of existing CRM entries
      const offsetLat = ((idx % 7) - 3) * 0.0007;
      const offsetLng = ((Math.floor(idx / 7) % 7) - 3) * 0.0007;
      combined.push({
        id: v.id,
        storeName: v.storeName,
        ownerName: v.ownerName,
        primaryPhone: normalizePhone(v.primaryMobile),
        whatsappNumber: normalizePhone(v.whatsapp || v.primaryMobile),
        latitude: Number((center.lat + offsetLat).toFixed(6)),
        longitude: Number((center.lng + offsetLng).toFixed(6)),
        fullAddress: `${v.housePlotNumber}, ${v.complexName ? v.complexName + ', ' : ''}${v.landmark}, ${v.colony}, Kota - ${v.pincode}`,
        colony: v.colony,
        blockSector: v.housePlotNumber || v.complexName || 'Main Market',
        pincode: v.pincode || '324009',
        beatNo,
        cleanBeatNo,
        category: v.categoryTag.includes('eMitra') ? 'eMitra/CSC' : 'Retail',
        operationYears: 5,
        longevityBadge: 'Manual / Baseline',
        operationalStatus: 'OPERATIONAL',
        longevityVerified: true,
        source: 'crm_registry',
        verificationStatus: 'Verified',
      });
    });

    csc.forEach((c, idx) => {
      const { beatNo, cleanBeatNo } = normalizeBeat(c.beatNo);
      const center = getBeatCentroid(cleanBeatNo);
      const offsetLat = ((idx % 5) - 2) * 0.0009;
      const offsetLng = ((Math.floor(idx / 5) % 5) - 2) * 0.0009;
      combined.push({
        id: c.id,
        storeName: c.businessName,
        ownerName: c.operatorName,
        primaryPhone: normalizePhone(c.primaryMobile),
        whatsappNumber: normalizePhone(c.whatsapp || c.primaryMobile),
        latitude: c.latitude || Number((center.lat + offsetLat).toFixed(6)),
        longitude: c.longitude || Number((center.lng + offsetLng).toFixed(6)),
        fullAddress: `${c.housePlotNumber}, ${c.complexName ? c.complexName + ', ' : ''}${c.landmark}, ${c.colony}, Kota - ${c.pincode}`,
        colony: c.colony,
        blockSector: c.housePlotNumber || c.complexName || 'CSC Kiosk Sector',
        pincode: c.pincode || '324009',
        beatNo,
        cleanBeatNo,
        category: c.subCategory.includes('eMitra') ? 'eMitra/CSC' : 'Services',
        operationYears: 5,
        longevityBadge: 'Manual / Baseline',
        operationalStatus: 'OPERATIONAL',
        longevityVerified: c.verificationStatus === 'Verified',
        source: 'crm_registry',
        verificationStatus: c.verificationStatus === 'Verified' ? 'Verified' : 'Pending',
      });
    });

    const stats = this.upsertStoresWithDedup(combined, 'crm_registry');
    return stats;
  }

  /**
   * Executes live Google Maps Places API (New) commercial extraction via backend proxy
   * for a specific Postal Beat (Beat 1 - Beat 34), filtering by operational status and 3-5+ year activity.
   */
  public async extractBeatFromGooglePlaces(
    options: ExtractCommercialOptions
  ): Promise<ExtractCommercialResult> {
    const meta = this.getBeatMeta(options.beatNo);
    const colonies = options.colonies?.length ? options.colonies : meta.colonies;

    try {
      const res = await fetch('/api/v1/maps/commercial-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beatNo: meta.beatNo,
          colonies,
          pincode: meta.pincode,
          categories: options.categories || ['Retail', 'Wholesale', 'Services', 'eMitra/CSC'],
          minYears: options.minYears ?? 3,
          maxPagesPerQuery: options.maxPagesPerQuery ?? 2,
          centerLat: meta.centerLat,
          centerLng: meta.centerLng,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (
        res.status === 429 ||
        data?.quotaExceeded ||
        data?.error === 'RESOURCE_EXHAUSTED' ||
        data?.error === 'OVER_QUERY_LIMIT'
      ) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        return {
          success: false,
          quotaExceeded: true,
          error: 'RESOURCE_EXHAUSTED',
          message: data?.message || 'Google Maps Platform API quota reached.',
          inserted: 0,
          updated: 0,
          duplicatesSkipped: 0,
          syncedProperties: 0,
          queuedVerifications: 0,
        };
      }

      if (!res.ok || !data?.success) {
        return {
          success: false,
          error: data?.error || `HTTP_${res.status}`,
          message: data?.message || 'Unable to extract live Google Maps data.',
          inserted: 0,
          updated: 0,
          duplicatesSkipped: 0,
          syncedProperties: 0,
          queuedVerifications: 0,
        };
      }

      const incoming: CommercialStoreRecord[] = Array.isArray(data.records) ? data.records : [];
      const upsertRes = this.upsertStoresWithDedup(incoming, 'google_places');

      let syncedProperties = 0;
      let queuedVerifications = 0;
      if (options.autoSyncToRoutes !== false && incoming.length > 0) {
        const syncSummary = this.syncToFieldWorkflows(incoming.map((r) => r.id));
        syncedProperties = syncSummary.syncedProperties;
        queuedVerifications = syncSummary.queuedVerifications;
      }

      return {
        success: true,
        inserted: upsertRes.inserted,
        updated: upsertRes.updated,
        duplicatesSkipped: upsertRes.duplicatesSkipped,
        syncedProperties,
        queuedVerifications,
        diagnostics: data.diagnostics,
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: err?.message || 'Network error while contacting Google Places extraction service.',
        inserted: 0,
        updated: 0,
        duplicatesSkipped: 0,
        syncedProperties: 0,
        queuedVerifications: 0,
      };
    }
  }

  /**
   * Automated multi-key de-duplication & upsert into Commercial Store directory.
   */
  public upsertStoresWithDedup(
    incomingList: Partial<CommercialStoreRecord>[],
    defaultSource: CommercialStoreRecord['source']
  ): { inserted: number; updated: number; duplicatesSkipped: number } {
    let inserted = 0;
    let updated = 0;
    let duplicatesSkipped = 0;
    const existingProps = customerService.getProperties();
    const nextStores = [...this.stores];

    for (const raw of incomingList) {
      const storeName = String(raw.storeName || '').trim();
      if (!storeName) {
        duplicatesSkipped += 1;
        continue;
      }

      const { beatNo, cleanBeatNo } = normalizeBeat(raw.beatNo || raw.cleanBeatNo || '1');
      const colony = String(raw.colony || this.getBeatMeta(cleanBeatNo).colonies[0] || 'Dadabari').trim();
      const blockSector = String(raw.blockSector || 'Commercial Sector').trim();
      const phone = normalizePhone(raw.primaryPhone);
      const whatsapp = normalizePhone(raw.whatsappNumber) || phone;
      const lat = Number(raw.latitude || getBeatCentroid(cleanBeatNo).lat);
      const lng = Number(raw.longitude || getBeatCentroid(cleanBeatNo).lng);
      const normName = storeName.toLowerCase();
      const normColony = colony.toLowerCase();
      const normSector = blockSector.toLowerCase();

      const matchIdx = nextStores.findIndex((s) => {
        if (raw.placeId && s.placeId && s.placeId === raw.placeId) return true;
        if (raw.id && s.id === raw.id) return true;
        if (s.storeName.trim().toLowerCase() === normName && s.colony.trim().toLowerCase() === normColony) {
          return true;
        }
        if (phone.length === 10 && normalizePhone(s.primaryPhone) === phone && s.storeName.trim().toLowerCase() === normName) {
          return true;
        }
        const latDiff = Math.abs(s.latitude - lat);
        const lngDiff = Math.abs(s.longitude - lng);
        if (latDiff < 0.00025 && lngDiff < 0.00025 && s.storeName.trim().toLowerCase() === normName) {
          return true;
        }
        return false;
      });

      const operationYears = Math.max(0, Number(raw.operationYears ?? 3));
      const longevityBadge: CommercialStoreRecord['longevityBadge'] =
        raw.longevityBadge ||
        (operationYears >= 5
          ? '5+ Years Verified'
          : operationYears >= 3
          ? '3–5 Years Verified'
          : 'Operational');

      const record: CommercialStoreRecord = {
        id: raw.id || (raw.placeId ? `GMB-${raw.placeId}` : `COMM-${cleanBeatNo}-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 999)}`),
        placeId: raw.placeId,
        storeName,
        ownerName: String(raw.ownerName || 'Proprietor (Verify on Visit)').trim(),
        primaryPhone: phone,
        whatsappNumber: whatsapp,
        latitude: lat,
        longitude: lng,
        photoUrl: raw.photoUrl,
        photoAttribution: raw.photoAttribution,
        googleMapsUri: raw.googleMapsUri,
        fullAddress: String(raw.fullAddress || `${blockSector}, ${colony}, Kota - ${raw.pincode || '324009'}`).trim(),
        colony,
        blockSector,
        pincode: String(raw.pincode || '324009').trim(),
        beatNo,
        cleanBeatNo,
        category: normalizeCategory(raw.category),
        rawTypes: raw.rawTypes,
        operationYears,
        earliestVerifiedYear: raw.earliestVerifiedYear,
        longevityBadge,
        operationalStatus: raw.operationalStatus || 'OPERATIONAL',
        userRatingCount: raw.userRatingCount,
        rating: raw.rating,
        longevityVerified: raw.longevityVerified ?? operationYears >= 3,
        source: raw.source || defaultSource,
        verificationStatus: raw.verificationStatus || 'Pending',
        syncedToPropertyMaster: raw.syncedToPropertyMaster ?? false,
        syncedToVerificationQueue: raw.syncedToVerificationQueue ?? false,
        createdAt: raw.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (matchIdx !== -1) {
        const existing = nextStores[matchIdx];
        const isExactDuplicate =
          existing.storeName.trim().toLowerCase() === normName &&
          existing.colony.trim().toLowerCase() === normColony &&
          existing.blockSector.trim().toLowerCase() === normSector &&
          normalizePhone(existing.primaryPhone) === phone;

        if (isExactDuplicate && defaultSource !== 'google_places') {
          duplicatesSkipped += 1;
          continue;
        }

        nextStores[matchIdx] = {
          ...existing,
          ...record,
          id: existing.id,
          ownerName:
            record.ownerName && !record.ownerName.includes('Verify on Visit')
              ? record.ownerName
              : existing.ownerName,
          primaryPhone: record.primaryPhone || existing.primaryPhone,
          whatsappNumber: record.whatsappNumber || existing.whatsappNumber,
          photoUrl: record.photoUrl || existing.photoUrl,
          syncedToPropertyMaster:
            existing.syncedToPropertyMaster ||
            existingProps.some((p) => p.placeId && p.placeId === record.placeId),
          syncedToVerificationQueue: existing.syncedToVerificationQueue,
          createdAt: existing.createdAt,
        };
        updated += 1;
      } else {
        nextStores.unshift(record);
        inserted += 1;
      }
    }

    this.stores = nextStores;
    this.saveToStorage();
    return { inserted, updated, duplicatesSkipped };
  }

  /**
   * Parses CSV, XLSX, or JSON upload and runs deduplication + auto-sync.
   */
  public async parseAndBulkImportFile(
    file: File,
    fallbackBeat = 'Beat 1',
    autoSync = true
  ): Promise<BulkImportResult> {
    const errors: string[] = [];
    let rows: Record<string, any>[] = [];

    try {
      const lowerName = file.name.toLowerCase();
      if (lowerName.endsWith('.json')) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.records) ? parsed.records : [parsed];
      } else {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const firstSheet = wb.SheetNames[0];
        if (!firstSheet) {
          return {
            success: false,
            totalParsed: 0,
            inserted: 0,
            updated: 0,
            duplicatesSkipped: 0,
            syncedProperties: 0,
            queuedVerifications: 0,
            errors: ['Uploaded spreadsheet contains no worksheets.'],
          };
        }
        rows = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[firstSheet], { defval: '' });
      }
    } catch (e: any) {
      return {
        success: false,
        totalParsed: 0,
        inserted: 0,
        updated: 0,
        duplicatesSkipped: 0,
        syncedProperties: 0,
        queuedVerifications: 0,
        errors: [e?.message || 'Failed to parse uploaded file. Check CSV/JSON/XLSX formatting.'],
      };
    }

    const mapped: Partial<CommercialStoreRecord>[] = [];
    rows.forEach((row, idx) => {
      const pick = (...keys: string[]) => {
        for (const k of keys) {
          const foundKey = Object.keys(row).find((rk) => rk.trim().toLowerCase() === k.toLowerCase());
          if (foundKey && row[foundKey] !== undefined && String(row[foundKey]).trim() !== '') {
            return String(row[foundKey]).trim();
          }
        }
        return '';
      };

      const storeName = pick('storeName', 'Store / Business Name', 'Store Name', 'Business Name', 'name', 'Shop Name');
      if (!storeName) {
        errors.push(`Row ${idx + 2}: Skipped (missing Store Name).`);
        return;
      }

      const rawStatus = pick('operationalStatus', 'Operational Status', 'status').toUpperCase();
      if (rawStatus.includes('CLOSED_PERMANENTLY') || rawStatus === 'CLOSED') {
        errors.push(`Row ${idx + 2} (${storeName}): Skipped closed business.`);
        return;
      }

      const beatRaw = pick('beatNo', 'Beat No', 'Postal Beat ID', 'Beat', 'beat') || fallbackBeat;
      const { beatNo, cleanBeatNo } = normalizeBeat(beatRaw);
      const center = getBeatCentroid(cleanBeatNo);
      const lat = Number(pick('latitude', 'lat', 'Geo Lat') || center.lat);
      const lng = Number(pick('longitude', 'lng', 'lon', 'Geo Lng') || center.lng);
      const yearsRaw = Number(pick('operationYears', 'Operation Age', 'Years Active', 'years') || 4);

      mapped.push({
        placeId: pick('placeId', 'Place ID', 'googlePlaceId') || undefined,
        storeName,
        ownerName: pick('ownerName', 'Owner Name', 'Proprietor Name', 'Business Owner', 'owner') || 'Proprietor (Verify on Visit)',
        primaryPhone: normalizePhone(pick('primaryPhone', 'Phone', 'Mobile', 'Contact', 'primaryMobile')),
        whatsappNumber: normalizePhone(pick('whatsappNumber', 'WhatsApp', 'WhatsApp Line', 'whatsapp')),
        latitude: Number.isNaN(lat) ? center.lat : lat,
        longitude: Number.isNaN(lng) ? center.lng : lng,
        photoUrl: pick('photoUrl', 'Photo URL', 'Store Frontage Photo URL', 'image') || undefined,
        googleMapsUri: pick('googleMapsUri', 'Google Maps Link', 'mapsUrl') || undefined,
        fullAddress: pick('fullAddress', 'Full Address', 'Address', 'address'),
        colony: pick('colony', 'Colony', 'Locality', 'area') || this.getBeatMeta(cleanBeatNo).colonies[0],
        blockSector: pick('blockSector', 'Block/Sector', 'Sector', 'Block', 'sector') || 'Commercial Market',
        pincode: pick('pincode', 'Pincode', 'PIN', 'pin') || '324009',
        beatNo,
        cleanBeatNo,
        category: normalizeCategory(pick('category', 'Business Category', 'type', 'categoryTag')),
        operationYears: Number.isNaN(yearsRaw) ? 4 : yearsRaw,
        operationalStatus: 'OPERATIONAL',
        longevityVerified: (Number.isNaN(yearsRaw) ? 4 : yearsRaw) >= 3,
        source: file.name.toLowerCase().endsWith('.json') ? 'json_import' : 'csv_import',
      });
    });

    const sourceType = file.name.toLowerCase().endsWith('.json') ? 'json_import' : 'csv_import';
    const upsertRes = this.upsertStoresWithDedup(mapped, sourceType);

    let syncedProperties = 0;
    let queuedVerifications = 0;
    if (autoSync && mapped.length > 0) {
      const syncSummary = this.syncToFieldWorkflows(
        this.stores.slice(0, mapped.length + 5).map((s) => s.id)
      );
      syncedProperties = syncSummary.syncedProperties;
      queuedVerifications = syncSummary.queuedVerifications;
    }

    return {
      success: true,
      totalParsed: rows.length,
      inserted: upsertRes.inserted,
      updated: upsertRes.updated,
      duplicatesSkipped: upsertRes.duplicatesSkipped,
      syncedProperties,
      queuedVerifications,
      errors: errors.slice(0, 15),
    };
  }

  /**
   * Syncs Commercial Store entries cleanly into Customer/Property Master & Daily Postman Verification Routes.
   */
  public syncToFieldWorkflows(storeIds?: string[]): {
    syncedProperties: number;
    queuedVerifications: number;
  } {
    const idSet = storeIds ? new Set(storeIds) : null;
    const targets = idSet ? this.stores.filter((s) => idSet.has(s.id)) : this.stores;
    if (targets.length === 0) {
      return { syncedProperties: 0, queuedVerifications: 0 };
    }

    const propSync = customerService.syncCommercialStoresToRegistry(targets);
    const verifSync = verificationService.queueCommercialVerificationTargets(targets);

    const targetIds = new Set(targets.map((t) => t.id));
    this.stores = this.stores.map((s) =>
      targetIds.has(s.id)
        ? {
            ...s,
            syncedToPropertyMaster: true,
            syncedToVerificationQueue: true,
            updatedAt: new Date().toISOString(),
          }
        : s
    );
    this.saveToStorage();

    return {
      syncedProperties: propSync.inserted + propSync.updated,
      queuedVerifications: verifSync.queued,
    };
  }

  /**
   * Scans the commercial registry and collapses any duplicate entries by placeId or normalized store+colony+beat.
   */
  public runDeduplicationAudit(): { beforeCount: number; afterCount: number; duplicatesRemoved: number } {
    const beforeCount = this.stores.length;
    const seen = new Map<string, CommercialStoreRecord>();

    for (const store of this.stores) {
      const key = store.placeId
        ? `pid:${store.placeId}`
        : `name:${store.storeName.trim().toLowerCase()}|col:${store.colony.trim().toLowerCase()}|beat:${store.cleanBeatNo}`;

      if (!seen.has(key)) {
        seen.set(key, store);
      } else {
        const prev = seen.get(key)!;
        // Merge stronger fields into existing entry
        seen.set(key, {
          ...prev,
          ownerName:
            prev.ownerName.includes('Verify') && !store.ownerName.includes('Verify')
              ? store.ownerName
              : prev.ownerName,
          primaryPhone: prev.primaryPhone || store.primaryPhone,
          whatsappNumber: prev.whatsappNumber || store.whatsappNumber,
          photoUrl: prev.photoUrl || store.photoUrl,
          operationYears: Math.max(prev.operationYears, store.operationYears),
          syncedToPropertyMaster: prev.syncedToPropertyMaster || store.syncedToPropertyMaster,
          syncedToVerificationQueue: prev.syncedToVerificationQueue || store.syncedToVerificationQueue,
        });
      }
    }

    this.stores = Array.from(seen.values());
    this.saveToStorage();
    return {
      beforeCount,
      afterCount: this.stores.length,
      duplicatesRemoved: beforeCount - this.stores.length,
    };
  }

  public updateStore(id: string, patch: Partial<CommercialStoreRecord>): boolean {
    const idx = this.stores.findIndex((s) => s.id === id);
    if (idx === -1) return false;

    const current = this.stores[idx];
    const beatInfo = patch.beatNo ? normalizeBeat(patch.beatNo) : { beatNo: current.beatNo, cleanBeatNo: current.cleanBeatNo };
    const updated: CommercialStoreRecord = {
      ...current,
      ...patch,
      beatNo: beatInfo.beatNo,
      cleanBeatNo: beatInfo.cleanBeatNo,
      updatedAt: new Date().toISOString(),
    };
    this.stores = [...this.stores.slice(0, idx), updated, ...this.stores.slice(idx + 1)];
    this.saveToStorage();
    customerService.syncCommercialStoresToRegistry([updated]);
    return true;
  }

  public deleteStore(id: string): boolean {
    const before = this.stores.length;
    this.stores = this.stores.filter((s) => s.id !== id);
    if (this.stores.length !== before) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  public clearAllStores() {
    this.stores = [];
    this.saveToStorage();
  }

  public exportStoresToCsv(stores: CommercialStoreRecord[]) {
    const headers = [
      'Store ID',
      'Place ID',
      'Store Name',
      'Owner Name',
      'Category',
      'Primary Phone',
      'WhatsApp',
      'Latitude',
      'Longitude',
      'Colony',
      'Block/Sector',
      'Pincode',
      'Beat No',
      'Full Address',
      'Operation Years',
      'Longevity Badge',
      'Operational Status',
      'Source',
      'Google Maps URI',
    ];

    const escapeCsv = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const rows = stores.map((s) =>
      [
        s.id,
        s.placeId || '',
        s.storeName,
        s.ownerName,
        s.category,
        s.primaryPhone,
        s.whatsappNumber,
        s.latitude,
        s.longitude,
        s.colony,
        s.blockSector,
        s.pincode,
        s.beatNo,
        s.fullAddress,
        s.operationYears,
        s.longevityBadge,
        s.operationalStatus,
        s.source,
        s.googleMapsUri || '',
      ]
        .map(escapeCsv)
        .join(',')
    );

    const csvContent = [headers.map(escapeCsv).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `xpeedo_commercial_stores_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public downloadBulkTemplate(format: 'csv' | 'json') {
    const sampleHeaders = [
      {
        'Store / Business Name': 'Example Hardware & Kirana',
        'Business Owner': 'Proprietor Name',
        'Primary Phone': '9829000000',
        'WhatsApp': '9829000000',
        'Category': 'Retail',
        'Colony': 'Keshavpura',
        'Block/Sector': 'Sector 7',
        'Pincode': '324009',
        'Beat No': 'Beat 2',
        'Full Address': 'Shop 12, Sector 7, Keshavpura, Dadabari S.O., Kota 324009',
        'Latitude': '25.1462',
        'Longitude': '75.8235',
        'Operation Years': '5',
        'Photo URL': '',
      },
    ];

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(sampleHeaders, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'xpeedo_commercial_bulk_template.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      const ws = XLSX.utils.json_to_sheet(sampleHeaders);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'xpeedo_commercial_bulk_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
}

export const commercialPropertyService = new CommercialPropertyService();
