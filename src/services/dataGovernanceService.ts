import * as XLSX from 'xlsx';
import {
  DataExportHistoryRecord,
  DataImportConflictItem,
  DataImportValidationReport,
  HouseMasterRecord,
  StaffProfile,
  StreetMasterRecord,
  SystemBackupBundle,
} from '../types/models';
import { customerService } from './customerService';
import { kotaOsHierarchyService } from './kotaOsHierarchyService';
import { locationSurveyService } from './locationSurveyService';

const EXPORT_HISTORY_KEY = 'kota_os_export_history_v1';
const LAST_BACKUP_META_KEY = 'kota_os_last_backup_meta_v1';

function computeDeterministicChecksum(input: string): string {
  // 64-bit dual-FNV-1a deterministic digest for browser-safe snapshot tamper verification
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= c ^ (i & 0xff);
    h2 = Math.imul(h2, 0x01000193);
  }
  const partA = (h1 >>> 0).toString(16).padStart(8, '0');
  const partB = (h2 >>> 0).toString(16).padStart(8, '0');
  return `FNV64-${partA}${partB}-${input.length}`;
}

function escapeCsvCell(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

class DataGovernanceService {
  private exportHistory: DataExportHistoryRecord[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadHistory();
  }

  private loadHistory(): void {
    try {
      const raw = localStorage.getItem(EXPORT_HISTORY_KEY);
      this.exportHistory = raw ? JSON.parse(raw) : [];
    } catch {
      this.exportHistory = [];
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(this.exportHistory));
    } catch (e) {
      console.warn('Export history persist failed:', e);
    }
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public getExportHistory(): DataExportHistoryRecord[] {
    return this.exportHistory;
  }

  public getLastBackupMetadata(): { timestamp: string; checksum: string; counts: Record<string, number> } | null {
    try {
      const raw = localStorage.getItem(LAST_BACKUP_META_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public recordExport(entry: Omit<DataExportHistoryRecord, 'id' | 'timestamp'>): DataExportHistoryRecord {
    const rec: DataExportHistoryRecord = {
      ...entry,
      id: `EXP-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
    };
    this.exportHistory.unshift(rec);
    if (this.exportHistory.length > 200) {
      this.exportHistory = this.exportHistory.slice(0, 200);
    }
    this.saveHistory();
    return rec;
  }

  public exportRowsToCsvWithBom(
    rows: Array<Record<string, unknown>>,
    fileName: string,
    dataset: string,
    actor: StaffProfile | null | undefined,
    filtersApplied: string
  ): void {
    const headers = rows.length > 0 ? Object.keys(rows[0]) : ['EmptyDataset'];
    const csvLines = [
      headers.map(escapeCsvCell).join(','),
      ...rows.map((row) => headers.map((h) => escapeCsvCell(row[h])).join(',')),
    ];
    // Prepend UTF-8 BOM (\uFEFF) so Excel / LibreOffice renders Hindi/Devanagari cleanly
    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.triggerDownload(blob, fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);

    this.recordExport({
      performedBy: actor?.name || 'System Admin',
      userRole: actor?.officialPost || actor?.role || 'ADMIN',
      dataset,
      format: 'CSV_UTF8_BOM',
      recordCount: rows.length,
      filtersApplied,
      fileName,
    });
  }

  public exportRowsToXlsx(
    sheets: Array<{ sheetName: string; rows: Array<Record<string, unknown>> }>,
    fileName: string,
    dataset: string,
    actor: StaffProfile | null | undefined,
    filtersApplied: string
  ): void {
    const wb = XLSX.utils.book_new();
    let totalCount = 0;
    sheets.forEach(({ sheetName, rows }) => {
      const safeRows = rows.length > 0 ? rows : [{ Notice: 'No matching records for selected filter' }];
      totalCount += rows.length;
      const ws = XLSX.utils.json_to_sheet(safeRows);
      XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
    });
    const outFile = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
    XLSX.writeFile(wb, outFile);

    this.recordExport({
      performedBy: actor?.name || 'System Admin',
      userRole: actor?.officialPost || actor?.role || 'ADMIN',
      dataset,
      format: 'XLSX',
      recordCount: totalCount,
      filtersApplied,
      fileName: outFile,
    });
  }

  // CONTROLLED IMPORT PARSING & VERIFIED-RECORD CONFLICT DETECTION
  public async parseSpreadsheetFile(file: File): Promise<Array<Record<string, string>>> {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array', codepage: 65001 });
    const firstSheet = wb.SheetNames[0];
    if (!firstSheet) return [];
    const ws = wb.Sheets[firstSheet];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
    return json.map((row) => {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(row)) {
        out[k.trim()] = String(v ?? '').trim();
      }
      return out;
    });
  }

  public analyzeImportRows(
    entityType: 'HouseMaster' | 'StreetMaster' | 'CustomerMaster',
    rows: Array<Record<string, string>>,
    fileName: string
  ): {
    report: DataImportValidationReport;
    readyRows: Array<Record<string, string>>;
  } {
    const conflicts: DataImportConflictItem[] = [];
    const readyRows: Array<Record<string, string>> = [];
    const seenInFile = new Set<string>();

    const existingHouses = locationSurveyService.getHouses();
    const existingStreets = locationSurveyService.getStreets();
    const existingCustomers = customerService.getCustomers();

    rows.forEach((row, idx) => {
      const rowNum = idx + 2; // 1-based header + row
      const pin = (row.pincode || row.PIN || row.Pincode || '').trim();
      if (pin && !/^\d{6}$/.test(pin)) {
        conflicts.push({
          rowIndex: rowNum,
          entityType,
          identifier: pin,
          reason: 'VALIDATION_ERROR',
          incomingSummary: `Invalid 6-digit PIN "${pin}"`,
          resolution: 'INVALID',
        });
        return;
      }

      if (entityType === 'StreetMaster') {
        const name = (row.streetName || row.StreetName || row.name || '').trim();
        const colony = (row.colony || row.Colony || '').trim();
        if (!name || !colony || !pin) {
          conflicts.push({
            rowIndex: rowNum,
            entityType,
            identifier: name || `Row ${rowNum}`,
            reason: 'VALIDATION_ERROR',
            incomingSummary: 'Missing required streetName, colony, or 6-digit pincode.',
            resolution: 'INVALID',
          });
          return;
        }
        const key = `${name.toLowerCase()}|${colony.toLowerCase()}|${pin}`;
        if (seenInFile.has(key)) {
          conflicts.push({
            rowIndex: rowNum,
            entityType,
            identifier: key,
            reason: 'DUPLICATE_IN_FILE',
            incomingSummary: `${name} (${colony}, ${pin})`,
            resolution: 'SKIPPED',
          });
          return;
        }
        seenInFile.add(key);

        const match = existingStreets.find(
          (s) =>
            s.streetName.toLowerCase() === name.toLowerCase() &&
            s.colony.toLowerCase() === colony.toLowerCase() &&
            s.pincode === pin
        );
        if (match) {
          conflicts.push({
            rowIndex: rowNum,
            entityType,
            identifier: match.streetCode,
            reason: 'DUPLICATE_EXISTING',
            existingSummary: `${match.streetName} (${match.colony})`,
            incomingSummary: `${name} (${colony})`,
            resolution: 'QUEUED_FOR_REVIEW',
          });
          return;
        }
        readyRows.push(row);
      } else if (entityType === 'HouseMaster') {
        const houseNo = (row.houseNumber || row.HouseNumber || row.houseNo || '').trim();
        const colony = (row.colony || row.Colony || '').trim();
        if (!houseNo || !colony || !pin) {
          conflicts.push({
            rowIndex: rowNum,
            entityType,
            identifier: houseNo || `Row ${rowNum}`,
            reason: 'VALIDATION_ERROR',
            incomingSummary: 'Missing required houseNumber, colony, or 6-digit pincode.',
            resolution: 'INVALID',
          });
          return;
        }
        const floor = (row.floorUnit || row.FloorUnit || 'Ground').trim();
        const key = `${houseNo.toLowerCase()}|${floor.toLowerCase()}|${colony.toLowerCase()}|${pin}`;
        if (seenInFile.has(key)) {
          conflicts.push({
            rowIndex: rowNum,
            entityType,
            identifier: key,
            reason: 'DUPLICATE_IN_FILE',
            incomingSummary: `${houseNo} (${floor}, ${colony})`,
            resolution: 'SKIPPED',
          });
          return;
        }
        seenInFile.add(key);

        const existingHouse = existingHouses.find(
          (h) =>
            h.houseNumber.toLowerCase() === houseNo.toLowerCase() &&
            (h.floorUnit || 'Ground').toLowerCase() === floor.toLowerCase() &&
            h.colony.toLowerCase() === colony.toLowerCase() &&
            h.pincode === pin
        );
        if (existingHouse) {
          // NEVER silently overwrite verified records
          if (existingHouse.surveyStatus === 'Verified' || existingHouse.surveyStatus === 'Completed') {
            conflicts.push({
              rowIndex: rowNum,
              entityType,
              identifier: existingHouse.id,
              reason: 'ALREADY_VERIFIED_PROTECTED',
              existingSummary: `Verified House ${existingHouse.houseNumber} (${existingHouse.colony})`,
              incomingSummary: `${houseNo} (${floor})`,
              resolution: 'BLOCKED_VERIFIED',
            });
          } else {
            conflicts.push({
              rowIndex: rowNum,
              entityType,
              identifier: existingHouse.id,
              reason: 'DUPLICATE_EXISTING',
              existingSummary: `${existingHouse.houseNumber} (${existingHouse.surveyStatus})`,
              incomingSummary: `${houseNo} (${floor})`,
              resolution: 'QUEUED_FOR_REVIEW',
            });
          }
          return;
        }
        readyRows.push(row);
      } else {
        const name = (row.name || row.Name || '').trim();
        const mobile = (row.mobile || row.Mobile || '').replace(/\D/g, '');
        if (!name || mobile.length !== 10) {
          conflicts.push({
            rowIndex: rowNum,
            entityType,
            identifier: name || `Row ${rowNum}`,
            reason: 'VALIDATION_ERROR',
            incomingSummary: 'Requires non-empty name and valid 10-digit mobile.',
            resolution: 'INVALID',
          });
          return;
        }
        const key = `${name.toLowerCase()}|${mobile}`;
        if (seenInFile.has(key)) {
          conflicts.push({
            rowIndex: rowNum,
            entityType,
            identifier: mobile,
            reason: 'DUPLICATE_IN_FILE',
            incomingSummary: `${name} (${mobile})`,
            resolution: 'SKIPPED',
          });
          return;
        }
        seenInFile.add(key);

        const existingCust = existingCustomers.find(
          (c) => (c.mobile || '').replace(/\D/g, '') === mobile
        );
        if (existingCust) {
          if (existingCust.verificationStatus === 'Verified') {
            conflicts.push({
              rowIndex: rowNum,
              entityType,
              identifier: existingCust.masterId || existingCust.id,
              reason: 'ALREADY_VERIFIED_PROTECTED',
              existingSummary: `Verified Citizen ${existingCust.name} (${existingCust.mobile})`,
              incomingSummary: `${name} (${mobile})`,
              resolution: 'BLOCKED_VERIFIED',
            });
          } else {
            conflicts.push({
              rowIndex: rowNum,
              entityType,
              identifier: existingCust.masterId || existingCust.id,
              reason: 'DUPLICATE_EXISTING',
              existingSummary: `${existingCust.name} (${existingCust.verificationStatus})`,
              incomingSummary: `${name} (${mobile})`,
              resolution: 'QUEUED_FOR_REVIEW',
            });
          }
          return;
        }
        readyRows.push(row);
      }
    });

    const report: DataImportValidationReport = {
      id: `IMP-${Date.now().toString(36).toUpperCase()}`,
      fileName,
      entityType,
      totalRows: rows.length,
      validReadyCount: readyRows.length,
      blockedVerifiedCount: conflicts.filter((c) => c.reason === 'ALREADY_VERIFIED_PROTECTED').length,
      duplicateCount: conflicts.filter(
        (c) => c.reason === 'DUPLICATE_IN_FILE' || c.reason === 'DUPLICATE_EXISTING'
      ).length,
      errorCount: conflicts.filter((c) => c.reason === 'VALIDATION_ERROR').length,
      conflicts,
      analyzedAt: new Date().toISOString(),
    };

    return { report, readyRows };
  }

  public commitValidatedImport(
    entityType: 'HouseMaster' | 'StreetMaster' | 'CustomerMaster',
    readyRows: Array<Record<string, string>>,
    actor: StaffProfile | null | undefined
  ): number {
    let committed = 0;
    if (entityType === 'StreetMaster') {
      readyRows.forEach((r) => {
        locationSurveyService.upsertStreet({
          streetName: r.streetName || r.StreetName || r.name,
          streetNameHi: r.streetNameHi || r.StreetNameHi,
          division: r.division || 'Kota Division',
          subdivision: r.subdivision || 'Kota South Subdivision',
          officeName: r.officeName || r.OfficeName || 'Dadabari S.O.',
          pincode: r.pincode || r.PIN || r.Pincode,
          locality: r.locality || r.Locality || r.colony || r.Colony,
          colony: r.colony || r.Colony,
          sectorBlock: r.sectorBlock || r.Sector || 'General',
          beatNo: r.beatNo || r.Beat,
          landmark: r.landmark,
          status: 'ACTIVE',
          createdBy: actor?.name || 'Import Center',
        });
        committed += 1;
      });
    } else if (entityType === 'HouseMaster') {
      readyRows.forEach((r) => {
        locationSurveyService.upsertHouse({
          houseNumber: r.houseNumber || r.HouseNumber || r.houseNo,
          buildingName: r.buildingName,
          floorUnit: r.floorUnit || r.FloorUnit || 'Ground Floor',
          streetId: r.streetId || 'UNLINKED_STREET',
          streetName: r.streetName || r.StreetName || 'Main Street',
          sectorBlock: r.sectorBlock || r.Sector || 'General',
          colony: r.colony || r.Colony,
          locality: r.locality || r.Locality || r.colony || r.Colony,
          pincode: r.pincode || r.PIN || r.Pincode,
          officeName: r.officeName || 'Dadabari S.O.',
          division: r.division || 'Kota Division',
          beatNo: r.beatNo || r.Beat,
          occupancyType: (r.occupancyType as HouseMasterRecord['occupancyType']) || 'Residential',
          headResidentName: r.headResidentName,
          consentCaptured: r.consentCaptured === 'true' || r.consentCaptured === 'YES',
          consentRecordedBy: actor?.name,
          surveyStatus: 'Unvisited',
          remarks: r.remarks,
        });
        committed += 1;
      });
    } else {
      readyRows.forEach((r) => {
        const res = customerService.addOrUpdateCustomer(
          {
            name: r.name || r.Name,
            mobile: (r.mobile || r.Mobile).replace(/\D/g, ''),
            pincode: r.pincode || r.PIN || '324009',
            colony: r.colony || r.Colony || r.area,
            area: r.colony || r.Colony || r.area,
            houseNo: r.houseNo || r.HouseNo,
            beatNo: r.beatNo || r.Beat || '2',
            verificationStatus: 'Pending Verification',
            source: 'Controlled Import Center',
          },
          actor?.name || 'Import Center'
        );
        if (res.customer) committed += 1;
      });
    }
    return committed;
  }

  public downloadConflictErrorCsv(
    report: DataImportValidationReport,
    actor: StaffProfile | null | undefined
  ): void {
    const rows = report.conflicts.map((c) => ({
      RowNumber: c.rowIndex,
      EntityType: c.entityType,
      Identifier: c.identifier,
      Reason: c.reason,
      ExistingRecord: c.existingSummary || '',
      IncomingSummary: c.incomingSummary,
      Resolution: c.resolution,
    }));
    this.exportRowsToCsvWithBom(
      rows,
      `import-conflicts-${report.entityType}-${Date.now()}.csv`,
      `ImportErrorReport:${report.entityType}`,
      actor,
      `SourceFile=${report.fileName}`
    );
  }

  // VERIFIED SNAPSHOT BACKUP & RESTORE
  public createVerifiedBackupBundle(
    actor: StaffProfile | null | undefined,
    downloadFile = true
  ): SystemBackupBundle {
    const locState = locationSurveyService.exportState();
    const orgState = kotaOsHierarchyService.exportState();
    const customers = customerService.getCustomers();
    const leads = customerService.getLeads();
    const followUps = customerService.getFollowUps();
    const tasks = customerService.getTasks();

    const payload = {
      customers,
      leads,
      followUps,
      tasks,
      orgHierarchy: orgState.hierarchy,
      clusters: orgState.clusters,
      postConfigs: orgState.postConfigs,
      userGranularOverrides: orgState.userGranularOverrides,
      governanceAuditLogs: orgState.auditLogs,
      streets: locState.streets,
      houses: locState.houses,
      surveys: locState.surveys,
      surveyDrafts: locState.drafts,
    };

    const entityCounts: Record<string, number> = {
      customers: customers.length,
      leads: leads.length,
      followUps: followUps.length,
      tasks: tasks.length,
      orgNodes: orgState.hierarchy.length,
      clusters: orgState.clusters.length,
      streets: locState.streets.length,
      houses: locState.houses.length,
      surveys: locState.surveys.length,
    };

    const serializedPayload = JSON.stringify(payload);
    const checksum = computeDeterministicChecksum(serializedPayload);

    const bundle: SystemBackupBundle = {
      schemaVersion: '1.0.0',
      platform: 'KOTA_DIVISION_OS',
      createdAt: new Date().toISOString(),
      createdBy: actor?.name || 'Master Admin',
      checksumSha256Like: checksum,
      entityCounts,
      payload,
    };

    try {
      localStorage.setItem(
        LAST_BACKUP_META_KEY,
        JSON.stringify({ timestamp: bundle.createdAt, checksum, counts: entityCounts })
      );
    } catch {
      // ignore storage quota warning
    }

    if (downloadFile) {
      const fileName = `kota-division-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json;charset=utf-8;' });
      this.triggerDownload(blob, fileName);
      this.recordExport({
        performedBy: actor?.name || 'Master Admin',
        userRole: actor?.officialPost || actor?.role || 'ADMIN',
        dataset: 'Full System Verified Backup',
        format: 'JSON_BACKUP',
        recordCount: Object.values(entityCounts).reduce((a, b) => a + b, 0),
        filtersApplied: `Checksum=${checksum}`,
        fileName,
      });
    }

    return bundle;
  }

  public verifyAndRestoreBackupBundle(
    rawJson: string,
    actor: StaffProfile | null | undefined
  ): {
    verified: boolean;
    message: string;
    restoredCounts?: Record<string, number>;
  } {
    let parsed: SystemBackupBundle;
    try {
      parsed = JSON.parse(rawJson) as SystemBackupBundle;
    } catch {
      return { verified: false, message: 'Invalid JSON file format.' };
    }

    if (parsed.platform !== 'KOTA_DIVISION_OS' || !parsed.payload || !parsed.checksumSha256Like) {
      return {
        verified: false,
        message: 'Backup schema mismatch: Not a valid KOTA DIVISION OS verified snapshot.',
      };
    }

    const recomputedChecksum = computeDeterministicChecksum(JSON.stringify(parsed.payload));
    if (recomputedChecksum !== parsed.checksumSha256Like) {
      return {
        verified: false,
        message: `Integrity check FAILED. Expected ${parsed.checksumSha256Like}, computed ${recomputedChecksum}. Restore aborted without altering live data.`,
      };
    }

    const p = parsed.payload as any;
    kotaOsHierarchyService.restoreState({
      hierarchy: Array.isArray(p.orgHierarchy) ? p.orgHierarchy : undefined,
      clusters: Array.isArray(p.clusters) ? p.clusters : undefined,
      postConfigs: Array.isArray(p.postConfigs) ? p.postConfigs : undefined,
      userGranularOverrides: p.userGranularOverrides,
      auditLogs: Array.isArray(p.governanceAuditLogs) ? p.governanceAuditLogs : undefined,
    });

    locationSurveyService.restoreState({
      streets: Array.isArray(p.streets) ? p.streets : undefined,
      houses: Array.isArray(p.houses) ? p.houses : undefined,
      surveys: Array.isArray(p.surveys) ? p.surveys : undefined,
      drafts: p.surveyDrafts,
    });

    // Verify restored counts post-write
    const postLoc = locationSurveyService.exportState();
    const postOrg = kotaOsHierarchyService.exportState();
    const restoredCounts: Record<string, number> = {
      orgNodes: postOrg.hierarchy.length,
      clusters: postOrg.clusters.length,
      streets: postLoc.streets.length,
      houses: postLoc.houses.length,
      surveys: postLoc.surveys.length,
    };

    const countMismatch =
      (parsed.entityCounts.streets !== undefined && restoredCounts.streets !== parsed.entityCounts.streets) ||
      (parsed.entityCounts.houses !== undefined && restoredCounts.houses !== parsed.entityCounts.houses) ||
      (parsed.entityCounts.surveys !== undefined && restoredCounts.surveys !== parsed.entityCounts.surveys);

    if (countMismatch) {
      return {
        verified: false,
        message: 'Post-restore count verification detected mismatch. Please review backup snapshot.',
        restoredCounts,
      };
    }

    kotaOsHierarchyService.recordGovernanceAudit(
      actor?.name || 'Master Admin',
      actor?.role || 'MASTER_ADMIN',
      'VERIFIED_BACKUP_RESTORE',
      'KOTA_DIVISION_OS',
      `Checksum ${recomputedChecksum} verified. Houses=${restoredCounts.houses}, Streets=${restoredCounts.streets}, Surveys=${restoredCounts.surveys}`
    );

    return {
      verified: true,
      message: `Checksum verified (${recomputedChecksum}) & post-restore counts matched cleanly.`,
      restoredCounts,
    };
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export const dataGovernanceService = new DataGovernanceService();
