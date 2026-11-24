import { PropertyRecord } from '../types/models';

const STORAGE_KEY = 'kota_division_os_property_registry_v1';

class PropertyRegistryService {
  private properties: PropertyRecord[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadProperties();
  }

  private loadProperties(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.properties = JSON.parse(raw);
      } else {
        this.properties = [
          {
            id: 'PROP-324009-01',
            propertyCode: 'KOTA-DAD-324009-001',
            clientId: 'CLIENT-INDIA-POST-KOTA',
            brandId: 'india-post',
            brandName: 'India Post',
            propertyType: 'Residential',
            beatOrPin: '324009',
            officeId: 'DADABARI_SO',
            addressLine: 'Plot 42, Dadabari Extension, Near CAD Circle',
            landmark: 'Near CAD Circle',
            geoOrTraceTag: '25.1742° N, 75.8335° E',
            occupancyStatus: 'Owner Occupied',
            linkedCustomerIds: ['CUST-50510312'],
            linkedLeadIds: [],
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'PROP-324001-02',
            propertyCode: 'KOTA-NAY-324001-002',
            clientId: 'CLIENT-INDIA-POST-KOTA',
            brandId: 'india-post',
            brandName: 'India Post',
            propertyType: 'Commercial',
            beatOrPin: '324001',
            officeId: 'KOTA_HO',
            addressLine: 'Shop 12, Station Road Commercial Complex',
            landmark: 'Opposite Head Post Office',
            geoOrTraceTag: '25.1800° N, 75.8400° E',
            occupancyStatus: 'Rented / Tenant',
            linkedUnitNotes: 'Ground floor retail shop with storage basement',
            linkedCustomerIds: [],
            linkedLeadIds: [],
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'PROP-324005-03',
            propertyCode: 'KOTA-VIG-324005-003',
            clientId: 'CLIENT-INDIA-POST-KOTA',
            brandId: 'india-post',
            brandName: 'India Post',
            propertyType: 'Mixed',
            beatOrPin: '324005',
            officeId: 'VIGYAN_NAGAR_SO',
            addressLine: 'Building 7, Vigyan Nagar Main Road',
            landmark: 'Near Chhapan Bhog Belt',
            geoOrTraceTag: '25.1600° N, 75.8600° E',
            occupancyStatus: 'Mixed Use',
            linkedUnitNotes: 'Ground Floor: Electronics Store. First & Second Floor: 4 Residential Apartments.',
            linkedCustomerIds: [],
            linkedLeadIds: [],
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'PROP-324008-04',
            propertyCode: 'KOTA-KUN-324008-004',
            clientId: 'CLIENT-INDIA-POST-KOTA',
            brandId: 'india-post',
            brandName: 'India Post',
            propertyType: 'Flat',
            beatOrPin: '324008',
            officeId: 'KUNHARI_SO',
            addressLine: 'Flat 304, Landmark City Towers, Kunhari',
            landmark: 'Near Coaching Hub',
            geoOrTraceTag: '25.2000° N, 75.8300° E',
            occupancyStatus: 'Rented / Tenant',
            linkedUnitNotes: '3 BHK Apartment on 3rd Floor',
            linkedCustomerIds: [],
            linkedLeadIds: [],
            updatedAt: new Date().toISOString(),
          },
        ];
        this.saveProperties(false);
      }
      // Normalize legacy properties missing brandId onto india-post
      let mutated = false;
      this.properties = this.properties.map((p) => {
        if (!p.brandId && (!p.clientId || p.clientId === 'CLIENT-INDIA-POST-KOTA')) {
          mutated = true;
          return { ...p, brandId: 'india-post', brandName: p.brandName || 'India Post' };
        }
        return p;
      });
      if (mutated) {
        this.saveProperties(false);
      }
    } catch {
      this.properties = [];
    }
  }

  private saveProperties(notify = true): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.properties));
    } catch (e) {
      console.warn('PropertyRegistryService persist failed:', e);
    }
    if (notify) {
      this.listeners.forEach((cb) => cb());
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public getAllProperties(): PropertyRecord[] {
    return [...this.properties];
  }

  public getPropertiesByClient(clientId: string): PropertyRecord[] {
    return this.properties.filter((p) => p.clientId === clientId);
  }

  public getPropertiesByBrand(
    brandIdOrSlug: string,
    agentScope?: {
      isNonTerritoryAgent?: boolean;
      memberId?: string;
      assignedCategories?: string[];
    }
  ): PropertyRecord[] {
    const cleanBrand = (brandIdOrSlug || '').trim().toLowerCase();
    const byBrand = this.properties.filter((p) => {
      const pBrand = (p.brandId || '').trim().toLowerCase();
      const pName = (p.brandName || '').trim().toLowerCase();
      if (cleanBrand === 'india-post') {
        return pBrand === 'india-post' || p.clientId === 'CLIENT-INDIA-POST-KOTA';
      }
      return pBrand === cleanBrand || pName === cleanBrand || p.clientId === brandIdOrSlug;
    });

    if (agentScope?.isNonTerritoryAgent && agentScope.memberId) {
      const mId = agentScope.memberId.trim().toLowerCase();
      const cats = (agentScope.assignedCategories || []).map((c) => c.trim().toLowerCase()).filter(Boolean);
      return byBrand.filter((p) => {
        const owns =
          (p.createdById || '').trim().toLowerCase() === mId ||
          (p.assignedToId || '').trim().toLowerCase() === mId;
        if (!owns) return false;
        if (cats.length > 0 && p.businessCategory) {
          const pCat = p.businessCategory.trim().toLowerCase();
          return cats.some((c) => pCat.includes(c) || c.includes(pCat));
        }
        return true;
      });
    }

    return byBrand;
  }

  public upsertProperty(record: Partial<PropertyRecord> & { addressLine: string }): PropertyRecord {
    const id = record.id || `PROP-${record.beatOrPin || '324009'}-${Date.now().toString().slice(-5)}`;
    const propertyCode =
      record.propertyCode || `PROP-${(record.beatOrPin || '324').slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const resolvedBrandId = record.brandId || (record.clientId === 'CLIENT-INDIA-POST-KOTA' ? 'india-post' : 'india-post');
    const resolvedBrandName =
      record.brandName || (resolvedBrandId === 'india-post' ? 'India Post' : resolvedBrandId);

    const newRecord: PropertyRecord = {
      id,
      propertyCode,
      clientId: record.clientId || (resolvedBrandId === 'india-post' ? 'CLIENT-INDIA-POST-KOTA' : `CLIENT-${resolvedBrandId.toUpperCase()}`),
      brandId: resolvedBrandId,
      brandName: resolvedBrandName,
      propertyType: record.propertyType || 'Residential',
      beatOrPin: record.beatOrPin || '324009',
      officeId: record.officeId || 'DADABARI_SO',
      addressLine: record.addressLine.trim(),
      landmark: record.landmark?.trim() || '',
      geoOrTraceTag: record.geoOrTraceTag?.trim() || '25.1700° N, 75.8300° E',
      occupancyStatus: record.occupancyStatus || 'Owner Occupied',
      linkedUnitNotes: record.linkedUnitNotes?.trim() || '',
      linkedCustomerIds: record.linkedCustomerIds || [],
      linkedLeadIds: record.linkedLeadIds || [],
      createdById: record.createdById,
      assignedToId: record.assignedToId,
      businessCategory: record.businessCategory,
      updatedAt: new Date().toISOString(),
    };

    const idx = this.properties.findIndex((p) => p.id === id);
    if (idx >= 0) {
      this.properties[idx] = { ...this.properties[idx], ...newRecord };
    } else {
      this.properties.unshift(newRecord);
    }

    this.saveProperties(true);
    return newRecord;
  }

  public deleteProperty(id: string): boolean {
    const initialLen = this.properties.length;
    this.properties = this.properties.filter((p) => p.id !== id);
    if (this.properties.length !== initialLen) {
      this.saveProperties(true);
      return true;
    }
    return false;
  }
}

export const propertyRegistryService = new PropertyRegistryService();
