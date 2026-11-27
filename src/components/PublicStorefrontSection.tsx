import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Building2,
} from 'lucide-react';
import {
  CommercialStoreRecord,
  FourFactorVerificationResult,
  StaffProductItem,
  StaffProductVertical,
  StoreEntityType,
} from '../types/models';
import {
  staffProductService,
  ALL_PRODUCT_VERTICALS,
  DEFAULT_VERTICAL_THUMBNAILS,
} from '../services/staffProductService';
import { customerService } from '../services/customerService';
import { aiCommercialVerificationService } from '../services/aiCommercialVerificationService';
import {
  commercialPropertyService,
} from '../services/commercialPropertyService';
import {
  PINCODE_OFFICE_HUBS,
  getPincodeHub,
  pincodeOperationsService,
} from '../services/pincodeOperationsService';
import { resolveBrandSlug } from '../services/brandDirectoryService';
import DynamicProductPageView from './common/DynamicProductPageView';

export interface StorefrontCartPayload {
  id: string;
  sku: string;
  title: string;
  price: number;
  imageSrc?: string;
  vendorName: string;
  beatNo?: string;
}

export interface PublicStorefrontSectionProps {
  externalVerticalFilter?: 'ALL' | StaffProductVertical;
  externalSearchQuery?: string;
  hideFilterHeader?: boolean;
  focusSectionTitle?: string;
  activePincode?: string;
  onAddToCart?: (item: StorefrontCartPayload) => void;
  excludePostOfficeItems?: boolean;
}

const VERTICAL_META: Record<
  StaffProductVertical,
  {
    badge: string;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    headerGradient: string;
    cardBorder: string;
    buttonClass: string;
  }
