import { ProductTargetRecord, POSTAL_SERVICE_TAG_OPTIONS } from '../types/models';
import { customerService } from './customerService';
import { staffPermissionService } from './staffPermissionService';

const PRODUCT_TARGETS_KEY = 'indiapost_product_targets_v1';

const SEEDED_TARGETS: ProductTargetRecord[] = [
  {
    id: 'TGT-SSA-01',
    productCode: 'SSA',
    productName: 'Sukanya Samriddhi Yojana (SSA)',
    serviceTag: 'Small Savings (SSY / PPF / SCSS / MIS / RD / NSC)',
    period: 'Monthly - Current Cycle',
    targetUnits: 12,
    targetRevenueInr: 180000,
    scopeType: 'DIVISION',
    officeId: 'DADABARI_SO',
    officeName: 'Dadabari S.O.',
    pincode: '324009',
    beatNo: 'Beat 2',
    notes: 'Focus on households with girl children aged 0-10 years across Beats 1-6.',
    createdBy: 'Ektamahenmeena@gmail.com',
    updatedAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'TGT-PLI-02',
    productCode: 'PLI_SURAKSHA',
    productName: 'Postal Life Insurance (PLI / RPLI)',
    serviceTag: 'PLI / RPLI Life Insurance',
    period: 'Monthly - Current Cycle',
    targetUnits: 8,
    targetRevenueInr: 1500000,
    scopeType: 'DIVISION',
    officeId: 'DADABARI_SO',
    officeName: 'Dadabari S.O.',
    pincode: '324009',
    beatNo: 'Beat 2',
    notes: 'Priority targeting for government employees, teachers, and professionals.',
    createdBy: 'Ektamahenmeena@gmail.com',
    updatedAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'TGT-IPPB-03',
    productCode: 'IPPB_SB',
    productName: 'IPPB Digital Banking, AePS & Merchant QR',
    serviceTag: 'IPPB Banking, AePS & Merchant QR',
    period: 'Monthly - Current Cycle',
    targetUnits: 25,
    targetRevenueInr: 75000,
    scopeType: 'DIVISION',
    officeId: 'DADABARI_SO',
    officeName: 'Dadabari S.O.',
    pincode: '324009',
    notes: 'Doorstep biometric accounts + merchant QR onboarding.',
    createdBy: 'Ektamahenmeena@gmail.com',
    updatedAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'TGT-BULK-04',
    productCode: 'DNK_PARCEL',
    productName: 'Speed Post, Parcel & Bulk Customer BNPL',
    serviceTag: 'Parcel & E-Commerce COD',
    period: 'Monthly - Current Cycle',
    targetUnits: 20,
    targetRevenueInr: 250000,
    scopeType: 'DIVISION',
    officeId: 'KOTA_HO',
    officeName: 'Kota H.O. / Vigyan Nagar S.O.',
    pincode: '324005',
    notes: 'Promoted bulk customer study material, handloom & pharmacy parcel dispatch.',
    createdBy: 'Ektamahenmeena@gmail.com',
    updatedAt: '2026-01-15T09:00:00.000Z',
  },
  {
    id: 'TGT-CELC-05',
    productCode: 'CELC_AADHAAR',
    productName: 'Aadhaar / CELC & Jeevan Pramaan DLC',
    serviceTag: 'Aadhaar / CELC & Jeevan Pramaan DLC',
    period: 'Monthly - Current Cycle',
    targetUnits: 30,
    targetRevenueInr: 30000,
    scopeType: 'DIVISION',
    officeId: 'DADABARI_SO',
    officeName: 'Dadabari S.O.',
    pincode: '324009',
    notes: 'Senior citizen biometric life certificates and child CELC camp.',
    createdBy: 'Ektamahenmeena@gmail.com',
    updatedAt: '2026-01-15T09:00:00.000Z',
  },
];

export interface ProductTargetProgressRow {
  target: ProductTargetRecord;
  matchingLeadsCount: number;
  activePipelineCount: number;
  convertedCount: number;
  achievedUnits: number;
  achievedRevenueInr: number;
  pipelineValueInr: number;
  dueFollowUpsCount: number;
  taggedCustomersCount: number;
  unitProgressPct: number;
  revenueProgressPct: number;
  conversionPct: number;
}

