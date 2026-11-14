// src/services/authSecurityService.ts

export interface UserSession {
  userId: string;
  activeSessionToken: string;
  deviceFingerprint: string;
  browserProfileId: string;
  lastLoginTime: string;
  userAgent: string;
}

const BROWSER_PROFILE_KEY = 'postal_browser_profile_id';
const SESSION_CHANNEL_NAME = 'postal_crm_session_channel';
let cachedFingerprint: string | null = null;

export function getBrowserProfileId(): string {
  if (typeof localStorage === 'undefined') return 'server-env';
  let id = localStorage.getItem(BROWSER_PROFILE_KEY);
  if (!id) {
    const rand =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    id = `BP-${rand}`;
    try {
      localStorage.setItem(BROWSER_PROFILE_KEY, id);
    } catch {
      // ignore storage quota errors
    }
  }
  return id;
}

export async function getDeviceFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint;
  const profileId = getBrowserProfileId();
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
  const lang = typeof navigator !== 'undefined' ? navigator.language : 'en';
  const tz =
    typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
  const screenSig =
    typeof screen !== 'undefined' ? `${screen.width}x${screen.height}x${screen.colorDepth}` : '0x0';
  const raw = `${profileId}|${ua}|${lang}|${tz}|${screenSig}`;

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = new TextEncoder().encode(raw);
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    cachedFingerprint = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return cachedFingerprint;
  }

  // Fallback deterministic hash when subtle crypto is unavailable
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  cachedFingerprint = `fp_${(h >>> 0).toString(16)}_${profileId}`;
  return cachedFingerprint;
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 2000
): Promise<globalThis.Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchServerCsrfToken(): Promise<string | null> {
  if (typeof fetch === 'undefined') return null;
  try {
    const res = await fetchWithTimeout(
      '/api/v1/auth/csrf',
      {
        method: 'GET',
        credentials: 'include',
      },
      1500
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.csrfToken || null;
  } catch {
    return null;
  }
}

/**
 * Single-Browser Session & Device Fingerprint Enforcement
 * Ensures only one active browser profile holds a valid session per userId at any time.
 */
export async function verifyAndEnforceSingleSession(
  userId: string,
  currentSessionToken: string
): Promise<boolean> {
  if (!userId || !currentSessionToken) {
    return false;
  }

  const storedSessionJson =
    typeof localStorage !== 'undefined' ? localStorage.getItem(`secure_session_${userId}`) : null;
  if (!storedSessionJson) {
    return false;
  }

  try {
    const activeSession: UserSession = JSON.parse(storedSessionJson);
    const currentFp = await getDeviceFingerprint();

    if (activeSession.activeSessionToken !== currentSessionToken) {
      console.warn('SECURITY ALERT: Concurrent login detected. Terminating older session.');
      return false;
    }

    if (activeSession.deviceFingerprint && activeSession.deviceFingerprint !== currentFp) {
      console.warn('SECURITY ALERT: Browser device fingerprint mismatch detected.');
      return false;
    }

    if (typeof fetch !== 'undefined') {
      try {
        const res = await fetch('/api/v1/auth/session', {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'x-device-fingerprint': currentFp,
          },
        });
        if (res.status === 401) {
          const payload = await res.json().catch(() => ({}));
          if (
            payload?.error === 'SESSION_INVALIDATED_NEW_DEVICE' ||
            payload?.error === 'DEVICE_FINGERPRINT_MISMATCH'
          ) {
            clearUserSession(userId);
            return false;
          }
        }
      } catch {
        // Network transient error does not immediately drop verified local session
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Registers a new single-browser session bound to this device fingerprint,
 * automatically invalidating any prior active sessions on the server & other tabs.
 */
export async function createNewSecureSession(
  userId: string,
  meta?: { email?: string; name?: string; beat?: string }
): Promise<string> {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : Math.random().toString(36).substring(2, 14);
  const token = `SEC_TKN_${Date.now()}_${randomPart}`;
  const fp = await getDeviceFingerprint();
  const browserProfileId = getBrowserProfileId();

  const session: UserSession = {
    userId,
    activeSessionToken: token,
    deviceFingerprint: fp,
    browserProfileId,
    lastLoginTime: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Device',
  };

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(`secure_session_${userId}`, JSON.stringify(session));
    localStorage.setItem('active_user_token', token);
    localStorage.setItem('active_session_userId', userId);
  }

  // Non-blocking best-effort server session bind with short timeout
  if (typeof fetch !== 'undefined') {
    try {
      const csrfToken = await fetchServerCsrfToken();
      await fetchWithTimeout(
        '/api/v1/auth/session/bind',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken || '',
            'x-device-fingerprint': fp,
            'x-browser-profile-id': browserProfileId,
          },
          body: JSON.stringify({
            userId,
            email: meta?.email || userId,
            name: meta?.name,
            beat: meta?.beat,
            deviceFingerprint: fp,
            browserProfileId,
          }),
        },
        2000
      );
    } catch {
      // Offline / iframe resilient
    }
  }

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const ch = new BroadcastChannel(SESSION_CHANNEL_NAME);
      ch.postMessage({ type: 'SESSION_BOUND', userId, token, browserProfileId });
      ch.close();
    } catch {
      // ignore
    }
  }

  return token;
}

export function getActiveSessionToken(): string | null {
  return typeof localStorage !== 'undefined' ? localStorage.getItem('active_user_token') : null;
}

export function getActiveSessionUserId(): string | null {
  return typeof localStorage !== 'undefined' ? localStorage.getItem('active_session_userId') : null;
}

export async function validateAndEnforceSingleSession(
  userId: string,
  currentSessionToken: string
): Promise<void> {
  const isValid = await verifyAndEnforceSingleSession(userId, currentSessionToken);
  if (!isValid) {
    throw new Error('SECURITY_ALERT: Multiple browser login detected. This session has been terminated.');
  }
}

export function clearUserSession(userId: string): void {
  if (typeof localStorage === 'undefined') return;
  if (userId) {
    localStorage.removeItem(`secure_session_${userId}`);
  }
  localStorage.removeItem('active_user_token');
  localStorage.removeItem('active_session_userId');
}

export function subscribeToSessionInvalidation(
  onInvalidated: (reason: string) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleStorage = (e: StorageEvent) => {
    const activeToken = getActiveSessionToken();
    if (e.key === 'active_user_token' && e.newValue === null && activeToken) {
      onInvalidated('Session signed out.');
    }
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('storage', handleStorage);
  };
}
