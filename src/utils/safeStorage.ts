/**
 * Safe Storage Utility for XPOKART
 * Handles LocalStorage QuotaExceededError transparently:
 * 1. Automatic eviction and pruning of non-critical audit/ingestion caches when storage quota is exceeded.
 * 2. Graceful fallback to sessionStorage and in-memory storage.
 * 3. Never throws unhandled QuotaExceededError to caller.
 */

const memoryStore = new Map<string, string>();

// Non-critical keys that can be safely evicted or trimmed during storage pressure
const PRUNABLE_KEYS = [
  'postman_crm_audit_v2',
  'xpokart_login_audit_logs',
  'postman_crm_comm_logs_v1',
  'postal_master_upload_logs_v1',
  'postal_master_ingested_records_v1',
  'kota_csc_ingested_registry_v1',
  'postman_address_exceptions_v1',
  'postman_verification_tasks_v1',
  'postman_crm_beat_notes_v1',
  'postman_crm_beat_sectors_v1',
  'postman_crm_beat_sector_landmarks_v2',
  'kota_commercial_324009_v2',
];

export function cleanStorageQuota(): boolean {
  if (typeof localStorage === 'undefined') return false;
  let freed = false;

  try {
    // 1. First pass: trim known array-based keys to max 20 items
    for (const key of PRUNABLE_KEYS) {
      try {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
              if (parsed.length > 20) {
                localStorage.setItem(key, JSON.stringify(parsed.slice(0, 20)));
                freed = true;
              }
            } else if (typeof parsed === 'object' && parsed !== null) {
              const keys = Object.keys(parsed);
              if (keys.length > 50) {
                const trimmed: Record<string, any> = {};
                keys.slice(0, 50).forEach((k) => {
                  trimmed[k] = parsed[k];
                });
                localStorage.setItem(key, JSON.stringify(trimmed));
                freed = true;
              }
            }
          } catch {
            localStorage.removeItem(key);
            freed = true;
          }
        }
      } catch {
        // Continue
      }
    }

    // 2. Second pass: remove large non-essential items (>30KB)
    const keysWithSizes: { key: string; size: number }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        !k.startsWith('secure_session_') &&
        k !== 'active_user_token' &&
        k !== 'active_session_userId' &&
        k !== 'postal_auth_token' &&
        k !== 'xpokart_auth_token'
      ) {
        const val = localStorage.getItem(k) || '';
        keysWithSizes.push({ key: k, size: val.length });
      }
    }

    keysWithSizes.sort((a, b) => b.size - a.size);
    for (const item of keysWithSizes) {
      if (item.size > 30000) {
        try {
          localStorage.removeItem(item.key);
          freed = true;
        } catch {
          // ignore
        }
      }
    }
  } catch (err) {
    console.warn('[safeStorage] cleanStorageQuota warning:', err);
  }

  return freed;
}

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch {
      // ignore
    }

    try {
      if (typeof sessionStorage !== 'undefined') {
        const val = sessionStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch {
      // ignore
    }

    return memoryStore.get(key) ?? null;
  },

  setItem(key: string, value: string): boolean {
    // Always mirror in memory store as fallback
    memoryStore.set(key, value);

    if (typeof localStorage === 'undefined') return true;

    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err: any) {
      const isQuotaError =
        err?.name === 'QuotaExceededError' ||
        err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err?.code === 22 ||
        err?.code === 1014 ||
        (err?.message && String(err.message).toLowerCase().includes('quota'));

      if (isQuotaError) {
        console.warn(`[safeStorage] Storage quota reached while setting "${key}". Pruning non-critical keys...`);
        const cleaned = cleanStorageQuota();
        if (cleaned) {
          try {
            localStorage.setItem(key, value);
            return true;
          } catch {
            // Still failing, fallback to sessionStorage
          }
        }
      }

      // Fallback to sessionStorage
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(key, value);
          return true;
        }
      } catch {
        // sessionStorage also full or restricted
      }

      // Memory store is already populated
      return false;
    }
  },

  removeItem(key: string): void {
    memoryStore.delete(key);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
  },

  clear(): void {
    memoryStore.clear();
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
    } catch {
      // ignore
    }
  },

  getJSON<T>(key: string, fallback: T): T {
    try {
      const raw = this.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  setJSON(key: string, value: unknown): boolean {
    try {
      return this.setItem(key, JSON.stringify(value));
    } catch {
      return false;
    }
  },
};
