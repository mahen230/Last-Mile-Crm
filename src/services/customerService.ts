import { UPDATED_STAFF_LIST } from '../data/updatedStaffData';
import { 
  Customer, Lead, FollowUp, Inquiry, SupportTicket, 
  DataConflict, Household, Property, AuditLog, CustomerProductRelation, Staff, CommunicationLog,
  Address, RelocationRecord, FieldTask, StaffProfile
} from '../types/models';
import { INITIAL_CUSTOMERS, normalizeMobile } from '../data/initialMasterData';
import { POSTAL_PRODUCTS } from '../data/productsData';
import { staffPermissionService } from './staffPermissionService';
import { 
  auditAndNormalizeCustomerRecords, 
  getAuditedPincodeForColony, 
  isSector6House3Or4, 
  normalizeAndCleanColony 
} from '../utils/dataAuditNormalization';
import { db } from '../lib/firebase';
import { dbService } from './dbService';
import { 
  collection, doc, getDocs, setDoc, updateDoc, 
  deleteDoc, query, orderBy, limit, onSnapshot 
} from 'firebase/firestore';

const STORAGE_KEY_CUSTOMERS = 'master_source_customers_v3';
const STORAGE_KEY_LEADS = 'master_source_leads_v3';
const STORAGE_KEY_FOLLOWUPS = 'master_source_followups_v3';
const STORAGE_KEY_TICKETS = 'master_source_tickets_v3';
const STORAGE_KEY_INQUIRIES = 'master_source_inquiries_v3';
const STORAGE_KEY_CONFLICTS = 'master_source_conflicts_v3';
const STORAGE_KEY_AUDIT = 'master_source_audit_v3';
const STORAGE_KEY_TASKS = 'master_source_tasks_v1';
const STORAGE_KEY_COMMUNICATIONS = 'master_source_comm_logs_v1';
const STORAGE_KEY_DELETED_PROPERTIES = 'master_source_deleted_properties_v2';
const STORAGE_KEY_PROPERTY_OVERRIDES = 'master_source_property_overrides_v2';

