import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Download,
  History,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {
  BRAND_STAFF_ROLE_PRESETS,
  SanitizedBrandOwnerProfile,
} from '../../types/brandOwner';
import { IndiaPostDutyCategory, UserRole } from '../../types/models';
import { staffPermissionService } from '../../services/staffPermissionService';
import { brandOwnerService } from '../../services/brandOwnerService';
import { customerService } from '../../services/customerService';
import { exportCsvWithBom } from '../../services/xpeedoOpsService';
import { CONSOLIDATED_BEAT_MATRIX } from '../../data/consolidatedBeatMatrix';
import OfficeBeatStaffMappedTree from '../common/OfficeBeatStaffMappedTree';

interface TerritoryPromotionMasterViewProps {
  profile: SanitizedBrandOwnerProfile;
  actorName: string;
  actorRole: string;
  initialStaffId?: string;
  onNavigateToMasterRole?: () => void;
  onNavigateToMasterStaff?: () => void;
}

const DESIGNATION_ROLE_OPTIONS: Array<{
  designation: string;
  role: UserRole;
  category: IndiaPostDutyCategory;
  defaultPreset: string;
}> = [
  { designation: 'GDS (BPM / ABPM / Dak Sevak)', role: 'GDS', category: 'Delivery', defaultPreset: 'FIELD_DELIVERY' },
  { designation: 'Postman', role: 'POSTMAN', category: 'Delivery', defaultPreset: 'FIELD_DELIVERY' },
  { designation: 'PA (Postal Assistant)', role: 'STAFF', category: 'Counter & Booking', defaultPreset: 'SUPPORT_DESK' },
  { designation: 'IPPB & Savings Executive', role: 'SALES_FIELD_STAFF', category: 'Banking & IPPB', defaultPreset: 'SALES_EXECUTIVE' },
  { designation: 'SPM / Postmaster', role: 'POSTMASTER', category: 'Supervisory & Division', defaultPreset: 'BRAND_MANAGER' },
  { designation: 'Sub-Postmaster (S.O. Incharge)', role: 'SUB_POSTMASTER', category: 'Supervisory & Division', defaultPreset: 'BRAND_MANAGER' },
  { designation: 'Last Mile Supervisor', role: 'LAST_MILE_SUPERVISOR', category: 'Supervisory & Division', defaultPreset: 'OPERATIONS_SUPERVISOR' },
  { designation: 'Inspector (IP / ASP)', role: 'SUBDIVISION_INCHARGE', category: 'Supervisory & Division', defaultPreset: 'OPERATIONS_SUPERVISOR' },
  { designation: 'Division / Circle Supervisor', role: 'DIVISION_INCHARGE', category: 'Supervisory & Division', defaultPreset: 'BRAND_MANAGER' },
];

