import { StaffProductItem, StaffProductVertical, StaffSalesRights } from '../types/models';
import imgLogistics from '../assets/images/store_logistics_courier_1794731362561.jpg';
import imgBanking from '../assets/images/store_banking_finance_1794731363192.jpg';
import imgDigitalDocs from '../assets/images/store_digital_documents_1794731363970.jpg';
import imgAcademy from '../assets/images/store_academy_courses_1794731365263.jpg';
import imgHandloom from '../assets/images/store_kota_handloom_1794731364865.jpg';

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

function sanitizeProductThumbnail(product: StaffProductItem): StaffProductItem {
  const thumb = product.thumbnailUrl || '';
  if (!thumb || thumb.includes('unsplash.com') || thumb.includes('picsum.photos') || thumb.includes('placeholder.com')) {
    return {
      ...product,
      thumbnailUrl: DEFAULT_VERTICAL_THUMBNAILS[product.vertical] || imgLogistics,
    };
  }
  return product;
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
    commissionRate: '15% Partner Commission',
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
    commissionRate: '12% Volume Margin',
    description:
      'Dedicated bulk parcel booking for Kota coaching centers, medical stores, and local merchants with Cash-on-Delivery remittance.',
    features: [
      'Scheduled Daily Pickup from Shop/Warehouse',
      'Cash on Delivery (COD) Direct Bank Settlement',
      'Pin-to-Pin 1.65L+ Post Office Reach',
      'Dedicated Beat Postman Account Manager',
    ],
    thumbnailUrl: imgLogistics,
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
    commissionRate: '₹50 per activated account',
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
    id: 'PROD-DOC-003',
    sku: 'CHILD-AADHAAR-CELC',
    title: 'Child Aadhaar Biometric Enrolment (0–5 Years) at Home',
    vertical: 'Documents & Digital Services',
    pricingModel: 'Fixed Price',
    productType: 'Service',
    price: 50,
    commissionRate: 'Official Postal Service',
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
    commissionRate: '₹20 Delivery Partner Incentive',
    description:
      'Senior citizens can submit annual Digital Life Certificate from home via Postman biometric fingerprint verification with instant SMS receipt.',
    features: [
      'No Queue or Bank Branch Visit Needed',
      'Instant Biometric & Face Auth Support',
      'Direct Submission to Pension Disbursing Bank',
      'Printed & WhatsApp Acknowledgement Receipt',
    ],
    thumbnailUrl: imgDigitalDocs,
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
    id: 'PROD-EDU-004',
    sku: 'LDCE-POSTAL-EXAM-PRO',
    title: 'Postal LDCE / Inspector / PA Exam Masterclass & Test Series',
    vertical: 'Course & Skill Academy',
    pricingModel: 'Subscription',
    productType: 'Digital Download',
    price: 999,
    commissionRate: '20% Referral Commission',
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
    logisticsServiceType: 'Xpeedo Local Parcel',
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
    commissionRate: 'Direct Local Artisan Support',
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
    id: 'PROD-COMM-MYSTAMP',
    sku: 'POST-MYSTAMP-300',
    title: 'My Stamp Personalized Photo Postage Sheet (12 Stamps)',
    vertical: 'Documents & Digital Services',
    pricingModel: 'Fixed Price',
    productType: 'Physical Item',
    price: 300,
    commissionRate: 'Official India Post Philately Product',
    description:
      'Custom-printed valid India Post postage stamps featuring your family photo, wedding portrait, or business logo — valid for all domestic Speed Post & Registered letters.',
    features: [
      'Sheet of 12 Valid ₹5 Postage Stamps',
      'Same-Day Photo Design Approval on WhatsApp',
      'Official Dadabari S.O. Philately Print',
      'Doorstep Delivery via Speed Post COD',
    ],
    thumbnailUrl: imgDigitalDocs,
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
    commissionRate: 'Official Postal Retail Product',
    description:
      'Pure, untouched Gangotri Gangajal sealed at source and distributed across Dadabari S.O. beats at official subsidized counter price with doorstep Speed Post delivery.',
    features: [
      '250ml Tamper-Proof Official Postal Pack',
      'Subsidized ₹30 Counter Price',
      'Bulk Pooja / Temple Orders Available',
      'Instant Doorstep Delivery via Beat Postman',
    ],
    thumbnailUrl: imgHandloom,
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
    id: 'PROD-IPPB-MERCHANT-QR',
    sku: 'IPPB-QR-KHATA-KIT',
    title: 'IPPB Merchant QR Standee & Digital Khata Kit',
    vertical: 'Banking & Finance',
    pricingModel: 'Free Service',
    productType: 'Service',
    price: 0,
    commissionRate: 'Zero MDR Merchant Settlement',
    description:
      'Zero-fee UPI QR Soundbox/Standee onboarding for Dadabari S.O. commercial shops & clinics with instant IPPB settlement and Speed Post COD collection sync.',
    features: [
      'Zero MDR on UPI Payments to Bank',
      'Instant Doorstep KYC & QR Activation',
      'Linked with Xpeedo Speed Post COD Ledger',
      'Dedicated Beat 2 & Dadabari S.O. Desk Support',
    ],
    thumbnailUrl: imgBanking,
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
];

function notifyStorefrontListeners() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('xpeedo-storefront-updated'));
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
      const sanitized = parsed.map(sanitizeProductThumbnail);
      const existingIds = new Set(sanitized.map((p) => p.id));
      const missingSeeds = DEFAULT_STOREFRONT_PRODUCTS.filter((seed) => !existingIds.has(seed.id));
      if (missingSeeds.length > 0) {
        const merged = [...sanitized, ...missingSeeds];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
      return sanitized;
    } catch {
      return DEFAULT_STOREFRONT_PRODUCTS;
    }
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
      if (p.staffId === staffId) return true;
      if (p.isGlobalAdminItem) {
        const verticalAllowed = rights.allowedVerticals.includes(p.vertical);
        const beatAllowed = this.isProductAssignedToBeat(p, staffBeat);
        return verticalAllowed && beatAllowed;
      }
      return false;
    });
  },

  getPublicCatalog(partnerStaffId?: string): StaffProductItem[] {
    const all = this.getAllProducts();
    const rights = partnerStaffId ? this.getStaffSalesRights(partnerStaffId) : null;

    const visible = all.filter((p) => {
      if (p.status === 'HIDDEN') return false;
      if (p.freshnessStatus === 'STALE_EXCLUDED') return false;
      if (partnerStaffId) {
        const isOwn = p.staffId === partnerStaffId;
        const isGlobalAndAllowed =
          Boolean(p.isGlobalAdminItem) &&
          !rights?.hiddenGlobalProductIds.includes(p.id) &&
          Boolean(rights?.allowedVerticals.includes(p.vertical)) &&
          this.isProductAssignedToBeat(p, rights?.assignedBeat);
        return isOwn || isGlobalAndAllowed;
      }
      return true;
    });

    return visible.sort((a, b) => {
      if (a.status === 'FEATURED' && b.status !== 'FEATURED') return -1;
      if (b.status === 'FEATURED' && a.status !== 'FEATURED') return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
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
      item.updatedAt = new Date().toISOString();
      this.saveAllProducts(all);
    }
  },

  subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener('xpeedo-storefront-updated', callback);
    return () => window.removeEventListener('xpeedo-storefront-updated', callback);
  },
};
