import { GoogleGenAI } from '@google/genai';
import { 
  Customer, 
  Address_Exceptions, 
  AddressDiscrepancyItem, 
  AddressCorrectionSuggestion,
  AddressExceptionSeverity,
  AddressExceptionStatus,
  AddressDiscrepancyType
} from '../types/models';
import { 
  COLONY_HIERARCHY_MAP, 
  OFFICIAL_MAJOR_COLONIES, 
  resolveColonySectorDetails 
} from '../data/colonyHierarchyData';
import { CONSOLIDATED_BEAT_MATRIX, resolveAddressToConsolidatedBeat } from '../data/consolidatedBeatMatrix';
import { KOTA_POST_OFFICE_OPTIONS } from '../data/officesData';
import { UPDATED_STAFF_LIST } from '../data/updatedStaffData';
import { customerService } from './customerService';

const STORAGE_KEY_EXCEPTIONS = 'postman_address_exceptions_v1';

export interface AddressVerificationInput {
  customerId?: string;
  customerName?: string;
  customerMobile?: string;
  houseNo?: string;
  colony?: string;
  sector?: string;
  landmark?: string;
  pincode?: string;
  beatNo?: string;
  subOffice?: string;
  city?: string;
  state?: string;
  rawInput?: string;
  source?: 'MANUAL_ENTRY' | 'BULK_IMPORT' | 'CUSTOMER_PORTAL' | 'FIELD_SURVEY' | 'POSTAL_DATABASE_AUDIT' | 'DSS_AUTO_SYNC';
}

export interface AddressVerificationResult {
  isValid: boolean;
  accuracyScore: number; // 0 to 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  discrepancies: AddressDiscrepancyItem[];
  suggestedCorrection: AddressCorrectionSuggestion;
  matchedPostalRecord?: {
    officeName: string;
    beatNumber: string;
    standardColony: string;
    standardPincode: string;
    assignedStaff: string;
  };
  reasoning: string;
  modelUsed: string;
  verifiedAt: string;
  exceptionCreated?: Address_Exceptions;
}

// In Vite environment, safely access client env vars
const apiKey =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
  (typeof process !== 'undefined' && (process.env?.GEMINI_API_KEY || process.env?.API_KEY)) ||
  '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('GoogleGenAI initialization in addressVerificationService skipped:', err);
  }
}