class ProductTargetService {
  private listeners = new Set<() => void>();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore listener failure
      }
    });
  }

  public getTargets(): ProductTargetRecord[] {
    try {
      const raw = localStorage.getItem(PRODUCT_TARGETS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as ProductTargetRecord[];
      }
    } catch {
      // ignore storage error
    }
    try {
      localStorage.setItem(PRODUCT_TARGETS_KEY, JSON.stringify(SEEDED_TARGETS));
    } catch {
      // ignore quota error
    }
    return [...SEEDED_TARGETS];
  }

  public upsertTarget(
    input: Partial<ProductTargetRecord> & {
      productCode: string;
      productName: string;
      targetUnits: number;
      targetRevenueInr: number;
    }
  ): ProductTargetRecord {
    const list = this.getTargets();
    const now = new Date().toISOString();
    const cleanId = (input.id || '').trim();
    const idx = cleanId ? list.findIndex((t) => t.id === cleanId) : -1;
    const record: ProductTargetRecord = {
      id: cleanId || `TGT-${Date.now().toString(36).toUpperCase()}`,
      productCode: input.productCode.trim(),
      productName: input.productName.trim(),
      serviceTag: input.serviceTag || POSTAL_SERVICE_TAG_OPTIONS[0],
      period: input.period || 'Monthly - Current Cycle',
      targetUnits: Math.max(1, Number(input.targetUnits) || 1),
      targetRevenueInr: Math.max(0, Number(input.targetRevenueInr) || 0),
      scopeType: input.scopeType || 'DIVISION',
      officeId: input.officeId,
      officeName: input.officeName,
      pincode: input.pincode,
      beatNo: input.beatNo,
      assignedStaffId: input.assignedStaffId,
      assignedStaffName: input.assignedStaffName,
      notes: input.notes,
      createdBy: input.createdBy || 'System',
      updatedAt: now,
    };

    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.unshift(record);
    }

    try {
      localStorage.setItem(PRODUCT_TARGETS_KEY, JSON.stringify(list));
    } catch {
      // ignore storage error
    }
    this.notify();
    return record;
  }

  public deleteTarget(id: string): void {
    const list = this.getTargets().filter((t) => t.id !== id);
    try {
      localStorage.setItem(PRODUCT_TARGETS_KEY, JSON.stringify(list));
    } catch {
      // ignore storage error
    }
    this.notify();
  }

  public computeScopedTargetProgress(userProfile: any): ProductTargetProgressRow[] {
    const targets = this.getTargets().filter((t) => {
      if (!userProfile || staffPermissionService.isSuperAdmin(userProfile)) return true;
      if (t.scopeType === 'DIVISION') return true;
      return staffPermissionService.matchesUserBeatScope(userProfile, {
        beatNo: t.beatNo,
        officeId: t.officeId,
        officeName: t.officeName,
        pincode: t.pincode,
        assignedStaffId: t.assignedStaffId,
      });
    });

    const scopedLeads = customerService.getScopedLeads(userProfile);
    const scopedFollowUps = customerService.getScopedFollowUps(userProfile);
    const scopedCustomers = customerService.getScopedCustomers(userProfile);

    return targets.map((target) => {
      const codeNorm = target.productCode.trim().toLowerCase();
      const nameNorm = target.productName.trim().toLowerCase();
      const tagNorm = target.serviceTag.trim().toLowerCase();
      const codePrefix = codeNorm.split('_')[0];

      const matchingLeads = scopedLeads.filter((l) => {
        const lc = (l.productCode || '').toLowerCase();
        const ln = (l.productName || '').toLowerCase();
        const lTags = (l.serviceTags || []).map((x) => x.toLowerCase());
        const selMatch = (l.selectedProducts || []).some(
          (sp) =>
            sp.code.toLowerCase() === codeNorm ||
            sp.code.toLowerCase().includes(codePrefix) ||
            sp.title.toLowerCase().includes(nameNorm)
        );
        return (
          selMatch ||
          lc === codeNorm ||
          (codePrefix.length >= 2 && lc.includes(codePrefix)) ||
          ln.includes(codePrefix) ||
          lTags.some((t) => t === tagNorm || t.includes(tagNorm.split(' ')[0]))
        );
      });

      const convertedLeads = matchingLeads.filter(
        (l) => l.stage === 'Converted - Product Opened' || l.stage === 'Completed'
      );
      const activePipelineLeads = matchingLeads.filter(
        (l) =>
          l.stage !== 'Converted - Product Opened' &&
          l.stage !== 'Completed' &&
          l.stage !== 'Closed' &&
          l.stage !== 'Closed - Not Interested' &&
          l.stage !== 'Not Interested'
      );

      const achievedUnits = convertedLeads.reduce((acc, l) => acc + Math.max(1, Number(l.quantity) || 1), 0);
      const achievedRevenueInr = convertedLeads.reduce((acc, l) => acc + (Number(l.estimatedValue) || 0), 0);
      const pipelineValueInr = activePipelineLeads.reduce((acc, l) => acc + (Number(l.estimatedValue) || 0), 0);

      const matchingLeadIds = new Set(matchingLeads.map((l) => l.id));
      const dueFollowUpsCount = scopedFollowUps.filter(
        (f) =>
          f.currentStatus !== 'Completed' &&
          f.currentStatus !== 'Cancelled' &&
          ((f.leadId && matchingLeadIds.has(f.leadId)) ||
            (f.productCode || '').toLowerCase().includes(codePrefix))
      ).length;

      const taggedCustomersCount = scopedCustomers.filter((c) =>
        (c.interestedServiceTags || []).some(
          (t) => t.toLowerCase() === tagNorm || t.toLowerCase().includes(tagNorm.split(' ')[0])
        )
      ).length;

      const unitProgressPct = Math.min(100, Math.round((achievedUnits / Math.max(1, target.targetUnits)) * 100));
      const revenueProgressPct =
        target.targetRevenueInr > 0
          ? Math.min(100, Math.round((achievedRevenueInr / target.targetRevenueInr) * 100))
          : unitProgressPct;
      const conversionPct =
        matchingLeads.length > 0 ? Math.round((convertedLeads.length / matchingLeads.length) * 100) : 0;

      return {
        target,
        matchingLeadsCount: matchingLeads.length,
        activePipelineCount: activePipelineLeads.length,
        convertedCount: convertedLeads.length,
        achievedUnits,
        achievedRevenueInr,
        pipelineValueInr,
        dueFollowUpsCount,
        taggedCustomersCount,
        unitProgressPct,
        revenueProgressPct,
        conversionPct,
      };
    });
  }
}

export const productTargetService = new ProductTargetService();
