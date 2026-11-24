import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Award,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Phone,
  Search,
  ChevronLeft,
  ChevronRight,
  Share2,
  Copy,
  Check,
  Lock,
  Unlock,
  X,
  MessageCircle,
  Send,
  Globe,
  TrendingUp,
  Layers,
  LayoutGrid,
  Store,
  Coffee,
  Utensils,
  Scissors,
  Sparkles,
  FileText,
  Landmark,
  Truck,
  Package,
  Building2,
  MapPin,
  UserCheck,
  Shirt,
  Smartphone,
  Tv,
  Zap,
  BadgePercent,
  ShoppingCart,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Wallet,
  Gift,
  Newspaper,
  Clock,
  BatteryCharging,
  ShieldCheck,
  Cake,
  Calendar,
  HeartPulse,
  Leaf,
  Navigation,
} from 'lucide-react';
import { POSTAL_PRODUCTS } from '../data/productsData';
import { ProductDefinition, StaffProductVertical, LogisticsDispatchOrder } from '../types/models';
import { customerService } from '../services/customerService';
import { staffProductService } from '../services/staffProductService';
import { aiCommercialVerificationService } from '../services/aiCommercialVerificationService';
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
import {
  OFFICIAL_BRAND_STORES,
  resolveBrandSlug,
  getConsolidatedProductsForBrand,
} from '../services/brandDirectoryService';
import {
  cartRecoveryService,
  CartRecoverySession,
} from '../services/cartRecoveryService';
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
import imgCatAcademy from '../assets/images/store_academy_courses_1794731365263.jpg';
import imgBrandApparel from '../assets/images/brand_apparel_fashion_1794743634256.jpg';
import imgBrandElectronics from '../assets/images/brand_electronics_hub_1794743634422.jpg';
import imgBrandFootwear from '../assets/images/brand_footwear_sports_1794747058446.jpg';
import imgBrandHomeGadgets from '../assets/images/brand_home_gadgets_1794747072023.jpg';
import imgBrandSupermarket from '../assets/images/brand_supermarket_mart_1794743632575.jpg';
import imgBrandQsrPizza from '../assets/images/brand_qsr_pizza_1794743632250.jpg';
import imgDigitalDocs from '../assets/images/store_digital_documents_1794731363970.jpg';
import imgGangajal from '../assets/images/prod_gangajal_sacred_1794734840915.jpg';
import imgHandloom from '../assets/images/store_kota_handloom_1794731364865.jpg';
import imgEvScooter from '../assets/images/ev_scooter_mobility_1794822882283.jpg';
import imgEvBattery from '../assets/images/ev_lithium_battery_1794822883055.jpg';
import imgEvCharger from '../assets/images/ev_fast_charger_1794822883729.jpg';
import imgEvAccessories from '../assets/images/ev_accessories_kit_1794822883888.jpg';
import imgBakeryDairy from '../assets/images/local_bakery_dairy_1794822884061.jpg';
import imgLaundryEvent from '../assets/images/laundry_event_kit_1794822884997.jpg';
import imgPharmaWellness from '../assets/images/prod_b2b_pharma_wellness_1794734843342.jpg';
import imgSabjiMandi from '../assets/images/sabji_mandi_fresh_1794971673626.jpg';

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
import CategoryCatalogRow from './public/CategoryCatalogRow';
import { SupportedLanguage, getInitialLanguage, setStoredLanguage, translate } from '../utils/localization';

interface PublicHomePortalProps {
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
  { label: 'Regional Hub · Doorstep Speed Post COD (13 Hubs)', regionCode: 'Kota-Baran' },
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
  filterPillTarget?: CategoryFilterPillId;
  scrollTargetId?: string;
  featuredSku: string;
  featuredTitle: string;
  featuredPrice: number;
  featuredMrp: number;
  featuredBeatNo: string;
  imageSrc: string;
  kicker: string;
  headline: string;
  subtitle: string;
  rateHighlight: string;
  rateLabel: string;
  taxHighlight: string;
  maxLimit: string;
  ctaCategoryLabel: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-ev',
    tabLabel: 'XPEEDO EV',
    brandName: 'XPEEDO EV & Green Mobility',
    vendorPromoTag: 'Authorized EV Hub · Doorstep Test-Ride & COD',
    discountTag: 'Up to 25% OFF + ₹15 Express Del',
    heroGradient: 'from-emerald-950 via-teal-900 to-cyan-950',
    productCode: 'DNK_PARCEL',
    targetCategory: 'B2B_MERCHANTS',
    filterPillTarget: 'ev',
    scrollTargetId: 'vendor-carousels-hub',
    featuredSku: 'XPEEDO-EV-X1PRO-54999',
    featuredTitle: 'XPEEDO EV · X1 Pro City & Cargo Electric Scooter',
    featuredPrice: 54999,
    featuredMrp: 68999,
    featuredBeatNo: 'Beat 2',
    imageSrc: imgEvScooter,
    kicker: 'XPEEDO EV Mobility Hub · Kota & Baran Division',
    headline: 'XPEEDO EV: Electric Scooters, 60V Batteries & Fast Chargers',
    subtitle:
      'Book doorstep test rides or order swappable LiFePO4 battery packs, 10A auto-cut chargers & GPS kits on insured Speed Post COD with genuine brand warranty.',
    rateHighlight: '25% OFF',
    rateLabel: 'Extra Fest Offer + Warranty',
    taxHighlight: '₹15 Flat Beat Delivery Fee',
    maxLimit: '13 Kota & Baran Hubs',
    ctaCategoryLabel: 'Explore XPEEDO EV Hub',
  },
  {
    id: 'slide-logistics',
    tabLabel: 'Logistics & COD',
    brandName: 'XPOKART Logistics & Speed Post COD',
    vendorPromoTag: 'Priority 24-48Hr Beat Delivery · Parcel & Dak Niryat',
    discountTag: 'Up to 35% OFF · Flat ₹15 Beat Fee',
    heroGradient: 'from-rose-950 via-red-900 to-slate-950',
    productCode: 'DNK_PARCEL',
    targetCategory: 'LOGISTICS_COURIER',
    filterPillTarget: 'all',
    scrollTargetId: 'post-office-banking-store',
    featuredSku: 'POST-SPEEDPOST-COD-95',
    featuredTitle: 'Speed Post COD · Priority Parcel Box & Niryat Booking',
    featuredPrice: 95,
    featuredMrp: 120,
    featuredBeatNo: 'Beat 2',
    imageSrc: imgSlideLogistics,
    kicker: 'Sovereign Postal Logistics · PIN 324009 & 13 Hubs',
    headline: 'Speed Post COD: Priority Courier Booking & Dak Ghar Niryat',
    subtitle:
      'Same-day doorstep parcel pickup, priority barcode tracking, and guaranteed flat ₹15 delivery fee across all 13 Kota & Baran hubs with Speed Post COD.',
    rateHighlight: '₹15 Flat',
    rateLabel: 'Verified Beat Doorstep Pickup',
    taxHighlight: 'Insured Speed Post Tracking',
    maxLimit: 'Pan-India & 190+ Countries',
    ctaCategoryLabel: 'Book Speed Post COD',
  },
  {
    id: 'slide-ippb-banking',
    tabLabel: 'IPPB Banking',
    brandName: 'Post Office & IPPB Sovereign Banking',
    vendorPromoTag: 'Official India Post Savings, PLI & ₹10L Accident Cover',
    discountTag: '8.2% p.a. Tax-Free + ₹10L Cover @ ₹399',
    heroGradient: 'from-red-950 via-rose-950 to-amber-950',
    productCode: 'SSA',
    targetCategory: 'SAVINGS_ACCOUNTS',
    filterPillTarget: 'all',
    scrollTargetId: 'post-office-banking-store',
    featuredSku: 'IPPB-ACCIDENT-399',
    featuredTitle: 'IPPB Sovereign · ₹10 Lakh Accidental Insurance Cover (1 Yr)',
    featuredPrice: 399,
    featuredMrp: 549,
    featuredBeatNo: 'Beat 2',
    imageSrc: imgSlideIppb,
    kicker: 'India Post & IPPB Official Sovereign Banking',
    headline: 'IPPB Banking: Zero-Balance Digital Accounts & ₹10L Cover',
    subtitle:
      'Open Sukanya Samriddhi (8.2%), SCSS, PLI Suraksha, IPPB zero-balance digital accounts, and get ₹10L accidental coverage with doorstep biometric assistance.',
    rateHighlight: '8.2% p.a.',
    rateLabel: 'Peak Sovereign Tax-Free Yield',
    taxHighlight: '₹15 Doorstep Beat Assist',
    maxLimit: 'Govt of India Sovereign Guarantee',
    ctaCategoryLabel: 'Open Banking & Schemes',
  },
  {
    id: 'slide-csc-emitra',
    tabLabel: 'CSC & e-Mitra',
    brandName: 'Sovereign CSC e-Mitra & Citizen Desk',
    vendorPromoTag: 'Doorstep Child Aadhaar (0-5 Yrs), DLC & Legal E-Stamps',
    discountTag: 'Govt Approved Rates + Doorstep Visit',
    heroGradient: 'from-sky-950 via-blue-900 to-indigo-950',
    productCode: 'IPPB_BANKING',
    targetCategory: 'PHILATELY_GANGAJAL',
    filterPillTarget: 'all',
    scrollTargetId: 'post-office-banking-store',
    featuredSku: 'GOV-CELC-MOBILE-50',
    featuredTitle: 'Child Aadhaar (0–5 Yrs CELC), Mobile Update & e-Mitra KYC',
    featuredPrice: 50,
    featuredMrp: 100,
    featuredBeatNo: 'Beat 2',
    imageSrc: imgDigitalDocs,
    kicker: 'UIDAI CELC & Rajasthan e-Mitra Authorized Desk',
    headline: 'CSC & e-Mitra: Child Aadhaar, Jeevan Pramaan & E-Stamps',
    subtitle:
      'Instant doorstep biometric e-KYC, newborn Aadhaar enrolment (CELC), digital pension life certificates (DLC), and authorized e-Gras Rajasthan revenue stamp papers.',
    rateHighlight: 'Govt Fee',
    rateLabel: 'Official UIDAI & e-Gras Tariffs',
    taxHighlight: 'Same-Day Beat Slot',
    maxLimit: '13 Kota & Baran Hubs',
    ctaCategoryLabel: 'Book e-Mitra / Aadhaar Visit',
  },
  {
    id: 'slide-apparel',
    tabLabel: "Allen Solly & Levi's",
    brandName: "Allen Solly, Levi's & Fabindia",
    vendorPromoTag: 'Showroom-Sealed Brand Promo · 48-Hr Beat Size Exchange',
    discountTag: 'Up to 30% OFF + Genuine Tag Seal',
    heroGradient: 'from-amber-950 via-red-900 to-orange-950',
    productCode: 'DNK_PARCEL',
    targetCategory: 'B2B_MERCHANTS',
    filterPillTarget: 'apparel',
    scrollTargetId: 'fashion-footwear-section',
    featuredSku: 'BRAND-SOLLY-POLO-1799',
    featuredTitle: 'Allen Solly · Pique Cotton Polo & Chino Combo',
    featuredPrice: 1799,
    featuredMrp: 2499,
    featuredBeatNo: 'Beat 2',
    imageSrc: imgBrandApparel,
    kicker: "Authorized Fashion Storefront · Allen Solly, Levi's & Fabindia",
    headline: "Allen Solly & Levi's: Showroom Polos, Denim & Festive Sets on COD",
    subtitle:
      'Direct showroom-sealed polos, stretch 511 denim, linen blazers & Fabindia cotton-silk kurta sets delivered across Kota & Baran with flat ₹15 delivery & GST invoice.',
    rateHighlight: '30% OFF',
    rateLabel: 'On Retail Brand MRP · GST Invoice',
    taxHighlight: '48-Hr Beat Size Exchange',
    maxLimit: '100% Authentic Brands',
    ctaCategoryLabel: 'Shop Branded Apparel',
  },
  {
    id: 'slide-bakeries-dairies',
    tabLabel: 'Bakeries & Dairies',
    brandName: "Dadabari Fresh Dairies & Domino's QSR",
    vendorPromoTag: 'Morning 7 AM Cold-Chain Milk, Cakes & Hot Pizza Combos',
    discountTag: 'Up to 24% OFF + Daily Fresh Pack',
    heroGradient: 'from-amber-950 via-yellow-900 to-red-900',
    productCode: 'DNK_PARCEL',
    targetCategory: 'B2B_MERCHANTS',
    filterPillTarget: 'bakery_dairy',
    scrollTargetId: 'dairy-bakery-section',
    featuredSku: 'XPO-BAKERY-DAIRY-649',
    featuredTitle: 'Dadabari Fresh · A2 Milk 2L, Paneer 500g & Truffle Cake',
    featuredPrice: 649,
    featuredMrp: 850,
    featuredBeatNo: 'Beat 2',
    imageSrc: imgBakeryDairy,
    kicker: "Fresh Dairy, Artisanal Bakery & Domino's Circle",
    headline: "Fresh A2 Milk, Celebration Cakes & Domino's Feasts in 25 Min",
    subtitle:
      "Daily morning A2 buffalo milk, malai paneer, truffle birthday cakes, butter croissants, and Domino's hot pizza combos with Cash on Delivery & ₹15 Beat fee.",
    rateHighlight: '24% OFF',
    rateLabel: 'Morning Fresh Subscription & Daily Combo',
    taxHighlight: '25 Min Express Dispatch',
    maxLimit: 'Cold-Chain Verified Fresh',
    ctaCategoryLabel: 'Order Bakeries & Dairies',
  },
  {
    id: 'slide-laundries-saloons',
    tabLabel: 'Laundries & Saloons',
    brandName: 'Express Steam Laundry & Neighborhood Saloon',
    vendorPromoTag: 'Hostel Wash Bundles, Steam Dry-Clean & Grooming Packages',
    discountTag: 'Up to 29% OFF + 24-Hr Beat Pickup',
    heroGradient: 'from-violet-950 via-purple-900 to-fuchsia-950',
    productCode: 'DNK_PARCEL',
    targetCategory: 'B2B_MERCHANTS',
    filterPillTarget: 'laundry_events',
    scrollTargetId: 'local-services-ecosystem',
    featuredSku: 'XPO-LAUNDRY-EVENT-499',
    featuredTitle: 'Express Steam · 10-Garment Dry-Clean & Crisp Press',
    featuredPrice: 499,
    featuredMrp: 699,
    featuredBeatNo: 'Beat 2',
    imageSrc: imgLaundryEvent,
    kicker: 'Express Steam Laundry & Neighborhood Grooming',
    headline: '24-Hr Steam Dry Cleaning, Hostel Wash & Grooming Bundles',
    subtitle:
      'Doorstep Beat garment pickup returned crisp in sealed kraft parcels, weekly 6kg Kota hostel laundry plans, and verified neighborhood saloon grooming appointments.',
    rateHighlight: '29% OFF',
    rateLabel: '24-Hour Doorstep Pickup & Kraft Return',
    taxHighlight: '₹15 Beat Pickup & Drop',
    maxLimit: 'Express 24-Hr Turnaround',
    ctaCategoryLabel: 'Book Laundry & Saloons',
  },
  {
    id: 'slide-event-mgmt',
    tabLabel: 'Event Management',
    brandName: 'Celebration & Event Decor Hub',
    vendorPromoTag: 'Wedding Decor Kits, Brass Pooja Lamps & Sound Systems',
    discountTag: 'Up to 32% OFF + Full Setup COD',
    heroGradient: 'from-indigo-950 via-purple-950 to-slate-900',
    productCode: 'DNK_PARCEL',
    targetCategory: 'B2B_MERCHANTS',
    filterPillTarget: 'laundry_events',
    scrollTargetId: 'vendor-carousels-hub',
    featuredSku: 'XPO-EVENT-DECOR-1299',
    featuredTitle: 'XPOKART Events · Festival Brass Diya & Floral Stage Decor Kit',
    featuredPrice: 1299,
    featuredMrp: 1899,
    featuredBeatNo: 'Beat 2',
    imageSrc: imgBrandHomeGadgets,
    kicker: 'Event Decor, Sound & Celebration Kits · Kota & Baran',
    headline: 'Event Management: Wedding Decor, Brass Lamps & Catering Kits',
    subtitle:
      'Curated festival lighting, traditional brass lamps, floral mandap setups, and sound equipment rentals delivered to event venues on Speed Post COD.',
    rateHighlight: '32% OFF',
    rateLabel: 'Complete Venue Kit · Verified Price',
    taxHighlight: 'Beat Delivery & Setup Help',
    maxLimit: 'Same-Day Venue Dispatch',
    ctaCategoryLabel: 'Book Event Management',
  },
];

interface CategoryCatalogDefinition {
  id: Exclude<UnifiedCategoryId, 'ALL'>;
  shortLabel: string;
  title: string;
  subtitle: string;
  rateOrMarginTag: string;
  imageSrc: string;
  badgeText: string;
  accentGradient: string;
  storefrontVertical?: StaffProductVertical;
}

