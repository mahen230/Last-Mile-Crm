import { StaffProfile } from '../types/models';

/**
 * Strict AI Studio / Local Development Bypass Guard.
 *
 * Returns true ONLY when running in Vite dev / local dev / AI Studio dev workspace
 * (`!import.meta.env.PROD` and `import.meta.env.DEV`).
 *
 * Strictly returns FALSE in production builds (`import.meta.env.PROD === true`)
 * and on live/shared preview Cloud Run hosts (`ais-pre-*`).
 */
export function isDevBypassEnvironment(): boolean {
  if (import.meta.env.PROD) return false;
  if (!import.meta.env.DEV && import.meta.env.MODE !== 'development') return false;
  if (typeof window === 'undefined') return false;

  const host = (window.location.hostname || '').toLowerCase();
  if (!host) return false;

  // Never allow bypass on live/shared pre-release or production URLs
  if (/^ais-pre-/i.test(host)) return false;

  const inIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    /^ais-dev-/i.test(host) ||
    inIframe
  );
}

/**
 * Determines whether the given authenticated profile is a Developer or Master Admin
 * authorized for unrestricted platform controls and standalone Storefront preview/admin.
 */
export function isDeveloperAccount(profile: StaffProfile | null | undefined): boolean {
  if (!profile) return false;
  const roleUpper = String(profile.role || '').toUpperCase();
  const empUpper = String(profile.employeeId || '').toUpperCase();
  const idUpper = String(profile.id || '').toUpperCase();
  const emailLower = String(profile.email || '').toLowerCase().trim();

  return (
    roleUpper === 'DEVELOPER' ||
    roleUpper === 'MASTER_ADMIN' ||
    roleUpper === 'OWNER' ||
    roleUpper === 'SUPER_ADMIN' ||
    empUpper === 'DEV-01' ||
    empUpper === 'MASTER-ADMIN-01' ||
    empUpper === 'OWNER-01' ||
    idUpper === 'STAFF-DEV-01' ||
    idUpper === 'STAFF-MASTER-EKTA' ||
    emailLower === 'dev@indiapost-portal.in' ||
    emailLower === 'ektamahenmeena@gmail.com'
  );
}

/**
 * Standalone Storefront routes (`/india-post-storefront`, `/staff-storefront`),
 * navigation entries, and workspace Storefront tabs are restricted strictly to
 * AI Studio / Local Dev Bypass Mode OR authenticated Developer / Master Admin accounts.
 *
 * Standard field staff logins access Showcase offerings inside permitted CRM workflows
 * without exposing the standalone Storefront workspace.
 */
export function canAccessStandaloneStorefront(
  profile: StaffProfile | null | undefined
): boolean {
  if (isDevBypassEnvironment()) return true;
  return isDeveloperAccount(profile);
}
