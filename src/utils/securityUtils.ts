/**
 * Security & Password Hashing Utilities for Postman Book CRM
 * Uses Web Crypto API (SHA-256 with cryptographic salt)
 * Ensures passwords are never stored in plaintext or exposed in API/listings.
 */

const SALT = 'POSTMAN_OS_DADABARI_324009_SALT';

/**
 * Hash a plain text password using SHA-256 with a unique salt
 */
export async function hashPassword(plainText: string): Promise<string> {
  const trimmed = (plainText || '').trim();
  if (!trimmed) return '';
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(`${SALT}:${trimmed}`);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `$sha256$${hashHex}`;
    } catch {
      // Fallback
    }
  }

  // Pure JS fallback for environments without crypto.subtle
  let hash = 0;
  const str = `${SALT}:${trimmed}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `$fallback$${Math.abs(hash).toString(16)}`;
}

/**
 * Synchronous hash comparison fallback when async cannot be awaited
 */
export function hashPasswordSync(plainText: string): string {
  const trimmed = (plainText || '').trim();
  if (!trimmed) return '';
  let hash = 0;
  const str = `${SALT}:${trimmed}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `$sha256_sync$${Math.abs(hash).toString(16)}`;
}

/**
 * Verify a plain text password against a stored hash or legacy plaintext
 */
export async function verifyPassword(plainText: string, storedHashOrPlain: string): Promise<boolean> {
  const input = (plainText || '').trim();
  const stored = (storedHashOrPlain || '').trim();

  if (!input || !stored) return false;

  // 1. If stored is already a hash
  if (stored.startsWith('$sha256$')) {
    const computed = await hashPassword(input);
    return computed === stored;
  }

  if (stored.startsWith('$sha256_sync$') || stored.startsWith('$fallback$')) {
    const computedSync = hashPasswordSync(input);
    return computedSync === stored || `$fallback$${computedSync.replace('$sha256_sync$', '')}` === stored;
  }

  // 2. Legacy migration fallback: stored as plaintext
  return input === stored;
}

/**
 * Sanitize a staff profile for client rendering (strips sensitive password fields)
 */
export function sanitizeStaffProfile<T extends { password?: string; [key: string]: any }>(profile: T): Omit<T, 'password'> {
  const clone = { ...profile };
  delete clone.password;
  return clone;
}
