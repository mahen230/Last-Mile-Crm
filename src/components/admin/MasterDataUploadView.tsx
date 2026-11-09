import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Fuel,
  ShieldCheck,
  Building2,
  FileText,
  Users,
  Search,
  RefreshCw,
  Printer,
  ChevronRight,
  Database,
  ArrowRight,
  Sparkles,
  Info,
  Check,
  X,
  Smartphone,
  ArrowLeftRight,
  Calendar,
  Lock,
  Layers,
  CheckSquare,
  Square,
  Filter,
  Eye,
  UserCheck,
  History,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { staffPermissionService } from '../../services/staffPermissionService';
import { operationsService } from '../../services/operationsService';
import {
  masterDataService,
  MasterUploadCategory,
  MasterUploadLog,
  PostmanMonthlyFuelSummary,
  IngestedMasterRecord,
  IngestionVerificationStage,
} from '../../services/masterDataService';
import {
  ALL_33_BEATS_FUEL_DATA,
  DEPARTMENTAL_FUEL_RATE_PER_KM,
  STANDARD_MONTHLY_WORKING_DAYS,
  getBeatFuelMapping,
} from '../../data/beatFuelData';
import { downloadOfficialAcg61Pdf } from '../../utils/acg61PdfGenerator';
import MasterVerificationDrawer from './MasterVerificationDrawer';

