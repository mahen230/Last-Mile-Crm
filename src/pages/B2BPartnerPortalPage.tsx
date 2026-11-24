import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Package,
  Store,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Search,
  Truck,
} from 'lucide-react';
import {
  PINCODE_OFFICE_HUBS,
  getPincodeHub,
  pincodeOperationsService,
} from '../services/pincodeOperationsService';
import {
  b2bPartnershipService,
  B2BInquiryTrack,
  B2BPartnershipApplication,
} from '../services/b2bPartnershipService';

const TRACK_OPTIONS: {
  id: B2BInquiryTrack;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  {
    id: 'BULK_BUYER',
    title: 'Bulk & Institutional Buyer',
    subtitle: 'Hostels, cafes, corporate pantries, schools & wholesale crates',
    icon: Package,
  },
  {
    id: 'FRANCHISE_PARTNER',
    title: 'Franchise & Delivery Hub Partner',
    subtitle: 'Operate brand counters & regional stocking hubs across Kota & Baran',
    icon: Building2,
  },
  {
    id: 'LOCAL_MERCHANT',
    title: 'Local Merchant Onboarding',
    subtitle: 'Sell groceries, pharmacy, apparel or QSR stock via Speed Post COD',
    icon: Store,
  },
];

const B2B_CATEGORY_OPTIONS = [
  'Daily Kirana & Bulk Ration',
  'Fresh Dairy, Bakery & QSR',
  'Electronics, Chargers & Smart Appliances',
  'Apparel, Footwear & Uniforms',
  'Medical, Pharmacy & Wellness',
  'EV Mobility, Batteries & Logistics',
  'Kota Doria Handloom & Artisanal Goods',
];

