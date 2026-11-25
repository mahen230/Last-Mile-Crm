export type PlatformRbacRole =
  | 'OWNER_SUPER_ADMIN'
  | 'BUSINESS_ADMIN'
  | 'CLIENT_ADMIN'
  | 'PROJECT_MANAGER'
  | 'DEPARTMENT_MANAGER'
  | 'TEAM_LEADER'
  | 'EMPLOYEE'
  | 'VIEWER';

export type RbacCapabilityKey =
  | 'viewOwnerCommand'
  | 'manageClients'
  | 'toggleFutureModules'
  | 'manageProjects'
  | 'manageTasks'
  | 'manageDepartments'
  | 'manageEmployees'
  | 'approveTeamLeader'
  | 'approveProjectManager'
  | 'approveOwner'
  | 'manageSrm'
  | 'manageWorkflows'
  | 'manageFinance'
  | 'importMigration'
  | 'exportReports'
  | 'manageRbac';

export type RolePermissionMatrix = Record<PlatformRbacRole, Record<RbacCapabilityKey, boolean>>;

export type WorkspaceClientStatus = 'Active System' | 'Basic Profile Only' | 'Onboarding' | 'Paused';

export type ClientModuleScope = 'FULL_INDIA_POST' | 'EV_WORK_MGMT' | 'BASIC_PROFILE_ONLY';

