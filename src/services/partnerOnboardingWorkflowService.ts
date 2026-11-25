import { customerService } from './customerService';
import { brandOwnerService } from './brandOwnerService';
import { partnerBrandService } from './partnerBrandService';
import { xpeedoOpsService } from './xpeedoOpsService';
import { notificationService } from './notificationService';

export type BusinessScaleType =
  | 'ROADSIDE_VENDOR'
  | 'LOCAL_SHOP_MERCHANT'
  | 'SMALL_BUSINESS'
  | 'GROWING_ENTERPRISE'
  | 'CORPORATE_BRAND';

export type CurrentWorkflowType =
  | 'MANUAL_PEN_PAPER'
  | 'LEGACY_SOFTWARE'
  | 'SEMI_DIGITAL'
  | 'OTHER';

export type OnboardingLeadStatus =
  | 'SUBMITTED'
  | 'ASSIGNED_TO_SALES'
  | 'IN_REVIEW'
  | 'DISCOVERY_COMPLETED'
  | 'ONBOARDING_DONE'
  | 'BRAND_UNLOCKED';

export interface PartnerOnboardingLead {
  id: string;
  referenceId: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  businessScale: BusinessScaleType;
  scaleLabel: string;
  currentWorkflowType: CurrentWorkflowType;
  workflowLabel: string;
  estimatedManualWorkload: string;
  targetAutomationRate: string;
  serviceCategory: string;
  cityOrPincode: string;
  requirements: string;
  status: OnboardingLeadStatus;
  assignedDepartmentId: string;
  assignedDepartmentName: string;
  assignedSalesAgentId: string;
  assignedSalesAgentName: string;
  brandOnboardingUnlocked: boolean;
  unlockedBrandProfileId?: string;
  unlockedBrandCode?: string;
  unlockedBrandSlug?: string;
  crmLeadId?: string;
  submittedAt: string;
  updatedAt: string;
  doneAt?: string;
  reviewerNotes?: string;
}

export interface SubmitPartnerOnboardInput {
  businessName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  businessScale?: BusinessScaleType;
  currentWorkflowType?: CurrentWorkflowType;
  serviceCategory?: string;
  cityOrPincode?: string;
  requirements?: string;
}

const STORAGE_KEY = 'xpeedo_partner_onboarding_leads_v1';
const ROUND_ROBIN_INDEX_KEY = 'xpeedo_sales_rr_index_v1';

export const BUSINESS_SCALE_META: Record<
  BusinessScaleType,
  { label: string; desc: string; sampleRole: string; defaultAutomation: string }
> = {
  ROADSIDE_VENDOR: {
    label: 'Roadside Vendor & Micro-Merchant',
    desc: 'Chai & snack stalls, vegetable/fruit carts, kiosks, street retail running on cash slips.',
    sampleRole: 'Speed Post COD, 1-Click WhatsApp Receipts & Digital Ledger',
    defaultAutomation: '85% Manual Elimination',
  },
  LOCAL_SHOP_MERCHANT: {
    label: 'Local Shop & Neighborhood Retailer',
    desc: 'Kirana stores, medical pharmacies, dairy, apparel boutiques running on paper bills.',
    sampleRole: 'Hyperlocal Delivery Beat Dispatch, Instant Stock Alerts & Customer CRM',
    defaultAutomation: '80% Manual Elimination',
  },
  SMALL_BUSINESS: {
    label: 'Small Business & Service Provider',
    desc: 'Repair centers, local coaching institutes, clinics, caterers, small workshops.',
    sampleRole: 'Automated Job Cards, Invoicing, Staff Shifts & Customer Tracking',
    defaultAutomation: '75% Manual Elimination',
  },
  GROWING_ENTERPRISE: {
    label: 'Growing Enterprise & Distributor',
    desc: 'Regional wholesale distributors, manufacturing units, commercial supply chains.',
    sampleRole: 'Multi-Beat Route Optimization, B2B Credit Ledger & Stock Sync',
    defaultAutomation: '85% Manual Elimination',
  },
  CORPORATE_BRAND: {
    label: 'Corporate Brand & Multi-Branch Network',
    desc: 'Franchise retail chains, institutional fleets, state or postal administrative divisions.',
    sampleRole: 'Enterprise RBAC, Single-Brand Logins, Multi-Tier Approvals & 10-Level Geo Map',
    defaultAutomation: '90% Manual Elimination',
  },
};

