import {
  IndiaPostBulkCustomer,
  IndiaPostPromotedProduct,
  LeadSelectedProductItem,
  PublicInquiryStatusResult,
} from '../types/models';
import { POSTAL_PRODUCTS } from '../data/productsData';
import { customerService } from './customerService';
import { getPincodeHub } from './pincodeOperationsService';

export interface PostalServiceOffering {
  id: string;
  code: string;
  name: string;
  category: 'Banking & FinTech' | 'Identity & Citizen Services' | 'Mail & Logistics' | 'Sovereign Savings & Insurance';
  description: string;
  commissionRate: string;
  commissionNumeric: number;
  isActive: boolean;
  minAmount?: string;
  sla: string;
  iconType: 'bank' | 'id' | 'mail' | 'shield' | 'rupee';
  highlights: string[];
}

export const POSTAL_OFFERINGS_STORAGE_KEY = 'kota_division_os_postal_offerings_v1';

export const DEFAULT_POSTAL_OFFERINGS: PostalServiceOffering[] = [
  {
    id: 'offering-ippb-banking',
    code: 'IPPB_SB',
    name: 'IPPB Digital Savings & Current Account',
    category: 'Banking & FinTech',
    description: 'Instant zero-balance Aadhaar biometric account opening with virtual debit card & direct DBT linkage.',
    commissionRate: '₹50 per funded account',
    commissionNumeric: 50,
    isActive: true,
    minAmount: '₹200 initial funding',
    sla: 'Instant (5 minutes at doorstep)',
    iconType: 'bank',
    highlights: ['Zero Paperwork Biometric KYC', 'Direct DBT Subsidies Link', 'Virtual RuPay Debit Card'],
  },
  {
    id: 'offering-aadhaar-celc',
    code: 'CELC_AADHAAR',
    name: 'Aadhaar / CELC Mobile Update & Enrolment',
    category: 'Identity & Citizen Services',
    description: 'Child Aadhaar enrolment (0-5 yrs) and mandatory mobile number linking/updating via micro-biometrics.',
    commissionRate: '₹20 per mobile update / enrolment',
    commissionNumeric: 20,
    isActive: true,
    minAmount: '₹50 official UIDAI fee',
    sla: 'Same day (24-48 hrs UIDAI sync)',
    iconType: 'id',
    highlights: ['Child Enrolment (0-5 yrs)', 'Mobile Number Linkage', 'Doorstep Biometric Device'],
  },
  {
    id: 'offering-aeps-cash',
    code: 'AEPS_CASH',
    name: 'AePS Doorstep Cash Withdrawal & Balance',
    category: 'Banking & FinTech',
    description: 'Inter-bank cash withdrawal from any bank account using Aadhaar fingerprint authentication.',
    commissionRate: '₹10 per transaction (min ₹1,000)',
    commissionNumeric: 10,
    isActive: true,
    minAmount: '₹100 to ₹10,000 per day',
    sla: 'Instant cash hand-over',
    iconType: 'rupee',
    highlights: ['Works with 120+ Banks', 'Elderly & Sick Citizen Friendly', 'Instant Receipt via SMS'],
  },
  {
    id: 'offering-jeevan-pramaan',
    code: 'DLC_PENSION',
    name: 'Jeevan Pramaan (Digital Life Certificate - DLC)',
    category: 'Identity & Citizen Services',
    description: 'Doorstep biometric digital life certificate generation for central, state, and defense pensioners.',
    commissionRate: '₹30 per generated DLC',
    commissionNumeric: 30,
    isActive: true,
    minAmount: '₹70 statutory fee',
    sla: 'Instant DLC Pramaan ID',
    iconType: 'shield',
    highlights: ['Govt & Defense Pensioners', 'Biometric / Iris Matching', 'Auto-submission to Pension Disbursing Agency'],
  },
  {
    id: 'offering-speed-post-parcel',
    code: 'DNK_PARCEL',
    name: 'Speed Post, Priority Parcel & Dak Ghar Niryat Kendra',
    category: 'Mail & Logistics',
    description: 'Express domestic speed post, priority parcels, and local merchant parcel pickup with end-to-end tracking.',
    commissionRate: '₹15 per article booking',
    commissionNumeric: 15,
    isActive: true,
    minAmount: 'Varies by weight (from ₹41)',
    sla: '24-48 hours delivery SLA',
    iconType: 'mail',
    highlights: ['Real-time Track & Trace', 'Doorstep Bulk Pickup for Stores', 'Domestic & Export Customs Clearance'],
  },
  {
    id: 'offering-my-stamp',
    code: 'MY_STAMP',
    name: 'My Stamp & Customized Philately Sheets',
    category: 'Identity & Citizen Services',
    description: 'Personalized postage stamps featuring photos of individuals, family milestones, or corporate branding.',
    commissionRate: '₹60 per sheet',
    commissionNumeric: 60,
    isActive: true,
    minAmount: '₹300 per sheet (12 stamps)',
    sla: '3 working days delivery',
    iconType: 'mail',
    highlights: ['Valid Indian Postage', 'Custom Photo & Milestones', 'Official Collector Memorabilia'],
  },
  {
    id: 'offering-ssa',
    code: 'SSA_GIRL_CHILD',
    name: 'Sukanya Samriddhi Yojana (SSA)',
    category: 'Sovereign Savings & Insurance',
    description: 'Premier sovereign-guaranteed 8.2% tax-free savings dedicated to girl children with EEE tax exemption.',
    commissionRate: '₹75 per account opened',
    commissionNumeric: 75,
    isActive: true,
    minAmount: '₹250 minimum deposit',
    sla: 'Passbook within 2 days',
    iconType: 'shield',
    highlights: ['8.2% Sovereign Annual Return', '100% Tax Free (Section 80C)', 'Higher Education & Marriage Corpus'],
  },
  {
    id: 'offering-pli-rpli',
    code: 'PLI_SURAKSHA',
    name: 'Postal Life Insurance (PLI / RPLI)',
    category: 'Sovereign Savings & Insurance',
    description: 'Oldest & highest-bonus life insurance in India with lowest premium rates for govt, semi-govt & rural citizens.',
    commissionRate: '10% of 1st year premium (~₹200 - ₹1,200)',
    commissionNumeric: 250,
    isActive: true,
    minAmount: 'Sum Assured ₹20,000 to ₹50 Lakh',
    sla: 'Medical/Non-medical fast approval',
    iconType: 'shield',
    highlights: ['Highest Bonus Rate in Industry', 'Sovereign Govt of India Guarantee', 'Suraksha, Santosh & Suvidha Plans'],
  },
  {
    id: 'offering-scss-mahila',
    code: 'SCSS_MSSC',
    name: 'Senior Citizen Savings (SCSS) & Mahila Samman',
    category: 'Sovereign Savings & Insurance',
    description: 'High-yield central government savings schemes tailored for retirees (8.2%) and women empowerment (7.5%).',
    commissionRate: '₹50 per certificate account',
    commissionNumeric: 50,
    isActive: true,
    minAmount: '₹1,000 to ₹30 Lakh',
    sla: '2 working days',
    iconType: 'rupee',
    highlights: ['Quarterly Interest Payouts', 'Senior Citizen 8.2% Interest', '2-Year Mahila Samman 7.5%'],
  },
];

