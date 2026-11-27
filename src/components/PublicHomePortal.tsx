import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Award,
  CheckCircle2,
  ArrowRight,
  Phone,
  Search,
  ChevronLeft,
  ChevronRight,
  Share2,
  Copy,
  Check,
  X,
  MessageCircle,
  Send,
  Globe,
  Layers,
  Store,
  Landmark,
  Truck,
  Package,
  Building2,
  MapPin,
  UserCheck,
  ShoppingCart,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Wallet,
  ShieldCheck,
  Navigation,
  BookOpen,
} from 'lucide-react';
import { POSTAL_PRODUCTS } from '../data/productsData';
import {
  ProductDefinition,
  LogisticsDispatchOrder,
  IndiaPostBulkCustomer,
  IndiaPostPromotedProduct,
  PublicInquiryStatusResult,
} from '../types/models';
import { customerService } from '../services/customerService';
import { aiCommercialVerificationService } from '../services/aiCommercialVerificationService';
import { indiaPostBulkShowcaseService } from '../services/indiaPostBulkShowcaseService';
import PublicStorefrontSection, { StorefrontCartPayload } from './PublicStorefrontSection';
import SchemePosterArtwork from './common/SchemePosterArtwork';
import DynamicProductPageView from './common/DynamicProductPageView';
import { safeStorage } from '../utils/safeStorage';
import {
  PINCODE_OFFICE_HUBS,
  pincodeOperationsService,
  detectNearestPincodeHub,
  getPincodeHub,
  CategoryInventoryMap,
} from '../services/pincodeOperationsService';
import { OFFICIAL_BRAND_STORES } from '../services/brandDirectoryService';
import { cartRecoveryService, CartRecoverySession } from '../services/cartRecoveryService';
import { useAuth } from './auth/FirebaseAuthProvider';
import { customerAuthService } from '../services/customerAuthService';

import imgSlideSsy from '../assets/images/scheme_ssy_sukanya_1794734839476.jpg';
import imgSlidePli from '../assets/images/scheme_pli_protection_1794734838755.jpg';
import imgSlideScss from '../assets/images/scheme_scss_senior_1794734838931.jpg';
import imgSlideIppb from '../assets/images/hero_postal_banking_1791904267944.jpg';
import imgSlideLogistics from '../assets/images/prod_b2b_cod_logistics_1794734840043.jpg';
import imgCatDeposits from '../assets/images/scheme_ppf_nsc_wealth_1794734840742.jpg';
import imgCatCourier from '../assets/images/store_logistics_courier_1794731362561.jpg';
import imgCatPhilately from '../assets/images/prod_mystamp_philately_1794734841690.jpg';
import imgCatB2b from '../assets/images/prod_b2b_kirana_wholesale_1794734842973.jpg';
import imgDigitalDocs from '../assets/images/store_digital_documents_1794731363970.jpg';
import imgGangajal from '../assets/images/prod_gangajal_sacred_1794734840915.jpg';
import imgHandloom from '../assets/images/store_kota_handloom_1794731364865.jpg';
import imgPharmaWellness from '../assets/images/prod_b2b_pharma_wellness_1794734843342.jpg';
import imgStationery from '../assets/images/prod_b2b_stationery_coaching_1794734844056.jpg';

import StickyTopNavbar from './public/StickyTopNavbar';
import SlideOutDrawerMenu from './public/SlideOutDrawerMenu';
import LiveUrgentDesk from './public/LiveUrgentDesk';
import ExclusiveTopSellers from './public/ExclusiveTopSellers';
import {
  LocationVicinityModal,
  KOTA_VICINITY_ZONES,
  VicinityZone,
  toVicinityZone,
} from './public/LocationVicinityHub';
import LocalServiceEcosystemCards from './public/LocalServiceEcosystemCards';
import CitizenDocumentationDesk from './public/CitizenDocumentationDesk';
import StoreFooter from './public/StoreFooter';
import CategoryCatalogRow, { CatalogRowItem } from './public/CategoryCatalogRow';
import {
  SupportedLanguage,
  getInitialLanguage,
  setStoredLanguage,
  translate,
} from '../utils/localization';

export interface PublicHomePortalProps {
  isStandalone?: boolean;
  onToggleStandalone?: () => void;
  onOpenStaffLogin?: () => void;
}

export type UnifiedCategoryId =
  | 'ALL'
  | 'SAVINGS_ACCOUNTS'
  | 'RECURRING_DEPOSITS'
  | 'PLI_SCHEMES'
  | 'IPPB_LOAN_INSURANCE'
  | 'LOGISTICS_COURIER'
  | 'PHILATELY_GANGAJAL'
  | 'B2B_MERCHANTS'
  | 'SKILL_ACADEMY';

export type CategoryFilterPillId =
  | 'all'
  | 'supermarket'
  | 'bakery_dairy'
  | 'medical'
  | 'sabji_mandi'
  | 'ev'
  | 'apparel'
  | 'electronics'
  | 'footwear'
  | 'appliances'
  | 'laundry_events';

export type PostOfficeBankingSubTab =
  | 'ALL_PO'
  | 'SAVINGS_SSY_SCSS'
  | 'INSURANCE_PLI'
  | 'IPPB_QR_COVER'
  | 'DLC_CELC_EMITRA'
  | 'MYSTAMP_GANGAJAL';

export interface HighMarginProductItem {
  id: string;
  sku: string;
  title: string;
  brand: string;
  categoryTag: string;
  mrpPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  marginAmount: number;
  marginPercent: number;
  imageSrc: string;
  description: string;
  features: string[];
}

export interface HighDemandCategoryTab {
  id: string;
  name: string;
  shortLabel: string;
  subtitle: string;
  marginBadge: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  imageSrc: string;
  gradient: string;
  items: HighMarginProductItem[];
}

interface UnlockedVisitor {
  name: string;
  mobile: string;
  locality: string;
  beatNo: string;
  lastTicketNumber?: string;
}

interface CartItem extends StorefrontCartPayload {
  quantity: number;
}

const SESSION_UNLOCK_KEY = 'india_post_public_visitor_unlocked_v1';

const PAN_INDIA_CIRCLES: { label: string; regionCode: string }[] = [
  { label: 'Kota & Baran Division Hubs (13 PIN Codes)', regionCode: 'Kota-Baran' },
  { label: 'All-India Citizen Inquiry (Any Post Office / PIN)', regionCode: 'Pan-India' },
  { label: 'North India Circle (Rajasthan, Delhi, UP, Punjab, Haryana)', regionCode: 'North Circle' },
  { label: 'West India Circle (Maharashtra, Gujarat, MP, Chhattisgarh)', regionCode: 'West Circle' },
  { label: 'South India Circle (Karnataka, Tamil Nadu, Telangana, AP, Kerala)', regionCode: 'South Circle' },
  { label: 'East & North-East Circle (West Bengal, Bihar, Odisha, Assam)', regionCode: 'East Circle' },
];

interface HeroSlide {
  id: string;
  tabLabel: string;
  brandName: string;
  vendorPromoTag: string;
  discountTag: string;
  heroGradient: string;
  productCode: string;
  targetCategory: UnifiedCategoryId;
  scrollTargetId?: string;
  featuredSku: string;
  featuredTitle: string;
  featuredPrice: number;
  featuredMrp: number;
  featuredBeatNo: string;
  imageSrc: string;
  headline: string;
  subtitle: string;
  ctaCategoryLabel: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-bulk-showcase',
    tabLabel: 'Bulk Customer Showcase',
    brandName: 'India Post · Bulk Customer & BNPL Hub',
    vendorPromoTag: 'Verified India Post Bulk Mail & Parcel Partners',
    discountTag: 'Pan-India Speed Post COD & BNPL',
    heroGradient: 'from-red-950 via-red-900 to-slate-950',
    productCode: 'DNK_PARCEL',
    targetCategory: 'B2B_MERCHANTS',
    scrollTargetId: 'bulk-customer-showcase',
    featuredSku: 'INP-BULK-STUDY-1299',
    featuredTitle: 'Competitive Exam Study Material Bundle (5 kg Business Parcel)',
    featuredPrice: 1299,
    featuredMrp: 1650,
    featuredBeatNo: 'Beat 14',
    imageSrc: imgStationery,
    headline: 'India Post Official Storefront & Bulk Customer Product Showcase',
    subtitle:
      'Promote verified Bulk Customer products across Kota & Baran PIN hubs and Pan-India Speed Post routes with barcode tracking, BNPL contracts, and doorstep pickup.',
    ctaCategoryLabel: 'Explore Bulk Customer Showcase',
  },
  {
    id: 'slide-ssy',
    tabLabel: 'Sukanya Samriddhi (8.2%)',
    brandName: 'India Post · National Small Savings',
    vendorPromoTag: '100% Sovereign Government of India Guarantee',
    discountTag: '8.2% p.a. · EEE Tax-Free',
    heroGradient: 'from-rose-950 via-red-900 to-slate-950',
    productCode: 'SSA',
    targetCategory: 'SAVINGS_ACCOUNTS',
    scrollTargetId: 'post-office-banking-store',
    featuredSku: 'GOV-SSY-82-MIN250',
    featuredTitle: 'Sukanya Samriddhi Yojana (SSY) · Girl Child Sovereign Account',
    featuredPrice: 250,
    featuredMrp: 250,
    featuredBeatNo: 'Beat 2',
    imageSrc: imgSlideSsy,
    headline: 'Secure Your Daughter’s Education & Future with 8.2% Tax-Free Returns',
    subtitle:
      'Open Sukanya Samriddhi Yojana at your nearest Post Office or request doorstep beat assistance with official passbook delivery.',
    ctaCategoryLabel: 'View Post Office Schemes',
  },
  {
    id: 'slide-pli',
    tabLabel: 'PLI / RPLI Insurance',
    brandName: 'India Post · Postal Life Insurance (Est. 1884)',
    vendorPromoTag: 'Highest Bonus & Lowest Premium Life Cover',
    discountTag: '₹52 – ₹76 Bonus / ₹1,000',
    heroGradient: 'from-slate-950 via-red-950 to-amber-950',
    productCode: 'PLI_SURAKSHA',
    targetCategory: 'PLI_SCHEMES',
    scrollTargetId: 'post-office-banking-store',
    featuredSku: 'PLI-SURAKSHA-DOC-199',
    featuredTitle: 'PLI Suraksha & Santosh · Sovereign Life Insurance Proposal',
    featuredPrice: 199,
    featuredMrp: 299,
    featuredBeatNo: 'Beat 2',
    imageSrc: imgSlidePli,
    headline: 'Postal Life Insurance up to ₹50 Lakh with Sovereign Bonus Protection',
    subtitle:
      'Section 80C tax benefit, policy loan facility after 3 years, and direct Beat Officer KYC assistance across urban and rural PINs.',
    ctaCategoryLabel: 'Compare PLI & RPLI Plans',
  },
  {
    id: 'slide-ippb',
    tabLabel: 'IPPB & ₹10L Cover',
    brandName: 'India Post Payments Bank (IPPB)',
    vendorPromoTag: 'Doorstep AePS, Zero-Balance Banking & Merchant QR',
    discountTag: '₹10L Accident Cover at ₹399/yr',
    heroGradient: 'from-indigo-950 via-slate-900 to-red-950',
    productCode: 'IPPB_GPA',
    targetCategory: 'IPPB_LOAN_INSURANCE',
    scrollTargetId: 'post-office-banking-store',
    featuredSku: 'IPPB-ACCIDENT-399',
    featuredTitle: 'IPPB Sovereign · ₹10 Lakh Accidental Insurance Cover (1 Year)',
    featuredPrice: 399,
    featuredMrp: 549,
    featuredBeatNo: 'Beat 2',
    imageSrc: imgSlideIppb,
    headline: 'Paperless Biometric IPPB Banking, Merchant QR & ₹10 Lakh Group Cover',
    subtitle:
      'Instant biometric onboarding by your Beat Postman, AePS cash withdrawal at home, Jeevan Pramaan DLC, and Child Aadhaar CELC.',
    ctaCategoryLabel: 'Book IPPB & Citizen Services',
  },
  {
    id: 'slide-scss',
    tabLabel: 'Senior Citizen (8.2%)',
    brandName: 'India Post · Senior Citizen Savings (SCSS)',
    vendorPromoTag: 'Quarterly Sovereign Pension Payout',
    discountTag: '8.2% p.a. · Up to ₹30 Lakh',
    heroGradient: 'from-amber-950 via-slate-900 to-red-950',
    productCode: 'SCSS',
    targetCategory: 'SAVINGS_ACCOUNTS',
    scrollTargetId: 'post-office-banking-store',
    featuredSku: 'GOV-SCSS-82-QUARTERLY',
    featuredTitle: 'Senior Citizen Savings Scheme (SCSS) · Quarterly Pension Kit',
    featuredPrice: 1000,
    featuredMrp: 1000,
    featuredBeatNo: 'Beat 2',
    imageSrc: imgSlideScss,
    headline: 'Guaranteed 8.2% Quarterly Pension Payout for Senior Citizens',
    subtitle:
      'Deposit up to ₹30 Lakh with sovereign safety, Section 80C eligibility, and auto-credit straight into your Post Office or IPPB savings account.',
    ctaCategoryLabel: 'Explore Retirement Schemes',
  },
];

