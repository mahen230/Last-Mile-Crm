import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Store,
  Users,
  Truck,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Package,
  Layers,
  Building2,
  Calendar,
  UserCheck,
  X,
  Plus,
  Send,
  Eye,
  Check,
} from 'lucide-react';
import {
  CommercialStoreRecord,
  FourFactorFreshnessStatus,
  FourFactorVerificationResult,
  CustomerDemographicMatch,
  BeatProductMatchingPlan,
  LogisticsDispatchOrder,
} from '../../types/models';
import { commercialPropertyService } from '../../services/commercialPropertyService';
import { aiCommercialVerificationService } from '../../services/aiCommercialVerificationService';
import { useAuth } from '../auth/FirebaseAuthProvider';
import { staffPermissionService } from '../../services/staffPermissionService';

export default function AICommercialIntelligenceHub() {
  const { userProfile } = useAuth();
  const isPostmanOrGds = staffPermissionService.isPostmanOrGds(userProfile);
  const scopedBeatsSet = useMemo(
    () => staffPermissionService.getScopedBeatsSet(userProfile),
    [userProfile]
  );

  const [activeTab, setActiveTab] = useState<'FOUR_FACTOR' | 'CUSTOMER_MATCHING' | 'LOGISTICS_DISPATCH'>(
    'FOUR_FACTOR'
  );

  const [stores, setStores] = useState<CommercialStoreRecord[]>(() =>
    commercialPropertyService.getAllStores()
  );
  const [dispatches, setDispatches] = useState<LogisticsDispatchOrder[]>(() =>
    aiCommercialVerificationService.getAllDispatches()
  );

  // Search & Filter for 4-Factor Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [freshnessFilter, setFreshnessFilter] = useState<'ALL' | FourFactorFreshnessStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedBeatForTab1, setSelectedBeatForTab1] = useState<string>('ALL');

  // Customer Matching Tab State
  const defaultBeat = useMemo(() => {
    if (isPostmanOrGds && scopedBeatsSet.size > 0) {
      const first = Array.from(scopedBeatsSet)[0];
      return `Beat ${first}`;
    }
    return 'Beat 2';
  }, [isPostmanOrGds, scopedBeatsSet]);

  const [selectedBeatForMatching, setSelectedBeatForMatching] = useState<string>(defaultBeat);
  const [matchingSectorFilter, setMatchingSectorFilter] = useState<string>('ALL');
  const [pitchLanguage, setPitchLanguage] = useState<'hi' | 'en'>('hi');
  const [pitchedLeadMap, setPitchedLeadMap] = useState<Record<string, string>>({});
  const [matchingPlan, setMatchingPlan] = useState<BeatProductMatchingPlan>(() =>
    aiCommercialVerificationService.generateBeatMatchingPlan(defaultBeat)
  );

  // Re-verification modal state
  const [reverifyStore, setReverifyStore] = useState<CommercialStoreRecord | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isReverifying, setIsReverifying] = useState(false);

  // New Dispatch Modal State
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchForm, setDispatchForm] = useState<{
    storeId: string;
    storeName: string;
    productTitle: string;
    productSku: string;
    productPrice: number;
    customerName: string;
    customerMobile: string;
    deliveryAddress: string;
    colony: string;
    beatNo: string;
    serviceType: LogisticsDispatchOrder['serviceType'];
  }>({
    storeId: '',
    storeName: '',
    productTitle: 'Retail Grocery & Essentials Pack',
    productSku: 'XPD-RET-01',
    productPrice: 450,
    customerName: '',
    customerMobile: '',
    deliveryAddress: 'Dadabari, Kota',
    colony: 'Dadabari',
    beatNo: 'Beat 2',
    serviceType: 'Speed Post COD',
  });

  // Toast notification
  const [toast, setToast] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(
    null
  );

  const showToast = (type: 'success' | 'info' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  // Sync data subscriptions
  useEffect(() => {
    const unsubCommercial = commercialPropertyService.subscribe(() => {
      setStores(commercialPropertyService.getAllStores());
    });
    const unsubAI = aiCommercialVerificationService.subscribe(() => {
      setDispatches(aiCommercialVerificationService.getAllDispatches());
    });
    return () => {
      unsubCommercial();
      unsubAI();
    };
  }, []);

  // Update matching plan when beat changes
  useEffect(() => {
    setMatchingPlan(aiCommercialVerificationService.generateBeatMatchingPlan(selectedBeatForMatching));
  }, [selectedBeatForMatching, stores]);

  // Compute 4-factor evaluated stores
  const evaluatedStores = useMemo(() => {
    return stores.map((store) => {
      const evalRes =
        store.fourFactorVerification || aiCommercialVerificationService.evaluateStoreFourFactor(store);
      return {
        ...store,
        evaluation: evalRes,
      };
    });
  }, [stores]);

  // Tab 1 Filtered Stores
  const filteredStores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return evaluatedStores.filter((s) => {
      const matchSearch =
        !q ||
        s.storeName.toLowerCase().includes(q) ||
        s.colony.toLowerCase().includes(q) ||
        s.primaryPhone.includes(q) ||
        (s.ownerName && s.ownerName.toLowerCase().includes(q));

      const matchFreshness =
        freshnessFilter === 'ALL' || s.evaluation.freshnessStatus === freshnessFilter;

      const matchCategory = categoryFilter === 'ALL' || s.category === categoryFilter;

      const matchBeat =
        selectedBeatForTab1 === 'ALL' ||
        s.beatNo === selectedBeatForTab1 ||
        s.cleanBeatNo === selectedBeatForTab1.replace(/\D/g, '');

      return matchSearch && matchFreshness && matchCategory && matchBeat;
    });
  }, [evaluatedStores, searchQuery, freshnessFilter, categoryFilter, selectedBeatForTab1]);

  // Audit Metrics
  const auditMetrics = useMemo(() => {
    let fresh = 0;
    let stale = 0;
    let needsRecheck = 0;
    let totalScore = 0;

    evaluatedStores.forEach((s) => {
      totalScore += s.evaluation.score;
      if (s.evaluation.freshnessStatus === 'FRESH_ACTIVE') fresh++;
      else if (s.evaluation.freshnessStatus === 'STALE_EXCLUDED') stale++;
      else needsRecheck++;
    });

    const avgScore = evaluatedStores.length > 0 ? Math.round(totalScore / evaluatedStores.length) : 0;
    return {
      total: evaluatedStores.length,
      fresh,
      stale,
      needsRecheck,
      avgScore,
    };
  }, [evaluatedStores]);

  // Handle Full Database Audit
  const handleRunAudit = () => {
    const res = aiCommercialVerificationService.runFullDatabaseAudit();
    setStores(commercialPropertyService.getAllStores());
    showToast(
      'success',
      `Audit Complete: ${res.totalChecked} merchants audited · ${res.freshActiveCount} Fresh Active · ${res.staleExcludedCount} Stale Excluded (>365d) · ${res.needsRecheckCount} Needs Recheck`
    );
  };

  // Handle manual field re-verification
  const handleConfirmReverify = () => {
    if (!reverifyStore) return;
    setIsReverifying(true);
    const staffId = userProfile?.employeeId || userProfile?.id || 'STAFF-50457421';
    const staffName = userProfile?.name || 'Mahendra Kumar Meena (Beat Postman)';

    const ok = aiCommercialVerificationService.reverifyStoreInField(
      reverifyStore.id,
      staffId,
      staffName,
      verificationNotes
    );

    setIsReverifying(false);
    if (ok) {
      setStores(commercialPropertyService.getAllStores());
      showToast(
        'success',
        `Successfully field-verified ${reverifyStore.storeName}! Freshness clock reset for 365 days.`
      );
      setReverifyStore(null);
      setVerificationNotes('');
    } else {
      showToast('error', 'Failed to update store verification.');
    }
  };

  // Build iframe-safe WhatsApp Pitch URL + automatically track lead in CRM
  const buildPitchWhatsappUrl = (customer: CustomerDemographicMatch, targetOverride?: 'RESIDENT' | '918769706002' | '919460020640'): string => {
    const staffName = matchingPlan.pincodeManagerName || 'Mahendra Kumar Meena';
    const hindiMsg = `नमस्ते ${customer.customerName} जी! आपके क्षेत्र (${customer.sector}, ${customer.colony}, PIN ${customer.pincode}) के सत्यापित India Post बल्क कस्टमर का विशेष उत्पाद और India Post Speed Post COD / IPPB QR होम डिलीवरी उपलब्ध है। अधिक जानकारी या बुकिंग के लिए संपर्क करें — ${staffName} (${matchingPlan.beatNo}, India Post)`;
    const englishMsg = `${customer.recommendedPitchMessage}\n\n— Delivered via Speed Post COD & IPPB QR by India Post (${staffName}, ${matchingPlan.beatNo}, PIN ${customer.pincode})`;
    const fullMsg = pitchLanguage === 'hi' ? hindiMsg : englishMsg;
    const cleanPhone =
      targetOverride && targetOverride !== 'RESIDENT'
        ? targetOverride
        : `91${customer.customerMobile.replace(/\D/g, '').slice(-10)}`;
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(fullMsg)}`;
  };

  const handleLogPitchLead = (customer: CustomerDemographicMatch, storeId: string, storeName: string) => {
    const staffId = userProfile?.employeeId || matchingPlan.pincodeManagerId || 'STAFF-50457421';
    const staffName = userProfile?.name || matchingPlan.pincodeManagerName || 'Beat Postman';
    const ticketNo = aiCommercialVerificationService.logCustomerPitchAsLead(
      customer,
      storeName,
      staffId,
      staffName
    );
    const key = `${storeId}:${customer.customerId}`;
    setPitchedLeadMap((prev) => ({ ...prev, [key]: ticketNo }));
    showToast(
      'success',
      `WhatsApp Pitch opened & CRM Lead #${ticketNo} assigned to ${staffName} (${customer.beatNo})`
    );
  };

  // Convert Demographic Match into Logistics Dispatch
  const handleQuickConvertLeadToDispatch = (store: { storeId: string; storeName: string; category: string }, match: CustomerDemographicMatch) => {
    setDispatchForm({
      storeId: store.storeId,
      storeName: store.storeName,
      productTitle: `${store.storeName} Local Delivery Pack`,
      productSku: `XPD-${store.category.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      productPrice: 350,
      customerName: match.customerName,
      customerMobile: match.customerMobile,
      deliveryAddress: `${match.houseNo}, ${match.sector}, ${match.colony}, Kota ${match.pincode}`,
      colony: match.colony,
      beatNo: match.beatNo,
      serviceType: 'Speed Post COD',
    });
    setShowDispatchModal(true);
  };

  // Submit New Logistics Dispatch
  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchForm.customerName || !dispatchForm.customerMobile) {
      showToast('error', 'Please enter customer name and valid mobile number.');
      return;
    }

    const newOrder = aiCommercialVerificationService.createLogisticsDispatch({
      storeId: dispatchForm.storeId || 'COMM-LOCAL-01',
      storeName: dispatchForm.storeName || 'Commercial Store Partner',
      productTitle: dispatchForm.productTitle,
      productSku: dispatchForm.productSku,
      productPrice: Number(dispatchForm.productPrice) || 0,
      customerName: dispatchForm.customerName,
      customerMobile: dispatchForm.customerMobile,
      deliveryAddress: dispatchForm.deliveryAddress,
      colony: dispatchForm.colony,
      pincode: '324009',
      beatNo: dispatchForm.beatNo,
      pincodeManagerId: matchingPlan.pincodeManagerId || 'STAFF-50457421',
      pincodeManagerName: matchingPlan.pincodeManagerName || 'Mahendra Kumar Meena',
      pincodeManagerContact: matchingPlan.pincodeManagerContact || '8769706002',
      serviceType: dispatchForm.serviceType,
      status: 'OUT_FOR_DELIVERY',
      codAmount: Number(dispatchForm.productPrice) || 0,
      remarks: 'Handed to Beat Postman for doorstep delivery & COD collection.',
    });

    setDispatches(aiCommercialVerificationService.getAllDispatches());
    setShowDispatchModal(false);
    showToast(
      'success',
      `Speed Post COD Booked! Barcode: ${newOrder.speedPostBarcode} assigned to ${newOrder.pincodeManagerName}`
    );
  };

  // Update dispatch status
  const handleUpdateStatus = (id: string, newStatus: LogisticsDispatchOrder['status']) => {
    aiCommercialVerificationService.updateDispatchStatus(id, newStatus);
    setDispatches(aiCommercialVerificationService.getAllDispatches());
    showToast('info', `Order ${id} status updated to ${newStatus}`);
  };

  return (
    <div className="space-y-6 pb-12" id="ai-commercial-intelligence-hub">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold flex items-center gap-3 transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-700'
              : toast.type === 'error'
              ? 'bg-red-950 text-red-100 border-red-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertTriangle size={16} className="text-red-400 shrink-0" />
          ) : (
            <Sparkles size={16} className="text-amber-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-violet-800 to-purple-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-indigo-700/50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-indigo-200 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white font-bold">India Post Field Operations OS</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-amber-300">Dadabari S.O. (PIN 324009)</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-emerald-300 font-bold">Beats 1–34 Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Sparkles size={26} className="text-amber-300 shrink-0" />
            <span>Commercial Store Intelligence &amp; Customer Matching Engine</span>
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/90 max-w-3xl leading-relaxed">
            Automated 4-Factor verification cross-referencing real-world trade data, geospatial PIN accuracy, operational status, and digital footprint. Enforces a strict 365-day freshness rule to exclude stale merchants and empowers Pincode Managers to pitch verified products directly to local residents.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleRunAudit}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer whitespace-nowrap"
            id="run-full-audit-btn"
          >
            <RefreshCw size={14} />
            <span>Run 4-Factor Audit</span>
          </button>
          <button
            type="button"
            onClick={() => setShowDispatchModal(true)}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/25 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer whitespace-nowrap"
            id="new-speedpost-dispatch-btn"
          >
            <Plus size={14} />
            <span>Book Speed Post COD</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-indigo-800 uppercase">Commercial Stores</div>
          <div className="text-2xl font-black text-indigo-950 mt-1 font-mono tabular-nums">
            {auditMetrics.total}
          </div>
          <div className="text-[11px] text-indigo-700 mt-0.5">Tracked in Dadabari SO</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Fresh &amp; Active</span>
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-1 font-mono tabular-nums">
            {auditMetrics.fresh}
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">&lt; 365 Days · Promoted</div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-rose-800 uppercase flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-rose-600" />
            <span>Stale Excluded</span>
          </div>
          <div className="text-2xl font-black text-rose-950 mt-1 font-mono tabular-nums">
            {auditMetrics.stale}
          </div>
          <div className="text-[11px] text-rose-700 mt-0.5">&gt; 1 Year Late · Quarantined</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-amber-900 uppercase flex items-center gap-1.5">
            <Clock size={13} className="text-amber-600" />
            <span>Needs Field Check</span>
          </div>
          <div className="text-2xl font-black text-amber-950 mt-1 font-mono tabular-nums">
            {auditMetrics.needsRecheck}
          </div>
          <div className="text-[11px] text-amber-800 mt-0.5">Assigned to Beat Postman</div>
        </div>

        <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-4 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-sky-800 uppercase">Avg Quality Score</div>
          <div className="text-2xl font-black text-sky-950 mt-1 font-mono tabular-nums">
            {auditMetrics.avgScore} / 100
          </div>
          <div className="text-[11px] text-sky-700 mt-0.5">4-Factor Compliance</div>
        </div>
      </div>

      {/* Strict 1-Year Freshness Rule Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0 mt-0.5">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-xs font-black text-amber-300 uppercase tracking-wide">
              Strict 365-Day Freshness &amp; Verification Protocol
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-3xl">
              Commercial stores with listing or activity dates older than 1 year without physical field re-verification are automatically quarantined (`STALE_EXCLUDED`) from Public Citizen Storefronts. Assigned Beat Postmen act as decentralized Pincode Managers to verify physical premises and reactivate trustworthy merchants.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-xs text-slate-300 font-mono">
          <span>Active Postmen: 34 Beats</span>
          <span aria-hidden="true">·</span>
          <span>PIN: 324009</span>
        </div>
      </div>

      {/* Navigation Segmented Controls */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 max-w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('FOUR_FACTOR')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'FOUR_FACTOR'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck size={14} />
          <span>1. 4-Factor Verification &amp; Freshness Audit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CUSTOMER_MATCHING')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'CUSTOMER_MATCHING'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users size={14} />
          <span>2. PINcode &amp; Beat Customer Matching Engine</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('LOGISTICS_DISPATCH')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'LOGISTICS_DISPATCH'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Truck size={14} />
          <span>3. Logistics Dispatch &amp; Speed Post COD Tracker ({dispatches.length})</span>
        </button>
      </div>

      {/* TAB 1: 4-FACTOR VERIFICATION & FRESHNESS ENGINE */}
      {activeTab === 'FOUR_FACTOR' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search store name, proprietor, phone, or colony..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              {/* Freshness Filter */}
              <select
                value={freshnessFilter}
                onChange={(e) => setFreshnessFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Freshness Statuses</option>
                <option value="FRESH_ACTIVE">Fresh &amp; Active (&lt; 365d)</option>
                <option value="STALE_EXCLUDED">Stale Excluded (&gt; 1 yr)</option>
                <option value="NEEDS_FIELD_RECHECK">Needs Field Recheck</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Services">Services</option>
                <option value="eMitra/CSC">eMitra / CSC</option>
              </select>

              {/* Beat Filter */}
              <select
                value={selectedBeatForTab1}
                onChange={(e) => setSelectedBeatForTab1(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Beats (1–34)</option>
                {Array.from({ length: 34 }, (_, i) => `Beat ${i + 1}`).map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Counter */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong>{filteredStores.length}</strong> commercial merchants
            </span>
            <span className="font-mono">Dadabari S.O. Database</span>
          </div>

          {/* Store List */}
          <div className="space-y-3.5">
            {filteredStores.map((store) => {
              const evalRes = store.evaluation;
              const isStale = evalRes.freshnessStatus === 'STALE_EXCLUDED';
              const needsRecheck = evalRes.freshnessStatus === 'NEEDS_FIELD_RECHECK';
              const isFresh = evalRes.freshnessStatus === 'FRESH_ACTIVE';

              const daysSinceListed = Math.floor(
                (Date.now() - new Date(evalRes.listedDate).getTime()) / (1000 * 60 * 60 * 24)
              );
              const daysSinceChecked = Math.floor(
                (Date.now() - new Date(evalRes.lastCheckedDate).getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={store.id}
                  className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-sm transition ${
                    isStale
                      ? 'border-red-300 bg-red-50/20'
                      : needsRecheck
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Store Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-semibold text-slate-900">{store.category}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="font-mono text-slate-600 font-bold">{store.beatNo || 'Beat 1'}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-600">{store.colony}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="font-mono text-slate-500">PIN {store.pincode}</span>

                        {isFresh && (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Fresh Active (&lt;365d)
                          </span>
                        )}
                        {isStale && (
                          <span className="text-red-700 font-bold flex items-center gap-1">
                            <AlertTriangle size={12} /> Stale Excluded (&gt;365d)
                          </span>
                        )}
                        {needsRecheck && (
                          <span className="text-amber-700 font-bold flex items-center gap-1">
                            <Clock size={12} /> Needs Field Recheck
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-slate-900">{store.storeName}</h3>
                        {store.ownerName && (
                          <span className="text-xs text-slate-500">Proprietor: {store.ownerName}</span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-1">
                        {store.fullAddress || `${store.blockSector}, ${store.colony}, Kota - ${store.pincode}`}
                      </p>

                      {/* 4 Factors Check Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                        {/* Factor 1 */}
                        <div
                          className={`p-2 rounded-xl border flex items-center gap-1.5 ${
                            evalRes.factor1ActiveLicense
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-red-50 border-red-200 text-red-800'
                          }`}
                        >
                          {evalRes.factor1ActiveLicense ? <Check size={12} /> : <X size={12} />}
                          <span className="font-medium truncate">1. License/Trade Id</span>
                        </div>

                        {/* Factor 2 */}
                        <div
                          className={`p-2 rounded-xl border flex items-center gap-1.5 ${
                            evalRes.factor2GeospatialAccuracy
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-red-50 border-red-200 text-red-800'
                          }`}
                        >
                          {evalRes.factor2GeospatialAccuracy ? <Check size={12} /> : <X size={12} />}
                          <span className="font-medium truncate">2. PINcode Accuracy</span>
                        </div>

                        {/* Factor 3 */}
                        <div
                          className={`p-2 rounded-xl border flex items-center gap-1.5 ${
                            evalRes.factor3OperationalStatus
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-red-50 border-red-200 text-red-800'
                          }`}
                        >
                          {evalRes.factor3OperationalStatus ? <Check size={12} /> : <X size={12} />}
                          <span className="font-medium truncate">3. Open &amp; Operating</span>
                        </div>

                        {/* Factor 4 */}
                        <div
                          className={`p-2 rounded-xl border flex items-center gap-1.5 ${
                            evalRes.factor4DigitalFootprint
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-red-50 border-red-200 text-red-800'
                          }`}
                        >
                          {evalRes.factor4DigitalFootprint ? <Check size={12} /> : <X size={12} />}
                          <span className="font-medium truncate">4. Digital Footprint</span>
                        </div>
                      </div>

                      {/* Timestamps & AI Notes */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                        <span>
                          Listed: <strong className="font-mono">{daysSinceListed} days ago</strong>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Last Checked: <strong className="font-mono">{daysSinceChecked} days ago</strong>
                        </span>
                        {evalRes.fieldVerifiedByStaffName && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-700 font-medium">
                              Field verified by: {evalRes.fieldVerifiedByStaffName}
                            </span>
                          </>
                        )}
                      </div>

                      {/* AI Audit Verdict */}
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-1">
                        <strong>AI Audit Verdict:</strong> {evalRes.aiAuditNotes}
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-right">
                        <div className="text-xl font-black font-mono tabular-nums text-slate-900">
                          {evalRes.score} / 100
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium uppercase">Quality Score</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {store.primaryPhone && (
                          <a
                            href={`tel:${store.primaryPhone}`}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                            title="Call Store"
                          >
                            <Phone size={14} />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setReverifyStore(store);
                            setVerificationNotes('');
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                            isStale || needsRecheck
                              ? 'bg-red-700 hover:bg-red-800 text-white shadow-xs'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          <UserCheck size={14} />
                          <span>{isStale ? 'Reactivate in Field' : 'Field Re-Verify'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredStores.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
                <Store size={28} className="mx-auto text-slate-400" />
                <h3 className="text-sm font-bold text-slate-800">No matching commercial stores found</h3>
                <p className="text-xs text-slate-500">
                  Try clearing your search query or adjusting the freshness/beat filter.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PINCODE & BEAT-WISE PRODUCT-TO-CUSTOMER MATCHING ENGINE */}
      {activeTab === 'CUSTOMER_MATCHING' && (
        <div className="space-y-6">
          {/* Beat Selector & Pincode Manager Summary */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500">
                  Customer Demographic Matching Engine · PIN 324009
                </div>
                <h2 className="text-lg font-black text-slate-900">
                  Assigned Beat &amp; Pincode Manager Routing
                </h2>
              </div>

              {/* Beat & Sector Selectors */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <label htmlFor="matching-beat-select" className="text-xs font-bold text-slate-600">
                    Beat:
                  </label>
                  <select
                    id="matching-beat-select"
                    value={selectedBeatForMatching}
                    onChange={(e) => {
                      setSelectedBeatForMatching(e.target.value);
                      setMatchingSectorFilter('ALL');
                    }}
                    className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {Array.from({ length: 34 }, (_, i) => `Beat ${i + 1}`).map((b) => (
                      <option key={b} value={b}>
                        {b} (PIN 324009)
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  aria-label="Filter matched customers by sector"
                  value={matchingSectorFilter}
                  onChange={(e) => setMatchingSectorFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Sectors / Colonies</option>
                  {Array.from(
                    new Set(
                      matchingPlan.storeMatches.flatMap((s) =>
                        s.matchedCustomers.map((c) => `${c.sector || 'Sector 1'} · ${c.colony}`)
                      )
                    )
                  ).map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>

                {/* Bilingual Pitch Toggle */}
                <div className="flex items-center gap-1 bg-emerald-50 p-1 rounded-xl border border-emerald-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setPitchLanguage('hi')}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition ${
                      pitchLanguage === 'hi' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-900'
                    }`}
                  >
                    हिंदी Pitch
                  </button>
                  <button
                    type="button"
                    onClick={() => setPitchLanguage('en')}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition ${
                      pitchLanguage === 'en' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-900'
                    }`}
                  >
                    English Pitch
                  </button>
                </div>
              </div>
            </div>

            {/* Pincode Manager Card */}
            <div className="bg-gradient-to-r from-indigo-50 via-white to-emerald-50 border border-indigo-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-700 to-rose-700 text-white font-black flex items-center justify-center text-sm shrink-0 shadow-xs">
                  {matchingPlan.cleanBeatNo}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-indigo-700 uppercase">
                    Assigned Pincode Manager &amp; Beat Postman
                  </div>
                  <div className="text-sm font-black text-slate-900">
                    {matchingPlan.pincodeManagerName}
                  </div>
                  <div className="text-xs text-slate-600">
                    Staff ID: <span className="font-mono">{matchingPlan.pincodeManagerId}</span> · Official Desk:{' '}
                    <span className="font-mono font-bold text-emerald-700">8769706002 / 9460020640</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-700">
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-800 font-mono tabular-nums">
                    {matchingPlan.totalFreshStoresCount}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase">Fresh Verified Partners</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-indigo-800 font-mono tabular-nums">
                    {matchingPlan.totalMatchedCustomersCount}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase">Matched Households</div>
                </div>
              </div>
            </div>
          </div>

          {/* Matched Commercial Stores & Resident Lead Cards */}
          <div className="space-y-6">
            {matchingPlan.storeMatches.map((storeMatch) => (
              <div
                key={storeMatch.storeId}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-bold text-slate-700">{storeMatch.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>Verified Partner Listing</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mt-0.5">{storeMatch.storeName}</h3>
                  </div>

                  <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
                    {storeMatch.matchedCustomers.length} Matched Residents in Beat {matchingPlan.cleanBeatNo}
                  </span>
                </div>

                {/* Matched Resident Leads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {storeMatch.matchedCustomers
                    .filter(
                      (cust) =>
                        matchingSectorFilter === 'ALL' ||
                        `${cust.sector || 'Sector 1'} · ${cust.colony}` === matchingSectorFilter
                    )
                    .map((cust) => {
                      const leadKey = `${storeMatch.storeId}:${cust.customerId}`;
                      const ticketNo = pitchedLeadMap[leadKey];
                      return (
                        <div
                          key={cust.customerId}
                          className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:bg-slate-50 transition"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-black text-slate-900">{cust.customerName}</span>
                              <span className="text-[11px] font-mono font-bold text-emerald-700 tabular-nums">
                                {cust.matchScore}% Match
                              </span>
                            </div>
                            <div className="text-xs text-slate-600">
                              {cust.houseNo}, {cust.sector}, {cust.colony} (PIN {cust.pincode})
                            </div>
                            <div className="text-[11px] text-slate-500 italic bg-white p-2 rounded-xl border border-slate-200/80">
                              &ldquo;{cust.matchReason}&rdquo;
                            </div>
                            {ticketNo && (
                              <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 size={12} /> Lead Logged: <span className="font-mono">#{ticketNo}</span>
                              </div>
                            )}
                          </div>

                          {/* Lead Conversion Actions */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-200/60">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <a
                                href={buildPitchWhatsappUrl(cust)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => handleLogPitchLead(cust, storeMatch.storeId, storeMatch.storeName)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <MessageCircle size={12} />
                                <span>Pitch ({pitchLanguage === 'hi' ? 'हिंदी' : 'EN'})</span>
                              </a>
                              <a
                                href={buildPitchWhatsappUrl(cust, '918769706002')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-[10px] font-black"
                                title="Route copy to Beat 2 Official Desk (8769706002)"
                              >
                                B2
                              </a>
                              <a
                                href={buildPitchWhatsappUrl(cust, '919460020640')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-[10px] font-black"
                                title="Route copy to Dadabari S.O. Desk (9460020640)"
                              >
                                SO
                              </a>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleQuickConvertLeadToDispatch(storeMatch, cust)}
                              className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <Truck size={12} />
                              <span>Speed Post COD</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}

            {matchingPlan.storeMatches.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-2">
                <Store size={28} className="mx-auto text-slate-400" />
                <h3 className="text-sm font-bold text-slate-800">
                  No fresh verified stores available for Beat {matchingPlan.cleanBeatNo}
                </h3>
                <p className="text-xs text-slate-500">
                  All listings in this beat may be stale or unverified. Use the 4-Factor Engine tab to re-verify stores in this territory.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LOGISTICS DISPATCH & SPEED POST COD TRACKER */}
      {activeTab === 'LOGISTICS_DISPATCH' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xs">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Logistics Dispatch &amp; Speed Post COD Pipeline
              </h2>
              <p className="text-xs text-slate-500">
                Real-time tracking of merchant product dispatches delivered by Dadabari S.O. Postmen.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDispatchModal(true)}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Plus size={14} />
              <span>Book New Dispatch</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {dispatches.map((order) => {
              const isDelivered = order.status === 'DELIVERED';
              const isSettled = order.status === 'COD_SETTLED';
              const isOut = order.status === 'OUT_FOR_DELIVERY';

              return (
                <div
                  key={order.id}
                  className={`bg-white border rounded-2xl p-5 shadow-2xs hover:shadow-md transition ${
                    isSettled
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : isDelivered
                      ? 'border-sky-300 bg-sky-50/20'
                      : isOut
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-lg">
                          {order.speedPostBarcode}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="font-semibold text-slate-700">{order.serviceType}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="font-mono font-bold text-slate-800">{order.beatNo}</span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            isSettled
                              ? 'bg-emerald-600 text-white'
                              : isDelivered
                              ? 'bg-sky-600 text-white'
                              : isOut
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-slate-900">{order.productTitle}</h3>
                        <span className="text-xs text-slate-500 font-mono">({order.productSku})</span>
                      </div>

                      <p className="text-xs text-slate-600">
                        Merchant: <strong>{order.storeName}</strong> · Resident Customer:{' '}
                        <strong>{order.customerName}</strong> ({order.customerMobile})
                      </p>

                      <div className="text-xs text-slate-500">
                        Delivery Address: {order.deliveryAddress}
                      </div>

                      {/* IPPB Merchant QR Settlement Tracking Strip */}
                      {order.ippbQrSettlementRef && (
                        <div className="mt-1 inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-950 text-[11px] font-bold">
                          <CheckCircle2 size={13} className="text-emerald-700 shrink-0" />
                          <span>IPPB Merchant QR Settled:</span>
                          <span className="font-mono font-black">{order.ippbQrSettlementRef}</span>
                          {order.ippbQrSettledAt && (
                            <span className="text-[10px] text-emerald-800 font-mono">
                              ({new Date(order.ippbQrSettledAt).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                      )}

                      {order.remarks && (
                        <div className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-xl border border-slate-200">
                          Note: {order.remarks}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-right">
                        <div className="text-xl font-black font-mono tabular-nums text-slate-900">
                          ₹{order.codAmount}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium uppercase">
                          COD / IPPB QR Amount
                        </div>
                      </div>

                      {/* Status Update Dropdown */}
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateStatus(order.id, e.target.value as LogisticsDispatchOrder['status'])
                        }
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="PENDING_PICKUP">Pending Pickup</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered (POD Confirmed)</option>
                        <option value="COD_SETTLED">COD Settled via IPPB</option>
                        <option value="CANCELLED">Cancelled / Rescheduled</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}

            {dispatches.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
                <Truck size={28} className="mx-auto text-slate-400" />
                <h3 className="text-sm font-bold text-slate-800">No active dispatches</h3>
                <p className="text-xs text-slate-500">
                  Book your first Speed Post COD order to start tracking delivery status.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RE-VERIFICATION MODAL */}
      {reverifyStore && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-red-700 uppercase tracking-wide">
                <UserCheck size={16} /> Beat Postman Physical Re-Verification
              </div>
              <button
                type="button"
                onClick={() => setReverifyStore(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">{reverifyStore.storeName}</h3>
              <p className="text-xs text-slate-600 mt-1">
                {reverifyStore.fullAddress || `${reverifyStore.blockSector}, ${reverifyStore.colony}`}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-slate-900">4-Factor Verification Affirmation:</div>
              <div className="space-y-1 text-[11px]">
                <div>✓ Physical premise open and operational on {reverifyStore.beatNo || 'Beat Territory'}</div>
                <div>✓ Verified trade line &amp; proprietor presence in person</div>
                <div>✓ Confirms agreement for India Post doorstep Speed Post delivery &amp; COD collection</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="field-verification-notes" className="text-xs font-bold text-slate-700">
                Postman Physical Observation Notes:
              </label>
              <textarea
                id="field-verification-notes"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="e.g. Visited store on Sector 4 main market. Proprietor active, stocks verified, confirmed partnership."
                rows={3}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReverifyStore(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isReverifying}
                onClick={handleConfirmReverify}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>Confirm Field Re-Verification</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW SPEED POST COD DISPATCH MODAL */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateDispatch}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
                <Truck size={16} className="text-red-700" /> Book Speed Post COD Dispatch
              </div>
              <button
                type="button"
                onClick={() => setShowDispatchModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Commercial Store Partner:</label>
                <input
                  type="text"
                  value={dispatchForm.storeName}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, storeName: e.target.value })}
                  placeholder="e.g. Agarwal Departmental Store"
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Description:</label>
                <input
                  type="text"
                  value={dispatchForm.productTitle}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, productTitle: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">COD Price (₹):</label>
                  <input
                    type="number"
                    value={dispatchForm.productPrice}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, productPrice: Number(e.target.value) })
                    }
                    required
                    min={0}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Beat Assignment:</label>
                  <select
                    value={dispatchForm.beatNo}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, beatNo: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {Array.from({ length: 34 }, (_, i) => `Beat ${i + 1}`).map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Name:</label>
                  <input
                    type="text"
                    value={dispatchForm.customerName}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, customerName: e.target.value })}
                    placeholder="Resident Name"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Mobile:</label>
                  <input
                    type="tel"
                    value={dispatchForm.customerMobile}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, customerMobile: e.target.value })}
                    placeholder="10-digit Mobile"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Delivery Address in Beat:</label>
                <textarea
                  value={dispatchForm.deliveryAddress}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, deliveryAddress: e.target.value })}
                  rows={2}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDispatchModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Truck size={14} />
                <span>Confirm &amp; Generate Barcode</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
