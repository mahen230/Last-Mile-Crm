import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, w as ShieldCheck, X, av as Database, S as Search, C as CircleCheck, x as RefreshCw, T as TriangleAlert, ag as ArrowRight, aw as readSync, Z as utils, s as staffPermissionService, ax as getDefaultFixedKmForBeat, ay as getDefaultColoniesForBeat, az as DEFAULT_STAFF_SERVICE_MODULES, b as customerService, u as useAuth, aA as Shield, aB as EyeOff, E as Eye, P as Plus, F as FileSpreadsheet, U as Users, I as Sparkles, y as Funnel, B as Building2, at as Lock, f as UserCheck, N as Navigation, aC as Save, n as Phone, h as PenLine } from "./index-u5ATSoh6.js";
import { U as Upload } from "./upload-e0KOiXXJ.js";
import { D as Download } from "./download-wQvq84jM.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
];
const CircleX = createLucideIcon("circle-x", __iconNode$2);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4", key: "1pf5j1" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "m3 15 2 2 4-4", key: "1lhrkk" }]
];
const FileCheck2 = createLucideIcon("file-check-2", __iconNode$1);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M10 8h4", key: "1sr2af" }],
  ["path", { d: "M12 21v-9", key: "17s77i" }],
  ["path", { d: "M12 8V3", key: "13r4qs" }],
  ["path", { d: "M17 16h4", key: "h1uq16" }],
  ["path", { d: "M19 12V3", key: "o1uvq1" }],
  ["path", { d: "M19 21v-5", key: "qua636" }],
  ["path", { d: "M3 14h4", key: "bcjad9" }],
  ["path", { d: "M5 10V3", key: "cb8scm" }],
  ["path", { d: "M5 21v-7", key: "1w1uti" }]
];
const SlidersVertical = createLucideIcon("sliders-vertical", __iconNode);
const SAMPLE_CSV_CONTENT = `Employee ID,Full Name,Mobile,Designation,Circle,Division,Head Office,Sub Office,Branch Office,Pincode,Office Address,Beat,Fixed KM,Assigned Colonies,Email
50457421,Mahendra Kumar Meena,9414023041,Postman,Rajasthan Circle,Kota Division,Kota H.O.,Dadabari S.O.,,324009,"Dadabari Sub-Post Office, Near CAD Circle, Kota - 324009",Beat 2,30,"Keshavpura Sector 7; Keshavpura Sector 6; Patel Nagar",mahen.comtech@gmail.com
10310735,Govind Prasad,9829011223,Postman,Rajasthan Circle,Kota Division,Kota H.O.,Dadabari S.O.,,324009,"Dadabari Sub-Post Office, Near CAD Circle, Kota - 324009",Beat 4,22,"Keshavpura Sector 4; Keshavpura Sector 5; तलवंडी A",govind.prasad@indiapost.gov.in
CSI-10884512,Rakesh Kumar Verma,9414288901,Postman,Rajasthan Circle,Kota Division,Kota H.O.,Dadabari S.O.,,324009,"Dadabari Sub-Post Office, Near CAD Circle, Kota - 324009",Beat 8,24,"Mahaveer Nagar 1st; Mahaveer Nagar 2nd; रंगबाड़ी योजना",rakesh.verma@indiapost.gov.in
PA-20449102,Deepak Kumar नामा,9784512098,PA (Postal Assistant),Rajasthan Circle,Kota Division,Kota H.O.,Dadabari S.O.,,324009,"Dadabari Sub-Post Office, Counter Section, Kota - 324009",Beat 1,16,"Dadabari Main Sector 1; Dadabari Sector 2",deepak.nama@indiapost.gov.in`;
function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\.0+$/, "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}
function normalizeId(raw) {
  return String(raw || "").trim().replace(/\.0+$/, "");
}
function parseCsvLine(line) {
  const res = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      res.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  res.push(cur.trim());
  return res;
}
function parseRawCsvText(csvText) {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCsvLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = vals[idx] !== void 0 ? vals[idx].trim() : "";
    });
    rows.push(obj);
  }
  return rows;
}
function pickField(row, candidates) {
  const keys = Object.keys(row);
  for (const cand of candidates) {
    const candClean = cand.toLowerCase().replace(/[^a-z0-9]/g, "");
    const matchKey = keys.find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, "") === candClean);
    if (matchKey && row[matchKey] !== void 0 && String(row[matchKey]).trim() !== "") {
      return String(row[matchKey]).trim();
    }
  }
  for (const cand of candidates) {
    const candClean = cand.toLowerCase().replace(/[^a-z0-9]/g, "");
    const matchKey = keys.find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, "").includes(candClean));
    if (matchKey && row[matchKey] !== void 0 && String(row[matchKey]).trim() !== "") {
      return String(row[matchKey]).trim();
    }
  }
  return "";
}
const StaffCsvImportModal = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [rawObjects, setRawObjects] = reactExports.useState([]);
  const [fileName, setFileName] = reactExports.useState("");
  const [analyzedRows, setAnalyzedRows] = reactExports.useState([]);
  const [statusFilter, setStatusFilter] = reactExports.useState("ALL");
  const [searchFilter, setSearchFilter] = reactExports.useState("");
  const [pasteMode, setPasteMode] = reactExports.useState(false);
  const [pastedText, setPastedText] = reactExports.useState("");
  const [requireExplicitUpdateConfirm, setRequireExplicitUpdateConfirm] = reactExports.useState(true);
  if (!isOpen) return null;
  const runIntegrityAnalysis = (incomingRecords, sourceLabel) => {
    const existingStaff = staffPermissionService.getDirectoryStaff();
    const existingProfiles = staffPermissionService.getStaffProfiles();
    const seenIdsInCsv = /* @__PURE__ */ new Set();
    const seenPhonesInCsv = /* @__PURE__ */ new Set();
    const seenEmailsInCsv = /* @__PURE__ */ new Set();
    const analyzed = incomingRecords.map((raw, idx) => {
      const empId = normalizeId(
        pickField(raw, ["Employee ID", "Emp ID", "CSI ID", "Staff ID", "employeeId", "id"])
      );
      const name = pickField(raw, ["Full Name", "Staff Name", "Name", "Officer Name", "employeeName"]);
      const contact = normalizePhone(
        pickField(raw, ["Mobile", "Contact", "Mobile Number", "Phone", "Contact Number"])
      );
      const emailRaw = pickField(raw, ["Email", "Official Email", "Login Email", "staffEmail"]);
      const designation = pickField(raw, [
        "Designation",
        "Designation Type",
        "Cadre",
        "Role",
        "Post"
      ]) || "Postman";
      const circle = pickField(raw, ["Circle", "Postal Circle"]) || "Rajasthan Circle";
      const division = pickField(raw, ["Division", "Postal Division"]) || "Kota Division";
      const headOffice = pickField(raw, ["Head Office", "HO", "HO Name"]) || "Kota H.O.";
      const subOffice = pickField(raw, ["Sub Office", "SO", "SO Name", "Post Office"]) || "Dadabari S.O.";
      const branchOffice = pickField(raw, ["Branch Office", "BO", "BO Name"]) || "";
      const officePincode = pickField(raw, ["Pincode", "Office Pincode", "PIN", "Area Pincode"]) || "324009";
      const officeAddress = pickField(raw, ["Office Address", "Complete Office Address", "Address"]) || `${subOffice}, ${division}, ${circle} - ${officePincode}`;
      const rawBeat = pickField(raw, ["Beat", "Beat No", "Beat Number", "Assigned Beat"]) || "Beat 2";
      const beat = /^\d+$/.test(rawBeat.trim()) ? `Beat ${rawBeat.trim()}` : rawBeat.trim();
      const rawFixedKm = Number(
        pickField(raw, ["Fixed KM", "Avg Running", "Beat KM", "Fixed Distance", "fixedKm"])
      );
      const fixedKm = !isNaN(rawFixedKm) && rawFixedKm > 0 ? rawFixedKm : getDefaultFixedKmForBeat(beat);
      const coloniesStr = pickField(raw, [
        "Assigned Colonies",
        "Colonies",
        "Beat Areas",
        "Delivery Colonies",
        "Sectors"
      ]);
      const assignedColonies = coloniesStr ? coloniesStr.split(/[;|,]/).map((c) => c.trim()).filter(Boolean) : getDefaultColoniesForBeat(beat);
      const deliveryOfficeMapping = pickField(raw, ["Delivery Office Mapping", "Delivery Mapping"]) || `${branchOffice ? `${branchOffice} / ` : ""}${subOffice} (${officePincode})`;
      const email = emailRaw || `${name.toLowerCase().replace(/[^a-z0-9]/g, ".").replace(/\.+/g, ".").replace(/^\.|\.$/g, "") || "staff"}@indiapost.gov.in`;
      if (!name || !empId && !contact) {
        return {
          rowIndex: idx + 1,
          employeeId: empId || `MISSING-ID-${idx + 1}`,
          name: name || "(Missing Staff Name)",
          contact: contact || "",
          email,
          designationType: designation,
          circle,
          division,
          headOffice,
          subOffice,
          branchOffice,
          officePincode,
          officeAddress,
          beat,
          fixedKm,
          assignedColonies,
          deliveryOfficeMapping,
          status: "INVALID_ROW",
          statusReason: "Missing mandatory Staff Name or both Employee ID and Mobile Number.",
          diffs: [],
          selectedAction: "SKIP"
        };
      }
      const normEmpIdLower = empId.toLowerCase();
      const normEmailLower = email.toLowerCase();
      if (normEmpIdLower && seenIdsInCsv.has(normEmpIdLower) || contact && seenPhonesInCsv.has(contact) || emailRaw && seenEmailsInCsv.has(normEmailLower)) {
        return {
          rowIndex: idx + 1,
          employeeId: empId || `AUTO-${idx + 1}`,
          name,
          contact,
          email,
          designationType: designation,
          circle,
          division,
          headOffice,
          subOffice,
          branchOffice,
          officePincode,
          officeAddress,
          beat,
          fixedKm,
          assignedColonies,
          deliveryOfficeMapping,
          status: "CONFLICT_WARNING",
          statusReason: "Duplicate row detected within the uploaded CSV file (same Employee ID / Mobile / Email).",
          diffs: [],
          selectedAction: "SKIP"
        };
      }
      if (normEmpIdLower) seenIdsInCsv.add(normEmpIdLower);
      if (contact) seenPhonesInCsv.add(contact);
      if (emailRaw) seenEmailsInCsv.add(normEmailLower);
      const byId = existingStaff.find(
        (s) => s.employeeId && normalizeId(s.employeeId).toLowerCase() === normEmpIdLower || normalizeId(s.id).replace(/^STAFF-/i, "").toLowerCase() === normEmpIdLower
      );
      const byPhone = contact ? existingStaff.find((s) => normalizePhone(s.contact) === contact) : void 0;
      const byEmail = emailRaw ? existingStaff.find((s) => (s.email || "").toLowerCase() === normEmailLower) : void 0;
      const byNameExact = existingStaff.find(
        (s) => s.name.trim().toLowerCase() === name.trim().toLowerCase()
      );
      if (byId && byPhone && byId.id !== byPhone.id) {
        return {
          rowIndex: idx + 1,
          employeeId: empId,
          name,
          contact,
          email,
          designationType: designation,
          circle,
          division,
          headOffice,
          subOffice,
          branchOffice,
          officePincode,
          officeAddress,
          beat,
          fixedKm,
          assignedColonies,
          deliveryOfficeMapping,
          status: "CONFLICT_WARNING",
          statusReason: `Identity Conflict: Employee ID (${empId}) belongs to "${byId.name}", while Mobile (${contact}) belongs to "${byPhone.name}".`,
          matchedExistingStaff: byId,
          diffs: [],
          selectedAction: "SKIP"
        };
      }
      if (!byId && !byPhone && byNameExact && empId && byNameExact.employeeId && normalizeId(byNameExact.employeeId).toLowerCase() !== normEmpIdLower) {
        return {
          rowIndex: idx + 1,
          employeeId: empId,
          name,
          contact,
          email,
          designationType: designation,
          circle,
          division,
          headOffice,
          subOffice,
          branchOffice,
          officePincode,
          officeAddress,
          beat,
          fixedKm,
          assignedColonies,
          deliveryOfficeMapping,
          status: "CONFLICT_WARNING",
          statusReason: `Same Name "${name}" exists in DB with different Employee ID (${byNameExact.employeeId}). Review before importing.`,
          matchedExistingStaff: byNameExact,
          diffs: [],
          selectedAction: "SKIP"
        };
      }
      const matched = byId || byPhone || byEmail || byNameExact;
      if (matched) {
        const matchedProf = existingProfiles.find(
          (p) => p.id === matched.id || p.employeeId && matched.employeeId && p.employeeId === matched.employeeId || p.email && matched.email && p.email.toLowerCase() === matched.email.toLowerCase()
        );
        const diffs = [];
        if (name.toLowerCase() !== matched.name.toLowerCase()) {
          diffs.push({ fieldLabel: "Name", existingValue: matched.name, incomingValue: name });
        }
        if (contact && normalizePhone(matched.contact) !== contact) {
          diffs.push({ fieldLabel: "Mobile", existingValue: matched.contact || "N/A", incomingValue: contact });
        }
        if ((matched.designationType || matched.role || "").toLowerCase() !== designation.toLowerCase()) {
          diffs.push({
            fieldLabel: "Designation",
            existingValue: matched.designationType || matched.role || "Postman",
            incomingValue: designation
          });
        }
        if (beat.toLowerCase() !== (matched.beat || "").toLowerCase()) {
          diffs.push({ fieldLabel: "Beat", existingValue: matched.beat || "N/A", incomingValue: beat });
        }
        if (subOffice.toLowerCase() !== (matched.subOffice || "Dadabari S.O.").toLowerCase()) {
          diffs.push({
            fieldLabel: "Sub Office",
            existingValue: matched.subOffice || "Dadabari S.O.",
            incomingValue: subOffice
          });
        }
        if ((branchOffice || "") !== (matched.branchOffice || "")) {
          diffs.push({
            fieldLabel: "Branch Office",
            existingValue: matched.branchOffice || "None",
            incomingValue: branchOffice || "None"
          });
        }
        if (officePincode !== (matched.officePincode || "324009")) {
          diffs.push({
            fieldLabel: "Pincode",
            existingValue: matched.officePincode || "324009",
            incomingValue: officePincode
          });
        }
        const existingKm = (matchedProf == null ? void 0 : matchedProf.fixedKm) || getDefaultFixedKmForBeat(matched.beat);
        if (fixedKm !== existingKm) {
          diffs.push({
            fieldLabel: "Fixed KM",
            existingValue: `${existingKm} KM`,
            incomingValue: `${fixedKm} KM`
          });
        }
        if (diffs.length === 0) {
          return {
            rowIndex: idx + 1,
            employeeId: empId || matched.employeeId || matched.id,
            name,
            contact: contact || matched.contact,
            email,
            designationType: designation,
            circle,
            division,
            headOffice,
            subOffice,
            branchOffice,
            officePincode,
            officeAddress,
            beat,
            fixedKm,
            assignedColonies,
            deliveryOfficeMapping,
            status: "EXACT_DUPLICATE",
            statusReason: `100% Match with existing DB record (${matched.name}, ID: ${matched.employeeId || matched.id}). Auto-skipped to prevent duplicates.`,
            matchedExistingStaff: matched,
            diffs: [],
            selectedAction: "SKIP"
          };
        } else {
          return {
            rowIndex: idx + 1,
            employeeId: empId || matched.employeeId || matched.id,
            name,
            contact: contact || matched.contact,
            email,
            designationType: designation,
            circle,
            division,
            headOffice,
            subOffice,
            branchOffice,
            officePincode,
            officeAddress,
            beat,
            fixedKm,
            assignedColonies,
            deliveryOfficeMapping,
            status: "UPDATE_CANDIDATE",
            statusReason: `Matched existing record (${matched.name}, ID: ${matched.employeeId || matched.id}) with ${diffs.length} updated field(s).`,
            matchedExistingStaff: matched,
            diffs,
            selectedAction: requireExplicitUpdateConfirm ? "SKIP" : "UPDATE_EXISTING"
          };
        }
      }
      return {
        rowIndex: idx + 1,
        employeeId: empId || `CSI-${Math.floor(1e7 + Math.random() * 9e7)}`,
        name,
        contact,
        email,
        designationType: designation,
        circle,
        division,
        headOffice,
        subOffice,
        branchOffice,
        officePincode,
        officeAddress,
        beat,
        fixedKm,
        assignedColonies,
        deliveryOfficeMapping,
        status: "NEW_CLEAN",
        statusReason: "Verified unique Employee ID, Mobile & Email. Safe to import as new staff record.",
        diffs: [],
        selectedAction: "IMPORT_NEW"
      };
    });
    setRawObjects(incomingRecords);
    setFileName(sourceLabel);
    setAnalyzedRows(analyzed);
  };
  const handleFileUpload = (e) => {
    var _a, _b;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    const ext = (_b = file.name.split(".").pop()) == null ? void 0 : _b.toLowerCase();
    if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        var _a2;
        const bstr = (_a2 = evt.target) == null ? void 0 : _a2.result;
        const wb = readSync(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const json = utils.sheet_to_json(ws, { defval: "" });
        runIntegrityAnalysis(json, file.name);
      };
      reader.readAsBinaryString(file);
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        var _a2;
        const text = String(((_a2 = evt.target) == null ? void 0 : _a2.result) || "");
        const parsed = parseRawCsvText(text);
        runIntegrityAnalysis(parsed, file.name);
      };
      reader.readAsText(file);
    }
  };
  const handleLoadSampleBatch = () => {
    const parsed = parseRawCsvText(SAMPLE_CSV_CONTENT);
    runIntegrityAnalysis(parsed, "KOTA_DIVISION_STAFF_VERIFICATION_BATCH.csv");
  };
  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "INDIA_POST_STAFF_IMPORT_TEMPLATE.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  const updateRowAction = (rowIndex, action) => {
    setAnalyzedRows(
      (prev) => prev.map((r) => r.rowIndex === rowIndex ? { ...r, selectedAction: action } : r)
    );
  };
  const applyBulkPolicy = (policy) => {
    setAnalyzedRows(
      (prev) => prev.map((r) => {
        if (r.status === "INVALID_ROW" || r.status === "EXACT_DUPLICATE") {
          return { ...r, selectedAction: "SKIP" };
        }
        if (policy === "SKIP_ALL") {
          return { ...r, selectedAction: "SKIP" };
        }
        if (policy === "ONLY_NEW") {
          return {
            ...r,
            selectedAction: r.status === "NEW_CLEAN" ? "IMPORT_NEW" : "SKIP"
          };
        }
        if (r.status === "NEW_CLEAN") return { ...r, selectedAction: "IMPORT_NEW" };
        if (r.status === "UPDATE_CANDIDATE") return { ...r, selectedAction: "UPDATE_EXISTING" };
        return { ...r, selectedAction: "SKIP" };
      })
    );
  };
  const stats = reactExports.useMemo(() => {
    const total = analyzedRows.length;
    const newClean = analyzedRows.filter((r) => r.status === "NEW_CLEAN").length;
    const updateCandidates = analyzedRows.filter((r) => r.status === "UPDATE_CANDIDATE").length;
    const exactDuplicates = analyzedRows.filter((r) => r.status === "EXACT_DUPLICATE").length;
    const conflicts = analyzedRows.filter((r) => r.status === "CONFLICT_WARNING").length;
    const invalid = analyzedRows.filter((r) => r.status === "INVALID_ROW").length;
    const queuedNew = analyzedRows.filter((r) => r.selectedAction === "IMPORT_NEW").length;
    const queuedUpdate = analyzedRows.filter((r) => r.selectedAction === "UPDATE_EXISTING").length;
    const queuedSkip = analyzedRows.filter((r) => r.selectedAction === "SKIP").length;
    return {
      total,
      newClean,
      updateCandidates,
      exactDuplicates,
      conflicts,
      invalid,
      queuedNew,
      queuedUpdate,
      queuedSkip
    };
  }, [analyzedRows]);
  const filteredRows = reactExports.useMemo(() => {
    return analyzedRows.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.trim().toLowerCase();
        const match = r.name.toLowerCase().includes(q) || r.employeeId.toLowerCase().includes(q) || r.contact.includes(q) || r.beat.toLowerCase().includes(q) || r.subOffice.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [analyzedRows, statusFilter, searchFilter]);
  const handleCommitVerifiedRows = () => {
    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    for (const row of analyzedRows) {
      if (row.selectedAction === "SKIP") {
        skippedCount++;
        continue;
      }
      const targetId = row.selectedAction === "UPDATE_EXISTING" && row.matchedExistingStaff ? row.matchedExistingStaff.id : void 0;
      const { staffRecord } = staffPermissionService.upsertStaffWithAutoOfficeAndBeat({
        id: targetId,
        employeeId: row.employeeId,
        name: row.name,
        contact: row.contact,
        email: row.email,
        designationType: row.designationType,
        circle: row.circle,
        division: row.division,
        headOffice: row.headOffice,
        subOffice: row.subOffice,
        branchOffice: row.branchOffice,
        officePincode: row.officePincode,
        officeAddress: row.officeAddress,
        beat: row.beat,
        deliveryOfficeMapping: row.deliveryOfficeMapping,
        assignedColonies: row.assignedColonies,
        fixedKm: row.fixedKm,
        approvalStatus: "Approved",
        serviceModules: { ...DEFAULT_STAFF_SERVICE_MODULES }
      });
      const existsInCustomerStore = customerService.getStaff().some((s) => s.id === staffRecord.id);
      if (existsInCustomerStore) {
        customerService.updateStaff(staffRecord);
      } else {
        customerService.addStaff(staffRecord);
      }
      if (row.selectedAction === "IMPORT_NEW") {
        importedCount++;
      } else if (row.selectedAction === "UPDATE_EXISTING") {
        updatedCount++;
      }
    }
    onImportComplete(
      `CSV Integrity Sync Complete: ${importedCount} New Staff Added, ${updatedCount} Confirmed Updates Applied, ${skippedCount} Duplicates/Conflicts Safely Skipped.`
    );
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-6xl w-full border border-slate-300 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-900 text-white px-6 py-4 flex items-center justify-between gap-4 border-b border-slate-800 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-red-800 flex items-center justify-center text-amber-300 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold text-amber-400 tracking-wide", children: "Zero-Duplicate Staff Directory & Office Reconciliation Engine" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold tracking-tight", children: "Secure Staff CSV / Excel Import & Pre-Save Integrity Analyzer" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onClose,
          className: "p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 overflow-y-auto space-y-6 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "lg:col-span-2 border-2 border-dashed border-slate-300 hover:border-red-700 bg-slate-50 hover:bg-red-50/20 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-11 h-11 rounded-xl bg-red-800 text-white flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-slate-900", children: fileName ? `Loaded File: ${fileName} (${analyzedRows.length} rows analyzed)` : "Upload Staff Directory CSV or Excel (.csv, .xlsx)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-600 mt-0.5", children: "Every incoming row is compared against existing Employee IDs, Mobile Numbers, Emails & Beat Mappings before saving." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold shrink-0", children: "Browse CSV / XLSX" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              accept: ".csv,.xlsx,.xls,.txt",
              onChange: handleFileUpload,
              className: "hidden"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-slate-800", children: "Quick Testing & Departmental Templates" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: handleLoadSampleBatch,
                className: "flex-1 px-3 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Database, { className: "w-3.5 h-3.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Analyze Sample Batch" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: handleDownloadTemplate,
                className: "px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "CSV Template" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setPasteMode(!pasteMode),
                className: "px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold cursor-pointer",
                children: pasteMode ? "Hide Paste Box" : "Paste CSV"
              }
            )
          ] })
        ] })
      ] }),
      pasteMode && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-bold text-slate-800", children: "Paste Raw CSV Content (First line must be column headers)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setPastedText(SAMPLE_CSV_CONTENT),
              className: "text-xs font-semibold text-red-800 hover:underline cursor-pointer",
              children: "Insert Sample CSV Text"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            rows: 4,
            value: pastedText,
            onChange: (e) => setPastedText(e.target.value),
            placeholder: "Employee ID,Full Name,Mobile,Designation,Circle,Division,Head Office,Sub Office,Pincode,Beat,Fixed KM...",
            className: "w-full p-3 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              const parsed = parseRawCsvText(pastedText);
              runIntegrityAnalysis(parsed, "Pasted_CSV_Data.csv");
              setPasteMode(false);
            },
            className: "px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer",
            children: "Run Pre-Save Integrity Analysis"
          }
        ) })
      ] }),
      analyzedRows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setStatusFilter("ALL"),
              className: `p-3.5 rounded-xl border text-left transition cursor-pointer ${statusFilter === "ALL" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-900 border-slate-200 hover:border-slate-400"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] opacity-75", children: "Total Analyzed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black font-mono tabular-nums mt-0.5", children: stats.total }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] opacity-75 mt-0.5", children: "All CSV Rows" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setStatusFilter("NEW_CLEAN"),
              className: `p-3.5 rounded-xl border text-left transition cursor-pointer ${statusFilter === "NEW_CLEAN" ? "bg-emerald-800 text-white border-emerald-900" : "bg-emerald-50/70 text-emerald-950 border-emerald-200 hover:border-emerald-400"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold", children: "New Verified" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black font-mono tabular-nums mt-0.5", children: stats.newClean }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] opacity-80 mt-0.5", children: "Zero DB Collision" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setStatusFilter("UPDATE_CANDIDATE"),
              className: `p-3.5 rounded-xl border text-left transition cursor-pointer ${statusFilter === "UPDATE_CANDIDATE" ? "bg-blue-800 text-white border-blue-900" : "bg-blue-50/70 text-blue-950 border-blue-200 hover:border-blue-400"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold", children: "Field Updates" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black font-mono tabular-nums mt-0.5", children: stats.updateCandidates }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] opacity-80 mt-0.5", children: "Existing Staff Diffs" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setStatusFilter("EXACT_DUPLICATE"),
              className: `p-3.5 rounded-xl border text-left transition cursor-pointer ${statusFilter === "EXACT_DUPLICATE" ? "bg-slate-700 text-white border-slate-800" : "bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold", children: "Exact Duplicates" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black font-mono tabular-nums mt-0.5", children: stats.exactDuplicates }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] opacity-80 mt-0.5", children: "Auto-Blocked" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setStatusFilter("CONFLICT_WARNING"),
              className: `p-3.5 rounded-xl border text-left transition cursor-pointer ${statusFilter === "CONFLICT_WARNING" ? "bg-amber-700 text-white border-amber-800" : "bg-amber-50 text-amber-950 border-amber-300 hover:border-amber-500"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold", children: "ID / Phone Conflicts" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black font-mono tabular-nums mt-0.5", children: stats.conflicts }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] opacity-80 mt-0.5", children: "Needs Review" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setStatusFilter("INVALID_ROW"),
              className: `p-3.5 rounded-xl border text-left transition cursor-pointer ${statusFilter === "INVALID_ROW" ? "bg-red-800 text-white border-red-900" : "bg-red-50 text-red-950 border-red-200 hover:border-red-400"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold", children: "Invalid Rows" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black font-mono tabular-nums mt-0.5", children: stats.invalid }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] opacity-80 mt-0.5", children: "Missing Mandatory" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-slate-700 mr-1", children: "Resolution Policy:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => applyBulkPolicy("ONLY_NEW"),
                className: "px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold cursor-pointer",
                children: "Import Only New Records (Zero Overwrite)"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => applyBulkPolicy("NEW_AND_UPDATES"),
                className: "px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-bold cursor-pointer",
                children: "Approve New + Verified Field Updates"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => applyBulkPolicy("SKIP_ALL"),
                className: "px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold cursor-pointer",
                children: "Skip All Rows"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-w-[260px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: searchFilter,
                onChange: (e) => setSearchFilter(e.target.value),
                placeholder: "Filter analyzed rows by Name, ID, Beat...",
                className: "w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-slate-200 rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto max-h-[380px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left border-collapse text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-slate-900 text-white sticky top-0 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-3 font-semibold", children: "#" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-3 font-semibold", children: "Incoming Staff & ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-3 font-semibold", children: "Office & Beat Mapping" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-3 font-semibold", children: "Database Comparison & Field Diffs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-3 font-semibold text-right", children: "Action to Execute" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-200 bg-white", children: filteredRows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "tr",
            {
              className: row.selectedAction === "SKIP" ? "bg-slate-50/70 text-slate-500" : "hover:bg-slate-50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 font-mono tabular-nums font-bold", children: row.rowIndex }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 px-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900", children: row.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-500 font-mono tabular-nums mt-0.5", children: [
                    "ID: ",
                    row.employeeId,
                    " · Ph: ",
                    row.contact || "N/A"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-600 mt-0.5", children: row.designationType })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 px-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-slate-900", children: [
                    row.beat,
                    " (",
                    row.fixedKm,
                    " KM) · ",
                    row.subOffice,
                    row.branchOffice ? ` → ${row.branchOffice}` : ""
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-500 mt-0.5", children: [
                    "PIN: ",
                    row.officePincode,
                    " · ",
                    row.division
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-500 truncate max-w-xs mt-0.5", children: [
                    "Colonies: ",
                    row.assignedColonies.join(", ")
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 px-3 max-w-md", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 font-bold", children: [
                    row.status === "NEW_CLEAN" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-800 flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3.5 h-3.5 shrink-0" }),
                      "New Unique Staff Record"
                    ] }),
                    row.status === "UPDATE_CANDIDATE" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-800 flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3.5 h-3.5 shrink-0" }),
                      "Matches Existing Record (Diffs Detected)"
                    ] }),
                    row.status === "EXACT_DUPLICATE" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-600 flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheck2, { className: "w-3.5 h-3.5 shrink-0" }),
                      "Exact Duplicate (Already in DB)"
                    ] }),
                    row.status === "CONFLICT_WARNING" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-800 flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 shrink-0" }),
                      "Identity / Duplicate Conflict"
                    ] }),
                    row.status === "INVALID_ROW" && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-800 flex items-center gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3.5 h-3.5 shrink-0" }),
                      "Validation Failed"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-600 mt-0.5", children: row.statusReason }),
                  row.diffs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 space-y-1 bg-blue-50/60 border border-blue-200 rounded-lg p-2", children: row.diffs.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "text-[11px] flex items-center gap-1.5 font-mono",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-slate-700", children: [
                          d.fieldLabel,
                          ":"
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-through text-slate-500", children: d.existingValue }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3 h-3 text-blue-700 shrink-0" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-blue-900", children: d.incomingValue })
                      ]
                    },
                    i
                  )) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-right whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    disabled: row.status === "INVALID_ROW" || row.status === "EXACT_DUPLICATE",
                    value: row.selectedAction,
                    onChange: (e) => updateRowAction(
                      row.rowIndex,
                      e.target.value
                    ),
                    className: `px-3 py-1.5 rounded-lg text-xs font-bold border ${row.selectedAction === "IMPORT_NEW" ? "bg-emerald-800 text-white border-emerald-900" : row.selectedAction === "UPDATE_EXISTING" ? "bg-blue-800 text-white border-blue-900" : "bg-slate-100 text-slate-700 border-slate-300"}`,
                    children: [
                      row.status === "NEW_CLEAN" && /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "IMPORT_NEW", children: "✓ Import as New Staff" }),
                      (row.status === "UPDATE_CANDIDATE" || row.status === "CONFLICT_WARNING") && row.matchedExistingStaff && /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "UPDATE_EXISTING", children: "↻ Confirm Update Existing" }),
                      row.status === "CONFLICT_WARNING" && !row.matchedExistingStaff && /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "IMPORT_NEW", children: "Force Import as New" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "SKIP", children: "✕ Skip / Do Not Save" })
                    ]
                  }
                ) })
              ]
            },
            row.rowIndex
          )) })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-700", children: analyzedRows.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Ready to Commit:",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-emerald-800 font-mono tabular-nums", children: [
          stats.queuedNew,
          " New Staff"
        ] }),
        " ",
        "·",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-blue-800 font-mono tabular-nums", children: [
          stats.queuedUpdate,
          " Confirmed Updates"
        ] }),
        " ",
        "·",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-slate-600 font-mono tabular-nums", children: [
          stats.queuedSkip,
          " Skipped (Zero Duplicates)"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Upload a CSV/XLSX file or click “Analyze Sample Batch” to inspect incoming records before saving." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            disabled: stats.queuedNew + stats.queuedUpdate === 0,
            onClick: handleCommitVerifiedRows,
            className: `px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${stats.queuedNew + stats.queuedUpdate > 0 ? "bg-red-800 hover:bg-red-900 text-white shadow-sm cursor-pointer" : "bg-slate-300 text-slate-500 cursor-not-allowed"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Commit ",
                stats.queuedNew + stats.queuedUpdate,
                " Verified Record(s) to Database"
              ] })
            ]
          }
        )
      ] })
    ] })
  ] }) });
};
const DESIGNATION_OPTIONS = [
  "Postman",
  "GDS (BPM / ABPM / Dak Sevak)",
  "PA (Postal Assistant)",
  "MTS (Multi Tasking Staff)",
  "Inspector (IP / ASP)",
  "SPM / Postmaster",
  "Sorting Assistant (SA)",
  "Mail Guard"
];
const SERVICE_MODULE_LABELS = [
  {
    key: "crmSection",
    title: "1. CRM Section (Customer & Property Management)",
    shortLabel: "CRM & Property",
    desc: "Access to Master Database, Household Tree, Follow-ups, and Colony Records",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    key: "specialBillsSection",
    title: "2. Special Bills Section (Fuel Bill, Charge Report, Outsider, BYOD)",
    shortLabel: "Special Bills",
    desc: "Generate & print Fuel Reimbursement, Charge Report (ACG-61), Outsider & BYOD Bills",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200"
  },
  {
    key: "learningSection",
    title: "3. Departmental Learning Section (GDS to MTS / Postman / PA LMS)",
    shortLabel: "Postal Exam LMS",
    desc: "Syllabus, Study Notes, 25-Q Practice Tests & Full Mock Exams",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200"
  },
  {
    key: "schemeLeadsSection",
    title: "4. Product & Scheme Lead Section (PLI, SSA, IPPB, Savings)",
    shortLabel: "Scheme Leads",
    desc: "Lead Pipeline, PLI/RPLI Calculators, 1-Click Field Lead Capture",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    key: "contentSharingSection",
    title: "5. Content Sharing & Customer Request Dispatch Capabilities",
    shortLabel: "Content & Dispatch",
    desc: "WhatsApp/SMS Scheme Brochures, Customer Call/Visit Requests & Broadcasts",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200"
  }
];
const StaffMasterView = ({ currentUser: propUser }) => {
  const { userProfile: authUser } = useAuth();
  const currentUser = propUser !== void 0 ? propUser : authUser || staffPermissionService.getActiveSession();
  const [profiles, setProfiles] = reactExports.useState([]);
  const [directoryStaff, setDirectoryStaff] = reactExports.useState([]);
  const [activeTab, setActiveTab] = reactExports.useState("directory");
  const [isCsvImportOpen, setIsCsvImportOpen] = reactExports.useState(false);
  const [simulateRestrictedView, setSimulateRestrictedView] = reactExports.useState(false);
  const [selectedCircle, setSelectedCircle] = reactExports.useState("");
  const [selectedDivision, setSelectedDivision] = reactExports.useState("");
  const [selectedOffice, setSelectedOffice] = reactExports.useState("");
  const [pincodeFilter, setPincodeFilter] = reactExports.useState("");
  const [refinementQuery, setRefinementQuery] = reactExports.useState("");
  const [designationFilter, setDesignationFilter] = reactExports.useState("ALL");
  const [beatFilter, setBeatFilter] = reactExports.useState("ALL");
  const [editingStaffId, setEditingStaffId] = reactExports.useState(null);
  const [formName, setFormName] = reactExports.useState("");
  const [formContact, setFormContact] = reactExports.useState("");
  const [formEmployeeId, setFormEmployeeId] = reactExports.useState("");
  const [formEmail, setFormEmail] = reactExports.useState("");
  const [formPassword, setFormPassword] = reactExports.useState("Post@123");
  const [formDesignation, setFormDesignation] = reactExports.useState("Postman");
  const [formCircle, setFormCircle] = reactExports.useState("Rajasthan Circle");
  const [formDivision, setFormDivision] = reactExports.useState("Kota Division");
  const [formHeadOffice, setFormHeadOffice] = reactExports.useState("Kota H.O.");
  const [formSubOffice, setFormSubOffice] = reactExports.useState("Dadabari S.O.");
  const [formBranchOffice, setFormBranchOffice] = reactExports.useState("");
  const [formOfficePincode, setFormOfficePincode] = reactExports.useState("324009");
  const [formOfficeAddress, setFormOfficeAddress] = reactExports.useState(
    "Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - 324009"
  );
  const [formBeat, setFormBeat] = reactExports.useState("Beat 2");
  const [formDeliveryMapping, setFormDeliveryMapping] = reactExports.useState("Dadabari S.O. (324009) / Kota H.O.");
  const [formColoniesText, setFormColoniesText] = reactExports.useState(
    "Keshavpura Sector 7, Keshavpura Sector 6, Patel Nagar, Santoshi Nagar"
  );
  const [formFixedKm, setFormFixedKm] = reactExports.useState(18);
  const [formDailyLimit, setFormDailyLimit] = reactExports.useState(50);
  const [formApprovalStatus, setFormApprovalStatus] = reactExports.useState("Approved");
  const [formServiceModules, setFormServiceModules] = reactExports.useState({
    ...DEFAULT_STAFF_SERVICE_MODULES
  });
  const [toastMsg, setToastMsg] = reactExports.useState(null);
  const isActualSuperAdmin = staffPermissionService.isSuperAdmin(currentUser);
  const isEffectiveSuperAdmin = isActualSuperAdmin && !simulateRestrictedView;
  const refreshData = () => {
    setProfiles(staffPermissionService.getStaffProfiles());
    setDirectoryStaff(staffPermissionService.getDirectoryStaff());
  };
  reactExports.useEffect(() => {
    refreshData();
    const unsub = staffPermissionService.subscribe(refreshData);
    return () => unsub();
  }, []);
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4e3);
  };
  const autoOffices = reactExports.useMemo(() => staffPermissionService.getAutoManagedOffices(), [directoryStaff, profiles]);
  const availableCircles = reactExports.useMemo(() => {
    const set = /* @__PURE__ */ new Set(["Rajasthan Circle"]);
    directoryStaff.forEach((s) => {
      if (s.circle) set.add(s.circle);
    });
    return Array.from(set);
  }, [directoryStaff]);
  const availableDivisions = reactExports.useMemo(() => {
    const set = /* @__PURE__ */ new Set(["Kota Division"]);
    directoryStaff.forEach((s) => {
      if (s.division) set.add(s.division);
    });
    return Array.from(set);
  }, [directoryStaff]);
  const availableOffices = reactExports.useMemo(() => {
    const set = /* @__PURE__ */ new Set(["Kota H.O.", "Dadabari S.O."]);
    directoryStaff.forEach((s) => {
      if (s.headOffice) set.add(s.headOffice);
      if (s.subOffice) set.add(s.subOffice);
      if (s.branchOffice) set.add(s.branchOffice);
      if (s.postedOfficeName) set.add(s.postedOfficeName);
    });
    return Array.from(set);
  }, [directoryStaff]);
  const availableBeats = reactExports.useMemo(() => {
    const set = /* @__PURE__ */ new Set();
    directoryStaff.forEach((s) => {
      if (s.beat) set.add(s.beat);
    });
    return Array.from(set);
  }, [directoryStaff]);
  const isLevel1FilterActive = Boolean(
    selectedCircle && selectedDivision && (selectedOffice || pincodeFilter.trim().length >= 3) || pincodeFilter.trim().length >= 6
  );
  const isLevel2FilterActive = Boolean(
    refinementQuery.trim().length >= 2 || designationFilter !== "ALL" || beatFilter !== "ALL"
  );
  const canRenderDataList = isEffectiveSuperAdmin || isLevel1FilterActive && isLevel2FilterActive || isLevel2FilterActive || isLevel1FilterActive;
  const filteredDirectory = reactExports.useMemo(() => {
    if (!canRenderDataList) return [];
    return directoryStaff.filter((s) => {
      if (selectedCircle && (s.circle || "Rajasthan Circle") !== selectedCircle) return false;
      if (selectedDivision && (s.division || "Kota Division") !== selectedDivision) return false;
      if (selectedOffice) {
        const offLower = selectedOffice.toLowerCase();
        const matchesOff = (s.headOffice || "").toLowerCase().includes(offLower) || (s.subOffice || "").toLowerCase().includes(offLower) || (s.branchOffice || "").toLowerCase().includes(offLower) || (s.postedOfficeName || "").toLowerCase().includes(offLower);
        if (!matchesOff) return false;
      }
      if (pincodeFilter.trim()) {
        if (!(s.officePincode || "324009").includes(pincodeFilter.trim())) return false;
      }
      if (designationFilter !== "ALL") {
        const desig = (s.designationType || s.role || "").toLowerCase();
        if (!desig.includes(designationFilter.toLowerCase())) return false;
      }
      if (beatFilter !== "ALL") {
        if ((s.beat || "").toLowerCase() !== beatFilter.toLowerCase()) return false;
      }
      if (refinementQuery.trim()) {
        const q = refinementQuery.trim().toLowerCase();
        const matchesRef = s.name.toLowerCase().includes(q) || (s.employeeId || s.id || "").toLowerCase().includes(q) || (s.contact || "").includes(q) || (s.designationType || s.role || "").toLowerCase().includes(q) || (s.beat || "").toLowerCase().includes(q) || (s.assignedColonies || []).some((c) => c.toLowerCase().includes(q));
        if (!matchesRef) return false;
      }
      return true;
    });
  }, [
    canRenderDataList,
    directoryStaff,
    selectedCircle,
    selectedDivision,
    selectedOffice,
    pincodeFilter,
    designationFilter,
    beatFilter,
    refinementQuery
  ]);
  const filteredProfiles = reactExports.useMemo(() => {
    if (!canRenderDataList) return [];
    return profiles.filter((p) => {
      if (selectedCircle && (p.circle || "Rajasthan Circle") !== selectedCircle) return false;
      if (selectedDivision && (p.division || "Kota Division") !== selectedDivision) return false;
      if (selectedOffice) {
        const offLower = selectedOffice.toLowerCase();
        const matchesOff = (p.headOffice || "").toLowerCase().includes(offLower) || (p.subOffice || "").toLowerCase().includes(offLower) || (p.branchOffice || "").toLowerCase().includes(offLower) || (p.assignedOffice || "").toLowerCase().includes(offLower);
        if (!matchesOff) return false;
      }
      if (pincodeFilter.trim()) {
        if (!(p.officePincode || "324009").includes(pincodeFilter.trim())) return false;
      }
      if (designationFilter !== "ALL") {
        const desig = (p.designationType || p.role || "").toLowerCase();
        if (!desig.includes(designationFilter.toLowerCase())) return false;
      }
      if (beatFilter !== "ALL") {
        if ((p.beat || "").toLowerCase() !== beatFilter.toLowerCase()) return false;
      }
      if (refinementQuery.trim()) {
        const q = refinementQuery.trim().toLowerCase();
        const matchesRef = p.name.toLowerCase().includes(q) || (p.employeeId || p.id || "").toLowerCase().includes(q) || (p.contact || "").includes(q) || (p.email || "").toLowerCase().includes(q) || (p.designationType || p.role || "").toLowerCase().includes(q) || (p.beat || "").toLowerCase().includes(q);
        if (!matchesRef) return false;
      }
      return true;
    });
  }, [
    canRenderDataList,
    profiles,
    selectedCircle,
    selectedDivision,
    selectedOffice,
    pincodeFilter,
    designationFilter,
    beatFilter,
    refinementQuery
  ]);
  const loadStaffIntoForm = (staffOrProfile) => {
    var _a;
    setEditingStaffId(staffOrProfile.id);
    setFormName(staffOrProfile.name);
    setFormContact(staffOrProfile.contact || "");
    setFormEmployeeId(staffOrProfile.employeeId || staffOrProfile.id.replace(/^STAFF-/, ""));
    setFormEmail(staffOrProfile.email || "");
    setFormDesignation(staffOrProfile.designationType || "Postman");
    setFormCircle(staffOrProfile.circle || "Rajasthan Circle");
    setFormDivision(staffOrProfile.division || "Kota Division");
    setFormHeadOffice(staffOrProfile.headOffice || "Kota H.O.");
    setFormSubOffice(staffOrProfile.subOffice || "Dadabari S.O.");
    setFormBranchOffice(staffOrProfile.branchOffice || "");
    setFormOfficePincode(staffOrProfile.officePincode || "324009");
    setFormOfficeAddress(
      staffOrProfile.officeAddress || "Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - 324009"
    );
    setFormBeat(staffOrProfile.beat || "Beat 2");
    setFormDeliveryMapping(
      staffOrProfile.deliveryOfficeMapping || "Dadabari S.O. (324009) / Kota H.O."
    );
    const cols = ((_a = staffOrProfile.assignedColonies) == null ? void 0 : _a.length) ? staffOrProfile.assignedColonies : getDefaultColoniesForBeat(staffOrProfile.beat || "Beat 2");
    setFormColoniesText(cols.join(", "));
    const matchedProf = profiles.find(
      (p) => p.id === staffOrProfile.id || p.email && staffOrProfile.email && p.email.toLowerCase() === staffOrProfile.email.toLowerCase() || p.employeeId && staffOrProfile.employeeId && p.employeeId === staffOrProfile.employeeId
    );
    if (matchedProf) {
      setFormFixedKm(matchedProf.fixedKm || 18);
      setFormDailyLimit(matchedProf.permissions.dailyEntryLimit ?? 50);
      setFormApprovalStatus(matchedProf.permissions.approvalStatus || "Approved");
      setFormServiceModules(
        matchedProf.permissions.serviceModules || { ...DEFAULT_STAFF_SERVICE_MODULES }
      );
    }
    setActiveTab("direct_entry");
  };
  const resetForm = () => {
    setEditingStaffId(null);
    setFormName("");
    setFormContact("");
    setFormEmployeeId(`CSI-${Math.floor(1e7 + Math.random() * 9e7)}`);
    setFormEmail("");
    setFormPassword("Post@123");
    setFormDesignation("Postman");
    setFormCircle("Rajasthan Circle");
    setFormDivision("Kota Division");
    setFormHeadOffice("Kota H.O.");
    setFormSubOffice("Dadabari S.O.");
    setFormBranchOffice("");
    setFormOfficePincode("324009");
    setFormOfficeAddress(
      "Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - 324009"
    );
    setFormBeat("Beat 2");
    setFormDeliveryMapping("Dadabari S.O. (324009) / Kota H.O.");
    setFormColoniesText("Keshavpura Sector 7, Keshavpura Sector 6, Patel Nagar, Santoshi Nagar");
    setFormFixedKm(18);
    setFormDailyLimit(50);
    setFormApprovalStatus("Approved");
    setFormServiceModules({ ...DEFAULT_STAFF_SERVICE_MODULES });
  };
  const handleSaveStaffAndAutoManageOffice = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formContact.trim()) {
      showToast("Please enter Full Name and Mobile / Contact Number.");
      return;
    }
    const coloniesList = formColoniesText.split(",").map((c) => c.trim()).filter(Boolean);
    const { profile, staffRecord } = staffPermissionService.upsertStaffWithAutoOfficeAndBeat({
      id: editingStaffId || void 0,
      employeeId: formEmployeeId,
      name: formName,
      contact: formContact,
      email: formEmail,
      password: formPassword,
      designationType: formDesignation,
      circle: formCircle,
      division: formDivision,
      headOffice: formHeadOffice,
      subOffice: formSubOffice,
      branchOffice: formBranchOffice,
      officePincode: formOfficePincode,
      officeAddress: formOfficeAddress,
      beat: formBeat,
      deliveryOfficeMapping: formDeliveryMapping,
      assignedColonies: coloniesList,
      fixedKm: formFixedKm,
      dailyEntryLimit: formDailyLimit,
      approvalStatus: formApprovalStatus,
      serviceModules: formServiceModules
    });
    const existingInCust = customerService.getStaff().some((s) => s.id === staffRecord.id);
    if (existingInCust) {
      customerService.updateStaff(staffRecord);
    } else {
      customerService.addStaff(staffRecord);
    }
    refreshData();
    showToast(
      `Saved ${profile.name} (${profile.designationType}) & Auto-Updated Office (${formSubOffice}) + Beat (${formBeat}) Mappings!`
    );
    setActiveTab("directory");
  };
  const clearFilters = () => {
    setSelectedCircle("");
    setSelectedDivision("");
    setSelectedOffice("");
    setPincodeFilter("");
    setRefinementQuery("");
    setDesignationFilter("ALL");
    setBeatFilter("ALL");
  };
  const handleQuickDrillDown = (circle, division, office, pin) => {
    setSelectedCircle(circle);
    setSelectedDivision(division);
    setSelectedOffice(office);
    setPincodeFilter(pin);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 pb-12", children: [
    toastMsg && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-emerald-400 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold", children: toastMsg })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-red-900/30", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 py-1 bg-red-600/30 border border-red-500/40 rounded-full text-[11px] font-black uppercase tracking-wider text-red-200 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-3.5 h-3.5" }),
              " Staff, Office & Service Authorization OS"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-[11px] font-bold text-emerald-300", children: [
              "Auto-Managed Offices (",
              autoOffices.length,
              ") • ",
              directoryStaff.length,
              " Staff"
            ] }),
            isActualSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setSimulateRestrictedView(!simulateRestrictedView),
                className: `px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer ${simulateRestrictedView ? "bg-amber-400 text-slate-950 shadow-md" : "bg-white/10 text-slate-200 hover:bg-white/20 border border-white/15"}`,
                title: "Toggle to test how Non-Super-Admin users experience the Strict Drill-Down Filter gate",
                children: simulateRestrictedView ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-3.5 h-3.5" }),
                  " Testing Staff Restricted View (Click to Exit)"
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }),
                  " Super Admin View (mahen.comtech@gmail.com)"
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl md:text-3xl font-black tracking-tight", children: "Direct Staff Entry, Auto-Managed Offices & Service Access Engine" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-300 text-xs md:text-sm mt-1 max-w-3xl", children: "Live Staff Registration automatically populates Circle, Division, HO/SO/BO, Pincode, Beat Numbers & Colony Mappings with zero manual office pre-entry required." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                resetForm();
                setActiveTab("direct_entry");
              },
              className: "flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black text-xs shadow-lg transition-all cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
                " Direct Staff Registration / Update"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setIsCsvImportOpen(true),
              className: "flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-950 rounded-xl font-black text-xs shadow-md transition-all cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4 text-red-700" }),
                " Secure CSV Import & Analysis"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => staffPermissionService.exportAllToExcel(),
              className: "flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs shadow-md transition-all cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "w-4 h-4" }),
                " Export Excel (.xlsx)"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setActiveTab("directory"),
            className: `px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${activeTab === "directory" ? "bg-white text-slate-900 shadow-lg" : "bg-white/10 text-slate-200 hover:bg-white/15"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-4 h-4 text-red-600" }),
              "Staff, Joining Office & Beat Directory (",
              directoryStaff.length,
              ")"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setActiveTab("service_matrix"),
            className: `px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${activeTab === "service_matrix" ? "bg-white text-slate-900 shadow-lg" : "bg-white/10 text-slate-200 hover:bg-white/15"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersVertical, { className: "w-4 h-4 text-amber-500" }),
              "Granular Service-Level Access & Admin Approval Matrix"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setActiveTab("direct_entry"),
            className: `px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${activeTab === "direct_entry" ? "bg-amber-400 text-slate-950 shadow-lg" : "bg-white/10 text-amber-300 hover:bg-white/15 border border-amber-400/30"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4" }),
              editingStaffId ? "Update Staff & Office Mapping" : "Direct Staff Registration Form"
            ]
          }
        )
      ] })
    ] }),
    activeTab !== "direct_entry" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-black text-slate-900 flex items-center gap-2", children: [
              "Multi-Level Hierarchical Drill-Down Search Filter",
              !isEffectiveSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase", children: "Mandatory Filter Required to Render Data" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Level 1: Select Circle → Division → HO/SO/BO or Pincode • Level 2: Refine by Staff Name, Employee ID, Mobile, Designation, or Beat" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleQuickDrillDown("Rajasthan Circle", "Kota Division", "Dadabari S.O.", "324009"),
              className: "px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer",
              children: "Quick Fill: Dadabari S.O. (324009)"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: clearFilters,
              className: "px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-3 h-3" }),
                " Reset Filters"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 p-4 rounded-2xl border border-slate-200/80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-3.5 h-3.5 text-red-600" }),
          "Level 1 — Hierarchical Office Selection (Circle → Division → HO / SO / BO or Pincode)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "1. Select Circle" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: selectedCircle,
                onChange: (e) => setSelectedCircle(e.target.value),
                className: "w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "-- Select Postal Circle --" }),
                  availableCircles.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, children: c }, c))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "2. Select Division" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: selectedDivision,
                onChange: (e) => setSelectedDivision(e.target.value),
                className: "w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "-- Select Division --" }),
                  availableDivisions.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: d, children: d }, d))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "3. Select HO / SO / BO" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: selectedOffice,
                onChange: (e) => setSelectedOffice(e.target.value),
                className: "w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "-- Select HO / SO / BO --" }),
                  availableOffices.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o, children: o }, o))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "OR Enter Office Pincode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: pincodeFilter,
                onChange: (e) => setPincodeFilter(e.target.value),
                placeholder: "e.g., 324009 or 324001",
                className: "w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 p-4 rounded-2xl border border-slate-200/80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-3.5 h-3.5 text-blue-600" }),
          "Level 2 — Staff & Territory Refinement (Name, Employee ID, Mobile, Designation, Beat)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: refinementQuery,
                onChange: (e) => setRefinementQuery(e.target.value),
                placeholder: "Search Name, Emp ID (10310735), Mobile, or Colony...",
                className: "w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: designationFilter,
              onChange: (e) => setDesignationFilter(e.target.value),
              className: "w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Designations (PA / GDS / Postman / MTS / Inspector)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PA", children: "PA (Postal Assistant)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Postman", children: "Postman" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "GDS", children: "GDS (BPM / ABPM / Dak Sevak)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "MTS", children: "MTS (Multi Tasking Staff)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Inspector", children: "Inspector (IP / ASP)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Postmaster", children: "SPM / Postmaster" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: beatFilter,
              onChange: (e) => setBeatFilter(e.target.value),
              className: "w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Delivery Beats (Beat 1 - Beat 33 & BO)" }),
                availableBeats.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b, children: b }, b))
              ]
            }
          ) })
        ] })
      ] })
    ] }),
    activeTab !== "direct_entry" && !canRenderDataList && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50/90 border-2 border-dashed border-amber-300 rounded-3xl p-8 text-center space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-7 h-7" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 bg-amber-200/80 text-amber-900 rounded-full text-[11px] font-black uppercase tracking-wider", children: "Role-Based Data Visibility Protection Active" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black text-slate-900 mt-2", children: "Default Complete Listing is Restricted for Non-Super-Admin Accounts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-600 mt-1 leading-relaxed", children: [
          "Only the Master Super Admin (",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "mahen.comtech@gmail.com" }),
          ") sees all staff and office records by default on page load. General users and staff must execute the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Multi-Level Search Filter" }),
          " above (select Circle/Division/Office/Pincode or search by Name/Employee ID/Mobile/Beat) to view matching records."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-center gap-3 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleQuickDrillDown("Rajasthan Circle", "Kota Division", "Dadabari S.O.", "324009"),
            className: "px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer",
            children: "Apply Dadabari S.O. (324009) Filter"
          }
        ),
        (currentUser == null ? void 0 : currentUser.beat) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setBeatFilter(currentUser.beat),
            className: "px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer",
            children: [
              "Filter My Assigned Beat (",
              currentUser.beat,
              ")"
            ]
          }
        )
      ] })
    ] }),
    activeTab === "direct_entry" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-900 text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-lg text-[10px] font-black uppercase tracking-wider", children: "Live Auto-Managed Office & Beat Engine" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-black mt-1", children: editingStaffId ? `Update Staff Profile & Office Mapping (${formName})` : "Direct Staff Registration & Profile Update Form" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-300 mt-0.5", children: "Submitting this form automatically creates or updates the Staff Profile, Office Record (Circle/Division/HO/SO/BO/Pincode), and Beat-Colony Mapping." })
        ] }),
        editingStaffId && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: resetForm,
            className: "px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer",
            children: "+ Switch to New Staff Entry"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSaveStaffAndAutoManageOffice, className: "p-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs font-black uppercase tracking-wider text-red-700 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-4 h-4" }),
            "1. Staff Basic Details (Mandatory Column Fields)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Full Name *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  value: formName,
                  onChange: (e) => setFormName(e.target.value),
                  placeholder: "e.g., Mahendra Kumar Meena",
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Mobile / Contact Number *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  value: formContact,
                  onChange: (e) => setFormContact(e.target.value),
                  placeholder: "10-digit Mobile Number",
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Employee ID (CSI / GDS ID) *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  value: formEmployeeId,
                  onChange: (e) => setFormEmployeeId(e.target.value),
                  placeholder: "e.g., 10310735 or CSI-100234",
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Designation / Designation Type *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  value: formDesignation,
                  onChange: (e) => setFormDesignation(e.target.value),
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900",
                  children: DESIGNATION_OPTIONS.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: d, children: d }, d))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Official / Login Email (Auto-generated if left blank)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "email",
                  value: formEmail,
                  onChange: (e) => setFormEmail(e.target.value),
                  placeholder: "e.g., staff.name@indiapost.gov.in",
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Login Password" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: formPassword,
                  onChange: (e) => setFormPassword(e.target.value),
                  placeholder: "Post@123",
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Daily Entry Quota" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  min: 0,
                  value: formDailyLimit,
                  onChange: (e) => setFormDailyLimit(Number(e.target.value)),
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50/50 p-5 rounded-2xl border border-blue-200 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs font-black uppercase tracking-wider text-blue-800 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-4 h-4" }),
              "2. Joining Office Details (Auto-Manages & Groups Office Master Record)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-blue-600", children: "No pre-entry needed — new HO/SO/BO & Pincodes are auto-registered live!" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Circle *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  value: formCircle,
                  onChange: (e) => setFormCircle(e.target.value),
                  placeholder: "Rajasthan Circle",
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Division *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  value: formDivision,
                  onChange: (e) => setFormDivision(e.target.value),
                  placeholder: "Kota Division",
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Head Office (HO) *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  value: formHeadOffice,
                  onChange: (e) => setFormHeadOffice(e.target.value),
                  placeholder: "Kota H.O.",
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Sub Office (SO) *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  value: formSubOffice,
                  onChange: (e) => setFormSubOffice(e.target.value),
                  placeholder: "Dadabari S.O.",
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Branch Office (BO, if any)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: formBranchOffice,
                  onChange: (e) => setFormBranchOffice(e.target.value),
                  placeholder: "e.g., Branch Office Name",
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Office Pincode *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  value: formOfficePincode,
                  onChange: (e) => setFormOfficePincode(e.target.value),
                  placeholder: "324009",
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-3 lg:col-span-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Complete Office Address *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  value: formOfficeAddress,
                  onChange: (e) => setFormOfficeAddress(e.target.value),
                  placeholder: "Full Postal Address of Joining Office with Landmark & Pincode",
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "w-4 h-4" }),
              "3. Beat & Delivery Territory Mapping (Auto-Links Colonies to Beat & Pincode)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-emerald-700", children: "Colonies entered below are automatically mapped to this Beat & Pincode!" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Assigned Beat Number(s) *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  value: formBeat,
                  onChange: (e) => {
                    const b = e.target.value;
                    setFormBeat(b);
                    setFormFixedKm(getDefaultFixedKmForBeat(b));
                  },
                  placeholder: "e.g., Beat 2 or Beat BO",
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Delivery BO / SO Mappings *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  value: formDeliveryMapping,
                  onChange: (e) => setFormDeliveryMapping(e.target.value),
                  placeholder: "e.g., Dadabari S.O. (324009) / Delivery Hub",
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Fixed Beat Route Distance (KM)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  value: formFixedKm,
                  onChange: (e) => setFormFixedKm(Number(e.target.value)),
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700", children: "Assigned Beat Areas / Colonies & Sectors (Comma-separated) *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setFormColoniesText(getDefaultColoniesForBeat(formBeat).join(", ")),
                    className: "text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer",
                    children: [
                      "Auto-Fill Default Colonies for ",
                      formBeat
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  value: formColoniesText,
                  onChange: (e) => setFormColoniesText(e.target.value),
                  placeholder: "e.g., Keshavpura Sector 7, Keshavpura Sector 6, Patel Nagar, Santoshi Nagar",
                  className: "w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                }
              )
            ] })
          ] })
        ] }),
        isActualSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50/60 p-5 rounded-2xl border border-amber-200 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-4 h-4 text-amber-600" }),
              "4. Granular Service-Level Access & Admin Approval"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-slate-700", children: "Approval Status:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: formApprovalStatus,
                  onChange: (e) => setFormApprovalStatus(e.target.value),
                  className: "px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-black text-slate-900",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Approved", children: "Approved" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Pending Approval", children: "Pending Approval" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Revoked", children: "Revoked" })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3", children: SERVICE_MODULE_LABELS.map((mod) => {
            const checked = formServiceModules[mod.key];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "label",
              {
                className: `p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${checked ? "bg-white border-emerald-400 shadow-sm" : "bg-slate-100/70 border-slate-200 opacity-75"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked,
                      onChange: (e) => setFormServiceModules((prev) => ({
                        ...prev,
                        [mod.key]: e.target.checked
                      })),
                      className: "mt-1 w-4 h-4 accent-emerald-600"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-black text-slate-900", children: mod.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-500 mt-0.5", children: mod.desc })
                  ] })
                ]
              },
              mod.key
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-3 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setActiveTab("directory"),
              className: "px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "submit",
              className: "px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-lg flex items-center gap-2 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
                "Save Staff Record & Auto-Sync Office + Beat Data"
              ]
            }
          )
        ] })
      ] })
    ] }),
    activeTab === "directory" && canRenderDataList && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-base font-black text-slate-900", children: [
          "Verified Postal Staff, Joining Offices & Delivery Beat Territory (",
          filteredDirectory.length,
          " Records)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: 'Click "Edit / Update Profile & Office" on any staff row to live-update their designation, office, beat, or colony mapping.' })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left border-collapse", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3.5 px-4", children: "Staff Basic Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3.5 px-4", children: "Designation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3.5 px-4", children: "Joining Office (Circle / Div / HO / SO / BO)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3.5 px-4", children: "Office Pincode & Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3.5 px-4", children: "Beat & Delivery Colonies" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3.5 px-4 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-100 text-xs", children: filteredDirectory.map((staff) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-slate-50/80 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3.5 px-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-slate-900 text-sm", children: staff.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-bold text-slate-500 flex items-center gap-2 mt-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono", children: [
                "ID: ",
                staff.employeeId || staff.id
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-emerald-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-3 h-3" }),
                " ",
                staff.contact
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3.5 px-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg font-black text-[11px] inline-block", children: staff.designationType || staff.role }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-400 font-semibold mt-1", children: staff.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3.5 px-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-black text-slate-800", children: [
              staff.subOffice || staff.subOrBranchOffice || "Dadabari S.O.",
              staff.branchOffice ? ` → ${staff.branchOffice}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-500 font-semibold mt-0.5", children: [
              "HO: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-slate-700", children: staff.headOffice || "Kota H.O." }),
              " •",
              " ",
              staff.division || "Kota Division",
              " (",
              staff.circle || "Rajasthan Circle",
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3.5 px-4 max-w-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-black text-[11px]", children: [
              "PIN: ",
              staff.officePincode || "324009"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-600 mt-1 line-clamp-2", children: staff.officeAddress || "Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota - 324009" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3.5 px-4 max-w-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-lg font-black text-[11px]", children: staff.beat }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-500 font-bold", children: staff.deliveryOfficeMapping || "Dadabari S.O. (324009)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: (staff.assignedColonies || getDefaultColoniesForBeat(staff.beat)).map((col, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-bold",
                children: col
              },
              idx
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3.5 px-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => loadStaffIntoForm(staff),
              className: "px-3 py-1.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl font-bold text-[11px] inline-flex items-center gap-1.5 transition-all cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { className: "w-3.5 h-3.5" }),
                " Edit / Update"
              ]
            }
          ) })
        ] }, staff.id)) })
      ] }) })
    ] }),
    activeTab === "service_matrix" && canRenderDataList && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl border border-slate-200 p-5 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-base font-black text-slate-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-5 h-5 text-red-600" }),
            "Granular Service-Level Access Control & Admin Approval Matrix (",
            filteredProfiles.length,
            " Users)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500 mt-0.5", children: [
            "Super Admin (",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "mahen.comtech@gmail.com" }),
            ") can approve/revoke users and toggle individual service modules (CRM, Special Bills, Learning LMS, Scheme Leads, Content Sharing) and data scope in real time."
          ] })
        ] }),
        !isActualSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1.5 bg-amber-100 text-amber-800 rounded-xl text-xs font-black", children: "Read-Only Matrix (Only Master Admin mahen.comtech@gmail.com can modify permissions)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 mt-4", children: filteredProfiles.map((prof) => {
        const isMaster = prof.email.toLowerCase() === "mahen.comtech@gmail.com";
        const modules = prof.permissions.serviceModules || DEFAULT_STAFF_SERVICE_MODULES;
        const approval = prof.permissions.approvalStatus || "Approved";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `rounded-2xl border p-4 transition-all ${isMaster ? "bg-gradient-to-r from-amber-50/70 via-white to-red-50/40 border-amber-300 shadow-sm" : approval === "Revoked" ? "bg-red-50/30 border-red-200 opacity-80" : "bg-slate-50/60 border-slate-200"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-200/70", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm", children: prof.name.slice(0, 2).toUpperCase() }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-slate-900 text-sm", children: prof.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[10px] font-black", children: prof.designationType || prof.role }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[10px] font-black", children: prof.beat }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold", children: [
                        prof.subOffice || prof.assignedOffice,
                        " (",
                        prof.officePincode || "324009",
                        ")"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-500 font-semibold mt-0.5 flex flex-wrap items-center gap-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "Email: ",
                        prof.email
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "• Emp ID: ",
                        prof.employeeId || prof.id
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "• Mobile: ",
                        prof.contact || "N/A"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "• Scoped Colonies:",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-slate-700", children: (prof.assignedColonies || []).slice(0, 3).join(", ") })
                      ] })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "select",
                    {
                      disabled: !isActualSuperAdmin || isMaster,
                      value: approval,
                      onChange: (e) => {
                        staffPermissionService.setApprovalStatus(prof.email, e.target.value);
                        showToast(`Updated approval status for ${prof.name} to ${e.target.value}`);
                      },
                      className: `px-3 py-1.5 rounded-xl text-xs font-black border ${approval === "Approved" ? "bg-emerald-100 text-emerald-800 border-emerald-300" : approval === "Pending Approval" ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-red-100 text-red-800 border-red-300"}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Approved", children: "✓ Approved" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Pending Approval", children: "⏳ Pending Approval" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Revoked", children: "✕ Access Revoked" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      disabled: !isActualSuperAdmin || isMaster,
                      onClick: () => {
                        staffPermissionService.updateStaffPermission(prof.email, {
                          canViewAllRecords: !prof.permissions.canViewAllRecords
                        });
                        showToast(`Updated Record Scope for ${prof.name}`);
                      },
                      className: `px-3 py-1.5 rounded-xl text-[11px] font-black border cursor-pointer ${prof.permissions.canViewAllRecords ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-300"}`,
                      children: prof.permissions.canViewAllRecords ? "Scope: All Office Records" : `Scope: Beat (${prof.beat}) & Own Entries`
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => loadStaffIntoForm(prof),
                      className: "px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold cursor-pointer",
                      children: "Edit Full Profile"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mt-3", children: SERVICE_MODULE_LABELS.map((mod) => {
                const isEnabled = isMaster ? true : Boolean(modules[mod.key]);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    disabled: !isActualSuperAdmin || isMaster,
                    onClick: () => {
                      staffPermissionService.toggleServiceModule(prof.email, mod.key, !isEnabled);
                      showToast(
                        `${!isEnabled ? "Enabled" : "Restricted"} ${mod.shortLabel} for ${prof.name}`
                      );
                    },
                    className: `p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${isEnabled ? "bg-white border-emerald-300 shadow-xs" : "bg-slate-100 border-slate-200 opacity-60"} ${isActualSuperAdmin && !isMaster ? "cursor-pointer hover:border-slate-400" : ""}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-black text-slate-900", children: mod.shortLabel }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-bold text-slate-500", children: isEnabled ? "Authorized" : "Restricted" })
                      ] }),
                      isEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-emerald-600 shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4 text-slate-400 shrink-0" })
                    ]
                  },
                  mod.key
                );
              }) })
            ]
          },
          prof.id
        );
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StaffCsvImportModal,
      {
        isOpen: isCsvImportOpen,
        onClose: () => setIsCsvImportOpen(false),
        onImportComplete: (summaryMsg) => {
          refreshData();
          showToast(summaryMsg);
        }
      }
    )
  ] });
};
export {
  StaffMasterView,
  StaffMasterView as default
};