interface PostOfficeBankingCardItem {
  id: string;
  subTab: Exclude<PostOfficeBankingSubTab, 'ALL_PO'>;
  productCode: string;
  sku: string;
  title: string;
  badge: string;
  officialRateHighlight: string;
  mrpPrice: number;
  retailPrice: number;
  beatNo: string;
  imageSrc: string;
  description: string;
}

const POST_OFFICE_BANKING_TABS: {
  id: PostOfficeBankingSubTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: 'ALL_PO', label: 'All Official Services', icon: Landmark },
  { id: 'SAVINGS_SSY_SCSS', label: 'SSY, PPF & SCSS Savings', icon: Wallet },
  { id: 'INSURANCE_PLI', label: 'PLI / RPLI Insurance', icon: ShieldCheck },
  { id: 'IPPB_QR_COVER', label: 'IPPB, QR & ₹10L Cover', icon: Shield },
  { id: 'DLC_CELC_EMITRA', label: 'DLC, CELC & Citizen Desk', icon: UserCheck },
  { id: 'MYSTAMP_GANGAJAL', label: 'MyStamp, Gangajal & DNK', icon: Package },
];

const POST_OFFICE_BANKING_OFFERINGS: PostOfficeBankingCardItem[] = [
  {
    id: 'po-ssy-01',
    subTab: 'SAVINGS_SSY_SCSS',
    productCode: 'SSA',
    sku: 'GOV-SSY-82-MIN250',
    title: 'Sukanya Samriddhi Yojana (SSY) · Girl Child Sovereign Account',
    badge: 'Govt Small Savings · EEE Tax-Free',
    officialRateHighlight: '8.2% p.a.',
    mrpPrice: 250,
    retailPrice: 250,
    beatNo: 'Beat 2',
    imageSrc: imgSlideSsy,
    description:
      '100% tax-free sovereign savings for daughters aged 0–10 yrs with passbook & Beat assistance.',
  },
  {
    id: 'po-scss-02',
    subTab: 'SAVINGS_SSY_SCSS',
    productCode: 'SCSS',
    sku: 'GOV-SCSS-82-QUARTERLY',
    title: 'Senior Citizen Savings Scheme (SCSS) · 60+ Quarterly Pension',
    badge: 'Govt Pension Deposit',
    officialRateHighlight: '8.2% p.a. Quarterly',
    mrpPrice: 1000,
    retailPrice: 1000,
    beatNo: 'All Beats',
    imageSrc: imgSlideScss,
    description:
      'Retirement deposit scheme up to ₹30 Lakh for senior citizens with quarterly auto-credit.',
  },
  {
    id: 'po-ppf-03',
    subTab: 'SAVINGS_SSY_SCSS',
    productCode: 'PPF',
    sku: 'GOV-PPF-71-EEE',
    title: 'Public Provident Fund (PPF) & Monthly Income (MIS 7.4%)',
    badge: 'Sovereign Long-Term Wealth',
    officialRateHighlight: '7.1% – 7.4% p.a.',
    mrpPrice: 500,
    retailPrice: 500,
    beatNo: 'Beat 2',
    imageSrc: imgCatDeposits,
    description:
      'Court-attachment immune PPF compounding or steady 7.4% monthly MIS dividend into IPPB.',
  },
  {
    id: 'po-pli-04',
    subTab: 'INSURANCE_PLI',
    productCode: 'PLI_SURAKSHA',
    sku: 'PLI-SURAKSHA-DOC-199',
    title: 'PLI Suraksha & Santosh · ₹50L Sovereign Life Insurance',
    badge: 'Est. 1884 Govt Life Cover',
    officialRateHighlight: '₹52–₹76 / ₹1,000 Bonus',
    mrpPrice: 299,
    retailPrice: 199,
    beatNo: 'All Beats',
    imageSrc: imgSlidePli,
    description:
      'Lowest premium & highest bonus Govt life cover with Sec 80C rebate and Beat Officer KYC.',
  },
  {
    id: 'po-rpli-05',
    subTab: 'INSURANCE_PLI',
    productCode: 'RPLI_GRAM_SANTOSH',
    sku: 'RPLI-GRAM-149',
    title: 'RPLI Gram Suraksha & Gram Santosh · Rural & Family Cover',
    badge: 'Rural & Semi-Urban Life Cover',
    officialRateHighlight: '₹60–₹65 / ₹1,000 Bonus',
    mrpPrice: 220,
    retailPrice: 149,
    beatNo: 'Beat 2',
    imageSrc: imgSlidePli,
    description:
      'Affordable sovereign endowment & whole-life policy up to ₹10L for rural & urban families.',
  },
  {
    id: 'po-ippb-06',
    subTab: 'IPPB_QR_COVER',
    productCode: 'IPPB_BANKING',
    sku: 'IPPB-DIGI-ACC-0',
    title: 'IPPB Zero-Balance Digital Savings & Doorstep Merchant QR',
    badge: 'India Post Payments Bank',
    officialRateHighlight: '₹0 Min Bal · UPI & AePS',
    mrpPrice: 150,
    retailPrice: 99,
    beatNo: 'Beat 2',
    imageSrc: imgSlideIppb,
    description:
      'Paperless biometric IPPB account opening with merchant UPI QR standee & doorstep AePS cash delivery.',
  },
  {
    id: 'po-gpa-07',
    subTab: 'IPPB_QR_COVER',
    productCode: 'IPPB_GPA',
    sku: 'IPPB-ACCIDENT-399',
    title: 'IPPB Sovereign · ₹10 Lakh Accidental Insurance Cover (1 Year)',
    badge: 'IPPB GPA Protection',
    officialRateHighlight: '₹10L Cover @ ₹399/yr',
    mrpPrice: 549,
    retailPrice: 399,
    beatNo: 'Beat 2',
    imageSrc: imgSlideIppb,
    description:
      'Instant paperless ₹10L accidental death, disability & ₹1L hospitalisation cover in 2 minutes.',
  },
  {
    id: 'po-dlc-08',
    subTab: 'DLC_CELC_EMITRA',
    productCode: 'IPPB_DOORSTEP',
    sku: 'GOV-DLC-AEPS-70',
    title: 'Jeevan Pramaan Biometric DLC & Doorstep AePS Cash',
    badge: 'Pensioner & Banking KYC',
    officialRateHighlight: '₹70 Govt Doorstep DLC',
    mrpPrice: 100,
    retailPrice: 70,
    beatNo: 'Beat 2',
    imageSrc: imgDigitalDocs,
    description:
      'Submit annual Pensioner Life Certificate from home or withdraw cash via Aadhaar AePS.',
  },
  {
    id: 'po-celc-09',
    subTab: 'DLC_CELC_EMITRA',
    productCode: 'CELC_AADHAAR',
    sku: 'GOV-CELC-MOBILE-50',
    title: 'Child Aadhaar (0–5 Yrs CELC), Mobile Update & Citizen KYC',
    badge: 'UIDAI CELC & Citizen Desk',
    officialRateHighlight: 'Child Aadhaar FREE · ₹50',
    mrpPrice: 100,
    retailPrice: 50,
    beatNo: 'Beat 2',
    imageSrc: imgDigitalDocs,
    description:
      'Doorstep newborn Aadhaar enrolment, mobile number linking, PAN correction & e-Gras stamp deeds.',
  },
  {
    id: 'po-mystamp-10',
    subTab: 'MYSTAMP_GANGAJAL',
    productCode: 'MY_STAMP',
    sku: 'POST-MYSTAMP-300',
    title: 'India Post · MyStamp Custom Photo 12-Stamp Collector Sheet',
    badge: 'Official Philately Bureau',
    officialRateHighlight: '₹300 Official Sheet',
    mrpPrice: 350,
    retailPrice: 300,
    beatNo: 'Beat 2',
    imageSrc: imgCatPhilately,
    description:
      'Custom family portrait, wedding or corporate logo printed beside valid ₹5 India Post stamps.',
  },
  {
    id: 'po-gangajal-11',
    subTab: 'MYSTAMP_GANGAJAL',
    productCode: 'GANGAJAL',
    sku: 'POST-GANGAJAL-250ML',
    title: 'India Post · Sacred Gangotri Gangajal Sealed Bottle (250ml)',
    badge: 'Official India Post Counter',
    officialRateHighlight: '₹30 Official Price',
    mrpPrice: 40,
    retailPrice: 30,
    beatNo: 'Beat 2',
    imageSrc: imgGangajal,
    description:
      'Pure Gangotri Gangajal tamper-sealed at source with Beat doorstep COD delivery.',
  },
  {
    id: 'po-speedpost-12',
    subTab: 'MYSTAMP_GANGAJAL',
    productCode: 'DNK_PARCEL',
    sku: 'POST-SPEEDPOST-COD-95',
    title: 'Speed Post COD Packaging Box & Dak Ghar Niryat Booking',
    badge: 'India Post Official Dispatch',
    officialRateHighlight: '190+ Countries DNK',
    mrpPrice: 120,
    retailPrice: 95,
    beatNo: 'All Beats',
    imageSrc: imgCatCourier,
    description:
      'Tamper-proof corrugated Speed Post box, export PBE manifest & daily Beat commercial pickup.',
  },
];

