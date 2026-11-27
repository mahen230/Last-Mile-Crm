import { staffProductService } from './staffProductService';
import { getPincodeHub } from './pincodeOperationsService';
import { indiaPostBulkShowcaseService } from './indiaPostBulkShowcaseService';

import imgHandloom from '../assets/images/store_kota_handloom_1794731364865.jpg';
import imgDigitalDocs from '../assets/images/store_digital_documents_1794731363970.jpg';
import imgBankingFinance from '../assets/images/store_banking_finance_1794731363192.jpg';
import imgLogisticsCourier from '../assets/images/store_logistics_courier_1794731362561.jpg';
import imgPliProtection from '../assets/images/scheme_pli_protection_1794734838755.jpg';
import imgPpfWealth from '../assets/images/scheme_ppf_nsc_wealth_1794734840742.jpg';
import imgSsySukanya from '../assets/images/scheme_ssy_sukanya_1794734839476.jpg';
import imgScssSenior from '../assets/images/scheme_scss_senior_1794734838931.jpg';
import imgIppbQr from '../assets/images/prod_ippb_merchant_qr_1794734841471.jpg';
import imgMyStamp from '../assets/images/prod_mystamp_philately_1794734841690.jpg';
import imgGangajal from '../assets/images/prod_gangajal_sacred_1794734840915.jpg';
import imgJeevanPramaan from '../assets/images/prod_jeevan_pramaan_dlc_1794734841567.jpg';

export interface UnifiedBrandProduct {
  id: string;
  sku: string;
  title: string;
  brandSlug: string;
  brandName: string;
  categoryGroup: string;
  mrpPrice: number;
  retailPrice: number;
  imageSrc: string;
  description: string;
  badgeTag: string;
}

export interface OfficialBrandStore {
  slug: string;
  brandName: string;
  shortTagline: string;
  categoryLabel: string;
  coverImage: string;
  accentGradient: string;
  trustAssurance: string;
  deliveryGuarantee: string;
  featuredCategories: string[];
}

export const OFFICIAL_BRAND_STORES: OfficialBrandStore[] = [
  {
    slug: 'india-post',
    brandName: 'India Post — Official Services & Citizen Hub',
    shortTagline:
      'National Speed Post, Registered Parcel COD, Sovereign Savings Schemes (SSA/PPF/SCSS), PLI/RPLI & IPPB Doorstep Banking',
    categoryLabel: 'Department of Posts · Government of India',
    coverImage: imgBankingFinance,
    accentGradient: 'from-red-950 via-red-900 to-slate-950',
    trustAssurance: '100% Sovereign Government of India Assurance',
    deliveryGuarantee: 'Pan-India Speed Post Network & Beat Doorstep Delivery',
    featuredCategories: ['Speed Post & Booking', 'National Savings & PLI', 'Citizen & IPPB Services'],
  },
  {
    slug: 'bulk-customers',
    brandName: 'India Post — Bulk Customer & Product Promotion',
    shortTagline:
      'Verified India Post Bulk Customers, BNPL Business Parcel Shippers, GI Handloom, Study Materials & Institutional Dispatch',
    categoryLabel: 'India Post Bulk Customer Showcase',
    coverImage: imgLogisticsCourier,
    accentGradient: 'from-amber-950 via-red-900 to-slate-950',
    trustAssurance: 'Verified India Post Bulk Mail & BNPL Partners',
    deliveryGuarantee: 'Barcode-Tracked Speed Post & Business Parcel Fulfillment',
    featuredCategories: [
      'Books & Study Material',
      'Handloom & Textiles',
      'Medical & Diagnostics',
      'Agro & Regional Goods',
    ],
  },
];

