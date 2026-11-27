import { brandOwnerService } from './brandOwnerService';
import { customerService } from './customerService';
import { partnerBrandService } from './partnerBrandService';
import { propertyRegistryService } from './propertyRegistryService';
import { staffPermissionService } from './staffPermissionService';
import { whiteLabelMasterService } from './whiteLabelMasterService';
import { xpeedoOpsService } from './xpeedoOpsService';

const CONSOLIDATION_BOOT_KEY = 'xpeedo_indiapost_consolidation_v1';
const CONSOLIDATION_REPORT_KEY = 'xpeedo_indiapost_consolidation_report_v1';

export const CANONICAL_BACKUP_SYNC_EMAILS = [
  'Ektamahenmeena@gmail.com',
  'mahen.comtech@gmail.com',
] as const;

export interface ConsolidationPreviewSnapshot {
  indiaPostCounts: {
    properties: number;
    staff: number;
    customers: number;
    leads: number;
    workReports: number;
    sales: number;
  };
  otherBrandsCounts: {
    properties: number;
    staff: number;
    customers: number;
    leads: number;
    projects: number;
    tasks: number;
    workReports: number;
    sales: number;
    partnerCrm: number;
    partnerTeamNonOwner: number;
    partnerFollowUps: number;
    partnerVerifications: number;
  };
  hasExecutedInitialConsolidation: boolean;
  lastRunReport: ConsolidationExecutionResult | null;
}

export interface ConsolidationExecutionResult {
  executedAt: string;
  actorName: string;
  consolidatedIntoIndiaPost: {
    propertiesMoved: number;
    staffProfilesMoved: number;
    directoryStaffMoved: number;
    customersMoved: number;
    leadsMoved: number;
    followUpsMoved: number;
    partnerCrmMoved: number;
    partnerTeamMoved: number;
    partnerFollowUpsMoved: number;
    partnerVerificationsMoved: number;
  };
  otherBrandsCleared: {
    opsRecordsRemoved: number;
    productSalesRemoved: number;
    partnerOperationalRemoved: number;
    propertiesRemoved: number;
    customersLeadsRemoved: number;
    nonIndiaPostStaffRemoved: number;
  };
  preservedSchemasIntact: {
    brandsCount: number;
    clientsCount: number;
    departmentsCount: number;
    partnerAccountsCount: number;
  };
}

function isIndiaPostBrandOrClient(brandId?: string, brandName?: string, clientId?: string): boolean {
  const bId = (brandId || '').trim().toLowerCase().replace(/_/g, '-');
  const bName = (brandName || '').trim().toLowerCase();
  const cId = (clientId || '').trim().toUpperCase();
  return (
    (!bId && !bName && (!cId || cId === 'CLIENT-INDIA-POST-KOTA')) ||
    bId === 'india-post' ||
    bName === 'india post' ||
    cId === 'CLIENT-INDIA-POST-KOTA'
  );
}

