import { u as useAuth, a9 as useLocation, s as staffPermissionService, r as reactExports, b as customerService, j as jsxRuntimeExports, C as CircleCheck, X, ai as Clock, P as Plus, n as Phone, k as Calendar, l as CustomerProfileModal } from "./index-u5ATSoh6.js";
function FollowUpsView() {
  const { userProfile } = useAuth();
  const location = useLocation();
  const isSuperAdmin = staffPermissionService.isSuperAdmin(userProfile);
  const [followUps, setFollowUps] = reactExports.useState([]);
  const [filter, setFilter] = reactExports.useState("All");
  const [actionTypeFilter, setActionTypeFilter] = reactExports.useState("ALL");
  const [beatFilter, setBeatFilter] = reactExports.useState("ALL");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [showAddModal, setShowAddModal] = reactExports.useState(false);
  const [selectedFollowUpForOutcome, setSelectedFollowUpForOutcome] = reactExports.useState(null);
  const [selectedFollowUpForEdit, setSelectedFollowUpForEdit] = reactExports.useState(null);
  const [outcomeText, setOutcomeText] = reactExports.useState("");
  const [selectedCustomer, setSelectedCustomer] = reactExports.useState(null);
  const [feedbackBanner, setFeedbackBanner] = reactExports.useState(null);
  const [formCustName, setFormCustName] = reactExports.useState("");
  const [formCustMobile, setFormCustMobile] = reactExports.useState("");
  const [formDate, setFormDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [formAction, setFormAction] = reactExports.useState("Doorstep Scheme Discussion");
  const [formStaff, setFormStaff] = reactExports.useState("Shri Rajesh Sharma (Beat 2 Postman)");
  const [formRemarks, setFormRemarks] = reactExports.useState("");
  const showToast = (msg) => {
    setFeedbackBanner(msg);
    setTimeout(() => {
      setFeedbackBanner((prev) => prev === msg ? null : prev);
    }, 3500);
  };
  reactExports.useEffect(() => {
    setFollowUps(customerService.getFollowUps());
    const unsub = customerService.subscribe(() => {
      setFollowUps([...customerService.getFollowUps()]);
    });
    return () => unsub();
  }, []);
  reactExports.useEffect(() => {
    var _a;
    const prefillCustomer = ((_a = location.state) == null ? void 0 : _a.initialCustomer) || null;
    if (prefillCustomer) {
      setFormCustName(prefillCustomer.name || "");
      setFormCustMobile(prefillCustomer.mobile || "");
      setShowAddModal(true);
    }
  }, [location.state]);
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const filteredFollowUps = followUps.filter((f) => {
    if (!staffPermissionService.matchesUserBeatScope(userProfile, f)) {
      return false;
    }
    if (beatFilter !== "ALL") {
      const b = String(f.beatNo || "2").replace(/^Beat\s*/i, "").trim();
      if (b !== beatFilter) return false;
    }
    if (actionTypeFilter !== "ALL") {
      const act = `${f.nextAction || ""} ${f.remarks || ""}`.toUpperCase();
      if (actionTypeFilter === "SCHEME_QUERY" && !act.includes("SCHEME") && !act.includes("PPF") && !act.includes("SSY") && !act.includes("PLI") && !act.includes("RD") && !act.includes("NSC") && !act.includes("SAVING")) {
        return false;
      }
      if (actionTypeFilter === "SERVICE_VISIT" && !act.includes("DOORSTEP") && !act.includes("AADHAAR") && !act.includes("CELC") && !act.includes("VISIT") && !act.includes("DELIVERY") && !act.includes("IPPB")) {
        return false;
      }
      if (actionTypeFilter === "KYC_DOC" && !act.includes("KYC") && !act.includes("DOCUMENT") && !act.includes("FORM") && !act.includes("PAN") && !act.includes("RENEWAL")) {
        return false;
      }
    }
    const matchesSearch = f.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || f.customerMobile.includes(searchQuery) || f.nextAction.toLowerCase().includes(searchQuery.toLowerCase()) || f.assignedStaffName.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = true;
    if (filter === "Completed") matchesFilter = f.currentStatus === "Completed";
    else if (filter === "Today") matchesFilter = f.scheduledDate === todayStr && f.currentStatus !== "Completed";
    else if (filter === "Overdue") matchesFilter = f.scheduledDate < todayStr && f.currentStatus !== "Completed";
    else if (filter === "Upcoming") matchesFilter = f.scheduledDate > todayStr && f.currentStatus !== "Completed";
    return matchesSearch && matchesFilter;
  });
  const handleCreateFollowUp = (e) => {
    e.preventDefault();
    if (!formCustName || !formCustMobile) {
      showToast("Please fill customer name and mobile number.");
      return;
    }
    const activeBeatNo = ((userProfile == null ? void 0 : userProfile.beat) || "Beat 2").replace(/^Beat\s*/i, "").trim() || "2";
    customerService.scheduleFollowUp({
      customerName: formCustName,
      customerMobile: formCustMobile,
      scheduledDate: formDate,
      scheduledTime: "11:00 AM",
      nextAction: formAction,
      assignedStaffName: userProfile ? `${userProfile.name} (${userProfile.beat})` : formStaff,
      assignedStaffEmail: userProfile == null ? void 0 : userProfile.email,
      beatNo: activeBeatNo,
      remarks: formRemarks,
      currentStatus: "Pending"
    });
    setShowAddModal(false);
    setFormCustName("");
    setFormCustMobile("");
    setFormRemarks("");
    showToast(`Scheduled follow-up for ${formCustName} on ${formDate}.`);
  };
  const handleLogOutcome = (e) => {
    e.preventDefault();
    if (!selectedFollowUpForOutcome || !outcomeText) return;
    customerService.completeFollowUp(selectedFollowUpForOutcome.id, outcomeText);
    showToast(`Completed follow-up ${selectedFollowUpForOutcome.id} for ${selectedFollowUpForOutcome.customerName}.`);
    setSelectedFollowUpForOutcome(null);
    setOutcomeText("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", id: "followups-view-root", children: [
    feedbackBanner && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16, className: "text-emerald-700" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: feedbackBanner })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFeedbackBanner(null), className: "text-slate-500 hover:text-slate-800", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-slate-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 22, className: "text-red-700" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Customer Follow-Up Scheduler & Action Log" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: isSuperAdmin ? `Global Admin View: Doorstep visits and callback schedules across all Beats (${filteredFollowUps.length} Records)` : `Beat-Restricted View (${(userProfile == null ? void 0 : userProfile.beat) || "Beat 2"}): Showing only follow-ups assigned to your Beat (${filteredFollowUps.length} Records)` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            placeholder: "Search entries...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "px-3 py-2 border border-slate-300 rounded-xl text-xs"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowAddModal(true),
            className: "px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs",
            id: "schedule-followup-btn",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Schedule Follow-up" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold", children: ["All", "Today", "Overdue", "Upcoming", "Completed"].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setFilter(tab),
          className: `px-4 py-2 rounded-xl transition ${filter === tab ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"}`,
          children: tab
        },
        tab
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs", children: [
        [
          { id: "ALL", label: "All Actions" },
          { id: "SCHEME_QUERY", label: "Product / Scheme Queries" },
          { id: "SERVICE_VISIT", label: "Doorstep Service Visits" },
          { id: "KYC_DOC", label: "KYC & Document Collection" }
        ].map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setActionTypeFilter(cat.id),
            className: `px-3 py-1.5 rounded-xl font-bold transition ${actionTypeFilter === cat.id ? "bg-red-700 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`,
            children: cat.label
          },
          cat.id
        )),
        isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: beatFilter,
            onChange: (e) => setBeatFilter(e.target.value),
            className: "px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Beats" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "1", children: "Beat 1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "2", children: "Beat 2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "3", children: "Beat 3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "4", children: "Beat 4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "5", children: "Beat 5" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
      filteredFollowUps.map((fol) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-xs transition p-5 flex flex-col justify-between",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold text-slate-500", children: fol.id }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2.5 py-0.5 rounded-full text-xs font-bold ${fol.currentStatus === "Completed" ? "bg-emerald-100 text-emerald-800" : fol.scheduledDate < todayStr ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`, children: fol.currentStatus === "Completed" ? "Completed" : fol.scheduledDate < todayStr ? "Overdue" : fol.currentStatus })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-base", children: fol.customerName }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 12, className: "text-emerald-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fol.customerMobile })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 font-semibold text-slate-900", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 13, className: "text-red-700" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Scheduled: ",
                    fol.scheduledDate,
                    " ",
                    fol.scheduledTime ? `(${fol.scheduledTime})` : ""
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-800 font-medium", children: [
                  "Action: ",
                  fol.nextAction
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-500 text-[11px]", children: [
                  "Assigned to: ",
                  fol.assignedStaffName || "Beat 2 Postman"
                ] }),
                fol.remarks && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-600 italic", children: [
                  '"',
                  fol.remarks,
                  '"'
                ] })
              ] }),
              fol.outcome && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 13 }),
                  " Completed Outcome"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: fol.outcome })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-3 border-t border-slate-100 flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    const cust = (fol.customerId ? customerService.getCustomerById(fol.customerId) : void 0) || customerService.getCustomerByMobile(fol.customerMobile) || customerService.getCustomers().find((c) => c.name.toLowerCase() === fol.customerName.toLowerCase());
                    if (cust) {
                      setSelectedCustomer(cust);
                    } else {
                      setSelectedCustomer({
                        id: fol.customerId || `CUST-${fol.id}`,
                        masterId: fol.customerId || `CUST-${fol.id}`,
                        name: fol.customerName,
                        mobile: fol.customerMobile,
                        beatNo: fol.beatNo || "2",
                        sector: "Dadabari",
                        area: "Dadabari SO",
                        verificationStatus: "Pending Verification",
                        products: [],
                        createdAt: (/* @__PURE__ */ new Date()).toISOString()
                      });
                    }
                  },
                  className: "font-medium text-slate-600 hover:text-slate-900 cursor-pointer",
                  children: "View Profile"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => {
                      setFormDate(fol.scheduledDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
                      setFormAction(fol.nextAction || "Doorstep Scheme Discussion");
                      setFormStaff(fol.assignedStaffName || "Shri Rajesh Sharma (Beat 2 Postman)");
                      setFormRemarks(fol.remarks || "");
                      setSelectedFollowUpForEdit(fol);
                    },
                    className: "font-medium text-slate-600 hover:text-red-700 cursor-pointer",
                    children: "Edit"
                  }
                ),
                fol.currentStatus !== "Completed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => {
                      setSelectedFollowUpForOutcome(fol);
                      setOutcomeText("");
                    },
                    className: "px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 13 }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Log Outcome" })
                    ]
                  }
                )
              ] })
            ] })
          ]
        },
        fol.id
      )),
      filteredFollowUps.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-xs", children: "No follow-ups found in this category." })
    ] }),
    selectedFollowUpForOutcome && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pb-3 border-b border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-base", children: "Complete Follow-up & Log Outcome" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedFollowUpForOutcome(null), children: "✕" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleLogOutcome, className: "space-y-4 mt-4 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500", children: "Customer:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900 text-sm", children: selectedFollowUpForOutcome.customerName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Detailed Visit / Call Outcome *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              rows: 3,
              required: true,
              value: outcomeText,
              onChange: (e) => setOutcomeText(e.target.value),
              placeholder: "e.g. Visited customer home. Collected Aadhaar copy and 2 passport photos for Sukanya Samriddhi account opening.",
              className: "w-full p-2.5 border border-slate-300 rounded-xl"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setSelectedFollowUpForOutcome(null),
              className: "px-4 py-2 bg-slate-100 rounded-xl font-semibold",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "px-4 py-2 bg-emerald-700 text-white rounded-xl font-semibold",
              children: "Mark Completed"
            }
          )
        ] })
      ] })
    ] }) }),
    selectedFollowUpForEdit && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pb-3 border-b border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-lg", children: "Edit Follow-up" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedFollowUpForEdit(null), children: "✕" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "form",
        {
          onSubmit: (e) => {
            e.preventDefault();
            customerService.updateFollowUp(selectedFollowUpForEdit.id, {
              scheduledDate: formDate,
              nextAction: formAction,
              assignedStaffName: formStaff,
              remarks: formRemarks,
              currentStatus: selectedFollowUpForEdit.currentStatus
            });
            setSelectedFollowUpForEdit(null);
          },
          className: "space-y-4 mt-4 text-xs",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Scheduled Date *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "date",
                    required: true,
                    value: formDate,
                    onChange: (e) => setFormDate(e.target.value),
                    className: "w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Action Type" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    value: formAction,
                    onChange: (e) => setFormAction(e.target.value),
                    className: "w-full p-2.5 border border-slate-300 rounded-xl bg-white",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Doorstep Scheme Discussion", children: "Doorstep Scheme Discussion" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Document & KYC Collection", children: "Document & KYC Collection" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PLI Premium Follow-up", children: "PLI Premium Follow-up" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Aadhaar Biometric Doorstep", children: "Aadhaar Biometric Doorstep" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Phone Consultation", children: "Phone Consultation" })
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Assigned Postal Staff" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: formStaff,
                  onChange: (e) => setFormStaff(e.target.value),
                  className: "w-full p-2.5 border border-slate-300 rounded-xl bg-white",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Shri Rajesh Sharma (Beat 2 Postman)", children: "Shri Rajesh Sharma (Beat 2 Postman)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Shri Dinesh Verma (Beat 6 Postman)", children: "Shri Dinesh Verma (Beat 6 Postman)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Dadabari SO Savings Counter", children: "Dadabari SO Savings Counter" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Notes / Instructions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  rows: 2,
                  value: formRemarks,
                  onChange: (e) => setFormRemarks(e.target.value),
                  className: "w-full p-2.5 border border-slate-300 rounded-xl"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t border-slate-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setSelectedFollowUpForEdit(null),
                  className: "px-4 py-2 bg-slate-100 rounded-xl font-semibold",
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "submit",
                  className: "px-4 py-2 bg-red-700 text-white rounded-xl font-semibold",
                  children: "Update Follow-up"
                }
              )
            ] })
          ]
        }
      )
    ] }) }),
    selectedCustomer && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CustomerProfileModal,
      {
        customer: selectedCustomer,
        onClose: () => setSelectedCustomer(null)
      }
    ),
    showAddModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pb-3 border-b border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-lg", children: "Schedule Doorstep Follow-Up" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowAddModal(false), className: "text-slate-400 hover:text-slate-700", children: "✕" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateFollowUp, className: "space-y-4 mt-4 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Customer Full Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                required: true,
                value: formCustName,
                onChange: (e) => setFormCustName(e.target.value),
                placeholder: "e.g. Rajesh Kumar",
                className: "w-full p-2.5 border border-slate-300 rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Mobile Number *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "tel",
                required: true,
                value: formCustMobile,
                onChange: (e) => setFormCustMobile(e.target.value),
                placeholder: "e.g. 9829012345",
                className: "w-full p-2.5 border border-slate-300 rounded-xl"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Scheduled Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                required: true,
                value: formDate,
                onChange: (e) => setFormDate(e.target.value),
                className: "w-full p-2.5 border border-slate-300 rounded-xl bg-white"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Action Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: formAction,
                onChange: (e) => setFormAction(e.target.value),
                className: "w-full p-2.5 border border-slate-300 rounded-xl bg-white",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Doorstep Scheme Discussion", children: "Doorstep Scheme Discussion" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Document & KYC Collection", children: "Document & KYC Collection" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PLI Premium Follow-up", children: "PLI Premium Follow-up" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Aadhaar Biometric Doorstep", children: "Aadhaar Biometric Doorstep" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Phone Consultation", children: "Phone Consultation" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Assigned Postal Staff" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: formStaff,
              onChange: (e) => setFormStaff(e.target.value),
              className: "w-full p-2.5 border border-slate-300 rounded-xl bg-white",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Shri Rajesh Sharma (Beat 2 Postman)", children: "Shri Rajesh Sharma (Beat 2 Postman)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Shri Dinesh Verma (Beat 6 Postman)", children: "Shri Dinesh Verma (Beat 6 Postman)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Dadabari SO Savings Counter", children: "Dadabari SO Savings Counter" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Notes / Doorstep Instructions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              rows: 2,
              value: formRemarks,
              onChange: (e) => setFormRemarks(e.target.value),
              placeholder: "e.g. Visit after 4 PM, bring SSA opening form and KYC checklist.",
              className: "w-full p-2.5 border border-slate-300 rounded-xl"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowAddModal(false),
              className: "px-4 py-2 bg-slate-100 rounded-xl font-semibold",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-semibold",
              children: "Schedule Follow-Up"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
export {
  FollowUpsView as default
};
