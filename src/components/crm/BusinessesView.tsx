import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Search,
  MapPin,
  Phone,
  ExternalLink,
  Briefcase,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  User,
  Check,
  Filter,
  Navigation,
  Share2,
  QrCode,
  FileSpreadsheet,
  Download,
  Layers,
  ArrowRight,
  Edit2,
  RefreshCw,
  Store,
  BadgeAlert
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Customer } from '../../types/models';
import { customerService } from '../../services/customerService';
import {
  CommercialStoreEntry,
  DADABARI_324009_VERIFIED_COMMERCIAL_REGISTRY,
  getVerifiedDadabari324009Registry,
  saveVerifiedDadabari324009Registry,
  ingestVerifiedStoreToCrm,
  CommercialCscEntity,
  getStoredCscDirectory,
} from '../../data/kotaCommercialCscData';
import { notificationScannerService } from '../../services/notificationScannerService';
import CustomerProfileModal from '../customers/CustomerProfileModal';

export default function BusinessesView() {
  const location = useLocation();
  const navigate = useNavigate();

  // Handle incoming pre-filter from AI Assistant or Notification Jump
  const initialKeyword = (location.state as any)?.searchKeyword || '';

  const [activeTab, setActiveTab] = useState<'dadabari_324009' | 'csc_emitra' | 'merchants'>('dadabari_324009');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [verifiedStores, setVerifiedStores] = useState<CommercialStoreEntry[]>(getVerifiedDadabari324009Registry());
  const [cscEntities, setCscEntities] = useState<CommercialCscEntity[]>(getStoredCscDirectory());
  const [search, setSearch] = useState<string>(initialKeyword);
  const [selectedBeatFilter, setSelectedBeatFilter] = useState<string>('ALL');
  const [selectedColonyFilter, setSelectedColonyFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedStoreForModal, setSelectedStoreForModal] = useState<CommercialStoreEntry | null>(null);
  const [editingStore, setEditingStore] = useState<CommercialStoreEntry | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  useEffect(() => {
    setCustomers(customerService.getCustomers());
    const unsub = customerService.subscribe(() => {
      setCustomers([...customerService.getCustomers()]);
    });
    return () => unsub();
  }, []);

  // Update initial search if location state changes
  useEffect(() => {
    if ((location.state as any)?.searchKeyword) {
      setSearch((location.state as any).searchKeyword);
    }
  }, [location.state]);

  // General Commercial / Merchant establishments identified in Customer Master
  const merchants = useMemo(() => {
    return customers?.filter((c) => {
      const text = `${c.name} ${c.remarks || ''} ${c.occupation || ''}`.toLowerCase();
      const isBiz =
        text.includes('tea') ||
        text.includes('shop') ||
        text.includes('stall') ||
        text.includes('traders') ||
        text.includes('collection') ||
        text.includes('welding') ||
        text.includes('school') ||
        text.includes('medical') ||
        text.includes('centre') ||
        text.includes('center') ||
        text.includes('enterprise') ||
        text.includes('store') ||
        text.includes('emitra') ||
        text.includes('csc');

      const s = search.toLowerCase();
      return isBiz && (!s || text.includes(s));
    })?.sort((a, b) => {
      const colA = (a.area || a.sectorLocality || a.address?.area || a.sector || '').trim();
      const colB = (b.area || b.sectorLocality || b.address?.area || b.sector || '').trim();
      const colCmp = colA.localeCompare(colB, undefined, { numeric: true, sensitivity: 'base' });
      if (colCmp !== 0) return colCmp;
      const hA = (a.houseNo || a.address?.houseNumber || '').trim();
      const hB = (b.houseNo || b.address?.houseNumber || '').trim();
      return hA.localeCompare(hB, undefined, { numeric: true, sensitivity: 'base' });
    }) || [];
  }, [customers, search]);

  // Unique Colonies in Verified 324009 Registry
  const uniqueDadabariColonies = useMemo(() => {
    return Array.from(new Set(verifiedStores.map((c) => c.colony))).sort();
  }, [verifiedStores]);

  // Filtered 324009 Verified Stores (Zero dead data, only active ground stores in 324009)
  const filteredVerified324009Stores = useMemo(() => {
    return verifiedStores.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.storeName.toLowerCase().includes(q) ||
        item.ownerName.toLowerCase().includes(q) ||
        item.housePlotNumber.toLowerCase().includes(q) ||
        item.colony.toLowerCase().includes(q) ||
        item.landmark.toLowerCase().includes(q) ||
        item.primaryMobile.includes(q) ||
        item.whatsapp.includes(q) ||
        item.assignedStaffName.toLowerCase().includes(q) ||
        item.assignedStaffId.toLowerCase().includes(q) ||
        item.beatNo.toLowerCase().includes(q) ||
        item.postalPotentialRemark.toLowerCase().includes(q);

      const matchesBeat = selectedBeatFilter === 'ALL' || item.beatNo === selectedBeatFilter;
      const matchesColony = selectedColonyFilter === 'ALL' || item.colony === selectedColonyFilter;
      const matchesCat = selectedCategoryFilter === 'ALL' || item.categoryTag === selectedCategoryFilter;
      const matchesStatus =
        selectedStatusFilter === 'ALL' ||
        (selectedStatusFilter === 'Ingested' && item.ingestedToCrm) ||
        (selectedStatusFilter === 'NotIngested' && !item.ingestedToCrm);

      return matchesSearch && matchesBeat && matchesColony && matchesCat && matchesStatus;
    }).sort((a, b) => {
      const colCmp = (a.colony || '').trim().localeCompare((b.colony || '').trim(), undefined, { numeric: true, sensitivity: 'base' });
      if (colCmp !== 0) return colCmp;
      return (a.housePlotNumber || '').trim().localeCompare((b.housePlotNumber || '').trim(), undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [verifiedStores, search, selectedBeatFilter, selectedColonyFilter, selectedCategoryFilter, selectedStatusFilter]);

  // Filtered CSC Entities
  const filteredCsc = useMemo(() => {
    return cscEntities.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.businessName.toLowerCase().includes(q) ||
        item.operatorName.toLowerCase().includes(q) ||
        item.housePlotNumber.toLowerCase().includes(q) ||
        item.colony.toLowerCase().includes(q) ||
        item.landmark.toLowerCase().includes(q) ||
        item.primaryMobile.includes(q) ||
        item.assignedStaffName.toLowerCase().includes(q) ||
        item.beatNo.toLowerCase().includes(q);

      const matchesBeat = selectedBeatFilter === 'ALL' || item.beatNo === selectedBeatFilter;
      return matchesSearch && matchesBeat;
    }).sort((a, b) => {
      const colCmp = (a.colony || '').trim().localeCompare((b.colony || '').trim(), undefined, { numeric: true, sensitivity: 'base' });
      if (colCmp !== 0) return colCmp;
      return (a.housePlotNumber || '').trim().localeCompare((b.housePlotNumber || '').trim(), undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [cscEntities, search, selectedBeatFilter]);

  // Handle 1-Click Ingest for 324009 Verified Store
  const handleIngest324009Store = (store: CommercialStoreEntry) => {
    const res = ingestVerifiedStoreToCrm(store);
    if (res.success) {
      setVerifiedStores(getVerifiedDadabari324009Registry());
      showToast(res.message);
    } else {
      showToast(`⚠️ ${res.message}`);
    }
  };

  // Bulk Sync All 324009 Stores
  const handleBulkSync324009All = () => {
    let count = 0;
    verifiedStores.forEach((store) => {
      ingestVerifiedStoreToCrm(store);
      count++;
    });
    setVerifiedStores(getVerifiedDadabari324009Registry());
    showToast(`✅ Reality-Check Complete! All ${count} active commercial stores in Pincode 324009 synced to CRM Master.`);
  };

  // Save Store Edit Modal
  const handleSaveStoreEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;

    const currentList = getVerifiedDadabari324009Registry();
    const updated = currentList.map((s) => (s.id === editingStore.id ? editingStore : s));
    saveVerifiedDadabari324009Registry(updated);
    setVerifiedStores(updated);
    // Also update in CRM if already ingested
    ingestVerifiedStoreToCrm(editingStore);
    setEditingStore(null);
    showToast(`✅ Store details updated and synchronized for "${editingStore.storeName}".`);
  };

  // Export 324009 Reality-Checked Registry to Excel
  const handleExport324009ToExcel = () => {
    const exportData = filteredVerified324009Stores.map((s) => ({
      'Store ID': s.id,
      'Store / Signboard Name': s.storeName,
      'Contact Person / Owner': s.ownerName,
      'Primary Mobile': s.primaryMobile,
      'WhatsApp Number': s.whatsapp,
      'Plot / Shop Number': s.housePlotNumber,
      'Colony / Sub-Locality': s.colony,
      'Prominent Landmark': s.landmark,
      'Pincode': s.pincode,
      'Delivery Office': s.deliveryOffice,
      'Assigned Beat': s.beatNo,
      'Assigned Postman': s.assignedStaffName,
      'Staff Directory ID': s.assignedStaffId,
      'Category Tag': s.categoryTag,
      'Operational Status': s.operationalStatus,
      'Audit Verification': s.verificationBadge,
      'Postal Potential': s.postalPotentialRemark,
      'Daily Footfall': s.dailyFootfall,
      'Last Audit Date': s.lastAuditDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dadabari_324009_Commercial');
    XLSX.writeFile(
      workbook,
      `Dadabari_324009_Verified_Commercial_Stores_${new Date().toISOString().split('T')[0]}.xlsx`
    );
    showToast('Exported 324009 Reality-Checked Registry to Excel.');
  };

  return (
    <div className="space-y-6" id="businesses-view-root">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300 border border-emerald-700">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Header with Pincode 324009 Reality-Check Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-800 to-slate-900 text-amber-300 flex items-center justify-center font-black shadow-md">
              <Store size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900">
                  Dadabari S.O. Commercial & Store Directory
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-100 text-red-900 border border-red-200 font-mono">
                  PIN 324009 STRICT
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>Zero Dead Data</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                100% active, ground-verified commercial stores (eMitra, CSC, General Merchants, Kirana & Retail) mapped to Dadabari postal beats.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleBulkSync324009All}
            className="px-4 py-2.5 bg-gradient-to-r from-red-800 to-slate-950 hover:from-red-900 hover:to-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>1-Click Sync All 324009 Stores ({verifiedStores.length})</span>
          </button>
          <button
            type="button"
            onClick={handleExport324009ToExcel}
            className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 transition"
            title="Download Excel Report"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Primary View Switcher Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-3 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('dadabari_324009')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'dadabari_324009'
              ? 'bg-red-800 text-white shadow-md font-extrabold'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck size={16} className={activeTab === 'dadabari_324009' ? 'text-amber-300' : 'text-red-700'} />
          <span>Pincode 324009 Verified Stores ({verifiedStores.length})</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
            Audit-Grade
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('csc_emitra')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'csc_emitra'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles size={16} className={activeTab === 'csc_emitra' ? 'text-slate-950' : 'text-amber-500'} />
          <span>Kota eMitra & CSC Directory ({cscEntities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('merchants')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'merchants'
              ? 'bg-indigo-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase size={16} className={activeTab === 'merchants' ? 'text-indigo-300' : 'text-slate-500'} />
          <span>General Customer Merchants ({merchants.length})</span>
        </button>
      </div>

      {/* Search & Reality-Checked Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search store name, proprietor, mobile, landmark..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-600 focus:bg-white focus:outline-hidden transition"
            />
          </div>

          {/* Reality-Check Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Category Tag Filter */}
            {activeTab === 'dadabari_324009' && (
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">All Categories</option>
                <option value="Commercial • eMitra / CSC">eMitra / CSC</option>
                <option value="Commercial • General Store / Retail">General Store / Retail</option>
              </select>
            )}

            {/* Beat Filter (Dadabari Delivery Beats) */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
                <Filter size={13} /> Beat:
              </span>
              <select
                value={selectedBeatFilter}
                onChange={(e) => setSelectedBeatFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">All Beats</option>
                {['Beat 1', 'Beat 2', 'Beat 3', 'Beat 4', 'Beat 5', 'Beat 6', 'Beat 7', 'Beat 8', 'Beat 9', 'Beat 10', 'Beat 33'].map((b) => (
                  <option key={b} value={b}>
                    {b} (324009)
                  </option>
                ))}
              </select>
            </div>

            {/* Colony Filter */}
            {activeTab === 'dadabari_324009' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
                  <MapPin size={13} /> Colony:
                </span>
                <select
                  value={selectedColonyFilter}
                  onChange={(e) => setSelectedColonyFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-700 focus:outline-hidden max-w-[150px]"
                >
                  <option value="ALL">All Colonies</option>
                  {uniqueDadabariColonies.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(search || selectedBeatFilter !== 'ALL' || selectedColonyFilter !== 'ALL' || selectedCategoryFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedBeatFilter('ALL');
                  setSelectedColonyFilter('ALL');
                  setSelectedCategoryFilter('ALL');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: PINCODE 324009 AUDIT-GRADE REALITY-CHECKED STORES */}
      {activeTab === 'dadabari_324009' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <b className="text-slate-900 font-bold">{filteredVerified324009Stores.length}</b> physically verified, 100% active commercial stores in Pincode 324009
            </span>
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 size={13} /> {filteredVerified324009Stores.filter((s) => s.ingestedToCrm).length} Synced in CRM
              </span>
              <span>•</span>
              <span className="text-slate-600 font-semibold font-mono">
                Dadabari S.O. Beats 1–33
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVerified324009Stores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-red-400 hover:shadow-lg transition flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-3.5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ${
                            store.categoryTag === 'Commercial • eMitra / CSC'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}
                        >
                          {store.categoryTag}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                          <CheckCircle2 size={10} /> Active Store
                        </span>
                      </div>

                      <h3 className="font-black text-base text-slate-900 group-hover:text-red-800 transition">
                        {store.storeName}
                      </h3>

                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <User size={13} className="text-slate-400" />
                        <span className="font-bold text-slate-900">{store.ownerName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">(Proprietor)</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-2.5 py-1 rounded-xl bg-slate-900 text-amber-300 font-mono font-black text-xs shadow-2xs">
                        {store.beatNo}
                      </span>
                      <div className="text-[10px] font-mono font-bold text-red-700 mt-0.5">
                        PIN 324009
                      </div>
                    </div>
                  </div>

                  {/* Physical Address & Landmark Box */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-start gap-1.5 text-slate-800">
                      <MapPin size={13} className="text-red-600 shrink-0 mt-0.5" />
                      <span>
                        <b>{store.housePlotNumber}</b>, {store.colony}
                      </span>
                    </div>
                    {store.landmark && (
                      <div className="text-slate-600 text-[11px] pl-4">
                        <b>Landmark:</b> {store.landmark}
                      </div>
                    )}
                    <div className="flex items-center gap-3 pl-4 pt-1 text-[11px] font-mono">
                      <span className="flex items-center gap-1 text-slate-800">
                        <Phone size={11} className="text-emerald-600" />
                        <a href={`tel:${store.primaryMobile}`} className="hover:underline font-bold">
                          {store.primaryMobile}
                        </a>
                      </span>
                      {store.whatsapp && (
                        <span className="text-emerald-700 font-bold">
                          WA: {store.whatsapp}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Postal Potential Remark */}
                  <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-950 space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-800 flex items-center gap-1">
                      <Sparkles size={11} /> Postal Potential & Operations:
                    </span>
                    <p className="text-[11px] leading-tight font-medium">
                      {store.postalPotentialRemark}
                    </p>
                  </div>

                  {/* Assigned Beat Postman & Audit Date */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-emerald-600" />
                      <span>Postman:</span>
                      <b className="text-slate-900">{store.assignedStaffName}</b>
                    </div>
                    <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 font-bold">
                      {store.assignedStaffId}
                    </span>
                  </div>
                </div>

                {/* 1-Click Action Triggers Bar: 4 Standard Hooks */}
                <div className="p-3 bg-slate-50/90 border-t border-slate-100 grid grid-cols-4 gap-1.5 text-center text-xs font-bold">
                  {/* Hook 1: Add to CRM Master */}
                  <button
                    type="button"
                    onClick={() => handleIngest324009Store(store)}
                    className="py-2 px-1 rounded-xl bg-red-700 hover:bg-red-800 text-white transition flex items-center justify-center gap-1 text-[10px] shadow-2xs cursor-pointer"
                    title="1-Click Ingest into CRM Customer Directory & Property Master"
                  >
                    <Plus size={11} />
                    <span>Sync CRM</span>
                  </button>

                  {/* Hook 2: Verify Location */}
                  <button
                    type="button"
                    onClick={() => setSelectedStoreForModal(store)}
                    className="py-2 px-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition flex items-center justify-center gap-1 text-[10px] cursor-pointer"
                    title="Open spatial location and store details drawer"
                  >
                    <Navigation size={11} className="text-blue-600" />
                    <span>Verify Loc</span>
                  </button>

                  {/* Hook 3: Map to Beat */}
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/sequence-properties', { state: { searchKeyword: store.colony } });
                    }}
                    className="py-2 px-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition flex items-center justify-center gap-1 text-[10px] cursor-pointer"
                    title="Map store into door-to-door beat delivery sequence"
                  >
                    <Layers size={11} className="text-indigo-600" />
                    <span>Map Beat</span>
                  </button>

                  {/* Hook 4: Update Record */}
                  <button
                    type="button"
                    onClick={() => setEditingStore(store)}
                    className="py-2 px-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition flex items-center justify-center gap-1 text-[10px] cursor-pointer"
                    title="Edit store details, owner name, or contact number"
                  >
                    <Edit2 size={11} className="text-amber-600" />
                    <span>Edit Rec</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: GENERAL KOTA CSC & EMITRA KIOSKS */}
      {activeTab === 'csc_emitra' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCsc.map((csc) => (
            <div
              key={csc.id}
              className="bg-white rounded-3xl border border-slate-200 hover:border-amber-400 p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{csc.businessName}</h3>
                  <div className="text-xs text-slate-600">{csc.operatorName} ({csc.role})</div>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-amber-300 font-mono text-xs font-bold">
                  {csc.beatNo}
                </span>
              </div>
              <div className="text-xs text-slate-600">
                <MapPin size={12} className="inline text-red-600 mr-1" />
                {csc.housePlotNumber}, {csc.colony} (PIN {csc.pincode})
              </div>
              <div className="text-xs font-mono text-slate-700">
                📱 {csc.primaryMobile} | WA: {csc.whatsapp}
              </div>
              <button
                type="button"
                onClick={() => {
                  notificationScannerService.ingestCscToCrm(csc);
                  showToast(`Synced ${csc.businessName} to CRM!`);
                }}
                className="w-full py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>Add to CRM Master</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: CUSTOMER MERCHANTS */}
      {activeTab === 'merchants' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchants.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 p-5 space-y-3"
            >
              <h3 className="font-bold text-slate-900 text-base">{b.name}</h3>
              <div className="text-xs text-slate-600">
                <MapPin size={12} className="inline text-red-600 mr-1" />
                {b.address?.fullAddress || b.area}
              </div>
              <div className="text-xs font-mono text-emerald-700">📱 {b.mobile}</div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(b)}
                className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: VERIFY LOCATION & DETAILS MODAL */}
      {selectedStoreForModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  {selectedStoreForModal.categoryTag}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {selectedStoreForModal.storeName}
                </h3>
                <p className="text-xs text-slate-500">
                  Owner: <b>{selectedStoreForModal.ownerName}</b> • Pincode <b>324009</b>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStoreForModal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-800">Physical Address & Beat Alignment</div>
                <div><b>Plot/Shop No:</b> {selectedStoreForModal.housePlotNumber}</div>
                <div><b>Colony / Sub-Locality:</b> {selectedStoreForModal.colony}</div>
                <div><b>Prominent Landmark:</b> {selectedStoreForModal.landmark}</div>
                <div><b>Pincode:</b> <span className="font-mono font-bold text-red-700">324009 (Dadabari S.O.)</span></div>
                <div><b>Postal Beat:</b> <span className="font-bold text-slate-900">{selectedStoreForModal.beatNo}</span></div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-800">Contact & Staff Assignment</div>
                <div className="font-mono"><b>Primary Mobile:</b> {selectedStoreForModal.primaryMobile}</div>
                <div className="font-mono"><b>WhatsApp:</b> {selectedStoreForModal.whatsapp}</div>
                <div><b>Assigned Postman:</b> {selectedStoreForModal.assignedStaffName} ({selectedStoreForModal.assignedStaffRole})</div>
                <div className="font-mono"><b>Staff Directory ID:</b> {selectedStoreForModal.assignedStaffId}</div>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 space-y-1">
                <div className="font-bold">Postal Potential & Commercial Operations:</div>
                <p className="text-[11px] leading-relaxed">{selectedStoreForModal.postalPotentialRemark}</p>
                <div className="text-[10px] text-amber-800 mt-1">
                  Daily Footfall: ~{selectedStoreForModal.dailyFootfall} | Last Ground Audit: {selectedStoreForModal.lastAuditDate}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  handleIngest324009Store(selectedStoreForModal);
                  setSelectedStoreForModal(null);
                }}
                className="flex-1 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus size={14} />
                <span>Confirm & Sync to CRM Master</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedStoreForModal(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE RECORD MODAL */}
      {editingStore && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStoreEdit}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Update Store Record
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Edit Commercial Entity (PIN 324009)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStore(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Store / Signboard Name</label>
                <input
                  type="text"
                  value={editingStore.storeName}
                  onChange={(e) => setEditingStore({ ...editingStore, storeName: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Owner / Proprietor</label>
                  <input
                    type="text"
                    value={editingStore.ownerName}
                    onChange={(e) => setEditingStore({ ...editingStore, ownerName: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Mobile (10-Digit)</label>
                  <input
                    type="text"
                    value={editingStore.primaryMobile}
                    onChange={(e) => setEditingStore({ ...editingStore, primaryMobile: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={editingStore.whatsapp}
                    onChange={(e) => setEditingStore({ ...editingStore, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plot / Shop Number</label>
                  <input
                    type="text"
                    value={editingStore.housePlotNumber}
                    onChange={(e) => setEditingStore({ ...editingStore, housePlotNumber: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Colony / Locality</label>
                  <input
                    type="text"
                    value={editingStore.colony}
                    onChange={(e) => setEditingStore({ ...editingStore, colony: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Postal Beat</label>
                  <select
                    value={editingStore.beatNo}
                    onChange={(e) => setEditingStore({ ...editingStore, beatNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:outline-hidden"
                  >
                    {['Beat 1', 'Beat 2', 'Beat 3', 'Beat 4', 'Beat 5', 'Beat 6', 'Beat 7', 'Beat 8', 'Beat 9', 'Beat 10', 'Beat 33'].map((b) => (
                      <option key={b} value={b}>
                        {b} (Dadabari S.O.)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Prominent Landmark</label>
                <input
                  type="text"
                  value={editingStore.landmark}
                  onChange={(e) => setEditingStore({ ...editingStore, landmark: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Postal Potential & Remarks</label>
                <textarea
                  rows={2}
                  value={editingStore.postalPotentialRemark}
                  onChange={(e) => setEditingStore({ ...editingStore, postalPotentialRemark: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Check size={14} />
                <span>Save Changes & Sync CRM</span>
              </button>
              <button
                type="button"
                onClick={() => setEditingStore(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customer Profile Modal for Customer Merchants */}
      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
