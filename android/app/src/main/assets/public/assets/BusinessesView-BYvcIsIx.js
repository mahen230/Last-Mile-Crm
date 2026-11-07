import { ab as useLocation, a as useNavigate, r as reactExports, am as getVerifiedDadabari324009Registry, an as getStoredCscDirectory, b as customerService, j as jsxRuntimeExports, C as CircleCheck, K as Sparkles, D as Download, y as ShieldCheck, S as Search, G as Funnel, e as MapPin, aa as User, p as Phone, P as Plus, Q as Navigation, L as Layers, V as Pen, ao as notificationScannerService, _ as Check, n as CustomerProfileModal, ap as ingestVerifiedStoreToCrm, aq as saveVerifiedDadabari324009Registry, $ as utils, a0 as writeFileSync } from "./index-CLJIrWlm.js";
import { S as Store } from "./store-C1uIOWjA.js";
import { B as Briefcase } from "./briefcase-B3x0u3a_.js";
function BusinessesView() {
  var _a;
  const location = useLocation();
  const navigate = useNavigate();
  const initialKeyword = ((_a = location.state) == null ? void 0 : _a.searchKeyword) || "";
  const [activeTab, setActiveTab] = reactExports.useState("dadabari_324009");
  const [customers, setCustomers] = reactExports.useState([]);
  const [verifiedStores, setVerifiedStores] = reactExports.useState(getVerifiedDadabari324009Registry());
  const [cscEntities, setCscEntities] = reactExports.useState(getStoredCscDirectory());
  const [search, setSearch] = reactExports.useState(initialKeyword);
  const [selectedBeatFilter, setSelectedBeatFilter] = reactExports.useState("ALL");
  const [selectedColonyFilter, setSelectedColonyFilter] = reactExports.useState("ALL");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = reactExports.useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = reactExports.useState("ALL");
  const [selectedCustomer, setSelectedCustomer] = reactExports.useState(null);
  const [selectedStoreForModal, setSelectedStoreForModal] = reactExports.useState(null);
  const [editingStore, setEditingStore] = reactExports.useState(null);
  const [toastMessage, setToastMessage] = reactExports.useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };
  reactExports.useEffect(() => {
    setCustomers(customerService.getCustomers());
    const unsub = customerService.subscribe(() => {
      setCustomers([...customerService.getCustomers()]);
    });
    return () => unsub();
  }, []);
  reactExports.useEffect(() => {
    var _a2;
    if ((_a2 = location.state) == null ? void 0 : _a2.searchKeyword) {
      setSearch(location.state.searchKeyword);
    }
  }, [location.state]);
  const merchants = reactExports.useMemo(() => {
    var _a2;
    return ((_a2 = customers == null ? void 0 : customers.filter((c) => {
      const text = `${c.name} ${c.remarks || ""} ${c.occupation || ""}`.toLowerCase();
      const isBiz = text.includes("tea") || text.includes("shop") || text.includes("stall") || text.includes("traders") || text.includes("collection") || text.includes("welding") || text.includes("school") || text.includes("medical") || text.includes("centre") || text.includes("center") || text.includes("enterprise") || text.includes("store") || text.includes("emitra") || text.includes("csc");
      const s = search.toLowerCase();
      return isBiz && (!s || text.includes(s));
    })) == null ? void 0 : _a2.sort((a, b) => {
      var _a3, _b, _c, _d;
      const colA = (a.area || a.sectorLocality || ((_a3 = a.address) == null ? void 0 : _a3.area) || a.sector || "").trim();
      const colB = (b.area || b.sectorLocality || ((_b = b.address) == null ? void 0 : _b.area) || b.sector || "").trim();
      const colCmp = colA.localeCompare(colB, void 0, { numeric: true, sensitivity: "base" });
      if (colCmp !== 0) return colCmp;
      const hA = (a.houseNo || ((_c = a.address) == null ? void 0 : _c.houseNumber) || "").trim();
      const hB = (b.houseNo || ((_d = b.address) == null ? void 0 : _d.houseNumber) || "").trim();
      return hA.localeCompare(hB, void 0, { numeric: true, sensitivity: "base" });
    })) || [];
  }, [customers, search]);
  const uniqueDadabariColonies = reactExports.useMemo(() => {
    return Array.from(new Set(verifiedStores.map((c) => c.colony))).sort();
  }, [verifiedStores]);
  const filteredVerified324009Stores = reactExports.useMemo(() => {
    return verifiedStores.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || item.storeName.toLowerCase().includes(q) || item.ownerName.toLowerCase().includes(q) || item.housePlotNumber.toLowerCase().includes(q) || item.colony.toLowerCase().includes(q) || item.landmark.toLowerCase().includes(q) || item.primaryMobile.includes(q) || item.whatsapp.includes(q) || item.assignedStaffName.toLowerCase().includes(q) || item.assignedStaffId.toLowerCase().includes(q) || item.beatNo.toLowerCase().includes(q) || item.postalPotentialRemark.toLowerCase().includes(q);
      const matchesBeat = selectedBeatFilter === "ALL" || item.beatNo === selectedBeatFilter;
      const matchesColony = selectedColonyFilter === "ALL" || item.colony === selectedColonyFilter;
      const matchesCat = selectedCategoryFilter === "ALL" || item.categoryTag === selectedCategoryFilter;
      const matchesStatus = selectedStatusFilter === "ALL" || selectedStatusFilter === "Ingested" && item.ingestedToCrm || selectedStatusFilter === "NotIngested" && !item.ingestedToCrm;
      return matchesSearch && matchesBeat && matchesColony && matchesCat && matchesStatus;
    }).sort((a, b) => {
      const colCmp = (a.colony || "").trim().localeCompare((b.colony || "").trim(), void 0, { numeric: true, sensitivity: "base" });
      if (colCmp !== 0) return colCmp;
      return (a.housePlotNumber || "").trim().localeCompare((b.housePlotNumber || "").trim(), void 0, { numeric: true, sensitivity: "base" });
    });
  }, [verifiedStores, search, selectedBeatFilter, selectedColonyFilter, selectedCategoryFilter, selectedStatusFilter]);
  const filteredCsc = reactExports.useMemo(() => {
    return cscEntities.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || item.businessName.toLowerCase().includes(q) || item.operatorName.toLowerCase().includes(q) || item.housePlotNumber.toLowerCase().includes(q) || item.colony.toLowerCase().includes(q) || item.landmark.toLowerCase().includes(q) || item.primaryMobile.includes(q) || item.assignedStaffName.toLowerCase().includes(q) || item.beatNo.toLowerCase().includes(q);
      const matchesBeat = selectedBeatFilter === "ALL" || item.beatNo === selectedBeatFilter;
      return matchesSearch && matchesBeat;
    }).sort((a, b) => {
      const colCmp = (a.colony || "").trim().localeCompare((b.colony || "").trim(), void 0, { numeric: true, sensitivity: "base" });
      if (colCmp !== 0) return colCmp;
      return (a.housePlotNumber || "").trim().localeCompare((b.housePlotNumber || "").trim(), void 0, { numeric: true, sensitivity: "base" });
    });
  }, [cscEntities, search, selectedBeatFilter]);
  const handleIngest324009Store = (store) => {
    const res = ingestVerifiedStoreToCrm(store);
    if (res.success) {
      setVerifiedStores(getVerifiedDadabari324009Registry());
      showToast(res.message);
    } else {
      showToast(`⚠️ ${res.message}`);
    }
  };
  const handleBulkSync324009All = () => {
    let count = 0;
    verifiedStores.forEach((store) => {
      ingestVerifiedStoreToCrm(store);
      count++;
    });
    setVerifiedStores(getVerifiedDadabari324009Registry());
    showToast(`✅ Reality-Check Complete! All ${count} active commercial stores in Pincode 324009 synced to CRM Master.`);
  };
  const handleSaveStoreEdit = (e) => {
    e.preventDefault();
    if (!editingStore) return;
    const currentList = getVerifiedDadabari324009Registry();
    const updated = currentList.map((s) => s.id === editingStore.id ? editingStore : s);
    saveVerifiedDadabari324009Registry(updated);
    setVerifiedStores(updated);
    ingestVerifiedStoreToCrm(editingStore);
    setEditingStore(null);
    showToast(`✅ Store details updated and synchronized for "${editingStore.storeName}".`);
  };
  const handleExport324009ToExcel = () => {
    const exportData = filteredVerified324009Stores.map((s) => ({
      "Store ID": s.id,
      "Store / Signboard Name": s.storeName,
      "Contact Person / Owner": s.ownerName,
      "Primary Mobile": s.primaryMobile,
      "WhatsApp Number": s.whatsapp,
      "Plot / Shop Number": s.housePlotNumber,
      "Colony / Sub-Locality": s.colony,
      "Prominent Landmark": s.landmark,
      "Pincode": s.pincode,
      "Delivery Office": s.deliveryOffice,
      "Assigned Beat": s.beatNo,
      "Assigned Postman": s.assignedStaffName,
      "Staff Directory ID": s.assignedStaffId,
      "Category Tag": s.categoryTag,
      "Operational Status": s.operationalStatus,
      "Audit Verification": s.verificationBadge,
      "Postal Potential": s.postalPotentialRemark,
      "Daily Footfall": s.dailyFootfall,
      "Last Audit Date": s.lastAuditDate
    }));
    const worksheet = utils.json_to_sheet(exportData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Dadabari_324009_Commercial");
    writeFileSync(
      workbook,
      `Dadabari_324009_Verified_Commercial_Stores_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`
    );
    showToast("Exported 324009 Reality-Checked Registry to Excel.");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", id: "businesses-view-root", children: [
    toastMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-emerald-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300 border border-emerald-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 text-xs sm:text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-emerald-300 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: toastMessage })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setToastMessage(null),
          className: "text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg font-bold cursor-pointer",
          children: "Dismiss"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-800 to-slate-900 text-amber-300 flex items-center justify-center font-black shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Store, { size: 22 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-black text-slate-900", children: "Dadabari S.O. Commercial & Store Directory" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-black bg-red-100 text-red-900 border border-red-200 font-mono", children: "PIN 324009 STRICT" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Zero Dead Data" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "100% active, ground-verified commercial stores (eMitra, CSC, General Merchants, Kirana & Retail) mapped to Dadabari postal beats." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: handleBulkSync324009All,
            className: "px-4 py-2.5 bg-gradient-to-r from-red-800 to-slate-950 hover:from-red-900 hover:to-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 14, className: "text-amber-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "1-Click Sync All 324009 Stores (",
                verifiedStores.length,
                ")"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: handleExport324009ToExcel,
            className: "p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition",
            title: "Download Excel Report",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 16 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex border-b border-slate-200 gap-2 sm:gap-3 overflow-x-auto pb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveTab("dadabari_324009"),
          className: `px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${activeTab === "dadabari_324009" ? "bg-red-800 text-white shadow-md font-extrabold" : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 16, className: activeTab === "dadabari_324009" ? "text-amber-300" : "text-red-700" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Pincode 324009 Verified Stores (",
              verifiedStores.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950", children: "Audit-Grade" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveTab("csc_emitra"),
          className: `px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${activeTab === "csc_emitra" ? "bg-amber-500 text-slate-950 shadow-md font-extrabold" : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 16, className: activeTab === "csc_emitra" ? "text-slate-950" : "text-amber-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Kota eMitra & CSC Directory (",
              cscEntities.length,
              ")"
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveTab("merchants"),
          className: `px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${activeTab === "merchants" ? "bg-indigo-900 text-white shadow-md" : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { size: 16, className: activeTab === "merchants" ? "text-indigo-300" : "text-slate-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "General Customer Merchants (",
              merchants.length,
              ")"
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full md:w-80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Search store name, proprietor, mobile, landmark...",
            className: "w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-600 focus:bg-white focus:outline-hidden transition"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 w-full md:w-auto", children: [
        activeTab === "dadabari_324009" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: selectedCategoryFilter,
            onChange: (e) => setSelectedCategoryFilter(e.target.value),
            className: "px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:outline-hidden",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Categories" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Commercial • eMitra / CSC", children: "eMitra / CSC" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Commercial • General Store / Retail", children: "General Store / Retail" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { size: 13 }),
            " Beat:"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: selectedBeatFilter,
              onChange: (e) => setSelectedBeatFilter(e.target.value),
              className: "px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:outline-hidden",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Beats" }),
                ["Beat 1", "Beat 2", "Beat 3", "Beat 4", "Beat 5", "Beat 6", "Beat 7", "Beat 8", "Beat 9", "Beat 10", "Beat 33"].map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: b, children: [
                  b,
                  " (324009)"
                ] }, b))
              ]
            }
          )
        ] }),
        activeTab === "dadabari_324009" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 13 }),
            " Colony:"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: selectedColonyFilter,
              onChange: (e) => setSelectedColonyFilter(e.target.value),
              className: "px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:outline-hidden max-w-[150px]",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Colonies" }),
                uniqueDadabariColonies.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: col, children: col }, col))
              ]
            }
          )
        ] }),
        (search || selectedBeatFilter !== "ALL" || selectedColonyFilter !== "ALL" || selectedCategoryFilter !== "ALL") && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setSearch("");
              setSelectedBeatFilter("ALL");
              setSelectedColonyFilter("ALL");
              setSelectedCategoryFilter("ALL");
            },
            className: "px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition cursor-pointer",
            children: "Clear"
          }
        )
      ] })
    ] }) }),
    activeTab === "dadabari_324009" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-slate-500 px-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Showing ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-slate-900 font-bold", children: filteredVerified324009Stores.length }),
          " physically verified, 100% active commercial stores in Pincode 324009"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-emerald-700 font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 13 }),
            " ",
            filteredVerified324009Stores.filter((s) => s.ingestedToCrm).length,
            " Synced in CRM"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600 font-semibold font-mono", children: "Dadabari S.O. Beats 1–33" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5", children: filteredVerified324009Stores.map((store) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-white rounded-3xl border border-slate-200 hover:border-red-400 hover:shadow-lg transition flex flex-col justify-between overflow-hidden group",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 space-y-3.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${store.categoryTag === "Commercial • eMitra / CSC" ? "bg-amber-100 text-amber-900 border border-amber-200" : "bg-blue-100 text-blue-900 border border-blue-200"}`,
                        children: store.categoryTag
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-0.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 10 }),
                      " Active Store"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-black text-base text-slate-900 group-hover:text-red-800 transition", children: store.storeName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-600 flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 13, className: "text-slate-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900", children: store.ownerName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-500 font-mono", children: "(Proprietor)" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block px-2.5 py-1 rounded-xl bg-slate-900 text-amber-300 font-mono font-black text-xs shadow-2xs", children: store.beatNo }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono font-bold text-red-700 mt-0.5", children: "PIN 324009" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-1.5 text-slate-800", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 13, className: "text-red-600 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: store.housePlotNumber }),
                    ", ",
                    store.colony
                  ] })
                ] }),
                store.landmark && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-600 text-[11px] pl-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Landmark:" }),
                  " ",
                  store.landmark
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 pl-4 pt-1 text-[11px] font-mono", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-slate-800", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 11, className: "text-emerald-600" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `tel:${store.primaryMobile}`, className: "hover:underline font-bold", children: store.primaryMobile })
                  ] }),
                  store.whatsapp && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-700 font-bold", children: [
                    "WA: ",
                    store.whatsapp
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-950 space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-black uppercase text-amber-800 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 11 }),
                  " Postal Potential & Operations:"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] leading-tight font-medium", children: store.postalPotentialRemark })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 13, className: "text-emerald-600" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Postman:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-slate-900", children: store.assignedStaffName })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 font-bold", children: store.assignedStaffId })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-slate-50/90 border-t border-slate-100 grid grid-cols-4 gap-1.5 text-center text-xs font-bold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => handleIngest324009Store(store),
                  className: "py-2 px-1 rounded-xl bg-red-700 hover:bg-red-800 text-white transition flex items-center justify-center gap-1 text-[10px] shadow-2xs cursor-pointer",
                  title: "1-Click Ingest into CRM Customer Directory & Property Master",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 11 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Sync CRM" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setSelectedStoreForModal(store),
                  className: "py-2 px-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition flex items-center justify-center gap-1 text-[10px] cursor-pointer",
                  title: "Open spatial location and store details drawer",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { size: 11, className: "text-blue-600" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Verify Loc" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    navigate("/sequence-properties", { state: { searchKeyword: store.colony } });
                  },
                  className: "py-2 px-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition flex items-center justify-center gap-1 text-[10px] cursor-pointer",
                  title: "Map store into door-to-door beat delivery sequence",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 11, className: "text-indigo-600" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Map Beat" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setEditingStore(store),
                  className: "py-2 px-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition flex items-center justify-center gap-1 text-[10px] cursor-pointer",
                  title: "Edit store details, owner name, or contact number",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 11, className: "text-amber-600" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Edit Rec" })
                  ]
                }
              )
            ] })
          ]
        },
        store.id
      )) })
    ] }),
    activeTab === "csc_emitra" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5", children: filteredCsc.map((csc) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "bg-white rounded-3xl border border-slate-200 hover:border-amber-400 p-5 space-y-3",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-base", children: csc.businessName }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-600", children: [
                csc.operatorName,
                " (",
                csc.role,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-lg bg-slate-900 text-amber-300 font-mono text-xs font-bold", children: csc.beatNo })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 12, className: "inline text-red-600 mr-1" }),
            csc.housePlotNumber,
            ", ",
            csc.colony,
            " (PIN ",
            csc.pincode,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-mono text-slate-700", children: [
            "📱 ",
            csc.primaryMobile,
            " | WA: ",
            csc.whatsapp
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                notificationScannerService.ingestCscToCrm(csc);
                showToast(`Synced ${csc.businessName} to CRM!`);
              },
              className: "w-full py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add to CRM Master" })
              ]
            }
          )
        ]
      },
      csc.id
    )) }),
    activeTab === "merchants" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: merchants.map((b) => {
      var _a2;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 p-5 space-y-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-base", children: b.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-600", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 12, className: "inline text-red-600 mr-1" }),
              ((_a2 = b.address) == null ? void 0 : _a2.fullAddress) || b.area
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-mono text-emerald-700", children: [
              "📱 ",
              b.mobile
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setSelectedCustomer(b),
                className: "w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer",
                children: "View Profile"
              }
            )
          ]
        },
        b.id
      );
    }) }),
    selectedStoreForModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200", children: selectedStoreForModal.categoryTag }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black text-slate-900 mt-1", children: selectedStoreForModal.storeName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500", children: [
            "Owner: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: selectedStoreForModal.ownerName }),
            " • Pincode ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "324009" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setSelectedStoreForModal(null),
            className: "p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition",
            children: "✕"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-800", children: "Physical Address & Beat Alignment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Plot/Shop No:" }),
            " ",
            selectedStoreForModal.housePlotNumber
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Colony / Sub-Locality:" }),
            " ",
            selectedStoreForModal.colony
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Prominent Landmark:" }),
            " ",
            selectedStoreForModal.landmark
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Pincode:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold text-red-700", children: "324009 (Dadabari S.O.)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Postal Beat:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900", children: selectedStoreForModal.beatNo })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-800", children: "Contact & Staff Assignment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Primary Mobile:" }),
            " ",
            selectedStoreForModal.primaryMobile
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "WhatsApp:" }),
            " ",
            selectedStoreForModal.whatsapp
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Assigned Postman:" }),
            " ",
            selectedStoreForModal.assignedStaffName,
            " (",
            selectedStoreForModal.assignedStaffRole,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Staff Directory ID:" }),
            " ",
            selectedStoreForModal.assignedStaffId
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: "Postal Potential & Commercial Operations:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] leading-relaxed", children: selectedStoreForModal.postalPotentialRemark }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-amber-800 mt-1", children: [
            "Daily Footfall: ~",
            selectedStoreForModal.dailyFootfall,
            " | Last Ground Audit: ",
            selectedStoreForModal.lastAuditDate
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-2 border-t border-slate-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              handleIngest324009Store(selectedStoreForModal);
              setSelectedStoreForModal(null);
            },
            className: "flex-1 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Confirm & Sync to CRM Master" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setSelectedStoreForModal(null),
            className: "px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer",
            children: "Close"
          }
        )
      ] })
    ] }) }),
    editingStore && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        onSubmit: handleSaveStoreEdit,
        className: "bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200", children: "Update Store Record" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black text-slate-900 mt-1", children: "Edit Commercial Entity (PIN 324009)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setEditingStore(null),
                className: "p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition",
                children: "✕"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Store / Signboard Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: editingStore.storeName,
                  onChange: (e) => setEditingStore({ ...editingStore, storeName: e.target.value }),
                  required: true,
                  className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Owner / Proprietor" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: editingStore.ownerName,
                    onChange: (e) => setEditingStore({ ...editingStore, ownerName: e.target.value }),
                    required: true,
                    className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Primary Mobile (10-Digit)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: editingStore.primaryMobile,
                    onChange: (e) => setEditingStore({ ...editingStore, primaryMobile: e.target.value }),
                    required: true,
                    className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "WhatsApp Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: editingStore.whatsapp,
                    onChange: (e) => setEditingStore({ ...editingStore, whatsapp: e.target.value }),
                    className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Plot / Shop Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: editingStore.housePlotNumber,
                    onChange: (e) => setEditingStore({ ...editingStore, housePlotNumber: e.target.value }),
                    required: true,
                    className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Colony / Locality" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: editingStore.colony,
                    onChange: (e) => setEditingStore({ ...editingStore, colony: e.target.value }),
                    required: true,
                    className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Postal Beat" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "select",
                  {
                    value: editingStore.beatNo,
                    onChange: (e) => setEditingStore({ ...editingStore, beatNo: e.target.value }),
                    className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:outline-hidden",
                    children: ["Beat 1", "Beat 2", "Beat 3", "Beat 4", "Beat 5", "Beat 6", "Beat 7", "Beat 8", "Beat 9", "Beat 10", "Beat 33"].map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: b, children: [
                      b,
                      " (Dadabari S.O.)"
                    ] }, b))
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Prominent Landmark" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: editingStore.landmark,
                  onChange: (e) => setEditingStore({ ...editingStore, landmark: e.target.value }),
                  className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Postal Potential & Remarks" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  rows: 2,
                  value: editingStore.postalPotentialRemark,
                  onChange: (e) => setEditingStore({ ...editingStore, postalPotentialRemark: e.target.value }),
                  className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-2 border-t border-slate-100", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "submit",
                className: "flex-1 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Save Changes & Sync CRM" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setEditingStore(null),
                className: "px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer",
                children: "Cancel"
              }
            )
          ] })
        ]
      }
    ) }),
    selectedCustomer && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CustomerProfileModal,
      {
        customer: selectedCustomer,
        onClose: () => setSelectedCustomer(null)
      }
    )
  ] });
}
export {
  BusinessesView as default
};
