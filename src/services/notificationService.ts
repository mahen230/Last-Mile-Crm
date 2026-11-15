/**
 * Admin Push Notification Service for Xpeedo Last Mile (India Post Field Operations OS)
 * Manages broadcasts, circulars, urgent beat alerts, and inspection notices for Dadabari S.O. staff.
 */

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  senderName: string;
  senderEmail: string;
  category: 'CIRCULAR' | 'URGENT_BEAT_ALERT' | 'INSPECTION_NOTICE' | 'GENERAL';
  targetBeat?: string; // 'ALL' or specific beat like 'Beat 1'
  timestamp: string;
  readBy: string[]; // array of staff employee IDs or emails who have read this
  priority: 'High' | 'Normal' | 'Urgent';
}

const STORAGE_KEY = 'xpeedo_system_notifications_v1';

class NotificationService {
  private notifications: SystemNotification[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
    if (this.notifications.length === 0) {
      this.seedInitialNotifications();
    }
  }

  private loadFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            this.notifications = parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load notifications from storage:', e);
      this.notifications = [];
    }
  }

  private saveToStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
      }
    } catch (e) {
      console.warn('Failed to save notifications to storage:', e);
    }
    this.notify();
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Notification listener error:', err);
      }
    });
  }

  private seedInitialNotifications() {
    const now = new Date().toISOString();
    this.notifications = [
      {
        id: 'NOTIF-001',
        title: 'Monthly Fuel & DSS Reconciliation Deadline',
        message: 'All postmen must lock their October 2026 Monthly Fuel Bill and Daily Article Delivery logs by 5 PM today for SPM counter-signature.',
        senderName: 'Ekta Meena (Super Admin)',
        senderEmail: 'ektamahenmeena@gmail.com',
        category: 'CIRCULAR',
        targetBeat: 'ALL',
        timestamp: now,
        readBy: [],
        priority: 'High',
      },
      {
        id: 'NOTIF-002',
        title: 'Inspection Notice: Dadabari S.O. Beat 1 to 5',
        message: 'Inspector Postal (Dadabari Sub-Division) will conduct unannounced doorstep delivery audits across Beat 1 through Beat 5 tomorrow morning.',
        senderName: 'Inspection Unit Dadabari',
        senderEmail: 'inspector.dadabari@indiapost.gov.in',
        category: 'INSPECTION_NOTICE',
        targetBeat: 'ALL',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        readBy: [],
        priority: 'Urgent',
      },
    ];
    this.saveToStorage();
  }

  public getNotifications(): SystemNotification[] {
    return [...this.notifications];
  }

  public getUnreadCount(staffIdentifier: string): number {
    const cleanId = (staffIdentifier || '').trim().toLowerCase();
    return this.notifications.filter(
      (n) => !n.readBy.some((id) => id.trim().toLowerCase() === cleanId)
    ).length;
  }

  public markAsRead(notificationId: string, staffIdentifier: string) {
    const cleanId = (staffIdentifier || '').trim().toLowerCase();
    const notif = this.notifications.find((n) => n.id === notificationId);
    if (notif && !notif.readBy.some((id) => id.trim().toLowerCase() === cleanId)) {
      notif.readBy.push(staffIdentifier);
      this.saveToStorage();
    }
  }

  public markAllAsRead(staffIdentifier: string) {
    let changed = false;
    const cleanId = (staffIdentifier || '').trim().toLowerCase();
    this.notifications.forEach((n) => {
      if (!n.readBy.some((id) => id.trim().toLowerCase() === cleanId)) {
        n.readBy.push(staffIdentifier);
        changed = true;
      }
    });
    if (changed) {
      this.saveToStorage();
    }
  }

  public broadcastNotification(data: {
    title: string;
    message: string;
    senderName: string;
    senderEmail: string;
    category: SystemNotification['category'];
    targetBeat?: string;
    priority: SystemNotification['priority'];
  }): SystemNotification {
    const newNotif: SystemNotification = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      title: data.title,
      message: data.message,
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      category: data.category,
      targetBeat: data.targetBeat || 'ALL',
      timestamp: new Date().toISOString(),
      readBy: [],
      priority: data.priority,
    };
    this.notifications.unshift(newNotif);
    this.saveToStorage();
    return newNotif;
  }

  public deleteNotification(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.saveToStorage();
  }
}

export const notificationService = new NotificationService();
