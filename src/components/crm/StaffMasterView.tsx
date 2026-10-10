import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sliders,
  UserCheck,
  Lock,
  Unlock,
  Plus,
  Save,
  MapPin,
  Phone,
  Mail,
  Award,
  Layers,
  Edit3,
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  Filter,
  Building2,
  Navigation,
  Sparkles,
  Eye,
  EyeOff,
  CheckSquare,
  RefreshCw,
  Upload,
} from 'lucide-react';
import {
  staffPermissionService,
  getDefaultColoniesForBeat,
  getDefaultFixedKmForBeat,
  DEFAULT_STAFF_SERVICE_MODULES,
} from '../../services/staffPermissionService';
import StaffCsvImportModal from './StaffCsvImportModal';
import {
  StaffProfile,
  UserRole,
  Staff,
  DesignationType,
  ServiceModulePermissions,
} from '../../types/models';
import { customerService } from '../../services/customerService';
import { useAuth } from '../auth/FirebaseAuthProvider';

interface StaffMasterViewProps {
  currentUser?: StaffProfile | null;
}

const DESIGNATION_OPTIONS: DesignationType[] = [
  'Postman',
  'GDS (BPM / ABPM / Dak Sevak)',
  'PA (Postal Assistant)',
  'MTS (Multi Tasking Staff)',
  'Inspector (IP / ASP)',
  'SPM / Postmaster',
  'Sorting Assistant (SA)',
  'Mail Guard',
];

