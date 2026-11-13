import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  Users,
  Building2,
  Building,
  MapPin,
  Phone,
  Search,
  Filter,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  MessageCircle,
  Navigation,
  FileSpreadsheet,
  Download,
  Grid,
  Table as TableIcon,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  BadgePercent,
  Check,
  X,
  Send,
  Share2,
  History,
  PhoneCall,
  Layers,
  ArrowRight,
  RefreshCw,
  Store,
  Tag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { staffPermissionService } from '../../services/staffPermissionService';
import { Customer } from '../../types/models';
import { customerService } from '../../services/customerService';
import { UPDATED_STAFF_LIST } from '../../data/updatedStaffData';
import { CONSOLIDATED_BEAT_MATRIX } from '../../data/consolidatedBeatMatrix';
import { INITIAL_CUSTOMERS } from '../../data/initialMasterData';
import {
  DEFAULT_SEQUENTIAL_PROPERTIES,
  PropertyItem
} from './SequenceWisePropertyHub';
import {
  DADABARI_324009_VERIFIED_COMMERCIAL_REGISTRY,
  CommercialStoreEntry
} from '../../data/kotaCommercialCscData';
import {
  OFFICIAL_MAJOR_COLONIES,
  COLONY_HIERARCHY_MAP,
  getHierarchyColoniesList,
  getHierarchySectorsForColony,
  resolveColonySectorDetails,
  matchPropertyToSubSector,
} from '../../data/colonyHierarchyData';
import {
  getAuditedPincodeForColony,
  normalizeAndCleanColony,
  isSector6House3Or4,
  SECTOR_6_MERGED_PROPERTY_DHANRAJ,
} from '../../utils/dataAuditNormalization';

export type PropertyCategory = 'Residential' | 'Commercial' | 'Mixed' | 'Plot' | 'Damaged' | 'Under Construction';

export interface LinkedFamilyMember {
  id: string;
  name: string;
  roleInHousehold: 'Head of Household' | 'Spouse' | 'Son' | 'Daughter' | 'Father' | 'Mother' | 'Tenant' | 'Commercial Operator' | 'Family Member' | 'Other';
  mobile: string;
  whatsapp?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  occupation?: string;
  activeSchemes: {
    schemeName: 'PLI' | 'RPLI' | 'SSY' | 'IPPB' | 'MIS' | 'RD' | 'TD' | 'SCSS';
    accountNoOrPolicy?: string;
    sumAssuredOrBalance?: string;
    status: 'Active' | 'Lead Generated' | 'Follow-up Required';
  }[];
}

export interface DeliveryRemarkEntry {
  id: string;
  timestamp: string;
  authorName: string;
  authorRole: string;
  remarkText: string;
  statusTag: 'Standard Delivery' | 'Parcel Delivered' | 'Door Locked' | 'Address Shifted' | 'Scheme Lead Pitch' | 'Verification Done';
}

export interface UnifiedPropertyRecord {
  id: string;
  propertyCode: string; // e.g. "PROP-DAD-0021"
  housePlotNumber: string; // e.g. "46-B", "UIT 162", "Shop A-12"
  houseNo?: string;
  colony: string; // e.g. "Santoshi Nagar", "Keshavpura", "Mahaveer Nagar"
  sector?: string;
  block?: string;
  blockSector: string; // e.g. "Block B", "Sector 7", "Sector 1"
  pincode: string; // "324009"
  beatNo: string; // "Beat 1" to "Beat 33"
  deliveryOffice: string; // "Dadabari S.O."
  category: PropertyCategory;
  subTypeTag?: 'Commercial • eMitra / CSC' | 'Commercial • General Store / Retail' | 'Residential Household' | 'Mixed Unit';
  occupancyStatus: 'Occupied' | 'Vacant' | 'Rented';
  landmark: string;
  assignedStaffId: string;
  assignedStaffName: string;
  assignedStaffRole: string;
  lastMileNote: string;
  linkedMembers: LinkedFamilyMember[];
  chronologicalRemarks: DeliveryRemarkEntry[];
  verificationStatus: 'Verified' | 'Pending Verification' | 'Conflict';
  updatedAt: string;
}

// Master Beat Staff lookup
const BEAT_STAFF_MAP: Record<string, { id: string; name: string; role: string; contact: string }> = {};
UPDATED_STAFF_LIST.forEach((s) => {
  BEAT_STAFF_MAP[s.beat] = {
    id: s.id,
    name: s.name,
    role: s.role,
    contact: s.contact,
  };
});

// Helper to normalize colony names using Dadabari S.O. Data Normalization & Audit Engine
function normalizeColonyName(raw: string): string {
  const norm = normalizeAndCleanColony(raw);
  return norm.colony || 'Dadabari';
}

// Helper to normalize beat numbers
function normalizeBeatNumber(rawBeat: string | number | undefined, colony: string): string {
  if (rawBeat) {
    const str = String(rawBeat).trim();
    if (str.toLowerCase().startsWith('beat')) {
      const num = str.replace(/\D/g, '');
      return `Beat ${num || '2'}`;
    }
    const cleanNum = str.replace(/\D/g, '');
    if (cleanNum) return `Beat ${cleanNum}`;
  }
  // Lookup by colony in Beat Matrix
  const colLow = colony.toLowerCase();
  const matched = CONSOLIDATED_BEAT_MATRIX.find(b => 
    b.colonies.some(c => c.toLowerCase().includes(colLow)) ||
    colLow.includes(b.beatNumber.toLowerCase())
  );
  return matched ? matched.beatNumber : 'Beat 2';
}

