import { r as reactExports, b as customerService, s as staffPermissionService, ak as resolveAddressToConsolidatedBeat, j as jsxRuntimeExports, I as Sparkles, e as MapPin, P as Plus, N as Navigation, w as ShieldCheck, C as CircleCheck, X, S as Search, l as CustomerProfileModal } from "./index-u5ATSoh6.js";
import { B as BulkAddressImport } from "./BulkAddressImport-DfY70HgJ.js";
import { U as Upload } from "./upload-e0KOiXXJ.js";
import { T as Trash2 } from "./trash-2-qSHzBlPH.js";
function AddressResolutionView() {
  const [customers, setCustomers] = reactExports.useState([]);
  const [colonyMappings, setColonyMappings] = reactExports.useState([]);
  const [selectedCustomer, setSelectedCustomer] = reactExports.useState(null);
  const [showBulkImport, setShowBulkImport] = reactExports.useState(false);
  const [activeMainTab, setActiveMainTab] = reactExports.useState("COLONY_ENGINE");
  const [resolutionFilter, setResolutionFilter] = reactExports.useState("All");
  const [showAddColonyModal, setShowAddColonyModal] = reactExports.useState(false);
  const [colonyName, setColonyName] = reactExports.useState("");
  const [sectorOrPhase, setSectorOrPhase] = reactExports.useState("");
  const [landmark, setLandmark] = reactExports.useState("");
  const [areaPincode, setAreaPincode] = reactExports.useState("324009");
  const [subOrHeadOffice, setSubOrHeadOffice] = reactExports.useState("Dadabari SO");
  const [branchOffice, setBranchOffice] = reactExports.useState("");
  const [assignedBeatNumber, setAssignedBeatNumber] = reactExports.useState("Beat 2");
  const [assignedPostmanName, setAssignedPostmanName] = reactExports.useState("Mahendra Kumar Meena");
  const [assignedPostmanMobile, setAssignedPostmanMobile] = reactExports.useState("8769706002");
  const [bannerNotice, setBannerNotice] = reactExports.useState(null);
  const [lookupColony, setLookupColony] = reactExports.useState("Keshavpura");
  const [lookupSector, setLookupSector] = reactExports.useState("Sector 7");
  const [lookupPincode, setLookupPincode] = reactExports.useState("324009");
  const [searchMappingTerm, setSearchMappingTerm] = reactExports.useState("");
  const refreshAll = () => {
    setCustomers([...customerService.getCustomers()]);
    setColonyMappings([...staffPermissionService.getColonyBeatMappings()]);
  };
  reactExports.useEffect(() => {
    refreshAll();
    const unsubCust = customerService.subscribe(refreshAll);
    const unsubStaff = staffPermissionService.subscribe(refreshAll);
    return () => {
      unsubCust();
      unsubStaff();
    };
  }, []);
  const liveResolvedRoute = reactExports.useMemo(() => {
    if (!lookupColony.trim() && !lookupSector.trim()) return null;
    const consolidatedMatch = resolveAddressToConsolidatedBeat(`${lookupColony} ${lookupSector}`, lookupPincode);
    if (consolidatedMatch) {
      return {
        id: consolidatedMatch.id,
        colonyName: consolidatedMatch.coloniesFormatted,
        sectorNumber: consolidatedMatch.sectorsFormatted,
        sectorOrPhase: consolidatedMatch.sectorsFormatted,
        landmark: consolidatedMatch.landmarksFormatted,
        pincode: consolidatedMatch.pincode,
        areaPincode: consolidatedMatch.pincode,
        subOrHoOffice: consolidatedMatch.officeName,
        subOrHeadOffice: consolidatedMatch.officeName,
        branchOffice: "",
        beatNumber: consolidatedMatch.beatNumber,
        assignedBeatNumber: consolidatedMatch.beatNumber,
        assignedPostmanName: consolidatedMatch.assignedPostmanName,
        assignedPostmanContact: consolidatedMatch.assignedPostmanContact,
        assignedPostmanMobile: consolidatedMatch.assignedPostmanContact,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    return staffPermissionService.resolveColonyBeat(lookupColony, lookupSector, lookupPincode);
  }, [lookupColony, lookupSector, lookupPincode, colonyMappings]);
  const filteredMappings = reactExports.useMemo(() => {
    if (!searchMappingTerm.trim()) return colonyMappings;
    const q = searchMappingTerm.toLowerCase();
    return colonyMappings.filter(
      (m) => m.colonyName.toLowerCase().includes(q) || (m.sectorOrPhase || "").toLowerCase().includes(q) || (m.landmark || "").toLowerCase().includes(q) || m.areaPincode.includes(q) || m.subOrHeadOffice.toLowerCase().includes(q) || m.assignedBeatNumber.toLowerCase().includes(q) || (m.assignedPostmanName || "").toLowerCase().includes(q)
    );
  }, [colonyMappings, searchMappingTerm]);
  const addressIssues = reactExports.useMemo(() => {
    return (customers == null ? void 0 : customers.filter((c) => {
      var _a, _b, _c, _d;
      const isShifted = ((_a = c.remarks) == null ? void 0 : _a.toLowerCase().includes("left")) || ((_b = c.remarks) == null ? void 0 : _b.toLowerCase().includes("moved")) || ((_c = c.remarks) == null ? void 0 : _c.toLowerCase().includes("naya gaon"));
      const isMissingHouse = !c.houseNo && !((_d = c.address) == null ? void 0 : _d.houseNumber);
      const isUnresolvedSector = !c.sector || c.sector === "Keshavpura";
      if (resolutionFilter === "Shifted") return isShifted;
      if (resolutionFilter === "MissingHouseNo") return isMissingHouse;
      if (resolutionFilter === "UnresolvedSector") return isUnresolvedSector;
      return isShifted || isMissingHouse || isUnresolvedSector;
    })) || [];
  }, [customers, resolutionFilter]);
  const handleSaveColonyMapping = (e) => {
    e.preventDefault();
    if (!colonyName.trim() || !assignedBeatNumber.trim()) return;
    const saved = staffPermissionService.addOrUpdateColonyMapping({
      colonyName: colonyName.trim(),
      sectorOrPhase: sectorOrPhase.trim() || void 0,
      landmark: landmark.trim() || void 0,
      areaPincode: areaPincode.trim() || "324009",
      subOrHeadOffice: subOrHeadOffice.trim() || "Dadabari SO",
      branchOffice: branchOffice.trim() || void 0,
      assignedBeatNumber: assignedBeatNumber.trim(),
      assignedPostmanName: assignedPostmanName.trim() || void 0,
      assignedPostmanMobile: assignedPostmanMobile.trim() || void 0
    });
    setBannerNotice(
      `Colony-Beat Mapping Saved: "${saved.colonyName}${saved.sectorOrPhase ? ` (${saved.sectorOrPhase})` : ""}" → ${saved.assignedBeatNumber} (${saved.subOrHeadOffice} - ${saved.areaPincode})`
    );
    setShowAddColonyModal(false);
    setColonyName("");
    setSectorOrPhase("");
    setLandmark("");
    refreshAll();
    setTimeout(() => setBannerNotice(null), 5e3);
  };
  const handleDeleteMapping = (id) => {
    staffPermissionService.deleteColonyMapping(id);
    refreshAll();
  };
  const handleResolveStandardAddress = (c, mapping) => {
    var _a, _b;
    const resolvedSector = (mapping == null ? void 0 : mapping.sectorOrPhase) || c.sector || "Sector 7";
    const resolvedColony = (mapping == null ? void 0 : mapping.colonyName) || c.area || "Keshavpura";
    const resolvedBeat = ((mapping == null ? void 0 : mapping.assignedBeatNumber) || "Beat 2").replace(/^Beat\s+/i, "");
    const resolvedPin = (mapping == null ? void 0 : mapping.areaPincode) || "324009";
    const resolvedOffice = (mapping == null ? void 0 : mapping.subOrHeadOffice) || "Dadabari SO";
    const updated = {
      ...c,
      sector: resolvedSector,
      area: resolvedColony,
      beatNo: resolvedBeat,
      verificationStatus: "Field Confirmed",
      address: {
        ...c.address,
        houseNumber: c.houseNo || ((_a = c.address) == null ? void 0 : _a.houseNumber) || "Plot Unit",
        sectorLocality: resolvedSector,
        area: resolvedColony,
        landmark: (mapping == null ? void 0 : mapping.landmark) || ((_b = c.address) == null ? void 0 : _b.landmark) || "",
        pincode: resolvedPin,
        fullAddress: `${c.houseNo || "H.No"}, ${resolvedSector}, ${resolvedColony}${(mapping == null ? void 0 : mapping.landmark) ? ` (Near ${mapping.landmark})` : ""}, ${resolvedOffice} - ${resolvedPin}`
      }
    };
    customerService.addOrUpdateCustomer(updated, "Colony-Beat Mapping Standardization Engine");
    setBannerNotice(
      `Customer "${c.name}" automatically mapped to ${resolvedColony} (${resolvedSector}) → Beat ${resolvedBeat} (${resolvedOffice} - ${resolvedPin})!`
    );
    setTimeout(() => setBannerNotice(null), 4e3);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", id: "address-resolution-view-root", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-red-800/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wider mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 13 }),
            " Structured Address & Delivery Route Intelligence"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-2xl font-black flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 26, className: "text-amber-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Enhanced Address & Colony-Beat Mapping Engine" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-300 mt-1 max-w-3xl", children: "Automatically map specific Colonies, Sectors/Phases, and Landmarks to assigned Beats, Pincodes, and Sub/Head Offices for instant customer lookups, delivery routing, and follow-up assignment." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setShowAddColonyModal(true),
              className: "px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add Colony-Beat Mapping" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setShowBulkImport(true),
              className: "px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 15 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Bulk Address Import" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setActiveMainTab("COLONY_ENGINE"),
            className: `px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${activeMainTab === "COLONY_ENGINE" ? "bg-red-600 text-white shadow-md" : "bg-white/10 text-slate-300 hover:bg-white/15"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { size: 14 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "1. Colony-Sector-Beat Mapping Directory (",
                colonyMappings.length,
                ")"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setActiveMainTab("RESOLUTION_WORKBENCH"),
            className: `px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${activeMainTab === "RESOLUTION_WORKBENCH" ? "bg-red-600 text-white shadow-md" : "bg-white/10 text-slate-300 hover:bg-white/15"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 14 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "2. Customer Address Standardization Workbench (",
                addressIssues.length,
                ")"
              ] })
            ]
          }
        )
      ] })
    ] }),
    bannerNotice && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-emerald-50 border border-emerald-300 text-emerald-900 px-5 py-3.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, className: "text-emerald-600 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: bannerNotice })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setBannerNotice(null), className: "text-emerald-700 hover:text-emerald-950", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 }) })
    ] }),
    activeMainTab === "COLONY_ENGINE" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-black text-slate-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { size: 16, className: "text-red-700" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Instant Colony / Sector → Beat & Postman Route Resolver" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Type any Colony Name, Sector/Phase, or Pincode to test automatic Beat & Delivery Office routing" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "Colony / Area Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: lookupColony,
                onChange: (e) => setLookupColony(e.target.value),
                placeholder: "e.g. Keshavpura, Patel Nagar",
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-slate-50"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "Sector Number / Phase" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: lookupSector,
                onChange: (e) => setLookupSector(e.target.value),
                placeholder: "e.g. Sector 7, Sector 4, Phase 1",
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-slate-50"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "Area Pincode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                value: lookupPincode,
                onChange: (e) => setLookupPincode(e.target.value),
                placeholder: "324009",
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-semibold bg-slate-50"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-2xl p-3.5 text-xs", children: liveResolvedRoute ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-red-800 text-sm", children: liveResolvedRoute.assignedBeatNumber }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]", children: [
                "PIN ",
                liveResolvedRoute.areaPincode
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-slate-900 mt-1", children: [
              "Office: ",
              liveResolvedRoute.subOrHeadOffice,
              liveResolvedRoute.branchOffice ? ` (${liveResolvedRoute.branchOffice})` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-600 mt-0.5", children: [
              "Postman: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: liveResolvedRoute.assignedPostmanName || "Beat Staff" }),
              " ",
              liveResolvedRoute.assignedPostmanMobile ? `(${liveResolvedRoute.assignedPostmanMobile})` : ""
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-500 py-2", children: [
            "No matching Colony-Beat rule found. Click ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Add Colony-Beat Mapping" }),
            " to register."
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-black text-slate-900", children: [
              "Structured Colony, Sector & Beat Mapping Matrix (",
              filteredMappings.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-500", children: "Every staff member entry and manual mapping automatically updates this routing table" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-72", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: searchMappingTerm,
                onChange: (e) => setSearchMappingTerm(e.target.value),
                placeholder: "Search colony, sector, landmark, beat...",
                className: "w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-slate-100/80 text-slate-600 uppercase text-[11px] border-b border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3.5", children: "Colony Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3.5", children: "Sector / Phase" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3.5", children: "Landmark" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3.5", children: "Area Pincode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3.5", children: "Sub Office / HO Mapping" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3.5", children: "Assigned Beat No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3.5", children: "Assigned Postman / Staff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3.5 text-right", children: "Action" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-100", children: filteredMappings.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-slate-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3.5 font-bold text-slate-900", children: m.colonyName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3.5", children: m.sectorOrPhase ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded font-semibold", children: m.sectorOrPhase }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400", children: "Main / All" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3.5 text-slate-600", children: m.landmark || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3.5 font-mono font-bold text-slate-900", children: m.areaPincode }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-800", children: m.subOrHeadOffice }),
              m.branchOffice && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-[10px] text-amber-800 font-bold", children: [
                "BO: ",
                m.branchOffice
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg font-mono font-black", children: m.assignedBeatNumber }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-slate-900", children: m.assignedPostmanName || "Beat Staff" }),
              m.assignedPostmanMobile && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-mono text-emerald-700", children: m.assignedPostmanMobile })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleDeleteMapping(m.id),
                className: "p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition",
                title: "Remove Mapping",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
              }
            ) })
          ] }, m.id)) })
        ] }) })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 text-xs font-semibold overflow-x-auto pb-1", children: [
        { id: "All", label: "All Ambiguous Addresses" },
        { id: "Shifted", label: "Shifted / Relocated Residents" },
        { id: "MissingHouseNo", label: "Missing House / KH Number" },
        { id: "UnresolvedSector", label: "Sector Ambiguities" }
      ].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setResolutionFilter(tab.id),
          className: `px-4 py-2 rounded-xl transition whitespace-nowrap ${resolutionFilter === tab.id ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"}`,
          children: tab.label
        },
        tab.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs text-left text-slate-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-[11px] text-slate-600 uppercase bg-slate-100/80 border-b border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Master ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Raw Address in Master" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Field Remarks / Anomaly" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Auto-Resolved Colony-Beat Route" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-100", children: addressIssues.map((c) => {
          var _a, _b, _c, _d, _e;
          const isShifted = ((_a = c.remarks) == null ? void 0 : _a.toLowerCase().includes("left")) || ((_b = c.remarks) == null ? void 0 : _b.toLowerCase().includes("moved")) || ((_c = c.remarks) == null ? void 0 : _c.toLowerCase().includes("naya gaon"));
          const matchedRoute = staffPermissionService.resolveColonyBeat(
            c.area || "Keshavpura",
            c.sector || "Sector 7",
            ((_d = c.address) == null ? void 0 : _d.pincode) || "324009"
          );
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-slate-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono font-bold text-slate-900", children: c.masterId || c.id }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-semibold text-slate-900", children: c.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-slate-600", children: ((_e = c.address) == null ? void 0 : _e.fullAddress) || `${c.houseNo || "No House No"}, ${c.sector || c.area || ""}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `p-2 rounded-lg text-[11px] font-medium ${isShifted ? "bg-amber-50 text-amber-900 border border-amber-200" : "bg-slate-100 text-slate-700"}`,
                children: c.remarks || "Incomplete sector details"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: matchedRoute ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-red-700", children: [
                matchedRoute.assignedBeatNumber,
                " • ",
                matchedRoute.subOrHeadOffice,
                " (",
                matchedRoute.areaPincode,
                ")"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-slate-500", children: [
                matchedRoute.colonyName,
                " ",
                matchedRoute.sectorOrPhase || "",
                " • Postman:",
                " ",
                matchedRoute.assignedPostmanName || "Assigned"
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-900", children: isShifted ? "Tag as Relocated" : "Map to Sector 7, Beat 2 (Dadabari SO)" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleResolveStandardAddress(c, matchedRoute),
                className: "px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition",
                children: "Auto-Standardize"
              }
            ) })
          ] }, c.id);
        }) })
      ] }) }) })
    ] }),
    showAddColonyModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 bg-gradient-to-r from-red-800 to-slate-900 text-white flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black", children: "Add Structured Colony-Beat Mapping" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-100", children: "Map Colony, Sector/Phase, Landmark & Pincode to Sub/Head Office and Beat Number" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowAddColonyModal(false),
            className: "p-2 rounded-full hover:bg-white/10 text-white",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSaveColonyMapping, className: "p-5 space-y-4 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Colony Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                required: true,
                placeholder: "e.g. Keshavpura / Mahaveer Nagar",
                value: colonyName,
                onChange: (e) => setColonyName(e.target.value),
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Sector Number / Phase (if available)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                placeholder: "e.g. Sector 7 / Phase II",
                value: sectorOrPhase,
                onChange: (e) => setSectorOrPhase(e.target.value),
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Prominent Landmark" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                placeholder: "e.g. Near Tejaji Mandir / Modi College",
                value: landmark,
                onChange: (e) => setLandmark(e.target.value),
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Area Pincode *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                required: true,
                placeholder: "324009",
                value: areaPincode,
                onChange: (e) => setAreaPincode(e.target.value),
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Sub Office / HO Mapping *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                required: true,
                placeholder: "Dadabari SO",
                value: subOrHeadOffice,
                onChange: (e) => setSubOrHeadOffice(e.target.value),
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Branch Office (BO - optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                placeholder: "e.g. Branch Office Name",
                value: branchOffice,
                onChange: (e) => setBranchOffice(e.target.value),
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Assigned Beat Number *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                required: true,
                placeholder: "Beat 2",
                value: assignedBeatNumber,
                onChange: (e) => setAssignedBeatNumber(e.target.value),
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-red-700"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Assigned Postman / Staff Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                placeholder: "Mahendra Kumar Meena",
                value: assignedPostmanName,
                onChange: (e) => setAssignedPostmanName(e.target.value),
                className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Official Mobile Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                placeholder: "8769706002",
                value: assignedPostmanMobile,
                onChange: (e) => setAssignedPostmanMobile(e.target.value),
                className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-3 border-t border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowAddColonyModal(false),
              className: "px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black shadow-md",
              children: "Save Colony-Beat Route"
            }
          )
        ] })
      ] })
    ] }) }),
    selectedCustomer && /* @__PURE__ */ jsxRuntimeExports.jsx(CustomerProfileModal, { customer: selectedCustomer, onClose: () => setSelectedCustomer(null) }),
    showBulkImport && /* @__PURE__ */ jsxRuntimeExports.jsx(BulkAddressImport, { onClose: () => setShowBulkImport(false) })
  ] });
}
export {
  AddressResolutionView as default
};
