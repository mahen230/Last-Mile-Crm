import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  History,
  RefreshCw,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { dataGovernanceService } from '../../services/dataGovernanceService';
import { customerService } from '../../services/customerService';
import { locationSurveyService } from '../../services/locationSurveyService';
import { kotaOsHierarchyService } from '../../services/kotaOsHierarchyService';
import {
  DataExportHistoryRecord,
  DataImportValidationReport,
} from '../../types/models';

export default function DataBackupCenterView() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'EXPORT' | 'IMPORT' | 'BACKUP'>('EXPORT');
  const [exportHistory, setExportHistory] = useState<DataExportHistoryRecord[]>([]);
  const [lastBackupMeta, setLastBackupMeta] = useState(dataGovernanceService.getLastBackupMetadata());
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Export filters
  const [dataset, setDataset] = useState<'HouseMaster' | 'StreetMaster' | 'Surveys' | 'CustomerMaster' | 'LeadsPool' | 'OrgHierarchy'>('HouseMaster');
  const [pinFilter, setPinFilter] = useState('');

  // Controlled Import state
  const [importEntity, setImportEntity] = useState<'HouseMaster' | 'StreetMaster' | 'CustomerMaster'>('HouseMaster');
  const [importReport, setImportReport] = useState<DataImportValidationReport | null>(null);
  const [readyRows, setReadyRows] = useState<Array<Record<string, string>>>([]);

  // Restore verification result
  const [restoreResult, setRestoreResult] = useState<{
    verified: boolean;
    message: string;
    restoredCounts?: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    const sync = () => {
      setExportHistory([...dataGovernanceService.getExportHistory()]);
      setLastBackupMeta(dataGovernanceService.getLastBackupMetadata());
    };
    sync();
    return dataGovernanceService.subscribe(sync);
  }, []);

  const buildDatasetRows = (): Array<Record<string, unknown>> => {
    const pin = pinFilter.trim();
    if (dataset === 'HouseMaster') {
      return locationSurveyService
        .getHouses(userProfile)
        .filter((h) => !pin || h.pincode.includes(pin))
        .map((h) => ({
          HouseID: h.id,
          HouseNumber: h.houseNumber,
          FloorUnit: h.floorUnit || '',
          StreetName: h.streetName,
          Colony: h.colony,
          SectorBlock: h.sectorBlock,
          PIN: h.pincode,
          Office: h.officeName || '',
          OccupancyType: h.occupancyType,
          ConsentCaptured: h.consentCaptured ? 'YES' : 'NO',
          SurveyStatus: h.surveyStatus,
        }));
    }
    if (dataset === 'StreetMaster') {
      return locationSurveyService
        .getStreets(userProfile)
        .filter((s) => !pin || s.pincode.includes(pin))
        .map((s) => ({
          StreetCode: s.streetCode,
          StreetName: s.streetName,
          StreetNameHindi: s.streetNameHi || '',
          Colony: s.colony,
          SectorBlock: s.sectorBlock,
          Locality: s.locality,
          Office: s.officeName || '',
          PIN: s.pincode,
          Beat: s.beatNo || '',
        }));
    }
    if (dataset === 'Surveys') {
      return locationSurveyService
        .getSurveys(userProfile)
        .filter((s) => !pin || s.pincode.includes(pin))
        .map((s) => ({
          SurveyID: s.id,
          HouseID: s.houseId,
          Address: s.houseDisplayAddress,
          Colony: s.colony,
          PIN: s.pincode,
          Staff: s.assignedStaffName,
          Status: s.status,
          Consent: s.consentCaptured ? 'YES' : 'NO',
          GpsStatus: s.gpsStatus,
          VerifiedBy: s.verifiedBy || '',
        }));
    }
    if (dataset === 'CustomerMaster') {
      return customerService
        .getScopedCustomers(userProfile)
        .filter((c) => !pin || (c.pincode || '').includes(pin))
        .map((c) => ({
          MasterID: c.masterId || c.id,
          Name: c.name,
          Mobile: c.mobile,
          HouseNo: c.houseNo || '',
          Colony: c.colony || c.area || '',
          PIN: c.pincode || '',
          Beat: c.beatNo || '',
          Verification: c.verificationStatus,
        }));
    }
    if (dataset === 'LeadsPool') {
      return customerService
        .getScopedLeads(userProfile)
        .filter((l) => !pin || (l.pincode || '').includes(pin))
        .map((l) => ({
          LeadID: l.id,
          Customer: l.customerName,
          Mobile: l.customerMobile,
          Product: l.productName,
          PoolStage: l.poolStage || l.stage,
          Cluster: l.clusterName || l.clusterId || '',
          AssignedStaff: l.assignedStaffName || '',
          SourceChannel: l.sourceChannel || l.source,
        }));
    }
    return kotaOsHierarchyService.getOrgHierarchyNodes().map((n) => ({
      ID: n.id,
      Code: n.code,
      Level: n.level,
      Name: n.name,
      PIN: n.pincode || '',
      Incharge: n.inchargeName || '',
      Status: n.status,
    }));
  };

  const handleExport = (format: 'CSV' | 'XLSX') => {
    const rows = buildDatasetRows();
    const filterSummary = pinFilter ? `PIN=${pinFilter}` : 'All Records in Scope';
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === 'CSV') {
      dataGovernanceService.exportRowsToCsvWithBom(
        rows,
        `kota-os-${dataset.toLowerCase()}-${stamp}.csv`,
        dataset,
        userProfile,
        filterSummary
      );
      setNotice({
        type: 'ok',
        text: `Exported ${rows.length} rows as UTF-8 BOM CSV (Hindi/Devanagari compatible).`,
      });
    } else {
      dataGovernanceService.exportRowsToXlsx(
        [{ sheetName: dataset, rows }],
        `kota-os-${dataset.toLowerCase()}-${stamp}.xlsx`,
        dataset,
        userProfile,
        filterSummary
      );
      setNotice({
        type: 'ok',
        text: `Exported ${rows.length} rows to Excel (.xlsx).`,
      });
    }
  };

  const handleAnalyzeImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsedRows = await dataGovernanceService.parseSpreadsheetFile(file);
      const { report, readyRows: valid } = dataGovernanceService.analyzeImportRows(
        importEntity,
        parsedRows,
        file.name
      );
      setImportReport(report);
      setReadyRows(valid);
      setNotice({
        type: 'ok',
        text: `Analyzed ${report.totalRows} rows: ${report.validReadyCount} ready, ${report.blockedVerifiedCount} verified protected, ${report.errorCount} invalid.`,
      });
    } catch (err) {
      setNotice({
        type: 'err',
        text: `Failed to parse spreadsheet: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }
  };

  const handleCommitReadyImport = () => {
    if (readyRows.length === 0) return;
    const count = dataGovernanceService.commitValidatedImport(
      importEntity,
      readyRows,
      userProfile
    );
    setNotice({
      type: 'ok',
      text: `Committed ${count} validated non-conflicting ${importEntity} records cleanly.`,
    });
    setReadyRows([]);
  };

  const handleCreateVerifiedBackup = () => {
    const bundle = dataGovernanceService.createVerifiedBackupBundle(userProfile, true);
    setLastBackupMeta(dataGovernanceService.getLastBackupMetadata());
    setNotice({
      type: 'ok',
      text: `Verified backup downloaded. Checksum: ${bundle.checksumSha256Like}`,
    });
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = dataGovernanceService.verifyAndRestoreBackupBundle(text, userProfile);
    setRestoreResult(res);
    setNotice({
      type: res.verified ? 'ok' : 'err',
      text: res.message,
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#0A1628] text-white rounded-xl border border-slate-800 p-5 sm:p-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-orange-400 font-bold">
          KOTA DIVISION OS · DATA GOVERNANCE
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
          Data Import, UTF-8 Export &amp; Verified Backup Center
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Hindi/Devanagari UTF-8 BOM CSV &amp; Excel exports, verified-record conflict protection, and checksum-verified snapshot restore.
        </p>

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800">
          {[
            { id: 'EXPORT', label: 'Export & Audit History' },
            { id: 'IMPORT', label: 'Controlled Import & Conflict Guard' },
            { id: 'BACKUP', label: 'Verified Backup & Restore' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === t.id
                  ? 'bg-[#1D4ED8] text-white'
                  : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <div
          className={`px-4 py-2.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${
            notice.type === 'ok'
              ? 'bg-blue-50 border-blue-200 text-blue-950'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {notice.type === 'ok' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
          <span>{notice.text}</span>
        </div>
      )}

      {activeTab === 'EXPORT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 space-y-3.5 text-xs">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-[#1D4ED8]" />
              <span>Export Dataset</span>
            </h2>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Dataset</label>
              <select
                value={dataset}
                onChange={(e) => setDataset(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
              >
                <option value="HouseMaster">House Master Registry</option>
                <option value="StreetMaster">Street Master Registry</option>
                <option value="Surveys">Doorstep Surveys Log</option>
                <option value="CustomerMaster">Customer Master</option>
                <option value="LeadsPool">Leads Pool &amp; Clusters</option>
                <option value="OrgHierarchy">Org Hierarchy (Circle to BO)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Optional 6-Digit PIN Filter</label>
              <input
                type="text"
                maxLength={6}
                value={pinFilter}
                onChange={(e) => setPinFilter(e.target.value.replace(/\D/g, ''))}
                placeholder="Leave blank for all"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleExport('CSV')}
                className="py-2.5 bg-[#0A1628] hover:bg-slate-800 text-white rounded-lg font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={13} /> CSV (UTF-8 BOM)
              </button>
              <button
                type="button"
                onClick={() => handleExport('XLSX')}
                className="py-2.5 bg-[#1D4ED8] hover:bg-blue-700 text-white rounded-lg font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={13} /> Excel (.xlsx)
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 overflow-x-auto">
            <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              <History size={16} className="text-[#EA580C]" />
              <span>Export Audit History ({exportHistory.length})</span>
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                  <th className="py-2 pr-3">Timestamp</th>
                  <th className="py-2 pr-3">Dataset</th>
                  <th className="py-2 pr-3">Format</th>
                  <th className="py-2 pr-3">Rows</th>
                  <th className="py-2">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exportHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No exports logged yet.
                    </td>
                  </tr>
                ) : (
                  exportHistory.map((h) => (
                    <tr key={h.id}>
                      <td className="py-2 pr-3 font-mono text-[11px] tabular-nums">
                        {h.timestamp.slice(0, 19).replace('T', ' ')}
                      </td>
                      <td className="py-2 pr-3 font-bold text-slate-900">{h.dataset}</td>
                      <td className="py-2 pr-3 font-mono text-[11px]">{h.format}</td>
                      <td className="py-2 pr-3 font-mono tabular-nums">{h.recordCount}</td>
                      <td className="py-2">
                        {h.performedBy} ({h.userRole})
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'IMPORT' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Upload size={16} className="text-[#EA580C]" />
                <span>Controlled Import Validation &amp; Verified Record Guard</span>
              </h2>
              <p className="text-slate-600">
                Validates schema, detects duplicates, and blocks silent overwrites of Verified records.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={importEntity}
                onChange={(e) => setImportEntity(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold"
              >
                <option value="HouseMaster">House Master</option>
                <option value="StreetMaster">Street Master</option>
                <option value="CustomerMaster">Customer Master</option>
              </select>
              <label className="px-4 py-2 bg-[#1D4ED8] hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer inline-flex items-center gap-1.5">
                <Upload size={14} /> Select .CSV / .XLSX
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleAnalyzeImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {importReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase text-slate-500 font-bold">Total Rows</div>
                  <div className="text-lg font-black tabular-nums">{importReport.totalRows}</div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] uppercase text-emerald-700 font-bold">Valid Ready</div>
                  <div className="text-lg font-black text-emerald-900 tabular-nums">
                    {importReport.validReadyCount}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="text-[10px] uppercase text-orange-800 font-bold">Protected Verified</div>
                  <div className="text-lg font-black text-orange-900 tabular-nums">
                    {importReport.blockedVerifiedCount}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase text-slate-500 font-bold">Duplicates</div>
                  <div className="text-lg font-black tabular-nums">{importReport.duplicateCount}</div>
                </div>
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="text-[10px] uppercase text-red-700 font-bold">Errors</div>
                  <div className="text-lg font-black text-red-900 tabular-nums">{importReport.errorCount}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {readyRows.length > 0 && (
                  <button
                    type="button"
                    onClick={handleCommitReadyImport}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold cursor-pointer"
                  >
                    Commit {readyRows.length} Validated Rows
                  </button>
                )}
                {importReport.conflicts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => dataGovernanceService.downloadConflictErrorCsv(importReport, userProfile)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} /> Download Conflict / Error Report CSV
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'BACKUP' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Database size={16} className="text-[#1D4ED8]" />
              <span>Create Integrity-Verified Snapshot Backup</span>
            </h2>
            <p className="text-slate-600">
              Generates a full JSON snapshot across Org Hierarchy, Clusters, Streets, Houses, Surveys, and CRM registries with an FNV-64 integrity checksum and entity counts.
            </p>
            {lastBackupMeta && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">Last Verified Snapshot</div>
                <div className="font-mono text-[11px] text-slate-600">
                  {lastBackupMeta.timestamp} · {lastBackupMeta.checksum}
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={handleCreateVerifiedBackup}
              className="px-4 py-2.5 bg-[#0A1628] hover:bg-slate-800 text-white rounded-lg font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <Download size={14} /> Generate &amp; Download Verified Backup (.json)
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#EA580C]" />
              <span>Verify Checksum &amp; Restore Snapshot</span>
            </h2>
            <p className="text-slate-600">
              Validates schema and recomputes checksum before restoring any records. Post-restore entity counts are verified before reporting success.
            </p>
            <label className="px-4 py-2.5 bg-[#EA580C] hover:bg-orange-700 text-white rounded-lg font-bold inline-flex items-center gap-2 cursor-pointer">
              <RefreshCw size={14} /> Upload &amp; Verify Backup JSON
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreFile}
                className="hidden"
              />
            </label>
            {restoreResult && (
              <div
                className={`p-3 rounded-lg border ${
                  restoreResult.verified
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <div className="font-bold">{restoreResult.verified ? 'Restore Verified' : 'Restore Verification Failed'}</div>
                <div className="mt-1">{restoreResult.message}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
