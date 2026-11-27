export interface PublicShortUrlRecord {
  id: string;
  shortCode: string; // e.g. "INP-8291"
  brandId: string; // e.g. "india-post", "india-post-bulk", "PLATFORM_ADMIN"
  brandName: string;
  scope: 'CUSTOMER' | 'STAFF' | 'BOTH';
  label: string;
  status: 'Active' | 'Revoked';
  clicksCount: number;
  createdAt: string;
  createdBy: string;
}

const SHORT_URL_STORAGE_KEY = 'indiapost_public_short_urls_v2';
const LEGACY_SHORT_URL_STORAGE_KEY = 'xpeedo_public_short_urls_v1';

const DEFAULT_SHORT_URLS: PublicShortUrlRecord[] = [
  {
    id: 'SLK-INDIA-POST-01',
    shortCode: 'INPOST-01',
    brandId: 'india-post',
    brandName: 'India Post — Postal & Citizen Hub',
    scope: 'BOTH',
    label: 'India Post Official Public Portal, Services & Staff Lead Hub',
    status: 'Active',
    clicksCount: 42,
    createdAt: '2026-01-10T00:00:00.000Z',
    createdBy: 'Ekta Meena (Master Admin)',
  },
  {
    id: 'SLK-INDIA-POST-BULK-01',
    shortCode: 'INP-BULK-01',
    brandId: 'india-post-bulk',
    brandName: 'India Post — Bulk Customer & Product Promotion',
    scope: 'BOTH',
    label: 'India Post Bulk Customer Catalog, BNPL Dispatch & Inquiry Tracker',
    status: 'Active',
    clicksCount: 28,
    createdAt: '2026-01-10T00:00:00.000Z',
    createdBy: 'Ekta Meena (Master Admin)',
  },
];

class ShortUrlService {
  private getStorage(): PublicShortUrlRecord[] {
    try {
      const raw = localStorage.getItem(SHORT_URL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PublicShortUrlRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Migrate valid non-legacy links from previous storage key if present
      const legacyRaw = localStorage.getItem(LEGACY_SHORT_URL_STORAGE_KEY);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw) as PublicShortUrlRecord[];
        if (Array.isArray(legacyParsed)) {
          const migrated = legacyParsed
            .filter(
              (r) =>
                r.id !== 'SLK-XPOKART-01' &&
                !String(r.brandId || '').toLowerCase().includes('xpokart') &&
                !String(r.brandId || '').toLowerCase().includes('xpeedo')
            )
            .map((r) => ({
              ...r,
              brandId: r.brandId === 'india-post' ? 'india-post' : 'india-post-bulk',
            }));
          const merged = [...DEFAULT_SHORT_URLS];
          migrated.forEach((m) => {
            if (!merged.some((d) => d.shortCode === m.shortCode)) {
              merged.push(m);
            }
          });
          this.saveStorage(merged);
          return merged;
        }
      }
    } catch {
      // fallback
    }
    this.saveStorage(DEFAULT_SHORT_URLS);
    return [...DEFAULT_SHORT_URLS];
  }

  private saveStorage(records: PublicShortUrlRecord[]) {
    try {
      localStorage.setItem(SHORT_URL_STORAGE_KEY, JSON.stringify(records));
    } catch {
      // ignore
    }
  }

  public getShortUrls(): PublicShortUrlRecord[] {
    return this.getStorage();
  }

  public generateShortUrl(payload: {
    brandId: string;
    brandName: string;
    scope: 'CUSTOMER' | 'STAFF' | 'BOTH';
    label: string;
    creatorName?: string;
  }): PublicShortUrlRecord {
    const list = this.getStorage();
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const shortCode = `INP-${randomCode}`;
    const safeBrandId =
      payload.brandId && !payload.brandId.toLowerCase().includes('xpokart') && !payload.brandId.toLowerCase().includes('xpeedo')
        ? payload.brandId
        : 'india-post';
    const record: PublicShortUrlRecord = {
      id: `SLK-${Date.now().toString(36).toUpperCase()}`,
      shortCode,
      brandId: safeBrandId,
      brandName: payload.brandName || 'India Post',
      scope: payload.scope,
      label: payload.label || `${payload.brandName || 'India Post'} Public & Staff Portal`,
      status: 'Active',
      clicksCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: payload.creatorName || 'Master Admin (Ekta Meena)',
    };
    list.unshift(record);
    this.saveStorage(list);
    return record;
  }

  public resolveShortCode(code: string): PublicShortUrlRecord | null {
    const clean = (code || '').trim().toUpperCase();
    const list = this.getStorage();
    const found = list.find((r) => r.shortCode.toUpperCase() === clean && r.status === 'Active');
    if (found) {
      found.clicksCount += 1;
      this.saveStorage(list);
    }
    return found || null;
  }

  public toggleRevokeStatus(id: string): PublicShortUrlRecord | null {
    const list = this.getStorage();
    const item = list.find((r) => r.id === id);
    if (!item) return null;
    item.status = item.status === 'Active' ? 'Revoked' : 'Active';
    this.saveStorage(list);
    return item;
  }

  public deleteShortUrl(id: string): boolean {
    const list = this.getStorage();
    const next = list.filter((r) => r.id !== id);
    if (next.length !== list.length) {
      this.saveStorage(next);
      return true;
    }
    return false;
  }

  public getFullPublicUrl(shortCode: string): string {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://ais-dev-upa7hb7ebjsju3e7k63nqq-154904702900.asia-southeast1.run.app';
    return `${origin}/s/${shortCode}`;
  }
}

export const shortUrlService = new ShortUrlService();
