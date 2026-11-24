import {
  ALL_GRANULAR_ACTIONS,
  ClusterMasterRecord,
  DynamicOfficeRecord,
  GranularPermissionAction,
  GranularPermissionMatrix,
  KotaModuleKey,
  OfficialPostConfig,
  OfficialPostType,
  OrgHierarchyLevel,
  OrgHierarchyNode,
  StaffProfile,
} from '../types/models';
import { staffPermissionService } from './staffPermissionService';
import { featureVisibilityService } from './featureVisibilityService';

const ORG_HIERARCHY_KEY = 'kota_os_org_hierarchy_v1';
const CLUSTERS_KEY = 'kota_os_clusters_v1';
const POST_CONFIGS_KEY = 'kota_os_official_posts_v1';
const USER_GRANULAR_PERM_KEY = 'kota_os_user_granular_perms_v1';
const GOVERNANCE_AUDIT_KEY = 'kota_os_governance_audit_v1';

export interface GovernanceAuditEntry {
  id: string;
  timestamp: string;
  performedBy: string;
  actorRole: string;
  action: string;
  target: string;
  details: string;
}

export const KOTA_MODULES_META: Array<{ key: KotaModuleKey; label: string; description: string }> = [
  { key: 'orgHierarchy', label: 'Org Hierarchy & Offices', description: 'Circle, Region, Division, Subdivision, HPO, SO & BO nodes' },
  { key: 'locationIntelligence', label: 'Location Intelligence', description: 'Locality, Colony, Sector/Block, Street & Map Explorer' },
  { key: 'houseMaster', label: 'House Master & Properties', description: 'Unique House ID, Floor/Unit & Consent Registry' },
  { key: 'customerMaster', label: 'Customer Master & 360', description: 'Citizen Profiles, Family Links & Service Holdings' },
  { key: 'doorstepSurveys', label: 'Doorstep Surveys', description: '7-stage Survey Draft, GPS, Submission & Verification' },
  { key: 'leadsPool', label: 'Leads Pool & Clusters', description: 'Central Division Pool, Marketing Triage & Cluster Assignment' },
  { key: 'tasksAndBeats', label: 'Tasks & Last Mile Beats', description: 'House-linked Field Tasks, Beats & Daily Articles' },
  { key: 'vendorOperations', label: 'Vendor Operations', description: 'India Post White-Label & Scoped Partner Workspaces' },
  { key: 'dataGovernance', label: 'Data Import/Export & Backup', description: 'UTF-8 BOM CSV/XLSX, Controlled Import & Verified Restore' },
  { key: 'adminControlCenter', label: 'Master Admin Control Center', description: 'Official Posts, 13-Action Matrix & Visibility Toggles' },
];

function buildMatrix(
  overrides: Partial<Record<KotaModuleKey, GranularPermissionAction[]>>
): GranularPermissionMatrix {
  const modules: KotaModuleKey[] = [
    'orgHierarchy',
    'locationIntelligence',
    'houseMaster',
    'customerMaster',
    'doorstepSurveys',
    'leadsPool',
    'tasksAndBeats',
    'vendorOperations',
    'dataGovernance',
    'adminControlCenter',
  ];
  const matrix = {} as GranularPermissionMatrix;
  for (const mod of modules) {
    const allowed = new Set(overrides[mod] || []);
    const row: Partial<Record<GranularPermissionAction, boolean>> = {};
    for (const act of ALL_GRANULAR_ACTIONS) {
      row[act] = allowed.has(act);
    }
    matrix[mod] = row;
  }
  return matrix;
}

const FULL_ACCESS_MATRIX = buildMatrix({
  orgHierarchy: ALL_GRANULAR_ACTIONS,
  locationIntelligence: ALL_GRANULAR_ACTIONS,
  houseMaster: ALL_GRANULAR_ACTIONS,
  customerMaster: ALL_GRANULAR_ACTIONS,
  doorstepSurveys: ALL_GRANULAR_ACTIONS,
  leadsPool: ALL_GRANULAR_ACTIONS,
  tasksAndBeats: ALL_GRANULAR_ACTIONS,
  vendorOperations: ALL_GRANULAR_ACTIONS,
  dataGovernance: ALL_GRANULAR_ACTIONS,
  adminControlCenter: ALL_GRANULAR_ACTIONS,
});

