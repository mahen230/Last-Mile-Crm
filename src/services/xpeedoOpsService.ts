import { doc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { StaffProfile } from '../types/models';
import {
  ClientCommunicationEntry,
  ClientDeliverableEntry,
  ClientRequirementEntry,
  AutomationWorkflow,
  IndiaPostAttendanceEntry,
  IndiaPostSrmTicket,
  MigrationImportLog,
  OpsActivityLog,
  OpsDepartment,
  OpsDocumentEntry,
  OpsFinanceEntry,
  OpsNotification,
  OpsProject,
  OpsTask,
  OpsTaskStatus,
  PlatformRbacRole,
  RbacCapabilityKey,
  RolePermissionMatrix,
  SrmTicketCategory,
  SrmTicketPriority,
  SrmTicketStatus,
  WorkReport,
  WorkReportPeriod,
  WorkflowExecutionLog,
  WorkspaceClient,
} from '../types/xpeedoOps';

const STORAGE_KEY = 'xpeedo_it_ops_state_v1';

export const PLATFORM_RBAC_ROLE_META: Record<
  PlatformRbacRole,
  { label: string; scopeSummary: string; defaultWorkspace?: string }
> = {
  OWNER_SUPER_ADMIN: {
    label: 'Owner / Super Admin',
    scopeSummary: 'Full platform command across all clients, workspaces, approvals, and RBAC.',
  },
  BUSINESS_ADMIN: {
    label: 'Business Admin',
    scopeSummary: 'Cross-workspace client, department, finance, workflow, and reporting control.',
  },
  CLIENT_ADMIN: {
    label: 'Client Admin',
    scopeSummary: 'Full control restricted strictly to assigned client workspace.',
  },
  PROJECT_MANAGER: {
    label: 'Project Manager',
    scopeSummary: 'Projects, tasks, milestones, and tier-2 work report approvals within assigned workspace.',
  },
  DEPARTMENT_MANAGER: {
    label: 'Department Manager',
    scopeSummary: 'Department tasks, team allocation, and operational execution within assigned department.',
  },
  TEAM_LEADER: {
    label: 'Team Leader',
    scopeSummary: 'Task execution supervision and tier-1 Team Leader work report approval.',
  },
  EMPLOYEE: {
    label: 'Employee',
    scopeSummary: 'Assigned tasks, time tracking, and Daily/Weekly/Monthly work report submission.',
  },
  VIEWER: {
    label: 'Viewer',
    scopeSummary: 'Read-only visibility across permitted workspace dashboards and reports.',
  },
};

export const ALL_PLATFORM_ROLES: PlatformRbacRole[] = [
  'OWNER_SUPER_ADMIN',
  'BUSINESS_ADMIN',
  'CLIENT_ADMIN',
  'PROJECT_MANAGER',
  'DEPARTMENT_MANAGER',
  'TEAM_LEADER',
  'EMPLOYEE',
  'VIEWER',
];

export const ALL_RBAC_CAPABILITIES: Array<{ key: RbacCapabilityKey; label: string }> = [
  { key: 'viewOwnerCommand', label: 'Owner Command Center' },
  { key: 'manageClients', label: 'Manage Clients' },
  { key: 'toggleFutureModules', label: 'Toggle Client Modules' },
  { key: 'manageProjects', label: 'Manage Projects' },
  { key: 'manageTasks', label: 'Create / Edit Tasks' },
  { key: 'manageDepartments', label: 'Manage Departments' },
  { key: 'manageEmployees', label: 'Manage Employees' },
  { key: 'approveTeamLeader', label: 'Approve (Tier 1: Team Leader)' },
  { key: 'approveProjectManager', label: 'Approve (Tier 2: Project Manager)' },
  { key: 'approveOwner', label: 'Approve (Tier 3: Owner Final)' },
  { key: 'manageSrm', label: 'Manage India Post SRM' },
  { key: 'manageWorkflows', label: 'Manage Workflows' },
  { key: 'manageFinance', label: 'Manage Finance' },
  { key: 'importMigration', label: 'Run Excel/CSV Migration' },
  { key: 'exportReports', label: 'Export CSV Reports' },
  { key: 'manageRbac', label: 'Configure RBAC Matrix' },
];

const DEFAULT_ROLE_MATRIX: RolePermissionMatrix = {
  OWNER_SUPER_ADMIN: {
    viewOwnerCommand: true,
    manageClients: true,
    toggleFutureModules: true,
    manageProjects: true,
    manageTasks: true,
    manageDepartments: true,
    manageEmployees: true,
    approveTeamLeader: true,
    approveProjectManager: true,
    approveOwner: true,
    manageSrm: true,
    manageWorkflows: true,
    manageFinance: true,
    importMigration: true,
    exportReports: true,
    manageRbac: true,
  },
  BUSINESS_ADMIN: {
    viewOwnerCommand: true,
    manageClients: true,
    toggleFutureModules: true,
    manageProjects: true,
    manageTasks: true,
    manageDepartments: true,
    manageEmployees: true,
    approveTeamLeader: true,
    approveProjectManager: true,
    approveOwner: false,
    manageSrm: true,
    manageWorkflows: true,
    manageFinance: true,
    importMigration: true,
    exportReports: true,
    manageRbac: false,
  },
  CLIENT_ADMIN: {
    viewOwnerCommand: false,
    manageClients: false,
    toggleFutureModules: false,
    manageProjects: true,
    manageTasks: true,
    manageDepartments: true,
    manageEmployees: true,
    approveTeamLeader: true,
    approveProjectManager: true,
    approveOwner: false,
    manageSrm: true,
    manageWorkflows: true,
    manageFinance: false,
    importMigration: true,
    exportReports: true,
    manageRbac: false,
  },
  PROJECT_MANAGER: {
    viewOwnerCommand: false,
    manageClients: false,
    toggleFutureModules: false,
    manageProjects: true,
    manageTasks: true,
    manageDepartments: false,
    manageEmployees: false,
    approveTeamLeader: true,
    approveProjectManager: true,
    approveOwner: false,
    manageSrm: true,
    manageWorkflows: false,
    manageFinance: false,
    importMigration: false,
    exportReports: true,
    manageRbac: false,
  },
  DEPARTMENT_MANAGER: {
    viewOwnerCommand: false,
    manageClients: false,
    toggleFutureModules: false,
    manageProjects: false,
    manageTasks: true,
    manageDepartments: true,
    manageEmployees: false,
    approveTeamLeader: true,
    approveProjectManager: false,
    approveOwner: false,
    manageSrm: true,
    manageWorkflows: false,
    manageFinance: false,
    importMigration: false,
    exportReports: true,
    manageRbac: false,
  },
  TEAM_LEADER: {
    viewOwnerCommand: false,
    manageClients: false,
    toggleFutureModules: false,
    manageProjects: false,
    manageTasks: true,
    manageDepartments: false,
    manageEmployees: false,
    approveTeamLeader: true,
    approveProjectManager: false,
    approveOwner: false,
    manageSrm: true,
    manageWorkflows: false,
    manageFinance: false,
    importMigration: false,
    exportReports: true,
    manageRbac: false,
  },
  EMPLOYEE: {
    viewOwnerCommand: false,
    manageClients: false,
    toggleFutureModules: false,
    manageProjects: false,
    manageTasks: true,
    manageDepartments: false,
    manageEmployees: false,
    approveTeamLeader: false,
    approveProjectManager: false,
    approveOwner: false,
    manageSrm: true,
    manageWorkflows: false,
    manageFinance: false,
    importMigration: false,
    exportReports: false,
    manageRbac: false,
  },
  VIEWER: {
    viewOwnerCommand: false,
    manageClients: false,
    toggleFutureModules: false,
    manageProjects: false,
    manageTasks: false,
    manageDepartments: false,
    manageEmployees: false,
    approveTeamLeader: false,
    approveProjectManager: false,
    approveOwner: false,
    manageSrm: false,
    manageWorkflows: false,
    manageFinance: false,
    importMigration: false,
    exportReports: true,
    manageRbac: false,
  },
};

const nowIso = () => new Date().toISOString();

const SEEDED_CLIENTS: WorkspaceClient[] = [
  {
    id: 'client-india-post',
    code: 'IND-POST-KOTA',
    name: 'India Post',
    workspaceKey: 'INDIA_POST',
    industry: 'Government Postal, Banking & Citizen Services',
    status: 'Active System',
    moduleScope: 'FULL_INDIA_POST',
    futureModuleEnabled: true,
    accountManager: 'Mahendra Kumar Meena',
    contactName: 'Kota Division Operations Desk',
    contactEmail: 'kotadivision@indiapost.gov.in',
    contactPhone: '',
    city: 'Kota',
    regionLabel: 'Kota Division, Rajasthan Pilot',
    notes:
      'Complete Postal & Last-Mile Operations Management System covering Kota Division HPO/SO/BO hierarchy, 10-level geography, CRM, SRM, beats, and statutory documents.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'client-xpeedo-ev',
    code: 'XPD-EV-WORK',
    name: 'Xpeedo EV',
    workspaceKey: 'XPEEDO_EV',
    industry: 'Electric Mobility Operations & Fleet Engineering',
    status: 'Active System',
    moduleScope: 'EV_WORK_MGMT',
    futureModuleEnabled: true,
    accountManager: 'Ekta Meena',
    contactName: 'Xpeedo EV Operations PMO',
    contactEmail: 'ev-ops@xpeedo.in',
    contactPhone: '',
    city: 'Kota / Jaipur',
    regionLabel: 'Rajasthan Operations',
    notes:
      'Internal & client-facing EV Work Management System covering 7 departments, projects, tasks, Daily/Weekly/Monthly work reports, and multi-tier approvals.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'client-xpokart',
    code: 'XPK-LIST-03',
    name: 'Xpokart',
    workspaceKey: 'XPOKART',
    industry: 'B2B Commerce & Hyperlocal Fulfillment',
    status: 'Basic Profile Only',
    moduleScope: 'BASIC_PROFILE_ONLY',
    futureModuleEnabled: false,
    accountManager: 'Mahendra Kumar Meena',
    contactName: 'Xpokart Client Profile',
    contactEmail: 'ops@xpokart.in',
    contactPhone: '',
    city: 'Kota',
    regionLabel: 'Rajasthan',
    notes:
      'Registered client profile only for current phase. Operational storefront/order engine deferred to future activation phase.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'client-drop-dash',
    code: 'DRP-LIST-04',
    name: 'Drop Dash',
    workspaceKey: 'DROP_DASH',
    industry: 'Express Parcel & Micro-Fulfillment',
    status: 'Basic Profile Only',
    moduleScope: 'BASIC_PROFILE_ONLY',
    futureModuleEnabled: false,
    accountManager: 'Ekta Meena',
    contactName: 'Drop Dash Client Profile',
    contactEmail: 'ops@dropdash.in',
    contactPhone: '',
    city: 'Kota',
    regionLabel: 'Rajasthan',
    notes:
      'Registered client profile only for current phase. Full logistics workspace can be activated in a subsequent phase.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'client-shop-deck',
    code: 'SHP-LIST-05',
    name: 'Shop Deck',
    workspaceKey: 'SHOP_DECK',
    industry: 'Retail Merchandising & Catalog SaaS',
    status: 'Basic Profile Only',
    moduleScope: 'BASIC_PROFILE_ONLY',
    futureModuleEnabled: false,
    accountManager: 'Mahendra Kumar Meena',
    contactName: 'Shop Deck Client Profile',
    contactEmail: 'ops@shopdeck.in',
    contactPhone: '',
    city: 'Jaipur / Kota',
    regionLabel: 'Rajasthan',
    notes:
      'Registered client profile only for current phase. Storefront and merchandising modules deferred.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const SEEDED_EV_DEPARTMENTS: OpsDepartment[] = [
  {
    id: 'dept-ev-ops',
    workspaceId: 'XPEEDO_EV',
    clientId: 'client-xpeedo-ev',
    name: 'Operations',
    code: 'EV-OPS',
    headName: 'Unassigned (Configure Head)',
    description: 'Fleet deployment, charging readiness, dispatch coordination, and SLA tracking.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept-ev-sales',
    workspaceId: 'XPEEDO_EV',
    clientId: 'client-xpeedo-ev',
    name: 'Sales',
    code: 'EV-SLS',
    headName: 'Unassigned (Configure Head)',
    description: 'B2B fleet partnership onboarding, institutional contracts, and enterprise account growth.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept-ev-mkt',
    workspaceId: 'XPEEDO_EV',
    clientId: 'client-xpeedo-ev',
    name: 'Marketing',
    code: 'EV-MKT',
    headName: 'Unassigned (Configure Head)',
    description: 'Field campaigns, B2B outreach collateral, and partner visibility programs.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept-ev-tech',
    workspaceId: 'XPEEDO_EV',
    clientId: 'client-xpeedo-ev',
    name: 'Technology',
    code: 'EV-TECH',
    headName: 'Unassigned (Configure Head)',
    description: 'Telematics integrations, software automations, internal tooling, and QA engineering.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept-ev-support',
    workspaceId: 'XPEEDO_EV',
    clientId: 'client-xpeedo-ev',
    name: 'Customer Support',
    code: 'EV-SUP',
    headName: 'Unassigned (Configure Head)',
    description: 'Client issue resolution, maintenance scheduling, and service ticket escalation.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept-ev-admin',
    workspaceId: 'XPEEDO_EV',
    clientId: 'client-xpeedo-ev',
    name: 'Administration',
    code: 'EV-ADM',
    headName: 'Unassigned (Configure Head)',
    description: 'Vendor compliance, HR onboarding, attendance governance, and office administration.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'dept-ev-fin',
    workspaceId: 'XPEEDO_EV',
    clientId: 'client-xpeedo-ev',
    name: 'Finance',
    code: 'EV-FIN',
    headName: 'Unassigned (Configure Head)',
    description: 'Operational budgets, expense reconciliation, vendor payouts, and billing approvals.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const SEEDED_WORKFLOWS: AutomationWorkflow[] = [
  {
    id: 'wf-srm-critical-escalate',
    name: 'India Post Critical SRM Auto-Escalation',
    workspaceId: 'INDIA_POST',
    trigger: 'SRM_TICKET_CREATED',
    conditionSummary: 'Priority == Critical OR High SLA < 24h',
    actionSummary: 'Flag SLA alert notification & route to Division Incharge',
    enabled: true,
    runCount: 0,
    createdBy: 'System Blueprint',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'wf-ev-report-tl-route',
    name: 'EV Work Report Tier-1 Approval Routing',
    workspaceId: 'XPEEDO_EV',
    trigger: 'WORK_REPORT_SUBMITTED',
    conditionSummary: 'Period in [Daily, Weekly, Monthly]',
    actionSummary: 'Set stage PENDING_TL and notify Team Leader queue',
    enabled: true,
    runCount: 0,
    createdBy: 'System Blueprint',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'wf-task-blocked-alert',
    name: 'Blocked Task Project Manager Alert',
    workspaceId: 'ALL',
    trigger: 'TASK_BLOCKED',
    conditionSummary: 'Task status changed to Blocked',
    actionSummary: 'Create priority notification for Project Manager & Owner',
    enabled: true,
    runCount: 0,
    createdBy: 'System Blueprint',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

interface XpeedoOpsStoreState {
  activeWorkspaceFilter: string; // 'ALL' | 'INDIA_POST' | 'XPEEDO_EV' | 'XPOKART' | 'DROP_DASH' | 'SHOP_DECK'
  simulatedRbacRole: PlatformRbacRole | null;
  simulatedClientId: string | null;
  clients: WorkspaceClient[];
  departments: OpsDepartment[];
  projects: OpsProject[];
  tasks: OpsTask[];
  workReports: WorkReport[];
  srmTickets: IndiaPostSrmTicket[];
  indiaPostAttendance: IndiaPostAttendanceEntry[];
  workflows: AutomationWorkflow[];
  workflowLogs: WorkflowExecutionLog[];
  migrationLogs: MigrationImportLog[];
  financeEntries: OpsFinanceEntry[];
  clientDocuments: OpsDocumentEntry[];
  clientCommunications: ClientCommunicationEntry[];
  clientRequirements: ClientRequirementEntry[];
  clientDeliverables: ClientDeliverableEntry[];
  notifications: OpsNotification[];
  activityLogs: OpsActivityLog[];
  rolePermissions: RolePermissionMatrix;
}

function makeDefaultState(): XpeedoOpsStoreState {
  return {
    activeWorkspaceFilter: 'ALL',
    simulatedRbacRole: null,
    simulatedClientId: null,
    clients: [...SEEDED_CLIENTS],
    departments: [...SEEDED_EV_DEPARTMENTS],
    projects: [],
    tasks: [],
    workReports: [],
    srmTickets: [],
    indiaPostAttendance: [],
    workflows: [...SEEDED_WORKFLOWS],
    workflowLogs: [],
    migrationLogs: [],
    financeEntries: [],
    clientDocuments: [],
    clientCommunications: [],
    clientRequirements: [],
    clientDeliverables: [],
    notifications: [],
    activityLogs: [],
    rolePermissions: JSON.parse(JSON.stringify(DEFAULT_ROLE_MATRIX)),
  };
}

function genId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rnd}`;
}

export function exportCsvWithBom(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>
): void {
  const escapeCell = (val: unknown) => {
    const str = val === null || val === undefined ? '' : String(val);
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvBody = [
    headers.map(escapeCell).join(','),
    ...rows.map((r) => r.map(escapeCell).join(',')),
  ].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvBody], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

class XpeedoOpsService {
  private state: XpeedoOpsStoreState;
  private listeners = new Set<() => void>();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): XpeedoOpsStoreState {
    const fallback = makeDefaultState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
        return fallback;
      }
      const parsed = JSON.parse(raw) as Partial<XpeedoOpsStoreState>;
      const existingClients = Array.isArray(parsed.clients) ? parsed.clients : [];
      // Ensure the 5 initial clients always exist cleanly without overwriting edits
      const mergedClients = [...existingClients];
      SEEDED_CLIENTS.forEach((seed) => {
        if (!mergedClients.some((c) => c.id === seed.id || c.workspaceKey === seed.workspaceKey)) {
          mergedClients.push(seed);
        }
      });

      const existingDepts = Array.isArray(parsed.departments) ? parsed.departments : [];
      const mergedDepts = [...existingDepts];
      SEEDED_EV_DEPARTMENTS.forEach((d) => {
        if (!mergedDepts.some((ex) => ex.id === d.id)) {
          mergedDepts.push(d);
        }
      });

      return {
        ...fallback,
        ...parsed,
        clients: mergedClients,
        departments: mergedDepts,
        workflows:
          Array.isArray(parsed.workflows) && parsed.workflows.length > 0
            ? parsed.workflows
            : fallback.workflows,
        rolePermissions: parsed.rolePermissions || fallback.rolePermissions,
      };
    } catch {
      return fallback;
    }
  }

  private saveAndNotify(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // ignore storage quota overflow
    }
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore subscriber errors
      }
    });
    void this.syncAuditSummaryToFirestore();
  }

  private async syncAuditSummaryToFirestore(): Promise<void> {
    if (!auth.currentUser || !auth.currentUser.emailVerified) return;
    const latest = this.state.activityLogs[0];
    if (!latest) return;
    const safeId = latest.id.replace(/[^a-zA-Z0-9_\-]/g, '_');
    try {
      await setDoc(doc(db, 'audit_logs', safeId), {
        actorUid: auth.currentUser.uid,
        action: `${latest.action}:${latest.entityType}`.slice(0, 120),
        details: `${latest.workspaceId} | ${latest.summary}`.slice(0, 980),
        createdAt: latest.timestamp,
      });
    } catch (error) {
      // Only raise structured error if permission fails during verified Firestore write
      if (error instanceof Error && error.message.toLowerCase().includes('permission')) {
        try {
          handleFirestoreError(error, OperationType.WRITE, `audit_logs/${safeId}`);
        } catch {
          // logged structured FirestoreErrorInfo cleanly to console
        }
      }
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // --------------------------------------------------------------------------
  // RBAC, WORKSPACE SWITCHING & ISOLATION
  // --------------------------------------------------------------------------

  public resolvePlatformRole(userProfile: StaffProfile | null | undefined): PlatformRbacRole {
    if (this.state.simulatedRbacRole) {
      return this.state.simulatedRbacRole;
    }
    if (!userProfile) return 'VIEWER';
    const raw = String(userProfile.role || '').toUpperCase();
    if (raw === 'OWNER' || raw === 'MASTER_ADMIN' || raw === 'SUPER_ADMIN' || raw === 'DEVELOPER') {
      return 'OWNER_SUPER_ADMIN';
    }
    if (raw === 'ADMIN' || raw === 'DIVISIONAL_HEAD' || raw === 'ASST_DIVISIONAL_ADMIN') {
      return 'BUSINESS_ADMIN';
    }
    if (raw === 'CLIENT_ADMIN' || raw === 'DISTRICT_MANAGER' || raw === 'CATEGORY_MANAGER') {
      return 'CLIENT_ADMIN';
    }
    if (raw === 'PROJECT_MANAGER' || raw === 'SUBDIVISION_INCHARGE') {
      return 'PROJECT_MANAGER';
    }
    if (raw === 'DEPARTMENT_MANAGER' || raw === 'CLUSTER_INCHARGE' || raw === 'OFFICE_INCHARGE') {
      return 'DEPARTMENT_MANAGER';
    }
    if (raw === 'TEAM_LEADER' || raw === 'POSTMASTER' || raw === 'SUB_POSTMASTER' || raw === 'LAST_MILE_SUPERVISOR') {
      return 'TEAM_LEADER';
    }
    if (raw === 'VIEWER') {
      return 'VIEWER';
    }
    return 'EMPLOYEE';
  }

  public getRolePermissions(): RolePermissionMatrix {
    return this.state.rolePermissions;
  }

  public canPerform(
    userProfile: StaffProfile | null | undefined,
    capability: RbacCapabilityKey
  ): boolean {
    const role = this.resolvePlatformRole(userProfile);
    return Boolean(this.state.rolePermissions[role]?.[capability]);
  }

  public updateRoleCapability(
    role: PlatformRbacRole,
    capability: RbacCapabilityKey,
    allowed: boolean,
    actorName: string
  ): void {
    if (role === 'OWNER_SUPER_ADMIN' && capability === 'manageRbac') return;
    this.state.rolePermissions = {
      ...this.state.rolePermissions,
      [role]: {
        ...this.state.rolePermissions[role],
        [capability]: allowed,
      },
    };
    this.recordActivity({
      actor: actorName,
      actorRole: 'OWNER_SUPER_ADMIN',
      workspaceId: 'ALL',
      entityType: 'RBAC_MATRIX',
      entityId: role,
      action: 'UPDATE_PERMISSION',
      summary: `Set ${PLATFORM_RBAC_ROLE_META[role].label} -> ${capability} = ${allowed ? 'ALLOW' : 'DENY'}`,
    });
    this.saveAndNotify();
  }

  public getSimulatedRole(): PlatformRbacRole | null {
    return this.state.simulatedRbacRole;
  }

  public getSimulatedClientId(): string | null {
    return this.state.simulatedClientId;
  }

  public setSimulatedRolePreview(
    role: PlatformRbacRole | null,
    clientId: string | null = null,
    actorName = 'Owner'
  ): void {
    this.state.simulatedRbacRole = role;
    this.state.simulatedClientId = clientId;
    if (clientId) {
      const cli = this.state.clients.find((c) => c.id === clientId);
      if (cli) {
        this.state.activeWorkspaceFilter = cli.workspaceKey;
      }
    } else if (!role) {
      this.state.activeWorkspaceFilter = 'ALL';
    }
    this.recordActivity({
      actor: actorName,
      actorRole: 'OWNER_SUPER_ADMIN',
      workspaceId: this.state.activeWorkspaceFilter,
      entityType: 'RBAC_PREVIEW',
      entityId: role || 'RESET',
      action: 'ROLE_PREVIEW_SWITCH',
      summary: role
        ? `Switched role preview to ${PLATFORM_RBAC_ROLE_META[role].label}${clientId ? ` (Scoped to ${clientId})` : ''}`
        : 'Cleared role preview back to authenticated role',
    });
    this.saveAndNotify();
  }

  public getActiveWorkspaceFilter(): string {
    return this.state.activeWorkspaceFilter || 'ALL';
  }

  public setActiveWorkspaceFilter(workspaceKey: string): void {
    this.state.activeWorkspaceFilter = workspaceKey || 'ALL';
    this.saveAndNotify();
  }

  public getScopedWorkspaceKeys(userProfile: StaffProfile | null | undefined): string[] | 'ALL' {
    const role = this.resolvePlatformRole(userProfile);
    if (role === 'OWNER_SUPER_ADMIN' || role === 'BUSINESS_ADMIN') {
      return 'ALL';
    }
    if (this.state.simulatedClientId) {
      const cli = this.state.clients.find((c) => c.id === this.state.simulatedClientId);
      if (cli) return [cli.workspaceKey];
    }
    const assignedVendor = userProfile?.vendorScope?.assignedVendorId;
    if (assignedVendor === 'INDIA_POST') return ['INDIA_POST'];
    if (assignedVendor === 'EV_MOBILITY') return ['XPEEDO_EV'];
    const brandId = (userProfile?.brandId || '').toUpperCase();
    if (brandId.includes('INDIA')) return ['INDIA_POST'];
    if (brandId.includes('EV')) return ['XPEEDO_EV'];
    return ['INDIA_POST', 'XPEEDO_EV'];
  }

  // --------------------------------------------------------------------------
  // CLIENTS & 10-TAB CLIENT DETAILS PROFILE
  // --------------------------------------------------------------------------

  public getClients(userProfile?: StaffProfile | null): WorkspaceClient[] {
    if (!userProfile) return this.state.clients;
    const scope = this.getScopedWorkspaceKeys(userProfile);
    if (scope === 'ALL') return this.state.clients;
    return this.state.clients.filter((c) => scope.includes(c.workspaceKey));
  }

  public getClientById(clientId: string): WorkspaceClient | undefined {
    return this.state.clients.find((c) => c.id === clientId);
  }

  public upsertClient(
    input: Omit<WorkspaceClient, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
    actorName: string,
    actorRole: string
  ): WorkspaceClient {
    const now = nowIso();
    const existingIdx = input.id
      ? this.state.clients.findIndex((c) => c.id === input.id)
      : -1;
    const saved: WorkspaceClient =
      existingIdx >= 0
        ? {
            ...this.state.clients[existingIdx],
            ...input,
            id: this.state.clients[existingIdx].id,
            updatedAt: now,
          }
        : {
            ...input,
            id: genId('CLI'),
            createdAt: now,
            updatedAt: now,
          };

    if (existingIdx >= 0) {
      this.state.clients[existingIdx] = saved;
    } else {
      this.state.clients = [saved, ...this.state.clients];
    }

    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: saved.workspaceKey,
      clientId: saved.id,
      entityType: 'Client',
      entityId: saved.id,
      action: existingIdx >= 0 ? 'UPDATE_CLIENT' : 'CREATE_CLIENT',
      summary: `${existingIdx >= 0 ? 'Updated' : 'Created'} client ${saved.name} (${saved.code})`,
    });
    this.saveAndNotify();
    return saved;
  }

  public toggleClientFutureModule(clientId: string, enabled: boolean, actorName: string, actorRole: string): void {
    const idx = this.state.clients.findIndex((c) => c.id === clientId);
    if (idx < 0) return;
    const client = this.state.clients[idx];
    this.state.clients[idx] = {
      ...client,
      futureModuleEnabled: enabled,
      updatedAt: nowIso(),
    };
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: client.workspaceKey,
      clientId: client.id,
      entityType: 'Client',
      entityId: client.id,
      action: 'TOGGLE_FUTURE_MODULE',
      summary: `${enabled ? 'Enabled' : 'Disabled'} future phase readiness flag for ${client.name}`,
    });
    this.saveAndNotify();
  }

  // Client Sub-Tabs (Communications, Requirements, Deliverables, Documents)
  public getClientCommunications(clientId: string): ClientCommunicationEntry[] {
    return this.state.clientCommunications.filter((c) => c.clientId === clientId);
  }

  public addClientCommunication(
    entry: Omit<ClientCommunicationEntry, 'id' | 'occurredAt'>,
    actorName: string,
    actorRole: string
  ): ClientCommunicationEntry {
    const item: ClientCommunicationEntry = {
      ...entry,
      id: genId('COM'),
      occurredAt: nowIso(),
    };
    this.state.clientCommunications = [item, ...this.state.clientCommunications];
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: item.workspaceId,
      clientId: item.clientId,
      entityType: 'Communication',
      entityId: item.id,
      action: 'LOG_COMMUNICATION',
      summary: `${item.channel}: ${item.subject}`,
    });
    this.saveAndNotify();
    return item;
  }

  public getClientRequirements(clientId: string): ClientRequirementEntry[] {
    return this.state.clientRequirements.filter((r) => r.clientId === clientId);
  }

  public addClientRequirement(
    entry: Omit<ClientRequirementEntry, 'id' | 'createdAt'>,
    actorName: string,
    actorRole: string
  ): ClientRequirementEntry {
    const item: ClientRequirementEntry = {
      ...entry,
      id: genId('REQ'),
      createdAt: nowIso(),
    };
    this.state.clientRequirements = [item, ...this.state.clientRequirements];
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: item.workspaceId,
      clientId: item.clientId,
      entityType: 'Requirement',
      entityId: item.id,
      action: 'CREATE_REQUIREMENT',
      summary: `Requirement added: ${item.title} [${item.priority}]`,
    });
    this.saveAndNotify();
    return item;
  }

  public updateClientRequirementStatus(
    id: string,
    status: ClientRequirementEntry['status'],
    actorName: string,
    actorRole: string
  ): void {
    const idx = this.state.clientRequirements.findIndex((r) => r.id === id);
    if (idx < 0) return;
    const item = this.state.clientRequirements[idx];
    this.state.clientRequirements[idx] = { ...item, status };
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: item.workspaceId,
      clientId: item.clientId,
      entityType: 'Requirement',
      entityId: id,
      action: 'UPDATE_REQUIREMENT_STATUS',
      summary: `Requirement "${item.title}" -> ${status}`,
    });
    this.saveAndNotify();
  }

  public getClientDeliverables(clientId: string): ClientDeliverableEntry[] {
    return this.state.clientDeliverables.filter((d) => d.clientId === clientId);
  }

  public addClientDeliverable(
    entry: Omit<ClientDeliverableEntry, 'id' | 'createdAt'>,
    actorName: string,
    actorRole: string
  ): ClientDeliverableEntry {
    const item: ClientDeliverableEntry = {
      ...entry,
      id: genId('DLV'),
      createdAt: nowIso(),
    };
    this.state.clientDeliverables = [item, ...this.state.clientDeliverables];
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: item.workspaceId,
      clientId: item.clientId,
      entityType: 'Deliverable',
      entityId: item.id,
      action: 'CREATE_DELIVERABLE',
      summary: `Deliverable created: ${item.title} (Due ${item.dueDate})`,
    });
    this.saveAndNotify();
    return item;
  }

  public updateDeliverableStatus(
    id: string,
    status: ClientDeliverableEntry['status'],
    actorName: string,
    actorRole: string
  ): void {
    const idx = this.state.clientDeliverables.findIndex((d) => d.id === id);
    if (idx < 0) return;
    const item = this.state.clientDeliverables[idx];
    this.state.clientDeliverables[idx] = {
      ...item,
      status,
      signoffBy: status === 'Client Approved' ? actorName : item.signoffBy,
    };
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: item.workspaceId,
      clientId: item.clientId,
      entityType: 'Deliverable',
      entityId: id,
      action: 'UPDATE_DELIVERABLE_STATUS',
      summary: `Deliverable "${item.title}" -> ${status}`,
    });
    this.saveAndNotify();
  }

  public getDocuments(workspaceFilter?: string, clientId?: string): OpsDocumentEntry[] {
    return this.state.clientDocuments.filter((d) => {
      if (clientId && d.clientId !== clientId) return false;
      if (workspaceFilter && workspaceFilter !== 'ALL' && d.workspaceId !== workspaceFilter) {
        return false;
      }
      return true;
    });
  }

  public addDocument(
    entry: Omit<OpsDocumentEntry, 'id' | 'createdAt'>,
    actorName: string,
    actorRole: string
  ): OpsDocumentEntry {
    const item: OpsDocumentEntry = {
      ...entry,
      id: genId('DOC'),
      createdAt: nowIso(),
    };
    this.state.clientDocuments = [item, ...this.state.clientDocuments];
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: item.workspaceId,
      clientId: item.clientId,
      entityType: 'Document',
      entityId: item.id,
      action: 'ADD_DOCUMENT',
      summary: `Added ${item.category}: ${item.title} (${item.version})`,
    });
    this.saveAndNotify();
    return item;
  }

  // --------------------------------------------------------------------------
  // DEPARTMENTS (CONFIGURABLE PER WORKSPACE / CLIENT)
  // --------------------------------------------------------------------------

  public getDepartments(workspaceFilter?: string, clientId?: string): OpsDepartment[] {
    return this.state.departments.filter((d) => {
      if (clientId && d.clientId !== clientId) return false;
      if (workspaceFilter && workspaceFilter !== 'ALL' && d.workspaceId !== workspaceFilter) {
        return false;
      }
      return true;
    });
  }

  public upsertDepartment(
    input: Omit<OpsDepartment, 'id' | 'createdAt'> & { id?: string },
    actorName: string,
    actorRole: string
  ): OpsDepartment {
    const existingIdx = input.id
      ? this.state.departments.findIndex((d) => d.id === input.id)
      : -1;
    const saved: OpsDepartment =
      existingIdx >= 0
        ? { ...this.state.departments[existingIdx], ...input }
        : { ...input, id: genId('DEPT'), createdAt: nowIso() };
    if (existingIdx >= 0) {
      this.state.departments[existingIdx] = saved;
    } else {
      this.state.departments = [saved, ...this.state.departments];
    }
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: saved.workspaceId,
      clientId: saved.clientId,
      entityType: 'Department',
      entityId: saved.id,
      action: existingIdx >= 0 ? 'UPDATE_DEPARTMENT' : 'CREATE_DEPARTMENT',
      summary: `${saved.name} (${saved.code})`,
    });
    this.saveAndNotify();
    return saved;
  }

  // --------------------------------------------------------------------------
  // SHARED PROJECT & TASK ENGINE (STRICTLY SCOPED BY workspaceId / clientId)
  // --------------------------------------------------------------------------

  public getProjects(workspaceFilter?: string, clientId?: string): OpsProject[] {
    return this.state.projects.filter((p) => {
      if (clientId && p.clientId !== clientId) return false;
      if (workspaceFilter && workspaceFilter !== 'ALL' && p.workspaceId !== workspaceFilter) {
        return false;
      }
      return true;
    });
  }

  public upsertProject(
    input: Omit<OpsProject, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
    actorName: string,
    actorRole: string
  ): OpsProject {
    const now = nowIso();
    const idx = input.id ? this.state.projects.findIndex((p) => p.id === input.id) : -1;
    const saved: OpsProject =
      idx >= 0
        ? { ...this.state.projects[idx], ...input, updatedAt: now }
        : {
            ...input,
            id: genId('PRJ'),
            code: input.code || `PRJ-${(this.state.projects.length + 1).toString().padStart(3, '0')}`,
            createdAt: now,
            updatedAt: now,
          };
    if (idx >= 0) {
      this.state.projects[idx] = saved;
    } else {
      this.state.projects = [saved, ...this.state.projects];
    }
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: saved.workspaceId,
      clientId: saved.clientId,
      entityType: 'Project',
      entityId: saved.id,
      action: idx >= 0 ? 'UPDATE_PROJECT' : 'CREATE_PROJECT',
      summary: `${saved.code}: ${saved.title} [${saved.status}]`,
    });
    this.saveAndNotify();
    return saved;
  }

  public getTasks(workspaceFilter?: string, clientId?: string, projectId?: string): OpsTask[] {
    return this.state.tasks.filter((t) => {
      if (clientId && t.clientId !== clientId) return false;
      if (projectId && t.projectId !== projectId) return false;
      if (workspaceFilter && workspaceFilter !== 'ALL' && t.workspaceId !== workspaceFilter) {
        return false;
      }
      return true;
    });
  }

  public createTask(
    input: Omit<
      OpsTask,
      | 'id'
      | 'code'
      | 'loggedHours'
      | 'subtasks'
      | 'timeLogs'
      | 'comments'
      | 'attachments'
      | 'createdAt'
      | 'updatedAt'
    > & {
      subtasks?: OpsTask['subtasks'];
    },
    actorName: string,
    actorRole: string
  ): OpsTask {
    const now = nowIso();
    const task: OpsTask = {
      ...input,
      id: genId('TSK'),
      code: `TSK-${(this.state.tasks.length + 1).toString().padStart(4, '0')}`,
      loggedHours: 0,
      subtasks: input.subtasks || [],
      timeLogs: [],
      comments: [],
      attachments: [],
      createdAt: now,
      updatedAt: now,
    };
    this.state.tasks = [task, ...this.state.tasks];
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: task.workspaceId,
      clientId: task.clientId,
      entityType: 'Task',
      entityId: task.id,
      action: 'CREATE_TASK',
      summary: `Created ${task.code}: ${task.title} -> ${task.assigneeName} [${task.status}]`,
    });
    if (task.status === 'Blocked') {
      this.triggerWorkflow('TASK_BLOCKED', task.workspaceId, `${task.code}: ${task.title}`);
    }
    this.saveAndNotify();
    return task;
  }

  public updateTaskStatus(
    taskId: string,
    status: OpsTaskStatus,
    actorName: string,
    actorRole: string
  ): OpsTask | null {
    const idx = this.state.tasks.findIndex((t) => t.id === taskId);
    if (idx < 0) return null;
    const prev = this.state.tasks[idx];
    const updated: OpsTask = { ...prev, status, updatedAt: nowIso() };
    this.state.tasks[idx] = updated;
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: updated.workspaceId,
      clientId: updated.clientId,
      entityType: 'Task',
      entityId: taskId,
      action: 'CHANGE_TASK_STATUS',
      summary: `${updated.code}: ${prev.status} -> ${status}`,
    });
    if (status === 'Blocked') {
      this.triggerWorkflow('TASK_BLOCKED', updated.workspaceId, `${updated.code}: ${updated.title}`);
      this.addNotification({
        workspaceId: updated.workspaceId,
        clientId: updated.clientId,
        title: `Task Blocked: ${updated.code}`,
        message: `${updated.title} marked Blocked by ${actorName}.`,
        category: 'Task',
        linkPath: '/task-management',
      });
    }
    this.saveAndNotify();
    return updated;
  }

  public addTaskSubtask(taskId: string, title: string, actorName: string, actorRole: string): void {
    const idx = this.state.tasks.findIndex((t) => t.id === taskId);
    if (idx < 0 || !title.trim()) return;
    const task = this.state.tasks[idx];
    this.state.tasks[idx] = {
      ...task,
      subtasks: [...task.subtasks, { id: genId('SUB'), title: title.trim(), done: false }],
      updatedAt: nowIso(),
    };
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: task.workspaceId,
      clientId: task.clientId,
      entityType: 'Task',
      entityId: taskId,
      action: 'ADD_SUBTASK',
      summary: `${task.code}: Added subtask "${title.trim()}"`,
    });
    this.saveAndNotify();
  }

  public toggleTaskSubtask(taskId: string, subtaskId: string): void {
    const idx = this.state.tasks.findIndex((t) => t.id === taskId);
    if (idx < 0) return;
    const task = this.state.tasks[idx];
    this.state.tasks[idx] = {
      ...task,
      subtasks: task.subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)),
      updatedAt: nowIso(),
    };
    this.saveAndNotify();
  }

  public logTaskTime(
    taskId: string,
    hours: number,
    note: string,
    actorName: string,
    actorRole: string
  ): void {
    const idx = this.state.tasks.findIndex((t) => t.id === taskId);
    if (idx < 0 || hours <= 0) return;
    const task = this.state.tasks[idx];
    const entry = {
      id: genId('TIM'),
      actor: actorName,
      hours: Number(hours),
      note: note.trim() || 'Logged execution time',
      loggedAt: nowIso(),
    };
    this.state.tasks[idx] = {
      ...task,
      loggedHours: Number((task.loggedHours + entry.hours).toFixed(2)),
      timeLogs: [entry, ...task.timeLogs],
      updatedAt: nowIso(),
    };
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: task.workspaceId,
      clientId: task.clientId,
      entityType: 'Task',
      entityId: taskId,
      action: 'LOG_TIME',
      summary: `${task.code}: +${entry.hours}h logged (${entry.note})`,
    });
    this.saveAndNotify();
  }

  public addTaskComment(taskId: string, body: string, actorName: string): void {
    const idx = this.state.tasks.findIndex((t) => t.id === taskId);
    if (idx < 0 || !body.trim()) return;
    const task = this.state.tasks[idx];
    this.state.tasks[idx] = {
      ...task,
      comments: [
        ...task.comments,
        { id: genId('CMT'), author: actorName, body: body.trim(), createdAt: nowIso() },
      ],
      updatedAt: nowIso(),
    };
    this.saveAndNotify();
  }

  public addTaskAttachment(
    taskId: string,
    name: string,
    fileType: string,
    sizeLabel: string,
    actorName: string
  ): void {
    const idx = this.state.tasks.findIndex((t) => t.id === taskId);
    if (idx < 0 || !name.trim()) return;
    const task = this.state.tasks[idx];
    this.state.tasks[idx] = {
      ...task,
      attachments: [
        ...task.attachments,
        {
          id: genId('ATT'),
          name: name.trim(),
          fileType: fileType || 'Document',
          sizeLabel: sizeLabel || 'Reference',
          addedBy: actorName,
          addedAt: nowIso(),
        },
      ],
      updatedAt: nowIso(),
    };
    this.saveAndNotify();
  }

  // --------------------------------------------------------------------------
  // XPEEDO EV WORK REPORTS & MULTI-TIER APPROVAL WORKFLOW
  // Employee -> Team Leader -> Project Manager -> Owner
  // --------------------------------------------------------------------------

  public getWorkReports(workspaceFilter?: string): WorkReport[] {
    if (!workspaceFilter || workspaceFilter === 'ALL') return this.state.workReports;
    return this.state.workReports.filter((w) => w.workspaceId === workspaceFilter);
  }

  public submitWorkReport(
    input: {
      workspaceId: string;
      clientId: string;
      departmentId: string;
      projectId?: string;
      employeeId: string;
      employeeName: string;
      periodType: WorkReportPeriod;
      reportDate: string;
      hoursLogged: number;
      tasksCompletedCount: number;
      summary: string;
      blockers?: string;
      nextPlan?: string;
    },
    actorRole: string
  ): WorkReport {
    const now = nowIso();
    const report: WorkReport = {
      ...input,
      id: genId('WRP'),
      approvalStage: 'PENDING_TL',
      approvalHistory: [
        {
          stage: 'PENDING_TL',
          decision: 'Submitted',
          actor: input.employeeName,
          actorRole,
          note: `${input.periodType} report submitted to Team Leader approval queue`,
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    this.state.workReports = [report, ...this.state.workReports];
    this.recordActivity({
      actor: input.employeeName,
      actorRole,
      workspaceId: report.workspaceId,
      clientId: report.clientId,
      entityType: 'WorkReport',
      entityId: report.id,
      action: 'SUBMIT_WORK_REPORT',
      summary: `${report.periodType} work report (${report.hoursLogged}h) -> PENDING_TL`,
    });
    this.triggerWorkflow('WORK_REPORT_SUBMITTED', report.workspaceId, `${report.id} (${report.employeeName})`);
    this.addNotification({
      workspaceId: report.workspaceId,
      clientId: report.clientId,
      title: `Work Report Awaiting Team Leader Approval`,
      message: `${report.employeeName} submitted ${report.periodType} report (${report.hoursLogged}h).`,
      category: 'Approval',
      linkPath: '/xpeedo-ev',
    });
    this.saveAndNotify();
    return report;
  }

  public advanceWorkReportApproval(
    reportId: string,
    actorName: string,
    actorRole: PlatformRbacRole,
    note?: string
  ): { success: boolean; error?: string; report?: WorkReport } {
    const idx = this.state.workReports.findIndex((r) => r.id === reportId);
    if (idx < 0) return { success: false, error: 'Work report not found.' };
    const report = this.state.workReports[idx];
    const now = nowIso();

    let nextStage: WorkReport['approvalStage'] | null = null;
    if (report.approvalStage === 'PENDING_TL') {
      if (!this.state.rolePermissions[actorRole]?.approveTeamLeader) {
        return { success: false, error: 'Current role lacks Tier-1 (Team Leader) approval permission.' };
      }
      nextStage = 'PENDING_PM';
    } else if (report.approvalStage === 'PENDING_PM') {
      if (!this.state.rolePermissions[actorRole]?.approveProjectManager) {
        return { success: false, error: 'Current role lacks Tier-2 (Project Manager) approval permission.' };
      }
      nextStage = 'PENDING_OWNER';
    } else if (report.approvalStage === 'PENDING_OWNER') {
      if (!this.state.rolePermissions[actorRole]?.approveOwner) {
        return { success: false, error: 'Current role lacks Tier-3 (Owner Final) approval permission.' };
      }
      nextStage = 'APPROVED';
    } else {
      return { success: false, error: `Report is already ${report.approvalStage}.` };
    }

    const updated: WorkReport = {
      ...report,
      approvalStage: nextStage,
      approvalHistory: [
        ...report.approvalHistory,
        {
          stage: nextStage,
          decision: 'Approved',
          actor: actorName,
          actorRole,
          note: note?.trim() || `Approved and routed to ${nextStage}`,
          timestamp: now,
        },
      ],
      updatedAt: now,
    };
    this.state.workReports[idx] = updated;
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: updated.workspaceId,
      clientId: updated.clientId,
      entityType: 'WorkReport',
      entityId: updated.id,
      action: 'APPROVE_WORK_REPORT',
      summary: `${updated.id}: ${report.approvalStage} -> ${nextStage}`,
    });
    this.saveAndNotify();
    return { success: true, report: updated };
  }

  public rejectWorkReport(
    reportId: string,
    reason: string,
    actorName: string,
    actorRole: PlatformRbacRole
  ): WorkReport | null {
    const idx = this.state.workReports.findIndex((r) => r.id === reportId);
    if (idx < 0) return null;
    const report = this.state.workReports[idx];
    const now = nowIso();
    const updated: WorkReport = {
      ...report,
      approvalStage: 'REJECTED',
      rejectionReason: reason.trim() || 'Returned for revision',
      approvalHistory: [
        ...report.approvalHistory,
        {
          stage: 'REJECTED',
          decision: 'Rejected',
          actor: actorName,
          actorRole,
          note: reason.trim() || 'Returned for revision',
          timestamp: now,
        },
      ],
      updatedAt: now,
    };
    this.state.workReports[idx] = updated;
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: updated.workspaceId,
      clientId: updated.clientId,
      entityType: 'WorkReport',
      entityId: updated.id,
      action: 'REJECT_WORK_REPORT',
      summary: `${updated.id} rejected at ${report.approvalStage}: ${updated.rejectionReason}`,
    });
    this.saveAndNotify();
    return updated;
  }

  // --------------------------------------------------------------------------
  // INDIA POST SRM (SERVICE REQUEST MANAGEMENT), SLA & ATTENDANCE
  // --------------------------------------------------------------------------

  public getSrmTickets(): IndiaPostSrmTicket[] {
    return this.state.srmTickets;
  }

  public createSrmTicket(
    input: {
      officeId: string;
      officeName: string;
      pincode: string;
      beatNo: string;
      customerId?: string;
      customerName: string;
      customerMobile: string;
      category: SrmTicketCategory;
      subject: string;
      description: string;
      priority: SrmTicketPriority;
      assignedTo: string;
    },
    actorName: string,
    actorRole: string
  ): IndiaPostSrmTicket {
    const nowDate = new Date();
    const slaHours =
      input.priority === 'Critical'
        ? 4
        : input.priority === 'High'
        ? 12
        : input.priority === 'Medium'
        ? 24
        : 48;
    const slaDueAt = new Date(nowDate.getTime() + slaHours * 3600 * 1000).toISOString();
    const now = nowDate.toISOString();

    const ticket: IndiaPostSrmTicket = {
      ...input,
      id: genId('SRM'),
      ticketNo: `KOTA-SRM-${(this.state.srmTickets.length + 1).toString().padStart(4, '0')}`,
      workspaceId: 'INDIA_POST',
      clientId: 'client-india-post',
      status: input.assignedTo ? 'Assigned' : 'Open',
      slaHours,
      slaDueAt,
      timeline: [
        {
          timestamp: now,
          actor: actorName,
          note: `SRM ticket created under ${input.officeName} (PIN ${input.pincode}, ${input.beatNo}) · SLA ${slaHours}h`,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    this.state.srmTickets = [ticket, ...this.state.srmTickets];
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: 'INDIA_POST',
      clientId: 'client-india-post',
      entityType: 'SRMTicket',
      entityId: ticket.id,
      action: 'CREATE_SRM_TICKET',
      summary: `${ticket.ticketNo} [${ticket.priority}] ${ticket.subject} (${ticket.officeName})`,
    });
    if (ticket.priority === 'Critical' || ticket.priority === 'High') {
      this.triggerWorkflow('SRM_TICKET_CREATED', 'INDIA_POST', `${ticket.ticketNo}: ${ticket.subject}`);
      this.addNotification({
        workspaceId: 'INDIA_POST',
        clientId: 'client-india-post',
        title: `India Post ${ticket.priority} SRM SLA (${slaHours}h)`,
        message: `${ticket.ticketNo}: ${ticket.subject} at ${ticket.officeName}`,
        category: 'SLA',
        linkPath: '/india-post',
      });
    }
    this.saveAndNotify();
    return ticket;
  }

  public updateSrmTicketStatus(
    ticketId: string,
    patch: {
      status: SrmTicketStatus;
      assignedTo?: string;
      escalatedTo?: string;
      resolutionNotes?: string;
      note?: string;
    },
    actorName: string,
    actorRole: string
  ): IndiaPostSrmTicket | null {
    const idx = this.state.srmTickets.findIndex((t) => t.id === ticketId);
    if (idx < 0) return null;
    const prev = this.state.srmTickets[idx];
    const now = nowIso();
    const updated: IndiaPostSrmTicket = {
      ...prev,
      status: patch.status,
      assignedTo: patch.assignedTo ?? prev.assignedTo,
      escalatedTo: patch.escalatedTo ?? prev.escalatedTo,
      resolutionNotes: patch.resolutionNotes ?? prev.resolutionNotes,
      timeline: [
        ...prev.timeline,
        {
          timestamp: now,
          actor: actorName,
          note:
            patch.note ||
            `Status updated ${prev.status} -> ${patch.status}${
              patch.escalatedTo ? ` · Escalated to ${patch.escalatedTo}` : ''
            }`,
        },
      ],
      updatedAt: now,
    };
    this.state.srmTickets[idx] = updated;
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: 'INDIA_POST',
      clientId: 'client-india-post',
      entityType: 'SRMTicket',
      entityId: ticketId,
      action: patch.status === 'Escalated' ? 'ESCALATE_SRM_TICKET' : 'UPDATE_SRM_TICKET',
      summary: `${updated.ticketNo}: ${prev.status} -> ${patch.status}`,
    });
    this.saveAndNotify();
    return updated;
  }

  public derivePostCategoryFromSrmCategory(category: SrmTicketCategory): string {
    switch (category) {
      case 'PLI/RPLI Inquiry':
      case 'Savings/IPPB':
        return 'Banking & IPPB';
      case 'Aadhaar/CELC':
        return 'Counter & Booking';
      case 'Beat Dispute':
      case 'Staff Grievance':
        return 'Supervisory & Division';
      default:
        return 'Delivery';
    }
  }

  public syncTaskAndSrmOnStaffRoleChange(payload: {
    staffName: string;
    previousBeat?: string;
    nextBeat?: string;
    nextOffice?: string;
    nextPost?: string;
    nextPostCategory: string;
    actorName: string;
  }): { tasksUpdated: number; srmUpdated: number } {
    const cleanStaff = (payload.staffName || '').trim().toLowerCase();
    if (!cleanStaff) return { tasksUpdated: 0, srmUpdated: 0 };
    const now = nowIso();
    let tasksUpdated = 0;
    let srmUpdated = 0;

    this.state.tasks = this.state.tasks.map((t) => {
      if (
        t.status !== 'Completed' &&
        t.status !== 'Cancelled' &&
        t.assigneeName.toLowerCase().includes(cleanStaff)
      ) {
        tasksUpdated += 1;
        return {
          ...t,
          postCategory: payload.nextPostCategory,
          assignedBeat: payload.nextBeat || t.assignedBeat,
          assignedOffice: payload.nextOffice || t.assignedOffice,
          handoffNote: `Post updated to ${payload.nextPost || payload.nextPostCategory} by ${payload.actorName}`,
          updatedAt: now,
        };
      }
      return t;
    });

    this.state.srmTickets = this.state.srmTickets.map((tk) => {
      if (
        tk.status !== 'Resolved' &&
        tk.status !== 'Closed' &&
        tk.assignedTo.toLowerCase().includes(cleanStaff)
      ) {
        srmUpdated += 1;
        return {
          ...tk,
          postCategory: payload.nextPostCategory,
          assignedPostRole: payload.nextPost || tk.assignedPostRole,
          timeline: [
            ...tk.timeline,
            {
              timestamp: now,
              actor: payload.actorName,
              note: `Assignee ${payload.staffName} updated to ${payload.nextPost || payload.nextPostCategory} (${payload.nextOffice || tk.officeName})`,
            },
          ],
          updatedAt: now,
        };
      }
      return tk;
    });

    this.recordActivity({
      actor: payload.actorName,
      actorRole: 'INDIA_POST_ADMIN',
      workspaceId: 'INDIA_POST',
      clientId: 'client-india-post',
      entityType: 'StaffPromotionSync',
      entityId: payload.staffName,
      action: 'STAFF_ROLE_CHANGE_OPS_SYNC',
      summary: `${payload.staffName} -> ${payload.nextPost || payload.nextPostCategory} (${tasksUpdated} tasks, ${srmUpdated} SRM aligned)`,
    });
    this.saveAndNotify();
    return { tasksUpdated, srmUpdated };
  }

  public getIndiaPostAttendance(): IndiaPostAttendanceEntry[] {
    return this.state.indiaPostAttendance;
  }

  public logIndiaPostAttendance(
    input: Omit<IndiaPostAttendanceEntry, 'id' | 'updatedAt'>,
    actorName: string,
    actorRole: string
  ): IndiaPostAttendanceEntry {
    const now = nowIso();
    const existingIdx = this.state.indiaPostAttendance.findIndex(
      (a) => a.employeeId === input.employeeId && a.date === input.date
    );
    const saved: IndiaPostAttendanceEntry =
      existingIdx >= 0
        ? { ...this.state.indiaPostAttendance[existingIdx], ...input, updatedAt: now }
        : { ...input, id: genId('ATT'), updatedAt: now };
    if (existingIdx >= 0) {
      this.state.indiaPostAttendance[existingIdx] = saved;
    } else {
      this.state.indiaPostAttendance = [saved, ...this.state.indiaPostAttendance];
    }
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: 'INDIA_POST',
      clientId: 'client-india-post',
      entityType: 'Attendance',
      entityId: saved.id,
      action: 'LOG_POSTAL_ATTENDANCE',
      summary: `${saved.employeeName} (${saved.date}): ${saved.status}`,
    });
    this.saveAndNotify();
    return saved;
  }

  // --------------------------------------------------------------------------
  // AUTOMATION WORKFLOWS & EXECUTION LOGS
  // --------------------------------------------------------------------------

  public getWorkflows(): AutomationWorkflow[] {
    return this.state.workflows;
  }

  public getWorkflowLogs(): WorkflowExecutionLog[] {
    return this.state.workflowLogs;
  }

  public createWorkflow(
    input: Omit<AutomationWorkflow, 'id' | 'lastRunAt' | 'runCount' | 'createdAt'>,
    actorName: string,
    actorRole: string
  ): AutomationWorkflow {
    const wf: AutomationWorkflow = {
      ...input,
      id: genId('WF'),
      runCount: 0,
      createdAt: nowIso(),
    };
    this.state.workflows = [wf, ...this.state.workflows];
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: wf.workspaceId,
      entityType: 'Workflow',
      entityId: wf.id,
      action: 'CREATE_WORKFLOW',
      summary: `Created workflow "${wf.name}" (${wf.trigger})`,
    });
    this.saveAndNotify();
    return wf;
  }

  public toggleWorkflow(id: string, actorName: string, actorRole: string): void {
    const idx = this.state.workflows.findIndex((w) => w.id === id);
    if (idx < 0) return;
    const wf = this.state.workflows[idx];
    this.state.workflows[idx] = { ...wf, enabled: !wf.enabled };
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: wf.workspaceId,
      entityType: 'Workflow',
      entityId: id,
      action: 'TOGGLE_WORKFLOW',
      summary: `${wf.name}: ${!wf.enabled ? 'Enabled' : 'Disabled'}`,
    });
    this.saveAndNotify();
  }

  public runWorkflowManually(id: string, actorName: string, actorRole: string): WorkflowExecutionLog | null {
    const idx = this.state.workflows.findIndex((w) => w.id === id);
    if (idx < 0) return null;
    const wf = this.state.workflows[idx];
    const now = nowIso();
    const status: WorkflowExecutionLog['status'] = wf.enabled ? 'Success' : 'Skipped';
    const log: WorkflowExecutionLog = {
      id: genId('WFL'),
      workflowId: wf.id,
      workflowName: wf.name,
      workspaceId: wf.workspaceId,
      status,
      targetEntity: 'Manual Test Execution',
      message: wf.enabled
        ? `Executed action "${wf.actionSummary}" for trigger ${wf.trigger}.`
        : 'Skipped because rule is currently disabled.',
      executedAt: now,
    };
    if (wf.enabled) {
      this.state.workflows[idx] = { ...wf, lastRunAt: now, runCount: wf.runCount + 1 };
    }
    this.state.workflowLogs = [log, ...this.state.workflowLogs].slice(0, 200);
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: wf.workspaceId,
      entityType: 'Workflow',
      entityId: wf.id,
      action: 'RUN_WORKFLOW',
      summary: `Manual workflow run (${status}): ${wf.name}`,
    });
    this.saveAndNotify();
    return log;
  }

  private triggerWorkflow(
    trigger: AutomationWorkflow['trigger'],
    workspaceId: string,
    targetEntity: string
  ): void {
    const matching = this.state.workflows.filter(
      (w) => w.trigger === trigger && (w.workspaceId === 'ALL' || w.workspaceId === workspaceId)
    );
    const now = nowIso();
    matching.forEach((wf) => {
      const idx = this.state.workflows.findIndex((x) => x.id === wf.id);
      if (wf.enabled && idx >= 0) {
        this.state.workflows[idx] = {
          ...wf,
          lastRunAt: now,
          runCount: wf.runCount + 1,
        };
      }
      const log: WorkflowExecutionLog = {
        id: genId('WFL'),
        workflowId: wf.id,
        workflowName: wf.name,
        workspaceId,
        status: wf.enabled ? 'Success' : 'Skipped',
        targetEntity,
        message: wf.enabled
          ? `Automated execution: ${wf.actionSummary}`
          : `Skipped disabled rule on ${targetEntity}`,
        executedAt: now,
      };
      this.state.workflowLogs = [log, ...this.state.workflowLogs].slice(0, 200);
    });
  }

  // --------------------------------------------------------------------------
  // MIGRATION LOGS, FINANCE, NOTIFICATIONS & MANDATORY ACTIVITY LOGS
  // --------------------------------------------------------------------------

  public getMigrationLogs(): MigrationImportLog[] {
    return this.state.migrationLogs;
  }

  public recordMigrationImport(
    logInput: Omit<MigrationImportLog, 'id' | 'createdAt'>,
    actorRole: string
  ): MigrationImportLog {
    const log: MigrationImportLog = {
      ...logInput,
      id: genId('MIG'),
      createdAt: nowIso(),
    };
    this.state.migrationLogs = [log, ...this.state.migrationLogs];
    this.triggerWorkflow('MIGRATION_COMPLETED', log.targetWorkspaceId, `${log.fileName} -> ${log.targetEntity}`);
    this.addNotification({
      workspaceId: log.targetWorkspaceId,
      clientId: log.targetClientId,
      title: `Migration Completed: ${log.targetEntity}`,
      message: `Imported ${log.importedCount} rows into ${log.targetWorkspaceId} (${log.duplicateSkippedCount} duplicates skipped, ${log.errorCount} errors).`,
      category: 'Migration',
      linkPath: '/settings',
    });
    this.recordActivity({
      actor: log.importedBy,
      actorRole,
      workspaceId: log.targetWorkspaceId,
      clientId: log.targetClientId,
      entityType: 'MigrationImport',
      entityId: log.id,
      action: 'EXECUTE_DATA_MIGRATION',
      summary: `${log.fileName} -> ${log.targetEntity}: ${log.importedCount} imported, ${log.duplicateSkippedCount} duplicates, ${log.errorCount} errors`,
    });
    this.saveAndNotify();
    return log;
  }

  public getFinanceEntries(workspaceFilter?: string): OpsFinanceEntry[] {
    if (!workspaceFilter || workspaceFilter === 'ALL') return this.state.financeEntries;
    return this.state.financeEntries.filter((f) => f.workspaceId === workspaceFilter);
  }

  public addFinanceEntry(
    entry: Omit<OpsFinanceEntry, 'id' | 'createdAt'>,
    actorName: string,
    actorRole: string
  ): OpsFinanceEntry {
    const saved: OpsFinanceEntry = {
      ...entry,
      id: genId('FIN'),
      createdAt: nowIso(),
    };
    this.state.financeEntries = [saved, ...this.state.financeEntries];
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: saved.workspaceId,
      clientId: saved.clientId,
      entityType: 'Finance',
      entityId: saved.id,
      action: 'CREATE_FINANCE_ENTRY',
      summary: `${saved.type} ${saved.referenceNo} · INR ${saved.amountInr}`,
    });
    this.saveAndNotify();
    return saved;
  }

  public updateFinanceStatus(
    id: string,
    status: OpsFinanceEntry['status'],
    actorName: string,
    actorRole: string
  ): void {
    const idx = this.state.financeEntries.findIndex((f) => f.id === id);
    if (idx < 0) return;
    const prev = this.state.financeEntries[idx];
    this.state.financeEntries[idx] = { ...prev, status };
    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: prev.workspaceId,
      clientId: prev.clientId,
      entityType: 'Finance',
      entityId: id,
      action: 'UPDATE_FINANCE_STATUS',
      summary: `${prev.referenceNo}: ${prev.status} -> ${status}`,
    });
    this.saveAndNotify();
  }

  public getNotifications(workspaceFilter?: string): OpsNotification[] {
    if (!workspaceFilter || workspaceFilter === 'ALL') return this.state.notifications;
    return this.state.notifications.filter(
      (n) => n.workspaceId === workspaceFilter || n.workspaceId === 'ALL'
    );
  }

  public addNotification(input: Omit<OpsNotification, 'id' | 'read' | 'createdAt'>): void {
    const notif: OpsNotification = {
      ...input,
      id: genId('NTF'),
      read: false,
      createdAt: nowIso(),
    };
    this.state.notifications = [notif, ...this.state.notifications].slice(0, 150);
  }

  public markNotificationRead(id: string): void {
    this.state.notifications = this.state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.saveAndNotify();
  }

  public markAllNotificationsRead(): void {
    this.state.notifications = this.state.notifications.map((n) => ({ ...n, read: true }));
    this.saveAndNotify();
  }

  public getActivityLogs(workspaceFilter?: string, clientId?: string): OpsActivityLog[] {
    return this.state.activityLogs.filter((l) => {
      if (clientId && l.clientId !== clientId) return false;
      if (workspaceFilter && workspaceFilter !== 'ALL' && l.workspaceId !== workspaceFilter && l.workspaceId !== 'ALL') {
        return false;
      }
      return true;
    });
  }

  public recordActivity(entry: Omit<OpsActivityLog, 'id' | 'timestamp'>): void {
    const log: OpsActivityLog = {
      ...entry,
      id: genId('ACT'),
      timestamp: nowIso(),
    };
    this.state.activityLogs = [log, ...this.state.activityLogs].slice(0, 500);
  }

  public logExternalActivity(entry: Omit<OpsActivityLog, 'id' | 'timestamp'>): void {
    this.recordActivity(entry);
    this.saveAndNotify();
  }

  public ensureClientForWorkspace(input: {
    workspaceKey: string;
    name: string;
    code: string;
    industry?: string;
    contactName?: string;
    contactPhone?: string;
  }): WorkspaceClient {
    const existing = this.state.clients.find(
      (c) => c.workspaceKey.toUpperCase() === input.workspaceKey.toUpperCase()
    );
    if (existing) return existing;
    const now = nowIso();
    const created: WorkspaceClient = {
      id: `client-${input.workspaceKey.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      code: input.code,
      name: input.name,
      workspaceKey: input.workspaceKey.toUpperCase(),
      industry: input.industry || 'Brand Operations Workspace',
      status: 'Active System',
      moduleScope:
        input.workspaceKey.toUpperCase() === 'INDIA_POST'
          ? 'FULL_INDIA_POST'
          : input.workspaceKey.toUpperCase() === 'XPEEDO_EV'
          ? 'EV_WORK_MGMT'
          : 'BASIC_PROFILE_ONLY',
      futureModuleEnabled: true,
      accountManager: input.contactName || 'Master Admin',
      contactName: input.contactName || input.name,
      contactEmail: '',
      contactPhone: input.contactPhone || '',
      city: 'Kota',
      regionLabel: 'Rajasthan',
      notes: `Auto-provisioned brand workspace for ${input.name}.`,
      createdAt: now,
      updatedAt: now,
    };
    this.state.clients = [...this.state.clients, created];
    this.saveAndNotify();
    return created;
  }

  public reassignEntityWorkspace(
    entityType: 'Department' | 'Project' | 'Task',
    id: string,
    targetWorkspaceKey: string,
    actorName: string,
    actorRole: string
  ): boolean {
    const ws = targetWorkspaceKey.toUpperCase();
    const targetClient =
      this.state.clients.find((c) => c.workspaceKey.toUpperCase() === ws) ||
      this.ensureClientForWorkspace({ workspaceKey: ws, name: ws, code: ws });
    const now = nowIso();

    if (entityType === 'Department') {
      const idx = this.state.departments.findIndex((d) => d.id === id);
      if (idx < 0) return false;
      this.state.departments[idx] = {
        ...this.state.departments[idx],
        workspaceId: ws,
        clientId: targetClient.id,
      };
    } else if (entityType === 'Project') {
      const idx = this.state.projects.findIndex((p) => p.id === id);
      if (idx < 0) return false;
      this.state.projects[idx] = {
        ...this.state.projects[idx],
        workspaceId: ws,
        clientId: targetClient.id,
        updatedAt: now,
      };
    } else if (entityType === 'Task') {
      const idx = this.state.tasks.findIndex((t) => t.id === id);
      if (idx < 0) return false;
      this.state.tasks[idx] = {
        ...this.state.tasks[idx],
        workspaceId: ws,
        clientId: targetClient.id,
        updatedAt: now,
      };
    }

    this.recordActivity({
      actor: actorName,
      actorRole,
      workspaceId: ws,
      clientId: targetClient.id,
      entityType,
      entityId: id,
      action: 'SECTOR_REASSIGN',
      summary: `Reassigned ${entityType} ${id} to workspace ${ws}`,
    });
    this.saveAndNotify();
    return true;
  }
}

export const xpeedoOpsService = new XpeedoOpsService();
