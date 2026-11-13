import { DailyArticleEntry, SpecialBillRecord, SpecialBillType, FuelLedgerEntry, ArticleQuantityPatch } from '../types/models';
import { customerService } from './customerService';
import { staffPermissionService } from './staffPermissionService';
import { getBeatFuelMapping, buildAll33BeatsFuelDirectory, BeatFuelMapping } from '../data/beatFuelData';
import {
  MAHEN_FUEL_REFERENCE_ROWS,
} from '../utils/fuelBillPdfGenerator';
import {
  OCTOBER_2026_ALL_33_BEATS_SCHEDULE,
  OCTOBER_2026_BEAT_METADATA,
  getOctober2026BeatMeta,
  getOctober2026OfficialBeatSchedule,
} from '../data/october2026DssDataset';
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
const STORAGE_KEY_OCT2026_LOCK_SYNC = 'indiapost_oct2026_all33_lock_v1';

function normalizeBeatLabel(beatNo: string): string {
  const match = (beatNo || '').match(/\d+/);
  if (match) {
    return `Beat ${parseInt(match[0], 10)}`;
  }
  return (beatNo || '').trim() || 'Beat 2';
}

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

  private deduplicateDailyEntries(entries: DailyArticleEntry[]): DailyArticleEntry[] {
    const byKey = new Map<string, DailyArticleEntry>();
    entries.forEach((entry) => {
      if (!entry || !entry.date) return;
      const normalizedBeat = normalizeBeatLabel(entry.beatNo);
      const key = `${normalizedBeat.toLowerCase()}__${entry.date}`;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, { ...entry, beatNo: normalizedBeat });
      } else if (entry.isDepartmentLocked && !existing.isDepartmentLocked) {
        byKey.set(key, { ...entry, beatNo: normalizedBeat });
      }
    });
    return Array.from(byKey.values());
  }

  private loadDailyEntries() {
    const today = new Date().toISOString().split('T')[0];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DAILY_ARTICLES);
      if (raw) {
        const parsed: DailyArticleEntry[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.dailyEntries = this.deduplicateDailyEntries(
            parsed.map((entry) => {
              const normalizedBeat = normalizeBeatLabel(entry.beatNo);
              const fuelData = getBeatFuelMapping(normalizedBeat);
              return {
                ...entry,
                beatNo: normalizedBeat,
                sanctionedBeatKm: entry.sanctionedBeatKm || fuelData.sanctionedDailyKm,
                fixedKm: entry.fixedKm || fuelData.sanctionedDailyKm,
                fuelRatePerKm: entry.fuelRatePerKm || fuelData.fuelRatePerKm,
                dailyFuelAllowance:
                  entry.dailyFuelAllowance !== undefined
                    ? entry.dailyFuelAllowance
                    : fuelData.dailyFuelAllowance,
                monthlyFuelAllowance:
                  entry.monthlyFuelAllowance !== undefined
                    ? entry.monthlyFuelAllowance
                    : fuelData.monthlyFuelAllowance,
                dssStatus: entry.dssStatus || 'Reconciled with DSS',
                dssArticleAuditTrail: entry.dssArticleAuditTrail || [],
              };
            })
          );

          const syncMarker = localStorage.getItem(STORAGE_KEY_OCT2026_LOCK_SYNC);
          const octEntries = this.dailyEntries.filter((e) => e.date && e.date.startsWith('2026-10'));
          const beat6OctEntries = octEntries.filter((e) => e.beatNo === 'Beat 6' && e.isDepartmentLocked);
          const beat6Working = beat6OctEntries.filter((e) => e.attendanceStatus === 'Present - Field Duty').length;
          const lockedBeatCount = new Set(
            octEntries.filter((e) => e.isDepartmentLocked).map((e) => e.beatNo)
          ).size;

          if (
            syncMarker !== 'SYNCED_ALL_33_V1' ||
            lockedBeatCount < 33 ||
            beat6OctEntries.length !== 31 ||
            beat6Working !== 23
          ) {
            this.syncOctober2026All33BeatsInternal(false);
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored daily article entries:', e);
    }

    // Seed initial non-Oct-2026 current day operational samples + complete locked 33-beat October 2026 dataset
    const b2Fuel = getBeatFuelMapping('Beat 2');
    const b1Fuel = getBeatFuelMapping('Beat 1');
    const b4Fuel = getBeatFuelMapping('Beat 4');

    const initialTodayEntries: DailyArticleEntry[] = today.startsWith('2026-10')
      ? []
      : [
          {
            id: 'ART-2026-001',
            date: today,
            employeeId: '50457421',
            staffName: 'Mahendra Kumar Meena',
            staffEmail: 'mahen.comtech@gmail.com',
            beatNo: 'Beat 2',
            officeName: 'Dadabari S.O. (324009)',
            attendanceStatus: 'Present - Field Duty',
            fixedKm: b2Fuel.sanctionedDailyKm,
            sanctionedBeatKm: b2Fuel.sanctionedDailyKm,
            fuelRatePerKm: 3.60,
            dailyFuelAllowance: Number((b2Fuel.sanctionedDailyKm * 3.60).toFixed(2)),
            monthlyFuelAllowance: Number((b2Fuel.sanctionedDailyKm * 3.60 * 25).toFixed(2)),
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
            dailyFuelAllowance: Number((b1Fuel.sanctionedDailyKm * 3.60).toFixed(2)),
            monthlyFuelAllowance: Number((b1Fuel.sanctionedDailyKm * 3.60 * 25).toFixed(2)),
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
            dailyFuelAllowance: Number((b4Fuel.sanctionedDailyKm * 3.60).toFixed(2)),
            monthlyFuelAllowance: Number((b4Fuel.sanctionedDailyKm * 3.60 * 25).toFixed(2)),
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
        ];

    this.dailyEntries = this.deduplicateDailyEntries([
      ...initialTodayEntries,
      ...this.generateAll33BeatsOctober2026SeedEntries(),
    ]);
    try {
      localStorage.setItem(STORAGE_KEY_OCT2026_LOCK_SYNC, 'SYNCED_ALL_33_V1');
    } catch {
      // ignore storage errors
    }
    this.saveDailyEntries();
  }

  private syncOctober2026All33BeatsInternal(shouldNotify: boolean) {
    const nonOctEntries = this.dailyEntries.filter(
      (e) => !(e.date && e.date.startsWith('2026-10'))
    );
    const octAll33 = this.generateAll33BeatsOctober2026SeedEntries();
    this.dailyEntries = this.deduplicateDailyEntries([...nonOctEntries, ...octAll33]);
    try {
      localStorage.setItem(STORAGE_KEY_OCT2026_LOCK_SYNC, 'SYNCED_ALL_33_V1');
    } catch {
      // ignore storage errors
    }
    this.saveDailyEntries();
    if (shouldNotify) {
      this.notify();
    }
  }

  public syncAndLockOctober2026All33Beats(): {
    syncedBeatsCount: number;
    totalEntriesCount: number;
    beat6Summary: {
      beatNo: string;
      postmanName: string;
      employeeId: string;
      workingDays: number;
      dailyKm: number;
      totalKm: number;
      totalClaimAmount: number;
      pdmsTotal: number;
      dssTotal: number;
      mobileUsageAvg: number;
      isDepartmentLocked: boolean;
    };
  } {
    this.syncOctober2026All33BeatsInternal(true);
    this.ensureLockedBeat6BillingRecords(true);
    const beat6Meta = OCTOBER_2026_BEAT_METADATA[6];
    const beat6Fuel = getBeatFuelMapping('Beat 6');
    const beat6TotalKm = beat6Fuel.sanctionedDailyKm * beat6Meta.workingDays;
    const beat6Claim = Number((beat6TotalKm * 3.6).toFixed(2));
    return {
      syncedBeatsCount: 33,
      totalEntriesCount: 33 * 31,
      beat6Summary: {
        beatNo: 'Beat 6',
        postmanName: beat6Meta.postmanName,
        employeeId: beat6Fuel.assignedStaffId.replace(/^STAFF-/, ''),
        workingDays: beat6Meta.workingDays,
        dailyKm: beat6Fuel.sanctionedDailyKm,
        totalKm: beat6TotalKm,
        totalClaimAmount: beat6Claim,
        pdmsTotal: beat6Meta.pdmsTotal,
        dssTotal: beat6Meta.dssTotal,
        mobileUsageAvg: beat6Meta.mobileUsageAvg,
        isDepartmentLocked: true,
      },
    };
  }

  public generateAll33BeatsOctober2026SeedEntries(): DailyArticleEntry[] {
    const entries: DailyArticleEntry[] = [];
    for (let seq = 1; seq <= 33; seq++) {
      const beatLabel = `Beat ${seq}`;
      const meta = OCTOBER_2026_BEAT_METADATA[seq];
      const schedule = OCTOBER_2026_ALL_33_BEATS_SCHEDULE[seq] || getOctober2026OfficialBeatSchedule(beatLabel) || [];
      const fuelMap = getBeatFuelMapping(beatLabel);
      const staffIdClean = (fuelMap.assignedStaffId || '').replace(/^STAFF-/, '') || `BEAT${seq}`;
      const dailyKm = fuelMap.sanctionedDailyKm;
      const dailyAllowance = Number((dailyKm * 3.6).toFixed(2));
      const monthlyAllowance = Number((dailyKm * 3.6 * (meta?.workingDays ?? 25)).toFixed(2));
      const postmanName = meta?.postmanName || fuelMap.assignedPostmanName;

      schedule.forEach((r) => {
        const isSun = r.status === 'SUNDAY';
        const isHol = r.status === 'HOLIDAY';
        const isLeave = r.status === 'LEAVE';
        const isWorking = r.status === 'WORKING';
        const sp = typeof r.sp === 'number' ? r.sp : 0;
        const reg = typeof r.reg === 'number' ? r.reg : 0;
        const par = typeof r.others === 'number' ? r.others : 0;
        const dayTotal = typeof r.total === 'number' ? r.total : sp + reg + par;
        const pdms = typeof r.pdmsInvoicedCount === 'number' ? r.pdmsInvoicedCount : dayTotal;
        const dss = typeof r.dssInvoicedCount === 'number' ? r.dssInvoicedCount : dayTotal;
        const mob = typeof r.mobileUsagePercent === 'number' ? r.mobileUsagePercent : 100;

        entries.push({
          id: `DSS-B${String(seq).padStart(2, '0')}-202610-${String(r.sn).padStart(2, '0')}`,
          date: r.isoDate,
          employeeId: staffIdClean,
          staffName: postmanName,
          staffEmail: `${postmanName.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@indiapost.gov.in`,
          beatNo: beatLabel,
          officeName: 'Dadabari S.O. (324009)',
          attendanceStatus: isSun
            ? 'Sunday'
            : isHol
            ? 'Gazetted Holiday'
            : isLeave
            ? 'On Leave'
            : 'Present - Field Duty',
          fixedKm: dailyKm,
          sanctionedBeatKm: dailyKm,
          fuelRatePerKm: 3.60,
          dailyFuelAllowance: isWorking ? dailyAllowance : 0,
          monthlyFuelAllowance: monthlyAllowance,
          pdmsInvoicedCount: isWorking ? pdms : undefined,
          dssInvoicedCount: isWorking ? dss : undefined,
          mobileUsagePercent: isWorking ? mob : undefined,
          dssStatus: 'Reconciled with DSS',
          isDepartmentLocked: true,
          lockedAt: '2026-11-01T09:00:00Z',
          lockedBy: 'Department DSS Audit (Office 28660686 / BATCH_01)',
          departmentLockSource: 'DSS_REPORT_OCT_2026_OFFICIAL',
          registryReceived: 0,
          registryDelivered: 0,
          registryReturned: 0,
          registryDeposit: 0,
          speedPostReceived: isWorking ? pdms : 0,
          speedPostDelivered: isWorking ? sp : 0,
          speedPostReturned: isWorking ? Math.max(0, pdms - dss) : 0,
          speedPostDeposit: 0,
          parcelReceived: isWorking ? par : 0,
          parcelDelivered: isWorking ? par : 0,
          parcelReturned: 0,
          parcelDeposit: 0,
          codAmountCollected: isWorking ? Math.round(dayTotal * 45) : 0,
          doorstepInquiriesLogged: isWorking ? 2 : 0,
          remarks: isSun
            ? 'Sunday - Office Off'
            : isHol
            ? r.sn === 2
              ? 'Gazetted Holiday: Mahatma Gandhi Birthday (Gandhi Jayanti)'
              : 'Gazetted Holiday: Dussehra (Vijayadashami)'
            : isLeave
            ? `Absent / On Leave (No DSS dispatch on ${r.date})`
            : `${beatLabel} (${postmanName}) Official DSS Verified · PDMS: ${pdms}, DSS: ${dss}, Mobile Usage: ${mob}% (${fuelMap.linkedPincodes.join(', ')}) [Department Locked]`,
          dssArticleAuditTrail: [],
          createdAt: '2026-11-01T09:00:00Z',
        });
      });
    }
    return entries;
  }

  private generateOctober2026SeedEntries(): DailyArticleEntry[] {
    return this.generateAll33BeatsOctober2026SeedEntries();
  }

  public generateBeat17October2026SeedEntries(): DailyArticleEntry[] {
    return this.generateAll33BeatsOctober2026SeedEntries().filter((e) => e.beatNo === 'Beat 17');
  }

  public generateBeat5October2026SeedEntries(): DailyArticleEntry[] {
    return this.generateAll33BeatsOctober2026SeedEntries().filter((e) => e.beatNo === 'Beat 5');
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
    const normalizedBeat = normalizeBeatLabel(entry.beatNo);
    const fuelData = getBeatFuelMapping(normalizedBeat);
    const resolvedKm = entry.fixedKm && entry.fixedKm > 0 ? entry.fixedKm : fuelData.sanctionedDailyKm;
    const dailyFuel = Number((resolvedKm * fuelData.fuelRatePerKm).toFixed(2));

    const newEntry: DailyArticleEntry = {
      ...entry,
      beatNo: normalizedBeat,
      id: `ART-${Date.now().toString().slice(-6)}`,
      fixedKm: resolvedKm,
      sanctionedBeatKm: fuelData.sanctionedDailyKm,
      fuelRatePerKm: fuelData.fuelRatePerKm,
      dailyFuelAllowance: dailyFuel,
      monthlyFuelAllowance: Number((dailyFuel * 24).toFixed(2)),
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
   * Respects immutable `isDepartmentLocked` records.
   */
  public patchArticleQuantities(
    selector: { id?: string; date?: string; beatNo?: string },
    patch: ArticleQuantityPatch,
    auditMeta: { updatedBy: string; remarks?: string }
  ): { success: boolean; entry?: DailyArticleEntry; message: string; isLocked?: boolean } {
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
    if (target.isDepartmentLocked) {
      return {
        success: false,
        entry: { ...target },
        isLocked: true,
        message: `Department Locked (Immutable): ${target.beatNo} on ${target.date} (${target.staffName}) is locked by ${target.lockedBy || 'Department DSS Audit'} and cannot be modified.`,
      };
    }
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
  ): { success: boolean; entry: DailyArticleEntry; isUpdate: boolean; isLocked?: boolean; message?: string } {
    const normalizedBeat = normalizeBeatLabel(entryData.beatNo);
    const existing = this.dailyEntries.find(
      (e) =>
        (entryData.id && e.id === entryData.id) ||
        (e.date === entryData.date && normalizeBeatLabel(e.beatNo).toLowerCase() === normalizedBeat.toLowerCase())
    );

    if (existing) {
      if (existing.isDepartmentLocked) {
        return {
          success: false,
          entry: existing,
          isUpdate: true,
          isLocked: true,
          message: `Department Locked (Immutable): ${existing.beatNo} (${existing.date}) cannot be overwritten by manual edit or bulk upload.`,
        };
      }
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
        success: patchRes.success,
        entry: patchRes.entry || existing,
        isUpdate: true,
        isLocked: patchRes.isLocked,
        message: patchRes.message,
      };
    } else {
      const created = this.addDailyEntry({ ...entryData, beatNo: normalizedBeat });
      return {
        success: true,
        entry: created,
        isUpdate: false,
      };
    }
  }

  /**
   * Reconciles all daily entries against Master DSS benchmarks.
   * Respects immutable `isDepartmentLocked` records — locked department rows are never modified.
   */
  public reconcileAndAutoAdjustEntriesToDss(
    targetBeat?: string,
    targetMonth?: string
  ): {
    totalChecked: number;
    adjustedCount: number;
    lockedSkippedCount: number;
    details: Array<{ date: string; beatNo: string; originalSp: number; newSp: number; dssBenchmark: number }>;
  } {
    let adjustedCount = 0;
    let totalChecked = 0;
    let lockedSkippedCount = 0;
    const details: Array<{ date: string; beatNo: string; originalSp: number; newSp: number; dssBenchmark: number }> = [];

    const cleanBeat = targetBeat ? targetBeat.replace(/beat\s*/i, '').trim().toLowerCase() : null;

    this.dailyEntries.forEach((entry) => {
      const entryBeatClean = entry.beatNo.replace(/beat\s*/i, '').trim().toLowerCase();
      if (cleanBeat && entryBeatClean !== cleanBeat) return;
      if (targetMonth && !entry.date.startsWith(targetMonth)) return;

      totalChecked++;

      if (entry.isDepartmentLocked) {
        lockedSkippedCount++;
        return;
      }

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

    return { totalChecked, adjustedCount, lockedSkippedCount, details };
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
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.specialBills = parsed;
          this.ensureLockedBeat6BillingRecords(false);
          return;
        }
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
          relievingOfficerId: '50457421',
          relievingDesignation: 'Postman Beat 2',
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
      {
        id: 'BILL-004',
        billNumber: 'DOP/KOTA/OUT/2026/012',
        type: 'OUTSIDER_BILL',
        title: 'Outsider & Substitute Postman Duty Contingent Bill',
        employeeId: '50459812',
        employeeName: 'Priyanshu Trivedi',
        employeeEmail: 'priyanshu.trivedi@indiapost.gov.in',
        beatNo: 'Beat 17',
        officeName: 'Dadabari S.O. (324009)',
        fromDate: '2026-10-01',
        toDate: '2026-10-25',
        totalDays: 25,
        fixedKm: 28,
        totalAmount: 3400,
        status: 'Approved',
        details: {
          substituteReason: 'Heavy Delivery Beat Coverage & Motorized Round Arrangement',
          dailyDutyRate: 136,
          sanctionOrderNo: 'KOTA-DIV/ESTT/BEAT-17/SUB/2026-10',
          reconciledArticles: 1136,
          registeredArticles: 0,
          mobileUsagePercentage: 99.76,
          remarks: 'Beat 17 full month delivery coverage. All 1,136 DSS invoiced articles accounted.',
        },
        documentCategory: 'DUTY_ALLOWANCE',
        auditTrail: [
          { action: 'Draft Created', performedBy: 'Priyanshu Trivedi (Postman)', timestamp: '2026-10-25T11:00:00Z', notes: 'Initial generation' },
          { action: 'DSS Reconciled', performedBy: 'AI Data Sync Agent', timestamp: '2026-10-25T14:20:00Z', notes: '100% matched with screenshot sort audit' },
          { action: 'Verified & Approved', performedBy: 'Ekta Meena (Master Admin)', timestamp: '2026-10-26T09:30:00Z', notes: 'Sanctioned under sub-office contingency' },
        ],
        createdAt: today,
      },
      {
        id: 'BILL-005',
        billNumber: 'DOP/KOTA/CONS/2026/108',
        type: 'CONSOLIDATED_BILL',
        title: 'Postman Monthly Consolidated Article & Delivery Certificate',
        employeeId: '50457421',
        employeeName: 'Mahendra Kumar Meena',
        employeeEmail: 'mahen.comtech@gmail.com',
        beatNo: 'Beat 2',
        officeName: 'Dadabari S.O. (324009)',
        fromDate: '2026-10-01',
        toDate: '2026-10-31',
        totalDays: 31,
        fixedKm: 30,
        totalAmount: 2700,
        status: 'Verified by SPM',
        details: {
          workingDays: 25,
          sundaysHolidays: 6,
          speedPostDelivered: 1042,
          registeredDelivered: 0,
          parcelsDelivered: 94,
          totalArticlesDelivered: 1136,
          pmaCompliancePercentage: 100.0,
          dssBenchmarkMatch: '100% Exact Audit Conformity',
          remarks: 'Consolidated statutory month-end delivery audit statement for Beat 2 Dadabari S.O.',
        },
        documentCategory: 'CONSOLIDATED_SUMMARY',
        auditTrail: [
          { action: 'Generated', performedBy: 'Mahendra Kumar Meena', timestamp: '2026-10-31T17:00:00Z' },
          { action: 'SPM Signed', performedBy: 'Sub-Postmaster Dadabari', timestamp: '2026-11-01T10:15:00Z' },
        ],
        createdAt: today,
      },
      {
        id: 'BILL-006',
        billNumber: 'DOP/KOTA/NPR/2026/007',
        type: 'NPR_CENSUS_LOG',
        title: 'NPR & National Census Resident Verification Log',
        employeeId: '50457421',
        employeeName: 'Mahendra Kumar Meena',
        employeeEmail: 'mahen.comtech@gmail.com',
        beatNo: 'Beat 2',
        officeName: 'Dadabari S.O. (324009)',
        fromDate: '2026-10-01',
        toDate: '2026-10-31',
        totalDays: 25,
        fixedKm: 30,
        totalAmount: 0,
        status: 'Approved',
        details: {
          sectorsAudited: 'Keshavpura Sector 6 & Sector 7',
          householdsVerified: 184,
          membersEnumerated: 742,
          shiftedResidentsLogged: 12,
          gpsPinsAudited: 184,
          remarks: 'Statutory citizen enumeration register and address verification log for Dadabari S.O. jurisdiction.',
        },
        documentCategory: 'CENSUS_VERIFICATION',
        auditTrail: [
          { action: 'Census Log Uploaded', performedBy: 'Mahendra Kumar Meena', timestamp: '2026-10-28T16:00:00Z' },
          { action: 'District Registrar Certified', performedBy: 'Registrar Kota Division', timestamp: '2026-10-30T11:45:00Z' },
        ],
        createdAt: today,
      },
      {
        id: 'BILL-007',
        billNumber: 'DOP/KOTA/FUEL/2026/017',
        type: 'FUEL_BILL',
        title: 'Official Two-Wheeler Fuel Bill: October 2026 (Beat 17)',
        employeeId: '50459812',
        employeeName: 'Priyanshu Trivedi',
        employeeEmail: 'priyanshu.trivedi@indiapost.gov.in',
        beatNo: 'Beat 17',
        officeName: 'Dadabari S.O. (324009)',
        fromDate: '2026-10-01',
        toDate: '2026-10-31',
        totalDays: 25,
        fixedKm: 28,
        totalAmount: 2520,
        status: 'Approved',
        details: {
          workingDays: 25,
          sanctionedDailyKm: 28,
          ratePerKm: 3.6,
          totalMonthlyKm: 700,
          vehicleNo: 'RJ-20-SP-2026',
          registeredArticles: 0,
          totalArticlesDelivered: 1136,
          dssInvoicedCount: 1136,
          mobileUsagePercentage: 99.76,
          remarks: 'Statutory fuel reimbursement claim: 25 Days × 28 KM @ ₹3.60 = ₹2,520.00 for Beat 17.',
        },
        documentCategory: 'FUEL_ALLOWANCE',
        auditTrail: [
          { action: 'Bill Generated', performedBy: 'Priyanshu Trivedi (Beat 17)', timestamp: '2026-10-31T18:00:00Z' },
          { action: 'Sort Audit Cross-Checked', performedBy: 'AI Data Engine', timestamp: '2026-10-31T18:05:00Z', notes: 'Matches Screenshot Sort Audit 100%' },
          { action: 'Certified & Approved', performedBy: 'Mahendra Kumar Meena (Admin)', timestamp: '2026-11-01T09:00:00Z' },
        ],
        createdAt: today,
      },
    ];
    this.ensureLockedBeat6BillingRecords(false);
    this.saveSpecialBills();
  }

  private ensureLockedBeat6BillingRecords(shouldNotify: boolean) {
    const beat6Meta = OCTOBER_2026_BEAT_METADATA[6];
    const beat6Rows = getOctober2026OfficialBeatSchedule('Beat 6') || [];
    const lockedBill: SpecialBillRecord = {
      id: 'BILL-BEAT6-OCT2026-LOCKED',
      billNumber: 'DOP/KOTA/FUEL/2026/B06',
      type: 'FUEL_BILL',
      title: 'Official Two-Wheeler Fuel Bill: October 2026 (Beat 6 - RAM KISHAN MEGHWAL) [Department Locked]',
      employeeId: '10317473',
      employeeName: 'RAM KISHAN MEGHWAL',
      employeeEmail: 'ramkishan.meghwal@indiapost.gov.in',
      beatNo: 'Beat 6',
      officeName: 'Dadabari S.O. (324009)',
      fromDate: '2026-10-01',
      toDate: '2026-10-31',
      totalDays: 23,
      fixedKm: 22,
      totalAmount: 1821.60,
      status: 'Sanctioned',
      isDepartmentLocked: true,
      lockedAt: '2026-11-01T09:00:00Z',
      lockedBy: 'Department DSS Audit (Office 28660686 / BATCH_01)',
      departmentLockSource: 'DSS_REPORT_OCT_2026_OFFICIAL',
      details: {
        claimMonth: 'OCTOBER',
        claimYear: '2026',
        calendarDays: 31,
        workingDays: 23,
        leaveDays: 8,
        sundaysAndHolidays: 6,
        absentDays: ['13-10-2026', '22-10-2026'],
        totalDistanceKm: 506,
        totalMonthlyKm: 506,
        sanctionedDailyKm: 22,
        ratePerKm: 3.60,
        vehicleNo: 'RJ-20-RK-1031',
        registeredArticles: 0,
        pdmsInvoicedCount: beat6Meta?.pdmsTotal ?? 1248,
        dssInvoicedCount: beat6Meta?.dssTotal ?? 1227,
        totalArticlesDelivered: beat6Meta?.dssTotal ?? 1227,
        mobileUsagePercentage: beat6Meta?.mobileUsageAvg ?? 97.94,
        linkedPincodes: ['324009', '324005'],
        dailyRows: beat6Rows,
        remarks:
          'Department-Locked Beat 6 (Ramkishan Meghwal | ID: 10317473 | Contact: 9664215130): 23 Working Days (Oct 13 & Oct 22 LEAVE) × 22 KM/day = 506 KM @ ₹3.60/KM = ₹1,821.60 | PDMS: 1,248 | DSS: 1,227 | Mobile Usage: 97.94%.',
        spmVerificationNote: 'Department DSS Audit Verified & Immutable Lock Applied (Office 28660686 / BATCH_01).',
      },
      documentCategory: 'FUEL_ALLOWANCE',
      auditTrail: [
        {
          action: 'Department DSS Ingested & Locked',
          performedBy: 'Department DSS Audit (Office 28660686)',
          timestamp: '2026-11-01T09:00:00Z',
          notes: 'Locked Beat 6 official Oct 2026 dataset: 23 working days, 506 KM, ₹1,821.60, 97.94% mobile usage.',
        },
      ],
      createdAt: '2026-11-01',
    };

    const existingIdx = this.specialBills.findIndex((b) => b.id === lockedBill.id);
    if (existingIdx === -1) {
      this.specialBills = [lockedBill, ...this.specialBills];
      this.saveSpecialBills();
    } else {
      this.specialBills[existingIdx] = lockedBill;
      this.saveSpecialBills();
    }

    const lockedLedger: FuelLedgerEntry = {
      id: 'FLED-BEAT6-OCT2026-LOCKED',
      date: '2026-10-31',
      employeeId: '10317473',
      employeeName: 'RAM KISHAN MEGHWAL',
      beatNo: 'Beat 6',
      officeName: 'Dadabari S.O. (324009)',
      vehicleNo: 'RJ-20-RK-1031',
      openingKmReading: 28400,
      closingKmReading: 28906,
      netKmRun: 506,
      sanctionedBeatKm: 506,
      fuelVolumeLitres: 17.37,
      fuelPricePerLitre: 104.87,
      totalFuelCost: 1821.60,
      receiptNumber: 'DOP-OCT2026-BEAT06-LOCKED',
      fuelStationName: 'Department Verified Monthly Fuel Claim (23 Days × 22 KM @ ₹3.60)',
      paymentMode: 'UPI / DakPay',
      dssReconciliationStatus: 'Reconciled with DSS',
      isDepartmentLocked: true,
      lockedAt: '2026-11-01T09:00:00Z',
      lockedBy: 'Department DSS Audit (Office 28660686 / BATCH_01)',
      departmentLockSource: 'DSS_REPORT_OCT_2026_OFFICIAL',
      remarks:
        'Immutable Department Lock: Beat 6 Ramkishan Meghwal (9664215130) · 23 Working Days (Oct 13 & Oct 22 Absent/Leave) · 506 KM × ₹3.60 = ₹1,821.60 · PDMS 1,248 / DSS 1,227 (97.94% Mobile Usage).',
      createdAt: '2026-11-01T09:00:00Z',
    };

    const ledIdx = this.fuelLedgerEntries.findIndex((f) => f.id === lockedLedger.id);
    if (ledIdx === -1) {
      this.fuelLedgerEntries = [lockedLedger, ...this.fuelLedgerEntries];
      this.saveFuelLedger();
    } else {
      this.fuelLedgerEntries[ledIdx] = lockedLedger;
      this.saveFuelLedger();
    }

    if (shouldNotify) {
      this.notify();
    }
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
    const prefixMap: Record<string, string> = {
      FUEL_BILL: 'FUEL',
      CHARGE_REPORT: 'ACG61',
      OUTSIDER_BILL: 'OUT',
      BYOD_BILL: 'BYOD',
      CONSOLIDATED_BILL: 'CONS',
      NPR_CENSUS_LOG: 'NPR',
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
    if (found.isDepartmentLocked) {
      return found;
    }
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
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.fuelLedgerEntries = parsed;
          this.ensureLockedBeat6BillingRecords(false);
          return;
        }
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
    this.ensureLockedBeat6BillingRecords(false);
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
    if (this.fuelLedgerEntries[idx].isDepartmentLocked) {
      return this.fuelLedgerEntries[idx];
    }
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
      masterAdminEmail: 'Ektamahenmeena@gmail.com',
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
   * under the Master Admin account (Ektamahenmeena@gmail.com).
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
        `India Post CRM Master Backup - Dadabari SO (Ektamahenmeena@gmail.com)`,
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
        c.enteredBy || 'Ektamahenmeena@gmail.com',
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
   * directly to Ektamahenmeena@gmail.com via the Gmail API.
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
          <p style="margin: 0; font-size: 12px; color: #fecaca;">Master Admin Account: Ektamahenmeena@gmail.com • Generated on ${dateLabel}</p>
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

    await sendGmailMessage(accessToken, 'Ektamahenmeena@gmail.com', subject, htmlBody);

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
      summary: `Dispatched ${reportPeriod} CRM Activity & Backup Summary email to Ektamahenmeena@gmail.com.`,
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
      'Entered By': c.enteredBy || 'Ektamahenmeena@gmail.com',
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