export const WORKFLOW_TYPE_META: Record<CurrentWorkflowType, string> = {
  MANUAL_PEN_PAPER: 'Manual Pen & Paper Registers (100% Manual Risk)',
  LEGACY_SOFTWARE: '10-Year-Old Desktop / Legacy Software (Zero Automation)',
  SEMI_DIGITAL: 'Messy Spreadsheets & WhatsApp Messages (Fragmented)',
  OTHER: 'Mixed Manual & Basic Billing Counter',
};

// Sales Department Team Roster for Deterministic Round-Robin Lead Assignment
export const SALES_DEPARTMENT_ROSTER: Array<{ id: string; name: string; title: string }> = [
  { id: 'STAFF-SLS-01', name: 'Vikram Singh Hada', title: 'Senior B2B Sales & Enterprise Lead' },
  { id: 'STAFF-SLS-02', name: 'Pooja Verma', title: 'Retail & Local Merchant Onboarding Specialist' },
  { id: 'STAFF-SLS-03', name: 'Rajesh Sharma', title: 'Workflow Automation & Franchise Executive' },
  { id: 'STAFF-SLS-04', name: 'Mahendra Kumar Meena', title: 'Field Logistics & Beat Integration Lead' },
];

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Non-fatal fallback
  }
}

function normalizeIndianMobile(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

function generateRefId(pincodeOrCity: string): string {
  const pin = pincodeOrCity.replace(/\D/g, '').slice(0, 6) || '324009';
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `XPD-AUTO-${pin}-${rand}`;
}

const SEEDED_LEADS: PartnerOnboardingLead[] = [
  {
    id: 'onb_lead_001',
    referenceId: 'XPD-AUTO-324009-8K2Q',
    businessName: 'Gupta Kirana & General Store',
    contactPerson: 'Ramesh Gupta',
    phone: '9829012345',
    email: 'gupta.kirana@gmail.com',
    businessScale: 'LOCAL_SHOP_MERCHANT',
    scaleLabel: 'Local Shop & Neighborhood Retailer',
    currentWorkflowType: 'MANUAL_PEN_PAPER',
    workflowLabel: 'Manual Pen & Paper Registers (100% Manual Risk)',
    estimatedManualWorkload: '85% Manual Work',
    targetAutomationRate: '80% Automation (Saved ~4.5 hrs/day)',
    serviceCategory: 'Billing, Inventory & Speed Post COD Dispatch',
    cityOrPincode: '324009',
    requirements: 'Currently noting daily udhar/credit in bahi-khata and losing ~₹15,000/month. Need automated WhatsApp receipts and delivery dispatch.',
    status: 'ASSIGNED_TO_SALES',
    assignedDepartmentId: 'dept-ev-sales',
    assignedDepartmentName: 'Sales Department',
    assignedSalesAgentId: 'STAFF-SLS-01',
    assignedSalesAgentName: 'Vikram Singh Hada',
    brandOnboardingUnlocked: false,
    submittedAt: '2026-11-20T10:15:00.000Z',
    updatedAt: '2026-11-20T10:15:00.000Z',
  },
  {
    id: 'onb_lead_002',
    referenceId: 'XPD-AUTO-324005-4M9T',
    businessName: 'Sharmaji Chai & Food Kiosk',
    contactPerson: 'Kailash Sharma',
    phone: '9414055566',
    businessScale: 'ROADSIDE_VENDOR',
    scaleLabel: 'Roadside Vendor & Micro-Merchant',
    currentWorkflowType: 'MANUAL_PEN_PAPER',
    workflowLabel: 'Manual Pen & Paper Registers (100% Manual Risk)',
    estimatedManualWorkload: '90% Manual Work',
    targetAutomationRate: '85% Automation (Instant COD & QR Receipts)',
    serviceCategory: 'Micro-Merchant Daily Digital Bookkeeping',
    cityOrPincode: '324005',
    requirements: 'Roadside tea stall & evening snacks. Need zero-paper daily sales record and supplier pay ledger on mobile.',
    status: 'ONBOARDING_DONE',
    assignedDepartmentId: 'dept-ev-sales',
    assignedDepartmentName: 'Sales Department',
    assignedSalesAgentId: 'STAFF-SLS-02',
    assignedSalesAgentName: 'Pooja Verma',
    brandOnboardingUnlocked: true,
    unlockedBrandProfileId: 'bp-sharmaji-chai',
    unlockedBrandCode: 'BRD-SHARMA-01',
    unlockedBrandSlug: 'sharmaji-chai',
    submittedAt: '2026-11-18T14:30:00.000Z',
    updatedAt: '2026-11-19T11:00:00.000Z',
    doneAt: '2026-11-19T11:00:00.000Z',
    reviewerNotes: 'Verified via WhatsApp video demo. Single Brand login created and handed over.',
  },
];

class PartnerOnboardingWorkflowService {
  private leads: PartnerOnboardingLead[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.load();
  }

  private load(): void {
    const stored = readJson<PartnerOnboardingLead[]>(STORAGE_KEY, []);
    if (!stored || stored.length === 0) {
      this.leads = [...SEEDED_LEADS];
      this.save();
    } else {
      this.leads = stored;
    }
  }

  private save(): void {
    writeJson(STORAGE_KEY, this.leads);
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.warn('Listener error in PartnerOnboardingWorkflowService:', err);
      }
    });
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public getLeads(): PartnerOnboardingLead[] {
    return [...this.leads];
  }

  public getLeadById(id: string): PartnerOnboardingLead | undefined {
    return this.leads.find((l) => l.id === id || l.referenceId === id);
  }

  /**
   * Deterministic round-robin index for assigning new leads to the Sales Department.
   */
  private getNextSalesAgent(): { id: string; name: string; title: string } {
    const curIdx = Number(localStorage.getItem(ROUND_ROBIN_INDEX_KEY) || '0');
    const agent = SALES_DEPARTMENT_ROSTER[curIdx % SALES_DEPARTMENT_ROSTER.length];
    try {
      localStorage.setItem(ROUND_ROBIN_INDEX_KEY, String((curIdx + 1) % SALES_DEPARTMENT_ROSTER.length));
    } catch {
      // Non-fatal
    }
    return agent;
  }

  /**
   * Submit Partner Onboarding Form
   * Enforces deduplication by Phone, Email, and Business Name.
   */
  public submitPartnerOnboardLead(input: SubmitPartnerOnboardInput): {
    success: boolean;
    lead: PartnerOnboardingLead;
    isExisting: boolean;
    message: string;
  } {
    const cleanPhone = normalizeIndianMobile(input.phone);
    const cleanName = input.businessName.trim();
    const cleanContact = input.contactPerson.trim();
    const cleanEmail = input.email?.trim().toLowerCase();
    const now = new Date().toISOString();

    // 1. Check for Existing Duplicate
    const existing = this.leads.find((l) => {
      if (cleanPhone && cleanPhone.length === 10 && l.phone === cleanPhone) return true;
      if (cleanEmail && l.email && l.email.toLowerCase() === cleanEmail) return true;
      if (cleanName && l.businessName.toLowerCase() === cleanName.toLowerCase()) return true;
      return false;
    });

    if (existing) {
      // Update existing record rather than duplicating
      existing.updatedAt = now;
      if (input.requirements) {
        existing.requirements = `${existing.requirements}\n[Follow-up note ${now.slice(0, 10)}]: ${input.requirements.trim()}`;
      }
      this.save();
      return {
        success: true,
        lead: existing,
        isExisting: true,
        message: `Existing partner application found for ${existing.businessName} (Ref: ${existing.referenceId}). Our Sales Department (${existing.assignedSalesAgentName}) has your details on file.`,
      };
    }

    // 2. Deterministic Sales Department Assignment
    const assignedAgent = this.getNextSalesAgent();
    const scale = input.businessScale || 'LOCAL_SHOP_MERCHANT';
    const scaleMeta = BUSINESS_SCALE_META[scale];
    const workflow = input.currentWorkflowType || 'MANUAL_PEN_PAPER';
    const workflowMeta = WORKFLOW_TYPE_META[workflow];
    const refId = generateRefId(input.cityOrPincode || '324009');
    const leadId = `onb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // 3. Create CRM Lead in customerService for Master Admin CRM visibility
    let crmLeadId: string | undefined;
    try {
      const crmLead = customerService.createLead({
        customerId: `PARTNER-${refId}`,
        customerName: `${cleanName} — ${cleanContact}`,
        customerMobile: cleanPhone || '0000000000',
        productCode: 'IT_AUTOMATION',
        productName: `Xpeedo Services · 70%–90% IT Automation (${scaleMeta.label})`,
        requirement: input.requirements || 'Requested partner onboarding and legacy workflow modernization.',
        source: 'XPEEDO_SERVICES_HOME',
        sourceChannel: 'XPEEDO_SERVICES_HOME',
        stage: 'New',
        priority: 'Urgent',
        leadScore: 94,
        pincode: input.cityOrPincode?.replace(/\D/g, '').slice(0, 6) || '324009',
        postOfficeName: 'Dadabari S.O. Hub',
        brandId: 'xpeedo-services',
        brandName: 'Xpeedo Services',
        businessCategory: input.serviceCategory || 'IT Automation & Workflow OS',
        assignedStaffName: assignedAgent.name,
        notes: `Ref: ${refId} | Scale: ${scaleMeta.label} | Workflow: ${workflowMeta} | Assigned to: Sales Dept (${assignedAgent.name})`,
      });
      crmLeadId = crmLead.id;
    } catch (err) {
      console.warn('Failed to mirror lead to customerService:', err);
    }

    const newLead: PartnerOnboardingLead = {
      id: leadId,
      referenceId: refId,
      businessName: cleanName,
      contactPerson: cleanContact,
      phone: cleanPhone,
      email: cleanEmail,
      businessScale: scale,
      scaleLabel: scaleMeta.label,
      currentWorkflowType: workflow,
      workflowLabel: workflowMeta,
      estimatedManualWorkload: scaleMeta.defaultAutomation.replace('Elimination', 'Manual Operations'),
      targetAutomationRate: '70%–90% Work Automation',
      serviceCategory: input.serviceCategory || 'IT Workflow & Operations Automation',
      cityOrPincode: input.cityOrPincode?.trim() || '324009',
      requirements: input.requirements?.trim() || 'Modernize manual/legacy workflow into Xpeedo Automated OS.',
      status: 'ASSIGNED_TO_SALES',
      assignedDepartmentId: 'dept-ev-sales',
      assignedDepartmentName: 'Sales Department',
      assignedSalesAgentId: assignedAgent.id,
      assignedSalesAgentName: assignedAgent.name,
      brandOnboardingUnlocked: false,
      crmLeadId,
      submittedAt: now,
      updatedAt: now,
    };

    this.leads.unshift(newLead);
    this.save();

    // 4. Send Activity & Notification to Master Admin
    try {
      xpeedoOpsService.logExternalActivity({
        actor: cleanContact,
        actorRole: 'PARTNER_APPLICANT',
        workspaceId: 'GLOBAL',
        entityType: 'PartnerOnboardingLead',
        entityId: newLead.id,
        action: 'PARTNER_ONBOARDING_SUBMITTED',
        summary: `New Partner Onboard Lead: "${cleanName}" (${scaleMeta.label}). Auto-assigned to Sales Dept (${assignedAgent.name}). Ref: ${refId}.`,
      });

      notificationService.broadcastNotification({
        title: 'New Partner Onboarding Application',
        message: `"${cleanName}" (${cleanContact}, ${cleanPhone}) applied for 70%–90% automation. Auto-assigned to Sales Department (${assignedAgent.name}). Ref: ${refId}`,
        category: 'SYSTEM',
        priority: 'High',
      });
    } catch {
      // Non-fatal
    }

    return {
      success: true,
      lead: newLead,
      isExisting: false,
      message: `Application submitted successfully! Ref: ${refId}. Auto-assigned to Sales Department (${assignedAgent.name}). Our team will connect with you within 2 business hours.`,
    };
  }

  /**
   * Once partner discovery/setup step is marked DONE:
   * Automatically triggers & unlocks the Brand Onboarding stage!
   */
  public markPartnerOnboardingDone(
    leadId: string,
    reviewerNotes?: string,
    actorName: string = 'Master Admin'
  ): {
    success: boolean;
    lead: PartnerOnboardingLead;
    brandProfile?: any;
    message: string;
  } {
    const lead = this.leads.find((l) => l.id === leadId);
    if (!lead) {
      throw new Error(`Partner onboarding record ${leadId} not found.`);
    }

    const now = new Date().toISOString();
    lead.status = 'ONBOARDING_DONE';
    lead.brandOnboardingUnlocked = true;
    lead.doneAt = now;
    lead.updatedAt = now;
    lead.reviewerNotes = reviewerNotes || `Marked DONE by ${actorName}. Unlocked Brand Onboarding.`;

    // Automatically trigger Brand Onboarding in brandOwnerService
    const brandSlug = lead.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `brand-${Date.now().toString(36)}`;

    let brandProfile: any;
    try {
      const regRes = brandOwnerService.submitBrandRegistrationRequest({
        brandName: lead.businessName,
        ownerName: lead.contactPerson,
        ownerContactNumber: lead.phone,
        ownerEmail: lead.email || `${lead.phone}@partner.xpeedo.in`,
        category: lead.serviceCategory || lead.scaleLabel,
        pincode: lead.cityOrPincode || '324009',
        password: 'Brand@2026',
        passcode: lead.phone.slice(-6) || '123456',
        notes: `Auto-unlocked from Partner Onboarding (Ref: ${lead.referenceId}). Reviewer: ${actorName}.`,
        sourceTag: 'BRAND_ONBOARDING',
      });

      if ('profile' in regRes) {
        brandProfile = regRes.profile;
        lead.unlockedBrandProfileId = regRes.profile.id;
        lead.unlockedBrandCode = regRes.profile.uniqueCode;
        lead.unlockedBrandSlug = regRes.profile.partnerSlug;
      }

      // Also ensure Brand / Partner exists in brandOwnerService
      brandOwnerService.syncFromPartnerAccount({
        brandName: lead.businessName,
        partnerSlug: brandSlug,
        ownerName: lead.contactPerson,
        ownerEmail: lead.email || `${brandSlug}@partner.xpeedo.in`,
        ownerPhone: lead.phone,
        rawPasscode: 'Partner@123',
        category: lead.scaleLabel,
        pincode: lead.cityOrPincode || '324009',
        partnerStatus: 'Active',
      });
    } catch (err) {
      console.warn('Auto brand onboarding sync warning:', err);
    }

    this.save();

    // Log in Ops Activity
    try {
      xpeedoOpsService.logExternalActivity({
        actor: actorName,
        actorRole: 'MASTER_ADMIN',
        workspaceId: 'GLOBAL',
        entityType: 'PartnerOnboardingLead',
        entityId: lead.id,
        action: 'BRAND_ONBOARDING_UNLOCKED',
        summary: `Partner onboarding marked DONE for "${lead.businessName}". Unlocked Brand Onboarding (Code: ${lead.unlockedBrandCode || 'PENDING'}).`,
      });

      notificationService.broadcastNotification({
        title: 'Brand Onboarding Stage Unlocked',
        message: `Partner step marked DONE for "${lead.businessName}". Single Brand Login profile unlocked under Code: ${lead.unlockedBrandCode || 'ACTIVE'}.`,
        category: 'SYSTEM',
        priority: 'Normal',
      });
    } catch {
      // Non-fatal
    }

    return {
      success: true,
      lead,
      brandProfile,
      message: `Partner onboarding completed for "${lead.businessName}". Brand Onboarding stage unlocked with Single Brand Login!`,
    };
  }
}

export const partnerOnboardingWorkflowService = new PartnerOnboardingWorkflowService();
