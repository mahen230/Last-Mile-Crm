import React, { useState, useEffect, useMemo } from 'react';
import {
  Store,
  Search,
  CheckCircle2,
  MessageCircle,
  ShoppingBag,
  Info,
  MapPin,
  UserCheck,
  X,
  ArrowRight,
  Truck,
  Landmark,
  FileText,
  GraduationCap,
  Package,
  ShieldCheck,
} from 'lucide-react';
import {
  CommercialStoreRecord,
  FourFactorVerificationResult,
  StaffProductItem,
  StaffProductVertical,
} from '../types/models';
import {
  staffProductService,
  ALL_PRODUCT_VERTICALS,
  DEFAULT_VERTICAL_THUMBNAILS,
} from '../services/staffProductService';
import { customerService } from '../services/customerService';
import { aiCommercialVerificationService } from '../services/aiCommercialVerificationService';
import { commercialPropertyService } from '../services/commercialPropertyService';

const VERTICAL_META: Record<
  StaffProductVertical,
  {
    badge: string;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    headerGradient: string;
    cardBorder: string;
    chipClass: string;
    buttonClass: string;
  }
> = {
  'Logistics & Courier Services': {
    badge: 'VERTICAL 01 · LOGISTICS & COURIER',
    title: 'Logistics & Courier Services',
    subtitle: 'Priority Speed Post, business parcel pickup, e-commerce COD dispatch, and insured delivery across India.',
    icon: Truck,
    headerGradient: 'bg-gradient-to-r from-rose-700 via-red-700 to-orange-600 text-white shadow-lg shadow-rose-900/15',
    cardBorder: 'border-rose-200 hover:border-rose-400',
    chipClass: 'bg-rose-50 text-rose-800 border-rose-200',
    buttonClass: 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white',
  },
  'Banking & Finance': {
    badge: 'VERTICAL 02 · BANKING & FINANCE SERVICES',
    title: 'Banking & Finance Services',
    subtitle: 'IPPB doorstep digital accounts, Merchant UPI QR kit, Aadhaar ATM (AePS) cash delivery, and sovereign savings.',
    icon: Landmark,
    headerGradient: 'bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 text-white shadow-lg shadow-emerald-900/15',
    cardBorder: 'border-emerald-200 hover:border-emerald-400',
    chipClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    buttonClass: 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white',
  },
  'Documents & Digital Services': {
    badge: 'VERTICAL 03 · DOCUMENTS, MY STAMP & DIGITAL SERVICES',
    title: 'Documents, My Stamp & Digital Services',
    subtitle: 'Personalized My Stamp sheets, Child Aadhaar CELC at home, and Jeevan Pramaan biometric life certificates.',
    icon: FileText,
    headerGradient: 'bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-700 text-white shadow-lg shadow-sky-900/15',
    cardBorder: 'border-sky-200 hover:border-sky-400',
    chipClass: 'bg-sky-50 text-sky-800 border-sky-200',
    buttonClass: 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white',
  },
  'Course & Skill Academy': {
    badge: 'VERTICAL 04 · COURSE & SKILL ACADEMY',
    title: 'Course & Skill Academy',
    subtitle: 'Postal LDCE / Inspector / PA exam prep, skill masterclasses, and digital test series.',
    icon: GraduationCap,
    headerGradient: 'bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700 text-white shadow-lg shadow-indigo-900/15',
    cardBorder: 'border-indigo-200 hover:border-indigo-400',
    chipClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    buttonClass: 'bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white',
  },
  'Custom Staff / Partner Products': {
    badge: 'VERTICAL 05 · GANGAJAL, KOTA DORIA & LOCAL PARTNERS',
    title: 'Partner Merchandise, Gangajal & Local Artisans',
    subtitle: 'Official Gangajal 250ml bottles, authentic Kota Doria handloom, and verified local partner deliveries by Postman.',
    icon: Package,
    headerGradient: 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-lg shadow-amber-900/15',
    cardBorder: 'border-amber-200 hover:border-amber-400',
    chipClass: 'bg-amber-50 text-amber-900 border-amber-200',
    buttonClass: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white',
  },
};