// In-Memory caches initialized from localStorage or initial dataset
class CustomerService {
  private customers: Customer[] = [];
  private leads: Lead[] = [];
  private followUps: FollowUp[] = [];
  private tickets: SupportTicket[] = [];
  private inquiries: Inquiry[] = [];
  private conflicts: DataConflict[] = [];
  private auditLogs: AuditLog[] = [];
  private staff: Staff[] = [];
  private tasks: FieldTask[] = [];
  private commLogs: CommunicationLog[] = [];
  private deletedPropertyIds: Set<string> = new Set();
  private propertyOverrides: Map<string, Partial<Property>> = new Map();
  private initialized: boolean = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initData();
  }

  private initData() {
    if (this.initialized) return;

    // 1. Load customers and execute Dadabari S.O. Data Normalization & Audit Run
    const storedCust = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
    let loadedCusts: Customer[] = [];
    if (storedCust) {
      try {
        loadedCusts = JSON.parse(storedCust);
      } catch (e) {
        loadedCusts = [...INITIAL_CUSTOMERS];
      }
    } else {
      loadedCusts = [...INITIAL_CUSTOMERS];
    }

    // Run audit and normalization on all loaded customer records
    const { auditedCustomers } = auditAndNormalizeCustomerRecords(loadedCusts);
    this.customers = auditedCustomers;
    this.saveCustomersLocal();

    // 2. Load leads
    const normalizeLeadStage = (stage: string): Lead['stage'] => {
      if (stage === 'Follow-up') return 'Follow-up Scheduled';
      if (stage === 'Documentation') return 'Documentation Pending';
      if (stage === 'Processing') return 'Under Processing';
      if (stage === 'Completed') return 'Converted - Product Opened';
      return (stage as Lead['stage']) || 'New';
    };
    const storedLeads = localStorage.getItem(STORAGE_KEY_LEADS);
    if (storedLeads) {
      try {
        const parsed = JSON.parse(storedLeads);
        this.leads = (Array.isArray(parsed) && parsed.length > 0 ? parsed : this.generateSampleLeads()).map((l: Lead) => ({
          ...l,
          stage: normalizeLeadStage(l.stage),
        }));
      } catch (e) {
        this.leads = this.generateSampleLeads();
      }
    } else {
      this.leads = this.generateSampleLeads();
      this.saveLeadsLocal();
    }

    // 3. Load follow-ups
    const storedFollowups = localStorage.getItem(STORAGE_KEY_FOLLOWUPS);
    if (storedFollowups) {
      try {
        this.followUps = JSON.parse(storedFollowups);
      } catch (e) {
        this.followUps = this.generateSampleFollowUps();
      }
    } else {
      this.followUps = this.generateSampleFollowUps();
      this.saveFollowupsLocal();
    }

    // 4. Load support tickets
    const storedTickets = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (storedTickets) {
      try {
        this.tickets = JSON.parse(storedTickets).filter((t: SupportTicket) => t.status !== 'Open');
        this.saveTicketsLocal();
      } catch (e) {
        this.tickets = [];
      }
    } else {
      this.tickets = [];
      this.saveTicketsLocal();
    }

    // 5. Load inquiries
    const storedInquiries = localStorage.getItem(STORAGE_KEY_INQUIRIES);
    if (storedInquiries) {
      try {
        this.inquiries = JSON.parse(storedInquiries).filter((i: Inquiry) => i.status !== 'New');
        this.saveInquiriesLocal();
      } catch (e) {
        this.inquiries = [];
      }
    } else {
      this.inquiries = [];
      this.saveInquiriesLocal();
    }

    // 6. Load conflicts
    const storedConflicts = localStorage.getItem(STORAGE_KEY_CONFLICTS);
    if (storedConflicts) {
      try {
        this.conflicts = JSON.parse(storedConflicts).filter((c: DataConflict) => c.status !== 'Pending Review');
        this.saveConflictsLocal();
      } catch (e) {
        this.conflicts = [];
      }
    } else {
      this.conflicts = [];
      this.saveConflictsLocal();
    }

    // 7. Load audit logs
    const storedAudit = localStorage.getItem(STORAGE_KEY_AUDIT);
    if (storedAudit) {
      try {
        this.auditLogs = JSON.parse(storedAudit);
      } catch (e) {
        this.auditLogs = [];
      }
    }

    // 8. Load tasks
    const defaultTasks: FieldTask[] = [
      {
        id: 'TSK-001',
        title: 'Collect Sukanya Samriddhi account KYC for Daughter of Mukesh Sen',
        category: 'KYC Collection',
        assignedTo: 'Mahaveer Prasad (Beat 2 Postman)',
        beatNo: '2',
        location: 'KH 222, Keshavpura Sector 6',
        status: 'In Progress',
        priority: 'High',
        dueDate: '2026-08-23',
        householdsTarget: 4,
        householdsCovered: 2,
        progressPercent: 50,
        updatedAt: '2026-08-22T10:30:00Z',
        linkedCustomerId: 'UM-00001',
        linkedCustomerMasterId: 'UM-00001',
        linkedCustomerName: 'Mukesh Sen',
        linkedCustomerPhone: '9414023041',
        linkedCustomerAddress: 'KH 222, Keshavpura Sector 6, Kota',
        linkType: 'CUSTOMER'
      },
      {
        id: 'TSK-002',
        title: 'Deliver Printed Passbook & Certificate to Smt. Prem Kanwar',
        category: 'Passbook Delivery',
        assignedTo: 'Mahaveer Prasad (Beat 2 Postman)',
        beatNo: '2',
        location: '445, Keshavpura Sector 7',
        status: 'Pending',
        priority: 'Medium',
        dueDate: '2026-08-23',
        householdsTarget: 3,
        householdsCovered: 0,
        progressPercent: 0,
        updatedAt: '2026-08-22T09:00:00Z',
        linkedCustomerId: 'UM-00002',
        linkedCustomerMasterId: 'UM-00002',
        linkedCustomerName: 'Smt. Prem Kanwar',
        linkedCustomerPhone: '9829011223',
        linkedCustomerAddress: '445, Keshavpura Sector 7, Kota',
        linkType: 'CUSTOMER'
      },
      {
        id: 'TSK-003',
        title: 'Perform Doorstep Child CELC Aadhaar Enrolment & Mobile Update',
        category: 'Aadhaar Biometric',
        assignedTo: 'Ram Kishan Meghwal (Beat 6 Postman)',
        beatNo: '6',
        location: 'House 120, Keshavpura Sector 4',
        status: 'In Progress',
        priority: 'High',
        dueDate: '2026-08-24',
        householdsTarget: 6,
        householdsCovered: 4,
        progressPercent: 67,
        updatedAt: '2026-08-22T11:15:00Z',
        linkedCustomerId: 'UM-00003',
        linkedCustomerMasterId: 'UM-00003',
        linkedCustomerName: 'Rajendra Kumar Sharma',
        linkedCustomerPhone: '9414288901',
        linkedCustomerAddress: 'House 120, Keshavpura Sector 4, Kota',
        linkType: 'CUSTOMER'
      },
      {
        id: 'TSK-004',
        title: 'Verify Physical Residency for Shifted Tenant Note (Naya Gaon)',
        category: 'Address Verification',
        assignedTo: 'Mahaveer Prasad (Beat 2 Postman)',
        beatNo: '2',
        location: 'Santoshi Nagar, Kota',
        status: 'Completed',
        priority: 'Low',
        dueDate: '2026-08-21',
        householdsTarget: 5,
        householdsCovered: 5,
        progressPercent: 100,
        completedAt: '2026-08-21T16:20:00Z',
        updatedAt: '2026-08-21T16:20:00Z',
        linkedCustomerId: 'UM-00004',
        linkedCustomerMasterId: 'UM-00004',
        linkedCustomerName: 'Asha Prajapati',
        linkedCustomerPhone: '8290144765',
        linkedCustomerAddress: 'H. No. 675 Santoshi Nagar, Kota',
        linkType: 'CUSTOMER'
      },
      {
        id: 'TSK-005',
        title: 'Doorstep PLI Suraksha Proposal & Medical Declaration Pickup',
        category: 'PLI Renewal',
        assignedTo: 'Mahaveer Prasad (Beat 2 Postman)',
        beatNo: '2',
        location: 'H.No. 612, Keshavpura Sector 7',
        status: 'Completed',
        priority: 'High',
        dueDate: '2026-08-22',
        householdsTarget: 2,
        householdsCovered: 2,
        progressPercent: 100,
        completedAt: '2026-08-22T13:10:00Z',
        updatedAt: '2026-08-22T13:10:00Z',
        linkedCustomerId: 'UM-00005',
        linkedCustomerMasterId: 'UM-00005',
        linkedCustomerName: 'Suraj Harijan',
        linkedCustomerPhone: '7742239527',
        linkedCustomerAddress: '104-A Santoshi Nagar, near TVS Circle, Kota',
        linkType: 'CUSTOMER'
      },
      { id: 'TSK-006', title: 'Dadabari Main Market Commercial Beat Speed Post & Registry Delivery', category: 'Passbook Delivery', assignedTo: 'Kailash Chand (Beat 1 Postman)', beatNo: '1', location: 'Dadabari Main Market, Kota', status: 'Completed', priority: 'High', dueDate: '2026-08-22', householdsTarget: 12, householdsCovered: 12, progressPercent: 100, completedAt: '2026-08-22T14:45:00Z', updatedAt: '2026-08-22T14:45:00Z' },
      { id: 'TSK-007', title: 'Collect Pending Re-KYC Documents for Senior Citizen Savings Accounts', category: 'KYC Collection', assignedTo: 'Kailash Chand (Beat 1 Postman)', beatNo: '1', location: 'Sector 2, Dadabari Extension', status: 'In Progress', priority: 'Medium', dueDate: '2026-08-23', householdsTarget: 8, householdsCovered: 5, progressPercent: 63, updatedAt: '2026-08-22T15:00:00Z' },
      { id: 'TSK-008', title: 'Basant Vihar Doorstep Jeevan Pramaan Digital Life Certificate Camp', category: 'Aadhaar Biometric', assignedTo: 'Suresh Kumar (Beat 3 Postman)', beatNo: '3', location: 'Basant Vihar Sector A, Kota', status: 'Completed', priority: 'High', dueDate: '2026-08-22', householdsTarget: 10, householdsCovered: 10, progressPercent: 100, completedAt: '2026-08-22T15:30:00Z', updatedAt: '2026-08-22T15:30:00Z' },
      { id: 'TSK-009', title: 'Verify New Household Numbering in Modi College Road Colony', category: 'Address Verification', assignedTo: 'Suresh Kumar (Beat 3 Postman)', beatNo: '3', location: 'Modi College Road, Dadabari', status: 'Pending', priority: 'Low', dueDate: '2026-08-24', householdsTarget: 15, householdsCovered: 0, progressPercent: 0, updatedAt: '2026-08-22T08:30:00Z' },
      { id: 'TSK-010', title: 'Waqf Nagar & Chhota Talab PLI Renewal Premium Collection', category: 'PLI Renewal', assignedTo: 'Bhanwar Lal (Beat 4 Postman)', beatNo: '4', location: 'Waqf Nagar, Dadabari', status: 'In Progress', priority: 'Medium', dueDate: '2026-08-23', householdsTarget: 6, householdsCovered: 3, progressPercent: 50, updatedAt: '2026-08-22T12:20:00Z' },
      { id: 'TSK-011', title: 'Shrinathpuram Sector A & B Registered Parcel Beat Coverage', category: 'Passbook Delivery', assignedTo: 'Ramesh Chand (Beat 5 Postman)', beatNo: '5', location: 'Shrinathpuram Sector B, Kota', status: 'Completed', priority: 'Medium', dueDate: '2026-08-22', householdsTarget: 9, householdsCovered: 9, progressPercent: 100, completedAt: '2026-08-22T16:00:00Z', updatedAt: '2026-08-22T16:00:00Z' },
      { id: 'TSK-012', title: 'Keshavpura Sector 4 IPPB Doorstep AePS Pension Disbursement', category: 'Aadhaar Biometric', assignedTo: 'Ram Kishan Meghwal (Beat 6 Postman)', beatNo: '6', location: 'Ram Janki Mandir Gali, Sector 4', status: 'Completed', priority: 'High', dueDate: '2026-08-22', householdsTarget: 7, householdsCovered: 7, progressPercent: 100, completedAt: '2026-08-22T14:10:00Z', updatedAt: '2026-08-22T14:10:00Z' }
    ];
    const storedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    if (storedTasks) {
      try {
        const parsed = JSON.parse(storedTasks);
        if (Array.isArray(parsed) && parsed.length > 4) {
          this.tasks = parsed;
        } else {
          // Merge any custom changes with full multi-beat task set
          const existingMap = new Map((Array.isArray(parsed) ? parsed : []).map((t: any) => [t.id, t]));
          this.tasks = defaultTasks.map(dt => existingMap.has(dt.id) ? { ...dt, ...existingMap.get(dt.id) } : dt);
          this.saveTasksLocal();
        }
      } catch (e) {
        this.tasks = defaultTasks;
      }
    } else {
      this.tasks = defaultTasks;
      this.saveTasksLocal();
    }
    
    // 9. Load staff
    this.staff = [...UPDATED_STAFF_LIST];

    // 10. Load communication logs
    const storedComm = localStorage.getItem(STORAGE_KEY_COMMUNICATIONS);
    if (storedComm) {
      try {
        this.commLogs = JSON.parse(storedComm);
      } catch (e) {
        this.commLogs = this.generateInitialCommLogs();
      }
    } else {
      this.commLogs = this.generateInitialCommLogs();
      this.saveCommLogsLocal();
    }

    // 11. Load property exclusions and overrides
    const storedDeletedProps = localStorage.getItem(STORAGE_KEY_DELETED_PROPERTIES);
    if (storedDeletedProps) {
      try {
        this.deletedPropertyIds = new Set(JSON.parse(storedDeletedProps));
      } catch (e) {
        this.deletedPropertyIds = new Set();
      }
    }

    const storedOverrides = localStorage.getItem(STORAGE_KEY_PROPERTY_OVERRIDES);
    if (storedOverrides) {
      try {
        const parsed = JSON.parse(storedOverrides);
        this.propertyOverrides = new Map(Object.entries(parsed));
      } catch (e) {
        this.propertyOverrides = new Map();
      }
    }

    this.initialized = true;

    // Fast in-memory filter of invalid customer records without triggering N Firestore/IndexedDB writes on boot
    const beforeCount = this.customers.length;
    this.customers = this.customers.filter(c => {
      const name = c.name?.trim();
      return Boolean(name && name !== '-' && !/^(UM-)\d+$/i.test(name));
    });
    if (this.customers.length !== beforeCount) {
      this.saveCustomersLocal();
    }
  }

  private savePropertyPreferences() {
    try {
      localStorage.setItem(STORAGE_KEY_DELETED_PROPERTIES, JSON.stringify(Array.from(this.deletedPropertyIds)));
      const obj: Record<string, Partial<Property>> = {};
      this.propertyOverrides.forEach((v, k) => { obj[k] = v; });
      localStorage.setItem(STORAGE_KEY_PROPERTY_OVERRIDES, JSON.stringify(obj));
    } catch (e) {
      // ignore
    }
  }

  // Subscribe for reactivity in React components
  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  private async syncFromFirestore() {
    try {
      if (!db) return;
      const snap = await getDocs(collection(db, 'customers'));
      if (!snap.empty) {
        const remoteCust: Customer[] = [];
        snap.forEach(docSnap => {
          remoteCust.push(docSnap.data() as Customer);
        });
        if (remoteCust.length > 0) {
          // Merge remote with local ensuring no duplicate masterIds
          const map = new Map<string, Customer>();
          this.customers.forEach(c => map.set(c.id || c.masterId || '', c));
          remoteCust.forEach(c => map.set(c.id || c.masterId || '', c));
          this.customers = Array.from(map.values());
          this.saveCustomersLocal();
          this.notify();
        }
      }
    } catch (err) {
      console.warn('Firestore offline/fallback mode active:', err);
    }
  }

  private saveCustomersLocal() {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(this.customers));
    } catch (e) {
      console.warn('localStorage saveCustomersLocal fallback:', e);
    }
  }

  private saveLeadsLocal() {
    try {
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(this.leads));
    } catch (e) {
      console.warn('localStorage saveLeadsLocal fallback:', e);
    }
  }

  private saveFollowupsLocal() {
    try {
      localStorage.setItem(STORAGE_KEY_FOLLOWUPS, JSON.stringify(this.followUps));
    } catch (e) {
      console.warn('localStorage saveFollowupsLocal fallback:', e);
    }
  }

  private saveTicketsLocal() {
    try {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(this.tickets));
    } catch (e) {
      console.warn('localStorage saveTicketsLocal fallback:', e);
    }
  }

  private saveInquiriesLocal() {
    try {
      localStorage.setItem(STORAGE_KEY_INQUIRIES, JSON.stringify(this.inquiries));
    } catch (e) {
      console.warn('localStorage saveInquiriesLocal fallback:', e);
    }
  }

  private saveConflictsLocal() {
    try {
      localStorage.setItem(STORAGE_KEY_CONFLICTS, JSON.stringify(this.conflicts));
    } catch (e) {
      console.warn('localStorage saveConflictsLocal fallback:', e);
    }
  }

  private saveAuditLocal() {
    const trimmed = this.auditLogs.slice(0, 200);
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('localStorage saveAuditLocal fallback:', e);
    }
  }

  private saveStaffLocal() {
    // Kept in-memory and synced via staffPermissionService
  }

  private saveTasksLocal() {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(this.tasks));
    } catch (e) {
      console.error('Error saving tasks to localStorage:', e);
    }
  }

  public getStaff(): Staff[] {
    return this.staff;
  }

  public getTasks(): any[] {
    return this.tasks.map(t => ({ ...t }));
  }

  public updateTask(taskId: string, updates: any) {
    const idx = this.tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
      const current = this.tasks[idx];
      const nextStatus = updates.status ?? current.status;
      let nextProgress = updates.progressPercent ?? current.progressPercent ?? 0;
      let nextCovered = updates.householdsCovered ?? current.householdsCovered ?? 0;
      const target = updates.householdsTarget ?? current.householdsTarget ?? 5;

      if (updates.status === 'Completed') {
        nextProgress = 100;
        nextCovered = target;
      } else if (updates.status === 'Pending' && updates.progressPercent === undefined) {
        nextProgress = 0;
        nextCovered = 0;
      } else if (updates.status === 'In Progress' && (nextProgress === 0 || nextProgress === 100) && updates.progressPercent === undefined) {
        nextCovered = Math.max(1, Math.round(target / 2));
        nextProgress = Math.round((nextCovered / target) * 100);
      } else if (updates.householdsCovered !== undefined && target > 0) {
        nextProgress = Math.min(100, Math.round((updates.householdsCovered / target) * 100));
      }

      const updatedTask = {
        ...current,
        ...updates,
        status: nextStatus,
        householdsTarget: target,
        householdsCovered: nextCovered,
        progressPercent: nextProgress,
        updatedAt: new Date().toISOString(),
        completedAt: nextStatus === 'Completed' ? (current.completedAt || new Date().toISOString()) : undefined
      };

      this.tasks = [
        ...this.tasks.slice(0, idx),
        updatedTask,
        ...this.tasks.slice(idx + 1)
      ];
      this.saveTasksLocal();
      this.notify();
    }
  }

  public addTask(taskData: {
    title: string;
    category: string;
    assignedTo: string;
    beatNo: string;
    location: string;
    priority: 'High' | 'Medium' | 'Low';
    dueDate: string;
    householdsTarget?: number;
    linkedCustomerId?: string;
    linkedCustomerMasterId?: string;
    linkedCustomerName?: string;
    linkedCustomerPhone?: string;
    linkedCustomerAddress?: string;
    linkedLeadId?: string;
    linkedLeadProduct?: string;
    linkedLeadStage?: string;
    linkType?: 'CUSTOMER' | 'LEAD' | 'HOUSEHOLD' | 'NONE';
  }): FieldTask {
    const newTask: FieldTask = {
      id: `TSK-${String(this.tasks.length + 1).padStart(3, '0')}`,
      title: taskData.title,
      category: taskData.category,
      assignedTo: taskData.assignedTo,
      beatNo: String(taskData.beatNo).replace(/^Beat\s*/i, '').trim() || '2',
      location: taskData.location,
      status: 'Pending' as const,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      householdsTarget: taskData.householdsTarget || 5,
      householdsCovered: 0,
      progressPercent: 0,
      updatedAt: new Date().toISOString(),
      linkedCustomerId: taskData.linkedCustomerId,
      linkedCustomerMasterId: taskData.linkedCustomerMasterId,
      linkedCustomerName: taskData.linkedCustomerName,
      linkedCustomerPhone: taskData.linkedCustomerPhone,
      linkedCustomerAddress: taskData.linkedCustomerAddress,
      linkedLeadId: taskData.linkedLeadId,
      linkedLeadProduct: taskData.linkedLeadProduct,
      linkedLeadStage: taskData.linkedLeadStage,
      linkType: taskData.linkType || (taskData.linkedCustomerId ? 'CUSTOMER' : (taskData.linkedLeadId ? 'LEAD' : 'NONE'))
    };
    this.tasks = [newTask, ...this.tasks];
    this.saveTasksLocal();
    this.notify();
    return newTask;
  }

  public deleteTask(taskId: string) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.saveTasksLocal();
    this.notify();
  }

  public addStaff(staffMember: Staff) {
    this.staff.push(staffMember);
    this.saveStaffLocal();
    this.notify();
  }

  public deleteStaff(staffId: string) {
    this.staff = this.staff.filter(s => s.id !== staffId);
    this.saveStaffLocal();
    this.notify();
  }

  public updateStaff(staffMember: Staff) {
    const index = this.staff.findIndex(s => s.id === staffMember.id);
    if (index !== -1) {
      this.staff[index] = staffMember;
      this.saveStaffLocal();
      this.notify();
    }
  }

  public deleteCustomer(customerId: string) {
    this.customers = this.customers.filter(c => c.id !== customerId);
    this.saveCustomersLocal();
    this.persistCustomerDeletionToFirestore(customerId);
    this.notify();
  }

  private async persistCustomerDeletionToFirestore(customerId: string) {
    try {
      if (db) {
        await deleteDoc(doc(db, 'customers', customerId));
      }
    } catch (e) {
      console.warn('Firestore delete failed:', e);
    }
  }

  public cleanupInvalidCustomers() {
    const invalidCustomers = this.customers.filter(c => {
      const name = c.name;
      if (!name) return true;
      const trimmed = name.trim();
      // Check for empty, hyphen, or UM-XXXXX pattern
      return trimmed === '' || trimmed === '-' || /^(UM-)\d+$/i.test(trimmed);
    });
    
    invalidCustomers.forEach(c => this.deleteCustomer(c.id));
  }

  public unlinkFromFamily(customerId: string): boolean {
    const cust = this.getCustomerById(customerId);
    if (!cust || !cust.householdId) return false;

    cust.householdId = undefined;
    cust.isHeadOfFamily = false;
    cust.linkConfidenceScore = undefined;
    
    this.saveCustomersLocal();
    this.persistCustomerToFirestore(cust);
    this.logAudit('CUSTOMER_UNLINKED', 'Customer', cust.id, cust.name, `Removed from household`);
    this.notify();
    return true;
  }

  public linkCustomerToHousehold(customerId: string, householdCode: string): boolean {
    const cust = this.getCustomerById(customerId);
    if (!cust) return false;

    cust.householdId = householdCode;
    
    this.saveCustomersLocal();
    this.persistCustomerToFirestore(cust);
    this.logAudit('CUSTOMER_LINKED', 'Customer', cust.id, cust.name, `Linked to household ${householdCode}`);
    this.notify();
    return true;
  }

  public setHeadOfFamily(customerId: string, householdCode: string): boolean {
    // 1. Unset current head of family in this household
    this.customers.forEach(c => {
      if (c.householdId === householdCode) {
        c.isHeadOfFamily = false;
        this.persistCustomerToFirestore(c);
      }
    });

    // 2. Set new head of family
    const cust = this.getCustomerById(customerId);
    if (!cust) return false;

    cust.householdId = householdCode;
    cust.isHeadOfFamily = true;
    
    this.saveCustomersLocal();
    this.persistCustomerToFirestore(cust);
    this.logAudit('HEAD_OF_FAMILY_SET', 'Customer', cust.id, cust.name, `Set as head of household ${householdCode}`);
    this.notify();
    return true;
  }

  public logAudit(action: AuditLog['action'], entityType: AuditLog['entityType'], entityId: string, entityName: string, details: string, previousValue?: any, newValue?: any) {
    const log: AuditLog = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      performedBy: 'System / Operator',
      userRole: 'Staff',
      action,
      entityType,
      entityId,
      entityName,
      details,
      previousValue,
      newValue
    };
    this.auditLogs.unshift(log);
    this.saveAuditLocal();
    this.notify();
  }

  private detectInitialConflicts(): DataConflict[] {
    const conflicts: DataConflict[] = [
      {
        id: 'CONF-001',
        customerId: 'UM-03294',
        customerName: 'Akash Soni',
        masterId: 'UM-03294',
        fieldName: 'Customer Name',
        existingValue: 'Akash Soni (Mobile: 9351789864, KH 231 Sector 6)',
        incomingValue: 'Akash Soni (Mobile: 7239887524, 323 A Sector 4)',
        sourceOfConflict: 'Field Survey vs User Chat',
        status: 'Pending Review',
        detectedAt: '2026-08-21T10:00:00Z',
        resolutionRemarks: 'Two distinct customers with identical name at different sectors. Kept separate as individual master IDs.'
      },
      {
        id: 'CONF-002',
        customerId: 'UM-02866',
        customerName: 'Gurumaanshu Suman',
        masterId: 'UM-02866',
        fieldName: 'Mobile Number',
        existingValue: '6376833150',
        incomingValue: '8561991673 (Father Akash Suman)',
        sourceOfConflict: 'User Field Input 2026-08-21',
        status: 'Pending Review',
        detectedAt: '2026-08-21T14:30:00Z',
        resolutionRemarks: 'Existing verified mobile preserved; alternate household contact added.'
      },
      {
        id: 'CONF-003',
        customerId: 'UM-01730',
        customerName: 'Rajendra Solanki',
        masterId: 'UM-01730',
        fieldName: 'Address',
        existingValue: 'KP-S7-H881-RAJENDRA (Keshavpura Sector 7)',
        incomingValue: 'House No. 2F-20, Teacher Colony',
        sourceOfConflict: 'User Chat Final Correction',
        status: 'Pending Review',
        detectedAt: '2026-08-19T09:00:00Z',
        resolutionRemarks: 'Address marked as Address Left; new address recorded in pending verification queue.'
      }
    ];
    return conflicts;
  }

  private generateSampleLeads(): Lead[] {
    return [
      {
        id: 'LEAD-001',
        customerId: 'UM-02877',
        customerName: 'Golu Meghwal',
        customerMobile: '7742251336',
        customerAddress: 'Raj Nagar, Kota',
        productCode: 'SSA',
        productName: 'Sukanya Samriddhi Yojana (SSA)',
        requirement: 'Wants to open SSA accounts for both daughters (age 4 and age 7) along with Aadhaar CELC update.',
        source: 'Field Postman Visit',
        stage: 'Follow-up Scheduled',
        priority: 'High',
        leadScore: 90,
        assignedStaffName: 'Devendra Postman (Beat 2)',
        beatNo: '2',
        estimatedValue: 3000,
        nextAction: 'Visit home on Saturday with SSA account opening Form-1 & CELC mobile kit',
        nextFollowUpDate: '2026-08-23',
        notes: 'Customer is very keen. Requires birth certificate copy.',
        createdAt: '2026-08-20T10:00:00Z',
        updatedAt: '2026-08-22T08:00:00Z'
      },
      {
        id: 'LEAD-002',
        customerId: 'UM-02672',
        customerName: 'Kuldeep Meena',
        customerMobile: '9887079568',
        customerAddress: 'Keshavpura Sector 7, Kota',
        productCode: 'PLI_SURAKSHA',
        productName: 'Postal Life Insurance (Suraksha)',
        requirement: 'Govt employee seeking ₹10 Lakh sum assured whole life insurance policy with maximum bonus rate.',
        source: 'Direct Post Office Counter Inquiry',
        stage: 'Documentation Pending',
        priority: 'Urgent',
        leadScore: 95,
        assignedStaffName: 'Rajesh Sharma (Dadabari SO - Beat 2)',
        beatNo: '2',
        estimatedValue: 1000000,
        nextAction: 'Collect salary slip, class 10th marksheet & arrange doctor medical report',
        nextFollowUpDate: '2026-08-23',
        notes: 'Daily follow-up active. Quotation of ₹1,820/month premium delivered.',
        createdAt: '2026-08-19T11:00:00Z',
        updatedAt: '2026-08-22T09:30:00Z'
      },
      {
        id: 'LEAD-003',
        customerId: 'UM-02879',
        customerName: 'Nand Bihari Prajapati',
        customerMobile: '9929304352',
        customerAddress: 'Keshavpura Sector 6, Kota',
        productCode: 'RD',
        productName: '5-Year Recurring Deposit',
        requirement: 'Disciplined monthly savings ₹2,000/month for 5 years with auto-debit facility.',
        source: 'Reference by Parmanand Ji',
        stage: 'Interested',
        priority: 'High',
        leadScore: 85,
        assignedStaffName: 'Devendra Postman (Beat 2)',
        beatNo: '2',
        estimatedValue: 120000,
        nextAction: 'Assist with IPPB standing instruction setup',
        nextFollowUpDate: '2026-08-24',
        notes: 'Urgent follow-up requested by customer.',
        createdAt: '2026-08-21T09:15:00Z',
        updatedAt: '2026-08-22T06:00:00Z'
      },
      {
        id: 'LEAD-004',
        customerId: 'UM-02923',
        customerName: 'Paras Bairwa',
        customerMobile: '7976390380',
        customerAddress: '167 Ram Janki Mandir, Keshavpura Sector 4',
        productCode: 'IPPB_BANKING',
        productName: 'IPPB Merchant & Banking Benefits',
        requirement: 'PM Vishwakarma kit received; wants IPPB digital account linkage for toolkit grant and credit support.',
        source: 'PM Vishwakarma Scheme Survey',
        stage: 'Under Processing',
        priority: 'Medium',
        leadScore: 80,
        assignedStaffName: 'Ram Kishan Meghwal (Beat 6)',
        beatNo: '6',
        estimatedValue: 15000,
        nextAction: 'Complete Aadhaar eKYC fingerprint biometric activation at doorstep',
        nextFollowUpDate: '2026-08-23',
        notes: 'Toolkit confirmed delivered on 17-Aug-2026.',
        createdAt: '2026-08-17T12:00:00Z',
        updatedAt: '2026-08-22T07:10:00Z'
      },
      {
        id: 'LEAD-005',
        customerId: 'UM-03215',
        customerName: 'Neelam Kumari Prajapati',
        customerMobile: '8947841115',
        customerAddress: 'KH 164, Keshavpura Sector 6',
        productCode: 'TD',
        productName: '5-Year Time Deposit (Fixed Deposit)',
        requirement: 'Looking to invest ₹2,00,000 for 5 years under Section 80C tax deduction.',
        source: 'Field Survey',
        stage: 'Interested',
        priority: 'Medium',
        leadScore: 78,
        assignedStaffName: 'Devendra Postman (Beat 2)',
        beatNo: '2',
        estimatedValue: 200000,
        nextAction: 'Deliver TD interest payout chart and collect cheque',
        nextFollowUpDate: '2026-08-25',
        notes: 'Also interested in PLI Santosh scheme.',
        createdAt: '2026-08-21T14:00:00Z',
        updatedAt: '2026-08-22T08:20:00Z'
      }
    ];
  }

  private generateSampleFollowUps(): FollowUp[] {
    return [
      {
        id: 'FOL-001',
        customerId: 'UM-02877',
        customerName: 'Golu Meghwal',
        customerMobile: '7742251336',
        customerAddress: 'Raj Nagar, Kota',
        leadId: 'LEAD-001',
        productCode: 'SSA',
        productName: 'Sukanya Samriddhi Yojana (SSA)',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '11:00 AM',
        currentStatus: 'Pending',
        priority: 'Urgent',
        nextAction: 'Collect birth certificates of both daughters & complete Form-1',
        assignedStaffName: 'Devendra Postman (Beat 2)',
        beatNo: '2',
        remarks: 'Customer is home on Saturday mornings. High conversion probability.',
        createdAt: '2026-08-20T10:00:00Z'
      },
      {
        id: 'FOL-002',
        customerId: 'UM-02672',
        customerName: 'Kuldeep Meena',
        customerMobile: '9887079568',
        customerAddress: 'Keshavpura Sector 7, Kota',
        leadId: 'LEAD-002',
        productCode: 'PLI_SURAKSHA',
        productName: 'Postal Life Insurance (Suraksha)',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '02:30 PM',
        currentStatus: 'Pending',
        priority: 'High',
        nextAction: 'Verify medical declaration & submit proposal file to Dadabari SO',
        assignedStaffName: 'Rajesh Sharma (Dadabari SO - Beat 2)',
        beatNo: '2',
        remarks: 'Quotation verified. ₹10 Lakh sum assured.',
        createdAt: '2026-08-19T11:00:00Z'
      },
      {
        id: 'FOL-003',
        customerId: 'UM-02879',
        customerName: 'Nand Bihari Prajapati',
        customerMobile: '9929304352',
        customerAddress: 'Keshavpura Sector 6, Kota',
        leadId: 'LEAD-003',
        productCode: 'RD',
        productName: '5-Year Recurring Deposit',
        scheduledDate: '2026-08-24',
        scheduledTime: '04:00 PM',
        currentStatus: 'Pending',
        priority: 'High',
        nextAction: 'Setup auto-debit standing instruction via IPPB QR card',
        assignedStaffName: 'Devendra Postman (Beat 2)',
        beatNo: '2',
        remarks: 'Referred by Parmanand Ji.',
        createdAt: '2026-08-21T09:15:00Z'
      },
      {
        id: 'FOL-004',
        customerId: 'UM-02923',
        customerName: 'Paras Bairwa',
        customerMobile: '7976390380',
        customerAddress: '167 Ram Janki Mandir, Keshavpura Sector 4',
        leadId: 'LEAD-004',
        productCode: 'IPPB_BANKING',
        productName: 'IPPB Account Opening',
        scheduledDate: '2026-08-21',
        scheduledTime: '05:00 PM',
        currentStatus: 'Overdue',
        priority: 'Normal',
        nextAction: 'Doorstep biometric fingerprint authentication',
        assignedStaffName: 'Ram Kishan Meghwal (Beat 6)',
        beatNo: '6',
        remarks: 'Reschedule needed as customer was at work on Friday.',
        createdAt: '2026-08-17T12:00:00Z'
      }
    ];
  }

  private generateSampleTickets(): SupportTicket[] {
    return [
      {
        id: 'TKT-001',
        ticketId: 'TKT-2026-001',
        customerName: 'Sohan Lal Nama',
        customerMobile: '8104674458',
        category: 'Document Verification',
        subject: 'Gaytri books bundle delivered - Verification of delivery status',
        description: 'Customer received bundle at H. No. 705 Keshavpura Sector 7. Wants confirmation of postal tracking ledger entry.',
        priority: 'Low',
        status: 'Resolved',
        assignedStaffName: 'Devendra Postman',
        resolutionNotes: 'Delivery verified in postal register and matched with parcel manifest.',
        createdAt: '2026-08-18T10:00:00Z',
        updatedAt: '2026-08-20T12:00:00Z'
      },
      {
        id: 'TKT-002',
        ticketId: 'TKT-2026-002',
        customerName: 'Kela Bai',
        customerMobile: '8005787233',
        category: 'Address Update',
        subject: 'Customer shifted from 470-B Santoshi Nagar to Naya Gaon',
        description: 'Customer informs that household has relocated to Naya Gaon. Requesting redirection of pension and mail.',
        priority: 'High',
        status: 'In Progress',
        assignedStaffName: 'Rajesh Sharma',
        resolutionNotes: 'New address under field confirmation at Naya Gaon branch post office.',
        createdAt: '2026-08-20T14:30:00Z',
        updatedAt: '2026-08-22T08:15:00Z'
      }
    ];
  }

  // PUBLIC GETTERS
  public getCustomers(): Customer[] {
    return this.customers;
  }

  /**
   * Scoped Customers getter:
   * - Admin: Returns all customer records across the organization
   * - Postman: Returns only customers linked to properties within the postman's assigned beat or created by them
   */
  public getScopedCustomers(activeSession?: any): Customer[] {
    const session = activeSession || staffPermissionService.getActiveSession();
    if (!session || staffPermissionService.isSuperAdmin(session) || session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
      return this.customers;
    }
    const userBeat = (session.beat || 'Beat 2').replace(/beat\s*/i, '').trim();
    const allowedBeats = (session.assignedBeats || [session.beat || 'Beat 2']).map((b: string) => b.replace(/beat\s*/i, '').trim());

    return this.customers.filter(c => {
      const cBeat = (c.beatNo || '2').replace(/beat\s*/i, '').trim();
      const isMyBeat = cBeat === userBeat || allowedBeats.includes(cBeat);
      const isCreatedByMe = c.createdBy && (
        c.createdBy.toUpperCase() === session.employeeId?.toUpperCase() || 
        c.createdBy === session.id || 
        c.createdBy === session.name
      );
      return isMyBeat || isCreatedByMe;
    });
  }

  /**
   * Scoped Properties getter:
   * - Admin: Returns all registered properties
   * - Postman: Returns only properties belonging to the postman's assigned beat
   */
  public getScopedProperties(activeSession?: any): Property[] {
    const allProps = this.getProperties();
    const session = activeSession || staffPermissionService.getActiveSession();
    if (!session || staffPermissionService.isSuperAdmin(session) || session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
      return allProps;
    }
    const userBeat = (session.beat || 'Beat 2').replace(/beat\s*/i, '').trim();
    const allowedBeats = (session.assignedBeats || [session.beat || 'Beat 2']).map((b: string) => b.replace(/beat\s*/i, '').trim());

    return allProps.filter(p => {
      const pBeat = (p.beatNo || '2').replace(/beat\s*/i, '').trim();
      return pBeat === userBeat || allowedBeats.includes(pBeat);
    });
  }

  /**
   * Separate Edit Permission Check:
   * A postman can view all properties in their beat, but can only edit/update records originally created by that postman.
   */
  public canEditRecord(record: { createdBy?: string; beatNo?: string }, activeSession?: any): boolean {
    const session = activeSession || staffPermissionService.getActiveSession();
    if (!session) return true;
    if (staffPermissionService.isSuperAdmin(session) || session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
      return true;
    }
    if (!record.createdBy) {
      const userBeat = (session.beat || 'Beat 2').replace(/beat\s*/i, '').trim();
      const rBeat = (record.beatNo || '2').replace(/beat\s*/i, '').trim();
      return userBeat === rBeat;
    }
    return (
      record.createdBy.toUpperCase() === session.employeeId?.toUpperCase() || 
      record.createdBy === session.id ||
      record.createdBy === session.name
    );
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.customers.find(c => c.id === id || c.masterId === id);
  }

  public getCustomerByMobile(mobile: string): Customer | undefined {
    const norm = normalizeMobile(mobile);
    if (!norm) return undefined;
    return this.customers.find(c => c.mobile === norm || normalizeMobile(c.whatsapp) === norm || normalizeMobile(c.alternateMobile) === norm);
  }

  public getLeads(): Lead[] {
    return this.leads;
  }

  public getFollowUps(): FollowUp[] {
    return this.followUps;
  }

  public getTickets(): SupportTicket[] {
    return this.tickets;
  }

  public getInquiries(): Inquiry[] {
    return this.inquiries;
  }

  public getConflicts(): DataConflict[] {
    return this.conflicts;
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  // DUPLICATE DETECTION LOGIC
  public checkDuplicates(candidate: Partial<Customer>): {
    status: 'EXACT_MATCH' | 'PROBABLE_MATCH' | 'POSSIBLE_MATCH' | 'UNIQUE';
    matchedCustomer?: Customer;
    conflictReason?: string;
  } {
    const normCandMobile = normalizeMobile(candidate.mobile);
    const candName = (candidate.name || '').trim().toLowerCase();
    const candHouse = (candidate.address?.houseNumber || candidate.houseNo || '').trim().toLowerCase();
    const candSector = (candidate.address?.sectorLocality || candidate.sector || '').trim().toLowerCase();

    // 1. Check exact mobile match
    if (normCandMobile) {
      const match = this.customers.find(c => c.mobile === normCandMobile);
      if (match) {
        // Same mobile, check if name is different
        if (candName && match.name.toLowerCase() !== candName) {
          return {
            status: 'POSSIBLE_MATCH',
            matchedCustomer: match,
            conflictReason: `Mobile ${normCandMobile} is already registered to "${match.name}". Potential shared household contact or identity mismatch.`
          };
        }
        return {
          status: 'EXACT_MATCH',
          matchedCustomer: match,
          conflictReason: `Customer record already exists under Master ID ${match.masterId || match.id}.`
        };
      }
    }

    // 2. Check name + address combination
    if (candName && candHouse && candHouse !== 'n/a') {
      // Sector 6 House 3 & 4 Common Shared Property Exemption for Dhanraj Bairwa
      const candColony = (candidate.colony || candidate.area || candidate.address?.area || '').toLowerCase();
      if (isSector6House3Or4(candColony, candSector, candHouse)) {
        const matchDhanraj = this.customers.find(c => 
          (c.name.toLowerCase().includes('dhanraj bairwa') || c.name.toLowerCase().includes('dhanraj')) &&
          (c.area?.toLowerCase().includes('keshav') || c.sector?.toLowerCase().includes('6'))
        );
        if (matchDhanraj) {
          return {
            status: 'EXACT_MATCH',
            matchedCustomer: matchDhanraj,
            conflictReason: `Sector 6 House 3 & 4 is a validated common shared property owned by Dhanraj Bairwa (${matchDhanraj.masterId}). Joint plot linked without duplication.`
          };
        }
      }

      const match = this.customers.find(c => {
        const cName = c.name.toLowerCase();
        const cHouse = (c.address?.houseNumber || c.houseNo || '').toLowerCase();
        const cSector = (c.address?.sectorLocality || c.sector || '').toLowerCase();

        const nameMatch = cName === candName || cName.includes(candName) || candName.includes(cName);
        const houseMatch = cHouse && cHouse === candHouse;
        const sectorMatch = (!candSector || !cSector) || cSector.includes(candSector) || candSector.includes(cSector);

        return nameMatch && houseMatch && sectorMatch;
      });

      if (match) {
        return {
          status: 'PROBABLE_MATCH',
          matchedCustomer: match,
          conflictReason: `Similar name "${match.name}" and matching house number "${candHouse}" located in Master Source.`
        };
      }
    }

    // 3. Strict Relational Reference Matching: Beat Number + Sector + Pincode + Unique House Number
    const candBeat = (candidate.beatNo || '').trim().toLowerCase();
    const candPincode = (candidate.pincode || candidate.address?.pincode || '324009').trim();
    if (candBeat && candSector && candHouse && candHouse !== 'n/a') {
      const propMatch = this.customers.find(c => {
        const cBeat = (c.beatNo || '').trim().toLowerCase();
        const cSector = (c.address?.sectorLocality || c.sector || '').trim().toLowerCase();
        const cHouse = (c.address?.houseNumber || c.houseNo || '').trim().toLowerCase();
        const cPin = (c.pincode || c.address?.pincode || '324009').trim();
        return (cBeat === candBeat || cBeat.replace(/\s+/g, '') === candBeat.replace(/\s+/g, '')) &&
               (cSector === candSector || cSector.includes(candSector) || candSector.includes(cSector)) &&
               cHouse === candHouse &&
               (!cPin || !candPincode || cPin === candPincode);
      });
      if (propMatch) {
        return {
          status: 'EXACT_MATCH',
          matchedCustomer: propMatch,
          conflictReason: `Relational property matched on ${candidate.beatNo}, Sector ${candSector}, House ${candHouse}, PIN ${candPincode}. Merging non-destructively.`
        };
      }
    }

    return { status: 'UNIQUE' };
  }

  // ADD OR MERGE CUSTOMER (Core Mandate: NO DUPLICATE -> UPDATE EXISTING RECORD; NEW VERIFIED DATA -> ADD; CONFLICT -> FLAG)
  public addOrUpdateCustomer(data: Partial<Customer>, source: string = 'User Direct Input'): {
    success: boolean;
    customer: Customer;
    isNew: boolean;
    conflictDetected: boolean;
  } {
    const normMobile = normalizeMobile(data.mobile);
    const existingCheck = this.checkDuplicates(data);

    // Explicitly validate structured hierarchy fields: Colony -> Sector -> Block -> House No
    const rawCol = data.colony || data.area || data.address?.colony || data.address?.area || 'Keshavpura';
    const cleanColObj = normalizeAndCleanColony(rawCol);
    const validColony = cleanColObj.colony;
    const validSector = (data.sector || data.address?.sector || cleanColObj.extractedSector || 'Sector 1').trim();
    const validBlock = (data.block || data.address?.block || cleanColObj.extractedBlock || validSector).trim();
    const validHouse = (data.houseNo || data.address?.houseNo || data.address?.houseNumber || '').trim();
    const validPincode = getAuditedPincodeForColony(validColony, `${validSector} ${validBlock}`);

    let customerResult: Customer;
    let isNew = false;
    let conflictDetected = false;

    if (existingCheck.status === 'EXACT_MATCH' && existingCheck.matchedCustomer) {
      // UPDATE EXISTING RECORD SAFELY WITHOUT OVERWRITING VERIFIED DATA
      const existing = existingCheck.matchedCustomer;
      const prev = JSON.parse(JSON.stringify(existing));

      // Append new products if any
      const updatedProducts = [...(existing.products || [])];
      if (data.products && data.products.length > 0) {
        data.products.forEach(p => {
          if (!updatedProducts.some(ep => ep.productCode === p.productCode)) {
            updatedProducts.push(p);
          }
        });
      }

      // Non-destructive preservation of historic GPS pins, verified logs, and existing household members
      const existingGps = (existing as any).gpsCoordinates || (existing.address as any)?.gpsCoordinates || (existing as any).gpsPin || (existing.address as any)?.latitude;
      const existingPropId = existing.propertyId || (existing as any).propertyCode;

      // Update fields if new non-empty verified values provided
      existing.name = data.name || existing.name;
      existing.whatsapp = data.whatsapp ? normalizeMobile(data.whatsapp) : existing.whatsapp;
      existing.alternateMobile = data.alternateMobile ? normalizeMobile(data.alternateMobile) : existing.alternateMobile;
      existing.email = data.email || existing.email;
      existing.occupation = data.occupation || existing.occupation;
      existing.livingStatus = data.livingStatus || existing.livingStatus;

      // Cleanly append or update household members without wiping existing ones
      if (data.householdMembers && Array.isArray(data.householdMembers) && data.householdMembers.length > 0) {
        const currentMembers = existing.householdMembers || [];
        const mergedMembers = [...currentMembers];
        data.householdMembers.forEach(newMem => {
          if (!mergedMembers.some(em => em.name?.toLowerCase() === newMem.name?.toLowerCase())) {
            mergedMembers.push(newMem);
          }
        });
        existing.householdMembers = mergedMembers;
      }

      existing.beatNo = data.beatNo || existing.beatNo;
      existing.existingBanking = data.existingBanking || existing.existingBanking;
      existing.financialInterest = data.financialInterest || existing.financialInterest;
      existing.verificationStatus = existing.verificationStatus === 'Verified' ? 'Verified' : (data.verificationStatus || existing.verificationStatus);
      
      // Preserve historic property ID & GPS pins
      if (existingPropId) existing.propertyId = existingPropId;
      if (existingGps) {
        (existing as any).gpsCoordinates = existingGps;
      }

      // Explicit validated hierarchy persistence
      existing.colony = validColony;
      existing.area = validColony;
      existing.sector = validSector;
      existing.block = validBlock;
      existing.houseNo = validHouse || existing.houseNo;
      existing.pincode = validPincode;
      existing.street = data.street || existing.street;
      existing.landmark = data.landmark || existing.landmark;
      if (data.residentialAddress) existing.residentialAddress = { ...existing.residentialAddress, ...data.residentialAddress };
      if (data.permanentAddress) existing.permanentAddress = { ...existing.permanentAddress, ...data.permanentAddress };
      if (typeof data.sameAsResidential === 'boolean') existing.sameAsResidential = data.sameAsResidential;
      if (typeof data.isShifted === 'boolean') existing.isShifted = data.isShifted;
      if (data.relocationHistory) existing.relocationHistory = data.relocationHistory;
      
      existing.address = {
        colony: validColony,
        area: validColony,
        sector: validSector,
        block: validBlock,
        sectorLocality: validSector,
        houseNumber: validHouse || existing.address?.houseNumber || '',
        houseNo: validHouse || existing.address?.houseNo || '',
        street: data.address?.street || data.street || existing.address?.street || '',
        buildingSociety: data.address?.buildingSociety || existing.address?.buildingSociety || '',
        streetColony: data.address?.streetColony || existing.address?.streetColony || '',
        pincode: validPincode,
        landmark: data.address?.landmark || data.landmark || existing.address?.landmark || '',
        fullAddress: data.address?.fullAddress || `${validHouse ? validHouse + ', ' : ''}${validBlock && validBlock !== validSector ? validBlock + ', ' : ''}${validSector}, ${validColony}, Kota - ${validPincode}`
      };

      if (data.remarks) {
        existing.remarks = existing.remarks ? `${existing.remarks} | ${data.remarks}` : data.remarks;
      }
      existing.products = updatedProducts;
      existing.updatedAt = new Date().toISOString();

      customerResult = existing;
      this.logAudit('CUSTOMER_UPDATED', 'Customer', existing.id, existing.name, `Merged new information into existing record ${existing.masterId || existing.id}`, prev, existing);
    } else if (existingCheck.status === 'POSSIBLE_MATCH' && existingCheck.matchedCustomer) {
      // CONFLICT FLAG: Same mobile with different name
      conflictDetected = true;
      const matched = existingCheck.matchedCustomer;

      // Create new customer with unique ID and flag conflict on both
      const newMasterIndex = this.customers.length + 3380;
      const newMasterId = `UM-${newMasterIndex.toString().padStart(5, '0')}`;

      const newCust: Customer = {
        id: newMasterId,
        masterId: newMasterId,
        name: data.name || 'Unknown Name',
        mobile: normMobile,
        whatsapp: data.whatsapp ? normalizeMobile(data.whatsapp) : normMobile,
        alternateMobile: data.alternateMobile ? normalizeMobile(data.alternateMobile) : '',
        email: data.email || '',
        occupation: data.occupation || '',
        category: data.category || 'General',
        address: data.address || {
          houseNumber: '',
          buildingSociety: '',
          streetColony: '',
          sectorLocality: 'Keshavpura',
          area: 'Keshavpura',
          pincode: '324009',
          landmark: '',
          fullAddress: ''
        },
        livingStatus: data.livingStatus || 'Other',
        householdMembers: data.householdMembers || [],
        beatNo: data.beatNo || 'Beat 1',
        officeId: 'DADABARI_SO',
        propertyId: data.propertyId || '',
        householdId: data.householdId || matched.householdId || '',
        existingBanking: data.existingBanking || '',
        financialInterest: data.financialInterest || '',
        leadScore: 70,
        followUpStatus: 'Pending',
        verificationStatus: 'Needs Verification',
        approvalStatus: 'Pending',
        source: source,
        remarks: `Shared mobile conflict with ${matched.name} (${matched.masterId}). ${data.remarks || ''}`,
        notes: data.notes || '',
        products: data.products || [],
        dataCompleteness: 75,
        hasConflict: true,
        conflictDetails: [`Mobile number ${normMobile} is shared with existing record ${matched.name} (${matched.masterId})`],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Flag existing customer as well
      matched.hasConflict = true;
      matched.conflictDetails = [...(matched.conflictDetails || []), `Shared mobile conflict with new entry ${newCust.name} (${newCust.masterId})`];

      this.customers.unshift(newCust);
      customerResult = newCust;
      isNew = true;

      // Log formal Conflict
      const conf: DataConflict = {
        id: `CONF-${Date.now()}`,
        customerId: newCust.id,
        customerName: newCust.name,
        masterId: newCust.masterId,
        fieldName: 'Mobile Number',
        existingValue: `${matched.name} (${matched.masterId}) - ${normMobile}`,
        incomingValue: `${newCust.name} (${newCust.masterId}) - ${normMobile}`,
        sourceOfConflict: source,
        status: 'Pending Review',
        detectedAt: new Date().toISOString(),
        resolutionRemarks: 'Shared mobile number detected. Identity separation maintained.'
      };
      this.conflicts.unshift(conf);
      this.saveConflictsLocal();

      this.logAudit('CONFLICT_CREATED', 'Conflict', conf.id, newCust.name, `Detected shared phone number conflict between ${matched.name} and ${newCust.name}`);
    } else {
      // BRAND NEW VERIFIED RECORD
      const newMasterIndex = this.customers.length + 3380;
      const newMasterId = data.masterId || `UM-${newMasterIndex.toString().padStart(5, '0')}`;

      const newCust: Customer = {
        id: newMasterId,
        masterId: newMasterId,
        name: data.name || 'Valued Customer',
        mobile: normMobile,
        whatsapp: data.whatsapp ? normalizeMobile(data.whatsapp) : normMobile,
        alternateMobile: data.alternateMobile ? normalizeMobile(data.alternateMobile) : '',
        email: data.email || '',
        fatherHusbandName: data.fatherHusbandName || '',
        occupation: data.occupation || '',
        category: data.category || 'General',
        colony: validColony,
        area: validColony,
        sector: validSector,
        block: validBlock,
        houseNo: validHouse,
        pincode: validPincode,
        street: data.street || '',
        landmark: data.landmark || '',
        address: {
          colony: validColony,
          area: validColony,
          sector: validSector,
          block: validBlock,
          sectorLocality: validSector,
          houseNumber: validHouse,
          houseNo: validHouse,
          street: data.street || '',
          buildingSociety: '',
          streetColony: data.street || '',
          pincode: validPincode,
          landmark: data.landmark || '',
          fullAddress: `${validHouse ? validHouse + ', ' : ''}${validBlock && validBlock !== validSector ? validBlock + ', ' : ''}${validSector}, ${validColony}, Kota - ${validPincode}`
        },
        residentialAddress: {
          colony: validColony,
          area: validColony,
          sector: validSector,
          block: validBlock,
          sectorLocality: validSector,
          houseNo: validHouse,
          houseNumber: validHouse,
          street: data.street || '',
          landmark: data.landmark || '',
          pincode: validPincode,
          fullAddress: `${validHouse ? validHouse + ', ' : ''}${validBlock && validBlock !== validSector ? validBlock + ', ' : ''}${validSector}, ${validColony}, Kota - ${validPincode}`
        },
        permanentAddress: data.sameAsResidential === false && data.permanentAddress ? data.permanentAddress : {
          colony: validColony,
          area: validColony,
          sector: validSector,
          block: validBlock,
          sectorLocality: validSector,
          houseNo: validHouse,
          houseNumber: validHouse,
          street: data.street || '',
          landmark: data.landmark || '',
          pincode: validPincode,
          fullAddress: `${validHouse ? validHouse + ', ' : ''}${validBlock && validBlock !== validSector ? validBlock + ', ' : ''}${validSector}, ${validColony}, Kota - ${validPincode}`
        },
        sameAsResidential: data.sameAsResidential ?? true,
        isShifted: data.isShifted || false,
        relocationHistory: data.relocationHistory || [],
        livingStatus: data.livingStatus || 'Other',
        householdMembers: data.householdMembers || [],
        beatNo: data.beatNo || 'Beat 1',
        officeId: data.officeId || 'DADABARI_SO',
        propertyId: data.propertyId || '',
        householdId: data.householdId || '',
        existingBanking: data.existingBanking || '',
        financialInterest: data.financialInterest || '',
        leadScore: data.leadScore || 75,
        followUpStatus: data.followUpStatus || 'Not Scheduled',
        verificationStatus: data.verificationStatus || 'Field Confirmed',
        approvalStatus: 'Approved',
        source: source,
        remarks: data.remarks || '',
        notes: data.notes || '',
        products: data.products || [],
        dataCompleteness: 85,
        hasConflict: false,
        conflictDetails: [],
        enteredBy: data.enteredBy || '',
        enteredByName: data.enteredByName || '',
        assignedStaffId: data.assignedStaffId || '',
        assignedStaffName: data.assignedStaffName || '',
        assignedStaffEmail: data.assignedStaffEmail || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.customers.unshift(newCust);
      customerResult = newCust;
      isNew = true;

      // Track quota for the staff member who entered the record
      if (data.enteredBy) {
        staffPermissionService.recordNewEntry(data.enteredBy);
      }

      this.logAudit('CUSTOMER_CREATED', 'Customer', newCust.id, newCust.name, `Added new verified customer record into Master Source (${source}) by ${data.enteredByName || data.enteredBy || 'Staff'}`);
    }

    this.saveCustomersLocal();
    this.persistCustomerToFirestore(customerResult);
    this.notify();

    return {
      success: true,
      customer: customerResult,
      isNew,
      conflictDetected
    };
  }

  // Public On-Demand Data Audit & Normalization Trigger
  public runDataAudit() {
    const { auditedCustomers, metrics } = auditAndNormalizeCustomerRecords(this.customers);
    this.customers = auditedCustomers;
    this.saveCustomersLocal();
    this.notify();
    return metrics;
  }

  public assignCustomerToStaff(
    customerId: string,
    staffOrEmail: string | { id?: string; name: string; email: string }
  ) {
    const cust = this.getCustomerById(customerId);
    if (cust) {
      let resolvedStaff: { id?: string; name: string; email: string; beat?: string };
      if (typeof staffOrEmail === 'string') {
        const prof =
          staffPermissionService.findStaffProfileByIdentifier(staffOrEmail) ||
          staffPermissionService.getStaffProfileByEmail(staffOrEmail);
        resolvedStaff = {
          id: prof.id,
          name: prof.name,
          email: prof.email,
          beat: prof.beat,
        };
      } else {
        resolvedStaff = staffOrEmail;
      }

      cust.assignedStaffId = resolvedStaff.id || '';
      cust.assignedStaffName = resolvedStaff.name;
      cust.assignedStaffEmail = resolvedStaff.email;
      if (resolvedStaff.beat && resolvedStaff.beat !== 'All Beats') {
        cust.beatNo = resolvedStaff.beat.replace(/^Beat\s*/i, '').trim() || cust.beatNo;
      }
      cust.updatedAt = new Date().toISOString();
      this.customers = [...this.customers];
      this.saveCustomersLocal();
      this.persistCustomerToFirestore(cust);
      this.logAudit(
        'STAFF_ASSIGNED',
        'Customer',
        cust.id,
        cust.name,
        `Assigned to ${resolvedStaff.name} (${resolvedStaff.email})`
      );
      this.notify();
      return true;
    }
    return false;
  }

  private async persistCustomerToFirestore(cust: Customer) {
    try {
      if (db) {
        await setDoc(doc(db, 'customers', cust.id), cust, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore write fallback to local storage:', e);
    }
  }

  // LEADS LIFECYCLE MANAGEMENT
  public createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead {
    const lead: Lead = {
      ...leadData,
      id: `LEAD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.leads.unshift(lead);
    this.saveLeadsLocal();
    this.logAudit('LEAD_CREATED', 'Lead', lead.id, lead.customerName, `Created ${lead.productName} lead for ${lead.customerName}`);
    this.notify();
    return lead;
  }

  public updateLead(leadId: string, updates: Partial<Lead>): Lead | undefined {
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead) return undefined;

    Object.assign(lead, updates, { updatedAt: new Date().toISOString() });
    this.saveLeadsLocal();
    this.logAudit('LEAD_UPDATED', 'Lead', lead.id, lead.customerName, `Lead ${lead.id} details updated`);
    this.notify();
    return lead;
  }

  public updateLeadStage(leadId: string, stage: Lead['stage'], notes?: string): Lead | undefined {
    const idx = this.leads.findIndex(l => l.id === leadId);
    if (idx === -1) return undefined;

    const lead = { ...this.leads[idx] };
    const oldStage = lead.stage;
    const normalizedTargetStage: Lead['stage'] =
      stage === 'Completed' ? 'Converted - Product Opened' : stage;
    lead.stage = normalizedTargetStage;
    if (notes) lead.notes = `${lead.notes || ''} [${normalizedTargetStage}]: ${notes}`;
    lead.updatedAt = new Date().toISOString();

    this.leads = [
      ...this.leads.slice(0, idx),
      lead,
      ...this.leads.slice(idx + 1),
    ];

    // If stage is 'Converted - Product Opened' or 'Completed' -> automatically attach product to Customer!
    if (normalizedTargetStage === 'Converted - Product Opened' || stage === 'Completed') {
      const cust = this.getCustomerById(lead.customerId) || this.getCustomerByMobile(lead.customerMobile);
      if (cust) {
        const newProduct: CustomerProductRelation = {
          id: `p-${cust.masterId || cust.id}-${lead.productCode.toLowerCase()}-${Date.now()}`,
          productCode: lead.productCode,
          productName: lead.productName,
          status: 'Active',
          sumAssuredOrBalance: lead.estimatedValue || 0,
          startDate: new Date().toISOString().split('T')[0],
          lastUpdated: new Date().toISOString().split('T')[0],
          remarks: `Converted from Lead ${lead.id}`,
        };
        cust.products = [...(cust.products || []), newProduct];
        this.customers = [...this.customers];
        this.saveCustomersLocal();
        this.logAudit(
          'LEAD_CONVERTED',
          'Customer',
          cust.id,
          cust.name,
          `Successfully converted lead ${lead.id} to Active product ${lead.productName}`
        );
      }
    }

    this.saveLeadsLocal();
    this.logAudit('LEAD_UPDATED', 'Lead', lead.id, lead.customerName, `Lead stage updated from ${oldStage} to ${normalizedTargetStage}`);
    this.notify();
    return lead;
  }

  // FOLLOW-UP SCHEDULING & COMPLETION
  public scheduleFollowUp(data: Omit<FollowUp, 'id' | 'createdAt'>): FollowUp {
    const followUp: FollowUp = {
      ...data,
      id: `FOL-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.followUps.unshift(followUp);
    this.saveFollowupsLocal();

    // Update customer's nextFollowUpDate
    const cust = this.getCustomerById(data.customerId);
    if (cust) {
      cust.nextFollowUpDate = data.scheduledDate;
      cust.followUpStatus = 'Scheduled';
      this.saveCustomersLocal();
    }

    this.logAudit('FOLLOWUP_CREATED', 'FollowUp', followUp.id, followUp.customerName, `Scheduled follow-up for ${followUp.scheduledDate}`);
    this.notify();
    return followUp;
  }

  public completeFollowUp(id: string, outcome: string, nextAction?: string): FollowUp | undefined {
    const fol = this.followUps.find(f => f.id === id);
    if (!fol) return undefined;

    fol.currentStatus = 'Completed';
    fol.outcome = outcome;
    fol.completedAt = new Date().toISOString();
    if (nextAction) fol.nextAction = nextAction;

    this.saveFollowupsLocal();
    this.logAudit('FOLLOWUP_COMPLETED', 'FollowUp', fol.id, fol.customerName, `Completed follow-up: ${outcome}`);
    this.notify();
    return fol;
  }

  public updateFollowUp(id: string, updates: Partial<FollowUp>): FollowUp | undefined {
    const fol = this.followUps.find(f => f.id === id);
    if (!fol) return undefined;

    Object.assign(fol, updates, { updatedAt: new Date().toISOString() });
    
    this.saveFollowupsLocal();
    this.logAudit('FOLLOWUP_UPDATED', 'FollowUp', fol.id, fol.customerName, `Updated follow-up: ${Object.keys(updates).join(', ')}`);
    this.notify();
    return fol;
  }

  // CUSTOMER INQUIRY & SUPPORT TICKETS
  public submitCustomerInquiry(inquiryData: {
    customerName: string;
    mobile: string;
    productInterested: string;
    requirement: string;
    preferredContact?: 'Phone Call' | 'WhatsApp' | 'Doorstep Visit' | 'Email';
    address?: string;
    beatNo?: string;
  }): { inquiry: Inquiry; matchedCustomer?: Customer } {
    const norm = normalizeMobile(inquiryData.mobile);
    const existing = this.getCustomerByMobile(norm);
    const resolvedBeat = inquiryData.beatNo || existing?.beatNo || 'Beat 2';

    const inquiry: Inquiry = {
      id: `INQ-${Date.now()}`,
      ticketNumber: `INQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: inquiryData.customerName,
      mobile: norm,
      preferredContact: inquiryData.preferredContact || 'Phone Call',
      productInterested: inquiryData.productInterested,
      requirement: inquiryData.requirement,
      address: inquiryData.address || (existing?.address?.fullAddress || ''),
      status: 'New',
      assignedStaffName: 'Dadabari SO Team',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.inquiries.unshift(inquiry);
    this.saveInquiriesLocal();

    // Also auto-generate a Lead in CRM pipeline
    let customerId = existing?.id || '';
    if (!existing) {
      // Auto register customer with unverified inquiry status
      const res = this.addOrUpdateCustomer({
        name: inquiryData.customerName,
        mobile: norm,
        beatNo: resolvedBeat,
        address: {
          houseNumber: '',
          sectorLocality: inquiryData.address || 'Keshavpura',
          pincode: '324009',
          fullAddress: inquiryData.address || 'Dadabari SO Jurisdiction, Kota - 324009'
        },
        verificationStatus: 'User Provided',
        source: 'Public Web Inquiry Portal',
        remarks: `Inquiry submitted for ${inquiryData.productInterested}: ${inquiryData.requirement}`
      }, 'Customer Portal');
      customerId = res.customer.id;
    } else {
      existing.remarks = `${existing.remarks || ''} | [New Inquiry ${inquiry.ticketNumber}]: ${inquiryData.productInterested}`;
      this.saveCustomersLocal();
    }

    // Create Lead
    this.createLead({
      customerId,
      customerName: inquiryData.customerName,
      customerMobile: norm,
      customerAddress: inquiryData.address || (existing?.address?.fullAddress || 'Dadabari SO, Kota - 324009'),
      beatNo: resolvedBeat,
      productCode: inquiryData.productInterested,
      productName: inquiryData.productInterested,
      requirement: inquiryData.requirement,
      source: 'Customer Web Inquiry',
      stage: 'New',
      priority: 'High',
      leadScore: 85,
      assignedStaffName: 'Dadabari Postal Desk',
      nextAction: `Contact customer via ${inquiry.preferredContact} regarding ${inquiryData.productInterested}`
    });

    this.logAudit('TICKET_CREATED', 'Ticket', inquiry.id, inquiry.customerName, `Customer submitted web inquiry ${inquiry.ticketNumber} for ${inquiry.productInterested}`);
    this.notify();

    return { inquiry, matchedCustomer: existing };
  }

  public createSupportTicket(ticketData: Omit<SupportTicket, 'id' | 'ticketId' | 'createdAt' | 'updatedAt'>): SupportTicket {
    const ticket: SupportTicket = {
      ...ticketData,
      id: `TKT-${Date.now()}`,
      ticketId: `TKT-2026-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.tickets.unshift(ticket);
    this.saveTicketsLocal();
    this.logAudit('TICKET_CREATED', 'Ticket', ticket.ticketId, ticket.customerName, `Created ticket ${ticket.ticketId}: ${ticket.subject}`);
    this.notify();
    return ticket;
  }

  public updateTicketStatus(id: string, status: SupportTicket['status'], resolutionNotes?: string): SupportTicket | undefined {
    const ticket = this.tickets.find(t => t.id === id || t.ticketId === id);
    if (!ticket) return undefined;

    ticket.status = status;
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
    ticket.updatedAt = new Date().toISOString();

    this.saveTicketsLocal();
    this.logAudit('TICKET_RESOLVED', 'Ticket', ticket.ticketId, ticket.customerName, `Updated ticket ${ticket.ticketId} status to ${status}`);
    this.notify();
    return ticket;
  }

  // CONFLICT RESOLUTION
  public resolveConflict(conflictId: string, decision: 'KEEP_EXISTING' | 'UPDATE_NEW' | 'MERGE', remarks: string) {
    const conf = this.conflicts.find(c => c.id === conflictId);
    if (!conf) return;

    conf.status = decision === 'KEEP_EXISTING' ? 'Resolved - Kept Existing' : (decision === 'UPDATE_NEW' ? 'Resolved - Updated to New' : 'Resolved - Merged');
    conf.resolvedAt = new Date().toISOString();
    conf.resolvedBy = 'Operations Manager';
    conf.resolutionRemarks = remarks;

    // Remove conflict flag from customer if no other unresolved conflicts
    const cust = this.getCustomerById(conf.customerId);
    if (cust) {
      const remaining = this.conflicts.filter(c => c.customerId === cust.id && c.status === 'Pending Review');
      if (remaining.length === 0) {
        cust.hasConflict = false;
      }
      this.saveCustomersLocal();
    }

    this.saveConflictsLocal();
    this.logAudit('CONFLICT_RESOLVED', 'Conflict', conf.id, conf.customerName, `Resolved conflict with decision: ${decision}`);
    this.notify();
  }

  public getHouseholds(): Household[] {
    const hhMap = new Map<string, Household>();
    this.customers.forEach((c) => {
      const code = c.householdId || `HH-${c.sector || '7'}-${c.houseNo || '001'}`;
      if (!hhMap.has(code)) {
        hhMap.set(code, {
          id: code,
          householdCode: code,
          primaryCustomerId: c.id,
          primaryCustomerName: c.name,
          address: c.address?.fullAddress || `${c.houseNo || ''}, Sector ${c.sector || '7'}, Keshavpura`,
          sector: c.sector || '7',
          area: c.area || 'Keshavpura',
          members: [
            {
              customerId: c.id,
              name: c.name,
              relationship: 'Head of Family',
              mobile: c.mobile
            }
          ],
          activeProducts: (c.products || []).map(p => p.productName),
          leadCount: 0,
          remarks: c.remarks,
          createdAt: c.createdAt || new Date().toISOString()
        });
      } else {
        const hh = hhMap.get(code)!;
        hh.members.push({
          customerId: c.id,
          name: c.name,
          relationship: 'Family Member',
          mobile: c.mobile
        });
        (c.products || []).forEach(p => {
          if (!hh.activeProducts.includes(p.productName)) {
            hh.activeProducts.push(p.productName);
          }
        });
      }
    });
    return Array.from(hhMap.values());
  }

  public getProperties(): Property[] {
    const propMap = new Map<string, Property>();

    this.customers.forEach((c) => {
      const rawHouseNo = (c.houseNo || c.address?.houseNumber || '').trim();
      const hasValidHouseNo = Boolean(
        rawHouseNo &&
        rawHouseNo !== '' &&
        rawHouseNo !== 'Plot Unit' &&
        rawHouseNo.toLowerCase() !== 'n/a' &&
        rawHouseNo !== '--'
      );

      const pCode = c.propertyId || `PROP-${c.sector || '7'}-${hasValidHouseNo ? rawHouseNo : 'UNNUMBERED'}`;

      if (this.deletedPropertyIds.has(pCode) || (c.propertyId && this.deletedPropertyIds.has(c.propertyId))) {
        return;
      }

      if (!propMap.has(pCode)) {
        const isShifted = (c.remarks || '').toLowerCase().includes('left') || (c.remarks || '').toLowerCase().includes('moved');
        
        // As requested:
        // 1. Where house number is missing, remove members from entry (residentNames = [])
        // 2. Put property into 'Vacant' status
        // 3. Keep customer member intact in customer database (member ko nahi remove krna)
        const initialStatus: Property['status'] = !hasValidHouseNo ? 'Vacant' : (isShifted ? 'Address Left' : 'Occupied');

        propMap.set(pCode, {
          id: pCode,
          propertyCode: pCode,
          housePlotNumber: hasValidHouseNo ? rawHouseNo : '',
          houseNo: hasValidHouseNo ? rawHouseNo : '',
          address: c.address?.fullAddress || `${hasValidHouseNo ? rawHouseNo + ', ' : ''}Sector ${c.sector || '7'}, Keshavpura, Kota`,
          sector: c.sector || '7',
          area: c.area || 'Keshavpura',
          pincode: '324009',
          beatNo: c.beatNo || '2',
          officeId: c.officeId || 'DADABARI_SO',
          status: initialStatus,
          residentNames: hasValidHouseNo ? [c.name] : [],
          residents: hasValidHouseNo ? [{ name: c.name, relationshipWithHead: 'Head of Family' }] : [],
          verificationStatus: hasValidHouseNo,
          notes: hasValidHouseNo ? c.remarks : 'Vacant Property (No House Number recorded. Members removed from entry).'
        });
      } else {
        const prop = propMap.get(pCode)!;
        // Only attach member if both customer and property have a valid house number
        const propHasHouseNo = Boolean(prop.housePlotNumber && prop.housePlotNumber.trim() && prop.housePlotNumber !== 'Plot Unit');
        if (hasValidHouseNo && propHasHouseNo) {
          if (!prop.residentNames?.includes(c.name)) {
            prop.residentNames = [...(prop.residentNames || []), c.name];
          }
          if (!prop.residents?.some(r => r.name === c.name)) {
            prop.residents = [...(prop.residents || []), { name: c.name, relationshipWithHead: 'Family Member' }];
          }
        }
      }
    });

    // Apply explicit property overrides (e.g. manually set to Vacant)
    this.propertyOverrides.forEach((override, propId) => {
      if (propMap.has(propId)) {
        const current = propMap.get(propId)!;
        propMap.set(propId, { ...current, ...override });
      }
    });

    return Array.from(propMap.values()).filter(p => !this.deletedPropertyIds.has(p.id) && !this.deletedPropertyIds.has(p.propertyCode || ''));
  }

  // Set all properties with missing house number to 'Vacant' and remove members from those entries
  public vacateAllPropertiesWithoutHouseNo(): { vacatedCount: number; membersPreserved: number } {
    let vacatedCount = 0;
    let membersPreserved = 0;

    const currentProps = this.getProperties();
    currentProps.forEach(prop => {
      const hasHouse = Boolean(prop.housePlotNumber && prop.housePlotNumber.trim() && prop.housePlotNumber !== 'Plot Unit' && prop.housePlotNumber.toLowerCase() !== 'n/a');
      if (!hasHouse) {
        vacatedCount++;
        membersPreserved += (prop.residentNames?.length || 0);
        const updated: Partial<Property> = {
          status: 'Vacant',
          residentNames: [],
          residents: [],
          notes: 'Marked Vacant due to missing house number. Residents safely preserved in customer registry.'
        };
        this.propertyOverrides.set(prop.id, updated);
        if (prop.propertyCode) {
          this.propertyOverrides.set(prop.propertyCode, updated);
        }
      }
    });

    // Disassociate propertyId on customers without house numbers without deleting members
    this.customers.forEach(c => {
      const hasHouse = Boolean(c.houseNo && c.houseNo.trim() && c.houseNo !== 'Plot Unit' && c.houseNo.toLowerCase() !== 'n/a');
      if (!hasHouse && c.propertyId) {
        c.propertyId = undefined;
      }
    });

    this.saveCustomersLocal();
    this.savePropertyPreferences();
    this.notify();
    return { vacatedCount, membersPreserved };
  }

  // Remove properties without house number completely while strictly preserving all members
  public removePropertiesWithoutHouseNo(): { removedCount: number; membersPreserved: number } {
    let removedCount = 0;
    let membersPreserved = 0;

    const currentProps = this.getProperties();
    currentProps.forEach(prop => {
      const hasHouse = Boolean(prop.housePlotNumber && prop.housePlotNumber.trim() && prop.housePlotNumber !== 'Plot Unit' && prop.housePlotNumber.toLowerCase() !== 'n/a');
      if (!hasHouse) {
        removedCount++;
        membersPreserved += (prop.residentNames?.length || 0);
        this.deletedPropertyIds.add(prop.id);
        if (prop.propertyCode) {
          this.deletedPropertyIds.add(prop.propertyCode);
        }
      }
    });

    // Disassociate customers from these properties, but KEEP THE MEMBERS INTACT!
    this.customers.forEach(c => {
      const hasHouse = Boolean(c.houseNo && c.houseNo.trim() && c.houseNo !== 'Plot Unit' && c.houseNo.toLowerCase() !== 'n/a');
      if (!hasHouse && c.propertyId) {
        c.propertyId = undefined;
      }
    });

    this.saveCustomersLocal();
    this.savePropertyPreferences();
    this.notify();
    return { removedCount, membersPreserved };
  }

  // Remove single property while preserving member/customer record
  public removeProperty(propertyId: string): { success: boolean; membersPreserved: number } {
    const prop = this.getProperties().find(p => p.id === propertyId || p.propertyCode === propertyId);
    const count = prop?.residentNames?.length || 0;

    this.deletedPropertyIds.add(propertyId);
    if (prop?.propertyCode) {
      this.deletedPropertyIds.add(prop.propertyCode);
    }

    // Preserve customer members (do NOT delete customer!)
    this.customers.forEach(c => {
      if (c.propertyId === propertyId || (prop?.propertyCode && c.propertyId === prop.propertyCode)) {
        c.propertyId = undefined;
      }
    });

    this.saveCustomersLocal();
    this.savePropertyPreferences();
    this.notify();
    return { success: true, membersPreserved: count };
  }

  // Mark single property as Vacant and clear its resident members
  public markPropertyVacant(propertyId: string): boolean {
    const prop = this.getProperties().find(p => p.id === propertyId || p.propertyCode === propertyId);
    if (!prop) return false;

    const updated: Partial<Property> = {
      status: 'Vacant',
      residentNames: [],
      residents: [],
      notes: 'Manually marked Vacant. Residents removed from property unit.'
    };

    this.propertyOverrides.set(propertyId, updated);
    if (prop.propertyCode) {
      this.propertyOverrides.set(prop.propertyCode, updated);
    }

    // Preserve customers, only detach propertyId
    this.customers.forEach(c => {
      if (c.propertyId === propertyId || (prop.propertyCode && c.propertyId === prop.propertyCode)) {
        c.propertyId = undefined;
      }
    });

    this.saveCustomersLocal();
    this.savePropertyPreferences();
    this.notify();
    return true;
  }

  public updateProperty(property: Property) {
    // Since properties are derived, we need to update the source customers
    property.residentNames?.forEach(residentName => {
      const customer = this.customers.find(c => c.name === residentName);
      if (customer) {
        // Update customer details if necessary (e.g. beat, sector)
        customer.beatNo = property.beatNo || customer.beatNo;
        customer.sector = property.sector || customer.sector;
      }
    });
    this.propertyOverrides.set(property.id, property);
    this.savePropertyPreferences();
    this.saveCustomersLocal();
    this.notify();
  }

  public resetToInitialData() {
    this.resetToDefaultMasterSource();
  }

  public convertLeadToProduct(leadId: string, accountOrPolicyNo?: string): Lead | undefined {
    return this.updateLeadStage(
      leadId,
      'Converted - Product Opened',
      `Policy/Account #${accountOrPolicyNo || 'AC-2026-NEW'} active`
    );
  }

  // EXPORT TO CSV
  public exportCustomersToCSV(): string {
    const headers = [
      'Master ID', 'Name', 'Mobile', 'WhatsApp', 'Area', 'Sector', 'House No.', 
      'Address', 'Pincode', 'Beat No', 'Office ID', 'Property ID', 'Household ID', 
      'Occupation', 'Existing Banking', 'Financial Interest', 'Lead Score', 
      'Follow-up Status', 'Remarks', 'Verification Status', 'Last Visit', 'Next Follow-up', 'Source'
    ];

    const rows = this.customers.map(c => [
      c.masterId || c.id,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      c.mobile || '',
      c.whatsapp || '',
      `"${(c.area || '').replace(/"/g, '""')}"`,
      `"${(c.sector || '').replace(/"/g, '""')}"`,
      `"${(c.houseNo || c.address?.houseNumber || '').replace(/"/g, '""')}"`,
      `"${(c.address?.fullAddress || '').replace(/"/g, '""')}"`,
      c.address?.pincode || '324009',
      c.beatNo || '2',
      c.officeId || 'DADABARI_SO',
      c.propertyId || '',
      c.householdId || '',
      `"${(c.occupation || '').replace(/"/g, '""')}"`,
      `"${(c.existingBanking || '').replace(/"/g, '""')}"`,
      `"${(c.financialInterest || '').replace(/"/g, '""')}"`,
      c.leadScore || 60,
      c.followUpStatus || 'Not Scheduled',
      `"${(c.remarks || '').replace(/"/g, '""')}"`,
      c.verificationStatus || 'Field Confirmed',
      c.lastVisit || '',
      c.nextFollowUpDate || '',
      `"${(c.source || 'MASTER_UNIQUE.csv').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // RESET TO DEFAULT MASTER SOURCE
  public resetToDefaultMasterSource() {
    this.customers = [...INITIAL_CUSTOMERS];
    this.leads = this.generateSampleLeads();
    this.followUps = this.generateSampleFollowUps();
    this.tickets = this.generateSampleTickets();
    this.conflicts = this.detectInitialConflicts();
    this.auditLogs = [];

    this.saveCustomersLocal();
    this.saveLeadsLocal();
    this.saveFollowupsLocal();
    this.saveTicketsLocal();
    this.saveConflictsLocal();
    this.saveAuditLocal();

    this.logAudit('IMPORT_COMPLETED', 'Import', 'MASTER-RESET', 'Master Source Reset', 'Reset all records to standard verified Master Source database.');
    this.notify();
  }

  // COMMUNICATION LOGS & MESSAGING HUB
  private generateInitialCommLogs(): CommunicationLog[] {
    return [
      {
        id: 'COMM-001',
        recipientName: 'Mukesh Sen',
        mobile: '9829012345',
        channel: 'WhatsApp',
        type: 'Sukanya Deposit Reminder',
        content: 'Namaskar Mukesh Ji, your Sukanya Samriddhi annual contribution for FY 2026-27 is due. Beat 2 Postman can collect it doorstep.',
        status: 'Delivered',
        timestamp: '2026-08-22 10:30 AM',
        beatNo: '2'
      },
      {
        id: 'COMM-002',
        recipientName: 'Hemant Yadav',
        mobile: '9649734725',
        channel: 'SMS',
        type: 'PLI Renewal Notice',
        content: 'Dear Hemant Yadav, your Postal Life Insurance policy premium receipt #PLI-883492 has been generated by Dadabari SO.',
        status: 'Delivered',
        timestamp: '2026-08-21 04:15 PM',
        beatNo: '2'
      },
      {
        id: 'COMM-003',
        recipientName: 'Smt. Sona Bai',
        mobile: '9829066778',
        channel: 'WhatsApp',
        type: 'Inquiry Callback',
        content: 'Explained Senior Citizen Savings Scheme quarterly dividend payout procedure (8.2% p.a.).',
        status: 'Completed',
        timestamp: '2026-08-20 02:45 PM',
        beatNo: '2'
      },
      {
        id: 'COMM-004',
        recipientName: 'Keshavpura Residents (Beat 2)',
        mobile: 'Broadcast Group',
        channel: 'Broadcast',
        type: 'Aadhaar Camp Notice',
        content: 'विशेष सूचना: कल प्रातः 10 बजे से शाम 4 बजे तक टीवीएस सर्किल केशवपुरा में डाकिया द्वारा डोरस्टेप आधार मोबाइल अपडेशन शिविर रहेगा।',
        status: 'Delivered',
        timestamp: '2026-08-19 09:00 AM',
        beatNo: '2'
      }
    ];
  }

  public getCommunicationLogs(): CommunicationLog[] {
    return [...this.commLogs];
  }

  public getCommLogs(): CommunicationLog[] {
    return this.getCommunicationLogs();
  }

  public addCommunicationLog(entry: Omit<CommunicationLog, 'id' | 'timestamp'> & { timestamp?: string }): CommunicationLog {
    const newLog: CommunicationLog = {
      ...entry,
      id: `COMM-${String(this.commLogs.length + 1).padStart(3, '0')}`,
      timestamp: entry.timestamp || new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      status: entry.status || 'Delivered'
    };
    this.commLogs = [newLog, ...this.commLogs];
    this.saveCommLogsLocal();
    this.logAudit('COMMUNICATION_DISPATCHED', 'Communication', newLog.id, newLog.recipientName, `Dispatched ${newLog.channel} (${newLog.type}) to ${newLog.mobile}`);
    this.notify();
    return newLog;
  }

  public deleteCommunicationLog(id: string) {
    this.commLogs = this.commLogs.filter(c => c.id !== id);
    this.saveCommLogsLocal();
    this.notify();
  }

  public updateCustomerAddresses(
    customerId: string,
    residentialAddress: Address,
    permanentAddress: Address,
    sameAsResidential: boolean,
    performedBy: string = 'Postal Staff'
  ): Customer | undefined {
    const cust = this.getCustomerById(customerId);
    if (!cust) return undefined;

    cust.residentialAddress = { ...residentialAddress };
    cust.permanentAddress = sameAsResidential ? { ...residentialAddress } : { ...permanentAddress };
    cust.sameAsResidential = sameAsResidential;
    cust.houseNo = residentialAddress.houseNo || residentialAddress.houseNumber || cust.houseNo;
    cust.street = residentialAddress.street || cust.street;
    cust.landmark = residentialAddress.landmark || cust.landmark;
    cust.sector = residentialAddress.sectorLocality || residentialAddress.sector || cust.sector;
    cust.area = residentialAddress.area || cust.area;
    cust.pincode = residentialAddress.pincode || cust.pincode || '324009';
    cust.address = {
      ...cust.address,
      houseNumber: cust.houseNo,
      houseNo: cust.houseNo,
      street: cust.street,
      landmark: cust.landmark,
      sectorLocality: cust.sector,
      area: cust.area,
      pincode: cust.pincode,
      fullAddress:
        residentialAddress.fullAddress ||
        `${cust.houseNo ? cust.houseNo + ', ' : ''}${cust.street ? cust.street + ', ' : ''}${
          cust.sector ? cust.sector + ', ' : ''
        }${cust.area || 'Keshavpura'}${cust.landmark ? ` (Near ${cust.landmark})` : ''} - ${cust.pincode}`,
    };
    cust.updatedAt = new Date().toISOString();

    this.customers = [...this.customers];
    this.saveCustomersLocal();
    this.persistCustomerToFirestore(cust);
    this.logAudit(
      'ADDRESS_UPDATED',
      'Customer',
      cust.id,
      cust.name,
      `Updated Residential & Permanent Address details by ${performedBy}`
    );
    this.notify();
    return cust;
  }

  public recordCustomerRelocation(
    customerId: string,
    payload: {
      newHouseNo: string;
      newStreet: string;
      newLandmark: string;
      newSectorOrColony: string;
      newPincode: string;
      newBeatNo: string;
      reason: string;
      redirectionActive: boolean;
      recordedBy: string;
      remarks?: string;
    }
  ): Customer | undefined {
    const cust = this.getCustomerById(customerId);
    if (!cust) return undefined;

    const prevHouse = cust.residentialAddress?.houseNo || cust.address?.houseNumber || cust.houseNo || 'N/A';
    const prevStreet = cust.residentialAddress?.street || cust.address?.street || cust.street || '';
    const prevLandmark = cust.residentialAddress?.landmark || cust.address?.landmark || cust.landmark || '';
    const prevSector = cust.residentialAddress?.sectorLocality || cust.sector || cust.area || 'Keshavpura';
    const prevPin = cust.residentialAddress?.pincode || cust.address?.pincode || cust.pincode || '324009';
    const prevBeat = cust.beatNo || '2';

    const prevFullAddress =
      cust.residentialAddress?.fullAddress ||
      cust.address?.fullAddress ||
      `${prevHouse}${prevStreet ? ', ' + prevStreet : ''}, ${prevSector}${
        prevLandmark ? ` (Near ${prevLandmark})` : ''
      } - ${prevPin}`;

    // Preserve original address as permanentAddress if not explicitly set yet
    if (!cust.permanentAddress) {
      cust.permanentAddress = {
        houseNo: prevHouse,
        houseNumber: prevHouse,
        street: prevStreet,
        landmark: prevLandmark,
        sectorLocality: prevSector,
        area: cust.area || prevSector,
        pincode: prevPin,
        fullAddress: prevFullAddress,
      };
      cust.sameAsResidential = false;
    }

    const newFullAddress = `${payload.newHouseNo ? payload.newHouseNo + ', ' : ''}${
      payload.newStreet ? payload.newStreet + ', ' : ''
    }${payload.newSectorOrColony}${
      payload.newLandmark ? ` (Near ${payload.newLandmark})` : ''
    } - ${payload.newPincode || '324009'}`;

    const relocEntry: RelocationRecord = {
      id: `SHF-${Date.now().toString().slice(-6)}`,
      shiftedDate: new Date().toISOString().split('T')[0],
      previousAddress: prevFullAddress,
      previousHouseNo: prevHouse,
      previousStreet: prevStreet,
      previousLandmark: prevLandmark,
      previousBeatNo: prevBeat,
      newAddress: newFullAddress,
      newHouseNo: payload.newHouseNo,
      newStreet: payload.newStreet,
      newLandmark: payload.newLandmark,
      newSectorOrColony: payload.newSectorOrColony,
      newPincode: payload.newPincode || '324009',
      newBeatNo: payload.newBeatNo || prevBeat,
      reason: payload.reason || 'Tenant Shifted',
      redirectionActive: payload.redirectionActive,
      recordedBy: payload.recordedBy || 'Beat Postman',
      remarks: payload.remarks,
    };

    cust.relocationHistory = [relocEntry, ...(cust.relocationHistory || [])];
    cust.isShifted = true;
    cust.sameAsResidential = false;
    cust.houseNo = payload.newHouseNo;
    cust.street = payload.newStreet;
    cust.landmark = payload.newLandmark;
    cust.sector = payload.newSectorOrColony;
    cust.area = payload.newSectorOrColony;
    cust.pincode = payload.newPincode || '324009';
    cust.beatNo = payload.newBeatNo.replace(/^Beat\s*/i, '').trim() || cust.beatNo;

    cust.residentialAddress = {
      houseNo: payload.newHouseNo,
      houseNumber: payload.newHouseNo,
      street: payload.newStreet,
      landmark: payload.newLandmark,
      sectorLocality: payload.newSectorOrColony,
      area: payload.newSectorOrColony,
      pincode: payload.newPincode || '324009',
      fullAddress: newFullAddress,
    };

    cust.address = {
      ...cust.address,
      houseNo: payload.newHouseNo,
      houseNumber: payload.newHouseNo,
      street: payload.newStreet,
      landmark: payload.newLandmark,
      sectorLocality: payload.newSectorOrColony,
      area: payload.newSectorOrColony,
      pincode: payload.newPincode || '324009',
      fullAddress: newFullAddress,
    };

    cust.remarks = `${cust.remarks ? cust.remarks + ' | ' : ''}[Shifted on ${relocEntry.shiftedDate}]: From (${prevFullAddress}) → To (${newFullAddress}), Beat ${cust.beatNo}`;
    cust.updatedAt = new Date().toISOString();

    this.customers = [...this.customers];
    this.saveCustomersLocal();
    this.persistCustomerToFirestore(cust);
    this.logAudit(
      'CUSTOMER_RELOCATED',
      'Customer',
      cust.id,
      cust.name,
      `Relocation logged: ${prevFullAddress} → ${newFullAddress} (Beat ${cust.beatNo})`
    );
    this.notify();
    return cust;
  }

  public dispatchBulkBroadcast(params: {
    beatFilter: string;
    categoryFilter: string;
    channel: 'Broadcast' | 'WhatsApp' | 'SMS';
    campaignTitle: string;
    messageTemplate: string;
    recipients: Customer[];
    dispatchedBy: string;
  }): CommunicationLog[] {
    const createdLogs: CommunicationLog[] = [];
    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });

    // Create summary broadcast entry + individual logs for top recipients
    const summaryLog: CommunicationLog = {
      id: `BCST-${Date.now().toString().slice(-5)}`,
      recipientName: `${params.campaignTitle} (${params.recipients.length} Citizens · ${params.beatFilter === 'All' ? 'All Beats' : `Beat ${params.beatFilter}`})`,
      mobile: `${params.recipients.length} Recipients (${params.categoryFilter})`,
      channel: 'Broadcast',
      type: params.campaignTitle,
      content: params.messageTemplate,
      status: 'Delivered',
      timestamp: nowStr,
      beatNo: params.beatFilter === 'All' ? 'All' : params.beatFilter,
    };

    createdLogs.push(summaryLog);

    params.recipients.slice(0, 12).forEach((cust, i) => {
      const personalized = params.messageTemplate
        .replace(/\{name\}/gi, cust.name)
        .replace(/\{beat\}/gi, cust.beatNo || '2')
        .replace(/\{house\}/gi, cust.houseNo || cust.address?.houseNumber || '');
      createdLogs.push({
        id: `COMM-${Date.now().toString().slice(-4)}-${i + 1}`,
        recipientName: cust.name,
        mobile: cust.whatsapp || cust.mobile || 'N/A',
        channel: params.channel === 'Broadcast' ? 'WhatsApp' : params.channel,
        type: `${params.campaignTitle} [Batch]`,
        content: personalized,
        status: 'Delivered',
        timestamp: nowStr,
        beatNo: cust.beatNo || '2',
        customerId: cust.id,
      });
    });

    this.commLogs = [...createdLogs, ...this.commLogs];
    this.saveCommLogsLocal();
    this.logAudit(
      'BULK_BROADCAST_SENT',
      'Communication',
      summaryLog.id,
      params.campaignTitle,
      `Bulk Broadcast dispatched to ${params.recipients.length} customers (Beat: ${params.beatFilter}, Category: ${params.categoryFilter}) by ${params.dispatchedBy}`
    );
    this.notify();
    return createdLogs;
  }

  private saveCommLogsLocal() {
    try {
      localStorage.setItem(STORAGE_KEY_COMMUNICATIONS, JSON.stringify(this.commLogs));
    } catch (e) {
      console.error('Error saving comm logs', e);
    }
  }
}

export function cleanPhoneNumber(rawMobile: string | undefined | null): string {
  if (!rawMobile) return '';
  // Clean decimal like 9351460069.0 or formatting
  let cleaned = String(rawMobile).trim().replace(/\.0+$/, '').replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    // Already in 91XXXXXXXXXX format
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = '91' + cleaned.substring(1);
  }
  return cleaned;
}

export const customerService = new CustomerService();
