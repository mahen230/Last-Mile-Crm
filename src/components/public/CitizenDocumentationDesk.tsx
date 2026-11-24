import React, { useState } from 'react';
import {
  FileText,
  CreditCard,
  UserCheck,
  HeartPulse,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  X,
  Copy,
  Check,
  Send,
  Calendar,
} from 'lucide-react';
import { SupportedLanguage, translate } from '../../utils/localization';
import { safeStorage } from '../../utils/safeStorage';

export interface CitizenService {
  id: string;
  code: string;
  title: string;
  category: string;
  govtFee: string;
  doorstepFee: string;
  sla: string;
  authority: string;
  icon: any;
  gradient: string;
  requiredDocuments: string[];
  description: string;
}

export const CITIZEN_SERVICES: CitizenService[] = [
  {
    id: 'pan-card',
    code: 'PAN-NSDL-49A',
    title: 'PAN Card New / Correction (Form 49A)',
    category: 'Income Tax & Identity',
    govtFee: '₹107 Govt Fee',
    doorstepFee: '₹15 Beat Fee',
    sla: '24-48 Hr Doorstep Biometric e-KYC',
    authority: 'NSDL / UTIITSL & Income Tax Dept',
    icon: CreditCard,
    gradient: 'from-blue-900 to-indigo-950',
    requiredDocuments: [
      'Aadhaar Card (with mobile linked or biometric match)',
      'Proof of Date of Birth (Birth Certificate / 10th Marks Sheet)',
      '2 Passport Size Color Photographs',
    ],
    description:
      'Doorstep biometric fingerprint e-KYC authentication. Instant e-PAN delivery within 48 hours and physical laminated card via Speed Post.',
  },
  {
    id: 'child-aadhaar',
    code: 'CELC-0-5-YRS',
    title: 'Child Aadhaar Enrolment (0–5 Yrs CELC)',
    category: 'UIDAI Sovereign Enrolment',
    govtFee: 'FREE (₹0 Govt Fee)',
    doorstepFee: '₹0 Sovereign Drive',
    sla: 'Same-Day Beat Postman Visit',
    authority: 'UIDAI & India Post Payment Bank',
    icon: UserCheck,
    gradient: 'from-emerald-900 to-teal-950',
    requiredDocuments: [
      'Child Birth Certificate (Original from Municipal / Panchayat)',
      "Parent's Aadhaar Card (Father or Mother present with child)",
      'Parent Mobile Number for OTP Verification',
    ],
    description:
      'Beat 2 Postman brings authorized UIDAI tablet to your residence. Facial photo and parent biometric linkage without finger scanning for toddlers.',
  },
  {
    id: 'ayushman-card',
    code: 'PMJAY-GOLDEN',
    title: 'Ayushman Bharat Golden Health Card (PM-JAY)',
    category: 'National Health Authority',
    govtFee: '₹30 Desk Registration',
    doorstepFee: '₹15 Beat Fee',
    sla: 'Instant Digital Card Issuance',
    authority: 'National Health Mission & NHA',
    icon: HeartPulse,
    gradient: 'from-rose-900 to-red-950',
    requiredDocuments: [
      'Ration Card / NFSA Category Eligibility Document',
      'Applicant Aadhaar Card with biometric verification',
      'Active Mobile Number for Jan Aadhaar / PM-JAY match',
    ],
    description:
      'Enables ₹5,00,000 per family per year cashless hospitalization coverage at all empanelled government and private multispeciality hospitals in Rajasthan.',
  },
  {
    id: 'e-stamp',
    code: 'EGRAS-RAJ-STAMP',
    title: 'Rajasthan e-Gras Legal Stamp Papers & e-Stamps',
    category: 'Registration & Stamp Dept',
    govtFee: 'Face Value (₹50 / ₹100 / ₹500)',
    doorstepFee: '₹15 Beat Fee',
    sla: 'Same-Morning Delivery',
    authority: 'Govt of Rajasthan Finance Dept',
    icon: FileText,
    gradient: 'from-amber-900 to-stone-950',
    requiredDocuments: [
      'First Party & Second Party Full Legal Names',
      'Purpose of Stamp (Rent Agreement, Affidavit, General Agreement)',
      'Government Photo ID Proof of Purchaser',
    ],
    description:
      'Authorized e-Gras Rajasthan revenue stamp certificates with unique GRN and barcode tracking. Issued on official watermarked legal stationary.',
  },
  {
    id: 'ssy-scss-booking',
    code: 'SSY-SCSS-SAVINGS',
    title: 'Sukanya Samriddhi (SSY 8.2%) & SCSS Account',
    category: 'Small Savings Schemes',
    govtFee: 'Initial Deposit (Min ₹250)',
    doorstepFee: '₹0 Free Postman Visit',
    sla: 'Doorstep Form Pickup & KYC',
    authority: 'Ministry of Finance & Department of Posts',
    icon: Landmark,
    gradient: 'from-purple-900 to-slate-950',
    requiredDocuments: [
      "Girl Child Birth Certificate (for SSY, age < 10 yrs)",
      "Senior Citizen Age Proof (for SCSS, age 60+ yrs)",
      'Guardian / Applicant PAN & Aadhaar Card',
      '2 Passport Size Photographs',
    ],
    description:
      'Doorstep account opening service with full sovereign sovereign backing, Sec 80C tax exemption, and passbook delivered straight to your home.',
  },
];

interface CitizenDocumentationDeskProps {
  lang: SupportedLanguage;
  activePincode: string;
}

