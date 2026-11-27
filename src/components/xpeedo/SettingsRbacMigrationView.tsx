import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  History,
  Settings,
  ShieldCheck,
  Upload,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../auth/FirebaseAuthProvider';
import {
  ALL_PLATFORM_ROLES,
  ALL_RBAC_CAPABILITIES,
  exportCsvWithBom,
  PLATFORM_RBAC_ROLE_META,
  xpeedoOpsService,
} from '../../services/xpeedoOpsService';
import { customerService } from '../../services/customerService';
import { staffPermissionService } from '../../services/staffPermissionService';
import { whiteLabelMasterService } from '../../services/whiteLabelMasterService';
import {
  MigrationEntityType,
  PlatformRbacRole,
  RbacCapabilityKey,
} from '../../types/xpeedoOps';
import SettingsView from '../crm/SettingsView';
import BrandProfilesAndSectorRoutingView from './BrandProfilesAndSectorRoutingView';
import {
  CANONICAL_BACKUP_SYNC_EMAILS,
  dataConsolidationService,
} from '../../services/dataConsolidationService';

type SettingsTab = 'RBAC' | 'BRAND_LOGINS' | 'SECTOR_ROUTING' | 'MIGRATION' | 'AUDIT_LOGS' | 'LEGACY_POSTAL';

interface MigrationFieldSpec {
  key: string;
  label: string;
  required?: boolean;
}

const ENTITY_FIELD_SPECS: Record<MigrationEntityType, MigrationFieldSpec[]> = {
  Customers: [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'mobile', label: 'Mobile (10-digit)' },
    { key: 'houseNo', label: 'House / Plot No' },
    { key: 'colony', label: 'Colony / Area' },
    { key: 'sector', label: 'Sector / Block' },
    { key: 'pincode', label: 'PIN Code (6-digit)' },
    { key: 'beatNo', label: 'Beat No' },
    { key: 'occupation', label: 'Occupation / Segment' },
  ],
  Properties: [
    { key: 'houseNo', label: 'House / Plot No', required: true },
    { key: 'colony', label: 'Colony / Area', required: true },
    { key: 'sector', label: 'Sector / Block' },
    { key: 'pincode', label: 'PIN Code (6-digit)' },
    { key: 'beatNo', label: 'Beat No' },
    { key: 'residentName', label: 'Head / Owner Name' },
    { key: 'mobile', label: 'Contact Mobile' },
  ],
  Offices: [
    { key: 'officeName', label: 'Office Name', required: true },
    { key: 'pincode', label: 'PIN Code (6-digit)', required: true },
    { key: 'officeType', label: 'Office Type (HPO/SO/BO)' },
    { key: 'subDivision', label: 'Sub-Division' },
    { key: 'district', label: 'District' },
  ],
  Employees: [
    { key: 'employeeId', label: 'Employee ID', required: true },
    { key: 'name', label: 'Full Name', required: true },
    { key: 'role', label: 'Role' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'assignedOffice', label: 'Assigned Office' },
    { key: 'beat', label: 'Beat' },
  ],
  Projects: [
    { key: 'code', label: 'Project Code' },
    { key: 'title', label: 'Project Title', required: true },
    { key: 'managerName', label: 'Project Manager' },
    { key: 'status', label: 'Status' },
    { key: 'dueDate', label: 'Due Date (YYYY-MM-DD)' },
    { key: 'budgetInr', label: 'Budget (INR)' },
  ],
  Tasks: [
    { key: 'title', label: 'Task Title', required: true },
    { key: 'projectId', label: 'Project ID or Code' },
    { key: 'assigneeName', label: 'Assignee Name' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'dueDate', label: 'Due Date (YYYY-MM-DD)' },
    { key: 'estimatedHours', label: 'Estimated Hours' },
  ],
  'SRM Tickets': [
    { key: 'subject', label: 'Subject', required: true },
    { key: 'customerName', label: 'Customer Name', required: true },
    { key: 'customerMobile', label: 'Customer Mobile' },
    { key: 'officeName', label: 'Office Name' },
    { key: 'pincode', label: 'PIN Code' },
    { key: 'beatNo', label: 'Beat No' },
    { key: 'category', label: 'SRM Category' },
    { key: 'priority', label: 'Priority' },
  ],
  Staff: [
    { key: 'employeeId', label: 'Employee ID', required: true },
    { key: 'name', label: 'Staff Name', required: true },
    { key: 'mobile', label: 'Mobile (10-digit)', required: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Designation / Role' },
    { key: 'assignedOffice', label: 'Post Office / Hub' },
    { key: 'pincode', label: 'PIN Code' },
    { key: 'beat', label: 'Beat No' },
  ],
  Leads: [
    { key: 'customerName', label: 'Customer Name', required: true },
    { key: 'customerMobile', label: 'Customer Mobile', required: true },
    { key: 'productName', label: 'Product / Scheme', required: true },
    { key: 'productCode', label: 'Product Code' },
    { key: 'estimatedValue', label: 'Estimated Value (INR)' },
    { key: 'stage', label: 'Lead Stage' },
    { key: 'beatNo', label: 'Beat No' },
    { key: 'pincode', label: 'PIN Code' },
  ],
  'Product Sales': [
    { key: 'orderNumber', label: 'Order / Receipt No.', required: true },
    { key: 'productName', label: 'Product Name', required: true },
    { key: 'customerName', label: 'Customer Name', required: true },
    { key: 'customerMobile', label: 'Customer Mobile', required: true },
    { key: 'quantity', label: 'Quantity' },
    { key: 'amountInr', label: 'Amount (INR)' },
    { key: 'paymentMode', label: 'Payment Mode (COD/UPI/IPPB/Invoice)' },
    { key: 'status', label: 'Status' },
  ],
};

