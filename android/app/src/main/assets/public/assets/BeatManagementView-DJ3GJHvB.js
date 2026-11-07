import { c as createLucideIcon, u as useAuth, s as staffPermissionService, r as reactExports, b as customerService, ar as resolveOfficeMetadata, as as RAJASTHAN_CIRCLE_OFFICE_MASTER_LIST, j as jsxRuntimeExports, at as Map$1, x as ShieldCheck, au as Lock, E as Eye, M as MessageSquare, z as Funnel, y as RefreshCw, S as Search, X, L as Layers, B as Building2, p as ChevronRight, e as MapPin, N as Navigation, U as Users, Z as Check, ad as Copy, C as CircleCheck, J as Sparkles, ae as Send, n as DirectMessageModal, o as Phone } from "./index-D4C5n5Sm.js";
import { R as Radio } from "./radio-CQIrnDSZ.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["line", { x1: "6", x2: "6", y1: "3", y2: "15", key: "17qcm7" }],
  ["circle", { cx: "18", cy: "6", r: "3", key: "1h7g24" }],
  ["circle", { cx: "6", cy: "18", r: "3", key: "fqmcym" }],
  ["path", { d: "M18 9a9 9 0 0 1-9 9", key: "n2h4wq" }]
];
const GitBranch = createLucideIcon("git-branch", __iconNode$1);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
];
const Info = createLucideIcon("info", __iconNode);
function BeatManagementView({
  onFilterBeat
}) {
  const { userProfile } = useAuth();
  const isActualSuperAdmin = staffPermissionService.isSuperAdmin(userProfile);
  const [simulateNonAdminOfficeId, setSimulateNonAdminOfficeId] = reactExports.useState(null);
  const isSuperAdmin = isActualSuperAdmin && !simulateNonAdminOfficeId;
  const canDispatch = staffPermissionService.canAccessServiceModule(
    userProfile,
    "contentSharingDispatchSection"
  );
  const [customers, setCustomers] = reactExports.useState([]);
  const [dynamicBeats, setDynamicBeats] = reactExports.useState([]);
  const [dynamicOffices, setDynamicOffices] = reactExports.useState([]);
  const [allStaffProfiles, setAllStaffProfiles] = reactExports.useState([]);
  const [selectedCircleFilter, setSelectedCircleFilter] = reactExports.useState("Rajasthan Circle");
  const [selectedDivisionFilter, setSelectedDivisionFilter] = reactExports.useState("ALL");
  const [selectedOfficeFilter, setSelectedOfficeFilter] = reactExports.useState("ALL");
  const [selectedBeatFilter, setSelectedBeatFilter] = reactExports.useState("ALL");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [beatStatusFilter, setBeatStatusFilter] = reactExports.useState("ALL");
  const [groupByOffice, setGroupByOffice] = reactExports.useState(true);
  const [showOfficeMappingDrawer, setShowOfficeMappingDrawer] = reactExports.useState(false);
  const [selectedBeatForModal, setSelectedBeatForModal] = reactExports.useState(null);
  const [beatModalSearch, setBeatModalSearch] = reactExports.useState("");
  const [activeMessageCustomer, setActiveMessageCustomer] = reactExports.useState(null);
  const [showMessageModal, setShowMessageModal] = reactExports.useState(false);
  const [broadcastBeat, setBroadcastBeat] = reactExports.useState(null);
  const [broadcastMessage, setBroadcastMessage] = reactExports.useState("");
  const [broadcastStatus, setBroadcastStatus] = reactExports.useState(null);
  const [copiedBatch, setCopiedBatch] = reactExports.useState(false);
  const refreshData = () => {
    setCustomers([...customerService.getCustomers()]);
    setDynamicBeats([...staffPermissionService.getDynamicBeatsSummary()]);
    setDynamicOffices([...staffPermissionService.getDynamicOffices()]);
    setAllStaffProfiles([...staffPermissionService.getAllStaffProfiles()]);
  };
  reactExports.useEffect(() => {
    refreshData();
    const unsubCust = customerService.subscribe(refreshData);
    const unsubStaff = staffPermissionService.subscribe(refreshData);
    return () => {
      unsubCust();
      unsubStaff();
    };
  }, []);
  const nonAdminAssignedOffice = reactExports.useMemo(() => {
    if (simulateNonAdminOfficeId) {
      const meta = resolveOfficeMetadata(simulateNonAdminOfficeId);
      return meta;
    }
    if (!userProfile) {
      return resolveOfficeMetadata("Dadabari S.O.", "", "324009");
    }
    return resolveOfficeMetadata(
      userProfile.postOfficeName || userProfile.branchOffice || userProfile.subOffice || userProfile.assignedOffice,
      userProfile.branchOffice,
      userProfile.officePincode
    );
  }, [userProfile, simulateNonAdminOfficeId]);
  const officeHubOptions = reactExports.useMemo(() => {
    const coreHubs = RAJASTHAN_CIRCLE_OFFICE_MASTER_LIST.map((po) => ({
      officeId: po.officeId,
      postOfficeName: po.name,
      officeType: po.type,
      pincode: po.pin,
      parentOfficeName: po.parentOffice,
      linkedDeliveryOffices: po.type === "HO" ? [
        "Dadabari S.O. (324009)",
        "Baran H.O. (325205)",
        "Jhalawar H.O. (326001)",
        "Bundi H.O. (323001)",
        "Tonk H.O. (304001)"
      ] : [po.parentOffice],
      completeAddress: po.address,
      circle: po.circle,
      division: po.division,
      district: po.district,
      subDivision: po.subDivision
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
          subDivision: o.subDivision || meta.subDivision
        });
      }
    });
    return coreHubs;
  }, [dynamicOffices]);
  const allBeats = reactExports.useMemo(() => {
    const baseBeats = [
      {
        id: "BEAT-DAD-1",
        beatNo: "1",
        name: "Beat 1 — Dadabari Extension & Core Areas",
        officeId: "DADABARI_SO",
        postOfficeName: "Dadabari S.O.",
        officeType: "SO",
        pincode: "324009",
        parentOffice: "Kota H.O. (324001)",
        linkedDeliveryOffices: ["Engineering College S.O. (324010)"],
        assignedPostman: "Muskan Sharma",
        employeeId: "50510312",
        contact: "9521279186",
        fixedKm: 16,
        areasCovered: [
          "Dadabari Extension",
          "Jyoti Mandir",
          "Dadabari Dispensary",
          "Modi College",
          "Dadabari Sector 1",
          "Dadabari Sector 2",
          "P&T Colony Dadabari",
          "MSE SBI Bank Branch",
          "Post Office Dadabari",
          "Ghode Wala School",
          "Government School Dadabari"
        ],
        totalCustomers: (customers == null ? void 0 : customers.filter((c) => c.beatNo === "1" || c.beatNo === "Beat 1").length) || 0,
        confirmedCoverage: "99.0%",
        coverageValue: 99,
        status: "Active Daily Delivery",
        assignedStaffCount: 1
      },
      {
        id: "BEAT-DAD-2",
        beatNo: "2",
        name: "Beat 2 — Keshavpura, Patel Nagar, Santoshi Nagar & Surroundings",
        officeId: "DADABARI_SO",
        postOfficeName: "Dadabari S.O.",
        officeType: "SO",
        pincode: "324009",
        parentOffice: "Kota H.O. (324001)",
        linkedDeliveryOffices: ["Engineering College S.O. (324010)"],
        assignedPostman: "Mahendra Kumar Meena",
        employeeId: "50457421",
        contact: "8769706002",
        fixedKm: 30,
        areasCovered: [
          "Keshavpura Sector 7",
          "Keshavpura Sector 6",
          "Patel Nagar",
          "Santoshi Nagar",
          "Tejaji Ke Mandir Ke Pass",
          "Ganesh Mandir Ke Pass",
          "Chauth Mata Mandir Ke Pass",
          "Shiv Ji Ke Mandir Ke Pass",
          "Jyoti Dry Clean Ki Gali",
          "Pahla Chauk",
          "Mamta Kirana",
          "Mahima Kirana",
          "Ramdev Mandir Ke Pass",
          "Akashya Kirana Ki Gali",
          "Radhe Mens Parlor Ki Gali",
          "TVS Circle",
          "Patel Market",
          "Keshav Market",
          "UIT Market"
        ],
        totalCustomers: (customers == null ? void 0 : customers.filter(
          (c) => c.beatNo === "2" || c.beatNo === "Beat 2" || !c.beatNo
        ).length) || 0,
        confirmedCoverage: "98.4%",
        coverageValue: 98.4,
        status: "Active Daily Delivery",
        assignedStaffCount: 2
      },
      {
        id: "BEAT-DAD-3",
        beatNo: "3",
        name: "Beat 3 — Basant Vihar Sector A & B & CAD Circle",
        officeId: "DADABARI_SO",
        postOfficeName: "Dadabari S.O.",
        officeType: "SO",
        pincode: "324009",
        parentOffice: "Kota H.O. (324001)",
        linkedDeliveryOffices: ["Engineering College S.O. (324010)"],
        assignedPostman: "Manali Ahuja",
        employeeId: "50510313",
        contact: "7014408315",
        fixedKm: 15,
        areasCovered: [
          "Basant Vihar Sector A",
          "Basant Vihar Sector B",
          "CAD Colony",
          "Basant Vihar Park"
        ],
        totalCustomers: (customers == null ? void 0 : customers.filter((c) => c.beatNo === "3" || c.beatNo === "Beat 3").length) || 0,
        confirmedCoverage: "97.5%",
        coverageValue: 97.5,
        status: "Active Daily Delivery",
        assignedStaffCount: 1
      },
      {
        id: "BEAT-DAD-4",
        beatNo: "4",
        name: "Beat 4 — Shastri Nagar & Dadabari Main Market",
        officeId: "DADABARI_SO",
        postOfficeName: "Dadabari S.O.",
        officeType: "SO",
        pincode: "324009",
        parentOffice: "Kota H.O. (324001)",
        linkedDeliveryOffices: ["Engineering College S.O. (324010)"],
        assignedPostman: "Govind Prasad",
        employeeId: "10310735",
        contact: "7877352816",
        fixedKm: 20,
        areasCovered: [
          "Shastri Nagar Main Sector",
          "Shastri Market",
          "Community Hall Area",
          "Dadabari Main Market"
        ],
        totalCustomers: (customers == null ? void 0 : customers.filter((c) => c.beatNo === "4" || c.beatNo === "Beat 4").length) || 0,
        confirmedCoverage: "97.8%",
        coverageValue: 97.8,
        status: "Active Daily Delivery",
        assignedStaffCount: 1
      },
      {
        id: "BEAT-DAD-6",
        beatNo: "6",
        name: "Beat 6 — Keshavpura Sector 4, Sector 2 & Teacher Colony",
        officeId: "DADABARI_SO",
        postOfficeName: "Dadabari S.O.",
        officeType: "SO",
        pincode: "324009",
        parentOffice: "Kota H.O. (324001)",
        linkedDeliveryOffices: ["Engineering College S.O. (324010)"],
        assignedPostman: "Ramkishan Meghwal",
        employeeId: "10317473",
        contact: "9664215130",
        fixedKm: 22,
        areasCovered: [
          "Keshavpura Sector 4",
          "Keshavpura Sector 2",
          "Teacher Colony",
          "Shopping Centre"
        ],
        totalCustomers: (customers == null ? void 0 : customers.filter((c) => c.beatNo === "6" || c.beatNo === "Beat 6").length) || 0,
        confirmedCoverage: "96.2%",
        coverageValue: 96.2,
        status: "Active Daily Delivery",
        assignedStaffCount: 1
      },
      {
        id: "BEAT-EC-1",
        beatNo: "EC-1",
        name: "Beat EC-1 — RTU Campus, Srinathpuram & Akelgarh",
        officeId: "ENG_COLLEGE_SO",
        postOfficeName: "Engineering College S.O.",
        officeType: "SO",
        pincode: "324010",
        parentOffice: "Kota H.O. (324001)",
        linkedDeliveryOffices: ["Dadabari S.O. (324009)"],
        assignedPostman: "Vikram Singh Hada",
        employeeId: "CSI-10448901",
        contact: "9414188210",
        fixedKm: 20,
        areasCovered: [
          "RTU Campus",
          "Srinathpuram Sector A",
          "Srinathpuram Sector B",
          "Akelgarh Water Works",
          "Rawatbhata Road Institutional Area"
        ],
        totalCustomers: (customers == null ? void 0 : customers.filter(
          (c) => c.beatNo === "EC-1" || c.beatNo === "Beat EC-1" || c.pincode === "324010" || c.officeId === "ENG_COLLEGE_SO"
        ).length) || 0,
        confirmedCoverage: "97.2%",
        coverageValue: 97.2,
        status: "Active Daily Delivery",
        assignedStaffCount: 1
      },
      {
        id: "BEAT-EC-2",
        beatNo: "EC-2",
        name: "Beat EC-2 — Talwandi Sector 1-4 & Jawahar Nagar",
        officeId: "ENG_COLLEGE_SO",
        postOfficeName: "Engineering College S.O.",
        officeType: "SO",
        pincode: "324010",
        parentOffice: "Kota H.O. (324001)",
        linkedDeliveryOffices: ["Dadabari S.O. (324009)"],
        assignedPostman: "Suresh Chandra Verma",
        employeeId: "CSI-10448902",
        contact: "9829077412",
        fixedKm: 18,
        areasCovered: [
          "Talwandi Sector 1 to 4",
          "Jawahar Nagar Main",
          "Commerce College Road",
          "Global Hospital Belt"
        ],
        totalCustomers: (customers == null ? void 0 : customers.filter((c) => c.beatNo === "EC-2" || c.beatNo === "Beat EC-2").length) || 0,
        confirmedCoverage: "96.4%",
        coverageValue: 96.4,
        status: "Active Daily Delivery",
        assignedStaffCount: 1
      },
      // Baran Division Beats
      {
        id: "BEAT-BAR-1",
        beatNo: "BAR-1",
        name: "Beat 1 — Baran H.O. (Pratap Chowk & Civil Lines)",
        officeId: "BARAN_HO",
        postOfficeName: "Baran H.O.",
        officeType: "HO",
        pincode: "325205",
        circle: "Rajasthan Circle",
        division: "Baran Division",
        district: "Baran",
        subDivision: "Baran North Sub-Division",
        parentOffice: "Baran Division, Rajasthan Circle",
        linkedDeliveryOffices: ["Baran City S.O. (325205)"],
        assignedPostman: "Ramprasad Meena",
        employeeId: "CSI-BAR-01",
        contact: "9414589201",
        fixedKm: 18,
        areasCovered: ["Pratap Chowk", "Civil Lines Baran", "Collectorate Circle", "Dharmada Chauraha"],
        totalCustomers: (customers == null ? void 0 : customers.filter((c) => {
          var _a;
          return ((_a = c.beatNo) == null ? void 0 : _a.includes("BAR-1")) || c.pincode === "325205";
        }).length) || 0,
        confirmedCoverage: "98.0%",
        coverageValue: 98,
        status: "Active Daily Delivery",
        assignedStaffCount: 1
      },
      {
        id: "BEAT-ANTA-1",
        beatNo: "ANTA-1",
        name: "Beat 1 — Anta S.O. (NTPC Township & Siswali Road)",
        officeId: "ANTA_SO",
        postOfficeName: "Anta S.O.",
        officeType: "SO",
        pincode: "325202",
        circle: "Rajasthan Circle",
        division: "Baran Division",
        district: "Baran",
        subDivision: "Baran North Sub-Division",
        parentOffice: "Baran H.O. (325205)",
        linkedDeliveryOffices: ["Baran H.O. (325205)"],
        assignedPostman: "Dinesh Kumar Sharma",
        employeeId: "CSI-BAR-02",
        contact: "9829145672",
        fixedKm: 20,
        areasCovered: ["NTPC Power Complex", "Siswali Road", "Balaji Temple Anta", "Old Mandi"],
        totalCustomers: (customers == null ? void 0 : customers.filter((c) => {
          var _a;
          return ((_a = c.beatNo) == null ? void 0 : _a.includes("ANTA")) || c.pincode === "325202";
        }).length) || 0,
        confirmedCoverage: "97.0%",
        coverageValue: 97,
        status: "Active Daily Delivery",
        assignedStaffCount: 1
      },
      // Jhalawar Division Beats
      {
        id: "BEAT-JHL-1",
        beatNo: "JHL-1",
        name: "Beat 1 — Jhalawar H.O. (Garh Palace & Mama Bhanja)",
        officeId: "JHALAWAR_HO",
        postOfficeName: "Jhalawar H.O.",
        officeType: "HO",
        pincode: "326001",
        circle: "Rajasthan Circle",
        division: "Jhalawar Division",
        district: "Jhalawar",
        subDivision: "Jhalawar City Sub-Division",
        parentOffice: "Jhalawar Division, Rajasthan Circle",
        linkedDeliveryOffices: ["Jhalrapatan S.O. (326023)"],
        assignedPostman: "Kailash Chand Verma",
        employeeId: "CSI-JHL-01",
        contact: "9414234567",
        fixedKm: 16,
        areasCovered: ["Mama Bhanja Chauraha", "Garh Palace Area", "Brijraj Nagar", "Mangalpura"],
        totalCustomers: (customers == null ? void 0 : customers.filter((c) => {
          var _a;
          return ((_a = c.beatNo) == null ? void 0 : _a.includes("JHL-1")) || c.pincode === "326001";
        }).length) || 0,
        confirmedCoverage: "98.5%",
        coverageValue: 98.5,
        status: "Active Daily Delivery",
        assignedStaffCount: 1
      },
      {
        id: "BEAT-PATAN-1",
        beatNo: "PATAN-1",
        name: "Beat 1 — Jhalrapatan S.O. (City of Temple Bells)",
        officeId: "JHALRAPATAN_SO",
        postOfficeName: "Jhalrapatan S.O.",
        officeType: "SO",
        pincode: "326023",
        circle: "Rajasthan Circle",
        division: "Jhalawar Division",
        district: "Jhalawar",
        subDivision: "Jhalawar City Sub-Division",
        parentOffice: "Jhalawar H.O. (326001)",
        linkedDeliveryOffices: ["Jhalawar H.O. (326001)"],
        assignedPostman: "Manish Patidar",
        employeeId: "CSI-JHL-02",
        contact: "9784123456",
        fixedKm: 18,
        areasCovered: ["Surajpole Gate", "Dwarikadhish Temple Road", "Chandrabhaga Road", "Gomti Sagar"],
        totalCustomers: (customers == null ? void 0 : customers.filter((c) => {
          var _a;
          return ((_a = c.beatNo) == null ? void 0 : _a.includes("PATAN")) || c.pincode === "326023";
        }).length) || 0,
        confirmedCoverage: "97.5%",
        coverageValue: 97.5,
        status: "Active Daily Delivery",
        assignedStaffCount: 1
      },
      // Bundi Division Beats
      {
        id: "BEAT-BND-1",
        beatNo: "BND-1",
        name: "Beat 1 — Bundi H.O. (Sadar Bazar & Lanka Gate)",
        officeId: "BUNDI_HO",
        postOfficeName: "Bundi H.O.",
        officeType: "HO",
        pincode: "323001",
        circle: "Rajasthan Circle",
        division: "Bundi Division",
        district: "Bundi",
        subDivision: "Bundi Central Sub-Division",
        parentOffice: "Bundi Division, Rajasthan Circle",
        linkedDeliveryOffices: ["Keshoraipatan S.O. (323601)"],
        assignedPostman: "Om Prakash Saini",
        employeeId: "CSI-BND-01",
        contact: "9460123789",
        fixedKm: 17,
        areasCovered: ["Sadar Bazar Bundi", "Lanka Gate", "Khoja Gate", "Vikas Nagar"],
        totalCustomers: (customers == null ? void 0 : customers.filter((c) => {
          var _a;
          return ((_a = c.beatNo) == null ? void 0 : _a.includes("BND-1")) || c.pincode === "323001";
        }).length) || 0,
        confirmedCoverage: "99.0%",
        coverageValue: 99,
        status: "Active Daily Delivery",
        assignedStaffCount: 1
      },
      {
        id: "BEAT-KPATAN-1",
        beatNo: "KPATAN-1",
        name: "Beat 1 — Keshoraipatan S.O. (Chambal Ghat & Sugar Mill)",
        officeId: "KESHORAIPATAN_SO",
        postOfficeName: "Keshoraipatan S.O.",
        officeType: "SO",
        pincode: "323601",
        circle: "Rajasthan Circle",
        division: "Bundi Division",
        district: "Bundi",
        subDivision: "Bundi Central Sub-Division",
        parentOffice: "Bundi H.O. (323001)",
        linkedDeliveryOffices: ["Bundi H.O. (323001)"],
        assignedPostman: "Rameshwar Dayal",
        employeeId: "CSI-BND-02",
        contact: "9828345671",
        fixedKm: 19,
        areasCovered: ["Keshorai Temple Ghat", "Sugar Mill Housing", "Station Road Patan", "Main Market"],
        totalCustomers: (customers == null ? void 0 : customers.filter((c) => {
          var _a;
          return ((_a = c.beatNo) == null ? void 0 : _a.includes("KPATAN")) || c.pincode === "323601";
        }).length) || 0,
        confirmedCoverage: "96.8%",
        coverageValue: 96.8,
        status: "Active Daily Delivery",
        assignedStaffCount: 1
      },
      // Tonk Division Beats
      {
        id: "BEAT-TNK-1",
        beatNo: "TNK-1",
        name: "Beat 1 — Tonk H.O. (Nazar Bagh & Civil Lines)",
        officeId: "TONK_HO",
        postOfficeName: "Tonk H.O.",
        officeType: "HO",
        pincode: "304001",
        circle: "Rajasthan Circle",
        division: "Tonk Division",
        district: "Tonk",
        subDivision: "Tonk City Sub-Division",
        parentOffice: "Tonk Division, Rajasthan Circle",
        linkedDeliveryOffices: ["Niwai S.O. (304021)"],
        assignedPostman: "Abdul Hameed",
        employeeId: "CSI-TNK-01",
        contact: "9414345678",
        fixedKm: 18,
        areasCovered: ["Nazar Bagh", "Civil Lines Tonk", "Subhash Bazar", "Bada Bazar"],
        totalCustomers: (customers == null ? void 0 : customers.filter((c) => {
          var _a;
          return ((_a = c.beatNo) == null ? void 0 : _a.includes("TNK-1")) || c.pincode === "304001";
        }).length) || 0,
        confirmedCoverage: "98.2%",
        coverageValue: 98.2,
        status: "Active Daily Delivery",
        assignedStaffCount: 1
      },
      {
        id: "BEAT-NIWAI-1",
        beatNo: "NIWAI-1",
        name: "Beat 1 — Niwai S.O. (Banasthali Link & Mandi Yard)",
        officeId: "NIWAI_SO",
        postOfficeName: "Niwai S.O.",
        officeType: "SO",
        pincode: "304021",
        circle: "Rajasthan Circle",
        division: "Tonk Division",
        district: "Tonk",
        subDivision: "Tonk City Sub-Division",
        parentOffice: "Tonk H.O. (304001)",
        linkedDeliveryOffices: ["Tonk H.O. (304001)"],
        assignedPostman: "Satyanarayan Jat",
        employeeId: "CSI-TNK-02",
        contact: "9829456123",
        fixedKm: 21,
        areasCovered: ["Mandi Yard Niwai", "Banasthali Link Road", "Bhagat Singh Circle", "Jain Mandir Road"],
        totalCustomers: (customers == null ? void 0 : customers.filter((c) => {
          var _a;
          return ((_a = c.beatNo) == null ? void 0 : _a.includes("NIWAI")) || c.pincode === "304021";
        }).length) || 0,
        confirmedCoverage: "97.1%",
        coverageValue: 97.1,
        status: "Active Daily Delivery",
        assignedStaffCount: 1
      }
    ];
    const existingBeatKeys = new Set(baseBeats.map((b) => b.beatNo.toLowerCase()));
    dynamicBeats.forEach((db) => {
      var _a, _b, _c, _d, _e;
      const cleanNo = db.beatNumber.replace(/^Beat\s+/i, "").trim();
      const matchExisting = baseBeats.find(
        (b) => b.beatNo.toLowerCase() === cleanNo.toLowerCase() || `beat ${b.beatNo}`.toLowerCase() === db.beatNumber.toLowerCase()
      );
      if (matchExisting) {
        db.colonies.forEach((col) => {
          if (!matchExisting.areasCovered.includes(col)) {
            matchExisting.areasCovered.push(col);
          }
        });
      } else if (!existingBeatKeys.has(cleanNo.toLowerCase())) {
        existingBeatKeys.add(cleanNo.toLowerCase());
        const meta = resolveOfficeMetadata(db.officeName, "", db.pincode);
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
          assignedPostman: ((_a = db.assignedStaff[0]) == null ? void 0 : _a.name) || "Assigned Postman",
          employeeId: ((_b = db.assignedStaff[0]) == null ? void 0 : _b.employeeId) || "CSI-STAFF",
          contact: ((_c = db.assignedStaff[0]) == null ? void 0 : _c.contact) || "9414000000",
          fixedKm: ((_d = db.assignedStaff[0]) == null ? void 0 : _d.fixedKm) || 18,
          areasCovered: db.colonies.length ? db.colonies : [meta.postOfficeName],
          totalCustomers: (customers == null ? void 0 : customers.filter((c) => c.beatNo === cleanNo || c.beatNo === db.beatNumber).length) || 0,
          confirmedCoverage: "95.0%",
          coverageValue: 95,
          status: "Auto-Synced Beat",
          assignedStaffCount: Math.max(((_e = db.assignedStaff) == null ? void 0 : _e.length) || 1, 1)
        });
      }
    });
    return baseBeats;
  }, [customers, dynamicBeats]);
  const effectiveOfficeFilter = isSuperAdmin ? selectedOfficeFilter : nonAdminAssignedOffice.officeId;
  const availableOfficesForDivision = reactExports.useMemo(() => {
    if (selectedDivisionFilter === "ALL") return officeHubOptions;
    return officeHubOptions.filter(
      (h) => h.division === selectedDivisionFilter || h.parentOfficeName && h.parentOfficeName.includes(selectedDivisionFilter)
    );
  }, [officeHubOptions, selectedDivisionFilter]);
  const availableBeatsForSelection = reactExports.useMemo(() => {
    return allBeats.filter((b) => {
      if (selectedDivisionFilter !== "ALL") {
        const meta = resolveOfficeMetadata(b.postOfficeName, "", b.pincode);
        if ((b.division || meta.division) !== selectedDivisionFilter) return false;
      }
      if (effectiveOfficeFilter !== "ALL" && b.officeId !== effectiveOfficeFilter) {
        return false;
      }
      return true;
    });
  }, [allBeats, selectedDivisionFilter, effectiveOfficeFilter]);
  const filteredBeats = reactExports.useMemo(() => {
    return allBeats.filter((beat) => {
      var _a, _b, _c, _d, _e;
      if (selectedCircleFilter !== "ALL" && beat.circle && beat.circle !== selectedCircleFilter) {
        return false;
      }
      if (selectedDivisionFilter !== "ALL") {
        const beatMeta = resolveOfficeMetadata(beat.postOfficeName, "", beat.pincode);
        const beatDivision = beat.division || beatMeta.division;
        if (beatDivision !== selectedDivisionFilter) {
          return false;
        }
      }
      if (effectiveOfficeFilter !== "ALL") {
        const matchesDirectOffice = beat.officeId === effectiveOfficeFilter;
        if (!isSuperAdmin && userProfile && !simulateNonAdminOfficeId) {
          const allowedOffices = ((_a = userProfile.permissions) == null ? void 0 : _a.allowedOffices) || [];
          const hasAllOffices = allowedOffices.includes("ALL") || allowedOffices.includes("All Offices");
          if (!hasAllOffices) {
            const officeMatch = matchesDirectOffice || allowedOffices.some(
              (ao) => beat.postOfficeName.toLowerCase().includes(ao.toLowerCase()) || ao.toLowerCase().includes(beat.postOfficeName.toLowerCase())
            );
            if (!officeMatch) return false;
          }
          const isPostmasterOrAdmin = userProfile.role === "POSTMASTER" || userProfile.role === "ADMIN" || ((_b = userProfile.designationType) == null ? void 0 : _b.toLowerCase().includes("postmaster")) || ((_c = userProfile.designationType) == null ? void 0 : _c.toLowerCase().includes("spm")) || ((_d = userProfile.designationType) == null ? void 0 : _d.toLowerCase().includes("inspector"));
          if (!isPostmasterOrAdmin) {
            const allowedBeats = ((_e = userProfile.permissions) == null ? void 0 : _e.allowedBeats) || [userProfile.beat];
            const hasAllBeats = allowedBeats.includes("ALL") || allowedBeats.includes("All Beats");
            if (!hasAllBeats && allowedBeats.length > 0) {
              const beatMatch = allowedBeats.some(
                (ab) => ab.toLowerCase() === beat.beatNo.toLowerCase() || ab.toLowerCase() === `beat ${beat.beatNo}`.toLowerCase()
              );
              if (userProfile.role === "POSTMAN" && !beatMatch) {
                return false;
              }
            }
          }
        } else {
          if (!matchesDirectOffice) {
            return false;
          }
        }
      }
      if (selectedBeatFilter !== "ALL") {
        const cleanB = selectedBeatFilter.replace(/^Beat\s+/i, "").trim().toLowerCase();
        const matchesBeatNo = beat.beatNo.toLowerCase() === cleanB || `beat ${beat.beatNo}`.toLowerCase() === selectedBeatFilter.toLowerCase();
        const matchesColony = beat.areasCovered.some(
          (area) => area.toLowerCase().includes(selectedBeatFilter.toLowerCase())
        );
        if (!matchesBeatNo && !matchesColony) {
          return false;
        }
      }
      if (beatStatusFilter !== "ALL" && beat.status !== beatStatusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchBeatNo = beat.beatNo.toLowerCase().includes(q) || `beat ${beat.beatNo}`.toLowerCase().includes(q) || beat.name.toLowerCase().includes(q);
        const matchOffice = beat.postOfficeName.toLowerCase().includes(q) || beat.parentOffice.toLowerCase().includes(q) || beat.linkedDeliveryOffices.some((lo) => lo.toLowerCase().includes(q));
        const matchPin = beat.pincode.toLowerCase().includes(q);
        const matchPostman = beat.assignedPostman.toLowerCase().includes(q) || (beat.employeeId || "").toLowerCase().includes(q) || beat.contact.includes(q);
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
    searchQuery
  ]);
  const officeSummary = reactExports.useMemo(() => {
    const activeHub = effectiveOfficeFilter === "ALL" ? null : officeHubOptions.find((h) => h.officeId === effectiveOfficeFilter) || {
      officeId: nonAdminAssignedOffice.officeId,
      postOfficeName: nonAdminAssignedOffice.postOfficeName,
      officeType: nonAdminAssignedOffice.officeType,
      pincode: nonAdminAssignedOffice.pincode,
      parentOfficeName: nonAdminAssignedOffice.parentOfficeName,
      linkedDeliveryOffices: nonAdminAssignedOffice.linkedDeliveryOffices,
      completeAddress: `${nonAdminAssignedOffice.postOfficeName} - ${nonAdminAssignedOffice.pincode}`
    };
    const totalMappedBeats = filteredBeats.length;
    const linkedOfficesSet = /* @__PURE__ */ new Set();
    if (activeHub) {
      activeHub.linkedDeliveryOffices.forEach((lo) => linkedOfficesSet.add(lo));
    } else {
      officeHubOptions.forEach((h) => {
        if (h.officeType === "SO" || h.officeType === "BO") {
          linkedOfficesSet.add(`${h.postOfficeName} (${h.pincode})`);
        }
      });
    }
    const avgCoverage = filteredBeats.length > 0 ? (filteredBeats.reduce((acc, b) => acc + b.coverageValue, 0) / filteredBeats.length).toFixed(1) : "97.5";
    const matchingStaffProfiles = allStaffProfiles.filter((sp) => {
      if (effectiveOfficeFilter === "ALL") return true;
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
      parentOfficeName: activeHub ? `${activeHub.postOfficeName} (${activeHub.officeType})` : "Kota Division — All Delivery Hubs (HO / SO / BO)",
      pincode: activeHub ? activeHub.pincode : "324001 • 324009 • 324010 • 325003",
      higherParentHo: activeHub ? activeHub.parentOfficeName : "Rajasthan Postal Circle",
      totalMappedBeats,
      linkedDeliveryOffices: Array.from(linkedOfficesSet),
      totalCoveragePercentage: `${avgCoverage}%`,
      assignedDeliveryStaffCount: staffCount,
      completeAddress: activeHub ? activeHub.completeAddress : "Kota Head Post Office, Dadabari S.O., Engineering College S.O."
    };
  }, [
    effectiveOfficeFilter,
    officeHubOptions,
    nonAdminAssignedOffice,
    filteredBeats,
    allStaffProfiles
  ]);
  const beatsGroupedByOffice = reactExports.useMemo(() => {
    const groups = /* @__PURE__ */ new Map();
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
          beats: [beat]
        });
      } else {
        existing.beats.push(beat);
      }
    });
    return Array.from(groups.values());
  }, [filteredBeats]);
  const beatCustomers = reactExports.useMemo(() => {
    if (!selectedBeatForModal) return [];
    const bNo = selectedBeatForModal.beatNo;
    return customers.filter((c) => {
      const matchBeat = bNo === "2" ? c.beatNo === "2" || c.beatNo === "Beat 2" || !c.beatNo : c.beatNo === bNo || c.beatNo === `Beat ${bNo}` || bNo.startsWith("EC") && c.pincode === "324010";
      if (!matchBeat) return false;
      if (beatModalSearch.trim()) {
        const q = beatModalSearch.trim().toLowerCase();
        return (c.name || "").toLowerCase().includes(q) || (c.mobile || "").includes(q) || (c.houseNo || "").toLowerCase().includes(q) || (c.area || "").toLowerCase().includes(q) || (c.sector || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedBeatForModal, customers, beatModalSearch]);
  const handleOpenBroadcast = (beat) => {
    setBroadcastBeat(beat);
    const defaultText = `🇮🇳 *भारतीय डाक - बीट ${beat.beatNo} (${beat.postOfficeName} - ${beat.pincode}) विशेष सूचना*

आदरणीय निवासीगण (${beat.name}),
डाक विभाग (${beat.postOfficeName}) द्वारा आपके क्षेत्र में विशेष डोरस्टेप आधार अपडेशन (CELC), सुकन्या समृद्धि खाता (SSA), डाक जीवन बीमा (PLI/RPLI) एवं बचत खाता शिविर आयोजित किया जा रहा है।

📌 बीट डाकिया संपर्क: ${beat.assignedPostman} (${beat.contact})
📍 डाकघर: ${beat.postOfficeName} (PIN: ${beat.pincode})`;
    setBroadcastMessage(defaultText);
  };
  const handleCopyAllBeatMobiles = (beatNo) => {
    const list = customers.filter(
      (c) => beatNo === "2" ? c.beatNo === "2" || c.beatNo === "Beat 2" || !c.beatNo : c.beatNo === beatNo || c.beatNo === `Beat ${beatNo}`
    ).map((c) => c.mobile).filter(Boolean);
    navigator.clipboard.writeText(list.join(", "));
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2e3);
  };
  const renderBeatCard = (beat) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "bg-white rounded-2xl border border-slate-200 hover:border-red-300 hover:shadow-md transition p-5 flex flex-col justify-between",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-bold text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-lg border border-red-200", children: [
                "BEAT ",
                beat.beatNo
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: `font-mono font-bold text-[10px] px-2 py-0.5 rounded-md border ${beat.officeType === "BO" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-blue-50 text-blue-800 border-blue-200"}`,
                  children: [
                    beat.postOfficeName,
                    " • ",
                    beat.pincode
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full shrink-0", children: beat.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-slate-900 text-sm mb-1", children: beat.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-slate-500 mb-2 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 12, className: "text-slate-400 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Parent Hub: ",
              beat.parentOffice
            ] })
          ] }),
          beat.linkedDeliveryOffices.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 p-2 bg-slate-50/90 rounded-xl border border-slate-200/80", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { size: 11, className: "text-red-700" }),
              "Linked Delivery Offices (SO / BO):"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: beat.linkedDeliveryOffices.map((lo, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "text-[10px] font-semibold px-2 py-0.5 bg-white text-slate-700 rounded-md border border-slate-200",
                children: lo
              },
              idx
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 block text-[10px] font-semibold", children: "Customers" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black text-slate-900", children: beat.totalCustomers })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 block text-[10px] font-semibold", children: "Coverage" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black text-emerald-700", children: beat.confirmedCoverage })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400 block text-[10px] font-semibold", children: "Fixed Route" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-black text-slate-800", children: [
                beat.fixedKm,
                " KM"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-xs text-slate-700 mb-3 bg-red-50/40 p-2.5 rounded-xl border border-red-100/80", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-slate-500", children: "Assigned Staff:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-900 font-bold", children: beat.assignedPostman })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-500", children: "Official Mobile:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: `tel:${beat.contact}`,
                  className: "font-mono text-blue-700 font-semibold hover:underline flex items-center gap-1",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 11 }),
                    beat.contact
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-slate-500 block text-[11px] font-semibold mb-1", children: [
              "Mapped Colonies & Sectors (",
              beat.areasCovered.length,
              "):"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1", children: [
              beat.areasCovered.slice(0, 5).map((a, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium",
                  children: a
                },
                i
              )),
              beat.areasCovered.length > 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]", children: [
                "+",
                beat.areasCovered.length - 5,
                " more"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-3 mt-4 border-t border-slate-100 flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                setSelectedBeatForModal(beat);
                setBeatModalSearch("");
                if (onFilterBeat) onFilterBeat(beat.beatNo);
              },
              className: "w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 transition",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 14, className: "text-red-700" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "View Beat Customers (",
                  beat.totalCustomers,
                  ")"
                ] })
              ]
            }
          ),
          canDispatch && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => handleOpenBroadcast(beat),
                className: "flex-1 py-1.5 px-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition shadow-xs",
                title: "Broadcast notice to all residents in this beat",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { size: 13 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Bulk Broadcast" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  const firstCust = customers.find(
                    (c) => beat.beatNo === "2" ? c.beatNo === "2" || c.beatNo === "Beat 2" || !c.beatNo : c.beatNo === beat.beatNo || c.beatNo === `Beat ${beat.beatNo}`
                  );
                  setActiveMessageCustomer(firstCust || null);
                  setShowMessageModal(true);
                },
                className: "p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition",
                title: "Direct WhatsApp / SMS to beat",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 14 })
              }
            )
          ] })
        ] })
      ]
    },
    beat.id
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", id: "beat-management-view-root", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-slate-900 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Map$1, { size: 22, className: "text-red-700" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Postal Delivery Beats & Linked Office Management" })
            ] }),
            isSuperAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2.5 py-0.5 rounded-full text-[11px] font-black bg-red-100 text-red-800 border border-red-200 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 12 }),
              " Super Admin • Division-Wide Control"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 12 }),
              " Scoped to Assigned Office: ",
              nonAdminAssignedOffice.postOfficeName,
              " (",
              nonAdminAssignedOffice.pincode,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500 mt-1", children: [
            "Role-based delivery beat routing, linked Sub-Offices / Branch Offices (BOs), postman assignments, and bulk citizen broadcast (",
            filteredBeats.length,
            " Active Beats shown)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2.5", children: [
          isSuperAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 14, className: "text-emerald-700" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Cross-Division Admin Rights" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "px-3.5 py-1.5 bg-amber-50 border border-amber-300 rounded-xl text-xs flex items-center gap-2 text-amber-900 font-bold",
              id: "non-admin-locked-office-badge",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 13, className: "text-amber-700 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Locked to: ",
                  nonAdminAssignedOffice.postOfficeName,
                  " (PIN ",
                  nonAdminAssignedOffice.pincode,
                  ")"
                ] })
              ]
            }
          ),
          isActualSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 bg-amber-50/90 border border-amber-200 px-2.5 py-1.5 rounded-xl text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 13, className: "text-amber-700 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: simulateNonAdminOfficeId || "ADMIN_MODE",
                onChange: (e) => {
                  const val = e.target.value;
                  if (val === "ADMIN_MODE") {
                    setSimulateNonAdminOfficeId(null);
                  } else {
                    setSimulateNonAdminOfficeId(val);
                  }
                },
                className: "bg-transparent text-[11px] font-bold text-amber-900 focus:outline-none cursor-pointer",
                title: "Test how Non-Admin Staff / Postmasters see their restricted Post Office view",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ADMIN_MODE", children: "Role View: Super Admin (Full Access)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Dadabari S.O.", children: "Simulate Staff: Dadabari S.O. (Kota Div)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Baran H.O.", children: "Simulate Staff: Baran H.O. (Baran Div)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Jhalawar H.O.", children: "Simulate Staff: Jhalawar H.O. (Jhalawar Div)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Bundi H.O.", children: "Simulate Staff: Bundi H.O. (Bundi Div)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Tonk H.O.", children: "Simulate Staff: Tonk H.O. (Tonk Div)" })
                ]
              }
            )
          ] }),
          canDispatch ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                setActiveMessageCustomer(null);
                setShowMessageModal(true);
              },
              className: "px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs",
              id: "open-messaging-from-beats",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 14 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Direct Message" })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 13 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Dispatch Restricted" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { size: 13, className: "text-red-700" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Rajasthan Circle Administrative Hierarchy Filters" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-slate-500 font-semibold", children: [
              filteredBeats.length,
              " delivery beats matched"
            ] }),
            (selectedDivisionFilter !== "ALL" || selectedOfficeFilter !== "ALL" || selectedBeatFilter !== "ALL" || searchQuery) && isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => {
                  setSelectedDivisionFilter("ALL");
                  setSelectedOfficeFilter("ALL");
                  setSelectedBeatFilter("ALL");
                  setSearchQuery("");
                },
                className: "text-[11px] font-bold text-red-700 hover:underline flex items-center gap-1 cursor-pointer",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 11 }),
                  " Reset Filter"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1", children: "1. Postal Circle" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: selectedCircleFilter,
                onChange: (e) => setSelectedCircleFilter(e.target.value),
                disabled: !isSuperAdmin,
                className: "w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 disabled:bg-slate-100 disabled:text-slate-500 text-xs",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Rajasthan Circle", children: "Rajasthan Circle" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Circles (Pan-India)" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1", children: "2. Postal Division (District)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: selectedDivisionFilter,
                onChange: (e) => {
                  setSelectedDivisionFilter(e.target.value);
                  setSelectedOfficeFilter("ALL");
                  setSelectedBeatFilter("ALL");
                },
                disabled: !isSuperAdmin,
                className: "w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 disabled:bg-slate-100 disabled:text-slate-500 text-xs",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Divisions (Kota, Baran, Jhalawar, Bundi, Tonk)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Kota Division", children: "Kota Division (Kota District)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Baran Division", children: "Baran Division (Baran District)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Jhalawar Division", children: "Jhalawar Division (Jhalawar District)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Bundi Division", children: "Bundi Division (Bundi District)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Tonk Division", children: "Tonk Division (Tonk District)" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1", children: "3. Sub-Division / Post Office" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: selectedOfficeFilter,
                onChange: (e) => {
                  setSelectedOfficeFilter(e.target.value);
                  setSelectedBeatFilter("ALL");
                },
                disabled: !isSuperAdmin,
                className: "w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 disabled:bg-slate-100 disabled:text-slate-500 text-xs",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: selectedDivisionFilter === "ALL" ? "All Post Offices (Full Circle)" : `All Offices in ${selectedDivisionFilter}` }),
                  availableOfficesForDivision.map((hub) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: hub.officeId, children: [
                    hub.postOfficeName,
                    " (",
                    hub.pincode,
                    ") — ",
                    hub.officeType
                  ] }, hub.officeId))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1", children: "4. Delivery Beat / Colony" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: selectedBeatFilter,
                onChange: (e) => setSelectedBeatFilter(e.target.value),
                disabled: !isSuperAdmin && !!(userProfile == null ? void 0 : userProfile.beat) && userProfile.beat !== "All Beats",
                className: "w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 disabled:bg-slate-100 disabled:text-slate-500 text-xs",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ALL", children: "All Delivery Beats & Colonies" }),
                  availableBeatsForSelection.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: b.beatNo, children: [
                    "Beat ",
                    b.beatNo,
                    " — ",
                    b.assignedPostman || b.name
                  ] }, b.id || b.beatNo))
                ]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Search,
            {
              size: 15,
              className: "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              id: "beat-office-quick-search",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              placeholder: "Quick Search by Office Name (Dadabari, Engg College), Pincode (324009, 324010), Beat No., or Colony...",
              className: "w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
            }
          ),
          searchQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setSearchQuery(""),
              className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
          isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-1 mr-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setSelectedOfficeFilter("ALL"),
                className: `px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${selectedOfficeFilter === "ALL" ? "bg-red-700 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`,
                children: "All Offices"
              }
            ),
            officeHubOptions.slice(0, 4).map((hub) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setSelectedOfficeFilter(hub.officeId),
                className: `px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${selectedOfficeFilter === hub.officeId ? "bg-red-700 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`,
                children: [
                  hub.postOfficeName,
                  " (",
                  hub.pincode,
                  ")"
                ]
              },
              hub.officeId
            ))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setGroupByOffice((prev) => !prev),
              className: `px-2.5 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1 transition ${groupByOffice ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}`,
              title: "Toggle Office-wise Grouping",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 12 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: groupByOffice ? "Grouped by Office" : "Flat Grid" })
              ]
            }
          ),
          (searchQuery || isSuperAdmin && selectedOfficeFilter !== "ALL") && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                setSearchQuery("");
                if (isSuperAdmin) setSelectedOfficeFilter("ALL");
              },
              className: "px-2.5 py-1.5 text-[11px] font-bold text-red-700 hover:bg-red-50 rounded-xl flex items-center gap-1 transition",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 12 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Reset" })
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white p-5 rounded-3xl shadow-lg border border-red-900/40",
        id: "office-beat-delivery-summary-bar",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { size: 22 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30", children: "Office Beat & Delivery Link Summary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-mono text-emerald-300 font-bold", children: [
                    "PIN: ",
                    officeSummary.pincode
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black tracking-tight text-white mt-1", children: officeSummary.parentOfficeName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-300 mt-0.5", children: [
                  "Parent Controlling Hub: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-amber-300", children: officeSummary.higherParentHo }),
                  " • ",
                  officeSummary.completeAddress
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setShowOfficeMappingDrawer(true),
                className: "px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md self-start lg:self-auto shrink-0",
                id: "open-office-beat-mapping-drawer",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 15 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Office & Beat Mapping Drawer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/5 border border-white/10 rounded-2xl p-3.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-400 font-semibold flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 13, className: "text-amber-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Parent Office & PIN Code" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black text-white mt-1 truncate", children: officeSummary.parentOfficeName }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-mono text-amber-300 mt-0.5", children: [
                "PIN: ",
                officeSummary.pincode
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/5 border border-white/10 rounded-2xl p-3.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-400 font-semibold flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { size: 13, className: "text-emerald-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total Mapped Beats" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-black text-emerald-400 mt-0.5", children: [
                officeSummary.totalMappedBeats,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-slate-300", children: "Active Beats" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-300 mt-0.5 truncate", children: filteredBeats.map((b) => `Beat ${b.beatNo}`).join(", ") || "No matching beats" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/5 border border-white/10 rounded-2xl p-3.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-400 font-semibold flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(GitBranch, { size: 13, className: "text-sky-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Linked Delivery SOs / BOs" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mt-1.5", children: officeSummary.linkedDeliveryOffices.map((lo, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  onClick: () => {
                    if (isSuperAdmin) {
                      const matched = officeHubOptions.find(
                        (h) => lo.toLowerCase().includes(h.postOfficeName.toLowerCase())
                      );
                      if (matched) setSelectedOfficeFilter(matched.officeId);
                    }
                  },
                  className: `px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-500/20 text-sky-200 border border-sky-400/30 ${isSuperAdmin ? "cursor-pointer hover:bg-sky-500/30" : ""}`,
                  title: isSuperAdmin ? "Click to filter by this Linked Office" : lo,
                  children: lo
                },
                idx
              )) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white/5 border border-white/10 rounded-2xl p-3.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-400 font-semibold flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 13, className: "text-amber-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Coverage & Delivery Staff" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline justify-between mt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-black text-amber-400", children: officeSummary.totalCoveragePercentage }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-300 block", children: "Doorstep Coverage" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-black text-white", children: officeSummary.assignedDeliveryStaffCount }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-emerald-300 block font-semibold", children: "Assigned Staff" })
                ] })
              ] })
            ] })
          ] })
        ]
      }
    ),
    filteredBeats.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 22 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-bold text-slate-900", children: "No Delivery Beats Match Your Current Filter" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 max-w-md mx-auto", children: "Try clearing your search query or switching the Post Office / Delivery Hub filter to view available beats." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            setSearchQuery("");
            setBeatStatusFilter("ALL");
            if (isSuperAdmin) setSelectedOfficeFilter("ALL");
          },
          className: "px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition",
          children: "Reset All Filters"
        }
      )
    ] }) : groupByOffice ? (
      /* Office-Wise Grouped Beats Layout */
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: beatsGroupedByOffice.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-slate-100/70 rounded-3xl p-4 sm:p-5 border border-slate-200/90 space-y-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: `px-2.5 py-1 rounded-xl text-xs font-black ${group.officeType === "BO" ? "bg-amber-400 text-slate-950" : "bg-red-700 text-white"}`,
                    children: [
                      group.officeType,
                      " HUB"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-base font-black text-slate-900", children: [
                  group.postOfficeName,
                  " (PIN ",
                  group.pincode,
                  ")"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-slate-500 font-medium", children: [
                  "• Parent: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: group.parentOffice })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-xl border border-slate-200", children: [
                  group.beats.length,
                  " ",
                  group.beats.length === 1 ? "Beat" : "Beats",
                  " Mapped"
                ] }),
                group.linkedDeliveryOffices.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200", children: [
                  "Linked: ",
                  group.linkedDeliveryOffices.join(", ")
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5", children: group.beats.map((beat) => renderBeatCard(beat)) })
          ]
        },
        group.officeId
      )) })
    ) : (
      /* Flat Beats Cards Grid */
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5", children: filteredBeats.map((beat) => renderBeatCard(beat)) })
    ),
    showOfficeMappingDrawer && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 bg-gradient-to-r from-slate-900 via-red-900 to-slate-900 text-white flex items-center justify-between shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-400 text-slate-950", children: "Official India Post Delivery Hierarchy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black mt-1", children: "Office Beat & Linked Delivery Hub Mapping Directory" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-100 mt-0.5", children: "Parent Office Name & PIN Code, Linked Sub-Offices / Branch Offices (BOs), and Beat Coverage Matrix" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowOfficeMappingDrawer(false),
            className: "p-2 hover:bg-white/10 rounded-full transition text-white",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 overflow-y-auto space-y-5 flex-1 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: officeHubOptions.filter(
          (h) => effectiveOfficeFilter === "ALL" || h.officeId === effectiveOfficeFilter || officeSummary.linkedDeliveryOffices.some(
            (lo) => lo.toLowerCase().includes(h.postOfficeName.toLowerCase())
          )
        ).map((hub) => {
          const hubBeats = allBeats.filter((b) => b.officeId === hub.officeId);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `px-2 py-0.5 rounded font-black text-[10px] ${hub.officeType === "BO" ? "bg-amber-100 text-amber-900 border border-amber-300" : hub.officeType === "HO" ? "bg-red-100 text-red-800 border border-red-200" : "bg-blue-100 text-blue-800 border border-blue-200"}`,
                        children: hub.officeType
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-slate-900 text-sm", children: hub.postOfficeName })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100", children: [
                    "PIN ",
                    hub.pincode
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-slate-600", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Parent Office:" }),
                  " ",
                  hub.parentOfficeName
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-500", children: hub.completeAddress }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase text-slate-400 block mb-1", children: "Linked Delivery Sub-Offices / Branch Offices:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: hub.linkedDeliveryOffices.map((lo, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-semibold text-slate-700",
                      children: lo
                    },
                    i
                  )) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-slate-700", children: [
                    "Mapped Beats: ",
                    hubBeats.length
                  ] }),
                  isSuperAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => {
                        setSelectedOfficeFilter(hub.officeId);
                        setShowOfficeMappingDrawer(false);
                      },
                      className: "text-red-700 font-bold hover:underline flex items-center gap-1",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Filter to this Office" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 12 })
                      ]
                    }
                  )
                ] })
              ]
            },
            hub.officeId
          );
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-black text-slate-900 text-sm mb-2.5", children: [
            "Active Beat & Delivery Staff Mapping Table (",
            filteredBeats.length,
            " Beats)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto border border-slate-200 rounded-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-slate-100 text-slate-600 uppercase text-[10px] border-b border-slate-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Beat No." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Post Office & PIN" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Parent Office / Linked BOs" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3", children: "Assigned Delivery Staff" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-center", children: "Fixed KM" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-3 text-center", children: "Coverage" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-slate-100", children: filteredBeats.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-slate-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3 font-mono font-bold text-red-700", children: [
                "Beat ",
                b.beatNo
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900", children: b.postOfficeName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-[10px] text-slate-500", children: [
                  "PIN ",
                  b.pincode
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-slate-800", children: b.parentOffice }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-slate-500", children: [
                  "Linked: ",
                  b.linkedDeliveryOffices.join(", ")
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-slate-900", children: b.assignedPostman }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] text-blue-700", children: b.contact })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-3 text-center font-mono font-bold", children: [
                b.fixedKm,
                " KM"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]", children: b.confirmedCoverage }) })
            ] }, b.id)) })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-slate-50 border-t border-slate-200 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setShowOfficeMappingDrawer(false),
          className: "px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold",
          children: "Close Mapping Drawer"
        }
      ) })
    ] }) }),
    selectedBeatForModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 bg-gradient-to-r from-red-800 to-red-700 text-white flex items-center justify-between shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold", children: [
              "Beat ",
              selectedBeatForModal.beatNo,
              " (",
              selectedBeatForModal.postOfficeName,
              ") — Customers Directory"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs bg-white text-red-800 font-mono font-bold px-2 py-0.5 rounded", children: [
              beatCustomers.length,
              " Verified"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-100 mt-0.5", children: [
            "Parent Hub: ",
            selectedBeatForModal.parentOffice,
            " • Postman: ",
            selectedBeatForModal.assignedPostman,
            " (",
            selectedBeatForModal.contact,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setSelectedBeatForModal(null),
            className: "p-2 hover:bg-white/10 rounded-full transition text-white",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 max-w-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Search,
            {
              size: 13,
              className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: beatModalSearch,
              onChange: (e) => setBeatModalSearch(e.target.value),
              placeholder: "Filter customers in this beat...",
              className: "w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => handleCopyAllBeatMobiles(selectedBeatForModal.beatNo),
            className: "px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 flex items-center gap-1.5 transition",
            children: [
              copiedBatch ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 13, className: "text-emerald-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 13 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: copiedBatch ? "Copied Mobile Numbers!" : "Copy All Beat Phone Numbers" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 overflow-y-auto divide-y divide-slate-100 flex-1", children: beatCustomers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-10 text-center text-xs text-slate-500", children: [
        "No customers currently mapped to Beat ",
        selectedBeatForModal.beatNo,
        " matching your filter."
      ] }) : beatCustomers.slice(0, 60).map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-slate-900 text-sm", children: c.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono font-semibold bg-slate-100 px-1.5 py-0.2 rounded text-slate-600", children: c.masterId || c.id })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-slate-500 mt-0.5", children: [
                "H.No ",
                c.houseNo || "NA",
                ",",
                " ",
                c.sector ? `Sector ${c.sector}` : c.area || selectedBeatForModal.postOfficeName
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-mono text-slate-700 mt-0.5", children: [
                "📞 ",
                c.mobile || "No Mobile"
              ] })
            ] }),
            canDispatch && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => {
                  setActiveMessageCustomer(c);
                  setShowMessageModal(true);
                },
                className: "px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition flex items-center gap-1.5",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 14, className: "text-emerald-700" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Send Message / Chat" })
                ]
              }
            ) })
          ]
        },
        c.id || c.masterId || i
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 bg-slate-50 border-t border-slate-200 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSelectedBeatForModal(null),
          className: "px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl",
          children: "Close"
        }
      ) })
    ] }) }),
    broadcastBeat && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 bg-gradient-to-r from-red-800 to-red-700 text-white flex items-center justify-between shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { size: 20, className: "animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold", children: "Beat-wise Bulk Broadcast Engine" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-100", children: [
              "Disseminate official notices across ",
              broadcastBeat.name,
              " (",
              broadcastBeat.postOfficeName,
              ")"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setBroadcastBeat(null),
            className: "p-2 hover:bg-white/10 rounded-full transition text-white",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 })
          }
        )
      ] }),
      broadcastStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-emerald-600 text-white px-5 py-2.5 text-xs font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: broadcastStatus })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 space-y-4 overflow-y-auto flex-1 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-slate-900", children: [
              "Target: ",
              broadcastBeat.name,
              " (",
              broadcastBeat.postOfficeName,
              " • PIN ",
              broadcastBeat.pincode,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-slate-500 mt-0.5", children: [
              "Assigned Postman: ",
              broadcastBeat.assignedPostman,
              " (",
              broadcastBeat.contact,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold px-2.5 py-1 bg-red-100 text-red-800 rounded-lg", children: [
            broadcastBeat.totalCustomers,
            " Recipients"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block font-bold text-slate-800 mb-1.5", children: "Broadcast Notice Content (प्रसारण सूचना):" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              rows: 6,
              value: broadcastMessage,
              onChange: (e) => setBroadcastMessage(e.target.value),
              className: "w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-none leading-relaxed text-slate-900"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 16, className: "shrink-0 text-amber-600 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Broadcast Workflow Tip:" }),
            " You can copy all",
            " ",
            broadcastBeat.totalCustomers,
            " mobile numbers directly into official India Post SMS Gateway or WhatsApp Broadcast list."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => handleCopyAllBeatMobiles(broadcastBeat.beatNo),
            className: "px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { size: 14 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Copy All ",
                broadcastBeat.totalCustomers,
                " Numbers"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              customerService.addCommunicationLog({
                recipientName: `Beat ${broadcastBeat.beatNo} (${broadcastBeat.postOfficeName}) Broadcast Group`,
                mobile: "Broadcast",
                channel: "Broadcast",
                type: "Beat Broadcast",
                content: broadcastMessage,
                status: "Delivered",
                beatNo: broadcastBeat.beatNo
              });
              setBroadcastStatus("WhatsApp प्रसारण संदेश क्यू और लॉग में दर्ज किया गया!");
              setTimeout(() => setBroadcastStatus(null), 2500);
            },
            className: "px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 14 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Log & Dispatch Broadcast" })
            ]
          }
        ) })
      ] })
    ] }) }),
    showMessageModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      DirectMessageModal,
      {
        isOpen: showMessageModal,
        onClose: () => {
          setShowMessageModal(false);
          setActiveMessageCustomer(null);
        },
        initialCustomer: activeMessageCustomer
      }
    )
  ] });
}
export {
  BeatManagementView as default
};
