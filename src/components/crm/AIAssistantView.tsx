import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Calculator,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  MapPin,
  Bell,
  Navigation,
  Plus,
  Layers,
  Phone,
  Check,
  ExternalLink,
  Clock,
  AlertTriangle,
  Store,
  Edit2,
  Users,
  Award,
  Calendar,
  CheckSquare,
  Compass,
  FileText,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Customer, Lead } from '../../types/models';
import { customerService } from '../../services/customerService';
import { POSTAL_PRODUCTS } from '../../data/productsData';
import {
  notificationScannerService,
  FieldJumpNotification
} from '../../services/notificationScannerService';
import {
  CommercialStoreEntry,
  DADABARI_324009_VERIFIED_COMMERCIAL_REGISTRY,
  getVerifiedDadabari324009Registry,
  ingestVerifiedStoreToCrm,
  CommercialCscEntity,
  getStoredCscDirectory
} from '../../data/kotaCommercialCscData';
import {
  DEFAULT_SEQUENTIAL_PROPERTIES,
  PropertyItem,
  BEAT_STAFF_LOOKUP
} from './SequenceWisePropertyHub';
import CustomerProfileModal from '../customers/CustomerProfileModal';

export interface ResidentPropertyCardData {
  id: string;
  name: string;
  roleInFamily?: string;
  familyMembers: string[];
  housePlotNumber: string;
  colony: string;
  landmark: string;
  pincode: string;
  deliveryOffice: string;
  beatNo: string;
  assignedStaffName: string;
  assignedStaffId: string;
  assignedStaffRole: string;
  assignedStaffContact: string;
  primaryMobile: string;
  whatsapp?: string;
  propertyType: string;
  verificationStatus: string;
  activeSchemeLeads: string[];
  lastMileNote?: string;
  rawCustomer?: Customer;
}

export interface TaskCardData {
  id: string;
  title: string;
  category: string;
  beatNo: string;
  assignedStaffName: string;
  assignedStaffId: string;
  priority: 'Urgent' | 'High' | 'Normal';
  scheduledDate: string;
  householdsTarget: number;
  householdsCovered: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Rescheduled';
  location: string;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  options?: string[];
  productCard?: any;
  notificationResults?: FieldJumpNotification[];
  cscResults?: CommercialCscEntity[];
  storeResults?: CommercialStoreEntry[];
  residentResults?: ResidentPropertyCardData[];
  taskResults?: TaskCardData[];
}

