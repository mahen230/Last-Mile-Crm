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
  Info,
  Filter,
  RefreshCw,
  Eye,
  Phone,
  GitBranch,
} from 'lucide-react';
import { BeatRecord, Customer, DynamicOfficeRecord, OfficeJurisdiction, StaffProfile } from '../../types/models';
import { customerService } from '../../services/customerService';
import {
  staffPermissionService,
  resolveOfficeMetadata,
} from '../../services/staffPermissionService';
import { useAuth } from '../auth/FirebaseAuthProvider';
import DirectMessageModal from './DirectMessageModal';
import { RAJASTHAN_CIRCLE_OFFICE_MASTER_LIST, RAJASTHAN_DIVISIONS } from '../../data/officesData';
import { COLONY_HIERARCHY_MAP } from '../../data/colonyHierarchyData';
import BeatMultiColonySectorModal from './BeatMultiColonySectorModal';
import { masterDataService } from '../../services/masterDataService';

export interface BeatCardItem extends BeatRecord {
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

const EMPTY_SECTORS_FALLBACK: Record<string, string[]> = {};

export default function BeatManagementView({
  onFilterBeat,
}: {
  onFilterBeat?: (beatNo: string) => void;
}) {
  const { userProfile } = useAuth();
  const isActualSuperAdmin = staffPermissionService.isSuperAdmin(userProfile);

  // Optional Role Simulation for Super Admin to verify Non-Admin / Postmaster Scoped View
  const [simulateNonAdminOfficeId, setSimulateNonAdminOfficeId] = useState<string | null>(null);
  const isSuperAdmin = isActualSuperAdmin && !simulateNonAdminOfficeId;

  const canDispatch = staffPermissionService.canAccessServiceModule(
    userProfile,
    'contentSharingDispatchSection'
  );

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dynamicBeats, setDynamicBeats] = useState<any[]>([]);
  const [dynamicOffices, setDynamicOffices] = useState<DynamicOfficeRecord[]>([]);
  const [allStaffProfiles, setAllStaffProfiles] = useState<StaffProfile[]>([]);

  // 1. Rajasthan Circle Interactive Hierarchy Filters (Circle -> Division -> Post Office -> Beat)
  const [selectedCircleFilter, setSelectedCircleFilter] = useState<string>('Rajasthan Circle');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>('ALL');
  const [selectedOfficeFilter, setSelectedOfficeFilter] = useState<string>('ALL');
  const [selectedBeatFilter, setSelectedBeatFilter] = useState<string>('ALL');

  // 2. Quick Search (by Office Name, Pincode, Beat Number, Postman, or Colony)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [beatStatusFilter, setBeatStatusFilter] = useState<string>('ALL');
  const [groupByOffice, setGroupByOffice] = useState<boolean>(true);

