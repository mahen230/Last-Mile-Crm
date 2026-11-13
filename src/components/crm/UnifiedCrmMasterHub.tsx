import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  Users,
  Database,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Filter,
  ShieldCheck,
  Building,
  Building2,
  Phone,
  FileSpreadsheet,
  Download,
  Upload,
  Trash2,
  Edit2,
  ArrowRight,
  Sparkles,
  Layers,
  Map as MapIcon,
  X,
  Check,
  RefreshCw,
  Home,
  Briefcase,
  Landmark,
  Globe,
  Navigation,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { staffPermissionService } from '../../services/staffPermissionService';
import { masterDataService } from '../../services/masterDataService';
import { ColonyMasterRecord, ColonyEntityType, OfficeJurisdiction } from '../../types/models';
import { useAuth } from '../auth/FirebaseAuthProvider';

import { UPDATED_STAFF_LIST } from '../../data/updatedStaffData';

export interface ColonyMapping {
  id: string;
  colonyName: string;
  sectorPhase: string;
  pincode: string;
  subOffice: string;
  beatNo: string;
  staffId?: string;
  postmanName: string;
  landmarks: string;
  totalDeliveries?: number;
  createdAt?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  mobile: string;
  colony: string;
  sector: string;
  houseNo?: string;
  pincode: string;
  beatNo: string;
  staffId?: string;
  postmanName?: string;
  householdType: 'Residential' | 'Commercial' | 'Government';
  createdAt?: string;
}

const INITIAL_COLONIES: ColonyMapping[] = [
  {
    id: '1',
    colonyName: 'Mahaveer Nagar Vistar',
    sectorPhase: 'Sector 1',
    pincode: '324009',
    subOffice: 'Dadabari S.O.',
    beatNo: 'Beat 5',
    staffId: 'STAFF-10310736',
    postmanName: 'Mohit Arvind',
    landmarks: 'Samrat Chowk, Near Central Park',
    totalDeliveries: 420,
    createdAt: '2026-01-10',
  },
  {
    id: '2',
    colonyName: 'Mahaveer Nagar Vistar',
    sectorPhase: 'Sector 2',
    pincode: '324009',
    subOffice: 'Dadabari S.O.',
    beatNo: 'Beat 5',
    staffId: 'STAFF-10310736',
    postmanName: 'Mohit Arvind',
    landmarks: 'Main Road Market, Jain Temple',
    totalDeliveries: 380,
    createdAt: '2026-01-12',
  },
  {
    id: '3',
    colonyName: 'Dadabari Main Chauraha',
    sectorPhase: 'Shopping Centre & Block A',
    pincode: '324009',
    subOffice: 'Dadabari S.O.',
    beatNo: 'Beat 2',
    staffId: 'STAFF-50457421',
    postmanName: 'Mahendra Kumar Meena',
    landmarks: 'Near Post Office, SBI Dadabari',
    totalDeliveries: 510,
    createdAt: '2026-01-15',
  },
  {
    id: '4',
    colonyName: 'Teachers Colony & Shastri Nagar',
    sectorPhase: 'Phase 1',
    pincode: '324009',
    subOffice: 'Dadabari S.O.',
    beatNo: 'Beat 1',
    staffId: 'STAFF-50510312',
    postmanName: 'Muskan Sharma',
    landmarks: 'Govt Senior Secondary School, Water Tank',
    totalDeliveries: 290,
    createdAt: '2026-02-01',
  },
  {
    id: '5',
    colonyName: 'Basant Vihar',
    sectorPhase: 'Sector A & B',
    pincode: '324009',
    subOffice: 'Dadabari S.O.',
    beatNo: 'Beat 3',
    staffId: 'STAFF-50510313',
    postmanName: 'Manali Ahuja',
    landmarks: 'Community Hall, Shiv Mandir',
    totalDeliveries: 340,
    createdAt: '2026-02-10',
  },
  {
    id: '6',
    colonyName: 'Keshavpura Vistar',
    sectorPhase: 'Sector 4',
    pincode: '324009',
    subOffice: 'Dadabari S.O.',
    beatNo: 'Beat 4',
    staffId: 'STAFF-10310735',
    postmanName: 'Govind Prasad',
    landmarks: 'Keshavpura Road, Sabzi Mandi',
    totalDeliveries: 450,
    createdAt: '2026-02-18',
  },
  {
    id: '7',
    colonyName: 'Rangbari Road Enclave',
    sectorPhase: 'Sector 1 & 2',
    pincode: '324009',
    subOffice: 'Dadabari S.O.',
    beatNo: 'Beat 16',
    staffId: 'STAFF-50561337',
    postmanName: 'Nitesh Mittal',
    landmarks: 'Subhash Circle, Veer Savarkar Park',
    totalDeliveries: 390,
    createdAt: '2026-02-25',
  },
  {
    id: '8',
    colonyName: 'Thermal Colony & Quarters',
    sectorPhase: 'Phase 3 VIP',
    pincode: '324009',
    subOffice: 'Dadabari S.O.',
    beatNo: 'Beat 33',
    staffId: 'STAFF-10310738',
    postmanName: 'Jitendra Kumar Meena',
    landmarks: 'Thermal Gate 3, VIP Circuit House Road',
    totalDeliveries: 310,
    createdAt: '2026-03-01',
  },
];

const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'c1',
    name: 'Anil Kumar Agarwal',
    mobile: '9829012345',
    colony: 'Mahaveer Nagar Vistar',
    sector: 'Sector 1',
    houseNo: '1-B-14',
    pincode: '324009',
    beatNo: 'Beat 5',
    staffId: 'STAFF-10310736',
    postmanName: 'Mohit Arvind',
    householdType: 'Residential',
    createdAt: '2026-03-01',
  },
  {
    id: 'c2',
    name: 'Kota Coaching Stationery Hub',
    mobile: '9414056789',
    colony: 'Mahaveer Nagar Vistar',
    sector: 'Sector 2',
    houseNo: 'Shop 24, Commercial Complex',
    pincode: '324009',
    beatNo: 'Beat 5',
    staffId: 'STAFF-10310736',
    postmanName: 'Mohit Arvind',
    householdType: 'Commercial',
    createdAt: '2026-03-02',
  },
  {
    id: 'c3',
    name: 'Govt Senior Sec School Dadabari',
    mobile: '0744234567',
    colony: 'Teachers Colony & Shastri Nagar',
    sector: 'Phase 1',
    houseNo: 'Main Campus Gate',
    pincode: '324009',
    beatNo: 'Beat 1',
    staffId: 'STAFF-50510312',
    postmanName: 'Muskan Sharma',
    householdType: 'Government',
    createdAt: '2026-03-04',
  },
  {
    id: 'c4',
    name: 'Dr. Sunita Sharma Clinic',
    mobile: '9828876543',
    colony: 'Dadabari Main Chauraha',
    sector: 'Shopping Centre & Block A',
    houseNo: 'A-12 Medical Enclave',
    pincode: '324009',
    beatNo: 'Beat 2',
    staffId: 'STAFF-50457421',
    postmanName: 'Mahendra Kumar Meena',
    householdType: 'Commercial',
    createdAt: '2026-03-05',
  },
];

// All 33 beats mapped dynamically to official Staff Directory
export const BEAT_STAFF_DIRECTORY: Record<string, { name: string; id: string; contact: string; role: string }> = {};
UPDATED_STAFF_LIST.forEach((s) => {
  BEAT_STAFF_DIRECTORY[s.beat] = {
    name: s.name,
    id: s.id,
    contact: s.contact,
    role: s.role,
  };
});

// Backward-compatible simple name catalog
export const BEAT_POSTMAN_CATALOG: Record<string, string> = {};
UPDATED_STAFF_LIST.forEach((s) => {
  BEAT_POSTMAN_CATALOG[s.beat] = s.name;
});

export const DADABARI_ALL_BEATS = Array.from({ length: 33 }, (_, i) => `Beat ${i + 1}`);

const SUB_OFFICES = [
  { name: 'Dadabari S.O.', pincode: '324009' },
  { name: 'PIP Office / Talwandi S.O.', pincode: '324005' },
  { name: 'Mahaveer Nagar S.O.', pincode: '324005' },
  { name: 'Vigyan Nagar S.O.', pincode: '324005' },
  { name: 'Engineering College S.O.', pincode: '324010' },
  { name: 'Kota H.O.', pincode: '324001' },
];

