import { u as useAuth, r as reactExports, aD as operationsService, s as staffPermissionService, aE as MAHEN_FUEL_REFERENCE_ROWS, aF as calculateFuelScheduleTotals, j as jsxRuntimeExports, aG as extractBeatNumberOnly, C as CircleCheck, aH as Fuel, aI as ArrowLeftRight, f as UserCheck, aJ as Smartphone, x as RefreshCw, ax as getDefaultFixedKmForBeat, z as Table, au as Link, aK as downloadOfficialFuelBillPDF, X, aL as buildFuelDailySchedule } from "./index-u5ATSoh6.js";
import { d as downloadOfficialAcg61Pdf } from "./acg61PdfGenerator-DcV0wLv3.js";
import { U as Upload } from "./upload-e0KOiXXJ.js";
import { D as Download } from "./download-wQvq84jM.js";
import { P as Printer } from "./printer-DKmoQJj_.js";
function calculateDaysBetween(fromStr, toStr) {
  if (!fromStr || !toStr) return 1;
  const d1 = new Date(fromStr);
  const d2 = new Date(toStr);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
  const diffMs = d2.getTime() - d1.getTime();
  const days = Math.floor(diffMs / (1e3 * 60 * 60 * 24)) + 1;
  return Math.max(1, days);
}
function SpecialFormsView() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = reactExports.useState("FUEL_BILL");
  const [bills, setBills] = reactExports.useState([]);
  const [fuelLedger, setFuelLedger] = reactExports.useState([]);
  const [statusMessage, setStatusMessage] = reactExports.useState(null);
  const [selectedBillForPrint, setSelectedBillForPrint] = reactExports.useState(null);
  const [showDailyScheduleEditor, setShowDailyScheduleEditor] = reactExports.useState(false);
  const [showAddFuelLedgerModal, setShowAddFuelLedgerModal] = reactExports.useState(false);
  const [fledDate, setFledDate] = reactExports.useState(() => (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [fledOpeningKm, setFledOpeningKm] = reactExports.useState(42900);
  const [fledClosingKm, setFledClosingKm] = reactExports.useState(43050);
  const [fledFuelLitres, setFledFuelLitres] = reactExports.useState(3.4);
  const [fledPricePerLitre, setFledPricePerLitre] = reactExports.useState(104.88);
  const [fledReceiptNo, setFledReceiptNo] = reactExports.useState("IOCL-KOTA-92410");
  const [fledStation, setFledStation] = reactExports.useState("Indian Oil - CAD Circle Filling Station, Kota");
  const [fledPaymentMode, setFledPaymentMode] = reactExports.useState("UPI / DakPay");
  const [fledRemarks, setFledRemarks] = reactExports.useState("Beat 2 Doorstep Delivery Odometer & Fuel Receipt");
  const autoEmpId = (userProfile == null ? void 0 : userProfile.employeeId) || "50457421";
  const autoEmpName = (userProfile == null ? void 0 : userProfile.name) || "MAHENDRA KUMAR MEENA";
  const autoEmpEmail = (userProfile == null ? void 0 : userProfile.email) || "mahen.comtech@gmail.com";
  const autoBeat = (userProfile == null ? void 0 : userProfile.beat) || "Beat 2";
  const autoOffice = (userProfile == null ? void 0 : userProfile.assignedOffice) || "Dadabari s.o.";
  const autoFixedKm = (userProfile == null ? void 0 : userProfile.fixedKm) || 30;
  const [fromDate, setFromDate] = reactExports.useState("2026-08-01");
  const [toDate, setToDate] = reactExports.useState("2026-08-30");
  const [employeeId, setEmployeeId] = reactExports.useState(autoEmpId);
  const [employeeName, setEmployeeName] = reactExports.useState(autoEmpName);
  const [beatNo, setBeatNo] = reactExports.useState(autoBeat);
  const [officeName, setOfficeName] = reactExports.useState(autoOffice);
  const [fixedKm, setFixedKm] = reactExports.useState(autoFixedKm);
  reactExports.useEffect(() => {
    if (userProfile) {
      setEmployeeId(userProfile.employeeId || "50457421");
      setEmployeeName(userProfile.name || "MAHENDRA KUMAR MEENA");
      setBeatNo(userProfile.beat || "Beat 2");
      setOfficeName(userProfile.assignedOffice || "Dadabari s.o.");
      setFixedKm(userProfile.fixedKm || 30);
    }
  }, [userProfile]);
  reactExports.useEffect(() => {
    const refreshSpecialForms = () => {
      const currentProfile = staffPermissionService.getActiveSession() || userProfile;
      setBills(
        operationsService.getSpecialBills().filter(
          (b) => staffPermissionService.matchesUserBeatScope(currentProfile, {
            beatNo: b.beatNo,
            assignedStaffName: b.employeeName,
            assignedStaffEmail: b.employeeEmail
          })
        )
      );
      setFuelLedger(
        operationsService.getFuelLedgerEntries().filter(
          (f) => staffPermissionService.matchesUserBeatScope(currentProfile, {
            beatNo: f.beatNo,
            assignedStaffName: f.employeeName
          })
        )
      );
    };
    refreshSpecialForms();
    const unsub = operationsService.subscribe(refreshSpecialForms);
    const unsubStaff = staffPermissionService.subscribe(refreshSpecialForms);
    return () => {
      unsub();
      unsubStaff();
    };
  }, [userProfile]);
  const handleAddFuelLedgerSubmit = (e) => {
    e.preventDefault();
    const netKm = Math.max(0, Number(fledClosingKm) - Number(fledOpeningKm));
    const totalCost = Math.round((Number(fledFuelLitres) || 0) * (Number(fledPricePerLitre) || 104.88));
    const created = operationsService.addFuelLedgerEntry({
      date: fledDate,
      employeeId,
      employeeName,
      beatNo,
      officeName,
      vehicleNo,
      openingKmReading: Number(fledOpeningKm) || 0,
      closingKmReading: Number(fledClosingKm) || 0,
      sanctionedBeatKm: netKm || fixedKm,
      fuelVolumeLitres: Number(fledFuelLitres) || 0,
      fuelPricePerLitre: Number(fledPricePerLitre) || 104.88,
      totalFuelCost: totalCost,
      receiptNumber: fledReceiptNo.trim() || `RCPT-${Date.now().toString().slice(-5)}`,
      fuelStationName: fledStation.trim() || "Indian Oil Filling Station, Kota",
      paymentMode: fledPaymentMode,
      dssReconciliationStatus: "Verified by SPM",
      remarks: fledRemarks
    });
    setFledOpeningKm(created.closingKmReading);
    setFledClosingKm(created.closingKmReading + fixedKm * 5);
    setShowAddFuelLedgerModal(false);
    setStatusMessage(
      `Fuel & Odometer Ledger Entry (${created.id}) recorded: ${created.openingKmReading} KM → ${created.closingKmReading} KM (${created.netKmRun} KM · ${created.fuelVolumeLitres}L · ₹${created.totalFuelCost} · Receipt #${created.receiptNumber}) ready for DSS Reconciliation!`
    );
  };
  const handleExportFuelLedgerCSV = () => {
    const csv = operationsService.exportFuelLedgerToCSV(fuelLedger);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DSS_FUEL_ODOMETER_RECONCILIATION_LEDGER_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const totalCalendarDays = reactExports.useMemo(() => calculateDaysBetween(fromDate, toDate), [fromDate, toDate]);
  const [claimMonth, setClaimMonth] = reactExports.useState("SEPTEMBER");
  const [claimYear, setClaimYear] = reactExports.useState("2026");
  const [fuelLeaveDays, setFuelLeaveDays] = reactExports.useState(5);
  const [fuelRatePerKm, setFuelRatePerKm] = reactExports.useState(3.6);
  const [vehicleNo, setVehicleNo] = reactExports.useState("RJ-20-SS-4521");
  const [fuelRemarks, setFuelRemarks] = reactExports.useState(
    "Doorstep delivery of Accountable Articles updated in PMA App across Beat 2"
  );
  const [spmVerificationNote, setSpmVerificationNote] = reactExports.useState(
    "Checked and found genuine & Forwarded to Division Office for sanction."
  );
  const [dailyRows, setDailyRows] = reactExports.useState(
    () => MAHEN_FUEL_REFERENCE_ROWS.map((r) => ({ ...r }))
  );
  const handleDateRangeChange = (newFrom, newTo) => {
    setFromDate(newFrom);
    setToDate(newTo);
    const rebuilt = buildFuelDailySchedule(newFrom, newTo, fuelLeaveDays);
    setDailyRows(rebuilt);
    const tots = calculateFuelScheduleTotals(rebuilt);
    setFuelLeaveDays(tots.offDaysCount);
  };
  const scheduleTotals = reactExports.useMemo(() => calculateFuelScheduleTotals(dailyRows), [dailyRows]);
  const workingDays = Math.max(1, totalCalendarDays - (Number(fuelLeaveDays) || 0));
  const totalDistanceKm = workingDays * (Number(fixedKm) || 0);
  const totalFuelAmount = Math.round(totalDistanceKm * (Number(fuelRatePerKm) || 0));
  const handleLoadMahenReferencePreset = () => {
    setEmployeeId("50457421");
    setEmployeeName("MAHENDRA KUMAR MEENA");
    setBeatNo("Beat 2");
    setOfficeName("Dadabari s.o.");
    setFixedKm(30);
    setFromDate("2026-08-01");
    setToDate("2026-08-30");
    setClaimMonth("SEPTEMBER");
    setClaimYear("2026");
    setFuelLeaveDays(5);
    setFuelRatePerKm(3.6);
    setVehicleNo("RJ-20-SS-4521");
    setDailyRows(MAHEN_FUEL_REFERENCE_ROWS.map((r) => ({ ...r })));
    setStatusMessage("Loaded exact official reference data from MAHEN FUEL.pdf (30 KM × 25 Days = 750 KM × ₹3.60 = ₹2,700).");
  };
  const updateSingleDailyRow = (sn, patch) => {
    setDailyRows((prev) => {
      const next = prev.map((r) => {
        if (r.sn !== sn) return r;
        const updated = { ...r, ...patch };
        if (updated.status !== "WORKING") {
          const lbl = updated.status;
          return {
            ...updated,
            sp: lbl,
            reg: updated.status === "HOLIDAY" ? 0 : "",
            others: lbl,
            total: lbl,
            pmaHandled: "",
            pmaPercent: lbl
          };
        } else {
          const spNum = typeof updated.sp === "number" ? updated.sp : Number(updated.sp) || 0;
          const regNum = updated.reg === "" ? 0 : Number(updated.reg) || 0;
          const othersNum = updated.others === "" ? 0 : Number(updated.others) || 0;
          const tot = spNum + regNum + othersNum;
          return {
            ...updated,
            sp: spNum,
            total: tot,
            pmaHandled: tot,
            pmaPercent: 100
          };
        }
      });
      const newTots = calculateFuelScheduleTotals(next);
      setFuelLeaveDays(newTots.offDaysCount);
      return next;
    });
  };
  const [relievedName, setRelievedName] = reactExports.useState("Rajesh Kumar Sharma");
  const [relievedId, setRelievedId] = reactExports.useState("CSI-10089231");
  const [relievedDesig, setRelievedDesig] = reactExports.useState("Postman");
  const [relievingDesig, setRelievingDesig] = reactExports.useState(
    (userProfile == null ? void 0 : userProfile.role) === "SUPER_ADMIN" ? "Postal Admin / Supervisor" : "Postman"
  );
  const [sessionType, setSessionType] = reactExports.useState("Forenoon (F/N)");
  const [transferReason, setTransferReason] = reactExports.useState("Earned Leave / Official Duty Arrangement");
  const [orderRefNo, setOrderRefNo] = reactExports.useState("B2/ACG-61/Dadabari/2026-27");
  const [handoverInventory, setHandoverInventory] = reactExports.useState(
    "1. PMA Mobile Device & Charger\n2. Beat 2 Letter Box Keys (4 Nos)\n3. Postage Due Register & Stamp Advance (Nil Arrears)"
  );
  const [outsiderName, setOutsiderName] = reactExports.useState("Vikram Singh Meena (Substitute)");
  const [outsiderId, setOutsiderId] = reactExports.useState("OUT-GDS-2026-09");
  const [dailyAllowanceRate, setDailyAllowanceRate] = reactExports.useState(625);
  const [dailyTaDaRate, setDailyTaDaRate] = reactExports.useState(125);
  const [outsiderAuthorityOrder, setOutsiderAuthorityOrder] = reactExports.useState(
    "SP/Kota/Estt/Outsider-Sanction/2026/114"
  );
  const [outsiderAttachment, setOutsiderAttachment] = reactExports.useState(
    "Divisional_Sanction_Order_114.pdf"
  );
  const outsiderTotalAmount = totalCalendarDays * ((Number(dailyAllowanceRate) || 0) + (Number(dailyTaDaRate) || 0));
  const [imeiNumber, setImeiNumber] = reactExports.useState("864920051829310");
  const [deviceModel, setDeviceModel] = reactExports.useState("Samsung Galaxy A35 5G");
  const [appEnvironment, setAppEnvironment] = reactExports.useState("PMA v4.2 + DakPay + IPPB MicroATM");
  const [dataClaimAmount, setDataClaimAmount] = reactExports.useState(250);
  const [deviceIncentiveAmount, setDeviceIncentiveAmount] = reactExports.useState(200);
  const [operatorName, setOperatorName] = reactExports.useState("Reliance Jio 5G");
  const [byodInvoiceFile, setByodInvoiceFile] = reactExports.useState("Mobile_Data_Bill_Receipt.pdf");
  const byodTotalAmount = (Number(dataClaimAmount) || 0) + (Number(deviceIncentiveAmount) || 0);
  const buildCurrentFuelBillObject = () => ({
    type: "FUEL_BILL",
    title: `Annexure-III Fuel Reimbursement Claim (${claimMonth} ${claimYear} · ${workingDays}d × ${fixedKm} KM)`,
    employeeId,
    employeeName,
    employeeEmail: autoEmpEmail,
    beatNo,
    officeName,
    fromDate,
    toDate,
    totalDays: workingDays,
    fixedKm,
    totalAmount: totalFuelAmount,
    details: {
      claimMonth,
      claimYear,
      calendarDays: totalCalendarDays,
      workingDays,
      leaveDays: fuelLeaveDays,
      totalDistanceKm,
      ratePerKm: fuelRatePerKm,
      vehicleNo,
      remarks: fuelRemarks,
      spmVerificationNote,
      dailyRows
    }
  });
  const handleDirectDownloadCurrentFuelPdf = () => {
    const tempBill = {
      ...buildCurrentFuelBillObject(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    };
    downloadOfficialFuelBillPDF(tempBill);
  };
  const handleSubmitForm = (e) => {
    e.preventDefault();
    let created;
    if (activeTab === "FUEL_BILL") {
      created = operationsService.createSpecialBill(buildCurrentFuelBillObject());
      downloadOfficialFuelBillPDF(created);
    } else if (activeTab === "CHARGE_REPORT") {
      created = operationsService.createSpecialBill({
        type: "CHARGE_REPORT",
        title: `ACG-61 Charge Report (${relievedName} → ${employeeName})`,
        employeeId,
        employeeName,
        employeeEmail: autoEmpEmail,
        beatNo,
        officeName,
        fromDate,
        toDate,
        totalDays: totalCalendarDays,
        fixedKm,
        totalAmount: 0,
        details: {
          relievedOfficerName: relievedName,
          relievedOfficerId: relievedId,
          relievedDesignation: relievedDesig,
          relievingOfficerName: employeeName,
          relievingOfficerId: employeeId,
          relievingDesignation: relievingDesig,
          sessionType,
          reasonForTransfer: transferReason,
          orderReferenceNo: orderRefNo,
          cashAndStampsHandedOver: handoverInventory
        }
      });
      downloadOfficialAcg61Pdf({
        relievedOfficerName: relievedName,
        relievingOfficerName: employeeName,
        postName: relievedDesig || "O/S POSTMAN",
        placeName: officeName || "DADABARI SO",
        date: fromDate,
        noonSection: (sessionType == null ? void 0 : sessionType.toLowerCase().includes("forenoon")) ? "AM" : "PM",
        authorityOrderNo: orderRefNo
      });
    } else if (activeTab === "OUTSIDER_BILL") {
      created = operationsService.createSpecialBill({
        type: "OUTSIDER_BILL",
        title: `Outsider / Substitute Duty Bill (${outsiderName})`,
        employeeId,
        employeeName,
        employeeEmail: autoEmpEmail,
        beatNo,
        officeName,
        fromDate,
        toDate,
        totalDays: totalCalendarDays,
        fixedKm,
        totalAmount: outsiderTotalAmount,
        attachmentName: outsiderAttachment,
        details: {
          outsiderName,
          outsiderId,
          dailyAllowanceRate,
          dailyTaDaRate,
          authorityOrderNo: outsiderAuthorityOrder
        }
      });
    } else {
      created = operationsService.createSpecialBill({
        type: "BYOD_BILL",
        title: `BYOD Device & Data Claim (${deviceModel})`,
        employeeId,
        employeeName,
        employeeEmail: autoEmpEmail,
        beatNo,
        officeName,
        fromDate,
        toDate,
        totalDays: totalCalendarDays,
        fixedKm,
        totalAmount: byodTotalAmount,
        attachmentName: byodInvoiceFile,
        details: {
          imeiNumber,
          deviceModel,
          appInstalled: appEnvironment,
          dataPlanAmount: dataClaimAmount,
          deviceAllowanceAmount: deviceIncentiveAmount,
          telecomOperator: operatorName
        }
      });
    }
    setStatusMessage(
      `Generated ${created.billNumber}: "${created.title}" and downloaded official departmental PDF voucher.`
    );
    setSelectedBillForPrint(created);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", id: "special-forms-view", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-amber-400 tracking-wide", children: "Ministry of Communications · Department of Posts · Annexure-III & Official Vouchers" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight mt-1", children: "Special Forms, Fuel Reimbursement (Annexure-III) & Charge Reports" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-300 mt-1", children: "Generates the exact 2-page Departmental Fuel Reimbursement Claim Form (Annexure-III) matching MAHEN FUEL.pdf with dynamic staff, distance, PMA articles, and signature blocks." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 text-xs bg-slate-950/80 border border-slate-800 px-4 py-3 rounded-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 block text-[10px]", children: "Employee ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-bold text-amber-400 tabular-nums", children: employeeId })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-px bg-slate-800" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 block text-[10px]", children: "Beat No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-white", children: extractBeatNumberOnly(beatNo) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-px bg-slate-800" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 block text-[10px]", children: "Avg Running" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-bold text-emerald-400 tabular-nums", children: [
            fixedKm,
            " KM"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-px bg-slate-800" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 block text-[10px]", children: "Post Office" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-white", children: officeName })
        ] })
      ] })
    ] }),
    statusMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs font-medium flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16, className: "text-emerald-700 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: statusMessage })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setStatusMessage(null),
          className: "text-emerald-800 hover:text-emerald-950 font-bold",
          children: "✕"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveTab("FUEL_BILL"),
          className: `p-4 rounded-xl border text-left transition cursor-pointer ${activeTab === "FUEL_BILL" ? "bg-red-800 text-white border-red-900 shadow-sm" : "bg-white text-slate-800 border-slate-200 hover:border-red-300"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Fuel, { size: 18, className: activeTab === "FUEL_BILL" ? "text-amber-300" : "text-red-700" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-mono tabular-nums opacity-80", children: "Annexure-III" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm", children: "Fuel Reimbursement Form" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[11px] mt-0.5 ${activeTab === "FUEL_BILL" ? "text-red-100" : "text-slate-500"}`, children: "Official 2-Page India Post PDF Voucher" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveTab("CHARGE_REPORT"),
          className: `p-4 rounded-xl border text-left transition cursor-pointer ${activeTab === "CHARGE_REPORT" ? "bg-red-800 text-white border-red-900 shadow-sm" : "bg-white text-slate-800 border-slate-200 hover:border-red-300"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { size: 18, className: activeTab === "CHARGE_REPORT" ? "text-amber-300" : "text-red-700" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-mono tabular-nums opacity-80", children: "02. ACG-61" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm", children: "Charge Report Form" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[11px] mt-0.5 ${activeTab === "CHARGE_REPORT" ? "text-red-100" : "text-slate-500"}`, children: "Relieving/Relieved Dual-Signature PDF" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveTab("OUTSIDER_BILL"),
          className: `p-4 rounded-xl border text-left transition cursor-pointer ${activeTab === "OUTSIDER_BILL" ? "bg-red-800 text-white border-red-900 shadow-sm" : "bg-white text-slate-800 border-slate-200 hover:border-red-300"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { size: 18, className: activeTab === "OUTSIDER_BILL" ? "text-amber-300" : "text-red-700" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-mono tabular-nums opacity-80", children: "03. Substitute" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm", children: "Outsider Bill Form" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[11px] mt-0.5 ${activeTab === "OUTSIDER_BILL" ? "text-red-100" : "text-slate-500"}`, children: "External duty TA/DA & order upload" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveTab("BYOD_BILL"),
          className: `p-4 rounded-xl border text-left transition cursor-pointer ${activeTab === "BYOD_BILL" ? "bg-red-800 text-white border-red-900 shadow-sm" : "bg-white text-slate-800 border-slate-200 hover:border-red-300"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { size: 18, className: activeTab === "BYOD_BILL" ? "text-amber-300" : "text-red-700" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-mono tabular-nums opacity-80", children: "04. PMA / Data" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm", children: "BYOD Bill Form" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[11px] mt-0.5 ${activeTab === "BYOD_BILL" ? "text-red-100" : "text-slate-500"}`, children: "IMEI, mobile internet & device claim" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmitForm, className: "bg-white rounded-2xl border border-slate-200 p-6 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold text-slate-900", children: "Step 1: Delivery Staff Details, Post Office & Duty Period" }),
          activeTab === "FUEL_BILL" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: handleLoadMahenReferencePreset,
              className: "px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 13 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Load Official MAHEN FUEL.pdf Reference Values" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "Employee ID / CSI ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: employeeId,
                onChange: (e) => setEmployeeId(e.target.value),
                className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 tabular-nums"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "Name of Delivery Staff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: employeeName,
                onChange: (e) => setEmployeeName(e.target.value),
                className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "Beat No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: beatNo,
                onChange: (e) => {
                  const b = e.target.value;
                  setBeatNo(b);
                  setFixedKm(getDefaultFixedKmForBeat(b));
                },
                className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900",
                children: Array.from({ length: 33 }, (_, i) => `Beat ${i + 1}`).map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b, children: b }, b))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-600 mb-1", children: "Name of Post Office" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: officeName,
                onChange: (e) => setOfficeName(e.target.value),
                className: "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-red-800 mb-1", children: "From Date — To Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "date",
                  required: true,
                  value: fromDate,
                  onChange: (e) => handleDateRangeChange(e.target.value, toDate),
                  className: "w-full px-1.5 py-2 bg-white border border-red-300 rounded-lg text-[10px] font-mono text-slate-900 tabular-nums"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "date",
                  required: true,
                  value: toDate,
                  onChange: (e) => handleDateRangeChange(fromDate, e.target.value),
                  className: "w-full px-1.5 py-2 bg-white border border-red-300 rounded-lg text-[10px] font-mono text-slate-900 tabular-nums"
                }
              )
            ] })
          ] })
        ] })
      ] }),
      activeTab === "FUEL_BILL" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-2 border-t border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-slate-900", children: "Step 2: Annexure-III Fuel Reimbursement Parameters & PMA Accountable Articles Schedule" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setShowDailyScheduleEditor(!showDailyScheduleEditor),
              className: "px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: showDailyScheduleEditor ? "Hide Daily Accountable Articles Table (30 Days)" : `Edit Daily Accountable Articles Table (${dailyRows.length} Days · Total ${scheduleTotals.sumTotal} PMA Articles)` })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Claim Month" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: claimMonth,
                onChange: (e) => setClaimMonth(e.target.value),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900",
                children: [
                  "JANUARY",
                  "FEBRUARY",
                  "MARCH",
                  "APRIL",
                  "MAY",
                  "JUNE",
                  "JULY",
                  "AUGUST",
                  "SEPTEMBER",
                  "OCTOBER",
                  "NOVEMBER",
                  "DECEMBER"
                ].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m, children: m }, m))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Financial Year / Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: claimYear,
                onChange: (e) => setClaimYear(e.target.value),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Avg Running (Fixed KM/Day)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: 1,
                max: 150,
                value: fixedKm,
                onChange: (e) => setFixedKm(Number(e.target.value)),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Sundays / Holidays / Leave" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: 0,
                max: totalCalendarDays - 1,
                value: fuelLeaveDays,
                onChange: (e) => setFuelLeaveDays(Number(e.target.value)),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Rate per KM (₹)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                step: "0.10",
                min: 1,
                value: fuelRatePerKm,
                onChange: (e) => setFuelRatePerKm(Number(e.target.value)),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Vehicle Registration No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: vehicleNo,
                onChange: (e) => setVehicleNo(e.target.value),
                placeholder: "RJ-20-XX-0000",
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Beat Coverage & Logbook Remarks" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: fuelRemarks,
                onChange: (e) => setFuelRemarks(e.target.value),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "SPM / APM Mails Verification Endorsement" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: spmVerificationNote,
                onChange: (e) => setSpmVerificationNote(e.target.value),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              }
            )
          ] })
        ] }),
        showDailyScheduleEditor && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-slate-300 rounded-xl overflow-hidden bg-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
              "Annexure-III Daily Accountable Articles Invoiced & Handled in PMA (",
              dailyRows.length,
              " Days)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-amber-300 tabular-nums", children: [
              "SP: ",
              scheduleTotals.sumSP,
              " · Reg: ",
              scheduleTotals.sumReg,
              " · Others: ",
              scheduleTotals.sumOthers,
              " · Total PMA: ",
              scheduleTotals.sumPMA,
              " (100%)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-72 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left border-collapse text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-300", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-2.5", children: "S.N." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-2.5", children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-2.5", children: "Day Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-2.5", children: "SP" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-2.5", children: "Reg." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-2.5", children: "Others" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-2.5 text-right", children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-2.5 text-right", children: "Handled in PMA" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 px-2.5 text-right", children: "% PMA" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-200 font-mono", children: dailyRows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "tr",
              {
                className: row.status !== "WORKING" ? "bg-amber-50/60" : "hover:bg-slate-50",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-2.5 font-bold", children: row.sn }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-2.5", children: row.date }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "select",
                    {
                      value: row.status,
                      onChange: (e) => updateSingleDailyRow(row.sn, {
                        status: e.target.value
                      }),
                      className: "px-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-sans font-bold",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "WORKING", children: "Working Day" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "SUNDAY", children: "SUNDAY" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "HOLIDAY", children: "HOLIDAY" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "LEAVE", children: "LEAVE" })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-2.5", children: row.status === "WORKING" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "number",
                      min: 0,
                      value: row.sp,
                      onChange: (e) => updateSingleDailyRow(row.sn, { sp: Number(e.target.value) }),
                      className: "w-16 px-2 py-0.5 border border-slate-300 rounded text-xs"
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-800 font-bold", children: row.status }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-2.5", children: row.status === "WORKING" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "number",
                      min: 0,
                      value: row.reg === "" ? "" : row.reg,
                      placeholder: "",
                      onChange: (e) => updateSingleDailyRow(row.sn, {
                        reg: e.target.value === "" ? "" : Number(e.target.value)
                      }),
                      className: "w-16 px-2 py-0.5 border border-slate-300 rounded text-xs"
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: row.reg }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-2.5", children: row.status === "WORKING" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "number",
                      min: 0,
                      value: row.others === "" ? "" : row.others,
                      placeholder: "",
                      onChange: (e) => updateSingleDailyRow(row.sn, {
                        others: e.target.value === "" ? "" : Number(e.target.value)
                      }),
                      className: "w-16 px-2 py-0.5 border border-slate-300 rounded text-xs"
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-800 font-bold", children: row.status }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-2.5 text-right font-bold", children: row.total }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-2.5 text-right", children: row.pmaHandled }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1.5 px-2.5 text-right", children: row.pmaPercent })
                ]
              },
              row.sn
            )) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-900 text-white p-4 rounded-xl grid grid-cols-2 lg:grid-cols-5 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-400 block", children: "Net Working Days" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-bold font-mono tabular-nums text-white", children: [
              workingDays,
              " Days"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-400 block", children: "Avg Running (Fixed KM)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-bold font-mono tabular-nums text-amber-400", children: [
              fixedKm,
              " KM"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-slate-400 block", children: [
              "Total Distance (",
              fixedKm,
              "×",
              workingDays,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-bold font-mono tabular-nums text-emerald-400", children: [
              totalDistanceKm,
              " KM"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-400 block", children: "Total PMA Articles" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-bold font-mono tabular-nums text-white", children: [
              scheduleTotals.sumTotal,
              " (100%)"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-slate-400 block", children: [
              "Total Amount (",
              totalDistanceKm,
              "×",
              fuelRatePerKm.toFixed(2),
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-black font-mono tabular-nums text-amber-400", children: [
              "₹",
              totalFuelAmount.toLocaleString("en-IN")
            ] })
          ] })
        ] })
      ] }),
      activeTab === "CHARGE_REPORT" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-2 border-t border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-red-900 via-red-800 to-red-950 p-4 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-red-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-wider text-amber-300", children: "New Official Feature" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-sm text-white", children: "ACG-61 Charge Report Scanner & Instant Transfer Form" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-200", children: "Upload an image of Form ACG-61, select Relieved/Relieving officer, date, AM/PM noon session, and get an instant downloadable PDF." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/charge-report",
              className: "px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black shrink-0 transition flex items-center justify-center gap-1.5 shadow-md",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Open ACG-61 Scanner Page" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { size: 14 })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-slate-900", children: "Step 2: Form ACG-61 Relieved & Relieving Officer Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Relieved Officer Name (Handing Over)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                required: true,
                value: relievedName,
                onChange: (e) => setRelievedName(e.target.value),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Relieved Officer Employee ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                required: true,
                value: relievedId,
                onChange: (e) => setRelievedId(e.target.value),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 tabular-nums"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Relieved Officer Designation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: relievedDesig,
                onChange: (e) => setRelievedDesig(e.target.value),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Session of Transfer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: sessionType,
                onChange: (e) => setSessionType(e.target.value),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Forenoon (F/N)", children: "Forenoon (F/N)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Afternoon (A/N)", children: "Afternoon (A/N)" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Reason for Transfer of Charge" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: transferReason,
                onChange: (e) => setTransferReason(e.target.value),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Memo / Authority Order No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: orderRefNo,
                onChange: (e) => setOrderRefNo(e.target.value),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Cash, Stamps, PMA Device & Accountable Articles Handed Over" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              rows: 3,
              value: handoverInventory,
              onChange: (e) => setHandoverInventory(e.target.value),
              className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
            }
          )
        ] })
      ] }),
      activeTab === "OUTSIDER_BILL" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-2 border-t border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-slate-900", children: "Step 2: Outsider / Substitute Engagement & TA/DA Calculation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Outsider / Substitute Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                required: true,
                value: outsiderName,
                onChange: (e) => setOutsiderName(e.target.value),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Substitute / GDS ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: outsiderId,
                onChange: (e) => setOutsiderId(e.target.value),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 tabular-nums"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Daily Duty Allowance Rate (₹/Day)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: dailyAllowanceRate,
                onChange: (e) => setDailyAllowanceRate(Number(e.target.value)),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Daily TA / Cycle / Fuel Rate (₹/Day)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: dailyTaDaRate,
                onChange: (e) => setDailyTaDaRate(Number(e.target.value)),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Competent Authority Sanction Order No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: outsiderAuthorityOrder,
                onChange: (e) => setOutsiderAuthorityOrder(e.target.value),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Upload Authority Order Copy (PDF / Image)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between px-3 py-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-slate-700 cursor-pointer hover:bg-slate-100", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: outsiderAttachment || "Choose sanction order file..." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { size: 12 }),
                " Browse"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "file",
                  accept: ".pdf,.jpg,.png",
                  className: "hidden",
                  onChange: (e) => {
                    var _a;
                    const f = (_a = e.target.files) == null ? void 0 : _a[0];
                    if (f) setOutsiderAttachment(f.name);
                  }
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-900 text-white p-4 rounded-xl grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-400 block", children: "Total Duty Days" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-bold font-mono tabular-nums", children: [
              totalCalendarDays,
              " Days"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-400 block", children: "Combined Daily Rate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-bold font-mono tabular-nums text-amber-400", children: [
              "₹",
              Number(dailyAllowanceRate) + Number(dailyTaDaRate),
              " / Day"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-400 block", children: "Total Outsider Bill Claim" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-black font-mono tabular-nums text-emerald-400", children: [
              "₹",
              outsiderTotalAmount.toLocaleString("en-IN")
            ] })
          ] })
        ] })
      ] }),
      activeTab === "BYOD_BILL" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-2 border-t border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-slate-900", children: "Step 2: BYOD (Bring Your Own Device) & Mobile Data Reimbursement" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "15-Digit Device IMEI Number *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                required: true,
                value: imeiNumber,
                onChange: (e) => setImeiNumber(e.target.value),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Smartphone Make & Model" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                required: true,
                value: deviceModel,
                onChange: (e) => setDeviceModel(e.target.value),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Active Postal Apps on Device" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: appEnvironment,
                onChange: (e) => setAppEnvironment(e.target.value),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Monthly Internet Data Claim (₹)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: dataClaimAmount,
                onChange: (e) => setDataClaimAmount(Number(e.target.value)),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "BYOD Device Usage Allowance (₹)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: deviceIncentiveAmount,
                onChange: (e) => setDeviceIncentiveAmount(Number(e.target.value)),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Telecom Operator" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: operatorName,
                onChange: (e) => setOperatorName(e.target.value),
                className: "w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Upload Recharge / Invoice Receipt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between px-3 py-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-slate-700 cursor-pointer hover:bg-slate-100", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: byodInvoiceFile }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-semibold shrink-0", children: "Upload" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "file",
                  accept: ".pdf,.jpg,.png",
                  className: "hidden",
                  onChange: (e) => {
                    var _a;
                    const f = (_a = e.target.files) == null ? void 0 : _a[0];
                    if (f) setByodInvoiceFile(f.name);
                  }
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-900 text-white p-4 rounded-xl grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-400 block", children: "Active BYOD Days" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-bold font-mono tabular-nums", children: [
              totalCalendarDays,
              " Days"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-400 block", children: "Registered IMEI" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold font-mono tabular-nums text-amber-400", children: imeiNumber })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-400 block", children: "Total BYOD Reimbursement" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-black font-mono tabular-nums text-emerald-400", children: [
              "₹",
              byodTotalAmount.toLocaleString("en-IN")
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200", children: [
        activeTab === "FUEL_BILL" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: handleDirectDownloadCurrentFuelPdf,
            className: "px-5 py-3 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 16 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Instant Download Official Annexure-III PDF (MAHEN FUEL.pdf Format)" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "submit",
            className: "px-6 py-3 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 16 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Submit, Save & Open Official Printable PDF Voucher" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6 space-y-5", id: "dss-fuel-ledger-section", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-red-800 uppercase tracking-wide", children: "Standard Operational Ledger · DSS (Daily Summary Sheet) Reconciliation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-slate-900 mt-0.5", children: "Fuel Bill & Expense Logging Register (Odometer KM Reading, Fuel Volume, Cost & Receipt Tracking)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Reconciles physical vehicle odometer KM readings, fuel bunk volume (Litres), receipt numbers, and sanctioned beat allowance for DSS accounting." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setShowAddFuelLedgerModal(!showAddFuelLedgerModal),
              className: "px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Fuel, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: showAddFuelLedgerModal ? "Close Ledger Entry Form" : "+ Log Odometer & Fuel Receipt" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: handleExportFuelLedgerCSV,
              className: "px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Export DSS Ledger (CSV)" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5 rounded-xl bg-slate-50 border border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 font-semibold block", children: "Total Odometer KM Logged" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-black text-slate-900 font-mono tabular-nums mt-0.5 block", children: [
            fuelLedger.reduce((s, e) => s + e.netKmRun, 0),
            " KM"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-emerald-700 font-semibold", children: [
            "Matched against ",
            fixedKm,
            " KM/day Beat Scale"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5 rounded-xl bg-slate-50 border border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 font-semibold block", children: "Total Fuel Volume Dispensed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-black text-slate-900 font-mono tabular-nums mt-0.5 block", children: [
            fuelLedger.reduce((s, e) => s + e.fuelVolumeLitres, 0).toFixed(2),
            " Litres"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-500", children: "Verified Petrol Bunk Vouchers" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5 rounded-xl bg-slate-50 border border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 font-semibold block", children: "Total Fuel Receipt Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-black text-red-800 font-mono tabular-nums mt-0.5 block", children: [
            "₹",
            fuelLedger.reduce((s, e) => s + e.totalFuelCost, 0).toLocaleString("en-IN")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-slate-500", children: "Actual Bunk Receipts Logged" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5 rounded-xl bg-slate-50 border border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 font-semibold block", children: "DSS Reconciliation Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-black text-emerald-700 font-mono tabular-nums mt-0.5 block", children: [
            fuelLedger.filter((e) => e.dssReconciliationStatus === "Reconciled with DSS").length,
            " / ",
            fuelLedger.length
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-emerald-700 font-semibold", children: "Reconciled with Sub-Office DSS" })
        ] })
      ] }),
      showAddFuelLedgerModal && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "form",
        {
          onSubmit: handleAddFuelLedgerSubmit,
          className: "p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-xs",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900", children: "New Operational Fuel & Odometer Log Entry (DSS Reconciliation Format)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Refill / Log Date *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "date",
                    required: true,
                    value: fledDate,
                    onChange: (e) => setFledDate(e.target.value),
                    className: "w-full p-2 bg-white border border-slate-300 rounded-lg font-mono"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Opening KM Reading *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "number",
                    required: true,
                    value: fledOpeningKm,
                    onChange: (e) => setFledOpeningKm(Number(e.target.value)),
                    className: "w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Closing KM Reading *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "number",
                    required: true,
                    value: fledClosingKm,
                    onChange: (e) => setFledClosingKm(Number(e.target.value)),
                    className: "w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Fuel Volume (Litres) *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "number",
                    step: "0.01",
                    required: true,
                    value: fledFuelLitres,
                    onChange: (e) => setFledFuelLitres(Number(e.target.value)),
                    className: "w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Fuel Rate (₹/Litre)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "number",
                    step: "0.01",
                    value: fledPricePerLitre,
                    onChange: (e) => setFledPricePerLitre(Number(e.target.value)),
                    className: "w-full p-2 bg-white border border-slate-300 rounded-lg font-mono"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Receipt / Voucher No. *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    required: true,
                    placeholder: "IOCL-KOTA-XXXXX",
                    value: fledReceiptNo,
                    onChange: (e) => setFledReceiptNo(e.target.value),
                    className: "w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-12 gap-3 items-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Fuel Station / Bunk Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: fledStation,
                    onChange: (e) => setFledStation(e.target.value),
                    className: "w-full p-2 bg-white border border-slate-300 rounded-lg"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Payment Mode" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    value: fledPaymentMode,
                    onChange: (e) => setFledPaymentMode(e.target.value),
                    className: "w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "UPI / DakPay", children: "UPI / DakPay" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "IPPB", children: "IPPB Account" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Cash", children: "Cash Voucher" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Card", children: "Fleet Card" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Operational Remarks" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: fledRemarks,
                    onChange: (e) => setFledRemarks(e.target.value),
                    className: "w-full p-2 bg-white border border-slate-300 rounded-lg"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "submit",
                  className: "w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer",
                  children: "Save Ledger Entry"
                }
              ) })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left border-collapse text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-slate-200 text-slate-500 bg-slate-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold", children: "Date & ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold", children: "Staff & Beat" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold text-right", children: "Opening → Closing KM" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold text-right", children: "Net KM Run" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold text-right", children: "Fuel Volume" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold text-right", children: "Total Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold", children: "Receipt & Fuel Bunk" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold", children: "DSS Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold text-right", children: "Reconcile" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-200", children: fuelLedger.map((entry) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-slate-50/80 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2.5 px-3 font-mono whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900", children: entry.date }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-500", children: entry.id })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2.5 px-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-slate-900", children: entry.employeeName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-mono text-slate-500", children: [
              entry.beatNo,
              " · ",
              entry.vehicleNo
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2.5 px-3 text-right font-mono tabular-nums text-slate-800 whitespace-nowrap", children: [
            entry.openingKmReading,
            " → ",
            entry.closingKmReading
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2.5 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums whitespace-nowrap", children: [
            entry.netKmRun,
            " KM"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2.5 px-3 text-right font-mono tabular-nums text-slate-800 whitespace-nowrap", children: [
            entry.fuelVolumeLitres,
            " L ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-slate-400", children: [
              "(@₹",
              entry.fuelPricePerLitre,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap", children: [
            "₹",
            entry.totalFuelCost.toLocaleString("en-IN")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2.5 px-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono font-bold text-red-800", children: entry.receiptNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-500 truncate max-w-48", children: [
              entry.fuelStationName,
              " (",
              entry.paymentMode,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              className: `font-bold text-[11px] ${entry.dssReconciliationStatus === "Reconciled with DSS" ? "text-emerald-700" : "text-amber-700"}`,
              children: [
                "✓ ",
                entry.dssReconciliationStatus
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-right whitespace-nowrap", children: entry.dssReconciliationStatus !== "Reconciled with DSS" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => operationsService.updateFuelLedgerStatus(entry.id, "Reconciled with DSS"),
              className: "px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold cursor-pointer",
              children: "Mark DSS Reconciled"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-mono text-slate-400", children: "Verified" }) })
        ] }, entry.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-slate-900", children: "Submitted Special Forms, Annexure-III Fuel Claims & Charge Reports Register" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Click “Download PDF” or “Preview / Print” on any Fuel Bill entry to generate the exact 2-page India Post Annexure-III PDF." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono text-slate-500 tabular-nums", children: [
          "Total Vouchers: ",
          bills.length
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left border-collapse text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-slate-200 text-slate-500 bg-slate-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold", children: "Voucher No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold", children: "Form Type & Title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold", children: "Officer & Beat" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold", children: "Duty Period" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold text-right", children: "Days / KM" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold text-right", children: "Claim Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 font-semibold text-right", children: "Action" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-200", children: bills.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-slate-50/80 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap", children: b.billNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 px-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900", children: b.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-500", children: [
              b.type.replace("_", " "),
              " · ",
              b.officeName
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 px-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-slate-900", children: b.employeeName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-mono text-slate-500 tabular-nums", children: [
              "ID: ",
              b.employeeId,
              " · Beat ",
              extractBeatNumberOnly(b.beatNo)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 px-3 font-mono text-[11px] text-slate-700 tabular-nums whitespace-nowrap", children: [
            b.fromDate,
            " → ",
            b.toDate
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 px-3 text-right font-mono tabular-nums text-slate-800 whitespace-nowrap", children: [
            b.totalDays,
            "d · ",
            b.fixedKm,
            " KM"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap", children: b.type === "CHARGE_REPORT" ? "Official Handover" : `₹${b.totalAmount.toLocaleString("en-IN")}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-slate-800", children: b.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3 text-right whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2", children: [
            b.type === "FUEL_BILL" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => downloadOfficialFuelBillPDF(b),
                className: "px-2.5 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 12 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Download PDF" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setSelectedBillForPrint(b),
                className: "px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 12 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Preview / Print" })
                ]
              }
            ),
            (userProfile == null ? void 0 : userProfile.role) === "SUPER_ADMIN" && b.status !== "Sanctioned" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => operationsService.updateSpecialBillStatus(b.id, "Sanctioned"),
                className: "px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold cursor-pointer",
                children: "Sanction"
              }
            )
          ] }) })
        ] }, b.id)) })
      ] }) })
    ] }),
    selectedBillForPrint && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-slate-950/75 flex items-center justify-center p-4 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 border border-slate-300 shadow-2xl space-y-6 my-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 print:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-slate-900", children: selectedBillForPrint.type === "FUEL_BILL" ? "Official India Post Annexure-III Fuel Reimbursement Claim Voucher (2-Page Format)" : "Official Department of Posts Printable Voucher / PDF" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Strictly formatted to match the official departmental layout (MAHEN FUEL.pdf)." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          selectedBillForPrint.type === "FUEL_BILL" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => downloadOfficialFuelBillPDF(selectedBillForPrint),
              className: "px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Download Official 2-Page PDF" })
              ]
            }
          ),
          selectedBillForPrint.type === "CHARGE_REPORT" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                var _a;
                return downloadOfficialAcg61Pdf({
                  relievedOfficerName: selectedBillForPrint.details.relievedOfficerName || selectedBillForPrint.employeeName,
                  relievedOfficerId: selectedBillForPrint.details.relievedOfficerId,
                  relievingOfficerName: selectedBillForPrint.details.relievingOfficerName || "VACANT",
                  relievingOfficerId: selectedBillForPrint.details.relievingOfficerId,
                  postName: selectedBillForPrint.details.relievedDesignation || "O/S POSTMAN",
                  placeName: selectedBillForPrint.officeName || "DADABARI SO",
                  date: selectedBillForPrint.fromDate,
                  noonSection: ((_a = selectedBillForPrint.details.sessionType) == null ? void 0 : _a.toLowerCase().includes("forenoon")) ? "AM" : "PM",
                  authorityOrderNo: selectedBillForPrint.details.orderReferenceNo,
                  copyToList: selectedBillForPrint.details.copyToList
                });
              },
              className: "px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Download Form ACG-61 PDF" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => window.print(),
              className: "px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Print" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setSelectedBillForPrint(null),
              className: "p-2 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 })
            }
          )
        ] })
      ] }),
      selectedBillForPrint.type === "FUEL_BILL" ? (() => {
        const d = selectedBillForPrint.details || {};
        const rows = buildFuelDailySchedule(
          selectedBillForPrint.fromDate,
          selectedBillForPrint.toDate,
          d.leaveDays,
          d.dailyRows
        );
        const tots = calculateFuelScheduleTotals(rows);
        const wDays = Number(
          d.workingDays || selectedBillForPrint.totalDays || tots.workingDaysCount || 25
        );
        const fKm = Number(selectedBillForPrint.fixedKm) || 30;
        const dist = Number(d.totalDistanceKm) || fKm * wDays;
        const rate = Number(d.ratePerKm) || 3.6;
        const amt = Number(selectedBillForPrint.totalAmount) || Math.round(dist * rate);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 text-black font-sans text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-black", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full border-collapse text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("colgroup", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("col", { className: "w-[6%]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("col", { className: "w-[16%]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("col", { className: "w-[13%]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("col", { className: "w-[13%]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("col", { className: "w-[10%]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("col", { className: "w-[14%]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("col", { className: "w-[14%]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("col", { className: "w-[14%]" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "border border-black px-2 py-1 text-right", children: "Annexure-III" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 8, className: "border border-black px-2 py-2 text-center font-bold text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "underline", children: "Ministry of Communications" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "underline mt-0.5", children: "Department of Posts" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "border border-black px-2 py-1 text-center font-bold underline text-sm", children: "Fuel Reimburshment Claim Form" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2, className: "border border-black px-2 py-1 font-bold", children: "Name of Post Office:-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "border border-black px-2 py-1", children: selectedBillForPrint.officeName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-2 py-1 text-center font-bold text-[11px]", children: "Vehicle No.:-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2, className: "border border-black px-2 py-1 text-center font-mono text-[11px]", children: d.vehicleNo || "RJ-20-SS-4521" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2, className: "border border-black px-2 py-1 font-bold", children: "Name of Delivery Staff:-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "border border-black px-2 py-1 font-bold uppercase", children: selectedBillForPrint.employeeName })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2, className: "border border-black px-2 py-1 font-bold", children: "Employee ID:-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "border border-black px-2 py-1 text-center", children: selectedBillForPrint.employeeId }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-2 py-1 text-center font-bold", children: "Avg running" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 2, className: "border border-black px-2 py-1 text-center font-bold", children: [
                  fKm,
                  " KM"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2, className: "border border-black px-2 py-1 font-bold", children: "Beat No.:-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "border border-black px-2 py-1 text-center", children: extractBeatNumberOnly(selectedBillForPrint.beatNo) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-2 py-1 text-center font-bold", children: "Working Days" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 2, className: "border border-black px-2 py-1 text-center", children: [
                  wDays,
                  " Days"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2, className: "border border-black px-2 py-1 font-bold", children: "Month & F.Y. :-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "border border-black px-2 py-1 text-center font-bold uppercase", children: d.claimMonth || "SEPTEMBER" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "border border-black px-2 py-1 text-center font-bold", children: d.claimYear || "2026" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "font-bold text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { rowSpan: 2, className: "border border-black px-1 py-1 align-top", children: "S.N." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { rowSpan: 2, className: "border border-black px-1 py-1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 3, className: "border border-black px-2 py-1", children: [
                  "Total no. Of Accountable Articles",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "invoiced to Delivery staff"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { rowSpan: 2, className: "border border-black px-1 py-1 align-top", children: "Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { rowSpan: 2, className: "border border-black px-1 py-1 align-top", children: [
                  "Total articles",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "handled in",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "PMA"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { rowSpan: 2, className: "border border-black px-1 py-1 align-top", children: [
                  "% of articles",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "handled in",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  "PMA"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "font-bold text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-1 py-1", children: "SP" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-1 py-1", children: "Reg." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-1 py-1", children: "Others" })
              ] }),
              rows.map((r) => {
                const isOff = r.status !== "WORKING";
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-1 py-0.5 text-center", children: r.sn }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-1 py-0.5 text-center", children: r.date }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-1 py-0.5 text-center", children: isOff ? r.status : r.sp }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-1 py-0.5 text-center", children: r.reg }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-1 py-0.5 text-center", children: isOff ? r.status : r.others }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "td",
                    {
                      className: `border border-black px-1.5 py-0.5 ${isOff ? "text-center" : "text-right"}`,
                      children: isOff ? r.status : r.total
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-1.5 py-0.5 text-right", children: isOff ? "" : r.pmaHandled }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "td",
                    {
                      className: `border border-black px-1.5 py-0.5 ${isOff ? "text-center" : "text-right"}`,
                      children: isOff ? r.status : r.pmaPercent
                    }
                  )
                ] }, r.sn);
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-1 py-1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-2 py-1", children: "TOTAL" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-1 py-1 text-center", children: tots.sumSP }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-1 py-1 text-center", children: tots.sumReg }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-1 py-1 text-center", children: tots.sumOthers }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-1 py-1 text-center", children: tots.sumTotal }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-1 py-1 text-center", children: tots.sumPMA }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black px-1 py-1" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 8, className: "border border-black px-2 py-1", children: [
                "Total Distance travelled in the month= ",
                fKm,
                "*",
                wDays,
                "= ",
                dist
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 8, className: "border border-black px-2 py-1", children: [
                "Total Amount Claimed= ",
                dist,
                "*",
                rate.toFixed(2),
                "= ",
                amt
              ] }) })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-black", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full border-collapse text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("colgroup", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("col", { className: "w-[6%]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("col", { className: "w-[16%]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("col", { className: "w-[13%]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("col", { className: "w-[13%]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("col", { className: "w-[10%]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("col", { className: "w-[14%]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("col", { className: "w-[14%]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("col", { className: "w-[14%]" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 8, className: "border border-black p-2.5 leading-relaxed", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Declaration:-" }),
                " It is certified that all the delivery of Accountable articles has taken place at the doorstep of the addressee and delivery information has also been updated with correct details of addressee in PMA App in respect of all the Accountable articles delivered/ Undelivered in dates mentioned above."
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "h-6", children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black" }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "h-6", children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black" }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2, className: "border border-black px-2 py-1 font-bold", children: "Date:-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    colSpan: 4,
                    className: "border border-black px-2 py-1 text-center font-bold",
                    children: "Name & Signature of Delivery Staff"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "h-6", children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black" }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "border border-black px-2 py-1", children: d.spmVerificationNote || "Checked and found genuine & Forwarded to Division Office for sanction." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "h-6", children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black" }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "h-6", children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black" }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2, className: "border border-black px-2 py-1 font-bold", children: "Date:-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    colSpan: 4,
                    className: "border border-black px-2 py-1 text-center font-bold",
                    children: "Name & Signature of APM mails/ Postmaster"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "h-6", children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black" }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "h-6", children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black" }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "h-6", children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black" }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    colSpan: 2,
                    className: "border border-black px-2 py-1 text-center font-bold",
                    children: "Sanctioned By:-"
                  }
                ),
                Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black" }, i))
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "h-6", children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black" }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 2, className: "border border-black px-2 py-1 font-bold", children: "Date:-" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border border-black" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "td",
                  {
                    colSpan: 4,
                    className: "border border-black px-2 py-1 text-center font-bold",
                    children: "Name & Signature of Divisional Head"
                  }
                )
              ] })
            ] })
          ] }) })
        ] });
      })() : (
        /* Printable Document Body for ACG-61 Charge Report, Outsider Bill & BYOD Bill */
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-slate-900 p-6 space-y-5 text-slate-900", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center border-b-2 border-slate-900 pb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold tracking-widest uppercase", children: "DEPARTMENT OF POSTS, INDIA · OFFICE OF THE SUB-POSTMASTER" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-black mt-1", children: [
              selectedBillForPrint.officeName,
              " · KOTA DIVISION (RAJASTHAN CIRCLE)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-mono mt-1 font-bold", children: selectedBillForPrint.type === "CHARGE_REPORT" ? "FORM ACG-61 · OFFICIAL CERTIFICATE OF TRANSFER OF CHARGE" : `OFFICIAL REIMBURSEMENT CLAIM VOUCHER · ${selectedBillForPrint.billNumber}` })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 border border-slate-300", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 block", children: "Voucher / Memo No:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-mono", children: selectedBillForPrint.billNumber })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 block", children: "Employee ID & Name:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                selectedBillForPrint.employeeName,
                " (",
                selectedBillForPrint.employeeId,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 block", children: "Beat & Fixed KM:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "font-mono", children: [
                selectedBillForPrint.beatNo,
                " (",
                selectedBillForPrint.fixedKm,
                " KM/day)"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500 block", children: "Period & Total Days:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "font-mono", children: [
                selectedBillForPrint.fromDate,
                " to ",
                selectedBillForPrint.toDate,
                " (",
                selectedBillForPrint.totalDays,
                " Days)"
              ] })
            ] })
          ] }),
          selectedBillForPrint.type === "CHARGE_REPORT" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-xs leading-relaxed", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
              "Certified that we have in the",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedBillForPrint.details.sessionType }),
              " of this day",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-mono", children: selectedBillForPrint.fromDate }),
              " (Duty cycle up to",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-mono", children: selectedBillForPrint.toDate }),
              ", Total",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                selectedBillForPrint.totalDays,
                " Days"
              ] }),
              ") respectively made over and received charge of the office / beat of",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                selectedBillForPrint.beatNo,
                ", ",
                selectedBillForPrint.officeName
              ] }),
              " ",
              "in pursuance of Memo No.",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-mono", children: selectedBillForPrint.details.orderReferenceNo }),
              " ",
              "on account of",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedBillForPrint.details.reasonForTransfer }),
              "."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 border border-slate-300 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-700", children: "Relieved Officer (Handing Over):" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1", children: [
                  "Name: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedBillForPrint.details.relievedOfficerName })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  "Employee ID:",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-mono", children: selectedBillForPrint.details.relievedOfficerId })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  "Designation: ",
                  selectedBillForPrint.details.relievedDesignation
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-700", children: "Relieving Officer (Taking Over):" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1", children: [
                  "Name: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: selectedBillForPrint.details.relievingOfficerName })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  "Employee ID:",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-mono", children: selectedBillForPrint.details.relievingOfficerId })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  "Designation: ",
                  selectedBillForPrint.details.relievingDesignation
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-slate-300 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold mb-1", children: "Inventory of Cash, Stamps, Keys & PMA Equipment Handed Over:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "font-mono text-[11px] whitespace-pre-wrap text-slate-800", children: selectedBillForPrint.details.cashAndStampsHandedOver })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm border-b border-slate-200 pb-1", children: selectedBillForPrint.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 border border-slate-300 p-3 font-mono", children: Object.entries(selectedBillForPrint.details || {}).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-b border-slate-100 py-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-600", children: [
                k,
                ":"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-slate-900", children: String(v) })
            ] }, k)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-slate-100 border border-slate-400 flex items-center justify-between text-sm font-bold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "NET SANCTIONED / CLAIMED AMOUNT:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-lg", children: [
                "₹",
                selectedBillForPrint.totalAmount.toLocaleString("en-IN"),
                "/-"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-6 pt-10 text-center text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-slate-800 pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: selectedBillForPrint.type === "CHARGE_REPORT" ? "Signature of Relieved Officer" : "Signature of Claimant / Postman" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-600 mt-0.5", children: selectedBillForPrint.type === "CHARGE_REPORT" ? selectedBillForPrint.details.relievedOfficerName : selectedBillForPrint.employeeName })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-slate-800 pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: selectedBillForPrint.type === "CHARGE_REPORT" ? "Signature of Relieving Officer" : "Verified by Delivery PA / Supervisor" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-600 mt-0.5", children: selectedBillForPrint.type === "CHARGE_REPORT" ? selectedBillForPrint.details.relievingOfficerName : `${selectedBillForPrint.beatNo} Supervisor` })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-slate-800 pt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: "Counter-Signed (Sub-Postmaster)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-600 mt-0.5", children: "Sub-Postmaster, Dadabari S.O. (324009)" })
            ] })
          ] })
        ] })
      )
    ] }) })
  ] });
}
export {
  SpecialFormsView as default
};
