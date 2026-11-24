import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  Clock,
  FolderKanban,
  GanttChart,
  LayoutGrid,
  List as ListIcon,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { xpeedoOpsService } from '../../services/xpeedoOpsService';
import { staffPermissionService } from '../../services/staffPermissionService';
import {
  ALL_OPS_TASK_STATUSES,
  OpsProject,
  OpsTask,
  OpsTaskStatus,
  ProjectStatus,
} from '../../types/xpeedoOps';

type TaskViewMode = 'KANBAN' | 'LIST' | 'CALENDAR' | 'TIMELINE';

interface ProjectsAndTasksViewProps {
  mode?: 'PROJECTS' | 'TASKS' | 'COMBINED';
  lockedClientId?: string;
  lockedWorkspaceId?: string;
}

const STATUS_STYLE: Record<OpsTaskStatus, string> = {
  Backlog: 'text-slate-600',
  Assigned: 'text-indigo-700',
  'In Progress': 'text-blue-700',
  'Under Review': 'text-amber-700',
  Testing: 'text-purple-700',
  Blocked: 'text-rose-700',
  Completed: 'text-emerald-700',
  Cancelled: 'text-slate-400',
};

export default function ProjectsAndTasksView({
  mode = 'TASKS',
  lockedClientId,
  lockedWorkspaceId,
}: ProjectsAndTasksViewProps) {
  const { userProfile } = useAuth();
  const [, setTick] = useState(0);
  const [viewMode, setViewMode] = useState<TaskViewMode>('KANBAN');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [activeTaskModal, setActiveTaskModal] = useState<OpsTask | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // Project Form
  const [projTitle, setProjTitle] = useState('');
  const [projClientId, setProjClientId] = useState(lockedClientId || 'client-xpeedo-ev');
  const [projDeptId, setProjDeptId] = useState('');
  const [projManager, setProjManager] = useState(userProfile?.name || 'Mahendra Kumar Meena');
  const [projPriority, setProjPriority] = useState<OpsProject['priority']>('High');
  const [projStatus, setProjStatus] = useState<ProjectStatus>('Active');
  const [projStartDate, setProjStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [projDueDate, setProjDueDate] = useState(() => {
    const d = new Date(Date.now() + 14 * 86400000);
    return d.toISOString().split('T')[0];
  });
  const [projDesc, setProjDesc] = useState('');

  // Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskProjectId, setTaskProjectId] = useState('');
  const [taskAssignee, setTaskAssignee] = useState(userProfile?.name || 'Mahendra Kumar Meena');
  const [taskStatus, setTaskStatus] = useState<OpsTaskStatus>('Assigned');
  const [taskPriority, setTaskPriority] = useState<OpsTask['priority']>('High');
  const [taskStart, setTaskStart] = useState(() => new Date().toISOString().split('T')[0]);
  const [taskDue, setTaskDue] = useState(() => {
    const d = new Date(Date.now() + 7 * 86400000);
    return d.toISOString().split('T')[0];
  });
  const [taskEstHours, setTaskEstHours] = useState(4);
  const [taskBlockedBy, setTaskBlockedBy] = useState('');

  // Task Detail Modal Sub-inputs
  const [subtaskDraft, setSubtaskDraft] = useState('');
  const [timeHoursDraft, setTimeHoursDraft] = useState(1);
  const [timeNoteDraft, setTimeNoteDraft] = useState('');
  const [commentDraft, setCommentDraft] = useState('');
  const [attachNameDraft, setAttachNameDraft] = useState('');

  useEffect(() => xpeedoOpsService.subscribe(() => setTick((t) => t + 1)), []);

  const activeWorkspace = lockedWorkspaceId || xpeedoOpsService.getActiveWorkspaceFilter();
  const role = xpeedoOpsService.resolvePlatformRole(userProfile);
  const canManageProjects = xpeedoOpsService.canPerform(userProfile, 'manageProjects');
  const canManageTasks = xpeedoOpsService.canPerform(userProfile, 'manageTasks');

  const clients = xpeedoOpsService.getClients(userProfile);
  const operationalClients = clients.filter((c) => c.moduleScope !== 'BASIC_PROFILE_ONLY');
  const allProjects = xpeedoOpsService.getProjects(activeWorkspace, lockedClientId);
  const allTasks = xpeedoOpsService.getTasks(
    activeWorkspace,
    lockedClientId,
    selectedProjectId === 'ALL' ? undefined : selectedProjectId
  );
  const departments = xpeedoOpsService.getDepartments(activeWorkspace, lockedClientId);
  const staffOptions = useMemo(() => staffPermissionService.getAllStaffProfiles(), []);

  const filteredTasks = useMemo(() => {
    if (!search.trim()) return allTasks;
    const q = search.toLowerCase();
    return allTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.assigneeName.toLowerCase().includes(q)
    );
  }, [allTasks, search]);

  // Keep activeTaskModal synced with store mutations
  const currentModalTask = activeTaskModal
    ? allTasks.find((t) => t.id === activeTaskModal.id) || activeTaskModal
    : null;

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    const targetClient =
      clients.find((c) => c.id === projClientId) || operationalClients[0] || clients[0];
    if (!targetClient) return;

    const created = xpeedoOpsService.upsertProject(
      {
        code: '',
        title: projTitle.trim(),
        clientId: targetClient.id,
        workspaceId: targetClient.workspaceKey,
        departmentId: projDeptId || undefined,
        managerName: projManager.trim() || 'Mahendra Kumar Meena',
        status: projStatus,
        priority: projPriority,
        startDate: projStartDate,
        dueDate: projDueDate,
        budgetInr: 0,
        description: projDesc.trim(),
        milestones: [
          {
            id: `MS-${Date.now().toString(36)}`,
            title: 'Kickoff & Baseline Delivery',
            dueDate: projDueDate,
            completed: false,
          },
        ],
      },
      userProfile?.name || 'Admin',
      role
    );
    setSelectedProjectId(created.id);
    setProjTitle('');
    setProjDesc('');
    setShowNewProjectModal(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    const targetProj =
      allProjects.find((p) => p.id === taskProjectId) || allProjects[0] || null;
    const fallbackClient =
      (lockedClientId && clients.find((c) => c.id === lockedClientId)) ||
      (lockedWorkspaceId && clients.find((c) => c.workspaceKey === lockedWorkspaceId)) ||
      operationalClients[0] ||
      clients[0];
    if (!fallbackClient) return;

    xpeedoOpsService.createTask(
      {
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        clientId: targetProj ? targetProj.clientId : fallbackClient.id,
        workspaceId: targetProj ? targetProj.workspaceId : fallbackClient.workspaceKey,
        projectId: targetProj ? targetProj.id : 'GENERAL',
        departmentId: targetProj?.departmentId,
        assigneeId: taskAssignee,
        assigneeName: taskAssignee.trim() || 'Unassigned',
        status: taskStatus,
        priority: taskPriority,
        startDate: taskStart,
        dueDate: taskDue,
        estimatedHours: Number(taskEstHours) || 2,
        blockedByTaskIds: taskBlockedBy ? [taskBlockedBy] : [],
        approvalStage: 'NONE',
        createdBy: userProfile?.name || 'Admin',
      },
      userProfile?.name || 'Admin',
      role
    );
    setTaskTitle('');
    setTaskDesc('');
    setTaskBlockedBy('');
    setShowNewTaskModal(false);
  };

  // Compute Calendar Days for Current Month
  const nowDate = new Date();
  const year = nowDate.getFullYear();
  const month = nowDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
    return {
      dayNum: i + 1,
      iso: dayStr,
      tasks: filteredTasks.filter((t) => t.dueDate === dayStr),
    };
  });

  return (
    <div className="space-y-6" id="projects-tasks-engine">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-semibold text-blue-600 uppercase">
            {mode === 'PROJECTS' ? 'Projects Workspace' : 'Common Project & Task Engine'}
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">
            {mode === 'PROJECTS'
              ? 'Projects & Milestones Directory'
              : 'Task Management (Kanban · List · Calendar · Timeline)'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Scoped strictly by workspace &amp; project · {allProjects.length} projects · {filteredTasks.length} tasks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManageProjects && (
            <button
              type="button"
              onClick={() => setShowNewProjectModal(true)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <FolderKanban size={15} className="text-blue-600" />
              <span>New Project</span>
            </button>
          )}
          {canManageTasks && (
            <button
              type="button"
              onClick={() => setShowNewTaskModal(true)}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} />
              <span>New Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Projects Strip (Shown in PROJECTS or COMBINED mode, or compact selector in TASKS mode) */}
      {(mode === 'PROJECTS' || mode === 'COMBINED') && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Active &amp; Planned Projects</h2>
            <span className="text-xs text-slate-500 tabular-nums">{allProjects.length} projects</span>
          </div>
          {allProjects.length === 0 ? (
            <div className="p-6 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              No projects created in this workspace yet. Click <strong>New Project</strong> above to start.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProjects.map((proj) => {
                const projTasks = allTasks.filter((t) => t.projectId === proj.id);
                const doneCount = projTasks.filter((t) => t.status === 'Completed').length;
                const isSelected = selectedProjectId === proj.id;
                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProjectId(isSelected ? 'ALL' : proj.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-semibold text-blue-600">{proj.code}</span>
                      <span className="font-semibold text-slate-700">{proj.status}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm mt-1">{proj.title}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {proj.workspaceId} · Lead: {proj.managerName}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 mt-3 pt-2.5 border-t border-slate-100 tabular-nums">
                      <span>Due {proj.dueDate}</span>
                      <span className="font-semibold">
                        {doneCount}/{projTasks.length} tasks done
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Task Controls Bar: Project Filter, Search, 4 View Switcher */}
      {mode !== 'PROJECTS' && (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search task code, title, assignee..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                />
              </div>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-medium text-slate-700"
              >
                <option value="ALL">All Projects ({allProjects.length})</option>
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              {(
                [
                  { id: 'KANBAN', label: 'Kanban', icon: LayoutGrid },
                  { id: 'LIST', label: 'List', icon: ListIcon },
                  { id: 'CALENDAR', label: 'Calendar', icon: CalendarIcon },
                  { id: 'TIMELINE', label: 'Timeline', icon: GanttChart },
                ] as const
              ).map((v) => {
                const Icon = v.icon;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setViewMode(v.id)}
                    className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      viewMode === v.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4 INTERACTIVE TASK VIEWS */}
          {viewMode === 'KANBAN' && (
            <div className="overflow-x-auto custom-scrollbar pb-2">
              <div className="grid grid-flow-col auto-cols-[270px] gap-4">
                {ALL_OPS_TASK_STATUSES.map((colStatus) => {
                  const colTasks = filteredTasks.filter((t) => t.status === colStatus);
                  return (
                    <div
                      key={colStatus}
                      className="bg-slate-100/80 rounded-xl border border-slate-200 p-3 flex flex-col min-h-[320px]"
                    >
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200">
                        <span className={`text-xs font-bold ${STATUS_STYLE[colStatus]}`}>{colStatus}</span>
                        <span className="text-xs font-mono font-semibold text-slate-500 tabular-nums">
                          {colTasks.length}
                        </span>
                      </div>
                      <div className="space-y-2.5 flex-1">
                        {colTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => setActiveTaskModal(task)}
                            className="bg-white rounded-lg border border-slate-200 p-3 hover:border-blue-400 transition cursor-pointer space-y-2"
                          >
                            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                              <span>{task.code}</span>
                              <span>{task.priority}</span>
                            </div>
                            <div className="text-xs font-bold text-slate-900 leading-snug">
                              {task.title}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {task.assigneeName} · Due {task.dueDate}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-100 tabular-nums">
                              <span>
                                {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} sub
                              </span>
                              <span>{task.loggedHours}h / {task.estimatedHours}h</span>
                            </div>
                          </div>
                        ))}
                        {colTasks.length === 0 && (
                          <div className="text-[11px] text-slate-400 text-center py-8">No tasks</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'LIST' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3 px-4">Code &amp; Task</th>
                      <th className="py-3 px-4">Workspace</th>
                      <th className="py-3 px-4">Assignee</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4 text-right">Hours</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-slate-500">
                          No tasks found in this scope.
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => setActiveTaskModal(task)}
                              className="font-bold text-slate-900 hover:text-blue-600 text-left cursor-pointer"
                            >
                              {task.code} — {task.title}
                            </button>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{task.workspaceId}</td>
                          <td className="py-3 px-4 text-slate-700">{task.assigneeName}</td>
                          <td className="py-3 px-4 font-medium text-slate-700">{task.priority}</td>
                          <td className="py-3 px-4">
                            <select
                              disabled={!canManageTasks}
                              value={task.status}
                              onChange={(e) =>
                                xpeedoOpsService.updateTaskStatus(
                                  task.id,
                                  e.target.value as OpsTaskStatus,
                                  userProfile?.name || 'User',
                                  role
                                )
                              }
                              className="px-2 py-1 text-xs border border-slate-200 rounded bg-white font-semibold"
                            >
                              {ALL_OPS_TASK_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                            {task.dueDate}
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                            {task.loggedHours}/{task.estimatedHours}h
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setActiveTaskModal(task)}
                              className="text-blue-600 hover:underline font-semibold cursor-pointer"
                            >
                              Open
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {viewMode === 'CALENDAR' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  {nowDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })} — Due Date Calendar
                </h3>
                <span className="text-xs text-slate-500 tabular-nums">{filteredTasks.length} tasks</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {calendarDays.map((day) => (
                  <div
                    key={day.iso}
                    className="min-h-[96px] rounded-lg border border-slate-200 p-2 bg-slate-50/40 space-y-1"
                  >
                    <div className="text-[11px] font-mono font-bold text-slate-500 tabular-nums">
                      {day.dayNum}
                    </div>
                    {day.tasks.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTaskModal(t)}
                        className="w-full text-left px-1.5 py-1 rounded bg-white border border-slate-200 hover:border-blue-500 text-[10px] font-semibold text-slate-800 truncate cursor-pointer"
                      >
                        {t.code} {t.title}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'TIMELINE' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Execution Schedule Timeline</h3>
                <span className="text-xs text-slate-500">Start → Due window &amp; progress</span>
              </div>
              {filteredTasks.length === 0 ? (
                <div className="text-xs text-slate-500 py-8 text-center">No scheduled tasks to display.</div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((t) => {
                    const pct =
                      t.status === 'Completed'
                        ? 100
                        : t.estimatedHours > 0
                        ? Math.min(100, Math.round((t.loggedHours / t.estimatedHours) * 100))
                        : 15;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setActiveTaskModal(t)}
                        className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 cursor-pointer space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-slate-900">
                            {t.code} · {t.title}
                          </span>
                          <span className="font-mono text-slate-500 tabular-nums">
                            {t.startDate} → {t.dueDate} · {t.status}
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-sm overflow-hidden">
                          <div
                            className={`h-full ${
                              t.status === 'Blocked'
                                ? 'bg-rose-600'
                                : t.status === 'Completed'
                                ? 'bg-emerald-600'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.max(8, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TASK DETAIL DRAWER / MODAL */}
      {currentModalTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs font-mono font-semibold text-blue-600">
                  {currentModalTask.code} · {currentModalTask.workspaceId}
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">{currentModalTask.title}</h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Assignee: {currentModalTask.assigneeName} · Priority: {currentModalTask.priority} · Due{' '}
                  {currentModalTask.dueDate}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTaskModal(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {currentModalTask.description && (
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                {currentModalTask.description}
              </p>
            )}

            {/* Status & Dependencies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  disabled={!canManageTasks}
                  value={currentModalTask.status}
                  onChange={(e) =>
                    xpeedoOpsService.updateTaskStatus(
                      currentModalTask.id,
                      e.target.value as OpsTaskStatus,
                      userProfile?.name || 'User',
                      role
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold"
                >
                  {ALL_OPS_TASK_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dependencies</label>
                <div className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 font-mono">
                  {currentModalTask.blockedByTaskIds.length > 0
                    ? `Blocked by: ${currentModalTask.blockedByTaskIds.join(', ')}`
                    : 'No blocking dependencies'}
                </div>
              </div>
            </div>

            {/* Subtasks */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckSquare size={14} className="text-blue-600" />
                <span>Subtasks ({currentModalTask.subtasks.length})</span>
              </div>
              <div className="space-y-1.5">
                {currentModalTask.subtasks.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={s.done}
                      onChange={() => xpeedoOpsService.toggleTaskSubtask(currentModalTask.id, s.id)}
                    />
                    <span className={s.done ? 'line-through text-slate-400' : ''}>{s.title}</span>
                  </label>
                ))}
              </div>
              {canManageTasks && (
                <div className="flex gap-2">
                  <input
                    value={subtaskDraft}
                    onChange={(e) => setSubtaskDraft(e.target.value)}
                    placeholder="Add subtask checklist item..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      xpeedoOpsService.addTaskSubtask(
                        currentModalTask.id,
                        subtaskDraft,
                        userProfile?.name || 'User',
                        role
                      );
                      setSubtaskDraft('');
                    }}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Time Tracking */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-600" />
                  <span>Time Tracking</span>
                </span>
                <span className="font-mono tabular-nums text-slate-600">
                  {currentModalTask.loggedHours}h logged / {currentModalTask.estimatedHours}h est
                </span>
              </div>
              {canManageTasks && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={timeHoursDraft}
                    onChange={(e) => setTimeHoursDraft(Number(e.target.value))}
                    className="w-20 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg font-mono"
                  />
                  <input
                    value={timeNoteDraft}
                    onChange={(e) => setTimeNoteDraft(e.target.value)}
                    placeholder="Work note..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      xpeedoOpsService.logTaskTime(
                        currentModalTask.id,
                        timeHoursDraft,
                        timeNoteDraft,
                        userProfile?.name || 'User',
                        role
                      );
                      setTimeNoteDraft('');
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Log Hours
                  </button>
                </div>
              )}
              {currentModalTask.timeLogs.length > 0 && (
                <div className="space-y-1 max-h-24 overflow-y-auto text-[11px] text-slate-600">
                  {currentModalTask.timeLogs.map((l) => (
                    <div key={l.id} className="flex justify-between">
                      <span>
                        {l.actor}: {l.note}
                      </span>
                      <span className="font-mono tabular-nums font-semibold">+{l.hours}h</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments & Attachments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-blue-600" />
                  <span>Comments ({currentModalTask.comments.length})</span>
                </div>
                <div className="space-y-1.5 max-h-28 overflow-y-auto text-xs">
                  {currentModalTask.comments.map((c) => (
                    <div key={c.id} className="bg-slate-50 p-2 rounded border border-slate-100">
                      <div className="font-semibold text-slate-800">{c.author}</div>
                      <div className="text-slate-600">{c.body}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder="Add comment..."
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      xpeedoOpsService.addTaskComment(
                        currentModalTask.id,
                        commentDraft,
                        userProfile?.name || 'User'
                      );
                      setCommentDraft('');
                    }}
                    className="px-2.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Post
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Paperclip size={14} className="text-blue-600" />
                  <span>Attachments ({currentModalTask.attachments.length})</span>
                </div>
                <div className="space-y-1.5 max-h-28 overflow-y-auto text-xs">
                  {currentModalTask.attachments.map((a) => (
                    <div key={a.id} className="bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100 flex justify-between">
                      <span className="font-medium text-slate-800 truncate">{a.name}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{a.addedBy}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input
                    value={attachNameDraft}
                    onChange={(e) => setAttachNameDraft(e.target.value)}
                    placeholder="Attachment reference / filename..."
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      xpeedoOpsService.addTaskAttachment(
                        currentModalTask.id,
                        attachNameDraft,
                        'Document',
                        'Attached',
                        userProfile?.name || 'User'
                      );
                      setAttachNameDraft('');
                    }}
                    className="px-2.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Attach
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW PROJECT MODAL */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create New Project</h3>
              <button type="button" onClick={() => setShowNewProjectModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Title *</label>
                <input
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g., EV Fleet Telematics Rollout"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client / Workspace</label>
                  <select
                    disabled={Boolean(lockedClientId)}
                    value={lockedClientId || projClientId}
                    onChange={(e) => setProjClientId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {operationalClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.workspaceKey})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={projDeptId}
                    onChange={(e) => setProjDeptId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="">General / All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manager</label>
                  <input
                    value={projManager}
                    onChange={(e) => setProjManager(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={projPriority}
                    onChange={(e) => setProjPriority(e.target.value as OpsProject['priority'])}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={projStatus}
                    onChange={(e) => setProjStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={projStartDate}
                    onChange={(e) => setProjStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={projDueDate}
                    onChange={(e) => setProjDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW TASK MODAL */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create Task</h3>
              <button type="button" onClick={() => setShowNewTaskModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g., Audit Beat 2 Delivery Schedule"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Project</label>
                  <select
                    value={taskProjectId}
                    onChange={(e) => setTaskProjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="">Workspace General</option>
                    {allProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assignee</label>
                  <input
                    list="xpeedo-staff-names"
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                  <datalist id="xpeedo-staff-names">
                    {staffOptions.slice(0, 30).map((s) => (
                      <option key={s.id} value={s.name} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value as OpsTaskStatus)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    {ALL_OPS_TASK_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as OpsTask['priority'])}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Est. Hours</label>
                  <input
                    type="number"
                    min={1}
                    value={taskEstHours}
                    onChange={(e) => setTaskEstHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={taskStart}
                    onChange={(e) => setTaskStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDue}
                    onChange={(e) => setTaskDue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blocked By Task (Optional)</label>
                <select
                  value={taskBlockedBy}
                  onChange={(e) => setTaskBlockedBy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">None</option>
                  {allTasks.map((t) => (
                    <option key={t.id} value={t.code}>
                      {t.code} — {t.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
