import { safeStorage } from '../utils/safeStorage';

export interface PincodeOfficeHub {
  pincode: string;
  name: string;
  officeName: string;
  division: string;
  localStockingPartner: string;
  slaMinutes: number;
  beatsCount: number;
  beatManager: string;
  whatsappPhone: string;
  lat: number;
  lng: number;
  landmarks: string[];
  isDefault?: boolean;
}

export type InventoryCategoryKey =
  | 'top_sellers'
  | 'kirana'
  | 'dairy_qsr'
  | 'electronics'
  | 'medical_pharmacy'
  | 'sabji_mandi'
  | 'fashion_footwear';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface CategoryAvailability {
  open: boolean;
  stockStatus: StockStatus;
}

export type CategoryInventoryMap = Record<InventoryCategoryKey, CategoryAvailability>;

export type StaffRoleTier =
  | 'Management'
  | 'Delivery Executive'
  | 'Beat Postman'
  | 'Local Vendor';

export interface OnboardedStaffMember {
  id: string;
  name: string;
  roleTier: StaffRoleTier;
  category: string;
  pincode: string;
  beatNumber: string;
  contactPhone: string;
  active: boolean;
  createdAt: string;
}

export const INVENTORY_CATEGORY_META: {
  key: InventoryCategoryKey;
  label: string;
  sectionId: string;
}[] = [
  { key: 'top_sellers', label: 'Top Sellers', sectionId: 'exclusive-top-sellers' },
  { key: 'kirana', label: 'Daily Kirana & Ration', sectionId: 'daily-kirana-section' },
  { key: 'dairy_qsr', label: 'Fresh Dairy & QSR', sectionId: 'dairy-bakery-section' },
  { key: 'electronics', label: 'Electronics & Smart Tech', sectionId: 'electronics-tech-section' },
  { key: 'medical_pharmacy', label: 'Medical & Pharmacy', sectionId: 'medical-pharmacy-section' },
  { key: 'sabji_mandi', label: 'Sabji Mandi (Fresh Farm)', sectionId: 'sabji-mandi-section' },
  { key: 'fashion_footwear', label: 'Fashion & Footwear', sectionId: 'fashion-footwear-section' },
];

export const STAFF_CATEGORY_OPTIONS: string[] = [
  'Operations & Hub Command',
  'Speed Post & Parcel COD',
  'Daily Kirana & Ration',
  'Fresh Dairy & Bakery QSR',
  'Electronics & Smart Tech',
  'Medical & Pharmacy',
  'Sabji Mandi & Farm Fresh',
  'Fashion & Footwear',
  'EV Mobility & Batteries',
  'Citizen Desk (e-Mitra & IPPB)',
];

