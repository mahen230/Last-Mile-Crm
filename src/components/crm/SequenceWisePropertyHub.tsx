import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  MapPin,
  Building2,
  Filter,
  Home,
  CheckCircle2,
  AlertCircle,
  Download,
  Layers,
  ArrowUpDown,
  User,
  ShieldCheck,
  Phone,
  Sparkles,
  Check,
  Table,
  Compass,
  Building,
  Radio,
  FileSpreadsheet,
  Edit2,
  X,
  Plus,
  RefreshCw,
  BadgeAlert,
  IdCard,
  MessageCircle,
  Navigation,
  Grid,
  ListFilter,
  Eye,
  Clock,
  Send,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { staffPermissionService } from '../../services/staffPermissionService';
import {
  CONSOLIDATED_BEAT_MATRIX,
  ConsolidatedBeatEntry,
  resolveAddressToConsolidatedBeat,
} from '../../data/consolidatedBeatMatrix';
import { UPDATED_STAFF_LIST } from '../../data/updatedStaffData';

export interface PropertyItem {
  id: string;
  colony: string; // e.g. "Santoshi Nagar", "Keshavpura", "Mahaveer Nagar"
  blockSector: string; // e.g. "Block A", "Block B", "Sector 7"
  houseNoSeq: number; // Numeric sequence for sorting (e.g. 1, 2, 15, 128)
  housePlotNumber: string; // Display string e.g. "128-B" or "Plot 277"
  pincode: string;
  beatNo: string;
  status: 'Occupied' | 'Vacant' | 'Missing House No';
  residents: string[];
  primaryCustomerName: string;
  primaryMobile: string;
  whatsapp?: string;
  landmark: string;
  propertyType: 'Residential' | 'Commercial' | 'Mixed' | 'Plot' | 'Damaged' | 'Under Construction';
  assignedStaffRole: string; // e.g. "GDS/PMAN" or "POSTMAN"
  assignedStaffName: string;
  assignedStaffId: string; // e.g. "STAFF-50457421"
  lastMileNote: string;
  verificationStatus: 'Verified' | 'Pending Field Verification' | 'Flagged';
}

// Master lookup for Beat to Staff mapping (Beat 1 to Beat 33)
export const BEAT_STAFF_LOOKUP: Record<string, { id: string; name: string; role: string; contact: string }> = {};
UPDATED_STAFF_LIST.forEach((s) => {
  BEAT_STAFF_LOOKUP[s.beat] = {
    id: s.id,
    name: s.name,
    role: s.role,
    contact: s.contact,
  };
});

