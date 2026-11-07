/**
 * Smart Dashboard Notification & Direct Field-Jump Engine
 * Continuously scans Property Master, Family Hub, Scheme Leads, Delivery Logs,
 * Pending Field Tasks, and CSC/eMitra commercial entities across Dadabari S.O.
 */

import { customerService } from './customerService';
import { staffPermissionService } from './staffPermissionService';
import { getStoredCscDirectory, CommercialCscEntity } from '../data/kotaCommercialCscData';
import { UPDATED_STAFF_LIST } from '../data/updatedStaffData';

export type NotificationPriority = 'Urgent' | 'Pending Verification' | 'Conflict Flagged' | 'Action Required' | 'Completed';

export type SourceModuleSection =
  | 'Unified Property & Family Hub'
  | 'SequenceWise Hub'
  | 'CSC Centres & eMitra Directory'
  | 'Scheme Leads Pipeline'
  | 'Field Tasks & Delivery Logs'
  | 'Data Quality & Conflict Registry';

export interface FieldJumpNotification {
  id: string;
  title: string;
  description: string;
  priority: NotificationPriority;
  sourceModule: SourceModuleSection;
  beatNo: string;
  colony: string;
  pincode: string;
  assignedStaffId: string;
  assignedStaffName: string;
  assignedStaffRole: string;
  assignedStaffContact: string;
  statusBadge: 'Urgent' | 'Pending Verification' | 'Conflict Flagged' | 'Action Required' | 'Ready';
  targetRoute: string; // e.g. '/unified-properties', '/sequence-properties', '/businesses', '/leads', '/tasks'
  filterKeyword: string; // Used to instantly pre-filter the destination table/cards
  recordId?: string;
  actionLabel: string; // e.g. "[Jump to Field & Fix]", "[Verify Location]", "[Map to Beat]"
  timestamp: string;
  isResolved?: boolean;
}

// Master Beat Staff lookup
const BEAT_STAFF_LOOKUP: Record<string, { id: string; name: string; role: string; contact: string }> = {};
UPDATED_STAFF_LIST.forEach((s) => {
  BEAT_STAFF_LOOKUP[s.beat] = {
    id: s.id,
    name: s.name,
    role: s.role,
    contact: s.contact,
  };
});

class NotificationScannerService {
  private notifications: FieldJumpNotification[] = [];
  private listeners: Set<() => void> = new Set();
  private isScanning = false;

