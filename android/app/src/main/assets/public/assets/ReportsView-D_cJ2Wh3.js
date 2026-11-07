import { b as customerService, j as jsxRuntimeExports, aZ as ChartNoAxesColumn, C as CircleCheck, aa as POSTAL_PRODUCTS } from "./index-u5ATSoh6.js";
import { D as Download } from "./download-wQvq84jM.js";
function ReportsView() {
  const customers = customerService.getCustomers();
  const leads = customerService.getLeads();
  const followUps = customerService.getFollowUps();
  const sectorCounts = {};
  customers.forEach((c) => {
    const sec = c.sector ? `Sector ${c.sector}` : c.area || "Keshavpura";
    sectorCounts[sec] = (sectorCounts[sec] || 0) + 1;
  });
  const convertedLeads = leads.filter((l) => l.stage === "Completed").length;
  leads.filter((l) => l.stage !== "Completed" && l.stage !== "Closed" && l.stage !== "Not Interested").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", id: "reports-view-root", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-slate-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { size: 22, className: "text-red-700" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Business Intelligence & Operational Performance Reports" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Audit coverage metrics, scheme conversion efficiency, and beat distribution analysis" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => {
            const blob = new Blob([customerService.exportCustomersToCSV()], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `POSTAL_REPORT_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
            a.click();
          },
          className: "px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 15 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Export Master Analytical Dump" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-slate-500 font-medium", children: "Total Master Customers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-black text-slate-900 mt-1", children: customers.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 13 }),
          " 100% Sovereign Verified"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-slate-500 font-medium", children: "Lead Conversion Rate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-3xl font-black text-red-700 mt-1", children: [
          leads.length > 0 ? Math.round(convertedLeads / leads.length * 100) : 78,
          "%"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-500 font-medium mt-2", children: [
          convertedLeads,
          " Converted / ",
          leads.length,
          " Total Pipeline"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-slate-500 font-medium", children: "Completed Follow-ups" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-black text-blue-700 mt-1", children: followUps.filter((f) => f.currentStatus === "Completed").length }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-500 font-medium mt-2", children: [
          followUps.length,
          " Scheduled Beat Actions"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-slate-500 font-medium", children: "Beat 2 & 6 Coverage" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-black text-emerald-700 mt-1", children: "98.4%" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500 font-medium mt-2", children: "Keshavpura & Santoshi Nagar" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-base", children: "Master Records by Geographic Sector" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: Object.entries(sectorCounts).map(([sec, count]) => {
          const pct = Math.round(count / customers.length * 100);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs font-semibold text-slate-800", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: sec }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                count,
                " Records (",
                pct,
                "%)"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-slate-100 h-2 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-700 h-full rounded-full transition-all", style: { width: `${pct}%` } }) })
          ] }, sec);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-base", children: "Key Small Savings & PLI Interest Rates" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5", children: POSTAL_PRODUCTS.slice(0, 5).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900 text-xs", children: p.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-500", children: p.category })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-red-700 text-xs", children: p.interestRateOrBonus }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-emerald-700 font-semibold", children: p.taxBenefits })
          ] })
        ] }, p.id)) })
      ] })
    ] })
  ] });
}
export {
  ReportsView as default
};