export const DEFAULT_SEQUENTIAL_PROPERTIES: PropertyItem[] = [
  {
    id: 'seq-1',
    colony: 'Santoshi Nagar',
    blockSector: 'Block A',
    houseNoSeq: 3,
    housePlotNumber: '3-A',
    pincode: '324009',
    beatNo: 'Beat 2',
    status: 'Occupied',
    residents: ['Roshni Sakywal', 'Prakash Koli'],
    primaryCustomerName: 'Roshni Sakywal',
    primaryMobile: '8769706002',
    whatsapp: '8769706002',
    landmark: 'Main Road Chauraha, near Shiv Mandir Gali',
    propertyType: 'Residential',
    assignedStaffRole: BEAT_STAFF_LOOKUP['Beat 2']?.role || 'GDS/PMAN',
    assignedStaffName: BEAT_STAFF_LOOKUP['Beat 2']?.name || 'Mahendra Kumar Meena',
    assignedStaffId: BEAT_STAFF_LOOKUP['Beat 2']?.id || 'STAFF-50457421',
    lastMileNote: 'Blue iron gate, bell at right pillar. Handover to family head.',
    verificationStatus: 'Verified',
  },
  {
    id: 'seq-2',
    colony: 'Santoshi Nagar',
    blockSector: 'Block A',
    houseNoSeq: 5,
    housePlotNumber: '5-A',
    pincode: '324009',
    beatNo: 'Beat 2',
    status: 'Occupied',
    residents: ['Pritviraj Chauhan', 'Urmila Chauhan'],
    primaryCustomerName: 'Pritviraj Chauhan',
    primaryMobile: '9414589201',
    whatsapp: '9414589201',
    landmark: 'Shiv Mandir Gali, Corner House',
    propertyType: 'Residential',
    assignedStaffRole: BEAT_STAFF_LOOKUP['Beat 2']?.role || 'GDS/PMAN',
    assignedStaffName: BEAT_STAFF_LOOKUP['Beat 2']?.name || 'Mahendra Kumar Meena',
    assignedStaffId: BEAT_STAFF_LOOKUP['Beat 2']?.id || 'STAFF-50457421',
    lastMileNote: 'Next to temple boundary. Registered parcels must be signed by Pritviraj.',
    verificationStatus: 'Verified',
  },
  {
    id: 'seq-3',
    colony: 'Santoshi Nagar',
    blockSector: 'Block B',
    houseNoSeq: 46,
    housePlotNumber: '46-B',
    pincode: '324009',
    beatNo: 'Beat 2',
    status: 'Occupied',
    residents: ['Soniya Nayak', 'Hariom Nayak'],
    primaryCustomerName: 'Soniya Nayak',
    primaryMobile: '9828876543',
    whatsapp: '9828876543',
    landmark: 'Corner House near Mamta Kirana Store',
    propertyType: 'Residential',
    assignedStaffRole: BEAT_STAFF_LOOKUP['Beat 2']?.role || 'GDS/PMAN',
    assignedStaffName: BEAT_STAFF_LOOKUP['Beat 2']?.name || 'Mahendra Kumar Meena',
    assignedStaffId: BEAT_STAFF_LOOKUP['Beat 2']?.id || 'STAFF-50457421',
    lastMileNote: 'Corner staircase on 1st floor. SSY installment regular.',
    verificationStatus: 'Verified',
  },
  {
    id: 'seq-4',
    colony: 'Keshavpura',
    blockSector: 'Sector 7',
    houseNoSeq: 95,
    housePlotNumber: 'Plot 95',
    pincode: '324009',
    beatNo: 'Beat 2',
    status: 'Occupied',
    residents: ['Depti Mehra', 'Kailash Mehra'],
    primaryCustomerName: 'Depti Mehra',
    primaryMobile: '9928486812',
    whatsapp: '9928486812',
    landmark: 'Near Shree Ram School Gate',
    propertyType: 'Residential',
    assignedStaffRole: BEAT_STAFF_LOOKUP['Beat 2']?.role || 'GDS/PMAN',
    assignedStaffName: BEAT_STAFF_LOOKUP['Beat 2']?.name || 'Mahendra Kumar Meena',
    assignedStaffId: BEAT_STAFF_LOOKUP['Beat 2']?.id || 'STAFF-50457421',
    lastMileNote: 'Opposite school play ground. Evening delivery after 4 PM preferred.',
    verificationStatus: 'Verified',
  },
  {
    id: 'seq-5',
    colony: 'Keshavpura',
    blockSector: 'Sector 7',
    houseNoSeq: 162,
    housePlotNumber: 'UIT 162',
    pincode: '324009',
    beatNo: 'Beat 2',
    status: 'Occupied',
    residents: ['Satish Sen', 'Geeta Sen'],
    primaryCustomerName: 'Satish Sen',
    primaryMobile: '8952041203',
    whatsapp: '8952041203',
    landmark: 'Near Central Park, Water Tank Road',
    propertyType: 'Residential',
    assignedStaffRole: BEAT_STAFF_LOOKUP['Beat 2']?.role || 'GDS/PMAN',
    assignedStaffName: BEAT_STAFF_LOOKUP['Beat 2']?.name || 'Mahendra Kumar Meena',
    assignedStaffId: BEAT_STAFF_LOOKUP['Beat 2']?.id || 'STAFF-50457421',
    lastMileNote: 'Double storey house with green parapet. PLI policyholder.',
    verificationStatus: 'Verified',
  },
  {
    id: 'seq-6',
    colony: 'Keshavpura',
    blockSector: 'Sector 7',
    houseNoSeq: 277,
    housePlotNumber: 'UIT 277',
    pincode: '324009',
    beatNo: 'Beat 2',
    status: 'Occupied',
    residents: ['Deepak Sen'],
    primaryCustomerName: 'Deepak Sen',
    primaryMobile: '9001116012',
    whatsapp: '9001116012',
    landmark: 'Behind Chauth Mata Temple',
    propertyType: 'Residential',
    assignedStaffRole: BEAT_STAFF_LOOKUP['Beat 2']?.role || 'GDS/PMAN',
    assignedStaffName: BEAT_STAFF_LOOKUP['Beat 2']?.name || 'Mahendra Kumar Meena',
    assignedStaffId: BEAT_STAFF_LOOKUP['Beat 2']?.id || 'STAFF-50457421',
    lastMileNote: 'Temple back lane. Delivery directly to tenant on ground floor.',
    verificationStatus: 'Verified',
  },
  {
    id: 'seq-7',
    colony: 'Keshavpura',
    blockSector: 'Sector 7',
    houseNoSeq: 400,
    housePlotNumber: 'Plot 400',
    pincode: '324009',
    beatNo: 'Beat 2',
    status: 'Occupied',
    residents: ['Hemlata Sharma', 'Vijay Sharma'],
    primaryCustomerName: 'Hemlata Sharma',
    primaryMobile: '9602222629',
    whatsapp: '9602222629',
    landmark: 'Corner Plot near TVS Circle, Keshav Market',
    propertyType: 'Mixed',
    assignedStaffRole: BEAT_STAFF_LOOKUP['Beat 2']?.role || 'GDS/PMAN',
    assignedStaffName: BEAT_STAFF_LOOKUP['Beat 2']?.name || 'Mahendra Kumar Meena',
    assignedStaffId: BEAT_STAFF_LOOKUP['Beat 2']?.id || 'STAFF-50457421',
    lastMileNote: 'Ground floor medical shop, residential upstairs. Cash On Delivery point.',
    verificationStatus: 'Verified',
  },
  {
    id: 'seq-8',
    colony: 'Dadabari Main Chauraha',
    blockSector: 'Shopping Centre',
    houseNoSeq: 12,
    housePlotNumber: 'Shop A-12',
    pincode: '324009',
    beatNo: 'Beat 2',
    status: 'Occupied',
    residents: ['Akashya Kirana Store', 'Sunil Goyal'],
    primaryCustomerName: 'Sunil Goyal',
    primaryMobile: '9829012345',
    whatsapp: '9829012345',
    landmark: 'Opposite State Bank of India Dadabari Branch',
    propertyType: 'Commercial',
    assignedStaffRole: BEAT_STAFF_LOOKUP['Beat 2']?.role || 'GDS/PMAN',
    assignedStaffName: BEAT_STAFF_LOOKUP['Beat 2']?.name || 'Mahendra Kumar Meena',
    assignedStaffId: BEAT_STAFF_LOOKUP['Beat 2']?.id || 'STAFF-50457421',
    lastMileNote: 'Commercial grocery shop. Daily official speed post delivery before 1 PM.',
    verificationStatus: 'Verified',
  },
  {
    id: 'seq-9',
    colony: 'Mahaveer Nagar Vistar',
    blockSector: 'Sector 1',
    houseNoSeq: 14,
    housePlotNumber: '1-B-14',
    pincode: '324009',
    beatNo: 'Beat 5',
    status: 'Occupied',
    residents: ['Anil Kumar Agarwal', 'Sita Agarwal'],
    primaryCustomerName: 'Anil Kumar Agarwal',
    primaryMobile: '8112232611',
    whatsapp: '8112232611',
    landmark: 'Samrat Chowk, Near Central Park',
    propertyType: 'Residential',
    assignedStaffRole: BEAT_STAFF_LOOKUP['Beat 5']?.role || 'POSTMAN',
    assignedStaffName: BEAT_STAFF_LOOKUP['Beat 5']?.name || 'Mohit Arvind',
    assignedStaffId: BEAT_STAFF_LOOKUP['Beat 5']?.id || 'STAFF-10310736',
    lastMileNote: 'White bungalow facing park. IPPB Doorstep banking active.',
    verificationStatus: 'Verified',
  },
  {
    id: 'seq-10',
    colony: 'Mahaveer Nagar Vistar',
    blockSector: 'Sector 2',
    houseNoSeq: 24,
    housePlotNumber: 'Shop 24',
    pincode: '324009',
    beatNo: 'Beat 5',
    status: 'Occupied',
    residents: ['Kota Coaching Stationery Hub', 'Dinesh Meena'],
    primaryCustomerName: 'Dinesh Meena',
    primaryMobile: '9414056789',
    whatsapp: '9414056789',
    landmark: 'Main Road Market, Jain Temple Road',
    propertyType: 'Commercial',
    assignedStaffRole: BEAT_STAFF_LOOKUP['Beat 5']?.role || 'POSTMAN',
    assignedStaffName: BEAT_STAFF_LOOKUP['Beat 5']?.name || 'Mohit Arvind',
    assignedStaffId: BEAT_STAFF_LOOKUP['Beat 5']?.id || 'STAFF-10310736',
    lastMileNote: 'High bulk parcel drop point. Bulk receipt signed in PMA daily.',
    verificationStatus: 'Verified',
  },
  {
    id: 'seq-11',
    colony: 'Teachers Colony & Shastri Nagar',
    blockSector: 'Phase 1',
    houseNoSeq: 1,
    housePlotNumber: 'TC-01',
    pincode: '324009',
    beatNo: 'Beat 1',
    status: 'Occupied',
    residents: ['Dr. Rameshwar Dayal', 'Kiran Dayal'],
    primaryCustomerName: 'Dr. Rameshwar Dayal',
    primaryMobile: '9521279186',
    whatsapp: '9521279186',
    landmark: 'Near Govt Senior Secondary School',
    propertyType: 'Residential',
    assignedStaffRole: BEAT_STAFF_LOOKUP['Beat 1']?.role || 'GDS/PMAN',
    assignedStaffName: BEAT_STAFF_LOOKUP['Beat 1']?.name || 'Muskan Sharma',
    assignedStaffId: BEAT_STAFF_LOOKUP['Beat 1']?.id || 'STAFF-50510312',
    lastMileNote: 'Retired Principal residence. Senior citizen pension verified.',
    verificationStatus: 'Verified',
  },
  {
    id: 'seq-12',
    colony: 'Basant Vihar',
    blockSector: 'Sector A',
    houseNoSeq: 18,
    housePlotNumber: 'BV-18',
    pincode: '324009',
    beatNo: 'Beat 3',
    status: 'Occupied',
    residents: ['Manish Bairwa', 'Pooja Bairwa'],
    primaryCustomerName: 'Manish Bairwa',
    primaryMobile: '7014408315',
    whatsapp: '7014408315',
    landmark: 'Basant Vihar Community Park',
    propertyType: 'Residential',
    assignedStaffRole: BEAT_STAFF_LOOKUP['Beat 3']?.role || 'GDS/PMAN',
    assignedStaffName: BEAT_STAFF_LOOKUP['Beat 3']?.name || 'Manali Ahuja',
    assignedStaffId: BEAT_STAFF_LOOKUP['Beat 3']?.id || 'STAFF-50510313',
    lastMileNote: 'Opposite water tank gate. Ring bell twice.',
    verificationStatus: 'Verified',
  },
  {
    id: 'seq-13',
    colony: 'Rangbari Road Enclave',
    blockSector: 'Sector 1',
    houseNoSeq: 88,
    housePlotNumber: 'RB-88',
    pincode: '324009',
    beatNo: 'Beat 16',
    status: 'Occupied',
    residents: ['Sunil Khandelwal', 'Neetu Khandelwal'],
    primaryCustomerName: 'Sunil Khandelwal',
    primaryMobile: '9571455373',
    whatsapp: '9571455373',
    landmark: 'Subhash Circle, Veer Savarkar Park',
    propertyType: 'Residential',
    assignedStaffRole: BEAT_STAFF_LOOKUP['Beat 16']?.role || 'GDS/PMAN',
    assignedStaffName: BEAT_STAFF_LOOKUP['Beat 16']?.name || 'Nitesh Mittal',
    assignedStaffId: BEAT_STAFF_LOOKUP['Beat 16']?.id || 'STAFF-50561337',
    lastMileNote: 'Near circle corner. Parcels can be accepted by neighbor if gate locked.',
    verificationStatus: 'Verified',
  },
  {
    id: 'seq-14',
    colony: 'Thermal Colony',
    blockSector: 'Phase 3 VIP',
    houseNoSeq: 7,
    housePlotNumber: 'Qtr VIP-07',
    pincode: '324009',
    beatNo: 'Beat 33',
    status: 'Occupied',
    residents: ['Er. Jitendra Singh Rathore'],
    primaryCustomerName: 'Er. Jitendra Singh Rathore',
    primaryMobile: '8696539977',
    whatsapp: '8696539977',
    landmark: 'Thermal Main Gate 3, VIP Circuit House Road',
    propertyType: 'Residential',
    assignedStaffRole: BEAT_STAFF_LOOKUP['Beat 33']?.role || 'POSTMAN',
    assignedStaffName: BEAT_STAFF_LOOKUP['Beat 33']?.name || 'Jitendra Kumar Meena',
    assignedStaffId: BEAT_STAFF_LOOKUP['Beat 33']?.id || 'STAFF-10310738',
    lastMileNote: 'Entry pass required at Gate 3. Official departmental mail recipient.',
    verificationStatus: 'Verified',
  },
  {
    id: 'seq-csc-1',
    colony: 'Santoshi Nagar',
    blockSector: 'Block A',
    houseNoSeq: 4,
    housePlotNumber: 'Shop No. 4, Commercial Complex',
    pincode: '324009',
    beatNo: 'Beat 2',
    status: 'Occupied',
    residents: ['Shri Ganesh eMitra & CSC', 'Rajendra Prasad Saini'],
    primaryCustomerName: 'Rajendra Prasad Saini',
    primaryMobile: '9414582910',
    whatsapp: '9414582910',
    landmark: 'Near Samrat Chowk, Main Road',
    propertyType: 'Commercial',
    assignedStaffRole: BEAT_STAFF_LOOKUP['Beat 2']?.role || 'GDS/PMAN',
    assignedStaffName: BEAT_STAFF_LOOKUP['Beat 2']?.name || 'Mahendra Kumar Meena',
    assignedStaffId: BEAT_STAFF_LOOKUP['Beat 2']?.id || 'STAFF-50457421',
    lastMileNote: 'Digital Seva Kiosk. Ground floor green banner. IPPB Merchant QR point.',
    verificationStatus: 'Verified',
  },
  {
    id: 'seq-csc-2',
    colony: 'Keshavpura',
    blockSector: 'Sector 7',
    houseNoSeq: 142,
    housePlotNumber: 'UIT 142-Commercial',
    pincode: '324009',
    beatNo: 'Beat 2',
    status: 'Occupied',
    residents: ['Aapno eMitra & Cyber Point', 'Dinesh Kumar Sharma'],
    primaryCustomerName: 'Dinesh Kumar Sharma',
    primaryMobile: '9829034512',
    whatsapp: '9829034512',
    landmark: 'Opposite Community Water Tank, Sector 7 Road',
    propertyType: 'Commercial',
    assignedStaffRole: BEAT_STAFF_LOOKUP['Beat 2']?.role || 'GDS/PMAN',
    assignedStaffName: BEAT_STAFF_LOOKUP['Beat 2']?.name || 'Mahendra Kumar Meena',
    assignedStaffId: BEAT_STAFF_LOOKUP['Beat 2']?.id || 'STAFF-50457421',
    lastMileNote: 'Corner shop facing central road. Hand delivery to Dinesh Sharma directly.',
    verificationStatus: 'Verified',
  },
  {
    id: 'seq-csc-3',
    colony: 'Dadabari Main Chauraha',
    blockSector: 'Commercial Block',
    houseNoSeq: 8,
    housePlotNumber: 'Shop B-8',
    pincode: '324009',
    beatNo: 'Beat 1',
    status: 'Occupied',
    residents: ['Balaji Digital Seva Kendra', 'Manoj Kumar Gupta'],
    primaryCustomerName: 'Manoj Kumar Gupta',
    primaryMobile: '9460128490',
    whatsapp: '9460128490',
    landmark: 'Near Dadabari Police Station & SBI Bank',
    propertyType: 'Commercial',
    assignedStaffRole: BEAT_STAFF_LOOKUP['Beat 1']?.role || 'POSTMAN',
    assignedStaffName: BEAT_STAFF_LOOKUP['Beat 1']?.name || 'Virendra Singh',
    assignedStaffId: BEAT_STAFF_LOOKUP['Beat 1']?.id || 'STAFF-50510312',
    lastMileNote: 'Balaji CSC Kendra. Official postal documents delivery before 12:30 PM.',
    verificationStatus: 'Verified',
  },
];

