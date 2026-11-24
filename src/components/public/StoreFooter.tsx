import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  MessageCircle,
  Truck,
  FileText,
  Clock,
  Lock,
  Crown,
  Building2,
} from 'lucide-react';
import { SupportedLanguage } from '../../utils/localization';
import { getPincodeHub } from '../../services/pincodeOperationsService';

interface StoreFooterProps {
  lang: SupportedLanguage;
  activePincode: string;
  onOpenStaffLogin?: () => void;
  onOpenCitizenModal?: () => void;
  onOpenTrackModal?: () => void;
}

export default function StoreFooter({
  lang: _lang,
  activePincode,
  onOpenStaffLogin,
  onOpenCitizenModal,
  onOpenTrackModal,
}: StoreFooterProps) {
  const activeHub = getPincodeHub(activePincode);
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <footer
      className="mt-16 bg-slate-950 text-slate-300 border-t border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
      id="xpokart-store-footer"
    >
      {/* Top Sovereign Trust Ribbon */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-slate-950 border-b border-red-800/60 px-5 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shrink-0">
              📮
            </div>
            <div>
              <div className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                <span>XPOKART · Sovereign Hyper-Local Storefront</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-700 text-white font-bold">
                  PIN {activePincode}
                </span>
              </div>
              <p className="text-[11px] text-amber-200">
                Department of Posts · Kota &amp; Baran Division Network
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-200 text-[11px]">
            <span className="flex items-center gap-1.5 font-bold">
              <ShieldCheck size={14} className="text-amber-400" />
              <span>100% Sovereign Guarantee</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 font-bold text-emerald-300">
              <Truck size={14} />
              <span>Flat ₹15 Speed Post Beat Delivery</span>
            </span>
            <span>·</span>
            <span className="font-mono text-amber-300 font-bold">13 Pincode Hubs</span>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Content Area */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 sm:py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
        {/* Column 1: Dynamic Regional Postal Hub & Stocking Partner */}
        <div className="space-y-3.5">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Active Regional Dispatch Hub
            </span>
            <h4 className="font-black text-sm text-white">
              {activeHub.officeName}
            </h4>
          </div>

          <div className="space-y-2 text-slate-400 leading-relaxed text-[11px]">
            <p className="flex items-start gap-2">
              <MapPin size={14} className="text-red-400 shrink-0 mt-0.5" />
              <span>
                {activeHub.name}, {activeHub.division} — <strong className="text-white">PIN {activeHub.pincode}</strong>
              </span>
            </p>
            <p>
              Stocking Partner: <strong className="text-slate-200">{activeHub.localStockingPartner}</strong><br />
              Region: <strong className="text-slate-200">Southern Region (Ajmer)</strong><br />
              Circle: <strong className="text-slate-200">Rajasthan Circle, India Post</strong>
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1">
            <div className="text-slate-400">Office Working Hours:</div>
            <div className="font-mono text-slate-200 font-semibold flex items-center gap-1">
              <Clock size={12} className="text-amber-400" />
              <span>09:00 AM – 05:00 PM (Public Counters)</span>
            </div>
            <div className="text-emerald-400 font-medium">Beat Delivery: 07:00 AM – 07:30 PM</div>
          </div>
        </div>

        {/* Column 2: Sovereign Savings & IPPB Banking Desk */}
        <div className="space-y-3.5">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              India Post Sovereign
            </span>
            <h4 className="font-black text-sm text-white">
              Savings &amp; IPPB Digital Banking
            </h4>
          </div>

          <ul className="space-y-2 text-[11px] text-slate-300">
            <li>
              <button
                type="button"
                onClick={() => scrollTo('post-office-banking-store')}
                className="hover:text-amber-300 transition text-left flex items-center justify-between w-full"
              >
                <span>Sukanya Samriddhi Yojana (SSY)</span>
                <span className="font-mono text-emerald-400 font-bold">8.2% p.a.</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => scrollTo('post-office-banking-store')}
                className="hover:text-amber-300 transition text-left flex items-center justify-between w-full"
              >
                <span>Senior Citizen Savings (SCSS)</span>
                <span className="font-mono text-emerald-400 font-bold">8.2% p.a.</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => scrollTo('post-office-banking-store')}
                className="hover:text-amber-300 transition text-left flex items-center justify-between w-full"
              >
                <span>Postal Life Insurance (PLI Suraksha)</span>
                <span className="font-mono text-slate-400">Whole Life</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => scrollTo('post-office-banking-store')}
                className="hover:text-amber-300 transition text-left flex items-center justify-between w-full"
              >
                <span>IPPB ₹10 Lakh Accident Cover</span>
                <span className="font-mono text-amber-300 font-bold">₹399/Yr</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => scrollTo('post-office-banking-store')}
                className="hover:text-amber-300 transition text-left flex items-center justify-between w-full"
              >
                <span>Gangotri Gangajal Sacred Water</span>
                <span className="font-mono text-slate-400">₹35/Bottle</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Citizen Services & Logistics Links */}
        <div className="space-y-3.5">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              e-Mitra &amp; Logistics
            </span>
            <h4 className="font-black text-sm text-white">
              Citizen Desk &amp; Speed Post
            </h4>
          </div>

          <ul className="space-y-2 text-[11px] text-slate-300">
            <li>
              <button
                type="button"
                onClick={() => {
                  if (onOpenCitizenModal) onOpenCitizenModal();
                  else scrollTo('citizen-application-desk');
                }}
                className="hover:text-amber-300 transition text-left flex items-center gap-1.5"
              >
                <FileText size={12} className="text-red-400" />
                <span>Child Aadhaar (0–5 Yrs CELC Enrolment)</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  if (onOpenCitizenModal) onOpenCitizenModal();
                  else scrollTo('citizen-application-desk');
                }}
                className="hover:text-amber-300 transition text-left flex items-center gap-1.5"
              >
                <FileText size={12} className="text-red-400" />
                <span>PAN Card New / Correction (Form 49A)</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  if (onOpenCitizenModal) onOpenCitizenModal();
                  else scrollTo('citizen-application-desk');
                }}
                className="hover:text-amber-300 transition text-left flex items-center gap-1.5"
              >
                <FileText size={12} className="text-red-400" />
                <span>Ayushman Bharat Golden Card (PM-JAY)</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  if (onOpenCitizenModal) onOpenCitizenModal();
                  else scrollTo('citizen-application-desk');
                }}
                className="hover:text-amber-300 transition text-left flex items-center gap-1.5"
              >
                <FileText size={12} className="text-red-400" />
                <span>Rajasthan e-Gras Revenue Stamp Papers</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  if (onOpenTrackModal) onOpenTrackModal();
                  else scrollTo('hero-auto-slider');
                }}
                className="hover:text-amber-300 transition text-left flex items-center gap-1.5"
              >
                <Truck size={12} className="text-emerald-400" />
                <span>Track Speed Post COD Consignment</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Customer Support & Beat Delivery Coverage */}
        <div className="space-y-3.5">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Customer Concierge
            </span>
            <h4 className="font-black text-sm text-white">
              Kota &amp; Baran Express Support
            </h4>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-[11px]">
            <div>
              <div className="text-slate-400">Regional Hub Desk:</div>
              <div className="font-bold text-white flex items-center justify-between mt-0.5">
                <span className="truncate">{activeHub.officeName}</span>
                <span className="font-mono text-emerald-400 shrink-0">{activeHub.slaMinutes}-Min SLA</span>
              </div>
            </div>
            <div>
              <div className="text-slate-400">Service Coverage:</div>
              <div className="font-bold text-white flex items-center justify-between mt-0.5">
                <span>13 Pincode Office Hubs</span>
                <span className="font-mono text-amber-300">PIN {activeHub.pincode}</span>
              </div>
            </div>
            <div>
              <div className="text-slate-400">Cash on Delivery Fee:</div>
              <div className="font-bold text-slate-200 flex items-center justify-between mt-0.5">
                <span>Verified Speed Post COD</span>
                <span className="font-mono text-emerald-400">Flat ₹15</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={`https://api.whatsapp.com/send?phone=${activeHub.whatsappPhone}&text=${encodeURIComponent(
                `Namaste XPOKART Hub Desk (${activeHub.officeName} · PIN ${activeHub.pincode}), I need order assistance.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1 transition text-[11px]"
            >
              <MessageCircle size={12} />
              <span>WhatsApp Support</span>
            </a>
            <Link
              to="/b2b-partner"
              className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold flex items-center justify-center gap-1 transition text-[11px]"
            >
              <Building2 size={12} className="text-amber-400" />
              <span>B2B Partner Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright, B2B Portal & Staff Command Gateway */}
      <div className="bg-black/80 border-t border-slate-800 px-6 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © 2026 XPOKART · {activeHub.officeName} (PIN {activeHub.pincode}) · All Rights Reserved.
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/b2b-partner"
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition"
            >
              <Building2 size={11} />
              <span>B2B &amp; Wholesale Portal</span>
            </Link>
            <span>·</span>
            <button
              type="button"
              onClick={onOpenStaffLogin}
              className="hover:text-white transition flex items-center gap-1 cursor-pointer"
            >
              <Lock size={11} className="text-slate-500" />
              <span>Staff Login</span>
            </button>
            <span>·</span>
            <a
              href="/dev-command-secure-portal?token=xpokart_master_key_9460020640"
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
              title="Restricted Super Admin & Developer Portal"
            >
              <Crown size={12} />
              <span>Master Gateway</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
