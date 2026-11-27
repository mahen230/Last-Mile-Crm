import { safeStorage } from '../utils/safeStorage';
import { getPincodeHub } from './pincodeOperationsService';
import { customerService } from './customerService';
import { brandOwnerService, normalizeIndianMobile } from './brandOwnerService';

export type B2BInquiryTrack =
  | 'BULK_BUYER'
  | 'FRANCHISE_PARTNER'
  | 'LOCAL_MERCHANT';

export interface B2BPartnershipApplication {
  id: string;
  referenceId: string;
  track: B2BInquiryTrack;
  businessName: string;
  contactName: string;
  contactPhone: string;
  email?: string;
  gstNumber?: string;
  targetPincode: string;
  officeName: string;
  localStockingPartner: string;
  category: string;
  monthlyVolumeEstimate: string;
  requirements: string;
  targetBrandSlug?: string;
  targetBrandName?: string;
  crmLeadId?: string;
  pendingBrandProfileId?: string;
  pendingBrandCode?: string;
  status: 'SUBMITTED' | 'UNDER_HUB_REVIEW' | 'APPROVED';
  createdAt: string;
}

const B2B_APPLICATIONS_STORAGE_KEY = 'xpokart_b2b_applications_v1';

function resolveSectorBrandForB2B(_category: string, _requirements: string, _explicitBrandSlug?: string): {
  brandId: string;
  brandName: string;
} {
  return { brandId: 'india-post', brandName: 'India Post Bulk Customer Hub' };
}

class B2BPartnershipService {
  public getApplications(): B2BPartnershipApplication[] {
    return safeStorage.getJSON<B2BPartnershipApplication[]>(B2B_APPLICATIONS_STORAGE_KEY, []);
  }

  public submitApplication(input: {
    track: B2BInquiryTrack;
    businessName: string;
    contactName: string;
    contactPhone: string;
    email?: string;
    gstNumber?: string;
    targetPincode: string;
    category: string;
    monthlyVolumeEstimate: string;
    requirements: string;
    targetBrandSlug?: string;
    requestPortalAccess?: boolean;
    portalPassword?: string;
    portalPasscode?: string;
  }): B2BPartnershipApplication {
    const hub = getPincodeHub(input.targetPincode);
    const cleanPhone = normalizeIndianMobile(input.contactPhone);
    const refId = `XPO-B2B-${hub.pincode}-${Date.now().toString().slice(-5)}`;
    const sector = resolveSectorBrandForB2B(input.category, input.requirements, input.targetBrandSlug);

    // 1. Capture directly into CRM Leads pipeline tagged with B2B_FORM
    const createdLead = customerService.createLead({
      customerId: `CUST-${refId}`,
      customerName: `${input.businessName.trim()} (${input.contactName.trim()})`,
      customerMobile: cleanPhone || '0000000000',
      productCode: input.track,
      productName: `${sector.brandName} · B2B (${input.track.replace('_', ' ')})`,
      requirement: input.requirements.trim(),
      source: 'B2B_FORM',
      sourceChannel: 'B2B_FORM',
      stage: 'New',
      priority: input.track === 'FRANCHISE_PARTNER' ? 'Urgent' : 'High',
      leadScore: input.track === 'FRANCHISE_PARTNER' ? 92 : 85,
      pincode: hub.pincode,
      postOfficeName: hub.officeName,
      brandId: sector.brandId,
      brandName: sector.brandName,
      businessCategory: input.category,
      notes: `B2B Ref: ${refId} · Volume: ${input.monthlyVolumeEstimate}${
        input.gstNumber ? ` · GSTIN: ${input.gstNumber.trim().toUpperCase()}` : ''
      }${input.email ? ` · Email: ${input.email.trim()}` : ''}`,
    });

    // 2. If partner/franchise onboarding or explicit portal access requested, enqueue Pending Brand Approval
    let pendingBrandProfileId: string | undefined;
    let pendingBrandCode: string | undefined;
    const shouldQueueBrandApproval =
      input.requestPortalAccess !== undefined
        ? input.requestPortalAccess
        : input.track === 'FRANCHISE_PARTNER' || input.track === 'LOCAL_MERCHANT';

    if (shouldQueueBrandApproval) {
      const regRes = brandOwnerService.submitBrandRegistrationRequest({
        brandName: input.businessName.trim(),
        ownerName: input.contactName.trim(),
        ownerContactNumber: cleanPhone,
        ownerEmail: input.email?.trim() || `${cleanPhone || refId.toLowerCase()}@indiapost-portal.in`,
        category: input.category,
        pincode: hub.pincode,
        password: (input.portalPassword || '').trim().length >= 6 ? input.portalPassword!.trim() : 'Partner@2026',
        passcode: input.portalPasscode,
        notes: `B2B Ref ${refId} (${input.track}): ${input.requirements.trim()}`,
        sourceTag: 'B2B_FORM',
      });
      if ('profile' in regRes) {
        pendingBrandProfileId = regRes.profile.id;
        pendingBrandCode = regRes.profile.uniqueCode;
      }
    }

    const application: B2BPartnershipApplication = {
      id: `b2b_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      referenceId: refId,
      track: input.track,
      businessName: input.businessName.trim(),
      contactName: input.contactName.trim(),
      contactPhone: cleanPhone,
      email: input.email?.trim() || undefined,
      gstNumber: input.gstNumber?.trim().toUpperCase() || undefined,
      targetPincode: hub.pincode,
      officeName: hub.officeName,
      localStockingPartner: hub.localStockingPartner,
      category: input.category,
      monthlyVolumeEstimate: input.monthlyVolumeEstimate,
      requirements: input.requirements.trim(),
      targetBrandSlug: sector.brandId,
      targetBrandName: sector.brandName,
      crmLeadId: createdLead.id,
      pendingBrandProfileId,
      pendingBrandCode,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    };

    const existing = this.getApplications();
    safeStorage.setJSON(B2B_APPLICATIONS_STORAGE_KEY, [application, ...existing].slice(0, 40));
    return application;
  }

  public findApplications(query: string): B2BPartnershipApplication[] {
    const q = query.trim().toLowerCase();
    const list = this.getApplications();
    if (!q) return list.slice(0, 10);
    return list.filter(
      (item) =>
        item.referenceId.toLowerCase().includes(q) ||
        item.businessName.toLowerCase().includes(q) ||
        item.contactPhone.includes(q) ||
        item.targetPincode.includes(q)
    );
  }
}

export const b2bPartnershipService = new B2BPartnershipService();
