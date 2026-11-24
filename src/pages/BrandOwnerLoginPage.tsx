import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { brandOwnerService } from '../services/brandOwnerService';
import { BrandOwnerSession, SanitizedBrandOwnerProfile } from '../types/brandOwner';

export default function BrandOwnerLoginPage() {
  const { brandSlug = '' } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<SanitizedBrandOwnerProfile[]>(() =>
    brandOwnerService.getAllBrandProfiles()
  );
  const [authMode, setAuthMode] = useState<'SIGN_IN' | 'APPLY'>('SIGN_IN');
  const [selectedSlug, setSelectedSlug] = useState<string>(brandSlug);
  const [loginId, setLoginId] = useState<string>(() => {
    if (!brandSlug) return '';
    const match = brandOwnerService.getBrandProfileBySlugOrKey(brandSlug);
    return match?.loginId || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [step, setStep] = useState<'CREDENTIALS' | 'PASSCODE'>(() => {
    const active = brandOwnerService.getActiveBrandOwnerSessionState();
    if (active.session && !active.session.passcodeVerified) {
      return 'PASSCODE';
    }
    return 'CREDENTIALS';
  });

  const [pendingSession, setPendingSession] = useState<BrandOwnerSession | null>(() => {
    const active = brandOwnerService.getActiveBrandOwnerSessionState();
    return active.session && !active.session.passcodeVerified ? active.session : null;
  });

  const [pinCode, setPinCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [singleSessionConflict, setSingleSessionConflict] = useState<{
    brandName: string;
    message: string;
  } | null>(null);

  // Brand Onboarding / Apply State
  const [regBrandName, setRegBrandName] = useState('');
  const [regOwnerName, setRegOwnerName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCategory, setRegCategory] = useState('Retail & Local Commerce');
  const [regPincode, setRegPincode] = useState('324009');
  const [regPassword, setRegPassword] = useState('');
  const [regPasscode, setRegPasscode] = useState('');
  const [regNotes, setRegNotes] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSubmitted, setRegSubmitted] = useState<{
    brandName: string;
    uniqueCode: string;
    loginId: string;
  } | null>(null);

  useEffect(() => {
    const unsub = brandOwnerService.subscribe(() => {
      setProfiles(brandOwnerService.getAllBrandProfiles());
      const state = brandOwnerService.getActiveBrandOwnerSessionState();
      if (state.invalidatedReason) {
        setErrorMsg(state.invalidatedReason);
        setStep('CREDENTIALS');
        setPendingSession(null);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const active = brandOwnerService.getActiveBrandOwnerSessionState();
    if (active.session && active.session.passcodeVerified) {
      navigate(`/brand-portal/${active.session.partnerSlug}`, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (brandSlug) {
      setSelectedSlug(brandSlug);
      const match = brandOwnerService.getBrandProfileBySlugOrKey(brandSlug);
      if (match) {
        setLoginId(match.loginId);
      }
    }
  }, [brandSlug]);

  const activeContextBrand = selectedSlug
    ? brandOwnerService.getBrandProfileBySlugOrKey(selectedSlug)
    : null;

  const handleSelectBrandShortcut = (profile: SanitizedBrandOwnerProfile) => {
    setAuthMode('SIGN_IN');
    setSelectedSlug(profile.partnerSlug);
    setLoginId(profile.loginId);
    setErrorMsg(null);
    setSingleSessionConflict(null);
  };

  const handleStep1Submit = (e: React.FormEvent, forceTakeover = false) => {
    e.preventDefault();
    setErrorMsg(null);
    setSingleSessionConflict(null);

    const res = brandOwnerService.authenticateBrandLogin(loginId, password, forceTakeover);
    if ('error' in res) {
      if (res.code === 'SINGLE_SESSION_CONFLICT' && res.canTakeover) {
        setSingleSessionConflict({
          brandName: res.brandName || 'this brand',
          message: res.error,
        });
      } else {
        setErrorMsg(res.error);
      }
      return;
    }

    setPendingSession(res.session);
    setPinCode('');
    setStep('PASSCODE');
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!pendingSession) {
      setStep('CREDENTIALS');
      setErrorMsg('Session expired. Please sign in with Login ID and Password.');
      return;
    }

    const res = brandOwnerService.verifyBrandPasscode(pendingSession.brandProfileId, pinCode);
    if ('error' in res) {
      setErrorMsg(res.error);
      return;
    }

    navigate(`/brand-portal/${res.session.partnerSlug}`, { replace: true });
  };

  const handleResetToStep1 = () => {
    brandOwnerService.signOutBrandOwner();
    setPendingSession(null);
    setPinCode('');
    setErrorMsg(null);
    setSingleSessionConflict(null);
    setStep('CREDENTIALS');
  };

  const handleApplyBrandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    const res = brandOwnerService.submitBrandRegistrationRequest({
      brandName: regBrandName,
      ownerName: regOwnerName,
      ownerContactNumber: regPhone,
      ownerEmail: regEmail,
      category: regCategory,
      pincode: regPincode,
      password: regPassword,
      passcode: regPasscode || undefined,
      notes: regNotes,
      sourceTag: 'BRAND_ONBOARDING',
    });
    if ('error' in res) {
      setRegError(res.error);
      return;
    }
    setRegSubmitted({
      brandName: res.profile.brandName,
      uniqueCode: res.profile.uniqueCode,
      loginId: res.profile.loginId,
    });
    setRegBrandName('');
    setRegOwnerName('');
    setRegPhone('');
    setRegEmail('');
    setRegPassword('');
    setRegPasscode('');
    setRegNotes('');
  };

  const renderStatusClass = (status: SanitizedBrandOwnerProfile['status']) => {
    if (status === 'ACTIVE') return 'bg-emerald-950 text-emerald-300 border border-emerald-800';
    if (status === 'PENDING_APPROVAL') return 'bg-amber-950 text-amber-300 border border-amber-800';
    return 'bg-red-950 text-red-300 border border-red-800';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6">
      <div className="max-w-4xl w-full mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Brand Context Panel */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-6 sm:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: activeContextBrand?.accentColor || '#2563EB' }}
              >
                <Building2 size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-mono uppercase tracking-wider text-blue-400">
                  Single Brand Portal
                </div>
                <h1 className="text-lg font-bold text-white truncate">
                  {activeContextBrand ? activeContextBrand.brandName : 'Brand Owner Gateway'}
                </h1>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Dedicated single-brand access with two-step credential and 4–6 digit security passcode
              verification. Each brand workspace stays strictly isolated.
            </p>

            {/* Brand Directory Quick Selector (Public Non-Sensitive Metadata Only) */}
            <div className="space-y-2 pt-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Select Brand Workspace
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {profiles.map((p) => {
                  const isSelected = activeContextBrand?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectBrandShortcut(p)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border transition flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 border-blue-500 text-white'
                          : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-xs shrink-0"
                            style={{ backgroundColor: p.accentColor }}
                          />
                          <span className="truncate">{p.brandName}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                          {p.uniqueCode} · {p.workspaceKey}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded shrink-0 ${renderStatusClass(
                          p.status
                        )}`}
                      >
                        {p.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <Link to="/staff-gateway" className="hover:text-white transition font-medium">
              Master Admin / Staff Gateway
            </Link>
            <Link
              to={activeContextBrand ? `/brand-access/${activeContextBrand.partnerSlug}` : '/brand-access'}
              className="hover:text-white transition font-medium text-blue-300"
            >
              Staff &amp; Customer Portal
            </Link>
            <Link to="/b2b-partner" className="hover:text-white transition font-medium">
              B2B Inquiry Desk
            </Link>
            <Link to="/login" className="hover:text-white transition font-medium">
              Citizen Portal
            </Link>
          </div>
        </div>

        {/* Right Authentication & Brand Onboarding Panel */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Mode Switcher (only when in Step 1) */}
            {step === 'CREDENTIALS' && (
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('SIGN_IN');
                    setRegError(null);
                  }}
                  className={`py-2 rounded-md font-semibold cursor-pointer transition ${
                    authMode === 'SIGN_IN'
                      ? 'bg-white text-slate-900 border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Brand Owner Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('APPLY');
                    setErrorMsg(null);
                    setSingleSessionConflict(null);
                  }}
                  className={`py-2 rounded-md font-semibold cursor-pointer transition ${
                    authMode === 'APPLY'
                      ? 'bg-white text-slate-900 border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Register / Onboard Brand
                </button>
              </div>
            )}

            {authMode === 'SIGN_IN' || step === 'PASSCODE' ? (
              <>
                {/* Step Progress Header */}
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <div className="text-[11px] font-mono uppercase text-slate-500">
                      {step === 'CREDENTIALS'
                        ? 'Step 1 of 2 · Brand Credentials'
                        : 'Step 2 of 2 · Security Passcode'}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                      {step === 'CREDENTIALS'
                        ? 'Sign in as Brand Owner'
                        : `Unlock ${pendingSession?.brandName || 'Brand Workspace'}`}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums">
                    <span
                      className={`px-2 py-1 rounded font-semibold ${
                        step === 'CREDENTIALS'
                          ? 'bg-blue-600 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      1. Login
                    </span>
                    <span className="text-slate-400">/</span>
                    <span
                      className={`px-2 py-1 rounded font-semibold ${
                        step === 'PASSCODE'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      2. PIN
                    </span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
                    <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {singleSessionConflict && (
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert size={16} className="text-amber-700 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="font-bold">Active Single-Session Lock Detected</div>
                        <p className="text-amber-900 leading-relaxed">{singleSessionConflict.message}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleStep1Submit(e, true)}
                        className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                      >
                        Terminate Previous Session &amp; Continue
                      </button>
                      <button
                        type="button"
                        onClick={() => setSingleSessionConflict(null)}
                        className="px-3 py-2 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {step === 'CREDENTIALS' ? (
                  <form onSubmit={(e) => handleStep1Submit(e, false)} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        Brand Login ID, Unique Code, Email, or 10-Digit Mobile *
                      </label>
                      <input
                        type="text"
                        required
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder="e.g. inpost.owner@brand.xpeedo.in, BRD-INPOST-01, or +91 98..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        Brand Account Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter brand owner password"
                          className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Your 4–6 digit numeric Security Passcode (PIN) is verified immediately in Step 2.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <KeyRound size={15} />
                      <span>Verify Password &amp; Proceed to PIN</span>
                      <ArrowRight size={15} />
                    </button>

                    {activeContextBrand && (
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-center">
                        <Link
                          to={`/brand-access/${activeContextBrand.partnerSlug}`}
                          className="text-[11px] font-semibold text-blue-700 hover:underline"
                        >
                          Staff &amp; Customer Portal →
                        </Link>
                        <Link
                          to={`/partner/login/${activeContextBrand.partnerSlug}`}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:underline"
                        >
                          Open Team / Partner Portal for {activeContextBrand.brandName} →
                        </Link>
                      </div>
                    )}
                  </form>
                ) : (
                  <form onSubmit={handleStep2Submit} className="space-y-4 text-xs">
                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                          {pendingSession?.brandName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          {pendingSession?.uniqueCode} · Owner: {pendingSession?.ownerName}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 shrink-0">
                        <CheckCircle2 size={14} /> Password Verified
                      </span>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        4–6 Digit Security Passcode (PIN) *
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        pattern="\d{4,6}"
                        maxLength={6}
                        required
                        autoFocus
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 4 to 6 digit numeric PIN"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono tracking-widest text-base tabular-nums focus:outline-none focus:border-blue-600"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Required to unlock your brand portal and sensitive store/customer actions.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Lock size={15} />
                        <span>Unlock Brand Workspace</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetToStep1}
                        className="py-2.5 px-4 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                      >
                        Switch Account
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : regSubmitted ? (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
                  <span>Brand Registration Queued for Approval</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  <strong>{regSubmitted.brandName}</strong> has been registered in the{' '}
                  <strong>Pending Brand Approvals</strong> queue and logged into CRM Leads for onboarding review.
                </p>
                <div className="p-3 bg-white rounded-lg border border-emerald-200 font-mono space-y-1 text-[11px] text-slate-800">
                  <div>Brand Code: <strong>{regSubmitted.uniqueCode}</strong></div>
                  <div>Login ID: <strong>{regSubmitted.loginId}</strong></div>
                  <div>Status: <strong className="text-amber-700">PENDING_APPROVAL</strong></div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginId(regSubmitted.loginId);
                      setRegSubmitted(null);
                      setAuthMode('SIGN_IN');
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegSubmitted(null)}
                    className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 font-semibold cursor-pointer"
                  >
                    Register Another Brand
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplyBrandSubmit} className="space-y-3.5 text-xs">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-base font-bold text-slate-900">Apply for a Brand Workspace</h2>
                  <p className="text-slate-500 mt-0.5">
                    Creates a pending Brand Login Profile for Master Admin activation and routes an onboarding lead to CRM.
                  </p>
                </div>

                {regError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
                    {regError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Brand / Store Name *</label>
                    <input
                      type="text"
                      required
                      value={regBrandName}
                      onChange={(e) => setRegBrandName(e.target.value)}
                      placeholder="e.g. Kota Agro Fresh"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Owner Full Name *</label>
                    <input
                      type="text"
                      required
                      value={regOwnerName}
                      onChange={(e) => setRegOwnerName(e.target.value)}
                      placeholder="Authorized owner name"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Registered Mobile *</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 or 10-digit mobile"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono tabular-nums text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Owner Email (Login ID) *</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="owner@brand.in"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Business Sector</label>
                    <input
                      type="text"
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value)}
                      placeholder="e.g. EV Mobility, Retail, Logistics"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={regPincode}
                      onChange={(e) => setRegPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="324009"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono tabular-nums text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Create Password (min 6) *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Preferred 4–6 Digit PIN (Optional)
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={regPasscode}
                      onChange={(e) => setRegPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Auto-generated if blank"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono tabular-nums text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Notes (Optional)</label>
                  <input
                    type="text"
                    value={regNotes}
                    onChange={(e) => setRegNotes(e.target.value)}
                    placeholder="Stores, beat territory, or catalog scope"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus size={15} />
                  <span>Submit Brand Registration Request</span>
                </button>
              </form>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-blue-600" />
              <span>Workspace Isolation &amp; Single-Session Protection Active</span>
            </span>
            <span className="font-mono">BRAND_OWNER</span>
          </div>
        </div>
      </div>
    </div>
  );
}