export default function SequenceWisePropertyHub() {
  const { userProfile } = useAuth();
  const currentProfile = staffPermissionService.getActiveSession() || userProfile;
  const isRestrictedStaff = staffPermissionService.isPostmanOrGds(currentProfile);
  const SEQ_PAGE_SIZE = 5;

  // Main View Switcher: Consolidated Master Matrix vs. Sequence Door-to-Door Route
  const [hubMode, setHubMode] = useState<'SEQUENCE' | 'MATRIX'>('SEQUENCE');

  // Dual View Layout Toggle inside Property Hub: Card/Grid View vs. Table/Follow-up View
  const [propertyViewLayout, setPropertyViewLayout] = useState<'CARD' | 'TABLE'>('CARD');

  const [seqPage, setSeqPage] = useState<number>(1);
  const [matrixPage, setMatrixPage] = useState<number>(1);

  // Master matrix local state with persistence
  const [beatMatrix, setBeatMatrix] = useState<ConsolidatedBeatEntry[]>(() => {
    try {
      const stored = localStorage.getItem('dadabari_consolidated_beat_matrix_v3');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 33) return parsed;
      }
    } catch {
      // fallback
    }
    return CONSOLIDATED_BEAT_MATRIX;
  });

  // DELIVERY OFFICE FILTER
  const [officeFilter, setOfficeFilter] = useState<string>('Dadabari S.O.');

  // =========================================================================
  // ENHANCED DROPDOWN & SEARCH FILTERS TOOLBAR (USER REQUIREMENT 1)
  // =========================================================================
  const [selectedColony, setSelectedColony] = useState<string>('All');
  const [selectedUpperBeat, setSelectedUpperBeat] = useState<string>('All');
  const [customerNameSearch, setCustomerNameSearch] = useState<string>('');
  const [houseNoSearch, setHouseNoSearch] = useState<string>('');
  const [mobileSearch, setMobileSearch] = useState<string>('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('All');
  const [seqStatusFilter, setSeqStatusFilter] = useState<string>('All');

  // Matrix Filter States
  const [pincodeFilter, setPincodeFilter] = useState<string>('ALL');
  const [selectedBeatNo, setSelectedBeatNo] = useState<string>('ALL');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('ALL');
  const [resolverQuery, setResolverQuery] = useState<string>('');
  const [matrixSearch, setMatrixSearch] = useState<string>('');

  // Edit Beat Modal State
  const [editingBeat, setEditingBeat] = useState<ConsolidatedBeatEntry | null>(null);
  const [editColonies, setEditColonies] = useState<string>('');
  const [editSectors, setEditSectors] = useState<string>('');
  const [editLandmarks, setEditLandmarks] = useState<string>('');
  const [editStaffId, setEditStaffId] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Relief Allocated' | 'Vacant Charge'>('Active');
  const [editHouseholds, setEditHouseholds] = useState<number>(500);

  // Property Details Drawer / Modal State
  const [inspectingProperty, setInspectingProperty] = useState<PropertyItem | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sequential Properties List
  const [sequentialProperties, setSequentialProperties] = useState<PropertyItem[]>(() => {
    try {
      const stored = localStorage.getItem('dadabari_sequence_properties_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_SEQUENTIAL_PROPERTIES;
  });

  // Scoped base datasets for Postman/GDS vs Master Admin
  const scopedSequentialProperties = useMemo(() => {
    if (!isRestrictedStaff) return sequentialProperties;
    return sequentialProperties.filter((p) =>
      staffPermissionService.matchesUserBeatScope(currentProfile, {
        beatNo: p.beatNo,
        area: p.colony,
        pincode: p.pincode,
        assignedStaffId: p.assignedStaffId,
        assignedStaffName: p.assignedStaffName,
      })
    );
  }, [sequentialProperties, isRestrictedStaff, currentProfile]);

  const scopedBeatMatrix = useMemo(() => {
    if (!isRestrictedStaff) return beatMatrix;
    return beatMatrix.filter((b) =>
      staffPermissionService.matchesUserBeatScope(currentProfile, {
        beatNo: b.beatNumber,
        officeId: b.deliveryOffice,
        area: b.coloniesFormatted,
        pincode: b.pincode,
        assignedStaffId: b.staffId,
        assignedStaffName: b.assignedPostmanName,
      })
    );
  }, [beatMatrix, isRestrictedStaff, currentProfile]);

  // Distinct Delivery Offices List
  const deliveryOfficeStats = useMemo(() => {
    const map = new Map<string, number>();
    scopedBeatMatrix.forEach((b) => {
      map.set(b.deliveryOffice, (map.get(b.deliveryOffice) || 0) + 1);
    });
    return Array.from(map.entries()).map(([office, count]) => ({
      office,
      count,
    }));
  }, [scopedBeatMatrix]);

  // Distinct Colonies List for Dropdown Selector
  const uniqueColoniesList = useMemo(() => {
    const set = new Set<string>();
    scopedSequentialProperties.forEach((p) => {
      if (p.colony) set.add(p.colony.trim());
    });
    return ['All', ...Array.from(set).sort()];
  }, [scopedSequentialProperties]);

  // All 33 Beats List (restricted to staff's beats when Postman/GDS)
  const all33BeatsList = useMemo(() => {
    if (isRestrictedStaff) {
      const allowed = Array.from(staffPermissionService.getScopedBeatsSet(currentProfile));
      return allowed.length > 0 ? ['All', ...allowed] : ['All', currentProfile?.beat || 'Beat 2'];
    }
    return ['All', ...Array.from({ length: 33 }, (_, i) => `Beat ${i + 1}`)];
  }, [isRestrictedStaff, currentProfile]);

  // 1. FILTERED SEQUENTIAL PROPERTIES with multi-parameter inputs
  const filteredAndSortedProperties = useMemo(() => {
    return scopedSequentialProperties
      .filter((p) => {
        // Colony Dropdown Filter
        const matchColony = selectedColony === 'All' || p.colony.toLowerCase() === selectedColony.toLowerCase();

        // Upper Beat Dropdown Filter (Beat 1 to Beat 33)
        const matchBeat = selectedUpperBeat === 'All' || p.beatNo === selectedUpperBeat;

        // Customer Name Filter (Real-time string matching)
        const nameQ = customerNameSearch.toLowerCase().trim();
        const matchName =
          !nameQ ||
          p.primaryCustomerName.toLowerCase().includes(nameQ) ||
          p.residents.some((r) => r.toLowerCase().includes(nameQ));

        // House / Plot Number Filter
        const houseQ = houseNoSearch.toLowerCase().replace(/\s+/g, '');
        const matchHouse = !houseQ || p.housePlotNumber.toLowerCase().replace(/\s+/g, '').includes(houseQ);

        // Mobile & WhatsApp Number Filter (Direct 10-digit lookup)
        const cleanMobileQ = mobileSearch.replace(/\D/g, '');
        const matchMobile =
          !cleanMobileQ ||
          p.primaryMobile.replace(/\D/g, '').includes(cleanMobileQ) ||
          (p.whatsapp && p.whatsapp.replace(/\D/g, '').includes(cleanMobileQ));

        // Property Type Filter
        const matchType = propertyTypeFilter === 'All' || p.propertyType === propertyTypeFilter;

        // Status Filter
        const matchStatus = seqStatusFilter === 'All' || p.status === seqStatusFilter;

        return matchColony && matchBeat && matchName && matchHouse && matchMobile && matchType && matchStatus;
      })
      .sort((a, b) => {
        if (a.colony !== b.colony) return a.colony.localeCompare(b.colony);
        if (a.beatNo !== b.beatNo) return a.beatNo.localeCompare(b.beatNo);
        return a.houseNoSeq - b.houseNoSeq;
      });
  }, [
    scopedSequentialProperties,
    selectedColony,
    selectedUpperBeat,
    customerNameSearch,
    houseNoSearch,
    mobileSearch,
    propertyTypeFilter,
    seqStatusFilter,
  ]);

  useEffect(() => {
    setSeqPage(1);
  }, [
    selectedColony,
    selectedUpperBeat,
    customerNameSearch,
    houseNoSearch,
    mobileSearch,
    propertyTypeFilter,
    seqStatusFilter,
  ]);

  const seqTotalPages = Math.max(1, Math.ceil(filteredAndSortedProperties.length / SEQ_PAGE_SIZE));
  const safeSeqPage = Math.min(seqPage, seqTotalPages);
  const paginatedProperties = useMemo(
    () =>
      filteredAndSortedProperties.slice(
        (safeSeqPage - 1) * SEQ_PAGE_SIZE,
        safeSeqPage * SEQ_PAGE_SIZE
      ),
    [filteredAndSortedProperties, safeSeqPage]
  );

  // Active Filter Count for reset indicator
  const activePropertyFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedColony !== 'All') count++;
    if (selectedUpperBeat !== 'All') count++;
    if (customerNameSearch.trim()) count++;
    if (houseNoSearch.trim()) count++;
    if (mobileSearch.trim()) count++;
    if (propertyTypeFilter !== 'All') count++;
    if (seqStatusFilter !== 'All') count++;
    return count;
  }, [
    selectedColony,
    selectedUpperBeat,
    customerNameSearch,
    houseNoSearch,
    mobileSearch,
    propertyTypeFilter,
    seqStatusFilter,
  ]);

  const handleResetPropertyFilters = () => {
    setSelectedColony('All');
    setSelectedUpperBeat('All');
    setCustomerNameSearch('');
    setHouseNoSearch('');
    setMobileSearch('');
    setPropertyTypeFilter('All');
    setSeqStatusFilter('All');
  };

  // 2. Filtered Consolidated Matrix for Matrix View Tab
  const filteredMatrix = useMemo(() => {
    return scopedBeatMatrix
      .filter((entry) => {
        const matchOffice = officeFilter === 'ALL' || entry.deliveryOffice === officeFilter;
        const matchPincode = pincodeFilter === 'ALL' || entry.pincode === pincodeFilter;
        const matchBeat = selectedBeatNo === 'ALL' || entry.beatNumber === selectedBeatNo;
        const matchStaff =
          selectedStaffFilter === 'ALL' ||
          entry.assignedPostmanName === selectedStaffFilter ||
          entry.staffId === selectedStaffFilter;

        const q = matrixSearch.toLowerCase().trim();
        const matchSearch =
          !q ||
          entry.beatNumber.toLowerCase().includes(q) ||
          entry.deliveryOffice.toLowerCase().includes(q) ||
          entry.officeName.toLowerCase().includes(q) ||
          entry.pincode.includes(q) ||
          entry.coloniesFormatted.toLowerCase().includes(q) ||
          entry.sectorsFormatted.toLowerCase().includes(q) ||
          entry.landmarksFormatted.toLowerCase().includes(q) ||
          entry.assignedPostmanName.toLowerCase().includes(q) ||
          (entry.staffId && entry.staffId.toLowerCase().includes(q)) ||
          entry.assignedPostmanContact.includes(q);

        return matchOffice && matchPincode && matchBeat && matchStaff && matchSearch;
      })
      .sort((a, b) => a.beatSeq - b.beatSeq);
  }, [scopedBeatMatrix, officeFilter, pincodeFilter, selectedBeatNo, selectedStaffFilter, matrixSearch]);

  useEffect(() => {
    setMatrixPage(1);
  }, [officeFilter, pincodeFilter, selectedBeatNo, selectedStaffFilter, matrixSearch]);

  const matrixTotalPages = Math.max(1, Math.ceil(filteredMatrix.length / SEQ_PAGE_SIZE));
  const safeMatrixPage = Math.min(matrixPage, matrixTotalPages);
  const paginatedMatrix = useMemo(
    () => filteredMatrix.slice((safeMatrixPage - 1) * SEQ_PAGE_SIZE, safeMatrixPage * SEQ_PAGE_SIZE),
    [filteredMatrix, safeMatrixPage]
  );

  // Live Instant Resolver (Scoped for Postman/GDS)
  const liveResolvedBeat = useMemo(() => {
    if (!resolverQuery.trim()) return null;
    const pref = officeFilter !== 'ALL' ? officeFilter : pincodeFilter !== 'ALL' ? pincodeFilter : undefined;
    const resolved = resolveAddressToConsolidatedBeat(resolverQuery, pref);
    if (
      resolved &&
      isRestrictedStaff &&
      !staffPermissionService.matchesUserBeatScope(currentProfile, {
        beatNo: resolved.beatNumber,
        officeId: resolved.deliveryOffice,
        area: resolved.coloniesFormatted,
        pincode: resolved.pincode,
        assignedStaffId: resolved.staffId,
        assignedStaffName: resolved.assignedPostmanName,
      })
    ) {
      return null;
    }
    return resolved;
  }, [resolverQuery, officeFilter, pincodeFilter, isRestrictedStaff, currentProfile]);

  // Export Properties to Excel
  const handleExportPropertiesExcel = () => {
    const dataToExport = filteredAndSortedProperties.map((p, idx) => ({
      'Sequence No': `#${idx + 1}`,
      'House / Plot No': p.housePlotNumber,
      'Colony': p.colony,
      'Block / Sector': p.blockSector,
      'Pincode': p.pincode,
      'Beat Number': p.beatNo,
      'Primary Customer': p.primaryCustomerName,
      'Mobile Number': p.primaryMobile,
      'WhatsApp Number': p.whatsapp || p.primaryMobile,
      'Residents': p.residents.join(', '),
      'Landmark': p.landmark,
      'Property Type': p.propertyType,
      'Status': p.status,
      'Assigned Postman': p.assignedStaffName,
      'Staff Role': p.assignedStaffRole,
      'Staff ID': p.assignedStaffId,
      'Last Mile Operational Note': p.lastMileNote,
      'Verification Status': p.verificationStatus,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sequence_Properties');
    XLSX.writeFile(
      workbook,
      `Dadabari_Properties_Route_${selectedUpperBeat}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  // Open Edit Beat Modal
  const handleOpenEdit = (beat: ConsolidatedBeatEntry) => {
    setEditingBeat(beat);
    setEditColonies(beat.colonies.join(', '));
    setEditSectors(beat.sectors.join(', '));
    setEditLandmarks(beat.landmarks.join(', '));
    setEditStaffId(beat.staffId || '');
    setEditStatus(beat.deliveryStatus);
    setEditHouseholds(beat.estimatedHouseholds || 500);
  };

  // Save Beat Changes
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBeat) return;

    const matchedStaff = UPDATED_STAFF_LIST.find((s) => s.id === editStaffId);

    const updatedColonies = editColonies
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    const updatedSectors = editSectors
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const updatedLandmarks = editLandmarks
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    const updatedList = beatMatrix.map((item) => {
      if (item.id === editingBeat.id) {
        return {
          ...item,
          colonies: updatedColonies,
          coloniesFormatted: updatedColonies.join(', '),
          sectors: updatedSectors,
          sectorsFormatted: updatedSectors.join(', '),
          landmarks: updatedLandmarks,
          landmarksFormatted: updatedLandmarks.join(', '),
          staffId: matchedStaff ? matchedStaff.id : item.staffId,
          staffRole: matchedStaff ? (matchedStaff.role as any) : item.staffRole,
          assignedPostmanName: matchedStaff ? matchedStaff.name : item.assignedPostmanName,
          assignedPostmanContact: matchedStaff ? matchedStaff.contact : item.assignedPostmanContact,
          deliveryStatus: editStatus,
          estimatedHouseholds: editHouseholds,
        };
      }
      return item;
    });

    setBeatMatrix(updatedList);
    try {
      localStorage.setItem('dadabari_consolidated_beat_matrix_v3', JSON.stringify(updatedList));
    } catch {
      // fallback
    }

    setToastMessage(`✅ Successfully updated ${editingBeat.beatNumber} (${editingBeat.deliveryOffice})!`);
    setTimeout(() => setToastMessage(null), 4000);
    setEditingBeat(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen font-sans">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold tracking-wider uppercase border border-blue-400/30">
              <ShieldCheck size={14} className="text-cyan-400" />
              <span>POSTMAN BOOK CRM · DADABARI S.O. ECOSYSTEM (324009)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sequence-Wise Property Hub & Door Delivery Route
            </h1>
            <p className="text-blue-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Ascending door-to-door sequence, multi-parameter customer search, colony dropdowns,
              and dedicated <b>Beat 1 to Beat 33</b> jurisdiction mapping with live WhatsApp & call triggers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-indigo-950/90 px-4 py-2 rounded-2xl border border-indigo-700/60 text-xs text-indigo-100 flex items-center gap-2 shadow-inner">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>
                Active Beats: <b>Beat 1 to Beat 33</b> (Dadabari S.O.)
              </span>
            </div>
            <button
              onClick={handleExportPropertiesExcel}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-2 shadow-xs cursor-pointer"
              title="Download Properties Route Sheet (.xlsx)"
            >
              <FileSpreadsheet size={15} className="text-emerald-400" />
              <span>Export Route (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {toastMessage && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-3 text-emerald-900 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs text-emerald-800 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main View Mode Selector Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-3 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setHubMode('SEQUENCE')}
          className={`px-4 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            hubMode === 'SEQUENCE'
              ? 'bg-blue-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 size={16} />
          <span>Sequential Door-to-Door Property Route ({filteredAndSortedProperties.length} Properties)</span>
        </button>
        <button
          type="button"
          onClick={() => setHubMode('MATRIX')}
          className={`px-4 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            hubMode === 'MATRIX'
              ? 'bg-blue-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Table size={16} />
          <span>Cleaned Master Beat-Colony Matrix ({filteredMatrix.length} Rows · Beat 1-33)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: SEQUENTIAL DOOR-TO-DOOR ROUTE WITH ADVANCED TOOLBAR (MAIN VIEW) */}
      {/* ========================================================================= */}
      {hubMode === 'SEQUENCE' && (
        <div className="space-y-6">
          {/* ========================================================================= */}
          {/* 1. ENHANCED DROPDOWN & SEARCH FILTERS TOOLBAR (CORE USER REQUIREMENT) */}
          {/* ========================================================================= */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Enhanced Door-to-Door Route Filters & Staff Jurisdiction Toolbar
                </h3>
                {activePropertyFiltersCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black">
                    {activePropertyFiltersCount} Filter{activePropertyFiltersCount > 1 ? 's' : ''} Active
                  </span>
                )}
              </div>

              {/* View Switcher Toggle (Card View vs. Table View) */}
              <div className="flex items-center gap-2">
                <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPropertyViewLayout('CARD')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                      propertyViewLayout === 'CARD'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Grid size={13} />
                    <span>Card View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropertyViewLayout('TABLE')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                      propertyViewLayout === 'TABLE'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Table size={13} />
                    <span>Follow-Up Table</span>
                  </button>
                </div>

                {activePropertyFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetPropertyFilters}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 rounded-lg hover:bg-indigo-50 transition cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Filter Inputs Grid: Colony Dropdown, Upper Beat Dropdown, Customer Name, House No, Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* 1. Colony Dropdown Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin size={12} className="text-indigo-600" />
                  <span>Colony Dropdown:</span>
                </label>
                <select
                  value={selectedColony}
                  onChange={(e) => setSelectedColony(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
                >
                  <option value="All">All Colonies ({uniqueColoniesList.length - 1})</option>
                  {uniqueColoniesList
                    .filter((c) => c !== 'All')
                    .map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                </select>
              </div>

              {/* 2. Upper Beat Dropdown Filter (Beat 1 to Beat 33) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Building2 size={12} className="text-amber-600" />
                  <span>Beat (1 to 33):</span>
                </label>
                <select
                  value={selectedUpperBeat}
                  onChange={(e) => setSelectedUpperBeat(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
                >
                  <option value="All">All Beats (1 - 33)</option>
                  {all33BeatsList
                    .filter((b) => b !== 'All')
                    .map((b) => {
                      const staff = BEAT_STAFF_LOOKUP[b];
                      return (
                        <option key={b} value={b}>
                          {b} {staff ? `· ${staff.name.split(' ')[0]}` : ''}
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* 3. Customer Name Search Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User size={12} className="text-emerald-600" />
                  <span>Customer Name:</span>
                </label>
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Roshni, Satish..."
                    value={customerNameSearch}
                    onChange={(e) => setCustomerNameSearch(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  {customerNameSearch && (
                    <button
                      type="button"
                      onClick={() => setCustomerNameSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* 4. House / Plot Number Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Home size={12} className="text-blue-600" />
                  <span>House / Plot No:</span>
                </label>
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. 46-B, 162, 3-A..."
                    value={houseNoSearch}
                    onChange={(e) => setHouseNoSearch(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                  {houseNoSearch && (
                    <button
                      type="button"
                      onClick={() => setHouseNoSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* 5. Mobile & WhatsApp Direct Lookup Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone size={12} className="text-green-600" />
                  <span>Mobile / WhatsApp:</span>
                </label>
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="10-digit mobile..."
                    value={mobileSearch}
                    onChange={(e) => setMobileSearch(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                  />
                  {mobileSearch && (
                    <button
                      type="button"
                      onClick={() => setMobileSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Status and Property Type Pills */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Category:</span>
                {['All', 'Residential', 'Commercial', 'Mixed'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPropertyTypeFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      propertyTypeFilter === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-slate-500">
                Found <b>{filteredAndSortedProperties.length}</b> properties matching search criteria
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LAYOUT 1: CARD VIEW (GRID / CARD LAYOUT - CORE USER REQUIREMENT) */}
          {/* ========================================================================= */}
          {propertyViewLayout === 'CARD' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedProperties.map((prop, idx) => (
                <div
                  key={prop.id}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-indigo-400 shadow-xs hover:shadow-lg transition p-5 flex flex-col justify-between space-y-4 group relative overflow-hidden"
                >
                  {/* Card Header: Sequence Tag, House No, Type Badge */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-950 text-white font-mono text-[11px] font-black">
                          #{(safeSeqPage - 1) * SEQ_PAGE_SIZE + idx + 1}
                        </span>
                        <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition">
                          {prop.housePlotNumber}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                            prop.propertyType === 'Commercial'
                              ? 'bg-amber-100 text-amber-800'
                              : prop.propertyType === 'Mixed'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {prop.propertyType}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prop.status === 'Occupied'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {prop.status}
                        </span>
                      </div>
                    </div>

                    {/* Colony & Block */}
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin size={13} className="text-indigo-600 shrink-0" />
                        <span>
                          {prop.colony} · {prop.blockSector}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 italic pl-5">
                        {prop.landmark}
                      </div>
                    </div>

                    {/* Resident Members Chips */}
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Residents & Primary Contact:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {prop.residents.map((res, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 font-semibold text-xs border border-indigo-100"
                          >
                            {res}
                          </span>
                        ))}
                      </div>

                      {/* Primary Mobile */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {prop.primaryMobile}
                        </span>
                        {prop.whatsapp && (
                          <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.2 rounded font-bold">
                            WhatsApp
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Role, Authority & Staff Directory Mapping (User Requirement 2) */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-950 flex items-center gap-1">
                          <BadgeAlert size={12} className="text-amber-600" />
                          <span>{prop.beatNo} (Dadabari 324009)</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                          {prop.assignedStaffId}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Staff: <b>{prop.assignedStaffName}</b> ({prop.assignedStaffRole})
                      </div>
                    </div>

                    {/* Last-Mile Operational Note */}
                    {prop.lastMileNote && (
                      <div className="mt-2.5 text-[11px] bg-amber-50/80 border border-amber-200/60 p-2 rounded-xl text-amber-950 flex items-start gap-1.5">
                        <Sparkles size={13} className="text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <b>Field Note:</b> {prop.lastMileNote}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Floating Action Triggers at bottom */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${prop.primaryMobile}`}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
                        title="Direct Call Resident"
                      >
                        <Phone size={14} />
                      </a>
                      {prop.whatsapp && (
                        <a
                          href={`https://wa.me/91${prop.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition border border-green-200"
                          title="Open WhatsApp Chat"
                        >
                          <MessageCircle size={14} />
                        </a>
                      )}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${prop.housePlotNumber}, ${prop.colony}, Kota, Rajasthan 324009`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200"
                        title="Navigate on Google Maps"
                      >
                        <Navigation size={14} />
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => setInspectingProperty(prop)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* LAYOUT 2: FOLLOW-UP & DIRECT LEAD TABLE VIEW (USER REQUIREMENT 1) */}
          {/* ========================================================================= */}
          {propertyViewLayout === 'TABLE' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-extrabold text-xs text-slate-700 flex items-center justify-between">
                <span>Follow-Up & Direct Delivery Log Table ({filteredAndSortedProperties.length} Properties)</span>
                <span className="text-[11px] text-indigo-700">
                  Sorted Ascending by Colony → Beat → House Sequence
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700 font-extrabold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3.5">Seq #</th>
                      <th className="py-3 px-3.5">House / Plot</th>
                      <th className="py-3 px-3.5">Colony & Block</th>
                      <th className="py-3 px-3.5">Primary Contact</th>
                      <th className="py-3 px-3.5">Assigned Postman & Beat</th>
                      <th className="py-3 px-3.5">Last-Mile Operational Note</th>
                      <th className="py-3 px-3.5 text-center">Type</th>
                      <th className="py-3 px-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedProperties.map((prop, idx) => (
                      <tr key={prop.id} className="hover:bg-indigo-50/40 transition">
                        {/* Seq # */}
                        <td className="py-3 px-3.5 font-mono font-bold text-slate-500 whitespace-nowrap">
                          #{(safeSeqPage - 1) * SEQ_PAGE_SIZE + idx + 1}
                        </td>

                        {/* House / Plot */}
                        <td className="py-3 px-3.5 font-extrabold text-slate-900 whitespace-nowrap">
                          <span className="text-sm font-black text-indigo-950">{prop.housePlotNumber}</span>
                          <div className="text-[10px] text-slate-400 font-normal">PIN {prop.pincode}</div>
                        </td>

                        {/* Colony & Block */}
                        <td className="py-3 px-3.5 max-w-xs">
                          <div className="font-bold text-slate-800">{prop.colony}</div>
                          <div className="text-[11px] text-slate-500">{prop.blockSector}</div>
                          <div className="text-[10px] text-slate-400 italic truncate max-w-[200px]">
                            {prop.landmark}
                          </div>
                        </td>

                        {/* Primary Contact & Residents */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{prop.primaryCustomerName}</div>
                          <a
                            href={`tel:${prop.primaryMobile}`}
                            className="font-mono text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <Phone size={10} />
                            <span>{prop.primaryMobile}</span>
                          </a>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {prop.residents.length} resident{prop.residents.length > 1 ? 's' : ''}
                          </div>
                        </td>

                        {/* Assigned Postman & Beat */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-extrabold text-[11px]">
                              {prop.beatNo}
                            </span>
                            <span className="font-mono text-[10px] bg-purple-100 text-purple-800 px-1 py-0.2 rounded font-bold">
                              {prop.assignedStaffId}
                            </span>
                          </div>
                          <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                            {prop.assignedStaffName} ({prop.assignedStaffRole})
                          </div>
                        </td>

                        {/* Last Mile Operational Note */}
                        <td className="py-3 px-3.5 max-w-xs text-[11px] text-slate-600">
                          {prop.lastMileNote ? (
                            <span className="text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60 block">
                              {prop.lastMileNote}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No notes</span>
                          )}
                        </td>

                        {/* Type */}
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              prop.propertyType === 'Commercial'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {prop.propertyType}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <a
                              href={`tel:${prop.primaryMobile}`}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                              title="Call"
                            >
                              <Phone size={13} />
                            </a>
                            {prop.whatsapp && (
                              <a
                                href={`https://wa.me/91${prop.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition"
                                title="WhatsApp"
                              >
                                <MessageCircle size={13} />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => setInspectingProperty(prop)}
                              className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
                              title="View Details"
                            >
                              <Eye size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredAndSortedProperties.length > 0 && (
            <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 shadow-xs">
              <span>
                Showing <strong>{(safeSeqPage - 1) * SEQ_PAGE_SIZE + 1}</strong>–
                <strong>{Math.min(safeSeqPage * SEQ_PAGE_SIZE, filteredAndSortedProperties.length)}</strong> of{' '}
                <strong>{filteredAndSortedProperties.length}</strong> properties (Max 5 per view)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safeSeqPage <= 1}
                  onClick={() => setSeqPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                <span className="px-2.5 font-mono font-bold text-slate-800">
                  Page {safeSeqPage} / {seqTotalPages}
                </span>
                <button
                  type="button"
                  disabled={safeSeqPage >= seqTotalPages}
                  onClick={() => setSeqPage((p) => Math.min(seqTotalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {filteredAndSortedProperties.length === 0 && (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No properties match your filter criteria</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try selecting a different colony or beat, or clear the customer name / mobile number filter.
              </p>
              <button
                type="button"
                onClick={handleResetPropertyFilters}
                className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CLEANED MASTER BEAT MAPPING MATRIX (BEAT 1 TO 33) */}
      {/* ========================================================================= */}
      {hubMode === 'MATRIX' && (
        <div className="space-y-6">
          {/* Instant Address Resolver */}
          <div className="bg-gradient-to-r from-amber-50 via-indigo-50 to-blue-50 p-5 sm:p-6 rounded-3xl border border-indigo-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-indigo-950 font-black text-sm">
                  <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span>Instant Address & Colony Beat Resolver (Zero Duplicate Results)</span>
                </div>
                <p className="text-xs text-indigo-800 mt-0.5">
                  Type any colony (e.g. <i>Keshavpura, Santoshi Nagar, Mahaveer Nagar, Basant Vihar</i>) or landmark to instantly resolve designated Beat, Postman, Staff ID, and Official Mobile.
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Santoshi Nagar, Samrat Chowk, 324009..."
                  value={resolverQuery}
                  onChange={(e) => setResolverQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-indigo-200 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800 focus:outline-hidden shadow-xs"
                />
              </div>
            </div>

            {/* Resolved Beat Output Box */}
            {resolverQuery.trim() && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {liveResolvedBeat ? (
                  <div className="bg-white p-5 rounded-2xl border-2 border-indigo-400 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-xl bg-indigo-950 text-white font-black text-xs tracking-wide">
                          {liveResolvedBeat.beatNumber}
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-900 font-bold text-xs border border-blue-300">
                          {liveResolvedBeat.deliveryOffice}
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 font-mono">
                          PIN {liveResolvedBeat.pincode}
                        </span>
                        {liveResolvedBeat.staffId && (
                          <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 font-bold text-xs border border-purple-200 font-mono">
                            ID: {liveResolvedBeat.staffId}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-700 space-y-1">
                        <div>
                          <strong className="text-slate-900">Mapped Colonies:</strong>{' '}
                          <span className="font-semibold text-indigo-700">{liveResolvedBeat.coloniesFormatted}</span>
                        </div>
                        <div>
                          <strong className="text-slate-900">Assigned Sectors:</strong>{' '}
                          <span>{liveResolvedBeat.sectorsFormatted}</span>
                        </div>
                        <div>
                          <strong className="text-slate-900">Prominent Landmarks:</strong>{' '}
                          <span className="text-slate-600 italic">{liveResolvedBeat.landmarksFormatted}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shrink-0 space-y-1 text-center md:text-right">
                      <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                        Designated Beat Postman
                      </div>
                      <div className="text-base font-black text-slate-900">
                        {liveResolvedBeat.assignedPostmanName}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600">
                        Role: {liveResolvedBeat.staffRole || 'POSTMAN'}
                      </div>
                      <a
                        href={`tel:${liveResolvedBeat.assignedPostmanContact}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs font-bold transition shadow-xs mt-1"
                      >
                        <Phone size={13} />
                        <span>{liveResolvedBeat.assignedPostmanContact}</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 font-semibold flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-600 shrink-0" />
                    <span>No exact beat match found for "{resolverQuery}". Try searching by sector or colony name.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delivery Office Filter Tabs */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setOfficeFilter('ALL')}
                className={`px-3.5 py-2 rounded-2xl font-bold text-xs transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  officeFilter === 'ALL'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>All Delivery Offices</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">
                  {scopedBeatMatrix.length}
                </span>
              </button>

              {deliveryOfficeStats.map(({ office, count }) => (
                <button
                  key={office}
                  type="button"
                  onClick={() => setOfficeFilter(office)}
                  className={`px-3.5 py-2 rounded-2xl font-bold text-xs transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    officeFilter === office
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{office}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">
                    {count}
                  </span>
                  {office === 'Dadabari S.O.' && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-700 px-1.5 py-0.2 rounded font-extrabold uppercase">
                      33 Beats
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Beat & Pincode</th>
                    <th className="py-3 px-4">Delivery Office</th>
                    <th className="py-3 px-4">Assigned Staff & ID</th>
                    <th className="py-3 px-4">Consolidated Colonies & Sectors</th>
                    <th className="py-3 px-4">Consolidated Prominent Landmarks</th>
                    <th className="py-3 px-4 text-center">Volume</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedMatrix.map((entry) => (
                    <tr key={entry.id} className="hover:bg-indigo-50/40 transition">
                      {/* Beat & PIN */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-xl bg-indigo-950 text-white font-black text-xs">
                            {entry.beatNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg font-mono text-[11px] font-black bg-blue-100 text-blue-900">
                            {entry.pincode}
                          </span>
                        </div>
                      </td>

                      {/* Delivery Office */}
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-semibold">
                        <div className="flex items-center gap-1">
                          <Building size={13} className="text-slate-400" />
                          <span className="font-bold text-slate-900">{entry.deliveryOffice}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{entry.division}</div>
                      </td>

                      {/* Assigned Staff & ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900">{entry.assignedPostmanName}</span>
                          {entry.staffId && (
                            <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-mono text-[10px] font-black border border-purple-200">
                              {entry.staffId}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                            {entry.staffRole || 'POSTMAN'}
                          </span>
                          <a
                            href={`tel:${entry.assignedPostmanContact}`}
                            className="inline-flex items-center gap-1 font-mono text-xs font-bold text-indigo-700 hover:text-indigo-900"
                          >
                            <Phone size={11} className="text-emerald-600" />
                            <span>{entry.assignedPostmanContact}</span>
                          </a>
                        </div>
                      </td>

                      {/* Consolidated Colonies */}
                      <td className="py-3.5 px-4 max-w-xs space-y-1">
                        <div className="font-bold text-indigo-950 leading-tight">
                          {entry.coloniesFormatted}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {entry.sectors.map((sec, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold"
                            >
                              {sec}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Consolidated Landmarks */}
                      <td className="py-3.5 px-4 max-w-sm text-slate-600 leading-relaxed text-[11px]">
                        <span className="italic">{entry.landmarksFormatted}</span>
                      </td>

                      {/* Volume */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono font-bold text-slate-700">
                        {entry.estimatedHouseholds}+
                        <div className="text-[10px] text-slate-400 font-sans font-normal">hh/month</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {!isRestrictedStaff ? (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(entry)}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition flex items-center gap-1 mx-auto cursor-pointer"
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Beat Assigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMatrix.length > 0 && (
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                <span>
                  Showing <strong>{(safeMatrixPage - 1) * SEQ_PAGE_SIZE + 1}</strong>–
                  <strong>{Math.min(safeMatrixPage * SEQ_PAGE_SIZE, filteredMatrix.length)}</strong> of{' '}
                  <strong>{filteredMatrix.length}</strong> beat rows (Max 5 per view)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safeMatrixPage <= 1}
                    onClick={() => setMatrixPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>Prev</span>
                  </button>
                  <span className="px-2.5 font-mono font-bold text-slate-800">
                    Page {safeMatrixPage} / {matrixTotalPages}
                  </span>
                  <button
                    type="button"
                    disabled={safeMatrixPage >= matrixTotalPages}
                    onClick={() => setMatrixPage((p) => Math.min(matrixTotalPages, p + 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROPERTY PROFILE INSPECTOR MODAL */}
      {/* ========================================================================= */}
      {inspectingProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-base">
                  Property Details: {inspectingProperty.housePlotNumber}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-xs font-bold">
                  {inspectingProperty.propertyType}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectingProperty(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <div className="text-slate-500 font-semibold">Address & Landmark:</div>
                <div className="font-bold text-slate-900 text-sm">
                  {inspectingProperty.housePlotNumber}, {inspectingProperty.colony}, {inspectingProperty.blockSector}
                </div>
                <div className="text-slate-600 italic">Landmark: {inspectingProperty.landmark}</div>
                <div className="text-[11px] font-mono text-slate-500">PIN: {inspectingProperty.pincode} · Beat: {inspectingProperty.beatNo}</div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-500 font-semibold uppercase text-[10px]">Registered Residents:</div>
                <div className="flex flex-wrap gap-1.5">
                  {inspectingProperty.residents.map((r, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 font-bold border border-indigo-100">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1">
                <div className="text-[10px] font-bold text-indigo-700 uppercase">Assigned Delivery Postman:</div>
                <div className="text-sm font-black text-slate-900">{inspectingProperty.assignedStaffName}</div>
                <div className="text-[11px] text-slate-600">
                  Role: <b>{inspectingProperty.assignedStaffRole}</b> · ID: <b>{inspectingProperty.assignedStaffId}</b>
                </div>
              </div>

              {inspectingProperty.lastMileNote && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-amber-800">Last-Mile Operational Note:</div>
                  <div className="font-medium">{inspectingProperty.lastMileNote}</div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${inspectingProperty.primaryMobile}`}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5"
                >
                  <Phone size={13} />
                  <span>Call {inspectingProperty.primaryMobile}</span>
                </a>
                {inspectingProperty.whatsapp && (
                  <a
                    href={`https://wa.me/91${inspectingProperty.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5"
                  >
                    <MessageCircle size={13} />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setInspectingProperty(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BEAT MAPPING MODAL */}
      {editingBeat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-base">
                  Update Actual Data: {editingBeat.beatNumber}
                </h3>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-xs">
                  {editingBeat.deliveryOffice}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingBeat(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Designated Staff Member (From Staff Directory):
                </label>
                <select
                  value={editStaffId}
                  onChange={(e) => setEditStaffId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="">-- Keep Current ({editingBeat.assignedPostmanName}) --</option>
                  {UPDATED_STAFF_LIST.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.beat} · {staff.id} · {staff.contact})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Colonies (Comma-separated):
                </label>
                <textarea
                  rows={2}
                  value={editColonies}
                  onChange={(e) => setEditColonies(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Sectors / Blocks (Comma-separated):
                </label>
                <input
                  type="text"
                  value={editSectors}
                  onChange={(e) => setEditSectors(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prominent Delivery Landmarks (Comma-separated):
                </label>
                <textarea
                  rows={2}
                  value={editLandmarks}
                  onChange={(e) => setEditLandmarks(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBeat(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Save Beat Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
