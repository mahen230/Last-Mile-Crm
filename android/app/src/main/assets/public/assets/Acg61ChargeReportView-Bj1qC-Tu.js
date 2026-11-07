import { u as useAuth, r as reactExports, j as jsxRuntimeExports, y as ShieldCheck, C as CircleCheck, aJ as ArrowLeftRight, aa as User, l as Calendar, aj as Clock, B as Building2, aN as FileText, _ as Check, ae as Copy, D as Download, aE as operationsService } from "./index-CnNe7uH5.js";
import { f as formatToDottedDate, d as downloadOfficialAcg61Pdf } from "./acg61PdfGenerator-Bi1Kes6F.js";
import { P as Printer } from "./printer-Bbc6XC_m.js";
function Acg61ChargeReportView() {
  const { userProfile } = useAuth();
  const [relievedOfficerName, setRelievedOfficerName] = reactExports.useState("MAHENDRA KUMAR MEENA");
  const [relievingOfficerName, setRelievingOfficerName] = reactExports.useState("VACANT");
  const [reportDate, setReportDate] = reactExports.useState("2026-06-04");
  const [noonSection, setNoonSection] = reactExports.useState("PM");
  const [postName, setPostName] = reactExports.useState("O/S POSTMAN");
  const [placeName, setPlaceName] = reactExports.useState("DADABARI SO");
  const [divisionName, setDivisionName] = reactExports.useState("KOTA DIVISION");
  const [headOfficeName, setHeadOfficeName] = reactExports.useState("NGM H.O.");
  const [subDivisionName, setSubDivisionName] = reactExports.useState("ASPO's KOTA EAST");
  const [authorityOrderNo, setAuthorityOrderNo] = reactExports.useState("");
  const [copyToList, setCopyToList] = reactExports.useState([
    "The SSPO's KOTA DIVISION",
    "A/C BRANCH NGM H.O.",
    "ASPO's KOTA EAST",
    "PF of the official"
  ]);
  const [copySuccess, setCopySuccess] = reactExports.useState(false);
  const [statusMessage, setStatusMessage] = reactExports.useState(null);
  const previewRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if ((userProfile == null ? void 0 : userProfile.name) && relievedOfficerName === "MAHENDRA KUMAR MEENA") {
      setRelievedOfficerName(userProfile.name);
    }
    if ((userProfile == null ? void 0 : userProfile.assignedOffice) && placeName === "DADABARI SO") {
      setPlaceName(userProfile.assignedOffice.toUpperCase());
    }
  }, [userProfile]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedDotted = formatToDottedDate(reportDate);
    const sessionLabel = noonSection === "PM" ? "Afternoon (A/N)" : "Forenoon (F/N)";
    const created = operationsService.createSpecialBill({
      type: "CHARGE_REPORT",
      title: `Form ACG-61: ${relievedOfficerName} → ${relievingOfficerName} (${placeName})`,
      employeeId: (userProfile == null ? void 0 : userProfile.employeeId) || "50457421",
      employeeName: relievedOfficerName,
      employeeEmail: (userProfile == null ? void 0 : userProfile.email) || "mahen.comtech@gmail.com",
      beatNo: (userProfile == null ? void 0 : userProfile.beat) || "Beat 2",
      officeName: placeName,
      fromDate: reportDate,
      toDate: reportDate,
      totalDays: 1,
      fixedKm: (userProfile == null ? void 0 : userProfile.fixedKm) || 30,
      totalAmount: 0,
      details: {
        formType: "ACG-61",
        relievedOfficerName,
        relievingOfficerName,
        postName,
        placeName,
        transferDate: formattedDotted,
        noonSection,
        sessionType: sessionLabel,
        divisionName,
        headOfficeName,
        subDivisionName,
        authorityOrderNo,
        copyToList
      }
    });
    setStatusMessage(`Form ACG-61 Charge Report generated! Record ID: ${created.billNumber}`);
    setTimeout(() => {
      var _a;
      (_a = previewRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };
  const handleDownloadPdf = () => {
    const payload = {
      relievedOfficerName,
      relievingOfficerName,
      postName,
      placeName,
      date: reportDate,
      noonSection,
      divisionName,
      headOfficeName,
      subDivisionName,
      authorityOrderNo,
      copyToList
    };
    downloadOfficialAcg61Pdf(payload);
    setStatusMessage("Official Form ACG-61 PDF downloaded successfully.");
  };
  const handleCopyText = () => {
    const formattedDotted = formatToDottedDate(reportDate);
    const noonLabel = noonSection === "PM" ? "AFTERNOON" : "FORENOON";
    const text = `Certified that the charge of the office Of ${postName} was made over by ${relievedOfficerName} to ${relievingOfficerName} at Place ${placeName} on the Date ${formattedDotted} ${noonLabel} in accordance with ${authorityOrderNo || ""}.`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2e3);
  };
  const formattedDottedDate = formatToDottedDate(reportDate);
  const displayNoon = noonSection === "PM" ? "AFTERNOON" : "FORENOON";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-r from-red-800 via-red-700 to-red-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-amber-300 text-xs font-black uppercase tracking-wider", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 14 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Department of Posts · Form ACG-61" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl sm:text-3xl font-black tracking-tight text-white", children: "Form ACG-61: Certificate of Transfer of Charge" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-100 text-xs sm:text-sm leading-relaxed max-w-2xl", children: "Fill in the candidate handover details (Relieved & Relieving Officers, Date, AM/PM session, and Office info) to generate and download the official departmental certificate." })
    ] }) }),
    statusMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16, className: "text-emerald-600 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: statusMessage })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setStatusMessage(null),
          className: "text-emerald-700 hover:text-emerald-900 font-black text-sm px-2 cursor-pointer",
          children: "×"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        onSubmit: handleSubmit,
        className: "bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-black text-slate-900 tracking-tight flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { className: "text-red-700", size: 22 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Office & Staff Details (Charge Transfer)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Enter the Relieved Officer, Relieving Officer, Transfer Date, and Noon Session (AM/PM)." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2.5 py-1 rounded-full text-xs font-black bg-red-50 text-red-800 border border-red-200 self-start", children: "Official ACG-61 Format" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 14, className: "text-red-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "1. Relieved Officer Name (Handing Over)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  value: relievedOfficerName,
                  onChange: (e) => setRelievedOfficerName(e.target.value.toUpperCase()),
                  placeholder: "e.g. MAHENDRA KUMAR MEENA",
                  className: "w-full px-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 uppercase tracking-wide focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600 transition"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-400", children: "Official whose charge is being relinquished." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 14, className: "text-emerald-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "2. Relieving Officer Name (Taking Over)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    required: true,
                    value: relievingOfficerName,
                    onChange: (e) => setRelievingOfficerName(e.target.value.toUpperCase()),
                    placeholder: "e.g. VACANT or Candidate Name",
                    className: "w-full px-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 uppercase tracking-wide focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600 transition"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setRelievingOfficerName("VACANT"),
                    className: `px-3 py-2 text-xs font-black rounded-xl border transition cursor-pointer shrink-0 ${relievingOfficerName === "VACANT" ? "bg-amber-400 text-slate-950 border-amber-500" : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"}`,
                    children: "Set VACANT"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-400", children: 'Candidate or incoming officer. Click "Set VACANT" if charge is left vacant.' })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 14, className: "text-red-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "3. Transfer Date" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "date",
                  required: true,
                  value: reportDate,
                  onChange: (e) => setReportDate(e.target.value),
                  className: "w-full px-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-sm font-bold font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600 transition"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-[11px] text-slate-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Formatted in Certificate:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold text-slate-900", children: formattedDottedDate })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 14, className: "text-amber-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "4. Noon Section (Session)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setNoonSection("AM"),
                    className: `p-2.5 rounded-xl border text-center transition font-bold text-xs flex flex-col items-center justify-center cursor-pointer ${noonSection === "AM" ? "bg-red-700 text-white border-red-800 shadow-md ring-2 ring-red-500/30" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black", children: "AM" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] opacity-90", children: "Forenoon (F/N)" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setNoonSection("PM"),
                    className: `p-2.5 rounded-xl border text-center transition font-bold text-xs flex flex-col items-center justify-center cursor-pointer ${noonSection === "PM" ? "bg-red-700 text-white border-red-800 shadow-md ring-2 ring-red-500/30" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black", children: "PM" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] opacity-90", children: "Afternoon (A/N)" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-slate-400", children: [
                "Select ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-slate-700", children: "PM" }),
                " for afternoon or ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-slate-700", children: "AM" }),
                " for forenoon."
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Office, Post & Distribution Details" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-500 font-mono", children: "Rajasthan Circle" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "Charge Office / Post Designation" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: postName,
                    onChange: (e) => setPostName(e.target.value.toUpperCase()),
                    placeholder: "e.g. O/S POSTMAN",
                    className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 uppercase"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "Place / Post Office Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: placeName,
                    onChange: (e) => setPlaceName(e.target.value.toUpperCase()),
                    placeholder: "e.g. DADABARI SO",
                    className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 uppercase"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "Postal Division" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: divisionName,
                    onChange: (e) => setDivisionName(e.target.value.toUpperCase()),
                    placeholder: "e.g. KOTA DIVISION",
                    className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 uppercase"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "Head Office / A/C Branch" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: headOfficeName,
                    onChange: (e) => setHeadOfficeName(e.target.value.toUpperCase()),
                    placeholder: "e.g. NGM H.O.",
                    className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 uppercase"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "In Accordance With (Rule / Order Reference No. - Optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: authorityOrderNo,
                    onChange: (e) => setAuthorityOrderNo(e.target.value),
                    placeholder: "e.g. Rule 166 / Memo No. B2/Transfer/2026",
                    className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "submit",
              className: "w-full py-3.5 px-6 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-black text-sm uppercase tracking-wide transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Generate Official Form ACG-61 Charge Report" })
              ]
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: previewRef, className: "space-y-4 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-black text-slate-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "text-red-700", size: 24 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Official ACG-61 Document Output" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Official Department of Posts layout matching standard government stationery." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: handleCopyText,
              className: "px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer",
              children: [
                copySuccess ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14, className: "text-emerald-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: copySuccess ? "Copied Certificate Text!" : "Copy Text" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => window.print(),
              className: "px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Print" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl border border-slate-300 p-8 sm:p-12 lg:p-16 shadow-lg space-y-8 font-serif text-slate-900 relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start font-sans", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-slate-400", children: "INDIA POST · FIELD OPERATIONS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-black text-slate-900 tracking-wider", children: "ACG-61" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-1 font-sans", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl sm:text-2xl font-black text-slate-900 tracking-tight", children: "Department Of Posts,India" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 font-semibold uppercase tracking-wider", children: "Certificate of Transfer of Charge" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm sm:text-base leading-loose pt-4 text-justify", children: [
          "Certified that the charge of the office Of",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "underline underline-offset-4 decoration-slate-400 font-black font-sans", children: postName }),
          " ",
          "was made over by",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "underline underline-offset-4 decoration-slate-400 font-black font-sans", children: relievedOfficerName }),
          " ",
          "to",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "underline underline-offset-4 decoration-slate-400 font-black font-sans", children: relievingOfficerName }),
          " ",
          "at Place",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "underline underline-offset-4 decoration-slate-400 font-black font-sans", children: placeName }),
          " ",
          "on the Date",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "underline underline-offset-4 decoration-slate-400 font-black font-mono", children: formattedDottedDate }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "underline underline-offset-4 decoration-slate-400 font-black font-sans", children: displayNoon }),
          " ",
          "in accordance with ",
          authorityOrderNo || "",
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-8 pt-12 pb-6 font-sans", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-serif italic text-base text-slate-700", children: relievedOfficerName.split(" ")[0] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-slate-700 pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm text-slate-900", children: "Relieved Officer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500", children: relievedOfficerName })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 flex items-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-serif italic text-base text-slate-700", children: relievingOfficerName }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-slate-700 pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm text-slate-900", children: "Relieving Officer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-slate-500", children: relievingOfficerName })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-6 border-t border-slate-100 font-sans space-y-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900 text-sm", children: "Copy to:-" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "list-decimal list-inside space-y-1 text-slate-700 pl-1", children: copyToList.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "leading-relaxed", children: item }, idx)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-center md:text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 14 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Report Ready for Official Submission" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl sm:text-2xl font-black text-white", children: "Download Official Form ACG-61 PDF" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400", children: "Generates a print-ready Department of Posts A4 PDF document containing all certificate text, signatures, and copy-to list." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-center gap-3 w-full md:w-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              id: "download-acg61-pdf-btn",
              onClick: handleDownloadPdf,
              className: "w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 18 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Download Form ACG-61 PDF" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => window.print(),
              className: "w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 16 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Print Form" })
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  Acg61ChargeReportView as default
};
