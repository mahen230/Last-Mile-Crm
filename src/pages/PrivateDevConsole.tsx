import React, { useState, useEffect, useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Terminal,
  Crown,
  Settings2,
  Code2,
  UserCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  Download,
  Trash2,
  Activity,
  Lock,
  LogOut,
  Clock,
  MapPin,
  Users,
  PackageCheck,
  Plus,
  Edit3,
  Power,
  Sliders,
  ToggleLeft,
  ToggleRight,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../components/auth/FirebaseAuthProvider';
import { staffPermissionService } from '../services/staffPermissionService';
import {
  featureVisibilityService,
  FEATURE_CATALOG,
} from '../services/featureVisibilityService';
import { Staff, DEFAULT_POSTMAN_GDS_VISIBLE_FEATURES } from '../types/models';
import { safeStorage } from '../utils/safeStorage';
import {
  PINCODE_OFFICE_HUBS,
  INVENTORY_CATEGORY_META,
  STAFF_CATEGORY_OPTIONS,
  InventoryCategoryKey,
  StockStatus,
  StaffRoleTier,
  OnboardedStaffMember,
  pincodeOperationsService,
  getPincodeHub,
} from '../services/pincodeOperationsService';

export const DEV_CONSOLE_MASTER_TOKEN = 'xpokart_master_key_9460020640';
const SESSION_TOKEN_STORAGE_KEY = 'xpokart_dev_console_token';
const AUDIT_LOGS_STORAGE_KEY = 'xpokart_login_audit_logs';

type ConsoleTabId =
  | 'ROLE_GATEWAY'
  | 'PINCODE_HUBS'
  | 'STAFF_ONBOARDING'
  | 'INVENTORY_CONTROL'
  | 'VISIBILITY_CONTROL';

export interface DevConsoleAuditEntry {
  id: string;
  timestamp: string;
  eventType:
    | 'CONSOLE_UNLOCKED'
    | 'ROLE_SWITCH_SUCCESS'
    | 'ROLE_SWITCH_FAILED'
    | 'UNAUTHORIZED_ACCESS_DENIED';
  targetIdentifier: string;
  targetName: string;
  targetRole: string;
  browserInfo: string;
  status: 'SUCCESS' | 'DENIED';
  details: string;
}

function readLocalAuditLogs(): DevConsoleAuditEntry[] {
  try {
    const raw = safeStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function appendLocalAuditLog(
  entry: Omit<DevConsoleAuditEntry, 'id' | 'timestamp' | 'browserInfo'>
): DevConsoleAuditEntry[] {
  const browserInfo =
    typeof navigator !== 'undefined'
      ? `${navigator.platform || 'Web'} · ${navigator.userAgent.slice(0, 72)}`
      : 'Server/Headless';
  const fullEntry: DevConsoleAuditEntry = {
    ...entry,
    id: `AUD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    browserInfo,
  };
  const next = [fullEntry, ...readLocalAuditLogs()].slice(0, 80);
  try {
    safeStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }

  try {
    fetch('/api/v1/auth/dev-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterToken: DEV_CONSOLE_MASTER_TOKEN,
        eventType: fullEntry.eventType,
        targetIdentifier: fullEntry.targetIdentifier,
        targetRole: fullEntry.targetRole,
        status: fullEntry.status,
        details: fullEntry.details,
      }),
    }).catch(() => {});
  } catch {
    // ignore offline error
  }

  return next;
}

export default function PrivateDevConsole() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, signInViaDevConsole, signOut } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const urlToken = (queryParams.get('token') || queryParams.get('key') || '').trim();
  const storedSessionToken =
    typeof sessionStorage !== 'undefined'
      ? (sessionStorage.getItem(SESSION_TOKEN_STORAGE_KEY) || '').trim()
      : '';

  const isElevatedSession =
    Boolean(userProfile?.role) &&
    ['OWNER', 'MASTER_ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(
      String(userProfile?.role || '').toUpperCase()
    );

  const isAuthorized = useMemo(() => {
    if (isElevatedSession) return true;
    if (urlToken) {
      return urlToken === DEV_CONSOLE_MASTER_TOKEN;
    }
    return storedSessionToken === DEV_CONSOLE_MASTER_TOKEN;
  }, [isElevatedSession, urlToken, storedSessionToken]);

  const [activeTab, setActiveTab] = useState<ConsoleTabId>('ROLE_GATEWAY');
  const [auditLogs, setAuditLogs] = useState<DevConsoleAuditEntry[]>(() => readLocalAuditLogs());
  const [serverLogs, setServerLogs] = useState<
    Array<{
      id: string;
      timestamp: string;
      eventType: string;
      userId: string;
      ipAddress: string;
      statusCode: number;
      details: string;
    }>
  >([]);
  const [staffDirectory] = useState<Staff[]>(() => staffPermissionService.getDirectoryStaff());
  const [searchTerm, setSearchTerm] = useState('');
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRefreshingServer, setIsRefreshingServer] = useState(false);

  // Operations state synchronized with pincodeOperationsService
  const [opsRevision, setOpsRevision] = useState(0);
  const [selectedHubPin, setSelectedHubPin] = useState<string>('324009');
  const [inventoryTargetScope, setInventoryTargetScope] = useState<string>('324009');

  // Staff Onboarding CRUD state
  const [staffFilterPin, setStaffFilterPin] = useState<string>('ALL');
  const [staffFilterRole, setStaffFilterRole] = useState<string>('ALL');
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState<{
    name: string;
    roleTier: StaffRoleTier;
    category: string;
    pincode: string;
    beatNumber: string;
    contactPhone: string;
  }>({
    name: '',
    roleTier: 'Delivery Executive',
    category: STAFF_CATEGORY_OPTIONS[0],
    pincode: '324009',
    beatNumber: 'Beat 2',
    contactPhone: '',
  });

  const [visTargetRole, setVisTargetRole] = useState<string>('POSTMAN');

  useEffect(() => {
    const u1 = pincodeOperationsService.subscribe(() => {
      setOpsRevision((r) => r + 1);
    });
    const u2 = featureVisibilityService.subscribe(() => {
      setOpsRevision((r) => r + 1);
    });
    return () => {
      u1();
      u2();
    };
  }, []);

  const fetchServerAuditLogs = async () => {
    setIsRefreshingServer(true);
    try {
      const token =
        safeStorage.getItem('xpokart_auth_token') ||
        safeStorage.getItem('xpeedo_auth_token') ||
        '';
      const res = await fetch('/api/v1/system/sync-logs', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && Array.isArray(json.logs)) {
          setServerLogs(json.logs);
        }
      }
    } catch {
      // ignore offline preview
    } finally {
      setIsRefreshingServer(false);
    }
  };

  useEffect(() => {
    if (!isAuthorized) {
      appendLocalAuditLog({
        eventType: 'UNAUTHORIZED_ACCESS_DENIED',
        targetIdentifier: urlToken ? 'INVALID_KEY' : 'MISSING_KEY',
        targetName: 'Blocked Visitor',
        targetRole: 'NONE',
        status: 'DENIED',
        details: `Blocked unverified access attempt to /dev-command-secure-portal (${urlToken ? 'wrong token' : 'missing token'}). Redirected to Home.`,
      });
      return;
    }

    try {
      sessionStorage.setItem(SESSION_TOKEN_STORAGE_KEY, DEV_CONSOLE_MASTER_TOKEN);
    } catch {
      // ignore
    }

    if (urlToken === DEV_CONSOLE_MASTER_TOKEN) {
      const next = appendLocalAuditLog({
        eventType: 'CONSOLE_UNLOCKED',
        targetIdentifier: userProfile?.employeeId || 'MASTER-LINK',
        targetName: userProfile?.name || 'Verified Master Link',
        targetRole: userProfile?.role || 'GATEWAY',
        status: 'SUCCESS',
        details: 'Private Developer & Master Command Console unlocked via Master Token.',
      });
      setAuditLogs(next);
    }

    fetchServerAuditLogs();
  }, [isAuthorized, urlToken]);

  const onboardedStaff: OnboardedStaffMember[] = useMemo(() => {
    void opsRevision;
    return pincodeOperationsService.getStaffRoster().filter((m) => {
      const pinMatch = staffFilterPin === 'ALL' || m.pincode === staffFilterPin;
      const roleMatch = staffFilterRole === 'ALL' || m.roleTier === staffFilterRole;
      return pinMatch && roleMatch;
    });
  }, [opsRevision, staffFilterPin, staffFilterRole]);

  const activeInventoryPreviewPin =
    inventoryTargetScope === 'ALL_13_HUBS' ? '324009' : inventoryTargetScope;

  const inventoryMap = useMemo(() => {
    void opsRevision;
    return pincodeOperationsService.getInventoryForPincode(activeInventoryPreviewPin);
  }, [opsRevision, activeInventoryPreviewPin]);

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  const handleInstantLogin = async (
    identifier: string,
    labelName: string,
    labelRole: string,
    redirectToDashboard = true
  ) => {
    setSwitchingId(identifier);
    setStatusMessage(null);
    const ok = await signInViaDevConsole(identifier, DEV_CONSOLE_MASTER_TOKEN);
    if (ok) {
      const next = appendLocalAuditLog({
        eventType: 'ROLE_SWITCH_SUCCESS',
        targetIdentifier: identifier,
        targetName: labelName,
        targetRole: labelRole,
        status: 'SUCCESS',
        details: `Instant 1-click gateway login into ${labelName} (${labelRole} · ${identifier}).`,
      });
      setAuditLogs(next);
      setStatusMessage({
        type: 'success',
        text: `Authorized as ${labelName} (${labelRole}). ${redirectToDashboard ? 'Opening Dashboard...' : ''}`,
      });
      await fetchServerAuditLogs();
      if (redirectToDashboard) {
        setTimeout(() => navigate('/dashboard'), 350);
      }
    } else {
      const next = appendLocalAuditLog({
        eventType: 'ROLE_SWITCH_FAILED',
        targetIdentifier: identifier,
        targetName: labelName,
        targetRole: labelRole,
        status: 'DENIED',
        details: `Failed instant switch to ${identifier}.`,
      });
      setAuditLogs(next);
      setStatusMessage({
        type: 'error',
        text: `Could not authenticate ${labelName} (${identifier}).`,
      });
    }
    setSwitchingId(null);
  };

  const secretPortalUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/dev-command-secure-portal`
      : `/dev-command-secure-portal`;

  const handleCopySecretUrl = async () => {
    try {
      await navigator.clipboard.writeText(secretPortalUrl);
    } catch {
      // ignore
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleExportAuditJson = () => {
    const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `indiapost_login_audit_logs_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearLocalLogs = () => {
    safeStorage.removeItem(AUDIT_LOGS_STORAGE_KEY);
    setAuditLogs([]);
    setStatusMessage({ type: 'success', text: 'Local browser login audit logs cleared.' });
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.contactPhone.trim()) return;
    if (editingStaffId) {
      pincodeOperationsService.updateStaffMember(editingStaffId, {
        name: staffForm.name.trim(),
        roleTier: staffForm.roleTier,
        category: staffForm.category,
        pincode: staffForm.pincode,
        beatNumber: staffForm.beatNumber.trim() || 'Beat 2',
        contactPhone: staffForm.contactPhone.trim(),
      });
      setStatusMessage({ type: 'success', text: `Updated staff member "${staffForm.name.trim()}".` });
      setEditingStaffId(null);
    } else {
      pincodeOperationsService.addStaffMember({
        name: staffForm.name.trim(),
        roleTier: staffForm.roleTier,
        category: staffForm.category,
        pincode: staffForm.pincode,
        beatNumber: staffForm.beatNumber.trim() || 'Beat 2',
        contactPhone: staffForm.contactPhone.trim(),
        active: true,
      });
      setStatusMessage({
        type: 'success',
        text: `Onboarded ${staffForm.name.trim()} (${staffForm.roleTier}) to PIN ${staffForm.pincode}.`,
      });
    }
    setStaffForm({
      name: '',
      roleTier: 'Delivery Executive',
      category: STAFF_CATEGORY_OPTIONS[0],
      pincode: staffForm.pincode,
      beatNumber: 'Beat 2',
      contactPhone: '',
    });
  };

  const handleEditStaff = (member: OnboardedStaffMember) => {
    setEditingStaffId(member.id);
    setStaffForm({
      name: member.name,
      roleTier: member.roleTier,
      category: member.category,
      pincode: member.pincode,
      beatNumber: member.beatNumber,
      contactPhone: member.contactPhone,
    });
  };

  const handleToggleOpen = (categoryKey: InventoryCategoryKey, currentOpen: boolean) => {
    pincodeOperationsService.updateCategoryInventory(inventoryTargetScope, categoryKey, {
      open: !currentOpen,
    });
    setStatusMessage({
      type: 'success',
      text: `${categoryKey} ${!currentOpen ? 'OPENED' : 'CLOSED'} for ${
        inventoryTargetScope === 'ALL_13_HUBS'
          ? 'all 13 Kota & Baran Hubs'
          : `PIN ${inventoryTargetScope}`
      }. Public storefront synced live.`,
    });
  };

  const handleStockStatusChange = (categoryKey: InventoryCategoryKey, stockStatus: StockStatus) => {
    pincodeOperationsService.updateCategoryInventory(inventoryTargetScope, categoryKey, {
      stockStatus,
    });
    setStatusMessage({
      type: 'success',
      text: `Updated ${categoryKey} stock to ${stockStatus} for ${
        inventoryTargetScope === 'ALL_13_HUBS'
          ? 'all 13 Kota & Baran Hubs'
          : `PIN ${inventoryTargetScope}`
      }.`,
    });
  };

  const filteredStaff = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return staffDirectory;
    return staffDirectory.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.employeeId || s.id || '').toLowerCase().includes(q) ||
        (s.beat || '').toLowerCase().includes(q) ||
        (s.contact || '').includes(q) ||
        (s.email || '').toLowerCase().includes(q)
    );
  }, [searchTerm, staffDirectory]);

  const primaryCommandRoles = [
    {
      id: 'OWNER-01',
      title: 'Owner / Super Admin',
      person: 'Mahendra Kumar Meena (Exec Owner)',
      contact: '9460020640',
      email: 'mahen.comtech@gmail.com',
      beat: 'All 13 Hubs · Dadabari S.O.',
      badge: 'OWNER',
      gradient: 'from-amber-500 via-orange-600 to-red-700',
      icon: Crown,
    },
    {
      id: 'ektamahenmeena@gmail.com',
      title: 'Master Admin',
      person: 'Ekta Meena',
      contact: '8279275805',
      email: 'ektamahenmeena@gmail.com',
      beat: 'All 13 Hubs · Kota & Baran Control',
      badge: 'MASTER_ADMIN',
      gradient: 'from-rose-600 via-red-700 to-slate-900',
      icon: Settings2,
    },
    {
      id: 'DEV-01',
      title: 'Lead Systems Developer',
      person: 'India Post Systems Architect',
      contact: '9414170563',
      email: 'Ektamahenmeena@gmail.com',
      beat: 'API Health, DB Sync & RBAC',
      badge: 'DEVELOPER',
      gradient: 'from-indigo-600 via-violet-700 to-slate-900',
      icon: Code2,
    },
    {
      id: '50457421',
      title: 'Official Staff / Postman (Beat 2)',
      person: 'Mahendra Kumar Meena',
      contact: '8769706002',
      email: 'mahen.comtech@gmail.com',
      beat: 'Dadabari S.O. Beat 2',
      badge: 'POSTMAN',
      gradient: 'from-emerald-600 via-teal-700 to-slate-900',
      icon: UserCheck,
    },
  ];

  const selectedHub = getPincodeHub(selectedHubPin);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* TOP HEADER BANNER */}
        <header className="rounded-3xl bg-gradient-to-r from-slate-900 via-red-950/60 to-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              <Lock size={13} />
              <span>Private Master Gateway Unlocked · 13-Pincode Operations Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Terminal className="text-amber-400 shrink-0" size={26} />
              <span>India Post Master Admin &amp; Developer Command Console</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Kota &amp; Baran Division (13 Pincode Hubs · Regional Operations 324001–325205) · Live RBAC switcher, multi-hub staff onboarding, and showcase controls.
            </p>
            {userProfile && (
              <div className="text-xs font-mono text-amber-300 pt-1 flex flex-wrap items-center gap-2">
                <span>Active Session:</span>
                <strong className="text-white">{userProfile.name}</strong>
                <span>({userProfile.role} · {userProfile.employeeId || userProfile.id})</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopySecretUrl}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
            >
              {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedLink ? 'Private Link Copied' : 'Copy Private Access URL'}</span>
            </button>

            {userProfile && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition"
              >
                <span>Open Dashboard</span>
                <ArrowRight size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer transition"
            >
              Public Storefront
            </button>

            {userProfile && (
              <button
                type="button"
                onClick={() => signOut()}
                className="px-3 py-2.5 bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700/50 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                title="Clear active staff session"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </header>

        {/* TAB BAR NAVIGATION */}
        <nav className="flex flex-wrap gap-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
          {[
            { id: 'ROLE_GATEWAY' as ConsoleTabId, label: 'Role Switcher & Audit Logs', icon: ShieldCheck },
            { id: 'PINCODE_HUBS' as ConsoleTabId, label: '13 Pincode Hubs Directory', icon: MapPin },
            { id: 'STAFF_ONBOARDING' as ConsoleTabId, label: `Staff Onboarding (${onboardedStaff.length})`, icon: Users },
            { id: 'INVENTORY_CONTROL' as ConsoleTabId, label: 'Live Storefront Open/Stock', icon: PackageCheck },
            { id: 'VISIBILITY_CONTROL' as ConsoleTabId, label: 'Visibility & Vendor Isolation', icon: Sliders },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <TabIcon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {statusMessage && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
                : 'bg-red-950/90 border-red-700 text-red-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle size={17} className="text-red-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* TAB 1: ROLE SWITCHER & AUDIT LOGS */}
        {activeTab === 'ROLE_GATEWAY' && (
          <div className="space-y-6">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <span>1-Click Sovereign &amp; Executive Role Switcher</span>
                </h2>
                <span className="text-[11px] font-mono text-slate-400">
                  Issues signed RBAC session immediately
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {primaryCommandRoles.map((card) => {
                  const IconComp = card.icon;
                  const isBusy = switchingId === card.id;
                  return (
                    <div
                      key={card.id}
                      className={`rounded-2xl bg-gradient-to-br ${card.gradient} p-5 border border-white/15 shadow-xl flex flex-col justify-between gap-4`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="p-2.5 rounded-xl bg-black/30 text-white">
                            <IconComp size={20} />
                          </div>
                          <span className="px-2.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono text-[10px] font-black">
                            {card.badge}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-black text-base text-white">{card.title}</h3>
                          <div className="text-xs font-semibold text-white/90 mt-0.5">{card.person}</div>
                        </div>
                        <div className="text-[11px] font-mono text-white/80 space-y-0.5 pt-1 border-t border-white/15">
                          <div>ID / Mobile: {card.contact}</div>
                          <div className="truncate">Email: {card.email}</div>
                          <div>Scope: {card.beat}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleInstantLogin(card.id, card.person, card.badge, true)}
                        className="w-full py-2.5 px-3 bg-white hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <span>{isBusy ? 'Authorizing Session...' : `Instant Login as ${card.badge}`}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-black text-white">
                      Official Beat Staff Directory ({staffDirectory.length})
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Launch directly into any Beat Postman or Sub-Postmaster workspace.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-56">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search Beat, Name, ID..."
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {filteredStaff.map((staff) => {
                    const staffKey = staff.employeeId || staff.email || staff.id;
                    const isBusy = switchingId === staffKey;
                    return (
                      <div
                        key={staff.id}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate flex items-center gap-2">
                            <span>{staff.name}</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-mono text-[10px]">
                              {staff.beat || 'All Beats'}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5 tabular-nums">
                            {staff.employeeId || staff.id} · {staff.contact || 'N/A'} · {staff.role}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            handleInstantLogin(staffKey, staff.name, staff.role || 'POSTMAN', true)
                          }
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shrink-0 cursor-pointer transition"
                        >
                          {isBusy ? '...' : 'Login'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-6 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-black text-white flex items-center gap-2">
                      <Activity size={15} className="text-emerald-400" />
                      <span>Live Login Audit Logger (India Post)</span>
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Persisted securely with quota-safe truncation.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleExportAuditJson}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download size={12} />
                      <span>Export</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearLocalLogs}
                      className="px-2.5 py-1.5 bg-red-950 hover:bg-red-900 text-red-200 border border-red-800/50 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No local login audit events recorded yet.
                    </div>
                  ) : (
                    auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                              log.status === 'SUCCESS'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {log.eventType}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1 tabular-nums">
                            <Clock size={10} />
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </span>
                        </div>
                        <div className="font-semibold text-white">{log.details}</div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">
                          Actor: {log.targetName} ({log.targetRole}) · {log.browserInfo}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300">Server RBAC Sync Audit Feed</span>
                    <button
                      type="button"
                      onClick={fetchServerAuditLogs}
                      disabled={isRefreshingServer}
                      className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={11} className={isRefreshingServer ? 'animate-spin' : ''} />
                      <span>Refresh Backend Logs</span>
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 text-[11px]">
                    {serverLogs.length === 0 ? (
                      <div className="text-slate-500 text-center py-2">
                        Backend server sync logs active when running Express runtime.
                      </div>
                    ) : (
                      serverLogs.slice(0, 6).map((s) => (
                        <div
                          key={s.id}
                          className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2"
                        >
                          <span className="font-mono text-amber-300 shrink-0">{s.eventType}</span>
                          <span className="text-slate-300 truncate">{s.details}</span>
                          <span className="font-mono text-emerald-400 shrink-0">{s.statusCode}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: ALL 13 PINCODE OFFICE HUBS */}
        {activeTab === 'PINCODE_HUBS' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-white">
                    Kota &amp; Baran Division — All 13 Delivery Pincode Hubs
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Click any hub to inspect coordinates, SLA, and jump straight into Inventory or Staff control.
                  </p>
                </div>
                <span className="font-mono text-xs text-amber-300 font-bold tabular-nums">
                  {PINCODE_OFFICE_HUBS.length} Hubs Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[540px] overflow-y-auto pr-1">
                {PINCODE_OFFICE_HUBS.map((hub) => {
                  const active = hub.pincode === selectedHubPin;
                  return (
                    <button
                      key={hub.pincode}
                      type="button"
                      onClick={() => setSelectedHubPin(hub.pincode)}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer space-y-1.5 ${
                        active
                          ? 'bg-amber-400/10 border-amber-400 shadow-md'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-black text-amber-300 tabular-nums">
                          PIN {hub.pincode}
                        </span>
                        <span className="font-mono text-[10px] text-emerald-400 font-bold tabular-nums">
                          {hub.slaMinutes}m SLA · {hub.beatsCount} Beats
                        </span>
                      </div>
                      <div className="font-bold text-sm text-white truncate">{hub.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {hub.officeName} · {hub.division}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded bg-red-900/70 text-amber-300 tabular-nums">
                  PIN {selectedHub.pincode}
                </span>
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                  {selectedHub.lat.toFixed(4)}°N, {selectedHub.lng.toFixed(4)}°E
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">{selectedHub.name}</h3>
                <p className="text-xs text-slate-400">
                  {selectedHub.officeName} · {selectedHub.division}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Lead Officer:</span>
                  <span className="font-bold text-white">{selectedHub.beatManager}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Beats:</span>
                  <span className="font-mono font-bold text-amber-300 tabular-nums">{selectedHub.beatsCount} Beats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Express Delivery SLA:</span>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">{selectedHub.slaMinutes} Minutes</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-400">Key Coverage Landmarks:</div>
                <div className="text-xs text-slate-200 leading-relaxed">
                  {selectedHub.landmarks.join(' · ')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setInventoryTargetScope(selectedHub.pincode);
                    setActiveTab('INVENTORY_CONTROL');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer transition"
                >
                  Manage Inventory
                </button>
                <button
                  type="button"
                  onClick={() => {
                    pincodeOperationsService.setActivePincode(selectedHub.pincode);
                    navigate('/');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition"
                >
                  Preview Storefront
                </button>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: MULTI-PINCODE STAFF ONBOARDING (FULL CRUD) */}
        {activeTab === 'STAFF_ONBOARDING' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form
              onSubmit={handleStaffSubmit}
              className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <Plus size={16} className="text-amber-400" />
                  <span>{editingStaffId ? 'Edit Staff Allocation' : 'Onboard New Staff / Vendor'}</span>
                </h2>
                {editingStaffId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStaffId(null);
                      setStaffForm({
                        name: '',
                        roleTier: 'Delivery Executive',
                        category: STAFF_CATEGORY_OPTIONS[0],
                        pincode: '324009',
                        beatNumber: 'Beat 2',
                        contactPhone: '',
                      });
                    }}
                    className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Full Name / Partner Store *</label>
                  <input
                    type="text"
                    required
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    placeholder="e.g. Suresh Chaudhary"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Role Tier *</label>
                    <select
                      value={staffForm.roleTier}
                      onChange={(e) =>
                        setStaffForm({ ...staffForm, roleTier: e.target.value as StaffRoleTier })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Management">Management</option>
                      <option value="Delivery Executive">Delivery Executive</option>
                      <option value="Beat Postman">Beat Postman</option>
                      <option value="Local Vendor">Local Vendor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Assigned Pincode *</label>
                    <select
                      value={staffForm.pincode}
                      onChange={(e) => setStaffForm({ ...staffForm, pincode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                    >
                      {PINCODE_OFFICE_HUBS.map((hub) => (
                        <option key={hub.pincode} value={hub.pincode}>
                          {hub.pincode} · {hub.name.split(' ')[0]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Operational Category *</label>
                  <select
                    value={staffForm.category}
                    onChange={(e) => setStaffForm({ ...staffForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    {STAFF_CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Beat Allocation</label>
                    <input
                      type="text"
                      value={staffForm.beatNumber}
                      onChange={(e) => setStaffForm({ ...staffForm, beatNumber: e.target.value })}
                      placeholder="e.g. Beat 2"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Internal Mobile *</label>
                    <input
                      type="tel"
                      required
                      value={staffForm.contactPhone}
                      onChange={(e) => setStaffForm({ ...staffForm, contactPhone: e.target.value })}
                      placeholder="10-digit mobile"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition cursor-pointer shadow-md"
              >
                {editingStaffId ? 'Save Staff Updates' : 'Onboard & Assign to Pincode Hub'}
              </button>
            </form>

            <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-black text-white">
                    Active Staff &amp; Vendor Roster ({onboardedStaff.length})
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Internal operational directory synced across all 13 pincode hubs.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <select
                    value={staffFilterPin}
                    onChange={(e) => setStaffFilterPin(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  >
                    <option value="ALL">All 13 Hubs</option>
                    {PINCODE_OFFICE_HUBS.map((h) => (
                      <option key={h.pincode} value={h.pincode}>
                        PIN {h.pincode}
                      </option>
                    ))}
                  </select>

                  <select
                    value={staffFilterRole}
                    onChange={(e) => setStaffFilterRole(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="ALL">All Role Tiers</option>
                    <option value="Management">Management</option>
                    <option value="Delivery Executive">Delivery Executive</option>
                    <option value="Beat Postman">Beat Postman</option>
                    <option value="Local Vendor">Local Vendor</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {onboardedStaff.map((member) => (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm">{member.name}</span>
                        <span className="font-mono text-[10px] font-bold text-amber-300">
                          {member.roleTier}
                        </span>
                        <span
                          className={`font-mono text-[10px] font-bold ${
                            member.active ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          · {member.active ? 'ACTIVE' : 'PAUSED'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                        PIN {member.pincode} · {member.beatNumber} · {member.category} · Ph: {member.contactPhone}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditStaff(member)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer transition"
                        title="Edit member"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => pincodeOperationsService.toggleStaffActive(member.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                          member.active
                            ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500'
                        }`}
                      >
                        {member.active ? 'Pause' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => pincodeOperationsService.removeStaffMember(member.id)}
                        className="p-2 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 cursor-pointer transition"
                        title="Remove member"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: LIVE STOREFRONT OPEN/CLOSE & STOCK CONTROL */}
        {activeTab === 'INVENTORY_CONTROL' && (
          <section className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <PackageCheck size={18} className="text-amber-400" />
                  <span>Live Pincode Storefront Open/Close &amp; Category Stock Gating</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Toggle storefront status or inventory level per pincode or apply across all 13 Kota &amp; Baran hubs. Updates public catalog rows immediately.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label className="text-xs font-bold text-slate-300">Target Scope:</label>
                <select
                  value={inventoryTargetScope}
                  onChange={(e) => setInventoryTargetScope(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="ALL_13_HUBS">ALL 13 PINCODE HUBS (Bulk Apply)</option>
                  {PINCODE_OFFICE_HUBS.map((hub) => (
                    <option key={hub.pincode} value={hub.pincode}>
                      PIN {hub.pincode} · {hub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INVENTORY_CATEGORY_META.map((cat) => {
                const state = inventoryMap[cat.key];
                return (
                  <div
                    key={cat.key}
                    className={`p-4 rounded-2xl border transition space-y-3 ${
                      state.open && state.stockStatus !== 'OUT_OF_STOCK'
                        ? 'bg-slate-950/90 border-slate-800'
                        : 'bg-rose-950/20 border-rose-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-black text-sm text-white">{cat.label}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          #{cat.sectionId} · Preview PIN {activeInventoryPreviewPin}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleOpen(cat.key, state.open)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 cursor-pointer transition ${
                          state.open
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-rose-700 hover:bg-rose-600 text-white'
                        }`}
                      >
                        <Power size={11} />
                        <span>{state.open ? 'OPEN' : 'CLOSED'}</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-400">Stock Level Status:</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] as StockStatus[]).map(
                          (statusVal) => {
                            const selected = state.stockStatus === statusVal;
                            return (
                              <button
                                key={statusVal}
                                type="button"
                                onClick={() => handleStockStatusChange(cat.key, statusVal)}
                                className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer border ${
                                  selected
                                    ? statusVal === 'IN_STOCK'
                                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                      : statusVal === 'LOW_STOCK'
                                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                                        : 'bg-rose-600 text-white border-rose-500'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                }`}
                              >
                                {statusVal === 'IN_STOCK'
                                  ? 'IN STOCK'
                                  : statusVal === 'LOW_STOCK'
                                    ? 'LOW'
                                    : 'OUT'}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 5: DYNAMIC FEATURE VISIBILITY & VENDOR ISOLATION */}
        {activeTab === 'VISIBILITY_CONTROL' && (
          <section className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Sliders size={18} className="text-amber-400" />
                  <span>Developer Dynamic Feature Visibility &amp; White-Label Control</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Postman &amp; GDS default to Property, Members, Showcase, Leads, Master Search &amp; Last-Mile Ops. Toggle modules dynamically or jump to full per-user scope controls.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={visTargetRole}
                  onChange={(e) => setVisTargetRole(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-amber-300"
                >
                  <option value="POSTMAN">POSTMAN</option>
                  <option value="GDS">GDS</option>
                  <option value="STAFF">STAFF</option>
                  <option value="POSTMASTER">POSTMASTER</option>
                  <option value="SUB_POSTMASTER">SUB_POSTMASTER</option>
                  <option value="OFFICE_INCHARGE">OFFICE_INCHARGE</option>
                  <option value="BLOCK_INCHARGE">BLOCK_INCHARGE</option>
                  <option value="CLUSTER_INCHARGE">CLUSTER_INCHARGE</option>
                  <option value="SUBDIVISION_INCHARGE">SUBDIVISION_INCHARGE</option>
                  <option value="LAST_MILE_SUPERVISOR">LAST_MILE_SUPERVISOR</option>
                  <option value="MARKETING_TEAM">MARKETING_TEAM</option>
                  <option value="DISTRICT_MANAGER">DISTRICT_MANAGER</option>
                  <option value="DISTRICT_INCHARGE">DISTRICT_INCHARGE</option>
                  <option value="DIVISION_INCHARGE">DIVISION_INCHARGE</option>
                  <option value="CIRCLE_INCHARGE">CIRCLE_INCHARGE</option>
                  <option value="CATEGORY_MANAGER">CATEGORY_MANAGER</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    featureVisibilityService.resetPostmanAndGdsToDefault(userProfile?.name || 'DEV_CONSOLE');
                    setStatusMessage({
                      type: 'success',
                      text: 'Reset POSTMAN & GDS visibility defaults to Core Beat Workspace (Property, Members, Showcase, Leads, Master Search, Last-Mile Ops).',
                    });
                  }}
                  className="px-3.5 py-2 bg-red-700 hover:bg-red-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset Postman &amp; GDS Default</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/role-access-dashboard', { state: { initialTab: 'VISIBILITY' } })}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black cursor-pointer"
                >
                  Full Vendor Scope Matrix →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FEATURE_CATALOG.map((feat) => {
                const enabled = featureVisibilityService.isRoleFeatureEnabled(visTargetRole, feat.key);
                const isCore = DEFAULT_POSTMAN_GDS_VISIBLE_FEATURES.includes(feat.key);
                return (
                  <div
                    key={feat.key}
                    className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                      enabled
                        ? 'bg-emerald-950/30 border-emerald-700/60'
                        : 'bg-slate-950 border-slate-800 opacity-85'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs font-black text-white flex items-center gap-1.5 flex-wrap">
                        <span>{feat.label}</span>
                        {isCore && (
                          <span className="text-[10px] font-mono text-emerald-400">· Default</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{feat.description}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        featureVisibilityService.setRoleFeatureVisibility(
                          visTargetRole,
                          feat.key,
                          !enabled,
                          userProfile?.name || 'DEV_CONSOLE'
                        );
                        setStatusMessage({
                          type: 'success',
                          text: `${feat.label} set to ${!enabled ? 'SHOW' : 'HIDE'} for ${visTargetRole}.`,
                        });
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 cursor-pointer shrink-0 ${
                        enabled
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {enabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      <span>{enabled ? 'SHOW' : 'HIDE'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
