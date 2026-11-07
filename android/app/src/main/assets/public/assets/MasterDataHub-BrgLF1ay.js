import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, y as ShieldCheck, B as Building2, D as Download, T as TriangleAlert, C as CircleCheck, e as MapPin, U as Users, L as Layers, F as FileSpreadsheet, P as Plus, S as Search, G as Funnel, H as House, p as Phone, s as staffPermissionService, $ as utils, a0 as writeFileSync, aw as readSync, a9 as UPDATED_STAFF_LIST } from "./index-BWTx-a8O.js";
import { T as Trash2 } from "./trash-2-BdWNSGZI.js";
import { B as Briefcase } from "./briefcase-C0pm4YVk.js";
import { U as Upload } from "./upload-Dn66-2uK.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M10 18v-7", key: "wt116b" }],
  [
    "path",
    {
      d: "M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z",
      key: "1m329m"
    }
  ],
  ["path", { d: "M14 18v-7", key: "vav6t3" }],
  ["path", { d: "M18 18v-7", key: "aexdmj" }],
  ["path", { d: "M3 22h18", key: "8prr45" }],
  ["path", { d: "M6 18v-7", key: "1ivflk" }]
];
const Landmark = createLucideIcon("landmark", __iconNode);
const INITIAL_COLONIES = [
  {
    id: "1",
    colonyName: "Mahaveer Nagar Vistar",
    sectorPhase: "Sector 1",
    pincode: "324009",
    subOffice: "Dadabari S.O.",
    beatNo: "Beat 5",
    staffId: "STAFF-10310736",
    postmanName: "Mohit Arvind",
    landmarks: "Samrat Chowk, Near Central Park",
    totalDeliveries: 420,
    createdAt: "2026-01-10"
  },
  {
    id: "2",
    colonyName: "Mahaveer Nagar Vistar",
    sectorPhase: "Sector 2",
    pincode: "324009",
    subOffice: "Dadabari S.O.",
    beatNo: "Beat 5",
    staffId: "STAFF-10310736",
    postmanName: "Mohit Arvind",
    landmarks: "Main Road Market, Jain Temple",
    totalDeliveries: 380,
    createdAt: "2026-01-12"
  },
  {
    id: "3",
    colonyName: "Dadabari Main Chauraha",
    sectorPhase: "Shopping Centre & Block A",
    pincode: "324009",
    subOffice: "Dadabari S.O.",
    beatNo: "Beat 2",
    staffId: "STAFF-50457421",
    postmanName: "Mahendra Kumar Meena",
    landmarks: "Near Post Office, SBI Dadabari",
    totalDeliveries: 510,
    createdAt: "2026-01-15"
  },
  {
    id: "4",
    colonyName: "Teachers Colony & Shastri Nagar",
    sectorPhase: "Phase 1",
    pincode: "324009",
    subOffice: "Dadabari S.O.",
    beatNo: "Beat 1",
    staffId: "STAFF-50510312",
    postmanName: "Muskan Sharma",
    landmarks: "Govt Senior Secondary School, Water Tank",
    totalDeliveries: 290,
    createdAt: "2026-02-01"
  },
  {
    id: "5",
    colonyName: "Basant Vihar",
    sectorPhase: "Sector A & B",
    pincode: "324009",
    subOffice: "Dadabari S.O.",
    beatNo: "Beat 3",
    staffId: "STAFF-50510313",
    postmanName: "Manali Ahuja",
    landmarks: "Community Hall, Shiv Mandir",
    totalDeliveries: 340,
    createdAt: "2026-02-10"
  },
  {
    id: "6",
    colonyName: "Keshavpura Vistar",
    sectorPhase: "Sector 4",
    pincode: "324009",
    subOffice: "Dadabari S.O.",
    beatNo: "Beat 4",
    staffId: "STAFF-10310735",
    postmanName: "Govind Prasad",
    landmarks: "Keshavpura Road, Sabzi Mandi",
    totalDeliveries: 450,
    createdAt: "2026-02-18"
  },
  {
    id: "7",
    colonyName: "Rangbari Road Enclave",
    sectorPhase: "Sector 1 & 2",
    pincode: "324009",
    subOffice: "Dadabari S.O.",
    beatNo: "Beat 16",
    staffId: "STAFF-50561337",
    postmanName: "Nitesh Mittal",
    landmarks: "Subhash Circle, Veer Savarkar Park",
    totalDeliveries: 390,
    createdAt: "2026-02-25"
  },
  {
    id: "8",
    colonyName: "Thermal Colony & Quarters",
    sectorPhase: "Phase 3 VIP",
    pincode: "324009",
    subOffice: "Dadabari S.O.",
    beatNo: "Beat 33",
    staffId: "STAFF-10310738",
    postmanName: "Jitendra Kumar Meena",
    landmarks: "Thermal Gate 3, VIP Circuit House Road",
    totalDeliveries: 310,
    createdAt: "2026-03-01"
  }
];
const INITIAL_CUSTOMERS = [
  {
    id: "c1",
    name: "Anil Kumar Agarwal",
    mobile: "9829012345",
    colony: "Mahaveer Nagar Vistar",
    sector: "Sector 1",
    houseNo: "1-B-14",
    pincode: "324009",
    beatNo: "Beat 5",
    staffId: "STAFF-10310736",
    postmanName: "Mohit Arvind",
    householdType: "Residential",
    createdAt: "2026-03-01"
  },
  {
    id: "c2",
    name: "Kota Coaching Stationery Hub",
    mobile: "9414056789",
    colony: "Mahaveer Nagar Vistar",
    sector: "Sector 2",
    houseNo: "Shop 24, Commercial Complex",
    pincode: "324009",
    beatNo: "Beat 5",
    staffId: "STAFF-10310736",
    postmanName: "Mohit Arvind",
    householdType: "Commercial",
    createdAt: "2026-03-02"
  },
  {
    id: "c3",
    name: "Govt Senior Sec School Dadabari",
    mobile: "0744234567",
    colony: "Teachers Colony & Shastri Nagar",
    sector: "Phase 1",
    houseNo: "Main Campus Gate",
    pincode: "324009",
    beatNo: "Beat 1",
    staffId: "STAFF-50510312",
    postmanName: "Muskan Sharma",
    householdType: "Government",
    createdAt: "2026-03-04"
  },
  {
    id: "c4",
    name: "Dr. Sunita Sharma Clinic",
    mobile: "9828876543",
    colony: "Dadabari Main Chauraha",
    sector: "Shopping Centre & Block A",
    houseNo: "A-12 Medical Enclave",
    pincode: "324009",
    beatNo: "Beat 2",
    staffId: "STAFF-50457421",
    postmanName: "Mahendra Kumar Meena",
    householdType: "Commercial",
    createdAt: "2026-03-05"
  }
];
const BEAT_STAFF_DIRECTORY = {};
UPDATED_STAFF_LIST.forEach((s) => {
  BEAT_STAFF_DIRECTORY[s.beat] = {
    name: s.name,
    id: s.id,
    contact: s.contact,
    role: s.role
  };
});
const BEAT_POSTMAN_CATALOG = {};
UPDATED_STAFF_LIST.forEach((s) => {
  BEAT_POSTMAN_CATALOG[s.beat] = s.name;
});
const DADABARI_ALL_BEATS = Array.from({ length: 33 }, (_, i) => `Beat ${i + 1}`);
const SUB_OFFICES = [
  { name: "Dadabari S.O.", pincode: "324009" },
  { name: "Engineering College S.O.", pincode: "324010" },
  { name: "Vigyan Nagar S.O.", pincode: "324005" },
  { name: "Kota H.O.", pincode: "324001" }
];
function UnifiedCrmMasterHub() {
  const [colonies, setColonies] = reactExports.useState(() => {
    try {
      const stored = localStorage.getItem("unified_colonies_master_v3");
      return stored ? JSON.parse(stored) : INITIAL_COLONIES;
    } catch {
      return INITIAL_COLONIES;
    }
  });
  const [customers, setCustomers] = reactExports.useState(() => {
    try {
      const stored = localStorage.getItem("unified_customers_master_v3");
      return stored ? JSON.parse(stored) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });
  const [activeTab, setActiveTab] = reactExports.useState("colonies");
  const [selectedOfficeFilter, setSelectedOfficeFilter] = reactExports.useState("Dadabari S.O.");
  const [newColonyName, setNewColonyName] = reactExports.useState("");
  const [newSector, setNewSector] = reactExports.useState("");
  const [newPincode, setNewPincode] = reactExports.useState("324009");
  const [newSubOffice, setNewSubOffice] = reactExports.useState("Dadabari S.O.");
  const [newBeatNo, setNewBeatNo] = reactExports.useState("Beat 2");
  const [newStaffId, setNewStaffId] = reactExports.useState("STAFF-50457421");
  const [newPostmanName, setNewPostmanName] = reactExports.useState("Mahendra Kumar Meena");
  const [newLandmarks, setNewLandmarks] = reactExports.useState("");
  const [custName, setCustName] = reactExports.useState("");
  const [custMobile, setCustMobile] = reactExports.useState("");
  const [custHouseNo, setCustHouseNo] = reactExports.useState("");
  const [selectedColonyId, setSelectedColonyId] = reactExports.useState("");
  const [custHouseholdType, setCustHouseholdType] = reactExports.useState("Residential");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [selectedBeatFilter, setSelectedBeatFilter] = reactExports.useState("ALL");
  const [selectedHouseholdFilter, setSelectedHouseholdFilter] = reactExports.useState("ALL");
  const [duplicateWarning, setDuplicateWarning] = reactExports.useState(null);
  const [successToast, setSuccessToast] = reactExports.useState(null);
  const [preventedCount, setPreventedCount] = reactExports.useState(3);
  const fileInputRef = reactExports.useRef(null);
  const [bulkStatus, setBulkStatus] = reactExports.useState(null);
  const [editingColony, setEditingColony] = reactExports.useState(null);
  reactExports.useEffect(() => {
    try {
      localStorage.setItem("unified_colonies_master", JSON.stringify(colonies));
    } catch {
    }
  }, [colonies]);
  reactExports.useEffect(() => {
    try {
      localStorage.setItem("unified_customers_master", JSON.stringify(customers));
    } catch {
    }
  }, [customers]);
  const handleBeatChange = (beat) => {
    setNewBeatNo(beat);
    const staff = BEAT_STAFF_DIRECTORY[beat];
    if (staff) {
      setNewPostmanName(staff.name);
      setNewStaffId(staff.id);
    } else if (BEAT_POSTMAN_CATALOG[beat]) {
      setNewPostmanName(BEAT_POSTMAN_CATALOG[beat]);
    }
  };
  const handleRegisterColony = (e) => {
    e.preventDefault();
    if (!newColonyName.trim() || !newSector.trim()) {
      setDuplicateWarning("⚠️ Colony name and Sector/Phase are mandatory fields.");
      return;
    }
    const existing = colonies.find(
      (c) => c.colonyName.trim().toLowerCase() === newColonyName.trim().toLowerCase() && c.sectorPhase.trim().toLowerCase() === newSector.trim().toLowerCase() && c.pincode === newPincode
    );
    if (existing) {
      setPreventedCount((prev) => prev + 1);
      setDuplicateWarning(
        `⚠️ Duplicate Alert: '${newColonyName} (${newSector})' with Pincode ${newPincode} is already registered under ${existing.beatNo} (${existing.postmanName})!`
      );
      return;
    }
    setDuplicateWarning(null);
    const staff = BEAT_STAFF_DIRECTORY[newBeatNo];
    const newEntry = {
      id: Date.now().toString(),
      colonyName: newColonyName.trim(),
      sectorPhase: newSector.trim(),
      pincode: newPincode.trim(),
      subOffice: newSubOffice,
      beatNo: newBeatNo,
      staffId: newStaffId || (staff == null ? void 0 : staff.id) || "STAFF-DIR",
      postmanName: newPostmanName || (staff == null ? void 0 : staff.name) || "Assigned Staff",
      landmarks: newLandmarks.trim() || "Registered via Master Hub",
      totalDeliveries: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    };
    setColonies([newEntry, ...colonies]);
    setNewColonyName("");
    setNewSector("");
    setNewLandmarks("");
    showSuccessNotification(`✅ Colony & Sector '${newEntry.colonyName} (${newEntry.sectorPhase})' registered under ${newEntry.beatNo}!`);
  };
  const handleRegisterCustomer = (e) => {
    e.preventDefault();
    if (!custName.trim() || !custMobile.trim()) {
      setDuplicateWarning("⚠️ Customer Name and Contact Mobile are required.");
      return;
    }
    const existingCust = customers.find(
      (c) => c.mobile.replace(/\D/g, "") === custMobile.replace(/\D/g, "")
    );
    if (existingCust) {
      setPreventedCount((prev) => prev + 1);
      setDuplicateWarning(
        `⚠️ Duplicate Alert: Mobile '${custMobile}' is already registered to '${existingCust.name}' in ${existingCust.colony} (${existingCust.beatNo})!`
      );
      return;
    }
    const linkedColony = colonies.find((col) => col.id === selectedColonyId) || colonies[0];
    setDuplicateWarning(null);
    const newCust = {
      id: `c_${Date.now()}`,
      name: custName.trim(),
      mobile: custMobile.trim(),
      colony: linkedColony ? linkedColony.colonyName : "Dadabari Main",
      sector: linkedColony ? linkedColony.sectorPhase : "Main Area",
      houseNo: custHouseNo.trim() || "Standard Delivery",
      pincode: linkedColony ? linkedColony.pincode : "324009",
      beatNo: linkedColony ? linkedColony.beatNo : "Beat 2",
      postmanName: linkedColony ? linkedColony.postmanName : "Mahendra Kumar Meena",
      householdType: custHouseholdType,
      createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    };
    setCustomers([newCust, ...customers]);
    setCustName("");
    setCustMobile("");
    setCustHouseNo("");
    showSuccessNotification(`✅ Customer '${newCust.name}' mapped to ${newCust.colony} (${newCust.beatNo})!`);
  };
  const showSuccessNotification = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);
  };
  const handleDeleteColony = (id, name) => {
    if (window.confirm(`Are you sure you want to remove '${name}' from Beat Registry?`)) {
      setColonies((prev) => prev.filter((c) => c.id !== id));
      showSuccessNotification(`Removed '${name}' from colony master.`);
    }
  };
  const handleDeleteCustomer = (id, name) => {
    if (window.confirm(`Delete record for '${name}'?`)) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      showSuccessNotification(`Removed customer record '${name}'.`);
    }
  };
  const handleExportColonies = () => {
    const dataToExport = colonies.map((c) => ({
      "Colony ID": c.id,
      "Colony Name": c.colonyName,
      "Sector / Phase": c.sectorPhase,
      "Pincode": c.pincode,
      "Sub Office": c.subOffice,
      "Beat No": c.beatNo,
      "Assigned Postman": c.postmanName,
      "Landmarks / Notes": c.landmarks,
      "Total Deliveries": c.totalDeliveries || 0,
      "Registration Date": c.createdAt || ""
    }));
    const worksheet = utils.json_to_sheet(dataToExport);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Colonies_Master");
    writeFileSync(workbook, `Dadabari_Colonies_Master_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`);
  };
  const handleExportCustomers = () => {
    const dataToExport = customers.map((c) => ({
      "Customer ID": c.id,
      "Full Name": c.name,
      "Mobile Number": c.mobile,
      "House / Plot No": c.houseNo || "",
      "Colony": c.colony,
      "Sector / Phase": c.sector,
      "Pincode": c.pincode,
      "Assigned Beat": c.beatNo,
      "Delivery Staff": c.postmanName || "",
      "Household Type": c.householdType,
      "Mapped Date": c.createdAt || ""
    }));
    const worksheet = utils.json_to_sheet(dataToExport);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Households_Master");
    writeFileSync(workbook, `Dadabari_Customers_Master_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`);
  };
  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        "Colony Name": "Mahaveer Nagar Vistar",
        "Sector Phase": "Sector 3",
        "Pincode": "324009",
        "Sub Office": "Dadabari S.O.",
        "Beat No": "Beat 5",
        "Postman Name": "Mohit Arvind",
        "Landmarks": "Near Community Hall"
      },
      {
        "Colony Name": "Vasant Kunj",
        "Sector Phase": "Phase 2",
        "Pincode": "324009",
        "Sub Office": "Dadabari S.O.",
        "Beat No": "Beat 2",
        "Postman Name": "Mahendra Kumar Meena",
        "Landmarks": "Opposite Water Tank"
      }
    ];
    const worksheet = utils.json_to_sheet(templateRows);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Import_Template");
    writeFileSync(workbook, "Colony_Beat_Import_Template.xlsx");
  };
  const handleFileUpload = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      var _a2;
      try {
        const data = new Uint8Array((_a2 = evt.target) == null ? void 0 : _a2.result);
        const workbook = readSync(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const json = utils.sheet_to_json(workbook.Sheets[sheetName]);
        if (json.length === 0) {
          setBulkStatus("Uploaded sheet has no rows.");
          return;
        }
        let addedCount = 0;
        let skippedDuplicate = 0;
        const newColoniesList = [...colonies];
        json.forEach((row, idx) => {
          const colName = row["Colony Name"] || row["colonyName"] || row["Colony"] || "";
          const sec = row["Sector Phase"] || row["sectorPhase"] || row["Sector"] || "Sector 1";
          const pin = String(row["Pincode"] || row["pincode"] || "324009");
          const beat = row["Beat No"] || row["beatNo"] || row["Beat"] || "Beat 2";
          const postman = row["Postman Name"] || row["postmanName"] || BEAT_POSTMAN_CATALOG[beat] || "Mahendra Kumar Meena";
          const landmarks = row["Landmarks"] || row["landmarks"] || "Imported via Excel";
          if (!colName) return;
          const exists = newColoniesList.some(
            (c) => c.colonyName.trim().toLowerCase() === colName.trim().toLowerCase() && c.sectorPhase.trim().toLowerCase() === sec.trim().toLowerCase() && c.pincode === pin
          );
          if (exists) {
            skippedDuplicate++;
          } else {
            newColoniesList.unshift({
              id: `imp_${Date.now()}_${idx}`,
              colonyName: colName,
              sectorPhase: sec,
              pincode: pin,
              subOffice: "Dadabari S.O.",
              beatNo: beat,
              postmanName: postman,
              landmarks,
              totalDeliveries: 150,
              createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
            });
            addedCount++;
          }
        });
        setColonies(newColoniesList);
        setPreventedCount((prev) => prev + skippedDuplicate);
        setBulkStatus(`✅ Import Complete: ${addedCount} colonies added, ${skippedDuplicate} duplicates prevented.`);
        showSuccessNotification(`Excel Processed: ${addedCount} registered, ${skippedDuplicate} duplicates skipped.`);
      } catch (err) {
        setBulkStatus(`Error reading file: ${err.message || "Unknown error"}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };
  const filteredColonies = reactExports.useMemo(() => {
    return colonies.filter((c) => {
      const matchOffice = selectedOfficeFilter === "ALL" || c.subOffice && c.subOffice.toLowerCase().includes(selectedOfficeFilter.toLowerCase()) || selectedOfficeFilter === "Dadabari S.O." && (!c.subOffice || c.subOffice === "Dadabari S.O.");
      const matchSearch = c.colonyName.toLowerCase().includes(searchQuery.toLowerCase()) || c.sectorPhase.toLowerCase().includes(searchQuery.toLowerCase()) || c.pincode.includes(searchQuery) || c.postmanName.toLowerCase().includes(searchQuery.toLowerCase()) || c.staffId && c.staffId.toLowerCase().includes(searchQuery.toLowerCase()) || c.beatNo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBeat = selectedBeatFilter === "ALL" || c.beatNo === selectedBeatFilter;
      return matchOffice && matchSearch && matchBeat;
    });
  }, [colonies, searchQuery, selectedBeatFilter, selectedOfficeFilter]);
  const filteredCustomers = reactExports.useMemo(() => {
    return customers.filter((cust) => {
      const matchSearch = cust.name.toLowerCase().includes(searchQuery.toLowerCase()) || cust.mobile.includes(searchQuery) || cust.colony.toLowerCase().includes(searchQuery.toLowerCase()) || cust.sector.toLowerCase().includes(searchQuery.toLowerCase()) || cust.beatNo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBeat = selectedBeatFilter === "ALL" || cust.beatNo === selectedBeatFilter;
      const matchHousehold = selectedHouseholdFilter === "ALL" || cust.householdType === selectedHouseholdFilter;
      return matchSearch && matchBeat && matchHousehold;
    });
  }, [customers, searchQuery, selectedBeatFilter, selectedHouseholdFilter]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-blue-800/40 relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold tracking-wider uppercase border border-blue-400/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 14, className: "text-cyan-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Master Address Intelligence & Beat Engine" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl sm:text-3xl font-black tracking-tight text-white", children: "Postal CRM & Colony-Beat Master Hub" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-200 text-sm max-w-2xl", children: "Unified Address Registration, Duplicate Prevention, Landmark Profiling & Dynamic Delivery Beat Mapping for Dadabari S.O." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-950/80 px-4 py-2.5 rounded-2xl border border-blue-700/60 text-xs sm:text-sm text-blue-100 flex items-center gap-2 shadow-inner", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-4 h-4 text-amber-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Active Office: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Dadabari S.O. (324009)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleExportColonies,
            className: "px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5 cursor-pointer shadow-xs",
            title: "Download Master Colony Sheet",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Export Data" })
            ]
          }
        )
      ] })
    ] }),
    duplicateWarning && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 border-l-4 border-amber-500 p-4 rounded-2xl shadow-sm flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top duration-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3 text-amber-900", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 text-amber-600 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-sm", children: "Conflict Prevented by CRM Intelligence" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-800 mt-0.5", children: duplicateWarning })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setDuplicateWarning(null),
          className: "text-xs text-amber-800 hover:text-amber-950 px-2 py-1 bg-amber-100/70 hover:bg-amber-200 rounded-lg font-semibold transition",
          children: "Dismiss"
        }
      )
    ] }),
    successToast && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3 text-emerald-900", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-emerald-600 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: successToast })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSuccessToast(null),
          className: "text-xs text-emerald-800 font-semibold underline",
          children: "Close"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 24 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider", children: "Registered Colonies" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-slate-900", children: colonies.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-indigo-600 font-medium mt-0.5", children: "Under Dadabari S.O." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 24 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider", children: "Mapped Households" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-slate-900", children: customers.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-emerald-600 font-medium mt-0.5", children: "With Beat Pinning" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 24 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider", children: "Duplicates Blocked" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-amber-700", children: preventedCount }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-amber-600 font-medium mt-0.5", children: "Zero Data Collision" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 24 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider", children: "Active Postal Beats" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-slate-900", children: "6 Beats" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-rose-600 font-medium mt-0.5", children: "100% Pincode 324009" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto pb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveTab("colonies"),
          className: `px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${activeTab === "colonies" ? "bg-blue-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 16 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Colony & Sector Mapping (",
              colonies.length,
              ")"
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveTab("customers"),
          className: `px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${activeTab === "customers" ? "bg-blue-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 16 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Mapped Households & Customers (",
              customers.length,
              ")"
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveTab("bulk"),
          className: `px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${activeTab === "bulk" ? "bg-blue-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { size: 16 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Excel Tools & Data Sync" })
          ]
        }
      )
    ] }),
    activeTab === "colonies" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-6 rounded-3xl shadow-sm border border-slate-200/90 lg:col-span-1 h-fit sticky top-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-4 border-b border-slate-100 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base font-bold text-slate-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-5 h-5 text-indigo-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Register Colony / Sector" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100", children: "Unique Key Check" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleRegisterColony, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: [
              "Colony Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "e.g. Mahaveer Nagar Vistar",
                value: newColonyName,
                onChange: (e) => setNewColonyName(e.target.value),
                required: true,
                className: "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: [
              "Sector / Phase / Block ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "e.g. Sector 1, Phase 2, Block A",
                value: newSector,
                onChange: (e) => setNewSector(e.target.value),
                required: true,
                className: "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Pincode" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: newPincode,
                  onChange: (e) => setNewPincode(e.target.value),
                  required: true,
                  className: "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Sub Office" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  value: newSubOffice,
                  onChange: (e) => setNewSubOffice(e.target.value),
                  className: "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition",
                  children: SUB_OFFICES.map((so) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: so.name, children: so.name }, so.name))
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-bold text-slate-800 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Postal Beat Assignment" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-500 uppercase font-semibold", children: "Auto-Linked Staff" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-semibold text-slate-600 mb-1", children: "Beat No (1 - 33)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "select",
                  {
                    value: newBeatNo,
                    onChange: (e) => handleBeatChange(e.target.value),
                    className: "w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white",
                    children: DADABARI_ALL_BEATS.map((beat) => {
                      const staff = BEAT_STAFF_DIRECTORY[beat];
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: beat, children: [
                        beat,
                        " ",
                        staff ? `(${staff.name.split(" ")[0]})` : ""
                      ] }, beat);
                    })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-semibold text-slate-600 mb-1", children: "Assigned Postman & Staff ID" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: newPostmanName + (newStaffId ? ` (${newStaffId})` : ""),
                    onChange: (e) => setNewPostmanName(e.target.value),
                    className: "w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-800"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Landmarks & Navigation Hints" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                rows: 2,
                placeholder: "e.g. Near Samrat Chowk, Opposite Community Water Tank",
                value: newLandmarks,
                onChange: (e) => setNewLandmarks(e.target.value),
                className: "w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "submit",
              className: "w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/20 transition flex items-center justify-center gap-2 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Register Colony & Verify Mapping" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full md:w-60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "Search colony, sector, postman...",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 w-full md:w-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 13 }),
                " Office:"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: selectedOfficeFilter,
                  onChange: (e) => setSelectedOfficeFilter(e.target.value),
                  className: "px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:outline-hidden",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Offices" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Dadabari S.O.", children: "Dadabari S.O. (324009)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Engineering College S.O.", children: "Engineering College (324010)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Vigyan Nagar S.O.", children: "Vigyan Nagar (324005)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Kota H.O.", children: "Kota H.O. (324001)" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { size: 13 }),
                " Beat:"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: selectedBeatFilter,
                  onChange: (e) => setSelectedBeatFilter(e.target.value),
                  className: "px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:outline-hidden max-w-[130px]",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Beats (33)" }),
                    DADABARI_ALL_BEATS.map((beat) => {
                      const staff = BEAT_STAFF_DIRECTORY[beat];
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: beat, children: [
                        beat,
                        " ",
                        staff ? `(${staff.name.split(" ")[0]})` : ""
                      ] }, beat);
                    })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleExportColonies,
                className: "p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition",
                title: "Export Colonies to Excel",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 15 })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filteredColonies.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-10 h-10 text-slate-300 mx-auto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-700", children: "No colonies found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Try modifying your search or delivery office/beat filter, or register a new colony using the form." })
        ] }) : filteredColonies.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md transition space-y-3 group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-base text-slate-900 group-hover:text-indigo-600 transition", children: col.colonyName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100", children: col.sectorPhase }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md", children: [
                      "PIN ",
                      col.pincode
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-500 flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 13, className: "text-slate-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: col.subOffice }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-600 font-medium", children: [
                      "Landmarks: ",
                      col.landmarks
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right space-y-0.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-extrabold border border-amber-200", children: col.beatNo }),
                      col.staffId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-mono text-[10px] font-black border border-purple-200", children: col.staffId })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold text-slate-700", children: col.postmanName })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => handleDeleteColony(col.id, col.colonyName),
                      className: "p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition",
                      title: "Remove colony mapping",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Mapped Households:",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("b", { className: "text-slate-800 font-mono", children: customers.filter((c) => c.colony === col.colonyName).length })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Delivery Volume:",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("b", { className: "text-indigo-600 font-mono", children: [
                      col.totalDeliveries || 250,
                      "+ articles/mo"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-slate-400", children: [
                  "Reg: ",
                  col.createdAt || "Standard"
                ] })
              ] })
            ]
          },
          col.id
        )) })
      ] })
    ] }),
    activeTab === "customers" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-6 rounded-3xl shadow-sm border border-slate-200/90 lg:col-span-1 h-fit sticky top-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-4 border-b border-slate-100 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base font-bold text-slate-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-5 h-5 text-indigo-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Link Customer to Beat" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100", children: "Mobile Check" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleRegisterCustomer, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: [
              "Customer / Household Head Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "e.g. Ramesh Kumar Verma",
                value: custName,
                onChange: (e) => setCustName(e.target.value),
                required: true,
                className: "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: [
              "Mobile Number (Mandatory) ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "tel",
                placeholder: "e.g. 9829012345",
                value: custMobile,
                onChange: (e) => setCustMobile(e.target.value),
                required: true,
                className: "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "House / Plot / Office Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "e.g. Plot No. 12-A, Near Temple",
                value: custHouseNo,
                onChange: (e) => setCustHouseNo(e.target.value),
                className: "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: [
              "Link to Registered Colony & Beat ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: selectedColonyId,
                onChange: (e) => setSelectedColonyId(e.target.value),
                className: "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "-- Select Registered Colony --" }),
                  colonies.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: col.id, children: [
                    col.colonyName,
                    " (",
                    col.sectorPhase,
                    ") → ",
                    col.beatNo,
                    " (",
                    col.postmanName,
                    ")"
                  ] }, col.id))
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-500 mt-1", children: "Selecting a colony automatically binds Pincode 324009, Beat No, and delivery staff." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Establishment Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: ["Residential", "Commercial", "Government"].map((type) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setCustHouseholdType(type),
                className: `py-2 text-xs font-bold rounded-xl border transition cursor-pointer flex flex-col items-center gap-1 ${custHouseholdType === type ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`,
                children: [
                  type === "Residential" && /* @__PURE__ */ jsxRuntimeExports.jsx(House, { size: 14 }),
                  type === "Commercial" && /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { size: 14 }),
                  type === "Government" && /* @__PURE__ */ jsxRuntimeExports.jsx(Landmark, { size: 14 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: type })
                ]
              },
              type
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "submit",
              className: "w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Save Household & Map Beat" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-64", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 16, className: "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "Search customer, phone, colony...",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 w-full sm:w-auto flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: selectedHouseholdFilter,
                onChange: (e) => setSelectedHouseholdFilter(e.target.value),
                className: "px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-700",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Types" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Residential", children: "Residential" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Commercial", children: "Commercial" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Government", children: "Government" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: selectedBeatFilter,
                onChange: (e) => setSelectedBeatFilter(e.target.value),
                className: "px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-700",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Beats" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Beat 1", children: "Beat 1" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Beat 2", children: "Beat 2" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Beat 3", children: "Beat 3" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Beat 4", children: "Beat 4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Beat 5", children: "Beat 5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Beat 6", children: "Beat 6" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleExportCustomers,
                className: "p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition",
                title: "Export Customers to Excel",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 15 })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left border-collapse text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-4", children: "Customer / Household" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-4", children: "Contact" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-4", children: "Mapped Colony & Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-4", children: "Beat & Staff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-4", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-4 text-right", children: "Action" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-100", children: filteredCustomers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "py-8 text-center text-slate-400 font-medium", children: "No customer records match your filter criteria." }) }) : filteredCustomers.map((cust) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-slate-50/80 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3.5 px-4 font-bold text-slate-900", children: cust.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3.5 px-4 font-mono font-semibold text-slate-700", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 13, className: "text-slate-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: cust.mobile })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3.5 px-4 space-y-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-slate-800", children: cust.colony }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-500", children: [
                cust.houseNo ? `${cust.houseNo}, ` : "",
                cust.sector,
                " • PIN ",
                cust.pincode
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3.5 px-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block px-2 py-0.5 rounded-md font-bold text-[11px] bg-amber-50 text-amber-800 border border-amber-200", children: cust.beatNo }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-500 mt-0.5", children: cust.postmanName })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3.5 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `px-2 py-0.5 rounded-full text-[10px] font-bold ${cust.householdType === "Residential" ? "bg-blue-50 text-blue-700" : cust.householdType === "Commercial" ? "bg-purple-50 text-purple-700" : "bg-emerald-50 text-emerald-700"}`,
                children: cust.householdType
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3.5 px-4 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleDeleteCustomer(cust.id, cust.name),
                className: "p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition",
                title: "Delete record",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 })
              }
            ) })
          ] }, cust.id)) })
        ] }) }) })
      ] })
    ] }),
    activeTab === "bulk" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-bold text-slate-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "text-emerald-600", size: 22 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Bulk Spreadsheet Import & Export Hub" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Upload Master Excel or CSV files containing colonies, sectors, pincodes, and beat mappings. Our engine automatically skips duplicate addresses and normalizes data." })
      ] }),
      bulkStatus && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-blue-50 text-blue-900 rounded-2xl text-xs sm:text-sm font-semibold border border-blue-200", children: bulkStatus }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 transition bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 22 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm text-slate-800", children: "Upload Excel / CSV" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-500 mt-0.5", children: "Supports .xlsx, .xls, .csv format" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              ref: fileInputRef,
              className: "hidden",
              accept: ".xlsx, .xls, .csv",
              onChange: handleFileUpload
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                var _a;
                return (_a = fileInputRef.current) == null ? void 0 : _a.click();
              },
              className: "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer",
              children: "Select File to Import"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 rounded-2xl border border-slate-200 bg-white flex flex-col items-center justify-center text-center space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 22 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm text-slate-800", children: "Download Template" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-500 mt-0.5", children: "Standard column headers with sample entries" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: handleDownloadTemplate,
              className: "px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer",
              children: "Download .xlsx Template"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 rounded-2xl border border-slate-200 bg-white flex flex-col items-center justify-center text-center space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 22 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-sm text-slate-800", children: "Dadabari Staff & Beats" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-slate-500 mt-0.5", children: "Official 11-staff deployment with roles" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => staffPermissionService.exportAllToExcel(),
              className: "px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition cursor-pointer",
              children: "Export Staff Data (.xlsx)"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Quick Action:" }),
          " Download current in-memory master registries in clean Excel spreadsheets."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleExportColonies,
              className: "px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Export Colonies (",
                  colonies.length,
                  ")"
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleExportCustomers,
              className: "px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Export Households (",
                  customers.length,
                  ")"
                ] })
              ]
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
function MasterDataHub() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(UnifiedCrmMasterHub, {});
}
export {
  MasterDataHub as default
};