  // 3. Modals & Drawers
  const [showOfficeMappingDrawer, setShowOfficeMappingDrawer] = useState<boolean>(false);
  const [selectedBeatForModal, setSelectedBeatForModal] = useState<BeatCardItem | null>(null);
  const [beatModalSearch, setBeatModalSearch] = useState<string>('');
  const [activeMessageCustomer, setActiveMessageCustomer] = useState<Customer | null>(null);
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);

  // 4. Beat Broadcast Modal
  const [broadcastBeat, setBroadcastBeat] = useState<BeatCardItem | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);
  const [copiedBatch, setCopiedBatch] = useState<boolean>(false);

  // 5. Multi-Colony & Sector Mapping Modal State
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
  const [unmapNotice, setUnmapNotice] = useState<string | null>(null);

  const refreshData = () => {
    setCustomers([...customerService.getCustomers()]);
    setDynamicBeats([...staffPermissionService.getDynamicBeatsSummary()]);
    setDynamicOffices([...staffPermissionService.getDynamicOffices()]);
    setAllStaffProfiles([...staffPermissionService.getAllStaffProfiles()]);
  };

  // Safe Colony Unmapping Handler (Protected Master Register Rule: NEVER DELETE RECORD)
  const handleUnmapColonyFromBeat = (beat: BeatCardItem, colonyName: string) => {
    const beatKey = beat.beatNo.startsWith('Beat') ? beat.beatNo : `Beat ${beat.beatNo}`;

    // 1. Safe Unmapping from Master Record in masterDataService
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

    // 2. Remove from local sector map
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

    // 3. Unmap from staffPermissionService
    try {
      staffPermissionService.unmapColonyFromBeat(colonyName, beatKey);
      const matchedProfile = allStaffProfiles.find(
        (s) => s.beat.toLowerCase() === beatKey.toLowerCase()
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

    // 4. Notify staff with clear confirmation
    setUnmapNotice(
      `Colony "${colonyName}" unmapped from ${beatKey}. Record safely retained in Colony Master Register.`
    );
    setTimeout(() => {
      setUnmapNotice(null);
    }, 4500);

    refreshData();
  };

  useEffect(() => {
    refreshData();
    const unsubCust = customerService.subscribe(refreshData);
    const unsubStaff = staffPermissionService.subscribe(refreshData);
    const unsubMaster = masterDataService.subscribe(refreshData);
    return () => {
      unsubCust();
      unsubStaff();
      unsubMaster();
    };
  }, []);

  // Determine the Non-Admin Staff / Postmaster's locked officeId & postOfficeName
  const nonAdminAssignedOffice = useMemo(() => {
    if (simulateNonAdminOfficeId) {
      const meta = resolveOfficeMetadata(simulateNonAdminOfficeId);
      return meta;
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

  // Build canonical list of Post Offices / Delivery Hubs for the dropdown & switcher across Rajasthan Circle
  const officeHubOptions = useMemo<OfficeHubOption[]>(() => {
    const coreHubs: OfficeHubOption[] = RAJASTHAN_CIRCLE_OFFICE_MASTER_LIST.map((po) => ({
      officeId: po.officeId,
      postOfficeName: po.officeId === 'TALWANDI_SO' ? 'PIP Office / Talwandi S.O.' : po.name,
      officeType: po.type,
      pincode: po.pin,
      parentOfficeName: po.parentOffice,
      linkedDeliveryOffices:
        po.type === 'HO'
          ? [
              'Dadabari S.O. (324009)',
              'Baran H.O. (325205)',
              'Jhalawar H.O. (326001)',
              'Bundi H.O. (323001)',
              'Tonk H.O. (304001)',
            ]
          : [po.parentOffice],
      completeAddress: po.address,
      circle: po.circle,
      division: po.division,
      district: po.district,
      subDivision: po.subDivision,
    }));

    const seenIds = new Set(coreHubs.map((h) => h.officeId));
    dynamicOffices.forEach((o) => {
      const meta = resolveOfficeMetadata(o.officeName, o.branchOffice, o.pincode);
      if (!seenIds.has(meta.officeId)) {
        seenIds.add(meta.officeId);
        coreHubs.push({
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

    return coreHubs;
  }, [dynamicOffices]);

  // Build complete Beat Directory with Office & Linked Delivery Office mappings
  const allBeats = useMemo<BeatCardItem[]>(() => {
    const baseBeats: BeatCardItem[] = [
      {
        id: 'BEAT-DAD-1',
        beatNo: '1',
        name: 'Beat 1 — Dadabari Extension & Core Areas',
        officeId: 'DADABARI_SO',
        postOfficeName: 'Dadabari S.O.',
        officeType: 'SO',
        pincode: '324009',
        division: 'Kota Division',
        circle: 'Rajasthan Circle',
        parentOffice: 'Kota H.O. (324001)',
        linkedDeliveryOffices: ['Engineering College S.O. (324010)'],
        assignedPostman: 'Muskan Sharma',
        employeeId: '50510312',
        contact: '9521279186',
        fixedKm: 16,
        areasCovered: [
          'Dadabari Extension',
          'Jyoti Mandir',
          'Dadabari Dispensary',
          'Modi College',
          'Dadabari Sector 1',
          'Dadabari Sector 2',
          'P&T Colony Dadabari',
          'MSE SBI Bank Branch',
          'Post Office Dadabari',
          'Ghode Wala School',
          'Government School Dadabari',
        ],
        totalCustomers:
          customers?.filter((c) => c.beatNo === '1' || c.beatNo === 'Beat 1').length || 0,
        confirmedCoverage: '99.0%',
        coverageValue: 99.0,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      },
      {
        id: 'BEAT-DAD-2',
        beatNo: '2',
        name: 'Beat 2 — Keshavpura, Patel Nagar, Santoshi Nagar & Surroundings',
        officeId: 'DADABARI_SO',
        postOfficeName: 'Dadabari S.O.',
        officeType: 'SO',
        pincode: '324009',
        division: 'Kota Division',
        circle: 'Rajasthan Circle',
        parentOffice: 'Kota H.O. (324001)',
        linkedDeliveryOffices: ['Engineering College S.O. (324010)'],
        assignedPostman: 'Mahendra Kumar Meena',
        employeeId: '50457421',
        contact: '8769706002',
        fixedKm: 30,
        areasCovered: [
          'Keshavpura Sector 7',
          'Keshavpura Sector 6',
          'Patel Nagar',
          'Santoshi Nagar',
          'Tejaji Ke Mandir Ke Pass',
          'Ganesh Mandir Ke Pass',
          'Chauth Mata Mandir Ke Pass',
          'Shiv Ji Ke Mandir Ke Pass',
          'Jyoti Dry Clean Ki Gali',
          'Pahla Chauk',
          'Mamta Kirana',
          'Mahima Kirana',
          'Ramdev Mandir Ke Pass',
          'Akashya Kirana Ki Gali',
          'Radhe Mens Parlor Ki Gali',
          'TVS Circle',
          'Patel Market',
          'Keshav Market',
          'UIT Market',
        ],
        totalCustomers:
          customers?.filter(
            (c) => c.beatNo === '2' || c.beatNo === 'Beat 2' || !c.beatNo
          ).length || 0,
        confirmedCoverage: '98.4%',
        coverageValue: 98.4,
        status: 'Active Daily Delivery',
        assignedStaffCount: 2,
      },
      {
        id: 'BEAT-DAD-3',
        beatNo: '3',
        name: 'Beat 3 — Basant Vihar Sector A & B & CAD Circle',
        officeId: 'DADABARI_SO',
        postOfficeName: 'Dadabari S.O.',
        officeType: 'SO',
        pincode: '324009',
        division: 'Kota Division',
        circle: 'Rajasthan Circle',
        parentOffice: 'Kota H.O. (324001)',
        linkedDeliveryOffices: ['Engineering College S.O. (324010)'],
        assignedPostman: 'Manali Ahuja',
        employeeId: '50510313',
        contact: '7014408315',
        fixedKm: 15,
        areasCovered: [
          'Basant Vihar Sector A',
          'Basant Vihar Sector B',
          'CAD Colony',
          'Basant Vihar Park',
        ],
        totalCustomers:
          customers?.filter((c) => c.beatNo === '3' || c.beatNo === 'Beat 3').length || 0,
        confirmedCoverage: '97.5%',
        coverageValue: 97.5,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      },
      {
        id: 'BEAT-DAD-4',
        beatNo: '4',
        name: 'Beat 4 — Shastri Nagar & Dadabari Main Market',
        officeId: 'DADABARI_SO',
        postOfficeName: 'Dadabari S.O.',
        officeType: 'SO',
        pincode: '324009',
        division: 'Kota Division',
        circle: 'Rajasthan Circle',
        parentOffice: 'Kota H.O. (324001)',
        linkedDeliveryOffices: ['Engineering College S.O. (324010)'],
        assignedPostman: 'Govind Prasad',
        employeeId: '10310735',
        contact: '7877352816',
        fixedKm: 20,
        areasCovered: [
          'Shastri Nagar Main Sector',
          'Shastri Market',
          'Community Hall Area',
          'Dadabari Main Market',
        ],
        totalCustomers:
          customers?.filter((c) => c.beatNo === '4' || c.beatNo === 'Beat 4').length || 0,
        confirmedCoverage: '97.8%',
        coverageValue: 97.8,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      },
      {
        id: 'BEAT-DAD-6',
        beatNo: '6',
        name: 'Beat 6 — Keshavpura Sector 4, Sector 2 & Teacher Colony',
        officeId: 'DADABARI_SO',
        postOfficeName: 'Dadabari S.O.',
        officeType: 'SO',
        pincode: '324009',
        division: 'Kota Division',
        circle: 'Rajasthan Circle',
        parentOffice: 'Kota H.O. (324001)',
        linkedDeliveryOffices: ['Engineering College S.O. (324010)'],
        assignedPostman: 'Ramkishan Meghwal',
        employeeId: '10317473',
        contact: '9664215130',
        fixedKm: 22,
        areasCovered: [
          'Keshavpura Sector 4',
          'Keshavpura Sector 2',
          'Teacher Colony',
          'Shopping Centre',
        ],
        totalCustomers:
          customers?.filter((c) => c.beatNo === '6' || c.beatNo === 'Beat 6').length || 0,
        confirmedCoverage: '96.2%',
        coverageValue: 96.2,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      },
      {
        id: 'BEAT-EC-1',
        beatNo: 'EC-1',
        name: 'Beat EC-1 — RTU Campus, Srinathpuram & Akelgarh',
        officeId: 'ENG_COLLEGE_SO',
        postOfficeName: 'Engineering College S.O.',
        officeType: 'SO',
        pincode: '324010',
        division: 'Kota Division',
        circle: 'Rajasthan Circle',
        parentOffice: 'Kota H.O. (324001)',
        linkedDeliveryOffices: ['Dadabari S.O. (324009)'],
        assignedPostman: 'Vikram Singh Hada',
        employeeId: 'CSI-10448901',
        contact: '9414188210',
        fixedKm: 20,
        areasCovered: [
          'RTU Campus',
          'Srinathpuram Sector A',
          'Srinathpuram Sector B',
          'Akelgarh Water Works',
          'Rawatbhata Road Institutional Area',
        ],
        totalCustomers:
          customers?.filter(
            (c) =>
              c.beatNo === 'EC-1' ||
              c.beatNo === 'Beat EC-1' ||
              c.pincode === '324010' ||
              c.officeId === 'ENG_COLLEGE_SO'
          ).length || 0,
        confirmedCoverage: '97.2%',
        coverageValue: 97.2,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      },
      {
        id: 'BEAT-EC-2',
        beatNo: 'EC-2',
        name: 'Beat EC-2 — Rawatbhata Road & Rathkankra Belt',
        officeId: 'ENG_COLLEGE_SO',
        postOfficeName: 'Engineering College S.O.',
        officeType: 'SO',
        pincode: '324010',
        division: 'Kota Division',
        circle: 'Rajasthan Circle',
        parentOffice: 'Kota H.O. (324001)',
        linkedDeliveryOffices: ['Dadabari S.O. (324009)'],
        assignedPostman: 'Suresh Chandra Verma',
        employeeId: 'CSI-10448902',
        contact: '9829077412',
        fixedKm: 18,
        areasCovered: [],
        totalCustomers:
          customers?.filter((c) => c.beatNo === 'EC-2' || c.beatNo === 'Beat EC-2').length || 0,
        confirmedCoverage: '96.4%',
        coverageValue: 96.4,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      },
      {
        id: 'BEAT-PIP-14',
        beatNo: '14',
        name: 'Beat 14 — Jawahar Nagar & Coaching Hub',
        officeId: 'TALWANDI_SO',
        postOfficeName: 'PIP Office / Talwandi S.O.',
        officeType: 'SO',
        pincode: '324005',
        division: 'Kota Division',
        circle: 'Rajasthan Circle',
        parentOffice: 'Kota H.O. (324001)',
        linkedDeliveryOffices: ['Vigyan Nagar S.O. (324005)', 'Mahaveer Nagar S.O. (324005)'],
        assignedPostman: 'Rajesh Kumar Nagar',
        employeeId: 'CSI-10449214',
        contact: '9414281400',
        fixedKm: 20,
        areasCovered: [],
        totalCustomers:
          customers?.filter((c) => c.beatNo === '14' || c.beatNo === 'Beat 14').length || 0,
        confirmedCoverage: '98.1%',
        coverageValue: 98.1,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      },
      {
        id: 'BEAT-PIP-1',
        beatNo: 'PIP-1',
        name: 'Beat PIP-1 — Talwandi Sector A-C & Commerce Zone',
        officeId: 'TALWANDI_SO',
        postOfficeName: 'PIP Office / Talwandi S.O.',
        officeType: 'SO',
        pincode: '324005',
        division: 'Kota Division',
        circle: 'Rajasthan Circle',
        parentOffice: 'Kota H.O. (324001)',
        linkedDeliveryOffices: ['Vigyan Nagar S.O. (324005)', 'Mahaveer Nagar S.O. (324005)'],
        assignedPostman: 'Hemant Singh Chouhan',
        employeeId: 'CSI-10449215',
        contact: '9829088501',
        fixedKm: 19,
        areasCovered: [],
        totalCustomers:
          customers?.filter((c) => c.beatNo === 'PIP-1' || c.beatNo === 'Beat PIP-1').length || 0,
        confirmedCoverage: '97.6%',
        coverageValue: 97.6,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      },
      // Baran Division Beats
      {
        id: 'BEAT-BAR-1',
        beatNo: 'BAR-1',
        name: 'Beat 1 — Baran H.O. (Pratap Chowk & Civil Lines)',
        officeId: 'BARAN_HO',
        postOfficeName: 'Baran H.O.',
        officeType: 'HO',
        pincode: '325205',
        circle: 'Rajasthan Circle',
        division: 'Baran Division',
        district: 'Baran',
        subDivision: 'Baran North Sub-Division',
        parentOffice: 'Baran Division, Rajasthan Circle',
        linkedDeliveryOffices: ['Baran City S.O. (325205)'],
        assignedPostman: 'Ramprasad Meena',
        employeeId: 'CSI-BAR-01',
        contact: '9414589201',
        fixedKm: 18,
        areasCovered: ['Pratap Chowk', 'Civil Lines Baran', 'Collectorate Circle', 'Dharmada Chauraha'],
        totalCustomers: customers?.filter((c) => c.beatNo?.includes('BAR-1') || c.pincode === '325205').length || 0,
        confirmedCoverage: '98.0%',
        coverageValue: 98.0,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      },
      {
        id: 'BEAT-ANTA-1',
        beatNo: 'ANTA-1',
        name: 'Beat 1 — Anta S.O. (NTPC Township & Siswali Road)',
        officeId: 'ANTA_SO',
        postOfficeName: 'Anta S.O.',
        officeType: 'SO',
        pincode: '325202',
        circle: 'Rajasthan Circle',
        division: 'Baran Division',
        district: 'Baran',
        subDivision: 'Baran North Sub-Division',
        parentOffice: 'Baran H.O. (325205)',
        linkedDeliveryOffices: ['Baran H.O. (325205)'],
        assignedPostman: 'Dinesh Kumar Sharma',
        employeeId: 'CSI-BAR-02',
        contact: '9829145672',
        fixedKm: 20,
        areasCovered: ['NTPC Power Complex', 'Siswali Road', 'Balaji Temple Anta', 'Old Mandi'],
        totalCustomers: customers?.filter((c) => c.beatNo?.includes('ANTA') || c.pincode === '325202').length || 0,
        confirmedCoverage: '97.0%',
        coverageValue: 97.0,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      },
      // Jhalawar Division Beats
      {
        id: 'BEAT-JHL-1',
        beatNo: 'JHL-1',
        name: 'Beat 1 — Jhalawar H.O. (Garh Palace & Mama Bhanja)',
        officeId: 'JHALAWAR_HO',
        postOfficeName: 'Jhalawar H.O.',
        officeType: 'HO',
        pincode: '326001',
        circle: 'Rajasthan Circle',
        division: 'Jhalawar Division',
        district: 'Jhalawar',
        subDivision: 'Jhalawar City Sub-Division',
        parentOffice: 'Jhalawar Division, Rajasthan Circle',
        linkedDeliveryOffices: ['Jhalrapatan S.O. (326023)'],
        assignedPostman: 'Kailash Chand Verma',
        employeeId: 'CSI-JHL-01',
        contact: '9414234567',
        fixedKm: 16,
        areasCovered: ['Mama Bhanja Chauraha', 'Garh Palace Area', 'Brijraj Nagar', 'Mangalpura'],
        totalCustomers: customers?.filter((c) => c.beatNo?.includes('JHL-1') || c.pincode === '326001').length || 0,
        confirmedCoverage: '98.5%',
        coverageValue: 98.5,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      },
      {
        id: 'BEAT-PATAN-1',
        beatNo: 'PATAN-1',
        name: 'Beat 1 — Jhalrapatan S.O. (City of Temple Bells)',
        officeId: 'JHALRAPATAN_SO',
        postOfficeName: 'Jhalrapatan S.O.',
        officeType: 'SO',
        pincode: '326023',
        circle: 'Rajasthan Circle',
        division: 'Jhalawar Division',
        district: 'Jhalawar',
        subDivision: 'Jhalawar City Sub-Division',
        parentOffice: 'Jhalawar H.O. (326001)',
        linkedDeliveryOffices: ['Jhalawar H.O. (326001)'],
        assignedPostman: 'Manish Patidar',
        employeeId: 'CSI-JHL-02',
        contact: '9784123456',
        fixedKm: 18,
        areasCovered: ['Surajpole Gate', 'Dwarikadhish Temple Road', 'Chandrabhaga Road', 'Gomti Sagar'],
        totalCustomers: customers?.filter((c) => c.beatNo?.includes('PATAN') || c.pincode === '326023').length || 0,
        confirmedCoverage: '97.5%',
        coverageValue: 97.5,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      },
      // Bundi Division Beats
      {
        id: 'BEAT-BND-1',
        beatNo: 'BND-1',
        name: 'Beat 1 — Bundi H.O. (Sadar Bazar & Lanka Gate)',
        officeId: 'BUNDI_HO',
        postOfficeName: 'Bundi H.O.',
        officeType: 'HO',
        pincode: '323001',
        circle: 'Rajasthan Circle',
        division: 'Bundi Division',
        district: 'Bundi',
        subDivision: 'Bundi Central Sub-Division',
        parentOffice: 'Bundi Division, Rajasthan Circle',
        linkedDeliveryOffices: ['Keshoraipatan S.O. (323601)'],
        assignedPostman: 'Om Prakash Saini',
        employeeId: 'CSI-BND-01',
        contact: '9460123789',
        fixedKm: 17,
        areasCovered: ['Sadar Bazar Bundi', 'Lanka Gate', 'Khoja Gate', 'Vikas Nagar'],
        totalCustomers: customers?.filter((c) => c.beatNo?.includes('BND-1') || c.pincode === '323001').length || 0,
        confirmedCoverage: '99.0%',
        coverageValue: 99.0,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      },
      {
        id: 'BEAT-KPATAN-1',
        beatNo: 'KPATAN-1',
        name: 'Beat 1 — Keshoraipatan S.O. (Chambal Ghat & Sugar Mill)',
        officeId: 'KESHORAIPATAN_SO',
        postOfficeName: 'Keshoraipatan S.O.',
        officeType: 'SO',
        pincode: '323601',
        circle: 'Rajasthan Circle',
        division: 'Bundi Division',
        district: 'Bundi',
        subDivision: 'Bundi Central Sub-Division',
        parentOffice: 'Bundi H.O. (323001)',
        linkedDeliveryOffices: ['Bundi H.O. (323001)'],
        assignedPostman: 'Rameshwar Dayal',
        employeeId: 'CSI-BND-02',
        contact: '9828345671',
        fixedKm: 19,
        areasCovered: ['Keshorai Temple Ghat', 'Sugar Mill Housing', 'Station Road Patan', 'Main Market'],
        totalCustomers: customers?.filter((c) => c.beatNo?.includes('KPATAN') || c.pincode === '323601').length || 0,
        confirmedCoverage: '96.8%',
        coverageValue: 96.8,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      },
      // Tonk Division Beats
      {
        id: 'BEAT-TNK-1',
        beatNo: 'TNK-1',
        name: 'Beat 1 — Tonk H.O. (Nazar Bagh & Civil Lines)',
        officeId: 'TONK_HO',
        postOfficeName: 'Tonk H.O.',
        officeType: 'HO',
        pincode: '304001',
        circle: 'Rajasthan Circle',
        division: 'Tonk Division',
        district: 'Tonk',
        subDivision: 'Tonk City Sub-Division',
        parentOffice: 'Tonk Division, Rajasthan Circle',
        linkedDeliveryOffices: ['Niwai S.O. (304021)'],
        assignedPostman: 'Abdul Hameed',
        employeeId: 'CSI-TNK-01',
        contact: '9414345678',
        fixedKm: 18,
        areasCovered: ['Nazar Bagh', 'Civil Lines Tonk', 'Subhash Bazar', 'Bada Bazar'],
        totalCustomers: customers?.filter((c) => c.beatNo?.includes('TNK-1') || c.pincode === '304001').length || 0,
        confirmedCoverage: '98.2%',
        coverageValue: 98.2,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      },
      {
        id: 'BEAT-NIWAI-1',
        beatNo: 'NIWAI-1',
        name: 'Beat 1 — Niwai S.O. (Banasthali Link & Mandi Yard)',
        officeId: 'NIWAI_SO',
        postOfficeName: 'Niwai S.O.',
        officeType: 'SO',
        pincode: '304021',
        circle: 'Rajasthan Circle',
        division: 'Tonk Division',
        district: 'Tonk',
        subDivision: 'Tonk City Sub-Division',
        parentOffice: 'Tonk H.O. (304001)',
        linkedDeliveryOffices: ['Tonk H.O. (304001)'],
        assignedPostman: 'Satyanarayan Jat',
        employeeId: 'CSI-TNK-02',
        contact: '9829456123',
        fixedKm: 21,
        areasCovered: ['Mandi Yard Niwai', 'Banasthali Link Road', 'Bhagat Singh Circle', 'Jain Mandir Road'],
        totalCustomers: customers?.filter((c) => c.beatNo?.includes('NIWAI') || c.pincode === '304021').length || 0,
        confirmedCoverage: '97.1%',
        coverageValue: 97.1,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      },
    ];

    // Strict Relational & Pincode-Isolated Colony Resolver: Zero-Junk Display Rule
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

    const getBoundColoniesForBeat = (beatNoStr: string, officePincode?: string, _officeName?: string) => {
      const cleanNo = beatNoStr.replace(/^Beat\s+/i, '').trim();
      const rawKey = cleanNo.toLowerCase();
      const cleanOfficePin = (officePincode || '').trim();

      const mappedColonies = new Set<string>();

      // 1. From coloniesWithSectorsMap (configured via Multi-Colony & Sector Mapping modal), strictly scoped by exact Pincode
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

      // 2. From masterDataService (ColonyMasterRecord with assignedBeat strictly matching exact Pincode)
      try {
        const allColonies = masterDataService.getColonyMasterRecords();
        allColonies.forEach((col) => {
          if (col.assignedBeat && col.assignedBeat !== 'PENDING_ASSIGNMENT') {
            const assignedClean = col.assignedBeat.replace(/^Beat\s+/i, '').trim().toLowerCase();
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
      } catch (e) {
        console.warn('Error reading master colonies for beat:', e);
      }

      // 3. From staffPermissionService colony-beat mappings, strictly scoped by exact Pincode
      try {
        const beatMappings = staffPermissionService.getColonyBeatMappings();
        beatMappings.forEach((m) => {
          if (m.beatNumber) {
            const mappedClean = m.beatNumber.replace(/^Beat\s+/i, '').trim().toLowerCase();
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
      } catch (e) {
        console.warn('Error reading staffPermission colony beat mappings:', e);
      }

      return Array.from(mappedColonies);
    };

    const resolvedBaseBeats: BeatCardItem[] = baseBeats.map((b) => ({
      ...b,
      areasCovered: getBoundColoniesForBeat(b.beatNo, b.pincode, b.postOfficeName),
    }));

    // Merge any additional dynamically created beats from staff/colony mappings
    const existingBeatKeys = new Set(resolvedBaseBeats.map((b) => b.beatNo.toLowerCase()));
    dynamicBeats.forEach((db) => {
      const cleanNo = db.beatNumber.replace(/^Beat\s+/i, '').trim();
      const matchExisting = resolvedBaseBeats.find(
        (b) =>
          b.beatNo.toLowerCase() === cleanNo.toLowerCase() ||
          `beat ${b.beatNo}`.toLowerCase() === db.beatNumber.toLowerCase()
      );
      if (matchExisting) {
        const dynamicallyMapped = getBoundColoniesForBeat(
          cleanNo,
          matchExisting.pincode,
          matchExisting.postOfficeName
        );
        dynamicallyMapped.forEach((col) => {
          if (!matchExisting.areasCovered.includes(col)) {
            matchExisting.areasCovered.push(col);
          }
        });
      } else if (!existingBeatKeys.has(cleanNo.toLowerCase())) {
        existingBeatKeys.add(cleanNo.toLowerCase());
        const meta = resolveOfficeMetadata(db.officeName, '', db.pincode);
        resolvedBaseBeats.push({
          id: `BEAT-DYN-${cleanNo}`,
          beatNo: cleanNo,
          name: `${db.beatNumber} — ${meta.postOfficeName}`,
          officeId: meta.officeId,
          postOfficeName: meta.postOfficeName,
          officeType: meta.officeType,
          pincode: db.pincode || meta.pincode,
          division: meta.division || 'Kota Division',
          circle: meta.circle || 'Rajasthan Circle',
          parentOffice: meta.parentOfficeName,
          linkedDeliveryOffices: meta.linkedDeliveryOffices,
          assignedPostman: db.assignedStaff[0]?.name || 'Assigned Postman',
          employeeId: db.assignedStaff[0]?.employeeId || 'CSI-STAFF',
          contact: db.assignedStaff[0]?.contact || '9414000000',
          fixedKm: db.assignedStaff[0]?.fixedKm || 18,
          areasCovered: getBoundColoniesForBeat(cleanNo, db.pincode || meta.pincode, meta.postOfficeName),
          totalCustomers:
            customers?.filter((c) => c.beatNo === cleanNo || c.beatNo === db.beatNumber).length ||
            0,
          confirmedCoverage: '95.0%',
          coverageValue: 95.0,
          status: 'Auto-Synced Beat',
          assignedStaffCount: Math.max(db.assignedStaff?.length || 1, 1),
        });
      }
    });

    return resolvedBaseBeats;
  }, [customers, dynamicBeats, coloniesWithSectorsMap]);

  // Effective Office Filter:
  // - If Super Admin: uses `selectedOfficeFilter` ('ALL' or specific officeId)
  // - If Non-Admin Staff / Postmaster: strictly locked to their assigned `officeId` / `postOfficeName`
  const effectiveOfficeFilter = isSuperAdmin
    ? selectedOfficeFilter
    : nonAdminAssignedOffice.officeId;

  // Available offices based on selected division filter
  const availableOfficesForDivision = useMemo(() => {
    if (selectedDivisionFilter === 'ALL') return officeHubOptions;
    return officeHubOptions.filter(
      (h) => h.division === selectedDivisionFilter || (h.parentOfficeName && h.parentOfficeName.includes(selectedDivisionFilter))
    );
  }, [officeHubOptions, selectedDivisionFilter]);

  // Available beats based on division & office selection
  const availableBeatsForSelection = useMemo(() => {
    return allBeats.filter((b) => {
      if (selectedDivisionFilter !== 'ALL') {
        const meta = resolveOfficeMetadata(b.postOfficeName, '', b.pincode);
        if ((b.division || meta.division) !== selectedDivisionFilter) return false;
      }
      if (effectiveOfficeFilter !== 'ALL' && b.officeId !== effectiveOfficeFilter) {
        return false;
      }
      return true;
    });
  }, [allBeats, selectedDivisionFilter, effectiveOfficeFilter]);

  // Role-Based & Office-Based Filtered Beats
  const filteredBeats = useMemo<BeatCardItem[]>(() => {
    return allBeats.filter((beat) => {
      // 0. Circle Filter
      if (selectedCircleFilter !== 'ALL' && beat.circle && beat.circle !== selectedCircleFilter) {
        return false;
      }

      // 1. Division Filter (for Super Admin)
      if (selectedDivisionFilter !== 'ALL') {
        const beatMeta = resolveOfficeMetadata(beat.postOfficeName, '', beat.pincode);
        const beatDivision = beat.division || beatMeta.division;
        if (beatDivision !== selectedDivisionFilter) {
          return false;
        }
      }

      // 2. Strict Office Restriction for Non-Admins OR Selected Office for Super Admin
      if (effectiveOfficeFilter !== 'ALL') {
        const matchesDirectOffice = beat.officeId === effectiveOfficeFilter;

        // For Non-Admin: check if they are strictly assigned to a single beat or office
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

          // If non-admin is a Postman (not Postmaster/Admin/SPM) with specific allowedBeats, filter to their beats
          const isPostmasterOrAdmin =
            userProfile.role === 'POSTMASTER' ||
            userProfile.role === 'ADMIN' ||
            userProfile.designationType?.toLowerCase().includes('postmaster') ||
            userProfile.designationType?.toLowerCase().includes('spm') ||
            userProfile.designationType?.toLowerCase().includes('inspector');

          if (!isPostmasterOrAdmin) {
            const allowedBeats = userProfile.permissions?.allowedBeats || [userProfile.beat];
            const hasAllBeats =
              allowedBeats.includes('ALL') || allowedBeats.includes('All Beats');
            if (!hasAllBeats && allowedBeats.length > 0) {
              const beatMatch = allowedBeats.some(
                (ab) =>
                  ab.toLowerCase() === beat.beatNo.toLowerCase() ||
                  ab.toLowerCase() === `beat ${beat.beatNo}`.toLowerCase()
              );
              // Keep either their assigned beat or beats in their exact assigned office if they are PA/Office staff
              if (userProfile.role === 'POSTMAN' && !beatMatch) {
                return false;
              }
            }
          }
        } else {
          // Super Admin with specific office selected or Simulated Non-Admin Office
          if (!matchesDirectOffice) {
            return false;
          }
        }
      }

      // 3. Beat / Colony Filter
      if (selectedBeatFilter !== 'ALL') {
        const cleanB = selectedBeatFilter.replace(/^Beat\s+/i, '').trim().toLowerCase();
        const matchesBeatNo =
          beat.beatNo.toLowerCase() === cleanB ||
          `beat ${beat.beatNo}`.toLowerCase() === selectedBeatFilter.toLowerCase();
        const matchesColony = beat.areasCovered.some(
          (area) => area.toLowerCase().includes(selectedBeatFilter.toLowerCase())
        );
        if (!matchesBeatNo && !matchesColony) {
          return false;
        }
      }

      // 4. Status Filter
      if (beatStatusFilter !== 'ALL' && beat.status !== beatStatusFilter) {
        return false;
      }

      // 3. Quick Search by Office Name, Pincode, Beat Number, Postman, or Colony
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
    selectedBeatFilter,
    effectiveOfficeFilter,
    isSuperAdmin,
    userProfile,
    simulateNonAdminOfficeId,
    beatStatusFilter,
    searchQuery,
  ]);

  // Compute active "Office Beat & Delivery Link Summary" metrics
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
            completeAddress: `${nonAdminAssignedOffice.postOfficeName} - ${nonAdminAssignedOffice.pincode}`,
          };

    const totalMappedBeats = filteredBeats.length;

    const linkedOfficesSet = new Set<string>();
    if (activeHub) {
      activeHub.linkedDeliveryOffices.forEach((lo) => linkedOfficesSet.add(lo));
    } else {
      officeHubOptions.forEach((h) => {
        if (h.officeType === 'SO' || h.officeType === 'BO') {
          linkedOfficesSet.add(`${h.postOfficeName} (${h.pincode})`);
        }
      });
    }

    const avgCoverage =
      filteredBeats.length > 0
        ? (
            filteredBeats.reduce((acc, b) => acc + b.coverageValue, 0) /
            filteredBeats.length
          ).toFixed(1)
        : '97.5';

    // Count assigned delivery staff for this office scope
    const matchingStaffProfiles = allStaffProfiles.filter((sp) => {
      if (effectiveOfficeFilter === 'ALL') return true;
      const spMeta = resolveOfficeMetadata(
        sp.postOfficeName || sp.branchOffice || sp.subOffice || sp.assignedOffice,
        sp.branchOffice,
        sp.officePincode
      );
      return spMeta.officeId === effectiveOfficeFilter;
    });

    const staffCount = Math.max(
      matchingStaffProfiles.length,
      filteredBeats.reduce((sum, b) => sum + b.assignedStaffCount, 0)
    );

    return {
      parentOfficeName: activeHub
        ? `${activeHub.postOfficeName} (${activeHub.officeType})`
        : 'Kota Division — All Delivery Hubs (HO / SO / BO)',
      pincode: activeHub ? activeHub.pincode : '324001 • 324009 • 324010 • 325003',
      higherParentHo: activeHub ? activeHub.parentOfficeName : 'Rajasthan Postal Circle',
      totalMappedBeats,
      linkedDeliveryOffices: Array.from(linkedOfficesSet),
      totalCoveragePercentage: `${avgCoverage}%`,
      assignedDeliveryStaffCount: staffCount,
      completeAddress: activeHub
        ? activeHub.completeAddress
        : 'Kota Head Post Office, Dadabari S.O., Engineering College S.O.',
    };
  }, [
    effectiveOfficeFilter,
    officeHubOptions,
    nonAdminAssignedOffice,
    filteredBeats,
    allStaffProfiles,
  ]);

  // Group filteredBeats by Post Office for clean Office-wise Grouping
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

    filteredBeats.forEach((beat) => {
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
  }, [filteredBeats]);

  // Customers for the selected beat modal
  const beatCustomers = useMemo(() => {
    if (!selectedBeatForModal) return [];
    const bNo = selectedBeatForModal.beatNo;
    return customers.filter((c) => {
      const matchBeat =
        bNo === '2'
          ? c.beatNo === '2' || c.beatNo === 'Beat 2' || !c.beatNo
          : c.beatNo === bNo ||
            c.beatNo === `Beat ${bNo}` ||
            (bNo.startsWith('EC') && c.pincode === '324010');

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

  const handleOpenBroadcast = (beat: BeatCardItem) => {
    setBroadcastBeat(beat);
    const defaultText = `🇮🇳 *भारतीय डाक - बीट ${beat.beatNo} (${beat.postOfficeName} - ${beat.pincode}) विशेष सूचना*\n\nआदरणीय निवासीगण (${beat.name}),\nडाक विभाग (${beat.postOfficeName}) द्वारा आपके क्षेत्र में विशेष डोरस्टेप आधार अपडेशन (CELC), सुकन्या समृद्धि खाता (SSA), डाक जीवन बीमा (PLI/RPLI) एवं बचत खाता शिविर आयोजित किया जा रहा है।\n\n📌 बीट डाकिया संपर्क: ${beat.assignedPostman} (${beat.contact})\n📍 डाकघर: ${beat.postOfficeName} (PIN: ${beat.pincode})`;
    setBroadcastMessage(defaultText);
  };

  const handleCopyAllBeatMobiles = (beatNo: string) => {
    const list = customers
      .filter((c) =>
        beatNo === '2'
          ? c.beatNo === '2' || c.beatNo === 'Beat 2' || !c.beatNo
          : c.beatNo === beatNo || c.beatNo === `Beat ${beatNo}`
      )
      .map((c) => c.mobile)
      .filter(Boolean);

    navigator.clipboard.writeText(list.join(', '));
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2000);
  };

  const renderBeatCard = (beat: BeatCardItem) => (
    <div
      key={beat.id}
      className="bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition p-5 flex flex-col justify-between"
    >
      <div>
        {/* Card Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono font-bold text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-lg border border-red-200">
              BEAT {beat.beatNo}
            </span>
            <span
              className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-md border ${
                beat.officeType === 'BO'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              {beat.postOfficeName} • {beat.pincode}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full shrink-0">
            {beat.status}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 text-sm mb-1">{beat.name}</h3>
        <p className="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
          <Building2 size={12} className="text-slate-400 shrink-0" />
          <span>Parent Hub: {beat.parentOffice}</span>
        </p>

        {/* Linked Delivery Offices Pill Strip */}
        {beat.linkedDeliveryOffices.length > 0 && (
          <div className="mb-3 p-2 bg-slate-50/90 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1">
              <GitBranch size={11} className="text-red-700" />
              Linked Delivery Offices (SO / BO):
            </span>
            <div className="flex flex-wrap gap-1">
              {beat.linkedDeliveryOffices.map((lo, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-semibold px-2 py-0.5 bg-white text-slate-700 rounded-md border border-slate-200"
                >
                  {lo}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Customers</span>
            <span className="text-sm font-black text-slate-900">{beat.totalCustomers}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Coverage</span>
            <span className="text-sm font-black text-emerald-700">{beat.confirmedCoverage}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-semibold">Fixed Route</span>
            <span className="text-sm font-black text-slate-800">{beat.fixedKm} KM</span>
          </div>
        </div>

        {/* Postman & Office Association Details */}
        <div className="space-y-1.5 text-xs text-slate-700 mb-3 bg-red-50/40 p-2.5 rounded-xl border border-red-100/80">
          <div className="text-[11px] flex items-center justify-between">
            <strong className="text-slate-500">Official Office:</strong>
            <span className="text-slate-900 font-bold flex items-center gap-1">
              <Building2 size={12} className="text-red-700" />
              {beat.postOfficeName} ({beat.pincode})
            </span>
          </div>
          <div className="text-[11px] flex items-center justify-between">
            <strong className="text-slate-500">Authorized Postman:</strong>
            <span className="text-slate-900 font-bold flex items-center gap-1">
              <span>{beat.assignedPostman}</span>
              {beat.employeeId && (
                <span className="font-mono text-[10px] text-slate-500 font-normal">({beat.employeeId})</span>
              )}
            </span>
          </div>
          <div className="text-[11px] flex items-center justify-between">
            <span className="text-slate-500">Active Route:</span>
            <span className="font-mono text-emerald-800 font-bold">{beat.fixedKm} KM/day</span>
          </div>
          <div className="text-[11px] flex items-center justify-between">
            <span className="text-slate-500">Official Mobile:</span>
            <a
              href={`tel:${beat.contact}`}
              className="font-mono text-blue-700 font-semibold hover:underline flex items-center gap-1"
            >
              <Phone size={11} />
              {beat.contact}
            </a>
          </div>
        </div>

        {/* Delivery Localities Preview */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-500 block text-[11px] font-semibold">
              Mapped Colonies & Sectors ({beat.areasCovered.length}):
            </span>
            {beat.areasCovered.length > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Bound
              </span>
            )}
          </div>

          {beat.areasCovered.length === 0 ? (
            <div className="p-3 my-1.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-slate-500">
              <MapPin className="w-4 h-4 text-slate-400 mx-auto mb-1 opacity-70" />
              <p className="text-xs font-bold text-slate-700">No colonies mapped yet. Link via Colony Directory.</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Click 'Multi-Colony & Sector Mapping' to assign.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-1">
                {beat.areasCovered.slice(0, 5).map((a: string, i: number) => (
                  <span
                    key={i}
                    className="group/chip inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-200/60 rounded text-[10px] font-semibold"
                  >
                    <span>{a}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnmapColonyFromBeat(beat, a);
                      }}
                      title={`Unmap "${a}" from Beat ${beat.beatNo} (Master colony record will be safely retained)`}
                      className="text-blue-400 hover:text-red-700 hover:bg-red-50 rounded p-0.5 transition cursor-pointer"
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

              {/* Granular Micro-Pockets Preview */}
              {(() => {
                const beatKey = beat.beatNo.startsWith('Beat') ? beat.beatNo : `Beat ${beat.beatNo}`;
                const sectorsRecord = coloniesWithSectorsMap[beatKey] || coloniesWithSectorsMap[beat.beatNo] || {};
                const microList: string[] = [];
                Object.entries(sectorsRecord).forEach(([cName, pList]) => {
                  if (Array.isArray(pList)) {
                    pList.forEach((p: string) => microList.push(`${cName}: ${p}`));
                  }
                });

                if (microList.length === 0) {
                  try {
                    const allColonies = masterDataService.getColonyMasterRecords();
                    beat.areasCovered.forEach((cName) => {
                      const matched = allColonies.find(
                        (c) =>
                          c.colonyName.toLowerCase() === cName.toLowerCase() &&
                          c.pincode.trim() === beat.pincode.trim()
                      );
                      if (matched && matched.subSectors) {
                        matched.subSectors.slice(0, 2).forEach((s) => microList.push(`${matched.colonyName} ${s}`));
                      }
                    });
                  } catch {}
                }

                if (microList.length > 0) {
                  return (
                    <div className="pt-1 flex flex-wrap gap-1 text-[9px] text-slate-600">
                      <span className="text-[9px] text-slate-400 font-bold uppercase self-center mr-0.5">Pockets:</span>
                      {microList.slice(0, 3).map((item, mIdx) => (
                        <span key={mIdx} className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                          {item}
                        </span>
                      ))}
                      {microList.length > 3 && (
                        <span className="text-slate-400 font-semibold self-center">
                          +{microList.length - 3} more
                        </span>
                      )}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 mt-4 border-t border-slate-100 flex flex-col gap-2">
        {/* Extra Remarks & Beat Notes Preview */}
        {beatNotesMap[beat.beatNo.startsWith('Beat') ? beat.beatNo : `Beat ${beat.beatNo}`] && (
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-[10px] leading-relaxed space-y-0.5">
            <span className="font-bold block text-amber-900 flex items-center gap-1">
              <Sparkles size={11} className="text-amber-600 shrink-0" />
              <span>Operational Beat Notes:</span>
            </span>
            <p className="line-clamp-2">
              {beatNotesMap[beat.beatNo.startsWith('Beat') ? beat.beatNo : `Beat ${beat.beatNo}`]}
            </p>
          </div>
        )}

        <button
          onClick={() => setSectorModalBeat(beat)}
          className="w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-blue-200 transition cursor-pointer"
        >
          <Layers size={13} className="text-blue-700 shrink-0" />
          <span>Multi-Colony & Sector Mapping</span>
        </button>

        <button
          onClick={() => {
            setSelectedBeatForModal(beat);
            setBeatModalSearch('');
            if (onFilterBeat) onFilterBeat(beat.beatNo);
          }}
          className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 transition"
        >
          <Users size={14} className="text-red-700" />
          <span>View Beat Customers ({beat.totalCustomers})</span>
        </button>

        {canDispatch && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenBroadcast(beat)}
              className="flex-1 py-1.5 px-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition shadow-xs"
              title="Broadcast notice to all residents in this beat"
            >
              <Radio size={13} />
              <span>Bulk Broadcast</span>
            </button>
            <button
              onClick={() => {
                const firstCust = customers.find((c) =>
                  beat.beatNo === '2'
                    ? c.beatNo === '2' || c.beatNo === 'Beat 2' || !c.beatNo
                    : c.beatNo === beat.beatNo || c.beatNo === `Beat ${beat.beatNo}`
                );
                setActiveMessageCustomer(firstCust || null);
                setShowMessageModal(true);
              }}
              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition"
              title="Direct WhatsApp / SMS to beat"
            >
              <MessageSquare size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6" id="beat-management-view-root">
      {/* Safe Unmapping & Master Preservation Notice */}
      {unmapNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
            <span>{unmapNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setUnmapNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Header with Role-Based & Office-Based Visibility Control */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MapIcon size={22} className="text-red-700" />
                <span>Postal Delivery Beats & Linked Office Management</span>
              </h2>
              {isSuperAdmin ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                  <ShieldCheck size={12} /> Super Admin • Division-Wide Control
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <Lock size={12} /> Scoped to Assigned Office: {nonAdminAssignedOffice.postOfficeName} ({nonAdminAssignedOffice.pincode})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Role-based delivery beat routing, linked Sub-Offices / Branch Offices (BOs), postman assignments, and bulk citizen broadcast ({filteredBeats.length} Active Beats shown)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isSuperAdmin ? (
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>Cross-Division Admin Rights</span>
              </div>
            ) : (
              <div
                className="px-3.5 py-1.5 bg-amber-50 border border-amber-300 rounded-xl text-xs flex items-center gap-2 text-amber-900 font-bold"
                id="non-admin-locked-office-badge"
              >
                <Lock size={13} className="text-amber-700 shrink-0" />
                <span>
                  Locked to: {nonAdminAssignedOffice.postOfficeName} (PIN {nonAdminAssignedOffice.pincode})
                </span>
              </div>
            )}

            {/* Super Admin Role Simulation Switcher */}
            {isActualSuperAdmin && (
              <div className="flex items-center gap-1.5 bg-amber-50/90 border border-amber-200 px-2.5 py-1.5 rounded-xl text-xs">
                <Eye size={13} className="text-amber-700 shrink-0" />
                <select
                  value={simulateNonAdminOfficeId || 'ADMIN_MODE'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'ADMIN_MODE') {
                      setSimulateNonAdminOfficeId(null);
                    } else {
                      setSimulateNonAdminOfficeId(val);
                    }
                  }}
                  className="bg-transparent text-[11px] font-bold text-amber-900 focus:outline-none cursor-pointer"
                  title="Test how Non-Admin Staff / Postmasters see their restricted Post Office view"
                >
                  <option value="ADMIN_MODE">Role View: Super Admin (Full Access)</option>
                  <option value="Dadabari S.O.">Simulate Staff: Dadabari S.O. (PIN 324009)</option>
                  <option value="Talwandi S.O.">Simulate Staff: PIP Office / Talwandi S.O. (PIN 324005)</option>
                  <option value="Engineering College S.O.">Simulate Staff: Engineering College S.O. (PIN 324010)</option>
                  <option value="Baran H.O.">Simulate Staff: Baran H.O. (Baran Div)</option>
                  <option value="Jhalawar H.O.">Simulate Staff: Jhalawar H.O. (Jhalawar Div)</option>
                  <option value="Bundi H.O.">Simulate Staff: Bundi H.O. (Bundi Div)</option>
                  <option value="Tonk H.O.">Simulate Staff: Tonk H.O. (Tonk Div)</option>
                </select>
              </div>
            )}

            {canDispatch ? (
              <button
                onClick={() => {
                  setActiveMessageCustomer(null);
                  setShowMessageModal(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs"
                id="open-messaging-from-beats"
              >
                <MessageSquare size={14} />
                <span>Direct Message</span>
              </button>
            ) : (
              <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Lock size={13} />
                <span>Dispatch Restricted</span>
              </div>
            )}
          </div>
        </div>

        {/* Interactive 4-Tier Hierarchy Filter Strip: Circle -> Division -> Sub-Division/Office -> Beat */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Filter size={13} className="text-red-700" />
              <span>Rajasthan Circle Administrative Hierarchy Filters</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-semibold">
                {filteredBeats.length} delivery beats matched
              </span>
              {(selectedDivisionFilter !== 'ALL' || selectedOfficeFilter !== 'ALL' || selectedBeatFilter !== 'ALL' || searchQuery) && isSuperAdmin && (
                <button
                  onClick={() => {
                    setSelectedDivisionFilter('ALL');
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            {/* 1. Circle Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                1. Postal Circle
              </label>
              <select
                value={selectedCircleFilter}
                onChange={(e) => setSelectedCircleFilter(e.target.value)}
                disabled={!isSuperAdmin}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 disabled:bg-slate-100 disabled:text-slate-500 text-xs"
              >
                <option value="Rajasthan Circle">Rajasthan Circle</option>
                <option value="ALL">All Circles (Pan-India)</option>
              </select>
            </div>

            {/* 2. Division Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                2. Postal Division (District)
              </label>
              <select
                value={selectedDivisionFilter}
                onChange={(e) => {
                  setSelectedDivisionFilter(e.target.value);
                  setSelectedOfficeFilter('ALL');
                  setSelectedBeatFilter('ALL');
                }}
                disabled={!isSuperAdmin}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 disabled:bg-slate-100 disabled:text-slate-500 text-xs"
              >
                <option value="ALL">All Divisions (Kota, Baran, Jhalawar, Bundi, Tonk)</option>
                <option value="Kota Division">Kota Division (Kota District)</option>
                <option value="Baran Division">Baran Division (Baran District)</option>
                <option value="Jhalawar Division">Jhalawar Division (Jhalawar District)</option>
                <option value="Bundi Division">Bundi Division (Bundi District)</option>
                <option value="Tonk Division">Tonk Division (Tonk District)</option>
              </select>
            </div>

            {/* 3. Sub-Division / Post Office Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                3. Sub-Division / Post Office
              </label>
              <select
                value={selectedOfficeFilter}
                onChange={(e) => {
                  setSelectedOfficeFilter(e.target.value);
                  setSelectedBeatFilter('ALL');
                }}
                disabled={!isSuperAdmin}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 disabled:bg-slate-100 disabled:text-slate-500 text-xs"
              >
                <option value="ALL">
                  {selectedDivisionFilter === 'ALL'
                    ? 'All Post Offices (Full Circle)'
                    : `All Offices in ${selectedDivisionFilter}`}
                </option>
                {availableOfficesForDivision.map((hub) => (
                  <option key={hub.officeId} value={hub.officeId}>
                    {hub.postOfficeName} ({hub.pincode}) — {hub.officeType}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Beat / Colony Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                4. Delivery Beat / Colony
              </label>
              <select
                value={selectedBeatFilter}
                onChange={(e) => setSelectedBeatFilter(e.target.value)}
                disabled={!isSuperAdmin && !!userProfile?.beat && userProfile.beat !== 'All Beats'}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 disabled:bg-slate-100 disabled:text-slate-500 text-xs"
              >
                <option value="ALL">All Delivery Beats & Colonies</option>
                {availableBeatsForSelection.map((b) => (
                  <option key={b.id || b.beatNo} value={b.beatNo}>
                    Beat {b.beatNo} — {b.assignedPostman || b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3. Quick Search & Office Switcher Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input by Office Name, Pincode, or Beat Number */}
          <div className="relative flex-1 max-w-xl">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              id="beat-office-quick-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick Search by Office Name (Dadabari, Engg College), Pincode (324009, 324010), Beat No., or Colony..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Office Switcher Pills (Visible to Super Admin) & View Controls */}
          <div className="flex flex-wrap items-center gap-1.5">
            {isSuperAdmin && (
              <div className="flex flex-wrap items-center gap-1 mr-2">
                <button
                  onClick={() => setSelectedOfficeFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    selectedOfficeFilter === 'ALL'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Offices
                </button>
                {officeHubOptions
                  .filter((h) =>
                    ['DADABARI_SO', 'TALWANDI_SO', 'ENG_COLLEGE_SO', 'KOTA_HO'].includes(h.officeId)
                  )
                  .map((hub) => (
                    <button
                      key={hub.officeId}
                      onClick={() => setSelectedOfficeFilter(hub.officeId)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                        selectedOfficeFilter === hub.officeId
                          ? 'bg-red-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {hub.postOfficeName} ({hub.pincode})
                    </button>
                  ))}
              </div>
            )}

            <button
              onClick={() => setGroupByOffice((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1 transition ${
                groupByOffice
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Toggle Office-wise Grouping"
            >
              <Layers size={12} />
              <span>{groupByOffice ? 'Grouped by Office' : 'Flat Grid'}</span>
            </button>

            {(searchQuery || (isSuperAdmin && selectedOfficeFilter !== 'ALL')) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  if (isSuperAdmin) setSelectedOfficeFilter('ALL');
                }}
                className="px-2.5 py-1.5 text-[11px] font-bold text-red-700 hover:bg-red-50 rounded-xl flex items-center gap-1 transition"
              >
                <RefreshCw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Office Beat & Delivery Link Summary Header Bar */}
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
                  Office Beat & Delivery Link Summary
                </span>
                <span className="text-xs font-mono text-emerald-300 font-bold">
                  PIN: {officeSummary.pincode}
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-white mt-1">
                {officeSummary.parentOfficeName}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Parent Controlling Hub: <strong className="text-amber-300">{officeSummary.higherParentHo}</strong> • {officeSummary.completeAddress}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowOfficeMappingDrawer(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md self-start lg:self-auto shrink-0"
            id="open-office-beat-mapping-drawer"
          >
            <Info size={15} />
            <span>Office & Beat Mapping Drawer</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 4 Summary Pillars Required by Spec */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
          {/* Pillar 1: Parent Office Name & PIN Code */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <MapPin size={13} className="text-amber-400" />
              <span>Parent Office & PIN Code</span>
            </div>
            <div className="text-sm font-black text-white mt-1 truncate">
              {officeSummary.parentOfficeName}
            </div>
            <div className="text-xs font-mono text-amber-300 mt-0.5">
              PIN: {officeSummary.pincode}
            </div>
          </div>

          {/* Pillar 2: Total Mapped Beats for this Office */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <Navigation size={13} className="text-emerald-400" />
              <span>Total Mapped Beats</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              {officeSummary.totalMappedBeats}{' '}
              <span className="text-xs font-bold text-slate-300">Active Beats</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5 truncate">
              {filteredBeats.map((b) => `Beat ${b.beatNo}`).join(', ') || 'No matching beats'}
            </div>
          </div>

          {/* Pillar 3: Linked Delivery Sub-Offices / Branch Offices (BOs) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <GitBranch size={13} className="text-sky-400" />
              <span>Linked Delivery SOs / BOs</span>
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
                  title={isSuperAdmin ? 'Click to filter by this Linked Office' : lo}
                >
                  {lo}
                </span>
              ))}
            </div>
          </div>

          {/* Pillar 4: Total Coverage Percentage & Assigned Delivery Staff Count */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <Users size={13} className="text-amber-400" />
              <span>Coverage & Delivery Staff</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <div>
                <span className="text-2xl font-black text-amber-400">
                  {officeSummary.totalCoveragePercentage}
                </span>
                <span className="text-[10px] text-slate-300 block">Doorstep Coverage</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-white">
                  {officeSummary.assignedDeliveryStaffCount}
                </span>
                <span className="text-[10px] text-emerald-300 block font-semibold">
                  Assigned Staff
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
            Try clearing your search query or switching the Post Office / Delivery Hub filter to view available beats.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setBeatStatusFilter('ALL');
              if (isSuperAdmin) setSelectedOfficeFilter('ALL');
            }}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : groupByOffice ? (
        /* Office-Wise Grouped Beats Layout */
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
                    {group.postOfficeName} (PIN {group.pincode})
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    • Parent: <strong>{group.parentOffice}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                    {group.beats.length} {group.beats.length === 1 ? 'Beat' : 'Beats'} Mapped
                  </span>
                  {group.linkedDeliveryOffices.length > 0 && (
                    <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
                      Linked: {group.linkedDeliveryOffices.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {group.beats.map((beat) => renderBeatCard(beat))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Flat Beats Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredBeats.map((beat) => renderBeatCard(beat))}
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
                  Office Beat & Linked Delivery Hub Mapping Directory
                </h3>
                <p className="text-xs text-red-100 mt-0.5">
                  Parent Office Name & PIN Code, Linked Sub-Offices / Branch Offices (BOs), and Beat Coverage Matrix
                </p>
              </div>
              <button
                onClick={() => setShowOfficeMappingDrawer(false)}
                className="p-2 hover:bg-white/10 rounded-full transition text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Linked Offices Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {officeHubOptions
                  .filter(
                    (h) =>
                      effectiveOfficeFilter === 'ALL' ||
                      h.officeId === effectiveOfficeFilter ||
                      officeSummary.linkedDeliveryOffices.some((lo) =>
                        lo.toLowerCase().includes(h.postOfficeName.toLowerCase())
                      )
                  )
                  .map((hub) => {
                    const hubBeats = allBeats.filter((b) => b.officeId === hub.officeId);
                    return (
                      <div
                        key={hub.officeId}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded font-black text-[10px] ${
                                hub.officeType === 'BO'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : hub.officeType === 'HO'
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}
                            >
                              {hub.officeType}
                            </span>
                            <span className="font-black text-slate-900 text-sm">
                              {hub.postOfficeName}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                            PIN {hub.pincode}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600">
                          <strong>Parent Office:</strong> {hub.parentOfficeName}
                        </div>
                        <div className="text-[11px] text-slate-500">{hub.completeAddress}</div>

                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                            Linked Delivery Sub-Offices / Branch Offices:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {hub.linkedDeliveryOffices.map((lo, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-semibold text-slate-700"
                              >
                                {lo}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-700">
                            Mapped Beats: {hubBeats.length}
                          </span>
                          {isSuperAdmin && (
                            <button
                              onClick={() => {
                                setSelectedOfficeFilter(hub.officeId);
                                setShowOfficeMappingDrawer(false);
                              }}
                              className="text-red-700 font-bold hover:underline flex items-center gap-1"
                            >
                              <span>Filter to this Office</span>
                              <ChevronRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Complete Beat-to-Office Mapping Table */}
              <div>
                <h4 className="font-black text-slate-900 text-sm mb-2.5">
                  Active Beat & Delivery Staff Mapping Table ({filteredBeats.length} Beats)
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="p-3">Beat No.</th>
                        <th className="p-3">Post Office & PIN</th>
                        <th className="p-3">Parent Office / Linked BOs</th>
                        <th className="p-3">Assigned Delivery Staff</th>
                        <th className="p-3 text-center">Fixed KM</th>
                        <th className="p-3 text-center">Coverage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBeats.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-red-700">
                            Beat {b.beatNo}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{b.postOfficeName}</div>
                            <div className="font-mono text-[10px] text-slate-500">
                              PIN {b.pincode}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-slate-800">{b.parentOffice}</div>
                            <div className="text-[10px] text-slate-500">
                              Linked: {b.linkedDeliveryOffices.join(', ')}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{b.assignedPostman}</div>
                            <div className="font-mono text-[10px] text-blue-700">{b.contact}</div>
                          </td>
                          <td className="p-3 text-center font-mono font-bold">{b.fixedKm} KM</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                              {b.confirmedCoverage}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowOfficeMappingDrawer(false)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
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
                    Beat {selectedBeatForModal.beatNo} ({selectedBeatForModal.postOfficeName}) — Customers Directory
                  </h3>
                  <span className="text-xs bg-white text-red-800 font-mono font-bold px-2 py-0.5 rounded">
                    {beatCustomers.length} Verified
                  </span>
                </div>
                <p className="text-xs text-red-100 mt-0.5">
                  Parent Hub: {selectedBeatForModal.parentOffice} • Postman: {selectedBeatForModal.assignedPostman} ({selectedBeatForModal.contact})
                </p>
              </div>
              <button
                onClick={() => setSelectedBeatForModal(null)}
                className="p-2 hover:bg-white/10 rounded-full transition text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={beatModalSearch}
                  onChange={(e) => setBeatModalSearch(e.target.value)}
                  placeholder="Filter customers in this beat..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <button
                onClick={() => handleCopyAllBeatMobiles(selectedBeatForModal.beatNo)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 flex items-center gap-1.5 transition"
              >
                {copiedBatch ? (
                  <Check size={13} className="text-emerald-600" />
                ) : (
                  <Copy size={13} />
                )}
                <span>
                  {copiedBatch ? 'Copied Mobile Numbers!' : 'Copy All Beat Phone Numbers'}
                </span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto divide-y divide-slate-100 flex-1">
              {beatCustomers.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  No customers currently mapped to Beat {selectedBeatForModal.beatNo} matching your filter.
                </div>
              ) : (
                beatCustomers.slice(0, 60).map((c, i) => (
                  <div
                    key={c.id || c.masterId || i}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                        <span className="text-[10px] font-mono font-semibold bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                          {c.masterId || c.id}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        H.No {c.houseNo || 'NA'},{' '}
                        {c.sector ? `Sector ${c.sector}` : c.area || selectedBeatForModal.postOfficeName}
                      </div>
                      <div className="text-xs font-mono text-slate-700 mt-0.5">
                        📞 {c.mobile || 'No Mobile'}
                      </div>
                    </div>

                    {canDispatch && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveMessageCustomer(c);
                            setShowMessageModal(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition flex items-center gap-1.5"
                        >
                          <MessageSquare size={14} className="text-emerald-700" />
                          <span>Send Message / Chat</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedBeatForModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl"
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
                onClick={() => setBroadcastBeat(null)}
                className="p-2 hover:bg-white/10 rounded-full transition text-white"
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
                    Target: {broadcastBeat.name} ({broadcastBeat.postOfficeName} • PIN {broadcastBeat.pincode})
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Assigned Postman: {broadcastBeat.assignedPostman} ({broadcastBeat.contact})
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-red-100 text-red-800 rounded-lg">
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
                  <strong>Broadcast Workflow Tip:</strong> You can copy all{' '}
                  {broadcastBeat.totalCustomers} mobile numbers directly into official India Post SMS Gateway or WhatsApp Broadcast list.
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => handleCopyAllBeatMobiles(broadcastBeat.beatNo)}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                <Copy size={14} />
                <span>Copy All {broadcastBeat.totalCustomers} Numbers</span>
              </button>

              <div className="flex items-center gap-2">
                <button
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
                >
                  <Send size={14} />
                  <span>Log & Dispatch Broadcast</span>
                </button>
              </div>
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

      {/* Module 2: Multi-Colony & Sector Mapping Modal */}
      {sectorModalBeat && (
        <BeatMultiColonySectorModal
          isOpen={Boolean(sectorModalBeat)}
          onClose={() => setSectorModalBeat(null)}
          beatNo={sectorModalBeat.beatNo.startsWith('Beat') ? sectorModalBeat.beatNo : `Beat ${sectorModalBeat.beatNo}`}
          assignedStaffName={sectorModalBeat.assignedPostman}
          officeName={sectorModalBeat.postOfficeName}
          pincode={sectorModalBeat.pincode}
          division={sectorModalBeat.division}
          initialSelectedColonies={sectorModalBeat.areasCovered}
          initialColoniesWithSectors={coloniesWithSectorsMap[sectorModalBeat.beatNo.startsWith('Beat') ? sectorModalBeat.beatNo : `Beat ${sectorModalBeat.beatNo}`] || EMPTY_SECTORS_FALLBACK}
          initialBeatNotes={beatNotesMap[sectorModalBeat.beatNo.startsWith('Beat') ? sectorModalBeat.beatNo : `Beat ${sectorModalBeat.beatNo}`] || ''}
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
                localStorage.setItem('postman_crm_beat_sector_landmarks_v2', JSON.stringify(data.sectorLandmarks));
              }
            } catch (e) {
              console.warn(e);
            }

            const matchedProfile = allStaffProfiles.find(
              (s) => s.beat.toLowerCase() === beatKey.toLowerCase()
            );
            if (matchedProfile) {
              staffPermissionService.saveStaffProfile({
                ...matchedProfile,
                assignedColonies: data.selectedColonies,
                assignedColoniesWithSectors: data.coloniesWithSectors,
                beatNotes: data.beatNotes,
              });
            }

            data.selectedColonies.forEach((colonyName) => {
              const sectors = data.coloniesWithSectors[colonyName] || [];
              staffPermissionService.upsertColonyBeatMapping({
                colonyName,
                beatNumber: beatKey,
                assignedBeatNumber: beatKey,
                sectorNumber: sectors.length > 0 ? sectors.join(', ') : 'All Sectors',
                landmark: data.beatNotes.slice(0, 100),
                pincode: sectorModalBeat.pincode,
                subOrHoOffice: sectorModalBeat.postOfficeName,
              });
            });

            // Two-way relational sync with masterDataService
            const allMaster = masterDataService.getColonyMasterRecords();

            // Safe unmap any previously mapped colonies that were unselected (NEVER DELETE MASTER RECORD)
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

            refreshData();
          }}
        />
      )}
    </div>
  );
}