// Baseline rich curated properties
const CURATED_BASELINE_PROPERTIES: UnifiedPropertyRecord[] = [
  {
    id: 'up-1',
    propertyCode: 'PROP-DAD-001',
    housePlotNumber: '3-A',
    colony: 'Santoshi Nagar',
    blockSector: 'Block A',
    pincode: '324009',
    beatNo: 'Beat 2',
    deliveryOffice: 'Dadabari S.O.',
    category: 'Residential',
    subTypeTag: 'Residential Household',
    occupancyStatus: 'Occupied',
    landmark: 'Main Road Chauraha, near Shiv Mandir Gali',
    assignedStaffId: 'STAFF-50457421',
    assignedStaffName: 'Mahendra Kumar Meena',
    assignedStaffRole: 'GDS/PMAN',
    lastMileNote: 'Blue iron gate, bell at right pillar. Handover to family head.',
    verificationStatus: 'Verified',
    updatedAt: '2026-10-15T10:30:00Z',
    linkedMembers: [
      {
        id: 'm-101',
        name: 'Roshni Sakywal',
        roleInHousehold: 'Head of Household',
        mobile: '8769706002',
        whatsapp: '8769706002',
        age: 38,
        gender: 'Female',
        occupation: 'Government Teacher',
        activeSchemes: [
          { schemeName: 'PLI', accountNoOrPolicy: 'PLI-RJ-884102', sumAssuredOrBalance: '₹10,00,000 (Suraksha)', status: 'Active' },
          { schemeName: 'SSY', accountNoOrPolicy: 'SSY-DAD-0492', sumAssuredOrBalance: '₹1,50,000/yr', status: 'Active' },
        ],
      },
      {
        id: 'm-102',
        name: 'Prakash Koli',
        roleInHousehold: 'Spouse',
        mobile: '9414589201',
        whatsapp: '9414589201',
        age: 42,
        gender: 'Male',
        occupation: 'PWD Engineer',
        activeSchemes: [
          { schemeName: 'IPPB', accountNoOrPolicy: 'IPPB-003841', sumAssuredOrBalance: '₹45,000', status: 'Active' },
        ],
      },
    ],
    chronologicalRemarks: [
      {
        id: 'rem-1',
        timestamp: '2026-10-14 11:20 AM',
        authorName: 'Mahendra Kumar Meena',
        authorRole: 'GDS/PMAN',
        remarkText: 'Delivered speed post article ED88391209IN to Roshni Sakywal. Doorstep verification confirmed.',
        statusTag: 'Parcel Delivered',
      },
      {
        id: 'rem-2',
        timestamp: '2026-10-02 04:15 PM',
        authorName: 'Mahendra Kumar Meena',
        authorRole: 'GDS/PMAN',
        remarkText: 'Pitched Sukanya Samriddhi top-up before festival season. Customer interested in PLI bonus review.',
        statusTag: 'Scheme Lead Pitch',
      },
    ],
  },
  {
    id: 'up-2',
    propertyCode: 'PROP-DAD-002',
    housePlotNumber: '46-B',
    colony: 'Santoshi Nagar',
    blockSector: 'Block B',
    pincode: '324009',
    beatNo: 'Beat 2',
    deliveryOffice: 'Dadabari S.O.',
    category: 'Residential',
    subTypeTag: 'Residential Household',
    occupancyStatus: 'Occupied',
    landmark: 'Corner House near Mamta Kirana Store',
    assignedStaffId: 'STAFF-50457421',
    assignedStaffName: 'Mahendra Kumar Meena',
    assignedStaffRole: 'GDS/PMAN',
    lastMileNote: 'Corner staircase on 1st floor. Regular SSY deposits.',
    verificationStatus: 'Verified',
    updatedAt: '2026-10-12T09:15:00Z',
    linkedMembers: [
      {
        id: 'm-201',
        name: 'Soniya Nayak',
        roleInHousehold: 'Head of Household',
        mobile: '9828876543',
        whatsapp: '9828876543',
        age: 34,
        gender: 'Female',
        occupation: 'Self Employed Boutique',
        activeSchemes: [
          { schemeName: 'SSY', accountNoOrPolicy: 'SSY-DAD-9921', sumAssuredOrBalance: '₹50,000/yr', status: 'Active' },
        ],
      },
      {
        id: 'm-202',
        name: 'Hariom Nayak',
        roleInHousehold: 'Spouse',
        mobile: '9828876544',
        whatsapp: '9828876544',
        age: 37,
        gender: 'Male',
        occupation: 'Transport Business',
        activeSchemes: [
          { schemeName: 'PLI', accountNoOrPolicy: 'PLI-RJ-9930', sumAssuredOrBalance: '₹5,00,000', status: 'Lead Generated' },
        ],
      },
      {
        id: 'm-203',
        name: 'Sunil Kumar (Tenant)',
        roleInHousehold: 'Tenant',
        mobile: '9602222629',
        age: 26,
        gender: 'Male',
        occupation: 'Coaching Faculty',
        activeSchemes: [
          { schemeName: 'IPPB', accountNoOrPolicy: 'IPPB-7741', sumAssuredOrBalance: 'Doorstep KYC', status: 'Active' },
        ],
      },
    ],
    chronologicalRemarks: [
      {
        id: 'rem-3',
        timestamp: '2026-10-11 02:40 PM',
        authorName: 'Mahendra Kumar Meena',
        authorRole: 'GDS/PMAN',
        remarkText: 'Delivered Cheque book for tenant Sunil. Verified electricity bill for address proof.',
        statusTag: 'Verification Done',
      },
    ],
  },
  {
    id: 'up-3',
    propertyCode: 'PROP-DAD-003',
    housePlotNumber: 'Plot 95',
    colony: 'Keshavpura',
    blockSector: 'Sector 7',
    pincode: '324009',
    beatNo: 'Beat 2',
    deliveryOffice: 'Dadabari S.O.',
    category: 'Residential',
    subTypeTag: 'Residential Household',
    occupancyStatus: 'Occupied',
    landmark: 'Near Shree Ram School Gate, Sector 7 Chauraha',
    assignedStaffId: 'STAFF-50457421',
    assignedStaffName: 'Mahendra Kumar Meena',
    assignedStaffRole: 'GDS/PMAN',
    lastMileNote: 'Double storey house with green parapet. Dog on premises.',
    verificationStatus: 'Verified',
    updatedAt: '2026-10-10T14:20:00Z',
    linkedMembers: [
      {
        id: 'm-301',
        name: 'Depti Mehra',
        roleInHousehold: 'Head of Household',
        mobile: '9928486812',
        whatsapp: '9928486812',
        age: 46,
        gender: 'Female',
        occupation: 'Homemaker / LIC Agent',
        activeSchemes: [
          { schemeName: 'PLI', accountNoOrPolicy: 'PLI-RJ-7741', sumAssuredOrBalance: '₹5,00,000 (Santosh)', status: 'Active' },
          { schemeName: 'RD', accountNoOrPolicy: 'RD-DAD-0294', sumAssuredOrBalance: '₹5,000/mo', status: 'Active' },
        ],
      },
      {
        id: 'm-302',
        name: 'Kailash Mehra',
        roleInHousehold: 'Spouse',
        mobile: '9928486813',
        age: 51,
        gender: 'Male',
        occupation: 'Senior Accounts Officer',
        activeSchemes: [
          { schemeName: 'MIS', accountNoOrPolicy: 'MIS-DAD-1188', sumAssuredOrBalance: '₹9,00,000 Joint', status: 'Active' },
        ],
      },
    ],
    chronologicalRemarks: [
      {
        id: 'rem-4',
        timestamp: '2026-10-09 10:15 AM',
        authorName: 'Mahendra Kumar Meena',
        authorRole: 'GDS/PMAN',
        remarkText: 'Delivered Postal Passbook after interest posting. MIS interest credit verified.',
        statusTag: 'Standard Delivery',
      },
    ],
  },
  {
    id: 'up-4',
    propertyCode: 'PROP-DAD-004',
    housePlotNumber: '817',
    colony: 'Patel Nagar',
    blockSector: 'Main Street',
    pincode: '324009',
    beatNo: 'Beat 2',
    deliveryOffice: 'Dadabari S.O.',
    category: 'Plot',
    subTypeTag: 'Residential Household',
    occupancyStatus: 'Vacant',
    landmark: 'Behind Water Tank, Patel Nagar Park',
    assignedStaffId: 'STAFF-50457421',
    assignedStaffName: 'Mahendra Kumar Meena',
    assignedStaffRole: 'GDS/PMAN',
    lastMileNote: 'Old tenant Rohit Yadav shifted to new house. Property locked.',
    verificationStatus: 'Conflict',
    updatedAt: '2026-10-08T11:00:00Z',
    linkedMembers: [
      {
        id: 'm-401',
        name: 'Rohit Yadav (Address Shifted)',
        roleInHousehold: 'Tenant',
        mobile: '7878615426',
        age: 31,
        gender: 'Male',
        occupation: 'Software Developer',
        activeSchemes: [
          { schemeName: 'IPPB', accountNoOrPolicy: 'IPPB-00991', sumAssuredOrBalance: 'KYC Relocation Req', status: 'Follow-up Required' },
        ],
      },
    ],
    chronologicalRemarks: [
      {
        id: 'rem-5',
        timestamp: '2026-10-07 03:00 PM',
        authorName: 'Mahendra Kumar Meena',
        authorRole: 'GDS/PMAN',
        remarkText: 'Parcel returned due to addressee left without forwarding address. Marked in relocation ledger.',
        statusTag: 'Address Shifted',
      },
    ],
  },
  {
    id: 'up-5',
    propertyCode: 'PROP-DAD-005',
    housePlotNumber: 'KH 222',
    colony: 'Keshavpura',
    blockSector: 'Sector 6',
    pincode: '324009',
    beatNo: 'Beat 2',
    deliveryOffice: 'Dadabari S.O.',
    category: 'Mixed',
    subTypeTag: 'Mixed Unit',
    occupancyStatus: 'Occupied',
    landmark: 'Main Market Road, near Kumhar Mohalla',
    assignedStaffId: 'STAFF-50457421',
    assignedStaffName: 'Mahendra Kumar Meena',
    assignedStaffRole: 'GDS/PMAN',
    lastMileNote: 'Ground floor grocery shop, residence on 1st floor.',
    verificationStatus: 'Verified',
    updatedAt: '2026-10-13T16:45:00Z',
    linkedMembers: [
      {
        id: 'm-501',
        name: 'Hemant Yadav',
        roleInHousehold: 'Head of Household',
        mobile: '9649734725',
        whatsapp: '9649734725',
        age: 40,
        gender: 'Male',
        occupation: 'General Merchant Store Owner',
        activeSchemes: [
          { schemeName: 'IPPB', accountNoOrPolicy: 'IPPB-QR-4412', sumAssuredOrBalance: 'Merchant QR Active', status: 'Active' },
          { schemeName: 'PLI', accountNoOrPolicy: 'PLI-RJ-5520', sumAssuredOrBalance: '₹15,00,000 (Suraksha)', status: 'Active' },
        ],
      },
    ],
    chronologicalRemarks: [
      {
        id: 'rem-6',
        timestamp: '2026-10-12 11:50 AM',
        authorName: 'Mahendra Kumar Meena',
        authorRole: 'GDS/PMAN',
        remarkText: 'Delivered business correspondence. Merchant QR working smoothly.',
        statusTag: 'Standard Delivery',
      },
    ],
  },
  {
    id: 'up-6',
    propertyCode: 'PROP-DAD-006',
    housePlotNumber: '2F-20',
    colony: 'Teachers Colony',
    blockSector: 'Block F',
    pincode: '324009',
    beatNo: 'Beat 6',
    deliveryOffice: 'Dadabari S.O.',
    category: 'Residential',
    subTypeTag: 'Residential Household',
    occupancyStatus: 'Occupied',
    landmark: 'Behind Government School, Near Community Hall',
    assignedStaffId: 'STAFF-10310731',
    assignedStaffName: 'Girish Kumar Mathur',
    assignedStaffRole: 'POSTMAN',
    lastMileNote: 'Retired Lecturer residence. Morning delivery preferred.',
    verificationStatus: 'Verified',
    updatedAt: '2026-10-14T09:00:00Z',
    linkedMembers: [
      {
        id: 'm-601',
        name: 'Rajendra Solanki',
        roleInHousehold: 'Head of Household',
        mobile: '9462725512',
        whatsapp: '9462725512',
        age: 62,
        gender: 'Male',
        occupation: 'Retired College Professor',
        activeSchemes: [
          { schemeName: 'SCSS', accountNoOrPolicy: 'SCSS-DAD-0912', sumAssuredOrBalance: '₹15,00,000 Max Deposit', status: 'Active' },
          { schemeName: 'MIS', accountNoOrPolicy: 'MIS-DAD-4412', sumAssuredOrBalance: '₹4,50,000', status: 'Active' },
        ],
      },
    ],
    chronologicalRemarks: [
      {
        id: 'rem-7',
        timestamp: '2026-10-13 09:30 AM',
        authorName: 'Girish Kumar Mathur',
        authorRole: 'POSTMAN',
        remarkText: 'Delivered Pension disbursement advisory letter. Customer verified in person.',
        statusTag: 'Parcel Delivered',
      },
    ],
  },
  {
    id: 'up-7',
    propertyCode: 'PROP-DAD-007',
    housePlotNumber: 'Plot 42-A',
    colony: 'Mahaveer Nagar',
    blockSector: 'Sector 3',
    pincode: '324005',
    beatNo: 'Beat 14',
    deliveryOffice: 'Dadabari S.O.',
    category: 'Commercial',
    subTypeTag: 'Commercial • General Store / Retail',
    occupancyStatus: 'Occupied',
    landmark: 'Opposite Central Park, Main Coaching Hub Road',
    assignedStaffId: 'STAFF-10310733',
    assignedStaffName: 'Satish Kumar Sharma',
    assignedStaffRole: 'POSTMAN',
    lastMileNote: 'Student hostel & cyber cafe. High speed post parcel volume.',
    verificationStatus: 'Verified',
    updatedAt: '2026-10-15T11:45:00Z',
    linkedMembers: [
      {
        id: 'm-701',
        name: 'Sunil Kumar Sharma',
        roleInHousehold: 'Head of Household',
        mobile: '9414188200',
        whatsapp: '9414188200',
        age: 48,
        gender: 'Male',
        occupation: 'Hostel & Cyber Cafe Proprietor',
        activeSchemes: [
          { schemeName: 'IPPB', accountNoOrPolicy: 'IPPB-M-8891', sumAssuredOrBalance: '₹1,20,000 Monthly Merchant Vol', status: 'Active' },
          { schemeName: 'PLI', accountNoOrPolicy: 'PLI-RJ-1192', sumAssuredOrBalance: '₹20,00,000', status: 'Active' },
        ],
      },
    ],
    chronologicalRemarks: [
      {
        id: 'rem-8',
        timestamp: '2026-10-15 11:20 AM',
        authorName: 'Satish Kumar Sharma',
        authorRole: 'POSTMAN',
        remarkText: 'Delivered 8 admit cards and 2 speed post documents for hostel students.',
        statusTag: 'Parcel Delivered',
      },
    ],
  },
  {
    id: 'up-8',
    propertyCode: 'PROP-DAD-008',
    housePlotNumber: 'Qtr VIP-07',
    colony: 'Thermal Colony',
    blockSector: 'Phase 3 VIP',
    pincode: '324009',
    beatNo: 'Beat 33',
    deliveryOffice: 'Dadabari S.O.',
    category: 'Residential',
    subTypeTag: 'Residential Household',
    occupancyStatus: 'Occupied',
    landmark: 'Thermal Main Gate 3, VIP Circuit House Road',
    assignedStaffId: 'STAFF-10310738',
    assignedStaffName: 'Jitendra Kumar Meena',
    assignedStaffRole: 'POSTMAN',
    lastMileNote: 'Entry pass required at Gate 3. Official departmental mail recipient.',
    verificationStatus: 'Verified',
    updatedAt: '2026-10-14T15:30:00Z',
    linkedMembers: [
      {
        id: 'm-801',
        name: 'Er. Jitendra Singh Rathore',
        roleInHousehold: 'Head of Household',
        mobile: '8696539977',
        whatsapp: '8696539977',
        age: 44,
        gender: 'Male',
        occupation: 'Executive Engineer Thermal Power Station',
        activeSchemes: [
          { schemeName: 'PLI', accountNoOrPolicy: 'PLI-KSTPS-991', sumAssuredOrBalance: '₹25,00,000 (Whole Life)', status: 'Active' },
        ],
      },
    ],
    chronologicalRemarks: [
      {
        id: 'rem-9',
        timestamp: '2026-10-14 03:15 PM',
        authorName: 'Jitendra Kumar Meena',
        authorRole: 'POSTMAN',
        remarkText: 'Delivered Official Government Gazetted Letter. Handed over with signature.',
        statusTag: 'Parcel Delivered',
      },
    ],
  }
];

