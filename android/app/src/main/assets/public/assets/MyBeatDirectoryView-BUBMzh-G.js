import { u as useAuth, a as useNavigate, b as customerService, j as jsxRuntimeExports, y as ShieldCheck, Q as Navigation, e as MapPin, ah as ArrowRight, C as CircleCheck, H as House, U as Users } from "./index-BWTx-a8O.js";
function MyBeatDirectoryView() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const beatNo = (userProfile == null ? void 0 : userProfile.beat) || "Beat 2";
  const colonies = (userProfile == null ? void 0 : userProfile.assignedColonies) || ["Keshavpura Sector 7", "Keshavpura Sector 6", "Patel Nagar", "Santoshi Nagar"];
  const fixedKm = (userProfile == null ? void 0 : userProfile.fixedKm) || 18;
  const office = (userProfile == null ? void 0 : userProfile.subOffice) || (userProfile == null ? void 0 : userProfile.assignedOffice) || "Dadabari S.O. (324009)";
  const beatProps = customerService.getScopedProperties(userProfile);
  const beatCustomers = customerService.getScopedCustomers(userProfile);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-6 max-w-5xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 14 }),
          " Assigned Postal Beat"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl sm:text-2xl font-black text-slate-900 tracking-tight", children: [
          beatNo,
          " Operations Hub"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500 mt-0.5", children: [
          "Jurisdiction: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: office }),
          " • Rajasthan Circle • Kota Division"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => navigate("/beats-map"),
          className: "px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { size: 15 }),
            " Open Delivery Map"
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-white rounded-2xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-slate-500 uppercase", children: "Assigned Beat" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-black text-slate-900 mt-1", children: beatNo }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-400 mt-0.5", children: "Primary delivery beat" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-white rounded-2xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-slate-500 uppercase", children: "Total Properties" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-black text-slate-900 mt-1", children: beatProps.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-400 mt-0.5", children: "In your beat zone" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-white rounded-2xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-slate-500 uppercase", children: "Linked Residents" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-black text-slate-900 mt-1", children: beatCustomers.length }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-400 mt-0.5", children: "Authorized member profiles" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-white rounded-2xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-slate-500 uppercase", children: "Sanctioned Beat KM" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xl font-black text-slate-900 mt-1", children: [
          fixedKm,
          " KM"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-400 mt-0.5", children: "Fixed daily beat distance" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-bold text-slate-900 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 16, className: "text-red-700" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Covered Colonies, Sectors & Landmarks" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: colonies.map((col, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-slate-800", children: col }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-slate-500", children: [
            "PIN 324009 • Dadabari S.O. Beat ",
            beatNo
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => navigate("/properties"),
            className: "text-xs text-red-700 hover:text-red-800 font-bold flex items-center gap-0.5 cursor-pointer",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Browse" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 13 })
            ]
          }
        )
      ] }, idx)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onClick: () => navigate("/daily-verification"),
          className: "p-5 bg-white rounded-2xl border border-slate-200 hover:border-red-300 transition shadow-xs cursor-pointer space-y-2 group",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center group-hover:scale-105 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 20 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-sm", children: "Daily 10-Property Verification" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Conduct doorstep status, GPS and address audit for today's target." })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onClick: () => navigate("/properties"),
          className: "p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition shadow-xs cursor-pointer space-y-2 group",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(House, { size: 20 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-sm", children: "Beat Property Directory" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Browse houses, apartments, shops and linked resident units." })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onClick: () => navigate("/unified-properties"),
          className: "p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 transition shadow-xs cursor-pointer space-y-2 group",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 20 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-sm", children: "Register New Property / Member" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Add a newly surveyed doorstep property in your assigned beat." })
          ]
        }
      )
    ] })
  ] });
}
export {
  MyBeatDirectoryView as default
};