export interface UnifiedShowcaseCatalogItem extends LeadSelectedProductItem {
  description: string;
  suggestedServiceTags: string[];
  minAmountOrUnit?: string;
  officeName?: string;
  imageUrl?: string;
}

export function inferServiceTagsForProduct(text: string): string[] {
  const t = (text || '').toLowerCase();
  const tags = new Set<string>();
  if (t.includes('speed post') || t.includes('dnk') || t.includes('niryat') || t.includes('mail')) {
    tags.add('Speed Post & Registered Mail');
  }
  if (t.includes('parcel') || t.includes('cod') || t.includes('bnpl') || t.includes('bulk') || t.includes('pack') || t.includes('mailer')) {
    tags.add('Parcel & E-Commerce COD');
    tags.add('Bulk Customer & Promoted Showcase');
  }
  if (t.includes('ssa') || t.includes('sukanya') || t.includes('ppf') || t.includes('scss') || t.includes('mis') || t.includes('rd') || t.includes('td') || t.includes('nsc') || t.includes('kvp') || t.includes('mahila') || t.includes('saving')) {
    tags.add('Small Savings (SSY / PPF / SCSS / MIS / RD / NSC)');
  }
  if (t.includes('pli') || t.includes('rpli') || t.includes('insurance') || t.includes('gpa') || t.includes('suraksha') || t.includes('santosh')) {
    tags.add('PLI / RPLI Life Insurance');
  }
  if (t.includes('ippb') || t.includes('aeps') || t.includes('qr') || t.includes('loan') || t.includes('bank')) {
    tags.add('IPPB Banking, AePS & Merchant QR');
  }
  if (t.includes('aadhaar') || t.includes('celc') || t.includes('jeevan') || t.includes('dlc')) {
    tags.add('Aadhaar / CELC & Jeevan Pramaan DLC');
  }
  if (t.includes('stamp') || t.includes('gangajal') || t.includes('merchandise') || t.includes('handloom') || t.includes('study') || t.includes('agro') || t.includes('medical')) {
    tags.add('MyStamp, Gangajal & Retail Counter');
  }
  if (tags.size === 0) {
    tags.add('Bulk Customer & Promoted Showcase');
  }
  return Array.from(tags);
}

import imgHandloom from '../assets/images/store_kota_handloom_1794731364865.jpg';
import imgStationery from '../assets/images/prod_b2b_stationery_coaching_1794734844056.jpg';
import imgPharma from '../assets/images/prod_b2b_pharma_wellness_1794734843342.jpg';
import imgKirana from '../assets/images/prod_b2b_kirana_wholesale_1794734842973.jpg';
import imgCodLogistics from '../assets/images/prod_b2b_cod_logistics_1794734840043.jpg';
import imgMyStamp from '../assets/images/prod_mystamp_philately_1794734841690.jpg';
import imgIppbQr from '../assets/images/prod_ippb_merchant_qr_1794734841471.jpg';
import imgGangajal from '../assets/images/prod_gangajal_sacred_1794734840915.jpg';

const BULK_CUSTOMERS_KEY = 'indiapost_bulk_customers_v1';
const PROMOTED_PRODUCTS_KEY = 'indiapost_promoted_products_v1';

