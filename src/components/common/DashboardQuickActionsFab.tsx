import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronUp,
  ClipboardList,
  Lock,
  MapPin,
  Plus,
  Search,
  Target,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { customerService } from '../../services/customerService';
import { staffPermissionService } from '../../services/staffPermissionService';
import { featureVisibilityService } from '../../services/featureVisibilityService';
import { xpeedoOpsService } from '../../services/xpeedoOpsService';
import { commonDataCentreService } from '../../services/commonDataCentreService';
import { SearchConsoleDuplicatePanel } from './SearchConsoleDuplicatePanel';
import type { Property } from '../../types/models';

type QuickActionMode = 'TASK' | 'LEAD' | 'PROPERTY' | null;

const QUICK_SCHEME_OPTIONS = [
  { code: 'SSA', name: 'Sukanya Samriddhi Account (SSA)', defaultVal: 50000 },
  { code: 'IPPB', name: 'IPPB Digital / Merchant Account', defaultVal: 10000 },
  { code: 'PLI', name: 'PLI Suraksha / Santosh Insurance', defaultVal: 500000 },
  { code: 'RPLI', name: 'Rural PLI Gram Suraksha', defaultVal: 200000 },
  { code: 'PPF', name: 'Public Provident Fund (PPF)', defaultVal: 100000 },
  { code: 'SCSS', name: 'Senior Citizen Savings Scheme (SCSS)', defaultVal: 300000 },
  { code: 'NSC', name: 'National Savings Certificate (NSC)', defaultVal: 150000 },
  { code: 'MIS', name: 'Post Office Monthly Income Scheme (MIS)', defaultVal: 200000 },
  { code: 'RD', name: '5-Year Recurring Deposit (RD)', defaultVal: 60000 },
  { code: 'CELC', name: 'Aadhaar CELC / Mobile Update', defaultVal: 50 },
] as const;

const TASK_PRESETS = [
  'Doorstep KYC & Address Verification',
  'Scheme Passbook & Proposal Collection',
  'Property Occupancy Sweep',
] as const;

interface DashboardQuickActionsFabProps {
  /** Optional callback so parent dashboards can refresh local state immediately if needed */
  onActionCompleted?: () => void;
}

