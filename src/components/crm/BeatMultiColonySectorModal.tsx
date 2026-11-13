import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Layers,
  Check,
  X,
  Search,
  Plus,
  Trash2,
  FileText,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info,
  CheckSquare,
  Square,
  Building,
  AlertTriangle,
  Landmark,
  Compass,
  MapPinCheck,
} from 'lucide-react';
import { COLONY_HIERARCHY_MAP } from '../../data/colonyHierarchyData';
import { RAJASTHAN_CIRCLE_OFFICE_MASTER_LIST } from '../../data/officesData';
import { masterDataService } from '../../services/masterDataService';
import { customerService } from '../../services/customerService';
import { SectorLandmarkCategory } from '../../types/models';

export interface SectorLandmarkEntry {
  id: string;
  name: string;
  category: SectorLandmarkCategory;
}

export interface BeatMultiColonySectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  beatNo: string;
  assignedStaffName?: string;
  officeName?: string;
  pincode?: string;
  division?: string;
  initialSelectedColonies?: string[];
  initialColoniesWithSectors?: Record<string, string[]>;
  initialSectorLandmarks?: Record<string, Record<string, SectorLandmarkEntry[]>>;
  initialBeatNotes?: string;
  onSave: (data: {
    selectedColonies: string[];
    coloniesWithSectors: Record<string, string[]>;
    sectorLandmarks?: Record<string, Record<string, SectorLandmarkEntry[]>>;
    beatNotes: string;
  }) => void;
}

// Preset verified real-world landmarks for Hadoti & Kota belt sectors
const DEFAULT_SECTOR_LANDMARKS: Record<string, Record<string, SectorLandmarkEntry[]>> = {
  Keshavpura: {
    'Sector 7': [
      { id: 'lm-k7-1', name: 'Sheetla Mata Mandir', category: 'Temple / Religious' },
      { id: 'lm-k7-2', name: 'Plot 1010 Community Park', category: 'Park / Public Spot' },
      { id: 'lm-k7-3', name: 'Sector 7 Main Road Chowk', category: 'Chowk / Junction' },
    ],
    'Sector 6': [
      { id: 'lm-k6-1', name: 'Shiv Mandir', category: 'Temple / Religious' },
      { id: 'lm-k6-2', name: 'KH Series Entrance T-Point', category: 'Chowk / Junction' },
    ],
    'KH Series': [
      { id: 'lm-kh-1', name: 'KH-100 Water Tank Point', category: 'Park / Public Spot' },
      { id: 'lm-kh-2', name: 'Ganesh Mandir Chauraha', category: 'Temple / Religious' },
    ],
    'Sector 4': [
      { id: 'lm-k4-1', name: 'Keshavpura Central Market', category: 'Commercial / Market' },
      { id: 'lm-k4-2', name: 'Sector 4 Govt Secondary School', category: 'School / Hospital' },
    ],
  },
  Dadabari: {
    'Sector 1': [
      { id: 'lm-db1-1', name: 'CAD Circle Monument', category: 'Chowk / Junction' },
      { id: 'lm-db1-2', name: 'Dadabari Sub-Post Office Building', category: 'Commercial / Market' },
    ],
    'Sector 2': [
      { id: 'lm-db2-1', name: 'Modi College Entrance Road', category: 'School / Hospital' },
      { id: 'lm-db2-2', name: 'Dadabari Extension Hanuman Mandir', category: 'Temple / Religious' },
    ],
  },
  'Basant Vihar': {
    'Sector 1': [
      { id: 'lm-bv1-1', name: 'Basant Vihar Central Garden', category: 'Park / Public Spot' },
      { id: 'lm-bv1-2', name: 'Radha Krishna Temple', category: 'Temple / Religious' },
    ],
    'Block A': [
      { id: 'lm-bva-1', name: 'Community Center Block A', category: 'Park / Public Spot' },
    ],
  },
  Talwandi: {
    'Sector 2': [
      { id: 'lm-tal2-1', name: 'Talwandi Circle Fountain', category: 'Chowk / Junction' },
      { id: 'lm-tal2-2', name: 'Commerce College Corner', category: 'School / Hospital' },
    ],
  },
};

const getCategoryIcon = (category?: SectorLandmarkCategory) => {
  switch (category) {
    case 'Temple / Religious':
      return '🚩';
    case 'Chowk / Junction':
      return '🚦';
    case 'Commercial / Market':
      return '🏢';
    case 'Park / Public Spot':
      return '🌳';
    case 'School / Hospital':
      return '🏥';
    default:
      return '🏛️';
  }
};

