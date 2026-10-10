import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Cloud,
  Mail,
  ShieldCheck,
  ExternalLink,
  Clock,
  Send,
} from 'lucide-react';
import {
  googleSignIn,
  getAccessToken,
  listFiles,
  getSheetData,
} from '../lib/google-workspace';
import { customerService } from '../services/customerService';
import { operationsService, BackupEngineState } from '../services/operationsService';

interface PendingWorkspaceAction {
  type: 'SYNC_SHEETS' | 'SEND_GMAIL_DAILY' | 'SEND_GMAIL_WEEKLY';
  title: string;
  description: string;
  details: string[];
}

export default function MasterSourceSync() {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [backupState, setBackupState] = useState<BackupEngineState>(
    operationsService.getBackupState()
  );
  const [confirmDialog, setConfirmDialog] = useState<PendingWorkspaceAction | null>(null);

  const [stats, setStats] = useState({
    customers: 0,
    properties: 0,
    dailyEntries: 0,
    bills: 0,
    tasks: 0,
    leads: 0,
    conflicts: 0,
  });

  const updateAllStats = () => {
    setStats({
      customers: customerService.getCustomers().length,
      properties: customerService.getProperties().length,
      dailyEntries: operationsService.getDailyEntries().length,
      bills: operationsService.getSpecialBills().length,
      tasks: customerService.getTasks().length,
      leads: customerService.getLeads().length,
      conflicts: customerService.getConflicts().filter((c) => c.status === 'Pending Review').length,
    });
    setBackupState(operationsService.getBackupState());
  };

  useEffect(() => {
    updateAllStats();
    const unsubCust = customerService.subscribe(updateAllStats);
    const unsubOps = operationsService.subscribe(updateAllStats);
    return () => {
      unsubCust();
      unsubOps();
    };
  }, []);

  const ensureWorkspaceToken = async (): Promise<string> => {
    const existing = await getAccessToken();
    if (existing) return existing;
    const authResult = await googleSignIn();
    if (!authResult?.accessToken) {
      throw new Error('Google Workspace authorization was cancelled or failed.');
    }
    return authResult.accessToken;
  };

  const requestSheetsBackupConfirmation = () => {
    setConfirmDialog({
      type: 'SYNC_SHEETS',
      title: 'Confirm Google Sheets Master Backup & Auto-Sync',
      description:
        'This action will create or update the Google Spreadsheet "India Post CRM Master Backup - Dadabari SO (mahen.comtech@gmail.com)" in your Google Drive and overwrite/update 6 structured tabs with your current CRM data:',
      details: [
        `Customers Tab: ${stats.customers} verified customer records`,
        `Properties Tab: ${stats.properties} mapped property/plot records`,
        `Daily_Entries Tab: ${stats.dailyEntries} postman beat article delivery logs`,
        `Bills_Claims Tab: ${stats.bills} special forms & reimbursement vouchers`,
        `Tasks Tab: ${stats.tasks} field tasks`,
        `Leads Tab: ${stats.leads} scheme leads (PLI / SSA / IPPB)`,
      ],
    });
  };

  const requestGmailBackupConfirmation = (period: 'Daily' | 'Weekly') => {
    setConfirmDialog({
      type: period === 'Daily' ? 'SEND_GMAIL_DAILY' : 'SEND_GMAIL_WEEKLY',
      title: `Confirm Sending ${period} Activity & Backup Summary via Gmail`,
      description: `This action will send an automated ${period} Operations & Database Backup Summary email from your authenticated Gmail account directly to Master Admin (mahen.comtech@gmail.com):`,
      details: [
        `Recipient: mahen.comtech@gmail.com`,
        `Subject: [India Post CRM] ${period} Operations & Database Backup Summary - Dadabari S.O.`,
        `Included Summary: ${stats.customers} Customers, ${stats.leads} Leads, ${stats.dailyEntries} Daily Article Logs, ${stats.bills} Reimbursement Bills, and ${stats.tasks} Field Tasks.`,
      ],
    });
  };

  const executeConfirmedWorkspaceAction = async () => {
    if (!confirmDialog) return;
    const actionType = confirmDialog.type;
    setConfirmDialog(null);
    setError(null);
    setSyncing(true);

    try {
      setMessage('Verifying Google Workspace OAuth access token...');
      const token = await ensureWorkspaceToken();

      if (actionType === 'SYNC_SHEETS') {
        setMessage('Syncing all 6 CRM & Operations datasets to Google Sheets...');
        const res = await operationsService.syncAllToGoogleSheets(token);
        setMessage(
          `Google Sheets Master Auto-Sync Complete! Synced ${res.totalRowsSynced} records across 6 tabs.`
        );
      } else {
        const period = actionType === 'SEND_GMAIL_DAILY' ? 'Daily' : 'Weekly';
        setMessage(`Sending ${period} CRM Activity & Backup Summary email to mahen.comtech@gmail.com...`);
        await operationsService.sendEmailActivitySummary(token, period);
        setMessage(
          `${period} Activity & Database Backup Summary successfully sent to mahen.comtech@gmail.com via Gmail!`
        );
      }
      updateAllStats();
    } catch (err: any) {
      setError(err.message || 'Workspace operation failed.');
      setMessage('');
    } finally {
      setSyncing(false);
    }
  };

  const importFromGoogleSheets = async () => {
    setError(null);
    setSyncing(true);
    setMessage('Connecting to Google Drive & Sheets...');
    try {
      const token = await ensureWorkspaceToken();
      const files = await listFiles(
        token,
        "mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false"
      );
      if (!files?.files || files.files.length === 0) {
        throw new Error('No Google Spreadsheets found in your Google Drive.');
      }

      const fileId = files.files[0].id;
      setMessage(`Reading rows from "${files.files[0].name}"...`);
      const sheetData = await getSheetData(token, fileId);

      if (!sheetData?.values || sheetData.values.length <= 1) {
        throw new Error('Selected sheet has no data rows to import.');
      }

      const rows = sheetData.values.slice(1);
      let imported = 0;
      for (const row of rows) {
        const name = row[1]?.trim() || row[0]?.trim();
        const mobile = row[2]?.trim() || row[1]?.trim();
        if (!name) continue;
        customerService.addOrUpdateCustomer(
          {
            name,
            mobile: mobile || '',
            houseNo: (row[3] || '').toString().trim(),
            sector: (row[4] || '7').toString().trim(),
            area: (row[5] || 'Keshavpura').toString().trim(),
            beatNo: (row[6] || 'Beat 2').toString().trim(),
            verificationStatus: 'Verified',
            source: 'Google Sheet Sync',
          },
          'Google Sheet Sync'
        );
        imported++;
      }

      setMessage(`Successfully imported & deduplicated ${imported} records from "${files.files[0].name}".`);
    } catch (err: any) {
      setError(err.message || 'Failed reading from Google Sheets.');
      setMessage('');
    } finally {
      setSyncing(false);
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = (text || '').split('\n').filter((l) => l.trim().length > 0);
        if (lines.length <= 1) throw new Error('CSV file contains no data rows.');

        let importedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          const name = cols[0]?.trim();
          if (!name) continue;

          customerService.addOrUpdateCustomer(
            {
              name,
              mobile: cols[1] || '',
              houseNo: (cols[2] || '').trim(),
              sector: (cols[3] || '7').trim(),
              area: (cols[4] || 'Keshavpura').trim(),
              remarks: cols[5] || '',
              verificationStatus: 'Verified',
              source: 'CSV Upload',
            },
            'CSV File Upload'
          );
          importedCount++;
        }
        setMessage(`CSV Import complete! Merged ${importedCount} verified customer records.`);
      } catch (err: any) {
        setError('CSV Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6" id="master-source-sync-root">
      {/* Mandatory User Confirmation Dialog for Workspace Mutations */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-800 flex items-center justify-center shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{confirmDialog.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {confirmDialog.description}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 space-y-1.5">
              {confirmDialog.details.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-700 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmedWorkspaceAction}
                className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirm & Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-amber-400 tracking-wide">
            Centralized Data Backup Engine · Master Admin: mahen.comtech@gmail.com
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Automated Google Sheets & Gmail Backup OS
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Synchronizes Customers, Properties, Daily Field Entries, Reimbursement Bills, Tasks, and Scheme Leads directly to Google Sheets and dispatches automated Gmail activity summaries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => operationsService.exportFullDatabaseWorkbook()}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download size={15} />
            <span>Download 6-Sheet Excel Backup (.XLSX)</span>
          </button>
        </div>
      </div>

      {/* 6-Dataset Inventory Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-semibold block">01. Customers</span>
          <span className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1 block">
            {stats.customers}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-semibold block">02. Properties</span>
          <span className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1 block">
            {stats.properties}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-semibold block">03. Daily Articles</span>
          <span className="text-2xl font-black text-red-800 font-mono tabular-nums mt-1 block">
            {stats.dailyEntries}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-semibold block">04. Special Bills</span>
          <span className="text-2xl font-black text-amber-700 font-mono tabular-nums mt-1 block">
            {stats.bills}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-semibold block">05. Field Tasks</span>
          <span className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1 block">
            {stats.tasks}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-semibold block">06. Scheme Leads</span>
          <span className="text-2xl font-black text-emerald-700 font-mono tabular-nums mt-1 block">
            {stats.leads}
          </span>
        </div>
      </div>

      {/* Status Messages */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
            <span>{message}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage('')}
            className="text-emerald-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-700 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="px-2.5 py-1 bg-red-100 text-red-900 rounded font-bold text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Backup & Sync Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Google Sheets 6-Tab Auto-Sync Engine */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileSpreadsheet size={22} />
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={backupState.autoSyncEnabled}
                  onChange={(e) =>
                    operationsService.updateBackupSettings({
                      autoSyncEnabled: e.target.checked,
                    })
                  }
                  className="rounded text-red-800 focus:ring-red-700"
                />
                <span>Background Auto-Sync Queue Active</span>
              </label>
            </div>

            <h2 className="text-base font-bold text-slate-900">
              Google Sheets Master Database Auto-Sync
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automatically tracks every CRM mutation ({backupState.pendingChangesCount} pending changes in queue) and writes all 6 operational tabs (Customers, Properties, Daily_Entries, Bills_Claims, Tasks, Leads) to Google Sheets under <strong>mahen.comtech@gmail.com</strong>.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Account:</span>
                <strong className="font-mono text-slate-900">mahen.comtech@gmail.com</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Google Sheets Sync:</span>
                <strong className="font-mono text-slate-900 tabular-nums">
                  {backupState.lastSheetsSyncAt || 'Ready for initial sync'}
                </strong>
              </div>
              {backupState.linkedSpreadsheetUrl && (
                <div className="pt-1">
                  <a
                    href={backupState.linkedSpreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <span>Open Live Master Backup Spreadsheet</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              disabled={syncing}
              onClick={requestSheetsBackupConfirmation}
              className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Cloud size={15} />
              <span>{syncing ? 'Syncing...' : 'Sync All 6 Datasets to Sheets'}</span>
            </button>

            <button
              type="button"
              disabled={syncing}
              onClick={importFromGoogleSheets}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Import from Google Sheets</span>
            </button>
          </div>
        </div>

        {/* Card 2: Automated Gmail Daily/Weekly Backup Dispatcher */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-800 flex items-center justify-center">
                <Mail size={22} />
              </div>
              <select
                value={backupState.backupFrequency}
                onChange={(e) =>
                  operationsService.updateBackupSettings({
                    backupFrequency: e.target.value as any,
                  })
                }
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
              >
                <option value="Daily">Schedule: Daily Summary</option>
                <option value="Weekly">Schedule: Weekly Summary</option>
                <option value="Real-time Queue">Schedule: Real-time Queue</option>
              </select>
            </div>

            <h2 className="text-base font-bold text-slate-900">
              Automated Gmail Activity & Backup Summary Dispatch
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sends formatted HTML activity reports covering verified customers, scheme leads, postman daily article deliveries, COD cash collections, and special reimbursement claims directly to <strong>mahen.comtech@gmail.com</strong>.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient Admin Email:</span>
                <strong className="font-mono text-slate-900">mahen.comtech@gmail.com</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Email Backup Sent:</span>
                <strong className="font-mono text-slate-900 tabular-nums">
                  {backupState.lastEmailBackupAt || 'Not sent in current session'}
                </strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              disabled={syncing}
              onClick={() => requestGmailBackupConfirmation('Daily')}
              className="py-2.5 px-4 bg-red-800 hover:bg-red-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={14} />
              <span>Send Daily Backup to Gmail</span>
            </button>

            <button
              type="button"
              disabled={syncing}
              onClick={() => requestGmailBackupConfirmation('Weekly')}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail size={14} />
              <span>Send Weekly Summary Email</span>
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Row: CSV Upload / Export & Sync History Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Direct CSV Import & Master Reset
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Upload a local CSV file (`MASTER_UNIQUE.csv`) or export the customer ledger.
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <label className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <Upload size={14} />
              <span>Upload CSV File</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                const csv = customerService.exportCustomersToCSV();
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `MASTER_CUSTOMERS_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} />
              <span>Export Customers CSV</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Recent Backup & Synchronization Activity Log
            </h3>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {backupState.syncHistory.length} Events
            </span>
          </div>

          {backupState.syncHistory.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
              No manual or scheduled sync dispatches recorded yet in this session. Use the buttons above to sync to Google Sheets or send a Gmail backup report.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {backupState.syncHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{item.summary}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                      {item.type} · {item.timestamp}
                    </div>
                  </div>
                  <span className="font-bold text-emerald-700 shrink-0">{item.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
