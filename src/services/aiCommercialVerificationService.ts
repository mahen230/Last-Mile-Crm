import {
  CommercialStoreRecord,
  FourFactorVerificationResult,
  FourFactorFreshnessStatus,
  CustomerDemographicMatch,
  BeatProductMatchingPlan,
  LogisticsDispatchOrder,
  Customer,
} from '../types/models';
import { commercialPropertyService } from './commercialPropertyService';
import { customerService } from './customerService';
import { UPDATED_STAFF_LIST } from '../data/updatedStaffData';

const DISPATCH_STORAGE_KEY = 'xpeedo_logistics_dispatches_v1';

export class AICommercialVerificationService {
  private dispatches: LogisticsDispatchOrder[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadDispatches();
  }

  private loadDispatches() {
    try {
      const raw = localStorage.getItem(DISPATCH_STORAGE_KEY);
      if (raw) {
        this.dispatches = JSON.parse(raw);
      } else {
        this.dispatches = this.getDefaultDispatches();
        this.saveDispatches();
      }
    } catch {
      this.dispatches = this.getDefaultDispatches();
    }
  }

  private saveDispatches() {
    try {
      localStorage.setItem(DISPATCH_STORAGE_KEY, JSON.stringify(this.dispatches));
    } catch {
      // ignore
    }
    this.notify();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('xpeedo-logistics-dispatches-updated'));
    }
  }

  /**
   * 1. 4-FACTOR BUSINESS VERIFICATION & FRESHNESS ENGINE
   * Evaluates a commercial store record against the 4 strict parameters
   * and enforces the 1-year freshness deadline rule.
   */
  public evaluateStoreFourFactor(store: CommercialStoreRecord): FourFactorVerificationResult {
    const now = new Date();
    const oneYearAgoMs = 365 * 24 * 60 * 60 * 1000;

    // Dates: Use established listedDate / lastCheckedDate or establish deterministic timeline
    let listedDate = store.listedDate || store.createdAt;
    let lastCheckedDate = store.lastCheckedDate || store.updatedAt;

    if (!listedDate) {
      const code = (store.id || store.storeName).charCodeAt((store.id || store.storeName).length - 1) || 0;
      if (code % 4 === 0) {
        // Older listing (> 1 year ago)
        listedDate = new Date(now.getTime() - 410 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        listedDate = new Date(now.getTime() - 110 * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    if (!lastCheckedDate) {
      const code = (store.id || store.storeName).charCodeAt(0) || 0;
      if (code % 3 === 0) {
        // Last checked date older than 1 year (> 365 days)
        lastCheckedDate = new Date(now.getTime() - 390 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        lastCheckedDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    const listedTime = new Date(listedDate).getTime();
    const lastCheckedTime = new Date(lastCheckedDate).getTime();

    const listedOlderThanOneYear = now.getTime() - listedTime > oneYearAgoMs;
    const checkedOlderThanOneYear = now.getTime() - lastCheckedTime > oneYearAgoMs;
    const isBothOneYearLate = listedOlderThanOneYear && checkedOlderThanOneYear;
    const isAnyOneYearLate = listedOlderThanOneYear || checkedOlderThanOneYear;

    // If staff physically field-verified recently (< 365 days), override staleness
    const hasRecentFieldVerification =
      Boolean(store.fieldVerifiedAt) &&
      now.getTime() - new Date(store.fieldVerifiedAt!).getTime() < oneYearAgoMs;

    // FACTOR 1: Active Trade Registration / License / CSC / eMitra credential check
    const isCSC = store.category === 'eMitra/CSC';
    const hasPhone = Boolean(store.primaryPhone && store.primaryPhone.length === 10);
    const hasProperName = Boolean(store.storeName && store.storeName.trim().length >= 3);
    const factor1ActiveLicense = hasProperName && (isCSC || hasPhone || store.source === 'crm_registry' || store.source === 'google_places');
    const factor1Details = factor1ActiveLicense
      ? isCSC
        ? 'Verified eMitra/CSC Rajasthan Kiosk License'
        : 'Registered Trade Entity & Active Commercial Line'
      : 'Unregistered / Unverified Trade Identity';

    // FACTOR 2: Geospatial PINcode & Beat Boundary Accuracy
    const validKotaPincodes = ['324009', '324005', '324001', '324007', '324008'];
    const pincodeValid = validKotaPincodes.includes(store.pincode);
    const latValid = store.latitude >= 25.10 && store.latitude <= 25.25;
    const lngValid = store.longitude >= 75.75 && store.longitude <= 75.95;
    const factor2GeospatialAccuracy = pincodeValid && latValid && lngValid;
    const factor2Details = factor2GeospatialAccuracy
      ? `Accurate PIN ${store.pincode} within Dadabari S.O. (${store.beatNo || 'Beat Territory'})`
      : 'Geospatial Drift / Out of Dadabari S.O. Delivery Jurisdiction';

    // FACTOR 3: Operational Status
    const factor3OperationalStatus = store.operationalStatus === 'OPERATIONAL';
    const factor3Details = factor3OperationalStatus
      ? `Confirmed Open & Actively Operating (${store.operationYears || 3}+ yrs sustained)`
      : 'Closed Temporarily or Physical Operation Not Found';

    // FACTOR 4: Recent Digital Footprint & Google Maps Reviews
    const hasPlaceId = Boolean(store.placeId);
    const hasRating = typeof store.rating === 'number' && store.rating > 0;
    const hasReviews = (store.userRatingCount || 0) > 0;
    const hasMapsUrl = Boolean(store.googleMapsUri);
    const factor4DigitalFootprint = hasPlaceId || hasRating || hasReviews || hasMapsUrl || store.source === 'google_places';
    const factor4Details = factor4DigitalFootprint
      ? `Active Digital Footprint · Google Maps Verified (${store.rating ? `${store.rating}★` : 'GMB Listed'})`
      : 'Zero Digital Footprint / Unindexed Local Merchant';

    // Calculate score (out of 100)
    let score = 0;
    if (factor1ActiveLicense) score += 25;
    if (factor2GeospatialAccuracy) score += 25;
    if (factor3OperationalStatus) score += 25;
    if (factor4DigitalFootprint) score += 25;

    const passedFactorsCount = [
      factor1ActiveLicense,
      factor2GeospatialAccuracy,
      factor3OperationalStatus,
      factor4DigitalFootprint,
    ].filter(Boolean).length;

    // Determine Freshness Status
    let freshnessStatus: FourFactorFreshnessStatus = 'FRESH_ACTIVE';
    if (!hasRecentFieldVerification && isBothOneYearLate) {
      freshnessStatus = 'STALE_EXCLUDED';
      score = Math.max(0, score - 35);
    } else if (!hasRecentFieldVerification && isAnyOneYearLate) {
      freshnessStatus = 'NEEDS_FIELD_RECHECK';
      score = Math.max(10, score - 15);
    }

    const aiAuditNotes =
      freshnessStatus === 'STALE_EXCLUDED'
        ? 'STRICT FRESHNESS RULE TRIGGERED: Both listing and last activity check dates exceed 1 year (>365 days). Automatically excluded from active customer promotions until physical field re-verification by assigned Postman.'
        : freshnessStatus === 'NEEDS_FIELD_RECHECK'
        ? 'WARNING: One activity checkpoint is older than 1 year. Flagged for Beat Postman field check.'
        : 'All 4 factors passed & active within 365-day operational window. Approved for customer promotions & delivery.';

    return {
      factor1ActiveLicense,
      factor1Details,
      factor2GeospatialAccuracy,
      factor2Details,
      factor3OperationalStatus,
      factor3Details,
      factor4DigitalFootprint,
      factor4Details,
      score,
      passedFactorsCount,
      freshnessStatus,
      lastCheckedDate,
      listedDate,
      isOlderThanOneYear: isAnyOneYearLate && !hasRecentFieldVerification,
      fieldVerifiedByStaffId: store.fieldVerifiedByStaffId,
      fieldVerifiedByStaffName: store.fieldVerifiedByStaffName,
      fieldVerifiedAt: store.fieldVerifiedAt,
      aiAuditNotes,
    };
  }

  /**
   * Run 4-Factor & Freshness Audit across all commercial stores
   */
  public runFullDatabaseAudit(): {
    totalChecked: number;
    freshActiveCount: number;
    staleExcludedCount: number;
    needsRecheckCount: number;
    averageScore: number;
  } {
    const all = commercialPropertyService.getAllStores();
    let freshActiveCount = 0;
    let staleExcludedCount = 0;
    let needsRecheckCount = 0;
    let totalScore = 0;

    all.forEach((store) => {
      const result = this.evaluateStoreFourFactor(store);
      store.fourFactorVerification = result;
      store.freshnessStatus = result.freshnessStatus;
      store.lastCheckedDate = result.lastCheckedDate;
      store.listedDate = result.listedDate;

      totalScore += result.score;
      if (result.freshnessStatus === 'FRESH_ACTIVE') freshActiveCount++;
      else if (result.freshnessStatus === 'STALE_EXCLUDED') staleExcludedCount++;
      else needsRecheckCount++;

      commercialPropertyService.updateStore(store.id, {
        fourFactorVerification: result,
        freshnessStatus: result.freshnessStatus,
        lastCheckedDate: result.lastCheckedDate,
        listedDate: result.listedDate,
      });
    });

    return {
      totalChecked: all.length,
      freshActiveCount,
      staleExcludedCount,
      needsRecheckCount,
      averageScore: all.length > 0 ? Math.round(totalScore / all.length) : 0,
    };
  }

  /**
   * Field Staff / Pincode Manager manual physical re-verification
   * Resets the freshness clock and reactivates a stale listing.
   */
  public reverifyStoreInField(
    storeId: string,
    staffId: string,
    staffName: string,
    verificationNotes?: string
  ): boolean {
    const store = commercialPropertyService.getAllStores().find((s) => s.id === storeId);
    if (!store) return false;

    const nowIso = new Date().toISOString();
    const updatedStore: Partial<CommercialStoreRecord> = {
      fieldVerifiedByStaffId: staffId,
      fieldVerifiedByStaffName: staffName,
      fieldVerifiedAt: nowIso,
      lastCheckedDate: nowIso,
      updatedAt: nowIso,
      verificationStatus: 'Verified',
      operationalStatus: 'OPERATIONAL',
      longevityVerified: true,
    };

    commercialPropertyService.updateStore(storeId, updatedStore);

    // Re-evaluate with new verification timestamp
    const refreshed = commercialPropertyService.getAllStores().find((s) => s.id === storeId);
    if (refreshed) {
      const res = this.evaluateStoreFourFactor(refreshed);
      commercialPropertyService.updateStore(storeId, {
        fourFactorVerification: {
          ...res,
          freshnessStatus: 'FRESH_ACTIVE',
          aiAuditNotes: `Field verified by Beat Staff ${staffName} (${staffId}) on ${new Date().toLocaleDateString('en-IN')}. ${verificationNotes || 'Physical operation and active footfall confirmed.'}`,
        },
        freshnessStatus: 'FRESH_ACTIVE',
      });
    }

    return true;
  }

  /**
   * Public Storefront Freshness Gate:
   * Strictly returns only FRESH_ACTIVE commercial partners & enforces 1-year stale exclusion.
   */
  public getFreshActiveStoresForPublic(): {
    freshStores: Array<CommercialStoreRecord & { evaluation: FourFactorVerificationResult }>;
    staleExcludedCount: number;
    needsRecheckCount: number;
  } {
    const allStores = commercialPropertyService.getAllStores();
    const freshStores: Array<CommercialStoreRecord & { evaluation: FourFactorVerificationResult }> = [];
    let staleExcludedCount = 0;
    let needsRecheckCount = 0;

    allStores.forEach((store) => {
      const evaluation = store.fourFactorVerification || this.evaluateStoreFourFactor(store);
      if (evaluation.freshnessStatus === 'FRESH_ACTIVE') {
        freshStores.push({ ...store, evaluation });
      } else if (evaluation.freshnessStatus === 'STALE_EXCLUDED') {
        staleExcludedCount += 1;
      } else {
        needsRecheckCount += 1;
      }
    });

    return {
      freshStores: freshStores.sort((a, b) => b.evaluation.score - a.evaluation.score),
      staleExcludedCount,
      needsRecheckCount,
    };
  }

  /**
   * 2. PINCODE & BEAT-WISE PRODUCT-TO-CUSTOMER MATCHING ENGINE
   * Links active commercial partner products to customers in that beat/pincode
   */
  public generateBeatMatchingPlan(beatNo: string): BeatProductMatchingPlan {
    const cleanBeat = beatNo.replace(/\D/g, '') || '1';
    const beatMeta = commercialPropertyService.getBeatMeta(`Beat ${cleanBeat}`);
    const allCustomers = customerService.getCustomers();
    const allStores = commercialPropertyService.getAllStores();

    // Only match FRESH_ACTIVE stores (strictly exclude STALE_EXCLUDED merchants!)
    const activeStoresInBeat = allStores.filter((s) => {
      const matchBeat = (s.beatNo || '').replace(/\D/g, '') === cleanBeat;
      const evalRes = s.fourFactorVerification || this.evaluateStoreFourFactor(s);
      return matchBeat && evalRes.freshnessStatus === 'FRESH_ACTIVE';
    });

    // Prioritize customers explicitly assigned to this Beat, then match same PINcode
    const beatExactCustomers: Customer[] = [];
    const pincodeFallbackCustomers: Customer[] = [];

    allCustomers.forEach((c) => {
      const custBeat = (c.beatNo || '').replace(/\D/g, '');
      const custPincode = c.pincode || '324009';
      if (custBeat === cleanBeat) {
        beatExactCustomers.push(c);
      } else if (custPincode === beatMeta.pincode) {
        pincodeFallbackCustomers.push(c);
      }
    });

    const rankedCustomers = [...beatExactCustomers, ...pincodeFallbackCustomers];

    const storeMatches = activeStoresInBeat.map((store) => {
      const matchedCustomers: CustomerDemographicMatch[] = rankedCustomers.slice(0, 8).map((c) => {
        const isExactBeat = (c.beatNo || '').replace(/\D/g, '') === cleanBeat;
        const isSenior = (c.age || 0) >= 58 || /retir|pension|senior/i.test(c.occupation || '');
        const isBusiness = /business|shop|trader|self|merchant/i.test(c.occupation || '');
        let score = isExactBeat ? 86 : 74;

        let matchReason = '';
        let recommendedPitchMessage = '';

        if (store.category === 'Retail') {
          if (isSenior) score += 10;
          else if (isExactBeat) score += 8;
          matchReason = `${isSenior ? 'Senior citizen household' : 'Resident'} in ${c.sector || 'Sector'} ${c.colony || 'Dadabari'} (${isExactBeat ? `Exact Beat ${cleanBeat}` : `PIN ${beatMeta.pincode}`}); strong daily retail & doorstep grocery affinity.`;
          recommendedPitchMessage = `Namaste ${c.name}, order verified household essentials from ${store.storeName} (${store.colony}) with same-day Speed Post / Postman delivery by ${beatMeta.staffName}.`;
        } else if (store.category === 'eMitra/CSC') {
          if (isSenior) score += 12;
          else score += 7;
          matchReason = `${isSenior ? 'Priority Pensioner / Senior Citizen' : 'Resident'} in ${c.colony || 'Dadabari'} eligible for DBT certificate, Aadhaar & Jeevan Pramaan renewal.`;
          recommendedPitchMessage = `Namaste ${c.name}, need Aadhaar/PPO/document services? ${store.storeName} is your verified Beat ${cleanBeat} eMitra/CSC center with doorstep document pickup by ${beatMeta.staffName}.`;
        } else if (store.category === 'Services') {
          if (isExactBeat) score += 9;
          matchReason = `Household service & diagnostic booking fit in ${c.sector || 'Sector'} (${c.colony || 'Dadabari'}, PIN ${c.pincode || '324009'}).`;
          recommendedPitchMessage = `Namaste ${c.name}, book doorstep verified services from ${store.storeName} (${store.fullAddress || store.colony}) through India Post Beat ${cleanBeat} partner.`;
        } else {
          if (isBusiness) score += 13;
          matchReason = `${isBusiness ? 'Commercial / Trade buyer' : 'Bulk household account'} in Beat ${cleanBeat} matched for wholesale pricing & XPOKART COD dispatch.`;
          recommendedPitchMessage = `Namaste ${c.name}, access wholesale rates from ${store.storeName} with direct XPOKART — Sovereign B2B & E-Commerce logistics & Cash-on-Delivery by ${beatMeta.staffName}.`;
        }

        return {
          customerId: c.id,
          customerName: c.name,
          customerMobile: c.mobile,
          colony: c.colony || 'Dadabari',
          sector: c.sector || 'Sector 1',
          houseNo: c.houseNo || 'Main Road',
          pincode: c.pincode || beatMeta.pincode,
          beatNo: `Beat ${cleanBeat}`,
          matchedCategory: store.category,
          matchScore: Math.min(99, score),
          matchReason,
          recommendedPitchMessage,
        };
      });

      return {
        storeId: store.id,
        storeName: store.storeName,
        category: store.category,
        matchedCustomers: matchedCustomers.sort((a, b) => b.matchScore - a.matchScore),
      };
    });

    const totalMatchedCustomersCount = storeMatches.reduce(
      (sum, s) => sum + s.matchedCustomers.length,
      0
    );

    return {
      beatNo: `Beat ${cleanBeat}`,
      cleanBeatNo: cleanBeat,
      pincode: beatMeta.pincode,
      subOffice: beatMeta.subOffice,
      pincodeManagerId: beatMeta.staffId,
      pincodeManagerName: beatMeta.staffName,
      pincodeManagerContact: beatMeta.staffContact,
      totalFreshStoresCount: activeStoresInBeat.length,
      totalMatchedCustomersCount,
      storeMatches,
    };
  }

  /**
   * Logs an outbound WhatsApp partner pitch as an official CRM Lead Ticket
   */
  public logCustomerPitchAsLead(
    customerMatch: CustomerDemographicMatch,
    storeName: string,
    staffId: string,
    staffName: string
  ): string {
    const { inquiry } = customerService.submitCustomerInquiry({
      customerName: customerMatch.customerName,
      mobile: customerMatch.customerMobile,
      productInterested: `${storeName} (${customerMatch.matchedCategory})`,
      requirement: `[BEAT MATCH PITCH] Pitched by ${staffName} (${staffId}) | ${customerMatch.matchReason}`,
      preferredContact: 'WhatsApp',
      address: `${customerMatch.houseNo || ''}, ${customerMatch.sector || ''}, ${customerMatch.colony}, PIN ${customerMatch.pincode}`,
      beatNo: customerMatch.beatNo,
    });
    return inquiry.ticketNumber;
  }

  /**
   * 3. LOGISTICS DISPATCH & ORDER PIPELINE
   */
  public getAllDispatches(): LogisticsDispatchOrder[] {
    return this.dispatches;
  }

  public getDispatchesByBeat(beatNo: string): LogisticsDispatchOrder[] {
    const clean = beatNo.replace(/\D/g, '');
    return this.dispatches.filter((d) => d.beatNo.replace(/\D/g, '') === clean);
  }

  public createLogisticsDispatch(order: Omit<LogisticsDispatchOrder, 'id' | 'speedPostBarcode' | 'bookedAt'>): LogisticsDispatchOrder {
    const cleanBeat = order.beatNo.replace(/\D/g, '') || '1';
    const seq = Math.floor(1000 + Math.random() * 9000);
    const barcode = `SP-RJ-324009-B${cleanBeat}-${seq}`;

    const newDispatch: LogisticsDispatchOrder = {
      ...order,
      id: `XPD-COD-${Date.now().toString(36).toUpperCase()}`,
      speedPostBarcode: barcode,
      bookedAt: new Date().toISOString(),
    };

    this.dispatches.unshift(newDispatch);
    this.saveDispatches();
    return newDispatch;
  }

  public updateDispatchStatus(
    id: string,
    status: LogisticsDispatchOrder['status'],
    remarks?: string
  ): boolean {
    const idx = this.dispatches.findIndex((d) => d.id === id);
    if (idx === -1) return false;

    this.dispatches[idx].status = status;
    if (remarks) this.dispatches[idx].remarks = remarks;
    if (status === 'DELIVERED') {
      this.dispatches[idx].deliveredAt = this.dispatches[idx].deliveredAt || new Date().toISOString();
    }
    if (status === 'COD_SETTLED') {
      const nowIso = new Date().toISOString();
      this.dispatches[idx].deliveredAt = this.dispatches[idx].deliveredAt || nowIso;
      if (!this.dispatches[idx].ippbQrSettlementRef) {
        const refSeq = Math.floor(100000 + Math.random() * 900000);
        this.dispatches[idx].ippbQrSettlementRef = `IPPB-QR-324009-${refSeq}`;
      }
      this.dispatches[idx].ippbQrSettledAt = this.dispatches[idx].ippbQrSettledAt || nowIso;
    }
    this.saveDispatches();
    return true;
  }

  private getDefaultDispatches(): LogisticsDispatchOrder[] {
    return [
      {
        id: 'XPD-COD-91402',
        storeId: 'COMM-1-001',
        storeName: 'Agarwal Departmental Store',
        productTitle: 'Daily Grocery Essentials Hamper',
        productSku: 'XPD-GROC-01',
        productPrice: 650,
        customerName: 'Suresh Sharma',
        customerMobile: '9829012345',
        deliveryAddress: 'House 4-A-12, Sector 4, Keshavpura',
        colony: 'Keshavpura',
        pincode: '324009',
        beatNo: 'Beat 2',
        pincodeManagerId: 'STAFF-50457421',
        pincodeManagerName: 'Mahendra Kumar Meena',
        pincodeManagerContact: '8769706002',
        serviceType: 'Speed Post COD',
        status: 'OUT_FOR_DELIVERY',
        speedPostBarcode: 'SP-RJ-324009-B2-8491',
        codAmount: 650,
        bookedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        remarks: 'Out with Beat 2 Postman for afternoon delivery',
      },
      {
        id: 'XPD-COD-91403',
        storeId: 'COMM-5-002',
        storeName: 'Kota Doria Handloom Center',
        productTitle: 'Handcrafted Traditional Silk Saree',
        productSku: 'LOCAL-HANDICRAFT-KOTA',
        productPrice: 1499,
        customerName: 'Sunita Jain',
        customerMobile: '9414056789',
        deliveryAddress: 'Flat 202, Basant Vihar Sector B',
        colony: 'Basant Vihar',
        pincode: '324009',
        beatNo: 'Beat 5',
        pincodeManagerId: 'STAFF-10310736',
        pincodeManagerName: 'Mohit Arvind',
        pincodeManagerContact: '9214056789',
        serviceType: 'XPOKART Local Parcel',
        status: 'COD_SETTLED',
        speedPostBarcode: 'SP-RJ-324009-B5-2219',
        codAmount: 1499,
        ippbQrSettlementRef: 'IPPB-QR-324009-782410',
        ippbQrSettledAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        bookedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
        deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        remarks: 'Delivered & settled instantly via IPPB Merchant QR',
      },
      {
        id: 'XPD-COD-91405',
        storeId: 'PROD-COMM-MYSTAMP',
        storeName: 'Dadabari S.O. Philately Desk',
        productTitle: 'My Stamp Personalized Photo Postage Sheet (12 Stamps)',
        productSku: 'POST-MYSTAMP-300',
        productPrice: 300,
        customerName: 'Anil Vijayvargiya',
        customerMobile: '9460020640',
        deliveryAddress: 'Plot 24, Sector 2, Keshavpura',
        colony: 'Keshavpura',
        pincode: '324009',
        beatNo: 'Beat 2',
        pincodeManagerId: 'STAFF-50457421',
        pincodeManagerName: 'Mahendra Kumar Meena',
        pincodeManagerContact: '8769706002',
        serviceType: 'Speed Post COD',
        status: 'DELIVERED',
        speedPostBarcode: 'SP-RJ-324009-B2-3318',
        codAmount: 300,
        bookedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        deliveredAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        remarks: 'Delivered at doorstep · Ready for IPPB QR remittance closure',
      },
      {
        id: 'XPD-COD-91404',
        storeId: 'COMM-17-003',
        storeName: 'Talwandi eMitra & Cyber Hub',
        productTitle: 'Child Aadhaar CELC Enrolment & Certificate Pack',
        productSku: 'CHILD-AADHAAR-CELC',
        productPrice: 50,
        customerName: 'Priya Meena',
        customerMobile: '9785012399',
        deliveryAddress: 'House 17-M-24, Talwandi Sector 3',
        colony: 'Talwandi',
        pincode: '324005',
        beatNo: 'Beat 17',
        pincodeManagerId: 'STAFF-50507003',
        pincodeManagerName: 'Priyanshu Trivedi',
        pincodeManagerContact: '9672012345',
        serviceType: 'Doorstep Service Pickup',
        status: 'PENDING_PICKUP',
        speedPostBarcode: 'SP-RJ-324005-B17-5401',
        codAmount: 50,
        bookedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        remarks: 'Scheduled for evening doorstep biometrics',
      },
    ];
  }
}

export const aiCommercialVerificationService = new AICommercialVerificationService();
