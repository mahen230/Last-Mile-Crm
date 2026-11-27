import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BarChart2,
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileSpreadsheet,
  FolderKanban,
  Layers,
  Search,
  ShieldCheck,
  Target,
  Ticket,
  Zap,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { xpeedoOpsService, PLATFORM_RBAC_ROLE_META } from '../../services/xpeedoOpsService';
import { customerService } from '../../services/customerService';
import { staffPermissionService } from '../../services/staffPermissionService';
import { productTargetService } from '../../services/productTargetService';
import { ALL_OPS_TASK_STATUSES } from '../../types/xpeedoOps';
import DashboardQuickActionsFab from '../common/DashboardQuickActionsFab';
import { PublicShortUrlManager } from '../common/PublicShortUrlManager';

export default function OwnerCommandDashboard() {
  const { userProfile } = useAuth();
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubOps = xpeedoOpsService.subscribe(() => setTick((t) => t + 1));
    const unsubCust = customerService.subscribe(() => setTick((t) => t + 1));
    const unsubStaff = staffPermissionService.subscribe(() => setTick((t) => t + 1));
    return () => {
      unsubOps();
      unsubCust();
      unsubStaff();
    };
  }, []);

  const activeWorkspace = xpeedoOpsService.getActiveWorkspaceFilter();
  const role = xpeedoOpsService.resolvePlatformRole(userProfile);
  const clients = xpeedoOpsService.getClients(userProfile);
  const projects = xpeedoOpsService.getProjects(activeWorkspace);
  const tasks = xpeedoOpsService.getTasks(activeWorkspace);
  const workReports = xpeedoOpsService.getWorkReports(activeWorkspace);
  const srmTickets = xpeedoOpsService.getSrmTickets();
  const departments = xpeedoOpsService.getDepartments(activeWorkspace);
  const workflows = xpeedoOpsService.getWorkflows();
  const financeEntries = xpeedoOpsService.getFinanceEntries(activeWorkspace);
  const activityLogs = xpeedoOpsService.getActivityLogs(activeWorkspace).slice(0, 8);

  const postalOffices = useMemo(() => staffPermissionService.getDynamicOffices(), []);
  const postalStaff = useMemo(() => staffPermissionService.getAllStaffProfiles(), []);
  const postalCustomers = useMemo(() => customerService.getCustomers(), []);
  const postalProperties = useMemo(() => customerService.getProperties(), []);

  const activeProjectsCount = projects.filter((p) => p.status === 'Active' || p.status === 'Planning').length;
  const openTasksCount = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled').length;
  const blockedTasksCount = tasks.filter((t) => t.status === 'Blocked').length;
  const pendingApprovalsCount = workReports.filter((r) => r.approvalStage.startsWith('PENDING_')).length;
  const openSrmCount = srmTickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length;
  const escalatedSrmCount = srmTickets.filter((t) => t.status === 'Escalated').length;
  const totalFinanceInr = financeEntries.reduce((sum, f) => sum + (Number(f.amountInr) || 0), 0);

  const taskStatusChartData = useMemo(() => {
    return ALL_OPS_TASK_STATUSES.map((st) => ({
      status: st,
      count: tasks.filter((t) => t.status === st).length,
    }));
  }, [tasks]);

  const activeClients = clients.filter((c) => c.moduleScope !== 'BASIC_PROFILE_ONLY');
  const targetProgressRows = useMemo(
    () => productTargetService.computeScopedTargetProgress(userProfile),
    [userProfile, postalCustomers.length]
  );

  return (
    <div className="space-y-6" id="owner-command-dashboard">
      {/* Header Band */}
      <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-mono text-red-400 tracking-wide uppercase">
              India Post · Owner &amp; Divisional Command Center
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Postal Operations &amp; Bulk Customer Governance
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Signed in as <span className="font-semibold text-white">{userProfile?.name || 'Administrator'}</span> ·{' '}
              <span className="text-amber-300 font-medium">{PLATFORM_RBAC_ROLE_META[role].label}</span> · Scope:{' '}
              <span className="font-mono text-slate-200">{activeWorkspace === 'ALL' ? 'All India Post Units' : activeWorkspace}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/india-post"
              className="px-3.5 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Building2 size={14} />
              <span>India Post Command</span>
            </Link>
            <Link
              to="/india-post-storefront"
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Briefcase size={14} />
              <span>Showcase</span>
            </Link>
            <Link
              to="/product-targets"
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Target size={14} />
              <span>Product Targets</span>
            </Link>
            <Link
              to="/master-search"
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Search size={14} />
              <span>Master Search</span>
            </Link>
            <Link
              to="/reports"
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <BarChart2 size={14} />
              <span>Superior Reports</span>
            </Link>
            <Link
              to="/settings"
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <FileSpreadsheet size={14} />
              <span>Migration</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (Dynamically Computed Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Link
          to="/clients"
          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-400 transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Clients Registered</span>
            <Building2 size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-2">{clients.length}</div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {activeClients.length} active units · {workflows.filter((w) => w.enabled).length} workflows
          </div>
        </Link>

        <Link
          to="/projects"
          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-400 transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Projects</span>
            <FolderKanban size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-2">{activeProjectsCount}</div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">{projects.length} total projects</div>
        </Link>

        <Link
          to="/task-management"
          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-400 transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Open Tasks</span>
            <ClipboardList size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-2">{openTasksCount}</div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {blockedTasksCount} blocked · {tasks.length} total
          </div>
        </Link>

        <Link
          to="/india-post-storefront"
          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-red-400 transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Approvals</span>
            <Clock size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-2">{pendingApprovalsCount}</div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {departments.length} departments · {workReports.length} reports
          </div>
        </Link>

        <Link
          to="/india-post"
          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-400 transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>India Post SRM Open</span>
            <Ticket size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-2">{openSrmCount}</div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {escalatedSrmCount} escalated · {srmTickets.length} logged
          </div>
        </Link>

        <Link
          to="/finance"
          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-400 transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Finance Ledger</span>
            <Layers size={16} className="text-slate-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-2">
            ₹{totalFinanceInr.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {financeEntries.length} recorded entries
          </div>
        </Link>
      </div>

      {/* Active Operations Systems vs Basic Client Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* India Post Kota Division & Pan-India Live Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-red-700 uppercase">
                Postal Command · Full Operations System
              </span>
              <span className="text-xs font-semibold text-emerald-700">Active System</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">Department of Post — Kota Division</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Circle-to-BO postal hierarchy, 10-level geographic registry, CRM, SRM SLA ticketing,
              beats, attendance, and statutory documents scaled for local PINs &amp; Pan-India rollout.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <div className="text-slate-500">Offices Loaded</div>
              <div className="text-base font-bold text-slate-900 tabular-nums">{postalOffices.length}</div>
            </div>
            <div>
              <div className="text-slate-500">Staff Records</div>
              <div className="text-base font-bold text-slate-900 tabular-nums">{postalStaff.length}</div>
            </div>
            <div>
              <div className="text-slate-500">Properties Mapped</div>
              <div className="text-base font-bold text-slate-900 tabular-nums">{postalProperties.length}</div>
            </div>
            <div>
              <div className="text-slate-500">Citizen Directory</div>
              <div className="text-base font-bold text-slate-900 tabular-nums">{postalCustomers.length}</div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Link
              to="/india-post"
              className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1"
            >
              <span>Open India Post System</span>
              <ArrowUpRight size={14} />
            </Link>
            <Link
              to="/clients/client-india-post"
              className="text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              10-Tab Profile
            </Link>
          </div>
        </div>

        {/* India Post Bulk Customer & Product Promotion Hub */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-red-700 uppercase">
                Bulk Promotion · Showcase &amp; Dispatch
              </span>
              <span className="text-xs font-semibold text-emerald-700">Active Hub</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">India Post — Bulk Customer Hub</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Manage verified India Post Bulk Customers, promoted product catalogs, Speed Post &amp; Parcel
              dispatch inquiries, and direct lead syncing into Citizen CRM.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <div className="text-slate-500">Operational Units</div>
              <div className="text-base font-bold text-slate-900 tabular-nums">
                {departments.length}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Active Projects</div>
              <div className="text-base font-bold text-slate-900 tabular-nums">
                {activeProjectsCount}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Open Tasks</div>
              <div className="text-base font-bold text-slate-900 tabular-nums">
                {openTasksCount}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Work Reports</div>
              <div className="text-base font-bold text-slate-900 tabular-nums">
                {workReports.length}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Link
              to="/india-post-storefront"
              className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1"
            >
              <span>Manage Bulk Showcase</span>
              <ArrowUpRight size={14} />
            </Link>
            <Link
              to="/indiapost-portal"
              className="text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Public Storefront
            </Link>
          </div>
        </div>

        {/* Product Targets & Superior MIS Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-red-700 uppercase">
                Target &amp; Performance MIS
              </span>
              <span className="text-xs font-semibold text-emerald-700">Live Rollup</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">Product Targets &amp; Superior MIS</h2>
            <p className="text-xs text-slate-600">
              Live unit and revenue progress across Postal Schemes, IPPB, CELC, and Bulk Showcase items.
            </p>
          </div>

          <div className="space-y-2.5">
            {targetProgressRows.slice(0, 4).map((row) => (
              <div key={row.target.id} className="space-y-1 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 truncate">{row.target.productName}</span>
                  <span className="font-mono text-[11px] font-bold text-slate-700 shrink-0">
                    {row.achievedUnits}/{row.target.targetUnits} ({row.unitProgressPct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-700 rounded-full"
                    style={{ width: `${row.unitProgressPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <Link
              to="/product-targets"
              className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1"
            >
              <span>Target Dashboard</span>
              <ArrowUpRight size={14} />
            </Link>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
              <Link to="/master-search" className="hover:text-slate-900">Master Search</Link>
              <Link to="/reports" className="hover:text-slate-900">Superior Reports</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Task Distribution Chart + Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Task Pipeline Distribution</h3>
              <p className="text-xs text-slate-500">
                Live breakdown across all 8 workflow states ({tasks.length} tasks recorded)
              </p>
            </div>
            <Link
              to="/task-management"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Open Task Engine</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
          {tasks.length === 0 ? (
            <div className="h-56 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 space-y-2">
              <CheckCircle2 size={24} className="text-slate-400" />
              <div className="text-sm font-semibold text-slate-700">No tasks created yet</div>
              <p className="text-xs text-slate-500 max-w-sm">
                Create a project and task inside Task Management or India Post Command to see live
                status metrics here.
              </p>
              <Link
                to="/task-management"
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition"
              >
                Create First Task
              </Link>
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskStatusChartData} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#475569' }} interval={0} angle={-18} textAnchor="end" height={46} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Workspace Activity Audit</h3>
              <p className="text-xs text-slate-500">Latest actor, role, entity &amp; workspace logs</p>
            </div>
            <Link to="/settings" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Full Logs
            </Link>
          </div>
          {activityLogs.length === 0 ? (
            <div className="h-56 rounded-lg bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-6 space-y-1.5">
              <ShieldCheck size={22} className="text-slate-400" />
              <div className="text-sm font-semibold text-slate-700">Audit Trail Ready</div>
              <p className="text-xs text-slate-500">
                Every create, update, approval, SRM action, and Excel/CSV import is logged automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto custom-scrollbar">
              {activityLogs.map((log) => (
                <div key={log.id} className="py-2.5 space-y-0.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 truncate">{log.action}</span>
                    <span className="font-mono text-[11px] text-slate-400 tabular-nums shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-slate-600 truncate">{log.summary}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {log.actor} · {log.actorRole} · {log.workspaceId}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick System Governance Links */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Zap size={16} className="text-blue-600" />
          <span>Strict workspace &amp; RBAC isolation active across all routes and queries.</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 font-semibold text-blue-600">
          <Link to="/workflows" className="hover:underline">Automation Workflows</Link>
          <Link to="/employees" className="hover:underline">Employee Directory</Link>
          <Link to="/reports-center" className="hover:underline">Reports &amp; Exports</Link>
          <Link to="/settings" className="hover:underline">8-Role RBAC &amp; Migration</Link>
        </div>
      </div>
      <PublicShortUrlManager />
      <DashboardQuickActionsFab />
    </div>
  );
}