export const DEFAULT_OFFICIAL_POSTS: OfficialPostConfig[] = [
  {
    id: 'POST-OWNER',
    postTitle: 'Owner',
    defaultRoleKey: 'OWNER',
    defaultWorkspacePath: '/dashboard',
    hierarchyRank: 1,
    isPostalCadre: false,
    defaultModuleMatrix: FULL_ACCESS_MATRIX,
  },
  {
    id: 'POST-MASTER-ADMIN',
    postTitle: 'Master Admin',
    defaultRoleKey: 'MASTER_ADMIN',
    defaultWorkspacePath: '/dashboard',
    hierarchyRank: 1,
    isPostalCadre: false,
    defaultModuleMatrix: FULL_ACCESS_MATRIX,
  },
  {
    id: 'POST-DEVELOPER',
    postTitle: 'Developer',
    defaultRoleKey: 'DEVELOPER',
    defaultWorkspacePath: '/role-access-dashboard',
    hierarchyRank: 1,
    isPostalCadre: false,
    defaultModuleMatrix: FULL_ACCESS_MATRIX,
  },
  {
    id: 'POST-DIV-HEAD',
    postTitle: 'Divisional Head',
    defaultRoleKey: 'DIVISIONAL_HEAD',
    defaultWorkspacePath: '/dashboard',
    hierarchyRank: 2,
    isPostalCadre: true,
    defaultModuleMatrix: FULL_ACCESS_MATRIX,
  },
  {
    id: 'POST-ASST-DIV-ADMIN',
    postTitle: 'Assistant Divisional Admin',
    defaultRoleKey: 'ASST_DIVISIONAL_ADMIN',
    defaultWorkspacePath: '/dashboard',
    hierarchyRank: 3,
    isPostalCadre: true,
    defaultModuleMatrix: buildMatrix({
      orgHierarchy: ['view', 'create', 'edit', 'update', 'assign', 'export', 'print'],
      locationIntelligence: ['view', 'create', 'edit', 'update', 'export', 'import', 'print'],
      houseMaster: ['view', 'create', 'edit', 'update', 'approve', 'reject', 'export', 'import', 'print'],
      customerMaster: ['view', 'create', 'edit', 'update', 'approve', 'export', 'print'],
      doorstepSurveys: ['view', 'assign', 'reassign', 'approve', 'reject', 'export', 'print'],
      leadsPool: ['view', 'create', 'edit', 'assign', 'reassign', 'export'],
      tasksAndBeats: ['view', 'create', 'edit', 'assign', 'reassign', 'approve', 'export'],
      vendorOperations: ['view', 'configure'],
      dataGovernance: ['view', 'export', 'import', 'print'],
      adminControlCenter: ['view'],
    }),
  },
  {
    id: 'POST-SUBDIV-INC',
    postTitle: 'Subdivision Incharge',
    defaultRoleKey: 'SUBDIVISION_INCHARGE',
    defaultWorkspacePath: '/dashboard',
    hierarchyRank: 4,
    isPostalCadre: true,
    defaultModuleMatrix: buildMatrix({
      orgHierarchy: ['view', 'edit', 'update', 'export'],
      locationIntelligence: ['view', 'create', 'edit', 'update', 'export'],
      houseMaster: ['view', 'create', 'edit', 'update', 'approve', 'reject', 'export', 'print'],
      customerMaster: ['view', 'create', 'edit', 'update', 'export', 'print'],
      doorstepSurveys: ['view', 'assign', 'reassign', 'approve', 'reject', 'export', 'print'],
      leadsPool: ['view', 'assign', 'reassign', 'export'],
      tasksAndBeats: ['view', 'create', 'edit', 'assign', 'reassign', 'approve', 'export'],
      vendorOperations: ['view'],
      dataGovernance: ['view', 'export', 'print'],
      adminControlCenter: ['view'],
    }),
  },
  {
    id: 'POST-CLUSTER-INC',
    postTitle: 'Cluster Incharge',
    defaultRoleKey: 'CLUSTER_INCHARGE',
    defaultWorkspacePath: '/leads',
    hierarchyRank: 5,
    isPostalCadre: true,
    defaultModuleMatrix: buildMatrix({
      orgHierarchy: ['view'],
      locationIntelligence: ['view', 'create', 'edit'],
      houseMaster: ['view', 'create', 'edit', 'update', 'approve', 'reject'],
      customerMaster: ['view', 'create', 'edit', 'update'],
      doorstepSurveys: ['view', 'assign', 'reassign', 'approve', 'reject'],
      leadsPool: ['view', 'assign', 'reassign', 'update'],
      tasksAndBeats: ['view', 'create', 'assign', 'reassign'],
      dataGovernance: ['view', 'export'],
    }),
  },
  {
    id: 'POST-MARKETING',
    postTitle: 'Marketing Team',
    defaultRoleKey: 'MARKETING_TEAM',
    defaultWorkspacePath: '/leads',
    hierarchyRank: 5,
    isPostalCadre: false,
    defaultModuleMatrix: buildMatrix({
      locationIntelligence: ['view'],
      houseMaster: ['view'],
      customerMaster: ['view', 'create', 'edit'],
      leadsPool: ['view', 'create', 'edit', 'update', 'assign', 'export'],
      dataGovernance: ['view', 'export'],
    }),
  },
  {
    id: 'POST-LAST-MILE-SUP',
    postTitle: 'Last Mile Supervisor',
    defaultRoleKey: 'LAST_MILE_SUPERVISOR',
    defaultWorkspacePath: '/doorstep-surveys',
    hierarchyRank: 5,
    isPostalCadre: true,
    defaultModuleMatrix: buildMatrix({
      orgHierarchy: ['view'],
      locationIntelligence: ['view', 'create', 'edit', 'update'],
      houseMaster: ['view', 'create', 'edit', 'update', 'approve', 'reject'],
      customerMaster: ['view', 'edit', 'update'],
      doorstepSurveys: ['view', 'assign', 'reassign', 'approve', 'reject', 'export'],
      tasksAndBeats: ['view', 'create', 'edit', 'assign', 'reassign', 'approve', 'export'],
      dataGovernance: ['view', 'export'],
    }),
  },
  {
    id: 'POST-POSTMASTER',
    postTitle: 'Postmaster',
    defaultRoleKey: 'POSTMASTER',
    defaultWorkspacePath: '/dashboard',
    hierarchyRank: 5,
    isPostalCadre: true,
    defaultModuleMatrix: buildMatrix({
      orgHierarchy: ['view'],
      locationIntelligence: ['view', 'create', 'edit', 'update'],
      houseMaster: ['view', 'create', 'edit', 'update', 'approve', 'reject', 'print'],
      customerMaster: ['view', 'create', 'edit', 'update', 'print'],
      doorstepSurveys: ['view', 'assign', 'approve', 'reject', 'print'],
      leadsPool: ['view', 'create', 'update', 'assign'],
      tasksAndBeats: ['view', 'create', 'edit', 'assign', 'approve', 'print'],
      vendorOperations: ['view'],
      dataGovernance: ['view', 'export', 'print'],
    }),
  },
  {
    id: 'POST-ASST-POSTMASTER',
    postTitle: 'Assistant Postmaster',
    defaultRoleKey: 'ASST_POSTMASTER',
    defaultWorkspacePath: '/dashboard',
    hierarchyRank: 6,
    isPostalCadre: true,
    defaultModuleMatrix: buildMatrix({
      orgHierarchy: ['view'],
      locationIntelligence: ['view', 'create', 'edit'],
      houseMaster: ['view', 'create', 'edit', 'update', 'approve'],
      customerMaster: ['view', 'create', 'edit', 'update'],
      doorstepSurveys: ['view', 'assign', 'approve', 'reject'],
      leadsPool: ['view', 'create', 'update'],
      tasksAndBeats: ['view', 'create', 'edit', 'assign'],
      dataGovernance: ['view', 'export', 'print'],
    }),
  },
  {
    id: 'POST-SUB-POSTMASTER',
    postTitle: 'Sub Postmaster',
    defaultRoleKey: 'SUB_POSTMASTER',
    defaultWorkspacePath: '/dashboard',
    hierarchyRank: 6,
    isPostalCadre: true,
    defaultModuleMatrix: buildMatrix({
      orgHierarchy: ['view'],
      locationIntelligence: ['view', 'create', 'edit'],
      houseMaster: ['view', 'create', 'edit', 'update', 'approve', 'reject'],
      customerMaster: ['view', 'create', 'edit', 'update', 'print'],
      doorstepSurveys: ['view', 'assign', 'approve', 'reject', 'print'],
      leadsPool: ['view', 'create', 'update'],
      tasksAndBeats: ['view', 'create', 'edit', 'assign', 'approve'],
      dataGovernance: ['view', 'export', 'print'],
    }),
  },
  {
    id: 'POST-BPM',
    postTitle: 'BPM',
    defaultRoleKey: 'BPM',
    defaultWorkspacePath: '/properties',
    hierarchyRank: 7,
    isPostalCadre: true,
    defaultModuleMatrix: buildMatrix({
      houseMaster: ['view', 'create', 'edit', 'update'],
      customerMaster: ['view', 'create', 'edit', 'update'],
      doorstepSurveys: ['view', 'create', 'edit', 'update'],
      tasksAndBeats: ['view', 'update'],
    }),
  },
  {
    id: 'POST-ABPM',
    postTitle: 'ABPM',
    defaultRoleKey: 'ABPM',
    defaultWorkspacePath: '/properties',
    hierarchyRank: 8,
    isPostalCadre: true,
    defaultModuleMatrix: buildMatrix({
      houseMaster: ['view', 'create', 'edit'],
      customerMaster: ['view', 'create', 'edit'],
      doorstepSurveys: ['view', 'create', 'update'],
      tasksAndBeats: ['view', 'update'],
    }),
  },
  {
    id: 'POST-POSTMAN',
    postTitle: 'Postman',
    defaultRoleKey: 'POSTMAN',
    defaultWorkspacePath: '/properties',
    hierarchyRank: 8,
    isPostalCadre: true,
    defaultModuleMatrix: buildMatrix({
      houseMaster: ['view', 'create', 'edit', 'update'],
      customerMaster: ['view', 'create', 'edit', 'update'],
      doorstepSurveys: ['view', 'create', 'edit', 'update'],
      tasksAndBeats: ['view', 'update'],
    }),
  },
  {
    id: 'POST-GDS',
    postTitle: 'GDS',
    defaultRoleKey: 'GDS',
    defaultWorkspacePath: '/properties',
    hierarchyRank: 8,
    isPostalCadre: true,
    defaultModuleMatrix: buildMatrix({
      houseMaster: ['view', 'create', 'edit', 'update'],
      customerMaster: ['view', 'create', 'edit', 'update'],
      doorstepSurveys: ['view', 'create', 'edit', 'update'],
      tasksAndBeats: ['view', 'update'],
    }),
  },
  {
    id: 'POST-MAIL-GUARD',
    postTitle: 'Mail Guard',
    defaultRoleKey: 'MAIL_GUARD',
    defaultWorkspacePath: '/tasks',
    hierarchyRank: 8,
    isPostalCadre: true,
    defaultModuleMatrix: buildMatrix({
      tasksAndBeats: ['view', 'update'],
      houseMaster: ['view'],
      customerMaster: ['view'],
    }),
  },
  {
    id: 'POST-MTS',
    postTitle: 'MTS',
    defaultRoleKey: 'MTS',
    defaultWorkspacePath: '/tasks',
    hierarchyRank: 9,
    isPostalCadre: true,
    defaultModuleMatrix: buildMatrix({
      tasksAndBeats: ['view', 'update'],
      houseMaster: ['view'],
      customerMaster: ['view'],
    }),
  },
  {
    id: 'POST-DEO',
    postTitle: 'DEO',
    defaultRoleKey: 'DEO',
    defaultWorkspacePath: '/location-intelligence',
    hierarchyRank: 8,
    isPostalCadre: false,
    defaultModuleMatrix: buildMatrix({
      locationIntelligence: ['view', 'create', 'edit', 'update'],
      houseMaster: ['view', 'create', 'edit', 'update'],
      customerMaster: ['view', 'create', 'edit', 'update'],
      dataGovernance: ['view', 'import', 'export'],
    }),
  },
  {
    id: 'POST-VENDOR',
    postTitle: 'Vendor',
    defaultRoleKey: 'VENDOR',
    defaultWorkspacePath: '/vendor-ecosystem',
    hierarchyRank: 9,
    isPostalCadre: false,
    defaultModuleMatrix: buildMatrix({
      vendorOperations: ['view', 'create', 'edit', 'update'],
      leadsPool: ['view', 'create', 'update'],
      dataGovernance: ['view', 'export'],
    }),
  },
];