export const PINCODE_OFFICE_HUBS: PincodeOfficeHub[] = [
  {
    pincode: '324009',
    name: 'Dadabari & Basant Vihar',
    officeName: 'Dadabari Sub Post Office',
    division: 'Kota Division',
    localStockingPartner: 'Dadabari Circle Fulfillment & Grocery Depot',
    slaMinutes: 25,
    beatsCount: 12,
    beatManager: 'Mahendra Kumar Meena (Beat 2 Lead)',
    whatsappPhone: '919460020640',
    lat: 25.1612,
    lng: 75.8295,
    landmarks: ['Dadabari Circle', 'Basant Vihar', 'Modi College Road', 'Sector 1–5'],
    isDefault: true,
  },
  {
    pincode: '324001',
    name: 'Kota GPO & Nayapura',
    officeName: 'Kota Head Post Office (GPO)',
    division: 'Kota Division',
    localStockingPartner: 'Nayapura Central Partner Supply Node',
    slaMinutes: 35,
    beatsCount: 14,
    beatManager: 'Kota GPO Central Dispatch',
    whatsappPhone: '919460020640',
    lat: 25.1825,
    lng: 75.8391,
    landmarks: ['Nayapura', 'Civil Lines', 'Collectorate Circle', 'Gumanpura North'],
  },
  {
    pincode: '324002',
    name: 'Kota Junction & Bhimganjmandi',
    officeName: 'Kota Junction S.O.',
    division: 'Kota Division',
    localStockingPartner: 'Bhimganjmandi Station Provision Partner',
    slaMinutes: 35,
    beatsCount: 10,
    beatManager: 'Kota Jn Railway Beat Desk',
    whatsappPhone: '919460020640',
    lat: 25.2233,
    lng: 75.8794,
    landmarks: ['Railway Colony', 'Bhimganjmandi', 'Station Road', 'Mala Phatak'],
  },
  {
    pincode: '324003',
    name: 'Indraprastha Industrial Area',
    officeName: 'Indraprastha S.O.',
    division: 'Kota Division',
    localStockingPartner: 'Indraprastha Logistics & Utility Store Hub',
    slaMinutes: 40,
    beatsCount: 8,
    beatManager: 'Indraprastha Logistics Hub',
    whatsappPhone: '919460020640',
    lat: 25.1404,
    lng: 75.8548,
    landmarks: ['IL Colony', 'Road No. 1–7', 'RIICO Industrial Estate'],
  },
  {
    pincode: '324004',
    name: 'Udyog Puri & Ladpura',
    officeName: 'Udyog Puri S.O.',
    division: 'Kota Division',
    localStockingPartner: 'Ladpura Heritage Market Stocking Partner',
    slaMinutes: 40,
    beatsCount: 9,
    beatManager: 'Ladpura Market Beat Lead',
    whatsappPhone: '919460020640',
    lat: 25.1768,
    lng: 75.8511,
    landmarks: ['Udyog Puri', 'DCM Road', 'Kaithoonipole', 'Ladpura'],
  },
  {
    pincode: '324005',
    name: 'Vigyan Nagar & Talwandi North',
    officeName: 'Vigyan Nagar S.O.',
    division: 'Kota Division',
    localStockingPartner: 'Vigyan Nagar Smart Tech & Student Depot',
    slaMinutes: 30,
    beatsCount: 11,
    beatManager: 'Vigyan Nagar Express Desk',
    whatsappPhone: '919460020640',
    lat: 25.1526,
    lng: 75.8473,
    landmarks: ['Vigyan Nagar', 'Chhatrapura Talab', 'Sanjay Nagar', 'Aero Circle'],
  },
  {
    pincode: '324006',
    name: 'Kunhari & Thermal Colony',
    officeName: 'Thermal Colony S.O.',
    division: 'Kota Division',
    localStockingPartner: 'Kunhari Landmark Express Stocking Center',
    slaMinutes: 35,
    beatsCount: 9,
    beatManager: 'Kunhari Landmark City Beat',
    whatsappPhone: '919460020640',
    lat: 25.1959,
    lng: 75.8168,
    landmarks: ['Kunhari', 'Landmark City', 'Saket Nagar', 'Thermal Power Plant'],
  },
  {
    pincode: '324007',
    name: 'Talwandi & Jawahar Nagar',
    officeName: 'Talwandi S.O.',
    division: 'Kota Division',
    localStockingPartner: 'Talwandi City Mall Corridor Partner Hub',
    slaMinutes: 30,
    beatsCount: 10,
    beatManager: 'Talwandi Commerce Beat Lead',
    whatsappPhone: '919460020640',
    lat: 25.1469,
    lng: 75.8398,
    landmarks: ['Talwandi Circle', 'Jawahar Nagar', 'City Mall Road', 'Sector A–C'],
  },
  {
    pincode: '324008',
    name: 'Borkhera & Gumanpura East',
    officeName: 'Borkhera S.O.',
    division: 'Kota Division',
    localStockingPartner: 'Borkhera Baran Road Daily Needs Partner',
    slaMinutes: 35,
    beatsCount: 10,
    beatManager: 'Borkhera Canal Beat Desk',
    whatsappPhone: '919460020640',
    lat: 25.1872,
    lng: 75.8871,
    landmarks: ['Borkhera', 'Baran Road', 'Police Line', 'Manpura'],
  },
  {
    pincode: '324010',
    name: 'Mahaveer Nagar & Keshavpura',
    officeName: 'Mahaveer Nagar S.O.',
    division: 'Kota Division',
    localStockingPartner: 'Keshavpura Sector-7 Fresh & Ration Node',
    slaMinutes: 30,
    beatsCount: 12,
    beatManager: 'Mahaveer Nagar I–III Beat',
    whatsappPhone: '919460020640',
    lat: 25.1376,
    lng: 75.8305,
    landmarks: ['Mahaveer Nagar I–III', 'Keshavpura', 'Subhash Nagar', 'Swami Vivekananda Nagar'],
  },
  {
    pincode: '325001',
    name: 'Kaithoon Heritage & Mandana',
    officeName: 'Kaithoon S.O.',
    division: 'Kota Division',
    localStockingPartner: 'Kaithoon Weaver & Town Essentials Partner',
    slaMinutes: 45,
    beatsCount: 6,
    beatManager: 'Kaithoon Zari Weaver Desk',
    whatsappPhone: '919460020640',
    lat: 25.1257,
    lng: 75.9735,
    landmarks: ['Kaithoon Kasba', 'Kota Doria Looms', 'Arjunpura'],
  },
  {
    pincode: '325003',
    name: 'Ranpur & IIIT Kota Campus',
    officeName: 'Ranpur B.O. / IIIT Hub',
    division: 'Kota Division',
    localStockingPartner: 'Ranpur Campus & Agro Stocking Partner',
    slaMinutes: 45,
    beatsCount: 6,
    beatManager: 'Ranpur Institutional Beat',
    whatsappPhone: '919460020640',
    lat: 25.0543,
    lng: 75.8266,
    landmarks: ['IIIT Kota', 'Ranpur Agro Park', 'Jagpura', 'Jhalawar Highway'],
  },
  {
    pincode: '325205',
    name: 'Baran H.O. & Anta Highway',
    officeName: 'Baran Head Post Office',
    division: 'Baran Division',
    localStockingPartner: 'Baran Krishi Mandi & Retail Supply Hub',
    slaMinutes: 55,
    beatsCount: 11,
    beatManager: 'Baran Division Express Hub',
    whatsappPhone: '919460020640',
    lat: 25.1011,
    lng: 76.5132,
    landmarks: ['Baran Station Road', 'Hospital Chauraha', 'Anta Highway', 'Krishi Mandi'],
  },
];

