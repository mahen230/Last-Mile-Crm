import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRightLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Database,
  Eye,
  EyeOff,
  ExternalLink,
  KeyRound,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Unlock,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { brandOwnerService } from '../../services/brandOwnerService';
import { customerService } from '../../services/customerService';
import { staffPermissionService } from '../../services/staffPermissionService';
import { xpeedoOpsService } from '../../services/xpeedoOpsService';
import {
  ALL_BRAND_PORTAL_SUBMENUS,
  BrandPortalSubMenuKey,
  BrandProfileStatus,
  SanitizedBrandOwnerProfile,
  SectorTransferEntityType,
} from '../../types/brandOwner';

function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#';
  let out = 'Brd@';
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function generateRandomPin(length = 6): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += String(Math.floor(Math.random() * 10));
  }
  return out;
}

export default function BrandProfilesAndSectorRoutingView({
  mode = 'PROFILES',
}: {
  mode?: 'PROFILES' | 'SECTOR_ROUTING';
}) {
  const { userProfile } = useAuth();
  const actorName = userProfile?.name || 'Master Admin';

  const [tick, setTick] = useState(0);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [oneTimeSecretBanner, setOneTimeSecretBanner] = useState<{
    brandName: string;
    loginId: string;
    password?: string;
    passcode?: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create Brand Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cBrandName, setCBrandName] = useState('');
  const [cUniqueCode, setCUniqueCode] = useState('');
  const [cOwnerName, setCOwnerName] = useState('');
  const [cOwnerPhone, setCOwnerPhone] = useState('');
  const [cLoginId, setCLoginId] = useState('');
  const [cPassword, setCPassword] = useState(() => generateRandomPassword());
  const [cPasscode, setCPasscode] = useState(() => generateRandomPin(6));
  const [cStatus, setCStatus] = useState<BrandProfileStatus>('ACTIVE');
  const [cSingleSession, setCSingleSession] = useState(true);
  const [cAccent, setCAccent] = useState('#1D4ED8');
  const [cCategory, setCCategory] = useState('Brand Operations Workspace');
  const [cSubMenus, setCSubMenus] = useState<BrandPortalSubMenuKey[]>(
    ALL_BRAND_PORTAL_SUBMENUS.map((m) => m.key)
  );

  // Edit Profile Modal
  const [editingProfile, setEditingProfile] = useState<SanitizedBrandOwnerProfile | null>(null);
  const [eBrandName, setEBrandName] = useState('');
  const [eUniqueCode, setEUniqueCode] = useState('');
  const [eOwnerName, setEOwnerName] = useState('');
  const [eOwnerPhone, setEOwnerPhone] = useState('');
  const [eLoginId, setELoginId] = useState('');
  const [eCategory, setECategory] = useState('');
  const [eAccent, setEAccent] = useState('#1D4ED8');
  const [eSubMenus, setESubMenus] = useState<BrandPortalSubMenuKey[]>([]);

  // Reset Password & 4-6 Digit Passcode Modal
  const [credTarget, setCredTarget] = useState<SanitizedBrandOwnerProfile | null>(null);
  const [rNewPassword, setRNewPassword] = useState('');
  const [rNewPasscode, setRNewPasscode] = useState('');
  const [showVaultPin, setShowVaultPin] = useState(false);

  // Pending Brand Approvals & Profile Status Filter
  const [profileStatusFilter, setProfileStatusFilter] = useState<'ALL' | BrandProfileStatus>('ALL');
  const [pendingPinDrafts, setPendingPinDrafts] = useState<Record<string, string>>({});
  const [rejectReasonDrafts, setRejectReasonDrafts] = useState<Record<string, string>>({});

  // Sector Routing Filters & Drafts
  const [routingSearch, setRoutingSearch] = useState('');
  const [routingEntityFilter, setRoutingEntityFilter] = useState<'ALL' | SectorTransferEntityType>('ALL');
  const [routingSectorFilter, setRoutingSectorFilter] = useState<'ALL' | 'NEEDS_TRANSFER' | string>('ALL');
  const [targetSectorDrafts, setTargetSectorDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const u1 = brandOwnerService.subscribe(() => setTick((t) => t + 1));
    const u2 = customerService.subscribe(() => setTick((t) => t + 1));
    const u3 = staffPermissionService.subscribe(() => setTick((t) => t + 1));
    const u4 = xpeedoOpsService.subscribe(() => setTick((t) => t + 1));
    return () => {
      u1();
      u2();
      u3();
      u4();
    };
  }, []);

  const profiles = useMemo(() => {
    void tick;
    return brandOwnerService.getAllBrandProfiles();
  }, [tick]);

  const pendingProfiles = useMemo(() => {
    void tick;
    return brandOwnerService.getPendingBrandProfiles();
  }, [tick]);

  const filteredProfiles = useMemo(() => {
    if (profileStatusFilter === 'ALL') return profiles;
    return profiles.filter((p) => p.status === profileStatusFilter);
  }, [profiles, profileStatusFilter]);

  const routingSummary = useMemo(() => {
    void tick;
    return brandOwnerService.scanDatabaseSectorRouting();
  }, [tick]);

  const showToast = (type: 'ok' | 'err', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  };

  const handleCopyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore clipboard restrictions
    }
    setCopiedId(key);
    setTimeout(() => setCopiedId((prev) => (prev === key ? null : prev)), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = brandOwnerService.createBrandProfile(
      {
        brandName: cBrandName,
        uniqueCode: cUniqueCode || undefined,
        ownerName: cOwnerName,
        ownerContactNumber: cOwnerPhone,
        loginId: cLoginId,
        password: cPassword,
        passcode: cPasscode,
        status: cStatus,
        singleSessionOnly: cSingleSession,
        accentColor: cAccent,
        category: cCategory,
        subMenuItems: cSubMenus,
      },
      actorName
    );
    if ('error' in res) {
      showToast('err', res.error);
      return;
    }

    setOneTimeSecretBanner({
      brandName: res.profile.brandName,
      loginId: res.profile.loginId,
      password: cPassword,
      passcode: cPasscode,
    });
    setShowCreateModal(false);
    setCBrandName('');
    setCUniqueCode('');
    setCOwnerName('');
    setCOwnerPhone('');
    setCLoginId('');
    setCPassword(generateRandomPassword());
    setCPasscode(generateRandomPin(6));
    showToast('ok', `Created Brand Owner profile for "${res.profile.brandName}" (${res.profile.uniqueCode}).`);
  };

  const openEditModal = (p: SanitizedBrandOwnerProfile) => {
    setEditingProfile(p);
    setEBrandName(p.brandName);
    setEUniqueCode(p.uniqueCode);
    setEOwnerName(p.ownerName);
    setEOwnerPhone(p.ownerContactNumber);
    setELoginId(p.loginId);
    setECategory(p.category);
    setEAccent(p.accentColor);
    setESubMenus([...p.subMenuItems]);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    const res = brandOwnerService.updateBrandProfile(
      editingProfile.id,
      {
        brandName: eBrandName,
        uniqueCode: eUniqueCode,
        ownerName: eOwnerName,
        ownerContactNumber: eOwnerPhone,
        loginId: eLoginId,
        category: eCategory,
        accentColor: eAccent,
        subMenuItems: eSubMenus.length > 0 ? eSubMenus : ['OVERVIEW'],
      },
      actorName
    );
    if ('error' in res) {
      showToast('err', res.error);
      return;
    }
    setEditingProfile(null);
    showToast('ok', `Updated Brand Profile & Sub-Menu configuration for "${res.profile.brandName}".`);
  };

  const openCredModal = (p: SanitizedBrandOwnerProfile) => {
    setCredTarget(p);
    setRNewPassword('');
    setRNewPasscode('');
    setShowVaultPin(false);
  };

  const handleApprovePending = (p: SanitizedBrandOwnerProfile) => {
    const pinDraft = (pendingPinDrafts[p.id] ?? brandOwnerService.getAdminPasscodePreview(p.id, true) ?? '').trim();
    const res = brandOwnerService.approvePendingBrandProfile(
      p.id,
      { passcode: pinDraft || undefined },
      actorName
    );
    if ('error' in res) {
      showToast('err', res.error);
      return;
    }
    setOneTimeSecretBanner({
      brandName: res.profile.brandName,
      loginId: res.profile.loginId,
      passcode: res.passcode,
    });
    showToast(
      'ok',
      `Approved & activated Brand Login Profile "${res.profile.brandName}" (${res.profile.uniqueCode}).`
    );
  };

  const handleRejectPending = (p: SanitizedBrandOwnerProfile) => {
    const reason = (rejectReasonDrafts[p.id] || '').trim() || 'Declined during Master Admin verification.';
    const res = brandOwnerService.rejectPendingBrandProfile(p.id, reason, actorName);
    if ('error' in res) {
      showToast('err', res.error);
      return;
    }
    showToast('ok', `Rejected registration for "${res.profile.brandName}".`);
  };

  const handleCredResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credTarget) return;
    if (!rNewPassword.trim() && !rNewPasscode.trim()) {
      showToast('err', 'Enter a new Password and/or a 4–6 digit Security Passcode to update.');
      return;
    }
    if (rNewPassword.trim()) {
      const pwRes = brandOwnerService.resetBrandPassword(credTarget.id, rNewPassword.trim(), actorName);
      if ('error' in pwRes) {
        showToast('err', pwRes.error);
        return;
      }
    }
    if (rNewPasscode.trim()) {
      const pinRes = brandOwnerService.resetBrandPasscode(credTarget.id, rNewPasscode.trim(), actorName);
      if ('error' in pinRes) {
        showToast('err', pinRes.error);
        return;
      }
    }
    setOneTimeSecretBanner({
      brandName: credTarget.brandName,
      loginId: credTarget.loginId,
      password: rNewPassword.trim() || undefined,
      passcode: rNewPasscode.trim() || undefined,
    });
    setCredTarget(null);
    showToast('ok', `Updated login credentials for "${credTarget.brandName}".`);
  };

  const filteredRoutingRecords = useMemo(() => {
    const q = routingSearch.trim().toLowerCase();
    return routingSummary.records.filter((r) => {
      if (routingEntityFilter !== 'ALL' && r.entityType !== routingEntityFilter) return false;
      if (routingSectorFilter === 'NEEDS_TRANSFER' && !r.needsTransfer) return false;
      if (
        routingSectorFilter !== 'ALL' &&
        routingSectorFilter !== 'NEEDS_TRANSFER' &&
        r.currentWorkspaceKey !== routingSectorFilter
      ) {
        return false;
      }
      if (!q) return true;
      return `${r.title} ${r.subtitle} ${r.currentWorkspaceKey} ${r.recommendedWorkspaceKey} ${r.reason}`
        .toLowerCase()
        .includes(q);
    });
  }, [routingSummary.records, routingSearch, routingEntityFilter, routingSectorFilter]);

  return (
    <div className="space-y-6">
      {notice && (
        <div
          className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-between gap-2 ${
            notice.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span className="flex items-center gap-2">
            {notice.type === 'ok' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {notice.text}
          </span>
          <button type="button" onClick={() => setNotice(null)} className="cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {oneTimeSecretBanner && (
        <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-amber-300">
              Admin Credential Confirmation — {oneTimeSecretBanner.brandName}
            </div>
            <div className="font-mono text-slate-200 flex flex-wrap gap-x-4 gap-y-1">
              <span>Login ID: {oneTimeSecretBanner.loginId}</span>
              {oneTimeSecretBanner.password && <span>Password: {oneTimeSecretBanner.password}</span>}
              {oneTimeSecretBanner.passcode && <span>4–6 Digit PIN: {oneTimeSecretBanner.passcode}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                handleCopyText(
                  'one-time-cred',
                  `Brand: ${oneTimeSecretBanner.brandName}\nLogin ID: ${oneTimeSecretBanner.loginId}${
                    oneTimeSecretBanner.password ? `\nPassword: ${oneTimeSecretBanner.password}` : ''
                  }${oneTimeSecretBanner.passcode ? `\nSecurity PIN: ${oneTimeSecretBanner.passcode}` : ''}`
                )
              }
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              {copiedId === 'one-time-cred' ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedId === 'one-time-cred' ? 'Copied' : 'Copy Credentials'}</span>
            </button>
            <button
              type="button"
              onClick={() => setOneTimeSecretBanner(null)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODE 1: BRAND OWNER PROFILES, LOGINS, PASSCODES & SUB-MENUS         */}
      {/* =================================================================== */}
      {mode === 'PROFILES' && (
        <div className="space-y-6">
          {/* Master Admin vs. Brand Owner Responsibility Separation */}
          <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-sky-300 flex items-center gap-1.5">
                <ShieldCheck size={15} />
                <span>Ownership Model: Master Admin Governance vs. Brand Owner Autonomy</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                <strong>Master Admin Scope:</strong> Onboard brands/departments, assign the single <strong>Brand Owner</strong> Login ID, Password &amp; 4–6 digit PIN, configure visible sub-menus, and enforce sector routing.{' '}
                <strong>Brand Owner Scope:</strong> Each Brand Owner manages all internal staff logins, passwords, role assignments, beats/offices, and RBAC inside their Brand Portal.
              </p>
            </div>
            <Link
              to="/brand-portal"
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold whitespace-nowrap shrink-0 self-start md:self-center"
            >
              Open Brand Owner Portal
            </Link>
          </div>

          {/* Pending Brand Approvals Queue (Master Admin Only) */}
          {pendingProfiles.length > 0 && (
            <div className="bg-amber-50/70 rounded-xl border border-amber-300 overflow-hidden">
              <div className="px-5 py-3.5 bg-amber-100/70 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                  <Clock size={16} className="text-amber-700" />
                  <span>Pending Brand Approvals ({pendingProfiles.length})</span>
                </div>
                <span className="text-[11px] font-medium text-amber-900">
                  Review B2B / Partner Portal brand applications, inspect or customize 4–6 digit PIN, and activate login access.
                </span>
              </div>
              <div className="divide-y divide-amber-200">
                {pendingProfiles.map((p) => {
                  const vaultPin = brandOwnerService.getAdminPasscodePreview(p.id, true) || '';
                  const pinValue = pendingPinDrafts[p.id] !== undefined ? pendingPinDrafts[p.id] : vaultPin;
                  return (
                    <div
                      key={p.id}
                      className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs bg-white/80"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 font-bold text-slate-900">
                          <span>{p.brandName}</span>
                          <span className="font-mono text-[11px] text-slate-500">
                            {p.uniqueCode} · {p.onboardingSource || 'BRAND_ONBOARDING'}
                          </span>
                        </div>
                        <div className="text-slate-700">
                          Owner: <strong>{p.ownerName}</strong> · Mobile:{' '}
                          <span className="font-mono tabular-nums">{p.ownerContactNumber || 'N/A'}</span> · Login ID:{' '}
                          <span className="font-mono">{p.loginId}</span>
                        </div>
                        {p.onboardingNotes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-2xl">
                            Note: {p.onboardingNotes}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1">
                          <label className="text-[11px] font-semibold text-slate-600">PIN:</label>
                          <input
                            type="text"
                            maxLength={6}
                            value={pinValue}
                            onChange={(e) =>
                              setPendingPinDrafts((prev) => ({
                                ...prev,
                                [p.id]: e.target.value.replace(/\D/g, '').slice(0, 6),
                              }))
                            }
                            placeholder="4-6 digits"
                            className="w-24 px-2 py-1.5 border border-slate-300 rounded bg-white font-mono text-xs tabular-nums"
                          />
                        </div>
                        <input
                          type="text"
                          value={rejectReasonDrafts[p.id] || ''}
                          onChange={(e) =>
                            setRejectReasonDrafts((prev) => ({
                              ...prev,
                              [p.id]: e.target.value,
                            }))
                          }
                          placeholder="Optional decline reason..."
                          className="w-40 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleApprovePending(p)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                        >
                          Approve &amp; Activate
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectPending(p)}
                          className="px-3 py-1.5 rounded-lg border border-red-300 bg-white hover:bg-red-50 text-red-700 font-semibold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound size={18} className="text-blue-600" />
                  <span>Single Brand Owner Logins, Passcodes &amp; Sub-Menus</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Each brand receives one isolated BRAND_OWNER login ID, password, 4–6 digit security passcode, and single-session lock control.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/brand-login"
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  <span>Open Brand Login Page</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create Brand Profile</span>
                </button>
              </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-5 border-b border-slate-200 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 text-xs">
              <div className="px-5 py-3.5">
                <div className="text-slate-500">Total Brand Profiles</div>
                <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                  {profiles.length}
                </div>
              </div>
              <div className="px-5 py-3.5">
                <div className="text-slate-500">Active Portals</div>
                <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
                  {profiles.filter((p) => p.status === 'ACTIVE').length}
                </div>
              </div>
              <div className="px-5 py-3.5">
                <div className="text-slate-500">Pending Approvals</div>
                <div className="text-xl font-bold text-amber-700 font-mono tabular-nums mt-0.5">
                  {pendingProfiles.length}
                </div>
              </div>
              <div className="px-5 py-3.5">
                <div className="text-slate-500">Locked / Declined</div>
                <div className="text-xl font-bold text-red-700 font-mono tabular-nums mt-0.5">
                  {profiles.filter((p) => p.status === 'LOCKED' || p.status === 'REJECTED').length}
                </div>
              </div>
              <div className="px-5 py-3.5">
                <div className="text-slate-500">Single-Session Enforced</div>
                <div className="text-xl font-bold text-blue-700 font-mono tabular-nums mt-0.5">
                  {profiles.filter((p) => p.singleSessionOnly).length}
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-1.5 text-xs">
              {(['ALL', 'ACTIVE', 'PENDING_APPROVAL', 'LOCKED', 'REJECTED'] as const).map((st) => {
                const active = profileStatusFilter === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setProfileStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-md font-mono text-[11px] font-semibold cursor-pointer transition ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>

            {/* Profiles Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Brand &amp; Unique Code</th>
                    <th className="py-3 px-4">Owner &amp; Contact</th>
                    <th className="py-3 px-4">Login ID &amp; PIN Rule</th>
                    <th className="py-3 px-4">Status &amp; Session Lock</th>
                    <th className="py-3 px-4">Sub-Menus</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProfiles.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 align-top">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-xs shrink-0"
                            style={{ backgroundColor: p.accentColor }}
                          />
                          <div>
                            <div className="font-bold text-slate-900">{p.brandName}</div>
                            <div className="font-mono text-[11px] text-slate-500">
                              {p.uniqueCode} · {p.workspaceKey}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{p.ownerName}</div>
                        <div className="font-mono text-[11px] text-slate-500 tabular-nums">
                          {p.ownerContactNumber || 'No contact set'}
                        </div>
                        {p.ownerEmail && (
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            {p.ownerEmail}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-900">{p.loginId}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Passcode: {p.passcodeLength}-digit PIN (Hashed)
                        </div>
                      </td>
                      <td className="py-3.5 px-4 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {p.status === 'PENDING_APPROVAL' ? (
                            <button
                              type="button"
                              onClick={() => handleApprovePending(p)}
                              className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold border cursor-pointer bg-amber-50 text-amber-800 border-amber-300 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
                            >
                              PENDING_APPROVAL · Approve
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                brandOwnerService.toggleBrandStatus(
                                  p.id,
                                  p.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE',
                                  actorName
                                )
                              }
                              className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold border cursor-pointer flex items-center gap-1 ${
                                p.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-red-50 text-red-800 border-red-200'
                              }`}
                            >
                              {p.status === 'ACTIVE' ? <Unlock size={11} /> : <Lock size={11} />}
                              <span>{p.status}</span>
                            </button>
                          )}

                          <label className="inline-flex items-center gap-1 text-[11px] text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={p.singleSessionOnly}
                              onChange={(e) =>
                                brandOwnerService.toggleSingleSessionOnly(
                                  p.id,
                                  e.target.checked,
                                  actorName
                                )
                              }
                              className="accent-blue-600"
                            />
                            <span>Single-Session</span>
                          </label>
                        </div>
                        {p.activeSessionToken && (
                          <div className="flex items-center gap-2 text-[11px] text-blue-700">
                            <span className="font-mono">Active Session</span>
                            <button
                              type="button"
                              onClick={() => {
                                brandOwnerService.revokeActiveBrandSession(p.id, actorName);
                                showToast('ok', `Revoked active session for ${p.brandName}.`);
                              }}
                              className="text-red-700 hover:underline font-semibold cursor-pointer"
                            >
                              Revoke
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {p.subMenuItems.length} / {ALL_BRAND_PORTAL_SUBMENUS.length} active
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openCredModal(p)}
                          className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <KeyRound size={12} />
                          <span>Password / PIN</span>
                        </button>
                        <Link
                          to={`/brand-portal/${p.partnerSlug}`}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold inline-flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ExternalLink size={11} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODE 2: DATABASE-TO-SECTOR TRANSFER & MANUAL REASSIGNMENT           */}
      {/* =================================================================== */}
      {mode === 'SECTOR_ROUTING' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft size={18} className="text-blue-600" />
                  <span>Database-to-Sector Routing &amp; Master Admin Reassignment</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automatically route Department of Post division, beat, and bulk customer records to their scoped India Post workspaces, or reassign any record manually.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const res = brandOwnerService.executeSectorAutoTransfer(actorName);
                  showToast(
                    'ok',
                    res.transferredCount > 0
                      ? `Transferred ${res.transferredCount} record(s) into their matching brand workspaces.`
                      : 'All scanned records are already cleanly routed to their matching brand sectors.'
                  );
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Database size={14} />
                <span>
                  Run Sector Auto-Transfer ({routingSummary.needsTransferCount} pending)
                </span>
              </button>
            </div>

            {/* Sector Distribution Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Total Scanned</div>
                <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                  {routingSummary.totalScanned}
                </div>
              </div>
              {profiles.map((p) => (
                <div key={p.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-600 font-medium truncate">{p.brandName}</div>
                  <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                    {routingSummary.byWorkspace[p.workspaceKey] || 0}
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 text-xs">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={routingSearch}
                  onChange={(e) => setRoutingSearch(e.target.value)}
                  placeholder="Search record title, office, beat, PIN, or rule reason..."
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>
              <select
                value={routingEntityFilter}
                onChange={(e) => setRoutingEntityFilter(e.target.value as any)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
              >
                <option value="ALL">All Entities</option>
                <option value="Customer">Customers</option>
                <option value="Lead">Leads</option>
                <option value="Office">Offices / Stores</option>
                <option value="Staff">Staff</option>
                <option value="Department">Departments</option>
                <option value="Project">Projects</option>
                <option value="Task">Tasks</option>
              </select>
              <select
                value={routingSectorFilter}
                onChange={(e) => setRoutingSectorFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
              >
                <option value="ALL">All Sectors</option>
                <option value="NEEDS_TRANSFER">Pending Auto-Transfer Only</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.workspaceKey}>
                    {p.brandName} ({p.workspaceKey})
                  </option>
                ))}
              </select>
            </div>

            {/* Scanned Records Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[520px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Entity</th>
                    <th className="py-2.5 px-3">Record</th>
                    <th className="py-2.5 px-3">Current Sector</th>
                    <th className="py-2.5 px-3">Detected Sector &amp; Reason</th>
                    <th className="py-2.5 px-3 text-right">Manual Sector Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRoutingRecords.slice(0, 120).map((r) => {
                    const rowKey = `${r.entityType}:${r.recordId}`;
                    const selectedTarget =
                      targetSectorDrafts[rowKey] || r.recommendedWorkspaceKey || 'INDIA_POST';
                    return (
                      <tr key={rowKey} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-700">
                          {r.entityType}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{r.title}</div>
                          <div className="text-[11px] text-slate-500">{r.subtitle}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold ${
                              r.needsTransfer
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r.currentWorkspaceKey}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-mono text-[11px] font-semibold text-blue-700">
                            {r.recommendedWorkspaceKey}
                          </div>
                          <div className="text-[11px] text-slate-500">{r.reason}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <select
                              value={selectedTarget}
                              onChange={(e) =>
                                setTargetSectorDrafts((prev) => ({
                                  ...prev,
                                  [rowKey]: e.target.value,
                                }))
                              }
                              aria-label={`Target sector for ${r.title}`}
                              className="px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                            >
                              {profiles.map((p) => (
                                <option key={p.id} value={p.workspaceKey}>
                                  {p.brandName}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                const ok = brandOwnerService.reassignRecordToWorkspace(
                                  r.entityType,
                                  r.recordId,
                                  selectedTarget,
                                  actorName
                                );
                                if (ok) {
                                  showToast(
                                    'ok',
                                    `Moved ${r.entityType} "${r.title}" to ${selectedTarget}.`
                                  );
                                }
                              }}
                              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                            >
                              Move
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: CREATE BRAND OWNER PROFILE                                 */}
      {/* =================================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full bg-white rounded-xl border border-slate-200 overflow-hidden my-auto">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Create New Brand Owner Profile</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={cBrandName}
                    onChange={(e) => setCBrandName(e.target.value)}
                    placeholder="e.g. Kota Fresh Mart"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Unique Brand Code (Auto if blank)
                  </label>
                  <input
                    type="text"
                    value={cUniqueCode}
                    onChange={(e) => setCUniqueCode(e.target.value.toUpperCase())}
                    placeholder="e.g. BRD-KOTAFM-06"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={cOwnerName}
                    onChange={(e) => setCOwnerName(e.target.value)}
                    placeholder="Brand Owner Full Name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Owner Contact / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={cOwnerPhone}
                    onChange={(e) => setCOwnerPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Single Brand Login ID *</label>
                <input
                  type="text"
                  required
                  value={cLoginId}
                  onChange={(e) => setCLoginId(e.target.value)}
                  placeholder="e.g. office.incharge@indiapost-portal.in"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password (min 6 chars) *</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      minLength={6}
                      value={cPassword}
                      onChange={(e) => setCPassword(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setCPassword(generateRandomPassword())}
                      title="Regenerate Password"
                      className="px-2.5 border border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    4–6 Digit Security Passcode *
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      pattern="\d{4,6}"
                      maxLength={6}
                      value={cPasscode}
                      onChange={(e) => setCPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => setCPasscode(generateRandomPin(6))}
                      title="Regenerate 6-digit PIN"
                      className="px-2.5 border border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={cStatus}
                    onChange={(e) => setCStatus(e.target.value as BrandProfileStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="LOCKED">LOCKED</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Accent Color</label>
                  <input
                    type="color"
                    value={cAccent}
                    onChange={(e) => setCAccent(e.target.value)}
                    className="w-full h-9 p-1 border border-slate-300 rounded-lg bg-white cursor-pointer"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cSingleSession}
                      onChange={(e) => setCSingleSession(e.target.checked)}
                      className="accent-blue-600"
                    />
                    <span>Single-Session Lock</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Category</label>
                <input
                  type="text"
                  value={cCategory}
                  onChange={(e) => setCCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Enabled Brand Sub-Menu Modules
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_BRAND_PORTAL_SUBMENUS.map((m) => {
                    const checked = cSubMenus.includes(m.key);
                    return (
                      <label
                        key={m.key}
                        className="flex items-center gap-2 p-2 rounded border border-slate-200 bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setCSubMenus((prev) =>
                              e.target.checked
                                ? [...prev, m.key]
                                : prev.filter((k) => k !== m.key)
                            )
                          }
                          className="accent-blue-600"
                        />
                        <span className="font-medium text-slate-800">{m.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                >
                  Create Brand Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: EDIT BRAND PROFILE & SUB-MENU FLOW                         */}
      {/* =================================================================== */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full bg-white rounded-xl border border-slate-200 overflow-hidden my-auto">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Edit Brand Profile · {editingProfile.brandName}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={eBrandName}
                    onChange={(e) => setEBrandName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unique Code *</label>
                  <input
                    type="text"
                    required
                    value={eUniqueCode}
                    onChange={(e) => setEUniqueCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={eOwnerName}
                    onChange={(e) => setEOwnerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Owner Contact Number</label>
                  <input
                    type="tel"
                    value={eOwnerPhone}
                    onChange={(e) => setEOwnerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Login ID *</label>
                  <input
                    type="text"
                    required
                    value={eLoginId}
                    onChange={(e) => setELoginId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Accent Color</label>
                  <input
                    type="color"
                    value={eAccent}
                    onChange={(e) => setEAccent(e.target.value)}
                    className="w-full h-9 p-1 border border-slate-300 rounded-lg bg-white cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={eCategory}
                  onChange={(e) => setECategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Brand Portal Sub-Menu Configuration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_BRAND_PORTAL_SUBMENUS.map((m) => {
                    const checked = eSubMenus.includes(m.key);
                    return (
                      <label
                        key={m.key}
                        className="flex items-center gap-2 p-2 rounded border border-slate-200 bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setESubMenus((prev) =>
                              e.target.checked
                                ? [...prev, m.key]
                                : prev.filter((k) => k !== m.key)
                            )
                          }
                          className="accent-blue-600"
                        />
                        <span className="font-medium text-slate-800">{m.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: RESET PASSWORD & 4-6 DIGIT SECURITY PASSCODE               */}
      {/* =================================================================== */}
      {credTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={15} className="text-blue-600" />
                <span>Reset Password &amp; PIN · {credTarget.brandName}</span>
              </h3>
              <button
                type="button"
                onClick={() => setCredTarget(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCredResetSubmit} className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-mono text-[11px] text-slate-700">
                  Login ID: <strong>{credTarget.loginId}</strong> · Code: <strong>{credTarget.uniqueCode}</strong>
                </div>
                {(() => {
                  const vaultPin = brandOwnerService.getAdminPasscodePreview(credTarget.id, true);
                  if (!vaultPin) return null;
                  return (
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200 text-[11px]">
                      <span className="font-mono text-slate-700">
                        Current PIN Vault:{' '}
                        <strong className="tracking-wider">
                          {showVaultPin ? vaultPin : '••••••'}
                        </strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowVaultPin((v) => !v)}
                          className="inline-flex items-center gap-1 text-blue-700 font-semibold cursor-pointer"
                        >
                          {showVaultPin ? <EyeOff size={12} /> : <Eye size={12} />}
                          <span>{showVaultPin ? 'Hide' : 'Reveal'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyText(`vault-${credTarget.id}`, vaultPin)}
                          className="inline-flex items-center gap-1 text-slate-700 font-semibold cursor-pointer"
                        >
                          {copiedId === `vault-${credTarget.id}` ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedId === `vault-${credTarget.id}` ? 'Copied' : 'Copy PIN'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Password (leave blank to keep existing)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rNewPassword}
                    onChange={(e) => setRNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setRNewPassword(generateRandomPassword())}
                    className="px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 font-semibold cursor-pointer"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New 4–6 Digit Security Passcode (leave blank to keep existing)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={rNewPasscode}
                    onChange={(e) => setRNewPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="4 to 6 numeric digits"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={() => setRNewPasscode(generateRandomPin(6))}
                    className="px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 font-semibold cursor-pointer"
                  >
                    Generate PIN
                  </button>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCredTarget(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                >
                  Update Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
