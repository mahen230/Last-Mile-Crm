import React, { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  Landmark,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  UserCheck,
  Wallet,
} from 'lucide-react';
import { POSTAL_PRODUCTS } from '../../data/productsData';
import { ProductDefinition, StaffProductItem } from '../../types/models';
import { staffProductService, DEFAULT_VERTICAL_THUMBNAILS } from '../../services/staffProductService';
import {
  commercialPropertyService,
} from '../../services/commercialPropertyService';
import {
  PINCODE_OFFICE_HUBS,
  getPincodeHub,
  pincodeOperationsService,
} from '../../services/pincodeOperationsService';
import { resolveBrandSlug } from '../../services/brandDirectoryService';
import { aiCommercialVerificationService } from '../../services/aiCommercialVerificationService';
import { customerService } from '../../services/customerService';
import { useAuth } from '../auth/FirebaseAuthProvider';
import SchemePosterArtwork from './SchemePosterArtwork';

export type DynamicCategoryMode = 'BANKING_FINANCE' | 'RETAIL_MERCHANDISE' | 'LOCAL_B2B_VENDOR';

export interface DynamicProductPageViewProps {
  officialScheme?: ProductDefinition | null;
  storefrontProduct?: StaffProductItem | null;
  onBack?: () => void;
  onOpenVendorProfile?: (vendorStoreId: string) => void;
}

const BANKING_CODES = new Set([
  'SSA',
  'PPF',
  'SCSS',
  'MIS',
  'RD',
  'TD',
  'NSC',
  'KVP',
  'PLI_SURAKSHA',
  'PLI_SANTOSH',
  'RPLI_GRAM_SANTOSH',
  'IPPB_BANKING',
  'IPPB_GPA',
  'IPPB_LOANS',
]);

export function resolveDynamicCategoryMode(
  officialScheme?: ProductDefinition | null,
  storefrontProduct?: StaffProductItem | null
): DynamicCategoryMode {
  if (officialScheme) {
    if (BANKING_CODES.has(officialScheme.code)) return 'BANKING_FINANCE';
    return 'RETAIL_MERCHANDISE';
  }
  if (storefrontProduct) {
    if (storefrontProduct.vertical === 'Banking & Finance') return 'BANKING_FINANCE';
    const isB2B =
      Boolean(storefrontProduct.commercialStoreId) ||
      storefrontProduct.id.startsWith('PROD-B2B') ||
      storefrontProduct.id === 'PROD-CUST-005' ||
      storefrontProduct.id === 'PROD-LOG-006' ||
      storefrontProduct.vendorCategory === 'Wholesale' ||
      (storefrontProduct.vertical === 'Custom Staff / Partner Products' &&
        storefrontProduct.id !== 'PROD-COMM-GANGAJAL');
    return isB2B ? 'LOCAL_B2B_VENDOR' : 'RETAIL_MERCHANDISE';
  }
  return 'RETAIL_MERCHANDISE';
}

