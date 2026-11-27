import React, { useState, useEffect, useMemo } from 'react';
import {
  Building,
  Building2,
  MapPin,
  Users,
  Search,
  Home,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  UserX,
  CheckCircle2,
  RefreshCw,
  Plus,
  Filter,
  Info,
} from 'lucide-react';
import { Property, Customer } from '../../types/models';
import { customerService } from '../../services/customerService';
import { staffPermissionService } from '../../services/staffPermissionService';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { commonDataCentreService } from '../../services/commonDataCentreService';
import { SearchConsoleDuplicatePanel } from '../common/SearchConsoleDuplicatePanel';
import { StaffAttributionLink } from '../common/StaffAttributionModal';
import CustomerProfileModal from '../customers/CustomerProfileModal';
import SequenceWisePropertyHub from './SequenceWisePropertyHub';
import UnifiedPropertyFamilyHub from './UnifiedPropertyFamilyHub';

// Safe address string extractor for Property objects
const formatPropertyAddress = (address: any): string => {
  if (!address) return 'Dadabari S.O. Jurisdiction, Kota';
  if (typeof address === 'string') return address;
  if (typeof address === 'object') {
    return address.fullAddress || 
      [address.houseNo || address.houseNumber, address.sector, address.area || address.colony, address.pincode]
        .filter(Boolean)
        .join(', ') || 'Dadabari S.O. Jurisdiction, Kota';
  }
  return String(address);
};

