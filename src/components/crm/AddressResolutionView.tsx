import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowRight,
  ShieldCheck,
  Upload,
  Plus,
  Trash2,
  Navigation,
  Sparkles,
  Building2,
  Phone,
  UserCheck,
  Layers,
  X,
} from 'lucide-react';
import { Customer, ColonyBeatMapping } from '../../types/models';
import { customerService } from '../../services/customerService';
import { staffPermissionService } from '../../services/staffPermissionService';
import CustomerProfileModal from '../customers/CustomerProfileModal';
import BulkAddressImport from './BulkAddressImport';

export default function AddressResolutionView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [colonyMappings, setColonyMappings] = useState<ColonyBeatMapping[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'COLONY_ENGINE' | 'RESOLUTION_WORKBENCH'>('COLONY_ENGINE');
  const [resolutionFilter, setResolutionFilter] = useState<'All' | 'Shifted' | 'MissingHouseNo' | 'UnresolvedSector'>('All');

  // Structured Address & Colony-Beat Mapping Form State
  const [showAddColonyModal, setShowAddColonyModal] = useState(false);
  const [colonyName, setColonyName] = useState('');
  const [sectorOrPhase, setSectorOrPhase] = useState('');
  const [landmark, setLandmark] = useState('');
  const [areaPincode, setAreaPincode] = useState('324009');
  const [subOrHeadOffice, setSubOrHeadOffice] = useState('Dadabari SO');
  const [branchOffice, setBranchOffice] = useState('');
  const [assignedBeatNumber, setAssignedBeatNumber] = useState('Beat 2');
  const [assignedPostmanName, setAssignedPostmanName] = useState('Mahendra Kumar Meena');
  const [assignedPostmanMobile, setAssignedPostmanMobile] = useState('8769706002');
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Live Address & Route Lookup Simulator
  const [lookupColony, setLookupColony] = useState('Keshavpura');
  const [lookupSector, setLookupSector] = useState('Sector 7');
  const [lookupPincode, setLookupPincode] = useState('324009');
  const [searchMappingTerm, setSearchMappingTerm] = useState('');

  const refreshAll = () => {
    setCustomers([...customerService.getCustomers()]);
    setColonyMappings([...staffPermissionService.getColonyBeatMappings()]);
  };

  useEffect(() => {
    refreshAll();
    const unsubCust = customerService.subscribe(refreshAll);
    const unsubStaff = staffPermissionService.subscribe(refreshAll);
    return () => {
      unsubCust();
      unsubStaff();
    };
  }, []);

  const liveResolvedRoute = useMemo(() => {
    if (!lookupColony.trim() && !lookupSector.trim()) return null;
    return staffPermissionService.resolveColonyBeat(lookupColony, lookupSector, lookupPincode);
  }, [lookupColony, lookupSector, lookupPincode, colonyMappings]);

  const filteredMappings = useMemo(() => {
    if (!searchMappingTerm.trim()) return colonyMappings;
    const q = searchMappingTerm.toLowerCase();
    return colonyMappings.filter(
      (m) =>
        m.colonyName.toLowerCase().includes(q) ||
        (m.sectorOrPhase || '').toLowerCase().includes(q) ||
        (m.landmark || '').toLowerCase().includes(q) ||
        m.areaPincode.includes(q) ||
        m.subOrHeadOffice.toLowerCase().includes(q) ||
        m.assignedBeatNumber.toLowerCase().includes(q) ||
        (m.assignedPostmanName || '').toLowerCase().includes(q)
    );
  }, [colonyMappings, searchMappingTerm]);

  const addressIssues = useMemo(() => {
    return (
      customers?.filter((c) => {
        const isShifted =
          c.remarks?.toLowerCase().includes('left') ||
          c.remarks?.toLowerCase().includes('moved') ||
          c.remarks?.toLowerCase().includes('naya gaon');
        const isMissingHouse = !c.houseNo && !c.address?.houseNumber;
        const isUnresolvedSector = !c.sector || c.sector === 'Keshavpura';

        if (resolutionFilter === 'Shifted') return isShifted;
        if (resolutionFilter === 'MissingHouseNo') return isMissingHouse;
        if (resolutionFilter === 'UnresolvedSector') return isUnresolvedSector;

        return isShifted || isMissingHouse || isUnresolvedSector;
      }) || []
    );
  }, [customers, resolutionFilter]);

  const handleSaveColonyMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colonyName.trim() || !assignedBeatNumber.trim()) return;

    const saved = staffPermissionService.addOrUpdateColonyMapping({
      colonyName: colonyName.trim(),
      sectorOrPhase: sectorOrPhase.trim() || undefined,
      landmark: landmark.trim() || undefined,
      areaPincode: areaPincode.trim() || '324009',
      subOrHeadOffice: subOrHeadOffice.trim() || 'Dadabari SO',
      branchOffice: branchOffice.trim() || undefined,
      assignedBeatNumber: assignedBeatNumber.trim(),
      assignedPostmanName: assignedPostmanName.trim() || undefined,
      assignedPostmanMobile: assignedPostmanMobile.trim() || undefined,
    });

    setBannerNotice(
      `Colony-Beat Mapping Saved: "${saved.colonyName}${saved.sectorOrPhase ? ` (${saved.sectorOrPhase})` : ''}" → ${saved.assignedBeatNumber} (${saved.subOrHeadOffice} - ${saved.areaPincode})`
    );
    setShowAddColonyModal(false);
    setColonyName('');
    setSectorOrPhase('');
    setLandmark('');
    refreshAll();
    setTimeout(() => setBannerNotice(null), 5000);
  };

  const handleDeleteMapping = (id: string) => {
    staffPermissionService.deleteColonyMapping(id);
    refreshAll();
  };

  const handleResolveStandardAddress = (c: Customer, mapping?: ColonyBeatMapping | null) => {
    const resolvedSector = mapping?.sectorOrPhase || c.sector || 'Sector 7';
    const resolvedColony = mapping?.colonyName || c.area || 'Keshavpura';
    const resolvedBeat = (mapping?.assignedBeatNumber || 'Beat 2').replace(/^Beat\s+/i, '');
    const resolvedPin = mapping?.areaPincode || '324009';
    const resolvedOffice = mapping?.subOrHeadOffice || 'Dadabari SO';

    const updated: Customer = {
      ...c,
      sector: resolvedSector,
      area: resolvedColony,
      beatNo: resolvedBeat,
      verificationStatus: 'Field Confirmed',
      address: {
        ...c.address,
        houseNumber: c.houseNo || c.address?.houseNumber || 'Plot Unit',
        sectorLocality: resolvedSector,
        area: resolvedColony,
        landmark: mapping?.landmark || c.address?.landmark || '',
        pincode: resolvedPin,
        fullAddress: `${c.houseNo || 'H.No'}, ${resolvedSector}, ${resolvedColony}${
          mapping?.landmark ? ` (Near ${mapping.landmark})` : ''
        }, ${resolvedOffice} - ${resolvedPin}`,
      },
    };
    customerService.addOrUpdateCustomer(updated, 'Colony-Beat Mapping Standardization Engine');
    setBannerNotice(
      `Customer "${c.name}" automatically mapped to ${resolvedColony} (${resolvedSector}) → Beat ${resolvedBeat} (${resolvedOffice} - ${resolvedPin})!`
    );
    setTimeout(() => setBannerNotice(null), 4000);
  };

  return (
    <div className="space-y-6" id="address-resolution-view-root">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-red-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles size={13} /> Structured Address & Delivery Route Intelligence
            </div>
            <h2 className="text-2xl font-black flex items-center gap-2.5">
              <MapPin size={26} className="text-amber-400" />
              <span>Enhanced Address & Colony-Beat Mapping Engine</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Automatically map specific Colonies, Sectors/Phases, and Landmarks to assigned Beats, Pincodes, and Sub/Head Offices for instant customer lookups, delivery routing, and follow-up assignment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddColonyModal(true)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md"
            >
              <Plus size={15} />
              <span>Add Colony-Beat Mapping</span>
            </button>
            <button
              onClick={() => setShowBulkImport(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Upload size={15} />
              <span>Bulk Address Import</span>
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveMainTab('COLONY_ENGINE')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeMainTab === 'COLONY_ENGINE'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            <Navigation size={14} />
            <span>1. Colony-Sector-Beat Mapping Directory ({colonyMappings.length})</span>
          </button>
          <button
            onClick={() => setActiveMainTab('RESOLUTION_WORKBENCH')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeMainTab === 'RESOLUTION_WORKBENCH'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            <ShieldCheck size={14} />
            <span>2. Customer Address Standardization Workbench ({addressIssues.length})</span>
          </button>
        </div>
      </div>

      {bannerNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-5 py-3.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{bannerNotice}</span>
          </div>
          <button onClick={() => setBannerNotice(null)} className="text-emerald-700 hover:text-emerald-950">
            <X size={16} />
          </button>
        </div>
      )}

      {activeMainTab === 'COLONY_ENGINE' ? (
        <div className="space-y-6">
          {/* Interactive Route & Beat Auto-Resolver Simulator */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Navigation size={16} className="text-red-700" />
                  <span>Instant Colony / Sector → Beat & Postman Route Resolver</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Type any Colony Name, Sector/Phase, or Pincode to test automatic Beat & Delivery Office routing
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Colony / Area Name</label>
                <input
                  value={lookupColony}
                  onChange={(e) => setLookupColony(e.target.value)}
                  placeholder="e.g. Keshavpura, Patel Nagar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Sector Number / Phase</label>
                <input
                  value={lookupSector}
                  onChange={(e) => setLookupSector(e.target.value)}
                  placeholder="e.g. Sector 7, Sector 4, Phase 1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Area Pincode</label>
                <input
                  value={lookupPincode}
                  onChange={(e) => setLookupPincode(e.target.value)}
                  placeholder="324009"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-semibold bg-slate-50"
                />
              </div>

              <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-2xl p-3.5 text-xs">
                {liveResolvedRoute ? (
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-red-800 text-sm">
                        {liveResolvedRoute.assignedBeatNumber}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                        PIN {liveResolvedRoute.areaPincode}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 mt-1">
                      Office: {liveResolvedRoute.subOrHeadOffice}
                      {liveResolvedRoute.branchOffice ? ` (${liveResolvedRoute.branchOffice})` : ''}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Postman: <strong>{liveResolvedRoute.assignedPostmanName || 'Beat Staff'}</strong>{' '}
                      {liveResolvedRoute.assignedPostmanMobile ? `(${liveResolvedRoute.assignedPostmanMobile})` : ''}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 py-2">
                    No matching Colony-Beat rule found. Click <strong>Add Colony-Beat Mapping</strong> to register.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Structured Colony-Beat Mapping Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Structured Colony, Sector & Beat Mapping Matrix ({filteredMappings.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Every staff member entry and manual mapping automatically updates this routing table
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchMappingTerm}
                  onChange={(e) => setSearchMappingTerm(e.target.value)}
                  placeholder="Search colony, sector, landmark, beat..."
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/80 text-slate-600 uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Colony Name</th>
                    <th className="p-3.5">Sector / Phase</th>
                    <th className="p-3.5">Landmark</th>
                    <th className="p-3.5">Area Pincode</th>
                    <th className="p-3.5">Sub Office / HO Mapping</th>
                    <th className="p-3.5">Assigned Beat No.</th>
                    <th className="p-3.5">Assigned Postman / Staff</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMappings.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{m.colonyName}</td>
                      <td className="p-3.5">
                        {m.sectorOrPhase ? (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded font-semibold">
                            {m.sectorOrPhase}
                          </span>
                        ) : (
                          <span className="text-slate-400">Main / All</span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600">{m.landmark || '—'}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">{m.areaPincode}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800">{m.subOrHeadOffice}</span>
                        {m.branchOffice && (
                          <span className="block text-[10px] text-amber-800 font-bold">BO: {m.branchOffice}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg font-mono font-black">
                          {m.assignedBeatNumber}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{m.assignedPostmanName || 'Beat Staff'}</div>
                        {m.assignedPostmanMobile && (
                          <div className="text-[11px] font-mono text-emerald-700">{m.assignedPostmanMobile}</div>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteMapping(m.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                          title="Remove Mapping"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 text-xs font-semibold overflow-x-auto pb-1">
            {[
              { id: 'All', label: 'All Ambiguous Addresses' },
              { id: 'Shifted', label: 'Shifted / Relocated Residents' },
              { id: 'MissingHouseNo', label: 'Missing House / KH Number' },
              { id: 'UnresolvedSector', label: 'Sector Ambiguities' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setResolutionFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
                  resolutionFilter === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Issues Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="text-[11px] text-slate-600 uppercase bg-slate-100/80 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Master ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Raw Address in Master</th>
                    <th className="px-4 py-3">Field Remarks / Anomaly</th>
                    <th className="px-4 py-3">Auto-Resolved Colony-Beat Route</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {addressIssues.map((c) => {
                    const isShifted =
                      c.remarks?.toLowerCase().includes('left') ||
                      c.remarks?.toLowerCase().includes('moved') ||
                      c.remarks?.toLowerCase().includes('naya gaon');
                    const matchedRoute = staffPermissionService.resolveColonyBeat(
                      c.area || 'Keshavpura',
                      c.sector || 'Sector 7',
                      c.address?.pincode || '324009'
                    );
                    return (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{c.masterId || c.id}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{c.name}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {c.address?.fullAddress || `${c.houseNo || 'No House No'}, ${c.sector || c.area || ''}`}
                        </td>
                        <td className="px-4 py-3">
                          <div
                            className={`p-2 rounded-lg text-[11px] font-medium ${
                              isShifted
                                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {c.remarks || 'Incomplete sector details'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {matchedRoute ? (
                            <div>
                              <span className="font-bold text-red-700">
                                {matchedRoute.assignedBeatNumber} • {matchedRoute.subOrHeadOffice} (
                                {matchedRoute.areaPincode})
                              </span>
                              <div className="text-[10px] text-slate-500">
                                {matchedRoute.colonyName} {matchedRoute.sectorOrPhase || ''} • Postman:{' '}
                                {matchedRoute.assignedPostmanName || 'Assigned'}
                              </div>
                            </div>
                          ) : (
                            <span className="font-semibold text-slate-900">
                              {isShifted
                                ? 'Tag as Relocated / Mandaliya BO'
                                : 'Map to Sector 7, Beat 2 (Dadabari SO)'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleResolveStandardAddress(c, matchedRoute)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs transition"
                          >
                            Auto-Standardize
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Structured Colony-Beat Mapping Modal */}
      {showAddColonyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-red-800 to-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">Add Structured Colony-Beat Mapping</h3>
                <p className="text-xs text-red-100">
                  Map Colony, Sector/Phase, Landmark & Pincode to Sub/Head Office and Beat Number
                </p>
              </div>
              <button
                onClick={() => setShowAddColonyModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveColonyMapping} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Colony Name *</label>
                  <input
                    required
                    placeholder="e.g. Keshavpura / Mahaveer Nagar"
                    value={colonyName}
                    onChange={(e) => setColonyName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sector Number / Phase (if available)</label>
                  <input
                    placeholder="e.g. Sector 7 / Phase II"
                    value={sectorOrPhase}
                    onChange={(e) => setSectorOrPhase(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prominent Landmark</label>
                  <input
                    placeholder="e.g. Near Tejaji Mandir / Modi College"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Area Pincode *</label>
                  <input
                    required
                    placeholder="324009"
                    value={areaPincode}
                    onChange={(e) => setAreaPincode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sub Office / HO Mapping *</label>
                  <input
                    required
                    placeholder="Dadabari SO"
                    value={subOrHeadOffice}
                    onChange={(e) => setSubOrHeadOffice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch Office (BO - optional)</label>
                  <input
                    placeholder="e.g. Mandaliya BO"
                    value={branchOffice}
                    onChange={(e) => setBranchOffice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Beat Number *</label>
                  <input
                    required
                    placeholder="Beat 2"
                    value={assignedBeatNumber}
                    onChange={(e) => setAssignedBeatNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-red-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Postman / Staff Name</label>
                  <input
                    placeholder="Mahendra Kumar Meena"
                    value={assignedPostmanName}
                    onChange={(e) => setAssignedPostmanName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Mobile Number</label>
                  <input
                    placeholder="8769706002"
                    value={assignedPostmanMobile}
                    onChange={(e) => setAssignedPostmanMobile(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddColonyModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black shadow-md"
                >
                  Save Colony-Beat Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <CustomerProfileModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
      {showBulkImport && <BulkAddressImport onClose={() => setShowBulkImport(false)} />}
    </div>
  );
}