export default function MasterDataUploadView() {
  const { userProfile } = useAuth();
  const currentStaff = staffPermissionService.getActiveSession() || userProfile;

  // Upload category selection
  const [selectedCategory, setSelectedCategory] = useState<MasterUploadCategory>('CUSTOMERS_PROPERTIES');
  
  // Drag & drop file states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [rawFileLoading, setRawFileLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    total: number;
    valid: number;
    skipped: number;
    message?: string;
  } | null>(null);
  const [commitStatus, setCommitStatus] = useState<string | null>(null);

  // Category 4 Direct Form Sub-tab
  const [billFormType, setBillFormType] = useState<'CHARGE_REPORT' | 'BYOD_BILL'>('CHARGE_REPORT');

  // Charge Report Form State
  const [crRelievedName, setCrRelievedName] = useState(currentStaff?.name || 'Mahendra Kumar Meena');
  const [crRelievedId, setCrRelievedId] = useState(currentStaff?.employeeId || '50457421');
  const [crRelievingName, setCrRelievingName] = useState('Govind Prasad');
  const [crRelievingId, setCrRelievingId] = useState('10310735');
  const [crBeatNo, setCrBeatNo] = useState(currentStaff?.beat || 'Beat 2');
  const [crOffice, setCrOffice] = useState('Dadabari S.O. (324009)');
  const [crHandoverDate, setCrHandoverDate] = useState(new Date().toISOString().split('T')[0]);
  const [crArticlesInHand, setCrArticlesInHand] = useState<number>(14);
  const [crCashBalance, setCrCashBalance] = useState<number>(4500);
  const [crValuablesCount, setCrValuablesCount] = useState<number>(25);
  const [crKeysEquipment, setCrKeysEquipment] = useState('Beat 2 Delivery Bag, PMA Device S/N 49210, DakPay QR Card, Almirah Key');
  const [crRemarks, setCrRemarks] = useState('Complete beat property and pending registered articles handed over in sound condition.');
  const [crNotice, setCrNotice] = useState<string | null>(null);

  // BYOD Form State
  const [byodStaffName, setByodStaffName] = useState(currentStaff?.name || 'Mahendra Kumar Meena');
  const [byodStaffId, setByodStaffId] = useState(currentStaff?.employeeId || '50457421');
  const [byodBeatNo, setByodBeatNo] = useState(currentStaff?.beat || 'Beat 2');
  const [byodMonth, setByodMonth] = useState('2026-10');
  const [byodModel, setByodModel] = useState('Samsung Galaxy M34 5G (6GB/128GB)');
  const [byodImei, setByodImei] = useState('864201049281723');
  const [byodSim, setByodSim] = useState('BSNL 4G / Airtel Post Office CUG');
  const [byodAmount, setByodAmount] = useState<number>(300);
  const [byodDeclaration, setByodDeclaration] = useState(true);
  const [byodRemarks, setByodRemarks] = useState('Personal Android smartphone utilized exclusively for Postman Mobile App (PMA) delivery updating.');
  const [byodNotice, setByodNotice] = useState<string | null>(null);

  // Individual Postman Fuel Bill Downloader Section State
  const [selectedBeatForBill, setSelectedBeatForBill] = useState(currentStaff?.beat || 'Beat 2');
  const [selectedMonthForBill, setSelectedMonthForBill] = useState('2026-10');

  // Dynamic KM running & bill configuration for Postman ID before bill download
  const [customDailyKm, setCustomDailyKm] = useState<number>(() =>
    masterDataService.getBeatCustomKm(currentStaff?.beat || 'Beat 2')
  );
  const [customFuelRate, setCustomFuelRate] = useState<number>(DEPARTMENTAL_FUEL_RATE_PER_KM);
  const [customWorkingDays, setCustomWorkingDays] = useState<number>(25);
  const [customVehicleNo, setCustomVehicleNo] = useState<string>('RJ-20-SP-2026');
  const [kmSavedNotice, setKmSavedNotice] = useState<string | null>(null);

  const [postmanFuelSummary, setPostmanFuelSummary] = useState<PostmanMonthlyFuelSummary>(() =>
    masterDataService.generatePostmanMonthlyFuelBill(currentStaff?.beat || 'Beat 2', '2026-10', {
      customDailyKm: masterDataService.getBeatCustomKm(currentStaff?.beat || 'Beat 2'),
      customRatePerKm: DEPARTMENTAL_FUEL_RATE_PER_KM,
      customWorkingDays: 25,
      vehicleNo: 'RJ-20-SP-2026',
    })
  );

  // Top-Level Navigation Tabs
  const [activeMainTab, setActiveMainTab] = useState<
    'VERIFICATION_GATE' | 'UPLOAD_PORTAL' | 'EXPORT_HUB' | 'TEMPLATES' | 'SPECIAL_BILLS' | 'FUEL_GENERATOR'
  >('VERIFICATION_GATE');

  // Bulk Export & DSS Reconciliation Hub State
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [reconcileReport, setReconcileReport] = useState<{
    totalChecked: number;
    adjustedCount: number;
    details: Array<{ date: string; beatNo: string; originalSp: number; newSp: number; dssBenchmark: number }>;
  } | null>(null);
  const [isReconciling, setIsReconciling] = useState(false);

  // Ingestion Verification Gateway State
  const [ingestedRecords, setIngestedRecords] = useState<IngestedMasterRecord[]>(() =>
    masterDataService.getIngestedRecords()
  );
  const [selectedRecordForDrawer, setSelectedRecordForDrawer] = useState<IngestedMasterRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState<'ALL' | IngestionVerificationStage>('ALL');
  const [gatewaySearch, setGatewaySearch] = useState('');
  const [gatewayBeatFilter, setGatewayBeatFilter] = useState('ALL');
  const [gatewayCategoryFilter, setGatewayCategoryFilter] = useState('ALL');
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [batchActionNotice, setBatchActionNotice] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'VERIFICATION_GATE' | 'DIRECT_SYNC'>('VERIFICATION_GATE');

  // Upload logs
  const [uploadLogs, setUploadLogs] = useState<MasterUploadLog[]>(() => masterDataService.getUploadLogs());

  useEffect(() => {
    const unsub = masterDataService.subscribe(() => {
      setUploadLogs(masterDataService.getUploadLogs());
      setIngestedRecords(masterDataService.getIngestedRecords());
    });
    return () => unsub();
  }, []);

  // Sync postman's assigned beat on login
  useEffect(() => {
    if (currentStaff?.beat) {
      setSelectedBeatForBill(currentStaff.beat);
      const km = masterDataService.getBeatCustomKm(currentStaff.beat);
      setCustomDailyKm(km);
    }
  }, [currentStaff?.beat]);

  // When beat selection changes, load that beat's saved/default KM
  useEffect(() => {
    const km = masterDataService.getBeatCustomKm(selectedBeatForBill);
    setCustomDailyKm(km);
  }, [selectedBeatForBill]);

  // Dynamic live recalculation when beat, month, custom KM, rate, or working days change
  useEffect(() => {
    const summary = masterDataService.generatePostmanMonthlyFuelBill(
      selectedBeatForBill,
      selectedMonthForBill,
      {
        customDailyKm,
        customRatePerKm: customFuelRate,
        customWorkingDays,
        vehicleNo: customVehicleNo,
      }
    );
    setPostmanFuelSummary(summary);
  }, [
    selectedBeatForBill,
    selectedMonthForBill,
    customDailyKm,
    customFuelRate,
    customWorkingDays,
    customVehicleNo,
  ]);

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Process uploaded CSV or Excel file
  const processFile = async (file: File) => {
    setRawFileLoading(true);
    setUploadedFileName(file.name);
    setCommitStatus(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

      setParsedRows(jsonRows);

      // Perform validation simulation
      const total = jsonRows.length;
      let valid = 0;
      let skipped = 0;

      if (selectedCategory === 'CUSTOMERS_PROPERTIES') {
        jsonRows.forEach((r) => {
          const name = r['name'] || r['Name'] || r['Customer Name'];
          if (name && String(name).trim().length > 0) valid++;
          else skipped++;
        });
      } else if (selectedCategory === 'BEAT_FUEL_MASTER') {
        jsonRows.forEach((r) => {
          const beat = r['beatNumber'] || r['BeatNumber'] || r['Beat'];
          if (beat) valid++;
          else skipped++;
        });
      } else if (selectedCategory === 'MONTHLY_DSS_REPORT') {
        jsonRows.forEach((r) => {
          const beat = r['beatNo'] || r['BeatNo'] || r['Beat'];
          if (beat) valid++;
          else skipped++;
        });
      } else {
        valid = total;
      }

      setValidationStatus({
        total,
        valid,
        skipped,
        message: `Validated ${valid} rows successfully out of ${total} detected records.`,
      });
    } catch (err) {
      console.error('File parsing error:', err);
      setValidationStatus({
        total: 0,
        valid: 0,
        skipped: 0,
        message: 'Failed to read file. Please ensure it is a valid CSV or Excel file.',
      });
    } finally {
      setRawFileLoading(false);
    }
  };

  // Derived Staff Role & Authorization checks
  const staffRole = currentStaff?.role || 'POSTMAN';
  const staffName = currentStaff?.name || 'Postal Staff';
  const staffId = currentStaff?.employeeId || currentStaff?.id || '50457421';
  const isSuperAdmin = staffRole === 'SUPER_ADMIN' || currentStaff?.email === 'mahen.comtech@gmail.com';
  const isSpm = isSuperAdmin || staffRole === 'ADMIN' || (currentStaff?.designation && currentStaff.designation.includes('SPM'));

  // Commit parsed rows to Master Storage or Ingestion Gateway
  const handleCommitMasterSync = () => {
    if (!parsedRows || parsedRows.length === 0 || !uploadedFileName) return;

    const uploader = currentStaff?.name || 'Administrator';
    const uploaderId = currentStaff?.employeeId || currentStaff?.email || 'mahen.comtech@gmail.com';

    if (uploadMode === 'VERIFICATION_GATE') {
      const res = masterDataService.ingestRecordsFromUpload(
        selectedCategory,
        parsedRows,
        uploadedFileName,
        uploader,
        uploaderId
      );
      setCommitStatus(res.message);
      setIngestedRecords(masterDataService.getIngestedRecords());
      setStageFilter('PENDING_STAFF_VERIFICATION');
      setActiveMainTab('VERIFICATION_GATE');
    } else {
      if (selectedCategory === 'CUSTOMERS_PROPERTIES') {
        const res = masterDataService.processCustomerUpload(parsedRows, uploadedFileName, uploader);
        setCommitStatus(res.message);
      } else if (selectedCategory === 'BEAT_FUEL_MASTER') {
        const res = masterDataService.processBeatFuelUpload(parsedRows, uploadedFileName, uploader);
        setCommitStatus(res.message);
      } else if (selectedCategory === 'MONTHLY_DSS_REPORT') {
        const res = masterDataService.processDssReportUpload(parsedRows, uploadedFileName, uploader);
        setCommitStatus(res.message);
        const updatedSummary = masterDataService.generatePostmanMonthlyFuelBill(
          selectedBeatForBill,
          selectedMonthForBill
        );
        setPostmanFuelSummary(updatedSummary);
      }
    }

    setUploadLogs(masterDataService.getUploadLogs());
  };

  // Quick 1-Click Sign-off Handler
  const handleQuickSignOff = (rec: IngestedMasterRecord) => {
    setBatchActionNotice(null);
    try {
      if (rec.verificationStage === 'PENDING_STAFF_VERIFICATION') {
        masterDataService.verifyContactStageB(rec.id, staffName, staffId, staffRole, undefined, '1-Click quick contact & identity verification.');
        setBatchActionNotice(`✓ Record ${rec.id} (${rec.name}) Stage B Contact & Identity verified.`);
      } else if (rec.verificationStage === 'CONTACT_VERIFIED') {
        masterDataService.verifyPropertyStageC(rec.id, staffName, staffId, staffRole, undefined, '1-Click quick property & locality matrix verification.');
        setBatchActionNotice(`✓ Record ${rec.id} (${rec.name}) Stage C Property Matrix verified.`);
      } else if (rec.verificationStage === 'PROPERTY_VERIFIED') {
        if (!isSpm && !isSuperAdmin) {
          setBatchActionNotice('Authorization Required: Stage D final synchronization requires Sub-Postmaster (SPM) or Super Admin credentials.');
          return;
        }
        const res = masterDataService.approveAndSyncStageD(rec.id, staffName, staffId, staffRole, '1-Click Stage D supervisory synchronization.');
        setBatchActionNotice(`★ ${res.message}`);
      }
    } catch (err: any) {
      setBatchActionNotice(`Error: ${err.message}`);
    }
  };

  // Batch action handlers
  const handleBatchVerifyContact = () => {
    if (selectedRecordIds.length === 0) return;
    const count = masterDataService.batchVerifyContact(selectedRecordIds, staffName, staffId, staffRole);
    setBatchActionNotice(`✓ Batch verified Stage B (Contact & Identity) for ${count} records.`);
    setSelectedRecordIds([]);
  };

  const handleBatchVerifyProperty = () => {
    if (selectedRecordIds.length === 0) return;
    const count = masterDataService.batchVerifyProperty(selectedRecordIds, staffName, staffId, staffRole);
    setBatchActionNotice(`✓ Batch verified Stage C (Property & Locality) for ${count} records.`);
    setSelectedRecordIds([]);
  };

  const handleBatchApproveAndSync = () => {
    if (selectedRecordIds.length === 0) return;
    if (!isSpm && !isSuperAdmin) {
      setBatchActionNotice('Authorization Required: Stage D final synchronization requires Sub-Postmaster (SPM) or Super Admin credentials.');
      return;
    }
    const res = masterDataService.batchApproveAndSync(selectedRecordIds, staffName, staffId, staffRole);
    setBatchActionNotice(`★ ${res.message}`);
    setSelectedRecordIds([]);
  };

  // Filtering ingested records
  const filteredIngestedRecords = useMemo(() => {
    return ingestedRecords.filter((rec) => {
      if (stageFilter !== 'ALL' && rec.verificationStage !== stageFilter) return false;
      if (gatewayBeatFilter !== 'ALL' && rec.beatNo !== gatewayBeatFilter) return false;
      if (gatewayCategoryFilter !== 'ALL' && rec.category !== gatewayCategoryFilter) return false;
      if (gatewaySearch.trim()) {
        const q = gatewaySearch.toLowerCase();
        const matchName = rec.name.toLowerCase().includes(q);
        const matchMobile = rec.mobile.toLowerCase().includes(q);
        const matchAddress = rec.fullAddress.toLowerCase().includes(q);
        const matchId = rec.id.toLowerCase().includes(q);
        const matchBeat = rec.beatNo.toLowerCase().includes(q);
        if (!matchName && !matchMobile && !matchAddress && !matchId && !matchBeat) return false;
      }
      return true;
    });
  }, [ingestedRecords, stageFilter, gatewayBeatFilter, gatewayCategoryFilter, gatewaySearch]);

  const pendingCount = ingestedRecords.filter((r) => r.verificationStage === 'PENDING_STAFF_VERIFICATION').length;
  const contactVerifiedCount = ingestedRecords.filter((r) => r.verificationStage === 'CONTACT_VERIFIED').length;
  const propertyVerifiedCount = ingestedRecords.filter((r) => r.verificationStage === 'PROPERTY_VERIFIED').length;
  const fullySyncedCount = ingestedRecords.filter((r) => r.verificationStage === 'FULLY_SYNCED').length;

  // Download Standardized Templates
  const handleDownloadTemplate = (type: 'CUSTOMER' | 'BEAT_FUEL' | 'DSS') => {
    if (type === 'CUSTOMER') {
      const headers = [
        'name',
        'mobile',
        'beatNo',
        'area',
        'sector',
        'houseNo',
        'address',
        'pincode',
        'householdType',
        'financialInterest',
      ];
      const sampleRows = [
        ['Shri Rameshwar Dayal Meena', '9829012345', 'Beat 2', 'Keshavpura', '7', '445', 'H.No. 445, Sector 7, Keshavpura, Kota', '324009', 'Residential', 'Sukanya Samriddhi Account (SSA)'],
        ['Smt. Sunita Sharma', '9414288901', 'Beat 2', 'Santoshi Nagar', 'Main', '104-A', '104-A Santoshi Nagar, near TVS Circle, Kota', '324009', 'Residential', 'Mahila Samman Savings Certificate'],
        ['CAD Colony Traders Association', '9414199882', 'Beat 1', 'Dadabari Extension', '2', 'Shop 12', 'Shop 12 CAD Circle Market, Dadabari, Kota', '324009', 'Commercial', 'Speed Post Corporate Account'],
        ['Govind Prasad Sharma', '9829055443', 'Beat 4', 'Keshavpura Vistar', '3', 'Plot 89', 'Plot 89, Sector 3, Keshavpura, Kota', '324009', 'Residential', 'PLI Santosh (Endowment Assurance)'],
      ];
      downloadCsvFile('Customer_Household_Property_Master_Template.csv', headers, sampleRows);
    } else if (type === 'BEAT_FUEL') {
      const headers = [
        'beatNumber',
        'assignedPostmanName',
        'assignedStaffId',
        'territorialCoverage',
        'terrainClassification',
        'sanctionedDailyKm',
        'fuelRatePerKm',
        'monthlyWorkingDays',
        'routeDescription',
      ];
      const sampleRows = ALL_33_BEATS_FUEL_DATA.map((b) => [
        b.beatNumber,
        b.assignedPostmanName,
        b.assignedStaffId,
        b.territorialCoverage,
        b.terrainClassification,
        b.sanctionedDailyKm,
        b.fuelRatePerKm,
        b.monthlyWorkingDays,
        b.routeDescription,
      ]);
      downloadCsvFile('Beat_Fuel_Bill_Master_33_Beats_Template.csv', headers, sampleRows);
    } else if (type === 'DSS') {
      const headers = [
        'date',
        'beatNo',
        'staffName',
        'employeeId',
        'attendanceStatus',
        'speedPostReceived',
        'speedPostDelivered',
        'speedPostDeposit',
        'registryReceived',
        'registryDelivered',
        'registryDeposit',
        'parcelReceived',
        'parcelDelivered',
        'parcelDeposit',
        'codAmountCollected',
        'remarks',
      ];
      const sampleRows = [
        ['2026-10-01', 'Beat 2', 'Mahendra Kumar Meena', '50457421', 'Present - Field Duty', 28, 28, 0, 2, 2, 0, 3, 3, 0, 2500, 'Keshavpura Sec 7 full beat round completed'],
        ['2026-10-02', 'Beat 2', 'Mahendra Kumar Meena', '50457421', 'Gazetted Holiday', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'Mahatma Gandhi Birthday (Gandhi Jayanti) - Office Closed'],
        ['2026-10-03', 'Beat 2', 'Mahendra Kumar Meena', '50457421', 'Present - Field Duty', 32, 32, 0, 1, 1, 0, 4, 4, 0, 3100, 'Santoshi Nagar TVS Circle PMA sync OK'],
        ['2026-10-04', 'Beat 2', 'Mahendra Kumar Meena', '50457421', 'Sunday', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'Sunday - Weekly Off'],
        ['2026-10-05', 'Beat 2', 'Mahendra Kumar Meena', '50457421', 'Present - Field Duty', 104, 104, 0, 2, 2, 0, 6, 6, 0, 9800, 'High-volume delivery completed 100% via PMA'],
        ['2026-10-01', 'Beat 1', 'Muskan Sharma', '50510312', 'Present - Field Duty', 30, 28, 2, 2, 2, 0, 2, 2, 0, 1400, 'Dadabari Main Market delivery completed'],
        ['2026-10-01', 'Beat 4', 'Govind Prasad', '10310735', 'Present - Field Duty', 35, 33, 2, 3, 3, 0, 4, 4, 0, 3100, 'Keshavpura Vistar Sector 1-4 completed'],
      ];
      downloadCsvFile('Monthly_DSS_Summary_Report_October_2026_Template.csv', headers, sampleRows);
    }
  };

  const downloadCsvFile = (fileName: string, headers: string[], rows: any[][]) => {
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  };

  // Handle Charge Report Form Submit
  const handleChargeReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bill = masterDataService.submitChargeReport({
      relievedStaffName: crRelievedName,
      relievedStaffId: crRelievedId,
      relievingStaffName: crRelievingName,
      relievingStaffId: crRelievingId,
      beatNo: crBeatNo,
      officeName: crOffice,
      handoverDate: crHandoverDate,
      accountableArticlesInHand: Number(crArticlesInHand) || 0,
      cashBalanceHeld: Number(crCashBalance) || 0,
      valuableStampsCount: Number(crValuablesCount) || 0,
      keysAndEquipment: crKeysEquipment,
      remarks: crRemarks,
    });

    setCrNotice(`ACG-61 Charge Report #${bill.billNumber} successfully recorded into Master Register!`);
    downloadOfficialAcg61Pdf({
      relievedOfficerName: crRelievedName,
      relievedOfficerId: crRelievedId,
      relievingOfficerName: crRelievingName,
      relievingOfficerId: crRelievingId,
      postName: `${crBeatNo} Postman`,
      placeName: crOffice || 'DADABARI S.O. (324009)',
      date: crHandoverDate,
      noonSection: 'FORENOON',
      divisionName: 'KOTA DIVISION',
      subDivisionName: "ASPO's KOTA EAST",
      remarks: crRemarks,
    });
    setUploadLogs(masterDataService.getUploadLogs());
  };

  // Handle BYOD Bill Form Submit
  const handleByodBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bill = masterDataService.submitByodBill({
      employeeName: byodStaffName,
      employeeId: byodStaffId,
      employeeEmail: currentStaff?.email || 'mahen.comtech@gmail.com',
      beatNo: byodBeatNo,
      officeName: 'Dadabari S.O. (324009)',
      billingMonth: byodMonth,
      mobileModel: byodModel,
      imeiNumber: byodImei,
      simOperator: byodSim,
      pmaActiveStatus: true,
      monthlyAllowanceClaimed: Number(byodAmount) || 300,
      declarationAccepted: byodDeclaration,
      remarks: byodRemarks,
    });

    setByodNotice(`BYOD Bill #${bill.billNumber} for ${byodMonth} submitted and saved to Master Ledger!`);
    setUploadLogs(masterDataService.getUploadLogs());
  };

  return (
    <div className="space-y-6" id="master-data-upload-root">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-red-700 text-white flex items-center justify-center font-bold shadow-xs">
              <Database size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Master Data & DSS Monthly Fuel Bill Upload Portal
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dadabari Sub Post Office (324009) Kota Jurisdiction · Dual-Pane Template & Sync Engine
              </p>
            </div>
          </div>
        </div>

        {/* Beat Territorial Coverage & Statutory Calculation Breakdown */}
        <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-300">
                BEAT TERRITORIAL MAP & LOCALITY COVERAGE: {postmanFuelSummary.beatNo} (Dadabari S.O. 324009)
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Statutory Rate: ₹{postmanFuelSummary.fuelRatePerKm.toFixed(2)} / KM · Schedule: {postmanFuelSummary.monthName}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Territorial Localities Mapped:</span>
              <p className="text-slate-100 font-semibold mt-0.5">
                {postmanFuelSummary.territorialCoverage || 'Keshavpura Sectors 6 & 7, Santoshi Nagar, TVS Circle & CAD Circle Corridor'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Route Terrain & Survey:</span>
              <p className="text-slate-100 mt-0.5">
                {postmanFuelSummary.routeDescription || 'High-Density Residential & Commercial Combined Postal Route'}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="font-mono text-slate-300">
              <span className="text-amber-400 font-bold">Calculation Formula:</span> {postmanFuelSummary.workingDays} Working Days × {postmanFuelSummary.sanctionedDailyKm} KM/d = <strong className="text-white">{postmanFuelSummary.totalMonthlyKm} KM</strong> × ₹{postmanFuelSummary.fuelRatePerKm.toFixed(2)} = <strong className="text-emerald-400 text-sm">₹{postmanFuelSummary.totalClaimAmount.toLocaleString('en-IN')}.00</strong>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} /> Protected DSS Reconciled ({postmanFuelSummary.dailyRows.length} Days)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200">
            <ShieldCheck size={14} />
            <span>Non-Destructive Merge Guard Active</span>
          </span>
          <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-medium">
            Standard Fuel Rate: ₹{DEPARTMENTAL_FUEL_RATE_PER_KM.toFixed(2)}/KM
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PRIMARY NAVIGATION TABS */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveMainTab('VERIFICATION_GATE')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs ${
            activeMainTab === 'VERIFICATION_GATE'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers size={15} />
          <span>4-Stage Verification & Sync Hub</span>
          {(pendingCount + contactVerifiedCount + propertyVerifiedCount) > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeMainTab === 'VERIFICATION_GATE'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {pendingCount + contactVerifiedCount + propertyVerifiedCount} Actionable
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveMainTab('UPLOAD_PORTAL');
            if (selectedCategory === 'CHARGE_AND_BYOD_BILLS') {
              setSelectedCategory('CUSTOMERS_PROPERTIES');
            }
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs ${
            activeMainTab === 'UPLOAD_PORTAL'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Upload size={15} />
          <span>Master File Ingestion (CSV/XLSX)</span>
        </button>

        <button
          onClick={() => setActiveMainTab('EXPORT_HUB')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs ${
            activeMainTab === 'EXPORT_HUB'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database size={15} />
          <span>Bulk Export & Backup</span>
        </button>

        <button
          onClick={() => setActiveMainTab('TEMPLATES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs ${
            activeMainTab === 'TEMPLATES'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Download size={15} />
          <span>Standardized Templates</span>
        </button>

        <button
          onClick={() => {
            setActiveMainTab('SPECIAL_BILLS');
            setSelectedCategory('CHARGE_AND_BYOD_BILLS');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs ${
            activeMainTab === 'SPECIAL_BILLS'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Smartphone size={15} />
          <span>ACG-61 & BYOD Forms</span>
        </button>

        <button
          onClick={() => setActiveMainTab('FUEL_GENERATOR')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs ${
            activeMainTab === 'FUEL_GENERATOR'
              ? 'bg-red-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Fuel size={15} />
          <span>Postman Beat Fuel Generator</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: 4-STAGE GRANULAR VERIFICATION GATEWAY & SYNC HUB */}
      {/* ======================================================== */}
      {activeMainTab === 'VERIFICATION_GATE' && (
        <div className="space-y-5">
          {/* 4-Stage Architectural Workflow Banner */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white rounded-2xl border border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <span>4-Stage Granular Verification Gate (Zero-Error Postal Governance)</span>
                </h3>
              </div>
              <span className="text-[11px] font-mono text-amber-300 bg-amber-950/70 px-2.5 py-1 rounded-md border border-amber-600/30">
                Dadabari S.O. 324009 · Statutory Compliance Rulebook
              </span>
            </div>

            {/* Stepper Guide */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                <div className="flex items-center gap-2 text-slate-300 font-bold">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-mono font-bold">A</span>
                  <span>Stage A: Ingestion</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Admin uploads CSV/XLSX. Engine auto-parses & tags rows with Beat No & Assigned Staff ID.
                </p>
              </div>

              <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-800/40 space-y-1">
                <div className="flex items-center gap-2 text-blue-300 font-bold">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-mono font-bold">B</span>
                  <span>Stage B: Field Identity</span>
                </div>
                <p className="text-[11px] text-blue-200/80 leading-relaxed">
                  Assigned Beat Postman validates citizen name, mobile phone number, and duplicate checks.
                </p>
              </div>

              <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-800/40 space-y-1">
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-mono font-bold">C</span>
                  <span>Stage C: Property Matrix</span>
                </div>
                <p className="text-[11px] text-purple-200/80 leading-relaxed">
                  PA or Staff verifies Colony, Sector/Block (N/A auto-disable), Split House No (191/B), PIN 324009.
                </p>
              </div>

              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/40 space-y-1">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-mono font-bold">D</span>
                  <span>Stage D: SPM Live Sync</span>
                </div>
                <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                  SPM audits batch, locks DSS totals against tampering, merges into live DB, and unlocks fuel bill.
                </p>
              </div>
            </div>
          </div>

          {/* Metric Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Ingested</span>
              <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{ingestedRecords.length}</div>
              <span className="text-[10px] text-slate-400 mt-1 block">All stages combined</span>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Stage A: Pending</span>
              <div className="text-xl font-black text-amber-900 font-mono mt-0.5">{pendingCount}</div>
              <span className="text-[10px] text-amber-700 mt-1 block">Awaiting field contact check</span>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Stage B: Contact OK</span>
              <div className="text-xl font-black text-blue-900 font-mono mt-0.5">{contactVerifiedCount}</div>
              <span className="text-[10px] text-blue-700 mt-1 block">Awaiting property matrix</span>
            </div>

            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">Stage C: Property OK</span>
              <div className="text-xl font-black text-purple-900 font-mono mt-0.5">{propertyVerifiedCount}</div>
              <span className="text-[10px] text-purple-700 mt-1 block">Awaiting SPM live sync</span>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Stage D: Live Synced</span>
              <div className="text-xl font-black text-emerald-900 font-mono mt-0.5">{fullySyncedCount}</div>
              <span className="text-[10px] text-emerald-700 mt-1 block">Locked & feeding ACG-61</span>
            </div>
          </div>

          {/* Sub-Tabs & Filtering Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
            {/* Stage Filter Sub-tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-3">
              <button
                onClick={() => setStageFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  stageFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>All Records</span>
                <span className="px-1.5 py-0.2 bg-slate-700 text-white text-[10px] rounded-full font-mono">
                  {ingestedRecords.length}
                </span>
              </button>

              <button
                onClick={() => setStageFilter('PENDING_STAFF_VERIFICATION')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  stageFilter === 'PENDING_STAFF_VERIFICATION'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                <span>Stage A: Pending Staff</span>
                <span className="px-1.5 py-0.2 bg-amber-700 text-white text-[10px] rounded-full font-mono">
                  {pendingCount}
                </span>
              </button>

              <button
                onClick={() => setStageFilter('CONTACT_VERIFIED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  stageFilter === 'CONTACT_VERIFIED'
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-800 hover:bg-blue-50'
                }`}
              >
                <span>Stage B: Contact Verified</span>
                <span className="px-1.5 py-0.2 bg-blue-700 text-white text-[10px] rounded-full font-mono">
                  {contactVerifiedCount}
                </span>
              </button>

              <button
                onClick={() => setStageFilter('PROPERTY_VERIFIED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  stageFilter === 'PROPERTY_VERIFIED'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-800 hover:bg-purple-50'
                }`}
              >
                <span>Stage C: Property Verified</span>
                <span className="px-1.5 py-0.2 bg-purple-700 text-white text-[10px] rounded-full font-mono">
                  {propertyVerifiedCount}
                </span>
              </button>

              <button
                onClick={() => setStageFilter('FULLY_SYNCED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  stageFilter === 'FULLY_SYNCED'
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <span>Stage D: Fully Synced</span>
                <span className="px-1.5 py-0.2 bg-emerald-700 text-white text-[10px] rounded-full font-mono">
                  {fullySyncedCount}
                </span>
              </button>
            </div>

            {/* Search and Filters Grid */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-96">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search citizen, mobile, address, record ID, beat..."
                  value={gatewaySearch}
                  onChange={(e) => setGatewaySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={gatewayBeatFilter}
                  onChange={(e) => setGatewayBeatFilter(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white"
                >
                  <option value="ALL">All 33 Beats (Dadabari S.O.)</option>
                  {ALL_33_BEATS_FUEL_DATA.map((b) => (
                    <option key={b.beatNumber} value={b.beatNumber}>
                      {b.beatNumber} - {b.assignedPostmanName}
                    </option>
                  ))}
                </select>

                <select
                  value={gatewayCategoryFilter}
                  onChange={(e) => setGatewayCategoryFilter(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white"
                >
                  <option value="ALL">All Categories</option>
                  <option value="CUSTOMERS_PROPERTIES">Customer & Properties</option>
                  <option value="BEAT_FUEL_MASTER">Beat Fuel Master</option>
                  <option value="MONTHLY_DSS_REPORT">Monthly DSS Report</option>
                </select>

                <button
                  onClick={() => {
                    masterDataService.resetToInitialIngestedRecords();
                    setIngestedRecords(masterDataService.getIngestedRecords());
                    setBatchActionNotice('✓ Reset gateway records to standard Dadabari S.O. test baseline.');
                  }}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                  title="Reload default 12 demo records"
                >
                  <RefreshCw size={13} />
                  <span>Reset Demo Baseline</span>
                </button>
              </div>
            </div>

            {/* Batch Action Toolbar */}
            {selectedRecordIds.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-red-950">
                  <CheckSquare size={16} className="text-red-700" />
                  <span>{selectedRecordIds.length} records selected</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleBatchVerifyContact}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <UserCheck size={13} />
                    <span>Batch Verify Contact (Stage B)</span>
                  </button>

                  <button
                    onClick={handleBatchVerifyProperty}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <Building2 size={13} />
                    <span>Batch Verify Property (Stage C)</span>
                  </button>

                  <button
                    onClick={handleBatchApproveAndSync}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <ShieldCheck size={13} />
                    <span>Approve & Sync Live (Stage D)</span>
                  </button>

                  <button
                    onClick={() => setSelectedRecordIds([])}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold"
                  >
                    Deselect
                  </button>
                </div>
              </div>
            )}

            {/* Notice / Feedback Banner */}
            {batchActionNotice && (
              <div className="p-3 bg-slate-900 text-white text-xs font-semibold rounded-xl flex items-center justify-between gap-2 shadow-xs">
                <span>{batchActionNotice}</span>
                <button
                  onClick={() => setBatchActionNotice(null)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Interactive Ingestion Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={14} className="text-red-700" />
                  <span>Ingested Records Ledger ({filteredIngestedRecords.length} Filtered)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Each row requires field staff and supervisor sign-offs before live database propagation and ACG-61 fuel bill lock.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (selectedRecordIds.length === filteredIngestedRecords.length) {
                      setSelectedRecordIds([]);
                    } else {
                      setSelectedRecordIds(filteredIngestedRecords.map((r) => r.id));
                    }
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs"
                >
                  {selectedRecordIds.length === filteredIngestedRecords.length && filteredIngestedRecords.length > 0 ? (
                    <>
                      <CheckSquare size={13} className="text-red-700" />
                      <span>Deselect All</span>
                    </>
                  ) : (
                    <>
                      <Square size={13} className="text-slate-400" />
                      <span>Select All ({filteredIngestedRecords.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                    <th className="p-3 w-10 text-center">Select</th>
                    <th className="p-3">Record ID & Source</th>
                    <th className="p-3">Beat & Staff Tag</th>
                    <th className="p-3">Citizen & Property Parameters</th>
                    <th className="p-3 text-center">4-Stage Progress</th>
                    <th className="p-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIngestedRecords.map((rec) => {
                    const isSelected = selectedRecordIds.includes(rec.id);
                    return (
                      <tr
                        key={rec.id}
                        className={`hover:bg-slate-50/80 transition ${
                          isSelected ? 'bg-red-50/30' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRecordIds((prev) => [...prev, rec.id]);
                              } else {
                                setSelectedRecordIds((prev) => prev.filter((id) => id !== rec.id));
                              }
                            }}
                            className="rounded text-red-700 cursor-pointer"
                          />
                        </td>

                        {/* ID, Category & Source */}
                        <td className="p-3 align-top">
                          <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{rec.id}</span>
                            {rec.duplicateSuspect && (
                              <span className="px-1.5 py-0.2 bg-red-100 text-red-700 rounded text-[9px] font-bold border border-red-200">
                                Duplicate Suspect
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                            {rec.category === 'CUSTOMERS_PROPERTIES'
                              ? 'Customer & Directory'
                              : rec.category === 'BEAT_FUEL_MASTER'
                              ? '33-Beat Fuel Master'
                              : 'Monthly DSS Sheet'}
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]" title={rec.sourceFileName}>
                            {rec.sourceFileName}
                          </div>
                        </td>

                        {/* Beat & Staff Tag */}
                        <td className="p-3 align-top">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-900 font-bold font-mono text-[11px] border border-slate-200">
                            {rec.beatNo}
                          </div>
                          <div className="font-semibold text-slate-800 text-xs mt-1">
                            {rec.assignedStaffName}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            ID: {rec.assignedStaffId}
                          </div>
                        </td>

                        {/* Citizen & Property Parameters */}
                        <td className="p-3 align-top max-w-xs">
                          <div className="font-bold text-slate-900">{rec.name}</div>
                          <div className="text-[11px] font-mono text-slate-600 flex items-center gap-2 mt-0.5">
                            <span>☎ {rec.mobile || 'No Mobile'}</span>
                            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded text-[9px] font-sans">
                              {rec.householdType}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-700 mt-1 line-clamp-2">
                            {rec.fullAddress}
                          </div>
                          {rec.splitHouseSequence && rec.splitHouseSequence !== 'NONE' && (
                            <span className="inline-block mt-1 px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-mono text-[9px] font-bold">
                              Split Seq: /{rec.splitHouseSequence}
                            </span>
                          )}
                          {rec.financialInterest && (
                            <span className="inline-block mt-1 ml-1 px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[9px] font-medium">
                              {rec.financialInterest}
                            </span>
                          )}
                        </td>

                        {/* 4-Stage Stepper Progression */}
                        <td className="p-3 align-top text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Step A */}
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[10px] bg-emerald-600 text-white"
                              title="Stage A: Ingestion Complete"
                            >
                              ✓
                            </div>
                            <div className="w-3 h-0.5 bg-emerald-500" />

                            {/* Step B */}
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                                rec.verificationStage !== 'PENDING_STAFF_VERIFICATION'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-200 text-slate-600 ring-2 ring-amber-400'
                              }`}
                              title="Stage B: Contact & Identity"
                            >
                              {rec.verificationStage !== 'PENDING_STAFF_VERIFICATION' ? '✓' : 'B'}
                            </div>
                            <div
                              className={`w-3 h-0.5 ${
                                rec.verificationStage === 'PROPERTY_VERIFIED' ||
                                rec.verificationStage === 'FULLY_SYNCED'
                                  ? 'bg-purple-500'
                                  : 'bg-slate-200'
                              }`}
                            />

                            {/* Step C */}
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                                rec.verificationStage === 'PROPERTY_VERIFIED' ||
                                rec.verificationStage === 'FULLY_SYNCED'
                                  ? 'bg-purple-600 text-white'
                                  : rec.verificationStage === 'CONTACT_VERIFIED'
                                  ? 'bg-slate-200 text-slate-600 ring-2 ring-blue-400'
                                  : 'bg-slate-200 text-slate-400'
                              }`}
                              title="Stage C: Property & Locality Matrix"
                            >
                              {rec.verificationStage === 'PROPERTY_VERIFIED' ||
                              rec.verificationStage === 'FULLY_SYNCED'
                                ? '✓'
                                : 'C'}
                            </div>
                            <div
                              className={`w-3 h-0.5 ${
                                rec.verificationStage === 'FULLY_SYNCED'
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-200'
                              }`}
                            />

                            {/* Step D */}
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                                rec.verificationStage === 'FULLY_SYNCED'
                                  ? 'bg-emerald-600 text-white'
                                  : rec.verificationStage === 'PROPERTY_VERIFIED'
                                  ? 'bg-slate-200 text-slate-600 ring-2 ring-purple-400'
                                  : 'bg-slate-200 text-slate-400'
                              }`}
                              title="Stage D: SPM Live Sync"
                            >
                              {rec.verificationStage === 'FULLY_SYNCED' ? '✓' : 'D'}
                            </div>
                          </div>

                          <div className="mt-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                rec.verificationStage === 'PENDING_STAFF_VERIFICATION'
                                  ? 'bg-amber-100 text-amber-800'
                                  : rec.verificationStage === 'CONTACT_VERIFIED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : rec.verificationStage === 'PROPERTY_VERIFIED'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {rec.verificationStage === 'PENDING_STAFF_VERIFICATION'
                                ? 'Stage A: Pending Staff'
                                : rec.verificationStage === 'CONTACT_VERIFIED'
                                ? 'Stage B: Contact Verified'
                                : rec.verificationStage === 'PROPERTY_VERIFIED'
                                ? 'Stage C: Property Verified'
                                : 'Stage D: Fully Live Synced'}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-3 align-top text-right space-y-1.5 whitespace-nowrap">
                          {/* 1-Click Quick Stage Action */}
                          {rec.verificationStage === 'PENDING_STAFF_VERIFICATION' && (
                            <button
                              onClick={() => handleQuickSignOff(rec)}
                              className="w-full py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-2xs transition"
                            >
                              <UserCheck size={12} />
                              <span>Verify Contact (B)</span>
                            </button>
                          )}

                          {rec.verificationStage === 'CONTACT_VERIFIED' && (
                            <button
                              onClick={() => handleQuickSignOff(rec)}
                              className="w-full py-1.5 px-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-2xs transition"
                            >
                              <Building2 size={12} />
                              <span>Verify Property (C)</span>
                            </button>
                          )}

                          {rec.verificationStage === 'PROPERTY_VERIFIED' && (
                            <button
                              onClick={() => handleQuickSignOff(rec)}
                              className="w-full py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-2xs transition"
                              title="SPM / Master Admin Final Approval"
                            >
                              <ShieldCheck size={12} />
                              <span>Approve & Sync (D)</span>
                            </button>
                          )}

                          {rec.verificationStage === 'FULLY_SYNCED' && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              <span>Synced to Live DB</span>
                            </div>
                          )}

                          {/* Full Interactive Drawer Opener */}
                          <div>
                            <button
                              onClick={() => {
                                setSelectedRecordForDrawer(rec);
                                setIsDrawerOpen(true);
                              }}
                              className="w-full py-1.5 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition"
                            >
                              <Eye size={12} className="text-slate-600" />
                              <span>Review & Edit Matrix</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredIngestedRecords.length === 0 && (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Filter size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Ingested Records Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No records match the current filter or search criteria. Try changing the stage tab or resetting filters.
                </p>
                <button
                  onClick={() => {
                    setStageFilter('ALL');
                    setGatewaySearch('');
                    setGatewayBeatFilter('ALL');
                    setGatewayCategoryFilter('ALL');
                  }}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <RefreshCw size={13} />
                  <span>Clear All Filters</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DUAL-PANE GRID LAYOUT (UPLOAD & TEMPLATES HUB) */}
      {/* ======================================================== */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${activeMainTab === 'UPLOAD_PORTAL' || activeMainTab === 'SPECIAL_BILLS' ? 'block' : 'hidden'}`}>
        
        {/* ======================================================== */}
        {/* LEFT PANE: UPLOAD & DIRECT SUBMISSION HUB (7 COLS) */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            {/* Category Selector Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet size={15} className="text-red-700" />
                <span>Select Target Master Data Category</span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value as MasterUploadCategory);
                  setParsedRows([]);
                  setUploadedFileName(null);
                  setValidationStatus(null);
                  setCommitStatus(null);
                }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition"
              >
                <option value="CUSTOMERS_PROPERTIES">
                  1. Customer & Household Property Data (Colony, House No, Sector Maps)
                </option>
                <option value="BEAT_FUEL_MASTER">
                  2. Beat-Wise Fuel Bill Master Data (All 33 Beats Route KM & ₹3.60/KM Scale)
                </option>
                <option value="MONTHLY_DSS_REPORT">
                  3. Monthly DSS (Daily Summary Sheet) Report Upload (Auto Postman Bill Generation)
                </option>
                <option value="CHARGE_AND_BYOD_BILLS">
                  4. Postman Charge Reports & BYOD Bills (Interactive Direct Submission)
                </option>
              </select>
            </div>

            {/* IF CATEGORIES 1, 2, or 3: SHOW FILE DRAG-AND-DROP UPLOADER */}
            {selectedCategory !== 'CHARGE_AND_BYOD_BILLS' && (
              <div className="space-y-4">
                {/* Drag & Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                    dragActive
                      ? 'border-red-600 bg-red-50/50'
                      : 'border-slate-300 hover:border-red-500 hover:bg-slate-50/50 bg-slate-50/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .xlsx, .xls, text/csv"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shadow-xs">
                    <Upload size={26} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {uploadedFileName ? (
                        <span className="text-red-700 flex items-center gap-1.5 justify-center">
                          <CheckCircle2 size={16} /> {uploadedFileName}
                        </span>
                      ) : (
                        'Drag & Drop your CSV or Excel file here, or browse'
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports comma-separated (.csv) and Microsoft Excel (.xlsx, .xls) up to 25 MB
                    </p>
                  </div>
                </div>

                {/* Loading state */}
                {rawFileLoading && (
                  <div className="flex items-center justify-center gap-2 p-3 text-xs text-slate-600 bg-slate-100 rounded-xl">
                    <RefreshCw size={14} className="animate-spin text-red-700" />
                    <span>Parsing spreadsheet and running validation checks...</span>
                  </div>
                )}

                {/* Validation Status & Counters */}
                {validationStatus && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-600" /> Validation Summary
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {validationStatus.message}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-center">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Rows</div>
                        <div className="text-lg font-black text-slate-900 font-mono">{validationStatus.total}</div>
                      </div>
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                        <div className="text-[10px] text-emerald-700 font-semibold uppercase">Valid Records</div>
                        <div className="text-lg font-black text-emerald-800 font-mono">{validationStatus.valid}</div>
                      </div>
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-center">
                        <div className="text-[10px] text-amber-700 font-semibold uppercase">Skipped / Header</div>
                        <div className="text-lg font-black text-amber-800 font-mono">{validationStatus.skipped}</div>
                      </div>
                    </div>

                    {/* Ingestion Governance Pipeline Mode Selector */}
                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                      <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                        Ingestion Target & Governance Pipeline
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <label
                          className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
                            uploadMode === 'VERIFICATION_GATE'
                              ? 'bg-red-50/50 border-red-300 text-red-950 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="uploadMode"
                            checked={uploadMode === 'VERIFICATION_GATE'}
                            onChange={() => setUploadMode('VERIFICATION_GATE')}
                            className="mt-0.5 text-red-700"
                          />
                          <div>
                            <span className="block font-bold">4-Stage Verification Gate</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              Enqueues rows for Beat Staff & SPM verification before live sync
                            </span>
                          </div>
                        </label>

                        <label
                          className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition ${
                            uploadMode === 'DIRECT_SYNC'
                              ? 'bg-amber-50/50 border-amber-300 text-amber-950 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="uploadMode"
                            checked={uploadMode === 'DIRECT_SYNC'}
                            onChange={() => setUploadMode('DIRECT_SYNC')}
                            className="mt-0.5 text-amber-700"
                          />
                          <div>
                            <span className="block font-bold">Direct Fast Sync</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              Direct live upsert bypassing verification stages
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Commit Button */}
                    <button
                      onClick={handleCommitMasterSync}
                      disabled={validationStatus.valid === 0}
                      className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
                    >
                      <Database size={15} />
                      <span>
                        {uploadMode === 'VERIFICATION_GATE'
                          ? `Enqueue ${validationStatus.valid} Rows into 4-Stage Verification Gateway`
                          : `Commit & Directly Sync to Master Store (${validationStatus.valid} Rows)`}
                      </span>
                    </button>
                  </div>
                )}

                {/* Success Feedback Alert */}
                {commitStatus && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-2">
                    <div className="font-semibold flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                      <span>{commitStatus}</span>
                    </div>
                    {uploadMode === 'VERIFICATION_GATE' && (
                      <button
                        onClick={() => setActiveMainTab('VERIFICATION_GATE')}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <Layers size={13} />
                        <span>Switch to 4-Stage Verification Hub to Review Rows</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                )}

                {/* Parsed Preview Table (First 5 Rows) */}
                {parsedRows.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>Live Preview (Showing top 5 rows)</span>
                      <span className="text-[11px] text-slate-500 font-mono font-normal">
                        Total {parsedRows.length} records detected
                      </span>
                    </div>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                            {Object.keys(parsedRows[0]).slice(0, 5).map((col) => (
                              <th key={col} className="p-2 whitespace-nowrap">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {parsedRows.slice(0, 5).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              {Object.keys(parsedRows[0]).slice(0, 5).map((col) => (
                                <td key={col} className="p-2 font-mono text-slate-800 whitespace-nowrap">
                                  {String(row[col] || '-')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* IF CATEGORY 4: DIRECT STRUCTURED FORMS (NO CSV TEMPLATE NEEDED) */}
            {selectedCategory === 'CHARGE_AND_BYOD_BILLS' && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                  <Info size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Statutory Form Direct Entry:</strong> Postman Charge Reports (ACG-61) and BYOD Bills have strict statutory formats prescribed by Postal Volume VIII. They do not require downloadable CSV templates and are directly submitted below into persistent storage.
                  </span>
                </div>

                {/* Form Switcher Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <button
                    onClick={() => setBillFormType('CHARGE_REPORT')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      billFormType === 'CHARGE_REPORT'
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowLeftRight size={14} />
                    <span>ACG-61 Charge Report</span>
                  </button>
                  <button
                    onClick={() => setBillFormType('BYOD_BILL')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      billFormType === 'BYOD_BILL'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone size={14} />
                    <span>BYOD Mobile Allowance Bill</span>
                  </button>
                </div>

                {/* FORM A: ACG-61 CHARGE REPORT */}
                {billFormType === 'CHARGE_REPORT' && (
                  <form onSubmit={handleChargeReportSubmit} className="space-y-3.5 text-xs">
                    {crNotice && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold rounded-xl flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>{crNotice}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Relieved Staff (Handing Over)</label>
                        <input
                          type="text"
                          value={crRelievedName}
                          onChange={(e) => setCrRelievedName(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Relieved Staff Employee ID</label>
                        <input
                          type="text"
                          value={crRelievedId}
                          onChange={(e) => setCrRelievedId(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Relieving Staff (Taking Over)</label>
                        <input
                          type="text"
                          value={crRelievingName}
                          onChange={(e) => setCrRelievingName(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Relieving Staff ID</label>
                        <input
                          type="text"
                          value={crRelievingId}
                          onChange={(e) => setCrRelievingId(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Beat Number</label>
                        <select
                          value={crBeatNo}
                          onChange={(e) => setCrBeatNo(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                        >
                          {ALL_33_BEATS_FUEL_DATA.map((b) => (
                            <option key={b.beatNumber} value={b.beatNumber}>
                              {b.beatNumber} - {b.assignedPostmanName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Handover Date</label>
                        <input
                          type="date"
                          value={crHandoverDate}
                          onChange={(e) => setCrHandoverDate(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Articles In Hand</label>
                        <input
                          type="number"
                          value={crArticlesInHand}
                          onChange={(e) => setCrArticlesInHand(parseInt(e.target.value) || 0)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Cash Balance Held (₹)</label>
                        <input
                          type="number"
                          value={crCashBalance}
                          onChange={(e) => setCrCashBalance(parseInt(e.target.value) || 0)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Keys & Equipment</label>
                        <input
                          type="text"
                          value={crKeysEquipment}
                          onChange={(e) => setCrKeysEquipment(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Handover Remarks</label>
                      <input
                        type="text"
                        value={crRemarks}
                        onChange={(e) => setCrRemarks(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition"
                    >
                      <Printer size={15} />
                      <span>Submit ACG-61 & Download Official PDF Handover</span>
                    </button>
                  </form>
                )}

                {/* FORM B: BYOD MOBILE BILL */}
                {billFormType === 'BYOD_BILL' && (
                  <form onSubmit={handleByodBillSubmit} className="space-y-3.5 text-xs">
                    {byodNotice && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold rounded-xl flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>{byodNotice}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Postman Name</label>
                        <input
                          type="text"
                          value={byodStaffName}
                          onChange={(e) => setByodStaffName(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Employee ID</label>
                        <input
                          type="text"
                          value={byodStaffId}
                          onChange={(e) => setByodStaffId(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Beat Number</label>
                        <select
                          value={byodBeatNo}
                          onChange={(e) => setByodBeatNo(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                        >
                          {ALL_33_BEATS_FUEL_DATA.map((b) => (
                            <option key={b.beatNumber} value={b.beatNumber}>
                              {b.beatNumber} - {b.assignedPostmanName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Billing Month</label>
                        <input
                          type="month"
                          value={byodMonth}
                          onChange={(e) => setByodMonth(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Claim Amount (₹)</label>
                        <input
                          type="number"
                          value={byodAmount}
                          onChange={(e) => setByodAmount(parseInt(e.target.value) || 300)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Mobile Brand & Model</label>
                        <input
                          type="text"
                          value={byodModel}
                          onChange={(e) => setByodModel(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">IMEI Number (15 Digits)</label>
                        <input
                          type="text"
                          value={byodImei}
                          onChange={(e) => setByodImei(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <input
                        type="checkbox"
                        id="byodDecl"
                        checked={byodDeclaration}
                        onChange={(e) => setByodDeclaration(e.target.checked)}
                        className="rounded text-blue-600"
                        required
                      />
                      <label htmlFor="byodDecl" className="text-[11px] text-slate-700">
                        I hereby declare that this mobile device is running official PMA software for India Post delivery operations.
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition"
                    >
                      <Smartphone size={15} />
                      <span>Submit BYOD Claim & Save to Master Ledger</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANE: DOWNLOADABLE STANDARDIZED TEMPLATES (5 COLS) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Download size={16} className="text-red-700" />
                <span>Standardized Master Templates Hub</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Download formatted CSV templates before uploading to ensure 100% field compliance and zero data rejection.
              </p>
            </div>

            {/* Template Card 1: Customer & Household */}
            <div className="p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl transition space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Building2 size={14} className="text-blue-600" />
                    <span>Customer & Property Directory Template</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    For Keshavpura, Santoshi Nagar, Dadabari plots, house numbers & beat mappings.
                  </p>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Columns: name, mobile, beatNo, area, sector, houseNo, address, pincode, householdType, financialInterest
              </div>
              <button
                onClick={() => handleDownloadTemplate('CUSTOMER')}
                className="w-full py-2 px-3 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition"
              >
                <Download size={13} />
                <span>Download Customer Template (CSV)</span>
              </button>
            </div>

            {/* Template Card 2: Beat-Wise Fuel Bill Master */}
            <div className="p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl transition space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Fuel size={14} className="text-amber-600" />
                    <span>Beat-Wise Fuel Bill Master Template (33 Beats)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pre-populated with all 33 beats of Dadabari S.O., route distances & ₹3.60/KM rate.
                  </p>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Columns: beatNumber, assignedPostmanName, assignedStaffId, territorialCoverage, terrainClassification, sanctionedDailyKm
              </div>
              <button
                onClick={() => handleDownloadTemplate('BEAT_FUEL')}
                className="w-full py-2 px-3 bg-white hover:bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition"
              >
                <Download size={13} />
                <span>Download 33-Beat Fuel Template (CSV)</span>
              </button>
            </div>

            {/* Template Card 3: Monthly DSS Report */}
            <div className="p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl transition space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <FileSpreadsheet size={14} className="text-emerald-600" />
                    <span>Monthly DSS Summary Report Template</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Daily summary sheet rows with Speed Post, Registered, Parcels, and COD collections.
                  </p>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Columns: date, beatNo, staffName, employeeId, attendanceStatus, speedPostDelivered, registryDelivered, parcelDelivered, codAmountCollected
              </div>
              <button
                onClick={() => handleDownloadTemplate('DSS')}
                className="w-full py-2 px-3 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition"
              >
                <Download size={13} />
                <span>Download DSS Report Template (CSV)</span>
              </button>
            </div>

            {/* Statutory Guideline Card */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-1.5">
              <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                <Lock size={13} /> Non-Destructive Data Protection Policy
              </div>
              <p className="text-[11px] text-red-800 leading-relaxed">
                All uploaded CSVs and spreadsheets are merged with existing records using partial patch algorithms. Historical customer audits, property GPS pins, and previously verified DSS sheets are locked and will never be overwritten.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 3: DEDICATED BULK EXPORT & OFFICIAL DSS RECONCILER   */}
      {/* ======================================================== */}
      {activeMainTab === 'EXPORT_HUB' && (
        <div className="space-y-6">
          {/* Top Notice or Success Feedback */}
          {exportNotice && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 font-semibold rounded-2xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{exportNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setExportNotice(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Statutory Rule 1: DSS Priority & Dynamic Speed Post Balancing Engine */}
          <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white rounded-2xl border border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black border border-amber-500/30">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Statutory DSS Priority & Dynamic Speed Post Auto-Adjustment</span>
                    <span className="text-[10px] font-mono bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black">
                      Rule 1 Compliant
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dadabari S.O. (324009) · Absolute Benchmark Integrity for Postal Audit Compliance
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isReconciling}
                  onClick={() => {
                    setIsReconciling(true);
                    setTimeout(() => {
                      const res = operationsService.reconcileAndAutoAdjustEntriesToDss();
                      setReconcileReport(res);
                      setIsReconciling(false);
                      setExportNotice(`DSS Auto-Reconciliation Complete: ${res.adjustedCount} entries adjusted across ${res.totalChecked} daily sheets checked. Speed Post dynamically balanced to guarantee 100% DSS audit conformity!`);
                    }, 400);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                  id="reconcile-dss-all-beats-btn"
                >
                  <RefreshCw size={14} className={isReconciling ? 'animate-spin' : ''} />
                  <span>{isReconciling ? 'Reconciling Beats...' : '⚡ Reconcile All 33 Beats to DSS'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Absolute Inviolability</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Month-end official <strong>Daily Summary Sheet (DSS) reports</strong> uploaded into the system are the absolute benchmark for total volume and delivery percentages.
                </p>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Mathematical Auto-Adjustment</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  If postman daily field inputs do not match the official DSS report totals, <strong>Speed Post is dynamically adjusted</strong> (<code className="font-mono text-amber-300">SP = Total - Reg - Parcel</code>) so the master DSS delivery count remains 100% undisturbed.
                </p>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Fuel Claim Integrity</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  ACG-61 fuel reimbursement claims require zero-discrepancy daily delivery logs. Fuel calculations derive directly from these adjusted, audit-ready numbers.
                </p>
              </div>
            </div>

            {reconcileReport && reconcileReport.details.length > 0 && (
              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Audit Trail of Reconciled Entries ({reconcileReport.details.length} Actions)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">All 33 Beats Synced</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-300 mt-2">
                  {reconcileReport.details.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-900 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">›</span>
                        <span className="font-bold text-white">{item.date}</span>
                        <span className="text-slate-400">({item.beatNo})</span>
                      </div>
                      <div className="text-right text-[10px] space-x-2">
                        <span className="text-slate-400">Speed Post: {item.originalSp} → <strong className="text-amber-400">{item.newSp}</strong></span>
                        <span className="text-emerald-400 font-bold">(DSS Benchmark: {item.dssBenchmark})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 1-Click Master Data Export Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Customer Household Directory */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Building2 size={20} />
                  </div>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    .XLSX
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Customer & Household Directory</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Full directory of all verified households, contact numbers, colony matrices, and PLI/SSA financial scheme interests across all 33 beats.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  masterDataService.exportCustomersToExcel();
                  setExportNotice('Exported Customer Directory to Excel successfully!');
                }}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                id="export-customers-excel-btn"
              >
                <Download size={14} />
                <span>Export Customers (.xlsx)</span>
              </button>
            </div>

            {/* Card 2: Consolidated Monthly DSS Reports */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <FileSpreadsheet size={20} />
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    .XLSX
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Monthly DSS Summary Statements</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Consolidated October 2026 Daily Summary Sheets across all beats, with official Invoiced Counts, delivered items, and delivery percentage metrics.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  masterDataService.exportDssStatementsToExcel('2026-10');
                  setExportNotice('Exported Consolidated Monthly DSS Statements to Excel successfully!');
                }}
                className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                id="export-dss-excel-btn"
              >
                <Download size={14} />
                <span>Export DSS Sheets (.xlsx)</span>
              </button>
            </div>

            {/* Card 3: 33-Beat Fuel Bill Master */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Fuel size={20} />
                  </div>
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    .XLSX
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">33-Beat Route Fuel Master</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Complete official master of all 33 beats of Dadabari S.O. with sanctioned daily distances (KM), staff assignments, ₹3.60/KM rates, and working days.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  masterDataService.exportBeatFuelMasterToExcel();
                  setExportNotice('Exported 33-Beat Fuel Master Matrix to Excel successfully!');
                }}
                className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                id="export-fuel-excel-btn"
              >
                <Download size={14} />
                <span>Export Fuel Master (.xlsx)</span>
              </button>
            </div>

            {/* Card 4: Complete Disaster Recovery Snapshot */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-300 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <Database size={20} />
                  </div>
                  <span className="text-[10px] font-mono bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                    .JSON
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Full Disaster Recovery Backup</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Full atomic snapshot including all live customer records, 4-stage verification audit ledger, custom KM preferences, and system logs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  masterDataService.exportAllMasterDataBackupJSON();
                  setExportNotice('Downloaded full system state backup JSON successfully!');
                }}
                className="w-full py-2.5 px-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                id="export-backup-json-btn"
              >
                <Download size={14} />
                <span>Export Full State (.json)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: DEDICATED FULL-WIDTH STANDARDIZED TEMPLATES HUB   */}
      {/* ======================================================== */}
      {activeMainTab === 'TEMPLATES' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Download size={18} className="text-red-700" />
                  <span>Standardized Master Ingestion Templates</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-formatted official Department of Posts templates designed for seamless bulk parsing with zero header mismatches.
                </p>
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200">
                UTF-8 CSV · RFC 4180 Format
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
              {/* Template 1 */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                    <Building2 size={16} />
                    <span>Customer & Property Master</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Household mapping for Keshavpura, Santoshi Nagar, Dadabari plots, house numbers & beat assignments.
                  </p>
                  <div className="text-[11px] font-mono text-slate-600 bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-800 block text-[10px] uppercase">Required Schema:</span>
                    <span className="text-[10px] leading-relaxed break-all block">
                      name, mobile, beatNo, area, sector, houseNo, address, pincode, householdType, financialInterest
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate('CUSTOMER')}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Customer Template (CSV)</span>
                </button>
              </div>

              {/* Template 2 */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                    <Fuel size={16} />
                    <span>Beat Fuel Master (33 Beats)</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Sanctioned route distances, assigned staff IDs, ₹3.60/KM rates, and monthly working days.
                  </p>
                  <div className="text-[11px] font-mono text-slate-600 bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-800 block text-[10px] uppercase">Required Schema:</span>
                    <span className="text-[10px] leading-relaxed break-all block">
                      beatNumber, assignedPostmanName, assignedStaffId, territorialCoverage, terrainClassification, sanctionedDailyKm, fuelRatePerKm, monthlyWorkingDays
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate('BEAT_FUEL')}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download 33-Beat Fuel Template (CSV)</span>
                </button>
              </div>

              {/* Template 3 */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <FileSpreadsheet size={16} />
                    <span>Monthly DSS Summary Report</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Daily summary sheet benchmark with Speed Post, Registered Articles, Parcels, and COD collections.
                  </p>
                  <div className="text-[11px] font-mono text-slate-600 bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-800 block text-[10px] uppercase">Required Schema:</span>
                    <span className="text-[10px] leading-relaxed break-all block">
                      date, beatNo, staffName, employeeId, attendanceStatus, speedPostDelivered, registryDelivered, parcelDelivered, codAmountCollected, remarks
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate('DSS')}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download DSS Statement Template (CSV)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: AUTOMATIC POSTMAN MONTHLY FUEL BILL DOWNLOADER */}
      {/* ======================================================== */}
      <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 ${activeMainTab === 'FUEL_GENERATOR' ? 'block' : 'hidden'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Fuel size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Individual Postman Ready-Made Monthly Fuel Bill Generator
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Default departmental rate: <strong>₹3.60 / KM</strong> · Adjust route running KM & working days on-the-fly before bill generation
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div>
              <select
                value={selectedBeatForBill}
                onChange={(e) => setSelectedBeatForBill(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:bg-white focus:outline-none"
              >
                {ALL_33_BEATS_FUEL_DATA.map((b) => (
                  <option key={b.beatNumber} value={b.beatNumber}>
                    {b.beatNumber} - {b.assignedPostmanName} (Sanctioned: {b.sanctionedDailyKm} KM)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <input
                type="month"
                value={selectedMonthForBill}
                onChange={(e) => setSelectedMonthForBill(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold font-mono text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            <button
              onClick={() => masterDataService.downloadPostmanFuelBillPDF(postmanFuelSummary, { vehicleNo: customVehicleNo })}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer size={14} />
              <span>Download Official Fuel Bill (PDF)</span>
            </button>
          </div>
        </div>

        {/* Postman Route KM & Allowance Customizer Toolbar (Edit Before Download) */}
        <div className="p-4 bg-gradient-to-r from-amber-50/70 via-orange-50/50 to-slate-50 border border-amber-200/80 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-amber-600 text-white text-[11px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1">
                <Fuel size={12} /> Postman KM Customizer
              </span>
              <span className="text-xs font-bold text-slate-800">
                Logged In: <span className="text-red-700">{currentStaff?.name || 'Staff User'}</span> ({currentStaff?.beat || 'Beat 2'})
              </span>
            </div>

            {kmSavedNotice && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} /> {kmSavedNotice}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Daily Running KM */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Daily Running Distance (KM / Day)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="120"
                  value={customDailyKm}
                  onChange={(e) => setCustomDailyKm(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-black text-amber-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g. 30"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                  KM / Day
                </span>
              </div>
            </div>

            {/* Rate per KM */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Fuel Rate per KM (Departmental: ₹3.60)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.10"
                  min="0.5"
                  max="20"
                  value={customFuelRate}
                  onChange={(e) => setCustomFuelRate(parseFloat(e.target.value) || 3.60)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                  ₹ / KM
                </span>
              </div>
            </div>

            {/* Total Working Days */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Monthly Working Days (Excl. Holidays)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={customWorkingDays}
                onChange={(e) => setCustomWorkingDays(parseInt(e.target.value) || 25)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Motorcycle / Vehicle Reg. No.
              </label>
              <input
                type="text"
                value={customVehicleNo}
                onChange={(e) => setCustomVehicleNo(e.target.value.toUpperCase())}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase"
                placeholder="RJ-20-SP-2026"
              />
            </div>
          </div>

          {/* Quick Action Buttons for KM */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200/60">
            <span className="text-[11px] text-slate-600">
              💡 Change KM running as per your physical route coverage before clicking Download.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const defaultMapping = getBeatFuelMapping(selectedBeatForBill);
                  setCustomDailyKm(defaultMapping.sanctionedDailyKm);
                  setCustomFuelRate(3.60);
                  setCustomWorkingDays(25);
                  masterDataService.resetBeatCustomKm(selectedBeatForBill);
                  setKmSavedNotice('Reset to official beat sanctioned KM & ₹3.60 rate.');
                  setTimeout(() => setKmSavedNotice(null), 3000);
                }}
                className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                Reset to Beat Default
              </button>

              <button
                type="button"
                onClick={() => {
                  masterDataService.setBeatCustomKm(selectedBeatForBill, customDailyKm);
                  setKmSavedNotice(`Saved! ${customDailyKm} KM is now default for ${selectedBeatForBill}.`);
                  setTimeout(() => setKmSavedNotice(null), 3500);
                }}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs"
              >
                <Check size={12} />
                <span>Save My KM Preference</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Aggregated Fuel Bill Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Postman / Staff ID</span>
            <div className="text-sm font-bold text-slate-900 mt-1 truncate" title={postmanFuelSummary.postmanName}>
              {postmanFuelSummary.postmanName}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {postmanFuelSummary.employeeId} · {postmanFuelSummary.beatNo}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Working Days in Month</span>
            <div className="text-xl font-black text-slate-900 font-mono mt-1">
              {postmanFuelSummary.workingDays} <span className="text-xs font-normal text-slate-500">Days</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {postmanFuelSummary.sundaysAndHolidays} Sundays / Holidays
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Custom Route KM</span>
            <div className="text-xl font-black text-blue-700 font-mono mt-1">
              {postmanFuelSummary.sanctionedDailyKm} KM <span className="text-xs font-normal text-slate-500">/ Day</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
              Total {postmanFuelSummary.totalMonthlyKm} KM in month
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-[10px] font-semibold text-emerald-800 uppercase">Total Fuel Claim (INR)</span>
            <div className="text-2xl font-black text-emerald-900 font-mono mt-0.5">
              ₹{postmanFuelSummary.totalClaimAmount.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">
              Rate: ₹{postmanFuelSummary.fuelRatePerKm.toFixed(2)}/KM verified
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Articles Handled (PMA)</span>
            <div className="text-xl font-black text-slate-900 font-mono mt-1">
              {postmanFuelSummary.totalArticlesDelivered}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              SP: {postmanFuelSummary.totalSpeedPostDelivered} | Reg: {postmanFuelSummary.totalRegistryDelivered}
            </div>
          </div>
        </div>

        {/* Schedule Preview Bar */}
        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>
              Generated day-by-day 1 to {postmanFuelSummary.totalDaysInMonth} schedule matching official <strong>MAHEN FUEL.pdf</strong> statutory format ({postmanFuelSummary.sanctionedDailyKm} KM/d × {postmanFuelSummary.workingDays} Days @ ₹{postmanFuelSummary.fuelRatePerKm.toFixed(2)}/KM).
            </span>
          </div>
          <button
            onClick={() => masterDataService.downloadPostmanFuelBillPDF(postmanFuelSummary, { vehicleNo: customVehicleNo })}
            className="text-red-700 hover:text-red-800 font-bold flex items-center gap-1 transition"
          >
            <span>Download Fuel PDF</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 3: RECENT MASTER UPLOADS & AUDIT LOGS */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Database size={16} className="text-slate-700" />
              <span>Master Upload & Sync Audit Trail</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Chronological ledger of master files uploaded, parsed, and merged into Dadabari S.O. database.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-slate-200 text-slate-800 rounded-lg text-xs font-mono font-semibold">
            {uploadLogs.length} Sync Events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                <th className="p-3">Log ID / Date</th>
                <th className="p-3">Category</th>
                <th className="p-3">File Name</th>
                <th className="p-3 text-right">Total Rows</th>
                <th className="p-3 text-right">Valid Rows</th>
                <th className="p-3">Uploaded By</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Audit Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {uploadLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-mono font-bold text-slate-900">{log.id}</div>
                    <div className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</div>
                  </td>
                  <td className="p-3 font-semibold text-slate-800">
                    {log.categoryLabel}
                  </td>
                  <td className="p-3 font-mono text-slate-700">
                    {log.fileName}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    {log.totalRows}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">
                    {log.validRows}
                  </td>
                  <td className="p-3 text-slate-700">
                    {log.uploadedBy}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 text-[11px] text-slate-600 max-w-xs truncate" title={log.summary}>
                    {log.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4-STAGE INTERACTIVE MASTER VERIFICATION DRAWER */}
      {/* ======================================================== */}
      <MasterVerificationDrawer
        record={selectedRecordForDrawer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentStaff={currentStaff}
        onRecordUpdated={(updated) => {
          setSelectedRecordForDrawer(updated);
          setIngestedRecords(masterDataService.getIngestedRecords());
        }}
      />
    </div>
  );
}