// Complete Consolidation Engine: Merges Property Master, Household/Family, Sequential properties & 324009 Stores
export function buildMasterConsolidatedProperties(): UnifiedPropertyRecord[] {
  const propertyMap = new Map<string, UnifiedPropertyRecord>();

  // 1. Ingest Curated Baseline Properties
  CURATED_BASELINE_PROPERTIES.forEach(p => {
    const key = `${p.colony.toLowerCase().trim()}__${p.housePlotNumber.toLowerCase().replace(/\s+/g, '')}`;
    propertyMap.set(key, { ...p, linkedMembers: [...p.linkedMembers], chronologicalRemarks: [...p.chronologicalRemarks] });
  });

  // 2. Ingest Sequential Properties (Door-to-door sequence)
  DEFAULT_SEQUENTIAL_PROPERTIES.forEach(seq => {
    const col = normalizeColonyName(seq.colony);
    const plot = seq.housePlotNumber.trim();
    const key = `${col.toLowerCase()}__${plot.toLowerCase().replace(/\s+/g, '')}`;

    if (!propertyMap.has(key)) {
      const beat = normalizeBeatNumber(seq.beatNo, col);
      const staff = BEAT_STAFF_MAP[beat] || {
        id: seq.assignedStaffId || 'STAFF-50457421',
        name: seq.assignedStaffName || 'Mahendra Kumar Meena',
        role: seq.assignedStaffRole || 'GDS/PMAN',
        contact: '8769706002'
      };

      const members: LinkedFamilyMember[] = seq.residents.map((resName, idx) => ({
        id: `m-seq-${seq.id}-${idx}`,
        name: resName,
        roleInHousehold: idx === 0 ? 'Head of Household' : 'Family Member',
        mobile: idx === 0 ? seq.primaryMobile : '9828000000',
        whatsapp: idx === 0 ? seq.whatsapp || seq.primaryMobile : undefined,
        age: idx === 0 ? 40 : 36,
        gender: idx === 0 ? 'Female' : 'Male',
        occupation: idx === 0 ? 'Government Employee' : 'Private Sector',
        activeSchemes: [
          { schemeName: 'PLI', sumAssuredOrBalance: '₹5,00,000 (Suraksha)', status: 'Active' },
          { schemeName: 'SSY', sumAssuredOrBalance: '₹50,000/yr', status: 'Active' },
        ]
      }));

      propertyMap.set(key, {
        id: `up-${seq.id}`,
        propertyCode: `PROP-${col.substring(0, 3).toUpperCase()}-${plot.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6)}`,
        housePlotNumber: plot,
        colony: col,
        blockSector: seq.blockSector || 'Sector 1',
        pincode: seq.pincode || '324009',
        beatNo: beat,
        deliveryOffice: 'Dadabari S.O.',
        category: seq.propertyType as PropertyCategory,
        subTypeTag: 'Residential Household',
        occupancyStatus: seq.status === 'Occupied' ? 'Occupied' : 'Vacant',
        landmark: seq.landmark || 'Dadabari Beat Route',
        assignedStaffId: staff.id,
        assignedStaffName: staff.name,
        assignedStaffRole: staff.role,
        lastMileNote: seq.lastMileNote || 'Sequential door-to-door delivery route verified.',
        linkedMembers: members,
        chronologicalRemarks: [
          {
            id: `rem-seq-${seq.id}`,
            timestamp: '2026-10-15 10:00 AM',
            authorName: staff.name,
            authorRole: staff.role,
            remarkText: `Doorstep delivery sequence verified at ${plot}, ${col}.`,
            statusTag: 'Standard Delivery'
          }
        ],
        verificationStatus: seq.verificationStatus === 'Verified' ? 'Verified' : 'Pending Verification',
        updatedAt: '2026-10-15T12:00:00Z'
      });
    }
  });

  // 2.5 Ingest Sector 6 House 3 & 4 Merged Common Shared Property (Dhanraj Bairwa)
  const b2StaffId = 'STAFF-50457421';
  const b2StaffName = 'Mahendra Kumar Meena';
  const b2StaffRole = 'GDS/PMAN';
  const b2Office = 'Dadabari S.O.';
  const b2Pincode = '324009';

  const mergedSec6House3And4: UnifiedPropertyRecord = {
    id: 'up-prop-kp6-h003-004-dhanraj',
    propertyCode: SECTOR_6_MERGED_PROPERTY_DHANRAJ.propertyCode,
    housePlotNumber: SECTOR_6_MERGED_PROPERTY_DHANRAJ.housePlotNumber,
    houseNo: SECTOR_6_MERGED_PROPERTY_DHANRAJ.houseNo,
    colony: SECTOR_6_MERGED_PROPERTY_DHANRAJ.colony,
    sector: SECTOR_6_MERGED_PROPERTY_DHANRAJ.sector,
    block: SECTOR_6_MERGED_PROPERTY_DHANRAJ.block,
    blockSector: SECTOR_6_MERGED_PROPERTY_DHANRAJ.blockSector,
    pincode: SECTOR_6_MERGED_PROPERTY_DHANRAJ.pincode,
    beatNo: SECTOR_6_MERGED_PROPERTY_DHANRAJ.beatNo,
    deliveryOffice: SECTOR_6_MERGED_PROPERTY_DHANRAJ.deliveryOffice,
    category: SECTOR_6_MERGED_PROPERTY_DHANRAJ.category,
    subTypeTag: SECTOR_6_MERGED_PROPERTY_DHANRAJ.subTypeTag,
    occupancyStatus: SECTOR_6_MERGED_PROPERTY_DHANRAJ.occupancyStatus,
    landmark: SECTOR_6_MERGED_PROPERTY_DHANRAJ.landmark,
    assignedStaffId: b2StaffId,
    assignedStaffName: b2StaffName,
    assignedStaffRole: b2StaffRole,
    lastMileNote: SECTOR_6_MERGED_PROPERTY_DHANRAJ.lastMileNote,
    verificationStatus: 'Verified',
    updatedAt: new Date().toISOString(),
    linkedMembers: [
      {
        id: 'm-dhanraj-bairwa-sec6',
        name: 'Dhanraj Bairwa',
        roleInHousehold: 'Head of Household',
        mobile: '9829012345',
        whatsapp: '9829012345',
        age: 45,
        gender: 'Male',
        occupation: 'Property Owner / Government Service',
        activeSchemes: [
          { schemeName: 'PLI', accountNoOrPolicy: 'PLI-RJ-SEC6-34', sumAssuredOrBalance: '₹10,00,000 (Santosh)', status: 'Active' },
          { schemeName: 'IPPB', accountNoOrPolicy: 'IPPB-SEC6-0034', sumAssuredOrBalance: 'Active Savings', status: 'Active' },
        ],
      },
    ],
    chronologicalRemarks: [
      {
        id: 'rem-kp6-h003-004-dhanraj',
        timestamp: '2026-10-23 10:00 AM',
        authorName: b2StaffName,
        authorRole: b2StaffRole,
        remarkText:
          'Sector 6 House Numbers 3 and 4 merged and verified as common shared property owned by Dhanraj Bairwa.',
        statusTag: 'Verification Done',
      },
    ],
  };

  const sec6Keys = [
    'keshavpura__sector6__houseno.3',
    'keshavpura__sector6__houseno.4',
    'keshavpura__sector6__houseno.3&4',
    'keshavpura__sector6__houseno.3and4',
    'keshavpura__sector6__houseno.3-4',
    'keshavpura__sector6__3&4',
    'keshavpura__houseno.3',
    'keshavpura__houseno.4',
    'keshavpura__houseno.3&4',
    'keshavpura__4-5',
    'keshavpura__sector6__4-5',
  ];
  sec6Keys.forEach((k) => {
    propertyMap.set(k, mergedSec6House3And4);
  });

  // 3. Ingest Master Customers (All Household & Family Members)
  const allMasterCusts: Customer[] = customerService.getCustomers().length > 0 
    ? customerService.getCustomers() 
    : INITIAL_CUSTOMERS;

  allMasterCusts.forEach(c => {
    const rawHouse = (c.houseNo || c.address?.houseNumber || '').trim();
    if (!rawHouse || rawHouse === 'Plot Unit' || rawHouse.toLowerCase() === 'n/a') return;

    const col = normalizeColonyName(c.colony || c.area || c.sectorLocality || c.address?.area || 'Keshavpura');
    const plot = rawHouse;
    const key = `${col.toLowerCase()}__${plot.toLowerCase().replace(/\s+/g, '')}`;
    const beat = normalizeBeatNumber(c.beatNo, col);
    const staff = BEAT_STAFF_MAP[beat] || {
      id: c.assignedStaffId || 'STAFF-50457421',
      name: c.assignedStaffName || 'Mahendra Kumar Meena',
      role: 'GDS/PMAN',
      contact: '8769706002'
    };

    const isCommercial = 
      (c.occupation || '').toLowerCase().includes('shop') ||
      (c.occupation || '').toLowerCase().includes('stall') ||
      (c.occupation || '').toLowerCase().includes('trader') ||
      (c.name || '').toLowerCase().includes('stall') ||
      (c.name || '').toLowerCase().includes('store') ||
      (c.name || '').toLowerCase().includes('tea') ||
      (c.name || '').toLowerCase().includes('centre');

    const customerMember: LinkedFamilyMember = {
      id: `m-cust-${c.id || c.masterId}`,
      name: c.name,
      roleInHousehold: c.isHeadOfFamily ? 'Head of Household' : (isCommercial ? 'Commercial Operator' : 'Family Member'),
      mobile: c.mobile,
      whatsapp: c.alternateMobile || c.mobile,
      age: c.age || 38,
      gender: (c.gender as any) || 'Male',
      occupation: c.occupation || (isCommercial ? 'Merchant / Business' : 'Resident'),
      activeSchemes: (c.products || []).map((p: any) => ({
        schemeName: (p.productCode || p.name || 'PLI').substring(0, 4) as any,
        accountNoOrPolicy: p.accountNumber || 'POL-DAD-2026',
        sumAssuredOrBalance: p.sumAssured ? `₹${p.sumAssured}` : 'Active',
        status: 'Active'
      }))
    };

    if (customerMember.activeSchemes.length === 0) {
      customerMember.activeSchemes.push({
        schemeName: 'PLI',
        accountNoOrPolicy: 'PLI-LEAD-2026',
        sumAssuredOrBalance: '₹5,00,000 (Follow-up)',
        status: 'Lead Generated'
      });
    }

    // Direct linking for Sector 6 House 3 & 4 / Dhanraj Bairwa to merged common property
    if (isSector6House3Or4(col, c.sector || c.address?.sector || '', plot) || c.name.toLowerCase().includes('dhanraj bairwa')) {
      if (!mergedSec6House3And4.linkedMembers.some(m => m.name.toLowerCase() === c.name.toLowerCase())) {
        mergedSec6House3And4.linkedMembers.push(customerMember);
      }
      return;
    }

    if (propertyMap.has(key)) {
      const existing = propertyMap.get(key)!;
      // Append member if not already present
      if (!existing.linkedMembers.some(m => m.name.toLowerCase() === c.name.toLowerCase())) {
        existing.linkedMembers.push(customerMember);
      }
      // Append household members if present
      if (c.householdMembers && c.householdMembers.length > 0) {
        c.householdMembers.forEach((hm, hIdx) => {
          if (!existing.linkedMembers.some(m => m.name.toLowerCase() === hm.name.toLowerCase())) {
            existing.linkedMembers.push({
              id: `m-hm-${c.id}-${hIdx}`,
              name: hm.name,
              roleInHousehold: (hm.relationshipWithHead as any) || 'Family Member',
              mobile: (hm as any).contact || hm.mobile || c.mobile,
              whatsapp: (hm as any).contact || hm.mobile || c.mobile,
              age: hm.age || 22,
              gender: (hm.gender as any) || 'Female',
              occupation: 'Student / Dependent',
              activeSchemes: [
                { schemeName: 'SSY', accountNoOrPolicy: 'SSY-DAD-2026', sumAssuredOrBalance: '₹1,50,000/yr', status: 'Active' }
              ]
            });
          }
        });
      }
    } else {
      // Create new unified property with explicit colony, sector, block, houseNo, and audited pincode
      const pCode = c.propertyId || `PROP-${col.substring(0, 3).toUpperCase()}-${plot.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6)}`;
      const members = [customerMember];

      if (c.householdMembers && c.householdMembers.length > 0) {
        c.householdMembers.forEach((hm, hIdx) => {
          members.push({
            id: `m-hm-${c.id}-${hIdx}`,
            name: hm.name,
            roleInHousehold: (hm.relationshipWithHead as any) || 'Family Member',
            mobile: (hm as any).contact || hm.mobile || c.mobile,
            whatsapp: (hm as any).contact || hm.mobile || c.mobile,
            age: hm.age || 22,
            gender: (hm.gender as any) || 'Female',
            occupation: 'Student / Dependent',
            activeSchemes: []
          });
        });
      }

      const secClean = c.sector ? (c.sector.toLowerCase().includes('sector') || c.sector.toLowerCase().includes('block') ? c.sector : `Sector ${c.sector}`) : 'Sector 1';
      const blkClean = c.block || secClean;
      const auditedPin = getAuditedPincodeForColony(col, secClean);

      propertyMap.set(key, {
        id: `up-c-${c.id || c.masterId}`,
        propertyCode: pCode,
        housePlotNumber: plot,
        houseNo: plot,
        colony: col,
        sector: secClean,
        block: blkClean,
        blockSector: secClean,
        pincode: auditedPin || c.pincode || '324009',
        beatNo: beat,
        deliveryOffice: 'Dadabari S.O.',
        category: isCommercial ? 'Commercial' : (c.type as PropertyCategory) || 'Residential',
        subTypeTag: isCommercial ? 'Commercial • General Store / Retail' : 'Residential Household',
        occupancyStatus: c.livingStatus === 'Vacant' ? 'Vacant' : (c.livingStatus === 'Tenant' ? 'Rented' : 'Occupied'),
        landmark: c.landmark || 'Dadabari S.O. Jurisdiction',
        assignedStaffId: staff.id,
        assignedStaffName: staff.name,
        assignedStaffRole: staff.role,
        lastMileNote: c.remarks || c.notes || 'Master database customer record.',
        linkedMembers: members,
        chronologicalRemarks: [
          {
            id: `rem-c-${c.id}`,
            timestamp: '2026-10-14 02:00 PM',
            authorName: staff.name,
            authorRole: staff.role,
            remarkText: c.remarks || 'Customer record verified in Master CRM.',
            statusTag: 'Verification Done'
          }
        ],
        verificationStatus: c.verificationStatus === 'Verified' || c.verificationStatus === 'Field Confirmed' ? 'Verified' : 'Pending Verification',
        updatedAt: '2026-10-15T10:00:00Z'
      });
    }
  });

  // 4. Ingest Ground-Verified 324009 Commercial Registry (Zero Dead Data)
  DADABARI_324009_VERIFIED_COMMERCIAL_REGISTRY.forEach(store => {
    const col = normalizeColonyName(store.colony);
    const plot = store.housePlotNumber.trim();
    const key = `${col.toLowerCase()}__${plot.toLowerCase().replace(/\s+/g, '')}`;

    if (!propertyMap.has(key)) {
      propertyMap.set(key, {
        id: `up-comm-${store.id}`,
        propertyCode: `PROP-COMM-${store.id.replace(/\D/g, '').padStart(3, '0')}`,
        housePlotNumber: plot,
        colony: col,
        blockSector: store.complexName || 'Commercial Block',
        pincode: '324009',
        beatNo: store.beatNo,
        deliveryOffice: 'Dadabari S.O.',
        category: 'Commercial',
        subTypeTag: store.categoryTag,
        occupancyStatus: 'Occupied',
        landmark: store.landmark,
        assignedStaffId: store.assignedStaffId,
        assignedStaffName: store.assignedStaffName,
        assignedStaffRole: store.assignedStaffRole,
        lastMileNote: `${store.lastMileNote} • ${store.postalPotentialRemark}`,
        linkedMembers: [
          {
            id: `m-comm-${store.id}`,
            name: `${store.ownerName} (${store.storeName})`,
            roleInHousehold: 'Commercial Operator',
            mobile: store.primaryMobile,
            whatsapp: store.whatsapp,
            age: 39,
            gender: 'Male',
            occupation: store.categoryTag,
            activeSchemes: [
              { schemeName: 'IPPB', accountNoOrPolicy: 'IPPB-COMM-QR', sumAssuredOrBalance: 'Merchant QR + Micro-ATM', status: 'Active' },
              { schemeName: 'PLI', accountNoOrPolicy: 'PLI-PROP-2026', sumAssuredOrBalance: '₹10,00,000 Suraksha', status: 'Lead Generated' },
            ]
          }
        ],
        chronologicalRemarks: [
          {
            id: `rem-comm-${store.id}`,
            timestamp: store.lastAuditDate,
            authorName: store.assignedStaffName,
            authorRole: store.assignedStaffRole,
            remarkText: `Audited operational store: ${store.storeName}. ${store.postalPotentialRemark}`,
            statusTag: 'Verification Done'
          }
        ],
        verificationStatus: 'Verified',
        updatedAt: '2026-10-16T12:00:00Z'
      });
    }
  });

  // 5. Ensure all 33 Dadabari Beats are populated with designated landmarks
  CONSOLIDATED_BEAT_MATRIX.forEach(bEntry => {
    const beatProps = Array.from(propertyMap.values()).filter(p => p.beatNo === bEntry.beatNumber);
    if (beatProps.length === 0) {
      // Synthesize a flagship beat landmark entry for complete coverage
      const col = bEntry.colonies[0] || 'Dadabari';
      const key = `${col.toLowerCase()}__beat-${bEntry.beatNumber.toLowerCase().replace(/\s+/g, '')}`;
      propertyMap.set(key, {
        id: `up-matrix-${bEntry.beatNumber.replace(/\s+/g, '')}`,
        propertyCode: `PROP-${bEntry.beatNumber.replace(/\s+/g, '')}-HUB`,
        housePlotNumber: `Main Chowk, ${bEntry.sectors[0] || 'Sector 1'}`,
        colony: col,
        blockSector: bEntry.sectors[0] || 'Block A',
        pincode: bEntry.pincode,
        beatNo: bEntry.beatNumber,
        deliveryOffice: 'Dadabari S.O.',
        category: 'Residential',
        subTypeTag: 'Residential Household',
        occupancyStatus: 'Occupied',
        landmark: bEntry.landmarks[0] || 'Main Beat Delivery Point',
        assignedStaffId: bEntry.staffId || BEAT_STAFF_MAP[bEntry.beatNumber]?.id || 'STAFF-50457421',
        assignedStaffName: bEntry.assignedPostmanName,
        assignedStaffRole: bEntry.staffRole || BEAT_STAFF_MAP[bEntry.beatNumber]?.role || 'POSTMAN',
        lastMileNote: `Flagship beat junction for ${bEntry.beatNumber} under Dadabari S.O.`,
        linkedMembers: [
          {
            id: `m-bm-${bEntry.beatNumber}`,
            name: `${bEntry.assignedPostmanName} (Designated Beat Lead)`,
            roleInHousehold: 'Head of Household',
            mobile: bEntry.assignedPostmanContact,
            whatsapp: bEntry.assignedPostmanContact,
            age: 40,
            gender: 'Male',
            occupation: bEntry.staffRole || 'POSTMAN',
            activeSchemes: [
              { schemeName: 'PLI', accountNoOrPolicy: 'PLI-POSTAL-OFFICIAL', sumAssuredOrBalance: '₹10,00,000 (Departmental)', status: 'Active' }
            ]
          }
        ],
        chronologicalRemarks: [
          {
            id: `rem-bm-${bEntry.beatNumber}`,
            timestamp: '2026-10-15 09:00 AM',
            authorName: bEntry.assignedPostmanName,
            authorRole: bEntry.staffRole || 'POSTMAN',
            remarkText: `Beat route established covering ${bEntry.colonies.join(', ')}.`,
            statusTag: 'Verification Done'
          }
        ],
        verificationStatus: 'Verified',
        updatedAt: '2026-10-15T09:00:00Z'
      });
    }
  });

  // 6. Bulk Property Range Allocations for Beat 2 (Dadabari S.O. 324009)
  // Assigned Postman: Mahendra Kumar Meena (Staff ID: STAFF-50457421)

  // Build existing number sets to strictly preserve existing resident records
  const existingSec6HouseNums = new Set<number>();
  const existingSec6KhNums = new Set<number>();
  const existingSec7PlotNums = new Set<number>();
  const existingSec7UitNums = new Set<number>();
  const existingSantoshiNums = new Set<number>();

  propertyMap.forEach(p => {
    const colLow = (p.colony || '').toLowerCase();
    const secLow = (p.blockSector || '').toLowerCase();
    const plotRaw = (p.housePlotNumber || '').trim().toLowerCase();

    if (colLow.includes('keshav')) {
      if (secLow.includes('6')) {
        if (plotRaw.startsWith('kh')) {
          const num = parseInt(plotRaw.replace(/\D/g, ''), 10);
          if (!isNaN(num)) existingSec6KhNums.add(num);
        } else {
          const num = parseInt(plotRaw.replace(/^(house\s*no\.?|h\.?\s*no\.?|house|plot)\s*/i, '').replace(/[^\d].*$/, ''), 10);
          if (!isNaN(num)) existingSec6HouseNums.add(num);
        }
      } else if (secLow.includes('7')) {
        if (plotRaw.startsWith('uit')) {
          const num = parseInt(plotRaw.replace(/\D/g, ''), 10);
          if (!isNaN(num)) existingSec7UitNums.add(num);
        } else {
          const num = parseInt(plotRaw.replace(/^(plot\s*no\.?|plot|house\s*no\.?|p0*)\s*/i, '').replace(/[^\d].*$/, ''), 10);
          if (!isNaN(num)) existingSec7PlotNums.add(num);
        }
      }
    } else if (colLow.includes('santoshi')) {
      const num = parseInt(plotRaw.replace(/^(house\s*no\.?|h\.?\s*no\.?|house|plot)\s*/i, '').replace(/[^\d].*$/, ''), 10);
      if (!isNaN(num)) existingSantoshiNums.add(num);
    }
  });

  // Range 1A: Keshavpura Sector 6 — House No. 1 to House No. 417
  for (let i = 1; i <= 417; i++) {
    if (i === 3 || i === 4) continue; // Merged under Dhanraj Bairwa as common shared property
    if (!existingSec6HouseNums.has(i)) {
      const key = `keshavpura__sector6__houseno.${i}`;
      if (!propertyMap.has(key)) {
        propertyMap.set(key, {
          id: `prop-kp6-h-${i}`,
          propertyCode: `PROP-KP6-H${String(i).padStart(3, '0')}`,
          housePlotNumber: `House No. ${i}`,
          houseNo: `${i}`,
          colony: 'Keshavpura',
          sector: 'Sector 6',
          block: 'Sector 6',
          blockSector: 'Sector 6',
          pincode: b2Pincode,
          beatNo: 'Beat 2',
          deliveryOffice: b2Office,
          category: 'Residential',
          subTypeTag: 'Residential Household',
          occupancyStatus: 'Vacant',
          landmark: 'Keshavpura Sector 6, Beat 2 (Dadabari S.O.)',
          assignedStaffId: b2StaffId,
          assignedStaffName: b2StaffName,
          assignedStaffRole: b2StaffRole,
          lastMileNote: `Beat 2 sequential property (House No. ${i}). Preserved as Vacant ready for field verification.`,
          linkedMembers: [],
          chronologicalRemarks: [
            {
              id: `rem-kp6-h-${i}`,
              timestamp: '2026-10-19 09:00 AM',
              authorName: b2StaffName,
              authorRole: b2StaffRole,
              remarkText: `Sequential property House No. ${i} registered as Vacant in Master Hub.`,
              statusTag: 'Standard Delivery'
            }
          ],
          verificationStatus: 'Pending Verification',
          updatedAt: '2026-10-19T09:00:00Z'
        });
      }
    }
  }

  // Range 1B: Keshavpura Sector 6 — KH Series from KH-1 to KH-252
  for (let i = 1; i <= 252; i++) {
    if (!existingSec6KhNums.has(i)) {
      const key = `keshavpura__sector6__kh-${i}`;
      if (!propertyMap.has(key)) {
        propertyMap.set(key, {
          id: `prop-kp6-kh-${i}`,
          propertyCode: `PROP-KP6-KH${String(i).padStart(3, '0')}`,
          housePlotNumber: `KH-${i}`,
          colony: 'Keshavpura',
          blockSector: 'Sector 6',
          pincode: b2Pincode,
          beatNo: 'Beat 2',
          deliveryOffice: b2Office,
          category: 'Residential',
          subTypeTag: 'Residential Household',
          occupancyStatus: 'Vacant',
          landmark: 'Keshavpura Sector 6 (KH Series), Beat 2',
          assignedStaffId: b2StaffId,
          assignedStaffName: b2StaffName,
          assignedStaffRole: b2StaffRole,
          lastMileNote: `Beat 2 sequential KH Series (KH-${i}). Preserved as Vacant ready for field verification.`,
          linkedMembers: [],
          chronologicalRemarks: [
            {
              id: `rem-kp6-kh-${i}`,
              timestamp: '2026-10-19 09:00 AM',
              authorName: b2StaffName,
              authorRole: b2StaffRole,
              remarkText: `Sequential KH-${i} unit registered as Vacant in Master Hub.`,
              statusTag: 'Standard Delivery'
            }
          ],
          verificationStatus: 'Pending Verification',
          updatedAt: '2026-10-19T09:00:00Z'
        });
      }
    }
  }

  // Range 2A: Keshavpura Sector 7 — Plot-1 to Plot-1010
  for (let i = 1; i <= 1010; i++) {
    if (!existingSec7PlotNums.has(i)) {
      const key = `keshavpura__sector7__plot-${i}`;
      if (!propertyMap.has(key)) {
        propertyMap.set(key, {
          id: `prop-kp7-plot-${i}`,
          propertyCode: `PROP-KP7-P${String(i).padStart(4, '0')}`,
          housePlotNumber: `Plot-${i}`,
          colony: 'Keshavpura',
          blockSector: 'Sector 7',
          pincode: b2Pincode,
          beatNo: 'Beat 2',
          deliveryOffice: b2Office,
          category: 'Residential',
          subTypeTag: 'Residential Household',
          occupancyStatus: 'Vacant',
          landmark: 'Keshavpura Sector 7, Beat 2 (Dadabari S.O.)',
          assignedStaffId: b2StaffId,
          assignedStaffName: b2StaffName,
          assignedStaffRole: b2StaffRole,
          lastMileNote: `Beat 2 sequential property (Plot-${i}). Preserved as Vacant ready for field verification.`,
          linkedMembers: [],
          chronologicalRemarks: [
            {
              id: `rem-kp7-plot-${i}`,
              timestamp: '2026-10-19 09:00 AM',
              authorName: b2StaffName,
              authorRole: b2StaffRole,
              remarkText: `Sequential Plot-${i} unit registered as Vacant in Master Hub.`,
              statusTag: 'Standard Delivery'
            }
          ],
          verificationStatus: 'Pending Verification',
          updatedAt: '2026-10-19T09:00:00Z'
        });
      }
    }
  }

  // Range 2B: Keshavpura Sector 7 — UIT Series from UIT-1 to UIT-250
  for (let i = 1; i <= 250; i++) {
    if (!existingSec7UitNums.has(i)) {
      const key = `keshavpura__sector7__uit-${i}`;
      if (!propertyMap.has(key)) {
        propertyMap.set(key, {
          id: `prop-kp7-uit-${i}`,
          propertyCode: `PROP-KP7-UIT${String(i).padStart(3, '0')}`,
          housePlotNumber: `UIT-${i}`,
          colony: 'Keshavpura',
          blockSector: 'Sector 7',
          pincode: b2Pincode,
          beatNo: 'Beat 2',
          deliveryOffice: b2Office,
          category: 'Residential',
          subTypeTag: 'Residential Household',
          occupancyStatus: 'Vacant',
          landmark: 'Keshavpura Sector 7 (UIT Scheme), Beat 2',
          assignedStaffId: b2StaffId,
          assignedStaffName: b2StaffName,
          assignedStaffRole: b2StaffRole,
          lastMileNote: `Beat 2 sequential property (UIT-${i}). Preserved as Vacant ready for field verification.`,
          linkedMembers: [],
          chronologicalRemarks: [
            {
              id: `rem-kp7-uit-${i}`,
              timestamp: '2026-10-19 09:00 AM',
              authorName: b2StaffName,
              authorRole: b2StaffRole,
              remarkText: `Sequential UIT-${i} unit registered as Vacant in Master Hub.`,
              statusTag: 'Standard Delivery'
            }
          ],
          verificationStatus: 'Pending Verification',
          updatedAt: '2026-10-19T09:00:00Z'
        });
      }
    }
  }

  // Range 3: Santoshi Nagar (Dadabari S.O. 324009) — House No. 1 to House No. 800
  for (let i = 1; i <= 800; i++) {
    if (!existingSantoshiNums.has(i)) {
      const key = `santoshinagar__houseno.${i}`;
      if (!propertyMap.has(key)) {
        propertyMap.set(key, {
          id: `prop-snt-h-${i}`,
          propertyCode: `PROP-SNT-H${String(i).padStart(3, '0')}`,
          housePlotNumber: `House No. ${i}`,
          colony: 'Santoshi Nagar',
          blockSector: 'Santoshi Nagar',
          pincode: b2Pincode,
          beatNo: 'Beat 2',
          deliveryOffice: b2Office,
          category: 'Residential',
          subTypeTag: 'Residential Household',
          occupancyStatus: 'Vacant',
          landmark: 'Santoshi Nagar, Beat 2 (Dadabari S.O. 324009)',
          assignedStaffId: b2StaffId,
          assignedStaffName: b2StaffName,
          assignedStaffRole: b2StaffRole,
          lastMileNote: `Beat 2 sequential property (House No. ${i}). Preserved as Vacant ready for field verification.`,
          linkedMembers: [],
          chronologicalRemarks: [
            {
              id: `rem-snt-h-${i}`,
              timestamp: '2026-10-19 09:00 AM',
              authorName: b2StaffName,
              authorRole: b2StaffRole,
              remarkText: `Sequential House No. ${i} unit registered as Vacant in Master Hub.`,
              statusTag: 'Standard Delivery'
            }
          ],
          verificationStatus: 'Pending Verification',
          updatedAt: '2026-10-19T09:00:00Z'
        });
      }
    }
  }

  return Array.from(propertyMap.values()).sort((a, b) => {
    const colCompare = (a.colony || '').trim().localeCompare((b.colony || '').trim(), undefined, { numeric: true, sensitivity: 'base' });
    if (colCompare !== 0) return colCompare;
    const secCompare = (a.blockSector || '').trim().localeCompare((b.blockSector || '').trim(), undefined, { numeric: true, sensitivity: 'base' });
    if (secCompare !== 0) return secCompare;
    return (a.housePlotNumber || '').trim().localeCompare((b.housePlotNumber || '').trim(), undefined, { numeric: true, sensitivity: 'base' });
  });
}

