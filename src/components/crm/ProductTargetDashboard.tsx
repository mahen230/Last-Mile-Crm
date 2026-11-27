import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Award,
  CheckCircle2,
  Clock,
  Edit3,
  Filter,
  Package,
  Plus,
  Search,
  Store,
  Tag,
  Target,
  Trash2,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { productTargetService, ProductTargetProgressRow } from '../../services/productTargetService';
import { customerService } from '../../services/customerService';
import { indiaPostBulkShowcaseService } from '../../services/indiaPostBulkShowcaseService';
import { staffPermissionService } from '../../services/staffPermissionService';
import { POSTAL_SERVICE_TAG_OPTIONS, ProductTargetRecord } from '../../types/models';

export default function ProductTargetDashboard() {
  const { userProfile } = useAuth();
  const activeUser = staffPermissionService.getActiveSession() || userProfile;

  const isSuperOrSuperior =
    staffPermissionService.isSuperAdmin(activeUser) ||
    staffPermissionService.isSuperiorRole(activeUser);

  const [, setRefreshTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<string>('ALL');
  const [periodFilter, setPeriodFilter] = useState<string>('ALL');
  const [notice, setNotice] = useState<string | null>(null);

  // Target Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTargetId, setEditingTargetId] = useState<string>('');
  const [formProductCode, setFormProductCode] = useState<string>('SSA');
  const [formProductName, setFormProductName] = useState<string>('Sukanya Samriddhi Yojana (SSA)');
  const [formServiceTag, setFormServiceTag] = useState<string>(POSTAL_SERVICE_TAG_OPTIONS[2]);
  const [formPeriod, setFormPeriod] = useState<string>('Monthly - Current Cycle');
  const [formTargetUnits, setFormTargetUnits] = useState<number>(15);
  const [formTargetRevenue, setFormTargetRevenue] = useState<number>(150000);
  const [formScopeType, setFormScopeType] = useState<'DIVISION' | 'OFFICE' | 'BEAT' | 'STAFF'>('OFFICE');
  const [formOfficeName, setFormOfficeName] = useState<string>(activeUser?.subOffice || 'Dadabari S.O.');
  const [formPincode, setFormPincode] = useState<string>(activeUser?.officePincode || '324009');
  const [formBeatNo, setFormBeatNo] = useState<string>(activeUser?.beat || 'Beat 2');
  const [formAssignedStaffId, setFormAssignedStaffId] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  useEffect(() => {
    const u1 = productTargetService.subscribe(() => setRefreshTick((t) => t + 1));
    const u2 = customerService.subscribe(() => setRefreshTick((t) => t + 1));
    const u3 = indiaPostBulkShowcaseService.subscribe(() => setRefreshTick((t) => t + 1));
    return () => {
      u1();
      u2();
      u3();
    };
  }, []);

  const catalogItems = useMemo(() => indiaPostBulkShowcaseService.getUnifiedShowcaseCatalog(), []);
  const scopedStaffRoster = useMemo(() => {
    return staffPermissionService
      .getAllStaffProfiles()
      .filter((s) => staffPermissionService.matchesUserBeatScope(activeUser, s));
  }, [activeUser]);

  const progressRows: ProductTargetProgressRow[] = useMemo(() => {
    return productTargetService.computeScopedTargetProgress(activeUser);
  }, [activeUser, setRefreshTick]);

  const periodsList = useMemo(() => {
    return Array.from(new Set(progressRows.map((r) => r.target.period).filter(Boolean)));
  }, [progressRows]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return progressRows.filter((row) => {
      if (scopeFilter !== 'ALL' && row.target.scopeType !== scopeFilter) return false;
      if (periodFilter !== 'ALL' && row.target.period !== periodFilter) return false;
      if (q) {
        const hay = `${row.target.productName} ${row.target.productCode} ${row.target.serviceTag} ${
          row.target.officeName || ''
        } ${row.target.beatNo || ''} ${row.target.pincode || ''} ${
          row.target.assignedStaffName || ''
        }`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [progressRows, scopeFilter, periodFilter, searchQuery]);

  // Aggregate KPI Metrics
  const kpiSummary = useMemo(() => {
    const totalTargetUnits = filteredRows.reduce((s, r) => s + r.target.targetUnits, 0);
    const totalAchievedUnits = filteredRows.reduce((s, r) => s + r.achievedUnits, 0);
    const totalTargetRevenue = filteredRows.reduce((s, r) => s + r.target.targetRevenueInr, 0);
    const totalAchievedRevenue = filteredRows.reduce((s, r) => s + r.achievedRevenueInr, 0);
    const totalPipelineValue = filteredRows.reduce((s, r) => s + r.pipelineValueInr, 0);
    const totalDueFollowUps = filteredRows.reduce((s, r) => s + r.dueFollowUpsCount, 0);
    const totalTaggedCitizens = customerService
      .getScopedCustomers(activeUser)
      .filter((c) => (c.interestedServiceTags || []).length > 0).length;

    const unitPct =
      totalTargetUnits > 0 ? Math.min(100, Math.round((totalAchievedUnits / totalTargetUnits) * 100)) : 0;
    const revPct =
      totalTargetRevenue > 0
        ? Math.min(100, Math.round((totalAchievedRevenue / totalTargetRevenue) * 100))
        : unitPct;

    return {
      activeTargetsCount: filteredRows.length,
      totalTargetUnits,
      totalAchievedUnits,
      unitPct,
      totalTargetRevenue,
      totalAchievedRevenue,
      revPct,
      totalPipelineValue,
      totalDueFollowUps,
      totalTaggedCitizens,
    };
  }, [filteredRows, activeUser]);

  const showToast = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 4500);
  };

  const openCreateModal = () => {
    const firstItem = catalogItems[0];
    setEditingTargetId('');
    setFormProductCode(firstItem?.code || 'SSA');
    setFormProductName(firstItem?.title || 'Sukanya Samriddhi Yojana (SSA)');
    setFormServiceTag(firstItem?.suggestedServiceTags[0] || POSTAL_SERVICE_TAG_OPTIONS[0]);
    setFormPeriod('Monthly - Current Cycle');
    setFormTargetUnits(15);
    setFormTargetRevenue(150000);
    setFormScopeType(staffPermissionService.isSuperAdmin(activeUser) ? 'DIVISION' : 'OFFICE');
    setFormOfficeName(activeUser?.subOffice || 'Dadabari S.O.');
    setFormPincode(activeUser?.officePincode || '324009');
    setFormBeatNo(activeUser?.beat || 'Beat 2');
    setFormAssignedStaffId('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: ProductTargetRecord) => {
    setEditingTargetId(t.id);
    setFormProductCode(t.productCode);
    setFormProductName(t.productName);
    setFormServiceTag(t.serviceTag);
    setFormPeriod(t.period);
    setFormTargetUnits(t.targetUnits);
    setFormTargetRevenue(t.targetRevenueInr);
    setFormScopeType(t.scopeType);
    setFormOfficeName(t.officeName || 'Dadabari S.O.');
    setFormPincode(t.pincode || '324009');
    setFormBeatNo(t.beatNo || 'Beat 2');
    setFormAssignedStaffId(t.assignedStaffId || '');
    setFormNotes(t.notes || '');
    setIsModalOpen(true);
  };

  const handleSelectCatalogProduct = (code: string) => {
    const match = catalogItems.find((i) => i.code === code);
    setFormProductCode(code);
    if (match) {
      setFormProductName(match.title);
      if (match.suggestedServiceTags.length > 0) {
        setFormServiceTag(match.suggestedServiceTags[0]);
      }
      if (match.unitPrice && match.unitPrice > 0) {
        setFormTargetRevenue(match.unitPrice * Math.max(1, formTargetUnits));
      }
    }
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperOrSuperior) return;
    const assignedStaff = scopedStaffRoster.find(
      (s) => s.id === formAssignedStaffId || s.employeeId === formAssignedStaffId
    );
    productTargetService.upsertTarget({
      id: editingTargetId || undefined,
      productCode: formProductCode,
      productName: formProductName,
      serviceTag: formServiceTag,
      period: formPeriod,
      targetUnits: formTargetUnits,
      targetRevenueInr: formTargetRevenue,
      scopeType: formScopeType,
      officeName: formOfficeName.trim() || undefined,
      pincode: formPincode.trim() || undefined,
      beatNo: formScopeType === 'BEAT' || formScopeType === 'STAFF' ? formBeatNo.trim() : undefined,
      assignedStaffId: assignedStaff?.employeeId || assignedStaff?.id || undefined,
      assignedStaffName: assignedStaff?.name || undefined,
      notes: formNotes.trim() || undefined,
      createdBy: activeUser?.email || activeUser?.name || 'Supervisor',
    });
    setIsModalOpen(false);
    showToast(
      editingTargetId
        ? `Updated target for ${formProductName}.`
        : `Created new operational target for ${formProductName}.`
    );
  };

  const handleDeleteTarget = (id: string, name: string) => {
    if (!isSuperOrSuperior) return;
    productTargetService.deleteTarget(id);
    showToast(`Removed target "${name}".`);
  };

  return (
    <div className="space-y-6" id="product-target-dashboard">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 text-white rounded-2xl border border-red-900/50 p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/60 border border-red-700/60 text-amber-300 text-xs font-bold">
              <Target size={14} className="text-amber-400" />
              <span>India Post · Product &amp; Bulk Promotion Target Tracker</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Product Targets, Conversion &amp; Service-Tag Progress
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Live achievement computed directly from your scoped India Post CRM leads, conversions, follow-ups, and citizen interested service tags.{' '}
              <span className="font-mono text-amber-300">
                {staffPermissionService.isSuperAdmin(activeUser)
                  ? 'All Division Jurisdictions'
                  : `${activeUser?.subOffice || 'Assigned Office'} · ${activeUser?.beat || 'Scoped Beat'}`}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/india-post-storefront"
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Store size={14} className="text-amber-400" />
              <span>Open Showcase</span>
            </Link>
            <Link
              to="/leads"
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <TrendingUp size={14} className="text-emerald-400" />
              <span>Leads Pipeline</span>
            </Link>
            {isSuperOrSuperior && (
              <button
                type="button"
                onClick={openCreateModal}
                className="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus size={15} />
                <span>Assign Target</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {notice && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600" />
            {notice}
          </span>
          <button type="button" onClick={() => setNotice(null)} className="cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 6 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Active Targets</span>
            <Target size={16} className="text-red-700" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-2">
            {kpiSummary.activeTargetsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {kpiSummary.totalTargetUnits} target units assigned
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Unit Achievement</span>
            <Award size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums mt-2">
            {kpiSummary.unitPct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {kpiSummary.totalAchievedUnits} / {kpiSummary.totalTargetUnits} converted
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Revenue Achievement</span>
            <TrendingUp size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 font-mono tabular-nums mt-2">
            ₹{kpiSummary.totalAchievedRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {kpiSummary.revPct}% of ₹{kpiSummary.totalTargetRevenue.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Active Pipeline</span>
            <Package size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono tabular-nums mt-2">
            ₹{kpiSummary.totalPipelineValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Open scoped scheme &amp; bulk leads</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Due Follow-Ups</span>
            <Clock size={16} className="text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono tabular-nums mt-2">
            {kpiSummary.totalDueFollowUps}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <Link to="/follow-ups" className="text-red-700 hover:underline font-semibold">
              Open follow-up schedule →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Tagged Citizens</span>
            <Users size={16} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 font-mono tabular-nums mt-2">
            {kpiSummary.totalTaggedCitizens}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <Link to="/customers" className="text-indigo-700 hover:underline font-semibold">
              View interested tags →
            </Link>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search target product, code, service tag, office, PIN, or beat..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-red-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Filter size={13} /> Scope:
          </span>
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-red-600"
          >
            <option value="ALL">All Scopes ({progressRows.length})</option>
            <option value="DIVISION">Division-Wide</option>
            <option value="OFFICE">Office Level</option>
            <option value="BEAT">Beat Level</option>
            <option value="STAFF">Staff Level</option>
          </select>

          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:border-red-600"
          >
            <option value="ALL">All Cycles</option>
            {periodsList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Target Cards Grid */}
      {filteredRows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
          <Target size={32} className="text-slate-400 mx-auto" />
          <div className="text-sm font-bold text-slate-800">No product targets match your filter</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Clear your search/scope filter or assign a new target to track unit &amp; revenue conversion.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRows.map((row) => {
            const { target } = row;
            return (
              <div
                key={target.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-red-300 transition flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-900 font-mono">
                          {target.productCode}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {target.scopeType}
                        </span>
                        {target.officeName && (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                            {target.officeName} {target.pincode ? `(${target.pincode})` : ''}
                          </span>
                        )}
                        {target.beatNo && (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                            {target.beatNo}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-slate-900">{target.productName}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 font-semibold">
                        <Tag size={12} />
                        <span>{target.serviceTag}</span>
                      </div>
                    </div>

                    {isSuperOrSuperior && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditModal(target)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          title="Edit Target"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTarget(target.id, target.productName)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 cursor-pointer"
                          title="Delete Target"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Progress Bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-600">Units Target</span>
                        <span className="font-mono text-slate-900">
                          {row.achievedUnits} / {target.targetUnits} ({row.unitProgressPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all"
                          style={{ width: `${row.unitProgressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-600">Revenue Target</span>
                        <span className="font-mono text-slate-900">
                          ₹{row.achievedRevenueInr.toLocaleString('en-IN')} / ₹
                          {target.targetRevenueInr.toLocaleString('en-IN')} ({row.revenueProgressPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${row.revenueProgressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Operational Breakdown */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="text-[10px] text-slate-500">Leads</div>
                      <div className="font-black text-slate-900 font-mono">{row.matchingLeadsCount}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="text-[10px] text-amber-800">Active</div>
                      <div className="font-black text-amber-900 font-mono">{row.activePipelineCount}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div className="text-[10px] text-emerald-800">Conversion</div>
                      <div className="font-black text-emerald-900 font-mono">{row.conversionPct}%</div>
                    </div>
                    <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200">
                      <div className="text-[10px] text-indigo-800">Tagged Citizens</div>
                      <div className="font-black text-indigo-900 font-mono">{row.taggedCustomersCount}</div>
                    </div>
                  </div>

                  {target.notes && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                      {target.notes}
                    </p>
                  )}
                </div>

                {/* Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {target.period} · Due Follow-ups: <strong className="text-rose-700">{row.dueFollowUpsCount}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/india-post-storefront"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center gap-1"
                    >
                      <Store size={12} />
                      <span>Showcase</span>
                    </Link>
                    <Link
                      to="/leads"
                      state={{ preselectedProduct: target.productCode }}
                      className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold transition flex items-center gap-1"
                    >
                      <span>Capture Lead</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Target Modal (Superiors / Admins / Developer Only) */}
      {isModalOpen && isSuperOrSuperior && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden text-xs max-h-[92vh] flex flex-col">
            <div className="p-4 bg-gradient-to-r from-red-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-amber-400" />
                <h3 className="font-bold text-sm">
                  {editingTargetId ? 'Edit Product Target' : 'Assign New Product / Promotion Target'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTarget} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Product / Offering from Unified Catalog
                  </label>
                  <select
                    value={formProductCode}
                    onChange={(e) => handleSelectCatalogProduct(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    {catalogItems.map((item) => (
                      <option key={`${item.sourceType}-${item.id}`} value={item.code}>
                        [{item.sourceType}] {item.title} ({item.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Title *</label>
                  <input
                    type="text"
                    required
                    value={formProductName}
                    onChange={(e) => setFormProductName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Linked Service Tag *</label>
                  <select
                    value={formServiceTag}
                    onChange={(e) => setFormServiceTag(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    {POSTAL_SERVICE_TAG_OPTIONS.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Units *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formTargetUnits}
                    onChange={(e) => setFormTargetUnits(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Revenue / Deposit (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formTargetRevenue}
                    onChange={(e) => setFormTargetRevenue(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Cycle / Period</label>
                  <input
                    type="text"
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jurisdiction Scope</label>
                  <select
                    value={formScopeType}
                    onChange={(e) => setFormScopeType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    {staffPermissionService.isSuperAdmin(activeUser) && (
                      <option value="DIVISION">Division-Wide</option>
                    )}
                    <option value="OFFICE">Post Office / PIN Level</option>
                    <option value="BEAT">Beat Level</option>
                    <option value="STAFF">Individual Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office Name</label>
                  <input
                    type="text"
                    value={formOfficeName}
                    onChange={(e) => setFormOfficeName(e.target.value)}
                    placeholder="e.g. Dadabari S.O."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office PIN Code</label>
                  <input
                    type="text"
                    value={formPincode}
                    onChange={(e) => setFormPincode(e.target.value)}
                    placeholder="324009"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                {(formScopeType === 'BEAT' || formScopeType === 'STAFF') && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Beat Number</label>
                    <input
                      type="text"
                      value={formBeatNo}
                      onChange={(e) => setFormBeatNo(e.target.value)}
                      placeholder="Beat 2"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                )}

                {formScopeType === 'STAFF' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assign Staff Member</label>
                    <select
                      value={formAssignedStaffId}
                      onChange={(e) => setFormAssignedStaffId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="">-- Select Staff --</option>
                      {scopedStaffRoster.map((s) => (
                        <option key={s.id} value={s.employeeId || s.id}>
                          {s.name} ({s.beat || s.assignedOffice})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Operational Focus Notes</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Focus colonies, bulk customer category, or campaign notes..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>{editingTargetId ? 'Update Target' : 'Save Target'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
