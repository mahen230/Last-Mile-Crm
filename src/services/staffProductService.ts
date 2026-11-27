import {
  BusinessServiceCategory,
  ProductListingStatus,
  ProductSourceType,
  StaffProductItem,
  StaffProductVertical,
  StaffSalesRights,
  CommercialStoreCategory,
  CommercialStoreRecord,
  StaffProfile,
  StoreEntityType,
  StoreServiceabilityResult,
} from '../types/models';
import { commercialPropertyService } from './commercialPropertyService';
import { featureVisibilityService } from './featureVisibilityService';
import imgLogistics from '../assets/images/store_logistics_courier_1794731362561.jpg';
import imgB2bCodLogistics from '../assets/images/prod_b2b_cod_logistics_1794734840043.jpg';
import imgBanking from '../assets/images/store_banking_finance_1794731363192.jpg';
import imgIppbMerchantQr from '../assets/images/prod_ippb_merchant_qr_1794734841471.jpg';
import imgDigitalDocs from '../assets/images/store_digital_documents_1794731363970.jpg';
import imgJeevanPramaan from '../assets/images/prod_jeevan_pramaan_dlc_1794734841567.jpg';
import imgMyStamp from '../assets/images/prod_mystamp_philately_1794734841690.jpg';
import imgGangajal from '../assets/images/prod_gangajal_sacred_1794734840915.jpg';
import imgAcademy from '../assets/images/store_academy_courses_1794731365263.jpg';
import imgHandloom from '../assets/images/store_kota_handloom_1794731364865.jpg';
import imgB2bKirana from '../assets/images/prod_b2b_kirana_wholesale_1794734842973.jpg';
import imgB2bPharma from '../assets/images/prod_b2b_pharma_wellness_1794734843342.jpg';
import imgB2bCoaching from '../assets/images/prod_b2b_stationery_coaching_1794734844056.jpg';

const STORAGE_KEY = 'xpeedo_staff_storefront_products_v1';
const RIGHTS_STORAGE_KEY = 'xpeedo_staff_sales_rights_v1';

export const OFFICIAL_BEAT2_WHATSAPP = '918769706002';
export const OFFICIAL_DADABARI_DESK_WHATSAPP = '919460020640';

export const ALL_PRODUCT_VERTICALS: StaffProductVertical[] = [
  'Logistics & Courier Services',
  'Banking & Finance',
  'Documents & Digital Services',
  'Course & Skill Academy',
  'Custom Staff / Partner Products',
];

export const DEFAULT_VERTICAL_THUMBNAILS: Record<StaffProductVertical, string> = {
  'Logistics & Courier Services': imgLogistics,
  'Banking & Finance': imgBanking,
  'Documents & Digital Services': imgDigitalDocs,
  'Course & Skill Academy': imgAcademy,
  'Custom Staff / Partner Products': imgHandloom,
};

// Map every seed ID to its unique bespoke thumbnail so cached localStorage records auto-upgrade cleanly
const SEED_UNIQUE_THUMBNAILS: Record<string, string> = {
  'PROD-LOG-001': imgLogistics,
  'PROD-LOG-006': imgB2bCodLogistics,
  'PROD-BNK-002': imgBanking,
  'PROD-IPPB-MERCHANT-QR': imgIppbMerchantQr,
  'PROD-DOC-003': imgDigitalDocs,
  'PROD-DOC-007': imgJeevanPramaan,
  'PROD-COMM-MYSTAMP': imgMyStamp,
  'PROD-COMM-GANGAJAL': imgGangajal,
  'PROD-EDU-004': imgAcademy,
  'PROD-CUST-005': imgHandloom,
  'PROD-B2B-KIRANA-01': imgB2bKirana,
  'PROD-B2B-PHARMA-02': imgB2bPharma,
  'PROD-B2B-COACHING-03': imgB2bCoaching,
};

const SEED_EXTRA_ECONOMICS: Record<
  string,
  Pick<
    StaffProductItem,
    | 'mrpPrice'
    | 'sellingMarginAmount'
    | 'sellingMarginPercent'
    | 'codEligible'
    | 'speedPostCharge'
    | 'vendorName'
    | 'vendorCategory'
    | 'beatManagerId'
    | 'beatManagerName'
  >
> = {
  'PROD-LOG-001': {
    mrpPrice: 180,
    sellingMarginAmount: 24,
    sellingMarginPercent: 16,
    codEligible: true,
    speedPostCharge: 0,
    vendorName: 'Dadabari S.O. Speed Post Hub',
    vendorCategory: 'Official India Post',
    beatManagerId: 'MASTER-ADMIN-01',
    beatManagerName: 'Ekta Meena · Division Head',
  },
  'PROD-LOG-006': {
    mrpPrice: 120,
    sellingMarginAmount: 18,
    sellingMarginPercent: 19,
    codEligible: true,
    speedPostCharge: 0,
    vendorName: 'Kota B2B BNPL Parcel Desk',
    vendorCategory: 'Wholesale',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
  },
  'PROD-BNK-002': {
    mrpPrice: 0,
    sellingMarginAmount: 50,
    sellingMarginPercent: 100,
    codEligible: false,
    speedPostCharge: 0,
    vendorName: 'India Post Payments Bank (IPPB)',
    vendorCategory: 'Official India Post',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
  },
  'PROD-IPPB-MERCHANT-QR': {
    mrpPrice: 0,
    sellingMarginAmount: 75,
    sellingMarginPercent: 100,
    codEligible: false,
    speedPostCharge: 0,
    vendorName: 'IPPB Merchant Soundbox & QR Network',
    vendorCategory: 'Services',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
  },
  'PROD-DOC-003': {
    mrpPrice: 50,
    sellingMarginAmount: 15,
    sellingMarginPercent: 30,
    codEligible: true,
    speedPostCharge: 0,
    vendorName: 'Dadabari CELC Mobile Aadhaar Unit',
    vendorCategory: 'Official India Post',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
  },
  'PROD-DOC-007': {
    mrpPrice: 70,
    sellingMarginAmount: 25,
    sellingMarginPercent: 36,
    codEligible: true,
    speedPostCharge: 0,
    vendorName: 'Jeevan Pramaan Biometric Kendra',
    vendorCategory: 'Official India Post',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
  },
  'PROD-COMM-MYSTAMP': {
    mrpPrice: 350,
    sellingMarginAmount: 45,
    sellingMarginPercent: 15,
    codEligible: true,
    speedPostCharge: 0,
    vendorName: 'Kota Philatelic & MyStamp Bureau',
    vendorCategory: 'Official India Post',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
  },
  'PROD-COMM-GANGAJAL': {
    mrpPrice: 35,
    sellingMarginAmount: 6,
    sellingMarginPercent: 20,
    codEligible: true,
    speedPostCharge: 0,
    vendorName: 'Gangotri Sovereign Retail Counter',
    vendorCategory: 'Official India Post',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
  },
  'PROD-EDU-004': {
    mrpPrice: 1499,
    sellingMarginAmount: 200,
    sellingMarginPercent: 20,
    codEligible: false,
    speedPostCharge: 0,
    vendorName: 'India Post Departmental Exam Academy',
    vendorCategory: 'Services',
    beatManagerId: 'MASTER-ADMIN-01',
    beatManagerName: 'Ekta Meena · Division Head',
  },
  'PROD-CUST-005': {
    mrpPrice: 1850,
    sellingMarginAmount: 240,
    sellingMarginPercent: 16,
    codEligible: true,
    speedPostCharge: 40,
    vendorName: 'Hadoti Weavers & Handloom Co-op',
    vendorCategory: 'Retail',
    beatManagerId: '10310736',
    beatManagerName: 'Mohit Arvind · Beat 5',
  },
  'PROD-B2B-KIRANA-01': {
    mrpPrice: 720,
    sellingMarginAmount: 98,
    sellingMarginPercent: 17,
    codEligible: true,
    speedPostCharge: 0,
    vendorName: 'Agrawal Heritage Masala & Ration Hub',
    vendorCategory: 'Wholesale',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
  },
  'PROD-B2B-PHARMA-02': {
    mrpPrice: 540,
    sellingMarginAmount: 76,
    sellingMarginPercent: 18,
    codEligible: true,
    speedPostCharge: 0,
    vendorName: 'Keshavpura Swasthya Ayurveda & Care',
    vendorCategory: 'Retail',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
  },
  'PROD-B2B-COACHING-03': {
    mrpPrice: 899,
    sellingMarginAmount: 130,
    sellingMarginPercent: 20,
    codEligible: true,
    speedPostCharge: 35,
    vendorName: 'Kota Scholar Books & Parcel Depot',
    vendorCategory: 'Wholesale',
    beatManagerId: '10310736',
    beatManagerName: 'Mohit Arvind · Beat 5',
  },
};

