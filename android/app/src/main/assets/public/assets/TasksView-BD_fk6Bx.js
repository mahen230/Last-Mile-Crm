import { c as createLucideIcon, u as useAuth, s as staffPermissionService, r as reactExports, b as customerService, j as jsxRuntimeExports, C as CircleCheck, P as Plus, i as Target, S as Search, Y as Check, a8 as User, aj as ExternalLink, M as MessageSquare, n as Phone, e as MapPin, k as Calendar, H as House, X } from "./index-u5ATSoh6.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  [
    "path",
    {
      d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
      key: "169zse"
    }
  ]
];
const Activity = createLucideIcon("activity", __iconNode$2);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", key: "1cjeqo" }],
  ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", key: "19qd67" }]
];
const Link = createLucideIcon("link", __iconNode$1);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 7h6v6", key: "box55l" }],
  ["path", { d: "m22 7-8.5 8.5-5-5L2 17", key: "1t1m79" }]
];
const TrendingUp = createLucideIcon("trending-up", __iconNode);
const TASK_CATEGORIES = [
  "KYC Collection",
  "Passbook Delivery",
  "Aadhaar Biometric",
  "PLI Renewal",
  "Address Verification"
];
function TasksView() {
  const { userProfile } = useAuth();
  const isSuperAdmin = staffPermissionService.isSuperAdmin(userProfile);
  const [tasks, setTasks] = reactExports.useState(() => customerService.getTasks());
  const [customers, setCustomers] = reactExports.useState(() => customerService.getCustomers());
  const [leads, setLeads] = reactExports.useState(() => customerService.getLeads());
  const [statusFilter, setStatusFilter] = reactExports.useState("All");
  const [selectedBeatFilter, setSelectedBeatFilter] = reactExports.useState("ALL");
  const [categoryFilter, setCategoryFilter] = reactExports.useState("ALL");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [showNewTaskModal, setShowNewTaskModal] = reactExports.useState(false);
  const [lastUpdatedToast, setLastUpdatedToast] = reactExports.useState(null);
  const [inspectCustomer, setInspectCustomer] = reactExports.useState(null);
  const [newTaskTitle, setNewTaskTitle] = reactExports.useState("");
  const [newTaskCategory, setNewTaskCategory] = reactExports.useState("KYC Collection");
  const [newTaskBeat, setNewTaskBeat] = reactExports.useState(
    (userProfile == null ? void 0 : userProfile.beat) ? String(userProfile.beat).replace(/^Beat\s*/i, "").trim() : "2"
  );
  const [newTaskAssignee, setNewTaskAssignee] = reactExports.useState(
    (userProfile == null ? void 0 : userProfile.name) ? `${userProfile.name} (Beat ${(userProfile == null ? void 0 : userProfile.beat) || "2"})` : "Mahaveer Prasad (Beat 2 Postman)"
  );
  const [newTaskLocation, setNewTaskLocation] = reactExports.useState("");
  const [newTaskPriority, setNewTaskPriority] = reactExports.useState("High");
  const [newTaskDueDate, setNewTaskDueDate] = reactExports.useState(() => (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [newTaskTargetStops, setNewTaskTargetStops] = reactExports.useState(5);
  const [linkTargetType, setLinkTargetType] = reactExports.useState("NONE");
  const [linkSelectorSearch, setLinkSelectorSearch] = reactExports.useState("");
  const [selectedCustomerToLink, setSelectedCustomerToLink] = reactExports.useState(null);
  const [selectedLeadToLink, setSelectedLeadToLink] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const syncData = () => {
      setTasks(customerService.getTasks());
      setCustomers(customerService.getCustomers());
      setLeads(customerService.getLeads());
    };
    const unsub = customerService.subscribe(syncData);
    return () => unsub();
  }, []);
  const triggerLiveFeedback = (msg) => {
    setLastUpdatedToast(msg);
    setTimeout(() => {
      setLastUpdatedToast((prev) => prev === msg ? null : prev);
    }, 2800);
  };
  const scopedTasks = reactExports.useMemo(
    () => tasks.filter((t) => staffPermissionService.matchesUserBeatScope(userProfile, t)),
    [tasks, userProfile]
  );
  const scopedCustomers = reactExports.useMemo(
    () => customers.filter((c) => staffPermissionService.matchesUserBeatScope(userProfile, c)),
    [customers, userProfile]
  );
  const overallMetrics = reactExports.useMemo(() => {
    const activeSet = selectedBeatFilter === "ALL" ? scopedTasks : scopedTasks.filter(
      (t) => String(t.beatNo).replace(/^Beat\s*/i, "").trim() === selectedBeatFilter
    );
    const total = activeSet.length;
    const completed = activeSet.filter((t) => t.status === "Completed").length;
    const inProgress = activeSet.filter((t) => t.status === "In Progress").length;
    const pending = activeSet.filter((t) => t.status === "Pending").length;
    const highPriorityPending = activeSet.filter(
      (t) => t.priority === "High" && t.status !== "Completed"
    ).length;
    const completionPct = total > 0 ? Math.round(completed / total * 100) : 0;
    const inProgressPct = total > 0 ? Math.round(inProgress / total * 100) : 0;
    const totalStopsTarget = activeSet.reduce((acc, t) => acc + (t.householdsTarget || 5), 0);
    const totalStopsCovered = activeSet.reduce(
      (acc, t) => acc + (t.status === "Completed" ? t.householdsTarget || 5 : t.householdsCovered ?? (t.status === "In Progress" ? Math.round((t.householdsTarget || 5) / 2) : 0)),
      0
    );
    const stopsCoveragePct = totalStopsTarget > 0 ? Math.min(100, Math.round(totalStopsCovered / totalStopsTarget * 100)) : 0;
    const weightedSum = activeSet.reduce((acc, t) => {
      if (t.status === "Completed") return acc + 100;
      if (t.status === "In Progress") return acc + (t.progressPercent ?? 50);
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
  const beatCoverageStats = reactExports.useMemo(() => {
    const beatMap = /* @__PURE__ */ new Map();
    scopedTasks.forEach((t) => {
      const normBeat = String(t.beatNo || "2").replace(/^Beat\s*/i, "").trim();
      if (!beatMap.has(normBeat)) {
        beatMap.set(normBeat, {
          beatNo: normBeat,
          staffName: (t.assignedTo || "Assigned Postman").replace(/\s*\(Beat.*?\)/i, ""),
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
      const entry = beatMap.get(normBeat);
      entry.totalTasks += 1;
      const target = t.householdsTarget || 5;
      const covered = t.status === "Completed" ? target : t.householdsCovered ?? (t.status === "In Progress" ? Math.round(target / 2) : 0);
      entry.stopsTarget += target;
      entry.stopsCovered += covered;
      if (t.status === "Completed") entry.completedTasks += 1;
      else if (t.status === "In Progress") entry.inProgressTasks += 1;
      else entry.pendingTasks += 1;
    });
    scopedCustomers.forEach((c) => {
      const normBeat = String(c.beatNo || "2").replace(/^Beat\s*/i, "").trim();
      if (beatMap.has(normBeat)) {
        const entry = beatMap.get(normBeat);
        entry.totalHouseholds += 1;
        if (c.verificationStatus === "Field Confirmed") {
          entry.verifiedHouseholds += 1;
        }
      }
    });
    return Array.from(beatMap.values()).map((b) => {
      const taskCompletionPct = b.totalTasks > 0 ? Math.round(b.completedTasks / b.totalTasks * 100) : 0;
      const inProgressPct = b.totalTasks > 0 ? Math.round(b.inProgressTasks / b.totalTasks * 100) : 0;
      const stopsCompletionPct = b.stopsTarget > 0 ? Math.min(100, Math.round(b.stopsCovered / b.stopsTarget * 100)) : 0;
      const householdCoveragePct = b.totalHouseholds > 0 ? Math.round(b.verifiedHouseholds / b.totalHouseholds * 100) : 100;
      const dailyCoveragePct = Math.round(taskCompletionPct * 0.6 + stopsCompletionPct * 0.4);
      return {
        ...b,
        taskCompletionPct,
        inProgressPct,
        stopsCompletionPct,
        householdCoveragePct,
        dailyCoveragePct
      };
    }).sort((a, b) => Number(a.beatNo) - Number(b.beatNo));
  }, [scopedTasks, scopedCustomers]);
  const filteredTasks = reactExports.useMemo(() => {
    return scopedTasks.filter((t) => {
      const normBeat = String(t.beatNo || "").replace(/^Beat\s*/i, "").trim();
      if (selectedBeatFilter !== "ALL" && normBeat !== selectedBeatFilter) return false;
      if (statusFilter !== "All" && t.status !== statusFilter) return false;
      if (categoryFilter !== "ALL" && t.category !== categoryFilter) return false;
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
  const handleStatusChange = (task, newStatus) => {
    customerService.updateTask(task.id, { status: newStatus });
    triggerLiveFeedback(`${task.id} marked as "${newStatus}" — Beat ${task.beatNo} coverage updated`);
  };
  const handleAdjustStops = (task, delta) => {
    const target = task.householdsTarget || 5;
    const currentCovered = task.status === "Completed" ? target : task.householdsCovered ?? (task.status === "In Progress" ? Math.round(target / 2) : 0);
    const nextCovered = Math.max(0, Math.min(target, currentCovered + delta));
    const nextPct = Math.round(nextCovered / target * 100);
    let nextStatus = task.status;
    if (nextCovered >= target) {
      nextStatus = "Completed";
    } else if (nextCovered > 0) {
      nextStatus = "In Progress";
    } else {
      nextStatus = "Pending";
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
  const handleCreateTask = (e) => {
    var _a;
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskLocation.trim()) return;
    let linkedCustomerId;
    let linkedCustomerMasterId;
    let linkedCustomerName;
    let linkedCustomerPhone;
    let linkedCustomerAddress;
    let linkedLeadId;
    let linkedLeadProduct;
    let linkedLeadStage;
    let linkType = linkTargetType;
    if (linkTargetType === "CUSTOMER" && selectedCustomerToLink) {
      linkedCustomerId = selectedCustomerToLink.id;
      linkedCustomerMasterId = selectedCustomerToLink.masterId || selectedCustomerToLink.id;
      linkedCustomerName = selectedCustomerToLink.name;
      linkedCustomerPhone = selectedCustomerToLink.mobile;
      linkedCustomerAddress = ((_a = selectedCustomerToLink.address) == null ? void 0 : _a.fullAddress) || `${selectedCustomerToLink.houseNo || ""}, ${selectedCustomerToLink.sector || ""}, ${selectedCustomerToLink.area || ""}`;
    } else if (linkTargetType === "LEAD" && selectedLeadToLink) {
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
      assignedTo: newTaskAssignee.trim() || "Beat Postman",
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
    setNewTaskTitle("");
    setNewTaskLocation("");
    setSelectedCustomerToLink(null);
    setSelectedLeadToLink(null);
    setLinkTargetType("NONE");
    setLinkSelectorSearch("");
    setShowNewTaskModal(false);
    triggerLiveFeedback(`Created ${created.id} for Beat ${created.beatNo}${linkedCustomerName ? ` (Linked to ${linkedCustomerName})` : ""}`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", id: "tasks-view-root", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-slate-900", children: "Field Operations & Daily Beat Coverage Tracker" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" }),
                "LIVE TRACKING"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: isSuperAdmin ? `Global Division View: Monitoring ${scopedTasks.length} field operations across ${beatCoverageStats.length} delivery beats` : `Beat-Restricted View (${(userProfile == null ? void 0 : userProfile.beat) || "Beat 2"}): Real-time doorstep task completion & beat coverage` })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2.5", children: [
          lastUpdatedToast && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-xs animate-fade-in", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { size: 13, className: "text-emerald-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: lastUpdatedToast })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setShowNewTaskModal(true),
              className: "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition shadow-xs cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add Field Task" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-end justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { size: 13, className: "text-red-700" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: selectedBeatFilter === "ALL" ? "Daily Division Beat Task Completion" : `Beat ${selectedBeatFilter} Daily Coverage Progress` })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-3 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-3xl font-extrabold text-slate-900", children: [
                overallMetrics.completionPct,
                "%"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200", children: [
                overallMetrics.completed,
                " of ",
                overallMetrics.total,
                " Tasks Completed"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium text-slate-500", children: [
                "• Field Progress Score: ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-slate-800", children: [
                  overallMetrics.weightedProgressPct,
                  "%"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-slate-700", children: [
                "Completed (",
                overallMetrics.completed,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-slate-700", children: [
                "In Progress (",
                overallMetrics.inProgress,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2.5 h-2.5 rounded-xs bg-slate-300 inline-block" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-slate-700", children: [
                "Pending (",
                overallMetrics.pending,
                ")"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex p-0.5 gap-0.5", children: [
            overallMetrics.completionPct > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "bg-emerald-600 h-full rounded-l-full transition-all duration-500 ease-out",
                style: {
                  width: `${overallMetrics.completionPct}%`,
                  borderTopRightRadius: overallMetrics.inProgressPct === 0 ? "9999px" : "2px",
                  borderBottomRightRadius: overallMetrics.inProgressPct === 0 ? "9999px" : "2px"
                },
                title: `Completed: ${overallMetrics.completionPct}%`
              }
            ),
            overallMetrics.inProgressPct > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "bg-amber-500 h-full transition-all duration-500 ease-out",
                style: {
                  width: `${overallMetrics.inProgressPct}%`,
                  borderTopLeftRadius: overallMetrics.completionPct === 0 ? "9999px" : "2px",
                  borderBottomLeftRadius: overallMetrics.completionPct === 0 ? "9999px" : "2px",
                  borderTopRightRadius: "9999px",
                  borderBottomRightRadius: "9999px"
                },
                title: `In Progress: ${overallMetrics.inProgressPct}%`
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-[11px] text-slate-500 font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Doorstep Stops Covered:",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-slate-800", children: [
                overallMetrics.totalStopsCovered,
                " / ",
                overallMetrics.totalStopsTarget,
                " Households (",
                overallMetrics.stopsCoveragePct,
                "%)"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: overallMetrics.highPriorityPending > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-700 font-semibold", children: [
              overallMetrics.highPriorityPending,
              " High-Priority Task",
              overallMetrics.highPriorityPending > 1 ? "s" : "",
              " Remaining"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-emerald-700 font-semibold", children: "All High-Priority Tasks Completed!" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-3 rounded-xl border border-slate-200/90 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold text-slate-500", children: "Completed Today" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-extrabold text-emerald-700 mt-0.5", children: [
                overallMetrics.completed,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-slate-400", children: [
                  "/ ",
                  overallMetrics.total
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs", children: [
              overallMetrics.completionPct,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-3 rounded-xl border border-slate-200/90 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold text-slate-500", children: "Active On-Beat" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-extrabold text-amber-600 mt-0.5", children: [
                overallMetrics.inProgress,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-slate-400", children: "Tasks" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs", children: [
              overallMetrics.inProgressPct,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-3 rounded-xl border border-slate-200/90 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold text-slate-500", children: "Pending Queue" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-extrabold text-slate-800 mt-0.5", children: [
                overallMetrics.pending,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-slate-400", children: "Tasks" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs", children: [
              overallMetrics.total > 0 ? Math.round(overallMetrics.pending / overallMetrics.total * 100) : 0,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-3 rounded-xl border border-slate-200/90 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold text-slate-500", children: "Doorstep Stops" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-extrabold text-blue-700 mt-0.5", children: [
                overallMetrics.totalStopsCovered,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-slate-400", children: [
                  "/ ",
                  overallMetrics.totalStopsTarget
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs", children: [
              overallMetrics.stopsCoveragePct,
              "%"
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold text-slate-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 16, className: "text-emerald-700" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Daily Beat Coverage & Completion Percentages" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Click any beat card to filter field tasks for that specific beat" })
        ] }),
        selectedBeatFilter !== "ALL" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setSelectedBeatFilter("ALL"),
            className: "text-xs font-bold text-red-700 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 self-start sm:self-auto cursor-pointer",
            children: "Show All Beats"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5", children: beatCoverageStats.map((beat) => {
        const isSelected = selectedBeatFilter === beat.beatNo;
        const barColor = beat.taskCompletionPct >= 75 ? "bg-emerald-600" : beat.taskCompletionPct >= 40 ? "bg-amber-500" : "bg-red-600";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            onClick: () => setSelectedBeatFilter((prev) => prev === beat.beatNo ? "ALL" : beat.beatNo),
            className: `p-4 rounded-xl border transition cursor-pointer ${isSelected ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-900"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-extrabold", children: [
                      "Beat ",
                      beat.beatNo
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "span",
                      {
                        className: `text-[10px] px-2 py-0.5 rounded-full font-bold ${isSelected ? "bg-white/15 text-white" : beat.taskCompletionPct === 100 ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`,
                        children: [
                          beat.completedTasks,
                          "/",
                          beat.totalTasks,
                          " Done"
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: `text-[11px] font-medium truncate mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-500"}`,
                      children: beat.staffName
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    {
                      className: `text-lg font-extrabold ${isSelected ? "text-emerald-400" : beat.taskCompletionPct >= 75 ? "text-emerald-700" : beat.taskCompletionPct >= 40 ? "text-amber-700" : "text-red-700"}`,
                      children: [
                        beat.taskCompletionPct,
                        "%"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: `text-[10px] font-semibold ${isSelected ? "text-slate-300" : "text-slate-400"}`,
                      children: "Task Completion"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `w-full h-2 rounded-full overflow-hidden flex mb-2.5 ${isSelected ? "bg-slate-700" : "bg-slate-200"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: `${barColor} h-full transition-all duration-500`,
                        style: { width: `${beat.taskCompletionPct}%` }
                      }
                    ),
                    beat.inProgressPct > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: "bg-amber-400 h-full transition-all duration-500",
                        style: { width: `${beat.inProgressPct}%` }
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `flex items-center justify-between text-[11px] pt-1 border-t ${isSelected ? "border-slate-700 text-slate-300" : "border-slate-200/80 text-slate-600"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      "Stops: ",
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                        beat.stopsCovered,
                        "/",
                        beat.stopsTarget
                      ] }),
                      " (",
                      beat.stopsCompletionPct,
                      "%)"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                      beat.inProgressTasks > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "span",
                        {
                          className: `px-1.5 py-0.5 rounded text-[10px] font-bold ${isSelected ? "bg-amber-500/20 text-amber-300" : "bg-amber-100 text-amber-800"}`,
                          children: [
                            beat.inProgressTasks,
                            " Active"
                          ]
                        }
                      ),
                      beat.pendingTasks > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "span",
                        {
                          className: `px-1.5 py-0.5 rounded text-[10px] font-bold ${isSelected ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-700"}`,
                          children: [
                            beat.pendingTasks,
                            " Queued"
                          ]
                        }
                      )
                    ] })
                  ]
                }
              )
            ]
          },
          beat.beatNo
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-1.5 text-xs font-semibold", children: [
        { id: "All", label: "All Tasks", count: overallMetrics.total },
        { id: "Pending", label: "Pending", count: overallMetrics.pending },
        { id: "In Progress", label: "In Progress", count: overallMetrics.inProgress },
        { id: "Completed", label: "Completed", count: overallMetrics.completed }
      ].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setStatusFilter(tab.id),
          className: `px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${statusFilter === tab.id ? "bg-slate-900 text-white shadow-xs" : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tab.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `px-1.5 py-0.2 rounded-full text-[10px] font-bold ${statusFilter === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`,
                children: tab.count
              }
            )
          ]
        },
        tab.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 sm:w-56", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Search,
            {
              size: 14,
              className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              placeholder: "Search task, beat, location...",
              className: "w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: categoryFilter,
            onChange: (e) => setCategoryFilter(e.target.value),
            className: "px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-slate-400",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Categories" }),
              TASK_CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: cat, children: cat }, cat))
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filteredTasks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 32, className: "mx-auto text-slate-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-slate-700", children: "No field tasks match your current filters" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Try switching status tabs or clearing the search filter." })
    ] }) : filteredTasks.map((t) => {
      const targetStops = t.householdsTarget || 5;
      const coveredStops = t.status === "Completed" ? targetStops : t.householdsCovered ?? (t.status === "In Progress" ? Math.round(targetStops / 2) : 0);
      const taskPct = t.status === "Completed" ? 100 : Math.min(100, Math.round(coveredStops / targetStops * 100));
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `bg-white rounded-2xl border p-4 shadow-xs transition ${t.status === "Completed" ? "border-emerald-200/80 bg-emerald-50/10" : t.status === "In Progress" ? "border-amber-300/80" : "border-slate-200"}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => handleStatusChange(
                    t,
                    t.status === "Completed" ? "Pending" : "Completed"
                  ),
                  className: `mt-1 w-5 h-5 rounded-lg border flex items-center justify-center transition shrink-0 cursor-pointer ${t.status === "Completed" ? "bg-emerald-600 border-emerald-600 text-white" : t.status === "In Progress" ? "bg-amber-50 border-amber-500 text-amber-600" : "border-slate-300 hover:border-red-600"}`,
                  title: "Toggle task completion",
                  children: [
                    t.status === "Completed" && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 13 }),
                    t.status === "In Progress" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-amber-500 animate-pulse" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold text-slate-500", children: t.id }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 bg-red-50 text-red-800 font-semibold rounded-md", children: t.category }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md", children: [
                    "Beat ",
                    String(t.beatNo).replace(/^Beat\s*/i, "")
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    {
                      className: `text-[11px] px-2 py-0.5 font-bold rounded-md ${t.priority === "High" ? "bg-red-100 text-red-700" : t.priority === "Medium" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`,
                      children: [
                        t.priority,
                        " Priority"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    {
                      className: `inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold ${t.status === "Completed" ? "bg-emerald-100 text-emerald-800" : t.status === "In Progress" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: `w-1.5 h-1.5 rounded-full ${t.status === "Completed" ? "bg-emerald-600" : t.status === "In Progress" ? "bg-amber-500 animate-pulse" : "bg-slate-400"}`
                          }
                        ),
                        t.status
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "h4",
                  {
                    className: `text-sm font-bold ${t.status === "Completed" ? "line-through text-slate-400" : "text-slate-900"}`,
                    children: t.title
                  }
                ),
                t.linkedCustomerName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-1 flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        const found = customers.find(
                          (c) => c.id === t.linkedCustomerId || c.masterId === t.linkedCustomerMasterId || c.name.toLowerCase() === (t.linkedCustomerName || "").toLowerCase()
                        );
                        if (found) {
                          setInspectCustomer(found);
                        } else {
                          setInspectCustomer({
                            id: t.linkedCustomerId || `CUST-${t.id}`,
                            masterId: t.linkedCustomerMasterId || `CUST-${t.id}`,
                            name: t.linkedCustomerName || "Linked Customer",
                            mobile: t.linkedCustomerPhone || "",
                            beatNo: String(t.beatNo).replace(/^Beat\s*/i, ""),
                            area: t.location || "Dadabari SO",
                            address: { fullAddress: t.linkedCustomerAddress || t.location },
                            verificationStatus: "Field Confirmed",
                            products: []
                          });
                        }
                      },
                      className: "inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-red-50 to-amber-50 hover:from-red-100 hover:to-amber-100 text-red-900 border border-red-200/90 rounded-lg text-xs font-bold transition shadow-2xs group cursor-pointer",
                      title: "Click to inspect full Master Customer Profile",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 12, className: "text-red-700" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "group-hover:underline", children: [
                          t.linkedCustomerName,
                          t.linkedCustomerMasterId ? ` (${t.linkedCustomerMasterId})` : ""
                        ] }),
                        t.linkedLeadProduct && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-mono", children: t.linkedLeadProduct }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 11, className: "text-red-500 opacity-70 group-hover:opacity-100" })
                      ]
                    }
                  ),
                  t.linkedCustomerPhone && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "a",
                    {
                      href: `https://wa.me/91${t.linkedCustomerPhone.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                        `नमस्ते ${t.linkedCustomerName} जी, भारतीय डाक (India Post - Beat ${String(t.beatNo).replace(/^Beat\s*/i, "")}) से आपके कार्य "${t.title}" के संदर्भ में संपर्क किया जा रहा है।`
                      )}`,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      className: "inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition",
                      title: `Send WhatsApp message to ${t.linkedCustomerPhone}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 11 }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "WhatsApp" })
                      ]
                    }
                  ),
                  t.linkedCustomerPhone && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "a",
                    {
                      href: `tel:${t.linkedCustomerPhone.replace(/\D/g, "")}`,
                      className: "inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold shadow-2xs transition",
                      title: `Direct call to ${t.linkedCustomerPhone}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 11, className: "text-emerald-400" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          "Call (",
                          t.linkedCustomerPhone.slice(-10),
                          ")"
                        ] })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 12, className: "text-red-600" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.location })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 12, className: "text-blue-600" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.assignedTo })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 12, className: "text-slate-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      "Due: ",
                      t.dueDate
                    ] })
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80 min-w-[200px] space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[11px]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-slate-600 flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(House, { size: 11, className: "text-slate-500" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Beat Stops:" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-extrabold text-slate-900", children: [
                    coveredStops,
                    "/",
                    targetStops,
                    " (",
                    taskPct,
                    "%)"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-slate-200 h-1.5 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `h-full transition-all duration-300 ${taskPct === 100 ? "bg-emerald-600" : taskPct > 0 ? "bg-amber-500" : "bg-slate-400"}`,
                    style: { width: `${taskPct}%` }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-400 font-medium", children: "Adjust visited stops" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => handleAdjustStops(t, -1),
                        disabled: coveredStops <= 0,
                        className: "w-5 h-5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 text-xs font-bold flex items-center justify-center cursor-pointer",
                        title: "Decrease visited stops",
                        children: "-"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => handleAdjustStops(t, 1),
                        disabled: coveredStops >= targetStops,
                        className: "w-5 h-5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 text-xs font-bold flex items-center justify-center cursor-pointer",
                        title: "Increase visited stops",
                        children: "+"
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-end sm:self-center", children: ["Pending", "In Progress", "Completed"].map((st) => {
                const active = t.status === st;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleStatusChange(t, st),
                    className: `px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${active ? st === "Completed" ? "bg-emerald-600 text-white shadow-2xs" : st === "In Progress" ? "bg-amber-500 text-white shadow-2xs" : "bg-slate-800 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"}`,
                    children: st
                  },
                  st
                );
              }) })
            ] })
          ] })
        },
        t.id
      );
    }) }),
    showNewTaskModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-slate-100 pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-slate-900", children: "Assign New Field Operation Task" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Task will immediately sync with live beat coverage tracking" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setShowNewTaskModal(false),
            className: "p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateTask, className: "space-y-3.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Task Description *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              required: true,
              value: newTaskTitle,
              onChange: (e) => setNewTaskTitle(e.target.value),
              placeholder: "e.g., Collect SSA KYC documents at Keshavpura Sector 6",
              className: "w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Operation Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: newTaskCategory,
                onChange: (e) => setNewTaskCategory(e.target.value),
                className: "w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white",
                children: TASK_CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: cat, children: cat }, cat))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Beat Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: newTaskBeat,
                onChange: (e) => setNewTaskBeat(e.target.value),
                disabled: !isSuperAdmin && !!(userProfile == null ? void 0 : userProfile.beat),
                className: "w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white disabled:bg-slate-100",
                children: ["1", "2", "3", "4", "5", "6"].map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: b, children: [
                  "Beat ",
                  b
                ] }, b))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-bold text-slate-800 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { size: 13, className: "text-red-700" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Link Customer Profile or Lead Schema" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-500 font-semibold", children: "(Optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setLinkTargetType("NONE");
                  setSelectedCustomerToLink(null);
                  setSelectedLeadToLink(null);
                },
                className: `px-2.5 py-1 rounded-lg transition ${linkTargetType === "NONE" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"}`,
                children: "No Link"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setLinkTargetType("CUSTOMER");
                  setSelectedLeadToLink(null);
                },
                className: `px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${linkTargetType === "CUSTOMER" ? "bg-red-700 text-white" : "bg-white text-slate-600 border border-slate-200"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 12 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Customer Profile" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setLinkTargetType("LEAD");
                  setSelectedCustomerToLink(null);
                },
                className: `px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${linkTargetType === "LEAD" ? "bg-blue-700 text-white" : "bg-white text-slate-600 border border-slate-200"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { size: 12 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Lead Schema" })
                ]
              }
            )
          ] }),
          linkTargetType === "CUSTOMER" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-1 border-t border-slate-200/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 12, className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: linkSelectorSearch,
                  onChange: (e) => setLinkSelectorSearch(e.target.value),
                  placeholder: "Search customer by name, mobile, or ID...",
                  className: "w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                }
              )
            ] }),
            selectedCustomerToLink ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-emerald-950 flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 13, className: "text-emerald-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: selectedCustomerToLink.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-mono text-emerald-700", children: [
                    "(",
                    selectedCustomerToLink.masterId || selectedCustomerToLink.id,
                    ")"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-emerald-800 font-mono mt-0.5", children: [
                  "📱 ",
                  selectedCustomerToLink.mobile,
                  " • Beat ",
                  selectedCustomerToLink.beatNo || "2"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setSelectedCustomerToLink(null),
                  className: "text-slate-400 hover:text-slate-700 p-1",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 13 })
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-36 overflow-y-auto space-y-1 border border-slate-200 rounded-lg p-1 bg-white", children: customers.filter((c) => {
              if (!linkSelectorSearch.trim()) return true;
              const q = linkSelectorSearch.toLowerCase();
              return (c.name || "").toLowerCase().includes(q) || (c.mobile || "").includes(q) || (c.masterId || c.id || "").toLowerCase().includes(q);
            }).slice(0, 6).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                onClick: () => {
                  var _a;
                  setSelectedCustomerToLink(c);
                  if (!newTaskLocation) {
                    setNewTaskLocation(((_a = c.address) == null ? void 0 : _a.fullAddress) || c.area || `Sector ${c.sector || "7"}, Keshavpura`);
                  }
                  if (!newTaskTitle) {
                    setNewTaskTitle(`Doorstep follow-up for ${c.name}`);
                  }
                },
                className: "p-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs flex items-center justify-between",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-800", children: c.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-slate-500 font-mono ml-2", children: [
                      c.mobile,
                      " • ",
                      c.masterId || c.id
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-red-600 font-bold", children: "Select" })
                ]
              },
              c.id
            )) })
          ] }),
          linkTargetType === "LEAD" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-1 border-t border-slate-200/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 12, className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: linkSelectorSearch,
                  onChange: (e) => setLinkSelectorSearch(e.target.value),
                  placeholder: "Search lead by customer, scheme, mobile...",
                  className: "w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                }
              )
            ] }),
            selectedLeadToLink ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-blue-950 flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 13, className: "text-blue-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: selectedLeadToLink.customerName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-mono text-blue-700", children: [
                    "(",
                    selectedLeadToLink.id,
                    ")"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-blue-800 mt-0.5", children: [
                  "Scheme: ",
                  selectedLeadToLink.productName,
                  " • Stage: ",
                  selectedLeadToLink.stage
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setSelectedLeadToLink(null),
                  className: "text-slate-400 hover:text-slate-700 p-1",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 13 })
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-36 overflow-y-auto space-y-1 border border-slate-200 rounded-lg p-1 bg-white", children: leads.filter((l) => {
              if (!linkSelectorSearch.trim()) return true;
              const q = linkSelectorSearch.toLowerCase();
              return (l.customerName || "").toLowerCase().includes(q) || (l.customerMobile || "").includes(q) || (l.productName || "").toLowerCase().includes(q) || (l.id || "").toLowerCase().includes(q);
            }).slice(0, 6).map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                onClick: () => {
                  setSelectedLeadToLink(l);
                  if (!newTaskLocation) {
                    setNewTaskLocation(l.customerAddress || "Keshavpura Delivery Beat");
                  }
                  if (!newTaskTitle) {
                    setNewTaskTitle(`Doorstep lead visit: ${l.productName} for ${l.customerName}`);
                  }
                },
                className: "p-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs flex items-center justify-between",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-800", children: l.customerName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-slate-500 ml-2", children: [
                      l.productName,
                      " • ",
                      l.stage
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-blue-600 font-bold", children: "Select" })
                ]
              },
              l.id
            )) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Location / Colony *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                required: true,
                value: newTaskLocation,
                onChange: (e) => setNewTaskLocation(e.target.value),
                placeholder: "e.g., KH 110, Sector 6",
                className: "w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Target Household Stops" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: 1,
                max: 100,
                value: newTaskTargetStops,
                onChange: (e) => setNewTaskTargetStops(Number(e.target.value)),
                className: "w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Priority" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: newTaskPriority,
                onChange: (e) => setNewTaskPriority(e.target.value),
                className: "w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "High", children: "High" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Medium", children: "Medium" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Low", children: "Low" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Due Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                value: newTaskDueDate,
                onChange: (e) => setNewTaskDueDate(e.target.value),
                className: "w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Assigned Delivery Staff" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: newTaskAssignee,
              onChange: (e) => setNewTaskAssignee(e.target.value),
              className: "w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2 pt-2 border-t border-slate-100", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowNewTaskModal(false),
              className: "px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "px-4 py-2 rounded-xl text-xs font-bold bg-red-700 hover:bg-red-800 text-white cursor-pointer",
              children: "Save & Track Task"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
export {
  TasksView as default
};
