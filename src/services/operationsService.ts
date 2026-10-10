import { DailyArticleEntry, SpecialBillRecord, SpecialBillType } from '../types/models';
import { customerService } from './customerService';
import { staffPermissionService } from './staffPermissionService';
import { MAHEN_FUEL_REFERENCE_ROWS } from '../utils/fuelBillPdfGenerator';
import {
  createBackupSpreadsheet,
  ensureSheetTabsExist,
  writeSheetTabValues,
  sendGmailMessage,
  listFiles,
} from '../lib/google-workspace';
import * as XLSX from 'xlsx';

import {
  GDS_MTS_MODULES,
  LMSExtendedModule,
  LMSExtendedTopic,
  LMSTopicQuizQuestion,
  LMSTopicTheorySection,
} from '../data/lmsMtsSyllabus';
import { GDS_POSTMAN_AND_PA_MODULES } from '../data/lmsPostmanSyllabus';
import {
  FULL_MOCK_TEST_SERIES,
  LMSMockTestSet,
  LMSMockTestQuestion,
} from '../data/lmsMockTestSeries';

const STORAGE_KEY_DAILY_ARTICLES = 'indiapost_daily_articles_v1';
const STORAGE_KEY_SPECIAL_BILLS = 'indiapost_special_bills_v2';
const STORAGE_KEY_LMS_TOPICS = 'indiapost_lms_completed_topics_v1';
const STORAGE_KEY_LMS_QUIZZES = 'indiapost_lms_quiz_attempts_v1';
const STORAGE_KEY_BACKUP_STATE = 'indiapost_backup_engine_state_v1';

export type LMSTopicItem = LMSExtendedTopic;
export type LMSModule = LMSExtendedModule;
export type {
  LMSTopicQuizQuestion,
  LMSTopicTheorySection,
  LMSMockTestSet,
  LMSMockTestQuestion,
};
export { FULL_MOCK_TEST_SERIES };

export interface LMSQuizQuestion {
  id: string;
  categoryId: 'GDS_MTS' | 'GDS_POSTMAN' | 'GDS_PA_SA';
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  pyqTag?: string;
  ruleReference?: string;
}

export interface LMSQuizAttempt {
  id: string;
  categoryId: 'GDS_MTS' | 'GDS_POSTMAN' | 'GDS_PA_SA';
  categoryName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  staffName: string;
  completedAt: string;
  testType?: 'TOPIC_QUIZ' | 'FULL_MOCK_TEST';
  testTitle?: string;
}

export interface BackupEngineState {
  masterAdminEmail: string;
  autoSyncEnabled: boolean;
  backupFrequency: 'Daily' | 'Weekly' | 'Real-time Queue';
  linkedSpreadsheetId: string;
  linkedSpreadsheetUrl: string;
  lastSheetsSyncAt: string | null;
  lastEmailBackupAt: string | null;
  pendingChangesCount: number;
  syncHistory: {
    id: string;
    timestamp: string;
    type: 'SHEETS_SYNC' | 'GMAIL_BACKUP' | 'EXCEL_EXPORT';
    status: 'Success' | 'Failed';
    summary: string;
  }[];
}

export const POSTAL_LMS_MODULES: LMSModule[] = [
  ...GDS_MTS_MODULES,
  ...GDS_POSTMAN_AND_PA_MODULES,
];

export const POSTAL_LMS_QUIZ_BANK: LMSQuizQuestion[] = FULL_MOCK_TEST_SERIES.flatMap((set) =>
  set.questions.map((q) => ({
    id: q.id,
    categoryId: set.examCategory,
    subject: q.subject,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    pyqTag: q.pyqTag,
    ruleReference: q.ruleReference,
  }))
);

class OperationsService {
  private dailyEntries: DailyArticleEntry[] = [];
  private specialBills: SpecialBillRecord[] = [];
  private completedTopics: Set<string> = new Set();
  private quizAttempts: LMSQuizAttempt[] = [];
  private backupState: BackupEngineState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.backupState = this.loadBackupState();
    this.loadDailyEntries();
    this.loadSpecialBills();
    this.loadLMSProgress();

