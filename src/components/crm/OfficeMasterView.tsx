import React, { useState, useEffect, useMemo } from 'react';
import {
  Building,
  Search,
  Download,
  Plus,
  RefreshCw,
  MapPin,
  Users,
  CheckCircle2,
  Shield,
  Filter,
  Layers,
  X,
  Building2,
  Navigation,
  Sparkles,
  FileSpreadsheet,
  Compass,
  ArrowRight,
  Eye,
  Store,
  ShoppingBag,
  Trash2,
  AlertTriangle,
  Briefcase,
  UserPlus,
  Edit3,
  Save,
  ExternalLink,
  Activity,
} from 'lucide-react';
import {
  staffPermissionService,
  xpeedoMasterAdminOfficeConfig,
  BUSINESS_SERVICE_CATEGORIES,
  OFFICE_VARIANT_OPTIONS,
} from '../../services/staffPermissionService';
import { commercialPropertyService } from '../../services/commercialPropertyService';
import { staffProductService } from '../../services/staffProductService';
import {
  BusinessServiceCategory,
  DesignationType,
  DynamicOfficeRecord,
  OfficeVariantType,
  StaffProfile,
} from '../../types/models';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';

type OfficeWorkspaceTab = 'OVERVIEW' | 'STAFF' | 'BEATS' | 'PRODUCTS_VENDORS' | 'DEEP_DIVE';

const QUICK_STAFF_DESIGNATIONS: DesignationType[] = [
  'Sub Postmaster (SPM)',
  'PA (Postal Assistant)',
  'Postman',
  'GDS (BPM / ABPM / Dak Sevak)',
  'District Manager (DM)',
  'Category Manager',
  'District Incharge',
  'Block Incharge',
  'Office Incharge',
  'Last-Mile Rider',
  'Sales & Field Executive',
];