const SERVICE_MODULE_LABELS: {
  key: keyof ServiceModulePermissions;
  title: string;
  shortLabel: string;
  desc: string;
  badgeColor: string;
}[] = [
  {
    key: 'crmSection',
    title: '1. CRM Section (Customer & Property Management)',
    shortLabel: 'CRM & Property',
    desc: 'Access to Master Database, Household Tree, Follow-ups, and Colony Records',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    key: 'specialBillsSection',
    title: '2. Special Bills Section (Fuel Bill, Charge Report, Outsider, BYOD)',
    shortLabel: 'Special Bills',
    desc: 'Generate & print Fuel Reimbursement, Charge Report (ACG-61), Outsider & BYOD Bills',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    key: 'learningSection',
    title: '3. Departmental Learning Section (GDS to MTS / Postman / PA LMS)',
    shortLabel: 'Postal Exam LMS',
    desc: 'Syllabus, Study Notes, 25-Q Practice Tests & Full Mock Exams',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    key: 'schemeLeadsSection',
    title: '4. Product & Scheme Lead Section (PLI, SSA, IPPB, Savings)',
    shortLabel: 'Scheme Leads',
    desc: 'Lead Pipeline, PLI/RPLI Calculators, 1-Click Field Lead Capture',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    key: 'contentSharingSection',
    title: '5. Content Sharing & Customer Request Dispatch Capabilities',
    shortLabel: 'Content & Dispatch',
    desc: 'WhatsApp/SMS Scheme Brochures, Customer Call/Visit Requests & Broadcasts',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
];

export const StaffMasterView: React.FC<StaffMasterViewProps> = ({ currentUser: propUser }) => {
  const { userProfile: authUser } = useAuth();
  const currentUser = propUser !== undefined ? propUser : authUser || staffPermissionService.getActiveSession();
  const [profiles, setProfiles] = useState<StaffProfile[]>([]);
  const [directoryStaff, setDirectoryStaff] = useState<Staff[]>([]);
  const [activeTab, setActiveTab] = useState<'directory' | 'service_matrix' | 'direct_entry'>('directory');
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);

  // Preview mode for Super Admin to test Non-Admin Strict Drill-Down Gate
  const [simulateRestrictedView, setSimulateRestrictedView] = useState(false);

  // Level 1 (Hierarchical Selection): Circle -> Division -> HO/SO/BO OR Pincode
  const [selectedCircle, setSelectedCircle] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedOffice, setSelectedOffice] = useState<string>('');
  const [pincodeFilter, setPincodeFilter] = useState<string>('');

  // Level 2 (Refinement): Name, Employee ID, Mobile, Designation, Beat Number
  const [refinementQuery, setRefinementQuery] = useState<string>('');
  const [designationFilter, setDesignationFilter] = useState<string>('ALL');
  const [beatFilter, setBeatFilter] = useState<string>('ALL');

  // Direct Staff Registration & Profile Update Form State
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('Post@123');
  const [formDesignation, setFormDesignation] = useState<DesignationType>('Postman');
  // Joining Office Details
  const [formCircle, setFormCircle] = useState('Rajasthan Circle');
  const [formDivision, setFormDivision] = useState('Kota Division');
  const [formHeadOffice, setFormHeadOffice] = useState('Kota H.O.');
  const [formSubOffice, setFormSubOffice] = useState('Dadabari S.O.');
  const [formBranchOffice, setFormBranchOffice] = useState('');
  const [formOfficePincode, setFormOfficePincode] = useState('324009');
  const [formOfficeAddress, setFormOfficeAddress] = useState(
    'Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - 324009'
  );
  // Beat & Delivery Territory Mapping
  const [formBeat, setFormBeat] = useState('Beat 2');
  const [formDeliveryMapping, setFormDeliveryMapping] = useState('Dadabari S.O. (324009) / Kota H.O.');
  const [formColoniesText, setFormColoniesText] = useState(
    'Keshavpura Sector 7, Keshavpura Sector 6, Patel Nagar, Santoshi Nagar'
  );
  const [formFixedKm, setFormFixedKm] = useState(18);
  const [formDailyLimit, setFormDailyLimit] = useState(50);
  const [formApprovalStatus, setFormApprovalStatus] = useState<'Approved' | 'Pending Approval' | 'Revoked'>('Approved');
  const [formServiceModules, setFormServiceModules] = useState<ServiceModulePermissions>({
    ...DEFAULT_STAFF_SERVICE_MODULES,
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const isActualSuperAdmin = staffPermissionService.isSuperAdmin(currentUser);
  const isEffectiveSuperAdmin = isActualSuperAdmin && !simulateRestrictedView;

  const refreshData = () => {
    setProfiles(staffPermissionService.getStaffProfiles());
    setDirectoryStaff(staffPermissionService.getDirectoryStaff());
  };

  useEffect(() => {
    refreshData();
    const unsub = staffPermissionService.subscribe(refreshData);
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Auto-Managed Offices & Beats derived live from staff entries
  const autoOffices = useMemo(() => staffPermissionService.getAutoManagedOffices(), [directoryStaff, profiles]);

  const availableCircles = useMemo(() => {
    const set = new Set<string>(['Rajasthan Circle']);
    directoryStaff.forEach(s => {
      if (s.circle) set.add(s.circle);
    });
    return Array.from(set);
  }, [directoryStaff]);

  const availableDivisions = useMemo(() => {
    const set = new Set<string>(['Kota Division']);
    directoryStaff.forEach(s => {
      if (s.division) set.add(s.division);
    });
    return Array.from(set);
  }, [directoryStaff]);

  const availableOffices = useMemo(() => {
    const set = new Set<string>(['Kota H.O.', 'Dadabari S.O.', 'Mandaliya B.O.']);
    directoryStaff.forEach(s => {
      if (s.headOffice) set.add(s.headOffice);
      if (s.subOffice) set.add(s.subOffice);
      if (s.branchOffice) set.add(s.branchOffice);
      if (s.postedOfficeName) set.add(s.postedOfficeName);
    });
    return Array.from(set);
  }, [directoryStaff]);

  const availableBeats = useMemo(() => {
    const set = new Set<string>();
    directoryStaff.forEach(s => {
      if (s.beat) set.add(s.beat);
    });
    return Array.from(set);
  }, [directoryStaff]);

  // Check if Level 1 + Level 2 Mandatory Multi-Level Drill-Down Filter is active
  const isLevel1FilterActive = Boolean(
    (selectedCircle && selectedDivision && (selectedOffice || pincodeFilter.trim().length >= 3)) ||
      pincodeFilter.trim().length >= 6
  );

  const isLevel2FilterActive = Boolean(
    refinementQuery.trim().length >= 2 ||
      designationFilter !== 'ALL' ||
      beatFilter !== 'ALL'
  );

  // Strict Data Visibility Rule:
  // Super Admin sees all records by default on page load.
  // General users/staff must NOT see a complete default listing on page load; data renders ONLY after filtering!
  const canRenderDataList = isEffectiveSuperAdmin || (isLevel1FilterActive && isLevel2FilterActive) || isLevel2FilterActive || isLevel1FilterActive;

  const filteredDirectory = useMemo(() => {
    if (!canRenderDataList) return [];

    return directoryStaff.filter(s => {
      if (selectedCircle && (s.circle || 'Rajasthan Circle') !== selectedCircle) return false;
      if (selectedDivision && (s.division || 'Kota Division') !== selectedDivision) return false;
      if (selectedOffice) {
        const offLower = selectedOffice.toLowerCase();
        const matchesOff =
          (s.headOffice || '').toLowerCase().includes(offLower) ||
          (s.subOffice || '').toLowerCase().includes(offLower) ||
          (s.branchOffice || '').toLowerCase().includes(offLower) ||
          (s.postedOfficeName || '').toLowerCase().includes(offLower);
        if (!matchesOff) return false;
      }
      if (pincodeFilter.trim()) {
        if (!(s.officePincode || '324009').includes(pincodeFilter.trim())) return false;
      }
      if (designationFilter !== 'ALL') {
        const desig = (s.designationType || s.role || '').toLowerCase();
        if (!desig.includes(designationFilter.toLowerCase())) return false;
      }
      if (beatFilter !== 'ALL') {
        if ((s.beat || '').toLowerCase() !== beatFilter.toLowerCase()) return false;
      }
      if (refinementQuery.trim()) {
        const q = refinementQuery.trim().toLowerCase();
        const matchesRef =
          s.name.toLowerCase().includes(q) ||
          (s.employeeId || s.id || '').toLowerCase().includes(q) ||
          (s.contact || '').includes(q) ||
          (s.designationType || s.role || '').toLowerCase().includes(q) ||
          (s.beat || '').toLowerCase().includes(q) ||
          (s.assignedColonies || []).some(c => c.toLowerCase().includes(q));
        if (!matchesRef) return false;
      }
      return true;
    });
  }, [
    canRenderDataList,
    directoryStaff,
    selectedCircle,
    selectedDivision,
    selectedOffice,
    pincodeFilter,
    designationFilter,
    beatFilter,
    refinementQuery,
  ]);

  const filteredProfiles = useMemo(() => {
    if (!canRenderDataList) return [];

    return profiles.filter(p => {
      if (selectedCircle && (p.circle || 'Rajasthan Circle') !== selectedCircle) return false;
      if (selectedDivision && (p.division || 'Kota Division') !== selectedDivision) return false;
      if (selectedOffice) {
        const offLower = selectedOffice.toLowerCase();
        const matchesOff =
          (p.headOffice || '').toLowerCase().includes(offLower) ||
          (p.subOffice || '').toLowerCase().includes(offLower) ||
          (p.branchOffice || '').toLowerCase().includes(offLower) ||
          (p.assignedOffice || '').toLowerCase().includes(offLower);
        if (!matchesOff) return false;
      }
      if (pincodeFilter.trim()) {
        if (!(p.officePincode || '324009').includes(pincodeFilter.trim())) return false;
      }
      if (designationFilter !== 'ALL') {
        const desig = (p.designationType || p.role || '').toLowerCase();
        if (!desig.includes(designationFilter.toLowerCase())) return false;
      }
      if (beatFilter !== 'ALL') {
        if ((p.beat || '').toLowerCase() !== beatFilter.toLowerCase()) return false;
      }
      if (refinementQuery.trim()) {
        const q = refinementQuery.trim().toLowerCase();
        const matchesRef =
          p.name.toLowerCase().includes(q) ||
          (p.employeeId || p.id || '').toLowerCase().includes(q) ||
          (p.contact || '').includes(q) ||
          (p.email || '').toLowerCase().includes(q) ||
          (p.designationType || p.role || '').toLowerCase().includes(q) ||
          (p.beat || '').toLowerCase().includes(q);
        if (!matchesRef) return false;
      }
      return true;
    });
  }, [
    canRenderDataList,
    profiles,
    selectedCircle,
    selectedDivision,
    selectedOffice,
    pincodeFilter,
    designationFilter,
    beatFilter,
    refinementQuery,
  ]);

  const loadStaffIntoForm = (staffOrProfile: Staff | StaffProfile) => {
    setEditingStaffId(staffOrProfile.id);
    setFormName(staffOrProfile.name);
    setFormContact(staffOrProfile.contact || '');
    setFormEmployeeId(staffOrProfile.employeeId || staffOrProfile.id.replace(/^STAFF-/, ''));
    setFormEmail(staffOrProfile.email || '');
    setFormDesignation(staffOrProfile.designationType || 'Postman');
    setFormCircle(staffOrProfile.circle || 'Rajasthan Circle');
    setFormDivision(staffOrProfile.division || 'Kota Division');
    setFormHeadOffice(staffOrProfile.headOffice || 'Kota H.O.');
    setFormSubOffice(staffOrProfile.subOffice || 'Dadabari S.O.');
    setFormBranchOffice(staffOrProfile.branchOffice || '');
    setFormOfficePincode(staffOrProfile.officePincode || '324009');
    setFormOfficeAddress(
      staffOrProfile.officeAddress ||
        'Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - 324009'
    );
    setFormBeat(staffOrProfile.beat || 'Beat 2');
    setFormDeliveryMapping(
      staffOrProfile.deliveryOfficeMapping || 'Dadabari S.O. (324009) / Kota H.O.'
    );
    const cols =
      staffOrProfile.assignedColonies?.length
        ? staffOrProfile.assignedColonies
        : getDefaultColoniesForBeat(staffOrProfile.beat || 'Beat 2');
    setFormColoniesText(cols.join(', '));

    const matchedProf = profiles.find(
      p =>
        p.id === staffOrProfile.id ||
        (p.email && staffOrProfile.email && p.email.toLowerCase() === staffOrProfile.email.toLowerCase()) ||
        (p.employeeId && staffOrProfile.employeeId && p.employeeId === staffOrProfile.employeeId)
    );
    if (matchedProf) {
      setFormFixedKm(matchedProf.fixedKm || 18);
      setFormDailyLimit(matchedProf.permissions.dailyEntryLimit ?? 50);
      setFormApprovalStatus(matchedProf.permissions.approvalStatus || 'Approved');
      setFormServiceModules(
        matchedProf.permissions.serviceModules || { ...DEFAULT_STAFF_SERVICE_MODULES }
      );
    }

    setActiveTab('direct_entry');
  };

  const resetForm = () => {
    setEditingStaffId(null);
    setFormName('');
    setFormContact('');
    setFormEmployeeId(`CSI-${Math.floor(10000000 + Math.random() * 90000000)}`);
    setFormEmail('');
    setFormPassword('Post@123');
    setFormDesignation('Postman');
    setFormCircle('Rajasthan Circle');
    setFormDivision('Kota Division');
    setFormHeadOffice('Kota H.O.');
    setFormSubOffice('Dadabari S.O.');
    setFormBranchOffice('');
    setFormOfficePincode('324009');
    setFormOfficeAddress(
      'Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - 324009'
    );
    setFormBeat('Beat 2');
    setFormDeliveryMapping('Dadabari S.O. (324009) / Kota H.O.');
    setFormColoniesText('Keshavpura Sector 7, Keshavpura Sector 6, Patel Nagar, Santoshi Nagar');
    setFormFixedKm(18);
    setFormDailyLimit(50);
    setFormApprovalStatus('Approved');
    setFormServiceModules({ ...DEFAULT_STAFF_SERVICE_MODULES });
  };

  const handleSaveStaffAndAutoManageOffice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formContact.trim()) {
      showToast('Please enter Full Name and Mobile / Contact Number.');
      return;
    }

    const coloniesList = formColoniesText
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const { profile, staffRecord } = staffPermissionService.upsertStaffWithAutoOfficeAndBeat({
      id: editingStaffId || undefined,
      employeeId: formEmployeeId,
      name: formName,
      contact: formContact,
      email: formEmail,
      password: formPassword,
      designationType: formDesignation,
      circle: formCircle,
      division: formDivision,
      headOffice: formHeadOffice,
      subOffice: formSubOffice,
      branchOffice: formBranchOffice,
      officePincode: formOfficePincode,
      officeAddress: formOfficeAddress,
      beat: formBeat,
      deliveryOfficeMapping: formDeliveryMapping,
      assignedColonies: coloniesList,
      fixedKm: formFixedKm,
      dailyEntryLimit: formDailyLimit,
      approvalStatus: formApprovalStatus,
      serviceModules: formServiceModules,
    });

    // Also sync with customerService staff store
    const existingInCust = customerService.getStaff().some(s => s.id === staffRecord.id);
    if (existingInCust) {
      customerService.updateStaff(staffRecord);
    } else {
      customerService.addStaff(staffRecord);
    }

    refreshData();
    showToast(
      `Saved ${profile.name} (${profile.designationType}) & Auto-Updated Office (${formSubOffice}) + Beat (${formBeat}) Mappings!`
    );
    setActiveTab('directory');
  };

  const clearFilters = () => {
    setSelectedCircle('');
    setSelectedDivision('');
    setSelectedOffice('');
    setPincodeFilter('');
    setRefinementQuery('');
    setDesignationFilter('ALL');
    setBeatFilter('ALL');
  };

  const handleQuickDrillDown = (circle: string, division: string, office: string, pin: string) => {
    setSelectedCircle(circle);
    setSelectedDivision(division);
    setSelectedOffice(office);
    setPincodeFilter(pin);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-red-900/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-red-600/30 border border-red-500/40 rounded-full text-[11px] font-black uppercase tracking-wider text-red-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Staff, Office & Service Authorization OS
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-[11px] font-bold text-emerald-300">
                Auto-Managed Offices ({autoOffices.length}) • {directoryStaff.length} Staff
              </span>
              {isActualSuperAdmin && (
                <button
                  onClick={() => setSimulateRestrictedView(!simulateRestrictedView)}
                  className={`px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    simulateRestrictedView
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20 border border-white/15'
                  }`}
                  title="Toggle to test how Non-Super-Admin users experience the Strict Drill-Down Filter gate"
                >
                  {simulateRestrictedView ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Testing Staff Restricted View (Click to Exit)
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Super Admin View (mahen.comtech@gmail.com)
                    </>
                  )}
                </button>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Direct Staff Entry, Auto-Managed Offices & Service Access Engine
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-3xl">
              Live Staff Registration automatically populates Circle, Division, HO/SO/BO, Pincode, Beat Numbers & Colony Mappings with zero manual office pre-entry required.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                resetForm();
                setActiveTab('direct_entry');
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black text-xs shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Direct Staff Registration / Update
            </button>

            <button
              onClick={() => setIsCsvImportOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-950 rounded-xl font-black text-xs shadow-md transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-red-700" /> Secure CSV Import & Analysis
            </button>

            <button
              onClick={() => staffPermissionService.exportAllToExcel()}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs shadow-md transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Excel (.xlsx)
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/10">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-white text-slate-900 shadow-lg'
                : 'bg-white/10 text-slate-200 hover:bg-white/15'
            }`}
          >
            <Users className="w-4 h-4 text-red-600" />
            Staff, Joining Office & Beat Directory ({directoryStaff.length})
          </button>

          <button
            onClick={() => setActiveTab('service_matrix')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'service_matrix'
                ? 'bg-white text-slate-900 shadow-lg'
                : 'bg-white/10 text-slate-200 hover:bg-white/15'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-500" />
            Granular Service-Level Access & Admin Approval Matrix
          </button>

          <button
            onClick={() => setActiveTab('direct_entry')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'direct_entry'
                ? 'bg-amber-400 text-slate-950 shadow-lg'
                : 'bg-white/10 text-amber-300 hover:bg-white/15 border border-amber-400/30'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {editingStaffId ? 'Update Staff & Office Mapping' : 'Direct Staff Registration Form'}
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MANDATORY MULTI-LEVEL DRILL-DOWN SEARCH FILTER (LEVEL 1 + LEVEL 2)     */}
      {/* ===================================================================== */}
      {activeTab !== 'direct_entry' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  Multi-Level Hierarchical Drill-Down Search Filter
                  {!isEffectiveSuperAdmin && (
                    <span className="px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase">
                      Mandatory Filter Required to Render Data
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500">
                  Level 1: Select Circle → Division → HO/SO/BO or Pincode • Level 2: Refine by Staff Name, Employee ID, Mobile, Designation, or Beat
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  handleQuickDrillDown('Rajasthan Circle', 'Kota Division', 'Dadabari S.O.', '324009')
                }
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
              >
                Quick Fill: Dadabari S.O. (324009)
              </button>
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Reset Filters
              </button>
            </div>
          </div>

          {/* LEVEL 1: Hierarchical Office Selection */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-red-600" />
              Level 1 — Hierarchical Office Selection (Circle → Division → HO / SO / BO or Pincode)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">1. Select Circle</label>
                <select
                  value={selectedCircle}
                  onChange={e => setSelectedCircle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500"
                >
                  <option value="">-- Select Postal Circle --</option>
                  {availableCircles.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">2. Select Division</label>
                <select
                  value={selectedDivision}
                  onChange={e => setSelectedDivision(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500"
                >
                  <option value="">-- Select Division --</option>
                  {availableDivisions.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">3. Select HO / SO / BO</label>
                <select
                  value={selectedOffice}
                  onChange={e => setSelectedOffice(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500"
                >
                  <option value="">-- Select HO / SO / BO --</option>
                  {availableOffices.map(o => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">OR Enter Office Pincode</label>
                <input
                  type="text"
                  value={pincodeFilter}
                  onChange={e => setPincodeFilter(e.target.value)}
                  placeholder="e.g., 324009 or 324001"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* LEVEL 2: Staff & Beat Refinement */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-blue-600" />
              Level 2 — Staff & Territory Refinement (Name, Employee ID, Mobile, Designation, Beat)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={refinementQuery}
                  onChange={e => setRefinementQuery(e.target.value)}
                  placeholder="Search Name, Emp ID (10310735), Mobile, or Colony..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <select
                  value={designationFilter}
                  onChange={e => setDesignationFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Designations (PA / GDS / Postman / MTS / Inspector)</option>
                  <option value="PA">PA (Postal Assistant)</option>
                  <option value="Postman">Postman</option>
                  <option value="GDS">GDS (BPM / ABPM / Dak Sevak)</option>
                  <option value="MTS">MTS (Multi Tasking Staff)</option>
                  <option value="Inspector">Inspector (IP / ASP)</option>
                  <option value="Postmaster">SPM / Postmaster</option>
                </select>
              </div>

              <div>
                <select
                  value={beatFilter}
                  onChange={e => setBeatFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Delivery Beats (Beat 1 - Beat 33 & BO)</option>
                  {availableBeats.map(b => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STRICT VISIBILITY GATE FOR NON-SUPER-ADMIN WHEN NO FILTER APPLIED      */}
      {/* ===================================================================== */}
      {activeTab !== 'direct_entry' && !canRenderDataList && (
        <div className="bg-amber-50/90 border-2 border-dashed border-amber-300 rounded-3xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-7 h-7" />
          </div>
          <div className="max-w-xl mx-auto">
            <span className="px-3 py-1 bg-amber-200/80 text-amber-900 rounded-full text-[11px] font-black uppercase tracking-wider">
              Role-Based Data Visibility Protection Active
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-2">
              Default Complete Listing is Restricted for Non-Super-Admin Accounts
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Only the Master Super Admin (<strong>mahen.comtech@gmail.com</strong>) sees all staff and office records by default on page load. General users and staff must execute the <strong>Multi-Level Search Filter</strong> above (select Circle/Division/Office/Pincode or search by Name/Employee ID/Mobile/Beat) to view matching records.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() =>
                handleQuickDrillDown('Rajasthan Circle', 'Kota Division', 'Dadabari S.O.', '324009')
              }
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
            >
              Apply Dadabari S.O. (324009) Filter
            </button>
            {currentUser?.beat && (
              <button
                onClick={() => setBeatFilter(currentUser.beat)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
              >
                Filter My Assigned Beat ({currentUser.beat})
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 1: DIRECT STAFF REGISTRATION & PROFILE UPDATE FORM                */}
      {/* ===================================================================== */}
      {activeTab === 'direct_entry' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="bg-slate-900 text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Live Auto-Managed Office & Beat Engine
              </span>
              <h2 className="text-xl font-black mt-1">
                {editingStaffId
                  ? `Update Staff Profile & Office Mapping (${formName})`
                  : 'Direct Staff Registration & Profile Update Form'}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Submitting this form automatically creates or updates the Staff Profile, Office Record (Circle/Division/HO/SO/BO/Pincode), and Beat-Colony Mapping.
              </p>
            </div>
            {editingStaffId && (
              <button
                onClick={resetForm}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                + Switch to New Staff Entry
              </button>
            )}
          </div>

          <form onSubmit={handleSaveStaffAndAutoManageOffice} className="p-6 space-y-6">
            {/* SECTION 1: STAFF BASIC DETAILS */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-red-700 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                1. Staff Basic Details (Mandatory Column Fields)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g., Mahendra Kumar Meena"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / Contact Number *</label>
                  <input
                    type="text"
                    required
                    value={formContact}
                    onChange={e => setFormContact(e.target.value)}
                    placeholder="10-digit Mobile Number"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID (CSI / GDS ID) *</label>
                  <input
                    type="text"
                    required
                    value={formEmployeeId}
                    onChange={e => setFormEmployeeId(e.target.value)}
                    placeholder="e.g., 10310735 or CSI-100234"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation / Designation Type *
                  </label>
                  <select
                    value={formDesignation}
                    onChange={e => setFormDesignation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  >
                    {DESIGNATION_OPTIONS.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official / Login Email (Auto-generated if left blank)
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="e.g., staff.name@indiapost.gov.in"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Login Password</label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    placeholder="Post@123"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Entry Quota</label>
                  <input
                    type="number"
                    min={0}
                    value={formDailyLimit}
                    onChange={e => setFormDailyLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: JOINING OFFICE DETAILS (AUTO-CREATES OFFICE RECORD) */}
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  2. Joining Office Details (Auto-Manages & Groups Office Master Record)
                </h3>
                <span className="text-[11px] font-bold text-blue-600">
                  No pre-entry needed — new HO/SO/BO & Pincodes are auto-registered live!
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Circle *</label>
                  <input
                    type="text"
                    required
                    value={formCircle}
                    onChange={e => setFormCircle(e.target.value)}
                    placeholder="Rajasthan Circle"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Division *</label>
                  <input
                    type="text"
                    required
                    value={formDivision}
                    onChange={e => setFormDivision(e.target.value)}
                    placeholder="Kota Division"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Head Office (HO) *</label>
                  <input
                    type="text"
                    required
                    value={formHeadOffice}
                    onChange={e => setFormHeadOffice(e.target.value)}
                    placeholder="Kota H.O."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sub Office (SO) *</label>
                  <input
                    type="text"
                    required
                    value={formSubOffice}
                    onChange={e => setFormSubOffice(e.target.value)}
                    placeholder="Dadabari S.O."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Branch Office (BO, if any)</label>
                  <input
                    type="text"
                    value={formBranchOffice}
                    onChange={e => setFormBranchOffice(e.target.value)}
                    placeholder="e.g., Mandaliya B.O."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Office Pincode *</label>
                  <input
                    type="text"
                    required
                    value={formOfficePincode}
                    onChange={e => setFormOfficePincode(e.target.value)}
                    placeholder="324009"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="md:col-span-3 lg:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Complete Office Address *</label>
                  <input
                    type="text"
                    required
                    value={formOfficeAddress}
                    onChange={e => setFormOfficeAddress(e.target.value)}
                    placeholder="Full Postal Address of Joining Office with Landmark & Pincode"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: BEAT & DELIVERY TERRITORY MAPPING */}
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  3. Beat & Delivery Territory Mapping (Auto-Links Colonies to Beat & Pincode)
                </h3>
                <span className="text-[11px] font-bold text-emerald-700">
                  Colonies entered below are automatically mapped to this Beat & Pincode!
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Beat Number(s) *</label>
                  <input
                    type="text"
                    required
                    value={formBeat}
                    onChange={e => {
                      const b = e.target.value;
                      setFormBeat(b);
                      setFormFixedKm(getDefaultFixedKmForBeat(b));
                    }}
                    placeholder="e.g., Beat 2 or Beat BO"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery BO / SO Mappings *</label>
                  <input
                    type="text"
                    required
                    value={formDeliveryMapping}
                    onChange={e => setFormDeliveryMapping(e.target.value)}
                    placeholder="e.g., Dadabari S.O. (324009) / Mandaliya B.O."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fixed Beat Route Distance (KM)</label>
                  <input
                    type="number"
                    value={formFixedKm}
                    onChange={e => setFormFixedKm(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="md:col-span-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Assigned Beat Areas / Colonies & Sectors (Comma-separated) *
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormColoniesText(getDefaultColoniesForBeat(formBeat).join(', '))
                      }
                      className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Auto-Fill Default Colonies for {formBeat}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formColoniesText}
                    onChange={e => setFormColoniesText(e.target.value)}
                    placeholder="e.g., Keshavpura Sector 7, Keshavpura Sector 6, Patel Nagar, Santoshi Nagar"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: SERVICE MODULE AUTHORIZATION (ADMIN CONTROL) */}
            {isActualSuperAdmin && (
              <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-600" />
                    4. Granular Service-Level Access & Admin Approval
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Approval Status:</span>
                    <select
                      value={formApprovalStatus}
                      onChange={e => setFormApprovalStatus(e.target.value as any)}
                      className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-black text-slate-900"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Revoked">Revoked</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SERVICE_MODULE_LABELS.map(mod => {
                    const checked = formServiceModules[mod.key];
                    return (
                      <label
                        key={mod.key}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          checked
                            ? 'bg-white border-emerald-400 shadow-sm'
                            : 'bg-slate-100/70 border-slate-200 opacity-75'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e =>
                            setFormServiceModules(prev => ({
                              ...prev,
                              [mod.key]: e.target.checked,
                            }))
                          }
                          className="mt-1 w-4 h-4 accent-emerald-600"
                        />
                        <div>
                          <div className="text-xs font-black text-slate-900">{mod.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{mod.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('directory')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Staff Record & Auto-Sync Office + Beat Data
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: STAFF, JOINING OFFICE & BEAT DIRECTORY                         */}
      {/* ===================================================================== */}
      {activeTab === 'directory' && canRenderDataList && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Verified Postal Staff, Joining Offices & Delivery Beat Territory ({filteredDirectory.length} Records)
              </h3>
              <p className="text-xs text-slate-500">
                Click "Edit / Update Profile & Office" on any staff row to live-update their designation, office, beat, or colony mapping.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3.5 px-4">Staff Basic Details</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Joining Office (Circle / Div / HO / SO / BO)</th>
                  <th className="py-3.5 px-4">Office Pincode & Address</th>
                  <th className="py-3.5 px-4">Beat & Delivery Colonies</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDirectory.map(staff => (
                  <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900 text-sm">{staff.name}</div>
                      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono">
                          ID: {staff.employeeId || staff.id}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-700">
                          <Phone className="w-3 h-3" /> {staff.contact}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg font-black text-[11px] inline-block">
                        {staff.designationType || staff.role}
                      </span>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">{staff.status}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-800">
                        {staff.subOffice || staff.subOrBranchOffice || 'Dadabari S.O.'}
                        {staff.branchOffice ? ` → ${staff.branchOffice}` : ''}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        HO: <strong className="text-slate-700">{staff.headOffice || 'Kota H.O.'}</strong> •{' '}
                        {staff.division || 'Kota Division'} ({staff.circle || 'Rajasthan Circle'})
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-black text-[11px]">
                        PIN: {staff.officePincode || '324009'}
                      </span>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                        {staff.officeAddress ||
                          'Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota - 324009'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-lg font-black text-[11px]">
                          {staff.beat}
                        </span>
                        <span className="text-[11px] text-slate-500 font-bold">
                          {staff.deliveryOfficeMapping || 'Dadabari S.O. (324009)'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(staff.assignedColonies || getDefaultColoniesForBeat(staff.beat)).map((col, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-bold"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => loadStaffIntoForm(staff)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl font-bold text-[11px] inline-flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit / Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: GRANULAR SERVICE-LEVEL ACCESS CONTROL & ADMIN APPROVAL MATRIX  */}
      {/* ===================================================================== */}
      {activeTab === 'service_matrix' && canRenderDataList && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Granular Service-Level Access Control & Admin Approval Matrix ({filteredProfiles.length} Users)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Super Admin (<strong>mahen.comtech@gmail.com</strong>) can approve/revoke users and toggle individual service modules (CRM, Special Bills, Learning LMS, Scheme Leads, Content Sharing) and data scope in real time.
                </p>
              </div>
              {!isActualSuperAdmin && (
                <span className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-xl text-xs font-black">
                  Read-Only Matrix (Only Master Admin mahen.comtech@gmail.com can modify permissions)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              {filteredProfiles.map(prof => {
                const isMaster = prof.email.toLowerCase() === 'mahen.comtech@gmail.com';
                const modules = prof.permissions.serviceModules || DEFAULT_STAFF_SERVICE_MODULES;
                const approval = prof.permissions.approvalStatus || 'Approved';

                return (
                  <div
                    key={prof.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      isMaster
                        ? 'bg-gradient-to-r from-amber-50/70 via-white to-red-50/40 border-amber-300 shadow-sm'
                        : approval === 'Revoked'
                        ? 'bg-red-50/30 border-red-200 opacity-80'
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-200/70">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                          {prof.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-slate-900 text-sm">{prof.name}</span>
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[10px] font-black">
                              {prof.designationType || prof.role}
                            </span>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[10px] font-black">
                              {prof.beat}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold">
                              {prof.subOffice || prof.assignedOffice} ({prof.officePincode || '324009'})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-semibold mt-0.5 flex flex-wrap items-center gap-3">
                            <span>Email: {prof.email}</span>
                            <span>• Emp ID: {prof.employeeId || prof.id}</span>
                            <span>• Mobile: {prof.contact || 'N/A'}</span>
                            <span>
                              • Scoped Colonies:{' '}
                              <strong className="text-slate-700">
                                {(prof.assignedColonies || []).slice(0, 3).join(', ')}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Admin Approval Status + Scope Controls */}
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          disabled={!isActualSuperAdmin || isMaster}
                          value={approval}
                          onChange={e => {
                            staffPermissionService.setApprovalStatus(prof.email, e.target.value as any);
                            showToast(`Updated approval status for ${prof.name} to ${e.target.value}`);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border ${
                            approval === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : approval === 'Pending Approval'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          }`}
                        >
                          <option value="Approved">✓ Approved</option>
                          <option value="Pending Approval">⏳ Pending Approval</option>
                          <option value="Revoked">✕ Access Revoked</option>
                        </select>

                        <button
                          disabled={!isActualSuperAdmin || isMaster}
                          onClick={() => {
                            staffPermissionService.updateStaffPermission(prof.email, {
                              canViewAllRecords: !prof.permissions.canViewAllRecords,
                            });
                            showToast(`Updated Record Scope for ${prof.name}`);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-black border cursor-pointer ${
                            prof.permissions.canViewAllRecords
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          {prof.permissions.canViewAllRecords
                            ? 'Scope: All Office Records'
                            : `Scope: Beat (${prof.beat}) & Own Entries`}
                        </button>

                        <button
                          onClick={() => loadStaffIntoForm(prof)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold cursor-pointer"
                        >
                          Edit Full Profile
                        </button>
                      </div>
                    </div>

                    {/* 5 Selectable Service Modules Toggle Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mt-3">
                      {SERVICE_MODULE_LABELS.map(mod => {
                        const isEnabled = isMaster ? true : Boolean(modules[mod.key]);
                        return (
                          <button
                            key={mod.key}
                            type="button"
                            disabled={!isActualSuperAdmin || isMaster}
                            onClick={() => {
                              staffPermissionService.toggleServiceModule(prof.email, mod.key, !isEnabled);
                              showToast(
                                `${!isEnabled ? 'Enabled' : 'Restricted'} ${mod.shortLabel} for ${prof.name}`
                              );
                            }}
                            className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                              isEnabled
                                ? 'bg-white border-emerald-300 shadow-xs'
                                : 'bg-slate-100 border-slate-200 opacity-60'
                            } ${isActualSuperAdmin && !isMaster ? 'cursor-pointer hover:border-slate-400' : ''}`}
                          >
                            <div>
                              <div className="text-[11px] font-black text-slate-900">{mod.shortLabel}</div>
                              <div className="text-[10px] font-bold text-slate-500">
                                {isEnabled ? 'Authorized' : 'Restricted'}
                              </div>
                            </div>
                            {isEnabled ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* Secure CSV Import & Pre-Save Analysis Modal */}
      <StaffCsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onImportComplete={(summaryMsg) => {
          refreshData();
          showToast(summaryMsg);
        }}
      />
    </div>
  );
};

export default StaffMasterView;

