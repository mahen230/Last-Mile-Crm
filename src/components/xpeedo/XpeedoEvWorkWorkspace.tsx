import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Layers,
  Plus,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { exportCsvWithBom, xpeedoOpsService } from '../../services/xpeedoOpsService';
import ProjectsAndTasksView from './ProjectsAndTasksView';
import { WorkReportPeriod } from '../../types/xpeedoOps';

type EvWorkspaceTab = 'OVERVIEW' | 'PROJECTS_TASKS' | 'DEPARTMENTS' | 'WORK_REPORTS';

export default function XpeedoEvWorkWorkspace() {
  const { userProfile } = useAuth();
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<EvWorkspaceTab>('OVERVIEW');
  const [notice, setNotice] = useState<string | null>(null);

  // Department Add Form
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // Work Report Submit Form
  const [wrPeriod, setWrPeriod] = useState<WorkReportPeriod>('Daily');
  const [wrDeptId, setWrDeptId] = useState('dept-ev-ops');
  const [wrProjectId, setWrProjectId] = useState('');
  const [wrDate, setWrDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [wrHours, setWrHours] = useState(8);
  const [wrTasksDone, setWrTasksDone] = useState(2);
  const [wrSummary, setWrSummary] = useState('');
  const [wrBlockers, setWrBlockers] = useState('');
  const [rejectDraftId, setRejectDraftId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => xpeedoOpsService.subscribe(() => setTick((t) => t + 1)), []);

  const role = xpeedoOpsService.resolvePlatformRole(userProfile);
  const canManageDepts = xpeedoOpsService.canPerform(userProfile, 'manageDepartments');

  const departments = xpeedoOpsService.getDepartments('INDIA_POST', 'client-india-post');
  const projects = xpeedoOpsService.getProjects('INDIA_POST', 'client-india-post');
  const tasks = xpeedoOpsService.getTasks('INDIA_POST', 'client-india-post');
  const workReports = xpeedoOpsService.getWorkReports('INDIA_POST');

  const pendingTl = workReports.filter((r) => r.approvalStage === 'PENDING_TL').length;
  const pendingPm = workReports.filter((r) => r.approvalStage === 'PENDING_PM').length;
  const pendingOwner = workReports.filter((r) => r.approvalStage === 'PENDING_OWNER').length;
  const approvedCount = workReports.filter((r) => r.approvalStage === 'APPROVED').length;
  const totalLoggedHours = workReports.reduce((s, r) => s + (Number(r.hoursLogged) || 0), 0);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 5000);
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    const saved = xpeedoOpsService.upsertDepartment(
      {
        workspaceId: 'INDIA_POST',
        clientId: 'client-india-post',
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase() || `IP-${deptName.trim().slice(0, 3).toUpperCase()}`,
        headName: deptHead.trim() || 'Unassigned',
        description: deptDesc.trim() || 'Configurable India Post operational unit.',
        isActive: true,
      },
      userProfile?.name || 'Admin',
      role
    );
    setDeptName('');
    setDeptCode('');
    setDeptHead('');
    setDeptDesc('');
    showNotice(`Department "${saved.name}" added to India Post.`);
  };

  const handleSubmitWorkReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wrSummary.trim()) return;
    const created = xpeedoOpsService.submitWorkReport(
      {
        workspaceId: 'INDIA_POST',
        clientId: 'client-india-post',
        departmentId: wrDeptId || departments[0]?.id || 'dept-ip-ops',
        projectId: wrProjectId || undefined,
        employeeId: userProfile?.employeeId || userProfile?.id || 'EMP-IP',
        employeeName: userProfile?.name || 'India Post Staff',
        periodType: wrPeriod,
        reportDate: wrDate,
        hoursLogged: Number(wrHours) || 0,
        tasksCompletedCount: Number(wrTasksDone) || 0,
        summary: wrSummary.trim(),
        blockers: wrBlockers.trim() || undefined,
      },
      role
    );
    setWrSummary('');
    setWrBlockers('');
    showNotice(`Submitted ${created.periodType} Work Report (${created.id}) to Team Leader queue.`);
  };

  const handleApproveStage = (reportId: string) => {
    const res = xpeedoOpsService.advanceWorkReportApproval(
      reportId,
      userProfile?.name || 'Reviewer',
      role
    );
    if (!res.success) {
      showNotice(res.error || 'Permission denied for current approval stage.');
    } else {
      showNotice(`Work Report ${reportId} advanced to ${res.report?.approvalStage}.`);
    }
  };

  return (
    <div className="space-y-6" id="india-post-work-workspace">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-red-400 uppercase tracking-wide">
              India Post · Postal Operations &amp; Approval Management
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">
              India Post — Work Management &amp; Approvals
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Manage postal departments, projects, tasks, Daily/Weekly/Monthly work reports,
              and multi-tier approval chain (Staff → Team Leader → Project Manager → Owner).
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              exportCsvWithBom(
                'indiapost_work_reports',
                ['Report ID', 'Employee', 'Period', 'Date', 'Hours', 'Tasks Completed', 'Approval Stage', 'Summary'],
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
              )
            }
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 self-start lg:self-auto cursor-pointer"
          >
            <Download size={14} />
            <span>Export Work Reports CSV</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800 text-xs">
          {(
            [
              { key: 'OVERVIEW', label: 'EV Work Overview' },
              { key: 'PROJECTS_TASKS', label: `Projects & Tasks (${projects.length} / ${tasks.length})` },
              { key: 'DEPARTMENTS', label: `Departments (${departments.length})` },
              { key: 'WORK_REPORTS', label: `Work Reports & Approvals (${workReports.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === t.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl px-4 py-3 text-xs font-medium">
          {notice}
        </div>
      )}

      {/* TAB 1: DYNAMIC EV OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">Departments</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">{departments.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {departments.filter((d) => d.isActive).length} active
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">EV Projects</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">{projects.length}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{tasks.length} tasks</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">Tier 1 &amp; 2 Pending</div>
              <div className="text-2xl font-bold text-amber-700 tabular-nums mt-1">
                {pendingTl + pendingPm}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {pendingTl} TL · {pendingPm} PM
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">Owner Final Queue</div>
              <div className="text-2xl font-bold text-blue-700 tabular-nums mt-1">{pendingOwner}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{approvedCount} approved</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">Reported Work Hours</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {totalLoggedHours}h
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{workReports.length} reports</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Multi-Tier Work Approval Pipeline (Employee → Team Leader → Project Manager → Owner)
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('WORK_REPORTS')}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Open Work Reports
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-mono text-slate-500">STAGE 1 · TEAM LEADER</div>
                <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{pendingTl}</div>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-mono text-slate-500">STAGE 2 · PROJECT MGR</div>
                <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{pendingPm}</div>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-mono text-slate-500">STAGE 3 · OWNER FINAL</div>
                <div className="text-xl font-bold text-blue-700 tabular-nums mt-1">{pendingOwner}</div>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <div className="font-mono text-slate-500">STAGE 4 · APPROVED</div>
                <div className="text-xl font-bold text-emerald-700 tabular-nums mt-1">{approvedCount}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROJECTS & TASKS (SCOPED STRICTLY TO INDIA_POST) */}
      {activeTab === 'PROJECTS_TASKS' && (
        <ProjectsAndTasksView
          mode="COMBINED"
          lockedClientId="client-india-post"
          lockedWorkspaceId="INDIA_POST"
        />
      )}

      {/* TAB 3: CONFIGURABLE DEPARTMENTS */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers size={16} className="text-blue-600" />
                <span>India Post Configurable Departments ({departments.length})</span>
              </h2>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {departments.map((d) => (
                <div key={d.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">
                      {d.name} <span className="font-mono text-slate-400 ml-1">{d.code}</span>
                    </div>
                    <div className="text-slate-600">{d.description}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Head: {d.headName}</div>
                  </div>
                  <button
                    type="button"
                    disabled={!canManageDepts}
                    onClick={() =>
                      xpeedoOpsService.upsertDepartment(
                        { ...d, isActive: !d.isActive },
                        userProfile?.name || 'Admin',
                        role
                      )
                    }
                    className={`px-2.5 py-1 rounded border text-xs font-semibold cursor-pointer disabled:opacity-50 ${
                      d.isActive
                        ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                        : 'border-slate-200 text-slate-500 bg-slate-50'
                    }`}
                  >
                    {d.isActive ? 'Active' : 'Paused'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add Department</h3>
            <form onSubmit={handleAddDepartment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
                <input
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g., Fleet Maintenance"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code</label>
                  <input
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    placeholder="EV-MNT"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dept Head</label>
                  <input
                    value={deptHead}
                    onChange={(e) => setDeptHead(e.target.value)}
                    placeholder="Manager name"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scope Description</label>
                <textarea
                  rows={2}
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={!canManageDepts}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Plus size={14} />
                <span>Add EV Department</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: WORK REPORTS & MULTI-TIER APPROVAL WORKFLOW */}
      {activeTab === 'WORK_REPORTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase size={16} className="text-blue-600" />
              <span>Submit Work Report</span>
            </h2>
            <form onSubmit={handleSubmitWorkReport} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Period Type</label>
                  <select
                    value={wrPeriod}
                    onChange={(e) => setWrPeriod(e.target.value as WorkReportPeriod)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Report Date</label>
                  <input
                    type="date"
                    value={wrDate}
                    onChange={(e) => setWrDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={wrDeptId}
                  onChange={(e) => setWrDeptId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project (Optional)</label>
                <select
                  value={wrProjectId}
                  onChange={(e) => setWrProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">General Department Operations</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hours Logged</label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={wrHours}
                    onChange={(e) => setWrHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tasks Completed</label>
                  <input
                    type="number"
                    min={0}
                    value={wrTasksDone}
                    onChange={(e) => setWrTasksDone(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Summary *</label>
                <textarea
                  required
                  rows={3}
                  value={wrSummary}
                  onChange={(e) => setWrSummary(e.target.value)}
                  placeholder="Describe completed deliverables & execution progress..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blockers (Optional)</label>
                <input
                  value={wrBlockers}
                  onChange={(e) => setWrBlockers(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg cursor-pointer"
              >
                Submit to Team Leader Queue
              </button>
            </form>
          </div>

          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck size={16} className="text-blue-600" />
              <span>Multi-Tier Approval Queue ({workReports.length})</span>
            </h2>
            {workReports.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No Daily/Weekly/Monthly work reports submitted yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {workReports.map((r) => {
                  const dept = departments.find((d) => d.id === r.departmentId);
                  return (
                    <div key={r.id} className="py-4 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-blue-700 mr-2">{r.id}</span>
                          <span className="font-bold text-slate-900">{r.employeeName}</span>
                          <span className="text-slate-500 ml-2">
                            · {r.periodType} · {dept?.name || 'Operations'} · {r.reportDate}
                          </span>
                        </div>
                        <span
                          className={`font-mono font-bold ${
                            r.approvalStage === 'APPROVED'
                              ? 'text-emerald-700'
                              : r.approvalStage === 'REJECTED'
                              ? 'text-rose-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {r.approvalStage}
                        </span>
                      </div>

                      <p className="text-slate-700">{r.summary}</p>
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                        Hours: {r.hoursLogged}h · Tasks Done: {r.tasksCompletedCount}
                        {r.rejectionReason ? ` · Rejected: ${r.rejectionReason}` : ''}
                      </div>

                      {/* Stage Stepper */}
                      <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono">
                        {[
                          { label: '1. Employee', done: true },
                          {
                            label: '2. Team Leader',
                            done: ['PENDING_PM', 'PENDING_OWNER', 'APPROVED'].includes(r.approvalStage),
                          },
                          {
                            label: '3. Project Mgr',
                            done: ['PENDING_OWNER', 'APPROVED'].includes(r.approvalStage),
                          },
                          { label: '4. Owner Final', done: r.approvalStage === 'APPROVED' },
                        ].map((step) => (
                          <div
                            key={step.label}
                            className={`px-2 py-1 rounded border text-center ${
                              step.done
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                          >
                            {step.label}
                          </div>
                        ))}
                      </div>

                      {/* Approve / Reject Controls */}
                      {r.approvalStage.startsWith('PENDING_') && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleApproveStage(r.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 size={13} />
                            <span>
                              Approve ({r.approvalStage.replace('PENDING_', '')})
                            </span>
                          </button>
                          {rejectDraftId === r.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Rejection reason..."
                                className="px-2.5 py-1 border border-slate-200 rounded text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  xpeedoOpsService.rejectWorkReport(
                                    r.id,
                                    rejectReason,
                                    userProfile?.name || 'Reviewer',
                                    role
                                  );
                                  setRejectDraftId(null);
                                  setRejectReason('');
                                }}
                                className="px-2.5 py-1 rounded bg-rose-600 text-white font-semibold cursor-pointer"
                              >
                                Confirm Reject
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setRejectDraftId(r.id)}
                              className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle size={13} />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