export default function DynamicProductPageView({
  officialScheme: propScheme,
  storefrontProduct: propStoreProduct,
  onBack,
  onOpenVendorProfile,
}: DynamicProductPageViewProps) {
  const { productKey } = useParams<{ productKey: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const resolvedData = useMemo(() => {
    if (propScheme || propStoreProduct) {
      return { scheme: propScheme || null, product: propStoreProduct || null };
    }
    if (!productKey) {
      return { scheme: POSTAL_PRODUCTS[0], product: null };
    }
    const decoded = decodeURIComponent(productKey);
    const matchedScheme = POSTAL_PRODUCTS.find(
      (p) => p.code.toLowerCase() === decoded.toLowerCase() || p.id === decoded
    );
    if (matchedScheme) {
      return { scheme: matchedScheme, product: null };
    }
    const allStoreProducts = staffProductService.getAllProducts();
    const matchedStoreProd = allStoreProducts.find(
      (p) => p.id === decoded || p.sku.toLowerCase() === decoded.toLowerCase()
    );
    return { scheme: null, product: matchedStoreProd || null };
  }, [propScheme, propStoreProduct, productKey]);

  const scheme = resolvedData.scheme;
  const storeProd = resolvedData.product;
  const categoryMode = resolveDynamicCategoryMode(scheme, storeProd);

  // Interactive Calculator, Configurator & PINcode Check States
  const [calcAmount, setCalcAmount] = useState<number>(scheme?.code === 'IPPB_LOANS' ? 200000 : 100000);
  const [retailQty, setRetailQty] = useState<number>(1);
  const [checkPincode, setCheckPincode] = useState<string>(() =>
    pincodeOperationsService.getActivePincode()
  );

  // Lead & Order Capture State
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custAddress, setCustAddress] = useState(() => {
    const h = getPincodeHub(pincodeOperationsService.getActivePincode());
    return `${h.officeName} · PIN ${h.pincode}`;
  });
  const [custNote, setCustNote] = useState('');
  const [formErr, setFormErr] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<{
    ticket: string;
    barcode?: string;
    summary: string;
  } | null>(null);

  // Lookup Commercial Store Attribution for B2B / Brand Franchise products
  const matchedVendorStore = useMemo(() => {
    if (!storeProd) return null;
    const allStores = commercialPropertyService.getAllStores();
    return (
      allStores.find(
        (s) =>
          (storeProd.commercialStoreId && s.id === storeProd.commercialStoreId) ||
          (storeProd.vendorName && s.storeName.toLowerCase() === storeProd.vendorName.toLowerCase())
      ) || null
    );
  }, [storeProd]);

  const isBrandStore =
    storeProd?.storeType === 'BRAND_FRANCHISE' || matchedVendorStore?.storeType === 'BRAND_FRANCHISE';

  const productServiceability = useMemo(() => {
    if (!storeProd) return null;
    return staffProductService.checkProductServiceability(storeProd, checkPincode);
  }, [storeProd, checkPincode]);

  // Banking Return Estimator Math
  const bankingProjection = useMemo(() => {
    const c = scheme?.code || '';
    if (c === 'SSA') {
      return {
        inputLabel: 'Annual Deposit (for 15 Years)',
        principal: calcAmount * 15,
        maturity: Math.round(calcAmount * 46.18),
        badge: '8.2% p.a. Tax-Free Corpus (Yr 21)',
      };
    }
    if (c === 'SCSS') {
      const qtr = Math.round((calcAmount * 0.082) / 4);
      return {
        inputLabel: 'Senior Citizen Deposit',
        principal: calcAmount,
        maturity: calcAmount + qtr * 20,
        badge: `₹${qtr.toLocaleString('en-IN')}/Quarter Pension (8.2% p.a.)`,
      };
    }
    if (c === 'MIS') {
      const mo = Math.round((calcAmount * 0.074) / 12);
      return {
        inputLabel: 'MIS Deposit Capital',
        principal: calcAmount,
        maturity: calcAmount + mo * 60,
        badge: `₹${mo.toLocaleString('en-IN')}/Month Assured Payout (7.4% p.a.)`,
      };
    }
    if (c === 'PPF') {
      return {
        inputLabel: 'Annual PPF Deposit (15 Years)',
        principal: calcAmount * 15,
        maturity: Math.round(calcAmount * 27.12),
        badge: '7.1% p.a. Triple Tax-Exempt (EEE)',
      };
    }
    if (c === 'NSC') {
      return {
        inputLabel: 'NSC Lump Sum Deposit',
        principal: calcAmount,
        maturity: Math.round(calcAmount * 1.449),
        badge: '7.7% p.a. 5-Year 80C Maturity',
      };
    }
    if (c === 'KVP') {
      return {
        inputLabel: 'KVP Certificate Value',
        principal: calcAmount,
        maturity: calcAmount * 2,
        badge: 'Doubles in 115 Months (7.5% p.a.)',
      };
    }
    if (c === 'IPPB_LOANS') {
      const monthlyRate = 0.0885 / 12;
      const months = 36;
      const emi = Math.round(
        (calcAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1)
      );
      return {
        inputLabel: 'Loan Principal (36-Month Term)',
        principal: calcAmount,
        maturity: emi,
        badge: `Est. Monthly EMI @ 8.85% p.a.`,
      };
    }
    if (c.includes('PLI') || c.includes('RPLI')) {
      const rate = c === 'PLI_SURAKSHA' ? 76 : c === 'PLI_SANTOSH' ? 52 : 60;
      const yearlyBonus = Math.round((calcAmount / 1000) * rate);
      return {
        inputLabel: 'Policy Sum Assured',
        principal: calcAmount,
        maturity: calcAmount + yearlyBonus * 20,
        badge: `₹${yearlyBonus.toLocaleString('en-IN')}/Yr Sovereign Bonus`,
      };
    }
    return {
      inputLabel: 'Savings / Activation Volume',
      principal: calcAmount,
      maturity: Math.round(calcAmount * 1.07),
      badge: 'IPPB Zero-Balance + Sweep-in POSB Return',
    };
  }, [scheme, calcAmount]);

  // Retail Order Total for Partner Store Items
  const retailOrderMetrics = useMemo(() => {
    const retailUnit = storeProd?.price || 499;
    return {
      qty: retailQty,
      unitRate: retailUnit,
      totalQuote: retailUnit * retailQty,
    };
  }, [storeProd, retailQty]);

  if (!scheme && !storeProd) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4 max-w-2xl mx-auto my-8">
        <Package size={36} className="mx-auto text-slate-400" />
        <h2 className="text-xl font-black text-slate-900">Product or Scheme Not Found</h2>
        <p className="text-xs text-slate-600">
          The requested item could not be located in the active Dadabari S.O. catalog.
        </p>
        <button
          type="button"
          onClick={() => (onBack ? onBack() : navigate('/'))}
          className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  const title = scheme ? scheme.name : storeProd!.title;
  const codeOrSku = scheme ? scheme.code : storeProd!.sku;
  const description = scheme ? scheme.description : storeProd!.description;
  const basePrice = scheme ? (scheme.code === 'MY_STAMP' ? 300 : scheme.code === 'GANGAJAL' ? 30 : 0) : storeProd!.price;

  const beatNo = storeProd?.beatNumber && storeProd.beatNumber !== 'All Beats' ? storeProd.beatNumber : 'Beat 2';
  const beatMeta = commercialPropertyService.getBeatMeta(beatNo);
  const targetWhatsapp =
    storeProd?.whatsappNumber || `91${beatMeta.staffContact.replace(/\D/g, '').slice(-10) || '8769706002'}`;

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null);
    if (productServiceability && !productServiceability.isServiceable && categoryMode !== 'BANKING_FINANCE') {
      setFormErr(
        `This store is currently out of delivery zone for PIN ${checkPincode}. ${productServiceability.reason}`
      );
      return;
    }
    const digits = custMobile.replace(/\D/g, '').slice(-10);
    if (custName.trim().length < 2) {
      setFormErr('Please enter your full name.');
      return;
    }
    if (digits.length !== 10) {
      setFormErr('Please enter a valid 10-digit mobile number.');
      return;
    }

    const reqText =
      categoryMode === 'BANKING_FINANCE'
        ? `[SOVEREIGN BANKING LEAD] Estimate Basis: ₹${calcAmount.toLocaleString('en-IN')} · ${custNote.trim() || 'Requested Doorstep Account / Policy KYC'}`
        : categoryMode === 'LOCAL_B2B_VENDOR'
        ? `[INDIA POST BULK COD ORDER] Qty: ${retailOrderMetrics.qty} · Total ₹${retailOrderMetrics.totalQuote.toLocaleString('en-IN')} · Bulk Hub: ${storeProd?.vendorName || beatMeta.staffName}`
        : `[RETAIL SPEED POST ORDER] Qty: ${retailQty} · Total ₹${(basePrice * retailQty).toLocaleString('en-IN')} · ${custNote.trim() || 'Doorstep Delivery'}`;

    const { inquiry } = customerService.submitCustomerInquiry({
      customerName: custName.trim(),
      mobile: digits,
      productInterested: `${title} (${codeOrSku})`,
      requirement: reqText,
      preferredContact: 'WhatsApp',
      address: custAddress.trim() || `Kota PIN ${checkPincode}`,
      beatNo,
    });

    let barcode: string | undefined;
    if (categoryMode !== 'BANKING_FINANCE') {
      const dispatch = aiCommercialVerificationService.createLogisticsDispatch({
        storeId: matchedVendorStore?.id || storeProd?.commercialStoreId || storeProd?.staffId || 'HUB-DESK',
        storeName: storeProd?.vendorName || 'India Post Dispatch Hub',
        productId: storeProd?.id || scheme?.id,
        productTitle: title,
        productSku: codeOrSku,
        productPrice:
          categoryMode === 'LOCAL_B2B_VENDOR' ? retailOrderMetrics.totalQuote : basePrice * retailQty,
        customerName: custName.trim(),
        customerMobile: digits,
        deliveryAddress: custAddress.trim() || `PIN ${checkPincode}`,
        colony: matchedVendorStore?.colony || getPincodeHub(checkPincode).name,
        pincode: checkPincode || storeProd?.pincode || '324009',
        beatNo,
        pincodeManagerId: beatMeta.staffId,
        pincodeManagerName: `${beatMeta.staffName} · ${beatMeta.beatNo}`,
        pincodeManagerContact: beatMeta.staffContact,
        serviceType: storeProd?.codEligible === false ? 'Doorstep Service Pickup' : 'Speed Post COD',
        status: 'PENDING_PICKUP',
        codAmount:
          categoryMode === 'LOCAL_B2B_VENDOR' ? retailOrderMetrics.totalQuote : basePrice * retailQty,
        remarks: `Ref #${inquiry.ticketNumber} · Dynamic Product Page (PIN ${checkPincode})`,
      });
      barcode = dispatch.speedPostBarcode;
    }

    setSubmittedRef({
      ticket: inquiry.ticketNumber,
      barcode,
      summary: reqText,
    });
    setCustNote('');
  };

  const whatsappInquiryHref = `https://api.whatsapp.com/send?phone=${targetWhatsapp}&text=${encodeURIComponent(
    `Namaste ${beatMeta.staffName} (${getPincodeHub(checkPincode).officeName} · ${beatNo}),\n` +
      `Order inquiry for *${title}* (${codeOrSku}):\n` +
      (categoryMode === 'BANKING_FINANCE'
        ? `Target Amount: ₹${calcAmount.toLocaleString('en-IN')} (${bankingProjection.badge})\n`
        : categoryMode === 'LOCAL_B2B_VENDOR'
        ? `Store: ${storeProd?.vendorName}\nQty: ${retailOrderMetrics.qty} · Total: ₹${retailOrderMetrics.totalQuote.toLocaleString('en-IN')}\n`
        : `Qty: ${retailQty} · Total: ₹${(basePrice * retailQty).toLocaleString('en-IN')} (Speed Post Tracking)\n`) +
      `Customer: ${custName || 'Citizen'} · Ref: ${submittedRef?.ticket || 'Instant Inquiry'}`
  )}`;

  const categoryBannerClass =
    categoryMode === 'BANKING_FINANCE'
      ? 'from-slate-950 via-emerald-950 to-slate-900'
      : categoryMode === 'LOCAL_B2B_VENDOR'
      ? 'from-slate-950 via-amber-950 to-red-950'
      : 'from-slate-950 via-red-950 to-indigo-950';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10" id="dynamic-product-page">
      {/* Top Breadcrumb Navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => (onBack ? onBack() : navigate('/'))}
            className="text-red-700 hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Storefront</span>
          </button>
          <span aria-hidden="true">/</span>
          <span className="text-slate-500">
            {categoryMode === 'BANKING_FINANCE'
              ? 'Banking & Financial Services'
              : categoryMode === 'LOCAL_B2B_VENDOR'
              ? 'Verified Brand & Store Catalog'
              : 'Retail & Sovereign Merchandise'}
          </span>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900 font-black truncate max-w-[260px] sm:max-w-md">{title}</span>
        </div>

        <div className="text-xs font-mono font-bold text-slate-600 tabular-nums">
          SKU / Code: {codeOrSku}
        </div>
      </div>

      {/* Category-Adaptive Hero Banner */}
      <section className={`rounded-3xl bg-gradient-to-r ${categoryBannerClass} text-white p-6 sm:p-8 shadow-xl`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex flex-wrap items-center gap-2">
              {categoryMode === 'BANKING_FINANCE' && (
                <>
                  <Landmark size={15} />
                  <span>Government of India Sovereign Guarantee · Department of Posts</span>
                </>
              )}
              {categoryMode === 'RETAIL_MERCHANDISE' && (
                <>
                  <Truck size={15} />
                  <span>Official Counter Merchandise · Speed Post Trackable Delivery</span>
                </>
              )}
              {categoryMode === 'LOCAL_B2B_VENDOR' && (
                <>
                  {isBrandStore ? <Building2 size={15} /> : <Store size={15} />}
                  <span>
                    {isBrandStore
                      ? `Official Brand Store · ${storeProd?.brandName || matchedVendorStore?.brandName}`
                      : `Verified Store Partner · Express Delivery (PIN ${checkPincode})`}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
              {title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">{description}</p>

            {/* Category-Specific Key Highlights Strip */}
            {categoryMode === 'BANKING_FINANCE' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                  <div className="text-slate-300">Official Interest / Bonus</div>
                  <div className="font-black text-amber-300 text-sm mt-0.5 tabular-nums">
                    {scheme?.interestRateOrBonus || storeProd?.commissionRate || 'Zero Balance'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                  <div className="text-slate-300">Tax Exemption Status</div>
                  <div className="font-bold text-emerald-300 mt-0.5">
                    {scheme?.taxBenefits || 'Section 80C / EEE Eligible'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                  <div className="text-slate-300">Tenure &amp; Limit</div>
                  <div className="font-bold text-white mt-0.5 tabular-nums">
                    {scheme?.tenure || 'Instant Paperless e-KYC'}
                  </div>
                </div>
              </div>
            )}

            {categoryMode === 'RETAIL_MERCHANDISE' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                  <div className="text-slate-300">Official Retail Price</div>
                  <div className="font-black text-amber-300 text-lg mt-0.5 tabular-nums">
                    {basePrice === 0 ? 'Official Fee' : `₹${basePrice}`}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                  <div className="text-slate-300">Speed Post Tracking Badge</div>
                  <div className="font-mono font-bold text-emerald-300 mt-0.5">
                    ED324009···IN (Live SMS)
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                  <div className="text-slate-300">Dispatch Hub</div>
                  <div className="font-bold text-white mt-0.5">Dadabari S.O. · Same/Next Day</div>
                </div>
              </div>
            )}

            {categoryMode === 'LOCAL_B2B_VENDOR' && storeProd && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                  <div className="text-slate-300">
                    {isBrandStore ? 'Brand Store Franchise' : 'Verified Local Merchant'}
                  </div>
                  <div className="font-black text-amber-300 mt-0.5 truncate">
                    {storeProd.vendorName || storeProd.staffName}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                  <div className="text-slate-300">Serviceable Kota PINs</div>
                  <div className="font-mono font-bold text-white mt-0.5">
                    {(productServiceability?.serviceablePincodes || [storeProd.pincode || '324009']).join(', ')}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                  <div className="text-slate-300">Offer Price &amp; Savings</div>
                  <div className="font-mono font-black text-emerald-300 mt-0.5 tabular-nums">
                    ₹{storeProd.price} Offer Price · Verified Stock
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Media Frame */}
          <div className="lg:col-span-5">
            {scheme ? (
              <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-white">
                <SchemePosterArtwork
                  code={scheme.code}
                  name={scheme.name}
                  rateHighlight={scheme.interestRateOrBonus}
                  categoryLabel={scheme.category}
                />
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-slate-900">
                <img
                  src={storeProd?.thumbnailUrl || DEFAULT_VERTICAL_THUMBNAILS[storeProd!.vertical]}
                  alt={title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Category-Tailored Interactive Body + Instant Lead/Order Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Category-Adaptive Configurator / Calculator / Specs */}
        <div className="lg:col-span-7 space-y-6">
          {/* A. BANKING & FINANCIAL SERVICES TEMPLATE */}
          {categoryMode === 'BANKING_FINANCE' && (
            <>
              <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-5 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Calculator size={18} className="text-amber-400" />
                    <h2 className="text-base font-black">
                      Interactive Interest &amp; Tax-Free Return Calculator
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-emerald-300 font-bold">
                    Sovereign Rate Simulator
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{bankingProjection.inputLabel}</span>
                    <span className="text-xl font-black text-amber-400 tabular-nums font-mono">
                      ₹{calcAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={scheme?.code === 'SCSS' ? 3000000 : 1500000}
                    step={10000}
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-xs text-slate-400">Total Principal Invested</div>
                      <div className="text-xl font-black text-white tabular-nums mt-1">
                        ₹{bankingProjection.principal.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/30">
                      <div className="text-xs text-emerald-200">{bankingProjection.badge}</div>
                      <div className="text-xl font-black text-emerald-300 tabular-nums mt-1">
                        ₹{bankingProjection.maturity.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <span>Government Sovereign Guarantee &amp; Tax Benefits</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  100% principal and interest backed by the Sovereign Guarantee of the Government of India under the Ministry of Finance &amp; Department of Posts. Accounts are portable across all 1.65 Lakh+ post offices nationwide and can be funded digitally via IPPB.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900 mb-1.5">Key Highlights</div>
                    <ul className="space-y-1.5 text-slate-600">
                      {(scheme?.keyBenefits || storeProd?.features || []).map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 mb-1.5">Eligibility &amp; KYC</div>
                    <ul className="space-y-1.5 text-slate-600">
                      {(scheme?.requiredDocuments || [
                        'Aadhaar Card & PAN Card (e-KYC supported)',
                        'Passport size photographs',
                        'IPPB Zero-Balance Sweep Linkage',
                      ]).map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <UserCheck size={14} className="text-red-700 shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* B. RETAIL & MERCHANDISE TEMPLATE */}
          {categoryMode === 'RETAIL_MERCHANDISE' && (
            <>
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-red-700">
                      Official Sovereign Retail &amp; Speed Post Fulfillment
                    </div>
                    <h2 className="text-lg font-black text-slate-900 mt-0.5">
                      Select Quantity &amp; Verify Official Counter Pricing
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                      {basePrice === 0 ? 'Official Service' : `₹${(Number(basePrice * retailQty) || 0).toLocaleString('en-IN')}`}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold">
                      Zero Hidden Fees · Dadabari S.O. Official Rate
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 mr-2">Select Pack Qty:</span>
                  {[1, 2, 5, 10].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setRetailQty(q)}
                      className={`px-4 py-2 rounded-xl text-xs font-black border transition cursor-pointer tabular-nums ${
                        retailQty === q
                          ? 'bg-red-700 text-white border-red-700'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {q} {q === 1 ? 'Unit' : 'Units'}
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 text-white grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="text-slate-400">Speed Post Tracking</div>
                    <div className="font-mono font-black text-amber-300 mt-0.5">ED324009***IN</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Delivery SLA</div>
                    <div className="font-bold text-white mt-0.5">Same / Next Beat Dispatch</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Authenticity Seal</div>
                    <div className="font-bold text-emerald-300 mt-0.5">100% India Post Counter</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="text-xs font-black text-slate-900 uppercase">
                    Product Specifications &amp; Delivery Inclusions
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {(scheme?.keyBenefits || storeProd?.features || []).map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* C. VERIFIED STORE / BRAND PRODUCT TEMPLATE */}
          {categoryMode === 'LOCAL_B2B_VENDOR' && storeProd && (
            <>
              {/* Store Attribution Header */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      {isBrandStore
                        ? 'India Post Bulk Customer · Speed Post COD Checkout'
                        : 'Verified Postal Partner · Express Delivery'}
                    </div>
                    <h2 className="text-lg font-black text-slate-900">
                      {matchedVendorStore?.storeName || storeProd.vendorName || storeProd.staffName}
                    </h2>
                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                      <span>Stocking Hub: <strong>{getPincodeHub(checkPincode).localStockingPartner}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>{getPincodeHub(checkPincode).officeName} (PIN {checkPincode})</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/brand/${resolveBrandSlug(storeProd.brandName || storeProd.vendorName || storeProd.title)}`}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl text-xs font-black transition flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Store size={14} />
                      <span>Visit Official Brand Store</span>
                    </Link>
                    {matchedVendorStore && (userProfile || onOpenVendorProfile) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenVendorProfile) onOpenVendorProfile(matchedVendorStore.id);
                          else navigate(`/vendor-ecosystem/${matchedVendorStore.id}`);
                        }}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap"
                      >
                        Admin Profile
                      </button>
                    )}
                  </div>
                </div>

                {/* Clean Retail Quantity Configurator */}
                <div className="space-y-3">
                  <div className="text-xs font-black text-slate-900 uppercase">
                    Select Quantity · India Post Speed Post COD Pricing
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {[1, 2, 3, 5].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setRetailQty(q)}
                        className={`px-4 py-2 rounded-xl border text-xs font-black transition cursor-pointer tabular-nums ${
                          retailQty === q
                            ? 'bg-red-700 text-white border-red-700'
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {q} {q === 1 ? 'Unit' : 'Units'}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-300">
                        {retailOrderMetrics.qty} {retailOrderMetrics.qty === 1 ? 'Unit' : 'Units'} × ₹{retailOrderMetrics.unitRate.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xl font-black text-amber-400 font-mono tabular-nums mt-0.5">
                        Order Total: ₹{retailOrderMetrics.totalQuote.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-slate-400 flex items-center justify-end gap-1">
                        <Wallet size={13} className="text-emerald-400" />
                        <span>Doorstep Speed Post COD</span>
                      </div>
                      <div className="font-mono font-black text-emerald-400 tabular-nums mt-0.5">
                        Flat ₹15 Beat Delivery
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Looking for bulk or institutional orders?</span>
                    <Link to="/b2b-partner" className="font-bold text-red-700 hover:underline">
                      Go to B2B &amp; Partner Portal →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Hub & Delivery Mapping Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <MapPin size={17} className="text-red-700" />
                  <span>Regional Delivery Hub &amp; Stocking Partner Mapping</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-slate-500">Assigned Regional Post Office</div>
                    <div className="font-black text-slate-900">
                      {getPincodeHub(checkPincode).officeName} (PIN {checkPincode})
                    </div>
                    <div className="text-slate-600">Zone: {getPincodeHub(checkPincode).name}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-slate-500">Local Stocking Partner &amp; SLA</div>
                    <div className="font-black text-slate-900">
                      {getPincodeHub(checkPincode).localStockingPartner}
                    </div>
                    <div className="font-mono text-emerald-700 font-bold">
                      {getPincodeHub(checkPincode).slaMinutes} Min SLA ·{' '}
                      {storeProd.codEligible ? 'Speed Post COD Active' : 'Doorstep Service'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right 5 Cols: Instant Action / Lead Capture / Order Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-red-700">
              {categoryMode === 'BANKING_FINANCE'
                ? 'Instant Sovereign Lead Hook'
                : 'Express Doorstep COD Order & Tracking'}
            </div>
            <h3 className="text-base font-black text-slate-900 mt-0.5">
              {categoryMode === 'BANKING_FINANCE'
                ? 'Request Doorstep KYC / Account Opening'
                : `Confirm Dispatch via ${getPincodeHub(checkPincode).officeName}`}
            </h3>
          </div>

          {productServiceability && categoryMode !== 'BANKING_FINANCE' && (
            <div
              className={`p-3 rounded-2xl border text-xs space-y-2 ${
                productServiceability.isServiceable
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold flex items-center gap-1.5">
                  {productServiceability.isServiceable ? (
                    <CheckCircle2 size={14} className="text-emerald-700 shrink-0" />
                  ) : (
                    <AlertCircle size={14} className="text-rose-700 shrink-0" />
                  )}
                  <span>Delivery PINcode Check</span>
                </span>
                <select
                  value={checkPincode}
                  onChange={(e) => {
                    const nextPin = e.target.value;
                    setCheckPincode(nextPin);
                    const hub = getPincodeHub(nextPin);
                    setCustAddress(`${hub.officeName} · ${hub.name} PIN ${hub.pincode}`);
                  }}
                  className="px-2 py-1 rounded-lg bg-white border border-slate-300 font-mono font-bold text-slate-900 text-[11px]"
                >
                  {PINCODE_OFFICE_HUBS.map((z) => (
                    <option key={z.pincode} value={z.pincode}>
                      PIN {z.pincode} ({z.name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-[11px] font-semibold">
                {productServiceability.reason} · Radius {productServiceability.deliveryRadiusKm} km
              </div>
            </div>
          )}

          {submittedRef ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-center">
              <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
              <div className="text-sm font-black text-emerald-950">
                Request Registered! Ref #{submittedRef.ticket}
              </div>
              {submittedRef.barcode && (
                <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-xs">
                  <div className="text-slate-500">Assigned Speed Post Barcode</div>
                  <div className="font-mono font-black text-red-700 text-sm">{submittedRef.barcode}</div>
                </div>
              )}
              <p className="text-xs text-emerald-900">
                Routed to <strong>{beatMeta.staffName}</strong> ({beatMeta.beatNo}).
              </p>
              <a
                href={whatsappInquiryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2"
              >
                <MessageCircle size={15} />
                <span>Send Confirmation on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setSubmittedRef(null)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitForm} className="space-y-3 text-xs">
              {formErr && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold">
                  {formErr}
                </div>
              )}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name / Shop Name *</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">10-Digit Mobile / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={custMobile}
                  onChange={(e) => setCustMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="e.g. 9829012345"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Address / Colony &amp; PIN</label>
                <input
                  type="text"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Additional Notes / Quantity</label>
                <input
                  type="text"
                  value={custNote}
                  onChange={(e) => setCustNote(e.target.value)}
                  placeholder={
                    categoryMode === 'BANKING_FINANCE'
                      ? 'Preferred doorstep KYC time...'
                      : 'Custom packing or GST billing note...'
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <button
                type="submit"
                disabled={Boolean(productServiceability && !productServiceability.isServiceable && categoryMode !== 'BANKING_FINANCE')}
                className={`w-full py-3 px-4 rounded-xl font-black transition flex items-center justify-center gap-2 ${
                  productServiceability && !productServiceability.isServiceable && categoryMode !== 'BANKING_FINANCE'
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-red-700 hover:bg-red-800 text-white cursor-pointer'
                }`}
              >
                {categoryMode === 'BANKING_FINANCE' ? <Phone size={15} /> : <ShoppingBag size={15} />}
                <span>
                  {productServiceability && !productServiceability.isServiceable && categoryMode !== 'BANKING_FINANCE'
                    ? `Out of Delivery Zone (PIN ${checkPincode})`
                    : categoryMode === 'BANKING_FINANCE'
                    ? 'Book Doorstep Sovereign KYC Visit'
                    : 'Confirm Speed Post COD Order'}
                </span>
                <ArrowRight size={14} />
              </button>

              <a
                href={whatsappInquiryHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                <MessageCircle size={15} className="text-emerald-600" />
                <span>Direct WhatsApp Inquiry ({beatMeta.staffName.split(' ')[0]})</span>
              </a>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
