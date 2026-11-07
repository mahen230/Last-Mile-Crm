import { c as createLucideIcon, u as useAuth, a as useNavigate, r as reactExports, b as customerService, s as staffPermissionService, R as React__default, g as getHierarchyColoniesList, m as matchCustomerToColonyAndSector, d as getHierarchySectorsForColony, j as jsxRuntimeExports, C as CircleCheck, X, U as Users, M as MessageSquare, D as Download, P as Plus, S as Search, e as MapPin, O as OFFICIAL_MAJOR_COLONIES, T as TriangleAlert, L as Layers, f as UserCheck, E as Eye, h as PenLine, i as Target, k as Calendar, l as CustomerProfileModal, A as AddCustomerModal, n as DirectMessageModal } from "./index-CuXKa_SH.js";
import { T as Trash2 } from "./trash-2-BX_7T4VO.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m21 16-4 4-4-4", key: "f6ql7i" }],
  ["path", { d: "M17 20V4", key: "1ejh1v" }],
  ["path", { d: "m3 8 4-4 4 4", key: "11wl7u" }],
  ["path", { d: "M7 4v16", key: "1glfcx" }]
];
const ArrowUpDown = createLucideIcon("arrow-up-down", __iconNode);
function CustomerList({ onAddLead, onAddFollowUp }) {
  var _a;
  const { userProfile, user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = reactExports.useState([]);
  const [statusBanner, setStatusBanner] = reactExports.useState(null);
  const [customerToDelete, setCustomerToDelete] = reactExports.useState(null);
  const [search, setSearch] = reactExports.useState("");
  const [selectedColony, setSelectedColony] = reactExports.useState("All");
  const [selectedSubSector, setSelectedSubSector] = reactExports.useState("All");
  const [selectedVerification, setSelectedVerification] = reactExports.useState("All");
  const [selectedBeat, setSelectedBeat] = reactExports.useState("All");
  const [selectedStaffFilter, setSelectedStaffFilter] = reactExports.useState("All");
  const [showConflictsOnly, setShowConflictsOnly] = reactExports.useState(false);
  const [sortField, setSortField] = reactExports.useState("colony");
  const [sortAsc, setSortAsc] = reactExports.useState(true);
  const [currentPage, setCurrentPage] = reactExports.useState(1);
  const [pageSize, setPageSize] = reactExports.useState(50);
  const [selectedCustomer, setSelectedCustomer] = reactExports.useState(null);
  const [customerToEdit, setCustomerToEdit] = reactExports.useState(null);
  const [showAddModal, setShowAddModal] = reactExports.useState(false);
  const [messageCustomer, setMessageCustomer] = reactExports.useState(null);
  const [showMessageModal, setShowMessageModal] = reactExports.useState(false);
  const [assignTargetCustomer, setAssignTargetCustomer] = reactExports.useState(null);
  const [assignStaffEmail, setAssignStaffEmail] = reactExports.useState("ektamahenmeena@gmail.com");
  reactExports.useEffect(() => {
    setCustomers(customerService.getCustomers());
    const unsub = customerService.subscribe(() => {
      setCustomers([...customerService.getCustomers()]);
    });
    return () => unsub();
  }, []);
  const isAdmin = (userProfile == null ? void 0 : userProfile.role) === "SUPER_ADMIN" || (userProfile == null ? void 0 : userProfile.role) === "ADMIN";
  const canViewAll = ((_a = userProfile == null ? void 0 : userProfile.permissions) == null ? void 0 : _a.canViewAllRecords) ?? true;
  const quotaCheck = userProfile ? staffPermissionService.canUserEnterRecord(userProfile.email) : { limit: 0, todayCount: 0 };
  const handleExportCSV = () => {
    const csvData = customerService.exportCustomersToCSV();
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `MASTER_SOURCE_CUSTOMERS_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const showNotification = (message, type = "success") => {
    setStatusBanner({ type, message });
    setTimeout(() => {
      setStatusBanner((prev) => (prev == null ? void 0 : prev.message) === message ? null : prev);
    }, 3500);
  };
  const handleDeleteCustomer = (c) => {
    setCustomerToDelete(c);
  };
  const confirmDeleteCustomer = () => {
    if (!customerToDelete) return;
    customerService.deleteCustomer(customerToDelete.id);
    showNotification(`Customer "${customerToDelete.name}" (${customerToDelete.masterId || customerToDelete.id}) removed from directory.`, "warning");
    setCustomerToDelete(null);
  };
  const handleConfirmAssignment = (e) => {
    e.preventDefault();
    if (!assignTargetCustomer || !assignStaffEmail) return;
    customerService.assignCustomerToStaff(assignTargetCustomer.id, assignStaffEmail);
    showNotification(`Assigned "${assignTargetCustomer.name}" to ${assignStaffEmail}.`, "success");
    setAssignTargetCustomer(null);
  };
  const availableColonies = React__default.useMemo(() => {
    const fromCustomers = customers.map((c) => {
      var _a2;
      return c.area || ((_a2 = c.address) == null ? void 0 : _a2.area) || c.sectorLocality || "";
    }).filter(Boolean);
    return getHierarchyColoniesList(fromCustomers);
  }, [customers]);
  const customerColonySubSectorChips = React__default.useMemo(() => {
    if (selectedColony === "All") return [];
    const fromCustomers = customers.filter((c) => matchCustomerToColonyAndSector(c, selectedColony, "All")).map((c) => c.sector || "").filter(Boolean);
    return getHierarchySectorsForColony(selectedColony, fromCustomers);
  }, [selectedColony, customers]);
  const handleColonyChange = (colony) => {
    setSelectedColony(colony);
    setSelectedSubSector("All");
    setCurrentPage(1);
  };
  const filteredCustomers = customers.filter((c) => {
    var _a2, _b, _c, _d;
    if (!staffPermissionService.matchesUserBeatScope(userProfile, c)) {
      return false;
    }
    if (selectedStaffFilter !== "All") {
      if (selectedStaffFilter === "ekta") {
        const isEkta = ((_a2 = c.enteredBy) == null ? void 0 : _a2.toLowerCase()) === "ektamahenmeena@gmail.com" || ((_b = c.assignedStaffEmail) == null ? void 0 : _b.toLowerCase()) === "ektamahenmeena@gmail.com";
        if (!isEkta) return false;
      } else if (selectedStaffFilter === "admin") {
        const isAdminEntry = !c.enteredBy || ((_c = c.enteredBy) == null ? void 0 : _c.toLowerCase().includes("mahen"));
        if (!isAdminEntry) return false;
      } else if (selectedStaffFilter === "assigned_beat2") {
        if (c.beatNo !== "2") return false;
      }
    }
    const s = search.toLowerCase().trim();
    const matchesSearch = !s || c.name && c.name.toLowerCase().includes(s) || c.mobile && c.mobile.includes(s) || c.masterId && c.masterId.toLowerCase().includes(s) || c.houseNo && c.houseNo.toLowerCase().includes(s) || c.sector && c.sector.toLowerCase().includes(s) || c.area && c.area.toLowerCase().includes(s) || c.remarks && c.remarks.toLowerCase().includes(s) || ((_d = c.address) == null ? void 0 : _d.fullAddress) && c.address.fullAddress.toLowerCase().includes(s) || c.enteredByName && c.enteredByName.toLowerCase().includes(s) || c.assignedStaffName && c.assignedStaffName.toLowerCase().includes(s);
    const matchesColonyAndSector = matchCustomerToColonyAndSector(c, selectedColony, selectedSubSector);
    const matchesBeat = selectedBeat === "All" || c.beatNo === selectedBeat;
    const matchesVerification = selectedVerification === "All" || c.verificationStatus === selectedVerification;
    const matchesConflict = !showConflictsOnly || c.hasConflict;
    return matchesSearch && matchesColonyAndSector && matchesBeat && matchesVerification && matchesConflict;
  });
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    var _a2, _b, _c, _d;
    if (sortField === "colony" || sortField === "sector") {
      const colA = (a.area || a.sectorLocality || ((_a2 = a.address) == null ? void 0 : _a2.area) || a.sector || "").trim();
      const colB = (b.area || b.sectorLocality || ((_b = b.address) == null ? void 0 : _b.area) || b.sector || "").trim();
      const cmp = colA.localeCompare(colB, void 0, { numeric: true, sensitivity: "base" });
      if (cmp !== 0) return sortAsc ? cmp : -cmp;
      const hA = (a.houseNo || ((_c = a.address) == null ? void 0 : _c.houseNumber) || "").trim();
      const hB = (b.houseNo || ((_d = b.address) == null ? void 0 : _d.houseNumber) || "").trim();
      return sortAsc ? hA.localeCompare(hB, void 0, { numeric: true, sensitivity: "base" }) : hB.localeCompare(hA, void 0, { numeric: true, sensitivity: "base" });
    }
    if (sortField === "latest") {
      return 0;
    }
    let aVal = a[sortField] || "";
    let bVal = b[sortField] || "";
    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });
  const totalPages = Math.max(1, Math.ceil(sortedCustomers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCustomers = sortedCustomers.slice((safePage - 1) * pageSize, safePage * pageSize);
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", id: "master-customer-directory", children: [
    statusBanner && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-xs ${statusBanner.type === "warning" ? "bg-amber-50 border-amber-300 text-amber-900" : "bg-emerald-50 border-emerald-300 text-emerald-900"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16, className: statusBanner.type === "warning" ? "text-amber-700" : "text-emerald-700" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: statusBanner.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStatusBanner(null), className: "text-slate-500 hover:text-slate-800", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
    ] }),
    userProfile && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isAdmin ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-emerald-100 text-emerald-900 border border-emerald-300"}`, children: userProfile.name.charAt(0).toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900 text-sm", children: userProfile.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-400", children: [
              "(",
              userProfile.email,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700", children: [
              userProfile.role,
              " • ",
              userProfile.beat
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-500 text-[11px] mt-0.5", children: canViewAll ? "👑 Admin Mode: Viewing all SO master records across all beats" : "🔒 Field Staff Mode: Viewing only records entered by you or assigned in your beat" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 self-end md:self-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold text-slate-600", children: "Today's Entries (दैनिक कोटा):" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-bold text-slate-900", children: [
            quotaCheck.todayCount,
            " / ",
            quotaCheck.limit === 0 ? "Unlimited" : quotaCheck.limit
          ] })
        ] }),
        quotaCheck.limit > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 bg-slate-100 h-2 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `h-full rounded-full transition-all ${quotaCheck.todayCount >= quotaCheck.limit ? "bg-red-500" : "bg-emerald-500"}`,
            style: { width: `${Math.min(100, quotaCheck.todayCount / quotaCheck.limit * 100)}%` }
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-slate-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 22, className: "text-red-700" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Master Source Customer Directory" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500 mt-0.5", children: [
          "Single Source of Truth (",
          filteredCustomers.length,
          " Records Visible • Dadabari SO 324009)"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setMessageCustomer(null);
              setShowMessageModal(true);
            },
            className: "px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-emerald-200",
            id: "open-direct-message-hub-btn",
            title: "Compose WhatsApp / SMS message to customer",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 15, className: "text-emerald-700" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Send Message / Chat" })
            ]
          }
        ),
        (!userProfile || userProfile.permissions.canExportData) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleExportCSV,
            className: "px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-300",
            id: "export-customers-csv-btn",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 15 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Export CSV" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              if (quotaCheck.limit > 0 && quotaCheck.todayCount >= quotaCheck.limit) {
                showNotification(`दैनिक सीमा पूर्ण (Daily Limit Reached): आप आज के लिए निर्धारित ${quotaCheck.limit} प्रविष्टियां पूरी कर चुके हैं।`, "warning");
                return;
              }
              setCustomerToEdit(null);
              setShowAddModal(true);
            },
            disabled: quotaCheck.limit > 0 && quotaCheck.todayCount >= quotaCheck.limit,
            className: `px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs ${quotaCheck.limit > 0 && quotaCheck.todayCount >= quotaCheck.limit ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-red-700 hover:bg-red-800 text-white"}`,
            id: "add-customer-main-btn",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add Verified Customer" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500 font-medium", children: "Visible Master Customers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-slate-900 mt-1", children: filteredCustomers.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500 font-medium", children: "Field Confirmed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-emerald-700 mt-1", children: filteredCustomers.filter((c) => c.verificationStatus === "Field Confirmed" || c.verificationStatus === "Document Confirmed").length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500 font-medium", children: "Active Scheme Inquiries" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-blue-700 mt-1", children: filteredCustomers.filter((c) => c.products && c.products.length > 0).length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500 font-medium", children: "Assigned / My Entries" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-purple-700 mt-1", children: filteredCustomers.filter((c) => c.enteredBy || c.assignedStaffEmail).length })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 18, className: "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Search by Name, Mobile, House Number, Sector (e.g. 6, 7), Staff Name, Master ID...",
            className: "w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600 font-medium",
            id: "customer-search-input"
          }
        ),
        search && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSearch(""),
            className: "absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700",
            children: "Clear"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2.5 pt-1 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-600 font-bold flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 13, className: "text-red-600" }),
            " Colony:"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: selectedColony,
              onChange: (e) => handleColonyChange(e.target.value),
              className: "py-1.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold text-xs focus:ring-2 focus:ring-red-600 shadow-xs cursor-pointer",
              id: "customer-colony-filter-select",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "All", children: "All Major Colonies (Dadabari S.O. 324009)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: "Official Major Colonies (Pincode 324009 / Beats 1-33)", children: OFFICIAL_MAJOR_COLONIES.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: col, children: col }, col)) }),
                availableColonies.filter((c) => !OFFICIAL_MAJOR_COLONIES.includes(c)).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: "Additional Registered Areas", children: availableColonies.filter((c) => !OFFICIAL_MAJOR_COLONIES.includes(c)).map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: col, children: col }, col)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden sm:flex items-center gap-1", children: ["Keshavpura", "Basant Vihar", "Dadabari", "Santoshi Nagar", "Mahaveer Nagar"].map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => handleColonyChange(selectedColony === col ? "All" : col),
            className: `px-2 py-1 rounded-lg text-[11px] font-semibold transition ${selectedColony === col ? "bg-red-700 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`,
            children: col
          },
          col
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 sm:ml-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 font-semibold", children: "Beat:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: selectedBeat,
              onChange: (e) => {
                setSelectedBeat(e.target.value);
                setCurrentPage(1);
              },
              className: "py-1.5 px-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 font-bold text-xs focus:ring-2 focus:ring-red-600",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "All", children: "All Beats (1-33)" }),
                Array.from({ length: 33 }, (_, i) => String(i + 1)).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: b, children: [
                  "Beat ",
                  b
                ] }, b))
              ]
            }
          )
        ] }),
        isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 sm:ml-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 font-semibold", children: "Staff:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: selectedStaffFilter,
              onChange: (e) => {
                setSelectedStaffFilter(e.target.value);
                setCurrentPage(1);
              },
              className: "py-1.5 px-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 font-semibold text-xs focus:ring-2 focus:ring-red-600",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "All", children: "All Staff Entries" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ekta", children: "Ekta Meena (ektamahenmeena@gmail.com)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "assigned_beat2", children: "Beat 2 Assigned Records" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "admin", children: "Admin / System Created" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setShowConflictsOnly(!showConflictsOnly);
              setCurrentPage(1);
            },
            className: `px-2.5 py-1.5 rounded-xl font-semibold ml-auto transition flex items-center gap-1 text-xs ${showConflictsOnly ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-900 hover:bg-amber-200"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 13 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: showConflictsOnly ? "Conflicts Only" : "Filter Conflicts" })
            ]
          }
        )
      ] }),
      selectedColony !== "All" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-red-50/70 rounded-xl border border-red-200 flex flex-wrap items-center gap-2 animate-fadeIn text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-red-900 font-black shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 14, className: "text-red-700" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            selectedColony,
            " Sub-Sectors / Blocks:"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setSelectedSubSector("All");
              setCurrentPage(1);
            },
            className: `px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-xs ${selectedSubSector === "All" ? "bg-red-700 text-white" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"}`,
            children: [
              "All ",
              selectedColony,
              " (",
              customers.filter((c) => matchCustomerToColonyAndSector(c, selectedColony, "All")).length,
              ")"
            ]
          }
        ),
        customerColonySubSectorChips.map((sec) => {
          const count = customers.filter((c) => matchCustomerToColonyAndSector(c, selectedColony, sec)).length;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                setSelectedSubSector(sec);
                setCurrentPage(1);
              },
              className: `px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5 ${selectedSubSector === sec ? "bg-slate-900 text-white" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: sec }),
                count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] px-1.5 py-0.2 rounded-full font-bold ${selectedSubSector === sec ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600"}`, children: count })
              ]
            },
            sec
          );
        })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs text-left text-slate-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-[11px] text-slate-600 uppercase bg-slate-100/80 border-b border-slate-200 tracking-wider font-bold", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { onClick: () => toggleSort("masterId"), className: "px-4 py-3 cursor-pointer hover:text-slate-900", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Master ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { size: 12 })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { onClick: () => toggleSort("name"), className: "px-4 py-3 cursor-pointer hover:text-slate-900", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Customer Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { size: 12 })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-bold", children: "Mobile & WhatsApp" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { onClick: () => toggleSort("sector"), className: "px-4 py-3 cursor-pointer hover:text-slate-900", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "House / Sector" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { size: 12 })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-bold", children: "Beat" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-bold", children: "Staff Ownership" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 font-bold", children: "Verification" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right font-bold", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-100", children: paginatedCustomers.length > 0 ? paginatedCustomers.map((cust, custIdx) => {
          var _a2, _b;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-slate-50/80 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono font-bold text-slate-900", children: cust.masterId || cust.id }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-semibold text-slate-900", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    onClick: () => setSelectedCustomer(cust),
                    className: "hover:text-red-700 hover:underline cursor-pointer font-bold",
                    children: cust.name
                  }
                ),
                cust.hasConflict && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 14, className: "text-amber-600 shrink-0", title: "Data conflict or shared phone" })
              ] }),
              cust.fatherHusbandName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-400 font-normal", children: [
                "S/o ",
                cust.fatherHusbandName
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-mono text-slate-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: cust.mobile || "—" }),
              cust.whatsapp && cust.whatsapp !== cust.mobile && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-emerald-600", children: [
                "WA: ",
                cust.whatsapp
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-slate-900", children: cust.houseNo || ((_a2 = cust.address) == null ? void 0 : _a2.houseNumber) || "Plot/House" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-500", children: cust.sector ? `Sector ${cust.sector}` : cust.area || "Keshavpura" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700", children: [
              "Beat ",
              cust.beatNo || "2"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: cust.enteredByName || cust.assignedStaffName || cust.enteredBy ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-slate-900 text-[11px]", children: cust.enteredByName || cust.assignedStaffName || ((_b = cust.enteredBy) == null ? void 0 : _b.split("@")[0]) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-400 truncate max-w-[130px]", children: cust.enteredBy || cust.assignedStaffEmail || "Assigned" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 text-[11px]", children: "Dadabari SO" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${cust.verificationStatus === "Field Confirmed" ? "bg-emerald-100 text-emerald-800" : cust.verificationStatus === "Document Confirmed" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`, children: cust.verificationStatus }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    setMessageCustomer(cust);
                    setShowMessageModal(true);
                  },
                  className: "p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition",
                  title: "Send Message / Chat (WhatsApp & SMS)",
                  id: `cust-${cust.id || cust.masterId || custIdx}-msg-btn`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 14 })
                }
              ),
              isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    setAssignTargetCustomer(cust);
                    setAssignStaffEmail(cust.assignedStaffEmail || "ektamahenmeena@gmail.com");
                  },
                  className: "p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition",
                  title: "Assign to Staff Member (कर्मचारी असाइन करें)",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { size: 14 })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setSelectedCustomer(cust),
                  className: "p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition",
                  title: "View 360 Profile",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    setCustomerToEdit(cust);
                    setShowAddModal(true);
                  },
                  className: "p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition",
                  title: "Edit Record",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { size: 14 })
                }
              ),
              isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => handleDeleteCustomer(cust),
                  className: "p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition",
                  title: "Delete Customer",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    if (onAddLead) {
                      onAddLead(cust);
                    } else {
                      navigate("/leads", { state: { initialCustomer: cust } });
                    }
                  },
                  className: "p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition cursor-pointer",
                  title: "Create Lead",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { size: 14 })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    if (onAddFollowUp) {
                      onAddFollowUp(cust);
                    } else {
                      navigate("/followups", { state: { initialCustomer: cust } });
                    }
                  },
                  className: "p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition cursor-pointer",
                  title: "Schedule Follow-up",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 14 })
                }
              )
            ] }) })
          ] }, cust.id ? `cust-${cust.id}-${custIdx}` : cust.masterId ? `cust-m-${cust.masterId}-${custIdx}` : `cust-row-${custIdx}`);
        }) : /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "p-8 text-center text-slate-500", children: "No customers match your search criteria. Try modifying your filters or add a new record." }) }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-600 font-medium", children: [
          "Showing",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900", children: sortedCustomers.length === 0 ? 0 : (safePage - 1) * pageSize + 1 }),
          " ",
          "to",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900", children: Math.min(safePage * pageSize, sortedCustomers.length) }),
          " ",
          "of ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900", children: sortedCustomers.length }),
          " customers"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: pageSize,
              onChange: (e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              },
              className: "px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 50, children: "50 / page" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: 100, children: "100 / page" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: 500, children: [
                  "Show All (",
                  sortedCustomers.length,
                  ")"
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              disabled: safePage <= 1,
              onClick: () => setCurrentPage((p) => Math.max(1, p - 1)),
              className: "px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer",
              children: "Prev"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-slate-800 px-2", children: [
            "Page ",
            safePage,
            " / ",
            totalPages
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              disabled: safePage >= totalPages,
              onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
              className: "px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer",
              children: "Next"
            }
          )
        ] })
      ] })
    ] }),
    assignTargetCustomer && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-4 border-b border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-base text-slate-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { size: 18, className: "text-purple-700" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "कर्मचारी को रिकॉर्ड असाइन करें (Assign Staff)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setAssignTargetCustomer(null),
            className: "p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleConfirmAssignment, className: "space-y-4 mt-4 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 p-3 rounded-xl border border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-500", children: "Customer:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900 text-sm", children: assignTargetCustomer.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-600 font-mono text-[11px] mt-0.5", children: [
            "ID: ",
            assignTargetCustomer.masterId || assignTargetCustomer.id,
            " • Beat ",
            assignTargetCustomer.beatNo || "2"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Select Staff Member to Assign *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: assignStaffEmail,
              onChange: (e) => setAssignStaffEmail(e.target.value),
              className: "w-full p-2.5 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-600",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ektamahenmeena@gmail.com", children: "Ekta Meena (ektamahenmeena@gmail.com) • Beat 2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "mahen.comtech@gmail.com", children: "Mahendra Meena (mahen.comtech@gmail.com) • Admin" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "muskan.sharma@indiapost.gov.in", children: "Muskan Sharma • Beat 6" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "govind.prasad@indiapost.gov.in", children: "Govind Prasad • Beat 1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "viewer@indiapost.gov.in", children: "Field Observer (viewer@indiapost.gov.in)" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2 pt-3 border-t border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setAssignTargetCustomer(null),
              className: "px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs",
              children: "असाइन करें (Assign Record)"
            }
          )
        ] })
      ] })
    ] }) }),
    customerToDelete && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-base text-slate-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 18, className: "text-red-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Confirm Customer Removal" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setCustomerToDelete(null),
            className: "p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-600 leading-relaxed", children: [
        "क्या आप ग्राहक ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          '"',
          customerToDelete.name,
          '"'
        ] }),
        " (ID: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: customerToDelete.masterId || customerToDelete.id }),
        ") को Master Source से हटाना चाहते हैं?"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2 pt-2 border-t border-slate-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setCustomerToDelete(null),
            className: "px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: confirmDeleteCustomer,
            className: "px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-xs",
            children: "Delete Record"
          }
        )
      ] })
    ] }) }),
    selectedCustomer && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CustomerProfileModal,
      {
        customer: selectedCustomer,
        onClose: () => setSelectedCustomer(null),
        onEdit: (c) => {
          setSelectedCustomer(null);
          setCustomerToEdit(c);
          setShowAddModal(true);
        },
        onAddLead,
        onAddFollowUp
      }
    ),
    showAddModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AddCustomerModal,
      {
        isOpen: showAddModal,
        onClose: () => setShowAddModal(false),
        customerToEdit,
        onSaved: (saved) => {
          setCustomers([...customerService.getCustomers()]);
        },
        onLinkToExisting: (c) => {
          setCustomerToEdit(c);
        }
      }
    ),
    showMessageModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      DirectMessageModal,
      {
        isOpen: showMessageModal,
        onClose: () => {
          setShowMessageModal(false);
          setMessageCustomer(null);
        },
        initialCustomer: messageCustomer
      }
    )
  ] });
}
export {
  CustomerList as default
};
