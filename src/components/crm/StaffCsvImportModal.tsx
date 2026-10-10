import React, { useState, useMemo } from 'react';
import {
  Upload,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Download,
  RefreshCw,
  ArrowRight,
  Search,
  Database,
  Layers,
  X,
  FileCheck2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  staffPermissionService,
  getDefaultColoniesForBeat,
  getDefaultFixedKmForBeat,
  DEFAULT_STAFF_SERVICE_MODULES,
} from '../../services/staffPermissionService';
import { customerService } from '../../services/customerService';
import { Staff, StaffProfile, DesignationType } from '../../types/models';

export type RowAnalysisStatus =
  | 'NEW_CLEAN'
  | 'UPDATE_CANDIDATE'
  | 'EXACT_DUPLICATE'
  | 'CONFLICT_WARNING'
  | 'INVALID_ROW';

export type RowResolutionAction = 'IMPORT_NEW' | 'UPDATE_EXISTING' | 'SKIP';

export interface FieldDiff {
  fieldLabel: string;
  existingValue: string;
  incomingValue: string;
}

export interface AnalyzedStaffCsvRow {
  rowIndex: number;
  employeeId: string;
  name: string;
  contact: string;
  email: string;
  designationType: DesignationType;
  circle: string;
  division: string;
  headOffice: string;
  subOffice: string;
  branchOffice: string;
  officePincode: string;
  officeAddress: string;
  beat: string;
  fixedKm: number;
  assignedColonies: string[];
  deliveryOfficeMapping: string;
  status: RowAnalysisStatus;
  statusReason: string;
  matchedExistingStaff?: Staff | StaffProfile;
  diffs: FieldDiff[];
  selectedAction: RowResolutionAction;
}

interface StaffCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (summaryMsg: string) => void;
}

const SAMPLE_CSV_CONTENT = `Employee ID,Full Name,Mobile,Designation,Circle,Division,Head Office,Sub Office,Branch Office,Pincode,Office Address,Beat,Fixed KM,Assigned Colonies,Email
50457421,Mahendra Kumar Meena,9414023041,Postman,Rajasthan Circle,Kota Division,Kota H.O.,Dadabari S.O.,,324009,"Dadabari Sub-Post Office, Near CAD Circle, Kota - 324009",Beat 2,30,"Keshavpura Sector 7; Keshavpura Sector 6; Patel Nagar",mahen.comtech@gmail.com
10310735,Govind Prasad,9829011223,Postman,Rajasthan Circle,Kota Division,Kota H.O.,Dadabari S.O.,,324009,"Dadabari Sub-Post Office, Near CAD Circle, Kota - 324009",Beat 4,22,"Keshavpura Sector 4; Keshavpura Sector 5; तलवंडी A",govind.prasad@indiapost.gov.in
CSI-10884512,Rakesh Kumar Verma,9414288901,Postman,Rajasthan Circle,Kota Division,Kota H.O.,Dadabari S.O.,,324009,"Dadabari Sub-Post Office, Near CAD Circle, Kota - 324009",Beat 8,24,"Mahaveer Nagar 1st; Mahaveer Nagar 2nd; रंगबाड़ी योजना",rakesh.verma@indiapost.gov.in
GDS-30991204,Sunita Meena,9660144521,GDS (BPM / ABPM / Dak Sevak),Rajasthan Circle,Kota Division,Kota H.O.,Dadabari S.O.,Mandaliya B.O.,324009,"Mandaliya Branch Post Office, Via Dadabari SO, Kota - 324009",Beat BO,20,"Mandaliya Village; Rooparel; नयागाँव ग्रामीण",sunita.meena@indiapost.gov.in
PA-20449102,Deepak Kumar नामा,9784512098,PA (Postal Assistant),Rajasthan Circle,Kota Division,Kota H.O.,Dadabari S.O.,,324009,"Dadabari Sub-Post Office, Counter Section, Kota - 324009",Beat 1,16,"Dadabari Main Sector 1; Dadabari Sector 2",deepak.nama@indiapost.gov.in`;