export const SHOWCASE_ASSET_OPTIONS: Array<{ id: string; label: string; url: string }> = [
  { id: 'cod-parcel', label: 'Speed Post Bulk Parcel & BNPL', url: imgCodLogistics },
  { id: 'stationery', label: 'Educational Study Material Dispatch', url: imgStationery },
  { id: 'handloom', label: 'Kota Doria & Handloom Parcel', url: imgHandloom },
  { id: 'pharma', label: 'Medical & Wellness Supply Pack', url: imgPharma },
  { id: 'agro', label: 'Regional Agro & Kirana Bulk Pack', url: imgKirana },
  { id: 'mystamp', label: 'My Stamp & Philately Corporate Set', url: imgMyStamp },
  { id: 'ippb', label: 'IPPB Merchant QR & Postal Banking', url: imgIppbQr },
  { id: 'gangajal', label: 'India Post Gangajal Sovereign Pack', url: imgGangajal },
];

const SEEDED_BULK_CUSTOMERS: IndiaPostBulkCustomer[] = [
  {
    id: 'BULK-KOTA-01',
    businessName: 'Kota Academic Study Material Dispatch Hub',
    category: 'Books & Study Material',
    contactPerson: 'Academic Fulfillment Desk',
    pincode: '324005',
    officeName: 'Vigyan Nagar S.O.',
    beatNo: 'Beat 14',
    division: 'Kota Division',
    tagline: 'Pan-India Speed Post & Business Parcel dispatch for coaching study modules & test series',
    highlights: ['BNPL Contract Dispatch', 'Barcode Manifesting', 'All-India PIN Coverage'],
    bnplOrAccountRef: 'BNPL-KOTA-324005-01',
    isActive: true,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'BULK-KOTA-02',
    businessName: 'Kaithoon Kota Doria Weavers Guild',
    category: 'Handloom & Textiles',
    contactPerson: 'Heritage Loom Cooperative',
    pincode: '325001',
    officeName: 'Kaithoon S.O.',
    beatNo: 'Beat 1',
    division: 'Kota Division',
    tagline: 'Authentic GI-tagged Kota Doria sarees & handloom gift hampers shipped nationwide via India Post',
    highlights: ['GI Craft Verified', 'Insured Speed Post Parcel', 'COD Available'],
    bnplOrAccountRef: 'BNPL-KOTA-325001-02',
    isActive: true,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'BULK-KOTA-03',
    businessName: 'Dadabari Surgical & Pharmacy Distributors',
    category: 'Medical & Diagnostics',
    contactPerson: 'Medical Supply Desk',
    pincode: '324009',
    officeName: 'Dadabari S.O.',
    beatNo: 'Beat 2',
    division: 'Kota Division',
    tagline: 'Tamper-evident medical & diagnostic parcel dispatch across Kota Division & neighboring districts',
    highlights: ['Priority Beat Pickup', 'Moisture-Sealed Packing', 'Same-Day Booking'],
    bnplOrAccountRef: 'BNPL-KOTA-324009-03',
    isActive: true,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'BULK-BARAN-04',
    businessName: 'Hadoti Spice & Agro Producers Collective',
    category: 'Agro & Regional Goods',
    contactPerson: 'FPO Agro Dispatch',
    pincode: '325205',
    officeName: 'Baran H.O.',
    beatNo: 'Beat 1',
    division: 'Baran Division',
    tagline: 'Farm-sourced coriander, mustard cold-press & regional spice hampers delivered via India Post Parcel',
    highlights: ['Direct FPO Origin', 'Bulk Carton Rates', 'Pan-India Speed Post'],
    bnplOrAccountRef: 'BNPL-BARAN-325205-04',
    isActive: true,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'BULK-KOTA-05',
    businessName: 'Indraprastha Packaging & Industrial Mailers',
    category: 'Industrial & Packaging',
    contactPerson: 'RIICO Industrial Hub Desk',
    pincode: '324003',
    officeName: 'Indraprastha S.O.',
    beatNo: 'Beat 1',
    division: 'Kota Division',
    tagline: 'Corrugated mailers, barcode pouches & bulk business parcel pick-ups for SMEs',
    highlights: ['Bulk Volume Rebate', 'Doorstep Collection', 'GST Invoice Ready'],
    bnplOrAccountRef: 'BNPL-KOTA-324003-05',
    isActive: true,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'BULK-KOTA-06',
    businessName: 'Kota GPO Philately & Corporate MyStamp Desk',
    category: 'Government & Institutional',
    contactPerson: 'Philately & Bulk Mail Counter',
    pincode: '324001',
    officeName: 'Kota H.O.',
    beatNo: 'Beat 1',
    division: 'Kota Division',
    tagline: 'Customized corporate My Stamp sheets, Gangajal packs & official Business Reply Mailers',
    highlights: ['Official India Post Issue', 'Corporate Branding Sheets', 'Bulk Institution Orders'],
    bnplOrAccountRef: 'BNPL-KOTA-324001-06',
    isActive: true,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
];

const SEEDED_PROMOTED_PRODUCTS: IndiaPostPromotedProduct[] = [
  {
    id: 'INP-PROMO-01',
    sku: 'INP-BULK-STUDY-1299',
    bulkCustomerId: 'BULK-KOTA-01',
    bulkCustomerName: 'Kota Academic Study Material Dispatch Hub',
    title: 'Competitive Exam Printed Module Bundle (5 kg Business Parcel)',
    category: 'Books & Study Material',
    pincode: '324005',
    officeName: 'Vigyan Nagar S.O.',
    beatCoverage: 'Beat 14 · Pan-India Speed Post',
    priceDisplay: '₹1,299',
    mrpPrice: 1650,
    retailPrice: 1299,
    bulkOfferDetails: 'Book 25+ bundles with BNPL tariff & doorstep bulk pickup',
    minOrderOrUnit: '1 Bundle (Bulk slab: 25+ units)',
    highlights: ['Printed Book Post Rate', 'Tamper-proof wrap', 'Online Barcode Tracking'],
    description:
      'Complete printed academic study set packaged for individual students and coaching institutions with India Post barcode tracking.',
    imageUrl: imgStationery,
    isActive: true,
    isFeatured: true,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'INP-PROMO-02',
    sku: 'INP-BULK-DORIA-2450',
    bulkCustomerId: 'BULK-KOTA-02',
    bulkCustomerName: 'Kaithoon Kota Doria Weavers Guild',
    title: 'Authentic GI-Tagged Kota Doria Handloom Gift Box',
    category: 'Handloom & Textiles',
    pincode: '325001',
    officeName: 'Kaithoon S.O.',
    beatCoverage: 'Beat 1 · Kaithoon S.O. to Pan-India',
    priceDisplay: '₹2,450',
    mrpPrice: 3100,
    retailPrice: 2450,
    bulkOfferDetails: '12% wholesale rebate for 10+ saree gift boxes via Speed Post COD',
    minOrderOrUnit: '1 Gift Box (Bulk slab: 10+ boxes)',
    highlights: ['GI Handloom Authentic', 'Moisture-safe kraft parcel', 'COD up to ₹50,000'],
    description:
      'Handwoven pure cotton-silk Kota Doria saree packed directly at Kaithoon loom cooperative and dispatched through Kaithoon S.O.',
    imageUrl: imgHandloom,
    isActive: true,
    isFeatured: true,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'INP-PROMO-03',
    sku: 'INP-BULK-MEDKIT-1499',
    bulkCustomerId: 'BULK-KOTA-03',
    bulkCustomerName: 'Dadabari Surgical & Pharmacy Distributors',
    title: 'Clinic & Home First-Aid + Digital BP Monitoring Pack',
    category: 'Medical & Diagnostics',
    pincode: '324009',
    officeName: 'Dadabari S.O.',
    beatCoverage: 'Beat 2 · Dadabari S.O. & Kota Division',
    priceDisplay: '₹1,499',
    mrpPrice: 1990,
    retailPrice: 1499,
    bulkOfferDetails: 'Priority Beat 2 pickup with institutional clinic carton discount',
    minOrderOrUnit: '1 Kit (Bulk slab: 15+ clinics)',
    highlights: ['Sealed Diagnostic Pack', 'Beat 2 Fast Dispatch', 'GST Billing Supported'],
    description:
      'Calibrated digital BP monitor & essential diagnostic care pack prepared by Dadabari Surgical & Pharmacy Distributors.',
    imageUrl: imgPharma,
    isActive: true,
    isFeatured: true,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'INP-PROMO-04',
    sku: 'INP-BULK-AGRO-890',
    bulkCustomerId: 'BULK-BARAN-04',
    bulkCustomerName: 'Hadoti Spice & Agro Producers Collective',
    title: 'Hadoti Whole Spices & Cold-Pressed Mustard Oil 5kg Box',
    category: 'Agro & Regional Goods',
    pincode: '325205',
    officeName: 'Baran H.O.',
    beatCoverage: 'Beat 1 · Baran H.O. & Pan-India',
    priceDisplay: '₹890',
    mrpPrice: 1150,
    retailPrice: 890,
    bulkOfferDetails: 'FPO volume parcel rate on orders of 20+ boxes per manifest',
    minOrderOrUnit: '5 kg Agro Box (Bulk: 20+ boxes)',
    highlights: ['Direct Farmer Collective', 'Baran H.O. Booked', 'Leak-Proof Tin Packing'],
    description:
      'Freshly graded Hadoti coriander, cumin, turmeric, and kachi ghani mustard oil dispatched directly from Baran H.O.',
    imageUrl: imgKirana,
    isActive: true,
    isFeatured: false,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'INP-PROMO-05',
    sku: 'INP-BULK-MAILER-1750',
    bulkCustomerId: 'BULK-KOTA-05',
    bulkCustomerName: 'Indraprastha Packaging & Industrial Mailers',
    title: 'India Post Pre-Printed Tamper-Proof Courier Pouches (Pack of 250)',
    category: 'Industrial & Packaging',
    pincode: '324003',
    officeName: 'Indraprastha S.O.',
    beatCoverage: 'Beat 1 · Indraprastha I.A. & All Division PINs',
    priceDisplay: '₹1,750',
    mrpPrice: 2350,
    retailPrice: 1750,
    bulkOfferDetails: 'Free Beat collection & custom barcode sleeve printing on 1,000+ pouches',
    minOrderOrUnit: '250 Pouches / Carton',
    highlights: ['POD Jacket Pocket', '70-Micron Tamper Seal', 'Same-Day RIICO Pickup'],
    description:
      'Industrial grade tamper-evident shipping bags engineered for Speed Post COD and BNPL bulk e-commerce shippers.',
    imageUrl: imgCodLogistics,
    isActive: true,
    isFeatured: false,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'INP-PROMO-06',
    sku: 'INP-BULK-MYSTAMP-300',
    bulkCustomerId: 'BULK-KOTA-06',
    bulkCustomerName: 'Kota GPO Philately & Corporate MyStamp Desk',
    title: 'Personalized India Post My Stamp Sheet (12 Official Stamps)',
    category: 'Government & Institutional',
    pincode: '324001',
    officeName: 'Kota H.O.',
    beatCoverage: 'All Division PINs · Kota GPO Counter',
    priceDisplay: '₹300',
    mrpPrice: 300,
    retailPrice: 300,
    bulkOfferDetails: 'Custom institutional & corporate logo embossing available for 100+ sheets',
    minOrderOrUnit: '1 Sheet (12 Stamps) · Bulk: 100+ sheets',
    highlights: ['Valid Domestic Postage', 'Official Philately Issue', 'Custom Photo / Logo'],
    description:
      'Official India Post My Stamp collectible postage sheet issued via Kota Head Post Office for events, institutions, and gifts.',
    imageUrl: imgMyStamp,
    isActive: true,
    isFeatured: true,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'INP-PROMO-07',
    sku: 'INP-BULK-GANGAJAL-60',
    bulkCustomerId: 'BULK-KOTA-06',
    bulkCustomerName: 'Kota GPO Philately & Corporate MyStamp Desk',
    title: 'India Post Gangotri Sacred Gangajal Pack (250 ml)',
    category: 'Government & Institutional',
    pincode: '324009',
    officeName: 'Dadabari S.O.',
    beatCoverage: 'All Kota Beats · Doorstep Delivery',
    priceDisplay: '₹30',
    mrpPrice: 30,
    retailPrice: 30,
    bulkOfferDetails: 'Institutional & temple trust carton packs (24 bottles) delivered via Beat Postman',
    minOrderOrUnit: '1 Bottle (250 ml)',
    highlights: ['Bottled at Gangotri', 'Official India Post Distribution', 'Counter & Beat Stock'],
    description:
      'Pure Gangotri Gangajal sealed and distributed across India Post counters and beat postmen without extra markup.',
    imageUrl: imgGangajal,
    isActive: true,
    isFeatured: false,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'INP-PROMO-08',
    sku: 'INP-BULK-IPPBQR-0',
    bulkCustomerId: 'BULK-KOTA-06',
    bulkCustomerName: 'Kota GPO Philately & Corporate MyStamp Desk',
    title: 'IPPB Merchant Digital QR & BNPL Settlement Onboarding',
    category: 'e-Commerce & BNPL Merchant',
    pincode: '324009',
    officeName: 'Dadabari S.O.',
    beatCoverage: 'All PINs · Instant Beat Onboarding',
    priceDisplay: 'Zero Fee',
    mrpPrice: 500,
    retailPrice: 0,
    bulkOfferDetails: 'Zero onboarding cost for India Post Bulk Customers, kirana stores & wholesalers',
    minOrderOrUnit: '1 Merchant Account',
    highlights: ['Instant Bank Credit', 'Zero MDR QR Standee', 'Doorstep KYC by Postman'],
    description:
      'Dedicated India Post Payments Bank merchant account & QR kit with direct BNPL Speed Post COD settlement support.',
    imageUrl: imgIppbQr,
    isActive: true,
    isFeatured: false,
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
  },
];

function readList<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as T[];
    }
  } catch {
    // ignore storage read error
  }
  try {
    localStorage.setItem(key, JSON.stringify(fallback));
  } catch {
    // ignore quota error
  }
  return [...fallback];
}

