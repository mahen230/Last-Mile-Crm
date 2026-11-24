export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'urgent' | 'success';
  priority?: 'High' | 'Urgent' | 'Normal';
  category: 'FOLLOW_UP' | 'ACADEMY' | 'LEAD' | 'SYSTEM' | 'CIRCULAR' | 'URGENT_BEAT_ALERT' | 'INSPECTION_NOTICE' | 'GENERAL';
  timestamp: string;
  isRead: boolean;
  senderName?: string;
  senderEmail?: string;
  targetBeat?: string;
  readBy?: string[];
  targetPath?: string;
}

const NOTIF_KEY = 'kota_division_os_system_notifications_v1';

class NotificationService {
  private notifications: SystemNotification[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    try {
      const raw = localStorage.getItem(NOTIF_KEY);
      if (raw) {
        this.notifications = JSON.parse(raw);
      } else {
        this.notifications = [
          {
            id: 'NOTIF-01',
            title: 'Overdue Follow-Up Alert',
            message: 'Citizen Ramesh Kumar Follow-up for IPPB Savings Account is due for verification in Dadabari S.O.',
            severity: 'urgent',
            priority: 'Urgent',
            category: 'FOLLOW_UP',
            timestamp: new Date().toISOString(),
            isRead: false,
            senderName: 'System Auditor',
            targetBeat: 'Beat 2',
            readBy: [],
            targetPath: '/follow-ups',
          },
          {
            id: 'NOTIF-02',
            title: 'Mandatory Academy Course Assigned',
            message: 'New Departmental LDCE & Postal Manual Course has been assigned to your profile.',
            severity: 'info',
            priority: 'High',
            category: 'ACADEMY',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            isRead: false,
            senderName: 'Director Postal Services',
            targetBeat: 'ALL',
            readBy: [],
            targetPath: '/india-post-storefront',
          },
          {
            id: 'NOTIF-03',
            title: 'New Lead Captured in Beat 2',
            message: 'Aadhaar Mobile Update lead captured via doorstep survey.',
            severity: 'success',
            priority: 'Normal',
            category: 'LEAD',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            isRead: true,
            senderName: 'Postman Mahendra',
            targetBeat: 'Beat 2',
            readBy: ['STAFF-50457421'],
            targetPath: '/customers',
          },
        ];
        this.saveNotifications(false);
      }
    } catch {
      this.notifications = [];
    }
  }

  private saveNotifications(notify = true): void {
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(this.notifications));
    } catch (e) {
      console.warn('NotificationService persist failed:', e);
    }
    if (notify) {
      this.listeners.forEach((cb) => cb());
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public getAllNotifications(): SystemNotification[] {
    return [...this.notifications];
  }

  public getNotifications(): SystemNotification[] {
    return [...this.notifications];
  }

  public getUnreadCount(staffId?: string): number {
    if (!staffId) {
      return this.notifications.filter((n) => !n.isRead).length;
    }
    return this.notifications.filter(
      (n) => !n.readBy || !n.readBy.some((id) => id.trim().toLowerCase() === staffId.trim().toLowerCase())
    ).length;
  }

  public markAsRead(id: string, staffId?: string): void {
    const item = this.notifications.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
      if (staffId) {
        if (!item.readBy) item.readBy = [];
        if (!item.readBy.some((s) => s.trim().toLowerCase() === staffId.trim().toLowerCase())) {
          item.readBy.push(staffId);
        }
      }
      this.saveNotifications(true);
    }
  }

  public markAllAsRead(staffId?: string): void {
    this.notifications.forEach((n) => {
      n.isRead = true;
      if (staffId) {
        if (!n.readBy) n.readBy = [];
        if (!n.readBy.some((s) => s.trim().toLowerCase() === staffId.trim().toLowerCase())) {
          n.readBy.push(staffId);
        }
      }
    });
    this.saveNotifications(true);
  }

  public deleteNotification(id: string): boolean {
    const len = this.notifications.length;
    this.notifications = this.notifications.filter((n) => n.id !== id);
    if (this.notifications.length !== len) {
      this.saveNotifications(true);
      return true;
    }
    return false;
  }

  public broadcastNotification(input: {
    title: string;
    message: string;
    senderName?: string;
    senderEmail?: string;
    category?: SystemNotification['category'];
    priority?: 'High' | 'Urgent' | 'Normal';
    targetBeat?: string;
    severity?: SystemNotification['severity'];
  }): SystemNotification {
    const notif: SystemNotification = {
      id: `NOTIF-${Date.now().toString().slice(-6)}`,
      title: input.title.trim(),
      message: input.message.trim(),
      severity: input.severity || (input.priority === 'Urgent' ? 'urgent' : 'info'),
      priority: input.priority || 'High',
      category: input.category || 'CIRCULAR',
      timestamp: new Date().toISOString(),
      isRead: false,
      senderName: input.senderName || 'Ekta Meena (Super Admin)',
      senderEmail: input.senderEmail || 'ektamahenmeena@gmail.com',
      targetBeat: input.targetBeat || 'ALL',
      readBy: [],
    };
    this.notifications.unshift(notif);
    this.saveNotifications(true);
    return notif;
  }

  public pushNotification(input: Omit<SystemNotification, 'id' | 'timestamp' | 'isRead'>): SystemNotification {
    const notif: SystemNotification = {
      id: `NOTIF-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      readBy: [],
      ...input,
    };
    this.notifications.unshift(notif);
    this.saveNotifications(true);
    return notif;
  }
}

export const notificationService = new NotificationService();