export default function UnifiedCrmMasterHub() {
  const { userProfile } = useAuth();
  const isRestrictedStaff = staffPermissionService.isPostmanOrGds(userProfile);
  const scopedBeatsSet = useMemo(
    () => staffPermissionService.getScopedBeatsSet(userProfile),
    [userProfile]
  );

  // Master Database States (with localStorage persistence)
  const [colonies, setColonies] = useState<ColonyMapping[]>(() => {
    try {
      const stored = localStorage.getItem('unified_colonies_master_v3');
      return stored ? JSON.parse(stored) : INITIAL_COLONIES;
    } catch {
      return INITIAL_COLONIES;
    }
  });

  const [customers, setCustomers] = useState<CustomerRecord[]>(() => {
    try {
      const stored = localStorage.getItem('unified_customers_master_v3');
      return stored ? JSON.parse(stored) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  // Active View Tab (Colony Directory Master first by default)
  const [activeTab, setActiveTab] = useState<'division-colonies' | 'colonies' | 'customers' | 'bulk'>('division-colonies');

  // Pagination States (Default max 5 entries per card / paginated view)
  const MASTER_PAGE_SIZE = 5;
  const [divisionPage, setDivisionPage] = useState<number>(1);
  const [legacyColonyPage, setLegacyColonyPage] = useState<number>(1);
  const [customerPage, setCustomerPage] = useState<number>(1);

  // Hadoti Division Colony Master State (Kota, Baran, Bundi)
  const [divisionColonies, setDivisionColonies] = useState<ColonyMasterRecord[]>(() =>
    masterDataService.getColonyMasterRecords()
  );
  const [divisionFilter, setDivisionFilter] = useState<'ALL' | 'KOTA' | 'BARAN' | 'BUNDI' | 'PENDING'>('ALL');
  const [pincodeFilter, setPincodeFilter] = useState<string>('ALL');
  const [officeJurisdictionFilter, setOfficeJurisdictionFilter] = useState<string>('ALL');
  const [divisionSearch, setDivisionSearch] = useState('');

  // Block-wise Collapsible Section States & Quick-Jump Refs (Module 1)
  const [isBlockAOpen, setIsBlockAOpen] = useState<boolean>(true);
  const [isBlockBOpen, setIsBlockBOpen] = useState<boolean>(false);
  const [isBlockCOpen, setIsBlockCOpen] = useState<boolean>(true);
  const [isBlockDOpen, setIsBlockDOpen] = useState<boolean>(true);
  const blockARef = useRef<HTMLDivElement>(null);
  const blockBRef = useRef<HTMLDivElement>(null);
  const blockCRef = useRef<HTMLDivElement>(null);
  const blockDRef = useRef<HTMLDivElement>(null);

  const [hadotiColonyName, setHadotiColonyName] = useState('');
  const [hadotiEntityType, setHadotiEntityType] = useState<ColonyEntityType>('Residential Colony');
  const [hadotiPincode, setHadotiPincode] = useState('324009');
  const [hadotiDivision, setHadotiDivision] = useState<'KOTA' | 'BARAN' | 'BUNDI'>('KOTA');
  const [hadotiPostOfficeName, setHadotiPostOfficeName] = useState('Dadabari S.O.');
  const [hadotiLat, setHadotiLat] = useState('25.1432');
  const [hadotiLng, setHadotiLng] = useState('75.8234');
  const [hadotiSubSectors, setHadotiSubSectors] = useState('Sector 1, Sector 2');
  const [hadotiBlocks, setHadotiBlocks] = useState('Block A, Block B');
  const [hadotiLandmarks, setHadotiLandmarks] = useState('');
  const [hadotiHouseNumberRange, setHadotiHouseNumberRange] = useState('');
  const [hadotiAssignedBeat, setHadotiAssignedBeat] = useState('Beat 2');
  const [hadotiStatusMessage, setHadotiStatusMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [inlineBeatEditId, setInlineBeatEditId] = useState<string | null>(null);
  const [inlineBeatValue, setInlineBeatValue] = useState('');
  const [inlineSectorInputMap, setInlineSectorInputMap] = useState<Record<string, string>>({});
  const [inlineLandmarkInputMap, setInlineLandmarkInputMap] = useState<Record<string, string>>({});
  const [warningToast, setWarningToast] = useState<string | null>(null);

  // Advanced Colony, Landmark & Sector Editing Governance Modal State
  const [editingHadotiColony, setEditingHadotiColony] = useState<ColonyMasterRecord | null>(null);
  const [editColonyName, setEditColonyName] = useState('');
  const [editEntityType, setEditEntityType] = useState<ColonyEntityType>('Residential Colony');
  const [editPincode, setEditPincode] = useState('');
  const [editDivision, setEditDivision] = useState<'KOTA' | 'BARAN' | 'BUNDI'>('KOTA');
  const [editPostOfficeName, setEditPostOfficeName] = useState('');
  const [editAssignedBeat, setEditAssignedBeat] = useState('');
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');
  const [editGoogleMapsUrl, setEditGoogleMapsUrl] = useState('');
  const [editSubSectors, setEditSubSectors] = useState<string[]>([]);
  const [editBlocks, setEditBlocks] = useState<string[]>([]);
  const [editLandmarks, setEditLandmarks] = useState<string[]>([]);
  const [editHouseNumberRange, setEditHouseNumberRange] = useState('');
  const [newEditSectorInput, setNewEditSectorInput] = useState('');
  const [newEditBlockInput, setNewEditBlockInput] = useState('');
  const [newEditLandmarkInput, setNewEditLandmarkInput] = useState('');

  // In-app Delete Confirmation Modal State (zero window.confirm usage)
  const [pendingDeleteTarget, setPendingDeleteTarget] = useState<{
    type: 'division' | 'legacy-colony' | 'customer';
    id: string;
    name: string;
    pincode?: string;
  } | null>(null);

  // Delivery Office Filter (Core User Request)
  const [selectedOfficeFilter, setSelectedOfficeFilter] = useState<string>('Dadabari S.O.');

  // Form Inputs - Colony Registration
  const [newColonyName, setNewColonyName] = useState('');
  const [newSector, setNewSector] = useState('');
  const [newPincode, setNewPincode] = useState('324009');
  const [newSubOffice, setNewSubOffice] = useState('Dadabari S.O.');
  const [newBeatNo, setNewBeatNo] = useState('Beat 2');
  const [newStaffId, setNewStaffId] = useState('STAFF-50457421');
  const [newPostmanName, setNewPostmanName] = useState('Mahendra Kumar Meena');
  const [newLandmarks, setNewLandmarks] = useState('');

  // Form Inputs - Customer Address Registration
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custHouseNo, setCustHouseNo] = useState('');
  const [custSector, setCustSector] = useState('');
  const [custLandmark, setCustLandmark] = useState('');
  const [selectedColonyId, setSelectedColonyId] = useState('');
  const [custHouseholdType, setCustHouseholdType] = useState<'Residential' | 'Commercial' | 'Government'>('Residential');

  // Search, Filters & Alerts
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBeatFilter, setSelectedBeatFilter] = useState('ALL');
  const [selectedHouseholdFilter, setSelectedHouseholdFilter] = useState('ALL');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [preventedCount, setPreventedCount] = useState<number>(3);

  // File Upload & Bulk Processing
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);

  // Editing state for Colony
  const [editingColony, setEditingColony] = useState<ColonyMapping | null>(null);

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('unified_colonies_master', JSON.stringify(colonies));
    } catch {
      // ignore
    }
  }, [colonies]);

  useEffect(() => {
    try {
      localStorage.setItem('unified_customers_master', JSON.stringify(customers));
    } catch {
      // ignore
    }
  }, [customers]);

  // MasterDataService subscription for Hadoti Division Colonies
  useEffect(() => {
    const unsub = masterDataService.subscribe(() => {
      setDivisionColonies(masterDataService.getColonyMasterRecords());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isRestrictedStaff && userProfile?.beat && userProfile.beat !== 'All Beats') {
      setHadotiAssignedBeat(userProfile.beat);
      setNewBeatNo(userProfile.beat);
      const staff = BEAT_STAFF_DIRECTORY[userProfile.beat];
      if (staff) {
        setNewPostmanName(staff.name);
        setNewStaffId(staff.id);
      } else {
        setNewPostmanName(userProfile.name);
        setNewStaffId(userProfile.employeeId || userProfile.id);
      }
      if (userProfile.subOffice) {
        setSelectedOfficeFilter(userProfile.subOffice);
      }
    }
  }, [isRestrictedStaff, userProfile]);

  useEffect(() => {
    setDivisionPage(1);
  }, [divisionFilter, pincodeFilter, officeJurisdictionFilter, divisionSearch]);

  // Beat- & Office-Scoped Division Colonies (Unrestricted for Master Admin / Admin)
  const scopedDivisionColonies = useMemo(() => {
    if (!isRestrictedStaff) return divisionColonies;
    return divisionColonies.filter((c) =>
      staffPermissionService.matchesUserColonyAndOfficeScope(userProfile, {
        beatNumber: c.assignedBeat === 'PENDING_ASSIGNMENT' ? '' : c.assignedBeat,
        officeName: c.postOfficeName,
        pincode: c.pincode,
        colonyName: c.colonyName,
      })
    );
  }, [divisionColonies, isRestrictedStaff, userProfile]);

  // Registered Office Jurisdictions strictly typed with OfficeJurisdiction[]
  const officeJurisdictions = useMemo<OfficeJurisdiction[]>(() => {
    const allOffices = masterDataService.getOfficeJurisdictions();
    if (!isRestrictedStaff || !userProfile) return allOffices;
    const userPin = (userProfile.officePincode || '').trim();
    const userPo = (userProfile.postOfficeName || userProfile.subOffice || '').trim().toLowerCase();
    const filtered = allOffices.filter((oj) => {
      if (userPin && oj.pincode.trim() === userPin) return true;
      if (userPo && (oj.officeName.toLowerCase().includes(userPo) || userPo.includes(oj.officeName.toLowerCase()))) return true;
      return false;
    });
    return filtered.length > 0 ? filtered : allOffices.filter((oj) => oj.pincode === '324009');
  }, [divisionColonies, isRestrictedStaff, userProfile]);

  // Available unique Pincodes in Colony Master for Pincode Filter dropdown
  const availableMasterPincodes = useMemo(() => {
    type PinSummary = { pincode: string; office: string; count: number };
    const counts = new Map<string, PinSummary>();
    scopedDivisionColonies.forEach((c) => {
      const pin = c.pincode.trim();
      if (!pin) return;
      const existing = counts.get(pin);
      if (existing) {
        existing.count += 1;
        if (!existing.office.includes(c.postOfficeName)) {
          existing.office = `${existing.office} / ${c.postOfficeName}`;
        }
      } else {
        counts.set(pin, { pincode: pin, office: c.postOfficeName, count: 1 });
      }
    });
    const result: PinSummary[] = [];
    counts.forEach((v) => result.push(v));
    return result.sort((a, b) => a.pincode.localeCompare(b.pincode));
  }, [scopedDivisionColonies]);

  // Strict Office & Pincode-Scoped Filtering (Zero cross-pincode leakage)
  const filteredDivisionColonies = useMemo(() => {
    let selectedOfficeName = '';
    let selectedOfficePin = '';
    if (officeJurisdictionFilter !== 'ALL') {
      const [oName, oPin] = officeJurisdictionFilter.split('__');
      selectedOfficeName = (oName || '').trim().toLowerCase();
      selectedOfficePin = (oPin || '').trim();
    }

    return scopedDivisionColonies.filter((c) => {
      if (divisionFilter === 'KOTA' && c.division !== 'KOTA') return false;
      if (divisionFilter === 'BARAN' && c.division !== 'BARAN') return false;
      if (divisionFilter === 'BUNDI' && c.division !== 'BUNDI') return false;
      if (divisionFilter === 'PENDING' && c.status !== 'PENDING_BEAT_MAPPING') return false;

      if (officeJurisdictionFilter !== 'ALL') {
        if (c.pincode.trim() !== selectedOfficePin) return false;
        if (c.postOfficeName.trim().toLowerCase() !== selectedOfficeName) return false;
      }

      if (pincodeFilter !== 'ALL' && c.pincode.trim() !== pincodeFilter.trim()) {
        return false;
      }

      if (divisionSearch.trim()) {
        const q = divisionSearch.toLowerCase().trim();
        const matchName = c.colonyName.toLowerCase().includes(q);
        const matchPin = c.pincode.includes(q);
        const matchPo = c.postOfficeName.toLowerCase().includes(q);
        const matchBeat = (c.assignedBeat || '').toLowerCase().includes(q);
        const matchSectors = (c.subSectors || []).some((s) => s.toLowerCase().includes(q));
        const matchBlocks = (c.blocks || []).some((b) => b.toLowerCase().includes(q));
        const matchLandmarks = (c.landmarks || []).some((l) => l.toLowerCase().includes(q));
        if (
          !matchName &&
          !matchPin &&
          !matchPo &&
          !matchBeat &&
          !matchSectors &&
          !matchBlocks &&
          !matchLandmarks
        ) {
          return false;
        }
      }
      return true;
    });
  }, [scopedDivisionColonies, divisionFilter, pincodeFilter, officeJurisdictionFilter, divisionSearch]);

  const totalDivisionPages = Math.max(1, Math.ceil(filteredDivisionColonies.length / MASTER_PAGE_SIZE));
  const safeDivisionPage = Math.min(divisionPage, totalDivisionPages);
  const paginatedDivisionColonies = filteredDivisionColonies.slice(
    (safeDivisionPage - 1) * MASTER_PAGE_SIZE,
    safeDivisionPage * MASTER_PAGE_SIZE
  );

  const scrollToBlock = (block: 'A' | 'B' | 'C' | 'D') => {
    if (block === 'A') {
      setIsBlockAOpen(true);
      setTimeout(() => blockARef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
    } else if (block === 'B') {
      setIsBlockBOpen(true);
      setTimeout(() => blockBRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
    } else if (block === 'C') {
      setIsBlockCOpen(true);
      setTimeout(() => blockCRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
    } else if (block === 'D') {
      setIsBlockDOpen(true);
      setTimeout(() => blockDRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
    }
  };

  const showWarningToast = (msg: string) => {
    setWarningToast(msg);
    setTimeout(() => {
      setWarningToast(null);
    }, 5000);
  };

  const normalizeColonyNameKey = (val: string) => val.trim().replace(/\s+/g, ' ').toLowerCase();

  const handleRegisterHadotiColony = (e: React.FormEvent) => {
    e.preventDefault();
    setHadotiStatusMessage(null);

    const trimmedName = hadotiColonyName.trim().replace(/\s+/g, ' ');
    const trimmedPin = hadotiPincode.trim();
    const trimmedPo = hadotiPostOfficeName.trim();

    if (!trimmedName || !trimmedPin || !trimmedPo) {
      const msg = 'Colony Name, Pincode, and Post Office are mandatory fields.';
      setHadotiStatusMessage({ success: false, text: msg });
      showWarningToast(msg);
      return;
    }

    if (!/^\d{6}$/.test(trimmedPin)) {
      const msg = 'Please enter a valid 6-digit Indian Postal Pincode (e.g., 324009).';
      setHadotiStatusMessage({ success: false, text: msg });
      showWarningToast(msg);
      return;
    }

    // Strict Composite Duplicate Prevention on Colony Name + Postal Pincode
    const duplicate = divisionColonies.find(
      (c) =>
        normalizeColonyNameKey(c.colonyName) === normalizeColonyNameKey(trimmedName) &&
        c.pincode.trim() === trimmedPin
    );
    if (duplicate) {
      setPreventedCount((prev) => prev + 1);
      const msg = `Duplicate Entry Blocked: "${duplicate.colonyName}" is already registered under PIN ${duplicate.pincode} (${duplicate.postOfficeName}). Use Edit or "+ Add Landmark" on its card instead.`;
      setDuplicateWarning(msg);
      setHadotiStatusMessage({ success: false, text: msg });
      showWarningToast(msg);
      return;
    }

    setDuplicateWarning(null);
    const latNum = parseFloat(hadotiLat) || 25.1432;
    const lngNum = parseFloat(hadotiLng) || 75.8234;
    const parseCsv = (val: string) =>
      val.trim()
        ? Array.from(new Set(val.split(',').map((s) => s.trim()).filter(Boolean)))
        : undefined;

    const subSectorsList = parseCsv(hadotiSubSectors);
    const blocksList = parseCsv(hadotiBlocks);
    const landmarksList = parseCsv(hadotiLandmarks);

    const res = masterDataService.addColonyMasterRecord({
      colonyName: trimmedName,
      entityType: hadotiEntityType,
      pincode: trimmedPin,
      division: hadotiDivision,
      postOfficeName: trimmedPo,
      subSectors: subSectorsList,
      blocks: blocksList,
      landmarks: landmarksList,
      houseNumberRange: hadotiHouseNumberRange.trim() || undefined,
      geoTag: {
        lat: latNum,
        lng: lngNum,
        googleMapsUrl: `https://www.google.com/maps?q=${latNum},${lngNum}`,
      },
      assignedBeat: hadotiAssignedBeat.trim() ? hadotiAssignedBeat.trim() : undefined,
    });

    if (res.success) {
      setHadotiStatusMessage({ success: true, text: res.message });
      setHadotiColonyName('');
      setHadotiLandmarks('');
      setHadotiHouseNumberRange('');
      showSuccessNotification(res.message);
    } else {
      setHadotiStatusMessage({ success: false, text: res.message });
      showWarningToast(res.message);
    }
  };

  const handleUpdateHadotiBeat = (id: string, beatValue: string) => {
    const success = masterDataService.updateColonyMasterRecord(id, {
      assignedBeat: beatValue.trim() || undefined,
    });
    if (success) {
      setInlineBeatEditId(null);
      setInlineBeatValue('');
      showSuccessNotification('Beat assignment updated successfully!');
    }
  };

  // On-the-Fly Inline Landmark Addition & Removal (Zero data reset)
  const handleQuickAddLandmark = (col: ColonyMasterRecord) => {
    const candidate = (inlineLandmarkInputMap[col.id] || '').trim();
    if (!candidate) return;
    const current = col.landmarks || [];
    if (current.some((l) => l.trim().toLowerCase() === candidate.toLowerCase())) {
      showWarningToast(`Landmark "${candidate}" already exists in ${col.colonyName} (PIN ${col.pincode}).`);
      return;
    }
    const updated = [...current, candidate];
    const ok = masterDataService.updateColonyMasterRecord(col.id, { landmarks: updated });
    if (ok) {
      setInlineLandmarkInputMap((prev) => ({ ...prev, [col.id]: '' }));
      showSuccessNotification(`Added landmark "${candidate}" to ${col.colonyName} (PIN ${col.pincode}).`);
    }
  };

  const handleQuickRemoveLandmark = (col: ColonyMasterRecord, landmarkName: string) => {
    const updated = (col.landmarks || []).filter((l) => l !== landmarkName);
    const ok = masterDataService.updateColonyMasterRecord(col.id, { landmarks: updated });
    if (ok) {
      showSuccessNotification(`Removed landmark "${landmarkName}" from ${col.colonyName}.`);
    }
  };

  // Granular Sector & Pocket Management Handlers
  const handleAddSubSector = (colonyId: string, colonyName: string) => {
    const rawVal = inlineSectorInputMap[colonyId]?.trim();
    if (!rawVal) return;
    const target = divisionColonies.find((c) => c.id === colonyId);
    if (!target) return;
    const currentSectors = target.subSectors || [];
    if (currentSectors.some((s) => s.toLowerCase() === rawVal.toLowerCase())) {
      setDuplicateWarning(`Sector/Pocket "${rawVal}" already exists in ${colonyName}!`);
      showWarningToast(`Sector/Pocket "${rawVal}" already exists in ${colonyName}!`);
      return;
    }
    const updatedSectors = [...currentSectors, rawVal];
    masterDataService.updateColonyMasterRecord(colonyId, { subSectors: updatedSectors });
    setInlineSectorInputMap((prev) => ({ ...prev, [colonyId]: '' }));
    showSuccessNotification(`Added pocket/sector "${rawVal}" to ${colonyName}`);
  };

  const handleRemoveSubSector = (colonyId: string, colonyName: string, sectorName: string) => {
    const target = divisionColonies.find((c) => c.id === colonyId);
    if (!target) return;
    const updatedSectors = (target.subSectors || []).filter((s) => s !== sectorName);
    masterDataService.updateColonyMasterRecord(colonyId, { subSectors: updatedSectors });
    showSuccessNotification(`Removed sector "${sectorName}" from ${colonyName}`);
  };

  // Colony, Landmark & Sector Edit Governance Modal Handlers
  const handleOpenEditHadotiModal = (col: ColonyMasterRecord) => {
    setEditingHadotiColony(col);
    setEditColonyName(col.colonyName);
    setEditEntityType(col.entityType || 'Residential Colony');
    setEditPincode(col.pincode);
    setEditDivision(col.division);
    setEditPostOfficeName(col.postOfficeName);
    setEditAssignedBeat(col.assignedBeat && col.assignedBeat !== 'PENDING_ASSIGNMENT' ? col.assignedBeat : '');
    setEditLat(col.geoTag.lat.toString());
    setEditLng(col.geoTag.lng.toString());
    setEditGoogleMapsUrl(col.geoTag.googleMapsUrl || `https://www.google.com/maps?q=${col.geoTag.lat},${col.geoTag.lng}`);
    setEditSubSectors([...(col.subSectors || [])]);
    setEditBlocks([...(col.blocks || [])]);
    setEditLandmarks([...(col.landmarks || [])]);
    setEditHouseNumberRange(col.houseNumberRange || '');
    setNewEditSectorInput('');
    setNewEditBlockInput('');
    setNewEditLandmarkInput('');
  };

  const handleSaveEditedHadotiColony = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHadotiColony) return;
    const trimmedName = editColonyName.trim().replace(/\s+/g, ' ');
    const trimmedPin = editPincode.trim();

    if (!/^\d{6}$/.test(trimmedPin)) {
      showWarningToast('Please enter a valid 6-digit Indian Postal Pincode.');
      return;
    }

    // Prevent colliding with another existing Colony Name + Pincode record
    const duplicate = divisionColonies.find(
      (c) =>
        c.id !== editingHadotiColony.id &&
        normalizeColonyNameKey(c.colonyName) === normalizeColonyNameKey(trimmedName) &&
        c.pincode.trim() === trimmedPin
    );
    if (duplicate) {
      setPreventedCount((prev) => prev + 1);
      const msg = `Update Blocked: Another colony named "${duplicate.colonyName}" already exists under PIN ${duplicate.pincode}.`;
      setDuplicateWarning(msg);
      showWarningToast(msg);
      return;
    }

    // Include any un-clicked text typed into the "+ Add" inputs so user never loses an entry on save
    const finalSectors = Array.from(
      new Set([
        ...editSubSectors,
        ...(newEditSectorInput.trim() ? [newEditSectorInput.trim()] : []),
      ])
    );
    const finalBlocks = Array.from(
      new Set([
        ...editBlocks,
        ...(newEditBlockInput.trim() ? [newEditBlockInput.trim()] : []),
      ])
    );
    const finalLandmarks = Array.from(
      new Set([
        ...editLandmarks,
        ...(newEditLandmarkInput.trim() ? [newEditLandmarkInput.trim()] : []),
      ])
    );

    const lat = parseFloat(editLat) || 25.1432;
    const lng = parseFloat(editLng) || 75.8234;
    const gUrl = editGoogleMapsUrl.trim() || `https://www.google.com/maps?q=${lat},${lng}`;

    masterDataService.updateColonyMasterRecord(editingHadotiColony.id, {
      colonyName: trimmedName,
      entityType: editEntityType,
      pincode: trimmedPin,
      division: editDivision,
      postOfficeName: editPostOfficeName.trim(),
      assignedBeat: editAssignedBeat.trim() ? editAssignedBeat.trim() : 'PENDING_ASSIGNMENT',
      geoTag: {
        lat,
        lng,
        googleMapsUrl: gUrl,
      },
      subSectors: finalSectors,
      blocks: finalBlocks,
      landmarks: finalLandmarks,
      houseNumberRange: editHouseNumberRange.trim() || undefined,
    });

    showSuccessNotification(`Colony "${trimmedName}" (PIN ${trimmedPin}) updated with ${finalLandmarks.length} landmarks & ${finalSectors.length} sectors!`);
    setEditingHadotiColony(null);
  };

  const handleDeleteHadotiColony = (id: string, name: string, pincode?: string) => {
    setPendingDeleteTarget({ type: 'division', id, name, pincode });
  };

  const confirmPendingDelete = () => {
    if (!pendingDeleteTarget) return;
    if (pendingDeleteTarget.type === 'division') {
      const deleted = masterDataService.deleteColonyMasterRecord(pendingDeleteTarget.id);
      if (deleted) {
        showSuccessNotification(
          `Colony "${pendingDeleteTarget.name}" (PIN ${pendingDeleteTarget.pincode || ''}) removed from Colony Directory Master.`
        );
      }
    } else if (pendingDeleteTarget.type === 'legacy-colony') {
      setColonies((prev) => prev.filter((c) => c.id !== pendingDeleteTarget.id));
      showSuccessNotification(`Removed '${pendingDeleteTarget.name}' from colony master.`);
    } else if (pendingDeleteTarget.type === 'customer') {
      setCustomers((prev) => prev.filter((c) => c.id !== pendingDeleteTarget.id));
      showSuccessNotification(`Removed customer record '${pendingDeleteTarget.name}'.`);
    }
    setPendingDeleteTarget(null);
  };

  const handleExportHadotiColonies = () => {
    const rows = divisionColonies.map((c) => ({
      'Record ID': c.id,
      'Colony Name': c.colonyName,
      'Division': c.division,
      'Postal Pincode': c.pincode,
      'Registered Post Office': c.postOfficeName,
      'Sectors': (c.subSectors || []).join(', '),
      'Blocks': (c.blocks || []).join(', '),
      'Landmarks': (c.landmarks || []).join(', '),
      'House Number Range': c.houseNumberRange || '',
      'Latitude': c.geoTag.lat,
      'Longitude': c.geoTag.lng,
      'Assigned Beat': c.assignedBeat || 'PENDING_ASSIGNMENT',
      'Status': c.status,
      'Registration Date': c.createdAt,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Colony_Directory_Master');
    XLSX.writeFile(
      wb,
      `Colony_Directory_Master_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  // Handle Beat Selection in Colony Form to auto-fill Postman & Staff ID
  const handleBeatChange = (beat: string) => {
    setNewBeatNo(beat);
    const staff = BEAT_STAFF_DIRECTORY[beat];
    if (staff) {
      setNewPostmanName(staff.name);
      setNewStaffId(staff.id);
    } else if (BEAT_POSTMAN_CATALOG[beat]) {
      setNewPostmanName(BEAT_POSTMAN_CATALOG[beat]);
    }
  };

  // 1. Smart Duplicate & Linked Colony Validation Logic
  const handleRegisterColony = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColonyName.trim() || !newSector.trim()) {
      setDuplicateWarning('⚠️ Colony name and Sector/Phase are mandatory fields.');
      return;
    }

    const existing = colonies.find(
      (c) =>
        c.colonyName.trim().toLowerCase() === newColonyName.trim().toLowerCase() &&
        c.sectorPhase.trim().toLowerCase() === newSector.trim().toLowerCase() &&
        c.pincode === newPincode
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
    const newEntry: ColonyMapping = {
      id: Date.now().toString(),
      colonyName: newColonyName.trim(),
      sectorPhase: newSector.trim(),
      pincode: newPincode.trim(),
      subOffice: newSubOffice,
      beatNo: newBeatNo,
      staffId: newStaffId || staff?.id || 'STAFF-DIR',
      postmanName: newPostmanName || staff?.name || 'Assigned Staff',
      landmarks: newLandmarks.trim() || 'Registered via Master Hub',
      totalDeliveries: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setColonies([newEntry, ...colonies]);
    setNewColonyName('');
    setNewSector('');
    setNewLandmarks('');
    showSuccessNotification(`✅ Colony & Sector '${newEntry.colonyName} (${newEntry.sectorPhase})' registered under ${newEntry.beatNo}!`);
  };

  // 2. Customer Household & Address Registration with Duplicate Mobile Check
  const handleRegisterCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custMobile.trim()) {
      setDuplicateWarning('⚠️ Customer Name and Contact Mobile are required.');
      return;
    }

    // Check duplicate phone
    const existingCust = customers.find(
      (c) => c.mobile.replace(/\D/g, '') === custMobile.replace(/\D/g, '')
    );
    if (existingCust) {
      setPreventedCount((prev) => prev + 1);
      setDuplicateWarning(
        `⚠️ Duplicate Alert: Mobile '${custMobile}' is already registered to '${existingCust.name}' in ${existingCust.colony} (${existingCust.beatNo})!`
      );
      return;
    }

    // Find linked colony
    const linkedColony = colonies.find((col) => col.id === selectedColonyId) || colonies[0];

    setDuplicateWarning(null);
    const newCust: CustomerRecord = {
      id: `c_${Date.now()}`,
      name: custName.trim(),
      mobile: custMobile.trim(),
      colony: linkedColony ? linkedColony.colonyName : 'Dadabari Main',
      sector: custSector.trim() || (linkedColony ? linkedColony.sectorPhase : 'Main Area'),
      houseNo: custLandmark.trim()
        ? `${custHouseNo.trim() || 'Standard Delivery'} (Landmark: ${custLandmark.trim()})`
        : custHouseNo.trim() || 'Standard Delivery',
      pincode: linkedColony ? linkedColony.pincode : '324009',
      beatNo: linkedColony ? linkedColony.beatNo : 'Beat 2',
      postmanName: linkedColony ? linkedColony.postmanName : 'Mahendra Kumar Meena',
      householdType: custHouseholdType,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCustomers([newCust, ...customers]);
    setCustName('');
    setCustMobile('');
    setCustHouseNo('');
    setCustSector('');
    setCustLandmark('');
    showSuccessNotification(`✅ Customer '${newCust.name}' mapped to ${newCust.colony} (${newCust.beatNo})!`);
  };

  const showSuccessNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);
  };

  // Delete Colony
  const handleDeleteColony = (id: string, name: string) => {
    setPendingDeleteTarget({ type: 'legacy-colony', id, name });
  };

  // Delete Customer
  const handleDeleteCustomer = (id: string, name: string) => {
    setPendingDeleteTarget({ type: 'customer', id, name });
  };

  // Export to Excel
  const handleExportColonies = () => {
    const dataToExport = colonies.map((c) => ({
      'Colony ID': c.id,
      'Colony Name': c.colonyName,
      'Sector / Phase': c.sectorPhase,
      'Pincode': c.pincode,
      'Sub Office': c.subOffice,
      'Beat No': c.beatNo,
      'Assigned Postman': c.postmanName,
      'Landmarks / Notes': c.landmarks,
      'Total Deliveries': c.totalDeliveries || 0,
      'Registration Date': c.createdAt || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Colonies_Master');
    XLSX.writeFile(workbook, `Dadabari_Colonies_Master_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportCustomers = () => {
    const dataToExport = customers.map((c) => ({
      'Customer ID': c.id,
      'Full Name': c.name,
      'Mobile Number': c.mobile,
      'House / Plot No': c.houseNo || '',
      'Colony': c.colony,
      'Sector / Phase': c.sector,
      'Pincode': c.pincode,
      'Assigned Beat': c.beatNo,
      'Delivery Staff': c.postmanName || '',
      'Household Type': c.householdType,
      'Mapped Date': c.createdAt || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Households_Master');
    XLSX.writeFile(workbook, `Dadabari_Customers_Master_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Download Sample Template
  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        'Colony Name': 'Mahaveer Nagar Vistar',
        'Sector Phase': 'Sector 3',
        'Pincode': '324009',
        'Sub Office': 'Dadabari S.O.',
        'Beat No': 'Beat 5',
        'Postman Name': 'Mohit Arvind',
        'Landmarks': 'Near Community Hall',
      },
      {
        'Colony Name': 'Vasant Kunj',
        'Sector Phase': 'Phase 2',
        'Pincode': '324009',
        'Sub Office': 'Dadabari S.O.',
        'Beat No': 'Beat 2',
        'Postman Name': 'Mahendra Kumar Meena',
        'Landmarks': 'Opposite Water Tank',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Import_Template');
    XLSX.writeFile(workbook, 'Colony_Beat_Import_Template.xlsx');
  };

  // Bulk Excel Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const json: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (json.length === 0) {
          setBulkStatus('Uploaded sheet has no rows.');
          return;
        }

        let addedCount = 0;
        let skippedDuplicate = 0;
        const newColoniesList = [...colonies];

        json.forEach((row, idx) => {
          const colName = row['Colony Name'] || row['colonyName'] || row['Colony'] || '';
          const sec = row['Sector Phase'] || row['sectorPhase'] || row['Sector'] || 'Sector 1';
          const pin = String(row['Pincode'] || row['pincode'] || '324009');
          const beat = row['Beat No'] || row['beatNo'] || row['Beat'] || 'Beat 2';
          const postman = row['Postman Name'] || row['postmanName'] || BEAT_POSTMAN_CATALOG[beat] || 'Mahendra Kumar Meena';
          const landmarks = row['Landmarks'] || row['landmarks'] || 'Imported via Excel';

          if (!colName) return;

          const exists = newColoniesList.some(
            (c) =>
              c.colonyName.trim().toLowerCase() === colName.trim().toLowerCase() &&
              c.sectorPhase.trim().toLowerCase() === sec.trim().toLowerCase() &&
              c.pincode === pin
          );

          if (exists) {
            skippedDuplicate++;
          } else {
            newColoniesList.unshift({
              id: `imp_${Date.now()}_${idx}`,
              colonyName: colName,
              sectorPhase: sec,
              pincode: pin,
              subOffice: 'Dadabari S.O.',
              beatNo: beat,
              postmanName: postman,
              landmarks: landmarks,
              totalDeliveries: 150,
              createdAt: new Date().toISOString().split('T')[0],
            });
            addedCount++;
          }
        });

        setColonies(newColoniesList);
        setPreventedCount((prev) => prev + skippedDuplicate);
        setBulkStatus(`✅ Import Complete: ${addedCount} colonies added, ${skippedDuplicate} duplicates prevented.`);
        showSuccessNotification(`Excel Processed: ${addedCount} registered, ${skippedDuplicate} duplicates skipped.`);
      } catch (err: any) {
        setBulkStatus(`Error reading file: ${err.message || 'Unknown error'}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const scopedLegacyColonies = useMemo(() => {
    if (!isRestrictedStaff) return colonies;
    return colonies.filter((c) =>
      staffPermissionService.matchesUserBeatScope(userProfile, {
        beatNo: c.beatNo,
        colonyName: c.colonyName,
        assignedStaffName: c.postmanName,
        subOffice: c.subOffice,
        pincode: c.pincode,
      })
    );
  }, [colonies, isRestrictedStaff, userProfile]);

  const scopedLegacyCustomers = useMemo(() => {
    if (!isRestrictedStaff) return customers;
    return customers.filter((cust) =>
      staffPermissionService.matchesUserBeatScope(userProfile, {
        beatNo: cust.beatNo,
        colonyName: cust.colony,
        area: cust.colony,
        assignedStaffName: cust.postmanName,
        pincode: cust.pincode,
      })
    );
  }, [customers, isRestrictedStaff, userProfile]);

  useEffect(() => {
    setLegacyColonyPage(1);
    setCustomerPage(1);
  }, [searchQuery, selectedBeatFilter, selectedOfficeFilter, selectedHouseholdFilter]);

  // Filtered Colonies (Strict Office-to-Pincode Enforcement with Zero Fallback Leakage)
  const filteredColonies = useMemo(() => {
    const matchedOfficeMeta =
      selectedOfficeFilter !== 'ALL'
        ? SUB_OFFICES.find((o) => o.name.toLowerCase() === selectedOfficeFilter.toLowerCase())
        : undefined;

    return scopedLegacyColonies.filter((c) => {
      const matchOffice =
        selectedOfficeFilter === 'ALL' ||
        ((c.subOffice || '').trim().toLowerCase() === selectedOfficeFilter.trim().toLowerCase() &&
          (!matchedOfficeMeta || c.pincode.trim() === matchedOfficeMeta.pincode));

      const matchSearch =
        c.colonyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.sectorPhase.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.pincode.includes(searchQuery) ||
        c.postmanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.staffId && c.staffId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.beatNo.toLowerCase().includes(searchQuery.toLowerCase());

      const matchBeat = selectedBeatFilter === 'ALL' || c.beatNo === selectedBeatFilter;

      return matchOffice && matchSearch && matchBeat;
    });
  }, [scopedLegacyColonies, searchQuery, selectedBeatFilter, selectedOfficeFilter]);

  const totalLegacyColonyPages = Math.max(1, Math.ceil(filteredColonies.length / MASTER_PAGE_SIZE));
  const safeLegacyColonyPage = Math.min(legacyColonyPage, totalLegacyColonyPages);
  const paginatedLegacyColonies = filteredColonies.slice(
    (safeLegacyColonyPage - 1) * MASTER_PAGE_SIZE,
    safeLegacyColonyPage * MASTER_PAGE_SIZE
  );

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return scopedLegacyCustomers.filter((cust) => {
      const matchSearch =
        cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.mobile.includes(searchQuery) ||
        cust.colony.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.beatNo.toLowerCase().includes(searchQuery.toLowerCase());

      const matchBeat = selectedBeatFilter === 'ALL' || cust.beatNo === selectedBeatFilter;
      const matchHousehold = selectedHouseholdFilter === 'ALL' || cust.householdType === selectedHouseholdFilter;

      return matchSearch && matchBeat && matchHousehold;
    });
  }, [scopedLegacyCustomers, searchQuery, selectedBeatFilter, selectedHouseholdFilter]);

  const totalCustomerPages = Math.max(1, Math.ceil(filteredCustomers.length / MASTER_PAGE_SIZE));
  const safeCustomerPage = Math.min(customerPage, totalCustomerPages);
  const paginatedCustomers = filteredCustomers.slice(
    (safeCustomerPage - 1) * MASTER_PAGE_SIZE,
    safeCustomerPage * MASTER_PAGE_SIZE
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold tracking-wider uppercase border border-blue-400/30">
            <ShieldCheck size={14} className="text-cyan-400" />
            <span>Master Address Intelligence & Beat Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Postal CRM & Colony-Beat Master Hub
          </h1>
          <p className="text-blue-200 text-sm max-w-2xl">
            Unified Address Registration, Duplicate Prevention, Landmark Profiling & Dynamic Delivery Beat Mapping for Dadabari S.O.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="bg-blue-950/80 px-4 py-2.5 rounded-2xl border border-blue-700/60 text-xs sm:text-sm text-blue-100 flex items-center gap-2 shadow-inner">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>
              Active Office: <b>Dadabari S.O. (324009)</b>
            </span>
          </div>
          <button
            onClick={handleExportColonies}
            className="px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Download Master Colony Sheet"
          >
            <Download size={14} />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Instantaneous Floating Toast Container */}
      {(warningToast || successToast) && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 sm:px-0 pointer-events-none">
          {warningToast && (
            <div className="pointer-events-auto bg-amber-950 text-amber-50 border border-amber-500/70 px-4 py-3 rounded-2xl shadow-2xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom duration-200">
              <div className="flex items-start gap-2.5 text-xs">
                <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <span className="font-semibold leading-snug">{warningToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setWarningToast(null)}
                className="text-amber-300 hover:text-white cursor-pointer shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          )}
          {successToast && (
            <div className="pointer-events-auto bg-emerald-950 text-emerald-50 border border-emerald-500/70 px-4 py-3 rounded-2xl shadow-2xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom duration-200">
              <div className="flex items-start gap-2.5 text-xs">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-semibold leading-snug">{successToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessToast(null)}
                className="text-emerald-300 hover:text-white cursor-pointer shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Duplicate Warning Banner */}
      {duplicateWarning && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-2xl shadow-sm flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-start space-x-3 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Conflict Prevented by CRM Intelligence</p>
              <p className="text-xs text-amber-800 mt-0.5">{duplicateWarning}</p>
            </div>
          </div>
          <button
            onClick={() => setDuplicateWarning(null)}
            className="text-xs text-amber-800 hover:text-amber-950 px-2 py-1 bg-amber-100/70 hover:bg-amber-200 rounded-lg font-semibold transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Notification */}
      {successToast && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-3 text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium text-sm">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-xs text-emerald-800 font-semibold underline"
          >
            Close
          </button>
        </div>
      )}

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <MapPin size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Colonies</div>
            <div className="text-2xl font-black text-slate-900">{scopedLegacyColonies.length}</div>
            <div className="text-[11px] text-indigo-600 font-medium mt-0.5">
              {isRestrictedStaff ? `Scoped to ${userProfile?.beat || 'Assigned Beat'}` : 'Under Dadabari S.O.'}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mapped Households</div>
            <div className="text-2xl font-black text-slate-900">{scopedLegacyCustomers.length}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">With Beat Pinning</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Duplicates Blocked</div>
            <div className="text-2xl font-black text-amber-700">{preventedCount}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">Zero Data Collision</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Postal Beats</div>
            <div className="text-2xl font-black text-slate-900">
              {isRestrictedStaff ? `${scopedBeatsSet?.size || 1} Beat` : '33 Beats'}
            </div>
            <div className="text-[11px] text-rose-600 font-medium mt-0.5">PIN {userProfile?.officePincode || '324009'}</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('division-colonies')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'division-colonies'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MapIcon size={16} />
          <span>Colony Directory Master ({scopedDivisionColonies.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('colonies')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'colonies'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MapPin size={16} />
          <span>Beat Sector Directory ({scopedLegacyColonies.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'customers'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users size={16} />
          <span>Mapped Households & Customers ({scopedLegacyCustomers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'bulk'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet size={16} />
          <span>Excel Tools & Data Sync</span>
        </button>
      </div>

      {/* Main Grid View according to activeTab */}
      {activeTab === 'colonies' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Colony & Sector Registration Form */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/90 lg:col-span-1 h-fit sticky top-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <span>Register Colony / Sector</span>
              </h2>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                Unique Key Check
              </span>
            </div>

            <form onSubmit={handleRegisterColony} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Colony Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mahaveer Nagar Vistar"
                  value={newColonyName}
                  onChange={(e) => setNewColonyName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sector / Phase / Block <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector 1, Phase 2, Block A"
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sub Office</label>
                  <select
                    value={newSubOffice}
                    onChange={(e) => setNewSubOffice(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition"
                  >
                    {SUB_OFFICES.map((so) => (
                      <option key={so.name} value={so.name}>
                        {so.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Beat & Delivery Staff Binding */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Postal Beat Assignment</span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Auto-Linked Staff</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Beat No (1 - 33)</label>
                    <select
                      value={newBeatNo}
                      onChange={(e) => handleBeatChange(e.target.value)}
                      disabled={isRestrictedStaff}
                      className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white disabled:opacity-75"
                    >
                      {(isRestrictedStaff
                        ? (scopedBeatsSet ? Array.from<string>(scopedBeatsSet) : []).map((b) => `Beat ${b.toUpperCase()}`)
                        : DADABARI_ALL_BEATS
                      ).map((beat) => {
                        const staff = BEAT_STAFF_DIRECTORY[beat];
                        return (
                          <option key={beat} value={beat}>
                            {beat} {staff ? `(${staff.name.split(' ')[0]})` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Assigned Postman & Staff ID</label>
                    <input
                      type="text"
                      value={newPostmanName + (newStaffId ? ` (${newStaffId})` : '')}
                      onChange={(e) => setNewPostmanName(e.target.value)}
                      className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Landmarks & Navigation Hints</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Near Samrat Chowk, Opposite Community Water Tank"
                  value={newLandmarks}
                  onChange={(e) => setNewLandmarks(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>Register Colony & Verify Mapping</span>
              </button>
            </form>
          </div>

          {/* Right Column: Colonies Master List & Live Beat Registry */}
          <div className="space-y-4 lg:col-span-2">
            {/* Filter and Search Bar with Delivery Office & Beat Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-60">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search colony, sector, postman..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {/* Delivery Office Filter */}
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
                    <Building2 size={13} /> Office:
                  </span>
                  <select
                    value={selectedOfficeFilter}
                    onChange={(e) => setSelectedOfficeFilter(e.target.value)}
                    disabled={isRestrictedStaff}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:outline-hidden disabled:opacity-75"
                  >
                    {!isRestrictedStaff && <option value="ALL">All Offices</option>}
                    {(isRestrictedStaff
                      ? SUB_OFFICES.filter((so) =>
                          so.name.toLowerCase().includes((userProfile?.subOffice || 'Dadabari').toLowerCase()) ||
                          so.pincode === (userProfile?.officePincode || '324009')
                        )
                      : SUB_OFFICES
                    ).map((so) => (
                      <option key={so.name} value={so.name}>
                        {so.name} ({so.pincode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Beat Filter */}
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
                    <Filter size={13} /> Beat:
                  </span>
                  <select
                    value={selectedBeatFilter}
                    onChange={(e) => setSelectedBeatFilter(e.target.value)}
                    disabled={isRestrictedStaff && (scopedBeatsSet?.size || 0) <= 1}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:outline-hidden max-w-[130px] disabled:opacity-75"
                  >
                    {isRestrictedStaff ? (
                      <>
                        <option value="ALL">My Beat ({userProfile?.beat})</option>
                        {(scopedBeatsSet ? Array.from<string>(scopedBeatsSet) : []).map((b) => (
                          <option key={b} value={`Beat ${b.toUpperCase()}`}>Beat {b.toUpperCase()}</option>
                        ))}
                      </>
                    ) : (
                      <>
                        <option value="ALL">All Beats (33)</option>
                        {DADABARI_ALL_BEATS.map((beat) => {
                          const staff = BEAT_STAFF_DIRECTORY[beat];
                          return (
                            <option key={beat} value={beat}>
                              {beat} {staff ? `(${staff.name.split(' ')[0]})` : ''}
                            </option>
                          );
                        })}
                      </>
                    )}
                  </select>
                </div>

                <button
                  onClick={handleExportColonies}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
                  title="Export Colonies to Excel"
                >
                  <Download size={15} />
                </button>
              </div>
            </div>

            {/* Colonies Cards Grid */}
            <div className="space-y-3">
              {filteredColonies.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
                  <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
                  <div className="font-bold text-slate-700">No colonies found</div>
                  <p className="text-xs text-slate-500">
                    Try modifying your search or delivery office/beat filter, or register a new colony using the form.
                  </p>
                </div>
              ) : (
                <>
                  {paginatedLegacyColonies.map((col) => (
                    <div
                      key={col.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md transition space-y-3 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition">
                              {col.colonyName}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {col.sectorPhase}
                            </span>
                            <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              PIN {col.pincode}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <Building2 size={13} className="text-slate-400" />
                            <span>{col.subOffice}</span>
                            <span>•</span>
                            <span className="text-slate-600 font-medium">Landmarks: {col.landmarks}</span>
                          </div>
                        </div>

                        {/* Beat & Postman Badges with Staff ID */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right space-y-0.5">
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-extrabold border border-amber-200">
                                {col.beatNo}
                              </span>
                              {col.staffId && (
                                <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-mono text-[10px] font-black border border-purple-200">
                                  {col.staffId}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-700">
                              {col.postmanName}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteColony(col.id, col.colonyName)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                            title="Remove colony mapping"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                          <span>
                            Mapped Households:{' '}
                            <b className="text-slate-800 font-mono">
                              {scopedLegacyCustomers.filter((c) => c.colony === col.colonyName).length}
                            </b>
                          </span>
                          <span>
                            Delivery Volume:{' '}
                            <b className="text-indigo-600 font-mono">
                              {col.totalDeliveries || 250}+ articles/mo
                            </b>
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">Reg: {col.createdAt || 'Standard'}</span>
                      </div>
                    </div>
                  ))}
                  {/* Legacy Colonies 5/Page Pagination Footer */}
                  <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600 font-medium">
                      Showing <b className="text-slate-900">{(safeLegacyColonyPage - 1) * MASTER_PAGE_SIZE + 1}</b>–
                      <b className="text-slate-900">{Math.min(safeLegacyColonyPage * MASTER_PAGE_SIZE, filteredColonies.length)}</b> of{' '}
                      <b className="text-slate-900">{filteredColonies.length}</b> colony entries (5 per page)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={safeLegacyColonyPage <= 1}
                        onClick={() => setLegacyColonyPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                      >
                        Prev
                      </button>
                      <span className="font-bold text-slate-800">
                        Page {safeLegacyColonyPage} / {totalLegacyColonyPages}
                      </span>
                      <button
                        type="button"
                        disabled={safeLegacyColonyPage >= totalLegacyColonyPages}
                        onClick={() => setLegacyColonyPage((p) => Math.min(totalLegacyColonyPages, p + 1))}
                        className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Colony Directory Master Tab — Modular Block A/B/C/D Architecture */}
      {activeTab === 'division-colonies' && (
        <div className="space-y-5">
          {/* Sticky Quick-Jump Anchor Navigation Bar */}
          <div className="sticky top-2 z-20 bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-md flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 hidden sm:inline">
                Quick Jump:
              </span>
              <button
                type="button"
                onClick={() => scrollToBlock('A')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer flex items-center gap-1.5"
              >
                <Database size={13} className="text-indigo-600" />
                <span>Summary Overview</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToBlock('B')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={13} />
                <span>Jump to Register Form</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToBlock('C')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <Filter size={13} className="text-blue-700" />
                <span>View Filters</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToBlock('D')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <MapPin size={13} className="text-emerald-700" />
                <span>Colony Cards Grid ({filteredDivisionColonies.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {(officeJurisdictionFilter !== 'ALL' || pincodeFilter !== 'ALL') && (
                <span className="text-[11px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg">
                  Strict Scope:{' '}
                  {officeJurisdictionFilter !== 'ALL'
                    ? `${officeJurisdictionFilter.split('__')[0]} [${officeJurisdictionFilter.split('__')[1]}]`
                    : `PIN ${pincodeFilter}`}
                </span>
              )}
              <button
                type="button"
                onClick={handleExportHadotiColonies}
                title="Export Colony Directory to Excel"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download size={13} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* BLOCK A: Quick Metrics & Summary Overview */}
          <div ref={blockARef} id="colony-block-a" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden scroll-mt-20">
            <button
              type="button"
              onClick={() => setIsBlockAOpen((prev) => !prev)}
              className="w-full px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/80 border-b border-slate-100 flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-black text-[10px] uppercase tracking-wider">
                  Block A
                </span>
                <h2 className="text-sm font-black text-slate-900">Quick Metrics & Summary Overview</h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span>{scopedDivisionColonies.length} Master Records</span>
                {isBlockAOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {isBlockAOpen && (
              <div className="p-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/90">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {isRestrictedStaff ? 'My Beat Scope' : 'Total Hadoti'}
                  </div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{scopedDivisionColonies.length} Colonies</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {officeJurisdictions.length} Office Jurisdictions
                  </div>
                </div>
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200/90">
                  <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Kota Division</div>
                  <div className="text-xl font-black text-blue-900 mt-0.5">
                    {scopedDivisionColonies.filter((c) => c.division === 'KOTA').length} Colonies
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium mt-0.5">PIN 324xxx Belts</div>
                </div>
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/90">
                  <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Baran Division</div>
                  <div className="text-xl font-black text-amber-900 mt-0.5">
                    {scopedDivisionColonies.filter((c) => c.division === 'BARAN').length} Colonies
                  </div>
                  <div className="text-[10px] text-amber-600 font-medium mt-0.5">PIN 325xxx Belts</div>
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/90">
                  <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Bundi Division</div>
                  <div className="text-xl font-black text-emerald-900 mt-0.5">
                    {scopedDivisionColonies.filter((c) => c.division === 'BUNDI').length} Colonies
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">PIN 323xxx Belts</div>
                </div>
                <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200/90 col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Pending Mapping</div>
                  <div className="text-xl font-black text-rose-700 mt-0.5">
                    {scopedDivisionColonies.filter((c) => c.status === 'PENDING_BEAT_MAPPING').length} Records
                  </div>
                  <div className="text-[10px] text-rose-600 font-medium mt-0.5">Awaiting Beat Allocation</div>
                </div>
              </div>
            )}
          </div>

          {/* BLOCK B: Collapsible Colony Registration Form */}
          <div ref={blockBRef} id="colony-block-b" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden scroll-mt-20">
            <div className="px-5 py-3.5 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-black text-[10px] uppercase tracking-wider">
                  Block B
                </span>
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>Colony Registration Form</span>
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Composite Colony Name + Pincode duplication guard with geo-tag & landmark capture
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 hidden sm:inline-block">
                  Unique PIN Guard
                </span>
                <button
                  type="button"
                  onClick={() => setIsBlockBOpen((prev) => !prev)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                    isBlockBOpen
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                      : 'bg-blue-900 hover:bg-blue-800 text-white'
                  }`}
                >
                  {isBlockBOpen ? <ChevronUp size={15} /> : <Plus size={15} />}
                  <span>{isBlockBOpen ? 'Hide Registration Form' : 'Register New Colony'}</span>
                </button>
              </div>
            </div>

            {isBlockBOpen && (
              <form onSubmit={handleRegisterHadotiColony} className="p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Colony / Locality Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={hadotiColonyName}
                      onChange={(e) => setHadotiColonyName(e.target.value)}
                      placeholder="e.g. Dadabari Extension / Pratap Chowk"
                      className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Entity Classification <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={hadotiEntityType}
                      onChange={(e) => setHadotiEntityType(e.target.value as ColonyEntityType)}
                      className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Residential Colony">🏠 Residential Colony</option>
                      <option value="Commercial Complex">🏢 Commercial Complex</option>
                      <option value="Specific Landmark">🏛️ Specific Landmark</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Division <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={hadotiDivision}
                      onChange={(e) => {
                        const div = e.target.value as 'KOTA' | 'BARAN' | 'BUNDI';
                        setHadotiDivision(div);
                        if (div === 'KOTA') {
                          setHadotiPincode('324009');
                          setHadotiPostOfficeName('Dadabari S.O.');
                          setHadotiLat('25.1432');
                          setHadotiLng('75.8234');
                        } else if (div === 'BARAN') {
                          setHadotiPincode('325205');
                          setHadotiPostOfficeName('Baran H.O.');
                          setHadotiLat('25.1011');
                          setHadotiLng('76.5132');
                        } else if (div === 'BUNDI') {
                          setHadotiPincode('323001');
                          setHadotiPostOfficeName('Bundi H.O.');
                          setHadotiLat('25.4410');
                          setHadotiLng('75.6420');
                        }
                      }}
                      className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="KOTA">Kota Division</option>
                      <option value="BARAN">Baran Division</option>
                      <option value="BUNDI">Bundi Division</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Postal Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={hadotiPincode}
                      onChange={(e) => setHadotiPincode(e.target.value)}
                      placeholder="e.g. 324009"
                      className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registered Post Office <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={hadotiPostOfficeName}
                      onChange={(e) => setHadotiPostOfficeName(e.target.value)}
                      placeholder="e.g. Dadabari S.O., PIP Office / Talwandi S.O."
                      className="w-full text-xs font-semibold px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={hadotiLat}
                      onChange={(e) => setHadotiLat(e.target.value)}
                      placeholder="e.g. 25.1432"
                      className="w-full text-xs font-mono px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={hadotiLng}
                      onChange={(e) => setHadotiLng(e.target.value)}
                      placeholder="e.g. 75.8234"
                      className="w-full text-xs font-mono px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sectors (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={hadotiSubSectors}
                      onChange={(e) => setHadotiSubSectors(e.target.value)}
                      placeholder="e.g. Sector 1, Sector 2, Pocket A"
                      className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Blocks / Series (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={hadotiBlocks}
                      onChange={(e) => setHadotiBlocks(e.target.value)}
                      placeholder="e.g. Block A, Block B, KH Series"
                      className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Prominent Landmarks
                    </label>
                    <input
                      type="text"
                      value={hadotiLandmarks}
                      onChange={(e) => setHadotiLandmarks(e.target.value)}
                      placeholder="e.g. CAD Circle, Shiv Mandir"
                      className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      House Number Ranges (Optional)
                    </label>
                    <input
                      type="text"
                      value={hadotiHouseNumberRange}
                      onChange={(e) => setHadotiHouseNumberRange(e.target.value)}
                      placeholder="e.g. H.No. 1 - 320"
                      className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 border-t border-slate-100">
                  <div className="flex-1 max-w-md">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Assigned Postal Beat (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={hadotiAssignedBeat}
                        onChange={(e) => setHadotiAssignedBeat(e.target.value)}
                        readOnly={isRestrictedStaff}
                        placeholder="e.g. Beat 2 (Leave empty if unassigned)"
                        className="flex-1 text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 read-only:opacity-75"
                      />
                      {hadotiAssignedBeat.trim() ? (
                        <span className="px-2.5 py-1.5 rounded-lg font-bold bg-emerald-100 text-emerald-800 text-[10px] whitespace-nowrap">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2.5 py-1.5 rounded-lg font-bold bg-amber-100 text-amber-800 text-[10px] whitespace-nowrap">
                          PENDING_BEAT_MAPPING
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Plus size={16} />
                    <span>Register Colony to Master</span>
                  </button>
                </div>

                {hadotiStatusMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium border flex items-start gap-2 ${
                      hadotiStatusMessage.success
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {hadotiStatusMessage.success ? (
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertTriangle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                    )}
                    <span>{hadotiStatusMessage.text}</span>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* BLOCK C: Advanced Filters, Office Jurisdiction & Pincode Search Bar */}
          <div ref={blockCRef} id="colony-block-c" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden scroll-mt-20">
            <button
              type="button"
              onClick={() => setIsBlockCOpen((prev) => !prev)}
              className="w-full px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/80 border-b border-slate-100 flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-black text-[10px] uppercase tracking-wider">
                  Block C
                </span>
                <h2 className="text-sm font-black text-slate-900">Advanced Filters, Office Jurisdiction & Pincode Search</h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span>
                  Showing {filteredDivisionColonies.length} of {scopedDivisionColonies.length}
                </span>
                {isBlockCOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {isBlockCOpen && (
              <div className="p-4 space-y-3">
                {/* Division Quick Filter Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDivisionFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        divisionFilter === 'ALL'
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All ({scopedDivisionColonies.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDivisionFilter('KOTA')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        divisionFilter === 'KOTA'
                          ? 'bg-blue-700 text-white shadow-xs'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      Kota ({scopedDivisionColonies.filter((c) => c.division === 'KOTA').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDivisionFilter('BARAN')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        divisionFilter === 'BARAN'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      Baran ({scopedDivisionColonies.filter((c) => c.division === 'BARAN').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDivisionFilter('BUNDI')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        divisionFilter === 'BUNDI'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      Bundi ({scopedDivisionColonies.filter((c) => c.division === 'BUNDI').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDivisionFilter('PENDING')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        divisionFilter === 'PENDING'
                          ? 'bg-rose-700 text-white shadow-xs'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      Pending ({scopedDivisionColonies.filter((c) => c.status === 'PENDING_BEAT_MAPPING').length})
                    </button>
                  </div>

                  {(officeJurisdictionFilter !== 'ALL' ||
                    pincodeFilter !== 'ALL' ||
                    divisionSearch ||
                    divisionFilter !== 'ALL') && (
                    <button
                      type="button"
                      onClick={() => {
                        setOfficeJurisdictionFilter('ALL');
                        setPincodeFilter('ALL');
                        setDivisionSearch('');
                        setDivisionFilter('ALL');
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 rounded-xl border border-red-200 transition cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>

                {/* Search + Strict Office Jurisdiction + Strict Pincode Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 pt-2 border-t border-slate-100">
                  <div className="relative lg:col-span-5">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={divisionSearch}
                      onChange={(e) => setDivisionSearch(e.target.value)}
                      placeholder="Instant search by Colony Name, Landmark, Sector, or Pincode..."
                      className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>

                  <div className="lg:col-span-4 flex items-center gap-1.5 bg-indigo-50/70 border border-indigo-200 rounded-xl px-2.5 py-1.5">
                    <Building2 size={13} className="text-indigo-700 shrink-0" />
                    <label htmlFor="colony-office-filter" className="text-[11px] font-bold text-indigo-950 whitespace-nowrap">
                      Post Office:
                    </label>
                    <select
                      id="colony-office-filter"
                      value={officeJurisdictionFilter}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOfficeJurisdictionFilter(val);
                        if (val !== 'ALL') {
                          const [, pin] = val.split('__');
                          if (pin) setPincodeFilter(pin.trim());
                        } else {
                          setPincodeFilter('ALL');
                        }
                      }}
                      className="w-full bg-transparent text-xs font-bold text-indigo-950 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Office Jurisdictions ({officeJurisdictions.length})</option>
                      {officeJurisdictions.map((oj) => (
                        <option key={oj.officeId} value={`${oj.officeName}__${oj.pincode}`}>
                          {oj.officeName} [{oj.pincode}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-3 flex items-center gap-1.5 bg-blue-50/70 border border-blue-200 rounded-xl px-2.5 py-1.5">
                    <Filter size={13} className="text-blue-700 shrink-0" />
                    <label htmlFor="colony-pincode-filter" className="text-[11px] font-bold text-blue-900 whitespace-nowrap">
                      PIN:
                    </label>
                    <select
                      id="colony-pincode-filter"
                      value={pincodeFilter}
                      onChange={(e) => {
                        const pin = e.target.value;
                        setPincodeFilter(pin);
                        if (pin === 'ALL') {
                          setOfficeJurisdictionFilter('ALL');
                        } else if (officeJurisdictionFilter !== 'ALL') {
                          const [, currentPin] = officeJurisdictionFilter.split('__');
                          if (currentPin !== pin) {
                            setOfficeJurisdictionFilter('ALL');
                          }
                        }
                      }}
                      className="w-full bg-transparent text-xs font-mono font-bold text-blue-950 focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">All Pincodes ({scopedDivisionColonies.length})</option>
                      {availableMasterPincodes.map((p) => (
                        <option key={p.pincode} value={p.pincode}>
                          {p.pincode} • {p.office} ({p.count})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BLOCK D: Master Colony Cards Grid */}
          <div ref={blockDRef} id="colony-block-d" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden scroll-mt-20">
            <button
              type="button"
              onClick={() => setIsBlockDOpen((prev) => !prev)}
              className="w-full px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/80 border-b border-slate-100 flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-black text-[10px] uppercase tracking-wider">
                  Block D
                </span>
                <h2 className="text-sm font-black text-slate-900">
                  Master Colony Cards Grid ({filteredDivisionColonies.length})
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span>Strict Pincode Isolation Active</span>
                {isBlockDOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {isBlockDOpen && (
              <div className="p-4 sm:p-5 bg-slate-50/40 space-y-4">
                {filteredDivisionColonies.length === 0 ? (
                  <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                    <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      No colony records found matching your strict Office Jurisdiction / Pincode filter.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Cross-pincode colonies are strictly isolated to prevent misrouting.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {paginatedDivisionColonies.map((col) => (
                      <div
                        key={col.id}
                        className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-300 transition space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Card Top Identification Bar (Colony Name + Pincode + CRUD Actions) */}
                          <div className="flex flex-wrap items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-sm sm:text-base text-slate-900">{col.colonyName}</span>

                              <span className="text-xs font-mono font-black text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                                PIN {col.pincode}
                              </span>

                              {/* Dynamic Entity Classification Badge */}
                              {col.entityType === 'Commercial Complex' ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                  <Building2 size={11} className="text-amber-700" />
                                  <span>Commercial Complex</span>
                                </span>
                              ) : col.entityType === 'Specific Landmark' ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 inline-flex items-center gap-1">
                                  <Landmark size={11} className="text-teal-700" />
                                  <span>Specific Landmark</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1">
                                  <Home size={11} className="text-indigo-600" />
                                  <span>Residential Colony</span>
                                </span>
                              )}

                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  col.division === 'KOTA'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : col.division === 'BARAN'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {col.division}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  col.status === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {col.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING BEAT'}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleOpenEditHadotiModal(col)}
                                title="Edit Colony, Landmarks, Sectors & Blocks"
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                              >
                                <Edit2 size={12} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteHadotiColony(col.id, col.colonyName, col.pincode)}
                                title="Delete Colony Master Record"
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>

                          {/* Office, Geo-Tag & Beat Binding Metadata */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600">
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Jurisdiction Office</span>
                              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                                <Building2 size={13} className="text-blue-700 shrink-0" />
                                <span className="truncate">{col.postOfficeName}</span>
                              </span>
                            </div>

                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Geo-Tag</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-slate-700 text-[11px]">
                                  {col.geoTag.lat.toFixed(4)}, {col.geoTag.lng.toFixed(4)}
                                </span>
                                <a
                                  href={col.geoTag.googleMapsUrl || `https://www.google.com/maps?q=${col.geoTag.lat},${col.geoTag.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold flex items-center gap-0.5 transition"
                                  title="Open in Google Maps"
                                >
                                  <Navigation size={9} className="shrink-0" />
                                  <span>Map</span>
                                  <ExternalLink size={9} className="opacity-70" />
                                </a>
                              </div>
                            </div>

                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Beat</span>
                              {inlineBeatEditId === col.id ? (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <input
                                    type="text"
                                    value={inlineBeatValue}
                                    onChange={(e) => setInlineBeatValue(e.target.value)}
                                    placeholder="e.g. Beat 2"
                                    className="w-20 text-xs font-semibold px-2 py-0.5 border border-indigo-400 rounded focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateHadotiBeat(col.id, inlineBeatValue)}
                                    className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInlineBeatEditId(null);
                                      setInlineBeatValue('');
                                    }}
                                    className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span
                                    className={`font-semibold ${
                                      col.assignedBeat && col.assignedBeat !== 'PENDING_ASSIGNMENT'
                                        ? 'text-slate-900'
                                        : 'text-amber-700 font-medium italic'
                                    }`}
                                  >
                                    {col.assignedBeat && col.assignedBeat !== 'PENDING_ASSIGNMENT'
                                      ? col.assignedBeat
                                      : 'Pending Assignment'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInlineBeatEditId(col.id);
                                      setInlineBeatValue(
                                        col.assignedBeat && col.assignedBeat !== 'PENDING_ASSIGNMENT'
                                          ? col.assignedBeat
                                          : ''
                                      );
                                    }}
                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                                  >
                                    Assign
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Consolidated Colony Summary Overview + On-the-fly Landmark Adder */}
                          <div className="bg-slate-50/90 rounded-xl border border-slate-200/80 p-3 space-y-2.5 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1">
                                  <Layers size={11} className="text-blue-700" />
                                  <span>Sectors ({col.subSectors?.length || 0})</span>
                                </span>
                                {col.subSectors && col.subSectors.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {col.subSectors.map((sec, idx) => (
                                      <span
                                        key={`${sec}-${idx}`}
                                        className="px-2 py-0.5 rounded-md bg-white border border-blue-200/80 text-blue-900 text-[10px] font-semibold"
                                      >
                                        {sec}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">No sectors specified</span>
                                )}
                              </div>

                              <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1">
                                  <Building size={11} className="text-indigo-700" />
                                  <span>Blocks / Pockets ({col.blocks?.length || 0})</span>
                                </span>
                                {col.blocks && col.blocks.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {col.blocks.map((blk, idx) => (
                                      <span
                                        key={`${blk}-${idx}`}
                                        className="px-2 py-0.5 rounded-md bg-white border border-indigo-200/80 text-indigo-900 text-[10px] font-semibold"
                                      >
                                        {blk}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">No blocks specified</span>
                                )}
                              </div>
                            </div>

                            {/* Landmarks with On-the-Fly Quick Add & Remove */}
                            <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                  <Landmark size={11} className="text-amber-600" />
                                  <span>Landmarks ({col.landmarks?.length || 0})</span>
                                </span>
                                {col.houseNumberRange && (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-[10px] font-bold">
                                    {col.houseNumberRange}
                                  </span>
                                )}
                              </div>

                              {col.landmarks && col.landmarks.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {col.landmarks.map((lm, idx) => (
                                    <span
                                      key={`${lm}-${idx}`}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50/90 border border-amber-200 text-amber-950 text-[10px] font-semibold"
                                    >
                                      <span>{lm}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleQuickRemoveLandmark(col, lm)}
                                        title={`Remove landmark "${lm}"`}
                                        className="text-amber-600 hover:text-rose-700 cursor-pointer"
                                      >
                                        <X size={10} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic block">No landmarks specified yet</span>
                              )}

                              {/* Inline On-the-Fly Landmark Adder */}
                              <div className="flex items-center gap-1.5 pt-1">
                                <input
                                  type="text"
                                  value={inlineLandmarkInputMap[col.id] || ''}
                                  onChange={(e) =>
                                    setInlineLandmarkInputMap((prev) => ({
                                      ...prev,
                                      [col.id]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleQuickAddLandmark(col);
                                    }
                                  }}
                                  placeholder={`+ Add landmark to ${col.colonyName}...`}
                                  className="flex-1 text-[11px] px-2.5 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleQuickAddLandmark(col)}
                                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                                >
                                  <Plus size={11} />
                                  <span>Add Landmark</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-mono">ID: {col.id}</span>
                          <span>Registered: {new Date(col.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredDivisionColonies.length > 0 && (
                  <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600 font-medium">
                      Showing <b className="text-slate-900">{(safeDivisionPage - 1) * MASTER_PAGE_SIZE + 1}</b>–
                      <b className="text-slate-900">{Math.min(safeDivisionPage * MASTER_PAGE_SIZE, filteredDivisionColonies.length)}</b> of{' '}
                      <b className="text-slate-900">{filteredDivisionColonies.length}</b> colonies (5 per page)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={safeDivisionPage <= 1}
                        onClick={() => setDivisionPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                      >
                        Prev
                      </button>
                      <span className="font-bold text-slate-800 px-1">
                        Page {safeDivisionPage} / {totalDivisionPages}
                      </span>
                      <button
                        type="button"
                        disabled={safeDivisionPage >= totalDivisionPages}
                        onClick={() => setDivisionPage((p) => Math.min(totalDivisionPages, p + 1))}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mapped Households & Customer Addresses Tab */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Registration Form */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/90 lg:col-span-1 h-fit sticky top-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Link Customer to Beat</span>
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                Mobile Check
              </span>
            </div>

            <form onSubmit={handleRegisterCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer / Household Head Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar Verma"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (Mandatory) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9829012345"
                  value={custMobile}
                  onChange={(e) => setCustMobile(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  House / Plot / Office Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plot No. 12-A, Near Temple"
                  value={custHouseNo}
                  onChange={(e) => setCustHouseNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Granular Sector & Landmark Delegation during Address Registration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sector / Block / Pocket
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 6, Block A, KH Series"
                    value={custSector}
                    onChange={(e) => setCustSector(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nearest Landmark / Sub-Point
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shiv Mandir, CAD Circle"
                    value={custLandmark}
                    onChange={(e) => setCustLandmark(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link to Registered Colony & Beat <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedColonyId}
                  onChange={(e) => setSelectedColonyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="">-- Select Registered Colony --</option>
                  {scopedLegacyColonies.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.colonyName} ({col.sectorPhase}) → {col.beatNo} ({col.postmanName})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Selecting a colony automatically binds Pincode 324009, Beat No, and delivery staff.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Establishment Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Residential', 'Commercial', 'Government'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCustHouseholdType(type)}
                      className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer flex flex-col items-center gap-1 ${
                        custHouseholdType === type
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type === 'Residential' && <Home size={14} />}
                      {type === 'Commercial' && <Briefcase size={14} />}
                      {type === 'Government' && <Landmark size={14} />}
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>Save Household & Map Beat</span>
              </button>
            </form>
          </div>

          {/* Right Column: Customer Master Table */}
          <div className="space-y-4 lg:col-span-2">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer, phone, colony..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <select
                  value={selectedHouseholdFilter}
                  onChange={(e) => setSelectedHouseholdFilter(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-700"
                >
                  <option value="ALL">All Types</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Government">Government</option>
                </select>

                <select
                  value={selectedBeatFilter}
                  onChange={(e) => setSelectedBeatFilter(e.target.value)}
                  disabled={isRestrictedStaff && (scopedBeatsSet?.size || 0) <= 1}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-700 disabled:opacity-75"
                >
                  {isRestrictedStaff ? (
                    <>
                      <option value="ALL">My Beat ({userProfile?.beat})</option>
                      {(scopedBeatsSet ? Array.from<string>(scopedBeatsSet) : []).map((b) => (
                        <option key={b} value={`Beat ${b.toUpperCase()}`}>Beat {b.toUpperCase()}</option>
                      ))}
                    </>
                  ) : (
                    <>
                      <option value="ALL">All Beats</option>
                      {DADABARI_ALL_BEATS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </>
                  )}
                </select>

                <button
                  onClick={handleExportCustomers}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition"
                  title="Export Customers to Excel"
                >
                  <Download size={15} />
                </button>
              </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Customer / Household</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Mapped Colony & Address</th>
                      <th className="py-3 px-4">Beat & Staff</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                          No customer records match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedCustomers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {cust.name}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <Phone size={13} className="text-slate-400" />
                              <span>{cust.mobile}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 space-y-0.5">
                            <div className="font-semibold text-slate-800">{cust.colony}</div>
                            <div className="text-[11px] text-slate-500">
                              {cust.houseNo ? `${cust.houseNo}, ` : ''}
                              {cust.sector} • PIN {cust.pincode}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-md font-bold text-[11px] bg-amber-50 text-amber-800 border border-amber-200">
                              {cust.beatNo}
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5">{cust.postmanName}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                cust.householdType === 'Residential'
                                  ? 'bg-blue-50 text-blue-700'
                                  : cust.householdType === 'Commercial'
                                  ? 'bg-purple-50 text-purple-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {cust.householdType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteCustomer(cust.id, cust.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {filteredCustomers.length > 0 && (
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-600 font-medium">
                    Showing <b className="text-slate-900">{(safeCustomerPage - 1) * MASTER_PAGE_SIZE + 1}</b>–
                    <b className="text-slate-900">{Math.min(safeCustomerPage * MASTER_PAGE_SIZE, filteredCustomers.length)}</b> of{' '}
                    <b className="text-slate-900">{filteredCustomers.length}</b> households (5 per page)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={safeCustomerPage <= 1}
                      onClick={() => setCustomerPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                    >
                      Prev
                    </button>
                    <span className="font-bold text-slate-800 px-1">
                      Page {safeCustomerPage} / {totalCustomerPages}
                    </span>
                    <button
                      type="button"
                      disabled={safeCustomerPage >= totalCustomerPages}
                      onClick={() => setCustomerPage((p) => Math.min(totalCustomerPages, p + 1))}
                      className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Excel Tools Tab */}
      {activeTab === 'bulk' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="text-emerald-600" size={22} />
                <span>Bulk Spreadsheet Import & Export Hub</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload Master Excel or CSV files containing colonies, sectors, pincodes, and beat mappings.
                Our engine automatically skips duplicate addresses and normalizes data.
              </p>
            </div>

            {bulkStatus && (
              <div className="p-4 bg-blue-50 text-blue-900 rounded-2xl text-xs sm:text-sm font-semibold border border-blue-200">
                {bulkStatus}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Upload Card */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 transition bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Upload size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Upload Excel / CSV</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Supports .xlsx, .xls, .csv format</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Select File to Import
                </button>
              </div>

              {/* Template Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Download size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Download Template</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Standard column headers with sample entries</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Download .xlsx Template
                </button>
              </div>

              {/* Export Official Staff Card */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Dadabari Staff & Beats</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Official 11-staff deployment with roles</p>
                </div>
                <button
                  type="button"
                  onClick={() => staffPermissionService.exportAllToExcel()}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Export Staff Data (.xlsx)
                </button>
              </div>
            </div>

            {/* Quick Export Actions */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-600">
                <b>Quick Action:</b> Download current in-memory master registries in clean Excel spreadsheets.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportColonies}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Export Colonies ({colonies.length})</span>
                </button>
                <button
                  onClick={handleExportCustomers}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Export Households ({customers.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Colony, Landmark & Sector Editing Governance Modal */}
      {editingHadotiColony && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between border-b border-indigo-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Edit Colony / Landmark Master Record</h3>
                  <p className="text-[11px] text-blue-200/80">
                    ID: {editingHadotiColony.id} • Registered {new Date(editingHadotiColony.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingHadotiColony(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedHadotiColony} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Colony / Landmark Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editColonyName}
                    onChange={(e) => setEditColonyName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Entity Classification <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editEntityType}
                    onChange={(e) => setEditEntityType(e.target.value as ColonyEntityType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Residential Colony">🏠 Residential Colony</option>
                    <option value="Commercial Complex">🏢 Commercial Complex</option>
                    <option value="Specific Landmark">🏛️ Specific Landmark</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Division <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editDivision}
                    onChange={(e) => setEditDivision(e.target.value as 'KOTA' | 'BARAN' | 'BUNDI')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="KOTA">Kota Division</option>
                    <option value="BARAN">Baran Division</option>
                    <option value="BUNDI">Bundi Division</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Postal Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Post Office <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editPostOfficeName}
                    onChange={(e) => setEditPostOfficeName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Postal Beat</label>
                  <input
                    type="text"
                    value={editAssignedBeat}
                    onChange={(e) => setEditAssignedBeat(e.target.value)}
                    placeholder="e.g. Beat 2"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editLat}
                    onChange={(e) => {
                      setEditLat(e.target.value);
                      if (e.target.value && editLng) {
                        setEditGoogleMapsUrl(`https://www.google.com/maps?q=${e.target.value},${editLng}`);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editLng}
                    onChange={(e) => {
                      setEditLng(e.target.value);
                      if (editLat && e.target.value) {
                        setEditGoogleMapsUrl(`https://www.google.com/maps?q=${editLat},${e.target.value}`);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Google Maps Direct URL</label>
                  {editGoogleMapsUrl && (
                    <a
                      href={editGoogleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Navigation size={11} />
                      <span>Test Map Link</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  value={editGoogleMapsUrl}
                  onChange={(e) => setEditGoogleMapsUrl(e.target.value)}
                  placeholder="https://www.google.com/maps?q=..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* On-the-Fly Interactive Landmarks, Sectors, Blocks & House Number Ranges Editor */}
              <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                {/* Landmarks Chip Editor */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Landmark size={13} className="text-amber-600" />
                    <span>Landmarks ({editLandmarks.length}) — Add or Remove Without Resetting Existing Data</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {editLandmarks.map((lm, idx) => (
                      <span
                        key={`${lm}-${idx}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 text-[11px] font-semibold"
                      >
                        <span>{lm}</span>
                        <button
                          type="button"
                          onClick={() => setEditLandmarks((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-amber-600 hover:text-rose-700 cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newEditLandmarkInput}
                      onChange={(e) => setNewEditLandmarkInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = newEditLandmarkInput.trim();
                          if (val && !editLandmarks.some((l) => l.toLowerCase() === val.toLowerCase())) {
                            setEditLandmarks((prev) => [...prev, val]);
                            setNewEditLandmarkInput('');
                          }
                        }
                      }}
                      placeholder="e.g. CAD Circle, Shiv Mandir..."
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newEditLandmarkInput.trim();
                        if (!val) return;
                        if (editLandmarks.some((l) => l.toLowerCase() === val.toLowerCase())) {
                          showWarningToast(`Landmark "${val}" is already listed.`);
                          return;
                        }
                        setEditLandmarks((prev) => [...prev, val]);
                        setNewEditLandmarkInput('');
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add Landmark</span>
                    </button>
                  </div>
                </div>

                {/* Sectors Chip Editor */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers size={13} className="text-blue-700" />
                    <span>Sectors ({editSubSectors.length})</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {editSubSectors.map((sec, idx) => (
                      <span
                        key={`${sec}-${idx}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-950 text-[11px] font-semibold"
                      >
                        <span>{sec}</span>
                        <button
                          type="button"
                          onClick={() => setEditSubSectors((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-blue-600 hover:text-rose-700 cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newEditSectorInput}
                      onChange={(e) => setNewEditSectorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = newEditSectorInput.trim();
                          if (val && !editSubSectors.some((s) => s.toLowerCase() === val.toLowerCase())) {
                            setEditSubSectors((prev) => [...prev, val]);
                            setNewEditSectorInput('');
                          }
                        }
                      }}
                      placeholder="e.g. Sector 1, Pocket A..."
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newEditSectorInput.trim();
                        if (!val) return;
                        if (editSubSectors.some((s) => s.toLowerCase() === val.toLowerCase())) {
                          showWarningToast(`Sector "${val}" is already listed.`);
                          return;
                        }
                        setEditSubSectors((prev) => [...prev, val]);
                        setNewEditSectorInput('');
                      }}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add Sector</span>
                    </button>
                  </div>
                </div>

                {/* Blocks Chip Editor */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Building size={13} className="text-indigo-700" />
                    <span>Blocks / Series ({editBlocks.length})</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {editBlocks.map((blk, idx) => (
                      <span
                        key={`${blk}-${idx}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-950 text-[11px] font-semibold"
                      >
                        <span>{blk}</span>
                        <button
                          type="button"
                          onClick={() => setEditBlocks((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-indigo-600 hover:text-rose-700 cursor-pointer"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newEditBlockInput}
                      onChange={(e) => setNewEditBlockInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = newEditBlockInput.trim();
                          if (val && !editBlocks.some((b) => b.toLowerCase() === val.toLowerCase())) {
                            setEditBlocks((prev) => [...prev, val]);
                            setNewEditBlockInput('');
                          }
                        }
                      }}
                      placeholder="e.g. Block A, KH Series..."
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newEditBlockInput.trim();
                        if (!val) return;
                        if (editBlocks.some((b) => b.toLowerCase() === val.toLowerCase())) {
                          showWarningToast(`Block "${val}" is already listed.`);
                          return;
                        }
                        setEditBlocks((prev) => [...prev, val]);
                        setNewEditBlockInput('');
                      }}
                      className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add Block</span>
                    </button>
                  </div>
                </div>

                {/* House Number Ranges */}
                <div className="pt-2 border-t border-slate-200/80">
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Home size={13} className="text-emerald-700" />
                    <span>House Number Ranges</span>
                  </label>
                  <input
                    type="text"
                    value={editHouseNumberRange}
                    onChange={(e) => setEditHouseNumberRange(e.target.value)}
                    placeholder="e.g. H.No. 1 - 417, Plot 1 - 1010"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingHadotiColony(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Save Master Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clean React Delete Confirmation Modal (No window.confirm) */}
      {pendingDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-rose-50 border-b border-rose-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-rose-950">Confirm Permanent Removal</h3>
                <p className="text-xs text-rose-700">Master Directory Record Deletion</p>
              </div>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-700">
              <p>
                Are you sure you want to permanently remove{' '}
                <strong className="text-slate-950">{pendingDeleteTarget.name}</strong>
                {pendingDeleteTarget.pincode ? ` (PIN ${pendingDeleteTarget.pincode})` : ''} from the master database?
              </p>
              <p className="text-[11px] text-slate-500">
                This action removes the record from the Colony Directory Master. Use Beat Management if you only want to unmap a colony from a delivery beat.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDeleteTarget(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPendingDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