class AddressVerificationService {
  private exceptions: Address_Exceptions[] = [];
  private listeners: Set<() => void> = new Set();
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EXCEPTIONS);
      if (stored) {
        this.exceptions = JSON.parse(stored);
      } else {
        this.seedInitialExceptions();
      }
    } catch (e) {
      console.warn('Failed to parse address exceptions from storage:', e);
      this.seedInitialExceptions();
    }
    this.initialized = true;
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY_EXCEPTIONS, JSON.stringify(this.exceptions));
      this.notify();
    } catch (e) {
      console.error('Failed to save address exceptions to storage:', e);
    }
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Exception in address verification listener:', err);
      }
    });
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  /**
   * Seed realistic initial exceptions demonstrating postal anomalies in Dadabari S.O.
   */
  private seedInitialExceptions() {
    const now = new Date().toISOString();
    this.exceptions = [
      {
        id: 'EXC-10021',
        customerId: 'UM-00002',
        customerName: 'Smt. Prem Kanwar',
        customerMobile: '9829011223',
        source: 'FIELD_SURVEY',
        originalAddress: {
          rawInput: '445, Keshavpura Sector 7, Kota 324005',
          houseNo: '445',
          colony: 'Keshavpura',
          sector: 'Sector 7',
          landmark: 'Tejaji Mandir',
          pincode: '324005', // Wrong pincode for Keshavpura (should be 324009)
          beatNo: 'Beat 5', // Wrong beat (should be Beat 2)
          subOffice: 'Vigyan Nagar SO',
          city: 'Kota',
          state: 'Rajasthan',
        },
        detectedDiscrepancies: [
          {
            type: 'PINCODE_MISMATCH',
            message: 'Keshavpura Sector 7 is under Dadabari S.O. with PIN 324009. PIN 324005 belongs to Vigyan Nagar.',
            severity: 'CRITICAL',
            field: 'pincode',
          },
          {
            type: 'BEAT_MISALLOCATION',
            message: 'Keshavpura Sector 7 is officially assigned to Beat 2 (Mahendra Kumar Meena), not Beat 5.',
            severity: 'CRITICAL',
            field: 'beatNo',
          },
        ],
        severity: 'CRITICAL',
        status: 'PENDING_REVIEW',
        suggestedCorrection: {
          correctedHouseNo: '445',
          correctedColony: 'Keshavpura',
          correctedSector: 'Sector 7',
          correctedLandmark: 'Near Tejaji Mandir',
          correctedPincode: '324009',
          correctedBeatNo: 'Beat 2',
          correctedSubOffice: 'Dadabari S.O.',
          correctedFullAddress: '445, Keshavpura Sector 7 (Near Tejaji Mandir), Dadabari S.O. - 324009',
          confidenceScore: 0.98,
          explanation: 'Standardized according to Dadabari S.O. Beat Matrix. Keshavpura is strictly 324009 and served by Beat 2.',
          geographicalReference: 'Dadabari S.O. Jurisdiction (Beat 2 - Mahendra Kumar Meena)',
        },
        aiVerificationDetails: {
          modelUsed: 'gemini-3.8-flash (Postal Geo-Intelligence Engine)',
          verifiedAt: now,
          accuracyScore: 62,
          riskLevel: 'HIGH',
          reasoning: 'Detected dual discrepancy: mismatched pincode 324005 instead of 324009, and route misallocation to Beat 5.',
          matchedPostalRecord: {
            officeName: 'Dadabari S.O.',
            beatNumber: 'Beat 2',
            standardColony: 'Keshavpura',
            standardPincode: '324009',
            assignedStaff: 'Mahendra Kumar Meena (8769706002)',
          },
        },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'EXC-10022',
        customerId: 'UM-00004',
        customerName: 'Asha Prajapati',
        customerMobile: '8290144765',
        source: 'MANUAL_ENTRY',
        originalAddress: {
          rawInput: 'Plot near Naya Gaon Nala, Santoshi Nagar',
          houseNo: '', // Missing house number
          colony: 'Santoshi Nagar',
          sector: '',
          landmark: 'Nala Road',
          pincode: '324009',
          beatNo: 'Beat 2',
          subOffice: 'Dadabari S.O.',
        },
        detectedDiscrepancies: [
          {
            type: 'MISSING_HOUSE_NUMBER',
            message: 'House / Plot number is missing from the physical address record.',
            severity: 'WARNING',
            field: 'houseNo',
          },
          {
            type: 'AMBIGUOUS_LANDMARK',
            message: 'Vague boundary description "near Nala" causes delivery failure on mobile PMA app.',
            severity: 'INFO',
            field: 'landmark',
          },
        ],
        severity: 'WARNING',
        status: 'PENDING_REVIEW',
        suggestedCorrection: {
          correctedHouseNo: 'H.No. 675',
          correctedColony: 'Santoshi Nagar',
          correctedSector: 'Main Block',
          correctedLandmark: 'Naya Gaon Road Nala Pulia',
          correctedPincode: '324009',
          correctedBeatNo: 'Beat 2',
          correctedSubOffice: 'Dadabari S.O.',
          correctedFullAddress: 'H.No. 675, Santoshi Nagar, Naya Gaon Road, Dadabari S.O. - 324009',
          confidenceScore: 0.88,
          explanation: 'Correlated with historical tenant survey entry noting H.No. 675 Santoshi Nagar.',
          geographicalReference: 'Beat 2 Field Survey Register',
        },
        aiVerificationDetails: {
          modelUsed: 'gemini-3.8-flash (Postal Geo-Intelligence Engine)',
          verifiedAt: now,
          accuracyScore: 74,
          riskLevel: 'MEDIUM',
          reasoning: 'Missing house number flags delivery uncertainty for postman doorstep delivery.',
          matchedPostalRecord: {
            officeName: 'Dadabari S.O.',
            beatNumber: 'Beat 2',
            standardColony: 'Santoshi Nagar',
            standardPincode: '324009',
            assignedStaff: 'Mahendra Kumar Meena (8769706002)',
          },
        },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'EXC-10023',
        customerName: 'Dinesh Kumar Sharma',
        customerMobile: '9414155667',
        source: 'BULK_IMPORT',
        originalAddress: {
          rawInput: 'B-12, Talwandi Sector A, Kota 324009',
          houseNo: 'B-12',
          colony: 'Talwandi',
          sector: 'Sector A',
          landmark: 'Commerce College',
          pincode: '324009', // Wrong pincode (Talwandi is 324005)
          beatNo: 'Beat 2', // Wrong beat (Talwandi is Beat 4)
          subOffice: 'Dadabari S.O.',
        },
        detectedDiscrepancies: [
          {
            type: 'PINCODE_MISMATCH',
            message: 'Talwandi Sector A is served by Talwandi S.O. under PIN 324005, not Dadabari 324009.',
            severity: 'CRITICAL',
            field: 'pincode',
          },
          {
            type: 'BEAT_MISALLOCATION',
            message: 'Talwandi delivery zone belongs to Beat 4, not Beat 2.',
            severity: 'CRITICAL',
            field: 'beatNo',
          },
        ],
        severity: 'CRITICAL',
        status: 'PENDING_REVIEW',
        suggestedCorrection: {
          correctedHouseNo: 'B-12',
          correctedColony: 'Talwandi',
          correctedSector: 'Sector A',
          correctedLandmark: 'Commerce College Road',
          correctedPincode: '324005',
          correctedBeatNo: 'Beat 4',
          correctedSubOffice: 'Talwandi S.O.',
          correctedFullAddress: 'B-12, Sector A, Talwandi (Near Commerce College Road), Talwandi S.O. - 324005',
          confidenceScore: 0.96,
          explanation: 'Official postal mapping: Talwandi Sector A falls under Talwandi S.O. (324005), Beat 4.',
          geographicalReference: 'Talwandi Postal Sub-Division Matrix',
        },
        aiVerificationDetails: {
          modelUsed: 'gemini-3.8-flash (Postal Geo-Intelligence Engine)',
          verifiedAt: now,
          accuracyScore: 58,
          riskLevel: 'HIGH',
          reasoning: 'Cross-divisional pincode and beat allocation error.',
          matchedPostalRecord: {
            officeName: 'Talwandi S.O.',
            beatNumber: 'Beat 4',
            standardColony: 'Talwandi',
            standardPincode: '324005',
            assignedStaff: 'Beat 4 Staff',
          },
        },
        createdAt: now,
        updatedAt: now,
      },
    ];
    this.persist();
  }

  /**
   * Helper: Normalize colony name fuzzy search
   */
  public normalizeColonyName(rawName: string): { standardName: string; confidence: number } | null {
    if (!rawName) return null;
    const clean = rawName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const official of OFFICIAL_MAJOR_COLONIES) {
      const cleanOfficial = official.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean === cleanOfficial) return { standardName: official, confidence: 1.0 };
      if (cleanOfficial.includes(clean) || clean.includes(cleanOfficial)) {
        return { standardName: official, confidence: 0.85 };
      }
    }

    // Common synonyms and phonetic matches in Kota
    const synonyms: Record<string, string> = {
      keshavpur: 'Keshavpura',
      keshavpura: 'Keshavpura',
      keshvpur: 'Keshavpura',
      keshvpura: 'Keshavpura',
      dadabaree: 'Dadabari',
      dadabadi: 'Dadabari',
      dadabari: 'Dadabari',
      mahavirnagar: 'Mahaveer Nagar',
      mahaveernagar: 'Mahaveer Nagar',
      talwandi: 'Talwandi',
      talbandi: 'Talwandi',
      vigyannagar: 'Vigyan Nagar',
      vigyan: 'Vigyan Nagar',
      santoshinagar: 'Santoshi Nagar',
      santoshi: 'Santoshi Nagar',
      shrinathpuram: 'Shreenathpuram',
      srinathpuram: 'Shreenathpuram',
      swamivivekanand: 'Swami Vivekanand Nagar',
      svnagar: 'Swami Vivekanand Nagar',
      rangbari: 'Rangbari',
      rangbadi: 'Rangbari',
      borkheda: 'Borkhera',
      borkhera: 'Borkhera',
      kunhari: 'Kunhari',
      jawaharnagar: 'Jawahar Nagar',
    };

    if (synonyms[clean]) {
      return { standardName: synonyms[clean], confidence: 0.92 };
    }

    return null;
  }

  /**
   * AI Address Verification Core Engine
   * Evaluates address against geographical boundaries & postal records.
   */
  public async verifyAddress(
    input: AddressVerificationInput,
    options?: { recordExceptionIfFlawed?: boolean; manualNotes?: string }
  ): Promise<AddressVerificationResult> {
    const now = new Date().toISOString();
    const discrepancies: AddressDiscrepancyItem[] = [];

    // Extract input fields
    const rawInput = input.rawInput || '';
    const houseNo = (input.houseNo || '').trim();
    const colonyInput = (input.colony || '').trim();
    const sectorInput = (input.sector || '').trim();
    const landmarkInput = (input.landmark || '').trim();
    const pincodeInput = (input.pincode || '').trim();
    const beatNoInput = (input.beatNo || '').trim();
    const subOfficeInput = (input.subOffice || '').trim();

    // 1. Colony Geocoding & Fuzzy Identification
    const matchedColonyObj = this.normalizeColonyName(colonyInput);
    const standardColony = matchedColonyObj?.standardName || colonyInput;
    const colonyMatched = !!matchedColonyObj;

    if (!colonyMatched && colonyInput) {
      discrepancies.push({
        type: 'COLONY_NOT_FOUND',
        message: `Colony "${colonyInput}" could not be verified in the 25 official Kota Master Beat colonies.`,
        severity: 'WARNING',
        field: 'colony',
      });
    } else if (matchedColonyObj && matchedColonyObj.confidence < 1.0) {
      discrepancies.push({
        type: 'SPELLING_ANOMALY',
        message: `Colony spelling "${colonyInput}" automatically matched to official postal standard "${standardColony}".`,
        severity: 'INFO',
        field: 'colony',
      });
    }

    // 2. Postal Hierarchy Lookup
    const hierarchyEntry =
      COLONY_HIERARCHY_MAP[standardColony] ||
      Object.values(COLONY_HIERARCHY_MAP).find(
        (c) => c.name.toLowerCase() === standardColony.toLowerCase()
      );

    // Standard baseline values for this colony
    let expectedPincode = hierarchyEntry?.defaultPincode || '324009';
    let expectedOffice = hierarchyEntry?.defaultSubOffice || 'Dadabari S.O.';
    let expectedBeat = hierarchyEntry?.defaultBeatNo || 'Beat 2';
    let assignedStaffName = hierarchyEntry?.defaultStaffName || 'Mahendra Kumar Meena';

    // 3. Sector Check
    let validSector = false;
    let expectedSectorName = sectorInput;
    if (hierarchyEntry) {
      if (hierarchyEntry.sectors && hierarchyEntry.sectors.length > 0) {
        const foundSec = hierarchyEntry.sectors.find(
          (s) =>
            s.name.toLowerCase() === sectorInput.toLowerCase() ||
            s.name.toLowerCase().replace(/[^a-z0-9]/g, '') === sectorInput.toLowerCase().replace(/[^a-z0-9]/g, '')
        );
        if (foundSec) {
          validSector = true;
          expectedBeat = foundSec.beatNo;
          expectedPincode = foundSec.pincode;
          expectedOffice = foundSec.subOffice;
          assignedStaffName = foundSec.staffName;
        } else if (sectorInput && sectorInput !== 'Not Applicable / Not Available') {
          discrepancies.push({
            type: 'SECTOR_MISMATCH',
            message: `Sector "${sectorInput}" is not an officially recognized sector for ${standardColony}. Valid sectors: ${hierarchyEntry.sectors
              .map((s) => s.name)
              .join(', ')}.`,
            severity: 'WARNING',
            field: 'sector',
          });
        }
      }
    }

    // 4. Consolidated Beat Matrix Fallback Check
    const matrixMatch = resolveAddressToConsolidatedBeat(
      `${standardColony} ${sectorInput} ${landmarkInput} ${rawInput}`,
      pincodeInput || expectedPincode
    );
    if (matrixMatch) {
      expectedBeat = matrixMatch.beatNumber;
      expectedPincode = matrixMatch.pincode;
      expectedOffice = matrixMatch.officeName;
      assignedStaffName = matrixMatch.assignedPostmanName;
    }

    // 5. Pincode Validation
    const cleanPin = pincodeInput.replace(/\D/g, '');
    if (!cleanPin) {
      discrepancies.push({
        type: 'INVALID_PINCODE',
        message: 'Postal Index Number (Pincode) is missing.',
        severity: 'CRITICAL',
        field: 'pincode',
      });
    } else if (cleanPin.length !== 6) {
      discrepancies.push({
        type: 'INVALID_PINCODE',
        message: `Pincode "${pincodeInput}" is invalid. Indian postal codes must be exactly 6 numeric digits.`,
        severity: 'CRITICAL',
        field: 'pincode',
      });
    } else if (!cleanPin.startsWith('324')) {
      discrepancies.push({
        type: 'OUT_OF_DELIVERY_JURISDICTION',
        message: `Pincode "${cleanPin}" is outside Kota Postal Division (324XXX).`,
        severity: 'CRITICAL',
        field: 'pincode',
      });
    } else if (cleanPin !== expectedPincode) {
      discrepancies.push({
        type: 'PINCODE_MISMATCH',
        message: `Pincode mismatch: Entered ${cleanPin}, but ${standardColony} ${sectorInput ? `(${sectorInput})` : ''} officially belongs to ${expectedOffice} with PIN ${expectedPincode}.`,
        severity: 'CRITICAL',
        field: 'pincode',
      });
    }

    // 6. Beat Allocation Check
    if (beatNoInput) {
      const cleanInputBeat = beatNoInput.replace(/^Beat\s+/i, '').trim();
      const cleanExpectedBeat = expectedBeat.replace(/^Beat\s+/i, '').trim();
      if (cleanInputBeat !== cleanExpectedBeat) {
        discrepancies.push({
          type: 'BEAT_MISALLOCATION',
          message: `Beat misallocation: Entered ${beatNoInput}, but ${standardColony} ${sectorInput} is assigned to ${expectedBeat} (${assignedStaffName}).`,
          severity: 'CRITICAL',
          field: 'beatNo',
        });
      }
    }

    // 7. House Number Check
    if (!houseNo || houseNo.toLowerCase() === 'na' || houseNo.toLowerCase() === 'none') {
      discrepancies.push({
        type: 'MISSING_HOUSE_NUMBER',
        message: 'House / Plot / Unit Number is missing or incomplete, preventing door-to-door delivery.',
        severity: 'WARNING',
        field: 'houseNo',
      });
    }

    // 8. Incomplete Address Check
    if (!colonyInput && !rawInput) {
      discrepancies.push({
        type: 'INCOMPLETE_ADDRESS',
        message: 'Colony name and address lines are empty.',
        severity: 'CRITICAL',
        field: 'fullAddress',
      });
    }

    // Calculate baseline Accuracy Score & Risk
    let score = 100;
    for (const d of discrepancies) {
      if (d.severity === 'CRITICAL') score -= 22;
      else if (d.severity === 'WARNING') score -= 12;
      else score -= 5;
    }
    score = Math.max(15, Math.min(100, score));

    const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' =
      score >= 88 ? 'LOW' : score >= 70 ? 'MEDIUM' : score >= 50 ? 'HIGH' : 'CRITICAL';

    // Construct standard suggestion
    const correctedHouseNo = houseNo || 'Plot Unit';
    const correctedColony = standardColony || 'Keshavpura';
    const correctedSector = sectorInput || (hierarchyEntry?.sectors?.[0]?.name) || 'Sector 7';
    const correctedLandmark = landmarkInput ? `Near ${landmarkInput.replace(/^Near\s+/i, '')}` : '';
    const correctedFullAddress = `${correctedHouseNo}, ${correctedSector}, ${correctedColony}${
      correctedLandmark ? ` (${correctedLandmark})` : ''
    }, ${expectedOffice} - ${expectedPincode}`;

    let confidence = 0.95;
    if (!colonyMatched) confidence -= 0.15;
    if (!houseNo) confidence -= 0.10;
    if (discrepancies.some((d) => d.type === 'PINCODE_MISMATCH')) confidence -= 0.05;

    let explanation = `Reconciled with official Department of Posts Kota Master Beat Matrix. ${standardColony} maps to ${expectedOffice} (PIN ${expectedPincode}), assigned to ${expectedBeat} (${assignedStaffName}).`;

    // 9. Optional Gemini 3.8 Flash AI Model Evaluation for Enhanced Nuance
    let modelNameUsed = 'Postal Geo-Intelligence Engine (Rules + Hierarchy)';
    if (aiClient && (rawInput || discrepancies.length > 0)) {
      try {
        const aiPrompt = `You are the Lead Postal Address AI Verification System for Department of Posts, Kota Division (Dadabari S.O., PIN 324009).
Analyze the following Indian address:
Raw Input: "${rawInput}"
House No: "${houseNo}"
Colony: "${colonyInput}"
Sector: "${sectorInput}"
Landmark: "${landmarkInput}"
Pincode: "${pincodeInput}"
Beat: "${beatNoInput}"

Postal Master Benchmarks:
Official Colony: ${standardColony}
Official Pincode: ${expectedPincode}
Official Sub-Office: ${expectedOffice}
Official Beat: ${expectedBeat}
Assigned Postman: ${assignedStaffName}

Task:
1. Detect any spelling errors, missing house numbers, or jurisdictional errors.
2. Provide a 1-sentence explanation of the recommended standard correction.
3. Suggest the clean, standardized full delivery address string.

Output valid JSON only with keys:
{
  "explanation": "...",
  "suggestedFullAddress": "...",
  "confidenceScore": 0.95
}`;
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: aiPrompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        const parsed = JSON.parse(response.text || '{}');
        if (parsed.explanation) {
          explanation = parsed.explanation;
          modelNameUsed = 'gemini-3.8-flash (AI Postal Semantic Parser)';
        }
        if (parsed.confidenceScore && typeof parsed.confidenceScore === 'number') {
          confidence = Math.max(0.6, Math.min(0.99, parsed.confidenceScore));
        }
      } catch (geminiErr) {
        console.warn('Gemini AI postal analysis fallback to deterministic engine:', geminiErr);
      }
    }

    const suggestedCorrection: AddressCorrectionSuggestion = {
      correctedHouseNo,
      correctedColony,
      correctedSector,
      correctedLandmark: landmarkInput,
      correctedPincode: expectedPincode,
      correctedBeatNo: expectedBeat,
      correctedSubOffice: expectedOffice,
      correctedFullAddress,
      confidenceScore: Math.round(confidence * 100) / 100,
      explanation,
      geographicalReference: `${expectedOffice} Division Matrix • ${expectedBeat} (${assignedStaffName})`,
    };

    let createdException: Address_Exceptions | undefined;

    // Record exception in repository if issues detected or explicitly requested
    const shouldRecord =
      options?.recordExceptionIfFlawed !== false &&
      (discrepancies.length > 0 || score < 90 || options?.recordExceptionIfFlawed === true);

    if (shouldRecord) {
      const highestSeverity: AddressExceptionSeverity = discrepancies.some(
        (d) => d.severity === 'CRITICAL'
      )
        ? 'CRITICAL'
        : discrepancies.some((d) => d.severity === 'WARNING')
        ? 'WARNING'
        : 'INFO';

      const excId = `EXC-${Math.floor(10000 + Math.random() * 90000)}`;
      createdException = {
        id: excId,
        customerId: input.customerId,
        customerName: input.customerName || (input.customerId ? customerService.getCustomerById(input.customerId)?.name : undefined),
        customerMobile: input.customerMobile || (input.customerId ? customerService.getCustomerById(input.customerId)?.mobile : undefined),
        source: input.source || 'MANUAL_ENTRY',
        originalAddress: {
          rawInput: rawInput || undefined,
          houseNo: houseNo || undefined,
          colony: colonyInput || undefined,
          sector: sectorInput || undefined,
          landmark: landmarkInput || undefined,
          pincode: pincodeInput || undefined,
          beatNo: beatNoInput || undefined,
          subOffice: subOfficeInput || undefined,
          city: input.city || 'Kota',
          state: input.state || 'Rajasthan',
        },
        detectedDiscrepancies: discrepancies,
        severity: highestSeverity,
        status: 'PENDING_REVIEW',
        suggestedCorrection,
        aiVerificationDetails: {
          modelUsed: modelNameUsed,
          verifiedAt: now,
          accuracyScore: score,
          riskLevel,
          reasoning: explanation,
          matchedPostalRecord: {
            officeName: expectedOffice,
            beatNumber: expectedBeat,
            standardColony,
            standardPincode: expectedPincode,
            assignedStaff: assignedStaffName,
          },
        },
        manualReviewNotes: options?.manualNotes,
        createdAt: now,
        updatedAt: now,
      };

      // Add to exceptions array and persist
      this.exceptions.unshift(createdException);
      this.persist();

      // If customer exists, link exception and accuracy score
      if (input.customerId) {
        const existingCust = customerService.getCustomerById(input.customerId);
        if (existingCust) {
          customerService.addOrUpdateCustomer(
            {
              id: existingCust.id,
              addressExceptionId: excId,
              addressAccuracyScore: score,
              addressVerifiedAt: now,
              addressIssuesCount: discrepancies.length,
            },
            'AI Address Verification Service'
          );
        }
      }
    }

    return {
      isValid: discrepancies.length === 0,
      accuracyScore: score,
      riskLevel,
      discrepancies,
      suggestedCorrection,
      matchedPostalRecord: {
        officeName: expectedOffice,
        beatNumber: expectedBeat,
        standardColony,
        standardPincode: expectedPincode,
        assignedStaff: assignedStaffName,
      },
      reasoning: explanation,
      modelUsed: modelNameUsed,
      verifiedAt: now,
      exceptionCreated: createdException,
    };
  }

  /**
   * Get all Address_Exceptions records
   */
  public getAllExceptions(filters?: {
    status?: AddressExceptionStatus | 'ALL';
    severity?: AddressExceptionSeverity | 'ALL';
    beatNo?: string;
    searchTerm?: string;
  }): Address_Exceptions[] {
    let result = [...this.exceptions];

    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter((e) => e.status === filters.status);
    }
    if (filters?.severity && filters.severity !== 'ALL') {
      result = result.filter((e) => e.severity === filters.severity);
    }
    if (filters?.beatNo && filters.beatNo !== 'ALL') {
      const b = filters.beatNo.toLowerCase().replace(/^beat\s*/i, '');
      result = result.filter(
        (e) =>
          (e.suggestedCorrection.correctedBeatNo || '').toLowerCase().includes(b) ||
          (e.originalAddress.beatNo || '').toLowerCase().includes(b)
      );
    }
    if (filters?.searchTerm) {
      const q = filters.searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          (e.customerName || '').toLowerCase().includes(q) ||
          (e.customerMobile || '').includes(q) ||
          (e.originalAddress.colony || '').toLowerCase().includes(q) ||
          (e.originalAddress.rawInput || '').toLowerCase().includes(q) ||
          (e.suggestedCorrection.correctedFullAddress || '').toLowerCase().includes(q)
      );
    }

    return result;
  }

  public getExceptionById(id: string): Address_Exceptions | undefined {
    return this.exceptions.find((e) => e.id === id);
  }

  /**
   * Resolve an Address_Exceptions record and non-destructively apply corrections to the Customer Master
   */
  public resolveException(
    exceptionId: string,
    action: 'APPLY_SUGGESTION' | 'MANUAL_CORRECTION',
    customChanges?: Partial<AddressCorrectionSuggestion>,
    reviewNotes?: string,
    reviewerName: string = 'Staff Auditor'
  ): { success: boolean; message: string; updatedException?: Address_Exceptions } {
    const index = this.exceptions.findIndex((e) => e.id === exceptionId);
    if (index === -1) {
      return { success: false, message: 'Exception record not found' };
    }

    const exc = this.exceptions[index];
    const now = new Date().toISOString();

    const correctionToApply = {
      ...exc.suggestedCorrection,
      ...(customChanges || {}),
    };

    exc.status = action === 'APPLY_SUGGESTION' ? 'AUTO_CORRECTED' : 'MANUALLY_RESOLVED';
    exc.appliedCorrection = correctionToApply;
    exc.manualReviewNotes = reviewNotes || exc.manualReviewNotes;
    exc.reviewedBy = reviewerName;
    exc.reviewedAt = now;
    exc.updatedAt = now;

    // Apply non-destructive updates to the Customer entity if linked
    if (exc.customerId) {
      const cust = customerService.getCustomerById(exc.customerId);
      if (cust) {
        const cleanBeat = (correctionToApply.correctedBeatNo || 'Beat 2').replace(/^Beat\s+/i, '');
        const updatedCustomer: Partial<Customer> = {
          id: cust.id,
          houseNo: correctionToApply.correctedHouseNo || cust.houseNo,
          colony: correctionToApply.correctedColony || cust.colony,
          area: correctionToApply.correctedColony || cust.area,
          sector: correctionToApply.correctedSector || cust.sector,
          sectorLocality: correctionToApply.correctedSector || cust.sectorLocality,
          landmark: correctionToApply.correctedLandmark || cust.landmark,
          pincode: correctionToApply.correctedPincode || cust.pincode,
          beatNo: cleanBeat,
          subOfficeMapping: correctionToApply.correctedSubOffice || cust.subOfficeMapping,
          verificationStatus: 'Field Confirmed',
          addressAccuracyScore: 98,
          addressVerifiedAt: now,
          addressIssuesCount: 0,
          addressExceptionId: undefined, // Cleared active exception
          address: {
            ...cust.address,
            houseNo: correctionToApply.correctedHouseNo || cust.address?.houseNo,
            houseNumber: correctionToApply.correctedHouseNo || cust.address?.houseNumber,
            colony: correctionToApply.correctedColony || cust.address?.colony,
            area: correctionToApply.correctedColony || cust.address?.area,
            sector: correctionToApply.correctedSector || cust.address?.sector,
            landmark: correctionToApply.correctedLandmark || cust.address?.landmark,
            pincode: correctionToApply.correctedPincode || cust.address?.pincode,
            fullAddress: correctionToApply.correctedFullAddress || cust.address?.fullAddress,
          },
        };

        customerService.addOrUpdateCustomer(
          updatedCustomer,
          `Address_Exceptions Resolution Engine (${exc.id} by ${reviewerName})`
        );
      }
    }

    this.persist();
    return {
      success: true,
      message: `Exception ${exc.id} resolved and address standardized successfully!`,
      updatedException: exc,
    };
  }

  /**
   * Reject or dismiss an Address_Exceptions entry
   */
  public rejectException(
    exceptionId: string,
    reason: string,
    reviewerName: string = 'Staff Auditor'
  ): { success: boolean; message: string } {
    const exc = this.getExceptionById(exceptionId);
    if (!exc) return { success: false, message: 'Exception record not found' };

    exc.status = 'REJECTED';
    exc.manualReviewNotes = reason;
    exc.reviewedBy = reviewerName;
    exc.reviewedAt = new Date().toISOString();
    exc.updatedAt = new Date().toISOString();

    if (exc.customerId) {
      const cust = customerService.getCustomerById(exc.customerId);
      if (cust) {
        customerService.addOrUpdateCustomer(
          {
            id: cust.id,
            addressExceptionId: undefined,
          },
          `Address_Exceptions Dismissed (${exc.id})`
        );
      }
    }

    this.persist();
    return { success: true, message: `Exception ${exc.id} rejected and dismissed.` };
  }

  /**
   * Auto-fix all pending exceptions with confidence score >= threshold (e.g. 0.90)
   */
  public autoFixAllHighConfidence(
    minConfidence: number = 0.90,
    reviewerName: string = 'AI Auto-Standardization Engine'
  ): { count: number; resolvedIds: string[] } {
    const pending = this.exceptions.filter(
      (e) => e.status === 'PENDING_REVIEW' && e.suggestedCorrection.confidenceScore >= minConfidence
    );

    const resolvedIds: string[] = [];
    for (const exc of pending) {
      this.resolveException(exc.id, 'APPLY_SUGGESTION', undefined, 'Auto-approved due to high AI confidence (>90%)', reviewerName);
      resolvedIds.push(exc.id);
    }

    return { count: resolvedIds.length, resolvedIds };
  }

  /**
   * Run a Batch Postal Address Audit across all Customer records in the CRM database
   */
  public async batchAuditAllCustomers(): Promise<{
    totalAudited: number;
    passedClean: number;
    exceptionsCreated: number;
    averageScore: number;
  }> {
    const customers = customerService.getCustomers();
    let passedClean = 0;
    let exceptionsCreated = 0;
    let totalScore = 0;

    for (const c of customers) {
      const input: AddressVerificationInput = {
        customerId: c.id,
        customerName: c.name,
        customerMobile: c.mobile,
        houseNo: c.houseNo || c.address?.houseNo || c.address?.houseNumber,
        colony: c.colony || c.area || c.address?.colony || c.address?.area,
        sector: c.sector || c.address?.sector || c.address?.sectorLocality,
        landmark: c.landmark || c.address?.landmark,
        pincode: c.pincode || c.address?.pincode,
        beatNo: c.beatNo,
        subOffice: c.subOfficeMapping,
        rawInput: c.address?.fullAddress,
        source: 'POSTAL_DATABASE_AUDIT',
      };

      const result = await this.verifyAddress(input, { recordExceptionIfFlawed: true });
      totalScore += result.accuracyScore;

      if (result.isValid && result.accuracyScore >= 90) {
        passedClean++;
      } else {
        exceptionsCreated++;
      }
    }

    const averageScore = customers.length > 0 ? Math.round(totalScore / customers.length) : 100;
    return {
      totalAudited: customers.length,
      passedClean,
      exceptionsCreated,
      averageScore,
    };
  }

  /**
   * Get operational statistics for the Address_Exceptions entity
   */
  public getExceptionStats() {
    const total = this.exceptions.length;
    const pending = this.exceptions.filter((e) => e.status === 'PENDING_REVIEW').length;
    const autoCorrected = this.exceptions.filter((e) => e.status === 'AUTO_CORRECTED').length;
    const manuallyResolved = this.exceptions.filter((e) => e.status === 'MANUALLY_RESOLVED').length;
    const rejected = this.exceptions.filter((e) => e.status === 'REJECTED').length;

    const criticalCount = this.exceptions.filter(
      (e) => e.severity === 'CRITICAL' && e.status === 'PENDING_REVIEW'
    ).length;
    const warningCount = this.exceptions.filter(
      (e) => e.severity === 'WARNING' && e.status === 'PENDING_REVIEW'
    ).length;
    const infoCount = this.exceptions.filter(
      (e) => e.severity === 'INFO' && e.status === 'PENDING_REVIEW'
    ).length;

    const discrepancyCounts: Record<string, number> = {};
    for (const exc of this.exceptions) {
      for (const d of exc.detectedDiscrepancies) {
        discrepancyCounts[d.type] = (discrepancyCounts[d.type] || 0) + 1;
      }
    }

    return {
      total,
      pending,
      resolved: autoCorrected + manuallyResolved,
      rejected,
      criticalCount,
      warningCount,
      infoCount,
      discrepancyCounts,
    };
  }

  /**
   * Reset / re-seed exceptions (for testing or re-audits)
   */
  public resetExceptions() {
    this.seedInitialExceptions();
  }
}

export const addressVerificationService = new AddressVerificationService();
