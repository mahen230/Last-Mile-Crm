import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  ShieldCheck,
  Trash2,
  Send,
  Calendar,
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { staffPermissionService } from '../../services/staffPermissionService';

interface ApplicationTemplateDef {
  id: string;
  title: string;
  category: 'Leave' | 'Allowances' | 'Operations' | 'Equipment & HR';
  defaultRecipient: string;
  subject: string;
  buildBody: (ctx: {
    name: string;
    designation: string;
    employeeId: string;
    beat: string;
    office: string;
    fromDate: string;
    toDate: string;
    daysCount: number;
    reasonOrDetails: string;
    substituteName: string;
  }) => string;
}

interface SavedOfficialApplication {
  id: string;
  refNo: string;
  templateId: string;
  templateTitle: string;
  recipient: string;
  subject: string;
  body: string;
  applicantName: string;
  applicantId: string;
  applicantDesignation: string;
  beatNo: string;
  officeName: string;
  fromDate: string;
  toDate: string;
  status: 'Draft' | 'Submitted / Downloaded' | 'Forwarded by SPM' | 'Approved';
  createdAt: string;
}

const STORAGE_KEY_APPLICATIONS = 'indiapost_official_applications_ledger_v1';

const RECIPIENT_OPTIONS = [
  'The Sub-Postmaster (SPM), Dadabari S.O., Kota - 324009',
  'The Asst. Supdt. of Post Offices (ASPOs), Kota East Sub-Division, Kota',
  'The Sr. Supdt. of Post Offices (SSPOs), Kota Division, Kota - 324001',
  'The Head Postmaster, Kota Head Office (NGM H.O.), Kota - 324001',
  'The Inspector of Posts (IP), Kota West Sub-Division, Kota',
];

