import { u as useAuth, s as staffPermissionService, r as reactExports, j as jsxRuntimeExports, I as Sparkles, p as Building, au as Link, U as Users, P as Plus, C as CircleCheck, X, y as Funnel, x as RefreshCw, S as Search, Z as utils, _ as writeFileSync } from "./index-u5ATSoh6.js";
import { D as Download } from "./download-wQvq84jM.js";
function OfficeMasterView() {
  const { userProfile } = useAuth();
  const isSuperAdmin = staffPermissionService.isSuperAdmin(userProfile);
  const [offices, setOffices] = reactExports.useState([]);
  const [staffProfiles, setStaffProfiles] = reactExports.useState([]);
  const [selectedOffice, setSelectedOffice] = reactExports.useState(null);
  const [filterCircle, setFilterCircle] = reactExports.useState("ALL");
  const [filterDivision, setFilterDivision] = reactExports.useState("ALL");
  const [filterOfficeType, setFilterOfficeType] = reactExports.useState("ALL");
  const [filterPincode, setFilterPincode] = reactExports.useState("");
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [showAddOfficeModal, setShowAddOfficeModal] = reactExports.useState(false);
  const [newCircle, setNewCircle] = reactExports.useState("Rajasthan Circle");
  const [newDivision, setNewDivision] = reactExports.useState("Kota Division");
  const [newHoName, setNewHoName] = reactExports.useState("Kota Head Post Office (HO)");
  const [newSoName, setNewSoName] = reactExports.useState("");
  const [newBoName, setNewBoName] = reactExports.useState("");
  const [newOfficeType, setNewOfficeType] = reactExports.useState("SO");
  const [newPincode, setNewPincode] = reactExports.useState("324009");
  const [newAddress, setNewAddress] = reactExports.useState("");
  const [newBeats, setNewBeats] = reactExports.useState("Beat 1, Beat 2");
  const [newColonies, setNewColonies] = reactExports.useState("");
  const [newInchargeName, setNewInchargeName] = reactExports.useState("");
  const [newInchargeEmpId, setNewInchargeEmpId] = reactExports.useState("");
  const [newInchargeMobile, setNewInchargeMobile] = reactExports.useState("");
  const [newInchargeDesig, setNewInchargeDesig] = reactExports.useState("Sub Postmaster (SPM)");
  const [bannerMessage, setBannerMessage] = reactExports.useState(null);
  const refreshData = () => {
    setOffices([...staffPermissionService.getDynamicOffices()]);
    setStaffProfiles([...staffPermissionService.getAllStaffProfiles()]);
  };
  reactExports.useEffect(() => {
    refreshData();
    const unsub = staffPermissionService.subscribe(refreshData);
    return () => unsub();
  }, []);
  const hierarchy = reactExports.useMemo(
    () => staffPermissionService.getHierarchyOptions(),
    [offices, staffProfiles]
  );
  const filteredOffices = reactExports.useMemo(() => {
    return offices.filter((o) => {
      var _a;
      if (!isSuperAdmin && userProfile) {
        const allowedOffices = ((_a = userProfile.permissions) == null ? void 0 : _a.allowedOffices) || ["ALL"];
        if (!allowedOffices.includes("ALL")) {
          const matchesAllowed = allowedOffices.some(
            (ao) => o.officeName.toLowerCase().includes(ao.toLowerCase()) || o.soName.toLowerCase().includes(ao.toLowerCase()) || o.boName && o.boName.toLowerCase().includes(ao.toLowerCase())
          );
          if (!matchesAllowed && o.pincode !== userProfile.officePincode) {
            return false;
          }
        }
      }
      if (filterCircle !== "ALL" && o.circle !== filterCircle) return false;
      if (filterDivision !== "ALL" && o.division !== filterDivision) return false;
      if (filterOfficeType !== "ALL" && o.officeType !== filterOfficeType) return false;
      if (filterPincode.trim() && !o.pincode.includes(filterPincode.trim())) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = o.officeName.toLowerCase().includes(q);
        const matchHo = o.hoName.toLowerCase().includes(q);
        const matchSo = o.soName.toLowerCase().includes(q);
        const matchBo = (o.boName || "").toLowerCase().includes(q);
        const matchPin = o.pincode.includes(q);
        const matchAddr = o.completeAddress.toLowerCase().includes(q);
        const matchBeat = o.mappedBeats.some((b) => b.toLowerCase().includes(q));
        const matchColony = o.mappedColonies.some((c) => c.toLowerCase().includes(q));
        if (!matchName && !matchHo && !matchSo && !matchBo && !matchPin && !matchAddr && !matchBeat && !matchColony) {
          return false;
        }
      }
      return true;
    });
  }, [offices, isSuperAdmin, userProfile, filterCircle, filterDivision, filterOfficeType, filterPincode, searchTerm]);
  const handleExportOffices = () => {
    const rows = filteredOffices.map((o) => ({
      "Office ID": o.id,
      "Office Name": o.officeName,
      "Office Type": o.officeType,
      Circle: o.circle,
      Division: o.division,
      "Head Office (HO)": o.hoName,
      "Sub Office (SO)": o.soName,
      "Branch Office (BO)": o.boName || "N/A",
      Pincode: o.pincode,
      "Complete Office Address": o.completeAddress,
      "Mapped Beats": o.mappedBeats.join(", "),
      "Mapped Colonies & Sectors": o.mappedColonies.join(", "),
      "Assigned Staff Count": o.staffCount,
      "Last Synced": new Date(o.updatedAt).toLocaleString("en-IN")
    }));
    const ws = utils.json_to_sheet(rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "AutoManaged_Offices");
    writeFileSync(wb, `IndiaPost_AutoManaged_Offices_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`);
  };
  const handleCreateOfficeViaStaffEntry = (e) => {
    e.preventDefault();
    const targetOfficeName = newOfficeType === "BO" ? newBoName.trim() || "New Branch Post Office (BO)" : newOfficeType === "HO" ? newHoName.trim() : newSoName.trim() || "New Sub Post Office (SO)";
    const beatsArr = newBeats.split(",").map((b) => b.trim()).filter(Boolean);
    const coloniesArr = newColonies.split(",").map((c) => c.trim()).filter(Boolean);
    staffPermissionService.upsertStaffAndSyncEntities({
      name: newInchargeName.trim() || `Postmaster (${targetOfficeName})`,
      contact: newInchargeMobile.trim() || "9414000000",
      employeeId: newInchargeEmpId.trim() || `EMP-${Date.now().toString().slice(-6)}`,
      designation: newInchargeDesig,
      circle: newCircle.trim() || "Rajasthan Circle",
      division: newDivision.trim() || "Kota Division",
      headOffice: newHoName.trim() || "Kota Head Post Office (HO)",
      subOffice: newSoName.trim() || targetOfficeName,
      branchOffice: newOfficeType === "BO" ? newBoName.trim() || targetOfficeName : void 0,
      officePincode: newPincode.trim() || "324009",
      completeOfficeAddress: newAddress.trim() || `${targetOfficeName}, ${newDivision}, ${newCircle} - ${newPincode}`,
      assignedOffice: `${targetOfficeName} (${newPincode})`,
      beat: beatsArr[0] || "Beat 1",
      assignedBeats: beatsArr.length ? beatsArr : ["Beat 1"],
      deliveryOfficeMappings: [targetOfficeName],
      assignedColonies: coloniesArr.length ? coloniesArr : [targetOfficeName]
    });
    setBannerMessage(
      `Auto-Managed Office "${targetOfficeName} (${newPincode})" & Beat/Colony Mappings dynamically generated!`
    );
    setShowAddOfficeModal(false);
    setNewSoName("");
    setNewBoName("");
    setNewAddress("");
    setNewColonies("");
    setNewInchargeName("");
    setNewInchargeEmpId("");
    setNewInchargeMobile("");
    refreshData();
    setTimeout(() => setBannerMessage(null), 5e3);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", id: "office-master-view-root", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-red-800/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wider mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 13 }),
            " Zero Pre-Entry Architecture • Auto-Synced from Staff Submissions"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-2xl font-black tracking-tight flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { size: 26, className: "text-amber-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Auto-Managed Office & Territory Master Engine" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-300 mt-1 max-w-3xl", children: "Offices (Circle → Division → HO → SO → BO), Pincodes, Beats, and Colony Mappings are dynamically created, grouped, and updated live from Staff Directory entries without manual database pre-population." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleExportOffices,
              className: "px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 15, className: "text-amber-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Export Offices (",
                  filteredOffices.length,
                  ")"
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/staff-master",
              className: "px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 15 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Direct Staff & Office Form" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setShowAddOfficeModal(true),
              className: "px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 15 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Register New Office + Staff" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/5 border border-white/10 rounded-2xl p-3.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-400 font-semibold", children: "Total Auto-Grouped Offices" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-white mt-0.5", children: offices.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-amber-300 mt-0.5", children: "HO / SO / BO Hierarchy" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/5 border border-white/10 rounded-2xl p-3.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-400 font-semibold", children: "Sub & Head Offices (HO/SO)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-emerald-400 mt-0.5", children: offices.filter((o) => o.officeType === "HO" || o.officeType === "SO").length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-300 mt-0.5", children: "Urban & Delivery Hubs" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/5 border border-white/10 rounded-2xl p-3.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-400 font-semibold", children: "Branch Offices (Rural BO)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-amber-400 mt-0.5", children: offices.filter((o) => o.officeType === "BO").length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-300 mt-0.5", children: "GDS BPM / ABPM Mapped" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/5 border border-white/10 rounded-2xl p-3.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-400 font-semibold", children: "Active Pincodes Covered" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-sky-400 mt-0.5", children: new Set(offices.map((o) => o.pincode)).size }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-300 mt-0.5", children: "Live Territory Indexing" })
        ] })
      ] })
    ] }),
    bannerMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-emerald-50 border border-emerald-300 text-emerald-900 px-5 py-3.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, className: "text-emerald-600 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: bannerMessage })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setBannerMessage(null), className: "text-emerald-700 hover:text-emerald-950", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { size: 15, className: "text-red-700" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Hierarchical Office & Territory Drill-Down Filter" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setFilterCircle("ALL");
              setFilterDivision("ALL");
              setFilterOfficeType("ALL");
              setFilterPincode("");
              setSearchTerm("");
            },
            className: "text-xs font-bold text-red-700 hover:underline flex items-center gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 12 }),
              " Reset Filters"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "1. Circle" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: filterCircle,
              onChange: (e) => setFilterCircle(e.target.value),
              className: "w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: "ALL", children: [
                  "All Circles (",
                  hierarchy.circles.length,
                  ")"
                ] }),
                hierarchy.circles.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, children: c }, c))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "2. Division" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: filterDivision,
              onChange: (e) => setFilterDivision(e.target.value),
              className: "w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: "ALL", children: [
                  "All Divisions (",
                  hierarchy.divisions.length,
                  ")"
                ] }),
                hierarchy.divisions.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: d, children: d }, d))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "3. Office Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: filterOfficeType,
              onChange: (e) => setFilterOfficeType(e.target.value),
              className: "w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All (HO / SO / BO)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "HO", children: "Head Post Office (HO)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "SO", children: "Sub Post Office (SO)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "BO", children: "Branch Post Office (BO)" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "4. Office Pincode" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "e.g. 324009",
              value: filterPincode,
              onChange: (e) => setFilterPincode(e.target.value),
              className: "w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-mono font-semibold text-slate-800"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "5. Search Office / Beat / Colony" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "Dadabari, Beat 2, Keshavpura...",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: "w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-bold text-slate-800", children: [
          "Showing ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-700 font-black", children: filteredOffices.length }),
          " Auto-Managed Post Offices"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-500", children: "Click any office row to inspect mapped staff, beats, and colonies" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-slate-100/90 text-slate-600 uppercase text-[11px] border-b border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3.5", children: "Office Name & Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3.5", children: "Circle & Division" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3.5", children: "HO / SO / BO Hierarchy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3.5", children: "Pincode & Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3.5", children: "Mapped Beats" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3.5", children: "Colonies / Areas" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3.5 text-center", children: "Staff" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-100", children: filteredOffices.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            onClick: () => setSelectedOffice(o),
            className: "hover:bg-red-50/40 cursor-pointer transition",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `px-2 py-0.5 rounded-md font-black text-[10px] ${o.officeType === "HO" ? "bg-red-100 text-red-800 border border-red-200" : o.officeType === "SO" ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-amber-100 text-amber-900 border border-amber-200"}`,
                    children: o.officeType
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900", children: o.officeName })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-slate-800", children: o.division }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-500", children: o.circle })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3.5 text-slate-600", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-slate-800", children: [
                  "HO: ",
                  o.hoName
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px]", children: [
                  "SO: ",
                  o.soName,
                  " ",
                  o.boName ? `→ BO: ${o.boName}` : ""
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100", children: o.pincode }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-500 mt-1 max-w-xs truncate", title: o.completeAddress, children: o.completeAddress })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1", children: [
                o.mappedBeats.length > 0 ? o.mappedBeats.slice(0, 3).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "px-2 py-0.5 bg-slate-100 text-slate-800 font-semibold rounded text-[10px]",
                    children: b
                  },
                  b
                )) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 text-[11px]", children: "General Office" }),
                o.mappedBeats.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-slate-500", children: [
                  "+",
                  o.mappedBeats.length - 3
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1 max-w-xs", children: [
                o.mappedColonies.slice(0, 3).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-medium",
                    children: c
                  },
                  c
                )),
                o.mappedColonies.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-slate-500", children: [
                  "+",
                  o.mappedColonies.length - 3,
                  " more"
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3.5 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-900 text-white font-bold text-xs", children: o.staffCount }) })
            ]
          },
          o.id
        )) })
      ] }) })
    ] }),
    selectedOffice && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 bg-gradient-to-r from-slate-900 to-red-900 text-white flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-400 text-slate-950", children: [
            selectedOffice.officeType,
            " • PIN ",
            selectedOffice.pincode
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black mt-1", children: selectedOffice.officeName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-300", children: selectedOffice.completeAddress })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSelectedOffice(null),
            className: "p-2 rounded-full hover:bg-white/10 text-white",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 overflow-y-auto space-y-4 text-xs flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 block text-[10px] uppercase font-bold", children: "Circle" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900", children: selectedOffice.circle })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 block text-[10px] uppercase font-bold", children: "Division" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900", children: selectedOffice.division })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 block text-[10px] uppercase font-bold", children: "Head Office (HO)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900", children: selectedOffice.hoName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 block text-[10px] uppercase font-bold", children: "Sub Office (SO)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900", children: selectedOffice.soName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 block text-[10px] uppercase font-bold", children: "Branch Office (BO)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900", children: selectedOffice.boName || "Direct SO/HO Delivery" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 block text-[10px] uppercase font-bold", children: "Mapped Staff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-black text-red-700", children: [
              selectedOffice.staffCount,
              " Active Officials"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-bold text-slate-800 mb-2", children: [
            "Mapped Delivery Beats (",
            selectedOffice.mappedBeats.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: selectedOffice.mappedBeats.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "px-3 py-1 bg-red-50 text-red-800 border border-red-200 rounded-xl font-bold text-xs",
              children: b
            },
            b
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-bold text-slate-800 mb-2", children: [
            "Mapped Colonies & Sectors (",
            selectedOffice.mappedColonies.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: selectedOffice.mappedColonies.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-semibold text-xs",
              children: c
            },
            c
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-slate-800 mb-2", children: "Assigned Staff Members in this Office" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden", children: staffProfiles.filter((sp) => selectedOffice.assignedStaffIds.includes(sp.id) || sp.subOffice === selectedOffice.officeName).map((sp) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 flex items-center justify-between bg-white hover:bg-slate-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900", children: sp.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-500", children: [
                sp.designation,
                " • ID: ",
                sp.employeeId,
                " • Beat: ",
                sp.beat
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-blue-700 font-semibold", children: sp.contact })
          ] }, sp.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-slate-50 border-t border-slate-200 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSelectedOffice(null),
          className: "px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold",
          children: "Close"
        }
      ) })
    ] }) }),
    showAddOfficeModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 bg-gradient-to-r from-red-800 to-slate-900 text-white flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black", children: "Auto-Generate Office & Beat via Staff Entry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-100", children: "Submitting this form automatically creates/updates the Office, Beat, and Colony mappings" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowAddOfficeModal(false),
            className: "p-2 rounded-full hover:bg-white/10 text-white",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateOfficeViaStaffEntry, className: "p-5 overflow-y-auto space-y-4 text-xs flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Circle *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                required: true,
                value: newCircle,
                onChange: (e) => setNewCircle(e.target.value),
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Division *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                required: true,
                value: newDivision,
                onChange: (e) => setNewDivision(e.target.value),
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Office Category *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: newOfficeType,
                onChange: (e) => setNewOfficeType(e.target.value),
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl font-bold",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "HO", children: "Head Post Office (HO)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "SO", children: "Sub Post Office (SO)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "BO", children: "Branch Post Office (BO)" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Head Office (HO) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                required: true,
                value: newHoName,
                onChange: (e) => setNewHoName(e.target.value),
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Sub Office (SO) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                required: true,
                placeholder: "e.g. Dadabari SO",
                value: newSoName,
                onChange: (e) => setNewSoName(e.target.value),
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Branch Office (BO - if any)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                placeholder: "e.g. Branch Office Name",
                value: newBoName,
                onChange: (e) => setNewBoName(e.target.value),
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Office Pincode *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                required: true,
                value: newPincode,
                onChange: (e) => setNewPincode(e.target.value),
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Complete Office Address *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                required: true,
                placeholder: "Full street/sector address of Post Office",
                value: newAddress,
                onChange: (e) => setNewAddress(e.target.value),
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Assigned Beats (comma-separated) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                required: true,
                placeholder: "Beat 1, Beat 2, Beat 3",
                value: newBeats,
                onChange: (e) => setNewBeats(e.target.value),
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Assigned Colonies / Sectors *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                required: true,
                placeholder: "Keshavpura Sector 7, Patel Nagar",
                value: newColonies,
                onChange: (e) => setNewColonies(e.target.value),
                className: "w-full px-3 py-2 border border-slate-300 rounded-xl"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-800", children: "Primary In-Charge / Assigned Staff Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                required: true,
                placeholder: "Staff Full Name *",
                value: newInchargeName,
                onChange: (e) => setNewInchargeName(e.target.value),
                className: "px-3 py-2 bg-white border border-slate-300 rounded-xl"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                required: true,
                placeholder: "Employee ID (e.g. CSI-100941) *",
                value: newInchargeEmpId,
                onChange: (e) => setNewInchargeEmpId(e.target.value),
                className: "px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                required: true,
                placeholder: "Mobile Number *",
                value: newInchargeMobile,
                onChange: (e) => setNewInchargeMobile(e.target.value),
                className: "px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: newInchargeDesig,
                onChange: (e) => setNewInchargeDesig(e.target.value),
                className: "px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Sub Postmaster (SPM)", children: "Sub Postmaster (SPM)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PA (Postal Assistant)", children: "PA (Postal Assistant)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Postman", children: "Postman" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "GDS (BPM / ABPM / Dak Sevak)", children: "GDS (BPM / ABPM / Dak Sevak)" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-3 border-t border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowAddOfficeModal(false),
              className: "px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black shadow-md",
              children: "Save & Auto-Sync Office + Beats"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
export {
  OfficeMasterView as default
};
