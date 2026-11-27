import {
  CentralLeadSupportTicket,
  CentralLeadServiceCategory,
  CentralLeadSupportChannel,
  CentralTicketStatus,
  KOTA_DIVISION_CENTRAL_CONTACT,
  KOTA_DIVISION_OFFICIAL_PINS,
} from '../types/models';

const STORAGE_KEY_CENTRAL_LEADS = 'kota_division_central_leads_9460062100_v1';

export interface CentralLeadStats {
  totalTickets: number;
  newTickets: number;
  routedTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  byCategory: Record<string, number>;
  byPincode: Record<string, number>;
}

const INITIAL_CENTRAL_TICKETS: CentralLeadSupportTicket[] = [
  {
    id: 'KOTA-9460062100-001',
    centralContactNumber: KOTA_DIVISION_CENTRAL_CONTACT,
    callerName: 'Rajendra Prasad Sharma',
    callerMobile: '9829012345',
    whatsappOptIn: true,
    channel: 'WHATSAPP',
    serviceCategory: 'SPEED_POST',
    serviceTitle: 'Bulk Speed Post Pickup (Nayapura Commercial)',
    pincode: '324001',
    subOffice: 'Kota H.O.',
    beatNo: 'Beat 3',
    colonyOrArea: 'Nayapura',
    specificAddress: 'Shop 14, Main Market, Nayapura, Kota',
    inquiryDetails: 'Requires daily 50 Speed Post article pickups with BNPL credit facility.',
    assignedStaffId: 'STAFF-50457421',
    assignedStaffName: 'Mahendra Kumar Meena',
    assignedRole: 'Postman',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    sourceTag: 'Central 9460062100 Desk',
  },
  {
    id: 'KOTA-9460062100-002',
    centralContactNumber: KOTA_DIVISION_CENTRAL_CONTACT,
    callerName: 'Sunita Bairwa',
    callerMobile: '9414056789',
    whatsappOptIn: true,
    channel: 'VOICE_CALL',
    serviceCategory: 'SAVINGS_SCHEMES',
    serviceTitle: 'Sukanya Samriddhi Yojana (SSY) Doorstep Account',
    pincode: '324009',
    subOffice: 'Dadabari S.O.',
    beatNo: 'Beat 2',
    colonyOrArea: 'Keshavpura',
    specificAddress: 'Sector 6, House 3 & 4, Keshavpura, Kota',
    inquiryDetails: 'Citizen wants to open Sukanya Samriddhi account for 6-year-old daughter. Requested doorstep document collection.',
    assignedStaffId: 'STAFF-50457421',
    assignedStaffName: 'Mahendra Kumar Meena',
    assignedRole: 'Postman',
    priority: 'HIGH',
    status: 'ROUTED',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    sourceTag: 'Central 9460062100 Desk',
  },
  {
    id: 'KOTA-9460062100-003',
    centralContactNumber: KOTA_DIVISION_CENTRAL_CONTACT,
    callerName: 'Dr. Alok Verma',
    callerMobile: '9460012890',
    whatsappOptIn: false,
    channel: 'PORTAL_INQUIRY',
    serviceCategory: 'PLI_RPLI',
    serviceTitle: 'Postal Life Insurance (Santosh Endowment Proposal)',
    pincode: '324005',
    subOffice: 'Vigyan Nagar S.O.',
    beatNo: 'Beat 5',
    colonyOrArea: 'Vigyan Nagar',
    specificAddress: 'Plot 18, Sector B, Vigyan Nagar, Kota',
    inquiryDetails: 'Govt employee inquiry for ₹20 Lakh PLI policy. Needs premium calculation chart.',
    assignedStaffId: 'STAFF-MASTER-EKTA',
    assignedStaffName: 'Ekta Meena',
    assignedRole: 'Project Owner & Developer',
    priority: 'NORMAL',
    status: 'NEW',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    sourceTag: 'Central 9460062100 Desk',
  },
  {
    id: 'KOTA-9460062100-004',
    centralContactNumber: KOTA_DIVISION_CENTRAL_CONTACT,
    callerName: 'Madan Lal Gurjar',
    callerMobile: '8769706002',
    whatsappOptIn: true,
    channel: 'DOORSTEP_REQUEST',
    serviceCategory: 'IPPB_BANKING',
    serviceTitle: 'AePS Biometric Doorstep Cash Withdrawal',
    pincode: '324009',
    subOffice: 'Dadabari S.O.',
    beatNo: 'Beat 2',
    colonyOrArea: 'Keshavpura',
    specificAddress: 'Sector 7, Near Tejaji Mandir, Keshavpura',
    inquiryDetails: 'Senior citizen pensioner unable to walk to post office. Requested ₹5,000 AePS cash withdrawal at doorstep.',
    assignedStaffId: 'STAFF-50457421',
    assignedStaffName: 'Mahendra Kumar Meena',
    assignedRole: 'Postman',
    priority: 'URGENT',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    resolvedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    resolutionNotes: 'Completed AePS cash withdrawal at doorstep by Postman Mahendra Kumar Meena on Beat 2. Micro-ATM receipt handed over.',
    sourceTag: 'Central 9460062100 Desk',
  },
];

