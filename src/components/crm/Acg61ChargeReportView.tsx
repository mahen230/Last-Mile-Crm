import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  User,
  Calendar,
  Clock,
  Building2,
  Copy,
  Check,
  ShieldCheck,
  ArrowLeftRight,
  Search,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { operationsService } from '../../services/operationsService';
import { staffPermissionService } from '../../services/staffPermissionService';
import { SpecialBillRecord } from '../../types/models';
import {
  Acg61ChargeReportData,
  downloadOfficialAcg61Pdf,
  formatToDottedDate,
} from '../../utils/acg61PdfGenerator';

export default function Acg61ChargeReportView() {
  const { userProfile } = useAuth();
  const currentStaff = staffPermissionService.getActiveSession() || userProfile;
  const isSuperAdmin = staffPermissionService.isSuperAdmin(currentStaff);
  const isSuperior =
    isSuperAdmin ||
    currentStaff?.role === 'ADMIN' ||
    currentStaff?.role === 'MASTER_ADMIN' ||
    currentStaff?.role === 'SUPER_ADMIN' ||
    /inspector|spm|postmaster|supervisor/i.test(currentStaff?.designation || '');

  // --- Office & Staff Detail Fields with Date & Noon Session ---
  const [relievedOfficerName, setRelievedOfficerName] = useState('MAHENDRA KUMAR MEENA');
  const [relievingOfficerName, setRelievingOfficerName] = useState('VACANT');
  const [reportDate, setReportDate] = useState('2026-06-04');
  const [noonSection, setNoonSection] = useState<'AM' | 'PM'>('PM'); // PM for afternoon, AM for forenoon

  // Office & Designation Details
  const [postName, setPostName] = useState('O/S POSTMAN');
  const [placeName, setPlaceName] = useState('DADABARI SO');
  const [divisionName, setDivisionName] = useState('KOTA DIVISION');
  const [headOfficeName, setHeadOfficeName] = useState('NGM H.O.');
  const [subDivisionName, setSubDivisionName] = useState('ASPO\'s KOTA EAST');
  const [authorityOrderNo, setAuthorityOrderNo] = useState('');
  const [copyToList, setCopyToList] = useState<string[]>([
    "The SSPO's KOTA DIVISION",
    "A/C BRANCH NGM H.O.",
    "ASPO's KOTA EAST",
    "PF of the official",
  ]);

  // Submission & Preview State
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [chargeReports, setChargeReports] = useState<SpecialBillRecord[]>([]);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerPage, setLedgerPage] = useState(1);
  const previewRef = useRef<HTMLDivElement>(null);

  const loadChargeReports = () => {
    const active = staffPermissionService.getActiveSession() || userProfile;
    const list = operationsService
      .getSpecialBills()
      .filter(
        (b) =>
          b.type === 'CHARGE_REPORT' &&
          staffPermissionService.matchesUserBeatScope(active, {
            beatNo: b.beatNo,
            assignedStaffName: b.employeeName,
            assignedStaffEmail: b.employeeEmail,
          })
      );
    setChargeReports(list);
  };

  useEffect(() => {
    loadChargeReports();
    const unsub = operationsService.subscribe(loadChargeReports);
    return () => unsub();
  }, [userProfile]);

  // Sync with current user profile if available
  useEffect(() => {
    if (userProfile?.name && relievedOfficerName === 'MAHENDRA KUMAR MEENA') {
      setRelievedOfficerName(userProfile.name);
    }
    if (userProfile?.assignedOffice && placeName === 'DADABARI SO') {
      setPlaceName(userProfile.assignedOffice.toUpperCase());
    }
  }, [userProfile]);

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedDotted = formatToDottedDate(reportDate);
    const sessionLabel = noonSection === 'PM' ? 'Afternoon (A/N)' : 'Forenoon (F/N)';

    // Persist to operationsService
    const created = operationsService.createSpecialBill({
      type: 'CHARGE_REPORT',
      title: `Form ACG-61: ${relievedOfficerName} → ${relievingOfficerName} (${placeName})`,
      employeeId: userProfile?.employeeId || '50457421',
      employeeName: relievedOfficerName,
      employeeEmail: userProfile?.email || 'Ektamahenmeena@gmail.com',
      beatNo: userProfile?.beat || 'Beat 2',
      officeName: placeName,
      fromDate: reportDate,
      toDate: reportDate,
      totalDays: 1,
      fixedKm: userProfile?.fixedKm || 30,
      totalAmount: 0,
      details: {
        formType: 'ACG-61',
        relievedOfficerName,
        relievingOfficerName,
        postName,
        placeName,
        transferDate: formattedDotted,
        noonSection,
        sessionType: sessionLabel,
        divisionName,
        headOfficeName,
        subDivisionName,
        authorityOrderNo,
        copyToList,
      },
    });

    setStatusMessage(`Form ACG-61 Charge Report generated! Record ID: ${created.billNumber}`);

    // Smooth scroll down to the preview and download button
    setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Download PDF Action
  const handleDownloadPdf = () => {
    const payload: Acg61ChargeReportData = {
      relievedOfficerName,
      relievingOfficerName,
      postName,
      placeName,
      date: reportDate,
      noonSection,
      divisionName,
      headOfficeName,
      subDivisionName,
      authorityOrderNo,
      copyToList,
    };
    downloadOfficialAcg61Pdf(payload);
    setStatusMessage('Official Form ACG-61 PDF downloaded successfully.');
  };

  // Copy certification text
  const handleCopyText = () => {
    const formattedDotted = formatToDottedDate(reportDate);
    const noonLabel = noonSection === 'PM' ? 'AFTERNOON' : 'FORENOON';
    const text = `Certified that the charge of the office Of ${postName} was made over by ${relievedOfficerName} to ${relievingOfficerName} at Place ${placeName} on the Date ${formattedDotted} ${noonLabel} in accordance with ${authorityOrderNo || ''}.`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const formattedDottedDate = formatToDottedDate(reportDate);
  const displayNoon = noonSection === 'PM' ? 'AFTERNOON' : 'FORENOON';

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>Department of Posts · Form ACG-61</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Form ACG-61: Certificate of Transfer of Charge
          </h1>
          <p className="text-red-100 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Fill in the candidate handover details (Relieved & Relieving Officers, Date, AM/PM session, and Office info) to generate and download the official departmental certificate.
          </p>
        </div>
      </div>

      {/* Status Toast */}
      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-black text-sm px-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Office & Staff Details with Date & Noon Input Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ArrowLeftRight className="text-red-700" size={22} />
              <span>Office & Staff Details (Charge Transfer)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter the Relieved Officer, Relieving Officer, Transfer Date, and Noon Session (AM/PM).
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-50 text-red-800 border border-red-200 self-start">
            Official ACG-61 Format
          </span>
        </div>

        {/* Staff Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Field 1: Relieved Officer Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} className="text-red-600" />
              <span>1. Relieved Officer Name (Handing Over)</span>
            </label>
            <input
              type="text"
              required
              value={relievedOfficerName}
              onChange={(e) => setRelievedOfficerName(e.target.value.toUpperCase())}
              placeholder="e.g. MAHENDRA KUMAR MEENA"
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 uppercase tracking-wide focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600 transition"
            />
            <span className="text-[11px] text-slate-400">
              Official whose charge is being relinquished.
            </span>
          </div>

          {/* Field 2: Relieving Officer Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} className="text-emerald-600" />
              <span>2. Relieving Officer Name (Taking Over)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={relievingOfficerName}
                onChange={(e) => setRelievingOfficerName(e.target.value.toUpperCase())}
                placeholder="e.g. VACANT or Candidate Name"
                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 uppercase tracking-wide focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600 transition"
              />
              <button
                type="button"
                onClick={() => setRelievingOfficerName('VACANT')}
                className={`px-3 py-2 text-xs font-black rounded-xl border transition cursor-pointer shrink-0 ${
                  relievingOfficerName === 'VACANT'
                    ? 'bg-amber-400 text-slate-950 border-amber-500'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                Set VACANT
              </button>
            </div>
            <span className="text-[11px] text-slate-400">
              Candidate or incoming officer. Click "Set VACANT" if charge is left vacant.
            </span>
          </div>
        </div>

        {/* Date & Noon Section (AM / PM) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Field 3: Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} className="text-red-600" />
              <span>3. Transfer Date</span>
            </label>
            <input
              type="date"
              required
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-sm font-bold font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600 transition"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>Formatted in Certificate:</span>
              <span className="font-mono font-bold text-slate-900">{formattedDottedDate}</span>
            </div>
          </div>

          {/* Field 4: Noon Section (PM for Afternoon, AM for Forenoon) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-amber-600" />
              <span>4. Noon Section (Session)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNoonSection('AM')}
                className={`p-2.5 rounded-xl border text-center transition font-bold text-xs flex flex-col items-center justify-center cursor-pointer ${
                  noonSection === 'AM'
                    ? 'bg-red-700 text-white border-red-800 shadow-md ring-2 ring-red-500/30'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm font-black">AM</span>
                <span className="text-[10px] opacity-90">Forenoon (F/N)</span>
              </button>

              <button
                type="button"
                onClick={() => setNoonSection('PM')}
                className={`p-2.5 rounded-xl border text-center transition font-bold text-xs flex flex-col items-center justify-center cursor-pointer ${
                  noonSection === 'PM'
                    ? 'bg-red-700 text-white border-red-800 shadow-md ring-2 ring-red-500/30'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm font-black">PM</span>
                <span className="text-[10px] opacity-90">Afternoon (A/N)</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-400">
              Select <strong className="text-slate-700">PM</strong> for afternoon or <strong className="text-slate-700">AM</strong> for forenoon.
            </span>
          </div>
        </div>

        {/* Office & Designation Context */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Building2 size={14} />
              <span>Office, Post & Distribution Details</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Rajasthan Circle</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Charge Office / Post Designation
              </label>
              <input
                type="text"
                value={postName}
                onChange={(e) => setPostName(e.target.value.toUpperCase())}
                placeholder="e.g. O/S POSTMAN"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 uppercase"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Place / Post Office Name
              </label>
              <input
                type="text"
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value.toUpperCase())}
                placeholder="e.g. DADABARI SO"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 uppercase"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Postal Division
              </label>
              <input
                type="text"
                value={divisionName}
                onChange={(e) => setDivisionName(e.target.value.toUpperCase())}
                placeholder="e.g. KOTA DIVISION"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 uppercase"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Head Office / A/C Branch
              </label>
              <input
                type="text"
                value={headOfficeName}
                onChange={(e) => setHeadOfficeName(e.target.value.toUpperCase())}
                placeholder="e.g. NGM H.O."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 uppercase"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                In Accordance With (Rule / Order Reference No. - Optional)
              </label>
              <input
                type="text"
                value={authorityOrderNo}
                onChange={(e) => setAuthorityOrderNo(e.target.value)}
                placeholder="e.g. Rule 166 / Memo No. B2/Transfer/2026"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-black text-sm uppercase tracking-wide transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 size={18} />
            <span>Generate Official Form ACG-61 Charge Report</span>
          </button>
        </div>
      </form>

      {/* Official Form ACG-61 Document Output (Clean Final Format) */}
      <div ref={previewRef} className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="text-red-700" size={24} />
              <span>Official ACG-61 Document Output</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Official Department of Posts layout matching standard government stationery.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {copySuccess ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copySuccess ? 'Copied Certificate Text!' : 'Copy Text'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* The ACG-61 Official Certificate Sheet (Final Clean Format - No Postmaster Grade-I stamp at bottom) */}
        <div className="bg-white rounded-3xl border border-slate-300 p-8 sm:p-12 lg:p-16 shadow-lg space-y-8 font-serif text-slate-900 relative">
          {/* Header */}
          <div className="flex justify-between items-start font-sans">
            <div className="text-xs font-bold text-slate-400">
              INDIA POST · FIELD OPERATIONS
            </div>
            <div className="text-base font-black text-slate-900 tracking-wider">
              ACG-61
            </div>
          </div>

          <div className="text-center space-y-1 font-sans">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Department Of Posts,India
            </h3>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Certificate of Transfer of Charge
            </p>
          </div>

          {/* Certificate Body Paragraph */}
          <div className="text-sm sm:text-base leading-loose pt-4 text-justify">
            Certified that the charge of the office Of{' '}
            <strong className="underline underline-offset-4 decoration-slate-400 font-black font-sans">
              {postName}
            </strong>{' '}
            was made over by{' '}
            <strong className="underline underline-offset-4 decoration-slate-400 font-black font-sans">
              {relievedOfficerName}
            </strong>{' '}
            to{' '}
            <strong className="underline underline-offset-4 decoration-slate-400 font-black font-sans">
              {relievingOfficerName}
            </strong>{' '}
            at Place{' '}
            <strong className="underline underline-offset-4 decoration-slate-400 font-black font-sans">
              {placeName}
            </strong>{' '}
            on the Date{' '}
            <strong className="underline underline-offset-4 decoration-slate-400 font-black font-mono">
              {formattedDottedDate}
            </strong>{' '}
            <strong className="underline underline-offset-4 decoration-slate-400 font-black font-sans">
              {displayNoon}
            </strong>{' '}
            in accordance with {authorityOrderNo || ''}.
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-12 pb-6 font-sans">
            <div className="space-y-2">
              <div className="h-10 flex items-end">
                <span className="font-serif italic text-base text-slate-700">
                  {relievedOfficerName.split(' ')[0]}
                </span>
              </div>
              <div className="border-t border-slate-700 pt-1">
                <div className="font-bold text-sm text-slate-900">Relieved Officer</div>
                <div className="text-xs text-slate-500">{relievedOfficerName}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-10 flex items-end">
                <span className="font-serif italic text-base text-slate-700">
                  {relievingOfficerName}
                </span>
              </div>
              <div className="border-t border-slate-700 pt-1">
                <div className="font-bold text-sm text-slate-900">Relieving Officer</div>
                <div className="text-xs text-slate-500">{relievingOfficerName}</div>
              </div>
            </div>
          </div>

          {/* Copy To Section */}
          <div className="pt-6 border-t border-slate-100 font-sans space-y-2 text-xs">
            <div className="font-bold text-slate-900 text-sm">Copy to:-</div>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1">
              {copyToList.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Download Button Section at Below Side */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <CheckCircle2 size={14} />
              <span>Report Ready for Official Submission</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Download Official Form ACG-61 PDF
            </h3>
            <p className="text-xs text-slate-400">
              Generates a print-ready Department of Posts A4 PDF document containing all certificate text, signatures, and copy-to list.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
            <button
              type="button"
              id="download-acg61-pdf-btn"
              onClick={handleDownloadPdf}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Download size={18} />
              <span>Download Form ACG-61 PDF</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer size={16} />
              <span>Print Form</span>
            </button>
          </div>
        </div>
      </div>

      {/* Systematic Stored & Tracked Charge Handover Reports Ledger */}
      {(() => {
        const q = ledgerSearch.trim().toLowerCase();
        const filtered = q
          ? chargeReports.filter(
              (r) =>
                r.billNumber.toLowerCase().includes(q) ||
                r.title.toLowerCase().includes(q) ||
                r.employeeName.toLowerCase().includes(q) ||
                r.beatNo.toLowerCase().includes(q) ||
                r.officeName.toLowerCase().includes(q)
            )
          : chargeReports;
        const pageSize = 5;
        const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
        const safePage = Math.min(ledgerPage, totalPages);
        const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

        return (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Tracked &amp; Stored Charge Handover Register ({filtered.length})
                </h2>
                <p className="text-xs text-slate-500">
                  All saved ACG-61 handover vouchers scoped by beat/office. Super Admins &amp; SPMs can verify or archive records.
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={ledgerSearch}
                  onChange={(e) => {
                    setLedgerSearch(e.target.value);
                    setLedgerPage(1);
                  }}
                  placeholder="Search ID, officer, beat..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            {pageRows.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No stored charge handover reports found. Submit the ACG-61 form above to archive a new handover certificate.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Voucher No.</th>
                      <th className="p-3">Handover Details</th>
                      <th className="p-3">Beat &amp; Office</th>
                      <th className="p-3">Transfer Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageRows.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-red-800 whitespace-nowrap">{rec.billNumber}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{rec.title}</div>
                          <div className="text-[11px] text-slate-500">
                            Relieved: {rec.details?.relievedOfficerName || rec.employeeName} → Relieving:{' '}
                            {rec.details?.relievingOfficerName || 'Vacant'}
                          </div>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-semibold text-slate-800">{rec.beatNo}</span>
                          <div className="text-[11px] text-slate-500">{rec.officeName}</div>
                        </td>
                        <td className="p-3 font-mono text-slate-700 whitespace-nowrap">{rec.fromDate}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              rec.status.toLowerCase().includes('verified') ||
                              rec.status.toLowerCase().includes('approved')
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                downloadOfficialAcg61Pdf({
                                  relievedOfficerName: rec.details?.relievedOfficerName || rec.employeeName,
                                  relievingOfficerName: rec.details?.relievingOfficerName || 'VACANT',
                                  postName: rec.details?.postName || 'O/S POSTMAN',
                                  placeName: rec.details?.placeName || rec.officeName,
                                  date: rec.fromDate,
                                  noonSection: rec.details?.noonSection || 'PM',
                                  authorityOrderNo: rec.details?.authorityOrderNo || '',
                                  divisionName: rec.details?.divisionName || 'KOTA DIVISION',
                                  headOfficeName: rec.details?.headOfficeName || 'NGM H.O.',
                                  subDivisionName: rec.details?.subDivisionName || "ASPO's KOTA EAST",
                                  copyToList: rec.details?.copyToList || [
                                    "The SSPO's KOTA DIVISION",
                                    'A/C BRANCH NGM H.O.',
                                    "ASPO's KOTA EAST",
                                    'PF of the official',
                                  ],
                                })
                              }
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                            >
                              <Download size={12} />
                              <span>PDF</span>
                            </button>
                            {isSuperior && !rec.status.toLowerCase().includes('verified') && (
                              <button
                                type="button"
                                onClick={() => {
                                  operationsService.updateSpecialBillStatus(rec.id, 'Verified by SPM');
                                  setStatusMessage(`Charge Report ${rec.billNumber} marked Verified by SPM.`);
                                }}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                              >
                                Verify
                              </button>
                            )}
                            {isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  operationsService.deleteSpecialBill(rec.id);
                                  setStatusMessage(`Deleted Charge Report ${rec.billNumber}.`);
                                }}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 cursor-pointer"
                                title="Delete Charge Report (Super Admin only)"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-slate-500">
                  Page {safePage} of {totalPages} ({filtered.length} records)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg font-bold text-slate-700 cursor-pointer"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setLedgerPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg font-bold text-slate-700 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
