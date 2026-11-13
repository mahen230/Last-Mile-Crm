import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Search,
  UserPlus,
  Navigation,
  Phone,
  User,
  ArrowRight,
  Target,
  Users,
  LayoutDashboard,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Minimize2,
  Maximize2,
  Bell,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Check,
  Plus,
  Layers,
  MapPin,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { useAuth } from './auth/FirebaseAuthProvider';
import { staffPermissionService } from '../services/staffPermissionService';
import { Customer, Lead } from '../types/models';
import { processChat } from '../lib/aiChat';
import {
  notificationScannerService,
  FieldJumpNotification
} from '../services/notificationScannerService';
import {
  KOTA_COMMERCIAL_CSC_DIRECTORY,
  CommercialCscEntity,
  getStoredCscDirectory
} from '../data/kotaCommercialCscData';
import {
  DEFAULT_SEQUENTIAL_PROPERTIES,
  BEAT_STAFF_LOOKUP
} from './crm/SequenceWisePropertyHub';
import { Edit2, Award } from 'lucide-react';
import AddCustomerModal from './customers/AddCustomerModal';
import CustomerProfileModal from './customers/CustomerProfileModal';

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  customerResults?: Customer[];
  leadResults?: Lead[];
  notificationResults?: FieldJumpNotification[];
  cscResults?: CommercialCscEntity[];
}

