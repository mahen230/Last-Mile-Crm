import { UPDATED_STAFF_LIST } from '../data/updatedStaffData';
import { 
  Customer, Lead, FollowUp, Inquiry, SupportTicket, 
  DataConflict, Household, Property, AuditLog, CustomerProductRelation, Staff, CommunicationLog 
} from '../types/models';
import { INITIAL_CUSTOMERS, normalizeMobile } from '../data/initialMasterData';
import { POSTAL_PRODUCTS } from '../data/productsData';
import { staffPermissionService } from './staffPermissionService';
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
  private tasks: any[] = [];
  private commLogs: CommunicationLog[] = [];
  private initialized: boolean = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initData();
  }

  private initData() {
    if (this.initialized) return;

    // 1. Load customers
    const storedCust = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
    if (storedCust) {
      try {
        this.customers = JSON.parse(storedCust);
      } catch (e) {
        this.customers = [...INITIAL_CUSTOMERS];
      }
    } else {
      this.customers = [...INITIAL_CUSTOMERS];
      this.saveCustomersLocal();
    }

    // 2. Load leads
    const storedLeads = localStorage.getItem(STORAGE_KEY_LEADS);
    if (storedLeads) {
      try {
        this.leads = JSON.parse(storedLeads);
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
    const storedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    if (storedTasks) {
      try {
        this.tasks = JSON.parse(storedTasks);
      } catch (e) {
        this.tasks = [];
      }
    } else {
      this.tasks = [
        { id: 'TSK-001', title: 'Collect Sukanya Samriddhi account KYC for Daughter of Mukesh Sen', category: 'KYC Collection', assignedTo: 'Rajesh Sharma (Beat 2 Postman)', beatNo: '2', location: 'KH 222, Keshavpura Sector 6', status: 'In Progress', priority: 'High', dueDate: '2026-08-23' },
        { id: 'TSK-002', title: 'Deliver Printed Passbook & Certificate to Smt. Prem Kanwar', category: 'Passbook Delivery', assignedTo: 'Rajesh Sharma (Beat 2 Postman)', beatNo: '2', location: '445, Keshavpura Sector 7', status: 'Pending', priority: 'Medium', dueDate: '2026-08-23' },
        { id: 'TSK-003', title: 'Perform Doorstep Child CELC Aadhaar Enrolment', category: 'Aadhaar Biometric', assignedTo: 'Dinesh Verma (Beat 6 Postman)', beatNo: '6', location: 'House 120, Keshavpura Sector 4', status: 'Pending', priority: 'High', dueDate: '2026-08-24' },
        { id: 'TSK-004', title: 'Verify Physical Residency for Shifted Tenant Note (Naya Gaon)', category: 'Address Verification', assignedTo: 'Rajesh Sharma (Beat 2 Postman)', beatNo: '2', location: 'Santoshi Nagar, Kota', status: 'Completed', priority: 'Low', dueDate: '2026-08-21' }
      ];
      this.saveTasksLocal();
    }
    
    // 9. Load staff
    this.staff = [...UPDATED_STAFF_LIST];
    this.saveStaffLocal();

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

    this.initialized = true;

    // Run cleanup
    this.cleanupInvalidCustomers();

    // Try background sync with Firestore if online
    this.syncFromFirestore();
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

  private async saveCustomersLocal() {
    await dbService.setAll('customers', this.customers);
  }

  private async saveLeadsLocal() {
    await dbService.setAll('leads', this.leads);
  }

  private async saveFollowupsLocal() {
    await dbService.setAll('followUps', this.followUps);
  }

  private async saveTicketsLocal() {
    await dbService.setAll('tickets', this.tickets);
  }

  private async saveInquiriesLocal() {
    await dbService.setAll('inquiries', this.inquiries);
  }

  private async saveConflictsLocal() {
    await dbService.setAll('conflicts', this.conflicts);
  }

  private async saveAuditLocal() {
    await dbService.setAll('auditLogs', this.auditLogs.slice(0, 200));
  }

  private async saveStaffLocal() {
    await dbService.setAll('staff', this.staff);
  }

  private async saveTasksLocal() {
    await dbService.setAll('tasks', this.tasks);
  }

  public getStaff(): Staff[] {
    return this.staff;
  }

  public getTasks(): any[] {
    return this.tasks;
  }

  public updateTask(taskId: string, updates: any) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      Object.assign(task, updates);
      this.saveTasksLocal();
      this.notify();
    }
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
        stage: 'Follow-up',
        priority: 'High',
        leadScore: 90,
        assignedStaffName: 'Devendra Postman (Beat 2)',
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
        stage: 'Documentation',
        priority: 'Urgent',
        leadScore: 95,
        assignedStaffName: 'Rajesh Sharma (Dadabari SO)',
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
        stage: 'Processing',
        priority: 'Medium',
        leadScore: 80,
        assignedStaffName: 'Ram Kishan Meghwal (Beat 6)',
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
        assignedStaffName: 'Devendra Postman',
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
        assignedStaffName: 'Rajesh Sharma (Dadabari SO)',
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
        assignedStaffName: 'Devendra Postman',
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
      },
      {
        id: 'TKT-003',
        ticketId: 'TKT-2026-003',
        customerName: 'Chetan Porwal (BPM Mandaliya)',
        customerMobile: '9799344952',
        category: 'Aadhaar / CELC',
        subject: 'CELC tablet sync issue & biometric reader calibration',
        description: 'Doorstep child Aadhaar kit showing occasional sync timeout during offline field capture.',
        priority: 'Urgent',
        status: 'Open',
        assignedStaffName: 'System Admin',
        createdAt: '2026-08-22T06:45:00Z',
        updatedAt: '2026-08-22T06:45:00Z'
      }
    ];
  }

  // PUBLIC GETTERS
  public getCustomers(): Customer[] {
    return this.customers;
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

      // Update fields if new non-empty verified values provided
      existing.name = data.name || existing.name;
      existing.whatsapp = data.whatsapp ? normalizeMobile(data.whatsapp) : existing.whatsapp;
      existing.alternateMobile = data.alternateMobile ? normalizeMobile(data.alternateMobile) : existing.alternateMobile;
      existing.email = data.email || existing.email;
      existing.occupation = data.occupation || existing.occupation;
      existing.livingStatus = data.livingStatus || existing.livingStatus;
      existing.householdMembers = data.householdMembers || existing.householdMembers;
      existing.beatNo = data.beatNo || existing.beatNo;
      existing.existingBanking = data.existingBanking || existing.existingBanking;
      existing.financialInterest = data.financialInterest || existing.financialInterest;
      existing.verificationStatus = data.verificationStatus || existing.verificationStatus;
      
      if (data.address) {
        existing.address = {
          houseNumber: data.address.houseNumber || existing.address?.houseNumber || '',
          buildingSociety: data.address.buildingSociety || existing.address?.buildingSociety || '',
          streetColony: data.address.streetColony || existing.address?.streetColony || '',
          sectorLocality: data.address.sectorLocality || existing.address?.sectorLocality || '',
          area: data.address.area || existing.address?.area || '',
          pincode: data.address.pincode || existing.address?.pincode || '324009',
          landmark: data.address.landmark || existing.address?.landmark || '',
          fullAddress: data.address.fullAddress || existing.address?.fullAddress || ''
        };
      }

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
        address: data.address || {
          houseNumber: data.houseNo || '',
          buildingSociety: '',
          streetColony: '',
          sectorLocality: data.sector || 'Keshavpura',
          area: data.area || 'Keshavpura',
          pincode: '324009',
          landmark: '',
          fullAddress: `${data.houseNo || ''}, ${data.sector || ''}, Kota - 324009`
        },
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

  public assignCustomerToStaff(customerId: string, staff: { id?: string; name: string; email: string }) {
    const cust = this.getCustomerById(customerId);
    if (cust) {
      cust.assignedStaffId = staff.id || '';
      cust.assignedStaffName = staff.name;
      cust.assignedStaffEmail = staff.email;
      cust.updatedAt = new Date().toISOString();
      this.saveCustomersLocal();
      this.persistCustomerToFirestore(cust);
      this.logAudit('STAFF_ASSIGNED', 'Customer', cust.id, cust.name, `Assigned to ${staff.name} (${staff.email})`);
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
    const lead = this.leads.find(l => l.id === leadId);
    if (!lead) return undefined;

    const oldStage = lead.stage;
    lead.stage = stage;
    if (notes) lead.notes = `${lead.notes || ''} [${stage}]: ${notes}`;
    lead.updatedAt = new Date().toISOString();

    // If stage is 'Completed' -> automatically attach product to Customer!
    if (stage === 'Completed') {
      const cust = this.getCustomerById(lead.customerId);
      if (cust) {
        const newProduct: CustomerProductRelation = {
          id: `p-${cust.masterId || cust.id}-${lead.productCode.toLowerCase()}`,
          productCode: lead.productCode,
          productName: lead.productName,
          status: 'Active',
          sumAssuredOrBalance: lead.estimatedValue || 0,
          startDate: new Date().toISOString().split('T')[0],
          lastUpdated: new Date().toISOString().split('T')[0],
          remarks: `Converted from Lead ${lead.id}`
        };
        cust.products = [...(cust.products || []), newProduct];
        this.saveCustomersLocal();
        this.logAudit('LEAD_CONVERTED', 'Customer', cust.id, cust.name, `Successfully converted lead ${lead.id} to Active product ${lead.productName}`);
      }
    }

    this.saveLeadsLocal();
    this.logAudit('LEAD_UPDATED', 'Lead', lead.id, lead.customerName, `Lead stage updated from ${oldStage} to ${stage}`);
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
  }): { inquiry: Inquiry; matchedCustomer?: Customer } {
    const norm = normalizeMobile(inquiryData.mobile);
    const existing = this.getCustomerByMobile(norm);

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
        address: {
          houseNumber: '',
          sectorLocality: 'Keshavpura',
          pincode: '324009',
          fullAddress: inquiryData.address || ''
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
      customerAddress: inquiryData.address || (existing?.address?.fullAddress || ''),
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
      const pCode = c.propertyId || `PROP-${c.sector || '7'}-${c.houseNo || 'PLT'}`;
      if (!propMap.has(pCode)) {
        const isShifted = (c.remarks || '').toLowerCase().includes('left') || (c.remarks || '').toLowerCase().includes('moved');
        propMap.set(pCode, {
          id: pCode,
          propertyCode: pCode,
          housePlotNumber: c.houseNo || 'Plot Unit',
          address: c.address?.fullAddress || `${c.houseNo || ''}, Sector ${c.sector || '7'}, Keshavpura, Kota`,
          sector: c.sector || '7',
          area: c.area || 'Keshavpura',
          pincode: '324009',
          beatNo: c.beatNo || '2',
          officeId: c.officeId || 'DADABARI_SO',
          status: isShifted ? 'Address Left' : 'Occupied',
          residentNames: [c.name],
          verificationStatus: true,
          notes: c.remarks
        });
      } else {
        const prop = propMap.get(pCode)!;
        if (!prop.residentNames.includes(c.name)) {
          prop.residentNames.push(c.name);
        }
      }
    });
    return Array.from(propMap.values());
  }

  public updateProperty(property: Property) {
    // Since properties are derived, we need to update the source customers
    property.residentNames.forEach(residentName => {
      const customer = this.customers.find(c => c.name === residentName);
      if (customer) {
        // Update customer details if necessary (e.g. beat, sector)
        customer.beatNo = property.beatNo || customer.beatNo;
        customer.sector = property.sector || customer.sector;
      }
    });
    this.saveCustomersLocal();
    this.notify();
  }

  public resetToInitialData() {
    this.resetToDefaultMasterSource();
  }

  public convertLeadToProduct(leadId: string, accountOrPolicyNo?: string): Lead | undefined {
    return this.updateLeadStage(leadId, 'Completed', `Policy/Account #${accountOrPolicyNo || 'AC-2026-NEW'} active`);
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
