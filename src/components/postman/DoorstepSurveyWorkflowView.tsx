import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardList,
  Download,
  MapPin,
  Navigation,
  Search,
  Sticker,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { locationSurveyService } from '../../services/locationSurveyService';
import { customerService } from '../../services/customerService';
import { dataGovernanceService } from '../../services/dataGovernanceService';
import { KOTA_POST_OFFICE_OPTIONS } from '../../data/officesData';
import {
  Customer,
  CustomerVerificationStatus,
  CustomerVerificationSurveyRecord,
  DistributionItemType,
  PropertySurveyRecord,
  PropertySurveyType,
  StickerVisitingCardDistributionRecord,
} from '../../types/models';

type SurveyTab = 'PROPERTIES' | 'CUSTOMER_VERIFICATION' | 'DISTRIBUTION';

const CORE_REGIONAL_PINCODES = [
  '324001',
  '324002',
  '324003',
  '324004',
  '324005',
  '324006',
  '324007',
  '324008',
  '324009',
  '324010',
  '325001',
  '325003',
  '325205',
];

const KOTA_ALL_OFFICE_PINCODES = Array.from(
  new Set([...CORE_REGIONAL_PINCODES, ...KOTA_POST_OFFICE_OPTIONS.map((o) => o.pincode)])
);

const PROPERTY_TYPES: PropertySurveyType[] = [
  'Residential',
  'Commercial',
  'Coaching',
  'Institution',
  'Hostel',
  'Mixed',
];

const VERIFICATION_STATUSES: CustomerVerificationStatus[] = [
  'Pending',
  'Verified',
  'Mismatch',
  'Unreachable',
];

const DISTRIBUTION_CATEGORIES: StickerVisitingCardDistributionRecord['recipientCategory'][] = [
  'Household',
  'Shop / Merchant',
  'Coaching / Hostel',
  'Office / Institution',
];