class DataConsolidationService {
  public previewConsolidationStatus(): ConsolidationPreviewSnapshot {
    const allProps = propertyRegistryService.getAllProperties();
    const allStaff = staffPermissionService.getAllStaffProfiles();
    const allCustomers = customerService.getCustomers();
    const allLeads = customerService.getLeads();
    const allReports = xpeedoOpsService.getWorkReports('ALL');
    const allProjects = xpeedoOpsService.getProjects('ALL');
    const allTasks = xpeedoOpsService.getTasks('ALL');
    const allSales = whiteLabelMasterService.getProductSales('ALL');
    const allPartnerTeam = partnerBrandService.getAllTeamMembersRaw();
    const indiaPostPartner = partnerBrandService
      .getAllPartnerAccounts()
      .find((a) => a.partnerSlug === 'india-post');
    const indiaPostPartnerId = indiaPostPartner?.id || 'PRT-INDIAPOST-01';

    let ipProps = 0;
    let otherProps = 0;
    allProps.forEach((p) => {
      if (isIndiaPostBrandOrClient(p.brandId, p.brandName, p.clientId)) ipProps += 1;
      else otherProps += 1;
    });

    let ipStaff = 0;
    let otherStaff = 0;
    allStaff.forEach((s) => {
      if (staffPermissionService.isSuperAdmin(s)) return;
      const bId = (s.brandId || '').trim().toLowerCase().replace(/_/g, '-');
      const org = (s.partnerOrganization || '').trim().toLowerCase();
      if (!bId || bId === 'india-post' || org === 'india post') ipStaff += 1;
      else otherStaff += 1;
    });

    let ipCust = 0;
    let otherCust = 0;
    allCustomers.forEach((c) => {
      if (isIndiaPostBrandOrClient(c.brandId, c.brandName)) ipCust += 1;
      else otherCust += 1;
    });

    let ipLeads = 0;
    let otherLeads = 0;
    allLeads.forEach((l) => {
      if (isIndiaPostBrandOrClient(l.brandId, l.brandName)) ipLeads += 1;
      else otherLeads += 1;
    });

    const ipReports = allReports.filter((r) => r.workspaceId === 'INDIA_POST').length;
    const otherReports = allReports.length - ipReports;
    const ipSales = allSales.filter((s) => s.workspaceKey === 'INDIA_POST').length;
    const otherSales = allSales.length - ipSales;
    const otherProjects = allProjects.filter((p) => p.workspaceId !== 'INDIA_POST').length;
    const otherTasks = allTasks.filter((t) => t.workspaceId !== 'INDIA_POST').length;

    const otherTeamNonOwner = allPartnerTeam.filter(
      (m) => m.partnerId !== indiaPostPartnerId && m.role !== 'PARTNER_OWNER'
    ).length;

    const partnerCrmCount = (() => {
      try {
        const raw = localStorage.getItem('xpeedo_partner_crm_customers_v1');
        if (!raw) return 0;
        const parsed = JSON.parse(raw) as Array<{ partnerId?: string; brandId?: string }>;
        return parsed.filter(
          (c) => c.partnerId !== indiaPostPartnerId && c.brandId !== 'BRD-INPOST-01'
        ).length;
      } catch {
        return 0;
      }
    })();

    const partnerFollowUpsCount = (() => {
      try {
        const raw = localStorage.getItem('xpeedo_brand_followups_v1');
        if (!raw) return 0;
        const parsed = JSON.parse(raw) as Array<{ partnerId?: string; brandId?: string }>;
        return parsed.filter(
          (f) => f.partnerId !== indiaPostPartnerId && f.brandId !== 'BRD-INPOST-01'
        ).length;
      } catch {
        return 0;
      }
    })();

    const partnerVerifCount = (() => {
      try {
        const raw = localStorage.getItem('xpeedo_brand_verifications_v1');
        if (!raw) return 0;
        const parsed = JSON.parse(raw) as Array<{ partnerId?: string; brandId?: string }>;
        return parsed.filter(
          (v) => v.partnerId !== indiaPostPartnerId && v.brandId !== 'BRD-INPOST-01'
        ).length;
      } catch {
        return 0;
      }
    })();

    let lastRunReport: ConsolidationExecutionResult | null = null;
    try {
      const rawReport = localStorage.getItem(CONSOLIDATION_REPORT_KEY);
      if (rawReport) lastRunReport = JSON.parse(rawReport) as ConsolidationExecutionResult;
    } catch {
      lastRunReport = null;
    }

    return {
      indiaPostCounts: {
        properties: ipProps,
        staff: ipStaff,
        customers: ipCust,
        leads: ipLeads,
        workReports: ipReports,
        sales: ipSales,
      },
      otherBrandsCounts: {
        properties: otherProps,
        staff: otherStaff,
        customers: otherCust,
        leads: otherLeads,
        projects: otherProjects,
        tasks: otherTasks,
        workReports: otherReports,
        sales: otherSales,
        partnerCrm: partnerCrmCount,
        partnerTeamNonOwner: otherTeamNonOwner,
        partnerFollowUps: partnerFollowUpsCount,
        partnerVerifications: partnerVerifCount,
      },
      hasExecutedInitialConsolidation: Boolean(localStorage.getItem(CONSOLIDATION_BOOT_KEY)),
      lastRunReport,
    };
  }