  constructor() {
    this.scanAllModules();
    // Re-scan whenever customer service updates
    customerService.subscribe(() => {
      this.scanAllModules();
    });
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  /**
   * Scans all system subsystems and builds contextual notifications with full origin metadata
   */
  public scanAllModules(): FieldJumpNotification[] {
    if (this.isScanning) return this.notifications;
    this.isScanning = true;

    try {
      const generated: FieldJumpNotification[] = [];
      const customers = customerService.getCustomers();
      const leads = customerService.getLeads();
      const tasks = customerService.getTasks();
      const conflicts = customerService.getConflicts();
      const cscList = getStoredCscDirectory();

      // 1. Scan CSC & eMitra Kiosks for Pending Field Verification
      cscList
        .filter((c) => c.verificationStatus === 'Pending Verification' || !c.ingestedToCrm)
        .forEach((csc) => {
          const staff = BEAT_STAFF_LOOKUP[csc.beatNo] || {
            id: csc.assignedStaffId,
            name: csc.assignedStaffName,
            role: csc.assignedStaffRole,
            contact: csc.assignedStaffContact,
          };

          generated.push({
            id: `notif-csc-${csc.id}`,
            title: `Pending eMitra Verification: ${csc.businessName}`,
            description: `Commercial digital kiosk at ${csc.housePlotNumber}, ${csc.colony} requires doorstep GPS verification and IPPB Merchant QR deployment.`,
            priority: 'Pending Verification',
            sourceModule: 'CSC Centres & eMitra Directory',
            beatNo: csc.beatNo,
            colony: csc.colony,
            pincode: csc.pincode,
            assignedStaffId: staff.id,
            assignedStaffName: staff.name,
            assignedStaffRole: staff.role,
            assignedStaffContact: staff.contact,
            statusBadge: 'Pending Verification',
            targetRoute: '/businesses',
            filterKeyword: csc.businessName,
            recordId: csc.id,
            actionLabel: '[Jump to Field & Fix]',
            timestamp: 'Just now',
          });
        });

      // 2. Scan Properties with Missing / Incomplete House Numbers in Beat 2 & Other Beats
      const missingHouseNoCusts = customers.filter(
        (c) =>
          !c.houseNo ||
          c.houseNo.trim() === '' ||
          c.houseNo === 'Plot Unit' ||
          c.houseNo.toLowerCase() === 'n/a'
      );

      if (missingHouseNoCusts.length > 0) {
        const beat2Missing = missingHouseNoCusts.filter((c) => c.beatNo === 'Beat 2' || c.beatNo === '2');
        const count = beat2Missing.length || missingHouseNoCusts.length;
        const targetBeat = beat2Missing.length ? 'Beat 2' : missingHouseNoCusts[0].beatNo || 'Beat 1';
        const sample = beat2Missing[0] || missingHouseNoCusts[0];
        const staff = BEAT_STAFF_LOOKUP[targetBeat] || {
          id: 'STAFF-50457421',
          name: 'Mahendra Kumar Meena',
          role: 'GDS/PMAN',
          contact: '9414521002',
        };

        generated.push({
          id: `notif-prop-missing-house-${targetBeat}`,
          title: `Incomplete Address Sequence: ${count} Properties in ${targetBeat}`,
          description: `${count} registered household(s) around ${sample.area || sample.address?.area || 'Keshavpura'} are missing official plot/house numbers, affecting delivery sequence.`,
          priority: 'Urgent',
          sourceModule: 'SequenceWise Hub',
          beatNo: targetBeat,
          colony: sample.area || sample.address?.area || 'Keshavpura',
          pincode: sample.address?.pincode || '324009',
          assignedStaffId: staff.id,
          assignedStaffName: staff.name,
          assignedStaffRole: staff.role,
          assignedStaffContact: staff.contact,
          statusBadge: 'Urgent',
          targetRoute: '/sequence-properties',
          filterKeyword: sample.name || 'Missing House No',
          recordId: sample.id,
          actionLabel: '[Jump to Field & Fix]',
          timestamp: '10 mins ago',
        });
      }

      // 3. Scan Scheme Leads for Pending Follow-up
      const urgentLeads = leads.filter(
        (l) => l.stage === 'Follow-up Scheduled' || l.stage === 'Documentation Pending'
      );
      urgentLeads.slice(0, 3).forEach((lead) => {
        const beat = lead.beatNo ? `Beat ${lead.beatNo.replace(/\D/g, '')}` : 'Beat 2';
        const staff = BEAT_STAFF_LOOKUP[beat] || {
          id: 'STAFF-50457421',
          name: 'Mahendra Kumar Meena',
          role: 'GDS/PMAN',
          contact: '9414521002',
        };

        generated.push({
          id: `notif-lead-${lead.id}`,
          title: `PLI/Scheme Follow-up: ${lead.customerName}`,
          description: `Active inquiry for ${lead.productName || 'PLI Suraksha Whole Life'}. Customer requested doorstep documentation collection before month-end.`,
          priority: 'Action Required',
          sourceModule: 'Scheme Leads Pipeline',
          beatNo: beat,
          colony: lead.customerAddress?.split(',')[0] || 'Santoshi Nagar',
          pincode: '324009',
          assignedStaffId: staff.id,
          assignedStaffName: staff.name,
          assignedStaffRole: staff.role,
          assignedStaffContact: staff.contact,
          statusBadge: 'Action Required',
          targetRoute: '/leads',
          filterKeyword: lead.customerName,
          recordId: lead.id,
          actionLabel: '[Jump to Field & Fix]',
          timestamp: '25 mins ago',
        });
      });

      // 4. Scan Field Tasks: Pending / Overdue Daily Beat Tasks
      const pendingTasks = tasks.filter((t) => t.status === 'In Progress' || t.status === 'Pending');
      pendingTasks.slice(0, 2).forEach((task) => {
        const beat = task.beatNo ? `Beat ${task.beatNo.replace(/\D/g, '')}` : 'Beat 2';
        const staff = BEAT_STAFF_LOOKUP[beat] || {
          id: 'STAFF-50457421',
          name: 'Mahendra Kumar Meena',
          role: 'GDS/PMAN',
          contact: '9414521002',
        };

        generated.push({
          id: `notif-task-${task.id}`,
          title: `Field Task Pending: ${task.title.slice(0, 42)}...`,
          description: `Location: ${task.location}. Category: ${task.category}. Target: ${task.householdsCovered}/${task.householdsTarget} units completed.`,
          priority: task.priority === 'High' ? 'Urgent' : 'Action Required',
          sourceModule: 'Field Tasks & Delivery Logs',
          beatNo: beat,
          colony: task.location.split(',')[0] || 'Dadabari',
          pincode: '324009',
          assignedStaffId: staff.id,
          assignedStaffName: staff.name,
          assignedStaffRole: staff.role,
          assignedStaffContact: staff.contact,
          statusBadge: task.priority === 'High' ? 'Urgent' : 'Action Required',
          targetRoute: '/tasks',
          filterKeyword: task.title,
          recordId: task.id,
          actionLabel: '[Jump to Field & Fix]',
          timestamp: '1 hour ago',
        });
      });

      // 5. Scan Data Conflicts
      const openConflicts = conflicts.filter((c) => c.status === 'Pending Review');
      if (openConflicts.length > 0) {
        const cf = openConflicts[0];
        generated.push({
          id: `notif-conflict-${cf.id}`,
          title: `Address / Phone Conflict: ${cf.fieldName}`,
          description: `Conflict flagged for customer record ID ${cf.customerId}. Requires administrative resolution and postal beat alignment.`,
          priority: 'Conflict Flagged',
          sourceModule: 'Data Quality & Conflict Registry',
          beatNo: 'Beat 2',
          colony: 'Keshavpura',
          pincode: '324009',
          assignedStaffId: 'STAFF-50457421',
          assignedStaffName: 'Mahendra Kumar Meena',
          assignedStaffRole: 'GDS/PMAN',
          assignedStaffContact: '9414521002',
          statusBadge: 'Conflict Flagged',
          targetRoute: '/data-quality',
          filterKeyword: cf.customerId,
          recordId: cf.id,
          actionLabel: '[Jump to Field & Fix]',
          timestamp: '2 hours ago',
        });
      }

      this.notifications = generated;
      this.notify();
      return this.notifications;
    } finally {
      this.isScanning = false;
    }
  }

  public getNotifications(): FieldJumpNotification[] {
    if (this.notifications.length === 0) {
      return this.scanAllModules();
    }
    return this.notifications;
  }

  public getUnresolvedCount(): number {
    return this.notifications.filter((n) => !n.isResolved).length;
  }

  public markAsResolved(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, isResolved: true, priority: 'Completed', statusBadge: 'Ready' } : n
    );
    this.notify();
  }

  /**
   * 1-Click Ingest CSC/eMitra Entity into Customer & Property Master
   */
  public ingestCscToCrm(entity: CommercialCscEntity): { success: boolean; message: string } {
    try {
      // 1. Add to Customer Directory
      customerService.addOrUpdateCustomer(
        {
          name: `${entity.operatorName} (${entity.businessName})`,
          mobile: entity.primaryMobile,
          alternateMobile: entity.whatsapp,
          email: `${entity.id.toLowerCase()}@emitra.rajasthan.gov.in`,
          gender: 'Male',
          occupation: 'eMitra / CSC Digital Kiosk Operator',
          sector: entity.housePlotNumber,
          area: entity.colony,
          beatNo: entity.beatNo.replace(/\D/g, '') || '2',
          houseNo: entity.housePlotNumber,
          landmark: entity.landmark,
          remarks: `[COMMERCIAL - ${entity.subCategory}] Authorized Digital Seva Kiosk. Footfall: ~${entity.dailyFootfall}/day. Services: ${entity.serviceCapabilities.join(', ')}. Postal Potential: ${entity.postalServicesPotential.join(', ')}.`,
          address: {
            houseNumber: entity.housePlotNumber,
            sectorLocality: `${entity.housePlotNumber}, ${entity.colony}`,
            area: entity.colony,
            landmark: entity.landmark,
            pincode: entity.pincode,
            fullAddress: `${entity.businessName}, ${entity.housePlotNumber}, ${entity.colony}, ${entity.landmark}, Kota - ${entity.pincode}`,
          },
        },
        'CSC Ingestion Engine'
      );

      // 2. Generate initial Lead for IPPB Merchant QR & PLI
      customerService.createLead({
        customerId: `CUST-CSC-${entity.id}`,
        customerName: `${entity.operatorName} - ${entity.businessName}`,
        customerMobile: entity.primaryMobile,
        customerAddress: `${entity.housePlotNumber}, ${entity.colony}, ${entity.landmark}`,
        productCode: 'IPPB_MERCHANT_QR',
        productName: 'IPPB Merchant QR Banking & AePS Cash Point',
        requirement: 'Merchant QR scanner and AePS micro-ATM cashout point at commercial digital kiosk',
        source: 'eMitra CSC Commercial Registry',
        stage: 'Follow-up Scheduled',
        priority: 'High',
        leadScore: 85,
        notes: `Commercial kiosk operator agreed to install India Post Payments Bank (IPPB) Merchant QR scanner and AePS micro-ATM cashout facility. Beat Postman: ${entity.assignedStaffName}.`,
        assignedStaffName: entity.assignedStaffName,
        beatNo: entity.beatNo.replace(/\D/g, '') || '2',
        postOfficeName: entity.deliveryOffice,
        pincode: entity.pincode,
      });

      // 3. Update local CSC list status
      const allCsc = getStoredCscDirectory();
      const updated = allCsc.map((c) => (c.id === entity.id ? { ...c, ingestedToCrm: true } : c));
      localStorage.setItem('kota_csc_ingested_registry_v1', JSON.stringify(updated));

      // 4. Re-scan notifications
      this.scanAllModules();

      return {
        success: true,
        message: `✅ Successfully ingested "${entity.businessName}" (${entity.operatorName}) into CRM Customer Directory & Property Master! Assigned to ${entity.beatNo} (${entity.assignedStaffName}).`,
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Failed to ingest CSC: ${e.message || 'Unknown error'}`,
      };
    }
  }
}

export const notificationScannerService = new NotificationScannerService();