const ACTIVE_PINCODE_STORAGE_KEY = 'xpokart_active_pincode_v2';
const PINCODE_CONFIRMED_STORAGE_KEY = 'xpokart_pincode_confirmed_v2';
const INVENTORY_STATE_STORAGE_KEY = 'xpokart_pincode_inventory_v2';
const STAFF_ROSTER_STORAGE_KEY = 'xpokart_onboarded_staff_v2';

function createDefaultCategoryInventory(): CategoryInventoryMap {
  return {
    top_sellers: { open: true, stockStatus: 'IN_STOCK' },
    kirana: { open: true, stockStatus: 'IN_STOCK' },
    dairy_qsr: { open: true, stockStatus: 'IN_STOCK' },
    electronics: { open: true, stockStatus: 'IN_STOCK' },
    medical_pharmacy: { open: true, stockStatus: 'IN_STOCK' },
    sabji_mandi: { open: true, stockStatus: 'IN_STOCK' },
    fashion_footwear: { open: true, stockStatus: 'IN_STOCK' },
  };
}

function createInitialInventoryStore(): Record<string, CategoryInventoryMap> {
  const initial: Record<string, CategoryInventoryMap> = {};
  for (const hub of PINCODE_OFFICE_HUBS) {
    initial[hub.pincode] = createDefaultCategoryInventory();
  }
  return initial;
}