export default function OfficeMasterView({
  indiaPostOwnerAccess = false,
}: {
  indiaPostOwnerAccess?: boolean;
} = {}) {
  const { userProfile } = useAuth();
  const isSuperAdmin =
    staffPermissionService.isSuperAdmin(userProfile) || Boolean(indiaPostOwnerAccess);

  const [offices, setOffices] = useState<DynamicOfficeRecord[]>([]);
  const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<OfficeWorkspaceTab>('OVERVIEW');

  // Division Quick Tabs
  const [activeDivisionTab, setActiveDivisionTab] = useState<'ALL' | 'KOTA' | 'BARAN' | 'BUNDI' | 'OTHERS'>('ALL');

  // Drill-down filters
  const [filterCircle, setFilterCircle] = useState<string>('ALL');
  const [filterDivision, setFilterDivision] = useState<string>('ALL');
  const [filterDistrict, setFilterDistrict] = useState<string>('ALL');
  const [filterOfficeType, setFilterOfficeType] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterVacancy, setFilterVacancy] = useState<'ALL' | 'OCCUPIED' | 'VACANT'>('ALL');
  const [filterPincode, setFilterPincode] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Quick Pincode Radar Lookup State
  const [pincodeRadarInput, setPincodeRadarInput] = useState<string>('');

  // Alerts / In-UI Notifications (zero window.alert / window.confirm)
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setErrorBanner(null);
    setBannerMessage(msg);
    setTimeout(() => setBannerMessage(null), 5500);
  };

  const showError = (msg: string) => {
    setBannerMessage(null);
    setErrorBanner(msg);
    setTimeout(() => setErrorBanner(null), 6500);
  };

  // Safe Vacant-Only Permanent Delete Confirmation Modal
  const [deleteModalOffice, setDeleteModalOffice] = useState<DynamicOfficeRecord | null>(null);

  // Operational Remarks inline draft inside Office Profile Card
  const [remarksDraft, setRemarksDraft] = useState<string>('');

  // Inline Quick Staff Add state inside Office Profile Card -> Staff & Quick Entry
  const [showQuickStaffForm, setShowQuickStaffForm] = useState(false);
  const [qsName, setQsName] = useState('');
  const [qsEmpId, setQsEmpId] = useState('');
  const [qsContact, setQsContact] = useState('');
  const [qsDesig, setQsDesig] = useState<DesignationType>('Postman');
  const [qsBeat, setQsBeat] = useState('Beat 1');
  const [qsPartnerOrg, setQsPartnerOrg] = useState('');
  const [qsCategories, setQsCategories] = useState<string[]>([]);

  // Quick Add Office + Staff Mapping Modal
  const [showAddOfficeModal, setShowAddOfficeModal] = useState(false);
  const [newCircle, setNewCircle] = useState('Rajasthan Circle');
  const [newDivision, setNewDivision] = useState('Kota Division');
  const [newDistrict, setNewDistrict] = useState('Kota');
  const [newBlock, setNewBlock] = useState('Kota Urban');
  const [newHoName, setNewHoName] = useState('Kota H.O. (324001)');
  const [newSoName, setNewSoName] = useState('');
  const [newBoName, setNewBoName] = useState('');
  const [newOfficeType, setNewOfficeType] = useState<'HO' | 'SO' | 'BO'>('SO');
  const [newOfficeVariant, setNewOfficeVariant] = useState<OfficeVariantType>('Post Office (HO/SO/BO)');
  const [newBusinessSectionName, setNewBusinessSectionName] = useState('');
  const [newBusinessSectionCategory, setNewBusinessSectionCategory] = useState<BusinessServiceCategory>('Postal & Last-Mile Logistics');
  const [newBusinessSectionLandmark, setNewBusinessSectionLandmark] = useState('');
  const [newOperationalRemarks, setNewOperationalRemarks] = useState('');
  const [newPincode, setNewPincode] = useState('324009');
  const [newAddress, setNewAddress] = useState('');
  const [newBeats, setNewBeats] = useState('Beat 1, Beat 2');
  const [newColonies, setNewColonies] = useState('');
  const [newInchargeName, setNewInchargeName] = useState('');
  const [newInchargeEmpId, setNewInchargeEmpId] = useState('');
  const [newInchargeMobile, setNewInchargeMobile] = useState('');
  const [newInchargeDesig, setNewInchargeDesig] = useState<DesignationType>('Sub Postmaster (SPM)');

  // Edit Office State
  const [editingOffice, setEditingOffice] = useState<DynamicOfficeRecord | null>(null);
  const [editOfficeName, setEditOfficeName] = useState('');
  const [editOfficeType, setEditOfficeType] = useState<'HO' | 'SO' | 'BO'>('SO');
  const [editOfficeVariant, setEditOfficeVariant] = useState<OfficeVariantType>('Post Office (HO/SO/BO)');
  const [editBusinessSectionName, setEditBusinessSectionName] = useState('');
  const [editBusinessSectionCategory, setEditBusinessSectionCategory] = useState<BusinessServiceCategory>('Postal & Last-Mile Logistics');
  const [editBusinessSectionLandmark, setEditBusinessSectionLandmark] = useState('');
  const [editOperationalRemarks, setEditOperationalRemarks] = useState('');
  const [editDivision, setEditDivision] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editBlock, setEditBlock] = useState('');
  const [editSubDivision, setEditSubDivision] = useState('');
  const [editHoName, setEditHoName] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editBeats, setEditBeats] = useState('');
  const [editColonies, setEditColonies] = useState('');
  const [editManagerName, setEditManagerName] = useState('');
  const [editManagerContact, setEditManagerContact] = useState('');

  // Edit Assigned Staff Member State (Full Add/Edit with status toggle & BO assignment)
  const [editingStaffMember, setEditingStaffMember] = useState<StaffProfile | null>(null);
  const [esmName, setEsmName] = useState('');
  const [esmEmpId, setEsmEmpId] = useState('');
  const [esmContact, setEsmContact] = useState('');
  const [esmDesig, setEsmDesig] = useState<DesignationType>('Postman');
  const [esmBeat, setEsmBeat] = useState('Beat 1');
  const [esmBranchOffice, setEsmBranchOffice] = useState('');
  const [esmApprovalStatus, setEsmApprovalStatus] = useState<'Approved' | 'Pending Approval' | 'Revoked'>('Approved');
  const [esmDutyStatus, setEsmDutyStatus] = useState<'Active on Duty' | 'In Office' | 'Supervising' | 'On Leave'>('Active on Duty');

  // XPEEDO Master Admin & Office Permission Protocol Gates
  const isDesignatedAdmin = useMemo(
    () =>
      staffPermissionService.isDesignatedMasterAdmin(userProfile) ||
      Boolean(indiaPostOwnerAccess),
    [userProfile, indiaPostOwnerAccess]
  );

  const canRegisterOffice = useMemo(
    () =>
      staffPermissionService.canPerformOfficeMasterAction(userProfile, 'registerNewOffice') ||
      Boolean(indiaPostOwnerAccess),
    [userProfile, indiaPostOwnerAccess]
  );

  const canModifyOffice = useMemo(
    () =>
      staffPermissionService.canPerformOfficeMasterAction(userProfile, 'modifyExistingOffice') ||
      Boolean(indiaPostOwnerAccess),
    [userProfile, indiaPostOwnerAccess]
  );

  const canDeleteOffice = useMemo(
    () =>
      staffPermissionService.canPerformOfficeMasterAction(userProfile, 'deleteOrArchiveOffice') ||
      Boolean(indiaPostOwnerAccess),
    [userProfile, indiaPostOwnerAccess]
  );

  const canInstantVerify = useMemo(
    () =>
      staffPermissionService.canPerformOfficeMasterAction(userProfile, 'instantVerifyStaffData') ||
      Boolean(indiaPostOwnerAccess),
    [userProfile, indiaPostOwnerAccess]
  );

  const isDistrictManager = useMemo(
    () => staffPermissionService.isDistrictManager(userProfile),
    [userProfile]
  );

  const isCategoryManager = useMemo(
    () => staffPermissionService.isCategoryManager(userProfile),
    [userProfile]
  );

  const refreshData = () => {
    setOffices([...staffPermissionService.getDynamicOffices()]);
    setStaffProfiles([...staffPermissionService.getAllStaffProfiles()]);
  };

  useEffect(() => {
    refreshData();
    const unsub = staffPermissionService.subscribe(refreshData);
    return () => unsub();
  }, []);

  // Keep selectedOffice live-synced whenever offices or staffProfiles refresh
  const selectedOffice = useMemo(() => {
    if (!selectedOfficeId) return null;
    return offices.find((o) => o.id === selectedOfficeId || o.officeName === selectedOfficeId) || null;
  }, [offices, selectedOfficeId]);

  useEffect(() => {
    if (selectedOffice) {
      setRemarksDraft(selectedOffice.operationalRemarks || '');
      setQsBeat(selectedOffice.mappedBeats?.[0] || 'Beat 1');
    }
  }, [selectedOffice]);

  const openOfficeWorkspace = (office: DynamicOfficeRecord, initialTab: OfficeWorkspaceTab = 'OVERVIEW') => {
    setSelectedOfficeId(office.id || office.officeName);
    setWorkspaceTab(initialTab);
    setShowQuickStaffForm(false);
  };

  // Real Staff list per office using exact matching service method
  const selectedOfficeRealStaff = useMemo(() => {
    if (!selectedOffice) return [];
    return staffPermissionService.getOfficeAssignedStaff(selectedOffice);
  }, [selectedOffice, staffProfiles, offices]);

  // Precompute staff count map for table & KPI cards
  const officeStaffCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of offices) {
      map.set(o.id, staffPermissionService.getOfficeStaffCount(o));
    }
    return map;
  }, [offices, staffProfiles]);

  // Linked Vendors & Products for Selected Office
  const selectedOfficeLinkedStores = useMemo(() => {
    if (!selectedOffice) return [];
    const allStores = commercialPropertyService.getAllStores();
    return allStores.filter((st) => {
      if (st.linkedOfficeId && st.linkedOfficeId === selectedOffice.id) return true;
      if (st.linkedOfficeName && st.linkedOfficeName.toLowerCase() === selectedOffice.officeName.toLowerCase()) return true;
      if (st.pincode && st.pincode === selectedOffice.pincode) return true;
      if (st.serviceablePincodes?.includes(selectedOffice.pincode)) return true;
      return false;
    });
  }, [selectedOffice]);

  const selectedOfficeLinkedProducts = useMemo(() => {
    if (!selectedOffice) return [];
    const allProducts = staffProductService.getAllProducts();
    return allProducts.filter((pr) => {
      if (pr.linkedOfficeId && pr.linkedOfficeId === selectedOffice.id) return true;
      if (pr.linkedOfficeName && pr.linkedOfficeName.toLowerCase() === selectedOffice.officeName.toLowerCase()) return true;
      if (pr.subOffice && pr.subOffice.toLowerCase() === selectedOffice.officeName.toLowerCase()) return true;
      if (pr.pincode && pr.pincode === selectedOffice.pincode) return true;
      return false;
    });
  }, [selectedOffice]);

  const hierarchy = useMemo(
    () => staffPermissionService.getHierarchyOptions(),
    [offices, staffProfiles]
  );

  const uniqueDistricts = useMemo(() => {
    const set = new Set<string>();
    offices.forEach((o) => {
      if (o.district?.trim()) set.add(o.district.trim());
    });
    return Array.from(set).sort();
  }, [offices]);

  // Scoped base list respecting Owner/Master Admin global access & DM/CM/Regional scope
  const scopedOffices = useMemo(() => {
    return offices.filter((o) => staffPermissionService.canManageOfficeByScope(userProfile, o));
  }, [offices, userProfile]);

  // Pre-computed division counts within scope
  const kotaOffices = useMemo(() => scopedOffices.filter((o) => o.division === 'Kota Division'), [scopedOffices]);
  const baranOffices = useMemo(() => scopedOffices.filter((o) => o.division === 'Baran Division'), [scopedOffices]);
  const bundiOffices = useMemo(() => scopedOffices.filter((o) => o.division === 'Bundi Division'), [scopedOffices]);
  const otherOffices = useMemo(
    () => scopedOffices.filter((o) => o.division !== 'Kota Division' && o.division !== 'Baran Division' && o.division !== 'Bundi Division'),
    [scopedOffices]
  );

  // Fast Pincode Radar matched office
  const radarMatchedOffice = useMemo(() => {
    if (!pincodeRadarInput.trim()) return null;
    const cleanPin = pincodeRadarInput.trim().toLowerCase();
    return (
      scopedOffices.find(
        (o) =>
          o.pincode === cleanPin ||
          o.officeName.toLowerCase().includes(cleanPin) ||
          o.soName.toLowerCase().includes(cleanPin)
      ) || null
    );
  }, [scopedOffices, pincodeRadarInput]);

  const filteredOffices = useMemo(() => {
    return scopedOffices.filter((o) => {
      if (activeDivisionTab === 'KOTA' && o.division !== 'Kota Division') return false;
      if (activeDivisionTab === 'BARAN' && o.division !== 'Baran Division') return false;
      if (activeDivisionTab === 'BUNDI' && o.division !== 'Bundi Division') return false;
      if (
        activeDivisionTab === 'OTHERS' &&
        (o.division === 'Kota Division' || o.division === 'Baran Division' || o.division === 'Bundi Division')
      ) {
        return false;
      }

      if (filterCircle !== 'ALL' && o.circle !== filterCircle) return false;
      if (filterDivision !== 'ALL' && o.division !== filterDivision) return false;
      if (filterDistrict !== 'ALL' && (o.district || '').toLowerCase() !== filterDistrict.toLowerCase()) return false;
      if (filterOfficeType !== 'ALL' && o.officeType !== filterOfficeType) return false;

      if (filterCategory !== 'ALL') {
        const officeCats = staffPermissionService.deriveOfficeServiceCategories(o);
        if (!officeCats.includes(filterCategory)) return false;
      }

      const count = officeStaffCountMap.get(o.id) ?? 0;
      if (filterVacancy === 'VACANT' && count > 0) return false;
      if (filterVacancy === 'OCCUPIED' && count === 0) return false;

      if (filterPincode.trim() && !o.pincode.includes(filterPincode.trim())) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = o.officeName.toLowerCase().includes(q);
        const matchHo = o.hoName.toLowerCase().includes(q);
        const matchSo = o.soName.toLowerCase().includes(q);
        const matchBo = (o.boName || '').toLowerCase().includes(q);
        const matchPin = o.pincode.includes(q);
        const matchDist = (o.district || '').toLowerCase().includes(q);
        const matchBiz = (o.businessSectionName || '').toLowerCase().includes(q) || (o.officeVariant || '').toLowerCase().includes(q);
        const matchAddr = o.completeAddress.toLowerCase().includes(q);
        const matchBeat = o.mappedBeats.some((b) => b.toLowerCase().includes(q));
        const matchColony = o.mappedColonies.some((c) => c.toLowerCase().includes(q));
        if (!matchName && !matchHo && !matchSo && !matchBo && !matchPin && !matchDist && !matchBiz && !matchAddr && !matchBeat && !matchColony) {
          return false;
        }
      }

      return true;
    });
  }, [
    scopedOffices,
    activeDivisionTab,
    filterCircle,
    filterDivision,
    filterDistrict,
    filterOfficeType,
    filterCategory,
    filterVacancy,
    filterPincode,
    searchTerm,
    officeStaffCountMap,
  ]);

  const handleInstantVerifyStaff = (identifier: string) => {
    const res = staffPermissionService.instantVerifyStaffData(identifier, userProfile);
    if (res.success) {
      showSuccess(res.message);
      refreshData();
    } else {
      showError(res.message);
    }
  };

  const handleReassignStaff = (staffIdentifier: string, targetOfficeId: string) => {
    if (!targetOfficeId) return;
    const res = staffPermissionService.reassignStaffOffice(staffIdentifier, targetOfficeId, userProfile);
    if (res.success) {
      showSuccess(res.message);
      refreshData();
    } else {
      showError(res.message);
    }
  };

  const handleSaveRemarks = () => {
    if (!selectedOffice) return;
    const res = staffPermissionService.updateOfficeRemarks(selectedOffice.id, remarksDraft, userProfile);
    if (res.success) {
      showSuccess(res.message);
      refreshData();
    } else {
      showError(res.message);
    }
  };

  const handleConfirmPermanentDelete = () => {
    if (!deleteModalOffice) return;
    const targetId = deleteModalOffice.id || deleteModalOffice.officeName;
    const res = staffPermissionService.permanentlyDeleteVacantOffice(targetId, userProfile);
    if (res.success) {
      if (selectedOfficeId === deleteModalOffice.id || selectedOfficeId === deleteModalOffice.officeName) {
        setSelectedOfficeId(null);
      }
      setDeleteModalOffice(null);
      showSuccess(res.message);
      refreshData();
    } else {
      showError(res.message);
    }
  };

  const handleQuickAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffice) return;
    if (!qsName.trim() || !qsContact.trim()) {
      showError('Please enter staff name and mobile number.');
      return;
    }

    const isBO = (selectedOffice.officeType || '').toUpperCase().includes('B') || Boolean(selectedOffice.branchOffice);
    const { profile } = staffPermissionService.upsertStaffWithAutoOfficeAndBeat({
      employeeId: qsEmpId.trim() || `EMP-${Date.now().toString().slice(-6)}`,
      name: qsName.trim(),
      contact: qsContact.trim(),
      designationType: qsDesig,
      circle: selectedOffice.circle || 'Rajasthan Circle',
      division: selectedOffice.division || 'Kota Division',
      district: selectedOffice.district,
      block: selectedOffice.block,
      assignedCategories: qsCategories.length > 0 ? qsCategories : undefined,
      partnerOrganization: qsPartnerOrg.trim() || undefined,
      officeId: selectedOffice.id,
      headOffice: selectedOffice.headOffice || selectedOffice.hoName,
      subOffice: selectedOffice.subOffice || selectedOffice.soName || selectedOffice.officeName,
      branchOffice: isBO ? selectedOffice.branchOffice || selectedOffice.officeName : undefined,
      officePincode: selectedOffice.pincode,
      officeAddress: selectedOffice.completeAddress,
      beat: qsBeat || selectedOffice.mappedBeats?.[0] || 'Beat 1',
      assignedBeats: [qsBeat || selectedOffice.mappedBeats?.[0] || 'Beat 1'],
      assignedColonies: selectedOffice.mappedColonies?.length ? selectedOffice.mappedColonies : [selectedOffice.officeName],
      approvalStatus: canInstantVerify ? 'Approved' : 'Pending Approval',
    });

    showSuccess(`Added "${profile.name}" (${profile.designation}) directly to ${selectedOffice.officeName}.`);
    setQsName('');
    setQsEmpId('');
    setQsContact('');
    setQsPartnerOrg('');
    setQsCategories([]);
    setShowQuickStaffForm(false);
    refreshData();
  };

  const openEditStaffModal = (staff: StaffProfile) => {
    setEditingStaffMember(staff);
    setEsmName(staff.name || '');
    setEsmEmpId(staff.employeeId || staff.id.replace(/^STAFF-/, ''));
    setEsmContact(staff.contact || '');
    setEsmDesig(staff.designationType || (staff.designation as DesignationType) || 'Postman');
    setEsmBeat(staff.beat || 'Beat 1');
    setEsmBranchOffice(staff.branchOffice || (staff as any).subOrBranchOffice || '');
    setEsmApprovalStatus(staff.permissions?.approvalStatus || 'Approved');
    setEsmDutyStatus(staff.status || 'Active on Duty');
  };

  const handleSaveStaffMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffMember) return;
    if (!esmName.trim() || !esmContact.trim()) {
      showError('Please enter staff full name and mobile number.');
      return;
    }
    const targetOffice =
      selectedOffice ||
      offices.find(
        (o) =>
          o.id === editingStaffMember.officeId ||
          o.officeName === editingStaffMember.headOffice ||
          o.soName === editingStaffMember.subOffice
      );

    staffPermissionService.upsertStaffWithAutoOfficeAndBeat({
      id: editingStaffMember.id,
      employeeId: esmEmpId.trim() || editingStaffMember.employeeId || editingStaffMember.id,
      name: esmName.trim(),
      contact: esmContact.trim(),
      email: editingStaffMember.email,
      designationType: esmDesig,
      role: esmDesig.toUpperCase().replace(/\s+/g, '_'),
      circle: targetOffice?.circle || editingStaffMember.circle || 'Rajasthan Circle',
      division: targetOffice?.division || editingStaffMember.division || 'Kota Division',
      district: targetOffice?.district || editingStaffMember.district,
      block: targetOffice?.block || editingStaffMember.block,
      officeId: targetOffice?.id || editingStaffMember.officeId,
      headOffice:
        targetOffice?.headOffice ||
        targetOffice?.hoName ||
        editingStaffMember.headOffice ||
        'Kota H.O.',
      subOffice:
        targetOffice?.subOffice ||
        targetOffice?.soName ||
        targetOffice?.officeName ||
        editingStaffMember.subOffice ||
        'Dadabari S.O.',
      branchOffice: esmBranchOffice.trim() || targetOffice?.branchOffice || editingStaffMember.branchOffice,
      officePincode: targetOffice?.pincode || editingStaffMember.officePincode || '324009',
      officeAddress: targetOffice?.completeAddress || editingStaffMember.officeAddress || '',
      beat: esmBeat.trim() || editingStaffMember.beat || 'Beat 1',
      assignedBeats: [esmBeat.trim() || editingStaffMember.beat || 'Beat 1'],
      assignedColonies: targetOffice?.mappedColonies?.length
        ? targetOffice.mappedColonies
        : editingStaffMember.assignedColonies,
      approvalStatus: esmApprovalStatus,
      status: esmDutyStatus,
    });

    showSuccess(`Updated staff record "${esmName}" (${esmDesig}) successfully.`);
    setEditingStaffMember(null);
    refreshData();
  };

  const handleToggleStaffStatus = (staff: StaffProfile) => {
    const current = staff.permissions?.approvalStatus || 'Approved';
    const nextStatus =
      current === 'Approved'
        ? 'Pending Approval'
        : current === 'Pending Approval'
        ? 'Revoked'
        : 'Approved';
    staffPermissionService.updateStaffPermission(staff.email || staff.employeeId || staff.id, {
      approvalStatus: nextStatus,
    });
    showSuccess(`Status changed to "${nextStatus}" for ${staff.name}.`);
    refreshData();
  };

  useEffect(() => {
    if (editingOffice) {
      setEditOfficeName(editingOffice.officeName || '');
      setEditOfficeType(
        editingOffice.officeType === 'H.O.' || editingOffice.officeType === 'HO'
          ? 'HO'
          : editingOffice.officeType === 'B.O.' || editingOffice.officeType === 'BO'
          ? 'BO'
          : 'SO'
      );
      setEditOfficeVariant(editingOffice.officeVariant || 'Post Office (HO/SO/BO)');
      setEditBusinessSectionName(editingOffice.businessSectionName || '');
      setEditBusinessSectionCategory(editingOffice.businessSectionCategory || 'Postal & Last-Mile Logistics');
      setEditBusinessSectionLandmark(editingOffice.businessSectionLandmark || '');
      setEditOperationalRemarks(editingOffice.operationalRemarks || '');
      setEditDivision(editingOffice.division || 'Kota Division');
      setEditDistrict(editingOffice.district || '');
      setEditBlock(editingOffice.block || '');
      setEditSubDivision(editingOffice.subDivision || '');
      setEditHoName(editingOffice.hoName || '');
      setEditPincode(editingOffice.pincode || '');
      setEditAddress(editingOffice.completeAddress || '');
      setEditBeats((editingOffice.mappedBeats || []).join(', '));
      setEditColonies((editingOffice.mappedColonies || []).join(', '));
      setEditManagerName(editingOffice.pincodeManager || '');
      setEditManagerContact(editingOffice.pincodeManagerContact || '');
    }
  }, [editingOffice]);

  const handleSaveEditedOffice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffice) return;
    if (!canModifyOffice && !isDesignatedAdmin) {
      showError('Permission Denied: Modifying office records requires Master Admin / Owner / DM authorization.');
      return;
    }
    const beatsArr = editBeats.split(',').map((b) => b.trim()).filter(Boolean);
    const coloniesArr = editColonies.split(',').map((c) => c.trim()).filter(Boolean);

    const updatedRecord: DynamicOfficeRecord = {
      ...editingOffice,
      officeName: editOfficeName.trim(),
      soName: editOfficeName.trim(),
      officeType: editOfficeType,
      officeVariant: editOfficeVariant,
      businessSectionName: editBusinessSectionName.trim() || undefined,
      businessSectionCategory: editBusinessSectionCategory,
      businessSectionLandmark: editBusinessSectionLandmark.trim() || undefined,
      operationalRemarks: editOperationalRemarks.trim() || undefined,
      division: editDivision.trim(),
      district: editDistrict.trim() || editingOffice.district,
      block: editBlock.trim() || editingOffice.block,
      subDivision: editSubDivision.trim(),
      hoName: editHoName.trim(),
      headOffice: editHoName.trim(),
      pincode: editPincode.trim(),
      completeAddress: editAddress.trim(),
      mappedBeats: beatsArr,
      mappedColonies: coloniesArr,
      pincodeManager: editManagerName.trim(),
      pincodeManagerContact: editManagerContact.trim(),
      serviceCategories: staffPermissionService.deriveOfficeServiceCategories({
        officeVariant: editOfficeVariant,
        businessSectionCategory: editBusinessSectionCategory,
        businessSectionName: editBusinessSectionName.trim(),
      }),
      updatedAt: new Date().toISOString(),
    };

    staffPermissionService.upsertCustomOffice(updatedRecord);
    showSuccess(`Updated office details, variant & business section for PIN ${editPincode}.`);
    setEditingOffice(null);
    refreshData();
  };

  const handleExportOffices = (targetDivision?: string) => {
    const listToExport = targetDivision
      ? scopedOffices.filter((o) => o.division === targetDivision)
      : filteredOffices;

    const rows = listToExport.map((o) => ({
      'Office ID': o.id,
      'Office Name': o.officeName,
      'Office Category': o.officeType,
      'Office Variant': o.officeVariant || 'Post Office (HO/SO/BO)',
      'Business Section': o.businessSectionName || 'Postal Counter',
      'Service Category': o.businessSectionCategory || 'Postal & Last-Mile Logistics',
      Circle: o.circle,
      Division: o.division,
      District: o.district || 'Rajasthan',
      Block: o.block || '-',
      'Head Office (HO)': o.hoName,
      'Sub Office (SO)': o.soName,
      'Branch Office (BO)': o.boName || 'Direct Delivery',
      Pincode: o.pincode,
      'Complete Office Address': o.completeAddress,
      'Mapped Beats': o.mappedBeats.join(', '),
      'Real Staff Count': officeStaffCountMap.get(o.id) ?? 0,
      'Operational Remarks': o.operationalRemarks || '',
      'Last Synced': new Date(o.updatedAt).toLocaleString('en-IN'),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    const sheetName = targetDivision ? targetDivision.replace(' Division', '') : 'All_Offices';
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
    const filename = `Xpeedo_Office_Master_${sheetName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  // Sync HO preset when division is changed in Modal
  const handleModalDivisionChange = (div: string) => {
    setNewDivision(div);
    if (div === 'Kota Division') {
      setNewDistrict('Kota');
      setNewHoName('Kota H.O. (324001)');
      setNewPincode('324009');
    } else if (div === 'Baran Division') {
      setNewDistrict('Baran');
      setNewHoName('Baran H.O. (325205)');
      setNewPincode('325205');
    } else if (div === 'Bundi Division') {
      setNewDistrict('Bundi');
      setNewHoName('Bundi H.O. (323001)');
      setNewPincode('323001');
    } else if (div === 'Jhalawar Division') {
      setNewDistrict('Jhalawar');
      setNewHoName('Jhalawar H.O. (326001)');
      setNewPincode('326001');
    } else if (div === 'Tonk Division') {
      setNewDistrict('Tonk');
      setNewHoName('Tonk H.O. (304001)');
      setNewPincode('304001');
    } else if (div === 'Jaipur City Division') {
      setNewDistrict('Jaipur');
      setNewHoName('Jaipur G.P.O. (302001)');
      setNewPincode('302001');
    }
  };

  const handleCreateOfficeViaStaffEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canRegisterOffice && !isDesignatedAdmin) {
      showError('Permission Denied: Registering new offices requires Master Admin / Owner / DM authorization.');
      return;
    }
    const targetOfficeName =
      newOfficeType === 'BO'
        ? newBoName.trim() || 'New Branch Post Office (BO)'
        : newOfficeType === 'HO'
        ? newHoName.trim()
        : newSoName.trim() || 'New Sub Post Office (SO)';

    const beatsArr = newBeats.split(',').map((b) => b.trim()).filter(Boolean);
    const coloniesArr = newColonies.split(',').map((c) => c.trim()).filter(Boolean);

    const savedOffice = staffPermissionService.upsertCustomOffice({
      id: `OFFICE-${targetOfficeName.toUpperCase().replace(/[^A-Z0-9]/g, '-')}-${newPincode.trim()}`,
      officeName: targetOfficeName,
      officeType: newOfficeType,
      officeVariant: newOfficeVariant,
      businessSectionName: newBusinessSectionName.trim() || undefined,
      businessSectionCategory: newBusinessSectionCategory,
      businessSectionLandmark: newBusinessSectionLandmark.trim() || undefined,
      operationalRemarks: newOperationalRemarks.trim() || undefined,
      circle: newCircle.trim() || 'Rajasthan Circle',
      division: newDivision.trim() || 'Kota Division',
      district: newDistrict.trim() || 'Kota',
      block: newBlock.trim() || 'Urban Block',
      hoName: newHoName.trim() || 'Kota H.O. (324001)',
      headOffice: newHoName.trim() || 'Kota H.O. (324001)',
      soName: newSoName.trim() || targetOfficeName,
      subOffice: newSoName.trim() || targetOfficeName,
      boName: newOfficeType === 'BO' ? newBoName.trim() || targetOfficeName : undefined,
      branchOffice: newOfficeType === 'BO' ? newBoName.trim() || targetOfficeName : undefined,
      pincode: newPincode.trim() || '324009',
      completeAddress: newAddress.trim() || `${targetOfficeName}, ${newDivision}, ${newCircle} - ${newPincode}`,
      mappedBeats: beatsArr.length ? beatsArr : ['Beat 1'],
      mappedColonies: coloniesArr.length ? coloniesArr : [targetOfficeName],
      pincodeManager: newInchargeName.trim() || undefined,
      pincodeManagerContact: newInchargeMobile.trim() || undefined,
      assignedInchargeName: newInchargeName.trim() || undefined,
      serviceCategories: staffPermissionService.deriveOfficeServiceCategories({
        officeVariant: newOfficeVariant,
        businessSectionCategory: newBusinessSectionCategory,
        businessSectionName: newBusinessSectionName.trim(),
      }),
      updatedAt: new Date().toISOString(),
    });

    if (newInchargeName.trim() && newInchargeMobile.trim()) {
      staffPermissionService.upsertStaffWithAutoOfficeAndBeat({
        name: newInchargeName.trim(),
        contact: newInchargeMobile.trim(),
        employeeId: newInchargeEmpId.trim() || `EMP-${Date.now().toString().slice(-6)}`,
        designationType: newInchargeDesig,
        circle: newCircle.trim() || 'Rajasthan Circle',
        division: newDivision.trim() || 'Kota Division',
        district: newDistrict.trim() || 'Kota',
        block: newBlock.trim() || 'Urban Block',
        officeId: savedOffice.id,
        headOffice: newHoName.trim() || 'Kota H.O. (324001)',
        subOffice: newSoName.trim() || targetOfficeName,
        branchOffice: newOfficeType === 'BO' ? newBoName.trim() || targetOfficeName : undefined,
        officePincode: newPincode.trim() || '324009',
        officeAddress: newAddress.trim() || `${targetOfficeName}, ${newDivision} - ${newPincode}`,
        beat: beatsArr[0] || 'Beat 1',
        assignedBeats: beatsArr.length ? beatsArr : ['Beat 1'],
        deliveryOfficeMapping: targetOfficeName,
        assignedColonies: coloniesArr.length ? coloniesArr : [targetOfficeName],
        approvalStatus: canInstantVerify ? 'Approved' : 'Pending Approval',
      });
    }

    showSuccess(
      `Registered Office "${targetOfficeName} (${newPincode})" [${newOfficeVariant}] successfully saved!`
    );
    setShowAddOfficeModal(false);
    setNewSoName('');
    setNewBoName('');
    setNewBusinessSectionName('');
    setNewBusinessSectionLandmark('');
    setNewOperationalRemarks('');
    setNewAddress('');
    setNewColonies('');
    setNewInchargeName('');
    setNewInchargeEmpId('');
    setNewInchargeMobile('');
    refreshData();
  };

  const vacantCount = useMemo(
    () => scopedOffices.filter((o) => (officeStaffCountMap.get(o.id) ?? 0) === 0).length,
    [scopedOffices, officeStaffCountMap]
  );

  return (
    <div className="space-y-6" id="office-master-view-root">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-red-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles size={13} /> Unified Office Master • Multi-Vertical Variants • Pan-Rajasthan &amp; India
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              <Building size={26} className="text-amber-400" />
              <span>Unified Office Master, Variants &amp; Embedded Workspace</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Manage Post Offices (HO/SO/BO), EV Hubs, Logistics Franchises, and Hyperlocal Stores. Click any office to open its{' '}
              <strong>Unified Profile Card &amp; 5-Tab Workspace</strong> (Remarks, Inline Staff Add/Reassign, Beats, Linked Products &amp; Vendors, Deep Dive).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleExportOffices()}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Download database as Excel sheet"
            >
              <Download size={15} className="text-amber-400" />
              <span>Export Excel ({filteredOffices.length})</span>
            </button>

            <Link
              to="/staff-master"
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md"
            >
              <Users size={15} />
              <span>Staff Directory</span>
            </Link>

            {canRegisterOffice && (
              <button
                onClick={() => setShowAddOfficeModal(true)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md cursor-pointer"
              >
                <Plus size={15} />
                <span>+ Register New Office</span>
              </button>
            )}
          </div>
        </div>

        {/* Access Scope & Safe Deletion Rule Status Bar */}
        <div className="mt-4 p-3.5 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Shield size={16} className="text-amber-400 shrink-0" />
            <span className="font-black text-amber-300">Scope Access:</span>
            <span className="text-slate-200 font-bold">
              {isDesignatedAdmin || isSuperAdmin
                ? 'Global Unrestricted (Owner / Master Admin)'
                : isDistrictManager
                ? `District Manager Scope (${staffPermissionService.getAssignedDistrict(userProfile) || 'Assigned District'})`
                : isCategoryManager
                ? `Category Manager (${staffPermissionService.getAssignedCategories(userProfile).join(', ')})`
                : `${userProfile?.division || 'Assigned Region'}`}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3.5 text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Inline Quick Staff Add &amp; Reassign: <strong className="text-emerald-300">Active</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              Permanent Delete: <strong className="text-rose-300">Owner / Master Admin · Vacant Only (0 Staff)</strong>
            </span>
          </div>
        </div>

        {/* Division Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-5 pt-5 border-t border-white/10">
          <div
            onClick={() => setActiveDivisionTab('ALL')}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3.5 cursor-pointer transition"
          >
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Scoped Offices</div>
            <div className="text-2xl font-black text-white mt-0.5 tabular-nums">{scopedOffices.length}</div>
            <div className="text-[10px] text-amber-300 mt-0.5 tabular-nums">{vacantCount} Vacant (0 Staff)</div>
          </div>

          <div
            onClick={() => setActiveDivisionTab('KOTA')}
            className={`rounded-2xl p-3.5 border transition cursor-pointer ${
              activeDivisionTab === 'KOTA'
                ? 'bg-red-900/60 border-amber-400 ring-2 ring-amber-300/40'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>Kota Division</span>
              <span className="text-[9px] bg-red-800 px-1.5 py-0.2 rounded font-mono">324xxx</span>
            </div>
            <div className="text-2xl font-black text-amber-300 mt-0.5 tabular-nums">{kotaOffices.length}</div>
            <div className="text-[10px] text-slate-300 mt-0.5">Dadabari SO Base Hub</div>
          </div>

          <div
            onClick={() => setActiveDivisionTab('BARAN')}
            className={`rounded-2xl p-3.5 border transition cursor-pointer ${
              activeDivisionTab === 'BARAN'
                ? 'bg-red-900/60 border-amber-400 ring-2 ring-amber-300/40'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>Baran Division</span>
              <span className="text-[9px] bg-emerald-950 px-1.5 py-0.2 rounded font-mono">3252xx</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5 tabular-nums">{baranOffices.length}</div>
            <div className="text-[10px] text-slate-300 mt-0.5">Baran HO, Anta, Chhabra</div>
          </div>

          <div
            onClick={() => setActiveDivisionTab('BUNDI')}
            className={`rounded-2xl p-3.5 border transition cursor-pointer ${
              activeDivisionTab === 'BUNDI'
                ? 'bg-red-900/60 border-amber-400 ring-2 ring-amber-300/40'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="text-[11px] text-sky-300 font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>Bundi Division</span>
              <span className="text-[9px] bg-sky-950 px-1.5 py-0.2 rounded font-mono">323xxx</span>
            </div>
            <div className="text-2xl font-black text-sky-400 mt-0.5 tabular-nums">{bundiOffices.length}</div>
            <div className="text-[10px] text-slate-300 mt-0.5">Bundi HO, Lakheri, Nainwa</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Rajasthan Circle+</div>
            <div className="text-2xl font-black text-purple-300 mt-0.5 tabular-nums">
              {otherOffices.length}
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">
              {new Set(scopedOffices.map((o) => o.pincode)).size} Unique PIN Codes
            </div>
          </div>
        </div>
      </div>

      {/* In-UI Success & Error Feedback Banners */}
      {bannerMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-5 py-3.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{bannerMessage}</span>
          </div>
          <button onClick={() => setBannerMessage(null)} className="text-emerald-700 hover:text-emerald-950 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {errorBanner && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 px-5 py-3.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner(null)} className="text-rose-700 hover:text-rose-950 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {/* PINCODE & OFFICE FAST RADAR TOOL */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 border border-slate-700 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
              <Compass size={22} />
            </div>
            <div>
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <span>Instant PIN Code &amp; Office Profile Radar</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Live Lookup
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Enter any 6-digit Rajasthan PIN code or office name to inspect its unified card &amp; workspace.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">Quick Test:</span>
            {['324009', '325205', '323001', '302001', '342001', '313001', '305001'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPincodeRadarInput(p)}
                className={`px-2 py-1 rounded-lg font-mono font-bold transition cursor-pointer ${
                  pincodeRadarInput === p
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={pincodeRadarInput}
            onChange={(e) => setPincodeRadarInput(e.target.value)}
            placeholder="Search by PIN Code (e.g. 324009, 302001), Office Name (e.g. Dadabari, Anta, Jodhpur), or Beat..."
            className="w-full pl-12 pr-10 py-3 bg-slate-950/90 border border-slate-700 rounded-2xl text-white font-semibold text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
          {pincodeRadarInput && (
            <button
              onClick={() => setPincodeRadarInput('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {radarMatchedOffice && (
          <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md font-black text-xs bg-amber-400 text-slate-950">
                    {radarMatchedOffice.officeType} · PIN {radarMatchedOffice.pincode}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                    {radarMatchedOffice.division} · {radarMatchedOffice.district || 'Rajasthan'}
                  </span>
                  <span className="text-xs font-semibold text-indigo-300">
                    {radarMatchedOffice.officeVariant || 'Post Office (HO/SO/BO)'}
                  </span>
                </div>
                <h4 className="text-lg font-black text-white">{radarMatchedOffice.officeName}</h4>
                <p className="text-xs text-slate-300">{radarMatchedOffice.completeAddress}</p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setFilterPincode(radarMatchedOffice.pincode);
                    setSearchTerm('');
                  }}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Filter size={14} />
                  <span>Filter Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => openOfficeWorkspace(radarMatchedOffice, 'OVERVIEW')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-600"
                >
                  <Eye size={14} />
                  <span>Open Office Profile</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DIVISION TABS & HIERARCHICAL DRILL-DOWN FILTERS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Offices', count: scopedOffices.length, color: 'bg-slate-900 text-white' },
              { id: 'KOTA', label: 'Kota Division', count: kotaOffices.length, color: 'bg-red-700 text-white' },
              { id: 'BARAN', label: 'Baran Division', count: baranOffices.length, color: 'bg-emerald-700 text-white' },
              { id: 'BUNDI', label: 'Bundi Division', count: bundiOffices.length, color: 'bg-sky-700 text-white' },
              { id: 'OTHERS', label: 'Rajasthan & Circle Hubs', count: otherOffices.length, color: 'bg-purple-700 text-white' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDivisionTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeDivisionTab === tab.id
                    ? `${tab.color} shadow-sm ring-2 ring-red-400/40`
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-black/20 tabular-nums">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveDivisionTab('ALL');
                setFilterCircle('ALL');
                setFilterDivision('ALL');
                setFilterDistrict('ALL');
                setFilterOfficeType('ALL');
                setFilterCategory('ALL');
                setFilterVacancy('ALL');
                setFilterPincode('');
                setSearchTerm('');
                setPincodeRadarInput('');
              }}
              className="text-xs font-bold text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} /> Reset Filters
            </button>
          </div>
        </div>

        {/* Detailed Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">1. Division</label>
            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800"
            >
              <option value="ALL">All Divisions ({hierarchy.divisions.length})</option>
              {hierarchy.divisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">2. District</label>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800"
            >
              <option value="ALL">All Districts ({uniqueDistricts.length})</option>
              {uniqueDistricts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">3. Service Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800"
            >
              <option value="ALL">All Business Categories</option>
              {BUSINESS_SERVICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">4. Staff Occupancy</label>
            <select
              value={filterVacancy}
              onChange={(e) => setFilterVacancy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800"
            >
              <option value="ALL">All Offices (Occupied + Vacant)</option>
              <option value="OCCUPIED">Active With Staff (&gt; 0 Staff)</option>
              <option value="VACANT">Vacant Only (0 Real Staff)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">5. Pincode</label>
            <input
              type="text"
              placeholder="e.g. 324009"
              value={filterPincode}
              onChange={(e) => setFilterPincode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-mono font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">6. Search Office / Beat</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Name, hub, beat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* UNIFIED OFFICE DIRECTORY TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/80">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <span>Showing</span>
            <span className="px-2 py-0.5 rounded-md bg-red-700 text-white font-black font-mono tabular-nums">
              {filteredOffices.length}
            </span>
            <span>Offices in Directory</span>
          </div>

          <span className="text-[11px] text-slate-500">
            Click any row to open its Unified Office Profile Card &amp; 5-Tab Workspace
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[11px] border-b border-slate-200 font-black">
              <tr>
                <th className="p-3.5">Office Name, Variant &amp; Business Section</th>
                <th className="p-3.5">District, Division &amp; Block</th>
                <th className="p-3.5">PIN Code &amp; Head Office</th>
                <th className="p-3.5 text-center">Real Staff</th>
                <th className="p-3.5">Beats &amp; Service Areas</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOffices.map((o) => {
                const realCount = officeStaffCountMap.get(o.id) ?? 0;
                const isVacant = realCount === 0;
                return (
                  <tr
                    key={o.id}
                    onClick={() => openOfficeWorkspace(o, 'OVERVIEW')}
                    className="hover:bg-red-50/50 cursor-pointer transition"
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md font-black text-[10px] ${
                            o.officeType === 'HO'
                              ? 'bg-red-700 text-white'
                              : o.officeType === 'SO'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {o.officeType}
                        </span>
                        <span className="font-black text-slate-900 text-xs">{o.officeName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-indigo-700">
                          {o.officeVariant || 'Post Office (HO/SO/BO)'}
                        </span>
                        {o.businessSectionName && (
                          <span>• {o.businessSectionName}</span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">
                        {o.district || (o.division.includes('Kota') ? 'Kota' : o.division.includes('Baran') ? 'Baran' : o.division.includes('Bundi') ? 'Bundi' : 'Rajasthan')}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {o.division}{o.block ? ` · ${o.block}` : ''}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-mono font-black text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 tabular-nums">
                        {o.pincode}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1 max-w-xs truncate" title={o.hoName}>
                        HO: {o.hoName}
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono font-black text-[11px] tabular-nums ${
                          isVacant
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        <Users size={12} />
                        {realCount} {isVacant ? 'Vacant' : 'Active'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {o.mappedBeats.slice(0, 3).map((b) => (
                          <span key={b} className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold rounded text-[10px]">
                            {b}
                          </span>
                        ))}
                        {o.mappedBeats.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-bold">+{o.mappedBeats.length - 3}</span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openOfficeWorkspace(o, 'OVERVIEW');
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-red-800 text-amber-300 rounded-lg font-bold text-[11px] transition cursor-pointer whitespace-nowrap"
                        >
                          Profile Card
                        </button>
                        {canModifyOffice && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingOffice(o);
                            }}
                            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-lg font-bold text-[11px] transition cursor-pointer"
                            title="Edit Office Details"
                          >
                            Edit
                          </button>
                        )}
                        {canDeleteOffice && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModalOffice(o);
                            }}
                            className={`px-2 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                              isVacant
                                ? 'bg-rose-100 hover:bg-rose-200 text-rose-950'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                            title={
                              isVacant
                                ? 'Permanently delete vacant office (Owner / Master Admin)'
                                : `Locked: ${realCount} active staff assigned. Reassign staff first.`
                            }
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredOffices.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No registered offices match your active scope or filter selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================
          UNIFIED OFFICE PROFILE CARD & EMBEDDED 5-TAB WORKSPACE DRAWER / MODAL
         ======================================================================== */}
      {selectedOffice && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            {/* Rich Office Profile Card Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-red-950 to-slate-900 text-white shrink-0">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-400 text-slate-950">
                      {selectedOffice.officeType} • PIN {selectedOffice.pincode}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-white/10 border border-white/15 font-bold text-amber-200">
                      {selectedOffice.officeVariant || 'Post Office (HO/SO/BO)'}
                    </span>
                    {selectedOffice.businessSectionCategory && (
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 font-bold text-emerald-200">
                        {selectedOffice.businessSectionCategory}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded font-black font-mono tabular-nums ${
                        selectedOfficeRealStaff.length === 0
                          ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40'
                          : 'bg-emerald-600/30 text-emerald-200 border border-emerald-400/40'
                      }`}
                    >
                      {selectedOfficeRealStaff.length === 0
                        ? '0 Staff · Vacant Office'
                        : `${selectedOfficeRealStaff.length} Real Staff Assigned`}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">{selectedOffice.officeName}</h3>
                  <p className="text-xs text-slate-300">
                    {selectedOffice.completeAddress} · <strong>{selectedOffice.division}</strong> (District:{' '}
                    <strong>{selectedOffice.district || 'Kota'}</strong>
                    {selectedOffice.block ? ` · Block: ${selectedOffice.block}` : ''})
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {canModifyOffice && (
                    <button
                      type="button"
                      onClick={() => setEditingOffice(selectedOffice)}
                      className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>Edit Office</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedOfficeId(null)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Quick Glance Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 text-xs">
                <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-2">
                  <div className="text-[10px] text-slate-300 uppercase font-bold">Real Assigned Staff</div>
                  <div className="font-mono font-black text-base text-white tabular-nums">
                    {selectedOfficeRealStaff.length}
                  </div>
                </div>
                <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-2">
                  <div className="text-[10px] text-slate-300 uppercase font-bold">Active Beats</div>
                  <div className="font-mono font-black text-base text-amber-300 tabular-nums">
                    {selectedOffice.mappedBeats.length}
                  </div>
                </div>
                <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-2">
                  <div className="text-[10px] text-slate-300 uppercase font-bold">Products &amp; Vendors</div>
                  <div className="font-mono font-black text-base text-emerald-300 tabular-nums">
                    {selectedOfficeLinkedProducts.length} SKUs · {selectedOfficeLinkedStores.length} Stores
                  </div>
                </div>
                <div className="bg-white/10 border border-white/10 rounded-xl px-3 py-2">
                  <div className="text-[10px] text-slate-300 uppercase font-bold">Supervisor / SPM</div>
                  <div className="font-bold text-white truncate">
                    {selectedOffice.pincodeManager || selectedOffice.assignedInchargeName || 'Unassigned'}
                  </div>
                </div>
              </div>

              {/* 5-Tab Inline Workspace Switcher */}
              <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/10 text-xs">
                {[
                  { id: 'OVERVIEW', label: '01. Overview & Remarks', icon: Briefcase },
                  { id: 'STAFF', label: `02. Staff & Quick Entry (${selectedOfficeRealStaff.length})`, icon: Users },
                  { id: 'BEATS', label: `03. Beats & Pincodes (${selectedOffice.mappedBeats.length})`, icon: MapPin },
                  {
                    id: 'PRODUCTS_VENDORS',
                    label: `04. Products & Vendors (${selectedOfficeLinkedProducts.length + selectedOfficeLinkedStores.length})`,
                    icon: ShoppingBag,
                  },
                  { id: 'DEEP_DIVE', label: '05. Deep Dive & Logs', icon: Activity },
                ].map((tab) => {
                  const IconComp = tab.icon;
                  const active = workspaceTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setWorkspaceTab(tab.id as OfficeWorkspaceTab)}
                      className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        active
                          ? 'bg-white text-slate-950 shadow-sm'
                          : 'bg-white/10 text-slate-200 hover:bg-white/20'
                      }`}
                    >
                      <IconComp size={13} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Embedded Workspace Tab Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1 bg-slate-50/50">
              {/* TAB 1: OVERVIEW & REMARKS */}
              {workspaceTab === 'OVERVIEW' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Circle</span>
                      <span className="font-bold text-slate-900">{selectedOffice.circle}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Division</span>
                      <span className="font-black text-red-700">{selectedOffice.division}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">District &amp; Block</span>
                      <span className="font-bold text-slate-900">
                        {selectedOffice.district || 'Rajasthan'}
                        {selectedOffice.block ? ` · ${selectedOffice.block}` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Head Office (HO)</span>
                      <span className="font-bold text-slate-900">{selectedOffice.hoName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Sub / Branch Office</span>
                      <span className="font-bold text-slate-900">{selectedOffice.soName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Office Variant</span>
                      <span className="font-bold text-indigo-700">
                        {selectedOffice.officeVariant || 'Post Office (HO/SO/BO)'}
                      </span>
                    </div>
                  </div>

                  {/* Business Section & Categories */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="font-black text-slate-900 flex items-center gap-1.5">
                      <Building2 size={15} className="text-indigo-700" />
                      <span>Commercial Business Section &amp; Service Categories</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Business Unit / Section</span>
                        <span className="font-bold text-slate-900">
                          {selectedOffice.businessSectionName || 'Primary Postal Counter & Delivery Desk'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Primary Vertical</span>
                        <span className="font-bold text-emerald-700">
                          {selectedOffice.businessSectionCategory || 'Postal & Last-Mile Logistics'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Landmark / Zone</span>
                        <span className="font-semibold text-slate-700">
                          {selectedOffice.businessSectionLandmark || selectedOffice.completeAddress}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hierarchical Incharges */}
                  <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">Office Incharge / SPM</span>
                      <span className="font-black text-slate-900">
                        {selectedOffice.assignedInchargeName || selectedOffice.pincodeManager || 'Assign via Staff Tab'}
                      </span>
                      {selectedOffice.pincodeManagerContact && (
                        <div className="font-mono text-[11px] text-amber-900 mt-0.5">
                          {selectedOffice.pincodeManagerContact}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">District Incharge / DM</span>
                      <span className="font-bold text-slate-900">
                        {selectedOffice.assignedDistrictIncharge || `${selectedOffice.district || 'Kota'} District Manager`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">Block Incharge</span>
                      <span className="font-bold text-slate-900">
                        {selectedOffice.assignedBlockIncharge || selectedOffice.block || 'Block Nodal Desk'}
                      </span>
                    </div>
                  </div>

                  {/* Inline Operational Remarks Editor */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-black text-slate-900">Operational Remarks &amp; Audit Notes</label>
                      {canModifyOffice && (
                        <button
                          type="button"
                          onClick={handleSaveRemarks}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-red-800 text-amber-300 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save size={13} />
                          <span>Save Remarks</span>
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      value={remarksDraft}
                      onChange={(e) => setRemarksDraft(e.target.value)}
                      readOnly={!canModifyOffice}
                      placeholder="Add dispatch cutoff timings, beat notes, EV charging bay remarks, or staffing instructions..."
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                    />
                  </div>

                  {/* Owner & Master Admin Vacant-Only Safe Delete Bar */}
                  {canDeleteOffice && (
                    <div
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        selectedOfficeRealStaff.length === 0
                          ? 'bg-rose-50 border-rose-200'
                          : 'bg-amber-50 border-amber-200'
                      }`}
                    >
                      <div>
                        <div className="font-black text-slate-900 flex items-center gap-1.5">
                          <Trash2 size={14} className="text-rose-700" />
                          <span>Permanent Safe Delete (Vacant Offices Only)</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {selectedOfficeRealStaff.length === 0
                            ? 'This office currently has 0 active staff members assigned. Safe to permanently delete.'
                            : `Locked: ${selectedOfficeRealStaff.length} staff member(s) are currently assigned. Reassign all staff in the Staff tab to enable permanent deletion.`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeleteModalOffice(selectedOffice)}
                        className={`px-4 py-2 rounded-xl font-black text-xs shrink-0 cursor-pointer ${
                          selectedOfficeRealStaff.length === 0
                            ? 'bg-rose-700 hover:bg-rose-800 text-white'
                            : 'bg-white border border-amber-300 text-amber-950 hover:bg-amber-100'
                        }`}
                      >
                        {selectedOfficeRealStaff.length === 0 ? 'Delete Vacant Office' : 'Inspect Delete Check'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: STAFF & QUICK ENTRY (Real Staff + Inline Reassign + Quick Add) */}
              {workspaceTab === 'STAFF' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">
                        Assigned Staff Roster ({selectedOfficeRealStaff.length})
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Only real registered employees/staff assigned to this office are counted here. Reassign staff cleanly across offices or quick-add below.
                      </p>
                    </div>
                    {canModifyOffice && (
                      <button
                        type="button"
                        onClick={() => setShowQuickStaffForm((prev) => !prev)}
                        className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserPlus size={14} />
                        <span>{showQuickStaffForm ? 'Hide Quick Add Form' : '+ Quick Add Staff to Office'}</span>
                      </button>
                    )}
                  </div>

                  {/* Inline Quick Add Staff Form */}
                  {showQuickStaffForm && canModifyOffice && (
                    <form
                      onSubmit={handleQuickAddStaffSubmit}
                      className="bg-white p-4 rounded-2xl border-2 border-red-200 space-y-3 shadow-xs"
                    >
                      <div className="font-black text-red-900 flex items-center gap-1.5">
                        <UserPlus size={15} />
                        <span>Inline Quick Entry → {selectedOffice.officeName} (PIN {selectedOffice.pincode})</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          required
                          placeholder="Staff Full Name *"
                          value={qsName}
                          onChange={(e) => setQsName(e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-semibold"
                        />
                        <input
                          required
                          placeholder="Mobile Number *"
                          value={qsContact}
                          onChange={(e) => setQsContact(e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-mono"
                        />
                        <input
                          placeholder="Employee / CSI ID (auto if blank)"
                          value={qsEmpId}
                          onChange={(e) => setQsEmpId(e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <select
                          value={qsDesig}
                          onChange={(e) => setQsDesig(e.target.value as DesignationType)}
                          className="px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-bold"
                        >
                          {QUICK_STAFF_DESIGNATIONS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <input
                          placeholder="Assigned Beat (e.g. Beat 2)"
                          value={qsBeat}
                          onChange={(e) => setQsBeat(e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                        />
                        <input
                          placeholder="Partner / Vendor Org (optional)"
                          value={qsPartnerOrg}
                          onChange={(e) => setQsPartnerOrg(e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                        />
                      </div>

                      {qsDesig === 'Category Manager' && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                          <div className="text-[11px] font-bold text-slate-700">Assigned Business Categories:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {BUSINESS_SERVICE_CATEGORIES.map((cat) => {
                              const active = qsCategories.includes(cat);
                              return (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() =>
                                    setQsCategories((prev) =>
                                      prev.includes(cat) ? prev.filter((x) => x !== cat) : [...prev, cat]
                                    )
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                                    active
                                      ? 'bg-slate-900 text-amber-300 border-slate-900'
                                      : 'bg-white text-slate-700 border-slate-300'
                                  }`}
                                >
                                  {cat}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowQuickStaffForm(false)}
                          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black cursor-pointer"
                        >
                          Save Staff to {selectedOffice.officeName}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Real Staff List with Instant Verify & Inline Office Reassignment */}
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    {selectedOfficeRealStaff.map((sp) => {
                      const isApproved = sp.permissions?.approvalStatus === 'Approved';
                      return (
                        <div
                          key={sp.id}
                          className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-black text-slate-900 text-sm">{sp.name}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {isApproved ? 'Verified Staff' : 'Pending Verification'}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                                {sp.designation}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              ID: <span className="font-mono font-semibold">{sp.employeeId}</span> • Beat: {sp.beat} • Mobile:{' '}
                              <span className="font-mono text-blue-700 font-bold">{sp.contact}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {canModifyOffice && (
                              <button
                                type="button"
                                onClick={() => handleToggleStaffStatus(sp)}
                                title="Click to cycle status: Approved → Pending Approval → Revoked"
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] border cursor-pointer transition ${
                                  isApproved
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300'
                                    : sp.permissions?.approvalStatus === 'Revoked'
                                    ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300'
                                    : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300'
                                }`}
                              >
                                {sp.permissions?.approvalStatus || 'Approved'} ↻
                              </button>
                            )}

                            {canModifyOffice && (
                              <button
                                type="button"
                                onClick={() => openEditStaffModal(sp)}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition"
                              >
                                <Edit3 size={12} />
                                <span>Edit Staff</span>
                              </button>
                            )}

                            {canInstantVerify && (
                              <button
                                type="button"
                                onClick={() => handleInstantVerifyStaff(sp.email || sp.employeeId || sp.id)}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                                  isApproved
                                    ? 'bg-slate-100 hover:bg-emerald-100 text-slate-700 border border-slate-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                {isApproved ? 'Re-Verify' : 'Instant Verify'}
                              </button>
                            )}

                            {canModifyOffice && (
                              <select
                                aria-label={`Reassign ${sp.name} to another office`}
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleReassignStaff(sp.id || sp.employeeId || sp.email, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-[11px] font-bold text-slate-800 cursor-pointer"
                              >
                                <option value="">Reassign to another office...</option>
                                {offices
                                  .filter((target) => target.id !== selectedOffice.id)
                                  .map((target) => (
                                    <option key={target.id} value={target.id}>
                                      {target.officeName} ({target.pincode})
                                    </option>
                                  ))}
                              </select>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {selectedOfficeRealStaff.length === 0 && (
                      <div className="p-6 text-center text-slate-500 space-y-2">
                        <div className="font-bold text-slate-700">No real staff currently assigned to {selectedOffice.officeName}.</div>
                        <p className="text-[11px]">
                          Status is <strong>Vacant</strong>. Add staff above or permanently delete this office if no longer needed.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: BEATS & PINCODES */}
              {workspaceTab === 'BEATS' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <h4 className="font-black text-slate-900 mb-2">
                      Mapped Delivery Beats ({selectedOffice.mappedBeats.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedOffice.mappedBeats.map((b) => (
                        <span
                          key={b}
                          className="px-3 py-1.5 bg-red-50 text-red-900 border border-red-200 rounded-xl font-bold text-xs"
                        >
                          {b}
                        </span>
                      ))}
                      {selectedOffice.mappedBeats.length === 0 && (
                        <span className="text-slate-400">No individual beats mapped yet.</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <h4 className="font-black text-slate-900 mb-2">
                      Mapped Colonies, Sectors &amp; Coverage Localities ({selectedOffice.mappedColonies.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedOffice.mappedColonies.map((c) => (
                        <span
                          key={c}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl font-semibold text-xs"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PRODUCTS & VENDORS */}
              {workspaceTab === 'PRODUCTS_VENDORS' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900">
                        Products &amp; Partner Stores Linked to {selectedOffice.officeName} (PIN {selectedOffice.pincode})
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Includes direct Company House offerings and Partner/Vendor catalogs mapped to this office.
                      </p>
                    </div>
                    <Link
                      to="/vendor-ecosystem"
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-red-800 text-amber-300 font-black flex items-center gap-1.5"
                    >
                      <span>Open Product Hub</span>
                      <ExternalLink size={13} />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
                      <div className="font-black text-slate-900 flex items-center gap-1.5">
                        <Store size={14} className="text-indigo-700" />
                        <span>Linked Vendor &amp; House Stores ({selectedOfficeLinkedStores.length})</span>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedOfficeLinkedStores.map((st) => (
                          <div key={st.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                            <div>
                              <div className="font-bold text-slate-900">{st.storeName}</div>
                              <div className="text-[11px] text-slate-500">
                                {st.sourceOwnership === 'COMPANY_HOUSE' ? 'XPEEDO / XPO KART Direct' : 'Partner Vendor'} · {st.category}
                              </div>
                            </div>
                            <Link
                              to={`/vendor-ecosystem/${encodeURIComponent(st.id)}`}
                              className="text-red-700 font-bold hover:underline shrink-0"
                            >
                              Inspect →
                            </Link>
                          </div>
                        ))}
                        {selectedOfficeLinkedStores.length === 0 && (
                          <div className="text-slate-400 text-xs py-3">No vendor stores explicitly pinned to PIN {selectedOffice.pincode} yet.</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
                      <div className="font-black text-slate-900 flex items-center gap-1.5">
                        <ShoppingBag size={14} className="text-red-700" />
                        <span>Linked Catalog SKUs ({selectedOfficeLinkedProducts.length})</span>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedOfficeLinkedProducts.slice(0, 20).map((pr) => (
                          <div key={pr.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate">{pr.title}</div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {pr.sourceOwnership === 'COMPANY_HOUSE' ? 'Company House' : 'Partner'} · {pr.serviceCategory || pr.vertical}
                              </div>
                            </div>
                            <span className="font-mono font-black text-slate-900 tabular-nums shrink-0">
                              {pr.price === 0 ? 'FREE' : `₹${pr.price}`}
                            </span>
                          </div>
                        ))}
                        {selectedOfficeLinkedProducts.length === 0 && (
                          <div className="text-slate-400 text-xs py-3">No SKUs linked specifically to this office yet.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: DEEP DIVE & LOGS */}
              {workspaceTab === 'DEEP_DIVE' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-black text-slate-900">Jurisdiction &amp; Designation Breakdown</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Office Record ID</div>
                        <div className="font-mono font-bold text-slate-900 break-all mt-0.5">{selectedOffice.id}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Last Updated</div>
                        <div className="font-mono font-bold text-slate-900 mt-0.5">
                          {new Date(selectedOffice.updatedAt).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Approved Staff</div>
                        <div className="font-mono font-black text-emerald-700 text-base tabular-nums mt-0.5">
                          {selectedOfficeRealStaff.filter((s) => s.permissions?.approvalStatus === 'Approved').length}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Service Categories</div>
                        <div className="font-bold text-slate-900 mt-0.5">
                          {staffPermissionService.deriveOfficeServiceCategories(selectedOffice).length} Active
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-2.5">
                    <Link
                      to="/staff-master"
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5"
                    >
                      <Users size={14} />
                      <span>Open Staff Master</span>
                    </Link>
                    <Link
                      to="/vendor-ecosystem"
                      className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold flex items-center gap-1.5"
                    >
                      <Store size={14} />
                      <span>Open Product &amp; Vendor Hub</span>
                    </Link>
                    <Link
                      to="/role-access-dashboard"
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black flex items-center gap-1.5"
                    >
                      <Shield size={14} />
                      <span>Role &amp; Access Dashboard</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500">
                Xpeedo Unified Office Master • {selectedOffice.circle} · {selectedOffice.division}
              </span>
              <button
                onClick={() => setSelectedOfficeId(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          IN-UI SAFE PERMANENT DELETE MODAL (VACANT OFFICES ONLY)
         ======================================================================== */}
      {deleteModalOffice && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
                  Safe Deletion Guard • Owner &amp; Master Admin
                </div>
                <h3 className="text-base font-black mt-0.5">{deleteModalOffice.officeName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalOffice(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {(() => {
                const assignedList = staffPermissionService.getOfficeAssignedStaff(deleteModalOffice);
                if (assignedList.length > 0) {
                  return (
                    <>
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2">
                        <div className="font-black flex items-center gap-1.5 text-sm">
                          <AlertTriangle size={16} className="text-amber-700 shrink-0" />
                          <span>Deletion Blocked — {assignedList.length} Active Staff Assigned</span>
                        </div>
                        <p>
                          Per Xpeedo Safe Deletion Rules, an office can only be permanently deleted when its real assigned staff count is{' '}
                          <strong>0 (Vacant)</strong>.
                        </p>
                        <div className="text-[11px] font-bold pt-1">
                          Assigned Staff: {assignedList.slice(0, 4).map((s) => s.name).join(', ')}
                          {assignedList.length > 4 ? ` +${assignedList.length - 4} more` : ''}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setDeleteModalOffice(null)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 cursor-pointer"
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const target = deleteModalOffice;
                            setDeleteModalOffice(null);
                            openOfficeWorkspace(target, 'STAFF');
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-red-800 text-amber-300 font-black cursor-pointer"
                        >
                          Open Staff &amp; Reassign First →
                        </button>
                      </div>
                    </>
                  );
                }

                return (
                  <>
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2">
                      <div className="font-black text-sm flex items-center gap-1.5">
                        <Trash2 size={16} className="text-rose-700 shrink-0" />
                        <span>Verified Vacant Office (0 Active Staff)</span>
                      </div>
                      <p>
                        Are you sure you want to permanently delete <strong>{deleteModalOffice.officeName}</strong> (PIN{' '}
                        <span className="font-mono font-bold">{deleteModalOffice.pincode}</span>)? This permanently removes the vacant office from the registry.
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDeleteModalOffice(null)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmPermanentDelete}
                        className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black cursor-pointer"
                      >
                        Permanently Delete Vacant Office
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          REGISTER NEW OFFICE & BUSINESS SECTION MODAL
         ======================================================================== */}
      {showAddOfficeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-red-800 to-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">Register New Office / Business Hub</h3>
                <p className="text-xs text-red-100">
                  Adds Post Office, EV Hub, Logistics Franchise, or Store with PIN code &amp; business vertical
                </p>
              </div>
              <button
                onClick={() => setShowAddOfficeModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOfficeViaStaffEntry} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Circle *</label>
                  <input
                    required
                    value={newCircle}
                    onChange={(e) => setNewCircle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Division *</label>
                  <select
                    value={newDivision}
                    onChange={(e) => handleModalDivisionChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                  >
                    <option value="Kota Division">Kota Division</option>
                    <option value="Baran Division">Baran Division</option>
                    <option value="Bundi Division">Bundi Division</option>
                    <option value="Jhalawar Division">Jhalawar Division</option>
                    <option value="Tonk Division">Tonk Division</option>
                    <option value="Jaipur City Division">Jaipur City Division</option>
                    <option value="Ajmer Division">Ajmer Division</option>
                    <option value="Jodhpur Division">Jodhpur Division</option>
                    <option value="Udaipur Division">Udaipur Division</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District &amp; Block</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      placeholder="District"
                      value={newDistrict}
                      onChange={(e) => setNewDistrict(e.target.value)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-xl"
                    />
                    <input
                      placeholder="Block"
                      value={newBlock}
                      onChange={(e) => setNewBlock(e.target.value)}
                      className="w-full px-2.5 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office Category *</label>
                  <select
                    value={newOfficeType}
                    onChange={(e) => setNewOfficeType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="SO">Sub Post Office (SO)</option>
                    <option value="HO">Head Post Office (HO)</option>
                    <option value="BO">Branch Post Office (BO)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Office Variant *</label>
                  <select
                    value={newOfficeVariant}
                    onChange={(e) => setNewOfficeVariant(e.target.value as OfficeVariantType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-indigo-50/40"
                  >
                    {OFFICE_VARIANT_OPTIONS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-indigo-950 mb-1">Business Section / Unit</label>
                  <input
                    placeholder="e.g. EV Charging & Dispatch Hub"
                    value={newBusinessSectionName}
                    onChange={(e) => setNewBusinessSectionName(e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-200 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-indigo-950 mb-1">Service Category</label>
                  <select
                    value={newBusinessSectionCategory}
                    onChange={(e) => setNewBusinessSectionCategory(e.target.value as BusinessServiceCategory)}
                    className="w-full px-3 py-2 border border-indigo-200 rounded-xl bg-white font-bold"
                  >
                    {BUSINESS_SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-indigo-950 mb-1">Business Landmark</label>
                  <input
                    placeholder="e.g. Opp. Coaching Gate"
                    value={newBusinessSectionLandmark}
                    onChange={(e) => setNewBusinessSectionLandmark(e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-200 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Head Office (HO) *</label>
                  <input
                    required
                    value={newHoName}
                    onChange={(e) => setNewHoName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office / SO Name *</label>
                  <input
                    required
                    placeholder="e.g. Dadabari S.O. / Jaipur EV Hub"
                    value={newSoName}
                    onChange={(e) => setNewSoName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch Office (if any)</label>
                  <input
                    placeholder="e.g. Branch Office Name"
                    value={newBoName}
                    onChange={(e) => setNewBoName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office PIN Code *</label>
                  <input
                    required
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                    placeholder="e.g. 324009"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Complete Physical Address *</label>
                  <input
                    required
                    placeholder="Street/Complex address of Office / Hub"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Beats (comma-separated) *</label>
                  <input
                    required
                    placeholder="Beat 1, Beat 2"
                    value={newBeats}
                    onChange={(e) => setNewBeats(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Colonies / Areas *</label>
                  <input
                    required
                    placeholder="Dadabari, Keshavpura, Talwandi"
                    value={newColonies}
                    onChange={(e) => setNewColonies(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operational Remarks (optional)</label>
                <input
                  placeholder="Initial office notes or dispatch SLA..."
                  value={newOperationalRemarks}
                  onChange={(e) => setNewOperationalRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800">Primary In-Charge (optional — leave blank to register vacant office)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    placeholder="Staff Full Name"
                    value={newInchargeName}
                    onChange={(e) => setNewInchargeName(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                  <input
                    placeholder="Employee ID / CSI ID"
                    value={newInchargeEmpId}
                    onChange={(e) => setNewInchargeEmpId(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-xl bg-white font-mono"
                  />
                  <input
                    placeholder="Official Contact Number"
                    value={newInchargeMobile}
                    onChange={(e) => setNewInchargeMobile(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-xl bg-white font-mono"
                  />
                  <select
                    value={newInchargeDesig}
                    onChange={(e) => setNewInchargeDesig(e.target.value as DesignationType)}
                    className="px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    {QUICK_STAFF_DESIGNATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddOfficeModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold cursor-pointer shadow-md"
                >
                  Save &amp; Register Office
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================
          EDIT OFFICE, VARIANT & BUSINESS SECTION MODAL
         ======================================================================== */}
      {editingOffice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-amber-700 to-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-400 text-slate-950">
                  Office Profile &amp; Jurisdiction Editor
                </span>
                <h3 className="text-lg font-black mt-1">Edit {editingOffice.officeName}</h3>
                <p className="text-xs text-amber-100">
                  Update Office Variant, Business Section, District/Block, PIN {editingOffice.pincode}, and Supervisor details
                </p>
              </div>
              <button
                onClick={() => setEditingOffice(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedOffice} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office Name / SO Name *</label>
                  <input
                    required
                    value={editOfficeName}
                    onChange={(e) => setEditOfficeName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office Category *</label>
                  <select
                    value={editOfficeType}
                    onChange={(e) => setEditOfficeType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="SO">Sub Post Office (SO)</option>
                    <option value="HO">Head Post Office (HO)</option>
                    <option value="BO">Branch Post Office (BO)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office Variant *</label>
                  <select
                    value={editOfficeVariant}
                    onChange={(e) => setEditOfficeVariant(e.target.value as OfficeVariantType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-indigo-50/40"
                  >
                    {OFFICE_VARIANT_OPTIONS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-indigo-950 mb-1">Business Section</label>
                  <input
                    value={editBusinessSectionName}
                    onChange={(e) => setEditBusinessSectionName(e.target.value)}
                    placeholder="e.g. XPOKART Dispatch Desk"
                    className="w-full px-3 py-2 border border-indigo-200 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-indigo-950 mb-1">Service Category</label>
                  <select
                    value={editBusinessSectionCategory}
                    onChange={(e) => setEditBusinessSectionCategory(e.target.value as BusinessServiceCategory)}
                    className="w-full px-3 py-2 border border-indigo-200 rounded-xl bg-white font-bold"
                  >
                    {BUSINESS_SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-indigo-950 mb-1">Landmark</label>
                  <input
                    value={editBusinessSectionLandmark}
                    onChange={(e) => setEditBusinessSectionLandmark(e.target.value)}
                    className="w-full px-3 py-2 border border-indigo-200 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Division *</label>
                  <input
                    required
                    value={editDivision}
                    onChange={(e) => setEditDivision(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District</label>
                  <input
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Block / Sub-Division</label>
                  <input
                    value={editBlock || editSubDivision}
                    onChange={(e) => {
                      setEditBlock(e.target.value);
                      setEditSubDivision(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PIN Code *</label>
                  <input
                    required
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Complete Address *</label>
                  <input
                    required
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mapped Beats (comma-separated) *</label>
                  <input
                    required
                    value={editBeats}
                    onChange={(e) => setEditBeats(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mapped Colonies / Areas *</label>
                  <input
                    required
                    value={editColonies}
                    onChange={(e) => setEditColonies(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-300 space-y-3">
                <div className="font-black text-amber-900 flex items-center gap-1.5">
                  <Users size={15} />
                  <span>Pincode-wise Supervisor &amp; Operational Remarks</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pincode Manager / Supervisor Name</label>
                    <input
                      value={editManagerName}
                      onChange={(e) => setEditManagerName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Supervisor Contact Phone</label>
                    <input
                      value={editManagerContact}
                      onChange={(e) => setEditManagerContact(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-mono"
                    />
                  </div>
                </div>
                <textarea
                  rows={2}
                  placeholder="Operational remarks..."
                  value={editOperationalRemarks}
                  onChange={(e) => setEditOperationalRemarks(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingOffice(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black cursor-pointer shadow-md"
                >
                  Save Office Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================
          EDIT ASSIGNED STAFF MEMBER MODAL (Full Add/Edit with status & BO/Beat)
         ======================================================================== */}
      {editingStaffMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-blue-900 to-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-500 text-white">
                  Staff Roster &amp; Assignment Editor
                </span>
                <h3 className="text-lg font-black mt-1">Edit Staff: {editingStaffMember.name}</h3>
                <p className="text-xs text-blue-100">
                  Update designation, beat mapping, branch office (BO), mobile, and operational status
                </p>
              </div>
              <button
                onClick={() => setEditingStaffMember(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStaffMember} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Staff Full Name *</label>
                  <input
                    required
                    value={esmName}
                    onChange={(e) => setEsmName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Mobile Number *</label>
                  <input
                    required
                    value={esmContact}
                    onChange={(e) => setEsmContact(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee ID / CSI ID</label>
                  <input
                    value={esmEmpId}
                    onChange={(e) => setEsmEmpId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Designation *</label>
                  <select
                    value={esmDesig}
                    onChange={(e) => setEsmDesig(e.target.value as DesignationType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    {QUICK_STAFF_DESIGNATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Delivery Beat *</label>
                  <input
                    required
                    value={esmBeat}
                    onChange={(e) => setEsmBeat(e.target.value)}
                    placeholder="e.g. Beat 1 / Borabas Beat 1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch Office (BO) / Posting</label>
                  <input
                    value={esmBranchOffice}
                    onChange={(e) => setEsmBranchOffice(e.target.value)}
                    placeholder="e.g. Borabas B.O. / Sogaria B.O."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Approval Status</label>
                  <select
                    value={esmApprovalStatus}
                    onChange={(e) => setEsmApprovalStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                  >
                    <option value="Approved">Approved (Full Active Access)</option>
                    <option value="Pending Approval">Pending Approval (Restricted)</option>
                    <option value="Revoked">Revoked (Access Suspended)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duty Status</label>
                  <select
                    value={esmDutyStatus}
                    onChange={(e) => setEsmDutyStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                  >
                    <option value="Active on Duty">Active on Duty</option>
                    <option value="In Office">In Office</option>
                    <option value="Supervising">Supervising</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingStaffMember(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-black cursor-pointer shadow-md"
                >
                  Save Staff Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