function saveList<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // ignore storage error
  }
}

class IndiaPostBulkShowcaseService {
  private listeners = new Set<() => void>();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore listener failure
      }
    });
  }

  public getBulkCustomers(includeInactive = false): IndiaPostBulkCustomer[] {
    const list = readList<IndiaPostBulkCustomer>(BULK_CUSTOMERS_KEY, SEEDED_BULK_CUSTOMERS);
    return includeInactive ? list : list.filter((c) => c.isActive);
  }

  public upsertBulkCustomer(
    input: Partial<IndiaPostBulkCustomer> & { businessName: string; pincode: string }
  ): IndiaPostBulkCustomer {
    const list = readList<IndiaPostBulkCustomer>(BULK_CUSTOMERS_KEY, SEEDED_BULK_CUSTOMERS);
    const hub = getPincodeHub(input.pincode);
    const now = new Date().toISOString();
    const cleanId = (input.id || '').trim();
    const existingIdx = cleanId ? list.findIndex((c) => c.id === cleanId) : -1;

    const nextRecord: IndiaPostBulkCustomer = {
      id: cleanId || `BULK-${input.pincode}-${Date.now().toString(36).toUpperCase()}`,
      businessName: input.businessName.trim(),
      category: (input.category || 'e-Commerce & BNPL Merchant').trim(),
      contactPerson: (input.contactPerson || 'Dispatch Desk').trim(),
      contactPhone: (input.contactPhone || '').trim() || undefined,
      pincode: (input.pincode || '324009').trim(),
      officeName: (input.officeName || hub.officeName).trim(),
      beatNo: (input.beatNo || 'Beat 1').trim(),
      division: (input.division || hub.division || 'Kota Division').trim(),
      tagline: (input.tagline || 'Registered India Post Bulk & Business Parcel Customer').trim(),
      highlights:
        Array.isArray(input.highlights) && input.highlights.length > 0
          ? input.highlights.map((h) => h.trim()).filter(Boolean)
          : ['Speed Post BNPL', 'Verified Dispatch Hub'],
      bnplOrAccountRef: input.bnplOrAccountRef?.trim() || undefined,
      isActive: input.isActive !== undefined ? input.isActive : true,
      createdAt: existingIdx >= 0 ? list[existingIdx].createdAt : now,
      updatedAt: now,
    };

    if (existingIdx >= 0) {
      list[existingIdx] = nextRecord;
    } else {
      list.unshift(nextRecord);
    }
    saveList(BULK_CUSTOMERS_KEY, list);
    this.notify();
    return nextRecord;
  }

  public toggleBulkCustomerStatus(id: string): IndiaPostBulkCustomer | null {
    const list = readList<IndiaPostBulkCustomer>(BULK_CUSTOMERS_KEY, SEEDED_BULK_CUSTOMERS);
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      isActive: !list[idx].isActive,
      updatedAt: new Date().toISOString(),
    };
    saveList(BULK_CUSTOMERS_KEY, list);
    this.notify();
    return list[idx];
  }

  public getPromotedProducts(includeInactive = false): IndiaPostPromotedProduct[] {
    const list = readList<IndiaPostPromotedProduct>(PROMOTED_PRODUCTS_KEY, SEEDED_PROMOTED_PRODUCTS);
    return includeInactive ? list : list.filter((p) => p.isActive);
  }

  public getFilteredShowcase(filters: {
    pincode?: string;
    category?: string;
    query?: string;
    bulkCustomerId?: string;
  }): {
    customers: IndiaPostBulkCustomer[];
    products: IndiaPostPromotedProduct[];
    categories: string[];
  } {
    const allCustomers = this.getBulkCustomers(false);
    const allProducts = this.getPromotedProducts(false);
    const pin = (filters.pincode || '').trim();
    const cat = (filters.category || '').trim().toLowerCase();
    const q = (filters.query || '').trim().toLowerCase();
    const custFilter = (filters.bulkCustomerId || '').trim();

    const filteredCustomers = allCustomers.filter((c) => {
      if (pin && pin !== 'ALL' && c.pincode !== pin) return false;
      if (cat && cat !== 'all' && c.category.toLowerCase() !== cat) return false;
      if (q) {
        const hay = `${c.businessName} ${c.category} ${c.officeName} ${c.pincode} ${c.tagline} ${c.highlights.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const filteredProducts = allProducts.filter((p) => {
      if (custFilter && p.bulkCustomerId !== custFilter) return false;
      if (pin && pin !== 'ALL' && p.pincode !== pin) return false;
      if (cat && cat !== 'all' && p.category.toLowerCase() !== cat) return false;
      if (q) {
        const hay = `${p.title} ${p.bulkCustomerName} ${p.category} ${p.officeName} ${p.pincode} ${p.bulkOfferDetails} ${p.description} ${p.highlights.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const categories = Array.from(
      new Set([
        ...allCustomers.map((c) => c.category),
        ...allProducts.map((p) => p.category),
      ])
    ).sort();

    return {
      customers: filteredCustomers,
      products: filteredProducts,
      categories,
    };
  }

  public upsertPromotedProduct(
    input: Partial<IndiaPostPromotedProduct> & {
      title: string;
      bulkCustomerId: string;
    }
  ): IndiaPostPromotedProduct {
    const list = readList<IndiaPostPromotedProduct>(PROMOTED_PRODUCTS_KEY, SEEDED_PROMOTED_PRODUCTS);
    const customers = this.getBulkCustomers(true);
    const matchedCust = customers.find((c) => c.id === input.bulkCustomerId);
    const pincode = (input.pincode || matchedCust?.pincode || '324009').trim();
    const hub = getPincodeHub(pincode);
    const now = new Date().toISOString();
    const cleanId = (input.id || '').trim();
    const existingIdx = cleanId ? list.findIndex((p) => p.id === cleanId) : -1;
    const priceNum = Number(input.retailPrice ?? 0);
    const mrpNum = Number(input.mrpPrice ?? (priceNum > 0 ? Math.round(priceNum * 1.2) : 0));

    const record: IndiaPostPromotedProduct = {
      id: cleanId || `INP-PROMO-${Date.now().toString(36).toUpperCase()}`,
      sku: (input.sku || `INP-BULK-${Date.now().toString().slice(-5)}`).trim().toUpperCase(),
      bulkCustomerId: input.bulkCustomerId,
      bulkCustomerName: (input.bulkCustomerName || matchedCust?.businessName || 'India Post Bulk Customer').trim(),
      title: input.title.trim(),
      category: (input.category || matchedCust?.category || 'Bulk Parcel').trim(),
      pincode,
      officeName: (input.officeName || matchedCust?.officeName || hub.officeName).trim(),
      beatCoverage: (input.beatCoverage || `${matchedCust?.beatNo || 'Beat 1'} · ${hub.officeName}`).trim(),
      priceDisplay: (input.priceDisplay || (priceNum > 0 ? `₹${priceNum.toLocaleString('en-IN')}` : 'Custom Bulk Quote')).trim(),
      mrpPrice: mrpNum,
      retailPrice: priceNum,
      bulkOfferDetails: (input.bulkOfferDetails || 'Available for individual dispatch & institutional BNPL bulk booking').trim(),
      minOrderOrUnit: (input.minOrderOrUnit || '1 Unit').trim(),
      highlights:
        Array.isArray(input.highlights) && input.highlights.length > 0
          ? input.highlights.map((h) => h.trim()).filter(Boolean)
          : ['India Post Verified Dispatch', 'Barcode Tracked'],
      description: (input.description || 'Promoted via India Post Bulk Customer Showcase.').trim(),
      imageUrl: input.imageUrl || SHOWCASE_ASSET_OPTIONS[0].url,
      isActive: input.isActive !== undefined ? input.isActive : true,
      isFeatured: Boolean(input.isFeatured),
      createdAt: existingIdx >= 0 ? list[existingIdx].createdAt : now,
      updatedAt: now,
    };

    if (existingIdx >= 0) {
      list[existingIdx] = record;
    } else {
      list.unshift(record);
    }
    saveList(PROMOTED_PRODUCTS_KEY, list);
    this.notify();
    return record;
  }

  public togglePromotedProductStatus(id: string): IndiaPostPromotedProduct | null {
    const list = readList<IndiaPostPromotedProduct>(PROMOTED_PRODUCTS_KEY, SEEDED_PROMOTED_PRODUCTS);
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      isActive: !list[idx].isActive,
      updatedAt: new Date().toISOString(),
    };
    saveList(PROMOTED_PRODUCTS_KEY, list);
    this.notify();
    return list[idx];
  }

  public deletePromotedProduct(id: string): boolean {
    const list = readList<IndiaPostPromotedProduct>(PROMOTED_PRODUCTS_KEY, SEEDED_PROMOTED_PRODUCTS);
    const next = list.filter((p) => p.id !== id);
    if (next.length === list.length) return false;
    saveList(PROMOTED_PRODUCTS_KEY, next);
    this.notify();
    return true;
  }

  public submitShowcaseInquiry(input: {
    customerName: string;
    mobile: string;
    pincode: string;
    productOrService: string;
    bulkCustomerName?: string;
    requirement: string;
    address?: string;
    preferredContact?: 'Phone Call' | 'WhatsApp' | 'Doorstep Visit' | 'Email';
  }): { ticketNumber: string; customerId?: string } {
    const hub = getPincodeHub(input.pincode);
    const res = customerService.submitCustomerInquiry({
      customerName: input.customerName.trim(),
      mobile: input.mobile.trim(),
      productInterested: input.bulkCustomerName
        ? `${input.productOrService} (${input.bulkCustomerName})`
        : input.productOrService,
      requirement: `${input.requirement.trim()} [PIN: ${hub.pincode} · ${hub.officeName}]`,
      preferredContact: input.preferredContact || 'Phone Call',
      address: (input.address || `${hub.name}, Kota Division - ${hub.pincode}`).trim(),
      beatNo: 'Beat 2',
    });

    return {
      ticketNumber: res.inquiry.ticketNumber,
      customerId: res.matchedCustomer?.id,
    };
  }

  /**
   * Public Inquiry Status Lookup: requires BOTH exact Ticket/Reference ID and matching
   * registered mobile number (10 digits or last 4 digits) so zero private customer or
   * internal staff details are exposed to unauthenticated public callers.
   */
  public lookupPublicInquiryStatus(
    referenceIdInput: string,
    mobileOrLast4Input: string
  ): PublicInquiryStatusResult {
    const refClean = (referenceIdInput || '').trim().toUpperCase();
    const digitsClean = (mobileOrLast4Input || '').replace(/\D/g, '');

    if (!refClean || (digitsClean.length !== 10 && digitsClean.length !== 4)) {
      return {
        found: false,
        referenceId: refClean,
        serviceOrProduct: '',
        status: '',
        pincode: '',
        beatNo: '',
        maskedPhone: '',
        updatedAt: '',
        note: 'Enter a valid Reference/Ticket ID and either your 10-digit mobile number or last 4 digits.',
      };
    }

    const matchesPhone = (storedMobile: string): boolean => {
      const storedDigits = (storedMobile || '').replace(/\D/g, '').slice(-10);
      if (!storedDigits) return false;
      if (digitsClean.length === 10) return storedDigits === digitsClean;
      return storedDigits.slice(-4) === digitsClean;
    };

    const maskPhone = (storedMobile: string): string => {
      const storedDigits = (storedMobile || '').replace(/\D/g, '').slice(-10);
      if (storedDigits.length < 4) return '******';
      return `XXXXXX${storedDigits.slice(-4)}`;
    };

    const inquiries = customerService.getInquiries();
    const inqMatch = inquiries.find(
      (i) =>
        (i.ticketNumber.toUpperCase() === refClean || i.id.toUpperCase() === refClean) &&
        matchesPhone(i.mobile)
    );

    if (inqMatch) {
      const pinMatch = inqMatch.requirement.match(/\b(\d{6})\b/)?.[1] || inqMatch.address?.match(/\b(\d{6})\b/)?.[1] || '324009';
      return {
        found: true,
        referenceId: inqMatch.ticketNumber,
        serviceOrProduct: inqMatch.productInterested,
        status: inqMatch.status,
        pincode: pinMatch,
        beatNo: 'Assigned Office Desk',
        maskedPhone: maskPhone(inqMatch.mobile),
        updatedAt: inqMatch.updatedAt,
        note: inqMatch.resolution || 'Your request is logged in the India Post division queue.',
      };
    }

    const tickets = customerService.getTickets();
    const tktMatch = tickets.find(
      (t) =>
        (t.ticketId.toUpperCase() === refClean || t.id.toUpperCase() === refClean) &&
        matchesPhone(t.customerMobile)
    );

    if (tktMatch) {
      return {
        found: true,
        referenceId: tktMatch.ticketId,
        serviceOrProduct: tktMatch.subject || tktMatch.category,
        status: tktMatch.status,
        pincode: '324009',
        beatNo: 'Assigned Office Desk',
        maskedPhone: maskPhone(tktMatch.customerMobile),
        updatedAt: tktMatch.updatedAt,
        note: tktMatch.resolutionNotes || 'Support request is active under India Post desk handling.',
      };
    }

    return {
      found: false,
      referenceId: refClean,
      serviceOrProduct: '',
      status: '',
      pincode: '',
      beatNo: '',
      maskedPhone: '',
      updatedAt: '',
      note: 'No matching inquiry found for that Ticket ID and mobile verification.',
    };
  }

  public getPostalOfferings(): PostalServiceOffering[] {
    try {
      const saved = localStorage.getItem(POSTAL_OFFERINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage error
    }
    return [...DEFAULT_POSTAL_OFFERINGS];
  }

  public getUnifiedShowcaseCatalog(): UnifiedShowcaseCatalogItem[] {
    const offerings = this.getPostalOfferings().filter((o) => o.isActive !== false);
    const promoted = this.getPromotedProducts(false);

    const offeringItems: UnifiedShowcaseCatalogItem[] = offerings.map((o) => {
      const parsedMin = Number((o.minAmount || '').replace(/[^\d]/g, '')) || 0;
      const estimatedUnit = parsedMin >= 100 ? parsedMin : Math.max(500, o.commissionNumeric * 20);
      return {
        id: o.id,
        code: o.code,
        title: o.name,
        sourceType: 'SHOWCASE_OFFERING',
        category: o.category,
        unitPrice: estimatedUnit,
        quantity: 1,
        commissionOrRate: o.commissionRate,
        sla: o.sla,
        description: o.description,
        minAmountOrUnit: o.minAmount,
        suggestedServiceTags: inferServiceTagsForProduct(`${o.code} ${o.name} ${o.category}`),
      };
    });

    const promotedItems: UnifiedShowcaseCatalogItem[] = promoted.map((p) => ({
      id: p.id,
      code: p.sku,
      title: p.title,
      sourceType: 'BULK_PROMOTED',
      category: p.category,
      unitPrice: p.retailPrice > 0 ? p.retailPrice : p.mrpPrice || 500,
      quantity: 1,
      commissionOrRate: p.priceDisplay,
      sla: p.beatCoverage,
      bulkCustomerName: p.bulkCustomerName,
      pincode: p.pincode,
      officeName: p.officeName,
      imageUrl: p.imageUrl,
      description: p.description,
      minAmountOrUnit: p.minOrderOrUnit,
      suggestedServiceTags: inferServiceTagsForProduct(`${p.sku} ${p.title} ${p.category} ${p.bulkCustomerName}`),
    }));

    const seenCodes = new Set([
      ...offeringItems.map((i) => i.code.toUpperCase()),
      ...promotedItems.map((i) => i.code.toUpperCase()),
    ]);

    const schemeItems: UnifiedShowcaseCatalogItem[] = POSTAL_PRODUCTS.filter(
      (sp) => !seenCodes.has(sp.code.toUpperCase())
    ).map((sp) => {
      const parsedMin = Number((sp.minInvestment || '').replace(/[^\d]/g, '')) || 0;
      return {
        id: sp.id,
        code: sp.code,
        title: sp.name,
        sourceType: 'POSTAL_SCHEME',
        category: sp.category,
        unitPrice: parsedMin >= 100 ? Math.min(parsedMin, 250000) : 1000,
        quantity: 1,
        commissionOrRate: sp.interestRateOrBonus,
        sla: sp.tenure,
        description: sp.tagline || sp.description,
        minAmountOrUnit: sp.minInvestment,
        suggestedServiceTags: inferServiceTagsForProduct(`${sp.code} ${sp.name} ${sp.category}`),
      };
    });

    return [...offeringItems, ...promotedItems, ...schemeItems];
  }
}

export const indiaPostBulkShowcaseService = new IndiaPostBulkShowcaseService();
