import { DailyArticleEntry, SpecialBillRecord, SpecialBillType, FuelLedgerEntry, ArticleQuantityPatch } from '../types/models';
import { customerService } from './customerService';
import { staffPermissionService } from './staffPermissionService';
import { getBeatFuelMapping, buildAll33BeatsFuelDirectory, calculateBeatFuelBill, BeatFuelMapping } from '../data/beatFuelData';
import {
  MAHEN_FUEL_REFERENCE_ROWS,
  OCTOBER_2026_FUEL_REFERENCE_ROWS,
  PRIYANSHU_BEAT_17_OCTOBER_2026_ROWS,
  MOHIT_BEAT_5_OCTOBER_2026_ROWS,
} from '../utils/fuelBillPdfGenerator';
import {
  createBackupSpreadsheet,
  ensureSheetTabsExist,
  writeSheetTabValues,
  sendGmailMessage,
  listFiles,
} from '../lib/google-workspace';

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
const STORAGE_KEY_FUEL_LEDGER = 'indiapost_fuel_ledger_dss_v1';
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
  private fuelLedgerEntries: FuelLedgerEntry[] = [];
  private completedTopics: Set<string> = new Set();
  private quizAttempts: LMSQuizAttempt[] = [];
  private backupState: BackupEngineState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.backupState = this.loadBackupState();
    this.loadDailyEntries();
    this.loadSpecialBills();
    this.loadFuelLedger();
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
        const parsed: DailyArticleEntry[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize with beat fuel mapping while preserving all existing historical DSS data
          this.dailyEntries = parsed.map((entry) => {
            const fuelData = getBeatFuelMapping(entry.beatNo);
            return {
              ...entry,
              sanctionedBeatKm: entry.sanctionedBeatKm || fuelData.sanctionedDailyKm,
              fixedKm: entry.fixedKm || fuelData.sanctionedDailyKm,
              fuelRatePerKm: entry.fuelRatePerKm || fuelData.fuelRatePerKm,
              dailyFuelAllowance: entry.dailyFuelAllowance || fuelData.dailyFuelAllowance,
              monthlyFuelAllowance: entry.monthlyFuelAllowance || fuelData.monthlyFuelAllowance,
              dssStatus: entry.dssStatus || 'Reconciled with DSS',
              dssArticleAuditTrail: entry.dssArticleAuditTrail || [],
            };
          });

          // Ensure October 2026 DSS records are populated and synced for Postman Beat Fuel sheets
          const hasOct2026 = this.dailyEntries.some(
            (e) => e.date && e.date.startsWith('2026-10') && (e.beatNo === 'Beat 2' || e.beatNo === '2')
          );
          if (!hasOct2026) {
            const octEntries = this.generateOctober2026SeedEntries();
            this.dailyEntries.push(...octEntries);
            this.saveDailyEntries();
          }

          // Ensure Beat 17 (Priyanshu Trivedi) entries are populated & synced with official screenshot
          const hasBeat17Oct2026 = this.dailyEntries.some(
            (e) => e.date && e.date.startsWith('2026-10') && (e.beatNo === 'Beat 17' || e.beatNo === '17')
          );
          const needsBeat17Refresh =
            !hasBeat17Oct2026 ||
            this.dailyEntries.some(
              (e) =>
                (e.beatNo === 'Beat 17' || e.beatNo === '17') &&
                e.date.startsWith('2026-10') &&
                (e.registryDelivered > 0 || (e.date === '2026-10-01' && e.speedPostDelivered + e.registryDelivered + e.parcelDelivered !== 51))
            );

          if (needsBeat17Refresh) {
            this.dailyEntries = this.dailyEntries.filter(
              (e) => !((e.beatNo === 'Beat 17' || e.beatNo === '17') && e.date.startsWith('2026-10'))
            );
            this.dailyEntries.push(...this.generateBeat17October2026SeedEntries());
            this.saveDailyEntries();
          }

          // Ensure Beat 5 (Mohit Arvind) entries are populated & synced with official screenshot
          const hasBeat5Oct2026 = this.dailyEntries.some(
            (e) => e.date && e.date.startsWith('2026-10') && (e.beatNo === 'Beat 5' || e.beatNo === '5')
          );
          const needsBeat5Refresh =
            !hasBeat5Oct2026 ||
            this.dailyEntries.some(
              (e) =>
                (e.beatNo === 'Beat 5' || e.beatNo === '5') &&
                e.date.startsWith('2026-10') &&
                (e.registryDelivered > 0 || (e.date === '2026-10-01' && e.speedPostDelivered + e.registryDelivered + e.parcelDelivered !== 75) || (e.date === '2026-10-03' && e.speedPostDelivered + e.registryDelivered + e.parcelDelivered !== 251))
            );

          if (needsBeat5Refresh) {
            this.dailyEntries = this.dailyEntries.filter(
              (e) => !((e.beatNo === 'Beat 5' || e.beatNo === '5') && e.date.startsWith('2026-10'))
            );
            this.dailyEntries.push(...this.generateBeat5October2026SeedEntries());
            this.saveDailyEntries();
          }

          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored daily article entries:', e);
    }

    // Seed initial daily article entries for Dadabari SO Beats with full fuel mapping
    const b2Fuel = getBeatFuelMapping('Beat 2');
    const b1Fuel = getBeatFuelMapping('Beat 1');
    const b4Fuel = getBeatFuelMapping('Beat 4');

    this.dailyEntries = [
      {
        id: 'ART-2026-001',
        date: today,
        employeeId: '50457421',
        staffName: 'Mahendra Kumar Meena',
        staffEmail: 'mahen.comtech@gmail.com',
        beatNo: 'Beat 2',
        officeName: 'Dadabari S.O. (324009)',
        attendanceStatus: 'Present - Field Duty',
        fixedKm: 30,
        sanctionedBeatKm: b2Fuel.sanctionedDailyKm,
        fuelRatePerKm: 3.60,
        dailyFuelAllowance: Math.round(30 * 3.60),
        monthlyFuelAllowance: Math.round(30 * 3.60 * 25),
        dssStatus: 'Reconciled with DSS',
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
        dssArticleAuditTrail: [],
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
        fixedKm: b1Fuel.sanctionedDailyKm,
        sanctionedBeatKm: b1Fuel.sanctionedDailyKm,
        fuelRatePerKm: 3.60,
        dailyFuelAllowance: Math.round(b1Fuel.sanctionedDailyKm * 3.60),
        monthlyFuelAllowance: Math.round(b1Fuel.sanctionedDailyKm * 3.60 * 25),
        dssStatus: 'Reconciled with DSS',
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
        dssArticleAuditTrail: [],
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
        fixedKm: b4Fuel.sanctionedDailyKm,
        sanctionedBeatKm: b4Fuel.sanctionedDailyKm,
        fuelRatePerKm: 3.60,
        dailyFuelAllowance: Math.round(b4Fuel.sanctionedDailyKm * 3.60),
        monthlyFuelAllowance: Math.round(b4Fuel.sanctionedDailyKm * 3.60 * 25),
        dssStatus: 'Reconciled with DSS',
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
        dssArticleAuditTrail: [],
        createdAt: new Date().toISOString(),
      },
      ...this.generateOctober2026SeedEntries(),
    ];
    this.saveDailyEntries();
  }

  private generateOctober2026SeedEntries(): DailyArticleEntry[] {
    const entries: DailyArticleEntry[] = [];
    const b2Fuel = getBeatFuelMapping('Beat 2');
    const b1Fuel = getBeatFuelMapping('Beat 1');
    const b4Fuel = getBeatFuelMapping('Beat 4');

    // 1. Beat 2: Reference Postman Mahendra Kumar Meena (50457421)
    OCTOBER_2026_FUEL_REFERENCE_ROWS.forEach((r) => {
      const isSun = r.status === 'SUNDAY';
      const isHol = r.status === 'HOLIDAY';
      const sp = typeof r.sp === 'number' ? r.sp : 0;
      const reg = typeof r.reg === 'number' ? r.reg : 0;
      const par = typeof r.others === 'number' ? r.others : 0;

      entries.push({
        id: `DSS-B2-202610-${String(r.sn).padStart(2, '0')}`,
        date: r.isoDate,
        employeeId: '50457421',
        staffName: 'Mahendra Kumar Meena',
        staffEmail: 'mahen.comtech@gmail.com',
        beatNo: 'Beat 2',
        officeName: 'Dadabari S.O. (324009)',
        attendanceStatus: isSun
          ? 'Sunday'
          : isHol
          ? 'Gazetted Holiday'
          : 'Present - Field Duty',
        fixedKm: 30,
        sanctionedBeatKm: b2Fuel.sanctionedDailyKm,
        fuelRatePerKm: 3.60,
        dailyFuelAllowance: Math.round(30 * 3.60),
        monthlyFuelAllowance: Math.round(30 * 3.60 * 25),
        dssStatus: 'Reconciled with DSS',
        registryReceived: isSun || isHol ? 0 : reg + (reg > 0 ? 1 : 0),
        registryDelivered: isSun || isHol ? 0 : reg,
        registryReturned: isSun || isHol ? 0 : reg > 0 ? 1 : 0,
        registryDeposit: 0,
        speedPostReceived: isSun || isHol ? 0 : sp + 2,
        speedPostDelivered: isSun || isHol ? 0 : sp,
        speedPostReturned: isSun || isHol ? 0 : 2,
        speedPostDeposit: 0,
        parcelReceived: isSun || isHol ? 0 : par + (par > 2 ? 1 : 0),
        parcelDelivered: isSun || isHol ? 0 : par,
        parcelReturned: isSun || isHol ? 0 : par > 2 ? 1 : 0,
        parcelDeposit: 0,
        codAmountCollected: isSun || isHol ? 0 : 2400 + (r.sn % 6) * 1150,
        doorstepInquiriesLogged: isSun || isHol ? 0 : 3 + (r.sn % 4),
        remarks: isSun
          ? 'Sunday - Office Off'
          : isHol
          ? r.sn === 2
            ? 'Gazetted Holiday: Mahatma Gandhi Birthday (Gandhi Jayanti)'
            : 'Gazetted Holiday: Dussehra (Vijayadashami)'
          : `Keshavpura Sectors 6 & 7 delivery round completed (${sp + reg + par} accountable articles). PMA 100% sync.`,
        dssArticleAuditTrail: [],
        createdAt: new Date('2026-10-01T08:00:00Z').toISOString(),
      });
    });

    // 2. Beat 1: Muskan Sharma (50510312)
    OCTOBER_2026_FUEL_REFERENCE_ROWS.forEach((r) => {
      const isSun = r.status === 'SUNDAY';
      const isHol = r.status === 'HOLIDAY';
      const sp = typeof r.sp === 'number' ? Math.round(r.sp * 0.85) : 0;
      const reg = typeof r.reg === 'number' ? Math.max(1, r.reg) : 0;
      const par = typeof r.others === 'number' ? Math.round(r.others * 0.8) : 0;

      entries.push({
        id: `DSS-B1-202610-${String(r.sn).padStart(2, '0')}`,
        date: r.isoDate,
        employeeId: '50510312',
        staffName: 'Muskan Sharma',
        staffEmail: 'muskan.sharma@indiapost.gov.in',
        beatNo: 'Beat 1',
        officeName: 'Dadabari S.O. (324009)',
        attendanceStatus: isSun
          ? 'Sunday'
          : isHol
          ? 'Gazetted Holiday'
          : 'Present - Field Duty',
        fixedKm: b1Fuel.sanctionedDailyKm,
        sanctionedBeatKm: b1Fuel.sanctionedDailyKm,
        fuelRatePerKm: 3.60,
        dailyFuelAllowance: Math.round(b1Fuel.sanctionedDailyKm * 3.60),
        monthlyFuelAllowance: Math.round(b1Fuel.sanctionedDailyKm * 3.60 * 25),
        dssStatus: 'Reconciled with DSS',
        registryReceived: isSun || isHol ? 0 : reg + 1,
        registryDelivered: isSun || isHol ? 0 : reg,
        registryReturned: isSun || isHol ? 0 : 1,
        registryDeposit: 0,
        speedPostReceived: isSun || isHol ? 0 : sp + 2,
        speedPostDelivered: isSun || isHol ? 0 : sp,
        speedPostReturned: isSun || isHol ? 0 : 2,
        speedPostDeposit: 0,
        parcelReceived: isSun || isHol ? 0 : par + 1,
        parcelDelivered: isSun || isHol ? 0 : par,
        parcelReturned: isSun || isHol ? 0 : 1,
        parcelDeposit: 0,
        codAmountCollected: isSun || isHol ? 0 : 1800 + (r.sn % 5) * 800,
        doorstepInquiriesLogged: isSun || isHol ? 0 : 3,
        remarks: isSun || isHol ? 'Off' : `Dadabari Extension delivery completed (${sp + reg + par} articles).`,
        dssArticleAuditTrail: [],
        createdAt: new Date('2026-10-01T08:00:00Z').toISOString(),
      });
    });

    // 3. Beat 4: Govind Prasad (10310735)
    OCTOBER_2026_FUEL_REFERENCE_ROWS.forEach((r) => {
      const isSun = r.status === 'SUNDAY';
      const isHol = r.status === 'HOLIDAY';
      const sp = typeof r.sp === 'number' ? Math.round(r.sp * 0.9) : 0;
      const reg = typeof r.reg === 'number' ? r.reg : 0;
      const par = typeof r.others === 'number' ? r.others : 0;

      entries.push({
        id: `DSS-B4-202610-${String(r.sn).padStart(2, '0')}`,
        date: r.isoDate,
        employeeId: '10310735',
        staffName: 'Govind Prasad',
        staffEmail: 'govind.prasad@indiapost.gov.in',
        beatNo: 'Beat 4',
        officeName: 'Dadabari S.O. (324009)',
        attendanceStatus: isSun
          ? 'Sunday'
          : isHol
          ? 'Gazetted Holiday'
          : 'Present - Field Duty',
        fixedKm: b4Fuel.sanctionedDailyKm,
        sanctionedBeatKm: b4Fuel.sanctionedDailyKm,
        fuelRatePerKm: 3.60,
        dailyFuelAllowance: Math.round(b4Fuel.sanctionedDailyKm * 3.60),
        monthlyFuelAllowance: Math.round(b4Fuel.sanctionedDailyKm * 3.60 * 25),
        dssStatus: 'Reconciled with DSS',
        registryReceived: isSun || isHol ? 0 : reg + 1,
        registryDelivered: isSun || isHol ? 0 : reg,
        registryReturned: isSun || isHol ? 0 : 1,
        registryDeposit: 0,
        speedPostReceived: isSun || isHol ? 0 : sp + 2,
        speedPostDelivered: isSun || isHol ? 0 : sp,
        speedPostReturned: isSun || isHol ? 0 : 2,
        speedPostDeposit: 0,
        parcelReceived: isSun || isHol ? 0 : par + 1,
        parcelDelivered: isSun || isHol ? 0 : par,
        parcelReturned: isSun || isHol ? 0 : 1,
        parcelDeposit: 0,
        codAmountCollected: isSun || isHol ? 0 : 2100 + (r.sn % 4) * 950,
        doorstepInquiriesLogged: isSun || isHol ? 0 : 4,
        remarks: isSun || isHol ? 'Off' : `Keshavpura Vistar delivery completed (${sp + reg + par} articles).`,
        dssArticleAuditTrail: [],
        createdAt: new Date('2026-10-01T08:00:00Z').toISOString(),
      });
    });

    // 4. Beat 17: Priyanshu Trivedi (50507003 / STAFF-50507003) - Anantpura / Industrial Area
    entries.push(...this.generateBeat17October2026SeedEntries());

    // 5. Beat 5: Mohit Arvind (10310736 / STAFF-10310736) - Mahaveer Nagar Vistar / Samrat Chowk
    entries.push(...this.generateBeat5October2026SeedEntries());

    return entries;
  }

  /**
   * Generates exact October 2026 daily article entries for Beat 17 (Priyanshu Trivedi)
   * Derived 100% identically from official India Post PDMS/DSS screenshot:
   * 24 Working Days | Totals: 2,252 (Avg: 93.83, Max: 251)
   * Registered: 0 (Numeric zero) | Mobile Usage: 100% | Sanctioned KM: 28 KM/day | Rate: ₹3.60/KM
   */
  public generateBeat17October2026SeedEntries(): DailyArticleEntry[] {
    const entries: DailyArticleEntry[] = [];
    const b17Fuel = getBeatFuelMapping('Beat 17');

    PRIYANSHU_BEAT_17_OCTOBER_2026_ROWS.forEach((r) => {
      const isSun = r.status === 'SUNDAY';
      const isHol = r.status === 'HOLIDAY';
      const sp = typeof r.sp === 'number' ? r.sp : 0;
      const reg = typeof r.reg === 'number' ? r.reg : 0; // strictly numeric 0
      const par = typeof r.others === 'number' ? r.others : 0;
      const dayTotal = typeof r.total === 'number' ? r.total : 0;

      entries.push({
        id: `DSS-B17-202610-${String(r.sn).padStart(2, '0')}`,
        date: r.isoDate,
        employeeId: '50507003',
        staffName: 'Priyanshu Trivedi',
        staffEmail: 'priyanshu.trivedi@indiapost.gov.in',
        beatNo: 'Beat 17',
        officeName: 'Dadabari S.O. (324009)',
        attendanceStatus: isSun
          ? 'Sunday'
          : isHol
          ? 'Gazetted Holiday'
          : 'Present - Field Duty',
        fixedKm: 28,
        sanctionedBeatKm: b17Fuel.sanctionedDailyKm,
        fuelRatePerKm: 3.60,
        dailyFuelAllowance: isSun || isHol ? 0 : 100.80, // 28 KM * ₹3.60
        monthlyFuelAllowance: 2520, // 25 working days * 28 KM * ₹3.60 = ₹2,520.00
        pdmsInvoicedCount: r.pdmsInvoicedCount,
        dssInvoicedCount: r.dssInvoicedCount,
        mobileUsagePercent: r.mobileUsagePercent,
        dssStatus: 'Reconciled with DSS',
        registryReceived: 0,
        registryDelivered: 0, // Registered articles nil as per statutory jurisdiction
        registryReturned: 0,
        registryDeposit: 0,
        speedPostReceived: isSun || isHol ? 0 : sp + 2,
        speedPostDelivered: isSun || isHol ? 0 : sp,
        speedPostReturned: isSun || isHol ? 0 : 2,
        speedPostDeposit: 0,
        parcelReceived: isSun || isHol ? 0 : par + (par > 2 ? 1 : 0),
        parcelDelivered: isSun || isHol ? 0 : par,
        parcelReturned: isSun || isHol ? 0 : par > 2 ? 1 : 0,
        parcelDeposit: 0,
        codAmountCollected: isSun || isHol ? 0 : 3200 + (r.sn % 6) * 1400,
        doorstepInquiriesLogged: isSun || isHol ? 0 : 4,
        remarks: isSun
          ? 'Sunday - Office Off'
          : isHol
          ? r.sn === 2
            ? 'Gazetted Holiday: Mahatma Gandhi Birthday (Gandhi Jayanti)'
            : 'Gazetted Holiday: Dussehra (Vijayadashami)'
          : `Beat 17 (Anantpura Industrial Area) round completed: ${dayTotal} accountable articles delivered (Speed Post: ${sp}, Reg: Nil [0], Parcels: ${par}). PDMS Invoiced Count: ${r.pdmsInvoicedCount}, DSS Invoiced Count: ${r.dssInvoicedCount}, Mobile Usage %: ${r.mobileUsagePercent}%.`,
        dssArticleAuditTrail: [],
        createdAt: new Date('2026-10-01T08:00:00Z').toISOString(),
      });
    });

    return entries;
  }

  public generateBeat5October2026SeedEntries(): DailyArticleEntry[] {
    const entries: DailyArticleEntry[] = [];
    const b5Fuel = getBeatFuelMapping('Beat 5');

    MOHIT_BEAT_5_OCTOBER_2026_ROWS.forEach((r) => {
      const isSun = r.status === 'SUNDAY';
      const isHol = r.status === 'HOLIDAY';
      const isLeave = r.status === 'LEAVE';
      const sp = typeof r.sp === 'number' ? r.sp : 0;
      const reg = 0; // Strictly zero as instructed
      const par = typeof r.others === 'number' ? r.others : 0;
      const dayTotal = typeof r.total === 'number' ? r.total : 0;

      entries.push({
        id: `DSS-B05-202610-${String(r.sn).padStart(2, '0')}`,
        date: r.isoDate,
        employeeId: '10310736',
        staffName: 'Mohit Arvind',
        staffEmail: 'mohit.arvind@indiapost.gov.in',
        beatNo: 'Beat 5',
        officeName: 'Dadabari S.O. (324009)',
        attendanceStatus: isSun
          ? 'Sunday'
          : isHol
          ? 'Gazetted Holiday'
          : isLeave
          ? 'On Leave'
          : 'Present - Field Duty',
        fixedKm: 19,
        sanctionedBeatKm: b5Fuel.sanctionedDailyKm,
        fuelRatePerKm: 3.60,
        dailyFuelAllowance: isSun || isHol || isLeave ? 0 : 68.40, // 19 KM * ₹3.60
        monthlyFuelAllowance: 1642, // 24 working days * 19 KM * ₹3.60 = ₹1,641.60
        pdmsInvoicedCount: r.pdmsInvoicedCount,
        dssInvoicedCount: r.dssInvoicedCount,
        mobileUsagePercent: r.mobileUsagePercent,
        dssStatus: 'Reconciled with DSS',
        registryReceived: 0,
        registryDelivered: 0, // Registered articles zero as instructed
        registryReturned: 0,
        registryDeposit: 0,
        speedPostReceived: isSun || isHol || isLeave ? 0 : sp + 2,
        speedPostDelivered: isSun || isHol || isLeave ? 0 : sp,
        speedPostReturned: isSun || isHol || isLeave ? 0 : 2,
        speedPostDeposit: 0,
        parcelReceived: isSun || isHol || isLeave ? 0 : par + (par > 2 ? 1 : 0),
        parcelDelivered: isSun || isHol || isLeave ? 0 : par,
        parcelReturned: isSun || isHol || isLeave ? 0 : par > 2 ? 1 : 0,
        parcelDeposit: 0,
        codAmountCollected: isSun || isHol || isLeave ? 0 : 2800 + (r.sn % 5) * 1200,
        doorstepInquiriesLogged: isSun || isHol || isLeave ? 0 : 3,
        remarks: isSun
          ? 'Sunday - Office Off'
          : isHol
          ? r.sn === 2
            ? 'Gazetted Holiday: Mahatma Gandhi Birthday (Gandhi Jayanti)'
            : 'Gazetted Holiday: Dussehra (Vijayadashami)'
          : isLeave
          ? 'Leave / Off Day'
          : `Beat 5 (Mahaveer Nagar Vistar / Samrat Chowk) round completed: ${dayTotal} accountable articles delivered (Speed Post: ${sp}, Reg: 0, Parcels: ${par}). PDMS Invoiced Count: ${r.pdmsInvoicedCount}, DSS Invoiced Count: ${r.dssInvoicedCount}, Mobile Usage %: ${r.mobileUsagePercent}%.`,
        dssArticleAuditTrail: [],
        createdAt: new Date('2026-10-01T08:00:00Z').toISOString(),
      });
    });

    return entries;
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
    const fuelData = getBeatFuelMapping(entry.beatNo);
    const resolvedKm = entry.fixedKm && entry.fixedKm > 0 ? entry.fixedKm : fuelData.sanctionedDailyKm;
    const dailyFuel = Math.round(resolvedKm * fuelData.fuelRatePerKm);

    const newEntry: DailyArticleEntry = {
      ...entry,
      id: `ART-${Date.now().toString().slice(-6)}`,
      fixedKm: resolvedKm,
      sanctionedBeatKm: fuelData.sanctionedDailyKm,
      fuelRatePerKm: fuelData.fuelRatePerKm,
      dailyFuelAllowance: dailyFuel,
      monthlyFuelAllowance: dailyFuel * 24,
      dssStatus: entry.dssStatus || 'Reconciled with DSS',
      dssArticleAuditTrail: entry.dssArticleAuditTrail || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.dailyEntries.unshift(newEntry);
    this.saveDailyEntries();
    this.incrementPendingSync();
    this.notify();
    return newEntry;
  }

  /**
   * Protected DSS Article Quantities Patch Method:
   * Updates ONLY specific accountable article quantities (Speed Post, Registered, Parcels, COD)
   * Strictly preserves core Daily Summary Sheet (DSS) metadata, historical verification logs,
   * beat assignments, and attendance status without object replacement or data loss.
   */
  public patchArticleQuantities(
    selector: { id?: string; date?: string; beatNo?: string },
    patch: ArticleQuantityPatch,
    auditMeta: { updatedBy: string; remarks?: string }
  ): { success: boolean; entry?: DailyArticleEntry; message: string } {
    let index = -1;

    if (selector.id) {
      index = this.dailyEntries.findIndex((e) => e.id === selector.id);
    } else if (selector.date && selector.beatNo) {
      const cleanBeat = selector.beatNo.replace(/beat\s*/i, '').trim();
      index = this.dailyEntries.findIndex(
        (e) =>
          e.date === selector.date &&
          (e.beatNo === selector.beatNo || e.beatNo.replace(/beat\s*/i, '').trim() === cleanBeat)
      );
    }

    if (index === -1) {
      return {
        success: false,
        message: `No existing Daily Summary Sheet record found for target.`,
      };
    }

    const target = this.dailyEntries[index];
    const previousCounts: Record<string, number> = {};
    const newCounts: Record<string, number> = {};
    const changedFields: string[] = [];

    const quantityKeys: (keyof ArticleQuantityPatch)[] = [
      'registryReceived',
      'registryDelivered',
      'registryReturned',
      'registryDeposit',
      'speedPostReceived',
      'speedPostDelivered',
      'speedPostReturned',
      'speedPostDeposit',
      'parcelReceived',
      'parcelDelivered',
      'parcelReturned',
      'parcelDeposit',
      'codAmountCollected',
      'doorstepInquiriesLogged',
    ];

    quantityKeys.forEach((key) => {
      if (patch[key] !== undefined) {
        const prev = Number(target[key as keyof DailyArticleEntry] ?? 0);
        const next = Number(patch[key] ?? 0);
        if (prev !== next) {
          previousCounts[key] = prev;
          newCounts[key] = next;
          changedFields.push(key);
          (target as any)[key] = next;
        }
      }
    });

    if (patch.remarks) {
      target.remarks = target.remarks
        ? `${target.remarks} | [${auditMeta.updatedBy}]: ${patch.remarks}`
        : patch.remarks;
    }

    if (patch.dssStatus) {
      target.dssStatus = patch.dssStatus;
    }

    // Auto-calculate balanced returns if delivered modified without explicit return count
    if (patch.registryDelivered !== undefined && patch.registryReturned === undefined) {
      target.registryReturned = Math.max(0, target.registryReceived - target.registryDelivered);
    }
    if (patch.speedPostDelivered !== undefined && patch.speedPostReturned === undefined) {
      target.speedPostReturned = Math.max(0, target.speedPostReceived - target.speedPostDelivered);
    }
    if (patch.parcelDelivered !== undefined && patch.parcelReturned === undefined) {
      target.parcelReturned = Math.max(0, target.parcelReceived - target.parcelDelivered);
    }

    // ========================================================
    // STATUTORY DSS SHEET MASTER PRIORITY & SPEED POST AUTO-ADJUSTMENT RULE
    // Rule: Official DSS benchmark represents the absolute authority.
    // If daily entry totals do not match the official DSS report totals,
    // Speed Post articles must be dynamically adjusted so that master DSS sheet
    // totals, delivery counts, and delivery percentages remain completely undisturbed.
    // ========================================================
    const masterDssBenchmark =
      typeof target.dssInvoicedCount === 'number' && target.dssInvoicedCount > 0
        ? target.dssInvoicedCount
        : typeof target.pdmsInvoicedCount === 'number' && target.pdmsInvoicedCount > 0
        ? target.pdmsInvoicedCount
        : null;

    if (masterDssBenchmark !== null) {
      const regDeliv = target.registryDelivered || 0;
      const parDeliv = target.parcelDelivered || 0;
      const currentSpDeliv = target.speedPostDelivered || 0;
      const totalDelivered = currentSpDeliv + regDeliv + parDeliv;

      if (totalDelivered !== masterDssBenchmark) {
        const balancedSp = Math.max(0, masterDssBenchmark - (regDeliv + parDeliv));
        if (balancedSp !== currentSpDeliv) {
          const originalSp = currentSpDeliv;
          target.speedPostDelivered = balancedSp;
          target.speedPostReceived = Math.max(target.speedPostReceived || 0, balancedSp);
          target.speedPostReturned = Math.max(0, target.speedPostReceived - balancedSp);
          changedFields.push('speedPostDelivered (DSS Master Auto-Adjusted)');
          previousCounts['speedPostDelivered_original'] = originalSp;
          newCounts['speedPostDelivered_adjusted'] = balancedSp;
          const adjustRemark = `[DSS Master Priority]: Speed Post dynamically adjusted ${originalSp} → ${balancedSp} to maintain master DSS total (${masterDssBenchmark}) and 100% audit integrity.`;
          target.remarks = target.remarks ? `${target.remarks} | ${adjustRemark}` : adjustRemark;
        }
      }
    }

    // Ensure beat-wise fuel allowance is accurately mapped
    if (!target.dailyFuelAllowance) {
      const fuelData = getBeatFuelMapping(target.beatNo);
      target.sanctionedBeatKm = fuelData.sanctionedDailyKm;
      target.fuelRatePerKm = fuelData.fuelRatePerKm;
      target.dailyFuelAllowance = fuelData.dailyFuelAllowance;
      target.monthlyFuelAllowance = fuelData.monthlyFuelAllowance;
    }

    // Add entry to audit trail
    if (changedFields.length > 0) {
      const auditLog = {
        timestamp: new Date().toISOString(),
        updatedBy: auditMeta.updatedBy || 'Postal Staff',
        changedFields,
        previousCounts,
        newCounts,
        remarks: auditMeta.remarks || 'Article quantities updated via Protected DSS Engine',
      };
      target.dssArticleAuditTrail = [auditLog, ...(target.dssArticleAuditTrail || [])];
    }

    target.updatedAt = new Date().toISOString();

    this.saveDailyEntries();
    this.incrementPendingSync();
    this.notify();

    return {
      success: true,
      entry: { ...target },
      message: `DSS Record Protected: Updated ${changedFields.join(', ') || 'quantities'} while preserving core sheet metadata & historical logs.`,
    };
  }

  /**
   * Protected Upsert:
   * If an entry for the date + beat already exists, safely patches only the article quantities.
   * If not, creates a new entry with beat fuel mapping parameters.
   */
  public patchOrUpsertDailyArticleQuantities(
    entryData: Omit<DailyArticleEntry, 'id' | 'createdAt'> & { id?: string },
    auditMeta: { updatedBy: string; remarks?: string }
  ): { success: boolean; entry: DailyArticleEntry; isUpdate: boolean } {
    const existing = this.dailyEntries.find(
      (e) => (entryData.id && e.id === entryData.id) || (e.date === entryData.date && e.beatNo === entryData.beatNo)
    );

    if (existing) {
      const patchRes = this.patchArticleQuantities(
        { id: existing.id },
        {
          registryReceived: entryData.registryReceived,
          registryDelivered: entryData.registryDelivered,
          registryReturned: entryData.registryReturned,
          registryDeposit: entryData.registryDeposit,
          speedPostReceived: entryData.speedPostReceived,
          speedPostDelivered: entryData.speedPostDelivered,
          speedPostReturned: entryData.speedPostReturned,
          speedPostDeposit: entryData.speedPostDeposit,
          parcelReceived: entryData.parcelReceived,
          parcelDelivered: entryData.parcelDelivered,
          parcelReturned: entryData.parcelReturned,
          parcelDeposit: entryData.parcelDeposit,
          codAmountCollected: entryData.codAmountCollected,
          doorstepInquiriesLogged: entryData.doorstepInquiriesLogged,
          remarks: entryData.remarks,
        },
        auditMeta
      );
      return {
        success: true,
        entry: patchRes.entry || existing,
        isUpdate: true,
      };
    } else {
      const created = this.addDailyEntry(entryData);
      return {
        success: true,
        entry: created,
        isUpdate: false,
      };
    }
  }

  /**
   * Reconciles all daily entries against Master DSS benchmarks.
   * If any day's delivered articles (Speed Post + Registered + Parcels) do not equal
   * the official DSS benchmark, dynamically auto-adjusts Speed Post so that
   * the master DSS totals and delivery percentages remain 100% undisturbed.
   */
  public reconcileAndAutoAdjustEntriesToDss(
    targetBeat?: string,
    targetMonth?: string
  ): {
    totalChecked: number;
    adjustedCount: number;
    details: Array<{ date: string; beatNo: string; originalSp: number; newSp: number; dssBenchmark: number }>;
  } {
    let adjustedCount = 0;
    let totalChecked = 0;
    const details: Array<{ date: string; beatNo: string; originalSp: number; newSp: number; dssBenchmark: number }> = [];

    const cleanBeat = targetBeat ? targetBeat.replace(/beat\s*/i, '').trim().toLowerCase() : null;

    this.dailyEntries.forEach((entry) => {
      const entryBeatClean = entry.beatNo.replace(/beat\s*/i, '').trim().toLowerCase();
      if (cleanBeat && entryBeatClean !== cleanBeat) return;
      if (targetMonth && !entry.date.startsWith(targetMonth)) return;

      totalChecked++;

      const benchmark =
        typeof entry.dssInvoicedCount === 'number' && entry.dssInvoicedCount > 0
          ? entry.dssInvoicedCount
          : typeof entry.pdmsInvoicedCount === 'number' && entry.pdmsInvoicedCount > 0
          ? entry.pdmsInvoicedCount
          : null;

      if (benchmark !== null && benchmark > 0) {
        const reg = entry.registryDelivered || 0;
        const par = entry.parcelDelivered || 0;
        const sp = entry.speedPostDelivered || 0;
        const sum = sp + reg + par;

        if (sum !== benchmark) {
          const balancedSp = Math.max(0, benchmark - (reg + par));
          const orig = sp;
          entry.speedPostDelivered = balancedSp;
          entry.speedPostReceived = Math.max(entry.speedPostReceived || 0, balancedSp);
          entry.speedPostReturned = Math.max(0, entry.speedPostReceived - balancedSp);
          entry.dssStatus = 'Reconciled with DSS';
          entry.remarks = entry.remarks
            ? `${entry.remarks} | [Auto-Reconciled]: SP adjusted ${orig} → ${balancedSp} to match DSS target (${benchmark}).`
            : `[Auto-Reconciled]: SP adjusted ${orig} → ${balancedSp} to match DSS target (${benchmark}).`;

          adjustedCount++;
          details.push({
            date: entry.date,
            beatNo: entry.beatNo,
            originalSp: orig,
            newSp: balancedSp,
            dssBenchmark: benchmark,
          });
        }
      }
    });

    if (adjustedCount > 0) {
      this.saveDailyEntries();
      this.incrementPendingSync();
      this.notify();
    }

    return { totalChecked, adjustedCount, details };
  }

  /**
   * Dedicated 33-Beat Fuel Allowance Retrieval
   */
  public getBeatFuelSummary(beatNo: string): BeatFuelMapping {
    return getBeatFuelMapping(beatNo);
  }

  public getAllBeatsFuelMatrix(): BeatFuelMapping[] {
    return buildAll33BeatsFuelDirectory();
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
        totalAmount: 1555,
        status: 'Verified by SPM',
        details: {
          workingDays: 24,
          leaveDays: 2,
          totalDistanceKm: 432,
          ratePerKm: 3.6,
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

  // ================= OPERATIONAL FUEL & EXPENSE LEDGER (DSS RECONCILIATION) =================
  private loadFuelLedger() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FUEL_LEDGER);
      if (raw) {
        this.fuelLedgerEntries = JSON.parse(raw);
        return;
      }
    } catch (e) {
      console.warn(e);
    }

    this.fuelLedgerEntries = [
      {
        id: 'FLED-2026-001',
        date: '2026-08-05',
        employeeId: '50457421',
        employeeName: 'MAHENDRA KUMAR MEENA',
        beatNo: 'Beat 2',
        officeName: 'Dadabari S.O.',
        vehicleNo: 'RJ-20-SS-4521',
        openingKmReading: 42150,
        closingKmReading: 42300,
        netKmRun: 150,
        sanctionedBeatKm: 150,
        fuelVolumeLitres: 3.45,
        fuelPricePerLitre: 104.88,
        totalFuelCost: 362,
        receiptNumber: 'IOCL-KOTA-88412',
        fuelStationName: 'Indian Oil - CAD Circle Filling Station, Kota',
        paymentMode: 'UPI / DakPay',
        dssReconciliationStatus: 'Reconciled with DSS',
        remarks: '5 Working Days Beat 2 Keshavpura Sec 6 & 7 coverage (30 KM/day)',
        createdAt: '2026-08-05T17:30:00Z',
      },
      {
        id: 'FLED-2026-002',
        date: '2026-08-12',
        employeeId: '50457421',
        employeeName: 'MAHENDRA KUMAR MEENA',
        beatNo: 'Beat 2',
        officeName: 'Dadabari S.O.',
        vehicleNo: 'RJ-20-SS-4521',
        openingKmReading: 42300,
        closingKmReading: 42480,
        netKmRun: 180,
        sanctionedBeatKm: 180,
        fuelVolumeLitres: 4.1,
        fuelPricePerLitre: 104.88,
        totalFuelCost: 430,
        receiptNumber: 'HPCL-DDB-99204',
        fuelStationName: 'HP Petrol Pump - Dadabari Main Road, Kota',
        paymentMode: 'UPI / DakPay',
        dssReconciliationStatus: 'Reconciled with DSS',
        remarks: '6 Working Days Beat 2 PMA 100% doorstep delivery round',
        createdAt: '2026-08-12T18:00:00Z',
      },
      {
        id: 'FLED-2026-003',
        date: '2026-08-20',
        employeeId: '50457421',
        employeeName: 'MAHENDRA KUMAR MEENA',
        beatNo: 'Beat 2',
        officeName: 'Dadabari S.O.',
        vehicleNo: 'RJ-20-SS-4521',
        openingKmReading: 42480,
        closingKmReading: 42690,
        netKmRun: 210,
        sanctionedBeatKm: 210,
        fuelVolumeLitres: 4.8,
        fuelPricePerLitre: 104.88,
        totalFuelCost: 503,
        receiptNumber: 'BPCL-KSH-44109',
        fuelStationName: 'Bharat Petroleum - Keshavpura Circle, Kota',
        paymentMode: 'IPPB',
        dssReconciliationStatus: 'Verified by SPM',
        remarks: '7 Working Days Beat 2 + Santoshi Nagar & Patel Nagar round',
        createdAt: '2026-08-20T17:45:00Z',
      },
      {
        id: 'FLED-2026-004',
        date: '2026-08-30',
        employeeId: '50457421',
        employeeName: 'MAHENDRA KUMAR MEENA',
        beatNo: 'Beat 2',
        officeName: 'Dadabari S.O.',
        vehicleNo: 'RJ-20-SS-4521',
        openingKmReading: 42690,
        closingKmReading: 42900,
        netKmRun: 210,
        sanctionedBeatKm: 210,
        fuelVolumeLitres: 4.75,
        fuelPricePerLitre: 104.88,
        totalFuelCost: 498,
        receiptNumber: 'IOCL-KOTA-91045',
        fuelStationName: 'Indian Oil - CAD Circle Filling Station, Kota',
        paymentMode: 'UPI / DakPay',
        dssReconciliationStatus: 'Reconciled with DSS',
        remarks: '7 Working Days closing monthly beat cycle (Total 750 KM)',
        createdAt: '2026-08-30T18:15:00Z',
      },
      {
        id: 'FLED-2026-005',
        date: '2026-08-25',
        employeeId: '50510312',
        employeeName: 'Muskan Sharma',
        beatNo: 'Beat 1',
        officeName: 'Dadabari S.O.',
        vehicleNo: 'RJ-20-SA-1920',
        openingKmReading: 18400,
        closingKmReading: 18560,
        netKmRun: 160,
        sanctionedBeatKm: 160,
        fuelVolumeLitres: 3.6,
        fuelPricePerLitre: 104.88,
        totalFuelCost: 378,
        receiptNumber: 'HPCL-DDB-99812',
        fuelStationName: 'HP Petrol Pump - Dadabari Main Road, Kota',
        paymentMode: 'UPI / DakPay',
        dssReconciliationStatus: 'Verified by SPM',
        remarks: 'Beat 1 Dadabari Extension & P&T Colony delivery log',
        createdAt: '2026-08-25T17:10:00Z',
      },
    ];
    this.saveFuelLedger();
  }

  private saveFuelLedger() {
    try {
      localStorage.setItem(STORAGE_KEY_FUEL_LEDGER, JSON.stringify(this.fuelLedgerEntries));
    } catch (e) {
      console.warn(e);
    }
  }

  public getFuelLedgerEntries(): FuelLedgerEntry[] {
    return [...this.fuelLedgerEntries];
  }

  public addFuelLedgerEntry(
    entry: Omit<FuelLedgerEntry, 'id' | 'createdAt' | 'netKmRun'>
  ): FuelLedgerEntry {
    const netKmRun = Math.max(0, (Number(entry.closingKmReading) || 0) - (Number(entry.openingKmReading) || 0));
    const newEntry: FuelLedgerEntry = {
      ...entry,
      netKmRun,
      id: `FLED-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    this.fuelLedgerEntries = [newEntry, ...this.fuelLedgerEntries];
    this.saveFuelLedger();
    this.incrementPendingSync();
    this.notify();
    return newEntry;
  }

  public updateFuelLedgerStatus(
    id: string,
    status: FuelLedgerEntry['dssReconciliationStatus']
  ): FuelLedgerEntry | undefined {
    const idx = this.fuelLedgerEntries.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    const updated = { ...this.fuelLedgerEntries[idx], dssReconciliationStatus: status };
    this.fuelLedgerEntries = [
      ...this.fuelLedgerEntries.slice(0, idx),
      updated,
      ...this.fuelLedgerEntries.slice(idx + 1),
    ];
    this.saveFuelLedger();
    this.notify();
    return updated;
  }

  public exportFuelLedgerToCSV(entries: FuelLedgerEntry[]): string {
    const headers = [
      'Ledger ID',
      'Date',
      'Employee ID',
      'Staff Name',
      'Beat No',
      'Office',
      'Vehicle No',
      'Opening KM',
      'Closing KM',
      'Net KM Run',
      'Sanctioned KM',
      'Fuel Volume (L)',
      'Rate/L (Rs)',
      'Total Fuel Cost (Rs)',
      'Receipt / Bunk Voucher No',
      'Fuel Station',
      'Payment Mode',
      'DSS Reconciliation Status',
      'Remarks',
    ];
    const rows = entries.map((e) => [
      e.id,
      e.date,
      e.employeeId,
      `"${(e.employeeName || '').replace(/"/g, '""')}"`,
      e.beatNo,
      `"${(e.officeName || '').replace(/"/g, '""')}"`,
      e.vehicleNo,
      e.openingKmReading,
      e.closingKmReading,
      e.netKmRun,
      e.sanctionedBeatKm,
      e.fuelVolumeLitres,
      e.fuelPricePerLitre,
      e.totalFuelCost,
      `"${(e.receiptNumber || '').replace(/"/g, '""')}"`,
      `"${(e.fuelStationName || '').replace(/"/g, '""')}"`,
      e.paymentMode,
      e.dssReconciliationStatus,
      `"${(e.remarks || '').replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
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
  public async exportFullDatabaseWorkbook(): Promise<void> {
    const XLSX = await import('xlsx');
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
