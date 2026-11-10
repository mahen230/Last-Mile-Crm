import React, { useState, useEffect, useMemo } from 'react';
import {
  Building,
  Search,
  Download,
  Plus,
  RefreshCw,
  MapPin,
  Users,
  CheckCircle2,
  Shield,
  Filter,
  Layers,
  X,
  Building2,
  Navigation,
  Sparkles,
  FileSpreadsheet,
  Check,
  Compass,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { staffPermissionService } from '../../services/staffPermissionService';
import { DynamicOfficeRecord, StaffProfile } from '../../types/models';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';

export default function OfficeMasterView() {
  const { userProfile } = useAuth();
  const isSuperAdmin = staffPermissionService.isSuperAdmin(userProfile);

  const [offices, setOffices] = useState<DynamicOfficeRecord[]>([]);
  const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<DynamicOfficeRecord | null>(null);

  // Division Quick Tabs
  const [activeDivisionTab, setActiveDivisionTab] = useState<'ALL' | 'KOTA' | 'BARAN' | 'BUNDI' | 'OTHERS'>('ALL');

  // Drill-down filters
  const [filterCircle, setFilterCircle] = useState<string>('ALL');
  const [filterDivision, setFilterDivision] = useState<string>('ALL');
  const [filterOfficeType, setFilterOfficeType] = useState<string>('ALL');
  const [filterPincode, setFilterPincode] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Quick Pincode Radar Lookup State
  const [pincodeRadarInput, setPincodeRadarInput] = useState<string>('');

  // Quick Add Office + Staff Mapping Modal
  const [showAddOfficeModal, setShowAddOfficeModal] = useState(false);
  const [newCircle, setNewCircle] = useState('Rajasthan Circle');
  const [newDivision, setNewDivision] = useState('Kota Division');
  const [newHoName, setNewHoName] = useState('Kota H.O. (324001)');
  const [newSoName, setNewSoName] = useState('');
  const [newBoName, setNewBoName] = useState('');
  const [newOfficeType, setNewOfficeType] = useState<'HO' | 'SO' | 'BO'>('SO');
  const [newPincode, setNewPincode] = useState('324009');
  const [newAddress, setNewAddress] = useState('');
  const [newBeats, setNewBeats] = useState('Beat 1, Beat 2');
  const [newColonies, setNewColonies] = useState('');
  const [newInchargeName, setNewInchargeName] = useState('');
  const [newInchargeEmpId, setNewInchargeEmpId] = useState('');
  const [newInchargeMobile, setNewInchargeMobile] = useState('');
  const [newInchargeDesig, setNewInchargeDesig] = useState<'PA (Postal Assistant)' | 'Postman' | 'GDS (BPM / ABPM / Dak Sevak)' | 'Sub Postmaster (SPM)'>('Sub Postmaster (SPM)');
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const refreshData = () => {
    setOffices([...staffPermissionService.getDynamicOffices()]);
    setStaffProfiles([...staffPermissionService.getAllStaffProfiles()]);
  };

  useEffect(() => {
    refreshData();
    const unsub = staffPermissionService.subscribe(refreshData);
    return () => unsub();
  }, []);

  const hierarchy = useMemo(
    () => staffPermissionService.getHierarchyOptions(),
    [offices, staffProfiles]
  );

  // Pre-computed division counts
  const kotaOffices = useMemo(() => offices.filter((o) => o.division === 'Kota Division'), [offices]);
  const baranOffices = useMemo(() => offices.filter((o) => o.division === 'Baran Division'), [offices]);
  const bundiOffices = useMemo(() => offices.filter((o) => o.division === 'Bundi Division'), [offices]);
  const otherOffices = useMemo(
    () => offices.filter((o) => o.division !== 'Kota Division' && o.division !== 'Baran Division' && o.division !== 'Bundi Division'),
    [offices]
  );

  // Fast Pincode Radar matched office
  const radarMatchedOffice = useMemo(() => {
    if (!pincodeRadarInput.trim()) return null;
    const cleanPin = pincodeRadarInput.trim().toLowerCase();
    return offices.find(
      (o) =>
        o.pincode === cleanPin ||
        o.officeName.toLowerCase().includes(cleanPin) ||
        o.soName.toLowerCase().includes(cleanPin)
    ) || null;
  }, [offices, pincodeRadarInput]);

  const filteredOffices = useMemo(() => {
    return offices.filter((o) => {
      // Scoped visibility for non-super-admin
      if (!isSuperAdmin && userProfile) {
        const allowedOffices = userProfile.permissions?.allowedOffices || ['ALL'];
        if (!allowedOffices.includes('ALL')) {
          const matchesAllowed = allowedOffices.some(
            (ao) =>
              o.officeName.toLowerCase().includes(ao.toLowerCase()) ||
              o.soName.toLowerCase().includes(ao.toLowerCase()) ||
              (o.boName && o.boName.toLowerCase().includes(ao.toLowerCase()))
          );
          if (!matchesAllowed && o.pincode !== userProfile.officePincode) {
            return false;
          }
        }
      }

      // Quick Tab Filter
      if (activeDivisionTab === 'KOTA' && o.division !== 'Kota Division') return false;
      if (activeDivisionTab === 'BARAN' && o.division !== 'Baran Division') return false;
      if (activeDivisionTab === 'BUNDI' && o.division !== 'Bundi Division') return false;
      if (
        activeDivisionTab === 'OTHERS' &&
        (o.division === 'Kota Division' || o.division === 'Baran Division' || o.division === 'Bundi Division')
      )
        return false;

      // Dropdown filters
      if (filterCircle !== 'ALL' && o.circle !== filterCircle) return false;
      if (filterDivision !== 'ALL' && o.division !== filterDivision) return false;
      if (filterOfficeType !== 'ALL' && o.officeType !== filterOfficeType) return false;
      if (filterPincode.trim() && !o.pincode.includes(filterPincode.trim())) return false;

      // Text search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = o.officeName.toLowerCase().includes(q);
        const matchHo = o.hoName.toLowerCase().includes(q);
        const matchSo = o.soName.toLowerCase().includes(q);
        const matchBo = (o.boName || '').toLowerCase().includes(q);
        const matchPin = o.pincode.includes(q);
        const matchAddr = o.completeAddress.toLowerCase().includes(q);
        const matchBeat = o.mappedBeats.some((b) => b.toLowerCase().includes(q));
        const matchColony = o.mappedColonies.some((c) => c.toLowerCase().includes(q));
        if (!matchName && !matchHo && !matchSo && !matchBo && !matchPin && !matchAddr && !matchBeat && !matchColony) {
          return false;
        }
      }

      return true;
    });
  }, [
    offices,
    isSuperAdmin,
    userProfile,
    activeDivisionTab,
    filterCircle,
    filterDivision,
    filterOfficeType,
    filterPincode,
    searchTerm,
  ]);

  const handleExportOffices = (targetDivision?: string) => {
    const listToExport = targetDivision
      ? offices.filter((o) => o.division === targetDivision)
      : filteredOffices;

    const rows = listToExport.map((o) => ({
      'Office ID': o.id,
      'Office Name': o.officeName,
      'Office Type': o.officeType,
      Circle: o.circle,
      Division: o.division,
      District: o.district || (o.division.includes('Kota') ? 'Kota' : o.division.includes('Baran') ? 'Baran' : o.division.includes('Bundi') ? 'Bundi' : 'N/A'),
      'Sub-Division': o.subDivision || 'Postal Sub-Division',
      'Head Office (HO)': o.hoName,
      'Sub Office (SO)': o.soName,
      'Branch Office (BO)': o.boName || 'Direct Delivery',
      Pincode: o.pincode,
      'Complete Office Address': o.completeAddress,
      'Mapped Beats': o.mappedBeats.join(', '),
      'Mapped Colonies & Sectors': o.mappedColonies.join(', '),
      'Assigned Staff Count': o.staffCount,
      'Last Synced': new Date(o.updatedAt).toLocaleString('en-IN'),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    const sheetName = targetDivision ? targetDivision.replace(' Division', '') : 'All_Offices';
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
    const filename = `IndiaPost_${sheetName}_Offices_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  // Sync HO preset when division is changed in Modal
  const handleModalDivisionChange = (div: string) => {
    setNewDivision(div);
    if (div === 'Kota Division') {
      setNewHoName('Kota H.O. (324001)');
      setNewPincode('324009');
    } else if (div === 'Baran Division') {
      setNewHoName('Baran H.O. (325205)');
      setNewPincode('325205');
    } else if (div === 'Bundi Division') {
      setNewHoName('Bundi H.O. (323001)');
      setNewPincode('323001');
    } else if (div === 'Jhalawar Division') {
      setNewHoName('Jhalawar H.O. (326001)');
      setNewPincode('326001');
    } else if (div === 'Tonk Division') {
      setNewHoName('Tonk H.O. (304001)');
      setNewPincode('304001');
    }
  };

  const handleCreateOfficeViaStaffEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const targetOfficeName =
      newOfficeType === 'BO'
        ? newBoName.trim() || 'New Branch Post Office (BO)'
        : newOfficeType === 'HO'
        ? newHoName.trim()
        : newSoName.trim() || 'New Sub Post Office (SO)';

    const beatsArr = newBeats
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);
    const coloniesArr = newColonies
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    staffPermissionService.upsertStaffAndSyncEntities({
      name: newInchargeName.trim() || `Postmaster (${targetOfficeName})`,
      contact: newInchargeMobile.trim() || '9414000000',
      employeeId: newInchargeEmpId.trim() || `EMP-${Date.now().toString().slice(-6)}`,
      designation: newInchargeDesig,
      circle: newCircle.trim() || 'Rajasthan Circle',
      division: newDivision.trim() || 'Kota Division',
      headOffice: newHoName.trim() || 'Kota H.O. (324001)',
      subOffice: newSoName.trim() || targetOfficeName,
      branchOffice: newOfficeType === 'BO' ? newBoName.trim() || targetOfficeName : undefined,
      officePincode: newPincode.trim() || '324009',
      completeOfficeAddress:
        newAddress.trim() || `${targetOfficeName}, ${newDivision}, ${newCircle} - ${newPincode}`,
      assignedOffice: `${targetOfficeName} (${newPincode})`,
      beat: beatsArr[0] || 'Beat 1',
      assignedBeats: beatsArr.length ? beatsArr : ['Beat 1'],
      deliveryOfficeMappings: [targetOfficeName],
      assignedColonies: coloniesArr.length ? coloniesArr : [targetOfficeName],
    });

    setBannerMessage(
      `Registered Office "${targetOfficeName} (${newPincode})" for ${newDivision} successfully saved to office database!`
    );
    setShowAddOfficeModal(false);
    setNewSoName('');
    setNewBoName('');
    setNewAddress('');
    setNewColonies('');
    setNewInchargeName('');
    setNewInchargeEmpId('');
    setNewInchargeMobile('');
    refreshData();
    setTimeout(() => setBannerMessage(null), 5000);
  };

  return (
    <div className="space-y-6" id="office-master-view-root">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-red-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles size={13} /> Complete Hadoti Postal Database • Kota • Baran • Bundi
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              <Building size={26} className="text-amber-400" />
              <span>Registered Post Office Master & Territory Database</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Official centralized registry managing every registered PIN code, Sub-Post Office (S.O.), Head Office (H.O.), Branch Office (B.O.), Beat mapping, and delivery staff for <strong>Kota Division</strong>, <strong>Baran Division</strong>, and <strong>Bundi Division</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleExportOffices()}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Download full database as Excel sheet"
            >
              <Download size={15} className="text-amber-400" />
              <span>Export Full Excel ({filteredOffices.length})</span>
            </button>

            <Link
              to="/staff-master"
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md"
            >
              <Users size={15} />
              <span>Staff & Beat Directory</span>
            </Link>

            <button
              onClick={() => setShowAddOfficeModal(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md cursor-pointer"
            >
              <Plus size={15} />
              <span>+ Register New Post Office</span>
            </button>
          </div>
        </div>

        {/* Division Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-5 pt-5 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Total Registered Offices</div>
            <div className="text-2xl font-black text-white mt-0.5">{offices.length}</div>
            <div className="text-[10px] text-amber-300 mt-0.5">HO / SO / BO Master Network</div>
          </div>

          <div
            onClick={() => setActiveDivisionTab('KOTA')}
            className={`rounded-2xl p-3.5 border transition cursor-pointer ${
              activeDivisionTab === 'KOTA'
                ? 'bg-red-900/60 border-amber-400 ring-2 ring-amber-300/40'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>Kota Division</span>
              <span className="text-[9px] bg-red-800 px-1.5 py-0.2 rounded font-mono">324001-325219</span>
            </div>
            <div className="text-2xl font-black text-amber-300 mt-0.5">{kotaOffices.length}</div>
            <div className="text-[10px] text-slate-300 mt-0.5">Dadabari SO Base Hub</div>
          </div>

          <div
            onClick={() => setActiveDivisionTab('BARAN')}
            className={`rounded-2xl p-3.5 border transition cursor-pointer ${
              activeDivisionTab === 'BARAN'
                ? 'bg-red-900/60 border-amber-400 ring-2 ring-amber-300/40'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>Baran Division</span>
              <span className="text-[9px] bg-emerald-950 px-1.5 py-0.2 rounded font-mono">325202-325226</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">{baranOffices.length}</div>
            <div className="text-[10px] text-slate-300 mt-0.5">Baran HO, Anta, Chhabra</div>
          </div>

          <div
            onClick={() => setActiveDivisionTab('BUNDI')}
            className={`rounded-2xl p-3.5 border transition cursor-pointer ${
              activeDivisionTab === 'BUNDI'
                ? 'bg-red-900/60 border-amber-400 ring-2 ring-amber-300/40'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="text-[11px] text-sky-300 font-semibold uppercase tracking-wider flex items-center justify-between">
              <span>Bundi Division</span>
              <span className="text-[9px] bg-sky-950 px-1.5 py-0.2 rounded font-mono">323001-323805</span>
            </div>
            <div className="text-2xl font-black text-sky-400 mt-0.5">{bundiOffices.length}</div>
            <div className="text-[10px] text-slate-300 mt-0.5">Bundi HO, Lakheri, Nainwa</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">PIN Codes Indexed</div>
            <div className="text-2xl font-black text-purple-300 mt-0.5">
              {new Set(offices.map((o) => o.pincode)).size}
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">100% Pincode Coverage</div>
          </div>
        </div>
      </div>

      {bannerMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-5 py-3.5 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{bannerMessage}</span>
          </div>
          <button onClick={() => setBannerMessage(null)} className="text-emerald-700 hover:text-emerald-950">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* HADOTI PINCODE & REGISTERED POST OFFICE FAST RADAR TOOL */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 border border-slate-700 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
              <Compass size={22} />
            </div>
            <div>
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <span>Hadoti Registered PIN Code Lookup Radar</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Instant Post Office Match
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Type any 6-digit PIN code across Kota, Baran, or Bundi (e.g. 325205, 323001, 324009, 325220, 323801, 325004, 325202)
              </p>
            </div>
          </div>

          {/* Quick PIN Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">Quick Test:</span>
            {['324009', '325205', '323001', '325220', '323801', '325004', '325202', '324010'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPincodeRadarInput(p)}
                className={`px-2 py-1 rounded-lg font-mono font-bold transition cursor-pointer ${
                  pincodeRadarInput === p
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Radar Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={pincodeRadarInput}
            onChange={(e) => setPincodeRadarInput(e.target.value)}
            placeholder="Search by PIN Code (e.g. 325205), Post Office name (e.g. Anta, Chhabra, Lakheri), or Sub-Division..."
            className="w-full pl-12 pr-10 py-3 bg-slate-950/90 border border-slate-700 rounded-2xl text-white font-semibold text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
          {pincodeRadarInput && (
            <button
              onClick={() => setPincodeRadarInput('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Radar Match Result Card */}
        {radarMatchedOffice && (
          <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md font-black text-xs bg-amber-400 text-slate-950">
                    {radarMatchedOffice.officeType} • PIN {radarMatchedOffice.pincode}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                    {radarMatchedOffice.division}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    District: {radarMatchedOffice.district || 'Rajasthan'} • Sub-Div: {radarMatchedOffice.subDivision}
                  </span>
                </div>
                <h4 className="text-lg font-black text-white">{radarMatchedOffice.officeName}</h4>
                <p className="text-xs text-slate-300">{radarMatchedOffice.completeAddress}</p>
                <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                  <span>
                    <strong>Head Office:</strong> {radarMatchedOffice.hoName}
                  </span>
                  <span>•</span>
                  <span>
                    <strong>Mapped Delivery Beats:</strong> {radarMatchedOffice.mappedBeats.join(', ') || 'General Delivery'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setFilterPincode(radarMatchedOffice.pincode);
                    setSearchTerm('');
                  }}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Filter size={14} />
                  <span>Filter Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOffice(radarMatchedOffice)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-600"
                >
                  <Eye size={14} />
                  <span>Full Dossier</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* DIVISION TABS & HIERARCHICAL DRILL-DOWN FILTERS           */}
      {/* ======================================================== */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Division Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Registered Offices', count: offices.length, color: 'bg-slate-900 text-white' },
              { id: 'KOTA', label: '📮 Kota Division', count: kotaOffices.length, color: 'bg-red-700 text-white' },
              { id: 'BARAN', label: '🌾 Baran Division', count: baranOffices.length, color: 'bg-emerald-700 text-white' },
              { id: 'BUNDI', label: '🏰 Bundi Division', count: bundiOffices.length, color: 'bg-sky-700 text-white' },
              { id: 'OTHERS', label: 'Jhalawar & Tonk', count: otherOffices.length, color: 'bg-purple-700 text-white' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDivisionTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeDivisionTab === tab.id
                    ? `${tab.color} shadow-sm ring-2 ring-red-400/40`
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-black/20">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveDivisionTab('ALL');
                setFilterCircle('ALL');
                setFilterDivision('ALL');
                setFilterOfficeType('ALL');
                setFilterPincode('');
                setSearchTerm('');
                setPincodeRadarInput('');
              }}
              className="text-xs font-bold text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} /> Reset All Filters
            </button>
          </div>
        </div>

        {/* Detailed Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">1. Division</label>
            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800"
            >
              <option value="ALL">All Divisions ({hierarchy.divisions.length})</option>
              {hierarchy.divisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">2. Office Category</label>
            <select
              value={filterOfficeType}
              onChange={(e) => setFilterOfficeType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800"
            >
              <option value="ALL">All Categories (HO / SO / BO)</option>
              <option value="HO">Head Post Office (HO)</option>
              <option value="SO">Sub Post Office (SO)</option>
              <option value="BO">Branch Post Office (BO)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">3. Filter by Pincode</label>
            <input
              type="text"
              placeholder="e.g. 325205 or 323001"
              value={filterPincode}
              onChange={(e) => setFilterPincode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-mono font-semibold text-slate-800"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">4. Search Office, Head Office, Beat or Area</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Dadabari, Anta, Bundi, Chhabra, Lakheri, Keshavpura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* REGISTERED POST OFFICE DIRECTORY TABLE                   */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/80">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <span>Showing</span>
            <span className="px-2 py-0.5 rounded-md bg-red-700 text-white font-black font-mono">
              {filteredOffices.length}
            </span>
            <span>Registered Post Offices in Database</span>
            {activeDivisionTab !== 'ALL' && (
              <span className="text-slate-500 font-normal">
                (Filtered by {activeDivisionTab === 'KOTA' ? 'Kota' : activeDivisionTab === 'BARAN' ? 'Baran' : activeDivisionTab === 'BUNDI' ? 'Bundi' : 'Other'} Division)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeDivisionTab === 'KOTA' && (
              <button
                onClick={() => handleExportOffices('Kota Division')}
                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <FileSpreadsheet size={13} /> Export Kota Division
              </button>
            )}
            {activeDivisionTab === 'BARAN' && (
              <button
                onClick={() => handleExportOffices('Baran Division')}
                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <FileSpreadsheet size={13} /> Export Baran Division
              </button>
            )}
            {activeDivisionTab === 'BUNDI' && (
              <button
                onClick={() => handleExportOffices('Bundi Division')}
                className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <FileSpreadsheet size={13} /> Export Bundi Division
              </button>
            )}
            <span className="text-[11px] text-slate-500 hidden md:inline">
              Click any row to inspect complete beat & staff mappings
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[11px] border-b border-slate-200 font-black">
              <tr>
                <th className="p-3.5">Office Name & Category</th>
                <th className="p-3.5">Division & District</th>
                <th className="p-3.5">Sub-Division & Head Office</th>
                <th className="p-3.5">PIN Code & Address</th>
                <th className="p-3.5">Mapped Beats</th>
                <th className="p-3.5">Localities & Areas Covered</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOffices.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelectedOffice(o)}
                  className="hover:bg-red-50/50 cursor-pointer transition"
                >
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md font-black text-[10px] ${
                          o.officeType === 'HO'
                            ? 'bg-red-700 text-white font-black'
                            : o.officeType === 'SO'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300 font-black'
                            : 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
                        }`}
                      >
                        {o.officeType}
                      </span>
                      <span className="font-black text-slate-900 text-xs">{o.officeName}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{o.division}</div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      District: {o.district || (o.division.includes('Kota') ? 'Kota' : o.division.includes('Baran') ? 'Baran' : o.division.includes('Bundi') ? 'Bundi' : 'Tonk')}
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div className="font-bold text-slate-800">HO: {o.hoName}</div>
                    <div className="text-[11px] text-slate-500">
                      Sub-Div: {o.subDivision || 'Central'}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono font-black text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {o.pincode}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1 max-w-xs truncate" title={o.completeAddress}>
                      {o.completeAddress}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1">
                      {o.mappedBeats.length > 0 ? (
                        o.mappedBeats.slice(0, 3).map((b) => (
                          <span
                            key={b}
                            className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold rounded text-[10px]"
                          >
                            {b}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-[11px]">General Office</span>
                      )}
                      {o.mappedBeats.length > 3 && (
                        <span className="text-[10px] text-slate-500 font-bold">+{o.mappedBeats.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {o.mappedColonies.slice(0, 2).map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold"
                        >
                          {c}
                        </span>
                      ))}
                      {o.mappedColonies.length > 2 && (
                        <span className="text-[10px] text-slate-500 font-semibold">+{o.mappedColonies.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOffice(o);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] transition cursor-pointer"
                    >
                      Inspect ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* OFFICE DETAIL DOSSIER MODAL                              */}
      {/* ======================================================== */}
      {selectedOffice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-red-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-400 text-slate-950">
                  {selectedOffice.officeType} • PIN {selectedOffice.pincode}
                </span>
                <h3 className="text-lg font-black mt-1">{selectedOffice.officeName}</h3>
                <p className="text-xs text-slate-300">{selectedOffice.completeAddress}</p>
              </div>
              <button
                onClick={() => setSelectedOffice(null)}
                className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Circle</span>
                  <span className="font-bold text-slate-900">{selectedOffice.circle}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Division</span>
                  <span className="font-bold text-red-700 font-black">{selectedOffice.division}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">District</span>
                  <span className="font-bold text-slate-900">{selectedOffice.district || 'Rajasthan'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Head Office (HO)</span>
                  <span className="font-bold text-slate-900">{selectedOffice.hoName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Sub Office (SO)</span>
                  <span className="font-bold text-slate-900">{selectedOffice.soName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Sub-Division</span>
                  <span className="font-bold text-slate-900">{selectedOffice.subDivision || 'Central Sub-Division'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Mapped Delivery Beats ({selectedOffice.mappedBeats.length})</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedOffice.mappedBeats.map((b) => (
                    <span
                      key={b}
                      className="px-3 py-1 bg-red-50 text-red-800 border border-red-200 rounded-xl font-bold text-xs"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">
                  Mapped Colonies, Sectors & Coverage Localities ({selectedOffice.mappedColonies.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedOffice.mappedColonies.map((c) => (
                    <span
                      key={c}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-semibold text-xs"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Assigned Staff Members in this Office</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {staffProfiles
                    .filter((sp) => selectedOffice.assignedStaffIds.includes(sp.id) || sp.subOffice === selectedOffice.officeName)
                    .map((sp) => (
                      <div key={sp.id} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                        <div>
                          <div className="font-bold text-slate-900">{sp.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {sp.designation} • ID: {sp.employeeId} • Beat: {sp.beat}
                          </div>
                        </div>
                        <span className="font-mono text-xs text-blue-700 font-semibold">{sp.contact}</span>
                      </div>
                    ))}
                  {staffProfiles.filter(
                    (sp) => selectedOffice.assignedStaffIds.includes(sp.id) || sp.subOffice === selectedOffice.officeName
                  ).length === 0 && (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      General delivery beat roster assigned under {selectedOffice.hoName}.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Department of Posts • {selectedOffice.division}
              </span>
              <button
                onClick={() => setSelectedOffice(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK REGISTER POST OFFICE MODAL                         */}
      {/* ======================================================== */}
      {showAddOfficeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-red-800 to-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">Register New Post Office in Database</h3>
                <p className="text-xs text-red-100">
                  Adds registered post office with PIN code, beat roster, and jurisdictional hierarchy
                </p>
              </div>
              <button
                onClick={() => setShowAddOfficeModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOfficeViaStaffEntry} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Circle *</label>
                  <input
                    required
                    value={newCircle}
                    onChange={(e) => setNewCircle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Division *</label>
                  <select
                    value={newDivision}
                    onChange={(e) => handleModalDivisionChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50"
                  >
                    <option value="Kota Division">Kota Division</option>
                    <option value="Baran Division">Baran Division</option>
                    <option value="Bundi Division">Bundi Division</option>
                    <option value="Jhalawar Division">Jhalawar Division</option>
                    <option value="Tonk Division">Tonk Division</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office Category *</label>
                  <select
                    value={newOfficeType}
                    onChange={(e) => setNewOfficeType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="SO">Sub Post Office (SO)</option>
                    <option value="HO">Head Post Office (HO)</option>
                    <option value="BO">Branch Post Office (BO)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Head Office (HO) *</label>
                  <input
                    required
                    value={newHoName}
                    onChange={(e) => setNewHoName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sub Office (SO) Name *</label>
                  <input
                    required
                    placeholder="e.g. Anta SO / Keshoraipatan SO"
                    value={newSoName}
                    onChange={(e) => setNewSoName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch Office (BO - if any)</label>
                  <input
                    placeholder="e.g. Branch Office Name"
                    value={newBoName}
                    onChange={(e) => setNewBoName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office PIN Code *</label>
                  <input
                    required
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                    placeholder="e.g. 325205"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Complete Office Physical Address *</label>
                  <input
                    required
                    placeholder="Street/Mandi/Station address of Post Office"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Beats (comma-separated) *</label>
                  <input
                    required
                    placeholder="Beat 1, Beat 2, Beat 3"
                    value={newBeats}
                    onChange={(e) => setNewBeats(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Colonies / Areas *</label>
                  <input
                    required
                    placeholder="Mandi Area, Station Road, Main Bazar"
                    value={newColonies}
                    onChange={(e) => setNewColonies(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800">Primary In-Charge / Postal Staff Details</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="Staff Full Name *"
                    value={newInchargeName}
                    onChange={(e) => setNewInchargeName(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  />
                  <input
                    required
                    placeholder="Employee ID / CSI ID *"
                    value={newInchargeEmpId}
                    onChange={(e) => setNewInchargeEmpId(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-xl bg-white font-mono"
                  />
                  <input
                    required
                    placeholder="Official Contact Number *"
                    value={newInchargeMobile}
                    onChange={(e) => setNewInchargeMobile(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-xl bg-white font-mono"
                  />
                  <select
                    value={newInchargeDesig}
                    onChange={(e) => setNewInchargeDesig(e.target.value as any)}
                    className="px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="Sub Postmaster (SPM)">Sub Postmaster (SPM)</option>
                    <option value="PA (Postal Assistant)">PA (Postal Assistant)</option>
                    <option value="Postman">Postman</option>
                    <option value="GDS (BPM / ABPM / Dak Sevak)">GDS (BPM / ABPM / Dak Sevak)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddOfficeModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold cursor-pointer shadow-md"
                >
                  Save & Register Office
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
