import { r as reactExports, j as jsxRuntimeExports, b as customerService, S as Search, H as House, U as Users, e as MapPin, n as Phone, o as ChevronRight, P as Plus, l as CustomerProfileModal } from "./index-u5ATSoh6.js";
function AddMemberModal({ isOpen, onClose, householdId, householdAddress, onSaved }) {
  const [name, setName] = reactExports.useState("");
  const [mobile, setMobile] = reactExports.useState("");
  const [relationship, setRelationship] = reactExports.useState("Family Member");
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    customerService.addOrUpdateCustomer({
      name,
      mobile,
      householdId,
      address: householdAddress,
      householdMembers: [{ name, relationship }],
      // Basic link
      verificationStatus: "Field Confirmed"
    }, "Quick Add Member");
    onSaved();
    onClose();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg mb-4", children: "Quick Add Member" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "Name *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", required: true, value: name, onChange: (e) => setName(e.target.value), className: "w-full p-2 border border-slate-300 rounded-lg" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "Mobile *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "tel", required: true, value: mobile, onChange: (e) => setMobile(e.target.value), className: "w-full p-2 border border-slate-300 rounded-lg" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "Type *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: relationship, onChange: (e) => setRelationship(e.target.value), className: "w-full p-2 border border-slate-300 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Family Member" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Rentor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Owner" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Other" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "flex-1 p-2 bg-slate-100 rounded-lg font-semibold", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "flex-1 p-2 bg-red-700 text-white rounded-lg font-semibold", children: "Add Member" })
      ] })
    ] })
  ] }) });
}
function AssociateMemberModal({ isOpen, onClose, householdCode, onSaved }) {
  const [search, setSearch] = reactExports.useState("");
  const allCustomers = customerService.getCustomers();
  const filteredCustomers = allCustomers.filter(
    (c) => !c.householdId && (c.name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search))
  );
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg mb-4", children: "Associate Existing Member" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: search,
          onChange: (e) => setSearch(e.target.value),
          placeholder: "Search by name or phone...",
          className: "w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto space-y-2", children: filteredCustomers.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border border-slate-200 rounded-lg flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: c.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500", children: c.mobile })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            customerService.linkCustomerToHousehold(c.id, householdCode);
            onSaved();
            onClose();
          },
          className: "px-3 py-1 bg-red-700 text-white rounded-lg text-xs font-semibold",
          children: "Associate"
        }
      )
    ] }, c.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "mt-4 w-full p-2 bg-slate-100 rounded-lg font-semibold text-sm", children: "Cancel" })
  ] }) });
}
function HouseholdsView({ onAddLead }) {
  var _a;
  const [households, setHouseholds] = reactExports.useState([]);
  const [search, setSearch] = reactExports.useState("");
  const [selectedHousehold, setSelectedHousehold] = reactExports.useState(null);
  const [selectedCustomer, setSelectedCustomer] = reactExports.useState(null);
  const [showAddMember, setShowAddMember] = reactExports.useState(false);
  const [showAssociateMember, setShowAssociateMember] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setHouseholds(customerService.getHouseholds());
    const unsub = customerService.subscribe(() => {
      setHouseholds([...customerService.getHouseholds()]);
    });
    return () => unsub();
  }, []);
  const filteredHouseholds = households.filter((h) => {
    var _a2;
    const s = search.toLowerCase().replace(/\s+/g, "");
    const mobileS = search.replace(/\D/g, "");
    const houseNo = (((_a2 = h.address) == null ? void 0 : _a2.houseNo) || "").toLowerCase().replace(/\s+/g, "");
    const headName = (h.headOfHouseholdName || "").toLowerCase().replace(/\s+/g, "");
    const primaryMobile = (h.primaryContactNumber || "").replace(/\D/g, "");
    return !s || houseNo.includes(s) || headName.includes(s) || mobileS && primaryMobile.includes(mobileS) || h.members.some((m) => m.name.toLowerCase().replace(/\s+/g, "").includes(s));
  }).sort((a, b) => {
    var _a2, _b, _c, _d, _e, _f;
    const colA = (((_a2 = a.address) == null ? void 0 : _a2.sectorLocality) || ((_b = a.address) == null ? void 0 : _b.area) || "").trim();
    const colB = (((_c = b.address) == null ? void 0 : _c.sectorLocality) || ((_d = b.address) == null ? void 0 : _d.area) || "").trim();
    const colCmp = colA.localeCompare(colB, void 0, { numeric: true, sensitivity: "base" });
    if (colCmp !== 0) return colCmp;
    const hA = (((_e = a.address) == null ? void 0 : _e.houseNo) || "").trim();
    const hB = (((_f = b.address) == null ? void 0 : _f.houseNo) || "").trim();
    return hA.localeCompare(hB, void 0, { numeric: true, sensitivity: "base" });
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", id: "households-view-root", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-slate-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(House, { size: 22, className: "text-red-700" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Household Registry & Family Units" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500 mt-0.5", children: [
          "Normalized family units grouped by shared address and primary telephone (",
          households.length,
          " Households)"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            placeholder: "Search households...",
            className: "pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-600"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredHouseholds.map((hh, index) => {
      var _a2, _b, _c;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition p-5 flex flex-col justify-between",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-100", children: hh.householdId }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 13 }),
                  " ",
                  ((_a2 = hh.members) == null ? void 0 : _a2.length) || 0,
                  " ",
                  (((_b = hh.members) == null ? void 0 : _b.length) || 0) === 1 ? "Resident" : "Members"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-slate-900 text-base mb-1", children: [
                "Family of ",
                hh.headOfHouseholdName
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 text-xs text-slate-600 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 14, className: "text-slate-400 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: hh.address.fullAddress })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 font-mono", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 14, className: "text-emerald-600 shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: hh.primaryContactNumber })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold text-slate-500 uppercase tracking-wider", children: "Associated Residents" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: hh.members.map((mem, index2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    onClick: () => {
                      const cust = customerService.getCustomerById(mem.customerId);
                      if (cust) setSelectedCustomer(cust);
                    },
                    className: "flex items-center justify-between text-xs p-1.5 bg-white rounded-lg border border-slate-200/80 hover:border-red-300 cursor-pointer transition",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-slate-900", children: mem.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded", children: mem.relationship })
                    ]
                  },
                  mem.customerId || `mem-${hh.householdId}-${index2}`
                )) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-slate-100 flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-500", children: [
                "Beat ",
                ((_c = hh.address.area) == null ? void 0 : _c.includes("Santoshi")) ? "2" : "2",
                " • Dadabari SO"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setSelectedHousehold(hh),
                  className: "font-semibold text-red-700 hover:text-red-800 flex items-center gap-0.5",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Explore Family" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 15 })
                  ]
                }
              )
            ] })
          ]
        },
        hh.householdId || `hh-${index}`
      );
    }) }),
    selectedHousehold && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-red-700 font-bold", children: selectedHousehold.householdId }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold text-slate-900", children: [
            "Household: ",
            selectedHousehold.headOfHouseholdName
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedHousehold(null), className: "text-slate-400 hover:text-slate-700 font-bold", children: "✕" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-4 space-y-4 text-xs text-slate-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-slate-50 rounded-xl space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Address:" }),
            " ",
            selectedHousehold.address.fullAddress
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Primary Phone:" }),
            " ",
            selectedHousehold.primaryContactNumber
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Total Residents:" }),
            " ",
            ((_a = selectedHousehold.members) == null ? void 0 : _a.length) || 0
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-slate-900", children: "Members in this unit:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setShowAssociateMember(true),
                  className: "flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 14 }),
                    " Associate"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setShowAddMember(true),
                  className: "flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded-lg",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }),
                    " Add New"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: selectedHousehold.members.map((m, index) => {
            const cust = customerService.getCustomerById(m.customerId || "");
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-slate-900", children: [
                  m.name,
                  " ",
                  (cust == null ? void 0 : cust.isHeadOfFamily) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded", children: "Head" }),
                  " (",
                  m.relationship,
                  ")"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-slate-500 font-mono", children: m.mobile || "No mobile" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                cust && !cust.isHeadOfFamily && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => customerService.setHeadOfFamily(cust.id, selectedHousehold.householdCode),
                    className: "text-[10px] text-blue-600 hover:underline",
                    children: "Make Head"
                  }
                ),
                cust && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => customerService.unlinkFromFamily(cust.id),
                    className: "text-[10px] text-red-600 hover:underline",
                    children: "Remove"
                  }
                ),
                cust && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => {
                      setSelectedHousehold(null);
                      setSelectedCustomer(cust);
                    },
                    className: "px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg text-[10px]",
                    children: "View Profile"
                  }
                )
              ] })
            ] }, m.customerId || `m-${selectedHousehold.householdId}-${index}`);
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end pt-3 border-t border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSelectedHousehold(null),
          className: "px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold",
          children: "Close"
        }
      ) })
    ] }) }),
    showAssociateMember && selectedHousehold && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AssociateMemberModal,
      {
        isOpen: showAssociateMember,
        onClose: () => setShowAssociateMember(false),
        householdCode: selectedHousehold.householdCode,
        onSaved: () => {
        }
      }
    ),
    showAddMember && selectedHousehold && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AddMemberModal,
      {
        isOpen: showAddMember,
        onClose: () => setShowAddMember(false),
        householdId: selectedHousehold.householdCode,
        householdAddress: selectedHousehold.address,
        onSaved: () => {
        }
      }
    ),
    selectedCustomer && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CustomerProfileModal,
      {
        customer: selectedCustomer,
        onClose: () => setSelectedCustomer(null),
        onAddLead
      }
    )
  ] });
}
export {
  HouseholdsView as default
};
