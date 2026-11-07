import { c as createLucideIcon, r as reactExports, aD as operationsService, b as customerService, j as jsxRuntimeExports, w as ShieldCheck, C as CircleCheck, T as TriangleAlert, F as FileSpreadsheet, aj as ExternalLink, x as RefreshCw, a_ as Mail, ad as Send, a$ as listFiles, b0 as getSheetData, b1 as getAccessToken, b2 as googleSignIn } from "./index-u5ATSoh6.js";
import { D as Download } from "./download-wQvq84jM.js";
import { U as Upload } from "./upload-e0KOiXXJ.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z", key: "p7xjir" }]
];
const Cloud = createLucideIcon("cloud", __iconNode);
function MasterSourceSync() {
  const [syncing, setSyncing] = reactExports.useState(false);
  const [message, setMessage] = reactExports.useState("");
  const [error, setError] = reactExports.useState(null);
  const [backupState, setBackupState] = reactExports.useState(
    operationsService.getBackupState()
  );
  const [confirmDialog, setConfirmDialog] = reactExports.useState(null);
  const [stats, setStats] = reactExports.useState({
    customers: 0,
    properties: 0,
    dailyEntries: 0,
    bills: 0,
    tasks: 0,
    leads: 0,
    conflicts: 0
  });
  const updateAllStats = () => {
    setStats({
      customers: customerService.getCustomers().length,
      properties: customerService.getProperties().length,
      dailyEntries: operationsService.getDailyEntries().length,
      bills: operationsService.getSpecialBills().length,
      tasks: customerService.getTasks().length,
      leads: customerService.getLeads().length,
      conflicts: customerService.getConflicts().filter((c) => c.status === "Pending Review").length
    });
    setBackupState(operationsService.getBackupState());
  };
  reactExports.useEffect(() => {
    updateAllStats();
    const unsubCust = customerService.subscribe(updateAllStats);
    const unsubOps = operationsService.subscribe(updateAllStats);
    return () => {
      unsubCust();
      unsubOps();
    };
  }, []);
  const ensureWorkspaceToken = async () => {
    const existing = await getAccessToken();
    if (existing) return existing;
    const authResult = await googleSignIn();
    if (!(authResult == null ? void 0 : authResult.accessToken)) {
      throw new Error("Google Workspace authorization was cancelled or failed.");
    }
    return authResult.accessToken;
  };
  const requestSheetsBackupConfirmation = () => {
    setConfirmDialog({
      type: "SYNC_SHEETS",
      title: "Confirm Google Sheets Master Backup & Auto-Sync",
      description: 'This action will create or update the Google Spreadsheet "India Post CRM Master Backup - Dadabari SO (mahen.comtech@gmail.com)" in your Google Drive and overwrite/update 6 structured tabs with your current CRM data:',
      details: [
        `Customers Tab: ${stats.customers} verified customer records`,
        `Properties Tab: ${stats.properties} mapped property/plot records`,
        `Daily_Entries Tab: ${stats.dailyEntries} postman beat article delivery logs`,
        `Bills_Claims Tab: ${stats.bills} special forms & reimbursement vouchers`,
        `Tasks Tab: ${stats.tasks} field tasks`,
        `Leads Tab: ${stats.leads} scheme leads (PLI / SSA / IPPB)`
      ]
    });
  };
  const requestGmailBackupConfirmation = (period) => {
    setConfirmDialog({
      type: period === "Daily" ? "SEND_GMAIL_DAILY" : "SEND_GMAIL_WEEKLY",
      title: `Confirm Sending ${period} Activity & Backup Summary via Gmail`,
      description: `This action will send an automated ${period} Operations & Database Backup Summary email from your authenticated Gmail account directly to Master Admin (mahen.comtech@gmail.com):`,
      details: [
        `Recipient: mahen.comtech@gmail.com`,
        `Subject: [India Post CRM] ${period} Operations & Database Backup Summary - Dadabari S.O.`,
        `Included Summary: ${stats.customers} Customers, ${stats.leads} Leads, ${stats.dailyEntries} Daily Article Logs, ${stats.bills} Reimbursement Bills, and ${stats.tasks} Field Tasks.`
      ]
    });
  };
  const executeConfirmedWorkspaceAction = async () => {
    if (!confirmDialog) return;
    const actionType = confirmDialog.type;
    setConfirmDialog(null);
    setError(null);
    setSyncing(true);
    try {
      setMessage("Verifying Google Workspace OAuth access token...");
      const token = await ensureWorkspaceToken();
      if (actionType === "SYNC_SHEETS") {
        setMessage("Syncing all 6 CRM & Operations datasets to Google Sheets...");
        const res = await operationsService.syncAllToGoogleSheets(token);
        setMessage(
          `Google Sheets Master Auto-Sync Complete! Synced ${res.totalRowsSynced} records across 6 tabs.`
        );
      } else {
        const period = actionType === "SEND_GMAIL_DAILY" ? "Daily" : "Weekly";
        setMessage(`Sending ${period} CRM Activity & Backup Summary email to mahen.comtech@gmail.com...`);
        await operationsService.sendEmailActivitySummary(token, period);
        setMessage(
          `${period} Activity & Database Backup Summary successfully sent to mahen.comtech@gmail.com via Gmail!`
        );
      }
      updateAllStats();
    } catch (err) {
      setError(err.message || "Workspace operation failed.");
      setMessage("");
    } finally {
      setSyncing(false);
    }
  };
  const importFromGoogleSheets = async () => {
    var _a, _b, _c, _d;
    setError(null);
    setSyncing(true);
    setMessage("Connecting to Google Drive & Sheets...");
    try {
      const token = await ensureWorkspaceToken();
      const files = await listFiles(
        token,
        "mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false"
      );
      if (!(files == null ? void 0 : files.files) || files.files.length === 0) {
        throw new Error("No Google Spreadsheets found in your Google Drive.");
      }
      const fileId = files.files[0].id;
      setMessage(`Reading rows from "${files.files[0].name}"...`);
      const sheetData = await getSheetData(token, fileId);
      if (!(sheetData == null ? void 0 : sheetData.values) || sheetData.values.length <= 1) {
        throw new Error("Selected sheet has no data rows to import.");
      }
      const rows = sheetData.values.slice(1);
      let imported = 0;
      for (const row of rows) {
        const name = ((_a = row[1]) == null ? void 0 : _a.trim()) || ((_b = row[0]) == null ? void 0 : _b.trim());
        const mobile = ((_c = row[2]) == null ? void 0 : _c.trim()) || ((_d = row[1]) == null ? void 0 : _d.trim());
        if (!name) continue;
        customerService.addOrUpdateCustomer(
          {
            name,
            mobile: mobile || "",
            houseNo: (row[3] || "").toString().trim(),
            sector: (row[4] || "7").toString().trim(),
            area: (row[5] || "Keshavpura").toString().trim(),
            beatNo: (row[6] || "Beat 2").toString().trim(),
            verificationStatus: "Verified",
            source: "Google Sheet Sync"
          },
          "Google Sheet Sync"
        );
        imported++;
      }
      setMessage(`Successfully imported & deduplicated ${imported} records from "${files.files[0].name}".`);
    } catch (err) {
      setError(err.message || "Failed reading from Google Sheets.");
      setMessage("");
    } finally {
      setSyncing(false);
    }
  };
  const handleCSVUpload = (e) => {
    var _a;
    setError(null);
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      var _a2, _b;
      try {
        const text = (_a2 = event.target) == null ? void 0 : _a2.result;
        const lines = (text || "").split("\n").filter((l) => l.trim().length > 0);
        if (lines.length <= 1) throw new Error("CSV file contains no data rows.");
        let importedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
          const name = (_b = cols[0]) == null ? void 0 : _b.trim();
          if (!name) continue;
          customerService.addOrUpdateCustomer(
            {
              name,
              mobile: cols[1] || "",
              houseNo: (cols[2] || "").trim(),
              sector: (cols[3] || "7").trim(),
              area: (cols[4] || "Keshavpura").trim(),
              remarks: cols[5] || "",
              verificationStatus: "Verified",
              source: "CSV Upload"
            },
            "CSV File Upload"
          );
          importedCount++;
        }
        setMessage(`CSV Import complete! Merged ${importedCount} verified customer records.`);
      } catch (err) {
        setError("CSV Import failed: " + err.message);
      }
    };
    reader.readAsText(file);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", id: "master-source-sync-root", children: [
    confirmDialog && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-red-50 text-red-800 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 22 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-slate-900", children: confirmDialog.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-600 mt-1 leading-relaxed", children: confirmDialog.description })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 space-y-1.5", children: confirmDialog.details.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-red-700 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item })
      ] }, idx)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2.5 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setConfirmDialog(null),
            className: "px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: executeConfirmedWorkspaceAction,
            className: "px-5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer",
            children: "Confirm & Execute"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-amber-400 tracking-wide", children: "Centralized Data Backup Engine · Master Admin: mahen.comtech@gmail.com" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight mt-1", children: "Automated Google Sheets & Gmail Backup OS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-300 mt-1 max-w-2xl", children: "Synchronizes Customers, Properties, Daily Field Entries, Reimbursement Bills, Tasks, and Scheme Leads directly to Google Sheets and dispatches automated Gmail activity summaries." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => operationsService.exportFullDatabaseWorkbook(),
          className: "px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 15 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Download 6-Sheet Excel Backup (.XLSX)" })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-500 font-semibold block", children: "01. Customers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-black text-slate-900 font-mono tabular-nums mt-1 block", children: stats.customers })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-500 font-semibold block", children: "02. Properties" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-black text-slate-900 font-mono tabular-nums mt-1 block", children: stats.properties })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-500 font-semibold block", children: "03. Daily Articles" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-black text-red-800 font-mono tabular-nums mt-1 block", children: stats.dailyEntries })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-500 font-semibold block", children: "04. Special Bills" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-black text-amber-700 font-mono tabular-nums mt-1 block", children: stats.bills })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-500 font-semibold block", children: "05. Field Tasks" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-black text-slate-900 font-mono tabular-nums mt-1 block", children: stats.tasks })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-500 font-semibold block", children: "06. Scheme Leads" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-black text-emerald-700 font-mono tabular-nums mt-1 block", children: stats.leads })
      ] })
    ] }),
    message && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs font-medium flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16, className: "text-emerald-700 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setMessage(""),
          className: "text-emerald-800 font-bold",
          children: "✕"
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, className: "text-red-700 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: error })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setError(null),
          className: "px-2.5 py-1 bg-red-100 text-red-900 rounded font-bold text-[11px]",
          children: "Dismiss"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { size: 22 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: backupState.autoSyncEnabled,
                  onChange: (e) => operationsService.updateBackupSettings({
                    autoSyncEnabled: e.target.checked
                  }),
                  className: "rounded text-red-800 focus:ring-red-700"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Background Auto-Sync Queue Active" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold text-slate-900", children: "Google Sheets Master Database Auto-Sync" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-600 leading-relaxed", children: [
            "Automatically tracks every CRM mutation (",
            backupState.pendingChangesCount,
            " pending changes in queue) and writes all 6 operational tabs (Customers, Properties, Daily_Entries, Bills_Claims, Tasks, Leads) to Google Sheets under ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "mahen.comtech@gmail.com" }),
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500", children: "Target Account:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-mono text-slate-900", children: "mahen.comtech@gmail.com" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500", children: "Last Google Sheets Sync:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-mono text-slate-900 tabular-nums", children: backupState.lastSheetsSyncAt || "Ready for initial sync" })
            ] }),
            backupState.linkedSpreadsheetUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: backupState.linkedSpreadsheetUrl,
                target: "_blank",
                rel: "noreferrer",
                className: "text-emerald-700 hover:underline font-bold inline-flex items-center gap-1",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Open Live Master Backup Spreadsheet" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 12 })
                ]
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              disabled: syncing,
              onClick: requestSheetsBackupConfirmation,
              className: "py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Cloud, { size: 15 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: syncing ? "Syncing..." : "Sync All 6 Datasets to Sheets" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              disabled: syncing,
              onClick: importFromGoogleSheets,
              className: "py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Import from Google Sheets" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-red-50 text-red-800 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 22 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: backupState.backupFrequency,
                onChange: (e) => operationsService.updateBackupSettings({
                  backupFrequency: e.target.value
                }),
                className: "px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Daily", children: "Schedule: Daily Summary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Weekly", children: "Schedule: Weekly Summary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Real-time Queue", children: "Schedule: Real-time Queue" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold text-slate-900", children: "Automated Gmail Activity & Backup Summary Dispatch" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-600 leading-relaxed", children: [
            "Sends formatted HTML activity reports covering verified customers, scheme leads, postman daily article deliveries, COD cash collections, and special reimbursement claims directly to ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "mahen.comtech@gmail.com" }),
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500", children: "Recipient Admin Email:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-mono text-slate-900", children: "mahen.comtech@gmail.com" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500", children: "Last Email Backup Sent:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-mono text-slate-900 tabular-nums", children: backupState.lastEmailBackupAt || "Not sent in current session" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              disabled: syncing,
              onClick: () => requestGmailBackupConfirmation("Daily"),
              className: "py-2.5 px-4 bg-red-800 hover:bg-red-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Send Daily Backup to Gmail" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              disabled: syncing,
              onClick: () => requestGmailBackupConfirmation("Weekly"),
              className: "py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Send Weekly Summary Email" })
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-slate-900", children: "Direct CSV Import & Master Reset" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-600 leading-relaxed", children: "Upload a local CSV file (`MASTER_UNIQUE.csv`) or export the customer ledger." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 14 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Upload CSV File" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                accept: ".csv",
                onChange: handleCSVUpload,
                className: "hidden"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                const csv = customerService.exportCustomersToCSV();
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `MASTER_CUSTOMERS_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              },
              className: "px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Export Customers CSV" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-slate-900", children: "Recent Backup & Synchronization Activity Log" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono text-slate-500 tabular-nums", children: [
            backupState.syncHistory.length,
            " Events"
          ] })
        ] }),
        backupState.syncHistory.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500", children: "No manual or scheduled sync dispatches recorded yet in this session. Use the buttons above to sync to Google Sheets or send a Gmail backup report." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-48 overflow-y-auto", children: backupState.syncHistory.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3 text-xs",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900", children: item.summary }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums", children: [
                  item.type,
                  " · ",
                  item.timestamp
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-emerald-700 shrink-0", children: item.status })
            ]
          },
          item.id
        )) })
      ] })
    ] })
  ] });
}
export {
  MasterSourceSync as default
};
