import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../components/auth/FirebaseAuthProvider';
import { staffPermissionService } from '../services/staffPermissionService';
import { brandOwnerService } from '../services/brandOwnerService';
import { partnerBrandService } from '../services/partnerBrandService';
import IndiaPostLogo from '../components/common/IndiaPostLogo';

type HomeLoginRole = 'admin' | 'brand' | 'partner' | 'staff' | 'developer';

const ROLE_OPTIONS: Array<{
  value: HomeLoginRole;
  label: string;
  summary: string;
}> = [
  {
    value: 'admin',
    label: 'Master Admin — India Post Owner & Control',
    summary: 'Full operational oversight, divisional KPIs, Bulk Customer Hub, and RBAC governance.',
  },
  {
    value: 'brand',
    label: 'Office / Hub Incharge — India Post Portal',
    summary: 'Single Office / Division Owner login with password and 4–6 digit security PIN unlock.',
  },
  {
    value: 'partner',
    label: 'Bulk Hub Coordinator — Showcase Workspace',
    summary: 'Scoped Bulk Customer catalog, dispatch inquiries, and beat-linked lead tracking.',
  },
  {
    value: 'staff',
    label: 'Staff — India Post All-Staff Single Sign-In',
    summary: 'Unified sign-in for India Post delivery, counter, IPPB, and field staff scoped to assigned office & beat.',
  },
  {
    value: 'developer',
    label: 'Developer — India Post Diagnostics & Master Editor',
    summary: 'System diagnostics, RBAC policy controls, backup auto-sync, and data migration tools.',
  },
];

