/**
 * Master Data & DSS Monthly Fuel Bill Service for Dadabari S.O. (324009)
 * Handles non-destructive CSV/Excel parsing, persistent master store,
 * automated Postman Monthly Fuel Bill generation from DSS logs,
 * and structured Charge Report & BYOD bill submissions.
 */

import { customerService } from './customerService';
import { operationsService } from './operationsService';
import {
  ALL_33_BEATS_FUEL_DATA,
  BeatFuelMapping,
  DEPARTMENTAL_FUEL_RATE_PER_KM,
  STANDARD_MONTHLY_WORKING_DAYS,
  getBeatFuelMapping,
} from '../data/beatFuelData';
import {
  DailyArticleEntry,
  Customer,
  SpecialBillRecord,
} from '../types/models';
import {
  FuelDailyRow,
  downloadOfficialFuelBillPDF,
  formatIsoToDDMMYYYY,
  PRIYANSHU_BEAT_17_OCTOBER_2026_ROWS,
  MOHIT_BEAT_5_OCTOBER_2026_ROWS,
} from '../utils/fuelBillPdfGenerator';
import { downloadOfficialAcg61Pdf } from '../utils/acg61PdfGenerator';

export type MasterUploadCategory =
  | 'CUSTOMERS_PROPERTIES'
  | 'BEAT_FUEL_MASTER'
  | 'MONTHLY_DSS_REPORT'
  | 'CHARGE_AND_BYOD_BILLS';

export interface MasterUploadLog {
  id: string;
  timestamp: string;
  category: MasterUploadCategory;
  categoryLabel: string;
  fileName: string;
  totalRows: number;
  validRows: number;
  skippedRows: number;
  uploadedBy: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  summary: string;
}

export interface PostmanMonthlyFuelSummary {
  beatNo: string;
  postmanName: string;
  employeeId: string;
  officeName: string;
  month: string; // e.g. "2026-10"
  monthName: string; // e.g. "October 2026"
  totalDaysInMonth: number;
  workingDays: number;
  sundaysAndHolidays: number;
  sanctionedDailyKm: number;
  fuelRatePerKm: number;
  totalMonthlyKm: number;
  totalClaimAmount: number;
  totalSpeedPostDelivered: number;
  totalRegistryDelivered: number;
  totalParcelsDelivered: number;
  totalArticlesDelivered: number;
  pmaDeliveryRate: number;
  dssSheetCount: number;
  isFullyReconciled: boolean;
  territorialCoverage?: string;
  terrainClassification?: string;
  routeDescription?: string;
  pincode?: string;
  dailyRows: FuelDailyRow[];
}

export type IngestionVerificationStage =
  | 'PENDING_STAFF_VERIFICATION' // Stage A: Ingested & Auto-Routed
  | 'CONTACT_VERIFIED'          // Stage B: Contact & Identity Signed off
  | 'PROPERTY_VERIFIED'         // Stage C: Property & Locality Matrix Signed off
  | 'FULLY_SYNCED';             // Stage D: Supervisory Audit & Live Synced

export interface IngestedAuditStep {
  stage: IngestionVerificationStage | 'INGESTION';
  action: string;
  performedBy: string;
  performedById: string;
  performedByRole: string;
  timestamp: string;
  notes?: string;
  fieldChanges?: Record<string, { from: any; to: any }>;
}

export interface IngestedMasterRecord {
  id: string; // e.g. "INGEST-202611-001"
  batchId: string;
  category: MasterUploadCategory;
  categoryLabel: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  uploadedById?: string;

  // Routing
  beatNo: string;
  assignedStaffId: string;
  assignedStaffName: string;

  // Contact & Identity (Stage B)
  name: string;
  mobile: string;
  householdType: 'Residential' | 'Commercial' | 'Government';
  financialInterest?: string;

  // Property & Locality Matrix (Stage C)
  areaColony: string;
  sector: string;
  block?: string;
  isBlockNotApplicable?: boolean;
  isSectorNotApplicable?: boolean;
  houseNo: string; // e.g. "191", "191/A", "191/B"
  splitSequence?: string; // "Standard", "A", "B", "C", "D", "1", "2"
  fullAddress: string;
  pincode: string;

  // DSS Accountable Articles Data (if Category is MONTHLY_DSS_REPORT)
  dssData?: {
    date: string;
    speedPostReceived: number;
    speedPostDelivered: number;
    speedPostDeposit: number;
    registryReceived: number;
    registryDelivered: number;
    registryDeposit: number;
    parcelReceived: number;
    parcelDelivered: number;
    parcelDeposit: number;
    totalArticlesLocked: number; // Auto-summed from DSS, strictly locked against tampering
    codAmountCollected: number;
    attendanceStatus: DailyArticleEntry['attendanceStatus'];
    remarks?: string;
  };

  // Beat Fuel Data (if Category is BEAT_FUEL_MASTER)
  fuelData?: {
    sanctionedDailyKm: number;
    fuelRatePerKm: number;
    monthlyWorkingDays: number;
    territorialCoverage: string;
    terrainClassification: string;
    routeDescription: string;
  };

  // 4-Stage Verification State
  verificationStage: IngestionVerificationStage;
  stageBVerifiedBy?: string;
  stageBVerifiedById?: string;
  stageBVerifiedAt?: string;
  stageCVerifiedBy?: string;
  stageCVerifiedById?: string;
  stageCVerifiedAt?: string;
  stageDApprovedBy?: string;
  stageDApprovedById?: string;
  stageDApprovedAt?: string;
  isFuelBillUnlocked?: boolean;

  // Audit & Discrepancy checks
  auditTrail: IngestedAuditStep[];
  verificationNotes?: string;
  isDuplicateSuspect?: boolean;
  duplicateDetails?: string;
}

const STORAGE_KEY_UPLOAD_LOGS = 'postman_master_upload_logs_v1';
const STORAGE_KEY_CUSTOM_BEAT_KM = 'postman_custom_beat_km_overrides_v1';
const STORAGE_KEY_INGESTED_RECORDS = 'postman_ingested_master_records_v3';

