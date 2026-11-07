import { r as reactExports, j as jsxRuntimeExports, aS as Settings, C as CircleCheck, x as RefreshCw, b as customerService } from "./index-u5ATSoh6.js";
function SettingsView() {
  const [currentRole, setCurrentRole] = reactExports.useState("Admin");
  const [officeName, setOfficeName] = reactExports.useState("Dadabari Sub-Post Office (SO)");
  const [pincode, setPincode] = reactExports.useState("324009");
  const [city, setCity] = reactExports.useState("Kota, Rajasthan");
  const [savedSuccess, setSavedSuccess] = reactExports.useState(false);
  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3e3);
  };
  const handleResetToMaster = () => {
    if (window.confirm("Are you sure you want to reset and reload the verified Master Source dataset?")) {
      customerService.resetToInitialData();
      alert("Database successfully reset to verified Master Source records.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", id: "settings-view-root", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-slate-900 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { size: 22, className: "text-red-700" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "System Settings & Operational Configuration" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Postal jurisdiction configuration, role-based access control, and database maintenance" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-base", children: "Postal Office & Jurisdiction Profile" }),
        savedSuccess && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 15 }),
          " Settings successfully saved."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSaveSettings, className: "space-y-3 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Sub-Post Office Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: officeName,
                onChange: (e) => setOfficeName(e.target.value),
                className: "w-full p-2.5 border border-slate-300 rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Postal Pincode" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: pincode,
                  onChange: (e) => setPincode(e.target.value),
                  className: "w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "City / Region" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: city,
                  onChange: (e) => setCity(e.target.value),
                  className: "w-full p-2.5 border border-slate-300 rounded-xl"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-semibold text-slate-700 mb-1", children: "Active Delivery Beats" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium", children: "Beat 2 (Sector 6, 7 & Santoshi Nagar), Beat 6 (Sector 4 & 2)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-xl text-xs shadow-xs",
              children: "Save Configuration"
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-base", children: "Active Operator Role & Permissions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Switch simulation role to preview role-based access control (RBAC):" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: ["Admin", "Manager", "Support", "Postman", "Customer"].map((role) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            onClick: () => setCurrentRole(role),
            className: `p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${currentRole === role ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold block", children: [
                  role,
                  " Role"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-[11px] ${currentRole === role ? "text-slate-300" : "text-slate-500"}`, children: [
                  role === "Admin" && "Full CRUD, conflict merge, master import/export",
                  role === "Manager" && "Reports, staff allocation, lead approvals",
                  role === "Support" && "Customer directory, inquiry response, follow-ups",
                  role === "Postman" && "Beat tasks, doorstep KYC, CELC biometrics",
                  role === "Customer" && "Citizen self-service portal, track inquiry status"
                ] })
              ] }),
              currentRole === role && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16, className: "text-amber-400" })
            ]
          },
          role
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-slate-900 text-xs mb-2", children: "Master Database Diagnostics" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleResetToMaster,
              className: "px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-300",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Reload Verified Master Dataset" })
              ]
            }
          ) })
        ] })
      ] })
    ] })
  ] });
}
export {
  SettingsView as default
};