const EMPTY_COLONIES: string[] = [];
const EMPTY_SECTORS_MAP: Record<string, string[]> = {};
const EMPTY_LANDMARKS_MAP: Record<string, Record<string, SectorLandmarkEntry[]>> = {};

export default function BeatMultiColonySectorModal({
  isOpen,
  onClose,
  beatNo,
  assignedStaffName = 'Assigned Staff',
  officeName = 'Dadabari S.O.',
  pincode = '324009',
  division = 'KOTA',
  initialSelectedColonies = EMPTY_COLONIES,
  initialColoniesWithSectors = EMPTY_SECTORS_MAP,
  initialSectorLandmarks = EMPTY_LANDMARKS_MAP,
  initialBeatNotes = '',
  onSave,
}: BeatMultiColonySectorModalProps) {
  const initializedSessionRef = useRef<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColonies, setSelectedColonies] = useState<string[]>([]);
  const [coloniesWithSectors, setColoniesWithSectors] = useState<Record<string, string[]>>({});
  const [sectorLandmarks, setSectorLandmarks] = useState<Record<string, Record<string, SectorLandmarkEntry[]>>>(() => {
    try {
      const stored = localStorage.getItem('postman_crm_beat_sector_landmarks_v2');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return DEFAULT_SECTOR_LANDMARKS;
  });

  const [beatNotes, setBeatNotes] = useState('');
  const [expandedColonies, setExpandedColonies] = useState<Record<string, boolean>>({});
  const [expandedSectorLandmarks, setExpandedSectorLandmarks] = useState<Record<string, boolean>>({});
  const [customSectorInput, setCustomSectorInput] = useState<Record<string, string>>({});

  // Landmark inputs per sector
  const [landmarkInputMap, setLandmarkInputMap] = useState<Record<string, string>>({});
  const [landmarkCategoryMap, setLandmarkCategoryMap] = useState<Record<string, SectorLandmarkCategory>>({});

  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [modalAlert, setModalAlert] = useState<string | null>(null);

  // Helper to retrieve standard sectors, blocks & house series for a colony
  const getAvailableSectorsForColony = (colonyName: string): string[] => {
    const set = new Set<string>();
    const hierarchy = COLONY_HIERARCHY_MAP[colonyName];
    if (hierarchy) {
      hierarchy.sectors.forEach((s) => set.add(s.name));
    }

    // Also check masterDataService for custom registered subSectors
    try {
      const matched = masterDataService
        .getColonyMasterRecords()
        .find((r) => r.colonyName.toLowerCase() === colonyName.toLowerCase());
      if (matched && matched.subSectors) {
        matched.subSectors.forEach((s) => set.add(s));
      }
    } catch {}

    // Include customer house series & blocks registered under this colony
    try {
      const customers = customerService.getCustomers();
      customers.forEach((c) => {
        if (c.colony && c.colony.toLowerCase() === colonyName.toLowerCase()) {
          if (c.sector && c.sector.trim()) set.add(c.sector.trim());
          if (c.houseNo && c.houseNo.trim()) set.add(`House ${c.houseNo.trim()}`);
        }
      });
    } catch {}

    // Include already selected custom sectors
    const currentSelected = coloniesWithSectors[colonyName] || [];
    currentSelected.forEach((s) => set.add(s));

    if (set.size === 0) {
      return ['Sector 1', 'Sector 2', 'Sector 3', 'Main Colony Area'];
    }

    return Array.from(set);
  };

  // Helper: check if a colony name explicitly belongs to a different pincode
  const isColonyBoundToDifferentPincode = (colonyName: string, targetPin: string): boolean => {
    const cleanTargetPin = targetPin.trim();
    if (!cleanTargetPin) return false;
    const normName = colonyName.trim().toLowerCase();

    try {
      const masterRecords = masterDataService.getColonyMasterRecords();
      const matchingRecords = masterRecords.filter(
        (r) => r.colonyName.trim().toLowerCase() === normName
      );
      if (matchingRecords.length > 0) {
        return !matchingRecords.some((r) => r.pincode.trim() === cleanTargetPin);
      }
    } catch {}

    const hierarchyEntry = Object.entries(COLONY_HIERARCHY_MAP).find(
      ([key]) => key.trim().toLowerCase() === normName
    );
    if (hierarchyEntry && hierarchyEntry[1].defaultPincode.trim() !== cleanTargetPin) {
      return true;
    }

    return false;
  };

  // Initialize state once per modal open session (prevents infinite re-render loops)
  useEffect(() => {
    if (!isOpen) {
      initializedSessionRef.current = null;
      return;
    }

    const sessionKey = `${beatNo}__${pincode}`;
    if (initializedSessionRef.current === sessionKey) {
      return;
    }
    initializedSessionRef.current = sessionKey;

    const cleanPin = (pincode || '').trim();
    const colonies = initialSelectedColonies.filter(
      (c) => !isColonyBoundToDifferentPincode(c, cleanPin)
    );
    setSelectedColonies(colonies);

    // Prepopulate sector map with auto-inherited sectors for all colonies
    const initialSectorsMap: Record<string, string[]> = { ...initialColoniesWithSectors };
    colonies.forEach((col) => {
      if (!initialSectorsMap[col] || initialSectorsMap[col].length === 0) {
        const inherited = getAvailableSectorsForColony(col);
        initialSectorsMap[col] = inherited;
      }
    });
    setColoniesWithSectors(initialSectorsMap);

    // Merge initialSectorLandmarks with local storage / defaults
    if (initialSectorLandmarks && Object.keys(initialSectorLandmarks).length > 0) {
      setSectorLandmarks((prev) => ({
        ...prev,
        ...initialSectorLandmarks,
      }));
    }

    setBeatNotes(initialBeatNotes || '');

    // Expand all selected colonies by default
    const initialExpanded: Record<string, boolean> = {};
    colonies.forEach((c) => {
      initialExpanded[c] = true;
    });
    setExpandedColonies(initialExpanded);

    // Auto expand first sector landmark view for convenience
    const initialExpandedLandmarks: Record<string, boolean> = {};
    colonies.forEach((c) => {
      const firstSec = (initialSectorsMap[c] || [])[0];
      if (firstSec) {
        initialExpandedLandmarks[`${c}__${firstSec}`] = true;
      }
    });
    setExpandedSectorLandmarks(initialExpandedLandmarks);

    setSearchQuery('');
    setSaveNotice(null);
    setModalAlert(null);
  }, [isOpen, beatNo, pincode]);

  // Strict Pincode Contextual Isolation:
  // Restrict available colonies strictly to the active Post Office's exact Pincode jurisdiction.
  const allAvailableColonies = useMemo(() => {
    const cleanPin = (pincode || '').trim();
    const coloniesSet = new Set<string>();

    // 1. Primary Source: Master Colony Directory records strictly matching exact Pincode
    try {
      const records = masterDataService.getColonyMasterRecords();
      records.forEach((r) => {
        if (!cleanPin || r.pincode.trim() === cleanPin) {
          coloniesSet.add(r.colonyName.trim());
        }
      });
    } catch (e) {
      console.warn('Error reading master colonies:', e);
    }

    // 2. Hierarchy map entries strictly matching exact Pincode
    if (cleanPin) {
      Object.entries(COLONY_HIERARCHY_MAP).forEach(([colName, h]) => {
        if (h.defaultPincode.trim() === cleanPin) {
          coloniesSet.add(colName.trim());
        }
      });

      // 3. Official Post Office master default colonies strictly matching exact Pincode
      RAJASTHAN_CIRCLE_OFFICE_MASTER_LIST.forEach((po) => {
        if (po.pin.trim() === cleanPin && Array.isArray(po.defaultColonies)) {
          po.defaultColonies.forEach((c) => {
            if (c && c.trim() && !isColonyBoundToDifferentPincode(c, cleanPin)) {
              coloniesSet.add(c.trim());
            }
          });
        }
      });
    }

    // 4. Preserve already-selected colonies only if they belong to this exact Pincode (no cross-pincode leakage)
    initialSelectedColonies.forEach((c) => {
      if (c && c.trim() && !isColonyBoundToDifferentPincode(c, cleanPin)) {
        coloniesSet.add(c.trim());
      }
    });

    return Array.from(coloniesSet).sort();
  }, [pincode, initialSelectedColonies]);

  // Filtered available colonies based on search
  const filteredColonies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allAvailableColonies;
    return allAvailableColonies.filter((c) => c.toLowerCase().includes(q));
  }, [allAvailableColonies, searchQuery]);

  if (!isOpen) return null;

  // Toggle Colony Selection (Safe Unmapping Workflow)
  const handleToggleColony = (colonyName: string) => {
    if (selectedColonies.includes(colonyName)) {
      // Safe Unmap from this beat only (never deletes from master registry)
      setSelectedColonies((prev) => prev.filter((c) => c !== colonyName));
      setColoniesWithSectors((prev) => {
        const copy = { ...prev };
        delete copy[colonyName];
        return copy;
      });
    } else {
      // Link colony to beat & auto-inherit all existing sectors, blocks & houses
      setSelectedColonies((prev) => [...prev, colonyName]);
      setExpandedColonies((prev) => ({ ...prev, [colonyName]: true }));

      const inherited = getAvailableSectorsForColony(colonyName);
      setColoniesWithSectors((prev) => ({
        ...prev,
        [colonyName]: inherited,
      }));
    }
  };

  // Toggle specific sector inside a colony
  const handleToggleSector = (colonyName: string, sectorName: string) => {
    setColoniesWithSectors((prev) => {
      const current = prev[colonyName] || [];
      const updated = current.includes(sectorName)
        ? current.filter((s) => s !== sectorName)
        : [...current, sectorName];
      return {
        ...prev,
        [colonyName]: updated,
      };
    });
  };

  // Add custom sector/block
  const handleAddCustomSector = (colonyName: string) => {
    const input = customSectorInput[colonyName]?.trim();
    if (!input) return;

    setColoniesWithSectors((prev) => {
      const current = prev[colonyName] || [];
      if (current.includes(input)) return prev;
      return {
        ...prev,
        [colonyName]: [...current, input],
      };
    });

    setCustomSectorInput((prev) => ({ ...prev, [colonyName]: '' }));
  };

  // Select all default sectors for a colony
  const handleSelectAllSectorsForColony = (colonyName: string) => {
    const available = getAvailableSectorsForColony(colonyName);
    setColoniesWithSectors((prev) => ({
      ...prev,
      [colonyName]: available,
    }));
  };

  // Clear all sectors for a colony
  const handleClearAllSectorsForColony = (colonyName: string) => {
    setColoniesWithSectors((prev) => ({
      ...prev,
      [colonyName]: [],
    }));
  };

  // ================= LANDMARK MANAGEMENT & DUPLICATE INSPECTION ENGINE =================

  const getLandmarksForSector = (colonyName: string, sectorName: string): SectorLandmarkEntry[] => {
    const colObj = sectorLandmarks[colonyName] || {};
    return colObj[sectorName] || [];
  };

  const countTotalLandmarksForColony = (colonyName: string): number => {
    const colObj = sectorLandmarks[colonyName] || {};
    let total = 0;
    Object.values(colObj).forEach((list) => {
      if (Array.isArray(list)) {
        total += list.length;
      }
    });
    return total;
  };

  const toggleSectorLandmarkExpand = (colonyName: string, sectorName: string) => {
    const key = `${colonyName}__${sectorName}`;
    setExpandedSectorLandmarks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Duplicate Landmark Checker across Current Sector, Colony, and Entire Beat Zone
  const checkDuplicateLandmark = (
    currentColony: string,
    currentSector: string,
    candidateName: string
  ): { isDuplicate: boolean; location?: string } => {
    const q = candidateName.trim().toLowerCase();
    if (!q || q.length < 2) return { isDuplicate: false };

    for (const [col, sectorsObj] of Object.entries(sectorLandmarks)) {
      for (const [sec, lmList] of Object.entries(sectorsObj)) {
        if (!Array.isArray(lmList)) continue;
        const match = lmList.find((lm) => lm.name.trim().toLowerCase() === q);
        if (match) {
          if (col === currentColony && sec === currentSector) {
            return { isDuplicate: true, location: `this sector (${currentSector})` };
          }
          if (col === currentColony) {
            return { isDuplicate: true, location: `${currentColony} > ${sec}` };
          }
          return { isDuplicate: true, location: `${col} > ${sec}` };
        }
      }
    }
    return { isDuplicate: false };
  };

  // Check if an already bound landmark has duplicates in the beat zone
  const isExistingLandmarkDuplicated = (targetColony: string, targetSector: string, landmarkName: string): boolean => {
    const q = landmarkName.trim().toLowerCase();
    let occurrences = 0;
    for (const [, sectorsObj] of Object.entries(sectorLandmarks)) {
      for (const [, lmList] of Object.entries(sectorsObj)) {
        if (Array.isArray(lmList)) {
          occurrences += lmList.filter((lm) => lm.name.trim().toLowerCase() === q).length;
        }
      }
    }
    return occurrences > 1;
  };

  const setLandmarkInput = (colony: string, sector: string, value: string) => {
    const key = `${colony}__${sector}`;
    setLandmarkInputMap((prev) => ({ ...prev, [key]: value }));
  };

  const setLandmarkCategory = (colony: string, sector: string, category: SectorLandmarkCategory) => {
    const key = `${colony}__${sector}`;
    setLandmarkCategoryMap((prev) => ({ ...prev, [key]: category }));
  };

  const handleAddLandmarkToSector = (colonyName: string, sectorName: string) => {
    const key = `${colonyName}__${sectorName}`;
    const name = (landmarkInputMap[key] || '').trim();
    if (!name) return;

    const category = landmarkCategoryMap[key] || 'Temple / Religious';

    // Duplicate check in exact same sector
    const currentList = getLandmarksForSector(colonyName, sectorName);
    const exactMatch = currentList.some((lm) => lm.name.toLowerCase() === name.toLowerCase());
    if (exactMatch) {
      setModalAlert(`Landmark "${name}" is already registered in ${sectorName}!`);
      setTimeout(() => setModalAlert(null), 4000);
      return;
    }

    const newEntry: SectorLandmarkEntry = {
      id: `lm-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      category,
    };

    setSectorLandmarks((prev) => {
      const colObj = prev[colonyName] || {};
      const secList = colObj[sectorName] || [];
      const updated = {
        ...prev,
        [colonyName]: {
          ...colObj,
          [sectorName]: [...secList, newEntry],
        },
      };
      try {
        localStorage.setItem('postman_crm_beat_sector_landmarks_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setLandmarkInputMap((prev) => ({ ...prev, [key]: '' }));
    setSaveNotice(`Landmark "${name}" successfully bound to ${colonyName} > ${sectorName}!`);
    setTimeout(() => setSaveNotice(null), 3000);
  };

  // Safe Landmark Unmapping (Only unmaps from beat, never deletes master colony)
  const handleRemoveLandmarkFromSector = (colonyName: string, sectorName: string, landmarkId: string) => {
    setSectorLandmarks((prev) => {
      const colObj = prev[colonyName] || {};
      const secList = colObj[sectorName] || [];
      const updated = {
        ...prev,
        [colonyName]: {
          ...colObj,
          [sectorName]: secList.filter((lm) => lm.id !== landmarkId),
        },
      };
      try {
        localStorage.setItem('postman_crm_beat_sector_landmarks_v2', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setSaveNotice(`Landmark unmapped from Beat ${beatNo}. Core master records are safely retained.`);
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleSave = () => {
    onSave({
      selectedColonies,
      coloniesWithSectors,
      sectorLandmarks,
      beatNotes,
    });
    setSaveNotice('Beat colony, sector, and landmark mappings successfully updated!');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header with Crimson / Gold / Navy Palette */}
        <div className="bg-gradient-to-r from-slate-950 via-red-950 to-blue-950 p-5 text-white flex items-center justify-between border-b border-red-800/40">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                <ShieldCheck size={12} className="text-amber-400" />
                <span>Beat Operational Mapping</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-400/20 text-blue-200 text-[10px] font-black tracking-wider border border-blue-400/30">
                <Building size={11} className="text-blue-300" />
                <span>PIN: {pincode} • {officeName}</span>
              </div>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Layers size={20} className="text-amber-400" />
              <span>Multi-Colony & Sector Mapping: {beatNo}</span>
            </h2>
            <p className="text-xs text-red-100/80">
              Assign delivery colonies, sector pockets, and landmark points for <strong className="text-white">{assignedStaffName}</strong> within {officeName} ({pincode}).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {saveNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2">
              <Check size={16} className="text-emerald-700 shrink-0" />
              <span>{saveNotice}</span>
            </div>
          )}

          {modalAlert && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 text-xs font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-700 shrink-0" />
                <span>{modalAlert}</span>
              </div>
              <button
                type="button"
                onClick={() => setModalAlert(null)}
                className="text-rose-700 hover:text-rose-950 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Protected Master Register Guardrail Banner */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-black text-amber-900">
                Strict Pincode Jurisdiction ({officeName} • PIN {pincode}) & Protected Master Register
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Only colonies registered under <strong>PIN {pincode}</strong> are selectable for <strong>{beatNo}</strong>. Cross-pincode colonies (e.g., PIN 324005 vs 324009) are automatically isolated. Unmapping here strictly updates this beat without deleting master colony records.
              </p>
            </div>
          </div>

          {/* SECTION 1: Colony Multi-Select Tag / Checkbox Bar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                <MapPin size={15} className="text-red-700" />
                <span>
                  1. Multi-Select Target Colonies ({selectedColonies.length} selected • PIN {pincode} Scope)
                </span>
              </label>
              <div className="relative w-full sm:w-64">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Filter PIN ${pincode} colonies...`}
                  className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>
            </div>

            {/* Scrollable Colony Chips */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl max-h-36 overflow-y-auto flex flex-wrap gap-1.5">
              {filteredColonies.length === 0 ? (
                <div className="w-full py-3 text-center text-xs text-slate-500">
                  No colonies registered under <strong>PIN {pincode}</strong> matching your search. Add colonies for PIN {pincode} in <strong>Colony Directory</strong>.
                </div>
              ) : (
                filteredColonies.map((colony) => {
                  const isSelected = selectedColonies.includes(colony);
                  return (
                    <button
                      key={colony}
                      type="button"
                      onClick={() => handleToggleColony(colony)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-red-800 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? <Check size={12} className="text-amber-400" /> : <Plus size={12} />}
                      <span>{colony}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* SECTION 2: Granular Sector, Block & Landmark Layer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                <Layers size={15} className="text-blue-700" />
                <span>2. Granular Sector, Block & Landmark Layer</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Configure delivery sectors & bind landmark pins per colony
              </span>
            </div>

            {selectedColonies.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 text-xs">
                Please select at least one colony from Step 1 above to map sectors and delivery blocks.
              </div>
            ) : (
              <div className="space-y-4">
                {selectedColonies.map((colony) => {
                  const isExpanded = Boolean(expandedColonies[colony]);
                  const availableSectors = getAvailableSectorsForColony(colony);
                  const activeSectors = coloniesWithSectors[colony] || [];
                  const totalLandmarks = countTotalLandmarksForColony(colony);

                  return (
                    <div
                      key={colony}
                      className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs transition"
                    >
                      {/* Accordion Card Header */}
                      <div
                        onClick={() =>
                          setExpandedColonies((prev) => ({
                            ...prev,
                            [colony]: !prev[colony],
                          }))
                        }
                        className="p-3 bg-slate-100/80 hover:bg-slate-200/60 cursor-pointer flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="p-1 rounded-lg bg-red-100 text-red-900">
                            <MapPin size={14} />
                          </span>
                          <span className="text-xs font-black text-slate-900">{colony}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                            {activeSectors.length} of {availableSectors.length} Sectors Active
                          </span>
                          {totalLandmarks > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                              <Landmark size={10} className="text-amber-700" />
                              <span>{totalLandmarks} Landmarks</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-[11px] text-slate-500 font-mono hidden sm:block truncate max-w-xs">
                            {activeSectors.length > 0
                              ? activeSectors.join(', ')
                              : 'No sectors selected'}
                          </div>
                          <ChevronDown
                            size={16}
                            className={`text-slate-500 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>

                      {/* Accordion Content: Sector Checkboxes & Landmark Sub-Points */}
                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-slate-100 space-y-4">
                          {/* Sector Selection Toolbar */}
                          <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
                            <span className="text-[11px] text-slate-500 font-semibold">
                              Select delivery pockets / sectors for {colony}:
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSelectAllSectorsForColony(colony)}
                                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                              >
                                Select All
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                type="button"
                                onClick={() => handleClearAllSectorsForColony(colony)}
                                className="text-[11px] font-bold text-red-700 hover:text-red-900 cursor-pointer"
                              >
                                Clear
                              </button>
                            </div>
                          </div>

                          {/* Sector Checkbox Grid (Keshavpura Style) */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {availableSectors.map((sector) => {
                              const isChecked = activeSectors.includes(sector);
                              const landmarkCount = getLandmarksForSector(colony, sector).length;
                              return (
                                <button
                                  key={sector}
                                  type="button"
                                  onClick={() => handleToggleSector(colony, sector)}
                                  className={`p-2 rounded-xl text-left border transition flex items-center justify-between text-xs cursor-pointer ${
                                    isChecked
                                      ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold'
                                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  <div className="truncate pr-1">
                                    <span className="block truncate">{sector}</span>
                                    {landmarkCount > 0 && isChecked && (
                                      <span className="text-[9px] font-semibold text-amber-700 block">
                                        {landmarkCount} {landmarkCount === 1 ? 'landmark' : 'landmarks'}
                                      </span>
                                    )}
                                  </div>
                                  {isChecked ? (
                                    <CheckSquare size={14} className="text-blue-700 shrink-0" />
                                  ) : (
                                    <Square size={14} className="text-slate-300 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Add Custom Pocket / Sector Input */}
                          <div className="pt-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={customSectorInput[colony] || ''}
                              onChange={(e) =>
                                setCustomSectorInput((prev) => ({
                                  ...prev,
                                  [colony]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddCustomSector(colony);
                                }
                              }}
                              placeholder={`Add custom pocket/block in ${colony} (e.g. Pocket A, Block C)...`}
                              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddCustomSector(colony)}
                              className="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <Plus size={13} />
                              <span>Add Sector</span>
                            </button>
                          </div>

                          {/* SECTION 2B: Sector-Scoped Landmark & Sub-Point Assignment Layer */}
                          {activeSectors.length > 0 && (
                            <div className="pt-3 border-t border-slate-100 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Landmark size={14} className="text-amber-600" />
                                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                    Sector Landmarks & Delivery Sub-Points
                                  </span>
                                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                                    {totalLandmarks} Bound
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500">
                                  Bind temples, chowks, and complexes per sector
                                </span>
                              </div>

                              {/* Sector Landmark Cards */}
                              <div className="space-y-2.5">
                                {activeSectors.map((sector) => {
                                  const landmarks = getLandmarksForSector(colony, sector);
                                  const isSectorExpanded = Boolean(expandedSectorLandmarks[`${colony}__${sector}`]);
                                  const currentInput = landmarkInputMap[`${colony}__${sector}`] || '';
                                  const currentCat = landmarkCategoryMap[`${colony}__${sector}`] || 'Temple / Religious';
                                  const duplicateInfo = checkDuplicateLandmark(colony, sector, currentInput);

                                  return (
                                    <div
                                      key={sector}
                                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2"
                                    >
                                      <div
                                        onClick={() => toggleSectorLandmarkExpand(colony, sector)}
                                        className="flex items-center justify-between cursor-pointer select-none"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                          <span className="text-xs font-bold text-slate-900">{sector}</span>
                                          <span className="text-[10px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                            {landmarks.length} {landmarks.length === 1 ? 'Landmark' : 'Landmarks'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[11px] text-blue-700 font-bold">
                                          <span>{isSectorExpanded ? 'Collapse' : 'Manage Landmarks'}</span>
                                          <ChevronDown
                                            size={14}
                                            className={`transition-transform ${isSectorExpanded ? 'rotate-180' : ''}`}
                                          />
                                        </div>
                                      </div>

                                      {/* Expanded Landmark Manager for this sector */}
                                      {isSectorExpanded && (
                                        <div className="space-y-2.5 pt-1">
                                          {/* Existing landmarks list */}
                                          <div className="flex flex-wrap gap-1.5 min-h-[28px] items-center">
                                            {landmarks.length === 0 ? (
                                              <span className="text-[11px] text-slate-400 italic">
                                                No landmarks bound to {sector} yet. Add temples, chowks, or markets below.
                                              </span>
                                            ) : (
                                              landmarks.map((lm) => {
                                                const isDupFlag = isExistingLandmarkDuplicated(colony, sector, lm.name);
                                                return (
                                                  <span
                                                    key={lm.id}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border shadow-2xs transition ${
                                                      isDupFlag
                                                        ? 'bg-amber-50 text-amber-950 border-amber-300'
                                                        : 'bg-white text-slate-800 border-slate-200'
                                                    }`}
                                                  >
                                                    <span className="text-[11px]">{getCategoryIcon(lm.category)}</span>
                                                    <span>{lm.name}</span>
                                                    <span className="text-[9px] font-medium text-slate-500 uppercase px-1 py-0.2 bg-slate-100 rounded">
                                                      {lm.category}
                                                    </span>
                                                    {isDupFlag && (
                                                      <span
                                                        className="text-[9px] font-bold text-amber-800 bg-amber-200 px-1 py-0.2 rounded"
                                                        title="Duplicate landmark pin across beat zone"
                                                      >
                                                        Dup Pin
                                                      </span>
                                                    )}
                                                    <button
                                                      type="button"
                                                      onClick={() => handleRemoveLandmarkFromSector(colony, sector, lm.id)}
                                                      title={`Unmap "${lm.name}" from Beat ${beatNo} (Master records safe)`}
                                                      className="text-slate-400 hover:text-red-700 p-0.5 rounded transition cursor-pointer"
                                                    >
                                                      <X size={11} />
                                                    </button>
                                                  </span>
                                                );
                                              })
                                            )}
                                          </div>

                                          {/* Real-time Duplicate Landmark Alert Banner */}
                                          {duplicateInfo.isDuplicate && (
                                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-2 animate-in fade-in">
                                              <AlertTriangle size={15} className="text-amber-700 shrink-0 mt-0.5" />
                                              <div className="space-y-0.5">
                                                <p className="font-bold text-amber-900 text-[11px]">
                                                  Duplicate Landmark Detected
                                                </p>
                                                <p className="text-[10px] text-amber-800 leading-relaxed">
                                                  "{currentInput.trim()}" is already registered under{' '}
                                                  <strong>{duplicateInfo.location}</strong>. Postal beat delivery routing enforces unique landmark sub-points to prevent delivery misroutes.
                                                </p>
                                              </div>
                                            </div>
                                          )}

                                          {/* Add Landmark inline form */}
                                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 bg-white p-2 rounded-xl border border-slate-200">
                                            <input
                                              type="text"
                                              value={currentInput}
                                              onChange={(e) => setLandmarkInput(colony, sector, e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  e.preventDefault();
                                                  handleAddLandmarkToSector(colony, sector);
                                                }
                                              }}
                                              placeholder={`+ Add Landmark to ${sector} (e.g. Sheetla Mata Mandir, CAD Circle)...`}
                                              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            />

                                            <select
                                              value={currentCat}
                                              onChange={(e) =>
                                                setLandmarkCategory(colony, sector, e.target.value as SectorLandmarkCategory)
                                              }
                                              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                                            >
                                              <option value="Temple / Religious">🚩 Temple / Religious</option>
                                              <option value="Chowk / Junction">🚦 Chowk / Junction</option>
                                              <option value="Commercial / Market">🏢 Commercial / Market</option>
                                              <option value="Park / Public Spot">🌳 Park / Public Spot</option>
                                              <option value="School / Hospital">🏥 School / Hospital</option>
                                              <option value="Prominent Resident / Landmark">🏛️ Prominent Landmark</option>
                                            </select>

                                            <button
                                              type="button"
                                              onClick={() => handleAddLandmarkToSector(colony, sector)}
                                              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                                            >
                                              <Plus size={13} />
                                              <span>Bind Landmark</span>
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 3: Dedicated Extra Remarks & Beat Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                <FileText size={15} className="text-amber-600" />
                <span>3. Extra Remarks & Beat Notes</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Stored in Beat Operational Routing
              </span>
            </div>

            <textarea
              rows={3}
              value={beatNotes}
              onChange={(e) => setBeatNotes(e.target.value)}
              placeholder="Enter operational landmark details, high-density delivery points, key society watchmen, morning delivery priority, commercial hubs, road construction detour notices..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-700"
            />

            {/* Quick helper tag suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="text-slate-400 font-bold">Quick suggestions:</span>
              {[
                'High Delivery Density Area',
                'Near CAD Circle & Coaching Belt',
                'Morning Priority Delivery Required',
                'Apartment Intercom Access Available',
                'Two-Wheeler Easy Access',
              ].map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() =>
                    setBeatNotes((prev) =>
                      prev ? `${prev.trim()} • ${pill}` : pill
                    )
                  }
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                >
                  + {pill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-900">{selectedColonies.length}</span> colonies &{' '}
            <span className="font-bold text-slate-900">
              {Object.values(coloniesWithSectors).reduce(
                (acc: number, curr: string[]) => acc + (curr ? curr.length : 0),
                0
              )}
            </span>{' '}
            sectors mapped.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={14} />
              <span>Save Beat & Sector Mapping</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