export default function DashboardQuickActionsFab({
  onActionCompleted,
}: DashboardQuickActionsFabProps) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<QuickActionMode>(null);
  const [toast, setToast] = useState<{
    message: string;
    route?: string;
    routeLabel?: string;
  } | null>(null);
  const [visTick, setVisTick] = useState(0);

  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubVis = featureVisibilityService.subscribe(() => setVisTick((v) => v + 1));
    const unsubCust = customerService.subscribe(() => setVisTick((v) => v + 1));
    const unsubOps = xpeedoOpsService.subscribe(() => setVisTick((v) => v + 1));
    return () => {
      unsubVis();
      unsubCust();
      unsubOps();
    };
  }, []);

  const currentProfile = useMemo(
    () => staffPermissionService.getActiveSession() || userProfile,
    [userProfile, visTick]
  );

  const brandIdentity = useMemo(
    () => featureVisibilityService.getBrandIdentity(currentProfile),
    [currentProfile, visTick]
  );
  const isWhiteLabel = brandIdentity.isWhiteLabel;
  const hasAiAssistantFab =
    !isWhiteLabel && featureVisibilityService.isFeatureVisible(currentProfile, 'aiAssistant');
  const canLogLeads = featureVisibilityService.isFeatureVisible(
    currentProfile,
    'leadsAndSchemes'
  );
  const canReadPropertyDetails = staffPermissionService.canReadPropertyDetails(currentProfile);
  const canSearchProperties = staffPermissionService.canSearchProperties(currentProfile);
  const isRestrictedBeatStaff = staffPermissionService.isPostmanOrGds(currentProfile);
  const isAdminOrManager = useMemo(() => {
    const r = String(currentProfile?.role || '').toUpperCase();
    return (
      staffPermissionService.isSuperAdmin(currentProfile) ||
      ['OWNER', 'DEVELOPER', 'MASTER_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'DIVISIONAL_HEAD', 'DISTRICT_MANAGER', 'PROJECT_MANAGER', 'DEPARTMENT_MANAGER', 'TEAM_LEADER', 'BUSINESS_ADMIN'].includes(r)
    );
  }, [currentProfile]);

  const activeWorkspace = xpeedoOpsService.getActiveWorkspaceFilter();
  const opsProjects = useMemo(
    () => xpeedoOpsService.getProjects(activeWorkspace),
    [activeWorkspace, visTick]
  );

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const defaultBeat = currentProfile?.beat && currentProfile.beat !== 'All Beats'
    ? currentProfile.beat
    : 'Beat 2';
  const defaultPincode = currentProfile?.officePincode || '324009';
  const defaultColony = currentProfile?.assignedColonies?.[0] && currentProfile.assignedColonies[0] !== 'All Colonies'
    ? currentProfile.assignedColonies[0]
    : 'Keshavpura Sector 7';

  // --- TASK MODAL STATE ---
  const [taskTrack, setTaskTrack] = useState<'FIELD' | 'OPS'>('FIELD');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('Doorstep Delivery');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [taskBeat, setTaskBeat] = useState(defaultBeat);
  const [taskLocation, setTaskLocation] = useState(defaultColony);
  const [taskDueDate, setTaskDueDate] = useState(todayStr);
  const [taskHouseholdsTarget, setTaskHouseholdsTarget] = useState(5);
  const [taskProjectId, setTaskProjectId] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskError, setTaskError] = useState<string | null>(null);

  // --- LEAD MODAL STATE ---
  const [leadName, setLeadName] = useState('');
  const [leadMobile, setLeadMobile] = useState('');
  const [leadAddress, setLeadAddress] = useState(defaultColony);
  const [leadSchemeCode, setLeadSchemeCode] = useState<string>('SSA');
  const [leadEstimatedVal, setLeadEstimatedVal] = useState<number>(50000);
  const [leadPriority, setLeadPriority] = useState<'High' | 'Medium' | 'Low' | 'Urgent'>('High');
  const [leadRequirement, setLeadRequirement] = useState('');
  const [leadFollowUpDate, setLeadFollowUpDate] = useState(todayStr);
  const [leadError, setLeadError] = useState<string | null>(null);

  // --- PROPERTY MODAL STATE ---
  const [propMode, setPropMode] = useState<'EXISTING' | 'ALLOTTED_ENTRY'>(
    canReadPropertyDetails || canSearchProperties ? 'EXISTING' : 'ALLOTTED_ENTRY'
  );
  const [propQuery, setPropQuery] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [propStatus, setPropStatus] = useState<'Occupied' | 'Vacant' | 'Rented' | 'Commercial' | 'Mixed'>('Occupied');
  const [propVerified, setPropVerified] = useState(true);
  const [propSector, setPropSector] = useState('');
  const [propNotes, setPropNotes] = useState('');
  // Allotted-area quick entry fields
  const [newPropHouseNo, setNewPropHouseNo] = useState('');
  const [newPropColony, setNewPropColony] = useState(defaultColony);
  const [newPropSector, setNewPropSector] = useState('Sector 1');
  const [newPropPincode, setNewPropPincode] = useState(defaultPincode);
  const [newPropBeat, setNewPropBeat] = useState(defaultBeat);
  const [newPropType, setNewPropType] = useState<'House' | 'Commercial' | 'Mixed' | 'Flat / Residency'>('House');
  const [newPropResident, setNewPropResident] = useState('');
  const [newPropMobile, setNewPropMobile] = useState('');
  const [propError, setPropError] = useState<string | null>(null);

  const scopedProperties = useMemo<Property[]>(() => {
    if (!canReadPropertyDetails && !canSearchProperties) return [];
    return customerService.getScopedProperties(currentProfile);
  }, [canReadPropertyDetails, canSearchProperties, currentProfile, visTick]);

  const filteredProperties = useMemo(() => {
    const q = propQuery.trim().toLowerCase();
    const list = !q
      ? scopedProperties
      : scopedProperties.filter((p) => {
          const code = (p.propertyCode || p.id || '').toLowerCase();
          const house = (p.housePlotNumber || p.houseNo || '').toLowerCase();
          const area = (p.colony || p.area || p.sector || '').toLowerCase();
          const residents = (p.residentNames || []).join(' ').toLowerCase();
          return (
            code.includes(q) ||
            house.includes(q) ||
            area.includes(q) ||
            residents.includes(q) ||
            (p.pincode || '').includes(q)
          );
        });
    return list.slice(0, 25);
  }, [scopedProperties, propQuery]);

  const leadDupCheck = useMemo(() => {
    const digits = leadMobile.replace(/\D/g, '');
    if (digits.length < 10 && !leadName.trim()) {
      return { hasMatch: false, matchReasons: [], matches: [] };
    }
    return commonDataCentreService.detectCustomerDuplicates({
      mobile: digits,
      name: leadName,
      colony: leadAddress,
    });
  }, [leadMobile, leadName, leadAddress]);

  const leadTerritoryCheck = useMemo(() => {
    return staffPermissionService.isTerritoryAllowedForProperty(currentProfile, {
      beatNo: defaultBeat,
      pincode: defaultPincode,
      colony: leadAddress.trim() || defaultColony,
    });
  }, [currentProfile, defaultBeat, defaultPincode, leadAddress, defaultColony]);

  const propDupCheck = useMemo(() => {
    if (propMode === 'EXISTING') {
      const target = scopedProperties.find((p) => p.id === selectedPropertyId);
      if (!target) return { hasMatch: false, matchReasons: [], matches: [] };
      return commonDataCentreService.detectPropertyDuplicates({
        excludeId: target.id || target.propertyCode,
        houseNo: target.housePlotNumber || target.houseNo,
        colony: target.colony || target.area,
        sector: propSector || target.sector,
        pincode: target.pincode,
        beatNo: target.beatNo,
      });
    }
    if (!newPropHouseNo.trim() && !newPropColony.trim()) {
      return { hasMatch: false, matchReasons: [], matches: [] };
    }
    return commonDataCentreService.detectPropertyDuplicates({
      houseNo: newPropHouseNo,
      colony: newPropColony,
      sector: newPropSector,
      pincode: newPropPincode,
      beatNo: newPropBeat,
    });
  }, [
    propMode,
    scopedProperties,
    selectedPropertyId,
    propSector,
    newPropHouseNo,
    newPropColony,
    newPropSector,
    newPropPincode,
    newPropBeat,
  ]);

  const propTerritoryCheck = useMemo(() => {
    if (propMode === 'EXISTING') {
      const target = scopedProperties.find((p) => p.id === selectedPropertyId);
      if (!target) return { allowed: true };
      return staffPermissionService.isTerritoryAllowedForProperty(currentProfile, {
        beatNo: target.beatNo,
        pincode: target.pincode,
        colony: target.colony || target.area,
      });
    }
    return staffPermissionService.isTerritoryAllowedForProperty(currentProfile, {
      beatNo: newPropBeat || defaultBeat,
      pincode: newPropPincode || defaultPincode,
      colony: newPropColony || defaultColony,
    });
  }, [
    propMode,
    scopedProperties,
    selectedPropertyId,
    currentProfile,
    newPropBeat,
    newPropPincode,
    newPropColony,
    defaultBeat,
    defaultPincode,
    defaultColony,
  ]);

  const matchedLeadCustomer = useMemo(() => {
    const digits = leadMobile.replace(/\D/g, '');
    if (digits.length < 10) return undefined;
    return customerService.getCustomerByMobile(digits);
  }, [leadMobile]);

  useEffect(() => {
    if (matchedLeadCustomer && !leadName.trim()) {
      setLeadName(matchedLeadCustomer.name);
      const addr =
        matchedLeadCustomer.colony ||
        matchedLeadCustomer.area ||
        matchedLeadCustomer.address?.area ||
        '';
      if (addr) setLeadAddress(addr);
    }
  }, [matchedLeadCustomer]);

  // Keyboard Escape + outside click handler for floating menu
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
        } else if (menuOpen) {
          setMenuOpen(false);
        }
      }
    };
    const onMouseDown = (e: MouseEvent) => {
      if (
        menuOpen &&
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [menuOpen, activeModal]);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const openModal = (mode: QuickActionMode) => {
    setMenuOpen(false);
    setTaskError(null);
    setLeadError(null);
    setPropError(null);

    if (mode === 'TASK') {
      setTaskTrack(isAdminOrManager && !isWhiteLabel && opsProjects.length > 0 ? 'OPS' : 'FIELD');
      setTaskBeat(defaultBeat);
      setTaskLocation(defaultColony);
      setTaskDueDate(todayStr);
      if (opsProjects.length > 0 && !taskProjectId) {
        setTaskProjectId(opsProjects[0].id);
      }
    } else if (mode === 'LEAD') {
      setLeadAddress(defaultColony);
      setLeadFollowUpDate(todayStr);
    } else if (mode === 'PROPERTY') {
      const canSelectExisting = canReadPropertyDetails || canSearchProperties;
      setPropMode(canSelectExisting && scopedProperties.length > 0 ? 'EXISTING' : 'ALLOTTED_ENTRY');
      setNewPropBeat(defaultBeat);
      setNewPropPincode(defaultPincode);
      setNewPropColony(defaultColony);
      if (canSelectExisting && scopedProperties.length > 0 && !selectedPropertyId) {
        const first = scopedProperties[0];
        setSelectedPropertyId(first.id);
        setPropStatus(
          first.status === 'Address Left' ? 'Vacant' : first.status
        );
        setPropVerified(first.verificationStatus ?? true);
        setPropSector(first.sector || '');
        setPropNotes(first.notes || first.addressRemarks || '');
      }
    }

    setActiveModal(mode);
  };

  const handleSelectExistingProperty = (prop: Property) => {
    setSelectedPropertyId(prop.id);
    setPropStatus(prop.status === 'Address Left' ? 'Vacant' : prop.status);
    setPropVerified(prop.verificationStatus ?? true);
    setPropSector(prop.sector || '');
    setPropNotes(prop.notes || prop.addressRemarks || '');
    setPropError(null);
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTaskError(null);
    if (!taskTitle.trim()) {
      setTaskError('Task title is required.');
      return;
    }

    const actorName = currentProfile?.name || 'Field Staff';
    const actorRole = currentProfile?.designationType || currentProfile?.role || 'STAFF';

    if (taskTrack === 'OPS' && opsProjects.length > 0) {
      const targetProj = opsProjects.find((p) => p.id === taskProjectId) || opsProjects[0];
      const created = xpeedoOpsService.createTask(
        {
          title: taskTitle.trim(),
          description: taskNotes.trim() || `${taskCategory} · ${taskLocation}`,
          clientId: targetProj.clientId,
          workspaceId: targetProj.workspaceId,
          projectId: targetProj.id,
          departmentId: targetProj.departmentId,
          assigneeId: currentProfile?.id || currentProfile?.employeeId || 'STAFF-01',
          assigneeName: actorName,
          status: 'Assigned',
          priority: taskPriority,
          startDate: todayStr,
          dueDate: taskDueDate || todayStr,
          estimatedHours: 2,
          blockedByTaskIds: [],
          approvalStage: 'NONE',
          createdBy: actorName,
          assignedBeat: taskBeat,
          assignedOffice: currentProfile?.assignedOffice || 'Dadabari S.O.',
        },
        actorName,
        actorRole
      );
      setToast({
        message: `Task ${created.code} created for ${targetProj.title}.`,
        route: '/task-management',
        routeLabel: 'Open Tasks',
      });
    } else {
      const created = customerService.addTask({
        title: taskTitle.trim(),
        category: taskCategory,
        assignedTo: actorName,
        beatNo: taskBeat,
        location: taskLocation.trim() || defaultColony,
        priority: taskPriority,
        dueDate: taskDueDate || todayStr,
        householdsTarget: Math.max(1, Number(taskHouseholdsTarget) || 5),
        colonyName: taskLocation.trim() || defaultColony,
      });
      setToast({
        message: `Field task ${created.id} logged for ${taskBeat}.`,
        route: '/tasks',
        routeLabel: 'View Beat Tasks',
      });
    }

    setTaskTitle('');
    setTaskNotes('');
    setActiveModal(null);
    onActionCompleted?.();
  };

  const handleLogLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError(null);

    const cleanDigits = leadMobile.replace(/\D/g, '').slice(-10);
    if (!leadName.trim()) {
      setLeadError('Customer name is required.');
      return;
    }
    if (cleanDigits.length !== 10) {
      setLeadError('Enter a valid 10-digit mobile number.');
      return;
    }

    const schemeObj =
      QUICK_SCHEME_OPTIONS.find((s) => s.code === leadSchemeCode) || QUICK_SCHEME_OPTIONS[0];
    const commitRes = commonDataCentreService.verifyAndCommitCustomer(
      currentProfile,
      {
        id: matchedLeadCustomer?.id,
        masterId: matchedLeadCustomer?.masterId,
        name: leadName.trim(),
        mobile: cleanDigits,
        beatNo: defaultBeat,
        colony: leadAddress.trim() || defaultColony,
        area: leadAddress.trim() || defaultColony,
        pincode: defaultPincode,
        financialInterest: schemeObj.name,
        remarks: leadRequirement.trim(),
        enteredBy: currentProfile?.email || currentProfile?.id || 'field-staff',
        enteredByName: currentProfile?.name || 'Field Staff',
        verificationStatus: 'Verified',
      },
      {
        remark: leadRequirement.trim(),
        isIntentionalEdit: Boolean(matchedLeadCustomer),
        source: 'Dashboard Quick Actions',
        leadData: {
          customerId: matchedLeadCustomer?.id || '',
          customerName: leadName.trim(),
          customerMobile: cleanDigits,
          customerAddress: leadAddress.trim() || defaultColony,
          productCode: schemeObj.code,
          productName: schemeObj.name,
          requirement:
            leadRequirement.trim() || `${schemeObj.name} onboarding & doorstep KYC`,
          source: 'Quick Actions Floating Bar',
          sourceChannel: 'Doorstep Survey',
          sourceStaffId: currentProfile?.employeeId || currentProfile?.id,
          sourceStaffName: currentProfile?.name,
          stage: 'New',
          priority: leadPriority,
          leadScore: leadPriority === 'Urgent' || leadPriority === 'High' ? 90 : 75,
          estimatedValue: Number(leadEstimatedVal) || schemeObj.defaultVal,
          beatNo: defaultBeat,
          pincode: defaultPincode,
          officeId: currentProfile?.officeId || 'DADABARI_SO',
          postOfficeName: currentProfile?.subOffice || 'Dadabari S.O.',
          assignedStaffId: currentProfile?.id,
          assignedStaffName: currentProfile?.name || 'Field Staff',
          brandId: currentProfile?.brandId || 'india-post',
          brandName: currentProfile?.brandName || 'India Post',
          nextAction: 'Doorstep KYC & Document Collection',
          nextFollowUpDate: leadFollowUpDate || todayStr,
        },
      }
    );

    if (!commitRes.success || !commitRes.linkedLead) {
      setLeadError(commitRes.error || 'Three-Layer Verification blocked this lead entry.');
      return;
    }

    setToast({
      message: `3-Layer Verified Lead logged for ${commitRes.linkedLead.customerName} (${commitRes.linkedLead.productCode}).`,
      route: '/leads',
      routeLabel: 'View Pipeline',
    });

    setLeadName('');
    setLeadMobile('');
    setLeadRequirement('');
    setActiveModal(null);
    onActionCompleted?.();
  };

  const handlePropertyUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPropError(null);

    if (propMode === 'EXISTING') {
      const target = scopedProperties.find((p) => p.id === selectedPropertyId);
      if (!target) {
        setPropError('Select a property from your scoped list to update.');
        return;
      }

      const res = commonDataCentreService.verifyAndCommitProperty(
        currentProfile,
        {
          id: target.id,
          propertyCode: target.propertyCode,
          houseNo: target.housePlotNumber || target.houseNo || '',
          colony: target.colony || target.area || defaultColony,
          sector: propSector.trim() || target.sector || 'Sector 1',
          pincode: target.pincode || defaultPincode,
          beatNo: target.beatNo || defaultBeat,
          officeId: target.officeId,
          propertyType: target.propertyType || 'House',
          status: propStatus,
          verificationStatus: propVerified,
          notes: propNotes.trim(),
        },
        {
          remark: propNotes.trim(),
          isIntentionalEdit: true,
        }
      );

      if (!res.success || !res.data) {
        setPropError(res.error || 'Three-Layer Verification blocked property update.');
        return;
      }

      setToast({
        message: `3-Layer Verified: Property ${res.data.propertyCode || res.data.id} marked ${propStatus}.`,
        route: canReadPropertyDetails ? '/properties' : undefined,
        routeLabel: canReadPropertyDetails ? 'Open Directory' : undefined,
      });
      setActiveModal(null);
      onActionCompleted?.();
      return;
    }

    // Allotted-Area Property Entry / Update (enforces 3-layer verification + beat & PIN boundaries)
    const res = commonDataCentreService.verifyAndCommitProperty(
      currentProfile,
      {
        houseNo: newPropHouseNo.trim(),
        colony: newPropColony.trim(),
        sector: newPropSector.trim() || 'Sector 1',
        pincode: newPropPincode.trim() || defaultPincode,
        beatNo: newPropBeat.trim() || defaultBeat,
        propertyType: newPropType,
        status: propStatus === 'Rented' ? 'Occupied' : propStatus,
        residentOrOwnerName: newPropResident.trim() || undefined,
        mobile: newPropMobile.trim() || undefined,
        notes: propNotes.trim() || undefined,
      },
      {
        remark: propNotes.trim(),
      }
    );

    if (!res.success || !res.data) {
      setPropError(res.error || 'Unable to save property update.');
      return;
    }

    setToast({
      message: `3-Layer Verified Property ${res.data.propertyCode || newPropHouseNo} saved in ${newPropBeat}.`,
      route: canReadPropertyDetails ? '/properties' : undefined,
      routeLabel: canReadPropertyDetails ? 'Open Directory' : undefined,
    });
    setNewPropHouseNo('');
    setNewPropResident('');
    setNewPropMobile('');
    setPropNotes('');
    setActiveModal(null);
    onActionCompleted?.();
  };

  // Position cleanly without overlapping MobileFAB (mobile bottom-right) or AI Field Agent (desktop bottom-right)
  const floatingPositionClass = hasAiAssistantFab
    ? 'fixed bottom-6 left-4 md:left-auto md:right-52 md:bottom-6 z-40'
    : 'fixed bottom-6 left-4 md:left-auto md:right-6 md:bottom-6 z-40';

  const contextSummary = isAdminOrManager
    ? activeWorkspace === 'ALL'
      ? 'All Workspaces · Command'
      : `${activeWorkspace} · Command`
    : `${defaultBeat} · PIN ${defaultPincode}`;

  return (
    <>
      {/* Toast Feedback Banner */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-20 left-4 right-4 sm:left-auto ${
            hasAiAssistantFab ? 'md:right-52' : 'md:right-6'
          } z-40 sm:w-96 bg-slate-900 text-white border border-slate-700 rounded-xl shadow-xl px-4 py-3 flex items-center justify-between gap-3`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="text-xs font-medium text-slate-100 truncate">
              {toast.message}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {toast.route && (
              <button
                type="button"
                onClick={() => {
                  navigate(toast.route!);
                  setToast(null);
                }}
                className="text-[11px] font-semibold text-blue-300 hover:text-blue-200 whitespace-nowrap cursor-pointer"
              >
                {toast.routeLabel || 'View'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Persistent Floating Quick Actions Control */}
      <div ref={menuContainerRef} className={floatingPositionClass}>
        {menuOpen && (
          <div
            role="menu"
            aria-label="Dashboard Quick Actions"
            className="absolute bottom-14 left-0 md:left-auto md:right-0 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
                  Quick Actions
                </div>
                <div className="text-[11px] text-slate-500 truncate">{contextSummary}</div>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close Quick Actions menu"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/70 transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-1.5 space-y-1">
              <button
                type="button"
                role="menuitem"
                onClick={() => openModal('TASK')}
                className="w-full min-h-[44px] px-3 py-2.5 rounded-lg hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 text-left transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <ClipboardList size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900">New Task</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Assign beat task or ops follow-up
                  </div>
                </div>
                <ArrowRight
                  size={14}
                  className="text-slate-400 group-hover:text-slate-700 shrink-0"
                />
              </button>

              {canLogLeads && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => openModal('LEAD')}
                  className="w-full min-h-[44px] px-3 py-2.5 rounded-lg hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 text-left transition cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Target size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900">Log Lead</div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Capture PLI, SSY, IPPB or service interest
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-slate-400 group-hover:text-slate-700 shrink-0"
                  />
                </button>
              )}

              <button
                type="button"
                role="menuitem"
                onClick={() => openModal('PROPERTY')}
                className="w-full min-h-[44px] px-3 py-2.5 rounded-lg hover:bg-slate-50 active:bg-slate-100 flex items-center gap-3 text-left transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <Building2 size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900">Property Update</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {canReadPropertyDetails
                      ? 'Update status, verification or beat mapping'
                      : 'Log property status in allotted beat'}
                  </div>
                </div>
                <ArrowRight
                  size={14}
                  className="text-slate-400 group-hover:text-slate-700 shrink-0"
                />
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          id="dashboard-quick-actions-fab"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="Quick Actions"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="min-h-[44px] px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl border border-slate-700 shadow-lg flex items-center gap-2 text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {menuOpen ? (
            <X size={16} className="text-slate-300 shrink-0" />
          ) : (
            <Zap size={16} className="text-amber-400 shrink-0" />
          )}
          <span>Quick Actions</span>
          <ChevronUp
            size={14}
            className={`text-slate-400 shrink-0 transition-transform ${
              menuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Quick Action Modal Overlay */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {activeModal === 'TASK' && (
                  <ClipboardList size={18} className="text-blue-400 shrink-0" />
                )}
                {activeModal === 'LEAD' && (
                  <Target size={18} className="text-blue-400 shrink-0" />
                )}
                {activeModal === 'PROPERTY' && (
                  <Building2 size={18} className="text-emerald-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    {activeModal === 'TASK' && 'Quick Create Task'}
                    {activeModal === 'LEAD' && 'Quick Log Scheme / Service Lead'}
                    {activeModal === 'PROPERTY' && 'Quick Property Status Update'}
                  </h3>
                  <p className="text-[11px] text-slate-300 truncate">{contextSummary}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* 1. CREATE NEW TASK FORM */}
            {activeModal === 'TASK' && (
              <form onSubmit={handleCreateTaskSubmit} className="p-5 space-y-4 text-xs">
                {isAdminOrManager && !isWhiteLabel && opsProjects.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setTaskTrack('FIELD')}
                      className={`py-2 px-3 rounded-md font-semibold transition cursor-pointer whitespace-nowrap ${
                        taskTrack === 'FIELD'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Field Beat Task
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskTrack('OPS')}
                      className={`py-2 px-3 rounded-md font-semibold transition cursor-pointer whitespace-nowrap ${
                        taskTrack === 'OPS'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Enterprise Ops Task
                    </button>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Task Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g., Doorstep SSY KYC collection at Keshavpura"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    autoFocus
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {TASK_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setTaskTitle(preset)}
                        className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition cursor-pointer"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {taskTrack === 'OPS' && opsProjects.length > 0 ? (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Project
                    </label>
                    <select
                      value={taskProjectId}
                      onChange={(e) => setTaskProjectId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    >
                      {opsProjects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.code} — {proj.title} ({proj.workspaceId})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        Category
                      </label>
                      <select
                        value={taskCategory}
                        onChange={(e) => setTaskCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="Doorstep Delivery">Doorstep Delivery</option>
                        <option value="Scheme Follow-up">Scheme Follow-up (PLI/SSY/IPPB)</option>
                        <option value="Property Verification">Property Verification</option>
                        <option value="KYC / Address Update">KYC / Address Update</option>
                        <option value="General Field Visit">General Field Visit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        Beat Assignment
                      </label>
                      <input
                        type="text"
                        value={taskBeat}
                        onChange={(e) => setTaskBeat(e.target.value)}
                        disabled={isRestrictedBeatStaff}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 disabled:bg-slate-100 disabled:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Priority
                    </label>
                    <select
                      value={taskPriority}
                      onChange={(e) =>
                        setTaskPriority(e.target.value as 'High' | 'Medium' | 'Low')
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  {taskTrack === 'FIELD' && (
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        Households Target
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={taskHouseholdsTarget}
                        onChange={(e) =>
                          setTaskHouseholdsTarget(Number(e.target.value) || 1)
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    {taskTrack === 'OPS' ? 'Notes / Scope' : 'Colony / Target Location'}
                  </label>
                  {taskTrack === 'OPS' ? (
                    <textarea
                      rows={2}
                      value={taskNotes}
                      onChange={(e) => setTaskNotes(e.target.value)}
                      placeholder="Operational details or handoff remarks..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  ) : (
                    <input
                      type="text"
                      value={taskLocation}
                      onChange={(e) => setTaskLocation(e.target.value)}
                      placeholder="Colony, Sector or Road"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  )}
                </div>

                {taskError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{taskError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus size={15} />
                    <span>Create Task</span>
                  </button>
                </div>
              </form>
            )}

            {/* 2. LOG LEAD FORM */}
            {activeModal === 'LEAD' && (
              <form onSubmit={handleLogLeadSubmit} className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      10-Digit Mobile <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={leadMobile}
                      onChange={(e) =>
                        setLeadMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      placeholder="e.g., 9829012345"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      autoFocus
                    />
                    {matchedLeadCustomer && (
                      <div className="mt-1 text-[11px] font-medium text-emerald-700">
                        Matched existing customer: {matchedLeadCustomer.name}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Customer Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder="Full name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Scheme / Service
                    </label>
                    <select
                      value={leadSchemeCode}
                      onChange={(e) => {
                        const next = e.target.value;
                        setLeadSchemeCode(next);
                        const match = QUICK_SCHEME_OPTIONS.find((s) => s.code === next);
                        if (match) setLeadEstimatedVal(match.defaultVal);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    >
                      {QUICK_SCHEME_OPTIONS.map((opt) => (
                        <option key={opt.code} value={opt.code}>
                          {opt.code} — {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Est. Value / Sum Assured (INR)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={leadEstimatedVal}
                      onChange={(e) => setLeadEstimatedVal(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Priority
                    </label>
                    <select
                      value={leadPriority}
                      onChange={(e) =>
                        setLeadPriority(
                          e.target.value as 'High' | 'Medium' | 'Low' | 'Urgent'
                        )
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Urgent">Urgent</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Follow-up Date
                    </label>
                    <input
                      type="date"
                      value={leadFollowUpDate}
                      onChange={(e) => setLeadFollowUpDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 tabular-nums focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Area / Colony
                    </label>
                    <input
                      type="text"
                      value={leadAddress}
                      onChange={(e) => setLeadAddress(e.target.value)}
                      placeholder="Colony / Sector"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Requirement / Notes
                    </label>
                    <input
                      type="text"
                      value={leadRequirement}
                      onChange={(e) => setLeadRequirement(e.target.value)}
                      placeholder="e.g., Form-1 pickup at 4 PM"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <SearchConsoleDuplicatePanel
                  entityType="CUSTOMER"
                  customerCheck={leadDupCheck}
                  remark={leadRequirement}
                  onRemarkChange={setLeadRequirement}
                  forceShowRemark={Boolean(matchedLeadCustomer)}
                  layer1Ok={Boolean(leadName.trim().length >= 2 && leadMobile.replace(/\D/g, '').length === 10)}
                  layer2Ok={leadTerritoryCheck.allowed}
                  layer2Reason={leadTerritoryCheck.reason}
                />

                {leadError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{leadError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Target size={15} />
                    <span>Save Lead</span>
                  </button>
                </div>
              </form>
            )}

            {/* 3. PROPERTY UPDATE FORM */}
            {activeModal === 'PROPERTY' && (
              <form onSubmit={handlePropertyUpdateSubmit} className="p-5 space-y-4 text-xs">
                {canReadPropertyDetails || canSearchProperties ? (
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setPropMode('EXISTING');
                        setPropError(null);
                      }}
                      className={`py-2 px-3 rounded-md font-semibold transition cursor-pointer whitespace-nowrap ${
                        propMode === 'EXISTING'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Update Existing Property
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPropMode('ALLOTTED_ENTRY');
                        setPropError(null);
                      }}
                      className={`py-2 px-3 rounded-md font-semibold transition cursor-pointer whitespace-nowrap ${
                        propMode === 'ALLOTTED_ENTRY'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Allotted Area Entry
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-2.5">
                    <Lock size={15} className="text-slate-500 mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-900">
                        Allotted Territory Mode ({defaultBeat} · PIN {defaultPincode})
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Open property directory search is restricted for your role. You can log or
                        update properties strictly inside your allotted beat and PIN.
                      </div>
                    </div>
                  </div>
                )}

                {propMode === 'EXISTING' && (canReadPropertyDetails || canSearchProperties) ? (
                  <>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        Find Scoped Property
                      </label>
                      <div className="relative mb-2">
                        <Search
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="text"
                          value={propQuery}
                          onChange={(e) => setPropQuery(e.target.value)}
                          placeholder="Filter by house no., colony, code, or resident..."
                          className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                          autoFocus
                        />
                      </div>

                      {filteredProperties.length === 0 ? (
                        <div className="p-3 border border-slate-200 rounded-lg text-slate-500 text-center">
                          No matching scoped properties found. Switch to Allotted Area Entry to add
                          one.
                        </div>
                      ) : (
                        <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                          {filteredProperties.map((prop) => {
                            const isSelected = prop.id === selectedPropertyId;
                            return (
                              <button
                                key={prop.id}
                                type="button"
                                onClick={() => handleSelectExistingProperty(prop)}
                                className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-50 text-slate-900'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="font-semibold truncate">
                                    {prop.housePlotNumber || prop.houseNo || prop.propertyCode || prop.id}{' '}
                                    · {prop.colony || prop.area || 'Dadabari'}
                                  </div>
                                  <div className="text-[11px] text-slate-500 truncate">
                                    Beat {prop.beatNo || '—'} · PIN {prop.pincode} ·{' '}
                                    {(prop.residentNames || [])[0] || prop.status}
                                  </div>
                                </div>
                                <span className="text-[11px] font-semibold text-slate-600 shrink-0">
                                  {prop.status}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Occupancy Status
                        </label>
                        <select
                          value={propStatus}
                          onChange={(e) =>
                            setPropStatus(
                              e.target.value as
                                | 'Occupied'
                                | 'Vacant'
                                | 'Rented'
                                | 'Commercial'
                                | 'Mixed'
                            )
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                        >
                          <option value="Occupied">Occupied</option>
                          <option value="Vacant">Vacant</option>
                          <option value="Rented">Rented</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Mixed">Mixed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Sector / Block
                        </label>
                        <input
                          type="text"
                          value={propSector}
                          onChange={(e) => setPropSector(e.target.value)}
                          placeholder="e.g., Sector 7"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={propVerified}
                        onChange={(e) => setPropVerified(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                      />
                      <span>Mark doorstep verification confirmed</span>
                    </label>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          House / Plot / Shop No. <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newPropHouseNo}
                          onChange={(e) => setNewPropHouseNo(e.target.value)}
                          placeholder="e.g., 7-B-14"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Colony / Locality <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newPropColony}
                          onChange={(e) => setNewPropColony(e.target.value)}
                          placeholder="e.g., Keshavpura Sector 7"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Sector
                        </label>
                        <input
                          type="text"
                          value={newPropSector}
                          onChange={(e) => setNewPropSector(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Beat
                        </label>
                        <input
                          type="text"
                          value={newPropBeat}
                          onChange={(e) => setNewPropBeat(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          PIN Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={newPropPincode}
                          onChange={(e) =>
                            setNewPropPincode(e.target.value.replace(/\D/g, '').slice(0, 6))
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Property Type
                        </label>
                        <select
                          value={newPropType}
                          onChange={(e) =>
                            setNewPropType(
                              e.target.value as
                                | 'House'
                                | 'Commercial'
                                | 'Mixed'
                                | 'Flat / Residency'
                            )
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                        >
                          <option value="House">House</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Mixed">Mixed</option>
                          <option value="Flat / Residency">Flat / Residency</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Occupancy Status
                        </label>
                        <select
                          value={propStatus}
                          onChange={(e) =>
                            setPropStatus(
                              e.target.value as 'Occupied' | 'Vacant' | 'Commercial' | 'Mixed'
                            )
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                        >
                          <option value="Occupied">Occupied</option>
                          <option value="Vacant">Vacant</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Mixed">Mixed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Resident / Owner (Optional)
                        </label>
                        <input
                          type="text"
                          value={newPropResident}
                          onChange={(e) => setNewPropResident(e.target.value)}
                          placeholder="Head of family / shop owner"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1.5">
                          Contact Mobile (Optional)
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={newPropMobile}
                          onChange={(e) =>
                            setNewPropMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
                          }
                          placeholder="10-digit mobile"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Field Remark / Address Note
                  </label>
                  <input
                    type="text"
                    value={propNotes}
                    onChange={(e) => setPropNotes(e.target.value)}
                    placeholder="e.g., Verified occupied; 2 floors, gate near park"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <SearchConsoleDuplicatePanel
                  entityType="PROPERTY"
                  propertyCheck={propDupCheck}
                  remark={propNotes}
                  onRemarkChange={setPropNotes}
                  forceShowRemark={propMode === 'EXISTING'}
                  layer1Ok={
                    propMode === 'EXISTING'
                      ? Boolean(selectedPropertyId)
                      : Boolean((newPropHouseNo.trim() || propStatus === 'Vacant') && newPropColony.trim() && /^\d{6}$/.test(newPropPincode.trim()))
                  }
                  layer2Ok={propTerritoryCheck.allowed}
                  layer2Reason={propTerritoryCheck.reason}
                />

                {propError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{propError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200">
                  {canReadPropertyDetails ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        navigate('/properties');
                      }}
                      className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <MapPin size={14} />
                      <span>Full Directory</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      Territory enforced ({defaultBeat})
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Building2 size={15} />
                      <span>Save Property Update</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