export function inferServiceCategory(product: Partial<StaffProductItem>): BusinessServiceCategory {
  if (product.serviceCategory) return product.serviceCategory as BusinessServiceCategory;
  const text = `${product.title || ''} ${product.vertical || ''} ${product.brandCategoryTag || ''} ${product.vendorCategory || ''} ${product.description || ''}`.toLowerCase();
  if (text.includes('ev') || text.includes('scooter') || text.includes('battery') || text.includes('charger')) {
    return 'EV Mobility & Batteries';
  }
  if (text.includes('software') || text.includes('crm') || text.includes('whatsapp api') || text.includes('saas') || text.includes('lovable') || text.includes('n8n') || text.includes('tally') || text.includes('ai video')) {
    return 'Software, CRMs & AI SaaS';
  }
  if (text.includes('solar') || text.includes('inverter')) return 'Solar & Clean Energy';
  if (text.includes('tour') || text.includes('travel') || text.includes('fleet')) return 'Travel, Tours & Fleet';
  if (text.includes('ippb') || text.includes('pli') || text.includes('rpli') || text.includes('bank') || text.includes('insurance') || text.includes('savings')) {
    return 'Banking, PLI & Insurance';
  }
  if (text.includes('pharma') || text.includes('health') || text.includes('medical') || text.includes('clinic')) {
    return 'Healthcare & Wellness';
  }
  if (text.includes('emitra') || text.includes('csc') || text.includes('jeevan') || text.includes('digital') || text.includes('document') || text.includes('mystamp') || text.includes('gangajal')) {
    return 'eMitra & Digital Services';
  }
  if (text.includes('speed post') || text.includes('parcel') || text.includes('courier') || text.includes('logistics')) {
    return 'Postal & Last-Mile Logistics';
  }
  return 'Hyperlocal Retail & FMCG';
}

export function inferSourceOwnership(product: Partial<StaffProductItem>): ProductSourceType {
  if (product.sourceOwnership) return product.sourceOwnership;
  const vendor = (product.vendorName || product.vendorCategory || '').toLowerCase();
  const id = (product.id || '').toUpperCase();
  if (
    product.commercialStoreId === 'HOUSE-INDIAPOST-324009' ||
    id.startsWith('PROD-LOG-') ||
    id.startsWith('PROD-BNK-') ||
    id.startsWith('PROD-IPPB-') ||
    id.startsWith('PROD-DOC-') ||
    id.startsWith('PROD-COMM-') ||
    id.startsWith('PROD-EDU-') ||
    vendor.includes('india post') ||
    vendor.includes('official india post')
  ) {
    return 'COMPANY_HOUSE';
  }
  return 'VENDOR_PARTNER';
}

function sanitizeProductThumbnail(product: StaffProductItem): StaffProductItem {
  const uniqueSeedThumb = SEED_UNIQUE_THUMBNAILS[product.id];
  const seedEcon = SEED_EXTRA_ECONOMICS[product.id];
  const thumb = product.thumbnailUrl || '';

  const needsImageUpgrade =
    Boolean(uniqueSeedThumb) ||
    !thumb ||
    thumb.includes('unsplash.com') ||
    thumb.includes('picsum.photos') ||
    thumb.includes('placeholder.com');

  const marginAmount = product.sellingMarginAmount ?? seedEcon?.sellingMarginAmount;
  const computedWholesale =
    product.wholesalePrice ??
    (product.price > 0
      ? Math.max(0, marginAmount ? product.price - marginAmount : Math.round(product.price * 0.85))
      : 0);

  const sourceOwnership = inferSourceOwnership(product);
  const serviceCategory = inferServiceCategory(product);
  const listingStatus: ProductListingStatus =
    product.listingStatus ||
    (product.status === 'HIDDEN' ? 'Paused' : 'Active');

  return {
    ...(seedEcon || {}),
    ...product,
    thumbnailUrl: uniqueSeedThumb
      ? uniqueSeedThumb
      : needsImageUpgrade
      ? DEFAULT_VERTICAL_THUMBNAILS[product.vertical] || imgLogistics
      : thumb,
    codEligible: product.codEligible ?? seedEcon?.codEligible ?? product.productType === 'Physical Item',
    wholesalePrice: computedWholesale,
    sellingMarginAmount: marginAmount,
    sellingMarginPercent: product.sellingMarginPercent ?? seedEcon?.sellingMarginPercent,
    mrpPrice: product.mrpPrice ?? seedEcon?.mrpPrice,
    vendorName: product.vendorName || seedEcon?.vendorName || product.staffName,
    beatManagerName: product.beatManagerName || seedEcon?.beatManagerName || product.staffName,
    sourceOwnership,
    serviceCategory,
    listingStatus,
    stockQuantity: product.stockQuantity ?? (product.productType === 'Physical Item' ? 25 : 999),
    linkedOfficeName: product.linkedOfficeName || product.subOffice || 'Dadabari S.O.',
    ippbSettlementRef:
      product.ippbSettlementRef ||
      `IPPB-${product.pincode || '324009'}-${(product.beatNumber || 'B2').replace(/\s+/g, '').toUpperCase()}`,
  };
}

