import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Lock,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  XCircle,
} from 'lucide-react';
import {
  ALL_BRAND_STAFF_SECTIONS,
  BRAND_STAFF_ROLE_PRESETS,
  BrandMemberPermissions,
  BrandStaffSectionKey,
  BrandTeamMemberRbacView,
  SanitizedBrandOwnerProfile,
} from '../../types/brandOwner';
import { brandOwnerService } from '../../services/brandOwnerService';
import { customerService } from '../../services/customerService';

interface TerritoryMasterRoleViewProps {
  profile: SanitizedBrandOwnerProfile;
  actorName: string;
  onNavigateToPromotion?: (staffId: string) => void;
  onNavigateToMasterStaff?: () => void;
}

const CAPABILITY_COLUMNS: Array<{
  key: keyof Omit<BrandMemberPermissions, 'allowedSections'>;
  label: string;
  shortDesc: string;
}> = [
  { key: 'canViewAllBrandCustomers', label: 'All Records', shortDesc: 'Unlocks full brand vs. beat scope' },
  { key: 'canCreateCustomerOrLead', label: 'Create CRM', shortDesc: 'Add customers, properties & leads' },
  { key: 'canEditCustomer', label: 'Edit CRM', shortDesc: 'Modify existing citizen & property data' },
  { key: 'canManageSrmOrTasks', label: 'Tasks & SRM', shortDesc: 'Manage tickets, tasks & follow-ups' },
  { key: 'canViewOpsQueue', label: 'Ops Queue', shortDesc: 'Access daily ops & dispatch queues' },
  { key: 'canManageOfficesOrBeats', label: 'Offices / Beats', shortDesc: 'Edit office master & beat mapping' },
  { key: 'canExportReports', label: 'Export CSV', shortDesc: 'Download UTF-8 BOM audit & CRM exports' },
];