const APPLICATION_TEMPLATES: ApplicationTemplateDef[] = [
  {
    id: 'CASUAL_LEAVE',
    title: 'Casual Leave (CL) Application',
    category: 'Leave',
    defaultRecipient: 'The Sub-Postmaster (SPM), Dadabari S.O., Kota - 324009',
    subject: 'Application for grant of Casual Leave (CL)',
    buildBody: ({ name, designation, employeeId, beat, office, fromDate, toDate, daysCount, reasonOrDetails, substituteName }) =>
      `Respected Sir/Madam,\n\nMost humbly and respectfully, I, ${name} (${designation}, Emp ID: ${employeeId}), working at ${office} (${beat}), submit that due to ${reasonOrDetails || 'urgent personal/domestic work at home'}, I am unable to attend office duties from ${fromDate} to ${toDate} (${daysCount} day(s)).\n\nI kindly request you to grant me ${daysCount} day(s) Casual Leave for the above period with permission to leave headquarters if required.${substituteName ? ` Beat delivery work arrangement has been coordinated with ${substituteName}.` : ''}\n\nThanking you.`,
  },
  {
    id: 'EARNED_LEAVE',
    title: 'Earned Leave (EL) / Paid Leave Application',
    category: 'Leave',
    defaultRecipient: 'The Asst. Supdt. of Post Offices (ASPOs), Kota East Sub-Division, Kota',
    subject: 'Application for sanction of Earned Leave (EL) with arrangement',
    buildBody: ({ name, designation, employeeId, beat, office, fromDate, toDate, daysCount, reasonOrDetails, substituteName }) =>
      `Respected Sir/Madam,\n\nI, ${name} (${designation}, CSI/Employee ID: ${employeeId}), presently attached to ${office} looking after ${beat}, request kind sanction of ${daysCount} day(s) Earned Leave (EL) from ${fromDate} to ${toDate} on account of ${reasonOrDetails || 'family social ceremony and personal commitments'}.\n\n${substituteName ? `During my absence, Shri/Smt. ${substituteName} has consented to look after the beat delivery work.` : 'Necessary beat arrangement may kindly be approved as per divisional norms.'} Kindly sanction my leave and issue necessary memo.\n\nThanking you.`,
  },
  {
    id: 'MEDICAL_LEAVE',
    title: 'Medical Leave / Unfit Certificate Intimation',
    category: 'Leave',
    defaultRecipient: 'The Sub-Postmaster (SPM), Dadabari S.O., Kota - 324009',
    subject: 'Intimation and Application for Medical / Commuted Leave',
    buildBody: ({ name, designation, employeeId, beat, office, fromDate, toDate, daysCount, reasonOrDetails }) =>
      `Respected Sir/Madam,\n\nI respectfully bring to your kind notice that I have fallen ill (${reasonOrDetails || 'viral fever & doctor advised bed rest'}) and am advised medical rest from ${fromDate} to ${toDate} (${daysCount} day(s)).\n\nI am attaching the Medical Unfit Certificate issued by the Authorized Medical Attendant. Kindly grant me Commuted / Medical Leave as admissible under rules. The Medical Fitness Certificate will be submitted at the time of joining duty at ${office} (${beat}, ID: ${employeeId}).\n\nThanking you.`,
  },
  {
    id: 'FUEL_CLAIM_FORWARDING',
    title: 'Monthly Two-Wheeler Fuel Bill Forwarding (Annexure-III)',
    category: 'Allowances',
    defaultRecipient: 'The Sr. Supdt. of Post Offices (SSPOs), Kota Division, Kota - 324001',
    subject: 'Submission & Forwarding of Monthly Two-Wheeler Fuel Reimbursement Bill (Annexure-III)',
    buildBody: ({ name, designation, employeeId, beat, office, fromDate, toDate, daysCount, reasonOrDetails }) =>
      `Respected Sir/Madam,\n\nI, ${name} (${designation}, Emp ID: ${employeeId}), performing doorstep delivery duties in ${beat} under ${office}, hereby submit my monthly Two-Wheeler Fuel Reimbursement Bill (Annexure-III) for the period from ${fromDate} to ${toDate} (${daysCount} working days).\n\nAll accountable articles (Speed Post, Registered Letters, Parcels) invoiced in DSS/PDMS were duly processed through the Postman Mobile App (PMA). Details / Vehicle & KM Summary: ${reasonOrDetails || 'As per verified DSS & Annexure-III logbook attached'}.\n\nKindly arrange for verification and sanction of the admissible fuel allowance.\n\nThanking you.`,
  },
  {
    id: 'BYOD_ALLOWANCE_CLAIM',
    title: 'BYOD Smartphone & Internet Data Allowance Claim',
    category: 'Allowances',
    defaultRecipient: 'The Head Postmaster, Kota Head Office (NGM H.O.), Kota - 324001',
    subject: 'Claim for Monthly BYOD Mobile Device & Internet Data Allowance',
    buildBody: ({ name, designation, employeeId, beat, office, fromDate, toDate, reasonOrDetails }) =>
      `Respected Sir/Madam,\n\nI, ${name} (${designation}, Emp ID: ${employeeId}) posted at ${office} (${beat}), am using my personal Android smartphone with active mobile data exclusively for running departmental Postman Mobile App (PMA), IPPB MicroATM, and e-KYC operations from ${fromDate} to ${toDate}.\n\nDevice / Plan Reference: ${reasonOrDetails || 'Monthly Data Allowance ₹250 + BYOD Device Incentive ₹200 = ₹450 total claim'}.\n\nI request you to kindly process and credit the monthly BYOD allowance as per Directorate guidelines.\n\nThanking you.`,
  },
  {
    id: 'BEAT_KM_REVISION',
    title: 'Beat Territory & Sanctioned Daily KM Revision Request',
    category: 'Operations',
    defaultRecipient: 'The Asst. Supdt. of Post Offices (ASPOs), Kota East Sub-Division, Kota',
    subject: 'Request for physical verification & revision of sanctioned Beat KM for delivery',
    buildBody: ({ name, designation, employeeId, beat, office, reasonOrDetails }) =>
      `Respected Sir/Madam,\n\nI, ${name} (${designation}, Emp ID: ${employeeId}), assigned to ${beat} under ${office}, wish to submit that new residential colonies, multi-storey complexes, and commercial establishments have expanded significantly within my beat jurisdiction.\n\nOperational Grounds: ${reasonOrDetails || 'Daily odometer run consistently exceeds currently sanctioned fixed KM due to expanded sector coverage and parcel volume.'}\n\nIt is kindly requested that a beat inspection / distance reassessment may be arranged at your earliest convenience to revise the sanctioned daily KM.\n\nThanking you.`,
  },
  {
    id: 'OUTSIDER_DUTY_PERMISSION',
    title: 'Substitute / Outsider Duty Arrangement & Sanction',
    category: 'Operations',
    defaultRecipient: 'The Asst. Supdt. of Post Offices (ASPOs), Kota East Sub-Division, Kota',
    subject: 'Request for sanction of Outsider / Substitute arrangement on leave vacancy',
    buildBody: ({ name, designation, employeeId, beat, office, fromDate, toDate, daysCount, reasonOrDetails, substituteName }) =>
      `Respected Sir/Madam,\n\nIn reference to ${beat} under ${office} remaining vacant/unmanned during ${fromDate} to ${toDate} (${daysCount} day(s)) on account of ${reasonOrDetails || 'sanctioned leave / training deputation of regular incumbent'}, it is submitted that daily mail and accountable article delivery is essential for public service continuity.\n\nProposed Substitute / Outsider Official: ${substituteName || 'Eligible local substitute verified by Sub-Postmaster'}. Submitted by ${name} (Emp ID: ${employeeId}). Kindly accord ex-post-facto / prior sanction for engaging the substitute as per departmental norms.\n\nThanking you.`,
  },
  {
    id: 'TRANSFER_REQUEST',
    title: 'Transfer / Mutual Beat Re-allocation Request',
    category: 'Equipment & HR',
    defaultRecipient: 'The Sr. Supdt. of Post Offices (SSPOs), Kota Division, Kota - 324001',
    subject: 'Request for Rotational / Compassionate Transfer or Beat Posting Review',
    buildBody: ({ name, designation, employeeId, beat, office, reasonOrDetails }) =>
      `Respected Sir/Madam,\n\nWith due respect, I, ${name} (${designation}, Employee ID: ${employeeId}), presently working at ${office} (${beat}), submit this request for your sympathetic consideration.\n\nGrounds for Request: ${reasonOrDetails || 'Family health responsibilities and daily commuting distance from residence.'}\n\nI kindly request transfer / adjustment at the time of upcoming rotational postings, subject to administrative convenience.\n\nThanking you.`,
  },
  {
    id: 'PMA_UNIFORM_REQUEST',
    title: 'PMA Device / Uniform / Postal Delivery Bag Issue',
    category: 'Equipment & HR',
    defaultRecipient: 'The Sub-Postmaster (SPM), Dadabari S.O., Kota - 324009',
    subject: 'Requisition for Issue / Replacement of PMA Device, Delivery Bag & Uniform',
    buildBody: ({ name, designation, employeeId, beat, office, reasonOrDetails }) =>
      `Respected Sir/Madam,\n\nI, ${name} (${designation}, Emp ID: ${employeeId}), delivering mail in ${beat} under ${office}, submit that ${reasonOrDetails || 'the existing delivery bag / raincoat / battery backup of handheld device requires urgent replacement to ensure uninterrupted 100% PMA delivery synchronization'}.\n\nKindly arrange for supply/replacement from Divisional Store at the earliest.\n\nThanking you.`,
  },
];

