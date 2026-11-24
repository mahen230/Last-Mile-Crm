import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Compass,
  Edit3,
  Home,
  Lock,
  MapPin,
  Navigation,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { customerService } from '../../services/customerService';
import { locationSurveyService } from '../../services/locationSurveyService';
import { kotaOsHierarchyService } from '../../services/kotaOsHierarchyService';
import { staffPermissionService } from '../../services/staffPermissionService';
import {
  Customer,
  HouseMasterRecord,
  StreetMasterRecord,
} from '../../types/models';
import CustomerProfileModal from '../customers/CustomerProfileModal';

export default function LocationIntelligenceHub({
  indiaPostOwnerAccess = false,
}: {
  indiaPostOwnerAccess?: boolean;
} = {}) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'EXPLORER' | 'STREETS' | 'HOUSES' | 'PRIVACY_MAP'>('EXPLORER');
  const [streets, setStreets] = useState<StreetMasterRecord[]>([]);
  const [houses, setHouses] = useState<HouseMasterRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Cascading Hierarchy Filters (11-Level Explorer)
  const [divisionFilter, setDivisionFilter] = useState('Kota Division');
  const [subdivisionFilter, setSubdivisionFilter] = useState('ALL');
  const [officeFilter, setOfficeFilter] = useState('ALL');
  const [pincodeFilter, setPincodeFilter] = useState('');
  const [colonyFilter, setColonyFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Street Master Form
  const [editingStreetId, setEditingStreetId] = useState<string | null>(null);
  const [stName, setStName] = useState('');
  const [stNameHi, setStNameHi] = useState('');
  const [stPin, setStPin] = useState('324009');
  const [stOffice, setStOffice] = useState('Dadabari S.O.');
  const [stSubdivision, setStSubdivision] = useState('Kota South Subdivision');
  const [stLocality, setStLocality] = useState('');
  const [stColony, setStColony] = useState('');
  const [stSector, setStSector] = useState('');
  const [stBeat, setStBeat] = useState('');
  const [stLandmark, setStLandmark] = useState('');

  // House Master Form
  const [editingHouseId, setEditingHouseId] = useState<string | null>(null);
  const [hsNumber, setHsNumber] = useState('');
  const [hsBuilding, setHsBuilding] = useState('');
  const [hsFloorUnit, setHsFloorUnit] = useState('Ground Floor');
  const [hsStreetId, setHsStreetId] = useState('');
  const [hsStreetName, setHsStreetName] = useState('');
  const [hsColony, setHsColony] = useState('');
  const [hsLocality, setHsLocality] = useState('');
  const [hsSector, setHsSector] = useState('');
  const [hsPin, setHsPin] = useState('324009');
  const [hsOffice, setHsOffice] = useState('Dadabari S.O.');
  const [hsBeat, setHsBeat] = useState('');
  const [hsOccupancy, setHsOccupancy] = useState<HouseMasterRecord['occupancyType']>('Residential');
  const [hsHeadName, setHsHeadName] = useState('');
  const [hsConsent, setHsConsent] = useState(false);

  const canCreate =
    kotaOsHierarchyService.hasActionPermission(userProfile, 'locationIntelligence', 'create') ||
    Boolean(indiaPostOwnerAccess);
  const canEdit =
    kotaOsHierarchyService.hasActionPermission(userProfile, 'locationIntelligence', 'edit') ||
    Boolean(indiaPostOwnerAccess);
  const canViewEmployeeGps =
    locationSurveyService.canViewLiveStaffLocation(userProfile) || Boolean(indiaPostOwnerAccess);

  const offices = useMemo(() => staffPermissionService.getDynamicOffices(), []);

  useEffect(() => {
    const sync = () => {
      setStreets(locationSurveyService.getStreets(userProfile));
      setHouses(locationSurveyService.getHouses(userProfile));
      setCustomers(customerService.getScopedCustomers(userProfile));
    };
    sync();
    const u1 = locationSurveyService.subscribe(sync);
    const u2 = customerService.subscribe(sync);
    return () => {
      u1();
      u2();
    };
  }, [userProfile]);

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice((p) => (p === msg ? null : p)), 3800);
  };

  const uniqueColonies = useMemo(() => {
    const set = new Set<string>();
    streets.forEach((s) => s.colony && set.add(s.colony));
    houses.forEach((h) => h.colony && set.add(h.colony));
    customers.forEach((c) => (c.colony || c.area) && set.add((c.colony || c.area)!));
    return Array.from(set).sort();
  }, [streets, houses, customers]);

  const filteredStreets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return streets.filter((s) => {
      if (subdivisionFilter !== 'ALL' && s.subdivision !== subdivisionFilter) return false;
      if (officeFilter !== 'ALL' && s.officeName !== officeFilter) return false;
      if (pincodeFilter && !s.pincode.includes(pincodeFilter.trim())) return false;
      if (colonyFilter !== 'ALL' && s.colony !== colonyFilter) return false;
      if (q) {
        const hay = `${s.streetCode} ${s.streetName} ${s.streetNameHi || ''} ${s.colony} ${s.sectorBlock} ${s.pincode}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [streets, subdivisionFilter, officeFilter, pincodeFilter, colonyFilter, searchQuery]);

  const filteredHouses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return houses.filter((h) => {
      if (subdivisionFilter !== 'ALL' && h.subdivision !== subdivisionFilter) return false;
      if (officeFilter !== 'ALL' && h.officeName !== officeFilter) return false;
      if (pincodeFilter && !h.pincode.includes(pincodeFilter.trim())) return false;
      if (colonyFilter !== 'ALL' && h.colony !== colonyFilter) return false;
      if (q) {
        const hay = `${h.id} ${h.houseNumber} ${h.buildingName || ''} ${h.floorUnit || ''} ${h.streetName} ${h.colony} ${h.headResidentName || ''} ${h.pincode}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [houses, subdivisionFilter, officeFilter, pincodeFilter, colonyFilter, searchQuery]);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return customers
      .filter((c) => {
        if (pincodeFilter && !(c.pincode || '').includes(pincodeFilter.trim())) return false;
        if (colonyFilter !== 'ALL' && (c.colony || c.area) !== colonyFilter) return false;
        if (q) {
          const hay = `${c.masterId || c.id} ${c.name} ${c.mobile} ${c.houseNo || ''} ${c.colony || c.area || ''} ${c.pincode || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .slice(0, 24);
  }, [customers, pincodeFilter, colonyFilter, searchQuery]);

  const handleSaveStreet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate && !canEdit) {
      showToast('You do not have Create/Edit permission for Street Master.');
      return;
    }
    if (!stName.trim() || !stColony.trim() || !/^\d{6}$/.test(stPin.trim())) {
      showToast('Enter Street Name, Colony, and valid 6-digit PIN code.');
      return;
    }
    const saved = locationSurveyService.upsertStreet({
      id: editingStreetId || undefined,
      streetName: stName.trim(),
      streetNameHi: stNameHi.trim() || undefined,
      division: divisionFilter,
      subdivision: stSubdivision,
      officeName: stOffice,
      pincode: stPin.trim(),
      locality: stLocality.trim() || stColony.trim(),
      colony: stColony.trim(),
      sectorBlock: stSector.trim() || 'General',
      beatNo: stBeat.trim() || undefined,
      landmark: stLandmark.trim() || undefined,
      status: 'ACTIVE',
      createdBy: userProfile?.name || 'Admin',
    });
    setEditingStreetId(null);
    setStName('');
    setStNameHi('');
    setStLocality('');
    setStColony('');
    setStSector('');
    setStBeat('');
    setStLandmark('');
    showToast(`Saved Street Master "${saved.streetName}" (${saved.streetCode}).`);
  };

  const handleSelectStreetForHouse = (streetId: string) => {
    setHsStreetId(streetId);
    const found = streets.find((s) => s.id === streetId);
    if (found) {
      setHsStreetName(found.streetName);
      setHsColony(found.colony);
      setHsLocality(found.locality);
      setHsSector(found.sectorBlock);
      setHsPin(found.pincode);
      setHsOffice(found.officeName || 'Dadabari S.O.');
      setHsBeat(found.beatNo || '');
    }
  };

  const handleSaveHouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate && !canEdit) {
      showToast('You do not have Create/Edit permission for House Master.');
      return;
    }
    if (!hsNumber.trim() || !hsColony.trim() || !/^\d{6}$/.test(hsPin.trim())) {
      showToast('Enter House/Building Number, Colony, and valid 6-digit PIN.');
      return;
    }
    const saved = locationSurveyService.upsertHouse({
      id: editingHouseId || undefined,
      houseNumber: hsNumber.trim(),
      buildingName: hsBuilding.trim() || undefined,
      floorUnit: hsFloorUnit.trim() || 'Ground Floor',
      streetId: hsStreetId || 'DIRECT_STREET',
      streetName: hsStreetName.trim() || 'Main Colony Road',
      sectorBlock: hsSector.trim() || 'General',
      colony: hsColony.trim(),
      locality: hsLocality.trim() || hsColony.trim(),
      pincode: hsPin.trim(),
      officeName: hsOffice,
      subdivision: subdivisionFilter === 'ALL' ? 'Kota South Subdivision' : subdivisionFilter,
      division: divisionFilter,
      beatNo: hsBeat.trim() || undefined,
      occupancyType: hsOccupancy,
      headResidentName: hsHeadName.trim() || undefined,
      consentCaptured: hsConsent,
      consentRecordedBy: hsConsent ? userProfile?.name : undefined,
      surveyStatus: 'Unvisited',
    });
    setEditingHouseId(null);
    setHsNumber('');
    setHsBuilding('');
    setHsHeadName('');
    setHsConsent(false);
    showToast(`Saved House Master ${saved.id} (${saved.houseNumber}, ${saved.floorUnit}).`);
  };

  return (
    <div className="space-y-5">
      {/* Dark Navy + Royal Blue + Orange Enterprise Header */}
      <div className="bg-[#0A1628] text-white rounded-xl border border-slate-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-wider text-orange-400 font-bold">
              KOTA DIVISION OS · 11-LEVEL LOCATION INTELLIGENCE
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Location Intelligence, Street &amp; House Master
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Division &rarr; Subdivision &rarr; Office &rarr; PIN &rarr; Locality &rarr; Colony &rarr; Sector/Block &rarr; Street &rarr; House/Building &rarr; Floor/Unit &rarr; Customer.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-left shrink-0">
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg px-3.5 py-2.5">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">Streets</div>
              <div className="text-lg font-black text-white tabular-nums">{streets.length}</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg px-3.5 py-2.5">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">Houses</div>
              <div className="text-lg font-black text-blue-400 tabular-nums">{houses.length}</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg px-3.5 py-2.5">
              <div className="text-[10px] uppercase text-slate-400 font-semibold">Customers</div>
              <div className="text-lg font-black text-orange-400 tabular-nums">{customers.length}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-800">
          {[
            { id: 'EXPLORER', label: '11-Level Territory Explorer' },
            { id: 'STREETS', label: 'Street Master Registry' },
            { id: 'HOUSES', label: 'House & Floor/Unit Master' },
            { id: 'PRIVACY_MAP', label: 'Location Search & Privacy Guard' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1D4ED8] text-white'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <div className="bg-blue-50 border border-blue-200 text-blue-950 px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={15} className="text-[#1D4ED8] shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Global Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Subdivision</label>
          <select
            value={subdivisionFilter}
            onChange={(e) => setSubdivisionFilter(e.target.value)}
            className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-semibold bg-white"
          >
            <option value="ALL">All Subdivisions</option>
            <option value="Kota South Subdivision">Kota South Subdivision</option>
            <option value="Kota North Subdivision">Kota North Subdivision</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Office</label>
          <select
            value={officeFilter}
            onChange={(e) => setOfficeFilter(e.target.value)}
            className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-semibold bg-white"
          >
            <option value="ALL">All Offices</option>
            {offices.map((o) => (
              <option key={o.id} value={o.officeName}>
                {o.officeName} ({o.pincode})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">PIN Code</label>
          <input
            type="text"
            maxLength={6}
            value={pincodeFilter}
            onChange={(e) => setPincodeFilter(e.target.value.replace(/\D/g, ''))}
            placeholder="Filter 6-digit PIN..."
            className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Colony</label>
          <select
            value={colonyFilter}
            onChange={(e) => setColonyFilter(e.target.value)}
            className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-semibold bg-white"
          >
            <option value="ALL">All Colonies</option>
            {uniqueColonies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Quick Search</label>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="House ID, Street, Resident..."
              className="w-full pl-8 pr-2.5 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: 11-LEVEL TERRITORY EXPLORER */}
      {activeTab === 'EXPLORER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Column 1: Streets */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <MapPin size={15} className="text-[#1D4ED8]" />
                <span>Streets ({filteredStreets.length})</span>
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('STREETS')}
                className="text-[11px] font-bold text-[#1D4ED8] hover:underline cursor-pointer"
              >
                Manage Streets
              </button>
            </div>
            {filteredStreets.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800">No Street Master records yet</div>
                <p>Add verified streets in Street Master or import via Data Center.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('STREETS')}
                  className="px-3 py-1.5 bg-[#1D4ED8] text-white rounded-lg font-bold cursor-pointer"
                >
                  + Add Street
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar">
                {filteredStreets.map((st) => (
                  <div key={st.id} className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 transition text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{st.streetName}</span>
                      <span className="font-mono text-[10px] text-slate-500">{st.streetCode}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      {st.colony} · {st.sectorBlock} · PIN <span className="font-mono">{st.pincode}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: House Master */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Home size={15} className="text-[#EA580C]" />
                <span>House Master ({filteredHouses.length})</span>
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('HOUSES')}
                className="text-[11px] font-bold text-[#EA580C] hover:underline cursor-pointer"
              >
                + Register House
              </button>
            </div>
            {filteredHouses.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800">No House Master records yet</div>
                <p>Register houses with Floor/Unit, unique House ID &amp; survey consent.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('HOUSES')}
                  className="px-3 py-1.5 bg-[#EA580C] text-white rounded-lg font-bold cursor-pointer"
                >
                  + Add House
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar">
                {filteredHouses.map((hs) => (
                  <div key={hs.id} className="p-3 rounded-lg border border-slate-200 hover:border-orange-300 transition text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">
                        {hs.houseNumber} · {hs.floorUnit || 'Ground'}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-[#1D4ED8]">{hs.id}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {hs.streetName}, {hs.colony} · PIN <span className="font-mono">{hs.pincode}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                      <span className="font-semibold text-slate-700">
                        Survey: <strong>{hs.surveyStatus}</strong> · Consent: {hs.consentCaptured ? 'Yes' : 'Pending'}
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate('/doorstep-surveys', { state: { houseId: hs.id } })}
                        className="font-bold text-[#1D4ED8] hover:underline cursor-pointer"
                      >
                        Survey &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 3: Linked Customers (Customer 360) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Users size={15} className="text-slate-800" />
                <span>Linked Citizens ({filteredCustomers.length})</span>
              </h2>
              <button
                type="button"
                onClick={() => navigate('/customers')}
                className="text-[11px] font-bold text-slate-700 hover:underline cursor-pointer"
              >
                Full Directory
              </button>
            </div>
            <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar">
              {filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCustomer(c)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition text-xs cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">{c.masterId || c.id}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {c.houseNo ? `House ${c.houseNo}, ` : ''}{c.colony || c.area || 'Dadabari'} · PIN {c.pincode || '324009'}
                  </div>
                  <div className="text-[10px] font-semibold text-[#1D4ED8] mt-1">
                    Open Customer 360 &rarr;
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STREET MASTER CRUD */}
      {activeTab === 'STREETS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <form onSubmit={handleSaveStreet} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 text-xs">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Plus size={16} className="text-[#1D4ED8]" />
              <span>{editingStreetId ? 'Edit Street Record' : 'Register Street Master'}</span>
            </h2>
            <div className="space-y-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Street Name (English) *</label>
                <input
                  type="text"
                  required
                  value={stName}
                  onChange={(e) => setStName(e.target.value)}
                  placeholder="e.g. Sector 7 Main Road"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Street Name (Hindi / देवनागरी)</label>
                <input
                  type="text"
                  value={stNameHi}
                  onChange={(e) => setStNameHi(e.target.value)}
                  placeholder="उदा. सेक्टर 7 मुख्य मार्ग"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Colony *</label>
                  <input
                    type="text"
                    required
                    value={stColony}
                    onChange={(e) => setStColony(e.target.value)}
                    placeholder="Keshavpura"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sector / Block</label>
                  <input
                    type="text"
                    value={stSector}
                    onChange={(e) => setStSector(e.target.value)}
                    placeholder="Sector 7"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">6-Digit PIN *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={stPin}
                    onChange={(e) => setStPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Beat No</label>
                  <input
                    type="text"
                    value={stBeat}
                    onChange={(e) => setStBeat(e.target.value)}
                    placeholder="Beat 2"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Post Office</label>
                <select
                  value={stOffice}
                  onChange={(e) => setStOffice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {offices.map((o) => (
                    <option key={o.id} value={o.officeName}>
                      {o.officeName} ({o.pincode})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0A1628] hover:bg-slate-900 text-white rounded-lg font-bold cursor-pointer"
              >
                {editingStreetId ? 'Update Street Master' : 'Save Street Master'}
              </button>
            </div>
          </form>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 overflow-x-auto">
            <h3 className="text-sm font-black text-slate-900 mb-3">Registered Street Master Table</h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                  <th className="py-2 pr-3">Code</th>
                  <th className="py-2 pr-3">Street</th>
                  <th className="py-2 pr-3">Colony / Sector</th>
                  <th className="py-2 pr-3">Office / PIN</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStreets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No streets match the current filters. Add a verified street on the left.
                    </td>
                  </tr>
                ) : (
                  filteredStreets.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-3 font-mono font-bold text-[#1D4ED8]">{st.streetCode}</td>
                      <td className="py-2.5 pr-3">
                        <div className="font-bold text-slate-900">{st.streetName}</div>
                        {st.streetNameHi && <div className="text-[11px] text-slate-500">{st.streetNameHi}</div>}
                      </td>
                      <td className="py-2.5 pr-3">
                        {st.colony} · {st.sectorBlock}
                      </td>
                      <td className="py-2.5 pr-3 font-mono">
                        {st.officeName} ({st.pincode})
                      </td>
                      <td className="py-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStreetId(st.id);
                            setStName(st.streetName);
                            setStNameHi(st.streetNameHi || '');
                            setStColony(st.colony);
                            setStSector(st.sectorBlock);
                            setStPin(st.pincode);
                            setStOffice(st.officeName || 'Dadabari S.O.');
                            setStBeat(st.beatNo || '');
                          }}
                          className="px-2.5 py-1 border border-slate-300 rounded text-[11px] font-bold hover:bg-slate-100 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 size={11} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HOUSE MASTER CRUD */}
      {activeTab === 'HOUSES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <form onSubmit={handleSaveHouse} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 text-xs">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Home size={16} className="text-[#EA580C]" />
              <span>{editingHouseId ? 'Update House Master' : 'Register House Master'}</span>
            </h2>
            {streets.length > 0 && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Link Street Master</label>
                <select
                  value={hsStreetId}
                  onChange={(e) => handleSelectStreetForHouse(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Select Registered Street --</option>
                  {streets.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.streetName} ({s.colony}, {s.pincode})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">House / Plot No *</label>
                <input
                  type="text"
                  required
                  value={hsNumber}
                  onChange={(e) => setHsNumber(e.target.value)}
                  placeholder="e.g. 445-A"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Floor / Unit</label>
                <input
                  type="text"
                  value={hsFloorUnit}
                  onChange={(e) => setHsFloorUnit(e.target.value)}
                  placeholder="Ground / 1st Floor"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Colony *</label>
                <input
                  type="text"
                  required
                  value={hsColony}
                  onChange={(e) => setHsColony(e.target.value)}
                  placeholder="Keshavpura"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">6-Digit PIN *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={hsPin}
                  onChange={(e) => setHsPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Occupancy Type</label>
                <select
                  value={hsOccupancy}
                  onChange={(e) => setHsOccupancy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Mixed">Mixed</option>
                  <option value="Vacant">Vacant</option>
                  <option value="Government">Government</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Head Resident</label>
                <input
                  type="text"
                  value={hsHeadName}
                  onChange={(e) => setHsHeadName(e.target.value)}
                  placeholder="Resident name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={hsConsent}
                onChange={(e) => setHsConsent(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span className="font-semibold text-slate-800">
                Resident Data Consent Captured (DPDP / Postal Survey Consent)
              </span>
            </label>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#EA580C] hover:bg-orange-700 text-white rounded-lg font-bold cursor-pointer"
            >
              {editingHouseId ? 'Update House Master' : 'Generate Unique House ID & Save'}
            </button>
          </form>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 overflow-x-auto">
            <h3 className="text-sm font-black text-slate-900 mb-3">House Master &amp; Survey Status Ledger</h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                  <th className="py-2 pr-3">House ID</th>
                  <th className="py-2 pr-3">Address / Floor</th>
                  <th className="py-2 pr-3">Occupancy &amp; Consent</th>
                  <th className="py-2 pr-3">Survey Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHouses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No houses registered for current filter.
                    </td>
                  </tr>
                ) : (
                  filteredHouses.map((hs) => (
                    <tr key={hs.id} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-3 font-mono font-bold text-[#1D4ED8]">{hs.id}</td>
                      <td className="py-2.5 pr-3">
                        <div className="font-bold text-slate-900">
                          {hs.houseNumber} ({hs.floorUnit || 'Ground'})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {hs.streetName}, {hs.colony} · {hs.pincode}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="font-semibold text-slate-800">{hs.occupancyType}</div>
                        <div className="text-[10px] text-slate-500">
                          Consent: {hs.consentCaptured ? 'Captured' : 'Not Captured'}
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 font-bold text-slate-800">{hs.surveyStatus}</td>
                      <td className="py-2.5">
                        <button
                          type="button"
                          onClick={() => navigate('/doorstep-surveys', { state: { houseId: hs.id } })}
                          className="px-2.5 py-1 bg-[#0A1628] text-white rounded text-[11px] font-bold hover:bg-slate-800 cursor-pointer"
                        >
                          Open Survey
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LOCATION SEARCH & EMPLOYEE PRIVACY GUARD */}
      {activeTab === 'PRIVACY_MAP' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Compass size={16} className="text-[#1D4ED8]" />
                <span>Property &amp; Colony Geolocation Search</span>
              </h2>
              <p className="text-xs text-slate-600">
                Search verified house/colony coordinates. Employee live tracking is strictly guarded by RBAC clearance.
              </p>
            </div>
            <div className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs flex items-center gap-2">
              {canViewEmployeeGps ? (
                <>
                  <ShieldCheck size={15} className="text-emerald-700" />
                  <span className="font-bold text-slate-800">Supervisor Clearance: Audit GPS Logs Enabled</span>
                </>
              ) : (
                <>
                  <Lock size={15} className="text-[#EA580C]" />
                  <span className="font-bold text-slate-800">Privacy Guard: Live Staff Coordinates Hidden</span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredHouses
              .filter((h) => h.latitude && h.longitude)
              .map((h) => (
                <div key={h.id} className="p-3.5 rounded-lg border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{h.houseNumber} · {h.colony}</span>
                    <span className="font-mono text-[10px] text-slate-500">{h.pincode}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-600 tabular-nums">
                    Lat {h.latitude}, Lng {h.longitude}
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${h.latitude},${h.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#1D4ED8] font-bold hover:underline"
                  >
                    <Navigation size={12} /> Open Pin in Google Maps
                  </a>
                </div>
              ))}
            {filteredHouses.filter((h) => h.latitude && h.longitude).length === 0 && (
              <div className="col-span-full p-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300 text-xs text-slate-600">
                No verified geo-coordinates captured yet. Capture GPS cleanly inside Doorstep Surveys when device permission is granted.
              </div>
            )}
          </div>
        </div>
      )}

      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
