import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
} from '@vis.gl/react-google-maps';
import {
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  FileSpreadsheet,
  Filter,
  Layers,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';
import {
  CommercialStoreCategory,
  CommercialStoreRecord,
} from '../../types/models';
import {
  BulkImportResult,
  commercialPropertyService,
  ExtractCommercialResult,
} from '../../services/commercialPropertyService';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { staffPermissionService } from '../../services/staffPermissionService';
import { Link } from 'react-router-dom';

const CATEGORY_PIN_STYLE: Record<
  CommercialStoreCategory,
  { bg: string; border: string; badge: string; label: string }
> = {
  Retail: {
    bg: '#059669',
    border: '#065f46',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Retail Store',
  },
  Wholesale: {
    bg: '#4f46e5',
    border: '#312e81',
    badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    label: 'Wholesale Mart',
  },
  Services: {
    bg: '#d97706',
    border: '#92400e',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Services / Office',
  },
  'eMitra/CSC': {
    bg: '#dc2626',
    border: '#991b1b',
    badge: 'bg-red-50 text-red-800 border-red-200',
    label: 'eMitra / CSC Kiosk',
  },
};

function sanitizeWhatsappUrl(phone: string, storeName: string): string | null {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length < 10) return null;
  const full = digits.length === 10 ? `91${digits}` : digits;
  const msg = encodeURIComponent(
    `Namaste from India Post (Xpeedo Last Mile · Dadabari S.O. 324009) regarding ${storeName}.`
  );
  return `https://wa.me/${full}?text=${msg}`;
}

