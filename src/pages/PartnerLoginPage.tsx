import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, KeyRound, Lock, UserPlus } from 'lucide-react';
import { PartnerTeamRole } from '../types/models';
import {
  PartnerPublicBranding,
  partnerBrandService,
} from '../services/partnerBrandService';
import {
  WHITE_LABEL_DEPARTMENTS,
  whiteLabelMasterService,
} from '../services/whiteLabelMasterService';
import {
  PartnerBrandLogo,
  resolveBrandTheme,
} from '../components/common/PartnerBrandLogo';

type EntryTab = 'LOGIN' | 'REGISTER' | 'FORGOT';

const REQUESTABLE_ROLES: Array<{ value: PartnerTeamRole; label: string }> = [
  { value: 'STORE_MANAGER', label: 'Store Manager' },
  { value: 'SALES_EXECUTIVE', label: 'Sales Executive' },
  { value: 'CRM_OPERATOR', label: 'CRM Operator' },
  { value: 'SUPPORT_DESK', label: 'Support Desk' },
];

export default function PartnerLoginPage() {
  const { partnerSlug = '' } = useParams<{ partnerSlug: string }>();
  const navigate = useNavigate();
  const isClientPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/client');

  const getDestinationPath = (slug: string) =>
    isClientPath ? `/client/workspace/${slug}` : partnerBrandService.getPartnerWorkspacePath(slug);

  const [branding, setBranding] = useState<PartnerPublicBranding | null>(() =>
    partnerBrandService.getPartnerPublicBranding(partnerSlug)
  );
  const [activeTab, setActiveTab] = useState<EntryTab>('LOGIN');

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [singleSessionConflict, setSingleSessionConflict] = useState(false);

  // Registration Request State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDepartment, setRegDepartment] = useState<string>('CUSTOMERS');
  const [regRole, setRegRole] = useState<PartnerTeamRole>('CRM_OPERATOR');
  const [regStoreId, setRegStoreId] = useState('');
  const [regPasscode, setRegPasscode] = useState('');
  const [regNote, setRegNote] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessId, setRegSuccessId] = useState<string | null>(null);

  // Forgot Password State
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotMethod, setForgotMethod] = useState<'OTP' | 'ADMIN_RESET'>('OTP');
  const [forgotNote, setForgotNote] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotRequestId, setForgotRequestId] = useState<string | null>(null);
  const [forgotOtpPreview, setForgotOtpPreview] = useState<string | null>(null);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [forgotCompleted, setForgotCompleted] = useState(false);

  useEffect(() => {
    const syncBranding = () => {
      const next = partnerBrandService.getPartnerPublicBranding(partnerSlug);
      setBranding(next);
    };
    syncBranding();
    return partnerBrandService.subscribe(syncBranding);
  }, [partnerSlug]);

  useEffect(() => {
    const existingSession = partnerBrandService.getActivePartnerSession(partnerSlug);
    if (existingSession) {
      navigate(getDestinationPath(existingSession.partnerSlug), {
        replace: true,
      });
    }
  }, [partnerSlug, navigate]);

  useEffect(() => {
    const prevTitle = document.title;
    if (branding?.displayName) {
      document.title = `${branding.displayName} · ${isClientPath ? 'Client' : 'Workspace'} Login`;
    } else {
      document.title = isClientPath ? 'Client Login' : 'Workspace Login';
    }
    return () => {
      document.title = prevTitle;
    };
  }, [branding?.displayName, isClientPath]);

  const submitPartnerLogin = (forceTakeoverSession: boolean) => {
    setLoginError(null);
    setSingleSessionConflict(false);
    const result = partnerBrandService.authenticatePartnerMember(
      partnerSlug,
      loginIdentifier,
      loginPasscode,
      { forceTakeoverSession }
    );
    if ('error' in result) {
      setLoginError(result.error);
      if (result.code === 'SINGLE_SESSION_CONFLICT') {
        setSingleSessionConflict(true);
      }
      return;
    }
    navigate(getDestinationPath(result.session.partnerSlug), {
      replace: true,
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPartnerLogin(false);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const cleanName = regName.trim();
    const cleanPhone = regPhone.replace(/\D/g, '').slice(-10);
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!cleanName) {
      setRegError('Full name is required.');
      return;
    }
    if (cleanPhone.length !== 10 && !cleanEmail.includes('@')) {
      setRegError('Provide a valid 10-digit mobile number or email address.');
      return;
    }
    if (regPasscode.trim() && regPasscode.trim().length < 4) {
      setRegError('If provided, passcode must be at least 4 characters.');
      return;
    }

    const roleLabel =
      REQUESTABLE_ROLES.find((r) => r.value === regRole)?.label || regRole;
    const storeName = branding?.availableStores.find((s) => s.id === regStoreId)?.name;
    const combinedNotes = [
      storeName ? `Preferred Store: ${storeName}` : '',
      regNote.trim(),
    ]
      .filter(Boolean)
      .join(' · ');

    const unified = whiteLabelMasterService.submitRegistrationRequest({
      fullName: cleanName,
      mobile: cleanPhone,
      email: cleanEmail,
      brandSlug: branding?.partnerSlug || partnerSlug,
      department: regDepartment,
      roleInterest: roleLabel,
      allottedBeatOrArea: storeName || undefined,
      notes: combinedNotes || 'Submitted from white-label workspace login',
    });

    if (!unified.success || !unified.request) {
      setRegError(unified.message);
      return;
    }

    if (regPasscode.trim().length >= 4 && branding) {
      partnerBrandService.submitPartnerRegistrationRequest(branding.partnerSlug, {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        requestedRole: regRole,
        preferredStoreIds: regStoreId ? [regStoreId] : undefined,
        passcode: regPasscode.trim(),
        note: combinedNotes || undefined,
      });
    }

    setRegSuccessId(unified.request.id);
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegPasscode('');
    setRegNote('');
  };

  const resetForgotState = () => {
    setForgotError(null);
    setForgotRequestId(null);
    setForgotOtpPreview(null);
    setForgotMessage(null);
    setOtpInput('');
    setNewResetPassword('');
    setConfirmResetPassword('');
    setForgotCompleted(false);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    const res = whiteLabelMasterService.submitForgotPasswordRequest({
      identifier: forgotIdentifier,
      brandSlug: branding?.partnerSlug || partnerSlug,
      preferredMethod: forgotMethod,
      note: forgotNote,
    });
    if (!res.success || !res.request) {
      setForgotError(res.message);
      return;
    }
    setForgotRequestId(res.request.id);
    setForgotOtpPreview(res.otpIssued || null);
    setForgotMessage(res.message);
  };

  const handleForgotVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (!forgotRequestId) return;
    if (newResetPassword.trim().length < 4) {
      setForgotError('New password must be at least 4 characters.');
      return;
    }
    if (newResetPassword.trim() !== confirmResetPassword.trim()) {
      setForgotError('New password and confirmation do not match.');
      return;
    }
    const res = whiteLabelMasterService.verifyOtpAndResetPassword(
      forgotRequestId,
      otpInput,
      newResetPassword
    );
    if (!res.success) {
      setForgotError(res.message);
      return;
    }
    setForgotCompleted(true);
    setForgotMessage(res.message);
    setOtpInput('');
    setNewResetPassword('');
    setConfirmResetPassword('');
  };

  if (!branding) {
    const allPartners = partnerBrandService.getAllPartners().filter((p) => p.status === 'Active');
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-7 shadow-xl space-y-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center mx-auto border border-blue-200">
              <Lock size={22} />
            </div>
            <h1 className="text-xl font-black text-slate-900">Select Brand Workspace</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Choose your authorized brand or client workspace to sign in or submit a registration request.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Active Workspaces:
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allPartners.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    navigate(
                      isClientPath
                        ? `/client/login/${p.partnerSlug}`
                        : `/partner/login/${p.partnerSlug}`
                    )
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-blue-900 text-xs">
                      {p.displayName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {p.roleInSystem || p.category}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition">
                    Sign In →
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 text-center border-t border-slate-100">
            <Link
              to="/"
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
            >
              ← Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const theme = resolveBrandTheme(branding.accentColor);
  const accent = theme.accentColor;
  const blueprint = partnerBrandService.getHierarchyBlueprintForPartner(branding.partnerSlug);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div
        className="w-full max-w-md bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: theme.borderTint }}
      >
        <div className="h-1 w-full" style={{ backgroundColor: accent }} />
        {/* Minimal White-Label Brand Header */}
        <div
          className="px-6 py-6 border-b space-y-3"
          style={{
            backgroundColor: theme.surfaceTint,
            borderBottomColor: theme.borderTint,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <PartnerBrandLogo
                displayName={branding.displayName}
                monogram={branding.monogram}
                accentColor={accent}
                logoUrl={branding.logoUrl}
                logoPresetId={branding.logoPresetId}
                size="lg"
              />
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-slate-900 truncate">
                  {branding.displayName}
                </h1>
                <div
                  className="text-xs font-medium truncate"
                  style={{ color: theme.contrastText }}
                >
                  {branding.roleInSystem || branding.category}
                  {branding.tagline ? ` · ${branding.tagline}` : ''}
                </div>
              </div>
            </div>
            <Link
              to={`/brand/${branding.partnerSlug}`}
              className="px-2.5 py-1.5 rounded-lg bg-white/80 hover:bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 whitespace-nowrap shrink-0"
            >
              Storefront
            </Link>
          </div>

          <div className="px-3 py-2 rounded-lg bg-white/80 border border-slate-200/80 text-[11px] text-slate-600 flex flex-col gap-0.5">
            <div className="font-bold text-slate-800">{blueprint.blueprintName}</div>
            <div>{blueprint.defaultStateScope} · Strict Zero-Leakage Brand Workspace</div>
          </div>

          {branding.status !== 'Active' && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
              {branding.status === 'Pending'
                ? 'Workspace activation is currently PENDING_APPROVAL. Master Admin must approve this brand before sign-in unlocks.'
                : 'Access to this workspace is currently LOCKED or suspended by Master Admin.'}
            </div>
          )}

          {/* Clean Two-Mode Switcher: Login & Register */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-white/80 border border-slate-200/80 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setActiveTab('LOGIN');
                setLoginError(null);
              }}
              className={`py-2 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'LOGIN' || activeTab === 'FORGOT'
                  ? 'bg-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              style={
                activeTab === 'LOGIN' || activeTab === 'FORGOT'
                  ? { color: theme.contrastText }
                  : undefined
              }
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('REGISTER');
                setRegError(null);
              }}
              className={`py-2 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'REGISTER'
                  ? 'bg-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              style={activeTab === 'REGISTER' ? { color: theme.contrastText } : undefined}
            >
              Register
            </button>
          </div>
        </div>

        {/* Section Body */}
        <div className="p-6 text-xs">
          {activeTab === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium space-y-2">
                  <div>{loginError}</div>
                  {singleSessionConflict && (
                    <button
                      type="button"
                      onClick={() => submitPartnerLogin(true)}
                      className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                    >
                      Take Over Session on This Device
                    </button>
                  )}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Email, 10-Digit Mobile, Login ID, or Brand Code *
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="Enter email, 10-digit mobile, Login ID, or Brand Code"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">
                    Password or 4–6 Digit Workspace Passcode *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      resetForgotState();
                      setForgotIdentifier(loginIdentifier);
                      setActiveTab('FORGOT');
                    }}
                    className="text-[11px] font-semibold hover:underline cursor-pointer"
                    style={{ color: theme.contrastText }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={loginPasscode}
                  onChange={(e) => setLoginPasscode(e.target.value)}
                  placeholder="Enter password or 4–6 digit security passcode"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={branding.status !== 'Active'}
                className="w-full py-2.5 px-4 rounded-lg text-white font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: accent }}
              >
                Sign In to {branding.displayName}
              </button>
            </form>
          ) : activeTab === 'FORGOT' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <KeyRound size={15} style={{ color: theme.contrastText }} />
                    <span>Password &amp; Passcode Recovery</span>
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Request an instant verification code or send a reset ticket to Admin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetForgotState();
                    setActiveTab('LOGIN');
                  }}
                  className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={12} />
                  <span>Back</span>
                </button>
              </div>

              {forgotError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
                  {forgotError}
                </div>
              )}

              {forgotCompleted ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
                    <span>Password Reset Complete</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{forgotMessage}</p>
                  <button
                    type="button"
                    onClick={() => {
                      resetForgotState();
                      setActiveTab('LOGIN');
                    }}
                    className="px-4 py-2 rounded-lg text-white font-semibold cursor-pointer"
                    style={{ backgroundColor: accent }}
                  >
                    Return to Login
                  </button>
                </div>
              ) : forgotRequestId && forgotOtpPreview ? (
                <form onSubmit={handleForgotVerifyOtp} className="space-y-3.5">
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
                    <div className="font-semibold">{forgotMessage}</div>
                    <div className="text-[11px] font-mono">
                      Verification Code: <strong>{forgotOtpPreview}</strong>
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      6-Digit Verification Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 tabular-nums"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        New Password *
                      </label>
                      <input
                        type="password"
                        required
                        minLength={4}
                        value={newResetPassword}
                        onChange={(e) => setNewResetPassword(e.target.value)}
                        placeholder="Min 4 chars"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        required
                        minLength={4}
                        value={confirmResetPassword}
                        onChange={(e) => setConfirmResetPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-lg text-white font-semibold cursor-pointer"
                    style={{ backgroundColor: accent }}
                  >
                    Verify Code &amp; Update Password
                  </button>
                </form>
              ) : forgotRequestId ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <CheckCircle2 size={18} className="text-amber-700 shrink-0" />
                    <span>Recovery Ticket Logged</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {forgotMessage} (Ticket:{' '}
                    <span className="font-mono font-semibold">{forgotRequestId}</span>). An
                    administrator will verify and reset your credentials.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      resetForgotState();
                      setActiveTab('LOGIN');
                    }}
                    className="px-4 py-2 rounded-lg text-white font-semibold cursor-pointer"
                    style={{ backgroundColor: accent }}
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Registered Email, 10-Digit Mobile, Login ID, or Brand Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="Enter registered email, mobile, or login ID"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Recovery Method
                    </label>
                    <select
                      value={forgotMethod}
                      onChange={(e) => setForgotMethod(e.target.value as 'OTP' | 'ADMIN_RESET')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                    >
                      <option value="OTP">Instant Verification Code (OTP)</option>
                      <option value="ADMIN_RESET">Request Admin Passcode Reset</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={forgotNote}
                      onChange={(e) => setForgotNote(e.target.value)}
                      placeholder="Branch, employee ID, or verification remark"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-lg text-white font-semibold cursor-pointer"
                    style={{ backgroundColor: accent }}
                  >
                    Request Password Recovery
                  </button>
                </form>
              )}
            </div>
          ) : regSuccessId ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
                <span>Registration Request Submitted</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Your registration request for <strong>{branding.displayName}</strong> has been
                submitted for Admin review (Ref:{' '}
                <span className="font-mono font-semibold">{regSuccessId}</span> · Status:{' '}
                <span className="font-mono font-semibold">PENDING_APPROVAL</span>). Access remains
                pending until approved by an administrator.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setRegSuccessId(null);
                    setActiveTab('LOGIN');
                  }}
                  className="px-4 py-2 rounded-lg text-white font-semibold cursor-pointer"
                  style={{ backgroundColor: accent }}
                >
                  Go to Login
                </button>
                <button
                  type="button"
                  onClick={() => setRegSuccessId(null)}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 font-semibold cursor-pointer"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
                  {regError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@company.in"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department Interest
                  </label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                  >
                    {WHITE_LABEL_DEPARTMENTS.map((dept) => (
                      <option key={dept.key} value={dept.key}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Role Interest
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as PartnerTeamRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                  >
                    {REQUESTABLE_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {branding.availableStores.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assigned Store / Hub Preference
                  </label>
                  <select
                    value={regStoreId}
                    onChange={(e) => setRegStoreId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                  >
                    <option value="">Any Store in {branding.displayName}</option>
                    {branding.availableStores.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} (PIN {st.pincode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Preferred Passcode (Optional)
                </label>
                <input
                  type="password"
                  value={regPasscode}
                  onChange={(e) => setRegPasscode(e.target.value)}
                  placeholder="Optional 4+ char passcode (or issued on approval)"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={regNote}
                  onChange={(e) => setRegNote(e.target.value)}
                  placeholder="Territory, beat, branch, or onboarding note"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={branding.status === 'Suspended'}
                className="w-full py-2.5 px-4 rounded-lg text-white font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: accent }}
              >
                <UserPlus size={14} />
                <span>Submit Registration Request</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