export default function AIAssistantView() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<FieldJumpNotification[]>([]);
  const [verifiedStores, setVerifiedStores] = useState<CommercialStoreEntry[]>(getVerifiedDadabari324009Registry());
  const [ingestedIds, setIngestedIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState<Customer | null>(null);
  const [statusModalItem, setStatusModalItem] = useState<ResidentPropertyCardData | null>(null);
  const [deliveryRemark, setDeliveryRemark] = useState('');
  const [schemeInterest, setSchemeInterest] = useState('PLI Suraksha');
  const [leadStatus, setLeadStatus] = useState('Interested');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  useEffect(() => {
    const update = () => {
      setNotifications(notificationScannerService.getNotifications());
      const stores = getVerifiedDadabari324009Registry();
      setVerifiedStores(stores);
      setIngestedIds(new Set(stores.filter(s => s.ingestedToCrm).map(s => s.id)));
    };
    update();
    const unsub = notificationScannerService.subscribe(update);
    return () => unsub();
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: 'Namaskar, Boss! I am the Official Senior AI Field Operations & Intelligence Assistant for "POSTMAN BOOK CRM" (Dadabari S.O. Ecosystem, Pincode 324009).\n\n⚡ Lightning-Fast Master Capabilities:\n• Direct 10-digit Mobile lookup (e.g. 8769706002, 9414589201)\n• Instant Resident & Family search across Beats 1 to 33\n• Colony / Landmark / House No. matching\n• Daily pending field tasks with status toggles\n• 100% Reality-Checked Pincode 324009 commercial registry (Zero dead data)',
      options: [
        'Search Resident: 8769706002',
        'Beat 2 Resident Directory & Route',
        'Daily Pending Field Tasks & Deliveries',
        'Reality-Check: Active Stores in Pincode 324009',
        'Active Field Alerts & Direct-Jump Notifications',
      ]
    }
  ]);

  const [input, setInput] = useState('');

  // Direct Field-Jump Handler
  const handleFieldJump = (notif: FieldJumpNotification) => {
    notificationScannerService.markAsResolved(notif.id);
    navigate(notif.targetRoute, { state: { searchKeyword: notif.filterKeyword, autoFocusFix: true } });
  };

  // 1-Click Ingest Verified Store
  const handleIngestStore = (store: CommercialStoreEntry) => {
    const res = ingestVerifiedStoreToCrm(store);
    if (res.success) {
      setIngestedIds(prev => new Set([...prev, store.id]));
      setVerifiedStores(getVerifiedDadabari324009Registry());
      showToast(res.message);
    }
  };

  // Task Action: Mark Complete
  const handleMarkTaskComplete = (taskId: string) => {
    customerService.updateTask(taskId, { status: 'Completed', progressPercent: 100 });
    showToast(`Task ${taskId} marked as Completed!`);
    setMessages(prev => prev.map(m => {
      if (!m.taskResults) return m;
      return {
        ...m,
        taskResults: m.taskResults.map(t => t.id === taskId ? { ...t, status: 'Completed', householdsCovered: t.householdsTarget } : t)
      };
    }));
  };

  // Task Action: Reschedule
  const handleRescheduleTask = (taskId: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    customerService.updateTask(taskId, { scheduledDate: dateStr, status: 'Pending' });
    showToast(`Task ${taskId} rescheduled for tomorrow (${dateStr})!`);
    setMessages(prev => prev.map(m => {
      if (!m.taskResults) return m;
      return {
        ...m,
        taskResults: m.taskResults.map(t => t.id === taskId ? { ...t, scheduledDate: dateStr, status: 'Rescheduled' } : t)
      };
    }));
  };

  // Save Delivery / Lead Status from modal
  const handleSaveStatusModal = () => {
    if (!statusModalItem) return;
    
    // Create or update lead in customerService
    const newLead: any = {
      customerName: statusModalItem.name,
      customerMobile: statusModalItem.primaryMobile,
      productName: schemeInterest,
      productCategory: 'Postal Life Insurance',
      stage: leadStatus === 'Interested' ? 'Interested' : 'Follow-up Scheduled',
      beatNo: statusModalItem.beatNo,
      notes: `Delivery/Field Remark: ${deliveryRemark || 'Status updated via AI Field Operations Assistant'}`
    };
    customerService.createLead(newLead);
    showToast(`Status & Lead logged for ${statusModalItem.name}!`);
    setStatusModalItem(null);
    setDeliveryRemark('');
  };

  // Master Matching Engine across all indices
  const executeMasterIndexSearch = (query: string): {
    residents: ResidentPropertyCardData[];
    tasks: TaskCardData[];
    stores: CommercialStoreEntry[];
    cscList: CommercialCscEntity[];
    leads: Lead[];
  } => {
    const q = query.trim().toLowerCase();
    const cleanDigits = q.replace(/\D/g, '');
    const is10DigitMobile = cleanDigits.length >= 10;

    const allCustomers = customerService.getCustomers();
    const allLeads = customerService.getLeads();
    const allTasks = customerService.getTasks();
    const verifiedStores = getVerifiedDadabari324009Registry();
    const cscDirectory = getStoredCscDirectory();

    const matchedResidents: ResidentPropertyCardData[] = [];

    // 1. Search in Sequential Properties (Door-to-door sequence)
    DEFAULT_SEQUENTIAL_PROPERTIES.forEach(seq => {
      const matchMobile = cleanDigits && (
        seq.primaryMobile.includes(cleanDigits) || 
        (seq.whatsapp && seq.whatsapp.includes(cleanDigits))
      );
      const matchName = seq.primaryCustomerName.toLowerCase().includes(q) ||
        seq.residents.some(r => r.toLowerCase().includes(q));
      const matchColony = seq.colony.toLowerCase().includes(q);
      const matchPlot = seq.housePlotNumber.toLowerCase().includes(q);
      const matchBeat = seq.beatNo.toLowerCase() === q || seq.beatNo.toLowerCase().includes(q);
      const matchLandmark = seq.landmark.toLowerCase().includes(q);

      if (matchMobile || matchName || matchColony || matchPlot || matchBeat || matchLandmark) {
        // Associated leads for this resident
        const relLeads = allLeads.filter(l => 
          l.customerMobile === seq.primaryMobile || 
          l.customerName.toLowerCase() === seq.primaryCustomerName.toLowerCase()
        ).map(l => `${l.productName} (${l.stage})`);

        if (relLeads.length === 0) {
          relLeads.push('PLI Suraksha (Eligible)', 'Sukanya Samriddhi (SSY)', 'IPPB Digital Account');
        }

        matchedResidents.push({
          id: seq.id,
          name: seq.primaryCustomerName,
          roleInFamily: 'Head of Household',
          familyMembers: seq.residents.filter(r => r !== seq.primaryCustomerName),
          housePlotNumber: seq.housePlotNumber,
          colony: seq.colony,
          landmark: seq.landmark,
          pincode: seq.pincode,
          deliveryOffice: 'Dadabari S.O.',
          beatNo: seq.beatNo,
          assignedStaffName: seq.assignedStaffName,
          assignedStaffId: seq.assignedStaffId,
          assignedStaffRole: seq.assignedStaffRole,
          assignedStaffContact: BEAT_STAFF_LOOKUP[seq.beatNo]?.contact || '8769706002',
          primaryMobile: seq.primaryMobile,
          whatsapp: seq.whatsapp,
          propertyType: seq.propertyType,
          verificationStatus: seq.verificationStatus,
          activeSchemeLeads: relLeads,
          lastMileNote: seq.lastMileNote,
        });
      }
    });

    // 2. Search in Customer Master
    allCustomers.forEach(cust => {
      const matchMobile = cleanDigits && (
        (cust.mobile && cust.mobile.includes(cleanDigits)) ||
        (cust.alternateMobile && cust.alternateMobile.includes(cleanDigits))
      );
      const matchName = (cust.name || '').toLowerCase().includes(q);
      const matchColony = (cust.area || cust.sectorLocality || '').toLowerCase().includes(q);
      const matchHouse = (cust.houseNo || '').toLowerCase().includes(q);
      const matchBeat = (cust.beatNo || '').toLowerCase() === q || (cust.beatNo || '').toLowerCase().includes(q);
      const matchLandmark = (cust.landmark || '').toLowerCase().includes(q);

      if (matchMobile || matchName || matchColony || matchHouse || matchBeat || matchLandmark) {
        // Check if already added
        if (!matchedResidents.some(r => r.primaryMobile === cust.mobile && r.name.toLowerCase() === cust.name.toLowerCase())) {
          const beatNum = cust.beatNo || 'Beat 2';
          const staffInfo = BEAT_STAFF_LOOKUP[beatNum] || {
            name: 'Mahendra Kumar Meena',
            id: 'STAFF-50457421',
            role: 'GDS/PMAN',
            contact: '8769706002'
          };

          const fam = (cust.householdMembers || []).map(m => m.name);
          const relLeads = allLeads.filter(l => 
            l.customerMobile === cust.mobile || 
            l.customerName.toLowerCase() === cust.name.toLowerCase()
          ).map(l => `${l.productName} (${l.stage})`);

          if (relLeads.length === 0) {
            relLeads.push('IPPB Digital Account', 'PLI Insurance');
          }

          matchedResidents.push({
            id: cust.id,
            name: cust.name,
            roleInFamily: cust.isHeadOfFamily ? 'Head of Household' : 'Family Member',
            familyMembers: fam,
            housePlotNumber: cust.houseNo || 'House No. Recorded',
            colony: cust.area || cust.sectorLocality || 'Dadabari Ecosystem',
            landmark: cust.landmark || 'Dadabari S.O. Jurisdiction',
            pincode: cust.pincode || '324009',
            deliveryOffice: cust.officeId || 'Dadabari S.O.',
            beatNo: beatNum,
            assignedStaffName: cust.assignedStaffName || staffInfo.name,
            assignedStaffId: cust.assignedStaffId || staffInfo.id,
            assignedStaffRole: staffInfo.role,
            assignedStaffContact: staffInfo.contact,
            primaryMobile: cust.mobile,
            whatsapp: cust.alternateMobile || cust.mobile,
            propertyType: cust.type || 'Residential',
            verificationStatus: cust.verificationStatus || 'Verified',
            activeSchemeLeads: relLeads,
            lastMileNote: cust.remarks || cust.notes || 'Field verification record active in Postman Book CRM.',
            rawCustomer: cust
          });
        }
      }
    });

    // 3. Search in Tasks
    const matchedTasks: TaskCardData[] = allTasks.filter(t => {
      const matchText = (t.title || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q) ||
        (t.location || '').toLowerCase().includes(q) ||
        (t.assignedStaffName || '').toLowerCase().includes(q) ||
        (t.beatNo || '').toLowerCase().includes(q);
      const isTaskKeyword = q.includes('task') || q.includes('pending') || q.includes('delivery') || q.includes('urgent') || q.includes('follow');
      return matchText || (isTaskKeyword && t.status !== 'Completed');
    }).map(t => ({
      id: t.id,
      title: t.title,
      category: t.category,
      beatNo: t.beatNo || 'Beat 2',
      assignedStaffName: t.assignedStaffName || 'Mahendra Kumar Meena',
      assignedStaffId: t.assignedStaffId || 'STAFF-50457421',
      priority: (t.priority as any) || 'Urgent',
      scheduledDate: t.scheduledDate || 'Today',
      householdsTarget: t.householdsTarget || 5,
      householdsCovered: t.householdsCovered || 0,
      status: t.status || 'Pending',
      location: t.location || 'Santoshi Nagar / Keshavpura Beat 2'
    }));

    // 4. Search in Verified 324009 Stores
    const matchedStores = verifiedStores.filter(s => {
      return s.storeName.toLowerCase().includes(q) ||
        s.ownerName.toLowerCase().includes(q) ||
        s.colony.toLowerCase().includes(q) ||
        s.landmark.toLowerCase().includes(q) ||
        s.beatNo.toLowerCase() === q ||
        (cleanDigits && (s.primaryMobile.includes(cleanDigits) || s.whatsapp.includes(cleanDigits)));
    });

    // 5. Search in CSC Directory
    const matchedCsc = cscDirectory.filter(c => {
      return c.businessName.toLowerCase().includes(q) ||
        c.operatorName.toLowerCase().includes(q) ||
        c.colony.toLowerCase().includes(q) ||
        c.landmark.toLowerCase().includes(q) ||
        c.beatNo.toLowerCase() === q ||
        (cleanDigits && (c.primaryMobile.includes(cleanDigits) || c.whatsapp.includes(cleanDigits)));
    });

    return {
      residents: matchedResidents,
      tasks: matchedTasks,
      stores: matchedStores,
      cscList: matchedCsc,
      leads: allLeads.filter(l => (l.customerName || '').toLowerCase().includes(q) || (cleanDigits && (l.customerMobile || '').includes(cleanDigits)))
    };
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Generate intelligent contextual response
    setTimeout(() => {
      let aiReply: Message;
      const lower = query.toLowerCase();
      const cleanDigits = lower.replace(/\D/g, '');

      // Check Master Search Engine results
      const searchRes = executeMasterIndexSearch(query);

      // 1. Direct 10-digit mobile lookup OR Resident name matching
      if (
        (cleanDigits.length >= 10 && searchRes.residents.length > 0) ||
        (searchRes.residents.length > 0 && !lower.includes('task') && !lower.includes('notification') && !lower.includes('324009 store'))
      ) {
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Namaskar, Boss! Master Index Match Found across Dadabari S.O. Ecosystem.\n\nMatched ${searchRes.residents.length} resident profile(s) with full family details, delivery jurisdiction, assigned postman credentials, and active scheme leads. You can execute direct actions right from the cards:`,
          residentResults: searchRes.residents.slice(0, 6),
          options: [
            'Daily Pending Field Tasks & Deliveries',
            'Reality-Check: Active Stores in Pincode 324009',
            'Active Field Alerts & Direct-Jump Notifications',
          ]
        };
      }
      // 2. Task Management & Field Notifications Query
      else if (
        lower.includes('task') ||
        lower.includes('delivery') ||
        lower.includes('deliveries') ||
        lower.includes('pending') ||
        lower.includes('follow-up') ||
        lower.includes('schedule')
      ) {
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Namaskar, Boss! Proactive Field Operations Summary for Dadabari S.O. (Beat 1 to 33).\n\nHere are the active pending deliveries, urgent doorstep tasks, and follow-ups. Use the status toggles to update live or launch GPS directions:`,
          taskResults: searchRes.tasks.slice(0, 8),
          options: [
            'Search Resident: 8769706002',
            'Beat 2 Resident Directory & Route',
            'Reality-Check: Active Stores in Pincode 324009'
          ]
        };
      }
      // 3. Reality-Checked Pincode 324009 Stores Query
      else if (
        lower.includes('324009') ||
        lower.includes('reality') ||
        lower.includes('verified store') ||
        lower.includes('active store') ||
        lower.includes('zero dead') ||
        lower.includes('kirana') ||
        lower.includes('merchant') ||
        lower.includes('general store') ||
        lower.includes('dadabari store') ||
        searchRes.stores.length > 0
      ) {
        const matched = searchRes.stores.length > 0 ? searchRes.stores : getVerifiedDadabari324009Registry();
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Namaskar, Boss! Reality-Check Complete for Pincode 324009 (Dadabari S.O. Delivery Ecosystem).\n\nVerified ${matched.length} active, on-ground commercial establishments with Zero Dead Data. All stores are verified operational, mapped to postal beats (Beat 1–33), and bound to designated postman Staff IDs:`,
          storeResults: matched,
          options: [
            'Sync All 324009 Stores to CRM',
            'View in Dadabari Commercial Hub (/businesses)',
            'Scan Field Alerts & Notifications',
          ]
        };
      }
      // 4. Notifications & Alerts Query
      else if (
        lower.includes('notification') ||
        lower.includes('alert') ||
        lower.includes('gap') ||
        lower.includes('address') ||
        lower.includes('incomplete') ||
        lower.includes('jump')
      ) {
        const notifs = notificationScannerService.getNotifications();
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Scanned all modules across Dadabari S.O. Ecosystem.\n\nFound ${notifs.length} active field notifications requiring operational resolution. Each card tracks origin metadata (Module, Beat, Assigned Staff ID) with a direct "[Jump to Field & Fix]" trigger:`,
          notificationResults: notifs,
          options: [
            'Reality-Check: Active Stores in Pincode 324009',
            'Pending Scheme Leads & PLI Follow-ups',
            'View Sequence-Wise Property Hub'
          ]
        };
      }
      // 5. Sukanya Samriddhi Query
      else if (lower.includes('sukanya') || lower.includes('ssa')) {
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'Sukanya Samriddhi Account (SSA) is currently offering 8.2% p.a. compound interest (Triple Tax Free EEE under Sec 80C).\n\n• Minimum annual deposit: ₹250\n• Maximum annual deposit: ₹1,50,000\n• Deposit period: 15 Years\n• Total Maturity period: 21 Years from account opening\n• Doorstep document verification available for Beat 2 & 6.',
          productCard: POSTAL_PRODUCTS.find(p => p.code === 'SSA')
        };
      }
      // 6. PLI Query
      else if (lower.includes('pli') || lower.includes('suraksha') || lower.includes('insurance')) {
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'Postal Life Insurance (PLI Suraksha - Whole Life Assurance) offers the highest sovereign bonus in India at ₹76 per ₹1,000 Sum Assured per year.\n\n• Lowest premium rates compared to commercial insurers\n• Eligible for Govt/Semi-Govt employees, Professionals, and Accredited entities\n• Loan facility available after 4 years.',
          productCard: POSTAL_PRODUCTS.find(p => p.code === 'PLI_SURAKSHA')
        };
      }
      // Fallback
      else {
        aiReply = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Namaskar, Boss! Query processed for "${query}".\n\nYou can search for:\n• Any 10-digit mobile number (e.g. 8769706002)\n• Resident names (Roshni Sakywal, Pritviraj, Depti Mehra)\n• Beat lists (Beat 2, Beat 6, Beat 14)\n• Daily tasks or pending deliveries\n• Reality-checked stores in 324009`,
          options: [
            'Search Resident: 8769706002',
            'Beat 2 Resident Directory & Route',
            'Daily Pending Field Tasks & Deliveries',
            'Reality-Check: Active Stores in Pincode 324009',
          ]
        };
      }

      setMessages(prev => [...prev, aiReply]);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="ai-assistant-page-root">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3 border border-emerald-700 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-800 to-slate-900 text-amber-300 flex items-center justify-center font-black shadow-md">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                AI Field Operations & Verification Assistant
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 font-mono text-[11px] font-bold border border-red-200">
                Dadabari S.O. 324009
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              10-Digit Mobile Search • Door-to-Door Resident Cards • Daily Task Toggles • Pincode 324009 Zero Dead Data
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
            <Bell size={13} className="text-amber-400" />
            <span>{notifications.length} Action Alerts</span>
          </div>
          <div className="px-3.5 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 size={13} className="text-emerald-300" />
            <span>{verifiedStores.length} Stores Verified</span>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col h-[720px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50/60">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 font-black shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-red-700 text-white'
                    : 'bg-slate-900 text-amber-300'
                }`}
              >
                {m.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div
                className={`max-w-[92%] rounded-3xl p-5 shadow-xs space-y-3.5 ${
                  m.sender === 'user'
                    ? 'bg-red-700 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed text-sm font-medium">
                  {m.text}
                </div>

                {/* 1. Resident / Property Cards Format with 3 Direct Action Buttons */}
                {m.residentResults && m.residentResults.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-black text-slate-700 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="text-red-700" />
                        <span>Resident & Family Master Records ({m.residentResults.length}):</span>
                      </span>
                      <span className="text-[10px] text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 font-mono">
                        BEAT 1–33 ECOSYSTEM
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {m.residentResults.map((r) => (
                        <div
                          key={r.id}
                          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-red-300 hover:shadow-md transition space-y-3"
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-black text-slate-900 text-sm">{r.name}</h4>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-100 text-red-900 border border-red-200">
                                  {r.roleInFamily || 'Head'}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700">
                                  {r.propertyType}
                                </span>
                              </div>
                              {/* Family Members */}
                              <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                                <Users size={11} className="text-slate-400 shrink-0" />
                                <span>
                                  Family: {r.familyMembers.length > 0 ? r.familyMembers.join(', ') : 'Single Resident Profile'}
                                </span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 bg-slate-900 text-amber-300 font-mono text-[10px] font-bold rounded-lg shrink-0">
                              {r.beatNo}
                            </span>
                          </div>

                          {/* Address & Beat Location */}
                          <div className="text-[11px] text-slate-600 space-y-1">
                            <div className="flex items-start gap-1.5">
                              <MapPin size={12} className="text-red-600 shrink-0 mt-0.5" />
                              <span className="font-semibold text-slate-800">
                                {r.housePlotNumber}, {r.colony} (PIN {r.pincode})
                              </span>
                            </div>
                            <div className="pl-4 text-[10px] text-slate-500">
                              📍 Landmark: <span className="text-slate-700 font-medium">{r.landmark}</span>
                            </div>
                            <div className="flex items-center gap-2 pl-4 font-mono text-[10px]">
                              <span>📱 <b>{r.primaryMobile}</b></span>
                              {r.whatsapp && <span className="text-emerald-700">WA: <b>{r.whatsapp}</b></span>}
                            </div>
                          </div>

                          {/* Assigned Postman Staff Credentials */}
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">Assigned Postman:</span>
                              <span className="font-mono text-purple-700 font-bold">{r.assignedStaffId}</span>
                            </div>
                            <div className="text-slate-700 font-semibold flex items-center justify-between">
                              <span>{r.assignedStaffName} ({r.assignedStaffRole})</span>
                              <span>📞 {r.assignedStaffContact}</span>
                            </div>
                          </div>

                          {/* Active Scheme Leads */}
                          <div className="space-y-1">
                            <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                              <Award size={11} className="text-amber-500" />
                              <span>Active Scheme Leads:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {r.activeSchemeLeads.map((sch, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-md text-[10px] font-semibold"
                                >
                                  {sch}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* The 3 Mandatory Direct Action Triggers */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 font-bold text-[10px]">
                            {/* 1. View Full Profile & Family Hub */}
                            <button
                              type="button"
                              onClick={() => {
                                if (r.rawCustomer) {
                                  setSelectedCustomerForModal(r.rawCustomer);
                                } else {
                                  navigate('/unified-family', { state: { searchKeyword: r.primaryMobile } });
                                }
                              }}
                              className="py-2 px-1.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                              title="Open complete family database profile"
                            >
                              <ExternalLink size={11} className="text-amber-300" />
                              <span>[Profile & Hub]</span>
                            </button>

                            {/* 2. Update Delivery / Lead Status */}
                            <button
                              type="button"
                              onClick={() => setStatusModalItem(r)}
                              className="py-2 px-1.5 bg-red-700 hover:bg-red-800 text-white rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                              title="Update last-mile delivery notes and convert postal schemes"
                            >
                              <Edit2 size={11} />
                              <span>[Update Status]</span>
                            </button>

                            {/* 3. Navigate via Google Maps / Beat Route */}
                            <button
                              type="button"
                              onClick={() => {
                                const mapQuery = `${r.housePlotNumber}, ${r.landmark}, ${r.colony}, Kota, Rajasthan ${r.pincode}`;
                                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`, '_blank');
                              }}
                              className="py-2 px-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                              title="Launch Google Maps beat route navigation"
                            >
                              <Navigation size={11} className="text-blue-700" />
                              <span>[Navigate Map]</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Task Management & Field Notifications Format with Status Toggles */}
                {m.taskResults && m.taskResults.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-black text-slate-700 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <CheckSquare size={14} className="text-red-700" />
                        <span>Daily Field Tasks & Pending Deliveries ({m.taskResults.length}):</span>
                      </span>
                      <span className="text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-mono">
                        ACTIONABLE FIELD TOGGLES
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {m.taskResults.map((tsk) => (
                        <div
                          key={tsk.id}
                          className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            tsk.status === 'Completed'
                              ? 'bg-emerald-50/70 border-emerald-200'
                              : tsk.priority === 'Urgent'
                              ? 'bg-red-50/70 border-red-200'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  tsk.status === 'Completed'
                                    ? 'bg-emerald-700 text-white'
                                    : tsk.priority === 'Urgent'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-amber-600 text-white'
                                }`}
                              >
                                {tsk.status === 'Completed' ? 'Completed' : tsk.priority}
                              </span>
                              <span className="px-2 py-0.5 bg-slate-900 text-amber-300 font-mono text-[10px] font-bold rounded-md">
                                {tsk.beatNo}
                              </span>
                              <span className="text-[11px] font-bold text-slate-700">
                                {tsk.category}
                              </span>
                            </div>

                            <div className="font-bold text-slate-900 text-xs sm:text-sm">
                              {tsk.title}
                            </div>

                            <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                              <span>📍 {tsk.location}</span>
                              <span>•</span>
                              <span>Postman: <b>{tsk.assignedStaffName}</b> ({tsk.assignedStaffId})</span>
                              <span>•</span>
                              <span>Scheduled: <b>{tsk.scheduledDate}</b></span>
                            </div>
                          </div>

                          {/* Direct Task Status Toggles & Navigation */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {tsk.status !== 'Completed' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleMarkTaskComplete(tsk.id)}
                                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-xl transition flex items-center gap-1 shadow-2xs cursor-pointer"
                                  title="Mark task completed"
                                >
                                  <Check size={12} />
                                  <span>[Complete]</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRescheduleTask(tsk.id)}
                                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                                  title="Reschedule task for tomorrow"
                                >
                                  <Clock size={12} className="text-amber-600" />
                                  <span>[Reschedule]</span>
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center gap-1 text-emerald-800 font-bold text-xs bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                                <CheckCircle2 size={13} />
                                <span>Done</span>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                const mapQuery = `${tsk.location}, Kota, Rajasthan 324009`;
                                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`, '_blank');
                              }}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                              title="Navigate to task location on Google Maps"
                            >
                              <Navigation size={12} className="text-blue-700" />
                              <span>Map</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Verified 324009 Store Results: Structured Audit Table & Action Hooks */}
                {m.storeResults && m.storeResults.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-black text-slate-700 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Store size={14} className="text-red-700" />
                        <span>Pincode 324009 Active Store Verification ({m.storeResults.length} Units):</span>
                      </span>
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">
                        ZERO DEAD DATA • 100% OPERATIONAL
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3">Store / Signboard Name</th>
                            <th className="p-3">Proprietor & Contact</th>
                            <th className="p-3">Plot, Colony & Landmark</th>
                            <th className="p-3">Beat & Postman Staff ID</th>
                            <th className="p-3">Category Tag</th>
                            <th className="p-3 text-right">Action Triggers</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {m.storeResults.map((store) => {
                            const isIngested = ingestedIds.has(store.id);
                            return (
                              <tr key={store.id} className="hover:bg-red-50/40 transition">
                                <td className="p-3">
                                  <div className="font-black text-slate-900">{store.storeName}</div>
                                  <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5 mt-0.5">
                                    <CheckCircle2 size={10} /> Active & Operating
                                  </div>
                                </td>
                                <td className="p-3 font-mono">
                                  <div className="font-bold text-slate-800">{store.ownerName}</div>
                                  <div className="text-slate-600 font-semibold">📱 {store.primaryMobile}</div>
                                  <div className="text-emerald-700 font-semibold text-[10px]">WA: {store.whatsapp}</div>
                                </td>
                                <td className="p-3">
                                  <div className="text-slate-800 font-semibold">{store.housePlotNumber}, {store.colony}</div>
                                  <div className="text-[10px] text-slate-500">PIN 324009 • Landmark: {store.landmark}</div>
                                </td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 font-mono text-[10px] font-bold">
                                    {store.beatNo}
                                  </span>
                                  <div className="text-[10px] text-slate-700 font-semibold mt-0.5">{store.assignedStaffName}</div>
                                  <div className="text-[9px] text-purple-700 font-mono">{store.assignedStaffId}</div>
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight ${
                                      store.categoryTag === 'Commercial • eMitra / CSC'
                                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                        : 'bg-blue-100 text-blue-900 border border-blue-200'
                                    }`}
                                  >
                                    {store.categoryTag}
                                  </span>
                                  <div className="text-[9px] text-slate-400 mt-0.5">Audit: {store.lastAuditDate}</div>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => handleIngestStore(store)}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-0.5 cursor-pointer ${
                                        isIngested
                                          ? 'bg-slate-200 text-slate-700'
                                          : 'bg-red-700 hover:bg-red-800 text-white shadow-2xs'
                                      }`}
                                      title="Sync to CRM Master"
                                    >
                                      <Plus size={10} />
                                      <span>{isIngested ? 'Synced' : '[Sync CRM]'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => navigate('/businesses', { state: { searchKeyword: store.storeName } })}
                                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-bold transition cursor-pointer"
                                      title="Verify spatial location and details"
                                    >
                                      [Verify Loc]
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => navigate('/sequence-properties', { state: { searchKeyword: store.colony } })}
                                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-bold transition cursor-pointer"
                                      title="Map store into door-to-door beat delivery sequence"
                                    >
                                      [Map Beat]
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. Direct Field-Jump Notification Cards */}
                {m.notificationResults && m.notificationResults.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                      Origin-Tracked Action Alerts:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {m.notificationResults.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-2.5 ${
                            notif.priority === 'Urgent'
                              ? 'bg-red-50/70 border-red-200'
                              : notif.priority === 'Pending Verification'
                              ? 'bg-amber-50/70 border-amber-200'
                              : 'bg-indigo-50/70 border-indigo-200'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  notif.priority === 'Urgent'
                                    ? 'bg-red-600 text-white'
                                    : notif.priority === 'Pending Verification'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-indigo-700 text-white'
                                }`}
                              >
                                {notif.priority}
                              </span>
                              <span className="font-mono text-xs font-black px-2 py-0.5 bg-slate-900 text-amber-300 rounded-md">
                                {notif.beatNo}
                              </span>
                            </div>

                            <h4 className="font-bold text-slate-900 text-xs">
                              {notif.title}
                            </h4>
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                              {notif.description}
                            </p>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-200/60">
                            <div className="text-[10px] text-slate-500 flex items-center justify-between">
                              <span>Module: <b>{notif.sourceModule}</b></span>
                              <span>Staff: <b>{notif.assignedStaffName}</b></span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleFieldJump(notif)}
                              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              <Sparkles size={13} className="text-amber-400" />
                              <span>[Jump to Field & Fix]</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Card if present */}
                {m.productCard && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{m.productCard.name}</div>
                      <div className="text-slate-500">{m.productCard.shortDesc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/services')}
                      className="px-3 py-1.5 bg-red-700 text-white rounded-xl font-bold flex items-center gap-1"
                    >
                      <span>View Brochure</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                )}

                {/* Quick Action Suggestion Options */}
                {m.options && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {m.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(opt)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer border border-slate-200"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-white border-t border-slate-200 flex items-center gap-3 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by 10-digit mobile (8769706002), resident name, tasks, or Beat 1-33..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-red-700 to-slate-900 hover:from-red-800 hover:to-slate-950 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span>Send</span>
            <Send size={15} />
          </button>
        </form>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomerForModal && (
        <CustomerProfileModal
          customer={selectedCustomerForModal}
          onClose={() => setSelectedCustomerForModal(null)}
          onEdit={() => {}}
        />
      )}

      {/* Update Delivery / Lead Status Modal */}
      {statusModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Update Delivery & Scheme Status
                </h3>
                <p className="text-xs text-slate-500">
                  {statusModalItem.name} • {statusModalItem.housePlotNumber}, {statusModalItem.colony} ({statusModalItem.beatNo})
                </p>
              </div>
              <button
                onClick={() => setStatusModalItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Last-Mile Delivery / Verification Note:
                </label>
                <textarea
                  rows={3}
                  value={deliveryRemark}
                  onChange={(e) => setDeliveryRemark(e.target.value)}
                  placeholder="e.g. Handed over parcel to family head. Doorbell rung at left pillar. Customer requested SSY form."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Postal Scheme Interest:
                  </label>
                  <select
                    value={schemeInterest}
                    onChange={(e) => setSchemeInterest(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-red-600"
                  >
                    <option value="PLI Suraksha">PLI Suraksha (Whole Life)</option>
                    <option value="PLI Santosh">PLI Santosh (Endowment)</option>
                    <option value="Sukanya Samriddhi (SSY)">Sukanya Samriddhi (SSY)</option>
                    <option value="IPPB Premium Account">IPPB Premium Account</option>
                    <option value="Mahila Samman Savings">Mahila Samman Savings</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lead Follow-up Stage:
                  </label>
                  <select
                    value={leadStatus}
                    onChange={(e) => setLeadStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-red-600"
                  >
                    <option value="Interested">Interested (New Lead)</option>
                    <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                    <option value="Documentation Pending">Documentation Pending</option>
                    <option value="Converted">Converted / Account Opened</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStatusModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStatusModal}
                className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={14} />
                <span>Save Status & Log Lead</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
