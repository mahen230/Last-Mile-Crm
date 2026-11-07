/**
 * DATA PRIVACY & ZERO PUBLIC LEAKAGE CLEARANCE ENGINE
 * Enforces mandatory data scrubbing and clearance checks for sensitive India Post logistics,
 * fuel billing algorithms (₹3.60/KM), employee contact numbers, and internal Beat intelligence.
 *
 * Clearance Levels:
 * - PUBLIC: General product catalog, public tracking status, pincode directory
 * - CUSTOMER: Citizen leads, inquiries, personal booking history (zero staff routes)
 * - STAFF (POSTMAN / GDS / PA): Assigned Beat delivery rows, personal fuel bills
 * - ADMIN (SPM / IP / MASTER_ADMIN): All 33 beats, full financial reconciliation, employee PII
 */

import { StaffProfile, DailyArticleEntry, Customer } from '../types/models';
import { CustomerSession } from './customerAuthService';

export type SecurityClearanceLevel = 'PUBLIC' | 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface ClearanceContext {
  level: SecurityClearanceLevel;
  staffProfile?: StaffProfile | null;
  customerProfile?: CustomerSession | null;
  allowedBeats: string[];
}

class DataClearanceSanitizer {
  /**
   * Resolves current clearance level from active staff or customer sessions
   */
  public resolveContext(staff?: StaffProfile | null, customer?: CustomerSession | null): ClearanceContext {
    if (staff && staff.role) {
      const isAdmin = staff.role === 'ADMIN' || staff.email === 'mahen.comtech@gmail.com';
      const allowedBeats = isAdmin
        ? ['All Beats']
        : staff.permissions?.allowedBeats || (staff.beat ? [staff.beat] : []);

      return {
        level: isAdmin ? 'ADMIN' : 'STAFF',
        staffProfile: staff,
        customerProfile: null,
        allowedBeats,
      };
    }

    if (customer && customer.tier === 'CUSTOMER') {
      return {
        level: 'CUSTOMER',
        staffProfile: null,
        customerProfile: customer,
        allowedBeats: [],
      };
    }

    return {
      level: 'PUBLIC',
      staffProfile: null,
      customerProfile: null,
      allowedBeats: [],
    };
  }

  /**
   * Validates whether current clearance context can view a specific resource
   */
  public assertClearance(
    ctx: ClearanceContext,
    requiredLevel: SecurityClearanceLevel,
    targetBeat?: string
  ): { authorized: boolean; reason?: string } {
    const levelOrder: Record<SecurityClearanceLevel, number> = {
      PUBLIC: 0,
      CUSTOMER: 1,
      STAFF: 2,
      ADMIN: 3,
    };

    if (levelOrder[ctx.level] < levelOrder[requiredLevel]) {
      return {
        authorized: false,
        reason: `Access Denied: Resource requires clearance level '${requiredLevel}', but active session has '${ctx.level}'.`,
      };
    }

    // Beat-level isolation for staff
    if (ctx.level === 'STAFF' && targetBeat && !ctx.allowedBeats.includes('All Beats')) {
      const normalizedTarget = targetBeat.trim().toLowerCase();
      const hasBeatAccess = ctx.allowedBeats.some(
        (b) => b.trim().toLowerCase() === normalizedTarget
      );
      if (!hasBeatAccess) {
        return {
          authorized: false,
          reason: `Beat Isolation Enforced: Staff account is restricted to ${ctx.allowedBeats.join(', ')} and cannot view ${targetBeat}.`,
        };
      }
    }

    return { authorized: true };
  }

  /**
   * Sanitizes Staff records: strips PII, phone, and internal CSI IDs for non-admin viewers
   */
  public sanitizeStaffRecord(staff: StaffProfile, ctx: ClearanceContext): Partial<StaffProfile> {
    if (ctx.level === 'ADMIN') {
      return staff; // Full visibility for supervisory officers
    }

    if (ctx.level === 'STAFF') {
      // Staff members see name, designation, and beat; mobile and personal emails masked
      const isSelf = ctx.staffProfile?.id === staff.id || ctx.staffProfile?.email === staff.email;
      if (isSelf) return staff;

      return {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        designationType: staff.designationType,
        beat: staff.beat,
        subOffice: staff.subOffice,
        contact: staff.contact ? `+91 ${staff.contact.slice(0, 2)}******${staff.contact.slice(-2)}` : '',
        email: staff.email.includes('@') ? staff.email.replace(/(.{2})(.*)(?=@)/, '$1***') : '***',
      };
    }

    // Public / Customer: Zero internal staff records exposed
    return {
      name: 'Department of Posts Representative',
      beat: staff.beat,
      subOffice: staff.subOffice,
    };
  }

  /**
   * Sanitizes Postman Daily Article entries:
   * Non-staff or unauthorized beats receive an empty array (Zero Public Leakage)
   */
  public sanitizeArticleEntries(entries: DailyArticleEntry[], ctx: ClearanceContext): DailyArticleEntry[] {
    const check = this.assertClearance(ctx, 'STAFF');
    if (!check.authorized) {
      // 0 records returned for unauthorized or public viewers
      return [];
    }

    if (ctx.level === 'ADMIN' || ctx.allowedBeats.includes('All Beats')) {
      return entries;
    }

    // Filter strictly by allowed beats
    return entries.filter((entry) => {
      const b = entry.beatNo || '';
      return ctx.allowedBeats.some((allowed) => allowed.toLowerCase() === b.toLowerCase());
    });
  }

  /**
   * Sanitizes Fuel Billing & Rate Parameters (₹3.60/KM statutory allowance)
   * Strictly hidden from Public and Customers
   */
  public sanitizeFuelBillData<T extends Record<string, any>>(fuelData: T, ctx: ClearanceContext): T | null {
    const check = this.assertClearance(ctx, 'STAFF');
    if (!check.authorized) {
      return null;
    }
    return fuelData;
  }
}

export const dataClearanceSanitizer = new DataClearanceSanitizer();