export default function TerritoryPromotionMasterView({
  profile,
  actorName,
  actorRole,
  initialStaffId,
  onNavigateToMasterRole,
  onNavigateToMasterStaff,
}: TerritoryPromotionMasterViewProps) {
  const [refreshTick, setRefreshTick] = useState(0);
  const [banner, setBanner] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [historySearch, setHistorySearch] = useState('');

  const operationalStaff = useMemo(() => {
    void refreshTick;
    return brandOwnerService.getBrandTeamMembersWithRbac(profile.id);
  }, [profile.id, refreshTick]);

  const offices = useMemo(() => {
    void refreshTick;
    return staffPermissionService.getDynamicOffices().filter((o) => {
      if (profile.workspaceKey === 'INDIA_POST') {
        return !o.brandId || o.brandId === 'india-post';
      }
      return !o.brandId || o.brandId === profile.partnerSlug;
    });
  }, [profile.partnerSlug, profile.workspaceKey, refreshTick]);

  const beatOptions = useMemo(() => {
    const base = CONSOLIDATED_BEAT_MATRIX.map((b) => b.beatNumber);
    const staffBeats = operationalStaff.map((s) => s.beat).filter(Boolean) as string[];
    return Array.from(new Set([...base, ...staffBeats, 'Beat EC-1', 'Beat EC-2', 'All Beats']));
  }, [operationalStaff]);

  const initialMember =
    operationalStaff.find((s) => s.id === initialStaffId) || operationalStaff[0] || null;

  const [selectedStaffId, setSelectedStaffId] = useState<string>(initialMember?.id || '');
  const activeMember =
    operationalStaff.find((s) => s.id === selectedStaffId) || operationalStaff[0] || null;

  const [newDesignation, setNewDesignation] = useState<string>(
    activeMember?.designation || 'Postman'
  );
  const [newRole, setNewRole] = useState<UserRole>((activeMember?.staffRole || 'POSTMAN') as UserRole);
  const [newPostCategory, setNewPostCategory] = useState<IndiaPostDutyCategory>(
    (activeMember?.postCategory as IndiaPostDutyCategory) || 'Delivery'
  );
  const [rolePresetKey, setRolePresetKey] = useState<string>(
    activeMember?.rolePresetKey || 'FIELD_DELIVERY'
  );
  const [newOfficeName, setNewOfficeName] = useState<string>(
    activeMember?.assignedOffice?.replace(/\s*\(\d{6}\)/g, '') || 'Dadabari S.O.'
  );
  const [newPincode, setNewPincode] = useState<string>('324009');
  const [newBeat, setNewBeat] = useState<string>(activeMember?.beat || 'Beat 2');
  const [effectiveDate, setEffectiveDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [orderRef, setOrderRef] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const handleSelectStaff = (staffId: string) => {
    setSelectedStaffId(staffId);
    const found = operationalStaff.find((m) => m.id === staffId);
    if (found) {
      const cleanOff = (found.assignedOffice || 'Dadabari S.O.').replace(/\s*\(\d{6}\)/g, '').trim();
      const matchedOff = offices.find((o) => o.officeName.toLowerCase().includes(cleanOff.toLowerCase()));
      setNewDesignation(found.designation);
      setNewRole(found.staffRole as UserRole);
      setNewPostCategory((found.postCategory as IndiaPostDutyCategory) || 'Delivery');
      setRolePresetKey(found.rolePresetKey || 'FIELD_DELIVERY');
      setNewOfficeName(matchedOff?.officeName || cleanOff || 'Dadabari S.O.');
      setNewPincode(matchedOff?.pincode || '324009');
      setNewBeat(found.beat || 'Beat 2');
    }
  };

  const handleSelectDesignationOption = (desig: string) => {
    setNewDesignation(desig);
    const match = DESIGNATION_ROLE_OPTIONS.find((opt) => opt.designation === desig);
    if (match) {
      setNewRole(match.role);
      setNewPostCategory(match.category);
      setRolePresetKey(match.defaultPreset);
    }
  };

  const handleSelectOffice = (officeName: string) => {
    setNewOfficeName(officeName);
    const found = offices.find((o) => o.officeName === officeName);
    if (found?.pincode) {
      setNewPincode(found.pincode);
    }
  };

  const handleSubmitPromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMember) {
      setBanner({ kind: 'err', text: 'Select a valid operational staff member first.' });
      return;
    }
    if (!reason.trim()) {
      setBanner({ kind: 'err', text: 'Enter a mandatory transfer / promotion reason for audit_logs.' });
      return;
    }
    if (!/^\d{6}$/.test(newPincode.trim())) {
      setBanner({ kind: 'err', text: 'Enter a valid 6-digit PIN code for target posting office.' });
      return;
    }

    const preset = BRAND_STAFF_ROLE_PRESETS.find((p) => p.key === rolePresetKey);

    const res = brandOwnerService.executeTerritoryPromotionAndAudit({
      brandProfileId: profile.id,
      staffIdOrEmail: activeMember.id,
      newDesignationType: newDesignation,
      newRole,
      newPostCategory,
      newSubOffice: newOfficeName.trim(),
      newPincode: newPincode.trim(),
      newBeat: newBeat.trim(),
      effectiveDate,
      orderRef: orderRef.trim() || undefined,
      reason: reason.trim(),
      rolePresetKey,
      permissionsPatch: preset?.permissions,
      actorName,
      actorRole,
    });

    if (!res.success) {
      setBanner({ kind: 'err', text: res.error || 'Unable to execute promotion.' });
      return;
    }

    setOrderRef('');
    setReason('');
    setRefreshTick((t) => t + 1);
    setBanner({
      kind: 'ok',
      text: res.message || 'Promotion completed and synced to Master Staff, Master Role & audit_logs.',
    });
  };

  const promotionHistory = useMemo(() => {
    void refreshTick;
    const raw = staffPermissionService.getStaffPromotionHistory();
    const q = historySearch.trim().toLowerCase();
    if (!q) return raw;
    return raw.filter(
      (r) =>
        r.staffName.toLowerCase().includes(q) ||
        (r.employeeId || '').toLowerCase().includes(q) ||
        r.newPost.toLowerCase().includes(q) ||
        r.newOffice.toLowerCase().includes(q) ||
        r.newBeat.toLowerCase().includes(q) ||
        (r.notes || '').toLowerCase().includes(q)
    );
  }, [historySearch, refreshTick]);

  const promoAuditLogs = useMemo(() => {
    void refreshTick;
    return customerService
      .getAuditLogs()
      .filter((l) => l.action === 'STAFF_PROMOTION_EXECUTED' || l.entityType === 'Staff')
      .slice(0, 15);
  }, [refreshTick]);

  const handleExportHistory = () => {
    const headers = [
      'Record ID',
      'Staff Name',
      'Employee ID',
      'Old Post',
      'New Post',
      'Old Role',
      'New Role',
      'Old Office',
      'New Office',
      'PIN',
      'Old Beat',
      'New Beat',
      'Effective Date',
      'Order Ref',
      'Reason',
      'Executed By',
      'Timestamp',
    ];
    const rows = promotionHistory.map((r) => [
      r.id,
      r.staffName,
      r.employeeId || '',
      r.previousPost,
      r.newPost,
      r.previousRole,
      r.newRole,
      r.previousOffice,
      r.newOffice,
      r.newPincode || '',
      r.previousBeat,
      r.newBeat,
      r.effectiveDate,
      r.orderRef || '',
      r.notes || '',
      r.promotedBy,
      r.changedAt,
    ]);
    exportCsvWithBom(
      `${profile.partnerSlug}_promotion_master_${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-red-800">
            Territory &amp; Team · {profile.brandName} ({profile.uniqueCode})
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Promotion Master — Role Upgrade &amp; Office / Beat Transfer
          </h2>
          <p className="text-xs text-slate-600 max-w-3xl">
            Execute official promotions, designation changes, and beat/office transfers. Every action atomically updates Master Staff, syncs Master Role RBAC permissions, and records before/after diffs in audit_logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onNavigateToMasterStaff && (
            <button
              type="button"
              onClick={onNavigateToMasterStaff}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold whitespace-nowrap cursor-pointer"
            >
              View Master Staff
            </button>
          )}
          {onNavigateToMasterRole && (
            <button
              type="button"
              onClick={onNavigateToMasterRole}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold whitespace-nowrap cursor-pointer"
            >
              View Master Role
            </button>
          )}
          <button
            type="button"
            onClick={handleExportHistory}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Download size={14} />
            <span>Export Ledger CSV</span>
          </button>
        </div>
      </div>

      {banner && (
        <div
          className={`px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            banner.kind === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            {banner.kind === 'ok' && <CheckCircle2 size={15} className="text-emerald-700" />}
            {banner.text}
          </span>
          <button type="button" onClick={() => setBanner(null)} className="cursor-pointer opacity-70">
            <XCircle size={15} />
          </button>
        </div>
      )}

      {/* Interactive Office-Wise Mapped Tree with Universal Search & Filter Console */}
      <OfficeBeatStaffMappedTree
        title="Interactive Office-Wise Mapped Tree (Promotion Master)"
        subtitle="Click any Office, Beat, or Staff member in the tree to automatically pre-fill the promotion and transfer form below."
        selectedStaffId={selectedStaffId}
        selectedOfficeName={newOfficeName}
        selectedBeat={newBeat}
        onSelectStaff={(staffId) => handleSelectStaff(staffId)}
        onSelectOffice={(officeName, pin) => {
          setNewOfficeName(officeName);
          setNewPincode(pin);
        }}
        onSelectBeat={(beatNum, officeName, pin) => {
          setNewBeat(beatNum);
          if (officeName) setNewOfficeName(officeName);
          if (pin) setNewPincode(pin);
        }}
      />

      {/* Promotion Execution Form */}
      <form
        onSubmit={handleSubmitPromotion}
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-red-800" />
            <h3 className="text-base font-bold text-slate-900">
              01. Execute Promotion / Transfer Order
            </h3>
          </div>
          {activeMember && (
            <div className="text-xs text-slate-600">
              Current Posting: <span className="font-semibold text-slate-900">{activeMember.designation}</span>
              {' · '}
              <span className="font-mono">{activeMember.assignedOffice}</span>
              {' · '}
              <span className="font-semibold text-red-800">{activeMember.beat}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">1. Select Staff Member *</label>
            <select
              value={activeMember?.id || ''}
              onChange={(e) => handleSelectStaff(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 font-semibold"
            >
              {operationalStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.employeeId || s.id}) — {s.beat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">2. New Designation / Official Post *</label>
            <select
              value={newDesignation}
              onChange={(e) => handleSelectDesignationOption(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 font-semibold"
            >
              {DESIGNATION_ROLE_OPTIONS.map((opt) => (
                <option key={opt.designation} value={opt.designation}>
                  {opt.designation}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">3. Duty Category &amp; Role Key</label>
            <select
              value={newPostCategory}
              onChange={(e) => setNewPostCategory(e.target.value as IndiaPostDutyCategory)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 font-semibold"
            >
              <option value="Delivery">Delivery</option>
              <option value="Counter & Booking">Counter &amp; Booking</option>
              <option value="Banking & IPPB">Banking &amp; IPPB</option>
              <option value="Field Survey & Leads">Field Survey &amp; Leads</option>
              <option value="Supervisory & Division">Supervisory &amp; Division</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">4. Sync Master Role Preset</label>
            <select
              value={rolePresetKey}
              onChange={(e) => setRolePresetKey(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 font-semibold"
            >
              {BRAND_STAFF_ROLE_PRESETS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">5. Target Office / Hub *</label>
            <select
              value={newOfficeName}
              onChange={(e) => handleSelectOffice(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 font-semibold"
            >
              {offices.map((o) => (
                <option key={o.id} value={o.officeName}>
                  {o.officeName} ({o.pincode})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">6. Target PIN Code *</label>
            <input
              type="text"
              maxLength={6}
              value={newPincode}
              onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 font-mono text-slate-900 font-semibold"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">7. Target Beat / Territory *</label>
            <select
              value={newBeat}
              onChange={(e) => setNewBeat(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900 font-semibold"
            >
              {beatOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">8. Effective Date *</label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 font-mono text-slate-900 font-semibold"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Official Memo / Order Ref</label>
            <input
              type="text"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              placeholder="e.g. KTA-DIV/2026/PRM-104"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 font-mono text-slate-900"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="font-semibold text-slate-700 block">
              Mandatory Reason / Audit Justification *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Annual Departmental Promotion & Beat Optimization Order (recorded in audit_logs)"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-900"
              required
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-red-800" />
            <span>
              Syncs Master Staff + Master Role RBAC + Operations Tasks + audit_logs atomically.
            </span>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-red-800 hover:bg-red-900 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Execute Promotion &amp; Sync RBAC</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </form>

      {/* Promotion & Audit Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <History size={17} className="text-red-800" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                02. Promotion &amp; Transfer Ledger ({promotionHistory.length})
              </h3>
              <p className="text-xs text-slate-500">
                Before/after diff history across staff postings, office PINs, and role upgrades.
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Filter staff, office, beat, reason..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-red-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Staff Member</th>
                <th className="p-3">Role / Post Diff</th>
                <th className="p-3">Office &amp; Beat Transfer</th>
                <th className="p-3">Effective / Order</th>
                <th className="p-3">Actor &amp; Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {promotionHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{item.staffName}</div>
                    <div className="font-mono text-slate-500">{item.employeeId || item.staffId}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-slate-500 line-through">{item.previousPost} ({item.previousRole})</div>
                    <div className="font-bold text-emerald-800">{item.newPost} ({item.newRole})</div>
                  </td>
                  <td className="p-3">
                    <div className="text-slate-500">{item.previousOffice} · {item.previousBeat}</div>
                    <div className="font-semibold text-slate-900">
                      {item.newOffice} ({item.newPincode || '324009'}) · {item.newBeat}
                    </div>
                  </td>
                  <td className="p-3 font-mono tabular-nums text-slate-700">
                    <div>{item.effectiveDate}</div>
                    {item.orderRef && <div className="text-[11px] text-slate-500">{item.orderRef}</div>}
                  </td>
                  <td className="p-3 text-slate-700">
                    <div className="font-semibold text-slate-900">{item.promotedBy}</div>
                    <div className="text-slate-600">{item.notes || 'Departmental transfer order'}</div>
                  </td>
                </tr>
              ))}
              {promotionHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No promotions recorded yet. Submit a promotion or transfer order above to generate immutable audit records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {promoAuditLogs.length > 0 && (
          <div className="pt-2 space-y-2">
            <div className="text-xs font-semibold text-slate-700">
              Recent audit_logs Verification Entries
            </div>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/50">
              {promoAuditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-red-800">{log.action}</span>
                    {' · '}
                    <span className="font-semibold text-slate-900">{log.entityName}</span>
                    {' — '}
                    <span className="text-slate-600">{log.details}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