function buildInitialHierarchyFromOffices(offices: DynamicOfficeRecord[]): OrgHierarchyNode[] {
  const now = new Date().toISOString();
  const base: OrgHierarchyNode[] = [
    {
      id: 'ORG-CIR-RAJ',
      code: 'RAJ-CIRCLE',
      name: 'Rajasthan Postal Circle',
      level: 'CIRCLE',
      status: 'ACTIVE',
      updatedAt: now,
    },
    {
      id: 'ORG-REG-AJM',
      code: 'AJM-REGION',
      name: 'Southern / Ajmer Region (Configurable)',
      level: 'REGION',
      parentId: 'ORG-CIR-RAJ',
      status: 'CONFIGURABLE',
      updatedAt: now,
    },
    {
      id: 'ORG-DIV-KOTA',
      code: 'KOTA-DIV',
      name: 'Kota Division',
      level: 'DIVISION',
      parentId: 'ORG-REG-AJM',
      status: 'ACTIVE',
      updatedAt: now,
    },
    {
      id: 'ORG-SUBDIV-KOTA-S',
      code: 'KOTA-SOUTH-SD',
      name: 'Kota South Subdivision (Configurable)',
      level: 'SUBDIVISION',
      parentId: 'ORG-DIV-KOTA',
      status: 'CONFIGURABLE',
      updatedAt: now,
    },
    {
      id: 'ORG-SUBDIV-KOTA-N',
      code: 'KOTA-NORTH-SD',
      name: 'Kota North Subdivision (Configurable)',
      level: 'SUBDIVISION',
      parentId: 'ORG-DIV-KOTA',
      status: 'CONFIGURABLE',
      updatedAt: now,
    },
  ];

  // Merge verified/existing office masters dynamically without inventing postal data
  const seenIds = new Set(base.map((n) => n.id));
  offices.forEach((off) => {
    const level: OrgHierarchyLevel =
      off.officeType === 'HO' || off.officeType === 'H.O.'
        ? 'HPO'
        : off.officeType === 'BO' || off.officeType === 'B.O.'
        ? 'BO'
        : 'SO';
    const nodeId = `ORG-OFF-${off.officeId || off.id}`;
    if (seenIds.has(nodeId)) return;
    seenIds.add(nodeId);
    base.push({
      id: nodeId,
      code: off.officeId || off.id,
      name: off.officeName,
      level,
      parentId: 'ORG-SUBDIV-KOTA-S',
      pincode: off.pincode,
      inchargeName: off.assignedInchargeName || off.pincodeManager,
      vendorId: 'INDIA_POST',
      status: 'ACTIVE',
      updatedAt: off.updatedAt || now,
    });
  });

  return base;
}