function normalizePhone(raw: string): string {
  const digits = String(raw || '').replace(/\.0+$/, '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

function normalizeId(raw: string): string {
  return String(raw || '').trim().replace(/\.0+$/, '');
}

function parseCsvLine(line: string): string[] {
  const res: string[] = [];
  let cur = '';
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
    } else if (ch === ',' && !inQuotes) {
      res.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  res.push(cur.trim());
  return res;
}

function parseRawCsvText(csvText: string): Record<string, string>[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = parseCsvLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = vals[idx] !== undefined ? vals[idx].trim() : '';
    });
    rows.push(obj);
  }
  return rows;
}

function pickField(row: Record<string, any>, candidates: string[]): string {
  const keys = Object.keys(row);
  for (const cand of candidates) {
    const candClean = cand.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchKey = keys.find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, '') === candClean);
    if (matchKey && row[matchKey] !== undefined && String(row[matchKey]).trim() !== '') {
      return String(row[matchKey]).trim();
    }
  }
  // Partial match fallback
  for (const cand of candidates) {
    const candClean = cand.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchKey = keys.find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(candClean));
    if (matchKey && row[matchKey] !== undefined && String(row[matchKey]).trim() !== '') {
      return String(row[matchKey]).trim();
    }
  }
  return '';
}

