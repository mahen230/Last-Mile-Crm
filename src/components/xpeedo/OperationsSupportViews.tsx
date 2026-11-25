import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Briefcase,
  CheckCheck,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Layers,
  Play,
  Plus,
  Search,
  Users,
  Wallet,
  Workflow,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import {
  exportCsvWithBom,
  PLATFORM_RBAC_ROLE_META,
  xpeedoOpsService,
} from '../../services/xpeedoOpsService';
import { staffPermissionService } from '../../services/staffPermissionService';
import {
  OpsDocumentEntry,
  OpsFinanceEntry,
  WorkflowTriggerType,
} from '../../types/xpeedoOps';

// ============================================================================
// 1. DEPARTMENTS DIRECTORY VIEW (/departments)
// ============================================================================
export function DepartmentsDirectoryView() {
  const { userProfile } = useAuth();
  const [, setTick] = useState(0);
  const [wsFilter, setWsFilter] = useState<string>(xpeedoOpsService.getActiveWorkspaceFilter());
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [headName, setHeadName] = useState('');
  const [description, setDescription] = useState('');
  const [targetClientId, setTargetClientId] = useState('client-xpeedo-ev');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => xpeedoOpsService.subscribe(() => setTick((t) => t + 1)), []);

  const role = xpeedoOpsService.resolvePlatformRole(userProfile);
  const canManage = xpeedoOpsService.canPerform(userProfile, 'manageDepartments');
  const clients = xpeedoOpsService.getClients(userProfile);
  const departments = xpeedoOpsService.getDepartments(wsFilter);
  const projects = xpeedoOpsService.getProjects(wsFilter);
  const tasks = xpeedoOpsService.getTasks(wsFilter);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    const cli = clients.find((c) => c.id === targetClientId) || clients[0];
    xpeedoOpsService.upsertDepartment(
      {
        clientId: cli?.id || targetClientId,
        workspaceId: cli?.workspaceKey || 'XPEEDO_EV',
        name: name.trim(),
        code: code.trim().toUpperCase(),
        headName: headName.trim() || 'Unassigned (Configure Head)',
        description: description.trim() || `${name.trim()} operational unit`,
        isActive: true,
      },
      userProfile?.name || 'Admin',
      role
    );
    setName('');
    setCode('');
    setHeadName('');
    setDescription('');
    setNotice('Department saved.');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6" id="departments-directory-view">
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-blue-600 uppercase font-semibold">
            Organizational Structure
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
            <Layers size={20} className="text-blue-600" />
            <span>Departments Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Workspace-scoped functional departments across Xpeedo EV and registered client systems
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={wsFilter}
            onChange={(e) => setWsFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 bg-white"
          >
            <option value="ALL">All Permitted Workspaces</option>
            {clients.map((c) => (
              <option key={c.id} value={c.workspaceKey}>
                {c.name} ({c.workspaceKey})
              </option>
            ))}
          </select>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={15} />
          <span>{notice}</span>
        </div>
      )}

      {canManage && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 md:grid-cols-6 gap-3 items-end"
        >
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Client / Workspace</label>
            <select
              value={targetClientId}
              onChange={(e) => setTargetClientId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Quality Assurance"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Code *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="EV-QA"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Department Head</label>
            <input
              type="text"
              value={headName}
              onChange={(e) => setHeadName(e.target.value)}
              placeholder="Assigned Head Name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Scope Summary</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Responsibilities"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Department</span>
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const deptProjects = projects.filter((p) => p.departmentId === dept.id).length;
          const deptTasks = tasks.filter((t) => t.departmentId === dept.id).length;
          return (
            <div key={dept.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-mono text-slate-500">
                    {dept.code} · {dept.workspaceId}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{dept.name}</h3>
                </div>
                <button
                  type="button"
                  disabled={!canManage}
                  onClick={() =>
                    xpeedoOpsService.upsertDepartment(
                      { ...dept, isActive: !dept.isActive },
                      userProfile?.name || 'Admin',
                      role
                    )
                  }
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold border cursor-pointer disabled:opacity-60 ${
                    dept.isActive
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  {dept.isActive ? 'Active' : 'Paused'}
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{dept.description}</p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-500">
                  Head: <span className="font-semibold text-slate-800">{dept.headName}</span>
                </div>
                <div className="font-mono text-slate-600 tabular-nums">
                  {deptProjects} proj · {deptTasks} tasks
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 2. EMPLOYEES DIRECTORY VIEW (/employees)
// ============================================================================
export function EmployeesDirectoryView() {
  const { userProfile } = useAuth();
  const [, setTick] = useState(0);
  const [search, setSearch] = useState('');
  const [workspaceFilter, setWorkspaceFilter] = useState('ALL');

  useEffect(() => {
    const u1 = staffPermissionService.subscribe(() => setTick((t) => t + 1));
    const u2 = xpeedoOpsService.subscribe(() => setTick((t) => t + 1));
    return () => {
      u1();
      u2();
    };
  }, []);

  const scopedKeys = xpeedoOpsService.getScopedWorkspaceKeys(userProfile);
  const allStaff = staffPermissionService.getAllStaffProfiles();
  const allTasks = xpeedoOpsService.getTasks();

  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allStaff.filter((s) => {
      const staffWs =
        s.vendorScope?.assignedVendorId === 'EV_MOBILITY' ||
        (s.brandId || '').toLowerCase().includes('ev')
          ? 'XPEEDO_EV'
          : 'INDIA_POST';
      if (scopedKeys !== 'ALL' && !scopedKeys.includes(staffWs)) return false;
      if (workspaceFilter !== 'ALL' && staffWs !== workspaceFilter) return false;
      if (q) {
        const hay = `${s.name} ${s.employeeId} ${s.role} ${s.assignedOffice} ${s.beat} ${s.contact}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allStaff, scopedKeys, workspaceFilter, search]);

  const handleExport = () => {
    exportCsvWithBom(
      `xpeedo_employees_${new Date().toISOString().split('T')[0]}.csv`,
      ['Employee ID', 'Name', 'Role', 'Designation', 'Workspace', 'Assigned Office', 'Beat', 'Contact', 'Status'],
      filteredStaff.map((s) => [
        s.employeeId || s.id,
        s.name,
        s.role,
        s.designationType || s.role,
        s.vendorScope?.assignedVendorId || s.brandId || 'INDIA_POST',
        s.assignedOffice || s.subOffice || '',
        s.beat || '',
        s.contact || '',
        s.status || 'Active',
      ])
    );
  };

  return (
    <div className="space-y-6" id="employees-directory-view">
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-blue-600 uppercase font-semibold">
            Workforce &amp; Role Allocation
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
            <Users size={20} className="text-blue-600" />
            <span>Employees Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified personnel across permitted workspaces ({filteredStaff.length} visible)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ID, office, beat..."
              className="pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs w-60"
            />
          </div>
          <select
            value={workspaceFilter}
            onChange={(e) => setWorkspaceFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
          >
            <option value="ALL">All Permitted Workspaces</option>
            <option value="INDIA_POST">India Post (Kota Division)</option>
            <option value="XPEEDO_EV">Xpeedo EV</option>
          </select>
          <button
            type="button"
            onClick={handleExport}
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Emp ID</th>
              <th className="py-3 px-4">Role / Designation</th>
              <th className="py-3 px-4">Workspace</th>
              <th className="py-3 px-4">Office / Beat</th>
              <th className="py-3 px-4 text-right">Assigned Tasks</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No matching employees within current workspace isolation boundary.
                </td>
              </tr>
            ) : (
              filteredStaff.map((s) => {
                const taskCount = allTasks.filter(
                  (t) =>
                    t.assigneeId === s.id ||
                    t.assigneeName.toLowerCase() === (s.name || '').toLowerCase()
                ).length;
                const wsLabel =
                  s.vendorScope?.assignedVendorId === 'EV_MOBILITY' ||
                  (s.brandId || '').toLowerCase().includes('ev')
                    ? 'XPEEDO_EV'
                    : 'INDIA_POST';
                return (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {s.name}
                      {s.contact && (
                        <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                          {s.contact}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{s.employeeId || s.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{s.designationType || s.role}</div>
                      <div className="text-[11px] font-mono text-slate-500">{s.role}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{wsLabel}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {s.assignedOffice || s.subOffice || '—'}
                      {s.beat ? ` · ${s.beat}` : ''}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {taskCount}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold text-emerald-700">
                        {s.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// 3. SHARED AUTOMATION WORKFLOWS (/workflows)
// ============================================================================
export function WorkflowsAutomationView() {
  const { userProfile } = useAuth();
  const [, setTick] = useState(0);
  const [name, setName] = useState('');
  const [workspaceId, setWorkspaceId] = useState('ALL');
  const [trigger, setTrigger] = useState<WorkflowTriggerType>('TASK_BLOCKED');
  const [conditionSummary, setConditionSummary] = useState('');
  const [actionSummary, setActionSummary] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => xpeedoOpsService.subscribe(() => setTick((t) => t + 1)), []);

  const role = xpeedoOpsService.resolvePlatformRole(userProfile);
  const canManage = xpeedoOpsService.canPerform(userProfile, 'manageWorkflows');
  const workflows = xpeedoOpsService.getWorkflows();
  const logs = xpeedoOpsService.getWorkflowLogs();
  const clients = xpeedoOpsService.getClients(userProfile);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !actionSummary.trim()) return;
    xpeedoOpsService.createWorkflow(
      {
        name: name.trim(),
        workspaceId,
        trigger,
        conditionSummary: conditionSummary.trim() || 'Always match trigger event',
        actionSummary: actionSummary.trim(),
        enabled: true,
        createdBy: userProfile?.name || 'Owner',
      },
      userProfile?.name || 'Owner',
      role
    );
    setName('');
    setConditionSummary('');
    setActionSummary('');
    setNotice('Automation rule added and armed.');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6" id="workflows-automation-view">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="text-xs font-mono text-blue-600 uppercase font-semibold">
          Shared Automation Engine
        </div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
          <Workflow size={20} className="text-blue-600" />
          <span>Workflows &amp; Execution Audit Logs</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Trigger → Condition → Action rules enforced across SRM, Work Reports, Tasks, and Migrations
        </p>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={15} />
          <span>{notice}</span>
        </div>
      )}

      {canManage && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 md:grid-cols-6 gap-3 items-end"
        >
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Rule Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Escalate Urgent Task"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Workspace</label>
            <select
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
            >
              <option value="ALL">All Workspaces</option>
              {clients.map((c) => (
                <option key={c.id} value={c.workspaceKey}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Trigger</label>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value as WorkflowTriggerType)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
            >
              <option value="SRM_TICKET_CREATED">SRM_TICKET_CREATED</option>
              <option value="TASK_BLOCKED">TASK_BLOCKED</option>
              <option value="WORK_REPORT_SUBMITTED">WORK_REPORT_SUBMITTED</option>
              <option value="LEAD_CREATED">LEAD_CREATED</option>
              <option value="MIGRATION_COMPLETED">MIGRATION_COMPLETED</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Condition</label>
            <input
              type="text"
              value={conditionSummary}
              onChange={(e) => setConditionSummary(e.target.value)}
              placeholder="Priority == Critical"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Action *</label>
            <input
              type="text"
              required
              value={actionSummary}
              onChange={(e) => setActionSummary(e.target.value)}
              placeholder="Notify Manager & Log Alert"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Rule</span>
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Configured Rules ({workflows.length})</h2>
          {workflows.map((wf) => (
            <div key={wf.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-mono text-blue-600 font-semibold">
                    {wf.trigger} · {wf.workspaceId}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{wf.name}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={!canManage}
                    onClick={() => {
                      const res = xpeedoOpsService.runWorkflowManually(
                        wf.id,
                        userProfile?.name || 'Admin',
                        role
                      );
                      if (res) setNotice(`Workflow test run: ${res.status} — ${res.message}`);
                    }}
                    className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Play size={12} />
                    <span>Test Run</span>
                  </button>
                  <button
                    type="button"
                    disabled={!canManage}
                    onClick={() =>
                      xpeedoOpsService.toggleWorkflow(wf.id, userProfile?.name || 'Admin', role)
                    }
                    className={`px-2.5 py-1 rounded text-xs font-semibold border cursor-pointer disabled:opacity-50 ${
                      wf.enabled
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    {wf.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                <div>
                  <span className="font-semibold text-slate-700">If: </span>
                  <span className="text-slate-600">{wf.conditionSummary}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Then: </span>
                  <span className="text-slate-600">{wf.actionSummary}</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                <span>Runs: {wf.runCount}</span>
                <span>{wf.lastRunAt ? `Last run ${new Date(wf.lastRunAt).toLocaleString()}` : 'Never executed'}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 space-y-3 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Execution Audit Logs</h2>
            <span className="text-xs font-mono text-slate-500 tabular-nums">{logs.length}</span>
          </div>
          {logs.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              No execution events recorded yet. Trigger an SRM ticket, block a task, submit a work
              report, or click Test Run.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[28rem] overflow-y-auto custom-scrollbar">
              {logs.map((l) => (
                <div key={l.id} className="py-2.5 text-xs space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 truncate">{l.workflowName}</span>
                    <span
                      className={`font-semibold text-[11px] shrink-0 ${
                        l.status === 'Success'
                          ? 'text-emerald-700'
                          : l.status === 'Error'
                          ? 'text-red-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>
                  <div className="text-slate-600">{l.message}</div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {l.workspaceId} · {new Date(l.executedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. DOCUMENTS CENTER VIEW (/documents)
// ============================================================================
export function DocumentsCenterView() {
  const { userProfile } = useAuth();
  const [, setTick] = useState(0);
  const [wsFilter, setWsFilter] = useState('ALL');
  const [clientId, setClientId] = useState('client-india-post');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<OpsDocumentEntry['category']>('SOP / Playbook');
  const [version, setVersion] = useState('v1.0');
  const [referenceUrl, setReferenceUrl] = useState('');

  useEffect(() => xpeedoOpsService.subscribe(() => setTick((t) => t + 1)), []);

  const role = xpeedoOpsService.resolvePlatformRole(userProfile);
  const clients = xpeedoOpsService.getClients(userProfile);
  const docs = xpeedoOpsService.getDocuments(wsFilter);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const cli = clients.find((c) => c.id === clientId) || clients[0];
    xpeedoOpsService.addDocument(
      {
        clientId: cli?.id || clientId,
        workspaceId: cli?.workspaceKey || 'INDIA_POST',
        title: title.trim(),
        category,
        version: version.trim() || 'v1.0',
        referenceUrl: referenceUrl.trim() || undefined,
        uploadedBy: userProfile?.name || 'Admin',
        status: 'Active',
      },
      userProfile?.name || 'Admin',
      role
    );
    setTitle('');
    setReferenceUrl('');
  };

  return (
    <div className="space-y-6" id="documents-center-view">
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-blue-600 uppercase font-semibold">
            Workspace Repository
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
            <FileText size={20} className="text-blue-600" />
            <span>Documents Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Contracts, SOPs, technical specifications, and statutory record registers scoped by client
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/official-documents"
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <span>India Post Statutory Forms</span>
            <ExternalLink size={13} />
          </Link>
          <select
            value={wsFilter}
            onChange={(e) => setWsFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
          >
            <option value="ALL">All Permitted Workspaces</option>
            {clients.map((c) => (
              <option key={c.id} value={c.workspaceKey}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <form
        onSubmit={handleAdd}
        className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 md:grid-cols-6 gap-3 items-end"
      >
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Document Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Kota Division Beat Verification SOP"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as OpsDocumentEntry['category'])}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
          >
            <option value="MoU / Contract">MoU / Contract</option>
            <option value="SOP / Playbook">SOP / Playbook</option>
            <option value="Technical Spec">Technical Spec</option>
            <option value="Statutory Record">Statutory Record</option>
            <option value="Report">Report</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Version / Ref</label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="v1.0"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} />
          <span>Register Doc</span>
        </button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Workspace</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Version</th>
              <th className="py-3 px-4">Uploaded By</th>
              <th className="py-3 px-4">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {docs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No documents registered yet for the selected workspace.
                </td>
              </tr>
            ) : (
              docs.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-semibold text-slate-900">{d.title}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{d.workspaceId}</td>
                  <td className="py-3 px-4 text-slate-700">{d.category}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{d.version}</td>
                  <td className="py-3 px-4 text-slate-600">{d.uploadedBy}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// 5. FINANCE LEDGER VIEW (/finance)
// ============================================================================
export function FinanceLedgerView() {
  const { userProfile } = useAuth();
  const [, setTick] = useState(0);
  const [wsFilter, setWsFilter] = useState('ALL');
  const [clientId, setClientId] = useState('client-xpeedo-ev');
  const [type, setType] = useState<OpsFinanceEntry['type']>('Milestone Billing');
  const [referenceNo, setReferenceNo] = useState('');
  const [description, setDescription] = useState('');
  const [amountInr, setAmountInr] = useState(0);
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => xpeedoOpsService.subscribe(() => setTick((t) => t + 1)), []);

  const role = xpeedoOpsService.resolvePlatformRole(userProfile);
  const canManage = xpeedoOpsService.canPerform(userProfile, 'manageFinance');
  const clients = xpeedoOpsService.getClients(userProfile);
  const entries = xpeedoOpsService.getFinanceEntries(wsFilter);

  const totalAmount = entries.reduce((sum, e) => sum + (Number(e.amountInr) || 0), 0);
  const paidAmount = entries
    .filter((e) => e.status === 'Paid')
    .reduce((sum, e) => sum + (Number(e.amountInr) || 0), 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNo.trim() || !description.trim() || amountInr <= 0) return;
    const cli = clients.find((c) => c.id === clientId) || clients[0];
    xpeedoOpsService.addFinanceEntry(
      {
        clientId: cli?.id || clientId,
        workspaceId: cli?.workspaceKey || 'XPEEDO_EV',
        type,
        referenceNo: referenceNo.trim().toUpperCase(),
        description: description.trim(),
        amountInr: Number(amountInr),
        status: 'Draft',
        dueDate,
        createdBy: userProfile?.name || 'Owner',
      },
      userProfile?.name || 'Owner',
      role
    );
    setReferenceNo('');
    setDescription('');
    setAmountInr(0);
  };

  return (
    <div className="space-y-6" id="finance-ledger-view">
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-blue-600 uppercase font-semibold">
            Client Billing &amp; Operational Expenses
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
            <Wallet size={20} className="text-blue-600" />
            <span>Finance Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            Total Recorded: ₹{totalAmount.toLocaleString('en-IN')} · Paid: ₹{paidAmount.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={wsFilter}
            onChange={(e) => setWsFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
          >
            <option value="ALL">All Permitted Workspaces</option>
            {clients.map((c) => (
              <option key={c.id} value={c.workspaceKey}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() =>
              exportCsvWithBom(
                `xpeedo_finance_ledger_${new Date().toISOString().split('T')[0]}.csv`,
                ['Reference', 'Workspace', 'Type', 'Description', 'Amount (INR)', 'Status', 'Due Date'],
                entries.map((f) => [
                  f.referenceNo,
                  f.workspaceId,
                  f.type,
                  f.description,
                  f.amountInr,
                  f.status,
                  f.dueDate,
                ])
              )
            }
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {canManage && (
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 md:grid-cols-6 gap-3 items-end"
        >
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Entry Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as OpsFinanceEntry['type'])}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
            >
              <option value="Retainer Invoice">Retainer Invoice</option>
              <option value="Milestone Billing">Milestone Billing</option>
              <option value="Operational Expense">Operational Expense</option>
              <option value="Fuel & Allowance">Fuel &amp; Allowance</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ref / Invoice No *</label>
            <input
              type="text"
              required
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="INV-2026-001"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Phase 1 milestone"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Amount (INR) *</label>
            <input
              type="number"
              required
              min={1}
              value={amountInr || ''}
              onChange={(e) => setAmountInr(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Record Entry</span>
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <th className="py-3 px-4">Reference</th>
              <th className="py-3 px-4">Workspace</th>
              <th className="py-3 px-4">Type &amp; Description</th>
              <th className="py-3 px-4 text-right">Amount (INR)</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No financial entries recorded yet. Totals remain ₹0 until real invoices or expenses
                  are logged.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {entry.referenceNo}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{entry.workspaceId}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{entry.type}</div>
                    <div className="text-slate-500">{entry.description}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    ₹{Number(entry.amountInr).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{entry.dueDate}</td>
                  <td className="py-3 px-4">
                    <select
                      disabled={!canManage}
                      value={entry.status}
                      onChange={(e) =>
                        xpeedoOpsService.updateFinanceStatus(
                          entry.id,
                          e.target.value as OpsFinanceEntry['status'],
                          userProfile?.name || 'Owner',
                          role
                        )
                      }
                      className="px-2 py-1 border border-slate-300 rounded text-xs bg-white disabled:opacity-60"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Approved">Approved</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// 6. REPORTS & EXPORTS CENTER (/reports-center)
// ============================================================================
export function ReportsCenterView() {
  const { userProfile } = useAuth();
  const [, setTick] = useState(0);

  useEffect(() => xpeedoOpsService.subscribe(() => setTick((t) => t + 1)), []);

  const clients = xpeedoOpsService.getClients(userProfile);
  const projects = xpeedoOpsService.getProjects();
  const tasks = xpeedoOpsService.getTasks();
  const workReports = xpeedoOpsService.getWorkReports();
  const srmTickets = xpeedoOpsService.getSrmTickets();
  const auditLogs = xpeedoOpsService.getActivityLogs();
  const canExport = xpeedoOpsService.canPerform(userProfile, 'exportReports');

  const exportClients = () =>
    exportCsvWithBom(
      'xpeedo_clients_registry.csv',
      ['Code', 'Client Name', 'Workspace', 'Industry', 'Status', 'Module Scope', 'Account Manager'],
      clients.map((c) => [c.code, c.name, c.workspaceKey, c.industry, c.status, c.moduleScope, c.accountManager])
    );

  const exportProjectsAndTasks = () =>
    exportCsvWithBom(
      'xpeedo_tasks_export.csv',
      ['Task Code', 'Title', 'Workspace', 'Project ID', 'Assignee', 'Status', 'Priority', 'Est Hours', 'Logged Hours', 'Due Date'],
      tasks.map((t) => [
        t.code,
        t.title,
        t.workspaceId,
        t.projectId,
        t.assigneeName,
        t.status,
        t.priority,
        t.estimatedHours,
        t.loggedHours,
        t.dueDate,
      ])
    );

  const exportWorkReports = () =>
    exportCsvWithBom(
      'xpeedo_ev_work_reports.csv',
      ['ID', 'Employee', 'Period', 'Date', 'Hours', 'Tasks Completed', 'Approval Stage', 'Summary'],
      workReports.map((w) => [
        w.id,
        w.employeeName,
        w.periodType,
        w.reportDate,
        w.hoursLogged,
        w.tasksCompletedCount,
        w.approvalStage,
        w.summary,
      ])
    );

  const exportSrm = () =>
    exportCsvWithBom(
      'india_post_srm_tickets.csv',
      ['Ticket No', 'Office', 'PIN', 'Beat', 'Customer', 'Category', 'Priority', 'Status', 'Assigned To', 'SLA Hours'],
      srmTickets.map((t) => [
        t.ticketNo,
        t.officeName,
        t.pincode,
        t.beatNo,
        t.customerName,
        t.category,
        t.priority,
        t.status,
        t.assignedTo,
        t.slaHours,
      ])
    );

  const exportAudit = () =>
    exportCsvWithBom(
      'xpeedo_activity_audit_logs.csv',
      ['Timestamp', 'Actor', 'Role', 'Workspace', 'Entity Type', 'Action', 'Summary'],
      auditLogs.map((a) => [a.timestamp, a.actor, a.actorRole, a.workspaceId, a.entityType, a.action, a.summary])
    );

  const packs = [
    {
      title: 'Clients Portfolio Registry',
      count: clients.length,
      desc: 'Registered clients, module scopes, and account managers',
      action: exportClients,
    },
    {
      title: 'Projects & 8-Status Tasks Ledger',
      count: tasks.length,
      desc: `${projects.length} projects · ${tasks.length} tasks with hours & assignees`,
      action: exportProjectsAndTasks,
    },
    {
      title: 'Xpeedo EV Work Reports & Approvals',
      count: workReports.length,
      desc: 'Daily/Weekly/Monthly submissions across 4-tier approval stages',
      action: exportWorkReports,
    },
    {
      title: 'Department of Post SRM SLA Log',
      count: srmTickets.length,
      desc: 'Office, PIN, Beat, SLA hours, escalation & resolution history',
      action: exportSrm,
    },
    {
      title: 'Mandatory Platform Activity Audit Log',
      count: auditLogs.length,
      desc: 'Actor, role, workspace, entity, action & UTC timestamp',
      action: exportAudit,
    },
  ];

  return (
    <div className="space-y-6" id="reports-center-view">
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-blue-600 uppercase font-semibold">
            UTF-8 BOM Enterprise Reporting
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
            <Briefcase size={20} className="text-blue-600" />
            <span>Reports &amp; Exports Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Excel-safe CSV exports (`\uFEFF` UTF-8 BOM) computed directly from live workspace records
          </p>
        </div>
        <Link
          to="/reports"
          className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
        >
          <span>India Post Field Reports</span>
          <ExternalLink size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packs.map((pack) => (
          <div key={pack.title} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>LIVE DATASET</span>
                <span className="font-bold text-slate-900 tabular-nums">{pack.count} rows</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1.5">{pack.title}</h3>
              <p className="text-xs text-slate-600 mt-1">{pack.desc}</p>
            </div>
            <button
              type="button"
              disabled={!canExport}
              onClick={pack.action}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download size={14} />
              <span>Export CSV (UTF-8 BOM)</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 7. NOTIFICATIONS CENTER VIEW (/notifications)
// ============================================================================
export function NotificationsCenterView() {
  const { userProfile } = useAuth();
  const [, setTick] = useState(0);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  useEffect(() => xpeedoOpsService.subscribe(() => setTick((t) => t + 1)), []);

  const activeWorkspace = xpeedoOpsService.getActiveWorkspaceFilter();
  const scoped = xpeedoOpsService.getScopedWorkspaceKeys(userProfile);
  const notifications = xpeedoOpsService
    .getNotifications(activeWorkspace)
    .filter((n) => scoped === 'ALL' || n.workspaceId === 'ALL' || scoped.includes(n.workspaceId))
    .filter((n) => (filter === 'ALL' ? true : !n.read));

  return (
    <div className="space-y-6" id="notifications-center-view">
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-blue-600 uppercase font-semibold">
            Alerts, SLA &amp; Approval Queue
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
            <Bell size={20} className="text-blue-600" />
            <span>Notification Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time operational notifications across Approvals, India Post SRM SLA, Tasks, and Imports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter(filter === 'ALL' ? 'UNREAD' : 'ALL')}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            {filter === 'ALL' ? 'Show Unread Only' : 'Show All'}
          </button>
          <button
            type="button"
            onClick={() => xpeedoOpsService.markAllNotificationsRead()}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck size={14} />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-10 text-center space-y-1.5">
            <CheckCircle2 size={24} className="text-slate-400 mx-auto" />
            <div className="text-sm font-semibold text-slate-700">No notifications in queue</div>
            <p className="text-xs text-slate-500">
              High/Critical SRM tickets, blocked tasks, work report approvals, and data migrations
              generate alerts here automatically.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                n.read ? 'bg-white' : 'bg-blue-50/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                  <span className="font-semibold text-blue-700">{n.category}</span>
                  <span>·</span>
                  <span>{n.workspaceId}</span>
                  <span>·</span>
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{n.title}</div>
                <div className="text-xs text-slate-600">{n.message}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={n.linkPath}
                  onClick={() => xpeedoOpsService.markNotificationRead(n.id)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800"
                >
                  Open Module
                </Link>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => xpeedoOpsService.markNotificationRead(n.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
