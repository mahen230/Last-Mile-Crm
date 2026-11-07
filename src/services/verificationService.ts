import { customerService } from './customerService';
import { staffPermissionService } from './staffPermissionService';
import { Property } from '../types/models';

export interface DailyVerificationTask {
  id: string;
  date: string; // YYYY-MM-DD
  employeeId: string;
  employeeName: string;
  beatNo: string;
  propertyId: string;
  propertyCode: string;
  colony: string;
  sector: string;
  block?: string;
  houseNo: string;
  address: string;
  propertyType: 'House' | 'Flat' | 'Shop' | 'Office' | 'Commercial' | 'Other';
  occupancyStatus: 'Occupied' | 'Vacant' | 'Rented' | 'Commercial' | 'Address Left';
  status: 'Pending' | 'In Progress' | 'Verified' | 'Needs Review';
  verifiedAt?: string;
  latitude?: number;
  longitude?: number;
  gpsCaptured: boolean;
  remarks?: string;
  verifiedByStaffId?: string;
  auditLog?: Array<{
    timestamp: string;
    action: string;
    updatedBy: string;
    details: string;
  }>;
}

const STORAGE_KEY = 'postman_daily_verifications_v1';

class VerificationService {
  private tasks: DailyVerificationTask[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.tasks = parsed.map(t => {
              let addrStr = t.address;
              if (addrStr && typeof addrStr === 'object') {
                addrStr = addrStr.fullAddress || [addrStr.houseNo || addrStr.houseNumber, addrStr.street, addrStr.sectorLocality || addrStr.sector, addrStr.area || addrStr.colony, addrStr.pincode].filter(Boolean).join(', ') || `${t.houseNo || 'Plot'}, Sector ${t.sector || ''}, ${t.colony || 'Dadabari'}`;
              } else if (!addrStr) {
                addrStr = `${t.houseNo || 'Plot'}, Sector ${t.sector || ''}, ${t.colony || 'Dadabari'}`;
              }
              return {
                ...t,
                address: String(addrStr)
              };
            });
          } else {
            this.tasks = [];
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load verification tasks from storage:', e);
      this.tasks = [];
    }
  }

  private saveToStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
      }
    } catch (e) {
      console.warn('Failed to save verification tasks:', e);
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
        console.error('Error in verification listener:', err);
      }
    });
  }

  /**
   * Get or automatically initialize today's 10 property verification tasks for an employee's assigned beat
   */
  public getDailyVerificationTasks(employeeId: string, beatNo: string, targetDate?: string): DailyVerificationTask[] {
    const today = targetDate || new Date().toISOString().split('T')[0];
    const cleanBeat = (beatNo || 'Beat 2').replace(/beat\s*/i, '').trim();

    // Check if tasks already exist for this employee & date
    let existing = this.tasks.filter(
      t => t.employeeId.toUpperCase() === employeeId.toUpperCase() && t.date === today
    );

    if (existing.length >= 10) {
      return existing;
    }

    // Get properties belonging to this beat
    const allProps = customerService.getProperties();
    const beatProps = allProps.filter(p => {
      const pBeat = (p.beatNo || '2').replace(/beat\s*/i, '').trim();
      return pBeat === cleanBeat || p.beatNo === beatNo;
    });

    // Find recently verified property IDs (within 30 days) to avoid duplicate assignments
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const recentlyVerifiedIds = new Set(
      this.tasks
        .filter(t => t.status === 'Verified' && t.verifiedAt && t.verifiedAt >= thirtyDaysAgo)
        .map(t => t.propertyId)
    );

    // Prioritize properties:
    // 1. Unverified properties not verified recently
    // 2. Properties not yet assigned today
    const assignedPropIds = new Set(existing.map(t => t.propertyId));
    const eligibleProps = beatProps.filter(p => !assignedPropIds.has(p.id) && !recentlyVerifiedIds.has(p.id));
    const fallbackProps = beatProps.filter(p => !assignedPropIds.has(p.id));

    const pool = eligibleProps.length >= (10 - existing.length) ? eligibleProps : fallbackProps;
    const staff = staffPermissionService.findStaffProfileByIdentifier(employeeId);
    const staffName = staff?.name || 'Assigned Postman';

    const needed = 10 - existing.length;
    const toAssign = pool.slice(0, needed);

    const newTasks: DailyVerificationTask[] = toAssign.map((p, idx) => {
      const addrStr = typeof p.address === 'string' ? p.address : (p.address as any)?.fullAddress || `${p.housePlotNumber || ''}, Sector ${p.sector || ''}, ${p.colony || ''}`;
      return {
        id: `VERIF-${today}-${employeeId}-${existing.length + idx + 1}`,
        date: today,
        employeeId: employeeId.toUpperCase(),
        employeeName: staffName,
        beatNo: beatNo || `Beat ${cleanBeat}`,
        propertyId: p.id,
        propertyCode: p.propertyCode || p.id,
        colony: p.colony || p.area || 'Dadabari',
        sector: p.sector || '7',
        block: (p as any).block || '',
        houseNo: p.housePlotNumber || p.houseNo || 'N/A',
        address: addrStr,
        propertyType: (p.propertyType as any) || 'House',
        occupancyStatus: p.status === 'Commercial' ? 'Commercial' : p.status === 'Rented' ? 'Rented' : p.status === 'Vacant' ? 'Vacant' : 'Occupied',
        status: 'Pending',
        gpsCaptured: false,
      };
    });

    if (newTasks.length > 0) {
      this.tasks.push(...newTasks);
      this.saveToStorage();
      existing = [...existing, ...newTasks];
    }

    return existing;
  }

  /**
   * Submit or update a verification task result
   */
  public submitVerification(
    taskId: string,
    updates: {
      status: 'Verified' | 'Needs Review' | 'In Progress';
      occupancyStatus?: DailyVerificationTask['occupancyStatus'];
      propertyType?: DailyVerificationTask['propertyType'];
      houseNo?: string;
      remarks?: string;
      latitude?: number;
      longitude?: number;
      gpsCaptured?: boolean;
    }
  ): { success: boolean; task?: DailyVerificationTask } {
    const idx = this.tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return { success: false };

    const task = this.tasks[idx];
    const now = new Date().toISOString();

    task.status = updates.status;
    if (updates.occupancyStatus) task.occupancyStatus = updates.occupancyStatus;
    if (updates.propertyType) task.propertyType = updates.propertyType;
    if (updates.houseNo) task.houseNo = updates.houseNo;
    if (updates.remarks !== undefined) task.remarks = updates.remarks;
    if (updates.latitude !== undefined) task.latitude = updates.latitude;
    if (updates.longitude !== undefined) task.longitude = updates.longitude;
    if (updates.gpsCaptured !== undefined) task.gpsCaptured = updates.gpsCaptured;
    task.verifiedAt = now;

    this.saveToStorage();

    // Sync back to Property record in customerService
    try {
      const allProps = customerService.getProperties();
      const matchedProp = allProps.find(p => p.id === task.propertyId || p.propertyCode === task.propertyCode);
      if (matchedProp) {
        matchedProp.status = task.occupancyStatus;
        matchedProp.verificationStatus = task.status === 'Verified';
        matchedProp.addressRemarks = task.remarks || `Verified on ${task.date} by ${task.employeeName}`;
        if (task.latitude && task.longitude) {
          matchedProp.latitude = task.latitude;
          matchedProp.longitude = task.longitude;
        }
      }
    } catch (e) {
      console.warn('Failed to sync verified property state:', e);
    }

    return { success: true, task };
  }

  /**
   * Protected partial update (patch/merge) for a verification task.
   * Strictly preserves historical creation metadata, property link, and previous audit history.
   * Never overwrites or wipes out master verification logs.
   */
  public patchVerificationTask(
    taskId: string,
    patch: Partial<DailyVerificationTask>,
    auditUser?: { name: string; employeeId?: string; role?: string }
  ): { success: boolean; task?: DailyVerificationTask } {
    const idx = this.tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return { success: false };

    const existing = this.tasks[idx];
    const now = new Date().toISOString();
    const updater = auditUser?.name || 'Staff User';

    // Track changes for audit trail
    const modifiedKeys = Object.keys(patch).filter(k => k !== 'auditLog' && k !== 'id' && (patch as any)[k] !== (existing as any)[k]);
    const auditEntry = {
      timestamp: now,
      action: 'PROTECTED_PATCH_UPDATE',
      updatedBy: `${updater} (${auditUser?.employeeId || 'ID-N/A'})`,
      details: modifiedKeys.length > 0 ? `Fields updated: ${modifiedKeys.join(', ')}` : 'Re-verified record',
    };

    // Deep merge preserving core identifiers
    const updatedTask: DailyVerificationTask = {
      ...existing,
      ...patch,
      id: existing.id,
      date: existing.date,
      propertyId: existing.propertyId,
      propertyCode: existing.propertyCode,
      employeeId: existing.employeeId,
      beatNo: existing.beatNo,
      verifiedAt: patch.status === 'Verified' ? (patch.verifiedAt || existing.verifiedAt || now) : existing.verifiedAt,
      auditLog: [...(existing.auditLog || []), auditEntry],
    };

    this.tasks[idx] = updatedTask;
    this.saveToStorage();

    // Sync back to Property record in customerService without replacing other property data
    try {
      const allProps = customerService.getProperties();
      const matchedProp = allProps.find(p => p.id === updatedTask.propertyId || p.propertyCode === updatedTask.propertyCode);
      if (matchedProp) {
        if (updatedTask.occupancyStatus) matchedProp.status = updatedTask.occupancyStatus;
        if (updatedTask.status) matchedProp.verificationStatus = updatedTask.status === 'Verified';
        if (updatedTask.remarks) matchedProp.addressRemarks = updatedTask.remarks;
        if (updatedTask.latitude && updatedTask.longitude) {
          matchedProp.latitude = updatedTask.latitude;
          matchedProp.longitude = updatedTask.longitude;
        }
      }
    } catch (e) {
      console.warn('Failed to sync verified property state on patch:', e);
    }

    return { success: true, task: updatedTask };
  }

  /**
   * Admin verification metrics and performance summary
   */
  public getAdminVerificationSummary(targetDate?: string) {
    const today = targetDate || new Date().toISOString().split('T')[0];
    const todayTasks = this.tasks.filter(t => t.date === today);

    const totalAssigned = todayTasks.length;
    const completed = todayTasks.filter(t => t.status === 'Verified').length;
    const pending = todayTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
    const needsReview = todayTasks.filter(t => t.status === 'Needs Review').length;

    // Beat-wise breakdown
    const beatMap = new Map<string, { completed: number; target: number }>();
    todayTasks.forEach(t => {
      const b = t.beatNo || 'Beat 2';
      const curr = beatMap.get(b) || { completed: 0, target: 0 };
      curr.target += 1;
      if (t.status === 'Verified') curr.completed += 1;
      beatMap.set(b, curr);
    });

    const beatPerformance = Array.from(beatMap.entries()).map(([beat, stats]) => ({
      beat,
      completed: stats.completed,
      target: stats.target,
      percentage: stats.target > 0 ? Math.round((stats.completed / stats.target) * 100) : 0,
    }));

    // Employee-wise breakdown
    const empMap = new Map<string, { name: string; beat: string; completed: number; target: number }>();
    todayTasks.forEach(t => {
      const key = t.employeeId;
      const curr = empMap.get(key) || { name: t.employeeName, beat: t.beatNo, completed: 0, target: 0 };
      curr.target += 1;
      if (t.status === 'Verified') curr.completed += 1;
      empMap.set(key, curr);
    });

    const employeePerformance = Array.from(empMap.entries()).map(([employeeId, stats]) => ({
      employeeId,
      name: stats.name,
      beat: stats.beat,
      completed: stats.completed,
      target: stats.target,
      percentage: stats.target > 0 ? Math.round((stats.completed / stats.target) * 100) : 0,
    }));

    return {
      date: today,
      totalAssigned,
      completed,
      pending,
      needsReview,
      completionRate: totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0,
      beatPerformance,
      employeePerformance,
      allTodayTasks: todayTasks,
    };
  }

  /**
   * Quick daily summary for a postman's 10-property verification
   */
  public getDailySummary(employeeId: string, beatNo: string, targetDate?: string) {
    const tasks = this.getDailyVerificationTasks(employeeId, beatNo, targetDate);
    const completedToday = tasks.filter(t => t.status === 'Verified').length;
    const targetDaily = 10;
    const remainingToday = Math.max(0, targetDaily - completedToday);
    const progressPct = Math.min(100, Math.round((completedToday / targetDaily) * 100));
    return {
      completedToday,
      targetDaily,
      remainingToday,
      progressPct,
      isCompleted: completedToday >= targetDaily,
      tasks,
    };
  }

  /**
   * System-wide verification stats for admin dashboard
   */
  public getStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = this.tasks.filter(t => t.date === today);
    const totalVerifiedToday = todayTasks.filter(t => t.status === 'Verified').length;
    const totalPropertiesInPool = customerService.getProperties().length;
    return {
      totalVerifiedToday,
      totalAssignedToday: todayTasks.length,
      totalPropertiesInPool,
      allTimeVerified: this.tasks.filter(t => t.status === 'Verified').length,
    };
  }
}

export const verificationService = new VerificationService();
