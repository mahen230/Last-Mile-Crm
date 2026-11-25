import React, { useState, useEffect, useMemo } from 'react';
import {
  Map as MapIcon,
  Users,
  MessageSquare,
  Send,
  Radio,
  X,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  Lock,
  Building2,
  Search,
  MapPin,
  ShieldCheck,
  Layers,
  Navigation,
  ChevronRight,
  ChevronDown,
  Info,
  Filter,
  RefreshCw,
  Eye,
  Phone,
  GitBranch,
  Plus,
  UserCheck,
  Route,
} from 'lucide-react';
import {
  BeatRecord,
  Customer,
  DynamicOfficeRecord,
  OfficeJurisdiction,
  StaffProfile,
} from '../../types/models';
import { customerService } from '../../services/customerService';
import {
  staffPermissionService,
  resolveOfficeMetadata,
  ManagedBeatOverrideRecord,
} from '../../services/staffPermissionService';
import { brandOwnerService } from '../../services/brandOwnerService';
import { useAuth } from '../auth/FirebaseAuthProvider';
import DirectMessageModal from './DirectMessageModal';
import { RAJASTHAN_CIRCLE_OFFICE_MASTER_LIST } from '../../data/officesData';
import { CONSOLIDATED_BEAT_MATRIX } from '../../data/consolidatedBeatMatrix';
import { COLONY_HIERARCHY_MAP } from '../../data/colonyHierarchyData';
import BeatMultiColonySectorModal from './BeatMultiColonySectorModal';
import { masterDataService } from '../../services/masterDataService';

export interface BeatCardItem extends BeatRecord {
  compositeKey?: string;
  parentOffice: string;
  linkedDeliveryOffices: string[];
  totalCustomers: number;
  confirmedCoverage: string;
  coverageValue: number;
  assignedStaffCount: number;
  district?: string;
  subDivision?: string;
}

export interface OfficeHubOption extends Omit<OfficeJurisdiction, 'officeName'> {
  postOfficeName: string;
  parentOfficeName: string;
  linkedDeliveryOffices: string[];
  completeAddress: string;
  district?: string;
  subDivision?: string;
}

interface TreeOfficeNode {
  officeId: string;
  postOfficeName: string;
  officeType: 'HO' | 'SO' | 'BO';
  pincode: string;
  division: string;
  subDivision: string;
  parentOffice: string;
  beats: BeatCardItem[];
  childBos: TreeOfficeNode[];
}

interface TreeDivisionNode {
  division: string;
  headOffices: TreeOfficeNode[];
  standaloneOffices: TreeOfficeNode[];
  totalBeats: number;
}

const EMPTY_SECTORS_FALLBACK: Record<string, string[]> = {};

function normalizeBeatToken(raw: string): string {
  return (raw || '').replace(/^Beat\s+/i, '').trim();
}

function makeBeatCompositeKey(officeId: string, beatNo: string): string {
  return `${(officeId || 'DADABARI_SO').trim().toUpperCase()}::${normalizeBeatToken(beatNo).toUpperCase()}`;
}

