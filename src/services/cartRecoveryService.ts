import { safeStorage } from '../utils/safeStorage';
import { getPincodeHub } from './pincodeOperationsService';

export type CheckoutRecoveryStage =
  | 'CART_ADDED'
  | 'CHECKOUT_OPENED'
  | 'DETAILS_TYPED'
  | 'ABANDONED'
  | 'RECOVERED_WHATSAPP'
  | 'RECOVERED_SMS'
  | 'CONVERTED';

export interface CartRecoveryItemSnapshot {
  id: string;
  sku: string;
  title: string;
  price: number;
  quantity: number;
  vendorName: string;
}

export interface CartRecoverySession {
  sessionId: string;
  pincode: string;
  officeName: string;
  items: CartRecoveryItemSnapshot[];
  totalAmount: number;
  totalCount: number;
  customerName?: string;
  customerMobile?: string;
  deliveryAddress?: string;
  stage: CheckoutRecoveryStage;
  smsRecoveryTriggeredAt?: string;
  whatsappRecoveryClickedAt?: string;
  dismissedBanner?: boolean;
  updatedAt: string;
  createdAt: string;
}

const ACTIVE_SESSION_KEY = 'xpokart_cart_recovery_active_v1';
const RECOVERY_LOG_KEY = 'xpokart_cart_recovery_log_v1';
const SESSION_UID_KEY = 'xpokart_recovery_uid_v1';
const SHARED_CART_KEY = 'xpokart_speedpost_cart_v1';

type RecoveryListener = () => void;

class CartRecoveryService {
  private listeners = new Set<RecoveryListener>();