export default function B2BPartnerPortalPage() {
  const navigate = useNavigate();

  const [track, setTrack] = useState<B2BInquiryTrack>('LOCAL_MERCHANT');
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [targetPincode, setTargetPincode] = useState<string>(() =>
    pincodeOperationsService.getActivePincode()
  );
  const [category, setCategory] = useState<string>(B2B_CATEGORY_OPTIONS[0]);
  const [monthlyVolumeEstimate, setMonthlyVolumeEstimate] = useState('₹50,000 – ₹2,00,000 / month');
  const [requirements, setRequirements] = useState('');
  const [targetBrandSlug, setTargetBrandSlug] = useState<string>('');
  const [requestPortalAccess, setRequestPortalAccess] = useState<boolean>(true);
  const [portalPassword, setPortalPassword] = useState('');
  const [portalPasscode, setPortalPasscode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<B2BPartnershipApplication | null>(null);
  const [lookupQuery, setLookupQuery] = useState('');
  const [applications, setApplications] = useState<B2BPartnershipApplication[]>(() =>
    b2bPartnershipService.getApplications()
  );

  const selectedHub = useMemo(() => getPincodeHub(targetPincode), [targetPincode]);

  const filteredApplications = useMemo(() => {
    const q = lookupQuery.trim().toLowerCase();
    if (!q) return applications.slice(0, 6);
    return applications.filter(
      (a) =>
        a.referenceId.toLowerCase().includes(q) ||
        a.businessName.toLowerCase().includes(q) ||
        a.targetPincode.includes(q)
    );
  }, [applications, lookupQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const cleanPhone = contactPhone.replace(/\D/g, '').slice(-10);
    if (businessName.trim().length < 2 || contactName.trim().length < 2) {
      setFormError('Please provide both your Business Name and Authorized Contact Name.');
      return;
    }
    if (cleanPhone.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (requirements.trim().length < 8) {
      setFormError('Please describe your bulk supply, franchise, or catalog requirements.');
      return;
    }

    if (requestPortalAccess && portalPassword.trim().length > 0 && portalPassword.trim().length < 6) {
      setFormError('Portal Password must be at least 6 characters (or leave blank to set later).');
      return;
    }
    if (requestPortalAccess && portalPasscode.trim().length > 0 && !/^\d{4,6}$/.test(portalPasscode.trim())) {
      setFormError('Preferred Security Passcode must be 4 to 6 numeric digits (or leave blank).');
      return;
    }

    const created = b2bPartnershipService.submitApplication({
      track,
      businessName,
      contactName,
      contactPhone: cleanPhone,
      email,
      gstNumber,
      targetPincode,
      category,
      monthlyVolumeEstimate,
      requirements,
      targetBrandSlug: targetBrandSlug || undefined,
      requestPortalAccess,
      portalPassword: portalPassword.trim() || undefined,
      portalPasscode: portalPasscode.trim() || undefined,
    });

    setSubmittedApp(created);
    setApplications(b2bPartnershipService.getApplications());
    setRequirements('');
    setPortalPassword('');
    setPortalPasscode('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/95 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft size={14} />
              <span>Retail Storefront</span>
            </button>
            <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 whitespace-nowrap">
              XPOKART <span className="text-red-700">B2B &amp; Partner Desk</span>
            </span>
          </div>

          <a
            href={`https://api.whatsapp.com/send?phone=${selectedHub.whatsappPhone}&text=${encodeURIComponent(
              `Namaste XPOKART B2B Desk (PIN ${selectedHub.pincode} · ${selectedHub.officeName}),\nI am inquiring about a B2B Bulk Order / Merchant / Franchise Partnership.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
          >
            <MessageCircle size={14} />
            <span>WhatsApp Partner Desk</span>
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Hero Overview */}
        <section className="rounded-3xl bg-slate-950 text-white p-6 sm:p-10 border border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-300 font-semibold">
              <ShieldCheck size={15} />
              <span>Kota &amp; Baran Division Commercial Network</span>
              <span aria-hidden="true">·</span>
              <span>13 Regional Postal Delivery Hubs</span>
            </div>
            <h1
              className="text-2xl sm:text-4xl font-black tracking-tight text-white"
              style={{ textWrap: 'balance' }}
            >
              Wholesale Supply, Brand Franchise &amp; Merchant Partnership Portal
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Submit institutional bulk purchase inquiries, regional stocking partner applications,
              or local storefront onboarding requests across all 13 Kota and Baran pincode hubs.
            </p>
          </div>

          <div className="lg:col-span-4 bg-white/5 border border-white/15 rounded-2xl p-5 space-y-2.5 text-xs">
            <div className="text-amber-300 font-bold">Active Target Hub Preview</div>
            <div className="text-sm font-black text-white">
              PIN {selectedHub.pincode} · {selectedHub.officeName}
            </div>
            <div className="text-slate-300">
              Stocking Partner: <strong className="text-emerald-300">{selectedHub.localStockingPartner}</strong>
            </div>
            <div className="text-slate-400 pt-1 flex items-center gap-1.5">
              <Truck size={13} className="text-amber-400" />
              <span>{selectedHub.beatsCount} Postal Beats · Speed Post COD &amp; IPPB Settlement</span>
            </div>
          </div>
        </section>

        {/* Application Form + Track Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            {submittedApp ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-900 font-black text-lg">
                  <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
                  <span>Partnership Application Registered</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Thank you, <strong>{submittedApp.contactName}</strong>. Your inquiry for{' '}
                  <strong>{submittedApp.businessName}</strong> has been routed to{' '}
                  <strong>{submittedApp.officeName} (PIN {submittedApp.targetPincode})</strong> and{' '}
                  <strong>{submittedApp.localStockingPartner}</strong>.
                </p>
                <div className="p-4 bg-white rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="text-slate-500">Application Reference ID</div>
                    <div className="font-mono font-black text-base text-slate-900 tabular-nums">
                      {submittedApp.referenceId}
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono space-y-0.5 pt-1">
                      <div>
                        Routed Sector: <strong>{submittedApp.targetBrandName || 'Xpokart'}</strong>
                        {submittedApp.crmLeadId ? ` · CRM Lead: ${submittedApp.crmLeadId} (B2B_FORM)` : ''}
                      </div>
                      {submittedApp.pendingBrandCode && (
                        <div className="text-amber-700 font-semibold">
                          Pending Brand Login Code: {submittedApp.pendingBrandCode} (Queued for Master Admin Approval)
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://api.whatsapp.com/send?phone=${selectedHub.whatsappPhone}&text=${encodeURIComponent(
                        `Namaste XPOKART B2B Desk,\nApplication Ref: *${submittedApp.referenceId}*\nBusiness: ${submittedApp.businessName}\nTrack: ${submittedApp.track}\nHub: PIN ${submittedApp.targetPincode} (${submittedApp.officeName})\nCategory: ${submittedApp.category}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5"
                    >
                      <MessageCircle size={14} />
                      <span>Fast-Track on WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmittedApp(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-xs">
                <div className="space-y-2">
                  <label className="block font-black text-slate-900 uppercase tracking-wider">
                    1. Select Partnership or Bulk Track
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {TRACK_OPTIONS.map((opt) => {
                      const IconComp = opt.icon;
                      const active = track === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setTrack(opt.id);
                            setRequestPortalAccess(opt.id !== 'BULK_BUYER');
                          }}
                          className={`p-4 rounded-2xl border text-left transition cursor-pointer space-y-1.5 ${
                            active
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <IconComp
                            size={18}
                            className={active ? 'text-amber-400' : 'text-red-700'}
                          />
                          <div className="font-black text-xs">{opt.title}</div>
                          <div
                            className={`text-[11px] leading-snug ${
                              active ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            {opt.subtitle}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Business / Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Rajasthan Kirana Traders / Kota Hostel"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Authorized Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Mobile / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-Digit Mobile Number"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Target Postal Hub (13 Pincodes) *
                    </label>
                    <select
                      value={targetPincode}
                      onChange={(e) => setTargetPincode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    >
                      {PINCODE_OFFICE_HUBS.map((h) => (
                        <option key={h.pincode} value={h.pincode}>
                          PIN {h.pincode} · {h.officeName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Primary Product Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    >
                      {B2B_CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Estimated Monthly Volume
                    </label>
                    <select
                      value={monthlyVolumeEstimate}
                      onChange={(e) => setMonthlyVolumeEstimate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    >
                      <option value="₹25,000 – ₹50,000 / month">₹25,000 – ₹50,000 / month</option>
                      <option value="₹50,000 – ₹2,00,000 / month">₹50,000 – ₹2,00,000 / month</option>
                      <option value="₹2,00,000 – ₹10,00,000 / month">₹2,00,000 – ₹10,00,000 / month</option>
                      <option value="₹10,00,000+ / month">₹10,00,000+ / month (Enterprise)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Business Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="orders@company.in"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      GSTIN / Udyam Registration (Optional)
                    </label>
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="08AABCU9603R1ZM"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Target Brand Sector Routing
                    </label>
                    <select
                      value={targetBrandSlug}
                      onChange={(e) => setTargetBrandSlug(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    >
                      <option value="">Auto-Detect from Category</option>
                      <option value="xpokart">Xpokart (Marketplace &amp; Merchants)</option>
                      <option value="xpeedo-ev">Xpeedo EV (Mobility &amp; Fleet)</option>
                      <option value="xpeedo-logistics">Xpeedo Logistics (Dispatch &amp; Courier)</option>
                      <option value="india-post">India Post (Postal &amp; COD Hubs)</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer w-full">
                      <input
                        type="checkbox"
                        checked={requestPortalAccess}
                        onChange={(e) => setRequestPortalAccess(e.target.checked)}
                        className="mt-0.5 accent-red-700"
                      />
                      <span className="text-[11px] font-semibold text-slate-700 leading-snug">
                        Request Brand / Partner Portal Login Access (queued for Master Admin approval)
                      </span>
                    </label>
                  </div>
                </div>

                {requestPortalAccess && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Preferred Portal Password (Optional)
                      </label>
                      <input
                        type="password"
                        value={portalPassword}
                        onChange={(e) => setPortalPassword(e.target.value)}
                        placeholder="Min 6 chars (auto-default if blank)"
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">
                        Preferred 4–6 Digit Security PIN (Optional)
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        value={portalPasscode}
                        onChange={(e) => setPortalPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="4 to 6 digits (auto-generated if blank)"
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-mono tabular-nums"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Inquiry &amp; Stocking Requirements *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Specify SKUs, crate quantities, delivery frequency, or store address for verification..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black text-xs cursor-pointer transition shadow-sm"
                >
                  Submit B2B Inquiry &amp; Route to Hub {selectedHub.pincode}
                </button>
              </form>
            )}
          </div>

          {/* Right Sidebar: Application Lookup & Regional Coverage */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-xs text-xs">
              <div className="font-black text-sm text-slate-900">
                Track Submitted Inquiries
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder="Search Reference ID or Business..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {filteredApplications.length === 0 ? (
                <div className="py-6 text-center text-slate-500">
                  No B2B inquiries submitted on this device yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-red-700">{app.referenceId}</span>
                        <span className="font-bold text-emerald-700">{app.status}</span>
                      </div>
                      <div className="font-bold text-slate-900">{app.businessName}</div>
                      <div className="text-[11px] text-slate-500">
                        PIN {app.targetPincode} · {app.officeName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-2.5 shadow-xs text-xs">
              <div className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <MapPin size={15} className="text-red-700" />
                <span>13 Regional Postal Hubs Covered</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Kota (324001–324010), Kaithoon (325001), Ranpur (325003), and Baran (325205) are supported with automated Beat settlement.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