const CATEGORY_CATALOG: CategoryCatalogDefinition[] = [
  {
    id: 'SAVINGS_ACCOUNTS',
    shortLabel: 'Savings & Pension',
    title: 'Savings Accounts & Sovereign Wealth',
    subtitle: 'Sukanya Samriddhi (SSY), Public Provident Fund (PPF), Monthly Income Scheme (MIS) & Senior Citizen (SCSS).',
    rateOrMarginTag: 'Up to 8.2% p.a. · EEE Tax-Free',
    imageSrc: imgSlideSsy,
    badgeText: 'Pillar 01 · Official India Post',
    accentGradient: 'from-rose-950 via-red-900 to-slate-950',
  },
  {
    id: 'RECURRING_DEPOSITS',
    shortLabel: 'RD, TD, NSC & KVP',
    title: 'Recurring Deposits & Growth Certificates',
    subtitle: '5-Year Recurring Deposit, Fixed Term Deposits, National Savings Certificate & Kisan Vikas Patra.',
    rateOrMarginTag: '6.7% – 7.7% p.a. · Doubles in 115M',
    imageSrc: imgCatDeposits,
    badgeText: 'Pillar 02 · Term Wealth',
    accentGradient: 'from-amber-950 via-orange-950 to-slate-950',
  },
  {
    id: 'PLI_SCHEMES',
    shortLabel: 'PLI & RPLI Cover',
    title: 'Postal Life Insurance (PLI & RPLI)',
    subtitle: 'Suraksha Whole Life, Santosh Endowment & Rural Gram Santosh with sovereign claim security.',
    rateOrMarginTag: '₹52 – ₹76 / 1K Annual Bonus',
    imageSrc: imgSlidePli,
    badgeText: 'Pillar 03 · Est. 1884',
    accentGradient: 'from-indigo-950 via-slate-900 to-slate-950',
  },
  {
    id: 'IPPB_LOAN_INSURANCE',
    shortLabel: 'IPPB, Loans & Aadhaar',
    title: 'IPPB Digital Banking, GPA & Doorstep KYC',
    subtitle: '₹10L Accident Cover at ₹399/yr, Doorstep Loans, Child Aadhaar CELC, Jeevan Pramaan DLC & Merchant QR.',
    rateOrMarginTag: 'Zero Balance · Instant AePS',
    imageSrc: imgSlideIppb,
    badgeText: 'Pillar 04 · Aapka Bank',
    accentGradient: 'from-emerald-950 via-teal-900 to-slate-950',
    storefrontVertical: 'Banking & Finance',
  },
  {
    id: 'LOGISTICS_COURIER',
    shortLabel: 'Logistics & Speed Post',
    title: 'Speed Post COD, Parcel & Niryat Kendra',
    subtitle: 'Priority courier booking, international DNK export cartons, and fast B2B/D2C parcel pickup.',
    rateOrMarginTag: 'Flat ₹15 Beat Dispatch',
    imageSrc: imgCatCourier,
    badgeText: 'Vertical 05 · XPOKART Express',
    accentGradient: 'from-red-950 via-rose-900 to-slate-950',
    storefrontVertical: 'Logistics & Courier Services',
  },
  {
    id: 'PHILATELY_GANGAJAL',
    shortLabel: 'MyStamp & Gangajal',
    title: 'MyStamp Philately, Gangajal & Digital Docs',
    subtitle: 'Personalized photo postage stamp sheets, Gangotri Gangajal bottles, Child CELC & Jeevan Pramaan.',
    rateOrMarginTag: '₹30 – ₹300 Official Retail',
    imageSrc: imgCatPhilately,
    badgeText: 'Vertical 06 · Sovereign Retail',
    accentGradient: 'from-purple-950 via-fuchsia-950 to-slate-950',
    storefrontVertical: 'Documents & Digital Services',
  },
  {
    id: 'B2B_MERCHANTS',
    shortLabel: 'Local Storefront',
    title: 'Verified Brand & Neighborhood Storefront',
    subtitle: '4-Factor Verified Kota & Baran stores, Kota Doria handloom, wellness kits & groceries on COD.',
    rateOrMarginTag: 'Same-Day Express COD',
    imageSrc: imgCatB2b,
    badgeText: 'Vertical 07 · Verified Stores',
    accentGradient: 'from-orange-950 via-amber-900 to-slate-950',
    storefrontVertical: 'Custom Staff / Partner Products',
  },
  {
    id: 'SKILL_ACADEMY',
    shortLabel: 'Course & LDCE Hub',
    title: 'Postal LDCE & Skill Academy',
    subtitle: 'Departmental Inspector/PA exam test series, postal manual guides & skill training.',
    rateOrMarginTag: 'Official Study Packs',
    imageSrc: imgCatAcademy,
    badgeText: 'Vertical 08 · Skill Hub',
    accentGradient: 'from-violet-950 via-indigo-900 to-slate-950',
    storefrontVertical: 'Course & Skill Academy',
  },
];

interface NeighborhoodCategoryItem {
  id: string;
  title: string;
  subtitle: string;
  count: number;
  icon: any;
  gradient: string;
  borderClass: string;
  badgeText: string;
  filterCategory: string;
}

const NEIGHBORHOOD_CATEGORIES: NeighborhoodCategoryItem[] = [
  {
    id: 'kirana',
    title: 'General Stores & Kirana',
    subtitle: 'Daily kitchen ration, pulses, flour & home essentials',
    count: 14,
    icon: Store,
    gradient: 'from-indigo-600 via-violet-600 to-purple-800',
    borderClass: 'border-indigo-200 hover:border-indigo-400',
    badgeText: '13 Hubs · Daily Stock',
    filterCategory: 'Retail',
  },
  {
    id: 'tea_cafes',
    title: 'Tea Stalls & Cafes',
    subtitle: 'Local tea points, refreshments & evening snacks',
    count: 8,
    icon: Coffee,
    gradient: 'from-amber-600 via-orange-600 to-red-700',
    borderClass: 'border-amber-200 hover:border-amber-400',
    badgeText: 'Instant Delivery',
    filterCategory: 'Services',
  },
  {
    id: 'dairies',
    title: 'Dairies & Milk Booths',
    subtitle: 'Fresh milk, paneer, curd & dairy product supply',
    count: 11,
    icon: Package,
    gradient: 'from-emerald-600 via-teal-600 to-cyan-800',
    borderClass: 'border-emerald-200 hover:border-emerald-400',
    badgeText: 'Morning Fresh Supply',
    filterCategory: 'Retail',
  },
  {
    id: 'saloons',
    title: 'Saloons & Grooming',
    subtitle: 'Neighborhood hair studios, beauty care & grooming',
    count: 9,
    icon: Scissors,
    gradient: 'from-pink-600 via-rose-600 to-red-700',
    borderClass: 'border-pink-200 hover:border-pink-400',
    badgeText: 'Appointment Booking',
    filterCategory: 'Services',
  },
  {
    id: 'bakeries',
    title: 'Bakeries & Confectionery',
    subtitle: 'Fresh birthday cakes, biscuits, bakes & rusks',
    count: 7,
    icon: Sparkles,
    gradient: 'from-amber-700 via-yellow-700 to-orange-800',
    borderClass: 'border-amber-200 hover:border-amber-400',
    badgeText: 'Same-Day Bakes',
    filterCategory: 'Retail',
  },
  {
    id: 'restaurants',
    title: 'Restaurants & Tiffin',
    subtitle: 'Pure veg thalis, tiffin services & dining',
    count: 12,
    icon: Utensils,
    gradient: 'from-red-700 via-rose-700 to-orange-800',
    borderClass: 'border-red-200 hover:border-red-400',
    badgeText: 'Speed Post COD Delivery',
    filterCategory: 'Wholesale',
  },
  {
    id: 'hotels',
    title: 'Hotels & Stays',
    subtitle: 'Comfortable lodge rooms, guest houses & homestays',
    count: 5,
    icon: Building2,
    gradient: 'from-blue-700 via-cyan-700 to-teal-900',
    borderClass: 'border-blue-200 hover:border-blue-400',
    badgeText: 'Dadabari Hospitality',
    filterCategory: 'Services',
  },
  {
    id: 'handloom_decor',
    title: 'Handloom, Crafts & Decor',
    subtitle: 'Authentic Kota Doria sarees, home handloom & festive gift sets',
    count: 18,
    icon: Layers,
    gradient: 'from-purple-800 via-indigo-900 to-slate-950',
    borderClass: 'border-purple-200 hover:border-purple-400',
    badgeText: 'Verified Regional Stock',
    filterCategory: 'Retail',
  },
];

interface InstantUtilityItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  actionLabel: string;
  icon: any;
  productCode: string;
  mrpFee: string;
  discountedFee: string;
}

const INSTANT_UTILITIES: InstantUtilityItem[] = [
  {
    id: 'aadhaar',
    title: 'Aadhaar Seva & Biometric KYC',
    description: 'Child Aadhaar (0–5 yrs CELC), Mobile/Email update & Doorstep AePS Cash.',
    badge: 'UIDAI Official',
    actionLabel: 'Book Visit',
    icon: UserCheck,
    productCode: 'IPPB_BANKING',
    mrpFee: '₹100',
    discountedFee: '₹50',
  },
  {
    id: 'pan_tax',
    title: 'PAN Card & Income Tax e-KYC',
    description: 'Instant Digital PAN Card, Correction, Reprint & Aadhaar Linking.',
    badge: 'Income Tax Dept.',
    actionLabel: 'Apply PAN',
    icon: FileText,
    productCode: 'IPPB_BANKING',
    mrpFee: '₹250',
    discountedFee: '₹180',
  },
  {
    id: 'certificates',
    title: 'Birth, Caste & Domicile Certificates',
    description: 'Rajasthan Revenue Bonafide, SC/ST/OBC/EWS digital certificate & COD delivery.',
    badge: 'Govt. of Rajasthan',
    actionLabel: 'Apply Cert',
    icon: Landmark,
    productCode: 'IPPB_BANKING',
    mrpFee: '₹150',
    discountedFee: '₹110',
  },
  {
    id: 'voter_ayushman',
    title: 'Voter ID & Ayushman Bharat Card',
    description: 'Election Commission EPIC Voter ID & PMJAY ₹5L free health cover card.',
    badge: 'PMJAY Sovereign',
    actionLabel: 'Get Card',
    icon: Shield,
    productCode: 'IPPB_BANKING',
    mrpFee: '₹120',
    discountedFee: '₹80',
  },
  {
    id: 'rent_stamps',
    title: 'Rent Agreement & Legal E-Stamps',
    description: 'Official e-Gras Rajasthan e-Stamp paper, notarized rent deeds & affidavits.',
    badge: 'Revenue & Stamps',
    actionLabel: 'Order Deed',
    icon: FileText,
    productCode: 'IPPB_BANKING',
    mrpFee: '₹350',
    discountedFee: '₹275',
  },
  {
    id: 'speed_post',
    title: 'Speed Post COD & Parcel Pickup',
    description: 'Same-day doorstep courier pickup, COD settlement & IPPB QR remittance.',
    badge: 'India Post Official',
    actionLabel: 'Book Pickup',
    icon: Truck,
    productCode: 'DNK_PARCEL',
    mrpFee: '₹120',
    discountedFee: '₹95',
  },
];

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
  icon: any;
  imageSrc: string;
  gradient: string;
  items: HighMarginProductItem[];
}

const XPEEDO_EV_PRODUCTS: HighMarginProductItem[] = [
  {
    id: 'ev-scooter-01',
    sku: 'XPEEDO-EV-X1PRO-54999',
    title: 'XPEEDO EV · X1 Pro City & Cargo Electric Scooter',
    brand: 'XPEEDO EV',
    categoryTag: 'EV Scooters',
    mrpPrice: 68999,
    retailPrice: 54999,
    wholesalePrice: 46749,
    marginAmount: 8250,
    marginPercent: 15,
    imageSrc: imgEvScooter,
    description: '85 km range BLDC hub motor scooter with detachable 60V battery & rear parcel carrier.',
    features: ['85 km Range · 150 kg Load', 'Doorstep Test Ride Available'],
  },
  {
    id: 'ev-battery-02',
    sku: 'XPEEDO-LFP-60V30AH-18499',
    title: 'XPEEDO EV · 60V 30Ah LiFePO4 Swappable Battery Pack',
    brand: 'XPEEDO EV',
    categoryTag: 'Lithium Batteries',
    mrpPrice: 23999,
    retailPrice: 18499,
    wholesalePrice: 14799,
    marginAmount: 3700,
    marginPercent: 20,
    imageSrc: imgEvBattery,
    description: 'Smart BMS automotive-grade LiFePO4 battery with 2,000+ cycles & IP67 enclosure.',
    features: ['2,000+ Charge Cycles · IP67', '3-Yr Cell Replacement Warranty'],
  },
  {
    id: 'ev-charger-03',
    sku: 'XPEEDO-CHG-60V10A-2999',
    title: 'XPEEDO EV · 60V/72V 10A Smart Auto-Cut Fast Charger',
    brand: 'XPEEDO EV',
    categoryTag: 'Fast Chargers',
    mrpPrice: 4199,
    retailPrice: 2999,
    wholesalePrice: 2339,
    marginAmount: 660,
    marginPercent: 22,
    imageSrc: imgEvCharger,
    description: 'Die-cast aluminum finned 10A intelligent fast charger with over-voltage auto-cut.',
    features: ['0–80% Charge in 2.5 Hrs', 'Auto Cut-Off Surge Protection'],
  },
  {
    id: 'ev-acc-04',
    sku: 'XPEEDO-ACC-KIT-1899',
    title: 'XPEEDO EV · Helmet, GPS Tracker & Delivery Rack Kit',
    brand: 'XPEEDO EV',
    categoryTag: 'EV Accessories',
    mrpPrice: 2699,
    retailPrice: 1899,
    wholesalePrice: 1424,
    marginAmount: 475,
    marginPercent: 25,
    imageSrc: imgEvAccessories,
    description: 'ISI modular EV helmet, Geo-Trace GPS tracker, alloy phone mount & saddle bag.',
    features: ['Waterproof GPS + Alloy Mount', 'Flat ₹15 Speed Post COD'],
  },
  {
    id: 'ev-battery-05',
    sku: 'XPEEDO-LFP-48V24AH-13999',
    title: 'XPEEDO EV · 48V 24Ah Commuter Lithium Battery Pack',
    brand: 'XPEEDO EV',
    categoryTag: 'Commuter Battery',
    mrpPrice: 17999,
    retailPrice: 13999,
    wholesalePrice: 11339,
    marginAmount: 2660,
    marginPercent: 19,
    imageSrc: imgEvBattery,
    description: 'Lightweight swappable 48V lithium pack tuned for low-speed urban delivery scooters.',
    features: ['3-Year Cell Warranty', 'Doorstep Battery Swap'],
  },
  {
    id: 'ev-rack-06',
    sku: 'XPEEDO-CARGO-RACK-2499',
    title: 'XPEEDO EV · Heavy-Duty Parcel Box & USB Charger Mount',
    brand: 'XPEEDO EV',
    categoryTag: 'Cargo Kit',
    mrpPrice: 3499,
    retailPrice: 2499,
    wholesalePrice: 1899,
    marginAmount: 600,
    marginPercent: 24,
    imageSrc: imgEvAccessories,
    description: 'Waterproof 45L parcel carrier box with lockable steel frame & handlebar USB.',
    features: ['45L Lockable Parcel Box', 'Same-Day Express Dispatch'],
  },
];

interface CompactCatalogProduct {
  id: string;
  sku: string;
  title: string;
  brand: string;
  categoryKey: Exclude<CategoryFilterPillId, 'all'>;
  categoryTag: string;
  vendorGroupId: string;
  mrpPrice: number;
  retailPrice: number;
  marginAmount: number;
  marginPercent: number;
  imageSrc: string;
  description: string;
  beatNo: string;
  beatManager: string;
  pincode: string;
  isTrending?: boolean;
}

interface VendorStoreGroupMeta {
  id: string;
  anchorId?: string;
  vendorName: string;
  tagline: string;
  verifiedMeta: string;
  marginSummary: string;
  beatManagerName: string;
}

interface PostOfficeBankingCardItem {
  id: string;
  subTab: Exclude<PostOfficeBankingSubTab, 'ALL_PO'>;
  productCode: string;
  sku: string;
  title: string;
  badge: string;
  officialRateHighlight: string;
  mrpPrice: number;
  officialFeeOrPrice: number;
  marginAmount: number;
  marginPercent: number;
  canAddToCart: boolean;
  beatManager: string;
  beatNo: string;
  imageSrc: string;
  description: string;
  highlights: string[];
}