const DEFAULT_STOREFRONT_PRODUCTS: StaffProductItem[] = [
  {
    id: 'PROD-LOG-001',
    sku: 'XPD-COURIER-PARCEL',
    title: 'Priority Speed Post & Heavy Parcel Express',
    vertical: 'Logistics & Courier Services',
    pricingModel: 'Fixed Price',
    productType: 'Service',
    price: 150,
    mrpPrice: 180,
    commissionRate: '16% Partner Commission',
    sellingMarginAmount: 24,
    sellingMarginPercent: 16,
    codEligible: true,
    speedPostCharge: 0,
    vendorName: 'Dadabari S.O. Speed Post Hub',
    vendorCategory: 'Official India Post',
    beatManagerId: 'MASTER-ADMIN-01',
    beatManagerName: 'Ekta Meena · Division Head',
    description:
      'Doorstep pickup and insured express delivery across India through India Post network with live SMS and WhatsApp tracking.',
    features: [
      'Free Doorstep Pickup from Home or Office',
      'Priority Dispatch via Dadabari S.O.',
      'Up to ₹5,000 Transit Insurance Included',
      'WhatsApp Delivery Confirmation Slip',
    ],
    thumbnailUrl: imgLogistics,
    staffId: 'MASTER-ADMIN-01',
    staffName: 'Ekta Meena (Super Admin)',
    staffMobile: '9414170563',
    whatsappNumber: '919414170563',
    beatNumber: 'All Beats',
    subOffice: 'Dadabari S.O.',
    pincode: '324009',
    status: 'FEATURED',
    isGlobalAdminItem: true,
    assignedBeats: ['All Beats'],
    freshnessStatus: 'FRESH_ACTIVE',
    logisticsServiceType: 'Doorstep Service Pickup',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROD-LOG-006',
    sku: 'XPD-BULK-COD-B2B',
    title: 'Business Parcel & e-Commerce COD Dispatch Pack',
    vertical: 'Logistics & Courier Services',
    pricingModel: 'Commission-based',
    productType: 'Service',
    price: 95,
    mrpPrice: 120,
    commissionRate: '19% Beat Margin · COD Remittance',
    sellingMarginAmount: 18,
    sellingMarginPercent: 19,
    codEligible: true,
    speedPostCharge: 0,
    vendorName: 'Kota B2B BNPL Parcel Desk',
    vendorCategory: 'Wholesale',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
    description:
      'Dedicated bulk parcel booking for Kota coaching centers, medical stores, and local merchants with Cash-on-Delivery remittance.',
    features: [
      'Scheduled Daily Pickup from Shop/Warehouse',
      'Cash on Delivery (COD) Direct Bank Settlement',
      'Pin-to-Pin 1.65L+ Post Office Reach',
      'Dedicated Beat Postman Account Manager',
    ],
    thumbnailUrl: imgB2bCodLogistics,
    staffId: 'MASTER-ADMIN-01',
    staffName: 'Ekta Meena (Super Admin)',
    staffMobile: '9414170563',
    whatsappNumber: '919414170563',
    beatNumber: 'All Beats',
    subOffice: 'Dadabari S.O.',
    pincode: '324009',
    status: 'ACTIVE',
    isGlobalAdminItem: true,
    assignedBeats: ['All Beats'],
    freshnessStatus: 'FRESH_ACTIVE',
    logisticsServiceType: 'Speed Post COD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROD-BNK-002',
    sku: 'IPPB-SAVINGS-AADHAAR',
    title: 'IPPB Zero-Balance Digital Savings & Aadhaar ATM (AePS)',
    vertical: 'Banking & Finance',
    pricingModel: 'Free Service',
    productType: 'Service',
    price: 0,
    mrpPrice: 0,
    commissionRate: '₹50 Direct Partner Activation Incentive',
    sellingMarginAmount: 50,
    sellingMarginPercent: 100,
    codEligible: false,
    speedPostCharge: 0,
    vendorName: 'India Post Payments Bank (IPPB)',
    vendorCategory: 'Official India Post',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
    description:
      'Instant paperless account opening at your doorstep with biometric e-KYC and Aadhaar Enabled Payment System (AePS) cash withdrawal.',
    features: [
      'Zero Minimum Balance Requirement',
      'Instant RuPay Debit Card & Mobile Banking',
      'Doorstep Cash Deposit & Withdrawal',
      'Direct Benefit Transfer (DBT) Enabled',
    ],
    thumbnailUrl: imgBanking,
    staffId: 'MASTER-ADMIN-01',
    staffName: 'Ekta Meena (Super Admin)',
    staffMobile: '9414170563',
    whatsappNumber: '919414170563',
    beatNumber: 'All Beats',
    subOffice: 'Dadabari S.O.',
    pincode: '324009',
    status: 'FEATURED',
    isGlobalAdminItem: true,
    assignedBeats: ['All Beats'],
    freshnessStatus: 'FRESH_ACTIVE',
    logisticsServiceType: 'Doorstep Service Pickup',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROD-IPPB-MERCHANT-QR',
    sku: 'IPPB-QR-KHATA-KIT',
    title: 'IPPB Merchant QR Standee & Digital Khata Kit',
    vertical: 'Banking & Finance',
    pricingModel: 'Free Service',
    productType: 'Service',
    price: 0,
    mrpPrice: 0,
    commissionRate: '₹75 Merchant Onboarding Margin',
    sellingMarginAmount: 75,
    sellingMarginPercent: 100,
    codEligible: false,
    speedPostCharge: 0,
    vendorName: 'IPPB Merchant Soundbox & QR Network',
    vendorCategory: 'Services',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
    description:
      'Zero-fee UPI QR Soundbox/Standee onboarding for Dadabari S.O. commercial shops & clinics with instant IPPB settlement and Speed Post COD collection sync.',
    features: [
      'Zero MDR on UPI Payments to Bank',
      'Instant Doorstep KYC & QR Activation',
      'Linked with India Post Speed Post COD Ledger',
      'Dedicated Beat 2 & Dadabari S.O. Desk Support',
    ],
    thumbnailUrl: imgIppbMerchantQr,
    staffId: '50457421',
    staffName: 'Mahendra Kumar Meena (Postman Beat 2)',
    staffMobile: '8769706002',
    whatsappNumber: '918769706002',
    beatNumber: 'Beat 2',
    subOffice: 'Dadabari S.O.',
    pincode: '324009',
    status: 'FEATURED',
    isGlobalAdminItem: true,
    assignedBeats: ['All Beats'],
    freshnessStatus: 'FRESH_ACTIVE',
    logisticsServiceType: 'Doorstep Service Pickup',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROD-DOC-003',
    sku: 'CHILD-AADHAAR-CELC',
    title: 'Child Aadhaar Biometric Enrolment (0–5 Years) at Home',
    vertical: 'Documents & Digital Services',
    pricingModel: 'Fixed Price',
    productType: 'Service',
    price: 50,
    mrpPrice: 50,
    commissionRate: '₹15 Postman Doorstep Margin',
    sellingMarginAmount: 15,
    sellingMarginPercent: 30,
    codEligible: true,
    speedPostCharge: 0,
    vendorName: 'Dadabari CELC Mobile Aadhaar Unit',
    vendorCategory: 'Official India Post',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
    description:
      'Special Child Enrolment Lite Client (CELC) mobile kit brought directly to your residence by authorized Dadabari S.O. postal staff.',
    features: [
      'Zero Waiting Time at Aadhaar Kendra',
      'Biometric Capture for Children Under 5',
      'Instant Acknowledgement Slip with URN',
      'Linked with Parent Aadhaar Instantly',
    ],
    thumbnailUrl: imgDigitalDocs,
    staffId: '50457421',
    staffName: 'Mahendra Kumar Meena (Postman)',
    staffMobile: '8769706002',
    whatsappNumber: '918769706002',
    beatNumber: 'Beat 2',
    subOffice: 'Dadabari S.O.',
    pincode: '324009',
    status: 'ACTIVE',
    isGlobalAdminItem: false,
    assignedBeats: ['Beat 2'],
    freshnessStatus: 'FRESH_ACTIVE',
    logisticsServiceType: 'Doorstep Service Pickup',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROD-DOC-007',
    sku: 'DLC-JEEVAN-PRAMAAN',
    title: 'Doorstep Digital Life Certificate (Jeevan Pramaan) for Pensioners',
    vertical: 'Documents & Digital Services',
    pricingModel: 'Fixed Price',
    productType: 'Service',
    price: 70,
    mrpPrice: 70,
    commissionRate: '₹25 Partner Doorstep Incentive',
    sellingMarginAmount: 25,
    sellingMarginPercent: 36,
    codEligible: true,
    speedPostCharge: 0,
    vendorName: 'Jeevan Pramaan Biometric Kendra',
    vendorCategory: 'Official India Post',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
    description:
      'Senior citizens can submit annual Digital Life Certificate from home via Postman biometric fingerprint verification with instant SMS receipt.',
    features: [
      'No Queue or Bank Branch Visit Needed',
      'Instant Biometric & Face Auth Support',
      'Direct Submission to Pension Disbursing Bank',
      'Printed & WhatsApp Acknowledgement Receipt',
    ],
    thumbnailUrl: imgJeevanPramaan,
    staffId: 'MASTER-ADMIN-01',
    staffName: 'Ekta Meena (Super Admin)',
    staffMobile: '9414170563',
    whatsappNumber: '919414170563',
    beatNumber: 'All Beats',
    subOffice: 'Dadabari S.O.',
    pincode: '324009',
    status: 'FEATURED',
    isGlobalAdminItem: true,
    assignedBeats: ['All Beats'],
    freshnessStatus: 'FRESH_ACTIVE',
    logisticsServiceType: 'Doorstep Service Pickup',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROD-COMM-MYSTAMP',
    sku: 'POST-MYSTAMP-300',
    title: 'My Stamp Personalized Photo Postage Sheet (12 Stamps)',
    vertical: 'Documents & Digital Services',
    pricingModel: 'Fixed Price',
    productType: 'Physical Item',
    price: 300,
    mrpPrice: 350,
    commissionRate: '₹45 Philately Partner Margin (15%)',
    sellingMarginAmount: 45,
    sellingMarginPercent: 15,
    codEligible: true,
    speedPostCharge: 0,
    vendorName: 'Kota Philatelic & MyStamp Bureau',
    vendorCategory: 'Official India Post',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
    description:
      'Custom-printed valid India Post postage stamps featuring your family photo, wedding portrait, or business logo — valid for all domestic Speed Post & Registered letters.',
    features: [
      'Sheet of 12 Valid ₹5 Postage Stamps',
      'Same-Day Photo Design Approval on WhatsApp',
      'Official Dadabari S.O. Philately Print',
      'Doorstep Delivery via Speed Post COD',
    ],
    thumbnailUrl: imgMyStamp,
    staffId: '50457421',
    staffName: 'Mahendra Kumar Meena (Postman Beat 2)',
    staffMobile: '8769706002',
    whatsappNumber: '918769706002',
    beatNumber: 'Beat 2',
    subOffice: 'Dadabari S.O.',
    pincode: '324009',
    status: 'FEATURED',
    isGlobalAdminItem: true,
    assignedBeats: ['All Beats'],
    freshnessStatus: 'FRESH_ACTIVE',
    logisticsServiceType: 'Speed Post COD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROD-COMM-GANGAJAL',
    sku: 'POST-GANGAJAL-250ML',
    title: 'Sacred Sovereign Gangajal Bottle (250 ml · Gangotri Sealed)',
    vertical: 'Custom Staff / Partner Products',
    pricingModel: 'Fixed Price',
    productType: 'Physical Item',
    price: 30,
    mrpPrice: 35,
    commissionRate: '₹6 Beat Margin (20%) · Bulk Pack Eligible',
    sellingMarginAmount: 6,
    sellingMarginPercent: 20,
    codEligible: true,
    speedPostCharge: 0,
    vendorName: 'Gangotri Sovereign Retail Counter',
    vendorCategory: 'Official India Post',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
    description:
      'Pure, untouched Gangotri Gangajal sealed at source and distributed across Dadabari S.O. beats at official subsidized counter price with doorstep Speed Post delivery.',
    features: [
      '250ml Tamper-Proof Official Postal Pack',
      'Subsidized ₹30 Counter Price',
      'Bulk Pooja / Temple Orders Available',
      'Instant Doorstep Delivery via Beat Postman',
    ],
    thumbnailUrl: imgGangajal,
    staffId: '50457421',
    staffName: 'Mahendra Kumar Meena (Postman Beat 2)',
    staffMobile: '8769706002',
    whatsappNumber: '918769706002',
    beatNumber: 'Beat 2',
    subOffice: 'Dadabari S.O.',
    pincode: '324009',
    status: 'FEATURED',
    isGlobalAdminItem: true,
    assignedBeats: ['All Beats'],
    freshnessStatus: 'FRESH_ACTIVE',
    logisticsServiceType: 'Speed Post COD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROD-EDU-004',
    sku: 'LDCE-POSTAL-EXAM-PRO',
    title: 'Postal LDCE / Inspector / PA Exam Masterclass & Test Series',
    vertical: 'Course & Skill Academy',
    pricingModel: 'Subscription',
    productType: 'Digital Download',
    price: 999,
    mrpPrice: 1499,
    commissionRate: '20% Referral Margin (₹200/Enrolment)',
    sellingMarginAmount: 200,
    sellingMarginPercent: 20,
    codEligible: false,
    speedPostCharge: 0,
    vendorName: 'India Post Departmental Exam Academy',
    vendorCategory: 'Services',
    beatManagerId: 'MASTER-ADMIN-01',
    beatManagerName: 'Ekta Meena · Division Head',
    description:
      'Comprehensive preparation portal with previous years question papers, mock tests, postal manual vol rules, and video tutorials.',
    features: [
      '10,000+ Practice MCQs with Explanations',
      'All India Postal Manual Vol II & VII Notes',
      'Weekly Live Doubt Clearing Sessions',
      'Detailed Performance Analytics Dashboard',
    ],
    thumbnailUrl: imgAcademy,
    staffId: 'MASTER-ADMIN-01',
    staffName: 'Ekta Meena (Super Admin)',
    staffMobile: '9414170563',
    whatsappNumber: '919414170563',
    beatNumber: 'All Beats',
    subOffice: 'Dadabari S.O.',
    pincode: '324009',
    status: 'FEATURED',
    isGlobalAdminItem: true,
    assignedBeats: ['All Beats'],
    freshnessStatus: 'FRESH_ACTIVE',
    logisticsServiceType: 'India Post Speed Post',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROD-CUST-005',
    sku: 'LOCAL-HANDICRAFT-KOTA',
    title: 'Authentic Kota Doria Handloom & Traditional Artifacts',
    vertical: 'Custom Staff / Partner Products',
    pricingModel: 'Fixed Price',
    productType: 'Physical Item',
    price: 1499,
    mrpPrice: 1850,
    commissionRate: '₹240 Beat Partner Margin (16%)',
    sellingMarginAmount: 240,
    sellingMarginPercent: 16,
    codEligible: true,
    speedPostCharge: 40,
    vendorName: 'Hadoti Weavers & Handloom Co-op',
    vendorCategory: 'Retail',
    beatManagerId: '10310736',
    beatManagerName: 'Mohit Arvind · Beat 5',
    description:
      'Handcrafted authentic Kota Doria sarees and traditional brass artifacts sourced directly from weavers in Kota and surrounding artisan clusters.',
    features: [
      '100% Handloom Certified Quality',
      'Direct Sourcing from Local Weavers',
      'Gift Packaging & Express Postal Shipping',
      'Customized Color & Design Options',
    ],
    thumbnailUrl: imgHandloom,
    staffId: '10310736',
    staffName: 'Mohit Arvind (Postman)',
    staffMobile: '9214056789',
    whatsappNumber: '919214056789',
    beatNumber: 'Beat 5',
    subOffice: 'Dadabari S.O.',
    pincode: '324009',
    status: 'ACTIVE',
    isGlobalAdminItem: false,
    assignedBeats: ['Beat 5'],
    freshnessStatus: 'FRESH_ACTIVE',
    logisticsServiceType: 'Speed Post COD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROD-B2B-KIRANA-01',
    sku: 'B2B-KOTA-SPICES-580',
    title: 'Dadabari Heritage Masala & Organic Pulses Family Crate',
    vertical: 'Custom Staff / Partner Products',
    pricingModel: 'Fixed Price',
    productType: 'Physical Item',
    price: 580,
    mrpPrice: 720,
    commissionRate: '₹98 Direct Beat Profit (17%)',
    sellingMarginAmount: 98,
    sellingMarginPercent: 17,
    codEligible: true,
    speedPostCharge: 0,
    vendorName: 'Agrawal Heritage Masala & Ration Hub',
    vendorCategory: 'Wholesale',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
    description:
      'Stone-ground Hadoti spices, cold-pressed mustard oil, and organic dal bundle packed hygienically by verified Keshavpura Sector 7 merchants with same-day Speed Post COD delivery.',
    features: [
      'Direct Wholesale Margin for Beat Partners',
      'Same-Day Speed Post COD Doorstep Fulfillment',
      '4-Factor Verified Dadabari Wholesale Store',
      'IPPB QR Instant Settlement on Delivery',
    ],
    thumbnailUrl: imgB2bKirana,
    staffId: '50457421',
    staffName: 'Mahendra Kumar Meena (Postman Beat 2)',
    staffMobile: '8769706002',
    whatsappNumber: '918769706002',
    beatNumber: 'Beat 2',
    subOffice: 'Dadabari S.O.',
    pincode: '324009',
    status: 'FEATURED',
    isGlobalAdminItem: true,
    assignedBeats: ['All Beats'],
    freshnessStatus: 'FRESH_ACTIVE',
    logisticsServiceType: 'Speed Post COD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROD-B2B-PHARMA-02',
    sku: 'B2B-WELLNESS-KIT-420',
    title: 'Swasthya Ayurveda Immunity & Family Wellness Express Box',
    vertical: 'Custom Staff / Partner Products',
    pricingModel: 'Fixed Price',
    productType: 'Physical Item',
    price: 420,
    mrpPrice: 540,
    commissionRate: '₹76 Beat Margin (18%) · Seal-Packed',
    sellingMarginAmount: 76,
    sellingMarginPercent: 18,
    codEligible: true,
    speedPostCharge: 0,
    vendorName: 'Keshavpura Swasthya Ayurveda & Care',
    vendorCategory: 'Retail',
    beatManagerId: '50457421',
    beatManagerName: 'Mahendra Kumar Meena · Beat 2',
    description:
      'Tamper-evident wellness & herbal immunity combo sourced from verified Dadabari pharmacies for senior citizens and families with priority Beat delivery.',
    features: [
      'Sterile Sealed Parcel Delivery Pouch',
      'Verified Local Apothecary Inventory',
      'No Extra Convenience Charge on COD',
      '18% Partner Entrepreneurship Margin',
    ],
    thumbnailUrl: imgB2bPharma,
    staffId: '50457421',
    staffName: 'Mahendra Kumar Meena (Postman Beat 2)',
    staffMobile: '8769706002',
    whatsappNumber: '918769706002',
    beatNumber: 'Beat 2',
    subOffice: 'Dadabari S.O.',
    pincode: '324009',
    status: 'ACTIVE',
    isGlobalAdminItem: true,
    assignedBeats: ['All Beats'],
    freshnessStatus: 'FRESH_ACTIVE',
    logisticsServiceType: 'Speed Post COD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROD-B2B-COACHING-03',
    sku: 'B2B-KOTA-STUDY-650',
    title: 'Kota Academic Hostel Study Module & Mock Test Dispatch Pack',
    vertical: 'Custom Staff / Partner Products',
    pricingModel: 'Fixed Price',
    productType: 'Physical Item',
    price: 650,
    mrpPrice: 899,
    commissionRate: '₹130 B2B Partner Profit (20%)',
    sellingMarginAmount: 130,
    sellingMarginPercent: 20,
    codEligible: true,
    speedPostCharge: 35,
    vendorName: 'Kota Scholar Books & Parcel Depot',
    vendorCategory: 'Wholesale',
    beatManagerId: '10310736',
    beatManagerName: 'Mohit Arvind · Beat 5',
    description:
      'Spiral study binders, formula handbooks, and bundled parcel dispatch kit for Kota coaching students & hostels delivered nationwide via India Post Book Packet & Speed Post.',
    features: [
      'Pan-India Hostel & Home Speed Post Shipping',
      'Direct Merchant Wholesale Pricing',
      '20% Partner Commission on Every Pack',
      'Trackable Speed Post Barcode Included',
    ],
    thumbnailUrl: imgB2bCoaching,
    staffId: '10310736',
    staffName: 'Mohit Arvind (Beat 5 Manager)',
    staffMobile: '9214056789',
    whatsappNumber: '919214056789',
    beatNumber: 'Beat 5',
    subOffice: 'Dadabari S.O.',
    pincode: '324009',
    status: 'ACTIVE',
    isGlobalAdminItem: true,
    assignedBeats: ['All Beats'],
    freshnessStatus: 'FRESH_ACTIVE',
    logisticsServiceType: 'Speed Post COD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function notifyStorefrontListeners() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('xpokart-storefront-updated'));
  }
}