const BASE_UNIFIED_BRAND_PRODUCTS: UnifiedBrandProduct[] = [
  {
    id: 'brand-ip-01',
    sku: 'BRAND-IP-SPEEDPOST-50',
    title: 'Speed Post Domestic Parcel Booking & Real-Time Tracking',
    brandSlug: 'india-post',
    brandName: 'India Post — Official Services & Citizen Hub',
    categoryGroup: 'Speed Post & Booking',
    mrpPrice: 65,
    retailPrice: 50,
    imageSrc: imgLogisticsCourier,
    description:
      'Guaranteed time-bound domestic express delivery with online barcode tracking and SMS delivery intimations.',
    badgeTag: 'Sovereign Service',
  },
  {
    id: 'brand-ip-02',
    sku: 'BRAND-IP-SSA-250',
    title: 'Sukanya Samriddhi Yojana (SSA) Deposit Passbook Package',
    brandSlug: 'india-post',
    brandName: 'India Post — Official Services & Citizen Hub',
    categoryGroup: 'National Savings & PLI',
    mrpPrice: 250,
    retailPrice: 250,
    imageSrc: imgSsySukanya,
    description:
      'Government small savings scheme at 8.2% p.a. with Triple Tax Exemption (EEE) for girl children.',
    badgeTag: '8.2% Tax Free',
  },
  {
    id: 'brand-ip-03',
    sku: 'BRAND-IP-PPF-500',
    title: 'Public Provident Fund (PPF) 15-Year Account Package',
    brandSlug: 'india-post',
    brandName: 'India Post — Official Services & Citizen Hub',
    categoryGroup: 'National Savings & PLI',
    mrpPrice: 500,
    retailPrice: 500,
    imageSrc: imgPpfWealth,
    description:
      'Central Government sovereign wealth instrument at 7.1% p.a. compounding with Section 80C tax deductions.',
    badgeTag: 'Sovereign Guarantee',
  },
  {
    id: 'brand-ip-04',
    sku: 'BRAND-IP-PLI-1000',
    title: 'Postal Life Insurance (PLI) Santosh Endowment Policy',
    brandSlug: 'india-post',
    brandName: 'India Post — Official Services & Citizen Hub',
    categoryGroup: 'National Savings & PLI',
    mrpPrice: 1200,
    retailPrice: 1000,
    imageSrc: imgPliProtection,
    description:
      'Oldest sovereign life insurer in India providing maximum bonus rate and low premium for citizens & professionals.',
    badgeTag: 'Highest Bonus Rate',
  },
  {
    id: 'brand-ip-05',
    sku: 'BRAND-IP-SCSS-1000',
    title: 'Senior Citizen Savings Scheme (SCSS) Quarterly Pension Plan',
    brandSlug: 'india-post',
    brandName: 'India Post — Official Services & Citizen Hub',
    categoryGroup: 'National Savings & PLI',
    mrpPrice: 1000,
    retailPrice: 1000,
    imageSrc: imgScssSenior,
    description:
      'Regular quarterly sovereign interest payout at 8.2% p.a. tailored for retirees and senior citizens.',
    badgeTag: '8.2% Quarterly Payout',
  },
  {
    id: 'brand-ip-06',
    sku: 'BRAND-IP-IPPB-150',
    title: 'India Post Payments Bank (IPPB) Digital Account + Doorstep AePS',
    brandSlug: 'india-post',
    brandName: 'India Post — Official Services & Citizen Hub',
    categoryGroup: 'Citizen & IPPB Services',
    mrpPrice: 200,
    retailPrice: 150,
    imageSrc: imgIppbQr,
    description:
      'Instant paperless Aadhaar-based biometric account opening with zero minimum balance and doorstep AePS cash withdrawal.',
    badgeTag: 'Doorstep Banking',
  },
  {
    id: 'brand-ip-07',
    sku: 'BRAND-IP-DLC-70',
    title: 'Jeevan Pramaan Digital Life Certificate (Doorstep Biometric)',
    brandSlug: 'india-post',
    brandName: 'India Post — Official Services & Citizen Hub',
    categoryGroup: 'Citizen & IPPB Services',
    mrpPrice: 70,
    retailPrice: 70,
    imageSrc: imgJeevanPramaan,
    description:
      'Postman/GDS doorstep biometric Jeevan Pramaan renewal for central & state government pensioners.',
    badgeTag: 'Doorstep Pensioner Service',
  },
  {
    id: 'brand-ip-08',
    sku: 'BRAND-IP-PHILATELY-300',
    title: 'National Philately My Stamp & Commemorative Collector Set',
    brandSlug: 'india-post',
    brandName: 'India Post — Official Services & Citizen Hub',
    categoryGroup: 'Speed Post & Booking',
    mrpPrice: 300,
    retailPrice: 300,
    imageSrc: imgMyStamp,
    description:
      'Official India Post commemorative postage stamps, My Stamp personalized sheets, and First Day Covers.',
    badgeTag: 'Collector Heritage',
  },
  {
    id: 'brand-ip-09',
    sku: 'BRAND-IP-GANGAJAL-30',
    title: 'India Post Gangotri Sacred Gangajal Pack (250 ml)',
    brandSlug: 'india-post',
    brandName: 'India Post — Official Services & Citizen Hub',
    categoryGroup: 'Citizen & IPPB Services',
    mrpPrice: 30,
    retailPrice: 30,
    imageSrc: imgGangajal,
    description:
      'Bottled at Gangotri and delivered through India Post offices and local beat delivery desks.',
    badgeTag: 'Official Counter Item',
  },
];