export default function TerritoryMasterRoleView({
  profile,
  actorName,
  onNavigateToPromotion,
  onNavigateToMasterStaff,
}: TerritoryMasterRoleViewProps) {
  const [refreshTick, setRefreshTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [draftPerms, setDraftPerms] = useState<BrandMemberPermissions | null>(null);
  const [draftPresetKey, setDraftPresetKey] = useState<string>('');
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const members = useMemo(() => {
    void refreshTick;
    return brandOwnerService.getBrandTeamMembersWithRbac(profile.id);
  }, [profile.id, refreshTick]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.employeeId || '').toLowerCase().includes(q) ||
        m.staffRole.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        (m.beat || '').toLowerCase().includes(q) ||
        (m.assignedOffice || '').toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  const showStatus = (kind: 'ok' | 'err', text: string) => {
    setFeedback({ kind, text });
    window.setTimeout(() => setFeedback(null), 5000);
  };

  const beginEditMember = (m: BrandTeamMemberRbacView) => {
    setEditingMemberId(m.id);
    setDraftPresetKey(m.rolePresetKey || '');
    setDraftPerms({
      ...m.permissions,
      allowedSections: [...(m.permissions.allowedSections || ['OVERVIEW', 'MY_PROFILE'])],
    });
  };

  const applyPresetToDraft = (presetKey: string) => {
    const preset = BRAND_STAFF_ROLE_PRESETS.find((p) => p.key === presetKey);
    if (!preset) return;
    setDraftPresetKey(preset.key);
    setDraftPerms({
      ...preset.permissions,
      allowedSections: [...(preset.permissions.allowedSections || ['OVERVIEW', 'MY_PROFILE'])],
    });
  };

  const toggleDraftSection = (sectionKey: BrandStaffSectionKey) => {
    if (!draftPerms) return;
    const current = new Set(draftPerms.allowedSections || []);
    if (current.has(sectionKey)) {
      if (current.size > 1) current.delete(sectionKey);
    } else {
      current.add(sectionKey);
    }
    setDraftPerms({
      ...draftPerms,
      allowedSections: Array.from(current),
    });
  };

  const saveMemberMatrix = (member: BrandTeamMemberRbacView) => {
    if (!draftPerms) return;
    const matchedPreset = BRAND_STAFF_ROLE_PRESETS.find((p) => p.key === draftPresetKey);
    const nextRole = matchedPreset?.staffRole || member.staffRole;
    const nextDesig = matchedPreset?.designation || member.designation;
    const nextCategory = matchedPreset?.postCategory || member.postCategory;

    const result = brandOwnerService.updateBrandTeamMemberRbac(
      profile.id,
      member.id,
      {
        rolePresetKey: draftPresetKey || member.rolePresetKey,
        staffRole: nextRole,
        designation: nextDesig,
        postCategory: nextCategory,
        assignedOffice: member.assignedOffice,
        beat: member.beat,
        status: member.status === 'Inactive' ? 'Inactive' : 'Active',
        permissions: draftPerms,
        notes: 'Updated via Territory & Team -> Master Role Permission Matrix',
      },
      actorName
    );

    if (result.success === false) {
      showStatus('err', result.error);
      return;
    }

    customerService.logAudit(
      'MASTER_ROLE_UPDATED',
      'Staff',
      member.id,
      member.name,
      `Updated RBAC Matrix by ${actorName}: Role=${nextRole}, AllRecords=${draftPerms.canViewAllBrandCustomers ? 'Yes' : 'Beat-Scoped'}, Sections=[${(draftPerms.allowedSections || []).join(', ')}]`
    );

    setEditingMemberId(null);
    setDraftPerms(null);
    setRefreshTick((t) => t + 1);
    showStatus('ok', `Saved Master Role permissions for ${member.name} and recorded audit log.`);
  };

  const activeCount = members.filter((m) => m.status === 'Active').length;
  const fullScopeCount = members.filter((m) => m.permissions.canViewAllBrandCustomers).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-red-800">
            Territory &amp; Team · {profile.brandName} ({profile.uniqueCode})
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Master Role — RBAC Permission &amp; Scope Matrix
          </h2>
          <p className="text-xs text-slate-600 max-w-3xl">
            Centralized role governance controlling module access, beat-scoped vs. all-record boundaries, sidebar sections, and single-device session locks. Linked live with Master Staff and Promotion Master.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onNavigateToMasterStaff && (
            <button
              type="button"
              onClick={onNavigateToMasterStaff}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold whitespace-nowrap cursor-pointer"
            >
              Open Master Staff
            </button>
          )}
          {onNavigateToPromotion && (
            <button
              type="button"
              onClick={() => onNavigateToPromotion(members[0]?.id || '')}
              className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-900 text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
            >
              Promotion Master Workflow
            </button>
          )}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 font-medium">Role Templates</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {BRAND_STAFF_ROLE_PRESETS.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Standard operational RBAC presets</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 font-medium">Active Operational Accounts</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {activeCount} / {members.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Zero XPOKART staff leakage</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 font-medium">Scope Boundaries</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
            {fullScopeCount} Full · {Math.max(0, members.length - fullScopeCount)} Beat
          </div>
          <div className="text-xs text-slate-500 mt-1">All-records vs. beat-locked access</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Lock size={13} className="text-red-700" />
            <span>Single-Device Session Lock</span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">Enforced</div>
          <div className="text-xs text-slate-500 mt-1">Concurrent login takeover protected</div>
        </div>
      </div>

      {feedback && (
        <div
          className={`px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            feedback.kind === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <span>{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)} className="cursor-pointer opacity-70">
            <XCircle size={15} />
          </button>
        </div>
      )}

      {/* Role Preset Reference Blueprint */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">01. Standard Role Presets &amp; Boundaries</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Each role template governs data visibility, CRM actions, and permitted modules across the scoped brand portal.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {BRAND_STAFF_ROLE_PRESETS.map((preset) => (
            <div key={preset.key} className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-2">
              <div className="text-sm font-bold text-slate-900 leading-snug">{preset.designation}</div>
              <div className="text-xs text-slate-500 font-mono">
                {preset.staffRole} · {preset.postCategory || 'Operational'}
              </div>
              <div className="pt-2 border-t border-slate-200 text-xs text-slate-700 space-y-1">
                <div>
                  Scope: <span className="font-semibold">{preset.permissions.canViewAllBrandCustomers ? 'All Brand Records' : 'Assigned Beat Only'}</span>
                </div>
                <div>
                  Offices/Beats: <span className="font-semibold">{preset.permissions.canManageOfficesOrBeats ? 'Write' : 'Read-Only'}</span>
                </div>
                <div>
                  Sections: <span className="font-mono tabular-nums font-semibold">{preset.permissions.allowedSections?.length || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Staff Capability Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">02. Live Staff RBAC &amp; Module Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Changes made here persist immediately to Master Staff RBAC overrides and audit_logs.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter staff, role, office, beat..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-red-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Staff &amp; Role</th>
                <th className="p-3">Office &amp; Beat</th>
                {CAPABILITY_COLUMNS.map((col) => (
                  <th key={col.key} className="p-3 text-center whitespace-nowrap" title={col.shortDesc}>
                    {col.label}
                  </th>
                ))}
                <th className="p-3 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((m) => {
                const isEditing = editingMemberId === m.id && draftPerms !== null;
                const activePerms = isEditing ? draftPerms! : m.permissions;

                return (
                  <React.Fragment key={m.id}>
                    <tr className={isEditing ? 'bg-red-50/40' : 'hover:bg-slate-50/80'}>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{m.name}</div>
                        <div className="text-slate-500 mt-0.5">
                          <span className="font-mono">{m.employeeId || m.id}</span>
                          {' · '}
                          <span>{m.designation}</span>
                          {' · '}
                          <span className="font-mono text-red-800">{m.staffRole}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-700">
                        <div className="font-medium">{m.assignedOffice || 'Dadabari S.O.'}</div>
                        <div className="text-slate-500">
                          {m.beat || 'Beat 1'} · {m.status}
                        </div>
                      </td>
                      {CAPABILITY_COLUMNS.map((col) => {
                        const enabled = Boolean(activePerms[col.key]);
                        return (
                          <td key={col.key} className="p-3 text-center">
                            {isEditing ? (
                              <input
                                type="checkbox"
                                checked={enabled}
                                onChange={(e) =>
                                  setDraftPerms({
                                    ...draftPerms!,
                                    [col.key]: e.target.checked,
                                  })
                                }
                                className="h-4 w-4 accent-red-800 cursor-pointer"
                              />
                            ) : enabled ? (
                              <CheckCircle2 size={15} className="text-emerald-600 mx-auto" />
                            ) : (
                              <span className="text-slate-300 font-mono">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveMemberMatrix(m)}
                              className="px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white font-semibold cursor-pointer"
                            >
                              Save Matrix
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMemberId(null);
                                setDraftPerms(null);
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => beginEditMember(m)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <SlidersHorizontal size={12} />
                              <span>Edit Matrix</span>
                            </button>
                            {onNavigateToPromotion && (
                              <button
                                type="button"
                                onClick={() => onNavigateToPromotion(m.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <UserCheck size={12} />
                                <span>Promote</span>
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>

                    {isEditing && draftPerms && (
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <td colSpan={CAPABILITY_COLUMNS.length + 3} className="p-4 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <ShieldCheck size={15} className="text-red-800" />
                              <span className="font-bold text-slate-900">
                                Quick Apply Role Preset for {m.name}:
                              </span>
                              <select
                                value={draftPresetKey}
                                onChange={(e) => applyPresetToDraft(e.target.value)}
                                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800"
                              >
                                <option value="">Keep Custom Role ({m.staffRole})</option>
                                {BRAND_STAFF_ROLE_PRESETS.map((p) => (
                                  <option key={p.key} value={p.key}>
                                    {p.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <span className="text-xs text-slate-500">
                              Staff Sidebar Modules ({(draftPerms.allowedSections || []).length} enabled)
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {ALL_BRAND_STAFF_SECTIONS.map((sec) => {
                              const checked = (draftPerms.allowedSections || []).includes(sec.key);
                              return (
                                <label
                                  key={sec.key}
                                  className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer ${
                                    checked
                                      ? 'bg-white border-red-300 text-slate-900'
                                      : 'bg-slate-100/60 border-slate-200 text-slate-500'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleDraftSection(sec.key)}
                                    className="mt-0.5 accent-red-800"
                                  />
                                  <div>
                                    <div className="font-semibold text-xs">{sec.label}</div>
                                    <div className="text-[11px] text-slate-500">{sec.shortDesc}</div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={CAPABILITY_COLUMNS.length + 3} className="p-8 text-center text-slate-500">
                    No staff members matched the current search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