export default function XpeedoHomeLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, signInWithPassword, signOut, error: authError, clearError } = useAuth();

  const [selectedRole, setSelectedRole] = useState<HomeLoginRole>('staff');
  const [identifier, setIdentifier] = useState('');
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // India Post Portal 2-step state
  const [brands] = useState(() =>
    brandOwnerService
      .getAllBrandProfiles()
      .filter(
        (b) =>
          b.status !== 'REJECTED' &&
          (b.partnerSlug === 'india-post' || b.workspaceKey === 'INDIA_POST')
      )
  );
  const [selectedBrandSlug, setSelectedBrandSlug] = useState<string>(
    brands[0]?.partnerSlug || 'india-post'
  );
  const [pendingBrandProfileId, setPendingBrandProfileId] = useState<string | null>(null);
  const [brandPin, setBrandPin] = useState('');
  const [brandConflict, setBrandConflict] = useState<string | null>(null);

  // Bulk Hub Partner state
  const [partners] = useState(() =>
    partnerBrandService
      .getAllPartners()
      .filter(
        (p) =>
          p.status === 'Active' &&
          (p.partnerSlug === 'india-post' || p.partnerSlug === 'bulk-customers')
      )
  );
  const [selectedPartnerSlug, setSelectedPartnerSlug] = useState<string>(
    partners[0]?.partnerSlug || 'india-post'
  );
  const [partnerConflict, setPartnerConflict] = useState(false);

  // Progressive lookup match for Staff SSO (never exposes open staff lists)
  const matchedStaffPreview = useMemo(() => {
    if (selectedRole !== 'staff') return null;
    const clean = identifier.trim();
    if (clean.length < 3) return null;
    const found = staffPermissionService.findStaffProfileByIdentifier(clean);
    if (!found) return null;
    const roleUpper = String(found.role || '').toUpperCase();
    if (['OWNER', 'MASTER_ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(roleUpper)) return null;
    if (found.status === 'Inactive' || found.permissions?.approvalStatus === 'Revoked') return null;
    return found;
  }, [selectedRole, identifier]);

  const brandSession = brandOwnerService.getActiveBrandOwnerSessionState().session;
  const partnerSession = partnerBrandService.getActivePartnerSession();

  useEffect(() => {
    if (
      userProfile &&
      (location.pathname === '/' || location.pathname === '/home' || location.pathname === '/login')
    ) {
      navigate('/dashboard', { replace: true });
    }
  }, [userProfile, location.pathname, navigate]);

  useEffect(() => {
    clearError();
    setErrorMsg(null);
    setInfoMsg(null);
    setBrandConflict(null);
    setPartnerConflict(false);
    setPendingBrandProfileId(null);
    setBrandPin('');
    setSecret('');

    if (selectedRole === 'admin') {
      setIdentifier('Ektamahenmeena@gmail.com');
    } else if (selectedRole === 'developer') {
      setIdentifier('DEV-01');
    } else {
      setIdentifier('');
    }
  }, [selectedRole, clearError]);

  const roleMeta = ROLE_OPTIONS.find((r) => r.value === selectedRole) || ROLE_OPTIONS[0];

  const handleActivateIndiaPostQuickEntry = (targetType: 'INDIA_POST_STAFF' | 'INDIA_POST_OWNER') => {
    setErrorMsg(null);
    setBrandConflict(null);
    setPartnerConflict(false);
    if (targetType === 'INDIA_POST_OWNER') {
      setSelectedRole('brand');
      setSelectedBrandSlug('india-post');
      const ipBrand = brands.find((b) => b.partnerSlug === 'india-post');
      setIdentifier(ipBrand?.loginId || 'BRD-INPOST-01');
      setSecret('');
      setInfoMsg('India Post Office / Division Owner selected. Enter password and 4–6 digit PIN.');
    } else {
      setSelectedRole('staff');
      setIdentifier('');
      setSecret('');
      setInfoMsg('India Post All-Staff Single Sign-In active. Enter your Employee ID, Mobile, or Email.');
    }
  };

  const handleBrandAuth = async (takeover = false) => {
    setErrorMsg(null);
    setBrandConflict(null);

    if (pendingBrandProfileId) {
      const pinRes = brandOwnerService.verifyBrandPasscode(pendingBrandProfileId, brandPin);
      if ('error' in pinRes) {
        setErrorMsg(pinRes.error);
        return;
      }
      navigate(`/brand-portal/${pinRes.session.partnerSlug}`, { replace: true });
      return;
    }

    const res = brandOwnerService.authenticateBrandLogin(identifier, secret, takeover);
    if ('error' in res) {
      if (res.code === 'SINGLE_SESSION_CONFLICT') {
        setBrandConflict(res.error);
      } else {
        setErrorMsg(res.error);
      }
      return;
    }

    setPendingBrandProfileId(res.session.brandProfileId);
    setInfoMsg(
      `Password verified for ${res.session.brandName}. Enter your 4–6 digit security PIN to unlock your workspace.`
    );
  };

  const handlePartnerAuth = async (forceTakeover = false) => {
    setErrorMsg(null);
    setPartnerConflict(false);
    const res = partnerBrandService.authenticatePartnerMember(
      selectedPartnerSlug,
      identifier,
      secret,
      { forceTakeoverSession: forceTakeover }
    );
    if ('error' in res) {
      if (res.code === 'SINGLE_SESSION_CONFLICT') {
        setPartnerConflict(true);
      }
      setErrorMsg(res.error);
      return;
    }
    navigate(partnerBrandService.getPartnerWorkspacePath(res.session.partnerSlug), {
      replace: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (selectedRole === 'brand') {
      await handleBrandAuth(false);
      return;
    }

    if (selectedRole === 'partner') {
      await handlePartnerAuth(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await signInWithPassword(identifier, secret);
      if (!ok) {
        setErrorMsg(
          authError ||
            'Authentication failed. Verify your Employee ID / Mobile / Email and password (default: Post@1234 or Employee ID).'
        );
        return;
      }

      const active = staffPermissionService.getActiveSession();
      if (!active) {
        setErrorMsg('Unable to initialize authenticated session.');
        return;
      }

      const roleUpper = String(active.role || '').toUpperCase();

      if (selectedRole === 'admin') {
        if (!['OWNER', 'MASTER_ADMIN', 'SUPER_ADMIN', 'ADMIN'].includes(roleUpper)) {
          await signOut();
          setErrorMsg(
            'This account does not have Master Admin privileges. Select Staff or Developer instead.'
          );
          return;
        }
        navigate('/dashboard', { replace: true });
        return;
      }

      if (selectedRole === 'developer') {
        if (!['DEVELOPER', 'MASTER_ADMIN', 'OWNER', 'SUPER_ADMIN'].includes(roleUpper)) {
          await signOut();
          setErrorMsg('This account does not have Developer / Master Admin access.');
          return;
        }
        navigate('/dashboard', { replace: true });
        return;
      }

      navigate('/dashboard', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedBrandObj = brands.find((b) => b.partnerSlug === selectedBrandSlug);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Minimal 3-Zone Top Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-8">
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <IndiaPostLogo size="sm" subtitle="Operations &amp; Bulk Hub" />
        </div>
        <div className="text-xs text-slate-500 hidden sm:block whitespace-nowrap">
          Last-Mile Postal Operations &amp; Bulk Customer Hub
        </div>
        <div className="flex items-center gap-3 shrink-0 text-xs">
          {userProfile ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold whitespace-nowrap shrink-0"
            >
              Resume Active Workspace
            </Link>
          ) : brandSession ? (
            <Link
              to={`/brand-portal/${brandSession.partnerSlug}`}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold whitespace-nowrap shrink-0"
            >
              Open {brandSession.brandName}
            </Link>
          ) : partnerSession ? (
            <Link
              to={`/partner/workspace/${partnerSession.partnerSlug}`}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold whitespace-nowrap shrink-0"
            >
              Open Showcase Workspace
            </Link>
          ) : (
            <Link
              to="/indiapost-portal"
              className="px-3.5 py-2 rounded-lg bg-[#991B1B] hover:bg-red-800 text-white font-semibold whitespace-nowrap shrink-0"
            >
              Public Bulk Showcase
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Identity & Role Architecture Column */}
          <div className="lg:col-span-5 bg-slate-900 text-white p-7 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <IndiaPostLogo size="md" variant="dark" subtitle="Department of Posts · India" />
              <div className="space-y-2">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Unified operations gateway for Master Admin, Divisional &amp; Office Incharges, Bulk Customer Showcase coordinators, and beat-scoped postal staff.
                </p>
              </div>

              {/* Direct India Post Single Sign-In Shortcut Card */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2.5 text-xs">
                <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
                  Quick Access · India Post Kota Division
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleActivateIndiaPostQuickEntry('INDIA_POST_STAFF')}
                    className="px-3 py-1.5 rounded-md bg-[#991B1B] hover:bg-red-800 text-white font-semibold cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Staff Single Sign-In
                  </button>
                  <button
                    type="button"
                    onClick={() => handleActivateIndiaPostQuickEntry('INDIA_POST_OWNER')}
                    className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-white font-semibold cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Division / Office Portal
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-2.5 border-t border-slate-800 text-xs">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Selected Access Scope
                </div>
                <div className="font-semibold text-white">{roleMeta.label}</div>
                <p className="text-slate-300 leading-relaxed">{roleMeta.summary}</p>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-medium text-white">
                <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
                <span>Progressive Credential Verification</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Staff directories are hidden on sign-in screens. Enter your Employee ID, Email, or Mobile to verify your post and beat assignment before entering your password.
              </p>
            </div>
          </div>

          {/* Right Login Form Column */}
          <div className="lg:col-span-7 p-7 sm:p-8 flex flex-col justify-center">
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Sign In to India Post Operations</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your India Post operational role and authenticate with your credentials.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {infoMsg && (
                <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900">
                  {infoMsg}
                </div>
              )}

              {brandConflict && (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                  <div>{brandConflict}</div>
                  <button
                    type="button"
                    onClick={() => void handleBrandAuth(true)}
                    className="px-3 py-1.5 rounded-md bg-slate-900 text-white font-semibold cursor-pointer whitespace-nowrap"
                  >
                    Terminate Other Device &amp; Sign In Here
                  </button>
                </div>
              )}

              {partnerConflict && (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                  <div>Active showcase coordinator session detected on another tab or device.</div>
                  <button
                    type="button"
                    onClick={() => void handlePartnerAuth(true)}
                    className="px-3 py-1.5 rounded-md bg-slate-900 text-white font-semibold cursor-pointer whitespace-nowrap"
                  >
                    Take Over Session on This Device
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* 5-ROLE DROPDOWN */}
                <div>
                  <label
                    htmlFor="indiapost-role-select"
                    className="block font-semibold text-slate-700 mb-1.5"
                  >
                    Access Role *
                  </label>
                  <select
                    id="indiapost-role-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as HomeLoginRole)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Portal Workspace Selector */}
                {selectedRole === 'brand' && !pendingBrandProfileId && brands.length > 0 && (
                  <div>
                    <label
                      htmlFor="indiapost-brand-select"
                      className="block font-semibold text-slate-700 mb-1.5"
                    >
                      Select India Post Workspace *
                    </label>
                    <select
                      id="indiapost-brand-select"
                      value={selectedBrandSlug}
                      onChange={(e) => {
                        setSelectedBrandSlug(e.target.value);
                        const matched = brands.find((b) => b.partnerSlug === e.target.value);
                        if (matched) {
                          setIdentifier(matched.loginId || matched.uniqueCode);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.partnerSlug}>
                          {b.brandName} ({b.uniqueCode} · {b.status})
                        </option>
                      ))}
                    </select>
                    {selectedBrandObj && (
                      <div className="mt-1 text-[11px] text-slate-500">
                        Login Code: <span className="font-mono">{selectedBrandObj.uniqueCode}</span> · Incharge: {selectedBrandObj.ownerName}
                      </div>
                    )}
                  </div>
                )}

                {/* Partner Showcase Selector */}
                {selectedRole === 'partner' && partners.length > 0 && (
                  <div>
                    <label
                      htmlFor="indiapost-partner-select"
                      className="block font-semibold text-slate-700 mb-1.5"
                    >
                      Select India Post Unit *
                    </label>
                    <select
                      id="indiapost-partner-select"
                      value={selectedPartnerSlug}
                      onChange={(e) => setSelectedPartnerSlug(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                    >
                      {partners.map((p) => (
                        <option key={p.id} value={p.partnerSlug}>
                          {p.displayName} ({p.roleInSystem || p.category})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedRole === 'brand' && pendingBrandProfileId ? (
                  <div>
                    <label
                      htmlFor="indiapost-brand-pin"
                      className="block font-semibold text-slate-700 mb-1.5"
                    >
                      4–6 Digit Security Passcode (PIN) *
                    </label>
                    <input
                      id="indiapost-brand-pin"
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      autoFocus
                      value={brandPin}
                      onChange={(e) => setBrandPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 4–6 digit security PIN"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono tracking-widest text-base tabular-nums text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label
                        htmlFor="indiapost-login-id"
                        className="block font-semibold text-slate-700 mb-1.5"
                      >
                        {selectedRole === 'brand'
                          ? 'Portal Login ID, Unique Code, Mobile, or Email *'
                          : selectedRole === 'partner'
                          ? 'Coordinator Email, 10-Digit Mobile, or Hub Code *'
                          : 'Employee ID, Official Email, or 10-Digit Mobile *'}
                      </label>
                      <input
                        id="indiapost-login-id"
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={
                          selectedRole === 'admin'
                            ? 'Ektamahenmeena@gmail.com or MASTER-ADMIN-01'
                            : selectedRole === 'developer'
                            ? 'DEV-01 or Ektamahenmeena@gmail.com'
                            : selectedRole === 'brand'
                            ? 'BRD-INPOST-01 or office.incharge@indiapost-portal.in'
                            : selectedRole === 'partner'
                            ? 'coordinator@indiapost-portal.in or 10-digit mobile'
                            : 'Employee ID (e.g. 50457421), 10-digit mobile, or email'
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    {/* Progressive Verified Name + Post/Beat Badge for Staff SSO */}
                    {selectedRole === 'staff' && identifier.trim().length >= 3 && (
                      <div className="p-3 rounded-lg border bg-slate-50 border-slate-200">
                        {matchedStaffPreview ? (
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                              <span>{matchedStaffPreview.name}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[11px]">
                              {matchedStaffPreview.designationType || matchedStaffPreview.role} ·{' '}
                              {matchedStaffPreview.subOffice || 'Dadabari S.O.'} ·{' '}
                              {matchedStaffPreview.beat || 'Assigned Beat'}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-600">
                            Enter your exact Employee ID, registered mobile number, or official email to verify your post.
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="indiapost-login-secret"
                        className="block font-semibold text-slate-700 mb-1.5"
                      >
                        {selectedRole === 'partner' ? 'Password or Workspace Passcode *' : 'Password *'}
                      </label>
                      <div className="relative">
                        <input
                          id="indiapost-login-secret"
                          type={showSecret ? 'text' : 'password'}
                          required
                          value={secret}
                          onChange={(e) => setSecret(e.target.value)}
                          placeholder="Enter password or security passcode"
                          className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret((v) => !v)}
                          aria-label={showSecret ? 'Hide password' : 'Show password'}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {pendingBrandProfileId && (
                    <button
                      type="button"
                      onClick={() => {
                        setPendingBrandProfileId(null);
                        setBrandPin('');
                        setInfoMsg(null);
                      }}
                      className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer whitespace-nowrap"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-[#991B1B] hover:bg-red-800 text-white font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    {pendingBrandProfileId ? <Lock size={15} /> : <KeyRound size={15} />}
                    <span>
                      {isSubmitting
                        ? 'Signing In...'
                        : pendingBrandProfileId
                        ? 'Verify PIN & Open India Post Portal'
                        : 'Sign In'}
                    </span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </form>

              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <Link
                  to="/login"
                  className="hover:text-slate-900 font-medium whitespace-nowrap"
                >
                  Open Staff Registration / Password Reset →
                </Link>
                <span className="font-mono text-slate-400">
                  <Building2 size={12} className="inline mr-1" />
                  India Post · Kota Division &amp; Pan-India
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