const DEFAULT_STAFF_ROSTER: OnboardedStaffMember[] = [
  {
    id: 'stf_owner_324009',
    name: 'Mahendra Kumar Meena',
    roleTier: 'Management',
    category: 'Operations & Hub Command',
    pincode: '324009',
    beatNumber: 'Beat 2',
    contactPhone: '9460020640',
    active: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'stf_admin_324009',
    name: 'Ekta Meena',
    roleTier: 'Management',
    category: 'Operations & Hub Command',
    pincode: '324009',
    beatNumber: 'All 13 Hubs',
    contactPhone: '8279275805',
    active: true,
    createdAt: '2026-01-10T08:30:00.000Z',
  },
  {
    id: 'stf_postman_324009',
    name: 'Rajesh Sharma',
    roleTier: 'Beat Postman',
    category: 'Speed Post & Parcel COD',
    pincode: '324009',
    beatNumber: 'Beat 4',
    contactPhone: '9829000004',
    active: true,
    createdAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'stf_delivery_324005',
    name: 'Vikram Solanki',
    roleTier: 'Delivery Executive',
    category: 'Sabji Mandi & Farm Fresh',
    pincode: '324005',
    beatNumber: 'Beat 1',
    contactPhone: '9829000015',
    active: true,
    createdAt: '2026-01-18T07:15:00.000Z',
  },
  {
    id: 'stf_vendor_324009_med',
    name: 'Dadabari Care Pharmacy Desk',
    roleTier: 'Local Vendor',
    category: 'Medical & Pharmacy',
    pincode: '324009',
    beatNumber: 'Beat 2',
    contactPhone: '9829000022',
    active: true,
    createdAt: '2026-02-01T10:00:00.000Z',
  },
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getPincodeHub(pincode?: string): PincodeOfficeHub {
  return (
    PINCODE_OFFICE_HUBS.find((hub) => hub.pincode === pincode) ||
    PINCODE_OFFICE_HUBS.find((hub) => hub.isDefault) ||
    PINCODE_OFFICE_HUBS[0]
  );
}

export function findNearestHubByCoords(lat: number, lng: number): PincodeOfficeHub {
  let nearest = getPincodeHub('324009');
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const hub of PINCODE_OFFICE_HUBS) {
    const dist = haversineKm(lat, lng, hub.lat, hub.lng);
    if (dist < bestDistance) {
      bestDistance = dist;
      nearest = hub;
    }
  }
  return nearest;
}

export async function detectNearestPincodeHub(): Promise<{
  hub: PincodeOfficeHub;
  source: 'gps' | 'fallback';
}> {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return { hub: getPincodeHub('324009'), source: 'fallback' };
  }

  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => {
      resolve({ hub: getPincodeHub('324009'), source: 'fallback' });
    }, 4500);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.clearTimeout(timeoutId);
        const nearest = findNearestHubByCoords(
          position.coords.latitude,
          position.coords.longitude
        );
        pincodeOperationsService.setActivePincode(nearest.pincode);
        resolve({ hub: nearest, source: 'gps' });
      },
      () => {
        window.clearTimeout(timeoutId);
        resolve({ hub: getPincodeHub('324009'), source: 'fallback' });
      },
      { enableHighAccuracy: false, timeout: 4000, maximumAge: 180000 }
    );
  });
}

type OperationsListener = () => void;

class PincodeOperationsService {
  private listeners = new Set<OperationsListener>();