class KotaOsHierarchyService {
  private hierarchy: OrgHierarchyNode[] = [];
  private clusters: ClusterMasterRecord[] = [];
  private postConfigs: OfficialPostConfig[] = [];
  private userGranularOverrides: Record<string, Partial<GranularPermissionMatrix>> = {};
  private auditLogs: GovernanceAuditEntry[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    try {
      const rawHierarchy = localStorage.getItem(ORG_HIERARCHY_KEY);
      if (rawHierarchy) {
        this.hierarchy = JSON.parse(rawHierarchy);
      } else {
        this.hierarchy = buildInitialHierarchyFromOffices(staffPermissionService.getDynamicOffices());
        localStorage.setItem(ORG_HIERARCHY_KEY, JSON.stringify(this.hierarchy));
      }

      const rawClusters = localStorage.getItem(CLUSTERS_KEY);
      if (rawClusters) {
        this.clusters = JSON.parse(rawClusters);
      } else {
        this.clusters = [
          {
            id: 'CLU-KOTA-WEST',
            name: 'Kota West Cluster (Configurable)',
            division: 'Kota Division',
            subdivisionId: 'ORG-SUBDIV-KOTA-S',
            officeIds: ['DADABARI_SO'],
            pincodes: ['324009'],
            status: 'ACTIVE',
            updatedAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(CLUSTERS_KEY, JSON.stringify(this.clusters));
      }

      const rawPosts = localStorage.getItem(POST_CONFIGS_KEY);
      if (rawPosts) {
        this.postConfigs = JSON.parse(rawPosts);
      } else {
        this.postConfigs = JSON.parse(JSON.stringify(DEFAULT_OFFICIAL_POSTS));
        localStorage.setItem(POST_CONFIGS_KEY, JSON.stringify(this.postConfigs));
      }

      const rawUserPerms = localStorage.getItem(USER_GRANULAR_PERM_KEY);
      this.userGranularOverrides = rawUserPerms ? JSON.parse(rawUserPerms) : {};

      const rawAudit = localStorage.getItem(GOVERNANCE_AUDIT_KEY);
      this.auditLogs = rawAudit ? JSON.parse(rawAudit) : [];
    } catch {
      this.hierarchy = buildInitialHierarchyFromOffices([]);
      this.clusters = [];
      this.postConfigs = JSON.parse(JSON.stringify(DEFAULT_OFFICIAL_POSTS));
      this.userGranularOverrides = {};
      this.auditLogs = [];
    }
  }

  private saveAndNotify(): void {
    try {
      localStorage.setItem(ORG_HIERARCHY_KEY, JSON.stringify(this.hierarchy));
      localStorage.setItem(CLUSTERS_KEY, JSON.stringify(this.clusters));
      localStorage.setItem(POST_CONFIGS_KEY, JSON.stringify(this.postConfigs));
      localStorage.setItem(USER_GRANULAR_PERM_KEY, JSON.stringify(this.userGranularOverrides));
      localStorage.setItem(GOVERNANCE_AUDIT_KEY, JSON.stringify(this.auditLogs));
    } catch (e) {
      console.warn('KotaOsHierarchyService persist failed:', e);
    }
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public recordGovernanceAudit(
    performedBy: string,
    actorRole: string,
    action: string,
    target: string,
    details: string
  ): void {
    this.auditLogs.unshift({
      id: `GOV-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      performedBy,
      actorRole,
      action,
      target,
      details,
    });
    if (this.auditLogs.length > 300) {
      this.auditLogs = this.auditLogs.slice(0, 300);
    }
    this.saveAndNotify();
  }

  public getGovernanceAuditLogs(): GovernanceAuditEntry[] {
    return this.auditLogs;
  }

  // ORG HIERARCHY CRUD
  public getOrgHierarchyNodes(): OrgHierarchyNode[] {
    return this.hierarchy;
  }

  public upsertOrgNode(
    node: Omit<OrgHierarchyNode, 'id' | 'updatedAt'> & { id?: string },
    performedBy = 'MASTER_ADMIN',
    actorRole = 'MASTER_ADMIN'
  ): OrgHierarchyNode {
    const now = new Date().toISOString();
    const id = node.id || `ORG-${node.level}-${Date.now().toString(36).toUpperCase()}`;
    const existingIdx = this.hierarchy.findIndex((n) => n.id === id);
    const saved: OrgHierarchyNode = {
      ...node,
      id,
      updatedAt: now,
    };
    if (existingIdx >= 0) {
      this.hierarchy[existingIdx] = saved;
    } else {
      this.hierarchy.unshift(saved);
    }
    this.recordGovernanceAudit(
      performedBy,
      actorRole,
      existingIdx >= 0 ? 'UPDATE_ORG_NODE' : 'CREATE_ORG_NODE',
      saved.name,
      `${saved.level} (${saved.code}) ${saved.pincode ? `PIN ${saved.pincode}` : ''}`
    );
    return saved;
  }

  // CLUSTERS CRUD & BOUNDARY ENFORCEMENT
  public getClusters(): ClusterMasterRecord[] {
    return this.clusters;
  }

  public upsertCluster(
    cluster: Omit<ClusterMasterRecord, 'id' | 'updatedAt'> & { id?: string },
    performedBy = 'MASTER_ADMIN'
  ): ClusterMasterRecord {
    const id = cluster.id || `CLU-${Date.now().toString(36).toUpperCase()}`;
    const saved: ClusterMasterRecord = {
      ...cluster,
      id,
      updatedAt: new Date().toISOString(),
    };
    const idx = this.clusters.findIndex((c) => c.id === id);
    if (idx >= 0) {
      this.clusters[idx] = saved;
    } else {
      this.clusters.unshift(saved);
    }
    this.recordGovernanceAudit(
      performedBy,
      'ADMIN',
      idx >= 0 ? 'UPDATE_CLUSTER' : 'CREATE_CLUSTER',
      saved.name,
      `Offices: ${saved.officeIds.length}, PINs: ${saved.pincodes.join(', ') || 'None'}`
    );
    return saved;
  }

  public canReassignLeadInCluster(
    actor: StaffProfile | null | undefined,
    targetClusterId?: string
  ): { allowed: boolean; reason: string } {
    if (!actor) return { allowed: false, reason: 'Unauthenticated user.' };
    if (featureVisibilityService.isPlatformSuperUser(actor)) {
      return { allowed: true, reason: 'Platform Super Admin / Owner full authorization.' };
    }
    const role = (actor.role || '').toUpperCase();
    if (role === 'DIVISIONAL_HEAD' || role === 'ASST_DIVISIONAL_ADMIN' || role === 'ADMIN') {
      return { allowed: true, reason: 'Divisional leadership authorization.' };
    }
    if (role === 'CLUSTER_INCHARGE') {
      if (!actor.clusterId) {
        return { allowed: false, reason: 'Cluster Incharge has no assigned cluster configured.' };
      }
      if (!targetClusterId || targetClusterId === actor.clusterId) {
        return { allowed: true, reason: `Authorized within assigned cluster ${actor.clusterId}.` };
      }
      return {
        allowed: false,
        reason: `Cluster isolation violation: Cluster Incharge (${actor.clusterId}) cannot assign/reassign leads outside their cluster (${targetClusterId}).`,
      };
    }
    if (role === 'SUBDIVISION_INCHARGE' || role === 'MARKETING_TEAM') {
      return { allowed: true, reason: `${role} pool assignment allowed within scope.` };
    }
    return {
      allowed: false,
      reason: `Role ${role} does not hold lead reassignment privileges.`,
    };
  }

  // OFFICIAL POSTS & 13-ACTION GRANULAR MATRIX
  public getOfficialPosts(): OfficialPostConfig[] {
    return this.postConfigs;
  }

  public resolveOfficialPostForUser(user: StaffProfile | null | undefined): OfficialPostType | string {
    if (!user) return 'Postman';
    if (user.officialPost) return user.officialPost;
    const role = (user.role || '').toUpperCase();
    const matchByRole = this.postConfigs.find((p) => p.defaultRoleKey.toUpperCase() === role);
    if (matchByRole) return matchByRole.postTitle;
    const desig = (user.designationType || user.designation || '').toLowerCase();
    if (desig.includes('gds') || desig.includes('dak sevak')) return 'GDS';
    if (desig.includes('abpm')) return 'ABPM';
    if (desig.includes('bpm')) return 'BPM';
    if (desig.includes('postman')) return 'Postman';
    if (desig.includes('postmaster') || desig.includes('spm')) return 'Sub Postmaster';
    return 'Postman';
  }

  public setPostModulePermission(
    postId: string,
    moduleKey: KotaModuleKey,
    action: GranularPermissionAction,
    allowed: boolean,
    performedBy = 'MASTER_ADMIN'
  ): void {
    const idx = this.postConfigs.findIndex((p) => p.id === postId);
    if (idx < 0) return;
    const post = this.postConfigs[idx];
    post.defaultModuleMatrix = {
      ...post.defaultModuleMatrix,
      [moduleKey]: {
        ...(post.defaultModuleMatrix[moduleKey] || {}),
        [action]: allowed,
      },
    };
    this.recordGovernanceAudit(
      performedBy,
      'MASTER_ADMIN',
      'UPDATE_POST_PERMISSION',
      `${post.postTitle} · ${moduleKey}`,
      `${action} -> ${allowed ? 'ALLOW' : 'DENY'}`
    );
  }

  public setUserGranularOverride(
    userEmailOrId: string,
    moduleKey: KotaModuleKey,
    action: GranularPermissionAction,
    allowed: boolean,
    performedBy = 'MASTER_ADMIN'
  ): void {
    const key = userEmailOrId.trim().toLowerCase();
    if (!key) return;
    const existing = this.userGranularOverrides[key] || {};
    this.userGranularOverrides[key] = {
      ...existing,
      [moduleKey]: {
        ...(existing[moduleKey] || {}),
        [action]: allowed,
      },
    };
    this.recordGovernanceAudit(
      performedBy,
      'MASTER_ADMIN',
      'USER_GRANULAR_OVERRIDE',
      `${key} · ${moduleKey}`,
      `${action} -> ${allowed ? 'ALLOW' : 'DENY'}`
    );
  }

  public hasActionPermission(
    user: StaffProfile | null | undefined,
    moduleKey: KotaModuleKey,
    action: GranularPermissionAction
  ): boolean {
    if (!user) return false;
    if (featureVisibilityService.isPlatformSuperUser(user)) return true;

    const userKey = (user.email || user.employeeId || user.id || '').trim().toLowerCase();
    const override = this.userGranularOverrides[userKey]?.[moduleKey]?.[action];
    if (typeof override === 'boolean') return override;

    const inlineOverride = user.granularPermissions?.[moduleKey]?.[action];
    if (typeof inlineOverride === 'boolean') return inlineOverride;

    const postTitle = this.resolveOfficialPostForUser(user);
    const postCfg =
      this.postConfigs.find((p) => p.postTitle === postTitle) ||
      this.postConfigs.find((p) => p.defaultRoleKey.toUpperCase() === (user.role || '').toUpperCase());

    if (postCfg) {
      return Boolean(postCfg.defaultModuleMatrix[moduleKey]?.[action]);
    }
    return action === 'view';
  }

  public getDefaultWorkspacePath(user: StaffProfile | null | undefined): string {
    if (!user) return '/login';
    if (featureVisibilityService.isPlatformSuperUser(user)) return '/dashboard';
    // Respect strict Postman/GDS default restriction: Property & Members only
    if (featureVisibilityService.isPostmanOrGdsProfile(user)) {
      return '/properties';
    }
    const postTitle = this.resolveOfficialPostForUser(user);
    const postCfg = this.postConfigs.find((p) => p.postTitle === postTitle);
    const candidate = postCfg?.defaultWorkspacePath || '/dashboard';
    // Verify candidate feature is actually visible to user; otherwise fallback cleanly
    const feat = featureVisibilityService.mapPathToFeature(candidate);
    if (feat && !featureVisibilityService.isFeatureVisible(user, feat)) {
      if (featureVisibilityService.isFeatureVisible(user, 'property')) return '/properties';
      if (featureVisibilityService.isFeatureVisible(user, 'members')) return '/customers';
      return '/dashboard';
    }
    return candidate;
  }

  public exportState(): {
    hierarchy: OrgHierarchyNode[];
    clusters: ClusterMasterRecord[];
    postConfigs: OfficialPostConfig[];
    userGranularOverrides: Record<string, Partial<GranularPermissionMatrix>>;
    auditLogs: GovernanceAuditEntry[];
  } {
    return {
      hierarchy: this.hierarchy,
      clusters: this.clusters,
      postConfigs: this.postConfigs,
      userGranularOverrides: this.userGranularOverrides,
      auditLogs: this.auditLogs,
    };
  }

  public restoreState(bundle: {
    hierarchy?: OrgHierarchyNode[];
    clusters?: ClusterMasterRecord[];
    postConfigs?: OfficialPostConfig[];
    userGranularOverrides?: Record<string, Partial<GranularPermissionMatrix>>;
    auditLogs?: GovernanceAuditEntry[];
  }): void {
    if (Array.isArray(bundle.hierarchy)) this.hierarchy = bundle.hierarchy;
    if (Array.isArray(bundle.clusters)) this.clusters = bundle.clusters;
    if (Array.isArray(bundle.postConfigs)) this.postConfigs = bundle.postConfigs;
    if (bundle.userGranularOverrides) this.userGranularOverrides = bundle.userGranularOverrides;
    if (Array.isArray(bundle.auditLogs)) this.auditLogs = bundle.auditLogs;
    this.saveAndNotify();
  }
}

export const kotaOsHierarchyService = new KotaOsHierarchyService();
