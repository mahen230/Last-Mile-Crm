import { c as createLucideIcon, r as reactExports, b as customerService, j as jsxRuntimeExports, a9 as User, S as Search, p as ChevronRight, l as CustomerProfileModal } from "./index-CuXKa_SH.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",
      key: "mvr1a0"
    }
  ]
];
const Heart = createLucideIcon("heart", __iconNode);
function FamilyView() {
  const [customers, setCustomers] = reactExports.useState([]);
  const [search, setSearch] = reactExports.useState("");
  const [selectedCustomer, setSelectedCustomer] = reactExports.useState(null);
  reactExports.useEffect(() => {
    setCustomers(customerService.getCustomers());
    const unsub = customerService.subscribe(() => {
      setCustomers([...customerService.getCustomers()]);
    });
    return () => unsub();
  }, []);
  const families = customers.filter((c) => {
    var _a, _b, _c, _d;
    const s = search.toLowerCase();
    const hasFamilyInfo = !!(c.fatherHusbandName || ((_a = c.familyMembers) == null ? void 0 : _a.length) || ((_b = c.remarks) == null ? void 0 : _b.includes("Late")) || ((_c = c.remarks) == null ? void 0 : _c.includes("daughter")) || ((_d = c.remarks) == null ? void 0 : _d.includes("wife")));
    const matchesSearch = !s || c.name.toLowerCase().includes(s) || c.fatherHusbandName && c.fatherHusbandName.toLowerCase().includes(s) || c.remarks && c.remarks.toLowerCase().includes(s);
    return hasFamilyInfo && matchesSearch;
  }).sort((a, b) => {
    var _a, _b, _c, _d;
    const colA = (a.area || a.sectorLocality || ((_a = a.address) == null ? void 0 : _a.area) || a.sector || "").trim();
    const colB = (b.area || b.sectorLocality || ((_b = b.address) == null ? void 0 : _b.area) || b.sector || "").trim();
    const colCmp = colA.localeCompare(colB, void 0, { numeric: true, sensitivity: "base" });
    if (colCmp !== 0) return colCmp;
    const hA = (a.houseNo || ((_c = a.address) == null ? void 0 : _c.houseNumber) || "").trim();
    const hB = (b.houseNo || ((_d = b.address) == null ? void 0 : _d.houseNumber) || "").trim();
    return hA.localeCompare(hB, void 0, { numeric: true, sensitivity: "base" });
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", id: "family-view-root", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-slate-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 22, className: "text-red-700" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Family & Kinship Relationships" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Parentage, spouse relations, and guardian eligibility for Sukanya Samriddhi (SSA) & PLI" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Search by name, father/husband...",
            className: "pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-600"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: families.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition p-5 flex flex-col justify-between",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded", children: c.masterId || c.id }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-0.5 bg-rose-50 text-rose-700 font-semibold rounded flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { size: 12 }),
                " Family Unit"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-base", children: c.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-600 font-medium mb-3", children: c.fatherHusbandName ? `Relation: S/o or W/o ${c.fatherHusbandName}` : "Head of Family" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Address:" }),
                " ",
                c.houseNo ? `House ${c.houseNo}, ` : "",
                c.sector ? `Sector ${c.sector}` : c.area
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Mobile:" }),
                " ",
                c.mobile || "No contact"
              ] }),
              c.remarks && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-500 italic mt-1 line-clamp-2", children: [
                '"',
                c.remarks,
                '"'
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-slate-100 flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-500", children: [
              "Beat ",
              c.beatNo || "2"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setSelectedCustomer(c),
                className: "font-semibold text-red-700 hover:text-red-800 flex items-center gap-1",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "View Full Profile" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 })
                ]
              }
            )
          ] })
        ]
      },
      c.id
    )) }),
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
  FamilyView as default
};