  /**
   * Step 1: Migrate all Property, Staff, Customer/Lead, and Partner CRM/FollowUp/Verification
   * records from non-India-Post brands into India Post safely without breaking schemas.
   */
  public consolidateOtherBrandsIntoIndiaPost(actorName = 'Master Admin'): {
    propertiesMoved: number;
    staffProfilesMoved: number;
    directoryStaffMoved: number;
    customersMoved: number;
    leadsMoved: number;
    followUpsMoved: number;
    partnerCrmMoved: number;
    partnerTeamMoved: number;
    partnerFollowUpsMoved: number;
    partnerVerificationsMoved: number;
  } {
    const propRes = propertyRegistryService.consolidateOtherBrandsIntoIndiaPost();
    const staffRes = staffPermissionService.consolidateOtherBrandsStaffIntoIndiaPost();
    const custRes = customerService.consolidateOtherBrandsIntoIndiaPost();
    const partnerRes = partnerBrandService.consolidateOtherBrandsRecordsIntoIndiaPost();

    xpeedoOpsService.logExternalActivity({
      actor: actorName,
      actorRole: 'MASTER_ADMIN',
      workspaceId: 'INDIA_POST',
      entityType: 'System',
      entityId: 'DATA_CONSOLIDATION',
      action: 'CONSOLIDATE_INTO_INDIA_POST',
      summary: `Consolidated ${propRes.migratedCount} properties, ${staffRes.profilesMoved} staff profiles, ${custRes.customersMoved} customers, ${custRes.leadsMoved} leads into India Post.`,
    });

    return {
      propertiesMoved: propRes.migratedCount + custRes.propertiesMoved,
      staffProfilesMoved: staffRes.profilesMoved,
      directoryStaffMoved: staffRes.directoryStaffMoved,
      customersMoved: custRes.customersMoved,
      leadsMoved: custRes.leadsMoved,
      followUpsMoved: custRes.followUpsMoved,
      partnerCrmMoved: partnerRes.crmCustomersMigrated,
      partnerTeamMoved: partnerRes.teamMembersMigrated,
      partnerFollowUpsMoved: partnerRes.followUpsMigrated,
      partnerVerificationsMoved: partnerRes.verificationsMigrated,
    };
  }

  /**
   * Step 2: Non-destructively clear sample/operational records ONLY for non-India-Post brands,
   * preserving all UI sections, brand owner profiles, partner accounts, stores, departments,
   * workflows, and RBAC rules intact.
   */
  public resetOtherBrandsOperationalData(actorName = 'Master Admin'): ConsolidationExecutionResult['otherBrandsCleared'] {
    const opsRes = xpeedoOpsService.resetNonIndiaPostOperationalRecords(actorName);
    const salesRes = whiteLabelMasterService.clearNonIndiaPostSales();
    const partnerRes = partnerBrandService.resetNonIndiaPostOperationalRecords();
    const propRes = propertyRegistryService.resetNonIndiaPostProperties();
    const custRes = customerService.resetNonIndiaPostRecords();
    const staffRes = staffPermissionService.resetNonIndiaPostOperationalStaff();

    const opsRecordsRemoved =
      opsRes.removedProjects +
      opsRes.removedTasks +
      opsRes.removedWorkReports +
      opsRes.removedFinanceEntries +
      opsRes.removedDocuments +
      opsRes.removedCommunications +
      opsRes.removedRequirements +
      opsRes.removedDeliverables;

    const partnerOperationalRemoved =
      partnerRes.removedTeamMembers +
      partnerRes.removedCrmCustomers +
      partnerRes.removedFollowUps +
      partnerRes.removedVerifications;

    return {
      opsRecordsRemoved,
      productSalesRemoved: salesRes.removedSales,
      partnerOperationalRemoved,
      propertiesRemoved: propRes.removedCount,
      customersLeadsRemoved: custRes.removedCustomers + custRes.removedLeads + custRes.removedFollowUps,
      nonIndiaPostStaffRemoved: staffRes.removedProfiles + staffRes.removedDirectory,
    };
  }

  public consolidateAndResetNonIndiaPostBrands(actorName = 'Master Admin'): ConsolidationExecutionResult {
    const consolidatedIntoIndiaPost = this.consolidateOtherBrandsIntoIndiaPost(actorName);
    const otherBrandsCleared = this.resetOtherBrandsOperationalData(actorName);

    const result: ConsolidationExecutionResult = {
      executedAt: new Date().toISOString(),
      actorName,
      consolidatedIntoIndiaPost,
      otherBrandsCleared,
      preservedSchemasIntact: {
        brandsCount: brandOwnerService.getAllBrandProfiles().length,
        clientsCount: xpeedoOpsService.getClients().length,
        departmentsCount: xpeedoOpsService.getDepartments('ALL').length,
        partnerAccountsCount: partnerBrandService.getAllPartnerAccounts().length,
      },
    };

    try {
      localStorage.setItem(CONSOLIDATION_BOOT_KEY, result.executedAt);
      localStorage.setItem(CONSOLIDATION_REPORT_KEY, JSON.stringify(result));
    } catch {
      // ignore storage quota errors
    }

    return result;
  }

  public runInitialConsolidationAndBrandResetIfNeeded(): ConsolidationExecutionResult | null {
    try {
      if (localStorage.getItem(CONSOLIDATION_BOOT_KEY)) {
        return null;
      }
      return this.consolidateAndResetNonIndiaPostBrands('System Migration');
    } catch {
      return null;
    }
  }
}

export const dataConsolidationService = new DataConsolidationService();
