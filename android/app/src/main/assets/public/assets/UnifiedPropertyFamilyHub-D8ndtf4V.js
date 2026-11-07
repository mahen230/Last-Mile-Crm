import { c as createLucideIcon, a as useNavigate, r as reactExports, g as getHierarchyColoniesList, d as getHierarchySectorsForColony, v as matchPropertyToSubSector, j as jsxRuntimeExports, w as ShieldCheck, P as Plus, F as FileSpreadsheet, x as RefreshCw, C as CircleCheck, B as Building2, U as Users, y as Funnel, G as Grid3x3, z as Table, e as MapPin, p as Building, L as Layers, X, S as Search, n as Phone, H as House, I as Sparkles, J as MessageCircle, N as Navigation, K as Pen, E as Eye, Q as UserPlus, V as History, W as resolveColonySectorDetails, Y as Check, Z as utils, _ as writeFileSync, $ as getAuditedPincodeForColony, a0 as DEFAULT_SEQUENTIAL_PROPERTIES, a1 as SECTOR_6_MERGED_PROPERTY_DHANRAJ, b as customerService, a2 as INITIAL_CUSTOMERS, a3 as isSector6House3Or4, a4 as DADABARI_324009_VERIFIED_COMMERCIAL_REGISTRY, a5 as CONSOLIDATED_BEAT_MATRIX, a6 as normalizeAndCleanColony, a7 as UPDATED_STAFF_LIST } from "./index-u5ATSoh6.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",
      key: "3c2336"
    }
  ],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "M9 9h.01", key: "1q5me6" }],
  ["path", { d: "M15 15h.01", key: "lqbp3k" }]
];
const BadgePercent = createLucideIcon("badge-percent", __iconNode$1);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
      key: "vktsd0"
    }
  ],
  ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]
];
const Tag = createLucideIcon("tag", __iconNode);
const BEAT_STAFF_MAP = {};
UPDATED_STAFF_LIST.forEach((s) => {
  BEAT_STAFF_MAP[s.beat] = {
    id: s.id,
    name: s.name,
    role: s.role,
    contact: s.contact
  };
});
function normalizeColonyName(raw) {
  const norm = normalizeAndCleanColony(raw);
  return norm.colony || "Dadabari";
}
function normalizeBeatNumber(rawBeat, colony) {
  if (rawBeat) {
    const str = String(rawBeat).trim();
    if (str.toLowerCase().startsWith("beat")) {
      const num = str.replace(/\D/g, "");
      return `Beat ${num || "2"}`;
    }
    const cleanNum = str.replace(/\D/g, "");
    if (cleanNum) return `Beat ${cleanNum}`;
  }
  const colLow = colony.toLowerCase();
  const matched = CONSOLIDATED_BEAT_MATRIX.find(
    (b) => b.colonies.some((c) => c.toLowerCase().includes(colLow)) || colLow.includes(b.beatNumber.toLowerCase())
  );
  return matched ? matched.beatNumber : "Beat 2";
}
const CURATED_BASELINE_PROPERTIES = [
  {
    id: "up-1",
    propertyCode: "PROP-DAD-001",
    housePlotNumber: "3-A",
    colony: "Santoshi Nagar",
    blockSector: "Block A",
    pincode: "324009",
    beatNo: "Beat 2",
    deliveryOffice: "Dadabari S.O.",
    category: "Residential",
    subTypeTag: "Residential Household",
    occupancyStatus: "Occupied",
    landmark: "Main Road Chauraha, near Shiv Mandir Gali",
    assignedStaffId: "STAFF-50457421",
    assignedStaffName: "Mahendra Kumar Meena",
    assignedStaffRole: "GDS/PMAN",
    lastMileNote: "Blue iron gate, bell at right pillar. Handover to family head.",
    verificationStatus: "Verified",
    updatedAt: "2026-10-15T10:30:00Z",
    linkedMembers: [
      {
        id: "m-101",
        name: "Roshni Sakywal",
        roleInHousehold: "Head of Household",
        mobile: "8769706002",
        whatsapp: "8769706002",
        age: 38,
        gender: "Female",
        occupation: "Government Teacher",
        activeSchemes: [
          { schemeName: "PLI", accountNoOrPolicy: "PLI-RJ-884102", sumAssuredOrBalance: "₹10,00,000 (Suraksha)", status: "Active" },
          { schemeName: "SSY", accountNoOrPolicy: "SSY-DAD-0492", sumAssuredOrBalance: "₹1,50,000/yr", status: "Active" }
        ]
      },
      {
        id: "m-102",
        name: "Prakash Koli",
        roleInHousehold: "Spouse",
        mobile: "9414589201",
        whatsapp: "9414589201",
        age: 42,
        gender: "Male",
        occupation: "PWD Engineer",
        activeSchemes: [
          { schemeName: "IPPB", accountNoOrPolicy: "IPPB-003841", sumAssuredOrBalance: "₹45,000", status: "Active" }
        ]
      }
    ],
    chronologicalRemarks: [
      {
        id: "rem-1",
        timestamp: "2026-10-14 11:20 AM",
        authorName: "Mahendra Kumar Meena",
        authorRole: "GDS/PMAN",
        remarkText: "Delivered speed post article ED88391209IN to Roshni Sakywal. Doorstep verification confirmed.",
        statusTag: "Parcel Delivered"
      },
      {
        id: "rem-2",
        timestamp: "2026-10-02 04:15 PM",
        authorName: "Mahendra Kumar Meena",
        authorRole: "GDS/PMAN",
        remarkText: "Pitched Sukanya Samriddhi top-up before festival season. Customer interested in PLI bonus review.",
        statusTag: "Scheme Lead Pitch"
      }
    ]
  },
  {
    id: "up-2",
    propertyCode: "PROP-DAD-002",
    housePlotNumber: "46-B",
    colony: "Santoshi Nagar",
    blockSector: "Block B",
    pincode: "324009",
    beatNo: "Beat 2",
    deliveryOffice: "Dadabari S.O.",
    category: "Residential",
    subTypeTag: "Residential Household",
    occupancyStatus: "Occupied",
    landmark: "Corner House near Mamta Kirana Store",
    assignedStaffId: "STAFF-50457421",
    assignedStaffName: "Mahendra Kumar Meena",
    assignedStaffRole: "GDS/PMAN",
    lastMileNote: "Corner staircase on 1st floor. Regular SSY deposits.",
    verificationStatus: "Verified",
    updatedAt: "2026-10-12T09:15:00Z",
    linkedMembers: [
      {
        id: "m-201",
        name: "Soniya Nayak",
        roleInHousehold: "Head of Household",
        mobile: "9828876543",
        whatsapp: "9828876543",
        age: 34,
        gender: "Female",
        occupation: "Self Employed Boutique",
        activeSchemes: [
          { schemeName: "SSY", accountNoOrPolicy: "SSY-DAD-9921", sumAssuredOrBalance: "₹50,000/yr", status: "Active" }
        ]
      },
      {
        id: "m-202",
        name: "Hariom Nayak",
        roleInHousehold: "Spouse",
        mobile: "9828876544",
        whatsapp: "9828876544",
        age: 37,
        gender: "Male",
        occupation: "Transport Business",
        activeSchemes: [
          { schemeName: "PLI", accountNoOrPolicy: "PLI-RJ-9930", sumAssuredOrBalance: "₹5,00,000", status: "Lead Generated" }
        ]
      },
      {
        id: "m-203",
        name: "Sunil Kumar (Tenant)",
        roleInHousehold: "Tenant",
        mobile: "9602222629",
        age: 26,
        gender: "Male",
        occupation: "Coaching Faculty",
        activeSchemes: [
          { schemeName: "IPPB", accountNoOrPolicy: "IPPB-7741", sumAssuredOrBalance: "Doorstep KYC", status: "Active" }
        ]
      }
    ],
    chronologicalRemarks: [
      {
        id: "rem-3",
        timestamp: "2026-10-11 02:40 PM",
        authorName: "Mahendra Kumar Meena",
        authorRole: "GDS/PMAN",
        remarkText: "Delivered Cheque book for tenant Sunil. Verified electricity bill for address proof.",
        statusTag: "Verification Done"
      }
    ]
  },
  {
    id: "up-3",
    propertyCode: "PROP-DAD-003",
    housePlotNumber: "Plot 95",
    colony: "Keshavpura",
    blockSector: "Sector 7",
    pincode: "324009",
    beatNo: "Beat 2",
    deliveryOffice: "Dadabari S.O.",
    category: "Residential",
    subTypeTag: "Residential Household",
    occupancyStatus: "Occupied",
    landmark: "Near Shree Ram School Gate, Sector 7 Chauraha",
    assignedStaffId: "STAFF-50457421",
    assignedStaffName: "Mahendra Kumar Meena",
    assignedStaffRole: "GDS/PMAN",
    lastMileNote: "Double storey house with green parapet. Dog on premises.",
    verificationStatus: "Verified",
    updatedAt: "2026-10-10T14:20:00Z",
    linkedMembers: [
      {
        id: "m-301",
        name: "Depti Mehra",
        roleInHousehold: "Head of Household",
        mobile: "9928486812",
        whatsapp: "9928486812",
        age: 46,
        gender: "Female",
        occupation: "Homemaker / LIC Agent",
        activeSchemes: [
          { schemeName: "PLI", accountNoOrPolicy: "PLI-RJ-7741", sumAssuredOrBalance: "₹5,00,000 (Santosh)", status: "Active" },
          { schemeName: "RD", accountNoOrPolicy: "RD-DAD-0294", sumAssuredOrBalance: "₹5,000/mo", status: "Active" }
        ]
      },
      {
        id: "m-302",
        name: "Kailash Mehra",
        roleInHousehold: "Spouse",
        mobile: "9928486813",
        age: 51,
        gender: "Male",
        occupation: "Senior Accounts Officer",
        activeSchemes: [
          { schemeName: "MIS", accountNoOrPolicy: "MIS-DAD-1188", sumAssuredOrBalance: "₹9,00,000 Joint", status: "Active" }
        ]
      }
    ],
    chronologicalRemarks: [
      {
        id: "rem-4",
        timestamp: "2026-10-09 10:15 AM",
        authorName: "Mahendra Kumar Meena",
        authorRole: "GDS/PMAN",
        remarkText: "Delivered Postal Passbook after interest posting. MIS interest credit verified.",
        statusTag: "Standard Delivery"
      }
    ]
  },
  {
    id: "up-4",
    propertyCode: "PROP-DAD-004",
    housePlotNumber: "817",
    colony: "Patel Nagar",
    blockSector: "Main Street",
    pincode: "324009",
    beatNo: "Beat 2",
    deliveryOffice: "Dadabari S.O.",
    category: "Plot",
    subTypeTag: "Residential Household",
    occupancyStatus: "Vacant",
    landmark: "Behind Water Tank, Patel Nagar Park",
    assignedStaffId: "STAFF-50457421",
    assignedStaffName: "Mahendra Kumar Meena",
    assignedStaffRole: "GDS/PMAN",
    lastMileNote: "Old tenant Rohit Yadav shifted to new house. Property locked.",
    verificationStatus: "Conflict",
    updatedAt: "2026-10-08T11:00:00Z",
    linkedMembers: [
      {
        id: "m-401",
        name: "Rohit Yadav (Address Shifted)",
        roleInHousehold: "Tenant",
        mobile: "7878615426",
        age: 31,
        gender: "Male",
        occupation: "Software Developer",
        activeSchemes: [
          { schemeName: "IPPB", accountNoOrPolicy: "IPPB-00991", sumAssuredOrBalance: "KYC Relocation Req", status: "Follow-up Required" }
        ]
      }
    ],
    chronologicalRemarks: [
      {
        id: "rem-5",
        timestamp: "2026-10-07 03:00 PM",
        authorName: "Mahendra Kumar Meena",
        authorRole: "GDS/PMAN",
        remarkText: "Parcel returned due to addressee left without forwarding address. Marked in relocation ledger.",
        statusTag: "Address Shifted"
      }
    ]
  },
  {
    id: "up-5",
    propertyCode: "PROP-DAD-005",
    housePlotNumber: "KH 222",
    colony: "Keshavpura",
    blockSector: "Sector 6",
    pincode: "324009",
    beatNo: "Beat 2",
    deliveryOffice: "Dadabari S.O.",
    category: "Mixed",
    subTypeTag: "Mixed Unit",
    occupancyStatus: "Occupied",
    landmark: "Main Market Road, near Kumhar Mohalla",
    assignedStaffId: "STAFF-50457421",
    assignedStaffName: "Mahendra Kumar Meena",
    assignedStaffRole: "GDS/PMAN",
    lastMileNote: "Ground floor grocery shop, residence on 1st floor.",
    verificationStatus: "Verified",
    updatedAt: "2026-10-13T16:45:00Z",
    linkedMembers: [
      {
        id: "m-501",
        name: "Hemant Yadav",
        roleInHousehold: "Head of Household",
        mobile: "9649734725",
        whatsapp: "9649734725",
        age: 40,
        gender: "Male",
        occupation: "General Merchant Store Owner",
        activeSchemes: [
          { schemeName: "IPPB", accountNoOrPolicy: "IPPB-QR-4412", sumAssuredOrBalance: "Merchant QR Active", status: "Active" },
          { schemeName: "PLI", accountNoOrPolicy: "PLI-RJ-5520", sumAssuredOrBalance: "₹15,00,000 (Suraksha)", status: "Active" }
        ]
      }
    ],
    chronologicalRemarks: [
      {
        id: "rem-6",
        timestamp: "2026-10-12 11:50 AM",
        authorName: "Mahendra Kumar Meena",
        authorRole: "GDS/PMAN",
        remarkText: "Delivered business correspondence. Merchant QR working smoothly.",
        statusTag: "Standard Delivery"
      }
    ]
  },
  {
    id: "up-6",
    propertyCode: "PROP-DAD-006",
    housePlotNumber: "2F-20",
    colony: "Teachers Colony",
    blockSector: "Block F",
    pincode: "324009",
    beatNo: "Beat 6",
    deliveryOffice: "Dadabari S.O.",
    category: "Residential",
    subTypeTag: "Residential Household",
    occupancyStatus: "Occupied",
    landmark: "Behind Government School, Near Community Hall",
    assignedStaffId: "STAFF-10310731",
    assignedStaffName: "Girish Kumar Mathur",
    assignedStaffRole: "POSTMAN",
    lastMileNote: "Retired Lecturer residence. Morning delivery preferred.",
    verificationStatus: "Verified",
    updatedAt: "2026-10-14T09:00:00Z",
    linkedMembers: [
      {
        id: "m-601",
        name: "Rajendra Solanki",
        roleInHousehold: "Head of Household",
        mobile: "9462725512",
        whatsapp: "9462725512",
        age: 62,
        gender: "Male",
        occupation: "Retired College Professor",
        activeSchemes: [
          { schemeName: "SCSS", accountNoOrPolicy: "SCSS-DAD-0912", sumAssuredOrBalance: "₹15,00,000 Max Deposit", status: "Active" },
          { schemeName: "MIS", accountNoOrPolicy: "MIS-DAD-4412", sumAssuredOrBalance: "₹4,50,000", status: "Active" }
        ]
      }
    ],
    chronologicalRemarks: [
      {
        id: "rem-7",
        timestamp: "2026-10-13 09:30 AM",
        authorName: "Girish Kumar Mathur",
        authorRole: "POSTMAN",
        remarkText: "Delivered Pension disbursement advisory letter. Customer verified in person.",
        statusTag: "Parcel Delivered"
      }
    ]
  },
  {
    id: "up-7",
    propertyCode: "PROP-DAD-007",
    housePlotNumber: "Plot 42-A",
    colony: "Mahaveer Nagar",
    blockSector: "Sector 3",
    pincode: "324005",
    beatNo: "Beat 14",
    deliveryOffice: "Dadabari S.O.",
    category: "Commercial",
    subTypeTag: "Commercial • General Store / Retail",
    occupancyStatus: "Occupied",
    landmark: "Opposite Central Park, Main Coaching Hub Road",
    assignedStaffId: "STAFF-10310733",
    assignedStaffName: "Satish Kumar Sharma",
    assignedStaffRole: "POSTMAN",
    lastMileNote: "Student hostel & cyber cafe. High speed post parcel volume.",
    verificationStatus: "Verified",
    updatedAt: "2026-10-15T11:45:00Z",
    linkedMembers: [
      {
        id: "m-701",
        name: "Sunil Kumar Sharma",
        roleInHousehold: "Head of Household",
        mobile: "9414188200",
        whatsapp: "9414188200",
        age: 48,
        gender: "Male",
        occupation: "Hostel & Cyber Cafe Proprietor",
        activeSchemes: [
          { schemeName: "IPPB", accountNoOrPolicy: "IPPB-M-8891", sumAssuredOrBalance: "₹1,20,000 Monthly Merchant Vol", status: "Active" },
          { schemeName: "PLI", accountNoOrPolicy: "PLI-RJ-1192", sumAssuredOrBalance: "₹20,00,000", status: "Active" }
        ]
      }
    ],
    chronologicalRemarks: [
      {
        id: "rem-8",
        timestamp: "2026-10-15 11:20 AM",
        authorName: "Satish Kumar Sharma",
        authorRole: "POSTMAN",
        remarkText: "Delivered 8 admit cards and 2 speed post documents for hostel students.",
        statusTag: "Parcel Delivered"
      }
    ]
  },
  {
    id: "up-8",
    propertyCode: "PROP-DAD-008",
    housePlotNumber: "Qtr VIP-07",
    colony: "Thermal Colony",
    blockSector: "Phase 3 VIP",
    pincode: "324009",
    beatNo: "Beat 33",
    deliveryOffice: "Dadabari S.O.",
    category: "Residential",
    subTypeTag: "Residential Household",
    occupancyStatus: "Occupied",
    landmark: "Thermal Main Gate 3, VIP Circuit House Road",
    assignedStaffId: "STAFF-10310738",
    assignedStaffName: "Jitendra Kumar Meena",
    assignedStaffRole: "POSTMAN",
    lastMileNote: "Entry pass required at Gate 3. Official departmental mail recipient.",
    verificationStatus: "Verified",
    updatedAt: "2026-10-14T15:30:00Z",
    linkedMembers: [
      {
        id: "m-801",
        name: "Er. Jitendra Singh Rathore",
        roleInHousehold: "Head of Household",
        mobile: "8696539977",
        whatsapp: "8696539977",
        age: 44,
        gender: "Male",
        occupation: "Executive Engineer Thermal Power Station",
        activeSchemes: [
          { schemeName: "PLI", accountNoOrPolicy: "PLI-KSTPS-991", sumAssuredOrBalance: "₹25,00,000 (Whole Life)", status: "Active" }
        ]
      }
    ],
    chronologicalRemarks: [
      {
        id: "rem-9",
        timestamp: "2026-10-14 03:15 PM",
        authorName: "Jitendra Kumar Meena",
        authorRole: "POSTMAN",
        remarkText: "Delivered Official Government Gazetted Letter. Handed over with signature.",
        statusTag: "Parcel Delivered"
      }
    ]
  }
];
function buildMasterConsolidatedProperties() {
  const propertyMap = /* @__PURE__ */ new Map();
  CURATED_BASELINE_PROPERTIES.forEach((p) => {
    const key = `${p.colony.toLowerCase().trim()}__${p.housePlotNumber.toLowerCase().replace(/\s+/g, "")}`;
    propertyMap.set(key, { ...p, linkedMembers: [...p.linkedMembers], chronologicalRemarks: [...p.chronologicalRemarks] });
  });
  DEFAULT_SEQUENTIAL_PROPERTIES.forEach((seq) => {
    const col = normalizeColonyName(seq.colony);
    const plot = seq.housePlotNumber.trim();
    const key = `${col.toLowerCase()}__${plot.toLowerCase().replace(/\s+/g, "")}`;
    if (!propertyMap.has(key)) {
      const beat = normalizeBeatNumber(seq.beatNo, col);
      const staff = BEAT_STAFF_MAP[beat] || {
        id: seq.assignedStaffId || "STAFF-50457421",
        name: seq.assignedStaffName || "Mahendra Kumar Meena",
        role: seq.assignedStaffRole || "GDS/PMAN"
      };
      const members = seq.residents.map((resName, idx) => ({
        id: `m-seq-${seq.id}-${idx}`,
        name: resName,
        roleInHousehold: idx === 0 ? "Head of Household" : "Family Member",
        mobile: idx === 0 ? seq.primaryMobile : "9828000000",
        whatsapp: idx === 0 ? seq.whatsapp || seq.primaryMobile : void 0,
        age: idx === 0 ? 40 : 36,
        gender: idx === 0 ? "Female" : "Male",
        occupation: idx === 0 ? "Government Employee" : "Private Sector",
        activeSchemes: [
          { schemeName: "PLI", sumAssuredOrBalance: "₹5,00,000 (Suraksha)", status: "Active" },
          { schemeName: "SSY", sumAssuredOrBalance: "₹50,000/yr", status: "Active" }
        ]
      }));
      propertyMap.set(key, {
        id: `up-${seq.id}`,
        propertyCode: `PROP-${col.substring(0, 3).toUpperCase()}-${plot.replace(/[^a-zA-Z0-9]/g, "").substring(0, 6)}`,
        housePlotNumber: plot,
        colony: col,
        blockSector: seq.blockSector || "Sector 1",
        pincode: seq.pincode || "324009",
        beatNo: beat,
        deliveryOffice: "Dadabari S.O.",
        category: seq.propertyType,
        subTypeTag: "Residential Household",
        occupancyStatus: seq.status === "Occupied" ? "Occupied" : "Vacant",
        landmark: seq.landmark || "Dadabari Beat Route",
        assignedStaffId: staff.id,
        assignedStaffName: staff.name,
        assignedStaffRole: staff.role,
        lastMileNote: seq.lastMileNote || "Sequential door-to-door delivery route verified.",
        linkedMembers: members,
        chronologicalRemarks: [
          {
            id: `rem-seq-${seq.id}`,
            timestamp: "2026-10-15 10:00 AM",
            authorName: staff.name,
            authorRole: staff.role,
            remarkText: `Doorstep delivery sequence verified at ${plot}, ${col}.`,
            statusTag: "Standard Delivery"
          }
        ],
        verificationStatus: seq.verificationStatus === "Verified" ? "Verified" : "Pending Verification",
        updatedAt: "2026-10-15T12:00:00Z"
      });
    }
  });
  const b2StaffId = "STAFF-50457421";
  const b2StaffName = "Mahendra Kumar Meena";
  const b2StaffRole = "GDS/PMAN";
  const b2Office = "Dadabari S.O.";
  const b2Pincode = "324009";
  const mergedSec6House3And4 = {
    id: "up-prop-kp6-h003-004-dhanraj",
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
    verificationStatus: "Verified",
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    linkedMembers: [
      {
        id: "m-dhanraj-bairwa-sec6",
        name: "Dhanraj Bairwa",
        roleInHousehold: "Head of Household",
        mobile: "9829012345",
        whatsapp: "9829012345",
        age: 45,
        gender: "Male",
        occupation: "Property Owner / Government Service",
        activeSchemes: [
          { schemeName: "PLI", accountNoOrPolicy: "PLI-RJ-SEC6-34", sumAssuredOrBalance: "₹10,00,000 (Santosh)", status: "Active" },
          { schemeName: "IPPB", accountNoOrPolicy: "IPPB-SEC6-0034", sumAssuredOrBalance: "Active Savings", status: "Active" }
        ]
      }
    ],
    chronologicalRemarks: [
      {
        id: "rem-kp6-h003-004-dhanraj",
        timestamp: "2026-10-23 10:00 AM",
        authorName: b2StaffName,
        authorRole: b2StaffRole,
        remarkText: "Sector 6 House Numbers 3 and 4 merged and verified as common shared property owned by Dhanraj Bairwa.",
        statusTag: "Verification Done"
      }
    ]
  };
  const sec6Keys = [
    "keshavpura__sector6__houseno.3",
    "keshavpura__sector6__houseno.4",
    "keshavpura__sector6__houseno.3&4",
    "keshavpura__sector6__houseno.3and4",
    "keshavpura__sector6__houseno.3-4",
    "keshavpura__sector6__3&4",
    "keshavpura__houseno.3",
    "keshavpura__houseno.4",
    "keshavpura__houseno.3&4",
    "keshavpura__4-5",
    "keshavpura__sector6__4-5"
  ];
  sec6Keys.forEach((k) => {
    propertyMap.set(k, mergedSec6House3And4);
  });
  const allMasterCusts = customerService.getCustomers().length > 0 ? customerService.getCustomers() : INITIAL_CUSTOMERS;
  allMasterCusts.forEach((c) => {
    var _a, _b, _c;
    const rawHouse = (c.houseNo || ((_a = c.address) == null ? void 0 : _a.houseNumber) || "").trim();
    if (!rawHouse || rawHouse === "Plot Unit" || rawHouse.toLowerCase() === "n/a") return;
    const col = normalizeColonyName(c.colony || c.area || c.sectorLocality || ((_b = c.address) == null ? void 0 : _b.area) || "Keshavpura");
    const plot = rawHouse;
    const key = `${col.toLowerCase()}__${plot.toLowerCase().replace(/\s+/g, "")}`;
    const beat = normalizeBeatNumber(c.beatNo, col);
    const staff = BEAT_STAFF_MAP[beat] || {
      id: c.assignedStaffId || "STAFF-50457421",
      name: c.assignedStaffName || "Mahendra Kumar Meena",
      role: "GDS/PMAN"
    };
    const isCommercial = (c.occupation || "").toLowerCase().includes("shop") || (c.occupation || "").toLowerCase().includes("stall") || (c.occupation || "").toLowerCase().includes("trader") || (c.name || "").toLowerCase().includes("stall") || (c.name || "").toLowerCase().includes("store") || (c.name || "").toLowerCase().includes("tea") || (c.name || "").toLowerCase().includes("centre");
    const customerMember = {
      id: `m-cust-${c.id || c.masterId}`,
      name: c.name,
      roleInHousehold: c.isHeadOfFamily ? "Head of Household" : isCommercial ? "Commercial Operator" : "Family Member",
      mobile: c.mobile,
      whatsapp: c.alternateMobile || c.mobile,
      age: c.age || 38,
      gender: c.gender || "Male",
      occupation: c.occupation || (isCommercial ? "Merchant / Business" : "Resident"),
      activeSchemes: (c.products || []).map((p) => ({
        schemeName: (p.productCode || p.name || "PLI").substring(0, 4),
        accountNoOrPolicy: p.accountNumber || "POL-DAD-2026",
        sumAssuredOrBalance: p.sumAssured ? `₹${p.sumAssured}` : "Active",
        status: "Active"
      }))
    };
    if (customerMember.activeSchemes.length === 0) {
      customerMember.activeSchemes.push({
        schemeName: "PLI",
        accountNoOrPolicy: "PLI-LEAD-2026",
        sumAssuredOrBalance: "₹5,00,000 (Follow-up)",
        status: "Lead Generated"
      });
    }
    if (isSector6House3Or4(col, c.sector || ((_c = c.address) == null ? void 0 : _c.sector) || "", plot) || c.name.toLowerCase().includes("dhanraj bairwa")) {
      if (!mergedSec6House3And4.linkedMembers.some((m) => m.name.toLowerCase() === c.name.toLowerCase())) {
        mergedSec6House3And4.linkedMembers.push(customerMember);
      }
      return;
    }
    if (propertyMap.has(key)) {
      const existing = propertyMap.get(key);
      if (!existing.linkedMembers.some((m) => m.name.toLowerCase() === c.name.toLowerCase())) {
        existing.linkedMembers.push(customerMember);
      }
      if (c.householdMembers && c.householdMembers.length > 0) {
        c.householdMembers.forEach((hm, hIdx) => {
          if (!existing.linkedMembers.some((m) => m.name.toLowerCase() === hm.name.toLowerCase())) {
            existing.linkedMembers.push({
              id: `m-hm-${c.id}-${hIdx}`,
              name: hm.name,
              roleInHousehold: hm.relationshipWithHead || "Family Member",
              mobile: hm.contact || hm.mobile || c.mobile,
              whatsapp: hm.contact || hm.mobile || c.mobile,
              age: hm.age || 22,
              gender: hm.gender || "Female",
              occupation: "Student / Dependent",
              activeSchemes: [
                { schemeName: "SSY", accountNoOrPolicy: "SSY-DAD-2026", sumAssuredOrBalance: "₹1,50,000/yr", status: "Active" }
              ]
            });
          }
        });
      }
    } else {
      const pCode = c.propertyId || `PROP-${col.substring(0, 3).toUpperCase()}-${plot.replace(/[^a-zA-Z0-9]/g, "").substring(0, 6)}`;
      const members = [customerMember];
      if (c.householdMembers && c.householdMembers.length > 0) {
        c.householdMembers.forEach((hm, hIdx) => {
          members.push({
            id: `m-hm-${c.id}-${hIdx}`,
            name: hm.name,
            roleInHousehold: hm.relationshipWithHead || "Family Member",
            mobile: hm.contact || hm.mobile || c.mobile,
            whatsapp: hm.contact || hm.mobile || c.mobile,
            age: hm.age || 22,
            gender: hm.gender || "Female",
            occupation: "Student / Dependent",
            activeSchemes: []
          });
        });
      }
      const secClean = c.sector ? c.sector.toLowerCase().includes("sector") || c.sector.toLowerCase().includes("block") ? c.sector : `Sector ${c.sector}` : "Sector 1";
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
        pincode: auditedPin || c.pincode || "324009",
        beatNo: beat,
        deliveryOffice: "Dadabari S.O.",
        category: isCommercial ? "Commercial" : c.type || "Residential",
        subTypeTag: isCommercial ? "Commercial • General Store / Retail" : "Residential Household",
        occupancyStatus: c.livingStatus === "Vacant" ? "Vacant" : c.livingStatus === "Tenant" ? "Rented" : "Occupied",
        landmark: c.landmark || "Dadabari S.O. Jurisdiction",
        assignedStaffId: staff.id,
        assignedStaffName: staff.name,
        assignedStaffRole: staff.role,
        lastMileNote: c.remarks || c.notes || "Master database customer record.",
        linkedMembers: members,
        chronologicalRemarks: [
          {
            id: `rem-c-${c.id}`,
            timestamp: "2026-10-14 02:00 PM",
            authorName: staff.name,
            authorRole: staff.role,
            remarkText: c.remarks || "Customer record verified in Master CRM.",
            statusTag: "Verification Done"
          }
        ],
        verificationStatus: c.verificationStatus === "Verified" || c.verificationStatus === "Field Confirmed" ? "Verified" : "Pending Verification",
        updatedAt: "2026-10-15T10:00:00Z"
      });
    }
  });
  DADABARI_324009_VERIFIED_COMMERCIAL_REGISTRY.forEach((store) => {
    const col = normalizeColonyName(store.colony);
    const plot = store.housePlotNumber.trim();
    const key = `${col.toLowerCase()}__${plot.toLowerCase().replace(/\s+/g, "")}`;
    if (!propertyMap.has(key)) {
      propertyMap.set(key, {
        id: `up-comm-${store.id}`,
        propertyCode: `PROP-COMM-${store.id.replace(/\D/g, "").padStart(3, "0")}`,
        housePlotNumber: plot,
        colony: col,
        blockSector: store.complexName || "Commercial Block",
        pincode: "324009",
        beatNo: store.beatNo,
        deliveryOffice: "Dadabari S.O.",
        category: "Commercial",
        subTypeTag: store.categoryTag,
        occupancyStatus: "Occupied",
        landmark: store.landmark,
        assignedStaffId: store.assignedStaffId,
        assignedStaffName: store.assignedStaffName,
        assignedStaffRole: store.assignedStaffRole,
        lastMileNote: `${store.lastMileNote} • ${store.postalPotentialRemark}`,
        linkedMembers: [
          {
            id: `m-comm-${store.id}`,
            name: `${store.ownerName} (${store.storeName})`,
            roleInHousehold: "Commercial Operator",
            mobile: store.primaryMobile,
            whatsapp: store.whatsapp,
            age: 39,
            gender: "Male",
            occupation: store.categoryTag,
            activeSchemes: [
              { schemeName: "IPPB", accountNoOrPolicy: "IPPB-COMM-QR", sumAssuredOrBalance: "Merchant QR + Micro-ATM", status: "Active" },
              { schemeName: "PLI", accountNoOrPolicy: "PLI-PROP-2026", sumAssuredOrBalance: "₹10,00,000 Suraksha", status: "Lead Generated" }
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
            statusTag: "Verification Done"
          }
        ],
        verificationStatus: "Verified",
        updatedAt: "2026-10-16T12:00:00Z"
      });
    }
  });
  CONSOLIDATED_BEAT_MATRIX.forEach((bEntry) => {
    var _a, _b;
    const beatProps = Array.from(propertyMap.values()).filter((p) => p.beatNo === bEntry.beatNumber);
    if (beatProps.length === 0) {
      const col = bEntry.colonies[0] || "Dadabari";
      const key = `${col.toLowerCase()}__beat-${bEntry.beatNumber.toLowerCase().replace(/\s+/g, "")}`;
      propertyMap.set(key, {
        id: `up-matrix-${bEntry.beatNumber.replace(/\s+/g, "")}`,
        propertyCode: `PROP-${bEntry.beatNumber.replace(/\s+/g, "")}-HUB`,
        housePlotNumber: `Main Chowk, ${bEntry.sectors[0] || "Sector 1"}`,
        colony: col,
        blockSector: bEntry.sectors[0] || "Block A",
        pincode: bEntry.pincode,
        beatNo: bEntry.beatNumber,
        deliveryOffice: "Dadabari S.O.",
        category: "Residential",
        subTypeTag: "Residential Household",
        occupancyStatus: "Occupied",
        landmark: bEntry.landmarks[0] || "Main Beat Delivery Point",
        assignedStaffId: bEntry.staffId || ((_a = BEAT_STAFF_MAP[bEntry.beatNumber]) == null ? void 0 : _a.id) || "STAFF-50457421",
        assignedStaffName: bEntry.assignedPostmanName,
        assignedStaffRole: bEntry.staffRole || ((_b = BEAT_STAFF_MAP[bEntry.beatNumber]) == null ? void 0 : _b.role) || "POSTMAN",
        lastMileNote: `Flagship beat junction for ${bEntry.beatNumber} under Dadabari S.O.`,
        linkedMembers: [
          {
            id: `m-bm-${bEntry.beatNumber}`,
            name: `${bEntry.assignedPostmanName} (Designated Beat Lead)`,
            roleInHousehold: "Head of Household",
            mobile: bEntry.assignedPostmanContact,
            whatsapp: bEntry.assignedPostmanContact,
            age: 40,
            gender: "Male",
            occupation: bEntry.staffRole || "POSTMAN",
            activeSchemes: [
              { schemeName: "PLI", accountNoOrPolicy: "PLI-POSTAL-OFFICIAL", sumAssuredOrBalance: "₹10,00,000 (Departmental)", status: "Active" }
            ]
          }
        ],
        chronologicalRemarks: [
          {
            id: `rem-bm-${bEntry.beatNumber}`,
            timestamp: "2026-10-15 09:00 AM",
            authorName: bEntry.assignedPostmanName,
            authorRole: bEntry.staffRole || "POSTMAN",
            remarkText: `Beat route established covering ${bEntry.colonies.join(", ")}.`,
            statusTag: "Verification Done"
          }
        ],
        verificationStatus: "Verified",
        updatedAt: "2026-10-15T09:00:00Z"
      });
    }
  });
  const existingSec6HouseNums = /* @__PURE__ */ new Set();
  const existingSec6KhNums = /* @__PURE__ */ new Set();
  const existingSec7PlotNums = /* @__PURE__ */ new Set();
  const existingSec7UitNums = /* @__PURE__ */ new Set();
  const existingSantoshiNums = /* @__PURE__ */ new Set();
  propertyMap.forEach((p) => {
    const colLow = (p.colony || "").toLowerCase();
    const secLow = (p.blockSector || "").toLowerCase();
    const plotRaw = (p.housePlotNumber || "").trim().toLowerCase();
    if (colLow.includes("keshav")) {
      if (secLow.includes("6")) {
        if (plotRaw.startsWith("kh")) {
          const num = parseInt(plotRaw.replace(/\D/g, ""), 10);
          if (!isNaN(num)) existingSec6KhNums.add(num);
        } else {
          const num = parseInt(plotRaw.replace(/^(house\s*no\.?|h\.?\s*no\.?|house|plot)\s*/i, "").replace(/[^\d].*$/, ""), 10);
          if (!isNaN(num)) existingSec6HouseNums.add(num);
        }
      } else if (secLow.includes("7")) {
        if (plotRaw.startsWith("uit")) {
          const num = parseInt(plotRaw.replace(/\D/g, ""), 10);
          if (!isNaN(num)) existingSec7UitNums.add(num);
        } else {
          const num = parseInt(plotRaw.replace(/^(plot\s*no\.?|plot|house\s*no\.?|p0*)\s*/i, "").replace(/[^\d].*$/, ""), 10);
          if (!isNaN(num)) existingSec7PlotNums.add(num);
        }
      }
    } else if (colLow.includes("santoshi")) {
      const num = parseInt(plotRaw.replace(/^(house\s*no\.?|h\.?\s*no\.?|house|plot)\s*/i, "").replace(/[^\d].*$/, ""), 10);
      if (!isNaN(num)) existingSantoshiNums.add(num);
    }
  });
  for (let i = 1; i <= 417; i++) {
    if (i === 3 || i === 4) continue;
    if (!existingSec6HouseNums.has(i)) {
      const key = `keshavpura__sector6__houseno.${i}`;
      if (!propertyMap.has(key)) {
        propertyMap.set(key, {
          id: `prop-kp6-h-${i}`,
          propertyCode: `PROP-KP6-H${String(i).padStart(3, "0")}`,
          housePlotNumber: `House No. ${i}`,
          houseNo: `${i}`,
          colony: "Keshavpura",
          sector: "Sector 6",
          block: "Sector 6",
          blockSector: "Sector 6",
          pincode: b2Pincode,
          beatNo: "Beat 2",
          deliveryOffice: b2Office,
          category: "Residential",
          subTypeTag: "Residential Household",
          occupancyStatus: "Vacant",
          landmark: "Keshavpura Sector 6, Beat 2 (Dadabari S.O.)",
          assignedStaffId: b2StaffId,
          assignedStaffName: b2StaffName,
          assignedStaffRole: b2StaffRole,
          lastMileNote: `Beat 2 sequential property (House No. ${i}). Preserved as Vacant ready for field verification.`,
          linkedMembers: [],
          chronologicalRemarks: [
            {
              id: `rem-kp6-h-${i}`,
              timestamp: "2026-10-19 09:00 AM",
              authorName: b2StaffName,
              authorRole: b2StaffRole,
              remarkText: `Sequential property House No. ${i} registered as Vacant in Master Hub.`,
              statusTag: "Standard Delivery"
            }
          ],
          verificationStatus: "Pending Verification",
          updatedAt: "2026-10-19T09:00:00Z"
        });
      }
    }
  }
  for (let i = 1; i <= 252; i++) {
    if (!existingSec6KhNums.has(i)) {
      const key = `keshavpura__sector6__kh-${i}`;
      if (!propertyMap.has(key)) {
        propertyMap.set(key, {
          id: `prop-kp6-kh-${i}`,
          propertyCode: `PROP-KP6-KH${String(i).padStart(3, "0")}`,
          housePlotNumber: `KH-${i}`,
          colony: "Keshavpura",
          blockSector: "Sector 6",
          pincode: b2Pincode,
          beatNo: "Beat 2",
          deliveryOffice: b2Office,
          category: "Residential",
          subTypeTag: "Residential Household",
          occupancyStatus: "Vacant",
          landmark: "Keshavpura Sector 6 (KH Series), Beat 2",
          assignedStaffId: b2StaffId,
          assignedStaffName: b2StaffName,
          assignedStaffRole: b2StaffRole,
          lastMileNote: `Beat 2 sequential KH Series (KH-${i}). Preserved as Vacant ready for field verification.`,
          linkedMembers: [],
          chronologicalRemarks: [
            {
              id: `rem-kp6-kh-${i}`,
              timestamp: "2026-10-19 09:00 AM",
              authorName: b2StaffName,
              authorRole: b2StaffRole,
              remarkText: `Sequential KH-${i} unit registered as Vacant in Master Hub.`,
              statusTag: "Standard Delivery"
            }
          ],
          verificationStatus: "Pending Verification",
          updatedAt: "2026-10-19T09:00:00Z"
        });
      }
    }
  }
  for (let i = 1; i <= 1010; i++) {
    if (!existingSec7PlotNums.has(i)) {
      const key = `keshavpura__sector7__plot-${i}`;
      if (!propertyMap.has(key)) {
        propertyMap.set(key, {
          id: `prop-kp7-plot-${i}`,
          propertyCode: `PROP-KP7-P${String(i).padStart(4, "0")}`,
          housePlotNumber: `Plot-${i}`,
          colony: "Keshavpura",
          blockSector: "Sector 7",
          pincode: b2Pincode,
          beatNo: "Beat 2",
          deliveryOffice: b2Office,
          category: "Residential",
          subTypeTag: "Residential Household",
          occupancyStatus: "Vacant",
          landmark: "Keshavpura Sector 7, Beat 2 (Dadabari S.O.)",
          assignedStaffId: b2StaffId,
          assignedStaffName: b2StaffName,
          assignedStaffRole: b2StaffRole,
          lastMileNote: `Beat 2 sequential property (Plot-${i}). Preserved as Vacant ready for field verification.`,
          linkedMembers: [],
          chronologicalRemarks: [
            {
              id: `rem-kp7-plot-${i}`,
              timestamp: "2026-10-19 09:00 AM",
              authorName: b2StaffName,
              authorRole: b2StaffRole,
              remarkText: `Sequential Plot-${i} unit registered as Vacant in Master Hub.`,
              statusTag: "Standard Delivery"
            }
          ],
          verificationStatus: "Pending Verification",
          updatedAt: "2026-10-19T09:00:00Z"
        });
      }
    }
  }
  for (let i = 1; i <= 250; i++) {
    if (!existingSec7UitNums.has(i)) {
      const key = `keshavpura__sector7__uit-${i}`;
      if (!propertyMap.has(key)) {
        propertyMap.set(key, {
          id: `prop-kp7-uit-${i}`,
          propertyCode: `PROP-KP7-UIT${String(i).padStart(3, "0")}`,
          housePlotNumber: `UIT-${i}`,
          colony: "Keshavpura",
          blockSector: "Sector 7",
          pincode: b2Pincode,
          beatNo: "Beat 2",
          deliveryOffice: b2Office,
          category: "Residential",
          subTypeTag: "Residential Household",
          occupancyStatus: "Vacant",
          landmark: "Keshavpura Sector 7 (UIT Scheme), Beat 2",
          assignedStaffId: b2StaffId,
          assignedStaffName: b2StaffName,
          assignedStaffRole: b2StaffRole,
          lastMileNote: `Beat 2 sequential property (UIT-${i}). Preserved as Vacant ready for field verification.`,
          linkedMembers: [],
          chronologicalRemarks: [
            {
              id: `rem-kp7-uit-${i}`,
              timestamp: "2026-10-19 09:00 AM",
              authorName: b2StaffName,
              authorRole: b2StaffRole,
              remarkText: `Sequential UIT-${i} unit registered as Vacant in Master Hub.`,
              statusTag: "Standard Delivery"
            }
          ],
          verificationStatus: "Pending Verification",
          updatedAt: "2026-10-19T09:00:00Z"
        });
      }
    }
  }
  for (let i = 1; i <= 800; i++) {
    if (!existingSantoshiNums.has(i)) {
      const key = `santoshinagar__houseno.${i}`;
      if (!propertyMap.has(key)) {
        propertyMap.set(key, {
          id: `prop-snt-h-${i}`,
          propertyCode: `PROP-SNT-H${String(i).padStart(3, "0")}`,
          housePlotNumber: `House No. ${i}`,
          colony: "Santoshi Nagar",
          blockSector: "Santoshi Nagar",
          pincode: b2Pincode,
          beatNo: "Beat 2",
          deliveryOffice: b2Office,
          category: "Residential",
          subTypeTag: "Residential Household",
          occupancyStatus: "Vacant",
          landmark: "Santoshi Nagar, Beat 2 (Dadabari S.O. 324009)",
          assignedStaffId: b2StaffId,
          assignedStaffName: b2StaffName,
          assignedStaffRole: b2StaffRole,
          lastMileNote: `Beat 2 sequential property (House No. ${i}). Preserved as Vacant ready for field verification.`,
          linkedMembers: [],
          chronologicalRemarks: [
            {
              id: `rem-snt-h-${i}`,
              timestamp: "2026-10-19 09:00 AM",
              authorName: b2StaffName,
              authorRole: b2StaffRole,
              remarkText: `Sequential House No. ${i} unit registered as Vacant in Master Hub.`,
              statusTag: "Standard Delivery"
            }
          ],
          verificationStatus: "Pending Verification",
          updatedAt: "2026-10-19T09:00:00Z"
        });
      }
    }
  }
  return Array.from(propertyMap.values()).sort((a, b) => {
    const colCompare = (a.colony || "").trim().localeCompare((b.colony || "").trim(), void 0, { numeric: true, sensitivity: "base" });
    if (colCompare !== 0) return colCompare;
    const secCompare = (a.blockSector || "").trim().localeCompare((b.blockSector || "").trim(), void 0, { numeric: true, sensitivity: "base" });
    if (secCompare !== 0) return secCompare;
    return (a.housePlotNumber || "").trim().localeCompare((b.housePlotNumber || "").trim(), void 0, { numeric: true, sensitivity: "base" });
  });
}
function UnifiedPropertyFamilyHub() {
  var _a;
  const navigate = useNavigate();
  const [properties, setProperties] = reactExports.useState(() => {
    try {
      const stored = localStorage.getItem("unified_property_family_hub_records_v4");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 2500) return parsed;
      }
    } catch {
    }
    const consolidated = buildMasterConsolidatedProperties();
    try {
      localStorage.setItem("unified_property_family_hub_records_v4", JSON.stringify(consolidated));
    } catch {
    }
    return consolidated;
  });
  const [viewMode, setViewMode] = reactExports.useState("CARD");
  const [selectedColony, setSelectedColony] = reactExports.useState("All");
  const [selectedSubSector, setSelectedSubSector] = reactExports.useState("All");
  const [selectedBeat, setSelectedBeat] = reactExports.useState("All");
  const [selectedCategory, setSelectedCategory] = reactExports.useState("All");
  const [selectedStatus, setSelectedStatus] = reactExports.useState("All");
  const [selectedClassification, setSelectedClassification] = reactExports.useState("All");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [customerNameSearch, setCustomerNameSearch] = reactExports.useState("");
  const [mobileSearch, setMobileSearch] = reactExports.useState("");
  const [houseNoSearch, setHouseNoSearch] = reactExports.useState("");
  const [landmarkSearch, setLandmarkSearch] = reactExports.useState("");
  const [activeProperty, setActiveProperty] = reactExports.useState(null);
  const [showAddRemarkModal, setShowAddRemarkModal] = reactExports.useState(false);
  const [newRemarkText, setNewRemarkText] = reactExports.useState("");
  const [newRemarkTag, setNewRemarkTag] = reactExports.useState("Standard Delivery");
  const [showAddMemberModal, setShowAddMemberModal] = reactExports.useState(false);
  const [newMemberName, setNewMemberName] = reactExports.useState("");
  const [newMemberRole, setNewMemberRole] = reactExports.useState("Son");
  const [newMemberMobile, setNewMemberMobile] = reactExports.useState("");
  const [newMemberAge, setNewMemberAge] = reactExports.useState("25");
  const [newMemberGender, setNewMemberGender] = reactExports.useState("Male");
  const [newMemberOccupation, setNewMemberOccupation] = reactExports.useState("");
  const [newMemberScheme, setNewMemberScheme] = reactExports.useState("None");
  const [showAddPropertyModal, setShowAddPropertyModal] = reactExports.useState(false);
  const [newPropHouseNo, setNewPropHouseNo] = reactExports.useState("");
  const [newPropColony, setNewPropColony] = reactExports.useState("Keshavpura");
  const [newPropBlock, setNewPropBlock] = reactExports.useState("Sector 6");
  const [isCustomBlock, setIsCustomBlock] = reactExports.useState(false);
  const [customBlockText, setCustomBlockText] = reactExports.useState("");
  const [newPropBeat, setNewPropBeat] = reactExports.useState("Beat 2");
  const [newPropCategory, setNewPropCategory] = reactExports.useState("Residential");
  const [newPropLandmark, setNewPropLandmark] = reactExports.useState("");
  const [newPropHeadName, setNewPropHeadName] = reactExports.useState("");
  const [newPropMobile, setNewPropMobile] = reactExports.useState("");
  const [statusModalProperty, setStatusModalProperty] = reactExports.useState(null);
  const [statusOccupancy, setStatusOccupancy] = reactExports.useState("Occupied");
  const [statusVerification, setStatusVerification] = reactExports.useState("Verified");
  const [statusRemarkTag, setStatusRemarkTag] = reactExports.useState("Standard Delivery");
  const [statusRemarkText, setStatusRemarkText] = reactExports.useState("");
  const handleOpenStatusModal = (p) => {
    setStatusModalProperty(p);
    setStatusOccupancy(p.occupancyStatus);
    setStatusVerification(p.verificationStatus);
    setStatusRemarkTag("Verification Done");
    setStatusRemarkText(p.lastMileNote || "Doorstep delivery and address verification completed on ground.");
  };
  const handleSaveStatusModal = () => {
    if (!statusModalProperty) return;
    const nowStr = (/* @__PURE__ */ new Date()).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    const newRemark = {
      id: `rem-stat-${Date.now()}`,
      timestamp: nowStr,
      authorName: statusModalProperty.assignedStaffName || "Mahendra Kumar Meena",
      authorRole: statusModalProperty.assignedStaffRole || "GDS/PMAN",
      remarkText: statusRemarkText || `Status updated to ${statusOccupancy} (${statusVerification})`,
      statusTag: statusRemarkTag
    };
    const updated = properties.map((item) => {
      if (item.id === statusModalProperty.id) {
        return {
          ...item,
          occupancyStatus: statusOccupancy,
          verificationStatus: statusVerification,
          lastMileNote: statusRemarkText || item.lastMileNote,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          chronologicalRemarks: [newRemark, ...item.chronologicalRemarks]
        };
      }
      return item;
    });
    setProperties(updated);
    if ((activeProperty == null ? void 0 : activeProperty.id) === statusModalProperty.id) {
      setActiveProperty({
        ...activeProperty,
        occupancyStatus: statusOccupancy,
        verificationStatus: statusVerification,
        lastMileNote: statusRemarkText || activeProperty.lastMileNote,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        chronologicalRemarks: [newRemark, ...activeProperty.chronologicalRemarks]
      });
    }
    showNotification(`⚡ [Status & Remarks Updated] for ${statusModalProperty.housePlotNumber}, ${statusModalProperty.colony}! (${statusOccupancy} • ${statusVerification})`);
    setStatusModalProperty(null);
  };
  const [toastMessage, setToastMessage] = reactExports.useState(null);
  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };
  reactExports.useEffect(() => {
    try {
      localStorage.setItem("unified_property_family_hub_records_v4", JSON.stringify(properties));
    } catch {
    }
  }, [properties]);
  const handleForceConsolidateAll = () => {
    const freshlyConsolidated = buildMasterConsolidatedProperties();
    setProperties(freshlyConsolidated);
    try {
      localStorage.setItem("unified_property_family_hub_records_v4", JSON.stringify(freshlyConsolidated));
    } catch {
    }
    showNotification(`⚡ Consolidated ${freshlyConsolidated.length} Properties & Family Records across all Beats 1–33!`);
  };
  const uniqueColonies = reactExports.useMemo(() => {
    const recordColonies = properties.map((p) => p.colony).filter(Boolean);
    return ["All", ...getHierarchyColoniesList(recordColonies)];
  }, [properties]);
  const uniqueBeats = reactExports.useMemo(() => {
    return ["All", ...Array.from({ length: 33 }, (_, i) => `Beat ${i + 1}`)];
  }, []);
  const availableRegistrationSectors = reactExports.useMemo(() => {
    const recordSectors = properties.filter((p) => p.colony === newPropColony).map((p) => p.blockSector).filter(Boolean);
    return getHierarchySectorsForColony(newPropColony, recordSectors);
  }, [newPropColony, properties]);
  const colonySubSectorChips = reactExports.useMemo(() => {
    if (selectedColony === "All") return [];
    const colonyProps = properties.filter((p) => p.colony === selectedColony);
    const recordSectors = colonyProps.map((p) => p.blockSector).filter(Boolean);
    const sectorNames = getHierarchySectorsForColony(selectedColony, recordSectors);
    const chips = [
      { id: "All", label: `All ${selectedColony}`, count: colonyProps.length }
    ];
    sectorNames.forEach((subName) => {
      const matchingCount = colonyProps.filter((p) => matchPropertyToSubSector(p, subName)).length;
      if (matchingCount > 0) {
        chips.push({
          id: subName,
          label: subName,
          count: matchingCount
        });
      }
    });
    return chips;
  }, [selectedColony, properties]);
  const handleColonyFilterChange = (colony) => {
    setSelectedColony(colony);
    setSelectedSubSector("All");
  };
  const handleNewPropColonyChange = (colony) => {
    setNewPropColony(colony);
    const resolved = resolveColonySectorDetails(colony);
    setNewPropBlock(resolved.sector);
    setNewPropBeat(resolved.beatNo);
    setIsCustomBlock(false);
    setCustomBlockText("");
  };
  const handleOpenAddPropertyModal = () => {
    if (selectedColony !== "All") {
      setNewPropColony(selectedColony);
      const sectors = getHierarchySectorsForColony(selectedColony);
      if (selectedSubSector !== "All") {
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
      const resolved = resolveColonySectorDetails(selectedColony, selectedSubSector !== "All" ? selectedSubSector : void 0);
      setNewPropBeat(resolved.beatNo);
    }
    setShowAddPropertyModal(true);
  };
  const filteredProperties = reactExports.useMemo(() => {
    return properties.filter((p) => {
      const matchColony = selectedColony === "All" || p.colony === selectedColony;
      const matchSubSector = selectedColony === "All" || selectedSubSector === "All" || matchPropertyToSubSector(p, selectedSubSector);
      const matchBeat = selectedBeat === "All" || p.beatNo === selectedBeat;
      const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchStatus = selectedStatus === "All" || p.occupancyStatus === selectedStatus;
      let matchClassification = true;
      if (selectedClassification === "Commercial Only") {
        matchClassification = p.category === "Commercial";
      } else if (selectedClassification === "eMitra / CSC Kiosks") {
        matchClassification = p.subTypeTag === "Commercial • eMitra / CSC" || p.landmark.toLowerCase().includes("emitra") || p.landmark.toLowerCase().includes("csc");
      } else if (selectedClassification === "General Retail / Stores") {
        matchClassification = p.subTypeTag === "Commercial • General Store / Retail" || p.category === "Commercial";
      } else if (selectedClassification === "Residential Households") {
        matchClassification = p.category === "Residential";
      }
      const q = searchQuery.toLowerCase().trim();
      const matchGeneral = !q || p.housePlotNumber.toLowerCase().includes(q) || p.colony.toLowerCase().includes(q) || p.blockSector.toLowerCase().includes(q) || p.landmark.toLowerCase().includes(q) || p.beatNo.toLowerCase().includes(q) || p.assignedStaffName.toLowerCase().includes(q) || p.linkedMembers.some(
        (m) => m.name.toLowerCase().includes(q) || m.mobile.includes(q) || m.activeSchemes.some((s) => s.schemeName.toLowerCase().includes(q))
      );
      const nameQ = customerNameSearch.toLowerCase().trim();
      const matchName = !nameQ || p.linkedMembers.some((m) => m.name.toLowerCase().includes(nameQ));
      const cleanMobile = mobileSearch.replace(/\D/g, "");
      const matchMobile = !cleanMobile || p.linkedMembers.some(
        (m) => m.mobile.replace(/\D/g, "").includes(cleanMobile) || m.whatsapp && m.whatsapp.replace(/\D/g, "").includes(cleanMobile)
      );
      const houseQ = houseNoSearch.toLowerCase().replace(/\s+/g, "");
      const matchHouse = !houseQ || p.housePlotNumber.toLowerCase().replace(/\s+/g, "").includes(houseQ);
      const landmarkQ = landmarkSearch.toLowerCase().trim();
      const matchLandmark = !landmarkQ || p.landmark.toLowerCase().includes(landmarkQ);
      return matchColony && matchSubSector && matchBeat && matchCategory && matchStatus && matchClassification && matchGeneral && matchName && matchMobile && matchHouse && matchLandmark;
    }).sort((a, b) => {
      const colCompare = (a.colony || "").trim().localeCompare((b.colony || "").trim(), void 0, {
        numeric: true,
        sensitivity: "base"
      });
      if (colCompare !== 0) return colCompare;
      const secCompare = (a.blockSector || "").trim().localeCompare((b.blockSector || "").trim(), void 0, {
        numeric: true,
        sensitivity: "base"
      });
      if (secCompare !== 0) return secCompare;
      return (a.housePlotNumber || "").trim().localeCompare((b.housePlotNumber || "").trim(), void 0, {
        numeric: true,
        sensitivity: "base"
      });
    });
  }, [
    properties,
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
    landmarkSearch
  ]);
  const activeFiltersCount = reactExports.useMemo(() => {
    let count = 0;
    if (selectedColony !== "All") count++;
    if (selectedSubSector !== "All") count++;
    if (selectedBeat !== "All") count++;
    if (selectedCategory !== "All") count++;
    if (selectedStatus !== "All") count++;
    if (selectedClassification !== "All") count++;
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
    landmarkSearch
  ]);
  const handleResetFilters = () => {
    setSelectedColony("All");
    setSelectedSubSector("All");
    setSelectedBeat("All");
    setSelectedCategory("All");
    setSelectedStatus("All");
    setSelectedClassification("All");
    setSearchQuery("");
    setCustomerNameSearch("");
    setMobileSearch("");
    setHouseNoSearch("");
    setLandmarkSearch("");
  };
  const handleExportUnifiedExcel = () => {
    const rows = [];
    filteredProperties.forEach((p) => {
      if (p.linkedMembers.length === 0) {
        rows.push({
          "Property Code": p.propertyCode,
          "House / Plot No": p.housePlotNumber,
          "Colony": p.colony,
          "Block / Sector": p.blockSector,
          "Pincode": p.pincode,
          "Beat Number": p.beatNo,
          "Category": p.category,
          "Classification Tag": p.subTypeTag || "Standard",
          "Status": p.occupancyStatus,
          "Landmark": p.landmark,
          "Assigned Staff": `${p.assignedStaffName} (${p.assignedStaffRole})`,
          "Member Name": "Vacant / Unregistered",
          "Role in Household": "N/A",
          "Mobile": "N/A",
          "Active Schemes": "None",
          "Last Mile Note": p.lastMileNote
        });
      } else {
        p.linkedMembers.forEach((m) => {
          rows.push({
            "Property Code": p.propertyCode,
            "House / Plot No": p.housePlotNumber,
            "Colony": p.colony,
            "Block / Sector": p.blockSector,
            "Pincode": p.pincode,
            "Beat Number": p.beatNo,
            "Category": p.category,
            "Classification Tag": p.subTypeTag || "Standard",
            "Status": p.occupancyStatus,
            "Landmark": p.landmark,
            "Assigned Staff": `${p.assignedStaffName} (${p.assignedStaffRole})`,
            "Member Name": m.name,
            "Role in Household": m.roleInHousehold,
            "Mobile": m.mobile,
            "Active Schemes": m.activeSchemes.map((s) => `${s.schemeName}: ${s.sumAssuredOrBalance}`).join("; ") || "None",
            "Last Mile Note": p.lastMileNote
          });
        });
      }
    });
    const worksheet = utils.json_to_sheet(rows);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Property_Family_Master");
    writeFileSync(
      workbook,
      `Dadabari_Unified_Property_Family_Master_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`
    );
    showNotification("Exported complete Master Sheet (.xlsx) successfully!");
  };
  const handleAddRemark = (e) => {
    e.preventDefault();
    if (!activeProperty || !newRemarkText.trim()) return;
    const newRemark = {
      id: `rem-${Date.now()}`,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      }),
      authorName: activeProperty.assignedStaffName || "Mahendra Kumar Meena",
      authorRole: activeProperty.assignedStaffRole || "GDS/PMAN",
      remarkText: newRemarkText.trim(),
      statusTag: newRemarkTag
    };
    const updatedProp = {
      ...activeProperty,
      chronologicalRemarks: [newRemark, ...activeProperty.chronologicalRemarks],
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    setProperties(properties.map((p) => p.id === activeProperty.id ? updatedProp : p));
    setActiveProperty(updatedProp);
    setNewRemarkText("");
    setShowAddRemarkModal(false);
    showNotification("✅ Added delivery remark & audit record!");
  };
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!activeProperty || !newMemberName.trim()) return;
    const schemesList = [];
    if (newMemberScheme !== "None") {
      schemesList.push({
        schemeName: newMemberScheme,
        accountNoOrPolicy: "NEW-INQUIRY",
        sumAssuredOrBalance: "Lead Initiated in Master Hub",
        status: "Lead Generated"
      });
    }
    const newMember = {
      id: `m-${Date.now()}`,
      name: newMemberName.trim(),
      roleInHousehold: newMemberRole,
      mobile: newMemberMobile.trim() || "9828000000",
      whatsapp: newMemberMobile.trim() || "9828000000",
      age: parseInt(newMemberAge) || 28,
      gender: newMemberGender,
      occupation: newMemberOccupation.trim() || "Resident",
      activeSchemes: schemesList
    };
    const updatedProp = {
      ...activeProperty,
      linkedMembers: [...activeProperty.linkedMembers, newMember],
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    setProperties(properties.map((p) => p.id === activeProperty.id ? updatedProp : p));
    setActiveProperty(updatedProp);
    setNewMemberName("");
    setNewMemberMobile("");
    setNewMemberOccupation("");
    setNewMemberScheme("None");
    setShowAddMemberModal(false);
    showNotification(`✅ Successfully linked ${newMember.name} to property!`);
  };
  const handleRegisterNewProperty = (e) => {
    e.preventDefault();
    if (!newPropHouseNo.trim() || !newPropHeadName.trim()) return;
    const staffInfo = BEAT_STAFF_MAP[newPropBeat] || {
      name: "Mahendra Kumar Meena",
      role: "GDS/PMAN",
      id: "STAFF-50457421"
    };
    const effectiveBlock = isCustomBlock ? customBlockText.trim() || "Sector 1" : newPropBlock;
    const cleanCol = normalizeColonyName(newPropColony);
    const auditedPin = getAuditedPincodeForColony(cleanCol, effectiveBlock);
    const newProp = {
      id: `up-${Date.now()}`,
      propertyCode: `PROP-${cleanCol.substring(0, 3).toUpperCase()}-${newPropHouseNo.replace(/[^a-zA-Z0-9]/g, "").substring(0, 6)}`,
      housePlotNumber: newPropHouseNo.trim(),
      houseNo: newPropHouseNo.trim(),
      colony: cleanCol,
      sector: effectiveBlock,
      block: effectiveBlock,
      blockSector: effectiveBlock,
      pincode: auditedPin || "324009",
      beatNo: newPropBeat,
      deliveryOffice: "Dadabari S.O.",
      category: newPropCategory,
      subTypeTag: newPropCategory === "Commercial" ? "Commercial • General Store / Retail" : "Residential Household",
      occupancyStatus: "Occupied",
      landmark: newPropLandmark.trim() || `${effectiveBlock}, ${cleanCol} (Beat Route)`,
      assignedStaffId: staffInfo.id,
      assignedStaffName: staffInfo.name,
      assignedStaffRole: staffInfo.role,
      lastMileNote: `Registered via Master Hub. Mapped Colony: ${cleanCol}, Sector/Block: ${effectiveBlock}. Field door-to-door verification scheduled.`,
      verificationStatus: "Verified",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      linkedMembers: [
        {
          id: `m-${Date.now()}`,
          name: newPropHeadName.trim(),
          roleInHousehold: "Head of Household",
          mobile: newPropMobile.trim() || "9829000000",
          whatsapp: newPropMobile.trim() || "9829000000",
          activeSchemes: []
        }
      ],
      chronologicalRemarks: [
        {
          id: `rem-${Date.now()}`,
          timestamp: (/* @__PURE__ */ new Date()).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
          }),
          authorName: staffInfo.name,
          authorRole: staffInfo.role,
          remarkText: `Property registered in Master Hub. Mapped to ${newPropColony} → ${effectiveBlock} under ${newPropBeat}.`,
          statusTag: "Verification Done"
        }
      ]
    };
    const updatedProps = [newProp, ...properties];
    setProperties(updatedProps);
    try {
      localStorage.setItem("unified_property_family_hub_records_v4", JSON.stringify(updatedProps));
    } catch {
    }
    setShowAddPropertyModal(false);
    setNewPropHouseNo("");
    setNewPropHeadName("");
    setNewPropMobile("");
    setNewPropLandmark("");
    setIsCustomBlock(false);
    setCustomBlockText("");
    showNotification(`✅ Successfully registered property '${newProp.housePlotNumber}' in ${newProp.colony} (${effectiveBlock})!`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen font-sans", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-blue-800/40 relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold tracking-wider uppercase border border-blue-400/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 14, className: "text-cyan-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "POSTMAN BOOK CRM · DADABARI S.O. 324009" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl sm:text-3xl font-black text-white tracking-tight", children: "Unified Property & Family Master Hub" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-blue-200 text-xs sm:text-sm max-w-2xl leading-relaxed", children: [
            "Consolidated, relational architecture merging ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Physical Property Addresses" }),
            " and ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: "Household Family Trees" }),
            " into a single master index with multi-customer linking and scheme intelligence."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleOpenAddPropertyModal,
              className: "px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Register Property" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleExportUnifiedExcel,
              className: "px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-2 shadow-xs cursor-pointer",
              title: "Download Master Property & Family Sheet (.xlsx)",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { size: 15, className: "text-emerald-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Export (.xlsx)" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleForceConsolidateAll,
              className: "px-3.5 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-400/30 transition flex items-center gap-1.5 shadow-xs cursor-pointer",
              title: "Re-synchronize all legacy Household & Property Master records into Unified Hub",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Consolidate All" })
              ]
            }
          )
        ] })
      ] })
    ] }),
    toastMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3 text-emerald-900 text-xs sm:text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-emerald-600 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: toastMessage })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setToastMessage(null),
          className: "text-xs text-emerald-800 font-bold hover:underline cursor-pointer",
          children: "Dismiss"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 22 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold text-slate-500 uppercase tracking-wider", children: "Properties Mapped" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-slate-900", children: properties.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-blue-600 font-semibold mt-0.5", children: "Physical Doorsteps" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 22 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold text-slate-500 uppercase tracking-wider", children: "Linked Residents" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-slate-900", children: properties.reduce((acc, p) => acc + p.linkedMembers.length, 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-emerald-600 font-semibold mt-0.5", children: "Family Tree Members" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BadgePercent, { size: 22 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold text-slate-500 uppercase tracking-wider", children: "Active Postal Leads" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-amber-700", children: properties.reduce(
            (acc, p) => acc + p.linkedMembers.reduce((mAcc, m) => mAcc + m.activeSchemes.length, 0),
            0
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-amber-600 font-semibold mt-0.5", children: "PLI, SSY, IPPB Accounts" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 22 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-bold text-slate-500 uppercase tracking-wider", children: "Dadabari Coverage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black text-purple-900", children: "Beat 1 - 33" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-purple-600 font-semibold mt-0.5", children: "100% Staff Assigned" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "w-5 h-5 text-indigo-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-extrabold text-sm text-slate-900", children: "Area & Beat Filtering with Multi-Parameter Search" }),
          activeFiltersCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black", children: [
            activeFiltersCount,
            " Active"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setViewMode("CARD"),
                className: `px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${viewMode === "CARD" ? "bg-blue-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Grid3x3, { size: 13 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Card View" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setViewMode("TABLE"),
                className: `px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${viewMode === "TABLE" ? "bg-blue-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { size: 13 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Follow-Up Table" })
                ]
              }
            )
          ] }),
          activeFiltersCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: handleResetFilters,
              className: "text-xs text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 rounded-lg hover:bg-indigo-50 transition cursor-pointer",
              children: "Reset"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 12, className: "text-indigo-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Colony Area:" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: selectedColony,
              onChange: (e) => handleColonyFilterChange(e.target.value),
              className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800",
              children: uniqueColonies.map((col) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: col, children: col === "All" ? "All Colonies" : col }, col))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 12, className: "text-amber-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Postal Beat (1-33):" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: selectedBeat,
              onChange: (e) => setSelectedBeat(e.target.value),
              className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800",
              children: uniqueBeats.map((b) => {
                const staff = BEAT_STAFF_MAP[b];
                return /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b, children: b === "All" ? "All Beats (Beat 1 to 33)" : `${b} ${staff ? `· ${staff.name}` : ""}` }, b);
              })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: 12, className: "text-purple-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Classification / Type:" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: selectedClassification,
              onChange: (e) => setSelectedClassification(e.target.value),
              className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "All", children: "All Classifications" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Commercial Only", children: "Commercial Only" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "eMitra / CSC Kiosks", children: "eMitra & CSC Kiosks" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "General Retail / Stores", children: "General Retail / Stores" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Residential Households", children: "Residential Households" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building, { size: 12, className: "text-blue-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Property Category:" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: selectedCategory,
              onChange: (e) => setSelectedCategory(e.target.value),
              className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "All", children: "All Categories" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Residential", children: "Residential" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Commercial", children: "Commercial" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Mixed", children: "Mixed (Shop + Residence)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Plot", children: "Plot" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Under Construction", children: "Under Construction" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Damaged", children: "Damaged" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 12, className: "text-emerald-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Occupancy Status:" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: selectedStatus,
              onChange: (e) => setSelectedStatus(e.target.value),
              className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "All", children: "All Statuses" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Occupied", children: "Occupied" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Vacant", children: "Vacant" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Rented", children: "Rented" })
              ]
            }
          )
        ] })
      ] }),
      selectedColony !== "All" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-indigo-50/90 via-blue-50/70 to-slate-50 border border-indigo-200/90 rounded-2xl p-3.5 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200 shadow-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "p-1.5 rounded-xl bg-indigo-600 text-white shadow-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 13 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-black text-indigo-950 uppercase tracking-wider", children: [
              "Sub-Sector / Block Quick-Filters (",
              selectedColony,
              "):"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full border border-indigo-200/50", children: [
              ((_a = colonySubSectorChips.find((c) => c.id === selectedSubSector)) == null ? void 0 : _a.count) ?? filteredProperties.length,
              " Properties"
            ] })
          ] }),
          selectedSubSector !== "All" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setSelectedSubSector("All"),
              className: "text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-indigo-100 transition cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 12 }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Show All ",
                  selectedColony
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-2 pt-0.5", children: colonySubSectorChips.map((chip) => {
          const isActive = selectedSubSector === chip.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setSelectedSubSector(chip.id),
              className: `px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs ${isActive ? "bg-indigo-600 text-white shadow-indigo-500/25 ring-2 ring-indigo-400 font-extrabold" : "bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200/90 hover:border-indigo-300"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: chip.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`,
                    children: chip.count.toLocaleString()
                  }
                )
              ]
            },
            chip.id
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 13, className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "Search Customer / Member...",
              value: customerNameSearch,
              onChange: (e) => setCustomerNameSearch(e.target.value),
              className: "w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 13, className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "10-digit Mobile / WhatsApp...",
              value: mobileSearch,
              onChange: (e) => setMobileSearch(e.target.value),
              className: "w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(House, { size: 13, className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "House / Plot Number...",
              value: houseNoSearch,
              onChange: (e) => setHouseNoSearch(e.target.value),
              className: "w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 13, className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "Landmark (Mandir, Park)...",
              value: landmarkSearch,
              onChange: (e) => setLandmarkSearch(e.target.value),
              className: "w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 border-t border-slate-100 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Showing ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: filteredProperties.length }),
          " of ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("b", { children: properties.length }),
          " Consolidated Properties"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-500 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 12, className: "text-amber-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Master Index Active: 100% Property Master + Household Trees Consolidated" })
        ] })
      ] })
    ] }),
    viewMode === "CARD" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5", children: filteredProperties.map((prop) => {
      var _a2, _b;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-white rounded-3xl border border-slate-200/90 hover:border-indigo-400 shadow-xs hover:shadow-lg transition p-5 flex flex-col justify-between space-y-4 group relative overflow-hidden",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded", children: prop.propertyCode }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-black text-slate-900 group-hover:text-indigo-600 transition", children: prop.housePlotNumber })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 12, className: "text-indigo-600" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      prop.colony,
                      " · ",
                      prop.blockSector
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 flex-wrap justify-end", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${prop.category === "Commercial" ? "bg-amber-100 text-amber-800" : prop.category === "Mixed" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`,
                      children: prop.category
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `px-2 py-0.5 rounded-full text-[10px] font-bold ${prop.occupancyStatus === "Occupied" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`,
                      children: prop.occupancyStatus
                    }
                  )
                ] })
              ] }),
              prop.subTypeTag && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[9px] font-black uppercase tracking-tight", children: prop.subTypeTag }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-500 italic pl-1", children: [
                "📍 ",
                prop.landmark
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 pt-3 border-t border-slate-100 space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[11px]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-slate-700 flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 12, className: "text-indigo-600" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      "Linked Family (",
                      prop.linkedMembers.length,
                      ")"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-indigo-600 font-semibold font-mono", children: [
                    prop.beatNo,
                    " (324009)"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: prop.linkedMembers.map((member) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between gap-2",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-slate-900 flex items-center gap-1.5", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: member.name }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-200 text-slate-700", children: member.roleInHousehold })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-mono text-slate-500 mt-0.5", children: [
                          "📱 ",
                          member.mobile
                        ] })
                      ] }),
                      member.activeSchemes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 flex-wrap justify-end", children: member.activeSchemes.map((s, sIdx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: "px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]",
                          title: `${s.schemeName}: ${s.sumAssuredOrBalance || "Active"}`,
                          children: s.schemeName
                        },
                        sIdx
                      )) })
                    ]
                  },
                  member.id
                )) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-indigo-950", children: [
                    "Postman: ",
                    prop.assignedStaffName
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-purple-700 bg-white px-1.5 py-0.2 rounded border border-purple-200", children: prop.assignedStaffId })
                ] }),
                prop.lastMileNote && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-600 line-clamp-2 italic", children: [
                  "Note: ",
                  prop.lastMileNote
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                ((_a2 = prop.linkedMembers[0]) == null ? void 0 : _a2.mobile) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "a",
                  {
                    href: `tel:${prop.linkedMembers[0].mobile}`,
                    className: "p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200",
                    title: `Call ${prop.linkedMembers[0].name}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 13 })
                  }
                ),
                ((_b = prop.linkedMembers[0]) == null ? void 0 : _b.whatsapp) && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "a",
                  {
                    href: `https://wa.me/91${prop.linkedMembers[0].whatsapp.replace(/\D/g, "")}`,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "p-1.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition border border-green-200",
                    title: "WhatsApp Chat",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { size: 13 })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "a",
                  {
                    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${prop.housePlotNumber}, ${prop.landmark || ""}, ${prop.colony}, Kota Rajasthan ${prop.pincode}`
                    )}`,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "px-2 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition border border-blue-200 flex items-center gap-1",
                    title: "[Verify Location] on Google Maps",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { size: 12, className: "text-blue-600" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Verify Location" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "a",
                  {
                    href: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${prop.housePlotNumber}, ${prop.landmark || ""}, ${prop.colony}, Kota Rajasthan ${prop.pincode}`
                    )}`,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200",
                    title: "[Navigate Map] Turn-by-Turn GPS Directions",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 13 })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleOpenStatusModal(prop),
                    className: "px-2 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200 transition flex items-center gap-1 cursor-pointer",
                    title: "[Update Status] Doorstep delivery / occupancy status",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 12, className: "text-amber-700" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Update Status" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => navigate("/sequence-properties", { state: { searchKeyword: prop.colony } }),
                    className: "px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer",
                    title: "[Map to Beat] Door-to-door sequence",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 12, className: "text-indigo-600" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Map Beat" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setActiveProperty(prop),
                    className: "px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs",
                    title: "[Profile & Hub] Open full property & household detail",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 12 }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Profile & Hub" })
                    ]
                  }
                )
              ] })
            ] })
          ]
        },
        prop.id
      );
    }) }),
    viewMode === "TABLE" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-slate-50 border-b border-slate-200 font-extrabold text-xs text-slate-700 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Property-Family Follow-Up & Audit Table (",
          filteredProperties.length,
          " Records)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-indigo-700", children: "Pincode 324009 · Dadabari S.O." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left border-collapse text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-slate-200 bg-slate-100/70 text-slate-700 font-extrabold text-[11px] uppercase tracking-wider", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-3.5", children: "Property" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-3.5", children: "Colony & Block" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-3.5", children: "Linked Family Members" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-3.5", children: "Active Scheme Leads" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-3.5", children: "Assigned Postman & Beat" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-3.5 text-center", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-3.5 text-center", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-3 px-3.5 text-center", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-100", children: filteredProperties.map((prop) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-indigo-50/40 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 px-3.5 whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-slate-900 text-sm", children: prop.housePlotNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] text-slate-400", children: prop.propertyCode })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 px-3.5 max-w-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-800", children: prop.colony }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-500", children: prop.blockSector }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-400 italic truncate max-w-[180px]", children: prop.landmark })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3.5 max-w-xs space-y-1", children: prop.linkedMembers.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900", children: m.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded", children: m.roleInHousehold }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-emerald-700 font-semibold", children: m.mobile })
          ] }, m.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: prop.linkedMembers.flatMap((m) => m.activeSchemes).length > 0 ? prop.linkedMembers.flatMap((m) => m.activeSchemes).map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]",
              children: s.schemeName
            },
            i
          )) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 italic text-[11px]", children: "No active leads" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 px-3.5 whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-extrabold text-[11px]", children: prop.beatNo }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] bg-purple-100 text-purple-800 px-1 py-0.2 rounded font-bold", children: prop.assignedStaffId })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-semibold text-slate-700 mt-0.5", children: [
              prop.assignedStaffName,
              " (",
              prop.assignedStaffRole,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3.5 text-center whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `px-2 py-0.5 rounded-md text-[10px] font-extrabold ${prop.category === "Commercial" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`,
              children: prop.category
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3.5 text-center whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `px-2 py-0.5 rounded-full text-[10px] font-bold ${prop.occupancyStatus === "Occupied" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`,
              children: prop.occupancyStatus
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 px-3.5 text-center whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setActiveProperty(prop),
                className: "px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] transition flex items-center gap-1 cursor-pointer",
                title: "[Profile & Hub]",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 11 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Profile & Hub" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => handleOpenStatusModal(prop),
                className: "px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-lg text-[11px] transition flex items-center gap-1 cursor-pointer",
                title: "[Update Status]",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 11, className: "text-amber-700" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Update Status" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${prop.housePlotNumber}, ${prop.landmark || ""}, ${prop.colony}, Kota Rajasthan ${prop.pincode}`
                )}`,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "p-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg text-[11px] transition flex items-center cursor-pointer",
                title: "[Verify Location]",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { size: 12 })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => navigate("/sequence-properties", { state: { searchKeyword: prop.colony } }),
                className: "p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] transition flex items-center cursor-pointer",
                title: "[Map to Beat]",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 12, className: "text-indigo-600" })
              }
            )
          ] }) })
        ] }, prop.id)) })
      ] }) })
    ] }),
    activeProperty && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between pb-3 border-b border-slate-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md", children: activeProperty.propertyCode }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-black text-xl text-slate-900", children: [
              activeProperty.housePlotNumber,
              " · ",
              activeProperty.colony
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `px-2.5 py-0.5 rounded-full text-xs font-extrabold ${activeProperty.category === "Commercial" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`,
                children: activeProperty.category
              }
            ),
            activeProperty.subTypeTag && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold", children: activeProperty.subTypeTag })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500 mt-1", children: [
            activeProperty.blockSector,
            ", ",
            activeProperty.colony,
            ", Kota, PIN ",
            activeProperty.pincode,
            " · Assigned: ",
            activeProperty.beatNo,
            " (",
            activeProperty.deliveryOffice,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setActiveProperty(null),
            className: "text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-slate-500 font-semibold uppercase text-[10px]", children: "Prominent Landmark" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900 mt-0.5", children: activeProperty.landmark })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-slate-500 font-semibold uppercase text-[10px]", children: "Assigned Postman" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-indigo-950 mt-0.5", children: [
            activeProperty.assignedStaffName,
            " (",
            activeProperty.assignedStaffRole,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] text-purple-700", children: activeProperty.assignedStaffId })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-slate-500 font-semibold uppercase text-[10px]", children: "Verification & Note" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-emerald-700 mt-0.5 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 12 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: activeProperty.verificationStatus })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-600 italic truncate", children: activeProperty.lastMileNote })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-4 h-4 text-indigo-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-extrabold text-sm text-slate-900", children: [
              "Linked Family Members & Customers (",
              activeProperty.linkedMembers.length,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setShowAddMemberModal(true),
              className: "px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { size: 13 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Link Member" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-2xl border border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left border-collapse text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold text-[11px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3", children: "Name & Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3", children: "Mobile & WhatsApp" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3", children: "Age/Gender" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3", children: "Active Postal Scheme Leads" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2.5 px-3 text-center", children: "Action" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-100", children: activeProperty.linkedMembers.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-slate-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2.5 px-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900", children: m.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-200 text-slate-700", children: m.roleInHousehold })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2.5 px-3 font-mono", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: m.mobile }),
              m.whatsapp && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-green-700", children: [
                "WA: ",
                m.whatsapp
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2.5 px-3 text-slate-600", children: [
              m.age ? `${m.age} Yrs` : "-",
              " / ",
              m.gender || "-"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: m.activeSchemes.length > 0 ? m.activeSchemes.map((s, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[11px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]", children: s.schemeName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-600", children: s.sumAssuredOrBalance })
            ] }, idx)) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 italic text-[11px]", children: "None registered" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1", children: [
              m.mobile && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: `tel:${m.mobile}`,
                  className: "p-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                  title: "Call",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 12 })
                }
              ),
              m.whatsapp && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: `https://wa.me/91${m.whatsapp.replace(/\D/g, "")}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "p-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100",
                  title: "WhatsApp",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { size: 12 })
                }
              )
            ] }) })
          ] }, m.id)) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-2 border-t border-slate-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4 text-indigo-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-extrabold text-sm text-slate-900", children: [
              "Latest Updates & Last-Mile Audit Trail (",
              activeProperty.chronologicalRemarks.length,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setShowAddRemarkModal(true),
              className: "px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add Remark" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-48 overflow-y-auto pr-1", children: activeProperty.chronologicalRemarks.map((rem) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900", children: rem.authorName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-slate-500 font-mono", children: [
                    "(",
                    rem.authorRole,
                    ")"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800", children: rem.statusTag }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-400 font-mono", children: rem.timestamp })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-slate-700 text-[11px] leading-relaxed", children: rem.remarkText })
            ]
          },
          rem.id
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-3 border-t border-slate-100 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${activeProperty.housePlotNumber}, ${activeProperty.colony}, Kota Rajasthan ${activeProperty.pincode}`
              )}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-200",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { size: 13, className: "text-blue-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Verify on Google Maps" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                navigate("/sequence-properties", { state: { searchKeyword: activeProperty.colony } });
              },
              className: "px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 13, className: "text-indigo-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Map into Beat Sequence" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setActiveProperty(null),
            className: "px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer",
            children: "Close Drawer"
          }
        )
      ] })
    ] }) }),
    showAddRemarkModal && activeProperty && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-2 border-b border-slate-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-extrabold text-sm text-slate-900", children: "Add Last-Mile Remark / Verification Log" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setShowAddRemarkModal(false),
            className: "text-slate-400 hover:text-slate-600",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleAddRemark, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Status Classification:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: newRemarkTag,
              onChange: (e) => setNewRemarkTag(e.target.value),
              className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Standard Delivery", children: "Standard Delivery" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Parcel Delivered", children: "Parcel Delivered" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Door Locked", children: "Door Locked / Addressee Absent" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Address Shifted", children: "Address Shifted / Tenant Moved" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Scheme Lead Pitch", children: "Scheme Lead Pitch (PLI/SSY/IPPB)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Verification Done", children: "Verification Done & Confirmed" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Operational Observation / Note:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              rows: 3,
              value: newRemarkText,
              onChange: (e) => setNewRemarkText(e.target.value),
              placeholder: "e.g. Delivered Speed Post parcel to family head. Doorbell rung at left pillar. Customer expressed interest in SSY top-up.",
              className: "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowAddRemarkModal(false),
              className: "px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer",
              children: "Save Remark"
            }
          )
        ] })
      ] })
    ] }) }),
    showAddMemberModal && activeProperty && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-2 border-b border-slate-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-extrabold text-sm text-slate-900", children: [
          "Link New Family Member to ",
          activeProperty.housePlotNumber
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setShowAddMemberModal(false),
            className: "text-slate-400 hover:text-slate-600",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleAddMember, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Member Full Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "e.g. Urmila Chauhan",
              value: newMemberName,
              onChange: (e) => setNewMemberName(e.target.value),
              className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Role in Family" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: newMemberRole,
                onChange: (e) => setNewMemberRole(e.target.value),
                className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Head of Household", children: "Head of Household" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Spouse", children: "Spouse" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Son", children: "Son" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Daughter", children: "Daughter" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Father", children: "Father" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Mother", children: "Mother" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Tenant", children: "Tenant" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Commercial Operator", children: "Commercial Operator" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Other", children: "Other" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Mobile / WhatsApp" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "9414589201",
                value: newMemberMobile,
                onChange: (e) => setNewMemberMobile(e.target.value),
                className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold font-mono"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Age & Gender" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  placeholder: "Age",
                  value: newMemberAge,
                  onChange: (e) => setNewMemberAge(e.target.value),
                  className: "w-16 px-2 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: newMemberGender,
                  onChange: (e) => setNewMemberGender(e.target.value),
                  className: "flex-1 px-2 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Male", children: "Male" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Female", children: "Female" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Other", children: "Other" })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Occupation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "e.g. Teacher, Business",
                value: newMemberOccupation,
                onChange: (e) => setNewMemberOccupation(e.target.value),
                className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Initial Postal Scheme Lead" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: newMemberScheme,
              onChange: (e) => setNewMemberScheme(e.target.value),
              className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "None", children: "None (General Inquiry)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PLI", children: "PLI (Postal Life Insurance)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "SSY", children: "SSY (Sukanya Samriddhi)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "IPPB", children: "IPPB (Digital Banking)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "MIS", children: "MIS (Monthly Income Scheme)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "RD", children: "RD (Recurring Deposit)" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowAddMemberModal(false),
              className: "px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer",
              children: "Link to Household"
            }
          )
        ] })
      ] })
    ] }) }),
    showAddPropertyModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-2 border-b border-slate-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-extrabold text-sm text-slate-900", children: "Register New Physical Property in Dadabari Jurisdiction" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setShowAddPropertyModal(false),
            className: "text-slate-400 hover:text-slate-600",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleRegisterNewProperty, className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-black text-indigo-950 uppercase tracking-wider flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 13, className: "text-indigo-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Hierarchical Property Mapping (Dadabari S.O. 324009)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full border border-indigo-200/60", children: "Auto Beat-Linked" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "1. Colony Area *" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  value: newPropColony,
                  onChange: (e) => handleNewPropColonyChange(e.target.value),
                  className: "w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800",
                  required: true,
                  children: uniqueColonies.filter((c) => c !== "All").map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, children: c }, c))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "2. Sector / Sub-Sector *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-400 font-semibold", children: newPropColony })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: isCustomBlock ? "__CUSTOM__" : newPropBlock,
                  onChange: (e) => {
                    const val = e.target.value;
                    if (val === "__CUSTOM__") {
                      setIsCustomBlock(true);
                      setNewPropBlock(customBlockText || "Block A");
                    } else {
                      setIsCustomBlock(false);
                      setNewPropBlock(val);
                      const resolved = resolveColonySectorDetails(newPropColony, val);
                      setNewPropBeat(resolved.beatNo);
                    }
                  },
                  className: "w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800",
                  required: true,
                  children: [
                    availableRegistrationSectors.map((sec) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: sec, children: sec }, sec)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__CUSTOM__", children: "✍️ Custom Block / Sector..." })
                  ]
                }
              )
            ] })
          ] }),
          isCustomBlock && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-in fade-in duration-150 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-bold text-slate-700 mb-1", children: "3. Specify Block / Sector / Phase:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "e.g. Block D Extension or Phase 2",
                value: customBlockText,
                onChange: (e) => {
                  setCustomBlockText(e.target.value);
                  setNewPropBlock(e.target.value);
                },
                className: "w-full px-3 py-2 border border-indigo-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "4. House / Plot / KH No. *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  placeholder: "e.g. 5-A, KH-12, Plot 162",
                  value: newPropHouseNo,
                  onChange: (e) => setNewPropHouseNo(e.target.value),
                  className: "w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Property Category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: newPropCategory,
                  onChange: (e) => setNewPropCategory(e.target.value),
                  className: "w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Residential", children: "Residential" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Commercial", children: "Commercial" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Mixed", children: "Mixed (Shop + Home)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Plot", children: "Plot" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Under Construction", children: "Under Construction" })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 12, className: "text-amber-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Postal Beat:" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  value: newPropBeat,
                  onChange: (e) => setNewPropBeat(e.target.value),
                  className: "w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800",
                  children: uniqueBeats.filter((b) => b !== "All").map((b) => {
                    const staff = BEAT_STAFF_MAP[b];
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: b, children: [
                      b,
                      " ",
                      staff ? `· ${staff.name}` : ""
                    ] }, b);
                  })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-2 rounded-xl bg-indigo-100/70 border border-indigo-200/90 text-indigo-950 text-[11px] font-medium leading-tight", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 12, className: "text-indigo-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Permanent Colony-Beat Mapping:" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-slate-800 mt-0.5", children: resolveColonySectorDetails(newPropColony, isCustomBlock ? customBlockText : newPropBlock).jurisdictionBadge })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Prominent Landmark Hint" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "e.g. Near Shiv Mandir Gali, Opposite Water Tank",
              value: newPropLandmark,
              onChange: (e) => setNewPropLandmark(e.target.value),
              className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 pt-1 border-t border-slate-100", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Head of Household *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "e.g. Kailash Sen",
                value: newPropHeadName,
                onChange: (e) => setNewPropHeadName(e.target.value),
                className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-bold text-slate-700 mb-1", children: "Mobile Contact" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "9829012345",
                value: newPropMobile,
                onChange: (e) => setNewPropMobile(e.target.value),
                className: "w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold font-mono"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowAddPropertyModal(false),
              className: "px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              className: "px-4 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-md cursor-pointer",
              children: "Create Record"
            }
          )
        ] })
      ] })
    ] }) }),
    statusModalProperty && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-2 border-b border-slate-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase", children: "1-Click Field Action Hook" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-extrabold text-base text-slate-900 mt-0.5", children: "Update Status & Log Doorstep Note" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setStatusModalProperty(null),
            className: "text-slate-400 hover:text-slate-600 cursor-pointer",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 18 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-slate-900 text-sm", children: [
          statusModalProperty.housePlotNumber,
          " · ",
          statusModalProperty.colony
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-500 text-[11px]", children: [
          statusModalProperty.blockSector,
          " · ",
          statusModalProperty.beatNo,
          " (Dadabari S.O. 324009)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-indigo-900 text-[11px] font-semibold", children: [
          "Postman: ",
          statusModalProperty.assignedStaffName,
          " (",
          statusModalProperty.assignedStaffId,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Occupancy Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: statusOccupancy,
              onChange: (e) => setStatusOccupancy(e.target.value),
              className: "w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white focus:ring-2 focus:ring-indigo-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Occupied", children: "Occupied (Family residing)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Vacant", children: "Vacant (Unoccupied / Locked)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Rented", children: "Rented (Tenant residing)" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Field Verification Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: statusVerification,
              onChange: (e) => setStatusVerification(e.target.value),
              className: "w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white focus:ring-2 focus:ring-indigo-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Verified", children: "Verified (Ground Confirmed)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Pending Verification", children: "Pending Verification" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Action / Remark Tag" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: statusRemarkTag,
              onChange: (e) => setStatusRemarkTag(e.target.value),
              className: "w-full px-3 py-2 border border-slate-200 rounded-xl font-bold bg-white focus:ring-2 focus:ring-indigo-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Verification Done", children: "Verification Done" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Standard Delivery", children: "Standard Delivery" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Parcel Delivered", children: "Parcel Delivered" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Scheme Lead Pitch", children: "Scheme Lead Pitch (PLI/SSY/IPPB)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Door Locked", children: "Door Locked / Customer Unavailable" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Address Shifted", children: "Address Shifted / Relocated" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-700 mb-1", children: "Doorstep Field Note / Delivery Remark" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              rows: 3,
              value: statusRemarkText,
              onChange: (e) => setStatusRemarkText(e.target.value),
              placeholder: "Enter doorstep delivery remark, resident confirmation or scheme inquiry...",
              className: "w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2 pt-2 border-t border-slate-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setStatusModalProperty(null),
            className: "px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: handleSaveStatusModal,
            className: "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Save & Update Status" })
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  buildMasterConsolidatedProperties,
  UnifiedPropertyFamilyHub as default
};
