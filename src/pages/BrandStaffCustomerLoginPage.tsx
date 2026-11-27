import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { brandOwnerService } from '../services/brandOwnerService';
import { featureVisibilityService } from '../services/featureVisibilityService';
import { SanitizedBrandOwnerProfile } from '../types/brandOwner';

type AccessMode = 'BRAND_STAFF' | 'BRAND_CUSTOMER';

export default function BrandStaffCustomerLoginPage() {
  const { brandSlug = '' } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<SanitizedBrandOwnerProfile[]>(() =>
    brandOwnerService
      .getAllBrandProfiles()
      .filter((p) => p.partnerSlug === 'india-post' || p.workspaceKey === 'INDIA_POST')
  );

  const initialBrand =
    (brandSlug && brandOwnerService.getBrandProfileBySlugOrKey(brandSlug)) ||
    profiles.find((p) => p.status === 'ACTIVE') ||
    profiles[0] ||
    null;

  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialBrand?.partnerSlug || 'india-post'
  );
  const [accessMode, setAccessMode] = useState<AccessMode>('BRAND_STAFF');

  // Brand Staff Fields
  const [staffIdentifier, setStaffIdentifier] = useState('');
  const [staffCredential, setStaffCredential] = useState('');
  const [showStaffSecret, setShowStaffSecret] = useState(false);

  // Brand Customer Fields
  const [customerIdentifier, setCustomerIdentifier] = useState('');
  const [customerVerifyPin, setCustomerVerifyPin] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retailActive, setRetailActive] = useState(() =>
    featureVisibilityService.isRetailServicesActive()
  );

  useEffect(() => {
    const unsubBrand = brandOwnerService.subscribe(() => {
      setProfiles(
        brandOwnerService
          .getAllBrandProfiles()
          .filter((p) => p.partnerSlug === 'india-post' || p.workspaceKey === 'INDIA_POST')
      );
    });
    const unsubVis = featureVisibilityService.subscribe(() => {
      const next = featureVisibilityService.isRetailServicesActive();
      setRetailActive(next);
      if (!next) setAccessMode('BRAND_STAFF');
    });
    return () => {
      unsubBrand();
      unsubVis();
    };
  }, []);

  useEffect(() => {
    if (brandSlug) {
      const matched = brandOwnerService.getBrandProfileBySlugOrKey(brandSlug);
      if (matched) {
        setSelectedSlug(matched.partnerSlug);
      } else {
        setSelectedSlug(brandSlug);
      }
    }
  }, [brandSlug]);

  const activeSession = brandOwnerService.getActiveBrandScopedAccessSessionState().session;

  const selectedProfile =
    brandOwnerService.getBrandProfileBySlugOrKey(selectedSlug) ||
    profiles.find((p) => p.partnerSlug.toLowerCase() === selectedSlug.toLowerCase()) ||
    null;

  const handleSelectBrand = (p: SanitizedBrandOwnerProfile) => {
    setSelectedSlug(p.partnerSlug);
    setErrorMsg(null);
    if (brandSlug && brandSlug.toLowerCase() !== p.partnerSlug.toLowerCase()) {
      navigate(`/brand-access/${p.partnerSlug}`, { replace: true });
    }
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const targetSlug = selectedProfile?.partnerSlug || selectedSlug;
    const res = brandOwnerService.authenticateBrandScopedStaff(
      targetSlug,
      staffIdentifier,
      staffCredential
    );
    if (res.success === false) {
      setErrorMsg(res.error);
      return;
    }
    navigate(`/brand-member-portal/${res.session.partnerSlug}`, { replace: true });
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const targetSlug = selectedProfile?.partnerSlug || selectedSlug;
    const res = brandOwnerService.authenticateBrandScopedCustomer(
      targetSlug,
      customerIdentifier,
      customerVerifyPin
    );
    if (res.success === false) {
      setErrorMsg(res.error);
      return;
    }
    navigate(`/brand-member-portal/${res.session.partnerSlug}`, { replace: true });
  };

  const renderStatusTextClass = (status: SanitizedBrandOwnerProfile['status']) => {
    if (status === 'ACTIVE') return 'text-emerald-400';
    if (status === 'PENDING_APPROVAL') return 'text-amber-300';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-8 px-4 sm:px-6">
      <div className="max-w-5xl w-full mx-auto space-y-4">
        {/* Login Hierarchy Strip */}
        <div
          className={`bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 ${
            retailActive ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
          } gap-3 text-xs`}
        >
          <Link
            to="/staff-gateway"
            className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-400 transition block"
          >
            <div className="font-mono text-[11px] text-slate-500">Tier 1 · Platform Control</div>
            <div className="font-bold text-slate-900 mt-0.5">Master Admin Gateway →</div>
          </Link>
          <button
            type="button"
            onClick={() => {
              setSelectedSlug('india-post');
              setAccessMode('BRAND_STAFF');
              setErrorMsg(null);
            }}
            className="p-2.5 rounded-lg border border-red-200 bg-red-50 hover:border-red-400 text-left transition cursor-pointer"
          >
            <div className="font-mono text-[11px] text-red-700">Quick Entry · Kota Division</div>
            <div className="font-bold text-red-900 mt-0.5">India Post Single Sign-In →</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setAccessMode('BRAND_STAFF');
              setErrorMsg(null);
            }}
            className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
              accessMode === 'BRAND_STAFF'
                ? 'border-slate-900 bg-slate-50'
                : 'border-slate-200 hover:border-slate-400'
            }`}
          >
            <div className="font-mono text-[11px] text-slate-500">Tier 3 · Single-Brand All-Staff SSO</div>
            <div className="font-bold text-slate-900 mt-0.5">Brand Staff Sign-In</div>
          </button>
          {retailActive && (
            <button
              type="button"
              onClick={() => {
                setAccessMode('BRAND_CUSTOMER');
                setErrorMsg(null);
              }}
              className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                accessMode === 'BRAND_CUSTOMER'
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="font-mono text-[11px] text-slate-500">Tier 4 · Self-Service</div>
              <div className="font-bold text-slate-900 mt-0.5">Brand Customer Sign-In</div>
            </button>
          )}
        </div>

        {/* Active Session Resume Strip */}
        {activeSession && (
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-slate-700">
              Active scoped session: <strong>{activeSession.actorName}</strong> (
              <span className="font-mono">{activeSession.hierarchyTier}</span> ·{' '}
              {activeSession.brandName})
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/brand-member-portal/${activeSession.partnerSlug}`}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold"
              >
                Open Active Portal
              </Link>
              <button
                type="button"
                onClick={() => brandOwnerService.signOutBrandScopedAccess()}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
              >
                End Session
              </button>
            </div>
          </div>
        )}

        {/* Main Split Container */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Panel: Strict Brand Workspace Selector */}
          <div className="lg:col-span-5 bg-slate-900 text-white p-6 sm:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
                  style={{ backgroundColor: selectedProfile?.accentColor || '#1D4ED8' }}
                >
                  <Building2 size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-sky-400">
                    Brand-Scoped Access
                  </div>
                  <h1 className="text-lg font-bold text-white truncate">
                    {selectedProfile ? selectedProfile.brandName : 'Select Brand'}
                  </h1>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Authentication is strictly isolated per brand. All active{' '}
                <strong>{selectedProfile?.brandName || 'selected brand'}</strong>{' '}
                {retailActive ? 'staff and registered customers' : 'staff members'}{' '}
                sign in through this single portal—cross-brand credentials are automatically blocked.
              </p>

              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Target Brand Workspace
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {profiles.map((p) => {
                    const isSelected = selectedProfile?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectBrand(p)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg border transition flex items-center justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-sky-400 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate">{p.brandName}</div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                            {p.uniqueCode} · {p.workspaceKey}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-semibold shrink-0 ${renderStatusTextClass(
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
              <Link to="/" className="hover:text-white transition font-medium">
                {retailActive ? 'Public Citizen Home' : 'India Post Operations Home'}
              </Link>
            </div>
          </div>

          {/* Right Panel: Brand Staff Login Form (and Customer Login when retail active) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Role Mode Tabs */}
              {retailActive && (
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAccessMode('BRAND_STAFF');
                      setErrorMsg(null);
                    }}
                    className={`py-2 px-3 rounded-md font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                      accessMode === 'BRAND_STAFF'
                        ? 'bg-white text-slate-900 border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users size={14} />
                    <span>Brand Staff Login</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccessMode('BRAND_CUSTOMER');
                      setErrorMsg(null);
                    }}
                    className={`py-2 px-3 rounded-md font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                      accessMode === 'BRAND_CUSTOMER'
                        ? 'bg-white text-slate-900 border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User size={14} />
                    <span>Brand Customer Login</span>
                  </button>
                </div>
              )}

              <div className="border-b border-slate-200 pb-3.5">
                <div className="text-[11px] font-mono uppercase text-slate-500">
                  {accessMode === 'BRAND_STAFF'
                    ? 'Hierarchy Tier 3 · Brand Staff Workspace'
                    : 'Hierarchy Tier 4 · Customer Self-Service'}
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  {accessMode === 'BRAND_STAFF'
                    ? `Sign in as ${selectedProfile?.brandName || 'Brand'} Staff`
                    : `Sign in as ${selectedProfile?.brandName || 'Brand'} Customer`}
                </h2>
              </div>

              {selectedProfile && selectedProfile.status !== 'ACTIVE' && (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950">
                  <strong>{selectedProfile.brandName}</strong> workspace status is{' '}
                  <span className="font-mono font-bold">{selectedProfile.status}</span>. Staff and
                  customer access unlocks once Master Admin sets the brand to ACTIVE.
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {accessMode === 'BRAND_STAFF' ? (
                <form onSubmit={handleStaffSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Employee ID, Official Email, or 10-Digit Mobile *
                    </label>
                    <input
                      type="text"
                      required
                      value={staffIdentifier}
                      onChange={(e) => setStaffIdentifier(e.target.value)}
                      placeholder="e.g. CSI-..., staff@brand.in, or 9829..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Staff Password or Passcode *
                    </label>
                    <div className="relative">
                      <input
                        type={showStaffSecret ? 'text' : 'password'}
                        required
                        value={staffCredential}
                        onChange={(e) => setStaffCredential(e.target.value)}
                        placeholder="Enter assigned staff password"
                        className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStaffSecret((s) => !s)}
                        aria-label={showStaffSecret ? 'Hide password' : 'Show password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
                      >
                        {showStaffSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={Boolean(selectedProfile && selectedProfile.status !== 'ACTIVE')}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <KeyRound size={15} />
                    <span>Sign In to {selectedProfile?.brandName || 'Brand'} Staff Portal</span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCustomerSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Registered Mobile, Email, or Customer Master ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerIdentifier}
                      onChange={(e) => setCustomerIdentifier(e.target.value)}
                      placeholder="10-digit registered mobile, email, or CUST-..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Verification: Last 4 Digits of Mobile or Customer ID *
                    </label>
                    <input
                      type="password"
                      required
                      value={customerVerifyPin}
                      onChange={(e) => setCustomerVerifyPin(e.target.value)}
                      placeholder="Last 4 digits of mobile (or Customer ID)"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-none focus:border-slate-900"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Strictly grants read &amp; inquiry access to your own profile, properties, leads, and service requests.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={Boolean(selectedProfile && selectedProfile.status !== 'ACTIVE')}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <User size={15} />
                    <span>Verify &amp; Open My {selectedProfile?.brandName || 'Brand'} Account</span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-slate-700" />
                <span>Zero-Leakage Brand Isolation &amp; 4-Tier Hierarchy Enforced</span>
              </span>
              <span className="font-mono">{accessMode}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
