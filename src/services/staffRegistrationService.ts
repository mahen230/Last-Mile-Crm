import { staffPermissionService, getDefaultFixedKmForBeat } from './staffPermissionService';
import { hashPasswordSync } from '../utils/securityUtils';

export interface StaffRegistrationRequest {
  id: string;
  employeeId: string;
  name: string;
  mobile: string;
  email: string;
  designation: string;
  requestedBeat: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface ProfileApprovalRequest {
  id: string;
  employeeId: string;
  staffName: string;
  currentValues: {
    name: string;
    contact: string;
    email: string;
    address?: string;
    emergencyContact?: string;
  };
  proposedValues: {
    name?: string;
    contact?: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    remarks?: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewRemarks?: string;
}

const REG_STORAGE_KEY = 'postman_staff_reg_requests_v1';
const PROFILE_EDIT_STORAGE_KEY = 'postman_profile_edit_requests_v1';

class StaffRegistrationService {
  private registrationRequests: StaffRegistrationRequest[] = [];
  private profileApprovalRequests: ProfileApprovalRequest[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (typeof localStorage !== 'undefined') {
        const regRaw = localStorage.getItem(REG_STORAGE_KEY);
        if (regRaw) this.registrationRequests = JSON.parse(regRaw);

        const editRaw = localStorage.getItem(PROFILE_EDIT_STORAGE_KEY);
        if (editRaw) this.profileApprovalRequests = JSON.parse(editRaw);
      }
    } catch (e) {
      console.warn('Failed to load registration / profile requests:', e);
    }
  }

  private save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(REG_STORAGE_KEY, JSON.stringify(this.registrationRequests));
        localStorage.setItem(PROFILE_EDIT_STORAGE_KEY, JSON.stringify(this.profileApprovalRequests));
      }
    } catch (e) {
      console.warn('Failed to save registration / profile requests:', e);
    }
    this.notify();
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error(err);
      }
    });
  }

  // ================= STAFF REGISTRATION REQUESTS =================

  public getRegistrationRequests(): StaffRegistrationRequest[] {
    return [...this.registrationRequests];
  }

  public getPendingRegistrationCount(): number {
    return this.registrationRequests.filter(r => r.status === 'PENDING').length;
  }

  public getPendingRegistrationsCount(): number {
    return this.getPendingRegistrationCount();
  }

  public getPendingApprovalsCount(): number {
    return this.getPendingProfileApprovalCount();
  }

  public submitRegistrationRequest(data: {
    employeeId: string;
    name: string;
    mobile: string;
    email?: string;
    designation: string;
    requestedBeat?: string;
  }): { success: boolean; message: string; request?: StaffRegistrationRequest } {
    const cleanEmpId = (data.employeeId || '').trim().toUpperCase();
    const cleanMobile = (data.mobile || '').replace(/\D/g, '').slice(-10);

    if (!cleanEmpId || !data.name.trim() || cleanMobile.length !== 10) {
      return { success: false, message: 'Valid Employee ID, Full Name, and 10-digit Mobile number are required.' };
    }

    // Check if employee ID already exists in active profiles
    const existingActive = staffPermissionService.findStaffProfileByIdentifier(cleanEmpId);
    if (existingActive) {
      return { success: false, message: `An active staff account already exists with Employee ID ${cleanEmpId}. Please login directly.` };
    }

    // Check if duplicate pending request
    const existingPending = this.registrationRequests.find(
      r => r.employeeId === cleanEmpId && r.status === 'PENDING'
    );
    if (existingPending) {
      return { success: false, message: `A registration request for Employee ID ${cleanEmpId} is already pending Admin approval.` };
    }

    const req: StaffRegistrationRequest = {
      id: `REG-${Date.now()}-${cleanEmpId}`,
      employeeId: cleanEmpId,
      name: data.name.trim(),
      mobile: cleanMobile,
      email: data.email?.trim() || `${cleanEmpId.toLowerCase()}@indiapost.gov.in`,
      designation: data.designation || 'Postman',
      requestedBeat: data.requestedBeat || 'Beat 2',
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };

    this.registrationRequests.unshift(req);
    this.save();
    return { success: true, message: 'Registration request submitted successfully. Awaiting Admin Ekta Meena approval.', request: req };
  }

  public approveRegistration(requestId: string, adminName: string = 'Ekta Meena'): { success: boolean; message: string } {
    const req = this.registrationRequests.find(r => r.id === requestId);
    if (!req) return { success: false, message: 'Registration request not found.' };

    if (req.status !== 'PENDING') {
      return { success: false, message: `Request is already ${req.status}.` };
    }

    // Check for duplicate account again
    const existing = staffPermissionService.findStaffProfileByIdentifier(req.employeeId);
    if (existing) {
      req.status = 'APPROVED';
      req.reviewedAt = new Date().toISOString();
      req.reviewedBy = adminName;
      this.save();
      return { success: true, message: `Account already existed for ${req.employeeId}. Request marked as Approved.` };
    }

    // Create the active Postman account
    // Initial username = employeeId, initial password = employeeId (hashed), mustChangePassword = true
    const initialHashedPassword = hashPasswordSync(req.employeeId);
    const cleanBeat = req.requestedBeat || 'Beat 2';

    staffPermissionService.registerStaffAccount({
      employeeId: req.employeeId,
      name: req.name,
      contact: req.mobile,
      email: req.email,
      password: initialHashedPassword,
      role: 'POSTMAN',
      designationType: req.designation as any || 'Postman',
      beat: cleanBeat,
      assignedOffice: 'Dadabari S.O. (324009)',
      subOffice: 'Dadabari S.O.',
      officePincode: '324009',
      fixedKm: getDefaultFixedKmForBeat(cleanBeat),
    });

    // Mark mustChangePassword = true on the created profile
    const createdProfile = staffPermissionService.findStaffProfileByIdentifier(req.employeeId);
    if (createdProfile) {
      createdProfile.mustChangePassword = true;
      staffPermissionService.addOrUpdateStaff(createdProfile);
    }

    req.status = 'APPROVED';
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = adminName;
    this.save();

    return { success: true, message: `Staff account ${req.employeeId} (${req.name}) approved and activated with default credentials.` };
  }

  public rejectRegistration(requestId: string, reason: string, adminName: string = 'Ekta Meena'): { success: boolean; message: string } {
    const req = this.registrationRequests.find(r => r.id === requestId);
    if (!req) return { success: false, message: 'Registration request not found.' };

    req.status = 'REJECTED';
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = adminName;
    req.rejectionReason = reason || 'Declined by Administrator';
    this.save();

    return { success: true, message: `Registration request for ${req.employeeId} rejected.` };
  }

  // ================= PROFILE APPROVAL REQUESTS =================

  public getProfileApprovalRequests(): ProfileApprovalRequest[] {
    return [...this.profileApprovalRequests];
  }

  public getPendingProfileApprovalCount(): number {
    return this.profileApprovalRequests.filter(r => r.status === 'PENDING').length;
  }

  public getRequestsForEmployee(employeeId: string): {
    registrations: StaffRegistrationRequest[];
    profileEdits: ProfileApprovalRequest[];
  } {
    const cleanId = employeeId.toUpperCase();
    return {
      registrations: this.registrationRequests.filter(r => r.employeeId === cleanId),
      profileEdits: this.profileApprovalRequests.filter(r => r.employeeId === cleanId),
    };
  }

  public submitProfileChangeRequest(
    employeeId: string,
    currentValues: ProfileApprovalRequest['currentValues'],
    proposedValues: ProfileApprovalRequest['proposedValues']
  ): { success: boolean; message: string; request?: ProfileApprovalRequest } {
    const cleanId = employeeId.toUpperCase();
    const staff = staffPermissionService.findStaffProfileByIdentifier(cleanId);
    if (!staff) {
      return { success: false, message: 'Staff member profile not found.' };
    }

    const req: ProfileApprovalRequest = {
      id: `PROF-REQ-${Date.now()}-${cleanId}`,
      employeeId: cleanId,
      staffName: staff.name,
      currentValues,
      proposedValues,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };

    this.profileApprovalRequests.unshift(req);
    this.save();
    return { success: true, message: 'Profile change request submitted for Admin Ekta Meena review.', request: req };
  }

  public approveProfileChange(requestId: string, adminName: string = 'Ekta Meena'): { success: boolean; message: string } {
    const req = this.profileApprovalRequests.find(r => r.id === requestId);
    if (!req) return { success: false, message: 'Profile request not found.' };

    if (req.status !== 'PENDING') {
      return { success: false, message: `Request is already ${req.status}.` };
    }

    const staff = staffPermissionService.findStaffProfileByIdentifier(req.employeeId);
    if (staff) {
      if (req.proposedValues.name) staff.name = req.proposedValues.name;
      if (req.proposedValues.contact) staff.contact = req.proposedValues.contact;
      if (req.proposedValues.email) staff.email = req.proposedValues.email;
      if (req.proposedValues.address) staff.officeAddress = req.proposedValues.address;
      staffPermissionService.addOrUpdateStaff(staff);
    }

    req.status = 'APPROVED';
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = adminName;
    this.save();

    return { success: true, message: `Profile changes for ${req.staffName} approved and updated.` };
  }

  public rejectProfileChange(requestId: string, remarks: string, adminName: string = 'Ekta Meena'): { success: boolean; message: string } {
    const req = this.profileApprovalRequests.find(r => r.id === requestId);
    if (!req) return { success: false, message: 'Profile request not found.' };

    req.status = 'REJECTED';
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = adminName;
    req.reviewRemarks = remarks || 'Modifications rejected by Administrator.';
    this.save();

    return { success: true, message: `Profile change request for ${req.staffName} rejected.` };
  }
}

export const staffRegistrationService = new StaffRegistrationService();