export default function CitizenDocumentationDesk({
  lang,
  activePincode,
}: CitizenDocumentationDeskProps) {
  const [selectedService, setSelectedService] = useState<CitizenService | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [colonyAddress, setColonyAddress] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('Morning (10:00 AM - 01:00 PM)');
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !applicantName.trim() || !mobileNumber.trim()) return;

    const refCode = `XPO-${selectedService.id.toUpperCase().slice(0, 4)}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking = {
      refCode,
      serviceId: selectedService.id,
      serviceName: selectedService.title,
      applicantName: applicantName.trim(),
      mobileNumber: mobileNumber.trim(),
      colonyAddress: colonyAddress.trim() || 'Dadabari Colony',
      pincode: activePincode,
      preferredSlot,
      createdAt: new Date().toISOString(),
      status: 'SLOT_SCHEDULED',
    };

    try {
      const existing = JSON.parse(safeStorage.getItem('xpokart_citizen_applications') || '[]');
      safeStorage.setItem('xpokart_citizen_applications', JSON.stringify([newBooking, ...existing].slice(0, 25)));
    } catch {
      // ignore
    }

    setBookingRef(refCode);
  };

  const handleReset = () => {
    setBookingRef(null);
    setSelectedService(null);
    setApplicantName('');
    setMobileNumber('');
    setColonyAddress('');
  };

  return (
    <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-800" id="citizen-application-desk">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
            <ShieldCheck size={14} />
            <span>{translate('sec_citizen_desk', lang)} · PIN {activePincode}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Legal &amp; Government Citizen Documentation Desk
          </h3>
        </div>
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Biometric Doorstep Postman Visits across all 34 Dadabari Beats
        </div>
      </div>

      {/* Grid of 5 Citizen Documentation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CITIZEN_SERVICES.map((srv) => {
          const IconComp = srv.icon;
          return (
            <article
              key={srv.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:border-red-400 dark:hover:border-amber-400 p-5 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md transition group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${srv.gradient} text-white shadow-md group-hover:scale-105 transition`}>
                    <IconComp size={22} />
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-black text-emerald-700 dark:text-emerald-400 block">
                      {srv.govtFee}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {srv.doorstepFee}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-red-700 dark:text-red-400 tracking-wider">
                    {srv.category}
                  </span>
                  <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-amber-400 transition leading-snug">
                    {srv.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {srv.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1 text-[11px]">
                  <div className="text-slate-400 font-semibold">Document Checklist:</div>
                  <ul className="text-slate-600 dark:text-slate-300 space-y-0.5">
                    {srv.requiredDocuments.slice(0, 2).map((doc, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                        <span className="truncate">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  {srv.sla}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedService(srv)}
                  className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
                >
                  <span>{translate('apply_now', lang)}</span>
                  <FileText size={12} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Citizen Booking Modal Drawer */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div
            className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            aria-label={`Book Doorstep Slot: ${selectedService.title}`}
          >
            {/* Modal Header */}
            <div className={`p-5 bg-gradient-to-r ${selectedService.gradient} text-white flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <selectedService.icon size={22} className="text-amber-300" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
                    {selectedService.authority}
                  </div>
                  <h3 className="font-black text-base text-white">
                    {selectedService.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer transition shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar text-xs">
              {bookingRef ? (
                /* Success Confirmation State */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 mx-auto flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 size={36} />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">
                      Doorstep Slot Confirmed!
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs max-w-sm mx-auto">
                      Your statutory request has been assigned to Dadabari S.O. Beat 2 Lead Postman.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 max-w-xs mx-auto space-y-2">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                      Application Reference ID
                    </div>
                    <div className="text-lg font-mono font-black text-red-700 dark:text-amber-400">
                      {bookingRef}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(bookingRef);
                        setCopiedRef(true);
                        setTimeout(() => setCopiedRef(false), 2000);
                      }}
                      className="px-3 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-600 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                    >
                      {copiedRef ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedRef ? 'Copied ID' : 'Copy Reference'}</span>
                    </button>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <a
                      href={`https://api.whatsapp.com/send?phone=919460020640&text=${encodeURIComponent(
                        `Namaste Dadabari S.O. Desk (PIN ${activePincode}),\nI have booked a Citizen Service Slot:\nReference: *${bookingRef}*\nService: ${selectedService.title}\nApplicant: ${applicantName} (Ph: ${mobileNumber})\nAddress: ${colonyAddress || 'Dadabari'}, PIN: ${activePincode}\nSlot: ${preferredSlot}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-xs"
                    >
                      <MessageCircle size={14} />
                      <span>Dispatch to Dadabari Desk</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                /* Interactive Form */
                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  {/* Required Documents Checklist Card */}
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1.5">
                    <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300">
                      Required Documents for Biometric Visit:
                    </div>
                    <ul className="text-slate-700 dark:text-slate-300 space-y-1">
                      {selectedService.requiredDocuments.map((doc, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        Applicant Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar Verma"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        Active Mobile Number (OTP Verified) *
                      </label>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="10-digit mobile (e.g. 9876543210)"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        Colony &amp; House Address (Dadabari PIN {activePincode})
                      </label>
                      <input
                        type="text"
                        value={colonyAddress}
                        onChange={(e) => setColonyAddress(e.target.value)}
                        placeholder="e.g. 4-B-12, Sector 4, Near Shastri Park"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        Preferred Postman Doorstep Time Slot
                      </label>
                      <select
                        value={preferredSlot}
                        onChange={(e) => setPreferredSlot(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                      >
                        <option>Morning (10:00 AM - 01:00 PM)</option>
                        <option>Afternoon (01:30 PM - 04:30 PM)</option>
                        <option>Evening Express (04:30 PM - 06:30 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-500">
                      Govt Fee: <strong className="text-slate-900 dark:text-white">{selectedService.govtFee}</strong>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition"
                    >
                      <Send size={13} />
                      <span>Confirm Doorstep Booking</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
