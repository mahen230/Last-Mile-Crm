import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  Plus,
  Clock,
  User,
  AlertCircle,
  Filter,
  Calendar,
  MapPin,
  Activity,
  Target,
  PlayCircle,
  RotateCcw,
  Search,
  TrendingUp,
  Home,
  Check,
  X,
  ChevronRight,
  Phone,
  MessageSquare,
  ExternalLink,
  Link as LinkIcon,
  Sparkles
} from 'lucide-react';
import { customerService } from '../../services/customerService';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { staffPermissionService } from '../../services/staffPermissionService';
import { Customer, Lead, FieldTask } from '../../types/models';
import CustomerProfileModal from '../customers/CustomerProfileModal';

type TaskItem = FieldTask;

const TASK_CATEGORIES: Array<FieldTask['category']> = [
  'KYC Collection',
  'Passbook Delivery',
  'Aadhaar Biometric',
  'PLI Renewal',
  'Address Verification'
];

export default function TasksView() {
  const { userProfile } = useAuth();
  const isSuperAdmin = staffPermissionService.isSuperAdmin(userProfile);

  const [tasks, setTasks] = useState<TaskItem[]>(() => customerService.getTasks());
  const [customers, setCustomers] = useState<Customer[]>(() => customerService.getCustomers());
  const [leads, setLeads] = useState<Lead[]>(() => customerService.getLeads());
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');
  const [selectedBeatFilter, setSelectedBeatFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [lastUpdatedToast, setLastUpdatedToast] = useState<string | null>(null);

  // Customer Profile View Modal state
  const [inspectCustomer, setInspectCustomer] = useState<Customer | null>(null);

  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<FieldTask['category']>('KYC Collection');
  const [newTaskBeat, setNewTaskBeat] = useState(
    userProfile?.beat ? String(userProfile.beat).replace(/^Beat\s*/i, '').trim() : '2'
  );
  const [newTaskAssignee, setNewTaskAssignee] = useState(
    userProfile?.name ? `${userProfile.name} (Beat ${userProfile?.beat || '2'})` : 'Mahaveer Prasad (Beat 2 Postman)'
  );
  const [newTaskLocation, setNewTaskLocation] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newTaskDueDate, setNewTaskDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTaskTargetStops, setNewTaskTargetStops] = useState<number>(5);

  // Linkage Form States (Customer / Lead Selector)
  const [linkTargetType, setLinkTargetType] = useState<'CUSTOMER' | 'LEAD' | 'NONE'>('NONE');
  const [linkSelectorSearch, setLinkSelectorSearch] = useState('');
  const [selectedCustomerToLink, setSelectedCustomerToLink] = useState<Customer | null>(null);
  const [selectedLeadToLink, setSelectedLeadToLink] = useState<Lead | null>(null);

  useEffect(() => {
    const syncData = () => {
      setTasks(customerService.getTasks());
      setCustomers(customerService.getCustomers());
      setLeads(customerService.getLeads());
    };
    const unsub = customerService.subscribe(syncData);
    return () => unsub();
  }, []);

  const triggerLiveFeedback = (msg: string) => {
    setLastUpdatedToast(msg);
    setTimeout(() => {
      setLastUpdatedToast(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  // Scope tasks & customers based on user role/beat permissions
  const scopedTasks = useMemo(
    () => tasks.filter(t => staffPermissionService.matchesUserBeatScope(userProfile, t)),
    [tasks, userProfile]
  );

  const scopedCustomers = useMemo(
    () => customers.filter(c => staffPermissionService.matchesUserBeatScope(userProfile, c)),
    [customers, userProfile]
  );

  // Overall Real-Time Progress Metrics
  const overallMetrics = useMemo(() => {
    const activeSet =
      selectedBeatFilter === 'ALL'
        ? scopedTasks
        : scopedTasks.filter(
            t => String(t.beatNo).replace(/^Beat\s*/i, '').trim() === selectedBeatFilter
          );

    const total = activeSet.length;
    const completed = activeSet.filter(t => t.status === 'Completed').length;
    const inProgress = activeSet.filter(t => t.status === 'In Progress').length;
    const pending = activeSet.filter(t => t.status === 'Pending').length;
    const highPriorityPending = activeSet.filter(
      t => t.priority === 'High' && t.status !== 'Completed'
    ).length;

    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;

    // Doorstep stops coverage across tasks
    const totalStopsTarget = activeSet.reduce((acc, t) => acc + (t.householdsTarget || 5), 0);
    const totalStopsCovered = activeSet.reduce(
      (acc, t) =>
        acc +
        (t.status === 'Completed'
          ? t.householdsTarget || 5
          : t.householdsCovered ?? (t.status === 'In Progress' ? Math.round((t.householdsTarget || 5) / 2) : 0)),
      0
    );
    const stopsCoveragePct =
      totalStopsTarget > 0 ? Math.min(100, Math.round((totalStopsCovered / totalStopsTarget) * 100)) : 0;

    // Weighted operational progress (Completed = 100%, In Progress uses progressPercent or 50%)
    const weightedSum = activeSet.reduce((acc, t) => {
      if (t.status === 'Completed') return acc + 100;
      if (t.status === 'In Progress') return acc + (t.progressPercent ?? 50);
      return acc + (t.progressPercent ?? 0);
    }, 0);
    const weightedProgressPct = total > 0 ? Math.round(weightedSum / total) : 0;

    return {
      total,
      completed,
      inProgress,
      pending,
      highPriorityPending,
      completionPct,
      inProgressPct,
      totalStopsTarget,
      totalStopsCovered,
      stopsCoveragePct,
      weightedProgressPct
    };
  }, [scopedTasks, selectedBeatFilter]);

  // Daily Beat-wise Coverage Breakdown
  const beatCoverageStats = useMemo(() => {
    const beatMap = new Map<
      string,
      {
        beatNo: string;
        staffName: string;
        totalTasks: number;
        completedTasks: number;
        inProgressTasks: number;
        pendingTasks: number;
        stopsTarget: number;
        stopsCovered: number;
        totalHouseholds: number;
        verifiedHouseholds: number;
      }
    >();

    // Initialize from scoped tasks
    scopedTasks.forEach(t => {
      const normBeat = String(t.beatNo || '2').replace(/^Beat\s*/i, '').trim();
      if (!beatMap.has(normBeat)) {
        beatMap.set(normBeat, {
          beatNo: normBeat,
          staffName: (t.assignedTo || 'Assigned Postman').replace(/\s*\(Beat.*?\)/i, ''),
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          pendingTasks: 0,
          stopsTarget: 0,
          stopsCovered: 0,
          totalHouseholds: 0,
          verifiedHouseholds: 0
        });
      }
      const entry = beatMap.get(normBeat)!;
      entry.totalTasks += 1;
      const target = t.householdsTarget || 5;
      const covered =
        t.status === 'Completed'
          ? target
          : t.householdsCovered ?? (t.status === 'In Progress' ? Math.round(target / 2) : 0);

      entry.stopsTarget += target;
      entry.stopsCovered += covered;

      if (t.status === 'Completed') entry.completedTasks += 1;
      else if (t.status === 'In Progress') entry.inProgressTasks += 1;
      else entry.pendingTasks += 1;
    });

    // Enrich with household verification counts from master customer directory
    scopedCustomers.forEach(c => {
      const normBeat = String(c.beatNo || '2').replace(/^Beat\s*/i, '').trim();
      if (beatMap.has(normBeat)) {
        const entry = beatMap.get(normBeat)!;
        entry.totalHouseholds += 1;
        if (c.verificationStatus === 'Field Confirmed') {
          entry.verifiedHouseholds += 1;
        }
      }
    });

    return Array.from(beatMap.values())
      .map(b => {
        const taskCompletionPct =
          b.totalTasks > 0 ? Math.round((b.completedTasks / b.totalTasks) * 100) : 0;
        const inProgressPct =
          b.totalTasks > 0 ? Math.round((b.inProgressTasks / b.totalTasks) * 100) : 0;
        const stopsCompletionPct =
          b.stopsTarget > 0 ? Math.min(100, Math.round((b.stopsCovered / b.stopsTarget) * 100)) : 0;
        const householdCoveragePct =
          b.totalHouseholds > 0 ? Math.round((b.verifiedHouseholds / b.totalHouseholds) * 100) : 100;

        // Combined Daily Beat Coverage % (blending daily task stops & task completion)
        const dailyCoveragePct = Math.round(taskCompletionPct * 0.6 + stopsCompletionPct * 0.4);

        return {
          ...b,
          taskCompletionPct,
          inProgressPct,
          stopsCompletionPct,
          householdCoveragePct,
          dailyCoveragePct
        };
      })
      .sort((a, b) => Number(a.beatNo) - Number(b.beatNo));
  }, [scopedTasks, scopedCustomers]);

  // Filtered tasks for the main task queue
  const filteredTasks = useMemo(() => {
    return scopedTasks.filter(t => {
      const normBeat = String(t.beatNo || '').replace(/^Beat\s*/i, '').trim();
      if (selectedBeatFilter !== 'ALL' && normBeat !== selectedBeatFilter) return false;
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchId = t.id.toLowerCase().includes(q);
        const matchLoc = t.location.toLowerCase().includes(q);
        const matchStaff = t.assignedTo.toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchLoc && !matchStaff) return false;
      }
      return true;
    });
  }, [scopedTasks, selectedBeatFilter, statusFilter, categoryFilter, searchQuery]);

  // Real-time task status update handler
  const handleStatusChange = (task: TaskItem, newStatus: TaskItem['status']) => {
    customerService.updateTask(task.id, { status: newStatus });
    triggerLiveFeedback(`${task.id} marked as "${newStatus}" — Beat ${task.beatNo} coverage updated`);
  };

  // Real-time doorstep stop counter adjustment
  const handleAdjustStops = (task: TaskItem, delta: number) => {
    const target = task.householdsTarget || 5;
    const currentCovered =
      task.status === 'Completed'
        ? target
        : task.householdsCovered ?? (task.status === 'In Progress' ? Math.round(target / 2) : 0);
    const nextCovered = Math.max(0, Math.min(target, currentCovered + delta));
    const nextPct = Math.round((nextCovered / target) * 100);

    let nextStatus: TaskItem['status'] = task.status;
    if (nextCovered >= target) {
      nextStatus = 'Completed';
    } else if (nextCovered > 0) {
      nextStatus = 'In Progress';
    } else {
      nextStatus = 'Pending';
    }

    customerService.updateTask(task.id, {
      householdsCovered: nextCovered,
      householdsTarget: target,
      progressPercent: nextPct,
      status: nextStatus
    });
    triggerLiveFeedback(
      `${task.id}: ${nextCovered}/${target} doorstep stops covered (${nextPct}%)`
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskLocation.trim()) return;

    let linkedCustomerId: string | undefined;
    let linkedCustomerMasterId: string | undefined;
    let linkedCustomerName: string | undefined;
    let linkedCustomerPhone: string | undefined;
    let linkedCustomerAddress: string | undefined;
    let linkedLeadId: string | undefined;
    let linkedLeadProduct: string | undefined;
    let linkedLeadStage: string | undefined;
    let linkType: FieldTask['linkType'] = linkTargetType;

    if (linkTargetType === 'CUSTOMER' && selectedCustomerToLink) {
      linkedCustomerId = selectedCustomerToLink.id;
      linkedCustomerMasterId = selectedCustomerToLink.masterId || selectedCustomerToLink.id;
      linkedCustomerName = selectedCustomerToLink.name;
      linkedCustomerPhone = selectedCustomerToLink.mobile;
      linkedCustomerAddress = selectedCustomerToLink.address?.fullAddress || `${selectedCustomerToLink.houseNo || ''}, ${selectedCustomerToLink.sector || ''}, ${selectedCustomerToLink.area || ''}`;
    } else if (linkTargetType === 'LEAD' && selectedLeadToLink) {
      linkedLeadId = selectedLeadToLink.id;
      linkedCustomerName = selectedLeadToLink.customerName;
      linkedCustomerPhone = selectedLeadToLink.customerMobile;
      linkedLeadProduct = selectedLeadToLink.productName;
      linkedLeadStage = selectedLeadToLink.stage;
      linkedCustomerId = selectedLeadToLink.customerId;
    }

    const created = customerService.addTask({
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      assignedTo: newTaskAssignee.trim() || 'Beat Postman',
      beatNo: newTaskBeat,
      location: newTaskLocation.trim(),
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      householdsTarget: Math.max(1, Number(newTaskTargetStops) || 5),
      linkedCustomerId,
      linkedCustomerMasterId,
      linkedCustomerName,
      linkedCustomerPhone,
      linkedCustomerAddress,
      linkedLeadId,
      linkedLeadProduct,
      linkedLeadStage,
      linkType
    });

    setNewTaskTitle('');
    setNewTaskLocation('');
    setSelectedCustomerToLink(null);
    setSelectedLeadToLink(null);
    setLinkTargetType('NONE');
    setLinkSelectorSearch('');
    setShowNewTaskModal(false);
    triggerLiveFeedback(`Created ${created.id} for Beat ${created.beatNo}${linkedCustomerName ? ` (Linked to ${linkedCustomerName})` : ''}`);
  };

  return (
    <div className="space-y-6" id="tasks-view-root">
      {/* Top Header & Live Status Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    Field Operations & Daily Beat Coverage Tracker
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE TRACKING
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isSuperAdmin
                    ? `Global Division View: Monitoring ${scopedTasks.length} field operations across ${beatCoverageStats.length} delivery beats`
                    : `Beat-Restricted View (${userProfile?.beat || 'Beat 2'}): Real-time doorstep task completion & beat coverage`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {lastUpdatedToast && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-xs animate-fade-in">
                <Activity size={13} className="text-emerald-400" />
                <span>{lastUpdatedToast}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowNewTaskModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>Add Field Task</span>
            </button>
          </div>
        </div>

        {/* Real-Time Master Progress Bar & KPI Strip */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Target size={13} className="text-red-700" />
                <span>
                  {selectedBeatFilter === 'ALL'
                    ? 'Daily Division Beat Task Completion'
                    : `Beat ${selectedBeatFilter} Daily Coverage Progress`}
                </span>
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-extrabold text-slate-900">
                  {overallMetrics.completionPct}%
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {overallMetrics.completed} of {overallMetrics.total} Tasks Completed
                </span>
                <span className="text-xs font-medium text-slate-500">
                  • Field Progress Score: <strong className="text-slate-800">{overallMetrics.weightedProgressPct}%</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
                <span className="font-semibold text-slate-700">
                  Completed ({overallMetrics.completed})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
                <span className="font-semibold text-slate-700">
                  In Progress ({overallMetrics.inProgress})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-300 inline-block" />
                <span className="font-semibold text-slate-700">
                  Pending ({overallMetrics.pending})
                </span>
              </div>
            </div>
          </div>

          {/* Multi-Segment Real-Time Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex p-0.5 gap-0.5">
              {overallMetrics.completionPct > 0 && (
                <div
                  className="bg-emerald-600 h-full rounded-l-full transition-all duration-500 ease-out"
                  style={{
                    width: `${overallMetrics.completionPct}%`,
                    borderTopRightRadius: overallMetrics.inProgressPct === 0 ? '9999px' : '2px',
                    borderBottomRightRadius: overallMetrics.inProgressPct === 0 ? '9999px' : '2px'
                  }}
                  title={`Completed: ${overallMetrics.completionPct}%`}
                />
              )}
              {overallMetrics.inProgressPct > 0 && (
                <div
                  className="bg-amber-500 h-full transition-all duration-500 ease-out"
                  style={{
                    width: `${overallMetrics.inProgressPct}%`,
                    borderTopLeftRadius: overallMetrics.completionPct === 0 ? '9999px' : '2px',
                    borderBottomLeftRadius: overallMetrics.completionPct === 0 ? '9999px' : '2px',
                    borderTopRightRadius: '9999px',
                    borderBottomRightRadius: '9999px'
                  }}
                  title={`In Progress: ${overallMetrics.inProgressPct}%`}
                />
              )}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
              <span>
                Doorstep Stops Covered:{' '}
                <strong className="text-slate-800">
                  {overallMetrics.totalStopsCovered} / {overallMetrics.totalStopsTarget} Households ({overallMetrics.stopsCoveragePct}%)
                </strong>
              </span>
              <span>
                {overallMetrics.highPriorityPending > 0 ? (
                  <span className="text-red-700 font-semibold">
                    {overallMetrics.highPriorityPending} High-Priority Task{overallMetrics.highPriorityPending > 1 ? 's' : ''} Remaining
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold">
                    All High-Priority Tasks Completed!
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* 4-Card Real-Time Status Summary Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="bg-white p-3 rounded-xl border border-slate-200/90 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Completed Today</p>
                <p className="text-lg font-extrabold text-emerald-700 mt-0.5">
                  {overallMetrics.completed}{' '}
                  <span className="text-xs font-semibold text-slate-400">
                    / {overallMetrics.total}
                  </span>
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                {overallMetrics.completionPct}%
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/90 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Active On-Beat</p>
                <p className="text-lg font-extrabold text-amber-600 mt-0.5">
                  {overallMetrics.inProgress}{' '}
                  <span className="text-xs font-semibold text-slate-400">Tasks</span>
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                {overallMetrics.inProgressPct}%
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/90 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Pending Queue</p>
                <p className="text-lg font-extrabold text-slate-800 mt-0.5">
                  {overallMetrics.pending}{' '}
                  <span className="text-xs font-semibold text-slate-400">Tasks</span>
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                {overallMetrics.total > 0
                  ? Math.round((overallMetrics.pending / overallMetrics.total) * 100)
                  : 0}
                %
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/90 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Doorstep Stops</p>
                <p className="text-lg font-extrabold text-blue-700 mt-0.5">
                  {overallMetrics.totalStopsCovered}{' '}
                  <span className="text-xs font-semibold text-slate-400">
                    / {overallMetrics.totalStopsTarget}
                  </span>
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                {overallMetrics.stopsCoveragePct}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Beat Coverage Breakdown Cards */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-700" />
              <span>Daily Beat Coverage & Completion Percentages</span>
            </h3>
            <p className="text-xs text-slate-500">
              Click any beat card to filter field tasks for that specific beat
            </p>
          </div>
          {selectedBeatFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedBeatFilter('ALL')}
              className="text-xs font-bold text-red-700 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 self-start sm:self-auto cursor-pointer"
            >
              Show All Beats
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {beatCoverageStats.map(beat => {
            const isSelected = selectedBeatFilter === beat.beatNo;
            const barColor =
              beat.taskCompletionPct >= 75
                ? 'bg-emerald-600'
                : beat.taskCompletionPct >= 40
                ? 'bg-amber-500'
                : 'bg-red-600';

            return (
              <div
                key={beat.beatNo}
                onClick={() =>
                  setSelectedBeatFilter(prev => (prev === beat.beatNo ? 'ALL' : beat.beatNo))
                }
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold">Beat {beat.beatNo}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isSelected
                            ? 'bg-white/15 text-white'
                            : beat.taskCompletionPct === 100
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {beat.completedTasks}/{beat.totalTasks} Done
                      </span>
                    </div>
                    <p
                      className={`text-[11px] font-medium truncate mt-0.5 ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {beat.staffName}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-lg font-extrabold ${
                        isSelected
                          ? 'text-emerald-400'
                          : beat.taskCompletionPct >= 75
                          ? 'text-emerald-700'
                          : beat.taskCompletionPct >= 40
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}
                    >
                      {beat.taskCompletionPct}%
                    </span>
                    <p
                      className={`text-[10px] font-semibold ${
                        isSelected ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      Task Completion
                    </p>
                  </div>
                </div>

                {/* Per-Beat Progress Bar */}
                <div
                  className={`w-full h-2 rounded-full overflow-hidden flex mb-2.5 ${
                    isSelected ? 'bg-slate-700' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`${barColor} h-full transition-all duration-500`}
                    style={{ width: `${beat.taskCompletionPct}%` }}
                  />
                  {beat.inProgressPct > 0 && (
                    <div
                      className="bg-amber-400 h-full transition-all duration-500"
                      style={{ width: `${beat.inProgressPct}%` }}
                    />
                  )}
                </div>

                <div
                  className={`flex items-center justify-between text-[11px] pt-1 border-t ${
                    isSelected ? 'border-slate-700 text-slate-300' : 'border-slate-200/80 text-slate-600'
                  }`}
                >
                  <span>
                    Stops: <strong>{beat.stopsCovered}/{beat.stopsTarget}</strong> ({beat.stopsCompletionPct}%)
                  </span>
                  <div className="flex items-center gap-1.5">
                    {beat.inProgressTasks > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {beat.inProgressTasks} Active
                      </span>
                    )}
                    {beat.pendingTasks > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isSelected
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {beat.pendingTasks} Queued
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {(
            [
              { id: 'All', label: 'All Tasks', count: overallMetrics.total },
              { id: 'Pending', label: 'Pending', count: overallMetrics.pending },
              { id: 'In Progress', label: 'In Progress', count: overallMetrics.inProgress },
              { id: 'Completed', label: 'Completed', count: overallMetrics.completed }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  statusFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search task, beat, location..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-slate-400"
          >
            <option value="ALL">All Categories</option>
            {TASK_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks Queue List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No field tasks match your current filters</p>
            <p className="text-xs text-slate-500">
              Try switching status tabs or clearing the search filter.
            </p>
          </div>
        ) : (
          filteredTasks.map(t => {
            const targetStops = t.householdsTarget || 5;
            const coveredStops =
              t.status === 'Completed'
                ? targetStops
                : t.householdsCovered ??
                  (t.status === 'In Progress' ? Math.round(targetStops / 2) : 0);
            const taskPct =
              t.status === 'Completed'
                ? 100
                : Math.min(100, Math.round((coveredStops / targetStops) * 100));

            return (
              <div
                key={t.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs transition ${
                  t.status === 'Completed'
                    ? 'border-emerald-200/80 bg-emerald-50/10'
                    : t.status === 'In Progress'
                    ? 'border-amber-300/80'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Task Info */}
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(
                          t,
                          t.status === 'Completed' ? 'Pending' : 'Completed'
                        )
                      }
                      className={`mt-1 w-5 h-5 rounded-lg border flex items-center justify-center transition shrink-0 cursor-pointer ${
                        t.status === 'Completed'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : t.status === 'In Progress'
                          ? 'bg-amber-50 border-amber-500 text-amber-600'
                          : 'border-slate-300 hover:border-red-600'
                      }`}
                      title="Toggle task completion"
                    >
                      {t.status === 'Completed' && <Check size={13} />}
                      {t.status === 'In Progress' && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {t.id}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-red-50 text-red-800 font-semibold rounded-md">
                          {t.category}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md">
                          Beat {String(t.beatNo).replace(/^Beat\s*/i, '')}
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.5 font-bold rounded-md ${
                            t.priority === 'High'
                              ? 'bg-red-100 text-red-700'
                              : t.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t.priority} Priority
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                            t.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'In Progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              t.status === 'Completed'
                                ? 'bg-emerald-600'
                                : t.status === 'In Progress'
                                ? 'bg-amber-500 animate-pulse'
                                : 'bg-slate-400'
                            }`}
                          />
                          {t.status}
                        </span>
                      </div>

                      <h4
                        className={`text-sm font-bold ${
                          t.status === 'Completed'
                            ? 'line-through text-slate-400'
                            : 'text-slate-900'
                        }`}
                      >
                        {t.title}
                      </h4>

                      {/* Linked Customer / Lead Profile Badge with Direct Quick Contact Action Buttons */}
                      {t.linkedCustomerName && (
                        <div className="pt-1 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const found = customers.find(
                                c =>
                                  c.id === t.linkedCustomerId ||
                                  c.masterId === t.linkedCustomerMasterId ||
                                  c.name.toLowerCase() === (t.linkedCustomerName || '').toLowerCase()
                              );
                              if (found) {
                                setInspectCustomer(found);
                              } else {
                                setInspectCustomer({
                                  id: t.linkedCustomerId || `CUST-${t.id}`,
                                  masterId: t.linkedCustomerMasterId || `CUST-${t.id}`,
                                  name: t.linkedCustomerName || 'Linked Customer',
                                  mobile: t.linkedCustomerPhone || '',
                                  beatNo: String(t.beatNo).replace(/^Beat\s*/i, ''),
                                  area: t.location || 'Dadabari SO',
                                  address: { fullAddress: t.linkedCustomerAddress || t.location },
                                  verificationStatus: 'Field Confirmed',
                                  products: []
                                });
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-red-50 to-amber-50 hover:from-red-100 hover:to-amber-100 text-red-900 border border-red-200/90 rounded-lg text-xs font-bold transition shadow-2xs group cursor-pointer"
                            title="Click to inspect full Master Customer Profile"
                          >
                            <User size={12} className="text-red-700" />
                            <span className="group-hover:underline">
                              {t.linkedCustomerName}
                              {t.linkedCustomerMasterId ? ` (${t.linkedCustomerMasterId})` : ''}
                            </span>
                            {t.linkedLeadProduct && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-mono">
                                {t.linkedLeadProduct}
                              </span>
                            )}
                            <ExternalLink size={11} className="text-red-500 opacity-70 group-hover:opacity-100" />
                          </button>

                          {/* Quick Contact Action: WhatsApp Direct Message Button */}
                          {t.linkedCustomerPhone && (
                            <a
                              href={`https://wa.me/91${t.linkedCustomerPhone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                                `नमस्ते ${t.linkedCustomerName} जी, भारतीय डाक (India Post - Beat ${String(t.beatNo).replace(/^Beat\s*/i, '')}) से आपके कार्य "${t.title}" के संदर्भ में संपर्क किया जा रहा है।`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition"
                              title={`Send WhatsApp message to ${t.linkedCustomerPhone}`}
                            >
                              <MessageSquare size={11} />
                              <span>WhatsApp</span>
                            </a>
                          )}

                          {/* Quick Contact Action: Direct Phone Call Button */}
                          {t.linkedCustomerPhone && (
                            <a
                              href={`tel:${t.linkedCustomerPhone.replace(/\D/g, '')}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold shadow-2xs transition"
                              title={`Direct call to ${t.linkedCustomerPhone}`}
                            >
                              <Phone size={11} className="text-emerald-400" />
                              <span>Call ({t.linkedCustomerPhone.slice(-10)})</span>
                            </a>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-red-600" />
                          <span>{t.location}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={12} className="text-blue-600" />
                          <span>{t.assignedTo}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" />
                          <span>Due: {t.dueDate}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Real-Time Doorstep Stop Progress & 3-Stage Status Controls */}
                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {/* Doorstep Stop Progress Counter & Mini Bar */}
                    <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 min-w-[200px] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-600 flex items-center gap-1">
                          <Home size={11} className="text-slate-500" />
                          <span>Beat Stops:</span>
                        </span>
                        <span className="font-extrabold text-slate-900">
                          {coveredStops}/{targetStops} ({taskPct}%)
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            taskPct === 100
                              ? 'bg-emerald-600'
                              : taskPct > 0
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                          style={{ width: `${taskPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-[10px] text-slate-400 font-medium">
                          Adjust visited stops
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAdjustStops(t, -1)}
                            disabled={coveredStops <= 0}
                            className="w-5 h-5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 text-xs font-bold flex items-center justify-center cursor-pointer"
                            title="Decrease visited stops"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustStops(t, 1)}
                            disabled={coveredStops >= targetStops}
                            className="w-5 h-5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 text-xs font-bold flex items-center justify-center cursor-pointer"
                            title="Increase visited stops"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Interactive 3-Stage Status Stepper */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-end sm:self-center">
                      {(['Pending', 'In Progress', 'Completed'] as const).map(st => {
                        const active = t.status === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStatusChange(t, st)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                              active
                                ? st === 'Completed'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : st === 'In Progress'
                                  ? 'bg-amber-500 text-white shadow-2xs'
                                  : 'bg-slate-800 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add New Field Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Assign New Field Operation Task
                </h3>
                <p className="text-xs text-slate-500">
                  Task will immediately sync with live beat coverage tracking
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTaskModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Description *
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Collect SSA KYC documents at Keshavpura Sector 6"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Operation Category
                  </label>
                  <select
                    value={newTaskCategory}
                    onChange={e => setNewTaskCategory(e.target.value as TaskItem['category'])}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                    {TASK_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Beat Number
                  </label>
                  <select
                    value={newTaskBeat}
                    onChange={e => setNewTaskBeat(e.target.value)}
                    disabled={!isSuperAdmin && !!userProfile?.beat}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white disabled:bg-slate-100"
                  >
                    {['1', '2', '3', '4', '5', '6'].map(b => (
                      <option key={b} value={b}>
                        Beat {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer / Lead Schema Linkage Selector */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <LinkIcon size={13} className="text-red-700" />
                    <span>Link Customer Profile or Lead Schema</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-semibold">(Optional)</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setLinkTargetType('NONE');
                      setSelectedCustomerToLink(null);
                      setSelectedLeadToLink(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      linkTargetType === 'NONE'
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    No Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLinkTargetType('CUSTOMER');
                      setSelectedLeadToLink(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                      linkTargetType === 'CUSTOMER'
                        ? 'bg-red-700 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <User size={12} />
                    <span>Customer Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLinkTargetType('LEAD');
                      setSelectedCustomerToLink(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                      linkTargetType === 'LEAD'
                        ? 'bg-blue-700 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Target size={12} />
                    <span>Lead Schema</span>
                  </button>
                </div>

                {linkTargetType === 'CUSTOMER' && (
                  <div className="space-y-2 pt-1 border-t border-slate-200/60">
                    <div className="relative">
                      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={linkSelectorSearch}
                        onChange={e => setLinkSelectorSearch(e.target.value)}
                        placeholder="Search customer by name, mobile, or ID..."
                        className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    {selectedCustomerToLink ? (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            <span>{selectedCustomerToLink.name}</span>
                            <span className="text-[10px] font-mono text-emerald-700">
                              ({selectedCustomerToLink.masterId || selectedCustomerToLink.id})
                            </span>
                          </div>
                          <div className="text-[10px] text-emerald-800 font-mono mt-0.5">
                            📱 {selectedCustomerToLink.mobile} • Beat {selectedCustomerToLink.beatNo || '2'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerToLink(null)}
                          className="text-slate-400 hover:text-slate-700 p-1"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="max-h-36 overflow-y-auto space-y-1 border border-slate-200 rounded-lg p-1 bg-white">
                        {customers
                          .filter(c => {
                            if (!linkSelectorSearch.trim()) return true;
                            const q = linkSelectorSearch.toLowerCase();
                            return (
                              (c.name || '').toLowerCase().includes(q) ||
                              (c.mobile || '').includes(q) ||
                              (c.masterId || c.id || '').toLowerCase().includes(q)
                            );
                          })
                          .slice(0, 6)
                          .map(c => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setSelectedCustomerToLink(c);
                                if (!newTaskLocation) {
                                  setNewTaskLocation(c.address?.fullAddress || c.area || `Sector ${c.sector || '7'}, Keshavpura`);
                                }
                                if (!newTaskTitle) {
                                  setNewTaskTitle(`Doorstep follow-up for ${c.name}`);
                                }
                              }}
                              className="p-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-slate-800">{c.name}</span>
                                <span className="text-[10px] text-slate-500 font-mono ml-2">
                                  {c.mobile} • {c.masterId || c.id}
                                </span>
                              </div>
                              <span className="text-[10px] text-red-600 font-bold">Select</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {linkTargetType === 'LEAD' && (
                  <div className="space-y-2 pt-1 border-t border-slate-200/60">
                    <div className="relative">
                      <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={linkSelectorSearch}
                        onChange={e => setLinkSelectorSearch(e.target.value)}
                        placeholder="Search lead by customer, scheme, mobile..."
                        className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    {selectedLeadToLink ? (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-blue-950 flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-blue-600" />
                            <span>{selectedLeadToLink.customerName}</span>
                            <span className="text-[10px] font-mono text-blue-700">
                              ({selectedLeadToLink.id})
                            </span>
                          </div>
                          <div className="text-[10px] text-blue-800 mt-0.5">
                            Scheme: {selectedLeadToLink.productName} • Stage: {selectedLeadToLink.stage}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedLeadToLink(null)}
                          className="text-slate-400 hover:text-slate-700 p-1"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="max-h-36 overflow-y-auto space-y-1 border border-slate-200 rounded-lg p-1 bg-white">
                        {leads
                          .filter(l => {
                            if (!linkSelectorSearch.trim()) return true;
                            const q = linkSelectorSearch.toLowerCase();
                            return (
                              (l.customerName || '').toLowerCase().includes(q) ||
                              (l.customerMobile || '').includes(q) ||
                              (l.productName || '').toLowerCase().includes(q) ||
                              (l.id || '').toLowerCase().includes(q)
                            );
                          })
                          .slice(0, 6)
                          .map(l => (
                            <div
                              key={l.id}
                              onClick={() => {
                                setSelectedLeadToLink(l);
                                if (!newTaskLocation) {
                                  setNewTaskLocation(l.customerAddress || 'Keshavpura Delivery Beat');
                                }
                                if (!newTaskTitle) {
                                  setNewTaskTitle(`Doorstep lead visit: ${l.productName} for ${l.customerName}`);
                                }
                              }}
                              className="p-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-slate-800">{l.customerName}</span>
                                <span className="text-[10px] text-slate-500 ml-2">
                                  {l.productName} • {l.stage}
                                </span>
                              </div>
                              <span className="text-[10px] text-blue-600 font-bold">Select</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location / Colony *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTaskLocation}
                    onChange={e => setNewTaskLocation(e.target.value)}
                    placeholder="e.g., KH 110, Sector 6"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Household Stops
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newTaskTargetStops}
                    onChange={e => setNewTaskTargetStops(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={e =>
                      setNewTaskPriority(e.target.value as 'High' | 'Medium' | 'Low')
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={e => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Delivery Staff
                </label>
                <input
                  type="text"
                  value={newTaskAssignee}
                  onChange={e => setNewTaskAssignee(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-700 hover:bg-red-800 text-white cursor-pointer"
                >
                  Save & Track Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
