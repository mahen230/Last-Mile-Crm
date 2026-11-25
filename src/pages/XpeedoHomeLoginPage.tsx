import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../components/auth/FirebaseAuthProvider';
import {
  DEFAULT_STAFF_FALLBACK_PASSWORD,
  staffPermissionService,
} from '../services/staffPermissionService';
import { brandOwnerService } from '../services/brandOwnerService';
import { partnerBrandService } from '../services/partnerBrandService';

type HomeLoginRole = 'admin' | 'brand' | 'partner' | 'developer';

const ROLE_OPTIONS: Array<{
  value: HomeLoginRole;
  label: string;
  summary: string;
}> = [
  {
    value: 'admin',
    label: 'Admin — Company / Platform Owner',
    summary: 'Full platform operations, executive KPIs, client governance, and staff allocations.',
  },
  {
    value: 'brand',
    label: 'Brand — Brand Workspace Owner',
    summary: 'Single Brand Owner login with password and 4–6 digit security PIN unlock.',
  },
  {
    value: 'partner',
    label: 'Partner — Partner Brand Workspace',
    summary: 'Scoped CRM, leads, follow-ups, properties, and team controls per partner brand.',
  },
  {
    value: 'developer',
    label: 'Developer — Xpeedo Services Diagnostics & Master Editor',
    summary: 'Master control console, RBAC policies, visibility switches, and system audits.',
  },
];