export interface WorkspaceClient {
  id: string;
  code: string;
  name: string;
  workspaceKey: string;
  industry: string;
  status: WorkspaceClientStatus;
  moduleScope: ClientModuleScope;
  futureModuleEnabled: boolean;
  accountManager: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  regionLabel: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientCommunicationEntry {
  id: string;
  clientId: string;
  workspaceId: string;
  channel: 'Email' | 'Phone Call' | 'Meeting' | 'WhatsApp' | 'System Note';
  subject: string;
  summary: string;
  participants: string;
  loggedBy: string;
  occurredAt: string;
}

export interface ClientRequirementEntry {
  id: string;
  clientId: string;
  workspaceId: string;
  title: string;
  moduleArea: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Draft' | 'In Review' | 'Approved' | 'Implemented';
  ownerName: string;
  acceptanceCriteria: string;
  createdAt: string;
}

export interface ClientDeliverableEntry {
  id: string;
  clientId: string;
  workspaceId: string;
  projectId?: string;
  title: string;
  dueDate: string;
  ownerName: string;
  status: 'Pending' | 'Submitted' | 'Client Approved' | 'Revision Requested';
  signoffBy?: string;
  notes?: string;
  createdAt: string;
}

export interface OpsDocumentEntry {
  id: string;
  clientId: string;
  workspaceId: string;
  projectId?: string;
  title: string;
  category: 'MoU / Contract' | 'SOP / Playbook' | 'Technical Spec' | 'Statutory Record' | 'Report';
  version: string;
  referenceUrl?: string;
  uploadedBy: string;
  status: 'Active' | 'Under Review' | 'Archived';
  createdAt: string;
}

export interface OpsDepartment {
  id: string;
  workspaceId: string;
  clientId: string;
  name: string;
  code: string;
  headName: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Archived';

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface OpsProject {
  id: string;
  code: string;
  title: string;
  clientId: string;
  workspaceId: string;
  departmentId?: string;
  managerName: string;
  status: ProjectStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  startDate: string;
  dueDate: string;
  budgetInr: number;
  description: string;
  milestones: ProjectMilestone[];
  createdAt: string;
  updatedAt: string;
}

export type OpsTaskStatus =
  | 'Backlog'
  | 'Assigned'
  | 'In Progress'
  | 'Under Review'
  | 'Testing'
  | 'Blocked'
  | 'Completed'
  | 'Cancelled';

export const ALL_OPS_TASK_STATUSES: OpsTaskStatus[] = [
  'Backlog',
  'Assigned',
  'In Progress',
  'Under Review',
  'Testing',
  'Blocked',
  'Completed',
  'Cancelled',
];

export interface TaskSubtask {
  id: string;
  title: string;
  done: boolean;
}

export interface TaskTimeLog {
  id: string;
  actor: string;
  hours: number;
  note: string;
  loggedAt: string;
}

export interface TaskComment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  fileType: string;
  sizeLabel: string;
  addedBy: string;
  addedAt: string;
}

export type MultiTierApprovalStage =
  | 'NONE'
  | 'PENDING_TL'
  | 'PENDING_PM'
  | 'PENDING_OWNER'
  | 'APPROVED'
  | 'REJECTED';

export interface ApprovalAuditStep {
  stage: MultiTierApprovalStage;
  decision: 'Submitted' | 'Approved' | 'Rejected' | string;
  actor: string;
  actorRole: string;
  note?: string;
  timestamp: string;
}

export interface OpsTask {
  id: string;
  code: string;
  title: string;
  description: string;
  clientId: string;
  workspaceId: string;
  projectId: string;
  departmentId?: string;
  milestoneId?: string;
  assigneeId: string;
  assigneeName: string;
  reviewerName?: string;
  status: OpsTaskStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  startDate: string;
  dueDate: string;
  estimatedHours: number;
  loggedHours: number;
  blockedByTaskIds: string[];
  subtasks: TaskSubtask[];
  timeLogs: TaskTimeLog[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  approvalStage: MultiTierApprovalStage;
  createdBy: string;
  assignedBeat?: string;
  assignedOffice?: string;
  postCategory?: string;
  handoffNote?: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkReportPeriod = 'Daily' | 'Weekly' | 'Monthly';

export interface WorkReport {
  id: string;
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
  approvalStage: Exclude<MultiTierApprovalStage, 'NONE'>;
  approvalHistory: ApprovalAuditStep[];
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type SrmTicketCategory =
  | 'Delivery Delay'
  | 'Address Correction'
  | 'PLI/RPLI Inquiry'
  | 'Savings/IPPB'
  | 'Aadhaar/CELC'
  | 'Beat Dispute'
  | 'Staff Grievance';

export type SrmTicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type SrmTicketStatus =
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'Escalated'
  | 'Resolved'
  | 'Closed';

export interface IndiaPostSrmTicket {
  id: string;
  ticketNo: string;
  workspaceId: 'INDIA_POST';
  clientId: 'client-india-post';
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
  status: SrmTicketStatus;
  assignedTo: string;
  assignedPostRole?: string;
  postCategory?: string;
  escalatedTo?: string;
  slaHours: number;
  slaDueAt: string;
  resolutionNotes?: string;
  timeline: { timestamp: string; actor: string; note: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface IndiaPostAttendanceEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  officeName: string;
  beatNo: string;
  date: string;
  status: 'Present' | 'Field Duty' | 'Half Day' | 'On Leave' | 'Absent';
  leaveReason?: string;
  remarks?: string;
  updatedAt: string;
}

export type WorkflowTriggerType =
  | 'SRM_TICKET_CREATED'
  | 'TASK_BLOCKED'
  | 'WORK_REPORT_SUBMITTED'
  | 'LEAD_CREATED'
  | 'MIGRATION_COMPLETED';

export interface AutomationWorkflow {
  id: string;
  name: string;
  workspaceId: string;
  trigger: WorkflowTriggerType;
  conditionSummary: string;
  actionSummary: string;
  enabled: boolean;
  lastRunAt?: string;
  runCount: number;
  createdBy: string;
  createdAt: string;
}

export interface WorkflowExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  workspaceId: string;
  status: 'Success' | 'Skipped' | 'Error';
  targetEntity: string;
  message: string;
  executedAt: string;
}

export type MigrationEntityType =
  | 'Customers'
  | 'Properties'
  | 'Offices'
  | 'Employees'
  | 'Projects'
  | 'Tasks'
  | 'SRM Tickets';

export interface MigrationImportLog {
  id: string;
  fileName: string;
  fileType: 'xlsx' | 'xls' | 'csv';
  targetWorkspaceId: string;
  targetClientId: string;
  targetEntity: MigrationEntityType;
  totalRows: number;
  importedCount: number;
  duplicateSkippedCount: number;
  errorCount: number;
  errorsSample: { row: number; reason: string }[];
  importedBy: string;
  createdAt: string;
}

export interface OpsFinanceEntry {
  id: string;
  clientId: string;
  workspaceId: string;
  type: 'Retainer Invoice' | 'Milestone Billing' | 'Operational Expense' | 'Fuel & Allowance';
  referenceNo: string;
  description: string;
  amountInr: number;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Paid' | 'Overdue';
  dueDate: string;
  createdBy: string;
  createdAt: string;
}

export interface OpsNotification {
  id: string;
  workspaceId: string;
  clientId?: string;
  title: string;
  message: string;
  category: 'Approval' | 'SLA' | 'Task' | 'Migration' | 'Workflow';
  read: boolean;
  linkPath: string;
  createdAt: string;
}

export interface OpsActivityLog {
  id: string;
  actor: string;
  actorRole: string;
  workspaceId: string;
  clientId?: string;
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  metadata?: Record<string, string | number | boolean>;
  timestamp: string;
}