const POST_OFFICE_BANKING_TABS: {
  id: PostOfficeBankingSubTab;
  label: string;
  icon: any;
}[] = [
  { id: 'ALL_PO', label: 'All Official Services', icon: Landmark },
  { id: 'SAVINGS_SSY_SCSS', label: 'SSY & SCSS Savings', icon: Wallet },
  { id: 'INSURANCE_PLI', label: 'PLI / RPLI Insurance', icon: ShieldCheck },
  { id: 'IPPB_QR_COVER', label: 'IPPB, QR & ₹10L Cover', icon: Shield },
  { id: 'DLC_CELC_EMITRA', label: 'DLC, CELC & e-Mitra', icon: UserCheck },
  { id: 'MYSTAMP_GANGAJAL', label: 'MyStamp & Gangajal', icon: Package },
];

const POST_OFFICE_BANKING_OFFERINGS: PostOfficeBankingCardItem[] = [
  {
    id: 'po-ssy-01',
    subTab: 'SAVINGS_SSY_SCSS',
    productCode: 'SSA',
    sku: 'GOV-SSY-82-MIN250',
    title: 'Sukanya Samriddhi Yojana (SSY) · Girl Child Sovereign Account',
    badge: 'Govt Small Savings · EEE Tax-Free',
    officialRateHighlight: '8.2% p.a. (Highest Govt Rate)',
    mrpPrice: 350,
    officialFeeOrPrice: 250,
    marginAmount: 50,
    marginPercent: 20,
    canAddToCart: false,
    beatManager: 'Mahendra Kumar Meena',
    beatNo: 'Beat 2',
    imageSrc: imgSlideSsy,
    description: '100% tax-free sovereign savings for daughters aged 0–10 yrs with passbook & Beat assistance.',
    highlights: ['Min ₹250 · Max ₹1.5L/yr', 'Sec 80C + Maturity Exempt'],
  },
  {
    id: 'po-scss-02',
    subTab: 'SAVINGS_SSY_SCSS',
    productCode: 'SCSS',
    sku: 'GOV-SCSS-82-QUARTERLY',
    title: 'Senior Citizen Savings Scheme (SCSS) · 60+ Quarterly Pension',
    badge: 'Govt Pension Deposit',
    officialRateHighlight: '8.2% p.a. (Paid Quarterly)',
    mrpPrice: 1200,
    officialFeeOrPrice: 1000,
    marginAmount: 180,
    marginPercent: 18,
    canAddToCart: false,
    beatManager: 'Ekta Meena · Div Head',
    beatNo: 'All Beats',
    imageSrc: imgSlideScss,
    description: 'Top retirement deposit scheme up to ₹30 Lakh for senior citizens with quarterly auto-credit.',
    highlights: ['Min ₹1,000 · Max ₹30 Lakh', '5-Yr Tenure + 3-Yr Ext'],
  },
  {
    id: 'po-ppf-03',
    subTab: 'SAVINGS_SSY_SCSS',
    productCode: 'PPF',
    sku: 'GOV-PPF-71-EEE',
    title: 'Public Provident Fund (PPF) & Monthly Income (MIS 7.4%)',
    badge: 'Sovereign Long-Term Wealth',
    officialRateHighlight: '7.1% – 7.4% p.a.',
    mrpPrice: 600,
    officialFeeOrPrice: 500,
    marginAmount: 90,
    marginPercent: 18,
    canAddToCart: false,
    beatManager: 'Mahendra Kumar Meena',
    beatNo: 'Beat 2',
    imageSrc: imgCatDeposits,
    description: 'Court-attachment immune PPF compounding or steady 7.4% monthly MIS dividend into IPPB.',
    highlights: ['IPPB Auto-Standing Debit', 'Up to ₹15L Joint MIS Limit'],
  },
  {
    id: 'po-pli-04',
    subTab: 'INSURANCE_PLI',
    productCode: 'PLI_SURAKSHA',
    sku: 'PLI-SURAKSHA-DOC-199',
    title: 'PLI Suraksha & Santosh · ₹50L Sovereign Life Insurance',
    badge: 'Est. 1884 Govt Life Cover',
    officialRateHighlight: '₹52 – ₹76 / ₹1,000 Annual Bonus',
    mrpPrice: 299,
    officialFeeOrPrice: 199,
    marginAmount: 45,
    marginPercent: 23,
    canAddToCart: true,
    beatManager: 'Ekta Meena · Div Head',
    beatNo: 'All Beats',
    imageSrc: imgSlidePli,
    description: 'Lowest premium & highest bonus Govt life cover with Sec 80C rebate and Beat Officer KYC.',
    highlights: ['Cover ₹20,000 – ₹50 Lakh', 'Full Proposal & KYC Kit'],
  },
  {
    id: 'po-rpli-05',
    subTab: 'INSURANCE_PLI',
    productCode: 'RPLI_GRAM_SANTOSH',
    sku: 'RPLI-GRAM-149',
    title: 'RPLI Gram Suraksha & Gram Santosh · Rural & Urban Family Cover',
    badge: 'Rural & Semi-Urban Life Cover',
    officialRateHighlight: '₹60 – ₹65 / ₹1,000 Annual Bonus',
    mrpPrice: 220,
    officialFeeOrPrice: 149,
    marginAmount: 35,
    marginPercent: 23,
    canAddToCart: true,
    beatManager: 'Mahendra Kumar Meena',
    beatNo: 'Beat 2',
    imageSrc: imgSlidePli,
    description: 'Affordable sovereign endowment & whole-life policy up to ₹10L for families & traders.',
    highlights: ['Cover up to ₹10 Lakh', '3-Yr Loan & Surrender Ready'],
  },
  {
    id: 'po-ippb-06',
    subTab: 'IPPB_QR_COVER',
    productCode: 'IPPB_BANKING',
    sku: 'IPPB-DIGI-ACC-0',
    title: 'IPPB Zero-Balance Digital Savings & Doorstep Merchant QR Standee',
    badge: 'India Post Payments Bank',
    officialRateHighlight: '₹0 Min Bal · Instant UPI & AePS',
    mrpPrice: 150,
    officialFeeOrPrice: 99,
    marginAmount: 25,
    marginPercent: 25,
    canAddToCart: true,
    beatManager: 'Mahendra Kumar Meena',
    beatNo: 'Beat 2',
    imageSrc: imgSlideIppb,
    description: '5-minute paperless biometric IPPB account + laminated shopkeeper UPI QR standee & RuPay card.',
    highlights: ['DBT Subsidy & Virtual RuPay', 'Home AePS Cash Delivery'],
  },
  {
    id: 'po-gpa-07',
    subTab: 'IPPB_QR_COVER',
    productCode: 'IPPB_GPA',
    sku: 'IPPB-ACCIDENT-399',
    title: 'IPPB Sovereign · ₹10 Lakh Accidental Insurance Cover (1 Year)',
    badge: 'IPPB GPA Protection',
    officialRateHighlight: '₹10,00,000 Cover at ₹399/yr',
    mrpPrice: 549,
    officialFeeOrPrice: 399,
    marginAmount: 80,
    marginPercent: 20,
    canAddToCart: true,
    beatManager: 'Mahendra Kumar Meena',
    beatNo: 'Beat 2',
    imageSrc: imgSlideIppb,
    description: 'Instant paperless ₹10L accidental death, disability & ₹1L hospitalisation cover in 2 minutes.',
    highlights: ['Zero Medical Checkup', 'Biometric Issuance at Home'],
  },
  {
    id: 'po-dlc-08',
    subTab: 'DLC_CELC_EMITRA',
    productCode: 'IPPB_DOORSTEP',
    sku: 'GOV-DLC-AEPS-70',
    title: 'Jeevan Pramaan Biometric DLC & Doorstep AePS Cash Withdrawal',
    badge: 'Pensioner & Banking KYC',
    officialRateHighlight: '₹70 Govt Authorized Doorstep DLC',
    mrpPrice: 100,
    officialFeeOrPrice: 70,
    marginAmount: 15,
    marginPercent: 21,
    canAddToCart: true,
    beatManager: 'Mahendra Kumar Meena',
    beatNo: 'Beat 2',
    imageSrc: imgDigitalDocs,
    description: 'Submit annual Pensioner Life Certificate from home or withdraw up to ₹10,000 via Aadhaar.',
    highlights: ['Instant SMS Receipt', 'Works With Any Bank Aadhaar'],
  },
  {
    id: 'po-celc-09',
    subTab: 'DLC_CELC_EMITRA',
    productCode: 'CELC_AADHAAR',
    sku: 'GOV-CELC-MOBILE-50',
    title: 'Child Aadhaar (0–5 Yrs CELC), Mobile Update & CSC e-Mitra KYC',
    badge: 'UIDAI CELC & e-Mitra',
    officialRateHighlight: 'Child Aadhaar FREE · Mobile ₹50',
    mrpPrice: 100,
    officialFeeOrPrice: 50,
    marginAmount: 10,
    marginPercent: 20,
    canAddToCart: true,
    beatManager: 'Mahendra Kumar Meena',
    beatNo: 'Beat 2',
    imageSrc: imgDigitalDocs,
    description: 'Home newborn Aadhaar enrolment, mobile number linking, PAN correction & e-Gras stamp deeds.',
    highlights: ['No Queue at Enrollment Center', 'Rajasthan e-Mitra Verified'],
  },
  {
    id: 'po-mystamp-10',
    subTab: 'MYSTAMP_GANGAJAL',
    productCode: 'MY_STAMP',
    sku: 'POST-MYSTAMP-300',
    title: 'India Post · MyStamp Custom Photo 12-Stamp Collector Sheet',
    badge: 'Official Philately Bureau',
    officialRateHighlight: '₹300 Official Sheet (12 x ₹5 Stamps)',
    mrpPrice: 350,
    officialFeeOrPrice: 300,
    marginAmount: 45,
    marginPercent: 15,
    canAddToCart: true,
    beatManager: 'Mahendra Kumar Meena',
    beatNo: 'Beat 2',
    imageSrc: imgCatPhilately,
    description: 'Custom family portrait, wedding or corporate logo printed beside valid ₹5 India Post stamps.',
      highlights: ['Legally Valid Postage', 'Doorstep Speed Post COD'],
  },
  {
    id: 'po-gangajal-11',
    subTab: 'MYSTAMP_GANGAJAL',
    productCode: 'GANGAJAL',
    sku: 'POST-GANGAJAL-250ML',
    title: 'India Post · Sacred Gangotri Gangajal Sealed Bottle (250ml)',
    badge: 'Official India Post Retail',
    officialRateHighlight: '₹30 Official Govt Counter Price',
    mrpPrice: 40,
    officialFeeOrPrice: 30,
    marginAmount: 6,
    marginPercent: 20,
    canAddToCart: true,
    beatManager: 'Mahendra Kumar Meena',
    beatNo: 'Beat 2',
    imageSrc: imgGangajal,
    description: 'Pure untouched Gangotri Gangajal tamper-sealed at source with Beat doorstep COD delivery.',
    highlights: ['Source-Verified Gangotri', 'Instant Beat 2 Dispatch'],
  },
  {
    id: 'po-speedpost-12',
    subTab: 'MYSTAMP_GANGAJAL',
    productCode: 'DNK_PARCEL',
    sku: 'POST-SPEEDPOST-COD-95',
    title: 'Speed Post COD Packaging Box & Dak Ghar Niryat Booking',
    badge: 'India Post Official Dispatch',
    officialRateHighlight: 'From ₹25 Box · 190+ Countries DNK',
    mrpPrice: 120,
    officialFeeOrPrice: 95,
    marginAmount: 18,
    marginPercent: 19,
    canAddToCart: true,
    beatManager: 'Ekta Meena · Div Head',
    beatNo: 'All Beats',
    imageSrc: imgCatCourier,
    description: 'Tamper-proof corrugated Speed Post box, GST export bill (PBE) & daily Beat shop pickup.',
    highlights: ['Same-Day Doorstep Pickup', 'IPPB QR Instant Payment'],
  },
];

const CATEGORY_FILTER_PILLS: {
  id: CategoryFilterPillId;
  label: string;
  icon: any;
}[] = [
  { id: 'all', label: 'All Deals', icon: LayoutGrid },
  { id: 'supermarket', label: 'Kirana & Ration', icon: ShoppingBag },
  { id: 'bakery_dairy', label: 'Dairy, Bakery & QSR', icon: Cake },
  { id: 'medical', label: 'Medical & Pharmacy', icon: HeartPulse },
  { id: 'sabji_mandi', label: 'Sabji Mandi', icon: Leaf },
  { id: 'ev', label: 'EV Mobility', icon: BatteryCharging },
  { id: 'apparel', label: 'Fashion & Apparel', icon: Shirt },
  { id: 'electronics', label: 'Electronics', icon: Smartphone },
  { id: 'footwear', label: 'Sports & Footwear', icon: Zap },
  { id: 'appliances', label: 'Smart Living', icon: Tv },
  { id: 'laundry_events', label: 'Laundry & Events', icon: Calendar },
];

const VENDOR_STORE_GROUPS: VendorStoreGroupMeta[] = [
  {
    id: 'vendor-xpeedo-ev',
    anchorId: 'xpeedo-ev-mobility-hub',
    vendorName: 'XPEEDO EV & Green Mobility Hub',
    tagline: 'Electric Scooters, 60V LiFePO4 Batteries, 10A Smart Chargers & Delivery Gear',
    verifiedMeta: 'Authorized EV Hub · Kota Division · COD Ready',
    marginSummary: 'Flat ₹15 Beat Del · 3-Yr Warranty',
    beatManagerName: 'Mahendra Kumar Meena',
  },
  {
    id: 'vendor-fashion-hub',
    vendorName: "Allen Solly, Levi's & Fabindia Official Outlets",
    tagline: 'Showroom-sealed Cotton Polos, Stretch Denim, Formal Blazers & Handloom Ethnic Sets',
    verifiedMeta: 'Official Brand Store · Kota & Baran Hubs · Size Exchange',
    marginSummary: 'Flat ₹15 Beat Del · 48-Hr Exchange',
    beatManagerName: 'Mahendra Kumar Meena',
  },
  {
    id: 'vendor-velocity-sports',
    vendorName: 'Velocity Sports & Athletic Footwear Studio',
    tagline: 'Marathon Running Shoes, Court Trainers, Cricket Kits, Hydration Gear & Gym Packs',
    verifiedMeta: 'Official Brand Studio · Speed Post COD',
    marginSummary: 'Flat ₹15 Beat Del · COD Ready',
    beatManagerName: 'Mahendra Kumar Meena',
  },
  {
    id: 'vendor-reliance-smartliving',
    vendorName: 'Reliance Digital & Smart Living Appliances',
    tagline: 'ANC Headphones, boAt Earbuds, 65W GaN Chargers, 4.5L Air Fryers & NutriBlenders',
    verifiedMeta: 'Insured Speed Post COD · Official Brand Warranty',
    marginSummary: 'Flat ₹15 Beat Del · Brand Warranty',
    beatManagerName: 'Mohit Arvind · Hub Beat',
  },
  {
    id: 'vendor-dominos-fresh-events',
    vendorName: "Domino's Pizza, Fresh Dairy, Bakery & Events",
    tagline: "Domino's Combos, A2 Milk & Paneer, Celebration Cakes, Express Steam Laundry & Event Kits",
    verifiedMeta: 'Hyper-Local Cold-Chain · Express Dispatch',
    marginSummary: 'Flat ₹15 Beat Del · Fresh Dispatch',
    beatManagerName: 'Mahendra Kumar Meena',
  },
  {
    id: 'vendor-kirana-wholesale',
    vendorName: 'XPOKART Kirana Mart & Daily Household Ration',
    tagline: 'High-Velocity Chakki Atta, Mustard Oil, Unpolished Pulses & Monthly Ration Packs',
    verifiedMeta: 'Regional Grocery Hub · Sealed Retail Pack',
    marginSummary: 'Flat ₹15 Beat Del · Sealed Pack',
    beatManagerName: 'Mahendra Kumar Meena',
  },
];