export default function BeatManagementView({
  onFilterBeat,
  indiaPostOwnerAccess = false,
}: {
  onFilterBeat?: (beatNo: string) => void;
  indiaPostOwnerAccess?: boolean;
}) {
  const { userProfile } = useAuth();
  const isActualSuperAdmin =
    staffPermissionService.isSuperAdmin(userProfile) || Boolean(indiaPostOwnerAccess);

  const actorName = userProfile?.name || 'India Post Division Admin';

  // Optional Role Simulation for Super Admin to verify Non-Admin / Postmaster Scoped View
  const [simulateNonAdminOfficeId, setSimulateNonAdminOfficeId] = useState<string | null>(null);
  const isSuperAdmin = isActualSuperAdmin && !simulateNonAdminOfficeId;

  const canDispatch =
    Boolean(indiaPostOwnerAccess) ||
    staffPermissionService.canAccessServiceModule(
      userProfile,
      'contentSharingDispatchSection'
    );

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dynamicBeats, setDynamicBeats] = useState<any[]>([]);
  const [dynamicOffices, setDynamicOffices] = useState<DynamicOfficeRecord[]>([]);
  const [allStaffProfiles, setAllStaffProfiles] = useState<StaffProfile[]>([]);
  const [managedBeatOverrides, setManagedBeatOverrides] = useState<ManagedBeatOverrideRecord[]>([]);

  // 1. Rajasthan Circle Interactive Hierarchy & PIN Filters
  const [selectedCircleFilter, setSelectedCircleFilter] = useState<string>('Rajasthan Circle');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>('ALL');
  const [selectedPincodeFilter, setSelectedPincodeFilter] = useState<string>('ALL');
  const [selectedOfficeFilter, setSelectedOfficeFilter] = useState<string>('ALL');
  const [selectedBeatFilter, setSelectedBeatFilter] = useState<string>('ALL');

  // 2. Quick Search & Display Controls
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [beatStatusFilter, setBeatStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'TREE' | 'CARDS'>('TREE');
  const [groupByOffice, setGroupByOffice] = useState<boolean>(true);
  const [beatPage, setBeatPage] = useState<number>(1);
  const [beatModalPage, setBeatModalPage] = useState<number>(1);
  const [expandedOffices, setExpandedOffices] = useState<Record<string, boolean>>({
    KOTA_HO: true,
    DADABARI_SO: true,
    ENG_COLLEGE_SO: true,
    VIGYAN_NAGAR_SO: true,
    TALWANDI_SO: true,
    KOTA_JN_SO: true,
    KAITHUN_SO: true,
    SULTANPUR_SO: true,
  });
  const BEATS_PER_PAGE = 8;
  const MODAL_CUSTOMERS_PER_PAGE = 6;

  // 3. Modals & Drawers
  const [showOfficeMappingDrawer, setShowOfficeMappingDrawer] = useState<boolean>(false);
  const [selectedBeatForModal, setSelectedBeatForModal] = useState<BeatCardItem | null>(null);
  const [beatModalSearch, setBeatModalSearch] = useState<string>('');
  const [activeMessageCustomer, setActiveMessageCustomer] = useState<Customer | null>(null);
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);

  // 4. Add/Edit Beat Under PIN Modal
  const [showManageBeatModal, setShowManageBeatModal] = useState<boolean>(false);
  const [mbPincode, setMbPincode] = useState<string>('324009');
  const [mbOfficeId, setMbOfficeId] = useState<string>('DADABARI_SO');
  const [mbBeatNo, setMbBeatNo] = useState<string>('');
  const [mbBeatTitle, setMbBeatTitle] = useState<string>('');
  const [mbFixedKm, setMbFixedKm] = useState<string>('18');
  const [mbColoniesText, setMbColoniesText] = useState<string>('');
  const [mbStaffId, setMbStaffId] = useState<string>('');

  // 5. Inline / Modal Staff Reassignment for Any Beat
  const [reassignTargetBeat, setReassignTargetBeat] = useState<BeatCardItem | null>(null);
  const [reassignStaffSearch, setReassignStaffSearch] = useState<string>('');
  const [reassignSelectedStaffId, setReassignSelectedStaffId] = useState<string>('');

  // 6. Beat Broadcast Modal
  const [broadcastBeat, setBroadcastBeat] = useState<BeatCardItem | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);
  const [copiedBatch, setCopiedBatch] = useState<boolean>(false);

  // 7. Multi-Colony & Sector Mapping Modal State
  const [sectorModalBeat, setSectorModalBeat] = useState<BeatCardItem | null>(null);
  const [beatNotesMap, setBeatNotesMap] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('postman_crm_beat_notes_v1');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [coloniesWithSectorsMap, setColoniesWithSectorsMap] = useState<Record<string, Record<string, string[]>>>(() => {
    try {
      const stored = localStorage.getItem('postman_crm_beat_sectors_v1');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showToastNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4800);
  };

  const refreshData = () => {
    setCustomers([...customerService.getScopedCustomers(userProfile)]);
    setDynamicBeats([...staffPermissionService.getDynamicBeatsSummary()]);
    setDynamicOffices([...staffPermissionService.getDynamicOffices()]);
    setAllStaffProfiles([...staffPermissionService.getAllStaffProfiles()]);
    setManagedBeatOverrides([...staffPermissionService.getManagedBeatOverrides()]);
  };

  useEffect(() => {
    refreshData();
    const unsubCust = customerService.subscribe(refreshData);
    const unsubStaff = staffPermissionService.subscribe(refreshData);
    const unsubMaster = masterDataService.subscribe(refreshData);
    const unsubBrand = brandOwnerService.subscribe(refreshData);
    return () => {
      unsubCust();
      unsubStaff();
      unsubMaster();
      unsubBrand();
    };
  }, [userProfile]);

  useEffect(() => {
    setBeatPage(1);
  }, [
    selectedCircleFilter,
    selectedDivisionFilter,
    selectedPincodeFilter,
    selectedOfficeFilter,
    selectedBeatFilter,
    beatStatusFilter,
    searchQuery,
  ]);

  useEffect(() => {
    setBeatModalPage(1);
  }, [selectedBeatForModal, beatModalSearch]);

  // Determine the Non-Admin Staff / Postmaster's locked officeId & postOfficeName
  const nonAdminAssignedOffice = useMemo(() => {
    if (simulateNonAdminOfficeId) {
      return resolveOfficeMetadata(simulateNonAdminOfficeId);
    }
    if (!userProfile) {
      return resolveOfficeMetadata('Dadabari S.O.', '', '324009');
    }
    return resolveOfficeMetadata(
      userProfile.postOfficeName ||
        userProfile.branchOffice ||
        userProfile.subOffice ||
        userProfile.assignedOffice,
      userProfile.branchOffice,
      userProfile.officePincode
    );
  }, [userProfile, simulateNonAdminOfficeId]);

  // Build canonical list of Post Offices / Delivery Hubs across Rajasthan Circle (zero duplication)
  const officeHubOptions = useMemo<OfficeHubOption[]>(() => {
    const map = new Map<string, OfficeHubOption>();
    RAJASTHAN_CIRCLE_OFFICE_MASTER_LIST.forEach((po) => {
      map.set(po.officeId, {
        officeId: po.officeId,
        postOfficeName: po.name,
        officeType: po.type,
        pincode: po.pin,
        parentOfficeName: po.parentOffice,
        linkedDeliveryOffices:
          po.type === 'HO'
            ? [
                'Dadabari S.O.',
                'Engineering College S.O.',
                'Vigyan Nagar S.O.',
                'Talwandi S.O.',
                'Kota Jn S.O.',
                'Kaithun S.O.',
                'Sultanpur S.O.',
              ]
            : [po.parentOffice],
        completeAddress: po.address,
        circle: po.circle,
        division: po.division,
        district: po.district,
        subDivision: po.subDivision,
      });
    });

    dynamicOffices.forEach((o) => {
      const meta = resolveOfficeMetadata(o.officeName, o.branchOffice, o.pincode);
      if (!map.has(meta.officeId)) {
        map.set(meta.officeId, {
          officeId: meta.officeId,
          postOfficeName: o.postOfficeName || meta.postOfficeName,
          officeType: meta.officeType,
          pincode: o.pincode || meta.pincode,
          parentOfficeName: meta.parentOfficeName,
          linkedDeliveryOffices: o.linkedDeliveryOffices || meta.linkedDeliveryOffices,
          completeAddress: o.completeAddress,
          circle: o.circle || meta.circle,
          division: o.division || meta.division,
          district: o.district || meta.district,
          subDivision: o.subDivision || meta.subDivision,
        });
      }
    });

    return Array.from(map.values());
  }, [dynamicOffices]);

  // Operational staff pool for lookup & reassignment (excluding Owner/Master Admin/Developer & XPOKART)
  const assignableStaffPool = useMemo(() => {
    return allStaffProfiles
      .filter((s) => {
        const r = String(s.role || '').toUpperCase();
        if (['OWNER', 'MASTER_ADMIN', 'DEVELOPER', 'SUPER_ADMIN'].includes(r)) return false;
        if (s.staffScopeType === 'XPOKART_PLATFORM') return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allStaffProfiles]);

  // Safe Colony Unmapping Handler (Protected Master Register Rule: NEVER DELETE RECORD)
  const handleUnmapColonyFromBeat = (beat: BeatCardItem, colonyName: string) => {
    const beatKey = beat.beatNo.startsWith('Beat') ? beat.beatNo : `Beat ${beat.beatNo}`;

    try {
      const allMaster = masterDataService.getColonyMasterRecords();
      const matched = allMaster.find(
        (c) =>
          c.colonyName.trim().toLowerCase() === colonyName.trim().toLowerCase() &&
          c.pincode.trim() === beat.pincode.trim()
      );
      if (matched) {
        masterDataService.updateColonyMasterRecord(matched.id, {
          assignedBeat: 'PENDING_ASSIGNMENT',
        });
      }
    } catch (e) {
      console.warn('Error updating master record assignedBeat:', e);
    }

    const updatedSectors = { ...coloniesWithSectorsMap };
    if (updatedSectors[beatKey]) {
      const copy = { ...updatedSectors[beatKey] };
      delete copy[colonyName];
      updatedSectors[beatKey] = copy;
    }
    if (updatedSectors[beat.beatNo]) {
      const copy = { ...updatedSectors[beat.beatNo] };
      delete copy[colonyName];
      updatedSectors[beat.beatNo] = copy;
    }
    setColoniesWithSectorsMap(updatedSectors);
    try {
      localStorage.setItem('postman_crm_beat_sectors_v1', JSON.stringify(updatedSectors));
    } catch {}

    try {
      staffPermissionService.unmapColonyFromBeat(colonyName, beatKey);
      const matchedProfile = allStaffProfiles.find(
        (s) =>
          s.beat.toLowerCase() === beatKey.toLowerCase() &&
          (s.officePincode || '').trim() === beat.pincode.trim()
      );
      if (matchedProfile && matchedProfile.assignedColonies) {
        staffPermissionService.saveStaffProfile({
          ...matchedProfile,
          assignedColonies: matchedProfile.assignedColonies.filter(
            (c) => c.trim().toLowerCase() !== colonyName.trim().toLowerCase()
          ),
        });
      }
    } catch (e) {
      console.warn('Error unmapping from staffPermissionService:', e);
    }

    showToastNotice(
      `Colony "${colonyName}" unmapped from ${beatKey} (${beat.postOfficeName}). Record safely retained in Colony Master Register.`
    );
    refreshData();
  };

  // Canonical Zero-Duplication Beat Directory Builder (Composite Key: officeId::beatNo)
  const allBeats = useMemo<BeatCardItem[]>(() => {
    const isColonyAllowedForPincode = (colonyName: string, targetPin?: string): boolean => {
      const cleanPin = (targetPin || '').trim();
      if (!cleanPin) return true;
      const normName = colonyName.trim().toLowerCase();
      try {
        const allMaster = masterDataService.getColonyMasterRecords();
        const matches = allMaster.filter((r) => r.colonyName.trim().toLowerCase() === normName);
        if (matches.length > 0) {
          return matches.some((r) => r.pincode.trim() === cleanPin);
        }
      } catch {}
      const hierarchyMatch = Object.entries(COLONY_HIERARCHY_MAP).find(
        ([k]) => k.trim().toLowerCase() === normName
      );
      if (hierarchyMatch) {
        return hierarchyMatch[1].defaultPincode.trim() === cleanPin;
      }
      return true;
    };

    const getBoundColoniesForBeat = (
      beatNoStr: string,
      officePincode?: string,
      _officeName?: string,
      seedColonies: string[] = []
    ): string[] => {
      const cleanNo = normalizeBeatToken(beatNoStr);
      const rawKey = cleanNo.toLowerCase();
      const cleanOfficePin = (officePincode || '').trim();
      const mappedColonies = new Set<string>(seedColonies.map((c) => c.trim()).filter(Boolean));

      const fromSectorsMap =
        coloniesWithSectorsMap[`Beat ${cleanNo}`] ||
        coloniesWithSectorsMap[cleanNo] ||
        coloniesWithSectorsMap[beatNoStr];
      if (fromSectorsMap) {
        Object.keys(fromSectorsMap).forEach((col) => {
          if (col && col.trim() && isColonyAllowedForPincode(col, cleanOfficePin)) {
            mappedColonies.add(col.trim());
          }
        });
      }

      try {
        const allColonies = masterDataService.getColonyMasterRecords();
        allColonies.forEach((col) => {
          if (col.assignedBeat && col.assignedBeat !== 'PENDING_ASSIGNMENT') {
            const assignedClean = normalizeBeatToken(col.assignedBeat).toLowerCase();
            if (
              assignedClean === rawKey ||
              assignedClean === beatNoStr.toLowerCase() ||
              col.assignedBeat.toLowerCase() === `beat ${rawKey}`
            ) {
              if (!cleanOfficePin || col.pincode.trim() === cleanOfficePin) {
                mappedColonies.add(col.colonyName.trim());
              }
            }
          }
        });
      } catch {}

      try {
        const beatMappings = staffPermissionService.getColonyBeatMappings();
        beatMappings.forEach((m) => {
          if (m.beatNumber) {
            const mappedClean = normalizeBeatToken(m.beatNumber).toLowerCase();
            if (
              mappedClean === rawKey ||
              mappedClean === beatNoStr.toLowerCase() ||
              m.beatNumber.toLowerCase() === `beat ${rawKey}`
            ) {
              const mappingPin = (m.pincode || m.areaPincode || '').trim();
              const cleanOfficeName = (_officeName || '').trim().toLowerCase();
              const mappingOffice = (m.subOrHoOffice || '').trim().toLowerCase();
              const pinMatch =
                !cleanOfficePin ||
                (mappingPin
                  ? mappingPin === cleanOfficePin
                  : !mappingOffice ||
                    !cleanOfficeName ||
                    mappingOffice.includes(cleanOfficeName) ||
                    cleanOfficeName.includes(mappingOffice));
              if (pinMatch && isColonyAllowedForPincode(m.colonyName, cleanOfficePin)) {
                mappedColonies.add(m.colonyName.trim());
              }
            }
          }
        });
      } catch {}

      return Array.from(mappedColonies);
    };

    const resolveStaffForBeat = (
      officeId: string,
      officeName: string,
      pincode: string,
      beatNo: string,
      preferredStaffId?: string,
      fallbackName?: string,
      fallbackContact?: string
    ): { name: string; employeeId: string; contact: string } => {
      const cleanBeat = normalizeBeatToken(beatNo).toLowerCase();
      const beatLabel = `beat ${cleanBeat}`;
      const cleanPin = (pincode || '').trim();
      const cleanOfficeName = (officeName || '').trim().toLowerCase();

      // 1. Direct office + beat match in live Master Staff
      const directOfficeBeatMatch = assignableStaffPool.find((sp) => {
        const spBeats = [sp.beat, ...(sp.assignedBeats || [])]
          .filter(Boolean)
          .map((b) => normalizeBeatToken(b).toLowerCase());
        const matchesBeat =
          spBeats.includes(cleanBeat) || spBeats.includes(beatLabel.replace(/^beat\s+/, ''));
        if (!matchesBeat) return false;
        const spPin = (sp.officePincode || '').trim();
        const spOff = (sp.subOffice || sp.branchOffice || sp.assignedOffice || '').toLowerCase();
        const spMeta = resolveOfficeMetadata(
          sp.postOfficeName || sp.branchOffice || sp.subOffice || sp.assignedOffice,
          sp.branchOffice,
          sp.officePincode
        );
        return (
          spMeta.officeId === officeId ||
          (cleanPin && spPin === cleanPin && (spOff.includes(cleanOfficeName) || cleanOfficeName.includes(spOff)))
        );
      });

      if (directOfficeBeatMatch) {
        return {
          name: directOfficeBeatMatch.name,
          employeeId:
            directOfficeBeatMatch.employeeId ||
            directOfficeBeatMatch.id.replace(/^STAFF-/, ''),
          contact: directOfficeBeatMatch.contact || fallbackContact || '9414000000',
        };
      }

      // 2. Match by preferred staffId or contact across Master Staff (e.g. STAFF-ENG-01 == Vikram Singh Hada)
      if (preferredStaffId) {
        const cleanPref = preferredStaffId.trim().toLowerCase();
        const byId = assignableStaffPool.find(
          (sp) =>
            sp.id.toLowerCase() === cleanPref ||
            (sp.employeeId || '').toLowerCase() === cleanPref ||
            (fallbackContact && sp.contact === fallbackContact)
        );
        if (byId) {
          return {
            name: byId.name,
            employeeId: byId.employeeId || byId.id.replace(/^STAFF-/, ''),
            contact: byId.contact || fallbackContact || '9414000000',
          };
        }
      }

      // 3. Branch Office / single-office match by officeName
      const byOffice = assignableStaffPool.find((sp) => {
        const bo = (sp.branchOffice || sp.subOffice || sp.assignedOffice || '').toLowerCase();
        return bo && (bo === cleanOfficeName || bo.includes(cleanOfficeName.replace(/\s+(b\.o\.|s\.o\.)$/, '')));
      });
      if (byOffice && !fallbackName) {
        return {
          name: byOffice.name,
          employeeId: byOffice.employeeId || byOffice.id.replace(/^STAFF-/, ''),
          contact: byOffice.contact || '9414000000',
        };
      }

      return {
        name: fallbackName || 'Relief / Office Charge',
        employeeId: preferredStaffId?.replace(/^STAFF-/, '') || 'CSI-STAFF',
        contact: fallbackContact || '9414000000',
      };
    };

    const countCustomersForBeat = (beatNo: string, pincode: string, officeName: string): number => {
      const cleanNo = normalizeBeatToken(beatNo).toLowerCase();
      return (
        customers?.filter((c) => {
          const cBeat = normalizeBeatToken(c.beatNo || '').toLowerCase();
          if (cBeat && cBeat === cleanNo) {
            if (!c.pincode || c.pincode === pincode) return true;
          }
          if (
            officeName.includes('Dadabari') &&
            cleanNo === '2' &&
            !c.beatNo &&
            (!c.pincode || c.pincode === '324009')
          ) {
            return true;
          }
          return false;
        }).length || 0
      );
    };

    const beatMap = new Map<string, BeatCardItem>();

    // LAYER 1: All 46 Consolidated Beat Matrix beats (Dadabari 1-33, Engg College EC-1..4, Vigyan Nagar VN-1..7, Kota HO HO-1..2)
    CONSOLIDATED_BEAT_MATRIX.forEach((entry) => {
      const meta = resolveOfficeMetadata(entry.deliveryOffice || entry.officeName, '', entry.pincode);
      const rawNo = normalizeBeatToken(entry.beatNumber);
      const compKey = makeBeatCompositeKey(meta.officeId, rawNo);
      const staff = resolveStaffForBeat(
        meta.officeId,
        meta.postOfficeName,
        entry.pincode,
        rawNo,
        entry.staffId,
        entry.assignedPostmanName,
        entry.assignedPostmanContact
      );
      const boundColonies = getBoundColoniesForBeat(
        rawNo,
        entry.pincode,
        meta.postOfficeName,
        entry.colonies
      );

      beatMap.set(compKey, {
        id: entry.id,
        compositeKey: compKey,
        beatNo: rawNo,
        name: `${entry.beatNumber} — ${entry.colonies[0] || meta.postOfficeName}`,
        officeId: meta.officeId,
        postOfficeName: meta.postOfficeName,
        officeType: meta.officeType,
        pincode: entry.pincode,
        circle: meta.circle || 'Rajasthan Circle',
        division: entry.division || meta.division || 'Kota Division',
        district: meta.district || 'Kota',
        subDivision: entry.subDivision || meta.subDivision,
        parentOffice: entry.headOffice ? `${entry.headOffice} (324001)` : meta.parentOfficeName,
        linkedDeliveryOffices: meta.linkedDeliveryOffices,
        assignedPostman: staff.name,
        employeeId: staff.employeeId,
        contact: staff.contact,
        fixedKm: 18,
        areasCovered: boundColonies,
        totalCustomers: countCustomersForBeat(rawNo, entry.pincode, meta.postOfficeName),
        confirmedCoverage: '98.5%',
        coverageValue: 98.5,
        status:
          entry.deliveryStatus === 'Active' ? 'Active Daily Delivery' : entry.deliveryStatus,
        assignedStaffCount: 1,
      });
    });

    // LAYER 2: Talwandi S.O. (324005) Beats ('14' & 'PIP-1') keyed cleanly under TALWANDI_SO
    const talwandiSeeds = [
      {
        id: 'BEAT-TAL-14',
        beatNo: '14',
        title: 'Beat 14 — Talwandi S.O. & Sectors A–C',
        staffId: 'STAFF-CSI-10449214',
        fallbackName: 'Rajesh Kumar Nagar',
        fallbackContact: '9414288110',
        colonies: [
          'Talwandi Sector A',
          'Talwandi Sector B',
          'Talwandi Sector C',
          'Commerce College Road',
          'Jawahar Nagar Main Circle',
        ],
        fixedKm: 19,
      },
      {
        id: 'BEAT-TAL-PIP1',
        beatNo: 'PIP-1',
        title: 'PIP-1 — Kota South Inspection Sub-Division',
        staffId: 'STAFF-CSI-10449215',
        fallbackName: 'Hemant Singh Chouhan',
        fallbackContact: '9829044112',
        colonies: ['Talwandi S.O. Supervisory Beat', 'Indraprastha Ind. Area'],
        fixedKm: 24,
      },
    ];
    talwandiSeeds.forEach((seed) => {
      const compKey = makeBeatCompositeKey('TALWANDI_SO', seed.beatNo);
      const staff = resolveStaffForBeat(
        'TALWANDI_SO',
        'Talwandi S.O.',
        '324005',
        seed.beatNo,
        seed.staffId,
        seed.fallbackName,
        seed.fallbackContact
      );
      beatMap.set(compKey, {
        id: seed.id,
        compositeKey: compKey,
        beatNo: seed.beatNo,
        name: seed.title,
        officeId: 'TALWANDI_SO',
        postOfficeName: 'Talwandi S.O.',
        officeType: 'SO',
        pincode: '324005',
        circle: 'Rajasthan Circle',
        division: 'Kota Division',
        district: 'Kota',
        subDivision: 'Kota West Sub-Division',
        parentOffice: 'Kota H.O. (324001)',
        linkedDeliveryOffices: ['Dadabari S.O.', 'Engineering College S.O.'],
        assignedPostman: staff.name,
        employeeId: staff.employeeId,
        contact: staff.contact,
        fixedKm: seed.fixedKm,
        areasCovered: getBoundColoniesForBeat(
          seed.beatNo,
          '324005',
          'Talwandi S.O.',
          seed.colonies
        ),
        totalCustomers: countCustomersForBeat(seed.beatNo, '324005', 'Talwandi S.O.'),
        confirmedCoverage: '99.1%',
        coverageValue: 99.1,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      });
    });

    // LAYER 3: All remaining Rajasthan Circle Offices (Kota Division SOs + 14 BOs + Baran/Jhalawar/Bundi/Tonk)
    RAJASTHAN_CIRCLE_OFFICE_MASTER_LIST.forEach((po) => {
      // Skip Dadabari / Eng College / Vigyan / Kota HO / Talwandi generic defaultBeats (handled by Layers 1 & 2)
      if (['DADABARI_SO', 'ENG_COLLEGE_SO', 'VIGYAN_NAGAR_SO', 'KOTA_HO', 'TALWANDI_SO'].includes(po.officeId)) {
        return;
      }

      // Deduplicate BO beats: if a BO has a named beat like 'Borabas Beat 1', skip redundant bare 'Beat 1' / 'Beat 2'
      const namedBeats = po.defaultBeats.filter((b) => !/^Beat\s*\d+$/i.test(b.trim()));
      const selectedBeats =
        po.type === 'BO' && namedBeats.length > 0 ? namedBeats : po.defaultBeats;

      selectedBeats.forEach((rawBeatStr, bIdx) => {
        const cleanNo = normalizeBeatToken(rawBeatStr);
        const compKey = makeBeatCompositeKey(po.officeId, cleanNo);
        if (beatMap.has(compKey)) return;

        const staff = resolveStaffForBeat(
          po.officeId,
          po.name,
          po.pin,
          cleanNo
        );
        const colonies = getBoundColoniesForBeat(
          cleanNo,
          po.pin,
          po.name,
          bIdx === 0 ? po.defaultColonies : po.defaultColonies.slice(0, 2)
        );

        beatMap.set(compKey, {
          id: `BEAT-${po.officeId}-${cleanNo.replace(/[^a-z0-9]/gi, '').toUpperCase()}`,
          compositeKey: compKey,
          beatNo: cleanNo,
          name: rawBeatStr.includes('Beat') ? `${rawBeatStr} — ${po.name}` : `Beat ${cleanNo} — ${po.name}`,
          officeId: po.officeId,
          postOfficeName: po.name,
          officeType: po.type,
          pincode: po.pin,
          circle: po.circle || 'Rajasthan Circle',
          division: po.division,
          district: po.district,
          subDivision: po.subDivision,
          parentOffice: po.parentOffice,
          linkedDeliveryOffices: [po.parentOffice],
          assignedPostman: staff.name,
          employeeId: staff.employeeId,
          contact: staff.contact,
          fixedKm: po.type === 'BO' ? 22 : 18,
          areasCovered: colonies,
          totalCustomers: countCustomersForBeat(cleanNo, po.pin, po.name),
          confirmedCoverage: po.type === 'BO' ? '96.2%' : '97.8%',
          coverageValue: po.type === 'BO' ? 96.2 : 97.8,
          status: 'Active Daily Delivery',
          assignedStaffCount: 1,
        });
      });
    });

    // LAYER 4: Dynamic Staff-Created Beats (strictly composite-keyed so different offices never collide)
    dynamicBeats.forEach((db) => {
      const cleanNo = normalizeBeatToken(db.beatNumber || '');
      if (!cleanNo) return;
      const meta = resolveOfficeMetadata(db.officeName, '', db.pincode);
      const compKey = makeBeatCompositeKey(db.officeId || meta.officeId, cleanNo);
      const existing = beatMap.get(compKey);
      if (existing) {
        const extraCols = getBoundColoniesForBeat(cleanNo, existing.pincode, existing.postOfficeName);
        extraCols.forEach((c) => {
          if (!existing.areasCovered.includes(c)) existing.areasCovered.push(c);
        });
        if (db.assignedStaff?.[0]) {
          existing.assignedPostman = db.assignedStaff[0].name || existing.assignedPostman;
          existing.employeeId = db.assignedStaff[0].employeeId || existing.employeeId;
          existing.contact = db.assignedStaff[0].contact || existing.contact;
        }
      } else {
        beatMap.set(compKey, {
          id: `BEAT-DYN-${meta.officeId}-${cleanNo}`,
          compositeKey: compKey,
          beatNo: cleanNo,
          name: `${db.beatNumber} — ${meta.postOfficeName}`,
          officeId: db.officeId || meta.officeId,
          postOfficeName: meta.postOfficeName,
          officeType: meta.officeType,
          pincode: db.pincode || meta.pincode,
          division: meta.division || 'Kota Division',
          circle: meta.circle || 'Rajasthan Circle',
          district: meta.district,
          subDivision: meta.subDivision,
          parentOffice: meta.parentOfficeName,
          linkedDeliveryOffices: meta.linkedDeliveryOffices,
          assignedPostman: db.assignedStaff?.[0]?.name || 'Assigned Staff',
          employeeId: db.assignedStaff?.[0]?.employeeId || 'CSI-STAFF',
          contact: db.assignedStaff?.[0]?.contact || '9414000000',
          fixedKm: db.assignedStaff?.[0]?.fixedKm || 18,
          areasCovered: getBoundColoniesForBeat(cleanNo, db.pincode || meta.pincode, meta.postOfficeName),
          totalCustomers: countCustomersForBeat(cleanNo, db.pincode || meta.pincode, meta.postOfficeName),
          confirmedCoverage: '96.5%',
          coverageValue: 96.5,
          status: 'Active Daily Delivery',
          assignedStaffCount: Math.max(db.assignedStaff?.length || 1, 1),
        });
      }
    });

    // LAYER 5: Explicit Managed Beat Overrides (from Pincode-Wise Beat Manager & Postman Reassignment)
    managedBeatOverrides.forEach((ov) => {
      const compKey = makeBeatCompositeKey(ov.officeId, ov.beatNo);
      const existing = beatMap.get(compKey);
      const mergedCols = getBoundColoniesForBeat(
        ov.beatNo,
        ov.pincode,
        ov.postOfficeName,
        ov.colonies
      );
      if (existing) {
        beatMap.set(compKey, {
          ...existing,
          name: ov.beatTitle || existing.name,
          fixedKm: ov.fixedKm || existing.fixedKm,
          assignedPostman: ov.assignedPostman || existing.assignedPostman,
          employeeId: ov.employeeId || existing.employeeId,
          contact: ov.contact || existing.contact,
          areasCovered: mergedCols.length > 0 ? mergedCols : existing.areasCovered,
        });
      } else {
        beatMap.set(compKey, {
          id: ov.id,
          compositeKey: compKey,
          beatNo: ov.beatNo,
          name: ov.beatTitle,
          officeId: ov.officeId,
          postOfficeName: ov.postOfficeName,
          officeType: ov.officeType,
          pincode: ov.pincode,
          circle: ov.circle || 'Rajasthan Circle',
          division: ov.division || 'Kota Division',
          parentOffice: ov.parentOffice,
          linkedDeliveryOffices: [ov.parentOffice],
          assignedPostman: ov.assignedPostman,
          employeeId: ov.employeeId,
          contact: ov.contact,
          fixedKm: ov.fixedKm || 18,
          areasCovered: mergedCols,
          totalCustomers: countCustomersForBeat(ov.beatNo, ov.pincode, ov.postOfficeName),
          confirmedCoverage: '98.0%',
          coverageValue: 98.0,
          status: 'Active Daily Delivery',
          assignedStaffCount: 1,
        });
      }
    });

    return Array.from(beatMap.values());
  }, [customers, dynamicBeats, coloniesWithSectorsMap, assignableStaffPool, managedBeatOverrides]);

  // Distinct PINs computed dynamically from allBeats + officeHubOptions for Pincode-Wise Management
  const pincodeOptions = useMemo(() => {
    const counts = new Map<string, { pincode: string; beatCount: number; offices: Set<string> }>();
    allBeats.forEach((b) => {
      const pin = (b.pincode || '').trim();
      if (!pin) return;
      const cur = counts.get(pin) || { pincode: pin, beatCount: 0, offices: new Set<string>() };
      cur.beatCount += 1;
      cur.offices.add(b.postOfficeName);
      counts.set(pin, cur);
    });
    officeHubOptions.forEach((h) => {
      const pin = (h.pincode || '').trim();
      if (!pin) return;
      const cur = counts.get(pin) || { pincode: pin, beatCount: 0, offices: new Set<string>() };
      cur.offices.add(h.postOfficeName);
      counts.set(pin, cur);
    });
    return Array.from(counts.values()).sort((a, b) => a.pincode.localeCompare(b.pincode));
  }, [allBeats, officeHubOptions]);

  // Effective Office Filter
  const effectiveOfficeFilter = isSuperAdmin
    ? selectedOfficeFilter
    : nonAdminAssignedOffice.officeId;

  // Available offices based on selected division & pincode filter
  const availableOfficesForDivision = useMemo(() => {
    return officeHubOptions.filter((h) => {
      if (selectedDivisionFilter !== 'ALL' && h.division !== selectedDivisionFilter) return false;
      if (selectedPincodeFilter !== 'ALL' && h.pincode !== selectedPincodeFilter) return false;
      return true;
    });
  }, [officeHubOptions, selectedDivisionFilter, selectedPincodeFilter]);

  // Available beats based on division, pincode & office selection
  const availableBeatsForSelection = useMemo(() => {
    return allBeats.filter((b) => {
      if (selectedDivisionFilter !== 'ALL' && b.division !== selectedDivisionFilter) return false;
      if (selectedPincodeFilter !== 'ALL' && b.pincode !== selectedPincodeFilter) return false;
      if (effectiveOfficeFilter !== 'ALL' && b.officeId !== effectiveOfficeFilter) return false;
      return true;
    });
  }, [allBeats, selectedDivisionFilter, selectedPincodeFilter, effectiveOfficeFilter]);

  // Role-Based, Pincode-Wise & Office-Based Filtered Beats
  const filteredBeats = useMemo<BeatCardItem[]>(() => {
    return allBeats.filter((beat) => {
      if (selectedCircleFilter !== 'ALL' && beat.circle && beat.circle !== selectedCircleFilter) {
        return false;
      }

      if (selectedDivisionFilter !== 'ALL') {
        const beatMeta = resolveOfficeMetadata(beat.postOfficeName, '', beat.pincode);
        const beatDivision = beat.division || beatMeta.division;
        if (beatDivision !== selectedDivisionFilter) return false;
      }

      if (selectedPincodeFilter !== 'ALL' && beat.pincode.trim() !== selectedPincodeFilter) {
        return false;
      }

      if (effectiveOfficeFilter !== 'ALL') {
        const matchesDirectOffice = beat.officeId === effectiveOfficeFilter;

        if (!isSuperAdmin && userProfile && !simulateNonAdminOfficeId) {
          const allowedOffices = userProfile.permissions?.allowedOffices || [];
          const hasAllOffices =
            allowedOffices.includes('ALL') || allowedOffices.includes('All Offices');

          if (!hasAllOffices) {
            const officeMatch =
              matchesDirectOffice ||
              allowedOffices.some(
                (ao) =>
                  beat.postOfficeName.toLowerCase().includes(ao.toLowerCase()) ||
                  ao.toLowerCase().includes(beat.postOfficeName.toLowerCase())
              );
            if (!officeMatch) return false;
          }

          const isPostmasterOrAdmin =
            userProfile.role === 'POSTMASTER' ||
            userProfile.role === 'ADMIN' ||
            userProfile.designationType?.toLowerCase().includes('postmaster') ||
            userProfile.designationType?.toLowerCase().includes('spm') ||
            userProfile.designationType?.toLowerCase().includes('inspector');

          if (!isPostmasterOrAdmin) {
            const scopedBeats = staffPermissionService.getScopedBeatsSet(userProfile);
            if (scopedBeats && scopedBeats.size > 0) {
              const normBeat = normalizeBeatToken(beat.beatNo).toLowerCase();
              if (staffPermissionService.isPostmanOrGds(userProfile) && !scopedBeats.has(normBeat)) {
                return false;
              }
            }
          }
        } else if (!matchesDirectOffice) {
          return false;
        }
      }

      if (selectedBeatFilter !== 'ALL') {
        const cleanB = normalizeBeatToken(selectedBeatFilter).toLowerCase();
        const matchesBeatNo =
          beat.beatNo.toLowerCase() === cleanB ||
          `beat ${beat.beatNo}`.toLowerCase() === selectedBeatFilter.toLowerCase();
        const matchesColony = beat.areasCovered.some(
          (area) => area.toLowerCase().includes(selectedBeatFilter.toLowerCase())
        );
        if (!matchesBeatNo && !matchesColony) return false;
      }

      if (beatStatusFilter !== 'ALL' && beat.status !== beatStatusFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchBeatNo =
          beat.beatNo.toLowerCase().includes(q) ||
          `beat ${beat.beatNo}`.toLowerCase().includes(q) ||
          beat.name.toLowerCase().includes(q);
        const matchOffice =
          beat.postOfficeName.toLowerCase().includes(q) ||
          beat.parentOffice.toLowerCase().includes(q) ||
          beat.linkedDeliveryOffices.some((lo) => lo.toLowerCase().includes(q));
        const matchPin = beat.pincode.toLowerCase().includes(q);
        const matchPostman =
          beat.assignedPostman.toLowerCase().includes(q) ||
          (beat.employeeId || '').toLowerCase().includes(q) ||
          beat.contact.includes(q);
        const matchColony = beat.areasCovered.some((a) => a.toLowerCase().includes(q));

        if (!matchBeatNo && !matchOffice && !matchPin && !matchPostman && !matchColony) {
          return false;
        }
      }

      return true;
    });
  }, [
    allBeats,
    selectedCircleFilter,
    selectedDivisionFilter,
    selectedPincodeFilter,
    selectedBeatFilter,
    effectiveOfficeFilter,
    isSuperAdmin,
    userProfile,
    simulateNonAdminOfficeId,
    beatStatusFilter,
    searchQuery,
  ]);

  // Hierarchical Managed Beat Tree: Division -> HO -> SO -> BO -> Beats
  const managedBeatTree = useMemo<TreeDivisionNode[]>(() => {
    const byOffice = new Map<string, TreeOfficeNode>();

    filteredBeats.forEach((beat) => {
      const hub = officeHubOptions.find((h) => h.officeId === beat.officeId);
      const existing = byOffice.get(beat.officeId);
      if (existing) {
        existing.beats.push(beat);
      } else {
        byOffice.set(beat.officeId, {
          officeId: beat.officeId,
          postOfficeName: beat.postOfficeName,
          officeType: beat.officeType,
          pincode: beat.pincode,
          division: beat.division || hub?.division || 'Kota Division',
          subDivision: beat.subDivision || hub?.subDivision || 'Division Sub-Unit',
          parentOffice: beat.parentOffice || hub?.parentOfficeName || 'Kota H.O. (324001)',
          beats: [beat],
          childBos: [],
        });
      }
    });

    // Attach BO nodes strictly under their parent SO/HO node when present in tree
    const attachedBoIds = new Set<string>();
    byOffice.forEach((node) => {
      if (node.officeType !== 'BO') return;
      const parentNameClean = node.parentOffice.replace(/\s*\(\d+\)\s*$/, '').trim().toLowerCase();
      const parentNode = Array.from(byOffice.values()).find(
        (cand) =>
          cand.officeId !== node.officeId &&
          cand.officeType !== 'BO' &&
          cand.postOfficeName.trim().toLowerCase() === parentNameClean
      );
      if (parentNode) {
        parentNode.childBos.push(node);
        attachedBoIds.add(node.officeId);
      }
    });

    const divMap = new Map<string, TreeDivisionNode>();
    byOffice.forEach((node) => {
      if (attachedBoIds.has(node.officeId)) return;
      const divName = node.division || 'Kota Division';
      const divEntry = divMap.get(divName) || {
        division: divName,
        headOffices: [],
        standaloneOffices: [],
        totalBeats: 0,
      };
      if (node.officeType === 'HO') {
        divEntry.headOffices.push(node);
      } else {
        divEntry.standaloneOffices.push(node);
      }
      divEntry.totalBeats +=
        node.beats.length + node.childBos.reduce((sum, bo) => sum + bo.beats.length, 0);
      divMap.set(divName, divEntry);
    });

    return Array.from(divMap.values()).sort((a, b) => {
      if (a.division === 'Kota Division') return -1;
      if (b.division === 'Kota Division') return 1;
      return a.division.localeCompare(b.division);
    });
  }, [filteredBeats, officeHubOptions]);

  // Clean structured Office Summary (zero scattered multi-PIN text strings)
  const officeSummary = useMemo(() => {
    const activeHub =
      effectiveOfficeFilter === 'ALL'
        ? null
        : officeHubOptions.find((h) => h.officeId === effectiveOfficeFilter) || {
            officeId: nonAdminAssignedOffice.officeId,
            postOfficeName: nonAdminAssignedOffice.postOfficeName,
            officeType: nonAdminAssignedOffice.officeType,
            pincode: nonAdminAssignedOffice.pincode,
            parentOfficeName: nonAdminAssignedOffice.parentOfficeName,
            linkedDeliveryOffices: nonAdminAssignedOffice.linkedDeliveryOffices,
            completeAddress: `${nonAdminAssignedOffice.postOfficeName}`,
          };

    const totalMappedBeats = filteredBeats.length;

    const linkedOfficesSet = new Set<string>();
    if (activeHub) {
      activeHub.linkedDeliveryOffices.forEach((lo) =>
        linkedOfficesSet.add(lo.replace(/\s*\(\d{6}\)/g, '').trim())
      );
    } else {
      Array.from<string>(new Set<string>(filteredBeats.map((b) => b.postOfficeName)))
        .slice(0, 8)
        .forEach((name: string) => linkedOfficesSet.add(name));
    }

    const avgCoverage =
      filteredBeats.length > 0
        ? (
            filteredBeats.reduce((acc, b) => acc + b.coverageValue, 0) / filteredBeats.length
          ).toFixed(1)
        : '98.0';

    const matchingStaffProfiles = assignableStaffPool.filter((sp) => {
      if (selectedPincodeFilter !== 'ALL' && (sp.officePincode || '') !== selectedPincodeFilter) {
        return false;
      }
      if (effectiveOfficeFilter === 'ALL') return true;
      const spMeta = resolveOfficeMetadata(
        sp.postOfficeName || sp.branchOffice || sp.subOffice || sp.assignedOffice,
        sp.branchOffice,
        sp.officePincode
      );
      return spMeta.officeId === effectiveOfficeFilter;
    });

    const uniqueStaffNames = new Set(
      filteredBeats.map((b) => b.assignedPostman.trim().toLowerCase()).filter(Boolean)
    );
    const staffCount = Math.max(matchingStaffProfiles.length, uniqueStaffNames.size);

    return {
      parentOfficeName: activeHub
        ? `${activeHub.postOfficeName} (${activeHub.officeType})`
        : selectedDivisionFilter !== 'ALL'
        ? `${selectedDivisionFilter} — Managed Beat Tree`
        : 'Kota Division & Rajasthan Circle — Managed Beat Tree',
      scopePinLabel: activeHub
        ? `PIN ${activeHub.pincode}`
        : selectedPincodeFilter !== 'ALL'
        ? `PIN ${selectedPincodeFilter}`
        : `${pincodeOptions.length} Active PIN Jurisdictions`,
      higherParentHo: activeHub ? activeHub.parentOfficeName : 'Rajasthan Postal Circle',
      totalMappedBeats,
      linkedDeliveryOffices: Array.from(linkedOfficesSet),
      totalCoveragePercentage: `${avgCoverage}%`,
      assignedDeliveryStaffCount: staffCount,
      completeAddress: activeHub
        ? activeHub.completeAddress
        : 'Unified Circle → Division → HO → SO → BO Hierarchy',
    };
  }, [
    effectiveOfficeFilter,
    selectedDivisionFilter,
    selectedPincodeFilter,
    officeHubOptions,
    nonAdminAssignedOffice,
    filteredBeats,
    assignableStaffPool,
    pincodeOptions.length,
  ]);

  const totalBeatPages = Math.max(1, Math.ceil(filteredBeats.length / BEATS_PER_PAGE));
  const safeBeatPage = Math.min(beatPage, totalBeatPages);
  const paginatedBeats = useMemo(
    () =>
      filteredBeats.slice(
        (safeBeatPage - 1) * BEATS_PER_PAGE,
        safeBeatPage * BEATS_PER_PAGE
      ),
    [filteredBeats, safeBeatPage]
  );

  const beatsGroupedByOffice = useMemo(() => {
    const groups = new Map<
      string,
      {
        officeId: string;
        postOfficeName: string;
        officeType: 'HO' | 'SO' | 'BO';
        pincode: string;
        parentOffice: string;
        linkedDeliveryOffices: string[];
        beats: BeatCardItem[];
      }
    >();

    paginatedBeats.forEach((beat) => {
      const existing = groups.get(beat.officeId);
      if (!existing) {
        groups.set(beat.officeId, {
          officeId: beat.officeId,
          postOfficeName: beat.postOfficeName,
          officeType: beat.officeType,
          pincode: beat.pincode,
          parentOffice: beat.parentOffice,
          linkedDeliveryOffices: beat.linkedDeliveryOffices,
          beats: [beat],
        });
      } else {
        existing.beats.push(beat);
      }
    });

    return Array.from(groups.values());
  }, [paginatedBeats]);

  const beatCustomers = useMemo(() => {
    if (!selectedBeatForModal) return [];
    const bNo = normalizeBeatToken(selectedBeatForModal.beatNo).toLowerCase();
    return customers.filter((c) => {
      const cBeat = normalizeBeatToken(c.beatNo || '').toLowerCase();
      const matchBeat =
        cBeat === bNo ||
        (selectedBeatForModal.postOfficeName.includes('Dadabari') &&
          bNo === '2' &&
          !c.beatNo &&
          (!c.pincode || c.pincode === '324009'));

      if (!matchBeat) return false;
      if (beatModalSearch.trim()) {
        const q = beatModalSearch.trim().toLowerCase();
        return (
          (c.name || '').toLowerCase().includes(q) ||
          (c.mobile || '').includes(q) ||
          (c.houseNo || '').toLowerCase().includes(q) ||
          (c.area || '').toLowerCase().includes(q) ||
          (c.sector || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedBeatForModal, customers, beatModalSearch]);

  const totalModalCustomerPages = Math.max(
    1,
    Math.ceil(beatCustomers.length / MODAL_CUSTOMERS_PER_PAGE)
  );
  const safeModalCustomerPage = Math.min(beatModalPage, totalModalCustomerPages);
  const paginatedBeatCustomers = beatCustomers.slice(
    (safeModalCustomerPage - 1) * MODAL_CUSTOMERS_PER_PAGE,
    safeModalCustomerPage * MODAL_CUSTOMERS_PER_PAGE
  );

  const handleOpenBroadcast = (beat: BeatCardItem) => {
    setBroadcastBeat(beat);
    const defaultText = `🇮🇳 *भारतीय डाक - बीट ${beat.beatNo} (${beat.postOfficeName}) विशेष सूचना*\n\nआदरणीय निवासीगण (${beat.name}),\nडाक विभाग (${beat.postOfficeName}) द्वारा आपके क्षेत्र में विशेष डोरस्टेप आधार अपडेशन (CELC), सुकन्या समृद्धि खाता (SSA), डाक जीवन बीमा (PLI/RPLI) एवं बचत खाता शिविर आयोजित किया जा रहा है।\n\n📌 बीट डाकिया संपर्क: ${beat.assignedPostman} (${beat.contact})\n📍 डाकघर: ${beat.postOfficeName} (PIN: ${beat.pincode})`;
    setBroadcastMessage(defaultText);
  };

  const handleCopyAllBeatMobiles = (beatNo: string) => {
    const cleanNo = normalizeBeatToken(beatNo).toLowerCase();
    const list = customers
      .filter((c) => normalizeBeatToken(c.beatNo || '').toLowerCase() === cleanNo)
      .map((c) => c.mobile)
      .filter(Boolean);

    navigator.clipboard.writeText(list.join(', '));
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2000);
  };

  const openManageBeatUnderPin = (prefillPin?: string, prefillOfficeId?: string) => {
    const targetPin =
      prefillPin && prefillPin !== 'ALL'
        ? prefillPin
        : selectedPincodeFilter !== 'ALL'
        ? selectedPincodeFilter
        : '324009';
    setMbPincode(targetPin);
    const matchingOffice =
      officeHubOptions.find((h) => h.officeId === prefillOfficeId) ||
      officeHubOptions.find((h) => h.pincode === targetPin) ||
      officeHubOptions[0];
    setMbOfficeId(matchingOffice?.officeId || 'DADABARI_SO');
    setMbBeatNo('');
    setMbBeatTitle('');
    setMbFixedKm('18');
    setMbColoniesText('');
    setMbStaffId(assignableStaffPool[0]?.id || '');
    setShowManageBeatModal(true);
  };

  const handleSaveManagedBeat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mbBeatNo.trim() || !mbPincode.trim()) return;
    const hub = officeHubOptions.find((h) => h.officeId === mbOfficeId);
    const colonies = mbColoniesText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    const saved = brandOwnerService.upsertManagedBeatAndAudit({
      officeId: hub?.officeId || mbOfficeId,
      postOfficeName: hub?.postOfficeName || 'Dadabari S.O.',
      officeType: hub?.officeType || 'SO',
      division: hub?.division || 'Kota Division',
      circle: hub?.circle || 'Rajasthan Circle',
      parentOffice: hub?.parentOfficeName || 'Kota H.O. (324001)',
      pincode: mbPincode.trim(),
      beatNo: mbBeatNo.trim(),
      beatTitle: mbBeatTitle.trim() || undefined,
      fixedKm: Math.max(1, Number(mbFixedKm) || 18),
      colonies,
      assignedStaffId: mbStaffId || undefined,
      actorName,
    });
    setShowManageBeatModal(false);
    showToastNotice(
      `Saved Beat ${saved.beatNo} under ${saved.postOfficeName} (PIN ${saved.pincode}) assigned to ${saved.assignedPostman}. Logged in audit_logs.`
    );
    refreshData();
  };

  const openReassignModal = (beat: BeatCardItem) => {
    setReassignTargetBeat(beat);
    setReassignStaffSearch('');
    const matched = assignableStaffPool.find(
      (s) =>
        (beat.employeeId && s.employeeId === beat.employeeId) ||
        s.name.toLowerCase() === beat.assignedPostman.toLowerCase()
    );
    setReassignSelectedStaffId(matched?.id || assignableStaffPool[0]?.id || '');
  };

  const handleConfirmReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTargetBeat || !reassignSelectedStaffId) return;
    const res = brandOwnerService.reassignBeatPostmanAndAudit({
      officeId: reassignTargetBeat.officeId,
      postOfficeName: reassignTargetBeat.postOfficeName,
      officeType: reassignTargetBeat.officeType,
      pincode: reassignTargetBeat.pincode,
      beatNo: reassignTargetBeat.beatNo,
      newStaffId: reassignSelectedStaffId,
      colonies: reassignTargetBeat.areasCovered,
      actorName,
    });
    if (!res.success) {
      showToastNotice(res.error || 'Could not reassign beat staff.');
      return;
    }
    setReassignTargetBeat(null);
    showToastNotice(res.message || 'Beat reassigned and audited.');
    refreshData();
  };

  const toggleTreeOffice = (officeId: string) => {
    setExpandedOffices((prev) => ({ ...prev, [officeId]: !(prev[officeId] ?? true) }));
  };

  const renderTreeOfficeBlock = (node: TreeOfficeNode, isChildBo = false) => {
    const isExpanded = expandedOffices[node.officeId] ?? true;
    return (
      <div
        key={node.officeId}
        className={`rounded-2xl border ${
          isChildBo
            ? 'border-amber-200 bg-amber-50/30 ml-4 sm:ml-8'
            : 'border-slate-200 bg-white shadow-2xs'
        } overflow-hidden`}
      >
        <div
          onClick={() => toggleTreeOffice(node.officeId)}
          className={`px-4 py-3 flex flex-wrap items-center justify-between gap-2 cursor-pointer transition ${
            node.officeType === 'HO'
              ? 'bg-gradient-to-r from-red-950 to-slate-900 text-white'
              : node.officeType === 'SO'
              ? 'bg-slate-50 hover:bg-slate-100 text-slate-900 border-b border-slate-200'
              : 'bg-amber-50/70 hover:bg-amber-100/60 text-slate-900 border-b border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            {isExpanded ? (
              <ChevronDown size={15} className="shrink-0 opacity-75" />
            ) : (
              <ChevronRight size={15} className="shrink-0 opacity-75" />
            )}
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                node.officeType === 'HO'
                  ? 'bg-amber-400 text-slate-950'
                  : node.officeType === 'SO'
                  ? 'bg-red-800 text-white'
                  : 'bg-amber-200 text-amber-950'
              }`}
            >
              {node.officeType}
            </span>
            <span className="font-bold text-sm">{node.postOfficeName}</span>
            <span
              className={`font-mono text-xs tabular-nums ${
                node.officeType === 'HO' ? 'text-amber-300' : 'text-slate-600'
              }`}
            >
              PIN {node.pincode}
            </span>
            <span
              className={`text-[11px] ${
                node.officeType === 'HO' ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              {node.subDivision}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span
              className={`px-2.5 py-0.5 rounded-md font-mono font-bold tabular-nums ${
                node.officeType === 'HO'
                  ? 'bg-white/10 text-amber-200'
                  : 'bg-white border border-slate-200 text-slate-800'
              }`}
            >
              {node.beats.length} {node.beats.length === 1 ? 'Beat' : 'Beats'}
            </span>
            {node.childBos.length > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold tabular-nums">
                {node.childBos.length} Child B.O.s
              </span>
            )}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openManageBeatUnderPin(node.pincode, node.officeId);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  node.officeType === 'HO'
                    ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                    : 'bg-red-800 text-white hover:bg-red-700'
                }`}
              >
                <Plus size={12} />
                <span>Add Beat</span>
              </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="p-3 sm:p-4 space-y-3">
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden">
              {node.beats.map((beat) => (
                <div
                  key={beat.compositeKey || beat.id}
                  className="p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-50/80 transition text-xs"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-red-50 text-red-800 px-2 py-0.5 rounded border border-red-200">
                        BEAT {beat.beatNo}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{beat.name}</span>
                      <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                        {beat.fixedKm} KM/day
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
                      <span>
                        Staff: <strong className="text-slate-900">{beat.assignedPostman}</strong>
                        {beat.employeeId && (
                          <span className="font-mono text-slate-500 ml-1 tabular-nums">
                            ({beat.employeeId})
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-blue-700 tabular-nums">{beat.contact}</span>
                      <span className="tabular-nums">
                        Customers: <strong>{beat.totalCustomers}</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <span className="text-[10px] font-semibold text-slate-400 mr-1">
                        Colonies / Pockets ({beat.areasCovered.length}):
                      </span>
                      {beat.areasCovered.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">
                          No colonies mapped yet
                        </span>
                      ) : (
                        <>
                          {beat.areasCovered.slice(0, 5).map((col, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200/70 text-[10px] font-medium"
                            >
                              {col}
                            </span>
                          ))}
                          {beat.areasCovered.length > 5 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                              +{beat.areasCovered.length - 5} more
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openReassignModal(beat)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <UserCheck size={12} />
                      <span>Reassign Staff</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSectorModalBeat(beat)}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <Layers size={12} />
                      <span>Colonies</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBeatForModal(beat);
                        setBeatModalSearch('');
                        if (onFilterBeat) onFilterBeat(beat.beatNo);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <Users size={12} />
                      <span>Customers ({beat.totalCustomers})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {node.childBos.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold ml-4 sm:ml-8 flex items-center gap-1">
                  <GitBranch size={12} />
                  <span>Child Branch Post Offices (B.O.) under {node.postOfficeName}</span>
                </div>
                {node.childBos.map((bo) => renderTreeOfficeBlock(bo, true))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderBeatCard = (beat: BeatCardItem) => (
    <div
      key={beat.compositeKey || beat.id}
      className="bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition p-5 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono font-bold text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-lg border border-red-200">
              BEAT {beat.beatNo}
            </span>
            <span
              className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-md border tabular-nums ${
                beat.officeType === 'BO'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              {beat.postOfficeName} · {beat.pincode}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full shrink-0">
            {beat.status}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 text-sm mb-1">{beat.name}</h3>
        <p className="text-[11px] text-slate-500 mb-3 flex items-center gap-1">
          <Building2 size={12} className="text-slate-400 shrink-0" />
          <span>Parent Hub: {beat.parentOffice}</span>
        </p>

        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Customers</span>
            <span className="text-sm font-black text-slate-900 tabular-nums">{beat.totalCustomers}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Coverage</span>
            <span className="text-sm font-black text-emerald-700 tabular-nums">{beat.confirmedCoverage}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Fixed Route</span>
            <span className="text-sm font-black text-slate-800 tabular-nums">{beat.fixedKm} KM</span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-slate-700 mb-3 bg-red-50/40 p-2.5 rounded-xl border border-red-100/80">
          <div className="text-[11px] flex items-center justify-between gap-2">
            <strong className="text-slate-500">Office:</strong>
            <span className="text-slate-900 font-bold truncate">{beat.postOfficeName}</span>
          </div>
          <div className="text-[11px] flex items-center justify-between gap-2">
            <strong className="text-slate-500">Postman:</strong>
            <span className="text-slate-900 font-bold truncate">
              {beat.assignedPostman}
              {beat.employeeId && (
                <span className="font-mono text-[10px] text-slate-500 font-normal ml-1">
                  ({beat.employeeId})
                </span>
              )}
            </span>
          </div>
          <div className="text-[11px] flex items-center justify-between">
            <span className="text-slate-500">Mobile:</span>
            <a
              href={`tel:${beat.contact}`}
              className="font-mono text-blue-700 font-semibold hover:underline flex items-center gap-1 tabular-nums"
            >
              <Phone size={11} />
              {beat.contact}
            </a>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-500 block text-[11px] font-semibold">
              Colonies &amp; Sectors ({beat.areasCovered.length}):
            </span>
          </div>
          {beat.areasCovered.length === 0 ? (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-[11px] text-slate-500">
              No colonies mapped yet.
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {beat.areasCovered.slice(0, 5).map((a: string, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-200/60 rounded text-[10px] font-semibold"
                >
                  <span>{a}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnmapColonyFromBeat(beat, a);
                    }}
                    title={`Unmap "${a}" from Beat ${beat.beatNo}`}
                    className="text-blue-400 hover:text-red-700 rounded p-0.5 cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              {beat.areasCovered.length > 5 && (
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold border border-slate-200">
                  +{beat.areasCovered.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 mt-4 border-t border-slate-100 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => openReassignModal(beat)}
            className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border border-amber-300 transition cursor-pointer whitespace-nowrap"
          >
            <UserCheck size={12} />
            <span>Reassign Staff</span>
          </button>
          <button
            type="button"
            onClick={() => setSectorModalBeat(beat)}
            className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border border-blue-200 transition cursor-pointer whitespace-nowrap"
          >
            <Layers size={12} />
            <span>Colonies</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedBeatForModal(beat);
            setBeatModalSearch('');
            if (onFilterBeat) onFilterBeat(beat.beatNo);
          }}
          className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 transition cursor-pointer"
        >
          <Users size={14} className="text-red-700" />
          <span>View Beat Customers ({beat.totalCustomers})</span>
        </button>

        {canDispatch && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenBroadcast(beat)}
              className="flex-1 py-1.5 px-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
            >
              <Radio size={13} />
              <span>Bulk Broadcast</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const firstCust = customers.find(
                  (c) => normalizeBeatToken(c.beatNo || '').toLowerCase() === normalizeBeatToken(beat.beatNo).toLowerCase()
                );
                setActiveMessageCustomer(firstCust || null);
                setShowMessageModal(true);
              }}
              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition cursor-pointer"
              title="Direct WhatsApp / SMS to beat"
            >
              <MessageSquare size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const filteredModalStaff = useMemo(() => {
    const q = reassignStaffSearch.trim().toLowerCase();
    if (!q) return assignableStaffPool;
    return assignableStaffPool.filter((s) =>
      `${s.name} ${s.employeeId || ''} ${s.contact || ''} ${s.subOffice || ''} ${s.officePincode || ''} ${s.beat || ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [assignableStaffPool, reassignStaffSearch]);

  return (
    <div className="space-y-6" id="beat-management-view-root">
      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Header & Pincode-Wise Beat Management Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MapIcon size={22} className="text-red-700" />
                <span>Kota Division &amp; Rajasthan Managed Beat Tree</span>
              </h2>
              {isSuperAdmin ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                  <ShieldCheck size={12} /> Division-Wide Control
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <Lock size={12} /> Scoped Office: {nonAdminAssignedOffice.postOfficeName}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Deduplicated HO → SO / BO → Beat → Colony hierarchy with live Master Staff sync, PIN-wise beat management, and audit_logs traceability ({filteredBeats.length} Beats Active)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isActualSuperAdmin && (
              <div className="flex items-center gap-1.5 bg-amber-50/90 border border-amber-200 px-2.5 py-1.5 rounded-xl text-xs">
                <Eye size={13} className="text-amber-700 shrink-0" />
                <select
                  value={simulateNonAdminOfficeId || 'ADMIN_MODE'}
                  onChange={(e) =>
                    setSimulateNonAdminOfficeId(
                      e.target.value === 'ADMIN_MODE' ? null : e.target.value
                    )
                  }
                  className="bg-transparent text-[11px] font-bold text-amber-900 focus:outline-none cursor-pointer"
                  title="Preview Staff/Postmaster Office View"
                >
                  <option value="ADMIN_MODE">View: Master Admin (Full Division)</option>
                  <option value="Dadabari S.O.">Simulate: Dadabari S.O.</option>
                  <option value="Talwandi S.O.">Simulate: Talwandi S.O.</option>
                  <option value="Engineering College S.O.">Simulate: Engineering College S.O.</option>
                  <option value="Vigyan Nagar S.O.">Simulate: Vigyan Nagar S.O.</option>
                </select>
              </div>
            )}

            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => openManageBeatUnderPin()}
                className="px-3.5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer whitespace-nowrap"
              >
                <Plus size={14} />
                <span>Add / Edit Beat Under PIN</span>
              </button>
            )}

            {canDispatch && (
              <button
                type="button"
                onClick={() => {
                  setActiveMessageCustomer(null);
                  setShowMessageModal(true);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer whitespace-nowrap"
                id="open-messaging-from-beats"
              >
                <MessageSquare size={14} />
                <span>Direct Message</span>
              </button>
            )}
          </div>
        </div>

        {/* 5-Tier Administrative Hierarchy + Pincode-Wise Search Strip */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Filter size={13} className="text-red-700" />
              <span>Pincode-Wise Search &amp; Administrative Hierarchy Filters</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-semibold tabular-nums">
                {filteredBeats.length} beats matched
              </span>
              {(selectedDivisionFilter !== 'ALL' ||
                selectedPincodeFilter !== 'ALL' ||
                selectedOfficeFilter !== 'ALL' ||
                selectedBeatFilter !== 'ALL' ||
                searchQuery) &&
                isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDivisionFilter('ALL');
                      setSelectedPincodeFilter('ALL');
                      setSelectedOfficeFilter('ALL');
                      setSelectedBeatFilter('ALL');
                      setSearchQuery('');
                    }}
                    className="text-[11px] font-bold text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} /> Reset Filter
                  </button>
                )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
            {/* 1. Circle */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                1. Postal Circle
              </label>
              <select
                value={selectedCircleFilter}
                onChange={(e) => setSelectedCircleFilter(e.target.value)}
                disabled={!isSuperAdmin}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 disabled:bg-slate-100 text-xs"
              >
                <option value="Rajasthan Circle">Rajasthan Circle</option>
                <option value="ALL">All Circles (Pan-India)</option>
              </select>
            </div>

            {/* 2. Division */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                2. Division
              </label>
              <select
                value={selectedDivisionFilter}
                onChange={(e) => {
                  setSelectedDivisionFilter(e.target.value);
                  setSelectedOfficeFilter('ALL');
                  setSelectedBeatFilter('ALL');
                }}
                disabled={!isSuperAdmin}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 disabled:bg-slate-100 text-xs"
              >
                <option value="ALL">All Divisions</option>
                <option value="Kota Division">Kota Division</option>
                <option value="Baran Division">Baran Division</option>
                <option value="Jhalawar Division">Jhalawar Division</option>
                <option value="Bundi Division">Bundi Division</option>
                <option value="Tonk Division">Tonk Division</option>
              </select>
            </div>

            {/* 3. Pincode-Wise Filter (Structured PIN Metadata) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                3. PIN Code Filter
              </label>
              <select
                value={selectedPincodeFilter}
                onChange={(e) => {
                  setSelectedPincodeFilter(e.target.value);
                  setSelectedOfficeFilter('ALL');
                  setSelectedBeatFilter('ALL');
                }}
                disabled={!isSuperAdmin}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-800 disabled:bg-slate-100 text-xs tabular-nums"
              >
                <option value="ALL">All PIN Codes ({pincodeOptions.length})</option>
                {pincodeOptions.map((opt) => (
                  <option key={opt.pincode} value={opt.pincode}>
                    {opt.pincode} · {opt.beatCount} {opt.beatCount === 1 ? 'Beat' : 'Beats'}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Office (HO / SO / BO) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                4. Post Office (HO / SO / BO)
              </label>
              <select
                value={selectedOfficeFilter}
                onChange={(e) => {
                  setSelectedOfficeFilter(e.target.value);
                  setSelectedBeatFilter('ALL');
                }}
                disabled={!isSuperAdmin}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 disabled:bg-slate-100 text-xs"
              >
                <option value="ALL">All Offices</option>
                {availableOfficesForDivision.map((hub) => (
                  <option key={hub.officeId} value={hub.officeId}>
                    {hub.postOfficeName} ({hub.officeType})
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Beat */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                5. Beat / Staff
              </label>
              <select
                value={selectedBeatFilter}
                onChange={(e) => setSelectedBeatFilter(e.target.value)}
                disabled={!isSuperAdmin && !!userProfile?.beat && userProfile.beat !== 'All Beats'}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 disabled:bg-slate-100 text-xs"
              >
                <option value="ALL">All Beats</option>
                {availableBeatsForSelection.map((b) => (
                  <option key={b.compositeKey || b.id} value={b.beatNo}>
                    Beat {b.beatNo} · {b.postOfficeName} ({b.assignedPostman})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search, Office Quick Switcher & Tree / Card View Toggle */}
        <div className="pt-3 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="beat-office-quick-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by PIN code, Beat No., Office (Dadabari, Borabas, Sogaria), Staff Name, or Colony..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {isSuperAdmin && (
              <div className="flex flex-wrap items-center gap-1 mr-1">
                <button
                  type="button"
                  onClick={() => setSelectedOfficeFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedOfficeFilter === 'ALL'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Offices
                </button>
                {officeHubOptions
                  .filter((h) =>
                    ['KOTA_HO', 'DADABARI_SO', 'ENG_COLLEGE_SO', 'VIGYAN_NAGAR_SO', 'TALWANDI_SO'].includes(
                      h.officeId
                    )
                  )
                  .map((hub) => (
                    <button
                      type="button"
                      key={hub.officeId}
                      onClick={() => setSelectedOfficeFilter(hub.officeId)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                        selectedOfficeFilter === hub.officeId
                          ? 'bg-red-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {hub.postOfficeName}
                    </button>
                  ))}
              </div>
            )}

            <div className="inline-flex rounded-xl border border-slate-300 bg-white p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewMode('TREE')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  viewMode === 'TREE'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <GitBranch size={12} />
                <span>Managed Beat Tree</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('CARDS')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  viewMode === 'CARDS'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Layers size={12} />
                <span>Beat Cards</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Office & Scope Summary Header Bar (Structured Metadata — Zero Multi-PIN Clutter) */}
      <div
        className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white p-5 rounded-3xl shadow-lg border border-red-900/40"
        id="office-beat-delivery-summary-bar"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Building2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Office Beat &amp; Delivery Hierarchy
                </span>
                <span className="text-xs font-mono text-emerald-300 font-bold tabular-nums">
                  {officeSummary.scopePinLabel}
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-white mt-1">
                {officeSummary.parentOfficeName}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Parent Controlling Hub: <strong className="text-amber-300">{officeSummary.higherParentHo}</strong> · {officeSummary.completeAddress}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowOfficeMappingDrawer(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md self-start lg:self-auto shrink-0 cursor-pointer whitespace-nowrap"
            id="open-office-beat-mapping-drawer"
          >
            <Info size={15} />
            <span>Office &amp; Beat Mapping Drawer</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <MapPin size={13} className="text-amber-400" />
              <span>Scope &amp; Jurisdiction</span>
            </div>
            <div className="text-sm font-black text-white mt-1 truncate">
              {officeSummary.parentOfficeName}
            </div>
            <div className="text-xs font-mono text-amber-300 mt-0.5 tabular-nums">
              {officeSummary.scopePinLabel}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <Navigation size={13} className="text-emerald-400" />
              <span>Mapped Delivery Beats</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5 tabular-nums">
              {officeSummary.totalMappedBeats}{' '}
              <span className="text-xs font-bold text-slate-300">Active Beats</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5 truncate">
              {managedBeatTree.length} {managedBeatTree.length === 1 ? 'Division' : 'Divisions'}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <GitBranch size={13} className="text-sky-400" />
              <span>Delivery Offices in Scope</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {officeSummary.linkedDeliveryOffices.map((lo, idx) => (
                <span
                  key={idx}
                  onClick={() => {
                    if (isSuperAdmin) {
                      const matched = officeHubOptions.find((h) =>
                        lo.toLowerCase().includes(h.postOfficeName.toLowerCase())
                      );
                      if (matched) setSelectedOfficeFilter(matched.officeId);
                    }
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-500/20 text-sky-200 border border-sky-400/30 ${
                    isSuperAdmin ? 'cursor-pointer hover:bg-sky-500/30' : ''
                  }`}
                >
                  {lo}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <Users size={13} className="text-amber-400" />
              <span>Coverage &amp; Assigned Staff</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <div>
                <span className="text-2xl font-black text-amber-400 tabular-nums">
                  {officeSummary.totalCoveragePercentage}
                </span>
                <span className="text-[10px] text-slate-300 block">Doorstep Coverage</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-white tabular-nums">
                  {officeSummary.assignedDeliveryStaffCount}
                </span>
                <span className="text-[10px] text-emerald-300 block font-semibold">
                  Active Staff
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty Search / Filter State */}
      {filteredBeats.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center mx-auto">
            <Search size={22} />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No Delivery Beats Match Your Current Filter
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try resetting filters or create a new beat under your selected PIN code.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setBeatStatusFilter('ALL');
                if (isSuperAdmin) {
                  setSelectedDivisionFilter('ALL');
                  setSelectedPincodeFilter('ALL');
                  setSelectedOfficeFilter('ALL');
                  setSelectedBeatFilter('ALL');
                }
              }}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Reset All Filters
            </button>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => openManageBeatUnderPin()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                + Add Beat Under PIN
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'TREE' ? (
        /* HIERARCHICAL MANAGED BEAT TREE VIEW: Division -> HO -> SO -> BO -> Beats */
        <div className="space-y-5">
          {managedBeatTree.map((divNode) => (
            <section
              key={divNode.division}
              className="bg-slate-100/80 border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-red-800 text-white text-[11px] font-black uppercase">
                    Rajasthan Circle
                  </span>
                  <h3 className="text-base font-black text-slate-900">{divNode.division}</h3>
                  <span className="text-xs font-mono text-slate-600 tabular-nums">
                    {divNode.totalBeats} Managed Beats
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const allIds: Record<string, boolean> = {};
                      [...divNode.headOffices, ...divNode.standaloneOffices].forEach((n) => {
                        allIds[n.officeId] = true;
                        n.childBos.forEach((bo) => (allIds[bo.officeId] = true));
                      });
                      setExpandedOffices((prev) => ({ ...prev, ...allIds }));
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Expand All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const allIds: Record<string, boolean> = {};
                      [...divNode.headOffices, ...divNode.standaloneOffices].forEach((n) => {
                        allIds[n.officeId] = false;
                        n.childBos.forEach((bo) => (allIds[bo.officeId] = false));
                      });
                      setExpandedOffices((prev) => ({ ...prev, ...allIds }));
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {divNode.headOffices.map((ho) => renderTreeOfficeBlock(ho))}
                {divNode.standaloneOffices.map((so) => renderTreeOfficeBlock(so))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* FLAT / GROUPED BEAT CARDS VIEW */
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setGroupByOffice((prev) => !prev)}
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold border bg-white text-slate-700 border-slate-300 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
            >
              <Layers size={12} />
              <span>{groupByOffice ? 'Grouped by Office' : 'Flat Grid'}</span>
            </button>
          </div>

          {groupByOffice ? (
            <div className="space-y-6">
              {beatsGroupedByOffice.map((group) => (
                <div
                  key={group.officeId}
                  className="bg-slate-100/70 rounded-3xl p-4 sm:p-5 border border-slate-200/90 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                          group.officeType === 'BO'
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-red-700 text-white'
                        }`}
                      >
                        {group.officeType} HUB
                      </span>
                      <h3 className="text-base font-black text-slate-900">
                        {group.postOfficeName}
                      </h3>
                      <span className="text-xs font-mono text-slate-600 tabular-nums">
                        PIN {group.pincode}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        • Parent: <strong>{group.parentOffice}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {group.beats.map((beat) => renderBeatCard(beat))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paginatedBeats.map((beat) => renderBeatCard(beat))}
            </div>
          )}

          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-600 font-medium tabular-nums">
              Showing <b className="text-slate-900">{(safeBeatPage - 1) * BEATS_PER_PAGE + 1}</b>–
              <b className="text-slate-900">{Math.min(safeBeatPage * BEATS_PER_PAGE, filteredBeats.length)}</b> of{' '}
              <b className="text-slate-900">{filteredBeats.length}</b> delivery beats
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safeBeatPage <= 1}
                onClick={() => setBeatPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
              >
                Prev
              </button>
              <span className="font-bold text-slate-800 px-1 tabular-nums">
                Page {safeBeatPage} / {totalBeatPages}
              </span>
              <button
                type="button"
                disabled={safeBeatPage >= totalBeatPages}
                onClick={() => setBeatPage((p) => Math.min(totalBeatPages, p + 1))}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Beat Under Selected PIN */}
      {showManageBeatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-red-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route size={18} className="text-amber-300" />
                <div>
                  <h3 className="text-sm font-black">Pincode-Wise Beat Creation / Update</h3>
                  <p className="text-[11px] text-slate-300">
                    Add or update a beat under any active PIN &amp; assign canonical Master Staff
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManageBeatModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveManagedBeat} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">6-Digit PIN Code *</label>
                  <input
                    required
                    maxLength={6}
                    value={mbPincode}
                    onChange={(e) => {
                      const nextPin = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setMbPincode(nextPin);
                      const autoHub = officeHubOptions.find((h) => h.pincode === nextPin);
                      if (autoHub) setMbOfficeId(autoHub.officeId);
                    }}
                    placeholder="324009"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Post Office (HO / SO / BO) *</label>
                  <select
                    value={mbOfficeId}
                    onChange={(e) => {
                      setMbOfficeId(e.target.value);
                      const hub = officeHubOptions.find((h) => h.officeId === e.target.value);
                      if (hub) setMbPincode(hub.pincode);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    {officeHubOptions.map((h) => (
                      <option key={h.officeId} value={h.officeId}>
                        {h.postOfficeName} ({h.pincode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Beat Number / Code *</label>
                  <input
                    required
                    value={mbBeatNo}
                    onChange={(e) => setMbBeatNo(e.target.value)}
                    placeholder="e.g. 34 or EC-5 or Borkheda Beat 2"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fixed KM / Day</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={mbFixedKm}
                    onChange={(e) => setMbFixedKm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Beat Display Title</label>
                <input
                  value={mbBeatTitle}
                  onChange={(e) => setMbBeatTitle(e.target.value)}
                  placeholder="Optional title (auto-generated if empty)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Master Staff Member</label>
                <select
                  value={mbStaffId}
                  onChange={(e) => setMbStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="">-- Select Staff --</option>
                  {assignableStaffPool.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.employeeId || s.id} · {s.subOffice || s.officePincode || 'Kota'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Colonies / Pockets (Comma-separated)</label>
                <textarea
                  rows={2}
                  value={mbColoniesText}
                  onChange={(e) => setMbColoniesText(e.target.value)}
                  placeholder="e.g. Keshavpura Sector 8, Patel Nagar Extension"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManageBeatModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-900 text-white font-bold cursor-pointer"
                >
                  Save Beat &amp; Log Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reassign Master Staff to Beat */}
      {reassignTargetBeat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black">
                  Reassign Staff — Beat {reassignTargetBeat.beatNo}
                </h3>
                <p className="text-[11px] text-slate-300">
                  {reassignTargetBeat.postOfficeName} · PIN {reassignTargetBeat.pincode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReassignTargetBeat(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmReassign} className="p-5 space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Current Assignee:</span>{' '}
                <strong className="text-slate-900">{reassignTargetBeat.assignedPostman}</strong>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Search Master Staff Pool</label>
                <input
                  type="text"
                  value={reassignStaffSearch}
                  onChange={(e) => setReassignStaffSearch(e.target.value)}
                  placeholder="Filter by name, employee ID, mobile..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-2"
                />
                <select
                  required
                  value={reassignSelectedStaffId}
                  onChange={(e) => setReassignSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  {filteredModalStaff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.employeeId || s.id} · {s.designationType || s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReassignTargetBeat(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-900 text-white font-bold cursor-pointer"
                >
                  Confirm &amp; Audit Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Office & Beat Mapping Info Drawer / Modal */}
      {showOfficeMappingDrawer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-red-900 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-400 text-slate-950">
                  Official India Post Delivery Hierarchy
                </span>
                <h3 className="text-lg font-black mt-1">
                  Office Beat &amp; Linked Delivery Hub Mapping Directory
                </h3>
                <p className="text-xs text-red-100 mt-0.5">
                  Parent Office, Linked Sub-Offices / Branch Offices (BOs), and Active Beat Matrix
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOfficeMappingDrawer(false)}
                className="p-2 hover:bg-white/10 rounded-full transition text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Beat No.</th>
                      <th className="p-3">Post Office &amp; PIN</th>
                      <th className="p-3">Parent Office</th>
                      <th className="p-3">Assigned Staff</th>
                      <th className="p-3 text-center">Fixed KM</th>
                      <th className="p-3 text-center">Colonies</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBeats.map((b) => (
                      <tr key={b.compositeKey || b.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-red-700">Beat {b.beatNo}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{b.postOfficeName}</div>
                          <div className="font-mono text-[10px] text-slate-500 tabular-nums">
                            PIN {b.pincode}
                          </div>
                        </td>
                        <td className="p-3 text-slate-700">{b.parentOffice}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{b.assignedPostman}</div>
                          <div className="font-mono text-[10px] text-blue-700 tabular-nums">
                            {b.contact}
                          </div>
                        </td>
                        <td className="p-3 text-center font-mono font-bold tabular-nums">{b.fixedKm} KM</td>
                        <td className="p-3 text-center font-mono tabular-nums">{b.areasCovered.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowOfficeMappingDrawer(false)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Mapping Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beat Customers Modal Drawer */}
      {selectedBeatForModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-red-800 to-red-700 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold">
                    Beat {selectedBeatForModal.beatNo} · {selectedBeatForModal.postOfficeName} — Customers Directory
                  </h3>
                  <span className="text-xs bg-white text-red-800 font-mono font-bold px-2 py-0.5 rounded tabular-nums">
                    {beatCustomers.length} Verified
                  </span>
                </div>
                <p className="text-xs text-red-100 mt-0.5">
                  Parent Hub: {selectedBeatForModal.parentOffice} • Postman: {selectedBeatForModal.assignedPostman} ({selectedBeatForModal.contact})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBeatForModal(null)}
                className="p-2 hover:bg-white/10 rounded-full transition text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={beatModalSearch}
                  onChange={(e) => setBeatModalSearch(e.target.value)}
                  placeholder="Filter customers in this beat..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <button
                type="button"
                onClick={() => handleCopyAllBeatMobiles(selectedBeatForModal.beatNo)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedBatch ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copiedBatch ? 'Copied Mobile Numbers!' : 'Copy All Beat Phone Numbers'}</span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto divide-y divide-slate-100 flex-1">
              {beatCustomers.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  No customers currently mapped to Beat {selectedBeatForModal.beatNo} matching your filter.
                </div>
              ) : (
                paginatedBeatCustomers.map((c, i) => (
                  <div
                    key={c.id || c.masterId || i}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                        <span className="text-[10px] font-mono font-semibold bg-slate-100 px-1.5 rounded text-slate-600">
                          {c.masterId || c.id}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        H.No {c.houseNo || 'NA'},{' '}
                        {c.sector ? `Sector ${c.sector}` : c.area || selectedBeatForModal.postOfficeName}
                      </div>
                      <div className="text-xs font-mono text-slate-700 mt-0.5 tabular-nums">
                        {c.mobile || 'No Mobile'}
                      </div>
                    </div>

                    {canDispatch && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMessageCustomer(c);
                          setShowMessageModal(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare size={14} className="text-emerald-700" />
                        <span>Send Message</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                {beatCustomers.length > 0 && (
                  <>
                    <span className="text-slate-600 font-medium tabular-nums">
                      Showing {(safeModalCustomerPage - 1) * MODAL_CUSTOMERS_PER_PAGE + 1}–
                      {Math.min(safeModalCustomerPage * MODAL_CUSTOMERS_PER_PAGE, beatCustomers.length)} of{' '}
                      {beatCustomers.length}
                    </span>
                    <button
                      type="button"
                      disabled={safeModalCustomerPage <= 1}
                      onClick={() => setBeatModalPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 cursor-pointer"
                    >
                      Prev
                    </button>
                    <span className="font-bold text-slate-800 tabular-nums">
                      {safeModalCustomerPage} / {totalModalCustomerPages}
                    </span>
                    <button
                      type="button"
                      disabled={safeModalCustomerPage >= totalModalCustomerPages}
                      onClick={() => setBeatModalPage((p) => Math.min(totalModalCustomerPages, p + 1))}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 cursor-pointer"
                    >
                      Next
                    </button>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedBeatForModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Broadcast Modal */}
      {broadcastBeat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-red-800 to-red-700 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Radio size={20} className="animate-pulse" />
                <div>
                  <h3 className="text-lg font-bold">Beat-wise Bulk Broadcast Engine</h3>
                  <p className="text-xs text-red-100">
                    Disseminate official notices across {broadcastBeat.name} ({broadcastBeat.postOfficeName})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBroadcastBeat(null)}
                className="p-2 hover:bg-white/10 rounded-full transition text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {broadcastStatus && (
              <div className="bg-emerald-600 text-white px-5 py-2.5 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{broadcastStatus}</span>
              </div>
            )}

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">
                    Target: {broadcastBeat.name} ({broadcastBeat.postOfficeName} · PIN {broadcastBeat.pincode})
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Assigned Postman: {broadcastBeat.assignedPostman} ({broadcastBeat.contact})
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-red-100 text-red-800 rounded-lg tabular-nums">
                  {broadcastBeat.totalCustomers} Recipients
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Broadcast Notice Content (प्रसारण सूचना):
                </label>
                <textarea
                  rows={6}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none leading-relaxed text-slate-900"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2">
                <Sparkles size={16} className="shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong>Broadcast Workflow Tip:</strong> Copy all {broadcastBeat.totalCustomers} mobile numbers directly into official India Post SMS Gateway or WhatsApp Broadcast list.
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleCopyAllBeatMobiles(broadcastBeat.beatNo)}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Copy size={14} />
                <span>Copy All {broadcastBeat.totalCustomers} Numbers</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  customerService.addCommunicationLog({
                    recipientName: `Beat ${broadcastBeat.beatNo} (${broadcastBeat.postOfficeName}) Broadcast Group`,
                    mobile: 'Broadcast',
                    channel: 'Broadcast',
                    type: 'Beat Broadcast',
                    content: broadcastMessage,
                    status: 'Delivered',
                    beatNo: broadcastBeat.beatNo,
                  });
                  setBroadcastStatus('WhatsApp प्रसारण संदेश क्यू और लॉग में दर्ज किया गया!');
                  setTimeout(() => setBroadcastStatus(null), 2500);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send size={14} />
                <span>Log &amp; Dispatch Broadcast</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Messaging Modal */}
      {showMessageModal && (
        <DirectMessageModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setActiveMessageCustomer(null);
          }}
          initialCustomer={activeMessageCustomer}
        />
      )}

      {/* Multi-Colony & Sector Mapping Modal */}
      {sectorModalBeat && (
        <BeatMultiColonySectorModal
          isOpen={Boolean(sectorModalBeat)}
          onClose={() => setSectorModalBeat(null)}
          beatNo={
            sectorModalBeat.beatNo.startsWith('Beat')
              ? sectorModalBeat.beatNo
              : `Beat ${sectorModalBeat.beatNo}`
          }
          assignedStaffName={sectorModalBeat.assignedPostman}
          officeName={sectorModalBeat.postOfficeName}
          pincode={sectorModalBeat.pincode}
          division={sectorModalBeat.division}
          initialSelectedColonies={sectorModalBeat.areasCovered}
          initialColoniesWithSectors={
            coloniesWithSectorsMap[
              sectorModalBeat.beatNo.startsWith('Beat')
                ? sectorModalBeat.beatNo
                : `Beat ${sectorModalBeat.beatNo}`
            ] || EMPTY_SECTORS_FALLBACK
          }
          initialBeatNotes={
            beatNotesMap[
              sectorModalBeat.beatNo.startsWith('Beat')
                ? sectorModalBeat.beatNo
                : `Beat ${sectorModalBeat.beatNo}`
            ] || ''
          }
          onSave={(data) => {
            const beatKey = sectorModalBeat.beatNo.startsWith('Beat')
              ? sectorModalBeat.beatNo
              : `Beat ${sectorModalBeat.beatNo}`;

            const updatedNotes = { ...beatNotesMap, [beatKey]: data.beatNotes };
            const updatedSectors = { ...coloniesWithSectorsMap, [beatKey]: data.coloniesWithSectors };
            setBeatNotesMap(updatedNotes);
            setColoniesWithSectorsMap(updatedSectors);
            try {
              localStorage.setItem('postman_crm_beat_notes_v1', JSON.stringify(updatedNotes));
              localStorage.setItem('postman_crm_beat_sectors_v1', JSON.stringify(updatedSectors));
              if (data.sectorLandmarks) {
                localStorage.setItem(
                  'postman_crm_beat_sector_landmarks_v2',
                  JSON.stringify(data.sectorLandmarks)
                );
              }
            } catch {}

            const matchedProfile = allStaffProfiles.find(
              (s) =>
                s.beat.toLowerCase() === beatKey.toLowerCase() &&
                (s.officePincode || '').trim() === sectorModalBeat.pincode.trim()
            );
            if (matchedProfile) {
              staffPermissionService.saveStaffProfile({
                ...matchedProfile,
                assignedColonies: data.selectedColonies,
                assignedColoniesWithSectors: data.coloniesWithSectors,
                beatNotes: data.beatNotes,
              });
            }

            brandOwnerService.upsertManagedBeatAndAudit({
              officeId: sectorModalBeat.officeId,
              postOfficeName: sectorModalBeat.postOfficeName,
              officeType: sectorModalBeat.officeType,
              division: sectorModalBeat.division,
              circle: sectorModalBeat.circle,
              parentOffice: sectorModalBeat.parentOffice,
              pincode: sectorModalBeat.pincode,
              beatNo: sectorModalBeat.beatNo,
              beatTitle: sectorModalBeat.name,
              fixedKm: sectorModalBeat.fixedKm,
              colonies: data.selectedColonies,
              assignedStaffId: matchedProfile?.id,
              actorName,
            });

            const allMaster = masterDataService.getColonyMasterRecords();
            const previouslyMapped = sectorModalBeat.areasCovered || [];
            const unmappedColonies = previouslyMapped.filter(
              (col) => !data.selectedColonies.some((sel) => sel.toLowerCase() === col.toLowerCase())
            );

            unmappedColonies.forEach((colonyName) => {
              const matched = allMaster.find(
                (c) =>
                  c.colonyName.trim().toLowerCase() === colonyName.trim().toLowerCase() &&
                  c.pincode.trim() === sectorModalBeat.pincode.trim()
              );
              if (matched) {
                masterDataService.updateColonyMasterRecord(matched.id, {
                  assignedBeat: 'PENDING_ASSIGNMENT',
                });
              }
              staffPermissionService.unmapColonyFromBeat(colonyName, beatKey);
            });

            data.selectedColonies.forEach((colonyName) => {
              const matched = allMaster.find(
                (c) =>
                  c.colonyName.trim().toLowerCase() === colonyName.trim().toLowerCase() &&
                  c.pincode.trim() === sectorModalBeat.pincode.trim()
              );
              const customSectors = data.coloniesWithSectors[colonyName] || [];
              if (matched) {
                masterDataService.updateColonyMasterRecord(matched.id, {
                  assignedBeat: beatKey,
                  subSectors: customSectors.length > 0 ? customSectors : matched.subSectors,
                });
              } else {
                masterDataService.addColonyMasterRecord({
                  colonyName: colonyName.trim(),
                  entityType: 'Residential Colony',
                  pincode: sectorModalBeat.pincode,
                  division: (sectorModalBeat.division as any) || 'KOTA',
                  postOfficeName: sectorModalBeat.postOfficeName,
                  subSectors: customSectors,
                  assignedBeat: beatKey,
                  geoTag: {
                    lat: 25.1432,
                    lng: 75.8234,
                    googleMapsUrl: `https://www.google.com/maps?q=25.1432,75.8234`,
                  },
                });
              }
            });

            showToastNotice(
              `Saved colony mapping for Beat ${sectorModalBeat.beatNo} (${sectorModalBeat.postOfficeName}) and logged audit entry.`
            );
            refreshData();
          }}
        />
      )}
    </div>
  );
}