export default function OfficialApplicationsView() {
  const { userProfile } = useAuth();
  const currentStaff = staffPermissionService.getActiveSession() || userProfile;
  const isSuperAdmin = staffPermissionService.isSuperAdmin(currentStaff);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('CASUAL_LEAVE');
  const activeTemplate = useMemo(
    () => APPLICATION_TEMPLATES.find((t) => t.id === selectedTemplateId) || APPLICATION_TEMPLATES[0],
    [selectedTemplateId]
  );

  const todayIso = new Date().toISOString().split('T')[0];
  const [recipient, setRecipient] = useState<string>(activeTemplate.defaultRecipient);
  const [subject, setSubject] = useState<string>(activeTemplate.subject);
  const [applicantName, setApplicantName] = useState<string>(currentStaff?.name || 'Mahendra Kumar Meena');
  const [applicantDesig, setApplicantDesig] = useState<string>(
    currentStaff?.designationType || currentStaff?.designation || 'Postman'
  );
  const [applicantEmpId, setApplicantEmpId] = useState<string>(currentStaff?.employeeId || '50457421');
  const [applicantBeat, setApplicantBeat] = useState<string>(currentStaff?.beat || 'Beat 2');
  const [applicantOffice, setApplicantOffice] = useState<string>(
    `${currentStaff?.subOffice || 'Dadabari S.O.'} (${currentStaff?.officePincode || '324009'})`
  );
  const [fromDate, setFromDate] = useState<string>(todayIso);
  const [toDate, setToDate] = useState<string>(todayIso);
  const [reasonOrDetails, setReasonOrDetails] = useState<string>('');
  const [substituteName, setSubstituteName] = useState<string>('');
  const [customBody, setCustomBody] = useState<string>('');

  const [savedApps, setSavedApps] = useState<SavedOfficialApplication[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [searchLedger, setSearchLedger] = useState('');
  const [ledgerPage, setLedgerPage] = useState(1);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync user context when profile changes
  useEffect(() => {
    if (currentStaff) {
      setApplicantName(currentStaff.name || 'Postal Staff');
      setApplicantDesig(currentStaff.designationType || currentStaff.designation || 'Postman');
      setApplicantEmpId(currentStaff.employeeId || currentStaff.id || '50457421');
      setApplicantBeat(currentStaff.beat || 'Beat 2');
      setApplicantOffice(
        `${currentStaff.subOffice || 'Dadabari S.O.'} (${currentStaff.officePincode || '324009'})`
      );
    }
  }, [currentStaff?.id, currentStaff?.email]);

  const daysCount = useMemo(() => {
    if (!fromDate || !toDate) return 1;
    const d1 = new Date(fromDate).getTime();
    const d2 = new Date(toDate).getTime();
    if (isNaN(d1) || isNaN(d2)) return 1;
    return Math.max(1, Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
  }, [fromDate, toDate]);

  // Regenerate draft text whenever template or form inputs change
  useEffect(() => {
    setRecipient(activeTemplate.defaultRecipient);
    setSubject(activeTemplate.subject);
    setCustomBody(
      activeTemplate.buildBody({
        name: applicantName,
        designation: applicantDesig,
        employeeId: applicantEmpId,
        beat: applicantBeat,
        office: applicantOffice,
        fromDate,
        toDate,
        daysCount,
        reasonOrDetails,
        substituteName,
      })
    );
  }, [
    selectedTemplateId,
    applicantName,
    applicantDesig,
    applicantEmpId,
    applicantBeat,
    applicantOffice,
    fromDate,
    toDate,
    daysCount,
    reasonOrDetails,
    substituteName,
  ]);

  const persistApps = (list: SavedOfficialApplication[]) => {
    setSavedApps(list);
    try {
      localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  const generateApplicationPdf = (app: {
    refNo: string;
    recipient: string;
    subject: string;
    body: string;
    applicantName: string;
    applicantDesignation: string;
    applicantId: string;
    beatNo: string;
    officeName: string;
    createdAt: string;
  }) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('DEPARTMENT OF POSTS, INDIA', 105, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${app.officeName} · Ref: ${app.refNo}`, 105, 24, { align: 'center' });
    doc.line(18, 28, 192, 28);

    let y = 38;
    doc.setFontSize(10.5);
    doc.text(`Date: ${app.createdAt}`, 192, y, { align: 'right' });
    doc.text('To,', 18, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    const recipLines = doc.splitTextToSize(app.recipient, 165);
    doc.text(recipLines, 22, y);
    y += recipLines.length * 5.5 + 4;

    doc.setFont('helvetica', 'bold');
    const subLines = doc.splitTextToSize(`Subject: ${app.subject}`, 174);
    doc.text(subLines, 18, y);
    y += subLines.length * 5.5 + 6;

    doc.setFont('helvetica', 'normal');
    const bodyLines = doc.splitTextToSize(app.body, 174);
    doc.text(bodyLines, 18, y);
    y += bodyLines.length * 5.5 + 16;

    if (y > 245) y = 245;
    doc.text('Yours faithfully,', 135, y);
    y += 14;
    doc.setFont('helvetica', 'bold');
    doc.text(app.applicantName, 135, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(`${app.applicantDesignation} (ID: ${app.applicantId})`, 135, y);
    y += 5;
    doc.text(`${app.beatNo} · ${app.officeName}`, 135, y);

    doc.line(18, 265, 192, 265);
    doc.setFontSize(9.5);
    doc.text('Remarks / Recommendation of Sub-Postmaster (SPM):', 18, 272);
    doc.text('Signature & Stamp', 192, 284, { align: 'right' });

    doc.save(`${app.refNo.replace(/[^A-Z0-9-]/gi, '_')}_${app.applicantName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleSaveAndDownload = (e: React.FormEvent) => {
    e.preventDefault();
    const refNo = `APP-KOTA-${Date.now().toString().slice(-6)}`;
    const record: SavedOfficialApplication = {
      id: `APP-${Date.now()}`,
      refNo,
      templateId: activeTemplate.id,
      templateTitle: activeTemplate.title,
      recipient,
      subject,
      body: customBody,
      applicantName,
      applicantId: applicantEmpId,
      applicantDesignation: applicantDesig,
      beatNo: applicantBeat,
      officeName: applicantOffice,
      fromDate,
      toDate,
      status: 'Submitted / Downloaded',
      createdAt: todayIso,
    };

    persistApps([record, ...savedApps]);
    generateApplicationPdf(record);
    setStatusMessage(`Application ${refNo} saved to Register & Official PDF downloaded!`);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleCopyText = () => {
    const fullLetter = `To,\n${recipient}\n\nSubject: ${subject}\n\n${customBody}\n\nYours faithfully,\n${applicantName}\n${applicantDesig} (Emp ID: ${applicantEmpId})\n${applicantBeat}, ${applicantOffice}\nDate: ${todayIso}`;
    navigator.clipboard.writeText(fullLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Scope ledger strictly by beat/staff for field users; global for Super Admin
  const scopedApps = useMemo(() => {
    return savedApps.filter((app) => {
      if (!isSuperAdmin) {
        const matchesOwnId = app.applicantId === applicantEmpId;
        const matchesBeat = staffPermissionService.matchesUserBeatScope(currentStaff, {
          beatNo: app.beatNo,
          assignedStaffName: app.applicantName,
          assignedStaffId: app.applicantId,
        });
        if (!matchesOwnId && !matchesBeat) return false;
      }
      if (searchLedger.trim()) {
        const q = searchLedger.toLowerCase();
        return (
          app.refNo.toLowerCase().includes(q) ||
          app.templateTitle.toLowerCase().includes(q) ||
          app.applicantName.toLowerCase().includes(q) ||
          app.subject.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [savedApps, isSuperAdmin, applicantEmpId, currentStaff, searchLedger]);

  const PAGE_SIZE = 5;
  const totalLedgerPages = Math.max(1, Math.ceil(scopedApps.length / PAGE_SIZE));
  const safeLedgerPage = Math.min(ledgerPage, totalLedgerPages);
  const paginatedApps = scopedApps.slice(
    (safeLedgerPage - 1) * PAGE_SIZE,
    safeLedgerPage * PAGE_SIZE
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="official-applications-view">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-red-700/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-amber-400/40 text-amber-300 text-xs font-bold">
              <ShieldCheck size={14} className="text-amber-400" />
              <span>Department of Posts · Official Correspondence &amp; Leave Generator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Official Staff Applications &amp; Request Letters
            </h1>
            <p className="text-xs sm:text-sm text-red-100/90 max-w-3xl">
              Pre-formatted India Post templates addressed to Sub-Postmaster, ASPOs, SSPOs, or Head Postmaster. Auto-fills your staff credentials and generates official printable A4 PDFs.
            </p>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-slate-950/60 border border-white/10 text-xs space-y-0.5 shrink-0">
            <div className="text-amber-300 font-bold">{applicantName}</div>
            <div className="font-mono text-slate-300">
              {applicantEmpId} · {applicantBeat}
            </div>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button type="button" onClick={() => setStatusMessage(null)} className="font-black px-2">
            ×
          </button>
        </div>
      )}

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Template Selector + Form */}
        <form
          onSubmit={handleSaveAndDownload}
          className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div>
            <h2 className="text-base font-black text-slate-900">1. Choose Application Template</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5">
              {APPLICATION_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    selectedTemplateId === tpl.id
                      ? 'bg-red-800 text-white border-red-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase ${selectedTemplateId === tpl.id ? 'text-amber-300' : 'text-red-700'}`}>
                    {tpl.category}
                  </div>
                  <div className="text-xs font-bold mt-0.5 leading-snug">{tpl.title}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
            <h2 className="text-base font-black text-slate-900">2. Customize Recipient &amp; Details</h2>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Addressed To (Superior Authority) *</label>
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
              >
                {RECIPIENT_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Application Subject *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">To Date ({daysCount}d)</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Specific Ground / Ref</label>
                <input
                  type="text"
                  value={reasonOrDetails}
                  onChange={(e) => setReasonOrDetails(e.target.value)}
                  placeholder="e.g. Urgent family ceremony / Vehicle RJ20"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Substitute / Relief Official (Optional)</label>
                <input
                  type="text"
                  value={substituteName}
                  onChange={(e) => setSubstituteName(e.target.value)}
                  placeholder="e.g. Govind Prasad (Postman)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Application Letter Content (Editable)</label>
              <textarea
                rows={7}
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed text-slate-900 font-serif"
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl font-black flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download size={15} />
                <span>Save &amp; Download Official PDF</span>
              </button>
            </div>
          </div>
        </form>

        {/* Right: Live A4 Print Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-md font-serif text-slate-900 space-y-5">
            <div className="flex items-center justify-between font-sans border-b border-slate-200 pb-3">
              <div>
                <div className="text-xs font-black text-red-800 uppercase tracking-wider">
                  Live A4 Application Preview
                </div>
                <div className="text-[11px] text-slate-500">Department of Posts, India · Kota Division</div>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Printer size={13} />
                <span>Print</span>
              </button>
            </div>

            <div className="text-right text-xs font-mono text-slate-600">Date: {todayIso}</div>

            <div className="text-sm space-y-1">
              <div>To,</div>
              <div className="font-bold pl-4">{recipient}</div>
            </div>

            <div className="text-sm font-bold underline underline-offset-4 decoration-slate-400">
              Subject: {subject}
            </div>

            <div className="text-sm leading-relaxed whitespace-pre-line text-justify">
              {customBody}
            </div>

            <div className="pt-8 flex justify-end text-sm">
              <div className="text-left space-y-0.5 min-w-[200px]">
                <div>Yours faithfully,</div>
                <div className="pt-6 font-bold font-sans">{applicantName}</div>
                <div className="text-xs font-sans text-slate-600">
                  {applicantDesig} (ID: {applicantEmpId})
                </div>
                <div className="text-xs font-sans text-slate-600">
                  {applicantBeat} · {applicantOffice}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Applications Tracker Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Submitted &amp; Tracked Applications Register ({scopedApps.length})
            </h2>
            <p className="text-xs text-slate-500">
              {isSuperAdmin
                ? 'Master Admin view: Review, mark approved, re-download, or clean up staff applications.'
                : 'Showing applications filed under your staff ID & assigned beat.'}
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchLedger}
              onChange={(e) => {
                setSearchLedger(e.target.value);
                setLedgerPage(1);
              }}
              placeholder="Search ref #, subject, name..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
            />
          </div>
        </div>

        {paginatedApps.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl">
            No applications generated yet. Fill out any template above and click &ldquo;Save &amp; Download Official PDF&rdquo;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[11px]">
                  <th className="py-2.5 px-3 font-bold">Ref &amp; Date</th>
                  <th className="py-2.5 px-3 font-bold">Applicant &amp; Beat</th>
                  <th className="py-2.5 px-3 font-bold">Template &amp; Recipient</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                  <th className="py-2.5 px-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                      <div className="font-bold text-slate-900">{app.refNo}</div>
                      <div className="text-[10px] text-slate-500">{app.createdAt}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{app.applicantName}</div>
                      <div className="text-[11px] text-red-700 font-mono">
                        {app.beatNo} · {app.applicantId}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="font-bold text-slate-800 truncate">{app.templateTitle}</div>
                      <div className="text-[11px] text-slate-500 truncate">{app.recipient}</div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          app.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1.5">
                      <button
                        type="button"
                        onClick={() => generateApplicationPdf(app)}
                        className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        PDF
                      </button>
                      {isSuperAdmin && app.status !== 'Approved' && (
                        <button
                          type="button"
                          onClick={() =>
                            persistApps(
                              savedApps.map((a) => (a.id === app.id ? { ...a, status: 'Approved' } : a))
                            )
                          }
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => persistApps(savedApps.filter((a) => a.id !== app.id))}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg cursor-pointer align-middle"
                          title="Delete Application Record (Super Admin)"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {scopedApps.length > PAGE_SIZE && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">
              Page {safeLedgerPage} of {totalLedgerPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safeLedgerPage <= 1}
                onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 border border-slate-300 rounded-lg font-bold disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft size={13} /> Prev
              </button>
              <button
                type="button"
                disabled={safeLedgerPage >= totalLedgerPages}
                onClick={() => setLedgerPage((p) => Math.min(totalLedgerPages, p + 1))}
                className="px-2.5 py-1 border border-slate-300 rounded-lg font-bold disabled:opacity-40 flex items-center gap-1"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