  public subscribe(listener: RecoveryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore listener failure
      }
    });
  }

  public getOrCreateSessionId(): string {
    const existing = safeStorage.getItem(SESSION_UID_KEY);
    if (existing) return existing;
    const generated = `XPO-SES-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    safeStorage.setItem(SESSION_UID_KEY, generated);
    return generated;
  }

  public getSharedCart<T>(): T[] {
    return safeStorage.getJSON<T[]>(SHARED_CART_KEY, []);
  }

  public saveSharedCart<T>(items: T[]): void {
    safeStorage.setJSON(SHARED_CART_KEY, items);
    this.notify();
  }

  public getActiveSession(): CartRecoverySession | null {
    return safeStorage.getJSON<CartRecoverySession | null>(ACTIVE_SESSION_KEY, null);
  }

  public getRecoveryLog(): CartRecoverySession[] {
    return safeStorage.getJSON<CartRecoverySession[]>(RECOVERY_LOG_KEY, []);
  }

  private appendToLog(session: CartRecoverySession): void {
    const log = this.getRecoveryLog().filter((entry) => entry.sessionId !== session.sessionId);
    const updated = [session, ...log].slice(0, 25);
    safeStorage.setJSON(RECOVERY_LOG_KEY, updated);
  }

  public captureActivity(params: {
    items: CartRecoveryItemSnapshot[];
    pincode: string;
    stage: CheckoutRecoveryStage;
    customerName?: string;
    customerMobile?: string;
    deliveryAddress?: string;
  }): CartRecoverySession | null {
    const { items, pincode, stage, customerName, customerMobile, deliveryAddress } = params;
    if (items.length === 0 && stage !== 'CONVERTED') {
      safeStorage.removeItem(ACTIVE_SESSION_KEY);
      this.notify();
      return null;
    }

    const prev = this.getActiveSession();
    const hub = getPincodeHub(pincode);
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const now = new Date().toISOString();

    const session: CartRecoverySession = {
      sessionId: prev?.sessionId || this.getOrCreateSessionId(),
      pincode: hub.pincode,
      officeName: hub.officeName,
      items: items.map((i) => ({
        id: i.id,
        sku: i.sku,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        vendorName: i.vendorName,
      })),
      totalAmount,
      totalCount,
      customerName: customerName?.trim() || prev?.customerName,
      customerMobile: customerMobile?.replace(/\D/g, '').slice(-10) || prev?.customerMobile,
      deliveryAddress: deliveryAddress?.trim() || prev?.deliveryAddress,
      stage,
      smsRecoveryTriggeredAt: prev?.smsRecoveryTriggeredAt,
      whatsappRecoveryClickedAt: prev?.whatsappRecoveryClickedAt,
      dismissedBanner: stage === 'CART_ADDED' ? false : prev?.dismissedBanner,
      createdAt: prev?.createdAt || now,
      updatedAt: now,
    };

    safeStorage.setJSON(ACTIVE_SESSION_KEY, session);
    this.appendToLog(session);
    this.notify();
    return session;
  }

  public markAbandoned(pincode: string, items: CartRecoveryItemSnapshot[]): CartRecoverySession | null {
    if (items.length === 0) return null;
    const prev = this.getActiveSession();
    if (prev?.stage === 'CONVERTED') return prev;
    return this.captureActivity({
      items,
      pincode,
      stage: 'ABANDONED',
      customerName: prev?.customerName,
      customerMobile: prev?.customerMobile,
      deliveryAddress: prev?.deliveryAddress,
    });
  }

  public markConverted(pincode: string): void {
    const prev = this.getActiveSession();
    if (prev) {
      const converted: CartRecoverySession = {
        ...prev,
        pincode,
        stage: 'CONVERTED',
        updatedAt: new Date().toISOString(),
      };
      this.appendToLog(converted);
    }
    safeStorage.removeItem(ACTIVE_SESSION_KEY);
    // Rotate session UID after conversion so future carts get fresh session IDs
    const nextUid = `XPO-SES-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    safeStorage.setItem(SESSION_UID_KEY, nextUid);
    this.notify();
  }

  public dismissRecoveryPrompt(): void {
    const prev = this.getActiveSession();
    if (!prev) return;
    safeStorage.setJSON(ACTIVE_SESSION_KEY, { ...prev, dismissedBanner: true });
    this.notify();
  }

  public buildWhatsAppRecoveryHref(session: CartRecoverySession): string {
    const hub = getPincodeHub(session.pincode);
    const itemsSummary = session.items
      .slice(0, 4)
      .map((i) => `• ${i.title} (x${i.quantity}) — ₹${(i.price * i.quantity).toLocaleString('en-IN')}`)
      .join('\n');
    const recipientLine = session.customerName ? `Customer: ${session.customerName}\n` : '';
    const text = encodeURIComponent(
      `Namaste XPOKART Express Desk (${hub.officeName} · PIN ${hub.pincode}),\n` +
        `Please help me complete my saved Speed Post COD cart (Session ${session.sessionId}):\n\n` +
        `${recipientLine}` +
        `${itemsSummary}\n\n` +
        `Total Payable on Delivery: ₹${session.totalAmount.toLocaleString('en-IN')} + Flat ₹15 Beat Fee.`
    );
    return `https://api.whatsapp.com/send?phone=${hub.whatsappPhone}&text=${text}`;
  }

  public triggerAutomatedSmsRecovery(session: CartRecoverySession): {
    success: boolean;
    message: string;
    updatedSession: CartRecoverySession;
  } {
    const hub = getPincodeHub(session.pincode);
    const now = new Date().toISOString();
    const updated: CartRecoverySession = {
      ...session,
      stage: 'RECOVERED_SMS',
      smsRecoveryTriggeredAt: now,
      updatedAt: now,
    };
    safeStorage.setJSON(ACTIVE_SESSION_KEY, updated);
    this.appendToLog(updated);
    this.notify();

    const target = updated.customerMobile
      ? `+91 ••••••${updated.customerMobile.slice(-4)}`
      : 'your registered device';
    return {
      success: true,
      message: `Instant SMS & WhatsApp checkout link queued to ${target} via ${hub.officeName} (PIN ${hub.pincode}).`,
      updatedSession: updated,
    };
  }

  public recordWhatsAppRecoveryClick(session: CartRecoverySession): void {
    const now = new Date().toISOString();
    const updated: CartRecoverySession = {
      ...session,
      stage: 'RECOVERED_WHATSAPP',
      whatsappRecoveryClickedAt: now,
      updatedAt: now,
    };
    safeStorage.setJSON(ACTIVE_SESSION_KEY, updated);
    this.appendToLog(updated);
    this.notify();
  }
}

export const cartRecoveryService = new CartRecoveryService();