export const staffProductService = {
  getAllProducts(): StaffProductItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STOREFRONT_PRODUCTS));
        return DEFAULT_STOREFRONT_PRODUCTS;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return DEFAULT_STOREFRONT_PRODUCTS;
      const sanitized = parsed
        .filter(
          (p: StaffProductItem) =>
            !String(p.id || '').startsWith('PROD-BRAND-') &&
            !String(p.id || '').startsWith('PROD-XPEEDO-') &&
            !String(p.id || '').startsWith('PROD-LOCAL-')
        )
        .map(sanitizeProductThumbnail);
      const existingIds = new Set(sanitized.map((p) => p.id));
      const missingSeeds = DEFAULT_STOREFRONT_PRODUCTS.filter((seed) => !existingIds.has(seed.id));
      const finalList = missingSeeds.length > 0 ? [...sanitized, ...missingSeeds] : sanitized;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalList));
      return finalList;
    } catch {
      return DEFAULT_STOREFRONT_PRODUCTS;
    }
  },

  getScopedProducts(user?: StaffProfile | null): StaffProductItem[] {
    if (!user) return [];
    if (
      !featureVisibilityService.isFeatureVisible(user, 'vendorSection') &&
      !featureVisibilityService.isFeatureVisible(user, 'storefront')
    ) {
      return [];
    }
    const all = this.getAllProducts();
    const strictVendor = featureVisibilityService.isStrictlyScopedToVendor(user);
    if (strictVendor === 'INDIA_POST') {
      return all.filter((p) => (p.vendorCategory || '').toLowerCase().includes('india post'));
    }
    return all;
  },

  saveAllProducts(products: StaffProductItem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    notifyStorefrontListeners();
  },

  getAllStaffSalesRights(): StaffSalesRights[] {
    try {
      const raw = localStorage.getItem(RIGHTS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  getStaffSalesRights(staffId: string, staffName = 'Staff Partner', assignedBeat = 'Beat 1'): StaffSalesRights {
    const all = this.getAllStaffSalesRights();
    const found = all.find((r) => r.staffId === staffId);
    if (found) return found;
    return {
      staffId,
      staffName,
      assignedBeat,
      allowedVerticals: [...ALL_PRODUCT_VERTICALS],
      allowedBeats: [assignedBeat],
      hiddenGlobalProductIds: [],
      canCreateCustomProducts: true,
      updatedAt: new Date().toISOString(),
    };
  },

  updateStaffSalesRights(rights: StaffSalesRights): void {
    const all = this.getAllStaffSalesRights();
    const idx = all.findIndex((r) => r.staffId === rights.staffId);
    const updated: StaffSalesRights = {
      ...rights,
      updatedAt: new Date().toISOString(),
    };
    if (idx !== -1) {
      all[idx] = updated;
    } else {
      all.push(updated);
    }
    localStorage.setItem(RIGHTS_STORAGE_KEY, JSON.stringify(all));
    notifyStorefrontListeners();
  },

  toggleGlobalProductVisibilityForStaff(staffId: string, productId: string, staffName?: string, assignedBeat?: string): boolean {
    const rights = this.getStaffSalesRights(staffId, staffName, assignedBeat);
    const isCurrentlyHidden = rights.hiddenGlobalProductIds.includes(productId);
    const nextHidden = isCurrentlyHidden
      ? rights.hiddenGlobalProductIds.filter((id) => id !== productId)
      : [...rights.hiddenGlobalProductIds, productId];
    this.updateStaffSalesRights({
      ...rights,
      hiddenGlobalProductIds: nextHidden,
    });
    return !isCurrentlyHidden;
  },

  isProductAssignedToBeat(product: StaffProductItem, staffBeat?: string): boolean {
    if (!product.assignedBeats || product.assignedBeats.length === 0 || product.assignedBeats.includes('All Beats')) {
      return true;
    }
    if (!staffBeat || staffBeat === 'All Beats') return true;
    return product.assignedBeats.includes(staffBeat);
  },

  getProductsForStaffStudio(staffId: string, staffBeat: string, isSuperAdmin: boolean): StaffProductItem[] {
    const all = this.getAllProducts();
    if (isSuperAdmin) return all;
    const rights = this.getStaffSalesRights(staffId, '', staffBeat);
    return all.filter((p) => {
      if (p.staffId === staffId || p.beatManagerId === staffId) return true;
      if (p.isGlobalAdminItem) {
        const verticalAllowed = rights.allowedVerticals.includes(p.vertical);
        const beatAllowed = this.isProductAssignedToBeat(p, staffBeat);
        return verticalAllowed && beatAllowed;
      }
      return false;
    });
  },

  computeProductMarginScore(product: StaffProductItem): {
    hasActiveMargin: boolean;
    marginPercent: number;
    marginAmount: number;
  } {
    const wholesale =
      product.wholesalePrice !== undefined
        ? Math.max(0, Number(product.wholesalePrice))
        : product.price > 0
        ? Math.round(product.price * 0.85)
        : 0;
    const derivedAmount = product.price > 0 ? Math.max(0, product.price - wholesale) : 0;
    const marginAmount = Math.max(Number(product.sellingMarginAmount || 0), derivedAmount);
    const marginPercent = Math.max(
      Number(product.sellingMarginPercent || 0),
      product.price > 0 && marginAmount > 0 ? Math.round((marginAmount / product.price) * 100) : 0
    );
    const hasRateText = Boolean(product.commissionRate && product.commissionRate.trim().length > 0);
    const hasActiveMargin = marginPercent > 0 || marginAmount > 0 || hasRateText;
    return { hasActiveMargin, marginPercent, marginAmount };
  },

  sortProductsByCommissionMargin(items: StaffProductItem[]): StaffProductItem[] {
    return [...items].sort((a, b) => {
      const mA = this.computeProductMarginScore(a);
      const mB = this.computeProductMarginScore(b);
      if (mA.hasActiveMargin !== mB.hasActiveMargin) {
        return mA.hasActiveMargin ? -1 : 1;
      }
      if (mB.marginPercent !== mA.marginPercent) {
        return mB.marginPercent - mA.marginPercent;
      }
      if (mB.marginAmount !== mA.marginAmount) {
        return mB.marginAmount - mA.marginAmount;
      }
      if (a.status === 'FEATURED' && b.status !== 'FEATURED') return -1;
      if (b.status === 'FEATURED' && a.status !== 'FEATURED') return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  },

  getVendorCommissionSummary(store: CommercialStoreRecord): {
    hasActiveMargin: boolean;
    topMarginPercent: number;
    topMarginAmount: number;
    productCount: number;
    categories: string[];
  } {
    const inventory = this.getProductsForVendorStore(store);
    let topMarginPercent = 0;
    let topMarginAmount = 0;
    let hasActiveMargin = false;
    const cats = new Set<string>();
    for (const item of inventory) {
      cats.add(item.vertical);
      const score = this.computeProductMarginScore(item);
      if (score.hasActiveMargin) hasActiveMargin = true;
      if (score.marginPercent > topMarginPercent) topMarginPercent = score.marginPercent;
      if (score.marginAmount > topMarginAmount) topMarginAmount = score.marginAmount;
    }
    return {
      hasActiveMargin,
      topMarginPercent,
      topMarginAmount,
      productCount: inventory.length,
      categories: Array.from(cats),
    };
  },

  sortVendorStoresByMarginPriority<T extends CommercialStoreRecord>(stores: T[]): T[] {
    return [...stores].sort((a, b) => {
      // 1. Enabled vs disabled storefront
      const enabledA = a.isStorefrontEnabled !== false;
      const enabledB = b.isStorefrontEnabled !== false;
      if (enabledA !== enabledB) return enabledA ? -1 : 1;

      // 2. Sponsored Partner / Active Affiliate priority
      const tierScore = (t?: string) => (t === 'SPONSORED_PARTNER' ? 3 : t === 'ACTIVE_AFFILIATE' ? 2 : 1);
      const scoreA = tierScore(a.listingTier) + (a.marketingBudgetMonthly ? 1 : 0);
      const scoreB = tierScore(b.listingTier) + (b.marketingBudgetMonthly ? 1 : 0);
      if (scoreA !== scoreB) return scoreB - scoreA;

      const freshA = a.freshnessStatus !== 'STALE_EXCLUDED';
      const freshB = b.freshnessStatus !== 'STALE_EXCLUDED';
      if (freshA !== freshB) return freshA ? -1 : 1;

      const sumA = this.getVendorCommissionSummary(a);
      const sumB = this.getVendorCommissionSummary(b);
      if (sumA.hasActiveMargin !== sumB.hasActiveMargin) {
        return sumA.hasActiveMargin ? -1 : 1;
      }
      if (sumB.topMarginPercent !== sumA.topMarginPercent) {
        return sumB.topMarginPercent - sumA.topMarginPercent;
      }
      return (b.fourFactorVerification?.score || 0) - (a.fourFactorVerification?.score || 0);
    });
  },

  checkProductServiceability(
    product: StaffProductItem,
    targetPincode = '324009',
    targetBeat?: string
  ): StoreServiceabilityResult {
    const cleanPin = String(targetPincode || '324009').trim();
    const allStores = commercialPropertyService.getAllStores();
    const linkedStore = allStores.find(
      (s) =>
        (product.commercialStoreId && s.id === product.commercialStoreId) ||
        (product.vendorName && s.storeName.trim().toLowerCase() === product.vendorName.trim().toLowerCase())
    );
    if (linkedStore) {
      return commercialPropertyService.checkStoreServiceability(linkedStore, cleanPin, targetBeat);
    }

    const serviceablePincodes =
      product.serviceablePincodes && product.serviceablePincodes.length > 0
        ? product.serviceablePincodes
        : product.isGlobalAdminItem && !product.commercialStoreId && !product.brandName
        ? ['324009', '324005', '324007', '324001', '324008']
        : [product.pincode || '324009'];
    const serviceableBeats =
      product.serviceableBeats && product.serviceableBeats.length > 0
        ? product.serviceableBeats
        : product.assignedBeats && product.assignedBeats.length > 0
        ? product.assignedBeats
        : ['All Beats'];
    const matchedPincode = !cleanPin || cleanPin === 'ALL' || serviceablePincodes.includes(cleanPin);
    const cleanBeat = targetBeat && targetBeat !== 'ALL' ? targetBeat.trim() : '';
    const matchedBeat =
      !cleanBeat ||
      serviceableBeats.includes('All Beats') ||
      serviceableBeats.some((b) => b.toLowerCase() === cleanBeat.toLowerCase());
    const operationalActive = product.freshnessStatus !== 'STALE_EXCLUDED' && product.status !== 'HIDDEN';
    const isServiceable = operationalActive && matchedPincode && matchedBeat;
    const reason = !operationalActive
      ? 'Inactive / Hidden SKU'
      : !matchedPincode
      ? `Out of Delivery Zone · Serves PIN ${serviceablePincodes.join(', ')}`
      : !matchedBeat
      ? `Out of Beat Zone · Serves ${serviceableBeats.join(', ')}`
      : `Deliverable in PIN ${cleanPin}`;
    return {
      isServiceable,
      reason,
      matchedPincode,
      matchedBeat,
      operationalActive,
      serviceablePincodes,
      serviceableBeats,
      deliveryRadiusKm: product.deliveryRadiusKm ?? 5,
    };
  },

  getPublicCatalog(partnerStaffId?: string): StaffProductItem[] {
    const all = this.getAllProducts();
    const rights = partnerStaffId ? this.getStaffSalesRights(partnerStaffId) : null;

    const visible = all.filter((p) => {
      if (p.status === 'HIDDEN') return false;
      if (p.freshnessStatus === 'STALE_EXCLUDED') return false;
      if (partnerStaffId) {
        const isOwn = p.staffId === partnerStaffId || p.beatManagerId === partnerStaffId;
        const isGlobalAndAllowed =
          Boolean(p.isGlobalAdminItem) &&
          !rights?.hiddenGlobalProductIds.includes(p.id) &&
          Boolean(rights?.allowedVerticals.includes(p.vertical)) &&
          this.isProductAssignedToBeat(p, rights?.assignedBeat);
        return isOwn || isGlobalAndAllowed;
      }
      return true;
    });

    return this.sortProductsByCommissionMargin(visible);
  },

  addProduct(product: Omit<StaffProductItem, 'id' | 'createdAt' | 'updatedAt'>): StaffProductItem {
    const all = this.getAllProducts();
    const newProduct: StaffProductItem = sanitizeProductThumbnail({
      ...product,
      freshnessStatus: product.freshnessStatus || 'FRESH_ACTIVE',
      id: `PROD-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as StaffProductItem);
    all.unshift(newProduct);
    this.saveAllProducts(all);
    return newProduct;
  },

  /**
   * Registers a Local B2B Vendor + Product together, auto-assigning it to the designated
   * Beat Manager for that Beat/PIN and publishing directly to the unified Storefront.
   */
  registerB2BVendorListing(input: {
    storeName: string;
    ownerName: string;
    phone: string;
    vendorCategory: CommercialStoreCategory;
    colony: string;
    beatNo: string;
    pincode?: string;
    productTitle: string;
    vertical?: StaffProductVertical;
    price: number;
    wholesalePrice?: number;
    mrpPrice?: number;
    sellingMarginPercent: number;
    codEligible?: boolean;
    description?: string;
    thumbnailUrl?: string;
    ippbSettlementRef?: string;
    storeType?: StoreEntityType;
    brandName?: string;
    brandLogoUrl?: string;
    brandMonogram?: string;
    brandAccentColor?: string;
    brandCategoryTag?: string;
    serviceablePincodes?: string[];
    serviceableBeats?: string[];
    deliveryRadiusKm?: number;
    dispatchCutoffTime?: string;
  }): { product: StaffProductItem; storeId: string; beatManagerName: string } {
    const primaryPin = input.pincode || input.serviceablePincodes?.[0] || '324009';
    const { store, beatMeta } = commercialPropertyService.registerB2BVendorStore({
      storeName: input.storeName,
      ownerName: input.ownerName,
      phone: input.phone,
      category: input.vendorCategory,
      colony: input.colony,
      pincode: primaryPin,
      beatNo: input.beatNo,
      storeType: input.storeType,
      brandName: input.brandName,
      brandLogoUrl: input.brandLogoUrl || input.thumbnailUrl,
      brandMonogram: input.brandMonogram,
      brandAccentColor: input.brandAccentColor,
      brandCategoryTag: input.brandCategoryTag,
      serviceablePincodes: input.serviceablePincodes,
      serviceableBeats: input.serviceableBeats,
      deliveryRadiusKm: input.deliveryRadiusKm,
      dispatchCutoffTime: input.dispatchCutoffTime,
    });

    const vertical: StaffProductVertical =
      input.vertical ||
      (input.vendorCategory === 'eMitra/CSC'
        ? 'Documents & Digital Services'
        : input.vendorCategory === 'Services'
        ? 'Logistics & Courier Services'
        : 'Custom Staff / Partner Products');

    const safePrice = Math.max(0, Number(input.price) || 0);
    const marginPct = Math.max(0, Math.min(60, Number(input.sellingMarginPercent) || 15));
    const safeWholesale =
      input.wholesalePrice !== undefined
        ? Math.max(0, Math.min(safePrice, Number(input.wholesalePrice)))
        : Math.max(0, safePrice - Math.round((safePrice * marginPct) / 100));
    const marginAmount = Math.max(0, safePrice - safeWholesale);
    const computedMarginPct = safePrice > 0 ? Math.round((marginAmount / safePrice) * 100) : marginPct;
    const waDigits = (input.phone || beatMeta.staffContact).replace(/\D/g, '').slice(-10);
    const settleRef =
      input.ippbSettlementRef || `IPPB-${store.pincode || '324009'}-B${beatMeta.cleanBeatNo}-${store.id.slice(-4).toUpperCase()}`;
    const pins = store.serviceablePincodes || [primaryPin];
    const beats = store.serviceableBeats || ['All Beats', beatMeta.beatNo];

    const product = this.addProduct({
      sku: `${input.storeType === 'BRAND_FRANCHISE' ? 'BND' : 'VND'}-${beatMeta.cleanBeatNo}-${Math.floor(100 + Math.random() * 899)}`,
      title: input.productTitle.trim(),
      vertical,
      pricingModel: safePrice === 0 ? 'Free Service' : 'Fixed Price',
      productType: input.vendorCategory === 'eMitra/CSC' || input.vendorCategory === 'Services' ? 'Service' : 'Physical Item',
      price: safePrice,
      wholesalePrice: safeWholesale,
      mrpPrice: input.mrpPrice || (safePrice > 0 ? Math.round(safePrice * 1.15) : 0),
      commissionRate: `₹${marginAmount} Partner Margin (${computedMarginPct}%)`,
      sellingMarginAmount: marginAmount,
      sellingMarginPercent: computedMarginPct,
      codEligible: input.codEligible ?? true,
      speedPostCharge: 0,
      vendorName: store.storeName,
      vendorCategory: input.vendorCategory,
      storeType: store.storeType,
      brandName: store.brandName,
      brandLogoUrl: store.brandLogoUrl,
      brandCategoryTag: store.brandCategoryTag,
      serviceablePincodes: pins,
      serviceableBeats: beats,
      deliveryRadiusKm: store.deliveryRadiusKm,
      beatManagerId: beatMeta.staffId,
      beatManagerName: `${beatMeta.staffName} · ${beatMeta.beatNo}`,
      description:
        input.description?.trim() ||
        `Direct ${store.storeType === 'BRAND_FRANCHISE' ? 'Brand Franchise' : 'B2B'} listing from ${store.storeName} (${store.colony}, PIN ${pins.join(', ')}) managed by Beat Manager ${beatMeta.staffName}.`,
      features: [
        `Serviceable PINs: ${pins.join(', ')}`,
        `Mapped Beat Manager: ${beatMeta.staffName} (${beatMeta.beatNo})`,
        input.codEligible !== false ? 'Speed Post COD & IPPB QR Supported' : 'Doorstep Fulfillment Included',
      ],
      thumbnailUrl: input.thumbnailUrl || store.brandLogoUrl || DEFAULT_VERTICAL_THUMBNAILS[vertical],
      staffId: beatMeta.staffId,
      staffName: `${beatMeta.staffName} (${beatMeta.beatNo})`,
      staffMobile: beatMeta.staffContact,
      whatsappNumber: `91${waDigits || '8769706002'}`,
      beatNumber: beatMeta.beatNo,
      subOffice: beatMeta.subOffice,
      pincode: store.pincode,
      status: input.storeType === 'BRAND_FRANCHISE' ? 'FEATURED' : 'ACTIVE',
      isGlobalAdminItem: true,
      assignedBeats: beats,
      freshnessStatus: 'FRESH_ACTIVE',
      lastCheckedDate: new Date().toISOString(),
      commercialStoreId: store.id,
      ippbSettlementRef: settleRef,
      logisticsServiceType: input.codEligible !== false ? 'Speed Post COD' : 'Doorstep Service Pickup',
    });

    return {
      product,
      storeId: store.id,
      beatManagerName: `${beatMeta.staffName} (${beatMeta.beatNo})`,
    };
  },

  getProductsForVendorStore(store: CommercialStoreRecord): StaffProductItem[] {
    const all = this.getAllProducts();
    const matched = all.filter(
      (p) =>
        p.commercialStoreId === store.id ||
        (p.vendorName && p.vendorName.trim().toLowerCase() === store.storeName.trim().toLowerCase())
    );
    if (matched.length > 0) return matched;

    const beatMeta = commercialPropertyService.getBeatMeta(store.beatNo || 'Beat 2');
    const waDigits = (store.whatsappNumber || store.primaryPhone || beatMeta.staffContact).replace(/\D/g, '').slice(-10);
    const retailPrice = store.category === 'Wholesale' ? 680 : store.category === 'eMitra/CSC' ? 120 : 499;
    const wholesalePrice = Math.round(retailPrice * 0.84);
    const marginAmt = retailPrice - wholesalePrice;
    const vertical: StaffProductVertical =
      store.category === 'eMitra/CSC'
        ? 'Documents & Digital Services'
        : store.category === 'Services'
        ? 'Logistics & Courier Services'
        : 'Custom Staff / Partner Products';

    return [
      sanitizeProductThumbnail({
        id: `SYNTH-${store.id}`,
        sku: `B2B-${beatMeta.cleanBeatNo}-${store.id.slice(-4).toUpperCase()}`,
        title: `${store.storeName} · ${store.category} Standard Trade Pack`,
        vertical,
        pricingModel: 'Fixed Price',
        productType: store.category === 'eMitra/CSC' || store.category === 'Services' ? 'Service' : 'Physical Item',
        price: retailPrice,
        wholesalePrice,
        mrpPrice: Math.round(retailPrice * 1.15),
        commissionRate: `₹${marginAmt} Partner Margin (16%)`,
        sellingMarginAmount: marginAmt,
        sellingMarginPercent: 16,
        codEligible: true,
        speedPostCharge: 0,
        vendorName: store.storeName,
        vendorCategory: store.category,
        beatManagerId: beatMeta.staffId,
        beatManagerName: `${beatMeta.staffName} · ${beatMeta.beatNo}`,
        description: `Direct Beat-mapped ${store.category} inventory from ${store.storeName} (${store.fullAddress || store.colony}, PIN ${store.pincode || '324009'}).`,
        features: [
          `Verified Merchant: ${store.storeName}`,
          `Beat Delivery by ${beatMeta.staffName} (${beatMeta.beatNo})`,
          'Speed Post COD & IPPB Merchant Settlement Active',
        ],
        thumbnailUrl: DEFAULT_VERTICAL_THUMBNAILS[vertical],
        staffId: beatMeta.staffId,
        staffName: `${beatMeta.staffName} (${beatMeta.beatNo})`,
        staffMobile: beatMeta.staffContact,
        whatsappNumber: `91${waDigits || '8769706002'}`,
        beatNumber: beatMeta.beatNo,
        subOffice: beatMeta.subOffice,
        pincode: store.pincode || '324009',
        status: 'ACTIVE',
        isGlobalAdminItem: true,
        assignedBeats: [beatMeta.beatNo],
        freshnessStatus: store.freshnessStatus || 'FRESH_ACTIVE',
        commercialStoreId: store.id,
        ippbSettlementRef: store.ippbSettlementRef || `IPPB-${store.pincode || '324009'}-B${beatMeta.cleanBeatNo}-${store.id.slice(-4).toUpperCase()}`,
        logisticsServiceType: 'Speed Post COD',
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      }),
    ];
  },

  /**
   * Unified self (India Post Hub) + Bulk Customer Partner Product Registration & Management.
   */
  registerUnifiedProductListing(input: {
    sourceOwnership: ProductSourceType;
    serviceCategory: BusinessServiceCategory | string;
    listingStatus?: ProductListingStatus;
    stockQuantity?: number;
    linkedOfficeId?: string;
    linkedOfficeName?: string;
    storeName?: string;
    ownerName?: string;
    phone?: string;
    vendorCategory?: CommercialStoreCategory;
    colony?: string;
    beatNo?: string;
    pincode?: string;
    productTitle: string;
    sku?: string;
    vertical?: StaffProductVertical;
    pricingModel?: StaffProductItem['pricingModel'];
    productType?: StaffProductItem['productType'];
    price: number;
    wholesalePrice?: number;
    mrpPrice?: number;
    sellingMarginPercent?: number;
    codEligible?: boolean;
    description?: string;
    features?: string[];
    thumbnailUrl?: string;
    commercialStoreId?: string;
    storeType?: StoreEntityType;
    brandName?: string;
    serviceablePincodes?: string[];
    serviceableBeats?: string[];
    deliveryRadiusKm?: number;
    logisticsServiceType?: StaffProductItem['logisticsServiceType'];
  }): { product: StaffProductItem; storeId: string; beatManagerName: string } {
    const isHouse = input.sourceOwnership === 'COMPANY_HOUSE';
    const beatNo = input.beatNo || 'Beat 2';
    const primaryPin = input.pincode || input.serviceablePincodes?.[0] || '324009';
    const vertical: StaffProductVertical =
      input.vertical ||
      (input.serviceCategory === 'Postal & Last-Mile Logistics'
        ? 'Logistics & Courier Services'
        : input.serviceCategory === 'Banking, PLI & Insurance'
        ? 'Banking & Finance'
        : input.serviceCategory === 'eMitra & Digital Services' || input.serviceCategory === 'Software, CRMs & AI SaaS'
        ? 'Documents & Digital Services'
        : 'Custom Staff / Partner Products');

    let storeId = input.commercialStoreId || (isHouse ? 'HOUSE-INDIAPOST-324009' : '');
    let beatManagerName = 'Mahendra Kumar Meena · Beat 2';
    let beatMeta = commercialPropertyService.getBeatMeta(beatNo);
    let resolvedStoreName = input.storeName?.trim() || (isHouse ? 'India Post Direct Bulk & Postal Hub' : 'India Post Bulk Customer');

    if (!isHouse && !storeId) {
      const reg = commercialPropertyService.registerB2BVendorStore({
        storeName: resolvedStoreName,
        ownerName: input.ownerName || 'Partner Proprietor',
        phone: input.phone || beatMeta.staffContact,
        category: input.vendorCategory || 'Retail',
        colony: input.colony || 'Dadabari',
        pincode: primaryPin,
        beatNo,
        storeType: input.storeType || 'LOCAL_MERCHANT',
        brandName: input.brandName,
        serviceablePincodes: input.serviceablePincodes || [primaryPin],
        serviceableBeats: input.serviceableBeats || ['All Beats', beatMeta.beatNo],
        deliveryRadiusKm: input.deliveryRadiusKm ?? 5,
        sourceOwnership: 'VENDOR_PARTNER',
        linkedOfficeId: input.linkedOfficeId,
        linkedOfficeName: input.linkedOfficeName || beatMeta.subOffice,
        serviceCategory: input.serviceCategory,
      });
      storeId = reg.store.id;
      resolvedStoreName = reg.store.storeName;
      beatMeta = reg.beatMeta;
      beatManagerName = `${reg.beatMeta.staffName} (${reg.beatMeta.beatNo})`;
    } else {
      beatManagerName = `${beatMeta.staffName} (${beatMeta.beatNo})`;
    }

    const safePrice = Math.max(0, Number(input.price) || 0);
    const marginPct = Math.max(0, Math.min(60, Number(input.sellingMarginPercent ?? 18)));
    const safeWholesale =
      input.wholesalePrice !== undefined
        ? Math.max(0, Math.min(safePrice, Number(input.wholesalePrice)))
        : Math.max(0, safePrice - Math.round((safePrice * marginPct) / 100));
    const marginAmount = Math.max(0, safePrice - safeWholesale);
    const computedMarginPct = safePrice > 0 ? Math.round((marginAmount / safePrice) * 100) : marginPct;
    const statusMap: Record<ProductListingStatus, StaffProductItem['status']> = {
      Active: isHouse ? 'FEATURED' : 'ACTIVE',
      Draft: 'HIDDEN',
      Paused: 'HIDDEN',
      'Out of Stock': 'ACTIVE',
    };
    const listingStatus: ProductListingStatus = input.listingStatus || 'Active';

    const product = this.addProduct({
      sku: input.sku?.trim() || `${isHouse ? 'INP-HSE' : 'INP-BLK'}-${Date.now().toString().slice(-4)}`,
      title: input.productTitle.trim(),
      vertical,
      pricingModel: input.pricingModel || (safePrice === 0 ? 'Free Service' : 'Fixed Price'),
      productType:
        input.productType ||
        (input.serviceCategory === 'Software, CRMs & AI SaaS' || input.serviceCategory === 'eMitra & Digital Services'
          ? 'Digital Download'
          : 'Physical Item'),
      price: safePrice,
      wholesalePrice: safeWholesale,
      mrpPrice: input.mrpPrice || (safePrice > 0 ? Math.round(safePrice * 1.18) : 0),
      commissionRate: `₹${marginAmount} ${isHouse ? 'India Post Hub Margin' : 'Bulk Partner Margin'} (${computedMarginPct}%)`,
      sellingMarginAmount: marginAmount,
      sellingMarginPercent: computedMarginPct,
      codEligible: input.codEligible ?? true,
      speedPostCharge: 0,
      vendorName: resolvedStoreName,
      vendorCategory: isHouse ? 'Official India Post' : input.vendorCategory || 'Retail',
      storeType: isHouse ? 'BRAND_FRANCHISE' : input.storeType || 'LOCAL_MERCHANT',
      brandName: input.brandName || (isHouse ? 'India Post' : resolvedStoreName),
      brandCategoryTag: String(input.serviceCategory),
      serviceablePincodes: input.serviceablePincodes || [primaryPin],
      serviceableBeats: input.serviceableBeats || ['All Beats', beatMeta.beatNo],
      deliveryRadiusKm: input.deliveryRadiusKm ?? 8,
      beatManagerId: beatMeta.staffId,
      beatManagerName,
      description:
        input.description?.trim() ||
        `${isHouse ? 'Company-direct' : 'Verified partner'} ${input.serviceCategory} offering linked to ${input.linkedOfficeName || beatMeta.subOffice} (PIN ${primaryPin}).`,
      features: input.features?.length
        ? input.features
        : [
            isHouse ? 'Direct Company / House Warranty & Support' : `Fulfilled by ${resolvedStoreName}`,
            `Category: ${input.serviceCategory}`,
            `Linked Hub: ${input.linkedOfficeName || beatMeta.subOffice} (${primaryPin})`,
          ],
      thumbnailUrl: input.thumbnailUrl || DEFAULT_VERTICAL_THUMBNAILS[vertical],
      staffId: beatMeta.staffId,
      staffName: beatManagerName,
      staffMobile: beatMeta.staffContact,
      whatsappNumber: `91${(input.phone || beatMeta.staffContact).replace(/\D/g, '').slice(-10) || '8769706002'}`,
      beatNumber: beatMeta.beatNo,
      subOffice: input.linkedOfficeName || beatMeta.subOffice,
      pincode: primaryPin,
      status: statusMap[listingStatus],
      isGlobalAdminItem: true,
      assignedBeats: input.serviceableBeats || ['All Beats'],
      freshnessStatus: 'FRESH_ACTIVE',
      lastCheckedDate: new Date().toISOString(),
      commercialStoreId: storeId,
      logisticsServiceType: input.logisticsServiceType || 'Speed Post COD',
      listingStatus,
      stockQuantity: Number(input.stockQuantity ?? 25),
      sourceOwnership: input.sourceOwnership,
      linkedOfficeId: input.linkedOfficeId,
      linkedOfficeName: input.linkedOfficeName || beatMeta.subOffice,
      serviceCategory: input.serviceCategory,
    });

    return { product, storeId, beatManagerName };
  },

  updateProductListing(
    id: string,
    patch: {
      title?: string;
      price?: number;
      wholesalePrice?: number;
      stockQuantity?: number;
      listingStatus?: ProductListingStatus;
      serviceCategory?: BusinessServiceCategory | string;
      sourceOwnership?: ProductSourceType;
      linkedOfficeId?: string;
      linkedOfficeName?: string;
      codEligible?: boolean;
      description?: string;
    }
  ): StaffProductItem | null {
    const all = this.getAllProducts();
    const index = all.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const prev = all[index];
    const nextPrice = patch.price !== undefined ? Math.max(0, Number(patch.price)) : prev.price;
    const nextWholesale =
      patch.wholesalePrice !== undefined
        ? Math.max(0, Math.min(nextPrice, Number(patch.wholesalePrice)))
        : prev.wholesalePrice ?? Math.round(nextPrice * 0.85);
    const marginAmount = Math.max(0, nextPrice - nextWholesale);
    const marginPercent = nextPrice > 0 ? Math.round((marginAmount / nextPrice) * 100) : 0;

    const nextListingStatus = patch.listingStatus ?? prev.listingStatus ?? 'Active';
    const nextStorefrontStatus: StaffProductItem['status'] =
      nextListingStatus === 'Paused' || nextListingStatus === 'Draft'
        ? 'HIDDEN'
        : prev.status === 'FEATURED'
        ? 'FEATURED'
        : 'ACTIVE';

    const updated = sanitizeProductThumbnail({
      ...prev,
      title: patch.title !== undefined ? patch.title.trim() || prev.title : prev.title,
      price: nextPrice,
      wholesalePrice: nextWholesale,
      sellingMarginAmount: marginAmount,
      sellingMarginPercent: marginPercent,
      commissionRate: `₹${marginAmount} Margin (${marginPercent}%)`,
      stockQuantity: patch.stockQuantity !== undefined ? Math.max(0, Number(patch.stockQuantity)) : prev.stockQuantity,
      listingStatus: nextListingStatus,
      status: nextStorefrontStatus,
      serviceCategory: patch.serviceCategory ?? prev.serviceCategory,
      sourceOwnership: patch.sourceOwnership ?? prev.sourceOwnership,
      linkedOfficeId: patch.linkedOfficeId ?? prev.linkedOfficeId,
      linkedOfficeName: patch.linkedOfficeName ?? prev.linkedOfficeName,
      subOffice: patch.linkedOfficeName || prev.subOffice,
      codEligible: patch.codEligible !== undefined ? patch.codEligible : prev.codEligible,
      description: patch.description !== undefined ? patch.description : prev.description,
      updatedAt: new Date().toISOString(),
    });

    all[index] = updated;
    this.saveAllProducts(all);
    return updated;
  },

  updateProductEconomics(
    id: string,
    patch: { wholesalePrice?: number; price?: number; codEligible?: boolean }
  ): void {
    const all = this.getAllProducts();
    const index = all.findIndex((p) => p.id === id);
    if (index === -1) return;
    const prev = all[index];
    const nextRetail = patch.price !== undefined ? Math.max(0, Number(patch.price)) : prev.price;
    const nextWholesale =
      patch.wholesalePrice !== undefined
        ? Math.max(0, Math.min(nextRetail, Number(patch.wholesalePrice)))
        : prev.wholesalePrice ?? Math.round(nextRetail * 0.85);
    const marginAmount = Math.max(0, nextRetail - nextWholesale);
    const marginPercent = nextRetail > 0 ? Math.round((marginAmount / nextRetail) * 100) : 0;

    all[index] = sanitizeProductThumbnail({
      ...prev,
      price: nextRetail,
      wholesalePrice: nextWholesale,
      sellingMarginAmount: marginAmount,
      sellingMarginPercent: marginPercent,
      commissionRate: `₹${marginAmount} Partner Margin (${marginPercent}%)`,
      codEligible: patch.codEligible !== undefined ? patch.codEligible : prev.codEligible,
      updatedAt: new Date().toISOString(),
    });
    this.saveAllProducts(all);
  },

  updateProduct(updated: StaffProductItem): void {
    const all = this.getAllProducts();
    const index = all.findIndex((p) => p.id === updated.id);
    if (index !== -1) {
      all[index] = sanitizeProductThumbnail({ ...updated, updatedAt: new Date().toISOString() });
      this.saveAllProducts(all);
    }
  },

  deleteProduct(id: string): void {
    const all = this.getAllProducts();
    const filtered = all.filter((p) => p.id !== id);
    this.saveAllProducts(filtered);
  },

  toggleStatus(id: string, newStatus: 'ACTIVE' | 'HIDDEN' | 'FEATURED'): void {
    const all = this.getAllProducts();
    const item = all.find((p) => p.id === id);
    if (item) {
      item.status = newStatus;
      item.listingStatus = newStatus === 'HIDDEN' ? 'Paused' : 'Active';
      item.updatedAt = new Date().toISOString();
      this.saveAllProducts(all);
    }
  },

  subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener('xpokart-storefront-updated', callback);
    return () => window.removeEventListener('xpokart-storefront-updated', callback);
  },
};
