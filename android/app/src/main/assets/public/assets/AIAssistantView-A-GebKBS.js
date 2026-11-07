import { c as createLucideIcon, a as useNavigate, r as reactExports, am as getVerifiedDadabari324009Registry, ao as notificationScannerService, j as jsxRuntimeExports, C as CircleCheck, y as ShieldCheck, b3 as Bell, aa as User, U as Users, e as MapPin, aW as Award, ak as ExternalLink, V as Pen, Q as Navigation, _ as Check, aj as Clock, P as Plus, K as Sparkles, ah as ArrowRight, af as Send, n as CustomerProfileModal, X, ap as ingestVerifiedStoreToCrm, b as customerService, ac as POSTAL_PRODUCTS, an as getStoredCscDirectory, a2 as DEFAULT_SEQUENTIAL_PROPERTIES, b4 as BEAT_STAFF_LOOKUP } from "./index-BWTx-a8O.js";
import { S as Store } from "./store-Dd3zaCDF.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M12 8V4H8", key: "hb8ula" }],
  ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2", key: "enze0r" }],
  ["path", { d: "M2 14h2", key: "vft8re" }],
  ["path", { d: "M20 14h2", key: "4cs60a" }],
  ["path", { d: "M15 13v2", key: "1xurst" }],
  ["path", { d: "M9 13v2", key: "rq6x2g" }]
];
const Bot = createLucideIcon("bot", __iconNode$1);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    { d: "M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344", key: "2acyp4" }
  ],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
];
const SquareCheckBig = createLucideIcon("square-check-big", __iconNode);
function AIAssistantView() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = reactExports.useState([]);
  const [verifiedStores, setVerifiedStores] = reactExports.useState(getVerifiedDadabari324009Registry());
  const [ingestedIds, setIngestedIds] = reactExports.useState(/* @__PURE__ */ new Set());
  const [toastMessage, setToastMessage] = reactExports.useState(null);
  const [selectedCustomerForModal, setSelectedCustomerForModal] = reactExports.useState(null);
  const [statusModalItem, setStatusModalItem] = reactExports.useState(null);
  const [deliveryRemark, setDeliveryRemark] = reactExports.useState("");
  const [schemeInterest, setSchemeInterest] = reactExports.useState("PLI Suraksha");
  const [leadStatus, setLeadStatus] = reactExports.useState("Interested");
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };
  reactExports.useEffect(() => {
    const update = () => {
      setNotifications(notificationScannerService.getNotifications());
      const stores = getVerifiedDadabari324009Registry();
      setVerifiedStores(stores);
      setIngestedIds(new Set(stores.filter((s) => s.ingestedToCrm).map((s) => s.id)));
    };
    update();
    const unsub = notificationScannerService.subscribe(update);
    return () => unsub();
  }, []);
  const [messages, setMessages] = reactExports.useState([
    {
      id: "m1",
      sender: "ai",
      text: 'Namaskar, Boss! I am the Official Senior AI Field Operations & Intelligence Assistant for "POSTMAN BOOK CRM" (Dadabari S.O. Ecosystem, Pincode 324009).\n\n⚡ Lightning-Fast Master Capabilities:\n• Direct 10-digit Mobile lookup (e.g. 8769706002, 9414589201)\n• Instant Resident & Family search across Beats 1 to 33\n• Colony / Landmark / House No. matching\n• Daily pending field tasks with status toggles\n• 100% Reality-Checked Pincode 324009 commercial registry (Zero dead data)',
      options: [
        "Search Resident: 8769706002",
        "Beat 2 Resident Directory & Route",
        "Daily Pending Field Tasks & Deliveries",
        "Reality-Check: Active Stores in Pincode 324009",
        "Active Field Alerts & Direct-Jump Notifications"
      ]
    }
  ]);
  const [input, setInput] = reactExports.useState("");
  const handleFieldJump = (notif) => {
    notificationScannerService.markAsResolved(notif.id);
    navigate(notif.targetRoute, { state: { searchKeyword: notif.filterKeyword, autoFocusFix: true } });
  };
  const handleIngestStore = (store) => {
    const res = ingestVerifiedStoreToCrm(store);
    if (res.success) {
      setIngestedIds((prev) => /* @__PURE__ */ new Set([...prev, store.id]));
      setVerifiedStores(getVerifiedDadabari324009Registry());
      showToast(res.message);
    }
  };
  const handleMarkTaskComplete = (taskId) => {
    customerService.updateTask(taskId, { status: "Completed", progressPercent: 100 });
    showToast(`Task ${taskId} marked as Completed!`);
    setMessages((prev) => prev.map((m) => {
      if (!m.taskResults) return m;
      return {
        ...m,
        taskResults: m.taskResults.map((t) => t.id === taskId ? { ...t, status: "Completed", householdsCovered: t.householdsTarget } : t)
      };
    }));
  };
  const handleRescheduleTask = (taskId) => {
    const tomorrow = /* @__PURE__ */ new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    customerService.updateTask(taskId, { scheduledDate: dateStr, status: "Pending" });
    showToast(`Task ${taskId} rescheduled for tomorrow (${dateStr})!`);
    setMessages((prev) => prev.map((m) => {
      if (!m.taskResults) return m;
      return {
        ...m,
        taskResults: m.taskResults.map((t) => t.id === taskId ? { ...t, scheduledDate: dateStr, status: "Rescheduled" } : t)
      };
    }));
  };
  const handleSaveStatusModal = () => {
    if (!statusModalItem) return;
    const newLead = {
      customerName: statusModalItem.name,
      customerMobile: statusModalItem.primaryMobile,
      productName: schemeInterest,
      productCategory: "Postal Life Insurance",
      stage: leadStatus === "Interested" ? "Interested" : "Follow-up Scheduled",
      beatNo: statusModalItem.beatNo,
      notes: `Delivery/Field Remark: ${deliveryRemark || "Status updated via AI Field Operations Assistant"}`
    };
    customerService.createLead(newLead);
    showToast(`Status & Lead logged for ${statusModalItem.name}!`);
    setStatusModalItem(null);
    setDeliveryRemark("");
  };
  const executeMasterIndexSearch = (query) => {
    const q = query.trim().toLowerCase();
    const cleanDigits = q.replace(/\D/g, "");
    cleanDigits.length >= 10;
    const allCustomers = customerService.getCustomers();
    const allLeads = customerService.getLeads();
    const allTasks = customerService.getTasks();
    const verifiedStores2 = getVerifiedDadabari324009Registry();
    const cscDirectory = getStoredCscDirectory();
    const matchedResidents = [];
    DEFAULT_SEQUENTIAL_PROPERTIES.forEach((seq) => {
      var _a;
      const matchMobile = cleanDigits && (seq.primaryMobile.includes(cleanDigits) || seq.whatsapp && seq.whatsapp.includes(cleanDigits));
      const matchName = seq.primaryCustomerName.toLowerCase().includes(q) || seq.residents.some((r) => r.toLowerCase().includes(q));
      const matchColony = seq.colony.toLowerCase().includes(q);
      const matchPlot = seq.housePlotNumber.toLowerCase().includes(q);
      const matchBeat = seq.beatNo.toLowerCase() === q || seq.beatNo.toLowerCase().includes(q);
      const matchLandmark = seq.landmark.toLowerCase().includes(q);
      if (matchMobile || matchName || matchColony || matchPlot || matchBeat || matchLandmark) {
        const relLeads = allLeads.filter(
          (l) => l.customerMobile === seq.primaryMobile || l.customerName.toLowerCase() === seq.primaryCustomerName.toLowerCase()
        ).map((l) => `${l.productName} (${l.stage})`);
        if (relLeads.length === 0) {
          relLeads.push("PLI Suraksha (Eligible)", "Sukanya Samriddhi (SSY)", "IPPB Digital Account");
        }
        matchedResidents.push({
          id: seq.id,
          name: seq.primaryCustomerName,
          roleInFamily: "Head of Household",
          familyMembers: seq.residents.filter((r) => r !== seq.primaryCustomerName),
          housePlotNumber: seq.housePlotNumber,
          colony: seq.colony,
          landmark: seq.landmark,
          pincode: seq.pincode,
          deliveryOffice: "Dadabari S.O.",
          beatNo: seq.beatNo,
          assignedStaffName: seq.assignedStaffName,
          assignedStaffId: seq.assignedStaffId,
          assignedStaffRole: seq.assignedStaffRole,
          assignedStaffContact: ((_a = BEAT_STAFF_LOOKUP[seq.beatNo]) == null ? void 0 : _a.contact) || "8769706002",
          primaryMobile: seq.primaryMobile,
          whatsapp: seq.whatsapp,
          propertyType: seq.propertyType,
          verificationStatus: seq.verificationStatus,
          activeSchemeLeads: relLeads,
          lastMileNote: seq.lastMileNote
        });
      }
    });
    allCustomers.forEach((cust) => {
      const matchMobile = cleanDigits && (cust.mobile && cust.mobile.includes(cleanDigits) || cust.alternateMobile && cust.alternateMobile.includes(cleanDigits));
      const matchName = (cust.name || "").toLowerCase().includes(q);
      const matchColony = (cust.area || cust.sectorLocality || "").toLowerCase().includes(q);
      const matchHouse = (cust.houseNo || "").toLowerCase().includes(q);
      const matchBeat = (cust.beatNo || "").toLowerCase() === q || (cust.beatNo || "").toLowerCase().includes(q);
      const matchLandmark = (cust.landmark || "").toLowerCase().includes(q);
      if (matchMobile || matchName || matchColony || matchHouse || matchBeat || matchLandmark) {
        if (!matchedResidents.some((r) => r.primaryMobile === cust.mobile && r.name.toLowerCase() === cust.name.toLowerCase())) {
          const beatNum = cust.beatNo || "Beat 2";
          const staffInfo = BEAT_STAFF_LOOKUP[beatNum] || {
            name: "Mahendra Kumar Meena",
            id: "STAFF-50457421",
            role: "GDS/PMAN",
            contact: "8769706002"
          };
          const fam = (cust.householdMembers || []).map((m) => m.name);
          const relLeads = allLeads.filter(
            (l) => l.customerMobile === cust.mobile || l.customerName.toLowerCase() === cust.name.toLowerCase()
          ).map((l) => `${l.productName} (${l.stage})`);
          if (relLeads.length === 0) {
            relLeads.push("IPPB Digital Account", "PLI Insurance");
          }
          matchedResidents.push({
            id: cust.id,
            name: cust.name,
            roleInFamily: cust.isHeadOfFamily ? "Head of Household" : "Family Member",
            familyMembers: fam,
            housePlotNumber: cust.houseNo || "House No. Recorded",
            colony: cust.area || cust.sectorLocality || "Dadabari Ecosystem",
            landmark: cust.landmark || "Dadabari S.O. Jurisdiction",
            pincode: cust.pincode || "324009",
            deliveryOffice: cust.officeId || "Dadabari S.O.",
            beatNo: beatNum,
            assignedStaffName: cust.assignedStaffName || staffInfo.name,
            assignedStaffId: cust.assignedStaffId || staffInfo.id,
            assignedStaffRole: staffInfo.role,
            assignedStaffContact: staffInfo.contact,
            primaryMobile: cust.mobile,
            whatsapp: cust.alternateMobile || cust.mobile,
            propertyType: cust.type || "Residential",
            verificationStatus: cust.verificationStatus || "Verified",
            activeSchemeLeads: relLeads,
            lastMileNote: cust.remarks || cust.notes || "Field verification record active in Postman Book CRM.",
            rawCustomer: cust
          });
        }
      }
    });
    const matchedTasks = allTasks.filter((t) => {
      const matchText = (t.title || "").toLowerCase().includes(q) || (t.category || "").toLowerCase().includes(q) || (t.location || "").toLowerCase().includes(q) || (t.assignedStaffName || "").toLowerCase().includes(q) || (t.beatNo || "").toLowerCase().includes(q);
      const isTaskKeyword = q.includes("task") || q.includes("pending") || q.includes("delivery") || q.includes("urgent") || q.includes("follow");
      return matchText || isTaskKeyword && t.status !== "Completed";
    }).map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      beatNo: t.beatNo || "Beat 2",
      assignedStaffName: t.assignedStaffName || "Mahendra Kumar Meena",
      assignedStaffId: t.assignedStaffId || "STAFF-50457421",
      priority: t.priority || "Urgent",
      scheduledDate: t.scheduledDate || "Today",
      householdsTarget: t.householdsTarget || 5,
      householdsCovered: t.householdsCovered || 0,
      status: t.status || "Pending",
      location: t.location || "Santoshi Nagar / Keshavpura Beat 2"
    }));
    const matchedStores = verifiedStores2.filter((s) => {
      return s.storeName.toLowerCase().includes(q) || s.ownerName.toLowerCase().includes(q) || s.colony.toLowerCase().includes(q) || s.landmark.toLowerCase().includes(q) || s.beatNo.toLowerCase() === q || cleanDigits && (s.primaryMobile.includes(cleanDigits) || s.whatsapp.includes(cleanDigits));
    });
    const matchedCsc = cscDirectory.filter((c) => {
      return c.businessName.toLowerCase().includes(q) || c.operatorName.toLowerCase().includes(q) || c.colony.toLowerCase().includes(q) || c.landmark.toLowerCase().includes(q) || c.beatNo.toLowerCase() === q || cleanDigits && (c.primaryMobile.includes(cleanDigits) || c.whatsapp.includes(cleanDigits));
    });
    return {
      residents: matchedResidents,
      tasks: matchedTasks,
      stores: matchedStores,
      cscList: matchedCsc,
      leads: allLeads.filter((l) => (l.customerName || "").toLowerCase().includes(q) || cleanDigits && (l.customerMobile || "").includes(cleanDigits))
    };
  };
  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      let aiReply;
      const lower = query.toLowerCase();
      const cleanDigits = lower.replace(/\D/g, "");
      const searchRes = executeMasterIndexSearch(query);
      if (cleanDigits.length >= 10 && searchRes.residents.length > 0 || searchRes.residents.length > 0 && !lower.includes("task") && !lower.includes("notification") && !lower.includes("324009 store")) {
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `Namaskar, Boss! Master Index Match Found across Dadabari S.O. Ecosystem.

Matched ${searchRes.residents.length} resident profile(s) with full family details, delivery jurisdiction, assigned postman credentials, and active scheme leads. You can execute direct actions right from the cards:`,
          residentResults: searchRes.residents.slice(0, 6),
          options: [
            "Daily Pending Field Tasks & Deliveries",
            "Reality-Check: Active Stores in Pincode 324009",
            "Active Field Alerts & Direct-Jump Notifications"
          ]
        };
      } else if (lower.includes("task") || lower.includes("delivery") || lower.includes("deliveries") || lower.includes("pending") || lower.includes("follow-up") || lower.includes("schedule")) {
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `Namaskar, Boss! Proactive Field Operations Summary for Dadabari S.O. (Beat 1 to 33).

Here are the active pending deliveries, urgent doorstep tasks, and follow-ups. Use the status toggles to update live or launch GPS directions:`,
          taskResults: searchRes.tasks.slice(0, 8),
          options: [
            "Search Resident: 8769706002",
            "Beat 2 Resident Directory & Route",
            "Reality-Check: Active Stores in Pincode 324009"
          ]
        };
      } else if (lower.includes("324009") || lower.includes("reality") || lower.includes("verified store") || lower.includes("active store") || lower.includes("zero dead") || lower.includes("kirana") || lower.includes("merchant") || lower.includes("general store") || lower.includes("dadabari store") || searchRes.stores.length > 0) {
        const matched = searchRes.stores.length > 0 ? searchRes.stores : getVerifiedDadabari324009Registry();
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `Namaskar, Boss! Reality-Check Complete for Pincode 324009 (Dadabari S.O. Delivery Ecosystem).

Verified ${matched.length} active, on-ground commercial establishments with Zero Dead Data. All stores are verified operational, mapped to postal beats (Beat 1–33), and bound to designated postman Staff IDs:`,
          storeResults: matched,
          options: [
            "Sync All 324009 Stores to CRM",
            "View in Dadabari Commercial Hub (/businesses)",
            "Scan Field Alerts & Notifications"
          ]
        };
      } else if (lower.includes("notification") || lower.includes("alert") || lower.includes("gap") || lower.includes("address") || lower.includes("incomplete") || lower.includes("jump")) {
        const notifs = notificationScannerService.getNotifications();
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `Scanned all modules across Dadabari S.O. Ecosystem.

Found ${notifs.length} active field notifications requiring operational resolution. Each card tracks origin metadata (Module, Beat, Assigned Staff ID) with a direct "[Jump to Field & Fix]" trigger:`,
          notificationResults: notifs,
          options: [
            "Reality-Check: Active Stores in Pincode 324009",
            "Pending Scheme Leads & PLI Follow-ups",
            "View Sequence-Wise Property Hub"
          ]
        };
      } else if (lower.includes("sukanya") || lower.includes("ssa")) {
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: "Sukanya Samriddhi Account (SSA) is currently offering 8.2% p.a. compound interest (Triple Tax Free EEE under Sec 80C).\n\n• Minimum annual deposit: ₹250\n• Maximum annual deposit: ₹1,50,000\n• Deposit period: 15 Years\n• Total Maturity period: 21 Years from account opening\n• Doorstep document verification available for Beat 2 & 6.",
          productCard: POSTAL_PRODUCTS.find((p) => p.code === "SSA")
        };
      } else if (lower.includes("pli") || lower.includes("suraksha") || lower.includes("insurance")) {
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: "Postal Life Insurance (PLI Suraksha - Whole Life Assurance) offers the highest sovereign bonus in India at ₹76 per ₹1,000 Sum Assured per year.\n\n• Lowest premium rates compared to commercial insurers\n• Eligible for Govt/Semi-Govt employees, Professionals, and Accredited entities\n• Loan facility available after 4 years.",
          productCard: POSTAL_PRODUCTS.find((p) => p.code === "PLI_SURAKSHA")
        };
      } else {
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `Namaskar, Boss! Query processed for "${query}".

You can search for:
• Any 10-digit mobile number (e.g. 8769706002)
• Resident names (Roshni Sakywal, Pritviraj, Depti Mehra)
• Beat lists (Beat 2, Beat 6, Beat 14)
• Daily tasks or pending deliveries
• Reality-checked stores in 324009`,
          options: [
            "Search Resident: 8769706002",
            "Beat 2 Resident Directory & Route",
            "Daily Pending Field Tasks & Deliveries",
            "Reality-Check: Active Stores in Pincode 324009"
          ]
        };
      }
      setMessages((prev) => [...prev, aiReply]);
    }, 400);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-5xl mx-auto", id: "ai-assistant-page-root", children: [
    toastMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-emerald-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 border border-emerald-700 animate-in fade-in slide-in-from-top duration-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs sm:text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-emerald-300 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: toastMessage })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setToastMessage(null),
          className: "text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg font-bold cursor-pointer",
          children: "Dismiss"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-800 to-slate-900 text-amber-300 flex items-center justify-center font-black shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 26 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-black text-slate-900 tracking-tight", children: "AI Field Operations & Verification Assistant" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 font-mono text-[11px] font-bold border border-red-200", children: "Dadabari S.O. 324009" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-600 mt-0.5", children: "10-Digit Mobile Search • Door-to-Door Resident Cards • Daily Task Toggles • Pincode 324009 Zero Dead Data" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { size: 13, className: "text-amber-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            notifications.length,
            " Action Alerts"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3.5 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 13, className: "text-emerald-300" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            verifiedStores.length,
            " Stores Verified"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col h-[720px] overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50/60", children: messages.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `flex gap-3 ${m.sender === "user" ? "flex-row-reverse" : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 font-black shadow-xs ${m.sender === "user" ? "bg-red-700 text-white" : "bg-slate-900 text-amber-300"}`,
                children: m.sender === "user" ? /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 16 })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `max-w-[92%] rounded-3xl p-5 shadow-xs space-y-3.5 ${m.sender === "user" ? "bg-red-700 text-white rounded-tr-xs" : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap leading-relaxed text-sm font-medium", children: m.text }),
                  m.residentResults && m.residentResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-2 border-t border-slate-100", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-black text-slate-700 uppercase tracking-wider", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 14, className: "text-red-700" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          "Resident & Family Master Records (",
                          m.residentResults.length,
                          "):"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 font-mono", children: "BEAT 1–33 ECOSYSTEM" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3.5", children: m.residentResults.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: "p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-red-300 hover:shadow-md transition space-y-3",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 border-b border-slate-100 pb-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-black text-slate-900 text-sm", children: r.name }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-100 text-red-900 border border-red-200", children: r.roleInFamily || "Head" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700", children: r.propertyType })
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-600 mt-1 flex items-center gap-1", children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 11, className: "text-slate-400 shrink-0" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                                  "Family: ",
                                  r.familyMembers.length > 0 ? r.familyMembers.join(", ") : "Single Resident Profile"
                                ] })
                              ] })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 bg-slate-900 text-amber-300 font-mono text-[10px] font-bold rounded-lg shrink-0", children: r.beatNo })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-600 space-y-1", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-1.5", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 12, className: "text-red-600 shrink-0 mt-0.5" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-slate-800", children: [
                                r.housePlotNumber,
                                ", ",
                                r.colony,
                                " (PIN ",
                                r.pincode,
                                ")"
                              ] })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-4 text-[10px] text-slate-500", children: [
                              "📍 Landmark: ",
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-700 font-medium", children: r.landmark })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pl-4 font-mono text-[10px]", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                                "📱 ",
                                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: r.primaryMobile })
                              ] }),
                              r.whatsapp && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-emerald-700", children: [
                                "WA: ",
                                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: r.whatsapp })
                              ] })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-0.5", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-800", children: "Assigned Postman:" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-purple-700 font-bold", children: r.assignedStaffId })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-700 font-semibold flex items-center justify-between", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                                r.assignedStaffName,
                                " (",
                                r.assignedStaffRole,
                                ")"
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                                "📞 ",
                                r.assignedStaffContact
                              ] })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 11, className: "text-amber-500" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Active Scheme Leads:" })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: r.activeSchemeLeads.map((sch, sIdx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "span",
                              {
                                className: "px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-md text-[10px] font-semibold",
                                children: sch
                              },
                              sIdx
                            )) })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 font-bold text-[10px]", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "button",
                              {
                                type: "button",
                                onClick: () => {
                                  if (r.rawCustomer) {
                                    setSelectedCustomerForModal(r.rawCustomer);
                                  } else {
                                    navigate("/unified-family", { state: { searchKeyword: r.primaryMobile } });
                                  }
                                },
                                className: "py-2 px-1.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs",
                                title: "Open complete family database profile",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 11, className: "text-amber-300" }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "[Profile & Hub]" })
                                ]
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "button",
                              {
                                type: "button",
                                onClick: () => setStatusModalItem(r),
                                className: "py-2 px-1.5 bg-red-700 hover:bg-red-800 text-white rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs",
                                title: "Update last-mile delivery notes and convert postal schemes",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 11 }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "[Update Status]" })
                                ]
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "button",
                              {
                                type: "button",
                                onClick: () => {
                                  const mapQuery = `${r.housePlotNumber}, ${r.landmark}, ${r.colony}, Kota, Rajasthan ${r.pincode}`;
                                  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`, "_blank");
                                },
                                className: "py-2 px-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer",
                                title: "Launch Google Maps beat route navigation",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { size: 11, className: "text-blue-700" }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "[Navigate Map]" })
                                ]
                              }
                            )
                          ] })
                        ]
                      },
                      r.id
                    )) })
                  ] }),
                  m.taskResults && m.taskResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-2 border-t border-slate-100", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-black text-slate-700 uppercase tracking-wider", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { size: 14, className: "text-red-700" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          "Daily Field Tasks & Pending Deliveries (",
                          m.taskResults.length,
                          "):"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-mono", children: "ACTIONABLE FIELD TOGGLES" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5", children: m.taskResults.map((tsk) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: `p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${tsk.status === "Completed" ? "bg-emerald-50/70 border-emerald-200" : tsk.priority === "Urgent" ? "bg-red-50/70 border-red-200" : "bg-white border-slate-200"}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "span",
                                {
                                  className: `px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${tsk.status === "Completed" ? "bg-emerald-700 text-white" : tsk.priority === "Urgent" ? "bg-red-600 text-white" : "bg-amber-600 text-white"}`,
                                  children: tsk.status === "Completed" ? "Completed" : tsk.priority
                                }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 bg-slate-900 text-amber-300 font-mono text-[10px] font-bold rounded-md", children: tsk.beatNo }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold text-slate-700", children: tsk.category })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900 text-xs sm:text-sm", children: tsk.title }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-500 flex items-center gap-2 flex-wrap", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                                "📍 ",
                                tsk.location
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                                "Postman: ",
                                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: tsk.assignedStaffName }),
                                " (",
                                tsk.assignedStaffId,
                                ")"
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                                "Scheduled: ",
                                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: tsk.scheduledDate })
                              ] })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 shrink-0", children: [
                            tsk.status !== "Completed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "button",
                                {
                                  type: "button",
                                  onClick: () => handleMarkTaskComplete(tsk.id),
                                  className: "px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-xl transition flex items-center gap-1 shadow-2xs cursor-pointer",
                                  title: "Mark task completed",
                                  children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12 }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "[Complete]" })
                                  ]
                                }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                                "button",
                                {
                                  type: "button",
                                  onClick: () => handleRescheduleTask(tsk.id),
                                  className: "px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold rounded-xl transition flex items-center gap-1 cursor-pointer",
                                  title: "Reschedule task for tomorrow",
                                  children: [
                                    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 12, className: "text-amber-600" }),
                                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "[Reschedule]" })
                                  ]
                                }
                              )
                            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-emerald-800 font-bold text-xs bg-emerald-100/80 px-2.5 py-1 rounded-lg", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 13 }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Done" })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "button",
                              {
                                type: "button",
                                onClick: () => {
                                  const mapQuery = `${tsk.location}, Kota, Rajasthan 324009`;
                                  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`, "_blank");
                                },
                                className: "px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-bold rounded-xl transition flex items-center gap-1 cursor-pointer",
                                title: "Navigate to task location on Google Maps",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { size: 12, className: "text-blue-700" }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Map" })
                                ]
                              }
                            )
                          ] })
                        ]
                      },
                      tsk.id
                    )) })
                  ] }),
                  m.storeResults && m.storeResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-2 border-t border-slate-100", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-black text-slate-700 uppercase tracking-wider", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Store, { size: 14, className: "text-red-700" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          "Pincode 324009 Active Store Verification (",
                          m.storeResults.length,
                          " Units):"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono", children: "ZERO DEAD DATA • 100% OPERATIONAL" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-2xl border border-slate-200 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left text-xs border-collapse", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-slate-100 text-slate-700 font-bold border-b border-slate-200", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Store / Signboard Name" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Proprietor & Contact" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Plot, Colony & Landmark" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Beat & Postman Staff ID" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Category Tag" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-right", children: "Action Triggers" })
                      ] }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-100", children: m.storeResults.map((store) => {
                        const isIngested = ingestedIds.has(store.id);
                        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-red-50/40 transition", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-slate-900", children: store.storeName }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-emerald-700 font-bold flex items-center gap-0.5 mt-0.5", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 10 }),
                              " Active & Operating"
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3 font-mono", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-800", children: store.ownerName }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-600 font-semibold", children: [
                              "📱 ",
                              store.primaryMobile
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-emerald-700 font-semibold text-[10px]", children: [
                              "WA: ",
                              store.whatsapp
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-800 font-semibold", children: [
                              store.housePlotNumber,
                              ", ",
                              store.colony
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-slate-500", children: [
                              "PIN 324009 • Landmark: ",
                              store.landmark
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 font-mono text-[10px] font-bold", children: store.beatNo }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-700 font-semibold mt-0.5", children: store.assignedStaffName }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-purple-700 font-mono", children: store.assignedStaffId })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "span",
                              {
                                className: `px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight ${store.categoryTag === "Commercial • eMitra / CSC" ? "bg-amber-100 text-amber-900 border border-amber-200" : "bg-blue-100 text-blue-900 border border-blue-200"}`,
                                children: store.categoryTag
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] text-slate-400 mt-0.5", children: [
                              "Audit: ",
                              store.lastAuditDate
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1.5 flex-wrap", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "button",
                              {
                                type: "button",
                                onClick: () => handleIngestStore(store),
                                className: `px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-0.5 cursor-pointer ${isIngested ? "bg-slate-200 text-slate-700" : "bg-red-700 hover:bg-red-800 text-white shadow-2xs"}`,
                                title: "Sync to CRM Master",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 10 }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isIngested ? "Synced" : "[Sync CRM]" })
                                ]
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "button",
                              {
                                type: "button",
                                onClick: () => navigate("/businesses", { state: { searchKeyword: store.storeName } }),
                                className: "px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-bold transition cursor-pointer",
                                title: "Verify spatial location and details",
                                children: "[Verify Loc]"
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "button",
                              {
                                type: "button",
                                onClick: () => navigate("/sequence-properties", { state: { searchKeyword: store.colony } }),
                                className: "px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-bold transition cursor-pointer",
                                title: "Map store into door-to-door beat delivery sequence",
                                children: "[Map Beat]"
                              }
                            )
                          ] }) })
                        ] }, store.id);
                      }) })
                    ] }) })
                  ] }),
                  m.notificationResults && m.notificationResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-2 border-t border-slate-100", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-black text-slate-500 uppercase tracking-wider block", children: "Origin-Tracked Action Alerts:" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: m.notificationResults.map((notif) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "div",
                      {
                        className: `p-4 rounded-2xl border transition flex flex-col justify-between space-y-2.5 ${notif.priority === "Urgent" ? "bg-red-50/70 border-red-200" : notif.priority === "Pending Verification" ? "bg-amber-50/70 border-amber-200" : "bg-indigo-50/70 border-indigo-200"}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-1 mb-1.5", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "span",
                                {
                                  className: `px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${notif.priority === "Urgent" ? "bg-red-600 text-white" : notif.priority === "Pending Verification" ? "bg-amber-600 text-white" : "bg-indigo-700 text-white"}`,
                                  children: notif.priority
                                }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-black px-2 py-0.5 bg-slate-900 text-amber-300 rounded-md", children: notif.beatNo })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-slate-900 text-xs", children: notif.title }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-600 mt-1 leading-relaxed", children: notif.description })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-2 border-t border-slate-200/60", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-slate-500 flex items-center justify-between", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                                "Module: ",
                                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: notif.sourceModule })
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                                "Staff: ",
                                /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: notif.assignedStaffName })
                              ] })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs(
                              "button",
                              {
                                type: "button",
                                onClick: () => handleFieldJump(notif),
                                className: "w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer",
                                children: [
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 13, className: "text-amber-400" }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "[Jump to Field & Fix]" }),
                                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 13 })
                                ]
                              }
                            )
                          ] })
                        ]
                      },
                      notif.id
                    )) })
                  ] }),
                  m.productCard && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900", children: m.productCard.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-slate-500", children: m.productCard.shortDesc })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        type: "button",
                        onClick: () => navigate("/services"),
                        className: "px-3 py-1.5 bg-red-700 text-white rounded-xl font-bold flex items-center gap-1",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "View Brochure" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 12 })
                        ]
                      }
                    )
                  ] }),
                  m.options && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 pt-2", children: m.options.map((opt, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => handleSend(opt),
                      className: "px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer border border-slate-200",
                      children: opt
                    },
                    i
                  )) })
                ]
              }
            )
          ]
        },
        m.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "form",
        {
          onSubmit: (e) => {
            e.preventDefault();
            handleSend();
          },
          className: "p-4 bg-white border-t border-slate-200 flex items-center gap-3 shrink-0",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: input,
                onChange: (e) => setInput(e.target.value),
                placeholder: "Search by 10-digit mobile (8769706002), resident name, tasks, or Beat 1-33...",
                className: "flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:bg-white transition"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "submit",
                disabled: !input.trim(),
                className: "px-5 py-3 bg-gradient-to-r from-red-700 to-slate-900 hover:from-red-800 hover:to-slate-950 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md cursor-pointer",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Send" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 15 })
                ]
              }
            )
          ]
        }
      )
    ] }),
    selectedCustomerForModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      CustomerProfileModal,
      {
        customer: selectedCustomerForModal,
        onClose: () => setSelectedCustomerForModal(null),
        onEdit: () => {
        }
      }
    ),
    statusModalItem && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-slate-100 pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-black text-slate-900", children: "Update Delivery & Scheme Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500", children: [
            statusModalItem.name,
            " • ",
            statusModalItem.housePlotNumber,
            ", ",
            statusModalItem.colony,
            " (",
            statusModalItem.beatNo,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setStatusModalItem(null),
            className: "w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 16 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3.5 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Last-Mile Delivery / Verification Note:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              rows: 3,
              value: deliveryRemark,
              onChange: (e) => setDeliveryRemark(e.target.value),
              placeholder: "e.g. Handed over parcel to family head. Doorbell rung at left pillar. Customer requested SSY form.",
              className: "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-hidden"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Postal Scheme Interest:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: schemeInterest,
                onChange: (e) => setSchemeInterest(e.target.value),
                className: "w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-red-600",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PLI Suraksha", children: "PLI Suraksha (Whole Life)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PLI Santosh", children: "PLI Santosh (Endowment)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Sukanya Samriddhi (SSY)", children: "Sukanya Samriddhi (SSY)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "IPPB Premium Account", children: "IPPB Premium Account" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Mahila Samman Savings", children: "Mahila Samman Savings" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Lead Follow-up Stage:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: leadStatus,
                onChange: (e) => setLeadStatus(e.target.value),
                className: "w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-red-600",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Interested", children: "Interested (New Lead)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Follow-up Scheduled", children: "Follow-up Scheduled" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Documentation Pending", children: "Documentation Pending" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Converted", children: "Converted / Account Opened" })
                ]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setStatusModalItem(null),
            className: "px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: handleSaveStatusModal,
            className: "px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Save Status & Log Lead" })
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  AIAssistantView as default
};