export default function DoorstepSurveyWorkflowView() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<SurveyTab>('PROPERTIES');
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Live collections
  const [propertySurveys, setPropertySurveys] = useState<PropertySurveyRecord[]>([]);
  const [customerVerifications, setCustomerVerifications] = useState<
    CustomerVerificationSurveyRecord[]
  >([]);
  const [distributionRecords, setDistributionRecords] = useState<
    StickerVisitingCardDistributionRecord[]
  >([]);
  const [scopedCustomers, setScopedCustomers] = useState<Customer[]>([]);

  const canVerify = locationSurveyService.canSupervisorVerifySurvey(userProfile);
  const defaultPincode = userProfile?.officePincode || userProfile?.pincode || '324009';
  const defaultBeat =
    userProfile?.beat && userProfile.beat !== 'All Beats' ? userProfile.beat : 'Beat 2';
  const defaultOffice = userProfile?.subOffice || 'Dadabari S.O.';

  useEffect(() => {
    const sync = () => {
      setPropertySurveys(locationSurveyService.getPropertySurveys(userProfile));
      setCustomerVerifications(locationSurveyService.getCustomerVerifications(userProfile));
      setDistributionRecords(locationSurveyService.getDistributionRecords(userProfile));
      setScopedCustomers(customerService.getScopedCustomers(userProfile));
    };
    sync();
    const unsubSurvey = locationSurveyService.subscribe(sync);
    const unsubCust = customerService.subscribe(sync);
    return () => {
      unsubSurvey();
      unsubCust();
    };
  }, [userProfile]);

  const showNotice = (type: 'ok' | 'err', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  };

  // ============================================================================
  // TAB 1: PROPERTIES FORM STATE
  // ============================================================================
  const [propType, setPropType] = useState<PropertySurveyType>('Residential');
  const [propHouseNo, setPropHouseNo] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propColony, setPropColony] = useState('Dadabari Extension');
  const [propLandmark, setPropLandmark] = useState('');
  const [propOwnerName, setPropOwnerName] = useState('');
  const [propOwnerMobile, setPropOwnerMobile] = useState('');
  const [propPincode, setPropPincode] = useState(defaultPincode);
  const [propBeat, setPropBeat] = useState(defaultBeat);
  const [propNotes, setPropNotes] = useState('');
  const [propLat, setPropLat] = useState<number | undefined>(undefined);
  const [propLng, setPropLng] = useState<number | undefined>(undefined);
  const [propStatus, setPropStatus] =
    useState<PropertySurveyRecord['verificationStatus']>('Verification Pending');

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      showNotice('err', 'GPS unavailable on this device. You may continue saving without GPS.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPropLat(Number(pos.coords.latitude.toFixed(6)));
        setPropLng(Number(pos.coords.longitude.toFixed(6)));
        showNotice('ok', 'Optional GPS coordinates attached to property survey.');
      },
      () => {
        showNotice('err', 'Location permission declined or unavailable; saving remains unblocked.');
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const handleSavePropertySurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propHouseNo.trim() || !propAddress.trim() || !propOwnerName.trim()) {
      showNotice('err', 'Enter House/Building No, Full Address, and Owner/Occupant Name.');
      return;
    }
    const saved = locationSurveyService.upsertPropertySurvey({
      propertyType: propType,
      houseOrBuildingNo: propHouseNo.trim(),
      address: propAddress.trim(),
      colony: propColony.trim() || 'Dadabari Extension',
      landmark: propLandmark.trim() || undefined,
      ownerOrOccupantName: propOwnerName.trim(),
      ownerOrOccupantMobile: propOwnerMobile.replace(/\D/g, '').slice(-10) || undefined,
      officePincode: propPincode.trim() || defaultPincode,
      officeName: defaultOffice,
      beatNo: propBeat.trim() || defaultBeat,
      latitude: propLat,
      longitude: propLng,
      gpsStatus: propLat !== undefined && propLng !== undefined ? 'CAPTURED' : 'NOT_CAPTURED',
      verificationStatus: propStatus,
      notes: propNotes.trim() || undefined,
      surveyedById: userProfile?.employeeId || userProfile?.id || 'STAFF-01',
      surveyedByName: userProfile?.name || 'India Post Staff',
    });

    setPropHouseNo('');
    setPropAddress('');
    setPropLandmark('');
    setPropOwnerName('');
    setPropOwnerMobile('');
    setPropNotes('');
    setPropLat(undefined);
    setPropLng(undefined);
    showNotice('ok', `Saved property survey ${saved.id} (${saved.houseOrBuildingNo}).`);
  };

  // ============================================================================
  // TAB 2: CUSTOMER VERIFICATION FORM STATE
  // ============================================================================
  const [selectedCustId, setSelectedCustId] = useState('');
  const [cvName, setCvName] = useState('');
  const [cvMobile, setCvMobile] = useState('');
  const [cvHouseRef, setCvHouseRef] = useState('');
  const [cvColony, setCvColony] = useState('Dadabari Extension');
  const [cvPincode, setCvPincode] = useState(defaultPincode);
  const [cvBeat, setCvBeat] = useState(defaultBeat);
  const [cvIdVerified, setCvIdVerified] = useState(true);
  const [cvAddressVerified, setCvAddressVerified] = useState(true);
  const [cvOccupancyVerified, setCvOccupancyVerified] = useState(true);
  const [cvStatus, setCvStatus] = useState<CustomerVerificationStatus>('Verified');
  const [cvRemarks, setCvRemarks] = useState('');

  const handleSelectExistingCustomer = (custId: string) => {
    setSelectedCustId(custId);
    const match = scopedCustomers.find((c) => c.id === custId);
    if (!match) return;
    setCvName(match.name || '');
    setCvMobile(match.mobile || '');
    setCvHouseRef(match.houseNo || '');
    setCvColony(match.colony || match.area || 'Dadabari Extension');
    setCvPincode(match.pincode || defaultPincode);
    setCvBeat(match.beatNo || defaultBeat);
  };

  const handleSaveCustomerVerification = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = cvName.trim();
    const cleanMobile = cvMobile.replace(/\D/g, '').slice(-10);
    if (!cleanName || cleanMobile.length < 10) {
      showNotice('err', 'Enter Customer Name and a valid 10-digit Mobile number.');
      return;
    }

    const saved = locationSurveyService.upsertCustomerVerification({
      customerId: selectedCustId || undefined,
      customerName: cleanName,
      customerMobile: cleanMobile,
      houseOrPropertyRef: cvHouseRef.trim() || undefined,
      colony: cvColony.trim() || 'Dadabari Extension',
      officePincode: cvPincode.trim() || defaultPincode,
      beatNo: cvBeat.trim() || defaultBeat,
      idVerified: cvIdVerified,
      addressVerified: cvAddressVerified,
      occupancyVerified: cvOccupancyVerified,
      verificationStatus: cvStatus,
      remarks: cvRemarks.trim() || undefined,
      verifiedByStaffId: userProfile?.employeeId || userProfile?.id || 'STAFF-01',
      verifiedByStaffName: userProfile?.name || 'India Post Staff',
      verifiedAt: cvStatus === 'Verified' ? new Date().toISOString() : undefined,
    });

    setSelectedCustId('');
    setCvName('');
    setCvMobile('');
    setCvHouseRef('');
    setCvRemarks('');
    showNotice('ok', `Logged customer verification ${saved.id} (${saved.verificationStatus}).`);
  };

  // ============================================================================
  // TAB 3: STICKER & VISITING CARD DISTRIBUTION FORM STATE
  // ============================================================================
  const [distItemType, setDistItemType] = useState<DistributionItemType>('Both');
  const [distQuantity, setDistQuantity] = useState(2);
  const [distRecipientName, setDistRecipientName] = useState('');
  const [distRecipientCategory, setDistRecipientCategory] =
    useState<StickerVisitingCardDistributionRecord['recipientCategory']>('Shop / Merchant');
  const [distMobile, setDistMobile] = useState('');
  const [distHouseOrShopNo, setDistHouseOrShopNo] = useState('');
  const [distColony, setDistColony] = useState('Dadabari Extension');
  const [distPincode, setDistPincode] = useState(defaultPincode);
  const [distBeat, setDistBeat] = useState(defaultBeat);
  const [distDate, setDistDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [distNotes, setDistNotes] = useState('');

  const handleSaveDistribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!distRecipientName.trim() || !distHouseOrShopNo.trim() || distQuantity < 1) {
      showNotice('err', 'Enter Recipient Name, House/Shop No, and Quantity (minimum 1).');
      return;
    }

    const saved = locationSurveyService.upsertDistributionRecord({
      itemType: distItemType,
      quantity: Number(distQuantity) || 1,
      recipientName: distRecipientName.trim(),
      recipientCategory: distRecipientCategory,
      recipientMobile: distMobile.replace(/\D/g, '').slice(-10) || undefined,
      houseOrShopNo: distHouseOrShopNo.trim(),
      colony: distColony.trim() || 'Dadabari Extension',
      officePincode: distPincode.trim() || defaultPincode,
      beatNo: distBeat.trim() || defaultBeat,
      distributionDate: distDate || new Date().toISOString().split('T')[0],
      notes: distNotes.trim() || undefined,
      distributedByStaffId: userProfile?.employeeId || userProfile?.id || 'STAFF-01',
      distributedByStaffName: userProfile?.name || 'India Post Staff',
    });

    setDistRecipientName('');
    setDistMobile('');
    setDistHouseOrShopNo('');
    setDistNotes('');
    setDistQuantity(2);
    showNotice(
      'ok',
      `Recorded ${saved.itemType} distribution (${saved.quantity} pcs) for ${saved.recipientName}.`
    );
  };

  // Filtered views
  const filteredProperties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return propertySurveys;
    return propertySurveys.filter((p) =>
      `${p.houseOrBuildingNo} ${p.address} ${p.colony} ${p.ownerOrOccupantName} ${p.officePincode} ${p.beatNo}`
        .toLowerCase()
        .includes(q)
    );
  }, [propertySurveys, searchQuery]);

  const filteredVerifications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return customerVerifications;
    return customerVerifications.filter((v) =>
      `${v.customerName} ${v.customerMobile} ${v.colony} ${v.officePincode} ${v.beatNo}`
        .toLowerCase()
        .includes(q)
    );
  }, [customerVerifications, searchQuery]);

  const filteredDistributions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return distributionRecords;
    return distributionRecords.filter((d) =>
      `${d.recipientName} ${d.houseOrShopNo} ${d.colony} ${d.itemType} ${d.officePincode} ${d.beatNo}`
        .toLowerCase()
        .includes(q)
    );
  }, [distributionRecords, searchQuery]);

  const totalItemsDistributed = useMemo(
    () => distributionRecords.reduce((sum, d) => sum + (d.quantity || 0), 0),
    [distributionRecords]
  );

  const handleExportCurrentTabCsv = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    if (activeTab === 'PROPERTIES') {
      const rows = filteredProperties.map((p) => ({
        SurveyID: p.id,
        PropertyType: p.propertyType,
        HouseOrBuildingNo: p.houseOrBuildingNo,
        Address: p.address,
        Colony: p.colony,
        Landmark: p.landmark || '',
        OwnerOrOccupant: p.ownerOrOccupantName,
        Mobile: p.ownerOrOccupantMobile || '',
        PIN: p.officePincode,
        Beat: p.beatNo,
        GpsStatus: p.gpsStatus,
        Status: p.verificationStatus,
        SurveyedBy: p.surveyedByName,
      }));
      dataGovernanceService.exportRowsToCsvWithBom(
        rows,
        `india-post-property-surveys-${stamp}.csv`,
        'PropertySurveys',
        userProfile,
        `Count=${rows.length}`
      );
      showNotice('ok', `Exported ${rows.length} property survey rows to CSV.`);
    } else if (activeTab === 'CUSTOMER_VERIFICATION') {
      const rows = filteredVerifications.map((v) => ({
        VerificationID: v.id,
        CustomerName: v.customerName,
        Mobile: v.customerMobile,
        HouseRef: v.houseOrPropertyRef || '',
        Colony: v.colony,
        PIN: v.officePincode,
        Beat: v.beatNo,
        IDVerified: v.idVerified ? 'YES' : 'NO',
        AddressVerified: v.addressVerified ? 'YES' : 'NO',
        OccupancyVerified: v.occupancyVerified ? 'YES' : 'NO',
        Status: v.verificationStatus,
        VerifiedBy: v.verifiedByStaffName,
        VerifiedAt: v.verifiedAt || '',
      }));
      dataGovernanceService.exportRowsToCsvWithBom(
        rows,
        `india-post-customer-verifications-${stamp}.csv`,
        'CustomerVerifications',
        userProfile,
        `Count=${rows.length}`
      );
      showNotice('ok', `Exported ${rows.length} customer verification rows to CSV.`);
    } else {
      const rows = filteredDistributions.map((d) => ({
        DistributionID: d.id,
        ItemType: d.itemType,
        Quantity: d.quantity,
        RecipientName: d.recipientName,
        Category: d.recipientCategory,
        Mobile: d.recipientMobile || '',
        HouseOrShopNo: d.houseOrShopNo,
        Colony: d.colony,
        PIN: d.officePincode,
        Beat: d.beatNo,
        Date: d.distributionDate,
        DistributedBy: d.distributedByStaffName,
      }));
      dataGovernanceService.exportRowsToCsvWithBom(
        rows,
        `india-post-sticker-card-distribution-${stamp}.csv`,
        'StickerDistribution',
        userProfile,
        `Count=${rows.length}`
      );
      showNotice('ok', `Exported ${rows.length} distribution rows to CSV.`);
    }
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Header Banner */}
      <div className="bg-[#0A1628] text-white rounded-xl border border-slate-800 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">
              INDIA POST FIELD SURVEY · {defaultOffice.toUpperCase()} ({defaultPincode})
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5 flex items-center gap-2">
              <ClipboardList size={22} className="text-red-400" />
              <span>Beat Survey, Customer Verification &amp; Promotion Hub</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Scoped to {userProfile?.name || 'Beat Staff'} ({defaultBeat}) — synced automatically with Data Backup &amp; Master Export Center.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleExportCurrentTabCsv}
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} />
              <span>Export Current Tab CSV</span>
            </button>
          </div>
        </div>

        {/* 3 Dedicated Survey Tabs */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('PROPERTIES')}
            className={`px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'PROPERTIES'
                ? 'bg-[#991B1B] text-white'
                : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Building2 size={14} />
            <span>01. Properties</span>
            <span className="px-1.5 py-0.5 rounded bg-black/25 font-mono text-[11px] tabular-nums">
              {propertySurveys.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CUSTOMER_VERIFICATION')}
            className={`px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'CUSTOMER_VERIFICATION'
                ? 'bg-[#991B1B] text-white'
                : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
            }`}
          >
            <UserCheck size={14} />
            <span>02. Customer Verification</span>
            <span className="px-1.5 py-0.5 rounded bg-black/25 font-mono text-[11px] tabular-nums">
              {customerVerifications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DISTRIBUTION')}
            className={`px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'DISTRIBUTION'
                ? 'bg-[#991B1B] text-white'
                : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Sticker size={14} />
            <span>03. Sticker &amp; Visiting Card Distribution</span>
            <span className="px-1.5 py-0.5 rounded bg-black/25 font-mono text-[11px] tabular-nums">
              {totalItemsDistributed} pcs
            </span>
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`px-4 py-2.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${
            notice.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {notice.type === 'ok' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Search Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by house/shop no, name, colony, PIN, or beat..."
            className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-900"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-600">
          <span>Properties: {propertySurveys.length}</span>
          <span>Verified Customers: {customerVerifications.filter((v) => v.verificationStatus === 'Verified').length}</span>
          <span>Distributed Units: {totalItemsDistributed}</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: PROPERTIES SURVEY                                             */}
      {/* ==================================================================== */}
      {activeTab === 'PROPERTIES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <form
            onSubmit={handleSavePropertySurvey}
            className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-3 text-xs"
          >
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Building2 size={16} className="text-[#991B1B]" />
              <span>Log Doorstep Property Survey</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Property Type *</label>
                <select
                  value={propType}
                  onChange={(e) => setPropType(e.target.value as PropertySurveyType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold bg-white"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">House / Building No *</label>
                <input
                  required
                  value={propHouseNo}
                  onChange={(e) => setPropHouseNo(e.target.value)}
                  placeholder="e.g. Plot 42 / Shop 7"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Street / Full Address *</label>
              <input
                required
                value={propAddress}
                onChange={(e) => setPropAddress(e.target.value)}
                placeholder="e.g. Sector 6 Main Road, Near Shiv Mandir"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Colony / Locality</label>
                <input
                  value={propColony}
                  onChange={(e) => setPropColony(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Landmark</label>
                <input
                  value={propLandmark}
                  onChange={(e) => setPropLandmark(e.target.value)}
                  placeholder="Optional landmark"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Owner / Occupant Name *</label>
                <input
                  required
                  value={propOwnerName}
                  onChange={(e) => setPropOwnerName(e.target.value)}
                  placeholder="e.g. Suresh Verma"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Mobile</label>
                <input
                  value={propOwnerMobile}
                  onChange={(e) => setPropOwnerMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Office PIN *</label>
                <select
                  value={propPincode}
                  onChange={(e) => setPropPincode(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono font-bold bg-white"
                >
                  {KOTA_ALL_OFFICE_PINCODES.map((pin) => (
                    <option key={pin} value={pin}>
                      {pin}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Beat *</label>
                <input
                  required
                  value={propBeat}
                  onChange={(e) => setPropBeat(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={propStatus}
                  onChange={(e) =>
                    setPropStatus(e.target.value as PropertySurveyRecord['verificationStatus'])
                  }
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg font-semibold bg-white"
                >
                  <option value="Verification Pending">Pending Verification</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Verified">Verified</option>
                </select>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
              <div className="text-[11px] font-mono text-slate-600 truncate">
                {propLat !== undefined && propLng !== undefined
                  ? `GPS: ${propLat}, ${propLng}`
                  : 'Optional GPS (Non-blocking)'}
              </div>
              <button
                type="button"
                onClick={handleCaptureGps}
                className="px-2.5 py-1.5 rounded bg-slate-900 text-white font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Navigation size={12} /> Capture GPS
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Field Notes</label>
              <textarea
                rows={2}
                value={propNotes}
                onChange={(e) => setPropNotes(e.target.value)}
                placeholder="Building access, parcel volume potential, or verification notes..."
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#991B1B] hover:bg-red-800 text-white rounded-lg font-bold cursor-pointer"
            >
              Save Property Survey Record
            </button>
          </form>

          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900">
                Property Survey Registry ({filteredProperties.length})
              </h2>
              <span className="text-[11px] font-mono text-slate-500">
                {canVerify ? 'Supervisor Verification Enabled' : 'Beat Field View'}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredProperties.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-950 text-sm">
                        {p.houseOrBuildingNo} · {p.ownerOrOccupantName}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {p.propertyType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          p.verificationStatus === 'Verified' || p.verificationStatus === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : p.verificationStatus === 'Rejected/Correction Required'
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {p.verificationStatus}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      {p.address}, {p.colony} · PIN <span className="font-mono">{p.officePincode}</span> · {p.beatNo}
                    </div>
                    {p.notes && <div className="text-[11px] text-slate-500">{p.notes}</div>}
                  </div>

                  {canVerify && p.verificationStatus !== 'Verified' && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const res = locationSurveyService.transitionPropertySurveyStatus(
                            p.id,
                            'Verified',
                            userProfile
                          );
                          showNotice(res.success ? 'ok' : 'err', res.message);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <BadgeCheck size={12} /> Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const res = locationSurveyService.transitionPropertySurveyStatus(
                            p.id,
                            'Rejected/Correction Required',
                            userProfile,
                            'Re-verify house/occupant details'
                          );
                          showNotice(res.success ? 'ok' : 'err', res.message);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle size={12} /> Flag
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {filteredProperties.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No property survey records logged yet. Use the form on the left to add properties on your beat.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: CUSTOMER VERIFICATION                                         */}
      {/* ==================================================================== */}
      {activeTab === 'CUSTOMER_VERIFICATION' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <form
            onSubmit={handleSaveCustomerVerification}
            className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-3 text-xs"
          >
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <UserCheck size={16} className="text-[#991B1B]" />
              <span>Doorstep Customer KYC &amp; Address Verification</span>
            </h2>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Link Existing CRM Customer (Optional)
              </label>
              <select
                value={selectedCustId}
                onChange={(e) => handleSelectExistingCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
              >
                <option value="">-- Manual Entry / New Verification --</option>
                {scopedCustomers.slice(0, 120).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.mobile}) · {c.colony || c.area || c.pincode}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Name *</label>
                <input
                  required
                  value={cvName}
                  onChange={(e) => setCvName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile *</label>
                <input
                  required
                  value={cvMobile}
                  onChange={(e) => setCvMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">House / Property Ref</label>
                <input
                  value={cvHouseRef}
                  onChange={(e) => setCvHouseRef(e.target.value)}
                  placeholder="e.g. Plot 42"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Colony / Locality</label>
                <input
                  value={cvColony}
                  onChange={(e) => setCvColony(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Office PIN</label>
                <select
                  value={cvPincode}
                  onChange={(e) => setCvPincode(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono font-bold bg-white"
                >
                  {KOTA_ALL_OFFICE_PINCODES.map((pin) => (
                    <option key={pin} value={pin}>
                      {pin}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Beat</label>
                <input
                  value={cvBeat}
                  onChange={(e) => setCvBeat(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Outcome *</label>
                <select
                  value={cvStatus}
                  onChange={(e) => setCvStatus(e.target.value as CustomerVerificationStatus)}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg font-bold bg-white"
                >
                  {VERIFICATION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-700">Doorstep Verification Checks</div>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cvIdVerified}
                    onChange={(e) => setCvIdVerified(e.target.checked)}
                    className="rounded"
                  />
                  <span>ID Verified</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cvAddressVerified}
                    onChange={(e) => setCvAddressVerified(e.target.checked)}
                    className="rounded"
                  />
                  <span>Address Match</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cvOccupancyVerified}
                    onChange={(e) => setCvOccupancyVerified(e.target.checked)}
                    className="rounded"
                  />
                  <span>Occupant Present</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Verification Remarks</label>
              <textarea
                rows={2}
                value={cvRemarks}
                onChange={(e) => setCvRemarks(e.target.value)}
                placeholder="e.g. Aadhaar last 4 verified at doorstep; tenant moved in recently"
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#991B1B] hover:bg-red-800 text-white rounded-lg font-bold cursor-pointer"
            >
              Submit Customer Verification
            </button>
          </form>

          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-sm font-black text-slate-900">
              Customer Verification Log ({filteredVerifications.length})
            </h2>
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredVerifications.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-950 text-sm">{v.customerName}</span>
                      <span className="font-mono text-slate-600">{v.customerMobile}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          v.verificationStatus === 'Verified'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : v.verificationStatus === 'Mismatch'
                            ? 'bg-red-50 text-red-800 border border-red-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {v.verificationStatus}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      {v.houseOrPropertyRef ? `${v.houseOrPropertyRef}, ` : ''}
                      {v.colony} · PIN <span className="font-mono">{v.officePincode}</span> · {v.beatNo}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Checks: {v.idVerified ? 'ID ✓' : 'ID ✗'} · {v.addressVerified ? 'Address ✓' : 'Address ✗'} ·{' '}
                      {v.occupancyVerified ? 'Occupant ✓' : 'Occupant ✗'}
                      {v.remarks ? ` — ${v.remarks}` : ''}
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-mono text-slate-500 shrink-0">
                    <div>{v.verifiedByStaffName}</div>
                    <div>{(v.verifiedAt || v.createdAt).slice(0, 10)}</div>
                  </div>
                </div>
              ))}
              {filteredVerifications.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No customer verifications recorded yet. Select a customer or enter details on the left.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: STICKER & VISITING CARD DISTRIBUTION                          */}
      {/* ==================================================================== */}
      {activeTab === 'DISTRIBUTION' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <form
            onSubmit={handleSaveDistribution}
            className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-3 text-xs"
          >
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sticker size={16} className="text-[#991B1B]" />
              <span>Record Sticker &amp; Visiting Card Distribution</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Material Type *</label>
                <select
                  value={distItemType}
                  onChange={(e) => setDistItemType(e.target.value as DistributionItemType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold bg-white"
                >
                  <option value="Sticker">India Post Sticker</option>
                  <option value="Visiting Card">Postman Visiting Card</option>
                  <option value="Both">Both (Sticker + Card)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity Distributed *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={distQuantity}
                  onChange={(e) => setDistQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Recipient / Shop Name *
                </label>
                <input
                  required
                  value={distRecipientName}
                  onChange={(e) => setDistRecipientName(e.target.value)}
                  placeholder="e.g. Agrawal Book Depot"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Recipient Category</label>
                <select
                  value={distRecipientCategory}
                  onChange={(e) =>
                    setDistRecipientCategory(
                      e.target.value as StickerVisitingCardDistributionRecord['recipientCategory']
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold bg-white"
                >
                  {DISTRIBUTION_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">House / Shop No *</label>
                <input
                  required
                  value={distHouseOrShopNo}
                  onChange={(e) => setDistHouseOrShopNo(e.target.value)}
                  placeholder="e.g. Shop 14"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Mobile</label>
                <input
                  value={distMobile}
                  onChange={(e) => setDistMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Optional 10-digit"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Office PIN</label>
                <select
                  value={distPincode}
                  onChange={(e) => setDistPincode(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono font-bold bg-white"
                >
                  {KOTA_ALL_OFFICE_PINCODES.map((pin) => (
                    <option key={pin} value={pin}>
                      {pin}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Beat</label>
                <input
                  value={distBeat}
                  onChange={(e) => setDistBeat(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={distDate}
                  onChange={(e) => setDistDate(e.target.value)}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Colony / Market Area</label>
              <input
                value={distColony}
                onChange={(e) => setDistColony(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Distribution Notes</label>
              <textarea
                rows={2}
                value={distNotes}
                onChange={(e) => setDistNotes(e.target.value)}
                placeholder="e.g. Placed Dak Ghar QR sticker on front glass; left Speed Post tariff card"
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#991B1B] hover:bg-red-800 text-white rounded-lg font-bold cursor-pointer"
            >
              Log Distribution Entry
            </button>
          </form>

          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-900">
                Distribution History ({filteredDistributions.length} entries · {totalItemsDistributed} pcs)
              </h2>
              <span className="text-[11px] font-mono text-slate-500">
                <MapPin size={12} className="inline mr-1" />
                {defaultBeat}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredDistributions.map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-950 text-sm">{d.recipientName}</span>
                      <span className="px-2 py-0.5 rounded bg-red-50 text-[#991B1B] border border-red-200 font-bold text-[10px]">
                        {d.itemType} · {d.quantity} pcs
                      </span>
                      <span className="text-[11px] text-slate-500">{d.recipientCategory}</span>
                    </div>
                    <div className="text-slate-600">
                      {d.houseOrShopNo}, {d.colony} · PIN <span className="font-mono">{d.officePincode}</span> · {d.beatNo}
                    </div>
                    {d.notes && <div className="text-[11px] text-slate-500">{d.notes}</div>}
                  </div>
                  <div className="text-right text-[11px] font-mono text-slate-500 shrink-0">
                    <div>{d.distributionDate}</div>
                    <div>{d.distributedByStaffName}</div>
                  </div>
                </div>
              ))}
              {filteredDistributions.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No sticker or visiting card distributions logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