export default function CommercialPropertyHub() {
  const { userProfile } = useAuth();
  const isPostmanOrGds = staffPermissionService.isPostmanOrGds(userProfile);
  const scopedBeatsSet = useMemo(
    () => staffPermissionService.getScopedBeatsSet(userProfile),
    [userProfile]
  );

  const [stores, setStores] = useState<CommercialStoreRecord[]>(() =>
    commercialPropertyService.getAllStores()
  );
  const [serverMapsStatus, setServerMapsStatus] = useState<{
    hasServerPlacesKey: boolean;
    hasClientMapKey: boolean;
  }>({ hasServerPlacesKey: false, hasClientMapKey: false });

  // Filters
  const defaultBeatFilter = useMemo(() => {
    if (isPostmanOrGds && scopedBeatsSet.size > 0) {
      const firstClean = Array.from(scopedBeatsSet)[0];
      return `Beat ${firstClean}`;
    }
    return 'ALL';
  }, [isPostmanOrGds, scopedBeatsSet]);

  const [beatFilter, setBeatFilter] = useState<string>(defaultBeatFilter);
  const [colonyFilter, setColonyFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [ageFilter, setAgeFilter] = useState<'ALL' | '5+' | '3+'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'directory'>('split');

  // Extraction & Import state
  const [showExtractDrawer, setShowExtractDrawer] = useState<boolean>(false);
  const [extractBeat, setExtractBeat] = useState<string>(
    defaultBeatFilter === 'ALL' ? 'Beat 1' : defaultBeatFilter
  );
  const [extractMinYears, setExtractMinYears] = useState<number>(3);
  const [extractPages, setExtractPages] = useState<number>(2);
  const [extractCategories, setExtractCategories] = useState<CommercialStoreCategory[]>([
    'Retail',
    'Wholesale',
    'Services',
    'eMitra/CSC',
  ]);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractSummary, setExtractSummary] = useState<ExtractCommercialResult | null>(null);

  // Bulk Import modal
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Selected Pin / Editor Modal
  const [selectedStore, setSelectedStore] = useState<CommercialStoreRecord | null>(null);
  const [editingStore, setEditingStore] = useState<CommercialStoreRecord | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<CommercialStoreRecord>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 12;

  const notify = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    const unsub = commercialPropertyService.subscribe(() => {
      setStores(commercialPropertyService.getAllStores());
    });
    fetch('/api/v1/maps/config')
      .then((r) => r.json())
      .then((d) => {
        if (d?.success) {
          setServerMapsStatus({
            hasServerPlacesKey: Boolean(d.hasServerPlacesKey),
            hasClientMapKey: Boolean(d.hasClientMapKey),
          });
        }
      })
      .catch(() => {});
    return () => unsub();
  }, []);

  const rawClientApiKey = String((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '').trim();
  const hasValidClientMapKey =
    rawClientApiKey.length > 15 &&
    !rawClientApiKey.includes('DEMO') &&
    !rawClientApiKey.includes('MY_');

  // Role-scoped base dataset
  const roleScopedStores = useMemo(() => {
    if (!isPostmanOrGds || scopedBeatsSet.size === 0) return stores;
    return stores.filter((s) => scopedBeatsSet.has(s.cleanBeatNo));
  }, [stores, isPostmanOrGds, scopedBeatsSet]);

  const beatOptions = useMemo(() => {
    if (isPostmanOrGds && scopedBeatsSet.size > 0) {
      return commercialPropertyService.beatDirectory.filter((b) =>
        scopedBeatsSet.has(b.cleanBeatNo)
      );
    }
    return commercialPropertyService.beatDirectory;
  }, [isPostmanOrGds, scopedBeatsSet]);

  // Dynamic colonies for selected beat
  const colonyOptions = useMemo(() => {
    const set = new Set<string>();
    const metaCols =
      beatFilter === 'ALL'
        ? []
        : commercialPropertyService.getBeatMeta(beatFilter).colonies;
    metaCols.forEach((c) => set.add(c));
    roleScopedStores.forEach((s) => {
      if (beatFilter === 'ALL' || s.beatNo === beatFilter) {
        if (s.colony) set.add(s.colony);
      }
    });
    return Array.from(set).sort();
  }, [roleScopedStores, beatFilter]);

  const filteredStores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return roleScopedStores.filter((s) => {
      if (beatFilter !== 'ALL' && s.beatNo !== beatFilter) return false;
      if (colonyFilter !== 'ALL' && s.colony.toLowerCase() !== colonyFilter.toLowerCase())
        return false;
      if (categoryFilter !== 'ALL' && s.category !== categoryFilter) return false;
      if (ageFilter === '5+' && s.operationYears < 5) return false;
      if (ageFilter === '3+' && s.operationYears < 3) return false;
      if (q) {
        const hay = `${s.storeName} ${s.ownerName} ${s.primaryPhone} ${s.fullAddress} ${s.colony} ${s.blockSector} ${s.placeId || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [roleScopedStores, beatFilter, colonyFilter, categoryFilter, ageFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [beatFilter, colonyFilter, categoryFilter, ageFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredStores.length / PAGE_SIZE));
  const paginatedStores = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStores.slice(start, start + PAGE_SIZE);
  }, [filteredStores, currentPage]);

  const stats = useMemo(() => {
    const total = roleScopedStores.length;
    const fivePlus = roleScopedStores.filter((s) => s.operationYears >= 5).length;
    const threePlus = roleScopedStores.filter((s) => s.operationYears >= 3).length;
    const syncedCount = roleScopedStores.filter((s) => s.syncedToPropertyMaster).length;
    return { total, fivePlus, threePlus, syncedCount };
  }, [roleScopedStores]);

  const mapCenter = useMemo(() => {
    if (selectedStore) {
      return { lat: selectedStore.latitude, lng: selectedStore.longitude };
    }
    if (filteredStores.length > 0) {
      return { lat: filteredStores[0].latitude, lng: filteredStores[0].longitude };
    }
    if (beatFilter !== 'ALL') {
      const m = commercialPropertyService.getBeatMeta(beatFilter);
      return { lat: m.centerLat, lng: m.centerLng };
    }
    return { lat: 25.1462, lng: 75.8258 };
  }, [selectedStore, filteredStores, beatFilter]);

  const handleRunLiveExtract = async () => {
    if (extractCategories.length === 0) {
      notify('error', 'Select at least one business category for Places API extraction.');
      return;
    }
    setIsExtracting(true);
    setExtractSummary(null);
    const result = await commercialPropertyService.extractBeatFromGooglePlaces({
      beatNo: extractBeat,
      categories: extractCategories,
      minYears: extractMinYears,
      maxPagesPerQuery: extractPages,
      autoSyncToRoutes: true,
    });
    setExtractSummary(result);
    setIsExtracting(false);

    if (result.success) {
      setBeatFilter(extractBeat);
      setColonyFilter('ALL');
      notify(
        'success',
        `Extracted ${result.inserted + result.updated} verified stores for ${extractBeat} & synced ${result.syncedProperties} to Property Hub.`
      );
    } else if (result.quotaExceeded) {
      notify('error', 'Google Maps Platform API quota limit reached.');
    } else {
      notify('error', result.message || 'Extraction could not complete.');
    }
  };

  const handleBulkFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setImportResult(null);
    const res = await commercialPropertyService.parseAndBulkImportFile(
      file,
      beatFilter === 'ALL' ? 'Beat 1' : beatFilter,
      true
    );
    setImportResult(res);
    setIsImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (res.success) {
      notify(
        'success',
        `Imported ${res.inserted} new & ${res.updated} updated stores (${res.duplicatesSkipped} duplicates skipped).`
      );
    } else {
      notify('error', res.errors[0] || 'Bulk import failed.');
    }
  };

  const handleImportBaselineCrm = () => {
    const res = commercialPropertyService.importExistingCrmBaselineRegistry();
    const syncRes = commercialPropertyService.syncToFieldWorkflows();
    notify(
      'success',
      `Merged ${res.inserted} verified Dadabari 324009 baseline stores (${res.duplicatesSkipped} duplicates skipped) & synced ${syncRes.syncedProperties} properties.`
    );
  };

  const handleSyncAllToWorkflows = () => {
    const res = commercialPropertyService.syncToFieldWorkflows(
      filteredStores.map((s) => s.id)
    );
    notify(
      'success',
      `Synced ${res.syncedProperties} commercial properties & queued ${res.queuedVerifications} Postman verification targets.`
    );
  };

  const handleDedupAudit = () => {
    const res = commercialPropertyService.runDeduplicationAudit();
    notify(
      'info',
      `De-duplication audit complete: removed ${res.duplicatesRemoved} duplicate entries (${res.afterCount} clean commercial properties).`
    );
  };

  const openEditor = (store: CommercialStoreRecord) => {
    setEditingStore(store);
    setEditDraft({
      storeName: store.storeName,
      ownerName: store.ownerName,
      primaryPhone: store.primaryPhone,
      whatsappNumber: store.whatsappNumber,
      category: store.category,
      beatNo: store.beatNo,
      colony: store.colony,
      blockSector: store.blockSector,
      pincode: store.pincode,
      operationYears: store.operationYears,
      verificationStatus: store.verificationStatus,
    });
  };

  const saveEdit = () => {
    if (!editingStore) return;
    commercialPropertyService.updateStore(editingStore.id, editDraft);
    setEditingStore(null);
    notify('success', `Updated commercial profile for ${editDraft.storeName || editingStore.storeName}.`);
  };

  const toggleCategory = (cat: CommercialStoreCategory) => {
    setExtractCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 space-y-5">
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 max-w-md px-4 py-3 rounded-2xl border shadow-xl text-xs font-bold flex items-center justify-between gap-3 ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : toast.type === 'error'
              ? 'bg-red-900 text-white border-red-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          <span>{toast.text}</span>
          <button type="button" onClick={() => setToast(null)} className="opacity-80 hover:opacity-100">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header & Top Action Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-lg bg-red-700 text-white text-[11px] font-black uppercase tracking-wide">
                Xpeedo Last Mile · Commercial GIS
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200">
                Dadabari S.O. 324009 · Beat 1–34
              </span>
              {isPostmanOrGds && (
                <span className="px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-900 text-[11px] font-bold border border-sky-200">
                  Beat-Scoped View
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Store className="text-red-700" size={26} />
              <span>Commercial Property & Store Directory</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mt-0.5">
              Verified commercial storefronts, wholesale hubs, services & eMitra/CSC centers with 3–5+ year operational longevity and live geo-tagging.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/commercial-intelligence"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Sparkles size={15} className="text-amber-400" />
              <span>AI 4-Factor &amp; Matching Engine</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowExtractDrawer((v) => !v)}
              className="px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Sparkles size={15} />
              <span>Google Maps Extractor</span>
            </button>
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Upload size={15} />
              <span>Bulk Import CSV / JSON</span>
            </button>
            <button
              type="button"
              onClick={handleSyncAllToWorkflows}
              disabled={filteredStores.length === 0}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <RefreshCw size={15} />
              <span>Sync to Field & Verify</span>
            </button>
            <button
              type="button"
              onClick={() => commercialPropertyService.exportStoresToCsv(filteredStores)}
              disabled={filteredStores.length === 0}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Total Stores Listed</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</div>
            <div className="text-[11px] text-slate-500">Showing {filteredStores.length} after filters</div>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200">
            <div className="text-[11px] font-bold text-emerald-700 uppercase">5+ Years Verified</div>
            <div className="text-2xl font-black text-emerald-900 mt-0.5">{stats.fivePlus}</div>
            <div className="text-[11px] text-emerald-700">High-stability commercial units</div>
          </div>
          <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200">
            <div className="text-[11px] font-bold text-amber-800 uppercase">3+ Years Operational</div>
            <div className="text-2xl font-black text-amber-950 mt-0.5">{stats.threePlus}</div>
            <div className="text-[11px] text-amber-800">Verified review & footfall history</div>
          </div>
          <div className="bg-sky-50 rounded-2xl p-3.5 border border-sky-200">
            <div className="text-[11px] font-bold text-sky-800 uppercase">Synced to Property Hub</div>
            <div className="text-2xl font-black text-sky-950 mt-0.5">{stats.syncedCount}</div>
            <div className="text-[11px] text-sky-800">Active on Postman Beat Routes</div>
          </div>
        </div>
      </div>

      {/* Collapsible Google Places API (New) Live Extractor Drawer */}
      {showExtractDrawer && (
        <div className="bg-white rounded-3xl border-2 border-red-200 p-5 shadow-md space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Compass className="text-red-700" size={19} />
                <span>Automated Google Maps Places API (New) Commercial Extractor</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Queries verified active businesses per postal beat (Dadabari S.O. 324009), enforces operational longevity from Google review timestamps & footfall, de-duplicates by Place ID, and syncs to Field Verification.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowExtractDrawer(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Target Postal Beat
              </label>
              <select
                value={extractBeat}
                onChange={(e) => setExtractBeat(e.target.value)}
                disabled={isPostmanOrGds && beatOptions.length === 1}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
              >
                {beatOptions.map((b) => (
                  <option key={b.cleanBeatNo} value={b.beatNo}>
                    {b.beatNo} · {b.colonies.slice(0, 2).join(', ')} ({b.pincode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Longevity Filter (Review History)
              </label>
              <select
                value={extractMinYears}
                onChange={(e) => setExtractMinYears(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
              >
                <option value={5}>Strict 5+ Years Verified</option>
                <option value={3}>Sustained 3+ Years (Recommended)</option>
                <option value={0}>All Operational Businesses</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Search Depth Per Category
              </label>
              <select
                value={extractPages}
                onChange={(e) => setExtractPages(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
              >
                <option value={1}>1 Page / Query (~20 candidates)</option>
                <option value={2}>2 Pages / Query (~40 candidates)</option>
                <option value={3}>3 Pages / Query (50+ Target Batch)</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleRunLiveExtract}
                disabled={isExtracting}
                className="w-full px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <RefreshCw size={15} className={isExtracting ? 'animate-spin' : ''} />
                <span>{isExtracting ? 'Extracting Live Places...' : `Run Extraction (${extractBeat})`}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Categories:</span>
              {(['Retail', 'Wholesale', 'Services', 'eMitra/CSC'] as CommercialStoreCategory[]).map(
                (cat) => {
                  const active = extractCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {active ? '✓ ' : ''}
                      {cat}
                    </button>
                  );
                }
              )}
            </div>

            <div className="text-[11px] text-slate-500">
              Backend Places Key:{' '}
              <strong className={serverMapsStatus.hasServerPlacesKey ? 'text-emerald-700' : 'text-amber-700'}>
                {serverMapsStatus.hasServerPlacesKey ? 'Active (Places API New)' : 'Ready on Key Config'}
              </strong>
            </div>
          </div>

          {extractSummary && (
            <div
              className={`p-3.5 rounded-2xl border text-xs ${
                extractSummary.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              {extractSummary.success ? (
                <div className="space-y-1">
                  <div className="font-black">
                    Extraction Complete: {extractSummary.inserted} added, {extractSummary.updated} updated,{' '}
                    {extractSummary.duplicatesSkipped} duplicates skipped.
                  </div>
                  {extractSummary.diagnostics && (
                    <div className="text-[11px] text-emerald-800">
                      Places Fetched: {extractSummary.diagnostics.rawFetched} · Operational:{' '}
                      {extractSummary.diagnostics.operationalCount} · Filtered Out (&lt;
                      {extractSummary.diagnostics.minYearsApplied} yrs):{' '}
                      {extractSummary.diagnostics.filteredOutByLongevity} · Synced to Properties:{' '}
                      {extractSummary.syncedProperties} · Queued for Postman Verify:{' '}
                      {extractSummary.queuedVerifications}
                    </div>
                  )}
                </div>
              ) : (
                <div className="font-bold">
                  {extractSummary.message || 'Extraction did not return live results.'} You can also import CSV/JSON commercial sheets via Bulk Import.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hierarchical Drill-Down Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase">
            <Filter size={15} className="text-red-700" />
            <span>Hierarchical Drill-Down Filters</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleImportBaselineCrm}
              className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold cursor-pointer"
            >
              Load Dadabari 324009 Baseline
            </button>
            <button
              type="button"
              onClick={handleDedupAudit}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold cursor-pointer"
            >
              Run De-dup Audit
            </button>
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5">
              {(['split', 'map', 'directory'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setViewMode(m)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition cursor-pointer ${
                    viewMode === m
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m === 'split' ? 'Split View' : m === 'map' ? 'Map Only' : 'Directory Table'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Postal Beat */}
          <select
            value={beatFilter}
            onChange={(e) => {
              setBeatFilter(e.target.value);
              setColonyFilter('ALL');
            }}
            disabled={isPostmanOrGds && beatOptions.length === 1}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
          >
            {!isPostmanOrGds && <option value="ALL">All Postal Beats (Beat 1–34)</option>}
            {beatOptions.map((b) => (
              <option key={b.cleanBeatNo} value={b.beatNo}>
                {b.beatNo} ({b.staffName})
              </option>
            ))}
          </select>

          {/* Colony */}
          <select
            value={colonyFilter}
            onChange={(e) => setColonyFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
          >
            <option value="ALL">All Colonies in Scope</option>
            {colonyOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Business Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
          >
            <option value="ALL">All Business Categories</option>
            <option value="Retail">Retail Stores</option>
            <option value="Wholesale">Wholesale Marts</option>
            <option value="Services">Services & Offices</option>
            <option value="eMitra/CSC">eMitra / CSC Kiosks</option>
          </select>

          {/* Active Operation Age */}
          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value as 'ALL' | '5+' | '3+')}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
          >
            <option value="ALL">Operation Age: All Records</option>
            <option value="5+">Verified 5+ Years Active</option>
            <option value="3+">Verified 3+ Years Active</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store, owner, mobile..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600"
            />
          </div>
        </div>
      </div>

      {/* Main Workspace: Interactive Google Map + Store Inspector / Directory */}
      <div
        className={`grid gap-5 ${
          viewMode === 'split'
            ? 'grid-cols-1 xl:grid-cols-12'
            : 'grid-cols-1'
        }`}
      >
        {(viewMode === 'split' || viewMode === 'map') && (
          <div
            className={`${
              viewMode === 'split' ? 'xl:col-span-7' : ''
            } bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="text-red-700" size={18} />
                <span className="text-sm font-black text-slate-900">
                  Geo-Tagged Commercial Map ({filteredStores.length} pins)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Retail
                </span>
                <span className="inline-flex items-center gap-1 text-indigo-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Wholesale
                </span>
                <span className="inline-flex items-center gap-1 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Services
                </span>
                <span className="inline-flex items-center gap-1 text-red-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> eMitra/CSC
                </span>
              </div>
            </div>

            <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
              {hasValidClientMapKey ? (
                <APIProvider apiKey={rawClientApiKey} region="IN" language="en">
                  <GoogleMap
                    defaultCenter={mapCenter}
                    center={selectedStore ? { lat: selectedStore.latitude, lng: selectedStore.longitude } : undefined}
                    defaultZoom={14}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    className="w-full h-full"
                  >
                    {filteredStores.slice(0, 120).map((store) => {
                      const style = CATEGORY_PIN_STYLE[store.category] || CATEGORY_PIN_STYLE.Retail;
                      return (
                        <AdvancedMarker
                          key={store.id}
                          position={{ lat: store.latitude, lng: store.longitude }}
                          onClick={() => setSelectedStore(store)}
                          title={store.storeName}
                        >
                          <Pin
                            background={style.bg}
                            borderColor={style.border}
                            glyphColor="#ffffff"
                            scale={selectedStore?.id === store.id ? 1.25 : 1.0}
                          />
                        </AdvancedMarker>
                      );
                    })}

                    {selectedStore && (
                      <InfoWindow
                        position={{ lat: selectedStore.latitude, lng: selectedStore.longitude }}
                        onCloseClick={() => setSelectedStore(null)}
                      >
                        <div className="w-72 p-1 text-slate-900 space-y-2">
                          {selectedStore.photoUrl && (
                            <div className="space-y-1">
                              <img
                                src={selectedStore.photoUrl}
                                alt={selectedStore.storeName}
                                className="w-full h-28 object-cover rounded-lg border border-slate-200"
                              />
                              {selectedStore.photoAttribution?.displayName && (
                                <div className="text-[10px] text-slate-500">
                                  Photo:{' '}
                                  {selectedStore.photoAttribution.uri ? (
                                    <a
                                      href={
                                        selectedStore.photoAttribution.uri.startsWith('//')
                                          ? `https:${selectedStore.photoAttribution.uri}`
                                          : selectedStore.photoAttribution.uri
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline"
                                    >
                                      {selectedStore.photoAttribution.displayName}
                                    </a>
                                  ) : (
                                    selectedStore.photoAttribution.displayName
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                                {selectedStore.longevityBadge}
                              </span>
                              <span className="text-[10px] font-bold text-slate-600">
                                {selectedStore.beatNo} · PIN {selectedStore.pincode}
                              </span>
                            </div>
                            <h3 className="text-sm font-black text-slate-900 mt-1">
                              {selectedStore.storeName}
                            </h3>
                            <p className="text-[11px] font-semibold text-slate-700">
                              Proprietor: {selectedStore.ownerName}
                            </p>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-snug">
                            {selectedStore.fullAddress}
                          </p>

                          <div className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            GPS: {selectedStore.latitude.toFixed(6)}, {selectedStore.longitude.toFixed(6)}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {selectedStore.primaryPhone && (
                              <a
                                href={`tel:${selectedStore.primaryPhone}`}
                                className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold inline-flex items-center gap-1"
                              >
                                <Phone size={11} /> Call
                              </a>
                            )}
                            {sanitizeWhatsappUrl(selectedStore.whatsappNumber || selectedStore.primaryPhone, selectedStore.storeName) && (
                              <a
                                href={sanitizeWhatsappUrl(selectedStore.whatsappNumber || selectedStore.primaryPhone, selectedStore.storeName)!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold inline-flex items-center gap-1"
                              >
                                <MessageCircle size={11} /> WhatsApp
                              </a>
                            )}
                            {selectedStore.googleMapsUri && (
                              <a
                                href={selectedStore.googleMapsUri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold inline-flex items-center gap-1"
                              >
                                <ExternalLink size={11} /> Google Maps
                              </a>
                            )}
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                </APIProvider>
              ) : (
                /* Spatial Fallback Vector Canvas if Client Map Key is unset */
                <div className="w-full h-full flex flex-col justify-between p-5 text-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold">
                      Spatial Geo-Pin Preview ({filteredStores.length} Stores)
                    </span>
                    <span className="text-[11px] text-amber-300 font-semibold">
                      Set VITE_GOOGLE_MAPS_API_KEY in runtime environment for interactive Google Map tiles
                    </span>
                  </div>

                  <div className="relative flex-1 my-3 rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden">
                    {filteredStores.slice(0, 60).map((store, idx) => {
                      const angle = ((idx * 47) % 360) * (Math.PI / 180);
                      const radius = 14 + ((idx * 13) % 30);
                      const left = `${Math.max(8, Math.min(92, 50 + Math.cos(angle) * radius))}%`;
                      const top = `${Math.max(10, Math.min(88, 50 + Math.sin(angle) * radius))}%`;
                      const style = CATEGORY_PIN_STYLE[store.category] || CATEGORY_PIN_STYLE.Retail;
                      return (
                        <button
                          key={store.id}
                          type="button"
                          onClick={() => setSelectedStore(store)}
                          style={{ left, top, transform: 'translate(-50%, -50%)' }}
                          className="absolute group cursor-pointer"
                          title={`${store.storeName} (${store.beatNo})`}
                        >
                          <div
                            style={{ backgroundColor: style.bg, borderColor: '#ffffff' }}
                            className={`w-4 h-4 rounded-full border-2 shadow-md transition-transform ${
                              selectedStore?.id === store.id ? 'scale-150 ring-4 ring-white/40' : 'group-hover:scale-125'
                            }`}
                          />
                        </button>
                      );
                    })}

                    {selectedStore && (
                      <div className="absolute bottom-3 left-3 right-3 bg-white text-slate-900 rounded-2xl p-3.5 shadow-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-start justify-between">
                        <div className="flex gap-3 items-start">
                          {selectedStore.photoUrl && (
                            <img
                              src={selectedStore.photoUrl}
                              alt={selectedStore.storeName}
                              className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          )}
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                                {selectedStore.longevityBadge}
                              </span>
                              <span className="text-[11px] font-bold text-slate-500">
                                {selectedStore.beatNo} · {selectedStore.colony}
                              </span>
                            </div>
                            <h3 className="text-sm font-black">{selectedStore.storeName}</h3>
                            <p className="text-xs text-slate-700">Owner: {selectedStore.ownerName}</p>
                            <p className="text-[11px] text-slate-500">{selectedStore.fullAddress}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedStore(null)}
                          className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Click any store pin or directory card to inspect storefront photo, proprietor contact & geo-tag.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Store Cards / Directory Inspector List */}
        {(viewMode === 'split' || viewMode === 'directory') && (
          <div
            className={`${
              viewMode === 'split' ? 'xl:col-span-5' : ''
            } bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-col`}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Building2 className="text-red-700" size={18} />
                <span>Verified Store Listings ({filteredStores.length})</span>
              </h2>
              <span className="text-[11px] font-bold text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            {paginatedStores.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                  <Store size={28} />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-sm font-black text-slate-900">
                    No Commercial Stores Match Current Filters
                  </h3>
                  <p className="text-xs text-slate-500">
                    Run live <strong>Google Maps Extractor</strong> for Beat 1–34, import a CSV/JSON sheet, or load the verified Dadabari 324009 baseline registry.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowExtractDrawer(true)}
                    className="px-3.5 py-2 rounded-xl bg-red-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Open Google Maps Extractor
                  </button>
                  <button
                    type="button"
                    onClick={handleImportBaselineCrm}
                    className="px-3.5 py-2 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold cursor-pointer"
                  >
                    Load Dadabari Baseline
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`space-y-3 ${
                  viewMode === 'split' ? 'max-h-[540px] overflow-y-auto pr-1' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 space-y-0'
                }`}
              >
                {paginatedStores.map((store) => {
                  const catStyle = CATEGORY_PIN_STYLE[store.category] || CATEGORY_PIN_STYLE.Retail;
                  const waUrl = sanitizeWhatsappUrl(
                    store.whatsappNumber || store.primaryPhone,
                    store.storeName
                  );
                  const isSelected = selectedStore?.id === store.id;

                  return (
                    <div
                      key={store.id}
                      onClick={() => setSelectedStore(store)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'border-red-600 bg-red-50/40 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex gap-3">
                        {store.photoUrl ? (
                          <img
                            src={store.photoUrl}
                            alt={store.storeName}
                            loading="lazy"
                            className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                            <Store size={24} />
                          </div>
                        )}

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md border text-[10px] font-black ${catStyle.badge}`}
                            >
                              {store.category}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1">
                              <Clock size={10} /> {store.longevityBadge}
                            </span>
                          </div>
                          <h3 className="text-sm font-black text-slate-900 truncate">
                            {store.storeName}
                          </h3>
                          <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 truncate">
                            <User size={11} className="text-slate-400 shrink-0" />
                            <span className="truncate">{store.ownerName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-1">
                        <div className="flex items-start gap-1.5">
                          <MapPin size={12} className="text-red-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{store.fullAddress}</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-slate-500">
                          <span>
                            {store.beatNo} · {store.colony} · {store.pincode}
                          </span>
                          <span className="font-mono">
                            {store.latitude.toFixed(5)}, {store.longitude.toFixed(5)}
                          </span>
                        </div>
                      </div>

                      <div
                        className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-slate-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-wrap items-center gap-1.5">
                          {store.primaryPhone ? (
                            <a
                              href={`tel:${store.primaryPhone}`}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold inline-flex items-center gap-1"
                            >
                              <Phone size={11} /> {store.primaryPhone}
                            </a>
                          ) : (
                            <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-bold">
                              No Phone
                            </span>
                          )}
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1"
                            >
                              <MessageCircle size={11} /> WhatsApp
                            </a>
                          )}
                          {store.googleMapsUri && (
                            <a
                              href={store.googleMapsUri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold inline-flex items-center gap-1"
                            >
                              <Navigation size={11} /> Maps
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditor(store)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                            title="Edit Proprietor & Store Metadata"
                          >
                            <Edit3 size={13} />
                          </button>
                          {!isPostmanOrGds && (
                            <button
                              type="button"
                              onClick={() => {
                                commercialPropertyService.deleteStore(store.id);
                                if (selectedStore?.id === store.id) setSelectedStore(null);
                                notify('info', `Removed ${store.storeName} from commercial directory.`);
                              }}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Remove Store Entry"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-bold disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span className="font-bold text-slate-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 font-bold disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk Import CSV / JSON / XLSX Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="text-red-700" size={20} />
                <span>Bulk Commercial Store Importer (CSV / XLSX / JSON)</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Upload structured storefront datasets extracted for Dadabari S.O. beats. The engine automatically de-duplicates entries by <strong>Place ID</strong>, <strong>Store Name + Colony</strong>, and <strong>Mobile Number</strong>, then pushes them directly to the <strong>Property Directory</strong> and <strong>Postman Verification Queue</strong>.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => commercialPropertyService.downloadBulkTemplate('csv')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={13} /> Sample CSV Template
              </button>
              <button
                type="button"
                onClick={() => commercialPropertyService.downloadBulkTemplate('json')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={13} /> Sample JSON Template
              </button>
            </div>

            <label className="block border-2 border-dashed border-slate-300 hover:border-red-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50">
              <Upload size={28} className="mx-auto text-red-700 mb-2" />
              <div className="text-xs font-black text-slate-900">
                {isImporting ? 'Processing & De-duplicating Records...' : 'Click to select .CSV, .XLSX, or .JSON file'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Required columns: Store Name, Colony / Address, Beat No (optional Phone, Owner, Lat/Lng, Photo URL, Years Active)
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                onChange={handleBulkFileUpload}
                className="hidden"
              />
            </label>

            {importResult && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <div className="font-black">
                  Parsed {importResult.totalParsed} rows · {importResult.inserted} inserted ·{' '}
                  {importResult.updated} updated · {importResult.duplicatesSkipped} duplicates skipped
                </div>
                <div className="text-[11px]">
                  Synced to Property Master: {importResult.syncedProperties} · Queued for Daily Verification:{' '}
                  {importResult.queuedVerifications}
                </div>
                {importResult.errors.length > 0 && (
                  <div className="text-[11px] text-amber-800 pt-1">
                    Notes: {importResult.errors.join(' | ')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Proprietor & Metadata Modal */}
      {editingStore && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900">
                Edit Commercial Store Profile
              </h2>
              <button
                type="button"
                onClick={() => setEditingStore(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-600 mb-1">Store / Business Name</label>
                <input
                  type="text"
                  value={editDraft.storeName || ''}
                  onChange={(e) => setEditDraft((d) => ({ ...d, storeName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Owner / Proprietor Name</label>
                <input
                  type="text"
                  value={editDraft.ownerName || ''}
                  onChange={(e) => setEditDraft((d) => ({ ...d, ownerName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Category</label>
                <select
                  value={editDraft.category || 'Retail'}
                  onChange={(e) =>
                    setEditDraft((d) => ({ ...d, category: e.target.value as CommercialStoreCategory }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                >
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Services">Services</option>
                  <option value="eMitra/CSC">eMitra/CSC</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Primary Phone</label>
                <input
                  type="text"
                  value={editDraft.primaryPhone || ''}
                  onChange={(e) => setEditDraft((d) => ({ ...d, primaryPhone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={editDraft.whatsappNumber || ''}
                  onChange={(e) => setEditDraft((d) => ({ ...d, whatsappNumber: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Postal Beat</label>
                <select
                  value={editDraft.beatNo || 'Beat 1'}
                  onChange={(e) => setEditDraft((d) => ({ ...d, beatNo: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                >
                  {commercialPropertyService.beatDirectory.map((b) => (
                    <option key={b.cleanBeatNo} value={b.beatNo}>
                      {b.beatNo}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Colony</label>
                <input
                  type="text"
                  value={editDraft.colony || ''}
                  onChange={(e) => setEditDraft((d) => ({ ...d, colony: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingStore(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold cursor-pointer"
              >
                Save & Sync Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
