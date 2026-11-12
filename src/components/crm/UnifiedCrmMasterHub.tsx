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
  Map,
  X,
  Check,
  RefreshCw,
  Home,
  Briefcase,
  Landmark,
  Globe,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { staffPermissionService } from '../../services/staffPermissionService';
import { masterDataService } from '../../services/masterDataService';
import { ColonyMasterRecord, ColonyEntityType } from '../../types/models';

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
  { name: 'Engineering College S.O.', pincode: '324010' },
  { name: 'Vigyan Nagar S.O.', pincode: '324005' },
  { name: 'Kota H.O.', pincode: '324001' },
];

export default function UnifiedCrmMasterHub() {
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

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'colonies' | 'division-colonies' | 'customers' | 'bulk'>('colonies');

  // Hadoti Division Colony Master State (Kota, Baran, Bundi)
  const [divisionColonies, setDivisionColonies] = useState<ColonyMasterRecord[]>(() =>
    masterDataService.getColonyMasterRecords()
  );
  const [divisionFilter, setDivisionFilter] = useState<'ALL' | 'KOTA' | 'BARAN' | 'BUNDI' | 'PENDING'>('ALL');
  const [divisionSearch, setDivisionSearch] = useState('');
  const [hadotiColonyName, setHadotiColonyName] = useState('');
  const [hadotiEntityType, setHadotiEntityType] = useState<ColonyEntityType>('Residential Colony');
  const [hadotiPincode, setHadotiPincode] = useState('324009');
  const [hadotiDivision, setHadotiDivision] = useState<'KOTA' | 'BARAN' | 'BUNDI'>('KOTA');
  const [hadotiPostOfficeName, setHadotiPostOfficeName] = useState('Dadabari S.O.');
  const [hadotiLat, setHadotiLat] = useState('25.1432');
  const [hadotiLng, setHadotiLng] = useState('75.8234');
  const [hadotiSubSectors, setHadotiSubSectors] = useState('Sector 1, Sector 2, Pocket A');
  const [hadotiAssignedBeat, setHadotiAssignedBeat] = useState('Beat 2');
  const [hadotiStatusMessage, setHadotiStatusMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [inlineBeatEditId, setInlineBeatEditId] = useState<string | null>(null);
  const [inlineBeatValue, setInlineBeatValue] = useState('');
  const [inlineSectorInputMap, setInlineSectorInputMap] = useState<Record<string, string>>({});

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
  const [newEditSectorInput, setNewEditSectorInput] = useState('');

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

  // Filtered Hadoti Division Colonies
  const filteredDivisionColonies = useMemo(() => {
    return divisionColonies.filter((c) => {
      if (divisionFilter === 'KOTA' && c.division !== 'KOTA') return false;
      if (divisionFilter === 'BARAN' && c.division !== 'BARAN') return false;
      if (divisionFilter === 'BUNDI' && c.division !== 'BUNDI') return false;
      if (divisionFilter === 'PENDING' && c.status !== 'PENDING_BEAT_MAPPING') return false;

      if (divisionSearch.trim()) {
        const q = divisionSearch.toLowerCase().trim();
        const matchName = c.colonyName.toLowerCase().includes(q);
        const matchPin = c.pincode.includes(q);
        const matchPo = c.postOfficeName.toLowerCase().includes(q);
        const matchBeat = (c.assignedBeat || '').toLowerCase().includes(q);
        const matchType = (c.entityType || '').toLowerCase().includes(q);
        const matchSectors = (c.subSectors || []).some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchPin && !matchPo && !matchBeat && !matchType && !matchSectors) return false;
      }
      return true;
    });
  }, [divisionColonies, divisionFilter, divisionSearch]);

  const handleRegisterHadotiColony = (e: React.FormEvent) => {
    e.preventDefault();
    setHadotiStatusMessage(null);

    if (!hadotiColonyName.trim() || !hadotiPincode.trim() || !hadotiPostOfficeName.trim()) {
      setHadotiStatusMessage({
        success: false,
        text: 'Colony name, Pincode, and Post Office are mandatory fields.',
      });
      return;
    }

    const latNum = parseFloat(hadotiLat) || 25.1432;
    const lngNum = parseFloat(hadotiLng) || 75.8234;
    const subSectorsList = hadotiSubSectors.trim()
      ? hadotiSubSectors.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const res = masterDataService.addColonyMasterRecord({
      colonyName: hadotiColonyName.trim(),
      entityType: hadotiEntityType,
      pincode: hadotiPincode.trim(),
      division: hadotiDivision,
      postOfficeName: hadotiPostOfficeName.trim(),
      subSectors: subSectorsList,
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
      showSuccessNotification(res.message);
    } else {
      setHadotiStatusMessage({ success: false, text: res.message });
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

  // Granular Sector & Pocket Management Handlers
  const handleAddSubSector = (colonyId: string, colonyName: string) => {
    const rawVal = inlineSectorInputMap[colonyId]?.trim();
    if (!rawVal) return;
    const target = divisionColonies.find((c) => c.id === colonyId);
    if (!target) return;
    const currentSectors = target.subSectors || [];
    if (currentSectors.some((s) => s.toLowerCase() === rawVal.toLowerCase())) {
      alert(`Sector/Pocket "${rawVal}" already exists in ${colonyName}!`);
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
    setNewEditSectorInput('');
  };

  const handleSaveEditedHadotiColony = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHadotiColony) return;
    const lat = parseFloat(editLat) || 25.1432;
    const lng = parseFloat(editLng) || 75.8234;
    const gUrl = editGoogleMapsUrl.trim() || `https://www.google.com/maps?q=${lat},${lng}`;

    masterDataService.updateColonyMasterRecord(editingHadotiColony.id, {
      colonyName: editColonyName.trim(),
      entityType: editEntityType,
      pincode: editPincode.trim(),
      division: editDivision,
      postOfficeName: editPostOfficeName.trim(),
      assignedBeat: editAssignedBeat.trim() ? editAssignedBeat.trim() : 'PENDING_ASSIGNMENT',
      geoTag: {
        lat,
        lng,
        googleMapsUrl: gUrl,
      },
      subSectors: editSubSectors,
    });

    showSuccessNotification(`Colony / Landmark record "${editColonyName.trim()}" updated successfully!`);
    setEditingHadotiColony(null);
  };

  const handleDeleteHadotiColony = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from Hadoti Master Database?`)) {
      const deleted = masterDataService.deleteColonyMasterRecord(id);
      if (deleted) {
        showSuccessNotification(`Colony "${name}" deleted.`);
      }
    }
  };

  const handleExportHadotiColonies = () => {
    const rows = divisionColonies.map((c) => ({
      'Record ID': c.id,
      'Colony Name': c.colonyName,
      'Division': c.division,
      'Postal Pincode': c.pincode,
      'Registered Post Office': c.postOfficeName,
      'Latitude': c.geoTag.lat,
      'Longitude': c.geoTag.lng,
      'Assigned Beat': c.assignedBeat || 'PENDING_ASSIGNMENT',
      'Status': c.status,
      'Registration Date': c.createdAt,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hadoti_Colony_Master');
    XLSX.writeFile(
      wb,
      `Hadoti_Colony_Master_Kota_Baran_Bundi_${new Date().toISOString().split('T')[0]}.xlsx`
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
    if (window.confirm(`Are you sure you want to remove '${name}' from Beat Registry?`)) {
      setColonies((prev) => prev.filter((c) => c.id !== id));
      showSuccessNotification(`Removed '${name}' from colony master.`);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = (id: string, name: string) => {
    if (window.confirm(`Delete record for '${name}'?`)) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      showSuccessNotification(`Removed customer record '${name}'.`);
    }
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

  // Filtered Colonies
  const filteredColonies = useMemo(() => {
    return colonies.filter((c) => {
      const matchOffice =
        selectedOfficeFilter === 'ALL' ||
        (c.subOffice && c.subOffice.toLowerCase().includes(selectedOfficeFilter.toLowerCase())) ||
        (selectedOfficeFilter === 'Dadabari S.O.' && (!c.subOffice || c.subOffice === 'Dadabari S.O.'));

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
  }, [colonies, searchQuery, selectedBeatFilter, selectedOfficeFilter]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
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
  }, [customers, searchQuery, selectedBeatFilter, selectedHouseholdFilter]);

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
            <div className="text-2xl font-black text-slate-900">{colonies.length}</div>
            <div className="text-[11px] text-indigo-600 font-medium mt-0.5">Under Dadabari S.O.</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mapped Households</div>
            <div className="text-2xl font-black text-slate-900">{customers.length}</div>
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
            <div className="text-2xl font-black text-slate-900">6 Beats</div>
            <div className="text-[11px] text-rose-600 font-medium mt-0.5">100% Pincode 324009</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('colonies')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'colonies'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MapPin size={16} />
          <span>Colony & Sector Mapping ({colonies.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('division-colonies')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'division-colonies'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Map size={16} />
          <span>Hadoti Division Colony Master (Kota • Baran • Bundi) ({divisionColonies.length})</span>
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
          <span>Mapped Households & Customers ({customers.length})</span>
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
                      className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                    >
                      {DADABARI_ALL_BEATS.map((beat) => {
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
                    className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:outline-hidden"
                  >
                    <option value="ALL">All Offices</option>
                    <option value="Dadabari S.O.">Dadabari S.O. (324009)</option>
                    <option value="Engineering College S.O.">Engineering College (324010)</option>
                    <option value="Vigyan Nagar S.O.">Vigyan Nagar (324005)</option>
                    <option value="Kota H.O.">Kota H.O. (324001)</option>
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
                    className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:outline-hidden max-w-[130px]"
                  >
                    <option value="ALL">All Beats (33)</option>
                    {DADABARI_ALL_BEATS.map((beat) => {
                      const staff = BEAT_STAFF_DIRECTORY[beat];
                      return (
                        <option key={beat} value={beat}>
                          {beat} {staff ? `(${staff.name.split(' ')[0]})` : ''}
                        </option>
                      );
                    })}
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
                filteredColonies.map((col) => (
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
                            {customers.filter((c) => c.colony === col.colonyName).length}
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
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hadoti Division Colony Master Tab (Kota, Baran, Bundi) */}
      {activeTab === 'division-colonies' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Hadoti</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{divisionColonies.length} Colonies</div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">3 Divisions Master</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-blue-200/90 shadow-xs">
              <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Kota Division</div>
              <div className="text-xl font-black text-blue-900 mt-0.5">
                {divisionColonies.filter((c) => c.division === 'KOTA').length} Colonies
              </div>
              <div className="text-[10px] text-blue-600 font-medium mt-0.5">PIN 324xxx Belts</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-amber-200/90 shadow-xs">
              <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Baran Division</div>
              <div className="text-xl font-black text-amber-900 mt-0.5">
                {divisionColonies.filter((c) => c.division === 'BARAN').length} Colonies
              </div>
              <div className="text-[10px] text-amber-600 font-medium mt-0.5">PIN 325xxx Belts</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-200/90 shadow-xs">
              <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Bundi Division</div>
              <div className="text-xl font-black text-emerald-900 mt-0.5">
                {divisionColonies.filter((c) => c.division === 'BUNDI').length} Colonies
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">PIN 323xxx Belts</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-rose-200/90 shadow-xs col-span-2 sm:col-span-1">
              <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Pending Mapping</div>
              <div className="text-xl font-black text-rose-700 mt-0.5">
                {divisionColonies.filter((c) => c.status === 'PENDING_BEAT_MAPPING').length} Records
              </div>
              <div className="text-[10px] text-rose-600 font-medium mt-0.5">Awaiting Beat Allocation</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Register Colony to Hadoti Master */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/90 lg:col-span-1 h-fit sticky top-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  <span>Register Colony to Master</span>
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Duplication Guard
                </span>
              </div>

              <form onSubmit={handleRegisterHadotiColony} className="space-y-4">
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
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Entity Classification <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={hadotiEntityType}
                      onChange={(e) => setHadotiEntityType(e.target.value as ColonyEntityType)}
                      className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="KOTA">Kota Division</option>
                      <option value="BARAN">Baran Division</option>
                      <option value="BUNDI">Bundi Division</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
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
                      placeholder="e.g. Dadabari S.O., Kota H.O., Baran H.O."
                      className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={hadotiLat}
                      onChange={(e) => setHadotiLat(e.target.value)}
                      placeholder="e.g. 25.1432"
                      className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                    <ShieldCheck size={13} className="text-indigo-600" />
                    <span>Streamlined Master Record Rule</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Colony Directory strictly preserves high-level territory records (Name, Type, PIN, Office, Geo-tag). Granular sectors, blocks, and delivery landmarks are delegated to <strong>Beat Mapping</strong> and <strong>Address Registration</strong>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Postal Beat (Optional)
                  </label>
                  <input
                    type="text"
                    value={hadotiAssignedBeat}
                    onChange={(e) => setHadotiAssignedBeat(e.target.value)}
                    placeholder="e.g. Beat 2 (Leave empty if unassigned)"
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="mt-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] flex items-center justify-between">
                    <span className="text-slate-500">Auto Status Preview:</span>
                    {hadotiAssignedBeat.trim() ? (
                      <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                        ACTIVE (Beat Assigned)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 text-[10px]">
                        PENDING_BEAT_MAPPING
                      </span>
                    )}
                  </div>
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

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Register Colony to Master</span>
                </button>
              </form>
            </div>

            {/* Right Column: Master Records Directory */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filter & Search Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => setDivisionFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      divisionFilter === 'ALL'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({divisionColonies.length})
                  </button>
                  <button
                    onClick={() => setDivisionFilter('KOTA')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      divisionFilter === 'KOTA'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    Kota ({divisionColonies.filter((c) => c.division === 'KOTA').length})
                  </button>
                  <button
                    onClick={() => setDivisionFilter('BARAN')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      divisionFilter === 'BARAN'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    Baran ({divisionColonies.filter((c) => c.division === 'BARAN').length})
                  </button>
                  <button
                    onClick={() => setDivisionFilter('BUNDI')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      divisionFilter === 'BUNDI'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Bundi ({divisionColonies.filter((c) => c.division === 'BUNDI').length})
                  </button>
                  <button
                    onClick={() => setDivisionFilter('PENDING')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      divisionFilter === 'PENDING'
                        ? 'bg-rose-700 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    Pending Mapping ({divisionColonies.filter((c) => c.status === 'PENDING_BEAT_MAPPING').length})
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-60">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={divisionSearch}
                      onChange={(e) => setDivisionSearch(e.target.value)}
                      placeholder="Search colony, PIN, post office..."
                      className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    onClick={handleExportHadotiColonies}
                    title="Export to Excel"
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl transition cursor-pointer shrink-0"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>

              {/* Colony Cards Grid */}
              <div className="space-y-3">
                {filteredDivisionColonies.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                    <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold">No colony records found matching your filters.</p>
                  </div>
                ) : (
                  filteredDivisionColonies.map((col) => (
                    <div
                      key={col.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">{col.colonyName}</span>

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
                            {col.division} DIVISION
                          </span>
                          <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            PIN {col.pincode}
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
                            {col.status === 'ACTIVE' ? 'ACTIVE BEAT' : 'PENDING BEAT MAPPING'}
                          </span>
                          
                          {/* Live Edit & Delete Actions */}
                          <button
                            onClick={() => handleOpenEditHadotiModal(col)}
                            title="Edit Colony / Landmark Master Record"
                            className="p-1 hover:bg-blue-50 text-slate-400 hover:text-blue-700 rounded transition cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteHadotiColony(col.id, col.colonyName)}
                            title="Delete Colony Record"
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Post Office</span>
                          <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                            <Building2 size={13} className="text-slate-400 shrink-0" />
                            {col.postOfficeName}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Geo-Tag (Lat/Lng)</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-slate-700 text-xs">
                              {col.geoTag.lat.toFixed(4)}, {col.geoTag.lng.toFixed(4)}
                            </span>
                            <a
                              href={col.geoTag.googleMapsUrl || `https://www.google.com/maps?q=${col.geoTag.lat},${col.geoTag.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-[10px] font-bold flex items-center gap-1 transition"
                              title="Open in Google Maps"
                            >
                              <Navigation size={10} className="shrink-0" />
                              <span>View Map / Pin</span>
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
                                className="w-24 text-xs font-semibold px-2 py-0.5 border border-indigo-400 rounded focus:outline-none"
                              />
                              <button
                                onClick={() => handleUpdateHadotiBeat(col.id, inlineBeatValue)}
                                className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setInlineBeatEditId(null);
                                  setInlineBeatValue('');
                                }}
                                className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]"
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
                                Edit Beat
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Streamlined High-Level Footer Bar */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-mono text-slate-400">ID: {col.id}</span>
                        <span className="text-[10px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          Sectors & Landmarks managed in Beat & Address forms
                        </span>
                        <span className="text-slate-400">Reg: {new Date(col.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono">ID: {col.id}</span>
                        <span>Registered: {new Date(col.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
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
                  {colonies.map((col) => (
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
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white text-slate-700"
                >
                  <option value="ALL">All Beats</option>
                  <option value="Beat 1">Beat 1</option>
                  <option value="Beat 2">Beat 2</option>
                  <option value="Beat 3">Beat 3</option>
                  <option value="Beat 4">Beat 4</option>
                  <option value="Beat 5">Beat 5</option>
                  <option value="Beat 6">Beat 6</option>
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
                      filteredCustomers.map((cust) => (
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

              {/* Streamlined Architecture Note in Edit Modal */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Layers size={14} className="text-indigo-600" />
                  <span>Colony Master Boundaries</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Colony Directory maintains high-level territory records (Name, Classification, PIN, Office, Geo-tag). Granular sectors, pockets, and landmark points are managed dynamically in <strong>Beat Multi-Colony Mapping</strong>.
                </p>
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
    </div>
  );
}
