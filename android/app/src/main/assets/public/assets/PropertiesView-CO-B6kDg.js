import { c as createLucideIcon, r as reactExports, b as customerService, j as jsxRuntimeExports, B as Building2, H as House, p as Building, q as SequenceWisePropertyHub, C as CircleCheck, S as Search, P as Plus, t as ShieldAlert, e as MapPin, l as CustomerProfileModal } from "./index-u5ATSoh6.js";
import UnifiedPropertyFamilyHub from "./UnifiedPropertyFamilyHub-D8ndtf4V.js";
import { T as Trash2 } from "./trash-2-qSHzBlPH.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "17", x2: "22", y1: "8", y2: "13", key: "3nzzx3" }],
  ["line", { x1: "22", x2: "17", y1: "8", y2: "13", key: "1swrse" }]
];
const UserX = createLucideIcon("user-x", __iconNode);
function PropertiesView() {
  var _a, _b;
  const [activeViewTab, setActiveViewTab] = reactExports.useState("sequence");
  const [properties, setProperties] = reactExports.useState([]);
  const [search, setSearch] = reactExports.useState("");
  const [filterType, setFilterType] = reactExports.useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = reactExports.useState(false);
  const [selectedProperty, setSelectedProperty] = reactExports.useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = reactExports.useState(false);
  const [selectedCustomer, setSelectedCustomer] = reactExports.useState(null);
  const [toastMessage, setToastMessage] = reactExports.useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5e3);
  };
  const loadProperties = () => {
    const data = customerService.getProperties();
    setProperties(data);
  };
  reactExports.useEffect(() => {
    loadProperties();
    const unsub = customerService.subscribe(loadProperties);
    return () => unsub();
  }, []);
  const handleEditProperty = (prop) => {
    setSelectedProperty(prop);
    setIsEditModalOpen(true);
  };
  const handleRemoveResident = (residentName) => {
    if (!selectedProperty) return;
    const updatedResidents = (selectedProperty.residentNames || []).filter((r) => r !== residentName);
    const updatedProperty = {
      ...selectedProperty,
      residentNames: updatedResidents,
      status: updatedResidents.length === 0 ? "Vacant" : selectedProperty.status
    };
    customerService.updateProperty(updatedProperty);
    setSelectedProperty(updatedProperty);
    showToast(`Resident '${residentName}' removed from property. Customer profile remains intact in CRM.`);
  };
  const handleMarkVacant = (prop) => {
    const success = customerService.markPropertyVacant(prop.id);
    if (success) {
      if ((selectedProperty == null ? void 0 : selectedProperty.id) === prop.id) {
        setSelectedProperty({
          ...prop,
          status: "Vacant",
          residentNames: [],
          residents: []
        });
      }
      showToast(`Property '${prop.propertyCode || prop.id}' marked as Vacant. Resident members disassociated and safely kept in customer database.`);
    }
  };
  const handleRemoveProperty = (prop) => {
    const confirmMsg = `Are you sure you want to remove property '${prop.propertyCode || prop.address}'?

Note: Resident members/customers will NOT be deleted; they will remain safely in the customer directory.`;
    if (window.confirm(confirmMsg)) {
      const result = customerService.removeProperty(prop.id);
      if (result.success) {
        if ((selectedProperty == null ? void 0 : selectedProperty.id) === prop.id) {
          setSelectedProperty(null);
          setIsEditModalOpen(false);
        }
        showToast(`✅ Property removed from registry. ${result.membersPreserved} member(s) safely preserved in CRM.`);
      }
    }
  };
  const handleBulkVacateNoHouseNo = () => {
    const result = customerService.vacateAllPropertiesWithoutHouseNo();
    showToast(`✅ ${result.vacatedCount} properties without house numbers marked as Vacant. ${result.membersPreserved} members disassociated from property entries while preserved in CRM.`);
  };
  const handleBulkRemoveNoHouseNo = () => {
    if (window.confirm("Remove all property entries where house number is missing?\n\nCustomer/member profiles will NOT be deleted; they will remain safe in the CRM database.")) {
      const result = customerService.removePropertiesWithoutHouseNo();
      showToast(`✅ ${result.removedCount} property entries without house numbers removed. All member records were kept safe in CRM!`);
    }
  };
  const stats = reactExports.useMemo(() => {
    const total = properties.length;
    const occupied = properties.filter((p) => p.status === "Occupied").length;
    const vacant = properties.filter((p) => p.status === "Vacant").length;
    const missingHouseNo = properties.filter((p) => !p.housePlotNumber || !p.housePlotNumber.trim() || p.housePlotNumber === "Plot Unit").length;
    return { total, occupied, vacant, missingHouseNo };
  }, [properties]);
  const filteredProperties = reactExports.useMemo(() => {
    return properties.filter((p) => {
      const s = search.toLowerCase().replace(/\s+/g, "");
      const code = (p.propertyCode || "").toLowerCase().replace(/\s+/g, "");
      const houseNo = (p.housePlotNumber || "").toLowerCase().replace(/\s+/g, "");
      const addr = (p.address || "").toLowerCase().replace(/\s+/g, "");
      const hasResident = (p.residentNames || []).some((r) => r.toLowerCase().replace(/\s+/g, "").includes(s));
      const matchesSearch = !search || code.includes(s) || houseNo.includes(s) || addr.includes(s) || hasResident;
      let matchesType = true;
      if (filterType === "Occupied") matchesType = p.status === "Occupied";
      else if (filterType === "Vacant") matchesType = p.status === "Vacant";
      else if (filterType === "MissingHouseNo") {
        matchesType = !p.housePlotNumber || !p.housePlotNumber.trim() || p.housePlotNumber === "Plot Unit";
      }
      return matchesSearch && matchesType;
    }).sort((a, b) => {
      const colA = (a.colony || a.address || "").trim();
      const colB = (b.colony || b.address || "").trim();
      const colCmp = colA.localeCompare(colB, void 0, { numeric: true, sensitivity: "base" });
      if (colCmp !== 0) return colCmp;
      const hA = (a.housePlotNumber || "").trim();
      const hB = (b.housePlotNumber || "").trim();
      return hA.localeCompare(hB, void 0, { numeric: true, sensitivity: "base" });
    });
  }, [properties, search, filterType]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", id: "properties-view-root", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex border-b border-slate-200 gap-2 sm:gap-3 overflow-x-auto pb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveViewTab("sequence"),
          className: `px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${activeViewTab === "sequence" ? "bg-indigo-900 text-white shadow-md" : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 16, className: activeViewTab === "sequence" ? "text-indigo-300" : "text-slate-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Sequence-Wise Property Hub (Colony → Block → Seq)" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveViewTab("unified"),
          className: `px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${activeViewTab === "unified" ? "bg-amber-500 text-slate-950 shadow-md font-extrabold" : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(House, { size: 16, className: activeViewTab === "unified" ? "text-slate-950" : "text-amber-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Unified Property & Family Hub (Master Commercial & Residential)" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveViewTab("grid"),
          className: `px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${activeViewTab === "grid" ? "bg-blue-900 text-white shadow-md" : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { size: 16, className: activeViewTab === "grid" ? "text-red-300" : "text-slate-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "All Properties & Vacancy Registry (",
              properties.length,
              ")"
            ] })
          ]
        }
      )
    ] }),
    activeViewTab === "sequence" ? /* @__PURE__ */ jsxRuntimeExports.jsx(SequenceWisePropertyHub, {}) : activeViewTab === "unified" ? /* @__PURE__ */ jsxRuntimeExports.jsx(UnifiedPropertyFamilyHub, {}) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      toastMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-emerald-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300 border border-emerald-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 text-sm font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-emerald-300 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: toastMessage })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setToastMessage(null),
            className: "text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg font-bold",
            children: "Dismiss"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold tracking-wider uppercase border border-red-100 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { size: 14, className: "text-red-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Dadabari S.O. · Postal Beat Property Registry" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl sm:text-2xl font-black text-slate-900 tracking-tight", children: "Property & Land Parcel Registry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500 mt-0.5", children: [
            "Physical plots, houses, and building units mapped to delivery beats (",
            properties.length,
            " Registered Properties)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: filterType,
              onChange: (e) => setFilterType(e.target.value),
              className: "px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: "All", children: [
                  "All Properties (",
                  stats.total,
                  ")"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: "Occupied", children: [
                  "Occupied (",
                  stats.occupied,
                  ")"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: "Vacant", children: [
                  "Vacant (",
                  stats.vacant,
                  ")"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: "MissingHouseNo", children: [
                  "Missing House No (",
                  stats.missingHouseNo,
                  ")"
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: search,
                onChange: (e) => setSearch(e.target.value),
                placeholder: "Search house no, sector, code...",
                className: "pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-600 focus:outline-hidden"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setIsAddModalOpen(true),
              className: "px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add Property" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 p-5 rounded-3xl border border-amber-200/90 shadow-xs space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-amber-900 font-bold text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "w-5 h-5 text-amber-600 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "House Number Verification & Vacancy Management Rule" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-800 leading-relaxed max-w-3xl", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "CRM Policy Enforced:" }),
              " Entries without a verified house number have their members disassociated from the property, and the property status is updated to ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Vacant" }),
              ". When removing unnumbered properties, the underlying customer/member records are strictly preserved in the directory."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: handleBulkVacateNoHouseNo,
                className: "px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer",
                title: "Set all properties with missing house number to Vacant and remove members from property",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(UserX, { size: 14 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Set Missing House No. to Vacant" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: handleBulkRemoveNoHouseNo,
                className: "px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer",
                title: "Remove properties without house number from property list (preserves all customer members)",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Remove Properties (Keep Members)" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-amber-200/70 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/80 p-2.5 rounded-xl border border-amber-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 font-medium", children: "Total Properties:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-slate-900 font-mono", children: stats.total })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/80 p-2.5 rounded-xl border border-amber-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 font-medium", children: "Occupied Units:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-emerald-700 font-mono", children: stats.occupied })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/80 p-2.5 rounded-xl border border-amber-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 font-medium", children: "Vacant Properties:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-amber-800 font-mono", children: stats.vacant })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/80 p-2.5 rounded-xl border border-amber-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 font-medium", children: "Missing House No:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-red-700 font-mono", children: stats.missingHouseNo })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredProperties.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { className: "w-10 h-10 text-slate-300 mx-auto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-800 text-base", children: "No properties found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "No property records matched your search or filter criteria." })
      ] }) : filteredProperties.map((prop) => {
        var _a2;
        const hasHouseNo = Boolean(
          prop.housePlotNumber && prop.housePlotNumber.trim() && prop.housePlotNumber !== "Plot Unit" && prop.housePlotNumber.toLowerCase() !== "n/a"
        );
        const residentCount = ((_a2 = prop.residentNames) == null ? void 0 : _a2.length) || 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `bg-white rounded-2xl border transition p-5 flex flex-col justify-between hover:shadow-md ${!hasHouseNo || prop.status === "Vacant" ? "border-amber-200/90 bg-amber-50/20" : "border-slate-200 hover:border-red-300"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 mb-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200", children: prop.propertyCode || prop.id }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap justify-end", children: [
                    !hasHouseNo && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300", children: "No House No" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `text-xs px-2.5 py-0.5 rounded font-bold ${prop.status === "Occupied" ? "bg-emerald-100 text-emerald-800" : prop.status === "Vacant" ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-700"}`,
                        children: prop.status
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-base mb-1 flex items-center gap-2", children: hasHouseNo ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "House/Plot ",
                  prop.housePlotNumber
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-800 italic text-sm", children: "House No: Not Assigned (Unnumbered)" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-600 mb-3 flex items-start gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 13, className: "text-red-600 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-2", children: prop.address })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2 mb-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-500 font-medium", children: [
                      "Beat: ",
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                        "Beat ",
                        prop.beatNo || "2"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-500 font-medium", children: [
                      "Sector: ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: prop.sector || "7" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-700 font-medium pt-1 border-t border-slate-200 flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      "Residents (",
                      residentCount,
                      "):"
                    ] }),
                    residentCount === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-amber-700 font-semibold", children: "(No members attached)" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 min-h-6", children: residentCount > 0 ? prop.residentNames.map((name, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "px-2 py-0.5 bg-white border border-slate-200 text-slate-800 rounded text-xs font-medium",
                      children: name
                    },
                    i
                  )) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-400 italic", children: "Vacant Unit · Members removed from property entry" }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => handleEditProperty(prop),
                      className: "font-semibold text-slate-600 hover:text-slate-900 cursor-pointer",
                      children: "Edit"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-300", children: "•" }),
                  prop.status !== "Vacant" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => handleMarkVacant(prop),
                      className: "font-semibold text-amber-700 hover:text-amber-800 cursor-pointer",
                      title: "Set to Vacant and remove resident members",
                      children: "Set Vacant"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => handleRemoveProperty(prop),
                      className: "text-slate-400 hover:text-red-700 flex items-center gap-1 font-semibold transition cursor-pointer",
                      title: "Remove property entry (preserves customer/member profile)",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Remove Property" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setSelectedProperty(prop),
                      className: "font-bold text-red-700 hover:text-red-800 cursor-pointer",
                      children: "View Info →"
                    }
                  )
                ] })
              ] })
            ]
          },
          prop.id
        );
      }) }),
      selectedProperty && !isEditModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between pb-3 border-b border-slate-100", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-100", children: selectedProperty.propertyCode || selectedProperty.id }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-lg mt-1", children: selectedProperty.housePlotNumber ? `House/Plot ${selectedProperty.housePlotNumber}` : "Unassigned House Number" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `text-xs px-2.5 py-1 rounded-full font-bold ${selectedProperty.status === "Occupied" ? "bg-emerald-100 text-emerald-800" : selectedProperty.status === "Vacant" ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-700"}`,
              children: selectedProperty.status
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-xs text-slate-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Address:" }),
            " ",
            selectedProperty.address
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Sector:" }),
              " ",
              selectedProperty.sector
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Beat:" }),
              " Beat ",
              selectedProperty.beatNo || "2"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Pincode:" }),
              " ",
              selectedProperty.pincode
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Area:" }),
              " ",
              selectedProperty.area
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-bold text-slate-800 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Associated Residents (",
              ((_a = selectedProperty.residentNames) == null ? void 0 : _a.length) || 0,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-500 font-semibold uppercase", children: "CRM Member Records" })
          ] }),
          selectedProperty.residentNames && selectedProperty.residentNames.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: selectedProperty.residentNames.map((res, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-800", children: res }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleRemoveResident(res),
                    className: "text-red-600 hover:text-red-800 text-[11px] font-bold",
                    title: "Remove resident from property entry (keeps customer profile)",
                    children: "Remove from Property"
                  }
                )
              ]
            },
            i
          )) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-400 italic py-2 text-center", children: "This property is currently Vacant with 0 resident members." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => handleRemoveProperty(selectedProperty),
              className: "px-3.5 py-2 rounded-xl text-red-700 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Remove Property (Keep Member)" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            selectedProperty.status !== "Vacant" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => handleMarkVacant(selectedProperty),
                className: "px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition",
                children: "Mark Vacant"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setSelectedProperty(null),
                className: "px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition",
                children: "Close"
              }
            )
          ] })
        ] })
      ] }) }),
      isEditModalOpen && selectedProperty && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-slate-900 text-lg mb-4", children: [
          "Edit Property: ",
          selectedProperty.propertyCode
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-700 mb-1", children: "House / Plot Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                defaultValue: selectedProperty.housePlotNumber,
                id: "edit-housePlotNumber",
                placeholder: "e.g. 101 or leave blank for unnumbered",
                className: "w-full p-2.5 border rounded-xl text-xs"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-700 mb-1", children: "Full Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                defaultValue: selectedProperty.address,
                id: "edit-address",
                placeholder: "Address",
                className: "w-full p-2.5 border rounded-xl text-xs"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-700 mb-1", children: "Sector" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  defaultValue: selectedProperty.sector,
                  id: "edit-sector",
                  placeholder: "Sector",
                  className: "w-full p-2.5 border rounded-xl text-xs"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-700 mb-1", children: "Beat No" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  defaultValue: selectedProperty.beatNo || "2",
                  id: "edit-beatNo",
                  placeholder: "Beat No",
                  className: "w-full p-2.5 border rounded-xl text-xs"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-xs font-bold text-slate-900 mb-2", children: [
              "Residents Associated with Property (",
              ((_b = selectedProperty.residentNames) == null ? void 0 : _b.length) || 0,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5 mb-3 max-h-36 overflow-y-auto", children: selectedProperty.residentNames && selectedProperty.residentNames.length > 0 ? selectedProperty.residentNames.map((resName, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex justify-between items-center bg-slate-50 px-3 py-1.5 rounded-xl text-xs border border-slate-200",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-800", children: resName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => handleRemoveResident(resName),
                      className: "text-red-600 hover:text-red-800 text-[11px] font-bold",
                      title: "Remove from property entry",
                      children: "Remove from Property"
                    }
                  )
                ]
              },
              idx
            )) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-400 italic", children: "No residents mapped. Property is Vacant." }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pt-3 border-t", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => handleRemoveProperty(selectedProperty),
                className: "text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Remove Property" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setIsEditModalOpen(false),
                  className: "px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold",
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    var _a2, _b2, _c, _d;
                    const houseVal = (_a2 = document.getElementById("edit-housePlotNumber")) == null ? void 0 : _a2.value;
                    const addrVal = (_b2 = document.getElementById("edit-address")) == null ? void 0 : _b2.value;
                    const secVal = (_c = document.getElementById("edit-sector")) == null ? void 0 : _c.value;
                    const beatVal = (_d = document.getElementById("edit-beatNo")) == null ? void 0 : _d.value;
                    const hasValidNo = Boolean(houseVal && houseVal.trim());
                    const updated = {
                      ...selectedProperty,
                      housePlotNumber: houseVal,
                      address: addrVal || selectedProperty.address,
                      sector: secVal || selectedProperty.sector,
                      beatNo: beatVal || selectedProperty.beatNo,
                      // If house number is empty, mark Vacant and clear residents
                      status: !hasValidNo ? "Vacant" : selectedProperty.status,
                      residentNames: !hasValidNo ? [] : selectedProperty.residentNames
                    };
                    customerService.updateProperty(updated);
                    setIsEditModalOpen(false);
                    showToast(`Property ${updated.propertyCode} updated successfully.`);
                  },
                  className: "px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold shadow-xs",
                  children: "Save Changes"
                }
              )
            ] })
          ] })
        ] })
      ] }) }),
      isAddModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-lg mb-4", children: "Add New Property" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "form",
          {
            onSubmit: (e) => {
              e.preventDefault();
              const form = e.target;
              const houseNo = form.elements.namedItem("houseNo").value;
              const sector = form.elements.namedItem("sector").value;
              const area = form.elements.namedItem("area").value;
              const pincode = form.elements.namedItem("pincode").value;
              const beatNo = form.elements.namedItem("beatNo").value;
              const hasValidNo = Boolean(houseNo && houseNo.trim());
              const newPropCode = `PROP-S${sector || "7"}-H${hasValidNo ? houseNo : "UNNUMBERED"}`;
              const newProp = {
                id: newPropCode,
                propertyCode: newPropCode,
                housePlotNumber: houseNo || "",
                address: `${houseNo ? houseNo + ", " : ""}Sector ${sector || "7"}, ${area || "Keshavpura"}, Kota`,
                sector: sector || "7",
                area: area || "Keshavpura",
                pincode: pincode || "324009",
                beatNo: beatNo || "2",
                status: !hasValidNo ? "Vacant" : "Occupied",
                residentNames: [],
                residents: [],
                verificationStatus: hasValidNo,
                notes: !hasValidNo ? "Added as Vacant (No House Number)." : "Registered Property"
              };
              customerService.updateProperty(newProp);
              setIsAddModalOpen(false);
              showToast(`New property ${newPropCode} registered (${newProp.status}).`);
            },
            className: "space-y-3",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "House / Plot No (Leave empty to create Vacant Unnumbered plot)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    name: "houseNo",
                    placeholder: "e.g. 101 or Plot 239",
                    className: "w-full p-2.5 border rounded-xl text-xs"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Sector" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      name: "sector",
                      defaultValue: "Sector 6",
                      placeholder: "Sector",
                      className: "w-full p-2.5 border rounded-xl text-xs"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Area" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      name: "area",
                      defaultValue: "Dadabari",
                      placeholder: "Area",
                      className: "w-full p-2.5 border rounded-xl text-xs"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Beat No" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      name: "beatNo",
                      defaultValue: "2",
                      placeholder: "Beat No",
                      className: "w-full p-2.5 border rounded-xl text-xs"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Pincode" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      name: "pincode",
                      defaultValue: "324009",
                      placeholder: "Pincode",
                      className: "w-full p-2.5 border rounded-xl text-xs"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 mt-4 pt-3 border-t", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setIsAddModalOpen(false),
                    className: "px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "submit",
                    className: "px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer",
                    children: "Save Property"
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
      )
    ] })
  ] });
}
export {
  PropertiesView as default
};
