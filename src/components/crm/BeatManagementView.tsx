import React, { useState, useEffect, useMemo } from 'react';
import {
  Map,
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
import { Customer, DynamicOfficeRecord, StaffProfile } from '../../types/models';
import { customerService } from '../../services/customerService';
import {
  staffPermissionService,
  resolveOfficeMetadata,
} from '../../services/staffPermissionService';
import { useAuth } from '../auth/FirebaseAuthProvider';
import DirectMessageModal from './DirectMessageModal';

export interface BeatCardItem {
  id: string;
  beatNo: string;
  name: string;
  officeId: string;
  postOfficeName: string;
  officeType: 'HO' | 'SO' | 'BO';
  pincode: string;
  parentOffice: string;
  linkedDeliveryOffices: string[];
  assignedPostman: string;
  employeeId?: string;
  contact: string;
  fixedKm: number;
  areasCovered: string[];
  totalCustomers: number;
  confirmedCoverage: string;
  coverageValue: number;
  status: string;
  assignedStaffCount: number;
}

export interface OfficeHubOption {
  officeId: string;
  postOfficeName: string;
  officeType: 'HO' | 'SO' | 'BO';
  pincode: string;
  parentOfficeName: string;
  linkedDeliveryOffices: string[];
  completeAddress: string;
}

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

  // 1. Admin Office Filter ("ALL" or specific officeId)
  const [selectedOfficeFilter, setSelectedOfficeFilter] = useState<string>('ALL');

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

  const refreshData = () => {
    setCustomers([...customerService.getCustomers()]);
    setDynamicBeats([...staffPermissionService.getDynamicBeatsSummary()]);
    setDynamicOffices([...staffPermissionService.getDynamicOffices()]);
    setAllStaffProfiles([...staffPermissionService.getAllStaffProfiles()]);
  };

  useEffect(() => {
    refreshData();
    const unsubCust = customerService.subscribe(refreshData);
    const unsubStaff = staffPermissionService.subscribe(refreshData);
    return () => {
      unsubCust();
      unsubStaff();
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

  // Build canonical list of Post Offices / Delivery Hubs for the dropdown & switcher
  const officeHubOptions = useMemo<OfficeHubOption[]>(() => {
    const coreHubs: OfficeHubOption[] = [
      {
        officeId: 'DADABARI_SO',
        postOfficeName: 'Dadabari S.O.',
        officeType: 'SO',
        pincode: '324009',
        parentOfficeName: 'Kota H.O. (324001)',
        linkedDeliveryOffices: [
          'Mandaliya B.O. (324009)',
          'Borabas B.O. (325003)',
          'Engineering College S.O. (324010)',
        ],
        completeAddress:
          'Dadabari Sub-Post Office, Near CAD Circle, Dadabari Extension, Kota, Rajasthan - 324009',
      },
      {
        officeId: 'ENG_COLLEGE_SO',
        postOfficeName: 'Engineering College S.O.',
        officeType: 'SO',
        pincode: '324010',
        parentOfficeName: 'Kota H.O. (324001)',
        linkedDeliveryOffices: [
          'Borabas B.O. (325003)',
          'Rathkankra B.O. (324010)',
          'Dadabari S.O. (324009)',
        ],
        completeAddress:
          'Engineering College Sub-Post Office, RTU Campus Road, Rawatbhata Road, Kota - 324010',
      },
      {
        officeId: 'BORABAS_BO',
        postOfficeName: 'Borabas B.O.',
        officeType: 'BO',
        pincode: '325003',
        parentOfficeName: 'Engineering College S.O. (324010) / Kota H.O.',
        linkedDeliveryOffices: [
          'Engineering College S.O. (324010)',
          'Dadabari S.O. (324009)',
          'Dolya Rural Delivery Point (325003)',
        ],
        completeAddress:
          'Borabas Branch Post Office, Rawatbhata Highway Belt, Under Engineering College S.O., Kota - 325003',
      },
      {
        officeId: 'MANDALIYA_BO',
        postOfficeName: 'Mandaliya B.O.',
        officeType: 'BO',
        pincode: '324009',
        parentOfficeName: 'Dadabari S.O. (324009) / Kota H.O.',
        linkedDeliveryOffices: [
          'Dadabari S.O. (324009)',
          'Naya Gaon Outskirts B.O. Link (324009)',
        ],
        completeAddress:
          'Mandaliya Branch Post Office, Naya Gaon Rural Belt, Under Dadabari S.O., Kota - 324009',
      },
      {
        officeId: 'KOTA_HO',
        postOfficeName: 'Kota H.O.',
        officeType: 'HO',
        pincode: '324001',
        parentOfficeName: 'Kota Division, Rajasthan Circle (324001)',
        linkedDeliveryOffices: [
          'Dadabari S.O. (324009)',
          'Engineering College S.O. (324010)',
          'Mandaliya B.O. (324009)',
          'Borabas B.O. (325003)',
        ],
        completeAddress:
          'Kota Head Post Office, Nayapura / Station Road, Kota Division, Rajasthan - 324001',
      },
    ];

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
        parentOffice: 'Kota H.O. (324001)',
        linkedDeliveryOffices: ['Mandaliya B.O. (324009)', 'Borabas B.O. (325003)'],
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
        parentOffice: 'Kota H.O. (324001)',
        linkedDeliveryOffices: ['Mandaliya B.O. (324009)', 'Borabas B.O. (325003)'],
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
        parentOffice: 'Kota H.O. (324001)',
        linkedDeliveryOffices: ['Mandaliya B.O. (324009)'],
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
        parentOffice: 'Kota H.O. (324001)',
        linkedDeliveryOffices: ['Mandaliya B.O. (324009)'],
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
        parentOffice: 'Kota H.O. (324001)',
        linkedDeliveryOffices: ['Mandaliya B.O. (324009)', 'Borabas B.O. (325003)'],
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
        parentOffice: 'Kota H.O. (324001)',
        linkedDeliveryOffices: ['Borabas B.O. (325003)', 'Rathkankra B.O. (324010)'],
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
        name: 'Beat EC-2 — Talwandi Sector 1-4 & Jawahar Nagar',
        officeId: 'ENG_COLLEGE_SO',
        postOfficeName: 'Engineering College S.O.',
        officeType: 'SO',
        pincode: '324010',
        parentOffice: 'Kota H.O. (324001)',
        linkedDeliveryOffices: ['Borabas B.O. (325003)', 'Dadabari S.O. (324009)'],
        assignedPostman: 'Suresh Chandra Verma',
        employeeId: 'CSI-10448902',
        contact: '9829077412',
        fixedKm: 18,
        areasCovered: [
          'Talwandi Sector 1 to 4',
          'Jawahar Nagar Main',
          'Commerce College Road',
          'Global Hospital Belt',
        ],
        totalCustomers:
          customers?.filter((c) => c.beatNo === 'EC-2' || c.beatNo === 'Beat EC-2').length || 0,
        confirmedCoverage: '96.4%',
        coverageValue: 96.4,
        status: 'Active Daily Delivery',
        assignedStaffCount: 1,
      },
      {
        id: 'BEAT-BOR-1',
        beatNo: 'BOR-1',
        name: 'Beat BOR-1 — Borabas B.O. Rural Belt & Rawatbhata Highway',
        officeId: 'BORABAS_BO',
        postOfficeName: 'Borabas B.O.',
        officeType: 'BO',
        pincode: '325003',
        parentOffice: 'Engineering College S.O. (324010) / Kota H.O.',
        linkedDeliveryOffices: [
          'Engineering College S.O. (324010)',
          'Dadabari S.O. (324009)',
        ],
        assignedPostman: 'Kamlesh Kumar Meena (BPM)',
        employeeId: 'GDS-50882190',
        contact: '9413355901',
        fixedKm: 24,
        areasCovered: [
          'Borabas Village',
          'Rawatbhata Highway Checkpost',
          'Dolya Rural Belt',
          'Mukundra Outskirts',
        ],
        totalCustomers:
          customers?.filter(
            (c) =>
              c.beatNo === 'BOR-1' ||
              c.beatNo === 'Beat BOR-1' ||
              c.pincode === '325003' ||
              c.officeId?.includes('BORABAS')
          ).length || 0,
        confirmedCoverage: '94.5%',
        coverageValue: 94.5,
        status: 'Rural Postal Service',
        assignedStaffCount: 1,
      },
      {
        id: 'BEAT-MANDALIYA-BO',
        beatNo: 'BO',
        name: 'Beat BO — Mandaliya Branch Post Office (BO) Rural Route',
        officeId: 'MANDALIYA_BO',
        postOfficeName: 'Mandaliya B.O.',
        officeType: 'BO',
        pincode: '324009',
        parentOffice: 'Dadabari S.O. (324009) / Kota H.O.',
        linkedDeliveryOffices: ['Dadabari S.O. (324009)', 'Kota H.O. (324001)'],
        assignedPostman: 'Chetan Porwal (BPM Mandaliya)',
        employeeId: 'GDS-30991204',
        contact: '0744-2451122',
        fixedKm: 20,
        areasCovered: ['Mandaliya Village', 'Naya Gaon Outer Outskirts', 'Rooparel Rural Belt'],
        totalCustomers:
          customers?.filter(
            (c) =>
              c.beatNo === 'BO' ||
              c.beatNo === 'Beat BO' ||
              c.officeId?.includes('MANDALIYA')
          ).length || 0,
        confirmedCoverage: '92.0%',
        coverageValue: 92.0,
        status: 'Rural Postal Service',
        assignedStaffCount: 1,
      },
    ];

    // Merge any additional dynamically created beats from staff/colony mappings
    const existingBeatKeys = new Set(baseBeats.map((b) => b.beatNo.toLowerCase()));
    dynamicBeats.forEach((db) => {
      const cleanNo = db.beatNumber.replace(/^Beat\s+/i, '').trim();
      const matchExisting = baseBeats.find(
        (b) =>
          b.beatNo.toLowerCase() === cleanNo.toLowerCase() ||
          `beat ${b.beatNo}`.toLowerCase() === db.beatNumber.toLowerCase()
      );
      if (matchExisting) {
        db.colonies.forEach((col: string) => {
          if (!matchExisting.areasCovered.includes(col)) {
            matchExisting.areasCovered.push(col);
          }
        });
      } else if (!existingBeatKeys.has(cleanNo.toLowerCase())) {
        existingBeatKeys.add(cleanNo.toLowerCase());
        const meta = resolveOfficeMetadata(db.officeName, '', db.pincode);
        baseBeats.push({
          id: `BEAT-DYN-${cleanNo}`,
          beatNo: cleanNo,
          name: `${db.beatNumber} — ${meta.postOfficeName}`,
          officeId: meta.officeId,
          postOfficeName: meta.postOfficeName,
          officeType: meta.officeType,
          pincode: db.pincode || meta.pincode,
          parentOffice: meta.parentOfficeName,
          linkedDeliveryOffices: meta.linkedDeliveryOffices,
          assignedPostman: db.assignedStaff[0]?.name || 'Assigned Postman',
          employeeId: db.assignedStaff[0]?.employeeId || 'CSI-STAFF',
          contact: db.assignedStaff[0]?.contact || '9414000000',
          fixedKm: db.assignedStaff[0]?.fixedKm || 18,
          areasCovered: db.colonies.length ? db.colonies : [meta.postOfficeName],
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

    return baseBeats;
  }, [customers, dynamicBeats]);

  // Effective Office Filter:
  // - If Super Admin: uses `selectedOfficeFilter` ('ALL' or specific officeId)
  // - If Non-Admin Staff / Postmaster: strictly locked to their assigned `officeId` / `postOfficeName`
  const effectiveOfficeFilter = isSuperAdmin
    ? selectedOfficeFilter
    : nonAdminAssignedOffice.officeId;

  // Role-Based & Office-Based Filtered Beats
  const filteredBeats = useMemo<BeatCardItem[]>(() => {
    return allBeats.filter((beat) => {
      // 1. Strict Office Restriction for Non-Admins OR Selected Office for Super Admin
      if (effectiveOfficeFilter !== 'ALL') {
        const matchesDirectOffice = beat.officeId === effectiveOfficeFilter;
        // Also include linked BO beats if Postmaster of parent SO is viewing their hub
        // OR if Super Admin selects an SO/HO and wants to see its direct & linked BO beats:
        const isLinkedChildBo =
          (effectiveOfficeFilter === 'DADABARI_SO' && beat.officeId === 'MANDALIYA_BO') ||
          (effectiveOfficeFilter === 'ENG_COLLEGE_SO' && beat.officeId === 'BORABAS_BO') ||
          effectiveOfficeFilter === 'KOTA_HO';

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
          if (!matchesDirectOffice && !isLinkedChildBo) {
            return false;
          }
        }
      }

      // 2. Status Filter
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
      return (
        spMeta.officeId === effectiveOfficeFilter ||
        (effectiveOfficeFilter === 'DADABARI_SO' && spMeta.officeId === 'MANDALIYA_BO') ||
        (effectiveOfficeFilter === 'ENG_COLLEGE_SO' && spMeta.officeId === 'BORABAS_BO')
      );
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
        : 'Kota Head Post Office, Dadabari S.O., Engineering College S.O., Mandaliya B.O. & Borabas B.O.',
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
          : bNo === 'BO'
          ? c.beatNo === 'BO' || c.beatNo === 'Beat BO' || c.officeId?.includes('MANDALIYA')
          : c.beatNo === bNo ||
            c.beatNo === `Beat ${bNo}` ||
            (bNo.startsWith('EC') && c.pincode === '324010') ||
            (bNo.startsWith('BOR') && c.pincode === '325003');

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

        {/* Postman Details */}
        <div className="space-y-1 text-xs text-slate-700 mb-3 bg-red-50/40 p-2.5 rounded-xl border border-red-100/80">
          <div className="text-[11px] flex items-center justify-between">
            <strong className="text-slate-500">Assigned Staff:</strong>
            <span className="text-slate-900 font-bold">{beat.assignedPostman}</span>
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
          <span className="text-slate-500 block text-[11px] font-semibold mb-1">
            Mapped Colonies & Sectors ({beat.areasCovered.length}):
          </span>
          <div className="flex flex-wrap gap-1">
            {beat.areasCovered.slice(0, 5).map((a: string, i: number) => (
              <span
                key={i}
                className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
              >
                {a}
              </span>
            ))}
            {beat.areasCovered.length > 5 && (
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">
                +{beat.areasCovered.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 mt-4 border-t border-slate-100 flex flex-col gap-2">
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
      {/* Top Header with Role-Based & Office-Based Visibility Control */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Map size={22} className="text-red-700" />
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
            {/* 1. SUPER ADMIN ONLY: Global "Select Post Office / Delivery Hub" Dropdown */}
            {isSuperAdmin ? (
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-300">
                <Building2 size={15} className="text-red-700 shrink-0" />
                <div className="text-xs">
                  <label
                    htmlFor="select-post-office-hub"
                    className="block text-[10px] font-bold uppercase tracking-wider text-slate-500"
                  >
                    Select Post Office / Delivery Hub
                  </label>
                  <select
                    id="select-post-office-hub"
                    value={selectedOfficeFilter}
                    onChange={(e) => setSelectedOfficeFilter(e.target.value)}
                    className="bg-transparent font-bold text-slate-900 text-xs focus:outline-none cursor-pointer pr-2"
                  >
                    <option value="ALL">All Offices (Kota Division Network)</option>
                    {officeHubOptions.map((hub) => (
                      <option key={hub.officeId} value={hub.officeId}>
                        {hub.postOfficeName} ({hub.pincode}) — {hub.officeType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              /* NON-ADMIN STAFF / POSTMASTERS: Global dropdown hidden; locked to assigned officeId / postOfficeName */
              <div
                className="px-3.5 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs flex items-center gap-2"
                id="non-admin-locked-office-badge"
              >
                <Building2 size={15} className="text-red-700 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Assigned Post Office / Delivery Hub
                  </span>
                  <span className="font-black text-slate-900">
                    {nonAdminAssignedOffice.postOfficeName} (PIN {nonAdminAssignedOffice.pincode})
                  </span>
                </div>
              </div>
            )}

            {/* Super Admin Role Simulation Switcher (to test Non-Admin Office Lock) */}
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
                  <option value="ADMIN_MODE">Role View: Super Admin (Full Dropdown)</option>
                  <option value="Dadabari S.O.">Simulate Staff: Dadabari S.O. (324009)</option>
                  <option value="Engineering College S.O.">
                    Simulate Staff: Engineering College S.O. (324010)
                  </option>
                  <option value="Borabas B.O.">Simulate Staff: Borabas B.O. (325003)</option>
                  <option value="Mandaliya B.O.">Simulate Staff: Mandaliya B.O. (324009)</option>
                </select>
              </div>
            )}

            {canDispatch ? (
              <button
                onClick={() => {
                  setActiveMessageCustomer(null);
                  setShowMessageModal(true);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs"
                id="open-messaging-from-beats"
              >
                <MessageSquare size={15} />
                <span>Direct Message / Dispatch</span>
              </button>
            ) : (
              <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Lock size={14} />
                <span>Content Sharing Restricted</span>
              </div>
            )}
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
              placeholder="Quick Search by Office Name (Dadabari, Engg College, Borabas), Pincode (324009, 324010), Beat No., or Colony..."
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
                {officeHubOptions.slice(0, 4).map((hub) => (
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
    </div>
  );
}
