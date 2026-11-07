import { u as useAuth, ab as useLocation, s as staffPermissionService, r as reactExports, ac as POSTAL_PRODUCTS, b as customerService, j as jsxRuntimeExports, C as CircleCheck, X, k as Target, P as Plus, p as Phone, M as MessageSquare, q as ChevronRight, n as CustomerProfileModal, o as DirectMessageModal } from "./index-BWTx-a8O.js";
function LeadsPipelineView({ initialCustomer }) {
  const { userProfile } = useAuth();
  const location = useLocation();
  const isSuperAdmin = staffPermissionService.isSuperAdmin(userProfile);
  const [leads, setLeads] = reactExports.useState([]);
  const [viewMode, setViewMode] = reactExports.useState("kanban");
  const [categoryFilter, setCategoryFilter] = reactExports.useState("ALL");
  const [beatFilter, setBeatFilter] = reactExports.useState("ALL");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [showAddLeadModal, setShowAddLeadModal] = reactExports.useState(false);
  const [selectedLead, setSelectedLead] = reactExports.useState(null);
  const [selectedCustomer, setSelectedCustomer] = reactExports.useState(null);
  const [showLinkModal, setShowLinkModal] = reactExports.useState(false);
  const [leadToLink, setLeadToLink] = reactExports.useState(null);
  const [messageLead, setMessageLead] = reactExports.useState(null);
  const [showMessageModal, setShowMessageModal] = reactExports.useState(false);
  const [feedbackBanner, setFeedbackBanner] = reactExports.useState(null);
  const [leadCustomerId, setLeadCustomerId] = reactExports.useState("CUST-TEMP");
  const [leadCustomerName, setLeadCustomerName] = reactExports.useState("");
  const [leadCustomerMobile, setLeadCustomerMobile] = reactExports.useState("");
  const [leadProductCode, setLeadProductCode] = reactExports.useState(POSTAL_PRODUCTS[0].code);
  const [leadRequirement, setLeadRequirement] = reactExports.useState("");
  const [leadPriority, setLeadPriority] = reactExports.useState("High");
  const [leadEstimatedValue, setLeadEstimatedValue] = reactExports.useState("");
  const [leadAssignedStaff, setLeadAssignedStaff] = reactExports.useState("Shri Rajesh Sharma (Beat 2 Postman)");
  const showToast = (msg) => {
    setFeedbackBanner(msg);
    setTimeout(() => {
      setFeedbackBanner((prev) => prev === msg ? null : prev);
    }, 3500);
  };
  reactExports.useEffect(() => {
    setLeads(customerService.getLeads());
    const unsub = customerService.subscribe(() => {
      setLeads([...customerService.getLeads()]);
    });
    return () => unsub();
  }, []);
  reactExports.useEffect(() => {
    var _a;
    const prefillCustomer = initialCustomer || ((_a = location.state) == null ? void 0 : _a.initialCustomer) || null;
    if (prefillCustomer) {
      setLeadCustomerId(prefillCustomer.id || prefillCustomer.masterId || "CUST-TEMP");
      setLeadCustomerName(prefillCustomer.name || "");
      setLeadCustomerMobile(prefillCustomer.mobile || "");
      setShowAddLeadModal(true);
    }
  }, [initialCustomer, location.state]);
  const stages = [
    "New",
    "Contacted",
    "Interested",
    "Follow-up Scheduled",
    "Documentation Pending",
    "Under Processing",
    "Converted - Product Opened",
    "Closed - Not Interested"
  ];
  const handleCreateLead = (e) => {
    e.preventDefault();
    if (!leadCustomerName || !leadCustomerMobile) {
      showToast("Please fill customer name and mobile number.");
      return;
    }
    const prod = POSTAL_PRODUCTS.find((p) => p.code === leadProductCode);
    const activeBeatNo = ((userProfile == null ? void 0 : userProfile.beat) || "Beat 2").replace(/^Beat\s*/i, "").trim() || "2";
    customerService.createLead({
      customerId: leadCustomerId || "CUST-TEMP",
      customerName: leadCustomerName,
      customerMobile: leadCustomerMobile,
      productCode: leadProductCode,
      productName: (prod == null ? void 0 : prod.name) || leadProductCode,
      requirement: leadRequirement || `Interested in ${prod == null ? void 0 : prod.name}`,
      source: "Direct Lead Inquiry",
      leadScore: 80,
      priority: leadPriority,
      estimatedValue: leadEstimatedValue ? parseFloat(leadEstimatedValue) : void 0,
      assignedStaffName: userProfile ? `${userProfile.name} (${userProfile.beat})` : leadAssignedStaff,
      assignedStaffId: (userProfile == null ? void 0 : userProfile.id) || "STAFF-BEAT-02",
      assignedStaffEmail: userProfile == null ? void 0 : userProfile.email,
      beatNo: activeBeatNo,
      stage: "New"
    });
    setShowAddLeadModal(false);
    setLeadCustomerId("CUST-TEMP");
    setLeadCustomerName("");
    setLeadCustomerMobile("");
    setLeadRequirement("");
    setLeadEstimatedValue("");
    showToast(`Created new ${(prod == null ? void 0 : prod.name) || leadProductCode} lead for ${leadCustomerName}.`);
  };
  const handleAdvanceStage = (leadId, currentStage) => {
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex >= 0 && currentIndex < stages.length - 2) {
      const nextStage = stages[currentIndex + 1];
      customerService.updateLeadStage(leadId, nextStage);
      showToast(`Lead ${leadId} advanced to "${nextStage}".`);
    } else if (currentIndex === stages.length - 3) {
      customerService.convertLeadToProduct(leadId);
      showToast(`Lead ${leadId} converted to opened product!`);
    }
  };
  const handleLinkToHousehold = (householdId) => {
    if (leadToLink) {
      customerService.updateLead(leadToLink.id, { householdId });
      showToast(`Linked lead ${leadToLink.id} to household ${householdId}.`);
      setShowLinkModal(false);
      setLeadToLink(null);
    }
  };
  const handleConvertToProduct = (lead) => {
    const success = customerService.convertLeadToProduct(lead.id);
    if (success) {
      showToast(`Lead ${lead.id} (${lead.customerName}) converted! Product account attached to customer profile.`);
    }
  };
  const handleOpenLeadCustomerProfile = (lead) => {
    const existing = customerService.getCustomerById(lead.customerId) || customerService.getCustomerByMobile(lead.customerMobile);
    if (existing) {
      setSelectedCustomer(existing);
    } else {
      setSelectedCustomer({
        id: lead.customerId || `CUST-${lead.id}`,
        masterId: lead.customerId || `CUST-${lead.id}`,
        name: lead.customerName,
        mobile: lead.customerMobile,
        beatNo: lead.beatNo || "2",
        sector: "Dadabari",
        area: "Dadabari SO",
        verificationStatus: "Pending Verification",
        products: [],
        createdAt: lead.createdAt || (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  };
  const visibleLeads = leads.filter((l) => {
    if (!staffPermissionService.matchesUserBeatScope(userProfile, l)) return false;
    if (beatFilter !== "ALL") {
      const b = String(l.beatNo || "2").replace(/^Beat\s*/i, "").trim();
      if (b !== beatFilter) return false;
    }
    if (categoryFilter !== "ALL") {
      const code = (l.productCode || "").toUpperCase();
      const name = (l.productName || "").toUpperCase();
      const req = (l.requirement || "").toUpperCase();
      if (categoryFilter === "SMALL_SAVINGS") {
        if (!["PPF", "SSY", "SSA", "NSC", "KVP", "MIS", "SCSS", "RD", "TD", "SB", "MSSC"].some((k) => code.includes(k) || name.includes(k))) return false;
      } else if (categoryFilter === "IPPB") {
        if (!code.includes("IPPB") && !name.includes("IPPB") && !req.includes("AEPS") && !req.includes("DOORSTEP")) return false;
      } else if (categoryFilter === "INSURANCE") {
        if (!code.includes("PLI") && !code.includes("RPLI") && !name.includes("INSURANCE") && !name.includes("BIMA")) return false;
      } else if (categoryFilter === "SERVICE_REQ") {
        if (!code.includes("AADHAAR") && !code.includes("DLC") && !code.includes("SPEED") && !req.includes("AADHAAR") && !req.includes("CELC") && !req.includes("PICKUP") && !req.includes("SERVICE")) return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = (l.customerName || "").toLowerCase().includes(q) || (l.customerMobile || "").includes(q) || (l.productName || "").toLowerCase().includes(q) || (l.requirement || "").toLowerCase().includes(q) || (l.id || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", id: "leads-pipeline-view-root", children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { size: 22, className: "text-red-700" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Sales & Scheme Inquiries Pipeline" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: isSuperAdmin ? `Global Admin View: Full 9-stage Postal Product Pipeline across all Beats (${visibleLeads.length} Leads)` : `Beat-Restricted View (${(userProfile == null ? void 0 : userProfile.beat) || "Beat 2"}): Showing only leads assigned to your Beat (${visibleLeads.length} Leads)` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-100 p-1 rounded-xl flex text-xs font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setViewMode("kanban"),
              className: `px-3 py-1.5 rounded-lg transition ${viewMode === "kanban" ? "bg-white shadow-xs text-slate-900" : "text-slate-600"}`,
              children: "Kanban Board"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setViewMode("table"),
              className: `px-3 py-1.5 rounded-lg transition ${viewMode === "table" ? "bg-white shadow-xs text-slate-900" : "text-slate-600"}`,
              children: "Table View"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowAddLeadModal(true),
            className: "px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs",
            id: "add-lead-btn",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "New Lead" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-1.5", children: [
        { id: "ALL", label: "All Inquiries" },
        { id: "SMALL_SAVINGS", label: "Small Savings (PPF/SSY/NSC/MIS)" },
        { id: "IPPB", label: "IPPB & Doorstep Banking" },
        { id: "INSURANCE", label: "PLI / RPLI Insurance" },
        { id: "SERVICE_REQ", label: "Service Requests (Aadhaar/Mail)" }
      ].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setCategoryFilter(tab.id),
          className: `px-3 py-1.5 rounded-xl text-xs font-bold transition ${categoryFilter === tab.id ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`,
          children: tab.label
        },
        tab.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: beatFilter,
            onChange: (e) => setBeatFilter(e.target.value),
            className: "px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Beats" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "1", children: "Beat 1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "2", children: "Beat 2" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "3", children: "Beat 3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "4", children: "Beat 4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "5", children: "Beat 5" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            placeholder: "Search customer, scheme, mobile...",
            className: "px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 w-48 sm:w-56"
          }
        )
      ] })
    ] }),
    viewMode === "kanban" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 overflow-x-auto pb-4 items-start min-h-[600px]", children: stages.map((stage) => {
      const stageLeads = visibleLeads.filter((l) => l.stage === stage);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "w-72 shrink-0 bg-slate-100/90 rounded-2xl p-3 border border-slate-200/80 flex flex-col max-h-[750px]",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-2 mb-2 border-b border-slate-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-xs text-slate-800 tracking-tight", children: stage }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 bg-white text-slate-700 rounded-full text-[11px] font-bold shadow-xs", children: (stageLeads == null ? void 0 : stageLeads.length) || 0 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 overflow-y-auto flex-1 pr-1", children: [
              stageLeads.map((lead) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "bg-white rounded-xl p-3.5 border border-slate-200 hover:border-red-300 hover:shadow-xs transition space-y-2 text-xs",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] font-bold text-slate-500", children: lead.id }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${lead.priority === "Urgent" ? "bg-red-100 text-red-800" : lead.priority === "High" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`, children: lead.priority })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        onClick: () => handleOpenLeadCustomerProfile(lead),
                        className: "font-bold text-slate-900 text-sm hover:text-red-700 hover:underline cursor-pointer",
                        children: lead.customerName
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-500 font-mono text-[11px] flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 11, className: "text-emerald-600" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: lead.customerMobile })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => {
                            setMessageLead(lead);
                            setShowMessageModal(true);
                          },
                          className: "px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 text-[10px] font-semibold flex items-center gap-1 transition",
                          title: "Send WhatsApp/SMS update to lead",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 11 }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Chat" })
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 bg-red-50/60 rounded-lg text-red-900 font-semibold text-[11px]", children: lead.productName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-600 line-clamp-2 text-[11px]", children: lead.requirement }),
                    lead.estimatedValue && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-700 font-bold", children: [
                      "Est. Value: ₹",
                      lead.estimatedValue.toLocaleString("en-IN")
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-slate-100 flex items-center justify-between", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          onClick: () => {
                            setLeadToLink(lead);
                            setShowLinkModal(true);
                          },
                          className: "text-[10px] font-bold text-indigo-700 hover:text-indigo-800",
                          children: "Link Household"
                        }
                      ),
                      stage !== "Converted - Product Opened" && stage !== "Closed - Not Interested" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "button",
                          {
                            onClick: () => handleConvertToProduct(lead),
                            className: "text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12 }),
                              " Convert"
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "button",
                          {
                            onClick: () => handleAdvanceStage(lead.id, lead.stage),
                            className: "text-[11px] font-bold text-red-700 hover:text-red-800 flex items-center gap-0.5",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Advance" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 12 })
                            ]
                          }
                        )
                      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-400 italic", children: "Lifecycle final" })
                    ] })
                  ]
                },
                lead.id
              )),
              (stageLeads == null ? void 0 : stageLeads.length) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center text-slate-400 text-xs italic", children: "No leads in this stage" })
            ] })
          ]
        },
        stage
      );
    }) }),
    viewMode === "table" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs text-left text-slate-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-[11px] text-slate-600 uppercase bg-slate-100/80 border-b border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Lead ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Customer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Stage" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Priority" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Assigned Staff" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-100", children: visibleLeads.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-slate-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono font-bold text-slate-900", children: l.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900", children: l.customerName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[11px] text-slate-500", children: l.customerMobile })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-semibold text-slate-800", children: l.productName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-semibold text-[11px]", children: l.stage }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-semibold text-[11px]", children: l.priority }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-slate-600", children: l.assignedStaffName || "Dadabari SO" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setMessageLead(l);
                setShowMessageModal(true);
              },
              className: "p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition",
              title: "Send Message / Chat",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 13 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleConvertToProduct(l),
              className: "px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold",
              children: "Convert to Product"
            }
          )
        ] }) })
      ] }, l.id)) })
    ] }) }) }),
    showAddLeadModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pb-3 border-b border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-lg", children: "Create New Product Lead" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowAddLeadModal(false), children: "✕" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateLead, className: "space-y-4 mt-4 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Customer Full Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              required: true,
              value: leadCustomerName,
              onChange: (e) => setLeadCustomerName(e.target.value),
              placeholder: "e.g. Mukesh Sen",
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
              value: leadCustomerMobile,
              onChange: (e) => setLeadCustomerMobile(e.target.value),
              placeholder: "e.g. 9829012345",
              className: "w-full p-2.5 border border-slate-300 rounded-xl"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Interested Scheme / Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: leadProductCode,
              onChange: (e) => setLeadProductCode(e.target.value),
              className: "w-full p-2.5 border border-slate-300 rounded-xl bg-white",
              children: POSTAL_PRODUCTS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: p.code, children: [
                p.name,
                " (",
                p.code,
                ")"
              ] }, p.code))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Priority" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: leadPriority,
                onChange: (e) => setLeadPriority(e.target.value),
                className: "w-full p-2.5 border border-slate-300 rounded-xl bg-white",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Low", children: "Low" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Medium", children: "Medium" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "High", children: "High" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Urgent", children: "Urgent" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Estimated Deposit/Cover (₹)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: leadEstimatedValue,
                onChange: (e) => setLeadEstimatedValue(e.target.value),
                placeholder: "e.g. 250000",
                className: "w-full p-2.5 border border-slate-300 rounded-xl"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Requirement Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              rows: 2,
              value: leadRequirement,
              onChange: (e) => setLeadRequirement(e.target.value),
              placeholder: "e.g. Inquired about daughter's Sukanya scheme opening during beat distribution.",
              className: "w-full p-2.5 border border-slate-300 rounded-xl"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Assigned Postal Staff" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: leadAssignedStaff,
              onChange: (e) => setLeadAssignedStaff(e.target.value),
              className: "w-full p-2.5 border border-slate-300 rounded-xl bg-white",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Shri Rajesh Sharma (Beat 2 Postman)", children: "Shri Rajesh Sharma (Beat 2 Postman)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Shri Dinesh Verma (Beat 6 Postman)", children: "Shri Dinesh Verma (Beat 6 Postman)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Dadabari SO Savings Counter", children: "Dadabari SO Savings Counter" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowAddLeadModal(false),
              className: "px-4 py-2 bg-slate-100 rounded-xl font-semibold",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "px-4 py-2 bg-red-700 text-white rounded-xl font-semibold",
              children: "Create Opportunity"
            }
          )
        ] })
      ] })
    ] }) }),
    showLinkModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-lg mb-4", children: "Link Lead to Household" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: customerService.getCustomers().filter((c) => c.type === "Household").map((h) => {
        var _a, _b;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => handleLinkToHousehold(h.id),
            className: "w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: (_a = h.address) == null ? void 0 : _a.houseNumber }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-600", children: (_b = h.address) == null ? void 0 : _b.addressLine1 })
            ]
          },
          h.id
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setShowLinkModal(false),
          className: "mt-4 w-full p-2 bg-slate-100 rounded-xl font-semibold",
          children: "Cancel"
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
    showMessageModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      DirectMessageModal,
      {
        isOpen: showMessageModal,
        onClose: () => {
          setShowMessageModal(false);
          setMessageLead(null);
        },
        initialCustomer: messageLead ? {
          id: messageLead.customerId || "LEAD-TEMP",
          name: messageLead.customerName,
          mobile: messageLead.customerMobile,
          sector: "Dadabari",
          area: "Dadabari SO",
          addressLine1: "",
          pincode: "324009",
          verificationStatus: "Pending Verification",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        } : null,
        initialMessage: messageLead ? `🇮🇳 *भारतीय डाक (India Post) सूचना*

नमस्ते ${messageLead.customerName} जी,
डाक विभाग की योजना *${messageLead.productName}* से संबंधित आपकी पूछताछ प्राप्त हुई थी। अधिक विवरण एवं खाता खोलने की सुविधा हेतु हम आपकी सेवा में तत्पर हैं।

- उपडाकघर: दादाबाड़ी SO (324009)` : ""
      }
    )
  ] });
}
export {
  LeadsPipelineView as default
};