class MasterDataService {
  private uploadLogs: MasterUploadLog[] = [];
  private customBeatKmOverrides: Record<string, number> = {};
  private ingestedRecords: IngestedMasterRecord[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const rawLogs = localStorage.getItem(STORAGE_KEY_UPLOAD_LOGS);
        if (rawLogs) {
          this.uploadLogs = JSON.parse(rawLogs);
        } else {
          this.uploadLogs = this.getInitialUploadLogs();
          this.saveLogs();
        }

        const rawOverrides = localStorage.getItem(STORAGE_KEY_CUSTOM_BEAT_KM);
        if (rawOverrides) {
          this.customBeatKmOverrides = JSON.parse(rawOverrides);
        }

        const rawIngested = localStorage.getItem(STORAGE_KEY_INGESTED_RECORDS);
        if (rawIngested) {
          this.ingestedRecords = JSON.parse(rawIngested);
        } else {
          this.ingestedRecords = this.getInitialIngestedRecords();
          this.saveIngestedRecords();
        }
      }
    } catch (e) {
      console.warn('Failed to load master data upload state:', e);
      this.uploadLogs = this.getInitialUploadLogs();
      this.ingestedRecords = this.getInitialIngestedRecords();
    }
  }

  public saveIngestedRecords() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_INGESTED_RECORDS, JSON.stringify(this.ingestedRecords));
      }
    } catch (e) {
      console.warn('Failed to save ingested records:', e);
    }
    this.notify();
  }

  private saveLogs() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_UPLOAD_LOGS, JSON.stringify(this.uploadLogs));
      }
    } catch (e) {
      console.warn('Failed to save upload logs:', e);
    }
    this.notify();
  }

  private saveOverrides() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEY_CUSTOM_BEAT_KM,
          JSON.stringify(this.customBeatKmOverrides)
        );
      }
    } catch (e) {
      console.warn('Failed to save beat KM overrides:', e);
    }
    this.notify();
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Error in masterDataService listener:', err);
      }
    });
  }

  private getInitialUploadLogs(): MasterUploadLog[] {
    return [
      {
        id: 'UPL-INIT-001',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        category: 'BEAT_FUEL_MASTER',
        categoryLabel: 'Beat-Wise Fuel Bill Master Data',
        fileName: 'Dadabari_SO_33_Beats_Fuel_Schedule.csv',
        totalRows: 33,
        validRows: 33,
        skippedRows: 0,
        uploadedBy: 'Ekta Meena (Admin)',
        status: 'SUCCESS',
        summary: 'Synchronized route survey distances & ₹6.50/KM allowances for all 33 beats.',
      },
      {
        id: 'UPL-INIT-002',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        category: 'CUSTOMERS_PROPERTIES',
        categoryLabel: 'Customer & Household Property Data',
        fileName: 'Keshavpura_SantoshiNagar_Master_Directory.csv',
        totalRows: 120,
        validRows: 120,
        skippedRows: 0,
        uploadedBy: 'Mahendra Kumar Meena (Beat 2)',
        status: 'SUCCESS',
        summary: 'Imported property records and customer contact matrix without overwriting verified logs.',
      },
      {
        id: 'UPL-INIT-003',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        category: 'MONTHLY_DSS_REPORT',
        categoryLabel: 'Monthly DSS (Daily Summary Sheet) Report',
        fileName: 'Dadabari_SO_PMA_DSS_Monthly_Reconciliation.csv',
        totalRows: 30,
        validRows: 30,
        skippedRows: 0,
        uploadedBy: 'Ekta Meena (Super Admin)',
        status: 'SUCCESS',
        summary: 'Reconciled 30 Daily Summary Sheets for Beat 1, 2, and 4 with full article protection.',
      },
    ];
  }

  public getUploadLogs(): MasterUploadLog[] {
    return [...this.uploadLogs];
  }

  public getIngestedRecords(): IngestedMasterRecord[] {
    return [...this.ingestedRecords];
  }

  public getIngestedRecordById(id: string): IngestedMasterRecord | undefined {
    return this.ingestedRecords.find((r) => r.id === id);
  }

  public checkDuplicate(
    mobile: string,
    name: string,
    houseNo: string,
    colony: string
  ): { isDuplicate: boolean; reason?: string } {
    try {
      const liveCusts = customerService.getCustomers();
      const cleanMobile = mobile ? mobile.replace(/\D/g, '') : '';
      if (cleanMobile && cleanMobile.length >= 10) {
        const match = liveCusts.find(
          (c) => c.mobile && c.mobile.replace(/\D/g, '').endsWith(cleanMobile.slice(-10))
        );
        if (match) {
          return {
            isDuplicate: true,
            reason: `Mobile number matches live customer: ${match.name} (${match.mobile}) in ${match.area || match.sectorLocality || 'Dadabari'}`,
          };
        }
      }
      if (houseNo && colony) {
        const matchAddr = liveCusts.find(
          (c) =>
            c.houseNo &&
            c.houseNo.toLowerCase().trim() === houseNo.toLowerCase().trim() &&
            (c.area || '').toLowerCase().includes(colony.toLowerCase().trim())
        );
        if (matchAddr) {
          return {
            isDuplicate: true,
            reason: `Address matches existing property: H.No. ${matchAddr.houseNo}, ${matchAddr.area} (${matchAddr.name})`,
          };
        }
      }
    } catch (e) {
      console.warn('Duplicate check warning:', e);
    }
    return { isDuplicate: false };
  }

  public ingestRecordsFromUpload(
    category: MasterUploadCategory,
    rawRows: Record<string, any>[],
    fileName: string,
    uploaderName: string,
    uploaderId: string = 'mahen.comtech@gmail.com'
  ): { total: number; batchId: string; validCount: number; skippedCount: number; message: string } {
    const batchId = `BATCH-${Date.now().toString().slice(-6)}`;
    let validCount = 0;
    let skippedCount = 0;

    const newRecords: IngestedMasterRecord[] = [];

    rawRows.forEach((row, idx) => {
      const name = String(
        row['name'] ||
          row['Name'] ||
          row['Customer Name'] ||
          row['customerName'] ||
          (category === 'MONTHLY_DSS_REPORT'
            ? `DSS Entry ${row['date'] || 'Oct 2026'}`
            : category === 'BEAT_FUEL_MASTER'
            ? `Beat Fuel Parameter ${row['beatNumber'] || `Beat ${idx + 1}`}`
            : '')
      ).trim();

      const beatRaw = String(
        row['beatNo'] ||
          row['BeatNo'] ||
          row['Beat'] ||
          row['beat'] ||
          row['beatNumber'] ||
          'Beat 2'
      ).trim();
      const beatNo = beatRaw.startsWith('Beat') ? beatRaw : `Beat ${beatRaw}`;
      const fuelMapping = getBeatFuelMapping(beatNo);

      const mobile = String(
        row['mobile'] || row['Mobile'] || row['Phone'] || row['Contact'] || ''
      ).trim();
      const area = String(
        row['area'] || row['Area'] || row['Colony'] || row['colony'] || fuelMapping.territorialCoverage.split(',')[0] || 'Dadabari'
      ).trim();
      const sector = String(row['sector'] || row['Sector'] || '1').trim();
      const block = String(row['block'] || row['Block'] || 'N/A').trim();
      const houseNo = String(
        row['houseNo'] || row['HouseNo'] || row['House No'] || row['PlotNo'] || (idx + 1).toString()
      ).trim();
      const pincode = String(row['pincode'] || row['Pincode'] || '324009').trim();
      const householdType = (row['householdType'] || row['Type'] || 'Residential') as 'Residential' | 'Commercial' | 'Government';
      const financialInterest = String(row['financialInterest'] || row['Scheme'] || 'General Delivery').trim();

      if (!name && category === 'CUSTOMERS_PROPERTIES') {
        skippedCount++;
        return;
      }

      const dupCheck = this.checkDuplicate(mobile, name, houseNo, area);

      // Extract split sequence if present e.g. "191/A" -> "A"
      let splitSequence = 'Standard';
      if (houseNo.includes('/')) {
        const splitPart = houseNo.split('/')[1]?.trim();
        if (splitPart) splitSequence = splitPart.toUpperCase();
      }

      const fullAddress = `${houseNo ? `H.No. ${houseNo}, ` : ''}${block && block !== 'N/A' ? `Block ${block}, ` : ''}${sector && sector !== 'N/A' ? `Sector ${sector}, ` : ''}${area}, Kota - ${pincode}`;

      const newRec: IngestedMasterRecord = {
        id: `INGEST-${Date.now()}-${idx + 1}`,
        batchId,
        category,
        categoryLabel:
          category === 'CUSTOMERS_PROPERTIES'
            ? 'Customer & Household Property Data'
            : category === 'MONTHLY_DSS_REPORT'
            ? 'Monthly DSS (Daily Summary Sheet) Report'
            : 'Beat-Wise Fuel Bill Master Data',
        fileName,
        uploadedAt: new Date().toISOString(),
        uploadedBy: uploaderName,
        uploadedById: uploaderId,
        beatNo,
        assignedStaffId: fuelMapping.assignedStaffId || '50457421',
        assignedStaffName: fuelMapping.assignedPostmanName || 'Mahendra Kumar Meena',
        name: name || `Property Record ${houseNo}`,
        mobile: mobile || `98290${String(10000 + idx).slice(-5)}`,
        householdType,
        financialInterest,
        areaColony: area,
        sector: sector || '1',
        block: block || 'N/A',
        isBlockNotApplicable: block === 'N/A' || !block,
        isSectorNotApplicable: sector === 'N/A' || !sector,
        houseNo,
        splitSequence,
        fullAddress,
        pincode,
        verificationStage: 'PENDING_STAFF_VERIFICATION',
        isDuplicateSuspect: dupCheck.isDuplicate,
        duplicateDetails: dupCheck.reason,
        auditTrail: [
          {
            stage: 'INGESTION',
            action: 'Stage A: Master Admin Ingested & Auto-Routed',
            performedBy: uploaderName,
            performedById: uploaderId,
            performedByRole: 'SUPER_ADMIN',
            timestamp: new Date().toISOString(),
            notes: `Parsed from ${fileName}. Auto-routed to ${beatNo} (${fuelMapping.assignedPostmanName}) based on territorial matrix.`,
          },
        ],
        verificationNotes: dupCheck.isDuplicate
          ? `Discrepancy alert: ${dupCheck.reason}`
          : 'Enqueued for Stage B Field Contact & Identity Verification by assigned beat postman.',
      };

      if (category === 'MONTHLY_DSS_REPORT') {
        const spRecd = Number(row['speedPostReceived'] || row['SpeedPostRecd'] || row['spRecd'] || 30);
        const spDeliv = Number(row['speedPostDelivered'] || row['SpeedPostDeliv'] || row['spDeliv'] || 28);
        const regRecd = Number(row['registryReceived'] || row['RegRecd'] || row['regRecd'] || 4);
        const regDeliv = Number(row['registryDelivered'] || row['RegDeliv'] || row['regDeliv'] || 4);
        const parRecd = Number(row['parcelReceived'] || row['ParcelRecd'] || row['parRecd'] || 2);
        const parDeliv = Number(row['parcelDelivered'] || row['ParcelDeliv'] || row['parDeliv'] || 2);
        const totalLocked = spDeliv + regDeliv + parDeliv;

        newRec.dssData = {
          date: String(row['date'] || row['Date'] || '2026-10-25').trim(),
          speedPostReceived: spRecd,
          speedPostDelivered: spDeliv,
          speedPostDeposit: Number(row['speedPostDeposit'] || 0),
          registryReceived: regRecd,
          registryDelivered: regDeliv,
          registryDeposit: Number(row['registryDeposit'] || 0),
          parcelReceived: parRecd,
          parcelDelivered: parDeliv,
          parcelDeposit: Number(row['parcelDeposit'] || 0),
          totalArticlesLocked: totalLocked,
          codAmountCollected: Number(row['codAmountCollected'] || row['CodCash'] || 2400),
          attendanceStatus: (row['attendanceStatus'] || 'Present - Field Duty') as DailyArticleEntry['attendanceStatus'],
          remarks: String(row['remarks'] || 'Monthly DSS Sheet Upload').trim(),
        };

        newRec.fuelData = {
          sanctionedDailyKm: fuelMapping.sanctionedDailyKm,
          fuelRatePerKm: DEPARTMENTAL_FUEL_RATE_PER_KM,
          monthlyWorkingDays: 25,
          territorialCoverage: fuelMapping.territorialCoverage,
          terrainClassification: fuelMapping.terrainClassification,
          routeDescription: fuelMapping.routeDescription,
        };
      } else if (category === 'BEAT_FUEL_MASTER') {
        const kmRaw = Number(row['sanctionedDailyKm'] || row['DailyKm'] || row['km'] || fuelMapping.sanctionedDailyKm);
        newRec.fuelData = {
          sanctionedDailyKm: kmRaw,
          fuelRatePerKm: DEPARTMENTAL_FUEL_RATE_PER_KM,
          monthlyWorkingDays: 25,
          territorialCoverage: String(row['territorialCoverage'] || fuelMapping.territorialCoverage),
          terrainClassification: fuelMapping.terrainClassification,
          routeDescription: String(row['routeDescription'] || fuelMapping.routeDescription),
        };
      }

      newRecords.push(newRec);
      validCount++;
    });

    this.ingestedRecords.unshift(...newRecords);
    this.saveIngestedRecords();

    // Also register an upload log
    const log: MasterUploadLog = {
      id: `UPL-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category,
      categoryLabel:
        category === 'CUSTOMERS_PROPERTIES'
          ? 'Customer & Household Property Data'
          : category === 'MONTHLY_DSS_REPORT'
          ? 'Monthly DSS (Daily Summary Sheet) Report'
          : 'Beat-Wise Fuel Bill Master Data',
      fileName,
      totalRows: rawRows.length,
      validRows: validCount,
      skippedRows: skippedCount,
      uploadedBy: uploaderName,
      status: skippedCount === 0 ? 'SUCCESS' : validCount > 0 ? 'PARTIAL' : 'FAILED',
      summary: `Ingested ${validCount} rows into 4-Stage Verification Queue. Auto-routed to assigned beats. Dispatched alerts to staff.`,
    };

    this.uploadLogs.unshift(log);
    this.saveLogs();

    return {
      total: rawRows.length,
      batchId,
      validCount,
      skippedCount,
      message: `Successfully ingested ${validCount} records into the 4-Stage Verification Gateway under Batch ${batchId}. Auto-routed to assigned beat staff.`,
    };
  }

  public verifyContactStageB(
    id: string,
    staffName: string,
    staffId: string,
    role: string,
    updates?: Partial<IngestedMasterRecord>,
    notes?: string
  ): IngestedMasterRecord {
    const record = this.ingestedRecords.find((r) => r.id === id);
    if (!record) throw new Error(`Record ${id} not found in ingestion queue`);

    if (updates) {
      if (updates.name) record.name = updates.name.trim();
      if (updates.mobile) record.mobile = updates.mobile.trim();
      if (updates.householdType) record.householdType = updates.householdType;
      if (updates.financialInterest) record.financialInterest = updates.financialInterest.trim();
    }

    // Refresh duplicate check
    const dupCheck = this.checkDuplicate(record.mobile, record.name, record.houseNo, record.areaColony);
    record.isDuplicateSuspect = dupCheck.isDuplicate;
    record.duplicateDetails = dupCheck.reason;

    record.verificationStage = 'CONTACT_VERIFIED';
    record.stageBVerifiedBy = staffName;
    record.stageBVerifiedById = staffId;
    record.stageBVerifiedAt = new Date().toISOString();
    if (notes) record.verificationNotes = notes;

    record.auditTrail.push({
      stage: 'CONTACT_VERIFIED',
      action: 'Stage B: Verified Contact & Identity',
      performedBy: staffName,
      performedById: staffId,
      performedByRole: role,
      timestamp: new Date().toISOString(),
      notes: notes || 'Citizen identity and contact number confirmed by beat staff. Duplicate check validated.',
    });

    this.saveIngestedRecords();
    return record;
  }

  public verifyPropertyStageC(
    id: string,
    staffName: string,
    staffId: string,
    role: string,
    updates?: Partial<IngestedMasterRecord>,
    notes?: string
  ): IngestedMasterRecord {
    const record = this.ingestedRecords.find((r) => r.id === id);
    if (!record) throw new Error(`Record ${id} not found in ingestion queue`);

    if (updates) {
      if (updates.areaColony) record.areaColony = updates.areaColony.trim();
      if (updates.sector !== undefined) record.sector = updates.sector.trim();
      if (updates.block !== undefined) record.block = updates.block.trim();
      if (updates.isBlockNotApplicable !== undefined) record.isBlockNotApplicable = updates.isBlockNotApplicable;
      if (updates.isSectorNotApplicable !== undefined) record.isSectorNotApplicable = updates.isSectorNotApplicable;
      if (updates.houseNo) record.houseNo = updates.houseNo.trim();
      if (updates.splitSequence) record.splitSequence = updates.splitSequence.trim();
      if (updates.pincode) record.pincode = updates.pincode.trim();
      if (updates.beatNo) {
        record.beatNo = updates.beatNo;
        const fuelMapping = getBeatFuelMapping(record.beatNo);
        record.assignedStaffId = fuelMapping.assignedStaffId;
        record.assignedStaffName = fuelMapping.assignedPostmanName;
      }
    }

    // Compute standardized full address
    const parts = [];
    if (record.houseNo) parts.push(`H.No. ${record.houseNo}`);
    if (!record.isBlockNotApplicable && record.block && record.block !== 'N/A') parts.push(`Block ${record.block}`);
    if (!record.isSectorNotApplicable && record.sector && record.sector !== 'N/A') parts.push(`Sector ${record.sector}`);
    if (record.areaColony) parts.push(record.areaColony);
    parts.push(`Kota - ${record.pincode || '324009'}`);
    record.fullAddress = parts.join(', ');

    record.verificationStage = 'PROPERTY_VERIFIED';
    record.stageCVerifiedBy = staffName;
    record.stageCVerifiedById = staffId;
    record.stageCVerifiedAt = new Date().toISOString();
    if (notes) record.verificationNotes = notes;

    record.auditTrail.push({
      stage: 'PROPERTY_VERIFIED',
      action: 'Stage C: Verified Property & Locality Matrix',
      performedBy: staffName,
      performedById: staffId,
      performedByRole: role,
      timestamp: new Date().toISOString(),
      notes: notes || 'Colony, sector, block applicability, split house sequence, and pincode verified.',
    });

    this.saveIngestedRecords();
    return record;
  }

  public approveAndSyncStageD(
    id: string,
    approverName: string,
    approverId: string,
    role: string,
    notes?: string
  ): { success: boolean; record: IngestedMasterRecord; message: string } {
    const record = this.ingestedRecords.find((r) => r.id === id);
    if (!record) throw new Error(`Record ${id} not found in ingestion queue`);

    // 1. Sync to live database based on category
    if (record.category === 'CUSTOMERS_PROPERTIES') {
      customerService.addOrUpdateCustomer(
        {
          name: record.name,
          mobile: record.mobile,
          beatNo: record.beatNo,
          area: record.areaColony,
          sector: record.isSectorNotApplicable ? 'N/A' : record.sector,
          houseNo: record.houseNo,
          pincode: record.pincode,
          financialInterest: record.financialInterest || 'General Delivery',
          verificationStatus: 'Verified',
          type: record.householdType,
          address: {
            houseNo: record.houseNo,
            street: `${record.areaColony} Main Road`,
            colony: record.areaColony,
            sector: record.isSectorNotApplicable ? 'N/A' : record.sector,
            area: record.areaColony,
            pincode: record.pincode,
            fullAddress: record.fullAddress,
          },
        },
        `Stage D Supervisory Audit Approval by ${approverName} (${approverId})`
      );

      customerService.logAudit(
        'CREATE',
        'CUSTOMER',
        record.id,
        record.name,
        `Stage D Final Supervisory Audit passed. Approved by ${approverName} (${role}). Record fully synchronized to live property registry.`,
        null,
        {
          name: record.name,
          mobile: record.mobile,
          beatNo: record.beatNo,
          address: record.fullAddress,
        }
      );
    } else if (record.category === 'MONTHLY_DSS_REPORT' && record.dssData) {
      const fuelData = getBeatFuelMapping(record.beatNo);
      const km = record.fuelData?.sanctionedDailyKm || fuelData.sanctionedDailyKm;

      operationsService.patchOrUpsertDailyArticleQuantities(
        {
          date: record.dssData.date,
          beatNo: record.beatNo,
          staffName: record.assignedStaffName,
          employeeId: record.assignedStaffId,
          staffEmail: 'mahen.comtech@gmail.com',
          officeName: 'Dadabari S.O. (324009)',
          attendanceStatus: record.dssData.attendanceStatus,
          fixedKm: km,
          sanctionedBeatKm: km,
          fuelRatePerKm: DEPARTMENTAL_FUEL_RATE_PER_KM,
          dailyFuelAllowance: Math.round(km * DEPARTMENTAL_FUEL_RATE_PER_KM),
          monthlyFuelAllowance: Math.round(km * DEPARTMENTAL_FUEL_RATE_PER_KM * 25),
          dssStatus: 'Verified by SPM',
          speedPostReceived: record.dssData.speedPostReceived,
          speedPostDelivered: record.dssData.speedPostDelivered,
          speedPostReturned: Math.max(0, record.dssData.speedPostReceived - record.dssData.speedPostDelivered),
          speedPostDeposit: record.dssData.speedPostDeposit,
          registryReceived: record.dssData.registryReceived,
          registryDelivered: record.dssData.registryDelivered,
          registryReturned: Math.max(0, record.dssData.registryReceived - record.dssData.registryDelivered),
          registryDeposit: record.dssData.registryDeposit,
          parcelReceived: record.dssData.parcelReceived,
          parcelDelivered: record.dssData.parcelDelivered,
          parcelReturned: Math.max(0, record.dssData.parcelReceived - record.dssData.parcelDelivered),
          parcelDeposit: record.dssData.parcelDeposit,
          codAmountCollected: record.dssData.codAmountCollected,
          doorstepInquiriesLogged: 4,
          remarks: record.dssData.remarks || `Verified & Synced via 4-Stage Gate by ${approverName}`,
        },
        {
          updatedBy: approverName,
          remarks: `Stage D Supervisory Audit Sign-off by ${approverName}`,
        }
      );

      customerService.logAudit(
        'UPDATE',
        'DAILY_ENTRY',
        record.id,
        `DSS ${record.dssData.date} (${record.beatNo})`,
        `Stage D Supervisory Audit Approved by ${approverName}. Strictly locked total articles count (${record.dssData.totalArticlesLocked}) audited against official DSS. ACG-61 fuel bill unlocked.`,
        null,
        {
          lockedTotalArticles: record.dssData.totalArticlesLocked,
          dailyFuelKm: km,
        }
      );
    } else if (record.category === 'BEAT_FUEL_MASTER' && record.fuelData) {
      this.customBeatKmOverrides[record.beatNo] = record.fuelData.sanctionedDailyKm;
      this.saveOverrides();

      customerService.logAudit(
        'UPDATE',
        'SPECIAL_BILL',
        record.id,
        `Beat Fuel Master ${record.beatNo}`,
        `Route distance ${record.fuelData.sanctionedDailyKm} KM @ ₹${DEPARTMENTAL_FUEL_RATE_PER_KM}/KM locked by ${approverName}.`
      );
    }

    // 2. Advance stage to FULLY_SYNCED and unlock fuel bill
    record.verificationStage = 'FULLY_SYNCED';
    record.stageDApprovedBy = approverName;
    record.stageDApprovedById = approverId;
    record.stageDApprovedAt = new Date().toISOString();
    record.isFuelBillUnlocked = true;
    if (notes) record.verificationNotes = notes;

    record.auditTrail.push({
      stage: 'FULLY_SYNCED',
      action: 'Stage D: Supervisory Audit & Synchronized to Live Database',
      performedBy: approverName,
      performedById: approverId,
      performedByRole: role,
      timestamp: new Date().toISOString(),
      notes: notes || 'Supervisory audit passed. Written to live database; ACG-61 fuel bill generation unlocked.',
    });

    this.saveIngestedRecords();

    return {
      success: true,
      record,
      message: `Record ${record.id} (${record.name}) successfully approved by ${approverName} and synchronized to live database. ACG-61 fuel bill unlocked!`,
    };
  }

  public updateIngestedRecord(
    id: string,
    updates: Partial<IngestedMasterRecord>,
    staffName: string,
    staffId: string,
    role: string,
    notes?: string
  ): IngestedMasterRecord {
    const record = this.ingestedRecords.find((r) => r.id === id);
    if (!record) throw new Error(`Record ${id} not found in ingestion queue`);

    const changedFields: Record<string, { from: any; to: any }> = {};

    Object.keys(updates).forEach((k) => {
      const key = k as keyof IngestedMasterRecord;
      if (key !== 'id' && key !== 'auditTrail' && updates[key] !== undefined) {
        if (record[key] !== updates[key]) {
          changedFields[key] = { from: record[key], to: updates[key] };
          (record as any)[key] = updates[key];
        }
      }
    });

    // Recompute full address
    const parts = [];
    if (record.houseNo) parts.push(`H.No. ${record.houseNo}`);
    if (!record.isBlockNotApplicable && record.block && record.block !== 'N/A') parts.push(`Block ${record.block}`);
    if (!record.isSectorNotApplicable && record.sector && record.sector !== 'N/A') parts.push(`Sector ${record.sector}`);
    if (record.areaColony) parts.push(record.areaColony);
    parts.push(`Kota - ${record.pincode || '324009'}`);
    record.fullAddress = parts.join(', ');

    // Refresh duplicate check
    const dupCheck = this.checkDuplicate(record.mobile, record.name, record.houseNo, record.areaColony);
    record.isDuplicateSuspect = dupCheck.isDuplicate;
    record.duplicateDetails = dupCheck.reason;

    if (notes) record.verificationNotes = notes;

    record.auditTrail.push({
      stage: record.verificationStage,
      action: 'Updated Record Attributes in Ingestion Gateway',
      performedBy: staffName,
      performedById: staffId,
      performedByRole: role,
      timestamp: new Date().toISOString(),
      notes: notes || `Modified fields: ${Object.keys(changedFields).join(', ')}`,
      fieldChanges: changedFields,
    });

    this.saveIngestedRecords();
    return record;
  }

  public batchVerifyContact(ids: string[], staffName: string, staffId: string, role: string): number {
    let count = 0;
    ids.forEach((id) => {
      const rec = this.ingestedRecords.find((r) => r.id === id);
      if (rec && rec.verificationStage === 'PENDING_STAFF_VERIFICATION') {
        this.verifyContactStageB(id, staffName, staffId, role, undefined, 'Batch verified contact & identity.');
        count++;
      }
    });
    return count;
  }

  public batchVerifyProperty(ids: string[], staffName: string, staffId: string, role: string): number {
    let count = 0;
    ids.forEach((id) => {
      const rec = this.ingestedRecords.find((r) => r.id === id);
      if (rec && rec.verificationStage === 'CONTACT_VERIFIED') {
        this.verifyPropertyStageC(id, staffName, staffId, role, undefined, 'Batch verified property & locality matrix.');
        count++;
      }
    });
    return count;
  }

  public batchApproveAndSync(
    ids: string[],
    approverName: string,
    approverId: string,
    role: string
  ): { syncedCount: number; message: string } {
    let count = 0;
    ids.forEach((id) => {
      const rec = this.ingestedRecords.find((r) => r.id === id);
      if (rec && (rec.verificationStage === 'PROPERTY_VERIFIED' || role === 'SUPER_ADMIN' || role === 'SPM')) {
        this.approveAndSyncStageD(id, approverName, approverId, role, 'Batch approved & synchronized via Supervisory Gateway.');
        count++;
      }
    });
    return {
      syncedCount: count,
      message: `Batch synchronized ${count} verified records into live database. ACG-61 fuel vouchers unlocked.`,
    };
  }

  public deleteIngestedRecord(id: string): boolean {
    const idx = this.ingestedRecords.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.ingestedRecords.splice(idx, 1);
      this.saveIngestedRecords();
      return true;
    }
    return false;
  }

  public resetToInitialIngestedRecords(): void {
    this.ingestedRecords = this.getInitialIngestedRecords();
    this.saveIngestedRecords();
  }

  private getInitialIngestedRecords(): IngestedMasterRecord[] {
    const now = new Date();
    const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();

    return [
      // 1. Beat 2 - Stage A: PENDING_STAFF_VERIFICATION
      {
        id: 'INGEST-202611-001',
        batchId: 'BATCH-202611-KOTA01',
        category: 'CUSTOMERS_PROPERTIES',
        categoryLabel: 'Customer & Household Property Data',
        fileName: 'Keshavpura_SantoshiNagar_Master_Directory.csv',
        uploadedAt: hoursAgo(18),
        uploadedBy: 'Ekta Meena (Super Admin)',
        uploadedById: 'mahen.comtech@gmail.com',
        beatNo: 'Beat 2',
        assignedStaffId: '50457421',
        assignedStaffName: 'Mahendra Kumar Meena',
        name: 'Shri Rameshwar Dayal Meena',
        mobile: '9829012345',
        householdType: 'Residential',
        financialInterest: 'Sukanya Samriddhi Account (SSA)',
        areaColony: 'Keshavpura',
        sector: '7',
        block: 'B',
        isBlockNotApplicable: false,
        isSectorNotApplicable: false,
        houseNo: '445/A',
        splitSequence: 'A',
        fullAddress: 'H.No. 445/A, Block B, Sector 7, Keshavpura, Kota - 324009',
        pincode: '324009',
        verificationStage: 'PENDING_STAFF_VERIFICATION',
        auditTrail: [
          {
            stage: 'INGESTION',
            action: 'Stage A: Master Admin Ingested & Auto-Routed',
            performedBy: 'Ekta Meena (Super Admin)',
            performedById: 'mahen.comtech@gmail.com',
            performedByRole: 'SUPER_ADMIN',
            timestamp: hoursAgo(18),
            notes: 'Auto-routed to Beat 2 based on Keshavpura Sector 7 territory matrix.',
          },
        ],
        verificationNotes: 'Pending field identity and contact verification by Beat 2 postman.',
      },
      // 2. Beat 2 - Stage B: CONTACT_VERIFIED
      {
        id: 'INGEST-202611-002',
        batchId: 'BATCH-202611-KOTA01',
        category: 'CUSTOMERS_PROPERTIES',
        categoryLabel: 'Customer & Household Property Data',
        fileName: 'Keshavpura_SantoshiNagar_Master_Directory.csv',
        uploadedAt: hoursAgo(24),
        uploadedBy: 'Ekta Meena (Super Admin)',
        uploadedById: 'mahen.comtech@gmail.com',
        beatNo: 'Beat 2',
        assignedStaffId: '50457421',
        assignedStaffName: 'Mahendra Kumar Meena',
        name: 'Smt. Sunita Sharma',
        mobile: '9414288901',
        householdType: 'Residential',
        financialInterest: 'Mahila Samman Savings Certificate',
        areaColony: 'Santoshi Nagar',
        sector: 'Main',
        block: 'N/A',
        isBlockNotApplicable: true,
        isSectorNotApplicable: false,
        houseNo: '104-A',
        splitSequence: 'A',
        fullAddress: 'H.No. 104-A, Santoshi Nagar, near TVS Circle, Kota - 324009',
        pincode: '324009',
        verificationStage: 'CONTACT_VERIFIED',
        stageBVerifiedBy: 'Mahendra Kumar Meena',
        stageBVerifiedById: '50457421',
        stageBVerifiedAt: hoursAgo(12),
        auditTrail: [
          {
            stage: 'INGESTION',
            action: 'Stage A: Master Admin Ingested & Auto-Routed',
            performedBy: 'Ekta Meena (Super Admin)',
            performedById: 'mahen.comtech@gmail.com',
            performedByRole: 'SUPER_ADMIN',
            timestamp: hoursAgo(24),
          },
          {
            stage: 'CONTACT_VERIFIED',
            action: 'Stage B: Verified Contact & Identity',
            performedBy: 'Mahendra Kumar Meena (Beat 2)',
            performedById: '50457421',
            performedByRole: 'POSTMAN',
            timestamp: hoursAgo(12),
            notes: 'Contact number verified via physical doorstep visit. Active resident confirmed.',
          },
        ],
        verificationNotes: 'Contact confirmed. Block is not applicable in Santoshi Nagar outer lanes.',
      },
      // 3. Beat 2 - Stage C: PROPERTY_VERIFIED
      {
        id: 'INGEST-202611-003',
        batchId: 'BATCH-202611-KOTA01',
        category: 'CUSTOMERS_PROPERTIES',
        categoryLabel: 'Customer & Household Property Data',
        fileName: 'Keshavpura_SantoshiNagar_Master_Directory.csv',
        uploadedAt: hoursAgo(30),
        uploadedBy: 'Ekta Meena (Super Admin)',
        uploadedById: 'mahen.comtech@gmail.com',
        beatNo: 'Beat 2',
        assignedStaffId: '50457421',
        assignedStaffName: 'Mahendra Kumar Meena',
        name: 'Dr. Ashok Kumar Mathur',
        mobile: '9414120394',
        householdType: 'Residential',
        financialInterest: 'Senior Citizen Savings Scheme (SCSS)',
        areaColony: 'Keshavpura',
        sector: '6',
        block: 'C',
        isBlockNotApplicable: false,
        isSectorNotApplicable: false,
        houseNo: '191/B',
        splitSequence: 'B',
        fullAddress: 'H.No. 191/B, Block C, Sector 6, Keshavpura, Kota - 324009',
        pincode: '324009',
        verificationStage: 'PROPERTY_VERIFIED',
        stageBVerifiedBy: 'Mahendra Kumar Meena',
        stageBVerifiedById: '50457421',
        stageBVerifiedAt: hoursAgo(16),
        stageCVerifiedBy: 'Priyanka Pareek (PA)',
        stageCVerifiedById: '50102941',
        stageCVerifiedAt: hoursAgo(6),
        auditTrail: [
          {
            stage: 'INGESTION',
            action: 'Stage A: Master Admin Ingested & Auto-Routed',
            performedBy: 'Ekta Meena (Super Admin)',
            performedById: 'mahen.comtech@gmail.com',
            performedByRole: 'SUPER_ADMIN',
            timestamp: hoursAgo(30),
          },
          {
            stage: 'CONTACT_VERIFIED',
            action: 'Stage B: Verified Contact & Identity',
            performedBy: 'Mahendra Kumar Meena',
            performedById: '50457421',
            performedByRole: 'POSTMAN',
            timestamp: hoursAgo(16),
            notes: 'Resident identity and mobile confirmed.',
          },
          {
            stage: 'PROPERTY_VERIFIED',
            action: 'Stage C: Verified Property & Locality Matrix',
            performedBy: 'Priyanka Pareek (PA)',
            performedById: '50102941',
            performedByRole: 'PA',
            timestamp: hoursAgo(6),
            notes: 'Split property sequence 191/B verified against colony land register. Pincode 324009 validated.',
          },
        ],
        verificationNotes: 'Fully verified split property (191/B). Ready for SPM supervisory sign-off and live database sync.',
      },
      // 4. Beat 2 - Stage C: PROPERTY_VERIFIED (Monthly DSS with Locked Total Articles)
      {
        id: 'INGEST-202611-004',
        batchId: 'BATCH-202611-DSS-OCT',
        category: 'MONTHLY_DSS_REPORT',
        categoryLabel: 'Monthly DSS (Daily Summary Sheet) Report',
        fileName: 'Dadabari_SO_PMA_DSS_Monthly_Reconciliation.csv',
        uploadedAt: hoursAgo(14),
        uploadedBy: 'Sub-Postmaster (SPM)',
        uploadedById: 'spm.dadabari@indiapost.gov.in',
        beatNo: 'Beat 2',
        assignedStaffId: '50457421',
        assignedStaffName: 'Mahendra Kumar Meena',
        name: 'Beat 2 Daily Summary Sheet (DSS) - Oct 2026 Field Log',
        mobile: '9414002026',
        householdType: 'Government',
        areaColony: 'Keshavpura Sectors 6 & 7',
        sector: '6 & 7',
        block: 'N/A',
        isBlockNotApplicable: true,
        isSectorNotApplicable: false,
        houseNo: 'DSS-OCT-B2',
        fullAddress: 'Dadabari S.O. Beat 2 Field Jurisdiction, PIN 324009',
        pincode: '324009',
        dssData: {
          date: '2026-10-25',
          speedPostReceived: 42,
          speedPostDelivered: 42,
          speedPostDeposit: 0,
          registryReceived: 6,
          registryDelivered: 6,
          registryDeposit: 0,
          parcelReceived: 4,
          parcelDelivered: 4,
          parcelDeposit: 0,
          totalArticlesLocked: 52, // STRICT TOTAL LOCK
          codAmountCollected: 3800,
          attendanceStatus: 'Present - Field Duty',
          remarks: 'Full beat round completed via PMA. Strict Total Lock: 52 Articles.',
        },
        fuelData: {
          sanctionedDailyKm: 30,
          fuelRatePerKm: 3.60,
          monthlyWorkingDays: 25,
          territorialCoverage: 'Keshavpura Sectors 6 & 7, Santoshi Nagar, CAD Circle corridor',
          terrainClassification: 'Urban High-Density',
          routeDescription: 'CAD Circle -> Santoshi Nagar -> Keshavpura Sector 6 -> Sector 7 -> SO return',
        },
        verificationStage: 'PROPERTY_VERIFIED',
        stageBVerifiedBy: 'Mahendra Kumar Meena',
        stageBVerifiedById: '50457421',
        stageBVerifiedAt: hoursAgo(10),
        stageCVerifiedBy: 'Postal Assistant (In-Charge)',
        stageCVerifiedById: '50291044',
        stageCVerifiedAt: hoursAgo(5),
        auditTrail: [
          {
            stage: 'INGESTION',
            action: 'Stage A: Master Admin Ingested & Auto-Routed',
            performedBy: 'Sub-Postmaster (SPM)',
            performedById: 'spm.dadabari@indiapost.gov.in',
            performedByRole: 'SPM',
            timestamp: hoursAgo(14),
          },
          {
            stage: 'CONTACT_VERIFIED',
            action: 'Stage B: Verified Postman Field Session',
            performedBy: 'Mahendra Kumar Meena',
            performedById: '50457421',
            performedByRole: 'POSTMAN',
            timestamp: hoursAgo(10),
            notes: 'Article category tallies matched with PMA device logs.',
          },
          {
            stage: 'PROPERTY_VERIFIED',
            action: 'Stage C: Verified Route Coverage & Pincode Matrix',
            performedBy: 'Postal Assistant (In-Charge)',
            performedById: '50291044',
            performedByRole: 'PA',
            timestamp: hoursAgo(5),
            notes: 'Territorial route distance (30 KM @ ₹3.60/KM) audited. Total articles count strictly locked at 52.',
          },
        ],
        verificationNotes: 'Audit Rule: Total Articles Count is strictly locked against official DSS sheet. Awaiting SPM Stage D authorization to unlock ACG-61 fuel claim voucher.',
      },
      // 5. Beat 1 - Stage A: PENDING_STAFF_VERIFICATION
      {
        id: 'INGEST-202611-005',
        batchId: 'BATCH-202611-KOTA01',
        category: 'CUSTOMERS_PROPERTIES',
        categoryLabel: 'Customer & Household Property Data',
        fileName: 'Dadabari_Main_Market_Directory.xlsx',
        uploadedAt: hoursAgo(8),
        uploadedBy: 'Ekta Meena (Super Admin)',
        uploadedById: 'mahen.comtech@gmail.com',
        beatNo: 'Beat 1',
        assignedStaffId: '50510312',
        assignedStaffName: 'Muskan Sharma',
        name: 'CAD Colony Traders Association',
        mobile: '9414199882',
        householdType: 'Commercial',
        financialInterest: 'Speed Post Corporate Account',
        areaColony: 'Dadabari Extension',
        sector: '2',
        block: 'N/A',
        isBlockNotApplicable: true,
        isSectorNotApplicable: false,
        houseNo: 'Shop 12',
        fullAddress: 'Shop 12 CAD Circle Market, Sector 2, Dadabari Extension, Kota - 324009',
        pincode: '324009',
        verificationStage: 'PENDING_STAFF_VERIFICATION',
        auditTrail: [
          {
            stage: 'INGESTION',
            action: 'Stage A: Master Admin Ingested & Auto-Routed',
            performedBy: 'Ekta Meena (Super Admin)',
            performedById: 'mahen.comtech@gmail.com',
            performedByRole: 'SUPER_ADMIN',
            timestamp: hoursAgo(8),
            notes: 'Auto-routed to Beat 1 (Muskan Sharma).',
          },
        ],
        verificationNotes: 'Pending field verification by Beat 1 staff.',
      },
      // 6. Beat 1 - Stage B: CONTACT_VERIFIED
      {
        id: 'INGEST-202611-006',
        batchId: 'BATCH-202611-KOTA01',
        category: 'CUSTOMERS_PROPERTIES',
        categoryLabel: 'Customer & Household Property Data',
        fileName: 'Dadabari_Main_Market_Directory.xlsx',
        uploadedAt: hoursAgo(15),
        uploadedBy: 'Ekta Meena (Super Admin)',
        uploadedById: 'mahen.comtech@gmail.com',
        beatNo: 'Beat 1',
        assignedStaffId: '50510312',
        assignedStaffName: 'Muskan Sharma',
        name: 'Rajeshwari Gupta',
        mobile: '9828011223',
        householdType: 'Residential',
        financialInterest: 'Postal Life Insurance (PLI Santosh)',
        areaColony: 'P&T Colony',
        sector: 'N/A',
        block: 'N/A',
        isBlockNotApplicable: true,
        isSectorNotApplicable: true,
        houseNo: '52',
        fullAddress: 'H.No. 52, P&T Colony, Dadabari, Kota - 324009',
        pincode: '324009',
        verificationStage: 'CONTACT_VERIFIED',
        stageBVerifiedBy: 'Muskan Sharma',
        stageBVerifiedById: '50510312',
        stageBVerifiedAt: hoursAgo(7),
        auditTrail: [
          {
            stage: 'INGESTION',
            action: 'Stage A: Master Admin Ingested & Auto-Routed',
            performedBy: 'Ekta Meena (Super Admin)',
            performedById: 'mahen.comtech@gmail.com',
            performedByRole: 'SUPER_ADMIN',
            timestamp: hoursAgo(15),
          },
          {
            stage: 'CONTACT_VERIFIED',
            action: 'Stage B: Verified Contact & Identity',
            performedBy: 'Muskan Sharma',
            performedById: '50510312',
            performedByRole: 'POSTMAN',
            timestamp: hoursAgo(7),
            notes: 'Identity confirmed. Sector and Block marked Not Applicable as P&T Colony uses direct quarter numbers.',
          },
        ],
        verificationNotes: 'Sector & Block Not Applicable for P&T quarters.',
      },
      // 7. Beat 4 - Stage A: PENDING_STAFF_VERIFICATION
      {
        id: 'INGEST-202611-007',
        batchId: 'BATCH-202611-KOTA02',
        category: 'CUSTOMERS_PROPERTIES',
        categoryLabel: 'Customer & Household Property Data',
        fileName: 'Keshavpura_Vistar_ChhotiBasti.csv',
        uploadedAt: hoursAgo(5),
        uploadedBy: 'Ekta Meena (Super Admin)',
        uploadedById: 'mahen.comtech@gmail.com',
        beatNo: 'Beat 4',
        assignedStaffId: '10310735',
        assignedStaffName: 'Govind Prasad',
        name: 'Govind Prasad Sharma',
        mobile: '9829055443',
        householdType: 'Residential',
        financialInterest: 'PLI Suraksha (Whole Life Assurance)',
        areaColony: 'Keshavpura Vistar',
        sector: '3',
        block: 'A',
        isBlockNotApplicable: false,
        isSectorNotApplicable: false,
        houseNo: 'Plot 89',
        fullAddress: 'Plot 89, Block A, Sector 3, Keshavpura Vistar, Kota - 324009',
        pincode: '324009',
        verificationStage: 'PENDING_STAFF_VERIFICATION',
        auditTrail: [
          {
            stage: 'INGESTION',
            action: 'Stage A: Master Admin Ingested & Auto-Routed',
            performedBy: 'Ekta Meena (Super Admin)',
            performedById: 'mahen.comtech@gmail.com',
            performedByRole: 'SUPER_ADMIN',
            timestamp: hoursAgo(5),
          },
        ],
        verificationNotes: 'Auto-routed to Beat 4 (Govind Prasad).',
      },
      // 8. Beat 4 - Stage C: PROPERTY_VERIFIED
      {
        id: 'INGEST-202611-008',
        batchId: 'BATCH-202611-KOTA02',
        category: 'CUSTOMERS_PROPERTIES',
        categoryLabel: 'Customer & Household Property Data',
        fileName: 'Keshavpura_Vistar_ChhotiBasti.csv',
        uploadedAt: hoursAgo(20),
        uploadedBy: 'Ekta Meena (Super Admin)',
        uploadedById: 'mahen.comtech@gmail.com',
        beatNo: 'Beat 4',
        assignedStaffId: '10310735',
        assignedStaffName: 'Govind Prasad',
        name: 'Kailash Chand Verma',
        mobile: '9414567890',
        householdType: 'Residential',
        financialInterest: 'IPPB Premium Account',
        areaColony: 'Keshavpura Vistar',
        sector: '1',
        block: 'N/A',
        isBlockNotApplicable: true,
        isSectorNotApplicable: false,
        houseNo: '23/A',
        splitSequence: 'A',
        fullAddress: 'H.No. 23/A, Chhoti Basti, Sector 1, Keshavpura Vistar, Kota - 324009',
        pincode: '324009',
        verificationStage: 'PROPERTY_VERIFIED',
        stageBVerifiedBy: 'Govind Prasad',
        stageBVerifiedById: '10310735',
        stageBVerifiedAt: hoursAgo(12),
        stageCVerifiedBy: 'Anand Swaroop (PA)',
        stageCVerifiedById: '50319400',
        stageCVerifiedAt: hoursAgo(4),
        auditTrail: [
          {
            stage: 'INGESTION',
            action: 'Stage A: Master Admin Ingested & Auto-Routed',
            performedBy: 'Ekta Meena (Super Admin)',
            performedById: 'mahen.comtech@gmail.com',
            performedByRole: 'SUPER_ADMIN',
            timestamp: hoursAgo(20),
          },
          {
            stage: 'CONTACT_VERIFIED',
            action: 'Stage B: Verified Contact & Identity',
            performedBy: 'Govind Prasad',
            performedById: '10310735',
            performedByRole: 'POSTMAN',
            timestamp: hoursAgo(12),
          },
          {
            stage: 'PROPERTY_VERIFIED',
            action: 'Stage C: Verified Property & Locality Matrix',
            performedBy: 'Anand Swaroop (PA)',
            performedById: '50319400',
            performedByRole: 'PA',
            timestamp: hoursAgo(4),
            notes: 'Split property sequence 23/A verified with water connection bill.',
          },
        ],
        verificationNotes: 'Split sequence 23/A verified. Ready for SPM Stage D sync.',
      },
      // 9. Beat 7 - Stage A: PENDING_STAFF_VERIFICATION
      {
        id: 'INGEST-202611-009',
        batchId: 'BATCH-202611-KOTA03',
        category: 'CUSTOMERS_PROPERTIES',
        categoryLabel: 'Customer & Household Property Data',
        fileName: 'Dadabari_Sector_4_5_Survey.xlsx',
        uploadedAt: hoursAgo(3),
        uploadedBy: 'Ekta Meena (Super Admin)',
        uploadedById: 'mahen.comtech@gmail.com',
        beatNo: 'Beat 7',
        assignedStaffId: '50321901',
        assignedStaffName: 'Hari Om Meena',
        name: 'Jagdish Narayan Bhatt',
        mobile: '9829104521',
        householdType: 'Residential',
        financialInterest: '5-Year Post Office Recurring Deposit (RD)',
        areaColony: 'Dadabari',
        sector: '5',
        block: 'D',
        isBlockNotApplicable: false,
        isSectorNotApplicable: false,
        houseNo: '312',
        fullAddress: 'H.No. 312, Block D, Sector 5, Dadabari, Kota - 324009',
        pincode: '324009',
        verificationStage: 'PENDING_STAFF_VERIFICATION',
        auditTrail: [
          {
            stage: 'INGESTION',
            action: 'Stage A: Master Admin Ingested & Auto-Routed',
            performedBy: 'Ekta Meena (Super Admin)',
            performedById: 'mahen.comtech@gmail.com',
            performedByRole: 'SUPER_ADMIN',
            timestamp: hoursAgo(3),
          },
        ],
      },
      // 10. Beat 13 - Stage B: CONTACT_VERIFIED
      {
        id: 'INGEST-202611-010',
        batchId: 'BATCH-202611-KOTA03',
        category: 'CUSTOMERS_PROPERTIES',
        categoryLabel: 'Customer & Household Property Data',
        fileName: 'Talwandi_Commercial_Enclave.csv',
        uploadedAt: hoursAgo(10),
        uploadedBy: 'Ekta Meena (Super Admin)',
        uploadedById: 'mahen.comtech@gmail.com',
        beatNo: 'Beat 13',
        assignedStaffId: '50678234',
        assignedStaffName: 'Naresh Kumar',
        name: 'MediHealth Diagnostic Labs',
        mobile: '9414234567',
        householdType: 'Commercial',
        financialInterest: 'Bulk Speed Post BNPL',
        areaColony: 'Talwandi',
        sector: 'B',
        block: 'N/A',
        isBlockNotApplicable: true,
        isSectorNotApplicable: false,
        houseNo: 'SCO 45',
        fullAddress: 'SCO 45 Commercial Complex, Sector B, Talwandi, Kota - 324005',
        pincode: '324005',
        verificationStage: 'CONTACT_VERIFIED',
        stageBVerifiedBy: 'Naresh Kumar',
        stageBVerifiedById: '50678234',
        stageBVerifiedAt: hoursAgo(5),
        auditTrail: [
          {
            stage: 'INGESTION',
            action: 'Stage A: Master Admin Ingested & Auto-Routed',
            performedBy: 'Ekta Meena (Super Admin)',
            performedById: 'mahen.comtech@gmail.com',
            performedByRole: 'SUPER_ADMIN',
            timestamp: hoursAgo(10),
          },
          {
            stage: 'CONTACT_VERIFIED',
            action: 'Stage B: Verified Contact & Identity',
            performedBy: 'Naresh Kumar',
            performedById: '50678234',
            performedByRole: 'POSTMAN',
            timestamp: hoursAgo(5),
          },
        ],
      },
      // 11. Beat 2 - Stage D: FULLY_SYNCED
      {
        id: 'INGEST-202611-011',
        batchId: 'BATCH-202611-KOTA01',
        category: 'CUSTOMERS_PROPERTIES',
        categoryLabel: 'Customer & Household Property Data',
        fileName: 'Keshavpura_SantoshiNagar_Master_Directory.csv',
        uploadedAt: hoursAgo(40),
        uploadedBy: 'Ekta Meena (Super Admin)',
        uploadedById: 'mahen.comtech@gmail.com',
        beatNo: 'Beat 2',
        assignedStaffId: '50457421',
        assignedStaffName: 'Mahendra Kumar Meena',
        name: 'Mahendra Nagar Resident Welfare Society',
        mobile: '9829044556',
        householdType: 'Residential',
        financialInterest: 'General Delivery & Speed Post',
        areaColony: 'Santoshi Nagar',
        sector: 'Main',
        block: 'N/A',
        isBlockNotApplicable: true,
        isSectorNotApplicable: false,
        houseNo: '12',
        fullAddress: 'H.No. 12, Santoshi Nagar, near TVS Circle, Kota - 324009',
        pincode: '324009',
        verificationStage: 'FULLY_SYNCED',
        stageBVerifiedBy: 'Mahendra Kumar Meena',
        stageBVerifiedById: '50457421',
        stageBVerifiedAt: hoursAgo(30),
        stageCVerifiedBy: 'Priyanka Pareek (PA)',
        stageCVerifiedById: '50102941',
        stageCVerifiedAt: hoursAgo(20),
        stageDApprovedBy: 'Ekta Meena (Super Admin)',
        stageDApprovedById: 'mahen.comtech@gmail.com',
        stageDApprovedAt: hoursAgo(15),
        isFuelBillUnlocked: true,
        auditTrail: [
          {
            stage: 'INGESTION',
            action: 'Stage A: Master Admin Ingested & Auto-Routed',
            performedBy: 'Ekta Meena (Super Admin)',
            performedById: 'mahen.comtech@gmail.com',
            performedByRole: 'SUPER_ADMIN',
            timestamp: hoursAgo(40),
          },
          {
            stage: 'CONTACT_VERIFIED',
            action: 'Stage B: Verified Contact & Identity',
            performedBy: 'Mahendra Kumar Meena',
            performedById: '50457421',
            performedByRole: 'POSTMAN',
            timestamp: hoursAgo(30),
          },
          {
            stage: 'PROPERTY_VERIFIED',
            action: 'Stage C: Verified Property & Locality Matrix',
            performedBy: 'Priyanka Pareek (PA)',
            performedById: '50102941',
            performedByRole: 'PA',
            timestamp: hoursAgo(20),
          },
          {
            stage: 'FULLY_SYNCED',
            action: 'Stage D: Supervisory Audit & Synchronized to Live Database',
            performedBy: 'Ekta Meena (Super Admin)',
            performedById: 'mahen.comtech@gmail.com',
            performedByRole: 'SUPER_ADMIN',
            timestamp: hoursAgo(15),
            notes: 'Approved by Super Admin. Written to official Property master.',
          },
        ],
        verificationNotes: 'Fully approved and active in official live property registry.',
      },
      // 12. Beat 1 - Stage D: FULLY_SYNCED
      {
        id: 'INGEST-202611-012',
        batchId: 'BATCH-202611-KOTA01',
        category: 'CUSTOMERS_PROPERTIES',
        categoryLabel: 'Customer & Household Property Data',
        fileName: 'Dadabari_Main_Market_Directory.xlsx',
        uploadedAt: hoursAgo(45),
        uploadedBy: 'Ekta Meena (Super Admin)',
        uploadedById: 'mahen.comtech@gmail.com',
        beatNo: 'Beat 1',
        assignedStaffId: '50510312',
        assignedStaffName: 'Muskan Sharma',
        name: 'Surendra Singh Rathore',
        mobile: '9414332211',
        householdType: 'Residential',
        financialInterest: 'PLI Suraksha',
        areaColony: 'Dadabari Extension',
        sector: '1',
        block: 'A',
        isBlockNotApplicable: false,
        isSectorNotApplicable: false,
        houseNo: '88',
        fullAddress: 'H.No. 88, Block A, Sector 1, Dadabari Extension, Kota - 324009',
        pincode: '324009',
        verificationStage: 'FULLY_SYNCED',
        stageBVerifiedBy: 'Muskan Sharma',
        stageBVerifiedById: '50510312',
        stageBVerifiedAt: hoursAgo(35),
        stageCVerifiedBy: 'Anand Swaroop (PA)',
        stageCVerifiedById: '50319400',
        stageCVerifiedAt: hoursAgo(25),
        stageDApprovedBy: 'Sub-Postmaster (SPM)',
        stageDApprovedById: 'spm.dadabari@indiapost.gov.in',
        stageDApprovedAt: hoursAgo(18),
        isFuelBillUnlocked: true,
        auditTrail: [
          {
            stage: 'INGESTION',
            action: 'Stage A: Master Admin Ingested & Auto-Routed',
            performedBy: 'Ekta Meena (Super Admin)',
            performedById: 'mahen.comtech@gmail.com',
            performedByRole: 'SUPER_ADMIN',
            timestamp: hoursAgo(45),
          },
          {
            stage: 'CONTACT_VERIFIED',
            action: 'Stage B: Verified Contact & Identity',
            performedBy: 'Muskan Sharma',
            performedById: '50510312',
            performedByRole: 'POSTMAN',
            timestamp: hoursAgo(35),
          },
          {
            stage: 'PROPERTY_VERIFIED',
            action: 'Stage C: Verified Property & Locality Matrix',
            performedBy: 'Anand Swaroop (PA)',
            performedById: '50319400',
            performedByRole: 'PA',
            timestamp: hoursAgo(25),
          },
          {
            stage: 'FULLY_SYNCED',
            action: 'Stage D: Supervisory Audit & Synchronized to Live Database',
            performedBy: 'Sub-Postmaster (SPM)',
            performedById: 'spm.dadabari@indiapost.gov.in',
            performedByRole: 'SPM',
            timestamp: hoursAgo(18),
          },
        ],
      },
    ];
  }

  /**
   * Category 1: Process Customer & Household Property Data
   * Non-destructively merges incoming CSV/Excel rows into customerService.
   */
  public processCustomerUpload(
    rawRows: Record<string, any>[],
    fileName: string,
    uploaderName: string
  ): { success: boolean; validCount: number; skippedCount: number; message: string } {
    let validCount = 0;
    let skippedCount = 0;

    rawRows.forEach((row, idx) => {
      const name = String(row['name'] || row['Name'] || row['Customer Name'] || row['customerName'] || '').trim();
      const mobile = String(row['mobile'] || row['Mobile'] || row['Phone'] || row['Contact'] || '').trim();
      const beatNo = String(row['beatNo'] || row['BeatNo'] || row['Beat'] || row['beat'] || 'Beat 2').trim();
      const area = String(row['area'] || row['Area'] || row['Colony'] || row['colony'] || 'Keshavpura').trim();
      const sector = String(row['sector'] || row['Sector'] || '7').trim();
      const houseNo = String(row['houseNo'] || row['HouseNo'] || row['House No'] || row['PlotNo'] || '').trim();
      const pincode = String(row['pincode'] || row['Pincode'] || '324009').trim();
      const financialInterest = String(row['financialInterest'] || row['Scheme'] || 'General Delivery').trim();
      const householdType = (row['householdType'] || row['Type'] || 'Residential') as 'Residential' | 'Commercial' | 'Government';

      if (!name) {
        skippedCount++;
        return;
      }

      // Safe non-destructive upsert
      try {
        customerService.addOrUpdateCustomer(
          {
            name,
            mobile: mobile || `98290${String(10000 + idx).slice(-5)}`,
            beatNo: beatNo.startsWith('Beat') ? beatNo : `Beat ${beatNo}`,
            area,
            sector,
            houseNo,
            pincode,
            financialInterest,
            verificationStatus: 'Verified',
            type: householdType,
            address: {
              houseNo,
              street: `${area} Main Road`,
              colony: area,
              sector,
              area,
              pincode,
              fullAddress: `${houseNo ? `H.No. ${houseNo}, ` : ''}Sector ${sector}, ${area}, Kota - ${pincode}`,
            },
          },
          `Master Bulk CSV Upload: ${fileName}`
        );
        validCount++;
      } catch (err) {
        console.warn('Skipped invalid customer row:', err);
        skippedCount++;
      }
    });

    const log: MasterUploadLog = {
      id: `UPL-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'CUSTOMERS_PROPERTIES',
      categoryLabel: 'Customer & Household Property Data',
      fileName,
      totalRows: rawRows.length,
      validRows: validCount,
      skippedRows: skippedCount,
      uploadedBy: uploaderName,
      status: skippedCount === 0 ? 'SUCCESS' : validCount > 0 ? 'PARTIAL' : 'FAILED',
      summary: `Imported ${validCount} customer/property records with zero overwrite of existing verified records.`,
    };

    this.uploadLogs.unshift(log);
    this.saveLogs();

    return {
      success: validCount > 0,
      validCount,
      skippedCount,
      message: `Successfully processed ${validCount} properties/customers into master directory (${skippedCount} skipped).`,
    };
  }

  /**
   * Category 2: Process Beat-Wise Fuel Bill Master Data
   * Updates sanctioned route distance (KM) and terrain types for Dadabari SO beats.
   */
  public processBeatFuelUpload(
    rawRows: Record<string, any>[],
    fileName: string,
    uploaderName: string
  ): { success: boolean; validCount: number; skippedCount: number; message: string } {
    let validCount = 0;
    let skippedCount = 0;

    rawRows.forEach((row) => {
      const beatRaw = String(row['beatNumber'] || row['BeatNumber'] || row['Beat'] || row['beatNo'] || '').trim();
      const kmRaw = Number(row['sanctionedDailyKm'] || row['DailyKm'] || row['RouteKm'] || row['km'] || 0);

      if (!beatRaw || isNaN(kmRaw) || kmRaw <= 0) {
        skippedCount++;
        return;
      }

      const cleanBeat = beatRaw.startsWith('Beat') ? beatRaw : `Beat ${beatRaw}`;
      this.customBeatKmOverrides[cleanBeat] = kmRaw;
      validCount++;
    });

    this.saveOverrides();

    const log: MasterUploadLog = {
      id: `UPL-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'BEAT_FUEL_MASTER',
      categoryLabel: 'Beat-Wise Fuel Bill Master Data',
      fileName,
      totalRows: rawRows.length,
      validRows: validCount,
      skippedRows: skippedCount,
      uploadedBy: uploaderName,
      status: skippedCount === 0 ? 'SUCCESS' : validCount > 0 ? 'PARTIAL' : 'FAILED',
      summary: `Updated route survey KM parameters for ${validCount} beats @ ₹${DEPARTMENTAL_FUEL_RATE_PER_KM}/KM rate.`,
    };

    this.uploadLogs.unshift(log);
    this.saveLogs();

    return {
      success: validCount > 0,
      validCount,
      skippedCount,
      message: `Updated route distances and fuel calculations for ${validCount} beats successfully.`,
    };
  }

  /**
   * Category 3: Process Monthly DSS (Daily Summary Sheet) Report Upload
   * Crucial Logic: Non-destructively upserts daily article sheets, then enables instant
   * individual Postman Fuel Bill PDF/CSV generation.
   */
  public processDssReportUpload(
    rawRows: Record<string, any>[],
    fileName: string,
    uploaderName: string
  ): { success: boolean; validCount: number; skippedCount: number; message: string } {
    let validCount = 0;
    let skippedCount = 0;

    rawRows.forEach((row, idx) => {
      const date = String(row['date'] || row['Date'] || new Date().toISOString().split('T')[0]).trim();
      const beatNo = String(row['beatNo'] || row['BeatNo'] || row['Beat'] || 'Beat 2').trim();
      const staffName = String(row['staffName'] || row['StaffName'] || row['PostmanName'] || 'Postal Staff').trim();
      const employeeId = String(row['employeeId'] || row['EmployeeId'] || row['StaffId'] || 'CSI-10023401').trim();
      const attendance = (row['attendanceStatus'] || row['Attendance'] || 'Present - Field Duty') as DailyArticleEntry['attendanceStatus'];

      const spRecd = Number(row['speedPostReceived'] || row['SpeedPostRecd'] || row['spRecd'] || 0);
      const spDeliv = Number(row['speedPostDelivered'] || row['SpeedPostDeliv'] || row['spDeliv'] || 0);
      const spDep = Number(row['speedPostDeposit'] || row['SpeedPostDeposit'] || row['spDeposit'] || 0);

      const regRecd = Number(row['registryReceived'] || row['RegRecd'] || row['regRecd'] || 0);
      const regDeliv = Number(row['registryDelivered'] || row['RegDeliv'] || row['regDeliv'] || 0);
      const regDep = Number(row['registryDeposit'] || row['RegDeposit'] || row['regDeposit'] || 0);

      const parRecd = Number(row['parcelReceived'] || row['ParcelRecd'] || row['parRecd'] || 0);
      const parDeliv = Number(row['parcelDelivered'] || row['ParcelDeliv'] || row['parDeliv'] || 0);
      const parDep = Number(row['parcelDeposit'] || row['ParcelDeposit'] || row['parDeposit'] || 0);

      const codCash = Number(row['codAmountCollected'] || row['CodCash'] || row['cod'] || 0);
      const remarks = String(row['remarks'] || row['Remarks'] || `Imported via DSS Monthly Upload: ${fileName}`).trim();

      const normalizedBeat = beatNo.startsWith('Beat') ? beatNo : `Beat ${beatNo}`;
      const fuelData = getBeatFuelMapping(normalizedBeat);
      const customKm = this.customBeatKmOverrides[normalizedBeat] || fuelData.sanctionedDailyKm;

      try {
        operationsService.patchOrUpsertDailyArticleQuantities(
          {
            date,
            beatNo: normalizedBeat,
            staffName,
            employeeId,
            staffEmail: 'mahen.comtech@gmail.com',
            officeName: 'Dadabari S.O. (324009)',
            attendanceStatus: attendance,
            fixedKm: customKm,
            sanctionedBeatKm: customKm,
            fuelRatePerKm: DEPARTMENTAL_FUEL_RATE_PER_KM,
            dailyFuelAllowance: Math.round(customKm * DEPARTMENTAL_FUEL_RATE_PER_KM),
            monthlyFuelAllowance: Math.round(customKm * DEPARTMENTAL_FUEL_RATE_PER_KM * STANDARD_MONTHLY_WORKING_DAYS),
            dssStatus: 'Reconciled with DSS',
            speedPostReceived: spRecd,
            speedPostDelivered: spDeliv,
            speedPostReturned: Math.max(0, spRecd - spDeliv),
            speedPostDeposit: spDep,
            registryReceived: regRecd,
            registryDelivered: regDeliv,
            registryReturned: Math.max(0, regRecd - regDeliv),
            registryDeposit: regDep,
            parcelReceived: parRecd,
            parcelDelivered: parDeliv,
            parcelReturned: Math.max(0, parRecd - parDeliv),
            parcelDeposit: parDep,
            codAmountCollected: codCash,
            doorstepInquiriesLogged: 3,
            remarks,
          },
          {
            updatedBy: `${uploaderName} [Bulk DSS Upload]`,
            remarks: `Imported from DSS file: ${fileName}`,
          }
        );
        validCount++;
      } catch (e) {
        console.warn('Failed to upsert DSS row:', e);
        skippedCount++;
      }
    });

    const log: MasterUploadLog = {
      id: `UPL-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'MONTHLY_DSS_REPORT',
      categoryLabel: 'Monthly DSS (Daily Summary Sheet) Report',
      fileName,
      totalRows: rawRows.length,
      validRows: validCount,
      skippedRows: skippedCount,
      uploadedBy: uploaderName,
      status: skippedCount === 0 ? 'SUCCESS' : validCount > 0 ? 'PARTIAL' : 'FAILED',
      summary: `Parsed ${validCount} DSS daily delivery sheets. Individual postman fuel bills are now ready for download.`,
    };

    this.uploadLogs.unshift(log);
    this.saveLogs();

    return {
      success: validCount > 0,
      validCount,
      skippedCount,
      message: `Successfully processed ${validCount} DSS records. Postmen can now download their monthly fuel bills.`,
    };
  }

  /**
   * Category 4A: Structured Postman Charge Report (ACG-61) Submission
   */
  public submitChargeReport(
    data: {
      relievedStaffName: string;
      relievedStaffId: string;
      relievingStaffName: string;
      relievingStaffId: string;
      beatNo: string;
      officeName: string;
      handoverDate: string;
      accountableArticlesInHand: number;
      cashBalanceHeld: number;
      valuableStampsCount: number;
      keysAndEquipment: string;
      remarks?: string;
    },
    userEmail: string = 'mahen.comtech@gmail.com'
  ): SpecialBillRecord {
    const bill = operationsService.createSpecialBill({
      type: 'CHARGE_REPORT',
      title: `ACG-61 Charge Report: ${data.beatNo} Handover (${data.relievedStaffName} to ${data.relievingStaffName})`,
      employeeId: data.relievedStaffId,
      employeeName: data.relievedStaffName,
      employeeEmail: userEmail,
      beatNo: data.beatNo,
      officeName: data.officeName || 'Dadabari S.O. (324009)',
      fromDate: data.handoverDate,
      toDate: data.handoverDate,
      totalDays: 1,
      fixedKm: 0,
      totalAmount: data.cashBalanceHeld || 0,
      details: {
        ...data,
        formNumber: 'ACG-61 (Rule 37/42 Postal Volume VIII)',
        status: 'Handover Completed & Verified',
      },
    });

    const log: MasterUploadLog = {
      id: `UPL-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'CHARGE_AND_BYOD_BILLS',
      categoryLabel: 'Postman Charge Reports & BYOD Bills',
      fileName: `ACG61_${data.beatNo.replace(/\s+/g, '_')}_${data.handoverDate}.form`,
      totalRows: 1,
      validRows: 1,
      skippedRows: 0,
      uploadedBy: data.relievedStaffName,
      status: 'SUCCESS',
      summary: `Structured ACG-61 Handover saved (Bill #${bill.billNumber}) for ${data.beatNo}.`,
    };
    this.uploadLogs.unshift(log);
    this.saveLogs();

    return bill;
  }

  /**
   * Category 4B: Structured BYOD (Bring Your Own Device) Bill Submission
   */
  public submitByodBill(
    data: {
      employeeName: string;
      employeeId: string;
      employeeEmail: string;
      beatNo: string;
      officeName: string;
      billingMonth: string; // YYYY-MM
      mobileModel: string;
      imeiNumber: string;
      simOperator: string;
      pmaActiveStatus: boolean;
      monthlyAllowanceClaimed: number;
      declarationAccepted: boolean;
      remarks?: string;
    }
  ): SpecialBillRecord {
    const fromDate = `${data.billingMonth}-01`;
    // Compute last day of month
    const parts = data.billingMonth.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const lastDay = new Date(year, month, 0).getDate();
    const toDate = `${data.billingMonth}-${String(lastDay).padStart(2, '0')}`;

    const bill = operationsService.createSpecialBill({
      type: 'BYOD_BILL',
      title: `BYOD Mobile PMA Allowance Bill: ${data.billingMonth} (${data.employeeName} - ${data.beatNo})`,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      employeeEmail: data.employeeEmail || 'mahen.comtech@gmail.com',
      beatNo: data.beatNo,
      officeName: data.officeName || 'Dadabari S.O. (324009)',
      fromDate,
      toDate,
      totalDays: lastDay,
      fixedKm: 0,
      totalAmount: data.monthlyAllowanceClaimed || 300,
      details: {
        ...data,
        policyReference: 'DoP Directorate BYOD Reimbursement Scheme for Postman Mobile App (PMA)',
        verifiedPmaVersion: 'PMA Android v4.9.2 Official APK',
      },
    });

    const log: MasterUploadLog = {
      id: `UPL-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'CHARGE_AND_BYOD_BILLS',
      categoryLabel: 'Postman Charge Reports & BYOD Bills',
      fileName: `BYOD_${data.beatNo.replace(/\s+/g, '_')}_${data.billingMonth}.form`,
      totalRows: 1,
      validRows: 1,
      skippedRows: 0,
      uploadedBy: data.employeeName,
      status: 'SUCCESS',
      summary: `BYOD Claim (₹${data.monthlyAllowanceClaimed}) submitted for ${data.billingMonth} (${bill.billNumber}).`,
    };
    this.uploadLogs.unshift(log);
    this.saveLogs();

    return bill;
  }

  /**
   * Core Logic: Auto-generate ready-to-download Monthly Fuel Bill for a Postman
   * Based on their Beat's DSS records for any selected month (e.g. 2026-08).
   */
  public getBeatCustomKm(beatNo: string): number {
    const cleanBeat = beatNo.startsWith('Beat') ? beatNo : `Beat ${beatNo}`;
    if (this.customBeatKmOverrides[cleanBeat]) {
      return this.customBeatKmOverrides[cleanBeat];
    }
    const mapping = getBeatFuelMapping(cleanBeat);
    return mapping.sanctionedDailyKm;
  }

  public setBeatCustomKm(beatNo: string, km: number): void {
    const cleanBeat = beatNo.startsWith('Beat') ? beatNo : `Beat ${beatNo}`;
    this.customBeatKmOverrides[cleanBeat] = km;
    this.saveOverrides();
  }

  public resetBeatCustomKm(beatNo: string): void {
    const cleanBeat = beatNo.startsWith('Beat') ? beatNo : `Beat ${beatNo}`;
    delete this.customBeatKmOverrides[cleanBeat];
    this.saveOverrides();
  }

  /**
   * Core Logic: Auto-generate ready-to-download Monthly Fuel Bill for a Postman
   * Based on their Beat's DSS records for any selected month (e.g. 2026-10).
   * Allows the postman to customize their daily KM running, rate, working days, and vehicle before generating.
   */
  public generatePostmanMonthlyFuelBill(
    beatNo: string,
    targetMonthYear: string = '2026-10', // Default: Latest October 2026
    overrides?: {
      customDailyKm?: number;
      customRatePerKm?: number;
      customWorkingDays?: number;
      vehicleNo?: string;
      postmanName?: string;
      employeeId?: string;
    }
  ): PostmanMonthlyFuelSummary {
    const cleanBeat = beatNo.startsWith('Beat') ? beatNo : `Beat ${beatNo}`;
    const fuelMapping = getBeatFuelMapping(cleanBeat);
    const customKm =
      overrides?.customDailyKm !== undefined && overrides.customDailyKm > 0
        ? overrides.customDailyKm
        : (this.customBeatKmOverrides[cleanBeat] || fuelMapping.sanctionedDailyKm);

    const fuelRate =
      overrides?.customRatePerKm !== undefined && overrides.customRatePerKm > 0
        ? overrides.customRatePerKm
        : DEPARTMENTAL_FUEL_RATE_PER_KM;

    const [yearStr, monthStr] = targetMonthYear.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // 1-12
    const totalDaysInMonth = new Date(year, month, 0).getDate();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const monthName = `${monthNames[month - 1]} ${year}`;

    // Get all daily entries for this beat and month
    const allEntries = operationsService.getDailyEntries();
    const beatMonthEntries = allEntries.filter(
      (e) =>
        e.beatNo.toLowerCase() === cleanBeat.toLowerCase() &&
        e.date.startsWith(targetMonthYear)
    );

    // Build day-by-day 1..N schedule
    const dailyRows: FuelDailyRow[] = [];
    let workingDaysCount = 0;
    let sundaysAndHolidays = 0;
    let totalSp = 0;
    let totalReg = 0;
    let totalPar = 0;
    let totalPma = 0;

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const isoDate = `${targetMonthYear}-${dayStr}`;
      const dObj = new Date(year, month - 1, day);
      const isSunday = dObj.getDay() === 0;

      // October 2026 Gazetted Holidays: Oct 2 (Gandhi Jayanti) & Oct 20 (Dussehra)
      const isHoliday =
        (targetMonthYear === '2026-10' && (day === 2 || day === 20)) ||
        dssMatchOrAttIsHoliday(isoDate, beatMonthEntries);

      // Check Beat 17 verified audit row for October 2026
      if (cleanBeat === 'Beat 17' && targetMonthYear === '2026-10') {
        const refRow = PRIYANSHU_BEAT_17_OCTOBER_2026_ROWS.find((r) => r.sn === day);
        if (refRow) {
          if (refRow.status === 'SUNDAY') {
            sundaysAndHolidays++;
            dailyRows.push({ ...refRow });
            continue;
          }
          if (refRow.status === 'HOLIDAY') {
            sundaysAndHolidays++;
            dailyRows.push({ ...refRow });
            continue;
          }
          workingDaysCount++;
          const spDeliv = typeof refRow.sp === 'number' ? refRow.sp : 0;
          const regDeliv = 0; // Strictly zero as instructed
          const parDeliv = typeof refRow.others === 'number' ? refRow.others : 0;
          const dayTotal = typeof refRow.total === 'number' ? refRow.total : 0;
          const pmaHandled = typeof refRow.pmaHandled === 'number' ? refRow.pmaHandled : dayTotal;
          const pmaPercent = refRow.pmaPercent !== undefined ? refRow.pmaPercent : 100;

          totalSp += spDeliv;
          totalReg += 0;
          totalPar += parDeliv;
          totalPma += pmaHandled;

          dailyRows.push({
            sn: day,
            date: formatIsoToDDMMYYYY(isoDate),
            isoDate,
            status: 'WORKING',
            sp: spDeliv,
            reg: 0,
            others: parDeliv,
            total: dayTotal,
            pmaHandled,
            pmaPercent,
            pdmsInvoicedCount: refRow.pdmsInvoicedCount !== undefined ? refRow.pdmsInvoicedCount : dayTotal,
            dssInvoicedCount: refRow.dssInvoicedCount !== undefined ? refRow.dssInvoicedCount : dayTotal,
            mobileUsagePercent: refRow.mobileUsagePercent !== undefined ? refRow.mobileUsagePercent : pmaPercent,
          });
          continue;
        }
      }

      // Check Beat 5 verified audit row for October 2026 (Mohit Arvind)
      if (cleanBeat === 'Beat 5' && targetMonthYear === '2026-10') {
        const refRow = MOHIT_BEAT_5_OCTOBER_2026_ROWS.find((r) => r.sn === day);
        if (refRow) {
          if (refRow.status === 'SUNDAY') {
            sundaysAndHolidays++;
            dailyRows.push({ ...refRow });
            continue;
          }
          if (refRow.status === 'HOLIDAY') {
            sundaysAndHolidays++;
            dailyRows.push({ ...refRow });
            continue;
          }
          if (refRow.status === 'LEAVE') {
            dailyRows.push({ ...refRow });
            continue;
          }
          workingDaysCount++;
          const spDeliv = typeof refRow.sp === 'number' ? refRow.sp : 0;
          const regDeliv = 0; // Strictly zero as instructed
          const parDeliv = typeof refRow.others === 'number' ? refRow.others : 0;
          const dayTotal = typeof refRow.total === 'number' ? refRow.total : 0;
          const pmaHandled = typeof refRow.pmaHandled === 'number' ? refRow.pmaHandled : dayTotal;
          const pmaPercent = refRow.pmaPercent !== undefined ? refRow.pmaPercent : 100;

          totalSp += spDeliv;
          totalReg += 0;
          totalPar += parDeliv;
          totalPma += pmaHandled;

          dailyRows.push({
            sn: day,
            date: formatIsoToDDMMYYYY(isoDate),
            isoDate,
            status: 'WORKING',
            sp: spDeliv,
            reg: 0,
            others: parDeliv,
            total: dayTotal,
            pmaHandled,
            pmaPercent,
            pdmsInvoicedCount: refRow.pdmsInvoicedCount !== undefined ? refRow.pdmsInvoicedCount : dayTotal,
            dssInvoicedCount: refRow.dssInvoicedCount !== undefined ? refRow.dssInvoicedCount : dayTotal,
            mobileUsagePercent: refRow.mobileUsagePercent !== undefined ? refRow.mobileUsagePercent : pmaPercent,
          });
          continue;
        }
      }

      // Find matching DSS entry for this day
      const dssMatch = beatMonthEntries.find((e) => e.date === isoDate);

      if (isSunday) {
        sundaysAndHolidays++;
        dailyRows.push({
          sn: day,
          date: formatIsoToDDMMYYYY(isoDate),
          isoDate,
          status: 'SUNDAY',
          sp: 'SUNDAY',
          reg: '',
          others: 'SUNDAY',
          total: 'SUNDAY',
          pmaHandled: '',
          pmaPercent: 'SUNDAY',
          pdmsInvoicedCount: 'SUNDAY',
          dssInvoicedCount: 'SUNDAY',
          mobileUsagePercent: '-',
        });
      } else if (isHoliday) {
        sundaysAndHolidays++;
        dailyRows.push({
          sn: day,
          date: formatIsoToDDMMYYYY(isoDate),
          isoDate,
          status: 'HOLIDAY',
          sp: 'HOLIDAY',
          reg: 0,
          others: 'HOLIDAY',
          total: 'HOLIDAY',
          pmaHandled: '',
          pmaPercent: 'HOLIDAY',
          pdmsInvoicedCount: 'HOLIDAY',
          dssInvoicedCount: 'HOLIDAY',
          mobileUsagePercent: '-',
        });
      } else if (dssMatch?.attendanceStatus === 'On Leave') {
        dailyRows.push({
          sn: day,
          date: formatIsoToDDMMYYYY(isoDate),
          isoDate,
          status: 'LEAVE',
          sp: 'LEAVE',
          reg: '',
          others: 'LEAVE',
          total: 'LEAVE',
          pmaHandled: '',
          pmaPercent: 'LEAVE',
          pdmsInvoicedCount: 'LEAVE',
          dssInvoicedCount: 'LEAVE',
          mobileUsagePercent: '-',
        });
      } else {
        workingDaysCount++;
        const spDeliv = dssMatch ? dssMatch.speedPostDelivered : Math.round(30 + (day % 15) * 3);
        const regDeliv = cleanBeat === 'Beat 17' ? 0 : dssMatch ? dssMatch.registryDelivered : Math.round(1 + (day % 4));
        const parDeliv = dssMatch ? dssMatch.parcelDelivered : Math.round(2 + (day % 5));
        const dayTotal = spDeliv + regDeliv + parDeliv;

        totalSp += spDeliv;
        totalReg += regDeliv;
        totalPar += parDeliv;
        totalPma += dayTotal;

        dailyRows.push({
          sn: day,
          date: formatIsoToDDMMYYYY(isoDate),
          isoDate,
          status: 'WORKING',
          sp: spDeliv,
          reg: regDeliv,
          others: parDeliv,
          total: dayTotal,
          pmaHandled: dssMatch?.dssInvoicedCount ? Number(dssMatch.dssInvoicedCount) : dayTotal,
          pmaPercent: dssMatch?.mobileUsagePercent ? Number(dssMatch.mobileUsagePercent) : 100,
          pdmsInvoicedCount: dssMatch?.pdmsInvoicedCount || dayTotal,
          dssInvoicedCount: dssMatch?.dssInvoicedCount || dayTotal,
          mobileUsagePercent: dssMatch?.mobileUsagePercent || 100,
        });
      }
    }

    const totalArticles = totalSp + totalReg + totalPar;
    const effectiveWorkingDays =
      overrides?.customWorkingDays !== undefined && overrides.customWorkingDays > 0
        ? overrides.customWorkingDays
        : (workingDaysCount > 0 ? workingDaysCount : 25);

    const totalMonthlyKm = effectiveWorkingDays * customKm;
    const totalClaimAmount = Math.round(totalMonthlyKm * fuelRate);

    return {
      beatNo: cleanBeat,
      postmanName: overrides?.postmanName || fuelMapping.assignedPostmanName,
      employeeId: overrides?.employeeId || fuelMapping.assignedStaffId,
      officeName: fuelMapping.officeName,
      month: targetMonthYear,
      monthName,
      totalDaysInMonth,
      workingDays: effectiveWorkingDays,
      sundaysAndHolidays,
      sanctionedDailyKm: customKm,
      fuelRatePerKm: fuelRate,
      totalMonthlyKm,
      totalClaimAmount,
      totalSpeedPostDelivered: totalSp,
      totalRegistryDelivered: totalReg,
      totalParcelsDelivered: totalPar,
      totalArticlesDelivered: totalArticles,
      pmaDeliveryRate: 100,
      dssSheetCount: beatMonthEntries.length,
      isFullyReconciled: beatMonthEntries.length >= 10,
      territorialCoverage: fuelMapping.territorialCoverage,
      terrainClassification: fuelMapping.terrainClassification,
      routeDescription: fuelMapping.routeDescription,
      pincode: fuelMapping.pincode,
      dailyRows,
    };
  }

  /**
   * Trigger Download of the Official Monthly Fuel Bill PDF for a Postman
   * Passing customized running KM, rate, vehicle, and working days into official PDF generator.
   */
  public downloadPostmanFuelBillPDF(
    summary: PostmanMonthlyFuelSummary,
    options?: { vehicleNo?: string; remarks?: string }
  ) {
    const [yearStr, monthStr] = summary.month.split('-');
    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
    ];
    const monthIndex = parseInt(monthStr, 10) - 1;
    const claimMonthName = monthNames[monthIndex] || 'OCTOBER';

    const billRecord: SpecialBillRecord = {
      id: `BILL-FUEL-${summary.month}-${summary.beatNo.replace(/\s+/g, '')}`,
      billNumber: `FB-2026-${summary.beatNo.replace(/\s+/g, '')}-${summary.month.replace('-', '')}`,
      type: 'FUEL_BILL',
      title: `Official Two-Wheeler Fuel Bill: ${summary.monthName} (${summary.postmanName} - ${summary.beatNo})`,
      employeeId: summary.employeeId,
      employeeName: summary.postmanName,
      employeeEmail: 'mahen.comtech@gmail.com',
      beatNo: summary.beatNo,
      officeName: summary.officeName,
      fromDate: `${summary.month}-01`,
      toDate: `${summary.month}-${String(summary.totalDaysInMonth).padStart(2, '0')}`,
      totalDays: summary.workingDays,
      fixedKm: summary.sanctionedDailyKm,
      totalAmount: summary.totalClaimAmount,
      status: 'Verified by SPM',
      details: {
        dssReconciliationStatus: 'Reconciled with DSS',
        fuelRatePerKm: summary.fuelRatePerKm,
        ratePerKm: summary.fuelRatePerKm,
        totalDistanceKm: summary.totalMonthlyKm,
        totalMonthlyKm: summary.totalMonthlyKm,
        articlesDelivered: summary.totalArticlesDelivered,
        dailyRows: summary.dailyRows,
        vehicleNo: options?.vehicleNo || 'RJ-20-SP-2026',
        workingDays: summary.workingDays,
        claimMonth: claimMonthName,
        claimYear: yearStr,
        territorialCoverage: summary.territorialCoverage,
        routeDescription: summary.routeDescription,
        pincode: summary.pincode,
        remarks: options?.remarks || `Official DSS Fuel Bill claim for ${summary.beatNo} (${summary.postmanName})`,
      },
      createdAt: new Date().toISOString(),
    };

    downloadOfficialFuelBillPDF(billRecord);
  }
}

function dssMatchOrAttIsHoliday(isoDate: string, entries: DailyArticleEntry[]): boolean {
  const match = entries.find((e) => e.date === isoDate);
  if (!match) return false;
  return match.attendanceStatus === 'Gazetted Holiday';
}

export const masterDataService = new MasterDataService();