interface ParsedPreviewRow {
  rowIndex: number;
  mapped: Record<string, string>;
  errors: string[];
  isDuplicate: boolean;
  duplicateReason?: string;
}

const VALID_SETTINGS_TABS = new Set<SettingsTab>([
  'RBAC',
  'BRAND_LOGINS',
  'SECTOR_ROUTING',
  'MIGRATION',
  'AUDIT_LOGS',
  'LEGACY_POSTAL',
]);

export default function SettingsRbacMigrationView() {
  const { userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tick, setTick] = useState(0);
  const initialTabParam = (searchParams.get('tab') || '').toUpperCase() as SettingsTab;
  const [activeTab, setActiveTabState] = useState<SettingsTab>(
    VALID_SETTINGS_TABS.has(initialTabParam) ? initialTabParam : 'RBAC'
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingConsolidationAction, setPendingConsolidationAction] = useState<
    'CONSOLIDATE' | 'CONSOLIDATE_AND_RESET' | null
  >(null);

  const setActiveTab = (next: SettingsTab) => {
    setActiveTabState(next);
    const params = new URLSearchParams(searchParams);
    params.set('tab', next);
    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    const t = (searchParams.get('tab') || '').toUpperCase() as SettingsTab;
    if (VALID_SETTINGS_TABS.has(t) && t !== activeTab) {
      setActiveTabState(t);
    }
  }, [searchParams, activeTab]);

  // Role Preview State
  const simulatedRole = xpeedoOpsService.getSimulatedRole();
  const simulatedClientId = xpeedoOpsService.getSimulatedClientId();

  // Excel/CSV Migration Wizard State
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string>('INDIA_POST');
  const [targetEntity, setTargetEntity] = useState<MigrationEntityType>('Tasks');
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<'xlsx' | 'xls' | 'csv'>('xlsx');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Array<Record<string, unknown>>>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [lastErrorRows, setLastErrorRows] = useState<Array<{ row: number; reason: string }>>([]);

  // Audit Log Filters
  const [auditSearch, setAuditSearch] = useState('');
  const [auditWsFilter, setAuditWsFilter] = useState('ALL');

  useEffect(() => {
    const u1 = xpeedoOpsService.subscribe(() => setTick((t) => t + 1));
    const u2 = customerService.subscribe(() => setTick((t) => t + 1));
    const u3 = staffPermissionService.subscribe(() => setTick((t) => t + 1));
    return () => {
      u1();
      u2();
      u3();
    };
  }, []);

  const currentRole = xpeedoOpsService.resolvePlatformRole(userProfile);
  const canManageRbac = xpeedoOpsService.canPerform(userProfile, 'manageRbac');
  const canImport = xpeedoOpsService.canPerform(userProfile, 'importMigration');
  const roleMatrix = xpeedoOpsService.getRolePermissions();
  const clients = xpeedoOpsService.getClients(userProfile);
  const migrationLogs = xpeedoOpsService.getMigrationLogs();
  const activityLogs = xpeedoOpsService.getActivityLogs(auditWsFilter);
  const consolidationPreview = useMemo(
    () => dataConsolidationService.previewConsolidationStatus(),
    [tick]
  );

  const filteredActivityLogs = useMemo(() => {
    const q = auditSearch.trim().toLowerCase();
    if (!q) return activityLogs;
    return activityLogs.filter((l) =>
      `${l.actor} ${l.actorRole} ${l.entityType} ${l.action} ${l.summary} ${l.workspaceId}`
        .toLowerCase()
        .includes(q)
    );
  }, [activityLogs, auditSearch]);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 5000);
  };

  // Enforce workspace isolation: commercial entities must stay out of INDIA_POST unless explicitly postal
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    const detectedType: 'xlsx' | 'xls' | 'csv' =
      ext === 'csv' ? 'csv' : ext === 'xls' ? 'xls' : 'xlsx';
    setFileName(file.name);
    setFileType(detectedType);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) return;
      const sheet = workbook.Sheets[firstSheet];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      if (rows.length === 0) {
        showNotice('Uploaded file has 0 data rows.');
        return;
      }
      const headers = Object.keys(rows[0]);
      setRawHeaders(headers);
      setRawRows(rows);

      // Auto-map matching headers
      const specs = ENTITY_FIELD_SPECS[targetEntity];
      const autoMap: Record<string, string> = {};
      specs.forEach((spec) => {
        const match = headers.find((h) => {
          const normH = h.toLowerCase().replace(/[^a-z0-9]/g, '');
          const normK = spec.key.toLowerCase();
          const normL = spec.label.toLowerCase().replace(/[^a-z0-9]/g, '');
          return normH === normK || normH === normL || normH.includes(normK);
        });
        if (match) autoMap[spec.key] = match;
      });
      setColumnMap(autoMap);
      setLastErrorRows([]);
      showNotice(`Loaded ${rows.length} rows from "${file.name}". Review mapping below.`);
    } catch (err) {
      showNotice(
        `Failed to parse spreadsheet: ${err instanceof Error ? err.message : 'Invalid file format'}`
      );
    }
  };

  const previewRows = useMemo<ParsedPreviewRow[]>(() => {
    if (rawRows.length === 0) return [];
    const specs = ENTITY_FIELD_SPECS[targetEntity];

    const existingCustomers = customerService.getCustomers();
    const existingOffices = staffPermissionService.getDynamicOffices();
    const existingProjects = xpeedoOpsService.getProjects(targetWorkspaceId);
    const existingTasks = xpeedoOpsService.getTasks(targetWorkspaceId);

    const seenInBatch = new Set<string>();

    return rawRows.map((row, idx) => {
      const mapped: Record<string, string> = {};
      specs.forEach((spec) => {
        const srcHeader = columnMap[spec.key];
        mapped[spec.key] = srcHeader ? String(row[srcHeader] ?? '').trim() : '';
      });

      const errors: string[] = [];
      specs.forEach((spec) => {
        if (spec.required && !mapped[spec.key]) {
          errors.push(`Missing required "${spec.label}"`);
        }
      });

      if (mapped.mobile && !/^\d{10}$/.test(mapped.mobile.replace(/\D/g, ''))) {
        errors.push('Mobile must be 10 digits');
      }
      if (mapped.pincode && !/^\d{6}$/.test(mapped.pincode)) {
        errors.push('PIN Code must be 6 digits');
      }

      let isDuplicate = false;
      let duplicateReason = '';
      if (targetEntity === 'Customers') {
        const mob = (mapped.mobile || '').replace(/\D/g, '');
        const key = `${mapped.name?.toLowerCase()}|${mob}`;
        if (seenInBatch.has(key)) {
          isDuplicate = true;
          duplicateReason = 'Duplicate within uploaded file';
        } else if (
          mob &&
          existingCustomers.some((c) => (c.mobile || '').replace(/\D/g, '') === mob)
        ) {
          isDuplicate = true;
          duplicateReason = 'Customer mobile already exists';
        }
        seenInBatch.add(key);
      } else if (targetEntity === 'Properties') {
        const sig = `${mapped.houseNo?.toLowerCase()}|${mapped.colony?.toLowerCase()}|${mapped.pincode}`;
        if (seenInBatch.has(sig)) {
          isDuplicate = true;
          duplicateReason = 'Duplicate property in batch';
        }
        seenInBatch.add(sig);
      } else if (targetEntity === 'Offices') {
        const sig = `${mapped.officeName?.toLowerCase()}|${mapped.pincode}`;
        if (
          seenInBatch.has(sig) ||
          existingOffices.some(
            (o) =>
              o.officeName.toLowerCase() === mapped.officeName?.toLowerCase() &&
              o.pincode === mapped.pincode
          )
        ) {
          isDuplicate = true;
          duplicateReason = 'Office + PIN already exists';
        }
        seenInBatch.add(sig);
      } else if (targetEntity === 'Projects') {
        const sig = (mapped.code || mapped.title || '').toLowerCase();
        if (
          seenInBatch.has(sig) ||
          existingProjects.some(
            (p) => p.title.toLowerCase() === mapped.title?.toLowerCase()
          )
        ) {
          isDuplicate = true;
          duplicateReason = 'Project title already exists in workspace';
        }
        seenInBatch.add(sig);
      } else if (targetEntity === 'Tasks') {
        const sig = `${mapped.title?.toLowerCase()}|${mapped.projectId?.toLowerCase()}`;
        if (
          seenInBatch.has(sig) ||
          existingTasks.some((t) => t.title.toLowerCase() === mapped.title?.toLowerCase())
        ) {
          isDuplicate = true;
          duplicateReason = 'Task title already exists in workspace';
        }
        seenInBatch.add(sig);
      } else if (targetEntity === 'Staff' || targetEntity === 'Employees') {
        const sig = (mapped.employeeId || mapped.mobile || '').toLowerCase();
        if (seenInBatch.has(sig)) {
          isDuplicate = true;
          duplicateReason = 'Duplicate staff ID or mobile in batch';
        }
        seenInBatch.add(sig);
      } else if (targetEntity === 'Leads') {
        const sig = `${mapped.customerMobile}|${mapped.productName?.toLowerCase()}`;
        if (seenInBatch.has(sig)) {
          isDuplicate = true;
          duplicateReason = 'Duplicate lead in batch';
        }
        seenInBatch.add(sig);
      } else if (targetEntity === 'Product Sales') {
        const sig = (mapped.orderNumber || '').toLowerCase();
        if (seenInBatch.has(sig)) {
          isDuplicate = true;
          duplicateReason = 'Duplicate order number in batch';
        }
        seenInBatch.add(sig);
      }

      return {
        rowIndex: idx + 2,
        mapped,
        errors,
        isDuplicate,
        duplicateReason,
      };
    });
  }, [rawRows, targetEntity, columnMap, targetWorkspaceId]);

  const executeMigrationImport = () => {
    if (previewRows.length === 0) return;
    const targetClient =
      clients.find((c) => c.workspaceKey === targetWorkspaceId) ||
      clients.find((c) => c.workspaceKey === 'INDIA_POST') ||
      clients[0];
    const targetClientId = targetClient?.id || 'client-india-post';
    const actorName = userProfile?.name || 'Admin';

    let importedCount = 0;
    let duplicateSkippedCount = 0;
    const errorSample: Array<{ row: number; reason: string }> = [];

    previewRows.forEach((row) => {
      if (row.errors.length > 0) {
        errorSample.push({ row: row.rowIndex, reason: row.errors.join('; ') });
        return;
      }
      if (row.isDuplicate && skipDuplicates) {
        duplicateSkippedCount += 1;
        return;
      }

      const m = row.mapped;
      try {
        if (targetEntity === 'Customers') {
          customerService.addOrUpdateCustomer(
            {
              name: m.name,
              mobile: m.mobile ? m.mobile.replace(/\D/g, '') : undefined,
              houseNo: m.houseNo,
              colony: m.colony || 'Keshavpura',
              area: m.colony || 'Keshavpura',
              sector: m.sector || 'Sector 1',
              pincode: m.pincode || '324009',
              beatNo: m.beatNo || 'Beat 1',
              occupation: m.occupation || '',
              brandId: targetWorkspaceId === 'INDIA_POST' ? 'india-post' : targetWorkspaceId.toLowerCase(),
            },
            `Migration:${fileName}`
          );
          importedCount += 1;
        } else if (targetEntity === 'Properties') {
          customerService.addOrUpdateCustomer(
            {
              name: m.residentName || `Resident (${m.houseNo})`,
              mobile: m.mobile ? m.mobile.replace(/\D/g, '') : undefined,
              houseNo: m.houseNo,
              colony: m.colony,
              area: m.colony,
              sector: m.sector || 'Sector 1',
              pincode: m.pincode || '324009',
              beatNo: m.beatNo || 'Beat 1',
              brandId: targetWorkspaceId === 'INDIA_POST' ? 'india-post' : targetWorkspaceId.toLowerCase(),
            },
            `PropertyMigration:${fileName}`
          );
          importedCount += 1;
        } else if (targetEntity === 'Offices') {
          staffPermissionService.upsertCustomOffice({
            officeName: m.officeName,
            pincode: m.pincode,
            officeType: (m.officeType as any) || 'SO',
            subDivision: m.subDivision || 'Kota',
            district: m.district || 'Kota',
            brandId: targetWorkspaceId === 'INDIA_POST' ? 'india-post' : targetWorkspaceId.toLowerCase(),
          });
          importedCount += 1;
        } else if (targetEntity === 'Employees' || targetEntity === 'Staff') {
          staffPermissionService.upsertStaffWithAutoOfficeAndBeat({
            employeeId: m.employeeId,
            name: m.name,
            contact: m.mobile || '0000000000',
            email: m.email || undefined,
            designationType: (m.role as any) || 'POSTMAN',
            role: (m.role as any) || 'POSTMAN',
            circle: 'Rajasthan Circle',
            division: 'Kota Division',
            headOffice: 'Kota HPO',
            subOffice: m.assignedOffice || 'Dadabari S.O.',
            officePincode: m.pincode || '324009',
            officeAddress: m.assignedOffice || 'Kota Division, Rajasthan',
            beat: m.beat || 'Beat 1',
            assignedColonies: [],
            partnerOrganization: 'India Post',
          });
          importedCount += 1;
        } else if (targetEntity === 'Leads') {
          const cleanMobile = (m.customerMobile || '').replace(/\D/g, '').slice(-10);
          const matchedCust = customerService.getCustomerByMobile(cleanMobile);
          customerService.createLead({
            customerId: matchedCust?.id || `CUST-${Date.now().toString().slice(-5)}`,
            customerName: m.customerName,
            customerMobile: cleanMobile,
            productCode: (m.productCode || 'GEN_LEAD').toUpperCase(),
            productName: m.productName,
            requirement: m.productName || 'Imported Lead',
            priority: 'Medium',
            leadScore: 60,
            estimatedValue: Number(m.estimatedValue) || 0,
            stage: (m.stage as any) || 'New',
            beatNo: m.beatNo || matchedCust?.beatNo || 'Beat 1',
            pincode: m.pincode || matchedCust?.pincode || '324009',
            assignedStaffName: actorName,
            brandId: targetWorkspaceId === 'INDIA_POST' ? 'india-post' : targetWorkspaceId.toLowerCase().replace(/_/g, '-'),
            source: `Migration:${fileName}`,
          });
          importedCount += 1;
        } else if (targetEntity === 'Product Sales') {
          const cleanSlug = targetWorkspaceId.toLowerCase().replace(/_/g, '-');
          whiteLabelMasterService.addProductSale({
            orderNumber: m.orderNumber,
            brandSlug: cleanSlug,
            brandName: targetClient?.name || targetWorkspaceId,
            workspaceKey: targetWorkspaceId,
            productName: m.productName,
            sku: 'SKU-MIG',
            customerName: m.customerName,
            customerMobile: (m.customerMobile || '').replace(/\D/g, '').slice(-10),
            pincode: '324009',
            beatNo: 'Beat 1',
            quantity: Math.max(1, Number(m.quantity) || 1),
            amountInr: Math.max(0, Number(m.amountInr) || 0),
            paymentMode: (['COD', 'UPI', 'IPPB', 'Invoice'].includes(m.paymentMode) ? m.paymentMode : 'UPI') as any,
            status: (['Booked', 'Dispatched', 'Delivered', 'Cancelled'].includes(m.status) ? m.status : 'Delivered') as any,
            soldBy: actorName,
          });
          importedCount += 1;
        } else if (targetEntity === 'Projects') {
          xpeedoOpsService.upsertProject(
            {
              code: m.code || '',
              title: m.title,
              clientId: targetClientId,
              workspaceId: targetWorkspaceId,
              managerName: m.managerName || actorName,
              status: (['Planning', 'Active', 'On Hold', 'Completed', 'Archived'].includes(m.status)
                ? m.status
                : 'Active') as any,
              priority: 'Medium',
              startDate: new Date().toISOString().split('T')[0],
              dueDate: m.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
              budgetInr: Number(m.budgetInr) || 0,
              description: `Imported via ${fileName}`,
              milestones: [],
            },
            actorName,
            currentRole
          );
          importedCount += 1;
        } else if (targetEntity === 'Tasks') {
          const fallbackProj = xpeedoOpsService.getProjects(targetWorkspaceId)[0];
          const projId = m.projectId || fallbackProj?.id || 'GENERAL';
          xpeedoOpsService.createTask(
            {
              title: m.title,
              description: `Imported via ${fileName}`,
              clientId: targetClientId,
              workspaceId: targetWorkspaceId,
              projectId: projId,
              assigneeId: '',
              assigneeName: m.assigneeName || actorName,
              status: (['Backlog', 'Assigned', 'In Progress', 'Under Review', 'Testing', 'Blocked', 'Completed', 'Cancelled'].includes(m.status)
                ? m.status
                : 'Assigned') as any,
              priority: (['Low', 'Medium', 'High', 'Urgent'].includes(m.priority)
                ? m.priority
                : 'Medium') as any,
              startDate: new Date().toISOString().split('T')[0],
              dueDate: m.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
              estimatedHours: Number(m.estimatedHours) || 4,
              blockedByTaskIds: [],
              approvalStage: 'NONE',
              createdBy: actorName,
            },
            actorName,
            currentRole
          );
          importedCount += 1;
        } else if (targetEntity === 'SRM Tickets') {
          xpeedoOpsService.createSrmTicket(
            {
              officeId: m.officeName || 'KOTA_DIV',
              officeName: m.officeName || 'Kota Division Office',
              pincode: m.pincode || '324009',
              beatNo: m.beatNo || 'Beat 1',
              customerName: m.customerName,
              customerMobile: m.customerMobile || '',
              category: 'Delivery Delay',
              subject: m.subject,
              description: `Imported from ${fileName}`,
              priority: (['Low', 'Medium', 'High', 'Critical'].includes(m.priority)
                ? m.priority
                : 'Medium') as any,
              assignedTo: actorName,
            },
            actorName,
            currentRole
          );
          importedCount += 1;
        }
      } catch (err) {
        errorSample.push({
          row: row.rowIndex,
          reason: err instanceof Error ? err.message : 'Write error',
        });
      }
    });

    xpeedoOpsService.recordMigrationImport(
      {
        fileName: fileName || 'upload',
        fileType,
        targetWorkspaceId,
        targetClientId,
        targetEntity,
        totalRows: previewRows.length,
        importedCount,
        duplicateSkippedCount,
        errorCount: errorSample.length,
        errorsSample: errorSample.slice(0, 50),
        importedBy: actorName,
      },
      currentRole
    );

    setLastErrorRows(errorSample);
    showNotice(
      `Migration committed to ${targetWorkspaceId}: ${importedCount} imported, ${duplicateSkippedCount} duplicates skipped, ${errorSample.length} errors.`
    );
  };

  const downloadTemplate = () => {
    const specs = ENTITY_FIELD_SPECS[targetEntity];
    exportCsvWithBom(
      `template_${targetEntity.toLowerCase().replace(/\s+/g, '_')}.csv`,
      specs.map((s) => s.key),
      []
    );
  };

  return (
    <div className="space-y-6" id="settings-rbac-migration-view">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-blue-400 uppercase font-semibold">
              Governance, Security &amp; Data Pipeline
            </div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
              <Settings size={20} className="text-blue-400" />
              <span>Settings, 8-Role RBAC &amp; Excel/CSV Migration</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Manage role capabilities, test workspace isolation live, import legacy Excel/CSV records, and audit every action.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: 'RBAC', label: '8-Role RBAC & Isolation' },
                { key: 'BRAND_LOGINS', label: 'Brand Logins & Passcodes' },
                { key: 'SECTOR_ROUTING', label: 'Sector Data Routing' },
                { key: 'MIGRATION', label: 'Excel / CSV Migration' },
                { key: 'AUDIT_LOGS', label: `Activity Audit (${activityLogs.length})` },
                { key: 'LEGACY_POSTAL', label: 'Postal Office Config' },
              ] as Array<{ key: SettingsTab; label: string }>
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={15} />
          <span>{notice}</span>
        </div>
      )}

      {/* TAB 1: 8-ROLE RBAC MATRIX & ROLE PREVIEW */}
      {activeTab === 'RBAC' && (
        <div className="space-y-6">
          {/* Interactive Role & Workspace Preview Switcher */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-blue-600" />
                  <span>Live Role &amp; Workspace Isolation Tester</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Preview the platform as any of the 8 enterprise roles and optionally lock scope to a single client workspace.
                </p>
              </div>
              {simulatedRole && (
                <button
                  type="button"
                  onClick={() =>
                    xpeedoOpsService.setSimulatedRolePreview(null, null, userProfile?.name || 'Owner')
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                >
                  Reset to Authenticated Role
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {ALL_PLATFORM_ROLES.map((roleKey) => {
                const isSelected = (simulatedRole || currentRole) === roleKey;
                const meta = PLATFORM_RBAC_ROLE_META[roleKey];
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() =>
                      xpeedoOpsService.setSimulatedRolePreview(
                        roleKey,
                        simulatedClientId,
                        userProfile?.name || 'Owner'
                      )
                    }
                    className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{meta.label}</div>
                    <div
                      className={`text-[11px] mt-1 leading-relaxed ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {meta.scopeSummary}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-slate-700">Lock Preview Scope to Client:</span>
              <select
                value={simulatedClientId || ''}
                onChange={(e) =>
                  xpeedoOpsService.setSimulatedRolePreview(
                    simulatedRole || currentRole,
                    e.target.value || null,
                    userProfile?.name || 'Owner'
                  )
                }
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
              >
                <option value="">Unrestricted (All Permitted by Role)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.workspaceKey})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 8 x 16 Capability Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">8-Role Capability Matrix</h2>
                <p className="text-xs text-slate-500">
                  Enforced across UI guards and service operations. Only Owner / Super Admin can edit capabilities.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Active Role: {PLATFORM_RBAC_ROLE_META[currentRole].label}
              </span>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-3 px-4 sticky left-0 bg-slate-50">Capability</th>
                  {ALL_PLATFORM_ROLES.map((r) => (
                    <th key={r} className="py-3 px-2.5 text-center whitespace-nowrap">
                      {PLATFORM_RBAC_ROLE_META[r].label.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ALL_RBAC_CAPABILITIES.map((cap) => (
                  <tr key={cap.key} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-medium text-slate-900 sticky left-0 bg-white">
                      {cap.label}
                    </td>
                    {ALL_PLATFORM_ROLES.map((r) => {
                      const allowed = Boolean(roleMatrix[r]?.[cap.key]);
                      const locked = r === 'OWNER_SUPER_ADMIN' && cap.key === 'manageRbac';
                      return (
                        <td key={r} className="py-2.5 px-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={allowed}
                            disabled={!canManageRbac || locked}
                            onChange={(e) =>
                              xpeedoOpsService.updateRoleCapability(
                                r as PlatformRbacRole,
                                cap.key as RbacCapabilityKey,
                                e.target.checked,
                                userProfile?.name || 'Owner'
                              )
                            }
                            className="w-4 h-4 accent-blue-600 cursor-pointer disabled:opacity-60"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EXCEL (.xlsx/.xls) & CSV MIGRATION PIPELINE */}
      {activeTab === 'MIGRATION' && (
        <div className="space-y-6">
          {/* India Post Data Consolidation & Non-Destructive Brand Reset */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Database size={18} className="text-red-700" />
                  <span>India Post Data Consolidation &amp; Non-Destructive Brand Reset</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Consolidates Property, Staff, and Citizen/Lead records into India Post modules while keeping other brands&apos; UI modules, schemas, and RBAC rules intact. Sync recipients:{' '}
                  <span className="font-mono text-slate-800">
                    {CANONICAL_BACKUP_SYNC_EMAILS.join(' · ')}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!canImport}
                  onClick={() => setPendingConsolidationAction('CONSOLIDATE')}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                >
                  Consolidate Other Brands into India Post
                </button>
                <button
                  type="button"
                  disabled={!canImport}
                  onClick={() => setPendingConsolidationAction('CONSOLIDATE_AND_RESET')}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                >
                  Consolidate &amp; Reset Non-India-Post Operational Data
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-slate-500">India Post Properties</div>
                <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                  {consolidationPreview.indiaPost.properties}
                </div>
                <div className="text-[11px] text-slate-500 tabular-nums">
                  {consolidationPreview.otherBrands.properties} in other brands
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-slate-500">India Post Staff</div>
                <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                  {consolidationPreview.indiaPost.staff}
                </div>
                <div className="text-[11px] text-slate-500 tabular-nums">
                  {consolidationPreview.otherBrands.staff} in other brands
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-slate-500">India Post Customers</div>
                <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                  {consolidationPreview.indiaPost.customers}
                </div>
                <div className="text-[11px] text-slate-500 tabular-nums">
                  {consolidationPreview.otherBrands.customers} in other brands
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-slate-500">India Post Leads / Ops</div>
                <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                  {consolidationPreview.indiaPost.leads}
                </div>
                <div className="text-[11px] text-slate-500 tabular-nums">
                  {consolidationPreview.otherBrands.leads + consolidationPreview.otherBrands.opsTasksAndReports} other brand items
                </div>
              </div>
            </div>

            {pendingConsolidationAction && (
              <div className="p-3.5 rounded-lg border border-amber-300 bg-amber-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-amber-950">
                  <span className="font-bold">
                    {pendingConsolidationAction === 'CONSOLIDATE_AND_RESET'
                      ? 'Confirm Consolidation & Non-Destructive Brand Reset:'
                      : 'Confirm Consolidation into India Post:'}
                  </span>{' '}
                  {pendingConsolidationAction === 'CONSOLIDATE_AND_RESET'
                    ? 'All Property, Staff, and Citizen/Lead records will normalize into India Post and legacy sample entries from retired modules will be cleared while schemas and RBAC remain intact.'
                    : 'All Property, Staff, and Citizen/Lead records will be normalized and linked into India Post without clearing task queues.'}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPendingConsolidationAction(null)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const actor = userProfile?.name || 'Master Admin';
                      if (pendingConsolidationAction === 'CONSOLIDATE_AND_RESET') {
                        const res = dataConsolidationService.consolidateAndResetNonIndiaPostBrands(actor);
                        showNotice(
                          `Consolidated (${res.consolidatedIntoIndiaPost.propertiesMoved} properties, ${res.consolidatedIntoIndiaPost.staffProfilesMoved} staff, ${res.consolidatedIntoIndiaPost.customersMoved} customers, ${res.consolidatedIntoIndiaPost.leadsMoved} leads) into India Post and reset non-India-Post sample data cleanly.`
                        );
                      } else {
                        const res = dataConsolidationService.consolidateOtherBrandsIntoIndiaPost(actor);
                        showNotice(
                          `Consolidated ${res.propertiesMoved} properties, ${res.staffProfilesMoved} staff, ${res.customersMoved} customers, ${res.leadsMoved} leads into India Post.`
                        );
                      }
                      setPendingConsolidationAction(null);
                      setTick((t) => t + 1);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold cursor-pointer"
                  >
                    Confirm &amp; Execute
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-blue-600" />
                  <span>Excel (.xlsx / .xls) &amp; CSV Workspace Migration Pipeline</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Column mapping, schema validation, duplicate detection, and strict workspace isolation.
                </p>
              </div>
              <button
                type="button"
                onClick={downloadTemplate}
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>Download {targetEntity} Template (CSV)</span>
              </button>
            </div>

            {/* Isolation Guard Banner */}
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">India Post Data Integrity Guard:</span> Always verify PIN codes and beat assignments before committing spreadsheet imports into <span className="font-mono font-semibold">INDIA_POST</span>.
              </div>
            </div>

            {/* Step 1 Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  1. Target Workspace *
                </label>
                <select
                  value={targetWorkspaceId}
                  onChange={(e) => setTargetWorkspaceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-semibold"
                >
                  <option value="INDIA_POST">India Post — Kota Division &amp; Pan-India (INDIA_POST)</option>
                  <option value="INDIAPOST_BULK">India Post — Bulk Customer Showcase (INDIAPOST_BULK)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  2. Target Entity Type *
                </label>
                <select
                  value={targetEntity}
                  onChange={(e) => {
                    setTargetEntity(e.target.value as MigrationEntityType);
                    setColumnMap({});
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-semibold"
                >
                  {(Object.keys(ENTITY_FIELD_SPECS) as MigrationEntityType[]).map((ent) => (
                    <option key={ent} value={ent}>
                      {ent}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  3. Upload .xlsx, .xls, or .csv *
                </label>
                <label className="w-full px-3 py-2 border border-dashed border-blue-400 rounded-lg text-xs bg-blue-50/40 text-blue-700 font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-50">
                  <Upload size={14} />
                  <span className="truncate">{fileName || 'Choose Spreadsheet File'}</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    disabled={!canImport}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Step 2: Column Mapping */}
            {rawHeaders.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">
                  Step 2 · Interactive Column Mapping ({rawRows.length} rows detected)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {ENTITY_FIELD_SPECS[targetEntity].map((spec) => (
                    <div key={spec.key}>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {spec.label} {spec.required ? '*' : ''}
                      </label>
                      <select
                        value={columnMap[spec.key] || ''}
                        onChange={(e) =>
                          setColumnMap((prev) => ({ ...prev, [spec.key]: e.target.value }))
                        }
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      >
                        <option value="">-- Unmapped --</option>
                        {rawHeaders.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 & 4: Preview + Validation + Commit */}
            {previewRows.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-700 space-x-3 tabular-nums">
                    <span>
                      Valid:{' '}
                      <strong className="text-emerald-700">
                        {previewRows.filter((r) => r.errors.length === 0 && (!r.isDuplicate || !skipDuplicates)).length}
                      </strong>
                    </span>
                    <span>
                      Duplicates:{' '}
                      <strong className="text-amber-700">
                        {previewRows.filter((r) => r.isDuplicate).length}
                      </strong>
                    </span>
                    <span>
                      Errors:{' '}
                      <strong className="text-red-700">
                        {previewRows.filter((r) => r.errors.length > 0).length}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={skipDuplicates}
                        onChange={(e) => setSkipDuplicates(e.target.checked)}
                        className="accent-blue-600"
                      />
                      <span>Skip Detected Duplicates</span>
                    </label>
                    <button
                      type="button"
                      disabled={!canImport}
                      onClick={executeMigrationImport}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                    >
                      Commit Import to {targetWorkspaceId}
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-64">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2 px-3">Row</th>
                        {ENTITY_FIELD_SPECS[targetEntity].slice(0, 4).map((s) => (
                          <th key={s.key} className="py-2 px-3">
                            {s.label}
                          </th>
                        ))}
                        <th className="py-2 px-3">Validation / Duplicate Check</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewRows.slice(0, 50).map((r) => (
                        <tr key={r.rowIndex}>
                          <td className="py-2 px-3 font-mono text-slate-500">{r.rowIndex}</td>
                          {ENTITY_FIELD_SPECS[targetEntity].slice(0, 4).map((s) => (
                            <td key={s.key} className="py-2 px-3 text-slate-800 truncate max-w-[160px]">
                              {r.mapped[s.key] || '—'}
                            </td>
                          ))}
                          <td className="py-2 px-3">
                            {r.errors.length > 0 ? (
                              <span className="text-red-700 font-medium flex items-center gap-1">
                                <XCircle size={12} /> {r.errors.join('; ')}
                              </span>
                            ) : r.isDuplicate ? (
                              <span className="text-amber-700 font-medium">
                                Duplicate ({r.duplicateReason})
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-medium">Ready</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {lastErrorRows.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      exportCsvWithBom(
                        `migration_errors_${targetWorkspaceId}.csv`,
                        ['Spreadsheet Row', 'Validation Error'],
                        lastErrorRows.map((er) => [er.row, er.reason])
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download Error Report ({lastErrorRows.length} rows)</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Step 5: Import Logs History */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database size={16} className="text-blue-600" />
              <span>Migration Import Audit History ({migrationLogs.length})</span>
            </h3>
            {migrationLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No migration batches executed yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">File</th>
                      <th className="py-2.5 px-3">Target Workspace</th>
                      <th className="py-2.5 px-3">Entity</th>
                      <th className="py-2.5 px-3 text-right">Imported</th>
                      <th className="py-2.5 px-3 text-right">Duplicates Skipped</th>
                      <th className="py-2.5 px-3 text-right">Errors</th>
                      <th className="py-2.5 px-3">Actor</th>
                      <th className="py-2.5 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {migrationLogs.map((m) => (
                      <tr key={m.id}>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{m.fileName}</td>
                        <td className="py-2.5 px-3 font-mono text-blue-700">{m.targetWorkspaceId}</td>
                        <td className="py-2.5 px-3 text-slate-700">{m.targetEntity}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                          {m.importedCount}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-700 tabular-nums">
                          {m.duplicateSkippedCount}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-red-700 tabular-nums">
                          {m.errorCount}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{m.importedBy}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {new Date(m.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MANDATORY ACTIVITY AUDIT LOGS */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History size={18} className="text-blue-600" />
                <span>Platform Activity &amp; Security Audit Logs</span>
              </h2>
              <p className="text-xs text-slate-500">
                Actor, role, workspace, entity, action, and timestamp across every system mutation.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search actor, action, entity..."
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
              <select
                value={auditWsFilter}
                onChange={(e) => setAuditWsFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="ALL">All Workspaces</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.workspaceKey}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() =>
                  exportCsvWithBom(
                    `xpeedo_activity_audit_${new Date().toISOString().split('T')[0]}.csv`,
                    ['Timestamp', 'Actor', 'Role', 'Workspace', 'Entity', 'Action', 'Summary'],
                    filteredActivityLogs.map((l) => [
                      l.timestamp,
                      l.actor,
                      l.actorRole,
                      l.workspaceId,
                      l.entityType,
                      l.action,
                      l.summary,
                    ])
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor &amp; Role</th>
                  <th className="py-2.5 px-3">Workspace</th>
                  <th className="py-2.5 px-3">Entity / Action</th>
                  <th className="py-2.5 px-3">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActivityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No activity audit logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredActivityLogs.slice(0, 150).map((l) => (
                    <tr key={l.id}>
                      <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(l.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{l.actor}</div>
                        <div className="text-[11px] font-mono text-slate-500">{l.actorRole}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-blue-700">{l.workspaceId}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800">{l.action}</div>
                        <div className="text-[11px] font-mono text-slate-500">{l.entityType}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{l.summary}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PRESERVED LEGACY POSTAL SETTINGS */}
      {activeTab === 'LEGACY_POSTAL' && <SettingsView />}

      {/* TAB 5: SINGLE BRAND OWNER LOGINS, PASSCODES & SUB-MENUS */}
      {activeTab === 'BRAND_LOGINS' && <BrandProfilesAndSectorRoutingView mode="PROFILES" />}

      {/* TAB 6: DATABASE-TO-SECTOR TRANSFER & REASSIGNMENT */}
      {activeTab === 'SECTOR_ROUTING' && <BrandProfilesAndSectorRoutingView mode="SECTOR_ROUTING" />}
    </div>
  );
}