function getSchemeUnifiedCategory(product: ProductDefinition): Exclude<UnifiedCategoryId, 'ALL'> {
  const code = product.code;
  if (code === 'SSA' || code === 'PPF' || code === 'MIS' || code === 'SCSS') {
    return 'SAVINGS_ACCOUNTS';
  }
  if (code === 'RD' || code === 'TD' || code === 'NSC' || code === 'KVP') {
    return 'RECURRING_DEPOSITS';
  }
  if (code.includes('PLI') || code.includes('RPLI')) {
    return 'PLI_SCHEMES';
  }
  if (code === 'MY_STAMP' || code === 'GANGAJAL') {
    return 'PHILATELY_GANGAJAL';
  }
  if (code === 'DNK_PARCEL') {
    return 'LOGISTICS_COURIER';
  }
  return 'IPPB_LOAN_INSURANCE';
}

export default function PublicHomePortal({
  onOpenStaffLogin,
}: PublicHomePortalProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  const [activePostOfficeTab, setActivePostOfficeTab] = useState<PostOfficeBankingSubTab>('ALL_PO');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk Customer & Promoted Products Showcase State
  const [bulkCustomers, setBulkCustomers] = useState<IndiaPostBulkCustomer[]>(() =>
    indiaPostBulkShowcaseService.getBulkCustomers(false)
  );
  const [promotedProducts, setPromotedProducts] = useState<IndiaPostPromotedProduct[]>(() =>
    indiaPostBulkShowcaseService.getPromotedProducts(false)
  );
  const [bulkPincodeScope, setBulkPincodeScope] = useState<'ALL' | 'ACTIVE'>('ALL');
  const [selectedBulkCategory, setSelectedBulkCategory] = useState<string>('ALL');
  const [selectedBulkCustomerId, setSelectedBulkCustomerId] = useState<string>('ALL');

  // Visitor Lead Capture & Unlock State
  const [unlockedVisitor, setUnlockedVisitor] = useState<UnlockedVisitor | null>(() =>
    safeStorage.getJSON<UnlockedVisitor | null>(SESSION_UNLOCK_KEY, null)
  );

  // Modals & Dynamic Page Inspection State
  const [inspectedScheme, setInspectedScheme] = useState<ProductDefinition | null>(null);
  const [leadGateTargetProduct, setLeadGateTargetProduct] = useState<ProductDefinition | null>(null);
  const [leadBulkTarget, setLeadBulkTarget] = useState<{
    productOrService: string;
    bulkCustomerName?: string;
    pincode?: string;
  } | null>(null);
  const [leadGateMode, setLeadGateMode] = useState<'KNOW_MORE' | 'QUICK_INQUIRY'>('QUICK_INQUIRY');
  const [shareModalProduct, setShareModalProduct] = useState<ProductDefinition | null>(null);

  // Lead Gate Form Inputs
  const [visitorName, setVisitorName] = useState(unlockedVisitor?.name || '');
  const [visitorMobile, setVisitorMobile] = useState(unlockedVisitor?.mobile || '');
  const [visitorLocality, setVisitorLocality] = useState(
    unlockedVisitor?.locality || PAN_INDIA_CIRCLES[0].label
  );
  const [preferredContact, setPreferredContact] = useState<'WhatsApp' | 'Phone Call' | 'Doorstep Visit'>('WhatsApp');
  const [inquiryNote, setInquiryNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [copiedProductCode, setCopiedProductCode] = useState<string | null>(null);
  const [leadBannerMessage, setLeadBannerMessage] = useState<string | null>(null);

  const { userProfile } = useAuth();

  // Cart, Speed Post COD Checkout, Abandonment Recovery & Tracker State
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    cartRecoveryService.getSharedCart<CartItem>()
  );
  const [recoverySession, setRecoverySession] = useState<CartRecoverySession | null>(() =>
    cartRecoveryService.getActiveSession()
  );
  const [smsRecoveryNotice, setSmsRecoveryNotice] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);

  // Cart Checkout Form State
  const [checkoutName, setCheckoutName] = useState(unlockedVisitor?.name || '');
  const [checkoutMobile, setCheckoutMobile] = useState(unlockedVisitor?.mobile || '');
  const [checkoutAddress, setCheckoutAddress] = useState(() => {
    const initialHub = getPincodeHub(pincodeOperationsService.getActivePincode());
    return `${initialHub.landmarks[0]}, PIN ${initialHub.pincode}`;
  });
  const [checkoutBeat, setCheckoutBeat] = useState('Beat 2');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [lastPlacedOrders, setLastPlacedOrders] = useState<LogisticsDispatchOrder[]>([]);

  // Sanitized Tracker Modal State (Ticket ID + Mobile verification)
  const [trackerMode, setTrackerMode] = useState<'INQUIRY' | 'SPEEDPOST'>('INQUIRY');
  const [trackRefInput, setTrackRefInput] = useState('');
  const [trackMobileInput, setTrackMobileInput] = useState('');
  const [inquiryLookupResult, setInquiryLookupResult] = useState<PublicInquiryStatusResult | null>(null);
  const [barcodeLookupInput, setBarcodeLookupInput] = useState('');
  const [barcodeMobileLast4, setBarcodeMobileLast4] = useState('');
  const [barcodeLookupResult, setBarcodeLookupResult] = useState<{
    searched: boolean;
    match: LogisticsDispatchOrder | null;
    error?: string;
  }>({ searched: false, match: null });

  // Language & Localization State
  const [lang, setLang] = useState<SupportedLanguage>(() => getInitialLanguage());
  const handleSelectLang = (newLang: SupportedLanguage) => {
    setLang(newLang);
    setStoredLanguage(newLang);
  };

  // Slide Drawer, 13-Pincode Hub State & Live Admin Inventory Status
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [isDetectingPincode, setIsDetectingPincode] = useState(false);
  const [isPincodeConfirmed, setIsPincodeConfirmed] = useState<boolean>(() =>
    pincodeOperationsService.hasConfirmedPincode()
  );
  const [showPincodePromptBar, setShowPincodePromptBar] = useState<boolean>(
    () => !pincodeOperationsService.hasConfirmedPincode()
  );
  const [activeVicinityZone, setActiveVicinityZone] = useState<VicinityZone>(() => {
    const pin = pincodeOperationsService.getActivePincode();
    return KOTA_VICINITY_ZONES.find((z) => z.pincode === pin) || toVicinityZone(getPincodeHub(pin));
  });
  const [inventoryMap, setInventoryMap] = useState<CategoryInventoryMap>(() =>
    pincodeOperationsService.getInventoryForPincode(pincodeOperationsService.getActivePincode())
  );

  const handleSelectPincodeValue = (pincode: string) => {
    pincodeOperationsService.setActivePincode(pincode);
    const hub = getPincodeHub(pincode);
    const zone = toVicinityZone(hub);
    setActiveVicinityZone(zone);
    setInventoryMap(pincodeOperationsService.getInventoryForPincode(hub.pincode));
    setIsPincodeConfirmed(true);
    setShowPincodePromptBar(false);
    setCheckoutBeat(hub.pincode === '324009' ? 'Beat 2' : `${hub.name.split(' ')[0]} Hub Beat`);
    setCheckoutAddress(`${hub.landmarks[0]}, PIN ${hub.pincode}`);
  };

  const handleAutoDetectPincode = async () => {
    setIsDetectingPincode(true);
    try {
      const { hub, source } = await detectNearestPincodeHub();
      handleSelectPincodeValue(hub.pincode);
      setLeadBannerMessage(
        source === 'gps'
          ? `GPS detected nearest Post Office hub: PIN ${hub.pincode} · ${hub.officeName}.`
          : `Routed to regional hub: PIN ${hub.pincode} · ${hub.officeName}.`
      );
    } finally {
      setIsDetectingPincode(false);
    }
  };

  useEffect(() => {
    const activeCust = customerAuthService.getActiveCustomer();
    const loginPin = userProfile?.pincode || activeCust?.pincode;
    if (loginPin) {
      const routedHub = pincodeOperationsService.routePincodeFromLogin(loginPin);
      setActiveVicinityZone(toVicinityZone(routedHub));
      setInventoryMap(pincodeOperationsService.getInventoryForPincode(routedHub.pincode));
      setIsPincodeConfirmed(true);
      setShowPincodePromptBar(false);
      setCheckoutAddress(`${routedHub.landmarks[0]}, PIN ${routedHub.pincode}`);
    }
  }, [userProfile?.pincode]);

  useEffect(() => {
    cartRecoveryService.saveSharedCart(cartItems);
  }, [cartItems]);

  useEffect(() => {
    const syncRecovery = () => {
      setRecoverySession(cartRecoveryService.getActiveSession());
      const latestCart = cartRecoveryService.getSharedCart<CartItem>();
      if (latestCart.length !== cartItems.length) {
        setCartItems(latestCart);
      }
    };
    const unsubRecovery = cartRecoveryService.subscribe(syncRecovery);
    return () => unsubRecovery();
  }, [cartItems.length]);

  useEffect(() => {
    const syncPincodeState = () => {
      const currentPin = pincodeOperationsService.getActivePincode();
      setActiveVicinityZone(toVicinityZone(getPincodeHub(currentPin)));
      setInventoryMap(pincodeOperationsService.getInventoryForPincode(currentPin));
    };
    const syncShowcase = () => {
      setBulkCustomers(indiaPostBulkShowcaseService.getBulkCustomers(false));
      setPromotedProducts(indiaPostBulkShowcaseService.getPromotedProducts(false));
    };

    syncPincodeState();
    syncShowcase();
    const unsubOps = pincodeOperationsService.subscribe(syncPincodeState);
    const unsubBulk = indiaPostBulkShowcaseService.subscribe(syncShowcase);

    if (!pincodeOperationsService.hasConfirmedPincode()) {
      detectNearestPincodeHub()
        .then(({ hub, source }) => {
          if (source === 'gps' && hub?.pincode) {
            pincodeOperationsService.setActivePincode(hub.pincode);
          }
        })
        .catch(() => {
          // ignore if geolocation blocked
        });
    }

    return () => {
      unsubOps();
      unsubBulk();
    };
  }, []);

  useEffect(() => {
    if (isHeroPaused) return;
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isHeroPaused]);

  const totalCartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const totalCartAmount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const handleAddToCart = (item: StorefrontCartPayload) => {
    setCartItems((prev) => {
      const existing = prev.find((c) => c.id === item.id || c.sku === item.sku);
      const next = existing
        ? prev.map((c) => (c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c))
        : [...prev, { ...item, quantity: 1 }];
      cartRecoveryService.saveSharedCart(next);
      cartRecoveryService.captureActivity({
        stage: 'CART_ADDED',
        pincode: activeVicinityZone.pincode,
        items: next.map((ci) => ({
          id: ci.id,
          sku: ci.sku,
          title: ci.title,
          price: ci.price,
          quantity: ci.quantity,
          vendorName: ci.vendorName,
        })),
        customerName: checkoutName,
        customerMobile: checkoutMobile,
        deliveryAddress: checkoutAddress,
      });
      return next;
    });
    setLeadBannerMessage(`Added "${item.title}" to India Post Speed Post COD Cart.`);
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    setCartItems((prev) => {
      const next = prev
        .map((c) => (c.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0);
      cartRecoveryService.saveSharedCart(next);
      return next;
    });
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => {
      const next = prev.filter((c) => c.id !== id);
      cartRecoveryService.saveSharedCart(next);
      return next;
    });
  };

  const getOrBuildRecoverySession = (): CartRecoverySession => {
    const existing = cartRecoveryService.getActiveSession();
    if (existing) return existing;
    return (
      cartRecoveryService.captureActivity({
        stage: 'CHECKOUT_OPENED',
        pincode: activeVicinityZone.pincode,
        items: cartItems.map((ci) => ({
          id: ci.id,
          sku: ci.sku,
          title: ci.title,
          price: ci.price,
          quantity: ci.quantity,
          vendorName: ci.vendorName,
        })),
        customerName: checkoutName,
        customerMobile: checkoutMobile,
        deliveryAddress: checkoutAddress,
      }) || {
        sessionId: cartRecoveryService.getOrCreateSessionId(),
        pincode: activeVicinityZone.pincode,
        officeName: activeVicinityZone.officeName,
        items: cartItems.map((ci) => ({
          id: ci.id,
          sku: ci.sku,
          title: ci.title,
          price: ci.price,
          quantity: ci.quantity,
          vendorName: ci.vendorName,
        })),
        totalAmount: totalCartAmount,
        totalCount: totalCartCount,
        customerName: checkoutName,
        customerMobile: checkoutMobile,
        deliveryAddress: checkoutAddress,
        stage: 'CHECKOUT_OPENED',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
    );
  };

  const handleCloseCartWithRecovery = () => {
    if (cartItems.length > 0 && lastPlacedOrders.length === 0) {
      const snapshotItems = cartItems.map((ci) => ({
        id: ci.id,
        sku: ci.sku,
        title: ci.title,
        price: ci.price,
        quantity: ci.quantity,
        vendorName: ci.vendorName,
      }));
      cartRecoveryService.captureActivity({
        stage: 'CHECKOUT_OPENED',
        pincode: activeVicinityZone.pincode,
        items: snapshotItems,
        customerName: checkoutName,
        customerMobile: checkoutMobile,
        deliveryAddress: checkoutAddress,
      });
      cartRecoveryService.markAbandoned(activeVicinityZone.pincode, snapshotItems);
    }
    setIsCartOpen(false);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    const cleanName = checkoutName.trim();
    const cleanMobile = checkoutMobile.replace(/\D/g, '').slice(-10);
    if (cleanName.length < 2) {
      setCheckoutError('Please enter recipient full name.');
      return;
    }
    if (cleanMobile.length !== 10) {
      setCheckoutError('Please enter a valid 10-digit mobile number for Speed Post SMS alerts.');
      return;
    }
    if (cartItems.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }

    const activeHub = getPincodeHub(activeVicinityZone.pincode);
    const createdOrders: LogisticsDispatchOrder[] = cartItems.map((item) =>
      aiCommercialVerificationService.createLogisticsDispatch({
        storeId: item.id,
        storeName: item.vendorName || `${activeHub.officeName} Dispatch`,
        productId: item.id,
        productTitle: `${item.title} (x${item.quantity})`,
        productSku: item.sku,
        productPrice: item.price * item.quantity,
        customerName: cleanName,
        customerMobile: cleanMobile,
        deliveryAddress: checkoutAddress.trim() || `${activeHub.officeName} PIN ${activeHub.pincode}`,
        colony: activeHub.name,
        pincode: activeHub.pincode,
        beatNo: checkoutBeat || item.beatNo || 'Beat 2',
        pincodeManagerId: 'STAFF-50457421',
        pincodeManagerName: activeHub.beatManager,
        pincodeManagerContact: activeHub.whatsappPhone,
        serviceType: 'Speed Post COD',
        status: 'PENDING_PICKUP',
        codAmount: item.price * item.quantity,
        remarks: `India Post Storefront COD Checkout · PIN ${activeHub.pincode}`,
      })
    );

    customerService.submitCustomerInquiry({
      customerName: cleanName,
      mobile: cleanMobile,
      productInterested: `India Post Speed Post COD Order (${cartItems.length} item${cartItems.length > 1 ? 's' : ''})`,
      requirement: `Speed Post COD Total ₹${totalCartAmount} | Barcodes: ${createdOrders.map((o) => o.speedPostBarcode).join(', ')}`,
      preferredContact: 'Doorstep Visit',
      address: checkoutAddress.trim() || `${activeHub.officeName} PIN ${activeHub.pincode}`,
      beatNo: checkoutBeat || 'Beat 2',
    });

    cartRecoveryService.markConverted(activeHub.pincode);
    setLastPlacedOrders(createdOrders);
    setCartItems([]);
    cartRecoveryService.saveSharedCart([]);
    setLeadBannerMessage(
      `Speed Post COD Confirmed! Barcode ${createdOrders[0]?.speedPostBarcode} routed to PIN ${activeHub.pincode} (${activeHub.officeName}).`
    );
  };

  const handleInquiryLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = indiaPostBulkShowcaseService.lookupPublicInquiryStatus(
      trackRefInput,
      trackMobileInput
    );
    setInquiryLookupResult(res);
  };

  const handleBarcodeLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = barcodeLookupInput.trim().toUpperCase();
    const cleanLast4 = barcodeMobileLast4.replace(/\D/g, '').slice(-4);
    if (!cleanCode || cleanLast4.length !== 4) {
      setBarcodeLookupResult({
        searched: true,
        match: null,
        error: 'Enter both the Speed Post Barcode / Order ID and the last 4 digits of the registered mobile.',
      });
      return;
    }
    const all = aiCommercialVerificationService.getAllDispatches();
    const match =
      all.find(
        (d) =>
          ((d.speedPostBarcode || '').toUpperCase() === cleanCode ||
            d.id.toUpperCase() === cleanCode) &&
          (d.customerMobile || '').replace(/\D/g, '').slice(-4) === cleanLast4
      ) || null;
    setBarcodeLookupResult({
      searched: true,
      match,
      error: match ? undefined : 'No matching Speed Post dispatch found for those credentials.',
    });
  };

  const currentHeroSlide = HERO_SLIDES[activeSlideIndex];

  // Filtered Bulk Customers & Promoted Products
  const showcaseData = useMemo(() => {
    return indiaPostBulkShowcaseService.getFilteredShowcase({
      pincode: bulkPincodeScope === 'ACTIVE' ? activeVicinityZone.pincode : 'ALL',
      category: selectedBulkCategory === 'ALL' ? undefined : selectedBulkCategory,
      query: searchQuery,
      bulkCustomerId: selectedBulkCustomerId === 'ALL' ? undefined : selectedBulkCustomerId,
    });
  }, [
    bulkCustomers,
    promotedProducts,
    bulkPincodeScope,
    activeVicinityZone.pincode,
    selectedBulkCategory,
    selectedBulkCustomerId,
    searchQuery,
  ]);

  const bulkCatalogRowItems = useMemo<CatalogRowItem[]>(() => {
    return promotedProducts.map((p) => ({
      id: p.id,
      sku: p.sku,
      title: p.title,
      brand: p.bulkCustomerName,
      categoryTag: `${p.category} · ${p.officeName}`,
      mrpPrice: p.mrpPrice || p.retailPrice || 0,
      retailPrice: p.retailPrice || 0,
      imageSrc: p.imageUrl || imgCatB2b,
      beatNo: p.beatCoverage,
      pincode: p.pincode,
    }));
  }, [promotedProducts]);

  const filteredPostOfficeOfferings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return POST_OFFICE_BANKING_OFFERINGS.filter((item) => {
      const matchesTab = activePostOfficeTab === 'ALL_PO' || item.subTab === activePostOfficeTab;
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q) ||
        item.officialRateHighlight.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [activePostOfficeTab, searchQuery]);

  const buildShareMessage = (product: ProductDefinition): string => {
    const portalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://indiapost.gov.in';
    return (
      `📮 *India Post — Official Services Hub (PIN ${activeVicinityZone.pincode})*\n` +
      `✨ *${product.name} (${product.code})*\n\n` +
      `📈 *Official Interest / Bonus:* ${product.interestRateOrBonus}\n` +
      `🛡️ *Tax / Sovereign Benefit:* ${product.taxBenefits}\n` +
      `💰 *Limit / Fee:* ${product.minInvestment}\n` +
      `⏳ *Tenure:* ${product.tenure}\n\n` +
      `✅ 100% Government of India Sovereign Guarantee & Doorstep Beat Postman Assistance.\n` +
      `👉 View details: ${portalUrl}/?scheme=${product.code}`
    );
  };

  const getShareUrls = (product: ProductDefinition) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://indiapost.gov.in';
    const schemeUrl = `${origin}/?scheme=${product.code}`;
    const text = buildShareMessage(product);
    const shortHeadline = `India Post: ${product.name} — ${product.interestRateOrBonus}`;
    return {
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(schemeUrl)}&text=${encodeURIComponent(shortHeadline)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(schemeUrl)}&quote=${encodeURIComponent(shortHeadline)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shortHeadline)}&url=${encodeURIComponent(schemeUrl)}`,
    };
  };

  const handleCopyOrNativeShare = async (product: ProductDefinition) => {
    const shareText = buildShareMessage(product);
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: `${product.name} — India Post`,
          text: shareText,
          url: `${window.location.origin}/?scheme=${product.code}`,
        });
        return;
      }
    } catch {
      // Fallback to clipboard
    }
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // ignore
    }
    setCopiedProductCode(product.code);
    setTimeout(() => setCopiedProductCode(null), 2500);
  };

  const handleProductAction = (product: ProductDefinition, mode: 'KNOW_MORE' | 'QUICK_INQUIRY') => {
    setFormError(null);
    if (mode === 'KNOW_MORE') {
      setInspectedScheme(product);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (unlockedVisitor) {
      setVisitorName(unlockedVisitor.name);
      setVisitorMobile(unlockedVisitor.mobile);
      setVisitorLocality(unlockedVisitor.locality);
    }
    setLeadBulkTarget(null);
    setLeadGateTargetProduct(product);
    setLeadGateMode(mode);
  };

  const openBulkInquiryModal = (
    productOrService: string,
    bulkCustomerName?: string,
    pincode?: string
  ) => {
    setFormError(null);
    if (unlockedVisitor) {
      setVisitorName(unlockedVisitor.name);
      setVisitorMobile(unlockedVisitor.mobile);
      setVisitorLocality(unlockedVisitor.locality);
    }
    setLeadGateTargetProduct(null);
    setLeadBulkTarget({
      productOrService,
      bulkCustomerName,
      pincode: pincode || activeVicinityZone.pincode,
    });
  };

  const handleLeadGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = visitorName.trim();
    const digitsOnlyMobile = visitorMobile.replace(/\D/g, '').slice(-10);

    if (trimmedName.length < 2) {
      setFormError('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (digitsOnlyMobile.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (leadBulkTarget) {
      const targetPin = leadBulkTarget.pincode || activeVicinityZone.pincode;
      const { ticketNumber } = indiaPostBulkShowcaseService.submitShowcaseInquiry({
        customerName: trimmedName,
        mobile: digitsOnlyMobile,
        pincode: targetPin,
        productOrService: leadBulkTarget.productOrService,
        bulkCustomerName: leadBulkTarget.bulkCustomerName,
        requirement:
          inquiryNote.trim() ||
          `Bulk / Product Dispatch Inquiry (${preferredContact}) for ${leadBulkTarget.productOrService}`,
        address: visitorLocality || `${activeVicinityZone.officeName} PIN ${targetPin}`,
        preferredContact,
      });

      const visitorRecord: UnlockedVisitor = {
        name: trimmedName,
        mobile: digitsOnlyMobile,
        locality: visitorLocality || PAN_INDIA_CIRCLES[0].label,
        beatNo: 'Beat 2',
        lastTicketNumber: ticketNumber,
      };
      setUnlockedVisitor(visitorRecord);
      safeStorage.setJSON(SESSION_UNLOCK_KEY, visitorRecord);
      setLeadBannerMessage(
        `Inquiry #${ticketNumber} logged with India Post (PIN ${targetPin}) for ${leadBulkTarget.productOrService}. Save this Ticket ID for status tracking.`
      );
      setLeadBulkTarget(null);
      setInquiryNote('');
      return;
    }

    const targetProduct = leadGateTargetProduct || POSTAL_PRODUCTS[0];
    const matchedCircle =
      PAN_INDIA_CIRCLES.find((l) => l.label === visitorLocality) || PAN_INDIA_CIRCLES[0];

    const { inquiry } = customerService.submitCustomerInquiry({
      customerName: trimmedName,
      mobile: digitsOnlyMobile,
      productInterested: targetProduct.name,
      requirement:
        inquiryNote.trim() ||
        `Requested ${preferredContact} consultation for ${targetProduct.name}`,
      preferredContact,
      address: visitorLocality || `${activeVicinityZone.officeName} PIN ${activeVicinityZone.pincode}`,
      beatNo: 'Beat 2',
    });

    const visitorRecord: UnlockedVisitor = {
      name: trimmedName,
      mobile: digitsOnlyMobile,
      locality: visitorLocality || matchedCircle.label,
      beatNo: 'Beat 2',
      lastTicketNumber: inquiry.ticketNumber,
    };

    setUnlockedVisitor(visitorRecord);
    safeStorage.setJSON(SESSION_UNLOCK_KEY, visitorRecord);

    setLeadBannerMessage(
      `Reference #${inquiry.ticketNumber} registered for ${targetProduct.name}. Save this Ticket ID to check status anytime.`
    );
    setLeadGateTargetProduct(null);
    setInquiryNote('');
    setInspectedScheme(targetProduct);
  };

  const scrollToSection = (sectionId: string) => {
    if (typeof window === 'undefined') return;
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  };

  return (
    <div className="space-y-8 pb-16" id="public-home-portal">
      {/* Slide-Out Drawer Side Menu */}
      <SlideOutDrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        lang={lang}
        onSelectLang={handleSelectLang}
        activePincode={activeVicinityZone.pincode}
        onOpenPincodeModal={() => setIsPincodeModalOpen(true)}
        onOpenCitizenModal={() => scrollToSection('citizen-application-desk')}
        onOpenTrackModal={() => setIsTrackerOpen(true)}
        onOpenStaffLogin={() => {
          if (onOpenStaffLogin) onOpenStaffLogin();
        }}
        onSelectCategoryFilter={(filterKey) => {
          const matchedCat = showcaseData.categories.find((c) =>
            c.toLowerCase().includes(filterKey.toLowerCase())
          );
          if (matchedCat) setSelectedBulkCategory(matchedCat);
          scrollToSection('bulk-customer-showcase');
        }}
      />

      {/* Dynamic Pincode & Vicinity Selector Modal */}
      <LocationVicinityModal
        isOpen={isPincodeModalOpen}
        onClose={() => setIsPincodeModalOpen(false)}
        activePincode={activeVicinityZone.pincode}
        onSelectPincode={(zone) => handleSelectPincodeValue(zone.pincode)}
        lang={lang}
      />

      {/* 1. STICKY TOP NAVIGATION BAR */}
      <StickyTopNavbar
        lang={lang}
        onSelectLang={handleSelectLang}
        activePincode={activeVicinityZone.pincode}
        onSelectPincodeValue={handleSelectPincodeValue}
        onAutoDetectPincode={handleAutoDetectPincode}
        isDetectingPincode={isDetectingPincode}
        onOpenPincodeModal={() => setIsPincodeModalOpen(true)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenCart={() => {
          setLastPlacedOrders([]);
          setIsCartOpen(true);
        }}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenCitizenModal={() => scrollToSection('citizen-application-desk')}
        cartCount={totalCartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Confirmation Notice */}
      {leadBannerMessage && (
        <div className="bg-emerald-950 text-white rounded-2xl px-5 py-3.5 border border-emerald-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>{leadBannerMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setLeadBannerMessage(null)}
            className="text-emerald-300 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Non-Blocking Pincode-Gated Hub Routing Bar */}
      {showPincodePromptBar && !isPincodeConfirmed && (
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 text-white border border-amber-400/30 p-4 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <MapPin size={13} />
              <span>Select Your Delivery Post Office PIN (13 Regional Hubs)</span>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-white">
              Active Hub: <strong>PIN {activeVicinityZone.pincode}</strong> · {activeVicinityZone.officeName} ({activeVicinityZone.division})
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <select
              value={activeVicinityZone.pincode}
              onChange={(e) => handleSelectPincodeValue(e.target.value)}
              aria-label="Choose your delivery pincode hub"
              className="px-3 py-2 rounded-xl bg-white text-slate-900 text-xs font-mono font-bold cursor-pointer"
            >
              {PINCODE_OFFICE_HUBS.map((h) => (
                <option key={h.pincode} value={h.pincode}>
                  PIN {h.pincode} · {h.officeName}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAutoDetectPincode}
              disabled={isDetectingPincode}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap"
            >
              <Navigation size={13} className={isDetectingPincode ? 'animate-spin' : ''} />
              <span>{isDetectingPincode ? 'Detecting...' : 'GPS Detect'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectPincodeValue(activeVicinityZone.pincode)}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer whitespace-nowrap"
            >
              Confirm Hub
            </button>
          </div>
        </div>
      )}

      {/* Lightweight Abandoned Cart Recovery Strip */}
      {recoverySession &&
        recoverySession.stage === 'ABANDONED' &&
        !recoverySession.dismissedBanner &&
        cartItems.length > 0 && (
          <div className="rounded-2xl bg-amber-50 border border-amber-300 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-xs text-slate-800">
              <ShoppingBag size={18} className="text-amber-700 shrink-0" />
              <div>
                <span className="font-black text-slate-900 tabular-nums">
                  {cartItems.length} item{cartItems.length > 1 ? 's' : ''} saved in Speed Post COD Cart (₹
                  {(Number(totalCartAmount) || 0).toLocaleString('en-IN')})
                </span>
                <span className="text-slate-600 block sm:inline sm:ml-2">
                  Routed to PIN {activeVicinityZone.pincode} · {activeVicinityZone.officeName}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setLastPlacedOrders([]);
                  setIsCartOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black cursor-pointer whitespace-nowrap"
              >
                Resume Checkout
              </button>
              <a
                href={cartRecoveryService.buildWhatsAppRecoveryHref(recoverySession)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => cartRecoveryService.recordWhatsAppRecoveryClick(recoverySession)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 whitespace-nowrap"
              >
                <MessageCircle size={12} />
                <span>WhatsApp Cart Link</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  cartRecoveryService.dismissRecoveryPrompt();
                  setRecoverySession(cartRecoveryService.getActiveSession());
                }}
                className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                aria-label="Dismiss saved cart notice"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

      {/* INLINE DYNAMIC PRODUCT PAGE WHEN USER CLICKS KNOW MORE */}
      {inspectedScheme ? (
        <DynamicProductPageView
          officialScheme={inspectedScheme}
          onBack={() => setInspectedScheme(null)}
        />
      ) : (
        <>
          {/* 2. INDIA POST OFFICIAL & BULK CUSTOMER HERO SLIDER */}
          <section
            className={`relative overflow-hidden rounded-3xl text-white border border-white/20 shadow-xl transition-all duration-700 bg-gradient-to-r ${currentHeroSlide.heroGradient}`}
            onMouseEnter={() => setIsHeroPaused(true)}
            onMouseLeave={() => setIsHeroPaused(false)}
            id="hero-auto-slider"
          >
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <img
                key={currentHeroSlide.id}
                src={currentHeroSlide.imageSrc}
                alt={currentHeroSlide.headline}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center opacity-35 transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/75 to-slate-900/45" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" />
            </div>

            <div className="relative z-10 p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/20 text-xs">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono font-bold text-amber-300">
                    PIN {activeVicinityZone.pincode} · {activeVicinityZone.officeName}
                  </span>
                  <span className="text-white/40" aria-hidden="true">·</span>
                  <span className="text-slate-200 font-semibold">{currentHeroSlide.vendorPromoTag}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-300 font-mono font-bold">
                    {currentHeroSlide.discountTag}
                  </span>
                  <span className="text-slate-300 tabular-nums font-mono">
                    0{activeSlideIndex + 1} / 0{HERO_SLIDES.length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-6">
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      {currentHeroSlide.brandName}
                    </div>
                    <h2
                      className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight"
                      style={{ textWrap: 'balance' }}
                    >
                      {currentHeroSlide.headline}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
                      {currentHeroSlide.subtitle}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => scrollToSection(currentHeroSlide.scrollTargetId || 'bulk-customer-showcase')}
                      className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 shadow-lg cursor-pointer whitespace-nowrap"
                      id="hero-explore-category-btn"
                    >
                      <span>{currentHeroSlide.ctaCategoryLabel}</span>
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleAddToCart({
                          id: currentHeroSlide.id,
                          sku: currentHeroSlide.featuredSku,
                          title: currentHeroSlide.featuredTitle,
                          price: currentHeroSlide.featuredPrice,
                          imageSrc: currentHeroSlide.imageSrc,
                          vendorName: currentHeroSlide.brandName,
                          beatNo: currentHeroSlide.featuredBeatNo,
                        })
                      }
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-md"
                      id="hero-add-to-cart-btn"
                    >
                      <ShoppingCart size={15} className="text-amber-200" />
                      <span>{translate('add_to_cart', lang)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openBulkInquiryModal(
                          currentHeroSlide.featuredTitle,
                          currentHeroSlide.brandName,
                          activeVicinityZone.pincode
                        )
                      }
                      className="px-4 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/25 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Phone size={15} className="text-amber-300" />
                      <span>Bulk / Scheme Inquiry</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col justify-between bg-black/55 backdrop-blur-md border border-white/20 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-3.5">
                    <div>
                      <div className="text-[11px] text-slate-300 font-medium">
                        Featured Offering &amp; Tariff
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-amber-300 tabular-nums mt-1">
                        ₹{(Number(currentHeroSlide.featuredPrice) || 0).toLocaleString('en-IN')}
                        {currentHeroSlide.featuredMrp > currentHeroSlide.featuredPrice && (
                          <span className="text-sm font-normal text-slate-400 line-through ml-2">
                            ₹{currentHeroSlide.featuredMrp.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-emerald-300 font-semibold mt-0.5">
                        {currentHeroSlide.featuredTitle}
                      </div>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/25 flex items-center justify-center text-amber-300 shrink-0">
                      <Shield size={22} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-slate-400">Speed Post COD Fee</div>
                      <div className="font-bold text-white mt-1 tabular-nums">Flat ₹15 Beat Delivery</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-slate-400">Dispatch SLA</div>
                      <div className="font-bold text-emerald-300 tabular-nums mt-1">
                        {activeVicinityZone.slaMinutes}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 flex items-center justify-between gap-2 pt-1">
                    <span className="truncate">
                      {activeVicinityZone.officeName} (PIN {activeVicinityZone.pincode})
                    </span>
                    <span className="font-mono text-amber-300 font-semibold shrink-0">
                      {activeVicinityZone.division}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-7 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                  {HERO_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                        idx === activeSlideIndex
                          ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      0{idx + 1}. {slide.tabLabel}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                    }
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
                    aria-label="Next Slide"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 3. LIVE INDIA POST PROMOTIONS & FEATURED OFFERS */}
          <LiveUrgentDesk
            lang={lang}
            activePincode={activeVicinityZone.pincode}
            onAddToCart={handleAddToCart}
          />

          {/* 4. INDIA POST BULK CUSTOMERS & PROMOTED PRODUCTS SHOWCASE */}
          <section
            id="bulk-customer-showcase"
            className="space-y-6 pt-4 border-t border-slate-200"
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                  <Package size={14} />
                  <span>
                    India Post Bulk Customer &amp; Product Promotion Showcase · PIN{' '}
                    {bulkPincodeScope === 'ACTIVE' ? activeVicinityZone.pincode : 'All 13 Hubs'}
                  </span>
                </div>
                <h3
                  className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Registered India Post Bulk Customers &amp; Promoted Parcel Offerings
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
                  Discover regional study material dispatchers, GI handloom collectives, diagnostic parcel hubs, FPO agro packs, and institutional India Post services shipped nationwide via Speed Post &amp; BNPL.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setBulkPincodeScope('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      bulkPincodeScope === 'ALL'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All 13 Division PINs
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkPincodeScope('ACTIVE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      bulkPincodeScope === 'ACTIVE'
                        ? 'bg-red-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Only PIN {activeVicinityZone.pincode}
                  </button>
                </div>

                <Link
                  to="/b2b-partner"
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                >
                  <Building2 size={14} />
                  <span>Onboard Bulk Account</span>
                </Link>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div
              className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
              role="tablist"
              aria-label="Filter Bulk Customer Showcase by Category"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedBulkCategory === 'ALL'}
                onClick={() => setSelectedBulkCategory('ALL')}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedBulkCategory === 'ALL'
                    ? 'bg-slate-900 text-amber-300 border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Bulk Categories ({promotedProducts.length})
              </button>
              {showcaseData.categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={selectedBulkCategory === cat}
                  onClick={() => setSelectedBulkCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedBulkCategory === cat
                      ? 'bg-red-700 text-white border-red-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Verified Bulk Customer Directory Strip */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-800">
                  Verified India Post Bulk Customers ({showcaseData.customers.length})
                </span>
                {selectedBulkCustomerId !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSelectedBulkCustomerId('ALL')}
                    className="text-red-700 font-bold hover:underline cursor-pointer"
                  >
                    Show All Bulk Customers
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {showcaseData.customers.map((cust) => {
                  const isActiveCust = selectedBulkCustomerId === cust.id;
                  return (
                    <div
                      key={cust.id}
                      className={`rounded-2xl border p-4 bg-white transition flex flex-col justify-between gap-3 ${
                        isActiveCust
                          ? 'border-red-600 ring-2 ring-red-100 shadow-md'
                          : 'border-slate-200 hover:border-red-300 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                          <span className="font-semibold text-red-700 truncate">{cust.category}</span>
                          <span className="font-mono font-semibold text-slate-700 shrink-0 tabular-nums">
                            PIN {cust.pincode} · {cust.officeName}
                          </span>
                        </div>
                        <h4 className="font-black text-sm text-slate-900 leading-snug">
                          {cust.businessName}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{cust.tagline}</p>
                        <div className="text-[11px] text-slate-500 pt-1">
                          {cust.highlights.slice(0, 3).join(' · ')}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedBulkCustomerId(isActiveCust ? 'ALL' : cust.id)
                          }
                          className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                            isActiveCust
                              ? 'bg-red-700 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                          }`}
                        >
                          {isActiveCust ? 'Showing Products ✓' : 'Filter Products'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openBulkInquiryModal(
                              `Bulk Dispatch & Tariff — ${cust.businessName}`,
                              cust.businessName,
                              cust.pincode
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer whitespace-nowrap"
                        >
                          Bulk Inquiry
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Promoted Products Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-800 tabular-nums">
                  Promoted Bulk Customer Products ({showcaseData.products.length})
                </span>
                <span className="text-slate-500">
                  Direct Speed Post COD checkout or institutional bulk quote
                </span>
              </div>

              {showcaseData.products.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-2">
                  <p className="text-sm font-bold text-slate-900">
                    No bulk promoted products matched the selected PIN or category filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkPincodeScope('ALL');
                      setSelectedBulkCategory('ALL');
                      setSelectedBulkCustomerId('ALL');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                  >
                    Reset Bulk Showcase Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {showcaseData.products.map((prod) => {
                    const price = Number(prod.retailPrice) || 0;
                    const mrp = Number(prod.mrpPrice) || price;
                    const discPct =
                      mrp > price && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
                    const hub = getPincodeHub(prod.pincode || activeVicinityZone.pincode);
                    const waText = encodeURIComponent(
                      `Namaste India Post Bulk Showcase Desk (${hub.officeName} · PIN ${hub.pincode}),\nInquiry for Promoted Product: *${prod.title}* (${prod.sku})\nBulk Customer: ${prod.bulkCustomerName}\nTariff: ${prod.priceDisplay}`
                    );

                    return (
                      <article
                        key={prod.id}
                        className="group bg-white rounded-2xl border border-slate-200 hover:border-red-400 hover:shadow-md hover:-translate-y-0.5 transition duration-200 flex flex-col justify-between overflow-hidden"
                      >
                        <div>
                          <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                            <img
                              src={prod.imageUrl || imgCatB2b}
                              alt={prod.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between gap-2 text-[11px] text-white">
                              <span className="font-bold text-amber-300 truncate">
                                {prod.officeName} · PIN {prod.pincode}
                              </span>
                              {discPct > 0 && (
                                <span className="font-mono font-black text-emerald-300 shrink-0 tabular-nums">
                                  {discPct}% OFF
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-3.5 space-y-1.5">
                            <div className="text-[11px] text-slate-500 truncate">
                              {prod.bulkCustomerName}
                            </div>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-red-700 transition leading-snug line-clamp-2 min-h-[2.25rem]">
                              {prod.title}
                            </h4>
                            <p className="text-[11px] text-slate-600 line-clamp-2">
                              {prod.bulkOfferDetails}
                            </p>

                            <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between gap-1.5">
                              <div className="flex items-baseline gap-1.5 tabular-nums">
                                <span className="text-sm sm:text-base font-black text-slate-900">
                                  {prod.priceDisplay}
                                </span>
                                {mrp > price && price > 0 && (
                                  <span className="text-[11px] text-slate-400 line-through">
                                    ₹{mrp.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-semibold text-emerald-700 truncate">
                                {prod.minOrderOrUnit}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 pt-2 border-t border-slate-100 bg-slate-50/70 space-y-1.5 text-[11px]">
                          <div className="grid grid-cols-2 gap-1.5">
                            {price > 0 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAddToCart({
                                    id: prod.id,
                                    sku: prod.sku,
                                    title: prod.title,
                                    price,
                                    imageSrc: prod.imageUrl || imgCatB2b,
                                    vendorName: prod.bulkCustomerName,
                                    beatNo: prod.beatCoverage,
                                  })
                                }
                                className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition whitespace-nowrap"
                              >
                                <ShoppingCart size={12} className="text-amber-300" />
                                <span>Add COD</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  openBulkInquiryModal(
                                    prod.title,
                                    prod.bulkCustomerName,
                                    prod.pincode
                                  )
                                }
                                className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition whitespace-nowrap"
                              >
                                <BookOpen size={12} className="text-amber-300" />
                                <span>Get Quote</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                openBulkInquiryModal(
                                  prod.title,
                                  prod.bulkCustomerName,
                                  prod.pincode
                                )
                              }
                              className="py-1.5 px-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer transition whitespace-nowrap"
                            >
                              <Phone size={11} />
                              <span>Bulk Inquiry</span>
                            </button>
                          </div>

                          <a
                            href={`https://api.whatsapp.com/send?phone=${hub.whatsappPhone}&text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition whitespace-nowrap text-[10px]"
                          >
                            <MessageCircle size={12} />
                            <span>WhatsApp Hub Desk</span>
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* 5. EXCLUSIVE INDIA POST & BULK TOP OFFERINGS */}
          <ExclusiveTopSellers
            lang={lang}
            activePincode={activeVicinityZone.pincode}
            availability={inventoryMap.top_sellers}
            onAddToCart={handleAddToCart}
          />

          {/* 6. HORIZONTAL BULK & INSTITUTIONAL DISPATCH ROW */}
          {bulkCatalogRowItems.length > 0 && (
            <CategoryCatalogRow
              rowId="bulk-dispatch-catalog-row"
              kicker={`Speed Post & Business Parcel Network · PIN ${activeVicinityZone.pincode}`}
              title="Institutional Study Packs, Handloom, Medical &amp; Philately Dispatches"
              subtitle="Direct India Post Bulk Customer catalog shipped nationwide with barcode manifests, BNPL tariff options, and doorstep Speed Post COD."
              icon={Package}
              accentColor="red"
              items={bulkCatalogRowItems}
              lang={lang}
              activePincode={activeVicinityZone.pincode}
              availability={inventoryMap.kirana}
              onAddToCart={handleAddToCart}
              onViewMore={() => scrollToSection('bulk-customer-showcase')}
              viewMoreTitle="View All Bulk Showcase Items"
              viewMoreSubtitle="Filter by PIN code, division office, or merchant category"
            />
          )}

          {/* 7. DIVISIONAL POST OFFICE HUBS & ECOSYSTEM CARDS */}
          <LocalServiceEcosystemCards
            lang={lang}
            activePincode={activeVicinityZone.pincode}
            onAddToCart={handleAddToCart}
          />

          {/* 8. CITIZEN DOCUMENTATION & STATUTORY DESK */}
          <CitizenDocumentationDesk
            lang={lang}
            activePincode={activeVicinityZone.pincode}
          />

          {/* 9. OFFICIAL INDIA POST & BULK STOREFRONT PORTALS */}
          <section className="space-y-4 pt-4 border-t border-slate-200" id="official-brand-stores-grid">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                  <Award size={14} />
                  <span>
                    India Post Official Portals · PIN {activeVicinityZone.pincode} (
                    {activeVicinityZone.officeName})
                  </span>
                </div>
                <h3
                  className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Official Postal Services &amp; Bulk Customer Storefronts
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-500">
                100% India Post Sovereign Operations
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {OFFICIAL_BRAND_STORES.map((store) => (
                <Link
                  key={store.slug}
                  to={`/brand/${store.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-red-400 hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/7] bg-slate-100 overflow-hidden">
                    <img
                      src={store.coverImage}
                      alt={store.brandName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <div className="text-[11px] font-mono font-bold text-amber-300 truncate">
                        {store.trustAssurance}
                      </div>
                      <div className="text-base sm:text-lg font-black truncate">{store.brandName}</div>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-600 font-medium line-clamp-1">
                      {store.shortTagline}
                    </span>
                    <span className="font-black text-red-700 group-hover:translate-x-0.5 transition inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                      <span>Open Portal</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 10. POST OFFICE, BANKING & FINANCE SERVICES STORE */}
          <section className="space-y-6 pt-4 border-t border-slate-200" id="post-office-banking-store">
            <div className="bg-gradient-to-r from-red-950 via-red-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Landmark size={15} />
                    <span>
                      Official India Post &amp; IPPB Banking Store · PIN {activeVicinityZone.pincode}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Post Office, Banking &amp; Finance Services
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
                    Dedicated official storefront for Sukanya Samriddhi (SSY), Senior Citizen Savings (SCSS), Postal Life Insurance (PLI/RPLI), IPPB Zero-Balance accounts, ₹10L Accident Cover, Jeevan Pramaan DLC, Child Aadhaar CELC, MyStamp &amp; Gangajal.
                  </p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4 shrink-0 space-y-1.5 text-xs">
                  <div className="text-amber-300 font-bold">Active Postal Delivery Hub</div>
                  <div className="font-semibold text-white">
                    {activeVicinityZone.officeName} · PIN {activeVicinityZone.pincode}
                  </div>
                  <div className="font-semibold text-slate-300 tabular-nums">
                    {activeVicinityZone.slaMinutes} · Certified Biometric KYC
                  </div>
                </div>
              </div>

              {/* Sub-Tabs for Post Office & Banking Store */}
              <div
                className="flex items-center gap-2 overflow-x-auto pt-6 pb-1 [scrollbar-width:none]"
                role="tablist"
                aria-label="Post Office and Banking Sub-Tabs"
              >
                {POST_OFFICE_BANKING_TABS.map((tab) => {
                  const isSelected = activePostOfficeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setActivePostOfficeTab(tab.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                    >
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Post Office & Banking Product Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPostOfficeOfferings.map((offering) => {
                const matchedProduct =
                  POSTAL_PRODUCTS.find((p) => p.code === offering.productCode) || POSTAL_PRODUCTS[0];
                const activeHub = getPincodeHub(activeVicinityZone.pincode);
                const waText = encodeURIComponent(
                  `Namaste ${activeHub.officeName} Desk (PIN ${activeHub.pincode}),\nI want official booking / doorstep assistance for: *${offering.title}* (${offering.badge}).\nRate / Benefit: ${offering.officialRateHighlight}\nHub Coordinator: ${activeHub.beatManager}`
                );

                return (
                  <article
                    key={offering.id}
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-red-400 hover:shadow-xl transition duration-200 flex flex-col justify-between overflow-hidden shadow-2xs"
                  >
                    <div>
                      <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                        <img
                          src={offering.imageSrc}
                          alt={offering.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2 text-white">
                          <span className="text-[11px] font-bold text-amber-300 truncate">
                            {offering.badge}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-mono font-black tabular-nums shrink-0">
                            {offering.officialRateHighlight}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="text-[11px] font-semibold text-slate-500">
                          {activeHub.officeName} · PIN {activeHub.pincode}
                        </div>
                        <h4 className="font-black text-sm sm:text-base text-slate-900 group-hover:text-red-700 transition leading-snug">
                          {offering.title}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {offering.description}
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between gap-2 text-xs">
                          <div className="flex items-baseline gap-1.5 tabular-nums">
                            <span className="text-base font-black text-slate-900">
                              ₹{offering.retailPrice.toLocaleString('en-IN')}
                            </span>
                            {offering.mrpPrice > offering.retailPrice && (
                              <span className="text-xs text-slate-400 line-through">
                                ₹{offering.mrpPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-emerald-700 font-mono">
                            PIN {activeHub.pincode} · Speed Post
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/70 space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleProductAction(matchedProduct, 'KNOW_MORE')}
                          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <span>Know More</span>
                          <ArrowRight size={13} className="text-amber-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleAddToCart({
                              id: offering.id,
                              sku: offering.sku,
                              title: offering.title,
                              price: offering.retailPrice,
                              imageSrc: offering.imageSrc,
                              vendorName: `${activeHub.officeName} Official Desk`,
                              beatNo: offering.beatNo,
                            })
                          }
                          className="px-3 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <ShoppingCart size={13} className="text-amber-300" />
                          <span>Add to Cart · COD</span>
                        </button>
                      </div>

                      <a
                        href={`https://api.whatsapp.com/send?phone=${activeHub.whatsappPhone}&text=${waText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition whitespace-nowrap text-[11px]"
                      >
                        <MessageCircle size={12} />
                        <span>{translate('whatsapp_desk', lang)}</span>
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* 11. STAFF-PUBLISHED INDIA POST & BULK CUSTOMER CATALOG */}
          <section className="space-y-4 pt-4 border-t border-slate-200" id="local-b2b-merchants-directory">
            <PublicStorefrontSection
              excludePostOfficeItems={false}
              externalSearchQuery={searchQuery}
              activePincode={activeVicinityZone.pincode}
              onAddToCart={handleAddToCart}
            />
          </section>

          {/* 12. HOW INDIA POST DOORSTEP BANKING & BULK DISPATCH WORKS */}
          <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-3">
                <div className="text-xs font-semibold text-red-700">
                  All-India Postal Network · India Post &amp; IPPB Doorstep Operations
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  How Doorstep Postal Banking, Speed Post COD &amp; Bulk Dispatch Works
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Serving 13 Kota &amp; Baran Regional Postal Hubs ({activeVicinityZone.officeName}, PIN{' '}
                  {activeVicinityZone.pincode}) with Pan-India reach, India Post connects citizens, pensioners, and verified Bulk Customers through beat postmen delivering sovereign accounts, biometric e-KYC, and Speed Post COD parcels.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-bold text-slate-900">01. Choose Service or Bulk SKU</div>
                    <p className="text-xs text-slate-600 mt-1">
                      Select Postal Savings, PLI/RPLI, IPPB Banking, or verified Bulk Customer parcel products.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-bold text-slate-900">02. Instant PIN &amp; Beat Routing</div>
                    <p className="text-xs text-slate-600 mt-1">
                      Inquiries and Speed Post COD orders route directly to the assigned Sub Post Office &amp; beat desk.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs font-bold text-slate-900">03. Doorstep Fulfillment</div>
                    <p className="text-xs text-slate-600 mt-1">
                      Complete KYC, bulk pickup, or Speed Post COD delivery with verified barcode tracking.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 space-y-4">
                <div className="text-xs font-semibold text-amber-400">
                  India Post Network Reach &amp; Key Figures
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-2xl font-black text-white tabular-nums">8.2% p.a.</div>
                    <div className="text-xs text-slate-300 mt-0.5">SSY &amp; SCSS Sovereign Rate</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-2xl font-black text-amber-400 tabular-nums">Flat ₹15</div>
                    <div className="text-xs text-slate-300 mt-0.5">Beat Speed Post COD Fee</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-2xl font-black text-emerald-400 tabular-nums">13 Hubs</div>
                    <div className="text-xs text-slate-300 mt-0.5">Kota &amp; Baran PIN Coverage</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-2xl font-black text-white tabular-nums">190+</div>
                    <div className="text-xs text-slate-300 mt-0.5">Dak Ghar Niryat Destinations</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 13. BULK CUSTOMER & INSTITUTIONAL DESK CTA */}
          <section className="rounded-2xl bg-slate-900 text-white border border-slate-800 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                <Building2 size={18} />
              </div>
              <div>
                <div className="text-xs font-black text-white">
                  Book Now Pay Later (BNPL), Bulk Business Parcel &amp; Product Promotion?
                </div>
                <p className="text-[11px] text-slate-300">
                  Register as an India Post Bulk Customer to promote your catalog across our storefront and division beats.
                </p>
              </div>
            </div>
            <Link
              to="/b2b-partner"
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition"
            >
              <span>Open Bulk Customer Desk</span>
              <ArrowRight size={14} />
            </Link>
          </section>

          {/* FOOTER */}
          <StoreFooter
            lang={lang}
            activePincode={activeVicinityZone.pincode}
            onOpenStaffLogin={onOpenStaffLogin}
            onOpenCitizenModal={() => scrollToSection('citizen-application-desk')}
            onOpenTrackModal={() => setIsTrackerOpen(true)}
          />
        </>
      )}

      {/* SMART LEAD & BULK INQUIRY CAPTURE MODAL */}
      {(leadGateTargetProduct || leadBulkTarget) && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-gradient-to-r from-red-900 via-red-800 to-slate-950 text-white flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-amber-300">
                  {leadBulkTarget
                    ? 'India Post Bulk Customer & Product Inquiry'
                    : leadGateMode === 'KNOW_MORE'
                    ? 'Unlock Full Scheme Details & Calculator'
                    : 'Instant Doorstep Postal Inquiry'}
                </div>
                <h3 className="text-lg font-black text-white mt-1 leading-snug">
                  {leadBulkTarget ? leadBulkTarget.productOrService : leadGateTargetProduct?.name}
                </h3>
                <p className="text-xs text-slate-200 mt-1">
                  Enter your Name and 10-digit Mobile Number to generate a verified India Post tracking reference.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLeadGateTargetProduct(null);
                  setLeadBulkTarget(null);
                }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLeadGateSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Your Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  id="lead-gate-name-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  10-Digit Mobile / WhatsApp Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={visitorMobile}
                  onChange={(e) => setVisitorMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="e.g. 9829012345"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  id="lead-gate-mobile-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Select Postal Circle / PIN
                  </label>
                  <select
                    value={visitorLocality}
                    onChange={(e) => setVisitorLocality(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    id="lead-gate-locality-select"
                  >
                    {PAN_INDIA_CIRCLES.map((loc) => (
                      <option key={loc.label} value={loc.label}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Preferred Assistance Mode
                  </label>
                  <select
                    value={preferredContact}
                    onChange={(e) =>
                      setPreferredContact(e.target.value as 'WhatsApp' | 'Phone Call' | 'Doorstep Visit')
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    id="lead-gate-contact-mode"
                  >
                    <option value="WhatsApp">WhatsApp Brochure &amp; Rates</option>
                    <option value="Doorstep Visit">Doorstep Postman Visit</option>
                    <option value="Phone Call">Phone Callback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Requirement / Quantity Notes (Optional)
                </label>
                <input
                  type="text"
                  value={inquiryNote}
                  onChange={(e) => setInquiryNote(e.target.value)}
                  placeholder="e.g. Monthly 50 parcels BNPL pickup or SSY account visit"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setLeadGateTargetProduct(null);
                    setLeadBulkTarget(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-black transition flex items-center gap-2 shadow-md cursor-pointer"
                  id="lead-gate-submit-btn"
                >
                  <span>Submit Inquiry</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MULTI-PLATFORM SOCIAL SHARING MODAL */}
      {shareModalProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-gradient-to-r from-red-900 via-red-800 to-slate-950 text-white flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-300">
                  Official Scheme Flyer · {activeVicinityZone.officeName}
                </div>
                <h3 className="text-lg font-black text-white">{shareModalProduct.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShareModalProduct(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="font-mono text-red-700">{shareModalProduct.code}</span>
                  <span className="text-emerald-700">100% Sovereign Guarantee</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{shareModalProduct.name}</div>
                <div className="text-xs text-slate-700 font-semibold">
                  {shareModalProduct.interestRateOrBonus}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Globe size={14} className="text-red-700" />
                  <span>Share via Platform:</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={getShareUrls(shareModalProduct).whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={getShareUrls(shareModalProduct).telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Send size={15} />
                    <span>Telegram</span>
                  </a>
                  <a
                    href={getShareUrls(shareModalProduct).facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <span>Facebook</span>
                  </a>
                  <a
                    href={getShareUrls(shareModalProduct).twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <span>X (Twitter)</span>
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopyOrNativeShare(shareModalProduct)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
              >
                {copiedProductCode === shareModalProduct.code ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-700">Copied Campaign Flyer!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Campaign Flyer Text</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER INDIA POST SPEED POST COD CHECKOUT DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-slate-200">
            <div className="p-5 bg-gradient-to-r from-slate-950 via-red-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingCart size={20} className="text-amber-400" />
                <div>
                  <h3 className="font-black text-base text-white">India Post Speed Post COD Cart</h3>
                  <p className="text-[11px] text-slate-300">
                    PIN {activeVicinityZone.pincode} · {activeVicinityZone.officeName} · Flat ₹15 COD
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseCartWithRecovery}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                aria-label="Close Cart Drawer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {lastPlacedOrders.length > 0 ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                    <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                    <span>Speed Post COD Order Confirmed!</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Your order has been routed to <strong>{lastPlacedOrders[0].beatNo}</strong> (PIN{' '}
                    {lastPlacedOrders[0].pincode}). Save your Speed Post barcode to track delivery status.
                  </p>
                  <div className="space-y-2">
                    {lastPlacedOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 bg-white rounded-xl border border-emerald-200 text-xs space-y-1"
                      >
                        <div className="font-bold text-slate-900">{ord.productTitle}</div>
                        <div className="font-mono text-emerald-700 font-black">
                          {ord.speedPostBarcode}
                        </div>
                        <div className="text-slate-500 flex justify-between tabular-nums">
                          <span>COD: ₹{ord.codAmount}</span>
                          <span>{ord.beatNo}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCartOpen(false);
                        setTrackerMode('SPEEDPOST');
                        setBarcodeLookupInput(lastPlacedOrders[0]?.speedPostBarcode || '');
                        setIsTrackerOpen(true);
                      }}
                      className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Track Barcode
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      className="flex-1 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Continue Browsing
                    </button>
                  </div>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <ShoppingBag size={40} className="mx-auto text-slate-300" />
                  <div className="text-sm font-black text-slate-800">
                    Your India Post COD Cart is Empty
                  </div>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Add Bulk Customer products, MyStamp sheets, Gangajal packs, or postal service kits for Speed Post COD delivery.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="font-bold text-slate-900 truncate">{item.title}</div>
                          <div className="text-[11px] text-slate-500 tabular-nums">
                            {item.vendorName} · ₹{item.price}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(item.id, -1)}
                            className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center font-mono font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(item.id, 1)}
                            className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveCartItem(item.id)}
                            className="p-1 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer ml-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={handleCheckoutSubmit}
                    className="space-y-3 pt-4 border-t border-slate-200"
                  >
                    <div className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Doorstep Speed Post COD Delivery Details
                    </div>
                    {checkoutError && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                        {checkoutError}
                      </div>
                    )}
                    <input
                      type="text"
                      required
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      placeholder="Recipient Full Name *"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                    />
                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={checkoutMobile}
                        onChange={(e) =>
                          setCheckoutMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
                        }
                        placeholder="10-Digit Mobile *"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                      />
                      <select
                        value={checkoutBeat}
                        onChange={(e) => setCheckoutBeat(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                      >
                        <option value="Beat 2">Beat 2 (Dadabari Priority)</option>
                        <option value="Beat 1">Beat 1 (Division Hub)</option>
                        <option value="Beat 5">Beat 5</option>
                        <option value="Beat 6">Beat 6</option>
                        <option value="Beat 14">Beat 14</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      required
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      placeholder={`House No, Colony & Landmark (PIN ${activeVicinityZone.pincode}) *`}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />

                    <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Cart Subtotal ({totalCartCount} items)</span>
                        <span className="font-mono font-bold tabular-nums">
                          ₹{(Number(totalCartAmount) || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-emerald-300">
                        <span>Speed Post COD · PIN {activeVicinityZone.pincode}</span>
                        <span className="font-mono font-bold">Flat ₹15 COD</span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-amber-400 pt-1.5 border-t border-white/15">
                        <span>Payable at Doorstep (Cash / IPPB QR)</span>
                        <span className="font-mono tabular-nums">
                          ₹{(Number(totalCartAmount) || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Truck size={15} />
                      <span>Confirm Speed Post COD Order</span>
                    </button>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-[11px] font-bold text-slate-700">
                        Save cart &amp; resume later:
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={cartRecoveryService.buildWhatsAppRecoveryHref(getOrBuildRecoverySession())}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            cartRecoveryService.recordWhatsAppRecoveryClick(getOrBuildRecoverySession())
                          }
                          className="py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                        >
                          <MessageCircle size={12} />
                          <span>WhatsApp Save</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const session = getOrBuildRecoverySession();
                            const res = cartRecoveryService.triggerAutomatedSmsRecovery({
                              ...session,
                              customerMobile: checkoutMobile || session.customerMobile,
                            });
                            setSmsRecoveryNotice(res.message);
                            setTimeout(() => setSmsRecoveryNotice(null), 5000);
                          }}
                          className="py-2 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Send size={12} className="text-amber-300" />
                          <span>SMS Reminder</span>
                        </button>
                      </div>
                      {smsRecoveryNotice && (
                        <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
                          {smsRecoveryNotice}
                        </div>
                      )}
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SANITIZED PUBLIC INQUIRY & SPEED POST STATUS TRACKER MODAL */}
      {isTrackerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-slate-950 via-red-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Truck size={20} className="text-amber-400" />
                <div>
                  <h3 className="font-black text-base">
                    India Post Inquiry &amp; Speed Post Status Lookup
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Verified lookup requiring Ticket/Barcode ID and registered mobile digits
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTrackerOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTrackerMode('INQUIRY')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                    trackerMode === 'INQUIRY'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bulk / Scheme Inquiry Lookup
                </button>
                <button
                  type="button"
                  onClick={() => setTrackerMode('SPEEDPOST')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                    trackerMode === 'SPEEDPOST'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Speed Post Barcode Lookup
                </button>
              </div>

              {trackerMode === 'INQUIRY' ? (
                <div className="space-y-4">
                  <form onSubmit={handleInquiryLookupSubmit} className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        required
                        value={trackRefInput}
                        onChange={(e) => setTrackRefInput(e.target.value)}
                        placeholder="Ticket / Reference ID (e.g. INQ-...)"
                        className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                      />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={trackMobileInput}
                        onChange={(e) => setTrackMobileInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-Digit Mobile or Last 4 Digits"
                        className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Search size={14} />
                      <span>Verify &amp; Check Inquiry Status</span>
                    </button>
                  </form>

                  {inquiryLookupResult && (
                    <div
                      className={`p-4 rounded-2xl border text-xs space-y-2 ${
                        inquiryLookupResult.found
                          ? 'bg-emerald-50 border-emerald-200 text-slate-800'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      {inquiryLookupResult.found ? (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-black text-emerald-800">
                              {inquiryLookupResult.referenceId}
                            </span>
                            <span className="font-bold text-emerald-700">
                              {inquiryLookupResult.status}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900">
                            {inquiryLookupResult.serviceOrProduct}
                          </div>
                          <div className="text-slate-600 tabular-nums">
                            PIN {inquiryLookupResult.pincode} · {inquiryLookupResult.beatNo} · Mobile{' '}
                            {inquiryLookupResult.maskedPhone}
                          </div>
                          <div className="text-slate-700">{inquiryLookupResult.note}</div>
                        </>
                      ) : (
                        <div>{inquiryLookupResult.note}</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <form onSubmit={handleBarcodeLookupSubmit} className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        required
                        value={barcodeLookupInput}
                        onChange={(e) => setBarcodeLookupInput(e.target.value)}
                        placeholder="Speed Post Barcode (SP-...)"
                        className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                      />
                      <input
                        type="tel"
                        required
                        maxLength={4}
                        value={barcodeMobileLast4}
                        onChange={(e) =>
                          setBarcodeMobileLast4(e.target.value.replace(/\D/g, '').slice(0, 4))
                        }
                        placeholder="Last 4 Digits of Mobile"
                        className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Search size={14} />
                      <span>Track Speed Post Dispatch</span>
                    </button>
                  </form>

                  {barcodeLookupResult.searched && (
                    <div
                      className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                        barcodeLookupResult.match
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      {barcodeLookupResult.match ? (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-black text-red-700">
                              {barcodeLookupResult.match.speedPostBarcode ||
                                barcodeLookupResult.match.id}
                            </span>
                            <span className="font-bold text-emerald-800">
                              {barcodeLookupResult.match.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900">
                            {barcodeLookupResult.match.productTitle}
                          </div>
                          <div className="text-slate-600 tabular-nums">
                            PIN {barcodeLookupResult.match.pincode} · COD ₹
                            {barcodeLookupResult.match.codAmount} · Mobile XXXXXX
                            {barcodeLookupResult.match.customerMobile.slice(-4)}
                          </div>
                        </>
                      ) : (
                        <div>{barcodeLookupResult.error}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING WHATSAPP INDIA POST SUPPORT TRIGGER */}
      <a
        href={`https://api.whatsapp.com/send?phone=${getPincodeHub(activeVicinityZone.pincode).whatsappPhone}&text=${encodeURIComponent(
          `Namaste India Post Support Desk (PIN ${activeVicinityZone.pincode} · ${activeVicinityZone.officeName}),\nI need quick assistance with Postal Schemes, Speed Post COD, or Bulk Customer Product Promotion.`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with India Post WhatsApp Support"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl border border-emerald-400/50 transition-transform hover:scale-105"
      >
        <MessageCircle size={18} className="shrink-0" />
        <span className="text-xs font-black tracking-wide hidden sm:inline">
          {translate('whatsapp_desk', lang)}
        </span>
      </a>
    </div>
  );
}
