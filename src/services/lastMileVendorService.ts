import { LastMileVendorRecord, StaffProfile } from '../types/models';
import { staffPermissionService } from './staffPermissionService';

const LAST_MILE_VENDORS_KEY = 'kota_os_last_mile_vendors_v1';

const DEFAULT_LAST_MILE_VENDORS: LastMileVendorRecord[] = [
  {
    id: 'VENDOR-KOTA-01',
    vendorCode: 'LMV-324001',
    vendorName: 'Dadabari Express Logistics & Hub',
    contactPerson: 'Mukesh Sharma',
    mobile: '9829012345',
    email: 'dadabari.logistics@indiapost-partner.in',
    serviceCoveragePincodes: ['324001', '324009', '324007'],
    assignedBeats: ['Beat 1', 'Beat 2', 'Beat 3'],
    serviceCategory: 'Logistics & Courier',
    status: 'Active',
    assignedTasksCount: 42,
    notes: 'Primary bulk parcel & Speed Post partner for Dadabari S.O. jurisdiction.',
    officePincode: '324009',
    officeName: 'Dadabari S.O.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    enteredBy: 'DEV-01',
  },
  {
    id: 'VENDOR-KOTA-02',
    vendorCode: 'LMV-324002',
    vendorName: 'Hadoti Bulk Dispatch & Fulfillment',
    contactPerson: 'Rajesh Meena',
    mobile: '9414056789',
    email: 'hadoti.fulfillment@indiapost-partner.in',
    serviceCoveragePincodes: ['324002', '324003', '324004'],
    assignedBeats: ['Beat 4', 'Beat 5'],
    serviceCategory: 'Bulk Delivery',
    status: 'Active',
    assignedTasksCount: 28,
    notes: 'Handles coaching institute and commercial bulk postal dispatches.',
    officePincode: '324002',
    officeName: 'Kota H.O.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    enteredBy: 'DEV-01',
  },
];

class LastMileVendorService {
  private vendors: LastMileVendorRecord[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    try {
      const raw = localStorage.getItem(LAST_MILE_VENDORS_KEY);
      if (raw) {
        this.vendors = JSON.parse(raw);
      } else {
        this.vendors = DEFAULT_LAST_MILE_VENDORS;
        this.persist();
      }
    } catch {
      this.vendors = DEFAULT_LAST_MILE_VENDORS;
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(LAST_MILE_VENDORS_KEY, JSON.stringify(this.vendors));
    } catch (e) {
      console.warn('LastMileVendorService persist error:', e);
    }
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public getVendors(viewer?: StaffProfile | null): LastMileVendorRecord[] {
    if (
      !viewer ||
      staffPermissionService.isSuperAdmin(viewer) ||
      staffPermissionService.isOwnerRole(viewer) ||
      staffPermissionService.isDeveloperRole(viewer)
    ) {
      return this.vendors;
    }
    const userPin = viewer.officePincode || (viewer as any).pincode;
    if (!userPin) return this.vendors;
    return this.vendors.filter(
      (v) => !v.officePincode || v.officePincode === userPin || v.serviceCoveragePincodes.includes(userPin)
    );
  }

  public upsertVendor(
    input: Omit<LastMileVendorRecord, 'id' | 'vendorCode' | 'createdAt' | 'updatedAt'> & {
      id?: string;
      vendorCode?: string;
    }
  ): LastMileVendorRecord {
    const now = new Date().toISOString();
    const id = input.id || `VENDOR-${Date.now().toString(36).toUpperCase()}`;
    const vendorCode = input.vendorCode || `LMV-${Math.floor(1000 + Math.random() * 8999)}`;
    const existingIdx = this.vendors.findIndex((v) => v.id === id);

    const saved: LastMileVendorRecord = {
      ...input,
      id,
      vendorCode,
      serviceCoveragePincodes: input.serviceCoveragePincodes || ['324009'],
      assignedBeats: input.assignedBeats || ['Beat 2'],
      createdAt: existingIdx >= 0 ? this.vendors[existingIdx].createdAt : now,
      updatedAt: now,
    };

    if (existingIdx >= 0) {
      this.vendors[existingIdx] = saved;
    } else {
      this.vendors.unshift(saved);
    }
    this.persist();
    return saved;
  }

  public deleteVendor(id: string): void {
    this.vendors = this.vendors.filter((v) => v.id !== id);
    this.persist();
  }

  public exportState(): LastMileVendorRecord[] {
    return this.vendors;
  }

  public restoreState(state: LastMileVendorRecord[]): void {
    if (Array.isArray(state)) {
      this.vendors = state;
      this.persist();
    }
  }
}

export const lastMileVendorService = new LastMileVendorService();
