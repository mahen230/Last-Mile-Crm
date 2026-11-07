import { c as createLucideIcon, u as useAuth, r as reactExports, s as staffPermissionService, b as customerService, j as jsxRuntimeExports, M as MessageSquare, ae as Send, C as CircleCheck, S as Search, Z as Check, ad as Copy, ak as ExternalLink, n as DirectMessageModal, af as cleanPhoneNumber } from "./index-CuXKa_SH.js";
import { R as Radio } from "./radio-DX_X1tHv.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m15 17 5-5-5-5", key: "nf172w" }],
  ["path", { d: "M4 18v-2a4 4 0 0 1 4-4h12", key: "jmiej9" }]
];
const Forward = createLucideIcon("forward", __iconNode);
function CommunicationView() {
  const { userProfile } = useAuth();
  const [logs, setLogs] = reactExports.useState([]);
  const [scopedCustomers, setScopedCustomers] = reactExports.useState([]);
  const [search, setSearch] = reactExports.useState("");
  const [channelFilter, setChannelFilter] = reactExports.useState("All");
  const [typeFilter, setTypeFilter] = reactExports.useState("All");
  const [showDirectModal, setShowDirectModal] = reactExports.useState(false);
  const [showBroadcastPanel, setShowBroadcastPanel] = reactExports.useState(true);
  const [forwardLog, setForwardLog] = reactExports.useState(null);
  const [copiedId, setCopiedId] = reactExports.useState(null);
  const [broadcastBanner, setBroadcastBanner] = reactExports.useState(null);
  const isSuperAdmin = staffPermissionService.isSuperAdmin(userProfile);
  const defaultStaffBeat = (userProfile == null ? void 0 : userProfile.beat) && userProfile.beat !== "All Beats" ? userProfile.beat.replace(/^Beat\s*/i, "").trim() : "All";
  const [bcBeatFilter, setBcBeatFilter] = reactExports.useState(isSuperAdmin ? "All" : defaultStaffBeat);
  const [bcCategoryFilter, setBcCategoryFilter] = reactExports.useState("ALL_CITIZENS");
  const [bcChannel, setBcChannel] = reactExports.useState("Broadcast");
  const [bcTitle, setBcTitle] = reactExports.useState("Doorstep Sukanya (8.2%), PLI & Aadhaar Camp Update");
  const [bcMessage, setBcMessage] = reactExports.useState(
    "🇮🇳 भारतीय डाक (Dadabari S.O. Kota - 324009): नमस्ते {name}, आपके क्षेत्र (Beat {beat}, मकान {house}) में सुकन्या समृद्धि (8.2%), PLI जीवन बीमा, वरिष्ठ नागरिक बचत (SCSS) एवं डोरस्टेप आधार मोबाइल अपडेशन सुविधा उपलब्ध है। संपर्क: बीट डाकिया।"
  );
  reactExports.useEffect(() => {
    const syncCommData = () => {
      const currentProfile = staffPermissionService.getActiveSession() || userProfile;
      const allLogs = customerService.getCommLogs();
      setLogs(
        allLogs.filter(
          (l) => staffPermissionService.matchesUserBeatScope(currentProfile, {
            beatNo: l.beatNo === "All" ? void 0 : l.beatNo
          })
        )
      );
      setScopedCustomers(
        customerService.getCustomers().filter((c) => staffPermissionService.matchesUserBeatScope(currentProfile, c))
      );
    };
    syncCommData();
    const unsub = customerService.subscribe(syncCommData);
    const unsubStaff = staffPermissionService.subscribe(syncCommData);
    return () => {
      unsub();
      unsubStaff();
    };
  }, [userProfile]);
  const broadcastRecipients = scopedCustomers.filter((c) => {
    const matchBeat = bcBeatFilter === "All" || String(c.beatNo || "2").replace(/^Beat\s*/i, "").trim() === bcBeatFilter;
    if (!matchBeat) return false;
    const interestAndNotes = `${c.financialInterest || ""} ${c.remarks || ""} ${(c.products || []).map((p) => p.productName).join(" ")}`.toLowerCase();
    if (bcCategoryFilter === "SSA_PROSPECTS") {
      return interestAndNotes.includes("ssa") || interestAndNotes.includes("sukanya") || !c.financialInterest;
    }
    if (bcCategoryFilter === "PLI_RPLI") {
      return interestAndNotes.includes("pli") || interestAndNotes.includes("insurance") || interestAndNotes.includes("suraksha");
    }
    if (bcCategoryFilter === "SENIOR_SCSS_MIS") {
      return interestAndNotes.includes("scss") || interestAndNotes.includes("mis") || interestAndNotes.includes("senior") || c.age && c.age >= 55;
    }
    if (bcCategoryFilter === "IPPB_AADHAAR") {
      return interestAndNotes.includes("ippb") || interestAndNotes.includes("aadhaar") || interestAndNotes.includes("celc");
    }
    if (bcCategoryFilter === "SHIFTED_RELOCATED") {
      return Boolean(c.isShifted || c.relocationHistory && c.relocationHistory.length > 0 || interestAndNotes.includes("shifted") || interestAndNotes.includes("left"));
    }
    return true;
  });
  const handleDispatchBulkBroadcast = (e) => {
    e.preventDefault();
    if (!bcMessage.trim() || broadcastRecipients.length === 0) return;
    customerService.dispatchBulkBroadcast({
      beatFilter: bcBeatFilter,
      categoryFilter: bcCategoryFilter,
      channel: bcChannel,
      campaignTitle: bcTitle,
      messageTemplate: bcMessage,
      recipients: broadcastRecipients,
      dispatchedBy: (userProfile == null ? void 0 : userProfile.name) || "Mahendra Kumar Meena"
    });
    setBroadcastBanner(
      `Bulk Broadcast Dispatched: "${bcTitle}" logged & queued for ${broadcastRecipients.length} citizens in ${bcBeatFilter === "All" ? "All Allowed Beats" : `Beat ${bcBeatFilter}`}!`
    );
    setTimeout(() => setBroadcastBanner(null), 4500);
  };
  const handleExportBroadcastCSV = () => {
    const headers = ["Master ID", "Customer Name", "Mobile", "Beat No", "House No", "Sector/Colony", "Personalized Message"];
    const rows = broadcastRecipients.map((c) => {
      var _a;
      const msg = bcMessage.replace(/\{name\}/gi, c.name).replace(/\{beat\}/gi, c.beatNo || "2").replace(/\{house\}/gi, c.houseNo || ((_a = c.address) == null ? void 0 : _a.houseNumber) || "");
      return [
        c.masterId || c.id,
        `"${(c.name || "").replace(/"/g, '""')}"`,
        c.whatsapp || c.mobile || "",
        c.beatNo || "2",
        `"${(c.houseNo || "").replace(/"/g, '""')}"`,
        `"${(c.sector || c.area || "").replace(/"/g, '""')}"`,
        `"${msg.replace(/"/g, '""')}"`
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `POSTMAN_BULK_BROADCAST_BEAT_${bcBeatFilter}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.recipientName.toLowerCase().includes(search.toLowerCase()) || log.mobile.includes(search) || log.content.toLowerCase().includes(search.toLowerCase()) || log.type.toLowerCase().includes(search.toLowerCase());
    const matchesChannel = channelFilter === "All" || log.channel === channelFilter;
    const matchesType = typeFilter === "All" || log.type === typeFilter;
    return matchesSearch && matchesChannel && matchesType;
  });
  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2e3);
  };
  const handleQuickResend = (log) => {
    const cleanPhone = cleanPhoneNumber(log.mobile);
    if (log.channel === "WhatsApp" || log.channel === "Broadcast") {
      const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(log.content)}` : `https://wa.me/?text=${encodeURIComponent(log.content)}`;
      window.open(url, "_blank");
    } else {
      const smsUrl = cleanPhone ? `sms:${cleanPhone}?body=${encodeURIComponent(log.content)}` : `sms:?body=${encodeURIComponent(log.content)}`;
      window.location.href = smsUrl;
    }
  };
  const uniqueTypes = Array.from(new Set(logs.map((l) => l.type).filter(Boolean)));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", id: "communication-view-root", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 24 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-black text-slate-900", children: "Direct Messaging & Communication Hub" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Official India Post multi-channel messaging (WhatsApp & SMS), instant parcel alerts, and broadcast notices" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setShowBroadcastPanel(!showBroadcastPanel),
            className: "px-4 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { size: 15 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: showBroadcastPanel ? "Hide Bulk Broadcast Utility" : "Beat & Category Bulk Broadcast" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setForwardLog(null);
              setShowDirectModal(true);
            },
            className: "px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer",
            id: "open-message-composer-btn",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 15 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "1-to-1 Message / Notice" })
            ]
          }
        )
      ] })
    ] }),
    broadcastBanner && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs font-bold flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16, className: "text-emerald-700 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: broadcastBanner })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setBroadcastBanner(null), className: "text-emerald-800 font-bold", children: "✕" })
    ] }),
    showBroadcastPanel && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        onSubmit: handleDispatchBulkBroadcast,
        className: "bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs",
        id: "bulk-broadcast-utility",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-red-800 uppercase tracking-wide", children: "Targeted Bulk Broadcast Engine · Beat-Wise & Category-Wise Dispatch" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-slate-900", children: "Filter Citizens by Delivery Beat or Scheme Category & Dispatch Official Service Updates" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-500 block", children: "Matched Target Recipients" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg font-black text-emerald-700 font-mono tabular-nums", children: [
                broadcastRecipients.length,
                " Citizens"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block font-bold text-slate-700 mb-1", children: [
                "1. Filter by Beat Scope ",
                !isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-700", children: "(Beat Locked)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: bcBeatFilter,
                  disabled: !isSuperAdmin,
                  onChange: (e) => setBcBeatFilter(e.target.value),
                  className: "w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 disabled:opacity-80",
                  children: [
                    isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "All", children: "All Beats (Global Master Admin)" }),
                    Array.from({ length: 33 }, (_, i) => String(i + 1)).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: b, children: [
                      "Beat ",
                      b
                    ] }, b))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "2. Filter by Service / Scheme Category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: bcCategoryFilter,
                  onChange: (e) => {
                    const cat = e.target.value;
                    setBcCategoryFilter(cat);
                    if (cat === "SSA_PROSPECTS") {
                      setBcTitle("Sukanya Samriddhi (SSA - 8.2%) Doorstep Camp");
                      setBcMessage(
                        "🌸 भारतीय डाक (Dadabari S.O.): नमस्ते {name}, अपनी बिटिया के उज्ज्वल भविष्य हेतु 8.2% टैक्स-फ्री सुकन्या समृद्धि खाता (SSA) घर बैठे खोलें। बीट {beat} डाकिया मकान {house} पर सेवा हेतु उपलब्ध है।"
                      );
                    } else if (cat === "PLI_RPLI") {
                      setBcTitle("PLI / RPLI High-Bonus Insurance Notice");
                      setBcMessage(
                        "🛡️ डाक जीवन बीमा (PLI/RPLI): नमस्ते {name}, भारत सरकार की सर्वाधिक बोनस (₹76/हजार) वाली जीवन बीमा पॉलिसी एवं प्रीमियम सेवा आपके बीट {beat} में उपलब्ध है।"
                      );
                    } else if (cat === "SENIOR_SCSS_MIS") {
                      setBcTitle("Senior Citizen (SCSS 8.2%) & Monthly Income (MIS) Update");
                      setBcMessage(
                        "💰 वरिष्ठ नागरिक बचत योजना (SCSS 8.2%): नमस्ते {name}, डाकघर की सुरक्षित तिमाही पेंशन एवं मासिक आय योजना (MIS 7.4%) की जानकारी हेतु बीट {beat} डाकिया से संपर्क करें।"
                      );
                    } else if (cat === "IPPB_AADHAAR") {
                      setBcTitle("IPPB Doorstep Banking & Aadhaar CELC Mobile Update");
                      setBcMessage(
                        "🆔 डोरस्टेप आधार एवं IPPB बैंकिंग: नमस्ते {name}, आपके क्षेत्र (Beat {beat}) में आधार मोबाइल लिंकिंग, 0-5 वर्ष बाल आधार (CELC) एवं AePS नकद निकासी उपलब्ध है।"
                      );
                    } else if (cat === "SHIFTED_RELOCATED") {
                      setBcTitle("Address Verification & Mail Redirection Confirmation");
                      setBcMessage(
                        "📬 डाक पता सत्यापन (Dadabari S.O.): नमस्ते {name}, आपके नवीन पते ({house}, Beat {beat}) पर डाक एवं पासबुक वितरण निर्बाध रूप से सक्रिय कर दिया गया है।"
                      );
                    }
                  },
                  className: "w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL_CITIZENS", children: "All Verified Citizens in Beat" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "SSA_PROSPECTS", children: "Sukanya Samriddhi (SSY / SSA) Families" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PLI_RPLI", children: "PLI / RPLI Insurance Prospects & Policyholders" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "SENIOR_SCSS_MIS", children: "Senior Citizens (SCSS 8.2% / POMIS)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "IPPB_AADHAAR", children: "IPPB Banking & Doorstep Aadhaar / CELC" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "SHIFTED_RELOCATED", children: "Shifted / Relocated Households" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "3. Dispatch Channel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: bcChannel,
                  onChange: (e) => setBcChannel(e.target.value),
                  className: "w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Broadcast", children: "WhatsApp + Broadcast Notice" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "WhatsApp", children: "WhatsApp Direct Batch" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "SMS", children: "SMS Gateway Batch" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "4. Campaign / Notice Title" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: bcTitle,
                  onChange: (e) => setBcTitle(e.target.value),
                  className: "w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "font-bold text-slate-700", children: [
                "Broadcast Message Template (Supports ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-red-700", children: "{name}" }),
                ",",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-red-700", children: "{beat}" }),
                ",",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-red-700", children: "{house}" }),
                " tags)"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-slate-500", children: [
                "Previewing top ",
                Math.min(5, broadcastRecipients.length),
                " of ",
                broadcastRecipients.length,
                " recipients"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                rows: 3,
                value: bcMessage,
                onChange: (e) => setBcMessage(e.target.value),
                className: "w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 leading-relaxed"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-500", children: [
              "Sample Recipients:",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-800", children: broadcastRecipients.slice(0, 4).map((r) => `${r.name} (B-${r.beatNo || "2"})`).join(", ") || "None matching filter" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: handleExportBroadcastCSV,
                  className: "px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer",
                  children: "Export Broadcast List (CSV)"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "submit",
                  disabled: broadcastRecipients.length === 0,
                  className: "px-5 py-2 bg-red-800 hover:bg-red-900 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 14 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      "Dispatch Bulk Broadcast (",
                      broadcastRecipients.length,
                      " Citizens)"
                    ] })
                  ]
                }
              )
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-slate-500 font-medium", children: "Total Dispatches" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-slate-900 mt-1", children: logs.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-emerald-600 font-semibold", children: "WhatsApp Messages" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-emerald-700 mt-1", children: logs.filter((l) => l.channel === "WhatsApp").length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-blue-600 font-semibold", children: "SMS Dispatches" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-blue-700 mt-1", children: logs.filter((l) => l.channel === "SMS").length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-purple-600 font-semibold", children: "Beat Broadcasts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-purple-700 mt-1", children: logs.filter((l) => l.channel === "Broadcast").length })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            placeholder: "Search communication logs by recipient, mobile, purpose, or text...",
            value: search,
            onChange: (e) => setSearch(e.target.value),
            className: "w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: channelFilter,
            onChange: (e) => setChannelFilter(e.target.value),
            className: "px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "All", children: "All Channels" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "WhatsApp", children: "WhatsApp" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "SMS", children: "SMS" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Broadcast", children: "Broadcast" })
            ]
          }
        ),
        uniqueTypes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: typeFilter,
            onChange: (e) => setTypeFilter(e.target.value),
            className: "px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "All", children: "All Categories" }),
              uniqueTypes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t))
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs text-left text-slate-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-[11px] text-slate-600 uppercase bg-slate-100/80 border-b border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Dispatch ID" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Recipient Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Channel & Beat" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Purpose / Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Message Content" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Timestamp" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-100", children: filteredLogs.length > 0 ? filteredLogs.map((log) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-slate-50 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap", children: log.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900", children: log.recipientName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[11px] text-slate-500", children: log.mobile })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-0.5 rounded font-semibold text-[11px] ${log.channel === "WhatsApp" ? "bg-emerald-100 text-emerald-800" : log.channel === "SMS" ? "bg-blue-100 text-blue-800" : log.channel === "Broadcast" ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-700"}`, children: log.channel }),
          log.beatNo && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded", children: [
            "B-",
            log.beatNo
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-semibold text-slate-800 whitespace-nowrap", children: log.type }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-slate-700 max-w-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "line-clamp-2 leading-relaxed", children: log.content }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-slate-500 text-[11px] whitespace-nowrap", children: log.timestamp }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `px-2 py-0.5 font-bold rounded text-[11px] ${log.status === "Delivered" ? "bg-emerald-50 text-emerald-700" : log.status === "Sent" ? "bg-blue-50 text-blue-700" : log.status === "Forwarded" ? "bg-purple-50 text-purple-700" : "bg-slate-100 text-slate-700"}`, children: [
          "✓ ",
          log.status
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleCopyText(log.id, log.content),
              className: "p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition",
              title: "Copy message content",
              children: copiedId === log.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 13, className: "text-emerald-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 13 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setForwardLog(log);
                setShowDirectModal(true);
              },
              className: "p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition",
              title: "Forward this message to another customer or postman",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Forward, { size: 13 })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleQuickResend(log),
              className: "p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition",
              title: "Re-open in WhatsApp or SMS",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 13 })
            }
          )
        ] }) })
      ] }, log.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "text-center py-10 text-slate-400", children: "No communication records found matching your filters." }) }) })
    ] }) }) }),
    showDirectModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      DirectMessageModal,
      {
        isOpen: showDirectModal,
        onClose: () => {
          setShowDirectModal(false);
          setForwardLog(null);
        },
        initialMessage: forwardLog ? forwardLog.content : "",
        initialCustomer: (forwardLog == null ? void 0 : forwardLog.customerId) ? customerService.getCustomerById(forwardLog.customerId) || null : null
      }
    )
  ] });
}
export {
  CommunicationView as default
};