> = {
  'Logistics & Courier Services': {
    badge: 'VERTICAL 01 · LOGISTICS & COURIER',
    title: 'Logistics & Courier Services',
    subtitle:
      'Priority Speed Post, business parcel pickup, e-commerce COD dispatch, and insured delivery across India.',
    icon: Truck,
    headerGradient: 'bg-gradient-to-r from-rose-800 via-red-700 to-orange-700 text-white shadow-lg',
    cardBorder: 'border-slate-200 hover:border-rose-300',
    buttonClass: 'bg-red-700 hover:bg-red-800 text-white',
  },
  'Banking & Finance': {
    badge: 'VERTICAL 02 · BANKING & FINANCE SERVICES',
    title: 'Banking & Finance Services',
    subtitle:
      'IPPB doorstep digital accounts, Merchant UPI QR kit, Aadhaar ATM (AePS) cash delivery, and sovereign savings.',
    icon: Landmark,
    headerGradient: 'bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 text-white shadow-lg',
    cardBorder: 'border-slate-200 hover:border-emerald-300',
    buttonClass: 'bg-emerald-700 hover:bg-emerald-800 text-white',
  },
  'Documents & Digital Services': {
    badge: 'VERTICAL 03 · DOCUMENTS, MY STAMP & DIGITAL SERVICES',
    title: 'Documents, My Stamp & Digital Services',
    subtitle:
      'Personalized My Stamp sheets, Child Aadhaar CELC at home, and Jeevan Pramaan biometric life certificates.',
    icon: FileText,
    headerGradient: 'bg-gradient-to-r from-sky-800 via-blue-700 to-indigo-800 text-white shadow-lg',
    cardBorder: 'border-slate-200 hover:border-sky-300',
    buttonClass: 'bg-blue-700 hover:bg-blue-800 text-white',
  },
  'Course & Skill Academy': {
    badge: 'VERTICAL 04 · COURSE & SKILL ACADEMY',
    title: 'Course & Skill Academy',
    subtitle: 'Postal LDCE / Inspector / PA exam prep, skill masterclasses, and digital test series.',
    icon: GraduationCap,
    headerGradient: 'bg-gradient-to-r from-indigo-800 via-violet-700 to-purple-800 text-white shadow-lg',
    cardBorder: 'border-slate-200 hover:border-indigo-300',
    buttonClass: 'bg-indigo-700 hover:bg-indigo-800 text-white',
  },
  'Custom Staff / Partner Products': {
    badge: 'VERTICAL 05 · INDIA POST BULK CUSTOMERS & PROMOTED PRODUCTS',
    title: 'Bulk Customers, Gangajal & Postal Hub Offerings',
    subtitle:
      'Explore promoted products from registered India Post Bulk Customers & BNPL shippers — booked via Speed Post COD.',
    icon: Package,
    headerGradient: 'bg-gradient-to-r from-amber-700 via-orange-700 to-red-800 text-white shadow-lg',
    cardBorder: 'border-slate-200 hover:border-amber-300',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
};

export default function PublicStorefrontSection({
  externalVerticalFilter,
  externalSearchQuery,
  hideFilterHeader = false,
  activePincode: propPincode,
  onAddToCart,
  excludePostOfficeItems = false,
}: PublicStorefrontSectionProps) {
  const navigate = useNavigate();
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
  const [selectedPincode, setSelectedPincode] = useState<string>(
    () => propPincode || pincodeOperationsService.getActivePincode()
  );
  const [selectedBeat, setSelectedBeat] = useState<string>('ALL');
  const [storeTypeFilter, setStoreTypeFilter] = useState<'ALL' | StoreEntityType>('ALL');
  const [showOutOfZone, setShowOutOfZone] = useState<boolean>(false);
  const [pitchLang, setPitchLang] = useState<'EN' | 'HI'>('HI');
  const [waDeskLine, setWaDeskLine] = useState<'PARTNER' | 'DESK'>('PARTNER');
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

  const effectiveVertical = externalVerticalFilter ?? selectedVertical;
  const effectiveSearch = externalSearchQuery !== undefined ? externalSearchQuery : searchQuery;

  useEffect(() => {
    if (propPincode) {
      setSelectedPincode(propPincode);
    }
  }, [propPincode]);

  useEffect(() => {
    const refresh = () => {
      setStoreProducts(staffProductService.getPublicCatalog(partnerFilterId));
      setFreshCommercialState(aiCommercialVerificationService.getFreshActiveStoresForPublic());
    };
    refresh();
    const unsubProd = staffProductService.subscribe(refresh);
    const unsubComm = commercialPropertyService.subscribe(refresh);
    const unsubPin = pincodeOperationsService.subscribe(() => {
      if (!propPincode) {
        setSelectedPincode(pincodeOperationsService.getActivePincode());
      }
    });
    return () => {
      unsubProd();
      unsubComm();
      unsubPin();
    };
  }, [partnerFilterId, propPincode]);

  const filteredStoreProducts = useMemo(() => {
    const q = effectiveSearch.trim().toLowerCase();
    return storeProducts.filter((item) => {
      if (item.freshnessStatus === 'STALE_EXCLUDED') {
        return false;
      }
      if (storeTypeFilter === 'BRAND_FRANCHISE' && item.storeType !== 'BRAND_FRANCHISE') {
        return false;
      }
      if (storeTypeFilter === 'LOCAL_MERCHANT' && item.storeType === 'BRAND_FRANCHISE') {
        return false;
      }
      const svc = staffProductService.checkProductServiceability(item, selectedPincode, selectedBeat);
      if (!svc.isServiceable && !showOutOfZone) {
        return false;
      }
      if (excludePostOfficeItems) {
        const isPostVertical =
          item.vertical === 'Banking & Finance' ||
          item.vertical === 'Documents & Digital Services' ||
          item.vertical === 'Logistics & Courier Services' ||
          item.vertical === 'Course & Skill Academy';
        const skuBlob = `${item.sku} ${item.title} ${item.vendorCategory || ''}`.toLowerCase();
        const isPostItem =
          skuBlob.includes('mystamp') ||
          skuBlob.includes('my stamp') ||
          skuBlob.includes('gangajal') ||
          skuBlob.includes('speed post') ||
          skuBlob.includes('ippb') ||
          skuBlob.includes('pli') ||
          skuBlob.includes('jeevan pramaan') ||
          skuBlob.includes('celc');
        if (isPostVertical || isPostItem) {
          return false;
        }
      }
      const matchesVertical = effectiveVertical === 'ALL' || item.vertical === effectiveVertical;
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.brandName || '').toLowerCase().includes(q) ||
        (item.vendorName || '').toLowerCase().includes(q) ||
        item.staffName.toLowerCase().includes(q);
      return matchesVertical && matchesSearch;
    });
  }, [storeProducts, effectiveVertical, effectiveSearch, selectedPincode, selectedBeat, storeTypeFilter, showOutOfZone, excludePostOfficeItems]);

  const { serviceableStores: filteredVerifiedStores, outOfZoneStores } = useMemo(() => {
    const q = effectiveSearch.trim().toLowerCase();
    const matching = freshCommercialState.freshStores.filter((s) => {
      if (s.isStorefrontEnabled === false) {
        return false;
      }
      if (storeTypeFilter === 'BRAND_FRANCHISE' && s.storeType !== 'BRAND_FRANCHISE') {
        return false;
      }
      if (storeTypeFilter === 'LOCAL_MERCHANT' && s.storeType === 'BRAND_FRANCHISE') {
        return false;
      }
      if (!q) return true;
      return (
        s.storeName.toLowerCase().includes(q) ||
        (s.brandName || '').toLowerCase().includes(q) ||
        (s.brandCategoryTag || '').toLowerCase().includes(q) ||
        s.colony.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.beatNo.toLowerCase().includes(q)
      );
    });

    const sorted = staffProductService.sortVendorStoresByMarginPriority(matching);
    const serviceable: Array<CommercialStoreRecord & { evaluation: FourFactorVerificationResult }> = [];
    const outOfZone: Array<CommercialStoreRecord & { evaluation: FourFactorVerificationResult }> = [];
    const seenKeys = new Set<string>();

    for (const st of sorted) {
      const canonicalKey =
        st.storeType === 'BRAND_FRANCHISE'
          ? resolveBrandSlug(st.brandName || st.storeName)
          : st.storeName.toLowerCase().trim();
      if (seenKeys.has(canonicalKey)) continue;
      seenKeys.add(canonicalKey);

      const check = commercialPropertyService.checkStoreServiceability(st, selectedPincode, selectedBeat);
      const evalResult = aiCommercialVerificationService.evaluateStoreFourFactor(st);
      const enriched = { ...st, evaluation: evalResult };
      if (check.isServiceable) serviceable.push(enriched);
      else outOfZone.push(enriched);
    }

    return {
      serviceableStores: serviceable.slice(0, 9),
      outOfZoneStores: outOfZone.slice(0, 6),
    };
  }, [freshCommercialState.freshStores, effectiveSearch, selectedPincode, selectedBeat, storeTypeFilter]);

  const resolveTargetWhatsapp = (partnerNumber?: string) => {
    if (waDeskLine === 'DESK') return getPincodeHub(selectedPincode).whatsappPhone;
    return partnerNumber || getPincodeHub(selectedPincode).whatsappPhone;
  };

  const buildWhatsappHref = (
    item: StaffProductItem,
    actionLabel = 'WhatsApp Order',
    overridePhone?: string
  ) => {
    const targetPhone = overridePhone || resolveTargetWhatsapp(item.whatsappNumber);
    const priceLabel = item.price === 0 ? 'FREE / Zero Fee' : `₹${item.price}`;
    const msg =
      pitchLang === 'HI'
        ? `नमस्ते ${item.beatManagerName || item.staffName},\n` +
          `India Post पोर्टल (PIN ${item.pincode || selectedPincode}) से ऑर्डर / जानकारी:\n\n` +
          `📮 हब / प्रेषक: ${item.vendorName || item.staffName}\n` +
          `📦 उत्पाद / सेवा: ${item.title}\n` +
          `🔖 कोड (SKU): ${item.sku}\n` +
          `💰 मूल्य: ${priceLabel} (${item.codEligible ? 'Speed Post COD उपलब्ध' : 'Doorstep Service'} · Flat ₹15 Delivery)\n` +
          `📍 बीट क्षेत्र: ${item.beatNumber || 'Beat 2'}\n` +
          `कृपया डोरस्टेप बुकिंग और डिस्पैच कन्फर्म करें। (${actionLabel})`
        : `Namaste ${item.beatManagerName || item.staffName},\n` +
          `Connecting via India Post Official Showcase (*${actionLabel}*):\n\n` +
          `Hub / Bulk Sender: ${item.vendorName || item.staffName}\n` +
          `Product / Service: ${item.title}\n` +
          `SKU: ${item.sku}\n` +
          `Price: ${priceLabel} (${item.codEligible ? 'Speed Post COD Supported' : 'Doorstep Service'} · Flat ₹15 Delivery)\n` +
          `Beat / Territory: ${item.beatNumber || 'Hub Desk'} (PIN ${item.pincode || selectedPincode})`;
    return `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(msg)}`;
  };

  const openInquiry = (item: StaffProductItem, mode: 'QUICK_INQUIRY' | 'BUY_NOW') => {
    setFormErr(null);
    setSubmittedConfirmation(null);
    setInquiryMode(mode);
    setInquiryProduct(item);
  };

  const buildCommercialVirtualProduct = (
    store: CommercialStoreRecord & { evaluation: FourFactorVerificationResult }
  ): StaffProductItem => {
    const matched = staffProductService.getProductsForVendorStore(store);
    if (matched.length > 0 && !matched[0].id.startsWith('SYNTH-')) {
      return matched[0];
    }
    const beatMeta = commercialPropertyService.getBeatMeta(store.beatNo || 'Beat 1');
    const waDigits = beatMeta.staffContact.replace(/\D/g, '').slice(-10);
    const defaultPrice = store.category === 'eMitra/CSC' ? 100 : 499;
    return {
      id: `COMM-PROD-${store.id}`,
      sku: `INP-${store.category.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4)}-${store.cleanBeatNo}`,
      title: `${store.storeName} · Doorstep Order & Dispatch`,
      vertical: 'Custom Staff / Partner Products',
      pricingModel: 'Fixed Price',
      productType: store.category === 'eMitra/CSC' || store.category === 'Services' ? 'Service' : 'Physical Item',
      price: defaultPrice,
      wholesalePrice: Math.round(defaultPrice * 0.85),
      mrpPrice: Math.round(defaultPrice * 1.15),
      sellingMarginAmount: Math.round(defaultPrice * 0.15),
      sellingMarginPercent: 15,
      codEligible: true,
      vendorName: store.storeName,
      vendorCategory: store.category,
      beatManagerId: beatMeta.staffId,
      beatManagerName: `${beatMeta.staffName} · ${beatMeta.beatNo}`,
      description: `${store.storeName} (${store.fullAddress || `${store.blockSector}, ${store.colony}`}). 4-Factor Verified commercial partner delivered via ${beatMeta.staffName} (${beatMeta.beatNo}).`,
      features: [
        '4-Factor Verified Local Merchant',
        `Same-Day Speed Post COD by ${beatMeta.staffName}`,
        `Direct Beat Dispatch (${beatMeta.beatNo} · PIN ${store.pincode})`,
      ],
      thumbnailUrl: DEFAULT_VERTICAL_THUMBNAILS['Custom Staff / Partner Products'],
      staffId: beatMeta.staffId,
      staffName: `${beatMeta.staffName} (Beat Manager)`,
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
  };

  const openCommercialStoreOrder = (
    store: CommercialStoreRecord & { evaluation: FourFactorVerificationResult },
    mode: 'QUICK_INQUIRY' | 'BUY_NOW'
  ) => {
    openInquiry(buildCommercialVirtualProduct(store), mode);
  };

  const buildCommercialStoreWhatsappHref = (
    store: CommercialStoreRecord & { evaluation: FourFactorVerificationResult }
  ) => {
    const beatMeta = commercialPropertyService.getBeatMeta(store.beatNo || 'Beat 1');
    const waDigits = beatMeta.staffContact.replace(/\D/g, '').slice(-10);
    const targetPhone = resolveTargetWhatsapp(`91${waDigits || '8769706002'}`);
    const msg =
      pitchLang === 'HI'
        ? `नमस्ते ${beatMeta.staffName} (India Post Hub Desk),\n` +
          `मैं *${store.storeName}* (${store.colony}, PIN ${store.pincode}) से India Post Speed Post COD के माध्यम से ऑर्डर / जानकारी चाहता हूँ।\n` +
          `📍 बीट: ${beatMeta.beatNo} | ✅ Verified Hub`
        : `Namaste ${beatMeta.staffName} (India Post Hub Desk),\n` +
          `I want to inquire/book with *${store.storeName}* (${store.colony}, PIN ${store.pincode}) via India Post Speed Post COD.\n` +
          `Beat: ${beatMeta.beatNo} | Verified Hub`;
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
      requirement: `[${inquiryMode === 'BUY_NOW' ? 'SPEED POST COD ORDER' : 'STOREFRONT INQUIRY'}] Vendor: ${inquiryProduct.vendorName || inquiryProduct.staffName} · Beat Manager: ${inquiryProduct.beatManagerName || inquiryProduct.staffName} | ${custNotes.trim() || 'Requested doorstep fulfillment'}`,
      preferredContact: 'WhatsApp',
      address: custAddress.trim() || 'Dadabari S.O. 324009',
      beatNo: assignedBeat,
    });

    let speedPostBarcode: string | undefined;
    if (inquiryMode === 'BUY_NOW' || inquiryProduct.productType === 'Physical Item') {
      const dispatch = aiCommercialVerificationService.createLogisticsDispatch({
        storeId: inquiryProduct.commercialStoreId || inquiryProduct.staffId,
        storeName: inquiryProduct.vendorName || inquiryProduct.title,
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
        pincodeManagerId: inquiryProduct.beatManagerId || inquiryProduct.staffId,
        pincodeManagerName: inquiryProduct.beatManagerName || inquiryProduct.staffName,
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

  if (detailProduct) {
    return (
      <section className="space-y-4" id="storefront-dynamic-product-view">
        <DynamicProductPageView
          storefrontProduct={detailProduct}
          onBack={() => setDetailProduct(null)}
          onOpenVendorProfile={(storeId) => {
            setDetailProduct(null);
            navigate(`/vendor-ecosystem/${encodeURIComponent(storeId)}`);
          }}
        />
      </section>
    );
  }

  return (
    <section className="space-y-6" id="multi-vertical-storefront-section">
      {/* Standalone Storefront Header (hidden when rendered inside a drilled-down category) */}
      {!hideFilterHeader && (
        <div className="bg-gradient-to-r from-slate-950 via-red-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              India Post — Official Services &amp; Bulk Customer Hub · PIN {selectedPincode}
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ textWrap: 'balance' }}>
              India Post Services, Bulk Customer Offerings &amp; Speed Post COD
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Every regional postal counter and bulk customer node maps directly to its designated Delivery Hub with Speed Post COD and Beat dispatch tracking.
            </p>
            {partnerFilterId && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold mt-1">
                <UserCheck size={14} />
                <span>Hub / Officer Filter: {partnerFilterId}</span>
                <button
                  type="button"
                  onClick={() => setPartnerFilterId(undefined)}
                  className="underline text-amber-300 hover:text-white ml-1 cursor-pointer"
                >
                  Show All Beats
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Services, SKU, Beat..."
                className="w-full pl-9 pr-12 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder:text-slate-300 focus:bg-white focus:text-slate-900 focus:outline-none transition"
                id="storefront-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-300 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <Link
              to="/b2b-partner"
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 whitespace-nowrap shadow-md"
              id="register-vendor-product-btn"
            >
              <Building2 size={15} />
              <span>Bulk Customer Desk</span>
            </Link>
          </div>
        </div>
      )}

      {/* PINCODE & BEAT DELIVERY AVAILABILITY ENGINE BAR + PARTNER CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
        {/* PINcode & Beat Serviceability Filter Bar */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-black text-slate-900">
              <MapPin size={15} className="text-red-700 shrink-0" />
              <span>Delivery PIN &amp; Beat Availability:</span>
            </div>
            <select
              value={selectedPincode}
              onChange={(e) => setSelectedPincode(e.target.value)}
              aria-label="Filter stores by delivery pincode"
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 cursor-pointer"
              id="storefront-pincode-select"
            >
              {PINCODE_OFFICE_HUBS.map((z) => (
                <option key={z.pincode} value={z.pincode}>
                  PIN {z.pincode} · {z.name}
                </option>
              ))}
            </select>

            <select
              value={selectedBeat}
              onChange={(e) => setSelectedBeat(e.target.value)}
              aria-label="Filter stores by postman beat"
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 cursor-pointer"
              id="storefront-beat-select"
            >
              <option value="ALL">All Beats in PIN {selectedPincode}</option>
              {commercialPropertyService.beatDirectory.slice(0, 15).map((b) => (
                <option key={b.beatNo} value={b.beatNo}>
                  {b.beatNo} · {b.staffName}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg">
              <button
                type="button"
                onClick={() => setStoreTypeFilter('ALL')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition whitespace-nowrap ${
                  storeTypeFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Hubs
              </button>
              <button
                type="button"
                onClick={() => setStoreTypeFilter('BRAND_FRANCHISE')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition whitespace-nowrap ${
                  storeTypeFilter === 'BRAND_FRANCHISE' ? 'bg-red-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bulk Customers
              </button>
              <button
                type="button"
                onClick={() => setStoreTypeFilter('LOCAL_MERCHANT')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition whitespace-nowrap ${
                  storeTypeFilter === 'LOCAL_MERCHANT' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Postal Nodes
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-emerald-700 tabular-nums">
              {filteredVerifiedStores.length} Deliverable in PIN {selectedPincode}
            </span>
            {outOfZoneStores.length > 0 && (
              <button
                type="button"
                onClick={() => setShowOutOfZone(!showOutOfZone)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer whitespace-nowrap ${
                  showOutOfZone
                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
                id="toggle-out-of-zone-btn"
              >
                {showOutOfZone ? 'Hide Out-of-Zone' : `Show Out-of-Zone (${outOfZoneStores.length})`}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-700">WhatsApp Support:</span>
            <button
              type="button"
              onClick={() => setWaDeskLine('PARTNER')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold border transition cursor-pointer whitespace-nowrap ${
                waDeskLine === 'PARTNER'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Assigned Store Desk
            </button>
            <button
              type="button"
              onClick={() => setWaDeskLine('DESK')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold border transition cursor-pointer whitespace-nowrap ${
                waDeskLine === 'DESK'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              PIN {selectedPincode} Express COD Desk
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setPitchLang(pitchLang === 'HI' ? 'EN' : 'HI')}
              className="px-3 py-1.5 rounded-lg font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer whitespace-nowrap"
            >
              Chat Language: {pitchLang === 'HI' ? 'हिंदी' : 'English'}
            </button>

            {hideFilterHeader && (
              <Link
                to="/b2b-partner"
                className="px-3 py-1.5 rounded-lg font-bold bg-slate-900 hover:bg-slate-800 text-amber-300 flex items-center gap-1 whitespace-nowrap"
              >
                <Building2 size={13} />
                <span>Bulk Customer Desk</span>
              </Link>
            )}
          </div>
        </div>

        {/* Vertical Quick Pills when not hidden */}
        {!hideFilterHeader && (
          <div className="flex items-center gap-2 overflow-x-auto pt-1">
            <button
              type="button"
              onClick={() => setSelectedVertical('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer border ${
                selectedVertical === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All India Post Verticals ({storeProducts.length})
            </button>
            {ALL_PRODUCT_VERTICALS.map((vert) => {
              const count = storeProducts.filter((p) => p.vertical === vert).length;
              return (
                <button
                  key={vert}
                  type="button"
                  onClick={() => setSelectedVertical(vert)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer border ${
                    selectedVertical === vert
                      ? 'bg-red-700 text-white border-red-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {vert} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Categorized Storefront Cards Grid */}
      <div className="space-y-8">
        {ALL_PRODUCT_VERTICALS.filter((v) => effectiveVertical === 'ALL' || effectiveVertical === v).map((vert) => {
          const items = filteredStoreProducts.filter((p) => p.vertical === vert);
          if (items.length === 0) return null;
          const meta = VERTICAL_META[vert];
          const VerticalIcon = meta.icon;

          return (
            <div key={vert} className="space-y-4">
              {/* Vertical Banner Strip (only shown when viewing ALL verticals so drill-down headers don't double up) */}
              {effectiveVertical === 'ALL' && (
                <div className={`rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-3 ${meta.headerGradient}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/15 border border-white/20 text-white shrink-0">
                      <VerticalIcon size={20} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
                        {meta.badge}
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white">{meta.title}</h3>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white/90 tabular-nums">
                    {items.length} {items.length === 1 ? 'Product' : 'Products'}
                  </span>
                </div>
              )}

              {/* Compact Uniform 4-Column Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {items.map((item) => {
                  const hasImgError = imgErrors[item.id];
                  const fallbackSrc = DEFAULT_VERTICAL_THUMBNAILS[item.vertical];
                  const discountPct =
                    item.mrpPrice && item.mrpPrice > item.price && item.price > 0
                      ? Math.round(((item.mrpPrice - item.price) / item.mrpPrice) * 100)
                      : 0;
                  const prodSvc = staffProductService.checkProductServiceability(item, selectedPincode, selectedBeat);

                  return (
                    <article
                      key={item.id}
                      className={`group bg-white rounded-2xl border overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition duration-200 flex flex-col justify-between ${
                        !prodSvc.isServiceable ? 'border-slate-300 opacity-90' : meta.cardBorder
                      }`}
                    >
                      <div>
                        {/* Compact 4:3 Studio Thumbnail Header */}
                        <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                          {!hasImgError ? (
                            <img
                              src={item.thumbnailUrl || fallbackSrc}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              onError={() => setImgErrors((prev) => ({ ...prev, [item.id]: true }))}
                              className={`w-full h-full object-cover group-hover:scale-105 transition duration-300 ${
                                !prodSvc.isServiceable ? 'grayscale-[40%]' : ''
                              }`}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center p-4 text-center text-white">
                              <VerticalIcon size={24} className="text-amber-300 mb-1.5" />
                              <div className="text-xs font-bold">{item.title}</div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent pointer-events-none" />
                          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between gap-2 text-[11px] text-white">
                            <span className="font-bold text-amber-300 uppercase tracking-wide truncate">
                              {item.brandName || item.vendorCategory || item.productType}
                            </span>
                            {discountPct > 0 && (
                              <span className="font-mono font-black text-emerald-300 shrink-0 tabular-nums">
                                {discountPct}% OFF
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Compact Structured Body */}
                        <div className="p-3 space-y-1.5">
                          <div className="text-[10px] text-slate-500 font-medium flex items-center justify-between gap-1.5">
                            <span className="truncate font-semibold text-slate-700">
                              {item.vendorName || item.staffName}
                            </span>
                            <span
                              className={`font-mono font-bold shrink-0 ${
                                prodSvc.isServiceable ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {prodSvc.isServiceable
                                ? `PIN ${selectedPincode} · ₹15 Del`
                                : 'Out of Zone'}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-2 min-h-[2.25rem]">
                            {item.title}
                          </h4>

                          <div className="text-[10px] text-slate-500 truncate">
                            Mgr: <span className="font-semibold text-slate-700">{(item.beatManagerName || item.staffName).split('·')[0].trim()}</span> · {item.beatNumber || 'Beat 2'}
                          </div>

                          {/* Clean Retail Pricing */}
                          <div className="pt-1.5 border-t border-slate-100 flex items-baseline justify-between gap-1.5">
                            <div className="flex items-baseline gap-1.5 tabular-nums">
                              <span className="font-black text-sm sm:text-base text-slate-900">
                                {Number(item.price) === 0 ? 'FREE' : `₹${(Number(item.price) || 0).toLocaleString('en-IN')}`}
                              </span>
                              {item.mrpPrice && Number(item.mrpPrice) > Number(item.price) && (
                                <span className="text-[11px] text-slate-400 line-through">
                                  ₹{(Number(item.mrpPrice) || 0).toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 whitespace-nowrap">
                              Speed Post COD
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Compact Action Footer: Know More + Add to Cart + Dual WhatsApp */}
                      <div className="p-2.5 pt-2 bg-slate-50 border-t border-slate-100 space-y-1.5">
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailProduct(item)}
                            className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <Info size={12} className="text-amber-300" />
                            <span>Know More</span>
                          </button>
                          {onAddToCart && item.price > 0 && prodSvc.isServiceable ? (
                            <button
                              type="button"
                              onClick={() =>
                                onAddToCart({
                                  id: item.id,
                                  sku: item.sku,
                                  title: item.title,
                                  price: item.price,
                                  imageSrc: item.thumbnailUrl || fallbackSrc,
                                  vendorName: item.vendorName || item.staffName,
                                  beatNo: item.beatNumber || 'Beat 2',
                                })
                              }
                              className={`px-2 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer ${meta.buttonClass}`}
                            >
                              <ShoppingBag size={12} />
                              <span>Add to Cart</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={!prodSvc.isServiceable}
                              onClick={() => openInquiry(item, item.price > 0 ? 'BUY_NOW' : 'QUICK_INQUIRY')}
                              className={`px-2 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 whitespace-nowrap ${
                                prodSvc.isServiceable
                                  ? `${meta.buttonClass} cursor-pointer`
                                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              <ShoppingBag size={12} />
                              <span>
                                {!prodSvc.isServiceable ? 'Out of Zone' : item.price > 0 ? 'Order COD' : 'Book Visit'}
                              </span>
                            </button>
                          )}
                        </div>
                        <a
                          href={buildWhatsappHref(item, 'WhatsApp Order')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                          <MessageCircle size={12} className="shrink-0" />
                          <span>Order on WhatsApp</span>
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Verified Brand Franchises & Local Commercial Partner Stores (PINcode & Margin Ranked) */}
        {(effectiveVertical === 'ALL' || effectiveVertical === 'Custom Staff / Partner Products') &&
          (filteredVerifiedStores.length > 0 || (showOutOfZone && outOfZoneStores.length > 0)) && (
            <div className="space-y-4 pt-2" id="brand-and-partner-showcase">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-red-700 shrink-0 mt-0.5">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-red-700">
                      BRAND STORES &amp; 4-FACTOR VERIFIED MERCHANTS · DELIVERING TO PIN {selectedPincode}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      National Brand Partners &amp; Verified Local Stores
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Automatically filtered for active Speed Post COD &amp; Express Beat delivery in PIN {selectedPincode}.
                    </p>
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shrink-0 tabular-nums">
                  {filteredVerifiedStores.length} Active in {selectedPincode}
                </div>
              </div>

              {filteredVerifiedStores.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredVerifiedStores.map((store) => {
                    const beatMeta = commercialPropertyService.getBeatMeta(store.beatNo || 'Beat 1');
                    const marginSummary = staffProductService.getVendorCommissionSummary(store);
                    const svc = commercialPropertyService.checkStoreServiceability(store, selectedPincode, selectedBeat);
                    const isBrand = store.storeType === 'BRAND_FRANCHISE';
                    return (
                      <article
                        key={store.id}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div>
                          {/* Brand Store Visual Banner when photo/logo exists */}
                          {(store.brandLogoUrl || store.photoUrl) && (
                            <div className="relative aspect-[16/9] bg-slate-950 overflow-hidden">
                              <img
                                src={store.brandLogoUrl || store.photoUrl}
                                alt={store.storeName}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                              <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between gap-2 text-white">
                                <div className="flex items-center gap-2 min-w-0">
                                  {store.brandMonogram && (
                                    <span
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white shrink-0 border border-white/25"
                                      style={{ backgroundColor: store.brandAccentColor || '#B91C1C' }}
                                    >
                                      {store.brandMonogram}
                                    </span>
                                  )}
                                  <span className="text-xs font-black truncate">
                                    {store.brandName || store.storeName}
                                  </span>
                                </div>
                                <span className="text-[11px] font-mono text-amber-300 font-bold shrink-0">
                                  {store.dispatchCutoffTime || 'Same-Day COD'}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="p-5 space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span className="font-bold text-slate-800">
                                {store.listingTier === 'SPONSORED_PARTNER'
                                  ? 'Featured Store'
                                  : store.listingTier === 'ACTIVE_AFFILIATE'
                                  ? 'Verified Local Store'
                                  : isBrand
                                  ? store.brandCategoryTag || 'Brand Store'
                                  : store.category}{' '}
                                · {marginSummary.productCount} SKU{marginSummary.productCount === 1 ? '' : 's'}
                              </span>
                              <span className="font-mono text-emerald-700 font-bold tabular-nums">
                                {store.evaluation.score}/100 Verified
                              </span>
                            </div>

                            <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                              {store.storeName}
                            </h4>
                            <p className="text-xs text-slate-600 line-clamp-2">
                              {store.fullAddress || `${store.blockSector}, ${store.colony}, Kota - ${store.pincode}`}
                            </p>

                            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span>Serviceable PINs:</span>
                                <strong className="text-emerald-700 font-mono tabular-nums truncate">
                                  {svc.serviceablePincodes.join(', ')} ({svc.deliveryRadiusKm}km)
                                </strong>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span>Mapped Beat Manager:</span>
                                <strong className="text-slate-900 truncate">{beatMeta.staffName} ({beatMeta.beatNo})</strong>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              to={`/brand/${resolveBrandSlug(store.brandName || store.storeName)}`}
                              className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                            >
                              <Store size={13} className="text-amber-300" />
                              <span>Official Store</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                const vp = buildCommercialVirtualProduct(store);
                                if (onAddToCart && vp.price > 0 && vp.productType === 'Physical Item') {
                                  onAddToCart({
                                    id: vp.id,
                                    sku: vp.sku,
                                    title: vp.title,
                                    price: vp.price,
                                    imageSrc: vp.thumbnailUrl || store.brandLogoUrl || store.photoUrl,
                                    vendorName: store.storeName,
                                    beatNo: store.beatNo || 'Beat 2',
                                  });
                                } else {
                                  openCommercialStoreOrder(store, 'BUY_NOW');
                                }
                              }}
                              className="py-2 px-3 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                            >
                              <Truck size={13} />
                              <span>Order COD</span>
                            </button>
                          </div>
                          <a
                            href={buildCommercialStoreWhatsappHref(store)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                          >
                            <MessageCircle size={14} className="text-emerald-600" />
                            <span>Order on WhatsApp</span>
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Graceful Out-of-Delivery-Zone Brands Showcase when toggled ON */}
              {showOutOfZone && outOfZoneStores.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-200" id="out-of-zone-stores-grid">
                  <div className="text-xs font-bold text-slate-600 flex items-center justify-between">
                    <span>Out of Delivery Zone for PIN {selectedPincode} ({outOfZoneStores.length} Stores)</span>
                    <span>Switch Delivery PIN above to unlock ordering</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {outOfZoneStores.map((store) => {
                      const svc = commercialPropertyService.checkStoreServiceability(store, selectedPincode, selectedBeat);
                      return (
                        <article
                          key={store.id}
                          className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between gap-3 opacity-85"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-600">{store.brandCategoryTag || store.category}</span>
                              <span className="font-bold text-rose-700">Out of Delivery Zone</span>
                            </div>
                            <h4 className="text-sm font-black text-slate-800">{store.storeName}</h4>
                            <p className="text-xs text-slate-500">{svc.reason}</p>
                          </div>
                          <button
                            type="button"
                            disabled
                            className="w-full py-2 px-3 rounded-xl bg-slate-200 text-slate-500 text-xs font-bold cursor-not-allowed"
                          >
                            Unavailable for PIN {selectedPincode}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        {filteredStoreProducts.length === 0 && filteredVerifiedStores.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
            <Store size={28} className="mx-auto text-slate-400" />
            <div className="text-sm font-black text-slate-900">
              No deliverable offerings in PIN {selectedPincode} match your current filter
            </div>
            <p className="text-xs text-slate-500">
              Try switching the Delivery PINcode, clearing the search query, or checking Out-of-Zone brands.
            </p>
          </div>
        )}
      </div>

      {/* Dynamic Product Page View handled directly above cleanly without static modal */}

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
                  Beat Manager: {inquiryProduct.beatManagerName || inquiryProduct.staffName} ·{' '}
                  {inquiryProduct.price === 0 ? 'FREE' : `₹${inquiryProduct.price} (COD Supported)`}
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
                  Thank you, <strong>{submittedConfirmation.name}</strong>! Routed to{' '}
                  <strong>{submittedConfirmation.product.beatManagerName || submittedConfirmation.product.staffName}</strong>.
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
                      : 'Submit Inquiry to Beat Manager'}
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