export const StaffCsvImportModal: React.FC<StaffCsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [rawObjects, setRawObjects] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [analyzedRows, setAnalyzedRows] = useState<AnalyzedStaffCsvRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [pasteMode, setPasteMode] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>('');
  const [requireExplicitUpdateConfirm, setRequireExplicitUpdateConfirm] = useState<boolean>(true);

  if (!isOpen) return null;

  const runIntegrityAnalysis = (incomingRecords: Record<string, any>[], sourceLabel: string) => {
    const existingStaff = staffPermissionService.getDirectoryStaff();
    const existingProfiles = staffPermissionService.getStaffProfiles();

    const seenIdsInCsv = new Set<string>();
    const seenPhonesInCsv = new Set<string>();
    const seenEmailsInCsv = new Set<string>();

    const analyzed: AnalyzedStaffCsvRow[] = incomingRecords.map((raw, idx) => {
      const empId = normalizeId(
        pickField(raw, ['Employee ID', 'Emp ID', 'CSI ID', 'Staff ID', 'employeeId', 'id'])
      );
      const name = pickField(raw, ['Full Name', 'Staff Name', 'Name', 'Officer Name', 'employeeName']);
      const contact = normalizePhone(
        pickField(raw, ['Mobile', 'Contact', 'Mobile Number', 'Phone', 'Contact Number'])
      );
      const emailRaw = pickField(raw, ['Email', 'Official Email', 'Login Email', 'staffEmail']);
      const designation = (pickField(raw, [
        'Designation',
        'Designation Type',
        'Cadre',
        'Role',
        'Post',
      ]) || 'Postman') as DesignationType;

      const circle = pickField(raw, ['Circle', 'Postal Circle']) || 'Rajasthan Circle';
      const division = pickField(raw, ['Division', 'Postal Division']) || 'Kota Division';
      const headOffice = pickField(raw, ['Head Office', 'HO', 'HO Name']) || 'Kota H.O.';
      const subOffice = pickField(raw, ['Sub Office', 'SO', 'SO Name', 'Post Office']) || 'Dadabari S.O.';
      const branchOffice = pickField(raw, ['Branch Office', 'BO', 'BO Name']) || '';
      const officePincode =
        pickField(raw, ['Pincode', 'Office Pincode', 'PIN', 'Area Pincode']) || '324009';
      const officeAddress =
        pickField(raw, ['Office Address', 'Complete Office Address', 'Address']) ||
        `${subOffice}, ${division}, ${circle} - ${officePincode}`;

      const rawBeat = pickField(raw, ['Beat', 'Beat No', 'Beat Number', 'Assigned Beat']) || 'Beat 2';
      const beat =
        /^\d+$/.test(rawBeat.trim()) ? `Beat ${rawBeat.trim()}` : rawBeat.trim();

      const rawFixedKm = Number(
        pickField(raw, ['Fixed KM', 'Avg Running', 'Beat KM', 'Fixed Distance', 'fixedKm'])
      );
      const fixedKm = !isNaN(rawFixedKm) && rawFixedKm > 0 ? rawFixedKm : getDefaultFixedKmForBeat(beat);

      const coloniesStr = pickField(raw, [
        'Assigned Colonies',
        'Colonies',
        'Beat Areas',
        'Delivery Colonies',
        'Sectors',
      ]);
      const assignedColonies = coloniesStr
        ? coloniesStr
            .split(/[;|,]/)
            .map((c) => c.trim())
            .filter(Boolean)
        : getDefaultColoniesForBeat(beat);

      const deliveryOfficeMapping =
        pickField(raw, ['Delivery Office Mapping', 'Delivery Mapping']) ||
        `${branchOffice ? `${branchOffice} / ` : ''}${subOffice} (${officePincode})`;

      const email =
        emailRaw ||
        `${name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '.')
          .replace(/\.+/g, '.')
          .replace(/^\.|\.$/g, '') || 'staff'}@indiapost.gov.in`;

      // 1. Validate Mandatory Fields
      if (!name || (!empId && !contact)) {
        return {
          rowIndex: idx + 1,
          employeeId: empId || `MISSING-ID-${idx + 1}`,
          name: name || '(Missing Staff Name)',
          contact: contact || '',
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
          status: 'INVALID_ROW',
          statusReason: 'Missing mandatory Staff Name or both Employee ID and Mobile Number.',
          diffs: [],
          selectedAction: 'SKIP',
        };
      }

      // 2. Check Intra-CSV Duplicates (Duplicate row inside the uploaded file itself)
      const normEmpIdLower = empId.toLowerCase();
      const normEmailLower = email.toLowerCase();
      if (
        (normEmpIdLower && seenIdsInCsv.has(normEmpIdLower)) ||
        (contact && seenPhonesInCsv.has(contact)) ||
        (emailRaw && seenEmailsInCsv.has(normEmailLower))
      ) {
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
          status: 'CONFLICT_WARNING',
          statusReason: 'Duplicate row detected within the uploaded CSV file (same Employee ID / Mobile / Email).',
          diffs: [],
          selectedAction: 'SKIP',
        };
      }

      if (normEmpIdLower) seenIdsInCsv.add(normEmpIdLower);
      if (contact) seenPhonesInCsv.add(contact);
      if (emailRaw) seenEmailsInCsv.add(normEmailLower);

      // 3. Match against existing Database entries
      const byId = existingStaff.find(
        (s) =>
          (s.employeeId && normalizeId(s.employeeId).toLowerCase() === normEmpIdLower) ||
          normalizeId(s.id).replace(/^STAFF-/i, '').toLowerCase() === normEmpIdLower
      );
      const byPhone = contact
        ? existingStaff.find((s) => normalizePhone(s.contact) === contact)
        : undefined;
      const byEmail = emailRaw
        ? existingStaff.find((s) => (s.email || '').toLowerCase() === normEmailLower)
        : undefined;
      const byNameExact = existingStaff.find(
        (s) => s.name.trim().toLowerCase() === name.trim().toLowerCase()
      );

      // Check for Identity Conflict (e.g. Employee ID matches Staff A, but Mobile matches Staff B!)
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
          status: 'CONFLICT_WARNING',
          statusReason: `Identity Conflict: Employee ID (${empId}) belongs to "${byId.name}", while Mobile (${contact}) belongs to "${byPhone.name}".`,
          matchedExistingStaff: byId,
          diffs: [],
          selectedAction: 'SKIP',
        };
      }

      // Check if Name matches an existing staff member with a DIFFERENT non-empty Employee ID
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
          status: 'CONFLICT_WARNING',
          statusReason: `Same Name "${name}" exists in DB with different Employee ID (${byNameExact.employeeId}). Review before importing.`,
          matchedExistingStaff: byNameExact,
          diffs: [],
          selectedAction: 'SKIP',
        };
      }

      const matched = byId || byPhone || byEmail || byNameExact;

      if (matched) {
        const matchedProf = existingProfiles.find(
          (p) =>
            p.id === matched.id ||
            (p.employeeId && matched.employeeId && p.employeeId === matched.employeeId) ||
            (p.email && matched.email && p.email.toLowerCase() === matched.email.toLowerCase())
        );

        const diffs: FieldDiff[] = [];
        if (name.toLowerCase() !== matched.name.toLowerCase()) {
          diffs.push({ fieldLabel: 'Name', existingValue: matched.name, incomingValue: name });
        }
        if (contact && normalizePhone(matched.contact) !== contact) {
          diffs.push({ fieldLabel: 'Mobile', existingValue: matched.contact || 'N/A', incomingValue: contact });
        }
        if (
          designation &&
          (matched.designationType || matched.role || '').toLowerCase() !== designation.toLowerCase()
        ) {
          diffs.push({
            fieldLabel: 'Designation',
            existingValue: matched.designationType || matched.role || 'Postman',
            incomingValue: designation,
          });
        }
        if (beat.toLowerCase() !== (matched.beat || '').toLowerCase()) {
          diffs.push({ fieldLabel: 'Beat', existingValue: matched.beat || 'N/A', incomingValue: beat });
        }
        if (subOffice.toLowerCase() !== (matched.subOffice || 'Dadabari S.O.').toLowerCase()) {
          diffs.push({
            fieldLabel: 'Sub Office',
            existingValue: matched.subOffice || 'Dadabari S.O.',
            incomingValue: subOffice,
          });
        }
        if ((branchOffice || '') !== (matched.branchOffice || '')) {
          diffs.push({
            fieldLabel: 'Branch Office',
            existingValue: matched.branchOffice || 'None',
            incomingValue: branchOffice || 'None',
          });
        }
        if (officePincode !== (matched.officePincode || '324009')) {
          diffs.push({
            fieldLabel: 'Pincode',
            existingValue: matched.officePincode || '324009',
            incomingValue: officePincode,
          });
        }
        const existingKm = matchedProf?.fixedKm || getDefaultFixedKmForBeat(matched.beat);
        if (fixedKm !== existingKm) {
          diffs.push({
            fieldLabel: 'Fixed KM',
            existingValue: `${existingKm} KM`,
            incomingValue: `${fixedKm} KM`,
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
            status: 'EXACT_DUPLICATE',
            statusReason: `100% Match with existing DB record (${matched.name}, ID: ${matched.employeeId || matched.id}). Auto-skipped to prevent duplicates.`,
            matchedExistingStaff: matched,
            diffs: [],
            selectedAction: 'SKIP',
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
            status: 'UPDATE_CANDIDATE',
            statusReason: `Matched existing record (${matched.name}, ID: ${matched.employeeId || matched.id}) with ${diffs.length} updated field(s).`,
            matchedExistingStaff: matched,
            diffs,
            selectedAction: requireExplicitUpdateConfirm ? 'SKIP' : 'UPDATE_EXISTING',
          };
        }
      }

      // 4. Clean New Record
      return {
        rowIndex: idx + 1,
        employeeId: empId || `CSI-${Math.floor(10000000 + Math.random() * 90000000)}`,
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
        status: 'NEW_CLEAN',
        statusReason: 'Verified unique Employee ID, Mobile & Email. Safe to import as new staff record.',
        diffs: [],
        selectedAction: 'IMPORT_NEW',
      };
    });

    setRawObjects(incomingRecords);
    setFileName(sourceLabel);
    setAnalyzedRows(analyzed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
        runIntegrityAnalysis(json, file.name);
      };
      reader.readAsBinaryString(file);
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = String(evt.target?.result || '');
        const parsed = parseRawCsvText(text);
        runIntegrityAnalysis(parsed, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSampleBatch = () => {
    const parsed = parseRawCsvText(SAMPLE_CSV_CONTENT);
    runIntegrityAnalysis(parsed, 'KOTA_DIVISION_STAFF_VERIFICATION_BATCH.csv');
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'INDIA_POST_STAFF_IMPORT_TEMPLATE.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateRowAction = (rowIndex: number, action: RowResolutionAction) => {
    setAnalyzedRows((prev) =>
      prev.map((r) => (r.rowIndex === rowIndex ? { ...r, selectedAction: action } : r))
    );
  };

  const applyBulkPolicy = (policy: 'ONLY_NEW' | 'NEW_AND_UPDATES' | 'SKIP_ALL') => {
    setAnalyzedRows((prev) =>
      prev.map((r) => {
        if (r.status === 'INVALID_ROW' || r.status === 'EXACT_DUPLICATE') {
          return { ...r, selectedAction: 'SKIP' };
        }
        if (policy === 'SKIP_ALL') {
          return { ...r, selectedAction: 'SKIP' };
        }
        if (policy === 'ONLY_NEW') {
          return {
            ...r,
            selectedAction: r.status === 'NEW_CLEAN' ? 'IMPORT_NEW' : 'SKIP',
          };
        }
        // NEW_AND_UPDATES
        if (r.status === 'NEW_CLEAN') return { ...r, selectedAction: 'IMPORT_NEW' };
        if (r.status === 'UPDATE_CANDIDATE') return { ...r, selectedAction: 'UPDATE_EXISTING' };
        return { ...r, selectedAction: 'SKIP' };
      })
    );
  };

  const stats = useMemo(() => {
    const total = analyzedRows.length;
    const newClean = analyzedRows.filter((r) => r.status === 'NEW_CLEAN').length;
    const updateCandidates = analyzedRows.filter((r) => r.status === 'UPDATE_CANDIDATE').length;
    const exactDuplicates = analyzedRows.filter((r) => r.status === 'EXACT_DUPLICATE').length;
    const conflicts = analyzedRows.filter((r) => r.status === 'CONFLICT_WARNING').length;
    const invalid = analyzedRows.filter((r) => r.status === 'INVALID_ROW').length;

    const queuedNew = analyzedRows.filter((r) => r.selectedAction === 'IMPORT_NEW').length;
    const queuedUpdate = analyzedRows.filter((r) => r.selectedAction === 'UPDATE_EXISTING').length;
    const queuedSkip = analyzedRows.filter((r) => r.selectedAction === 'SKIP').length;

    return {
      total,
      newClean,
      updateCandidates,
      exactDuplicates,
      conflicts,
      invalid,
      queuedNew,
      queuedUpdate,
      queuedSkip,
    };
  }, [analyzedRows]);

  const filteredRows = useMemo(() => {
    return analyzedRows.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.trim().toLowerCase();
        const match =
          r.name.toLowerCase().includes(q) ||
          r.employeeId.toLowerCase().includes(q) ||
          r.contact.includes(q) ||
          r.beat.toLowerCase().includes(q) ||
          r.subOffice.toLowerCase().includes(q);
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
      if (row.selectedAction === 'SKIP') {
        skippedCount++;
        continue;
      }

      const targetId =
        row.selectedAction === 'UPDATE_EXISTING' && row.matchedExistingStaff
          ? row.matchedExistingStaff.id
          : undefined;

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
        approvalStatus: 'Approved',
        serviceModules: { ...DEFAULT_STAFF_SERVICE_MODULES },
      });

      const existsInCustomerStore = customerService.getStaff().some((s) => s.id === staffRecord.id);
      if (existsInCustomerStore) {
        customerService.updateStaff(staffRecord);
      } else {
        customerService.addStaff(staffRecord);
      }

      if (row.selectedAction === 'IMPORT_NEW') {
        importedCount++;
      } else if (row.selectedAction === 'UPDATE_EXISTING') {
        updatedCount++;
      }
    }

    onImportComplete(
      `CSV Integrity Sync Complete: ${importedCount} New Staff Added, ${updatedCount} Confirmed Updates Applied, ${skippedCount} Duplicates/Conflicts Safely Skipped.`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full border border-slate-300 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-800 flex items-center justify-center text-amber-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-amber-400 tracking-wide">
                Zero-Duplicate Staff Directory & Office Reconciliation Engine
              </div>
              <h2 className="text-lg font-bold tracking-tight">
                Secure Staff CSV / Excel Import & Pre-Save Integrity Analyzer
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: Upload / Template / Sample Trigger Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <label className="lg:col-span-2 border-2 border-dashed border-slate-300 hover:border-red-700 bg-slate-50 hover:bg-red-50/20 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer transition">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-red-800 text-white flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {fileName
                      ? `Loaded File: ${fileName} (${analyzedRows.length} rows analyzed)`
                      : 'Upload Staff Directory CSV or Excel (.csv, .xlsx)'}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Every incoming row is compared against existing Employee IDs, Mobile Numbers, Emails & Beat Mappings before saving.
                  </p>
                </div>
              </div>
              <span className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold shrink-0">
                Browse CSV / XLSX
              </span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-2">
              <div className="text-xs font-bold text-slate-800">
                Quick Testing & Departmental Templates
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleLoadSampleBatch}
                  className="flex-1 px-3 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Analyze Sample Batch</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV Template</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPasteMode(!pasteMode)}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold cursor-pointer"
                >
                  {pasteMode ? 'Hide Paste Box' : 'Paste CSV'}
                </button>
              </div>
            </div>
          </div>

          {pasteMode && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Paste Raw CSV Content (First line must be column headers)
                </label>
                <button
                  type="button"
                  onClick={() => setPastedText(SAMPLE_CSV_CONTENT)}
                  className="text-xs font-semibold text-red-800 hover:underline cursor-pointer"
                >
                  Insert Sample CSV Text
                </button>
              </div>
              <textarea
                rows={4}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Employee ID,Full Name,Mobile,Designation,Circle,Division,Head Office,Sub Office,Pincode,Beat,Fixed KM..."
                className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseRawCsvText(pastedText);
                    runIntegrityAnalysis(parsed, 'Pasted_CSV_Data.csv');
                    setPasteMode(false);
                  }}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Run Pre-Save Integrity Analysis
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Analysis Results & Interactive Reconciliation Table */}
          {analyzedRows.length > 0 && (
            <div className="space-y-5">
              {/* Integrity Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-900 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="text-[11px] opacity-75">Total Analyzed</div>
                  <div className="text-2xl font-black font-mono tabular-nums mt-0.5">{stats.total}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">All CSV Rows</div>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('NEW_CLEAN')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    statusFilter === 'NEW_CLEAN'
                      ? 'bg-emerald-800 text-white border-emerald-900'
                      : 'bg-emerald-50/70 text-emerald-950 border-emerald-200 hover:border-emerald-400'
                  }`}
                >
                  <div className="text-[11px] font-semibold">New Verified</div>
                  <div className="text-2xl font-black font-mono tabular-nums mt-0.5">{stats.newClean}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">Zero DB Collision</div>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('UPDATE_CANDIDATE')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    statusFilter === 'UPDATE_CANDIDATE'
                      ? 'bg-blue-800 text-white border-blue-900'
                      : 'bg-blue-50/70 text-blue-950 border-blue-200 hover:border-blue-400'
                  }`}
                >
                  <div className="text-[11px] font-semibold">Field Updates</div>
                  <div className="text-2xl font-black font-mono tabular-nums mt-0.5">
                    {stats.updateCandidates}
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">Existing Staff Diffs</div>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('EXACT_DUPLICATE')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    statusFilter === 'EXACT_DUPLICATE'
                      ? 'bg-slate-700 text-white border-slate-800'
                      : 'bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="text-[11px] font-semibold">Exact Duplicates</div>
                  <div className="text-2xl font-black font-mono tabular-nums mt-0.5">
                    {stats.exactDuplicates}
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">Auto-Blocked</div>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('CONFLICT_WARNING')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    statusFilter === 'CONFLICT_WARNING'
                      ? 'bg-amber-700 text-white border-amber-800'
                      : 'bg-amber-50 text-amber-950 border-amber-300 hover:border-amber-500'
                  }`}
                >
                  <div className="text-[11px] font-semibold">ID / Phone Conflicts</div>
                  <div className="text-2xl font-black font-mono tabular-nums mt-0.5">
                    {stats.conflicts}
                  </div>
                  <div className="text-[10px] opacity-80 mt-0.5">Needs Review</div>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('INVALID_ROW')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    statusFilter === 'INVALID_ROW'
                      ? 'bg-red-800 text-white border-red-900'
                      : 'bg-red-50 text-red-950 border-red-200 hover:border-red-400'
                  }`}
                >
                  <div className="text-[11px] font-semibold">Invalid Rows</div>
                  <div className="text-2xl font-black font-mono tabular-nums mt-0.5">{stats.invalid}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">Missing Mandatory</div>
                </button>
              </div>

              {/* Policy & Search Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 mr-1">Resolution Policy:</span>
                  <button
                    type="button"
                    onClick={() => applyBulkPolicy('ONLY_NEW')}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Import Only New Records (Zero Overwrite)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyBulkPolicy('NEW_AND_UPDATES')}
                    className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Approve New + Verified Field Updates
                  </button>
                  <button
                    type="button"
                    onClick={() => applyBulkPolicy('SKIP_ALL')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Skip All Rows
                  </button>
                </div>

                <div className="relative min-w-[260px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter analyzed rows by Name, ID, Beat..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Detailed Row-by-Row Comparison Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-900 text-white sticky top-0 z-10">
                      <tr>
                        <th className="py-3 px-3 font-semibold">#</th>
                        <th className="py-3 px-3 font-semibold">Incoming Staff & ID</th>
                        <th className="py-3 px-3 font-semibold">Office & Beat Mapping</th>
                        <th className="py-3 px-3 font-semibold">Database Comparison & Field Diffs</th>
                        <th className="py-3 px-3 font-semibold text-right">Action to Execute</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {filteredRows.map((row) => (
                        <tr
                          key={row.rowIndex}
                          className={
                            row.selectedAction === 'SKIP'
                              ? 'bg-slate-50/70 text-slate-500'
                              : 'hover:bg-slate-50'
                          }
                        >
                          <td className="py-3 px-3 font-mono tabular-nums font-bold">
                            {row.rowIndex}
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{row.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                              ID: {row.employeeId} · Ph: {row.contact || 'N/A'}
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              {row.designationType}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900">
                              {row.beat} ({row.fixedKm} KM) · {row.subOffice}
                              {row.branchOffice ? ` → ${row.branchOffice}` : ''}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              PIN: {row.officePincode} · {row.division}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                              Colonies: {row.assignedColonies.join(', ')}
                            </div>
                          </td>

                          <td className="py-3 px-3 max-w-md">
                            <div className="flex items-center gap-1.5 font-bold">
                              {row.status === 'NEW_CLEAN' && (
                                <span className="text-emerald-800 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  New Unique Staff Record
                                </span>
                              )}
                              {row.status === 'UPDATE_CANDIDATE' && (
                                <span className="text-blue-800 flex items-center gap-1">
                                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                                  Matches Existing Record (Diffs Detected)
                                </span>
                              )}
                              {row.status === 'EXACT_DUPLICATE' && (
                                <span className="text-slate-600 flex items-center gap-1">
                                  <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                                  Exact Duplicate (Already in DB)
                                </span>
                              )}
                              {row.status === 'CONFLICT_WARNING' && (
                                <span className="text-amber-800 flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                  Identity / Duplicate Conflict
                                </span>
                              )}
                              {row.status === 'INVALID_ROW' && (
                                <span className="text-red-800 flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                                  Validation Failed
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-slate-600 mt-0.5">
                              {row.statusReason}
                            </div>

                            {row.diffs.length > 0 && (
                              <div className="mt-1.5 space-y-1 bg-blue-50/60 border border-blue-200 rounded-lg p-2">
                                {row.diffs.map((d, i) => (
                                  <div
                                    key={i}
                                    className="text-[11px] flex items-center gap-1.5 font-mono"
                                  >
                                    <span className="font-bold text-slate-700">{d.fieldLabel}:</span>
                                    <span className="line-through text-slate-500">
                                      {d.existingValue}
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-blue-700 shrink-0" />
                                    <span className="font-bold text-blue-900">
                                      {d.incomingValue}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <select
                              disabled={
                                row.status === 'INVALID_ROW' || row.status === 'EXACT_DUPLICATE'
                              }
                              value={row.selectedAction}
                              onChange={(e) =>
                                updateRowAction(
                                  row.rowIndex,
                                  e.target.value as RowResolutionAction
                                )
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                                row.selectedAction === 'IMPORT_NEW'
                                  ? 'bg-emerald-800 text-white border-emerald-900'
                                  : row.selectedAction === 'UPDATE_EXISTING'
                                  ? 'bg-blue-800 text-white border-blue-900'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              {row.status === 'NEW_CLEAN' && (
                                <option value="IMPORT_NEW">✓ Import as New Staff</option>
                              )}
                              {(row.status === 'UPDATE_CANDIDATE' ||
                                row.status === 'CONFLICT_WARNING') &&
                                row.matchedExistingStaff && (
                                  <option value="UPDATE_EXISTING">
                                    ↻ Confirm Update Existing
                                  </option>
                                )}
                              {row.status === 'CONFLICT_WARNING' && !row.matchedExistingStaff && (
                                <option value="IMPORT_NEW">Force Import as New</option>
                              )}
                              <option value="SKIP">✕ Skip / Do Not Save</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-700">
            {analyzedRows.length > 0 ? (
              <span>
                Ready to Commit:{' '}
                <strong className="text-emerald-800 font-mono tabular-nums">
                  {stats.queuedNew} New Staff
                </strong>{' '}
                ·{' '}
                <strong className="text-blue-800 font-mono tabular-nums">
                  {stats.queuedUpdate} Confirmed Updates
                </strong>{' '}
                ·{' '}
                <strong className="text-slate-600 font-mono tabular-nums">
                  {stats.queuedSkip} Skipped (Zero Duplicates)
                </strong>
              </span>
            ) : (
              <span>
                Upload a CSV/XLSX file or click &ldquo;Analyze Sample Batch&rdquo; to inspect incoming records before saving.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={stats.queuedNew + stats.queuedUpdate === 0}
              onClick={handleCommitVerifiedRows}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                stats.queuedNew + stats.queuedUpdate > 0
                  ? 'bg-red-800 hover:bg-red-900 text-white shadow-sm cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                Commit {stats.queuedNew + stats.queuedUpdate} Verified Record(s) to Database
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffCsvImportModal;
