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

  // Drill-down filters
  const [filterCircle, setFilterCircle] = useState<string>('ALL');
  const [filterDivision, setFilterDivision] = useState<string>('ALL');
  const [filterOfficeType, setFilterOfficeType] = useState<string>('ALL');
  const [filterPincode, setFilterPincode] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Quick Add Office + Staff Mapping Modal
  const [showAddOfficeModal, setShowAddOfficeModal] = useState(false);
  const [newCircle, setNewCircle] = useState('Rajasthan Circle');
  const [newDivision, setNewDivision] = useState('Kota Division');
  const [newHoName, setNewHoName] = useState('Kota Head Post Office (HO)');
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

      if (filterCircle !== 'ALL' && o.circle !== filterCircle) return false;
      if (filterDivision !== 'ALL' && o.division !== filterDivision) return false;
      if (filterOfficeType !== 'ALL' && o.officeType !== filterOfficeType) return false;
      if (filterPincode.trim() && !o.pincode.includes(filterPincode.trim())) return false;

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
  }, [offices, isSuperAdmin, userProfile, filterCircle, filterDivision, filterOfficeType, filterPincode, searchTerm]);

  const handleExportOffices = () => {
    const rows = filteredOffices.map((o) => ({
      'Office ID': o.id,
      'Office Name': o.officeName,
      'Office Type': o.officeType,
      Circle: o.circle,
      Division: o.division,
      'Head Office (HO)': o.hoName,
      'Sub Office (SO)': o.soName,
      'Branch Office (BO)': o.boName || 'N/A',
      Pincode: o.pincode,
      'Complete Office Address': o.completeAddress,
      'Mapped Beats': o.mappedBeats.join(', '),
      'Mapped Colonies & Sectors': o.mappedColonies.join(', '),
      'Assigned Staff Count': o.staffCount,
      'Last Synced': new Date(o.updatedAt).toLocaleString('en-IN'),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'AutoManaged_Offices');
    XLSX.writeFile(wb, `IndiaPost_AutoManaged_Offices_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      headOffice: newHoName.trim() || 'Kota Head Post Office (HO)',
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
      `Auto-Managed Office "${targetOfficeName} (${newPincode})" & Beat/Colony Mappings dynamically generated!`
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
              <Sparkles size={13} /> Zero Pre-Entry Architecture • Auto-Synced from Staff Submissions
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              <Building size={26} className="text-amber-400" />
              <span>Auto-Managed Office & Territory Master Engine</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Offices (Circle → Division → HO → SO → BO), Pincodes, Beats, and Colony Mappings are dynamically created, grouped, and updated live from Staff Directory entries without manual database pre-population.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportOffices}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Download size={15} className="text-amber-400" />
              <span>Export Offices ({filteredOffices.length})</span>
            </button>

            <Link
              to="/staff-master"
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md"
            >
              <Users size={15} />
              <span>Direct Staff & Office Form</span>
            </Link>

            <button
              onClick={() => setShowAddOfficeModal(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md"
            >
              <Plus size={15} />
              <span>Register New Office + Staff</span>
            </button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-semibold">Total Auto-Grouped Offices</div>
            <div className="text-2xl font-black text-white mt-0.5">{offices.length}</div>
            <div className="text-[10px] text-amber-300 mt-0.5">HO / SO / BO Hierarchy</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-semibold">Sub & Head Offices (HO/SO)</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              {offices.filter((o) => o.officeType === 'HO' || o.officeType === 'SO').length}
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">Urban & Delivery Hubs</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-semibold">Branch Offices (Rural BO)</div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">
              {offices.filter((o) => o.officeType === 'BO').length}
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">GDS BPM / ABPM Mapped</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <div className="text-[11px] text-slate-400 font-semibold">Active Pincodes Covered</div>
            <div className="text-2xl font-black text-sky-400 mt-0.5">
              {new Set(offices.map((o) => o.pincode)).size}
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">Live Territory Indexing</div>
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

      {/* Hierarchical Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Filter size={15} className="text-red-700" />
            <span>Hierarchical Office & Territory Drill-Down Filter</span>
          </h3>
          <button
            onClick={() => {
              setFilterCircle('ALL');
              setFilterDivision('ALL');
              setFilterOfficeType('ALL');
              setFilterPincode('');
              setSearchTerm('');
            }}
            className="text-xs font-bold text-red-700 hover:underline flex items-center gap-1"
          >
            <RefreshCw size={12} /> Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">1. Circle</label>
            <select
              value={filterCircle}
              onChange={(e) => setFilterCircle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800"
            >
              <option value="ALL">All Circles ({hierarchy.circles.length})</option>
              {hierarchy.circles.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">2. Division</label>
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
            <label className="block text-[11px] font-bold text-slate-600 mb-1">3. Office Category</label>
            <select
              value={filterOfficeType}
              onChange={(e) => setFilterOfficeType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800"
            >
              <option value="ALL">All (HO / SO / BO)</option>
              <option value="HO">Head Post Office (HO)</option>
              <option value="SO">Sub Post Office (SO)</option>
              <option value="BO">Branch Post Office (BO)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">4. Office Pincode</label>
            <input
              type="text"
              placeholder="e.g. 324009"
              value={filterPincode}
              onChange={(e) => setFilterPincode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-mono font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">5. Search Office / Beat / Colony</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Dadabari, Beat 2, Keshavpura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Office Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="text-xs font-bold text-slate-800">
            Showing <span className="text-red-700 font-black">{filteredOffices.length}</span> Auto-Managed Post Offices
          </div>
          <span className="text-[11px] text-slate-500">
            Click any office row to inspect mapped staff, beats, and colonies
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/90 text-slate-600 uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Office Name & Type</th>
                <th className="p-3.5">Circle & Division</th>
                <th className="p-3.5">HO / SO / BO Hierarchy</th>
                <th className="p-3.5">Pincode & Address</th>
                <th className="p-3.5">Mapped Beats</th>
                <th className="p-3.5">Colonies / Areas</th>
                <th className="p-3.5 text-center">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOffices.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelectedOffice(o)}
                  className="hover:bg-red-50/40 cursor-pointer transition"
                >
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md font-black text-[10px] ${
                          o.officeType === 'HO'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : o.officeType === 'SO'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {o.officeType}
                      </span>
                      <span className="font-bold text-slate-900">{o.officeName}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800">{o.division}</div>
                    <div className="text-[11px] text-slate-500">{o.circle}</div>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div className="font-medium text-slate-800">HO: {o.hoName}</div>
                    <div className="text-[11px]">
                      SO: {o.soName} {o.boName ? `→ BO: ${o.boName}` : ''}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100">
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
                            className="px-2 py-0.5 bg-slate-100 text-slate-800 font-semibold rounded text-[10px]"
                          >
                            {b}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-[11px]">General Office</span>
                      )}
                      {o.mappedBeats.length > 3 && (
                        <span className="text-[10px] text-slate-500">+{o.mappedBeats.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {o.mappedColonies.slice(0, 3).map((c) => (
                        <span
                          key={c}
                          className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-medium"
                        >
                          {c}
                        </span>
                      ))}
                      {o.mappedColonies.length > 3 && (
                        <span className="text-[10px] text-slate-500">+{o.mappedColonies.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-900 text-white font-bold text-xs">
                      {o.staffCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Office Detail Modal */}
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
                className="p-2 rounded-full hover:bg-white/10 text-white"
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
                  <span className="font-bold text-slate-900">{selectedOffice.division}</span>
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
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Branch Office (BO)</span>
                  <span className="font-bold text-slate-900">{selectedOffice.boName || 'Direct SO/HO Delivery'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Mapped Staff</span>
                  <span className="font-black text-red-700">{selectedOffice.staffCount} Active Officials</span>
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
                  Mapped Colonies & Sectors ({selectedOffice.mappedColonies.length})
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
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedOffice(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Register Office + Staff Modal */}
      {showAddOfficeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-red-800 to-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">Auto-Generate Office & Beat via Staff Entry</h3>
                <p className="text-xs text-red-100">
                  Submitting this form automatically creates/updates the Office, Beat, and Colony mappings
                </p>
              </div>
              <button
                onClick={() => setShowAddOfficeModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white"
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
                  <input
                    required
                    value={newDivision}
                    onChange={(e) => setNewDivision(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office Category *</label>
                  <select
                    value={newOfficeType}
                    onChange={(e) => setNewOfficeType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="HO">Head Post Office (HO)</option>
                    <option value="SO">Sub Post Office (SO)</option>
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
                  <label className="block font-bold text-slate-700 mb-1">Sub Office (SO) *</label>
                  <input
                    required
                    placeholder="e.g. Dadabari SO"
                    value={newSoName}
                    onChange={(e) => setNewSoName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Branch Office (BO - if any)</label>
                  <input
                    placeholder="e.g. Mandaliya BO"
                    value={newBoName}
                    onChange={(e) => setNewBoName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office Pincode *</label>
                  <input
                    required
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Complete Office Address *</label>
                  <input
                    required
                    placeholder="Full street/sector address of Post Office"
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
                  <label className="block font-bold text-slate-700 mb-1">Assigned Colonies / Sectors *</label>
                  <input
                    required
                    placeholder="Keshavpura Sector 7, Patel Nagar"
                    value={newColonies}
                    onChange={(e) => setNewColonies(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800">Primary In-Charge / Assigned Staff Details</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="Staff Full Name *"
                    value={newInchargeName}
                    onChange={(e) => setNewInchargeName(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                  <input
                    required
                    placeholder="Employee ID (e.g. CSI-100941) *"
                    value={newInchargeEmpId}
                    onChange={(e) => setNewInchargeEmpId(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                  />
                  <input
                    required
                    placeholder="Mobile Number *"
                    value={newInchargeMobile}
                    onChange={(e) => setNewInchargeMobile(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono"
                  />
                  <select
                    value={newInchargeDesig}
                    onChange={(e) => setNewInchargeDesig(e.target.value as any)}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="Sub Postmaster (SPM)">Sub Postmaster (SPM)</option>
                    <option value="PA (Postal Assistant)">PA (Postal Assistant)</option>
                    <option value="Postman">Postman</option>
                    <option value="GDS (BPM / ABPM / Dak Sevak)">GDS (BPM / ABPM / Dak Sevak)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddOfficeModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black shadow-md"
                >
                  Save & Auto-Sync Office + Beats
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