    // Listen to customerService changes for background auto-sync queue tracking
    customerService.subscribe(() => {
      this.incrementPendingSync();
    });
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error(e);
      }
    });
  }

  private loadDailyEntries() {
    const today = new Date().toISOString().split('T')[0];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DAILY_ARTICLES);
      if (raw) {
        this.dailyEntries = JSON.parse(raw);
        return;
      }
    } catch (e) {
      console.warn(e);
    }

    // Seed initial daily article entries for Dadabari SO Beats
    this.dailyEntries = [
      {
        id: 'ART-2026-001',
        date: today,
        employeeId: 'CSI-10294812',
        staffName: 'Ekta Meena',
        staffEmail: 'ektamahenmeena@gmail.com',
        beatNo: 'Beat 2',
        officeName: 'Dadabari S.O. (324009)',
        attendanceStatus: 'Present - Field Duty',
        fixedKm: 18,
        registryReceived: 42,
        registryDelivered: 39,
        registryReturned: 2,
        registryDeposit: 1,
        speedPostReceived: 68,
        speedPostDelivered: 65,
        speedPostReturned: 2,
        speedPostDeposit: 1,
        parcelReceived: 19,
        parcelDelivered: 18,
        parcelReturned: 1,
        parcelDeposit: 0,
        codAmountCollected: 14850,
        doorstepInquiriesLogged: 6,
        remarks: 'Keshavpura Sector 6 & 7 100% beat round completed via PMA.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ART-2026-002',
        date: today,
        employeeId: '50510312',
        staffName: 'Muskan Sharma',
        staffEmail: 'muskan.sharma@indiapost.gov.in',
        beatNo: 'Beat 1',
        officeName: 'Dadabari S.O. (324009)',
        attendanceStatus: 'Present - Field Duty',
        fixedKm: 16,
        registryReceived: 35,
        registryDelivered: 33,
        registryReturned: 1,
        registryDeposit: 1,
        speedPostReceived: 54,
        speedPostDelivered: 52,
        speedPostReturned: 1,
        speedPostDeposit: 1,
        parcelReceived: 14,
        parcelDelivered: 13,
        parcelReturned: 0,
        parcelDeposit: 1,
        codAmountCollected: 8400,
        doorstepInquiriesLogged: 4,
        remarks: 'Dadabari Main Sector 1 & 2 commercial & residential delivery done.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ART-2026-003',
        date: today,
        employeeId: '10310735',
        staffName: 'Govind Prasad',
        staffEmail: 'govind.prasad@indiapost.gov.in',
        beatNo: 'Beat 4',
        officeName: 'Dadabari S.O. (324009)',
        attendanceStatus: 'Present - Field Duty',
        fixedKm: 20,
        registryReceived: 38,
        registryDelivered: 36,
        registryReturned: 2,
        registryDeposit: 0,
        speedPostReceived: 61,
        speedPostDelivered: 58,
        speedPostReturned: 2,
        speedPostDeposit: 1,
        parcelReceived: 16,
        parcelDelivered: 15,
        parcelReturned: 1,
        parcelDeposit: 0,
        codAmountCollected: 11200,
        doorstepInquiriesLogged: 5,
        remarks: '3 new SSA leads collected during Speed Post delivery.',
        createdAt: new Date().toISOString(),
      },
    ];
    this.saveDailyEntries();
  }

  private saveDailyEntries() {
    try {
      localStorage.setItem(STORAGE_KEY_DAILY_ARTICLES, JSON.stringify(this.dailyEntries));
    } catch (e) {
      console.warn(e);
    }
  }

  public getDailyEntries(): DailyArticleEntry[] {
    return [...this.dailyEntries];
  }

  public addDailyEntry(
    entry: Omit<DailyArticleEntry, 'id' | 'createdAt'>
  ): DailyArticleEntry {
    const newEntry: DailyArticleEntry = {
      ...entry,
      id: `ART-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    this.dailyEntries.unshift(newEntry);
    this.saveDailyEntries();
    this.incrementPendingSync();
    this.notify();
    return newEntry;
  }

  // ================= SPECIAL FORMS & REIMBURSEMENTS =================
  private loadSpecialBills() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SPECIAL_BILLS);
      if (raw) {
        this.specialBills = JSON.parse(raw);
        return;
      }
    } catch (e) {
      console.warn(e);
    }

    const today = new Date().toISOString().split('T')[0];
    this.specialBills = [
      {
        id: 'BILL-MAHEN-001',
        billNumber: 'DOP/KOTA/ANNEXURE-III/2026/09',
        type: 'FUEL_BILL',
        title: 'Annexure-III Fuel Reimbursement Claim Form (MAHENDRA KUMAR MEENA)',
        employeeId: '50457421',
        employeeName: 'MAHENDRA KUMAR MEENA',
        employeeEmail: 'mahen.comtech@gmail.com',
        beatNo: '2',
        officeName: 'Dadabari s.o.',
        fromDate: '2026-08-01',
        toDate: '2026-08-30',
        totalDays: 25,
        fixedKm: 30,
        totalAmount: 2700,
        status: 'Sanctioned',
        details: {
          claimMonth: 'SEPTEMBER',
          claimYear: '2026',
          calendarDays: 30,
          workingDays: 25,
          leaveDays: 5,
          totalDistanceKm: 750,
          ratePerKm: 3.6,
          vehicleNo: 'RJ-20-SS-4521',
          remarks: 'Doorstep delivery of 1,203 Accountable Articles (100% PMA handled) across Beat 2 Dadabari S.O.',
          spmVerificationNote: 'Checked and found genuine & Forwarded to Division Office for sanction.',
          dailyRows: MAHEN_FUEL_REFERENCE_ROWS,
        },
        createdAt: today,
      },
      {
        id: 'BILL-001',
        billNumber: 'DOP/KOTA/FUEL/2026/081',
        type: 'FUEL_BILL',
        title: 'Monthly Fixed-KM Fuel Allowance Claim',
        employeeId: 'CSI-10294812',
        employeeName: 'Ekta Meena',
        employeeEmail: 'ektamahenmeena@gmail.com',
        beatNo: 'Beat 2',
        officeName: 'Dadabari S.O. (324009)',
        fromDate: '2026-08-01',
        toDate: '2026-08-26',
        totalDays: 24,
        fixedKm: 18,
        totalAmount: 2808,
        status: 'Verified by SPM',
        details: {
          workingDays: 24,
          leaveDays: 2,
          totalDistanceKm: 432,
          ratePerKm: 6.5,
          vehicleNo: 'RJ-20-SS-4521',
          remarks: 'Beat 2 Keshavpura Sector 6 & 7 motorized delivery duty.',
        },
        createdAt: today,
      },
      {
        id: 'BILL-002',
        billNumber: 'DOP/KOTA/ACG61/2026/019',
        type: 'CHARGE_REPORT',
        title: 'ACG-61 Official Transfer of Charge Report',
        employeeId: 'CSI-10023401',
        employeeName: 'Mahendra Kumar Meena',
        employeeEmail: 'mahen.comtech@gmail.com',
        beatNo: 'Beat 2',
        officeName: 'Dadabari S.O. (324009)',
        fromDate: '2026-08-20',
        toDate: '2026-08-25',
        totalDays: 6,
        fixedKm: 22,
        totalAmount: 0,
        status: 'Sanctioned',
        details: {
          relievedOfficerName: 'Rajesh Sharma',
          relievedOfficerId: 'CSI-10089231',
          relievedDesignation: 'Postman Beat 2',
          relievingOfficerName: 'Mahendra Kumar Meena',
          relievingOfficerId: 'CSI-10023401',
          relievingDesignation: 'Postal Operator / Admin',
          sessionType: 'Forenoon (F/N)',
          reasonForTransfer: 'Earned Leave Arrangement & Beat Audit',
          cashAndStampsHandedOver: 'PMA Device #KT-02, Beat 2 Key Set, Postage Due Balance ₹0',
          orderReferenceNo: 'B2/Chg-Arrangement/Dadabari/2026-27',
        },
        createdAt: today,
      },
      {
        id: 'BILL-003',
        billNumber: 'DOP/KOTA/BYOD/2026/044',
        type: 'BYOD_BILL',
        title: 'BYOD Mobile Device & Data Usage Reimbursement',
        employeeId: '50510312',
        employeeName: 'Muskan Sharma',
        employeeEmail: 'muskan.sharma@indiapost.gov.in',
        beatNo: 'Beat 1',
        officeName: 'Dadabari S.O. (324009)',
        fromDate: '2026-08-01',
        toDate: '2026-08-31',
        totalDays: 31,
        fixedKm: 16,
        totalAmount: 450,
        status: 'Submitted',
        details: {
          imeiNumber: '864920051829310',
          deviceModel: 'Samsung Galaxy A35 5G (Android 14)',
          appInstalled: 'PMA v4.2 + IPPB MicroATM + CELC',
          dataPlanAmount: 250,
          deviceAllowanceAmount: 200,
          telecomOperator: 'Jio 5G Postpaid / Prepaid',
          invoiceRef: 'JIO-INV-8823410',
        },
        attachmentName: 'Jio_Recharge_Invoice_Aug2026.pdf',
        createdAt: today,
      },
    ];
    this.saveSpecialBills();
  }

  private saveSpecialBills() {
    try {
      localStorage.setItem(STORAGE_KEY_SPECIAL_BILLS, JSON.stringify(this.specialBills));
    } catch (e) {
      console.warn(e);
    }
  }

  public getSpecialBills(): SpecialBillRecord[] {
    return [...this.specialBills];
  }

  public createSpecialBill(
    bill: Omit<SpecialBillRecord, 'id' | 'billNumber' | 'createdAt' | 'status'>
  ): SpecialBillRecord {
    const prefixMap: Record<SpecialBillType, string> = {
      FUEL_BILL: 'FUEL',
      CHARGE_REPORT: 'ACG61',
      OUTSIDER_BILL: 'OUT',
      BYOD_BILL: 'BYOD',
    };
    const newRecord: SpecialBillRecord = {
      ...bill,
      id: `BILL-${Date.now().toString().slice(-6)}`,
      billNumber: `DOP/KOTA/${prefixMap[bill.type]}/2026/${Math.floor(100 + Math.random() * 900)}`,
      status: 'Submitted',
      createdAt: new Date().toISOString().split('T')[0],
    };
    this.specialBills.unshift(newRecord);
    this.saveSpecialBills();
    this.incrementPendingSync();
    this.notify();
    return newRecord;
  }

  public updateSpecialBillStatus(
    id: string,
    status: SpecialBillRecord['status']
  ): SpecialBillRecord | undefined {
    const found = this.specialBills.find((b) => b.id === id);
    if (!found) return undefined;
    found.status = status;
    this.saveSpecialBills();
    this.incrementPendingSync();
    this.notify();
    return found;
  }

  // ================= LMS PROGRESS & QUIZ TRACKER =================
  private loadLMSProgress() {
    try {
      const rawTopics = localStorage.getItem(STORAGE_KEY_LMS_TOPICS);
      if (rawTopics) {
        this.completedTopics = new Set(JSON.parse(rawTopics));
      } else {
        // Seed 3 completed topics
        this.completedTopics = new Set(['MTS-T1', 'MTS-T2', 'PM-T1']);
      }

      const rawQuizzes = localStorage.getItem(STORAGE_KEY_LMS_QUIZZES);
      if (rawQuizzes) {
        this.quizAttempts = JSON.parse(rawQuizzes);
      } else {
        this.quizAttempts = [
          {
            id: 'QZ-001',
            categoryId: 'GDS_MTS',
            categoryName: 'Category 1: GDS to MTS',
            score: 4,
            totalQuestions: 4,
            percentage: 100,
            staffName: 'Ekta Meena',
            completedAt: new Date().toISOString().split('T')[0],
          },
        ];
      }
    } catch (e) {
      console.warn(e);
    }
  }

  public isTopicCompleted(topicId: string): boolean {
    return this.completedTopics.has(topicId);
  }

  public toggleTopicCompleted(topicId: string): boolean {
    if (this.completedTopics.has(topicId)) {
      this.completedTopics.delete(topicId);
    } else {
      this.completedTopics.add(topicId);
    }
    try {
      localStorage.setItem(
        STORAGE_KEY_LMS_TOPICS,
        JSON.stringify(Array.from(this.completedTopics))
      );
    } catch (e) {
      console.warn(e);
    }
    this.notify();
    return this.completedTopics.has(topicId);
  }

  public getCompletedTopicsCount(categoryId?: 'GDS_MTS' | 'GDS_POSTMAN' | 'GDS_PA_SA'): {
    completed: number;
    total: number;
    percentage: number;
  } {
    const mods = categoryId
      ? POSTAL_LMS_MODULES.filter((m) => m.categoryId === categoryId)
      : POSTAL_LMS_MODULES;
    let total = 0;
    let completed = 0;
    mods.forEach((m) => {
      m.topics.forEach((t) => {
        total++;
        if (this.completedTopics.has(t.id)) completed++;
      });
    });
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  public getQuizAttempts(): LMSQuizAttempt[] {
    return [...this.quizAttempts];
  }

  public recordQuizAttempt(attempt: Omit<LMSQuizAttempt, 'id' | 'completedAt'>): LMSQuizAttempt {
    const rec: LMSQuizAttempt = {
      ...attempt,
      id: `QZ-${Date.now().toString().slice(-5)}`,
      completedAt: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };
    this.quizAttempts.unshift(rec);
    try {
      localStorage.setItem(STORAGE_KEY_LMS_QUIZZES, JSON.stringify(this.quizAttempts));
    } catch (e) {
      console.warn(e);
    }
    this.notify();
    return rec;
  }

  // ================= CENTRALIZED BACKUP & AUTO-SYNC ENGINE =================
  private loadBackupState(): BackupEngineState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BACKUP_STATE);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn(e);
    }
    return {
      masterAdminEmail: 'mahen.comtech@gmail.com',
      autoSyncEnabled: true,
      backupFrequency: 'Daily',
      linkedSpreadsheetId: '',
      linkedSpreadsheetUrl: '',
      lastSheetsSyncAt: null,
      lastEmailBackupAt: null,
      pendingChangesCount: 0,
      syncHistory: [],
    };
  }

  private saveBackupState() {
    try {
      localStorage.setItem(STORAGE_KEY_BACKUP_STATE, JSON.stringify(this.backupState));
    } catch (e) {
      console.warn(e);
    }
  }

  public getBackupState(): BackupEngineState {
    return { ...this.backupState };
  }

  public updateBackupSettings(updates: Partial<BackupEngineState>) {
    this.backupState = { ...this.backupState, ...updates };
    this.saveBackupState();
    this.notify();
  }

  private incrementPendingSync() {
    if (!this.backupState) return;
    this.backupState.pendingChangesCount = (this.backupState.pendingChangesCount || 0) + 1;
    this.saveBackupState();
    this.notify();
  }

  /**
   * Synchronizes all 6 core CRM & Operations datasets directly to Google Sheets
   * under the Master Admin account (mahen.comtech@gmail.com).
   */
  public async syncAllToGoogleSheets(accessToken: string): Promise<{
    spreadsheetId: string;
    spreadsheetUrl: string;
    totalRowsSynced: number;
  }> {
    const requiredTabs = [
      'Customers',
      'Properties',
      'Daily_Entries',
      'Bills_Claims',
      'Tasks',
      'Leads',
    ];

    let spreadsheetId = this.backupState.linkedSpreadsheetId;
    let spreadsheetUrl = this.backupState.linkedSpreadsheetUrl;

    if (!spreadsheetId) {
      // Search Drive first for an existing backup sheet
      try {
        const searchRes = await listFiles(
          accessToken,
          "name contains 'India Post CRM Master Backup' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false"
        );
        if (searchRes?.files && searchRes.files.length > 0) {
          spreadsheetId = searchRes.files[0].id;
          spreadsheetUrl =
            searchRes.files[0].webViewLink ||
            `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
        }
      } catch (e) {
        console.warn('Drive search skipped, creating new sheet:', e);
      }
    }

    if (!spreadsheetId) {
      const created = await createBackupSpreadsheet(
        accessToken,
        `India Post CRM Master Backup - Dadabari SO (mahen.comtech@gmail.com)`,
        requiredTabs
      );
      spreadsheetId = created.spreadsheetId;
      spreadsheetUrl = created.spreadsheetUrl;
    } else {
      await ensureSheetTabsExist(accessToken, spreadsheetId, requiredTabs);
    }

    // 1. Prepare Customers rows
    const customers = customerService.getCustomers();
    const customerRows: (string | number)[][] = [
      [
        'Master ID',
        'Customer Name',
        'Mobile',
        'House No',
        'Sector',
        'Area',
        'Beat No',
        'Verification Status',
        'Financial Interest',
        'Entered By',
        'Remarks',
      ],
      ...customers.map((c) => [
        c.masterId || c.id,
        c.name || '',
        c.mobile || '',
        c.houseNo || c.address?.houseNumber || '',
        c.sector || c.address?.sectorLocality || '',
        c.area || 'Keshavpura',
        c.beatNo || 'Beat 2',
        c.verificationStatus || 'Verified',
        c.financialInterest || '',
        c.enteredBy || 'mahen.comtech@gmail.com',
        c.remarks || '',
      ]),
    ];

    // 2. Prepare Properties rows
    const properties = customerService.getProperties();
    const propertyRows: (string | number)[][] = [
      ['Property Code', 'Plot / House No', 'Sector', 'Area', 'Beat No', 'Status', 'Residents Count', 'Pincode'],
      ...properties.map((p) => [
        p.propertyCode || p.id,
        p.housePlotNumber || '',
        p.sector || '',
        p.area || 'Keshavpura',
        p.beatNo || '2',
        p.status || 'Occupied',
        p.residentNames?.length || 0,
        p.pincode || '324009',
      ]),
    ];

    // 3. Prepare Daily Field Entries rows
    const dailyRows: (string | number)[][] = [
      [
        'Entry ID',
        'Date',
        'Employee ID',
        'Staff Name',
        'Beat',
        'Attendance',
        'Fixed KM',
        'Regd Recd',
        'Regd Deliv',
        'Speed Post Recd',
        'Speed Post Deliv',
        'Parcel Recd',
        'Parcel Deliv',
        'COD Cash (INR)',
        'Remarks',
      ],
      ...this.dailyEntries.map((d) => [
        d.id,
        d.date,
        d.employeeId,
        d.staffName,
        d.beatNo,
        d.attendanceStatus,
        d.fixedKm,
        d.registryReceived,
        d.registryDelivered,
        d.speedPostReceived,
        d.speedPostDelivered,
        d.parcelReceived,
        d.parcelDelivered,
        d.codAmountCollected,
        d.remarks || '',
      ]),
    ];

    // 4. Prepare Bills & Claims rows
    const billRows: (string | number)[][] = [
      [
        'Bill Number',
        'Form Type',
        'Title',
        'Employee ID',
        'Staff Name',
        'Beat',
        'Office',
        'From Date',
        'To Date',
        'Total Days',
        'Fixed KM',
        'Total Claim (INR)',
        'Status',
      ],
      ...this.specialBills.map((b) => [
        b.billNumber,
        b.type,
        b.title,
        b.employeeId,
        b.employeeName,
        b.beatNo,
        b.officeName,
        b.fromDate,
        b.toDate,
        b.totalDays,
        b.fixedKm,
        b.totalAmount,
        b.status,
      ]),
    ];

    // 5. Prepare Tasks rows
    const tasks = customerService.getTasks();
    const taskRows: (string | number)[][] = [
      ['Task ID', 'Title', 'Category', 'Assigned To', 'Beat', 'Location', 'Priority', 'Status', 'Due Date'],
      ...tasks.map((t: any) => [
        t.id || '',
        t.title || '',
        t.category || '',
        t.assignedTo || '',
        t.beatNo || '',
        t.location || '',
        t.priority || 'Medium',
        t.status || 'Pending',
        t.dueDate || '',
      ]),
    ];

    // 6. Prepare Leads rows
    const leads = customerService.getLeads();
    const leadRows: (string | number)[][] = [
      [
        'Lead ID',
        'Customer Name',
        'Mobile',
        'Product / Scheme',
        'Stage',
        'Priority',
        'Estimated Value (INR)',
        'Assigned Staff',
        'Requirement',
      ],
      ...leads.map((l) => [
        l.id,
        l.customerName,
        l.customerMobile,
        l.productName,
        l.stage,
        l.priority,
        l.estimatedValue || 0,
        l.assignedStaffName || '',
        l.requirement || '',
      ]),
    ];

    await Promise.all([
      writeSheetTabValues(accessToken, spreadsheetId, 'Customers', customerRows),
      writeSheetTabValues(accessToken, spreadsheetId, 'Properties', propertyRows),
      writeSheetTabValues(accessToken, spreadsheetId, 'Daily_Entries', dailyRows),
      writeSheetTabValues(accessToken, spreadsheetId, 'Bills_Claims', billRows),
      writeSheetTabValues(accessToken, spreadsheetId, 'Tasks', taskRows),
      writeSheetTabValues(accessToken, spreadsheetId, 'Leads', leadRows),
    ]);

    const totalRowsSynced =
      customers.length +
      properties.length +
      this.dailyEntries.length +
      this.specialBills.length +
      tasks.length +
      leads.length;

    const nowStr = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    this.backupState.linkedSpreadsheetId = spreadsheetId;
    this.backupState.linkedSpreadsheetUrl = spreadsheetUrl;
    this.backupState.lastSheetsSyncAt = nowStr;
    this.backupState.pendingChangesCount = 0;
    this.backupState.syncHistory.unshift({
      id: `SYNC-${Date.now()}`,
      timestamp: nowStr,
      type: 'SHEETS_SYNC',
      status: 'Success',
      summary: `Synced ${totalRowsSynced} total records across 6 tabs (Customers, Properties, Daily_Entries, Bills_Claims, Tasks, Leads) to Google Sheets.`,
    });
    this.saveBackupState();
    this.notify();

    return {
      spreadsheetId,
      spreadsheetUrl,
      totalRowsSynced,
    };
  }

  /**
   * Sends a comprehensive Daily/Weekly CRM Activity & Database Backup Summary Email
   * directly to mahen.comtech@gmail.com via the Gmail API.
   */
  public async sendEmailActivitySummary(
    accessToken: string,
    reportPeriod: 'Daily' | 'Weekly' = 'Daily'
  ): Promise<void> {
    const customers = customerService.getCustomers();
    const properties = customerService.getProperties();
    const leads = customerService.getLeads();
    const tasks = customerService.getTasks();
    const followUps = customerService.getFollowUps();
    const staffProfiles = staffPermissionService.getStaffProfiles();

    const pendingTasks = tasks.filter((t: any) => t.status !== 'Completed').length;
    const pendingFollowUps = followUps.filter((f) => f.currentStatus !== 'Completed').length;
    const totalArticlesDelivered = this.dailyEntries.reduce(
      (sum, d) => sum + d.registryDelivered + d.speedPostDelivered + d.parcelDelivered,
      0
    );
    const totalCodCollected = this.dailyEntries.reduce(
      (sum, d) => sum + (d.codAmountCollected || 0),
      0
    );
    const totalBillsAmount = this.specialBills.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );

    const dateLabel = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const subject = `[India Post CRM] ${reportPeriod} Operations & Database Backup Summary (${dateLabel}) - Dadabari S.O.`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #991b1b; color: #ffffff; padding: 20px 24px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #fde68a; font-weight: bold;">
            Department of Posts • Dadabari Sub-Post Office (324009)
          </div>
          <h2 style="margin: 6px 0 4px; font-size: 20px;">${reportPeriod} CRM & Postman Operations Backup Report</h2>
          <p style="margin: 0; font-size: 12px; color: #fecaca;">Master Admin Account: mahen.comtech@gmail.com • Generated on ${dateLabel}</p>
        </div>
        <div style="padding: 24px; background: #ffffff; color: #0f172a;">
          <h3 style="margin-top: 0; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">1. Core CRM & Master Database Totals</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Verified Customers</strong></td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">${customers.length}</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Mapped Properties</strong></td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">${properties.length}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Scheme Leads (PLI/SSA/IPPB)</strong></td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">${leads.length}</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Registered Staff Profiles</strong></td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">${staffProfiles.length}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Pending Field Tasks</strong></td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">${pendingTasks}</td>
              <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><strong>Scheduled Follow-ups</strong></td>
              <td style="padding: 8px; border: 1px solid #cbd5e1;">${pendingFollowUps}</td>
            </tr>
          </table>

          <h3 style="font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">2. Postman Daily Article & Special Bills Summary</h3>
          <ul style="font-size: 13px; line-height: 1.7; padding-left: 18px;">
            <li><strong>Daily Article Logs Recorded:</strong> ${this.dailyEntries.length} Beat Sessions (${totalArticlesDelivered} Registry/Speed Post/Parcel articles delivered)</li>
            <li><strong>Total COD / VPP Cash Collected:</strong> ₹${totalCodCollected.toLocaleString('en-IN')}</li>
            <li><strong>Special Bills & Claims Logged:</strong> ${this.specialBills.length} Vouchers (Total Claimed: ₹${totalBillsAmount.toLocaleString('en-IN')})</li>
            ${
              this.backupState.linkedSpreadsheetUrl
                ? `<li><strong>Live Google Sheet Backup Link:</strong> <a href="${this.backupState.linkedSpreadsheetUrl}">${this.backupState.linkedSpreadsheetUrl}</a></li>`
                : ''
            }
          </ul>
          <p style="font-size: 11px; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            Automated dispatch from India Post CRM & Postman Operations OS • Kota Division, Rajasthan Circle.
          </p>
        </div>
      </div>
    `;

    await sendGmailMessage(accessToken, 'mahen.comtech@gmail.com', subject, htmlBody);

    const nowStr = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    this.backupState.lastEmailBackupAt = nowStr;
    this.backupState.syncHistory.unshift({
      id: `EMAIL-${Date.now()}`,
      timestamp: nowStr,
      type: 'GMAIL_BACKUP',
      status: 'Success',
      summary: `Dispatched ${reportPeriod} CRM Activity & Backup Summary email to mahen.comtech@gmail.com.`,
    });
    this.saveBackupState();
    this.notify();
  }

  /**
   * Exports all 6 CRM & Operations datasets as a single multi-sheet Excel (.xlsx) Backup Workbook
   */
  public exportFullDatabaseWorkbook(): void {
    const wb = XLSX.utils.book_new();

    const customers = customerService.getCustomers().map((c) => ({
      'Master ID': c.masterId || c.id,
      'Customer Name': c.name,
      Mobile: c.mobile,
      'House No': c.houseNo || c.address?.houseNumber || '',
      Sector: c.sector || '',
      Area: c.area || 'Keshavpura',
      Beat: c.beatNo || 'Beat 2',
      Status: c.verificationStatus,
      'Financial Interest': c.financialInterest || '',
      'Entered By': c.enteredBy || 'mahen.comtech@gmail.com',
      Remarks: c.remarks || '',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(customers), 'Customers');

    const properties = customerService.getProperties().map((p) => ({
      'Property Code': p.propertyCode || p.id,
      'Plot/House No': p.housePlotNumber || '',
      Sector: p.sector || '',
      Area: p.area || 'Keshavpura',
      Beat: p.beatNo || '2',
      Status: p.status,
      'Residents Count': p.residentNames?.length || 0,
      Pincode: p.pincode || '324009',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(properties), 'Properties');

    const dailyArticles = this.dailyEntries.map((d) => ({
      'Entry ID': d.id,
      Date: d.date,
      'Employee ID': d.employeeId,
      'Staff Name': d.staffName,
      Beat: d.beatNo,
      Attendance: d.attendanceStatus,
      'Fixed KM': d.fixedKm,
      'Regd Recd': d.registryReceived,
      'Regd Deliv': d.registryDelivered,
      'Speed Post Recd': d.speedPostReceived,
      'Speed Post Deliv': d.speedPostDelivered,
      'Parcel Recd': d.parcelReceived,
      'Parcel Deliv': d.parcelDelivered,
      'COD Cash (INR)': d.codAmountCollected,
      Remarks: d.remarks || '',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dailyArticles), 'Daily_Entries');

    const bills = this.specialBills.map((b) => ({
      'Bill Number': b.billNumber,
      'Form Type': b.type,
      Title: b.title,
      'Employee ID': b.employeeId,
      'Staff Name': b.employeeName,
      Beat: b.beatNo,
      Office: b.officeName,
      'From Date': b.fromDate,
      'To Date': b.toDate,
      'Total Days': b.totalDays,
      'Fixed KM': b.fixedKm,
      'Total Claim (INR)': b.totalAmount,
      Status: b.status,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bills), 'Bills_Claims');

    const tasks = customerService.getTasks().map((t: any) => ({
      'Task ID': t.id,
      Title: t.title,
      Category: t.category,
      'Assigned To': t.assignedTo,
      Beat: t.beatNo,
      Location: t.location,
      Priority: t.priority,
      Status: t.status,
      'Due Date': t.dueDate,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tasks), 'Tasks');

    const leads = customerService.getLeads().map((l) => ({
      'Lead ID': l.id,
      'Customer Name': l.customerName,
      Mobile: l.customerMobile,
      Scheme: l.productName,
      Stage: l.stage,
      Priority: l.priority,
      'Est Value (INR)': l.estimatedValue || 0,
      'Assigned Staff': l.assignedStaffName || '',
      Requirement: l.requirement || '',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(leads), 'Leads');

    const fileName = `INDIA_POST_CRM_FULL_BACKUP_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    const nowStr = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    this.backupState.syncHistory.unshift({
      id: `EXP-${Date.now()}`,
      timestamp: nowStr,
      type: 'EXCEL_EXPORT',
      status: 'Success',
      summary: `Downloaded full 6-sheet Excel Master Backup (${fileName}).`,
    });
    this.saveBackupState();
    this.notify();
  }
}

export const operationsService = new OperationsService();
