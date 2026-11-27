import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { lastMileVendorService } from '../../services/lastMileVendorService';
import { staffPermissionService } from '../../services/staffPermissionService';
import { LastMileVendorRecord } from '../../types/models';
import { KOTA_POST_OFFICE_OPTIONS } from '../../data/officesData';

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

const SERVICE_CATEGORIES: LastMileVendorRecord['serviceCategory'][] = [
  'Logistics & Courier',
  'Bulk Delivery',
  'Last Mile Fleet',
  'Retail Partner',
  'Other',
];

export default function LastMileVendorView() {
  const { userProfile } = useAuth();
  const [vendors, setVendors] = useState<LastMileVendorRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<LastMileVendorRecord | null>(null);

  // Form states
  const [vName, setVName] = useState('');
  const [vContactPerson, setVContactPerson] = useState('');
  const [vMobile, setVMobile] = useState('');
  const [vEmail, setVEmail] = useState('');
  const [vCategory, setVCategory] = useState<LastMileVendorRecord['serviceCategory']>('Logistics & Courier');
  const [vStatus, setVStatus] = useState<LastMileVendorRecord['status']>('Active');
  const [vPincode, setVPincode] = useState('324009');
  const [vBeats, setVBeats] = useState('Beat 1, Beat 2');
  const [vPinsText, setVPinsText] = useState('324001, 324009');
  const [vNotes, setVNotes] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const refreshVendors = () => {
    setVendors(lastMileVendorService.getVendors(userProfile));
  };

  useEffect(() => {
    refreshVendors();
    const unsub = lastMileVendorService.subscribe(refreshVendors);
    return () => unsub();
  }, [userProfile]);

  const showSuccessNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && v.serviceCategory !== categoryFilter) return false;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        v.vendorName.toLowerCase().includes(q) ||
        v.vendorCode.toLowerCase().includes(q) ||
        (v.contactPerson || '').toLowerCase().includes(q) ||
        v.mobile.includes(q) ||
        v.serviceCoveragePincodes.some((p) => p.includes(q))
      );
    });
  }, [vendors, searchQuery, statusFilter, categoryFilter]);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setVName('');
    setVContactPerson('');
    setVMobile('');
    setVEmail('');
    setVCategory('Logistics & Courier');
    setVStatus('Active');
    setVPincode('324009');
    setVBeats('Beat 1, Beat 2');
    setVPinsText('324001, 324009');
    setVNotes('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (v: LastMileVendorRecord) => {
    setEditingVendor(v);
    setVName(v.vendorName);
    setVContactPerson(v.contactPerson || '');
    setVMobile(v.mobile);
    setVEmail(v.email || '');
    setVCategory(v.serviceCategory);
    setVStatus(v.status);
    setVPincode(v.officePincode || '324009');
    setVBeats(v.assignedBeats.join(', '));
    setVPinsText(v.serviceCoveragePincodes.join(', '));
    setVNotes(v.notes || '');
    setShowAddModal(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName.trim() || !vMobile.trim()) {
      showSuccessNotice('Please enter Vendor Name and Contact Mobile.');
      return;
    }

    const pins = vPinsText
      .split(/[\s,]+/)
      .map((p) => p.trim())
      .filter((p) => /^\d{6}$/.test(p));

    const beats = vBeats
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    lastMileVendorService.upsertVendor({
      id: editingVendor ? editingVendor.id : undefined,
      vendorCode: editingVendor ? editingVendor.vendorCode : undefined,
      vendorName: vName.trim(),
      contactPerson: vContactPerson.trim() || undefined,
      mobile: vMobile.replace(/\D/g, '').slice(-10),
      email: vEmail.trim() || undefined,
      serviceCoveragePincodes: pins.length ? pins : [vPincode],
      assignedBeats: beats.length ? beats : ['Beat 2'],
      serviceCategory: vCategory,
      status: vStatus,
      officePincode: vPincode,
      officeName: 'Dadabari S.O.',
      notes: vNotes.trim() || undefined,
      enteredBy: userProfile?.employeeId || userProfile?.id || 'DEV-01',
      assignedTasksCount: editingVendor ? editingVendor.assignedTasksCount : 12,
    });

    showSuccessNotice(editingVendor ? `Updated vendor "${vName}" successfully.` : `Registered new vendor "${vName}".`);
    setShowAddModal(false);
    refreshVendors();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove last-mile vendor "${name}"?`)) {
      lastMileVendorService.deleteVendor(id);
      showSuccessNotice(`Removed vendor "${name}".`);
      refreshVendors();
    }
  };

  return (
    <div className="space-y-6 pb-14 text-slate-900">
      {/* Header Banner */}
      <div className="bg-[#0A1628] text-white rounded-2xl p-6 border border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-amber-300 font-bold">
            India Post Last-Mile Operations &amp; Partner Network
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1 flex items-center gap-2.5">
            <Truck size={24} className="text-red-400" />
            <span>Last Mile Vendor Directory &amp; Dispatch Hub</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Manage third-party courier partners, bulk dispatch hubs, and field logistics fleet scoped by office PIN &amp; beat territories.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#991B1B] hover:bg-red-800 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm transition shrink-0"
        >
          <Plus size={16} />
          <span>Register New Vendor</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-700" />
          <span>{notice}</span>
        </div>
      )}

      {/* Controls & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendors by name, code, contact person, mobile or PIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none focus:border-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
          >
            <option value="ALL">Status: All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending Review">Pending Review</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
          >
            <option value="ALL">Category: All Categories</option>
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVendors.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {v.vendorCode}
                  </span>
                  <h3 className="text-base font-black text-slate-950 mt-1">{v.vendorName}</h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    v.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : v.status === 'Pending Review'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {v.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[11px]">
                  {v.serviceCategory}
                </div>
                {v.contactPerson && (
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-slate-400 shrink-0" />
                    <span>Contact: <strong>{v.contactPerson}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span className="font-mono">{v.mobile}</span>
                  {v.email && <span className="text-slate-400">({v.email})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span>
                    PINs: <strong className="font-mono">{v.serviceCoveragePincodes.join(', ')}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 size={13} className="text-slate-400 shrink-0" />
                  <span>Beats: <strong>{v.assignedBeats.join(', ')}</strong></span>
                </div>
                {v.notes && <p className="text-[11px] text-slate-500 pt-1 italic">{v.notes}</p>}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                Active Deliveries: <strong className="text-slate-900">{v.assignedTasksCount || 0}</strong>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(v)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                  title="Edit Vendor"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(v.id, v.vendorName)}
                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg cursor-pointer"
                  title="Remove Vendor"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          No last-mile vendors match the current filter criteria. Use the button above to register a new partner vendor.
        </div>
      )}

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-950 flex items-center gap-2">
                <Truck size={18} className="text-[#991B1B]" />
                <span>{editingVendor ? 'Edit Last Mile Vendor Profile' : 'Register Last Mile Vendor'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Vendor / Company Name *</label>
                <input
                  required
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  placeholder="e.g. Dadabari Express Logistics"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
                  <input
                    value={vContactPerson}
                    onChange={(e) => setVContactPerson(e.target.value)}
                    placeholder="Manager name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Mobile *</label>
                  <input
                    required
                    value={vMobile}
                    onChange={(e) => setVMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Category</label>
                  <select
                    value={vCategory}
                    onChange={(e) => setVCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                  >
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={vStatus}
                    onChange={(e) => setVStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending Review">Pending Review</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Office PIN (Primary)</label>
                  <select
                    value={vPincode}
                    onChange={(e) => setVPincode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold bg-white"
                  >
                    {KOTA_ALL_OFFICE_PINCODES.map((pin) => (
                      <option key={pin} value={pin}>
                        {pin}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Beats</label>
                  <input
                    value={vBeats}
                    onChange={(e) => setVBeats(e.target.value)}
                    placeholder="Beat 1, Beat 2"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Coverage PINs (Comma separated)</label>
                <input
                  value={vPinsText}
                  onChange={(e) => setVPinsText(e.target.value)}
                  placeholder="324001, 324009, 324007"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Operational Notes / SLA</label>
                <textarea
                  rows={2}
                  value={vNotes}
                  onChange={(e) => setVNotes(e.target.value)}
                  placeholder="Service level agreement, dispatch timings, or hub notes..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#991B1B] hover:bg-red-800 text-white font-bold rounded-xl cursor-pointer shadow-sm"
                >
                  {editingVendor ? 'Save Changes' : 'Register Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