  public subscribe(listener: OperationsListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // Ignore subscriber errors
      }
    });
  }

  public isSupportedPincode(pincode?: string): boolean {
    if (!pincode) return false;
    return PINCODE_OFFICE_HUBS.some((h) => h.pincode === pincode.trim());
  }

  public hasConfirmedPincode(): boolean {
    return safeStorage.getItem(PINCODE_CONFIRMED_STORAGE_KEY) === 'true';
  }

  public getActivePincode(): string {
    const saved = safeStorage.getItem(ACTIVE_PINCODE_STORAGE_KEY);
    if (saved && PINCODE_OFFICE_HUBS.some((h) => h.pincode === saved)) {
      return saved;
    }
    return '324009';
  }

  public setActivePincode(pincode: string, confirmed = true): PincodeOfficeHub {
    const valid = getPincodeHub(pincode);
    safeStorage.setItem(ACTIVE_PINCODE_STORAGE_KEY, valid.pincode);
    if (confirmed) {
      safeStorage.setItem(PINCODE_CONFIRMED_STORAGE_KEY, 'true');
    }
    this.notify();
    return valid;
  }

  public routePincodeFromLogin(pincode?: string): PincodeOfficeHub {
    if (pincode && this.isSupportedPincode(pincode)) {
      return this.setActivePincode(pincode, true);
    }
    return getPincodeHub(this.getActivePincode());
  }

  private loadInventoryStore(): Record<string, CategoryInventoryMap> {
    const fallback = createInitialInventoryStore();
    const raw = safeStorage.getItem(INVENTORY_STATE_STORAGE_KEY);
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw) as Record<string, Partial<CategoryInventoryMap>>;
      const hydrated: Record<string, CategoryInventoryMap> = {};
      for (const hub of PINCODE_OFFICE_HUBS) {
        const defaults = createDefaultCategoryInventory();
        const savedHub = parsed[hub.pincode] || {};
        hydrated[hub.pincode] = {
          top_sellers: { ...defaults.top_sellers, ...(savedHub.top_sellers || {}) },
          kirana: { ...defaults.kirana, ...(savedHub.kirana || {}) },
          dairy_qsr: { ...defaults.dairy_qsr, ...(savedHub.dairy_qsr || {}) },
          electronics: { ...defaults.electronics, ...(savedHub.electronics || {}) },
          medical_pharmacy: { ...defaults.medical_pharmacy, ...(savedHub.medical_pharmacy || {}) },
          sabji_mandi: { ...defaults.sabji_mandi, ...(savedHub.sabji_mandi || {}) },
          fashion_footwear: { ...defaults.fashion_footwear, ...(savedHub.fashion_footwear || {}) },
        };
      }
      return hydrated;
    } catch {
      return fallback;
    }
  }

  private persistInventoryStore(store: Record<string, CategoryInventoryMap>): void {
    safeStorage.setItem(INVENTORY_STATE_STORAGE_KEY, JSON.stringify(store));
    this.notify();
  }

  public getInventoryForPincode(pincode: string): CategoryInventoryMap {
    const hub = getPincodeHub(pincode);
    const store = this.loadInventoryStore();
    return store[hub.pincode] || createDefaultCategoryInventory();
  }

  public updateCategoryInventory(
    pincodeOrAll: string,
    category: InventoryCategoryKey,
    patch: Partial<CategoryAvailability>
  ): void {
    const store = this.loadInventoryStore();
    const targets =
      pincodeOrAll === 'ALL_13_HUBS'
        ? PINCODE_OFFICE_HUBS.map((h) => h.pincode)
        : [getPincodeHub(pincodeOrAll).pincode];

    for (const pin of targets) {
      const currentMap = store[pin] || createDefaultCategoryInventory();
      store[pin] = {
        ...currentMap,
        [category]: {
          ...currentMap[category],
          ...patch,
        },
      };
    }

    this.persistInventoryStore(store);
  }

  public getStaffRoster(pincodeFilter?: string): OnboardedStaffMember[] {
    let roster: OnboardedStaffMember[] = DEFAULT_STAFF_ROSTER;
    const raw = safeStorage.getItem(STAFF_ROSTER_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          roster = parsed;
        }
      } catch {
        roster = DEFAULT_STAFF_ROSTER;
      }
    }
    if (!pincodeFilter || pincodeFilter === 'ALL') {
      return roster;
    }
    return roster.filter((member) => member.pincode === pincodeFilter);
  }

  private persistStaffRoster(roster: OnboardedStaffMember[]): void {
    safeStorage.setItem(STAFF_ROSTER_STORAGE_KEY, JSON.stringify(roster));
    this.notify();
  }

  public addStaffMember(
    input: Omit<OnboardedStaffMember, 'id' | 'createdAt'>
  ): OnboardedStaffMember {
    const roster = this.getStaffRoster();
    const created: OnboardedStaffMember = {
      ...input,
      id: `stf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.persistStaffRoster([created, ...roster]);
    return created;
  }

  public updateStaffMember(
    id: string,
    patch: Partial<Omit<OnboardedStaffMember, 'id' | 'createdAt'>>
  ): void {
    const roster = this.getStaffRoster().map((member) =>
      member.id === id ? { ...member, ...patch } : member
    );
    this.persistStaffRoster(roster);
  }

  public toggleStaffActive(id: string): void {
    const roster = this.getStaffRoster().map((member) =>
      member.id === id ? { ...member, active: !member.active } : member
    );
    this.persistStaffRoster(roster);
  }

  public removeStaffMember(id: string): void {
    const roster = this.getStaffRoster().filter((member) => member.id !== id);
    this.persistStaffRoster(roster);
  }
}

export const pincodeOperationsService = new PincodeOperationsService();