const CURATED_HYPERLOCAL_CATALOG: CompactCatalogProduct[] = [
  // 1. XPEEDO EV (6 Items)
  ...XPEEDO_EV_PRODUCTS.map((item, idx) => ({
    id: item.id,
    sku: item.sku,
    title: item.title,
    brand: item.brand,
    categoryKey: 'ev' as const,
    categoryTag: item.categoryTag,
    vendorGroupId: 'vendor-xpeedo-ev',
    mrpPrice: item.mrpPrice,
    retailPrice: item.retailPrice,
    marginAmount: item.marginAmount,
    marginPercent: item.marginPercent,
    imageSrc: item.imageSrc,
    description: item.description,
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
    isTrending: idx < 2,
  })),
  // 2. Allen Solly, Levi's & Fabindia Fashion (6 Items)
  {
    id: 'hm-apparel-01',
    sku: 'BRAND-SOLLY-POLO-1799',
    title: 'Allen Solly · Pique Cotton Polo & Chino Combo',
    brand: 'Allen Solly',
    categoryKey: 'apparel',
    categoryTag: 'Polos & Chinos',
    vendorGroupId: 'vendor-fashion-flagship',
    mrpPrice: 2499,
    retailPrice: 1799,
    marginAmount: 360,
    marginPercent: 20,
    imageSrc: imgBrandApparel,
    description: 'Authentic breathable pique cotton polo paired with slim-fit comfort chinos.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
    isTrending: true,
  },
  {
    id: 'hm-apparel-02',
    sku: 'BRAND-LEVI-DENIM-2499',
    title: "Levi's · 511 Authentic Stretch Denim & Shirt Pack",
    brand: "Levi's",
    categoryKey: 'apparel',
    categoryTag: 'Denim & Casuals',
    vendorGroupId: 'vendor-fashion-flagship',
    mrpPrice: 3499,
    retailPrice: 2499,
    marginAmount: 500,
    marginPercent: 20,
    imageSrc: imgBrandApparel,
    description: "Official Levi's stretch jeans and soft cotton casual shirt with QR seal.",
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
    isTrending: true,
  },
  {
    id: 'hm-apparel-03',
    sku: 'BRAND-FAB-ETHNIC-2199',
    title: 'Fabindia · Handcrafted Cotton Silk Kurta Set',
    brand: 'Fabindia',
    categoryKey: 'apparel',
    categoryTag: 'Ethnic Wear',
    vendorGroupId: 'vendor-fashion-flagship',
    mrpPrice: 2999,
    retailPrice: 2199,
    marginAmount: 440,
    marginPercent: 20,
    imageSrc: imgBrandApparel,
    description: 'Pure artisanal handloom cotton-silk festive kurta set with gift packing.',
    beatNo: 'Beat 3',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  {
    id: 'hm-apparel-04',
    sku: 'BRAND-MONTE-WINTER-2199',
    title: 'Monte Carlo · Merino Wool Pullover & Thermal',
    brand: 'Monte Carlo',
    categoryKey: 'apparel',
    categoryTag: 'Winter Combos',
    vendorGroupId: 'vendor-fashion-flagship',
    mrpPrice: 2899,
    retailPrice: 2199,
    marginAmount: 484,
    marginPercent: 22,
    imageSrc: imgBrandApparel,
    description: 'Warm Merino wool knitted V-neck pullover bundled with thermal inner.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  {
    id: 'hm-apparel-05',
    sku: 'BRAND-SOLLY-BLAZER-3899',
    title: 'Allen Solly · Tailored Linen Blend Formal Blazer',
    brand: 'Allen Solly',
    categoryKey: 'apparel',
    categoryTag: 'Formalwear',
    vendorGroupId: 'vendor-fashion-flagship',
    mrpPrice: 5499,
    retailPrice: 3899,
    marginAmount: 858,
    marginPercent: 22,
    imageSrc: imgBrandApparel,
    description: 'Wrinkle-resistant tailored linen blazer ideal for Kota offices and weddings.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  {
    id: 'hm-apparel-06',
    sku: 'BRAND-LEVI-TRUCKER-2799',
    title: "Levi's · Classic Indigo Trucker Jacket + Tee",
    brand: "Levi's",
    categoryKey: 'apparel',
    categoryTag: 'Outerwear',
    vendorGroupId: 'vendor-fashion-flagship',
    mrpPrice: 3999,
    retailPrice: 2799,
    marginAmount: 560,
    marginPercent: 20,
    imageSrc: imgBrandApparel,
    description: "Heritage indigo cotton denim trucker jacket with authentic Levi's tag.",
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  // 3. Velocity Sports & Footwear Studio (5 Items)
  {
    id: 'hm-foot-01',
    sku: 'BRAND-VELOCITY-PRO-2299',
    title: 'Velocity Sports · Marathon Running Sneakers + Flask',
    brand: 'Velocity Sports',
    categoryKey: 'footwear',
    categoryTag: 'Running Footwear',
    vendorGroupId: 'vendor-velocity-sports',
    mrpPrice: 3299,
    retailPrice: 2299,
    marginAmount: 529,
    marginPercent: 23,
    imageSrc: imgBrandFootwear,
    description: 'Breathable mesh sneakers with EVA cushioning & free sports hydration flask.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
    isTrending: true,
  },
  {
    id: 'hm-foot-02',
    sku: 'BRAND-COURT-TRAINERS-1899',
    title: 'Velocity Sports · Court Trainers + Gym Duffel Bag',
    brand: 'Velocity Sports',
    categoryKey: 'footwear',
    categoryTag: 'Training & Duffels',
    vendorGroupId: 'vendor-velocity-sports',
    mrpPrice: 2699,
    retailPrice: 1899,
    marginAmount: 437,
    marginPercent: 23,
    imageSrc: imgBrandFootwear,
    description: 'High-stability court trainers accompanied by a water-resistant gym duffel.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  {
    id: 'hm-foot-03',
    sku: 'BRAND-HYDRATION-FLASK-799',
    title: 'Velocity Sports · Steel Flask & 3-Pair Athletic Socks',
    brand: 'Velocity Sports',
    categoryKey: 'footwear',
    categoryTag: 'Sports Gear',
    vendorGroupId: 'vendor-velocity-sports',
    mrpPrice: 1199,
    retailPrice: 799,
    marginAmount: 199,
    marginPercent: 25,
    imageSrc: imgBrandFootwear,
    description: 'Double-wall insulated 750ml sports bottle with 3 pairs of cushioned socks.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  {
    id: 'hm-foot-04',
    sku: 'VEL-CRICKET-TURF-2999',
    title: 'Velocity Sports · English Willow Gripper Turf Bat Kit',
    brand: 'Velocity Sports',
    categoryKey: 'footwear',
    categoryTag: 'Cricket & Turf',
    vendorGroupId: 'vendor-velocity-sports',
    mrpPrice: 4199,
    retailPrice: 2999,
    marginAmount: 660,
    marginPercent: 22,
    imageSrc: imgBrandFootwear,
    description: 'Seasoned Kashmir/English hybrid willow bat + batting gloves & kit bag.',
    beatNo: 'Beat 4',
    beatManager: 'Mohit Arvind',
    pincode: '324009',
  },
  {
    id: 'hm-foot-05',
    sku: 'VEL-YOGA-RESIST-1299',
    title: 'Velocity Sports · 6mm TPE Yoga Mat & Resistance Bands',
    brand: 'Velocity Sports',
    categoryKey: 'footwear',
    categoryTag: 'Fitness & Hostel',
    vendorGroupId: 'vendor-velocity-sports',
    mrpPrice: 1799,
    retailPrice: 1299,
    marginAmount: 312,
    marginPercent: 24,
    imageSrc: imgBrandFootwear,
    description: 'Anti-slip dual-layer fitness mat with 5-level latex resistance tubes.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  // 4. Reliance Digital & Smart Living Appliances (7 Items)
  {
    id: 'hm-elec-01',
    sku: 'BRAND-BOAT-EARBUDS-1999',
    title: 'Reliance Digital · boAt Airdopes 48H ANC Earbuds',
    brand: 'Reliance Digital',
    categoryKey: 'electronics',
    categoryTag: 'Earbuds & Audio',
    vendorGroupId: 'vendor-reliance-smartliving',
    mrpPrice: 2999,
    retailPrice: 1999,
    marginAmount: 440,
    marginPercent: 22,
    imageSrc: imgBrandElectronics,
    description: '48-hour active noise cancelling wireless earbuds with quad mic ENx & case.',
    beatNo: 'Beat 5',
    beatManager: 'Mohit Arvind',
    pincode: '324009',
    isTrending: true,
  },
  {
    id: 'hm-elec-02',
    sku: 'BRAND-GAN-CHARGER-1499',
    title: 'Reliance Digital · 65W Triple-Port GaN Fast Charger',
    brand: 'Reliance Digital',
    categoryKey: 'electronics',
    categoryTag: 'GaN Chargers',
    vendorGroupId: 'vendor-reliance-smartliving',
    mrpPrice: 2199,
    retailPrice: 1499,
    marginAmount: 330,
    marginPercent: 22,
    imageSrc: imgBrandElectronics,
    description: 'Gallium Nitride (GaN) charger for laptops, tablets & phones simultaneously.',
    beatNo: 'Beat 5',
    beatManager: 'Mohit Arvind',
    pincode: '324009',
  },
  {
    id: 'hm-elec-03',
    sku: 'BRAND-POWERBANK-1999',
    title: 'Reliance Digital · 20,000mAh 22.5W Quick Power Bank',
    brand: 'Reliance Digital',
    categoryKey: 'electronics',
    categoryTag: 'Power Banks',
    vendorGroupId: 'vendor-reliance-smartliving',
    mrpPrice: 2899,
    retailPrice: 1999,
    marginAmount: 440,
    marginPercent: 22,
    imageSrc: imgBrandElectronics,
    description: 'High-density lithium-polymer power bank with LED digital charge display.',
    beatNo: 'Beat 5',
    beatManager: 'Mohit Arvind',
    pincode: '324009',
  },
  {
    id: 'hm-elec-04',
    sku: 'BRAND-RELIANCE-TECH-2499',
    title: 'Reliance Digital · ANC Wireless Headset + 65W GaN Kit',
    brand: 'Reliance Digital',
    categoryKey: 'electronics',
    categoryTag: 'Tech Bundles',
    vendorGroupId: 'vendor-reliance-smartliving',
    mrpPrice: 3499,
    retailPrice: 2499,
    marginAmount: 400,
    marginPercent: 16,
    imageSrc: imgBrandElectronics,
    description: 'Authorized Reliance Digital Kota warranty bundle with studio ANC headset.',
    beatNo: 'Beat 5',
    beatManager: 'Mohit Arvind',
    pincode: '324009',
  },
  {
    id: 'hm-app-01',
    sku: 'BRAND-SMART-AIRFRYER-3499',
    title: 'Smart Living · 4.5L Digital Touch Air Fryer & Grill',
    brand: 'Smart Living',
    categoryKey: 'appliances',
    categoryTag: 'Kitchen Tech',
    vendorGroupId: 'vendor-reliance-smartliving',
    mrpPrice: 4999,
    retailPrice: 3499,
    marginAmount: 735,
    marginPercent: 21,
    imageSrc: imgBrandHomeGadgets,
    description: '360° hot-air fryer with 8 one-touch presets and 2-year replacement warranty.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
    isTrending: true,
  },
  {
    id: 'hm-app-02',
    sku: 'BRAND-KETTLE-1899',
    title: 'Smart Living · 1.8L Precision Steel Electric Kettle',
    brand: 'Smart Living',
    categoryKey: 'appliances',
    categoryTag: 'Electric Kettles',
    vendorGroupId: 'vendor-reliance-smartliving',
    mrpPrice: 2599,
    retailPrice: 1899,
    marginAmount: 418,
    marginPercent: 22,
    imageSrc: imgBrandHomeGadgets,
    description: 'Food-grade stainless steel gooseneck kettle with auto boil-dry shutoff.',
    beatNo: 'Beat 3',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  {
    id: 'hm-app-03',
    sku: 'BRAND-BLENDER-2899',
    title: 'Smart Living · 1000W Nutri-Blender + Smart Speaker',
    brand: 'Smart Living',
    categoryKey: 'appliances',
    categoryTag: 'Blenders & Audio',
    vendorGroupId: 'vendor-reliance-smartliving',
    mrpPrice: 3999,
    retailPrice: 2899,
    marginAmount: 609,
    marginPercent: 21,
    imageSrc: imgBrandHomeGadgets,
    description: '1000W copper-motor nutrient extractor bundled with compact Bluetooth speaker.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  // 5. Domino's, Dadabari Dairies, Bakeries, Laundries & Events Hub (6 Items)
  {
    id: 'hl-domino-01',
    sku: 'BRAND-DOMINOS-FARM-699',
    title: "Domino's Pizza · Farmhouse Feast + Garlic Bread COD Combo",
    brand: "Domino's Pizza",
    categoryKey: 'bakery_dairy',
    categoryTag: 'QSR & Hot Meals',
    vendorGroupId: 'vendor-dominos-fresh-events',
    mrpPrice: 899,
    retailPrice: 699,
    marginAmount: 126,
    marginPercent: 18,
    imageSrc: imgBrandQsrPizza,
    description: "Medium Farmhouse Pizza, Stuffed Garlic Bread & dip dispatched hot from Dadabari Circle.",
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
    isTrending: true,
  },
  {
    id: 'hl-bakery-02',
    sku: 'XPO-BAKERY-DAIRY-649',
    title: 'Dadabari Fresh · A2 Milk 2L, Paneer 500g & Truffle Cake',
    brand: 'Dadabari Bakery & Dairy',
    categoryKey: 'bakery_dairy',
    categoryTag: 'Dairies & Bakeries',
    vendorGroupId: 'vendor-dominos-fresh-events',
    mrpPrice: 850,
    retailPrice: 649,
    marginAmount: 130,
    marginPercent: 20,
    imageSrc: imgBakeryDairy,
    description: 'Morning cold-chain pure A2 buffalo milk, fresh malai paneer & truffle cake pack.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
    isTrending: true,
  },
  {
    id: 'hl-bakery-03',
    sku: 'XPO-DAIRY-BREAKFAST-399',
    title: 'Dadabari Bakery · Butter Croissants, Rusk & Curd Combo',
    brand: 'Dadabari Bakery & Dairy',
    categoryKey: 'bakery_dairy',
    categoryTag: 'Morning Bakery',
    vendorGroupId: 'vendor-dominos-fresh-events',
    mrpPrice: 520,
    retailPrice: 399,
    marginAmount: 84,
    marginPercent: 21,
    imageSrc: imgBakeryDairy,
    description: 'Warm artisanal butter croissants, bakery toast rusks & earthen matka dahi box.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  {
    id: 'hl-laundry-04',
    sku: 'XPO-LAUNDRY-EVENT-499',
    title: 'Dadabari Express · 10-Garment Steam Dry-Clean & Press',
    brand: 'Dadabari Express Laundry',
    categoryKey: 'laundry_events',
    categoryTag: 'Laundries & Dry Clean',
    vendorGroupId: 'vendor-dominos-fresh-events',
    mrpPrice: 699,
    retailPrice: 499,
    marginAmount: 110,
    marginPercent: 22,
    imageSrc: imgLaundryEvent,
    description: 'Doorstep pickup, steam dry-clean & crisp press returned in sealed kraft parcel.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  {
    id: 'hl-laundry-05',
    sku: 'XPO-HOSTEL-WASH-299',
    title: 'Kota Hostel Care · Weekly 6kg Wash, Fold & Iron Bundle',
    brand: 'Dadabari Express Laundry',
    categoryKey: 'laundry_events',
    categoryTag: 'Hostel Laundry',
    vendorGroupId: 'vendor-dominos-fresh-events',
    mrpPrice: 420,
    retailPrice: 299,
    marginAmount: 72,
    marginPercent: 24,
    imageSrc: imgLaundryEvent,
    description: 'Designed for Dadabari & Keshavpura coaching students with 24-hr Beat pickup.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  {
    id: 'hl-event-06',
    sku: 'XPO-EVENT-DECOR-2499',
    title: 'Kota Events Hub · Floral Brass Decor, Candles & Sound Kit',
    brand: 'XPOKART Event Management',
    categoryKey: 'laundry_events',
    categoryTag: 'Event Management',
    vendorGroupId: 'vendor-dominos-fresh-events',
    mrpPrice: 3499,
    retailPrice: 2499,
    marginAmount: 550,
    marginPercent: 22,
    imageSrc: imgLaundryEvent,
    description: 'Complete birthday/anniversary home decor parcel & Beat catering coordination.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  // 6. Dadabari Kirana Mart & Daily Household Ration (4 High-Velocity Recurring Staples)
  {
    id: 'hm-sup-01',
    sku: 'XPO-KIRANA-ATTA-495',
    title: 'Aashirvaad · Chakki Atta 10kg Wholesale Family Sack',
    brand: 'Dadabari Mart',
    categoryKey: 'supermarket',
    categoryTag: 'Kirana & Flour',
    vendorGroupId: 'vendor-kirana-wholesale',
    mrpPrice: 590,
    retailPrice: 495,
    marginAmount: 79,
    marginPercent: 16,
    imageSrc: imgBrandSupermarket,
    description: 'Fresh stone-ground whole wheat flour 10kg sack from Dadabari grain depot.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
    isTrending: true,
  },
  {
    id: 'hm-sup-02',
    sku: 'XPO-KIRANA-OIL-860',
    title: 'Fortune · Mustard & Sunlite Oil Twin 5L Pack',
    brand: 'Keshavpura Wholesale',
    categoryKey: 'supermarket',
    categoryTag: 'Cooking Oils',
    vendorGroupId: 'vendor-kirana-wholesale',
    mrpPrice: 1050,
    retailPrice: 860,
    marginAmount: 155,
    marginPercent: 18,
    imageSrc: imgBrandSupermarket,
    description: 'Tamper-proof 5L edible oil twin pack for homes and neighborhood kitchens.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
    isTrending: true,
  },
  {
    id: 'hm-sup-03',
    sku: 'XPO-KIRANA-DAL-680',
    title: 'Tata Sampann · Unpolished Toor, Moong & Chana Dal 5kg',
    brand: 'Kota Grain Co.',
    categoryKey: 'supermarket',
    categoryTag: 'Pulses & Grains',
    vendorGroupId: 'vendor-kirana-wholesale',
    mrpPrice: 850,
    retailPrice: 680,
    marginAmount: 136,
    marginPercent: 20,
    imageSrc: imgBrandSupermarket,
    description: 'High-protein unpolished lentil combo crate packed for monthly kitchens.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  {
    id: 'hm-sup-04',
    sku: 'XPO-KIRANA-BOX-1499',
    title: 'Dadabari Mart · 12-Item Monthly Ration & Tea Crate',
    brand: 'XPOKART Wholesale',
    categoryKey: 'supermarket',
    categoryTag: 'Monthly Family Box',
    vendorGroupId: 'vendor-kirana-wholesale',
    mrpPrice: 1899,
    retailPrice: 1499,
    marginAmount: 330,
    marginPercent: 22,
    imageSrc: imgBrandSupermarket,
    description: 'Curated 12-item kitchen staple hamper (tea, rice, dal, oil, flour & spices).',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
    isTrending: true,
  },
  // 7. Medical, Wellness & Pharmacy Essentials (4 Items)
  {
    id: 'hm-med-01',
    sku: 'MED-OMRON-BPMON-2199',
    title: 'Omron · Automatic Digital Blood Pressure Monitor (Arm Cuff)',
    brand: 'Kota Care Pharmacy',
    categoryKey: 'medical',
    categoryTag: 'Diagnostics & BP',
    vendorGroupId: 'vendor-kirana-wholesale',
    mrpPrice: 2890,
    retailPrice: 2199,
    marginAmount: 0,
    marginPercent: 0,
    imageSrc: imgPharmaWellness,
    description: 'Clinically validated IntelliSense BP monitor with irregular heartbeat indicator & AA batteries.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
    isTrending: true,
  },
  {
    id: 'hm-med-02',
    sku: 'MED-ACCU-GLUC-999',
    title: 'Accu-Chek · Active Glucometer + 25 Test Strips Home Combo',
    brand: 'Dadabari Medical Hub',
    categoryKey: 'medical',
    categoryTag: 'Diabetes Care',
    vendorGroupId: 'vendor-kirana-wholesale',
    mrpPrice: 1399,
    retailPrice: 999,
    marginAmount: 0,
    marginPercent: 0,
    imageSrc: imgPharmaWellness,
    description: 'Fast 5-second blood glucose meter with Softclix lancing device & 25 test strips.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  {
    id: 'hm-med-03',
    sku: 'MED-FIRSTAID-PRO-449',
    title: 'Apollo Wellness · 32-Piece Home & Student First-Aid Box',
    brand: 'Kota Care Pharmacy',
    categoryKey: 'medical',
    categoryTag: 'First Aid & Safety',
    vendorGroupId: 'vendor-kirana-wholesale',
    mrpPrice: 650,
    retailPrice: 449,
    marginAmount: 0,
    marginPercent: 0,
    imageSrc: imgPharmaWellness,
    description: 'Antiseptic solution, sterile gauze, crepe bandage, thermometer & pain relief spray.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  {
    id: 'hm-med-04',
    sku: 'MED-VITC-ORS-299',
    title: 'Electral · ORS Hydration 10x Sachets & Vitamin C + Zinc Pack',
    brand: 'Dadabari Medical Hub',
    categoryKey: 'medical',
    categoryTag: 'Immunity & OTC',
    vendorGroupId: 'vendor-kirana-wholesale',
    mrpPrice: 420,
    retailPrice: 299,
    marginAmount: 0,
    marginPercent: 0,
    imageSrc: imgPharmaWellness,
    description: 'WHO-formula ORS hydration sachets paired with Limcee Vitamin C & Zinc tablets.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  // 8. Fresh Sabji Mandi & Farm Fruits (4 Items)
  {
    id: 'hm-sabji-01',
    sku: 'MND-SABJI-CRATE-249',
    title: 'Kota Sabji Mandi · 5kg Farm-Fresh Seasonal Vegetable Crate',
    brand: 'Kota Mandi Direct',
    categoryKey: 'sabji_mandi',
    categoryTag: 'Daily Sabji Combo',
    vendorGroupId: 'vendor-kirana-wholesale',
    mrpPrice: 340,
    retailPrice: 249,
    marginAmount: 0,
    marginPercent: 0,
    imageSrc: imgSabjiMandi,
    description: 'Morning-harvested tomato, ladyfinger, bottle gourd, green chilli & coriander 5kg box.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
    isTrending: true,
  },
  {
    id: 'hm-sabji-02',
    sku: 'MND-POTATO-ONION-189',
    title: 'Chipsona Potato 3kg + Nashik Red Onion 2kg Kitchen Combo',
    brand: 'Kota Mandi Direct',
    categoryKey: 'sabji_mandi',
    categoryTag: 'Root Staples',
    vendorGroupId: 'vendor-kirana-wholesale',
    mrpPrice: 250,
    retailPrice: 189,
    marginAmount: 0,
    marginPercent: 0,
    imageSrc: imgSabjiMandi,
    description: 'Sorted medium-size Nashik red onions & sweet Chipsona potatoes in breathable mesh sack.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  {
    id: 'hm-sabji-03',
    sku: 'MND-GREENS-PACK-119',
    title: 'Fresh Palak, Methi, Mint & Lemon Organic Greens Bundle',
    brand: 'Baran Farm Fresh',
    categoryKey: 'sabji_mandi',
    categoryTag: 'Leafy Greens',
    vendorGroupId: 'vendor-kirana-wholesale',
    mrpPrice: 160,
    retailPrice: 119,
    marginAmount: 0,
    marginPercent: 0,
    imageSrc: imgSabjiMandi,
    description: 'Clean-washed tender spinach, fenugreek leaves, fresh pudina & 250g kagzi lemons.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
  {
    id: 'hm-sabji-04',
    sku: 'MND-FRUIT-BOX-299',
    title: 'Fresh Kinnow, Apple & Banana 3kg Family Immunity Fruit Box',
    brand: 'Kota Mandi Direct',
    categoryKey: 'sabji_mandi',
    categoryTag: 'Fresh Fruits',
    vendorGroupId: 'vendor-kirana-wholesale',
    mrpPrice: 399,
    retailPrice: 299,
    marginAmount: 0,
    marginPercent: 0,
    imageSrc: imgSabjiMandi,
    description: 'Hand-picked juicy Kinnow oranges, Himachal apples & ripe Robusta bananas.',
    beatNo: 'Beat 2',
    beatManager: 'Mahendra Kumar Meena',
    pincode: '324009',
  },
];

function isStandalonePostOfficeOrBankingItem(
  vertical: string,
  sku: string,
  title: string,
  vendorCategory?: string
): boolean {
  if (
    vertical === 'Banking & Finance' ||
    vertical === 'Documents & Digital Services' ||
    vertical === 'Logistics & Courier Services' ||
    vertical === 'Course & Skill Academy'
  ) {
    return true;
  }
  const blob = `${sku} ${title} ${vendorCategory || ''}`.toLowerCase();
  return (
    blob.includes('mystamp') ||
    blob.includes('my stamp') ||
    blob.includes('gangajal') ||
    blob.includes('speed post') ||
    blob.includes('ippb') ||
    blob.includes('pli') ||
    blob.includes('jeevan pramaan') ||
    blob.includes('celc') ||
    blob.includes('postal')
  );
}

function inferCatalogRoutingFromStaffProduct(
  sku: string,
  title: string,
  vendorCategory?: string
): { categoryKey: Exclude<CategoryFilterPillId, 'all'>; vendorGroupId: string } {
  const blob = `${sku} ${title} ${vendorCategory || ''}`.toLowerCase();
  if (blob.includes('pharma') || blob.includes('medical') || blob.includes('accu') || blob.includes('omron') || blob.includes('first-aid') || blob.includes('vitamin')) {
    return { categoryKey: 'medical', vendorGroupId: 'vendor-kirana-wholesale' };
  }
  if (blob.includes('sabji') || blob.includes('mandi') || blob.includes('vegetable') || blob.includes('onion') || blob.includes('potato') || blob.includes('fruit')) {
    return { categoryKey: 'sabji_mandi', vendorGroupId: 'vendor-kirana-wholesale' };
  }
  if (blob.includes('xpeedo') || blob.includes('ev') || blob.includes('scooter') || blob.includes('battery')) {
    return { categoryKey: 'ev', vendorGroupId: 'vendor-xpeedo-ev' };
  }
  if (blob.includes('bakery') || blob.includes('dairy') || blob.includes('domino') || blob.includes('kfc') || blob.includes('mcd') || blob.includes('pizza') || blob.includes('milk')) {
    return { categoryKey: 'bakery_dairy', vendorGroupId: 'vendor-dominos-fresh-events' };
  }
  if (blob.includes('laundry') || blob.includes('dry-clean') || blob.includes('event') || blob.includes('wash')) {
    return { categoryKey: 'laundry_events', vendorGroupId: 'vendor-dominos-fresh-events' };
  }
  if (blob.includes('solly') || blob.includes('levi') || blob.includes('saree') || blob.includes('handloom') || blob.includes('kota doria')) {
    return { categoryKey: 'apparel', vendorGroupId: 'vendor-fashion-flagship' };
  }
  if (blob.includes('velocity') || blob.includes('sneaker') || blob.includes('shoe') || blob.includes('sports')) {
    return { categoryKey: 'footwear', vendorGroupId: 'vendor-velocity-sports' };
  }
  if (blob.includes('reliance digital') || blob.includes('anc') || blob.includes('earbud') || blob.includes('gan') || blob.includes('power bank')) {
    return { categoryKey: 'electronics', vendorGroupId: 'vendor-reliance-smartliving' };
  }
  if (blob.includes('smart living') || blob.includes('fryer') || blob.includes('kettle') || blob.includes('blender')) {
    return { categoryKey: 'appliances', vendorGroupId: 'vendor-reliance-smartliving' };
  }
  return { categoryKey: 'supermarket', vendorGroupId: 'vendor-kirana-wholesale' };
}

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
  isStandalone = false,
  onToggleStandalone,
  onOpenStaffLogin,
}: PublicHomePortalProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  const [activeCategory, setActiveCategory] = useState<UnifiedCategoryId>('ALL');
  const [activeFilterPill, setActiveFilterPill] = useState<CategoryFilterPillId>('all');
  const [activePostOfficeTab, setActivePostOfficeTab] = useState<PostOfficeBankingSubTab>('ALL_PO');
  const [searchQuery, setSearchQuery] = useState('');
  const [storefrontProducts, setStorefrontProducts] = useState(() => staffProductService.getPublicCatalog());
  const vendorCarouselRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const brandScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollVendorCarousel = (vendorId: string, direction: 'left' | 'right') => {
    const container = vendorCarouselRefs.current[vendorId];
    if (!container) return;
    const step = Math.max(320, Math.round(container.clientWidth * 0.78));
    container.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  const scrollBrandStores = (direction: 'left' | 'right') => {
    const container = brandScrollRef.current;
    if (!container) return;
    const step = Math.max(280, Math.round(container.clientWidth * 0.75));
    container.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  const softwareScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollSoftwareStores = (direction: 'left' | 'right') => {
    const container = softwareScrollRef.current;
    if (!container) return;
    const step = Math.max(300, Math.round(container.clientWidth * 0.75));
    container.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  // Visitor Lead Capture & Unlock State
  const [unlockedVisitor, setUnlockedVisitor] = useState<UnlockedVisitor | null>(() => {
    return safeStorage.getJSON<UnlockedVisitor | null>(SESSION_UNLOCK_KEY, null);
  });

  // Modals & Dynamic Page Inspection State
  const [inspectedScheme, setInspectedScheme] = useState<ProductDefinition | null>(null);
  const [leadGateTargetProduct, setLeadGateTargetProduct] = useState<ProductDefinition | null>(null);
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

  // Cart, Speed Post COD Checkout, Abandonment Recovery & Order Tracker State
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

  // Order Tracker State
  const [trackerSearchInput, setTrackerSearchInput] = useState('');
  const [allDispatches, setAllDispatches] = useState<LogisticsDispatchOrder[]>(() =>
    aiCommercialVerificationService.getAllDispatches()
  );

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
          ? `GPS detected nearest hub: PIN ${hub.pincode} · ${hub.officeName} (${hub.localStockingPartner}).`
          : `Routed to regional hub: PIN ${hub.pincode} · ${hub.officeName} (${hub.localStockingPartner}).`
      );
    } finally {
      setIsDetectingPincode(false);
    }
  };

  // Automatically route nearest regional hub post customer/staff login
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
    // Sync inventory & active pincode from pincodeOperationsService (updated live by Admin Console)
    const syncPincodeState = () => {
      const currentPin = pincodeOperationsService.getActivePincode();
      setActiveVicinityZone(toVicinityZone(getPincodeHub(currentPin)));
      setInventoryMap(pincodeOperationsService.getInventoryForPincode(currentPin));
    };
    syncPincodeState();
    const unsubOps = pincodeOperationsService.subscribe(syncPincodeState);

    // Auto-detect nearest hub via GPS only if user hasn't persisted a custom hub yet
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

    const syncStore = () => setStorefrontProducts(staffProductService.getPublicCatalog());
    const syncDispatches = () => setAllDispatches([...aiCommercialVerificationService.getAllDispatches()]);
    syncStore();
    syncDispatches();
    const unsub = staffProductService.subscribe(syncStore);
    const unsubDisp = aiCommercialVerificationService.subscribe(syncDispatches);
    return () => {
      unsubOps();
      unsub();
      unsubDisp();
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
    setLeadBannerMessage(`Added "${item.title}" to XPOKART Speed Post COD Cart.`);
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    setCartItems((prev) => {
      const next = prev
        .map((c) => (c.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0);
      cartRecoveryService.saveSharedCart(next);
      if (next.length > 0) {
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
      }
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
        storeName: item.vendorName || 'XPOKART Verified Store',
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
        remarks: `XPOKART Cart Checkout · PIN ${activeHub.pincode} · Flat ₹15 Express COD`,
      })
    );

    customerService.submitCustomerInquiry({
      customerName: cleanName,
      mobile: cleanMobile,
      productInterested: `XPOKART Cart Order (${cartItems.length} item${cartItems.length > 1 ? 's' : ''})`,
      requirement: `Speed Post COD Total ₹${totalCartAmount} | Barcodes: ${createdOrders.map((o) => o.speedPostBarcode).join(', ')}`,
      preferredContact: 'Doorstep Visit',
      address: checkoutAddress.trim() || `${activeHub.officeName} PIN ${activeHub.pincode}`,
      beatNo: checkoutBeat || 'Beat 2',
    });

    cartRecoveryService.markConverted(activeHub.pincode);
    setLastPlacedOrders(createdOrders);
    setCartItems([]);
    cartRecoveryService.saveSharedCart([]);
    setAllDispatches([...aiCommercialVerificationService.getAllDispatches()]);
    setLeadBannerMessage(
      `Speed Post COD Confirmed! Barcode ${createdOrders[0]?.speedPostBarcode} dispatched to PIN ${activeHub.pincode} (${activeHub.localStockingPartner}).`
    );
  };

  const trackedOrders = useMemo(() => {
    const q = trackerSearchInput.trim().toLowerCase();
    if (!q) return allDispatches.slice(0, 6);
    return allDispatches.filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        (d.speedPostBarcode || '').toLowerCase().includes(q) ||
        d.customerMobile.includes(q) ||
        d.customerName.toLowerCase().includes(q) ||
        d.productTitle.toLowerCase().includes(q)
    );
  }, [trackerSearchInput, allDispatches]);

  const currentHeroSlide = HERO_SLIDES[activeSlideIndex];

  const getCategoryItemCount = (catId: Exclude<UnifiedCategoryId, 'ALL'>): number => {
    const catMeta = CATEGORY_CATALOG.find((c) => c.id === catId);
    const schemeCount = POSTAL_PRODUCTS.filter((p) => getSchemeUnifiedCategory(p) === catId).length;
    const storeCount = catMeta?.storefrontVertical
      ? storefrontProducts.filter((s) => s.vertical === catMeta.storefrontVertical).length
      : 0;
    return schemeCount + storeCount;
  };

  const drillIntoCategory = (catId: UnifiedCategoryId) => {
    setActiveCategory(catId);
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const target = document.getElementById('category-drilldown-workspace');
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  const filteredOfficialSchemes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return POSTAL_PRODUCTS.filter((prod) => {
      const cat = getSchemeUnifiedCategory(prod);
      const matchesCat = activeCategory === 'ALL' ? Boolean(q) : cat === activeCategory;
      const matchesSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.code.toLowerCase().includes(q) ||
        prod.tagline.toLowerCase().includes(q) ||
        prod.interestRateOrBonus.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Trending Top 3 Showcase when browsing ALL overview without search filter
  const trendingTopSchemes = useMemo(() => {
    return POSTAL_PRODUCTS.filter((p) => ['SSA', 'PLI_SURAKSHA', 'SCSS'].includes(p.code));
  }, []);

  // Pure Commercial Multi-Vertical Aggregated Catalog (Post Office & Banking isolated in Block 4)
  const aggregatedCatalog = useMemo<CompactCatalogProduct[]>(() => {
    const seenSkus = new Set<string>();
    const combined: CompactCatalogProduct[] = [];

    CURATED_HYPERLOCAL_CATALOG.forEach((item) => {
      const skuKey = item.sku.trim().toUpperCase();
      if (seenSkus.has(skuKey)) return;
      seenSkus.add(skuKey);
      combined.push(item);
    });

    storefrontProducts.forEach((prod) => {
      if (prod.price <= 0) return;
      if (isStandalonePostOfficeOrBankingItem(prod.vertical, prod.sku, prod.title, prod.vendorCategory)) {
        return;
      }
      const skuKey = (prod.sku || prod.id).trim().toUpperCase();
      if (seenSkus.has(skuKey)) return;
      seenSkus.add(skuKey);

      const routing = inferCatalogRoutingFromStaffProduct(prod.sku, prod.title, prod.vendorCategory);
      const mrp =
        prod.mrpPrice && prod.mrpPrice > prod.price ? prod.mrpPrice : Math.round(prod.price * 1.25);
      const marginPct = prod.sellingMarginPercent || 18;
      const marginAmt = prod.sellingMarginAmount || Math.round((prod.price * marginPct) / 100);
      const rawManager = (prod.beatManagerName || prod.staffName || 'Mahendra Kumar Meena').split('·')[0].trim();

      combined.push({
        id: prod.id,
        sku: prod.sku,
        title: prod.title,
        brand: prod.brandName || prod.vendorName || 'XPOKART Partner',
        categoryKey: routing.categoryKey,
        categoryTag: prod.brandCategoryTag || prod.vendorCategory || 'Verified SKU',
        vendorGroupId: routing.vendorGroupId,
        mrpPrice: mrp,
        retailPrice: prod.price,
        marginAmount: marginAmt,
        marginPercent: marginPct,
        imageSrc: prod.thumbnailUrl || imgHandloom,
        description: prod.description,
        beatNo: prod.beatNumber || 'Beat 2',
        beatManager: rawManager,
        pincode: prod.pincode || '324009',
        isTrending: prod.status === 'FEATURED' || marginPct >= 20,
      });
    });

    return combined;
  }, [storefrontProducts]);

  const topTrendingProducts = useMemo(() => {
    return [...aggregatedCatalog]
      .sort((a, b) => {
        const recurringBoostA = a.categoryKey === 'supermarket' || a.categoryKey === 'bakery_dairy' ? 18 : 0;
        const recurringBoostB = b.categoryKey === 'supermarket' || b.categoryKey === 'bakery_dairy' ? 18 : 0;
        const discA = Math.round(((a.mrpPrice - a.retailPrice) / Math.max(1, a.mrpPrice)) * 20);
        const discB = Math.round(((b.mrpPrice - b.retailPrice) / Math.max(1, b.mrpPrice)) * 20);
        return (
          (b.isTrending ? 30 : 0) +
          recurringBoostB +
          b.marginPercent +
          discB -
          ((a.isTrending ? 30 : 0) + recurringBoostA + a.marginPercent + discA)
        );
      })
      .slice(0, 8);
  }, [aggregatedCatalog]);

  const kiranaCatalogItems = useMemo(() => {
    return aggregatedCatalog.filter((item) => item.categoryKey === 'supermarket');
  }, [aggregatedCatalog]);

  const dairyBakeryCatalogItems = useMemo(() => {
    return aggregatedCatalog.filter((item) => item.categoryKey === 'bakery_dairy');
  }, [aggregatedCatalog]);

  const electronicsCatalogItems = useMemo(() => {
    return aggregatedCatalog.filter(
      (item) => item.categoryKey === 'electronics' || item.categoryKey === 'appliances'
    );
  }, [aggregatedCatalog]);

  const medicalCatalogItems = useMemo(() => {
    return aggregatedCatalog.filter((item) => item.categoryKey === 'medical');
  }, [aggregatedCatalog]);

  const sabjiMandiCatalogItems = useMemo(() => {
    return aggregatedCatalog.filter((item) => item.categoryKey === 'sabji_mandi');
  }, [aggregatedCatalog]);

  const fashionFootwearCatalogItems = useMemo(() => {
    return aggregatedCatalog.filter(
      (item) => item.categoryKey === 'apparel' || item.categoryKey === 'footwear'
    );
  }, [aggregatedCatalog]);

  const filteredCategoryProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (activeFilterPill === 'all' && !q) {
      return topTrendingProducts;
    }
    return aggregatedCatalog.filter((item) => {
      const matchesPill = activeFilterPill === 'all' || item.categoryKey === activeFilterPill;
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.categoryTag.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesPill && matchesSearch;
    });
  }, [activeFilterPill, searchQuery, aggregatedCatalog, topTrendingProducts]);

  const vendorCarousels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return VENDOR_STORE_GROUPS.map((group) => {
      const items = aggregatedCatalog.filter((item) => {
        const belongsToVendor = item.vendorGroupId === group.id;
        const matchesPill = activeFilterPill === 'all' || item.categoryKey === activeFilterPill;
        const matchesSearch =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          group.vendorName.toLowerCase().includes(q);
        return belongsToVendor && matchesPill && matchesSearch;
      });
      return { ...group, items };
    }).filter((group) => group.items.length > 0);
  }, [aggregatedCatalog, activeFilterPill, searchQuery]);

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

  const activeCategoryDef = useMemo(() => {
    if (activeCategory === 'ALL') return null;
    return CATEGORY_CATALOG.find((c) => c.id === activeCategory) || null;
  }, [activeCategory]);

  const buildShareMessage = (product: ProductDefinition): string => {
    const portalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://indiapost.gov.in';
    return (
      `📮 *XPOKART — Sovereign Marketplace (PIN ${activeVicinityZone.pincode})*\n` +
      `✨ *${product.name} (${product.code})*\n\n` +
      `📈 *Official Interest / Bonus:* ${product.interestRateOrBonus}\n` +
      `🛡️ *Tax / Legal Benefit:* ${product.taxBenefits}\n` +
      `💰 *Limit / Fee:* ${product.minInvestment}\n` +
      `⏳ *Tenure:* ${product.tenure}\n\n` +
      `✅ 100% Government of India Sovereign Guarantee & Doorstep Beat Postman Assistance.\n` +
      `👉 View details & returns calculator: ${portalUrl}/?scheme=${product.code}`
    );
  };

  const getShareUrls = (product: ProductDefinition) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://indiapost.gov.in';
    const schemeUrl = `${origin}/?scheme=${product.code}`;
    const text = buildShareMessage(product);
    const shortHeadline = `XPOKART · India Post: ${product.name} — ${product.interestRateOrBonus}`;
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
          title: `${product.name} — XPOKART`,
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
    setLeadGateTargetProduct(product);
    setLeadGateMode(mode);
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
      `Welcome ${trimmedName}! Reference #${inquiry.ticketNumber} registered for ${targetProduct.name}.`
    );
    setLeadGateTargetProduct(null);
    setInquiryNote('');
    setInspectedScheme(targetProduct);
  };

  const renderSchemePosterCard = (product: ProductDefinition) => {
    const catId = getSchemeUnifiedCategory(product);
    const catShort = CATEGORY_CATALOG.find((c) => c.id === catId)?.shortLabel || 'India Post';

    return (
      <article
        key={product.id}
        className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition duration-200 flex flex-col justify-between overflow-hidden shadow-2xs"
      >
        <div>
          {/* Unique Non-Repeating Scheme Artwork Poster */}
          <SchemePosterArtwork
            code={product.code}
            name={product.name}
            rateHighlight={product.interestRateOrBonus}
            categoryLabel={catShort}
          />

          <div className="p-5 space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
              {product.description}
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-500 shrink-0">Limit / Minimum:</span>
                <span className="font-semibold text-slate-900 text-right tabular-nums">
                  {product.minInvestment}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-500 shrink-0">Tenure / SLA:</span>
                <span className="font-semibold text-slate-900 text-right">{product.tenure}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-500 shrink-0">Tax / Guarantee:</span>
                <span className="font-semibold text-emerald-700 text-right line-clamp-1">
                  {unlockedVisitor ? product.taxBenefits : 'Sec 80C / EEE Eligible'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-2 bg-slate-50/70">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleProductAction(product, 'KNOW_MORE')}
              className="px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Know More</span>
              <ArrowRight size={13} className="text-amber-400" />
            </button>

            <button
              type="button"
              onClick={() => handleProductAction(product, 'QUICK_INQUIRY')}
              className="px-3 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Phone size={13} />
              <span>Quick Inquiry</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={getShareUrls(product).whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <MessageCircle size={13} className="text-emerald-600 shrink-0" />
              <span>WhatsApp Pitch</span>
            </a>
            <button
              type="button"
              onClick={() => setShareModalProduct(product)}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Share2 size={13} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </article>
    );
  };

  const renderCompactProductCard = (item: CompactCatalogProduct, isCarouselSlide = false) => {
    const mrp = Number(item?.mrpPrice) || 0;
    const retail = Number(item?.retailPrice) || 0;
    const discountPct = Math.max(
      0,
      Math.round(((mrp - retail) / Math.max(1, mrp)) * 100)
    );
    const hub = getPincodeHub(activeVicinityZone.pincode);
    const waText = encodeURIComponent(
      `Namaste XPOKART Storefront (PIN ${hub.pincode}),\n1-Click Order for *${item.title}* (${item.brand} · ${item.sku}).\nMRP: ₹${mrp.toLocaleString('en-IN')} | Offer Price: ₹${retail.toLocaleString('en-IN')} (${discountPct}% Off)\nDelivery: ₹15 Beat COD · ${hub.officeName}`
    );

    return (
      <article
        key={`${isCarouselSlide ? 'slide' : 'grid'}-${item.id}`}
        className={`group bg-white rounded-2xl border border-slate-200 hover:border-red-400 hover:shadow-md hover:-translate-y-0.5 transition duration-200 flex flex-col justify-between overflow-hidden ${
          isCarouselSlide
            ? 'snap-start shrink-0 w-[82%] sm:w-[48%] lg:w-[calc((100%-42px)/4)]'
            : ''
        }`}
      >
        <div>
          <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
            <img
              src={item.imageSrc}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between gap-2 text-[11px] text-white">
              <span className="font-bold text-amber-300 uppercase tracking-wide truncate">
                {item.brand}
              </span>
              {discountPct > 0 && (
                <span className="font-mono font-black text-emerald-300 shrink-0 tabular-nums">
                  {discountPct}% OFF
                </span>
              )}
            </div>
          </div>

          <div className="p-3 space-y-1.5">
            <div className="text-[10px] text-slate-500 flex items-center justify-between gap-1.5">
              <span className="font-semibold text-slate-700 truncate">{item.categoryTag}</span>
              <span className="font-mono text-emerald-700 font-bold shrink-0">
                PIN {activeVicinityZone.pincode} · ₹15 Del
              </span>
            </div>

            <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-red-700 transition leading-snug line-clamp-2 min-h-[2.25rem]">
              {item.title}
            </h4>

            <div className="pt-1.5 border-t border-slate-100 flex items-baseline justify-between gap-1.5">
              <div className="flex items-baseline gap-1.5 tabular-nums min-w-0">
                <span className="text-sm sm:text-base font-black text-slate-900">
                  ₹{(Number(retail) || 0).toLocaleString('en-IN')}
                </span>
                {mrp > retail && (
                  <span className="text-[11px] text-slate-400 line-through">
                    ₹{(Number(mrp) || 0).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold text-emerald-700 whitespace-nowrap shrink-0">
                Speed Post COD
              </span>
            </div>
          </div>
        </div>

        <div className="p-2.5 pt-2 border-t border-slate-100 bg-slate-50/70 space-y-1.5 text-[11px]">
          <button
            type="button"
            onClick={() =>
              handleAddToCart({
                id: item.id,
                sku: item.sku,
                title: item.title,
                price: item.retailPrice,
                imageSrc: item.imageSrc,
                vendorName: item.brand,
                beatNo: item.beatNo,
              })
            }
            className="w-full py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition whitespace-nowrap"
          >
            <ShoppingCart size={12} className="text-amber-300" />
            <span>{translate('add_to_cart', lang)}</span>
          </button>

          <a
            href={`https://api.whatsapp.com/send?phone=${hub.whatsappPhone}&text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 transition whitespace-nowrap text-[10px]"
          >
            <MessageCircle size={12} />
            <span>{translate('whatsapp_desk', lang)}</span>
          </a>
        </div>
      </article>
    );
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
        onOpenCitizenModal={() => {
          const el = document.getElementById('citizen-application-desk');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        onOpenTrackModal={() => setIsTrackerOpen(true)}
        onOpenStaffLogin={() => {
          if (onOpenStaffLogin) onOpenStaffLogin();
        }}
        onSelectCategoryFilter={(filterKey) => setActiveFilterPill(filterKey as CategoryFilterPillId)}
      />

      {/* Dynamic Pincode & Vicinity Selector Modal */}
      <LocationVicinityModal
        isOpen={isPincodeModalOpen}
        onClose={() => setIsPincodeModalOpen(false)}
        activePincode={activeVicinityZone.pincode}
        onSelectPincode={(zone) => {
          handleSelectPincodeValue(zone.pincode);
        }}
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
        onOpenCitizenModal={() => {
          const el = document.getElementById('citizen-application-desk');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          else handleProductAction(POSTAL_PRODUCTS[0], 'QUICK_INQUIRY');
        }}
        cartCount={totalCartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Confirmation Notice if visitor unlocked a lead */}
      {leadBannerMessage && (
        <div className="bg-emerald-950 text-white rounded-2xl px-5 py-3.5 border border-emerald-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>{leadBannerMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setLeadBannerMessage(null)}
            className="text-emerald-300 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
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
              <span>Select Your Delivery Pincode (13 Kota &amp; Baran Hubs)</span>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-white">
              Currently previewing <strong>PIN {activeVicinityZone.pincode}</strong> · {activeVicinityZone.officeName} · Stocking Partner:{' '}
              <span className="text-emerald-300">{getPincodeHub(activeVicinityZone.pincode).localStockingPartner}</span>
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
                  PIN {h.pincode} · {h.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAutoDetectPincode}
              disabled={isDetectingPincode}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Navigation size={13} className={isDetectingPincode ? 'animate-spin' : ''} />
              <span>{isDetectingPincode ? 'Detecting...' : 'GPS Detect'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectPincodeValue(activeVicinityZone.pincode)}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer"
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
                <span className="font-black text-slate-900">
                  {cartItems.length} item{cartItems.length > 1 ? 's' : ''} saved in your Speed Post COD Cart (₹
                  {(Number(totalCartAmount) || 0).toLocaleString('en-IN')})
                </span>
                <span className="text-slate-600 block sm:inline sm:ml-2">
                  Routed to PIN {activeVicinityZone.pincode} · {getPincodeHub(activeVicinityZone.pincode).localStockingPartner}
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
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black cursor-pointer"
              >
                Resume Checkout
              </button>
              <a
                href={cartRecoveryService.buildWhatsAppRecoveryHref(recoverySession)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => cartRecoveryService.recordWhatsAppRecoveryClick(recoverySession)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1"
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

      {/* INLINE DYNAMIC CATEGORY-SPECIFIC PRODUCT PAGE WHEN USER CLICKS KNOW MORE */}
      {inspectedScheme ? (
        <DynamicProductPageView
          officialScheme={inspectedScheme}
          onBack={() => setInspectedScheme(null)}
        />
      ) : (
        <>

      {/* 2. BLOCK 1 · DYNAMIC COLOURFUL SLIDING HERO BANNERS (MULTI-VERTICAL & VENDOR PROMOTION) */}
      <section
        className={`relative overflow-hidden rounded-3xl text-white border border-white/20 shadow-xl transition-all duration-700 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 ${currentHeroSlide.heroGradient}`}
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
        id="hero-auto-slider"
      >
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            key={currentHeroSlide.id}
            src={currentHeroSlide.imageSrc}
            alt={currentHeroSlide.headline}
            className="w-full h-full object-cover object-center opacity-35 transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/75 to-slate-900/45 backdrop-blur-xs" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/20 text-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                PIN {activeVicinityZone.pincode} · {activeVicinityZone.officeName}
              </span>
              <span className="text-amber-300 font-bold flex items-center gap-1.5">
                <Award size={14} className="text-amber-400" />
                <span>{currentHeroSlide.vendorPromoTag}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-200 border border-amber-300/35 text-[10px] font-black uppercase tracking-wider">
                <Sparkles size={11} />
                <span>{currentHeroSlide.tabLabel}</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-mono font-bold">
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
                  onClick={() => {
                    if (currentHeroSlide.filterPillTarget) {
                      setActiveFilterPill(currentHeroSlide.filterPillTarget);
                    }
                    if (currentHeroSlide.scrollTargetId && typeof window !== 'undefined') {
                      setTimeout(() => {
                        document
                          .getElementById(currentHeroSlide.scrollTargetId!)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 40);
                    } else {
                      drillIntoCategory(currentHeroSlide.targetCategory);
                    }
                  }}
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

                <a
                  href={`https://api.whatsapp.com/send?phone=${getPincodeHub(activeVicinityZone.pincode).whatsappPhone}&text=${encodeURIComponent(
                    `Namaste XPOKART Desk (PIN ${activeVicinityZone.pincode}),\n1-Click Order / Inquiry for Featured Item:\n*${currentHeroSlide.featuredTitle}* (${currentHeroSlide.brandName})\nPrice: ₹${(Number(currentHeroSlide?.featuredPrice) || 0).toLocaleString('en-IN')} (MRP: ₹${(Number(currentHeroSlide?.featuredMrp) || 0).toLocaleString('en-IN')})\nDelivery: ₹15 Beat COD`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/25 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <MessageCircle size={15} className="text-emerald-300" />
                  <span>{translate('whatsapp_desk', lang)}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between bg-black/55 backdrop-blur-md border border-white/20 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-3.5">
                <div>
                  <div className="text-[11px] text-slate-300 font-medium">Featured Item &amp; Deal Price</div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-300 tabular-nums mt-1">
                    ₹{(Number(currentHeroSlide?.featuredPrice) || 0).toLocaleString('en-IN')}
                    {(Number(currentHeroSlide?.featuredMrp) || 0) > (Number(currentHeroSlide?.featuredPrice) || 0) && (
                      <span className="text-sm font-normal text-slate-400 line-through ml-2">
                        ₹{(Number(currentHeroSlide?.featuredMrp) || 0).toLocaleString('en-IN')}
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
                  <div className="text-slate-400">Beat Delivery Fee</div>
                  <div className="font-bold text-white mt-1">₹15 Flat COD</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-slate-400">Dispatch SLA</div>
                  <div className="font-bold text-emerald-300 tabular-nums mt-1">
                    {activeVicinityZone.slaMinutes}
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-300 flex items-center justify-between gap-2 pt-1">
                <span className="truncate">{activeVicinityZone.officeName} (PIN {activeVicinityZone.pincode})</span>
                <span className="font-mono text-amber-300 font-semibold shrink-0">{getPincodeHub(activeVicinityZone.pincode).localStockingPartner.split(' ')[0]} Hub</span>
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

      {/* 3. LIVE DESK — URGENT OFFERS & COMPLETE PRODUCT TRANSPARENCY */}
      <LiveUrgentDesk
        lang={lang}
        activePincode={activeVicinityZone.pincode}
        onAddToCart={handleAddToCart}
      />

      {/* 4. SCROLL-X ROW 1 · EXCLUSIVE TOP-SELLING ESSENTIALS */}
      <ExclusiveTopSellers
        lang={lang}
        activePincode={activeVicinityZone.pincode}
        availability={inventoryMap.top_sellers}
        onAddToCart={handleAddToCart}
      />

      {/* BLOCK 2 · TOP TRENDING DEALS & BEST SELLERS (HIGH-VELOCITY RECURRING ITEMS) */}
      <div id="top-trending-categories" className="-mt-16 pt-16" />
      <section className="space-y-4 pt-2 border-t border-slate-200 dark:border-zinc-800" id="top-trending-deals">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 pt-2">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
              <TrendingUp size={14} />
              <span>Block 2 · Top Trending Deals &amp; Best Sellers · PIN {activeVicinityZone.pincode}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight" style={{ textWrap: 'balance' }}>
              High-Velocity Daily Essentials, Fresh Milk, Snacks &amp; Top Commerce Deals
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#post-office-banking-store"
              className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              <Landmark size={14} />
              <span>Jump to Post Office &amp; Banking Store</span>
            </a>
            <span className="text-xs font-semibold text-slate-500 tabular-nums hidden sm:inline">
              Showing {filteredCategoryProducts.length} Top SKUs
            </span>
          </div>
        </div>

        {/* Interactive Hyper-Local Category & Service Filter Pills */}
        <div
          className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filter Storefront by Hyper-Local Category"
        >
          {CATEGORY_FILTER_PILLS.map((pill) => {
            const IconComp = pill.icon;
            const isSelected = activeFilterPill === pill.id;
            const count =
              pill.id === 'all'
                ? aggregatedCatalog.length
                : aggregatedCatalog.filter((p) => p.categoryKey === pill.id).length;
            return (
              <button
                key={pill.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveFilterPill(pill.id)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                id={`category-pill-${pill.id}`}
              >
                <IconComp size={14} />
                <span>{pill.label}</span>
                <span
                  className={`font-mono text-[10px] tabular-nums ${
                    isSelected ? 'text-white/80' : 'text-slate-400'
                  }`}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Uniform Compact 4-Column Desktop Product Grid */}
        {filteredCategoryProducts.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
            id="top-trending-products-grid"
          >
            {filteredCategoryProducts.map((item) => renderCompactProductCard(item, false))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-2">
            <p className="text-sm font-bold text-slate-900">
              No products matched "{searchQuery}" in this category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveFilterPill('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
            >
              Reset Filter &amp; Show Trending Deals
            </button>
          </div>
        )}
      </section>

      {/* 4A. SCROLL-X ROW 2 · DAILY KIRANA & HOUSEHOLD RATION */}
      <CategoryCatalogRow
        rowId="daily-kirana-section"
        kicker={`Daily Household Kirana & Ration · PIN ${activeVicinityZone.pincode}`}
        title="High-Velocity Flour, Edible Oils, Unpolished Pulses &amp; Ration Hampers"
        subtitle="Stone-ground Aashirvaad chakki atta, Fortune 5L twin edible oil cans, Tata Sampann pulses and monthly grocery crates delivered express."
        icon={ShoppingBag}
        accentColor="amber"
        items={kiranaCatalogItems}
        lang={lang}
        activePincode={activeVicinityZone.pincode}
        availability={inventoryMap.kirana}
        onAddToCart={handleAddToCart}
        onViewMore={() => {
          setActiveFilterPill('supermarket');
          document.getElementById('top-trending-categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        viewMoreTitle="View More Kirana SKUs"
        viewMoreSubtitle="Explore verified ration crates and daily kitchen staples"
      />

      {/* 4B. SCROLL-X ROW 3 · FRESH DAIRY, BAKERY & QSR MEALS */}
      <CategoryCatalogRow
        rowId="dairy-bakery-section"
        kicker="Cold-Chain Dairy, Fresh Bakes &amp; Domino's Meals"
        title="Fresh A2 Buffalo Milk, Malai Paneer, Truffle Cakes &amp; Domino's Combos"
        subtitle="Morning cold-chain fresh milk supply, authentic malai paneer, artisanal croissants and piping hot Domino's pizza."
        icon={Cake}
        accentColor="red"
        items={dairyBakeryCatalogItems}
        lang={lang}
        activePincode={activeVicinityZone.pincode}
        availability={inventoryMap.dairy_qsr}
        onAddToCart={handleAddToCart}
        onViewMore={() => {
          setActiveFilterPill('bakery_dairy');
          document.getElementById('top-trending-categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        viewMoreTitle="View More Dairy &amp; Meals"
        viewMoreSubtitle="Explore fresh morning dairies, confectioneries &amp; QSR deals"
      />

      {/* 4C. SCROLL-X ROW 4 · ELECTRONICS, AUDIO & SMART TECH HUB */}
      <CategoryCatalogRow
        rowId="electronics-tech-section"
        kicker="Reliance Digital &amp; Smart Living Hub · Official Warranty"
        title="ANC Wireless Earbuds, GaN Fast Chargers, Power Banks &amp; Smart Appliances"
        subtitle="Authorized boAt ANC earbuds, 65W GaN laptop fast chargers, 20,000mAh power banks, and Smart Living 4.5L digital air fryers delivered on Speed Post COD."
        icon={Smartphone}
        accentColor="indigo"
        items={electronicsCatalogItems}
        lang={lang}
        activePincode={activeVicinityZone.pincode}
        availability={inventoryMap.electronics}
        onAddToCart={handleAddToCart}
        onViewMore={() => {
          setActiveFilterPill('electronics');
          document.getElementById('top-trending-categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        viewMoreTitle="View More Smart Tech"
        viewMoreSubtitle="Explore headphones, chargers, air fryers &amp; smart appliances"
      />

      {/* 4D. SCROLL-X ROW 5 · MEDICAL, WELLNESS & PHARMACY ESSENTIALS */}
      <CategoryCatalogRow
        rowId="medical-pharmacy-section"
        kicker="24x7 Verified Pharmacy &amp; Home Healthcare · Cold-Chain Ready"
        title="BP Monitors, Accu-Chek Glucometers, First-Aid Kits &amp; OTC Wellness"
        subtitle="Clinically validated home diagnostics, diabetes care strips, student first-aid boxes, and ORS + immunity packs delivered via express Beat dispatch."
        icon={HeartPulse}
        accentColor="emerald"
        items={medicalCatalogItems}
        lang={lang}
        activePincode={activeVicinityZone.pincode}
        availability={inventoryMap.medical_pharmacy}
        onAddToCart={handleAddToCart}
        onViewMore={() => {
          setActiveFilterPill('medical');
          document.getElementById('top-trending-categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        viewMoreTitle="View More Pharmacy SKUs"
        viewMoreSubtitle="Explore BP monitors, diagnostic strips &amp; daily healthcare"
      />

      {/* 4E. SCROLL-X ROW 6 · FRESH SABJI MANDI & FARM FRUITS */}
      <CategoryCatalogRow
        rowId="sabji-mandi-section"
        kicker="Kota &amp; Baran Sabji Mandi Direct · Morning 6 AM Farm Pick"
        title="Daily Seasonal Vegetables, Potatoes, Onions, Leafy Greens &amp; Fruit Boxes"
        subtitle="Farm-sorted clean vegetables, Chipsona potatoes, Nashik onions, organic palak/methi greens, and Kinnow fruit crates at Mandi rates."
        icon={Leaf}
        accentColor="emerald"
        items={sabjiMandiCatalogItems}
        lang={lang}
        activePincode={activeVicinityZone.pincode}
        availability={inventoryMap.sabji_mandi}
        onAddToCart={handleAddToCart}
        onViewMore={() => {
          setActiveFilterPill('sabji_mandi');
          document.getElementById('top-trending-categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        viewMoreTitle="Explore Full Sabji Mandi"
        viewMoreSubtitle="Fresh morning produce, leafy bundles &amp; seasonal fruits"
      />

      {/* 4F. SCROLL-X ROW 7 · FASHION, APPAREL & SPORTS FOOTWEAR */}
      <CategoryCatalogRow
        rowId="fashion-footwear-section"
        kicker="Allen Solly, Levi's, Fabindia &amp; Velocity Sports Studio"
        title="Branded Cotton Polos, Stretch Denim, Kurta Sets &amp; Running Sneakers"
        subtitle="Showroom-sealed fashion essentials, tailored formalwear, athletic footwear, and cricket kits with easy 48-hour size exchange."
        icon={Shirt}
        accentColor="purple"
        items={fashionFootwearCatalogItems}
        lang={lang}
        activePincode={activeVicinityZone.pincode}
        availability={inventoryMap.fashion_footwear}
        onAddToCart={handleAddToCart}
        onViewMore={() => {
          setActiveFilterPill('apparel');
          document.getElementById('top-trending-categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        viewMoreTitle="View Fashion &amp; Sports"
        viewMoreSubtitle="Browse showroom fashion, footwear &amp; fitness combos"
      />

      {/* 5. LOCAL SERVICE ECOSYSTEM CARDS & DETAILED STORE NAVIGATION */}
      <LocalServiceEcosystemCards
        lang={lang}
        activePincode={activeVicinityZone.pincode}
        onAddToCart={handleAddToCart}
      />

      {/* 6. LEGAL & GOVERNMENT DOCUMENTATION CITIZEN DESK */}
      <CitizenDocumentationDesk
        lang={lang}
        activePincode={activeVicinityZone.pincode}
      />

      {/* 6B. CONSOLIDATED OFFICIAL BRAND STORES DIRECTORY (1 UNIFIED STORE PER BRAND) - SCROLL-X */}
      <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-800" id="official-brand-stores-grid">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
              <Award size={14} />
              <span>Official Brand Stores · PIN {activeVicinityZone.pincode} ({activeVicinityZone.officeName})</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight" style={{ textWrap: 'balance' }}>
              One Official Store Per Brand · Centralized XPOKART COD Checkout
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">
              Slide horizontally or click arrows
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollBrandStores('left')}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollBrandStores('right')}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={brandScrollRef}
          className="flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {OFFICIAL_BRAND_STORES.map((brand) => (
            <Link
              key={brand.slug}
              to={`/brand/${brand.slug}`}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-red-400 hover:shadow-md transition overflow-hidden flex flex-col justify-between shrink-0 w-[240px] sm:w-[260px] snap-start"
            >
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                <img
                  src={brand.coverImage}
                  alt={brand.brandName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 text-white">
                  <div className="text-[10px] font-mono font-bold text-amber-300 uppercase truncate">
                    {brand.trustAssurance}
                  </div>
                  <div className="text-sm font-black truncate">{brand.brandName}</div>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between gap-2 text-[11px]">
                <span className="text-slate-600 font-semibold truncate">
                  {brand.categoryLabel}
                </span>
                <span className="font-black text-red-700 group-hover:translate-x-0.5 transition inline-flex items-center gap-1 shrink-0">
                  <span>Store</span>
                  <ArrowRight size={11} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6C. TOP TRENDING SOFTWARE, CRMS & BUSINESS SOLUTIONS (SCROLL-X) */}
      <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-zinc-800" id="software-saas-solutions-section">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Top Trending Software, CRMs &amp; Business Solutions · PIN {activeVicinityZone.pincode}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight" style={{ textWrap: 'balance' }}>
              WhatsApp Bulk Messaging, Tally Connector, AI Video &amp; App Builders
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">
              Slide horizontally or click arrows
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollSoftwareStores('left')}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollSoftwareStores('right')}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={softwareScrollRef}
          className="flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {getConsolidatedProductsForBrand('software-saas-hub', activeVicinityZone.pincode).allProducts.map((item) => {
            const discountPct = Math.round(((item.mrpPrice - item.retailPrice) / item.mrpPrice) * 100);
            const waText = encodeURIComponent(
              `Namaste XPOKART Software Desk (PIN ${activeVicinityZone.pincode}),\nI want to order software solution: *${item.title}* (${item.sku}).\nPrice: ₹${item.retailPrice.toLocaleString('en-IN')} (MRP: ₹${item.mrpPrice.toLocaleString('en-IN')}, ${discountPct}% Off).\nDigital Delivery + Speed Post COD / WhatsApp Onboarding.`
            );
            return (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition overflow-hidden flex flex-col justify-between shrink-0 w-[280px] sm:w-[300px] snap-start p-4 space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-purple-100 text-purple-900 font-mono">
                      {item.badgeTag || 'Digital License'}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700">
                      {discountPct}% OFF
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Offer Price</div>
                      <div className="text-base font-black text-slate-900">
                        ₹{item.retailPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">MRP</div>
                      <div className="text-xs text-slate-400 line-through font-mono">
                        ₹{item.mrpPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleAddToCart({
                          id: item.id,
                          sku: item.sku,
                          title: item.title,
                          price: item.retailPrice,
                          imageSrc: item.imageSrc,
                          vendorName: item.brandName,
                          beatNo: 'Beat 2',
                        })
                      }
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <ShoppingCart size={13} />
                      <span>Add Cart</span>
                    </button>

                    <a
                      href={`https://wa.me/919460020640?text=${waText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <MessageCircle size={13} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. BLOCK 3 · DEDICATED VENDOR HORIZONTAL CAROUSELS (4-CARD DESKTOP GRID PER VENDOR) */}
      <section className="space-y-6 pt-4 border-t border-slate-200 dark:border-zinc-800" id="vendor-carousels-hub">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <Store size={14} />
              <span>Authorized Brand &amp; Local Storefront Carousels · 13 Pincode Hubs</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Browse by Authorized Brand, EV Mobility &amp; Verified Store
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Slide horizontally or click Left/Right arrows · PIN {activeVicinityZone.pincode}
          </span>
        </div>

        <div className="space-y-5">
          {vendorCarousels.map((vendor) => {
            const hub = getPincodeHub(activeVicinityZone.pincode);
            const brandSlug = resolveBrandSlug(vendor.items[0]?.brand || vendor.vendorName);
            const vendorWaText = encodeURIComponent(
              `Namaste XPOKART Store Desk (PIN ${hub.pincode}),\nI want instant booking / pricing from verified store: *${vendor.vendorName}*.`
            );
            return (
              <div
                key={vendor.id}
                id={vendor.anchorId || vendor.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-2xs"
              >
                {/* Vendor Header Bar + Carousel Scroll Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <ShieldCheck size={13} />
                        <span>{vendor.verifiedMeta}</span>
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono font-bold text-slate-700">{vendor.marginSummary}</span>
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 truncate">
                      {vendor.vendorName}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-1">{vendor.tagline}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link
                      to={`/brand/${brandSlug}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition"
                    >
                      <span>Official Store</span>
                      <ArrowRight size={12} />
                    </Link>

                    <a
                      href={`https://api.whatsapp.com/send?phone=${hub.whatsappPhone}&text=${vendorWaText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition"
                    >
                      <MessageCircle size={12} />
                      <span>{translate('whatsapp_desk', lang)}</span>
                    </a>

                    <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                      <button
                        type="button"
                        onClick={() => scrollVendorCarousel(vendor.id, 'left')}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 transition cursor-pointer"
                        aria-label={`Scroll ${vendor.vendorName} left`}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollVendorCarousel(vendor.id, 'right')}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 transition cursor-pointer"
                        aria-label={`Scroll ${vendor.vendorName} right`}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Horizontal Snap-X Slider Showing 4 Uniform Cards Per Row on Desktop */}
                <div
                  ref={(el) => {
                    vendorCarouselRefs.current[vendor.id] = el;
                  }}
                  className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  {vendor.items.map((item) => renderCompactProductCard(item, true))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. BLOCK 4 · DEDICATED "POST OFFICE, BANKING & FINANCE SERVICES" STORE & TABS */}
      <section className="space-y-6 pt-4 border-t border-slate-200" id="post-office-banking-store">
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Landmark size={15} />
                <span>Official Sovereign Store &amp; IPPB Banking · PIN {activeVicinityZone.pincode}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Post Office, Banking &amp; Finance Services
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
                Dedicated official storefront for Sukanya Samriddhi (SSY), Senior Citizen Savings (SCSS), Postal Life Insurance (PLI), IPPB Zero-Balance accounts, ₹10L Accident Cover, Jeevan Pramaan DLC, Child Aadhaar CELC, MyStamp &amp; Gangajal.
              </p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 shrink-0 space-y-1.5 text-xs">
              <div className="text-amber-300 font-bold">Active Postal Delivery Hub</div>
              <div className="font-semibold text-white">
                {activeVicinityZone.officeName} · PIN {activeVicinityZone.pincode}
              </div>
              <div className="font-semibold text-slate-300">{activeVicinityZone.slaMinutes} · Certified KYC</div>
            </div>
          </div>

          {/* Sub-Tabs for Post Office & Banking Store */}
          <div
            className="flex items-center gap-2 overflow-x-auto pt-6 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
            const matchedProduct = POSTAL_PRODUCTS.find((p) => p.code === offering.productCode) || POSTAL_PRODUCTS[0];
            const activeHub = getPincodeHub(activeVicinityZone.pincode);
            const waText = encodeURIComponent(
              `Namaste ${activeHub.officeName} Desk (PIN ${activeHub.pincode}),\nI want official booking / doorstep assistance for: *${offering.title}* (${offering.badge}).\nRate / Benefit: ${offering.officialRateHighlight} | Fee: ₹${offering.retailPrice} (MRP ₹${offering.mrpPrice})\nHub Coordinator: ${activeHub.beatManager}`
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
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2 text-white">
                      <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide truncate">
                        {offering.badge}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-mono font-black tabular-nums shrink-0">
                        {offering.officialRateHighlight}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      {activeHub.officeName} · PIN {activeHub.pincode} (Coord: {activeHub.beatManager})
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
                          ₹{(Number(offering?.retailPrice) || 0).toLocaleString('en-IN')}
                        </span>
                        {(Number(offering?.mrpPrice) || 0) > (Number(offering?.retailPrice) || 0) && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{(Number(offering?.mrpPrice) || 0).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 font-mono">
                        PIN {activeHub.pincode} · ₹15 Del
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
                          sku: offering.productCode,
                          title: offering.title,
                          price: offering.retailPrice,
                          imageSrc: offering.imageSrc,
                          vendorName: `${activeHub.officeName} Sovereign Desk`,
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
                    href={`https://api.whatsapp.com/send?phone=${getPincodeHub(activeVicinityZone.pincode).whatsappPhone}&text=${waText}`}
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

      {/* 6. NEIGHBORHOOD STORES & VERIFIED SERVICES DIRECTORY */}
      <section className="space-y-6 pt-4 border-t border-slate-200" id="local-b2b-merchants-directory">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-700">
              PIN {activeVicinityZone.pincode} Neighborhood &amp; Store Directory
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Verified Local Merchants, EV, Fashion &amp; Daily Essentials Directory
            </h3>
          </div>
          <div className="text-xs font-medium text-slate-500">
            Serving 13 Kota &amp; Baran Pincode Hubs · Flat ₹15 Speed Post COD
          </div>
        </div>

        {/* Neighborhood Quick Filter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {NEIGHBORHOOD_CATEGORIES.map((cat) => {
            const IconComp = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSearchQuery(cat.title.split(' ')[0]);
                }}
                className={`group text-left bg-white rounded-2xl border ${cat.borderClass} p-5 shadow-2xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${cat.gradient} text-white shadow-md group-hover:scale-105 transition duration-200`}>
                    <IconComp size={22} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-mono font-bold">
                    {cat.count} Stores
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-red-700 tracking-wider">
                    {cat.badgeText}
                  </span>
                  <h4 className="font-black text-sm text-slate-900 group-hover:text-red-700 transition">
                    {cat.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {cat.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Unified Local Storefront Section (Excluding Post Office items) */}
        <div className="pt-4">
          <PublicStorefrontSection
            excludePostOfficeItems={true}
            externalSearchQuery={searchQuery}
            activePincode={activeVicinityZone.pincode}
            onAddToCart={handleAddToCart}
          />
        </div>
      </section>

      {/* PAN-INDIA DOORSTEP ASSISTANCE TRUST SECTION */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="text-xs font-semibold text-red-700">
              All-India Postal Network · India Post &amp; IPPB Doorstep Banking
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              How Doorstep Postal Banking, Speed Post COD &amp; Beat Delivery Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Serving 13 Kota &amp; Baran Regional Postal Hubs ({activeVicinityZone.officeName}, PIN {activeVicinityZone.pincode}), XPOKART connects citizens and verified neighborhood stores through smartphone-equipped Postmen delivering sovereign accounts, biometric e-KYC, and Speed Post COD parcels at your doorstep.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-900">01. Browse by Category</div>
                <p className="text-xs text-slate-600 mt-1">
                  Pick Kirana, Pharmacy, Sabji Mandi, EV, Fashion, or Sovereign Savings &amp; Insurance.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-900">02. Instant Beat Routing</div>
                <p className="text-xs text-slate-600 mt-1">
                  Your inquiry or COD order routes directly to your selected Pincode Delivery Hub.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-900">03. Doorstep Fulfillment</div>
                <p className="text-xs text-slate-600 mt-1">
                  Receive your order with flat ₹15 Speed Post COD delivery or IPPB UPI QR payment.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 space-y-4">
            <div className="text-xs font-semibold text-amber-400">
              XPOKART · Hyper-Local Marketplace &amp; Postal Network Reach
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-black text-white tabular-nums">8.2% p.a.</div>
                <div className="text-xs text-slate-300 mt-0.5">Peak Tax-Free Rate (SSY &amp; SCSS)</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-black text-amber-400 tabular-nums">Flat ₹15</div>
                <div className="text-xs text-slate-300 mt-0.5">Beat Doorstep COD Delivery</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-black text-emerald-400 tabular-nums">13 Hubs</div>
                <div className="text-xs text-slate-300 mt-0.5">Kota &amp; Baran Pincode Coverage</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-2xl font-black text-white tabular-nums">100%</div>
                <div className="text-xs text-slate-300 mt-0.5">Verified Brand &amp; Govt Trust</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Dedicated Strip Linking B2B / Franchise / Merchant Inquiries to /b2b-partner */}
      <section className="rounded-2xl bg-slate-900 text-white border border-slate-800 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
            <Building2 size={18} />
          </div>
          <div>
            <div className="text-xs font-black text-white">
              Bulk Supply, Regional Franchise, or Brand Store Onboarding?
            </div>
            <p className="text-[11px] text-slate-300">
              Dedicated portal for commercial bulk buyers, pincode franchise seekers &amp; verified retail partners.
            </p>
          </div>
        </div>
        <Link
          to="/b2b-partner"
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition"
        >
          <span>Open B2B &amp; Partner Portal</span>
          <ArrowRight size={14} />
        </Link>
      </section>

      {/* Comprehensive Official Sovereign Store Footer */}
      <StoreFooter
        lang={lang}
        activePincode={activeVicinityZone.pincode}
        onOpenStaffLogin={onOpenStaffLogin}
        onOpenCitizenModal={() => {
          const el = document.getElementById('citizen-application-desk');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        onOpenTrackModal={() => setIsTrackerOpen(true)}
      />

      {/* SMART LEAD CAPTURE GATE MODAL */}
      {leadGateTargetProduct && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-gradient-to-r from-red-900 via-red-800 to-slate-950 text-white flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-amber-300">
                  {leadGateMode === 'KNOW_MORE'
                    ? 'Unlock Full Scheme Details & Calculator'
                    : 'Instant Doorstep Inquiry & Callback'}
                </div>
                <h3 className="text-lg font-black text-white mt-1 leading-snug">
                  {leadGateTargetProduct.name}
                </h3>
                <p className="text-xs text-slate-200 mt-1">
                  Enter your Name and Mobile Number to view complete interest rates, tax benefits, eligibility, and maturity returns.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLeadGateTargetProduct(null)}
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

              {leadGateMode === 'QUICK_INQUIRY' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Specific Question or Requirement (Optional)
                  </label>
                  <input
                    type="text"
                    value={inquiryNote}
                    onChange={(e) => setInquiryNote(e.target.value)}
                    placeholder="e.g. Want to open account for 5-year-old daughter..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setLeadGateTargetProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-black transition flex items-center gap-2 shadow-md cursor-pointer"
                  id="lead-gate-submit-btn"
                >
                  <span>Unlock Full Scheme Details</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Closing DynamicProductPageView conditional wrapper */}
        </>
      )}

      {/* MULTI-PLATFORM SOCIAL SHARING MODAL */}
      {shareModalProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-gradient-to-r from-red-900 via-red-800 to-slate-950 text-white flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-300">
                  Official Scheme Flyer · Dadabari S.O. Dispatch
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

      {/* SLIDE-OVER SHOPPING CART & SPEED POST COD CHECKOUT DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-slate-200">
            <div className="p-5 bg-gradient-to-r from-slate-950 via-red-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingCart size={20} className="text-amber-400" />
                <div>
                  <h3 className="font-black text-base text-white">XPOKART Speed Post COD Cart</h3>
                  <p className="text-[11px] text-slate-300">
                    PIN {activeVicinityZone.pincode} · {activeVicinityZone.officeName} · Flat ₹15 Express COD
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
                    Your order has been routed to <strong>{lastPlacedOrders[0].beatNo}</strong> ({lastPlacedOrders[0].pincodeManagerName}). Pay Cash or IPPB QR at doorstep.
                  </p>
                  <div className="space-y-2">
                    {lastPlacedOrders.map((ord) => (
                      <div key={ord.id} className="p-3 bg-white rounded-xl border border-emerald-200 text-xs space-y-1">
                        <div className="font-bold text-slate-900">{ord.productTitle}</div>
                        <div className="font-mono text-emerald-700 font-black">{ord.speedPostBarcode}</div>
                        <div className="text-slate-500 flex justify-between">
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
                        setIsTrackerOpen(true);
                      }}
                      className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Track Live Status
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCartOpen(false)}
                      className="flex-1 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <ShoppingBag size={40} className="mx-auto text-slate-300" />
                  <div className="text-sm font-black text-slate-800">Your XPOKART Cart is Empty</div>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Add branded apparel, electronics, pharmacy, sabji mandi, or kirana staples for doorstep Speed Post COD delivery.
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
                          <div className="text-[11px] text-slate-500">
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
                          <span className="w-6 text-center font-mono font-bold">{item.quantity}</span>
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

                  <form onSubmit={handleCheckoutSubmit} className="space-y-3 pt-4 border-t border-slate-200">
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
                      onChange={(e) => {
                        const val = e.target.value;
                        setCheckoutName(val);
                        cartRecoveryService.captureActivity({
                          stage: 'DETAILS_TYPED',
                          pincode: activeVicinityZone.pincode,
                          items: cartItems.map((ci) => ({
                            id: ci.id,
                            sku: ci.sku,
                            title: ci.title,
                            price: ci.price,
                            quantity: ci.quantity,
                            vendorName: ci.vendorName,
                          })),
                          customerName: val,
                          customerMobile: checkoutMobile,
                          deliveryAddress: checkoutAddress,
                        });
                      }}
                      placeholder="Recipient Full Name *"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                    />
                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={checkoutMobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setCheckoutMobile(val);
                          cartRecoveryService.captureActivity({
                            stage: 'DETAILS_TYPED',
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
                            customerMobile: val,
                            deliveryAddress: checkoutAddress,
                          });
                        }}
                        placeholder="10-Digit Mobile *"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                      />
                      <select
                        value={checkoutBeat}
                        onChange={(e) => setCheckoutBeat(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                      >
                        <option value="Beat 2">Hub Priority Beat</option>
                        <option value="Beat 1">Central Hub Beat</option>
                        <option value="Beat 5">South Sector Beat</option>
                        <option value="Beat 6">West Sector Beat</option>
                        <option value="Beat 17">East Extension Beat</option>
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
                        <span className="font-mono font-bold">₹{(Number(totalCartAmount) || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-emerald-300">
                        <span>Speed Post COD · PIN {activeVicinityZone.pincode}</span>
                        <span className="font-mono font-bold">Flat ₹15 Express COD</span>
                      </div>
                      <div className="flex justify-between text-slate-300 text-[11px]">
                        <span>Stocking Partner</span>
                        <span className="font-semibold text-white truncate max-w-[190px]">
                          {getPincodeHub(activeVicinityZone.pincode).localStockingPartner}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-amber-400 pt-1.5 border-t border-white/15">
                        <span>Payable at Doorstep (COD / QR)</span>
                        <span className="font-mono">₹{(Number(totalCartAmount) || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Truck size={15} />
                      <span>Confirm Speed Post COD Order</span>
                    </button>

                    {/* Automated WhatsApp & SMS Cart Recovery Triggers */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-[11px] font-bold text-slate-700">
                        Need to finish later? Save cart &amp; send recovery link:
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={cartRecoveryService.buildWhatsAppRecoveryHref(getOrBuildRecoverySession())}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => cartRecoveryService.recordWhatsAppRecoveryClick(getOrBuildRecoverySession())}
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

      {/* SPEED POST COD ORDER TRACKER MODAL */}
      {isTrackerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-slate-950 via-red-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Truck size={20} className="text-amber-400" />
                <div>
                  <h3 className="font-black text-base">XPOKART Live Speed Post COD Tracker</h3>
                  <p className="text-[11px] text-slate-300">Track parcel barcodes (SP-RJ-{activeVicinityZone.pincode}-...) &amp; Beat Postman status</p>
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
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={trackerSearchInput}
                  onChange={(e) => setTrackerSearchInput(e.target.value)}
                  placeholder="Enter Mobile, Order ID (XPD-COD-...), or Speed Post Barcode..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {trackedOrders.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    No matching Speed Post COD parcel found for &quot;{trackerSearchInput}&quot;.
                  </div>
                ) : (
                  trackedOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-black text-red-700">{ord.speedPostBarcode || ord.id}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {ord.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 truncate">{ord.productTitle}</div>
                        <div className="text-[11px] text-slate-500">
                          {ord.customerName} · {ord.beatNo} ({ord.pincodeManagerName})
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <div className="font-mono font-black text-slate-900 text-sm">₹{ord.codAmount}</div>
                        <div className="text-[10px] text-slate-500">{ord.serviceType}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING WHATSAPP CUSTOMER SUPPORT TRIGGER (ZERO VISIBLE PHONE NUMBER) */}
      <a
        href={`https://api.whatsapp.com/send?phone=${getPincodeHub(activeVicinityZone.pincode).whatsappPhone}&text=${encodeURIComponent(
          `Namaste XPOKART Support Desk (PIN ${activeVicinityZone.pincode} · ${activeVicinityZone.officeName}),\nI need quick help with an order, grocery box, pharmacy item, or Sovereign Postal service.`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with XPOKART WhatsApp Support"
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