export function resolveBrandSlug(brandName?: string): string {
  const lower = (brandName || '').toLowerCase().trim();
  if (lower.includes('bulk') || lower.includes('bnpl') || lower.includes('showcase')) {
    return 'bulk-customers';
  }
  return 'india-post';
}

export function getOfficialBrandBySlug(slug?: string): OfficialBrandStore {
  const norm = (slug || '').trim().toLowerCase();
  if (norm === 'bulk-customers' || norm === 'india-post-bulk') {
    return OFFICIAL_BRAND_STORES[1];
  }
  return OFFICIAL_BRAND_STORES[0];
}

/**
 * Returns consolidated, SKU-deduplicated products for India Post Official Services
 * or the India Post Bulk Customer & Product Promotion Showcase, dynamically merged with
 * indiaPostBulkShowcaseService items and staff-published postal items.
 */
export function getConsolidatedProductsForBrand(
  brandSlug: string,
  activePincode: string
): {
  brand: OfficialBrandStore;
  hub: ReturnType<typeof getPincodeHub>;
  productsByCategory: Record<string, UnifiedBrandProduct[]>;
  allProducts: UnifiedBrandProduct[];
} {
  const brand = getOfficialBrandBySlug(brandSlug);
  const hub = getPincodeHub(activePincode);
  const seenSkus = new Set<string>();
  const collected: UnifiedBrandProduct[] = [];

  for (const item of BASE_UNIFIED_BRAND_PRODUCTS) {
    if (brand.slug === 'bulk-customers') continue;
    const key = item.sku.trim().toUpperCase();
    if (seenSkus.has(key)) continue;
    seenSkus.add(key);
    collected.push(item);
  }

  // Merge active Bulk Customer Promoted Products
  const bulkPromoted = indiaPostBulkShowcaseService.getPromotedProducts(false);
  for (const promo of bulkPromoted) {
    if (brand.slug === 'india-post' && !promo.isFeatured) continue;
    const key = (promo.sku || promo.id).trim().toUpperCase();
    if (seenSkus.has(key)) continue;
    seenSkus.add(key);
    collected.push({
      id: promo.id,
      sku: promo.sku,
      title: promo.title,
      brandSlug: brand.slug,
      brandName: promo.bulkCustomerName,
      categoryGroup: promo.category,
      mrpPrice: promo.mrpPrice,
      retailPrice: promo.retailPrice,
      imageSrc: promo.imageUrl || imgHandloom,
      description: `${promo.description} · ${promo.bulkOfferDetails}`,
      badgeTag: `PIN ${promo.pincode} · ${promo.officeName}`,
    });
  }

  // Merge staff-published postal items safely (filtering out any legacy commercial non-postal titles)
  const staffCatalog = staffProductService.getPublicCatalog();
  for (const prod of staffCatalog) {
    const rawText = `${prod.brandName || ''} ${prod.vendorName || ''} ${prod.title || ''}`.toLowerCase();
    if (
      rawText.includes('xpokart') ||
      rawText.includes('xpeedo') ||
      rawText.includes('drop dash') ||
      rawText.includes('shop deck') ||
      rawText.includes('domino') ||
      rawText.includes('reliance') ||
      rawText.includes('allen solly') ||
      rawText.includes('levi')
    ) {
      continue;
    }
    if (prod.price < 0) continue;
    const key = (prod.sku || prod.id).trim().toUpperCase();
    if (seenSkus.has(key)) continue;
    seenSkus.add(key);
    const mrp = prod.mrpPrice && prod.mrpPrice > prod.price ? prod.mrpPrice : Math.round(prod.price * 1.2);
    collected.push({
      id: prod.id,
      sku: prod.sku,
      title: prod.title,
      brandSlug: brand.slug,
      brandName: prod.vendorName || 'India Post',
      categoryGroup: prod.brandCategoryTag || prod.vendorCategory || brand.featuredCategories[0] || 'Postal Services',
      mrpPrice: mrp,
      retailPrice: prod.price,
      imageSrc: prod.thumbnailUrl || imgDigitalDocs,
      description: prod.description,
      badgeTag: `Fulfilled via PIN ${hub.pincode}`,
    });
  }

  const productsByCategory: Record<string, UnifiedBrandProduct[]> = {};
  for (const item of collected) {
    if (!productsByCategory[item.categoryGroup]) {
      productsByCategory[item.categoryGroup] = [];
    }
    productsByCategory[item.categoryGroup].push(item);
  }

  return {
    brand,
    hub,
    productsByCategory,
    allProducts: collected,
  };
}