export default function FloatingAIChatBot() {
  const { userProfile } = useAuth();
  const currentProfile = staffPermissionService.getActiveSession() || userProfile;
  const isRestrictedStaff = staffPermissionService.isPostmanOrGds(currentProfile);

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [notifications, setNotifications] = useState<FieldJumpNotification[]>([]);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [selectedCscDetail, setSelectedCscDetail] = useState<CommercialCscEntity | null>(null);
  const [ingestedIds, setIngestedIds] = useState<Set<string>>(new Set());

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      role: 'bot',
      text: 'Namaskar, Boss! I am your AI Operations & Field Intelligence Assistant (Dadabari S.O. 324009 Ecosystem).\n\nYou can ask me to scan CSC & eMitra kiosks across Kota, check incomplete addresses in Beat 2, track urgent scheme leads, or execute direct "[Jump to Field & Fix]" actions.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState<Customer | null>(null);

  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Initial scan and live subscription
    const updateNotifs = () => {
      const profile = staffPermissionService.getActiveSession() || userProfile;
      const restricted = staffPermissionService.isPostmanOrGds(profile);
      const all = notificationScannerService.getNotifications();
      const scopedNotifs = restricted
        ? all.filter((n) =>
            staffPermissionService.matchesUserBeatScope(profile, {
              beatNo: n.beatNo,
              area: n.colony,
              pincode: n.pincode,
              assignedStaffId: n.assignedStaffId,
              assignedStaffName: n.assignedStaffName
            })
          )
        : all;
      setNotifications([...scopedNotifs]);
      const cscs = getStoredCscDirectory();
      const set = new Set(cscs.filter(c => c.ingestedToCrm).map(c => c.id));
      setIngestedIds(set);
    };
    updateNotifs();
    const unsub = notificationScannerService.subscribe(updateNotifs);
    return () => unsub();
  }, [userProfile]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, showNotificationDrawer]);

  // Execute quick navigation
  const handleNavigate = (path: string, label: string) => {
    navigate(path);
    setMessages(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        role: 'bot',
        text: `Navigated to ${label}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Direct Field-Jump Engine: Executes instant routing + pre-filter
  const handleFieldJumpAndFix = (notif: FieldJumpNotification) => {
    notificationScannerService.markAsResolved(notif.id);
    navigate(notif.targetRoute, { state: { searchKeyword: notif.filterKeyword, autoFocusFix: true } });
    setMessages(prev => [
      ...prev,
      {
        id: `jump-${Date.now()}`,
        role: 'bot',
        text: `⚡ Field-Jump Executed! Routed to "${notif.sourceModule}" (${notif.targetRoute}). Filter set to "${notif.filterKeyword}" for ${notif.beatNo} (${notif.assignedStaffName}).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  // 1-Click Ingest CSC to CRM
  const handleIngestCscFromChat = (csc: CommercialCscEntity) => {
    const res = notificationScannerService.ingestCscToCrm(csc);
    if (res.success) {
      setIngestedIds(prev => new Set([...prev, csc.id]));
      setMessages(prev => [
        ...prev,
        {
          id: `ingest-bot-${Date.now()}`,
          role: 'bot',
          text: res.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionButton: {
            label: `View in Businesses & Kiosks Hub`,
            onClick: () => navigate('/businesses', { state: { searchKeyword: csc.businessName } })
          }
        }
      ]);
    }
  };

  // Dedicated search utility over Customers & Leads (Beat-scoped & capped at 5)
  const performSearch = (query: string): { customers: Customer[]; leads: Lead[] } => {
    const q = query.toLowerCase().trim();
    const cleanDigits = q.replace(/\D/g, '');
    const activeProfile = staffPermissionService.getActiveSession() || userProfile;

    const allCustomers = customerService.getScopedCustomers(activeProfile);
    const allLeads = customerService.getScopedLeads(activeProfile);

    const matchedCustomers = allCustomers.filter(c => {
      const matchName = (c.name || '').toLowerCase().includes(q);
      const matchMobile = cleanDigits && (c.mobile || '').includes(cleanDigits);
      const matchAlt = cleanDigits && (c.alternateMobile || '').includes(cleanDigits);
      const matchId = (c.masterId || c.id || '').toLowerCase().includes(q);
      const matchHouse = (c.houseNo || '').toLowerCase().includes(q);
      const matchBeat = (c.beatNo || '').toLowerCase() === q || (c.beatNo || '').toLowerCase().includes(q);
      const matchArea = (c.area || '').toLowerCase().includes(q);
      return matchName || matchMobile || matchAlt || matchId || matchHouse || matchBeat || matchArea;
    });

    // Also match in Door-to-door Sequential Properties within beat scope
    DEFAULT_SEQUENTIAL_PROPERTIES.forEach(seq => {
      if (
        !staffPermissionService.matchesUserBeatScope(activeProfile, {
          beatNo: seq.beatNo,
          area: seq.colony,
          pincode: seq.pincode,
          assignedStaffId: seq.assignedStaffId,
          assignedStaffName: seq.assignedStaffName
        })
      ) {
        return;
      }
      const matchMobile = cleanDigits && (
        seq.primaryMobile.includes(cleanDigits) ||
        (seq.whatsapp && seq.whatsapp.includes(cleanDigits))
      );
      const matchName = seq.primaryCustomerName.toLowerCase().includes(q) ||
        seq.residents.some(r => r.toLowerCase().includes(q));
      const matchColony = seq.colony.toLowerCase().includes(q);
      const matchPlot = seq.housePlotNumber.toLowerCase().includes(q);
      const matchBeat = seq.beatNo.toLowerCase() === q || seq.beatNo.toLowerCase().includes(q);

      if (matchMobile || matchName || matchColony || matchPlot || matchBeat) {
        if (!matchedCustomers.some(c => c.mobile === seq.primaryMobile && c.name.toLowerCase() === seq.primaryCustomerName.toLowerCase())) {
          matchedCustomers.push({
            id: seq.id,
            masterId: seq.id.toUpperCase(),
            name: seq.primaryCustomerName,
            mobile: seq.primaryMobile,
            alternateMobile: seq.whatsapp,
            houseNo: seq.housePlotNumber,
            area: seq.colony,
            landmark: seq.landmark,
            beatNo: seq.beatNo,
            pincode: seq.pincode,
            type: seq.propertyType,
            verificationStatus: seq.verificationStatus,
            householdMembers: seq.residents.filter(r => r !== seq.primaryCustomerName).map(name => ({ name })),
            assignedStaffName: seq.assignedStaffName,
            assignedStaffId: seq.assignedStaffId,
            remarks: seq.lastMileNote,
            createdAt: new Date().toISOString()
          } as Customer);
        }
      }
    });

    const matchedLeads = allLeads.filter(l => {
      const matchName = (l.customerName || '').toLowerCase().includes(q);
      const matchMobile = cleanDigits && (l.customerMobile || '').includes(cleanDigits);
      const matchProd = (l.productName || '').toLowerCase().includes(q);
      return matchName || matchMobile || matchProd;
    }).slice(0, 5);

    return { customers: matchedCustomers.slice(0, 5), leads: matchedLeads };
  };

  // Match Kota CSC / eMitra records (Beat-scoped & capped at 5)
  const searchCscDirectory = (query: string): CommercialCscEntity[] => {
    const q = query.toLowerCase().trim();
    const cleanDigits = q.replace(/\D/g, '');
    const activeProfile = staffPermissionService.getActiveSession() || userProfile;
    const cscList = getStoredCscDirectory().filter(c =>
      staffPermissionService.matchesUserBeatScope(activeProfile, {
        beatNo: c.beatNo,
        area: c.colony,
        pincode: c.pincode,
        assignedStaffId: c.assignedStaffId,
        assignedStaffName: c.assignedStaffName
      })
    );

    return cscList
      .filter(c => {
        const matchName = c.businessName.toLowerCase().includes(q);
        const matchOp = c.operatorName.toLowerCase().includes(q);
        const matchCol = c.colony.toLowerCase().includes(q);
        const matchBeat = c.beatNo.toLowerCase().includes(q);
        const matchLand = c.landmark.toLowerCase().includes(q);
        const matchMobile = cleanDigits && (c.primaryMobile.includes(cleanDigits) || c.whatsapp.includes(cleanDigits));
        return matchName || matchOp || matchCol || matchBeat || matchLand || matchMobile;
      })
      .slice(0, 5);
  };

  const handleSend = async (customQuery?: string) => {
    const textToSend = (customQuery || input).trim();
    if (!textToSend) return;

    const userMsgId = `user-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        text: textToSend,
        timestamp: timeStr
      }
    ]);

    if (!customQuery) setInput('');
    setLoading(true);

    const lower = textToSend.toLowerCase();

    // 1. Direct Notification & Alert Scanner Query
    if (
      lower.includes('notification') ||
      lower.includes('alert') ||
      lower.includes('pending task') ||
      lower.includes('incomplete address') ||
      lower.includes('pending field') ||
      lower.includes('fix') ||
      lower.includes('scan')
    ) {
      const activeProfile = staffPermissionService.getActiveSession() || userProfile;
      const allNotifs = notificationScannerService.getNotifications();
      const activeNotifs = isRestrictedStaff
        ? allNotifs.filter((n) =>
            staffPermissionService.matchesUserBeatScope(activeProfile, {
              beatNo: n.beatNo,
              area: n.colony,
              pincode: n.pincode,
              assignedStaffId: n.assignedStaffId,
              assignedStaffName: n.assignedStaffName
            })
          )
        : allNotifs;
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `bot-notifs-${Date.now()}`,
            role: 'bot',
            text: `Namaskar, Boss! Scanned ${isRestrictedStaff ? activeProfile?.beat || 'your assigned beat' : 'all modules across Dadabari S.O. Ecosystem'}.\n\nFound ${activeNotifs.length} active field notifications requiring attention${activeNotifs.length > 5 ? ' (showing top 5)' : ''}. You can click "[Jump to Field & Fix]" on any card to directly open the record and resolve it:`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            notificationResults: activeNotifs.slice(0, 5)
          }
        ]);
        setLoading(false);
      }, 300);
      return;
    }

    // 2. Direct CSC & eMitra Kiosk Ingestion Search
    if (
      lower.includes('csc') ||
      lower.includes('emitra') ||
      lower.includes('kiosk') ||
      lower.includes('commercial') ||
      lower.includes('business') ||
      lower.includes('shop') ||
      lower.includes('talwandi') ||
      lower.includes('keshavpura') ||
      lower.includes('dadabari') ||
      lower.includes('mahaveer') ||
      lower.includes('vigyan') ||
      lower.includes('nayapura')
    ) {
      const cscMatches = searchCscDirectory(textToSend);
      if (cscMatches.length > 0) {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: `bot-csc-${Date.now()}`,
              role: 'bot',
              text: `Found ${cscMatches.length} authorized CSC Centres & eMitra Kiosks in Kota matching "${textToSend}". Tabular records ready for direct 1-click CRM ingestion:`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              cscResults: cscMatches
            }
          ]);
          setLoading(false);
        }, 350);
        return;
      }
    }

    // 3. Explicit "add customer" trigger
    if (
      lower.includes('add customer') ||
      lower.includes('new customer') ||
      lower.includes('create customer') ||
      lower.includes('ग्राहक जोड़ें')
    ) {
      setTimeout(() => {
        setShowAddCustomerModal(true);
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: 'bot',
            text: 'Triggered Add Customer form! You can capture name, phone, occupation, and structured address.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionButton: {
              label: 'Open Add Customer Modal',
              onClick: () => setShowAddCustomerModal(true)
            }
          }
        ]);
        setLoading(false);
      }, 300);
      return;
    }

    // 4. Quick Navigation Triggers
    if (lower.includes('goto leads') || lower.includes('open leads') || lower.includes('show leads') || lower === 'leads') {
      navigate('/leads');
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'bot',
          text: 'Navigated to Sales & Scheme Inquiries Pipeline (/leads).',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setLoading(false);
      return;
    }

    if (lower.includes('goto staff') || lower.includes('open staff') || lower.includes('staff directory') || lower === 'staff') {
      navigate('/staff-master');
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'bot',
          text: 'Navigated to Postal Staff Directory & Office Master (/staff-master).',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setLoading(false);
      return;
    }

    if (lower.includes('goto dashboard') || lower.includes('open dashboard') || lower === 'dashboard') {
      navigate('/dashboard');
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'bot',
          text: 'Navigated to Operations Dashboard (/dashboard).',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setLoading(false);
      return;
    }

    if (lower.includes('businesses') || lower.includes('goto business')) {
      navigate('/businesses');
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'bot',
          text: 'Navigated to Commercial Business & CSC/eMitra Registry (/businesses).',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setLoading(false);
      return;
    }

    // 5. Standard Customer / Lead Search
    let extractedQuery = textToSend.replace(/^(search|find|lookup|show me|who is|dhoondo)\s+/i, '').trim();
    const searchResults = performSearch(extractedQuery || textToSend);

    if (searchResults.customers.length > 0 || searchResults.leads.length > 0) {
      const summaryText = `Found ${searchResults.customers.length} customer(s) and ${searchResults.leads.length} lead(s) matching "${extractedQuery}":`;
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'bot',
          text: summaryText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          customerResults: searchResults.customers,
          leadResults: searchResults.leads
        }
      ]);
      setLoading(false);
      return;
    }

    // 6. Fallback AI Processing with Scoped Kota Ecosystem Context
    const activeProfileForCtx = staffPermissionService.getActiveSession() || userProfile;
    const context = `
Ecosystem: Dadabari S.O. (324009), ${isRestrictedStaff ? `Assigned Scope: ${activeProfileForCtx?.beat || 'Assigned Beat'}` : 'Beats 1 to 33, Rajasthan Circle'}.
Total Scoped Customers: ${customerService.getScopedCustomers(activeProfileForCtx).length}.
Active Scoped Leads: ${customerService.getScopedLeads(activeProfileForCtx).length}.
Authorized CSC & eMitra Kiosks: ${KOTA_COMMERCIAL_CSC_DIRECTORY.length}.
Active Notifications: ${notifications.length}.
Available modules: Dashboard (/dashboard), Businesses & CSC (/businesses), Sequence Property Hub (/sequence-properties), Customer List (/customers), Leads (/leads), Tasks (/tasks).
`;

    try {
      const aiResponse = await processChat(textToSend, context);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'bot',
          text: aiResponse.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'bot',
          text: `Namaskar, Boss! No direct record matched "${textToSend}". You can search for "CSC centres in Kota", "Dadabari eMitra", "Incomplete address in Beat 2", or click "+ Add Customer".`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionButton: {
            label: '+ Add Customer',
            onClick: () => setShowAddCustomerModal(true)
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const urgentCount = notifications.filter(n => n.priority === 'Urgent' && !n.isResolved).length;

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`mb-3 w-[calc(100vw-2rem)] sm:w-[440px] ${
                isMinimized ? 'h-14' : 'h-[580px]'
              } bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300`}
            >
              {/* Header */}
              <div className="p-3.5 bg-gradient-to-r from-red-900 via-red-800 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="font-black text-xs tracking-tight flex items-center gap-1.5">
                      <span>AI Field Intelligence Assistant</span>
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] rounded-full font-mono">
                        Dadabari S.O.
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-300">Kota Delivery Ecosystem • Pincode 324009</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
                    title={isMinimized ? 'Expand' : 'Minimize'}
                  >
                    {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
                    title="Close"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Real-time Field Notification Alert Bar */}
                  <div className="p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 flex items-center justify-between text-xs shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[10px] animate-pulse">
                        <Bell size={11} />
                      </div>
                      <span className="font-bold text-amber-950 text-[11px]">
                        {notifications.length} Field Action Alerts ({urgentCount} Urgent)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSend('scan notifications')}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] rounded-lg transition shadow-2xs cursor-pointer"
                    >
                      Scan & Fix All
                    </button>
                  </div>

                  {/* Quick Action Pills */}
                  <div className="p-2 bg-slate-100/90 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold shrink-0">
                    <button
                      onClick={() => handleSend('CSC centres in Kota')}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg flex items-center gap-1 shrink-0 shadow-2xs transition"
                    >
                      <Building2 size={12} />
                      <span>Kota CSC / eMitra</span>
                    </button>
                    <button
                      onClick={() => handleSend('Incomplete address in Beat 2')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg flex items-center gap-1 shrink-0 transition"
                    >
                      <MapPin size={12} className="text-red-700" />
                      <span>Beat 2 Fix</span>
                    </button>
                    <button
                      onClick={() => handleNavigate('/businesses', 'Commercial Hub')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg flex items-center gap-1 shrink-0 transition"
                    >
                      <Layers size={12} className="text-indigo-700" />
                      <span>Kiosks Hub</span>
                    </button>
                    <button
                      onClick={() => setShowAddCustomerModal(true)}
                      className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded-lg flex items-center gap-1 shrink-0 shadow-xs transition"
                    >
                      <UserPlus size={12} />
                      <span>+ Customer</span>
                    </button>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-50/70 text-xs">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[92%] p-3.5 rounded-2xl shadow-xs space-y-2 ${
                            m.role === 'user'
                              ? 'bg-red-700 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                          }`}
                        >
                          <div className="whitespace-pre-wrap leading-relaxed text-[12px]">{m.text}</div>

                          {/* 1. Notification Results: Direct Field-Jump Engine */}
                          {m.notificationResults && m.notificationResults.length > 0 && (
                            <div className="space-y-2.5 pt-2 border-t border-slate-100">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                                Field Action Direct-Jump Cards:
                              </span>
                              {m.notificationResults.map((notif) => (
                                <div
                                  key={notif.id}
                                  className={`p-3 rounded-2xl border transition space-y-2 ${
                                    notif.priority === 'Urgent'
                                      ? 'bg-red-50/80 border-red-200'
                                      : notif.priority === 'Pending Verification'
                                      ? 'bg-amber-50/80 border-amber-200'
                                      : 'bg-indigo-50/80 border-indigo-200'
                                  }`}
                                >
                                  {/* Notification Header with Origin Tracking */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight ${
                                            notif.priority === 'Urgent'
                                              ? 'bg-red-600 text-white'
                                              : notif.priority === 'Pending Verification'
                                              ? 'bg-amber-600 text-white'
                                              : 'bg-indigo-700 text-white'
                                          }`}
                                        >
                                          {notif.priority}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-600">
                                          {notif.sourceModule}
                                        </span>
                                      </div>
                                      <div className="font-black text-slate-900 text-xs mt-1">
                                        {notif.title}
                                      </div>
                                    </div>
                                    <span className="font-mono text-[10px] font-black px-2 py-0.5 bg-slate-900 text-amber-300 rounded-lg shrink-0">
                                      {notif.beatNo}
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-slate-600 leading-normal">
                                    {notif.description}
                                  </p>

                                  {/* Origin Context Meta */}
                                  <div className="p-2 bg-white/80 rounded-xl border border-slate-200/60 text-[10px] text-slate-600 flex items-center justify-between">
                                    <span>
                                      Area: <b>{notif.colony}</b> (PIN {notif.pincode})
                                    </span>
                                    <span>
                                      Staff: <b>{notif.assignedStaffName}</b> ({notif.assignedStaffId})
                                    </span>
                                  </div>

                                  {/* Direct Field-Jump Trigger */}
                                  <button
                                    type="button"
                                    onClick={() => handleFieldJumpAndFix(notif)}
                                    className="w-full py-2 px-3 bg-gradient-to-r from-slate-900 to-red-900 hover:from-slate-950 hover:to-red-950 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                                  >
                                    <Sparkles size={12} className="text-amber-400" />
                                    <span>[Jump to Field & Fix]</span>
                                    <ArrowRight size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 2. CSC & eMitra Tabular Results with 3 Action Hooks */}
                          {m.cscResults && m.cscResults.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                                Ingestion Queue ({m.cscResults.length} Commercial Units):
                              </span>
                              {m.cscResults.map((csc) => {
                                const isIngested = ingestedIds.has(csc.id);
                                return (
                                  <div
                                    key={csc.id}
                                    className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-2 transition hover:bg-amber-50"
                                  >
                                    <div className="flex items-start justify-between gap-1">
                                      <div>
                                        <div className="font-bold text-slate-900 text-xs">
                                          {csc.businessName}
                                        </div>
                                        <div className="text-[11px] text-slate-600 flex items-center gap-1">
                                          <User size={11} className="text-slate-400" />
                                          <span className="font-semibold">{csc.operatorName}</span>
                                          <span className="text-[10px] text-slate-400">({csc.role})</span>
                                        </div>
                                      </div>
                                      <span className="px-2 py-0.5 bg-slate-900 text-amber-300 font-mono text-[10px] font-bold rounded-lg shrink-0">
                                        {csc.beatNo}
                                      </span>
                                    </div>

                                    <div className="text-[11px] text-slate-600 space-y-0.5">
                                      <div className="flex items-start gap-1">
                                        <MapPin size={11} className="text-red-600 shrink-0 mt-0.5" />
                                        <span>
                                          {csc.housePlotNumber}, {csc.colony} (PIN {csc.pincode})
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 pl-3.5 font-mono text-[10px]">
                                        <span>📱 {csc.primaryMobile}</span>
                                        <span className="text-emerald-700">WA: {csc.whatsapp}</span>
                                      </div>
                                      <div className="pl-3.5 text-[10px] text-slate-500">
                                        Postman: <b>{csc.assignedStaffName}</b> ({csc.assignedStaffId})
                                      </div>
                                    </div>

                                    {/* 3 Quick Action Hooks */}
                                    <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-amber-200/60 text-center font-bold text-[10px]">
                                      <button
                                        type="button"
                                        onClick={() => handleIngestCscFromChat(csc)}
                                        className={`py-1.5 px-1 rounded-lg transition flex items-center justify-center gap-0.5 cursor-pointer ${
                                          isIngested
                                            ? 'bg-slate-200 text-slate-700'
                                            : 'bg-red-700 hover:bg-red-800 text-white shadow-2xs'
                                        }`}
                                      >
                                        <Plus size={10} />
                                        <span>{isIngested ? 'Synced' : '[Add to CRM]'}</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigate('/businesses', { state: { searchKeyword: csc.businessName } });
                                        }}
                                        className="py-1.5 px-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition flex items-center justify-center gap-0.5 cursor-pointer"
                                      >
                                        <Navigation size={10} className="text-blue-600" />
                                        <span>[Verify Loc]</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigate('/sequence-properties', { state: { searchKeyword: csc.colony } });
                                        }}
                                        className="py-1.5 px-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition flex items-center justify-center gap-0.5 cursor-pointer"
                                      >
                                        <Layers size={10} className="text-indigo-600" />
                                        <span>[Map Beat]</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* 3. Customer Search Results - Full Resident / Property Card Format */}
                          {m.customerResults && m.customerResults.length > 0 && (
                            <div className="space-y-2 pt-1 border-t border-slate-100">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                                Resident & Family Records ({m.customerResults.length}):
                              </span>
                              {m.customerResults.map((c) => {
                                const fam = (c.householdMembers || []).map(m => m.name);
                                const staff = BEAT_STAFF_LOOKUP[c.beatNo || 'Beat 2'] || {
                                  name: c.assignedStaffName || 'Mahendra Kumar Meena',
                                  id: c.assignedStaffId || 'STAFF-50457421',
                                  role: 'GDS/PMAN',
                                  contact: '8769706002'
                                };
                                return (
                                  <div
                                    key={c.id}
                                    className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs space-y-2 transition"
                                  >
                                    <div className="flex items-start justify-between gap-1">
                                      <div>
                                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 flex-wrap">
                                          <User size={12} className="text-red-700" />
                                          <span>{c.name}</span>
                                          <span className="px-1.5 py-0.2 bg-red-100 text-red-900 rounded text-[9px] font-bold">
                                            {c.isHeadOfFamily ? 'Head' : 'Resident'}
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                          <Users size={10} className="text-slate-400" />
                                          <span>Family: {fam.length > 0 ? fam.join(', ') : 'Single Profile'}</span>
                                        </div>
                                      </div>
                                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 text-amber-300 font-bold rounded-lg shrink-0">
                                        {c.beatNo || 'Beat 2'}
                                      </span>
                                    </div>

                                    <div className="text-[10px] text-slate-600 space-y-0.5">
                                      <div className="flex items-start gap-1">
                                        <MapPin size={10} className="text-red-600 shrink-0 mt-0.5" />
                                        <span className="font-medium text-slate-800">
                                          {c.houseNo || 'House No. Recorded'}, {c.area || c.address?.fullAddress} (PIN {c.pincode || '324009'})
                                        </span>
                                      </div>
                                      <div className="pl-3.5 text-slate-500">
                                        📍 Landmark: <span className="text-slate-700">{c.landmark || 'Dadabari Ecosystem'}</span>
                                      </div>
                                      <div className="flex items-center gap-2 pl-3.5 font-mono">
                                        <span>📱 <b>{c.mobile}</b></span>
                                        {c.alternateMobile && <span className="text-emerald-700">WA: {c.alternateMobile}</span>}
                                      </div>
                                      <div className="pl-3.5 text-[9px] text-slate-500">
                                        Postman: <b>{staff.name}</b> ({staff.id}) • 📞 {staff.contact}
                                      </div>
                                    </div>

                                    {/* 3 Direct Action Triggers */}
                                    <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-100 text-center font-bold text-[9px]">
                                      {/* 1. View Full Profile & Family Hub */}
                                      <button
                                        type="button"
                                        onClick={() => setSelectedCustomerForModal(c)}
                                        className="py-1 px-1 bg-slate-900 hover:bg-slate-950 text-white rounded-lg transition flex items-center justify-center gap-0.5 cursor-pointer shadow-2xs"
                                        title="View Full Profile & Family Hub"
                                      >
                                        <ExternalLink size={9} className="text-amber-300" />
                                        <span>[Profile & Hub]</span>
                                      </button>

                                      {/* 2. Update Delivery / Lead Status */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigate('/leads', { state: { searchKeyword: c.name } });
                                          if (window.innerWidth < 640) setIsOpen(false);
                                        }}
                                        className="py-1 px-1 bg-red-700 hover:bg-red-800 text-white rounded-lg transition flex items-center justify-center gap-0.5 cursor-pointer shadow-2xs"
                                        title="Update Delivery / Lead Status"
                                      >
                                        <Edit2 size={9} />
                                        <span>[Update Status]</span>
                                      </button>

                                      {/* 3. Navigate via Google Maps / Beat Route */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const mapQuery = `${c.houseNo || ''}, ${c.landmark || ''}, ${c.area || 'Dadabari'}, Kota Rajasthan ${c.pincode || '324009'}`;
                                          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`, '_blank');
                                        }}
                                        className="py-1 px-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg transition flex items-center justify-center gap-0.5 cursor-pointer"
                                        title="Navigate via Google Maps / Beat Route"
                                      >
                                        <Navigation size={9} className="text-blue-700" />
                                        <span>[Navigate Map]</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Interactive Action Button */}
                          {m.actionButton && (
                            <div className="pt-1.5">
                              <button
                                onClick={m.actionButton.onClick}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                              >
                                <Sparkles size={12} className="text-amber-400" />
                                <span>{m.actionButton.label}</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
                      </div>
                    ))}

                    {loading && (
                      <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-2xl w-fit shadow-xs">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                        <span className="text-[11px] font-semibold text-slate-600">
                          Scanning Kota CSC directory & field records...
                        </span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input Footer */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="p-3 bg-white border-t border-slate-200 shrink-0 flex items-center gap-2"
                  >
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Search eMitra, CSC in Kota, scan notifications, beat 2..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:bg-white transition"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!input.trim() || loading}
                      className="p-2 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white rounded-xl transition shadow-xs cursor-pointer"
                      title="Send Query"
                    >
                      <Send size={15} />
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button with Active Notification Badge */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (isMinimized) setIsMinimized(false);
          }}
          className="group relative px-4 py-3 bg-gradient-to-r from-red-800 via-red-700 to-slate-900 hover:from-red-900 hover:to-slate-950 text-white rounded-full shadow-2xl flex items-center gap-2.5 transition transform hover:scale-105 cursor-pointer border border-white/20"
          id="ai-operations-assistant-fab"
          aria-label="Toggle AI Operations Assistant"
        >
          <div className="relative">
            <Sparkles size={18} className="text-amber-300" />
            {urgentCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <span className="text-xs font-black tracking-tight">AI Field Agent</span>
          {notifications.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow-2xs">
              {notifications.length}
            </span>
          )}
        </button>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <AddCustomerModal
          isOpen={showAddCustomerModal}
          onClose={() => setShowAddCustomerModal(false)}
        />
      )}

      {/* Customer Profile Modal */}
      {selectedCustomerForModal && (
        <CustomerProfileModal
          customer={selectedCustomerForModal}
          onClose={() => setSelectedCustomerForModal(null)}
        />
      )}
    </>
  );
}
