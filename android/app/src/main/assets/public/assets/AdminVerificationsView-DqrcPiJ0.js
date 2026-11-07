import { r as reactExports, bb as verificationService, j as jsxRuntimeExports, y as ShieldCheck, z as RefreshCw, aa as User, e as MapPin } from "./index-CLJIrWlm.js";
import { C as ChartColumn } from "./chart-column-C10lUvPJ.js";
function AdminVerificationsView() {
  const [summary, setSummary] = reactExports.useState(() => verificationService.getAdminVerificationSummary());
  const [selectedTask, setSelectedTask] = reactExports.useState(null);
  const refreshData = () => {
    setSummary(verificationService.getAdminVerificationSummary());
  };
  reactExports.useEffect(() => {
    refreshData();
    const unsub = verificationService.subscribe(refreshData);
    return () => unsub();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-6 max-w-7xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 22 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl sm:text-2xl font-black text-slate-900 tracking-tight", children: "Daily Property Verification Management" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Live monitoring of field postman 10-property doorstep audit progress across Dadabari S.O. jurisdiction" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: refreshData,
          className: "px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 14 }),
            " Refresh Audit"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-white rounded-2xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-slate-500 uppercase", children: "Assigned Today" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-slate-900 mt-1", children: summary.totalAssigned }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-400 mt-0.5", children: "10 per active field beat" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-emerald-800 uppercase", children: "Verified Complete" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-emerald-700 mt-1", children: summary.completed }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-emerald-600 mt-0.5", children: [
          summary.completionRate,
          "% completion rate"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-white rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-amber-800 uppercase", children: "Pending In Field" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-amber-700 mt-1", children: summary.pending }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-amber-600 mt-0.5", children: "Awaiting doorstep scan" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-white rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-blue-800 uppercase", children: "Flagged / Review" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-blue-700 mt-1", children: summary.needsReview }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-blue-600 mt-0.5", children: "Occupancy / address mismatch" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold text-slate-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { size: 16, className: "text-red-700" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Beat-Wise Verification Performance" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: summary.beatPerformance.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-400 text-center py-6", children: "No beats assigned for verification today" }) : summary.beatPerformance.map((bp) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-800", children: bp.beat }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-slate-600", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: bp.completed }),
              " / ",
              bp.target,
              " verified (",
              bp.percentage,
              "%)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-slate-200 h-2 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "bg-emerald-600 h-full rounded-full transition-all",
              style: { width: `${bp.percentage}%` }
            }
          ) })
        ] }, bp.beat)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold text-slate-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 16, className: "text-red-700" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Postman Target Fulfillment" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: summary.employeePerformance.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-400 text-center py-6", children: "No employee tasks initiated today" }) : summary.employeePerformance.map((ep) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-800", children: ep.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[10px] text-slate-500 ml-2", children: [
                "(",
                ep.employeeId,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-slate-900", children: [
              ep.completed,
              "/",
              ep.target,
              " (",
              ep.percentage,
              "%)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-slate-200 h-2 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "bg-blue-600 h-full rounded-full transition-all",
              style: { width: `${ep.percentage}%` }
            }
          ) })
        ] }, ep.employeeId)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold text-slate-900 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Today's Verified Properties & Audit Ledger" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-slate-500 font-normal", children: [
          "Date: ",
          summary.date
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-slate-50 text-slate-600 font-bold border-b border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Property" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Postman" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Address & Colony" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Occupancy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "GPS Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Remarks" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-100", children: summary.allTodayTasks.map((t) => {
          var _a, _b, _c, _d, _e, _f, _g, _h;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-slate-50/70 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 font-mono font-bold text-slate-900", children: t.propertyCode || t.houseNo }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-800", children: t.employeeName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-500 font-mono", children: t.beatNo })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-slate-600 max-w-xs truncate", children: typeof t.address === "string" ? t.address : ((_a = t.address) == null ? void 0 : _a.fullAddress) || [
              ((_b = t.address) == null ? void 0 : _b.houseNo) || ((_c = t.address) == null ? void 0 : _c.houseNumber),
              (_d = t.address) == null ? void 0 : _d.street,
              (_e = t.address) == null ? void 0 : _e.sector,
              ((_f = t.address) == null ? void 0 : _f.colony) || ((_g = t.address) == null ? void 0 : _g.area)
            ].filter(Boolean).join(", ") || "Dadabari S.O." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700", children: t.occupancyStatus }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 font-mono text-[11px]", children: t.gpsCaptured && t.latitude ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-700 flex items-center gap-1 font-bold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 11 }),
              " ",
              t.latitude.toFixed(4),
              ", ",
              (_h = t.longitude) == null ? void 0 : _h.toFixed(4)
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400", children: "No GPS Tag" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${t.status === "Verified" ? "bg-emerald-100 text-emerald-800" : t.status === "Needs Review" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-900"}`,
                children: t.status
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-slate-500 italic max-w-xs truncate", children: t.remarks || "—" })
          ] }, t.id);
        }) })
      ] }) })
    ] })
  ] });
}
export {
  AdminVerificationsView as default
};
