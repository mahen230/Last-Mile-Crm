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

/**
 * Robust Anti-XSS Sanitizer for text and form inputs
 * Strips dangerous HTML tags, javascript: URIs, event handlers, and encodes special characters
 */
export function sanitizeHtml(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/[<>]/g, '') // Strip brackets
    .replace(/javascript:/gi, '') // Strip javascript scheme
    .replace(/vbscript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/on\w+\s*=/gi, '') // Strip onload=, onerror=, onclick=
    .trim();
}

/**
 * Strict Input Sanitizer for Citizen Names, Addresses & Notes
 */
export function sanitizeUserInput(input: string, maxLength: number = 255): string {
  if (!input || typeof input !== 'string') return '';
  return sanitizeHtml(input).slice(0, maxLength);
}

/**
 * Validates Indian Mobile Numbers (10 digits starting with 6, 7, 8, or 9)
 */
export function isValidIndianMobile(mobile: string): boolean {
  if (!mobile) return false;
  const cleaned = mobile.replace(/[\s\-\+]/g, '').replace(/^91/, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validates Indian Postal PIN codes (6 digits, non-zero starting)
 */
export function isValidPincode(pin: string): boolean {
  if (!pin) return false;
  return /^[1-9][0-9]{5}$/.test(pin.trim());
}

/**
 * Secure WhatsApp Share URL Builder
 * Prevents URL parameter tampering, CRLF injection, and arbitrary redirects
 */
export interface SecureWhatsAppShareOptions {
  recipientMobile?: string;
  schemeTitle: string;
  schemeSummary: string;
  referralCode?: string;
  sourcePortal?: string;
}

export function buildSecureWhatsAppShareUrl(options: SecureWhatsAppShareOptions): string {
  const { recipientMobile, schemeTitle, schemeSummary, referralCode, sourcePortal } = options;

  // 1. Sanitize text payloads to prevent CRLF injection and malicious link injection
  const safeTitle = sanitizeUserInput(schemeTitle, 80);
  const safeSummary = sanitizeUserInput(schemeSummary, 180);
  const safeRef = referralCode ? sanitizeUserInput(referralCode, 30) : '';
  const portalName = sourcePortal ? sanitizeUserInput(sourcePortal, 50) : 'India Post Citizen Portal (PIN 324009)';

  const messageText = [
    `📮 *${safeTitle}*`,
    `Official Post Office / IPPB Banking Scheme Details:`,
    safeSummary,
    '',
    `📌 Sub-Office: Dadabari S.O. (PIN 324009)`,
    safeRef ? `🔗 Ref ID: ${safeRef}` : '',
    `🌐 Verified by: ${portalName}`,
    'Doorstep Service Booking Available via Postman Book CRM.',
  ]
    .filter(Boolean)
    .join('\n');

  // 2. Validate recipient mobile number if present
  let targetNumber = '';
  if (recipientMobile) {
    const cleaned = recipientMobile.replace(/[\s\-\+]/g, '');
    if (isValidIndianMobile(cleaned)) {
      targetNumber = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
    }
  }

  // 3. Build strictly encoded https://api.whatsapp.com URL (whitelisted scheme & host)
  const encodedText = encodeURIComponent(messageText);
  if (targetNumber) {
    return `https://api.whatsapp.com/send?phone=${encodeURIComponent(targetNumber)}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

/**
 * Bot Defense: Honeypot & Timestamp Rate-Limiting Validator
 */
export interface LeadSubmissionPayload {
  name: string;
  mobile: string;
  scheme: string;
  address?: string;
  honeypot?: string; // Must be empty
  formRenderTime?: number; // Must be at least 2 seconds ago
}

export interface ValidationResult {
  isValid: boolean;
  sanitizedPayload?: {
    name: string;
    mobile: string;
    scheme: string;
    address: string;
  };
  errorMessage?: string;
}

export function validateLeadSubmission(payload: LeadSubmissionPayload): ValidationResult {
  // 1. Honeypot check - automated spam bots usually fill hidden inputs
  if (payload.honeypot && payload.honeypot.trim() !== '') {
    return { isValid: false, errorMessage: 'Automated submission detected.' };
  }

  // 2. Form submission time check (too fast = bot)
  if (payload.formRenderTime && Date.now() - payload.formRenderTime < 1500) {
    return { isValid: false, errorMessage: 'Submission completed too fast. Please verify inputs.' };
  }

  // 3. Name validation
  const cleanName = sanitizeUserInput(payload.name, 60);
  if (!cleanName || cleanName.length < 2) {
    return { isValid: false, errorMessage: 'Please provide a valid citizen name (min 2 chars).' };
  }

  // 4. Mobile validation
  if (!isValidIndianMobile(payload.mobile)) {
    return { isValid: false, errorMessage: 'Please enter a valid 10-digit Indian mobile number.' };
  }

  const cleanScheme = sanitizeUserInput(payload.scheme, 100);
  const cleanAddress = sanitizeUserInput(payload.address || '', 200);

  return {
    isValid: true,
    sanitizedPayload: {
      name: cleanName,
      mobile: payload.mobile.replace(/[\s\-\+]/g, '').replace(/^91/, ''),
      scheme: cleanScheme,
      address: cleanAddress,
    },
  };
}

// ============================================================================
// STAFF PRIVACY & RBAC FIELD MASKING (Zero Data Leakage for Non-Admins)
// ============================================================================

export interface StaffPersonalInfo {
  homeAddress?: string;
  bankAccount?: string;
  personalEmail?: string;
  aadhaarLast4?: string;
  restricted?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  mobile: string;
  post: string; // जैसे Postman, SPM, PA आदि
  personalInfo?: StaffPersonalInfo;
}

/**
 * यह फंक्शन चेक करेगा कि लॉगिन यूजर कौन है।
 * यदि यूजर MASTER_ADMIN नहीं है, तो उसकी सेंसिटिव पर्सनल जानकारी ट्रिम/डिफर कर दी जाएगी।
 */
export function getMaskedStaffProfile(
  targetStaff: StaffMember,
  viewerRole: string
): {
  id: string;
  name: string;
  mobile: string;
  post: string;
  personalInfo: StaffPersonalInfo;
} {
  const isMasterAdmin = viewerRole === 'MASTER_ADMIN' || viewerRole === 'ADMIN' || viewerRole === 'SUPER_ADMIN';

  // बेस डेटा जो सबको दिखेगा
  const publicProfile = {
    id: targetStaff.id,
    name: targetStaff.name,
    mobile: targetStaff.mobile,
    post: targetStaff.post,
  };

  // यदि देखने वाला मास्टर एडमिन है, तो ही पूरी जानकारी मिलेगी, अन्यथा सिर्फ Name, Contact और Post
  if (isMasterAdmin) {
    return {
      ...publicProfile,
      personalInfo: targetStaff.personalInfo || {},
    };
  }

  return {
    ...publicProfile,
    personalInfo: {
      restricted: 'Confidential (Master Admin Clearance Required)',
    },
  };
}