class CentralLeadSupportService {
  private tickets: CentralLeadSupportTicket[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadTickets();
  }

  private loadTickets(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CENTRAL_LEADS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.tickets = parsed;
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to parse central lead tickets from localStorage', err);
    }
    this.tickets = [...INITIAL_CENTRAL_TICKETS];
    this.persist();
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY_CENTRAL_LEADS, JSON.stringify(this.tickets));
    } catch (err) {
      console.warn('Failed to save central lead tickets to localStorage', err);
    }
    this.notify();
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error(err);
      }
    });
  }

  public getTickets(filters?: {
    status?: CentralTicketStatus;
    pincode?: string;
    subOffice?: string;
    beatNo?: string;
    category?: CentralLeadServiceCategory;
    search?: string;
  }): CentralLeadSupportTicket[] {
    let list = [...this.tickets];
    if (!filters) return list;

    if (filters.status) {
      list = list.filter((t) => t.status === filters.status);
    }
    if (filters.pincode && filters.pincode !== 'ALL') {
      list = list.filter((t) => t.pincode === filters.pincode);
    }
    if (filters.subOffice && filters.subOffice !== 'ALL') {
      list = list.filter((t) => t.subOffice.toLowerCase().includes(filters.subOffice!.toLowerCase()));
    }
    if (filters.beatNo && filters.beatNo !== 'ALL') {
      list = list.filter((t) => t.beatNo === filters.beatNo);
    }
    if (filters.category) {
      list = list.filter((t) => t.serviceCategory === filters.category);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.callerName.toLowerCase().includes(q) ||
          t.callerMobile.includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.serviceTitle.toLowerCase().includes(q) ||
          (t.colonyOrArea && t.colonyOrArea.toLowerCase().includes(q)) ||
          t.inquiryDetails.toLowerCase().includes(q)
      );
    }

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createTicket(payload: {
    callerName: string;
    callerMobile: string;
    whatsappOptIn?: boolean;
    channel?: CentralLeadSupportChannel;
    serviceCategory: CentralLeadServiceCategory;
    serviceTitle: string;
    pincode?: string;
    subOffice?: string;
    beatNo?: string;
    colonyOrArea?: string;
    specificAddress?: string;
    inquiryDetails: string;
    priority?: 'NORMAL' | 'HIGH' | 'URGENT';
    assignedStaffName?: string;
  }): CentralLeadSupportTicket {
    const now = new Date().toISOString();
    const index = this.tickets.length + 1;
    const pad = String(index).padStart(3, '0');
    const id = `KOTA-${KOTA_DIVISION_CENTRAL_CONTACT}-${pad}`;

    const resolvedPin = payload.pincode || '324009';
    let resolvedSubOffice = payload.subOffice || 'Dadabari S.O.';
    let resolvedBeat = payload.beatNo || 'Beat 2';
    let resolvedStaff = payload.assignedStaffName || 'Mahendra Kumar Meena';
    let resolvedStaffId = 'STAFF-50457421';

    // Auto-routing intelligence for Kota Division
    if (resolvedPin === '324001') {
      resolvedSubOffice = 'Kota H.O.';
      resolvedBeat = payload.beatNo || 'Beat 1';
      resolvedStaff = 'Kota H.O. Staff';
      resolvedStaffId = 'STAFF-KOTA-HO';
    } else if (resolvedPin === '324005') {
      resolvedSubOffice = 'Vigyan Nagar S.O.';
      resolvedBeat = payload.beatNo || 'Beat 4';
      resolvedStaff = 'Vigyan Nagar Staff';
      resolvedStaffId = 'STAFF-VIGYAN';
    } else if (resolvedPin === '324009') {
      resolvedSubOffice = 'Dadabari S.O.';
      resolvedBeat = payload.beatNo || 'Beat 2';
      resolvedStaff = 'Mahendra Kumar Meena';
      resolvedStaffId = 'STAFF-50457421';
    }

    const newTicket: CentralLeadSupportTicket = {
      id,
      centralContactNumber: KOTA_DIVISION_CENTRAL_CONTACT,
      callerName: payload.callerName.trim(),
      callerMobile: payload.callerMobile.trim().replace(/\D/g, ''),
      whatsappOptIn: payload.whatsappOptIn ?? true,
      channel: payload.channel || 'VOICE_CALL',
      serviceCategory: payload.serviceCategory,
      serviceTitle: payload.serviceTitle,
      pincode: resolvedPin,
      subOffice: resolvedSubOffice,
      beatNo: resolvedBeat,
      colonyOrArea: payload.colonyOrArea,
      specificAddress: payload.specificAddress,
      inquiryDetails: payload.inquiryDetails,
      assignedStaffId: resolvedStaffId,
      assignedStaffName: resolvedStaff,
      assignedRole: 'Postman',
      priority: payload.priority || 'NORMAL',
      status: 'NEW',
      createdAt: now,
      updatedAt: now,
      sourceTag: `Central ${KOTA_DIVISION_CENTRAL_CONTACT} Desk`,
    };

    this.tickets.unshift(newTicket);
    this.persist();
    return newTicket;
  }

  public updateTicketStatus(
    id: string,
    status: CentralTicketStatus,
    resolutionNotes?: string
  ): boolean {
    const ticket = this.tickets.find((t) => t.id === id);
    if (!ticket) return false;

    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    if (resolutionNotes) {
      ticket.resolutionNotes = resolutionNotes;
    }
    if (status === 'RESOLVED' || status === 'CLOSED') {
      ticket.resolvedAt = new Date().toISOString();
    }
    this.persist();
    return true;
  }

  public routeTicket(
    id: string,
    target: {
      pincode: string;
      subOffice: string;
      beatNo: string;
      assignedStaffName: string;
      assignedStaffId?: string;
    }
  ): boolean {
    const ticket = this.tickets.find((t) => t.id === id);
    if (!ticket) return false;

    ticket.pincode = target.pincode;
    ticket.subOffice = target.subOffice;
    ticket.beatNo = target.beatNo;
    ticket.assignedStaffName = target.assignedStaffName;
    if (target.assignedStaffId) {
      ticket.assignedStaffId = target.assignedStaffId;
    }
    ticket.status = 'ROUTED';
    ticket.updatedAt = new Date().toISOString();
    this.persist();
    return true;
  }

  public getStats(): CentralLeadStats {
    const stats: CentralLeadStats = {
      totalTickets: this.tickets.length,
      newTickets: 0,
      routedTickets: 0,
      inProgressTickets: 0,
      resolvedTickets: 0,
      byCategory: {},
      byPincode: {},
    };

    this.tickets.forEach((t) => {
      if (t.status === 'NEW') stats.newTickets++;
      else if (t.status === 'ROUTED') stats.routedTickets++;
      else if (t.status === 'IN_PROGRESS') stats.inProgressTickets++;
      else if (t.status === 'RESOLVED' || t.status === 'CLOSED') stats.resolvedTickets++;

      stats.byCategory[t.serviceCategory] = (stats.byCategory[t.serviceCategory] || 0) + 1;
      stats.byPincode[t.pincode] = (stats.byPincode[t.pincode] || 0) + 1;
    });

    return stats;
  }

  public buildWhatsAppMessage(ticket: CentralLeadSupportTicket): string {
    return `नमस्ते ${ticket.callerName} जी,\n\nभारतीय डाक - कोटा मंडल केंद्रीय सहायता केंद्र (${KOTA_DIVISION_CENTRAL_CONTACT}) से संपर्क करने हेतु धन्यवाद।\n\n📌 संदर्भ क्रमांक: *${ticket.id}*\n✨ सेवा: *${ticket.serviceTitle}*\n📍 मंडल क्षेत्र: PIN ${ticket.pincode} (${ticket.subOffice} · ${ticket.beatNo})\n👤 अधिकृत डाककर्मी: ${ticket.assignedStaffName || 'कार्यक्षेत्र बीट स्टाफ'}\n\nआपकी पूछताछ/डोरस्टेप अनुरोध पर आवश्यक कार्यवाही प्रारंभ कर दी गई है।`;
  }

  public exportState(): CentralLeadSupportTicket[] {
    return [...this.tickets];
  }

  public importState(data: CentralLeadSupportTicket[]): void {
    if (Array.isArray(data) && data.length > 0) {
      this.tickets = data;
      this.persist();
    }
  }
}

export const centralLeadSupportService = new CentralLeadSupportService();