export default function XpeedoHomeLoginPage() {
  const navigate = useNavigate();
  const { userProfile, signInWithPassword, signOut } = useAuth();

  const [selectedRole, setSelectedRole] = useState<HomeLoginRole>('admin');
  const [identifier, setIdentifier] = useState('');
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Brand 2-step state
  const [brands] = useState(() =>
    brandOwnerService.getAllBrandProfiles().filter((b) => b.status !== 'REJECTED')
  );
  const [selectedBrandSlug, setSelectedBrandSlug] = useState<string>(
    brands.find((b) => b.status === 'ACTIVE')?.partnerSlug || brands[0]?.partnerSlug || 'india-post'
  );
  const [pendingBrandProfileId, setPendingBrandProfileId] = useState<string | null>(null);
  const [brandPin, setBrandPin] = useState('');
  const [brandConflict, setBrandConflict] = useState<string | null>(null);

  // Partner state
  const [partners] = useState(() =>
    partnerBrandService.getAllPartners().filter((p) => p.status === 'Active')
  );
  const [selectedPartnerSlug, setSelectedPartnerSlug] = useState<string>(
    partners[0]?.partnerSlug || 'india-post'
  );
  const [partnerConflict, setPartnerConflict] = useState(false);

  // Operational Staff 1..5 dropdown
  const operationalStaffFive = useMemo(
    () => staffPermissionService.getOperationalStaffFive(),
    []
  );
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  const brandSession = brandOwnerService.getActiveBrandOwnerSessionState().session;
  const partnerSession = partnerBrandService.getActivePartnerSession();

  useEffect(() => {
    setErrorMsg(null);
    setInfoMsg(null);
    setBrandConflict(null);
    setPartnerConflict(false);
    setPendingBrandProfileId(null);
    setBrandPin('');
    setSecret('');
    setSelectedStaffId('');

    if (selectedRole === 'admin') {
      setIdentifier('owner@xpokart.in');
    } else if (selectedRole === 'developer') {
      setIdentifier('dev@xpokart.in');
    } else {
      setIdentifier('');
    }
  }, [selectedRole]);

  const roleMeta = ROLE_OPTIONS.find((r) => r.value === selectedRole) || ROLE_OPTIONS[0];

  const handleStaffSlotChange = (staffId: string) => {
    setSelectedStaffId(staffId);
    const matched = operationalStaffFive.find((s) => s.id === staffId);
    if (matched) {
      setIdentifier(matched.employeeId || matched.contact || matched.email);
      setSecret(DEFAULT_STAFF_FALLBACK_PASSWORD);
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
        setErrorMsg('Authentication failed. Verify your Login ID / Mobile / Email and password.');
        return;
      }

      const active = staffPermissionService.getActiveSession();
      if (!active) {
        setErrorMsg('Unable to initialize authenticated session.');
        return;
      }

      const roleUpper = String(active.role || '').toUpperCase();
      const isGovernance = ['OWNER', 'MASTER_ADMIN', 'DEVELOPER', 'SUPER_ADMIN', 'ADMIN'].includes(
        roleUpper
      );

      if (selectedRole === 'admin') {
        if (!['OWNER', 'MASTER_ADMIN', 'SUPER_ADMIN', 'ADMIN'].includes(roleUpper)) {
          await signOut();
          setErrorMsg(
            'This account does not have Admin role privileges. Select Staff or Developer instead.'
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
        navigate('/role-access-dashboard', { replace: true });
        return;
      }

      // staff role: strictly allow operational Staff 1..5
      const inCoreFive = operationalStaffFive.some(
        (s) =>
          s.id === active.id ||
          (s.employeeId && active.employeeId && s.employeeId === active.employeeId)
      );
      if (isGovernance || !inCoreFive) {
        await signOut();
        setErrorMsg(
          'Staff sign-in is restricted to the 5 canonical operational staff slots (Staff 1–Staff 5). Use Admin or Developer mode for governance accounts.'
        );
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
        <div className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
          Xpeedo Services
        </div>
        <div className="text-xs text-slate-500 hidden sm:block whitespace-nowrap">
          Multi-Brand Operations &amp; Client Workspace Gateway
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
              Open Partner Workspace
            </Link>
          ) : (
            <span className="text-xs font-mono text-slate-500 whitespace-nowrap shrink-0">
              Single-Device Session Lock
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Identity & Role Architecture Column */}
          <div className="lg:col-span-5 bg-slate-900 text-white p-7 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                XP
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Xpeedo Services
                </h1>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Unified operations gateway for platform leadership, brand owners, partner workspaces, engineering control, and the 5-member field staff unit.
                </p>
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
                <span>Zero-Leakage Multi-Tenant Isolation</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Public retail and storefront modules are currently dormant. All brand data, 5-staff allocations, and security PIN sessions stay strictly separated.
              </p>
            </div>
          </div>

          {/* Right Login Form Column */}
          <div className="lg:col-span-7 p-7 sm:p-8 flex flex-col justify-center">
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Sign In to Xpeedo Services</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose one of the 5 operational roles below to continue.
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
                  <div>Active partner session detected on another tab or device.</div>
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
                {/* STRICT 5-ROLE DROPDOWN */}
                <div>
                  <label
                    htmlFor="xpeedo-role-select"
                    className="block font-semibold text-slate-700 mb-1.5"
                  >
                    Login Role *
                  </label>
                  <select
                    id="xpeedo-role-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as HomeLoginRole)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    <option value="admin">Admin — Company / Platform Owner</option>
                    <option value="brand">Brand — Brand Workspace Owner</option>
                    <option value="partner">Partner — Partner Brand Workspace</option>
                    <option value="developer">Developer — Xpeedo Services Diagnostics &amp; Master Editor</option>
                  </select>
                </div>

                {/* Brand Workspace Selector */}
                {selectedRole === 'brand' && !pendingBrandProfileId && (
                  <div>
                    <label
                      htmlFor="xpeedo-brand-select"
                      className="block font-semibold text-slate-700 mb-1.5"
                    >
                      Select Brand Workspace *
                    </label>
                    <select
                      id="xpeedo-brand-select"
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
                        Login ID: <span className="font-mono">{selectedBrandObj.loginId}</span> · Owner: {selectedBrandObj.ownerName}
                      </div>
                    )}
                  </div>
                )}

                {/* Partner Workspace Selector */}
                {selectedRole === 'partner' && (
                  <div>
                    <label
                      htmlFor="xpeedo-partner-select"
                      className="block font-semibold text-slate-700 mb-1.5"
                    >
                      Select Partner Organization *
                    </label>
                    <select
                      id="xpeedo-partner-select"
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

                {/* Operational Staff 1..5 Selector */}
                {selectedRole === 'staff' && (
                  <div>
                    <label
                      htmlFor="xpeedo-staff-slot-select"
                      className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5"
                    >
                      <Users size={13} className="text-slate-600" />
                      <span>Select Operational Staff Slot (Staff 1–Staff 5)</span>
                    </label>
                    <select
                      id="xpeedo-staff-slot-select"
                      value={selectedStaffId}
                      onChange={(e) => handleStaffSlotChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                    >
                      <option value="">-- Choose Staff 1 to Staff 5 (or enter ID below) --</option>
                      {operationalStaffFive.map((s, idx) => (
                        <option key={s.id} value={s.id}>
                          Staff {s.staffSlotNumber || idx + 1} — {s.name} ({s.employeeId || s.contact} · {s.beat || 'Assigned'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedRole === 'brand' && pendingBrandProfileId ? (
                  <div>
                    <label
                      htmlFor="xpeedo-brand-pin"
                      className="block font-semibold text-slate-700 mb-1.5"
                    >
                      4–6 Digit Security Passcode (PIN) *
                    </label>
                    <input
                      id="xpeedo-brand-pin"
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      autoFocus
                      value={brandPin}
                      onChange={(e) => setBrandPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 4–6 digit brand PIN"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono tracking-widest text-base tabular-nums text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label
                        htmlFor="xpeedo-login-id"
                        className="block font-semibold text-slate-700 mb-1.5"
                      >
                        {selectedRole === 'brand'
                          ? 'Brand Login ID, Unique Code, Mobile, or Email *'
                          : selectedRole === 'partner'
                          ? 'Partner Email, 10-Digit Mobile, or Brand Code *'
                          : 'Employee ID, Official Email, or 10-Digit Mobile *'}
                      </label>
                      <input
                        id="xpeedo-login-id"
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={
                          selectedRole === 'admin'
                            ? 'owner@xpokart.in or OWNER-01'
                            : selectedRole === 'developer'
                            ? 'dev@xpokart.in or DEV-01'
                            : selectedRole === 'brand'
                            ? 'BRD-INPOST-01 or brand login ID'
                            : selectedRole === 'partner'
                            ? 'partner@brand.in or 10-digit mobile'
                            : 'Employee ID (e.g. 50457421) or 10-digit mobile'
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="xpeedo-login-secret"
                        className="block font-semibold text-slate-700 mb-1.5"
                      >
                        {selectedRole === 'partner' ? 'Password or Workspace Passcode *' : 'Password *'}
                      </label>
                      <div className="relative">
                        <input
                          id="xpeedo-login-secret"
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
                    className="flex-1 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    {pendingBrandProfileId ? <Lock size={15} /> : <KeyRound size={15} />}
                    <span>
                      {isSubmitting
                        ? 'Signing In...'
                        : pendingBrandProfileId
                        ? 'Verify PIN & Open Brand Workspace'
                        : 'Sign In'}
                    </span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </form>

              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <Link to="/brand-login" className="hover:text-slate-900 font-medium whitespace-nowrap">
                    Brand Owner Portal
                  </Link>
                  <span aria-hidden="true">·</span>
                  <Link to="/partner/login" className="hover:text-slate-900 font-medium whitespace-nowrap">
                    Partner Login
                  </Link>
                  <span aria-hidden="true">·</span>
                  <Link to="/brand-access" className="hover:text-slate-900 font-medium whitespace-nowrap">
                    Brand Staff Access
                  </Link>
                </div>
                <span className="font-mono text-slate-400">
                  <Building2 size={12} className="inline mr-1" />
                  5-Staff Roster Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
