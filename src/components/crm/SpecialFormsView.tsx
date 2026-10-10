import React, { useState, useEffect, useMemo } from 'react';
import {
  Fuel,
  ArrowLeftRight,
  UserCheck,
  Smartphone,
  Printer,
  CheckCircle2,
  Upload,
  Download,
  X,
  Table,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { operationsService } from '../../services/operationsService';
import { SpecialBillRecord, SpecialBillType } from '../../types/models';
import { getDefaultFixedKmForBeat } from '../../services/staffPermissionService';
import {
  FuelDailyRow,
  MAHEN_FUEL_REFERENCE_ROWS,
  buildFuelDailySchedule,
  calculateFuelScheduleTotals,
  downloadOfficialFuelBillPDF,
  extractBeatNumberOnly,
} from '../../utils/fuelBillPdfGenerator';

function calculateDaysBetween(fromStr: string, toStr: string): number {
  if (!fromStr || !toStr) return 1;
  const d1 = new Date(fromStr);
  const d2 = new Date(toStr);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
  const diffMs = d2.getTime() - d1.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, days);
}

export default function SpecialFormsView() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<SpecialBillType>('FUEL_BILL');
  const [bills, setBills] = useState<SpecialBillRecord[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<SpecialBillRecord | null>(null);
  const [showDailyScheduleEditor, setShowDailyScheduleEditor] = useState<boolean>(false);

  // Auto-filled Profile Context (defaults to Official MAHEN FUEL.pdf Reference Profile)
  const autoEmpId = userProfile?.employeeId || '50457421';
  const autoEmpName = userProfile?.name || 'MAHENDRA KUMAR MEENA';
  const autoEmpEmail = userProfile?.email || 'mahen.comtech@gmail.com';
  const autoBeat = userProfile?.beat || 'Beat 2';
  const autoOffice = userProfile?.assignedOffice || 'Dadabari s.o.';
  const autoFixedKm = userProfile?.fixedKm || 30;

  const [fromDate, setFromDate] = useState('2026-08-01');
  const [toDate, setToDate] = useState('2026-08-30');
  const [employeeId, setEmployeeId] = useState(autoEmpId);
  const [employeeName, setEmployeeName] = useState(autoEmpName);
  const [beatNo, setBeatNo] = useState(autoBeat);
  const [officeName, setOfficeName] = useState(autoOffice);
  const [fixedKm, setFixedKm] = useState<number>(autoFixedKm);

  // Sync profile changes to auto-fill fields
  useEffect(() => {
    if (userProfile) {
      setEmployeeId(userProfile.employeeId || '50457421');
      setEmployeeName(userProfile.name || 'MAHENDRA KUMAR MEENA');
      setBeatNo(userProfile.beat || 'Beat 2');
      setOfficeName(userProfile.assignedOffice || 'Dadabari s.o.');
      setFixedKm(userProfile.fixedKm || 30);
    }
  }, [userProfile]);

  useEffect(() => {
    setBills(operationsService.getSpecialBills());
    const unsub = operationsService.subscribe(() => {
      setBills(operationsService.getSpecialBills());
    });
    return () => unsub();
  }, []);

  const totalCalendarDays = useMemo(() => calculateDaysBetween(fromDate, toDate), [fromDate, toDate]);

  // 1. Fuel Bill specific state (Annexure-III Official Format)
  const [claimMonth, setClaimMonth] = useState('SEPTEMBER');
  const [claimYear, setClaimYear] = useState('2026');
  const [fuelLeaveDays, setFuelLeaveDays] = useState<number>(5);
  const [fuelRatePerKm, setFuelRatePerKm] = useState<number>(3.6);
  const [vehicleNo, setVehicleNo] = useState('RJ-20-SS-4521');
  const [fuelRemarks, setFuelRemarks] = useState(
    'Doorstep delivery of Accountable Articles updated in PMA App across Beat 2'
  );
  const [spmVerificationNote, setSpmVerificationNote] = useState(
    'Checked and found genuine & Forwarded to Division Office for sanction.'
  );
  const [dailyRows, setDailyRows] = useState<FuelDailyRow[]>(() =>
    MAHEN_FUEL_REFERENCE_ROWS.map((r) => ({ ...r }))
  );

  // Rebuild daily schedule when date range changes
  const handleDateRangeChange = (newFrom: string, newTo: string) => {
    setFromDate(newFrom);
    setToDate(newTo);
    const rebuilt = buildFuelDailySchedule(newFrom, newTo, fuelLeaveDays);
    setDailyRows(rebuilt);
    const tots = calculateFuelScheduleTotals(rebuilt);
    setFuelLeaveDays(tots.offDaysCount);
  };

  const scheduleTotals = useMemo(() => calculateFuelScheduleTotals(dailyRows), [dailyRows]);
  const workingDays = Math.max(1, totalCalendarDays - (Number(fuelLeaveDays) || 0));
  const totalDistanceKm = workingDays * (Number(fixedKm) || 0);
  const totalFuelAmount = Math.round(totalDistanceKm * (Number(fuelRatePerKm) || 0));

  const handleLoadMahenReferencePreset = () => {
    setEmployeeId('50457421');
    setEmployeeName('MAHENDRA KUMAR MEENA');
    setBeatNo('Beat 2');
    setOfficeName('Dadabari s.o.');
    setFixedKm(30);
    setFromDate('2026-08-01');
    setToDate('2026-08-30');
    setClaimMonth('SEPTEMBER');
    setClaimYear('2026');
    setFuelLeaveDays(5);
    setFuelRatePerKm(3.6);
    setVehicleNo('RJ-20-SS-4521');
    setDailyRows(MAHEN_FUEL_REFERENCE_ROWS.map((r) => ({ ...r })));
    setStatusMessage('Loaded exact official reference data from MAHEN FUEL.pdf (30 KM × 25 Days = 750 KM × ₹3.60 = ₹2,700).');
  };

  const updateSingleDailyRow = (
    sn: number,
    patch: Partial<FuelDailyRow>
  ) => {
    setDailyRows((prev) => {
      const next = prev.map((r) => {
        if (r.sn !== sn) return r;
        const updated = { ...r, ...patch };
        if (updated.status !== 'WORKING') {
          const lbl = updated.status;
          return {
            ...updated,
            sp: lbl,
            reg: updated.status === 'HOLIDAY' ? 0 : '',
            others: lbl,
            total: lbl,
            pmaHandled: '',
            pmaPercent: lbl,
          };
        } else {
          const spNum = typeof updated.sp === 'number' ? updated.sp : Number(updated.sp) || 0;
          const regNum = updated.reg === '' ? 0 : Number(updated.reg) || 0;
          const othersNum = updated.others === '' ? 0 : Number(updated.others) || 0;
          const tot = spNum + regNum + othersNum;
          return {
            ...updated,
            sp: spNum,
            total: tot,
            pmaHandled: tot,
            pmaPercent: 100,
          };
        }
      });
      const newTots = calculateFuelScheduleTotals(next);
      setFuelLeaveDays(newTots.offDaysCount);
      return next;
    });
  };

  // 2. Charge Report (ACG-61) specific state
  const [relievedName, setRelievedName] = useState('Rajesh Kumar Sharma');
  const [relievedId, setRelievedId] = useState('CSI-10089231');
  const [relievedDesig, setRelievedDesig] = useState('Postman');
  const [relievingDesig, setRelievingDesig] = useState(
    userProfile?.role === 'SUPER_ADMIN' ? 'Postal Admin / Supervisor' : 'Postman'
  );
  const [sessionType, setSessionType] = useState<'Forenoon (F/N)' | 'Afternoon (A/N)'>('Forenoon (F/N)');
  const [transferReason, setTransferReason] = useState('Earned Leave / Official Duty Arrangement');
  const [orderRefNo, setOrderRefNo] = useState('B2/ACG-61/Dadabari/2026-27');
  const [handoverInventory, setHandoverInventory] = useState(
    '1. PMA Mobile Device & Charger\n2. Beat 2 Letter Box Keys (4 Nos)\n3. Postage Due Register & Stamp Advance (Nil Arrears)'
  );

  // 3. Outsider Bill specific state
  const [outsiderName, setOutsiderName] = useState('Vikram Singh Meena (Substitute)');
  const [outsiderId, setOutsiderId] = useState('OUT-GDS-2026-09');
  const [dailyAllowanceRate, setDailyAllowanceRate] = useState<number>(625);
  const [dailyTaDaRate, setDailyTaDaRate] = useState<number>(125);
  const [outsiderAuthorityOrder, setOutsiderAuthorityOrder] = useState(
    'SP/Kota/Estt/Outsider-Sanction/2026/114'
  );
  const [outsiderAttachment, setOutsiderAttachment] = useState<string>(
    'Divisional_Sanction_Order_114.pdf'
  );

  const outsiderTotalAmount =
    totalCalendarDays * ((Number(dailyAllowanceRate) || 0) + (Number(dailyTaDaRate) || 0));

  // 4. BYOD Bill specific state
  const [imeiNumber, setImeiNumber] = useState('864920051829310');
  const [deviceModel, setDeviceModel] = useState('Samsung Galaxy A35 5G');
  const [appEnvironment, setAppEnvironment] = useState('PMA v4.2 + DakPay + IPPB MicroATM');
  const [dataClaimAmount, setDataClaimAmount] = useState<number>(250);
  const [deviceIncentiveAmount, setDeviceIncentiveAmount] = useState<number>(200);
  const [operatorName, setOperatorName] = useState('Reliance Jio 5G');
  const [byodInvoiceFile, setByodInvoiceFile] = useState<string>('Mobile_Data_Bill_Receipt.pdf');

  const byodTotalAmount = (Number(dataClaimAmount) || 0) + (Number(deviceIncentiveAmount) || 0);

  const buildCurrentFuelBillObject = (): Omit<
    SpecialBillRecord,
    'id' | 'billNumber' | 'status' | 'createdAt'
  > => ({
    type: 'FUEL_BILL',
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
      dailyRows,
    },
  });

  const handleDirectDownloadCurrentFuelPdf = () => {
    const tempBill: SpecialBillRecord = {
      ...buildCurrentFuelBillObject(),
      id: 'PREVIEW-FUEL',
      billNumber: `DOP/KOTA/ANNEXURE-III/${claimYear}`,
      status: 'Submitted',
      createdAt: new Date().toISOString().split('T')[0],
    };
    downloadOfficialFuelBillPDF(tempBill);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    let created: SpecialBillRecord;

    if (activeTab === 'FUEL_BILL') {
      created = operationsService.createSpecialBill(buildCurrentFuelBillObject());
      downloadOfficialFuelBillPDF(created);
    } else if (activeTab === 'CHARGE_REPORT') {
      created = operationsService.createSpecialBill({
        type: 'CHARGE_REPORT',
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
          cashAndStampsHandedOver: handoverInventory,
        },
      });
    } else if (activeTab === 'OUTSIDER_BILL') {
      created = operationsService.createSpecialBill({
        type: 'OUTSIDER_BILL',
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
          authorityOrderNo: outsiderAuthorityOrder,
        },
      });
    } else {
      created = operationsService.createSpecialBill({
        type: 'BYOD_BILL',
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
          telecomOperator: operatorName,
        },
      });
    }

    setStatusMessage(
      `Generated ${created.billNumber}: "${created.title}" and downloaded official departmental PDF voucher.`
    );
    setSelectedBillForPrint(created);
  };

  return (
    <div className="space-y-6" id="special-forms-view">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-amber-400 tracking-wide">
            Ministry of Communications · Department of Posts · Annexure-III & Official Vouchers
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Special Forms, Fuel Reimbursement (Annexure-III) & Charge Reports
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Generates the exact 2-page Departmental Fuel Reimbursement Claim Form (Annexure-III) matching MAHEN FUEL.pdf with dynamic staff, distance, PMA articles, and signature blocks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-950/80 border border-slate-800 px-4 py-3 rounded-xl">
          <div>
            <span className="text-slate-400 block text-[10px]">Employee ID</span>
            <span className="font-mono font-bold text-amber-400 tabular-nums">{employeeId}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px]">Beat No.</span>
            <span className="font-bold text-white">{extractBeatNumberOnly(beatNo)}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px]">Avg Running</span>
            <span className="font-mono font-bold text-emerald-400 tabular-nums">{fixedKm} KM</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px]">Post Office</span>
            <span className="font-bold text-white">{officeName}</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs font-medium flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-emerald-800 hover:text-emerald-950 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Segmented Form Type Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('FUEL_BILL')}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${
            activeTab === 'FUEL_BILL'
              ? 'bg-red-800 text-white border-red-900 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <Fuel size={18} className={activeTab === 'FUEL_BILL' ? 'text-amber-300' : 'text-red-700'} />
            <span className="text-[11px] font-mono tabular-nums opacity-80">Annexure-III</span>
          </div>
          <div className="font-bold text-sm">Fuel Reimbursement Form</div>
          <div className={`text-[11px] mt-0.5 ${activeTab === 'FUEL_BILL' ? 'text-red-100' : 'text-slate-500'}`}>
            Official 2-Page India Post PDF Voucher
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CHARGE_REPORT')}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${
            activeTab === 'CHARGE_REPORT'
              ? 'bg-red-800 text-white border-red-900 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <ArrowLeftRight size={18} className={activeTab === 'CHARGE_REPORT' ? 'text-amber-300' : 'text-red-700'} />
            <span className="text-[11px] font-mono tabular-nums opacity-80">02. ACG-61</span>
          </div>
          <div className="font-bold text-sm">Charge Report Form</div>
          <div className={`text-[11px] mt-0.5 ${activeTab === 'CHARGE_REPORT' ? 'text-red-100' : 'text-slate-500'}`}>
            Relieving/Relieved Dual-Signature PDF
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('OUTSIDER_BILL')}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${
            activeTab === 'OUTSIDER_BILL'
              ? 'bg-red-800 text-white border-red-900 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <UserCheck size={18} className={activeTab === 'OUTSIDER_BILL' ? 'text-amber-300' : 'text-red-700'} />
            <span className="text-[11px] font-mono tabular-nums opacity-80">03. Substitute</span>
          </div>
          <div className="font-bold text-sm">Outsider Bill Form</div>
          <div className={`text-[11px] mt-0.5 ${activeTab === 'OUTSIDER_BILL' ? 'text-red-100' : 'text-slate-500'}`}>
            External duty TA/DA & order upload
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BYOD_BILL')}
          className={`p-4 rounded-xl border text-left transition cursor-pointer ${
            activeTab === 'BYOD_BILL'
              ? 'bg-red-800 text-white border-red-900 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <Smartphone size={18} className={activeTab === 'BYOD_BILL' ? 'text-amber-300' : 'text-red-700'} />
            <span className="text-[11px] font-mono tabular-nums opacity-80">04. PMA / Data</span>
          </div>
          <div className="font-bold text-sm">BYOD Bill Form</div>
          <div className={`text-[11px] mt-0.5 ${activeTab === 'BYOD_BILL' ? 'text-red-100' : 'text-slate-500'}`}>
            IMEI, mobile internet & device claim
          </div>
        </button>
      </div>

      {/* Main Interactive Form Card */}
      <form onSubmit={handleSubmitForm} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        {/* Common Auto-Filled Employee & Calendar Period Bar */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-base font-bold text-slate-900">
              Step 1: Delivery Staff Details, Post Office & Duty Period
            </h2>
            {activeTab === 'FUEL_BILL' && (
              <button
                type="button"
                onClick={handleLoadMahenReferencePreset}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Load Official MAHEN FUEL.pdf Reference Values</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Employee ID / CSI ID
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 tabular-nums"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Name of Delivery Staff
              </label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Beat No.
              </label>
              <select
                value={beatNo}
                onChange={(e) => {
                  const b = e.target.value;
                  setBeatNo(b);
                  setFixedKm(getDefaultFixedKmForBeat(b));
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
              >
                {Array.from({ length: 33 }, (_, i) => `Beat ${i + 1}`).map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Name of Post Office
              </label>
              <input
                type="text"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-red-800 mb-1">
                From Date — To Date
              </label>
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="date"
                  required
                  value={fromDate}
                  onChange={(e) => handleDateRangeChange(e.target.value, toDate)}
                  className="w-full px-1.5 py-2 bg-white border border-red-300 rounded-lg text-[10px] font-mono text-slate-900 tabular-nums"
                />
                <input
                  type="date"
                  required
                  value={toDate}
                  onChange={(e) => handleDateRangeChange(fromDate, e.target.value)}
                  className="w-full px-1.5 py-2 bg-white border border-red-300 rounded-lg text-[10px] font-mono text-slate-900 tabular-nums"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form-Specific Fields */}
        {activeTab === 'FUEL_BILL' && (
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Step 2: Annexure-III Fuel Reimbursement Parameters & PMA Accountable Articles Schedule
              </h3>
              <button
                type="button"
                onClick={() => setShowDailyScheduleEditor(!showDailyScheduleEditor)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Table size={14} />
                <span>
                  {showDailyScheduleEditor
                    ? 'Hide Daily Accountable Articles Table (30 Days)'
                    : `Edit Daily Accountable Articles Table (${dailyRows.length} Days · Total ${scheduleTotals.sumTotal} PMA Articles)`}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Claim Month
                </label>
                <select
                  value={claimMonth}
                  onChange={(e) => setClaimMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  {[
                    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
                    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Financial Year / Year
                </label>
                <input
                  type="text"
                  value={claimYear}
                  onChange={(e) => setClaimYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Avg Running (Fixed KM/Day)
                </label>
                <input
                  type="number"
                  min={1}
                  max={150}
                  value={fixedKm}
                  onChange={(e) => setFixedKm(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sundays / Holidays / Leave
                </label>
                <input
                  type="number"
                  min={0}
                  max={totalCalendarDays - 1}
                  value={fuelLeaveDays}
                  onChange={(e) => setFuelLeaveDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rate per KM (₹)
                </label>
                <input
                  type="number"
                  step="0.10"
                  min={1}
                  value={fuelRatePerKm}
                  onChange={(e) => setFuelRatePerKm(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vehicle Registration No.
                </label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="RJ-20-XX-0000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Beat Coverage & Logbook Remarks
                </label>
                <input
                  type="text"
                  value={fuelRemarks}
                  onChange={(e) => setFuelRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SPM / APM Mails Verification Endorsement
                </label>
                <input
                  type="text"
                  value={spmVerificationNote}
                  onChange={(e) => setSpmVerificationNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Interactive Day-by-Day Accountable Articles Table Editor */}
            {showDailyScheduleEditor && (
              <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
                <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs">
                  <span className="font-bold">
                    Annexure-III Daily Accountable Articles Invoiced & Handled in PMA ({dailyRows.length} Days)
                  </span>
                  <span className="font-mono text-amber-300 tabular-nums">
                    SP: {scheduleTotals.sumSP} · Reg: {scheduleTotals.sumReg} · Others: {scheduleTotals.sumOthers} · Total PMA: {scheduleTotals.sumPMA} (100%)
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-300">
                      <tr>
                        <th className="py-2 px-2.5">S.N.</th>
                        <th className="py-2 px-2.5">Date</th>
                        <th className="py-2 px-2.5">Day Status</th>
                        <th className="py-2 px-2.5">SP</th>
                        <th className="py-2 px-2.5">Reg.</th>
                        <th className="py-2 px-2.5">Others</th>
                        <th className="py-2 px-2.5 text-right">Total</th>
                        <th className="py-2 px-2.5 text-right">Handled in PMA</th>
                        <th className="py-2 px-2.5 text-right">% PMA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {dailyRows.map((row) => (
                        <tr
                          key={row.sn}
                          className={row.status !== 'WORKING' ? 'bg-amber-50/60' : 'hover:bg-slate-50'}
                        >
                          <td className="py-1.5 px-2.5 font-bold">{row.sn}</td>
                          <td className="py-1.5 px-2.5">{row.date}</td>
                          <td className="py-1.5 px-2.5">
                            <select
                              value={row.status}
                              onChange={(e) =>
                                updateSingleDailyRow(row.sn, {
                                  status: e.target.value as FuelDailyRow['status'],
                                })
                              }
                              className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-sans font-bold"
                            >
                              <option value="WORKING">Working Day</option>
                              <option value="SUNDAY">SUNDAY</option>
                              <option value="HOLIDAY">HOLIDAY</option>
                              <option value="LEAVE">LEAVE</option>
                            </select>
                          </td>
                          <td className="py-1.5 px-2.5">
                            {row.status === 'WORKING' ? (
                              <input
                                type="number"
                                min={0}
                                value={row.sp}
                                onChange={(e) =>
                                  updateSingleDailyRow(row.sn, { sp: Number(e.target.value) })
                                }
                                className="w-16 px-2 py-0.5 border border-slate-300 rounded text-xs"
                              />
                            ) : (
                              <span className="text-amber-800 font-bold">{row.status}</span>
                            )}
                          </td>
                          <td className="py-1.5 px-2.5">
                            {row.status === 'WORKING' ? (
                              <input
                                type="number"
                                min={0}
                                value={row.reg === '' ? '' : row.reg}
                                placeholder=""
                                onChange={(e) =>
                                  updateSingleDailyRow(row.sn, {
                                    reg: e.target.value === '' ? '' : Number(e.target.value),
                                  })
                                }
                                className="w-16 px-2 py-0.5 border border-slate-300 rounded text-xs"
                              />
                            ) : (
                              <span>{row.reg}</span>
                            )}
                          </td>
                          <td className="py-1.5 px-2.5">
                            {row.status === 'WORKING' ? (
                              <input
                                type="number"
                                min={0}
                                value={row.others === '' ? '' : row.others}
                                placeholder=""
                                onChange={(e) =>
                                  updateSingleDailyRow(row.sn, {
                                    others: e.target.value === '' ? '' : Number(e.target.value),
                                  })
                                }
                                className="w-16 px-2 py-0.5 border border-slate-300 rounded text-xs"
                              />
                            ) : (
                              <span className="text-amber-800 font-bold">{row.status}</span>
                            )}
                          </td>
                          <td className="py-1.5 px-2.5 text-right font-bold">{row.total}</td>
                          <td className="py-1.5 px-2.5 text-right">{row.pmaHandled}</td>
                          <td className="py-1.5 px-2.5 text-right">{row.pmaPercent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Live Calculation Summary Bar */}
            <div className="bg-slate-900 text-white p-4 rounded-xl grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block">Net Working Days</span>
                <span className="text-xl font-bold font-mono tabular-nums text-white">
                  {workingDays} Days
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Avg Running (Fixed KM)</span>
                <span className="text-xl font-bold font-mono tabular-nums text-amber-400">
                  {fixedKm} KM
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">
                  Total Distance ({fixedKm}×{workingDays})
                </span>
                <span className="text-xl font-bold font-mono tabular-nums text-emerald-400">
                  {totalDistanceKm} KM
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Total PMA Articles</span>
                <span className="text-xl font-bold font-mono tabular-nums text-white">
                  {scheduleTotals.sumTotal} (100%)
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">
                  Total Amount ({totalDistanceKm}×{fuelRatePerKm.toFixed(2)})
                </span>
                <span className="text-2xl font-black font-mono tabular-nums text-amber-400">
                  ₹{totalFuelAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'CHARGE_REPORT' && (
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Step 2: Form ACG-61 Relieved & Relieving Officer Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Relieved Officer Name (Handing Over)
                </label>
                <input
                  type="text"
                  required
                  value={relievedName}
                  onChange={(e) => setRelievedName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Relieved Officer Employee ID
                </label>
                <input
                  type="text"
                  required
                  value={relievedId}
                  onChange={(e) => setRelievedId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Relieved Officer Designation
                </label>
                <input
                  type="text"
                  value={relievedDesig}
                  onChange={(e) => setRelievedDesig(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Session of Transfer
                </label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                >
                  <option value="Forenoon (F/N)">Forenoon (F/N)</option>
                  <option value="Afternoon (A/N)">Afternoon (A/N)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Transfer of Charge
                </label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Memo / Authority Order No.
                </label>
                <input
                  type="text"
                  value={orderRefNo}
                  onChange={(e) => setOrderRefNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cash, Stamps, PMA Device & Accountable Articles Handed Over
              </label>
              <textarea
                rows={3}
                value={handoverInventory}
                onChange={(e) => setHandoverInventory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>
        )}

        {activeTab === 'OUTSIDER_BILL' && (
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Step 2: Outsider / Substitute Engagement & TA/DA Calculation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Outsider / Substitute Name
                </label>
                <input
                  type="text"
                  required
                  value={outsiderName}
                  onChange={(e) => setOutsiderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Substitute / GDS ID
                </label>
                <input
                  type="text"
                  value={outsiderId}
                  onChange={(e) => setOutsiderId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Daily Duty Allowance Rate (₹/Day)
                </label>
                <input
                  type="number"
                  value={dailyAllowanceRate}
                  onChange={(e) => setDailyAllowanceRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Daily TA / Cycle / Fuel Rate (₹/Day)
                </label>
                <input
                  type="number"
                  value={dailyTaDaRate}
                  onChange={(e) => setDailyTaDaRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Competent Authority Sanction Order No.
                </label>
                <input
                  type="text"
                  value={outsiderAuthorityOrder}
                  onChange={(e) => setOutsiderAuthorityOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Authority Order Copy (PDF / Image)
                </label>
                <label className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-slate-700 cursor-pointer hover:bg-slate-100">
                  <span className="truncate">{outsiderAttachment || 'Choose sanction order file...'}</span>
                  <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0">
                    <Upload size={12} /> Browse
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setOutsiderAttachment(f.name);
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-xl grid grid-cols-3 gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block">Total Duty Days</span>
                <span className="text-xl font-bold font-mono tabular-nums">{totalCalendarDays} Days</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Combined Daily Rate</span>
                <span className="text-xl font-bold font-mono tabular-nums text-amber-400">
                  ₹{Number(dailyAllowanceRate) + Number(dailyTaDaRate)} / Day
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Total Outsider Bill Claim</span>
                <span className="text-2xl font-black font-mono tabular-nums text-emerald-400">
                  ₹{outsiderTotalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'BYOD_BILL' && (
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Step 2: BYOD (Bring Your Own Device) & Mobile Data Reimbursement
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  15-Digit Device IMEI Number *
                </label>
                <input
                  type="text"
                  required
                  value={imeiNumber}
                  onChange={(e) => setImeiNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Smartphone Make & Model
                </label>
                <input
                  type="text"
                  required
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Active Postal Apps on Device
                </label>
                <input
                  type="text"
                  value={appEnvironment}
                  onChange={(e) => setAppEnvironment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monthly Internet Data Claim (₹)
                </label>
                <input
                  type="number"
                  value={dataClaimAmount}
                  onChange={(e) => setDataClaimAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  BYOD Device Usage Allowance (₹)
                </label>
                <input
                  type="number"
                  value={deviceIncentiveAmount}
                  onChange={(e) => setDeviceIncentiveAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Telecom Operator
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Recharge / Invoice Receipt
                </label>
                <label className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-slate-700 cursor-pointer hover:bg-slate-100">
                  <span className="truncate">{byodInvoiceFile}</span>
                  <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-semibold shrink-0">
                    Upload
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setByodInvoiceFile(f.name);
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-xl grid grid-cols-3 gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block">Active BYOD Days</span>
                <span className="text-xl font-bold font-mono tabular-nums">{totalCalendarDays} Days</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Registered IMEI</span>
                <span className="text-sm font-bold font-mono tabular-nums text-amber-400">{imeiNumber}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Total BYOD Reimbursement</span>
                <span className="text-2xl font-black font-mono tabular-nums text-emerald-400">
                  ₹{byodTotalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200">
          {activeTab === 'FUEL_BILL' && (
            <button
              type="button"
              onClick={handleDirectDownloadCurrentFuelPdf}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Download size={16} />
              <span>Instant Download Official Annexure-III PDF (MAHEN FUEL.pdf Format)</span>
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-3 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <Printer size={16} />
            <span>Submit, Save & Open Official Printable PDF Voucher</span>
          </button>
        </div>
      </form>

      {/* Submitted Forms & Reimbursements Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Submitted Special Forms, Annexure-III Fuel Claims & Charge Reports Register
            </h3>
            <p className="text-xs text-slate-500">
              Click &ldquo;Download PDF&rdquo; or &ldquo;Preview / Print&rdquo; on any Fuel Bill entry to generate the exact 2-page India Post Annexure-III PDF.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            Total Vouchers: {bills.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="py-2.5 px-3 font-semibold">Voucher No.</th>
                <th className="py-2.5 px-3 font-semibold">Form Type & Title</th>
                <th className="py-2.5 px-3 font-semibold">Officer & Beat</th>
                <th className="py-2.5 px-3 font-semibold">Duty Period</th>
                <th className="py-2.5 px-3 font-semibold text-right">Days / KM</th>
                <th className="py-2.5 px-3 font-semibold text-right">Claim Amount</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bills.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                    {b.billNumber}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{b.title}</div>
                    <div className="text-[11px] text-slate-500">
                      {b.type.replace('_', ' ')} · {b.officeName}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{b.employeeName}</div>
                    <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                      ID: {b.employeeId} · Beat {extractBeatNumberOnly(b.beatNo)}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-700 tabular-nums whitespace-nowrap">
                    {b.fromDate} → {b.toDate}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 whitespace-nowrap">
                    {b.totalDays}d · {b.fixedKm} KM
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                    {b.type === 'CHARGE_REPORT'
                      ? 'Official Handover'
                      : `₹${b.totalAmount.toLocaleString('en-IN')}`}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800">{b.status}</span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      {b.type === 'FUEL_BILL' && (
                        <button
                          type="button"
                          onClick={() => downloadOfficialFuelBillPDF(b)}
                          className="px-2.5 py-1.5 bg-red-800 hover:bg-red-900 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Download size={12} />
                          <span>Download PDF</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedBillForPrint(b)}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Printer size={12} />
                        <span>Preview / Print</span>
                      </button>
                      {userProfile?.role === 'SUPER_ADMIN' && b.status !== 'Sanctioned' && (
                        <button
                          type="button"
                          onClick={() =>
                            operationsService.updateSpecialBillStatus(b.id, 'Sanctioned')
                          }
                          className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          Sanction
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Official Voucher / Exact Annexure-III Fuel Bill Preview Modal */}
      {selectedBillForPrint && (
        <div className="fixed inset-0 bg-slate-950/75 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 border border-slate-300 shadow-2xl space-y-6 my-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 print:hidden">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedBillForPrint.type === 'FUEL_BILL'
                    ? 'Official India Post Annexure-III Fuel Reimbursement Claim Voucher (2-Page Format)'
                    : 'Official Department of Posts Printable Voucher / PDF'}
                </h3>
                <p className="text-xs text-slate-500">
                  Strictly formatted to match the official departmental layout (MAHEN FUEL.pdf).
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedBillForPrint.type === 'FUEL_BILL' && (
                  <button
                    type="button"
                    onClick={() => downloadOfficialFuelBillPDF(selectedBillForPrint)}
                    className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download Official 2-Page PDF</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBillForPrint(null)}
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {selectedBillForPrint.type === 'FUEL_BILL' ? (
              (() => {
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

                return (
                  <div className="space-y-8 text-black font-sans text-xs">
                    {/* PAGE 1 PREVIEW: Exact Annexure-III 8-Column Grid */}
                    <div className="border border-black">
                      <table className="w-full border-collapse text-xs">
                        <colgroup>
                          <col className="w-[6%]" />
                          <col className="w-[16%]" />
                          <col className="w-[13%]" />
                          <col className="w-[13%]" />
                          <col className="w-[10%]" />
                          <col className="w-[14%]" />
                          <col className="w-[14%]" />
                          <col className="w-[14%]" />
                        </colgroup>
                        <tbody>
                          <tr>
                            <td colSpan={8} className="border border-black px-2 py-1 text-right">
                              Annexure-III
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={8} className="border border-black px-2 py-2 text-center font-bold text-sm">
                              <div className="underline">Ministry of Communications</div>
                              <div className="underline mt-0.5">Department of Posts</div>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={8} className="border border-black px-2 py-1 text-center font-bold underline text-sm">
                              Fuel Reimburshment Claim Form
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="border border-black px-2 py-1 font-bold">
                              Name of Post Office:-
                            </td>
                            <td colSpan={3} className="border border-black px-2 py-1">
                              {selectedBillForPrint.officeName}
                            </td>
                            <td className="border border-black px-2 py-1 text-center font-bold text-[11px]">
                              Vehicle No.:-
                            </td>
                            <td colSpan={2} className="border border-black px-2 py-1 text-center font-mono text-[11px]">
                              {d.vehicleNo || 'RJ-20-SS-4521'}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="border border-black px-2 py-1 font-bold">
                              Name of Delivery Staff:-
                            </td>
                            <td colSpan={6} className="border border-black px-2 py-1 font-bold uppercase">
                              {selectedBillForPrint.employeeName}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="border border-black px-2 py-1 font-bold">
                              Employee ID:-
                            </td>
                            <td colSpan={3} className="border border-black px-2 py-1 text-center">
                              {selectedBillForPrint.employeeId}
                            </td>
                            <td className="border border-black px-2 py-1 text-center font-bold">
                              Avg running
                            </td>
                            <td colSpan={2} className="border border-black px-2 py-1 text-center font-bold">
                              {fKm} KM
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="border border-black px-2 py-1 font-bold">
                              Beat No.:-
                            </td>
                            <td colSpan={3} className="border border-black px-2 py-1 text-center">
                              {extractBeatNumberOnly(selectedBillForPrint.beatNo)}
                            </td>
                            <td className="border border-black px-2 py-1 text-center font-bold">
                              Working Days
                            </td>
                            <td colSpan={2} className="border border-black px-2 py-1 text-center">
                              {wDays} Days
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={2} className="border border-black px-2 py-1 font-bold">
                              Month &amp; F.Y. :-
                            </td>
                            <td colSpan={3} className="border border-black px-2 py-1 text-center font-bold uppercase">
                              {d.claimMonth || 'SEPTEMBER'}
                            </td>
                            <td colSpan={3} className="border border-black px-2 py-1 text-center font-bold">
                              {d.claimYear || '2026'}
                            </td>
                          </tr>

                          {/* Table Column Headers */}
                          <tr className="font-bold text-center">
                            <td rowSpan={2} className="border border-black px-1 py-1 align-top">
                              S.N.
                            </td>
                            <td rowSpan={2} className="border border-black px-1 py-1" />
                            <td colSpan={3} className="border border-black px-2 py-1">
                              Total no. Of Accountable Articles
                              <br />
                              invoiced to Delivery staff
                            </td>
                            <td rowSpan={2} className="border border-black px-1 py-1 align-top">
                              Total
                            </td>
                            <td rowSpan={2} className="border border-black px-1 py-1 align-top">
                              Total articles
                              <br />
                              handled in
                              <br />
                              PMA
                            </td>
                            <td rowSpan={2} className="border border-black px-1 py-1 align-top">
                              % of articles
                              <br />
                              handled in
                              <br />
                              PMA
                            </td>
                          </tr>
                          <tr className="font-bold text-center">
                            <td className="border border-black px-1 py-1">SP</td>
                            <td className="border border-black px-1 py-1">Reg.</td>
                            <td className="border border-black px-1 py-1">Others</td>
                          </tr>

                          {/* 30 Daily Rows */}
                          {rows.map((r) => {
                            const isOff = r.status !== 'WORKING';
                            return (
                              <tr key={r.sn}>
                                <td className="border border-black px-1 py-0.5 text-center">
                                  {r.sn}
                                </td>
                                <td className="border border-black px-1 py-0.5 text-center">
                                  {r.date}
                                </td>
                                <td className="border border-black px-1 py-0.5 text-center">
                                  {isOff ? r.status : r.sp}
                                </td>
                                <td className="border border-black px-1 py-0.5 text-center">
                                  {r.reg}
                                </td>
                                <td className="border border-black px-1 py-0.5 text-center">
                                  {isOff ? r.status : r.others}
                                </td>
                                <td
                                  className={`border border-black px-1.5 py-0.5 ${
                                    isOff ? 'text-center' : 'text-right'
                                  }`}
                                >
                                  {isOff ? r.status : r.total}
                                </td>
                                <td className="border border-black px-1.5 py-0.5 text-right">
                                  {isOff ? '' : r.pmaHandled}
                                </td>
                                <td
                                  className={`border border-black px-1.5 py-0.5 ${
                                    isOff ? 'text-center' : 'text-right'
                                  }`}
                                >
                                  {isOff ? r.status : r.pmaPercent}
                                </td>
                              </tr>
                            );
                          })}

                          {/* TOTAL Row */}
                          <tr>
                            <td className="border border-black px-1 py-1" />
                            <td className="border border-black px-2 py-1">TOTAL</td>
                            <td className="border border-black px-1 py-1 text-center">
                              {tots.sumSP}
                            </td>
                            <td className="border border-black px-1 py-1 text-center">
                              {tots.sumReg}
                            </td>
                            <td className="border border-black px-1 py-1 text-center">
                              {tots.sumOthers}
                            </td>
                            <td className="border border-black px-1 py-1 text-center">
                              {tots.sumTotal}
                            </td>
                            <td className="border border-black px-1 py-1 text-center">
                              {tots.sumPMA}
                            </td>
                            <td className="border border-black px-1 py-1" />
                          </tr>

                          {/* Distance & Amount Rows */}
                          <tr>
                            <td colSpan={8} className="border border-black px-2 py-1">
                              Total Distance travelled in the month= {fKm}*{wDays}= {dist}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={8} className="border border-black px-2 py-1">
                              Total Amount Claimed= {dist}*{rate.toFixed(2)}= {amt}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* PAGE 2 PREVIEW: Declaration, Verification & Signature Grid */}
                    <div className="border border-black">
                      <table className="w-full border-collapse text-xs">
                        <colgroup>
                          <col className="w-[6%]" />
                          <col className="w-[16%]" />
                          <col className="w-[13%]" />
                          <col className="w-[13%]" />
                          <col className="w-[10%]" />
                          <col className="w-[14%]" />
                          <col className="w-[14%]" />
                          <col className="w-[14%]" />
                        </colgroup>
                        <tbody>
                          <tr>
                            <td colSpan={8} className="border border-black p-2.5 leading-relaxed">
                              <strong>Declaration:-</strong> It is certified that all the delivery of
                              Accountable articles has taken place at the doorstep of the addressee
                              and delivery information has also been updated with correct details of
                              addressee in PMA App in respect of all the Accountable articles
                              delivered/ Undelivered in dates mentioned above.
                            </td>
                          </tr>
                          <tr className="h-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <td key={i} className="border border-black" />
                            ))}
                          </tr>
                          <tr className="h-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <td key={i} className="border border-black" />
                            ))}
                          </tr>
                          <tr>
                            <td colSpan={2} className="border border-black px-2 py-1 font-bold">
                              Date:-
                            </td>
                            <td className="border border-black" />
                            <td className="border border-black" />
                            <td
                              colSpan={4}
                              className="border border-black px-2 py-1 text-center font-bold"
                            >
                              Name &amp; Signature of Delivery Staff
                            </td>
                          </tr>
                          <tr className="h-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <td key={i} className="border border-black" />
                            ))}
                          </tr>
                          <tr>
                            <td colSpan={8} className="border border-black px-2 py-1">
                              {d.spmVerificationNote ||
                                'Checked and found genuine & Forwarded to Division Office for sanction.'}
                            </td>
                          </tr>
                          <tr className="h-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <td key={i} className="border border-black" />
                            ))}
                          </tr>
                          <tr className="h-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <td key={i} className="border border-black" />
                            ))}
                          </tr>
                          <tr>
                            <td colSpan={2} className="border border-black px-2 py-1 font-bold">
                              Date:-
                            </td>
                            <td className="border border-black" />
                            <td className="border border-black" />
                            <td
                              colSpan={4}
                              className="border border-black px-2 py-1 text-center font-bold"
                            >
                              Name &amp; Signature of APM mails/ Postmaster
                            </td>
                          </tr>
                          <tr className="h-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <td key={i} className="border border-black" />
                            ))}
                          </tr>
                          <tr className="h-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <td key={i} className="border border-black" />
                            ))}
                          </tr>
                          <tr className="h-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <td key={i} className="border border-black" />
                            ))}
                          </tr>
                          <tr>
                            <td
                              colSpan={2}
                              className="border border-black px-2 py-1 text-center font-bold"
                            >
                              Sanctioned By:-
                            </td>
                            {Array.from({ length: 6 }).map((_, i) => (
                              <td key={i} className="border border-black" />
                            ))}
                          </tr>
                          <tr className="h-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                              <td key={i} className="border border-black" />
                            ))}
                          </tr>
                          <tr>
                            <td colSpan={2} className="border border-black px-2 py-1 font-bold">
                              Date:-
                            </td>
                            <td className="border border-black" />
                            <td className="border border-black" />
                            <td
                              colSpan={4}
                              className="border border-black px-2 py-1 text-center font-bold"
                            >
                              Name &amp; Signature of Divisional Head
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* Printable Document Body for ACG-61 Charge Report, Outsider Bill & BYOD Bill */
              <div className="border-2 border-slate-900 p-6 space-y-5 text-slate-900">
                <div className="text-center border-b-2 border-slate-900 pb-4">
                  <div className="text-xs font-bold tracking-widest uppercase">
                    DEPARTMENT OF POSTS, INDIA · OFFICE OF THE SUB-POSTMASTER
                  </div>
                  <h2 className="text-xl font-black mt-1">
                    {selectedBillForPrint.officeName} · KOTA DIVISION (RAJASTHAN CIRCLE)
                  </h2>
                  <div className="text-xs font-mono mt-1 font-bold">
                    {selectedBillForPrint.type === 'CHARGE_REPORT'
                      ? 'FORM ACG-61 · OFFICIAL CERTIFICATE OF TRANSFER OF CHARGE'
                      : `OFFICIAL REIMBURSEMENT CLAIM VOUCHER · ${selectedBillForPrint.billNumber}`}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 border border-slate-300">
                  <div>
                    <span className="text-slate-500 block">Voucher / Memo No:</span>
                    <strong className="font-mono">{selectedBillForPrint.billNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Employee ID & Name:</span>
                    <strong>
                      {selectedBillForPrint.employeeName} ({selectedBillForPrint.employeeId})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Beat & Fixed KM:</span>
                    <strong className="font-mono">
                      {selectedBillForPrint.beatNo} ({selectedBillForPrint.fixedKm} KM/day)
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Period & Total Days:</span>
                    <strong className="font-mono">
                      {selectedBillForPrint.fromDate} to {selectedBillForPrint.toDate} (
                      {selectedBillForPrint.totalDays} Days)
                    </strong>
                  </div>
                </div>

                {selectedBillForPrint.type === 'CHARGE_REPORT' ? (
                  <div className="space-y-4 text-xs leading-relaxed">
                    <p>
                      Certified that we have in the{' '}
                      <strong>{selectedBillForPrint.details.sessionType}</strong> of this day{' '}
                      <strong className="font-mono">{selectedBillForPrint.fromDate}</strong> (Duty
                      cycle up to{' '}
                      <strong className="font-mono">{selectedBillForPrint.toDate}</strong>, Total{' '}
                      <strong>{selectedBillForPrint.totalDays} Days</strong>) respectively made over
                      and received charge of the office / beat of{' '}
                      <strong>
                        {selectedBillForPrint.beatNo}, {selectedBillForPrint.officeName}
                      </strong>{' '}
                      in pursuance of Memo No.{' '}
                      <strong className="font-mono">
                        {selectedBillForPrint.details.orderReferenceNo}
                      </strong>{' '}
                      on account of{' '}
                      <strong>{selectedBillForPrint.details.reasonForTransfer}</strong>.
                    </p>

                    <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3">
                      <div>
                        <div className="font-bold text-slate-700">
                          Relieved Officer (Handing Over):
                        </div>
                        <div className="mt-1">
                          Name: <strong>{selectedBillForPrint.details.relievedOfficerName}</strong>
                        </div>
                        <div>
                          Employee ID:{' '}
                          <strong className="font-mono">
                            {selectedBillForPrint.details.relievedOfficerId}
                          </strong>
                        </div>
                        <div>Designation: {selectedBillForPrint.details.relievedDesignation}</div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-700">
                          Relieving Officer (Taking Over):
                        </div>
                        <div className="mt-1">
                          Name: <strong>{selectedBillForPrint.details.relievingOfficerName}</strong>
                        </div>
                        <div>
                          Employee ID:{' '}
                          <strong className="font-mono">
                            {selectedBillForPrint.details.relievingOfficerId}
                          </strong>
                        </div>
                        <div>Designation: {selectedBillForPrint.details.relievingDesignation}</div>
                      </div>
                    </div>

                    <div className="border border-slate-300 p-3">
                      <div className="font-bold mb-1">
                        Inventory of Cash, Stamps, Keys & PMA Equipment Handed Over:
                      </div>
                      <pre className="font-mono text-[11px] whitespace-pre-wrap text-slate-800">
                        {selectedBillForPrint.details.cashAndStampsHandedOver}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div className="font-bold text-sm border-b border-slate-200 pb-1">
                      {selectedBillForPrint.title}
                    </div>
                    <div className="grid grid-cols-2 gap-2 border border-slate-300 p-3 font-mono">
                      {Object.entries(selectedBillForPrint.details || {}).map(([k, v]) => (
                        <div key={k} className="flex justify-between border-b border-slate-100 py-1">
                          <span className="text-slate-600">{k}:</span>
                          <strong className="text-slate-900">{String(v)}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-slate-100 border border-slate-400 flex items-center justify-between text-sm font-bold">
                      <span>NET SANCTIONED / CLAIMED AMOUNT:</span>
                      <span className="font-mono text-lg">
                        ₹{selectedBillForPrint.totalAmount.toLocaleString('en-IN')}/-
                      </span>
                    </div>
                  </div>
                )}

                {/* Dual-Signature & Sub-Postmaster Counter-Signature Block */}
                <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs">
                  <div className="border-t border-slate-800 pt-2">
                    <div className="font-bold">
                      {selectedBillForPrint.type === 'CHARGE_REPORT'
                        ? 'Signature of Relieved Officer'
                        : 'Signature of Claimant / Postman'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {selectedBillForPrint.type === 'CHARGE_REPORT'
                        ? selectedBillForPrint.details.relievedOfficerName
                        : selectedBillForPrint.employeeName}
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-2">
                    <div className="font-bold">
                      {selectedBillForPrint.type === 'CHARGE_REPORT'
                        ? 'Signature of Relieving Officer'
                        : 'Verified by Delivery PA / Supervisor'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {selectedBillForPrint.type === 'CHARGE_REPORT'
                        ? selectedBillForPrint.details.relievingOfficerName
                        : `${selectedBillForPrint.beatNo} Supervisor`}
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-2">
                    <div className="font-bold">Counter-Signed (Sub-Postmaster)</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Sub-Postmaster, Dadabari S.O. (324009)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