export default function UnifiedPropertyFamilyHub() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const isAdmin = staffPermissionService.isSuperAdmin(userProfile);
  const isRestrictedStaff = staffPermissionService.isPostmanOrGds(userProfile);
  const HUB_PAGE_SIZE = 5;

  // Master Property List with deep consolidation
  const [properties, setProperties] = useState<UnifiedPropertyRecord[]>(() => {
    try {
      const stored = localStorage.getItem('unified_property_family_hub_records_v4');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 2500) return parsed;
      }
    } catch {
      // fallback
    }
    const consolidated = buildMasterConsolidatedProperties();
    try {
      localStorage.setItem('unified_property_family_hub_records_v4', JSON.stringify(consolidated));
    } catch {}
    return consolidated;
  });

  // Dual View Layout Toggle: Visual Card Grid vs. Structured Table
  const [viewMode, setViewMode] = useState<'CARD' | 'TABLE'>('CARD');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter States
  const [selectedColony, setSelectedColony] = useState<string>('All');
  const [selectedSubSector, setSelectedSubSector] = useState<string>('All');
  const [selectedBeat, setSelectedBeat] = useState<string>(() => {
    if (isRestrictedStaff && userProfile?.beat) {
      return userProfile.beat;
    }
    return 'All';
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedClassification, setSelectedClassification] = useState<string>('All');

  // Multi-parameter Search Inputs
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customerNameSearch, setCustomerNameSearch] = useState<string>('');
  const [mobileSearch, setMobileSearch] = useState<string>('');
  const [houseNoSearch, setHouseNoSearch] = useState<string>('');
  const [landmarkSearch, setLandmarkSearch] = useState<string>('');

  // Detailed Property Drawer / Modal
  const [activeProperty, setActiveProperty] = useState<UnifiedPropertyRecord | null>(null);

  // New Remark Modal inside Detailed View
  const [showAddRemarkModal, setShowAddRemarkModal] = useState<boolean>(false);
  const [newRemarkText, setNewRemarkText] = useState<string>('');
  const [newRemarkTag, setNewRemarkTag] = useState<DeliveryRemarkEntry['statusTag']>('Standard Delivery');

  // Add Family Member Modal
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [newMemberRole, setNewMemberRole] = useState<LinkedFamilyMember['roleInHousehold']>('Son');
  const [newMemberMobile, setNewMemberMobile] = useState<string>('');
  const [newMemberAge, setNewMemberAge] = useState<string>('25');
  const [newMemberGender, setNewMemberGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newMemberOccupation, setNewMemberOccupation] = useState<string>('');
  const [newMemberScheme, setNewMemberScheme] = useState<string>('None');

  // Add New Property Modal
  const [showAddPropertyModal, setShowAddPropertyModal] = useState<boolean>(false);
  const [newPropHouseNo, setNewPropHouseNo] = useState<string>('');
  const [newPropColony, setNewPropColony] = useState<string>('Keshavpura');
  const [newPropBlock, setNewPropBlock] = useState<string>('Sector 6');
  const [isCustomBlock, setIsCustomBlock] = useState<boolean>(false);
  const [customBlockText, setCustomBlockText] = useState<string>('');
  const [newPropBeat, setNewPropBeat] = useState<string>('Beat 2');
  const [newPropCategory, setNewPropCategory] = useState<PropertyCategory>('Residential');
  const [newPropLandmark, setNewPropLandmark] = useState<string>('');
  const [newPropHeadName, setNewPropHeadName] = useState<string>('');
  const [newPropMobile, setNewPropMobile] = useState<string>('');

  // Quick Update Status Modal
  const [statusModalProperty, setStatusModalProperty] = useState<UnifiedPropertyRecord | null>(null);
  const [statusOccupancy, setStatusOccupancy] = useState<'Occupied' | 'Vacant' | 'Rented'>('Occupied');
  const [statusVerification, setStatusVerification] = useState<'Verified' | 'Pending Verification'>('Verified');
  const [statusRemarkTag, setStatusRemarkTag] = useState<DeliveryRemarkEntry['statusTag']>('Standard Delivery');
  const [statusRemarkText, setStatusRemarkText] = useState<string>('');

  const handleOpenStatusModal = (p: UnifiedPropertyRecord) => {
    setStatusModalProperty(p);
    setStatusOccupancy(p.occupancyStatus);
    setStatusVerification(p.verificationStatus);
    setStatusRemarkTag('Verification Done');
    setStatusRemarkText(p.lastMileNote || 'Doorstep delivery and address verification completed on ground.');
  };

  const handleSaveStatusModal = () => {
    if (!statusModalProperty) return;
    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const newRemark: DeliveryRemarkEntry = {
      id: `rem-stat-${Date.now()}`,
      timestamp: nowStr,
      authorName: statusModalProperty.assignedStaffName || 'Mahendra Kumar Meena',
      authorRole: statusModalProperty.assignedStaffRole || 'GDS/PMAN',
      remarkText: statusRemarkText || `Status updated to ${statusOccupancy} (${statusVerification})`,
      statusTag: statusRemarkTag,
    };

    const updated = properties.map((item) => {
      if (item.id === statusModalProperty.id) {
        return {
          ...item,
          occupancyStatus: statusOccupancy,
          verificationStatus: statusVerification,
          lastMileNote: statusRemarkText || item.lastMileNote,
          updatedAt: new Date().toISOString(),
          chronologicalRemarks: [newRemark, ...item.chronologicalRemarks],
        };
      }
      return item;
    });

    setProperties(updated);
    if (activeProperty?.id === statusModalProperty.id) {
      setActiveProperty({
        ...activeProperty,
        occupancyStatus: statusOccupancy,
        verificationStatus: statusVerification,
        lastMileNote: statusRemarkText || activeProperty.lastMileNote,
        updatedAt: new Date().toISOString(),
        chronologicalRemarks: [newRemark, ...activeProperty.chronologicalRemarks],
      });
    }
    showNotification(`⚡ [Status & Remarks Updated] for ${statusModalProperty.housePlotNumber}, ${statusModalProperty.colony}! (${statusOccupancy} • ${statusVerification})`);
    setStatusModalProperty(null);
  };

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Persist properties to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('unified_property_family_hub_records_v4', JSON.stringify(properties));
    } catch {
      // ignore
    }
  }, [properties]);

  // 1-Click Re-sync & Consolidate All Master Databases
  const handleForceConsolidateAll = () => {
    const freshlyConsolidated = buildMasterConsolidatedProperties();
    setProperties(freshlyConsolidated);
    try {
      localStorage.setItem('unified_property_family_hub_records_v4', JSON.stringify(freshlyConsolidated));
    } catch {}
    showNotification(`⚡ Consolidated ${freshlyConsolidated.length} Properties & Family Records across all Beats 1–33!`);
  };

  // Strictly scoped properties dataset for Postman/GDS vs Admin
  const scopedProperties = useMemo(() => {
    if (!isRestrictedStaff) return properties;
    return properties.filter((p) =>
      staffPermissionService.matchesUserBeatScope(userProfile, {
        beatNo: p.beatNo,
        officeId: p.deliveryOffice,
        area: p.colony,
        pincode: p.pincode,
        assignedStaffId: p.assignedStaffId,
        assignedStaffName: p.assignedStaffName,
      })
    );
  }, [properties, isRestrictedStaff, userProfile]);

  // Unique Colonies List: scoped for Postman/GDS, all 25 official major colonies first for Admin
  const uniqueColonies = useMemo(() => {
    const recordColonies = scopedProperties.map((p) => p.colony).filter(Boolean);
    if (isRestrictedStaff) {
      return ['All', ...Array.from(new Set(recordColonies)).sort()];
    }
    return ['All', ...getHierarchyColoniesList(recordColonies)];
  }, [scopedProperties, isRestrictedStaff]);

  // Unique Beats List (Scoped for Postman/GDS, Beat 1 to Beat 33 for Admin)
  const uniqueBeats = useMemo(() => {
    if (isRestrictedStaff) {
      const allowed = Array.from(staffPermissionService.getScopedBeatsSet(userProfile));
      return allowed.length > 0 ? allowed : [userProfile?.beat || 'Beat 2'];
    }
    return ['All', ...Array.from({ length: 33 }, (_, i) => `Beat ${i + 1}`)];
  }, [isRestrictedStaff, userProfile]);

  // Available Mapped Sectors / Blocks for the Property Registration Modal
  const availableRegistrationSectors = useMemo(() => {
    const recordSectors = scopedProperties
      .filter((p) => p.colony === newPropColony)
      .map((p) => p.blockSector)
      .filter(Boolean);
    return getHierarchySectorsForColony(newPropColony, recordSectors);
  }, [newPropColony, scopedProperties]);

  // Dynamic Sub-Sector Chips for the currently selected colony in Quick-Filter Bar
  const colonySubSectorChips = useMemo(() => {
    if (selectedColony === 'All') return [];
    const colonyProps = scopedProperties.filter((p) => p.colony === selectedColony);
    const recordSectors = colonyProps.map((p) => p.blockSector).filter(Boolean);
    const sectorNames = getHierarchySectorsForColony(selectedColony, recordSectors);

    const chips: { id: string; label: string; count: number }[] = [
      { id: 'All', label: `All ${selectedColony}`, count: colonyProps.length },
    ];

    sectorNames.forEach((subName) => {
      const matchingCount = colonyProps.filter((p) => matchPropertyToSubSector(p, subName)).length;
      if (matchingCount > 0) {
        chips.push({
          id: subName,
          label: subName,
          count: matchingCount,
        });
      }
    });

    return chips;
  }, [selectedColony, scopedProperties]);

  // When Colony Filter dropdown changes: update selected colony & reset sub-sector to 'All'
  const handleColonyFilterChange = (colony: string) => {
    setSelectedColony(colony);
    setSelectedSubSector('All');
  };

  // When Colony changes in Property Registration Modal: map default sector & beat
  const handleNewPropColonyChange = (colony: string) => {
    setNewPropColony(colony);
    const resolved = resolveColonySectorDetails(colony);
    setNewPropBlock(resolved.sector);
    setNewPropBeat(resolved.beatNo);
    setIsCustomBlock(false);
    setCustomBlockText('');
  };

  // Open Property Modal with prefilled colony & sector if active
  const handleOpenAddPropertyModal = () => {
    if (selectedColony !== 'All') {
      setNewPropColony(selectedColony);
      const sectors = getHierarchySectorsForColony(selectedColony);
      if (selectedSubSector !== 'All') {
        const matchingSector = sectors.find((s) => s.toLowerCase() === selectedSubSector.toLowerCase());
        if (matchingSector) {
          setNewPropBlock(matchingSector);
          setIsCustomBlock(false);
        } else {
          setNewPropBlock(selectedSubSector);
          setIsCustomBlock(true);
          setCustomBlockText(selectedSubSector);
        }
      } else if (sectors.length > 0) {
        setNewPropBlock(sectors[0]);
        setIsCustomBlock(false);
      }
      const resolved = resolveColonySectorDetails(selectedColony, selectedSubSector !== 'All' ? selectedSubSector : undefined);
      setNewPropBeat(resolved.beatNo);
    }
    setShowAddPropertyModal(true);
  };

  // Filtered & Sorted Properties List
  const filteredProperties = useMemo(() => {
    return scopedProperties
      .filter((p) => {

        // Colony Filter
        const matchColony = selectedColony === 'All' || p.colony === selectedColony;

        // Sub-Sector / Block Quick-Filter
        const matchSubSector =
          selectedColony === 'All' || selectedSubSector === 'All' || matchPropertyToSubSector(p, selectedSubSector);

        // Beat Filter
        const matchBeat = selectedBeat === 'All' || p.beatNo === selectedBeat;

        // Category Filter
        const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;

        // Occupancy Status Filter
        const matchStatus = selectedStatus === 'All' || p.occupancyStatus === selectedStatus;

        // Classification & Type Badges Filter
        let matchClassification = true;
        if (selectedClassification === 'Commercial Only') {
          matchClassification = p.category === 'Commercial';
        } else if (selectedClassification === 'eMitra / CSC Kiosks') {
          matchClassification =
            p.subTypeTag === 'Commercial • eMitra / CSC' ||
            p.landmark.toLowerCase().includes('emitra') ||
            p.landmark.toLowerCase().includes('csc');
        } else if (selectedClassification === 'General Retail / Stores') {
          matchClassification =
            p.subTypeTag === 'Commercial • General Store / Retail' || p.category === 'Commercial';
        } else if (selectedClassification === 'Residential Households') {
          matchClassification = p.category === 'Residential';
        }

        // General Query
        const q = searchQuery.toLowerCase().trim();
        const matchGeneral =
          !q ||
          p.housePlotNumber.toLowerCase().includes(q) ||
          p.colony.toLowerCase().includes(q) ||
          p.blockSector.toLowerCase().includes(q) ||
          p.landmark.toLowerCase().includes(q) ||
          p.beatNo.toLowerCase().includes(q) ||
          p.assignedStaffName.toLowerCase().includes(q) ||
          p.linkedMembers.some(
            (m) =>
              m.name.toLowerCase().includes(q) ||
              m.mobile.includes(q) ||
              m.activeSchemes.some((s) => s.schemeName.toLowerCase().includes(q))
          );

        // Customer Name Search
        const nameQ = customerNameSearch.toLowerCase().trim();
        const matchName = !nameQ || p.linkedMembers.some((m) => m.name.toLowerCase().includes(nameQ));

        // Mobile Search (10-digit)
        const cleanMobile = mobileSearch.replace(/\D/g, '');
        const matchMobile =
          !cleanMobile ||
          p.linkedMembers.some(
            (m) =>
              m.mobile.replace(/\D/g, '').includes(cleanMobile) ||
              (m.whatsapp && m.whatsapp.replace(/\D/g, '').includes(cleanMobile))
          );

        // House No Search
        const houseQ = houseNoSearch.toLowerCase().replace(/\s+/g, '');
        const matchHouse = !houseQ || p.housePlotNumber.toLowerCase().replace(/\s+/g, '').includes(houseQ);

        // Landmark Search
        const landmarkQ = landmarkSearch.toLowerCase().trim();
        const matchLandmark = !landmarkQ || p.landmark.toLowerCase().includes(landmarkQ);

        return (
          matchColony &&
          matchSubSector &&
          matchBeat &&
          matchCategory &&
          matchStatus &&
          matchClassification &&
          matchGeneral &&
          matchName &&
          matchMobile &&
          matchHouse &&
          matchLandmark
        );
      })
      .sort((a, b) => {
        // Strict Colony-wise ascending alphabetical order (A to Z)
        const colCompare = (a.colony || '').trim().localeCompare((b.colony || '').trim(), undefined, {
          numeric: true,
          sensitivity: 'base',
        });
        if (colCompare !== 0) return colCompare;

        // Sub-Sector / Block ascending
        const secCompare = (a.blockSector || '').trim().localeCompare((b.blockSector || '').trim(), undefined, {
          numeric: true,
          sensitivity: 'base',
        });
        if (secCompare !== 0) return secCompare;

        // Natural alphanumeric sorting for House/Plot Numbers (e.g. 1, 2, 10, KH-1, KH-2, Plot-1, Plot-10...)
        return (a.housePlotNumber || '').trim().localeCompare((b.housePlotNumber || '').trim(), undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      });
  }, [
    scopedProperties,
    selectedColony,
    selectedSubSector,
    selectedBeat,
    selectedCategory,
    selectedStatus,
    selectedClassification,
    searchQuery,
    customerNameSearch,
    mobileSearch,
    houseNoSearch,
    landmarkSearch,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedColony,
    selectedSubSector,
    selectedBeat,
    selectedCategory,
    selectedStatus,
    selectedClassification,
    searchQuery,
    customerNameSearch,
    mobileSearch,
    houseNoSearch,
    landmarkSearch,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / HUB_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProperties = useMemo(
    () =>
      filteredProperties.slice(
        (safePage - 1) * HUB_PAGE_SIZE,
        safePage * HUB_PAGE_SIZE
      ),
    [filteredProperties, safePage]
  );

  // Active Filter Count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedColony !== 'All') count++;
    if (selectedSubSector !== 'All') count++;
    if (selectedBeat !== 'All') count++;
    if (selectedCategory !== 'All') count++;
    if (selectedStatus !== 'All') count++;
    if (selectedClassification !== 'All') count++;
    if (searchQuery.trim()) count++;
    if (customerNameSearch.trim()) count++;
    if (mobileSearch.trim()) count++;
    if (houseNoSearch.trim()) count++;
    if (landmarkSearch.trim()) count++;
    return count;
  }, [
    selectedColony,
    selectedSubSector,
    selectedBeat,
    selectedCategory,
    selectedStatus,
    selectedClassification,
    searchQuery,
    customerNameSearch,
    mobileSearch,
    houseNoSearch,
    landmarkSearch,
  ]);

  const handleResetFilters = () => {
    setSelectedColony('All');
    setSelectedSubSector('All');
    setSelectedBeat(isRestrictedStaff && userProfile?.beat ? userProfile.beat : 'All');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedClassification('All');
    setSearchQuery('');
    setCustomerNameSearch('');
    setMobileSearch('');
    setHouseNoSearch('');
    setLandmarkSearch('');
  };

  // Export to Excel
  const handleExportUnifiedExcel = () => {
    const rows: any[] = [];
    filteredProperties.forEach((p) => {
      if (p.linkedMembers.length === 0) {
        rows.push({
          'Property Code': p.propertyCode,
          'House / Plot No': p.housePlotNumber,
          'Colony': p.colony,
          'Block / Sector': p.blockSector,
          'Pincode': p.pincode,
          'Beat Number': p.beatNo,
          'Category': p.category,
          'Classification Tag': p.subTypeTag || 'Standard',
          'Status': p.occupancyStatus,
          'Landmark': p.landmark,
          'Assigned Staff': `${p.assignedStaffName} (${p.assignedStaffRole})`,
          'Member Name': 'Vacant / Unregistered',
          'Role in Household': 'N/A',
          'Mobile': 'N/A',
          'Active Schemes': 'None',
          'Last Mile Note': p.lastMileNote,
        });
      } else {
        p.linkedMembers.forEach((m) => {
          rows.push({
            'Property Code': p.propertyCode,
            'House / Plot No': p.housePlotNumber,
            'Colony': p.colony,
            'Block / Sector': p.blockSector,
            'Pincode': p.pincode,
            'Beat Number': p.beatNo,
            'Category': p.category,
            'Classification Tag': p.subTypeTag || 'Standard',
            'Status': p.occupancyStatus,
            'Landmark': p.landmark,
            'Assigned Staff': `${p.assignedStaffName} (${p.assignedStaffRole})`,
            'Member Name': m.name,
            'Role in Household': m.roleInHousehold,
            'Mobile': m.mobile,
            'Active Schemes': m.activeSchemes.map((s) => `${s.schemeName}: ${s.sumAssuredOrBalance}`).join('; ') || 'None',
            'Last Mile Note': p.lastMileNote,
          });
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Property_Family_Master');
    XLSX.writeFile(
      workbook,
      `Dadabari_Unified_Property_Family_Master_${new Date().toISOString().split('T')[0]}.xlsx`
    );
    showNotification('Exported complete Master Sheet (.xlsx) successfully!');
  };

  // Add Remark Handler
  const handleAddRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProperty || !newRemarkText.trim()) return;

    const newRemark: DeliveryRemarkEntry = {
      id: `rem-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      authorName: activeProperty.assignedStaffName || 'Mahendra Kumar Meena',
      authorRole: activeProperty.assignedStaffRole || 'GDS/PMAN',
      remarkText: newRemarkText.trim(),
      statusTag: newRemarkTag,
    };

    const updatedProp = {
      ...activeProperty,
      chronologicalRemarks: [newRemark, ...activeProperty.chronologicalRemarks],
      updatedAt: new Date().toISOString(),
    };

    setProperties(properties.map((p) => (p.id === activeProperty.id ? updatedProp : p)));
    setActiveProperty(updatedProp);
    setNewRemarkText('');
    setShowAddRemarkModal(false);
    showNotification('✅ Added delivery remark & audit record!');
  };

  // Add Family Member Handler
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProperty || !newMemberName.trim()) return;

    const schemesList: LinkedFamilyMember['activeSchemes'] = [];
    if (newMemberScheme !== 'None') {
      schemesList.push({
        schemeName: newMemberScheme as any,
        accountNoOrPolicy: 'NEW-INQUIRY',
        sumAssuredOrBalance: 'Lead Initiated in Master Hub',
        status: 'Lead Generated',
      });
    }

    const newMember: LinkedFamilyMember = {
      id: `m-${Date.now()}`,
      name: newMemberName.trim(),
      roleInHousehold: newMemberRole,
      mobile: newMemberMobile.trim() || '9828000000',
      whatsapp: newMemberMobile.trim() || '9828000000',
      age: parseInt(newMemberAge) || 28,
      gender: newMemberGender,
      occupation: newMemberOccupation.trim() || 'Resident',
      activeSchemes: schemesList,
    };

    const updatedProp = {
      ...activeProperty,
      linkedMembers: [...activeProperty.linkedMembers, newMember],
      updatedAt: new Date().toISOString(),
    };

    setProperties(properties.map((p) => (p.id === activeProperty.id ? updatedProp : p)));
    setActiveProperty(updatedProp);
    setNewMemberName('');
    setNewMemberMobile('');
    setNewMemberOccupation('');
    setNewMemberScheme('None');
    setShowAddMemberModal(false);
    showNotification(`✅ Successfully linked ${newMember.name} to property!`);
  };

  // Add New Property Handler
  const handleRegisterNewProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropHouseNo.trim() || !newPropHeadName.trim()) return;

    const staffInfo = BEAT_STAFF_MAP[newPropBeat] || {
      name: 'Mahendra Kumar Meena',
      role: 'GDS/PMAN',
      id: 'STAFF-50457421',
      contact: '8769706002',
    };

    const effectiveBlock = isCustomBlock ? (customBlockText.trim() || 'Sector 1') : newPropBlock;
    const cleanCol = normalizeColonyName(newPropColony);
    const auditedPin = getAuditedPincodeForColony(cleanCol, effectiveBlock);

    const newProp: UnifiedPropertyRecord = {
      id: `up-${Date.now()}`,
      propertyCode: `PROP-${cleanCol.substring(0, 3).toUpperCase()}-${newPropHouseNo.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6)}`,
      housePlotNumber: newPropHouseNo.trim(),
      houseNo: newPropHouseNo.trim(),
      colony: cleanCol,
      sector: effectiveBlock,
      block: effectiveBlock,
      blockSector: effectiveBlock,
      pincode: auditedPin || '324009',
      beatNo: newPropBeat,
      deliveryOffice: 'Dadabari S.O.',
      category: newPropCategory,
      subTypeTag: newPropCategory === 'Commercial' ? 'Commercial • General Store / Retail' : 'Residential Household',
      occupancyStatus: 'Occupied',
      landmark: newPropLandmark.trim() || `${effectiveBlock}, ${cleanCol} (Beat Route)`,
      assignedStaffId: staffInfo.id,
      assignedStaffName: staffInfo.name,
      assignedStaffRole: staffInfo.role,
      lastMileNote: `Registered via Master Hub. Mapped Colony: ${cleanCol}, Sector/Block: ${effectiveBlock}. Field door-to-door verification scheduled.`,
      verificationStatus: 'Verified',
      updatedAt: new Date().toISOString(),
      linkedMembers: [
        {
          id: `m-${Date.now()}`,
          name: newPropHeadName.trim(),
          roleInHousehold: 'Head of Household',
          mobile: newPropMobile.trim() || '9829000000',
          whatsapp: newPropMobile.trim() || '9829000000',
          activeSchemes: [],
        },
      ],
      chronologicalRemarks: [
        {
          id: `rem-${Date.now()}`,
          timestamp: new Date().toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
          authorName: staffInfo.name,
          authorRole: staffInfo.role,
          remarkText: `Property registered in Master Hub. Mapped to ${newPropColony} → ${effectiveBlock} under ${newPropBeat}.`,
          statusTag: 'Verification Done',
        },
      ],
    };

    const updatedProps = [newProp, ...properties];
    setProperties(updatedProps);
    try {
      localStorage.setItem('unified_property_family_hub_records_v4', JSON.stringify(updatedProps));
    } catch {}
    setShowAddPropertyModal(false);
    setNewPropHouseNo('');
    setNewPropHeadName('');
    setNewPropMobile('');
    setNewPropLandmark('');
    setIsCustomBlock(false);
    setCustomBlockText('');
    showNotification(`✅ Successfully registered property '${newProp.housePlotNumber}' in ${newProp.colony} (${effectiveBlock})!`);
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
              <span>POSTMAN BOOK CRM · DADABARI S.O. 324009</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Unified Property & Family Master Hub
            </h1>
            <p className="text-blue-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Consolidated, relational architecture merging <b>Physical Property Addresses</b> and <b>Household Family Trees</b> into a single master index with multi-customer linking and scheme intelligence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenAddPropertyModal}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>Register Property</span>
            </button>
            <button
              onClick={handleExportUnifiedExcel}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-2 shadow-xs cursor-pointer"
              title="Download Master Property & Family Sheet (.xlsx)"
            >
              <FileSpreadsheet size={15} className="text-emerald-400" />
              <span>Export (.xlsx)</span>
            </button>
            <button
              onClick={handleForceConsolidateAll}
              className="px-3.5 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-400/30 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Re-synchronize all legacy Household & Property Master records into Unified Hub"
            >
              <RefreshCw size={14} />
              <span>Consolidate All</span>
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
            className="text-xs text-emerald-800 font-bold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0">
            <Building2 size={22} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Properties Mapped</div>
            <div className="text-2xl font-black text-slate-900">{scopedProperties.length}</div>
            <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Physical Doorsteps</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Linked Residents</div>
            <div className="text-2xl font-black text-slate-900">
              {scopedProperties.reduce((acc, p) => acc + p.linkedMembers.length, 0)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Family Tree Members</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <BadgePercent size={22} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Postal Leads</div>
            <div className="text-2xl font-black text-amber-700">
              {scopedProperties.reduce(
                (acc, p) => acc + p.linkedMembers.reduce((mAcc, m) => mAcc + m.activeSchemes.length, 0),
                0
              )}
            </div>
            <div className="text-[11px] text-amber-600 font-semibold mt-0.5">PLI, SSY, IPPB Accounts</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isRestrictedStaff ? 'Assigned Beat Scope' : 'Dadabari Coverage'}
            </div>
            <div className="text-2xl font-black text-purple-900">
              {isRestrictedStaff ? userProfile?.beat || 'Scoped Beat' : 'Beat 1 - 33'}
            </div>
            <div className="text-[11px] text-purple-600 font-semibold mt-0.5">100% Staff Assigned</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADVANCED FILTERING & AREA-WISE TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-900">
              Area & Beat Filtering with Multi-Parameter Search
            </h3>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black">
                {activeFiltersCount} Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Toggle */}
            <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('CARD')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'CARD'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid size={13} />
                <span>Card View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'TABLE'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon size={13} />
                <span>Follow-Up Table</span>
              </button>
            </div>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 rounded-lg hover:bg-indigo-50 transition cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Dropdowns Row (5 Dropdowns including Classification) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Colony Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin size={12} className="text-indigo-600" />
              <span>Colony Area:</span>
            </label>
            <select
              value={selectedColony}
              onChange={(e) => handleColonyFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
            >
              {uniqueColonies.map((col) => (
                <option key={col} value={col}>
                  {col === 'All' ? 'All Colonies' : col}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Beat Dropdown (Beat 1 to Beat 33) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Building2 size={12} className="text-amber-600" />
              <span>Postal Beat (1-33):</span>
            </label>
            <select
              value={selectedBeat}
              onChange={(e) => setSelectedBeat(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
            >
              {uniqueBeats.map((b) => {
                const staff = BEAT_STAFF_MAP[b];
                return (
                  <option key={b} value={b}>
                    {b === 'All' ? 'All Beats (Beat 1 to 33)' : `${b} ${staff ? `· ${staff.name}` : ''}`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 3. Classification & Type Badges Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Tag size={12} className="text-purple-600" />
              <span>Classification / Type:</span>
            </label>
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
            >
              <option value="All">All Classifications</option>
              <option value="Commercial Only">Commercial Only</option>
              <option value="eMitra / CSC Kiosks">eMitra & CSC Kiosks</option>
              <option value="General Retail / Stores">General Retail / Stores</option>
              <option value="Residential Households">Residential Households</option>
            </select>
          </div>

          {/* 4. Category Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Building size={12} className="text-blue-600" />
              <span>Property Category:</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
            >
              <option value="All">All Categories</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Mixed">Mixed (Shop + Residence)</option>
              <option value="Plot">Plot</option>
              <option value="Under Construction">Under Construction</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>

          {/* 5. Status Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span>Occupancy Status:</span>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
            >
              <option value="All">All Statuses</option>
              <option value="Occupied">Occupied</option>
              <option value="Vacant">Vacant</option>
              <option value="Rented">Rented</option>
            </select>
          </div>
        </div>

        {/* Dynamic Sub-Section / Block Quick-Filter Bar */}
        {selectedColony !== 'All' && (
          <div className="bg-gradient-to-r from-indigo-50/90 via-blue-50/70 to-slate-50 border border-indigo-200/90 rounded-2xl p-3.5 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Layers size={13} />
                </span>
                <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                  Sub-Sector / Block Quick-Filters ({selectedColony}):
                </span>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full border border-indigo-200/50">
                  {colonySubSectorChips.find((c) => c.id === selectedSubSector)?.count ?? filteredProperties.length} Properties
                </span>
              </div>

              {selectedSubSector !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedSubSector('All')}
                  className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-indigo-100 transition cursor-pointer"
                >
                  <X size={12} />
                  <span>Show All {selectedColony}</span>
                </button>
              )}
            </div>

            {/* Quick-filter chip buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {colonySubSectorChips.map((chip) => {
                const isActive = selectedSubSector === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setSelectedSubSector(chip.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-indigo-500/25 ring-2 ring-indigo-400 font-extrabold'
                        : 'bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200/90 hover:border-indigo-300'
                    }`}
                  >
                    <span>{chip.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {chip.count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Multi-parameter Search Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Customer / Family Member Name */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Customer / Member..."
              value={customerNameSearch}
              onChange={(e) => setCustomerNameSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Mobile / WhatsApp (10-digit) */}
          <div className="relative">
            <Phone size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="10-digit Mobile / WhatsApp..."
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
            />
          </div>

          {/* House / Plot No */}
          <div className="relative">
            <Home size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="House / Plot Number..."
              value={houseNoSearch}
              onChange={(e) => setHouseNoSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Specific Landmark */}
          <div className="relative">
            <Sparkles size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Landmark (Mandir, Park)..."
              value={landmarkSearch}
              onChange={(e) => setLandmarkSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Results Count Bar */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 border-t border-slate-100 gap-2">
          <div>
            Showing <b>{paginatedProperties.length}</b> of <b>{filteredProperties.length}</b> matching ({scopedProperties.length} scoped total)
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-500" />
            <span>Master Index Active: Max 5 entries per view</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: VISUAL CARD GRID VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'CARD' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedProperties.map((prop) => (
            <div
              key={prop.id}
              className="bg-white rounded-3xl border border-slate-200/90 hover:border-indigo-400 shadow-xs hover:shadow-lg transition p-5 flex flex-col justify-between space-y-4 group relative overflow-hidden"
            >
              <div>
                {/* Header: House No, Category Badge, Status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {prop.propertyCode}
                      </span>
                      <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition">
                        {prop.housePlotNumber}
                      </h4>
                    </div>
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} className="text-indigo-600" />
                      <span>{prop.colony} · {prop.blockSector}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        prop.category === 'Commercial'
                          ? 'bg-amber-100 text-amber-800'
                          : prop.category === 'Mixed'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {prop.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        prop.occupancyStatus === 'Occupied'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {prop.occupancyStatus}
                    </span>
                  </div>
                </div>

                {/* Sub-type classification badge if present */}
                {prop.subTypeTag && (
                  <div className="mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[9px] font-black uppercase tracking-tight">
                      {prop.subTypeTag}
                    </span>
                  </div>
                )}

                {/* Landmark */}
                <div className="text-[11px] text-slate-500 italic pl-1">
                  📍 {prop.landmark}
                </div>

                {/* Linked Family Members */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Users size={12} className="text-indigo-600" />
                      <span>Linked Family ({prop.linkedMembers.length})</span>
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold font-mono">
                      {prop.beatNo} (324009)
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {prop.linkedMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{member.name}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-200 text-slate-700">
                              {member.roleInHousehold}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            📱 {member.mobile}
                          </div>
                        </div>

                        {/* Active Schemes Tag */}
                        {member.activeSchemes.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap justify-end">
                            {member.activeSchemes.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]"
                                title={`${s.schemeName}: ${s.sumAssuredOrBalance || 'Active'}`}
                              >
                                {s.schemeName}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Staff Assignment & Last Mile Note */}
                <div className="mt-3 p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950">
                      Postman: {prop.assignedStaffName}
                    </span>
                    <span className="font-mono text-[10px] text-purple-700 bg-white px-1.5 py-0.2 rounded border border-purple-200">
                      {prop.assignedStaffId}
                    </span>
                  </div>
                  {prop.lastMileNote && (
                    <div className="text-[11px] text-slate-600 line-clamp-2 italic">
                      Note: {prop.lastMileNote}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Action Triggers */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                <div className="flex items-center gap-1">
                  {prop.linkedMembers[0]?.mobile && (
                    <a
                      href={`tel:${prop.linkedMembers[0].mobile}`}
                      className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
                      title={`Call ${prop.linkedMembers[0].name}`}
                    >
                      <Phone size={13} />
                    </a>
                  )}
                  {prop.linkedMembers[0]?.whatsapp && (
                    <a
                      href={`https://wa.me/91${prop.linkedMembers[0].whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition border border-green-200"
                      title="WhatsApp Chat"
                    >
                      <MessageCircle size={13} />
                    </a>
                  )}
                  {/* Verify Location */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${prop.housePlotNumber}, ${prop.landmark || ''}, ${prop.colony}, Kota Rajasthan ${prop.pincode}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition border border-blue-200 flex items-center gap-1"
                    title="[Verify Location] on Google Maps"
                  >
                    <Navigation size={12} className="text-blue-600" />
                    <span className="hidden sm:inline">Verify Location</span>
                  </a>
                  {/* Navigate Map */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${prop.housePlotNumber}, ${prop.landmark || ''}, ${prop.colony}, Kota Rajasthan ${prop.pincode}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
                    title="[Navigate Map] Turn-by-Turn GPS Directions"
                  >
                    <MapPin size={13} />
                  </a>
                </div>

                <div className="flex items-center gap-1">
                  {/* Update Status Hook */}
                  <button
                    type="button"
                    onClick={() => handleOpenStatusModal(prop)}
                    className="px-2 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200 transition flex items-center gap-1 cursor-pointer"
                    title="[Update Status] Doorstep delivery / occupancy status"
                  >
                    <Edit2 size={12} className="text-amber-700" />
                    <span>Update Status</span>
                  </button>

                  {/* Map to Beat Hook */}
                  <button
                    type="button"
                    onClick={() => navigate('/sequence-properties', { state: { searchKeyword: prop.colony } })}
                    className="px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="[Map to Beat] Door-to-door sequence"
                  >
                    <Layers size={12} className="text-indigo-600" />
                    <span className="hidden sm:inline">Map Beat</span>
                  </button>

                  {/* Profile & Hub Hook */}
                  <button
                    type="button"
                    onClick={() => setActiveProperty(prop)}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="[Profile & Hub] Open full property & household detail"
                  >
                    <Eye size={12} />
                    <span>Profile & Hub</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: STRUCTURED TABLE / FOLLOW-UP VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'TABLE' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-extrabold text-xs text-slate-700 flex items-center justify-between">
            <span>Property-Family Follow-Up & Audit Table ({filteredProperties.length} Records)</span>
            <span className="text-[11px] text-indigo-700">Pincode 324009 · Dadabari S.O.</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-700 font-extrabold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3.5">Property</th>
                  <th className="py-3 px-3.5">Colony & Block</th>
                  <th className="py-3 px-3.5">Linked Family Members</th>
                  <th className="py-3 px-3.5">Active Scheme Leads</th>
                  <th className="py-3 px-3.5">Assigned Postman & Beat</th>
                  <th className="py-3 px-3.5 text-center">Category</th>
                  <th className="py-3 px-3.5 text-center">Status</th>
                  <th className="py-3 px-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-indigo-50/40 transition">
                    {/* Property */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-black text-slate-900 text-sm">{prop.housePlotNumber}</div>
                      <div className="font-mono text-[10px] text-slate-400">{prop.propertyCode}</div>
                    </td>

                    {/* Colony & Block */}
                    <td className="py-3 px-3.5 max-w-xs">
                      <div className="font-bold text-slate-800">{prop.colony}</div>
                      <div className="text-[11px] text-slate-500">{prop.blockSector}</div>
                      <div className="text-[10px] text-slate-400 italic truncate max-w-[180px]">
                        {prop.landmark}
                      </div>
                    </td>

                    {/* Linked Family Members */}
                    <td className="py-3 px-3.5 max-w-xs space-y-1">
                      {prop.linkedMembers.map((m) => (
                        <div key={m.id} className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{m.name}</span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                            {m.roleInHousehold}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-700 font-semibold">
                            {m.mobile}
                          </span>
                        </div>
                      ))}
                    </td>

                    {/* Active Scheme Leads */}
                    <td className="py-3 px-3.5">
                      <div className="flex flex-wrap gap-1">
                        {prop.linkedMembers.flatMap((m) => m.activeSchemes).length > 0 ? (
                          prop.linkedMembers.flatMap((m) => m.activeSchemes).map((s, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]"
                            >
                              {s.schemeName}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No active leads</span>
                        )}
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

                    {/* Category */}
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                          prop.category === 'Commercial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {prop.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prop.occupancyStatus === 'Occupied'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {prop.occupancyStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveProperty(prop)}
                          className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] transition flex items-center gap-1 cursor-pointer"
                          title="[Profile & Hub]"
                        >
                          <Eye size={11} />
                          <span>Profile & Hub</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(prop)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-lg text-[11px] transition flex items-center gap-1 cursor-pointer"
                          title="[Update Status]"
                        >
                          <Edit2 size={11} className="text-amber-700" />
                          <span>Update Status</span>
                        </button>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${prop.housePlotNumber}, ${prop.landmark || ''}, ${prop.colony}, Kota Rajasthan ${prop.pincode}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg text-[11px] transition flex items-center cursor-pointer"
                          title="[Verify Location]"
                        >
                          <Navigation size={12} />
                        </a>
                        <button
                          type="button"
                          onClick={() => navigate('/sequence-properties', { state: { searchKeyword: prop.colony } })}
                          className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] transition flex items-center cursor-pointer"
                          title="[Map to Beat]"
                        >
                          <Layers size={12} className="text-indigo-600" />
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

      {/* Pagination Bar (Max 5 per view) */}
      {filteredProperties.length > 0 && (
        <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 shadow-xs">
          <span>
            Showing <strong>{(safePage - 1) * HUB_PAGE_SIZE + 1}</strong>–
            <strong>{Math.min(safePage * HUB_PAGE_SIZE, filteredProperties.length)}</strong> of{' '}
            <strong>{filteredProperties.length}</strong> properties (Max 5 per view)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 font-bold flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>
            <span className="px-2.5 font-mono font-bold text-slate-800">
              Page {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED PROPERTY PROFILE & INTERACTIVE DRAWER / MODAL */}
      {/* ========================================================================= */}
      {activeProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {activeProperty.propertyCode}
                  </span>
                  <h3 className="font-black text-xl text-slate-900">
                    {activeProperty.housePlotNumber} · {activeProperty.colony}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      activeProperty.category === 'Commercial'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {activeProperty.category}
                  </span>
                  {activeProperty.subTypeTag && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">
                      {activeProperty.subTypeTag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {activeProperty.blockSector}, {activeProperty.colony}, Kota, PIN {activeProperty.pincode} · Assigned: {activeProperty.beatNo} ({activeProperty.deliveryOffice})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveProperty(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Property Metadata Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <div className="text-slate-500 font-semibold uppercase text-[10px]">Prominent Landmark</div>
                <div className="font-bold text-slate-900 mt-0.5">{activeProperty.landmark}</div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold uppercase text-[10px]">Assigned Postman</div>
                <div className="font-bold text-indigo-950 mt-0.5">
                  {activeProperty.assignedStaffName} ({activeProperty.assignedStaffRole})
                </div>
                <div className="font-mono text-[10px] text-purple-700">{activeProperty.assignedStaffId}</div>
              </div>
              <div>
                <div className="text-slate-500 font-semibold uppercase text-[10px]">Verification & Note</div>
                <div className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>{activeProperty.verificationStatus}</span>
                </div>
                <div className="text-[11px] text-slate-600 italic truncate">{activeProperty.lastMileNote}</div>
              </div>
            </div>

            {/* Linked Family Members & Customers Database Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Linked Family Members & Customers ({activeProperty.linkedMembers.length})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(true)}
                  className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus size={13} />
                  <span>Link Member</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                      <th className="py-2.5 px-3">Name & Role</th>
                      <th className="py-2.5 px-3">Mobile & WhatsApp</th>
                      <th className="py-2.5 px-3">Age/Gender</th>
                      <th className="py-2.5 px-3">Active Postal Scheme Leads</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeProperty.linkedMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{m.name}</div>
                          <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-200 text-slate-700">
                            {m.roleInHousehold}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <div>{m.mobile}</div>
                          {m.whatsapp && <div className="text-[10px] text-green-700">WA: {m.whatsapp}</div>}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {m.age ? `${m.age} Yrs` : '-'} / {m.gender || '-'}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="space-y-1">
                            {m.activeSchemes.length > 0 ? (
                              m.activeSchemes.map((s, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                    {s.schemeName}
                                  </span>
                                  <span className="text-slate-600">{s.sumAssuredOrBalance}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">None registered</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {m.mobile && (
                              <a
                                href={`tel:${m.mobile}`}
                                className="p-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                title="Call"
                              >
                                <Phone size={12} />
                              </a>
                            )}
                            {m.whatsapp && (
                              <a
                                href={`https://wa.me/91${m.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                                title="WhatsApp"
                              >
                                <MessageCircle size={12} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Latest Update & Chronological Delivery Remarks Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Latest Updates & Last-Mile Audit Trail ({activeProperty.chronologicalRemarks.length})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddRemarkModal(true)}
                  className="px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Remark</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activeProperty.chronologicalRemarks.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{rem.authorName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({rem.authorRole})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          {rem.statusTag}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{rem.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-slate-700 text-[11px] leading-relaxed">{rem.remarkText}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${activeProperty.housePlotNumber}, ${activeProperty.colony}, Kota Rajasthan ${activeProperty.pincode}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-200"
                >
                  <Navigation size={13} className="text-blue-600" />
                  <span>Verify on Google Maps</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/sequence-properties', { state: { searchKeyword: activeProperty.colony } });
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                >
                  <Layers size={13} className="text-indigo-600" />
                  <span>Map into Beat Sequence</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveProperty(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Remark Modal */}
      {showAddRemarkModal && activeProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-900">
                Add Last-Mile Remark / Verification Log
              </h4>
              <button
                type="button"
                onClick={() => setShowAddRemarkModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddRemark} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Classification:</label>
                <select
                  value={newRemarkTag}
                  onChange={(e) => setNewRemarkTag(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50"
                >
                  <option value="Standard Delivery">Standard Delivery</option>
                  <option value="Parcel Delivered">Parcel Delivered</option>
                  <option value="Door Locked">Door Locked / Addressee Absent</option>
                  <option value="Address Shifted">Address Shifted / Tenant Moved</option>
                  <option value="Scheme Lead Pitch">Scheme Lead Pitch (PLI/SSY/IPPB)</option>
                  <option value="Verification Done">Verification Done & Confirmed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Operational Observation / Note:</label>
                <textarea
                  rows={3}
                  value={newRemarkText}
                  onChange={(e) => setNewRemarkText(e.target.value)}
                  placeholder="e.g. Delivered Speed Post parcel to family head. Doorbell rung at left pillar. Customer expressed interest in SSY top-up."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRemarkModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Remark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Family Member Modal */}
      {showAddMemberModal && activeProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-900">
                Link New Family Member to {activeProperty.housePlotNumber}
              </h4>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Member Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Urmila Chauhan"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role in Family</label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50"
                  >
                    <option value="Head of Household">Head of Household</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Tenant">Tenant</option>
                    <option value="Commercial Operator">Commercial Operator</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="9414589201"
                    value={newMemberMobile}
                    onChange={(e) => setNewMemberMobile(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age & Gender</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Age"
                      value={newMemberAge}
                      onChange={(e) => setNewMemberAge(e.target.value)}
                      className="w-16 px-2 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                    <select
                      value={newMemberGender}
                      onChange={(e) => setNewMemberGender(e.target.value as any)}
                      className="flex-1 px-2 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    placeholder="e.g. Teacher, Business"
                    value={newMemberOccupation}
                    onChange={(e) => setNewMemberOccupation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Postal Scheme Lead</label>
                <select
                  value={newMemberScheme}
                  onChange={(e) => setNewMemberScheme(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50"
                >
                  <option value="None">None (General Inquiry)</option>
                  <option value="PLI">PLI (Postal Life Insurance)</option>
                  <option value="SSY">SSY (Sukanya Samriddhi)</option>
                  <option value="IPPB">IPPB (Digital Banking)</option>
                  <option value="MIS">MIS (Monthly Income Scheme)</option>
                  <option value="RD">RD (Recurring Deposit)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Link to Household
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Property Modal */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-900">
                Register New Physical Property in Dadabari Jurisdiction
              </h4>
              <button
                type="button"
                onClick={() => setShowAddPropertyModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterNewProperty} className="space-y-3">
              {/* Colony & Sector Mapping Card (Strict Hierarchy: Colony -> Sector -> Block -> House No.) */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-3">
                <div className="text-[11px] font-black text-indigo-950 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-indigo-600" />
                    <span>Hierarchical Property Mapping (Dadabari S.O. 324009)</span>
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full border border-indigo-200/60">
                    Auto Beat-Linked
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Colony Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <span>1. Colony Area *</span>
                    </label>
                    <select
                      value={newPropColony}
                      onChange={(e) => handleNewPropColonyChange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
                      required
                    >
                      {uniqueColonies.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Corresponding Mapped Sector / Sub-Sector Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>2. Sector / Sub-Sector *</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{newPropColony}</span>
                    </label>
                    <select
                      value={isCustomBlock ? '__CUSTOM__' : newPropBlock}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__CUSTOM__') {
                          setIsCustomBlock(true);
                          setNewPropBlock(customBlockText || 'Block A');
                        } else {
                          setIsCustomBlock(false);
                          setNewPropBlock(val);
                          const resolved = resolveColonySectorDetails(newPropColony, val);
                          setNewPropBeat(resolved.beatNo);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
                      required
                    >
                      {availableRegistrationSectors.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                      <option value="__CUSTOM__">✍️ Custom Block / Sector...</option>
                    </select>
                  </div>
                </div>

                {/* 3. Custom Block Input when chosen */}
                {isCustomBlock && (
                  <div className="animate-in fade-in duration-150 pt-1">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      3. Specify Block / Sector / Phase:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Block D Extension or Phase 2"
                      value={customBlockText}
                      onChange={(e) => {
                        setCustomBlockText(e.target.value);
                        setNewPropBlock(e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-indigo-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      required
                    />
                  </div>
                )}

                {/* 4. House / Plot / KH Number & Category */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">4. House / Plot / KH No. *</label>
                    <input
                      type="text"
                      placeholder="e.g. 5-A, KH-12, Plot 162"
                      value={newPropHouseNo}
                      onChange={(e) => setNewPropHouseNo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Property Category</label>
                    <select
                      value={newPropCategory}
                      onChange={(e) => setNewPropCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Mixed">Mixed (Shop + Home)</option>
                      <option value="Plot">Plot</option>
                      <option value="Under Construction">Under Construction</option>
                    </select>
                  </div>
                </div>

                {/* Postal Beat & Active Mapping Indicator */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Building2 size={12} className="text-amber-600" />
                      <span>Postal Beat:</span>
                    </label>
                    <select
                      value={newPropBeat}
                      onChange={(e) => setNewPropBeat(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800"
                    >
                      {uniqueBeats.filter((b) => b !== 'All').map((b) => {
                        const staff = BEAT_STAFF_MAP[b];
                        return (
                          <option key={b} value={b}>
                            {b} {staff ? `· ${staff.name}` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <div className="px-3 py-2 rounded-xl bg-indigo-100/70 border border-indigo-200/90 text-indigo-950 text-[11px] font-medium leading-tight">
                      <div className="font-bold flex items-center gap-1">
                        <Check size={12} className="text-indigo-600" />
                        <span>Permanent Colony-Beat Mapping:</span>
                      </div>
                      <div className="font-semibold text-slate-800 mt-0.5">
                        {resolveColonySectorDetails(newPropColony, isCustomBlock ? customBlockText : newPropBlock).jurisdictionBadge}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prominent Landmark Hint</label>
                <input
                  type="text"
                  placeholder="e.g. Near Shiv Mandir Gali, Opposite Water Tank"
                  value={newPropLandmark}
                  onChange={(e) => setNewPropLandmark(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Head of Household *</label>
                  <input
                    type="text"
                    placeholder="e.g. Kailash Sen"
                    value={newPropHeadName}
                    onChange={(e) => setNewPropHeadName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Contact</label>
                  <input
                    type="text"
                    placeholder="9829012345"
                    value={newPropMobile}
                    onChange={(e) => setNewPropMobile(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPropertyModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Create Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Update Status Modal */}
      {statusModalProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                  1-Click Field Action Hook
                </span>
                <h4 className="font-extrabold text-base text-slate-900 mt-0.5">
                  Update Status & Log Doorstep Note
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setStatusModalProperty(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900 text-sm">
                {statusModalProperty.housePlotNumber} · {statusModalProperty.colony}
              </div>
              <div className="text-slate-500 text-[11px]">
                {statusModalProperty.blockSector} · {statusModalProperty.beatNo} (Dadabari S.O. 324009)
              </div>
              <div className="text-indigo-900 text-[11px] font-semibold">
                Postman: {statusModalProperty.assignedStaffName} ({statusModalProperty.assignedStaffId})
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Occupancy Status</label>
                <select
                  value={statusOccupancy}
                  onChange={(e) => setStatusOccupancy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Occupied">Occupied (Family residing)</option>
                  <option value="Vacant">Vacant (Unoccupied / Locked)</option>
                  <option value="Rented">Rented (Tenant residing)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Field Verification Status</label>
                <select
                  value={statusVerification}
                  onChange={(e) => setStatusVerification(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Verified">Verified (Ground Confirmed)</option>
                  <option value="Pending Verification">Pending Verification</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Action / Remark Tag</label>
                <select
                  value={statusRemarkTag}
                  onChange={(e) => setStatusRemarkTag(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Verification Done">Verification Done</option>
                  <option value="Standard Delivery">Standard Delivery</option>
                  <option value="Parcel Delivered">Parcel Delivered</option>
                  <option value="Scheme Lead Pitch">Scheme Lead Pitch (PLI/SSY/IPPB)</option>
                  <option value="Door Locked">Door Locked / Customer Unavailable</option>
                  <option value="Address Shifted">Address Shifted / Relocated</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Doorstep Field Note / Delivery Remark</label>
                <textarea
                  rows={3}
                  value={statusRemarkText}
                  onChange={(e) => setStatusRemarkText(e.target.value)}
                  placeholder="Enter doorstep delivery remark, resident confirmation or scheme inquiry..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStatusModalProperty(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStatusModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={14} />
                <span>Save & Update Status</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
