import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  User,
  Lock,
  CheckCircle2,
  AlertCircle,
  Send,
  Search,
  Package,
} from 'lucide-react';
import { shortUrlService, PublicShortUrlRecord } from '../services/shortUrlService';
import { customerService } from '../services/customerService';
import {
  staffPermissionService,
  DEFAULT_STAFF_FALLBACK_PASSWORD,
} from '../services/staffPermissionService';
import { indiaPostBulkShowcaseService } from '../services/indiaPostBulkShowcaseService';
import { PublicInquiryStatusResult } from '../types/models';

export default function PublicShortLinkPortalPage() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();

  const [linkRecord, setLinkRecord] = useState<PublicShortUrlRecord | null>(null);
  const [portalMode, setPortalMode] = useState<
    'SELECT' | 'CUSTOMER_LEAD' | 'STAFF_LOGIN' | 'STAFF_DASHBOARD'
  >('SELECT');

  // Customer Lead Form State
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custService, setCustService] = useState('Speed Post / Express Parcel');
  const [custRequirement, setCustRequirement] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadSuccessId, setLeadSuccessId] = useState<string | null>(null);

  // Public Sanitized Status Lookup State
  const [statusRefId, setStatusRefId] = useState('');
  const [statusMobile, setStatusMobile] = useState('');
  const [statusResult, setStatusResult] = useState<PublicInquiryStatusResult | null>(null);

  // Staff Login State
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffAuthError, setStaffAuthError] = useState<string | null>(null);
  const [loggedInStaffName, setLoggedInStaffName] = useState('');

  const featuredProducts = indiaPostBulkShowcaseService.getPromotedProducts(false).slice(0, 3);

  useEffect(() => {
    if (shortCode) {
      const found = shortUrlService.resolveShortCode(shortCode);
      setLinkRecord(found);
      if (found && found.scope === 'CUSTOMER') {
        setPortalMode('CUSTOMER_LEAD');
      } else if (found && found.scope === 'STAFF') {
        setPortalMode('STAFF_LOGIN');
      }
    }
  }, [shortCode]);

  const handleCustomerLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError(null);
    const cleanMobile = custMobile.replace(/\D/g, '').slice(-10);
    if (custName.trim().length < 2) {
      setLeadError('Please enter your full name.');
      return;
    }
    if (cleanMobile.length !== 10) {
      setLeadError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const { inquiry } = customerService.submitCustomerInquiry({
      customerName: custName.trim(),
      mobile: cleanMobile,
      productInterested: custService,
      requirement: `Email: ${custEmail.trim() || 'N/A'} | ${custRequirement.trim() || 'India Post Public Short Link Inquiry'}`,
      address: custAddress.trim() || 'Dadabari S.O. Jurisdiction (PIN 324009)',
      preferredContact: 'Doorstep Visit',
      beatNo: 'Beat 2',
    });

    if (inquiry) {
      setLeadSuccessId(inquiry.ticketNumber || inquiry.id);
      setStatusRefId(inquiry.ticketNumber || inquiry.id);
      setCustName('');
      setCustMobile('');
      setCustEmail('');
      setCustRequirement('');
      setCustAddress('');
    }
  };

  const handleStatusLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const res = indiaPostBulkShowcaseService.lookupPublicInquiryStatus(statusRefId, statusMobile);
    setStatusResult(res);
  };

  const handleStaffLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffAuthError(null);
    const u = staffUsername.trim();
    const p = staffPassword.trim();

    if (!u || !p) {
      setStaffAuthError('Please enter both your Employee / Login ID and Password.');
      return;
    }

    const isEktaAdmin =
      u.toLowerCase() === 'ektamahenmeena@gmail.com' || u.toUpperCase() === 'OWNER-01';
    if (isEktaAdmin) {
      if (p === 'Ekta@Admin9460' || p === DEFAULT_STAFF_FALLBACK_PASSWORD) {
        setLoggedInStaffName('Ekta Meena (Master Admin)');
        setPortalMode('STAFF_DASHBOARD');
        return;
      }
      setStaffAuthError('Invalid Master Admin password.');
      return;
    }

    const staffProf = staffPermissionService.findStaffProfileByIdentifier(u);
    if (!staffProf) {
      setStaffAuthError('No active India Post staff profile matched that ID, email, or mobile.');
      return;
    }

    const expectedPassword =
      ((staffProf as unknown) as { password?: string }).password ||
      DEFAULT_STAFF_FALLBACK_PASSWORD;
    if (p !== expectedPassword) {
      setStaffAuthError('Incorrect password for the selected India Post staff account.');
      return;
    }

    setLoggedInStaffName(staffProf.name);
    setPortalMode('STAFF_DASHBOARD');
  };

  if (!linkRecord) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-xl font-black">Invalid or Expired Short Link</h1>
          <p className="text-xs text-slate-400">
            The short code <code className="text-amber-300 font-mono">/{shortCode}</code> does not
            exist or has been revoked by the administrator.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-xs cursor-pointer transition"
          >
            Return to India Post Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="text-sm font-black tracking-tight text-white">
              India Post — {linkRecord.brandName}
            </div>
            <div className="text-[11px] text-slate-400">
              Official Public Link • Code:{' '}
              <span className="font-mono text-amber-300">{linkRecord.shortCode}</span>
            </div>
          </div>
        </div>

        {linkRecord.scope === 'BOTH' && portalMode !== 'SELECT' && (
          <button
            type="button"
            onClick={() => setPortalMode('SELECT')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Switch Portal Mode
          </button>
        )}
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {linkRecord.scope === 'BOTH' && portalMode === 'SELECT' && (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <div className="w-16 h-16 bg-red-600/20 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400 mx-auto">
                  <ShieldCheck size={32} />
                </div>
                <h1 className="text-xl sm:text-2xl font-black">{linkRecord.label}</h1>
                <p className="text-xs text-slate-400">
                  Select India Post citizen inquiry or staff sign-in below:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setPortalMode('CUSTOMER_LEAD')}
                  className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/30 hover:border-blue-500 text-left space-y-2 transition cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
                    <User size={20} />
                  </div>
                  <div className="font-bold text-sm text-white">Citizen &amp; Bulk Customer Desk</div>
                  <div className="text-[11px] text-slate-400">
                    Submit postal scheme, bulk parcel, or product inquiries and track ticket status.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPortalMode('STAFF_LOGIN')}
                  className="p-5 rounded-2xl bg-gradient-to-br from-red-900/40 to-slate-900 border border-red-500/30 hover:border-red-500 text-left space-y-2 transition cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400 group-hover:scale-110 transition">
                    <Lock size={20} />
                  </div>
                  <div className="font-bold text-sm text-white">India Post Staff Sign-In</div>
                  <div className="text-[11px] text-slate-400">
                    Authenticate into scoped India Post beat operations and lead pipelines.
                  </div>
                </button>
              </div>
            </div>
          )}

          {portalMode === 'CUSTOMER_LEAD' && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-black text-white">
                  India Post Citizen &amp; Bulk Customer Inquiry
                </h2>
                <p className="text-xs text-slate-400">
                  Connected directly to Dadabari S.O. &amp; Kota Division Registry
                </p>
              </div>

              {leadSuccessId ? (
                <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
                  <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
                  <div className="font-bold text-sm text-emerald-300">
                    Inquiry Submitted Successfully!
                  </div>
                  <p className="text-xs text-slate-300 font-mono">
                    Reference ID: {leadSuccessId}
                  </p>
                  <p className="text-xs text-slate-400">
                    Assigned beat staff or office desk will contact you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setLeadSuccessId(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomerLeadSubmit} className="space-y-4">
                  {leadError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-xs font-semibold">
                      {leadError}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar Meena"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        10-Digit Mobile *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={custMobile}
                        onChange={(e) =>
                          setCustMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
                        }
                        placeholder="9829012345"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        placeholder="rajesh@gmail.com"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      India Post Service / Promoted Product *
                    </label>
                    <select
                      value={custService}
                      onChange={(e) => setCustService(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Speed Post / Express Parcel">
                        Speed Post / Express Parcel
                      </option>
                      <option value="IPPB Doorstep Banking & AEPS">
                        IPPB Doorstep Banking &amp; AEPS
                      </option>
                      <option value="PLI / RPLI Insurance">PLI / RPLI Insurance</option>
                      <option value="Sukanya Samriddhi / PPF / SSA">
                        Sukanya Samriddhi / PPF / SSA
                      </option>
                      <option value="Bulk Customer Dispatch & BNPL">
                        Bulk Customer Dispatch &amp; BNPL
                      </option>
                      <option value="MyStamp, Gangajal & Philately">
                        MyStamp, Gangajal &amp; Philately
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Specific Requirement / Address Details *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={custRequirement}
                      onChange={(e) => setCustRequirement(e.target.value)}
                      placeholder="Enter house/door no., colony, PIN code, or bulk parcel query..."
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black text-xs sm:text-sm cursor-pointer transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <Send size={15} />
                    <span>Submit Inquiry to India Post Desk</span>
                  </button>
                </form>
              )}

              {/* Promoted Bulk Customer Highlights */}
              {featuredProducts.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Package size={13} />
                    <span>Featured Bulk Customer Promotions</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {featuredProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">{p.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {p.bulkCustomerName} · PIN {p.pincode}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-amber-300 shrink-0">
                          {p.priceDisplay}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sanitized Public Status Lookup */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Search size={13} className="text-amber-400" />
                  <span>Track Existing Inquiry Status</span>
                </div>
                <form onSubmit={handleStatusLookup} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={statusRefId}
                    onChange={(e) => setStatusRefId(e.target.value)}
                    placeholder="Ticket ID (e.g. INQ-...)"
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={statusMobile}
                    onChange={(e) =>
                      setStatusMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    placeholder="Mobile or Last 4 digits"
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Check Status
                  </button>
                </form>

                {statusResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      statusResult.found
                        ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-200'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {statusResult.found ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="font-mono">{statusResult.referenceId}</span>
                          <span className="text-amber-300">{statusResult.status}</span>
                        </div>
                        <div className="text-[11px]">{statusResult.serviceOrProduct}</div>
                        <div className="text-[10px] text-slate-400">
                          PIN {statusResult.pincode} · Phone {statusResult.maskedPhone} ·{' '}
                          {statusResult.note}
                        </div>
                      </div>
                    ) : (
                      <div>{statusResult.note}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {portalMode === 'STAFF_LOGIN' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-black text-white">
                  India Post Staff Operations Sign-In
                </h2>
                <p className="text-xs text-slate-400">
                  Scoped to {linkRecord.brandName}
                </p>
              </div>

              {staffAuthError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-center">
                  {staffAuthError}
                </div>
              )}

              <form onSubmit={handleStaffLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Employee ID / Login ID / Mobile *
                  </label>
                  <input
                    type="text"
                    required
                    value={staffUsername}
                    onChange={(e) => setStaffUsername(e.target.value)}
                    placeholder="Enter Employee ID, email, or registered mobile"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black text-xs sm:text-sm cursor-pointer transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Lock size={15} />
                  <span>Authenticate &amp; Open Staff Operations</span>
                </button>
              </form>
            </div>
          )}

          {portalMode === 'STAFF_DASHBOARD' && (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white">
                  Welcome, {loggedInStaffName}
                </h2>
                <p className="text-xs text-slate-400">
                  Authenticated via Short Link{' '}
                  <code className="text-amber-300 font-mono">/{shortCode}</code>
                </p>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-left space-y-2">
                <div className="font-bold text-white">Scoped Operations Permissions:</div>
                <div className="text-slate-300">
                  • Organization: <b>India Post ({linkRecord.brandName})</b>
                </div>
                <div className="text-slate-300">
                  • Territory: <b>Dadabari S.O. (PIN 324009) · Beat 2</b>
                </div>
                <div className="text-slate-300">
                  • Sync Status:{' '}
                  <b>Connected to Common Data Centre &amp; Master Registry</b>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-xs cursor-pointer transition shadow-md"
                >
                  Open Full Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/leads')}
                  className="py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs cursor-pointer transition border border-slate-700"
                >
                  Manage Leads Pipeline
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