export default function PublicStorefrontSection() {
  const [partnerFilterId, setPartnerFilterId] = useState<string | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    const params = new URLSearchParams(window.location.search);
    return params.get('partner') || undefined;
  });

  const [storeProducts, setStoreProducts] = useState<StaffProductItem[]>(() =>
    staffProductService.getPublicCatalog(partnerFilterId)
  );
  const [freshCommercialState, setFreshCommercialState] = useState(() =>
    aiCommercialVerificationService.getFreshActiveStoresForPublic()
  );

  const [selectedVertical, setSelectedVertical] = useState<'ALL' | StaffProductVertical>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [pitchLang, setPitchLang] = useState<'EN' | 'HI'>('HI');
  const [waDeskLine, setWaDeskLine] = useState<'PARTNER' | 'BEAT2' | 'DESK'>('PARTNER');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Modals
  const [detailProduct, setDetailProduct] = useState<StaffProductItem | null>(null);
  const [inquiryProduct, setInquiryProduct] = useState<StaffProductItem | null>(null);
  const [inquiryMode, setInquiryMode] = useState<'QUICK_INQUIRY' | 'BUY_NOW'>('QUICK_INQUIRY');

  // Lead Capture Form
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custAddress, setCustAddress] = useState('Dadabari / Kota (PIN 324009)');
  const [custNotes, setCustNotes] = useState('');
  const [formErr, setFormErr] = useState<string | null>(null);
  const [submittedConfirmation, setSubmittedConfirmation] = useState<{
    ticket: string;
    speedPostBarcode?: string;
    product: StaffProductItem;
    name: string;
  } | null>(null);

  useEffect(() => {
    const refresh = () => {
      setStoreProducts(staffProductService.getPublicCatalog(partnerFilterId));
      setFreshCommercialState(aiCommercialVerificationService.getFreshActiveStoresForPublic());
    };
    refresh();
    const unsubProd = staffProductService.subscribe(refresh);
    const unsubComm = commercialPropertyService.subscribe(refresh);
    return () => {
      unsubProd();
      unsubComm();
    };
  }, [partnerFilterId]);

  const filteredStoreProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return storeProducts.filter((item) => {
      // Strict 1-Year Freshness Rule: Exclude stale items
      if (item.freshnessStatus === 'STALE_EXCLUDED') {
        return false;
      }
      const matchesVertical = selectedVertical === 'ALL' || item.vertical === selectedVertical;
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.staffName.toLowerCase().includes(q);
      return matchesVertical && matchesSearch;
    });
  }, [storeProducts, selectedVertical, searchQuery]);

  // Verified local merchants in Dadabari S.O. (FRESH_ACTIVE only)
  const filteredVerifiedStores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return freshCommercialState.freshStores
      .filter((s) => {
        if (!q) return true;
        return (
          s.storeName.toLowerCase().includes(q) ||
          s.colony.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.beatNo.toLowerCase().includes(q)
        );
      })
      .slice(0, 6);
  }, [freshCommercialState.freshStores, searchQuery]);

  const resolveTargetWhatsapp = (partnerNumber?: string) => {
    if (waDeskLine === 'BEAT2') return '918769706002';
    if (waDeskLine === 'DESK') return '919460020640';
    return partnerNumber || '918769706002';
  };

  const buildWhatsappHref = (item: StaffProductItem, actionLabel = 'WhatsApp Partner Pitching') => {
    const targetPhone = resolveTargetWhatsapp(item.whatsappNumber);
    const priceLabel = item.price === 0 ? 'FREE / Zero Fee' : `₹${item.price}`;
    const msg =
      pitchLang === 'HI'
        ? `नमस्ते ${item.staffName},\n` +
          `Xpeedo Last Mile (दादाबाड़ी S.O. · PIN ${item.pincode || '324009'}) स्टोरफ्रंट से संपर्क:\n\n` +
          `📦 उत्पाद / सेवा: ${item.title}\n` +
          `🔖 कोड (SKU): ${item.sku}\n` +
          `💰 शुल्क / मूल्य: ${priceLabel} (Speed Post COD & IPPB QR उपलब्ध)\n` +
          `📍 बीट क्षेत्र: ${item.beatNumber || 'Beat 2 · Dadabari S.O.'}\n` +
          `कृपया डोरस्टेप बुकिंग और जानकारी साझा करें। (${actionLabel})`
        : `Namaste ${item.staffName},\n` +
          `I want to connect via Xpeedo Last Mile (*${actionLabel}*):\n\n` +
          `Product / Service: ${item.title}\n` +
          `SKU: ${item.sku}\n` +
          `Price: ${priceLabel} (Speed Post COD & IPPB QR Supported)\n` +
          `Beat / Territory: ${item.beatNumber || 'Dadabari S.O.'} (PIN ${item.pincode || '324009'})`;
    return `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(msg)}`;
  };

  const openInquiry = (item: StaffProductItem, mode: 'QUICK_INQUIRY' | 'BUY_NOW') => {
    setFormErr(null);
    setSubmittedConfirmation(null);
    setInquiryMode(mode);
    setInquiryProduct(item);
  };

  // Convert a Verified Commercial Store into a quick-orderable StaffProductItem routed to its assigned Beat Postman
  const openCommercialStoreOrder = (
    store: CommercialStoreRecord & { evaluation: FourFactorVerificationResult },
    mode: 'QUICK_INQUIRY' | 'BUY_NOW'
  ) => {
    const beatMeta = commercialPropertyService.getBeatMeta(store.beatNo || 'Beat 1');
    const waDigits = beatMeta.staffContact.replace(/\D/g, '').slice(-10);
    const virtualProduct: StaffProductItem = {
      id: `COMM-PROD-${store.id}`,
      sku: `XPD-${store.category.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4)}-${store.cleanBeatNo}`,
      title: `${store.storeName} · Doorstep Order & Delivery`,
      vertical: 'Custom Staff / Partner Products',
      pricingModel: 'Fixed Price',
      productType: store.category === 'eMitra/CSC' || store.category === 'Services' ? 'Service' : 'Physical Item',
      price: store.category === 'eMitra/CSC' ? 100 : 499,
      description: `${store.storeName} (${store.fullAddress || `${store.blockSector}, ${store.colony}`}). 4-Factor Verified commercial partner delivered via ${beatMeta.staffName} (${beatMeta.beatNo}).`,
      features: [
        '4-Factor Verified Local Merchant',
        `Same-Day Speed Post COD by ${beatMeta.staffName}`,
        `Direct Beat Dispatch (${beatMeta.beatNo} · PIN ${store.pincode})`,
      ],
      thumbnailUrl: DEFAULT_VERTICAL_THUMBNAILS['Custom Staff / Partner Products'],
      staffId: beatMeta.staffId,
      staffName: `${beatMeta.staffName} (Beat Postman)`,
      staffMobile: beatMeta.staffContact,
      whatsappNumber: `91${waDigits || '8769706002'}`,
      beatNumber: beatMeta.beatNo,
      subOffice: beatMeta.subOffice,
      pincode: store.pincode,
      status: 'ACTIVE',
      freshnessStatus: 'FRESH_ACTIVE',
      commercialStoreId: store.id,
      logisticsServiceType: 'Speed Post COD',
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    };
    openInquiry(virtualProduct, mode);
  };

  const buildCommercialStoreWhatsappHref = (
    store: CommercialStoreRecord & { evaluation: FourFactorVerificationResult }
  ) => {
    const beatMeta = commercialPropertyService.getBeatMeta(store.beatNo || 'Beat 1');
    const waDigits = beatMeta.staffContact.replace(/\D/g, '').slice(-10);
    const targetPhone = resolveTargetWhatsapp(`91${waDigits || '8769706002'}`);
    const msg =
      pitchLang === 'HI'
        ? `नमस्ते ${beatMeta.staffName} (Xpeedo Beat Delivery Partner),\n` +
          `मैं *${store.storeName}* (${store.colony}, PIN ${store.pincode}) से India Post Speed Post COD के माध्यम से ऑर्डर / जानकारी चाहता हूँ।\n` +
          `📍 बीट: ${beatMeta.beatNo} | ✅ 4-Factor Score: ${store.evaluation.score}/100 | 💳 IPPB QR Payment`
        : `Namaste ${beatMeta.staffName} (Xpeedo Beat Delivery Partner),\n` +
          `I want to order/inquire from *${store.storeName}* (${store.colony}, PIN ${store.pincode}) via India Post Speed Post COD & IPPB QR.\n` +
          `Beat: ${beatMeta.beatNo} | Verification Score: ${store.evaluation.score}/100`;
    return `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(msg)}`;
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryProduct) return;
    setFormErr(null);

    const digits = custMobile.replace(/\D/g, '').slice(-10);
    if (custName.trim().length < 2) {
      setFormErr('Please enter your full name.');
      return;
    }
    if (digits.length !== 10) {
      setFormErr('Please enter a valid 10-digit mobile number.');
      return;
    }

    const assignedBeat =
      inquiryProduct.beatNumber && inquiryProduct.beatNumber !== 'All Beats'
        ? inquiryProduct.beatNumber
        : 'Beat 1';

    const { inquiry } = customerService.submitCustomerInquiry({
      customerName: custName.trim(),
      mobile: digits,
      productInterested: `${inquiryProduct.title} (${inquiryProduct.sku})`,
      requirement: `[${inquiryMode === 'BUY_NOW' ? 'SPEED POST COD ORDER' : 'STOREFRONT INQUIRY'}] Partner: ${inquiryProduct.staffName} (${inquiryProduct.staffId}) | ${custNotes.trim() || 'Requested doorstep fulfillment'}`,
      preferredContact: 'WhatsApp',
      address: custAddress.trim() || 'Dadabari S.O. 324009',
      beatNo: assignedBeat,
    });

    // Book live Xpeedo Speed Post / Local Parcel dispatch when ordering
    let speedPostBarcode: string | undefined;
    if (inquiryMode === 'BUY_NOW' || inquiryProduct.productType === 'Physical Item') {
      const dispatch = aiCommercialVerificationService.createLogisticsDispatch({
        storeId: inquiryProduct.commercialStoreId || inquiryProduct.staffId,
        storeName: inquiryProduct.title,
        productId: inquiryProduct.id,
        productTitle: inquiryProduct.title,
        productSku: inquiryProduct.sku,
        productPrice: inquiryProduct.price,
        customerName: custName.trim(),
        customerMobile: digits,
        deliveryAddress: custAddress.trim() || 'Dadabari S.O. 324009',
        colony: 'Dadabari',
        pincode: inquiryProduct.pincode || '324009',
        beatNo: assignedBeat,
        pincodeManagerId: inquiryProduct.staffId,
        pincodeManagerName: inquiryProduct.staffName,
        pincodeManagerContact: inquiryProduct.staffMobile,
        serviceType: inquiryProduct.logisticsServiceType || 'Speed Post COD',
        status: 'PENDING_PICKUP',
        codAmount: inquiryProduct.price,
        remarks: `Lead Ref #${inquiry.ticketNumber} · ${custNotes.trim() || 'Booked via Public Citizen Storefront'}`,
      });
      speedPostBarcode = dispatch.speedPostBarcode;
    }

    setSubmittedConfirmation({
      ticket: inquiry.ticketNumber,
      speedPostBarcode,
      product: inquiryProduct,
      name: custName.trim(),
    });
    setCustNotes('');
  };

  return (
    <section className="space-y-6 pt-4" id="multi-vertical-storefront-section">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-red-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
            Xpeedo Last Mile · Multi-Vertical Partner Storefront · PIN 324009
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ textWrap: 'balance' }}>
            Doorstep Logistics, Banking, Digital Docs &amp; Verified Partner Marketplace
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Order directly from 4-Factor Verified Dadabari S.O. delivery partners &amp; postal staff with instant Speed Post COD booking and WhatsApp partner support.
          </p>
          {partnerFilterId && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold mt-1">
              <UserCheck size={14} />
              <span>Viewing Partner Catalog: {partnerFilterId}</span>
              <button
                type="button"
                onClick={() => setPartnerFilterId(undefined)}
                className="underline text-amber-300 hover:text-white ml-1 cursor-pointer"
              >
                Show All Partners
              </button>
            </div>
          )}
        </div>

        {/* Storefront Search */}
        <div className="relative w-full lg:w-80 shrink-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Courier, Aadhaar, Stores, Partner..."
            className="w-full pl-10 pr-14 py-3 bg-white/10 border border-white/20 rounded-2xl text-xs sm:text-sm text-white placeholder:text-slate-300 focus:bg-white focus:text-slate-900 focus:outline-none transition"
            id="storefront-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-300 hover:text-amber-500 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Filter & Bilingual Pitch Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-black text-slate-700 uppercase tracking-wider text-[11px]">WhatsApp Routing:</span>
            <button
              type="button"
              onClick={() => setWaDeskLine('PARTNER')}
              className={`px-2.5 py-1 rounded-lg font-bold border transition cursor-pointer whitespace-nowrap ${
                waDeskLine === 'PARTNER'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Assigned Beat Partner
            </button>
            <button
              type="button"
              onClick={() => setWaDeskLine('BEAT2')}
              className={`px-2.5 py-1 rounded-lg font-bold border transition cursor-pointer whitespace-nowrap font-mono ${
                waDeskLine === 'BEAT2'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Beat 2 · 8769706002
            </button>
            <button
              type="button"
              onClick={() => setWaDeskLine('DESK')}
              className={`px-2.5 py-1 rounded-lg font-bold border transition cursor-pointer whitespace-nowrap font-mono ${
                waDeskLine === 'DESK'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Dadabari S.O. Desk · 9460020640
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Pitch Language:</span>
            <button
              type="button"
              onClick={() => setPitchLang('HI')}
              className={`px-2.5 py-1 rounded-lg font-bold border cursor-pointer transition ${
                pitchLang === 'HI'
                  ? 'bg-indigo-700 text-white border-indigo-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              हिंदी Pitch
            </button>
            <button
              type="button"
              onClick={() => setPitchLang('EN')}
              className={`px-2.5 py-1 rounded-lg font-bold border cursor-pointer transition ${
                pitchLang === 'EN'
                  ? 'bg-indigo-700 text-white border-indigo-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              English Pitch
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedVertical('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer border ${
              selectedVertical === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Storefront Verticals ({storeProducts.length})
          </button>
          {ALL_PRODUCT_VERTICALS.map((vert) => {
            const count = storeProducts.filter((p) => p.vertical === vert).length;
            return (
              <button
                key={vert}
                type="button"
                onClick={() => setSelectedVertical(vert)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer border ${
                  selectedVertical === vert
                    ? 'bg-gradient-to-r from-red-700 to-rose-700 text-white border-red-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {vert} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Categorized Storefront Grid */}
      <div className="space-y-10">
        {ALL_PRODUCT_VERTICALS.filter((v) => selectedVertical === 'ALL' || selectedVertical === v).map((vert) => {
          const items = filteredStoreProducts.filter((p) => p.vertical === vert);
          if (items.length === 0) return null;
          const meta = VERTICAL_META[vert];
          const VerticalIcon = meta.icon;

          return (
            <div key={vert} className="space-y-4">
              {/* Vertical Section Header */}
              <div className={`rounded-3xl px-6 py-5 flex flex-wrap items-center justify-between gap-3 ${meta.headerGradient}`}>
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-white/15 border border-white/25 text-white shrink-0 mt-0.5 backdrop-blur-xs">
                    <VerticalIcon size={22} />
                  </div>
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-wider text-amber-200">
                      {meta.badge}
                    </div>
                    <h3 className="text-base sm:text-xl font-black text-white">{meta.title}</h3>
                    <p className="text-xs text-white/90 mt-0.5 max-w-2xl">{meta.subtitle}</p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-xl bg-white/15 border border-white/25 text-xs font-black text-white shrink-0 tabular-nums backdrop-blur-xs">
                  {items.length} {items.length === 1 ? 'Offering' : 'Offerings'}
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => {
                  const hasImgError = imgErrors[item.id];
                  const fallbackSrc = DEFAULT_VERTICAL_THUMBNAILS[item.vertical];

                  return (
                    <article
                      key={item.id}
                      className={`bg-white rounded-3xl border-2 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition duration-200 flex flex-col justify-between ${
                        item.status === 'FEATURED' ? 'border-amber-400 shadow-amber-500/10' : meta.cardBorder
                      }`}
                    >
                      <div>
                        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                          {!hasImgError ? (
                            <img
                              src={item.thumbnailUrl || fallbackSrc}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              onError={() => setImgErrors((prev) => ({ ...prev, [item.id]: true }))}
                              className="w-full h-full object-cover hover:scale-105 transition duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center p-4 text-center text-white">
                              <VerticalIcon size={28} className="text-amber-300 mb-2" />
                              <div className="text-xs font-bold">{item.title}</div>
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/65 to-transparent pointer-events-none" />
                          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2 text-white">
                            <span className="text-[11px] font-bold tracking-wide uppercase">
                              {item.productType}
                              {item.status === 'FEATURED' ? ' · Featured' : ''}
                            </span>
                            <span className="font-mono font-black text-sm tabular-nums bg-slate-950/85 px-2.5 py-1 rounded-lg">
                              {item.price === 0 ? 'FREE' : `₹${item.price}`}
                            </span>
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-mono font-bold text-slate-700">{item.sku}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-slate-700">{item.pricingModel}</span>
                          </div>

                          <h4 className="text-base font-black text-slate-900 leading-snug">{item.title}</h4>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{item.description}</p>

                          <div className="space-y-1 pt-2 border-t border-slate-100">
                            {item.features.slice(0, 3).map((feat, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700">
                                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                <span className="truncate">{feat}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-100">
                            <span className="truncate font-semibold text-slate-800">
                              Partner: {item.staffName}
                            </span>
                            <span className="inline-flex items-center gap-1 text-red-700 font-bold shrink-0">
                              <MapPin size={11} />
                              {item.beatNumber || 'Dadabari S.O.'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold">
                            <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                            <span>4-Factor Verified · Beat Postman Guarantee</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: Know More / Buy & Book / WhatsApp Partner Pitching */}
                      <div className="p-4 bg-slate-50/90 border-t border-slate-100 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailProduct(item)}
                            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <Info size={13} className="text-amber-300" />
                            <span>Know More</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openInquiry(item, item.price > 0 ? 'BUY_NOW' : 'QUICK_INQUIRY')}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs ${meta.buttonClass}`}
                          >
                            <ShoppingBag size={13} />
                            <span>{item.price > 0 ? 'Book Speed Post' : 'Quick Inquiry'}</span>
                          </button>
                        </div>
                        <a
                          href={buildWhatsappHref(item, 'WhatsApp Partner Pitching')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                          <MessageCircle size={14} className="text-emerald-600" />
                          <span>WhatsApp Partner Pitching ({item.staffName.split(' ')[0]})</span>
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Verified Local Commercial Partner Stores (4-Factor Freshness Cleared Only) */}
        {selectedVertical === 'ALL' && filteredVerifiedStores.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-red-700 shrink-0 mt-0.5">
                  <Store size={20} />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-red-700">
                    4-FACTOR VERIFIED NEIGHBORHOOD MERCHANTS · PIN 324009
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Active Beat Partner Stores (Delivered via Speed Post COD)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Every merchant listed below passed our 4-Factor operational &amp; 365-day freshness check. Stale or unverified businesses are automatically excluded.
                  </p>
                </div>
              </div>
              <div className="text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shrink-0 tabular-nums">
                {freshCommercialState.freshStores.length} Active Partners · {freshCommercialState.staleExcludedCount} Stale Excluded
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVerifiedStores.map((store) => {
                const beatMeta = commercialPropertyService.getBeatMeta(store.beatNo || 'Beat 1');
                return (
                  <article
                    key={store.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-slate-800">{store.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-emerald-700 font-bold tabular-nums">
                          {store.evaluation.score}/100 Verified
                        </span>
                      </div>

                      <h4 className="text-base font-black text-slate-900 leading-snug">
                        {store.storeName}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {store.fullAddress || `${store.blockSector}, ${store.colony}, Kota - ${store.pincode}`}
                      </p>

                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Assigned Beat Delivery:</span>
                          <strong className="text-slate-900">{beatMeta.staffName}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Territory / PIN:</span>
                          <strong className="text-red-700 font-mono">
                            {beatMeta.beatNo} · {store.pincode}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => openCommercialStoreOrder(store, 'BUY_NOW')}
                        className="w-full py-2 px-3 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Truck size={14} />
                        <span>Order via Speed Post COD</span>
                      </button>
                      <a
                        href={buildCommercialStoreWhatsappHref(store)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle size={14} className="text-emerald-600" />
                        <span>WhatsApp Partner Pitching ({beatMeta.staffName.split(' ')[0]})</span>
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {filteredStoreProducts.length === 0 && filteredVerifiedStores.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-2">
            <Store size={28} className="mx-auto text-slate-400" />
            <div className="text-sm font-black text-slate-900">No storefront offerings match your search</div>
            <p className="text-xs text-slate-500">Try clearing the search bar or switching to "All Storefront Verticals".</p>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {detailProduct && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            <div className="relative h-56 bg-slate-900">
              <img
                src={detailProduct.thumbnailUrl || DEFAULT_VERTICAL_THUMBNAILS[detailProduct.vertical]}
                alt={detailProduct.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
              <button
                type="button"
                onClick={() => setDetailProduct(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold text-amber-300 uppercase">
                    {detailProduct.vertical}
                  </div>
                  <h3 className="text-xl font-black text-white mt-1 drop-shadow">
                    {detailProduct.title}
                  </h3>
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-white text-slate-950 font-mono font-black text-base shadow-lg shrink-0 tabular-nums">
                  {detailProduct.price === 0 ? 'FREE' : `₹${detailProduct.price}`}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="font-mono font-bold text-slate-800">SKU: {detailProduct.sku}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {detailProduct.productType} · {detailProduct.pricingModel}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-emerald-700">
                  Assigned Partner: {detailProduct.staffName} ({detailProduct.beatNumber || 'Dadabari S.O.'})
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{detailProduct.description}</p>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2">
                <div className="text-xs font-black text-slate-900 uppercase">Key Highlights &amp; Inclusions</div>
                {detailProduct.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = detailProduct;
                    setDetailProduct(null);
                    openInquiry(target, target.price > 0 ? 'BUY_NOW' : 'QUICK_INQUIRY');
                  }}
                  className="flex-1 py-3 px-4 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <ShoppingBag size={15} />
                  <span>{detailProduct.price > 0 ? 'Book Speed Post COD' : 'Request Doorstep Service'}</span>
                </button>
                <a
                  href={buildWhatsappHref(detailProduct, 'WhatsApp Partner Pitching')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp Partner Pitching</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Inquiry / Buy Now Modal */}
      {inquiryProduct && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-red-900 to-slate-950 text-white flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-amber-300 uppercase">
                  {inquiryMode === 'BUY_NOW' ? 'Speed Post COD Order & Dispatch' : 'Quick Storefront Inquiry'}
                </div>
                <h3 className="text-base font-black mt-0.5">{inquiryProduct.title}</h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Assigned Partner: {inquiryProduct.staffName} • {inquiryProduct.price === 0 ? 'FREE' : `₹${inquiryProduct.price} (COD Supported)`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInquiryProduct(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {submittedConfirmation ? (
              <div className="p-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={26} />
                </div>
                <h4 className="text-base font-black text-slate-900">
                  Order Confirmed! Ref #{submittedConfirmation.ticket}
                </h4>
                {submittedConfirmation.speedPostBarcode && (
                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                      <div className="text-[11px] font-bold text-amber-800 uppercase">Speed Post Tracking Barcode</div>
                      <div className="font-mono font-black text-red-700 text-sm mt-0.5">
                        {submittedConfirmation.speedPostBarcode}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                      <span className="font-bold text-emerald-900">IPPB Merchant QR Collection</span>
                      <span className="font-mono font-black text-emerald-700">IPPB-QR-324009</span>
                    </div>
                  </div>
                )}
                <p className="text-xs text-slate-600">
                  Thank you, <strong>{submittedConfirmation.name}</strong>. Your request for{' '}
                  <strong>{submittedConfirmation.product.title}</strong> is assigned to{' '}
                  <strong>{submittedConfirmation.product.staffName}</strong> for doorstep dispatch.
                </p>
                <a
                  href={buildWhatsappHref(
                    submittedConfirmation.product,
                    `Order Ref #${submittedConfirmation.ticket}${submittedConfirmation.speedPostBarcode ? ` (${submittedConfirmation.speedPostBarcode})` : ''}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle size={15} />
                  <span>Send Order Receipt on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setInquiryProduct(null)}
                  className="w-full py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="p-5 space-y-3.5">
                {formErr && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                    {formErr}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">10-Digit Mobile / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={custMobile}
                    onChange={(e) => setCustMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="e.g. 9829012345"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Address / Colony / PIN</label>
                  <input
                    type="text"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Note / Quantity (Optional)</label>
                  <input
                    type="text"
                    value={custNotes}
                    onChange={(e) => setCustNotes(e.target.value)}
                    placeholder="e.g. Need doorstep delivery after 4 PM..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    {inquiryMode === 'BUY_NOW'
                      ? 'Confirm COD Order & Generate Barcode'
                      : 'Submit Inquiry to Beat Partner'}
                  </span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