export default function PropertiesView() {
  const { userProfile } = useAuth();
  const [activeViewTab, setActiveViewTab] = useState<'sequence' | 'unified' | 'grid'>('sequence');
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedColony, setSelectedColony] = useState('All');
  const [selectedBeat, setSelectedBeat] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const PROPERTIES_PER_PAGE = 6;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [restrictedHouseNo, setRestrictedHouseNo] = useState('');
  const [restrictedColony, setRestrictedColony] = useState(userProfile?.assignedColonies?.[0] || 'Keshavpura');
  const [restrictedSector, setRestrictedSector] = useState('Sector 6');
  const [restrictedBeat, setRestrictedBeat] = useState(
    (userProfile?.beat || 'Beat 2').replace(/^Beat\s*/i, '').trim() || '2'
  );
  const [restrictedPincode, setRestrictedPincode] = useState(userProfile?.officePincode || '324009');
  const [restrictedPropType, setRestrictedPropType] = useState<'House' | 'Commercial' | 'Mixed' | 'Flat / Residency'>('House');
  const [restrictedStatus, setRestrictedStatus] = useState<'Occupied' | 'Vacant' | 'Commercial' | 'Mixed'>('Occupied');
  const [restrictedResidentName, setRestrictedResidentName] = useState('');
  const [restrictedMobile, setRestrictedMobile] = useState('');
  const [restrictedRemark, setRestrictedRemark] = useState('');
  const [restrictedFeedback, setRestrictedFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  // Add Property Modal controlled state
  const [addHouseNo, setAddHouseNo] = useState('');
  const [addSector, setAddSector] = useState('Sector 6');
  const [addArea, setAddArea] = useState('Dadabari');
  const [addBeatNo, setAddBeatNo] = useState('2');
  const [addPincode, setAddPincode] = useState('324009');
  const [addPropType, setAddPropType] = useState<'House' | 'Commercial' | 'Mixed' | 'Flat / Residency'>('House');
  const [addStatus, setAddStatus] = useState<'Occupied' | 'Vacant' | 'Commercial' | 'Mixed'>('Occupied');
  const [addRemark, setAddRemark] = useState('');
  const [addModalError, setAddModalError] = useState<string | null>(null);

  // Edit Property Modal controlled state
  const [editHousePlotNumber, setEditHousePlotNumber] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editSector, setEditSector] = useState('');
  const [editBeatNo, setEditBeatNo] = useState('2');
  const [editStatus, setEditStatus] = useState<Property['status']>('Occupied');
  const [editRemark, setEditRemark] = useState('');
  const [editModalError, setEditModalError] = useState<string | null>(null);

  const canReadPropertyDetails = staffPermissionService.canReadPropertyDetails(userProfile);
  const canSearchPropertyDetails = staffPermissionService.canSearchProperties(userProfile);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const loadProperties = () => {
    const data = customerService.getScopedProperties(userProfile);
    setProperties(data);
  };

  useEffect(() => {
    loadProperties();
    const unsub = customerService.subscribe(loadProperties);
    return () => unsub();
  }, [userProfile]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType, selectedColony, selectedBeat]);

  const handleEditProperty = (prop: Property) => {
    setSelectedProperty(prop);
    setEditHousePlotNumber(prop.housePlotNumber || prop.houseNo || '');
    setEditAddress(formatPropertyAddress(prop.address));
    setEditSector(prop.sector || '');
    setEditBeatNo((prop.beatNo || '2').replace(/^Beat\s*/i, '').trim() || '2');
    setEditStatus(prop.status || 'Occupied');
    setEditRemark(prop.remark || prop.notes || '');
    setEditModalError(null);
    setIsEditModalOpen(true);
  };

  // Remove a resident from property (disassociates resident from property, customer record preserved)
  const handleRemoveResident = (residentName: string) => {
    if (!selectedProperty) return;
    const updatedResidents = (selectedProperty.residentNames || []).filter((r) => r !== residentName);
    const updatedProperty: Property = {
      ...selectedProperty,
      residentNames: updatedResidents,
      status: updatedResidents.length === 0 ? 'Vacant' : selectedProperty.status,
    };
    customerService.updateProperty(updatedProperty);
    setSelectedProperty(updatedProperty);
    showToast(`Resident '${residentName}' removed from property. Customer profile remains intact in CRM.`);
  };

  // Mark property as Vacant and clear its residents (member is preserved in CRM)
  const handleMarkVacant = (prop: Property) => {
    const success = customerService.markPropertyVacant(prop.id);
    if (success) {
      if (selectedProperty?.id === prop.id) {
        setSelectedProperty({
          ...prop,
          status: 'Vacant',
          residentNames: [],
          residents: [],
        });
      }
      showToast(`Property '${prop.propertyCode || prop.id}' marked as Vacant. Resident members disassociated and safely kept in customer database.`);
    }
  };

  const [pendingConfirm, setPendingConfirm] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Remove property entry while keeping members intact
  const handleRemoveProperty = (prop: Property) => {
    const confirmMsg = `Remove property '${prop.propertyCode || formatPropertyAddress(prop.address)}'? Resident members/customers will NOT be deleted; they will remain safely in the customer directory.`;
    setPendingConfirm({
      message: confirmMsg,
      onConfirm: () => {
        const result = customerService.removeProperty(prop.id);
        if (result.success) {
          if (selectedProperty?.id === prop.id) {
            setSelectedProperty(null);
            setIsEditModalOpen(false);
          }
          showToast(`✅ Property removed from registry. ${result.membersPreserved} member(s) safely preserved in CRM.`);
        }
        setPendingConfirm(null);
      },
    });
  };

  // Bulk: Set all properties without house numbers to Vacant & clear members
  const handleBulkVacateNoHouseNo = () => {
    const result = customerService.vacateAllPropertiesWithoutHouseNo();
    showToast(`✅ ${result.vacatedCount} properties without house numbers marked as Vacant. ${result.membersPreserved} members disassociated from property entries while preserved in CRM.`);
  };

  // Bulk: Remove properties without house numbers completely (members preserved)
  const handleBulkRemoveNoHouseNo = () => {
    setPendingConfirm({
      message: 'Remove all property entries where house number is missing? Customer/member profiles will NOT be deleted; they will remain safe in the CRM database.',
      onConfirm: () => {
        const result = customerService.removePropertiesWithoutHouseNo();
        showToast(`✅ ${result.removedCount} property entries without house numbers removed. All member records were kept safe in CRM!`);
        setPendingConfirm(null);
      },
    });
  };

  // Statistics
  const stats = useMemo(() => {
    const total = properties.length;
    const occupied = properties.filter((p) => p.status === 'Occupied').length;
    const vacant = properties.filter((p) => p.status === 'Vacant').length;
    const missingHouseNo = properties.filter((p) => !p.housePlotNumber || !p.housePlotNumber.trim() || p.housePlotNumber === 'Plot Unit').length;
    return { total, occupied, vacant, missingHouseNo };
  }, [properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const s = search.toLowerCase().replace(/\s+/g, '');
      const code = (p.propertyCode || '').toLowerCase().replace(/\s+/g, '');
      const houseNo = (p.housePlotNumber || '').toLowerCase().replace(/\s+/g, '');
      const addr = (p.address || '').toLowerCase().replace(/\s+/g, '');
      const hasResident = (p.residentNames || []).some((r) => r.toLowerCase().replace(/\s+/g, '').includes(s));

      const matchesSearch =
        !search ||
        code.includes(s) ||
        houseNo.includes(s) ||
        addr.includes(s) ||
        hasResident;

      let matchesType = true;
      if (filterType === 'Occupied') matchesType = p.status === 'Occupied';
      else if (filterType === 'Vacant') matchesType = p.status === 'Vacant';
      else if (filterType === 'MissingHouseNo') {
        matchesType = !p.housePlotNumber || !p.housePlotNumber.trim() || p.housePlotNumber === 'Plot Unit';
      }

      const matchesColony =
        selectedColony === 'All' ||
        `${p.colony || ''} ${p.area || ''} ${formatPropertyAddress(p.address)}`
          .toLowerCase()
          .includes(selectedColony.toLowerCase());

      const cleanBeat = String(p.beatNo || '').replace(/\D/g, '');
      const matchesBeat = selectedBeat === 'All' || cleanBeat === selectedBeat;

      return matchesSearch && matchesType && matchesColony && matchesBeat;
    })
    .sort((a, b) => {
      const colA = (a.colony || a.address || '').trim();
      const colB = (b.colony || b.address || '').trim();
      const colCmp = colA.localeCompare(colB, undefined, { numeric: true, sensitivity: 'base' });
      if (colCmp !== 0) return colCmp;
      const hA = (a.housePlotNumber || '').trim();
      const hB = (b.housePlotNumber || '').trim();
      return hA.localeCompare(hB, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [properties, search, filterType, selectedColony, selectedBeat]);

  const totalPropertyPages = Math.max(1, Math.ceil(filteredProperties.length / PROPERTIES_PER_PAGE));
  const safePropertyPage = Math.min(currentPage, totalPropertyPages);
  const paginatedProperties = filteredProperties.slice(
    (safePropertyPage - 1) * PROPERTIES_PER_PAGE,
    safePropertyPage * PROPERTIES_PER_PAGE
  );

  const restrictedDupCheck = useMemo(() => {
    if (!restrictedHouseNo.trim() && !restrictedColony.trim()) {
      return { hasMatch: false, matchReasons: [], matches: [] };
    }
    return commonDataCentreService.detectPropertyDuplicates({
      houseNo: restrictedHouseNo,
      colony: restrictedColony,
      sector: restrictedSector,
      pincode: restrictedPincode,
      beatNo: restrictedBeat,
    });
  }, [restrictedHouseNo, restrictedColony, restrictedSector, restrictedPincode, restrictedBeat]);

  const restrictedTerritoryCheck = useMemo(() => {
    return staffPermissionService.isTerritoryAllowedForProperty(userProfile, {
      beatNo: restrictedBeat,
      pincode: restrictedPincode,
      colony: restrictedColony,
    });
  }, [userProfile, restrictedBeat, restrictedPincode, restrictedColony]);

  const addPropDupCheck = useMemo(() => {
    if (!isAddModalOpen || (!addHouseNo.trim() && !addArea.trim())) {
      return { hasMatch: false, matchReasons: [], matches: [] };
    }
    return commonDataCentreService.detectPropertyDuplicates({
      houseNo: addHouseNo,
      colony: addArea,
      sector: addSector,
      pincode: addPincode,
      beatNo: addBeatNo,
    });
  }, [isAddModalOpen, addHouseNo, addArea, addSector, addPincode, addBeatNo]);

  const addTerritoryCheck = useMemo(() => {
    return staffPermissionService.isTerritoryAllowedForProperty(userProfile, {
      beatNo: addBeatNo,
      pincode: addPincode,
      colony: addArea,
    });
  }, [userProfile, addBeatNo, addPincode, addArea]);

  const editPropDupCheck = useMemo(() => {
    if (!isEditModalOpen || !selectedProperty) {
      return { hasMatch: false, matchReasons: [], matches: [] };
    }
    return commonDataCentreService.detectPropertyDuplicates({
      excludeId: selectedProperty.id || selectedProperty.propertyCode,
      houseNo: editHousePlotNumber,
      colony: selectedProperty.colony || selectedProperty.area,
      sector: editSector,
      address: editAddress,
      pincode: selectedProperty.pincode,
      beatNo: editBeatNo,
    });
  }, [isEditModalOpen, selectedProperty, editHousePlotNumber, editSector, editAddress, editBeatNo]);

  const editTerritoryCheck = useMemo(() => {
    return staffPermissionService.isTerritoryAllowedForProperty(userProfile, {
      beatNo: editBeatNo,
      pincode: selectedProperty?.pincode || '324009',
      colony: selectedProperty?.colony || selectedProperty?.area || '',
    });
  }, [userProfile, editBeatNo, selectedProperty]);

  if (!canReadPropertyDetails && !canSearchPropertyDetails) {
    const handleRestrictedSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setRestrictedFeedback(null);
      const res = commonDataCentreService.verifyAndCommitProperty(
        userProfile,
        {
          houseNo: restrictedHouseNo,
          colony: restrictedColony,
          sector: restrictedSector,
          pincode: restrictedPincode,
          beatNo: restrictedBeat,
          propertyType: restrictedPropType,
          status: restrictedStatus,
          residentOrOwnerName: restrictedResidentName,
          mobile: restrictedMobile,
          notes: restrictedRemark,
        },
        { remark: restrictedRemark }
      );
      if (res.success && res.data) {
        setRestrictedFeedback({
          ok: true,
          msg: `3-Layer Verified Property ${res.data.propertyCode} saved & synced in allotted Beat ${restrictedBeat}.`,
        });
        setRestrictedHouseNo('');
        setRestrictedResidentName('');
        setRestrictedMobile('');
        setRestrictedRemark('');
      } else {
        setRestrictedFeedback({
          ok: false,
          msg: res.error || 'Three-Layer Verification blocked this property entry.',
        });
      }
    };

    return (
      <div className="space-y-6" id="properties-restricted-root">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Restricted Property Mode · Allotted Territory Entry Only
              </p>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Add Property in My Allotted Territory
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Property search and property registry inspection are disabled for your role by Administrator RBAC. You can submit new properties strictly within your assigned Beat / PIN area ({userProfile?.beat || 'Beat 2'} · {userProfile?.officePincode || '324009'}).
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
              <ShieldAlert className="w-3.5 h-3.5" />
              Search & Details Hidden
            </span>
          </div>

          {restrictedFeedback && (
            <div
              className={`mt-4 rounded-md px-3.5 py-2.5 text-xs font-medium border ${
                restrictedFeedback.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {restrictedFeedback.msg}
            </div>
          )}

          <form onSubmit={handleRestrictedSubmit} className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">House / Plot / Flat No. *</label>
              <input
                type="text"
                required
                value={restrictedHouseNo}
                onChange={(e) => setRestrictedHouseNo(e.target.value)}
                placeholder="e.g. KH-222"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Allotted Colony / Area *</label>
              <input
                type="text"
                required
                value={restrictedColony}
                onChange={(e) => setRestrictedColony(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Sector / Block</label>
              <input
                type="text"
                value={restrictedSector}
                onChange={(e) => setRestrictedSector(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Assigned Beat No. *</label>
              <input
                type="text"
                required
                value={restrictedBeat}
                onChange={(e) => setRestrictedBeat(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Allotted PIN Code *</label>
              <input
                type="text"
                required
                value={restrictedPincode}
                onChange={(e) => setRestrictedPincode(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Property Classification</label>
              <select
                value={restrictedPropType}
                onChange={(e) => setRestrictedPropType(e.target.value as any)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              >
                <option value="House">House</option>
                <option value="Commercial">Commercial</option>
                <option value="Mixed">Mixed</option>
                <option value="Flat / Residency">Flat / Residency</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Occupancy Status</label>
              <select
                value={restrictedStatus}
                onChange={(e) => setRestrictedStatus(e.target.value as any)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              >
                <option value="Occupied">Occupied</option>
                <option value="Vacant">Vacant</option>
                <option value="Commercial">Commercial</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Primary Resident / Owner Name</label>
              <input
                type="text"
                value={restrictedResidentName}
                onChange={(e) => setRestrictedResidentName(e.target.value)}
                placeholder="Optional resident name"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={restrictedMobile}
                onChange={(e) => setRestrictedMobile(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <SearchConsoleDuplicatePanel
                entityType="PROPERTY"
                propertyCheck={restrictedDupCheck}
                remark={restrictedRemark}
                onRemarkChange={setRestrictedRemark}
                layer1Ok={Boolean(
                  (restrictedHouseNo.trim() || restrictedStatus === 'Vacant') &&
                    restrictedColony.trim() &&
                    /^\d{6}$/.test(restrictedPincode.trim())
                )}
                layer2Ok={restrictedTerritoryCheck.allowed}
                layer2Reason={restrictedTerritoryCheck.reason}
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3 pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Verify &amp; Save Property in Allotted Area</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="properties-view-root">
      {/* Top View Selector Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-3 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveViewTab('sequence')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeViewTab === 'sequence'
              ? 'bg-indigo-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 size={16} className={activeViewTab === 'sequence' ? 'text-indigo-300' : 'text-slate-500'} />
          <span>Sequence-Wise Property Hub (Colony &rarr; Block &rarr; Seq)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveViewTab('unified')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeViewTab === 'unified'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Home size={16} className={activeViewTab === 'unified' ? 'text-slate-950' : 'text-amber-500'} />
          <span>Unified Property & Family Hub (Master Commercial & Residential)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveViewTab('grid')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeViewTab === 'grid'
              ? 'bg-blue-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building size={16} className={activeViewTab === 'grid' ? 'text-red-300' : 'text-slate-500'} />
          <span>All Properties & Vacancy Registry ({properties.length})</span>
        </button>
      </div>

      {activeViewTab === 'sequence' ? (
        <SequenceWisePropertyHub />
      ) : activeViewTab === 'unified' ? (
        <UnifiedPropertyFamilyHub />
      ) : (
        <>
          {/* Toast Alert */}
      {pendingConfirm && (
        <div className="bg-amber-50 border border-amber-300 text-amber-950 p-4 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold">{pendingConfirm.message}</span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={pendingConfirm.onConfirm}
              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Confirm Removal
            </button>
            <button
              type="button"
              onClick={() => setPendingConfirm(null)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {toastMessage && (
        <div className="bg-emerald-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300 border border-emerald-700">
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold tracking-wider uppercase border border-red-100 mb-2">
            <Building size={14} className="text-red-600" />
            <span>Dadabari S.O. · Postal Beat Property Registry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Property & Land Parcel Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical plots, houses, and building units mapped to delivery beats ({properties.length} Registered Properties)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedBeat}
            onChange={(e) => setSelectedBeat(e.target.value)}
            className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-900 focus:outline-hidden"
          >
            <option value="All">All Beats (1–34)</option>
            {Array.from({ length: 34 }, (_, i) => String(i + 1)).map((b) => (
              <option key={b} value={b}>Beat {b}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Properties ({stats.total})</option>
            <option value="Occupied">Occupied ({stats.occupied})</option>
            <option value="Vacant">Vacant ({stats.vacant})</option>
            <option value="MissingHouseNo">Missing House No ({stats.missingHouseNo})</option>
          </select>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search house no, sector, code..."
              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-red-600 focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => {
              setAddHouseNo('');
              setAddSector('Sector 6');
              setAddArea('Dadabari');
              setAddBeatNo('2');
              setAddPincode('324009');
              setAddPropType('House');
              setAddStatus('Occupied');
              setAddRemark('');
              setAddModalError(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Hierarchical Colony Quick-Filter Pills */}
      <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2 text-xs">
        <span className="font-black text-slate-700 flex items-center gap-1">
          <MapPin size={14} className="text-red-600" />
          <span>Colony Filter:</span>
        </span>
        {['All', 'Keshavpura', 'Basant Vihar', 'Dadabari', 'Mahaveer Nagar', 'Talwandi'].map((col) => (
          <button
            key={col}
            type="button"
            onClick={() => setSelectedColony(col)}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              selectedColony === col
                ? 'bg-gradient-to-r from-red-700 to-rose-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {col === 'All' ? 'All Colonies' : col}
          </button>
        ))}
      </div>

      {/* House Number & Vacancy Compliance Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 p-5 rounded-3xl border border-amber-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <span>House Number Verification & Vacancy Management Rule</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed max-w-3xl">
              <b>CRM Policy Enforced:</b> Entries without a verified house number have their members disassociated from the property, and the property status is updated to <b>Vacant</b>. When removing unnumbered properties, the underlying customer/member records are strictly preserved in the directory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleBulkVacateNoHouseNo}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Set all properties with missing house number to Vacant and remove members from property"
            >
              <UserX size={14} />
              <span>Set Missing House No. to Vacant</span>
            </button>
            <button
              onClick={handleBulkRemoveNoHouseNo}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Remove properties without house number from property list (preserves all customer members)"
            >
              <Trash2 size={14} />
              <span>Remove Properties (Keep Members)</span>
            </button>
          </div>
        </div>

        {/* Mini stats ribbon inside compliance bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-amber-200/70 text-xs">
          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
            <span className="text-slate-500 font-medium">Total Properties:</span>{' '}
            <b className="text-slate-900 font-mono">{stats.total}</b>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
            <span className="text-slate-500 font-medium">Occupied Units:</span>{' '}
            <b className="text-emerald-700 font-mono">{stats.occupied}</b>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
            <span className="text-slate-500 font-medium">Vacant Properties:</span>{' '}
            <b className="text-amber-800 font-mono">{stats.vacant}</b>
          </div>
          <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
            <span className="text-slate-500 font-medium">Missing House No:</span>{' '}
            <b className="text-red-700 font-mono">{stats.missingHouseNo}</b>
          </div>
        </div>
      </div>

      {/* Grid of Property Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
            <Building className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No properties found</h3>
            <p className="text-xs text-slate-500">
              No property records matched your search or filter criteria.
            </p>
          </div>
        ) : (
          paginatedProperties.map((prop) => {
            const hasHouseNo = Boolean(
              prop.housePlotNumber &&
              prop.housePlotNumber.trim() &&
              prop.housePlotNumber !== 'Plot Unit' &&
              prop.housePlotNumber.toLowerCase() !== 'n/a'
            );
            const residentCount = prop.residentNames?.length || 0;

            return (
              <div
                key={prop.id}
                className={`bg-white rounded-3xl border-2 transition p-5 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-0.5 ${
                  !hasHouseNo || prop.status === 'Vacant'
                    ? 'border-amber-300 bg-gradient-to-b from-amber-50/40 to-white'
                    : prop.status === 'Commercial'
                    ? 'border-indigo-300 bg-gradient-to-b from-indigo-50/40 to-white'
                    : 'border-emerald-200 hover:border-emerald-400 bg-gradient-to-b from-emerald-50/30 to-white'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-black text-white bg-slate-900 px-2.5 py-1 rounded-lg">
                      {prop.propertyCode || prop.id}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {!hasHouseNo && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          No House No
                        </span>
                      )}
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded font-bold ${
                          prop.status === 'Occupied'
                            ? 'bg-emerald-100 text-emerald-800'
                            : prop.status === 'Vacant'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {prop.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-1 flex items-center gap-2">
                    {hasHouseNo ? (
                      <span>House/Plot {prop.housePlotNumber}</span>
                    ) : (
                      <span className="text-amber-800 italic text-sm">
                        House No: Not Assigned (Unnumbered)
                      </span>
                    )}
                  </h3>

                  <p className="text-xs text-slate-600 mb-3 flex items-start gap-1">
                    <MapPin size={13} className="text-red-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{formatPropertyAddress(prop.address)}</span>
                  </p>

                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        Beat: <strong>Beat {prop.beatNo || '2'}</strong>
                      </span>
                      <span className="text-slate-500 font-medium">
                        Sector: <strong>{prop.sector || '7'}</strong>
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 font-medium pt-1 border-t border-slate-200 flex items-center justify-between">
                      <span>Residents ({residentCount}):</span>
                      {residentCount === 0 && (
                        <span className="text-[11px] text-amber-700 font-semibold">
                          (No members attached)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 min-h-6">
                      {residentCount > 0 ? (
                        prop.residentNames!.map((name, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-white border border-slate-200 text-slate-800 rounded text-xs font-medium"
                          >
                            {name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Vacant Unit · Members removed from property entry
                        </span>
                      )}
                    </div>

                    {(prop.staffAttribution || prop.submittedByStaffId) && (
                      <div className="pt-1.5 border-t border-slate-200/70">
                        <StaffAttributionLink
                          attribution={prop.staffAttribution}
                          staffId={prop.submittedByStaffId}
                          compact
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditProperty(prop)}
                      className="font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Edit
                    </button>
                    <span className="text-slate-300">•</span>
                    {prop.status !== 'Vacant' && (
                      <button
                        type="button"
                        onClick={() => handleMarkVacant(prop)}
                        className="font-semibold text-amber-700 hover:text-amber-800 cursor-pointer"
                        title="Set to Vacant and remove resident members"
                      >
                        Set Vacant
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveProperty(prop)}
                      className="text-slate-400 hover:text-red-700 flex items-center gap-1 font-semibold transition cursor-pointer"
                      title="Remove property entry (preserves customer/member profile)"
                    >
                      <Trash2 size={13} />
                      <span>Remove Property</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProperty(prop)}
                      className="font-bold text-red-700 hover:text-red-800 cursor-pointer"
                    >
                      View Info →
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Bar (5 properties per page) */}
      {filteredProperties.length > 0 && (
        <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-600 font-medium">
            Showing <span className="font-bold text-slate-900">{(safePropertyPage - 1) * PROPERTIES_PER_PAGE + 1}</span> to{' '}
            <span className="font-bold text-slate-900">{Math.min(safePropertyPage * PROPERTIES_PER_PAGE, filteredProperties.length)}</span> of{' '}
            <span className="font-bold text-slate-900">{filteredProperties.length}</span> properties (5 per page)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePropertyPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
            >
              Prev
            </button>
            <span className="font-bold text-slate-800 px-2">
              Page {safePropertyPage} / {totalPropertyPages}
            </span>
            <button
              type="button"
              disabled={safePropertyPage >= totalPropertyPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPropertyPages, p + 1))}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Property Detail Modal */}
      {selectedProperty && !isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-100">
                  {selectedProperty.propertyCode || selectedProperty.id}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-1">
                  {selectedProperty.housePlotNumber
                    ? `House/Plot ${selectedProperty.housePlotNumber}`
                    : 'Unassigned House Number'}
                </h3>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  selectedProperty.status === 'Occupied'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedProperty.status === 'Vacant'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {selectedProperty.status}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div>
                <strong>Address:</strong> {formatPropertyAddress(selectedProperty.address)}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <strong>Sector:</strong> {selectedProperty.sector}
                </div>
                <div>
                  <strong>Beat:</strong> Beat {selectedProperty.beatNo || '2'}
                </div>
                <div>
                  <strong>Pincode:</strong> {selectedProperty.pincode}
                </div>
                <div>
                  <strong>Area:</strong> {selectedProperty.area}
                </div>
              </div>
              {(selectedProperty.staffAttribution || selectedProperty.submittedByStaffId || selectedProperty.verificationMeta?.verifiedAt) && (
                <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  {(selectedProperty.staffAttribution || selectedProperty.submittedByStaffId) && (
                    <div>
                      <span className="font-bold text-slate-800 mr-1.5">Submitted By:</span>
                      <StaffAttributionLink
                        attribution={selectedProperty.staffAttribution}
                        staffId={selectedProperty.submittedByStaffId}
                        compact
                      />
                    </div>
                  )}
                  {selectedProperty.verificationMeta?.verifiedAt && (
                    <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={12} /> 3-Layer Verified &amp; Synced ({selectedProperty.verificationMeta.verifiedAt.slice(0, 10)})
                    </div>
                  )}
                  {selectedProperty.remark && (
                    <div className="text-[11px] text-slate-600">
                      <strong>Remark:</strong> {selectedProperty.remark}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Residents list */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Associated Residents ({selectedProperty.residentNames?.length || 0})</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">
                  CRM Member Records
                </span>
              </div>
              {selectedProperty.residentNames && selectedProperty.residentNames.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedProperty.residentNames.map((res, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                    >
                      <span className="font-semibold text-slate-800">{res}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveResident(res)}
                        className="text-red-600 hover:text-red-800 text-[11px] font-bold"
                        title="Remove resident from property entry (keeps customer profile)"
                      >
                        Remove from Property
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic py-2 text-center">
                  This property is currently Vacant with 0 resident members.
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleRemoveProperty(selectedProperty)}
                className="px-3.5 py-2 rounded-xl text-red-700 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Trash2 size={14} />
                <span>Remove Property (Keep Member)</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedProperty.status !== 'Vacant' && (
                  <button
                    type="button"
                    onClick={() => handleMarkVacant(selectedProperty)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition"
                  >
                    Mark Vacant
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedProperty(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {isEditModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-lg mb-4">
              Edit Property: {selectedProperty.propertyCode}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEditModalError(null);
                const hasValidNo = Boolean(editHousePlotNumber && editHousePlotNumber.trim());
                const finalStatus: Property['status'] = !hasValidNo ? 'Vacant' : editStatus;
                const commitRes = commonDataCentreService.verifyAndCommitProperty(
                  userProfile,
                  {
                    id: selectedProperty.id,
                    propertyCode: selectedProperty.propertyCode,
                    houseNo: editHousePlotNumber.trim(),
                    colony: selectedProperty.colony || selectedProperty.area || 'Dadabari',
                    sector: editSector || selectedProperty.sector || 'Sector 1',
                    pincode: selectedProperty.pincode || '324009',
                    beatNo: editBeatNo || selectedProperty.beatNo || '2',
                    officeId: selectedProperty.officeId,
                    propertyType: selectedProperty.propertyType || 'House',
                    status: finalStatus,
                    addressLine: editAddress || formatPropertyAddress(selectedProperty.address),
                    verificationStatus: hasValidNo,
                    notes: editRemark,
                  },
                  {
                    remark: editRemark,
                    isIntentionalEdit: true,
                  }
                );
                if (!commitRes.success || !commitRes.data) {
                  setEditModalError(commitRes.error || 'Three-Layer Verification failed.');
                  return;
                }
                setIsEditModalOpen(false);
                showToast(`3-Layer Verified: Property ${commitRes.data.propertyCode} updated & synced.`);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">House / Plot Number</label>
                <input
                  value={editHousePlotNumber}
                  onChange={(e) => setEditHousePlotNumber(e.target.value)}
                  placeholder="e.g. 101 or leave blank for unnumbered"
                  className="w-full p-2.5 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Address</label>
                <input
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Address"
                  className="w-full p-2.5 border rounded-xl text-xs"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Sector</label>
                  <input
                    value={editSector}
                    onChange={(e) => setEditSector(e.target.value)}
                    placeholder="Sector"
                    className="w-full p-2.5 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Beat No</label>
                  <input
                    value={editBeatNo}
                    onChange={(e) => setEditBeatNo(e.target.value)}
                    placeholder="Beat No"
                    className="w-full p-2.5 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Property['status'])}
                    className="w-full p-2.5 border rounded-xl text-xs bg-white"
                  >
                    <option value="Occupied">Occupied</option>
                    <option value="Vacant">Vacant</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t">
                <h4 className="text-xs font-bold text-slate-900 mb-2">
                  Residents Associated with Property ({selectedProperty.residentNames?.length || 0})
                </h4>
                <div className="space-y-1.5 mb-2 max-h-32 overflow-y-auto">
                  {selectedProperty.residentNames && selectedProperty.residentNames.length > 0 ? (
                    selectedProperty.residentNames.map((resName, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-slate-50 px-3 py-1.5 rounded-xl text-xs border border-slate-200"
                      >
                        <span className="font-semibold text-slate-800">{resName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveResident(resName)}
                          className="text-red-600 hover:text-red-800 text-[11px] font-bold"
                          title="Remove from property entry"
                        >
                          Remove from Property
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">No residents mapped. Property is Vacant.</div>
                  )}
                </div>
              </div>

              <SearchConsoleDuplicatePanel
                entityType="PROPERTY"
                propertyCheck={editPropDupCheck}
                remark={editRemark}
                onRemarkChange={setEditRemark}
                forceShowRemark
                layer1Ok={Boolean(editAddress.trim() && (editHousePlotNumber.trim() || editStatus === 'Vacant'))}
                layer2Ok={editTerritoryCheck.allowed}
                layer2Reason={editTerritoryCheck.reason}
              />

              {editModalError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-red-600" />
                  <span>{editModalError}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => handleRemoveProperty(selectedProperty)}
                  className="text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>Remove Property</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Verify &amp; Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Property Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Add New Property (Common Data Centre)</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAddModalError(null);
                const hasValidNo = Boolean(addHouseNo && addHouseNo.trim());
                const finalStatus = !hasValidNo ? 'Vacant' : addStatus;
                const commitRes = commonDataCentreService.verifyAndCommitProperty(
                  userProfile,
                  {
                    houseNo: addHouseNo.trim(),
                    colony: addArea.trim() || 'Dadabari',
                    sector: addSector.trim() || 'Sector 6',
                    pincode: addPincode.trim() || '324009',
                    beatNo: addBeatNo.trim() || '2',
                    propertyType: addPropType,
                    status: finalStatus,
                    verificationStatus: hasValidNo,
                    notes: addRemark,
                  },
                  {
                    remark: addRemark,
                  }
                );

                if (!commitRes.success || !commitRes.data) {
                  setAddModalError(commitRes.error || 'Three-Layer Verification failed.');
                  return;
                }

                setIsAddModalOpen(false);
                showToast(`3-Layer Verified: Property ${commitRes.data.propertyCode} registered (${commitRes.data.status}).`);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  House / Plot No (Leave empty to create Vacant Unnumbered plot)
                </label>
                <input
                  value={addHouseNo}
                  onChange={(e) => setAddHouseNo(e.target.value)}
                  placeholder="e.g. 101 or Plot 239"
                  className="w-full p-2.5 border rounded-xl text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sector</label>
                  <input
                    value={addSector}
                    onChange={(e) => setAddSector(e.target.value)}
                    placeholder="Sector"
                    className="w-full p-2.5 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Colony / Area *</label>
                  <input
                    required
                    value={addArea}
                    onChange={(e) => setAddArea(e.target.value)}
                    placeholder="Area"
                    className="w-full p-2.5 border rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Beat No</label>
                  <input
                    value={addBeatNo}
                    onChange={(e) => setAddBeatNo(e.target.value)}
                    placeholder="Beat No"
                    className="w-full p-2.5 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
                  <input
                    required
                    maxLength={6}
                    value={addPincode}
                    onChange={(e) => setAddPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="324009"
                    className="w-full p-2.5 border rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Property Type</label>
                  <select
                    value={addPropType}
                    onChange={(e) => setAddPropType(e.target.value as any)}
                    className="w-full p-2.5 border rounded-xl text-xs bg-white"
                  >
                    <option value="House">House</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Mixed">Mixed</option>
                    <option value="Flat / Residency">Flat / Residency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Occupancy Status</label>
                  <select
                    value={addStatus}
                    onChange={(e) => setAddStatus(e.target.value as any)}
                    className="w-full p-2.5 border rounded-xl text-xs bg-white"
                  >
                    <option value="Occupied">Occupied</option>
                    <option value="Vacant">Vacant</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
              </div>

              <SearchConsoleDuplicatePanel
                entityType="PROPERTY"
                propertyCheck={addPropDupCheck}
                remark={addRemark}
                onRemarkChange={setAddRemark}
                layer1Ok={Boolean(addArea.trim() && /^\d{6}$/.test(addPincode.trim()))}
                layer2Ok={addTerritoryCheck.allowed}
                layer2Reason={addTerritoryCheck.reason}
              />

              {addModalError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-red-600" />
                  <span>{addModalError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Verify &amp; Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
        </>
      )}
    </div>
  );
}

